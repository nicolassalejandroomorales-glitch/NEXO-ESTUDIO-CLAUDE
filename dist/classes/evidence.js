/* Motor de evidencia de las clases (docs/clase-viva/DISENO.md §4–5).
   Cada respuesta deja un registro: concepto, escalón, si fue con ayuda, la confianza y su porqué.
   Con esos registros se calcula la hoja del árbol de cada concepto y cuándo vuelve (FSRS, academic/reviews.js).
   No toca la pantalla: el reproductor (player.js) lo llama y lo dibuja. */
(() => {
  'use strict';
  const DAY_MS = 24 * 3600 * 1000;

  /* Escalones, siempre de fácil a difícil. */
  const STEPS = {
    1: 'Ver', 2: 'Reconocer', 3: 'Completar', 4: 'Producir con ayuda', 5: 'Producir solo', 6: 'Mezclado y en el tiempo'
  };
  // Escalón por defecto según la actividad: elegir es reconocer; ordenar, clasificar, unir y tocar es completar;
  // dibujar una molécula o flechas a partir de una base es producir con ayuda; escribir la respuesta es producir. Una actividad puede declarar su propio "step".
  const DEFAULT_STEP = { choice: 2, poe: 2, order: 3, classify: 3, match: 3, pick: 3, recipe: 3, spot: 3, build: 4, arrows: 4, write: 5, number: 5 }; // number: calcular un valor sin alternativas = producir solo
  const stepOf = item => Number(item?.step) || DEFAULT_STEP[item?.type || 'choice'] || 2;

  /* Hojas del árbol (de menos a más). "amarilla" y "seca" se superponen a la hoja que corresponda. */
  const LEAVES = {
    semilla: { label: 'Sin ver', rank: 0 },
    brote: { label: 'Brote · guiado', rank: 1 },
    clara: { label: 'Hoja clara · con ayuda', rank: 2 },
    verde: { label: 'Hoja verde · por tu cuenta', rank: 3 },
    intensa: { label: 'Verde intenso · en un caso nuevo', rank: 4 },
    flor: { label: 'Flor · lo recuerdas días después', rank: 5 },
    amarilla: { label: 'Hoja amarilla · acierto frágil', rank: -1 },
    seca: { label: 'Hoja seca · se está olvidando', rank: -1 }
  };
  // Equivalencia con los estados del motor académico (academic/knowledge.js).
  const KNOWLEDGE = { semilla: 'unseen', brote: 'guided', clara: 'guided', verde: 'independent', intensa: 'transferable', flor: 'retained' };

  /* Confianza × resultado (tabla del diseño). Muy seguro: 80 % o más. Poco seguro: 60 % o menos. */
  function confidenceKind(confidence, correct) {
    if (confidence === null || confidence === undefined || confidence === '') return null;
    const c = Number(confidence);
    if (c >= 80) return correct ? 'solido' : 'alerta';
    if (c <= 60) return correct ? 'fragil' : 'consciente';
    return 'medio';
  }
  const WHY = {
    regla: 'No recuerdo la regla', dos: 'Dudo entre dos', pregunta: 'No entendí la pregunta', adivino: 'Estoy adivinando'
  };

  function storeFor(state, classId) {
    if (!state.classEvidence || typeof state.classEvidence !== 'object') state.classEvidence = {};
    const store = state.classEvidence[classId] ||= {};
    if (!Array.isArray(store.records)) store.records = [];
    if (!store.reviews || typeof store.reviews !== 'object') store.reviews = {};
    return store;
  }

  const independent = r => r.correct && !r.hint && !r.retry && r.step >= 5 && r.kind !== 'fragil';

  /* Guarda una respuesta. "delayed" marca un acierto sin ayuda 24 h o más después del primero: eso es retener. */
  function record(state, classId, entry) {
    const store = storeFor(state, classId);
    const at = new Date(entry.at || Date.now());
    const kind = entry.retry ? null : confidenceKind(entry.confidence, entry.correct);
    const rec = {
      id: `${entry.itemId}:${entry.retry ? 'r' : 'a'}:${at.getTime()}`,
      itemId: entry.itemId, conceptId: entry.conceptId, missionId: entry.missionId || null, misconception: entry.misconception || null,
      stage: entry.stage || null, step: Number(entry.step) || 2,
      correct: Boolean(entry.correct), hint: Boolean(entry.hint), retry: Boolean(entry.retry),
      transfer: Boolean(entry.transfer), confidence: entry.confidence ?? null, why: entry.why || null, kind,
      at: at.toISOString()
    };
    const firstSolo = store.records.find(r => r.conceptId === rec.conceptId && independent(r));
    rec.delayed = Boolean(firstSolo) && at - new Date(firstSolo.at) >= DAY_MS;
    store.records.push(rec);
    return rec;
  }

  /* La hoja de un concepto según toda su evidencia. */
  function leaf(store, conceptId, now = new Date()) {
    const recs = (store?.records || []).filter(r => r.conceptId === conceptId);
    let key = 'semilla';
    if (recs.length) key = 'brote';
    if (recs.some(r => r.correct && !r.retry && r.step >= 4)) key = 'clara';
    if (recs.some(independent)) key = 'verde';
    if (recs.some(r => independent(r) && r.transfer)) key = 'intensa';
    if (recs.some(r => independent(r) && r.delayed)) key = 'flor';
    let overlay = null;
    const due = store?.reviews?.[conceptId]?.dueAt;
    if (LEAVES[key].rank >= 3 && due && new Date(due) <= now) overlay = 'seca';
    else {
      const lastRight = [...recs].reverse().find(r => r.correct && !r.retry);
      if (lastRight?.kind === 'fragil') overlay = 'amarilla';
    }
    const shown = overlay || key;
    return { key, overlay, shown, label: LEAVES[shown].label, knowledge: KNOWLEDGE[key], count: recs.length };
  }

  /* Concepto de una actividad: el suyo, o el de su misión si no declara uno. */
  const conceptOf = (item, missionId) => item?.concept || `${missionId}`;

  function leaves(cls, store, now = new Date()) {
    return Object.fromEntries((cls.concepts || []).map(c => [c.id, leaf(store, c.id, now)]));
  }

  /* Calibración: cuando dices X % de seguridad, ¿cuánto aciertas? */
  function calibration(records) {
    const bands = [['0–40', 0, 40], ['50–70', 41, 79], ['80–100', 80, 100]];
    return bands.map(([label, lo, hi]) => {
      const inBand = (records || []).filter(r => !r.retry && r.confidence !== null && r.confidence >= lo && r.confidence <= hi);
      return { label, n: inBand.length, right: inBand.filter(r => r.correct).length };
    });
  }

  /* Cuándo vuelve el concepto (FSRS). Un acierto frágil o con pista cuenta como "difícil": vuelve antes. */
  async function schedule(state, classId, rec, { now = new Date() } = {}) {
    if (!window.NexoAcademicReviews?.schedule || rec.retry) return null;
    const store = storeFor(state, classId);
    const attempt = { id: rec.id, outcome: rec.correct ? 'correct' : 'incorrect', assistanceUsed: rec.hint || rec.kind === 'fragil' || rec.step < 4 };
    const next = await window.NexoAcademicReviews.schedule(store.reviews[rec.conceptId], rec.conceptId, 'concept', attempt, { now });
    store.reviews[rec.conceptId] = next;
    return next;
  }
  const due = (store, now = new Date()) => Object.values(store?.reviews || {})
    .filter(r => r?.dueAt && new Date(r.dueAt) <= now).map(r => r.targetId);

  window.NexoClassEvidence = { STEPS, LEAVES, WHY, stepOf, confidenceKind, storeFor, record, leaf, leaves, conceptOf, calibration, schedule, due };
})();
