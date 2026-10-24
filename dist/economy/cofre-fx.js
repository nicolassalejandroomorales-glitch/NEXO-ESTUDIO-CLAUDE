/* Apertura épica del cofre (docs/economia/SPEC.md). Solo pinta y anima; la lógica está en tienda.js.
   Estilo de movimiento: skill nexo-animacion (core/movimiento.js). El cofre son piezas (cuerpo, tapa, brillo) con resorte propio,
   se dibuja en su tamaño real de píxel y se amplía entero; hay pausa de impacto, temblor de cámara en píxeles enteros y cada evento
   suena por NexoMovimiento.sonido.
   Guion: el cofre se carga de energía (chispas que entran) y tiembla -> se agacha y explota la tapa (destello, onda, rayos, hojas)
   -> ruleta que gira rapidísimo, se acerca y frena con tensión -> golpe seco: onda de choque, cartel de rareza y fuente de chispas.
   Cuanto más raro, más grande.
   NexoCofre.play({ winner, ids, tile, reduced, title, note, again }) -> Promise<'again' | 'close'> */
(() => {
  'use strict';
  const Mov = window.NexoMovimiento;
  const ART = './assets/tienda/';
  const LOOK = {   // cols: colores de chispas; amp: sacudida; sparks: chispas al caer el premio; rings: ondas; label: cartel
    comun:      { cols: ['#fff4d8', '#e6d6b2', '#b9a98a'], amp: 3,  sparks: 30,  rings: 1, flash: 0,  label: 'COMÚN' },
    poco:       { cols: ['#e2ee8a', '#b2cf5c', '#6cc08b'], amp: 6,  sparks: 60,  rings: 2, flash: 0,  label: 'POCO COMÚN' },
    raro:       { cols: ['#e0fcff', '#9ce8f0', '#6aa7ff'], amp: 12, sparks: 120, rings: 3, flash: .5, label: '¡RARO!' },
    legendario: { cols: ['#fffce8', '#ffd860', '#f2b84b'], amp: 22, sparks: 260, rings: 5, flash: 1,  label: '¡LEGENDARIO!' }
  };
  const LEAVES = ['#5d8c36', '#83ad42', '#b2cf5c', '#3f6e2d'];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = x => 1 - Math.pow(1 - x, 4.2);

  // Cofre en píxeles reales: 80×66 de arte, partido en cuerpo y tapa por la fila SPLIT, más márgenes para que la tapa vuele.
  // Se dibuja en un lienzo de BW×BH y el CSS (.cfx-px) lo amplía entero con image-rendering: pixelated.
  const CW = 80, CH = 66, SPLIT = 35, MX = 16, MT = 44, MB = 12, BW = CW + MX * 2, BH = CH + MT + MB;
  const art = new Image(); art.src = ART + 'cofre-cerrado.png';
  const CARGA_S = 1.25;   // segundos de carga antes de explotar

  // ——— capa de efectos: chispas, hojas, ondas y rayos en un canvas a pantalla completa ———
  // Es también el único bucle de cuadros de la escena: avanza los resortes del cofre y descuenta la pausa de impacto.
  function makeFx(canvas, esc, onFrame) {
    const ctx = canvas.getContext('2d'); let W = 0, H = 0, last = performance.now(); const things = [];
    const size = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
    size();
    const add = o => things.push({ age: 0, ...o });
    (function loop(now) {
      if (!canvas.isConnected) return;
      const dt = esc.paso((now - last) / 1000); last = now;   // 0 durante la pausa de impacto: todo se congela un instante
      onFrame(dt);
      ctx.clearRect(0, 0, W, H);
      for (let i = things.length - 1; i >= 0; i--) {
        const p = things[i]; p.age += dt;
        if (p.age >= p.life) { things.splice(i, 1); continue; }
        const k = p.age / p.life;
        if (p.kind === 'ring') {
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - k) * .9; ctx.strokeStyle = p.color; ctx.lineWidth = p.width * (1 - k * .7);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r0 + (p.r1 - p.r0) * ease(k), 0, 6.283); ctx.stroke();
        } else if (p.kind === 'beam') {
          const g = ctx.createLinearGradient(0, p.y - p.h, 0, p.y); g.addColorStop(0, p.color + '00'); g.addColorStop(1, p.color);
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (k < .15 ? k / .15 : 1 - (k - .15) / .85) * .7; ctx.fillStyle = g;
          const w = p.w * (1 - k * .5); ctx.fillRect(p.x - w / 2, p.y - p.h, w, p.h);
        } else if (p.kind === 'charge') {            // chispa que viaja hacia el cofre
          const e = k * k; p.x = p.x0 + (p.tx - p.x0) * e; p.y = p.y0 + (p.ty - p.y0) * e;
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, k * 3) * (1 - k * .3); ctx.fillStyle = p.color;
          const s = p.s * (1 - k * .5); ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
        } else {
          p.vy += (p.g || 0) * dt; p.vx *= 1 - (p.drag || 0) * dt; p.vy *= 1 - (p.drag || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.kind === 'leaf') {
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1 - k * k; ctx.fillStyle = p.color;
            ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y)); ctx.rotate(p.rot + p.spin * p.age); ctx.fillRect(-p.s, -p.s / 2, p.s * 2, p.s); ctx.restore();
          } else {                                    // spark / ember
            ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - k) * (p.kind === 'ember' ? .8 : 1); ctx.fillStyle = p.color;
            const s = Math.max(2, p.s * (1 - k * .6)), x = Math.round(p.x / 2) * 2, y = Math.round(p.y / 2) * 2;
            ctx.fillRect(x, y, s, s); ctx.globalAlpha *= .25; ctx.fillRect(x - s, y - s, s * 3, s * 3);
          }
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(loop);
    })(last);
    return { add, size };
  }

  const TILES = 70, WIN_AT = 58;

  /* winner: {id, rarity}; ids: [{id, rarity}] para rellenar la ruleta; tile(id) -> <canvas> del accesorio. */
  async function play({ winner, ids, tile, reduced = false, title = '', note = '', again = false }) {
    const quieto = reduced || Mov.reducido();   // respeta el ajuste de la mascota, el del sistema y el ambiental
    const rarity = winner.rarity, L = LOOK[rarity] || LOOK.comun, big = rarity === 'raro' || rarity === 'legendario', legend = rarity === 'legendario';
    const snd = Mov.sonido, n = Mov.cantidad;
    const el = document.createElement('div');
    el.className = 'cofre-fx'; el.dataset.rarity = rarity;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Abriendo cofre');
    el.innerHTML = `<div class="cofre-fx-rays"></div><div class="cofre-fx-vignette"></div>
      <div class="cfx-world">
        <div class="cofre-fx-stage"><div class="cofre-fx-chest"><div class="cfx-glow"></div><canvas class="cfx-px" width="${BW}" height="${BH}"></canvas></div></div>
        <div class="cofre-fx-roulette pu-panel" hidden><div class="cfx-window"><div class="cfx-strip"></div><i class="cfx-marker"></i></div></div>
        <div class="cfx-banner" hidden></div>
        <div class="cofre-fx-card pu-paper" hidden><p class="cfx-title"></p><p class="cfx-note"></p><div class="cfx-actions"></div></div>
      </div><canvas class="cofre-fx-parts"></canvas><div class="cofre-fx-flash"></div>`;
    document.body.append(el);
    const $ = s => el.querySelector(s), world = $('.cfx-world'), chest = $('.cofre-fx-chest'), stage = $('.cofre-fx-stage'), roulette = $('.cofre-fx-roulette'),
      strip = $('.cfx-strip'), card = $('.cofre-fx-card'), banner = $('.cfx-banner'), marker = $('.cfx-marker'), glowEl = $('.cfx-glow'), px = $('.cfx-px').getContext('2d');
    px.imageSmoothingEnabled = false;

    // Piezas del cofre, cada una con su resorte. sq = aplastar (+) / estirar (−), dx y giro = temblor, tapa = altura y giro, brillo = luz.
    const esc = Mov.escena({ reducido: quieto });
    const sq = esc.resorte('aplastar'), dx = esc.resorte('corcho'), giro = esc.resorte('aplastar'),
      tapaY = esc.resorte('tapa'), tapaGiro = esc.resorte('tapa'), brillo = esc.resorte('brillo');
    const carga = { on: false, t: 0, prox: 0, dir: 1 };
    function drawChest() {
      if (!art.complete || !art.naturalWidth) return;
      const al = Mov.alinear, alto = -tapaY.valor;
      px.clearRect(0, 0, BW, BH);
      px.save();
      px.translate(MX + CW / 2 + al(dx.valor), MT + CH);                       // pivote: la base del cofre
      px.rotate(al(giro.valor, .02)); px.scale(1 + .18 * sq.valor, 1 - .2 * sq.valor); px.translate(-CW / 2, -CH);
      px.drawImage(art, 0, SPLIT, CW, CH - SPLIT, 0, SPLIT, CW, CH - SPLIT);   // cuerpo
      if (alto > 1) {                                                          // la boca: oscuridad con luz en el borde
        px.globalAlpha = Math.min(1, alto / 8); px.fillStyle = '#1a0b12'; px.fillRect(4, SPLIT - 4, CW - 8, 4);
        px.fillStyle = '#ffd860'; px.fillRect(5, SPLIT - 1, CW - 10, 1); px.globalAlpha = 1;
      }
      px.translate(CW / 2, SPLIT + al(tapaY.valor)); px.rotate(al(tapaGiro.valor, .02)); px.translate(-CW / 2, -SPLIT);
      px.drawImage(art, 0, 0, CW, SPLIT, 0, 0, CW, SPLIT);                     // tapa
      px.restore();
      glowEl.style.opacity = Math.max(0, Math.min(1, brillo.valor)).toFixed(3);
      glowEl.style.transform = `scale(${(.3 + .75 * brillo.valor).toFixed(3)},${(.3 + .9 * brillo.valor).toFixed(3)})`;
    }
    // Se llama en cada cuadro con el tiempo ya descontado por la pausa de impacto.
    function drive(dt) {
      if (quieto) return;
      if (carga.on && dt > 0) {            // golpecitos que alternan de lado, se aceleran y se hacen más fuertes
        carga.t += dt; const p = Math.min(1, carga.t / CARGA_S);
        brillo.meta = .15 + .75 * p;
        carga.prox -= dt;
        if (carga.prox <= 0) {
          carga.prox = .11 - .065 * p; carga.dir *= -1;
          dx.empujar(carga.dir * (10 + 32 * p)); giro.empujar(-carga.dir * (.3 + .9 * p)); sq.empujar(1 + 4 * p);
        }
      }
      drawChest();
      const t = esc.temblor(); world.style.translate = t.x || t.y ? `${t.x}px ${t.y}px` : '';   // 'translate' no pelea con el zoom de cámara
    }
    const fx = makeFx($('.cofre-fx-parts'), esc, drive);

    const mk = (item, win) => { const d = document.createElement('div'); d.className = 'cfx-tile'; d.dataset.r = item.rarity; if (win) d.dataset.win = '1'; d.append(tile(item.id)); return d; };
    const flash = () => { const f = $('.cofre-fx-flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); };
    let done; const result = new Promise(r => { done = r; });
    const close = v => { el.classList.add('cfx-out'); setTimeout(() => { el.remove(); done(v); }, quieto ? 0 : 260); };
    const showCard = () => {
      card.hidden = false; $('.cfx-title').textContent = title; $('.cfx-note').textContent = note;
      $('.cfx-actions').innerHTML = `${again ? '<button type="button" class="pu-btn" data-r="again">Abrir otro</button>' : ''}<button type="button" class="pu-btn" data-r="close">Listo</button>`;
      $('.cfx-actions button:last-child').focus({ preventScroll: true });
    };
    el.addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (b) close(b.dataset.r); });
    el.addEventListener('keydown', e => { if (e.key === 'Escape' && !card.hidden) close('close'); });
    addEventListener('resize', fx.size);

    if (quieto) {
      stage.hidden = true; roulette.hidden = false; strip.append(mk(winner, true)); strip.style.margin = '0 auto';
      el.classList.add('cfx-won'); banner.hidden = false; banner.textContent = L.label; snd('premio', rarity); showCard(); return result;
    }
    strip.append(...Array.from({ length: TILES }, (_, i) => i === WIN_AT ? mk(winner, true) : mk(ids[Math.floor(Math.random() * ids.length)], false)));

    // 1. CARGA: la cámara se acerca, entran chispas al cofre y tiembla cada vez más fuerte
    await wait(60); el.classList.add('cfx-charge'); carga.on = true; snd('preparar');
    const chestBox = () => { const r = chest.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * .55 }; };
    const ccx = chestBox();
    for (let i = 0, total = n(70); i < total; i++) setTimeout(() => {
      const a = rnd(0, 6.283), d = rnd(220, 420), c = chestBox();
      fx.add({ kind: 'charge', x0: c.x + Math.cos(a) * d, y0: c.y + Math.sin(a) * d * .7, tx: c.x, ty: c.y, life: rnd(.5, .9), s: 4, color: L.cols[i % 3] });
    }, i * 17);
    for (let i = 0, total = n(14); i < total; i++) setTimeout(() => fx.add({ kind: 'ember', x: ccx.x + rnd(-110, 110), y: ccx.y + 70, vx: rnd(-10, 10), vy: rnd(-90, -40), life: rnd(.8, 1.4), s: 4, color: L.cols[1] }), i * 80);
    await wait(CARGA_S * 1000);

    // 2. EXPLOSIÓN: se agacha (anticipación), salta estirado y revienta; pausa de impacto, tapa con resorte, destello, onda, rayos y hojas
    carga.on = false; sq.meta = 1; snd('lanzar');
    await wait(150);
    sq.meta = 0; sq.empujar(-16);
    tapaY.meta = -26; tapaY.empujar(-420); tapaGiro.meta = -.3; tapaGiro.empujar(-4); brillo.meta = .9; brillo.empujar(30);
    esc.golpe({ pausa: .07, temblor: 10, duracion: .5 }); el.classList.add('cfx-lit'); flash(); snd('estallar');
    const c = chestBox();
    fx.add({ kind: 'ring', x: c.x, y: c.y, r0: 10, r1: 360, life: .7, color: '#ffe9a0', width: 8 });
    fx.add({ kind: 'ring', x: c.x, y: c.y, r0: 6, r1: 220, life: .5, color: L.cols[2], width: 5 });
    for (let i = -2; i <= 2; i++) fx.add({ kind: 'beam', x: c.x + i * 46, y: c.y, w: 22 + (2 - Math.abs(i)) * 14, h: 520 - Math.abs(i) * 90, life: 1.3, color: i % 2 ? L.cols[1] : '#ffe9a0' });
    for (let i = 0, total = n(70); i < total; i++) fx.add({ kind: 'spark', x: c.x + rnd(-60, 60), y: c.y - 10, vx: rnd(-330, 330), vy: rnd(-620, -120), g: 760, drag: .3, life: rnd(.8, 1.6), s: rnd(3, 7) | 0, color: i % 2 ? L.cols[0] : L.cols[1] });
    for (let i = 0, total = n(28); i < total; i++) fx.add({ kind: 'leaf', x: c.x + rnd(-80, 80), y: c.y, vx: rnd(-260, 260), vy: rnd(-520, -160), g: 380, drag: 1.1, life: rnd(1.4, 2.4), s: rnd(3, 5) | 0, rot: rnd(0, 6), spin: rnd(-8, 8), color: LEAVES[i % 4] });
    await wait(900);

    // 3. RULETA: baja, gira a toda velocidad, se acerca a la cámara y frena con tensión
    stage.classList.add('cfx-away'); roulette.hidden = false; roulette.classList.add('cfx-drop'); snd('girar');
    await wait(520);
    const tw = strip.children[1].getBoundingClientRect().left - strip.children[0].getBoundingClientRect().left, view = strip.parentElement.clientWidth;
    const end = WIN_AT * tw + tw / 2 - view / 2 + (Math.random() - .5) * tw * .6, dur = big ? 8200 : 6600, t0 = performance.now();
    const tiles = [...strip.children], overshoot = tw * .25; let last = -1;
    el.classList.add('cfx-spin');
    await new Promise(res => (function frame() {
      const k = Math.min(1, (performance.now() - t0) / dur), kk = Math.min(1, k / .88);
      const x = end * ease(kk) + (k > .88 ? overshoot * Math.sin(Math.PI * (1 - (k - .88) / .12)) * (1 - (k - .88) / .12) : 0);
      strip.style.transform = `translate3d(${-x}px,0,0)`;
      const centre = x + view / 2, speed = Math.min(1, (1 - ease(kk)) * 3);
      roulette.style.transform = `scale(${1 + .16 * Math.pow(k, 2)})`;                       // se acerca mientras frena
      world.style.setProperty('--tension', Math.max(0, (k - .55) / .45).toFixed(3));
      const lo = Math.max(0, Math.floor(centre / tw) - 5), hi = Math.min(tiles.length - 1, lo + 10);
      for (let i = lo; i <= hi; i++) {
        const d = Math.min(1.6, Math.abs((i + .5) * tw - centre) / tw), near = Math.max(0, 1 - d);
        tiles[i].style.transform = `scale(${1 + .26 * near}) translateY(${-8 * near}px)`;
        tiles[i].style.filter = `blur(${(speed * 3 * Math.min(1, d + .2)).toFixed(2)}px) brightness(${1 + .25 * near})`;
      }
      const idx = Math.floor(centre / tw);
      if (idx !== last) { last = idx; if (k < .985) snd('paso'); marker.classList.remove('cfx-tick'); void marker.offsetWidth; marker.classList.add('cfx-tick'); }
      k < 1 && el.isConnected ? requestAnimationFrame(frame) : res();
    })());
    tiles.forEach(tl => { if (!tl.dataset.win) tl.style.transform = ''; tl.style.filter = ''; });

    // 4. GOLPE: se detiene, pausa de impacto, onda de choque, cartel de rareza y fuente de chispas
    el.classList.remove('cfx-spin'); snd('golpe');
    esc.golpe({ pausa: big ? .1 : .06, temblor: L.amp, duracion: .7 });
    await wait(big ? 100 : 60);
    el.classList.add('cfx-won'); setTimeout(() => snd('premio', rarity), 60); if (L.flash) flash();
    const wt = strip.querySelector('[data-win]').getBoundingClientRect(), wx = wt.left + wt.width / 2, wy = wt.top + wt.height / 2;
    for (let i = 0; i < L.rings; i++) setTimeout(() => fx.add({ kind: 'ring', x: wx, y: wy, r0: 20, r1: 260 + i * 110, life: .8 + i * .1, color: L.cols[i % 3], width: 8 - i }), i * 120);
    for (let i = 0, total = n(L.sparks); i < total; i++) fx.add({ kind: 'spark', x: wx + rnd(-30, 30), y: wy, vx: rnd(-520, 520), vy: rnd(-760, -160), g: 900, drag: .4, life: rnd(.9, 1.9), s: rnd(3, 8) | 0, color: L.cols[i % 3] });
    if (big) for (let i = 0, total = n(legend ? 50 : 24); i < total; i++) fx.add({ kind: 'leaf', x: wx + rnd(-200, 200), y: -20, vx: rnd(-60, 60), vy: rnd(60, 200), g: 120, drag: .5, life: rnd(2, 3.4), s: rnd(3, 5) | 0, rot: rnd(0, 6), spin: rnd(-6, 6), color: LEAVES[i % 4] });
    banner.hidden = false; banner.textContent = L.label; banner.classList.add('go');
    await wait(big ? 1100 : 650); showCard();
    return result;
  }

  window.NexoCofre = Object.freeze({ play });
})();
