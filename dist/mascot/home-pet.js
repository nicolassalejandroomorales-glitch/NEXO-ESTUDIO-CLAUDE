/* Mascota pixel en la app (docs/mascota/SPEC.md · Fase 6).
   Carga perezosa de pixelmascotas.js + pixel-vida.js, y la conecta con: Inicio (vive en el refugio), barra lateral,
   Perfil › Mascota y Tienda. Estado en state.mascot = { name, kind, outfit } (solo local, sin nube). */
(() => {
  'use strict';
  const KINDS = ['matraz', 'atomo', 'slime'];
  const NAMES = { matraz: 'Matraz', atomo: 'Átomo', slime: 'Slime' };
  const SLOTS = ['cabeza', 'cara', 'cuello', 'mano'];
  const STATIONS = {
    deskFloor: { x: 84, y: 166 },
    desk: { x: 88, y: 112, perch: true, from: 'deskFloor', scale: .92, action: 'read', say: 'Sube al escritorio…' },
    shelf: { x: 132, y: 162, action: 'book', say: 'Va a la estantería…' },
    rug: { x: 214, y: 196, say: 'Paseando por la alfombra…' },
    rug2: { x: 276, y: 206, say: 'Paseando por la alfombra…' },
    chairFront: { x: 336, y: 178 },
    chair: { x: 354, y: 136, perch: true, from: 'chairFront', scale: .9, action: 'nap', say: 'Se va al sillón…' }
  };
  const ROUTE = ['deskFloor', 'shelf', 'desk', 'rug', 'rug2', 'chair', 'rug', 'shelf', 'desk', 'rug2'];
  const EXPRS = ['neutral', 'feliz', 'picara', 'deslumbrada', 'amor', 'concentrada'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let api = { get: () => ({}), set: () => {}, motion: () => 'full', studying: () => false };
  let loading = null, home = null, minis = new Set(), miniRaf = 0, cheerUntil = 0, stormOn = false, nightTimer = 0;

  function loadScript(src) {
    return new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = new URL(src, document.baseURI).href; s.onload = ok; s.onerror = fail; document.head.append(s);
    });
  }
  function engine() {
    if (window.PixelMascotas && window.PixelVida) return Promise.resolve(window.PixelMascotas);
    loading = loading || loadScript('mascot/pixelmascotas.js?v=1').then(() => loadScript('mascot/pixel-vida.js?v=1')).then(() => window.PixelMascotas);
    return loading;
  }
  const pet = () => {
    const m = api.get() || {};
    return { kind: KINDS.includes(m.kind) ? m.kind : 'matraz', name: m.name || '', outfit: m.outfit && typeof m.outfit === 'object' ? m.outfit : {} };
  };
  const petName = () => { const p = pet(); return p.name && p.name !== 'Nexo' ? p.name : NAMES[p.kind]; };
  const reduced = () => api.motion() === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ——— Sprites pequeños animados (barra lateral, Perfil, Tienda) ———
  function miniTick(now) {
    miniRaf = 0;
    const P = window.PixelMascotas; if (!P) return;
    const t = now / 1000, blink = (t % 3.4) < .13, motionOff = reduced();
    minis.forEach(item => {
      const c = item.canvas;
      if (!c.isConnected) { minis.delete(item); return; }
      const p = pet(), kind = item.kind || p.kind, cheer = now < cheerUntil, tt = motionOff ? 0 : t;
      const expr = item.expr ? item.expr(t) : cheer ? 'feliz' : api.studying() ? 'concentrada' : 'neutral';
      const arm = item.expr ? item.arm?.(expr) || 'rest' : cheer ? 'wave' : 'rest';
      const st = { t: tt, sx: 1, sy: 1 + .02 * Math.sin(tt * 2), bodyTilt: 0, rootTilt: 0, hop: cheer && !motionOff ? Math.abs(Math.sin(t * 8)) * 3 : 0,
        lift: kind === 'atomo' ? 2 + Math.sin(tt * 2) * 1.5 : 0, slosh: 4 * Math.sin(tt * 2), cork: 0, tag: 8 * Math.sin(tt * 2), footL: 0, footR: 0, spin: 0, excite: 0, drip: 0,
        hat: 3 * Math.sin(tt * 3), look: [0, 0], blink: blink && !motionOff, expr, outfit: item.naked ? {} : (item.outfit || p.outfit), arms: P.armPose(arm, tt) };
      const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); P.render(ctx, kind, st);
    });
    if (minis.size) miniRaf = requestAnimationFrame(miniTick);
  }
  function addMini(item) { minis.add(item); if (!miniRaf) miniRaf = requestAnimationFrame(miniTick); }

  // ——— Barra lateral ———
  async function renderDock(dock) {
    if (!dock) return;
    try { await engine(); } catch (_) { dock.hidden = true; return; }
    if (!dock.querySelector('canvas')) {
      dock.innerHTML = `<canvas class="dock-pet" width="40" height="44" aria-hidden="true"></canvas><p class="companion-name"></p>`;
      addMini({ canvas: dock.querySelector('canvas') });
    }
    dock.querySelector('.companion-name').textContent = petName();
    dock.hidden = false;
  }

  // ——— Inicio: la mascota vive en el refugio ———
  function cleanup() { if (home) { home.life.stop(); home.canvas.remove(); clearInterval(nightTimer); home = null; } }
  async function mountHome(plane) {
    cleanup();
    if (!plane || plane.dataset.sceneId !== 'refugio-pixel') return;
    try { await engine(); } catch (_) { return; }
    if (!plane.isConnected) return;
    const canvas = document.createElement('canvas'); canvas.width = 418; canvas.height = 235; canvas.className = 'home-pet-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none;z-index:4';
    plane.append(canvas);
    const p = pet();
    const life = window.PixelVida.create({ canvas, background: null, stations: STATIONS, bookFrom: [120, 96], reduced: reduced(), kind: p.kind, route: ROUTE,
      depth: y => .86 + Math.max(0, Math.min(1, (y - 150) / 85)) * .4 });
    life.setOutfit(p.outfit);
    home = { life, canvas };
    // Tocarla: sin bloquear los objetos de la escena (solo si el toque cae sobre la mascota).
    plane.addEventListener('pointerdown', e => {
      if (!home) return;
      const r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 418, y = (e.clientY - r.top) / r.height * 235, a = life.state;
      if (Math.abs(x - a.x) < 14 && y < a.y + 4 && y > a.y - 40) { life.poke(); e.stopPropagation(); e.preventDefault(); }
    }, true);
    const isNight = () => document.body.dataset.nexoTime === 'night';
    life.night(isNight()); life.storm(stormOn);
    nightTimer = setInterval(() => { if (home) { life.night(isNight()); life.pause(document.hidden); } }, 5000);
  }

  // ——— Clima (Open-Meteo, Santiago, máx. cada 30 min, sin red = despejado) ———
  async function checkWeather() {
    const KEY = 'nexo.weather.v1';
    try {
      let cache = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!cache || Date.now() - cache.at > 30 * 60 * 1000) {
        const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-33.45&longitude=-70.66&current=weather_code', { cache: 'no-store' });
        const code = (await r.json()).current?.weather_code ?? 0;
        cache = { at: Date.now(), code }; localStorage.setItem(KEY, JSON.stringify(cache));
      }
      stormOn = cache.code >= 95; home?.life.storm(stormOn);
    } catch (_) { stormOn = false; }
  }

  // ——— Reacciones ———
  function celebrate(atoms) {
    cheerUntil = performance.now() + 3500;
    if (home) home.life.celebrate(Math.max(0, Math.round(atoms) || 0));
  }

  // ——— Perfil › Mascota ———
  async function wireProfile(root) {
    const P = await engine().catch(() => null); if (!P || !root.isConnected) return;
    const pets = root.querySelector('#petPick'), wardrobe = root.querySelector('#petWardrobe'), name = root.querySelector('#petName');
    pets.innerHTML = P.list.map(([k, l]) => `<button type="button" class="pet-pick" data-kind="${k}" aria-pressed="${k === pet().kind}" style="border:3px solid transparent;border-radius:10px;background:#e9d9b4;color:#3b2418;font-weight:bold;padding:4px;cursor:pointer"><canvas width="40" height="44" style="width:96px;height:106px;display:block;image-rendering:pixelated"></canvas>${l}</button>`).join('');
    pets.querySelectorAll('.pet-pick').forEach(b => addMini({ canvas: b.querySelector('canvas'), kind: b.dataset.kind, naked: true }));
    const paintPick = () => pets.querySelectorAll('.pet-pick').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.kind === pet().kind)); b.style.borderColor = b.dataset.kind === pet().kind ? '#e8b65a' : 'transparent'; });
    const big = root.querySelector('#petBig'); let tryOn = null;
    addMini({ canvas: big, expr: t => EXPRS[Math.floor(t / 2.5) % EXPRS.length], arm: e => e === 'picara' ? 'sixseven' : e === 'feliz' ? 'wave' : 'rest',
      get outfit() { return pet().outfit; } });
    const paintWardrobe = () => { const o = pet().outfit, owned = window.NexoTienda.shopOf(api.shop.state()).owned;
      wardrobe.innerHTML = SLOTS.map(slot => `<label>${slot[0].toUpperCase() + slot.slice(1)} <select data-slot="${slot}"><option value="">—</option>` +
      Object.entries(P.ACCESORIOS).filter(([id, a]) => a.slot === slot && (owned.includes(id) || o[slot] === id)).map(([id]) => `<option value="${id}"${o[slot] === id ? ' selected' : ''}>${esc(P.NOMBRES[id])}</option>`).join('') + '</select></label>').join(''); };
    paintPick(); paintWardrobe();
    name.value = pet().name === 'Nexo' ? '' : pet().name; name.placeholder = NAMES[pet().kind];
    pets.onclick = e => { const b = e.target.closest('.pet-pick'); if (!b) return; api.set({ kind: b.dataset.kind }); name.placeholder = NAMES[b.dataset.kind]; paintPick(); home?.life.setKind(b.dataset.kind); };
    name.oninput = () => api.set({ name: name.value.trim().slice(0, 20) });
    wardrobe.onchange = e => { const o = { ...pet().outfit, [e.target.dataset.slot]: e.target.value }; api.set({ outfit: o }); home?.life.setOutfit(o); };
  }

  // ——— Tienda: cofres, polvo y accesorios (lógica en economy/tienda.js, docs/economia/SPEC.md) ———
  const RARITY_COLOR = { comun: '#b9a98a', poco: '#6cc08b', raro: '#6aa7ff', legendario: '#f2b84b' };
  async function wireShop(root) {
    const P = await engine().catch(() => null); if (!P || !root.isConnected) return;
    const T = window.NexoTienda, S = api.shop, shop = root.querySelector('#petShop'), prev = root.querySelector('#petShopPreview'), top = root.querySelector('#shopTop');
    let tryOut = { ...pet().outfit }, reveal = null, note = '';
    addMini({ canvas: prev, get outfit() { return tryOut; } });
    const tag = id => `<b style="color:${RARITY_COLOR[T.RARITY_OF[id]]}">${T.LABELS[T.RARITY_OF[id]]}</b>`;
    const render = () => {
      const st = S.state(), s = T.shopOf(st), locked = S.locked(), daily = s.dailyAt === S.today();
      const btn = (act, label, off) => `<button type="button" data-act="${act}"${off ? ' disabled' : ''}>${label}</button>`;
      top.innerHTML = `<p style="margin:6px 0"><b>${Math.floor(st.coins)} ⚛</b> · ${s.dust} polvo · ${s.chests} cofre${s.chests === 1 ? '' : 's'} sin abrir</p>` +
        (locked ? '<p><small>Con cuenta en la nube la Tienda se activa más adelante; como invitado ya puedes usarla.</small></p>' :
        `<div style="display:flex;gap:8px;flex-wrap:wrap">${btn('daily', daily ? 'Cofre diario (ya abierto hoy)' : 'Cofre diario gratis', daily)}${btn('buy', `Comprar cofre · ${T.CHEST_PRICE} ⚛`, st.coins < T.CHEST_PRICE)}${btn('open', `Abrir cofre (${s.chests})`, s.chests < 1)}</div>`) +
        `<p><small>Cada ${T.PITY} cofres sin nada raro, el siguiente lo es seguro. Los repetidos se vuelven polvo.</small></p>` +
        (note ? `<p role="status">${esc(note)}</p>` : '') +
        (reveal ? `<div class="chest-reveal" style="text-align:center;margin:8px 0"><div class="pet-icon chest-pop" style="display:inline-flex;background:#e9d9b4;border-radius:10px;padding:12px;box-shadow:0 0 18px ${RARITY_COLOR[reveal.rarity]}"></div><p><b>${esc(P.NOMBRES[reveal.id])}</b> · ${tag(reveal.id)}${reveal.dupe ? ` · repetido: +${reveal.dust} polvo` : ' · ¡nuevo!'}</p></div>` : '');
      const box = top.querySelector('.chest-pop');
      if (box) { const c = P.sprite(P.ACCESORIOS[reveal.id].rows); c.style.cssText = `width:${c.width * 6}px;height:${c.height * 6}px;image-rendering:pixelated`; box.append(c); }
      shop.innerHTML = Object.entries(P.ACCESORIOS).sort((a, b) => T.RARITIES.indexOf(T.RARITY_OF[a[0]]) - T.RARITIES.indexOf(T.RARITY_OF[b[0]])).map(([id, a]) => {
        const own = s.owned.includes(id), price = T.DUST_PRICE[T.RARITY_OF[id]];
        return `<div class="pet-item" style="background:#1f1a14;border:1px solid #4a3d2e;border-radius:10px;padding:8px;text-align:center"><div class="pet-icon" data-id="${id}" style="background:#e9d9b4;border-radius:8px;display:flex;justify-content:center;align-items:center;height:64px;margin-bottom:6px"></div><b>${esc(P.NOMBRES[id])}</b><small style="display:block;opacity:.7">${a.slot} · ${tag(id)}</small>` +
          `<button type="button" data-try="${id}" style="margin-top:6px;width:100%">${tryOut[a.slot] === id ? 'Quitar' : 'Probar'}</button>` +
          (own ? '<small style="display:block;margin-top:4px;color:#6cc08b">Tuyo ✓</small>' : `<button type="button" data-dust="${id}" style="margin-top:4px;width:100%"${s.dust < price ? ' disabled' : ''}>${price} polvo</button>`) + '</div>';
      }).join('');
      shop.querySelectorAll('.pet-icon').forEach(b => { const c = P.sprite(P.ACCESORIOS[b.dataset.id].rows); c.style.cssText = `width:${c.width * 4}px;height:${c.height * 4}px;image-rendering:pixelated`; b.append(c); });
    };
    const act = name => {
      const st = S.state(); note = ''; reveal = null;
      const r = name === 'buy' ? T.buyChest(st) : name === 'daily' ? T.claimDaily(st, S.today()) : T.openChest(st);
      if (!r.ok) note = r.reason; else if (name === 'open') { reveal = r; cheerUntil = performance.now() + 2500; }
      S.save(); render();
    };
    top.onclick = e => { const a = e.target.dataset.act; if (a) act(a); };
    shop.onclick = e => {
      const d = e.target.dataset.dust, id = e.target.dataset.try;
      if (d) { const r = T.buyWithDust(S.state(), d); note = r.ok ? `¡Conseguiste ${P.NOMBRES[d]}!` : r.reason; reveal = null; S.save(); render(); }
      else if (id) { const slot = P.ACCESORIOS[id].slot; tryOut = { ...tryOut, [slot]: tryOut[slot] === id ? '' : id }; render(); }
    };
    render();
  }

  window.NexoPet = Object.freeze({
    bind(a) { api = { ...api, ...a }; },
    mountHome, cleanup, renderDock, celebrate, wireProfile, wireShop, checkWeather, kinds: KINDS, names: NAMES,
    engine, current: pet, reduced   // los usa el mundo de la torre (world/torre-mundo.js)
    , homeSpot: () => home && { x: home.life.state.x, y: home.life.state.y, act: n => home.life.act(n) }   // globo de avisos del Inicio (planner/avisos.js)
  });
})();
