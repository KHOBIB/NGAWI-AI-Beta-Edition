export const config = {
  runtime: "edge",
};

function jsonHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...extra,
  };
}

function clampText(input = "") {
  const text = String(input || "").replace(/\s+/g, " ").trim();
  return text.slice(0, 3800);
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY belum diset di server" }),
        { status: 500, headers: jsonHeaders() },
      );
    }

    const body = await req.json().catch(() => ({}));
    const text = clampText(body?.text);
    if (!text) {
      return new Response(JSON.stringify({ error: "Teks kosong" }), {
        status: 400,
        headers: jsonHeaders(),
      });
    }

    const voice = String(body?.voice || "alloy");
    const style = String(body?.style || "mentor");
    const instructions = String(
      body?.instructions ||
        "Gunakan Bahasa Indonesia natural, lembut, dan jelas.",
    );

    const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        format: "mp3",
        input: text,
        instructions: `${instructions}\nStyle saat ini: ${style}`,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      return new Response(
        JSON.stringify({
          error: errText || `Upstream HTTP ${upstream.status}`,
        }),
        { status: upstream.status, headers: jsonHeaders() },
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      {
        status: 500,
        headers: jsonHeaders(),
      },
    );
  }
}

