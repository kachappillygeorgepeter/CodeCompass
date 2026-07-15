// It handles the selection of the explanation style (Beginner or Expert) and saves the user's preference to Chrome's local storage.
const verbositySelect = document.getElementById("verbosity");

chrome.storage.local.get(["verbosity"], (result) => {
  if (result.verbosity) verbositySelect.value = result.verbosity;
});

verbositySelect.addEventListener("change", () => {
  chrome.storage.local.set({ verbosity: verbositySelect.value });
});
