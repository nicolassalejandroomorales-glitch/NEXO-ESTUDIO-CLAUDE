/* Puente clase → motor académico: cada respuesta de una clase también queda como evidencia por concepto.
   El catálogo sale de la propia clase (conceptos y "needs" = prerrequisitos, fuentes, diapositiva de cada
   ejercicio, errores típicos): nada se inventa ni se copia a mano. Se registra al reproducir, no al arrancar. */
(() => {
  'use strict';
  // Conceptos de la clase que ya existen en el piloto con el mismo significado: comparten evidencia.
  const ALIAS = {
    'org-01': { 'am.par-libre': 'org.lone-pair', 'am.pka': 'org.pka', 'am.resonancia': 'org.resonance',
      'am.heterociclos': 'org.aromatic-pair', 'am.hofmann': 'org.hofmann' },
    'org-04': { 'ar.heterociclos': 'org.aromatic-pair' }
  };
  const RESPONSE = { choice: 'multiple_choice', poe: 'multiple_choice', pick: 'multiple_choice', spot: 'multiple_choice', write: 'short_text',
    number: 'numeric', arrows: 'chemical_structure', build: 'chemical_structure', order: 'ordering', classify: 'matching', match: 'matching', recipe: 'ordering' };
  /* Familia = habilidad dentro del concepto (docs/motor-rangos/SPEC.md): reconocer, organizar, calcular, dibujar o justificar.
     Los rangos altos piden aciertos en varias familias: dominar el concepto de varias formas, no solo eligiendo. */
  const SKILL = { choice: 'identify', pick: 'identify', spot: 'identify', poe: 'identify', order: 'compare', classify: 'compare', match: 'compare',
    recipe: 'compare', number: 'calculate', build: 'draw', arrows: 'draw', write: 'justify' };
  const ready = new Set();
  // Cada clase tiene sus propios conceptos ("base.gases" de Fisiología no es el de Fisicoquímica); solo los alias se comparten.
  const conceptOf = (cls, id) => ALIAS[cls.id]?.[id] || `${cls.id}:${id}`;
  const sourceKey = (cls, id, slide) => `${cls.id}.${id}${slide ? `.s${slide}` : ''}`;

  function sourcesOf(cls, id, slide) {
    const src = cls.sources?.[id];
    if (!src) return [];
    const base = { id: sourceKey(cls, id), type: 'ppt', title: src.title, location: { topic: src.detail || cls.title }, url: null,
      private: true, authority: /oficial/i.test(src.authority || '') ? 'course_official' : 'supplementary', version: 1 };
    return slide && Number.isFinite(Number(slide))
      ? [base, { ...base, id: sourceKey(cls, id, slide), location: { page: Number(slide), topic: src.detail || cls.title } }] : [base];
  }

  /* Conceptos, prerrequisitos y errores típicos de la clase (una vez). */
  function ensureClass(model, cls) {
    if (ready.has(cls.id)) return;
    const lesson = cls.id, skip = new Set(Object.keys(ALIAS[cls.id] || {}));
    const missionOf = id => cls.missions?.find(m => m.id === cls.concepts.find(c => c.id === id)?.mission);
    const patch = {
      concepts: cls.concepts.filter(c => !skip.has(c.id)).map(c => ({ id: conceptOf(cls, c.id), courseId: cls.subject || model.course.id, lessonIds: [lesson], version: 1,
        title: c.title, description: missionOf(c.id) ? `Misión «${missionOf(c.id).title}» de ${cls.title}` : `Base previa de ${cls.title}`,
        tags: [cls.id, c.root ? 'base' : 'clase'], active: true })),
      prerequisites: cls.concepts.flatMap(c => (c.needs || []).map(n => ({ from: conceptOf(cls, n), to: conceptOf(cls, c.id), strength: 'required' })))
        .filter(e => e.from !== e.to),
      misconceptions: Object.entries(cls.misconceptions || {}).map(([key, m]) => ({ id: `${cls.id}.${key}`, legacyCode: key, feedback: m.why,
        version: 1, classification: 'requires_explicit_evidence' }))
    };
    model.extend(patch);
    ready.add(cls.id);
  }

  /* La variante conserva su semilla; la familia agrupa la habilidad. reference solo reconstruye IDs históricos. */
  function ensureItem(model, cls, item, concept, transfer, reference = null) {
    const id = reference?.exerciseId || `${cls.id}:${item.id}${transfer ? '#t' : ''}`;
    if (model.byId(model.exercises, id)) return id;
    const conceptId = reference?.conceptIds?.[0] || conceptOf(cls, concept);
    if (!model.byId(model.concepts, conceptId)) {
      const mission = cls.missions?.find(m => m.id === concept);
      model.extend({ concepts: [{ id: conceptId, courseId: cls.subject || model.course.id, lessonIds: [cls.id], version: 1, title: mission?.title || conceptId,
        description: `Misión «${mission?.title || concept}» de ${cls.title}`, tags: [cls.id, 'clase'], active: true }] });
    }
    const sources = sourcesOf(cls, item.source, item.slide);
    const type = item.type || 'choice', selfGraded = type === 'write', skill = SKILL[type] || 'identify';
    const familyId = reference?.familyId || `class.${cls.id}.${conceptId}.${skill}`;
    model.extend({
      sources,
      families: [{ id: familyId, conceptIds: [conceptId], skillIds: [skill], difficulty: 2, generatorType: 'curated', version: 1,
        validator: 'class_item', misconceptionIds: [], active: true, transferLevel: 'standard', examStyle: false }],
      conceptSources: sources.map(s => ({ conceptId, sourceId: s.id })),
      exercises: [{ id, lessonId: cls.id, familyId, conceptIds: [conceptId], skillIds: [skill],
        difficulty: Number(item.gen?.level) || 2, expectedResponseType: RESPONSE[type] || 'structured_fields',
        validator: reference?.validator || (selfGraded ? 'self_rubric' : 'class_item'), version: reference?.contentVersion || 1, active: true, misconceptionIds: [],
        examStyle: Boolean(transfer), transfer: Boolean(transfer), sourceIds: sources.map(s => s.id) }]
    });
    return id;
  }

  /* ev = registro de NexoClassEvidence.record. Reintentar tras ver la corrección cuenta como ayuda. */
  async function record(api, cls, item, ev, { activityType = 'class' } = {}) {
    await window.NexoAcademicLoad?.();
    const engine = window.NexoAcademicEngine;
    if (!engine || !cls?.concepts) return null;
    ensureClass(engine.model, cls);
    const exerciseId = ensureItem(engine.model, cls, item, ev.conceptId, ev.transfer);
    return engine.recordAttempt(api, {
      id: ev.id, exerciseId, outcome: ev.correct ? 'correct' : 'incorrect', assistanceUsed: ev.hint || ev.retry,
      confidence: ev.confidence ?? null, at: ev.at, review: ev.delayed, attemptNumber: ev.retry ? 2 : 1,
      reasoningSupported: item.type === 'write' && ev.correct, // escribir el porqué cumple "justificó" (rango 3), aunque no es verificada
      misconceptionId: !ev.correct && ev.misconception && engine.model.byId(engine.model.misconceptions, `${cls.id}.${ev.misconception}`)
        ? `${cls.id}.${ev.misconception}` : null,
      activityType, activityId: cls.id
    });
  }

  /* Al recargar, el catálogo solo trae el piloto. El perfil carga las clases con evidencia guardada (prefijo "<clase>:"
     del ejercicio) y llama a esto para calcular los rangos con sus conceptos y prerrequisitos. */
  function ensureFromEvidence(state) {
    const engine = window.NexoAcademicEngine;
    if (!engine) return;
    const attempts = state?.academicIntelligence?.attempts || [], issues = [];
    const ids = new Set([...Object.keys(state?.classEvidence || {}), ...attempts.map(a => String(a.exerciseId || '').split(':')[0]),
      ...(state?.academicIntelligence?.evidence || []).map(e => String(e.exerciseId || '').split(':')[0])]);
    for (const id of ids) {
      const cls = window.NexoClasses?.[id];
      if (!cls?.concepts) continue;
      ensureClass(engine.model, cls);
      const records = state?.classEvidence?.[id]?.records || [];
      const byAttempt = new Map(records.map(rec => [rec.id, rec]));
      for (const rec of records) if (rec.academicItem)
        ensureItem(engine.model, cls, rec.academicItem, rec.conceptId, rec.transfer);
      for (const attempt of attempts.filter(a => a.exerciseId?.startsWith(`${id}:`))) {
        const rec = byAttempt.get(attempt.id);
        if (rec?.conceptId && conceptOf(cls, rec.conceptId) !== attempt.conceptIds[0]) {
          issues.push({ attemptId: attempt.id, reason: 'historical_concept_mismatch' });
          continue;
        }
        if (engine.model.byId(engine.model.exercises, attempt.exerciseId)) continue;
        const localId = attempt.exerciseId.slice(id.length + 1).replace(/#t$/, '');
        const item = rec?.academicItem || window.NexoClassroom?.findItem(cls, rec?.itemId || localId);
        const concept = rec?.conceptId || item?.concept;
        if (!item || !concept) { issues.push({ attemptId: attempt.id, reason: 'missing_item_metadata' }); continue; }
        if (conceptOf(cls, concept) !== attempt.conceptIds[0]) {
          issues.push({ attemptId: attempt.id, reason: 'historical_concept_mismatch' });
          continue; // no inventar procedencia para una atribución antigua inconsistente
        }
        ensureItem(engine.model, cls, item, concept, attempt.transfer, attempt);
      }
    }
    return issues;
  }

  /* Proyección conservadora: nunca reescribe intentos/evidencias de versiones anteriores. */
  function evidenceFor(state) {
    const records = new Map(Object.entries(state?.classEvidence || {})
      .flatMap(([classId, store]) => (store.records || []).map(rec => [rec.id, { classId, rec }])));
    return (state?.academicIntelligence?.evidence || []).map(evidence => {
      if (evidence.source !== 'class_item') return evidence;
      const saved = records.get(evidence.attemptId), classId = saved?.classId || String(evidence.exerciseId || '').split(':')[0];
      const cls = window.NexoClasses?.[classId], rec = saved?.rec;
      if (rec?.conceptId && conceptOf({ id: classId }, rec.conceptId) !== evidence.conceptId)
        return { ...evidence, validationStatus: 'unverified', provenanceIssue: 'historical_concept_mismatch' };
      const localId = String(evidence.exerciseId || '').slice(classId.length + 1).replace(/#t$/, '');
      const item = rec?.academicItem || (cls && window.NexoClassroom?.findItem(cls, rec?.itemId || localId));
      if (item?.type === 'write') return { ...evidence, validationStatus: 'self_reported', source: 'self_rubric' };
      if (!item && /^gen:[^:]+:[1-5]$/.test(localId))
        return { ...evidence, validationStatus: 'unverified', provenanceIssue: 'missing_item_metadata' };
      return evidence;
    });
  }

  window.NexoAcademicBridge = { record, ensureClass, ensureItem, ensureFromEvidence, evidenceFor, conceptOf, aliases: ALIAS };
})();
