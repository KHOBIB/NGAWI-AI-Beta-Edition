// api/chat.js
// Ini berjalan di SERVER Vercel — tidak terlihat oleh browser

export const config = {
  runtime: "edge",
};

const FALLBACK_MODELS = [
  "google/gemini-2.0-flash-001",
  "google/gemini-2.0-flash-lite-001",
  "openai/gpt-4o-mini",
];

function toJsonHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...extra,
  };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function extractUpstreamErrorMessage(rawText, status) {
  const parsed = safeJsonParse(rawText);
  const msg =
    parsed?.error?.message ||
    parsed?.message ||
    (typeof parsed?.error === "string" ? parsed.error : "");
  if (msg && String(msg).trim()) return String(msg).trim();
  if (rawText && String(rawText).trim()) return String(rawText).trim();
  return `Upstream HTTP ${status}`;
}

function buildModelList(primaryModel, preferredModels) {
  const merged = [
    primaryModel,
    ...(Array.isArray(preferredModels) ? preferredModels : []),
    ...FALLBACK_MODELS,
  ].filter((m) => typeof m === "string" && m.trim());

  const uniq = [];
  for (const model of merged) {
    const cleaned = model.trim();
    if (!uniq.includes(cleaned)) uniq.push(cleaned);
  }
  return uniq.slice(0, 6);
}

function shouldTryNextModel(status, message) {
  if (status === 408 || status === 409 || status === 425 || status === 429)
    return true;
  if (status >= 500) return true;
  const msg = String(message || "").toLowerCase();
  return (
    msg.includes("no endpoints found") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("rate limit") ||
    msg.includes("overloaded") ||
    msg.includes("model not found")
  );
}

async function callOpenRouter(payload, apiKey, origin) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40000);
  try {
    return await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": origin,
        "X-Title": "NGAWI AI",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req) {
  // Tolak selain POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: { message: "Payload chat tidak valid" } }),
        { status: 400, headers: toJsonHeaders() },
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: "API key belum diset di Vercel" } }),
        { status: 500, headers: toJsonHeaders() },
      );
    }

    const wantsStream = body?.stream === true;
    const modelList = buildModelList(body?.model, body?.preferred_models);

    // Prefer dynamic referer (works on multiple preview domains)
    const origin =
      req.headers.get("origin") || "https://ngawi-ai-beta-edition.vercel.app";

    const basePayload = { ...body };
    delete basePayload.preferred_models;
    basePayload.stream = wantsStream;

    if (wantsStream) {
      const streamModel = modelList[0] || FALLBACK_MODELS[0];
      const upstream = await callOpenRouter(
        { ...basePayload, model: streamModel },
        apiKey,
        origin,
      );

      if (!upstream.ok) {
        const errText = await upstream.text().catch(() => "");
        const message = extractUpstreamErrorMessage(errText, upstream.status);
        return new Response(
          JSON.stringify({
            error: {
              message,
              model: streamModel,
            },
          }),
          { status: upstream.status, headers: toJsonHeaders() },
        );
      }

      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Ngawi-Model": streamModel,
        },
      });
    }

    let lastFailure = null;
    const attemptedModels = [];
    for (const model of modelList) {
      let upstream;
      try {
        upstream = await callOpenRouter(
          { ...basePayload, model, stream: false },
          apiKey,
          origin,
        );
      } catch (fetchErr) {
        const msg = fetchErr?.message || String(fetchErr);
        attemptedModels.push({
          model,
          status: 0,
          message: msg,
        });
        lastFailure = { status: 503, message: msg };
        continue;
      }

      const text = await upstream.text().catch(() => "");
      if (upstream.ok) {
        return new Response(text, {
          status: 200,
          headers: toJsonHeaders({ "X-Ngawi-Model": model }),
        });
      }

      const errorMessage = extractUpstreamErrorMessage(text, upstream.status);
      attemptedModels.push({
        model,
        status: upstream.status,
        message: errorMessage,
      });
      lastFailure = { status: upstream.status, message: errorMessage };

      if (!shouldTryNextModel(upstream.status, errorMessage)) {
        return new Response(
          JSON.stringify({
            error: {
              message: errorMessage,
              attempted_models: attemptedModels,
            },
          }),
          {
            status: upstream.status,
            headers: toJsonHeaders(),
          },
        );
      }
    }

    return new Response(
      JSON.stringify({
        error: {
          message:
            lastFailure?.message ||
            "Semua model fallback gagal dipakai. Coba lagi beberapa saat.",
          attempted_models: attemptedModels,
        },
      }),
      {
        status: lastFailure?.status || 503,
        headers: toJsonHeaders(),
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: err?.message || String(err) } }),
      {
        status: 500,
        headers: toJsonHeaders(),
      },
    );
  }
}
