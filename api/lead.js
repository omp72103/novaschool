// Demo bookings and contact messages. Every request is written to the Vercel logs (search "NOVASCHOOL_LEAD").
// Optional: set LEAD_WEBHOOK_URL (e.g. a Google Apps Script, Zapier or Slack webhook) to also forward each one.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  let b = req.body; if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  const s = v => String(v == null ? "" : v).slice(0, 2000);
  const lead = { kind: b.kind === "messages" ? "message" : "demo", name: s(b.name), phone: s(b.phone), email: s(b.email), board: s(b.board), cls: s(b.cls), date: s(b.date), time: s(b.time), topic: s(b.topic), msg: s(b.msg), at: new Date().toISOString() };
  if (lead.name.length < 2 || !/^(\+?91)?[6-9]\d{9}$/.test(lead.phone.replace(/[\s-]/g, ""))) return res.status(400).json({ ok: false, code: "invalid_argument" });
  console.log("NOVASCHOOL_LEAD " + JSON.stringify(lead));
  if (process.env.LEAD_WEBHOOK_URL) {
    try { await fetch(process.env.LEAD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) }); } catch (e) { console.error("webhook failed", e); }
  }
  return res.status(200).json({ ok: true });
};
