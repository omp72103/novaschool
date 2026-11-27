/* NovaSchool — realistic renderer for the 19 labs.
   Replaces each lab's draw() with a lit, shaded scene (materials, soft shadows, glow, motion trails).
   Physics, controls and readouts stay in labs.js. */
(function () {
  const NS = window.NS, L = NS.LABDEFS, D = NS.LABDATA;
  if (!L || !D) return;
  const TAU = Math.PI * 2, now = () => performance.now() / 1000;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fx = (v, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toFixed(d);
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  /* ---------- colour + material helpers ---------- */
  function rgb(hex) { if (hex[0] !== "#") return [128, 128, 128]; const n = parseInt(hex.slice(1).length === 3 ? hex.slice(1).split("").map(c => c + c).join("") : hex.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; }
  const mix = (hex, t, to = 255) => { const [r, g, b] = rgb(hex); return `rgb(${Math.round(r + (to - r) * t)},${Math.round(g + (to - g) * t)},${Math.round(b + (to - b) * t)})`; };
  const lite = (h, t) => mix(h, t, 255), dark = (h, t) => mix(h, t, 0);
  const rgba = (hex, a) => { const [r, g, b] = rgb(hex); return `rgba(${r},${g},${b},${a})`; };
  function rr(ctx, x, y, w, h, r) { if (w < 0) { x += w; w = -w; } if (h < 0) { y += h; h = -h; } r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function bg(ctx, W, H, top, bot) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  function vignette(ctx, W, H, a = 0.5) { const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.8); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  function shadowE(ctx, x, y, rx, ry, a = 0.4) { if (rx <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(1, Math.max(0.05, ry / rx)); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill(); ctx.restore(); }
  function sphere(ctx, x, y, r, col, lx = -0.45, ly = -0.55, spec = 0.85) {
    if (r <= 0) return;
    const g = ctx.createRadialGradient(x + lx * r * 0.6, y + ly * r * 0.6, r * 0.05, x, y, r);
    g.addColorStop(0, lite(col, 0.55)); g.addColorStop(0.35, col); g.addColorStop(0.85, dark(col, 0.45)); g.addColorStop(1, dark(col, 0.65));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    const rim = ctx.createRadialGradient(x, y, r * 0.75, x, y, r); rim.addColorStop(0, "rgba(255,255,255,0)"); rim.addColorStop(1, "rgba(160,200,255,0.18)"); ctx.fillStyle = rim; ctx.fill();
    if (spec) { const sx = x + lx * r * 0.45, sy = y + ly * r * 0.45, s = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.32); s.addColorStop(0, `rgba(255,255,255,${spec})`); s.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = s; ctx.beginPath(); ctx.arc(sx, sy, r * 0.32, 0, TAU); ctx.fill(); }
  }
  function metal(ctx, x, y, w, h, vertical = true, base = "#9aa3ad", r = 3) { const g = vertical ? ctx.createLinearGradient(x, 0, x + w, 0) : ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, dark(base, 0.45)); g.addColorStop(0.3, lite(base, 0.55)); g.addColorStop(0.5, lite(base, 0.2)); g.addColorStop(1, dark(base, 0.5)); ctx.fillStyle = g; rr(ctx, x, y, w, h, r); ctx.fill(); }
  function wood(ctx, x, y, w, h, base = "#8a5a2b", r = 6, seed = 1) {
    ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, lite(base, 0.18)); g.addColorStop(1, dark(base, 0.3)); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = rgba(dark(base, 0.5).replace(/rgb\((\d+),(\d+),(\d+)\)/, (m, a, b, c) => "#" + [a, b, c].map(v => (+v).toString(16).padStart(2, "0")).join("")), 0.35); ctx.lineWidth = 1;
    for (let i = 0; i < Math.max(3, h / 5); i++) { const yy = y + (i + 0.5) * h / Math.max(3, h / 5); ctx.beginPath(); ctx.moveTo(x, yy); for (let xx = x; xx <= x + w; xx += 12) ctx.lineTo(xx, yy + Math.sin(xx * 0.03 + i * 1.7 + seed) * 1.6); ctx.stroke(); }
    ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(x, y, w, 2); ctx.restore();
  }
  function glow(ctx, color, blur, fn) { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = blur; fn(); ctx.restore(); }
  function tag(ctx, x, y, text, bgc = "rgba(20,32,60,.85)", fg = "#fff", align = "center") {
    ctx.save(); ctx.font = "700 12px Montserrat, Arial"; const w = ctx.measureText(text).width + 16, h = 24; const x0 = align === "center" ? x - w / 2 : align === "left" ? x : x - w;
    ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2; ctx.fillStyle = bgc; rr(ctx, x0, y - h / 2, w, h, 12); ctx.fill(); ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, x0 + w / 2, y + 1); ctx.restore();
  }
  function txt(ctx, s, x, y, col = "#ece8e4", size = 13, align = "center", weight = 600) { ctx.font = `${weight} ${size}px "Open Sans", Arial`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(s, x, y); }
  function arrow(ctx, x1, y1, x2, y2, col, lw = 4, glowIt = true) {
    const a = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1); if (len < 3) return; const h = Math.min(14, len * 0.45);
    ctx.save(); if (glowIt) { ctx.shadowColor = col; ctx.shadowBlur = 10; } ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * h * 0.7, y2 - Math.sin(a) * h * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)); ctx.lineTo(x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function starfield(ctx, W, H, n, seed = 1, tw = true) { const t = now(); for (let i = 0; i < n; i++) { const x = rnd(i + seed) * W, y = rnd(i * 3.1 + seed) * H, r = rnd(i * 7.7) * 1.3 + 0.3, a = 0.35 + 0.65 * (tw ? (0.5 + 0.5 * Math.sin(t * (0.6 + rnd(i) * 2) + i)) : 1) * rnd(i * 5.3); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } }
  function benchFloor(ctx, W, H, y) { wood(ctx, -10, y, W + 20, H - y + 10, "#6b4426", 0, 3); const g = ctx.createLinearGradient(0, y, 0, y + 18); g.addColorStop(0, "rgba(0,0,0,.35)"); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.fillRect(0, y, W, 18); }
  function labWall(ctx, W, H) { bg(ctx, W, H, "#1c2436", "#0f141f"); ctx.strokeStyle = "rgba(255,255,255,.035)"; ctx.lineWidth = 1; for (let x = 0; x < W; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }

  /* ================= 1. PENDULUM ================= */
  L.pendulum.draw = function (ctx, W, H, s) {
    const P = D.PLANETS[s.planet], gval = P[0];
    labWall(ctx, W, H);
    const pw = Math.min(W * 0.3, 220), side = W > 520;
    if (side) {
      const sg = ctx.createLinearGradient(0, 0, pw, 0); sg.addColorStop(0, "rgba(2,6,16,.85)"); sg.addColorStop(1, "rgba(2,6,16,.45)"); ctx.fillStyle = sg; ctx.fillRect(0, 0, pw, H);
      starfield(ctx, pw, H, 50, 4);
      const r = pw * 0.33, cx = pw / 2, cy = H * 0.4;
      glow(ctx, rgba(P[1], 0.7), 30, () => sphere(ctx, cx, cy, r, P[1], -0.5, -0.4, 0.4));
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
      for (let i = 0; i < 9; i++) { ctx.fillStyle = rgba(P[2], 0.55); ctx.beginPath(); ctx.ellipse(cx + Math.cos(i * 2.1 + now() * 0.1) * r * 0.55, cy + Math.sin(i * 1.7) * r * 0.55, r * (0.12 + (i % 3) * 0.07), r * (0.08 + (i % 2) * 0.05), i, 0, TAU); ctx.fill(); }
      const term = ctx.createLinearGradient(cx - r, cy, cx + r, cy); term.addColorStop(0.45, "rgba(0,0,0,0)"); term.addColorStop(1, "rgba(0,0,0,.65)"); ctx.fillStyle = term; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); ctx.restore();
      tag(ctx, 14, 26, s.planet, "rgba(0,0,0,.55)", "#fff", "left"); txt(ctx, "g = " + gval + " m/s²", 16, 52, "#9fb3d1", 12, "left");
      let y = H - 112; Object.entries(D.PLANETS).forEach(([n, v]) => { txt(ctx, n, 14, y, n === s.planet ? "#fff" : "#8892a6", 11, "left"); ctx.fillStyle = "rgba(255,255,255,.1)"; rr(ctx, 66, y - 3, pw - 112, 6, 3); ctx.fill(); const gg = ctx.createLinearGradient(66, 0, 66 + pw - 112, 0); gg.addColorStop(0, "#ff904d"); gg.addColorStop(1, "#ffd166"); ctx.fillStyle = n === s.planet ? gg : "#4b5263"; rr(ctx, 66, y - 3, (pw - 112) * v[0] / 24.8, 6, 3); ctx.fill(); txt(ctx, String(v[0]), pw - 12, y, "#8892a6", 11, "right"); y += 22; });
    }
    const ox = side ? pw : 0, cw = W - ox, px = ox + cw / 2, py = 54, scale = Math.max(30, H - 130) / 2.5, floorY = H - 38;
    benchFloor(ctx, W, H, floorY);
    const bx = px + Math.sin(s.th) * s.L * scale, by = py + Math.cos(s.th) * s.L * scale;
    // stand
    shadowE(ctx, px - 70, floorY + 4, 120, 10, 0.45);
    wood(ctx, px - 170, floorY - 18, 200, 20, "#7a4a22", 5, 2);
    metal(ctx, px - 112, py - 8, 10, floorY - 18 - py + 8, true, "#a7b0ba");
    metal(ctx, px - 112, py - 8, 132, 9, false, "#a7b0ba");
    sphere(ctx, px - 107, py - 4, 9, "#566070", -0.4, -0.5, 0.5);
    // protractor
    ctx.save(); ctx.translate(px, py); ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 64, Math.PI * 0.25, Math.PI * 0.75); ctx.stroke();
    for (let d = -40; d <= 40; d += 10) { const a = Math.PI / 2 + d * Math.PI / 180, l = d % 20 === 0 ? 10 : 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 64, Math.sin(a) * 64); ctx.lineTo(Math.cos(a) * (64 - l), Math.sin(a) * (64 - l)); ctx.stroke(); }
    ctx.strokeStyle = "rgba(255,144,77,.85)"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 54, Math.PI / 2, Math.PI / 2 - s.th, s.th > 0); ctx.stroke(); ctx.restore();
    txt(ctx, fx(Math.abs(s.th) * 180 / Math.PI, 0) + "°", px + (s.th > 0 ? -24 : 24), py + 84, "#ffb27a", 11);
    // dashed rest line + arc
    ctx.save(); ctx.setLineDash([4, 6]); ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + s.L * scale + 20); ctx.stroke(); ctx.restore();
    // trail
    const tr = s._trail || (s._trail = []); tr.push([bx, by]); if (tr.length > 26) tr.shift();
    for (let i = 1; i < tr.length; i++) { ctx.strokeStyle = `rgba(255,170,90,${i / tr.length * 0.35})`; ctx.lineWidth = i / tr.length * 10; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(tr[i - 1][0], tr[i - 1][1]); ctx.lineTo(tr[i][0], tr[i][1]); ctx.stroke(); }
    // shadow of bob on bench
    const hgt = floorY - by; shadowE(ctx, bx, floorY + 2, clamp(26 - hgt * 0.02, 8, 26), 5, clamp(0.5 - hgt * 0.0008, 0.15, 0.5));
    // string + bob
    ctx.strokeStyle = "rgba(235,235,235,.9)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    sphere(ctx, px, py, 5, "#cfd6de", -0.4, -0.5, 0.7);
    glow(ctx, "rgba(255,160,60,.35)", 18, () => sphere(ctx, bx, by, 16, "#c9902f", -0.45, -0.55, 0.95));
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(bx, by, 16, 4, 0, 0, TAU); ctx.stroke();
    tag(ctx, px + 30, py - 16, "pivot"); tag(ctx, bx + 40, by + 20, "bob", "rgba(150,80,20,.9)");
    tag(ctx, px - 60, py + s.L * scale / 2, "L = " + fx(s.L) + " m", "rgba(31,95,153,.9)");
    arrow(ctx, px + 130, py + 34, px + 130, py + 52 + gval * 2.4, "#3ecf8e", 4); tag(ctx, px + 130, py + 18, "g = " + gval + " m/s²", "rgba(29,107,51,.92)");
    vignette(ctx, W, H, 0.35);
  };

  /* ================= 2. LENS (optical bench + candle) ================= */
  function candle(ctx, x, baseY, hgt, alpha = 1, flip = false) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, baseY); if (flip) ctx.scale(1, -1);
    const w = Math.max(8, Math.abs(hgt) * 0.22), hh = Math.abs(hgt) * 0.78;
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, "#d9cfb8"); g.addColorStop(0.4, "#fff8e8"); g.addColorStop(1, "#b9ad93"); ctx.fillStyle = g; rr(ctx, -w / 2, -hh, w, hh, 3); ctx.fill();
    ctx.fillStyle = "#2b2b2b"; ctx.fillRect(-1, -hh - 6, 2, 7);
    const t = now(), fl = 1 + Math.sin(t * 13) * 0.06 + Math.sin(t * 7.3) * 0.05, fh = Math.abs(hgt) * 0.24 * fl, fy = -hh - 6;
    ctx.globalCompositeOperation = "lighter";
    const halo = ctx.createRadialGradient(0, fy - fh * 0.4, 0, 0, fy - fh * 0.4, fh * 2.6); halo.addColorStop(0, "rgba(255,200,90,.55)"); halo.addColorStop(1, "rgba(255,160,60,0)"); ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, fy - fh * 0.4, fh * 2.6, 0, TAU); ctx.fill();
    const fg = ctx.createRadialGradient(0, fy - fh * 0.25, 1, 0, fy - fh * 0.3, fh); fg.addColorStop(0, "#fffbe6"); fg.addColorStop(0.35, "#ffd166"); fg.addColorStop(1, "rgba(255,110,30,0)");
    ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(0, fy - fh); ctx.quadraticCurveTo(fh * 0.45, fy - fh * 0.3, 0, fy + 2); ctx.quadraticCurveTo(-fh * 0.45, fy - fh * 0.3, 0, fy - fh); ctx.fill();
    ctx.restore();
  }
  L.lens.draw = function (ctx, W, H, s) {
    const cx = W * 0.5, cy = H * 0.55, k = Math.min((W * 0.46) / 52, H / 22), X = x => cx + x * k, Y = y => cy - y * k, { f, v, m } = this.calc(s);
    bg(ctx, W, H, "#0b1020", "#05070d");
    const lh = 9 * k, railY = cy + lh + 22;
    // bench rail with cm scale
    metal(ctx, 10, railY, W - 20, 10, false, "#7d8794", 4); shadowE(ctx, W / 2, railY + 22, W * 0.45, 8, 0.35);
    ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = "600 10px Open Sans"; ctx.textAlign = "center";
    for (let c = -60; c <= 60; c += 5) { const x = X(c); if (x < 14 || x > W - 14) continue; ctx.fillRect(x - 0.5, railY - (c % 10 ? 4 : 8), 1, c % 10 ? 4 : 8); if (c % 10 === 0) ctx.fillText(String(c), x, railY + 22); }
    // principal axis
    ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke(); ctx.setLineDash([]);
    // focal markers
    [[-s.f, "F"], [s.f, "F′"], [-2 * s.f, "2F"], [2 * s.f, "2F′"]].forEach(([x, l]) => { const px = X(x); if (px < 10 || px > W - 10) return; glow(ctx, "#6fa3d6", 8, () => { ctx.fillStyle = "#cfe6ff"; ctx.beginPath(); ctx.arc(px, cy, 3.5, 0, TAU); ctx.fill(); }); txt(ctx, l, px, cy + 16, "#9fb3d1", 12, "center", 700); });
    // rays
    const ox = X(-s.u), oy = Y(s.h), finite = isFinite(v) && Math.abs(v) < 400, ix = X(v), iy = Y(m * s.h);
    const rays = [s.h, 0, finite ? m * s.h : s.h * 0.5], cols = ["#ffd166", "#ff7aa8", "#7ee0a7"];
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
    rays.forEach((yl, i) => {
      const ly = Y(yl); let dx, dy;
      if (!finite) { dx = cx - ox; dy = cy - oy; } else if (v > 0) { dx = ix - cx; dy = iy - ly; } else { dx = cx - ix; dy = ly - iy; }
      const n = Math.hypot(dx, dy) || 1, ex = cx + dx / n * W, ey = ly + dy / n * W;
      [[7, 0.12], [3, 0.35], [1.4, 0.95]].forEach(([lw, a]) => { ctx.strokeStyle = rgba(cols[i], a); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(cx, ly); ctx.lineTo(ex, ey); ctx.stroke(); });
      if (finite && v < 0) { ctx.setLineDash([5, 6]); ctx.strokeStyle = rgba(cols[i], 0.55); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, ly); ctx.lineTo(ix, iy); ctx.stroke(); ctx.setLineDash([]); }
    });
    ctx.restore();
    // lens on a holder
    metal(ctx, cx - 3, cy + lh, 6, railY - cy - lh, true, "#8a94a2"); metal(ctx, cx - 16, railY - 6, 32, 8, false, "#59626f");
    ctx.save(); ctx.beginPath();
    if (s.type === "Convex") ctx.ellipse(cx, cy, 11, lh, 0, 0, TAU); else { ctx.moveTo(cx - 13, cy - lh); ctx.quadraticCurveTo(cx - 2, cy, cx - 13, cy + lh); ctx.lineTo(cx + 13, cy + lh); ctx.quadraticCurveTo(cx + 2, cy, cx + 13, cy - lh); ctx.closePath(); }
    const lg = ctx.createLinearGradient(cx - 14, 0, cx + 14, 0); lg.addColorStop(0, "rgba(140,200,255,.18)"); lg.addColorStop(0.45, "rgba(220,245,255,.55)"); lg.addColorStop(1, "rgba(110,170,240,.2)"); ctx.fillStyle = lg; ctx.fill();
    ctx.strokeStyle = "rgba(190,225,255,.9)"; ctx.lineWidth = 1.6; ctx.stroke(); ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(cx - 5, cy - lh, 2, lh * 1.2); ctx.restore();
    tag(ctx, cx, cy - lh - 18, s.type + " lens", "rgba(31,95,153,.9)");
    // object candle + holder
    metal(ctx, ox - 2, cy, 4, railY - cy, true, "#8a94a2"); metal(ctx, ox - 14, railY - 6, 28, 8, false, "#59626f");
    candle(ctx, ox, cy, s.h * k * 1.1);
    tag(ctx, ox, oy - s.h * k * 0.5 - 10, "object", "rgba(176,82,29,.92)");
    // image
    if (finite) {
      const real = v > 0, hgt = m * s.h * k * 1.1;
      if (real && ix > 20 && ix < W - 20) { ctx.fillStyle = "rgba(240,240,235,.12)"; ctx.fillRect(ix - 2, cy - Math.abs(hgt) - 30, 4, Math.abs(hgt) + 60); metal(ctx, ix - 2, cy + Math.abs(hgt) * 0 + 4, 4, railY - cy - 4, true, "#8a94a2"); }
      ctx.save(); if (!real) ctx.globalAlpha = 0.5; candle(ctx, ix, cy, hgt, real ? 0.95 : 0.55, m < 0); ctx.restore();
      tag(ctx, ix, iy + (m > 0 ? -22 : 22), real ? "real image" : "virtual image", "rgba(138,44,58,.92)");
    }
    vignette(ctx, W, H, 0.45);
  };

  /* ================= 3. MAGNETIC FIELD (iron filings + compasses) ================= */
  L.magnet.draw = function (ctx, W, H, s) {
    const P = this.poles(s, W, H);
    bg(ctx, W, H, "#e9e4d8", "#cfc8b8");
    ctx.fillStyle = "rgba(0,0,0,.04)"; for (let i = 0; i < 260; i++) ctx.fillRect(rnd(i) * W, rnd(i * 2.3) * H, 2, 2);
    // iron filings
    const sp = 9; ctx.lineCap = "round";
    for (let gx = sp / 2; gx < W; gx += sp) for (let gy = sp / 2; gy < H; gy += sp) {
      const jx = gx + (rnd(gx * 13 + gy) - 0.5) * sp, jy = gy + (rnd(gy * 7 + gx) - 0.5) * sp;
      if (Math.hypot(jx - s.mx, jy - s.my) < 40) continue;
      const [bx, by] = this.B(P, jx, jy), mag = Math.hypot(bx, by) * 9000 * s.str, a = clamp(mag, 0.05, 0.85); if (a < 0.08) continue;
      const ang = Math.atan2(by, bx), l = 3 + clamp(mag, 0, 1) * 3.5;
      ctx.strokeStyle = `rgba(40,40,45,${a})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(jx - Math.cos(ang) * l, jy - Math.sin(ang) * l); ctx.lineTo(jx + Math.cos(ang) * l, jy + Math.sin(ang) * l); ctx.stroke();
    }
    if (s.lines === "Show") {
      ctx.strokeStyle = "rgba(37,99,235,.55)"; ctx.lineWidth = 1.4;
      const n = 8 + s.str * 2;
      for (let i = 0; i < n; i++) { const a = i / n * TAU; let x = P[0][0] + Math.cos(a) * 12, y = P[0][1] + Math.sin(a) * 12; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 600; j++) { const [bx, by] = this.B(P, x, y), mm = Math.hypot(bx, by) || 1; x += bx / mm * 4; y += by / mm * 4; ctx.lineTo(x, y); if (Math.hypot(x - P[1][0], y - P[1][1]) < 10 || x < -50 || x > W + 50 || y < -50 || y > H + 50) break; } ctx.stroke(); }
    }
    // compasses
    const step = 96;
    for (let x = step / 2; x < W; x += step) for (let y = step / 2; y < H; y += step) {
      if (Math.hypot(x - s.mx, y - s.my) < 95) continue;
      const [bx, by] = this.B(P, x, y), a = Math.atan2(by, bx);
      shadowE(ctx, x + 3, y + 5, 20, 20, 0.3);
      const rg = ctx.createLinearGradient(x - 18, y - 18, x + 18, y + 18); rg.addColorStop(0, "#f4d58d"); rg.addColorStop(0.5, "#b8860b"); rg.addColorStop(1, "#6b4e0a"); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fill();
      ctx.fillStyle = "#f8f6ef"; ctx.beginPath(); ctx.arc(x, y, 14.5, 0, TAU); ctx.fill();
      ctx.fillStyle = "#555"; ctx.font = "700 6px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("N", x, y - 10.5);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1.5;
      ctx.fillStyle = "#d62828"; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(0, -3.2); ctx.lineTo(0, 3.2); ctx.fill();
      ctx.fillStyle = "#3d4451"; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(0, -3.2); ctx.lineTo(0, 3.2); ctx.fill(); ctx.restore();
      sphere(ctx, x, y, 2.2, "#c9a227", -0.4, -0.4, 0.6);
      const gl = ctx.createLinearGradient(x - 14, y - 14, x + 6, y + 6); gl.addColorStop(0, "rgba(255,255,255,.55)"); gl.addColorStop(0.5, "rgba(255,255,255,0)"); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 14.5, 0, TAU); ctx.fill();
    }
    // bar magnet
    ctx.save(); ctx.translate(s.mx, s.my); ctx.rotate(s.ang * Math.PI / 180 + (s.flip === "Flip" ? Math.PI : 0));
    ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
    const nG = ctx.createLinearGradient(0, -18, 0, 18); nG.addColorStop(0, "#ff6b6b"); nG.addColorStop(0.45, "#d62828"); nG.addColorStop(1, "#8b1414"); ctx.fillStyle = nG; rr(ctx, 0, -18, 74, 36, 6); ctx.fill();
    const sG = ctx.createLinearGradient(0, -18, 0, 18); sG.addColorStop(0, "#6ea8ff"); sG.addColorStop(0.45, "#2b5fb4"); sG.addColorStop(1, "#173a74"); ctx.fillStyle = sG; rr(ctx, -74, -18, 74, 36, 6); ctx.fill();
    ctx.shadowColor = "transparent"; ctx.fillStyle = "rgba(255,255,255,.25)"; rr(ctx, -70, -16, 140, 7, 4); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.font = "800 18px Montserrat, Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("N", 50, 2); ctx.fillText("S", -50, 2); ctx.restore();
  };

  /* ================= 4. FORCE & MOTION ================= */
  L.force.draw = function (ctx, W, H, s) {
    const gy = H * 0.68, ppm = 40, off = ((s.x * ppm) % W + W) % W, cx = 60 + off % (W - 120);
    bg(ctx, W, gy, "#5e8fd6", "#cfe3ff");
    const hill = (amp, col, par, base) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, gy); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin((x + s.x * ppm * par) * 0.008) * Math.cos((x + s.x * ppm * par) * 0.003))); ctx.lineTo(W, gy); ctx.fill(); };
    hill(60, "#8fb4c9", 0.1, gy - 70); hill(40, "#6d9a7a", 0.25, gy - 25);
    // floor
    const fg = ctx.createLinearGradient(0, gy, 0, H); fg.addColorStop(0, "#5b5f6b"); fg.addColorStop(1, "#2b2e36"); ctx.fillStyle = fg; ctx.fillRect(0, gy, W, H - gy);
    for (let i = -1; i < W / 60 + 2; i++) { const x = i * 60 - (s.x * ppm % 60); ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fillRect(x, gy, 2, H - gy); }
    ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(0, gy, W, 2);
    const w = 76 + s.m * 3, h = 40 + s.m * 1.5, top = gy - h - 22;
    // speed lines
    if (Math.abs(s.v) > 2) { ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { const yy = top + 8 + i * h / 4, l = clamp(Math.abs(s.v) * 6, 10, 90); ctx.beginPath(); ctx.moveTo(cx - w / 2 - 10 - l - rnd(i) * 20, yy); ctx.lineTo(cx - w / 2 - 10 - rnd(i) * 20, yy); ctx.stroke(); } }
    // dust
    const dust = s._dust || (s._dust = []); if (Math.abs(s.v) > 0.3 && s.mu > 0) for (let i = 0; i < 2; i++) dust.push({ x: cx - w / 3 - 10, y: gy - 4, vx: -Math.sign(s.v) * (20 + Math.random() * 30), vy: -10 - Math.random() * 20, life: 1 });
    dust.forEach(d => { d.x += d.vx / 60; d.y += d.vy / 60; d.vy += 0.6; d.life -= 0.025; ctx.fillStyle = `rgba(200,190,170,${d.life * 0.5})`; ctx.beginPath(); ctx.arc(d.x, d.y, 3 + (1 - d.life) * 6, 0, TAU); ctx.fill(); });
    s._dust = dust.filter(d => d.life > 0).slice(-60);
    shadowE(ctx, cx, gy + 3, w * 0.62, 7, 0.5);
    // cart body
    const bgc = ctx.createLinearGradient(0, top, 0, top + h); bgc.addColorStop(0, "#5aa0f2"); bgc.addColorStop(0.5, "#2f6db5"); bgc.addColorStop(1, "#1d4680"); ctx.fillStyle = bgc; rr(ctx, cx - w / 2, top, w, h, 10); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.22)"; rr(ctx, cx - w / 2 + 6, top + 5, w - 12, 8, 4); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 1; ctx.strokeRect(cx - w / 2 + 10, top + 18, w - 20, h - 26);
    txt(ctx, s.m + " kg", cx, top + h / 2 + 4, "#fff", 15, "center", 800);
    metal(ctx, cx + w / 2 - 4, top - 22, 5, 26, true, "#aab"); metal(ctx, cx + w / 2 - 4, top - 24, 22, 5, false, "#aab");
    // wheels
    const rot = s.x * ppm / 12;
    [cx - w / 3, cx + w / 3].forEach(wx => { const wy = gy - 12; sphere(ctx, wx, wy, 13, "#2a2d34", -0.3, -0.4, 0.3); ctx.fillStyle = "#9aa3ad"; ctx.beginPath(); ctx.arc(wx, wy, 6, 0, TAU); ctx.fill(); ctx.strokeStyle = "#cfd6de"; ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { const a = rot + k * Math.PI / 2; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + Math.cos(a) * 11, wy + Math.sin(a) * 11); ctx.stroke(); } });
    if (s.push && s.F > 0) { arrow(ctx, cx - w / 2 - 26 - s.F * 2.2, top + h / 2, cx - w / 2 - 6, top + h / 2, "#ff904d", 6); tag(ctx, cx - w / 2 - 50 - s.F, top - 14, "push F = " + s.F + " N", "rgba(176,82,29,.92)"); }
    const fr = s.mu * s.m * 9.8; if (s.mu > 0 && (Math.abs(s.v) > 1e-3 || s.push)) { const fa = Math.abs(s.v) > 1e-3 ? fr : Math.min(fr, s.push ? s.F : 0); arrow(ctx, cx + w / 2 - 6, gy - 3, cx + w / 2 - 14 - Math.min(fa * 2, 140), gy - 3, "#ff6b6b", 4); tag(ctx, cx + w / 2 + 44, gy + 26, "friction " + fx(fa, 1) + " N", "rgba(138,44,58,.92)"); }
    if (Math.abs(s.v) > 0.01) { arrow(ctx, cx, top - 34, cx + clamp(s.v * 12, -130, 130), top - 34, "#3ecf8e", 4); tag(ctx, cx + clamp(s.v * 12, -130, 130) / 2, top - 54, fx(s.v, 1) + " m/s", "rgba(29,107,51,.92)"); }
    // graph panel
    const gx = 16, gw = Math.min(280, W - 32), gh = 92, gyy = 16;
    ctx.fillStyle = "rgba(8,14,28,.6)"; rr(ctx, gx, gyy, gw, gh, 12); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.stroke();
    txt(ctx, "velocity vs time", gx + 12, gyy + 14, "#cfe3ff", 11, "left", 700);
    ctx.strokeStyle = "rgba(255,255,255,.08)"; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(gx + 8, gyy + 24 + i * 15); ctx.lineTo(gx + gw - 8, gyy + 24 + i * 15); ctx.stroke(); }
    const mx = Math.max(5, ...s.hist.map(Math.abs)); ctx.save(); ctx.shadowColor = "#3ecf8e"; ctx.shadowBlur = 6; ctx.beginPath(); s.hist.forEach((vv, i) => { const x = gx + 8 + i / 120 * (gw - 16), y = gyy + gh - 8 - vv / mx * (gh - 34); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.strokeStyle = "#3ecf8e"; ctx.lineWidth = 2.2; ctx.stroke(); ctx.restore();
  };

  /* ================= 5. ATOM ================= */
  L.atom.draw = function (ctx, W, H, s) {
    const cx = W / 2, cy = H / 2, sh = D.shells(s.z), A = +D.EL[s.z - 1][2], t = now();
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(W, H) * 0.7); g.addColorStop(0, "#14213d"); g.addColorStop(1, "#04060c"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    starfield(ctx, W, H, 60, 9);
    const nucR = 5.2 * Math.cbrt(A) + 4;
    const ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucR * 3.2); ng.addColorStop(0, "rgba(255,120,90,.35)"); ng.addColorStop(1, "rgba(255,120,90,0)"); ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(cx, cy, nucR * 3.2, 0, TAU); ctx.fill();
    const base = Math.min(W, H);
    const orb = sh.map((cnt, i) => ({ cnt, i, r: base * 0.13 + 22 + i * base * 0.095, tilt: [0.32, -0.5, 0.75, -0.2][i], squash: [0.38, 0.5, 0.42, 0.55][i] }));
    const project = (o, a) => { const x = Math.cos(a) * o.r, y0 = Math.sin(a) * o.r * o.squash, z = Math.sin(a); const ct = Math.cos(o.tilt), st = Math.sin(o.tilt); return { x: cx + x * ct - y0 * st, y: cy + x * st + y0 * ct, z }; };
    const drawOrbit = (o, back) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.tilt); ctx.strokeStyle = `rgba(120,180,255,${back ? 0.14 : 0.32})`; ctx.lineWidth = back ? 1 : 1.5; ctx.beginPath(); ctx.ellipse(0, 0, o.r, o.r * o.squash, 0, back ? Math.PI : 0, back ? TAU : Math.PI); ctx.stroke(); ctx.restore(); };
    const electrons = []; orb.forEach(o => { for (let e = 0; e < o.cnt; e++) { const a = e / o.cnt * TAU + s.t * (1.1 - o.i * 0.2); electrons.push({ ...project(o, a), a, o }); } });
    orb.forEach(o => drawOrbit(o, true));
    const drawE = e => { const r = 5.5 + e.z * 1.5; ctx.save(); ctx.globalCompositeOperation = "lighter"; for (let k = 1; k <= 6; k++) { const p = project(e.o, e.a - k * 0.06); ctx.fillStyle = `rgba(90,170,255,${0.12 * (1 - k / 7)})`; ctx.beginPath(); ctx.arc(p.x, p.y, r * (1 - k / 9), 0, TAU); ctx.fill(); } ctx.restore(); glow(ctx, "rgba(80,170,255,.9)", 14, () => sphere(ctx, e.x, e.y, r, "#4fa3ff", -0.4, -0.5, 0.9)); };
    electrons.filter(e => e.z < 0).forEach(drawE);
    // nucleus 3D cluster
    const nuc = []; for (let i = 0; i < A; i++) { const yy = 1 - (i + 0.5) / A * 2, rad = Math.sqrt(1 - yy * yy), th = i * 2.399963 + t * 0.4; const rr2 = nucR * (A > 1 ? 0.85 : 0); nuc.push({ x: Math.cos(th) * rad * rr2, y: yy * rr2, z: Math.sin(th) * rad * rr2, p: (i * 7) % A < s.z }); }
    nuc.sort((a, b) => a.z - b.z).forEach(n => { const d = (n.z / (nucR + 1) + 1) / 2; sphere(ctx, cx + n.x, cy + n.y, 6.8 * (0.85 + d * 0.3), n.p ? mix("#e5533d", (1 - d) * 0.45, 0) : mix("#9aa6bc", (1 - d) * 0.45, 0), -0.4, -0.5, 0.6); });
    orb.forEach(o => drawOrbit(o, false));
    electrons.filter(e => e.z >= 0).forEach(drawE);
    orb.forEach(o => tag(ctx, cx + o.r * 0.78, cy - o.r * 0.55 - 10, "shell " + (o.i + 1) + ": " + o.cnt, "rgba(31,95,153,.85)"));
    // element tile
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 14; const tg = ctx.createLinearGradient(16, 16, 112, 124); tg.addColorStop(0, "rgba(255,255,255,.16)"); tg.addColorStop(1, "rgba(255,255,255,.05)"); ctx.fillStyle = tg; rr(ctx, 16, 16, 96, 108, 12); ctx.fill(); ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,.25)"; rr(ctx, 16, 16, 96, 108, 12); ctx.stroke();
    txt(ctx, String(s.z), 28, 32, "#9fb3d1", 12, "left", 700); txt(ctx, D.EL[s.z - 1][0], 64, 68, "#fff", 36, "center", 800); txt(ctx, D.EL[s.z - 1][1], 64, 102, "#cfe3ff", 11); txt(ctx, String(A), 100, 32, "#9fb3d1", 11, "right");
    tag(ctx, W - 80, H - 52, "● proton", "rgba(138,44,44,.9)"); tag(ctx, W - 80, H - 24, "● neutron", "rgba(74,82,102,.9)"); tag(ctx, W - 190, H - 24, "● electron", "rgba(31,95,153,.9)");
  };

  /* ================= 6. MOLECULE ================= */
  L.molecule.draw = function (ctx, W, H, s) {
    const M = D.MOL[s.mol], k = Math.min(W, H) * 0.22 * s.zoom, cx = W / 2, cy = H * 0.47, sc = Math.min(W, H) / 360;
    const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(W, H) * 0.75); g.addColorStop(0, "#1b2740"); g.addColorStop(1, "#06080f"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const floorY = H * 0.86; const fg2 = ctx.createLinearGradient(0, floorY - 40, 0, H); fg2.addColorStop(0, "rgba(255,255,255,0)"); fg2.addColorStop(1, "rgba(111,163,214,.08)"); ctx.fillStyle = fg2; ctx.fillRect(0, floorY - 40, W, H);
    const P = M.atoms.map(([e, x, y, z]) => { let X = x * Math.cos(s.ry) + z * Math.sin(s.ry), Z = -x * Math.sin(s.ry) + z * Math.cos(s.ry); let Y = y * Math.cos(s.rx) - Z * Math.sin(s.rx); Z = y * Math.sin(s.rx) + Z * Math.cos(s.rx); const p = 1 + Z * 0.15; return { e, x: cx + X * k * p, y: cy + Y * k * p, z: Z, p, X, Z2: Z }; });
    P.forEach(a => shadowE(ctx, cx + (a.x - cx) * 0.9, floorY, D.ACOL[a.e][1] * s.zoom * sc * 1.4, 6, 0.35));
    const items = [];
    M.bonds.forEach(([a, b, o]) => items.push({ z: (P[a].z + P[b].z) / 2 - 0.01, draw: () => {
      const A2 = P[a], B2 = P[b], dx = B2.x - A2.x, dy = B2.y - A2.y, n = Math.hypot(dx, dy) || 1, nx = -dy / n, ny = dx / n;
      const cyl = (off, wdt) => { const mx = (A2.x + B2.x) / 2 + nx * off, my = (A2.y + B2.y) / 2 + ny * off; [[A2, mx, my, D.ACOL[A2.e][0]], [B2, mx, my, D.ACOL[B2.e][0]]].forEach(([Q, ex, ey, col]) => { const gr = ctx.createLinearGradient(Q.x + nx * (off - wdt), Q.y + ny * (off - wdt), Q.x + nx * (off + wdt), Q.y + ny * (off + wdt)); gr.addColorStop(0, dark(col === "#eef1f5" ? "#c9cfd8" : col, 0.5)); gr.addColorStop(0.45, lite(col === "#eef1f5" ? "#c9cfd8" : col, 0.35)); gr.addColorStop(1, dark(col === "#eef1f5" ? "#c9cfd8" : col, 0.6)); ctx.strokeStyle = gr; ctx.lineWidth = wdt * 2; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(Q.x + nx * off, Q.y + ny * off); ctx.lineTo(ex, ey); ctx.stroke(); }); };
      const wdt = 4.2 * s.zoom * sc; if (o === 2) { cyl(5.5 * sc * s.zoom, wdt * 0.75); cyl(-5.5 * sc * s.zoom, wdt * 0.75); } else cyl(0, wdt);
    } }));
    P.forEach(a => items.push({ z: a.z, draw: () => { const [col, r] = D.ACOL[a.e], R = r * s.zoom * a.p * sc; const depth = clamp((a.z + 1.2) / 2.4, 0, 1); sphere(ctx, a.x, a.y, R, mix(col, (1 - depth) * 0.35, 0), -0.45, -0.55, 0.9); ctx.save(); ctx.globalAlpha = 0.85; txt(ctx, a.e, a.x + R * 0.15, a.y + R * 0.2, a.e === "H" ? "#334" : "rgba(255,255,255,.9)", Math.max(10, R * 0.55), "center", 800); ctx.restore(); } }));
    if (M.f === "H₂O" || M.f === "NH₃") { const c0 = P[0]; items.push({ z: c0.z - 0.5, draw: () => { const dirs = M.f === "H₂O" ? [[-0.5, -0.9], [0.5, -0.9]] : [[0, -1]]; dirs.forEach(([dx, dy]) => { const r = 26 * s.zoom * sc, x = c0.x + dx * r * 1.1, y = c0.y + dy * r * 1.1; const lg = ctx.createRadialGradient(x, y, 0, x, y, r); lg.addColorStop(0, "rgba(140,200,255,.28)"); lg.addColorStop(1, "rgba(140,200,255,0)"); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }); } }); }
    items.sort((a, b) => a.z - b.z).forEach(i => i.draw());
    tag(ctx, W / 2, 26, M.f + " · " + M.shape + " · " + M.angle, "rgba(31,64,106,.9)");
    if (M.f === "H₂O" || M.f === "NH₃") txt(ctx, "glow = lone pair of electrons", W / 2, H - 16, "#7f93b3", 11);
  };

  /* ================= 7. STATES OF MATTER ================= */
  L.particles.draw = function (ctx, W, H, s) {
    const bx = W * 0.2, bw = W * 0.6, by = 40, bh = H - 80, st = this.state(s.T), t = now();
    labWall(ctx, W, H); benchFloor(ctx, W, H, by + bh + 26);
    // burner
    const fx0 = bx + bw / 2, fy = by + bh + 26; metal(ctx, fx0 - 18, fy - 4, 36, 18, false, "#7d8794", 4); metal(ctx, fx0 - 6, by + bh + 6, 12, 20, true, "#9aa3ad");
    const heat = clamp((s.T + 50) / 250, 0, 1) * (s.heat ? 1.3 : 0.8); if (s.heat || s.T > 0) { ctx.save(); ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < 3; i++) { const fh = (12 + heat * 22) * (1 + Math.sin(t * 15 + i) * 0.12) * (1 - i * 0.25), fl = ctx.createRadialGradient(fx0, by + bh + 4, 1, fx0, by + bh + 4 - fh * 0.5, fh); fl.addColorStop(0, i ? "rgba(90,170,255,.8)" : "rgba(180,220,255,.9)"); fl.addColorStop(1, "rgba(40,100,255,0)"); ctx.fillStyle = fl; ctx.beginPath(); ctx.ellipse(fx0, by + bh + 4 - fh * 0.4, 9 - i * 2, fh * 0.6, 0, 0, TAU); ctx.fill(); } ctx.restore(); }
    if (s.cool) { for (let i = 0; i < 8; i++) { ctx.fillStyle = `rgba(200,235,255,${0.4 + 0.3 * Math.sin(t * 3 + i)})`; ctx.font = "16px Arial"; ctx.fillText("❄", bx + bw * (i + 0.5) / 8, by + bh + 16); } }
    // liquid body
    if (st === "Liquid") { const top = by + bh * 0.45 - 6; const lg = ctx.createLinearGradient(0, top, 0, by + bh); lg.addColorStop(0, "rgba(80,160,255,.28)"); lg.addColorStop(1, "rgba(40,100,220,.45)"); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(bx + 3, by + bh); ctx.lineTo(bx + 3, top); for (let x = bx; x <= bx + bw; x += 8) ctx.lineTo(x, top + Math.sin(x * 0.05 + t * 3) * 2.5); ctx.lineTo(bx + bw - 3, by + bh); ctx.fill(); }
    if (st === "Gas") { ctx.save(); ctx.globalAlpha = 0.25; for (let i = 0; i < 6; i++) { const x = bx + bw * (0.2 + 0.6 * rnd(i)), y = by - ((t * 30 + i * 40) % 80); ctx.strokeStyle = "#cfe6ff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.bezierCurveTo(x - 10, y + 10, x + 10, y, x, y - 10); ctx.stroke(); } ctx.restore(); }
    // bonds in solid
    const hue = clamp(220 - (s.T + 50) * 0.9, 0, 220);
    if (st === "Solid") { ctx.strokeStyle = "rgba(160,210,255,.35)"; ctx.lineWidth = 1.5; s.p.forEach(p => s.p.forEach(q => { if (q.i > p.i && Math.hypot(p.x - q.x, p.y - q.y) < 27) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); } })); }
    s.p.forEach(p => { const sp = Math.hypot(p.vx, p.vy); if (st !== "Solid" && sp > 60) { ctx.strokeStyle = `hsla(${hue},80%,65%,.25)`; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05); ctx.stroke(); } sphere(ctx, p.x, p.y, 9, hslHex(hue, 0.7, 0.52), -0.45, -0.5, 0.8); });
    // glass beaker
    ctx.save(); ctx.lineJoin = "round"; const gl = ctx.createLinearGradient(bx, 0, bx + bw, 0); gl.addColorStop(0, "rgba(200,230,255,.35)"); gl.addColorStop(0.08, "rgba(200,230,255,.08)"); gl.addColorStop(0.92, "rgba(200,230,255,.05)"); gl.addColorStop(1, "rgba(200,230,255,.3)"); ctx.fillStyle = gl; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "rgba(210,235,255,.75)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 8, by - 4); ctx.lineTo(bx, by + 4); ctx.lineTo(bx, by + bh - 10); ctx.quadraticCurveTo(bx, by + bh, bx + 10, by + bh); ctx.lineTo(bx + bw - 10, by + bh); ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw, by + bh - 10); ctx.lineTo(bx + bw, by + 4); ctx.lineTo(bx + bw + 8, by - 4); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(bx + 8, by + 12, 6, bh - 30);
    ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = "600 10px Open Sans"; ctx.textAlign = "left"; for (let i = 1; i < 5; i++) { const y = by + bh - i * bh / 5; ctx.fillRect(bx + bw - 26, y, 18, 1.5); ctx.fillText(i * 100 + " ml", bx + bw - 70, y + 1); } ctx.restore();
    tag(ctx, W / 2, 20, st + " · " + Math.round(s.T) + " °C", st === "Solid" ? "rgba(31,95,153,.92)" : st === "Liquid" ? "rgba(29,107,91,.92)" : "rgba(138,44,58,.92)");
    // thermometer
    const tx = W * 0.9, ty = 50, th = H - 120, f = (s.T + 50) / 250;
    ctx.fillStyle = "rgba(230,240,255,.15)"; rr(ctx, tx - 9, ty - 4, 18, th + 8, 9); ctx.fill(); ctx.strokeStyle = "rgba(230,240,255,.5)"; ctx.lineWidth = 1.5; ctx.stroke();
    const mg = ctx.createLinearGradient(tx - 4, 0, tx + 4, 0); mg.addColorStop(0, "#8b1414"); mg.addColorStop(0.5, "#ff5a5a"); mg.addColorStop(1, "#8b1414"); ctx.fillStyle = mg; rr(ctx, tx - 4, ty + th * (1 - f), 8, th * f + 6, 4); ctx.fill();
    glow(ctx, "rgba(255,80,80,.6)", 10, () => sphere(ctx, tx, ty + th + 14, 14, "#e63946", -0.4, -0.5, 0.8));
    ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = "600 10px Open Sans"; ctx.textAlign = "right"; for (let v = -50; v <= 200; v += 50) { const y = ty + th * (1 - (v + 50) / 250); ctx.fillRect(tx - 14, y, 6, 1.5); ctx.fillText(v + "°", tx - 17, y + 3); }
  };
  function hslHex(h, s, l) { const a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12, c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, "0"); }; return "#" + f(0) + f(8) + f(4); }

  /* ================= 8. LIGHT & SHADOWS ================= */
  L.shadows.draw = function (ctx, W, H, s) {
    const { k, ox, sx, tx, cy, oh } = this.geo(s, W, H), sc = (sx - tx) / (ox - tx), shH = oh * sc, blur = s.size * k * ((sx - ox) / (ox - tx));
    bg(ctx, W, H, "#1a1c22", "#0d0e12");
    const floorY = cy + oh * 1.25 + 30; const fg = ctx.createLinearGradient(0, floorY, 0, H); fg.addColorStop(0, "#2a2620"); fg.addColorStop(1, "#141210"); ctx.fillStyle = fg; ctx.fillRect(0, floorY, W, H - floorY);
    // light cone
    ctx.save(); ctx.globalCompositeOperation = "lighter"; const cone = ctx.createRadialGradient(tx, cy, 4, tx, cy, sx - tx); cone.addColorStop(0, "rgba(255,236,170,.55)"); cone.addColorStop(1, "rgba(255,226,150,.05)"); ctx.fillStyle = cone; const spread = Math.max(shH * 0.9, H * 0.55); ctx.beginPath(); ctx.moveTo(tx, cy - 8); ctx.lineTo(sx, cy - spread); ctx.lineTo(sx, cy + spread); ctx.lineTo(tx, cy + 8); ctx.fill(); ctx.restore();
    // screen
    const sg = ctx.createLinearGradient(sx, 0, sx + 16, 0); sg.addColorStop(0, "#f4efe4"); sg.addColorStop(1, "#bdb6a6"); ctx.fillStyle = sg; ctx.fillRect(sx, 16, 16, floorY - 16);
    ctx.save(); ctx.beginPath(); ctx.rect(sx, 16, 16, floorY - 16); ctx.clip(); const lit = ctx.createRadialGradient(sx, cy, 0, sx, cy, spread); lit.addColorStop(0, "rgba(255,240,190,.55)"); lit.addColorStop(1, "rgba(255,240,190,0)"); ctx.fillStyle = lit; ctx.fillRect(sx, 0, 16, H);
    // penumbra then umbra on the screen (seen edge-on, so draw as a vertical band)
    ctx.filter = `blur(${Math.min(22, blur + 2)}px)`; ctx.fillStyle = "rgba(10,10,14,.45)"; ctx.fillRect(sx, cy - shH / 2 - blur, 16, shH + blur * 2);
    ctx.filter = `blur(${Math.min(10, blur * 0.4)}px)`; ctx.fillStyle = "rgba(10,10,14,.85)"; ctx.fillRect(sx, cy - shH / 2 + blur * 0.3, 16, Math.max(2, shH - blur * 0.6)); ctx.restore();
    // shadow silhouette projected beside screen (inset view)
    const ivx = sx - 70, ivw = 60, ivh = Math.min(H - 60, Math.max(80, shH + 30));
    ctx.fillStyle = "rgba(244,239,228,.95)"; rr(ctx, ivx - ivw / 2, cy - ivh / 2, ivw, ivh, 8); ctx.fill();
    ctx.save(); rr(ctx, ivx - ivw / 2, cy - ivh / 2, ivw, ivh, 8); ctx.clip(); ctx.filter = `blur(${Math.min(14, blur * 0.5 + 1)}px)`; ctx.fillStyle = "rgba(20,20,26,.85)"; const scl = Math.min(1, (ivh - 20) / Math.max(1, shH)); shapeFlat(ctx, s.obj, ivx, cy, shH * scl); ctx.restore();
    txt(ctx, "on screen", ivx, cy + ivh / 2 + 12, "#9aa", 10);
    // dashed edge rays
    ctx.setLineDash([4, 6]); ctx.strokeStyle = "rgba(255,226,150,.45)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, cy); ctx.lineTo(sx, cy - shH / 2); ctx.moveTo(tx, cy); ctx.lineTo(sx, cy + shH / 2); ctx.stroke(); ctx.setLineDash([]);
    // object with stand
    metal(ctx, ox - 2, cy + oh / 2, 4, floorY - cy - oh / 2, true, "#8a94a2"); shadowE(ctx, ox, floorY + 2, 30, 6, 0.5);
    shape3D(ctx, s.obj, ox, cy, oh, tx);
    // torch
    shadowE(ctx, tx - 20, floorY + 2, 40, 6, 0.5);
    ctx.save(); ctx.translate(tx, cy); const tb = ctx.createLinearGradient(0, -13, 0, 13); tb.addColorStop(0, "#5c6370"); tb.addColorStop(0.4, "#c3cad4"); tb.addColorStop(1, "#30353e"); ctx.fillStyle = tb; rr(ctx, -54, -11, 46, 22, 6); ctx.fill(); ctx.fillStyle = tb; ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(4, -18 - s.size * 0.3); ctx.lineTo(4, 18 + s.size * 0.3); ctx.lineTo(-10, 12); ctx.fill();
    ctx.globalCompositeOperation = "lighter"; const lens = ctx.createRadialGradient(4, 0, 0, 4, 0, 26 + s.size); lens.addColorStop(0, "rgba(255,255,230,1)"); lens.addColorStop(0.3, "rgba(255,230,150,.7)"); lens.addColorStop(1, "rgba(255,200,100,0)"); ctx.fillStyle = lens; ctx.beginPath(); ctx.arc(4, 0, 26 + s.size, 0, TAU); ctx.fill(); ctx.restore();
    metal(ctx, tx - 34, cy + 11, 5, floorY - cy - 11, true, "#8a94a2");
    tag(ctx, tx - 26, cy - 40, "torch", "rgba(122,90,18,.92)"); tag(ctx, ox, cy - oh / 2 - 24, "object", "rgba(31,95,153,.92)"); tag(ctx, sx - 30, 34, "screen", "rgba(74,82,102,.92)");
    tag(ctx, ivx, cy - ivh / 2 - 16, "shadow " + fx(shH / k / 1.6, 0) + " cm", "rgba(40,40,40,.92)");
    vignette(ctx, W, H, 0.5);
  };
  function shapeFlat(ctx, o, x, y, h) { ctx.beginPath(); if (o === "Ball") ctx.arc(x, y, h / 2, 0, TAU); else if (o === "Box") ctx.rect(x - h / 2, y - h / 2, h, h); else { ctx.moveTo(x, y - h / 2); ctx.lineTo(x + h * 0.35, y + h * 0.2); ctx.lineTo(x - h * 0.35, y + h * 0.2); ctx.closePath(); ctx.rect(x - h * 0.06, y + h * 0.2, h * 0.12, h * 0.3); } ctx.fill(); }
  function shape3D(ctx, o, x, y, h, lightX) {
    const lx = lightX < x ? -0.6 : 0.6;
    if (o === "Ball") { sphere(ctx, x, y, h / 2, "#3b82f6", lx, -0.3, 0.8); return; }
    if (o === "Box") { const s2 = h, d = s2 * 0.25; ctx.fillStyle = "#1e3a8a"; ctx.beginPath(); ctx.moveTo(x + s2 / 2, y - s2 / 2); ctx.lineTo(x + s2 / 2 + d, y - s2 / 2 - d); ctx.lineTo(x + s2 / 2 + d, y + s2 / 2 - d); ctx.lineTo(x + s2 / 2, y + s2 / 2); ctx.fill(); ctx.fillStyle = "#93c5fd"; ctx.beginPath(); ctx.moveTo(x - s2 / 2, y - s2 / 2); ctx.lineTo(x - s2 / 2 + d, y - s2 / 2 - d); ctx.lineTo(x + s2 / 2 + d, y - s2 / 2 - d); ctx.lineTo(x + s2 / 2, y - s2 / 2); ctx.fill(); const fg = ctx.createLinearGradient(x - s2 / 2, 0, x + s2 / 2, 0); fg.addColorStop(0, "#60a5fa"); fg.addColorStop(1, "#2563eb"); ctx.fillStyle = fg; ctx.fillRect(x - s2 / 2, y - s2 / 2, s2, s2); return; }
    ctx.fillStyle = "#7a4a22"; ctx.fillRect(x - h * 0.06, y + h * 0.15, h * 0.12, h * 0.35);
    [[0, -0.28, 0.24], [-0.14, -0.05, 0.22], [0.14, -0.05, 0.22], [0, 0.08, 0.26]].forEach(([dx, dy, r]) => sphere(ctx, x + dx * h, y + dy * h, r * h, "#2f9e44", lx, -0.5, 0.25));
  }

  /* ================= 9. FLOAT OR SINK ================= */
  L.float.draw = function (ctx, W, H, s) {
    const wl = H * 0.4, rw = this.rho(s), t = now(), x0 = 30, x1 = W - 30, bot = H - 30;
    labWall(ctx, W, H); benchFloor(ctx, W, H, H - 18);
    // water
    const wg = ctx.createLinearGradient(0, wl, 0, bot); wg.addColorStop(0, `rgba(${80 - s.salt},${170 - s.salt * 2},${235 - s.salt * 2},.55)`); wg.addColorStop(1, `rgba(${20},${70 - s.salt},${150 - s.salt * 2},.85)`);
    const surf = x => wl + Math.sin(x * 0.035 + t * 2.2) * 2 + Math.sin(x * 0.09 - t * 3.1) * 1;
    ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(x0, bot); for (let x = x0; x <= x1; x += 6) ctx.lineTo(x, surf(x)); ctx.lineTo(x1, bot); ctx.fill();
    // caustics
    ctx.save(); ctx.beginPath(); ctx.rect(x0, wl, x1 - x0, bot - wl); ctx.clip(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "rgba(180,230,255,.08)"; ctx.lineWidth = 3; for (let i = 0; i < 14; i++) { ctx.beginPath(); for (let x = x0; x <= x1; x += 10) ctx.lineTo(x, bot - 20 - i * 6 + Math.sin(x * 0.04 + t * 1.5 + i) * 6); ctx.stroke(); } ctx.restore();
    // surface highlight
    ctx.strokeStyle = "rgba(230,248,255,.75)"; ctx.lineWidth = 2; ctx.beginPath(); for (let x = x0; x <= x1; x += 6) x === x0 ? ctx.moveTo(x, surf(x)) : ctx.lineTo(x, surf(x)); ctx.stroke();
    // salt crystals on bottom
    for (let i = 0; i < s.salt * 6; i++) { ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(x0 + 10 + rnd(i) * (x1 - x0 - 20), bot - 4 - rnd(i * 3) * 6, 3, 3); }
    // bubbles
    const bubs = s._bub || (s._bub = []); if (Math.random() < 0.15) bubs.push({ x: x0 + Math.random() * (x1 - x0), y: bot - 4, r: 1 + Math.random() * 3 }); bubs.forEach(b => { b.y -= 0.6 + b.r * 0.3; b.x += Math.sin(b.y * 0.1) * 0.3; ctx.strokeStyle = "rgba(220,245,255,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.stroke(); }); s._bub = bubs.filter(b => b.y > wl + 4).slice(-50);
    // ripples & splashes
    const rip = s._rip || (s._rip = []); s.items.forEach(it => { if (it._py !== undefined && it._py + 18 < wl && it.y + 18 >= wl) { rip.push({ x: it.x, r: 6, a: 0.8 }); for (let i = 0; i < 8; i++) rip.push({ x: it.x, y: wl, vx: (Math.random() - 0.5) * 4, vy: -2 - Math.random() * 3, drop: true, a: 1 }); } it._py = it.y; });
    rip.forEach(r => { if (r.drop) { r.x += r.vx; r.y += r.vy; r.vy += 0.25; r.a -= 0.03; ctx.fillStyle = `rgba(200,235,255,${r.a})`; ctx.beginPath(); ctx.arc(r.x, r.y, 2, 0, TAU); ctx.fill(); } else { r.r += 1.6; r.a -= 0.018; ctx.strokeStyle = `rgba(230,248,255,${r.a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(r.x, wl, r.r, r.r * 0.22, 0, 0, TAU); ctx.stroke(); } }); s._rip = rip.filter(r => r.a > 0);
    // objects
    s.items.forEach(it => { drawObj(ctx, it.o[0], it.x, it.y + Math.sin(t * 2 + it.x) * (it.o[1] < rw && it.y > wl - 18 ? 1.2 : 0), it.o[2]); tag(ctx, it.x, it.y - 34, it.o[0], "rgba(20,32,60,.8)"); });
    // glass tank
    ctx.save(); const gl = ctx.createLinearGradient(x0, 0, x1, 0); gl.addColorStop(0, "rgba(210,235,255,.25)"); gl.addColorStop(0.05, "rgba(210,235,255,.04)"); gl.addColorStop(0.95, "rgba(210,235,255,.04)"); gl.addColorStop(1, "rgba(210,235,255,.22)"); ctx.fillStyle = gl; ctx.fillRect(x0, 40, x1 - x0, bot - 40);
    ctx.strokeStyle = "rgba(210,235,255,.7)"; ctx.lineWidth = 3; ctx.strokeRect(x0, 40, x1 - x0, bot - 40); ctx.fillStyle = "rgba(255,255,255,.15)"; ctx.fillRect(x0 + 8, 48, 5, bot - 60); ctx.restore();
    tag(ctx, W - 40, wl - 18, "water density " + fx(rw, 3) + " g/cm³", "rgba(31,95,153,.92)", "#fff", "right");
  };
  function drawObj(ctx, name, x, y, col) {
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    if (name === "Wooden block") { wood(ctx, x - 20, y - 16, 40, 32, "#b07a43", 4, x); }
    else if (name === "Ice cube") { const g = ctx.createLinearGradient(x - 18, y - 18, x + 18, y + 18); g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(1, "rgba(150,210,255,.6)"); ctx.fillStyle = g; rr(ctx, x - 17, y - 17, 34, 34, 7); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fillRect(x - 11, y - 12, 6, 14); }
    else if (name === "Candle") { const g = ctx.createLinearGradient(x - 9, 0, x + 9, 0); g.addColorStop(0, "#d9cfb8"); g.addColorStop(0.4, "#fff8e8"); g.addColorStop(1, "#b9ad93"); ctx.fillStyle = g; rr(ctx, x - 9, y - 20, 18, 40, 3); ctx.fill(); ctx.fillStyle = "#333"; ctx.fillRect(x - 1, y - 26, 2, 7); }
    else if (name === "Egg") { const g = ctx.createRadialGradient(x - 5, y - 8, 2, x, y, 20); g.addColorStop(0, "#fffaf0"); g.addColorStop(1, "#d8c3a0"); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 14, 19, 0, 0, TAU); ctx.fill(); }
    else if (name === "Coin") { const g = ctx.createLinearGradient(x - 18, y, x + 18, y); g.addColorStop(0, "#8a6d1a"); g.addColorStop(0.4, "#f2d16b"); g.addColorStop(1, "#7a5c10"); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 18, 6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = "#6b520e"; ctx.fillRect(x - 18, y, 36, 3); }
    else if (name === "Stone") { ctx.fillStyle = "#6f6f6f"; ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, r = 17 + rnd(i + x) * 4; ctx.lineTo(x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 0.8); } ctx.closePath(); ctx.fill(); ctx.shadowColor = "transparent"; ctx.fillStyle = "rgba(255,255,255,.15)"; ctx.beginPath(); ctx.ellipse(x - 5, y - 5, 8, 4, -0.3, 0, TAU); ctx.fill(); }
    else if (name === "Key") { const g = ctx.createLinearGradient(x, y - 8, x, y + 8); g.addColorStop(0, "#e5e7eb"); g.addColorStop(1, "#8b9099"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x - 12, y, 9, 0, TAU); ctx.fill(); ctx.fillRect(x - 4, y - 3, 26, 6); ctx.fillRect(x + 14, y + 3, 4, 6); ctx.fillRect(x + 20, y + 3, 3, 5); ctx.shadowColor = "transparent"; ctx.fillStyle = "#555"; ctx.beginPath(); ctx.arc(x - 12, y, 3.5, 0, TAU); ctx.fill(); }
    else if (name === "Apple") { ctx.shadowColor = "transparent"; sphere(ctx, x, y + 2, 17, "#c81d25", -0.4, -0.5, 0.7); ctx.strokeStyle = "#5a3a1a"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y - 13); ctx.lineTo(x + 2, y - 22); ctx.stroke(); ctx.fillStyle = "#3a9d43"; ctx.beginPath(); ctx.ellipse(x + 8, y - 19, 7, 3.5, -0.5, 0, TAU); ctx.fill(); }
    else { ctx.shadowColor = "transparent"; sphere(ctx, x, y, 17, col, -0.4, -0.5, 0.8); }
    ctx.restore();
  }

  /* ================= 10. FRACTION BUILDER ================= */
  L.fraction.draw = function (ctx, W, H, s) {
    const { r, px, py, bx, by, bw, bh } = this.geo(W, H), t = now();
    wood(ctx, 0, 0, W, H, "#5a3a22", 0, 7); vignette(ctx, W, H, 0.45);
    // plate
    shadowE(ctx, px + 6, py + 10, r + 30, r + 22, 0.5); const pl = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, r * 0.2, px, py, r + 28); pl.addColorStop(0, "#ffffff"); pl.addColorStop(1, "#c9ced6"); ctx.fillStyle = pl; ctx.beginPath(); ctx.arc(px, py, r + Math.min(26, Math.max(10, px - r - 4)), 0, TAU); ctx.fill();
    for (let i = 0; i < s.da; i++) {
      const a0 = i / s.da * TAU - Math.PI / 2, a1 = (i + 1) / s.da * TAU - Math.PI / 2, am = (a0 + a1) / 2, on = s.a.includes(i), lift = on ? 7 : 0, ox = Math.cos(am) * lift, oy = Math.sin(am) * lift;
      ctx.save(); ctx.translate(ox, oy);
      if (on) { ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4; }
      ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, r + 8, a0 + 0.004, a1 - 0.004); ctx.closePath();
      const crust = ctx.createRadialGradient(px, py, r * 0.85, px, py, r + 8); crust.addColorStop(0, "#d99a4e"); crust.addColorStop(1, "#9c5a1f"); ctx.fillStyle = crust; ctx.fill(); ctx.shadowColor = "transparent";
      ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, r - 2, a0 + 0.01, a1 - 0.01); ctx.closePath();
      if (on) { const ch = ctx.createRadialGradient(px, py, 0, px, py, r); ch.addColorStop(0, "#ffd86b"); ch.addColorStop(1, "#f3a93c"); ctx.fillStyle = ch; ctx.fill(); ctx.save(); ctx.clip(); for (let k2 = 0; k2 < 3; k2++) { const rr2 = r * (0.35 + 0.22 * k2), aa = am + (k2 - 1) * 0.18 * (8 / s.da); const ppx = px + Math.cos(aa) * rr2, ppy = py + Math.sin(aa) * rr2, pr = Math.max(4, r * 0.09); const pg = ctx.createRadialGradient(ppx - pr * 0.3, ppy - pr * 0.3, 1, ppx, ppy, pr); pg.addColorStop(0, "#e85a4f"); pg.addColorStop(1, "#8f1d1d"); ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(ppx, ppy, pr, 0, TAU); ctx.fill(); } for (let k2 = 0; k2 < 4; k2++) { ctx.fillStyle = "#3a7d2c"; const rr2 = r * (0.3 + 0.6 * rnd(i * 9 + k2)), aa = a0 + (a1 - a0) * rnd(i * 3 + k2 * 7); ctx.beginPath(); ctx.ellipse(px + Math.cos(aa) * rr2, py + Math.sin(aa) * rr2, 3, 1.6, aa, 0, TAU); ctx.fill(); } ctx.restore(); }
      else { const dg = ctx.createRadialGradient(px, py, 0, px, py, r); dg.addColorStop(0, "#f6e2b3"); dg.addColorStop(1, "#e7c98c"); ctx.fillStyle = dg; ctx.fill(); }
      ctx.strokeStyle = "rgba(120,70,20,.5)"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
    }
    // chocolate bar
    shadowE(ctx, bx + bw / 2, by + bh + 12, bw * 0.55, 10, 0.5);
    for (let i = 0; i < s.db; i++) {
      const x = bx + i * bw / s.db, w = bw / s.db, on = s.b.includes(i);
      const g = ctx.createLinearGradient(0, by, 0, by + bh); if (on) { g.addColorStop(0, "#8b5a3c"); g.addColorStop(0.5, "#5b3420"); g.addColorStop(1, "#3a2012"); } else { g.addColorStop(0, "#e5e7eb"); g.addColorStop(0.5, "#b8bec8"); g.addColorStop(1, "#8d949e"); }
      ctx.fillStyle = g; rr(ctx, x + 2, by, w - 4, bh, 6); ctx.fill();
      ctx.fillStyle = on ? "rgba(255,220,180,.18)" : "rgba(255,255,255,.45)"; rr(ctx, x + 6, by + 4, w - 12, 8, 4); ctx.fill();
      ctx.strokeStyle = on ? "rgba(0,0,0,.35)" : "rgba(80,90,100,.5)"; ctx.lineWidth = 1; rr(ctx, x + 6, by + 6, w - 12, bh - 12, 4); ctx.stroke();
    }
    const fa = s.a.length / s.da, fb = s.b.length / s.db, cmp = Math.abs(fa - fb) < 1e-9 ? "=" : fa > fb ? ">" : "<";
    txt(ctx, `${s.a.length}/${s.da}`, px, py + r + 52, "#fff", 24, "center", 800); txt(ctx, `${s.b.length}/${s.db}`, bx + bw / 2, by + bh + 34, "#fff", 24, "center", 800);
    tag(ctx, bx + bw / 2, by + bh + 82, `A ${cmp} B`, cmp === "=" ? "rgba(29,107,51,.95)" : "rgba(36,64,106,.95)");
    txt(ctx, "A · pizza", px, py - r - 40, "#f3e7d3", 12, "center", 700); txt(ctx, "B · chocolate bar", bx + bw / 2, by - 16, "#f3e7d3", 12, "center", 700);
  };

  /* ================= 11. MAGNETIC OR NOT ================= */
  L.magnetic.draw = function (ctx, W, H, s) {
    wood(ctx, 0, 0, W, H, "#6b4a2e", 0, 5); vignette(ctx, W, H, 0.4); const t = now();
    D.MITEMS.forEach(([n, m], i) => {
      let [x, y] = this.pos(i, W, H); const cw = Math.min(144, W * 0.3 - 6), ch = 76; const d = s.done[n], sel = s.sel === i, stuck = d && m;
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4; ctx.fillStyle = sel ? "rgba(255,240,225,.95)" : "rgba(250,246,238,.92)"; rr(ctx, x - cw / 2, y - ch / 2, cw, ch, 12); ctx.fill(); ctx.restore();
      ctx.strokeStyle = sel ? "#ff904d" : d ? (d.ok ? "#22a06b" : "#e5484d") : "rgba(0,0,0,.08)"; ctx.lineWidth = sel || d ? 3 : 1; rr(ctx, x - cw / 2, y - ch / 2, cw, ch, 12); ctx.stroke();
      ctx.save(); ctx.translate(x, y); const isc = Math.min(1, cw / 120); ctx.scale(isc, isc); ctx.translate(-x, -y);
      const iy = stuck ? y - 18 : y - 6;
      item(ctx, n, x, iy + (sel && !d ? Math.sin(t * 4) * 1.5 : 0));
      ctx.restore(); txt(ctx, n, x, y + 24, "#2b2b2b", cw < 110 ? 10 : 12, "center", 700);
      if (d) tag(ctx, x, y - 50, m ? "attracted ✓" : "not attracted", m ? "rgba(34,160,107,.95)" : "rgba(90,90,90,.9)");
      if (stuck) { magnetIcon(ctx, x, iy - 26, 0.6); }
    });
    if (s.sel != null && !s.done[D.MITEMS[s.sel][0]]) { const [x, y] = this.pos(s.sel, W, H); magnetIcon(ctx, x + 58, y - 52 + Math.sin(t * 3) * 3, 1); }
    tag(ctx, W / 2, H - 22, `Score ${s.score} / ${s.tries}`, "rgba(36,64,106,.95)");
  };
  function magnetIcon(ctx, x, y, sc) { ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4; ctx.lineWidth = 15; const g = ctx.createLinearGradient(-26, 0, 26, 0); g.addColorStop(0, "#8b1414"); g.addColorStop(0.5, "#ff5a5a"); g.addColorStop(1, "#8b1414"); ctx.strokeStyle = g; ctx.beginPath(); ctx.arc(0, 0, 19, Math.PI, 0); ctx.stroke(); ctx.shadowColor = "transparent"; metal(ctx, -26.5, 0, 15, 14, true, "#cfd6de", 2); metal(ctx, 11.5, 0, 15, 14, true, "#cfd6de", 2); ctx.restore(); }
  function item(ctx, n, x, y) {
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2;
    const mg = (y0, y1, c = "#9aa3ad") => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, lite(c, 0.5)); g.addColorStop(0.5, c); g.addColorStop(1, dark(c, 0.4)); return g; };
    if (n === "Iron nail") { ctx.fillStyle = mg(y - 3, y + 3, "#7d8794"); ctx.fillRect(x - 24, y - 2.5, 44, 5); ctx.beginPath(); ctx.moveTo(x + 20, y - 2.5); ctx.lineTo(x + 30, y); ctx.lineTo(x + 20, y + 2.5); ctx.fill(); ctx.fillRect(x - 28, y - 7, 5, 14); }
    else if (n === "Paper clip") { ctx.strokeStyle = mg(y - 8, y + 8, "#b8c0ca"); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 20, y + 6); ctx.lineTo(x + 18, y + 6); ctx.arc(x + 18, y, 6, Math.PI / 2, -Math.PI / 2, true); ctx.lineTo(x - 18, y - 6); ctx.arc(x - 18, y - 1, 5, -Math.PI / 2, Math.PI / 2, true); ctx.lineTo(x + 12, y + 4); ctx.stroke(); }
    else if (n === "Steel pin") { ctx.fillStyle = mg(y - 1.5, y + 1.5, "#c9d0d8"); ctx.fillRect(x - 24, y - 1.2, 46, 2.4); sphere(ctx, x - 26, y, 5, "#e5484d", -0.4, -0.5, 0.8); }
    else if (n === "Plastic spoon") { ctx.fillStyle = "#4dabf7"; ctx.beginPath(); ctx.ellipse(x + 16, y, 11, 7, 0, 0, TAU); ctx.fill(); rr(ctx, x - 28, y - 2.5, 36, 5, 2.5); ctx.fill(); ctx.shadowColor = "transparent"; ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.beginPath(); ctx.ellipse(x + 13, y - 2, 5, 2, 0, 0, TAU); ctx.fill(); }
    else if (n === "Rubber eraser") { const g = ctx.createLinearGradient(0, y - 9, 0, y + 9); g.addColorStop(0, "#ffb3c6"); g.addColorStop(1, "#e05780"); ctx.fillStyle = g; rr(ctx, x - 20, y - 9, 40, 18, 4); ctx.fill(); ctx.shadowColor = "transparent"; ctx.fillStyle = "#4361ee"; ctx.fillRect(x - 4, y - 9, 24, 18); }
    else if (n === "Wooden pencil") { ctx.fillStyle = mg(y - 5, y + 5, "#f4c430"); ctx.fillRect(x - 24, y - 5, 38, 10); ctx.fillStyle = "#e8c39e"; ctx.beginPath(); ctx.moveTo(x + 14, y - 5); ctx.lineTo(x + 28, y); ctx.lineTo(x + 14, y + 5); ctx.fill(); ctx.fillStyle = "#333"; ctx.beginPath(); ctx.moveTo(x + 24, y - 1.5); ctx.lineTo(x + 28, y); ctx.lineTo(x + 24, y + 1.5); ctx.fill(); ctx.fillStyle = "#ff8fab"; ctx.fillRect(x - 30, y - 5, 6, 10); }
    else if (n === "Aluminium can") { const g = ctx.createLinearGradient(x - 12, 0, x + 12, 0); g.addColorStop(0, "#8d949e"); g.addColorStop(0.35, "#f1f3f5"); g.addColorStop(1, "#7a818b"); ctx.fillStyle = g; rr(ctx, x - 12, y - 16, 24, 32, 4); ctx.fill(); ctx.shadowColor = "transparent"; ctx.fillStyle = "#e03131"; ctx.fillRect(x - 12, y - 6, 24, 10); }
    else if (n === "Copper wire") { ctx.strokeStyle = mg(y - 8, y + 8, "#c87533"); ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 60; k++) { const a = k / 60 * TAU * 5; ctx.lineTo(x - 24 + k * 0.8, y + Math.sin(a) * 8); } ctx.stroke(); }
    else if (n === "Glass marble") { ctx.shadowColor = "transparent"; const g = ctx.createRadialGradient(x - 4, y - 5, 1, x, y, 13); g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.4, "rgba(120,200,255,.55)"); g.addColorStop(1, "rgba(30,110,200,.75)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill(); ctx.strokeStyle = "rgba(255,120,60,.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 6, y + 4); ctx.bezierCurveTo(x - 2, y - 6, x + 3, y + 6, x + 7, y - 3); ctx.stroke(); }
    ctx.restore();
  }

  /* ================= 12. SIMPLE CIRCUIT ================= */
  L.circuit.draw = function (ctx, W, H, s) {
    const { x0, x1, y0, y1 } = this.geo(W, H), c = this.cond(s), mx = (x0 + x1) / 2, sy = (y0 + y1) / 2, t = now();
    wood(ctx, 0, 0, W, H, "#7a5434", 0, 11); vignette(ctx, W, H, 0.45);
    // wires
    const wire = pts => { ctx.lineJoin = "round"; ctx.lineCap = "round"; [[9, "rgba(0,0,0,.35)", 3], [8, "#b44d1d", 0], [3, "#ffb27a", -1.5]].forEach(([lw, col, oy]) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y + oy) : ctx.moveTo(x, y + oy)); ctx.stroke(); }); };
    wire([[x0, sy + 44], [x0, y1], [mx - 64, y1]]); wire([[mx + 64, y1], [x1, y1], [x1, sy + 28]]); wire([[x1, sy - 28], [x1, y0], [mx + 30, y0]]); wire([[mx - 30, y0], [x0, y0], [x0, sy - 44]]);
    // battery (AA)
    ctx.save(); ctx.translate(x0, sy); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
    const bg2 = ctx.createLinearGradient(-22, 0, 22, 0); bg2.addColorStop(0, "#111"); bg2.addColorStop(0.35, "#3a3a3a"); bg2.addColorStop(1, "#0a0a0a"); ctx.fillStyle = bg2; rr(ctx, -22, -44, 44, 88, 8); ctx.fill(); ctx.shadowColor = "transparent";
    const cap = ctx.createLinearGradient(-22, 0, 22, 0); cap.addColorStop(0, "#b8860b"); cap.addColorStop(0.4, "#ffd166"); cap.addColorStop(1, "#8a6508"); ctx.fillStyle = cap; rr(ctx, -22, -44, 44, 26, 8); ctx.fill(); metal(ctx, -8, -52, 16, 9, false, "#cfd6de");
    txt(ctx, "+", 0, -31, "#3a2a00", 16, "center", 800); txt(ctx, "1.5 V", 0, 8, "#ffd166", 11, "center", 800); txt(ctx, "×2", 0, 24, "#aaa", 10); ctx.restore();
    // bulb
    const on = c > 0, bright = c;
    if (on) { ctx.save(); ctx.globalCompositeOperation = "lighter"; const halo = ctx.createRadialGradient(mx, y0 - 30, 4, mx, y0 - 30, 160 * bright + 20); halo.addColorStop(0, `rgba(255,220,130,${0.75 * bright})`); halo.addColorStop(1, "rgba(255,200,100,0)"); ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(mx, y0 - 30, 160 * bright + 20, 0, TAU); ctx.fill(); ctx.restore(); }
    metal(ctx, mx - 15, y0 - 8, 30, 20, false, "#a0a8b3", 3); ctx.strokeStyle = "rgba(0,0,0,.35)"; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(mx - 15, y0 - 6 + i * 5); ctx.lineTo(mx + 15, y0 - 4 + i * 5); ctx.stroke(); }
    const bulb = ctx.createRadialGradient(mx - 9, y0 - 44, 2, mx, y0 - 32, 30); bulb.addColorStop(0, on ? `rgba(255,255,235,${0.6 + bright * 0.4})` : "rgba(255,255,255,.55)"); bulb.addColorStop(1, on ? `rgba(255,210,120,${0.25 + bright * 0.5})` : "rgba(200,220,240,.12)");
    ctx.fillStyle = bulb; ctx.beginPath(); ctx.arc(mx, y0 - 34, 26, Math.PI * 0.78, Math.PI * 2.22); ctx.lineTo(mx + 10, y0 - 8); ctx.lineTo(mx - 10, y0 - 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.save(); if (on) { ctx.shadowColor = "#ffb020"; ctx.shadowBlur = 18; } ctx.strokeStyle = on ? `rgb(255,${180 + bright * 70},${80 + bright * 120})` : "#5a4a3a"; ctx.lineWidth = on ? 2 : 1.2; ctx.beginPath(); ctx.moveTo(mx - 7, y0 - 8); ctx.lineTo(mx - 7, y0 - 30); for (let i = 0; i <= 8; i++) ctx.lineTo(mx - 7 + i * 1.75, y0 - 30 + (i % 2 ? -4 : 0)); ctx.lineTo(mx + 7, y0 - 8); ctx.stroke(); ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.ellipse(mx - 11, y0 - 44, 4, 8, -0.4, 0, TAU); ctx.fill();
    // knife switch (animated lever)
    const target = s.sw === "Closed" ? 0 : -0.75; s._lev = s._lev == null ? target : s._lev + (target - s._lev) * 0.2;
    wood(ctx, x1 - 18, sy - 40, 36, 80, "#3a2a1c", 6, 4); metal(ctx, x1 - 6, sy + 22, 12, 10, false, "#c0c7d0"); metal(ctx, x1 - 6, sy - 32, 12, 10, false, "#c0c7d0");
    ctx.save(); ctx.translate(x1, sy + 27); ctx.rotate(s._lev); metal(ctx, -3, -56, 6, 56, true, "#d7dde4", 2); ctx.fillStyle = "#e5484d"; rr(ctx, -7, -66, 14, 12, 4); ctx.fill(); ctx.restore();
    tag(ctx, x1 + 52, sy, "switch: " + s.sw.toLowerCase(), "rgba(74,82,102,.92)", "#fff", "left");
    // test gap with crocodile clips
    metal(ctx, mx - 74, y1 - 6, 14, 12, false, "#cfd6de"); metal(ctx, mx + 60, y1 - 6, 14, 12, false, "#cfd6de");
    gapMaterial(ctx, s.mat, mx, y1);
    tag(ctx, mx, y1 + 34, s.mat, "rgba(36,64,106,.92)");
    // electrons (conventional flow shown as moving charges)
    if (c > 0) {
      const path = [[x0, sy - 44], [x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, sy + 44]]; const segs = []; let tot = 0; for (let i = 1; i < path.length; i++) { const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); segs.push([path[i - 1], path[i], l]); tot += l; }
      ctx.save(); ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < 26; i++) { let d = ((i / 26) * tot + s.t * 90) % tot; for (const [a, b, l] of segs) { if (d <= l) { const x = a[0] + (b[0] - a[0]) * d / l, y = a[1] + (b[1] - a[1]) * d / l; const g = ctx.createRadialGradient(x, y, 0, x, y, 7); g.addColorStop(0, "rgba(255,235,140,.95)"); g.addColorStop(1, "rgba(255,200,80,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); break; } d -= l; } } ctx.restore();
    }
  };
  function gapMaterial(ctx, m, x, y) {
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
    if (m === "Copper wire") { ctx.strokeStyle = "#d4813f"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 60, y); for (let i = 0; i <= 40; i++) ctx.lineTo(x - 40 + i * 2, y + Math.sin(i * 0.9) * 6); ctx.lineTo(x + 60, y); ctx.stroke(); }
    else if (m === "Iron nail") { metal(ctx, x - 56, y - 4, 104, 8, false, "#8a939e", 2); ctx.fillStyle = "#6c7480"; ctx.fillRect(x - 60, y - 9, 6, 18); }
    else if (m === "Aluminium foil") { const g = ctx.createLinearGradient(x - 60, y - 10, x + 60, y + 10); for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, i % 2 ? "#f8f9fa" : "#adb5bd"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 60, y - 8); for (let i = 0; i <= 12; i++) ctx.lineTo(x - 60 + i * 10, y - 8 + rnd(i) * 4); for (let i = 12; i >= 0; i--) ctx.lineTo(x - 60 + i * 10, y + 8 - rnd(i + 3) * 4); ctx.fill(); }
    else if (m === "Pencil graphite") { ctx.fillStyle = "#f4c430"; ctx.fillRect(x - 50, y - 6, 90, 12); ctx.fillStyle = "#e8c39e"; ctx.beginPath(); ctx.moveTo(x + 40, y - 6); ctx.lineTo(x + 58, y); ctx.lineTo(x + 40, y + 6); ctx.fill(); ctx.fillStyle = "#2b2b2b"; ctx.fillRect(x - 58, y - 2, 116, 4); }
    else if (m === "Salt water") { const g = ctx.createLinearGradient(0, y - 18, 0, y + 14); g.addColorStop(0, "rgba(200,230,255,.35)"); g.addColorStop(1, "rgba(60,140,230,.75)"); ctx.fillStyle = g; rr(ctx, x - 30, y - 18, 60, 34, 6); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.5; ctx.stroke(); metal(ctx, x - 22, y - 26, 4, 34, true); metal(ctx, x + 18, y - 26, 4, 34, true); }
    else { const col = { Plastic: "#ff8bd1", Wood: "#b07a43", Rubber: "#2b2b2b", Glass: "#bfe6ff" }[m] || "#888"; if (m === "Wood") wood(ctx, x - 56, y - 7, 112, 14, col, 4, 3); else { const g = ctx.createLinearGradient(0, y - 7, 0, y + 7); g.addColorStop(0, lite(col, 0.5)); g.addColorStop(0.5, col); g.addColorStop(1, dark(col, 0.4)); ctx.fillStyle = g; rr(ctx, x - 56, y - 7, 112, 14, 7); ctx.fill(); if (m === "Glass") { ctx.globalAlpha = 0.6; ctx.fillStyle = "#fff"; ctx.fillRect(x - 50, y - 5, 100, 2); } } }
    ctx.restore();
  }

  /* ================= 13. MOON PHASES ================= */
  L.moon.draw = function (ctx, W, H, s) {
    const { ox, oy, R } = this.geo(W, H), ang = s.a / 29.5 * TAU, mx = ox - Math.cos(ang) * R, my = oy - Math.sin(ang) * R, t = now();
    ctx.fillStyle = "#02040a"; ctx.fillRect(0, 0, W, H); starfield(ctx, W, H, 140, 13);
    // sun glow from left
    const sg = ctx.createRadialGradient(-60, H / 2, 10, -60, H / 2, W * 0.6); sg.addColorStop(0, "rgba(255,220,140,.55)"); sg.addColorStop(1, "rgba(255,200,100,0)"); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 7; i++) { const y = H * (i + 0.5) / 7; const g = ctx.createLinearGradient(0, y, 70, y); g.addColorStop(0, "rgba(255,210,120,.0)"); g.addColorStop(1, "rgba(255,210,120,.5)"); arrow(ctx, 6, y, 48 + Math.sin(t * 2 + i) * 4, y, "rgba(255,209,102,.6)", 2); }
    txt(ctx, "Sunlight", 10, 14, "#ffd166", 11, "left", 700);
    ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(ox, oy, R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    // earth
    const er = 30; glow(ctx, "rgba(90,160,255,.6)", 24, () => sphere(ctx, ox, oy, er, "#2a6fd6", -0.6, -0.2, 0.35));
    ctx.save(); ctx.beginPath(); ctx.arc(ox, oy, er, 0, TAU); ctx.clip(); const rot = t * 0.15; for (let i = 0; i < 7; i++) { ctx.fillStyle = "rgba(76,175,80,.85)"; ctx.beginPath(); ctx.ellipse(ox + Math.cos(rot + i * 0.9) * er * 0.6, oy + Math.sin(i * 1.9) * er * 0.5, er * 0.28, er * 0.17, i, 0, TAU); ctx.fill(); } ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(ox - er, oy - er, er * 2, er * 0.25);
    const night = ctx.createLinearGradient(ox - er, oy, ox + er, oy); night.addColorStop(0.45, "rgba(0,0,10,0)"); night.addColorStop(0.6, "rgba(0,0,10,.75)"); ctx.fillStyle = night; ctx.fillRect(ox - er, oy - er, 2 * er, 2 * er); ctx.restore();
    // moon in orbit
    moonDisc(ctx, mx, my, 15, null);
    tag(ctx, ox, oy + er + 18, "Earth", "rgba(31,95,153,.92)"); tag(ctx, mx, my - 30, "Moon", "rgba(74,82,102,.92)");
    // telescope view
    const vx = W > 560 ? W * 0.82 : W * 0.5, vy = W > 560 ? H * 0.45 : H * 0.84, r = W > 560 ? Math.min(W * 0.13, H * 0.22) : Math.min(H * 0.11, 50);
    ctx.save(); ctx.beginPath(); ctx.arc(vx, vy, r * 1.45, 0, TAU); ctx.fillStyle = "#050913"; ctx.fill(); ctx.clip(); starfield(ctx, W, H, 200, 21); ctx.restore();
    ctx.strokeStyle = "rgba(160,190,230,.35)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(vx, vy, r * 1.45, 0, TAU); ctx.stroke();
    txt(ctx, "Seen from Earth", vx, vy - r * 1.45 - 14, "#9fb3d1", 12, "center", 700);
    moonDisc(ctx, vx, vy, r, ang);
    tag(ctx, vx, vy + r * 1.45 + 18, this.name(s.a), "rgba(36,64,106,.95)");
  };
  function moonDisc(ctx, x, y, r, ang) {
    // base grey moon with craters
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    const mg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); mg.addColorStop(0, "#f1efe7"); mg.addColorStop(1, "#a9a69c"); ctx.fillStyle = mg; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    for (let i = 0; i < 14; i++) { const cx = x + (rnd(i * 3) - 0.5) * r * 1.6, cy = y + (rnd(i * 5) - 0.5) * r * 1.6, cr = r * (0.05 + rnd(i * 7) * 0.12); ctx.fillStyle = "rgba(90,88,80,.25)"; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, TAU); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.arc(cx - cr * 0.25, cy - cr * 0.25, cr * 0.55, 0, TAU); ctx.fill(); }
    ctx.fillStyle = "rgba(110,110,100,.18)"; ctx.beginPath(); ctx.ellipse(x - r * 0.2, y - r * 0.15, r * 0.35, r * 0.25, 0.4, 0, TAU); ctx.fill();
    if (ang == null) { const sh = ctx.createLinearGradient(x - r, y, x + r, y); sh.addColorStop(0.45, "rgba(0,0,8,0)"); sh.addColorStop(0.55, "rgba(0,0,8,.88)"); ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    else {
      const k = (1 - Math.cos(ang)) / 2, waxing = Math.sin(ang) >= 0;
      ctx.fillStyle = "rgba(2,4,10,.92)"; ctx.beginPath(); if (waxing) ctx.arc(x, y, r + 1, Math.PI / 2, Math.PI * 1.5); else ctx.arc(x, y, r + 1, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
      const ex = Math.abs(Math.cos(ang)) * r;
      if (k < 0.5) { ctx.fillStyle = "rgba(2,4,10,.92)"; ctx.beginPath(); ctx.ellipse(x, y, ex, r + 1, 0, 0, TAU); ctx.fill(); }
      else { ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, ex, r, 0, 0, TAU); ctx.clip(); const mg2 = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); mg2.addColorStop(0, "#f1efe7"); mg2.addColorStop(1, "#a9a69c"); ctx.fillStyle = mg2; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); for (let i = 0; i < 14; i++) { const cx = x + (rnd(i * 3) - 0.5) * r * 1.6, cy = y + (rnd(i * 5) - 0.5) * r * 1.6, cr = r * (0.05 + rnd(i * 7) * 0.12); ctx.fillStyle = "rgba(90,88,80,.25)"; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, TAU); ctx.fill(); } ctx.restore(); }
      ctx.fillStyle = "rgba(120,140,170,.06)"; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    ctx.restore();
    ctx.save(); ctx.shadowColor = "rgba(230,230,210,.35)"; ctx.shadowBlur = r * 0.6; ctx.strokeStyle = "rgba(255,255,255,.05)"; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore();
  }

  /* ================= 14. WATER CYCLE ================= */
  L.water.draw = function (ctx, W, H, s) {
    const sea = H * 0.72, t = now(), day = s.sun / 100;
    const sky = ctx.createLinearGradient(0, 0, 0, sea); sky.addColorStop(0, mix("#0e2a5c", day * 0.75, 120)); sky.addColorStop(1, mix("#4b79b8", day * 0.6, 255)); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, sea);
    // sun
    const sx = 70, sy = 64, sr = 24 + s.sun * 0.12;
    ctx.save(); ctx.globalCompositeOperation = "lighter"; const halo = ctx.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 4); halo.addColorStop(0, `rgba(255,220,120,${0.3 + day * 0.4})`); halo.addColorStop(1, "rgba(255,200,100,0)"); ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(sx, sy, sr * 4, 0, TAU); ctx.fill();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * 0.2; ctx.strokeStyle = `rgba(255,220,120,${0.25 * day})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * sr * 1.3, sy + Math.sin(a) * sr * 1.3); ctx.lineTo(sx + Math.cos(a) * sr * 2.1, sy + Math.sin(a) * sr * 2.1); ctx.stroke(); } ctx.restore();
    sphere(ctx, sx, sy, sr, "#ffc93c", -0.3, -0.3, 0.6);
    // far mountains + snow
    ctx.fillStyle = mix("#5b6f8f", day * 0.3, 255); ctx.beginPath(); ctx.moveTo(W * 0.4, sea); ctx.lineTo(W * 0.55, H * 0.42); ctx.lineTo(W * 0.66, H * 0.5); ctx.lineTo(W * 0.85, H * 0.3); ctx.lineTo(W, H * 0.45); ctx.lineTo(W, sea); ctx.fill();
    ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.moveTo(W * 0.81, H * 0.35); ctx.lineTo(W * 0.85, H * 0.3); ctx.lineTo(W * 0.89, H * 0.36); ctx.lineTo(W * 0.86, H * 0.345); ctx.lineTo(W * 0.84, H * 0.36); ctx.fill();
    // near hills
    const hg = ctx.createLinearGradient(0, H * 0.5, 0, H); hg.addColorStop(0, "#4c9a4f"); hg.addColorStop(1, "#245a2e"); ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(W * 0.45, H); ctx.lineTo(W * 0.5, sea); ctx.bezierCurveTo(W * 0.6, H * 0.5, W * 0.7, H * 0.52, W * 0.78, H * 0.44); ctx.bezierCurveTo(W * 0.88, H * 0.5, W * 0.95, H * 0.55, W, H * 0.58); ctx.lineTo(W, H); ctx.fill();
    for (let i = 0; i < 9; i++) { const x = W * (0.56 + i * 0.045), y = H * (0.6 - Math.sin(i * 0.7) * 0.06) + 10; ctx.fillStyle = "#5a3a1a"; ctx.fillRect(x - 1.5, y, 3, 8); ctx.fillStyle = i % 2 ? "#1f6b2a" : "#2f8a3a"; ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x + 7, y + 2); ctx.lineTo(x - 7, y + 2); ctx.fill(); }
    // river
    ctx.strokeStyle = "#4aa3e8"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(W * 0.8, H * 0.5); ctx.quadraticCurveTo(W * 0.65, H * 0.7, W * 0.5, sea + 4); ctx.stroke();
    ctx.setLineDash([6, 10]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
    // sea
    const sg2 = ctx.createLinearGradient(0, sea, 0, H); sg2.addColorStop(0, mix("#2f74c0", day * 0.2, 255)); sg2.addColorStop(1, "#0b2f63"); ctx.fillStyle = sg2; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W * 0.52; x += 8) ctx.lineTo(x, sea + Math.sin(x * 0.05 + t * 2) * 2); ctx.lineTo(W * 0.52, H); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1.5; for (let r = 0; r < 4; r++) { ctx.beginPath(); for (let x = 0; x <= W * 0.5; x += 8) ctx.lineTo(x, sea + 10 + r * 12 + Math.sin(x * 0.06 + t * 2 + r) * 2); ctx.stroke(); }
    // vapour wisps
    ctx.save(); ctx.lineCap = "round"; s.vap.forEach((v, i) => { ctx.strokeStyle = `rgba(230,245,255,${clamp((sea - v.y) / (sea - H * 0.2), 0, 1) * 0.5 + 0.15})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.quadraticCurveTo(v.x + 4 * Math.sin(v.y * 0.1 + i), v.y - 5, v.x, v.y - 10); ctx.stroke(); }); ctx.restore();
    // cloud
    const cg = Math.min(1, s.cloud / 60), cx = W * s.cx, cy = H * 0.18;
    if (s.cloud > 2) { const puffs = [[-50, 8, 26], [-22, -8, 34], [14, -14, 38], [46, 0, 30], [70, 10, 22], [0, 12, 32]]; puffs.forEach(([dx, dy, r]) => { const rr2 = r * (0.6 + cg * 0.5); const g = ctx.createRadialGradient(cx + dx - rr2 * 0.3, cy + dy - rr2 * 0.4, rr2 * 0.2, cx + dx, cy + dy, rr2); g.addColorStop(0, mix("#ffffff", cg * 0.35, 0)); g.addColorStop(1, mix("#c9d3e0", cg * 0.55, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx + dx, cy + dy, rr2, 0, TAU); ctx.fill(); }); }
    // rain streaks
    ctx.strokeStyle = "rgba(170,210,255,.85)"; ctx.lineWidth = 1.6; s.drops.forEach(d => { ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 3, d.y + 11); ctx.stroke(); });
    tag(ctx, W * 0.22, sea - 22, "Evaporation", "rgba(31,95,153,.92)"); if (s.cloud > 2) tag(ctx, cx, cy - 52, "Condensation", "rgba(74,82,102,.92)"); if (s.rain) tag(ctx, cx + 100, H * 0.42, "Precipitation", "rgba(36,64,106,.92)"); tag(ctx, W * 0.62, H * 0.8, "Collection", "rgba(29,107,51,.92)");
  };

  /* ================= 15. SEE-SAW (damped rotation) ================= */
  L.seesaw.step = function (s, dt) { const [l, r] = this.torque(s), target = clamp((r - l) * 0.03, -0.32, 0.32); s.av = (s.av || 0) + ((target - s.ang) * 28 - (s.av || 0) * 5.5) * dt; s.ang += s.av * dt; if (Math.abs(s.ang) > 0.32) { s.ang = Math.sign(s.ang) * 0.32; s.av *= -0.3; } };
  L.seesaw.draw = function (ctx, W, H, s) {
    const { cx, cy, u } = this.geo(W, H), [l, r] = this.torque(s);
    bg(ctx, W, H, "#79b4f0", "#d9ecff");
    for (let i = 0; i < 3; i++) { const x = ((i * 300 + now() * 8) % (W + 200)) - 100, y = 40 + i * 30; ctx.fillStyle = "rgba(255,255,255,.85)"; [[0, 0, 18], [18, -6, 22], [38, 0, 16]].forEach(([dx, dy, rr2]) => { ctx.beginPath(); ctx.arc(x + dx, y + dy, rr2, 0, TAU); ctx.fill(); }); }
    const gy = H - 30; const gg = ctx.createLinearGradient(0, gy - 20, 0, H); gg.addColorStop(0, "#5db34f"); gg.addColorStop(1, "#2e7a33"); ctx.fillStyle = gg; ctx.fillRect(0, gy - 4, W, H - gy + 4);
    for (let i = 0; i < W; i += 6) { ctx.strokeStyle = "rgba(30,90,30,.5)"; ctx.beginPath(); ctx.moveTo(i, gy); ctx.lineTo(i + 2, gy - 6 - rnd(i) * 5); ctx.stroke(); }
    // fulcrum A-frame
    shadowE(ctx, cx, gy + 2, 70, 8, 0.4);
    ctx.fillStyle = "#c0392b"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 44, gy); ctx.lineTo(cx - 30, gy); ctx.lineTo(cx, cy + 22); ctx.lineTo(cx + 30, gy); ctx.lineTo(cx + 44, gy); ctx.closePath(); ctx.fill();
    const fg = ctx.createLinearGradient(cx - 44, 0, cx + 44, 0); fg.addColorStop(0, "rgba(0,0,0,.25)"); fg.addColorStop(0.5, "rgba(255,255,255,.2)"); fg.addColorStop(1, "rgba(0,0,0,.3)"); ctx.fillStyle = fg; ctx.fill();
    // plank shadow on grass
    shadowE(ctx, cx, gy + 4, 4.4 * u, 8, 0.25);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.ang);
    wood(ctx, -4.5 * u, -12, 9 * u, 18, "#a06a3a", 6, 2);
    for (let i = -4; i <= 4; i++) { if (!i) continue; ctx.fillStyle = "rgba(255,255,255,.65)"; ctx.fillRect(i * u - 1, 6, 2, 6); ctx.font = "700 11px Open Sans"; ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.fillText(String(Math.abs(i)), i * u, 24); }
    ctx.fillStyle = "#e5e7eb"; [-4.3, 4.3].forEach(h => { metal(ctx, h * u - 3, -30, 6, 20, true, "#9aa3ad"); metal(ctx, h * u - 10, -32, 20, 5, false, "#9aa3ad"); });
    sphere(ctx, 0, -3, 7, "#566070", -0.4, -0.5, 0.6);
    const kb = (x, m) => { const sz = 14 + m * 4, y = -12 - sz; ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3; const col = { 1: "#3b82f6", 2: "#10b981", 3: "#f59e0b", 5: "#ef4444" }[m] || "#64748b"; ctx.strokeStyle = dark(col, 0.3); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y - sz * 0.55, sz * 0.38, Math.PI, 0); ctx.stroke(); ctx.restore(); sphere(ctx, x, y + sz * 0.15, sz * 0.62, { 1: "#3b82f6", 2: "#10b981", 3: "#f59e0b", 5: "#ef4444" }[m] || "#64748b", -0.4, -0.5, 0.6); ctx.fillStyle = "#fff"; ctx.font = "800 11px Montserrat"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(m + "kg", x, y + sz * 0.2); };
    for (const k in s.L) kb(-k * u, s.L[k]); for (const k in s.R) kb(k * u, s.R[k]);
    ctx.restore();
    const bal = Math.abs(l - r) < 1e-9; tag(ctx, cx, 28, bal ? "Balanced!" : l > r ? "Left side goes down" : "Right side goes down", bal ? "rgba(29,107,51,.95)" : "rgba(138,44,58,.95)");
    tag(ctx, cx - 2.6 * u, H - 14, `left moment ${l}`, "rgba(36,64,106,.9)"); tag(ctx, cx + 2.6 * u, H - 14, `right moment ${r}`, "rgba(36,64,106,.9)");
  };

  /* ================= 16. SOLAR SYSTEM ================= */
  L.solar.draw = function (ctx, W, H, s) {
    const t = now(), cx = W / 2, cy = H / 2;
    ctx.fillStyle = "#01030a"; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.5); const mw = ctx.createLinearGradient(0, -H * 0.2, 0, H * 0.2); mw.addColorStop(0, "rgba(120,100,180,0)"); mw.addColorStop(0.5, "rgba(140,120,200,.08)"); mw.addColorStop(1, "rgba(120,100,180,0)"); ctx.fillStyle = mw; ctx.fillRect(-W, -H * 0.2, W * 2, H * 0.4); ctx.restore();
    starfield(ctx, W, H, 180, 31);
    // asteroid belt
    const rA = this.pos(3, W, H, 0)[2], rJ = this.pos(4, W, H, 0)[2], rb = (rA + rJ) / 2; for (let i = 0; i < 160; i++) { const a = rnd(i) * TAU + s.days / 1700, rr2 = rb + (rnd(i * 4) - 0.5) * (rJ - rA) * 0.45; ctx.fillStyle = `rgba(180,170,150,${0.25 + rnd(i * 2) * 0.4})`; ctx.fillRect(cx + Math.cos(a) * rr2, cy - Math.sin(a) * rr2 * 0.9, 1.4, 1.4); }
    // orbits + trails
    D.PLN.forEach((p, i) => { const [x, y, R] = this.pos(i, W, H, s.days); if (s.orb === "Show") { ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.9, 0, 0, TAU); ctx.strokeStyle = i === s.sel ? "rgba(255,144,77,.55)" : "rgba(255,255,255,.1)"; ctx.lineWidth = 1; ctx.stroke(); }
      const a = s.days / p[1] * TAU; ctx.save(); ctx.lineCap = "round"; for (let k = 0; k < 14; k++) { const a0 = a - k * 0.045, a1 = a - (k + 1) * 0.045; ctx.strokeStyle = rgba(p[3], 0.35 * (1 - k / 14)); ctx.lineWidth = p[4] * 0.9 * (1 - k / 14); ctx.beginPath(); ctx.moveTo(cx + Math.cos(a0) * R, cy - Math.sin(a0) * R * 0.9); ctx.lineTo(cx + Math.cos(a1) * R, cy - Math.sin(a1) * R * 0.9); ctx.stroke(); } ctx.restore(); });
    // sun
    ctx.save(); ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < 3; i++) { const rr2 = 46 + i * 22 + Math.sin(t * 1.5 + i) * 3; const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, rr2); g.addColorStop(0, "rgba(255,200,80,.35)"); g.addColorStop(1, "rgba(255,120,30,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rr2, 0, TAU); ctx.fill(); } ctx.restore();
    const sg = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 20); sg.addColorStop(0, "#fffbe0"); sg.addColorStop(0.5, "#ffd166"); sg.addColorStop(1, "#ff8a2a"); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, 19, 0, TAU); ctx.fill();
    // planets lit by the sun
    D.PLN.forEach((p, i) => {
      const [x, y] = this.pos(i, W, H, s.days), r = p[4] * 1.15, dx = cx - x, dy = cy - y, n = Math.hypot(dx, dy) || 1, lx = dx / n, ly = dy / n;
      if (p[0] === "Saturn") { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35); ctx.strokeStyle = "rgba(230,210,160,.55)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, r * 2.1, r * 0.6, 0, Math.PI, TAU); ctx.stroke(); ctx.restore(); }
      sphere(ctx, x, y, r, p[3], lx * 0.7, ly * 0.7, 0.5);
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip(); const sh = ctx.createLinearGradient(x + lx * r, y + ly * r, x - lx * r, y - ly * r); sh.addColorStop(0.45, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,.8)"); ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      if (p[0] === "Jupiter") { ctx.fillStyle = "rgba(160,100,60,.35)"; for (let b = -2; b <= 2; b++) ctx.fillRect(x - r, y + b * r * 0.32, 2 * r, r * 0.13); }
      if (p[0] === "Earth") { ctx.fillStyle = "rgba(76,175,80,.7)"; ctx.beginPath(); ctx.arc(x - r * 0.2, y, r * 0.4, 0, TAU); ctx.fill(); }
      ctx.restore();
      if (p[0] === "Saturn") { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35); ctx.strokeStyle = "rgba(240,220,170,.75)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, r * 2.1, r * 0.6, 0, 0, Math.PI); ctx.stroke(); ctx.restore(); }
      if (i === s.sel) { ctx.strokeStyle = "rgba(255,144,77,.9)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r + 6 + Math.sin(t * 4) * 1.5, 0, TAU); ctx.stroke(); tag(ctx, x, y - r - 20, p[0], "rgba(176,82,29,.95)"); }
    });
    tag(ctx, 16, 24, "Earth years: " + fx(s.days / 365, 1), "rgba(0,0,0,.55)", "#fff", "left");
  };

  /* ================= 17. CELL EXPLORER (microscope view) ================= */
  L.cell.draw = function (ctx, W, H, s) {
    const R = Math.min(W, H) * 0.38, cx = W / 2, cy = H / 2, pl = s.type === "Plant", t = now();
    ctx.fillStyle = "#020306"; ctx.fillRect(0, 0, W, H);
    const field = Math.min(W, H) * 0.49; const lg = ctx.createRadialGradient(cx, cy, field * 0.2, cx, cy, field); lg.addColorStop(0, pl ? "#eaf5e1" : "#f6efe6"); lg.addColorStop(1, pl ? "#b9d3a8" : "#d9c9b5"); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(cx, cy, field, 0, TAU); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, field, 0, TAU); ctx.clip();
    // cell body
    const memPath = (rad, wob) => { ctx.beginPath(); if (pl) { const w = rad * (0.78 + 0.22 * Math.abs(Math.cos(s.rot))); rr(ctx, cx - w, cy - rad, 2 * w, 2 * rad, rad * 0.25); } else { for (let i = 0; i <= 90; i++) { const a = i / 90 * TAU, rr2 = rad * (1 + wob * Math.sin(a * 5 + t * 0.8) * 0.02 + wob * Math.sin(a * 3 - t * 0.5) * 0.015); ctx.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); } ctx.closePath(); } };
    if (pl) { memPath(R + 12, 0); ctx.fillStyle = "#8fbf5a"; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = s.sel === "wall" ? "#ffffff" : "#5c8a2e"; ctx.stroke(); }
    memPath(R, 1); const cyto = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); cyto.addColorStop(0, pl ? "rgba(214,240,190,.95)" : "rgba(255,226,214,.95)"); cyto.addColorStop(1, pl ? "rgba(160,205,130,.95)" : "rgba(232,170,160,.95)"); ctx.fillStyle = cyto; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = s.sel === "membrane" ? "#ffffff" : (pl ? "#6fa04a" : "#c06c84"); ctx.stroke(); ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.stroke();
    ctx.save(); memPath(R - 3, 1); ctx.clip(); for (let i = 0; i < 160; i++) { const a = rnd(i) * TAU, rr2 = Math.sqrt(rnd(i * 3)) * R, x = cx + Math.cos(a + t * 0.02) * rr2, y = cy + Math.sin(a + t * 0.02) * rr2; ctx.fillStyle = "rgba(120,80,90,.18)"; ctx.fillRect(x, y, 1.6, 1.6); } ctx.restore();
    this.proj(s, W, H).forEach(o => {
      const sel = s.sel === o.k; ctx.save(); if (sel) { ctx.shadowColor = "#fff"; ctx.shadowBlur = 18; }
      if (o.k === "nucleus") { const g = ctx.createRadialGradient(o.x - o.r * 0.3, o.y - o.r * 0.3, o.r * 0.1, o.x, o.y, o.r); g.addColorStop(0, "#c4b5fd"); g.addColorStop(1, "#6d28d9"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, TAU); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.arc(o.x, o.y, o.r - 3, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#3b0764"; ctx.beginPath(); ctx.arc(o.x + o.r * 0.2, o.y + o.r * 0.1, o.r * 0.32, 0, TAU); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.lineWidth = 1; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(o.x - o.r * 0.6 + k * 6, o.y - o.r * 0.4); ctx.quadraticCurveTo(o.x, o.y - o.r * 0.1 + k * 3, o.x + o.r * 0.4, o.y + o.r * 0.5 - k * 4); ctx.stroke(); } }
      else if (o.k === "mito") { ctx.translate(o.x, o.y); ctx.rotate(0.4); const g = ctx.createLinearGradient(0, -o.r, 0, o.r); g.addColorStop(0, "#ffb27a"); g.addColorStop(1, "#c2410c"); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, o.r * 1.7, o.r, 0, 0, TAU); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = "rgba(255,240,220,.85)"; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = -6; k <= 6; k++) ctx.lineTo(k * o.r * 0.24, (k % 2 ? -1 : 1) * o.r * 0.55); ctx.stroke(); }
      else if (o.k === "chloro") { ctx.translate(o.x, o.y); ctx.rotate(-0.3); const g = ctx.createLinearGradient(0, -o.r, 0, o.r); g.addColorStop(0, "#86efac"); g.addColorStop(1, "#15803d"); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, o.r * 1.7, o.r, 0, 0, TAU); ctx.fill(); ctx.shadowColor = "transparent"; for (let k = -2; k <= 2; k++) { for (let j = 0; j < 3; j++) { ctx.fillStyle = "#166534"; rr(ctx, k * o.r * 0.55 - o.r * 0.18, -o.r * 0.45 + j * o.r * 0.28, o.r * 0.36, o.r * 0.18, 2); ctx.fill(); } } }
      else if (o.k === "vacuole") { const g = ctx.createRadialGradient(o.x - o.r * 0.3, o.y - o.r * 0.3, o.r * 0.1, o.x, o.y, o.r); g.addColorStop(0, "rgba(220,245,255,.65)"); g.addColorStop(1, "rgba(120,200,240,.45)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, TAU); ctx.fill(); ctx.strokeStyle = "rgba(60,150,200,.8)"; ctx.lineWidth = 2; ctx.stroke(); }
      else if (o.k === "er") { ctx.strokeStyle = "#db2777"; ctx.lineWidth = 3; for (let k = 0; k < 4; k++) { ctx.beginPath(); for (let x = -o.r * 1.6; x <= o.r * 1.6; x += 3) ctx.lineTo(o.x + x, o.y + k * o.r * 0.35 + Math.sin(x * 0.25 + k) * 3); ctx.stroke(); } ctx.fillStyle = "#4b5563"; for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(o.x - o.r * 1.5 + k * o.r * 0.22, o.y - 4 + (k % 2) * o.r * 0.7, 1.6, 0, TAU); ctx.fill(); } }
      else if (o.k === "golgi") { for (let k = 0; k < 5; k++) { ctx.strokeStyle = k % 2 ? "#f59e0b" : "#d97706"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(o.x, o.y + o.r * 1.6, o.r * (1.4 - k * 0.16) + 6, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); } ctx.fillStyle = "#fbbf24"; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(o.x + o.r * 1.4 + k * 5, o.y - o.r * 0.3 + k * 6, 2.5, 0, TAU); ctx.fill(); } }
      else if (o.k === "ribo") { for (let i = 0; i < 8; i++) sphere(ctx, o.x + Math.cos(i * 1.3) * o.r * 3, o.y + Math.sin(i * 2.1) * o.r * 3, 2.6, "#475569", -0.4, -0.4, 0.4); }
      ctx.restore();
      if (sel) { ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(o.x, o.y, o.r * (o.k === "ribo" ? 4 : 1.9) + 4, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    });
    ctx.restore();
    const ring = ctx.createRadialGradient(cx, cy, field * 0.85, cx, cy, field); ring.addColorStop(0, "rgba(0,0,0,0)"); ring.addColorStop(1, "rgba(0,0,0,.7)"); ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(cx, cy, field, 0, TAU); ctx.fill();
    ctx.strokeStyle = "#1f2937"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, field, 0, TAU); ctx.stroke();
    tag(ctx, W / 2, 22, D.PARTS[s.sel][0], "rgba(36,64,106,.95)"); txt(ctx, "×400 · " + s.type.toLowerCase() + " cell", W - 14, H - 14, "#8892a6", 11, "right");
  };

  /* ================= 18. PHOTOSYNTHESIS LEAF ================= */
  L.leaf.draw = function (ctx, W, H, s) {
    const r = this.rate(s), lx = W * 0.5, ly = H * 0.55, t = now(), lw = W * 0.24, lhgt = H * 0.3;
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, mix("#10213f", s.light / 100 * 0.7, 140)); sky.addColorStop(1, mix("#1d3b2a", s.light / 100 * 0.4, 180)); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    if (s.light) { ctx.save(); ctx.globalCompositeOperation = "lighter"; const halo = ctx.createRadialGradient(40, 40, 4, 40, 40, 120 + s.light * 2); halo.addColorStop(0, `rgba(255,220,120,${s.light / 140})`); halo.addColorStop(1, "rgba(255,200,100,0)"); ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 5; i++) { const a = 0.55 + i * 0.09; ctx.fillStyle = `rgba(255,230,150,${s.light / 1400})`; ctx.beginPath(); ctx.moveTo(40, 40); ctx.lineTo(40 + Math.cos(a - 0.03) * W, 40 + Math.sin(a - 0.03) * W); ctx.lineTo(40 + Math.cos(a + 0.03) * W, 40 + Math.sin(a + 0.03) * W); ctx.fill(); } ctx.restore(); }
    sphere(ctx, 40, 40, 22, s.light ? "#ffc93c" : "#555", -0.3, -0.3, 0.5);
    // stem
    ctx.strokeStyle = "#3f6b2a"; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(lx - lw * 0.95, ly + 6); ctx.quadraticCurveTo(lx - lw * 1.2, ly + 60, lx - lw * 1.1, H + 10); ctx.stroke();
    // leaf blade
    const leafPath = () => { ctx.beginPath(); ctx.moveTo(lx - lw, ly); ctx.bezierCurveTo(lx - lw * 0.5, ly - lhgt * 1.05, lx + lw * 0.6, ly - lhgt * 0.9, lx + lw * 1.05, ly - lhgt * 0.12); ctx.bezierCurveTo(lx + lw * 0.6, ly + lhgt * 0.6, lx - lw * 0.4, ly + lhgt * 0.55, lx - lw, ly); ctx.closePath(); };
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; leafPath(); const lg = ctx.createLinearGradient(lx - lw, ly - lhgt, lx + lw, ly + lhgt * 0.5); lg.addColorStop(0, mix("#4ade80", 0.1 + r * 0.25, 255)); lg.addColorStop(0.5, mix("#16a34a", (1 - r) * 0.2, 0)); lg.addColorStop(1, "#14532d"); ctx.fillStyle = lg; ctx.fill(); ctx.restore();
    ctx.save(); leafPath(); ctx.clip();
    const midA = [lx - lw, ly], midB = [lx + lw * 1.02, ly - lhgt * 0.12]; ctx.strokeStyle = "rgba(230,255,210,.65)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...midA); ctx.quadraticCurveTo(lx, ly - lhgt * 0.25, ...midB); ctx.stroke();
    ctx.lineWidth = 1.4; for (let i = 1; i < 8; i++) { const u = i / 8, x = midA[0] + (midB[0] - midA[0]) * u, y = midA[1] + (midB[1] - midA[1]) * u - Math.sin(u * Math.PI) * lhgt * 0.13; [[-1], [1]].forEach(([d]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lw * 0.12, y + d * lhgt * 0.2, x + lw * 0.22, y + d * lhgt * 0.42); ctx.stroke(); }); }
    // water moving up the vein
    if (s.water) { ctx.save(); ctx.setLineDash([3, 14]); ctx.lineDashOffset = -t * 30 * (s.water / 100); ctx.strokeStyle = "rgba(140,200,255,.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...midA); ctx.quadraticCurveTo(lx, ly - lhgt * 0.25, ...midB); ctx.stroke(); ctx.restore(); }
    // glucose sparkles
    ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < Math.round(r * 24); i++) { const x = lx - lw * 0.7 + rnd(i) * lw * 1.5, y = ly - lhgt * 0.5 + rnd(i * 3) * lhgt * 0.7, a = 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i)); ctx.fillStyle = `rgba(255,250,180,${a * 0.8})`; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = "rgba(20,83,45,.9)"; ctx.lineWidth = 1.5; leafPath(); ctx.stroke();
    // stomata
    for (let i = 0; i < 6; i++) { const x = lx - lw * 0.4 + i * lw * 0.22, y = ly + lhgt * 0.22 - Math.sin(i) * 6; ctx.fillStyle = "#14532d"; ctx.beginPath(); ctx.ellipse(x, y, 5, 3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = "#052e16"; ctx.beginPath(); ctx.ellipse(x, y, 3.5 * (0.4 + r * 0.6), 1, 0, 0, TAU); ctx.fill(); }
    // gases
    s.o2.forEach(b => { const g = ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, 8); g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(0.4, "rgba(120,240,180,.35)"); g.addColorStop(1, "rgba(62,207,142,.15)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, TAU); ctx.fill(); ctx.strokeStyle = "rgba(180,255,220,.8)"; ctx.lineWidth = 1; ctx.stroke(); txt(ctx, "O₂", b.x, b.y + 1, "#eafff4", 7, "center", 800); });
    s.co.forEach(b => { sphere(ctx, b.x - 7, b.y, 3.6, "#cbd5e1", -0.4, -0.5, 0.5); sphere(ctx, b.x, b.y, 4.4, "#475569", -0.4, -0.5, 0.5); sphere(ctx, b.x + 7, b.y, 3.6, "#cbd5e1", -0.4, -0.5, 0.5); });
    tag(ctx, W - 70, H * 0.22, "CO₂ in", "rgba(74,82,102,.92)"); tag(ctx, lx + 90, 24, "O₂ out", "rgba(29,107,51,.92)"); tag(ctx, lx - lw * 1.1, H - 20, "water up", "rgba(31,95,153,.92)");
    tag(ctx, lx, ly + lhgt * 0.75, `rate ${Math.round(r * 100)}%`, "rgba(20,83,45,.92)");
  };

  /* ================= 19. OCEAN EXPLORER ================= */
  L.ocean.draw = function (ctx, W, H, s) {
    const z = this.zone(s.d), light = Math.max(0, 1 - s.d / 1000), t = now();
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, lite(z[3], light * 0.35)); g.addColorStop(1, dark(z[3], 0.45)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (light > 0) { ctx.save(); ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < 7; i++) { const x = W * (0.05 + i * 0.15) + Math.sin(t * 0.4 + i) * 20, w = 30 + rnd(i) * 50; const rg = ctx.createLinearGradient(0, 0, 0, H); rg.addColorStop(0, `rgba(200,240,255,${0.12 * light})`); rg.addColorStop(1, "rgba(200,240,255,0)"); ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + w, 0); ctx.lineTo(x + w * 0.4 - 60, H); ctx.lineTo(x - 100, H); ctx.fill(); }
      if (s.d < 60) { ctx.strokeStyle = `rgba(255,255,255,${0.15 * light})`; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, 6 + Math.sin(x * 0.05 + t * 2) * 3); ctx.stroke(); } ctx.restore(); }
    // marine snow / plankton
    for (let i = 0; i < 70; i++) { const x = (rnd(i) * W + t * 6 * (0.5 + rnd(i * 2))) % W, y = (rnd(i * 3) * H + t * 10 * (0.3 + rnd(i * 5))) % H; ctx.fillStyle = s.d > 1000 && i % 7 === 0 ? `rgba(120,255,230,${0.4 + 0.4 * Math.sin(t * 3 + i)})` : "rgba(255,255,255,.28)"; ctx.beginPath(); ctx.arc(x, y, s.d > 1000 && i % 7 === 0 ? 1.8 : 1.1, 0, TAU); ctx.fill(); }
    // seabed
    if (s.d < 200 || s.d > 3800) { const sb = H - 28; const sg = ctx.createLinearGradient(0, sb - 20, 0, H); sg.addColorStop(0, s.d < 200 ? "#c2a46a" : "#2a2f38"); sg.addColorStop(1, s.d < 200 ? "#8a6e3e" : "#14171d"); ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, sb + Math.sin(x * 0.02) * 8 + rnd(x) * 6); ctx.lineTo(W, H); ctx.fill();
      if (s.d < 200) { for (let i = 0; i < 6; i++) { const x = W * (0.1 + i * 0.16), col = ["#ff6b6b", "#f59e0b", "#ec4899", "#a78bfa"][i % 4]; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = "round"; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x, sb + 4); ctx.quadraticCurveTo(x + (k - 2) * 8, sb - 20, x + (k - 2) * 12 + Math.sin(t + k) * 3, sb - 34 - rnd(i + k) * 14); ctx.stroke(); } } for (let i = 0; i < 4; i++) { const x = W * (0.2 + i * 0.22); ctx.strokeStyle = "#2f9e44"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, sb + 6); for (let k = 0; k < 8; k++) ctx.lineTo(x + Math.sin(t * 1.5 + k * 0.6 + i) * 6, sb - k * 9); ctx.stroke(); } } }
    s.food.forEach(f => { const x = f.x * W, y = f.y * H; ctx.save(); ctx.shadowColor = "#f2cc8f"; ctx.shadowBlur = 6; ctx.fillStyle = "#e9c46a"; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill(); ctx.restore(); });
    s.fish.forEach(f => drawCreature(ctx, f, W, H, s.d, t));
    // bubbles from diver
    for (let i = 0; i < 8; i++) { const y = H - ((t * 40 + i * 50) % H), x = W * 0.08 + Math.sin(t * 2 + i) * 6; ctx.strokeStyle = "rgba(220,245,255,.5)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 2 + (i % 3), 0, TAU); ctx.stroke(); }
    // depth gauge
    const gx = W - 30; ctx.fillStyle = "rgba(0,0,0,.35)"; rr(ctx, gx - 10, 14, 20, H - 28, 10); ctx.fill(); D.ZONES.forEach(zz => { const y = 20 + (zz[0] / 11000) * (H - 40); ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(gx - 7, y, 14, 1.5); });
    glow(ctx, "#ff904d", 10, () => sphere(ctx, gx, 20 + s.d / 11000 * (H - 40), 7, "#ff904d", -0.4, -0.5, 0.7));
    tag(ctx, 16, 24, z[2] + " · " + s.d.toLocaleString("en-IN") + " m", "rgba(0,0,0,.5)", "#fff", "left");
  };
  function drawCreature(ctx, f, W, H, depth, t) {
    const x = f.x * W, y = f.y * H + Math.sin(f.ph) * 4, dir = Math.sign(f.vx) || 1, glowy = depth > 1000, sway = Math.sin(f.ph * 2.2) * 0.35;
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    if (/squid|octopus/i.test(f.n)) {
      const g = ctx.createRadialGradient(-4, -6, 2, 0, -2, 18); g.addColorStop(0, lite(f.c, 0.4)); g.addColorStop(1, dark(f.c, 0.3)); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(6, -2, 16, 11, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = f.c; ctx.lineWidth = 2.5; ctx.lineCap = "round"; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-6, -4 + k * 2); ctx.quadraticCurveTo(-18, -6 + k * 3 + Math.sin(f.ph * 2 + k) * 4, -28, -4 + k * 3 + Math.sin(f.ph * 2 + k + 1) * 6); ctx.stroke(); }
      if (/Dumbo/.test(f.n)) { ctx.fillStyle = lite(f.c, 0.2); ctx.beginPath(); ctx.ellipse(4, -14, 6, 4, sway, 0, TAU); ctx.fill(); }
      sphere(ctx, 12, -4, 3, "#111", -0.3, -0.3, 0.6);
    } else if (/turtle/i.test(f.n)) {
      ctx.fillStyle = "#5a7d4f"; [[-8, 8], [10, 8], [-8, -8], [10, -8]].forEach(([fx2, fy], k) => { ctx.beginPath(); ctx.ellipse(fx2, fy, 8, 3.5, (k < 2 ? 0.5 : -0.5) + sway, 0, TAU); ctx.fill(); });
      const sh = ctx.createRadialGradient(-2, -4, 2, 0, 0, 16); sh.addColorStop(0, "#9bbf73"); sh.addColorStop(1, "#3d5a2c"); ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(0, 0, 16, 11, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = "rgba(30,50,20,.6)"; ctx.lineWidth = 1; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.arc(k * 7, 0, 4, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = "#6e8f5c"; ctx.beginPath(); ctx.ellipse(19, 0, 6, 4.5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(21, -1.5, 1.2, 0, TAU); ctx.fill();
    } else if (/cucumber|Xenophyophore|Amphipod/i.test(f.n)) {
      const g = ctx.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, lite(f.c, 0.3)); g.addColorStop(1, dark(f.c, 0.3)); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 18, 6 + Math.sin(f.ph) * 1, 0, 0, TAU); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.25)"; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.arc(k * 5, -3, 1.4, 0, TAU); ctx.fill(); }
    } else {
      const len = /Tuna|Swordfish|eel/i.test(f.n) ? 26 : 19, ht = /eel/i.test(f.n) ? 5 : 9;
      ctx.save(); ctx.translate(-len * 0.75, 0); ctx.rotate(sway); ctx.fillStyle = dark(f.c, 0.15); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-12, -9); ctx.quadraticCurveTo(-8, 0, -12, 9); ctx.closePath(); ctx.fill(); ctx.restore();
      const g = ctx.createLinearGradient(0, -ht, 0, ht); g.addColorStop(0, lite(f.c, 0.25)); g.addColorStop(0.55, f.c); g.addColorStop(1, lite(f.c, 0.55)); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, len, ht, 0, 0, TAU); ctx.fill();
      if (/Clown/.test(f.n)) { ctx.fillStyle = "rgba(255,255,255,.9)"; [-6, 6].forEach(bx => { ctx.beginPath(); ctx.ellipse(bx, 0, 2.5, ht * 0.95, 0, 0, TAU); ctx.fill(); }); }
      if (/Sword/.test(f.n)) { ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(len, -1); ctx.lineTo(len + 22, -2); ctx.stroke(); }
      ctx.fillStyle = dark(f.c, 0.2); ctx.beginPath(); ctx.moveTo(-4, -ht + 1); ctx.quadraticCurveTo(2, -ht - 8, 8, -ht + 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.beginPath(); ctx.ellipse(2, -ht * 0.35, len * 0.6, ht * 0.25, 0, 0, TAU); ctx.fill();
      sphere(ctx, len * 0.6, -ht * 0.2, 2.6, "#f8fafc", -0.3, -0.3, 0.2); ctx.fillStyle = "#0b0b0b"; ctx.beginPath(); ctx.arc(len * 0.62, -ht * 0.2, 1.4, 0, TAU); ctx.fill();
      if (/Lantern/.test(f.n) || glowy) { ctx.save(); ctx.globalCompositeOperation = "lighter"; for (let k = 0; k < 4; k++) { ctx.fillStyle = `rgba(120,255,230,${0.5 + 0.5 * Math.sin(t * 4 + k + f.ph)})`; ctx.beginPath(); ctx.arc(-len * 0.4 + k * len * 0.3, ht * 0.5, 1.4, 0, TAU); ctx.fill(); } ctx.restore(); }
      if (/Angler/.test(f.n)) { ctx.strokeStyle = dark(f.c, 0.1); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(len * 0.4, -ht); ctx.quadraticCurveTo(len * 0.9, -ht - 16, len * 1.2, -ht - 6); ctx.stroke(); ctx.save(); ctx.globalCompositeOperation = "lighter"; const lg = ctx.createRadialGradient(len * 1.2, -ht - 6, 0, len * 1.2, -ht - 6, 18); lg.addColorStop(0, `rgba(180,255,240,${0.8 + 0.2 * Math.sin(t * 5)})`); lg.addColorStop(1, "rgba(120,255,230,0)"); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(len * 1.2, -ht - 6, 18, 0, TAU); ctx.fill(); ctx.restore(); ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 1; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(len * 0.85 - k * 3, ht * 0.1); ctx.lineTo(len * 0.8 - k * 3, ht * 0.5); ctx.stroke(); } }
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.75; txt(ctx, f.n, x, y + 22, "rgba(255,255,255,.85)", 10); ctx.restore();
  }
})();
