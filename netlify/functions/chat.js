// Serverless proxy per OpenAI su Netlify Functions
export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Use POST" }) };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const defaultModel = process.env.OPENAI_MODEL || "gpt-5-thinking";
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { messages, model, temperature, response_format } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing messages[]" }) };
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || defaultModel,         // ← evita l'errore "you must provide a model"
        messages,
        temperature: temperature ?? 0.1,
        response_format
      })
    });

    const text = await r.text();
    return {
      statusCode: r.status,
      headers: { "Content-Type": "application/json" },
      body: text
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e?.message || "Server error" }) };
  }
}
