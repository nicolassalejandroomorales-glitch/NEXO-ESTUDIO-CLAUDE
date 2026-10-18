/* Tienda y cofres (docs/economia/SPEC.md). Lógica pura: recibe el estado y lo modifica; no toca el DOM.
   state.shop = { owned: [ids], dust: polvo, chests: cofres sin abrir, sinceRare: cofres desde el último raro+, dailyAt: 'AAAA-MM-DD', hitos: [ids de logros ya premiados] } */
(() => {
  'use strict';
  const RARITIES = ['comun', 'poco', 'raro', 'legendario'];
  const LABELS = { comun: 'Común', poco: 'Poco común', raro: 'Raro', legendario: 'Legendario' };
  const ODDS = { comun: 60, poco: 28, raro: 10, legendario: 2 };            // % por cofre
  const DUST = { comun: 10, poco: 20, raro: 40, legendario: 80 };            // polvo que da un repetido
  const DUST_PRICE = { comun: 30, poco: 60, raro: 120, legendario: 240 };    // polvo para comprar directo
  const CHEST_PRICE = 70;                                                    // ⚛ por cofre sorpresa
  const SLOT_CHEST_PRICE = 90;                                               // ⚛ por cofre de una categoría (cabeza, cara, cuello, mano)
  const SLOTS = ['cabeza', 'cara', 'cuello', 'mano'];
  const SLOT_OF = {
    flor: 'cabeza', gorro: 'cabeza', birrete: 'cabeza', sombrero: 'cabeza', corona: 'cabeza',
    lentes: 'cara', monoculo: 'cara', lentesSol: 'cara',
    corbatin: 'cuello', bufanda: 'cuello', collar: 'cuello',
    taza: 'mano', lupa: 'mano', varita: 'mano'
  };
  // Átomos por evidencia (no por tiempo). Tope diario para que no se pueda farmear.
  const EARN = { sinAyuda: 3, conAyuda: 1, transferencia: 6, recuerdo: 8, sesion: 0 };
  const DAILY_CAP = 60, DAILY_BONUS = 5;
  const PITY = 10;                                                           // cada 10 cofres sin raro+, el siguiente lo es
  const RARITY_OF = {
    flor: 'comun', corbatin: 'comun', lentes: 'comun', gorro: 'comun', taza: 'comun',
    bufanda: 'poco', lupa: 'poco', monoculo: 'poco', collar: 'poco',
    birrete: 'raro', lentesSol: 'raro', varita: 'raro',
    sombrero: 'legendario', corona: 'legendario'
  };

  const idsOf = r => Object.keys(RARITY_OF).filter(id => RARITY_OF[id] === r);
  function shopOf(state) {
    const s = state.shop && typeof state.shop === 'object' ? state.shop : (state.shop = {});
    if (!Array.isArray(s.owned)) s.owned = [];
    ['dust', 'chests', 'sinceRare'].forEach(k => { s[k] = Math.max(0, Math.floor(Number(s[k]) || 0)); });
    if (typeof s.dailyAt !== 'string') s.dailyAt = '';
    if (!s.slotChests || typeof s.slotChests !== 'object') s.slotChests = {};
    SLOTS.forEach(k => { s.slotChests[k] = Math.max(0, Math.floor(Number(s.slotChests[k]) || 0)); });
    if (!s.earned || typeof s.earned !== 'object') s.earned = { day: '', total: 0 };
    s.hitos = Array.isArray(s.hitos) ? s.hitos.filter(h => typeof h === 'string').slice(-500) : [];
    return s;
  }
  const fail = reason => ({ ok: false, reason });

  // kind: 'sorpresa' o una categoría de SLOTS.
  function buyChest(state, kind = 'sorpresa') {
    const s = shopOf(state), slot = SLOTS.includes(kind) ? kind : null, price = slot ? SLOT_CHEST_PRICE : CHEST_PRICE;
    if ((Number(state.coins) || 0) < price) return fail('Te faltan átomos para un cofre.');
    state.coins -= price;
    if (slot) s.slotChests[slot] += 1; else s.chests += 1;
    return { ok: true };
  }
  // Suma átomos por evidencia respetando el tope diario. Devuelve cuántos se dieron.
  function earn(state, kind, today, amount) {
    const s = shopOf(state), e = s.earned;
    if (e.day !== today) { e.day = today; e.total = 0; }
    const want = Math.max(0, Math.floor(amount === undefined ? (EARN[kind] || 0) : amount));
    let give = Math.min(want, DAILY_CAP - e.total);
    if (give > 0 && e.total === 0) give += DAILY_BONUS;
    if (give <= 0) return 0;
    e.total += give; state.coins = (Number(state.coins) || 0) + give;
    return give;
  }
  function claimDaily(state, today) {
    const s = shopOf(state);
    if (s.dailyAt === today) return fail('El cofre de hoy ya lo abriste. Vuelve mañana.');
    s.dailyAt = today; s.chests += 1;
    return { ok: true };
  }
  function grantChest(state, n = 1) { shopOf(state).chests += Math.max(0, Math.floor(n)); }
  // Premios por hitos: 1 cofre por logro nuevo (jefe vencido, guía completada, racha de 7/14/30 días). Cada logro paga una sola vez.
  const STREAK_HITOS = [7, 14, 30];
  function claimMilestones(state, { bosses = [], guides = [], streak = 0 } = {}) {
    const s = shopOf(state), found = [...bosses.map(id => 'jefe:' + id), ...guides.map(id => 'guia:' + id), ...STREAK_HITOS.filter(n => streak >= n).map(n => 'racha:' + n)]
      .filter(h => !s.hitos.includes(h));
    s.hitos.push(...found); s.chests += found.length;
    return found;
  }

  function rollRarity(rng, forceRare) {
    if (forceRare) return rng() < ODDS.legendario / (ODDS.raro + ODDS.legendario) ? 'legendario' : 'raro';
    let x = rng() * 100;
    for (const r of RARITIES) { if (x < ODDS[r]) return r; x -= ODDS[r]; }
    return 'comun';
  }
  // Abre un cofre: da un accesorio nuevo; si ya lo tenías, lo convierte en polvo.
  function openChest(state, rng = Math.random, kind = 'sorpresa') {
    const s = shopOf(state), slot = SLOTS.includes(kind) ? kind : null;
    if ((slot ? s.slotChests[slot] : s.chests) < 1) return fail('No tienes cofres para abrir.');
    if (slot) s.slotChests[slot] -= 1; else s.chests -= 1;
    const rolled = rollRarity(rng, s.sinceRare >= PITY - 1);
    // En una categoría puede no haber esa rareza: se usa la más cercana (primero hacia arriba).
    const order = [RARITIES.indexOf(rolled), ...RARITIES.map((_, i) => i)].sort((x, y) => Math.abs(x - RARITIES.indexOf(rolled)) - Math.abs(y - RARITIES.indexOf(rolled)) || y - x);
    const pool = order.map(i => idsOf(RARITIES[i]).filter(i2 => !slot || SLOT_OF[i2] === slot)).find(p => p.length);
    const id = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))], rarity = RARITY_OF[id];
    s.sinceRare = rarity === 'raro' || rarity === 'legendario' ? 0 : s.sinceRare + 1;
    const dupe = s.owned.includes(id);
    if (dupe) s.dust += DUST[rarity]; else s.owned.push(id);
    return { ok: true, id, rarity, dupe, dust: dupe ? DUST[rarity] : 0 };
  }
  function buyWithDust(state, id) {
    const s = shopOf(state), r = RARITY_OF[id];
    if (!r) return fail('Ese accesorio no existe.');
    if (s.owned.includes(id)) return fail('Ya lo tienes.');
    if (s.dust < DUST_PRICE[r]) return fail('Te falta polvo.');
    s.dust -= DUST_PRICE[r]; s.owned.push(id);
    return { ok: true };
  }

  window.NexoTienda = Object.freeze({ RARITIES, LABELS, ODDS, DUST, DUST_PRICE, CHEST_PRICE, SLOT_CHEST_PRICE, SLOTS, SLOT_OF, EARN, DAILY_CAP, DAILY_BONUS, PITY, RARITY_OF,
    shopOf, buyChest, earn, claimDaily, grantChest, claimMilestones, openChest, buyWithDust });
})();
