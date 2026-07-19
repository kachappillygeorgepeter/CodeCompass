/*This file defines the popup UI for the Code Compass extension.*/
(function () {
  let popupCard = null;
  let popupContent = null;
  let closeButton = null;
  let activeRequestId = 0;

  function attachDragBehavior(card) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const startDrag = (event) => {
      if (event.target.closest(".code-compass-close")) return;
      isDragging = true;
      card.classList.add("is-dragging");
      const rect = card.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      document.body.style.userSelect = "none";
      event.preventDefault();
    };

    const moveDrag = (event) => {
      if (!isDragging) return;
      const nextLeft = Math.max(0, startLeft + (event.clientX - startX));
      const nextTop = Math.max(0, startTop + (event.clientY - startY));
      card.style.left = `${nextLeft}px`;
      card.style.top = `${nextTop}px`;
    };

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      card.classList.remove("is-dragging");
      document.body.style.userSelect = "";
    };

    card.addEventListener("pointerdown", startDrag);
    document.addEventListener("pointermove", moveDrag);
    document.addEventListener("pointerup", stopDrag);

    card.__dragCleanup = () => {
      card.removeEventListener("pointerdown", startDrag);
      document.removeEventListener("pointermove", moveDrag);
      document.removeEventListener("pointerup", stopDrag);
      document.body.style.userSelect = "";
    };
  }

  async function showPopup(content, event) {
    removePopup();

    const template = await fetch(chrome.runtime.getURL("src/content/popup-ui.html"));
    const html = await template.text();

    popupCard = document.createElement("div");
    popupCard.className = "code-compass-popup";
    popupCard.style.top = `${event.clientY + 10}px`;
    popupCard.style.left = `${event.clientX + 10}px`;
    popupCard.innerHTML = html;

    popupContent = popupCard.querySelector(".code-compass-popup__content");
    closeButton = popupCard.querySelector(".code-compass-close");

    if (popupContent) {
      popupContent.textContent = content;
    }

    if (closeButton) {
      closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        removePopup({ canceled: true });
      });
    }

    attachDragBehavior(popupCard);
    document.body.appendChild(popupCard);
  }

  function removePopup({ canceled = false } = {}) {
    activeRequestId += 1;

    if (popupCard) {
      if (popupCard.__dragCleanup) {
        popupCard.__dragCleanup();
      }
      popupCard.remove();
      popupCard = null;
      popupContent = null;
      closeButton = null;
    }

    if (canceled) {
      window.dispatchEvent(new CustomEvent("code-compass:popup-closed"));
      document.dispatchEvent(new CustomEvent("code-compass:popup-closed"));
    }
  }

  window.CodeExplainerPopupUI = { showPopup, removePopup };
})();
