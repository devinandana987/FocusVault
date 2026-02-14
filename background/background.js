importScripts("config.js");

//api

async function summarizeWithGroq(text, sendResponse) {

    try {

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "groq/compound",
                messages: [
                    {
                        role: "system",
                        content: "Summarize the following text clearly and concisely and make it really short."
                    },
                    {
                        role: "user",
                        content: text
                    }
                ]
            })
        });

        const data = await response.json();
        console.log(data);
        // const summary = data.choices[0].message.content;
        

        const summary = data.choices?.[0]?.message?.content || "No summary generated.";
        console.log("SUMMARY:", summary);
        chrome.storage.local.get(["summaries"], (result) => {

            let summaries = result.summaries || [];
            summaries.push(summary);

            chrome.storage.local.set({ summaries: summaries }, () => {
                console.log("Summary saved.");
                sendResponse({ status: "summary_saved" });
            });

        });

    } catch (error) {
        console.error("Groq error:", error);
        sendResponse({ status: "error" });
    }
}


console.log("Background script loaded");



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log("Message received:", message);

    if (message.action === "SAVE_NOTE") {

        chrome.storage.local.get(["notes"], (result) => {

            let notes = result.notes || [];
            notes.push(message.text);

            chrome.storage.local.set({ notes: notes }, () => {
                console.log("Saved note");
                sendResponse({ status: "saved" });
            });

        });

        return true;
    }

    if (message.action === "SUMMARIZE_TEXT") {

        console.log("Calling Groq...");
        summarizeWithGroq(message.text, sendResponse);

        return true;
    }
});


//timetracking
let timer = null;

chrome.runtime.onMessage.addListener((msg, sender) => {

  if (msg.action === "START_SESSION") {
    startSession(msg.type, msg.site, sender.tab.id);
  }

  if (msg.action === "PAUSE") pauseSession();
  if (msg.action === "RESUME") resumeSession();
  if (msg.action === "RESTART") resetAll();

});


function startSession(type, site, tabId) {
  chrome.storage.local.get(["currentSession", "paused"], (data) => {

    if (data.paused) return;

    const prev = data.currentSession;

    if (
      prev &&
      prev.site === site &&
      prev.type === type &&
      prev.tabId === tabId
    ) return;

    if (prev) stopSession();

    const session = {
      type,
      site,
      tabId,
      startTime: Date.now()
    };

    chrome.storage.local.set({ currentSession: session });

    clearInterval(timer);
    timer = setInterval(() => {}, 1000);
  });
}


function stopSession() {
  chrome.storage.local.get(["currentSession", "logs"], (data) => {

    if (!data.currentSession) return;

    const elapsed = Date.now() - data.currentSession.startTime;
    const logs = data.logs || { study: [], entertainment: [] };

    logs[data.currentSession.type].push({
      site: data.currentSession.site,
      time: elapsed
    });

    chrome.storage.local.set({ logs, currentSession: null });
  });

  clearInterval(timer);
}


function pauseSession() {
  stopSession();
  chrome.storage.local.set({ paused: true });
}


function resumeSession() {
  chrome.storage.local.set({ paused: false });
}


function resetAll() {
  clearInterval(timer);

  chrome.storage.local.set({
    trackingEnabled: false,
    paused: false,
    currentSession: null,
    logs: { study: [], entertainment: [] }
  });
}
