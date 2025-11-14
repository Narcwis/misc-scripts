// inject.js — runs inside page context

if (!window.WAT_INTERCEPT_INSTALLED) {
    window.WAT_INTERCEPT_INSTALLED = true;

    console.log("[WAT-INJECT] Installing interceptors…");

    let armed = false;
    let blobCaptured = false;
    let anchorClicked = false;

    window.addEventListener("message", (ev) => {
        if (ev.data?.type === "WAT_ARM_DOWNLOAD_INTERCEPT") {
            console.log("[WAT-INJECT] Armed for next download");
            armed = true;
            blobCaptured = false;
            anchorClicked = false;
        }
    });

    function sendBlob(blob) {
        if (!armed || blobCaptured) return;
        blobCaptured = true;

        console.log("[WAT-INJECT] Converting blob to base64…");

        blob.arrayBuffer().then((buffer) => {
            const bytes = new Uint8Array(buffer);
            let binary = "";
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);

            window.postMessage({
                type: "WAT_CAPTURED_ARRAYBUFFER",
                base64
            }, "*");
        });

        setTimeout(() => {
            if (anchorClicked) {
                console.log("[WAT-INJECT] Cancelling real download (after capture)");
            }
        }, 10);

        armed = false;
    }

    // Hook URL.createObjectURL
    const origCreate = URL.createObjectURL;
    URL.createObjectURL = function (obj) {
        if (armed && obj instanceof Blob) {
            console.log("[WAT-INJECT] Intercepted via createObjectURL");
            sendBlob(obj);
        }
        return origCreate.call(this, obj);
    };

    // Hook <a>.href assignment for blob URLs
    const origHrefDesc = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, "href");
    Object.defineProperty(HTMLAnchorElement.prototype, "href", {
        set(value) {
            if (armed && value.startsWith("blob:")) {
                console.log("[WAT-INJECT] Intercepted via href assignment");

                fetch(value)
                    .then(r => r.blob())
                    .then(blob => sendBlob(blob));
            }
            return origHrefDesc.set.call(this, value);
        },
        get: origHrefDesc.get
    });

    // Hook Response.blob() fallback
    const origRespBlob = Response.prototype.blob;
    Response.prototype.blob = async function () {
        const result = await origRespBlob.call(this);

        if (armed && result instanceof Blob && this.url.includes("audio")) {
            console.log("[WAT-INJECT] Intercepted via Response.blob()");
            sendBlob(result);
        }

        return result;
    };

    // Intercept download clicks
    document.addEventListener(
        "click",
        (e) => {
            if (!armed) return;

            const a = e.target.closest("a");
            if (a && a.hasAttribute("download")) {
                console.log("[WAT-INJECT] Anchor clicked; waiting for blob…");
                anchorClicked = true;

                e.preventDefault();
                e.stopImmediatePropagation();
            }
        },
        true
    );
}
