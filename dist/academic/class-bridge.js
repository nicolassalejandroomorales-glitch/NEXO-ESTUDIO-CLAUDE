/* Puente clase → motor académico: cada respuesta de una clase también queda como evidencia por concepto.
   El catálogo sale de la propia clase (conceptos y "needs" = prerrequisitos, fuentes, diapositiva de cada
   ejercicio, errores típicos): nada se inventa ni se copia a mano. Se registra al reproducir, no al arrancar. */
(() => {
  'use strict';
  // Conceptos de la clase que ya existen en el piloto con el mismo significado: comparten evidencia.
  const ALIAS = {
    'org-01': { 'am.par-libre': 'org.lone-pair', 'am.pka': 'org.pka', 'am.resonancia': 'org.resonance',
      'am.heterociclos': 'org.aromatic-pair', 'am.hofmann': 'org.hofmann' }
  };
  const RESPONSE = { choice: 'multiple_choice', poe: 'multiple_choice', pick: 'multiple_choice', spot: 'multiple_choice', write: 'short_text',
    number: 'numeric', arrows: 'chemical_structure', build: 'chemical_structure', order: 'ordering', classify: 'matching', match: 'matching', recipe: 'ordering' };
  const SKILL = { arrows: 'draw', build: 'draw', write: 'justify', number: 'calculate', poe: 'predict' };
  const ready = new Set();
  const conceptOf = (cls, id) => ALIAS[cls.id]?.[id] || id;
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
      concepts: cls.concepts.filter(c => !skip.has(c.id)).map(c => ({ id: c.id, courseId: model.course.id, lessonIds: [lesson], version: 1,
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

  /* Un ejercicio de la clase como ejercicio del motor. Los generados comparten uno por generador y nivel. */
  function ensureItem(model, cls, item, concept, transfer) {
    const key = item.gen ? `gen:${item.gen.id}:${item.gen.level}` : item.id;
    const id = `${cls.id}:${key}${transfer ? '#t' : ''}`;
    if (model.byId(model.exercises, id)) return id;
    const conceptId = conceptOf(cls, concept);
    if (!model.byId(model.concepts, conceptId)) {
      const mission = cls.missions?.find(m => m.id === concept);
      model.extend({ concepts: [{ id: conceptId, courseId: model.course.id, lessonIds: [cls.id], version: 1, title: mission?.title || conceptId,
        description: `Misión «${mission?.title || concept}» de ${cls.title}`, tags: [cls.id, 'clase'], active: true }] });
    }
    const sources = sourcesOf(cls, item.source, item.slide);
    const familyId = `class.${cls.id}.${conceptId}`;
    const type = item.type || 'choice', selfGraded = type === 'write';
    model.extend({
      sources,
      families: [{ id: familyId, conceptIds: [conceptId], skillIds: ['identify'], difficulty: 2, generatorType: 'curated', version: 1,
        validator: 'class_item', misconceptionIds: [], active: true, transferLevel: 'standard', examStyle: false }],
      conceptSources: sources.map(s => ({ conceptId, sourceId: s.id })),
      exercises: [{ id, lessonId: cls.id, familyId, conceptIds: [conceptId], skillIds: [SKILL[type] || 'identify'],
        difficulty: Number(item.gen?.level) || 2, expectedResponseType: RESPONSE[type] || 'structured_fields',
        validator: selfGraded ? 'self_rubric' : 'class_item', version: 1, active: true, misconceptionIds: [],
        examStyle: Boolean(transfer), transfer: Boolean(transfer), sourceIds: sources.map(s => s.id) }]
    });
    return id;
  }

  /* ev = registro de NexoClassEvidence.record. Reintentar tras ver la corrección cuenta como ayuda. */
  async function record(api, cls, item, ev) {
    await window.NexoAcademicLoad?.();
    const engine = window.NexoAcademicEngine;
    if (!engine || !cls?.concepts) return null;
    ensureClass(engine.model, cls);
    const exerciseId = ensureItem(engine.model, cls, item, ev.conceptId, ev.transfer);
    return engine.recordAttempt(api, {
      id: ev.id, exerciseId, outcome: ev.correct ? 'correct' : 'incorrect', assistanceUsed: ev.hint || ev.retry,
      confidence: ev.confidence ?? null, at: ev.at, review: ev.delayed, attemptNumber: ev.retry ? 2 : 1,
      misconceptionId: !ev.correct && ev.misconception && engine.model.byId(engine.model.misconceptions, `${cls.id}.${ev.misconception}`)
        ? `${cls.id}.${ev.misconception}` : null,
      activityType: 'class', activityId: cls.id
    });
  }

  window.NexoAcademicBridge = { record, ensureClass, ensureItem, conceptOf };
})();
