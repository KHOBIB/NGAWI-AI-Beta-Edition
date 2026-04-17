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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: "API key belum diset di Vercel" } }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const wantsStream = body?.stream === true;

    // Prefer dynamic referer (works on multiple preview domains)
    const origin =
      req.headers.get("origin") || "https://ngawi-ai-beta-edition.vercel.app";

    const upstream = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": origin,
          "X-Title": "NGAWI AI",
        },
        body: JSON.stringify(body),
      },
    );

    // Read error details if any, so client can show real reason
    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      return new Response(
        errText ||
          JSON.stringify({
            error: { message: `Upstream HTTP ${upstream.status}` },
          }),
        {
          status: upstream.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // If client doesn't ask for streaming, return JSON
    if (!wantsStream) {
      const jsonText = await upstream.text();
      return new Response(jsonText, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    // Streaming mode
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: err?.message || String(err) } }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
