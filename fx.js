/* NovaSchool — landing-page motion: 3D hero, star map, scroll reveals, counters,
   3D lab carousel, management-platform screens, timeline and scroll progress.
   No libraries. Everything stops when you leave the page and respects reduced motion. */
(function () {
  const NS = window.NS;
  const RM = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* global scroll progress bar (all pages) */
  const bar = document.createElement("div"); bar.className = "scrollbar"; document.body.appendChild(bar);
  let barRaf = 0;
  window.addEventListener("scroll", () => { if (barRaf) return; barRaf = requestAnimationFrame(() => { barRaf = 0; const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; }); }, { passive: true });

  /* stats computed from the real syllabus data */
  NS.stats = function () {
    const seen = new Set(); let chapters = 0, subjects = 0;
    NS.BOARDS.forEach(b => NS.CLASSES.forEach(c => ["PCMB", "PCM"].forEach(st => NS.subjectsFor(b.id, c, st).forEach(s => { const k = b.id + c + s.slug; if (seen.has(k)) return; seen.add(k); subjects++; chapters += s.chapters.length; }))));
    return { boards: NS.BOARDS.length, classes: NS.CLASSES.length, subjects, chapters, lectures: chapters * NS.LECTURES.length, labs: NS.LABS.length };
  };

  NS.mountHomeFx = function (root, onOpenLab) {
    const offs = [], on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); offs.push(() => el.removeEventListener(ev, fn, o)); };
    const reduce = RM();

    /* ---------- reveals ---------- */
    const auto = [...root.querySelectorAll(".head, .grid > *, .path > *, .duo > *, .steps > *, .faq details, .statstrip > *, .cta, .labbar, #labhost, .mgmt-copy > *")].filter(el => !el.closest(".deckgrid, .htrack"));
    auto.forEach(el => { if (el.hasAttribute("data-reveal")) return; el.setAttribute("data-reveal", ""); const i = [...el.parentNode.children].indexOf(el); el.style.setProperty("--d", (Math.min(i, 8) * 70) + "ms"); });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const t = e.target; t.classList.add("in"); io.unobserve(t); setTimeout(() => { t.removeAttribute("data-reveal"); t.classList.remove("in"); }, 1500); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    root.querySelectorAll("[data-reveal]").forEach(el => reduce ? el.classList.add("in") : io.observe(el));
    offs.push(() => io.disconnect());

    /* ---------- counters ---------- */
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      const el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now(), dur = reduce ? 0 : 1600;
      const tick = now => { const p = dur ? clamp((now - t0) / dur, 0, 1) : 1, v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = v.toLocaleString("en-IN") + suf; if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: 0.4 });
    root.querySelectorAll("[data-count]").forEach(el => cio.observe(el)); offs.push(() => cio.disconnect());

    /* ---------- 3D tilt cards ---------- */
    if (!reduce && matchMedia("(hover:hover)").matches) root.querySelectorAll(".labcard, .stp, .post, .story").forEach(el => {
      el.classList.add("tilt");
      on(el, "pointermove", e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; el.style.setProperty("--rx", ((0.5 - y) * 10).toFixed(2) + "deg"); el.style.setProperty("--ry", ((x - 0.5) * 12).toFixed(2) + "deg"); el.style.setProperty("--gx", (x * 100).toFixed(1) + "%"); el.style.setProperty("--gy", (y * 100).toFixed(1) + "%"); });
      on(el, "pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });

    /* ---------- hero: mouse 3D + star map ---------- */
    const hero = root.querySelector(".hero"), orbit = root.querySelector(".orbit");
    if (hero && orbit && !reduce) on(hero, "pointermove", e => { const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; orbit.style.setProperty("--hx", (-y * 14).toFixed(2) + "deg"); orbit.style.setProperty("--hy", (x * 18).toFixed(2) + "deg"); });
    const sky = root.querySelector("#sky");
    let skyRaf = 0, skyVisible = true;
    if (sky) {
      const ctx = sky.getContext("2d"); let W = 0, H = 0; const pts = [];
      const size = () => { const d = devicePixelRatio || 1; W = sky.clientWidth; H = sky.clientHeight; sky.width = W * d; sky.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
      size(); const ro = new ResizeObserver(size); ro.observe(sky); offs.push(() => ro.disconnect());
      const N = Math.min(90, Math.round(W * H / 14000));
      for (let i = 0; i < N; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * .8 + .2, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25 });
      let mx = -999, my = -999; on(hero, "pointermove", e => { const r = sky.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      const vis = new IntersectionObserver(es => { skyVisible = es[0].isIntersecting; }); vis.observe(sky); offs.push(() => vis.disconnect());
      const draw = () => {
        skyRaf = requestAnimationFrame(draw); if (!skyVisible) return;
        ctx.clearRect(0, 0, W, H); const sy = scrollY * 0.15;
        for (const p of pts) { if (!reduce) { p.x += p.vx * p.z; p.y += p.vy * p.z; } if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0; }
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i], ay = a.y - sy * a.z;
          for (let j = i + 1; j < pts.length; j++) { const b = pts[j], by = b.y - sy * b.z, d = Math.hypot(a.x - b.x, ay - by); if (d < 110) { ctx.strokeStyle = `rgba(111,163,214,${(1 - d / 110) * .22})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, ay); ctx.lineTo(b.x, by); ctx.stroke(); } }
          const near = Math.hypot(a.x - mx, ay - my) < 140;
          ctx.fillStyle = near ? "rgba(255,144,77,.95)" : `rgba(236,232,228,${.25 + a.z * .5})`; ctx.beginPath(); ctx.arc(a.x, ay, a.z * (near ? 2.6 : 1.8), 0, Math.PI * 2); ctx.fill();
          if (near) { ctx.strokeStyle = "rgba(255,144,77,.25)"; ctx.beginPath(); ctx.moveTo(a.x, ay); ctx.lineTo(mx, my); ctx.stroke(); }
        }
      };
      draw();
    }

    /* ---------- 3D lab carousel ---------- */
    const ring = root.querySelector(".lring"), ringSec = root.querySelector(".ringsec");
    let ringOffset = 0, ringDrag = null;
    if (ring) {
      const n = ring.children.length;
      const layout = () => {
        const cw = innerWidth < 600 ? 150 : 210, R = Math.round(cw / (2 * Math.tan(Math.PI / n)) * 1.08);
        ring.style.setProperty("--R", R + "px"); ring.style.setProperty("--cw", cw + "px");
        [...ring.children].forEach((c, i) => c.style.transform = `rotateY(${i * 360 / n}deg) translateZ(${R}px)`);
        requestAnimationFrame(() => ring.querySelectorAll("canvas[data-thumb]").forEach(cv => NS.thumbLab(cv, cv.dataset.thumb)));
      };
      layout(); on(window, "resize", layout);
      const stage = root.querySelector(".ringstage");
      on(stage, "pointerdown", e => { ringDrag = { x: e.clientX, o: ringOffset, moved: false }; });
      on(window, "pointermove", e => { if (!ringDrag) return; const dx = e.clientX - ringDrag.x; if (Math.abs(dx) > 4) ringDrag.moved = true; ringOffset = ringDrag.o + dx * 0.25; update(); });
      on(window, "pointerup", () => { setTimeout(() => ringDrag = null, 0); });
      on(ring, "click", e => { if (ringDrag && ringDrag.moved) { e.preventDefault(); return; } const c = e.target.closest("[data-lab]"); if (c) onOpenLab(c.dataset.lab); });
      const step = 360 / n;
      root.querySelectorAll("[data-ring]").forEach(b => on(b, "click", () => { ringOffset += +b.dataset.ring * step; update(); }));
    }

    /* ---------- management platform ---------- */
    const mg = root.querySelector(".mgmt"), screens = mg ? [...mg.querySelectorAll(".screen")] : [], copies = mg ? [...mg.querySelectorAll(".mstep")] : [];
    let mgForced = null;
    copies.forEach((c, i) => on(c, "click", () => { mgForced = i; const r = mg.getBoundingClientRect(), total = mg.offsetHeight - innerHeight; if (total > 0 && !reduce) scrollTo({ top: scrollY + r.top + total * (i + .5) / screens.length, behavior: "smooth" }); else update(); }));

    /* ---------- flying feature deck ---------- */
    const deck = root.querySelector(".deck"), deckCards = deck ? [...deck.querySelectorAll(".deckgrid > *")] : [];
    /* ---------- horizontal cover-flow ---------- */
    const hs = root.querySelector(".hs"), track = hs ? hs.querySelector(".htrack") : null, hcards = track ? [...track.children] : [], hbar = hs ? hs.querySelector(".hprog i") : null;
    const sizeHs = () => { if (!hs || !track) return; const extra = Math.max(0, track.scrollWidth - innerWidth); hs.style.height = (reduce ? "auto" : (innerHeight + extra + innerHeight * 0.3) + "px"); };
    sizeHs(); on(window, "resize", sizeHs);
    /* ---------- ribbons: speed up with scroll velocity ---------- */
    const ribs = [...root.querySelectorAll(".rib")]; let lastY = scrollY, vel = 0;
    /* ---------- timeline ---------- */
    const tl = root.querySelector(".timeline");

    /* ---------- one scroll/raf loop ---------- */
    let raf = 0;
    const prog = el => { const r = el.getBoundingClientRect(), total = el.offsetHeight - innerHeight; return total > 0 ? clamp(-r.top / total, 0, 1) : clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); };
    function update() {
      raf = 0;
      if (hero && !reduce) { const p = clamp(scrollY / (hero.offsetHeight || 1), 0, 1); hero.style.setProperty("--sp", p.toFixed(3)); }
      if (ring && ringSec) { const p = reduce ? 0 : prog(ringSec); ring.style.transform = `translateZ(calc(var(--R) * -1)) rotateX(-6deg) rotateY(${(-p * 360 + ringOffset).toFixed(2)}deg)`; const idx = ((Math.round((p * 360 - ringOffset) / (360 / ring.children.length)) % ring.children.length) + ring.children.length) % ring.children.length; [...ring.children].forEach((c, i) => c.classList.toggle("front", i === idx)); const lab = NS.LABS[idx], cap = root.querySelector("#ringcap"); if (cap && lab && cap.dataset.id !== lab.id) { cap.dataset.id = lab.id; cap.querySelector("b").textContent = lab.name; cap.querySelector("span").textContent = `${lab.subj} · Class ${lab.cls}`; cap.querySelector("a").href = "#lab-" + lab.id; } }
      if (mg && screens.length) {
        const p = prog(mg), f = mgForced != null && reduce ? mgForced : p * (screens.length - 1) * 1.0001;
        if (mgForced != null && Math.abs(Math.round(f) - mgForced) === 0) mgForced = null;
        screens.forEach((s, i) => { const d = i - f, a = Math.abs(d); s.style.transform = `translate3d(${d * 34}%, ${a * 6}%, ${-a * 260}px) rotateY(${clamp(-d * 32, -60, 60)}deg)`; s.style.opacity = clamp(1 - a * .55, 0, 1); s.style.zIndex = 10 - Math.round(a * 3); });
        const act = clamp(Math.round(f), 0, screens.length - 1); copies.forEach((c, i) => c.classList.toggle("on", i === act));
      }
      const big = innerWidth > 860;
      if (deck && deckCards.length) {
        if (reduce || !big) deckCards.forEach(c => { c.style.transform = ""; c.style.opacity = ""; });
        else { const p = prog(deck); deckCards.forEach((c, i) => { const li = clamp((p * 1.5 - i * 0.12) / 0.4, 0, 1), k = 1 - li, e = 1 - Math.pow(k, 3); c.style.transform = `perspective(1100px) translate3d(${(i % 3 - 1) * k * 160}px, ${k * 140}px, ${-k * 1400}px) rotateX(${k * 55}deg) rotateY(${(i % 3 - 1) * k * -40}deg) rotateZ(${(i % 2 ? 1 : -1) * k * 14}deg)`; c.style.opacity = e.toFixed(3); }); }
      }
      if (hs && track && !reduce) {
        const p = prog(hs), extra = Math.max(0, track.scrollWidth - innerWidth);
        track.style.transform = `translate3d(${-p * extra}px,0,0)`;
        if (hbar) hbar.style.transform = `scaleX(${p})`;
        hcards.forEach(c => { const r = c.getBoundingClientRect(), d = clamp(((r.left + r.width / 2) - innerWidth / 2) / innerWidth, -1, 1); c.style.transform = `perspective(1000px) rotateY(${(-d * 38).toFixed(2)}deg) translateZ(${(-Math.abs(d) * 160).toFixed(1)}px) scale(${(1 - Math.abs(d) * 0.08).toFixed(3)})`; c.style.opacity = (1 - Math.abs(d) * 0.45).toFixed(3); c.classList.toggle("focus", Math.abs(d) < 0.18); });
      }
      if (ribs.length) { const dy = scrollY - lastY; lastY = scrollY; vel = clamp(vel * 0.85 + dy * 0.15, -60, 60); ribs.forEach((r, i) => r.style.setProperty("--skew", (vel * (i ? -0.08 : 0.08)).toFixed(2) + "deg"));  if (Math.abs(vel) > 0.3) req(); }
      if (tl) { const r = tl.getBoundingClientRect(), p = clamp((innerHeight * .75 - r.top) / r.height, 0, 1); tl.style.setProperty("--tp", p.toFixed(3)); }
    }
    const req = () => { if (!raf) raf = requestAnimationFrame(update); };
    on(window, "scroll", req, { passive: true }); on(window, "resize", req); update();

    return () => { offs.forEach(f => f()); cancelAnimationFrame(raf); cancelAnimationFrame(skyRaf); };
  };
})();
