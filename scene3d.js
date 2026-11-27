/* NovaSchool — WebGL scroll journey for the landing page (Three.js r128, bundled in /vendor).
   A glowing "knowledge core" with orbiting electrons sits beside the hero; scrolling flies the
   camera through a particle tunnel past floating subject shapes. Falls back silently if WebGL
   or the library is unavailable, and never runs with reduced motion. */
(function () {
  const NS = window.NS;
  let threeP = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threeP) return threeP;
    threeP = new Promise((res, rej) => { const s = document.createElement("script"); s.src = "vendor/three.min.js"; s.onload = () => window.THREE ? res(window.THREE) : rej(); s.onerror = rej; document.head.appendChild(s); });
    return threeP;
  }

  NS.mountScene3D = function () {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => { };
    let dead = false, stop = () => { };
    const cv = document.createElement("canvas"); cv.className = "scene3d"; cv.setAttribute("aria-hidden", "true");
    document.body.prepend(cv);
    loadThree().then(THREE => {
      if (dead) return;
      try { stop = build(THREE, cv); document.body.classList.add("has3d"); }
      catch (e) { console.warn("3D scene disabled:", e); cv.remove(); }
    }).catch(() => cv.remove());
    return () => { dead = true; try { stop(); } catch { } cv.remove(); document.body.classList.remove("has3d"); };
  };

  function build(THREE, cv) {
    const TAU = Math.PI * 2;
    const renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f1628, 0.042);
    const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    const size = () => { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); addEventListener("resize", size);

    const OR = new THREE.Color(0xff904d), BL = new THREE.Color(0x6fa3d6), tmp = new THREE.Color();
    const disposables = [];
    const keep = o => { disposables.push(o); return o; };

    /* knowledge core */
    const core = new THREE.Group(); scene.add(core);
    const ico = keep(new THREE.IcosahedronGeometry(1.5, 1));
    const solidMat = keep(new THREE.MeshStandardMaterial({ color: 0x15213d, metalness: 0.65, roughness: 0.25, emissive: 0x0a1222, flatShading: true }));
    core.add(new THREE.Mesh(ico, solidMat));
    const edgeMat = keep(new THREE.LineBasicMaterial({ color: 0xff904d, transparent: true, opacity: 0.95 }));
    const edges = new THREE.LineSegments(keep(new THREE.EdgesGeometry(ico)), edgeMat); edges.scale.setScalar(1.003); core.add(edges);
    const shellMat = keep(new THREE.LineBasicMaterial({ color: 0x6fa3d6, transparent: true, opacity: 0.35 }));
    const shell = new THREE.LineSegments(keep(new THREE.EdgesGeometry(keep(new THREE.IcosahedronGeometry(2.35, 0)))), shellMat); core.add(shell);
    const dotMat = keep(new THREE.PointsMaterial({ color: 0xffd2a8, size: 0.1, transparent: true, opacity: 0.95, depthWrite: false }));
    core.add(new THREE.Points(ico, dotMat));
    const orbits = [];
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group(); g.rotation.set(Math.PI / 2 + (i - 1) * 0.85, i * 1.05, 0);
      const r = 2.9 + i * 0.38;
      g.add(new THREE.Mesh(keep(new THREE.TorusGeometry(r, 0.012, 8, 180)), keep(new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff904d : 0x6fa3d6, transparent: true, opacity: 0.55 }))));
      const e = new THREE.Mesh(keep(new THREE.SphereGeometry(0.1, 16, 16)), keep(new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffb27a : 0xbfe0ff })));
      g.add(e); core.add(g); orbits.push({ e, r, s: 0.55 + i * 0.3 });
    }

    /* lights */
    scene.add(new THREE.AmbientLight(0x6677aa, 0.55));
    const l1 = new THREE.PointLight(0xff904d, 2.4, 40); l1.position.set(4, 3, 6); scene.add(l1);
    const l2 = new THREE.PointLight(0x4f86c0, 2.4, 40); l2.position.set(-5, -2, 4); scene.add(l2);

    /* particle tunnel */
    const N = innerWidth < 700 ? 1500 : 2800, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * TAU, r = 3 + Math.random() * 10, z = 12 - Math.random() * 100;
      pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.sin(a) * r * 0.7; pos[i * 3 + 2] = z;
      tmp.copy(OR).lerp(BL, Math.random()); col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    const pg = keep(new THREE.BufferGeometry());
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3)); pg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pm = keep(new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
    const stars = new THREE.Points(pg, pm); scene.add(stars);

    /* floating subject shapes along the flight path */
    const geos = [new THREE.TetrahedronGeometry(0.6), new THREE.OctahedronGeometry(0.6), new THREE.TorusKnotGeometry(0.38, 0.12, 90, 12), new THREE.DodecahedronGeometry(0.55), new THREE.TorusGeometry(0.45, 0.16, 14, 48), new THREE.BoxGeometry(0.75, 0.75, 0.75)].map(keep);
    const shapes = [];
    for (let i = 0; i < 22; i++) {
      const c = i % 3 === 0 ? 0xff904d : i % 3 === 1 ? 0x6fa3d6 : 0x3ecf8e;
      const wire = i % 2 === 0;
      const mat = keep(wire ? new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: 0.7 }) : new THREE.MeshStandardMaterial({ color: c, metalness: 0.4, roughness: 0.35, emissive: c, emissiveIntensity: 0.15, flatShading: true }));
      const m = new THREE.Mesh(geos[i % geos.length], mat);
      const side = i % 2 ? 1 : -1;
      m.position.set(side * (3 + Math.random() * 3.5), (Math.random() - 0.5) * 5, -4 - i * 3.6);
      m.userData = { sx: (Math.random() - .5) * 1.2, sy: (Math.random() - .5) * 1.2, b: Math.random() * TAU };
      scene.add(m); shapes.push(m);
    }

    /* input */
    const tgt = { x: 0, y: 0 }, m = { x: 0, y: 0 };
    const onMove = e => { tgt.x = e.clientX / innerWidth - 0.5; tgt.y = e.clientY / innerHeight - 0.5; };
    addEventListener("pointermove", onMove, { passive: true });
    let visible = !document.hidden; const onVis = () => { visible = !document.hidden; }; document.addEventListener("visibilitychange", onVis);

    const clock = new THREE.Clock(); let raf = 0, smoothP = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop); if (!visible) return;
      const t = clock.getElapsedTime();
      const H = document.documentElement.scrollHeight - innerHeight, p = H > 0 ? Math.min(1, scrollY / H) : 0;
      smoothP += (p - smoothP) * 0.08;
      m.x += (tgt.x - m.x) * 0.05; m.y += (tgt.y - m.y) * 0.05;
      const wide = innerWidth > 860, hp = Math.min(1, scrollY / Math.max(1, innerHeight));
      const camZ = 8 - smoothP * 72;
      cam.position.set(m.x * 1.2, -m.y * 0.8, camZ);
      cam.lookAt(m.x * 0.4, -m.y * 0.2, camZ - 12);
      cam.rotation.z = Math.sin(smoothP * Math.PI * 3) * 0.06;

      // core: right of the hero, then travels with the camera, swaying side to side
      const heroX = wide ? 2.7 : 0, heroY = wide ? 0.1 : -2.9;
      const travelX = Math.sin(smoothP * Math.PI * 5) * (wide ? 3.2 : 1.2);
      core.position.set(heroX * (1 - hp) + travelX * hp, heroY * (1 - hp) + Math.sin(t * 0.8) * 0.15, (camZ - 8) * hp + 0 * (1 - hp));
      core.rotation.set(t * 0.12 + smoothP * 3, t * 0.25 + smoothP * 8, 0);
      core.scale.setScalar((wide ? 1 : 0.62) * (1 + Math.sin(t * 1.3) * 0.02));
      edgeMat.color.copy(OR).lerp(BL, smoothP); shellMat.color.copy(BL).lerp(OR, smoothP);
      shell.rotation.set(-t * 0.08, -t * 0.12, 0);
      orbits.forEach((o, i) => { const a = t * o.s + i * 2; o.e.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r, 0); });

      stars.rotation.z = t * 0.015 + smoothP * 1.2;
      shapes.forEach(s => { const u = s.userData; s.rotation.x = t * u.sx + u.b; s.rotation.y = t * u.sy + u.b; s.position.y += Math.sin(t + u.b) * 0.002; });
      l1.position.set(4 + m.x * 4, 3, camZ - 2); l2.position.set(-5, -2, camZ - 4);
      cv.style.opacity = ((wide ? 1 : 0.7) - hp * (wide ? 0.35 : 0.25)).toFixed(3);
      renderer.render(scene, cam);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf); removeEventListener("resize", size); removeEventListener("pointermove", onMove); document.removeEventListener("visibilitychange", onVis);
      disposables.forEach(d => d.dispose && d.dispose()); renderer.dispose();
    };
  }
})();
