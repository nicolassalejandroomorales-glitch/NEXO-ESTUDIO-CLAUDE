/* Cola de pendientes: qué conceptos necesitan trabajo hoy. Una sola fuente para los cristales (repasos),
   las grietas (errores abiertos) y los bichos del juego (docs/juegos/SPEC.md). Solo lee; no escribe nada. */
(() => {
  'use strict';
  const DAY = 86400000;

  /* Un elemento por concepto, con sus razones, y un "peso" de 1 a 3: cuánto te cuesta ese concepto hoy.
     Más peso = más difícil para ti (errores abiertos, repaso atrasado, poca evidencia) y más XP en el juego. */
  function list(state, { now = new Date(), limit = 20 } = {}) {
    const academic = state?.academicIntelligence || {};
    const items = new Map();
    const get = id => {
      if (!items.has(id)) items.set(id, { conceptId: id, reasons: [], dueAt: null, overdueDays: 0, openErrors: 0, errorIds: [], misconceptionIds: [] });
      return items.get(id);
    };
    for (const review of academic.reviewSchedules || []) {
      if (review?.targetType !== 'concept' || !review.dueAt || new Date(review.dueAt) > now) continue;
      const item = get(review.targetId);
      item.reasons.push('review_due');
      item.dueAt = review.dueAt;
      item.overdueDays = Math.max(0, (now - new Date(review.dueAt)) / DAY);
    }
    for (const error of academic.structuredErrors || []) {
      if (!error?.conceptId || error.status === 'resolved') continue;
      const item = get(error.conceptId);
      if (!item.reasons.includes('open_error')) item.reasons.push('open_error');
      item.openErrors += 1;
      item.errorIds.push(error.id);
      const misconception = error.misconceptionId || error.candidateMisconceptionId;
      if (misconception && !item.misconceptionIds.includes(misconception)) item.misconceptionIds.push(misconception);
    }
    const out = [...items.values()].map(item => {
      const known = window.NexoKnowledge?.derive((academic.evidence || []).filter(e => e.conceptId === item.conceptId));
      const stage = known?.stage ?? 0;
      const score = item.openErrors * 2 + Math.min(item.overdueDays, 7) / 7 * 2 + (stage <= 1 ? 2 : stage === 2 ? 1 : 0);
      return { ...item, state: known?.state || 'unseen', score, weight: score >= 4 ? 3 : score >= 2 ? 2 : 1 };
    });
    out.sort((a, b) => b.score - a.score || String(a.dueAt).localeCompare(String(b.dueAt)) || a.conceptId.localeCompare(b.conceptId));
    return out.slice(0, limit);
  }

  window.NexoAcademicPending = { list };
})();
