// Vercel serverless funksiyasi: sahifadan kelgan arizani Telegramga uzatadi.
// Bot tokeni shu yerda, server tomonda qoladi — sahifa kodida ko'rinmaydi.
//
// Vercel'da ikkita Environment Variable qo'shing:
//   BOT_TOKEN = 123456789:AA...        (@BotFather bergan token)
//   CHAT_ID   = -1001234567890          (arizalar tushadigan guruh yoki shaxs id'si)

const LIMITS = { name: 100, phone: 40, company: 150, comment: 1000 };

function clean(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { BOT_TOKEN, CHAT_ID } = process.env;
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("BOT_TOKEN yoki CHAT_ID sozlanmagan");
    return res.status(500).json({ error: "Server sozlanmagan" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const name  = clean(body.name, LIMITS.name);
  const phone = clean(body.phone, LIMITS.phone);
  if (!name || phone.replace(/\D/g, "").length < 9) {
    return res.status(400).json({ error: "Ism yoki telefon noto'g'ri" });
  }

  // Matnni sahifa tayyorlaydi, lekin uzunligini bu yerda ham cheklaymiz
  const text = clean(body.text, 3500) ||
    `GlossPak — yangi ariza\n\nIsm: ${name}\nTelefon: ${phone}\n` +
    `Korxona: ${clean(body.company, LIMITS.company) || "—"}\n` +
    `Izoh: ${clean(body.comment, LIMITS.comment) || "—"}`;

  try {
    const tg = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        disable_web_page_preview: true
      })
    });

    if (!tg.ok) {
      const detail = await tg.text();
      console.error("Telegram xatosi:", tg.status, detail);
      return res.status(502).json({ error: "Telegramga yuborilmadi" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Yuborishda xatolik:", err);
    return res.status(502).json({ error: "Yuborishda xatolik" });
  }
};
