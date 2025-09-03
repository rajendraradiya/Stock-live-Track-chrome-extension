const priceEl = document.getElementById("price");
const changeEl = document.getElementById("change");
const lastUpdatedEl = document.getElementById("lastUpdated");
const toggleBtn = document.getElementById("toggleBtn");

function renderQuote(quote, lastUpdated) {
  priceEl.textContent = `${quote.price}`;
  changeEl.textContent = `${quote.change.toFixed(2)} (${quote.changePercent}%)`;
  changeEl.style.color = quote.change >= 0 ? "green" : "red";
  lastUpdatedEl.textContent =
    "Last updated: " + new Date(lastUpdated).toLocaleTimeString();
}

chrome.storage.local.get(["lastQuote", "lastUpdated", "running"], (data) => {
  if (data.lastQuote) renderQuote(data.lastQuote, data.lastUpdated);
  toggleBtn.textContent = data.running ? "Stop" : "Start";
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "nifty:update") {
    renderQuote(msg.payload, Date.now());
  }
});

toggleBtn.addEventListener("click", () => {
  chrome.storage.local.get("running", ({ running }) => {
    if (running) {
      chrome.runtime.sendMessage({ type: "nifty:stop" }, () => {
        toggleBtn.textContent = "Start";
      });
    } else {
      chrome.runtime.sendMessage({ type: "nifty:start" }, () => {
        toggleBtn.textContent = "Stop";
      });
    }
  });
});
