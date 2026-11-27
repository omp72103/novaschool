// NovaSchool AI proxy — keeps the API key on the server. Set ANTHROPIC_API_KEY in Vercel.
const hits = new Map();
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ code: "method_not_allowed" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ code: "unavailable", message: "AI key not configured" });
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0] || "anon", now = Date.now();
  const h = (hits.get(ip) || []).filter(t => now - t < 60000); h.push(now); hits.set(ip, h);
  if (h.length > 20) return res.status(429).json({ code: "rate_limited" });
  let body = req.body; if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const msgs = [];
  for (const m of (body && Array.isArray(body.messages) ? body.messages : []).slice(-20)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || !m.content.trim()) continue;
    const c = m.content.slice(0, 12000);
    if (msgs.length && msgs[msgs.length - 1].role === m.role) msgs[msgs.length - 1].content += "\n\n" + c; else msgs.push({ role: m.role, content: c });
  }
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return res.status(400).json({ code: "invalid_argument" });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.AI_MODEL || "claude-sonnet-5-5", max_tokens: 2500, messages: msgs })
    });
    if (r.status === 429) return res.status(429).json({ code: "rate_limited" });
    if (!r.ok) { console.error("AI error", r.status, await r.text()); return res.status(502).json({ code: "unavailable" }); }
    const j = await r.json();
    return res.status(200).json({ text: (j.content || []).filter(c => c.type === "text").map(c => c.text).join("") });
  } catch (e) { console.error(e); return res.status(502).json({ code: "unavailable" }); }
};
