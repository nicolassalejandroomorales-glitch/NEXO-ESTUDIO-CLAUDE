/* Tienda y cofres (docs/economia/SPEC.md). Lógica pura: recibe el estado y lo modifica; no toca el DOM.
   state.shop = { owned: [ids], dust: polvo, chests: cofres sin abrir, sinceRare: cofres desde el último raro+, dailyAt: 'AAAA-MM-DD' } */
(() => {
  'use strict';
  const RARITIES = ['comun', 'poco', 'raro', 'legendario'];
  const LABELS = { comun: 'Común', poco: 'Poco común', raro: 'Raro', legendario: 'Legendario' };
  const ODDS = { comun: 60, poco: 28, raro: 10, legendario: 2 };            // % por cofre
  const DUST = { comun: 10, poco: 20, raro: 40, legendario: 80 };            // polvo que da un repetido
  const DUST_PRICE = { comun: 30, poco: 60, raro: 120, legendario: 240 };    // polvo para comprar directo
  const CHEST_PRICE = 70;                                                    // ⚛ por cofre
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
    return s;
  }
  const fail = reason => ({ ok: false, reason });

  function buyChest(state) {
    const s = shopOf(state);
    if ((Number(state.coins) || 0) < CHEST_PRICE) return fail('Te faltan átomos para un cofre.');
    state.coins -= CHEST_PRICE; s.chests += 1;
    return { ok: true };
  }
  function claimDaily(state, today) {
    const s = shopOf(state);
    if (s.dailyAt === today) return fail('El cofre de hoy ya lo abriste. Vuelve mañana.');
    s.dailyAt = today; s.chests += 1;
    return { ok: true };
  }
  function grantChest(state, n = 1) { shopOf(state).chests += Math.max(0, Math.floor(n)); }   // premios por hitos

  function rollRarity(rng, forceRare) {
    if (forceRare) return rng() < ODDS.legendario / (ODDS.raro + ODDS.legendario) ? 'legendario' : 'raro';
    let x = rng() * 100;
    for (const r of RARITIES) { if (x < ODDS[r]) return r; x -= ODDS[r]; }
    return 'comun';
  }
  // Abre un cofre: da un accesorio nuevo; si ya lo tenías, lo convierte en polvo.
  function openChest(state, rng = Math.random) {
    const s = shopOf(state);
    if (s.chests < 1) return fail('No tienes cofres para abrir.');
    s.chests -= 1;
    const guaranteed = s.sinceRare >= PITY - 1;
    const rarity = rollRarity(rng, guaranteed);
    s.sinceRare = rarity === 'raro' || rarity === 'legendario' ? 0 : s.sinceRare + 1;
    const pool = idsOf(rarity), id = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
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

  window.NexoTienda = Object.freeze({ RARITIES, LABELS, ODDS, DUST, DUST_PRICE, CHEST_PRICE, PITY, RARITY_OF,
    shopOf, buyChest, claimDaily, grantChest, openChest, buyWithDust });
})();
