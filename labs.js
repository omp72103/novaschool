/* NovaSchool — interactive lab engine + 19 labs (canvas, no libraries) */
(function () {
  const NS = window.NS;
  const TAU = Math.PI * 2;
  const C = { or: "#ff904d", or2: "#ff8a7a", bl: "#6fa3d6", ink: "#ece8e4", mute: "#a7a9b4", line: "#363743", ok: "#3ecf8e", bad: "#ff6b6b", card: "#1b1d24", y: "#ffd166", g: "#3ecf8e", p: "#b28dff" };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fx = (v, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toFixed(d);

  // drawing helpers
  function circ(ctx, x, y, r, fill, stroke, lw = 1) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
  function seg(ctx, x1, y1, x2, y2, col, lw = 2, dash) { ctx.beginPath(); ctx.setLineDash(dash || []); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); ctx.setLineDash([]); }
  function arrow(ctx, x1, y1, x2, y2, col, lw = 3) {
    const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1); if (L < 2) return;
    seg(ctx, x1, y1, x2, y2, col, lw); const h = Math.min(12, L * 0.5);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)); ctx.lineTo(x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  function tag(ctx, x, y, text, bg = "#24406a", fg = "#fff", align = "center") {
    ctx.font = "700 12px Montserrat, Arial"; const w = ctx.measureText(text).width + 14, h = 22;
    let x0 = align === "center" ? x - w / 2 : align === "left" ? x : x - w;
    ctx.fillStyle = bg; rr(ctx, x0, y - h / 2, w, h, 6); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, x0 + w / 2, y + 1);
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function txt(ctx, s, x, y, col = C.ink, size = 13, align = "center", weight = 600) { ctx.font = `${weight} ${size}px "Open Sans", Arial`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(s, x, y); }
  function ball(ctx, x, y, r, col) { const g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r); g.addColorStop(0, "#fff"); g.addColorStop(.25, col); g.addColorStop(1, shade(col, -0.55)); circ(ctx, x, y, r, g); }
  function shade(hex, p) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; const t = p < 0 ? 0 : 255, q = Math.abs(p); r = Math.round((t - r) * q + r); g = Math.round((t - g) * q + g); b = Math.round((t - b) * q + b); return `rgb(${r},${g},${b})`; }

  const L = {};

  /* 1. PENDULUM */
  const PLANETS = { Earth: [9.8, "#3f8fd8", "#4caf50"], Moon: [1.62, "#9aa0a6", "#6b7075"], Mars: [3.71, "#c1440e", "#e07b39"], Jupiter: [24.8, "#c99e6a", "#e6c79c"] };
  L.pendulum = {
    controls: [{ t: "range", k: "L", label: "String length", min: 0.2, max: 2.5, step: 0.05, fmt: v => fx(v) + " m" }, { t: "seg", k: "planet", label: "Planet (gravity)", opts: Object.keys(PLANETS) }, { t: "pause" }, { t: "btn", label: "Restart swing", act: s => { s.th = 0.35; s.w = 0; s.cross = []; s.time = 0; } }],
    init: () => ({ L: 1, planet: "Earth", th: 0.35, w: 0, time: 0, cross: [], prev: 0.35 }),
    step(s, dt) {
      const g = PLANETS[s.planet][0], n = 8, h = dt / n;
      for (let i = 0; i < n; i++) { s.w += -(g / s.L) * Math.sin(s.th) * h; s.th += s.w * h; }
      s.time += dt;
      if (s.prev < 0 && s.th >= 0) { s.cross.push(s.time); if (s.cross.length > 4) s.cross.shift(); }
      s.prev = s.th;
    },
    reset(s, k) { if (k === "L" || k === "planet") { s.cross = []; } },
    draw(ctx, W, H, s) {
      const g = PLANETS[s.planet];
      // planet panel
      const pw = Math.min(W * 0.3, 220);
      if (W > 520) {
        ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(0, 0, pw, H);
        const r = pw * 0.36, cx = pw / 2, cy = H * 0.42, gr = ctx.createRadialGradient(cx - r * .3, cy - r * .3, r * .1, cx, cy, r);
        gr.addColorStop(0, shade(g[1], .3)); gr.addColorStop(1, shade(g[1], -.5)); circ(ctx, cx, cy, r, gr);
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
        for (let i = 0; i < 7; i++) circ(ctx, cx + Math.cos(i * 2.1) * r * .5, cy + Math.sin(i * 1.7) * r * .5, r * (.12 + (i % 3) * .06), g[2] + "aa");
        ctx.restore();
        tag(ctx, 14, 26, s.planet, "rgba(0,0,0,.5)", "#fff", "left"); txt(ctx, "g = " + g[0] + " m/s²", 20, 50, C.mute, 12, "left");
        let y = H - 110; Object.entries(PLANETS).forEach(([n, v]) => {
          txt(ctx, n, 14, y, n === s.planet ? "#fff" : C.mute, 11, "left");
          ctx.fillStyle = C.line; rr(ctx, 64, y - 3, pw - 110, 6, 3); ctx.fill();
          ctx.fillStyle = n === s.planet ? C.or : "#555"; rr(ctx, 64, y - 3, (pw - 110) * v[0] / 24.8, 6, 3); ctx.fill();
          txt(ctx, String(v[0]), pw - 12, y, C.mute, 11, "right"); y += 22;
        });
      }
      const ox = W > 520 ? pw : 0, cw = W - ox, px = ox + cw / 2, py = 50, scale = Math.max(30, H - 130) / 2.5;
      const bx = px + Math.sin(s.th) * s.L * scale, by = py + Math.cos(s.th) * s.L * scale;
      // stand
      seg(ctx, px - 120, H - 40, px + 60, H - 40, "#8a4b24", 14); seg(ctx, px - 100, H - 46, px - 100, py, "#666", 5); seg(ctx, px - 100, py, px + 10, py, "#666", 5);
      // swing arc
      ctx.beginPath(); ctx.setLineDash([5, 6]); ctx.arc(px, py, s.L * scale, Math.PI / 2 - 0.37, Math.PI / 2 + 0.37); ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
      seg(ctx, px, py, px, py + s.L * scale, "rgba(255,255,255,.25)", 1, [4, 4]);
      seg(ctx, px, py, bx, by, "#ddd", 2); circ(ctx, px, py, 4, "#fff");
      ball(ctx, bx, by, 14, "#c46b1d");
      tag(ctx, px + 26, py - 10, "pivot", "#24406a"); tag(ctx, bx + 34, by + 18, "bob", "#b0521d");
      tag(ctx, px - 50, py + s.L * scale / 2, "L = " + fx(s.L) + " m", "#1f5f99");
      arrow(ctx, px + 120, py + 40, px + 120, py + 40 + 18 + g[0] * 2.4, "#2ea043", 3); tag(ctx, px + 120, py + 22, "g = " + g[0] + " m/s²", "#1d6b33");
    },
    info(s) {
      const g = PLANETS[s.planet][0], T = TAU * Math.sqrt(s.L / g);
      const m = s.cross.length > 1 ? (s.cross[s.cross.length - 1] - s.cross[0]) / (s.cross.length - 1) : null;
      return { f: ["T = 2π√(L / g)", "f = 1 / T", "swings per minute = 60 / T"], r: [["Period T", fx(T) + " s"], ["Measured period", m ? fx(m) + " s" : "measuring…"], ["Frequency", fx(1 / T, 3) + " Hz"], ["Swings / min", fx(60 / T, 1)]], x: `A ${fx(s.L)} m pendulum on ${s.planet} takes about ${fx(T)} seconds for one full swing. Shorter strings and stronger gravity make it swing faster.` };
    }
  };

  /* 2. LENS */
  L.lens = {
    controls: [{ t: "seg", k: "type", label: "Lens type", opts: ["Convex", "Concave"] }, { t: "range", k: "f", label: "Focal length", min: 6, max: 20, step: 1, fmt: v => v + " cm" }, { t: "range", k: "u", label: "Object distance", min: 3, max: 50, step: 0.5, fmt: v => fx(v, 1) + " cm" }, { t: "hint", text: "Tip: drag the orange object arrow left and right." }],
    init: () => ({ type: "Convex", f: 10, u: 25, h: 4, drag: false }),
    calc(s) { const f = s.type === "Convex" ? s.f : -s.f, u = -s.u; const inv = 1 / f + 1 / u; const v = Math.abs(inv) < 1e-6 ? Infinity : 1 / inv; const m = v / u; return { f, u, v, m }; },
    draw(ctx, W, H, s) {
      const cx = W * 0.5, cy = H * 0.55, k = Math.min((W * 0.46) / 52, H / 22);
      const X = x => cx + x * k, Y = y => cy - y * k, { f, v, m } = this.calc(s);
      seg(ctx, 0, cy, W, cy, "rgba(255,255,255,.35)", 1);
      // lens
      ctx.beginPath(); const lh = 9 * k;
      if (s.type === "Convex") { ctx.ellipse(cx, cy, 10, lh, 0, 0, TAU); } else { ctx.moveTo(cx - 12, cy - lh); ctx.quadraticCurveTo(cx - 2, cy, cx - 12, cy + lh); ctx.lineTo(cx + 12, cy + lh); ctx.quadraticCurveTo(cx + 2, cy, cx + 12, cy - lh); ctx.closePath(); }
      ctx.fillStyle = "rgba(111,163,214,.25)"; ctx.fill(); ctx.strokeStyle = C.bl; ctx.lineWidth = 2; ctx.stroke();
      [[-s.f, "F"], [s.f, "F′"], [-2 * s.f, "2F"], [2 * s.f, "2F′"]].forEach(([x, l]) => { if (Math.abs(X(x) - cx) < W / 2) { circ(ctx, X(x), cy, 4, "#fff"); txt(ctx, l, X(x), cy + 16, C.mute, 12); } });
      const ox = X(-s.u), oy = Y(s.h); arrow(ctx, ox, cy, ox, oy, C.or, 4); tag(ctx, ox, oy - 16, "object", "#b0521d");
      const finite = isFinite(v) && Math.abs(v) < 400, ix = X(v), iy = Y(m * s.h);
      const rays = [s.h, 0, finite ? m * s.h : s.h * 0.5], cols = ["#ffd166", "#ff6b9a", "#7ee0a7"];
      rays.forEach((yl, i) => {
        const ly = Y(yl); seg(ctx, ox, oy, cx, ly, cols[i], 2);
        let dx, dy;
        if (!finite) { dx = cx - ox; dy = cy - oy; }
        else if (v > 0) { dx = ix - cx; dy = iy - ly; }
        else { dx = cx - ix; dy = ly - iy; seg(ctx, cx, ly, ix, iy, cols[i], 1.2, [5, 5]); }
        const n = Math.hypot(dx, dy) || 1; seg(ctx, cx, ly, cx + dx / n * W, ly + dy / n * W, cols[i], 2);
      });
      if (finite) { arrow(ctx, ix, cy, ix, iy, v > 0 ? "#ff6b6b" : "rgba(255,107,107,.6)", 4); tag(ctx, ix, iy + (m * s.h > 0 ? -16 : 16), v > 0 ? "real image" : "virtual image", "#8a2c3a"); }
    },
    down(s, x, y, W, H) { const cx = W * .5, k = Math.min((W * 0.46) / 52, H / 22); if (Math.abs(x - (cx - s.u * k)) < 30) { s.drag = true; return true; } },
    move(s, x, y, W, H) { if (!s.drag) return; const cx = W * .5, k = Math.min((W * 0.46) / 52, H / 22); s.u = clamp(Math.round((cx - x) / k * 2) / 2, 3, 50); return true; },
    up(s) { s.drag = false; },
    info(s) {
      const { v, m } = this.calc(s), fin = isFinite(v) && Math.abs(v) < 1e4;
      const nature = !fin ? "Image at infinity" : `${v > 0 ? "Real" : "Virtual"}, ${m < 0 ? "inverted" : "upright"}, ${Math.abs(m) > 1.02 ? "magnified" : Math.abs(m) < 0.98 ? "diminished" : "same size"}`;
      return { f: ["1/v − 1/u = 1/f", "m = v / u", "(u is negative: object on the left)"], r: [["u", "−" + fx(s.u, 1) + " cm"], ["v", fin ? fx(v, 1) + " cm" : "∞"], ["Magnification", fin ? fx(m) : "∞"], ["f", (s.type === "Convex" ? "+" : "−") + s.f + " cm"]], x: nature + ". " + (s.type === "Convex" ? "A convex lens forms a virtual, magnified image only when the object is inside F — that's how a magnifying glass works." : "A concave lens always forms a small, upright, virtual image on the same side as the object.") };
    }
  };

  /* 3. MAGNETIC FIELD */
  L.magnet = {
    controls: [{ t: "range", k: "ang", label: "Rotate magnet", min: 0, max: 360, step: 5, fmt: v => v + "°" }, { t: "range", k: "str", label: "Strength", min: 1, max: 5, step: 1, fmt: v => "×" + v }, { t: "seg", k: "lines", label: "Field lines", opts: ["Show", "Hide"] }, { t: "seg", k: "flip", label: "Poles", opts: ["N→S", "Flip"] }, { t: "hint", text: "Drag the bar magnet around the field." }],
    init: () => ({ ang: 0, str: 3, lines: "Show", flip: "N→S", mx: null, my: null, drag: false }),
    poles(s, W, H) { if (s.mx == null) { s.mx = W / 2; s.my = H / 2; } const a = s.ang * Math.PI / 180, d = 55, sg = s.flip === "Flip" ? -1 : 1; return [[s.mx + Math.cos(a) * d * sg, s.my + Math.sin(a) * d * sg, 1], [s.mx - Math.cos(a) * d * sg, s.my - Math.sin(a) * d * sg, -1]]; },
    B(P, x, y) { let bx = 0, by = 0; for (const [px, py, q] of P) { const dx = x - px, dy = y - py, r2 = dx * dx + dy * dy + 40, r3 = r2 * Math.sqrt(r2); bx += q * dx / r3; by += q * dy / r3; } return [bx, by]; },
    draw(ctx, W, H, s) {
      const P = this.poles(s, W, H);
      if (s.lines === "Show") {
        ctx.strokeStyle = "rgba(111,163,214,.45)"; ctx.lineWidth = 1.3;
        const n = 8 + s.str * 2;
        for (let i = 0; i < n; i++) {
          const a = i / n * TAU; let x = P[0][0] + Math.cos(a) * 12, y = P[0][1] + Math.sin(a) * 12; ctx.beginPath(); ctx.moveTo(x, y);
          for (let j = 0; j < 600; j++) { const [bx, by] = this.B(P, x, y), m = Math.hypot(bx, by) || 1; x += bx / m * 4; y += by / m * 4; ctx.lineTo(x, y); if (Math.hypot(x - P[1][0], y - P[1][1]) < 10 || x < -50 || x > W + 50 || y < -50 || y > H + 50) break; }
          ctx.stroke();
        }
      }
      const step = 46;
      for (let x = step / 2; x < W; x += step) for (let y = step / 2; y < H; y += step) {
        if (Math.hypot(x - s.mx, y - s.my) < 75) continue;
        const [bx, by] = this.B(P, x, y), a = Math.atan2(by, bx), mag = Math.hypot(bx, by) * 1e4 * s.str, al = clamp(0.25 + mag, 0.25, 1);
        ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = al;
        circ(ctx, 0, 0, 13, "rgba(255,255,255,.04)", "rgba(255,255,255,.18)");
        ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(0, -3.5); ctx.lineTo(0, 3.5); ctx.fillStyle = "#ff5a5a"; ctx.fill();
        ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(0, -3.5); ctx.lineTo(0, 3.5); ctx.fillStyle = "#dfe3ea"; ctx.fill(); ctx.restore();
      }
      ctx.save(); ctx.translate(s.mx, s.my); ctx.rotate(s.ang * Math.PI / 180 + (s.flip === "Flip" ? Math.PI : 0));
      ctx.fillStyle = "#d94848"; rr(ctx, 0, -16, 70, 32, 6); ctx.fill(); ctx.fillStyle = "#3d6fb6"; rr(ctx, -70, -16, 70, 32, 6); ctx.fill();
      txt(ctx, "N", 48, 1, "#fff", 18, "center", 800); txt(ctx, "S", -48, 1, "#fff", 18, "center", 800); ctx.restore();
    },
    down(s, x, y) { if (Math.hypot(x - s.mx, y - s.my) < 75) { s.drag = true; s.ox = x - s.mx; s.oy = y - s.my; return true; } },
    move(s, x, y, W, H) { if (!s.drag) return; s.mx = clamp(x - s.ox, 40, W - 40); s.my = clamp(y - s.oy, 40, H - 40); return true; },
    up(s) { s.drag = false; },
    info: s => ({ f: ["Field lines leave N and enter S", "Closer lines → stronger field", "B ∝ 1 / r² near each pole"], r: [["Orientation", s.ang + "°"], ["Strength", "×" + s.str]], x: "Each compass needle's red tip points along the field — away from the magnet's north pole and towards its south pole. Needles far from the magnet barely respond because the field weakens quickly with distance." })
  };

  /* 4. FORCE & MOTION */
  L.force = {
    controls: [{ t: "range", k: "F", label: "Applied force", min: 0, max: 60, step: 1, fmt: v => v + " N" }, { t: "range", k: "m", label: "Mass", min: 1, max: 20, step: 1, fmt: v => v + " kg" }, { t: "range", k: "mu", label: "Friction (μ)", min: 0, max: 0.6, step: 0.02, fmt: v => fx(v) }, { t: "hold", label: "Hold to push", k: "push" }, { t: "btn", label: "Reset cart", act: s => { s.x = 0; s.v = 0; s.hist = []; s.time = 0; } }],
    init: () => ({ F: 20, m: 5, mu: 0.1, x: 0, v: 0, push: false, hist: [], time: 0 }),
    acc(s) { const g = 9.8, fr = s.mu * s.m * g, Fa = s.push ? s.F : 0; if (Math.abs(s.v) < 1e-3) { if (Fa <= fr) return 0; return (Fa - fr) / s.m; } return (Fa - Math.sign(s.v) * fr) / s.m; },
    step(s, dt) { const a = this.acc(s); const nv = s.v + a * dt; s.v = (s.v > 0 && nv < 0 && !s.push) ? 0 : nv; s.x += s.v * dt; s.time += dt; s.a = a; if (s.time - (s.lt || 0) > .1) { s.lt = s.time; s.hist.push(s.v); if (s.hist.length > 120) s.hist.shift(); } },
    draw(ctx, W, H, s) {
      const gy = H * 0.68, ppm = 40, off = ((s.x * ppm) % W + W) % W, cx = 60 + off % (W - 120);
      ctx.fillStyle = "#2a2d38"; ctx.fillRect(0, gy, W, H - gy);
      for (let i = -1; i < W / 40 + 1; i++) { const x = i * 40 - (s.x * ppm % 40); seg(ctx, x, gy + 4, x + 20, gy + 4, "#444a5a", 3); }
      const w = 70 + s.m * 3, h = 40 + s.m * 1.5;
      ctx.fillStyle = "#2f6db5"; rr(ctx, cx - w / 2, gy - h - 14, w, h, 8); ctx.fill(); txt(ctx, s.m + " kg", cx, gy - h / 2 - 14, "#fff", 14, "center", 800);
      circ(ctx, cx - w / 3, gy - 10, 10, "#222", "#888", 3); circ(ctx, cx + w / 3, gy - 10, 10, "#222", "#888", 3);
      if (s.push && s.F > 0) { arrow(ctx, cx - w / 2 - 20 - s.F * 2, gy - h / 2 - 14, cx - w / 2 - 4, gy - h / 2 - 14, C.or, 5); tag(ctx, cx - w / 2 - 40 - s.F, gy - h - 34, "F = " + s.F + " N", "#b0521d"); }
      const fr = s.mu * s.m * 9.8; if (s.mu > 0 && (Math.abs(s.v) > 1e-3 || s.push)) { const fa = Math.abs(s.v) > 1e-3 ? fr : Math.min(fr, s.push ? s.F : 0); arrow(ctx, cx + w / 2 - 6, gy - 4, cx + w / 2 - 6 - Math.min(fa * 2, 140) - 8, gy - 4, "#ff6b6b", 4); tag(ctx, cx + w / 2 + 40, gy + 24, "friction " + fx(fa, 1) + " N", "#8a2c3a"); }
      if (Math.abs(s.v) > .01) arrow(ctx, cx, gy - h - 40, cx + clamp(s.v * 12, -120, 120), gy - h - 40, C.ok, 3);
      // v-t graph
      const gx = 16, gw = Math.min(260, W - 32), gh = 80, gyy = 16; ctx.fillStyle = "rgba(0,0,0,.35)"; rr(ctx, gx, gyy, gw, gh, 8); ctx.fill(); txt(ctx, "velocity vs time", gx + 10, gyy + 12, C.mute, 11, "left");
      const mx = Math.max(5, ...s.hist.map(Math.abs)); ctx.beginPath(); s.hist.forEach((v, i) => { const x = gx + 6 + i / 120 * (gw - 12), y = gyy + gh - 8 - v / mx * (gh - 28); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.strokeStyle = C.ok; ctx.lineWidth = 2; ctx.stroke();
    },
    info(s) { const fr = s.mu * s.m * 9.8; return { f: ["F_net = F − μmg", "a = F_net / m", "v = u + at"], r: [["Acceleration", fx(s.a || 0) + " m/s²"], ["Velocity", fx(s.v) + " m/s"], ["Distance", fx(s.x, 1) + " m"], ["Max friction", fx(fr, 1) + " N"]], x: s.F <= fr ? `Static friction (${fx(fr, 1)} N) is stronger than your push, so the cart won't start. Increase the force or reduce friction.` : `Holding the push gives a net force of ${fx(s.F - fr, 1)} N, so the ${s.m} kg cart accelerates at ${fx((s.F - fr) / s.m)} m/s². Let go and friction slows it to a stop.` }; }
  };

  /* 5. ATOM */
  const EL = "H Hydrogen 1|He Helium 4|Li Lithium 7|Be Beryllium 9|B Boron 11|C Carbon 12|N Nitrogen 14|O Oxygen 16|F Fluorine 19|Ne Neon 20|Na Sodium 23|Mg Magnesium 24|Al Aluminium 27|Si Silicon 28|P Phosphorus 31|S Sulfur 32|Cl Chlorine 35|Ar Argon 40|K Potassium 39|Ca Calcium 40".split("|").map(s => s.split(" "));
  const shells = z => { const out = [], cap = [2, 8, 8, 2]; let r = z; for (const c of cap) { if (r <= 0) break; out.push(Math.min(c, r)); r -= c; } return out; };
  L.atom = {
    controls: [{ t: "range", k: "z", label: "Protons (atomic number)", min: 1, max: 20, step: 1, fmt: v => v + " · " + EL[v - 1][1] }, { t: "btns", items: [["− proton", s => s.z = clamp(s.z - 1, 1, 20)], ["+ proton", s => s.z = clamp(s.z + 1, 1, 20)]] }, { t: "seg", k: "spin", label: "Electron motion", opts: ["Orbit", "Still"] }],
    init: () => ({ z: 6, spin: "Orbit", t: 0 }),
    step(s, dt) { if (s.spin === "Orbit") s.t += dt; },
    draw(ctx, W, H, s) {
      const cx = W / 2, cy = H / 2, sh = shells(s.z), A = +EL[s.z - 1][2], n = A - s.z, R = Math.min(W, H) * 0.11;
      const nuc = []; for (let i = 0; i < A; i++) { const a = i * 2.4, r = Math.sqrt(i) * 5.2; nuc.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, i < s.z]); }
      nuc.reverse().forEach(([x, y, p]) => ball(ctx, x, y, 6.5, p ? "#e5533d" : "#8e9aaf"));
      sh.forEach((cnt, i) => {
        const r = R + 28 + i * (Math.min(W, H) * 0.1); circ(ctx, cx, cy, r, null, "rgba(255,255,255,.18)", 1.2);
        for (let e = 0; e < cnt; e++) { const a = e / cnt * TAU + s.t * (0.9 - i * 0.18); ball(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 6, "#4fa3ff"); }
        tag(ctx, cx + r * .72, cy - r * .72, "shell " + (i + 1) + ": " + cnt, "rgba(31,95,153,.8)");
      });
      ctx.fillStyle = "rgba(0,0,0,.4)"; rr(ctx, 16, 16, 92, 100, 10); ctx.fill();
      txt(ctx, String(s.z), 28, 32, C.mute, 12, "left"); txt(ctx, EL[s.z - 1][0], 62, 64, "#fff", 34, "center", 800); txt(ctx, EL[s.z - 1][1], 62, 100, C.mute, 11);
      tag(ctx, W - 80, H - 50, "● proton", "#8a2c2c"); tag(ctx, W - 80, H - 24, "● neutron", "#4a5266"); tag(ctx, W - 186, H - 24, "● electron", "#1f5f99");
    },
    info(s) { const sh = shells(s.z), A = +EL[s.z - 1][2], val = sh[sh.length - 1]; return { f: ["Mass number A = protons + neutrons", "Shell capacity: 2, 8, 8 …", "Neutral atom: electrons = protons"], r: [["Protons", s.z], ["Neutrons", A - s.z], ["Electrons", s.z], ["Configuration", sh.join(", ")]], x: `${EL[s.z - 1][1]} has ${val} electron${val > 1 ? "s" : ""} in its outer shell${sh.length && val === [2, 8, 8, 2][sh.length - 1] && s.z !== 20 ? ", which is full — so it is very stable and unreactive." : ". The outer electrons decide how it reacts with other atoms."}` }; }
  };

  /* 6. MOLECULE */
  const MOL = {
    Water: { f: "H₂O", shape: "Bent", angle: "104.5°", atoms: [["O", 0, 0, 0], ["H", .76, .59, 0], ["H", -.76, .59, 0]], bonds: [[0, 1, 1], [0, 2, 1]] },
    "Carbon dioxide": { f: "CO₂", shape: "Linear", angle: "180°", atoms: [["C", 0, 0, 0], ["O", 1.16, 0, 0], ["O", -1.16, 0, 0]], bonds: [[0, 1, 2], [0, 2, 2]] },
    Methane: { f: "CH₄", shape: "Tetrahedral", angle: "109.5°", atoms: [["C", 0, 0, 0], ["H", .63, .63, .63], ["H", -.63, -.63, .63], ["H", -.63, .63, -.63], ["H", .63, -.63, -.63]], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    Ammonia: { f: "NH₃", shape: "Trigonal pyramidal", angle: "107°", atoms: [["N", 0, -.3, 0], ["H", .94, .1, 0], ["H", -.47, .1, .81], ["H", -.47, .1, -.81]], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] }
  };
  const ACOL = { O: ["#e5533d", 20], H: ["#eef1f5", 13], C: ["#555b66", 19], N: ["#4f7fe5", 19] };
  L.molecule = {
    controls: [{ t: "seg", k: "mol", label: "Molecule", opts: Object.keys(MOL) }, { t: "seg", k: "auto", label: "Auto-rotate", opts: ["On", "Off"] }, { t: "range", k: "zoom", label: "Zoom", min: 0.6, max: 1.6, step: 0.05, fmt: v => fx(v) + "×" }, { t: "hint", text: "Drag the molecule to rotate it in 3D." }],
    init: () => ({ mol: "Water", auto: "On", zoom: 1, rx: -0.3, ry: 0.4, drag: false }),
    step(s, dt) { if (s.auto === "On" && !s.drag) s.ry += dt * 0.6; },
    draw(ctx, W, H, s) {
      const M = MOL[s.mol], k = Math.min(W, H) * 0.22 * s.zoom, cx = W / 2, cy = H / 2;
      const P = M.atoms.map(([e, x, y, z]) => { let X = x * Math.cos(s.ry) + z * Math.sin(s.ry), Z = -x * Math.sin(s.ry) + z * Math.cos(s.ry); let Y = y * Math.cos(s.rx) - Z * Math.sin(s.rx); Z = y * Math.sin(s.rx) + Z * Math.cos(s.rx); const p = 1 + Z * 0.15; return { e, x: cx + X * k * p, y: cy + Y * k * p, z: Z, p }; });
      M.bonds.forEach(([a, b, o]) => { const A = P[a], B = P[b], dx = B.x - A.x, dy = B.y - A.y, n = Math.hypot(dx, dy) || 1, ox = -dy / n * 5, oy = dx / n * 5; if (o === 2) { seg(ctx, A.x + ox, A.y + oy, B.x + ox, B.y + oy, "#aab", 5); seg(ctx, A.x - ox, A.y - oy, B.x - ox, B.y - oy, "#aab", 5); } else seg(ctx, A.x, A.y, B.x, B.y, "#aab", 7); });
      [...P].sort((a, b) => a.z - b.z).forEach(a => { const [col, r] = ACOL[a.e]; ball(ctx, a.x, a.y, r * s.zoom * a.p * (Math.min(W, H) / 360), col); txt(ctx, a.e, a.x, a.y, a.e === "H" ? "#222" : "#fff", 13, "center", 800); });
      tag(ctx, W / 2, 28, M.f + " · " + M.shape, "#24406a");
    },
    down(s, x, y) { s.drag = true; s.lx = x; s.ly = y; return true; },
    move(s, x, y) { if (!s.drag) return; s.ry += (x - s.lx) * 0.01; s.rx += (y - s.ly) * 0.01; s.lx = x; s.ly = y; return true; },
    up(s) { s.drag = false; },
    info(s) { const M = MOL[s.mol]; return { f: ["VSEPR: electron pairs repel", "and spread as far apart as possible"], r: [["Formula", M.f], ["Shape", M.shape], ["Bond angle", M.angle], ["Atoms", M.atoms.length]], x: { Water: "Two lone pairs on oxygen push the hydrogens closer, giving water its bent shape and making it polar.", "Carbon dioxide": "Two double bonds on opposite sides make CO₂ straight, so its polarities cancel out.", Methane: "Four equal bonds spread out into a tetrahedron, the most even arrangement in 3D.", Ammonia: "One lone pair on nitrogen squeezes the three hydrogens into a pyramid." }[s.mol] }; }
  };

  /* 7. STATES OF MATTER */
  L.particles = {
    controls: [{ t: "range", k: "T", label: "Temperature", min: -50, max: 200, step: 1, fmt: v => v + " °C" }, { t: "hold", label: "Hold to heat", k: "heat" }, { t: "hold", label: "Hold to cool", k: "cool" }],
    init: () => { const p = []; for (let i = 0; i < 64; i++) p.push({ i, x: 0, y: 0, vx: Math.random() - .5, vy: Math.random() - .5 }); return { T: -10, p, heat: false, cool: false, init: false }; },
    state: T => T < 0 ? "Solid" : T < 100 ? "Liquid" : "Gas",
    step(s, dt, W, H) {
      if (s.heat) s.T = Math.min(200, s.T + 40 * dt); if (s.cool) s.T = Math.max(-50, s.T - 40 * dt);
      if (s.heat || s.cool) s._sync && s._sync("T");
      const st = this.state(s.T), sp = 30 + (s.T + 50) * 1.4, bx = W * .2, bw = W * .6, by = 40, bh = H - 80, r = 9;
      s.p.forEach(p => {
        const col = p.i % 8, row = Math.floor(p.i / 8), lx = bx + bw / 2 - 3.5 * 22 + col * 22, ly = by + bh - 20 - row * 22;
        if (!s.init) { p.x = lx; p.y = ly; }
        if (st === "Solid") { const a = (s.T + 50) / 50 * 3; p.x += (lx - p.x) * .2 + (Math.random() - .5) * a; p.y += (ly - p.y) * .2 + (Math.random() - .5) * a; p.vx = (Math.random() - .5); p.vy = (Math.random() - .5); }
        else {
          const n = Math.hypot(p.vx, p.vy) || 1; p.vx = p.vx / n * sp; p.vy = p.vy / n * sp; if (st === "Liquid") p.vy += 120 * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          const top = st === "Liquid" ? by + bh * 0.45 : by;
          if (p.x < bx + r) { p.x = bx + r; p.vx = Math.abs(p.vx); } if (p.x > bx + bw - r) { p.x = bx + bw - r; p.vx = -Math.abs(p.vx); }
          if (p.y < top + r) { p.y = top + r; p.vy = Math.abs(p.vy); } if (p.y > by + bh - r) { p.y = by + bh - r; p.vy = -Math.abs(p.vy); }
          if (Math.random() < .02) { const a = Math.random() * TAU; p.vx = Math.cos(a); p.vy = Math.sin(a); }
        }
      });
      s.init = true;
    },
    draw(ctx, W, H, s) {
      const bx = W * .2, bw = W * .6, by = 40, bh = H - 80, st = this.state(s.T);
      ctx.strokeStyle = "#8aa"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
      const hue = clamp(220 - (s.T + 50) * 0.9, 0, 220);
      s.p.forEach(p => ball(ctx, p.x, p.y, 9, `hsl(${hue},75%,55%)`));
      if (s.heat) for (let i = 0; i < 5; i++) txt(ctx, "▲", bx + bw * (i + .5) / 5, by + bh + 18, C.or, 16);
      if (s.cool) for (let i = 0; i < 5; i++) txt(ctx, "❄", bx + bw * (i + .5) / 5, by + bh + 18, C.bl, 16);
      tag(ctx, W / 2, 20, st + " · " + Math.round(s.T) + " °C", st === "Solid" ? "#1f5f99" : st === "Liquid" ? "#1d6b5b" : "#8a2c3a");
      // thermometer
      const tx = W * .9, ty = 50, th = H - 110; ctx.fillStyle = "#2a2d38"; rr(ctx, tx - 7, ty, 14, th, 7); ctx.fill(); const f = (s.T + 50) / 250; ctx.fillStyle = C.bad; rr(ctx, tx - 5, ty + th * (1 - f), 10, th * f, 5); ctx.fill(); circ(ctx, tx, ty + th + 10, 13, C.bad);
      [[0, "0°"], [100, "100°"]].forEach(([v, l]) => { const y = ty + th * (1 - (v + 50) / 250); seg(ctx, tx - 14, y, tx + 14, y, "#fff", 1); txt(ctx, l, tx - 18, y, C.mute, 11, "right"); });
    },
    info(s) { const st = this.state(s.T); return { f: ["Melting point of ice: 0 °C", "Boiling point of water: 100 °C", "Higher T → faster particles"], r: [["State", st], ["Temperature", Math.round(s.T) + " °C"], ["Particle speed", st === "Solid" ? "vibrating" : fx((30 + (s.T + 50) * 1.4) / 100, 1) + "×"], ["Spacing", st === "Solid" ? "tightly packed" : st === "Liquid" ? "close, sliding" : "far apart"]], x: { Solid: "Particles are locked in a pattern and can only vibrate. Heat them past 0 °C to melt the solid.", Liquid: "Particles have enough energy to slide past each other but still stay together at the bottom of the container.", Gas: "Particles move fast and freely, filling the whole container. Cool below 100 °C to condense." }[st] }; }
  };

  /* 8. LIGHT & SHADOWS */
  const SHAPES = ["Ball", "Box", "Tree"];
  L.shadows = {
    controls: [{ t: "range", k: "d", label: "Torch distance from object", min: 40, max: 300, step: 5, fmt: v => v + " cm" }, { t: "seg", k: "obj", label: "Object", opts: SHAPES }, { t: "range", k: "size", label: "Torch size (fuzziness)", min: 1, max: 30, step: 1, fmt: v => v + " cm" }, { t: "hint", text: "Drag the torch left and right." }],
    init: () => ({ d: 120, obj: "Ball", size: 6, drag: false }),
    geo(s, W, H) { const k = (W * 0.75) / 450, ox = W * 0.52, sx = W - 30, tx = ox - s.d * k, cy = H * 0.5, oh = 50 * k * 1.6; return { k, ox, sx, tx, cy, oh }; },
    draw(ctx, W, H, s) {
      const { k, ox, sx, tx, cy, oh } = this.geo(s, W, H), sc = (sx - tx) / (ox - tx), shH = oh * sc, blur = s.size * k * ((sx - ox) / (ox - tx));
      const g = ctx.createRadialGradient(tx, cy, 5, tx, cy, W); g.addColorStop(0, "rgba(255,230,150,.35)"); g.addColorStop(1, "rgba(255,230,150,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#e9e3d6"; ctx.fillRect(sx, 20, 14, H - 40);
      ctx.save(); ctx.filter = `blur(${Math.min(20, blur)}px)`; ctx.fillStyle = "rgba(10,10,15,.85)"; this.shape(ctx, s.obj, sx + 4, cy, shH, 0.18); ctx.restore();
      seg(ctx, tx, cy, sx, cy - shH / 2, "rgba(255,230,150,.4)", 1, [4, 4]); seg(ctx, tx, cy, sx, cy + shH / 2, "rgba(255,230,150,.4)", 1, [4, 4]);
      ctx.fillStyle = "#4a90d9"; this.shape(ctx, s.obj, ox, cy, oh, 1);
      ctx.fillStyle = "#555"; rr(ctx, tx - 40, cy - 12, 40, 24, 5); ctx.fill(); ctx.fillStyle = "#ffe28a"; rr(ctx, tx - 4, cy - 16, 8, 32, 3); ctx.fill();
      tag(ctx, tx - 20, cy - 34, "torch", "#7a5a12"); tag(ctx, ox, cy - oh / 2 - 20, "object", "#1f5f99"); tag(ctx, sx - 40, 34, "screen", "#4a5266");
      tag(ctx, sx - 50, cy + shH / 2 + 18 > H - 20 ? H - 30 : cy + shH / 2 + 18, "shadow " + fx(shH / k / 1.6, 0) + " cm", "#333");
    },
    shape(ctx, o, x, y, h, sq) { if (o === "Ball") { ctx.beginPath(); ctx.ellipse(x, y, h / 2 * (sq < 1 ? sq * 2 : 1), h / 2, 0, 0, TAU); ctx.fill(); } else if (o === "Box") { ctx.fillRect(x - h / 2 * (sq < 1 ? sq * 2 : 1), y - h / 2, h * (sq < 1 ? sq * 2 : 1), h); } else { const w = sq < 1 ? sq * 2 : 1; ctx.beginPath(); ctx.moveTo(x, y - h / 2); ctx.lineTo(x + h * .35 * w, y + h * .2); ctx.lineTo(x - h * .35 * w, y + h * .2); ctx.closePath(); ctx.fill(); ctx.fillRect(x - h * .06 * w, y + h * .2, h * .12 * w, h * .3); } },
    down(s, x, y, W, H) { const { tx, cy } = this.geo(s, W, H); if (Math.abs(x - tx) < 50 && Math.abs(y - cy) < 50) { s.drag = true; return true; } },
    move(s, x, y, W, H) { if (!s.drag) return; const { k, ox } = this.geo(s, W, H); s.d = clamp(Math.round((ox - x) / k / 5) * 5, 40, 300); return true; },
    up(s) { s.drag = false; },
    info(s) { const ratio = (450 * 0.48 + s.d) / s.d; return { f: ["shadow size / object size =", "torch→screen ÷ torch→object", "(similar triangles)"], r: [["Torch distance", s.d + " cm"], ["Shadow size", fx(50 * ratio, 0) + " cm"], ["Magnification", fx(ratio, 1) + "×"], ["Edge", s.size > 12 ? "fuzzy" : "sharp"]], x: "Light travels in straight lines, so the object blocks a cone of light. Move the torch closer and the shadow grows; move it away and the shadow shrinks. A bigger torch gives a softer, fuzzier edge." }; }
  };

  /* 9. FLOAT OR SINK */
  const OBJ = [["Wooden block", 0.6, "#b07a43"], ["Apple", 0.85, "#d64545"], ["Ice cube", 0.92, "#bfe6ff"], ["Candle", 0.9, "#f4e6c4"], ["Egg", 1.03, "#f3e2c7"], ["Plastic ball", 0.3, "#ff8bd1"], ["Coin", 8.9, "#c9a227"], ["Stone", 2.6, "#7d7d7d"], ["Key", 7.8, "#aaa"]];
  L.float = {
    controls: [{ t: "drops", label: "Tap an object to drop it in", items: OBJ.map(o => o[0]) }, { t: "range", k: "salt", label: "Salt added", min: 0, max: 20, step: 1, fmt: v => v + " spoons" }, { t: "btn", label: "Empty the tank", act: s => { s.items = []; } }],
    init: () => ({ salt: 0, items: [], last: null }),
    rho: s => 1 + s.salt * 0.006,
    drop(s, name, W) { const o = OBJ.find(x => x[0] === name); s.items.push({ o, x: W * (0.2 + Math.random() * 0.6), y: 20, v: 0 }); if (s.items.length > 9) s.items.shift(); s.last = o; },
    step(s, dt, W, H) {
      const wl = H * 0.4, bot = H - 30, rw = this.rho(s);
      s.items.forEach(it => { const r = 18, fl = it.o[1] < rw, target = fl ? wl - r + 2 * r * (it.o[1] / rw) : bot - r; const sub = clamp((it.y + r - wl) / (2 * r), 0, 1); const buoy = sub * rw / it.o[1] * 9.8; let a = 9.8 - buoy; if (it.y > wl - r) it.v *= 0.92; it.v += a * dt * 60; it.y += it.v * dt; if (it.y > bot - r) { it.y = bot - r; it.v = 0; } if (fl && Math.abs(it.y - target) < 1 && Math.abs(it.v) < 5) it.y += (target - it.y) * .2; });
    },
    draw(ctx, W, H, s) {
      const wl = H * 0.4, rw = this.rho(s);
      ctx.fillStyle = `rgba(${60 - s.salt},${140 - s.salt},${220 - s.salt * 2},.45)`; ctx.fillRect(30, wl, W - 60, H - wl - 20);
      ctx.strokeStyle = "#9ab"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(30, 40); ctx.lineTo(30, H - 20); ctx.lineTo(W - 30, H - 20); ctx.lineTo(W - 30, 40); ctx.stroke();
      s.items.forEach(it => { ctx.fillStyle = it.o[2]; if (it.o[0] === "Wooden block" || it.o[0] === "Ice cube" || it.o[0] === "Candle") { rr(ctx, it.x - 18, it.y - 18, 36, 36, 5); ctx.fill(); } else if (it.o[0] === "Egg") { ctx.beginPath(); ctx.ellipse(it.x, it.y, 14, 18, 0, 0, TAU); ctx.fill(); } else ball(ctx, it.x, it.y, 18, it.o[2]); txt(ctx, it.o[0], it.x, it.y - 28, "#fff", 11); });
      tag(ctx, W - 40, wl - 14, "water density " + fx(rw, 3) + " g/cm³", "#1f5f99", "#fff", "right");
    },
    info(s) { const rw = this.rho(s), o = s.last; return { f: ["Floats if object density < water density", "Fresh water ≈ 1.00 g/cm³", "Salt water is denser"], r: [["Water", fx(rw, 3) + " g/cm³"], ["Last object", o ? o[0] : "—"], ["Its density", o ? o[1] + " g/cm³" : "—"], ["Result", o ? (o[1] < rw ? "Floats" : "Sinks") : "—"]], x: o && o[0] === "Egg" ? "An egg is only a little denser than fresh water. Add enough salt and it starts to float!" : "Whether something floats depends on its density compared with the water, not just on how heavy it is." }; }
  };

  /* 10. FRACTION BUILDER */
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  L.fraction = {
    controls: [{ t: "range", k: "da", label: "Pizza A: slices", min: 2, max: 12, step: 1, fmt: v => v }, { t: "range", k: "db", label: "Bar B: parts", min: 2, max: 12, step: 1, fmt: v => v }, { t: "btn", label: "Clear shading", act: s => { s.a = []; s.b = []; } }, { t: "hint", text: "Tap slices and bar parts to shade them." }],
    init: () => ({ da: 8, db: 4, a: [0, 1, 2], b: [0] }),
    reset(s, k) { if (k === "da") s.a = s.a.filter(i => i < s.da); if (k === "db") s.b = s.b.filter(i => i < s.db); },
    geo(W, H) { const r = Math.min(W * 0.22, H * 0.32); return { r, px: W * 0.27, py: H * 0.45, bx: W * 0.55, by: H * 0.38, bw: W * 0.4, bh: 60 }; },
    draw(ctx, W, H, s) {
      const { r, px, py, bx, by, bw, bh } = this.geo(W, H);
      circ(ctx, px, py, r + 8, "#c98a3a");
      for (let i = 0; i < s.da; i++) { const a0 = i / s.da * TAU - Math.PI / 2, a1 = (i + 1) / s.da * TAU - Math.PI / 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, r, a0, a1); ctx.closePath(); ctx.fillStyle = s.a.includes(i) ? C.or : "#f3dca0"; ctx.fill(); ctx.strokeStyle = "#7a4b16"; ctx.lineWidth = 2; ctx.stroke(); }
      for (let i = 0; i < s.db; i++) { ctx.fillStyle = s.b.includes(i) ? C.bl : "#2a2d38"; ctx.fillRect(bx + i * bw / s.db, by, bw / s.db, bh); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(bx + i * bw / s.db, by, bw / s.db, bh); }
      const fa = s.a.length / s.da, fb = s.b.length / s.db, cmp = Math.abs(fa - fb) < 1e-9 ? "=" : fa > fb ? ">" : "<";
      txt(ctx, `${s.a.length}/${s.da}`, px, py + r + 34, "#fff", 22, "center", 800); txt(ctx, `${s.b.length}/${s.db}`, bx + bw / 2, by + bh + 30, "#fff", 22, "center", 800);
      tag(ctx, bx + bw / 2, by + bh + 80, `A ${cmp} B`, cmp === "=" ? "#1d6b33" : "#24406a");
    },
    down(s, x, y, W, H) {
      const { r, px, py, bx, by, bw, bh } = this.geo(W, H);
      if (Math.hypot(x - px, y - py) < r) { let a = Math.atan2(y - py, x - px) + Math.PI / 2; if (a < 0) a += TAU; const i = Math.floor(a / TAU * s.da); s.a = s.a.includes(i) ? s.a.filter(v => v !== i) : [...s.a, i]; return true; }
      if (x > bx && x < bx + bw && y > by && y < by + bh) { const i = Math.floor((x - bx) / bw * s.db); s.b = s.b.includes(i) ? s.b.filter(v => v !== i) : [...s.b, i]; return true; }
    },
    info(s) { const n = s.a.length, d = s.da, g = gcd(n, d) || 1, nb = s.b.length, gb = gcd(nb, s.db) || 1; return { f: ["Simplify: divide top and bottom by their HCF", "Compare: a/b vs c/d → compare a×d and c×b"], r: [["A", `${n}/${d} = ${n / g}/${d / g}`], ["A as %", fx(n / d * 100, 0) + "%"], ["B", `${nb}/${s.db} = ${nb / gb}/${s.db / gb}`], ["B as %", fx(nb / s.db * 100, 0) + "%"]], x: Math.abs(n / d - nb / s.db) < 1e-9 && n ? `${n}/${d} and ${nb}/${s.db} are equivalent fractions — different pieces, same amount.` : "Shade the same amount of pizza and bar using different numbers of parts to discover equivalent fractions." }; }
  };

  /* 11. MAGNETIC OR NOT */
  const MITEMS = [["Iron nail", 1], ["Paper clip", 1], ["Steel pin", 1], ["Plastic spoon", 0], ["Rubber eraser", 0], ["Wooden pencil", 0], ["Aluminium can", 0], ["Copper wire", 0], ["Glass marble", 0]];
  L.magnetic = {
    controls: [{ t: "predict" }, { t: "btn", label: "New round", act: s => { s.done = {}; s.sel = null; s.score = 0; s.tries = 0; } }],
    init: () => ({ sel: null, done: {}, score: 0, tries: 0, anim: 0, mx: null }),
    pos(i, W, H) { const c = i % 3, r = Math.floor(i / 3); return [W * (0.2 + c * 0.3), H * (0.28 + r * 0.26)]; },
    step(s, dt) { if (s.anim > 0) s.anim = Math.max(0, s.anim - dt); },
    draw(ctx, W, H, s) {
      MITEMS.forEach(([n, m], i) => {
        let [x, y] = this.pos(i, W, H); const d = s.done[n], sel = s.sel === i;
        if (d && m) y -= 18;
        ctx.fillStyle = sel ? "rgba(255,144,77,.18)" : "rgba(255,255,255,.04)"; rr(ctx, x - 70, y - 34, 140, 68, 10); ctx.fill(); ctx.strokeStyle = sel ? C.or : d ? (d.ok ? C.ok : C.bad) : C.line; ctx.lineWidth = 2; ctx.stroke();
        ball(ctx, x, y - 6, 12, m ? "#9aa3ad" : ["#e5533d", "#ffb3c1", "#d9a25a", "#c0c0c0", "#c87533", "#7fd6ff"][i % 6]);
        txt(ctx, n, x, y + 20, "#fff", 12);
        if (d) txt(ctx, m ? "attracted ✓" : "not attracted", x, y - 44, m ? C.ok : C.mute, 11);
      });
      if (s.sel != null) { const [x, y] = this.pos(s.sel, W, H); ctx.save(); ctx.translate(x + 60, y - 50); ctx.lineWidth = 14; ctx.strokeStyle = "#d94848"; ctx.beginPath(); ctx.arc(0, 0, 18, Math.PI, 0); ctx.stroke(); ctx.fillStyle = "#ccc"; ctx.fillRect(-25, 0, 14, 12); ctx.fillRect(11, 0, 14, 12); ctx.restore(); }
      tag(ctx, W / 2, H - 22, `Score ${s.score} / ${s.tries}`, "#24406a");
    },
    down(s, x, y, W, H) { for (let i = 0; i < MITEMS.length; i++) { const [px, py] = this.pos(i, W, H); if (Math.abs(x - px) < 70 && Math.abs(y - py) < 34) { s.sel = i; return true; } } },
    guess(s, g) { if (s.sel == null) return; const [n, m] = MITEMS[s.sel]; if (s.done[n]) return; const ok = (g === 1) === !!m; s.done[n] = { ok }; s.tries++; if (ok) s.score++; s.lastMsg = `${n}: ${m ? "the magnet pulls it — it contains iron." : "no pull — it has no iron, nickel or cobalt."} ${ok ? "Your prediction was right!" : "Your prediction was wrong."}`; },
    info: s => ({ f: ["Magnetic materials: iron, nickel, cobalt", "(and steel, which is mostly iron)"], r: [["Tested", s.tries + " / " + MITEMS.length], ["Correct", s.score]], x: s.lastMsg || "Tap an object, predict whether the magnet will pull it, then see what happens." })
  };

  /* 12. SIMPLE CIRCUIT */
  const MATS = [["Copper wire", 1], ["Iron nail", 0.8], ["Aluminium foil", 0.9], ["Pencil graphite", 0.35], ["Salt water", 0.25], ["Plastic", 0], ["Wood", 0], ["Rubber", 0], ["Glass", 0]];
  L.circuit = {
    controls: [{ t: "seg", k: "mat", label: "Material in the gap", opts: MATS.map(m => m[0]) }, { t: "seg", k: "sw", label: "Switch", opts: ["Open", "Closed"] }, { t: "hint", text: "You can also tap the switch on the board." }],
    init: () => ({ mat: "Copper wire", sw: "Open", t: 0 }),
    cond(s) { return s.sw === "Closed" ? MATS.find(m => m[0] === s.mat)[1] : 0; },
    step(s, dt) { s.t += dt * this.cond(s); },
    geo(W, H) { return { x0: W * .18, x1: W * .82, y0: H * .22, y1: H * .78 }; },
    draw(ctx, W, H, s) {
      const { x0, x1, y0, y1 } = this.geo(W, H), c = this.cond(s), mx = (x0 + x1) / 2;
      const path = [[x0, y1], [x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      ctx.strokeStyle = "#c87533"; ctx.lineWidth = 5; ctx.beginPath(); path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      // battery left
      ctx.fillStyle = "#222"; ctx.fillRect(x0 - 22, (y0 + y1) / 2 - 40, 44, 80); ctx.fillStyle = "#d94848"; ctx.fillRect(x0 - 22, (y0 + y1) / 2 - 40, 44, 20); txt(ctx, "+", x0, (y0 + y1) / 2 - 30, "#fff", 16, "center", 800); txt(ctx, "3 V", x0, (y0 + y1) / 2 + 12, "#fff", 12);
      // bulb top
      const glow = c; if (glow > 0) { const g = ctx.createRadialGradient(mx, y0, 5, mx, y0, 120 * glow); g.addColorStop(0, `rgba(255,220,120,${.9 * glow})`); g.addColorStop(1, "rgba(255,220,120,0)"); ctx.fillStyle = g; ctx.fillRect(mx - 130, y0 - 130, 260, 260); }
      circ(ctx, mx, y0 - 22, 26, glow ? `rgba(255,${200 + glow * 55},${100 + glow * 80},${.5 + glow / 2})` : "rgba(255,255,255,.12)", "#ccc", 2); ctx.fillStyle = "#888"; ctx.fillRect(mx - 12, y0 - 2, 24, 14);
      // switch right
      const sy = (y0 + y1) / 2; ctx.fillStyle = C.card; ctx.fillRect(x1 - 8, sy - 30, 16, 60); circ(ctx, x1, sy + 26, 5, "#fff"); circ(ctx, x1, sy - 26, 5, "#fff");
      if (s.sw === "Closed") seg(ctx, x1, sy + 26, x1, sy - 26, "#ddd", 5); else seg(ctx, x1, sy + 26, x1 + 34, sy - 16, "#ddd", 5);
      tag(ctx, x1 + 50, sy, "switch: " + s.sw.toLowerCase(), "#4a5266", "#fff", "left");
      // gap bottom
      ctx.fillStyle = C.card; ctx.fillRect(mx - 70, y1 - 10, 140, 20); const mcol = { "Copper wire": "#c87533", "Iron nail": "#999", "Aluminium foil": "#ddd", "Pencil graphite": "#444", "Salt water": "#6fa3d6", Plastic: "#ff8bd1", Wood: "#b07a43", Rubber: "#333", Glass: "#bfe6ff" }[s.mat];
      ctx.fillStyle = mcol; rr(ctx, mx - 55, y1 - 9, 110, 18, 6); ctx.fill(); tag(ctx, mx, y1 + 30, s.mat, "#24406a");
      // electrons
      if (c > 0) { const per = 2 * ((x1 - x0) + (y1 - y0)); for (let i = 0; i < 20; i++) { let d = ((i / 20) * per + s.t * 80) % per; let x, y; const w = x1 - x0, h = y1 - y0; if (d < h) { x = x0; y = y1 - d; } else if (d < h + w) { x = x0 + d - h; y = y0; } else if (d < 2 * h + w) { x = x1; y = y0 + d - h - w; } else { x = x1 - (d - 2 * h - w); y = y1; } circ(ctx, x, y, 3.5, "#ffd166"); } }
    },
    down(s, x, y, W, H) { const { x1, y0, y1 } = this.geo(W, H); if (Math.abs(x - x1) < 40 && Math.abs(y - (y0 + y1) / 2) < 40) { s.sw = s.sw === "Open" ? "Closed" : "Open"; s._sync && s._sync("sw"); return true; } },
    info(s) { const m = MATS.find(x => x[0] === s.mat), c = this.cond(s); return { f: ["A bulb lights only in a closed loop", "Conductors let current flow", "Insulators block it"], r: [["Material", m[0]], ["Type", m[1] ? "Conductor" : "Insulator"], ["Switch", s.sw], ["Bulb", c > 0.6 ? "Bright" : c > 0 ? "Dim" : "Off"]], x: s.sw === "Open" ? "The switch is open, so the loop is broken and no current flows. Close it to test the material." : m[1] ? `${m[0]} conducts electricity, completing the loop.${m[1] < .5 ? " It conducts weakly, so the bulb is dim." : ""}` : `${m[0]} is an insulator. Even with the switch closed, the loop is broken at the gap.` }; }
  };

  /* 13. MOON PHASES */
  const PH = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  L.moon = {
    controls: [{ t: "range", k: "a", label: "Moon position (day of cycle)", min: 0, max: 29.5, step: 0.5, fmt: v => "day " + fx(v, 1) }, { t: "seg", k: "play", label: "Animate orbit", opts: ["Play", "Pause"] }, { t: "hint", text: "Or drag the Moon around Earth." }],
    init: () => ({ a: 4, play: "Pause", drag: false }),
    step(s, dt) { if (s.play === "Play" && !s.drag) { s.a = (s.a + dt * 2) % 29.5; s._sync && s._sync("a"); } },
    geo(W, H) { const ox = W * (W > 560 ? 0.38 : 0.5), oy = H * (W > 560 ? 0.5 : 0.4), R = Math.min(W * (W > 560 ? 0.28 : 0.38), H * 0.33); return { ox, oy, R }; },
    draw(ctx, W, H, s) {
      const { ox, oy, R } = this.geo(W, H), ang = s.a / 29.5 * TAU, mx = ox - Math.cos(ang) * R, my = oy - Math.sin(ang) * R;
      for (let i = 0; i < 6; i++) arrow(ctx, 4, H * (i + .5) / 6, 40, H * (i + .5) / 6, "rgba(255,209,102,.6)", 2); txt(ctx, "Sunlight", 8, 14, C.y, 11, "left");
      circ(ctx, ox, oy, R, null, "rgba(255,255,255,.2)", 1);
      ball(ctx, ox, oy, 26, "#3f8fd8"); ctx.beginPath(); ctx.arc(ox, oy, 26, -Math.PI / 2, Math.PI / 2); ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fill();
      circ(ctx, mx, my, 14, "#2a2a2a"); ctx.beginPath(); ctx.arc(mx, my, 14, Math.PI / 2, Math.PI * 1.5); ctx.fillStyle = "#e8e8e8"; ctx.fill();
      tag(ctx, ox, oy + 44, "Earth", "#1f5f99"); tag(ctx, mx, my - 28, "Moon", "#4a5266");
      // view from earth
      const vx = W > 560 ? W * 0.82 : W * 0.5, vy = W > 560 ? H * 0.45 : H * 0.84, r = W > 560 ? Math.min(W * 0.13, H * 0.22) : Math.min(H * 0.11, 50);
      txt(ctx, "Seen from Earth", vx, vy - r - 18, C.mute, 12);
      this.phase(ctx, vx, vy, r, ang);
      tag(ctx, vx, vy + r + 22, this.name(s.a), "#24406a");
    },
    phase(ctx, x, y, r, ang) {
      circ(ctx, x, y, r, "#22252e"); const k = (1 - Math.cos(ang)) / 2, waxing = Math.sin(ang) >= 0;
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
      ctx.fillStyle = "#e9e6dc"; ctx.beginPath(); if (waxing) ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2); else ctx.arc(x, y, r, Math.PI / 2, Math.PI * 1.5); ctx.fill();
      const ex = Math.abs(Math.cos(ang)) * r; ctx.beginPath(); ctx.ellipse(x, y, ex, r, 0, 0, TAU); ctx.fillStyle = k < 0.5 ? "#22252e" : "#e9e6dc"; ctx.fill();
      for (let i = 0; i < 5; i++) circ(ctx, x + Math.cos(i * 2.3) * r * .5, y + Math.sin(i * 1.9) * r * .5, r * .1, "rgba(0,0,0,.08)");
      ctx.restore();
    },
    name(d) { return PH[Math.round(d / 29.5 * 8) % 8]; },
    down(s, x, y, W, H) { const { ox, oy, R } = this.geo(W, H), ang = s.a / 29.5 * TAU; if (Math.hypot(x - (ox - Math.cos(ang) * R), y - (oy - Math.sin(ang) * R)) < 30) { s.drag = true; return true; } },
    move(s, x, y, W, H) { if (!s.drag) return; const { ox, oy } = this.geo(W, H); let a = Math.atan2(oy - y, ox - x); if (a < 0) a += TAU; s.a = Math.round(a / TAU * 29.5 * 2) / 2; s._sync && s._sync("a"); return true; },
    up(s) { s.drag = false; },
    info(s) { const ang = s.a / 29.5 * TAU, k = (1 - Math.cos(ang)) / 2; return { f: ["One cycle ≈ 29.5 days", "Lit fraction = (1 − cos θ) / 2"], r: [["Phase", this.name(s.a)], ["Illuminated", fx(k * 100, 0) + "%"], ["Day", fx(s.a, 1)], ["Trend", s.a < 14.75 ? "Waxing" : "Waning"]], x: "Half of the Moon is always lit by the Sun. As it orbits Earth, we see different amounts of that lit half — that's what creates the phases." }; }
  };

  /* 14. WATER CYCLE */
  L.water = {
    controls: [{ t: "range", k: "sun", label: "Sunlight", min: 0, max: 100, step: 1, fmt: v => v + "%" }, { t: "range", k: "wind", label: "Wind towards land", min: 0, max: 100, step: 1, fmt: v => v + "%" }],
    init: () => ({ sun: 60, wind: 40, vap: [], drops: [], cloud: 0, cx: 0.25, rain: false, total: 0 }),
    step(s, dt, W, H) {
      const sea = H * 0.72; if (Math.random() < s.sun / 100 * 0.6) s.vap.push({ x: Math.random() * W * 0.45, y: sea });
      s.vap.forEach(v => { v.y -= (30 + s.sun * .4) * dt; v.x += s.wind * .3 * dt; }); const before = s.vap.length; s.vap = s.vap.filter(v => v.y > H * 0.2); s.cloud = Math.min(100, s.cloud + (before - s.vap.length) * 0.8);
      s.cx += s.wind / 100 * 0.05 * dt; if (s.cx > 0.85) s.cx = 0.85; if (s.wind < 5) s.cx = Math.max(0.25, s.cx - 0.02 * dt);
      s.rain = s.cloud > 25 && s.cx > 0.55; if (s.rain) { s.cloud = Math.max(0, s.cloud - 10 * dt); for (let i = 0; i < 3; i++) s.drops.push({ x: W * s.cx + (Math.random() - .5) * 120, y: H * 0.22 }); s.total += dt; }
      if (s.cloud < 5 && s.cx > 0.6) s.cx = 0.25;
      s.drops.forEach(d => d.y += 260 * dt); s.drops = s.drops.filter(d => d.y < H * 0.62);
    },
    draw(ctx, W, H, s) {
      const sea = H * 0.72, sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, `rgba(${40 + s.sun},${80 + s.sun},${140 + s.sun * .6},.5)`); sky.addColorStop(1, "rgba(20,30,50,.2)"); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      const sr = 26 + s.sun * .15, sg = ctx.createRadialGradient(60, 60, 4, 60, 60, sr * 2.5); sg.addColorStop(0, `rgba(255,209,102,${.4 + s.sun / 200})`); sg.addColorStop(1, "rgba(255,209,102,0)"); ctx.fillStyle = sg; ctx.fillRect(0, 0, 200, 200); circ(ctx, 60, 60, sr, "#ffd166");
      ctx.fillStyle = "#2f6db5"; ctx.fillRect(0, sea, W * 0.5, H - sea);
      ctx.fillStyle = "#3f7d3a"; ctx.beginPath(); ctx.moveTo(W * 0.45, H); ctx.lineTo(W * 0.5, sea); ctx.lineTo(W * 0.62, H * 0.55); ctx.lineTo(W * 0.78, H * 0.38); ctx.lineTo(W * 0.92, H * 0.56); ctx.lineTo(W, H * 0.6); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(W * 0.74, H * .44); ctx.lineTo(W * 0.78, H * 0.38); ctx.lineTo(W * 0.82, H * .44); ctx.fill();
      ctx.strokeStyle = "#5aa0e0"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(W * 0.78, H * 0.5); ctx.quadraticCurveTo(W * 0.62, H * 0.7, W * 0.5, sea + 4); ctx.stroke();
      s.vap.forEach(v => circ(ctx, v.x, v.y, 2.5, "rgba(200,230,255,.7)"));
      const cg = Math.min(1, s.cloud / 60), cx = W * s.cx, cy = H * 0.18, col = `rgb(${235 - cg * 110},${238 - cg * 110},${245 - cg * 100})`;
      if (s.cloud > 2) [[-40, 6, 26], [-10, -8, 34], [26, 2, 28], [50, 10, 20]].forEach(([dx, dy, r]) => circ(ctx, cx + dx, cy + dy, r * (0.6 + cg * .5), col));
      s.drops.forEach(d => seg(ctx, d.x, d.y, d.x - 2, d.y + 8, "#8ec5ff", 2));
      tag(ctx, W * 0.22, sea - 20, "Evaporation", "#1f5f99"); tag(ctx, cx, cy - 44, "Condensation", "#4a5266"); if (s.rain) tag(ctx, cx + 90, H * 0.42, "Precipitation", "#24406a"); tag(ctx, W * 0.6, H * 0.8, "Collection", "#1d6b33");
    },
    info(s) { return { f: ["Evaporation → Condensation", "→ Precipitation → Collection"], r: [["Evaporation", s.sun > 66 ? "fast" : s.sun > 25 ? "steady" : "slow"], ["Cloud water", fx(s.cloud, 0) + "%"], ["Raining", s.rain ? "Yes" : "No"], ["Rain time", fx(s.total, 0) + " s"]], x: "The Sun heats the sea and water vapour rises. High up it cools and condenses into clouds. Wind carries clouds over the mountains, where they rain, and rivers carry the water back to the sea." }; }
  };

  /* 15. SEE-SAW */
  L.seesaw = {
    controls: [{ t: "seg", k: "w", label: "Weight to place", opts: ["1 kg", "2 kg", "3 kg", "5 kg"] }, { t: "btns", items: [["Clear", s => { s.L = {}; s.R = {}; }], ["Random challenge", s => { s.L = {}; s.R = {}; s.L[1 + Math.floor(Math.random() * 4)] = [1, 2, 3, 5][Math.floor(Math.random() * 4)]; }]] }, { t: "hint", text: "Tap a spot on the plank to add or remove a weight." }],
    init: () => ({ w: "2 kg", L: { 3: 2 }, R: {}, ang: 0 }),
    torque(s) { let l = 0, r = 0; for (const k in s.L) l += s.L[k] * k; for (const k in s.R) r += s.R[k] * k; return [l, r]; },
    step(s, dt) { const [l, r] = this.torque(s), target = clamp((r - l) * 0.03, -0.32, 0.32); s.ang += (target - s.ang) * Math.min(1, dt * 4); },
    geo(W, H) { return { cx: W / 2, cy: H * 0.62, u: Math.min(W * 0.42, 420) / 4 }; },
    draw(ctx, W, H, s) {
      const { cx, cy, u } = this.geo(W, H);
      ctx.fillStyle = "#555"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 40, H - 30); ctx.lineTo(cx + 40, H - 30); ctx.fill(); seg(ctx, 0, H - 30, W, H - 30, "#444", 2);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.ang); ctx.fillStyle = "#b07a43"; rr(ctx, -4.4 * u, -10, 8.8 * u, 16, 4); ctx.fill();
      for (let i = -4; i <= 4; i++) { if (!i) continue; seg(ctx, i * u, -10, i * u, 6, "rgba(0,0,0,.35)", 1); txt(ctx, String(Math.abs(i)), i * u, 18, C.mute, 11); }
      const box = (x, m) => { const sz = 18 + m * 5; ctx.fillStyle = "#2f6db5"; rr(ctx, x - sz / 2, -10 - sz, sz, sz, 4); ctx.fill(); txt(ctx, m + "kg", x, -10 - sz / 2, "#fff", 11, "center", 800); };
      for (const k in s.L) box(-k * u, s.L[k]); for (const k in s.R) box(k * u, s.R[k]); ctx.restore();
      const [l, r] = this.torque(s); tag(ctx, cx, 30, Math.abs(l - r) < 1e-9 ? "Balanced!" : l > r ? "Left side goes down" : "Right side goes down", Math.abs(l - r) < 1e-9 ? "#1d6b33" : "#8a2c3a");
    },
    down(s, x, y, W, H) { const { cx, cy, u } = this.geo(W, H), dx = x - cx, dy = y - cy, lx = dx * Math.cos(-s.ang) - dy * Math.sin(-s.ang), ly = dx * Math.sin(-s.ang) + dy * Math.cos(-s.ang); if (ly > 30 || ly < -60) return; const i = Math.round(lx / u); if (!i || Math.abs(i) > 4) return; const side = i < 0 ? s.L : s.R, k = Math.abs(i); if (side[k]) delete side[k]; else side[k] = parseInt(s.w); return true; },
    info(s) { const [l, r] = this.torque(s); return { f: ["Moment = weight × distance", "Balanced when left moments = right moments"], r: [["Left moment", l + " kg·units"], ["Right moment", r + " kg·units"], ["Difference", Math.abs(l - r)], ["Status", l === r ? "Balanced" : "Tilted"]], x: "A light weight far from the middle can balance a heavy weight close to it. Try 2 kg at 3 on the left against 3 kg at 2 on the right." }; }
  };

  /* 16. SOLAR SYSTEM */
  const PLN = [["Mercury", 88, 0.39, "#b1b1b1", 3], ["Venus", 225, 0.72, "#e3c07a", 5], ["Earth", 365, 1, "#3f8fd8", 5], ["Mars", 687, 1.52, "#c1440e", 4], ["Jupiter", 4333, 5.2, "#d4a373", 10], ["Saturn", 10759, 9.58, "#e6c79c", 9], ["Uranus", 30687, 19.2, "#88d5e8", 7], ["Neptune", 60190, 30.1, "#4b70dd", 7]];
  L.solar = {
    controls: [{ t: "range", k: "speed", label: "Speed (Earth days per second)", min: 5, max: 400, step: 5, fmt: v => v + " d/s" }, { t: "seg", k: "orb", label: "Orbits", opts: ["Show", "Hide"] }, { t: "pause" }, { t: "hint", text: "Tap a planet to see its facts." }],
    init: () => ({ speed: 60, orb: "Show", days: 0, sel: 2 }),
    step(s, dt) { s.days += s.speed * dt; },
    pos(i, W, H, d) { const p = PLN[i], R = (Math.min(W, H) / 2 - 18) * (Math.sqrt(p[2]) / Math.sqrt(30.1)) + 26, a = d / p[1] * TAU; return [W / 2 + Math.cos(a) * R, H / 2 - Math.sin(a) * R * 0.9, R]; },
    draw(ctx, W, H, s) {
      const g = ctx.createRadialGradient(W / 2, H / 2, 3, W / 2, H / 2, 40); g.addColorStop(0, "#fff7c2"); g.addColorStop(.4, "#ffb347"); g.addColorStop(1, "rgba(255,140,40,0)"); ctx.fillStyle = g; ctx.fillRect(W / 2 - 40, H / 2 - 40, 80, 80);
      for (let i = 0; i < 40; i++) circ(ctx, (i * 97) % W, (i * 53) % H, 0.8, "rgba(255,255,255,.4)");
      PLN.forEach((p, i) => { const [x, y, R] = this.pos(i, W, H, s.days); if (s.orb === "Show") { ctx.beginPath(); ctx.ellipse(W / 2, H / 2, R, R * 0.9, 0, 0, TAU); ctx.strokeStyle = i === s.sel ? "rgba(255,144,77,.6)" : "rgba(255,255,255,.12)"; ctx.lineWidth = 1; ctx.stroke(); } ball(ctx, x, y, p[4], p[3]); if (p[0] === "Saturn") { ctx.beginPath(); ctx.ellipse(x, y, 15, 4, -0.3, 0, TAU); ctx.strokeStyle = "#e6c79c"; ctx.stroke(); } if (i === s.sel) tag(ctx, x, y - 20, p[0], "#b0521d"); });
      tag(ctx, 16, 24, "Earth years: " + fx(s.days / 365, 1), "rgba(0,0,0,.5)", "#fff", "left");
    },
    down(s, x, y, W, H) { let best = -1, bd = 30; PLN.forEach((p, i) => { const [px, py] = this.pos(i, W, H, s.days), d = Math.hypot(x - px, y - py); if (d < bd) { bd = d; best = i; } }); if (best >= 0) { s.sel = best; return true; } },
    info(s) { const p = PLN[s.sel]; return { f: ["Kepler: T² ∝ r³", "Farther planets move slower and travel farther"], r: [["Planet", p[0]], ["Year length", p[1].toLocaleString("en-IN") + " days"], ["Distance", p[2] + " AU"], ["Its years passed", fx(s.days / p[1], 2)]], x: `${p[0]} takes ${p[1] >= 365 ? fx(p[1] / 365, 1) + " Earth years" : p[1] + " Earth days"} to go once around the Sun. 1 AU is the Earth–Sun distance, about 150 million km. (Distances here are squeezed to fit the screen.)` }; }
  };

  /* 17. CELL EXPLORER */
  const PARTS = {
    nucleus: ["Nucleus", "The control centre. It holds DNA, the instructions for everything the cell does.", "#8b5cf6"],
    mito: ["Mitochondria", "The powerhouse. It releases energy from food during respiration.", "#ff904d"],
    membrane: ["Cell membrane", "A thin, flexible layer that controls what enters and leaves the cell.", "#6fa3d6"],
    cyto: ["Cytoplasm", "Jelly-like fluid where most of the cell's chemical reactions happen.", "#3ecf8e"],
    vacuole: ["Vacuole", "Stores water and nutrients. In plant cells it is large and keeps the cell firm.", "#5ad1e6"],
    chloro: ["Chloroplast", "Contains chlorophyll and makes food by photosynthesis (plant cells only).", "#4caf50"],
    wall: ["Cell wall", "A rigid outer layer of cellulose that supports and protects plant cells.", "#c9a227"],
    er: ["Endoplasmic reticulum", "A network of tubes that makes and carries proteins and fats.", "#ec4899"],
    golgi: ["Golgi apparatus", "Packs and ships proteins to where they are needed.", "#f59e0b"],
    ribo: ["Ribosomes", "Tiny dots that build proteins.", "#e5e7eb"]
  };
  L.cell = {
    controls: [{ t: "seg", k: "type", label: "Cell type", opts: ["Animal", "Plant"] }, { t: "seg", k: "auto", label: "Spin", opts: ["On", "Off"] }, { t: "hint", text: "Tap a part to learn about it. Drag to spin." }],
    init: () => ({ type: "Animal", auto: "On", rot: 0, sel: "nucleus", drag: false }),
    step(s, dt) { if (s.auto === "On" && !s.drag) s.rot += dt * 0.4; },
    items(s) { const pl = s.type === "Plant"; const it = [["nucleus", -0.15, -0.1, 0.1, 0.24], ["mito", 0.45, 0.3, 0.3, 0.1], ["mito", -0.5, 0.35, -0.3, 0.1], ["er", 0.15, -0.35, -0.2, 0.12], ["golgi", -0.45, -0.3, 0.25, 0.1], ["ribo", 0.55, -0.1, 0.1, 0.04], ["ribo", 0.3, 0.55, -0.3, 0.04]]; if (pl) { it.push(["vacuole", 0.25, 0.15, 0, 0.3], ["chloro", -0.55, 0.05, 0.3, 0.09], ["chloro", 0.6, -0.4, -0.2, 0.09], ["chloro", -0.2, 0.6, 0.3, 0.09]); } else it.push(["vacuole", 0.3, 0.2, 0.2, 0.08]); return it; },
    proj(s, W, H) { const R = Math.min(W, H) * 0.38, cx = W / 2, cy = H / 2; return this.items(s).map(([k, x, y, z, r]) => { const X = x * Math.cos(s.rot) + z * Math.sin(s.rot), Z = -x * Math.sin(s.rot) + z * Math.cos(s.rot), p = 1 + Z * 0.25; return { k, x: cx + X * R, y: cy + y * R, z: Z, r: r * R * p }; }).sort((a, b) => a.z - b.z); },
    draw(ctx, W, H, s) {
      const R = Math.min(W, H) * 0.38, cx = W / 2, cy = H / 2, pl = s.type === "Plant";
      if (pl) { const w = R * (0.75 + 0.25 * Math.abs(Math.cos(s.rot))); ctx.fillStyle = "#c9a22744"; rr(ctx, cx - w - 10, cy - R - 10, 2 * w + 20, 2 * R + 20, 26); ctx.fill(); ctx.strokeStyle = s.sel === "wall" ? "#fff" : "#c9a227"; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = "#3ecf8e22"; rr(ctx, cx - w, cy - R, 2 * w, 2 * R, 20); ctx.fill(); ctx.strokeStyle = s.sel === "membrane" ? "#fff" : C.bl; ctx.lineWidth = 3; ctx.stroke(); }
      else { const g = ctx.createRadialGradient(cx - R * .3, cy - R * .3, R * .1, cx, cy, R); g.addColorStop(0, "rgba(62,207,142,.25)"); g.addColorStop(1, "rgba(62,207,142,.08)"); circ(ctx, cx, cy, R, g, s.sel === "membrane" ? "#fff" : C.bl, 3); }
      this.proj(s, W, H).forEach(o => { const col = PARTS[o.k][2]; if (o.k === "vacuole") { circ(ctx, o.x, o.y, o.r, col + "55", col, 2); } else if (o.k === "mito" || o.k === "chloro") { ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r * 1.6, o.r, 0.4, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = shade(col, -.4); ctx.lineWidth = 2; ctx.stroke(); } else if (o.k === "er" || o.k === "golgi") { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(o.x, o.y + i * o.r * .45, o.r * 1.5 - i * 3, o.r * .25, 0, 0, TAU); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); } } else if (o.k === "ribo") { for (let i = 0; i < 6; i++) circ(ctx, o.x + Math.cos(i) * o.r * 3, o.y + Math.sin(i * 2) * o.r * 3, 2.5, col); } else ball(ctx, o.x, o.y, o.r, col); if (s.sel === o.k) circ(ctx, o.x, o.y, o.r * (o.k === "ribo" ? 4 : 1.8) + 4, null, "#fff", 2); });
      tag(ctx, W / 2, 22, PARTS[s.sel][0], "#24406a");
    },
    down(s, x, y, W, H) {
      s.drag = true; s.lx = x; s.moved = false;
      return true;
    },
    move(s, x) { if (!s.drag) return; if (Math.abs(x - s.lx) > 3) s.moved = true; s.rot += (x - s.lx) * 0.01; s.lx = x; return true; },
    up(s, x, y, W, H) {
      s.drag = false; if (s.moved) return;
      const hit = this.proj(s, W, H).reverse().find(o => Math.hypot(x - o.x, y - o.y) < Math.max(o.r * (o.k === "ribo" ? 4 : 1.5), 14));
      if (hit) s.sel = hit.k; else { const R = Math.min(W, H) * 0.38, d = Math.hypot(x - W / 2, y - H / 2); s.sel = s.type === "Plant" && d > R * 0.95 ? "wall" : d > R * 0.9 && d < R * 1.08 ? "membrane" : d < R ? "cyto" : s.sel; }
    },
    info(s) { const p = PARTS[s.sel]; return { f: ["Plant cells: wall + chloroplasts + big vacuole", "Animal cells: no wall, no chloroplasts"], r: [["Cell", s.type], ["Selected", p[0]]], x: p[1] }; }
  };

  /* 18. PHOTOSYNTHESIS LEAF */
  L.leaf = {
    controls: [{ t: "range", k: "light", label: "Light", min: 0, max: 100, step: 1, fmt: v => v + "%" }, { t: "range", k: "water", label: "Water", min: 0, max: 100, step: 1, fmt: v => v + "%" }, { t: "range", k: "co2", label: "Carbon dioxide", min: 0, max: 100, step: 1, fmt: v => v + "%" }],
    init: () => ({ light: 70, water: 60, co2: 50, o2: [], co: [], made: 0 }),
    rate: s => Math.min(s.light, s.water, s.co2) / 100,
    step(s, dt, W, H) {
      const r = this.rate(s); if (Math.random() < r * 0.5) s.o2.push({ x: W * 0.55 + (Math.random() - .5) * 120, y: H * 0.5, v: 30 + Math.random() * 30 });
      if (Math.random() < s.co2 / 100 * 0.4) s.co.push({ x: W * 0.95, y: H * (0.3 + Math.random() * 0.4) });
      s.o2.forEach(b => { b.y -= b.v * dt; b.x += Math.sin(b.y / 20) * .5; }); s.o2 = s.o2.filter(b => b.y > -10);
      s.co.forEach(b => { b.x -= 60 * dt; }); s.co = s.co.filter(b => b.x > W * 0.6); s.made += r * dt;
    },
    draw(ctx, W, H, s) {
      const r = this.rate(s), lx = W * 0.5, ly = H * 0.55;
      const sg = ctx.createRadialGradient(40, 40, 4, 40, 40, 90 + s.light * 2); sg.addColorStop(0, `rgba(255,209,102,${s.light / 100})`); sg.addColorStop(1, "rgba(255,209,102,0)"); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H); circ(ctx, 40, 40, 22, s.light ? "#ffd166" : "#555");
      for (let i = 0; i < 4 && s.light; i++) arrow(ctx, 70 + i * 10, 70 + i * 25, lx - 80 + i * 20, ly - 60 + i * 10, `rgba(255,209,102,${s.light / 140})`, 2);
      seg(ctx, lx, ly + 40, lx - 20, H, "#3f7d3a", 8);
      ctx.fillStyle = `rgb(${60 - r * 20},${120 + r * 80},${60})`; ctx.beginPath(); ctx.moveTo(lx - W * 0.22, ly); ctx.quadraticCurveTo(lx, ly - H * 0.4, lx + W * 0.22, ly); ctx.quadraticCurveTo(lx, ly + H * 0.25, lx - W * 0.22, ly); ctx.fill();
      seg(ctx, lx - W * 0.2, ly, lx + W * 0.2, ly, "rgba(255,255,255,.35)", 2);
      for (let i = 1; i < 5; i++) { seg(ctx, lx - W * 0.2 + i * W * 0.08, ly, lx - W * 0.16 + i * W * 0.08, ly - 30, "rgba(255,255,255,.2)", 1.5); }
      // water from stem
      for (let i = 0; i < 6 && s.water; i++) circ(ctx, lx - 20 + (i / 6) * 20, H - ((i * 30 + performance.now() / 20 * s.water / 100) % (H - ly)), 3, "#8ec5ff");
      s.o2.forEach(b => { circ(ctx, b.x, b.y, 7, "rgba(62,207,142,.35)", C.ok); txt(ctx, "O₂", b.x, b.y, "#fff", 8, "center", 800); });
      s.co.forEach(b => { circ(ctx, b.x, b.y, 8, "rgba(170,170,170,.3)", "#aaa"); txt(ctx, "CO₂", b.x, b.y, "#fff", 7, "center", 800); });
      tag(ctx, W - 70, H * 0.22, "CO₂ in", "#4a5266"); tag(ctx, lx + 80, 24, "O₂ out", "#1d6b33"); tag(ctx, lx - 70, H - 20, "water up", "#1f5f99");
    },
    info(s) { const r = this.rate(s), lim = [["light", s.light], ["water", s.water], ["carbon dioxide", s.co2]].sort((a, b) => a[1] - b[1])[0][0]; return { f: ["carbon dioxide + water", "—(light, chlorophyll)→", "glucose + oxygen"], r: [["Rate", fx(r * 100, 0) + "%"], ["Limiting factor", lim], ["Glucose made", fx(s.made, 1) + " units"], ["O₂ bubbles", s.o2.length]], x: r === 0 ? "Photosynthesis has stopped — the leaf needs light, water and carbon dioxide all at once." : `The rate is held back by the scarcest input: ${lim}. Raise it to see more oxygen bubbles.` }; }
  };

  /* 19. OCEAN EXPLORER */
  const ZONES = [[0, 200, "Sunlight zone", "#2e86de"], [200, 1000, "Twilight zone", "#1b4f8a"], [1000, 4000, "Midnight zone", "#0d2340"], [4000, 6000, "Abyss", "#060f1f"], [6000, 11000, "Hadal (trench)", "#02060d"]];
  const FISH = { "Sunlight zone": [["Clownfish", "#ff8c42"], ["Tuna", "#7aa7d9"], ["Sea turtle", "#5aa469"]], "Twilight zone": [["Lanternfish", "#9ad1ff"], ["Squid", "#e07a5f"], ["Swordfish", "#8d99ae"]], "Midnight zone": [["Anglerfish", "#6b5b95"], ["Gulper eel", "#3d405b"], ["Vampire squid", "#9b2335"]], Abyss: [["Tripod fish", "#bdbdbd"], ["Sea cucumber", "#c08497"], ["Dumbo octopus", "#f4a259"]], "Hadal (trench)": [["Snailfish", "#e5e5e5"], ["Amphipod", "#f2cc8f"], ["Xenophyophore", "#a5a58d"]] };
  L.ocean = {
    controls: [{ t: "range", k: "d", label: "Depth", min: 0, max: 11000, step: 50, fmt: v => v.toLocaleString("en-IN") + " m" }, { t: "btn", label: "Feed the fish", act: s => { for (let i = 0; i < 12; i++) s.food.push({ x: 0.2 + Math.random() * 0.6, y: 0.05 + Math.random() * .1 }); } }],
    init: () => ({ d: 50, food: [], fish: [], fed: 0, zone: null }),
    zone: d => ZONES.find(z => d >= z[0] && d < z[1]) || ZONES[4],
    step(s, dt) {
      const z = this.zone(s.d); if (s.zone !== z[2]) { s.zone = z[2]; s.fish = FISH[z[2]].flatMap((f, i) => [0, 1].map(j => ({ n: f[0], c: f[1], x: Math.random(), y: 0.25 + Math.random() * 0.6, vx: (Math.random() < .5 ? -1 : 1) * (0.03 + Math.random() * .05), ph: Math.random() * 6 }))); }
      s.food.forEach(f => f.y += 0.05 * dt);
      s.fish.forEach(f => { const tgt = s.food.reduce((b, fd) => { const d = Math.hypot(fd.x - f.x, fd.y - f.y); return d < (b ? b.d : 0.35) ? { fd, d } : b; }, null); if (tgt) { f.vx = Math.sign(tgt.fd.x - f.x) * 0.12; f.y += (tgt.fd.y - f.y) * dt * 1.5; if (tgt.d < 0.03) { s.food.splice(s.food.indexOf(tgt.fd), 1); s.fed++; } } f.x += f.vx * dt; f.ph += dt * 4; if (f.x < 0.03 || f.x > 0.97) f.vx *= -1; f.x = clamp(f.x, 0.03, 0.97); });
      s.food = s.food.filter(f => f.y < 1);
    },
    draw(ctx, W, H, s) {
      const z = this.zone(s.d), light = Math.max(0, 1 - s.d / 1000);
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, shade(z[3], light * 0.2)); g.addColorStop(1, shade(z[3], -0.3)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (light > 0) for (let i = 0; i < 5; i++) { ctx.fillStyle = `rgba(255,255,255,${0.05 * light})`; ctx.beginPath(); ctx.moveTo(W * (0.1 + i * 0.2), 0); ctx.lineTo(W * (0.15 + i * 0.2), 0); ctx.lineTo(W * (0.05 + i * 0.2), H); ctx.lineTo(W * (i * 0.2 - 0.02), H); ctx.fill(); }
      for (let i = 0; i < 25; i++) circ(ctx, (i * 131 + performance.now() / 40) % W, H - ((i * 71 + performance.now() / 30) % H), 1.5, "rgba(255,255,255,.25)");
      s.food.forEach(f => circ(ctx, f.x * W, f.y * H, 3, "#f2cc8f"));
      s.fish.forEach(f => { const x = f.x * W, y = f.y * H + Math.sin(f.ph) * 4, dir = Math.sign(f.vx) || 1, glow = s.d > 1000; ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); if (glow) { const gg = ctx.createRadialGradient(18, -8, 1, 18, -8, 18); gg.addColorStop(0, "rgba(160,255,240,.9)"); gg.addColorStop(1, "rgba(160,255,240,0)"); ctx.fillStyle = gg; ctx.fillRect(0, -26, 36, 36); } ctx.fillStyle = f.c; ctx.beginPath(); ctx.ellipse(0, 0, 18, 9, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-26, -8); ctx.lineTo(-26, 8); ctx.fill(); circ(ctx, 9, -2, 2.5, "#fff"); circ(ctx, 9.5, -2, 1.2, "#000"); ctx.restore(); txt(ctx, f.n, x, y + 18, "rgba(255,255,255,.75)", 10); });
      // depth gauge
      const gx = W - 26; seg(ctx, gx, 20, gx, H - 20, "rgba(255,255,255,.25)", 3); ZONES.forEach(zz => { const y = 20 + (zz[0] / 11000) * (H - 40); seg(ctx, gx - 6, y, gx + 6, y, "rgba(255,255,255,.4)", 1); }); circ(ctx, gx, 20 + s.d / 11000 * (H - 40), 7, C.or);
      tag(ctx, 16, 24, z[2], "rgba(0,0,0,.45)", "#fff", "left");
    },
    info(s) { const z = this.zone(s.d), light = Math.max(0, 1 - s.d / 1000), temp = s.d < 200 ? 25 - s.d / 40 : s.d < 1000 ? 20 - (s.d - 200) / 50 : 4 - Math.min(2, (s.d - 1000) / 3000); return { f: ["Pressure ≈ 1 atm + 1 atm per 10 m", "Sunlight fades out by ~1,000 m"], r: [["Zone", z[2]], ["Pressure", Math.round(1 + s.d / 10).toLocaleString("en-IN") + " atm"], ["Temperature", fx(temp, 0) + " °C"], ["Sunlight", fx(light * 100, 0) + "%"]], x: { "Sunlight zone": "Most ocean life lives here, where sunlight lets plankton photosynthesise.", "Twilight zone": "Only faint blue light reaches here. Many animals migrate up at night to feed.", "Midnight zone": "Total darkness. Many animals make their own light — this is called bioluminescence.", Abyss: "Near-freezing and crushing pressure. Food drifts down from above as 'marine snow'.", "Hadal (trench)": "The deepest trenches, over 6 km down. Only a few specially adapted animals survive." }[z[2]] + ` Fish fed: ${s.fed}.` }; }
  };

  NS.LABDEFS = L;
  NS.LABDATA = { PLANETS, EL, shells, MOL, ACOL, OBJ, MITEMS, MATS, PLN, PARTS, ZONES, FISH, PH };

  /* ---------- ENGINE ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  NS.mountLab = function (root, id, opts = {}) {
    const def = L[id], s = def.init(); s.paused = false;
    root.innerHTML = `<div class="live"><b>LIVE EXPERIMENT</b><button class="btn btn-dark btn-sm" data-fs>⤢ Full screen</button></div>
      <div class="lab"><div class="stage" style="min-height:${opts.h || 440}px"><canvas></canvas></div>
      <div class="side"><div class="ctls"></div><div class="info"><h4>Information</h4><div class="formula"></div><div class="readouts"></div><p class="explain"></p>${opts.ask ? '<button class="btn btn-ghost btn-sm" data-ask style="margin-top:12px">Ask Nova about this lab</button>' : ""}</div></div></div>`;
    const stage = root.querySelector(".stage"), cv = stage.querySelector("canvas"), ctx = cv.getContext("2d"), ctls = root.querySelector(".ctls");
    let W = 0, H = 0, raf, last = performance.now(), lastInfo = 0, dead = false;
    const syncers = {};
    s._sync = k => syncers[k] && syncers[k]();
    def.controls.forEach(c => {
      const box = document.createElement("div"); box.className = "ctl";
      if (c.t === "range") { box.innerHTML = `<label>${esc(c.label)} <em></em></label><input type="range" min="${c.min}" max="${c.max}" step="${c.step}" aria-label="${esc(c.label)}">`; const inp = box.querySelector("input"), em = box.querySelector("em"); const sync = () => { inp.value = s[c.k]; em.textContent = c.fmt(+s[c.k]); }; syncers[c.k] = sync; sync(); inp.oninput = () => { s[c.k] = +inp.value; em.textContent = c.fmt(+inp.value); def.reset && def.reset(s, c.k); }; }
      else if (c.t === "seg") { box.innerHTML = `<label>${esc(c.label)}</label><div class="seg">${c.opts.map(o => `<button type="button" data-v="${esc(o)}">${esc(o)}</button>`).join("")}</div>`; const sync = () => box.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.v === s[c.k])); syncers[c.k] = sync; sync(); box.onclick = e => { const b = e.target.closest("button"); if (!b) return; s[c.k] = b.dataset.v; sync(); def.reset && def.reset(s, c.k); }; }
      else if (c.t === "pause") { box.innerHTML = `<button type="button" class="btn btn-ghost" style="width:100%">❚❚ Pause</button>`; const b = box.firstChild; b.onclick = () => { s.paused = !s.paused; b.textContent = s.paused ? "▶ Play" : "❚❚ Pause"; }; }
      else if (c.t === "btn") { box.innerHTML = `<button type="button" class="btn btn-dark" style="width:100%">${esc(c.label)}</button>`; box.firstChild.onclick = () => { c.act(s); Object.values(syncers).forEach(f => f()); }; }
      else if (c.t === "btns") { box.innerHTML = `<div class="seg">${c.items.map((it, i) => `<button type="button" data-i="${i}">${esc(it[0])}</button>`).join("")}</div>`; box.onclick = e => { const b = e.target.closest("button"); if (!b) return; c.items[b.dataset.i][1](s); Object.values(syncers).forEach(f => f()); }; }
      else if (c.t === "hold") { box.innerHTML = `<button type="button" class="btn btn-or" style="width:100%;border-radius:8px">${esc(c.label)}</button>`; const b = box.firstChild; const on = e => { e.preventDefault(); s[c.k] = true; }, off = () => { s[c.k] = false; }; b.addEventListener("pointerdown", on); ["pointerup", "pointerleave", "pointercancel"].forEach(ev => b.addEventListener(ev, off)); b.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") s[c.k] = true; }); b.addEventListener("keyup", off); }
      else if (c.t === "hint") { box.className = "tiny"; box.textContent = c.text; }
      else if (c.t === "drops") { box.innerHTML = `<label>${esc(c.label)}</label><div class="seg">${c.items.map(n => `<button type="button" data-n="${esc(n)}">${esc(n)}</button>`).join("")}</div>`; box.onclick = e => { const b = e.target.closest("button"); if (b) def.drop(s, b.dataset.n, W); }; }
      else if (c.t === "predict") { box.innerHTML = `<label>Will the magnet pull it?</label><div class="seg"><button type="button" data-g="1">Yes, it will</button><button type="button" data-g="0">No, it won't</button></div>`; box.onclick = e => { const b = e.target.closest("button"); if (b) def.guess(s, +b.dataset.g); }; }
      ctls.appendChild(box);
    });
    const resize = () => { const r = stage.getBoundingClientRect(), d = window.devicePixelRatio || 1; W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    const ro = new ResizeObserver(resize); ro.observe(stage); resize();
    const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener("pointerdown", e => { if (def.down && def.down(s, ...pt(e), W, H)) { cv.setPointerCapture(e.pointerId); Object.values(syncers).forEach(f => f()); } });
    cv.addEventListener("pointermove", e => { if (def.move && def.move(s, ...pt(e), W, H)) Object.values(syncers).forEach(f => f()); });
    cv.addEventListener("pointerup", e => { def.up && def.up(s, ...pt(e), W, H); });
    root.querySelector("[data-fs]").onclick = () => { stage.classList.toggle("fs"); setTimeout(resize, 50); };
    document.addEventListener("keydown", function k(e) { if (e.key === "Escape") stage.classList.remove("fs"); if (dead) document.removeEventListener("keydown", k); });
    if (opts.ask) root.querySelector("[data-ask]").onclick = () => { const i = def.info(s); opts.ask(`I'm using the ${NS.LABS.find(l => l.id === id).name} lab. Current readings: ${i.r.map(r => r[0] + " " + r[1]).join(", ")}. Can you explain what is happening and why?`); };
    const fEl = root.querySelector(".formula"), rEl = root.querySelector(".readouts"), xEl = root.querySelector(".explain");
    let lastF = "", lastR = "", lastX = "";
    const loop = now => {
      if (dead) return; const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (W > 0 && H > 0) { if (!s.paused && def.step) def.step(s, dt, W, H); ctx.clearRect(0, 0, W, H); try { def.draw(ctx, W, H, s); } catch (err) { console.error(err); } }
      if (now - lastInfo > 200) { lastInfo = now; const i = def.info(s); const f = i.f.map(esc).join("<br>"), r = i.r.map(([a, b]) => `<div class="ro"><small>${esc(a)}</small><b>${esc(b)}</b></div>`).join(""); if (f !== lastF) fEl.innerHTML = lastF = f; if (r !== lastR) rEl.innerHTML = lastR = r; if (i.x !== lastX) xEl.textContent = lastX = i.x; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return { destroy() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); }, state: s };
  };

  /* static thumbnail for lab cards */
  NS.thumbLab = function (cv, id) {
    const def = L[id], s = def.init(), d = window.devicePixelRatio || 1, W = cv.clientWidth || 300, H = cv.clientHeight || 140;
    cv.width = W * d; cv.height = H * d; const ctx = cv.getContext("2d"); ctx.setTransform(d, 0, 0, d, 0, 0);
    s._sync = () => { };
    const k = 0.55, w = W / k, h = H / k;
    try { if (id === "float") { ["Wooden block", "Coin", "Apple"].forEach(n => def.drop(s, n, w)); } for (let i = 0; i < 40; i++) def.step && def.step(s, 1 / 30, w, h); ctx.save(); ctx.scale(k, k); def.draw(ctx, w, h, s); ctx.restore(); } catch (e) { console.error(id, e); }
  };
})();
