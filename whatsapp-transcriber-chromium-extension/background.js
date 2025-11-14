console.log("[WAT-BG] Background active");

// Listen for port messages (used for binary audio upload)
chrome.runtime.onConnect.addListener(port => {
    if (port.name !== "audio-upload") return;

    port.onMessage.addListener((msg) => {
        if (msg.action === "transcribeArrayBuffer") {
            handleArrayBuffer(msg, port.sender);
        }
    });
});

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

async function handleArrayBuffer({ bubbleId, base64 }, sender) {
    const tabId = sender.tab.id;
    const buffer = base64ToArrayBuffer(base64);

    console.log("[WAT-BG] Decoded buffer", buffer instanceof ArrayBuffer, buffer.byteLength);

    const { apiKey } = await chrome.storage.sync.get(["apiKey"]);
    if (!apiKey) {
        sendToContent({ tabId, bubbleId }, "❗ Missing API key");
        return;
    }

    try {
        // UPLOAD AUDIO
        const up = await fetch("https://api.assemblyai.com/v2/upload", {
            method: "POST",
            headers: {
                authorization: apiKey,
                "content-type": "application/octet-stream"
            },
            body: buffer
        });

        const { upload_url } = await up.json();
        if (!upload_url) {
            sendToContent({ tabId, bubbleId }, "❗ Upload failed.");
            return;
        }

        // CREATE TRANSCRIPT
        const create = await fetch("https://api.assemblyai.com/v2/transcript", {
            method: "POST",
            headers: {
                authorization: apiKey,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                audio_url: upload_url,
                language_detection: true
            })
        });
        const { id } = await create.json();

        poll(id, apiKey, { tabId, bubbleId });

    } catch (err) {
        sendToContent({ tabId, bubbleId }, "❗ " + err.message);
    }
}

async function poll(id, apiKey, req) {
    while (true) {
        const r = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
            headers: { authorization: apiKey }
        });

        const j = await r.json();

        if (j.status === "completed") {
            sendToContent(req, j.text || "(empty)");
            return;
        }
        if (j.status === "error") {
            sendToContent(req, "❗ " + j.error);
            return;
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

function sendToContent(req, text) {
    chrome.tabs.sendMessage(req.tabId, {
        action: "insertTranscript",
        bubbleId: req.bubbleId,
        text
    });
}
