/* Mundo de la torre (docs/mundo-torre/SPEC.md).
   Entrenar (#/train) = Laboratorio de Orgánica II, por capas con parallax (fase 2, tools/torre-pixel/build_lab_muestra.py).
   Juegos (#/games) = Arcade arcano (v1, tools/torre-pixel/build_torre.py). Tocas el piso o un objeto y la mascota camina hasta ahí; el objeto hace su acción.
   Se inserta solo cuando aparece la página (observa #app): no hay que tocar las pantallas. Arte: tools/torre-pixel/build_torre.py. */
(() => {
  'use strict';
  const V = '1';
  const BASE = 'assets/torre/';
  const ROOM_NAMES = { train: 'Laboratorio de Orgánica II', games: 'Arcade arcano' };
  const HINT = 'Toca el piso para caminar o un objeto para usarlo';
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let data = null, loading = null, cssDone = false;
  const worlds = {};          // 'mundo' | 'lab' → estado persistente (la mascota no "salta" al cambiar de pantalla)
  const layerCache = {};
  const query = new URLSearchParams(location.search);       // para probar: ?hora=dia|tarde|noche  ?estado=0|1|2

  function img(src) {
    return new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = BASE + src + '?v=' + V; });
  }
  function load() {
    if (!cssDone) {
      cssDone = true;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'world/torre-mundo.css?v=' + V; document.head.append(l);
    }
    loading = loading || Promise.all([
      fetch(BASE + 'torre.json?v=' + V).then(r => r.json()), img('mundo.png'),
      fetch(BASE + 'lab/lab.json?v=' + V).then(r => r.json()),
      window.NexoPet?.engine ? window.NexoPet.engine() : Promise.reject(new Error('sin mascota'))
    ]).then(([json, mundo, lab]) => {
      lab.objects.forEach(o => { o.room = 'lab'; });
      json.lab = lab;
      data = { json, imgs: { mundo } }; return data;
    });
    return loading;
  }

  // ——— Un mundo: fondo animado + mascota (PixelVida en modo manual) + vista con cámara ———
  function createWorld(key) {
    const meta = data.json[key], base = data.imgs[key], layered = key === 'lab';
    const bg = document.createElement('canvas'); bg.width = meta.w; bg.height = meta.h;
    const bctx = bg.getContext('2d'); bctx.imageSmoothingEnabled = false;
    const stage = document.createElement('canvas'); stage.width = meta.w; stage.height = meta.h;
    const pet = window.NexoPet.current(), reduced = window.NexoPet.reduced();
    const home = key === 'mundo' ? meta.rooms.train.home : meta.home;
    const life = window.PixelVida.create({ canvas: stage, background: layered ? null : bg, stations: {}, route: [], manual: true, speed: 2.2,
      start: { x: home[0], y: home[1] }, kind: pet.kind, reduced, depth: y => .86 + clamp((y - 122) / 22, 0, 1) * .14 });
    life.setOutfit(pet.outfit);

    const wrap = document.createElement('section');
    wrap.className = 'torre-scene'; wrap.dataset.world = key;
    wrap.innerHTML = `<canvas class="torre-view" height="${meta.h}" aria-hidden="true"></canvas><div class="torre-title"></div>
      <p class="torre-tip" hidden></p><p class="torre-say" role="status" aria-live="polite" hidden></p>
      <p class="torre-hint">${HINT}</p><div class="torre-keys" role="group" aria-label="Objetos de la sala"></div>`;
    const view = wrap.querySelector('.torre-view'), vctx = view.getContext('2d');
    const W = {
      key, meta, base, bg, bctx, stage, life, wrap, view, vctx, reduced, layered,
      room: key === 'mundo' ? 'games' : 'lab', camX: 0, vw: meta.w, scale: 1, raf: 0, last: performance.now(),
      lastInput: performance.now(), nextIdle: 9000, sayTimer: 0, tab: null, crossing: false, hover: null, t: 0
    };
    wireInput(W);
    return W;
  }

  // Cuadros animados encima del arte fijo: llamas, burbujas del caldero, pantallas, farolitos y el portal.
  const FLAME_COLORS = ['#a83818', '#dc6420', '#f89a30', '#ffc850', '#ffe890', '#fffce8'];
  function paintBackground(W, t) {
    const { bctx: g, base, meta } = W, a = meta.anim || {};
    g.drawImage(base, 0, 0);
    if (W.reduced) return;
    const px = (x, y, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
    (a.flames || []).forEach((f, i) => {
      const k = Math.floor(t * 7 + i * 1.7) % 3;
      if (f.k === 'big') {
        const tip = [[2, 0], [1, 0], [3, 0]][k];
        px(f.x + tip[0], f.y + tip[1], FLAME_COLORS[2]);
        if (k === 1) px(f.x + 1, f.y + 1, FLAME_COLORS[3]);
        px(f.x + 2, f.y + 2 + (k === 2 ? 1 : 0), FLAME_COLORS[5]);
      } else {
        px(f.x + [1, 0, 2][k], f.y, FLAME_COLORS[2]);
        px(f.x + 1, f.y + 1, FLAME_COLORS[k === 1 ? 4 : 5]);
      }
    });
    (a.bubbles || []).forEach((b, i) => {
      const p = (t * .8 + i * .37) % 1, y = b.y - p * 9, x = b.x + Math.sin(t * 3 + i) * 1.2;
      if (p < .85) { px(x, y, '#c6d862'); if (p > .5) px(x + 1, y, '#eef09a'); }
    });
    (a.screens || []).forEach((s, i) => {
      const y = s.y0 + Math.floor((t * 9 + i * 6) % (s.y1 - s.y0));
      g.fillStyle = 'rgba(156,232,240,.18)'; g.fillRect(s.x0, y, s.x1 - s.x0, 1);
      if (Math.sin(t * 1.3 + i * 2) > .96) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(s.x0, s.y0, s.x1 - s.x0, s.y1 - s.y0); }
    });
    (a.sparks || []).forEach((s, i) => { if (Math.sin(t * 2.2 + i * 1.9) > .55) { px(s.x, s.y, '#fffce8'); } });
    if (a.portal) {
      const { cx, cy, r } = a.portal;
      for (let k = 0; k < 7; k++) {
        const ang = t * (k % 2 ? 1.1 : -.8) + k * .9, rr = (r * .25) + ((t * 6 + k * 5) % (r * .75));
        px(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * .95, k % 3 ? '#dcc0ff' : '#f6ecff');
      }
    }
    if (a.pendulum) {
      const { x, y, len } = a.pendulum, sw = Math.sin(t * 2.4) * 3;
      if (!W.caseColor) { const d = g.getImageData(x + 8, y + 5, 1, 1).data; W.caseColor = `rgb(${d[0]},${d[1]},${d[2]})`; }
      g.fillStyle = W.caseColor; g.fillRect(x - 5, y + 1, 11, len + 5);              // tapa el péndulo fijo del arte
      for (let k = 0; k < len; k++) px(x + sw * k / len, y + k, '#e2b850');
      g.fillStyle = '#e2b850'; g.fillRect(Math.round(x + sw) - 2, y + len - 1, 5, 5);
      g.fillStyle = '#fff6c8'; g.fillRect(Math.round(x + sw) - 1, y + len, 2, 1);
    }
  }

  // ——— Laboratorio por capas (vista lejana · sala · mascota · primer plano), cada una con su parallax ———
  function timeOfDay() {
    const q = query.get('hora'); if (['dia', 'tarde', 'noche'].includes(q)) return q;
    const t = document.body.dataset.nexoTime;
    return t === 'night' ? 'noche' : t === 'dusk' ? 'tarde' : 'dia';
  }
  // Provisorio hasta diseñar el progreso del mundo (SPEC fase 2, paso 4): ejercicios de Aminas resueltos SIN ayuda / total.
  function labProgress() {
    const q = query.get('estado'); if (['0', '1', '2'].includes(q)) return Number(q);
    try {
      const st = JSON.parse(window.NexoStorage.getItem(window.NexoStorage.KEY) || '{}');
      const solved = new Set((st.academicIntelligence?.evidence || [])
        .filter(r => r.outcome === 'correct' && !r.assistanceUsed && String(r.exerciseId).startsWith('org-01:')).map(r => r.exerciseId));
      const total = window.NexoAcademicStructured?.cases?.length || 20;
      const f = solved.size / total;
      return f < .25 ? 0 : f < .75 ? 1 : 2;
    } catch (_) { return 0; }
  }
  function layersFor(W) {
    const tod = timeOfDay(), p = W.progress || 0, id = tod + '-' + p;
    if (W.layerId === id) return W.layers;
    const L = layerCache[id] = layerCache[id] || Promise.all([img(`lab/${tod}-vista.png`), img(`lab/${tod}-${p}-fondo.png`), img(`lab/${tod}-${p}-frente.png`)])
      .then(([vista, fondo, frente]) => ({ vista, fondo, frente, tod, p }));
    L.then(l => { if (W.layerId === id) W.layers = l; });
    W.layerId = id;
    return W.layers;
  }
  const PET_FILTER = { dia: 'none', tarde: 'brightness(.92) sepia(.18)', noche: 'brightness(.6) saturate(.8)' };
  function drawLayered(W, camX, t) {
    const g = W.vctx, m = W.meta, S = m.fine, L = layersFor(W);
    const center = (m.w - W.vw) / 2;
    const at = f => -Math.round((center + (camX - center) * f) * S);
    g.clearRect(0, 0, W.view.width, W.view.height);
    if (!L) return;
    const px = (x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
    g.drawImage(L.vista, at(m.parallax.vista), 0);
    const x1 = at(1);
    g.drawImage(L.fondo, x1, 0);
    const a = m.anim, still = W.reduced;
    if (!still) {
      a.bubbles.forEach(([bx, by], i) => { const k = (t * .7 + i * .29) % 1; if (k < .8) px(x1 + bx + Math.sin(t * 4 + i) * 1.5, by - k * 14, '#eef09a'); });
      a.drips.forEach(([dx, y0, y1]) => { const k = (t * .55) % 1; px(x1 + dx, y0 + k * (y1 - y0), '#9ce8f0'); px(x1 + dx, y0 + k * (y1 - y0) + 1, '#5cc4dc'); });
      a.lanterns.slice(0, m.lit[L.p]).concat(a.candles).forEach(([lx, ly], i) => {
        const k = Math.floor(t * 8 + i * 2.3) % 3;
        px(x1 + lx + (k === 1 ? -1 : k === 2 ? 1 : 0), ly - 1, '#ffc850');
        px(x1 + lx, ly + 1, k ? '#fffce8' : '#ffe890');
      });
      a.shrooms.forEach(([sx, sy], i) => { if (Math.sin(t * 1.4 + i * 2.1) > .7) px(x1 + sx, sy - 2 - (t * 3 + i) % 4, '#a8f0dc'); });
      (m.dust[L.tod] || []).forEach(([dx, dy], i) => {
        if (Math.sin(t * 1.1 + i) > -.2) px(x1 + dx + Math.sin(t * .8 + i) * 3, dy - ((t * 4 + i * 7) % 20), 'rgba(255,240,176,.85)');
      });
    }
    g.save(); g.filter = PET_FILTER[L.tod] || 'none';
    g.drawImage(W.stage, x1, 0, m.w * S, m.h * S);
    g.restore();
    const xf = at(m.parallax.frente);
    g.drawImage(L.frente, xf, 0, m.w * S, m.h * S);
    if (!still) {
      const [cx, cy] = a.frontCandle, k = Math.floor(t * 7) % 3;
      g.fillStyle = k ? '#fffce8' : '#ffe890'; g.fillRect(xf + cx * S + 2 + (k === 2 ? 2 : 0), cy * S - 2, 2, 2);
    }
  }

  function roomAt(W, x) {
    if (W.key !== 'mundo') return W.room;
    return x < W.meta.rooms.train.x1 ? 'train' : 'games';
  }

  function frame(W, now) {
    W.raf = 0;
    if (!W.wrap.isConnected) { W.life.pause(true); return; }
    const dt = Math.min(.05, (now - W.last) / 1000); W.last = now; W.t += dt;
    if (!W.layered) paintBackground(W, W.t);
    const A = W.life.state;
    // Cruzar el arco caminando cambia de pantalla (la escena es la misma, así que no se nota el cambio).
    if (W.key === 'mundo') {
      const r = roomAt(W, A.x);
      if (r !== W.room) { W.room = r; W.crossing = true; location.hash = '#/' + r; }
    }
    const maxCam = Math.max(0, W.meta.w - W.vw);
    const target = clamp(A.x - W.vw / 2, 0, maxCam);
    W.camX = W.reduced ? target : W.camX + (target - W.camX) * (1 - Math.exp(-dt * 4));
    const cam = Math.round(W.camX);
    W.vctx.imageSmoothingEnabled = false;
    if (W.layered) drawLayered(W, W.camX, W.t);
    else {
      W.vctx.clearRect(0, 0, W.vw, W.meta.h);
      W.vctx.drawImage(W.stage, cam, 0, W.vw, W.meta.h, 0, 0, W.vw, W.meta.h);
    }
    placeBubble(W, cam);
    idle(W, now);
    W.raf = requestAnimationFrame(t => frame(W, t));
  }

  // Como el refugio del Inicio: la escena es parte de la página, de borde a borde de la columna principal y pegada arriba.
  function resize(W) {
    const app = document.getElementById('app'), page = W.wrap.parentElement;
    if (!app || !page) return;
    const a = app.getBoundingClientRect(), p = page.getBoundingClientRect();
    const width = a.width;
    W.wrap.style.width = width + 'px';
    W.wrap.style.marginLeft = (a.left - p.left) + 'px';
    W.wrap.style.marginTop = -(parseFloat(getComputedStyle(page).paddingTop) || 0) + 'px';
    const room = W.key === 'mundo' ? W.meta.rooms.train.x1 : W.meta.w;      // una sala llena el ancho
    const minH = innerWidth < 700 ? 300 : 340, maxH = Math.max(minH, innerHeight * .72);
    let scale = Math.max(width / room, minH / W.meta.h);
    if (W.key === 'mundo') scale = Math.min(scale, maxH / W.meta.h);
    const cssH = Math.round(W.meta.h * scale);
    W.wrap.style.height = cssH + 'px';
    W.vw = Math.min(W.meta.w, Math.ceil(width / scale));
    W.scale = scale;
    const fine = W.layered ? W.meta.fine : 1;              // el laboratorio se dibuja en la grilla fina (x2)
    W.view.width = W.vw * fine; W.view.height = W.meta.h * fine;
    W.view.style.width = (W.vw * scale) + 'px'; W.view.style.height = cssH + 'px';
    const A = W.life.state;
    W.camX = clamp(A.x - W.vw / 2, 0, Math.max(0, W.meta.w - W.vw));
  }

  // ——— Entrada: tocar, pasar el mouse, teclado ———
  function toArt(W, e) {
    const r = W.view.getBoundingClientRect();
    return [Math.round(W.camX) + (e.clientX - r.left) / r.width * W.vw, (e.clientY - r.top) / r.height * W.meta.h, r];
  }
  function hit(W, x, y) {
    // Los objetos del arco existen en las dos salas: vale el de la sala donde estás. El resto, el de la sala que tocaste.
    return W.meta.objects.find(o => (o.action === 'go' ? o.room === W.room : o.room === roomAt(W, x))
      && x >= o.rect[0] && x < o.rect[2] && y >= o.rect[1] && y < o.rect[3]);
  }
  function wireInput(W) {
    const { view } = W;
    view.addEventListener('pointerdown', e => {
      const [x, y] = toArt(W, e);
      W.lastInput = performance.now();
      const A = W.life.state;
      if (Math.abs(x - A.x) < 12 && y < A.y + 3 && y > A.y - 40) { W.life.poke(); return; }
      const o = hit(W, x, y);
      if (o) { use(W, o); return; }
      const [y0, y1] = W.meta.walk;
      go(W, clamp(x, 10, W.meta.w - 10), y >= W.meta.floor ? clamp(y, y0, y1) : A.y);
    });
    view.addEventListener('pointermove', e => {
      const [x, y, r] = toArt(W, e), o = hit(W, x, y), tip = W.wrap.querySelector('.torre-tip');
      view.style.cursor = o ? 'pointer' : 'default';
      if (!o) { tip.hidden = true; return; }
      tip.textContent = o.label; tip.hidden = false;
      const cx = ((o.rect[0] + o.rect[2]) / 2 - Math.round(W.camX)) * W.scale;
      tip.style.left = clamp(cx, 60, r.width - 60) + 'px'; tip.style.top = Math.max(4, o.rect[1] * W.scale - 30) + 'px';
    });
    view.addEventListener('pointerleave', () => { W.wrap.querySelector('.torre-tip').hidden = true; });
  }
  function keys(W) {
    const box = W.wrap.querySelector('.torre-keys');
    const list = W.meta.objects.filter(o => o.room === W.room);
    const sig = list.map(o => o.id).join();
    if (box.dataset.sig === sig) return;
    box.dataset.sig = sig;
    box.innerHTML = list.map(o => `<button type="button" data-obj="${o.id}">${esc(o.label)}</button>`).join('');
    box.onclick = e => { const id = e.target.closest('[data-obj]')?.dataset.obj; const o = W.meta.objects.find(k => k.id === id && k.room === W.room); if (o) use(W, o); };
  }

  async function go(W, x, y) {
    W.lastInput = performance.now();
    return W.life.walkTo(x, y);
  }
  function say(W, text, ms = 2600) {
    const b = W.wrap.querySelector('.torre-say');
    b.textContent = text; b.hidden = false;
    clearTimeout(W.sayTimer); W.sayTimer = setTimeout(() => { b.hidden = true; }, ms);
  }
  function placeBubble(W, cam) {
    const b = W.wrap.querySelector('.torre-say'); if (b.hidden) return;
    const A = W.life.state;
    b.style.left = clamp((A.x - cam) * W.scale, 70, W.vw * W.scale - 70) + 'px';
    b.style.top = Math.max(2, (A.y - 50) * W.scale - b.offsetHeight) + 'px';
  }

  // ——— Lo que hace cada objeto ———
  async function use(W, o) {
    W.lastInput = performance.now();
    if (o.action === 'go') {                                   // cruzar el arco hasta la otra sala
      const r = W.meta.rooms[o.route];
      say(W, o.say);
      await go(W, r.home[0], r.home[1]);
      return;
    }
    const arrived = await go(W, o.stand[0], o.stand[1]);
    if (!arrived) return;
    if (o.action === 'mode') return chooseMode(W, o);
    if (o.action === 'game') return openGame(W, o);
  }
  function chooseMode(W, o) {
    const form = document.querySelector('form[data-training-setup]');
    const select = form?.querySelector('select[name="mode"]');
    if (!select) { say(W, 'Termina esta ronda primero'); return; }
    select.value = o.mode; select.dispatchEvent(new Event('change', { bubbles: true }));
    W.life.act(o.mode === 'pep' ? 'deslumbrada' : o.mode === 'errors' ? 'confundida' : 'idea');
    say(W, o.say + ' · toca Empezar', 3200);
    form.classList.remove('torre-flash'); void form.offsetWidth; form.classList.add('torre-flash');
    if (o.mode === 'topic') form.querySelector('select[name="topic"]')?.focus({ preventScroll: true });
  }
  function openGame(W, o) {
    const card = document.querySelector(`[data-game-card="${o.game}"]`);
    if (o.game === 'campaign') {
      say(W, o.say); W.life.act('deslumbrada');
      return;
    }
    say(W, o.say); W.life.act('nerviosa');
    if (card) { card.classList.remove('torre-flash'); void card.offsetWidth; card.classList.add('torre-flash'); }
  }

  // ——— Vida propia cuando nadie la toca ———
  function idle(W, now) {
    const A = W.life.state;
    const night = document.body.dataset.nexoTime === 'night';
    if (W.night !== night) { W.night = night; if (!W.layered) W.life.night(night); }   // el laboratorio ya trae su noche
    if (W.reduced || A.moving || W.life.busy || A.mode === 'sleep' || now - W.lastInput < W.nextIdle) return;
    W.lastInput = now; W.nextIdle = 9000 + Math.random() * 8000;
    if (Math.random() < .5) { W.life.act(pick(['saludo', 'idea', 'baile', 'seisSiete', 'dab', 'deslumbrada'])); return; }
    const room = W.key === 'mundo' ? W.meta.rooms[W.room] : { x0: 0, x1: W.meta.w };
    const [y0, y1] = W.meta.walk;
    W.life.walkTo(clamp(A.x + (Math.random() * 90 - 45), room.x0 + 16, room.x1 - 24), y0 + Math.random() * (y1 - y0));
  }

  // ——— Montaje en cada pantalla ———
  function anchorFor(kind, page) {
    if (kind === 'games') return page.querySelector('.page-header');
    return page.firstElementChild;
  }
  async function mount(kind, page) {
    try { await load(); } catch (_) { return; }
    if (!page.isConnected) return;
    const key = kind === 'train' ? 'lab' : 'mundo';
    const W = worlds[key] = worlds[key] || createWorld(key);
    const pet = window.NexoPet.current();
    W.life.setKind(pet.kind); W.life.setOutfit(pet.outfit);
    const anchor = anchorFor(kind, page);
    page.classList.add('torre-on');
    page.insertBefore(W.wrap, page.firstChild);
    // El título de la pantalla va encima del arte (como "Un lugar para aprender" en el Inicio).
    const title = W.wrap.querySelector('.torre-title');
    title.replaceChildren();
    if (anchor && (anchor.matches('h1') || anchor.matches('.page-header'))) title.append(anchor);
    const bg = getComputedStyle(document.querySelector('main') || document.body).backgroundColor;
    W.wrap.style.setProperty('--torre-fade', bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : getComputedStyle(document.body).backgroundColor);
    W.wrap.setAttribute('aria-label', ROOM_NAMES[kind]);
    if (key === 'mundo') {
      // Llegó por el menú: aparece en la entrada del arcade.
      if (W.room !== kind) { const h = W.meta.rooms[kind].home; W.life.place(h[0], h[1], false); }
      W.room = kind; W.crossing = false;
    } else if (key === 'lab') {
      W.progress = labProgress();
      layersFor(W);
    }
    keys(W);
    resize(W);
    W.life.pause(false);
    W.last = performance.now();
    if (!W.raf) W.raf = requestAnimationFrame(t => frame(W, t));
  }

  function scan() {
    const app = document.getElementById('app'); if (!app) return;
    const page = app.querySelector(':scope > .page');
    if (!page) return;
    const kind = page.classList.contains('arcane-training') ? 'train' : page.classList.contains('games-room') ? 'games' : null;
    if (!kind || page.querySelector('.torre-scene')) return;
    mount(kind, page);
  }
  function start() {
    const app = document.getElementById('app'); if (!app) return;
    new MutationObserver(scan).observe(app, { childList: true });
    addEventListener('resize', () => Object.values(worlds).forEach(W => W.wrap.isConnected && resize(W)));
    scan();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.NexoTorre = Object.freeze({ scan, worlds });
})();
