// api/chat.js
// Ini berjalan di SERVER Vercel — tidak terlihat oleh browser

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  // Tolak selain POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();

    // API Key diambil dari environment variable Vercel (aman, tidak publik)
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key belum diset di Vercel" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Kirim request ke OpenRouter dari SERVER (bukan dari browser)
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ngawi-ai-beta-edition.vercel.app/", // ganti dengan URL Vercel lu nanti
          "X-Title": "NGAWI AI",
        },
        body: JSON.stringify(body),
      },
    );

    // Forward streaming response ke browser
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
