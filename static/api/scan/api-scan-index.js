/**
 * Azure Function: /api/scan
 *
 * Proxy ke OpenRouter API agar API key tidak terekspos di frontend.
 * API key dibaca dari environment variable OPENROUTER_API_KEY yang
 * diset di Azure Portal → Function App → Configuration → App Settings.
 */
module.exports = async function (context, req) {
  // Hanya terima POST
  if (req.method !== "POST") {
    context.res = { status: 405, body: "Method Not Allowed" };
    return;
  }

  const prompt = req.body?.prompt;
  if (!prompt || typeof prompt !== "string") {
    context.res = { status: 400, body: { error: "Field 'prompt' wajib diisi." } };
    return;
  }

  // Ambil API key dari environment variable (JANGAN hardcode di sini)
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    context.log.error("OPENROUTER_API_KEY belum diset di App Settings.");
    context.res = { status: 500, body: { error: "Konfigurasi server tidak lengkap." } };
    return;
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      context.log.error("OpenRouter error:", errText);
      context.res = {
        status: upstream.status,
        body: { error: `Upstream error: ${upstream.status}` }
      };
      return;
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      context.res = { status: 502, body: { error: "Respons upstream tidak valid." } };
      return;
    }

    // Kembalikan hanya konten yang dibutuhkan frontend
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { content }
    };

  } catch (err) {
    context.log.error("Unexpected error:", err);
    context.res = {
      status: 500,
      body: { error: "Terjadi kesalahan internal. Coba lagi." }
    };
  }
};
