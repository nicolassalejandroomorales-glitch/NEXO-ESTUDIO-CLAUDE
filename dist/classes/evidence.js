/* Motor de evidencia de las clases (docs/clase-viva/DISENO.md §4–5).
   Cada respuesta deja un registro: concepto, escalón, si fue con ayuda, la confianza y su porqué.
   Con esos registros se calcula la hoja del árbol de cada concepto y cuándo vuelve (FSRS, academic/reviews.js).
   No toca la pantalla: el reproductor (player.js) lo llama y lo dibuja. */
(() => {
  'use strict';
  const DAY_MS = 24 * 3600 * 1000;

  /* Escalones, siempre de fácil a difícil. */
  const STEPS = {
    1: 'Ver', 2: 'Reconocer', 3: 'Completar', 4: 'Producir (dibujar)', 5: 'Producir solo', 6: 'Mezclado y en el tiempo'
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
    if (!store.delivery || typeof store.delivery !== 'object') store.delivery = {};
    return store;
  }

  /* Producir solo: escalón 4 o más (dibujar, escribir, calcular), sin pista, sin reintento y sin acierto frágil.
     Para la hoja verde hacen falta SOLO_NEEDED ejercicios distintos: un acierto suelto puede ser suerte (docs/motor-verde/SPEC.md). */
  const SOLO_MIN_STEP = 4, SOLO_NEEDED = 2;
  const solo = r => r.correct && !r.hint && !r.retry && r.step >= SOLO_MIN_STEP && r.kind !== 'fragil';
  const hasGreen = recs => new Set(recs.filter(solo).map(r => r.itemId)).size >= SOLO_NEEDED;

  /* Guarda una respuesta. "delayed" marca un acierto sin ayuda 24 h o más después del primero: eso es retener. */
  function record(state, classId, entry) {
    const store = storeFor(state, classId);
    const at = new Date(entry.at || Date.now());
    const id = entry.id || `${classId}:${entry.itemId}:${entry.retry ? 'r' : 'a'}:${at.getTime()}`;
    const existing = store.records.find(r => r.id === id);
    if (existing) return existing;
    const kind = entry.retry ? null : confidenceKind(entry.confidence, entry.correct);
    const rec = {
      id,
      itemId: entry.itemId, conceptId: entry.conceptId, missionId: entry.missionId || null, misconception: entry.misconception || null,
      stage: entry.stage || null, step: Number(entry.step) || 2,
      correct: Boolean(entry.correct), hint: Boolean(entry.hint), retry: Boolean(entry.retry),
      transfer: Boolean(entry.transfer), confidence: entry.confidence ?? null, why: entry.why || null, kind,
      at: at.toISOString()
    };
    const firstSolo = store.records.find(r => r.conceptId === rec.conceptId && solo(r));
    rec.delayed = Boolean(firstSolo) && at - new Date(firstSolo.at) >= DAY_MS;
    if (entry.academicItem) rec.academicItem = entry.academicItem;
    store.records.push(rec);
    return rec;
  }

  // La evidencia se guarda antes de cargar el motor. La entrega puede repetirse sin repetir el intento.
  const deliveries = new WeakMap();
  function submit(api, cls, item, entry) {
    const academicItem = { id: item.id, type: item.type || 'choice', concept: entry.conceptId,
      source: item.source || null, slide: item.slide ?? null,
      ...(item.gen ? { gen: { id: item.gen.id, level: item.gen.level } } : {}) };
    const rec = record(api.getState(), cls.id, { ...entry, academicItem });
    api.saveState();
    api.flushState?.();
    reconcile(api, cls).catch(() => { /* La entrega pendiente se recupera al reabrir la clase. */ });
    return rec;
  }

  function reconcile(api, cls) {
    const state = api.getState();
    const boundApi = { ...api, getState: () => state,
      saveState: () => { if (api.getState() === state) api.saveState(); } };
    const run = async () => {
      const store = storeFor(state, cls.id);
      const records = store.records.filter(r => r.academicItem).slice().sort((a, b) => new Date(a.at) - new Date(b.at));
      for (const rec of records) {
        if (api.getState() !== state) return; // una importación cambió el estado durante la carga
        const status = store.delivery[rec.id] ||= {};
        if (status.review && status.academic) continue;
        if (!status.review) {
          try {
            const prior = store.reviews[rec.conceptId];
            status.review = rec.retry || new Date(prior?.updatedAt) > new Date(rec.at) || Boolean(await schedule(state, cls.id, rec, { now: new Date(rec.at) }));
          } catch (_) { /* El registro sobrevive a FSRS no disponible. */ }
        }
        if (!status.academic) {
          try {
            const attempt = await window.NexoAcademicBridge?.record(boundApi, cls, rec.academicItem, rec);
            status.academic = Boolean(attempt) && attempt.conceptIds.every(conceptId =>
              state.academicIntelligence?.reviewSchedules?.some(r => r.id === `concept:${conceptId}` &&
                (r.lastAttemptId === attempt.id || new Date(r.updatedAt) > new Date(attempt.attemptedAt))));
          }
          catch (_) { /* El puente conserva su idempotencia; se reintenta con el mismo id. */ }
        }
        if (api.getState() !== state) return;
        api.saveState();
        api.flushState?.();
      }
    };
    const pending = (deliveries.get(state) || Promise.resolve()).catch(() => {}).then(run);
    deliveries.set(state, pending);
    return pending.finally(() => { if (deliveries.get(state) === pending) deliveries.delete(state); });
  }

  /* La hoja de un concepto según toda su evidencia. */
  function leaf(store, conceptId, now = new Date()) {
    const recs = (store?.records || []).filter(r => r.conceptId === conceptId);
    let key = 'semilla';
    if (recs.length) key = 'brote';
    if (recs.some(r => r.correct && !r.retry && r.step >= 4)) key = 'clara';
    if (hasGreen(recs)) {
      key = 'verde';
      if (recs.some(r => solo(r) && r.transfer)) key = 'intensa';
      if (recs.some(r => solo(r) && r.delayed)) key = 'flor';
    }
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

  /* Auditor: ¿puede cada concepto llegar a hoja verde? Cuenta los ejercicios de escalón 4 o más.
     Una misión con prueba "Demuestra" (generadores) aporta ejercicios nuevos cada vez: cuenta como suficiente para el concepto de la misión. */
  function auditGreen(classes) {
    const out = [];
    for (const cls of Object.values(classes || {})) {
      const ids = {};
      (cls.concepts || []).forEach(c => { ids[c.id] = new Set(); });
      const walk = (o, mission, seen = new Set()) => {
        if (!o || typeof o !== 'object' || seen.has(o)) return;
        seen.add(o);
        if (typeof o.type === 'string' && DEFAULT_STEP[o.type] && o.id && stepOf(o) >= SOLO_MIN_STEP) (ids[conceptOf(o, mission)] ||= new Set()).add(o.id);
        for (const k in o) walk(o[k], mission, seen);
      };
      (cls.missions || []).forEach(m => {
        walk(m, m.id);
        if (cls.demuestra?.[m.id]) { const s = ids[m.id] ||= new Set(); for (let i = 0; i < SOLO_NEEDED; i++) s.add(`gen${i}`); }
      });
      for (const [concept, set] of Object.entries(ids)) if (set.size < SOLO_NEEDED) out.push({ classId: cls.id, subject: cls.subject, concept, exercises: set.size });
    }
    return out;
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

  window.NexoClassEvidence = { STEPS, LEAVES, WHY, stepOf, confidenceKind, storeFor, record, submit, reconcile, leaf, leaves, conceptOf, calibration, auditGreen, schedule, due };
})();
