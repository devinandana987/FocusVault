//notes
console.log("Content script loaded");

let saveBtn = null;
let summaryBtn = null;
let selectedText = "";

document.addEventListener("selectionchange", function () {

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
        return;
    }

    const text = selection.toString().trim();

    if (!text) {
        removeButtons();
        return;
    }

    selectedText = text;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    removeButtons();

    // ✅ SAVE BUTTON
    saveBtn = createButton("Save", rect.left, rect.bottom + 8);
    saveBtn.onclick = function (e) {
        e.stopPropagation();

        chrome.runtime.sendMessage({
            action: "SAVE_NOTE",
            text: selectedText
        });

        removeButtons();
        window.getSelection().removeAllRanges();
    };

    // 🔥 SUMMARIZE BUTTON
    summaryBtn = createButton("Summarize", rect.left + 80, rect.bottom + 8);
    summaryBtn.onclick = function (e) {
        e.stopPropagation();

        chrome.runtime.sendMessage({
            action: "SUMMARIZE_TEXT",
            text: selectedText
        });
        console.log(selectedText)

        removeButtons();
        window.getSelection().removeAllRanges();
    };
});

function createButton(label, left, top) {
    const btn = document.createElement("button");
    btn.textContent = label;

    btn.style.position = "fixed";
    btn.style.top = top + "px";
    btn.style.left = left + "px";
    btn.style.padding = "6px 10px";
    btn.style.background = "#14532d";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "999999";

    document.body.appendChild(btn);
    return btn;
}

function removeButtons() {
    if (saveBtn) saveBtn.remove();
    if (summaryBtn) summaryBtn.remove();
    saveBtn = null;
    summaryBtn = null;
}


//timetracking


chrome.storage.local.get(["trackingEnabled", "paused"], (data) => {

  if (!data.trackingEnabled || data.paused) return;

  const site = location.hostname;

  if (document.getElementById("studyVaultPopup")) return;

  const popup = document.createElement("div");
  popup.id = "studyVaultPopup";

  popup.style = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    background: white;
    padding: 12px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    font-family: sans-serif;
  `;

  popup.innerHTML = `
    <p style="margin-bottom:8px;">How are you using this site?</p>
    <button id="studyBtn">Study</button>
    <button id="entBtn">Entertainment</button>
  `;

  document.body.appendChild(popup);

  document.getElementById("studyBtn").onclick = () => {
    start("study");
  };

  document.getElementById("entBtn").onclick = () => {
    start("entertainment");
  };

  function start(type) {
    chrome.runtime.sendMessage({
      action: "START_SESSION",
      type,
      site
    });
    popup.remove();
  }

});
