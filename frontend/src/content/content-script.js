/* Detects when the user highlights text, shows a floating "Explain" button,
 and renders the explanation popup returned by the background script.*/

// These variables are used to keep track of the floating button and popup card elements.
let floatingButton = null;
let popupCard = null;
let activeRequestId = 0;

document.addEventListener("mouseup", handleSelection);
window.addEventListener("code-compass:popup-closed", () => {
  activeRequestId += 1;
  removeFloatingButton();
});

// This function is called when the user highlights text on the page. It checks if the highlighted text is valid and creates a floating "Explain" button near the selection.
// When the button is clicked, it sends a message to the background script to request an explanation for the selected code snippet.
function handleSelection(event) {
  if (event.target instanceof Element && (event.target.closest(".code-compass-fab") || event.target.closest(".code-compass-popup"))) {
    return;
  }
// Get the selected text and trim any whitespace. If the selection is empty or too short, remove the floating button and return.
  const selectedText = window.getSelection().toString().trim();
  removeFloatingButton();
  if (!selectedText || selectedText.length < 3) return;

// Create a floating button and position it near the mouse cursor. Add event listeners to handle clicks and prevent propagation of mouse events.
  floatingButton = document.createElement("button");
  floatingButton.textContent = "Explain";
  floatingButton.className = "code-compass-fab";
  floatingButton.style.top = `${event.pageY + 10}px`;
  floatingButton.style.left = `${event.pageX + 10}px`;

  floatingButton.addEventListener("mousedown", (e) => e.stopPropagation());
  floatingButton.addEventListener("mouseup", (e) => e.stopPropagation());
  floatingButton.addEventListener("click", (e) => {
    e.stopPropagation();//Some websites clear text selections or hide menus during mouseup, so stopping propagation helps prevent those page behaviors from interfering with your floating button.
    requestExplanation(selectedText, event);
  });

  document.body.appendChild(floatingButton);
}
// Function to request an explanation for the selected code snippet. It removes the floating button, shows a "Thinking..." popup, and sends a message to the background script to request an explanation. When the response is received, it updates the popup with the explanation or an error message.
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
// Function to remove the floating button from the page. It checks if the button exists and removes it from the DOM, then sets the reference to null.
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
