// document.getElementById("trackbackbtn").addEventListener("click", function () {
//     window.location.href = "dashboard.html";
// });

let paused = false;

function format(ms) {
  let s = Math.floor(ms / 1000);
  let h = String(Math.floor(s / 3600)).padStart(2, "0");
  let m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  let sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}


function updateUI() {
  chrome.storage.local.get(["currentSession", "logs"], (data) => {

    let studyHTML = "";
    let entHTML = "";

    if (data.currentSession) {
      const elapsed = Date.now() - data.currentSession.startTime;

      if (data.currentSession.type === "study")
        studyHTML += `LIVE: ${data.currentSession.site}<br>${format(elapsed)}<br><br>`;

      if (data.currentSession.type === "entertainment")
        entHTML += `LIVE: ${data.currentSession.site}<br>${format(elapsed)}<br><br>`;
    }

    const studyLogs = data.logs?.study || [];
    const entLogs = data.logs?.entertainment || [];

    studyHTML += studyLogs.map(e => `${e.site} — ${format(e.time)}`).join("<br>");
    entHTML += entLogs.map(e => `${e.site} — ${format(e.time)}`).join("<br>");

    document.getElementById("studyTime").innerHTML = studyHTML || "00:00:00";
    document.getElementById("entTime").innerHTML = entHTML || "00:00:00";
  });
}

setInterval(updateUI, 1000);


document.querySelector(".pause").onclick = () => {
  paused = !paused;

  chrome.runtime.sendMessage({
    action: paused ? "PAUSE" : "RESUME"
  });

  document.querySelector(".pause").innerText = paused ? "Resume" : "Pause";
};


document.querySelector(".restart").onclick = () => {
  chrome.runtime.sendMessage({ action: "RESTART" });
  location.href = "index/index.html";
};



