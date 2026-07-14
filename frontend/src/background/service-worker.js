// Runs in the background (Manifest V3 service worker).
// Receives the highlighted code from the content script and calls the AI API.

import { explainCode } from "../shared/api-client.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXPLAIN_CODE") {
    explainCode(message.payload.code)
      .then((explanation) => sendResponse({ explanation }))
      .catch((error) => sendResponse({ error: error.message }));

    return true;
  }
});
