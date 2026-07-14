// Example Cloudflare Worker acting as a backend proxy.
// Deploy this separately (e.g. `wrangler deploy`). Store your real AI API
// key as a Worker secret (e.g. `wrangler secret put AI_API_KEY`) —
// never in this file or in the extension.

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { code } = await request.json();

    if (!code || code.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid snippet" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.AI_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `Explain this code snippet in plain English, step by step:\n\n${code}`,
          },
        ],
      }),
    });

    const data = await aiResponse.json();
    const explanation = data.content?.[0]?.text ?? "No explanation available.";

    return new Response(JSON.stringify({ explanation }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
