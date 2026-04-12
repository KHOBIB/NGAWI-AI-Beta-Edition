// api/upload.js
// Berjalan di SERVER Vercel — API key tidak kelihatan browser

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const apiKey = process.env.IMGBB_API_KEY; // Diambil dari env Vercel

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "IMGBB_API_KEY belum diset di Vercel" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Terima file dari browser
    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "Tidak ada file gambar" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Forward ke ImgBB pakai API key dari env (aman di server)
    const imgbbForm = new FormData();
    imgbbForm.append("key", apiKey);
    imgbbForm.append("image", imageFile);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbForm,
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
