console.log("[WAT] Content script loaded.");

injectScript();

// Inject page-level script (inject.js)
function injectScript() {
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL("inject.js");
    document.documentElement.appendChild(s);
    s.onload = () => s.remove();
}

let currentBubbleId = null;
let currentBox = null;

/* ----------------------------------------------------------
   Inject CSS for internal-bubble wrapper
----------------------------------------------------------- */
(function injectStyles() {
    const css = `
        .wat-container {
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px solid rgba(0,0,0,0.1);
        }
        .wat-btn {
            background-color: #25D366;
            color: white;
            border: none;
            padding: 6px 10px;
            font-size: 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            margin-bottom: 6px;
            display: inline-block;
        }
        .wat-btn:hover {
            background-color: #1DA851;
        }
        .wat-result {
            white-space: pre-wrap;
            opacity: 0.95;
            font-size: 13px;
        }
        /* FIX: Timer overlapping our wrapper */
        .x1fesggd {
            position: relative;
            bottom: 0px;
        }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
})();

/* ----------------------------------------------------------
   Handle base64 audio coming from inject.js
----------------------------------------------------------- */
window.addEventListener("message", (ev) => {
    if (ev.source !== window) return;

    if (ev.data?.type === "WAT_CAPTURED_ARRAYBUFFER") {
        if (!currentBubbleId || !currentBox) return;

        const base64 = ev.data.base64;
        currentBox.textContent = "⏳ Uploading…";

        const port = chrome.runtime.connect({ name: "audio-upload" });
        port.postMessage({
            action: "transcribeArrayBuffer",
            bubbleId: currentBubbleId,
            base64
        });

        currentBubbleId = null;
        return;
    }
});

/* ----------------------------------------------------------
   Detect WhatsApp voice-message bubbles
----------------------------------------------------------- */
const obs = new MutationObserver(scan);
obs.observe(document.body, { childList: true, subtree: true });

scan();

function scan() {
    const btns = document.querySelectorAll('button[aria-label*="voice"]');

    btns.forEach(btn => {
        const bubble = btn.closest('div[role="row"]');
        if (!bubble || bubble.dataset.watAttached) return;

        bubble.dataset.watAttached = "1";
        attachUI(bubble);
    });
}

/* ----------------------------------------------------------
   Insert wrapper at BOTTOM of the bubble, inside the bubble
----------------------------------------------------------- */
function attachUI(bubble) {
    chrome.storage.sync.get(["apiKey"], ({ apiKey }) => {

        // WhatsApp's content container – waveform, duration, etc.
        const container =
            bubble.querySelector(".x1n2onr6.x98rzlu") ||
            bubble.querySelector(".x1n2onr6") ||
            bubble;

        // Our dedicated wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "wat-container";

        // Button
        const btn = document.createElement("button");
        btn.className = "wat-btn";
        btn.textContent = "Transcribe";

        // Transcript output
        const result = document.createElement("div");
        result.className = "wat-result";

        if (!apiKey) {
            result.textContent = "❗ Add API key in options";
            btn.disabled = true;
        }

        btn.onclick = () => {
            const id = crypto.randomUUID();
            bubble.dataset.bubbleId = id;

            result.textContent = "⏳ Getting audio…";
            currentBubbleId = id;
            currentBox = result;

            window.postMessage({ type: "WAT_ARM_DOWNLOAD_INTERCEPT" }, "*");
            openMenu(bubble);
        };

        wrapper.appendChild(btn);
        wrapper.appendChild(result);

        // Insert our UI as the LAST element in the bubble
        container.appendChild(wrapper);
    });
}

/* ----------------------------------------------------------
   WhatsApp context menu automation
----------------------------------------------------------- */
function openMenu(bubble) {
    bubble.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    bubble.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

    setTimeout(() => tryChevron(bubble, 1), 120);
}

function tryChevron(bubble, n) {
    const chev = bubble.querySelector('div[data-js-context-icon="true"][role="button"]');
    if (chev) {
        chev.click();
        return setTimeout(() => clickDownload(), 150);
    }
    if (n < 6) return setTimeout(() => tryChevron(bubble, n + 1), 120);
}

function clickDownload() {
    const items = [...document.querySelectorAll("li")];
    const download = items.find(li =>
        li.innerText.trim().toLowerCase() === "download" ||
        [...li.querySelectorAll("*")].some(e => e.innerText?.trim().toLowerCase() === "download")
    );

    if (!download) {
        if (currentBox) currentBox.textContent = "❗ No download button";
        return;
    }

    if (currentBox) currentBox.textContent = "⏳ Requesting audio…";
    download.click();
}

/* ----------------------------------------------------------
   Insert transcript into the wrapper inside the bubble
----------------------------------------------------------- */
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action !== "insertTranscript") return;

    const bubble = document.querySelector(`[data-bubble-id="${msg.bubbleId}"]`);
    if (!bubble) return;

    const container =
        bubble.querySelector(".x1n2onr6.x98rzlu") ||
        bubble.querySelector(".x1n2onr6") ||
        bubble;

    const wrapper = container.querySelector(".wat-container");
    if (!wrapper) return;

    const result = wrapper.querySelector(".wat-result");
    if (result) result.textContent = msg.text;
});
