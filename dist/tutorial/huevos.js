/* Huevos vivos del tutorial (docs/tutorial/SPEC.md › «Huevos y mascota»).
   NexoHuevos.attach(huevoEl, kind) pone un canvas pixelado ENCIMA del huevo (mismo tamaño de píxel de arte: 1 px = 1 px del PNG, con margen)
   que dibuja la vida propia de cada uno: átomo = electrones orbitando, matraz = burbujas que suben y revientan, slime = gotas gelatinosas.
   Devuelve { excite(bool), level(0-3), burst(), stop() }: excite = hover; level = luz que se escapa por las grietas; burst = estallido del nacimiento.
   Se apaga solo si el huevo sale de la página. El que lo llama decide no montarlo con «reducir movimiento». */
(() => {
  'use strict';
  const W = 120, H = 120, CX = 60, CY = 58;          // el huevo del arte (56×64, centro 28,30) queda en el centro con 32/28 px de margen
  const COL = {
    atomo:  { main: [120, 215, 240], hi: [225, 250, 255], acc: [255, 170, 80] },
    matraz: { main: [154, 226, 180], hi: [235, 255, 240], acc: [190, 240, 120] },
    slime:  { main: [200, 232, 100], hi: [245, 255, 190], acc: [110, 200, 90] }
  };
  const GOLD = [255, 226, 140];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const dentro = (x, y) => { const t = (y - CY) / 18.5; return Math.abs(t) < 1 && Math.abs(x - CX) <= 14.5 * Math.sqrt(1 - t * t) * (1 + .14 * t); };

  function attach(host, kind) {
    const L = COL[kind] || COL.atomo;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.className = 'tut-egg-fx'; cv.setAttribute('aria-hidden', 'true');
    host.append(cv); const g = cv.getContext('2d');
    const parts = [], rings = [];
    let excite = 0, exciteTo = 0, level = 0, last = 0, raf = 0, dead = false, t = 0;
    const acc = { b: 0, o: 0, s: 0, l: 0, e: 0, f: 0 };   // acumuladores de aparición
    const electrons = [{ orb: 0, th: 0, sp: 1.7 }, { orb: 1, th: 2.1, sp: -1.9 }, { orb: 0, th: 3.9, sp: 1.7 }];

    const add = p => { parts.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 1, max: 1, sz: 1, col: L.hi, k: 'sq' }, p)); };
    const px = (x, y, w, h, c, a) => { g.fillStyle = rgba(c, a); g.fillRect(Math.round(x), Math.round(y), w, h); };

    function brillo(dt, rate) {                       // destellos en cruz sobre la parte iluminada del huevo
      acc.s += dt * rate;
      while (acc.s > 1) { acc.s--; add({ x: CX + rnd(-12, 4), y: CY + rnd(-15, -1), life: rnd(.4, .7), k: 'cross' }); }
    }
    function especie(dt) {
      const e = 1 + excite * 2.4;
      if (kind === 'atomo') {
        electrons.forEach(el => { el.th += el.sp * dt * e; });
        acc.e += dt * (3 + excite * 8);
        while (acc.e > 1) { acc.e--; const el = electrons[Math.floor(Math.random() * 3)], p = pos(el); add({ x: p[0], y: p[1], vx: rnd(-6, 6), vy: rnd(-6, 6), life: rnd(.3, .6), col: L.main }); }
      } else if (kind === 'matraz') {
        acc.b += dt * (2.2 + excite * 6);
        while (acc.b > 1) { acc.b--; add({ x: CX + rnd(-8, 8), y: CY + 14, vy: -rnd(10, 18), life: 1.3, max: 1.3, sz: Math.random() < .4 ? 2 : 1, ph: rnd(0, 6), k: 'bub', col: L.hi }); }
        acc.o += dt * (.6 + excite * 2);
        while (acc.o > 1) { acc.o--; add({ x: CX + rnd(-6, 6), y: CY - 18, vy: -rnd(10, 16), life: 1.6, max: 1.6, sz: 3, ph: rnd(0, 6), k: 'ring', col: L.main }); }
      } else {
        acc.b += dt * (1.4 + excite * 4);
        while (acc.b > 1) { acc.b--; add({ x: CX + rnd(-9, 9), y: CY + rnd(0, 12), vy: -rnd(3, 7), life: 1.7, max: 1.7, sz: 2, k: 'blob', col: L.hi }); }
        acc.o += dt * (1.1 + excite * 2);
        while (acc.o > 1) { acc.o--; const s = Math.random() < .5 ? -1 : 1; add({ x: CX + s * 17, y: CY + 23, vy: 6, g: 70, life: .7, max: .7, sz: 1, col: L.main, k: 'drip' }); }
        acc.l += dt * .9;
        while (acc.l > 1) { acc.l--; add({ x: CX + rnd(-14, 14), y: CY - 14, vy: -rnd(5, 9), vx: rnd(-3, 3), life: 1.8, max: 1.8, col: L.acc, k: 'sq' }); }
      }
    }
    function pos(el) {
      const tilt = el.orb ? -.5 : .5, u = 15.5 * Math.cos(el.th), v = 6 * Math.sin(el.th);
      return [CX + u * Math.cos(tilt) - v * Math.sin(tilt), CY + u * Math.sin(tilt) + v * Math.cos(tilt), Math.sin(el.th) < 0];
    }
    function fuga(dt) {                               // luz dorada que se escapa por las grietas
      if (!level) return;
      acc.f += dt * level * level * 5;
      while (acc.f > 1) { acc.f--; add({ x: CX + rnd(-6, 6), y: CY + rnd(-14, 8), vx: rnd(-14, 14), vy: -rnd(18, 40), life: rnd(.3, .6), col: GOLD, sz: level > 1 && Math.random() < .4 ? 2 : 1 }); }
    }

    function frame(now) {
      raf = 0; if (dead) return;
      if (!host.isConnected) { dead = true; return; }
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; t += dt;
      excite += (exciteTo - excite) * Math.min(1, dt * 8);
      g.clearRect(0, 0, W, H);
      brillo(dt, 1.8 + excite * 5); especie(dt); fuga(dt);

      if (kind === 'atomo') electrons.forEach(el => {                    // electrón con estela
        for (let k = 5; k >= 0; k--) {
          const p = pos({ orb: el.orb, th: el.th - Math.sign(el.sp) * k * .17 }), back = p[2];
          if (k === 0) { px(p[0] - 1, p[1] - 1, 3, 3, L.main, back ? .25 : .4); px(p[0], p[1], 2, 2, L.hi, back ? .6 : 1); }
          else px(p[0], p[1], 1, 1, L.main, (back ? .25 : .55) * (1 - k / 6));
        }
      });

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.life -= dt;
        if (p.life <= 0) {
          if (p.k === 'bub') add({ x: p.x, y: p.y, life: .22, max: .22, k: 'pop', col: L.hi });
          parts.splice(i, 1); continue;
        }
        p.vy += p.g * dt; p.x += (p.vx + (p.ph !== undefined ? Math.sin(t * 4 + p.ph) * 5 : 0)) * dt; p.y += p.vy * dt;
        const f = p.life / p.max, a = p.k === 'cross' ? Math.sin(Math.min(1, (1 - f) * 1) * Math.PI) : Math.min(1, f * 1.6);
        if (p.k === 'bub') {
          if (!dentro(p.x, p.y)) { p.life = Math.min(p.life, .01); continue; }
          px(p.x, p.y, p.sz, p.sz, L.hi, .9); px(p.x, p.y, 1, 1, [255, 255, 255], 1);
        } else if (p.k === 'ring') {
          g.strokeStyle = rgba(p.col, a * .85); g.lineWidth = 1; g.strokeRect(Math.round(p.x) + .5, Math.round(p.y) + .5, 3, 3); px(p.x + 1, p.y + 1, 1, 1, [255, 255, 255], a);
        } else if (p.k === 'pop') {
          const r = (1 - p.life / p.max) * 3 + 1;
          px(p.x - r, p.y, 1, 1, p.col, f); px(p.x + r, p.y, 1, 1, p.col, f); px(p.x, p.y - r, 1, 1, p.col, f); px(p.x, p.y + r, 1, 1, p.col, f);
        } else if (p.k === 'blob') {
          const a2 = Math.sin(Math.PI * (1 - f)) * .8; if (!dentro(p.x, p.y)) continue;
          px(p.x, p.y, 2, 2, L.hi, a2); px(p.x, p.y, 1, 1, [255, 255, 255], a2);
        } else if (p.k === 'drip') {
          px(p.x, p.y, 1, 2, L.main, 1); if (p.life < .08) { px(p.x - 1, p.y + 2, 3, 1, L.main, .8); }
        } else if (p.k === 'cross') {
          px(p.x, p.y, 1, 1, [255, 255, 255], a); px(p.x - 1, p.y, 1, 1, L.hi, a * .7); px(p.x + 1, p.y, 1, 1, L.hi, a * .7); px(p.x, p.y - 1, 1, 1, L.hi, a * .7); px(p.x, p.y + 1, 1, 1, L.hi, a * .7);
        } else px(p.x, p.y, p.sz, p.sz, p.col, a);
      }
      for (let i = rings.length - 1; i >= 0; i--) {                      // onda de choque del estallido
        const r = rings[i]; r.life -= dt; if (r.life <= 0) { rings.splice(i, 1); continue; }
        const f = 1 - r.life / r.max; g.strokeStyle = rgba(r.col, (1 - f) * .9); g.lineWidth = 2;
        g.beginPath(); g.ellipse(CX, CY, 6 + f * 52, 5 + f * 44, 0, 0, 7); g.stroke();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      excite(v) { exciteTo = v ? 1 : 0; },
      level(n) { level = n; },
      burst() {                                       // trozos de cáscara + chispas + onda
        for (let i = 0; i < 26; i++) {
          const a = rnd(0, 6.283), v = rnd(35, 95), big = Math.random() < .45;
          add({ x: CX + Math.cos(a) * 6, y: CY + Math.sin(a) * 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 38, g: 130, life: rnd(1, 1.6), max: 1.6, sz: big ? 3 : 2, col: [L.main, L.hi, L.acc][i % 3], k: 'sq' });
        }
        for (let i = 0; i < 46; i++) {
          const a = rnd(0, 6.283), v = rnd(40, 150);
          add({ x: CX, y: CY, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, g: 25, life: rnd(.5, 1.1), max: 1.1, sz: 1, col: i % 4 ? GOLD : [255, 255, 255], k: 'sq' });
        }
        rings.push({ life: .7, max: .7, col: GOLD }, { life: 1, max: 1, col: L.main });
      },
      stop() { dead = true; if (raf) cancelAnimationFrame(raf); cv.remove(); }
    };
  }
  window.NexoHuevos = Object.freeze({ attach });
})();
