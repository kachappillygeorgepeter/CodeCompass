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
  chrome.runtime.sendMessage(
    { type: "EXPLAIN_CODE", payload: { code } },
    (response) => {
      if (requestId !== activeRequestId) {
        return;
      }

      if (chrome.runtime.lastError || !response || response.error) {
        window.CodeExplainerPopupUI.showPopup("Sorry, something went wrong. Please try again.", event);
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
