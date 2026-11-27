/* NovaSchool — management & learning portal (ERP-style glass layout, role-based navigation).
   Students & parents: learning portal. Teachers & admins: management console backed by Supabase (RLS-enforced). */
(function () {
  const NS = window.NS, B = NS.BRAND;
  const X = () => NS.app, A = () => NS.auth;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } } };
  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const fmtDT = d => d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
  const ago = d => { if (!d) return "never"; const s = (Date.now() - new Date(d)) / 1000; return s < 60 ? "just now" : s < 3600 ? Math.floor(s / 60) + "m ago" : s < 86400 ? Math.floor(s / 3600) + "h ago" : Math.floor(s / 86400) + "d ago"; };
  const title = s => String(s || "").replace(/(^|[_\s-])(\w)/g, (m, a, b) => (a ? " " : "") + b.toUpperCase());

  const EXTRA = {
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    pin: '<path d="M12 17v5M9 10.8V4h6v6.8l3 3.2H6z"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    rupee: '<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a5 5 0 0 0 0-10"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
  };
  const ic = (n, c = "icon") => `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${EXTRA[n] || X().I[n] || ""}</svg>`;

  /* ---------- roles & navigation ---------- */
  const ALL = ["student", "parent", "teacher", "admin"], STAFF = ["teacher", "admin"], ADMIN = ["admin"];
  const NAV = [
    { label: "Overview", items: [["portal", "Dashboard", "grid", ALL], ["portal-notices", "Notice Board", "bell", ALL], ["portal-tutor", "AI Tutor", "robot", ALL]] },
    { label: "My Learning", items: [["portal-learning", "My Subjects", "book", ALL], ["portal-tests", "Tests & Results", "file", ALL], ["portal-labs", "Virtual Labs", "flask", ALL], ["portal-reports", "Revision & Reports", "star", ALL]] },
    { label: "Management", items: [["portal-admin", "Control Center", "gauge", STAFF], ["portal-users", "Users & Roles", "users", STAFF], ["portal-leads", "Admission Leads", "phone", STAFF], ["portal-messages", "Messages", "inbox", STAFF], ["portal-results", "Test Analytics", "trend", STAFF], ["portal-manage-notices", "Publish Notices", "pin", STAFF], ["portal-content", "Curriculum & Labs", "layers", STAFF], ["portal-audit", "Audit Log", "shield", ADMIN]] },
    { label: "Account", items: [["portal-profile", "Profile & Security", "key", ALL], ["portal-plan", "Plan & Billing", "star", ALL]] }
  ];
  const role = () => { const a = A(); if (a && a.enabled && a.profile) return a.profile.role; const p = X().S.profile; return p ? (String(p.role || "student").toLowerCase() === "parent" ? "parent" : "student") : null; };
  const cloud = () => { const a = A(); return a && a.enabled && a.user ? a : null; };
  const navFor = r => NAV.map(g => ({ ...g, items: g.items.filter(i => i[3].includes(r)) })).filter(g => g.items.length);
  const allItems = NAV.flatMap(g => g.items);
  const titleFor = h => (allItems.find(i => i[0] === h) || [0, "Portal"])[1];

  /* ---------- UI kit (mirrors the MITK ERP components) ---------- */
  const head = (icon, eyebrow, t, sub, actions = "") => `<div class="pt-head" data-in><div class="pt-headl"><span class="pt-hic">${ic(icon)}</span><div><p class="pt-eyebrow">${esc(eyebrow)}</p><h1>${t}</h1>${sub ? `<p class="pt-sub">${sub}</p>` : ""}</div></div>${actions ? `<div class="pt-acts">${actions}</div>` : ""}</div>`;
  const label = t => `<div class="pt-label"><span>${esc(t)}</span><i></i></div>`;
  const ACC = { blue: "pt-a-blue", green: "pt-a-green", orange: "pt-a-orange", violet: "pt-a-violet", red: "pt-a-red" };
  const stat = (acc, icon, t, value, pct, pills = [], foot = "", href = "", i = 0) => `<a class="pt-stat ${ACC[acc]}" ${href ? `href="#${href}"` : ""} style="--i:${i}" data-in><span class="pt-shine"></span><div class="pt-stat-top"><span class="pt-stat-ic">${ic(icon)}</span><span class="pt-stat-arrow">${ic("arrow")}</span></div><p class="pt-stat-t">${esc(t)}</p><b class="pt-stat-v" ${typeof value === "number" ? `data-count="${value}"` : ""}>${typeof value === "number" ? 0 : esc(value)}</b><div class="pt-stat-bar"><i style="width:${Math.max(0, Math.min(100, pct || 0))}%"></i></div><div class="pt-pills">${pills.map(([l, v]) => `<span>${esc(v)} ${esc(l)}</span>`).join("")}</div>${foot ? `<p class="pt-stat-f">${esc(foot)}</p>` : ""}</a>`;
  const gcard = (t, icon, body, action = "", cls = "") => `<section class="pt-gcard ${cls}" data-in><header><p>${icon ? `<span>${ic(icon)}</span>` : ""}${esc(t)}</p>${action}</header><div class="pt-gbody">${body}</div></section>`;
  const card = (body, cls = "") => `<div class="pt-card ${cls}" data-in>${body}</div>`;
  const tiles = list => `<div class="pt-tiles">${list.map(([t, d, icon, href, grad], i) => `<a class="pt-tile" href="#${href}" style="--i:${i}" data-in><span class="pt-tile-ic" style="background:${grad}">${ic(icon)}</span><span><b>${esc(t)}</b><small>${esc(d)}</small></span>${ic("arrow", "icon pt-tile-go")}</a>`).join("")}</div>`;
  const STAT_CLS = { new: "b-blue", contacted: "b-amber", scheduled: "b-violet", converted: "b-green", lost: "b-grey", active: "b-green", suspended: "b-red", admin: "b-red", teacher: "b-violet", student: "b-blue", parent: "b-amber", starter: "b-grey", scholar: "b-blue", achiever: "b-violet", chapter: "b-blue", mock: "b-violet", demo: "b-blue", message: "b-amber" };
  const badge = s => `<span class="pt-badge ${STAT_CLS[s] || "b-grey"}">${esc(title(s))}</span>`;
  const empty = (t, hint = "") => `<div class="pt-empty">${ic("inbox")}<b>${esc(t)}</b>${hint ? `<p>${hint}</p>` : ""}</div>`;
  const loading = (t = "Loading…") => `<div class="pt-loading"><span class="spin"></span> ${esc(t)}</div>`;
  const hbars = (rows, color = "var(--pt-p)") => { const mx = Math.max(1, ...rows.map(r => r[1])); return `<div class="pt-hbars">${rows.map(([l, v, sfx = ""]) => `<div><span>${esc(l)}</span><i><em style="width:${v / mx * 100}%;background:${color}"></em></i><b>${esc(v)}${esc(sfx)}</b></div>`).join("") || empty("No data yet")}</div>`; };
  const vbars = (rows, color) => { const mx = Math.max(1, ...rows.map(r => r[1])); return `<div class="pt-vbars">${rows.map(([l, v]) => `<div title="${esc(l)}: ${esc(v)}"><b>${esc(v)}</b><i style="height:${Math.max(3, v / mx * 100)}%;${color ? "background:" + color : ""}"></i><span>${esc(l)}</span></div>`).join("")}</div>`; };
  const lockBox = (t, plan) => `<div class="pt-lock">${ic("lock")}<b>${esc(t)}</b><p>Included in the ${esc(plan)} plan.</p><a class="pt-btn pt-btn-p" href="#portal-plan">Upgrade</a></div>`;
  const csv = (rows) => rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  function download(name, text) { try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); X().toast("Export downloaded"); } catch { X().copy(text); } }
  const countUp = root => $$("[data-count]:not([data-done])", root).forEach(el => { el.dataset.done = 1; const to = +el.dataset.count, t0 = performance.now(); const f = n => { const p = Math.min(1, (n - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString("en-IN") + (el.dataset.sfx || ""); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); });

  /* ---------- shell ---------- */
  let dark = LS.get("ns_pt_dark", false), sideOpen = false;
  function shell(h, r, body) {
    const S = X().S, p = S.profile || {}, groups = navFor(r), a = A();
    const name = (a && a.profile && a.profile.full_name) || p.name || "User", av = (a && a.profile && a.profile.avatar_url) || "";
    const initials = name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const tab = (STAFF.includes(r) ? ["portal-admin", "portal-users", "portal-leads", "portal-profile"] : ["portal", "portal-learning", "portal-tests", "portal-profile"]).map(k => allItems.find(i => i[0] === k));
    return `<div class="pt ${dark ? "pt-dark" : ""}" id="pt"><div class="pt-blobs"><i></i><i></i><i></i></div>
      <aside class="pt-side ${sideOpen ? "open" : ""}" id="ptside" aria-label="Portal navigation"><div class="pt-glow"></div>
        <div class="pt-brand">${X().LOGO}<div><b>${B.first}<span>${B.second}</span></b><small>by ${B.parent}</small></div><button class="pt-x" id="ptclose" aria-label="Close menu">${ic("x")}</button></div>
        <p class="pt-portal">${esc(title(r))} portal</p>
        <nav class="pt-nav">${groups.map(g => `<div class="pt-group"><p>${esc(g.label)}</p>${g.items.map(([href, t, icon]) => `<a href="#${href}" class="${href === h ? "on" : ""}">${ic(icon)}<span>${esc(t)}</span></a>`).join("")}</div>`).join("")}</nav>
        <div class="pt-sfoot"><a href="#home">${ic("home")} Website</a><button id="ptout">${ic("logout")} Log out</button></div>
      </aside><div class="pt-scrim" id="ptscrim"></div>
      <div class="pt-main">
        <header class="pt-top"><button class="pt-ib" id="ptburger" aria-label="Open menu">${ic("menu")}</button>
          <h2 class="pt-title"><span class="pt-gt">${B.name}</span><span> — ${esc(titleFor(h))}</span></h2>
          <button class="pt-search" id="ptsearch">${ic("search")}<span>Search pages…</span><kbd>Ctrl K</kbd></button>
          <button class="pt-ib" id="pttheme" aria-label="Toggle dark mode">${ic(dark ? "sun" : "moon")}</button>
          <div class="pt-pop"><button class="pt-ib" id="ptbell" aria-label="Notifications">${ic("bell")}<i class="pt-dot" id="ptdot" hidden></i></button><div class="pt-menu" id="ptbellm"><p class="pt-mh">Notices</p><div id="ptbelll">${loading()}</div><a href="#portal-notices">View all notices</a></div></div>
          <div class="pt-pop"><button class="pt-userb" id="ptuser">${av ? `<img src="${esc(av)}" alt="" referrerpolicy="no-referrer">` : `<span>${esc(initials)}</span>`}<div><b>${esc(name)}</b><small>${esc(title(r))}</small></div></button>
            <div class="pt-menu" id="ptuserm"><p class="pt-mh">${esc(name)}<small>${esc((a && a.profile && a.profile.email) || p.email || "")}</small></p><a href="#portal-profile">${ic("key")} Profile & security</a><a href="#portal-plan">${ic("star")} Plan & billing</a><a href="#home">${ic("home")} Back to website</a><button id="ptout2">${ic("logout")} Log out</button></div></div>
        </header>
        <div class="pt-body" id="ptbody">${body}</div>
        <nav class="pt-tabbar">${tab.map(([href, t, icon]) => `<a href="#${href}" class="${href === h ? "on" : ""}">${ic(icon)}<span>${esc(t.split(" ")[0])}</span></a>`).join("")}</nav>
      </div></div>`;
  }
  function wireShell(r) {
    const pt = $("#pt"); if (!pt) return;
    const close = () => { sideOpen = false; $("#ptside").classList.remove("open"); $("#ptscrim").classList.remove("on"); };
    $("#ptburger").onclick = () => { sideOpen = true; $("#ptside").classList.add("open"); $("#ptscrim").classList.add("on"); };
    $("#ptclose").onclick = close; $("#ptscrim").onclick = close; $$(".pt-nav a").forEach(a => a.addEventListener("click", close));
    $("#pttheme").onclick = () => { dark = !dark; LS.set("ns_pt_dark", dark); pt.classList.toggle("pt-dark", dark); $("#pttheme").innerHTML = ic(dark ? "sun" : "moon"); };
    const pop = (btn, menu) => { $(btn).onclick = e => { e.stopPropagation(); const m = $(menu), was = m.classList.contains("open"); $$(".pt-menu.open").forEach(x => x.classList.remove("open")); m.classList.toggle("open", !was); }; };
    pop("#ptbell", "#ptbellm"); pop("#ptuser", "#ptuserm");
    document.addEventListener("click", closeMenus);
    $("#ptout").onclick = $("#ptout2").onclick = () => X().signOut();
    $("#ptsearch").onclick = openSearch;
    loadNotices().then(list => { const l = $("#ptbelll"); if (!l) return; l.innerHTML = list.length ? list.slice(0, 5).map(n => `<a href="#portal-notices" class="pt-note">${n.pinned ? ic("pin") : ""}<span><b>${esc(n.title)}</b><small>${fmtDate(n.created_at)}</small></span></a>`).join("") : `<p class="pt-mempty">No notices</p>`; const seen = LS.get("ns_seen_notice", 0), newest = list[0] ? +new Date(list[0].created_at) : 0; const d = $("#ptdot"); if (d) d.hidden = !(newest > seen); $("#ptbell").addEventListener("click", () => { LS.set("ns_seen_notice", newest); if (d) d.hidden = true; }); });
  }
  const closeMenus = () => $$(".pt-menu.open").forEach(x => x.classList.remove("open"));
  function onKey(e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && document.body.classList.contains("portal-mode")) { e.preventDefault(); openSearch(); } }
  document.addEventListener("keydown", onKey);
  function openSearch() {
    const r = role(), items = navFor(r).flatMap(g => g.items.map(i => [...i, g.label]));
    X().modal(`<div class="pt-cmd"><div class="pt-cmdin">${ic("search")}<input id="cmdq" placeholder="Jump to a page…" autocomplete="off"></div><div id="cmdl" class="pt-cmdl"></div></div>`, m => {
      const q = $("#cmdq", m), l = $("#cmdl", m); let sel = 0;
      const draw = () => { const f = items.filter(i => (i[1] + " " + i[4]).toLowerCase().includes(q.value.toLowerCase())); sel = Math.min(sel, Math.max(0, f.length - 1)); l.innerHTML = f.map((i, k) => `<a href="#${i[0]}" class="${k === sel ? "on" : ""}">${ic(i[2])}<span>${esc(i[1])}</span><small>${esc(i[4])}</small></a>`).join("") || `<p class="pt-mempty">No matching page</p>`; l.onclick = () => X().closeModal(); return f; };
      let f = draw(); q.oninput = () => { sel = 0; f = draw(); };
      q.onkeydown = e => { if (e.key === "ArrowDown") { sel = Math.min(f.length - 1, sel + 1); f = draw(); e.preventDefault(); } if (e.key === "ArrowUp") { sel = Math.max(0, sel - 1); f = draw(); e.preventDefault(); } if (e.key === "Enter" && f[sel]) { location.hash = f[sel][0]; X().closeModal(); } };
      setTimeout(() => q.focus(), 30);
    });
    $("#modal .card").classList.add("pt-cmdcard");
  }

  /* ---------- data ---------- */
  let noticeCache = null;
  async function loadNotices() {
    const c = cloud();
    if (!c) return [{ id: 0, title: "Welcome to " + B.name, body: "Your learning portal is ready. Pick up where you left off, ask Nova any doubt, and try the labs.", audience: "all", pinned: true, created_at: new Date().toISOString() }];
    if (noticeCache && Date.now() - noticeCache.t < 30000) return noticeCache.d;
    const r = role(), { data } = await c.client.from("ns_notices").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(50);
    const aud = r === "student" ? ["all", "students"] : r === "parent" ? ["all", "parents"] : ["all", "students", "parents", "staff"];
    const d = (data || []).filter(n => aud.includes(n.audience)); noticeCache = { t: Date.now(), d }; return d;
  }
  async function myResults() {
    const c = cloud();
    if (!c) return X().S.tests.map(t => ({ title: t.title, score: t.score, total: t.total, created_at: t.date, subject: (t.title.split(":")[0] || "").replace(/ mock$/, ""), kind: /mock/.test(t.title) ? "mock" : "chapter" }));
    const { data } = await c.client.from("ns_test_results").select("*").eq("user_id", c.user.id).order("created_at", { ascending: false }).limit(200);
    return data || [];
  }

  /* ================= PAGES ================= */
  const PG = {};
  const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

  /* ----- learner dashboard ----- */
  PG.portal = () => {
    const r = role(); if (STAFF.includes(r)) return PG["portal-admin"]();
    const ap = X(), S = ap.S, p = S.profile, cs = ap.allCourseStats(), done = cs.reduce((a, c) => a + c.done, 0), total = cs.reduce((a, c) => a + c.total, 0), pct = total ? Math.round(done / total * 100) : 0;
    const wk = ap.last7(), mins = wk.reduce((a, w) => a + w[1], 0), avg = S.tests.length ? Math.round(S.tests.reduce((a, t) => a + t.score / t.total, 0) / S.tests.length * 100) : 0;
    const bn = NS.BOARDS.find(b => b.id === p.board).name, cont = cs.find(c => c.pct < 100) || cs[0];
    return {
      html: head("grid", `${greet()}, ${p.name.split(" ")[0]}`, r === "parent" ? "Parent Control Center" : "Student Control Center", `${bn} · Class ${p.cls}${+p.cls >= 11 ? " · " + p.stream : ""} · ${ap.planName()} plan`, `<a class="pt-btn" href="#portal-tutor">${ic("robot")} Ask Nova</a><a class="pt-btn pt-btn-p" href="#course-${cont.key}">${ic("play")} Continue ${esc(cont.s.name)}</a>`)
        + label("Learning overview") + `<div class="pt-stats">${stat("blue", "chart", "Overall progress", pct, pct, [["lectures done", `${done}/${total}`]], `${cs.length} subjects`, "portal-learning", 0).replace(`data-count="${pct}"`, `data-count="${pct}" data-sfx="%"`)}${stat("violet", "file", "Average test score", avg, avg, [["tests taken", S.tests.length]], ap.ACH() ? "Chapter tests & mocks" : "Tests on Achiever", "portal-tests", 1).replace(`data-count="${avg}"`, `data-count="${avg}" data-sfx="%"`)}${stat("orange", "robot", "Nova questions today", ap.tqToday(), ap.PAID() ? 100 : ap.tqToday() / 5 * 100, [["limit", ap.PAID() ? "No" : "5/day"]], ap.PAID() ? "Unlimited on your plan" : `${Math.max(0, 5 - ap.tqToday())} left today`, "portal-tutor", 2)}${stat("green", "clock", "Minutes this week", mins, Math.min(100, mins / 140 * 100), [["daily goal", "20 min"]], "Goal: 140 min / week", "portal-reports", 3)}</div>`
        + label("Quick actions") + tiles([["Continue learning", `Resume ${cont.s.name}`, "play", `course-${cont.key}`, "linear-gradient(135deg,#2563eb,#22d3ee)"], ["Ask Nova", "Doubts answered step by step", "robot", "portal-tutor", "linear-gradient(135deg,#7c3aed,#c084fc)"], ["Take a test", "Chapter tests & mock exams", "file", "portal-tests", "linear-gradient(135deg,#ea580c,#fbbf24)"], ["Virtual labs", `${NS.LABS.length} interactive simulations`, "flask", "portal-labs", "linear-gradient(135deg,#059669,#2dd4bf)"], ["Revision plan", "7-day plan from your weak spots", "star", "portal-reports", "linear-gradient(135deg,#e11d48,#fb923c)"], ["My plan", ap.planName() + " · manage billing", "rupee", "portal-plan", "linear-gradient(135deg,#0284c7,#818cf8)"]])
        + label("Activity & insights") + `<div class="pt-grid3"><div class="pt-span2">${gcard("Subject progress", "book", `<div class="pt-subrows">${cs.map(c => `<a class="pt-subrow" href="#course-${c.key}"><span class="pt-sic">${ic(c.s.icon)}</span><span class="pt-subn"><b>${esc(c.s.name)}</b><small>${c.s.chapters.length} chapters · ${c.done}/${c.total} lectures</small></span><span class="pt-prog"><i style="width:${c.pct}%"></i></span><b>${c.pct}%</b></a>`).join("")}</div>`, `<a class="pt-gact" href="#portal-learning">All subjects</a>`)}
          ${gcard("This week", "chart", vbars(wk.map(([d, m]) => [d, m])) + `<p class="pt-muted">${mins < 60 ? "Short daily sessions beat long weekend cramming — aim for 20 minutes a day." : "Great consistency this week. Keep the streak going!"}</p>`)}</div>
          <div>${gcard("Notice board", "bell", loading(), `<a class="pt-gact" href="#portal-notices">All</a>`, "pt-notices")}${gcard("Recent activity", "clock", S.log.slice(0, 6).map(l => `<div class="pt-act"><i></i><span>${esc(l.label)}</span><small>${esc(l.date)}</small></div>`).join("") || empty("No activity yet", "Open a lecture or a lab to get started."))}</div></div>`,
      async mount(root) { const list = await loadNotices(); const el = $(".pt-notices .pt-gbody", root); if (el) el.innerHTML = list.slice(0, 4).map(n => `<div class="pt-notice">${n.pinned ? ic("pin") : ""}<div><b>${esc(n.title)}</b><small>${fmtDate(n.created_at)}</small></div></div>`).join("") || empty("No notices"); }
    };
  };

  PG["portal-learning"] = () => {
    const ap = X(), S = ap.S, p = S.profile, cs = ap.allCourseStats();
    const all = NS.subjectsFor(p.board, p.cls, "PCMB").length;
    return head("book", "My learning", "My Subjects", `${NS.BOARDS.find(b => b.id === p.board).name} · Class ${p.cls} · chapter 1 of every subject is free`, `<a class="pt-btn" href="#programmes">Browse all boards</a>`)
      + `<div class="pt-subjects">${cs.map((c, i) => { const next = c.s.chapters.findIndex((_, k) => { const pr = ap.S.progress[`${c.key}:${k}`] || []; return pr.filter(Boolean).length < 4; }); const n = next < 0 ? 0 : next; return `<div class="pt-subj" style="--i:${i}" data-in><div class="pt-subj-top"><span class="pt-sic big">${ic(c.s.icon)}</span><div><b>${esc(c.s.name)}</b><small>${c.s.chapters.length} chapters · ${c.total} lectures</small></div><span class="pt-ring" style="--p:${c.pct}"><em>${c.pct}%</em></span></div><p class="pt-muted">Next up: <b>Chapter ${n + 1}: ${esc(c.s.chapters[n])}</b>${n > 0 && !ap.PAID() ? " " + badge("locked") : ""}</p><div class="pt-prog"><i style="width:${c.pct}%"></i></div><div class="pt-subj-acts"><a class="pt-btn pt-btn-p" href="#chapter-${c.key}-${n + 1}">${ic("play")} ${c.done ? "Continue" : "Start"}</a><a class="pt-btn" href="#course-${c.key}">All chapters</a></div></div>`; }).join("")}</div>`
      + (+p.cls >= 11 && all > cs.length ? `<p class="pt-muted" style="margin-top:14px">Showing your ${esc(p.stream)} subjects. Change your stream in <a href="#portal-profile">Profile</a>.</p>` : "");
  };

  PG["portal-tests"] = () => {
    const ap = X(), S = ap.S, cs = ap.allCourseStats(), bn = NS.BOARDS.find(b => b.id === S.profile.board).name;
    return {
      html: head("file", "Assessments", "Tests & Results", "Instant marking with explanations, saved to your account") + `<div class="pt-grid3"><div class="pt-span2">${gcard("Start a test", "trophy" in X().I ? "trophy" : "file", ap.ACH() ? `<div class="pt-form2"><label>Subject<select id="t-sub">${cs.map((c, k) => `<option value="${k}">${esc(c.s.name)}</option>`).join("")}</select></label><label>Chapter<select id="t-ch"></select></label></div><div class="pt-row"><button class="pt-btn pt-btn-p" id="t-go">${ic("file")} Chapter test · 10 questions</button><button class="pt-btn pt-btn-o" id="t-mock">${ic("clock")} Mock exam · 20 questions · 30 min</button></div>` : lockBox("Chapter tests and mock exams", "Achiever"))}
        ${gcard("Result history", "trend", loading(), "", "pt-hist")}</div><div>${gcard("Average by subject", "chart", loading(), "", "pt-avg")}${gcard("How marking works", "bulb", `<ul class="pt-ul"><li>Questions are written fresh for your board and class.</li><li>Each answer shows the correct option and a one-line reason.</li><li>Mock exams auto-submit when the timer ends.</li><li>Every result is saved and shown to parents in reports.</li></ul>`)}</div></div>`,
      async mount(root) {
        const ts = $("#t-sub", root); if (ts) { const fill = () => { $("#t-ch").innerHTML = cs[+ts.value].s.chapters.map((t, i) => `<option value="${i}">${i + 1}. ${esc(t)}</option>`).join(""); }; ts.onchange = fill; fill(); $("#t-go").onclick = () => { const c = cs[+ts.value]; ap.startTest({ kind: "chapter", subject: c.s.name, chapter: c.s.chapters[+$("#t-ch").value], board: bn, cls: S.profile.cls, n: 10 }); }; $("#t-mock").onclick = () => { const c = cs[+ts.value]; ap.startTest({ kind: "mock", subject: c.s.name, chapters: c.s.chapters, board: bn, cls: S.profile.cls, n: 20, minutes: 30 }); }; }
        const res = await myResults();
        const h = $(".pt-hist .pt-gbody", root); if (h) h.innerHTML = res.length ? table(["Test", "Type", "Score", "Date"], res.map(x => [esc(x.title), badge(x.kind || "chapter"), `<b>${x.score}/${x.total}</b> <small class="pt-muted">${Math.round(x.score / x.total * 100)}%</small>`, fmtDate(x.created_at)])) : empty("No tests yet", "Your results will appear here.");
        const by = {}; res.forEach(x => { const k = x.subject || "Other"; (by[k] = by[k] || []).push(x.score / x.total); });
        const av = $(".pt-avg .pt-gbody", root); if (av) av.innerHTML = hbars(Object.entries(by).map(([k, v]) => [k, Math.round(v.reduce((a, b) => a + b, 0) / v.length * 100), "%"]), "linear-gradient(90deg,#7c3aed,#22d3ee)");
      }
    };
  };

  PG["portal-tutor"] = () => ({ html: head("robot", "Learning companion", "AI Tutor — Nova", "Step-by-step help in English, Hindi or Hinglish") + `<div class="pt-tutor" id="pttutor" data-in></div>`, mount(root) { const off = X().mountTutor($("#pttutor", root), false); X().onLeave(off); } });

  PG["portal-labs"] = () => { const ap = X(); return head("flask", "Experiments", "Virtual Labs", `${NS.LABS.length} interactive simulations${ap.PAID() ? "" : " · Pendulum, Lens and Magnet are free"}`) + `<div class="pt-labs">${NS.LABS.map((l, i) => `<a class="pt-lab" href="#lab-${l.id}" style="--i:${i}" data-in><div class="pt-labthumb"><canvas data-thumb="${l.id}"></canvas>${ap.labOpen(l.id) ? "" : `<span class="pt-labl">${ic("lock")} Scholar</span>`}</div><div class="pt-labb"><div class="pt-row">${badge(l.subj.toLowerCase())}<small class="pt-muted">Class ${l.cls}</small></div><b>${esc(l.name)}</b><small>${esc(l.desc)}</small></div></a>`).join("")}</div>`; };
  const afterLabs = root => requestAnimationFrame(() => $$("canvas[data-thumb]", root).forEach(c => NS.thumbLab(c, c.dataset.thumb)));

  PG["portal-reports"] = () => {
    const ap = X(), S = ap.S;
    return {
      html: head("star", "Progress", "Revision & Reports", "Personal revision plans and parent progress reports") + `<div class="pt-grid2">${gcard("7-day revision plan", "star", ap.ACH() ? `<div id="rev" class="lesson">${S.revision ? ap.md(S.revision.text) + `<p class="pt-muted">Made on ${esc(S.revision.date)}</p>` : `<p class="pt-muted">Built from your weakest chapters and test scores.</p>`}</div><button class="pt-btn pt-btn-p" id="mkrev">${ic("refresh")} ${S.revision ? "Refresh plan" : "Make my plan"}</button>` : lockBox("Personalised revision plans", "Achiever"))}
        ${gcard("Parent progress report", "heart", ap.ACH() ? `<pre class="pt-report" id="rep">${esc(ap.reportText())}</pre><div class="pt-row"><button class="pt-btn pt-btn-p" id="cprep">${ic("copy")} Copy report</button><button class="pt-btn" id="dlrep">${ic("dl")} Download</button></div>` : lockBox("Parent progress reports", "Achiever"))}</div>`,
      mount(root) {
        const mk = $("#mkrev", root); if (mk) mk.onclick = async () => {
          mk.disabled = true; const el = $("#rev"); el.innerHTML = loading("Building your plan…");
          const cs = ap.allCourseStats(), weak = cs.map(c => `${c.s.name}: ${c.pct}% of lectures done`).join("; "), tests = S.tests.slice(0, 10).map(t => `${t.title} ${t.score}/${t.total}`).join("; ") || "no tests yet";
          try { const text = await ap.ai([{ role: "user", content: `${ap.tutorRules(S.profile.lang)}\n\nMake a 7-day revision plan (Day 1 … Day 7) for this student. Progress: ${weak}. Recent tests: ${tests}. Focus on weak areas, 25–40 minutes a day, name specific chapters, short list per day, under 250 words.` }], { onText: ({ text }) => el.innerHTML = ap.md(text) }); S.revision = { text, date: ap.today() }; ap.save(); el.innerHTML = ap.md(text); }
          catch (e) { const fb = cs.filter(c => c.pct < 100).slice(0, 7); const text = fb.map((c, i) => `- **Day ${i + 1}:** ${c.s.name} — "${c.s.chapters[Math.min(c.s.chapters.length - 1, Math.floor(c.done / 4))]}" (30 min) + 10 min recap`).join("\n"); S.revision = { text, date: ap.today() }; ap.save(); el.innerHTML = ap.md(text) + `<p class="pt-muted">${esc(ap.aiErr(e))} Made from your progress instead.</p>`; }
          mk.disabled = false;
        };
        const cp = $("#cprep", root); if (cp) { cp.onclick = () => ap.copy(ap.reportText()); $("#dlrep").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ap.reportText()], { type: "text/plain" })); a.download = "progress-report.txt"; a.click(); }; }
      }
    };
  };

  PG["portal-notices"] = () => ({ html: head("bell", "Announcements", "Notice Board", "Updates from the " + B.name + " team") + `<div id="nlist">${loading()}</div>`, async mount(root) { const l = await loadNotices(); $("#nlist", root).innerHTML = l.length ? l.map((n, i) => card(`<div class="pt-nhead">${n.pinned ? `<span class="pt-pin">${ic("pin")} Pinned</span>` : ""}${badge(n.audience)}<small class="pt-muted">${fmtDate(n.created_at)}</small></div><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p>`, "pt-ncard")).join("") : empty("No notices yet"); } });

  PG["portal-plan"] = () => {
    const ap = X(), S = ap.S, cur = NS.PLANS.find(p => p.id === S.plan);
    return {
      html: head("star", "Subscription", "Plan & Billing", `You're on <b>${esc(cur.name)}</b>${S.plan !== "starter" ? ` · billed ${S.billing === "y" ? "yearly" : "monthly"}` : ""}`) + `<div class="pt-plans">${NS.PLANS.map(p => `<div class="pt-plan ${p.id === S.plan ? "cur" : ""} ${p.popular ? "pop" : ""}" data-in>${p.popular ? `<span class="pt-ptag">Most popular</span>` : ""}<b>${esc(p.name)}</b><p class="pt-price">${p.m ? ap.inr(p.m) : "Free"}<small>${p.m ? "/month" : ""}</small></p><p class="pt-muted">${p.y ? `or ${ap.inr(p.y)}/year` : "No card needed"}</p><ul class="pt-ul">${p.feats.map(f => `<li>${esc(f)}</li>`).join("")}</ul>${p.id === S.plan ? `<span class="pt-btn" aria-disabled="true">${ic("tick")} Current plan</span>` : `<button class="pt-btn pt-btn-p" data-plan="${p.id}">Switch to ${esc(p.name)}</button>`}</div>`).join("")}</div>${card(`<p class="pt-muted">${NS.CONFIG.paymentsLive ? "Payments are processed securely." : "Online payments aren't connected yet, so switching plans activates them in demo mode. Prices are indicative and confirmed during your demo."}</p>`)}`,
      mount(root) { $$("[data-plan]", root).forEach(b => b.onclick = () => ap.choosePlan(b.dataset.plan)); }
    };
  };

  PG["portal-profile"] = () => {
    const ap = X(), a = cloud(), S = ap.S, p = a ? a.profile : S.profile, jwt = a ? a.jwt() : null;
    const pv = a ? (a.profile.provider || "email") : "device";
    const f = a ? { name: p.full_name, role: p.role, board: p.board, cls: p.cls, stream: p.stream, lang: p.lang, phone: p.phone } : { name: p.name, role: String(p.role).toLowerCase(), board: p.board, cls: p.cls, stream: p.stream, lang: p.lang, phone: "" };
    return {
      html: head("key", "Account", "Profile & Security", a ? `${esc(p.email)} · signed in with ${esc(title(pv))}` : "Saved on this device") + `<div class="pt-grid3"><div class="pt-span2">${gcard("Personal details", "user", `<form id="pf" class="pt-form" novalidate><div class="pt-form2"><label>Full name<input id="pf-name" value="${esc(f.name)}" maxlength="120"></label><label>Mobile<input id="pf-phone" value="${esc(f.phone || "")}" inputmode="tel" placeholder="10-digit mobile"></label>
          <label>Board<select id="pf-board">${NS.BOARDS.map(b => `<option value="${b.id}" ${f.board === b.id ? "selected" : ""}>${b.name}</option>`).join("")}</select></label><label>Class<select id="pf-cls">${NS.CLASSES.map(c => `<option ${+f.cls === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
          <label id="pf-sf">Stream<select id="pf-stream">${Object.keys(NS.STREAMS).map(x => `<option ${f.stream === x ? "selected" : ""}>${x}</option>`).join("")}</select></label><label>Tutor language<select id="pf-lang">${["English", "Hindi", "Hinglish"].map(l => `<option ${f.lang === l ? "selected" : ""}>${l}</option>`).join("")}</select></label></div><p class="pt-err" id="pferr"></p><button class="pt-btn pt-btn-p" type="submit">${ic("tick")} Save changes</button></form>`)}
        ${a && pv === "email" ? gcard("Change password", "lock", `<form id="pw" class="pt-form" novalidate><div class="pt-form2"><label>New password<input type="password" id="pw1" autocomplete="new-password"></label><label>Confirm<input type="password" id="pw2" autocomplete="new-password"></label></div><p class="pt-err" id="pwerr"></p><button class="pt-btn pt-btn-p" type="submit">Update password</button></form>`) : ""}</div>
        <div>${gcard("Account", "shield", `<dl class="pt-dl"><dt>Role</dt><dd>${badge(f.role)}</dd><dt>Plan</dt><dd>${badge(S.plan)}</dd><dt>Sign-in method</dt><dd>${esc(title(pv))}</dd><dt>Member since</dt><dd>${a ? fmtDate(p.created_at) : esc(p.since || "—")}</dd>${a ? `<dt>Last active</dt><dd>${esc(ago(p.last_seen_at))}</dd><dt>Status</dt><dd>${badge(p.status)}</dd>` : ""}</dl>`)}
        ${a ? gcard("Session (JWT)", "key", jwt ? `<dl class="pt-dl"><dt>Token type</dt><dd>${esc(jwt.header.typ || "JWT")} · ${esc(jwt.header.alg)}</dd><dt>Issued</dt><dd>${fmtDT(jwt.claims.iat * 1000)}</dd><dt>Expires</dt><dd id="jexp">${fmtDT(jwt.claims.exp * 1000)}</dd><dt>Auth level</dt><dd>${esc((jwt.claims.aal || "aal1").toUpperCase())}</dd><dt>Audience</dt><dd>${esc(jwt.claims.aud)}</dd></dl><p class="pt-muted">Your session token is signed by the server and refreshed automatically before it expires. Every database request is checked against it.</p><div class="pt-row"><button class="pt-btn" id="jref">${ic("refresh")} Refresh now</button><button class="pt-btn" id="soall">${ic("logout")} Sign out all devices</button></div>` : empty("No active session")) : card(`<p class="pt-muted">Sign in on the hosted site to sync this account across devices.</p>`)}</div></div>`,
      mount(root) {
        const sf = () => $("#pf-sf", root).style.display = +$("#pf-cls").value >= 11 ? "" : "none"; $("#pf-cls").onchange = sf; sf();
        $("#pf", root).onsubmit = async e => {
          e.preventDefault(); const name = $("#pf-name").value.trim(), phone = $("#pf-phone").value.replace(/[\s-]/g, ""), err = $("#pferr");
          if (name.length < 2) { err.textContent = "Please enter your name."; return; }
          if (phone && !/^(\+?91)?[6-9]\d{9}$/.test(phone)) { err.textContent = "Please enter a valid 10-digit mobile number."; return; }
          const patch = { board: $("#pf-board").value, cls: +$("#pf-cls").value, stream: +$("#pf-cls").value >= 11 ? $("#pf-stream").value : null, lang: $("#pf-lang").value };
          try {
            if (a) await a.updateProfile({ full_name: name, phone: phone || null, ...patch });
            else { Object.assign(S.profile, { name, ...patch, stream: patch.stream || "PCM" }); ap.save(); ap.renderChrome(); }
            err.textContent = ""; ap.toast("Profile saved");
          } catch (x) { err.textContent = x.message; }
        };
        const pw = $("#pw", root); if (pw) pw.onsubmit = async e => { e.preventDefault(); const p1 = $("#pw1").value, p2 = $("#pw2").value, err = $("#pwerr"); if (p1.length < 8 || !/\d/.test(p1)) { err.textContent = "Use at least 8 characters including a number."; return; } if (p1 !== p2) { err.textContent = "Passwords don't match."; return; } try { await a.updatePassword(p1); err.textContent = ""; pw.reset(); ap.toast("Password updated"); } catch (x) { err.textContent = x.message; } };
        const jr = $("#jref", root); if (jr) jr.onclick = async () => { try { await a.refresh(); ap.toast("Session refreshed"); route(); } catch (x) { ap.toast(x.message); } };
        const so = $("#soall", root); if (so) so.onclick = () => X().modal(`<h3>Sign out everywhere?</h3><p class="muted" style="margin:10px 0 18px">This ends your session on every device, including this one.</p><div class="ctas"><button class="btn btn-blue" id="soy">Sign out all devices</button><button class="btn btn-dark" data-close>Cancel</button></div>`, m => $("#soy", m).onclick = async () => { X().closeModal(); await a.signOut("global"); location.hash = "login"; });
      }
    };
  };

  /* ----- management (staff) ----- */
  const needCloud = () => cloud() ? null : head("shield", "Management", "Management portal", "") + card(empty("Management needs the hosted site", "Sign in at the published site with an admin or teacher account. Inside Claude, data is stored per viewer."));

  PG["portal-admin"] = () => needCloud() || {
    html: head("gauge", `${greet()}, ${A().profile.full_name.split(" ")[0]}`, role() === "admin" ? "Admin Control Center" : "Teacher Control Center", `${B.name} · ${title(role())} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`, `<span class="pt-muted" id="upd"></span><button class="pt-btn" id="aref">${ic("refresh")} Refresh</button>`)
      + label("Platform overview") + `<div class="pt-stats" id="astats">${[0, 1, 2, 3, 4].map(() => `<div class="pt-stat pt-skel"></div>`).join("")}</div>`
      + label("Quick actions") + tiles([["Review new leads", "Call back demo requests", "phone", "portal-leads", "linear-gradient(135deg,#2563eb,#22d3ee)"], ["Manage users", "Roles, plans and access", "users", "portal-users", "linear-gradient(135deg,#7c3aed,#c084fc)"], ["Post a notice", "Reach students and parents", "pin", "portal-manage-notices", "linear-gradient(135deg,#ea580c,#fbbf24)"], ["Test analytics", "Scores by subject and student", "trend", "portal-results", "linear-gradient(135deg,#059669,#2dd4bf)"], ["Messages", "Contact form inbox", "inbox", "portal-messages", "linear-gradient(135deg,#e11d48,#fb923c)"], ["Curriculum & labs", "Boards, chapters and labs", "layers", "portal-content", "linear-gradient(135deg,#0284c7,#818cf8)"]])
      + label("Activity & insights") + `<div class="pt-grid3"><div class="pt-span2">${gcard("New accounts · last 14 days", "trend", loading(), "", "pt-signups")}${gcard("Latest demo requests", "phone", loading(), `<a class="pt-gact" href="#portal-leads">All leads</a>`, "pt-latest")}</div><div>${gcard("Lead pipeline", "chart", loading(), "", "pt-funnel")}${gcard("Plan mix", "star", loading(), "", "pt-planmix")}${gcard("Boards", "book", loading(), "", "pt-boards")}</div></div>`,
    async mount(root) {
      const sb = A().client;
      const load = async () => {
        const [u, l, t] = await Promise.all([sb.from("ns_profiles").select("id,role,plan,board,cls,created_at,last_seen_at,status").limit(5000), sb.from("ns_leads").select("id,kind,name,phone,board,cls,status,created_at,pref_date,pref_time").order("created_at", { ascending: false }).limit(2000), sb.from("ns_test_results").select("score,total,created_at").limit(5000)]);
        const users = u.data || [], leads = l.data || [], res = t.data || [];
        const wk = Date.now() - 7 * 864e5, learners = users.filter(x => ["student", "parent"].includes(x.role));
        const paid = users.filter(x => x.plan !== "starter").length, newU = users.filter(x => +new Date(x.created_at) > wk).length, active = users.filter(x => x.last_seen_at && +new Date(x.last_seen_at) > wk).length;
        const demos = leads.filter(x => x.kind === "demo"), newLeads = demos.filter(x => x.status === "new").length, conv = demos.filter(x => x.status === "converted").length;
        const avg = res.length ? Math.round(res.reduce((a, r) => a + r.score / r.total, 0) / res.length * 100) : 0;
        $("#astats", root).innerHTML = stat("blue", "users", "Total accounts", users.length, 100, [["students", users.filter(x => x.role === "student").length], ["parents", users.filter(x => x.role === "parent").length]], `${newU} joined this week`, "portal-users", 0)
          + stat("violet", "phone", "Open demo requests", newLeads, demos.length ? (demos.length - newLeads) / demos.length * 100 : 100, [["total", demos.length], ["converted", conv]], "Follow up today", "portal-leads", 1)
          + stat("orange", "rupee", "Paid subscribers", paid, learners.length ? paid / learners.length * 100 : 0, [["Scholar", users.filter(x => x.plan === "scholar").length], ["Achiever", users.filter(x => x.plan === "achiever").length]], `${learners.length ? Math.round(paid / learners.length * 100) : 0}% of learners`, "portal-users", 2)
          + stat("green", "clock", "Active this week", active, users.length ? active / users.length * 100 : 0, [["of", users.length]], "Signed in during the last 7 days", "portal-users", 3)
          + stat("red", "trend", "Average test score", avg, avg, [["tests", res.length]], "Across all students", "portal-results", 4).replace(`data-count="${avg}"`, `data-count="${avg}" data-sfx="%"`);
        countUp($("#astats", root));
        const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5), k = d.toLocaleDateString("en-CA"); days.push([d.toLocaleDateString("en-IN", { day: "numeric" }), users.filter(x => new Date(x.created_at).toLocaleDateString("en-CA") === k).length]); }
        $(".pt-signups .pt-gbody", root).innerHTML = vbars(days) + `<p class="pt-muted">${newU} new accounts in the last 7 days.</p>`;
        $(".pt-latest .pt-gbody", root).innerHTML = demos.length ? table(["Name", "Phone", "Class", "Requested", "Status"], demos.slice(0, 6).map(x => [esc(x.name), `<a href="tel:${esc(x.phone)}">${esc(x.phone)}</a>`, esc(`${(x.board || "").toUpperCase()} ${x.cls || ""}`), fmtDate(x.created_at), badge(x.status)])) : empty("No demo requests yet", "They appear here the moment someone books on the website.");
        const st = ["new", "contacted", "scheduled", "converted", "lost"]; $(".pt-funnel .pt-gbody", root).innerHTML = hbars(st.map(s => [title(s), demos.filter(x => x.status === s).length]), "linear-gradient(90deg,#2563eb,#22d3ee)");
        $(".pt-planmix .pt-gbody", root).innerHTML = hbars(NS.PLANS.map(p => [p.name, users.filter(x => x.plan === p.id).length]), "linear-gradient(90deg,#f97316,#fbbf24)");
        $(".pt-boards .pt-gbody", root).innerHTML = hbars(NS.BOARDS.map(b => [b.name, learners.filter(x => x.board === b.id).length]), "linear-gradient(90deg,#7c3aed,#a78bfa)");
        $("#upd", root).textContent = "Updated " + new Date().toLocaleTimeString("en-IN");
      };
      $("#aref", root).onclick = load; await load();
    }
  };

  function table(cols, rows, cls = "") { return `<div class="pt-tablew"><table class="pt-table ${cls}"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((v, i) => `<td data-l="${esc(cols[i])}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`; }

  PG["portal-users"] = () => needCloud() || {
    html: head("users", "Management", "Users & Roles", "Every NovaSchool account, with role, plan and activity", `<button class="pt-btn" id="uexp">${ic("dl")} Export CSV</button>`)
      + `<div class="pt-filters" data-in><div class="pt-searchin">${ic("search")}<input id="uq" placeholder="Search name or email"></div><select id="ur"><option value="">All roles</option>${ALL.map(r => `<option value="${r}">${title(r)}</option>`).join("")}</select><select id="up"><option value="">All plans</option>${NS.PLANS.map(p => `<option value="${p.id}">${p.name}</option>`).join("")}</select><select id="ub"><option value="">All boards</option>${NS.BOARDS.map(b => `<option value="${b.id}">${b.name}</option>`).join("")}</select><span class="pt-muted" id="ucount"></span></div><div id="ulist">${loading()}</div>`,
    async mount(root) {
      const sb = A().client, isAdmin = role() === "admin"; let users = [];
      const load = async () => { const { data, error } = await sb.from("ns_profiles").select("*").order("created_at", { ascending: false }).limit(5000); if (error) { $("#ulist", root).innerHTML = empty("Couldn't load users", esc(error.message)); return; } users = data || []; draw(); };
      const filt = () => { const q = $("#uq").value.toLowerCase(), r = $("#ur").value, p = $("#up").value, b = $("#ub").value; return users.filter(u => (!q || (u.full_name + " " + u.email).toLowerCase().includes(q)) && (!r || u.role === r) && (!p || u.plan === p) && (!b || u.board === b)); };
      const draw = () => {
        const list = filt(); $("#ucount").textContent = `${list.length} of ${users.length}`;
        $("#ulist", root).innerHTML = list.length ? table(["User", "Role", "Plan", "Class", "Joined", "Last active", "Status", ""], list.map(u => [
          `<div class="pt-user">${u.avatar_url ? `<img src="${esc(u.avatar_url)}" alt="" referrerpolicy="no-referrer">` : `<span>${esc((u.full_name || "?").slice(0, 2).toUpperCase())}</span>`}<div><b>${esc(u.full_name || "—")}</b><small>${esc(u.email || "")}</small></div></div>`,
          isAdmin && u.id !== A().user.id ? `<select data-f="role" data-id="${u.id}">${ALL.map(r => `<option ${u.role === r ? "selected" : ""} value="${r}">${title(r)}</option>`).join("")}</select>` : badge(u.role),
          isAdmin ? `<select data-f="plan" data-id="${u.id}">${NS.PLANS.map(p => `<option ${u.plan === p.id ? "selected" : ""} value="${p.id}">${p.name}</option>`).join("")}</select>` : badge(u.plan),
          u.board ? esc(`${u.board.toUpperCase()} · ${u.cls}${u.stream ? " " + u.stream : ""}`) : `<span class="pt-muted">Not set</span>`, fmtDate(u.created_at), esc(ago(u.last_seen_at)),
          isAdmin && u.id !== A().user.id ? `<select data-f="status" data-id="${u.id}"><option ${u.status === "active" ? "selected" : ""} value="active">Active</option><option ${u.status === "suspended" ? "selected" : ""} value="suspended">Suspended</option></select>` : badge(u.status),
          `<button class="pt-btn pt-btn-sm" data-view="${u.id}">${ic("search")} View</button>`])) : empty("No users match these filters");
      };
      ["#uq", "#ur", "#up", "#ub"].forEach(s => $(s, root).addEventListener("input", draw));
      $("#ulist", root).addEventListener("change", async e => { const s = e.target.closest("select[data-f]"); if (!s) return; s.disabled = true; const { error } = await sb.from("ns_profiles").update({ [s.dataset.f]: s.value }).eq("id", s.dataset.id); s.disabled = false; if (error) { X().toast(error.message); load(); return; } const u = users.find(x => x.id === s.dataset.id); if (u) u[s.dataset.f] = s.value; X().toast(`${title(s.dataset.f)} updated`); });
      $("#ulist", root).addEventListener("click", async e => {
        const b = e.target.closest("[data-view]"); if (!b) return; const u = users.find(x => x.id === b.dataset.view);
        const [st, rs] = await Promise.all([sb.from("ns_state").select("state,updated_at").eq("user_id", u.id).maybeSingle(), sb.from("ns_test_results").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(20)]);
        const s = (st.data && st.data.state) || {}, prog = Object.values(s.progress || {}).reduce((a, p) => a + p.filter(Boolean).length, 0), mins = Object.values(s.activity || {}).reduce((a, v) => a + v, 0);
        X().modal(`<div class="pt-umodal"><h3>${esc(u.full_name || u.email)}</h3><p class="muted small">${esc(u.email)} · ${esc(title(u.provider || "email"))} sign-in</p><div class="pt-mini"><div><small>Lectures done</small><b>${prog}</b></div><div><small>Minutes learned</small><b>${mins}</b></div><div><small>Tests</small><b>${(rs.data || []).length}</b></div></div>${(rs.data || []).length ? table(["Test", "Score", "Date"], rs.data.map(r => [esc(r.title), `${r.score}/${r.total}`, fmtDate(r.created_at)])) : `<p class="muted small">No tests yet.</p>`}<div class="ctas" style="margin-top:14px"><button class="btn btn-dark" data-close>Close</button></div></div>`);
      });
      $("#uexp", root).onclick = () => download("novaschool-users.csv", csv([["Name", "Email", "Role", "Plan", "Board", "Class", "Stream", "Phone", "Joined", "Last active", "Status"], ...filt().map(u => [u.full_name, u.email, u.role, u.plan, u.board, u.cls, u.stream, u.phone, u.created_at, u.last_seen_at, u.status])]));
      await load();
    }
  };

  function leadsPage(kind) {
    const demo = kind === "demo";
    return needCloud() || {
      html: head(demo ? "phone" : "inbox", "Admissions", demo ? "Admission Leads" : "Messages", demo ? "Demo requests from the website — call, schedule and convert" : "Contact-form messages from the website", `<button class="pt-btn" id="lexp">${ic("dl")} Export CSV</button>`)
        + `<div class="pt-chips" id="lchips" data-in></div><div class="pt-filters" data-in><div class="pt-searchin">${ic("search")}<input id="lq" placeholder="Search name, phone or topic"></div><span class="pt-muted" id="lcount"></span></div><div id="llist">${loading()}</div>`,
      async mount(root) {
        const sb = A().client, isAdmin = role() === "admin"; let rows = [], fstat = "";
        const STS = ["new", "contacted", "scheduled", "converted", "lost"];
        const load = async () => { const { data, error } = await sb.from("ns_leads").select("*").eq("kind", kind).order("created_at", { ascending: false }).limit(2000); if (error) { $("#llist", root).innerHTML = empty("Couldn't load", esc(error.message)); return; } rows = data || []; draw(); };
        const filt = () => { const q = $("#lq").value.toLowerCase(); return rows.filter(r => (!fstat || r.status === fstat) && (!q || [r.name, r.phone, r.topic, r.message, r.email].join(" ").toLowerCase().includes(q))); };
        const draw = () => {
          $("#lchips", root).innerHTML = [["", "All", rows.length], ...STS.map(s => [s, title(s), rows.filter(r => r.status === s).length])].map(([v, l, n]) => `<button class="pt-chip ${fstat === v ? "on" : ""}" data-s="${v}">${esc(l)} <b>${n}</b></button>`).join("");
          const list = filt(); $("#lcount").textContent = `${list.length} shown`;
          $("#llist", root).innerHTML = list.length ? table(demo ? ["Parent", "Phone", "Class", "Preferred slot", "Topic", "Received", "Status", ""] : ["Name", "Contact", "Message", "Received", "Status", ""], list.map(r => demo ? [
            `<b>${esc(r.name)}</b>`, `<a href="tel:${esc(r.phone)}">${esc(r.phone)}</a>`, esc(`${(r.board || "").toUpperCase()} ${r.cls || ""}`), esc([r.pref_date ? fmtDate(r.pref_date) : "", r.pref_time || ""].filter(Boolean).join(" · ") || "Any time"), esc(r.topic || "—"), fmtDT(r.created_at),
            `<select data-st="${r.id}">${STS.map(s => `<option ${r.status === s ? "selected" : ""} value="${s}">${title(s)}</option>`).join("")}</select>`, `<button class="pt-btn pt-btn-sm" data-note="${r.id}">${ic("edit")} ${r.notes ? "Notes" : "Add note"}</button>${isAdmin ? `<button class="pt-btn pt-btn-sm pt-del" data-del="${r.id}" aria-label="Delete">${ic("trash")}</button>` : ""}`
          ] : [`<b>${esc(r.name)}</b>`, `<a href="tel:${esc(r.phone)}">${esc(r.phone)}</a>${r.email ? `<br><small>${esc(r.email)}</small>` : ""}`, `<span class="pt-msg">${esc(r.message || "")}</span>`, fmtDT(r.created_at), `<select data-st="${r.id}">${STS.map(s => `<option ${r.status === s ? "selected" : ""} value="${s}">${title(s)}</option>`).join("")}</select>`, `<button class="pt-btn pt-btn-sm" data-note="${r.id}">${ic("edit")} ${r.notes ? "Notes" : "Add note"}</button>${isAdmin ? `<button class="pt-btn pt-btn-sm pt-del" data-del="${r.id}" aria-label="Delete">${ic("trash")}</button>` : ""}`])) : empty(demo ? "No demo requests here" : "No messages here", "New ones arrive straight from the website forms.");
        };
        $("#lchips", root).onclick = e => { const b = e.target.closest("[data-s]"); if (b) { fstat = b.dataset.s; draw(); } };
        $("#lq", root).oninput = draw;
        $("#llist", root).addEventListener("change", async e => { const s = e.target.closest("[data-st]"); if (!s) return; s.disabled = true; const { error } = await sb.from("ns_leads").update({ status: s.value }).eq("id", s.dataset.st); s.disabled = false; if (error) { X().toast(error.message); return; } rows.find(r => r.id == s.dataset.st).status = s.value; X().toast("Status updated"); draw(); });
        $("#llist", root).addEventListener("click", async e => {
          const n = e.target.closest("[data-note]"), d = e.target.closest("[data-del]");
          if (n) { const r = rows.find(x => x.id == n.dataset.note); X().modal(`<h3>Notes · ${esc(r.name)}</h3><textarea id="ntx" class="pt-textarea" maxlength="2000" placeholder="Call outcome, follow-up date, child's interests…">${esc(r.notes || "")}</textarea><div class="ctas" style="margin-top:14px"><button class="btn btn-blue" id="nsave">Save notes</button><button class="btn btn-dark" data-close>Cancel</button></div>`, m => $("#nsave", m).onclick = async () => { const v = $("#ntx", m).value.trim() || null; const { error } = await sb.from("ns_leads").update({ notes: v }).eq("id", r.id); if (error) { X().toast(error.message); return; } r.notes = v; X().closeModal(); X().toast("Notes saved"); draw(); }); }
          if (d) { const r = rows.find(x => x.id == d.dataset.del); X().modal(`<h3>Delete this ${demo ? "lead" : "message"}?</h3><p class="muted" style="margin:10px 0 18px">${esc(r.name)} · ${esc(r.phone)}. This can't be undone.</p><div class="ctas"><button class="btn btn-blue" id="dely">Delete</button><button class="btn btn-dark" data-close>Cancel</button></div>`, m => $("#dely", m).onclick = async () => { const { error } = await sb.from("ns_leads").delete().eq("id", r.id); X().closeModal(); if (error) { X().toast(error.message); return; } rows = rows.filter(x => x !== r); X().toast("Deleted"); draw(); }); }
        });
        $("#lexp", root).onclick = () => download(`novaschool-${demo ? "leads" : "messages"}.csv`, csv([["Name", "Phone", "Email", "Board", "Class", "Preferred date", "Preferred time", "Topic", "Message", "Status", "Notes", "Received"], ...filt().map(r => [r.name, r.phone, r.email, r.board, r.cls, r.pref_date, r.pref_time, r.topic, r.message, r.status, r.notes, r.created_at])]));
        await load();
      }
    };
  }
  PG["portal-leads"] = () => leadsPage("demo");
  PG["portal-messages"] = () => leadsPage("message");

  PG["portal-results"] = () => needCloud() || {
    html: head("trend", "Assessments", "Test Analytics", "Every chapter test and mock exam taken on " + B.name, `<button class="pt-btn" id="rexp">${ic("dl")} Export CSV</button>`) + `<div class="pt-stats" id="rstats"></div><div class="pt-grid3"><div class="pt-span2">${gcard("All results", "file", loading(), "", "pt-rall")}</div><div>${gcard("Average by subject", "chart", loading(), "", "pt-rsub")}${gcard("Top performers", "star", loading(), "", "pt-rtop")}</div></div>`,
    async mount(root) {
      const sb = A().client; const { data, error } = await sb.from("ns_test_results").select("*, ns_profiles(full_name,email,board,cls)").order("created_at", { ascending: false }).limit(3000);
      if (error) { $(".pt-rall .pt-gbody", root).innerHTML = empty("Couldn't load", esc(error.message)); return; }
      const rs = data || [], avg = rs.length ? Math.round(rs.reduce((a, r) => a + r.score / r.total, 0) / rs.length * 100) : 0, mocks = rs.filter(r => r.kind === "mock").length, students = new Set(rs.map(r => r.user_id)).size;
      $("#rstats", root).innerHTML = stat("blue", "file", "Tests taken", rs.length, 100, [["mocks", mocks]], "", "", 0) + stat("violet", "trend", "Average score", avg, avg, [], "", "", 1).replace(`data-count="${avg}"`, `data-count="${avg}" data-sfx="%"`) + stat("green", "users", "Students tested", students, 100, [], "", "", 2) + stat("orange", "star", "Scores ≥ 80%", rs.filter(r => r.score / r.total >= .8).length, rs.length ? rs.filter(r => r.score / r.total >= .8).length / rs.length * 100 : 0, [], "", "", 3);
      countUp($("#rstats", root));
      $(".pt-rall .pt-gbody", root).innerHTML = rs.length ? table(["Student", "Test", "Type", "Score", "Date"], rs.slice(0, 300).map(r => [`<b>${esc((r.ns_profiles && r.ns_profiles.full_name) || "—")}</b><br><small class="pt-muted">${esc(r.ns_profiles ? `${(r.ns_profiles.board || "").toUpperCase()} ${r.ns_profiles.cls || ""}` : "")}</small>`, esc(r.title), badge(r.kind), `<b>${r.score}/${r.total}</b> <small class="pt-muted">${Math.round(r.score / r.total * 100)}%</small>`, fmtDate(r.created_at)])) : empty("No tests taken yet");
      const by = {}; rs.forEach(r => { const k = r.subject || "Other"; (by[k] = by[k] || []).push(r.score / r.total); });
      $(".pt-rsub .pt-gbody", root).innerHTML = hbars(Object.entries(by).map(([k, v]) => [k, Math.round(v.reduce((a, b) => a + b, 0) / v.length * 100), "%"]), "linear-gradient(90deg,#7c3aed,#22d3ee)");
      const per = {}; rs.forEach(r => { const k = r.user_id; (per[k] = per[k] || { n: (r.ns_profiles && r.ns_profiles.full_name) || "—", v: [] }).v.push(r.score / r.total); });
      $(".pt-rtop .pt-gbody", root).innerHTML = hbars(Object.values(per).filter(p => p.v.length >= 1).map(p => [p.n, Math.round(p.v.reduce((a, b) => a + b, 0) / p.v.length * 100), "%"]).sort((a, b) => b[1] - a[1]).slice(0, 8), "linear-gradient(90deg,#059669,#2dd4bf)");
      $("#rexp", root).onclick = () => download("novaschool-results.csv", csv([["Student", "Email", "Test", "Subject", "Type", "Score", "Total", "Date"], ...rs.map(r => [r.ns_profiles && r.ns_profiles.full_name, r.ns_profiles && r.ns_profiles.email, r.title, r.subject, r.kind, r.score, r.total, r.created_at])]));
    }
  };

  PG["portal-manage-notices"] = () => needCloud() || {
    html: head("pin", "Communication", "Publish Notices", "Announcements appear on every portal dashboard and the notification bell") + `<div class="pt-grid3"><div>${gcard("New notice", "edit", `<form id="nf" class="pt-form" novalidate><label>Title<input id="n-t" maxlength="160"></label><label>Message<textarea id="n-b" class="pt-textarea" maxlength="4000"></textarea></label><div class="pt-form2"><label>Audience<select id="n-a"><option value="all">Everyone</option><option value="students">Students</option><option value="parents">Parents</option><option value="staff">Staff</option></select></label><label class="pt-checkl"><input type="checkbox" id="n-p"> Pin to top</label></div><p class="pt-err" id="nerr"></p><button class="pt-btn pt-btn-p" type="submit">${ic("send")} Publish</button></form>`)}</div><div class="pt-span2">${gcard("Published", "bell", loading(), "", "pt-nl")}</div></div>`,
    async mount(root) {
      const sb = A().client;
      const load = async () => { const { data } = await sb.from("ns_notices").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false }); const l = data || []; $(".pt-nl .pt-gbody", root).innerHTML = l.length ? l.map(n => `<div class="pt-nrow"><div><div class="pt-nhead">${n.pinned ? `<span class="pt-pin">${ic("pin")} Pinned</span>` : ""}${badge(n.audience)}<small class="pt-muted">${fmtDT(n.created_at)}</small></div><b>${esc(n.title)}</b><p>${esc(n.body)}</p></div><div class="pt-row"><button class="pt-btn pt-btn-sm" data-pin="${n.id}" data-v="${n.pinned ? 0 : 1}">${ic("pin")} ${n.pinned ? "Unpin" : "Pin"}</button><button class="pt-btn pt-btn-sm pt-del" data-ndel="${n.id}">${ic("trash")}</button></div></div>`).join("") : empty("No notices yet"); };
      $("#nf", root).onsubmit = async e => { e.preventDefault(); const t = $("#n-t").value.trim(), b = $("#n-b").value.trim(); if (t.length < 2) { $("#nerr").textContent = "Please add a title."; return; } const { error } = await sb.from("ns_notices").insert({ title: t, body: b, audience: $("#n-a").value, pinned: $("#n-p").checked }); if (error) { $("#nerr").textContent = error.message; return; } e.target.reset(); $("#nerr").textContent = ""; noticeCache = null; X().toast("Notice published"); load(); };
      $(".pt-nl", root).addEventListener("click", async e => { const p = e.target.closest("[data-pin]"), d = e.target.closest("[data-ndel]"); if (p) { await sb.from("ns_notices").update({ pinned: p.dataset.v === "1" }).eq("id", p.dataset.pin); noticeCache = null; load(); } if (d) { X().modal(`<h3>Delete this notice?</h3><div class="ctas" style="margin-top:16px"><button class="btn btn-blue" id="dny">Delete</button><button class="btn btn-dark" data-close>Cancel</button></div>`, m => $("#dny", m).onclick = async () => { await sb.from("ns_notices").delete().eq("id", d.dataset.ndel); X().closeModal(); noticeCache = null; X().toast("Notice deleted"); load(); }); } });
      await load();
    }
  };

  PG["portal-content"] = () => { const st = NS.stats(); return head("layers", "Academics", "Curriculum & Labs", "Everything students can learn on " + B.name) + `<div class="pt-stats">${stat("blue", "book", "Boards", st.boards, 100, [["classes", st.classes]], "", "", 0)}${stat("violet", "layers", "Subject courses", st.subjects, 100, [], "", "", 1)}${stat("orange", "file", "Chapters", st.chapters, 100, [["AI lectures", st.lectures]], "", "", 2)}${stat("green", "flask", "Labs", st.labs, 100, [["free", NS.FREE_LABS.length]], "", "", 3)}</div>` + `<div class="pt-grid2">${gcard("Chapters by board", "book", hbars(NS.BOARDS.map(b => { let n = 0; const seen = new Set(); NS.CLASSES.forEach(c => ["PCMB", "PCM"].forEach(s => NS.subjectsFor(b.id, c, s).forEach(x => { const k = c + x.slug; if (!seen.has(k)) { seen.add(k); n += x.chapters.length; } }))); return [b.name, n]; }), "linear-gradient(90deg,#2563eb,#22d3ee)"))}${gcard("Labs by subject", "flask", hbars(NS.LAB_FILTERS.slice(1).map(f => [f, NS.LABS.filter(l => l.tags.includes(f)).length]), "linear-gradient(90deg,#059669,#2dd4bf)"))}</div>` + gcard("Lab library", "grid", table(["Lab", "Subject", "Classes", "Access"], NS.LABS.map(l => [`<a href="#lab-${l.id}"><b>${esc(l.name)}</b></a>`, badge(l.subj.toLowerCase()), esc(l.cls), NS.FREE_LABS.includes(l.id) ? badge("free") : badge("scholar")])));
  };

  PG["portal-audit"] = () => needCloud() || { html: head("shield", "Administration", "Audit Log", "Account creation, role, plan and lead changes — recorded by the database") + `<div class="pt-filters" data-in><div class="pt-searchin">${ic("search")}<input id="aq" placeholder="Search actions"></div></div><div id="alist">${loading()}</div>`, async mount(root) { const { data, error } = await A().client.from("ns_audit").select("*").order("created_at", { ascending: false }).limit(500); if (error) { $("#alist", root).innerHTML = empty("Couldn't load", esc(error.message)); return; } const all = data || []; const draw = () => { const q = $("#aq").value.toLowerCase(), l = all.filter(a => !q || (a.action + " " + a.summary + " " + a.actor_email).toLowerCase().includes(q)); $("#alist", root).innerHTML = l.length ? table(["When", "Action", "Details", "By"], l.map(a => [fmtDT(a.created_at), `<code>${esc(a.action)}</code>`, esc(a.summary), esc(a.actor_email || "system")])) : empty("No entries"); }; $("#aq", root).oninput = draw; draw(); } };

  /* ---------- router entry ---------- */
  function route() { X().route(); }
  NS.portal = {
    title: titleFor,
    render(h, root) {
      const a = A(), ap = X();
      if (a && a.enabled) {
        if (!a.user) { root.innerHTML = `<div class="pt-gate">${loading("Checking your session…")}</div>`; a.ready.then(() => { if (!a.user) { try { sessionStorage.setItem("ns_after_login", h); } catch { } location.hash = "login"; } }); return; }
        if (!a.profile) { root.innerHTML = `<div class="pt-gate">${a.error ? empty("We couldn't load your account", esc(a.error.message || "") + " — please refresh.") : loading("Loading your account…")}</div>`; return; }
        if (a.profile.status === "suspended") { root.innerHTML = `<div class="pt-gate">${empty("This account is suspended", "Please contact " + esc(B.email) + ".")}</div>`; return; }
        if ((a.profile.role === "student" || a.profile.role === "parent") && (!a.profile.board || !a.profile.cls)) { location.hash = "onboarding"; return; }
      } else if (!ap.S.profile) { try { sessionStorage.setItem("ns_after_login", h); } catch { } location.hash = "login"; return; }
      const r = role(), item = allItems.find(i => i[0] === h);
      let out;
      if (!PG[h]) out = head("grid", "Portal", "Page not found", "") + card(empty("That page doesn't exist", `<a href="#portal">Back to dashboard</a>`));
      else if (item && !item[3].includes(r)) out = head("lock", "Access", "No access", "") + card(empty("This page is for " + item[3].map(title).join(", ") + " accounts"));
      else out = PG[h]();
      const html = typeof out === "string" ? out : out.html;
      root.innerHTML = shell(h, r, html); wireShell(r);
      const body = $("#ptbody");
      requestAnimationFrame(() => $$("[data-in]", body).forEach((el, i) => { el.style.setProperty("--d", Math.min(i, 10) * 45 + "ms"); el.classList.add("in"); }));
      countUp(body);
      if (h === "portal-labs") afterLabs(body);
      if (out && out.mount) Promise.resolve(out.mount(body)).then(() => countUp(body)).catch(e => console.error(e));
      ap.onLeave(() => document.removeEventListener("click", closeMenus));
    }
  };
})();
