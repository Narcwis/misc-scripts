document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["apiKey"], data => {
        document.getElementById("apiKey").value = data.apiKey || "";
    });

    document.getElementById("saveButton").onclick = () => {
        chrome.storage.sync.set({
            apiKey: document.getElementById("apiKey").value.trim(),
        }, () => {
            const status = document.getElementById("status");
            status.textContent = "Saved!";
            setTimeout(() => status.textContent = "", 2000);
        });
    };
});
