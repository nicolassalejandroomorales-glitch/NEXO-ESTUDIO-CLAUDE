/* Fondo mágico del tutorial (docs/tutorial/SPEC.md › "Inicio mágico"): círculo de runas que gira, luz cálida, estrellas, luciérnagas, polvo,
   runas flotantes, hojas y enredaderas. Un solo canvas de baja resolución (cada píxel = PX de pantalla) que se escala pixelado.
   Uso: const m = NexoMagia.mount(elemento); m.pulse() hace un destello (nacimiento). Se apaga solo si el elemento sale de la página. */
(() => {
  'use strict';
  const PX = 3;
  const GOLD = [255, 214, 120], JADE = [120, 232, 168], ROSE = [232, 160, 220], LEAF = [150, 196, 96];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const rng = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

  // Símbolos de elementos en fuente de píxeles 3x5, centrados en (0,0).
  const FONT = { C: '111100100100111', H: '101101111101101', N: '101111111101101', O: '111101101101111', S: '111100111001111', P: '111101111100100' };
  function sym(g, ch, color) {
    g.fillStyle = color || rgba(GOLD, 1);
    for (let i = 0; i < 15; i++) if (FONT[ch][i] === '1') g.fillRect(i % 3 - 1, Math.floor(i / 3) - 2, 1, 1);
  }
  const SYMS = 'CHNOSPCHNOCHNSOPHN';
  // Moléculas chicas que flotan: átomos [x, y, grande] y enlaces entre índices (agua, amoníaco, metano, etanol).
  const MOLS = [
    { a: [[0, 0, 1], [-3, 2, 0], [3, 2, 0]], b: [[0, 1], [0, 2]] },
    { a: [[0, -1, 1], [-3, 2, 0], [3, 2, 0], [0, 3, 0]], b: [[0, 1], [0, 2], [0, 3]] },
    { a: [[0, 0, 1], [-3, 0, 0], [3, 0, 0], [0, -3, 0], [0, 3, 0]], b: [[0, 1], [0, 2], [0, 3], [0, 4]] },
    { a: [[-4, 1, 1], [0, 1, 1], [4, 1, 1], [-4, -2, 0], [4, 3, 0]], b: [[0, 1], [1, 2], [0, 3], [2, 4]] }
  ];

  // Anillos pintados una vez en un canvas aparte; luego solo se giran.
  // 'a' = círculo de transmutación con símbolos de elementos; 'b' = benceno con grupo amino (guiño a Aminas) dentro de un círculo punteado.
  function ring(R, runes, kind) {
    const size = Math.ceil(R * 2 + 8), c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), m = size / 2;
    g.translate(m, m); g.strokeStyle = rgba(GOLD, 1); g.lineWidth = 1; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke();
    g.beginPath(); g.arc(0, 0, R * (kind === 'a' ? .86 : .9), 0, 7); g.stroke();
    if (kind === 'a') {
      for (let i = 0; i < runes; i++) { g.save(); g.rotate(i / runes * Math.PI * 2); g.translate(0, -R * .93); sym(g, SYMS[i % SYMS.length]); g.restore(); }
      for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, in0 = i % 6 ? R * .97 : R * .94; g.beginPath(); g.moveTo(Math.sin(a) * in0, -Math.cos(a) * in0); g.lineTo(Math.sin(a) * R, -Math.cos(a) * R); g.stroke(); }
    } else {
      g.setLineDash([3, 4]); g.beginPath(); g.arc(0, 0, R * .8, 0, 7); g.stroke(); g.setLineDash([]);
      const r = R * .38, v = i => [Math.sin(i / 6 * Math.PI * 2) * r, -Math.cos(i / 6 * Math.PI * 2) * r];
      g.beginPath(); for (let i = 0; i < 6; i++) { const [x, y] = v(i); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke();
      for (const i of [1, 3, 5]) { const [x1, y1] = v(i), [x2, y2] = v(i + 1); g.beginPath(); g.moveTo(x1 * .72, y1 * .72); g.lineTo(x2 * .72, y2 * .72); g.stroke(); }
      const [tx, ty] = v(0); g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx, ty - R * .16); g.stroke();        // enlace al grupo amino
      g.save(); g.translate(tx, ty - R * .22); sym(g, 'N', rgba(JADE, 1)); g.restore();
      g.fillStyle = rgba(JADE, 1); g.fillRect(Math.round(tx - 5), Math.round(ty - R * .22 - 1), 2, 2); g.fillRect(Math.round(tx + 4), Math.round(ty - R * .22 - 1), 2, 2);
    }
    return c;
  }

  // Enredadera que "invade" desde una esquina: tallo curvo con hojitas; se pinta una vez.
  function vine(w, h, fromRight, seed) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), r = rng(seed);
    const dir = fromRight ? -1 : 1, x0 = fromRight ? w : 0;
    for (let v = 0; v < 3; v++) {
      let x = x0, y = h, a = -Math.PI / 2 + dir * (.25 + r() * .5), len = h * (.22 + r() * .28);
      g.strokeStyle = rgba([60, 110, 70], .85); g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y);
      const pts = [];
      for (let i = 0; i < len; i++) { a += Math.sin(i * .17 + v) * .045 * dir; x += Math.cos(a); y += Math.sin(a); g.lineTo(x, y); if (i % 6 === 3) pts.push([x, y, a, i % 12 === 3 ? 1 : -1]); }
      g.stroke();
      for (const [px, py, pa, side] of pts) {
        const lx = px + Math.cos(pa + side * 1.1) * 3, ly = py + Math.sin(pa + side * 1.1) * 3;
        if (r() < .2) { const bc = r() < .5 ? ROSE : JADE; g.fillStyle = rgba(bc, .25); g.fillRect(Math.round(lx) - 2, Math.round(ly) - 2, 6, 6); g.fillStyle = rgba(bc, .95); g.fillRect(Math.round(lx), Math.round(ly), 2, 2); continue; }   // brote que brilla
        g.fillStyle = rgba(r() < .25 ? GOLD : LEAF, .7); g.fillRect(Math.round(lx), Math.round(ly), 2, 2);
      }
    }
    return c;
  }

  function mount(host) {
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;image-rendering:pixelated';
    host.prepend(cv);
    const ctx = cv.getContext('2d'), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, cx = 0, cy = 0, R = 0, ringA, ringB, vineL, vineR, parts = [], stars = [], raf = 0, last = 0, t = 0, pulse = 0;

    const spawn = (kind, burst) => {
      const p = { kind, x: Math.random() * W, y: Math.random() * H, ph: Math.random() * 6.3, life: 0, max: 0 };
      if (kind === 'mote') Object.assign(p, { vx: (Math.random() - .5) * 2, vy: -(2 + Math.random() * 5), col: GOLD });
      else if (kind === 'fly') Object.assign(p, { vx: 0, vy: 0, col: JADE, sp: .6 + Math.random() * .8 });
      else if (kind === 'mol') Object.assign(p, { vx: (Math.random() - .5) * 2, vy: -(3 + Math.random() * 4), col: Math.random() < .5 ? GOLD : ROSE, mol: MOLS[Math.floor(Math.random() * MOLS.length)], max: 6 + Math.random() * 5, y: H * (.5 + Math.random() * .5) });
      else if (kind === 'bubble') Object.assign(p, { vx: 0, vy: -(5 + Math.random() * 6), col: JADE, y: H + 4, r: 1 + Math.floor(Math.random() * 2) });
      else if (kind === 'leaf') Object.assign(p, { vx: 3 + Math.random() * 4, vy: 4 + Math.random() * 4, col: Math.random() < .3 ? GOLD : LEAF, y: -4 - Math.random() * 20 });
      if (burst) { const a = Math.random() * 6.3, s = 14 + Math.random() * 30; p.x = cx; p.y = cy; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s; p.max = 1.6 + Math.random(); p.burst = true; }
      return p;
    };

    function layout() {
      W = Math.max(40, Math.round(host.clientWidth / PX)); H = Math.max(40, Math.round(host.clientHeight / PX));
      cv.width = W; cv.height = H; cx = W / 2; cy = H * .42; R = Math.min(W * .62, H * .66);
      ringA = ring(R, 18, 'a'); ringB = ring(R * .58, 0, 'b');
      vineL = vine(Math.round(W * .3), Math.round(H * .6), false, 5); vineR = vine(Math.round(W * .3), Math.round(H * .6), true, 11);
      const n = Math.min(70, Math.round(W * H / 1500));
      stars = Array.from({ length: Math.round(n * .6) }, () => ({ x: Math.random() * W, y: Math.random() * H * .7, ph: Math.random() * 6.3 }));
      parts = [];
      for (let i = 0; i < n * .5; i++) parts.push(spawn('mote'));
      for (let i = 0; i < Math.max(4, n * .1); i++) parts.push(spawn('fly'));
      for (let i = 0; i < Math.max(3, n * .06); i++) { const p = spawn('mol'); p.life = Math.random() * p.max; parts.push(p); }
      for (let i = 0; i < Math.max(3, n * .08); i++) { const p = spawn('bubble'); p.y = Math.random() * H; parts.push(p); }
      for (let i = 0; i < Math.max(3, n * .08); i++) { const p = spawn('leaf'); p.y = Math.random() * H; parts.push(p); }
    }

    function draw(dt) {
      t += dt; pulse = Math.max(0, pulse - dt * .7);
      const boost = 1 + pulse * 2.5;
      ctx.clearRect(0, 0, W, H);
      // Luz cálida detrás de la escena; respira y se enciende con el destello.
      const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.05);
      const ga = .16 + .04 * Math.sin(t * .9) + pulse * .35;
      gl.addColorStop(0, rgba(GOLD, ga)); gl.addColorStop(.55, rgba([220, 120, 90], ga * .35)); gl.addColorStop(1, rgba(GOLD, 0));
      ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
      // Estrellas
      for (const s of stars) { const a = .25 + .35 * Math.abs(Math.sin(t * .8 + s.ph)); ctx.fillStyle = `rgba(255,246,220,${a})`; ctx.fillRect(s.x | 0, s.y | 0, 1, 1); }
      // Círculo de runas: dos anillos girando en sentidos contrarios.
      const ra = .3 + .08 * Math.sin(t * 1.3) + pulse * .5;
      ctx.save(); ctx.translate(cx, cy);
      ctx.globalAlpha = Math.min(1, ra); ctx.save(); ctx.rotate(t * .045 * boost); ctx.drawImage(ringA, -ringA.width / 2, -ringA.height / 2); ctx.restore();
      ctx.globalAlpha = Math.min(1, ra * 1.2); ctx.save(); ctx.rotate(-t * .08 * boost); ctx.drawImage(ringB, -ringB.width / 2, -ringB.height / 2); ctx.restore();
      // Tres órbitas atómicas con su electrón, como el átomo mascota.
      ctx.globalAlpha = 1;
      for (let k = 0; k < 3; k++) {
        const rot = k * Math.PI / 3 + t * .05 * boost, A = R * .74, B = R * .24, e = t * (.9 + k * .25) * boost + k * 2;
        ctx.save(); ctx.rotate(rot); ctx.strokeStyle = rgba(JADE, .24 + pulse * .3); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, A, B, 0, 0, 7); ctx.stroke();
        const ex = Math.cos(e) * A, ey = Math.sin(e) * B; ctx.fillStyle = rgba(JADE, .25); ctx.fillRect(Math.round(ex) - 1, Math.round(ey) - 1, 3, 3);
        ctx.fillStyle = rgba([220, 255, 235], .95); ctx.fillRect(Math.round(ex), Math.round(ey), 1, 1); ctx.restore();
      }
      ctx.restore(); ctx.globalAlpha = 1;
      // Enredaderas sobre el borde inferior
      const sway = Math.sin(t * .6) * .6;
      ctx.globalAlpha = .75; ctx.drawImage(vineL, sway, H - vineL.height); ctx.drawImage(vineR, W - vineR.width - sway, H - vineR.height); ctx.globalAlpha = 1;
      // Partículas
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.kind === 'fly') {
          p.ph += dt * p.sp; p.x += Math.cos(p.ph * 1.7) * 7 * dt; p.y += Math.sin(p.ph * 1.1) * 5 * dt;
          const a = Math.max(0, Math.sin(p.ph * 2.3)) ;
          ctx.fillStyle = rgba(p.col, a * .18); ctx.fillRect((p.x | 0) - 1, (p.y | 0) - 1, 3, 3);
          ctx.fillStyle = rgba(p.col, .35 + a * .65); ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
        } else {
          p.x += (p.vx + (p.kind === 'leaf' ? Math.sin(t * 1.5 + p.ph) * 4 : Math.sin(t + p.ph) * 1.2)) * dt; p.y += p.vy * dt;
          p.life += dt;
          let a = p.kind === 'mol' || p.burst ? Math.sin(Math.min(1, p.life / p.max) * Math.PI) : .35 + .45 * Math.abs(Math.sin(t * 1.1 + p.ph));
          if (p.burst) { p.vx *= 1 - dt * 1.6; p.vy *= 1 - dt * 1.6; }
          if (p.kind === 'mol') {
            const px = p.x | 0, py = p.y | 0;
            ctx.strokeStyle = rgba(p.col, a * .6); ctx.lineWidth = 1; ctx.beginPath();
            for (const [i, j] of p.mol.b) { ctx.moveTo(px + p.mol.a[i][0] + .5, py + p.mol.a[i][1] + .5); ctx.lineTo(px + p.mol.a[j][0] + .5, py + p.mol.a[j][1] + .5); }
            ctx.stroke(); ctx.fillStyle = rgba(p.col, a);
            for (const [x, y, big] of p.mol.a) ctx.fillRect(px + x, py + y, big ? 2 : 1, big ? 2 : 1);
          } else if (p.kind === 'bubble') {
            const bx = (p.x + Math.sin(t * 2 + p.ph) * 1.5) | 0, by = p.y | 0, a2 = .3 + .3 * Math.abs(Math.sin(t + p.ph)), d = p.r + 2;
            ctx.strokeStyle = rgba(p.col, a2); ctx.strokeRect(bx + .5, by + .5, d - 1, d - 1); ctx.fillStyle = `rgba(255,255,255,${a2})`; ctx.fillRect(bx + 1, by + 1, 1, 1);
          }
          else if (p.kind === 'leaf') { ctx.fillStyle = rgba(p.col, .75); ctx.fillRect(p.x | 0, p.y | 0, 2, 1); ctx.fillRect((p.x | 0) + 1, (p.y | 0) + 1, 1, 1); }
          else { ctx.fillStyle = rgba(p.col, a); ctx.fillRect(p.x | 0, p.y | 0, 1, 1); }
          const out = p.x < -6 || p.x > W + 6 || p.y < -8 || p.y > H + 8 || (p.max && p.life > p.max);
          if (out) { if (p.burst) parts.splice(i, 1); else { const n = spawn(p.kind); if (p.kind === 'mote') n.y = H + 2; parts[i] = n; } }
        }
      }
    }

    function loop(now) {
      if (!cv.isConnected) { ro.disconnect(); return; }
      raf = requestAnimationFrame(loop);
      const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      if (!document.hidden) draw(dt);
    }

    const ro = new ResizeObserver(() => { layout(); if (still) draw(0); });
    ro.observe(host);
    layout();
    if (still) draw(0); else raf = requestAnimationFrame(loop);

    return {
      pulse() { if (still) return; pulse = 1; for (let i = 0; i < 36; i++) parts.push(spawn('mote', true)); },
      destroy() { cancelAnimationFrame(raf); ro.disconnect(); cv.remove(); }
    };
  }

  // Aura del Grimorio: lo que sale del libro. Canvas del tamaño del arte (68x76) más un margen, alineado al píxel con el sprite.
  // Seis runas giran en órbita alrededor del libro (atenuadas al pasar por detrás), salen chispas de tinta y hojitas por arriba,
  // y la luz del libro se enciende cuando habla (talk) o cambia de pose (burst).
  const RUNES = Array.from({ length: 8 }, (_, k) => {
    const r = rng(k * 31 + 7), px = [];
    for (let y = -2; y <= 2; y++) px.push([0, y]);
    for (const x of [-1, 1]) for (let y = -2; y <= 2; y++) if (r() < .34) px.push([x, y]);
    return px;
  });
  const INK = [GOLD, ROSE, JADE];

  // Emoción de cada pose → color del aura y fuerza del brillo.
  const MOOD = {
    sorprendido: { c: [190, 150, 255], k: 1.5 }, nocreo: { c: [210, 160, 255], k: 1.2 }, enojado: { c: [255, 96, 72], k: 1.6 },
    triste: { c: [120, 160, 255], k: .6 }, feliz: { c: [255, 205, 120], k: 1.5 }, guino: { c: [255, 190, 130], k: 1.3 },
    pensativo: { c: [120, 220, 200], k: 1 }, espiral: { c: [120, 220, 200], k: 1.1 }, sudor: { c: [150, 210, 190], k: .8 },
    dormido: { c: [150, 160, 220], k: .45 }
  };

  function aura(grim) {
    const PAD = 24, W = 68 + PAD * 2, H = 76 + PAD * 2, cx = PAD + 30, cy = PAD + 30;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = `position:absolute;left:calc(var(--s) * ${-PAD}px);top:calc(var(--s) * ${-PAD}px);width:calc(var(--s) * ${W}px);height:calc(var(--s) * ${H}px);pointer-events:none;image-rendering:pixelated;mix-blend-mode:screen;z-index:2`;
    grim.append(cv);
    const ctx = cv.getContext('2d');
    let t = 0, last = 0, talk = 0, talking = false, energy = 0, acc = 0, sparks = [], raf = 0;
    let tint = GOLD.slice(), tintTo = GOLD, kk = 1, kkTo = 1, smoke = [], embers = [], smokeAcc = 0, emberAcc = 0;
    const CANDLES = [PAD + 14.5, PAD + 45.5], CANDLE_Y = PAD + 51;

    const spark = (fast) => sparks.push({
      x: cx + (Math.random() - .5) * 26, y: cy - 14 + Math.random() * 6, vx: (Math.random() - .5) * 5, vy: -(6 + Math.random() * 8) * (fast ? 1.6 : 1),
      life: 0, max: 1.2 + Math.random() * 1.2, page: Math.random() < .28, col: INK[Math.floor(Math.random() * 3)], ph: Math.random() * 6.3
    });

    function draw(dt) {
      t += dt; energy = Math.max(0, energy - dt * 1.4); talk += ((talking ? 1 : 0) - talk) * Math.min(1, dt * 5);
      const lit = Math.min(1, talk * .7 + energy), f = Math.min(1, dt * 3);
      for (let c = 0; c < 3; c++) tint[c] += (tintTo[c] - tint[c]) * f;
      kk += (kkTo - kk) * f;
      ctx.clearRect(0, 0, W, H);
      // Humo: sube detrás del libro, se ensancha y se desvanece (bloques de 2 px con alfa irregular, para que no se vea liso).
      smokeAcc += dt * (.9 + talk * 1.6);
      while (smokeAcc >= 1) { smokeAcc -= 1; if (smoke.length < 14) smoke.push({ x: cx + (Math.random() - .5) * 22, y: cy + 10 + Math.random() * 6, r: 2.5, vy: -(3 + Math.random() * 3), life: 0, max: 3 + Math.random() * 1.6, ph: Math.random() * 6.3 }); }
      for (let i = smoke.length - 1; i >= 0; i--) {
        const q = smoke[i]; q.life += dt;
        if (q.life > q.max) { smoke.splice(i, 1); continue; }
        q.y += q.vy * dt; q.x += Math.sin(q.life * 1.3 + q.ph) * 3 * dt; q.r = 2.5 + q.life * 2.6;
        const al = Math.sin(q.life / q.max * Math.PI) * (.1 + lit * .06);
        for (let dy = -q.r; dy <= q.r; dy += 2) for (let dx = -q.r; dx <= q.r; dx += 2) {
          if (dx * dx + dy * dy > q.r * q.r) continue;
          ctx.fillStyle = `rgba(${(tint[0] * .5 + 120) | 0},${(tint[1] * .5 + 105) | 0},${(tint[2] * .5 + 130) | 0},${al * (.5 + ((dx * 7 + dy * 13 + i * 5) & 3) / 6)})`;
          ctx.fillRect((q.x + dx) | 0, (q.y + dy) | 0, 2, 2);
        }
      }
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 36), a = (.1 + .04 * Math.sin(t * 1.6) + lit * .2) * kk;
      g.addColorStop(0, rgba(tint, a)); g.addColorStop(.5, rgba(ROSE, a * .45)); g.addColorStop(1, rgba(tint, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // Brasas: salen de las dos velas, se mecen y se apagan.
      emberAcc += dt * 3.2;
      while (emberAcc >= 1) { emberAcc -= 1; if (embers.length < 18) embers.push({ x: CANDLES[Math.random() < .5 ? 0 : 1] + (Math.random() - .5) * 2, y: CANDLE_Y, vy: -(5 + Math.random() * 5), life: 0, max: .9 + Math.random() * .8, ph: Math.random() * 6.3 }); }
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]; e.life += dt;
        if (e.life > e.max) { embers.splice(i, 1); continue; }
        e.y += e.vy * dt; e.x += Math.sin(e.life * 7 + e.ph) * 4 * dt;
        ctx.fillStyle = `rgba(255,${(150 + 80 * (1 - e.life / e.max)) | 0},70,${Math.sin(e.life / e.max * Math.PI) * .9})`; ctx.fillRect(e.x | 0, e.y | 0, 1, 1);
      }
      // Runas en órbita (elipse inclinada). Delante = brillan; detrás = se apagan.
      const n = 6, spin = t * (.55 + talk * .7), tilt = -.2;
      for (let i = 0; i < n; i++) {
        const an = spin + i * Math.PI * 2 / n, depth = Math.sin(an), ox = Math.cos(an) * 31, oy = depth * 9;
        const x = Math.round(cx + ox * Math.cos(tilt) - oy * Math.sin(tilt)), y = Math.round(cy + 2 + ox * Math.sin(tilt) + oy * Math.cos(tilt));
        const al = (depth > 0 ? .95 : .3) * (.75 + lit * .25), col = i % 3 === 0 ? tint.map(Math.round) : INK[i % 3];
        for (let k = 1; k <= 3; k++) {                       // estela
          const ak = an - k * .13, tx = Math.cos(ak) * 31, ty = Math.sin(ak) * 9;
          ctx.fillStyle = rgba(col, al * .22 / k); ctx.fillRect(Math.round(cx + tx * Math.cos(tilt) - ty * Math.sin(tilt)), Math.round(cy + 2 + tx * Math.sin(tilt) + ty * Math.cos(tilt)), 1, 1);
        }
        ctx.fillStyle = rgba(col, al * .25); ctx.fillRect(x - 2, y - 3, 5, 7);
        ctx.fillStyle = rgba(col, al); for (const [dx, dy] of RUNES[i]) ctx.fillRect(x + dx, y + dy, 1, 1);
      }
      // Chispas de tinta y hojitas que salen por arriba del libro.
      acc += dt * (1.1 + talk * 5 + energy * 10);
      while (acc >= 1) { acc -= 1; if (sparks.length < 60) spark(energy > .3); }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]; p.life += dt;
        if (p.life > p.max) { sparks.splice(i, 1); continue; }
        p.x += (p.vx + Math.sin(p.life * 5 + p.ph) * (p.page ? 6 : 2)) * dt; p.y += p.vy * dt;
        const al = Math.sin(p.life / p.max * Math.PI);
        if (p.page) { ctx.fillStyle = `rgba(255,240,205,${al * .9})`; ctx.fillRect(p.x | 0, p.y | 0, 2, 3); ctx.fillStyle = rgba(GOLD, al * .7); ctx.fillRect((p.x | 0), (p.y | 0) + 1, 2, 1); }
        else { ctx.fillStyle = rgba(p.col, al); ctx.fillRect(p.x | 0, p.y | 0, 1, 1); }
      }
    }

    function loop(now) {
      if (!cv.isConnected) return;
      raf = requestAnimationFrame(loop);
      const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      if (!document.hidden && cv.offsetWidth) draw(dt);
    }
    raf = requestAnimationFrame(loop);

    return {
      talk(on) { talking = !!on; },
      mood(pose) { const m = MOOD[pose]; tintTo = m ? m.c : GOLD; kkTo = m ? m.k : 1; },
      burst() { energy = 1; for (let i = 0; i < 14; i++) spark(true); },
      destroy() { cancelAnimationFrame(raf); cv.remove(); }
    };
  }

  window.NexoMagia = { mount, aura };
})();
