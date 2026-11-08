// Vercel serverless funksiyasi: sahifadan kelgan arizani ikki joyga uzatadi —
// Telegramga (darhol ko'rish uchun) va amoCRM ga (sotuv uchun).
// Ikkalasi bir vaqtda, mustaqil ketadi: biri ishlamay qolsa, ikkinchisi baribir
// arizani qabul qiladi va mijoz xato ko'rmaydi.
//
// Vercel'dagi Environment Variables:
//   BOT_TOKEN       123456789:AA...        @BotFather bergan token
//   CHAT_ID         -1001234567890         arizalar tushadigan guruh
//   AMO_SUBDOMAIN   glosspak               ya'ni glosspak.amocrm.ru
//   AMO_TOKEN       eyJ0eXAi...            amoCRM uzoq muddatli tokeni
//   AMO_PIPELINE_ID 1234567                ixtiyoriy: qaysi voronka
//   AMO_STATUS_ID   7654321                ixtiyoriy: qaysi bosqich

const LIMITS = { name: 100, phone: 40, company: 150, comment: 1000, text: 3500 };
const TIMEOUT_MS = 8000;

function clean(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max);
}

// Tashqi so'rov cheksiz osilib qolmasligi uchun
async function post(url, options) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function sendTelegram(text) {
  const { BOT_TOKEN, CHAT_ID } = process.env;
  if (!BOT_TOKEN || !CHAT_ID) return { skipped: true };

  const r = await post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text, disable_web_page_preview: true })
  });
  if (!r.ok) throw new Error(`Telegram ${r.status}: ${await r.text()}`);
  return { ok: true };
}

async function sendAmo(d, text) {
  const { AMO_SUBDOMAIN, AMO_TOKEN, AMO_PIPELINE_ID, AMO_STATUS_ID } = process.env;
  if (!AMO_SUBDOMAIN || !AMO_TOKEN) return { skipped: true };

  const base = `https://${AMO_SUBDOMAIN}.amocrm.ru/api/v4`;
  const auth = {
    "Authorization": `Bearer ${AMO_TOKEN}`,
    "Content-Type": "application/json"
  };

  // Bitta so'rovda ham bitim, ham kontakt yaratiladi
  const lead = {
    name: `Sayt: ${d.name}${d.company ? " — " + d.company : ""}`,
    _embedded: {
      contacts: [{
        first_name: d.name,
        custom_fields_values: [
          { field_code: "PHONE", values: [{ value: d.phone, enum_code: "WORK" }] }
        ]
      }]
    }
  };
  if (AMO_PIPELINE_ID) lead.pipeline_id = Number(AMO_PIPELINE_ID);
  if (AMO_STATUS_ID)   lead.status_id   = Number(AMO_STATUS_ID);

  const r = await post(`${base}/leads/complex`, {
    method: "POST", headers: auth, body: JSON.stringify([lead])
  });
  if (!r.ok) throw new Error(`amoCRM ${r.status}: ${await r.text()}`);

  const created = await r.json();
  const leadId = Array.isArray(created) && created[0] && created[0].id;
  if (!leadId) return { ok: true, note: false };

  // Kalkulyator raqamlari va mahsulot turi izoh sifatida qo'shiladi —
  // shunda menejer bitimni ochishi bilan mijoz nimaga asoslanganini ko'radi.
  try {
    await post(`${base}/leads/${leadId}/notes`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify([{ note_type: "common", params: { text } }])
    });
  } catch (e) {
    console.error("amoCRM izoh qo'shilmadi:", e.message);
  }
  return { ok: true, leadId };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const hasTelegram = process.env.BOT_TOKEN && process.env.CHAT_ID;
  const hasAmo      = process.env.AMO_SUBDOMAIN && process.env.AMO_TOKEN;
  if (!hasTelegram && !hasAmo) {
    console.error("Na Telegram, na amoCRM sozlanmagan");
    return res.status(500).json({ error: "Server sozlanmagan" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const d = {
    name:    clean(body.name, LIMITS.name),
    phone:   clean(body.phone, LIMITS.phone),
    company: clean(body.company, LIMITS.company),
    comment: clean(body.comment, LIMITS.comment)
  };
  if (!d.name || d.phone.replace(/\D/g, "").length < 9) {
    return res.status(400).json({ error: "Ism yoki telefon noto'g'ri" });
  }

  const text = clean(body.text, LIMITS.text) ||
    `GlossPak — yangi ariza\n\nIsm: ${d.name}\nTelefon: ${d.phone}\n` +
    `Korxona: ${d.company || "—"}\nMahsulot turi: ${d.comment || "—"}`;

  // Ikkalasi parallel: biri sekin bo'lsa, ikkinchisini kutib turmaydi
  const [tg, amo] = await Promise.allSettled([sendTelegram(text), sendAmo(d, text)]);

  const failed = [];
  if (tg.status  === "rejected"){ console.error(tg.reason);  failed.push("telegram"); }
  if (amo.status === "rejected"){ console.error(amo.reason); failed.push("amocrm"); }

  const delivered =
    (tg.status  === "fulfilled" && !tg.value.skipped) ||
    (amo.status === "fulfilled" && !amo.value.skipped);

  // Kamida bitta joyga yetib borgan bo'lsa, ariza yo'qolmadi —
  // mijozga xato ko'rsatishning hojati yo'q.
  if (delivered) return res.status(200).json({ ok: true, failed });

  return res.status(502).json({ error: "Yuborilmadi" });
};
