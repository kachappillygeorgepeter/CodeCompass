(function () {
  let popupCard = null;
  let popupContent = null;
  let closeButton = null;

  async function showPopup(content, event) {
    removePopup();

    const template = await fetch(chrome.runtime.getURL("src/content/popup-ui.html"));
    const html = await template.text();

    popupCard = document.createElement("div");
    popupCard.className = "code-compass-popup";
    popupCard.style.top = `${event.pageY + 10}px`;
    popupCard.style.left = `${event.pageX + 10}px`;
    popupCard.innerHTML = html;

    popupContent = popupCard.querySelector(".code-compass-popup__content");
    closeButton = popupCard.querySelector(".code-compass-close");

    if (popupContent) {
      popupContent.textContent = content;
    }

    if (closeButton) {
      closeButton.addEventListener("click", removePopup);
    }

    document.body.appendChild(popupCard);
  }

  function removePopup() {
    if (popupCard) {
      popupCard.remove();
      popupCard = null;
      popupContent = null;
      closeButton = null;
    }
  }

  window.CodeExplainerPopupUI = { showPopup, removePopup };
})();
