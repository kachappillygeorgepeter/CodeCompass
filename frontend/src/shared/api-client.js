/* This file contains the API client for interacting with the AI backend.*/

// Backend is served from /api (Vercel auto-routes api/index.js → /api)
const BACKEND_URL = "https://code-compass-psi.vercel.app/api";
export const DEFAULT_VERBOSITY = "beginner";

/** Reads the verbosity preference from chrome.storage (falls back to DEFAULT_VERBOSITY). */
function getVerbosity() {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["verbosity"], (result) => {
        resolve(result.verbosity || DEFAULT_VERBOSITY);
      });
    } else {
      resolve(DEFAULT_VERBOSITY);
    }
  });
}

// Function to send code to the backend for explanation and receive the explanation in return.
export async function explainCode(code) {
  const verbosity = await getVerbosity();

  let response;
  try {
    response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, verbosity }),
    });
  } catch (networkErr) {
    throw new Error(`Network error — could not reach backend: ${networkErr.message}`);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const errData = await response.json();
      detail = errData.error ? `: ${errData.error}` : "";
    } catch (_) { /* ignore parse errors */ }
    throw new Error(`API error ${response.status}${detail}`);
  }

  const data = await response.json();
  return data.explanation;
}
