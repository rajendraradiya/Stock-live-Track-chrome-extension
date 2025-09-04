function createWidget() {
  let widget = document.getElementById("nifty-widget");
  if (widget) return widget;

  widget = document.createElement("div");
  widget.id = "nifty-widget";
  widget.innerHTML = `
    <div class="nifty-header">NIFTY 50</div>
    <div class="nifty-price">Loading...</div>
    <div class="nifty-change"></div>
  `;
  document.body.appendChild(widget);
  return widget;
}

function updateWidget(quote) {
  const widget = createWidget();
  widget.querySelector(".nifty-header").textContent = `₹${quote.shortName}`;
  widget.querySelector(".nifty-price").textContent = `₹${quote.price}`;
  widget.querySelector(".nifty-change").textContent =
    `${quote.change.toFixed(2)} (${quote.changePercent}%)`;
  widget.querySelector(".nifty-change").style.color =
    quote.change >= 0 ? "green" : "red";
}

// Listen for updates from background.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "nifty:update") {
    updateWidget(msg.payload);
  }
});

// Load cached last quote when page opens
chrome.storage.local.get("lastQuote", ({ lastQuote }) => {
  if (lastQuote) updateWidget(lastQuote);
});
