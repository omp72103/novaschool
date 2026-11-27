/* NovaSchool — application (router, pages, accounts, AI tutor, lessons, dashboard, tests) */
{
  const NS = window.NS, B = NS.BRAND;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today = () => new Date().toLocaleDateString("en-CA");
  const inr = n => "₹" + n.toLocaleString("en-IN");
  const app = $("#app");

  /* ---------- icons ---------- */
  const I = {
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.5 10a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4"/><circle cx="12" cy="16.5" r=".6"/>',
    check: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 3 3 5-6"/>',
    pointer: '<path d="m9 9 5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 5.1M5.1 8l-2.9-.8M14 4.1 12 6M6 12l-1.9 2"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    lang: '<path d="M4 5h8M8 3v2c0 4-2 7-5 9M6 9c1 2 3 4 6 5"/><path d="m13 21 4-10 4 10M14.5 17h5"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    play: '<path d="m6 4 14 8-14 8z"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/>',
    speaker: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    atom: '<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
    flask: '<path d="M9 3h6M10 3v6L4 20a1 1 0 0 0 1 1.5h14a1 1 0 0 0 1-1.5L14 9V3"/><path d="M7 15h10"/>',
    sigma: '<path d="M18 4H6l6 8-6 8h12"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 5-10 16-10 0 11-4 17-9 17z"/><path d="M4 21c4-6 8-9 12-11"/>',
    code: '<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16v-9"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    tick: '<path d="m5 12 5 5L20 7"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    robot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 14h.01M15 14h.01M2 13v3M22 13v3"/><circle cx="12" cy="3" r="1"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    ruler: '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4z"/><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    sqrt: '<path d="M3 13h3l3 7 5-16h7"/>',
    star: '<path d="m12 2 3 7 7 .6-5.3 4.7L18.2 22 12 18l-6.2 4 1.5-7.7L2 9.6 9 9z"/>'
  };
  const ic = (n, c = "icon") => `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ""}</svg>`;
  const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="nsLogoGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff904d"/><stop offset="1" stop-color="#ff5f6d"/></linearGradient></defs><path d="M5 31c5-2.5 10-2.5 15 0 5-2.5 10-2.5 15 0V15c-5-2.5-10-2.5-15 0-5-2.5-10-2.5-15 0z" fill="#1d3354" stroke="#6fa3d6" stroke-width="2" stroke-linejoin="round"/><path d="M20 15v16" stroke="#6fa3d6" stroke-width="2"/><path d="M20 1l2.6 6.4L29 10l-6.4 2.6L20 19l-2.6-6.4L11 10l6.4-2.6z" fill="url(#nsLogoGrad)"/></svg>`;

  /* ---------- storage + platform capabilities ---------- */
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } } };
  const blank = () => ({ profile: null, plan: "starter", billing: "m", progress: {}, tq: {}, activity: {}, log: [], tests: [], revision: null, guestLabs: [], updatedAt: 0 });
  let S = Object.assign(blank(), LS.get("ns_state", {}));
  const use = n => (window.claude && window.claude.use ? window.claude.use(n).catch(() => null) : Promise.resolve(null));
  const caps = { db: null, user: null, uid: null, sample: null, dict: null, tts: null, owner: false };
  const pSample = use("sample").then(x => caps.sample = x);
  use("dictation").then(x => { caps.dict = x; if (x) { x.onPartial(({ text }) => dictCb.partial && dictCb.partial(text)); x.onFinal(({ text }) => dictCb.final && dictCb.final(text)); x.onState(({ state }) => dictCb.state && dictCb.state(state)); } refreshVoice(); });
  use("tts").then(x => { caps.tts = x; refreshVoice(); });
  const dictCb = {};
  const remoteReady = (async () => {
    const [db, user] = await Promise.all([use("db"), use("user")]);
    caps.db = db; caps.user = user;
    if (user) { try { caps.uid = await user.id(); caps.owner = !!(await user.isOwner()); } catch { } }
    if (db && caps.uid) {
      try {
        const snap = await Promise.race([db.doc(`data/users/${caps.uid}/state`).get(), new Promise((_, r) => setTimeout(() => r("timeout"), 10000))]);
        if (snap.exists) { const r = snap.data(); if ((r.updatedAt || 0) > (S.updatedAt || 0)) { S = Object.assign(blank(), JSON.parse(JSON.stringify(r))); LS.set("ns_state", S); renderChrome(); route(); } }
        else if (S.profile) save();
      } catch { }
    }
    if (caps.owner) renderChrome();
  })();
  let saveT = null, writing = Promise.resolve();
  function save() {
    S.updatedAt = Date.now(); LS.set("ns_state", S);
    clearTimeout(saveT);
    saveT = setTimeout(() => { if (caps.db && caps.uid) { const body = JSON.parse(JSON.stringify(S)); writing = writing.then(() => caps.db.doc(`data/users/${caps.uid}/state`).set(body)).catch(() => { }); } }, 1500);
  }

  /* ---------- plan helpers ---------- */
  const PAID = () => S.plan === "scholar" || S.plan === "achiever";
  const ACH = () => S.plan === "achiever";
  const planName = () => NS.PLANS.find(p => p.id === S.plan).name;
  const tqToday = () => S.tq[today()] || 0;
  const canAsk = () => PAID() || tqToday() < 5;
  const labOpen = id => PAID() || NS.FREE_LABS.includes(id);
  const chapterOpen = i => i === 0 || PAID();
  function logAct(type, label) { S.log.unshift({ type, label, date: today(), t: Date.now() }); S.log = S.log.slice(0, 200); save(); }
  setInterval(() => { if (S.profile && document.visibilityState === "visible") { S.activity[today()] = (S.activity[today()] || 0) + 1; save(); } }, 60000);

  /* ---------- AI ---------- */
  async function ai(messages, opts = {}) {
    await Promise.race([pSample, new Promise(r => setTimeout(r, 3000))]);
    if (caps.sample) { const r = await caps.sample(messages, { cache: false, ...opts }); return r.text; }
    if (NS.CONFIG.aiEndpoint) {
      let res; try { res = await fetch(NS.CONFIG.aiEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }), signal: opts.signal }); } catch (e) { if (e && e.name === "AbortError") throw e; throw { code: "unavailable" }; }
      let j = {}; try { j = await res.json(); } catch { }
      if (!res.ok || typeof j.text !== "string") throw { code: res.status === 429 ? "rate_limited" : (j.code || "unavailable") };
      opts.onText && opts.onText({ text: j.text }); return j.text;
    }
    throw { code: "unavailable", message: "AI is not connected in this view." };
  }
  const aiErr = e => e && e.code === "rate_limited" ? "Nova is busy right now. Please wait a moment and try again." : e && e.code === "not_granted" ? "AI access was not allowed in this view, so Nova can't answer here." : "Nova can't answer right now. Please try again in a minute — if it keeps happening, let us know.";
  function md(t) {
    const inl = s => s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
    let out = "", list = null; const flush = () => { if (list) { out += `</${list}>`; list = null; } };
    for (const l of esc(t).split("\n")) { let m;
      if ((m = l.match(/^#{1,4}\s+(.*)/))) { flush(); out += `<h3>${inl(m[1])}</h3>`; }
      else if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { if (list !== "ul") { flush(); out += "<ul>"; list = "ul"; } out += `<li>${inl(m[1])}</li>`; }
      else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== "ol") { flush(); out += "<ol>"; list = "ol"; } out += `<li>${inl(m[1])}</li>`; }
      else if (!l.trim()) flush(); else { flush(); out += `<p>${inl(l)}</p>`; } }
    flush(); return out;
  }
  const who = () => { const p = S.profile; return p ? `a Class ${p.cls} ${NS.BOARDS.find(b => b.id === p.board).name} student${+p.cls >= 11 ? " (" + p.stream + ")" : ""}` : "a school student in India (Classes 5–12)"; };
  const tutorRules = lang => `You are Nova, the friendly and patient AI tutor of ${B.name}. You are talking with ${who()}.
Rules:
- Stay on school learning (any subject, study skills, exam prep). Politely steer away from anything unrelated or unsuitable for children.
- Never ask for personal details such as address, school name, phone or photos.
- Explain step by step in short paragraphs, using simple examples from Indian everyday life. Write maths in plain text (√, ², ×, ÷, fractions like 3/4).
- If the student asks for a homework answer, give a hint and guide them first, then the full working if they still need it.
- When you teach a concept, end with one short check-your-understanding question.
- Reply in ${lang === "Hindi" ? "Hindi (Devanagari script)" : lang === "Hinglish" ? "Hinglish (Hindi written in Roman script mixed with English)" : "simple English"}.
- Keep replies under 220 words unless asked for more. You may use **bold**, short lists and ### headings.`;

  /* ---------- UI helpers ---------- */
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 3200); }
  function modal(html, mount) { const m = $("#modal"); m.innerHTML = `<div class="card" role="dialog" aria-modal="true">${html}</div>`; m.classList.add("open"); m.onclick = e => { if (e.target === m || e.target.closest("[data-close]")) closeModal(); }; mount && mount(m); }
  function closeModal() { $("#modal").classList.remove("open"); }
  async function copy(text) { try { await navigator.clipboard.writeText(text); toast("Copied to clipboard"); } catch { toast("Couldn't copy — select the text and copy it manually."); } }
  const sec = (eyebrow, title, lead, center = true) => `<div class="head ${center ? "center" : ""}">${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}<h2>${title}</h2>${lead ? `<p class="lead">${lead}</p>` : ""}</div>`;
  const crumbs = list => `<nav class="crumbs" aria-label="Breadcrumb">${list.map(([t, h]) => h ? `<a href="#${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`).join(" / ")}</nav>`;
  const lockPane = (title, text) => `<div class="card lockpane">${ic("lock")}<h3>${esc(title)}</h3><p class="muted" style="margin:8px 0 18px">${esc(text)}</p><a class="btn btn-blue" href="#plans">See plans</a></div>`;

  /* ---------- chrome: header + footer ---------- */
  const NAV = [["home", "Home"], ["about", "About Us"], ["programmes", "Programmes"], ["labs", "Labs"], ["plans", "Plans"]];
  function renderChrome() {
    const p = S.profile, init = p ? p.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase() : "";
    $("#top").innerHTML = `<div class="wrap">
      <a class="logo" href="#home" aria-label="${B.name} home">${LOGO}<span><b>${B.first}<span>${B.second}</span></b><i>— BY ${B.parent} —</i></span></a>
      <nav class="nav" aria-label="Main">${NAV.map(([h, t]) => `<a href="#${h}" data-nav="${h}">${t}</a>`).join("")}</nav>
      <div class="right">
        <button class="userbtn" id="ubtn" aria-haspopup="true" aria-label="Account menu">${p ? `<span class="avatar">${esc(init)}</span>` : `<span class="avatar">${ic("user")}</span>`}${ic("down")}</button>
        <a class="btn btn-or" href="#book-demo">${ic("cal")}<span class="lbl">Book a Free Demo</span></a>
        <button class="burger" id="burger" aria-label="Open menu">${ic("menu")}</button>
      </div></div>
      <div class="menu" id="umenu">${p ? `<div class="who"><b style="color:#fff">${esc(p.name)}</b><div class="tiny">${esc(p.role)} · ${planName()} plan</div></div>
        <a href="#dashboard">${ic("chart")} Dashboard</a><a href="#tutor">${ic("robot")} AI Tutor</a><a href="#course-${courseKeyFor(p)}">${ic("book")} My subjects</a><a href="#plans">${ic("star")} Plans</a>${caps.owner ? `<a href="#admin">${ic("shield")} Admin: leads</a>` : ""}<button id="signout">${ic("logout")} Sign out</button>`
        : `<a href="#login">${ic("user")} Student Login</a><a href="#login">${ic("cap")} Create free account</a><a href="#book-demo">${ic("cal")} Book a free demo</a>${caps.owner ? `<a href="#admin">${ic("shield")} Admin: leads</a>` : ""}`}</div>
      <nav class="mnav" id="mnav" aria-label="Mobile">${NAV.map(([h, t]) => `<a href="#${h}">${t}</a>`).join("")}<a href="#tutor">AI Tutor</a><a href="${p ? "#dashboard" : "#login"}">${p ? "Dashboard" : "Student Login"}</a></nav>`;
    $("#ubtn").onclick = e => { e.stopPropagation(); $("#umenu").classList.toggle("open"); };
    $("#burger").onclick = () => $("#mnav").classList.toggle("open");
    const so = $("#signout"); if (so) so.onclick = () => { S.profile = null; S.plan = "starter"; save(); renderChrome(); location.hash = "home"; toast("Signed out"); };
    $("#foot").innerHTML = `<div class="wrap"><div class="fgrid">
      <div><a class="logo" href="#home">${LOGO}<span><b>${B.first}<span>${B.second}</span></b><i>— BY ${B.parent} —</i></span></a>
        <p class="muted small" style="margin:14px 0">Next-gen, AI-powered personalised learning for Classes 5 to 12.</p>
        <ul><li><a href="tel:${B.phone.replace(/\s/g, "")}">${ic("phone")} ${B.phone}</a></li><li><a href="mailto:${B.email}">${ic("mail")} ${B.email}</a></li><li class="muted small" style="display:flex;gap:6px">${ic("pin")} ${B.address}</li></ul></div>
      <div><h4>Quick links</h4><ul><li><a href="#about">About</a></li><li><a href="#programmes">Programmes</a></li><li><a href="#labs">Labs / Experiments</a></li><li><a href="#plans">Plans</a></li><li><a href="#login">Student Login</a></li><li><a href="#tutor">AI Tutor</a></li></ul></div>
      <div><h4>Support</h4><ul><li><a href="#contact">Contact us</a></li><li><a href="#book-demo">Book a free demo</a></li><li><a href="#child-safety">Child safety</a></li><li><a href="#accessibility">Accessibility</a></li></ul></div>
      <div><h4>Legal</h4><ul><li><a href="#privacy">Privacy policy</a></li><li><a href="#terms">Terms of use</a></li><li><a href="#cookies">Cookie policy</a></li></ul>
        <h4 style="margin-top:20px">Follow us</h4><div class="social" title="Coming soon">${["in", "ig", "yt", "fb", "x"].map(s => `<span>${s}</span>`).join("")}</div><p class="tiny" style="margin-top:6px">Social channels coming soon</p></div>
    </div><div class="copy"><span>© ${new Date().getFullYear()} ${B.company}. All rights reserved.</span><span>Made in India for curious students</span></div></div>`;
  }
  document.addEventListener("click", e => { if (!e.target.closest("#ubtn")) $("#umenu")?.classList.remove("open"); if (e.target.closest("#mnav a")) $("#mnav").classList.remove("open"); });
  const courseKeyFor = p => { const subs = NS.subjectsFor(p.board, p.cls, p.stream); return `${p.board}-${p.cls}-${subs[0].slug}`; };

  /* ---------- path selector (home + programmes) ---------- */
  const pathState = { board: LS.get("ns_path", {}).board || "cbse", cls: LS.get("ns_path", {}).cls || 8, stream: LS.get("ns_path", {}).stream || "PCM" };
  if (S.profile) Object.assign(pathState, { board: S.profile.board, cls: +S.profile.cls, stream: S.profile.stream || "PCM" });
  function pathHTML() {
    const { board, cls, stream } = pathState, subs = NS.subjectsFor(board, cls, stream);
    return `<div class="path">
      <div class="step"><div class="stephead"><span class="n">1</span><b>Board</b><em>${NS.BOARDS.find(b => b.id === board).name}</em></div>
        ${NS.BOARDS.map(b => `<button class="opt ${b.id === board ? "on" : ""}" data-board="${b.id}"><b>${b.name}</b><span>${b.full}</span></button>`).join("")}</div>
      <div class="step"><div class="stephead"><span class="n">2</span><b>Class</b><em>Class ${cls}</em></div>
        <div class="classes">${NS.CLASSES.map(c => `<button class="cls ${c === +cls ? "on" : ""}" data-cls="${c}"><small>CLASS</small><b>${c}</b></button>`).join("")}</div>
        <p class="tiny" style="margin-top:12px">${NS.BOARDS.find(b => b.id === board).name} · ${NS.boardStage(board, cls)}</p>
        ${+cls >= 11 ? `<p class="small" style="margin:14px 0 8px;color:#fff;font-weight:600">Stream</p><div class="streams">${Object.keys(NS.STREAMS).map(s => `<button class="chip ${s === stream ? "on" : ""}" data-stream="${s}">${s}</button>`).join("")}</div><p class="tiny">${NS.STREAMS[stream]}</p>` : ""}</div>
      <div class="step"><div class="stephead"><span class="n">3</span><b>Subject</b><em>${subs.length} subjects</em></div>
        ${subs.map(s => `<a class="subj" href="#course-${board}-${cls}-${s.slug}"><span class="si">${ic(s.icon)}</span><span><b>${esc(s.name)}</b><small>${s.chapters.length} chapters</small></span><span class="arr">${ic("arrow")}</span></a>`).join("")}</div></div>`;
  }
  function mountPath(el) {
    const draw = () => { el.innerHTML = pathHTML(); };
    el.onclick = e => { const b = e.target.closest("[data-board],[data-cls],[data-stream]"); if (!b) return; if (b.dataset.board) pathState.board = b.dataset.board; if (b.dataset.cls) pathState.cls = +b.dataset.cls; if (b.dataset.stream) pathState.stream = b.dataset.stream; LS.set("ns_path", pathState); draw(); };
    draw();
  }

  /* ---------- lab cards ---------- */
  const labCard = l => `<article class="card labcard"><div class="thumb"><canvas data-thumb="${l.id}"></canvas></div><div class="body">
    <div class="tags"><span class="tag">${esc(l.subj)}</span><span class="tag or">Class ${l.cls}</span>${labOpen(l.id) ? "" : `<span class="tag lock">${ic("lock", "icon")} Scholar</span>`}</div>
    <h3>${esc(l.name)}</h3><p>${esc(l.desc)}</p><a class="btn btn-ghost btn-sm" href="#lab-${l.id}">Open lab ${ic("arrow")}</a></div></article>`;
  const drawThumbs = root => requestAnimationFrame(() => $$("canvas[data-thumb]", root).forEach(c => NS.thumbLab(c, c.dataset.thumb)));

  /* ---------- active lab instances ---------- */
  let cleanups = [];
  const onLeave = f => cleanups.push(f);

  /* ================= PAGES ================= */
  const P = {};

  P.home = () => ({
    html: `
    <section class="hero"><canvas id="sky" aria-hidden="true"></canvas><span class="glow a"></span><span class="glow b"></span><div class="wrap">
      <div><span class="pill">${B.name} · ${B.tagline}</span>
        <h1 class="words">${["AI-powered", '<span class="hl">personalised</span>', '<span class="hl">learning</span>', "for", "every", "student"].map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(" ")}</h1>
        <p class="lead">A patient AI tutor, hands-on virtual labs and chapter-wise lessons that follow your syllabus and move at your pace.</p>
        <div class="ctas"><a class="btn btn-blue" href="#book-demo">${ic("cal")} Book a Free Demo</a><a class="btn btn-ghost" href="#programmes">Explore Programmes ${ic("arrow")}</a></div>
        <div class="facts"><span>${ic("book")} CBSE · ICSE · IB · Cambridge</span><span>${ic("cap")} Classes 5–12</span><span>${ic("lang")} English, Hindi and Hinglish</span></div></div>
      <div class="orbit" aria-label="Nova answering a student's question">
        <svg class="ring" viewBox="0 0 400 400"><circle cx="200" cy="200" r="185" fill="none" stroke="rgba(255,255,255,.12)" stroke-dasharray="4 8"/><circle cx="200" cy="200" r="150" fill="#181b24"/><circle cx="200" cy="200" r="150" fill="none" stroke="rgba(111,163,214,.18)"/></svg>
        <span class="tile" style="left:52%;top:2%;background:linear-gradient(135deg,#ff904d,#ff6b3d);color:#fff">${ic("sqrt")}</span>
        <span class="tile" style="right:6%;top:14%;background:linear-gradient(135deg,#ffb347,#ff904d);color:#fff;animation-delay:-1s">${ic("bulb")}</span>
        <span class="tile" style="left:2%;top:30%;background:#fff;color:#2f6db5;animation-delay:-2s">${ic("atom")}</span>
        <span class="tile" style="left:4%;top:56%;background:linear-gradient(135deg,#2f6db5,#1d4f8f);color:#fff;animation-delay:-3s">${ic("code")}</span>
        <span class="tile" style="right:2%;top:58%;background:linear-gradient(135deg,#4f86c0,#2f6db5);color:#fff;animation-delay:-1.5s">${ic("ruler")}</span>
        <span class="tile" style="left:40%;bottom:2%;background:#fff;color:#ff6b3d;animation-delay:-2.5s">${ic("flask")}</span>
        <div class="chatcard"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span class="avatar" style="width:34px;height:34px;color:var(--or)">${ic("robot")}</span><div><b style="color:#fff;font:700 14px var(--hf)">Nova</b><div class="tiny">Your Personal Tutor · online</div></div></div>
          <div class="bubble q" id="heroQ">What is √144?</div><div class="bubble a" id="heroA"><b>√144 = 12</b>because 12 × 12 = 144</div></div>
      </div></div></section>

    <section><div class="wrap"><div class="statstrip">${(() => { const st = NS.stats(); return [[st.boards, "", "boards"], [st.classes, "", "classes (5–12)"], [st.subjects, "", "subject courses"], [st.chapters, "", "chapters"], [st.lectures, "+", "AI lectures"], [st.labs, "", "interactive labs"]].map(([n, suf, l]) => `<div class="sc"><b data-count="${n}" data-suffix="${suf}">0</b><span>${l}</span></div>`).join(""); })()}</div></div></section>

    <section class="ribbons" aria-hidden="true">${[["CBSE", "ICSE", "IB", "Cambridge", "Classes 5–12", "English", "Hindi", "Hinglish", "AI Tutor", "Mock exams", "Revision plans", "Parent reports"], NS.LABS.map(l => l.name)].map((row, k) => `<div class="rib r${k + 1}"><div class="rtrack">${[...row, ...row].map((w, i) => `<span class="${i % 2 ? "o" : ""}">${esc(w)}</span><i>✦</i>`).join("")}</div></div>`).join("")}</section>

    <section class="band" id="path"><div class="wrap">${sec("Find your path", "Start with your board and class", "Pick a board and a class, and your subjects appear.")}<div id="pathbox"></div></div></section>

    <section class="deck"><div class="decksticky"><div class="wrap">${sec("Why " + B.name, "Learning that fits each student", "Six reasons families switch — flying in as you scroll.")}
      <div class="grid g3 deckgrid">${NS.WHY.map(([t, d, i, c], n) => `<div class="card feat" style="--c:${c}"><span class="num">0${n + 1}</span><span class="ic">${ic(i)}</span><h3>${t}</h3><p>${d}</p><svg class="ghost" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5">${I[i]}</svg></div>`).join("")}</div></div></div></section>

    <section class="hs"><div class="hsticky"><div class="wrap">${sec("Our AI tutor's approach", "How your Personal Tutor helps ideas stick", "Every explanation is built from the same five blocks. Keep scrolling to walk through them.")}</div>
      <div class="htrack">${NS.BLOCKS.map(([t, d], i) => `<div class="block hcard"><span class="bign">0${i + 1}</span><span class="avatar" style="width:52px;height:52px;color:var(--or)">${ic(["book", "bulb", "gauge", "layers", "check"][i])}</span><small>BLOCK ${i + 1}</small><h3>${t}</h3><p>${d}</p><div class="bar"><i style="width:${(i + 1) * 20}%"></i></div></div>`).join("")}</div>
      <div class="wrap"><div class="hprog"><i></i></div></div></div></section>

    <section class="band alt" id="try-labs"><div class="wrap">${sec("Working labs", "Don't just read it. Try it.", "Real simulations that respond to every change. Try one now.")}
      <div class="labbar"><div class="tabs" id="labtabs" role="tablist">${[["pendulum", "Pendulum"], ["lens", "Lens"], ["magnet", "Magnet"]].map(([id, t], i) => `<button role="tab" data-lab="${id}" class="${i ? "" : "on"}">${t}</button>`).join("")}</div><a class="btn btn-ghost btn-sm" id="openfull" href="#lab-pendulum">Open full lab ${ic("arrow")}</a></div>
      <div id="labhost"></div></div></section>

    <section class="ringsec" aria-label="All ${NS.LABS.length} labs"><div class="ringsticky"><div class="wrap" style="width:100%">${sec("The lab library", `All <span class="grad">${NS.LABS.length} labs</span>, one spin away`, "Scroll to turn the carousel, drag it, or use the arrows. Tap the front card to open that lab.")}</div>
      <div class="ringstage"><div class="lring">${NS.LABS.map(l => `<a class="rcard" href="#lab-${l.id}" data-lab="${l.id}" draggable="false"><div class="rt"><canvas data-thumb="${l.id}"></canvas></div><div class="rb"><div class="tags"><span class="tag">${esc(l.subj)}</span><span class="tag or">${l.cls}</span></div><b>${esc(l.name)}</b><small>${esc(l.desc)}</small></div></a>`).join("")}</div></div>
      <div class="wrap" style="width:100%"><div class="ringcap" id="ringcap"><div><b>${esc(NS.LABS[0].name)}</b><span>${NS.LABS[0].subj} · Class ${NS.LABS[0].cls}</span></div><a class="btn btn-or btn-sm" href="#lab-${NS.LABS[0].id}">Open this lab ${ic("arrow")}</a></div>
      <div class="ringnav"><button class="iconbtn" data-ring="1" aria-label="Previous lab" style="transform:scaleX(-1)">${ic("arrow")}</button><a class="btn btn-ghost btn-sm" href="#labs">Browse all labs</a><button class="iconbtn" data-ring="-1" aria-label="Next lab">${ic("arrow")}</button></div></div></div></section>

    <section class="band alt" style="padding-bottom:0"><div class="wrap">${sec("One platform", "Built for students, parents and schools", "Everything learning creates — progress, scores, time spent, demo requests — flows into clear dashboards for everyone who needs it.")}</div>
      <div class="mgmt"><div class="wrap mgsticky">
        <div class="mgmt-copy">${[["chart", "Student dashboard", "Progress for every subject, lectures completed, a weekly learning chart, chapter tests and an AI revision plan.", "#dashboard", "Open my dashboard"], ["heart", "Parent reports", "A clear summary of progress, scores and time spent, ready to copy and share — on the Achiever plan.", "#plans", "See Achiever"], ["shield", "School management", "Class-wise performance, enrolments and demo requests in one console, for schools that license " + B.name + ".", "#book-demo", "Talk to us"]].map(([i, t, d, h, c], k) => `<button class="mstep ${k ? "" : "on"}" type="button"><b><span class="avatar" style="color:var(--or)">${ic(i)}</span>${t}</b><p>${d} <a href="${h}">${c} →</a></p></button>`).join("")}<p class="tiny">Screens show sample data.</p></div>
        <div class="screens">
          <div class="screen"><div class="chrome"><i></i><i></i><i></i><span>Student dashboard</span></div><div class="mrow"><div class="mk"><small>Overall progress</small><b>62%</b></div><div class="mk"><small>Lectures done</small><b>148</b></div><div class="mk"><small>Day streak</small><b>9</b></div></div>${[["Mathematics", 74], ["Science", 58], ["English", 81], ["Social Science", 40]].map(([n, v]) => `<div class="mbar"><span style="width:110px">${n}</span><span class="progress"><i style="width:${v}%"></i></span><span>${v}%</span></div>`).join("")}<div class="mchart">${[30, 55, 42, 70, 64, 88, 50].map(h => `<i style="height:${h}%"></i>`).join("")}</div></div>
          <div class="screen"><div class="chrome"><i></i><i></i><i></i><span>Parent report · Aarav, Class 8</span></div><div class="mrow"><div class="mk"><small>This week</small><b>3h 20m</b></div><div class="mk"><small>Tests taken</small><b>6</b></div><div class="mk"><small>Average score</small><b>78%</b></div></div><div class="mtable"><div><span>Maths: A Square and A Cube</span><em>9/10</em></div><div><span>Science: Exploring Forces</span><em>8/10</em></div><div><span>Maths mock exam</span><em>15/20</em></div><div><span>Science: Light: Mirrors and Lenses</span><em>7/10</em></div></div><p class="tiny">Strongest: English. Focus next: Social Science chapters 3–4.</p></div>
          <div class="screen"><div class="chrome"><i></i><i></i><i></i><span>School console</span></div><div class="mrow"><div class="mk"><small>Students</small><b>1,240</b></div><div class="mk"><small>Avg. score</small><b>74%</b></div><div class="mk"><small>New demo requests</small><b>32</b></div></div><div class="mtable">${[["Class 10-A", "42 students", "81%"], ["Class 10-B", "40 students", "76%"], ["Class 9-A", "45 students", "72%"], ["Class 8-C", "38 students", "69%"]].map(([a, b, c]) => `<div><span>${a}</span><span>${b}</span><em>${c}</em></div>`).join("")}</div><div class="mchart" style="max-height:90px">${[60, 72, 66, 80, 74, 85, 78, 90].map(h => `<i style="height:${h}%;background:linear-gradient(180deg,var(--bl),var(--bl2))"></i>`).join("")}</div></div>
        </div></div></div></section>

    <section class="band"><div class="wrap">${sec("Human + AI", "Better together", "The best learning blends a tireless AI tutor with caring teachers.")}
      <div class="duo"><div class="card"><h3 style="display:flex;gap:10px;align-items:center"><span class="avatar" style="color:var(--bl)">${ic("robot")}</span>What Nova brings</h3><ul class="list">${NS.AI_SIDE.map(t => `<li>${ic("tick")}<span>${t}</span></li>`).join("").replaceAll('class="icon"', 'class="icon" style="color:var(--bl)"')}</ul></div>
      <div class="card"><h3 style="display:flex;gap:10px;align-items:center"><span class="avatar">${ic("heart")}</span>What teachers bring</h3><ul class="list">${NS.TEACHER_SIDE.map(t => `<li>${ic("tick")}<span>${t}</span></li>`).join("").replaceAll('class="icon"', 'class="icon" style="color:var(--or)"')}</ul></div></div>
      <p class="note">Nova is a learning companion. It is designed to support teachers and parents, not replace them.</p></div></section>

    <section class="band alt"><div class="wrap">${sec("Get started", `Join <span class="grad">${B.name}</span> in 3 easy steps`)}
      <div class="timeline"><div class="steps">${NS.STEPS.map(([t, d], i) => `<div class="card stp"><span class="n">${i + 1}</span><small>Step ${i + 1}</small><h3 style="margin:4px 0 6px">${t}</h3><p class="muted small">${d}</p></div>`).join("")}</div></div>
      <div class="center" style="margin-top:26px"><a class="btn btn-or" href="#book-demo">${ic("cal")} Book Your Demo</a></div></div></section>

    <section class="band"><div class="wrap">${sec("Parents' stories", "What families tell us", "This section is ready for real parent feedback. The cards below are placeholders, not reviews.")}
      <div class="grid g3">${NS.STORIES.map(([tg, q, n, r, c]) => `<div class="card story"><span class="tag">${tg}</span><q>${q}</q><div class="person"><span class="avatar">${ic("user")}</span><span><b>${n}</b><span class="tiny">${r} · ${c}</span></span></div><span class="sample">Placeholder</span></div>`).join("")}</div></div></section>

    <section class="band alt"><div class="wrap">${sec("Blog", "Our blogs", "Study tips and ideas for students and parents.")}
      <div class="grid g3">${NS.BLOG.map(postCard).join("")}</div></div></section>

    <section class="band"><div class="wrap faqwrap"><div><div class="bigfaq">FAQ</div><h2 style="margin-top:10px">Questions parents ask us</h2><p class="lead" style="margin-top:10px">Can't find yours? <a href="#contact">Contact us</a> or book a demo.</p></div>
      <div class="faq">${NS.FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div></section>

    <section class="band" style="padding-top:0"><div class="wrap"><div class="cta"><div><h2>See it for yourself in a free 30-minute demo</h2><p class="lead" style="margin-top:8px">Your child tries Nova and the labs on a topic of your choice. Prefer to talk? Call ${B.phone}.</p></div><div class="ctas" style="margin:0"><a class="btn btn-or" href="#book-demo">${ic("cal")} Book a Free Demo</a><a class="btn btn-ghost" href="tel:${B.phone.replace(/\s/g, "")}">${ic("phone")} Call us</a></div></div></div></section>`,
    mount() {
      mountPath($("#pathbox"));
      let inst = NS.mountLab($("#labhost"), "pendulum", { h: 420, ask: openTutorWith }); onLeave(() => inst.destroy());
      $("#labtabs").onclick = e => { const b = e.target.closest("button"); if (!b) return; $$("#labtabs button").forEach(x => x.classList.toggle("on", x === b)); inst.destroy(); inst = NS.mountLab($("#labhost"), b.dataset.lab, { h: 420, ask: openTutorWith }); $("#openfull").href = "#lab-" + b.dataset.lab; };
      drawThumbs(app);
      const qa = [["What is √144?", "√144 = 12", "because 12 × 12 = 144"], ["Why do we see lightning before thunder?", "Light is faster", "light ≈ 3 × 10⁸ m/s, sound ≈ 343 m/s"], ["Solve 2x + 3 = 11", "x = 4", "2x = 8, so x = 8 ÷ 2"], ["What gas do plants release?", "Oxygen (O₂)", "made during photosynthesis"]];
      let k = 0; const qEl = $("#heroQ"), aEl = $("#heroA");
      const tick = () => { if (!document.body.contains(qEl)) return; k = (k + 1) % qa.length; qEl.textContent = qa[k][0]; aEl.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; setTimeout(() => { if (!document.body.contains(aEl)) return; aEl.innerHTML = `<b>${esc(qa[k][1])}</b>${esc(qa[k][2])}`; }, 1300); };
      const iv = setInterval(tick, 4500); onLeave(() => clearInterval(iv));
      if (NS.mountHomeFx) { const off = NS.mountHomeFx(app, id => { location.hash = "lab-" + id; }); onLeave(off); }
      if (NS.mountScene3D) { const off3 = NS.mountScene3D(); onLeave(off3); }
    }
  });

  const COVERS = { "Study tips": ["#8b5cf6", "book"], "AI and learning": ["#2f6db5", "robot"], "Science at home": ["#14b8a6", "flask"], Physics: ["#ff904d", "atom"], "Study skills": ["#ec4899", "bulb"] };
  function postCard(p) { const [c, i] = COVERS[p.cat] || ["#2f6db5", "book"]; return `<a class="card post" href="#blog-${p.id}"><div class="cover" style="background:linear-gradient(135deg,${c},#1b1d24)">${ic(i)}</div><div class="body"><div class="tags"><span class="tag">${p.cat}</span>${p.featured ? '<span class="tag or">Featured</span>' : ""}</div><h3>${esc(p.title)}</h3><span class="tiny">${p.date} · ${p.mins} min read</span></div></a>`; }

  P.about = () => {
    const L = NS.LEGAL.about;
    return `<section class="phead"><div class="wrap">${crumbs([["Home", "home"], ["About us"]])}<span class="eyebrow">About us</span><h1>Every student deserves a patient tutor</h1><p class="lead" style="margin-top:14px">${B.name} combines an AI Personal Tutor, chapter-wise lessons and interactive labs to make learning personal, visual and fun.</p></div></section>
    <section class="band" style="padding-top:10px"><div class="wrap"><div class="grid g2">${L.body.map(([h, t], i) => `<div class="card feat" style="--c:${["#ff904d", "#6fa3d6", "#3ecf8e", "#ec4899"][i]}"><h3>${h}</h3><p style="margin-top:8px">${t}</p></div>`).join("")}</div>
    <div class="grid g4" style="margin-top:28px">${[["4", "boards"], ["8", "classes (5–12)"], [String(NS.LABS.length), "interactive labs"], ["3", "languages"]].map(([n, l]) => `<div class="card stat center"><b style="font-size:40px;color:var(--or)">${n}</b><small>${l}</small></div>`).join("")}</div>
    <div class="cta" style="margin-top:36px"><h2>Want to see how it works?</h2><a class="btn btn-or" href="#book-demo">${ic("cal")} Book a Free Demo</a></div></div></section>`;
  };

  P.programmes = () => ({
    html: `<section class="phead"><div class="wrap">${crumbs([["Home", "home"], ["Programmes"]])}<span class="eyebrow">Programmes</span><h1>Programmes for every board, class and subject</h1><p class="lead" style="margin-top:14px">Choose your board and class to see every subject and chapter. Chapter 1 of every subject is free.</p></div></section>
    <section class="band" style="padding-top:10px"><div class="wrap"><div id="pathbox"></div>
      <div class="grid g4" style="margin-top:36px">${NS.BOARDS.map(b => `<div class="card"><span class="tag or">${b.name}</span><h3 style="margin:10px 0 6px">${b.full}</h3><p class="muted small">${b.id === "cbse" ? "NCERT-aligned chapters for Classes 5–12, with PCM, PCB and PCMB for seniors." : b.id === "icse" ? "ICSE (9–10) with separate Physics, Chemistry and Biology, and ISC for 11–12." : b.id === "ib" ? "PYP, MYP and Diploma Programme, including DP Physics, Chemistry, Biology and Maths AA." : "Primary, Lower Secondary, IGCSE and AS & A Level syllabus topics."}</p></div>`).join("")}</div></div></section>`,
    mount() { mountPath($("#pathbox")); }
  });

  /* ----- course & chapter ----- */
  function findCourse(board, cls, slug) { const all = [...NS.subjectsFor(board, cls, "PCMB"), ...NS.subjectsFor(board, cls, "PCM")]; return all.find(s => s.slug === slug); }
  const prog = (key, i) => S.progress[`${key}:${i}`] || [false, false, false, false];
  function courseStats(key, sub) { let done = 0; sub.chapters.forEach((_, i) => done += prog(key, i).filter(Boolean).length); return { done, total: sub.chapters.length * 4, pct: Math.round(done / (sub.chapters.length * 4) * 100) }; }
  function parseCourse(arg) { const [board, cls, ...rest] = arg.split("-"); return { board, cls: +cls, slug: rest.join("-") }; }

  P.course = arg => {
    const { board, cls, slug } = parseCourse(arg), sub = findCourse(board, cls, slug);
    if (!sub || !NS.BOARDS.find(b => b.id === board)) return notFound();
    const key = `${board}-${cls}-${slug}`, st = courseStats(key, sub), bn = NS.BOARDS.find(b => b.id === board).name, half = Math.ceil(sub.chapters.length / 2);
    const row = (t, i) => { const p = prog(key, i), d = p.filter(Boolean).length, open = chapterOpen(i); return `<a class="chapter" href="#chapter-${key}-${i + 1}"><span class="cn">${i + 1}</span><span><b>${esc(t)}</b><span class="tiny">${open ? `${NS.LECTURES.length} lectures · ${d} of 4 done` : "Unlocks with a plan"}</span></span><span class="st">${i === 0 ? '<span class="tag or">Free</span>' : ""}${open ? (d === 4 ? `<span class="tag" style="color:var(--ok)">Done</span>` : ic("play")) : ic("lock")}</span></a>`; };
    return `<section class="phead"><div class="wrap">${crumbs([["Home", "home"], ["Programmes", "programmes"], [`${bn} Class ${cls}`, "programmes"], [sub.name]])}
      <span class="eyebrow">${bn} · Class ${cls} · ${NS.boardStage(board, cls)}</span><h1>${esc(sub.name)}</h1>
      <div style="max-width:520px;margin-top:20px"><div style="display:flex;justify-content:space-between" class="small"><span>Overall progress</span><b>${st.pct}%</b></div><div class="progress" style="margin-top:8px"><i style="width:${st.pct}%"></i></div><p class="tiny" style="margin-top:6px">${sub.chapters.length} chapters · ${st.done} of ${st.total} lectures done</p></div></div></section>
    <section class="band" style="padding-top:10px"><div class="wrap coursegrid"><div>
      <h3 style="margin-bottom:12px">Part I · ${half} chapters</h3>${sub.chapters.slice(0, half).map((t, i) => row(t, i)).join("")}
      ${sub.chapters.length > half ? `<h3 style="margin:26px 0 12px">Part II · ${sub.chapters.length - half} chapters</h3>${sub.chapters.slice(half).map((t, i) => row(t, i + half)).join("")}` : ""}</div>
      <aside class="side"><div class="card"><h3>Chapter 1 is free</h3><p class="muted small" style="margin:8px 0 14px">Chapter 1 of every subject is free. The other chapters unlock with Scholar or Achiever.</p>${PAID() ? `<span class="tag" style="color:var(--ok)">${planName()} plan active</span>` : `<a class="btn btn-or" href="#plans">Unlock all chapters</a>`}</div>
      <div class="card"><h3 style="display:flex;gap:8px;align-items:center">${ic("robot")} Stuck on something?</h3><p class="muted small" style="margin:8px 0 14px">Ask Nova anything about ${esc(sub.name)}, any time.</p><button class="btn btn-blue" data-asksub>Ask Nova</button></div>
      <div class="card"><h3>Try a lab</h3><p class="muted small" style="margin:8px 0 14px">See ideas in action with interactive simulations.</p><a class="btn btn-ghost" href="#labs">Browse labs</a></div></aside></div></section>`;
  };
  P.course.mount = arg => { const { board, cls, slug } = parseCourse(arg), sub = findCourse(board, cls, slug); const b = $("[data-asksub]"); if (b && sub) b.onclick = () => openTutorWith(`I'm studying ${sub.name} (Class ${cls}). Can you give me an overview of the most important topics and how to study them?`); };

  P.chapter = arg => {
    const parts = arg.split("-"), n = +parts.pop(), c = parseCourse(parts.join("-")), sub = findCourse(c.board, c.cls, c.slug);
    if (!sub || !sub.chapters[n - 1]) return notFound();
    const key = `${c.board}-${c.cls}-${c.slug}`, i = n - 1, title = sub.chapters[i], bn = NS.BOARDS.find(b => b.id === c.board).name;
    const head = `<section class="phead"><div class="wrap">${crumbs([["Home", "home"], ["Programmes", "programmes"], [sub.name, "course-" + key], ["Chapter " + n]])}<span class="eyebrow">${bn} · Class ${c.cls} · ${esc(sub.name)} · Chapter ${n}</span><h1>${esc(title)}</h1></div></section>`;
    if (!chapterOpen(i)) return head + `<section class="band" style="padding-top:0"><div class="wrap">${lockPane("This chapter is part of Scholar and Achiever", "Chapter 1 of every subject is free. Upgrade to unlock every lecture for your class.")}</div></section>`;
    const p = prog(key, i);
    return head + `<section class="band" style="padding-top:0"><div class="wrap coursegrid">
      <article class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px"><h2 id="lt" style="font-size:22px"></h2><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-dark btn-sm" id="regen">${ic("refresh")} Rewrite</button><button class="btn btn-dark btn-sm" id="readlesson" hidden>${ic("speaker")} Read aloud</button></div></div>
        <div class="lesson" id="lesson"></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;border-top:1px solid var(--line);padding-top:18px"><button class="btn btn-blue" id="done"></button><button class="btn btn-ghost" id="asklec">${ic("chat")} Ask Nova about this</button><button class="btn btn-dark" id="next">Next lecture ${ic("arrow")}</button></div></article>
      <aside class="side"><div class="card"><h3 style="margin-bottom:12px">Lectures</h3><div id="lecs"></div></div>
        <div class="card"><h3>Chapter test</h3><p class="muted small" style="margin:8px 0 14px">10 questions on ${esc(title)}, marked instantly with explanations.</p>${ACH() ? `<button class="btn btn-or" id="ctest" style="border-radius:8px">Start chapter test</button>` : `<span class="tag lock">${ic("lock")} Achiever plan</span>`}</div>
        <div class="card"><h3>Chapter list</h3><a class="btn btn-ghost btn-sm" style="margin-top:12px" href="#course-${key}">All ${sub.chapters.length} chapters</a></div></aside></div></section>`;
  };
  P.chapter.mount = arg => {
    const parts = arg.split("-"), n = +parts.pop(), c = parseCourse(parts.join("-")), sub = findCourse(c.board, c.cls, c.slug);
    if (!sub || !sub.chapters[n - 1] || !chapterOpen(n - 1)) return;
    const key = `${c.board}-${c.cls}-${c.slug}`, i = n - 1, title = sub.chapters[i], bn = NS.BOARDS.find(b => b.id === c.board).name;
    let cur = Math.max(0, prog(key, i).findIndex(x => !x)); if (prog(key, i).every(Boolean)) cur = 0;
    let ctrl = null, lessonText = "";
    const lecs = $("#lecs");
    const drawList = () => { const p = prog(key, i); lecs.innerHTML = NS.LECTURES.map((t, j) => `<button class="lecture ${p[j] ? "done" : ""}" data-j="${j}" ${j === cur ? 'style="border-color:var(--or)"' : ""}><span class="ck">${p[j] ? "✓" : j + 1}</span><span><b style="color:#fff;font:600 14px var(--hf)">Lecture ${j + 1}</b><br><span class="tiny">${t}</span></span></button>`).join(""); $("#done").innerHTML = p[cur] ? `${ic("tick")} Completed` : "Mark as done"; $("#next").disabled = cur === 3; };
    const cacheKey = () => `ns_lesson_${key}_${i}_${cur}`;
    const load = async (force) => {
      ctrl && ctrl.abort(); ctrl = new AbortController(); const my = ctrl;
      $("#lt").textContent = `Lecture ${cur + 1}: ${NS.LECTURES[cur]}`; drawList();
      const el = $("#lesson"), cached = !force && LS.get(cacheKey(), null);
      if (cached) { lessonText = cached; el.innerHTML = md(cached); $("#readlesson").hidden = !caps.tts; return; }
      el.innerHTML = `<p class="muted"><span class="spin"></span> Nova is preparing this lecture…</p>`;
      const prompt = `${tutorRules("English")}

Write Lecture ${cur + 1} of 4 ("${NS.LECTURES[cur]}") for the chapter "${title}" in ${sub.name}, ${bn} Class ${c.cls}.
${["Lecture 1 introduces the chapter: what it is about, why it matters in real life, and the key words with simple meanings.", "Lecture 2 teaches the core concepts one by one, each with a short explanation and an everyday example.", "Lecture 3 gives 3 fully worked examples or applications, step by step, in exam style.", "Lecture 4 is a crisp recap of the whole chapter as bullet points, common mistakes to avoid, and 5 practice questions with answers at the end."][cur]}
Use ### headings, short paragraphs and lists. 350–550 words. Do not add a title line; start directly with the content. This lecture is longer than your usual reply limit.`;
      try {
        const text = await ai([{ role: "user", content: prompt }], { signal: my.signal, onText: ({ text }) => { if (my === ctrl) el.innerHTML = md(text); } });
        if (my !== ctrl) return; lessonText = text; el.innerHTML = md(text); LS.set(cacheKey(), text); $("#readlesson").hidden = !caps.tts;
      } catch (e) {
        if (my !== ctrl || (e && e.name === "AbortError")) return;
        el.innerHTML = `<div class="warnbox">${esc(aiErr(e))}</div><h3>What this lecture covers</h3><ul><li>${esc(NS.LECTURES[cur])} for <strong>${esc(title)}</strong></li><li>Board: ${bn}, Class ${c.cls}, ${esc(sub.name)}</li></ul>`;
      }
    };
    lecs.onclick = e => { const b = e.target.closest("[data-j]"); if (!b) return; cur = +b.dataset.j; load(); };
    $("#done").onclick = () => { const p = [...prog(key, i)]; if (!p[cur]) { p[cur] = true; S.progress[`${key}:${i}`] = p; logAct("lecture", `${sub.name}: ${title} — Lecture ${cur + 1}`); toast("Lecture marked as done"); } drawList(); };
    $("#next").onclick = () => { if (cur < 3) { cur++; load(); } };
    $("#regen").onclick = () => load(true);
    $("#asklec").onclick = () => openTutorWith(`I'm on Lecture ${cur + 1} ("${NS.LECTURES[cur]}") of "${title}" (${sub.name}, Class ${c.cls}). Can you explain the main idea in a simpler way with an example?`);
    $("#readlesson").onclick = () => { if (caps.tts) caps.tts.speak(lessonText.replace(/[#*`]/g, "").slice(0, 2000)).catch(() => { }); };
    const ct = $("#ctest"); if (ct) ct.onclick = () => startTest({ kind: "chapter", subject: sub.name, chapter: title, board: bn, cls: c.cls, n: 10 });
    load(); onLeave(() => ctrl && ctrl.abort());
  };

  /* ----- labs ----- */
  const labFilter = { subj: "All", cls: "All" };
  P.labs = () => ({
    html: `<section class="phead"><div class="wrap">${crumbs([["Home", "home"], ["Labs"]])}<span class="eyebrow">Labs / Experiments</span><h1>${NS.LABS.length} interactive labs</h1><p class="lead" style="margin-top:14px">Change a value and watch the result. Every lab has live readouts, the formulas behind it and a plain-language explanation.</p>${PAID() ? "" : `<p class="tiny" style="margin-top:10px">Pendulum, Lens and Magnetic Field are free for everyone. All other labs unlock with Scholar.</p>`}</div></section>
    <section class="band" style="padding-top:0"><div class="wrap"><div class="filters" id="lf">${NS.LAB_FILTERS.map(f => `<button class="chip ${f === labFilter.subj ? "on" : ""}" data-f="${f}">${f}</button>`).join("")}
      <label class="small" style="margin-left:auto;display:flex;align-items:center;gap:8px">Class <select id="lc" style="min-height:36px;border-radius:8px;background:var(--card2);border:1px solid var(--line);padding:0 10px"><option>All</option>${NS.CLASSES.map(c => `<option ${String(c) === String(labFilter.cls) ? "selected" : ""}>${c}</option>`).join("")}</select></label></div>
      <div class="grid g3" id="lg"></div></div></section>`,
    mount() {
      const draw = () => { const list = NS.LABS.filter(l => (labFilter.subj === "All" || l.tags.includes(labFilter.subj)) && (labFilter.cls === "All" || (+labFilter.cls >= l.min && +labFilter.cls <= l.max))); $("#lg").innerHTML = list.length ? list.map(labCard).join("") : `<p class="muted">No labs match these filters yet.</p>`; drawThumbs($("#lg")); $$("#lf .chip").forEach(c => c.classList.toggle("on", c.dataset.f === labFilter.subj)); };
      $("#lf").onclick = e => { const b = e.target.closest("[data-f]"); if (b) { labFilter.subj = b.dataset.f; draw(); } };
      $("#lc").onchange = e => { labFilter.cls = e.target.value; draw(); };
      draw();
    }
  });
  P.lab = id => {
    const l = NS.LABS.find(x => x.id === id); if (!l) return notFound();
    const head = `<section class="phead" style="padding-bottom:18px"><div class="wrap">${crumbs([["Home", "home"], ["Labs", "labs"], [l.name]])}<div class="tags" style="margin-bottom:10px"><span class="tag">${l.subj}</span><span class="tag or">Class ${l.cls}</span></div><h1>${esc(l.name)}</h1><p class="lead" style="margin-top:10px">${esc(l.desc)}</p></div></section>`;
    if (!labOpen(id)) return head + `<section class="band" style="padding-top:0"><div class="wrap"><div class="card" style="padding:0;overflow:hidden;margin-bottom:16px"><div style="height:220px;position:relative;opacity:.45"><canvas data-thumb="${id}" style="position:absolute;inset:0;width:100%;height:100%"></canvas></div></div>${lockPane("Unlock all " + NS.LABS.length + " labs", "This lab is included in Scholar and Achiever. Pendulum, Lens and Magnetic Field are free for everyone.")}</div></section>`;
    return head + `<section class="band" style="padding-top:0"><div class="wrap"><div id="labfull"></div>
      <div style="margin-top:28px"><h3 style="margin-bottom:14px">More labs</h3><div class="grid g4">${NS.LABS.filter(x => x.id !== id && x.tags.some(t => l.tags.includes(t))).slice(0, 4).map(labCard).join("")}</div></div></div></section>`;
  };
  P.lab.mount = id => { const host = $("#labfull"); if (host) { const inst = NS.mountLab(host, id, { h: 520, ask: openTutorWith }); onLeave(() => inst.destroy()); if (S.profile) logAct("lab", NS.LABS.find(x => x.id === id).name); } drawThumbs(app); };

  /* ----- plans ----- */
  let billing = "m";
  P.plans = () => ({
    html: `<section class="phead center"><div class="wrap"><span class="eyebrow">Plans</span><h1>Simple plans for every learner</h1><p class="lead">Start free. Upgrade when your child is ready for more.</p>
      <div class="toggle" id="bill"><button data-b="m" class="${billing === "m" ? "on" : ""}">Monthly</button><button data-b="y" class="${billing === "y" ? "on" : ""}">Yearly · save ~20%</button></div></div></section>
    <section class="band" style="padding-top:10px"><div class="wrap"><div class="grid g3" id="plancards"></div>
      <div class="grid g3" style="margin-top:28px">${[["gift", "First lecture of every chapter is free"], ["cal", "Free 30-minute demo before you pay"], ["shield", "Child-safe AI Tutor on every plan"]].map(([i, t]) => `<div class="card" style="display:flex;gap:12px;align-items:center"><span class="avatar" style="color:var(--or)">${ic(i === "gift" ? "star" : i)}</span><b style="color:#fff;font:600 15px var(--hf)">${t}</b></div>`).join("")}</div>
      <p class="tiny center" style="margin-top:16px">Prices are indicative and confirmed during your demo. ${NS.CONFIG.paymentsLive ? "" : "Online payments are not connected in this build, so choosing a plan activates it in demo mode."}</p>
      <h2 style="margin:56px 0 18px">Compare plans</h2>
      <div class="card scroll" style="padding:6px 16px"><table class="cmp"><thead><tr><th>Feature</th>${NS.PLANS.map(p => `<th>${p.name}</th>`).join("")}</tr></thead><tbody>${NS.PLAN_ROWS.map(r => `<tr><td>${r[0]}</td>${r.slice(1).map(v => `<td>${v === true ? `<span style="color:var(--ok)">${ic("tick")}</span>` : v === false ? `<span class="muted">—</span>` : esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <div class="faqwrap" style="margin-top:56px"><div><h2>Plan questions</h2><p class="lead" style="margin-top:10px">Anything else? <a href="#contact">Talk to us</a>.</p></div><div class="faq">${NS.PLAN_FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div></div></section>`,
    mount() {
      const draw = () => { $("#plancards").innerHTML = NS.PLANS.map(p => { const price = billing === "m" ? p.m : p.y, cur = S.profile && S.plan === p.id; return `<div class="card plan ${p.popular ? "pop" : ""}">${p.popular ? `<span class="badge">MOST POPULAR</span>` : ""}<div><h3>${p.name}</h3><p class="tiny">${p.tag}</p></div><div class="price">${price ? inr(price) : "Free"} <small>${price ? (billing === "m" ? "/ month" : "/ year") : "no card needed"}</small></div><ul class="list">${p.feats.map(f => `<li>${ic("tick")}<span>${f}</span></li>`).join("").replaceAll('class="icon"', 'class="icon" style="color:var(--ok)"')}</ul><button class="btn ${p.popular ? "btn-or" : "btn-blue"}" ${p.popular ? 'style="border-radius:8px"' : ""} data-plan="${p.id}" ${cur ? "disabled" : ""}>${cur ? "Current plan" : p.cta}</button></div>`; }).join(""); };
      $("#bill").onclick = e => { const b = e.target.closest("[data-b]"); if (!b) return; billing = b.dataset.b; $$("#bill button").forEach(x => x.classList.toggle("on", x === b)); draw(); };
      $("#plancards").onclick = e => { const b = e.target.closest("[data-plan]"); if (b) choosePlan(b.dataset.plan); };
      draw();
    }
  });
  function choosePlan(id) {
    if (!S.profile) { LS.set("ns_pending_plan", id); toast("Create your free account first — it takes a few seconds."); location.hash = "login"; return; }
    const p = NS.PLANS.find(x => x.id === id), price = billing === "m" ? p.m : p.y;
    modal(`<h3>Switch to ${p.name}</h3><p class="muted" style="margin:10px 0">${price ? `${inr(price)} ${billing === "m" ? "per month" : "per year"} (indicative).` : "Free forever."}</p>${!NS.CONFIG.paymentsLive && price ? `<div class="warnbox">Payments aren't connected in this build. Confirming activates ${p.name} in demo mode so you can try every feature. Connect a payment gateway in CONFIG before launch.</div>` : ""}<div class="ctas" style="margin-top:18px"><button class="btn btn-blue" id="conf">Confirm ${p.name}</button><button class="btn btn-dark" data-close>Cancel</button></div>`,
      m => { $("#conf", m).onclick = () => { S.plan = id; S.billing = billing; logAct("plan", "Switched to " + p.name); closeModal(); renderChrome(); toast(`${p.name} plan is now active`); location.hash = "dashboard"; }; });
  }

  /* ----- login / profile ----- */
  P.login = () => {
    const p = S.profile || {};
    if (S.profile && !LS.get("ns_edit", false)) return `<section class="band"><div class="wrap" style="max-width:560px"><div class="card center"><span class="avatar" style="width:56px;height:56px;margin:0 auto 12px;font-size:18px">${esc(p.name.slice(0, 2).toUpperCase())}</span><h2>You're signed in, ${esc(p.name.split(" ")[0])}</h2><p class="muted" style="margin:8px 0 20px">${planName()} plan · Class ${p.cls} · ${NS.BOARDS.find(b => b.id === p.board).name}</p><div class="ctas" style="justify-content:center"><a class="btn btn-blue" href="#dashboard">Go to dashboard</a><button class="btn btn-dark" id="editp">Edit profile</button></div></div></div></section>`;
    return `<section class="band"><div class="wrap" style="max-width:620px"><div class="card"><span class="eyebrow">Student Login</span><h2>${S.profile ? "Edit your profile" : "Continue to your dashboard"}</h2><p class="muted small" style="margin:8px 0 20px">${caps.db ? "Your progress is saved to your account and follows you across devices." : "Your progress is saved in this browser."} No password needed.</p>
      <form class="form" id="lf" novalidate>
        <div class="field"><label for="f-name">Student's name</label><input id="f-name" required autocomplete="name" value="${esc(p.name || "")}"></div>
        <div class="row2"><div class="field"><label for="f-role">I am a</label><select id="f-role">${["Student", "Parent"].map(r => `<option ${p.role === r ? "selected" : ""}>${r}</option>`).join("")}</select></div>
          <div class="field"><label for="f-lang">Preferred language</label><select id="f-lang">${["English", "Hindi", "Hinglish"].map(r => `<option ${p.lang === r ? "selected" : ""}>${r}</option>`).join("")}</select></div></div>
        <div class="row2"><div class="field"><label for="f-board">Board</label><select id="f-board">${NS.BOARDS.map(b => `<option value="${b.id}" ${(p.board || pathState.board) === b.id ? "selected" : ""}>${b.name}</option>`).join("")}</select></div>
          <div class="field"><label for="f-cls">Class</label><select id="f-cls">${NS.CLASSES.map(c => `<option ${+(p.cls || pathState.cls) === c ? "selected" : ""}>${c}</option>`).join("")}</select></div></div>
        <div class="field" id="streamf"><label for="f-stream">Stream (Classes 11–12)</label><select id="f-stream">${Object.keys(NS.STREAMS).map(s => `<option ${(p.stream || "PCM") === s ? "selected" : ""}>${s}</option>`).join("")}</select></div>
        <div class="field"><label for="f-email">Parent's email (optional, for reports)</label><input id="f-email" type="email" autocomplete="email" value="${esc(p.email || "")}"></div>
        <div id="ferr" class="err" role="alert"></div>
        <button class="btn btn-blue" type="submit">${S.profile ? "Save profile" : "Continue"}</button>
        <p class="tiny">By continuing you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>. Students under 18 should sign up with a parent.</p></form></div></div></section>`;
  };
  P.login.mount = () => {
    const ed = $("#editp"); if (ed) { ed.onclick = () => { LS.set("ns_edit", true); route(); }; return; }
    const sf = () => { $("#streamf").style.display = +$("#f-cls").value >= 11 ? "" : "none"; }; $("#f-cls").onchange = sf; sf();
    $("#lf").onsubmit = e => {
      e.preventDefault(); const name = $("#f-name").value.trim(), email = $("#f-email").value.trim();
      if (name.length < 2) { $("#ferr").textContent = "Please enter the student's name."; $("#f-name").focus(); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $("#ferr").textContent = "That email doesn't look right."; $("#f-email").focus(); return; }
      const first = !S.profile;
      S.profile = { name, role: $("#f-role").value, lang: $("#f-lang").value, board: $("#f-board").value, cls: +$("#f-cls").value, stream: $("#f-stream").value, email, since: S.profile?.since || today() };
      Object.assign(pathState, { board: S.profile.board, cls: S.profile.cls, stream: S.profile.stream }); tutor.lang = S.profile.lang;
      LS.set("ns_edit", false); if (first) logAct("join", "Joined " + B.name); else save();
      renderChrome(); toast(first ? `Welcome to ${B.name}, ${name.split(" ")[0]}!` : "Profile saved");
      const pend = LS.get("ns_pending_plan", null); LS.set("ns_pending_plan", null);
      if (pend && pend !== "starter") { location.hash = "plans"; setTimeout(() => choosePlan(pend), 300); } else location.hash = "dashboard";
    };
  };

  /* ----- dashboard ----- */
  function allCourseStats() { const p = S.profile; return NS.subjectsFor(p.board, p.cls, p.stream).map(s => { const key = `${p.board}-${p.cls}-${s.slug}`; return { s, key, ...courseStats(key, s) }; }); }
  function last7() { const out = []; for (let i = 6; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5); const k = d.toLocaleDateString("en-CA"); out.push([d.toLocaleDateString("en-IN", { weekday: "short" }), S.activity[k] || 0, k]); } return out; }
  P.dashboard = () => {
    if (!S.profile) { setTimeout(() => location.hash = "login"); return ""; }
    const p = S.profile, cs = allCourseStats(), done = cs.reduce((a, c) => a + c.done, 0), total = cs.reduce((a, c) => a + c.total, 0), pct = Math.round(done / total * 100);
    const labsUsed = new Set(S.log.filter(l => l.type === "lab").map(l => l.label)).size, avg = S.tests.length ? Math.round(S.tests.reduce((a, t) => a + t.score / t.total, 0) / S.tests.length * 100) : null;
    const wk = last7(), mx = Math.max(10, ...wk.map(w => w[1])), weekMins = wk.reduce((a, w) => a + w[1], 0), weekLecs = S.log.filter(l => l.type === "lecture" && Date.now() - l.t < 7 * 864e5).length, weekQ = wk.reduce((a, w) => a + (S.tq[w[2]] || 0), 0);
    const cont = cs.find(c => c.pct < 100) || cs[0];
    return `<section class="phead" style="padding-bottom:20px"><div class="wrap"><span class="eyebrow">Dashboard</span><h1>Hello, ${esc(p.name.split(" ")[0])} 👋</h1><p class="lead" style="margin-top:8px">${NS.BOARDS.find(b => b.id === p.board).name} · Class ${p.cls}${+p.cls >= 11 ? " · " + p.stream : ""} · <b style="color:var(--or)">${planName()} plan</b> · <a href="#plans">${PAID() ? "Change plan" : "Upgrade"}</a></p></div></section>
    <section class="band" style="padding-top:0"><div class="wrap">
      <div class="dash">${[["Overall progress", pct + "%"], ["Lectures done", done + " / " + total], ["Labs explored", labsUsed], ["Nova questions today", PAID() ? tqToday() + " · unlimited" : tqToday() + " / 5"]].map(([l, v]) => `<div class="card stat"><small>${l}</small><b>${v}</b></div>`).join("")}</div>
      <div class="coursegrid" style="margin-top:20px"><div style="display:grid;gap:20px">
        <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3>Continue learning</h3><a class="btn btn-blue btn-sm" href="#course-${cont.key}">Resume ${esc(cont.s.name)} ${ic("arrow")}</a></div>
          <div style="margin-top:8px">${cs.map(c => `<a class="subrow" href="#course-${c.key}" style="text-decoration:none;color:inherit"><span class="subj si" style="padding:0;margin:0;border:0;width:36px;height:36px;display:grid;place-items:center;background:rgba(111,163,214,.15);color:var(--bl);border-radius:9px">${ic(c.s.icon)}</span><span style="width:min(220px,38%)"><b style="color:#fff;font:600 14px var(--hf)">${esc(c.s.name)}</b><br><span class="tiny">${c.s.chapters.length} chapters</span></span><span class="progress"><i style="width:${c.pct}%"></i></span><b class="small" style="width:44px;text-align:right">${c.pct}%</b></a>`).join("")}</div></div>
        <div class="card"><h3>Weekly insights</h3>${PAID() ? `<div class="bars" role="img" aria-label="Minutes learned per day this week">${wk.map(([d, m]) => `<div><span>${m}m</span><i style="height:${Math.max(3, m / mx * 100)}%"></i><span>${d}</span></div>`).join("")}</div><div class="readouts" style="grid-template-columns:repeat(3,1fr);margin-top:16px"><div class="ro"><small>Time this week</small><b>${weekMins} min</b></div><div class="ro"><small>Lectures completed</small><b>${weekLecs}</b></div><div class="ro"><small>Questions asked</small><b>${weekQ}</b></div></div><p class="muted small">${weekMins < 60 ? "Aim for 20 focused minutes a day — short, regular sessions beat long cramming." : "Great consistency this week. Keep the streak going!"}</p>` : `<p class="muted small" style="margin:8px 0 14px">See minutes learned per day, lectures completed and questions asked every week.</p><span class="tag lock">${ic("lock")} Scholar and Achiever</span>`}</div>
        <div class="card"><h3>Tests and mock exams</h3>${ACH() ? `<div class="row2" style="margin-top:14px"><div class="field"><label for="t-sub">Subject</label><select id="t-sub">${cs.map((c, k) => `<option value="${k}">${esc(c.s.name)}</option>`).join("")}</select></div><div class="field"><label for="t-ch">Chapter</label><select id="t-ch"></select></div></div><div class="ctas" style="margin-top:14px"><button class="btn btn-blue" id="t-go">Chapter test (10 Qs)</button><button class="btn btn-or" style="border-radius:8px" id="t-mock">Mock exam (20 Qs · 30 min)</button></div>
          ${S.tests.length ? `<div class="scroll" style="margin-top:18px"><table class="cmp"><thead><tr><th>Test</th><th>Score</th><th>Date</th></tr></thead><tbody>${S.tests.slice(0, 8).map(t => `<tr><td>${esc(t.title)}</td><td>${t.score}/${t.total}</td><td>${esc(t.date)}</td></tr>`).join("")}</tbody></table></div><p class="small muted" style="margin-top:10px">Average score: <b style="color:#fff">${avg}%</b></p>` : `<p class="tiny" style="margin-top:12px">No tests yet. Your results will appear here.</p>`}` : `<p class="muted small" style="margin:8px 0 14px">Chapter tests and full mock exams with instant marking and explanations.</p><span class="tag lock">${ic("lock")} Achiever plan</span>`}</div>
      </div>
      <aside class="side">
        <div class="card"><h3 style="display:flex;gap:8px;align-items:center">${ic("robot")} Ask Nova</h3><p class="muted small" style="margin:8px 0 14px">Stuck on a sum or a concept? Get a step-by-step explanation.</p><a class="btn btn-blue" href="#tutor">Open AI Tutor</a></div>
        <div class="card"><h3>Revision plan</h3>${ACH() ? `<div id="rev" class="lesson small" style="margin-top:10px">${S.revision ? md(S.revision.text) + `<p class="tiny">Made on ${esc(S.revision.date)}</p>` : `<p class="muted small">A 7-day plan built from your weakest chapters and test results.</p>`}</div><button class="btn btn-dark btn-sm" id="mkrev" style="margin-top:10px">${ic("refresh")} ${S.revision ? "Refresh plan" : "Make my plan"}</button>` : `<p class="muted small" style="margin:8px 0 14px">A personalised 7-day revision plan.</p><span class="tag lock">${ic("lock")} Achiever plan</span>`}</div>
        <div class="card"><h3>Parent progress report</h3>${ACH() ? `<pre id="report" style="white-space:pre-wrap;font:13px/1.6 'Open Sans';color:var(--mute);margin:10px 0">${esc(reportText())}</pre><button class="btn btn-dark btn-sm" id="cprep">${ic("copy")} Copy report</button>` : `<p class="muted small" style="margin:8px 0 14px">A clear summary of progress, scores and time spent, ready to share.</p><span class="tag lock">${ic("lock")} Achiever plan</span>`}</div>
        <div class="card"><h3>Recent activity</h3><div style="margin-top:8px">${S.log.slice(0, 6).map(l => `<div class="subrow" style="padding:8px 0"><span class="small">${esc(l.label)}</span><span class="tiny" style="margin-left:auto;white-space:nowrap">${esc(l.date)}</span></div>`).join("") || '<p class="tiny">Nothing yet — open a lecture or a lab to get started.</p>'}</div></div>
        <div class="card"><h3>Account</h3><div class="ctas" style="margin-top:12px"><a class="btn btn-dark btn-sm" href="#login" id="editprof">Edit profile</a><a class="btn btn-dark btn-sm" href="#plans">Plans</a></div></div>
      </aside></div></div></section>`;
  };
  P.dashboard.mount = () => {
    if (!S.profile) return;
    const ep = $("#editprof"); if (ep) ep.onclick = () => LS.set("ns_edit", true);
    const cs = allCourseStats(), ts = $("#t-sub");
    if (ts) { const fill = () => { const c = cs[+ts.value]; $("#t-ch").innerHTML = c.s.chapters.map((t, i) => `<option value="${i}">${i + 1}. ${esc(t)}</option>`).join(""); }; ts.onchange = fill; fill();
      const bn = NS.BOARDS.find(b => b.id === S.profile.board).name;
      $("#t-go").onclick = () => { const c = cs[+ts.value]; startTest({ kind: "chapter", subject: c.s.name, chapter: c.s.chapters[+$("#t-ch").value], board: bn, cls: S.profile.cls, n: 10 }); };
      $("#t-mock").onclick = () => { const c = cs[+ts.value]; startTest({ kind: "mock", subject: c.s.name, chapters: c.s.chapters, board: bn, cls: S.profile.cls, n: 20, minutes: 30 }); }; }
    const mk = $("#mkrev"); if (mk) mk.onclick = async () => {
      mk.disabled = true; const el = $("#rev"); el.innerHTML = '<p class="muted"><span class="spin"></span> Building your plan…</p>';
      const weak = cs.map(c => `${c.s.name}: ${c.pct}% of lectures done`).join("; "), tests = S.tests.slice(0, 10).map(t => `${t.title} ${t.score}/${t.total}`).join("; ") || "no tests yet";
      try { const text = await ai([{ role: "user", content: `${tutorRules(S.profile.lang)}\n\nMake a 7-day revision plan (Day 1 … Day 7) for this student. Progress: ${weak}. Recent tests: ${tests}. Focus on weak areas and low test scores, mix subjects, 25–40 minutes a day, and name specific chapters. Use a short list per day. Under 250 words.` }], { onText: ({ text }) => el.innerHTML = md(text) }); S.revision = { text, date: today() }; save(); el.innerHTML = md(text) + `<p class="tiny">Made on ${today()}</p>`; }
      catch (e) { const fb = cs.filter(c => c.pct < 100).slice(0, 7); const text = fb.map((c, i) => `- **Day ${i + 1}:** ${c.s.name} — next chapter "${c.s.chapters[Math.min(c.s.chapters.length - 1, Math.floor(c.done / 4))]}" (30 min) + 10 min recap`).join("\n") || "- You've completed everything. Revise one chapter a day with a chapter test."; S.revision = { text, date: today() }; save(); el.innerHTML = md(text) + `<p class="tiny">${esc(aiErr(e))} This plan was made from your progress instead.</p>`; }
      mk.disabled = false;
    };
    const cp = $("#cprep"); if (cp) cp.onclick = () => copy(reportText());
  };
  function reportText() {
    const p = S.profile, cs = allCourseStats(), wk = last7(), mins = wk.reduce((a, w) => a + w[1], 0), avg = S.tests.length ? Math.round(S.tests.reduce((a, t) => a + t.score / t.total, 0) / S.tests.length * 100) + "%" : "no tests yet";
    return `${B.name} progress report — ${p.name}\nClass ${p.cls}, ${NS.BOARDS.find(b => b.id === p.board).name} · ${planName()} plan · ${today()}\n\nSubjects:\n${cs.map(c => `• ${c.s.name}: ${c.pct}% (${c.done}/${c.total} lectures)`).join("\n")}\n\nThis week: ${mins} minutes of learning, ${S.log.filter(l => l.type === "lecture" && Date.now() - l.t < 7 * 864e5).length} lectures completed.\nTests taken: ${S.tests.length} · average score: ${avg}\n${S.tests[0] ? `Latest test: ${S.tests[0].title} — ${S.tests[0].score}/${S.tests[0].total}` : ""}`;
  }

  /* ----- tests ----- */
  let activeTest = null;
  async function startTest(cfg) {
    activeTest = { cfg, qs: null, ans: {}, done: false, err: null, start: Date.now() }; location.hash = "test";
    const topic = cfg.kind === "mock" ? `the whole subject (chapters: ${cfg.chapters.join("; ")})` : `the chapter "${cfg.chapter}"`;
    const prompt = `Create ${cfg.n} multiple-choice questions for a ${cfg.board} Class ${cfg.cls} ${cfg.subject} ${cfg.kind === "mock" ? "mock exam" : "chapter test"} covering ${topic}. Mix easy, medium and hard, exam style, accurate and unambiguous. Write maths in plain text.
Return ONLY JSON, no other text: {"questions":[{"q":"question","options":["A","B","C","D"],"answer":0,"explain":"one-sentence reason"}]} where answer is the index (0-3) of the correct option.`;
    try {
      const text = await ai([{ role: "user", content: prompt }], { modelTier: "default" });
      const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
      const qs = (j.questions || []).filter(q => q && typeof q.q === "string" && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
      if (qs.length < 3) throw { code: "parse" };
      if (activeTest && activeTest.cfg === cfg) { activeTest.qs = qs; if (location.hash === "#test") route(); }
    } catch (e) {
      if (!activeTest || activeTest.cfg !== cfg) return;
      if (/math/i.test(cfg.subject)) { activeTest.qs = mathsFallback(cfg.n); activeTest.note = "Nova couldn't write a custom test here, so this is an arithmetic practice set."; }
      else activeTest.err = e && e.code === "parse" ? "Nova's test came back in an unexpected format. Please try again." : aiErr(e);
      if (location.hash === "#test") route();
    }
  }
  function mathsFallback(n) { const out = []; for (let i = 0; i < n; i++) { const a = 3 + Math.floor(Math.random() * 20), b = 2 + Math.floor(Math.random() * 12), kind = i % 3, ans = kind === 0 ? a * b : kind === 1 ? a * a : a + b * b; const q = kind === 0 ? `What is ${a} × ${b}?` : kind === 1 ? `What is ${a}²?` : `What is ${a} + ${b}²?`; const opts = [ans, ans + b, ans - a, ans + 10].sort(() => Math.random() - .5); out.push({ q, options: opts.map(String), answer: opts.indexOf(ans), explain: `The answer is ${ans}.` }); } return out; }
  P.test = () => {
    const t = activeTest; if (!t) { setTimeout(() => location.hash = "dashboard"); return ""; }
    const c = t.cfg, title = c.kind === "mock" ? `${c.subject} mock exam` : `Chapter test: ${c.chapter}`;
    const head = `<section class="phead" style="padding-bottom:16px"><div class="wrap">${crumbs([["Dashboard", "dashboard"], [title]])}<span class="eyebrow">${esc(c.board)} · Class ${c.cls} · ${esc(c.subject)}</span><h1 style="font-size:clamp(26px,4vw,38px)">${esc(title)}</h1>${c.minutes ? `<p class="lead" id="timer" style="margin-top:8px"></p>` : ""}</div></section>`;
    if (t.err) return head + `<section class="band" style="padding-top:0"><div class="wrap"><div class="warnbox">${esc(t.err)}</div><a class="btn btn-dark" style="margin-top:16px" href="#dashboard">Back to dashboard</a></div></section>`;
    if (!t.qs) return head + `<section class="band" style="padding-top:0"><div class="wrap"><div class="card center"><span class="spin"></span><p class="muted" style="margin-top:10px">Nova is writing your questions…</p></div></div></section>`;
    const score = t.qs.reduce((a, q, i) => a + (t.ans[i] === q.answer ? 1 : 0), 0);
    return head + `<section class="band" style="padding-top:0"><div class="wrap" style="max-width:820px">${t.note ? `<div class="warnbox" style="margin-bottom:16px">${esc(t.note)}</div>` : ""}
      ${t.done ? `<div class="card" style="margin-bottom:20px;display:flex;align-items:center;gap:20px;flex-wrap:wrap"><div class="price">${score}/${t.qs.length}</div><div><b style="color:#fff">${score / t.qs.length >= .8 ? "Excellent work!" : score / t.qs.length >= .5 ? "Good effort — review the ones you missed." : "Keep practising — read the explanations below."}</b><p class="muted small">Saved to your dashboard.</p></div><a class="btn btn-blue" style="margin-left:auto" href="#dashboard">Back to dashboard</a></div>` : ""}
      <form class="card quiz" id="quiz">${t.qs.map((q, i) => `<div class="q"><b>${i + 1}. ${esc(q.q)}</b>${q.options.map((o, j) => { let cl = t.ans[i] === j ? "on" : ""; if (t.done) cl = j === q.answer ? "right" : t.ans[i] === j ? "wrong" : ""; return `<button type="button" class="choice ${cl}" data-q="${i}" data-o="${j}" ${t.done ? "disabled" : ""}>${"ABCD"[j]}. ${esc(o)}</button>`; }).join("")}${t.done ? `<p class="small muted">${esc(q.explain || "")}</p>` : ""}</div>`).join("")}
      ${t.done ? "" : `<button class="btn btn-or" style="border-radius:8px" type="submit">Submit answers</button> <span class="tiny" id="answered"></span>`}</form></div></section>`;
  };
  P.test.mount = () => {
    const t = activeTest; if (!t || !t.qs) return;
    const q = $("#quiz"), upd = () => { const a = $("#answered"); if (a) a.textContent = `${Object.keys(t.ans).length} of ${t.qs.length} answered`; }; upd();
    const finish = () => { if (t.done) return; t.done = true; const score = t.qs.reduce((a, x, i) => a + (t.ans[i] === x.answer ? 1 : 0), 0); S.tests.unshift({ title: t.cfg.kind === "mock" ? `${t.cfg.subject} mock` : `${t.cfg.subject}: ${t.cfg.chapter}`, score, total: t.qs.length, date: today() }); S.tests = S.tests.slice(0, 50); logAct("test", `Test: ${S.tests[0].title} (${score}/${t.qs.length})`); route(); };
    q.onclick = e => { const b = e.target.closest(".choice"); if (!b || t.done) return; t.ans[+b.dataset.q] = +b.dataset.o; $$(`.choice[data-q="${b.dataset.q}"]`).forEach(x => x.classList.toggle("on", x === b)); upd(); };
    q.onsubmit = e => { e.preventDefault(); if (Object.keys(t.ans).length < t.qs.length) { modal(`<h3>Submit with unanswered questions?</h3><p class="muted" style="margin:10px 0 18px">${t.qs.length - Object.keys(t.ans).length} questions are still blank and will be marked wrong.</p><div class="ctas"><button class="btn btn-blue" id="sub">Submit anyway</button><button class="btn btn-dark" data-close>Keep going</button></div>`, m => $("#sub", m).onclick = () => { closeModal(); finish(); }); } else finish(); };
    if (t.cfg.minutes && !t.done) { const end = t.start + t.cfg.minutes * 60000; const iv = setInterval(() => { const left = Math.max(0, end - Date.now()), el = $("#timer"); if (el) el.textContent = `Time left: ${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, "0")}`; if (!left) { clearInterval(iv); toast("Time's up — submitting your answers"); finish(); } }, 1000); onLeave(() => clearInterval(iv)); }
  };

  /* ----- AI tutor ----- */
  const tutor = { msgs: LS.get("ns_tutor", []), lang: S.profile?.lang || "English", busy: false, views: new Set(), ctrl: null };
  const SUGG = ["Explain photosynthesis simply", "Help me with fractions", "Why is the sky blue?", "Quiz me on my last chapter"];
  function tutorHTML(compact) {
    return `<div class="tutor"><div class="th"><span class="avatar" style="color:var(--or)">${ic("robot")}</span><div><b style="color:#fff;font:700 15px var(--hf)">Nova</b><div class="tiny" data-quota></div></div>
      <select data-lang aria-label="Reply language" style="margin-left:auto;min-height:36px;border-radius:8px;background:var(--card2);border:1px solid var(--line);padding:0 8px">${["English", "Hindi", "Hinglish"].map(l => `<option ${tutor.lang === l ? "selected" : ""}>${l}</option>`).join("")}</select>
      <button class="iconbtn" data-clear title="New chat" aria-label="New chat" style="width:36px;height:36px">${ic("refresh")}</button>${compact ? `<button class="iconbtn" data-closedrawer aria-label="Close tutor" style="width:36px;height:36px">${ic("x")}</button>` : ""}</div>
      <div class="msgs" data-msgs aria-live="polite"></div><div class="sugg" data-sugg>${SUGG.map(s => `<button type="button">${s}</button>`).join("")}</div>
      <form data-form><button type="button" class="iconbtn" data-mic aria-label="Speak your question" hidden>${ic("mic")}</button><input data-in placeholder="Ask any doubt…" aria-label="Your question" maxlength="1500"><button class="iconbtn" style="background:var(--bl);color:var(--navy);border-color:var(--bl)" aria-label="Send">${ic("send")}</button></form></div>`;
  }
  function renderMsgs(view) {
    const box = $("[data-msgs]", view); if (!box) return;
    if (!tutor.msgs.length) box.innerHTML = `<div class="msg b">Hi${S.profile ? " " + esc(S.profile.name.split(" ")[0]) : ""}! I'm Nova, your Personal Tutor. Ask me any doubt from your syllabus — I'll explain it step by step. What are you studying today?</div>`;
    else box.innerHTML = tutor.msgs.map((m, i) => `<div class="msg ${m.role === "user" ? "u" : "b"}">${m.role === "user" ? esc(m.content) : md(m.content || "…")}${m.role === "assistant" && m.content && caps.tts ? `<div class="acts"><button type="button" data-speak="${i}">${ic("speaker")} Read aloud</button></div>` : ""}</div>`).join("");
    box.scrollTop = box.scrollHeight;
    $("[data-sugg]", view).style.display = tutor.msgs.length ? "none" : "";
    $("[data-quota]", view).textContent = PAID() ? `${planName()} · unlimited questions` : `${Math.max(0, 5 - tqToday())} of 5 free questions left today`;
  }
  function refreshVoice() { tutor.views.forEach(v => { const m = $("[data-mic]", v); if (m) m.hidden = !caps.dict; renderMsgs(v); }); }
  function mountTutor(view, compact) {
    view.innerHTML = tutorHTML(compact); tutor.views.add(view); renderMsgs(view); refreshVoice();
    const inp = $("[data-in]", view), mic = $("[data-mic]", view);
    $("[data-form]", view).onsubmit = e => { e.preventDefault(); send(inp.value); inp.value = ""; };
    $("[data-sugg]", view).onclick = e => { const b = e.target.closest("button"); if (b) send(b.textContent); };
    $("[data-lang]", view).onchange = e => { tutor.lang = e.target.value; tutor.views.forEach(v => { const s = $("[data-lang]", v); if (s) s.value = tutor.lang; }); };
    $("[data-clear]", view).onclick = () => { tutor.ctrl && tutor.ctrl.abort(); tutor.msgs = []; tutor.busy = false; LS.set("ns_tutor", []); tutor.views.forEach(renderMsgs); };
    const cd = $("[data-closedrawer]", view); if (cd) cd.onclick = () => $("#drawer").classList.remove("open");
    $("[data-msgs]", view).onclick = e => { const b = e.target.closest("[data-speak]"); if (b && caps.tts) caps.tts.speak(tutor.msgs[+b.dataset.speak].content.replace(/[#*`]/g, "").slice(0, 2000)).catch(() => toast("Couldn't read that aloud right now.")); };
    let base = "", listening = false;
    mic.onclick = () => {
      if (!caps.dict) return;
      if (!PAID()) { toast("Voice questions are part of Scholar and Achiever."); return; }
      if (listening) { caps.dict.stop().catch(() => { }); return; }
      base = inp.value ? inp.value + " " : "";
      dictCb.partial = t => inp.value = base + t; dictCb.final = t => { base += t + " "; inp.value = base; };
      dictCb.state = st => { listening = st === "listening"; mic.classList.toggle("on", listening); };
      caps.dict.start().catch(e => { if (e && e.code === "not_granted") toast("Microphone access was declined. You can keep typing."); });
    };
    return () => tutor.views.delete(view);
  }
  async function send(text) {
    text = (text || "").trim(); if (!text || tutor.busy) return;
    if (!canAsk()) { tutor.views.forEach(v => { const box = $("[data-msgs]", v); box.insertAdjacentHTML("beforeend", `<div class="msg b">You've used today's 5 free questions. Upgrade to Scholar for unlimited help, or come back tomorrow. <a href="#plans">See plans</a></div>`); box.scrollTop = box.scrollHeight; }); return; }
    tutor.msgs.push({ role: "user", content: text }, { role: "assistant", content: "" }); tutor.busy = true;
    S.tq[today()] = tqToday() + 1; save(); tutor.views.forEach(renderMsgs);
    const conv = tutor.msgs.slice(0, -1).slice(-16); while (conv.length && conv[0].role !== "user") conv.shift();
    const msgs = conv.map((m, i) => ({ role: m.role, content: i === 0 ? `${tutorRules(tutor.lang)}\n\nStudent: ${m.content}` : (m.content || "…") }));
    tutor.ctrl = new AbortController(); const my = tutor.ctrl, slot = tutor.msgs[tutor.msgs.length - 1];
    try {
      const out = await ai(msgs, { signal: my.signal, onText: ({ text }) => { slot.content = text; tutor.views.forEach(v => { const last = $$("[data-msgs] .msg.b", v).pop(); if (last) { last.textContent = text; $("[data-msgs]", v).scrollTop = 1e9; } }); } });
      slot.content = out;
    } catch (e) { if (my.signal.aborted) return; slot.content = aiErr(e); S.tq[today()] = Math.max(0, tqToday() - 1); save(); }
    tutor.busy = false; LS.set("ns_tutor", tutor.msgs.slice(-40)); tutor.views.forEach(renderMsgs);
  }
  function openTutorWith(q) {
    if (location.hash === "#tutor") { send(q); return; }
    const d = $("#drawer"); d.classList.add("open"); send(q);
  }
  P.tutor = () => ({
    html: `<section class="phead" style="padding-bottom:16px"><div class="wrap">${crumbs([["Home", "home"], ["AI Tutor"]])}<span class="eyebrow">AI Tutor</span><h1>Ask Nova anything from your syllabus</h1><p class="lead" style="margin-top:8px">Step-by-step answers in English, Hindi or Hinglish${caps.dict ? ", by voice or text" : ""}. ${S.profile ? "" : `<a href="#login">Sign in</a> so Nova knows your board and class.`}</p></div></section>
      <section class="band" style="padding-top:0"><div class="wrap coursegrid"><div id="tutormain"></div><aside class="side"><div class="card"><h3>Tips for great answers</h3><ul class="list small muted"><li>${ic("tick")}<span>Mention the chapter or topic you're on.</span></li><li>${ic("tick")}<span>Share your working, and ask where you went wrong.</span></li><li>${ic("tick")}<span>Ask for a hint before the full answer.</span></li><li>${ic("tick")}<span>Say "quiz me" to check your understanding.</span></li></ul></div><div class="card"><h3>Child-safe by design</h3><p class="muted small" style="margin-top:8px">Nova stays on learning, never asks for personal details and can make mistakes — check important answers with your teacher. <a href="#child-safety">Learn more</a></p></div></aside></div></section>`,
    mount() { const off = mountTutor($("#tutormain"), false); onLeave(off); }
  });

  /* ----- demo booking / contact ----- */
  async function submitLead(kind, entry) {
    entry.at = new Date().toISOString(); const local = LS.get("ns_" + kind, []); local.unshift(entry); LS.set("ns_" + kind, local.slice(0, 20));
    await remoteReady;
    const viaApi = async () => { if (!NS.CONFIG.leadEndpoint) return false; try { const r = await fetch(NS.CONFIG.leadEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, ...entry }) }); return r.ok; } catch { return false; } };
    if (!caps.db || !caps.uid) return viaApi();
    try { const ref = caps.db.doc(`${kind}/${caps.uid}`), snap = await ref.get(), list = snap.exists ? (snap.data().items || []) : []; await ref.set({ items: [entry, ...list].slice(0, 20), updatedAt: entry.at }); return true; } catch { return viaApi(); }
  }
  const leadForm = (kind) => `<form class="form" id="leadf" novalidate>
      <div class="row2"><div class="field"><label for="d-name">${kind === "leads" ? "Parent's name" : "Your name"}</label><input id="d-name" autocomplete="name" value="${esc(S.profile?.role === "Parent" ? S.profile.name : "")}"></div><div class="field"><label for="d-phone">Mobile number</label><input id="d-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="10-digit mobile"></div></div>
      ${kind === "leads" ? `<div class="row2"><div class="field"><label for="d-board">Board</label><select id="d-board">${NS.BOARDS.map(b => `<option ${S.profile?.board === b.id ? "selected" : ""}>${b.name}</option>`).join("")}</select></div><div class="field"><label for="d-cls">Class</label><select id="d-cls">${NS.CLASSES.map(c => `<option ${+S.profile?.cls === c ? "selected" : ""}>${c}</option>`).join("")}</select></div></div>
      <div class="row2"><div class="field"><label for="d-date">Preferred date</label><input id="d-date" type="date" min="${today()}"></div><div class="field"><label for="d-time">Preferred time</label><select id="d-time">${["10:00 – 12:00", "12:00 – 14:00", "16:00 – 18:00", "18:00 – 20:00"].map(t => `<option>${t}</option>`).join("")}</select></div></div>
      <div class="field"><label for="d-topic">Topic your child wants to try (optional)</label><input id="d-topic" placeholder="e.g. Fractions, Light, Atoms"></div>` : `<div class="field"><label for="d-email">Email (optional)</label><input id="d-email" type="email" autocomplete="email"></div><div class="field"><label for="d-msg">Message</label><textarea id="d-msg"></textarea></div>`}
      <div id="derr" class="err" role="alert"></div><button class="btn btn-or" style="border-radius:8px" type="submit">${kind === "leads" ? "Book my free demo" : "Send message"}</button></form>`;
  function mountLead(kind) {
    $("#leadf").onsubmit = async e => {
      e.preventDefault(); const name = $("#d-name").value.trim(), phone = $("#d-phone").value.replace(/[\s-]/g, "");
      if (name.length < 2) { $("#derr").textContent = "Please enter your name."; $("#d-name").focus(); return; }
      if (!/^(\+?91)?[6-9]\d{9}$/.test(phone)) { $("#derr").textContent = "Please enter a valid 10-digit Indian mobile number."; $("#d-phone").focus(); return; }
      const entry = kind === "leads" ? { name, phone, board: $("#d-board").value, cls: $("#d-cls").value, date: $("#d-date").value, time: $("#d-time").value, topic: $("#d-topic").value.trim() } : { name, phone, email: $("#d-email").value.trim(), msg: $("#d-msg").value.trim() };
      if (kind === "messages" && entry.msg.length < 5) { $("#derr").textContent = "Please write a short message."; $("#d-msg").focus(); return; }
      const btn = $("#leadf button[type=submit]"); btn.disabled = true; btn.textContent = "Sending…";
      const ok = await submitLead(kind, entry);
      $("#leadf").outerHTML = ok ? `<div class="okbox"><b>${kind === "leads" ? "Your demo request is in." : "Message received."}</b> Our team will call ${esc(name)} on ${esc(phone)}${kind === "leads" && entry.date ? ` to confirm ${esc(entry.date)}, ${esc(entry.time)}` : ""}. Need us sooner? Call ${B.phone}.</div>`
        : `<div class="warnbox"><b>We couldn't send this online from here</b>, so it's saved on this device only. Please call ${B.phone} or email ${B.email} and we'll set it up.</div>`;
      if (kind === "leads" && S.profile) logAct("demo", "Booked a free demo");
    };
  }
  P["book-demo"] = () => ({
    html: `<section class="phead"><div class="wrap">${crumbs([["Home", "home"], ["Book a free demo"]])}<div class="coursegrid"><div><span class="eyebrow">Free demo</span><h1>Book a free 30-minute demo</h1><p class="lead" style="margin-top:12px">Your child tries Nova and the labs on a topic of your choice, live with our team. No payment, no obligation.</p><div class="card" style="margin-top:24px">${leadForm("leads")}</div></div>
      <aside class="side" style="margin-top:8px"><div class="card"><h3>What happens in the demo</h3><ul class="list small"><li>${ic("tick")}<span>Your child asks Nova real doubts from their chapter</span></li><li>${ic("tick")}<span>They try two or three interactive labs</span></li><li>${ic("tick")}<span>You see the parent dashboard and reports</span></li><li>${ic("tick")}<span>We help you pick the right plan, if you want one</span></li></ul></div><div class="card"><h3>Prefer to talk?</h3><p class="muted small" style="margin:8px 0">${ic("phone")} ${B.phone}<br>${ic("mail")} ${B.email}</p></div></aside></div></div></section>`,
    mount() { mountLead("leads"); }
  });
  P.contact = () => ({
    html: `<section class="phead"><div class="wrap">${crumbs([["Home", "home"], ["Contact us"]])}<div class="coursegrid"><div><span class="eyebrow">Contact</span><h1>We'd love to hear from you</h1><div class="card" style="margin-top:24px">${leadForm("messages")}</div></div>
      <aside class="side"><div class="card"><h3>Reach us</h3><ul class="list small"><li>${ic("phone")}<span>${B.phone}</span></li><li>${ic("mail")}<span>${B.email}</span></li><li>${ic("pin")}<span>${B.address}</span></li></ul><p class="tiny" style="margin-top:12px">Monday to Saturday, 10:00 to 19:00 IST</p></div></aside></div></div></section>`,
    mount() { mountLead("messages"); }
  });

  /* ----- admin (owner only) ----- */
  P.admin = () => ({
    html: `<section class="phead"><div class="wrap"><span class="eyebrow">Admin</span><h1>Demo requests and messages</h1><p class="lead" style="margin-top:8px">Only the owner of this app can see this page.</p></div></section><section class="band" style="padding-top:0"><div class="wrap" id="adm"><p class="muted"><span class="spin"></span> Loading…</p></div></section>`,
    async mount() {
      await remoteReady; const el = $("#adm"); if (!el) return;
      if (!caps.owner || !caps.db) { el.innerHTML = `<div class="warnbox">This page is only available to the app's owner.</div>`; return; }
      const load = async c => { try { const s = await caps.db.collection(c).get(); return s.docs.flatMap(d => (d.data().items || [])); } catch { return []; } };
      const [leads, msgs] = await Promise.all([load("leads"), load("messages")]);
      leads.sort((a, b) => String(b.at).localeCompare(String(a.at))); msgs.sort((a, b) => String(b.at).localeCompare(String(a.at)));
      const tbl = (rows, cols) => rows.length ? `<div class="card scroll" style="padding:6px 16px"><table class="cmp"><thead><tr>${cols.map(c => `<th>${c[0]}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${esc(r[c[1]] || "—")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<p class="muted">Nothing yet.</p>`;
      el.innerHTML = `<h2 style="margin-bottom:14px">Demo requests (${leads.length})</h2>${tbl(leads, [["Name", "name"], ["Phone", "phone"], ["Board", "board"], ["Class", "cls"], ["Date", "date"], ["Time", "time"], ["Topic", "topic"]])}<h2 style="margin:36px 0 14px">Messages (${msgs.length})</h2>${tbl(msgs, [["Name", "name"], ["Phone", "phone"], ["Email", "email"], ["Message", "msg"]])}`;
    }
  });

  /* ----- blog + legal ----- */
  P.blog = id => { const p = NS.BLOG.find(x => x.id === id); if (!p) return notFound(); return `<section class="phead"><div class="wrap" style="max-width:780px">${crumbs([["Home", "home"], ["Blog", "home"], [p.cat]])}<span class="eyebrow">${p.cat}</span><h1>${esc(p.title)}</h1><p class="tiny" style="margin-top:10px">${p.date} · ${p.mins} min read</p></div></section><section class="band" style="padding-top:0"><div class="wrap lesson" style="max-width:780px;font-size:17px">${p.body.map(t => `<p>${esc(t)}</p>`).join("")}<div class="cta" style="margin-top:30px"><h3>Try it with Nova</h3><button class="btn btn-blue" id="askpost">Ask Nova about this</button></div><h3 style="margin-top:40px">More posts</h3><div class="grid g3" style="margin-top:14px">${NS.BLOG.filter(x => x.id !== id).slice(0, 3).map(postCard).join("")}</div></div></section>`; };
  P.blog.mount = id => { const p = NS.BLOG.find(x => x.id === id), b = $("#askpost"); if (b) b.onclick = () => openTutorWith(`I just read "${p.title}". Can you give me 3 practical tips from this I can use this week?`); };
  const legal = k => () => { const L = NS.LEGAL[k]; return `<section class="phead"><div class="wrap" style="max-width:820px">${crumbs([["Home", "home"], [L.title]])}<h1>${L.title}</h1><p class="tiny" style="margin-top:8px">Last updated 1 November 2026</p></div></section><section class="band" style="padding-top:0"><div class="wrap" style="max-width:820px;display:grid;gap:14px">${L.body.map(([h, t]) => `<div class="card"><h3>${h}</h3><p class="muted" style="margin-top:6px">${t}</p></div>`).join("")}</div></section>`; };
  ["child-safety", "accessibility", "privacy", "terms", "cookies"].forEach(k => P[k] = legal(k));
  function notFound() { return `<section class="band"><div class="wrap center"><h1>Page not found</h1><p class="lead">That page doesn't exist or has moved.</p><a class="btn btn-blue" style="margin-top:20px" href="#home">Go home</a></div></section>`; }

  /* ---------- router ---------- */
  const PREFIX = [["lab-", "lab"], ["course-", "course"], ["chapter-", "chapter"], ["blog-", "blog"]];
  function route() {
    cleanups.forEach(f => { try { f(); } catch { } }); cleanups = []; closeModal();
    const h = decodeURIComponent(location.hash.slice(1)) || "home";
    let fn = P[h], arg;
    if (!fn) for (const [p, k] of PREFIX) if (h.startsWith(p)) { fn = P[k]; arg = h.slice(p.length); }
    const out = fn ? fn(arg) : notFound();
    const html = typeof out === "string" ? out : out.html;
    app.innerHTML = html;
    try { if (out && out.mount) out.mount(); else if (fn && fn.mount) fn.mount(arg); } catch (e) { console.error(e); }
    const top = h.split("-")[0]; $$("[data-nav]").forEach(a => a.classList.toggle("on", a.dataset.nav === (["course", "chapter"].includes(top) ? "programmes" : top === "lab" ? "labs" : h)));
    $("#fab").style.display = h === "tutor" ? "none" : ""; if (h === "tutor") $("#drawer").classList.remove("open");
    document.title = `${({ home: "AI-Powered Personalised Learning", about: "About Us", programmes: "Programmes", labs: "Labs", plans: "Plans", login: "Student Login", dashboard: "Dashboard", tutor: "AI Tutor", "book-demo": "Book a Free Demo", contact: "Contact" })[h] || (h.startsWith("lab-") ? (NS.LABS.find(l => "lab-" + l.id === h) || {}).name || "Lab" : "Learn")} | ${B.name}`;
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  /* ---------- boot ---------- */
  renderChrome();
  $("#fab").innerHTML = ic("robot"); $("#fab").onclick = () => $("#drawer").classList.toggle("open");
  mountTutor($("#drawer"), true);
  route();
}
