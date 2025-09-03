let fetchInterval = null;
let isRunning = false;

function safeBroadcast(msg) {
  chrome.tabs.query({}, (tabs) => {
    for (let tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, msg, () => {
          if (chrome.runtime.lastError) {
            // ignore if tab has no listener
          }
        });
      }
    }
  });
}

async function fetchAndStoreQuote() {
  try {
    const select = document.getElementById("indexSelect");
    const res = await fetch(
      `https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "application/json",
          "Referer": "https://www.nseindia.com/"
        }
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const nifty = data.data[0];

    const quote = {
      price: nifty.lastPrice,
      change: nifty.change,
      changePercent: nifty.pChange,
      time: Date.now(),
      shortName: "NIFTY 50"
    };

    await chrome.storage.local.set({
      lastQuote: quote,
      lastUpdated: Date.now(),
      lastError: null
    });

    safeBroadcast({ type: "nifty:update", payload: quote });
  } catch (err) {
    console.error("Fetch error:", err);
    await chrome.storage.local.set({
      lastError: String(err),
      lastUpdated: Date.now()
    });
    safeBroadcast({ type: "nifty:error", payload: String(err) });
  }
}

function startFetching() {
  if (isRunning) return;
  isRunning = true;

  // 🔹 Fetch immediately, don’t wait 5 sec
  fetchAndStoreQuote();

  // 🔹 Then fetch every 5 sec
  fetchInterval = setInterval(fetchAndStoreQuote, 5000);

  chrome.storage.local.set({ running: true });
}

function stopFetching() {
  if (fetchInterval) {
    clearInterval(fetchInterval);
    fetchInterval = null;
  }
  isRunning = false;
  chrome.storage.local.set({ running: false });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "nifty:start") {
    startFetching();
    sendResponse({ ok: true });
  }
  if (msg?.type === "nifty:stop") {
    stopFetching();
    sendResponse({ ok: true });
  }
});
