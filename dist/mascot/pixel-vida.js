/* Vida de la mascota pixel en una sala (docs/mascota/SPEC.md · Fase 6, preview de integración).
   Dibuja en un <canvas> del tamaño del arte (px de arte) y lo amplía la página con image-rendering: pixelated.
   Lugares: puntos del piso o "perchas" (escritorio, sillón) a las que se llega saltando desde un punto del piso.
   Usa window.PixelMascotas (pixelmascotas.js) para dibujar cada cuadro re-rasterizado. */
(() => {
  'use strict';
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const smooth = (v, target, dt, speed = 5) => v + (target - v) * (1 - Math.exp(-dt * speed));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  // Mini fuente de píxel para "+15 ⚛" al celebrar.
  const DIGITS = { '0': ['yyy', 'y.y', 'y.y', 'y.y', 'yyy'], '1': ['.y.', 'yy.', '.y.', '.y.', 'yyy'], '2': ['yyy', '..y', 'yyy', 'y..', 'yyy'],
    '3': ['yyy', '..y', '.yy', '..y', 'yyy'], '4': ['y.y', 'y.y', 'yyy', '..y', '..y'], '5': ['yyy', 'y..', 'yyy', '..y', 'yyy'],
    '6': ['yyy', 'y..', 'yyy', 'y.y', 'yyy'], '7': ['yyy', '..y', '.y.', '.y.', '.y.'], '8': ['yyy', 'y.y', 'yyy', 'y.y', 'yyy'],
    '9': ['yyy', 'y.y', 'yyy', '..y', 'yyy'], '+': ['...', '.y.', 'yyy', '.y.', '...'], 'a': ['.Y.', 'YyY', '.Y.', 'YyY', '.Y.'] };
  function textRows(str) {
    const rows = ['', '', '', '', ''];
    [...str].forEach((ch, i) => (DIGITS[ch] || DIGITS['0']).forEach((r, k) => { rows[k] += (i ? '.' : '') + r; }));
    // contorno oscuro de 1 px para que se lea sobre cualquier fondo
    const h = rows.length + 2, w = rows[0].length + 2, grid = Array.from({ length: h }, () => Array(w).fill('.'));
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') grid[y + 1][x + 1] = c; }));
    const out = grid.map(r => r.slice());
    grid.forEach((r, y) => r.forEach((c, x) => { if (c === '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => grid[y + dy]?.[x + dx] && grid[y + dy][x + dx] !== '.')) out[y][x] = 'k'; }));
    return out.map(r => r.join(''));
  }

  function create({ canvas, background, stations, route, bookFrom, depth = () => 1, kind = 'matraz', onStatus = () => {}, reduced = false,
    manual = false, start: startAt = null, speed: speedK = 1 }) {
    // manual: sin paseo automático; la página la mueve con walkTo(x, y) (mundo de la torre, docs/mundo-torre/SPEC.md).
    const P = window.PixelMascotas, ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    ctx.imageSmoothingEnabled = false;
    const sprite = document.createElement('canvas'); sprite.width = P.W; sprite.height = P.H;
    const sctx = sprite.getContext('2d');
    const SPR = Object.fromEntries(Object.entries(P.FX).map(([k, rows]) => [k, P.sprite(rows)]));
    const start = startAt || stations[route[0]];
    const A = { kind, x: start.x, y: start.y, at: manual ? null : route[0], left: false, w: 0, target: 0, phase: 0, t: 0, air: 0, jumpY: 0, sq: 0, sqT: 0, joy: 0,
      lean: 0, leanT: 0, look: [0, 0], lookT: [0, 0], nextGlance: 2, gesture: 0, dance: 0, stretch: 0, six: 0, shake: 0, excite: 0, sit: 0, sitT: 0,
      mode: 'idle', blinkUntil: 0, nextBlink: 3, expr: 'neutral', outfit: {}, carry: null, reading: false, pose: null, arms: null, dabTilt: 0, dabTiltT: 0,
      night: false, storm: false, flash: 0, last: performance.now() };
    let exprTimer = 0, busy = false, paused = false, running = true, walkId = 0;
    const baseExpr = () => A.mode === 'read' ? 'concentrada' : A.mode === 'sleep' ? 'dormida' : A.storm ? 'nerviosa' : 'neutral';
    const setExpr = (e, ms) => { A.expr = e; clearTimeout(exprTimer); if (ms) exprTimer = setTimeout(() => setExpr(baseExpr()), ms); };
    const say = t => onStatus(t);
    const fx = [];
    const emit = (name, x, y, { vx = 0, vy = -10, life = 1.4, delay = 0, spr } = {}) => fx.push({ s: spr || SPR[name], x, y, vx, vy, life, age: -delay });
    const motes = [0, 1, 2, 3, 4].map(i => ({ a: i * 1.26, sp: .7 + i * .15, r: 9 + (i % 3) * 3, x: A.x, y: A.y - 20, lag: 2 + i * .5 }));
    const scaleNow = () => (stations[A.at]?.perch && !A.moving ? stations[A.at].scale || .8 : depth(A.y));
    const headY = () => A.y - A.jumpY - 40 * scaleNow();

    function frame(now) {
      if (!running) return;
      const dt = Math.min(.05, (now - A.last) / 1000); A.last = now; A.t += dt;
      A.w = smooth(A.w, A.target, dt); A.sq = smooth(A.sq, A.sqT, dt, 14); A.joy = smooth(A.joy, 0, dt, 2.2); A.lean = smooth(A.lean, A.leanT, dt, 6);
      A.excite = smooth(A.excite, 0, dt, 1.5); A.sit = smooth(A.sit, A.sitT, dt, 3); A.dabTilt = smooth(A.dabTilt, A.dabTiltT, dt, 16); A.flash = Math.max(0, A.flash - dt);
      ['dance', 'stretch', 'six', 'shake'].forEach(k => { A[k] = Math.max(0, A[k] - dt); }); A.gesture = Math.max(0, A.gesture - dt / 1.2);
      if (A.mode === 'idle' && A.t > A.nextGlance) { A.lookT = [Math.round(Math.random() * 2 - 1), Math.random() < .3 ? -1 : 0]; A.nextGlance = A.t + 1.5 + Math.random() * 2.5; }
      if (A.mode === 'walk') A.lookT = [1, 0]; if (A.mode === 'read') A.lookT = [1, 1];
      A.look = [smooth(A.look[0], A.lookT[0], dt, 8), smooth(A.look[1], A.lookT[1], dt, 8)];
      if (A.t > A.nextBlink) { A.blinkUntil = A.t + .13; A.nextBlink = A.t + 2.5 + Math.random() * 3; }
      const freq = { matraz: 1.9, atomo: 1, slime: 1.4 }[A.kind], w = reduced ? 0 : A.w;
      A.phase += dt * Math.PI * 2 * freq * (.25 + .75 * w);
      const ph = A.phase, t = A.t, g = A.gesture > 0 ? 1 - A.gesture : 0, sq = A.sq;
      const dz = Math.min(1, A.dance), dPh = t * Math.PI * 2 * 2.2, st6 = Math.min(1, A.six), str = A.stretch > 0 ? Math.sin(Math.PI * (1 - A.stretch / 1.4)) : 0;
      const joyHop = Math.abs(Math.sin(A.joy * Math.PI * 3)) * A.joy, breathe = Math.sin(t * 2 * Math.PI / (A.sit > .5 ? 4.5 : 3));
      const sway = dz * 9 * Math.sin(dPh / 2) + st6 * 3 * Math.sin(t * Math.PI * 2 * 2.3) + A.shake * 4 * Math.sin(t * 70);
      const step = Math.sin(ph), up = Math.max(0, step), down = Math.max(0, -step);
      const poseName = A.pose || (A.mode === 'walk' ? 'walk' : A.mode === 'read' ? 'read' : A.mode === 'sleep' ? 'sleep' : A.carry ? 'carry' : A.storm ? 'fiddle' : 'rest');
      const target = P.armPose(poseName, t, ph).map(a => ({ e: a.e || [a.h[0] / 2, a.h[1] / 2], h: a.h }));
      if (!A.arms) A.arms = target.map(a => ({ e: a.e.slice(), h: a.h.slice() }));
      const ka = 1 - Math.exp(-dt * (A.pose === 'dab' ? 22 : 12));
      A.arms.forEach((a, i) => ['e', 'h'].forEach(k => { a[k][0] += (target[i][k][0] - a[k][0]) * ka; a[k][1] += (target[i][k][1] - a[k][1]) * ka; }));
      const sc = scaleNow();
      const st = { t, expr: A.expr, outfit: A.outfit, look: A.look, blink: A.t < A.blinkUntil, excite: A.excite, arms: A.arms, scale: sc,
        sx: 1 + .12 * sq - .06 * str, sy: 1 - .14 * sq + .14 * str - .04 * A.sit + .02 * breathe * A.sit,
        bodyTilt: 0, rootTilt: sway + A.lean + A.dabTilt, hop: 0, lift: 0, slosh: 0, cork: 0, tag: 0, footL: 0, footR: 0, spin: 0, drip: 0, hat: 0 };
      const airLift = 8 * joyHop + 3 * dz * Math.max(0, Math.sin(dPh));
      if (A.kind === 'matraz') {
        st.rootTilt += 6 * w * step; st.hop = 1.5 * w * Math.abs(step) + airLift;
        st.slosh = 4 * Math.sin(t * 2) * (1 - w) - 12 * w * Math.sin(ph - .7) - 1.2 * sway;
        st.footL = 2 * Math.max(w * up, dz * Math.max(0, Math.sin(dPh))); st.footR = 2 * Math.max(w * down, dz * Math.max(0, -Math.sin(dPh)));
        st.tag = 10 * Math.sin(t * 2) + 14 * w * Math.sin(ph - 1); st.cork = 4 * Math.sin(Math.PI * Math.min(1, g * 1.6)) + 2 * A.excite;
      } else if (A.kind === 'slime') {
        const wob = Math.sin(t * 2 * Math.PI / 1.9);
        st.lift = 7 * w * up + airLift; st.sx += .04 * wob * (1 - w) + w * (-.06 * up + .14 * down) + .08 * A.sit; st.sy += -.04 * wob * (1 - w) + w * (.1 * up - .16 * down) - .1 * A.sit;
        st.hat = 4 * wob + 10 * w * Math.sin(ph - 1) - sway * .5; st.drip = Math.min(1, g * 1.4);
      } else {
        st.lift = 3 + 1.5 * Math.sin(t * 2 * Math.PI / 3) * (1 - w) + 3 * w + airLift * .7 - 3 * A.sit; st.bodyTilt = 8 * w;
        st.spin = 360 * ease(Math.min(1, g * 1.3)) + 20 * A.excite * Math.sin(t * 9); st.sx = st.sy = 1 + .04 * Math.sin(t * 2.1) + .1 * sq;
      }
      // ——— Dibujo ———
      ctx.clearRect(0, 0, W, H); if (background) ctx.drawImage(background, 0, 0, W, H);
      P.render(sctx, A.kind, st);
      const x0 = Math.round(A.x) - 20, y0 = Math.round(A.y - A.jumpY) - 43;
      ctx.save(); if (A.left) { ctx.translate(x0 * 2 + P.W, 0); ctx.scale(-1, 1); } ctx.drawImage(sprite, x0, y0); ctx.restore();
      if (A.carry) ctx.drawImage(SPR[A.carry], Math.round(A.x) - 5, Math.round(headY()) - 8 + Math.round(Math.sin(t * 6)));
      if (A.reading) { ctx.drawImage(SPR.open, Math.round(A.x) + (A.left ? -22 : 7), Math.round(A.y) - 9); }
      const calm = A.mode === 'sleep' ? .5 : 1, wild = 1 + 1.3 * Math.max(A.joy, A.excite, A.dance > 0 ? .6 : 0);
      motes.forEach((m, i) => {
        m.a += dt * m.sp * calm * wild;
        const tx = A.x + Math.cos(m.a) * m.r * calm * wild * sc, ty = A.y - A.jumpY - 22 * sc + Math.sin(m.a * 1.3) * m.r * .5 * calm * wild;
        const k = 1 - Math.exp(-dt * m.lag); m.x += (tx - m.x) * k; m.y += (ty - m.y) * k;
        const x = Math.round(m.x), y = Math.round(m.y), on = Math.sin(t * (2 + i * .4) + i) > -.3;
        ctx.fillStyle = '#ffd270'; if (on) { ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1); }
        ctx.fillStyle = on ? '#fff6c8' : '#e2b850'; ctx.fillRect(x, y, 1, 1);
      });
      for (let i = fx.length - 1; i >= 0; i--) {
        const p = fx[i]; p.age += dt; if (p.age < 0) continue;
        if (p.age > p.life) { fx.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.life - p.age < .3 && Math.floor(p.age * 20) % 2) continue;
        ctx.drawImage(p.s, Math.round(p.x - p.s.width / 2), Math.round(p.y - p.s.height / 2));
      }
      // Noche (tinte azul con trama) y relámpago de tormenta (2 cuadros blancos).
      if (A.night) { ctx.fillStyle = 'rgba(20,24,60,.42)'; ctx.fillRect(0, 0, W, H); }
      if (A.flash > 0 && Math.floor(A.flash * 30) % 2 === 0) { ctx.fillStyle = 'rgba(235,240,255,.55)'; ctx.fillRect(0, 0, W, H); }
      requestAnimationFrame(frame);
    }

    // ——— Movimiento ———
    async function walk(x, y) {
      const fx0 = A.x, fy0 = A.y, dist = Math.hypot(x - fx0, (y - fy0) * 1.6), id = ++walkId;
      if (dist < 1) return true;
      if (Math.abs(x - fx0) > .5) A.left = x < fx0;
      A.mode = 'walk'; A.target = 1; A.moving = true;
      const speed = { atomo: 38, slime: 32, matraz: 26 }[A.kind] * speedK, ms = reduced ? 1 : Math.max(450, dist / speed * 1000), t0 = performance.now();
      await new Promise(done => { const tick = now => { if (id !== walkId) return done(); if (paused) { requestAnimationFrame(tick); return; }
        const t = Math.min(1, (now - t0) / ms), e = ease(t); A.x = fx0 + (x - fx0) * e; A.y = fy0 + (y - fy0) * e; A.leanT = 6 * (1 - 2 * t) * (A.left ? -1 : 1);
        if (t > .8) A.target = 0; t < 1 ? requestAnimationFrame(tick) : done(); }; requestAnimationFrame(tick); });
      if (id !== walkId) return false;
      A.target = 0; A.leanT = 0; A.mode = 'idle'; A.moving = false; return true;
    }
    async function jump(x, y) {
      A.sqT = 1; await wait(170); A.sqT = 0; A.moving = true;
      const fx0 = A.x, fy0 = A.y, t0 = performance.now(), ms = reduced ? 1 : 650;
      if (Math.abs(x - fx0) > .5) A.left = x < fx0;
      await new Promise(done => { const tick = now => { const t = Math.min(1, (now - t0) / ms);
        A.x = fx0 + (x - fx0) * t; A.y = fy0 + (y - fy0) * t; A.jumpY = Math.sin(Math.PI * t) * 16; t < 1 ? requestAnimationFrame(tick) : done(); }; requestAnimationFrame(tick); });
      A.jumpY = 0; A.moving = false; A.sqT = 1; await wait(130); A.sqT = 0;
    }
    async function goTo(name) {
      const from = stations[A.at], to = stations[name];
      if (A.at === name) return;
      if (from.perch) { const f = stations[from.from]; await jump(f.x, f.y); A.at = from.from; }
      if (to.perch) { const f = stations[to.from]; await walk(f.x, f.y); A.at = to.from; await jump(to.x, to.y); }
      else await walk(to.x, to.y);
      A.at = name;
    }

    // ——— Conductas y emotes ———
    const withPose = async (pose, fn) => { A.pose = pose; try { await fn(); } finally { A.pose = null; } };
    const top = () => headY() - 4;
    const ACTS = {
      baile: () => withPose('dance', async () => { say('¡Bailando!'); setExpr('feliz'); A.dance = 3.2; const iv = setInterval(() => emit('note', A.x + Math.random() * 16 - 8, top()), 420); await wait(3200); clearInterval(iv); setExpr(baseExpr()); }),
      saludo: () => withPose('wave', async () => { say('¡Hola!'); setExpr('feliz'); emit('bang', A.x, top(), { vy: -6 }); A.joy = 1; await wait(1300); setExpr(baseExpr()); }),
      bostezo: () => withPose('up', async () => { say('Bostezando…'); setExpr('bostezo'); A.stretch = 1.4; await wait(1500); setExpr(baseExpr()); }),
      idea: () => withPose('up', async () => { say('¡Ajá!'); setExpr('idea'); A.excite = 1; emit('bulb', A.x, top() - 4, { vy: -3, life: 1.6 }); await wait(1600); setExpr(baseExpr()); }),
      seisSiete: () => withPose('sixseven', async () => { say('Six… seven…'); setExpr('picara'); A.six = 2.8;
        for (let i = 0; i < 6; i++) { emit(i % 2 ? 'seven' : 'six', A.x + (i % 2 ? 9 : -9), top(), { vy: -14, life: .45 }); await wait(440); } setExpr(baseExpr()); }),
      dab: () => withPose('dab', async () => { say('¡Dab!'); A.sqT = 1; await wait(120); A.sqT = 0; setExpr('feliz'); A.dabTiltT = -12;
        for (let i = 0; i < 4; i++) emit('star', A.x + 12 + Math.random() * 10, top() + 8 - Math.random() * 10, { vy: -5, life: .9, delay: i * .08 }); await wait(1500); A.dabTiltT = 0; setExpr(baseExpr()); }),
      confundida: () => withPose('scratch', async () => { say('¿?'); setExpr('confundida'); A.leanT = 12; emit('quest', A.x + 8, top(), { vy: -5, life: 1.5 }); await wait(1600); A.leanT = 0; setExpr(baseExpr()); }),
      llorar: () => withPose('cry', async () => { say('Snif…'); setExpr('triste'); const iv = setInterval(() => [-4, 4].forEach(d => emit('tear', A.x + d, headY() + 14, { vy: 22, life: .5 })), 360); await wait(2400); clearInterval(iv); setExpr(baseExpr()); }),
      enojada: () => withPose('fists', async () => { say('¡Grrr!'); setExpr('enojada'); A.shake = 1.6; emit('anger', A.x + 10, top(), { vy: 0, life: 1.6 });
        const iv = setInterval(() => [-8, 8].forEach(d => emit('steam', A.x + d, top() + 2, { vx: d, vy: -16, life: .6 })), 260); await wait(1700); clearInterval(iv); setExpr(baseExpr()); }),
      nerviosa: () => withPose('fiddle', async () => { say('Eh… je je…'); setExpr('nerviosa'); A.shake = .9; emit('tear', A.x + 11, headY() + 6, { vy: 6, life: 1.6 }); await wait(1800); setExpr(baseExpr()); }),
      deslumbrada: () => withPose('cheeks', async () => { say('¡Wooow!'); setExpr('deslumbrada'); A.excite = 1; A.joy = .6;
        for (let i = 0; i < 6; i++) emit('star', A.x + Math.random() * 30 - 15, top() + 10 - Math.random() * 14, { vy: -6, life: 1, delay: i * .1 }); await wait(1800); setExpr(baseExpr()); })
    };
    async function act(name) { if (busy || !ACTS[name]) return; busy = true; try { await ACTS[name](); } finally { busy = false; } }

    async function takeBook() {
      say('Saca un libro de la estantería…'); setExpr('sorpresa'); emit('bang', A.x, top(), { vy: -6, life: .8 });
      const book = pick(['bookA', 'bookB']), [bx, by] = bookFrom, t0 = performance.now();
      const flying = { s: SPR[book], x: bx, y: by, vx: 0, vy: 0, life: 99, age: 0 }; fx.push(flying);
      await new Promise(done => { const tick = now => { const t = Math.min(1, (now - t0) / 900), x1 = A.x, y1 = headY() - 6;
        flying.x = bx + (x1 - bx) * t; flying.y = by + (y1 - by) * t - Math.sin(Math.PI * t) * 14; t < 1 ? requestAnimationFrame(tick) : done(); }; requestAnimationFrame(tick); });
      fx.splice(fx.indexOf(flying), 1); A.carry = book; A.sqT = 1; await wait(140); A.sqT = 0; setExpr('feliz', 900);
    }
    async function readBook() {
      A.carry = null; A.reading = true; A.mode = 'read'; setExpr('concentrada'); say('Leyendo concentrada…');
      const iv = setInterval(() => emit('star', A.x + (A.left ? -14 : 14) + Math.random() * 6 - 3, A.y - 12, { vy: -12, life: 1.1 }), 650);
      await wait(3200); await ACTS.idea(); setExpr('concentrada'); await wait(3000); clearInterval(iv);
      A.reading = false; A.mode = 'idle'; setExpr('feliz', 900);
    }
    async function nap(ms = 7000, until) {
      await act('bostezo'); say('Siesta en el sillón…'); A.mode = 'sleep'; A.sitT = 1; setExpr('dormida');
      const iv = setInterval(() => emit('zz', A.x + 10, top() + 6, { vx: 4, vy: -8, life: 1.6 }), 900);
      const end = performance.now() + ms; while (until ? until() : performance.now() < end) await wait(300);
      clearInterval(iv); A.sitT = 0; A.mode = 'idle'; A.stretch = 1.4; setExpr('sorpresa', 700); await wait(1300);
    }
    async function idleMoment(ms) {
      const end = performance.now() + ms;
      while (performance.now() < end) { await wait(700); if (busy || paused || A.night || Math.random() > .25) continue;
        if (Math.random() < .3) A.gesture = 1; else await act(pick(['baile', 'saludo', 'idea', 'seisSiete', 'dab', 'confundida', 'deslumbrada', 'nerviosa'])); }
    }
    async function loop() {
      for (let i = 1; running; i++) {
        while (paused || busy) await wait(200);
        if (A.night) { await goTo('chair'); await nap(0, () => A.night); continue; }
        const name = route[i % route.length], s = stations[name];
        say(s.say || 'Paseando…'); await goTo(name);
        while (paused || busy) await wait(200);
        if (s.action === 'book' && !A.carry) await takeBook();
        else if (s.action === 'read' && A.carry) await readBook();
        else if (s.action === 'nap') await nap();
        else await idleMoment(s.wait || 2400);
      }
    }
    requestAnimationFrame(frame); if (!manual) loop();
    return {
      state: A, act,
      setKind(k) { A.kind = k; }, setOutfit(o) { A.outfit = { ...o }; },
      walkTo(x, y) { A.pose = null; if (A.mode === 'sleep') { A.mode = 'idle'; A.sitT = 0; setExpr(baseExpr()); } return walk(x, y); },
      place(x, y, left) { walkId++; A.x = x; A.y = y; A.left = !!left; A.mode = 'idle'; A.moving = false; A.target = 0; },
      async sleep(on) {
        clearInterval(A.zz);
        if (on && A.mode !== 'sleep') { await act('bostezo'); A.mode = 'sleep'; A.sitT = 1; setExpr('dormida');
          A.zz = setInterval(() => { if (A.mode !== 'sleep') return clearInterval(A.zz); emit('zz', A.x + 10, top() + 6, { vx: 4, vy: -8, life: 1.6 }); }, 900); }
        else if (!on && A.mode === 'sleep') { A.mode = 'idle'; A.sitT = 0; setExpr('sorpresa', 700); }
      },
      get busy() { return busy; },
      poke() { A.joy = 1; setExpr('amor', 1500); if (!busy) { A.pose = 'cheeks'; setTimeout(() => { if (A.pose === 'cheeks') A.pose = null; }, 1500); }
        for (let i = 0; i < 4; i++) emit('heart', A.x + Math.random() * 14 - 7, top(), { vy: -14, life: 1.2, delay: i * .12 }); },
      async celebrate(atoms = 15) { if (busy) return; busy = true; try { await withPose('up', async () => {
        say('¡Terminaste una sesión de estudio!'); setExpr('feliz'); A.joy = 1; A.excite = 1;
        emit('num', A.x, top() - 2, { vy: -8, life: 2, spr: P.sprite(textRows('+' + atoms + 'a')) });
        for (let i = 0; i < 7; i++) emit('star', A.x + Math.random() * 34 - 17, top() + 12 - Math.random() * 16, { vy: -9, life: 1.1, delay: i * .1 });
        await wait(700); A.joy = 1; await wait(1300); setExpr(baseExpr()); }); } finally { busy = false; } },
      night(on) { A.night = on; if (!on && A.mode === 'sleep') say('¡Buenos días!'); },
      storm(on) { A.storm = on; setExpr(baseExpr()); if (on) { say('¡Tormenta! Se pone nerviosa…'); const iv = setInterval(() => { if (!A.storm) return clearInterval(iv);
        A.flash = .25; A.shake = .5; emit('bang', A.x, top(), { vy: -6, life: .6 }); }, 3200); } },
      pause(p) { paused = p; }, stop() { running = false; }
    };
  }
  window.PixelVida = Object.freeze({ create, textRows });
})();
