const verbositySelect = document.getElementById("verbosity");

chrome.storage.local.get(["verbosity"], (result) => {
  if (result.verbosity) verbositySelect.value = result.verbosity;
});

verbositySelect.addEventListener("change", () => {
  chrome.storage.local.set({ verbosity: verbositySelect.value });
});
