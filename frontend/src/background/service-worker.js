/*Runs in the background (Manifest V3 service worker).
Receives the highlighted code from the content-script.js and calls the AI API.*/

import { explainCode } from "../shared/api-client.js";

// Listen for messages from the content script
// When a message of type "EXPLAIN_CODE" is received, call the explainCode function and send the response back to the content script.
// The explainCode function is responsible for sending the code snippet to the backend API and receiving the explanation. If an error occurs, it sends the error message back to the content script.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXPLAIN_CODE") {
    explainCode(message.payload.code)
      .then((explanation) => sendResponse({ explanation }))
      .catch((error) => sendResponse({ error: error.message }));

    return true;
  }
});
