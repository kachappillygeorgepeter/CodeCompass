/*Deals with the backend logic of the application. It handles incoming requests, processes them and returns appropriate responses.
This file is responsible for communicating with the AI API to get explanations for code snippets provided by users.
Deployed as a Vercel serverless function.*/

export default async function handler(req, res) {
  // CORS headers so the Chrome extension can call this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.body;

  // Checking code size
  if (!code || code.length > 5000) {
    return res.status(400).json({ error: "Invalid snippet" });
  }

  const aiApiUrl = process.env.AI_API?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();

  if (!aiApiUrl) {
    return res.status(500).json({ error: "AI API endpoint is not configured" });
  }

  const headers = { "Content-Type": "application/json" };
  if (aiApiKey) {
    headers["x-goog-api-key"] = aiApiKey;
  }

  const aiResponse = await fetch(aiApiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Explain this code snippet in plain English, step by step:\n\n${code}`,
            },
          ],
        },
      ],
    }),
  });

  const data = await aiResponse.json();
  const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No explanation available.";

  return res.status(200).json({ explanation });
}
