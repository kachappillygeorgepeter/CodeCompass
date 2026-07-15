/* This file contains the API client for interacting with the AI backend.*/

const BACKEND_URL = ""; // 
export const DEFAULT_VERBOSITY = "beginner";

// Function to send code to the backend for explanation and receive the explanation in return.
export async function explainCode(code) {
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.explanation;
}
