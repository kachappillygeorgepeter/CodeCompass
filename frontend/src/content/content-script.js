/* Detects when the user highlights text, shows a floating "Explain" button,
 and renders the explanation popup returned by the background script.*/

let floatingButton = null;
let popupCard = null;
let activeRequestId = 0;

document.addEventListener("mouseup", handleSelection);
window.addEventListener("code-compass:popup-closed", () => {
  activeRequestId += 1;
  removeFloatingButton();
});

function handleSelection(event) {
  if (event.target instanceof Element && (event.target.closest(".code-compass-fab") || event.target.closest(".code-compass-popup"))) {
    return;
  }

  const selectedText = window.getSelection().toString().trim();
  removeFloatingButton();
  if (!selectedText || selectedText.length < 3) return;

  floatingButton = document.createElement("button");
  floatingButton.textContent = "Explain";
  floatingButton.className = "code-compass-fab";
  floatingButton.style.top = `${event.pageY + 10}px`;
  floatingButton.style.left = `${event.pageX + 10}px`;

  floatingButton.addEventListener("mousedown", (e) => e.stopPropagation());
  floatingButton.addEventListener("mouseup", (e) => e.stopPropagation());
  floatingButton.addEventListener("click", (e) => {
    e.stopPropagation();
    requestExplanation(selectedText, event);
  });

  document.body.appendChild(floatingButton);
}

function requestExplanation(code, event) {
  const requestId = Date.now();
  activeRequestId = requestId;
  removeFloatingButton();
  window.CodeExplainerPopupUI.removePopup();

  // Show a loading indicator immediately so the user knows a request is in flight
  window.CodeExplainerPopupUI.showPopup("⏳ Analysing…", event);

  // Safety net: if the service worker goes dormant and never replies, show a timeout
  const timeoutId = setTimeout(() => {
    if (requestId !== activeRequestId) return;
    window.CodeExplainerPopupUI.showPopup(
      "Request timed out. The service worker may have gone dormant — try again.",
      event
    );
  }, 20000);

  chrome.runtime.sendMessage(
    { type: "EXPLAIN_CODE", payload: { code } },
    (response) => {
      clearTimeout(timeoutId);

      if (requestId !== activeRequestId) {
        return;
      }

      // Surface the real error so it's visible in the popup (helps debugging)
      if (chrome.runtime.lastError) {
        window.CodeExplainerPopupUI.showPopup(
          `Extension error: ${chrome.runtime.lastError.message}`,
          event
        );
        return;
      }

      if (!response) {
        window.CodeExplainerPopupUI.showPopup(
          "No response from background service worker. Try reloading the extension.",
          event
        );
        return;
      }

      if (response.error) {
        window.CodeExplainerPopupUI.showPopup(`Error: ${response.error}`, event);
        return;
      }

      window.CodeExplainerPopupUI.showPopup(response.explanation, event);
    }
  );
}

function removeFloatingButton() {
  if (floatingButton) {
    floatingButton.remove();
    floatingButton = null;
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    removeFloatingButton();
    window.CodeExplainerPopupUI.removePopup();
  }
});
