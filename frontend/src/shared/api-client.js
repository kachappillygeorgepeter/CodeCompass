// Wraps all calls to the AI backend. Never call the AI provider directly
// with a hardcoded key here — route through your backend proxy instead
// (see /backend). This keeps your API key out of the published extension.

const BACKEND_URL = "https://your-backend-proxy.example.workers.dev/explain";

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
