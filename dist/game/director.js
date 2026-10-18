/* Director de encuentros: decide CUÁNDO sale un bicho y CUÁL. Puro: no toca pantalla ni guarda nada solo.
   El bicho sale de la cola de pendientes (repasos vencidos y errores abiertos) y su mano, de un ejercicio real de la clase
   (docs/juegos/SPEC.md). El estado del director (dstate) lo guarda quien lo llama, junto con el resto del estado. */
(() => {
  'use strict';
  const MIN = 60000, DAY = 86400000;
  const GAP = 10 * MIN;          // como mucho un bicho cada ~10 minutos
  const SNOOZE = 5 * MIN;        // "ahora no": vuelve a poder aparecer en 5 minutos
  const DAILY_XP = 300;          // tope diario de XP del juego (no se puede farmear)
  const REPEAT = 3 * DAY;        // el mismo ejercicio no vuelve antes de 3 días

  const createState = () => ({ lastAt: null, day: { date: '', xp: 0, count: 0 }, seen: {} });
  const dayKey = now => new Date(now).toISOString().slice(0, 10);
  const today = (dstate, now) => (dstate.day?.date === dayKey(now) ? dstate.day : { date: dayKey(now), xp: 0, count: 0 });

  /* Clases que hay que tener cargadas para armar los bichos pendientes (las clases se cargan bajo demanda). */
  function classIdsFor(pending) {
    const aliases = window.NexoAcademicBridge?.aliases || {};
    const ids = new Set();
    for (const item of pending) {
      const prefix = /^([a-z]+-\d+):/.exec(item.conceptId)?.[1];
      if (prefix) ids.add(prefix);
      for (const [classId, map] of Object.entries(aliases)) if (Object.values(map).includes(item.conceptId)) ids.add(classId);
    }
    return [...ids];
  }

  /* Ejercicios de duelo de una clase, agrupados por el concepto del motor académico. */
  const indexCache = new WeakMap();
  function indexOf(cls) {
    if (indexCache.has(cls)) return indexCache.get(cls);
    const byConcept = new Map();
    const title = id => cls.concepts?.find(c => c.id === id)?.title || id;
    (function walk(node) {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== 'object') return;
      if (node.id && node.concept && window.NexoDuel.eligible(node)) {
        const key = window.NexoAcademicBridge.conceptOf(cls, node.concept);
        if (!byConcept.has(key)) byConcept.set(key, []);
        byConcept.get(key).push({ classId: cls.id, subject: cls.subject, item: node, name: title(node.concept) });
      }
      for (const k in node) walk(node[k]);
    })([cls.missions, cls.duelos]);
    indexCache.set(cls, byConcept);
    return byConcept;
  }

  function canAppear(dstate, now = new Date()) {
    if (today(dstate, now).xp >= DAILY_XP) return false;
    return !dstate.lastAt || now - new Date(dstate.lastAt) >= GAP;
  }

  /* El encuentro, o null (todavía no toca, ya llegaste al tope, o no hay bichos con ejercicio). */
  function choose(dstate, { state, classes, now = new Date(), seed = Date.now(), force = false } = {}) {
    if (!force && !canAppear(dstate, now)) return null;
    const pending = window.NexoAcademicPending.list(state, { now, limit: 30 });
    const rand = (() => { let a = Number(seed) >>> 0 || 1; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
    for (const bug of pending) {
      let options = [];
      for (const cls of Object.values(classes || {})) options = options.concat(indexOf(cls).get(bug.conceptId) || []);
      options = options.filter(o => !dstate.seen[`${o.classId}:${o.item.id}`] || now - new Date(dstate.seen[`${o.classId}:${o.item.id}`]) >= REPEAT);
      if (!options.length) continue;
      // Los ejercicios de ordenar y de receta dan mejores duelos que los de una sola carta.
      const rich = options.filter(o => o.item.type === 'order' || o.item.type === 'recipe');
      const pool = rich.length ? rich : options;
      const pick = pool[Math.floor(rand() * pool.length)];
      return { conceptId: bug.conceptId, name: pick.name, subject: pick.subject, classId: pick.classId, item: pick.item, weight: bug.weight,
        reasons: bug.reasons, openErrors: bug.openErrors, misconceptionIds: bug.misconceptionIds };
    }
    return null;
  }

  /* Cuenta un duelo terminado: respeta el gap, el tope diario y no repite el ejercicio pronto. Devuelve un estado nuevo. */
  function register(dstate, encounter, xp, now = new Date()) {
    const next = JSON.parse(JSON.stringify(dstate));
    const day = today(next, now);
    day.xp = Math.min(DAILY_XP, day.xp + Math.max(0, xp));
    day.count += 1;
    next.day = day;
    next.lastAt = new Date(now).toISOString();
    next.seen[`${encounter.classId}:${encounter.item.id}`] = next.lastAt;
    return next;
  }

  /* "Ahora no": el bicho espera 5 minutos y no cuenta como duelo. */
  function snooze(dstate, now = new Date()) {
    const next = JSON.parse(JSON.stringify(dstate));
    next.lastAt = new Date(now - GAP + SNOOZE).toISOString();
    return next;
  }

  window.NexoDirector = { createState, canAppear, choose, register, snooze, classIdsFor, DAILY_XP, GAP, SNOOZE };
})();
