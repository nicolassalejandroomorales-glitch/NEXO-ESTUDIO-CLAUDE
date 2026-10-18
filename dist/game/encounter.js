/* Cierra un duelo: lo anota como UN intento de evidencia (puente de las clases) y cuenta la XP y el gap del director.
   Si el motor académico no responde, el duelo igual termina y la XP se cuenta. */
(() => {
  'use strict';
  /* practice = bicho de práctica: deja evidencia pero no da XP ni gasta el tope diario. */
  async function finish(api, { cls, encounter, duel, dstate, practice = false, now = new Date() }) {
    const sum = window.NexoDuel.summary(duel);
    const xp = practice ? 0 : window.NexoDuel.xp(sum, encounter.weight);
    const ev = {
      id: `duel:${encounter.item.id}:${now.getTime()}`, conceptId: encounter.item.concept, correct: sum.attempt.correct, hint: sum.attempt.hint,
      retry: false, transfer: false, confidence: null, misconception: sum.attempt.misconception, at: now.toISOString(),
      delayed: encounter.reasons.includes('review_due')
    };
    try { await window.NexoAcademicBridge.record(api, cls, encounter.item, ev, { activityType: 'game' }); } catch (_) { /* la evidencia se reintenta en otro duelo */ }
    const next = practice ? dstate : window.NexoDirector.register(dstate, encounter, xp, now);
    return { sum, xp, dstate: next };
  }
  window.NexoEncounter = { finish };
})();
