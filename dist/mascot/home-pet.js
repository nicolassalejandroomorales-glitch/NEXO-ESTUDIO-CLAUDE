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
    const kind = KINDS.includes(m.kind) ? m.kind : 'matraz';
    return { kind, owned: [...new Set([kind, ...(Array.isArray(m.owned) ? m.owned : [])])], name: m.name || '', outfit: m.outfit && typeof m.outfit === 'object' ? m.outfit : {} };
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

  // Retrato animado de tu mascota (Perfil › Vestuario y la carta del Perfil).
  async function paintBig(canvas) {
    await engine().catch(() => null);
    if (!canvas?.isConnected) return;
    addMini({ canvas, expr: t => EXPRS[Math.floor(t / 2.5) % EXPRS.length], arm: e => e === 'picara' ? 'sixseven' : e === 'feliz' ? 'wave' : 'rest',
      get outfit() { return pet().outfit; } });
  }

  // ——— Perfil › Vestuario ———
  async function wireProfile(root) {
    const P = await engine().catch(() => null); if (!P || !root.isConnected) return;
    const pets = root.querySelector('#petPick'), wardrobe = root.querySelector('#petWardrobe'), name = root.querySelector('#petName');
    pets.innerHTML = P.list.map(([k, l]) => `<button type="button" class="pet-pick" data-kind="${k}" aria-pressed="${k === pet().kind}"${pet().owned.includes(k) ? '' : ' disabled'} style="border:3px solid transparent;border-radius:10px;background:#e9d9b4;color:#3b2418;font-weight:bold;padding:4px;cursor:pointer${pet().owned.includes(k) ? '' : ';opacity:.5;filter:grayscale(1)'}"><canvas width="40" height="44" style="width:96px;height:106px;display:block;image-rendering:pixelated"></canvas>${l}${pet().owned.includes(k) ? '' : '<small style="display:block">🔒 En la Tienda</small>'}</button>`).join('');
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
    pets.onclick = e => { const b = e.target.closest('.pet-pick'); if (!b || b.disabled) return; api.set({ kind: b.dataset.kind }); name.placeholder = NAMES[b.dataset.kind]; paintPick(); home?.life.setKind(b.dataset.kind); };
    name.oninput = () => api.set({ name: name.value.trim().slice(0, 20) });
    wardrobe.onchange = e => { const o = { ...pet().outfit, [e.target.dataset.slot]: e.target.value }; api.set({ outfit: o }); home?.life.setOutfit(o); };
  }

  // ——— Tienda del alquimista: cofres, polvo y accesorios (lógica en economy/tienda.js, apertura en economy/cofre-fx.js, docs/economia/SPEC.md) ———
  const CHEST_KINDS = [['sorpresa', 'Sorpresa', 'Cualquier accesorio'], ['cabeza', 'De cabeza', 'Gorros y coronas'], ['cara', 'De rostro', 'Lentes y monóculos'], ['cuello', 'De cuello', 'Bufandas y collares'], ['mano', 'De mano', 'Tazas, lupas y varitas']];
  async function wireShop(root) {
    const P = await engine().catch(() => null); if (!P || !root.isConnected) return;
    const T = window.NexoTienda, S = api.shop, shop = root.querySelector('#petShop'), prev = root.querySelector('#petShopPreview'), top = root.querySelector('#shopTop'),
      wallet = root.querySelector('#shopWallet'), odds = root.querySelector('#shopOdds'), types = root.querySelector('#shopTypes'), chestImg = root.querySelector('#shopChest');
    let tryOut = { ...pet().outfit }, note = '';
    addMini({ canvas: prev, get outfit() { return tryOut; } });
    const sprite = (id, k) => { const c = P.sprite(P.ACCESORIOS[id].rows); c.style.cssText = `width:${c.width * k}px;height:${c.height * k}px;image-rendering:pixelated`; return c; };
    const count = (s, kind) => kind === 'sorpresa' ? s.chests : s.slotChests[kind];
    const btn = (attrs, label, off) => `<button type="button" class="pu-btn" ${attrs}${off ? ' disabled' : ''}>${label}</button>`;
    const render = () => {
      const st = S.state(), s = T.shopOf(st), locked = S.locked(), daily = s.dailyAt === S.today(), total = s.chests + T.SLOTS.reduce((n, k) => n + s.slotChests[k], 0);
      wallet.innerHTML = `<span class="pu-paper"><b>${Math.floor(st.coins)}</b> ⚛</span><span class="pu-paper"><b>${s.dust}</b> <small>polvo</small></span><span class="pu-paper"><b>${total}</b> <small>cofre${total === 1 ? '' : 's'}</small></span>`;
      chestImg.classList.toggle('tc-lit', total > 0);
      top.innerHTML = locked ? '<p class="tc-hint">Con cuenta en la nube la Tienda se activa más adelante; como invitado ya puedes usarla.</p>' :
        `<div class="tienda-acciones">${btn('data-act="daily"', daily ? 'Cofre diario (ya abierto)' : 'Cofre diario gratis', daily)}${btn('data-open="sorpresa"', `Abrir cofre (${s.chests})`, s.chests < 1)}</div>` +
        `<p class="tc-hint">Cada ${T.PITY} cofres sin nada raro, el siguiente lo es seguro. Los repetidos se vuelven polvo.</p>` + (note ? `<p class="tienda-nota" role="status">${esc(note)}</p>` : '');
      types.innerHTML = CHEST_KINDS.map(([kind, label, hint]) => { const price = kind === 'sorpresa' ? T.CHEST_PRICE : T.SLOT_CHEST_PRICE;
        return `<div class="pu-paper tienda-tipo"><b>${label}</b><small>${hint}</small><div class="tt-row">${btn(`data-buy="${kind}"`, `${price} ⚛`, locked || st.coins < price)}${btn(`data-open="${kind}"`, `Abrir (${count(s, kind)})`, locked || count(s, kind) < 1)}</div></div>`; }).join('');
      const RC = { comun: '#8a7a5a', poco: '#2f8a52', raro: '#3a6fd0', legendario: '#c98a10' }, NOTE = { comun: 'sale seguido', poco: 'sale a veces', raro: 'es raro', legendario: 'es muy raro' };
      const inRar = r => Object.keys(P.ACCESORIOS).filter(id => T.RARITY_OF[id] === r).length;
      odds.innerHTML = '<h3>Probabilidades de cada cofre</h3>' + T.RARITIES.map(r => `<div class="to-row" style="--c:${RC[r]}"><span class="to-name">${T.LABELS[r]}</span><span class="to-bar"><i style="width:${T.ODDS[r]}%"></i></span><span>${T.ODDS[r]} % <small>${NOTE[r]}</small></span></div>`).join('') +
        `<small>Cada ${T.PITY} cofres sin nada raro, el siguiente es raro o legendario seguro (llevas ${s.sinceRare}). Los cofres de categoría usan las mismas probabilidades dentro de esa categoría. Los repetidos se vuelven polvo.</small>`;
      shop.innerHTML = Object.entries(P.ACCESORIOS).sort((a, b) => T.RARITIES.indexOf(T.RARITY_OF[a[0]]) - T.RARITIES.indexOf(T.RARITY_OF[b[0]])).map(([id, a]) => {
        const own = s.owned.includes(id), r = T.RARITY_OF[id], price = T.DUST_PRICE[r];
        return `<div class="pu-paper tienda-item" data-r="${r}"><div class="ti-icon" data-id="${id}"></div><b>${esc(P.NOMBRES[id])}</b><small>${a.slot}</small><span class="ti-rar">${T.LABELS[r]}</span><span class="ti-pct">${(T.ODDS[r] / inRar(r)).toFixed(1)} % por cofre</span>` +
          btn(`data-try="${id}"`, tryOut[a.slot] === id ? 'Quitar' : 'Probar') +
          (own ? '<span class="ti-own">Tuyo ✓</span>' : btn(`data-dust="${id}"`, `${price} polvo`, s.dust < price)) + '</div>';
      }).join('');
      shop.querySelectorAll('.ti-icon').forEach(b => b.append(sprite(b.dataset.id, 4)));
    };
    const open = async kind => {
      const st = S.state(); note = '';
      const r = T.openChest(st, Math.random, kind);
      if (!r.ok) { note = r.reason; render(); return; }
      S.save();
      const again = count(T.shopOf(st), kind) > 0;
      const ids = Object.keys(P.ACCESORIOS).map(id => ({ id, rarity: T.RARITY_OF[id] }));
      const choice = await window.NexoCofre.play({ winner: { id: r.id, rarity: r.rarity }, ids, tile: id => sprite(id, 5), reduced: reduced(), title: P.NOMBRES[r.id],
        note: `${T.LABELS[r.rarity]} (${T.ODDS[r.rarity]} %) · ${r.dupe ? `repetido: +${r.dust} polvo` : '¡nuevo!'}`, again });
      cheerUntil = performance.now() + 2500; render();
      if (choice === 'again' && root.isConnected) open(kind);
    };
    const act = (name, kind) => {
      const st = S.state(); note = '';
      const r = name === 'buy' ? T.buyChest(st, kind) : T.claimDaily(st, S.today());
      if (!r.ok) note = r.reason; else { window.NexoAudio?.play('purchase'); note = name === 'buy' ? 'Cofre comprado. ¡A abrirlo!' : 'Tu cofre diario te espera.'; }
      S.save(); render();
    };
    root.querySelector('.tienda-page').onclick = e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const d = b.dataset;
      if (d.open) open(d.open);
      else if (d.buy) act('buy', d.buy);
      else if (d.act) act(d.act);
      else if (d.dust) { const r = T.buyWithDust(S.state(), d.dust); note = r.ok ? `¡Conseguiste ${P.NOMBRES[d.dust]}!` : r.reason; if (r.ok) window.NexoAudio?.play('equip'); S.save(); render(); }
      else if (d.try) { const slot = P.ACCESORIOS[d.try].slot; tryOut = { ...tryOut, [slot]: tryOut[slot] === d.try ? '' : d.try }; render(); }
    };
    render();
  }

  window.NexoPet = Object.freeze({
    bind(a) { api = { ...api, ...a }; },
    mountHome, cleanup, renderDock, celebrate, paintBig, wireProfile, wireShop, checkWeather, kinds: KINDS, names: NAMES,
    engine, current: pet, reduced   // los usa el mundo de la torre (world/torre-mundo.js)
    , homeSpot: () => home && { x: home.life.state.x, y: home.life.state.y, act: n => home.life.act(n) }   // globo de avisos del Inicio (planner/avisos.js)
  });
})();
