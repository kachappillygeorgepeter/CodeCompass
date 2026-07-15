/*Deals with the backend logic of the application. It handles incoming requests, processes them and returns appropriate responses.
This file is responsible for communicating with the AI API to get explanations for code snippets provided by users.
It ensures that the requests are valid and that the responses are formatted correctly before sending them back to the client.*/



// This  is a Cloudflare Worker that takes a code snippet from the request body, sends it to the API for explanation and returns the explanation in the response.
// The function is exported so that it can be used by other files.
//It ensures that the request method is POST and that the code snippet is valid before sending it to the API. If the request method is not POST or the code snippet is invalid, it returns an error response.
export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
//Read the JSON body from the request. Wait until it's available. Extract the code property into a variable named code.
    const { code } = await request.json();

//Checking code size
    if (!code || code.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid snippet" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
//Send a POST request to the API with the code snippet in the request body. Wait for the response and parse it as JSON. Extract the explanation from the response data. If no explanation is available, set a default message.
    const aiResponse = await fetch("", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.AI_API_KEY,
      },
      body: JSON.stringify({
        model: "",
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
