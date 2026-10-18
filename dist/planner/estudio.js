/* Organización = estudio de planos de la torre (docs/update-02-organizacion/SPEC.md · Fase 1).
   Escena pixel de borde a borde (arte: tools/torre-pixel/build_estudio.py) con la mascota caminando, y debajo el pergamino sobre madera.
   Objetos: reloj = Hoy · mesa de planos = Calendario · corcho = Pruebas · balanza/libro = Notas · banco = Lab · campana = Avisos.
   La pantalla la llama app.js (#/planner/<vista>) con un "puente" al estado; los cálculos son de NexoPriority, NexoTodayPlan y NexoGrades. */
(() => {
  'use strict';
  const V = '1';
  const BASE = 'assets/torre/estudio/';
  const VIEWS = ['hoy', 'calendario', 'pruebas', 'notas', 'lab', 'avisos'];
  const LEGACY = { calendar: 'hoy', grades: 'notas' };
  const TITLES = { hoy: 'Hoy', calendario: 'Calendario', pruebas: 'Pruebas', notas: 'Notas', lab: 'Laboratorio', avisos: 'Avisos' };
  const HINT = 'Toca un objeto del estudio o el piso para caminar';
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const query = new URLSearchParams(location.search);          // para probar: ?hora=dia|tarde|noche  ?clima=lluvia|nieve|nubes|niebla|tormenta

  let data = null, loading = null, W = null, bridge = null, cssDone = false;
  const cache = {};

  // ——— Carga ———
  function img(src) {
    return new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = BASE + src + '?v=' + V; });
  }
  function css() {
    if (cssDone) return; cssDone = true;
    for (const href of ['world/torre-mundo.css?v=1', 'planner/estudio.css?v=' + V, 'planner/notas.css?v=' + V, 'planner/calendario.css?v=' + V]) {
      if (document.querySelector(`link[href^="${href.split('?')[0]}"]`)) continue;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l);
    }
  }
  function load() {
    loading = loading || Promise.all([
      fetch(BASE + 'estudio.json?v=' + V).then(r => r.json()),
      window.NexoPet?.engine ? window.NexoPet.engine() : Promise.reject(new Error('sin mascota'))
    ]).then(([meta]) => { data = meta; return data; });
    return loading;
  }
  function timeOfDay() {
    const q = query.get('hora'); if (['dia', 'tarde', 'noche'].includes(q)) return q;
    const t = document.body.dataset.nexoTime;
    return t === 'night' ? 'noche' : t === 'dusk' ? 'tarde' : 'dia';
  }
  function layers(tod) {
    cache[tod] = cache[tod] || Promise.all(['vista', 'fondo', 'frente', 'campana'].map(n => img(`${tod}-${n}.png`)))
      .then(([vista, fondo, frente, campana]) => ({ vista, fondo, frente, campana, tod }));
    return cache[tod];
  }
  // Clima real (Open-Meteo, lo pide home-pet.js con su límite de 30 min). Sin red = despejado.
  function weather() {
    const q = query.get('clima'); if (q) return q;
    try {
      const code = JSON.parse(localStorage.getItem('nexo.weather.v1') || 'null')?.code ?? 0;
      if (code >= 95) return 'tormenta';
      if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'nieve';
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'lluvia';
      if (code === 45 || code === 48) return 'niebla';
      if (code >= 2) return 'nubes';
    } catch (_) { /* sin clima */ }
    return 'despejado';
  }

  // ——— Situación real (la escena la refleja) ———
  function situation() {
    const s = bridge.state, today = bridge.today();
    window.NexoOrgAvisos?.snapshot(bridge);
    const T = window.NexoTodayPlan;
    const crit = T.critical(s.events, today);
    const glasses = T.hourglasses(s.events, today, 21);
    const blocks = todayPlan(crit);
    const next = blocks.find(b => !b.done);
    const avisos = window.NexoOrgAvisos?.list(bridge) || [];
    const unseen = avisos.filter(a => a.nuevo).length;
    const highlight = unseen ? 'avisos' : next ? (next.event.type === 'lab' ? 'lab' : 'pruebas') : null;
    // La balanza se inclina a verde si vas sobre 4,0 y a rojo si vas bajo; los platillos cargan tus frascos verdes y rojos.
    let tilt = 0, reds = 0, greens = 0;
    const GR = window.NexoGradeRules;
    if (GR && bridge.gradeConfig) {
      const evs = bridge.subjects.map(x => GR.evaluate(x.id, bridge.gradeConfig(x.id)));
      const ov = GR.overall(evs);
      tilt = ov.llevas === null ? 0 : Math.max(-1, Math.min(1, (ov.llevas - 4) / 2));
      bridge.subjects.forEach(x => bridge.gradeConfig(x.id).components.forEach(c => {
        const lv = GR.level(GR.known(c)); if (lv === 'rojo') reds++; else if (lv === 'verde') greens++;
      }));
    }
    // La mesa se ordena si cumples el plan de hoy; con semana crítica hay papeles revueltos (sin culpa, es solo ambiente).
    const done = blocks.filter(b => b.done).length;
    const disorder = Math.max(0, Math.min(1, (blocks.length ? 1 - done / blocks.length : 0) * .7 + (crit?.active ? .3 : 0)));
    return { today, crit, glasses, blocks, next, avisos, unseen, highlight, tilt, reds: Math.min(4, reds), greens: Math.min(4, greens), disorder };
  }
  function org() {
    const s = bridge.state;
    if (!s.organization || typeof s.organization !== 'object') s.organization = {};
    const o = s.organization;
    if (!o.minutes || typeof o.minutes !== 'object') o.minutes = {};
    if (!o.marks || typeof o.marks !== 'object') o.marks = {};
    // se guardan solo 14 días de marcas
    const keys = Object.keys(o.marks).sort();
    keys.slice(0, Math.max(0, keys.length - 14)).forEach(k => delete o.marks[k]);
    return o;
  }
  function minutesToday() {
    const o = org(), wd = new Date().getDay();
    const v = o.minutes[wd];
    return Number.isFinite(Number(v)) ? Number(v) : bridge.state.settings.dailyGoalMinutes || 120;
  }
  function marksToday() {
    const o = org(), t = bridge.today();
    o.marks[t] = o.marks[t] || { done: [], skip: [] };
    return o.marks[t];
  }
  const todayPlan = crit => window.NexoTodayPlan.planDay(bridge, bridge.today(), crit);

  // ——— Escena ———
  function createWorld() {
    const meta = data;
    const stage = document.createElement('canvas'); stage.width = meta.w; stage.height = meta.h;
    const pet = window.NexoPet.current(), reduced = window.NexoPet.reduced();
    const life = window.PixelVida.create({ canvas: stage, background: null, stations: {}, route: [], manual: true, speed: 2.2,
      start: { x: meta.home[0], y: meta.home[1] }, kind: pet.kind, reduced, depth: y => .86 + clamp((y - 122) / 22, 0, 1) * .14 });
    life.setOutfit(pet.outfit);
    const wrap = document.createElement('section');
    wrap.className = 'torre-scene estudio-scene';
    wrap.setAttribute('aria-label', 'Estudio de planos de la torre');
    wrap.innerHTML = `<canvas class="torre-view" height="${meta.h * 2}" aria-hidden="true"></canvas><div class="torre-title"></div>
      <p class="torre-tip" hidden></p><p class="torre-say" role="status" aria-live="polite" hidden></p>
      <p class="torre-hint">${HINT}</p><div class="torre-keys" role="group" aria-label="Objetos del estudio"></div>`;
    const view = wrap.querySelector('.torre-view');
    const w = { meta, stage, life, wrap, view, vctx: view.getContext('2d'), reduced, camX: 0, vw: meta.w, scale: 1, raf: 0,
      last: performance.now(), lastInput: performance.now(), nextIdle: 10000, sayTimer: 0, t: 0, L: null, tod: null, view_: null, said: '' };
    wireInput(w);
    return w;
  }

  const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const DIG = { 0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'],
    3: ['111', '001', '011', '001', '111'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'], 8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'] };
  function digits(g, x, y, n, c) {
    String(n).split('').forEach((d, i) => DIG[d]?.forEach((row, j) => [...row].forEach((b, k) => { if (b === '1') px(g, x + i * 4 + k, y + j, c); })));
  }

  function drawWeather(g, x0, t, kind) {
    const win = W.meta.window, wx0 = x0 + win.x0 - 4, wx1 = x0 + win.x1 + 4, wy0 = win.y0, wy1 = win.y1;
    if (kind === 'despejado') return;
    g.save();
    g.beginPath(); g.rect(wx0, wy0, wx1 - wx0, wy1 - wy0); g.clip();
    if (kind === 'nubes' || kind === 'lluvia' || kind === 'tormenta') {
      g.fillStyle = kind === 'nubes' ? 'rgba(150,160,180,.28)' : 'rgba(70,80,100,.42)'; g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
    }
    if (kind === 'niebla') {
      for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(230,232,240,.18)'; g.fillRect(wx0, wy0 + 40 + k * 24 + Math.round(Math.sin(t * .3 + k) * 3), wx1 - wx0, 10); }
    }
    if (kind === 'lluvia' || kind === 'tormenta') {
      for (let i = 0; i < 70; i++) {
        const x = wx0 + ((i * 37 + Math.floor(t * 40)) % (wx1 - wx0)), y = wy0 + ((i * 53 + Math.floor(t * 180)) % (wy1 - wy0));
        px(g, x, y, '#dce8ff'); px(g, x - 1, y + 2, '#a8c4e8'); px(g, x - 2, y + 4, '#7894bc');
      }
      if (kind === 'tormenta' && Math.sin(t * .7) > .985) { g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0); }
    }
    if (kind === 'nieve') {
      for (let i = 0; i < 40; i++) {
        const x = wx0 + ((i * 29 + Math.sin(t + i) * 4 + 400) % (wx1 - wx0)), y = wy0 + ((i * 41 + t * 18) % (wy1 - wy0));
        px(g, x, y, '#ffffff');
      }
    }
    g.restore();
  }

  function drawClock(g, x0, t) {
    const c = W.meta.clock, now = new Date();
    const [pxv, py, len] = c.pend;
    const sw = W.reduced ? 0 : Math.sin(t * 2.6) * 4;
    for (let k = 0; k < len - 4; k++) px(g, x0 + pxv + sw * k / len, py + k, '#ba8a30');
    g.fillStyle = '#e2b850'; g.fillRect(Math.round(x0 + pxv + sw) - 3, py + len - 5, 7, 6);
    g.fillStyle = '#fff6c8'; g.fillRect(Math.round(x0 + pxv + sw) - 2, py + len - 4, 2, 2);
    const hand = (ang, l, col) => { for (let k = 0; k <= l; k++) px(g, x0 + c.cx + Math.sin(ang) * k, c.cy - Math.cos(ang) * k, col); };
    const m = now.getMinutes() + now.getSeconds() / 60, h = (now.getHours() % 12) + m / 60;
    hand(m / 60 * Math.PI * 2, 9, '#3a2416');
    hand(h / 12 * Math.PI * 2, 6, '#140c10');
    px(g, x0 + c.cx, c.cy, '#a83818');
  }

  function drawCork(g, x0, S) {
    const c = W.meta.cork, list = S.glasses.slice(0, 8);
    list.forEach((h, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = x0 + c.x0 + 8 + col * 21, y = c.y0 + 9 + row * 31 + (col % 2) * 3;
      const near = h.days <= 7, subj = bridge.subjectFor(h.event.subject);
      g.fillStyle = 'rgba(30,14,12,.45)'; g.fillRect(x + 1, y + 2, 17, 22);
      g.fillStyle = near ? '#f4d6b0' : '#efe2c0'; g.fillRect(x, y, 17, 22);
      g.fillStyle = near ? '#b44c40' : '#a69070'; g.fillRect(x, y, 17, 1); g.fillRect(x, y + 21, 17, 1); g.fillRect(x, y, 1, 22); g.fillRect(x + 16, y, 1, 22);
      if (near) { g.fillStyle = '#d87052'; g.fillRect(x + 1, y + 1, 15, 3); }
      digits(g, x + 3 + (h.days < 10 ? 2 : 0), y + 7, h.days, near ? '#8c3234' : '#47281b');
      g.fillStyle = '#7a6650'; g.fillRect(x + 3, y + 15, 11, 1); g.fillRect(x + 3, y + 18, 7, 1);
      g.fillStyle = subj.color || '#ba8a30'; g.fillRect(x + 7, y - 2, 3, 3);
      px(g, x + 7, y - 2, '#fff6c8');
    });
  }

  function drawAnim(g, x1, t, S) {
    const a = W.meta.anim;
    (a.fire || []).forEach(([fx, fy, h], i) => {
      const k = Math.floor(t * 9 + i * 1.7) % 3, top = fy - h;
      px(g, x1 + fx + [0, -1, 1][k], top - 1, '#ffc850'); px(g, x1 + fx, top - 2 - (k === 2 ? 1 : 0), '#f89a30');
      if (k === 1) px(g, x1 + fx + 1, top + 2, '#fffce8');
    });
    for (let i = 0; i < 4; i++) {                                     // chispas que suben de la chimenea
      const p = (t * .45 + i * .27) % 1;
      if (p < .7) px(g, x1 + 62 + i * 7 + Math.sin(t * 2 + i) * 3, 196 - p * 34, p < .35 ? '#ffe890' : '#f89a30');
    }
    (a.candles || []).forEach(([cx, cy], i) => {
      const k = Math.floor(t * 8 + i * 2.3) % 3;
      px(g, x1 + cx + (k === 1 ? -1 : k === 2 ? 1 : 0), cy - 1, '#ffc850'); px(g, x1 + cx, cy + 1, k ? '#fffce8' : '#ffe890');
    });
    const [lx, ly] = a.lantern, lk = Math.floor(t * 7) % 3;
    px(g, x1 + lx + (lk - 1), ly - 18, '#fffce8');
    const busy = (S.blocks.some(b => !b.done && b.event.type === 'lab') ? 2 : 1);   // más burbujas si hay pre-lab pendiente
    (a.bubbles || []).forEach(([bx, by], i) => {
      for (let r = 0; r < busy; r++) {
        const k = (t * .7 * (r ? 1.6 : 1) + i * .29 + r * .5) % 1;
        if (k < .8) px(g, x1 + bx + Math.sin(t * 4 + i + r) * 1.5, by - k * 12, '#eef09a');
      }
    });
    (a.shrooms || []).forEach(([sx, sy], i) => { if (Math.sin(t * 1.4 + i * 2.1) > .7) px(g, x1 + sx, sy - 2 - (t * 3 + i) % 4, '#a8f0dc'); });
    (W.meta.dust[W.L.tod] || []).forEach(([dx, dy], i) => {
      if (Math.sin(t * 1.1 + i) > -.2) px(g, x1 + dx + Math.sin(t * .8 + i) * 3, dy - ((t * 4 + i * 7) % 20), 'rgba(255,240,176,.85)');
    });
  }

  function drawBell(g, x1, t, S) {
    const b = W.meta.bell;
    let f = 0;
    if (S.unseen && !W.reduced) { const s = Math.sin(t * 5); if ((t % 6) < 1.6) f = s > .3 ? 1 : s < -.3 ? 2 : 0; }
    g.drawImage(W.L.campana, f * b.w, 0, b.w, b.h, x1 + b.x, b.y, b.w, b.h);
    if (S.unseen) {                                                  // marca de aviso nuevo
      const k = W.reduced ? 1 : Math.floor(t * 3) % 2;
      g.fillStyle = k ? '#ffd860' : '#e0b030'; g.fillRect(x1 + b.x + b.w - 6, b.y + 2, 4, 4);
      g.fillStyle = '#3a2a10'; g.fillRect(x1 + b.x + b.w - 5, b.y + 3, 2, 1);
    }
  }

  function drawHighlight(g, x1, t, S) {
    const o = W.meta.objects.find(k => k.view === S.highlight); if (!o) return;
    const [ax, ay, bx, by] = o.rect.map(v => v * 2);
    const pts = [[ax, ay], [bx, ay], [ax, by], [bx, by], [(ax + bx) / 2, ay - 4]];
    pts.forEach(([x, y], i) => {
      const on = W.reduced || Math.sin(t * 3 + i * 1.3) > -.2;
      if (!on) return;
      const c = i % 2 ? '#fff0a8' : '#ffd860';
      px(g, x1 + x, y, c); px(g, x1 + x - 1, y, c); px(g, x1 + x + 1, y, c); px(g, x1 + x, y - 1, c); px(g, x1 + x, y + 1, c);
    });
  }

  // Balanza de latón: el travesaño se inclina por escalones según tus notas; cada platillo carga gemas (rojas = frascos rojos, verdes = verdes).
  function drawScale(g, x1, t, S) {
    const m = W.meta.scale, target = S.tilt * 7;
    W.scaleD = W.reduced ? target : (W.scaleD ?? 0) + (target - (W.scaleD ?? 0)) * .05;
    const d = Math.round(W.scaleD + (W.reduced ? 0 : Math.sin(t * 1.3) * .6));
    const cx = x1 + m.cx, y = m.y;
    for (let xx = -22; xx <= 22; xx++) {
      const by = Math.round(y + d * xx / 22);
      g.fillStyle = '#fbe08a'; g.fillRect(cx + xx, by - 1, 1, 1);
      g.fillStyle = '#e2b850'; g.fillRect(cx + xx, by, 1, 1);
      g.fillStyle = '#8a5c20'; g.fillRect(cx + xx, by + 1, 1, 1);
    }
    g.fillStyle = '#fff6c8'; g.fillRect(cx - 1, y - 3, 3, 3); g.fillStyle = '#ba8a30'; g.fillRect(cx - 2, y - 2, 5, 3);
    [[-22, -d, S.reds, '#d87052', '#8c3234'], [22, d, S.greens, '#83ad42', '#30644a']].forEach(([ox, od, n, lite, dark]) => {
      const ex = cx + ox, ey = y + od;
      g.fillStyle = '#a8bab6'; for (let k = 0; k < 15; k++) { g.fillRect(ex - Math.round(k * .45), ey + k, 1, 1); g.fillRect(ex + Math.round(k * .45), ey + k, 1, 1); }
      const py = ey + 15;
      g.fillStyle = '#e2b850'; g.fillRect(ex - 9, py, 19, 2); g.fillStyle = '#8a5c20'; g.fillRect(ex - 7, py + 2, 15, 1);
      for (let i = 0; i < n; i++) {
        const gx = ex - 7 + (i % 3) * 5, gy = py - 4 - Math.floor(i / 3) * 4;
        g.fillStyle = dark; g.fillRect(gx, gy, 4, 4); g.fillStyle = lite; g.fillRect(gx, gy, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(gx, gy, 1, 1);
      }
    });
  }

  // Papeles sueltos sobre la mesa de planos: más si no has cumplido el plan o hay semana crítica.
  function drawTable(g, x1, S) {
    const tb = W.meta.table, n = Math.round(S.disorder * 8);
    for (let i = 0; i < n; i++) {
      const x = x1 + tb.x0 + 10 + ((i * 37 + 11) % (tb.x1 - tb.x0 - 30)), y = tb.top - 13 + (i * 5) % 5, lean = (i % 3) - 1;
      for (let r = 0; r < 7; r++) {
        const ox = Math.round(lean * r * .6);
        g.fillStyle = r === 0 ? '#fff4d8' : r === 6 ? '#a69070' : '#e6d6b2'; g.fillRect(x + ox, y + r, 11, 1);
        if (r === 2 || r === 4) { g.fillStyle = '#7a6650'; g.fillRect(x + ox + 2, y + r, 5 + (i % 3), 1); }
      }
      g.fillStyle = '#140c10'; g.fillRect(x - 1 + Math.round(lean * 3 * .6), y - 1, 1, 1);
    }
  }

  const PET_FILTER = { dia: 'none', tarde: 'brightness(.92) sepia(.18)', noche: 'brightness(.62) saturate(.8)' };
  function draw(t) {
    const g = W.vctx, m = W.meta, S = 2, L = W.L, Sx = W.sit;
    const center = (m.w - W.vw) / 2;
    const at = f => -Math.round((center + (W.camX - center) * f) * S);
    g.clearRect(0, 0, W.view.width, W.view.height);
    if (!L || !Sx) return;
    g.imageSmoothingEnabled = false;
    g.drawImage(L.vista, at(m.parallax.vista), 0);
    const x1 = at(1);
    drawWeather(g, at(m.parallax.vista), t, W.weather);
    g.drawImage(L.fondo, x1, 0);
    drawClock(g, x1, t);
    drawCork(g, x1, Sx);
    drawScale(g, x1, t, Sx);
    drawTable(g, x1, Sx);
    if (!W.reduced) drawAnim(g, x1, t, Sx);
    drawBell(g, x1, t, Sx);
    drawHighlight(g, x1, t, Sx);
    g.save(); g.filter = PET_FILTER[L.tod] || 'none';
    g.drawImage(W.stage, x1, 0, m.w * S, m.h * S);
    g.restore();
    g.drawImage(L.frente, at(m.parallax.frente), 0, m.w * S, m.h * S);
    if (Sx.crit?.active) { g.fillStyle = 'rgba(255,150,70,.07)'; g.fillRect(0, 0, W.view.width, W.view.height); }   // semana crítica: algo más cálido
  }

  function frame(now) {
    W.raf = 0;
    if (!W.wrap.isConnected) { W.life.pause(true); window.NexoEstudioAudio?.stop(); return; }
    const dt = Math.min(.05, (now - W.last) / 1000); W.last = now; W.t += dt;
    const tod = timeOfDay();
    if (tod !== W.tod) { W.tod = tod; layers(tod).then(L => { if (W.tod === L.tod) W.L = L; }); }
    const A = W.life.state, maxCam = Math.max(0, W.meta.w - W.vw);
    const target = clamp(A.x - W.vw / 2, 0, maxCam);
    W.camX = W.reduced ? target : W.camX + (target - W.camX) * (1 - Math.exp(-dt * 4));
    draw(W.t);
    placeBubble();
    idle(now);
    W.raf = requestAnimationFrame(frame);
  }

  function resize() {
    const app = document.getElementById('app'), page = W.wrap.parentElement;
    if (!app || !page) return;
    const a = app.getBoundingClientRect(), p = page.getBoundingClientRect(), width = a.width;
    W.wrap.style.width = width + 'px';
    W.wrap.style.marginLeft = (a.left - p.left) + 'px';
    W.wrap.style.marginTop = -(parseFloat(getComputedStyle(page).paddingTop) || 0) + 'px';
    const minH = innerWidth < 700 ? 300 : 340;
    const scale = Math.max(width / W.meta.w, minH / W.meta.h);
    const cssH = Math.round(W.meta.h * scale);
    W.wrap.style.height = cssH + 'px';
    W.vw = Math.min(W.meta.w, Math.ceil(width / scale));
    W.scale = scale;
    W.view.width = W.vw * 2; W.view.height = W.meta.h * 2;
    W.view.style.width = (W.vw * scale) + 'px'; W.view.style.height = cssH + 'px';
    W.camX = clamp(W.life.state.x - W.vw / 2, 0, Math.max(0, W.meta.w - W.vw));
  }

  // ——— Entrada ———
  function toArt(w, e) {
    const r = w.view.getBoundingClientRect();
    return [Math.round(w.camX) + (e.clientX - r.left) / r.width * w.vw, (e.clientY - r.top) / r.height * w.meta.h, r];
  }
  const hit = (w, x, y) => w.meta.objects.find(o => x >= o.rect[0] && x < o.rect[2] && y >= o.rect[1] && y < o.rect[3]);
  function wireInput(w) {
    w.view.addEventListener('pointerdown', e => {
      const [x, y] = toArt(w, e);
      w.lastInput = performance.now();
      const A = w.life.state;
      if (Math.abs(x - A.x) < 12 && y < A.y + 3 && y > A.y - 40) { w.life.poke(); return; }
      const o = hit(w, x, y);
      if (o) { use(o); return; }
      const [y0, y1] = w.meta.walk;
      w.life.walkTo(clamp(x, 10, w.meta.w - 10), y >= w.meta.floor ? clamp(y, y0, y1) : A.y);
    });
    w.view.addEventListener('pointermove', e => {
      const [x, y, r] = toArt(w, e), o = hit(w, x, y), tip = w.wrap.querySelector('.torre-tip');
      w.view.style.cursor = o ? 'pointer' : 'default';
      if (!o) { tip.hidden = true; return; }
      tip.textContent = o.label; tip.hidden = false;
      const cx = ((o.rect[0] + o.rect[2]) / 2 - Math.round(w.camX)) * w.scale;
      tip.style.left = clamp(cx, 70, r.width - 70) + 'px'; tip.style.top = Math.max(4, o.rect[1] * w.scale - 30) + 'px';
    });
    w.view.addEventListener('pointerleave', () => { w.wrap.querySelector('.torre-tip').hidden = true; });
    const box = w.wrap.querySelector('.torre-keys');
    box.innerHTML = w.meta.objects.filter(o => o.view).map(o => `<button type="button" data-obj="${o.id}">${esc(o.label)}</button>`).join('');
    box.onclick = e => { const o = w.meta.objects.find(k => k.id === e.target.closest('[data-obj]')?.dataset.obj); if (o) use(o); };
  }
  function say(text, ms = 3200) {
    const b = W.wrap.querySelector('.torre-say');
    b.textContent = text; b.hidden = false;
    clearTimeout(W.sayTimer); W.sayTimer = setTimeout(() => { b.hidden = true; }, ms);
  }
  function placeBubble() {
    const b = W.wrap.querySelector('.torre-say'); if (b.hidden) return;
    const A = W.life.state;
    b.style.left = clamp((A.x - Math.round(W.camX)) * W.scale, 90, W.vw * W.scale - 90) + 'px';
    b.style.top = Math.max(2, (A.y - 50) * W.scale - b.offsetHeight) + 'px';
  }
  // La mascota del estudio reacciona (notas nuevas, faltas). tone = nombre de un gesto de PixelVida.
  function react(tone, text) {
    if (!W) return;
    try { W.life.act(tone); } catch (_) { /* sin gesto */ }
    if (text) say(text, 4600);
  }
  const sound = name => window.NexoEstudioAudio?.play(name, bridge.state.settings);
  function ambient() {
    const A = window.NexoEstudioAudio; if (!A || !bridge.state.settings.ambient || A.playing()) return;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;     // sin gesto, el navegador no deja sonar
    A.start(bridge.state.settings, W.weather);
  }
  async function use(o) {
    W.lastInput = performance.now();
    const arrived = await W.life.walkTo(o.stand[0], o.stand[1]);
    if (!arrived) return;
    if (!o.view) { say(o.say); W.life.act('deslumbrada'); return; }
    say(o.say, 2200);
    if (o.view === 'avisos') { sound('campana'); window.NexoOrgAvisos?.markSeen(bridge); }
    if (location.hash !== '#/planner/' + o.view) location.hash = '#/planner/' + o.view;
  }
  function idle(now) {
    const A = W.life.state;
    if (W.reduced || A.moving || W.life.busy || now - W.lastInput < W.nextIdle) return;
    W.lastInput = now; W.nextIdle = 10000 + Math.random() * 8000;
    if (Math.random() < .5) { W.life.act(['saludo', 'idea', 'baile'][Math.floor(Math.random() * 3)]); return; }
    const [y0, y1] = W.meta.walk;
    W.life.walkTo(clamp(A.x + (Math.random() * 80 - 40), 30, W.meta.w - 30), y0 + Math.random() * (y1 - y0));
  }

  // ——— Paneles (pergamino sobre madera) ———
  const shortDate = d => { const x = new Date(`${d}T12:00:00`); return `${x.getDate()} ${MONTHS[x.getMonth()]}`; };
  const longToday = () => new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const tag = s => `<span class="ramo" style="--ramo:${esc(s.color)}">${esc(s.short)}</span>`;
  const when = d => d === 0 ? 'hoy' : d === 1 ? 'mañana' : `en ${d} días`;

  function hourglass(h) {
    const s = bridge.subjectFor(h.event.subject);
    return `<li class="reloj u-${h.urgency}"><span class="reloj-arena" style="--f:${h.level}" aria-hidden="true"></span>
      <span class="reloj-n"><b>${h.days}</b><small>${h.days === 1 ? 'día' : 'días'}</small></span>
      <span class="reloj-que">${tag(s)} <b>${esc(h.event.title)}</b><time datetime="${esc(h.event.date)}">${shortDate(h.event.date)}</time></span></li>`;
  }
  function ribbon(crit) {
    if (!crit || !crit.active) return '';
    return `<div class="cinta" role="note"><span>Semana crítica · ${esc(crit.label)}</span></div>`;
  }

  function panelHoy(S) {
    const mins = minutesToday(), studied = Math.round((bridge.state.sessions || []).filter(x => x.date === S.today)
      .reduce((a, x) => a + (Number(x.seconds) || Number(x.minutes || 0) * 60), 0) / 60);
    const planned = S.blocks.reduce((a, b) => a + b.minutes, 0);
    const flash = S.blocks.some(b => b.flash);
    const o = org(), schedule = Array.isArray(o.schedule) ? o.schedule : (typeof NEXO_SEMESTER !== 'undefined' ? NEXO_SEMESTER.schedule : []);
    const info = window.NexoSchedule.dayInfo(bridge.state, S.today, schedule);
    const pending = S.blocks.filter(b => !b.done && (!b.start || b.remainingMinutes));
    const commitments = info.occupied.slice().sort((a, b) => a.start - b.start);
    const blocks = S.blocks.length ? `<ol class="plan-bloques">${S.blocks.map(b => {
      const s = bridge.subjectFor(b.subject);
      return `<li class="bloque${b.done ? ' hecho' : ''}" data-bloque="${esc(b.id)}">
        <span class="bloque-n" aria-hidden="true">${b.order}</span>
        <div class="bloque-txt"><p class="bloque-ramo">${b.start ? `<time class="agenda-slot">${b.start}–${b.end}</time>` : ''}${tag(s)} <b>${b.minutes} min</b></p>
          <h3><span class="tinta">${esc(b.text)}</span></h3>
          <p class="bloque-razon">${esc(b.reason)}</p><p class="bloque-porque">${esc(b.why)}</p>${b.unplaced ? `<p class="block-warning">${esc(b.unplaced)}</p>` : ''}${b.remainingMinutes ? `<p class="block-warning">Quedan ${b.remainingMinutes} min de esta sesión por ubicar.</p>` : ''}</div>
        <div class="bloque-acciones">${b.done
          ? `<span class="bloque-ok">Hecho${b.auto ? ' (cronómetro)' : ''}</span>${b.auto ? '' : `<button type="button" class="pix-btn suave" data-org-undo="${esc(b.id)}">Deshacer</button>`}`
          : `<button type="button" class="pix-btn" data-org-start="${esc(b.id)}">Empezar</button>
             <button type="button" class="pix-btn suave" data-org-done="${esc(b.id)}">Listo</button>
             <button type="button" class="pix-btn suave" data-org-skip="${esc(b.id)}">Hoy no</button>`}</div></li>`;
    }).join('')}</ol>` : `<p class="pergamino-vacio">${mins <= 0 ? 'Hoy descansas: no hay plan. Descansar también es parte de estudiar.' : 'El caldero está tranquilo: nada urgente. Buen día para adelantar o repasar.'}</p>`;
    return `<article class="pergamino hoy" aria-labelledby="hoyTitle">
      <header class="pergamino-head"><p class="eyebrow">HOY · ${esc(longToday())}</p><h2 id="hoyTitle">Plan del día</h2>
        <div class="hoy-tiempo" role="group" aria-label="Tiempo para estudiar hoy">
          <button type="button" class="pix-btn mini" data-org-min="-15" aria-label="15 minutos menos">−</button>
          <b>${mins} min</b><button type="button" class="pix-btn mini" data-org-min="15" aria-label="15 minutos más">+</button>
          <small>los ${esc(new Intl.DateTimeFormat('es-CL', { weekday: 'long' }).format(new Date()))}</small></div></header>
      ${ribbon(S.crit)}
      <div class="today-capacity"><div><b>${info.configured ? `${info.available} min disponibles en lo que queda del día` : 'Dale un horario a tu plan'}</b><p>${info.configured ? 'Las propuestas respetan tus compromisos y las pausas.' : 'Indica cuándo puedes estudiar para que Nexo encuentre espacios reales.'}</p></div><button type="button" class="pix-btn suave" data-org-availability>Mis horarios</button></div>
      ${commitments.length ? `<details class="today-commitments" open><summary>Tus compromisos de hoy · ${commitments.length}</summary><ul>${commitments.map(c => `<li><time>${window.NexoSchedule.clock(c.start)}–${window.NexoSchedule.clock(c.end)}</time><span>${esc(c.title)}</span></li>`).join('')}</ul></details>` : ''}
      ${info.conflicts.length || info.warnings.length ? `<p class="block-warning">${info.conflicts.map(c => `Se superponen ${esc(c.a)} y ${esc(c.b)}.`).concat(info.warnings.map(esc)).join(' ')}</p>` : ''}
      ${pending.length && info.configured ? `<p class="block-warning">Hay ${pending.length} sesión${pending.length === 1 ? '' : 'es'} con tiempo pendiente de ubicar. Revisa tu semana antes de añadir más.</p>` : ''}
      ${flash ? '<p class="modo-prueba">Día de prueba: solo un repaso flash. Sin materia nueva, calma y a rendir.</p>' : ''}
      ${blocks}
      <p class="plan-total">Plan ${planned} de ${mins} min · llevas ${studied} min hoy. El alquimista propone, tú decides: si hoy no se puede, la poción se reacomoda sin culpa.</p>
    </article>
    <article class="pergamino viene" aria-labelledby="vieneTitle">
      <header class="pergamino-head"><p class="eyebrow">RELOJES DE ARENA</p><h2 id="vieneTitle">Lo que viene</h2></header>
      ${S.glasses.length ? `<ul class="relojes">${S.glasses.map(hourglass).join('')}</ul>` : '<p class="pergamino-vacio">Sin pruebas en las próximas 3 semanas.</p>'}
    </article>`;
  }

  function panelPruebas(S) {
    const T = window.NexoTodayPlan, list = T.hourglasses(bridge.state.events, S.today, 120);
    return `<article class="pergamino"><header class="pergamino-head"><p class="eyebrow">TABLERO DE CORCHO</p><h2>Pruebas</h2></header>
      ${list.length ? `<ul class="fichas">${list.map(h => {
        const s = bridge.subjectFor(h.event.subject), e = h.event;
        return `<li class="ficha u-${h.urgency}"><span class="reloj-arena" style="--f:${h.level}" aria-hidden="true"></span>
          <div><p>${tag(s)} <b>${esc(e.title)}</b> · ${shortDate(e.date)} (${when(h.days)})</p>
          ${e.topic ? `<p class="ficha-tema">${esc(e.topic)}</p>` : ''}${e.dateNote ? `<p class="ficha-nota">${esc(e.dateNote)}</p>` : ''}</div></li>`;
      }).join('')}</ul>` : '<p class="pergamino-vacio">No hay pruebas por delante.</p>'}
      <p class="pergamino-pronto">Próximamente: temario y material, preparación con evidencia y plan hacia atrás en cada ficha.</p></article>`;
  }

  const panelCalendario = S => window.NexoCalendario.panel(S, bridge);

  function panelLab(S) {
    const labs = (bridge.state.events || []).filter(e => e.type === 'lab' && e.status !== 'done' && e.date >= S.today)
      .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    return `<article class="pergamino"><header class="pergamino-head"><p class="eyebrow">BANCO DE MATRACES</p><h2>Laboratorio</h2></header>
      ${labs.length ? `<ul class="fichas">${labs.map(e => {
        const s = bridge.subjectFor(e.subject), d = window.NexoTodayPlan.daysBetween(S.today, e.date), pre = e.lab?.prelab;
        return `<li class="ficha u-${window.NexoTodayPlan.urgency(d)}"><span class="ico ico-matraz" aria-hidden="true"></span><div>
          <p>${tag(s)} <b>${shortDate(e.date)}${e.time ? ' · ' + esc(e.time) : ''}</b> (${when(d)})</p>${e.topic ? `<p class="ficha-tema">${esc(e.topic)}</p>` : ''}
          <p><button type="button" class="pix-btn ${pre?.done ? 'suave' : ''}" data-org-prelab="${esc(e.id)}" aria-pressed="${!!pre?.done}">${pre?.done ? 'Pre-lab listo ✓' : 'Marcar pre-lab listo'}</button></p></div></li>`;
      }).join('')}</ul>` : '<p class="pergamino-vacio">Sin prácticos por delante.</p>'}
      <p class="pergamino-pronto">Próximamente: informes por entregar y notas de laboratorio aparte, con su mínimo.</p></article>`;
  }

  const panelNotas = S => window.NexoNotas.panel(S, bridge);

  function panelAvisos(S) {
    return `<article class="pergamino"><header class="pergamino-head"><p class="eyebrow">LA CAMPANA</p><h2>Avisos</h2></header>
      ${S.avisos.length ? `<ul class="avisos">${S.avisos.map(a => `<li class="aviso u-${esc(a.nivel)}"><b>${esc(a.titulo)}</b><span>${esc(a.texto)}</span></li>`).join('')}</ul>`
        : '<p class="pergamino-vacio">Todo en calma: no hay avisos.</p>'}
      <p class="pergamino-pronto">Próximamente: cambios de fecha con deshacer y avisos de Classroom (si se conecta).</p></article>`;
  }

  function panel(view, S) {
    return { hoy: panelHoy, calendario: panelCalendario, pruebas: panelPruebas, lab: panelLab, notas: panelNotas, avisos: panelAvisos }[view](S);
  }

  // ——— Acciones del panel ———
  function wirePanel(root, view) {
    if (view === 'notas') { window.NexoNotas.wire(root, { bridge, refresh: () => refresh('notas'), react, sound }); return; }
    if (view === 'calendario') { window.NexoCalendario.wire(root, { bridge, refresh: () => refresh('calendario'), react, sound }); return; }
    root.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      const S = W?.sit || situation();
      const block = id => S.blocks.find(x => x.id === id);
      if (b.dataset.orgAvailability !== undefined) { window.NexoCalendario.openAvailability(); return bridge.go('planner', 'calendario'); }
      if (b.dataset.orgMin) {
        const o = org(), wd = new Date().getDay();
        o.minutes[wd] = clamp(minutesToday() + Number(b.dataset.orgMin), 0, 360);
        bridge.save(); return refresh(view);
      }
      if (b.dataset.orgStart) {
        const x = block(b.dataset.orgStart); if (!x) return;
        bridge.state.timer.subject = x.subject; bridge.save();
        bridge.toast(`${x.minutes} min · ${x.text}`);
        return bridge.go('hub', 'timer');
      }
      if (b.dataset.orgDone || b.dataset.orgUndo) {
        const m = marksToday(), id = b.dataset.orgDone || b.dataset.orgUndo;
        m.done = b.dataset.orgDone ? [...new Set([...m.done, id])] : m.done.filter(k => k !== id);
        bridge.save();
        if (b.dataset.orgDone) { sound('tinta'); W?.life.act('baile'); }
        return refresh(view);
      }
      if (b.dataset.orgSkip) {
        const x = block(b.dataset.orgSkip); if (!x) return;
        const m = marksToday(); m.skip = [...new Set([...m.skip, x.event.id])];
        bridge.save(); refresh(view);
        bridge.toast('Listo, hoy no. Nexo lo reacomoda sin culpa.', 'Deshacer', () => { m.skip = m.skip.filter(k => k !== x.event.id); bridge.save(); refresh(view); });
        return;
      }
      if (b.dataset.orgPrelab) {
        const ev = bridge.state.events.find(x => x.id === b.dataset.orgPrelab); if (!ev) return;
        ev.lab = window.NexoLabPlan ? window.NexoLabPlan.normalize(ev.lab) : (ev.lab || {});
        ev.lab.prelab = { ...(ev.lab.prelab || {}), done: !ev.lab.prelab?.done };
        bridge.save(); return refresh(view);
      }
    };
  }
  function refresh(view) {
    const host = document.querySelector('.estudio-panel'); if (!host) return;
    W && (W.sit = situation());
    host.innerHTML = panel(view, W?.sit || situation());
    wirePanel(host, view);
  }

  // ——— Pantalla ———
  function render(app, sub, b) {
    bridge = b;
    css();
    const view = VIEWS.includes(sub) ? sub : LEGACY[sub] || 'hoy';
    const S = situation();
    app.innerHTML = `<section class="page estudio-page" data-estudio-view="${view}">
      <header class="page-header estudio-header"><p class="eyebrow">LA TORRE · ESTUDIO DE PLANOS</p><h1>Organización</h1></header>
      <nav class="estudio-tabs" aria-label="Partes del estudio">${VIEWS.map(v => `<a href="#/planner/${v}" class="${v === view ? 'activa' : ''}"${v === view ? ' aria-current="page"' : ''}>${TITLES[v]}${v === 'avisos' && S.unseen ? ` <b class="punto" aria-label="${S.unseen} nuevos">${S.unseen}</b>` : ''}</a>`).join('')}</nav>
      <div class="estudio-panel madera" data-view="${view}">${panel(view, S)}</div></section>`;
    const page = app.querySelector('.estudio-page');
    wirePanel(page.querySelector('.estudio-panel'), view);
    if (view === 'avisos') window.NexoOrgAvisos?.markSeen(bridge);
    mountScene(page, view, S);
  }

  async function mountScene(page, view, S) {
    try { await load(); } catch (_) { return; }
    if (!page.isConnected) return;
    W = W || createWorld();
    W.sit = S; W.weather = weather();
    const pet = window.NexoPet.current();
    W.life.setKind(pet.kind); W.life.setOutfit(pet.outfit);
    page.classList.add('torre-on');
    page.insertBefore(W.wrap, page.firstChild);
    const title = W.wrap.querySelector('.torre-title');
    title.replaceChildren(page.querySelector('.estudio-header'));
    const bg = getComputedStyle(document.querySelector('main') || document.body).backgroundColor;
    W.wrap.style.setProperty('--torre-fade', bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : '#1a120e');
    const o = W.meta.objects.find(k => k.view === view);
    if (o && W.view_ !== view) {
      if (W.view_ === null) W.life.place(o.stand[0], o.stand[1], false);
      else if (Math.abs(W.life.state.x - o.stand[0]) > 4) W.life.walkTo(o.stand[0], o.stand[1]);
    }
    W.view_ = view;
    resize();
    W.life.pause(false);
    W.last = performance.now();
    if (!W.raf) W.raf = requestAnimationFrame(frame);
    // La mascota habla 1 vez al entrar (por día) y cuando hay aviso nuevo.
    const key = `${S.today}:${S.next?.id || ''}:${S.unseen}`;
    if (W.said !== key) {
      W.said = key;
      const msg = S.unseen ? 'Sonó la campana: hay un aviso nuevo' : S.next ? `Hoy parto por: ${S.next.text.split(':')[0].toLowerCase()} (${bridge.subjectFor(S.next.subject).short})`
        : 'Todo en orden por hoy';
      setTimeout(() => W.wrap.isConnected && say(msg, 4200), 700);
      if (S.unseen) setTimeout(() => sound('campana'), 500);
    }
    if (!W.ambBound) { W.ambBound = true; addEventListener('pointerdown', () => { if (W?.wrap.isConnected) ambient(); }, { passive: true }); }
    ambient();
  }
  addEventListener('resize', () => W?.wrap.isConnected && resize());
  window.NexoEstudio = Object.freeze({ render, views: VIEWS, legacy: LEGACY, react });
})();
