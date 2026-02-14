
chrome.storage.local.get(["trackingEnabled"], (data) => {
  if (data.trackingEnabled) {
    window.location.href = "../dashboard.html";
  }
});

document.getElementById("startButton").addEventListener("click", () => {
  chrome.storage.local.set({ trackingEnabled: true }, () => {
    window.location.href = "../dashboard.html";
  });
});



// document.getElementById("startButton").addEventListener("click", function () {
//     window.location.href = "../dashboard.html";
// });
