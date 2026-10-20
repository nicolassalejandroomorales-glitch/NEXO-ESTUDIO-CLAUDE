// Puente clase → motor académico: catálogo desde la clase, alias, evidencia honesta y grafo sin ciclos.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const window = { NexoClasses: {}, NexoAcademicReviews: { schedule: async (prior, id, type, attempt, { now }) => ({ id: `${type}:${id}`, targetId: id, targetType: type, dueAt: now.toISOString(), lastAttemptId: attempt.id }) } };
const context = { window, Date, console };
const classFiles = fs.readdirSync('dist/classes').filter(f => /^(ana|fis|fq|org)-\d+\.js$/.test(f)).map(f => `classes/${f.slice(0, -3)}`);
for (const file of ['academic/model', 'academic/graph', 'academic/knowledge', 'academic/diagnosis', 'academic/engine', ...classFiles, 'academic/class-bridge'])
  vm.runInNewContext(fs.readFileSync(`dist/${file}.js`, 'utf8'), context, { filename: file });
const cls = window.NexoClasses['org-01'], engine = window.NexoAcademicEngine, model = engine.model, bridge = window.NexoAcademicBridge;
const state = { academicIntelligence: { attempts: [], evidence: [], reviewSchedules: [], structuredErrors: [], userSources: [], activeTimeSegments: [] } };
const api = { getState: () => state, saveState() {} };
const item = (id, type) => ({ id, type, source: 'catedra-aminas', slide: 18, concept: 'am.pka' });
const rec = (extra = {}) => ({ id: `x:${Math.random()}`, conceptId: 'am.pka', correct: true, hint: false, retry: false, transfer: false, confidence: 80, at: new Date().toISOString(), ...extra });

(async () => {
  // 1) Un acierto crea el catálogo de la clase y comparte concepto con el piloto (am.pka = org.pka).
  await bridge.record(api, cls, item('m4-p1'), rec());
  assert.equal(model.validate(), true);
  assert.ok(model.byId(model.concepts, 'org-01:am.sales'), 'conceptos propios de la clase');
  assert.equal(model.byId(model.concepts, 'org-01:am.pka'), null, 'am.pka se fusiona con org.pka');
  assert.equal(state.academicIntelligence.evidence[0].conceptId, 'org.pka');
  assert.equal(state.academicIntelligence.evidence[0].source, 'class_item');
  assert.equal(state.academicIntelligence.evidence[0].validationStatus, 'verified');
  // 2) Prerrequisitos de la clase llegan al grafo (am.equilibrio necesita lo previo) y no hay ciclos.
  assert.ok(engine.graph.direct('org-01:am.equilibrio').length > 0);
  // 3) Fuente exacta: la diapositiva del ejercicio.
  const ex = model.byId(model.exercises, 'org-01:m4-p1');
  assert.ok(ex.sourceIds.includes('org-01.catedra-aminas.s18'));
  assert.equal(model.byId(model.sources, 'org-01.catedra-aminas.s18').location.page, 18);
  // 4) Reintentar tras ver la corrección cuenta como ayuda; respuesta escrita queda autoevaluada.
  await bridge.record(api, cls, item('m4-p2'), rec({ retry: true }));
  assert.equal(state.academicIntelligence.attempts[0].assistanceUsed, true);
  await bridge.record(api, cls, item('m4-w1', 'write'), rec());
  assert.equal(state.academicIntelligence.attempts[0].validationStatus, 'self_reported');
  // 5) Error con distractor etiquetado queda como equivocación confirmada; idempotente por id.
  const key = Object.keys(cls.misconceptions)[0];
  const wrong = rec({ id: 'dup', correct: false, misconception: key });
  await bridge.record(api, cls, item('m4-p3'), wrong);
  await bridge.record(api, cls, item('m4-p3'), wrong);
  assert.equal(state.academicIntelligence.attempts.filter(a => a.id === 'dup').length, 1);
  assert.equal(state.academicIntelligence.structuredErrors[0].misconceptionId, `org-01.${key}`);
  // 6) Variantes reproducibles distintas comparten familia, no la identidad del ejercicio.
  const gen = { id: 'gen:pka:2:abc', type: 'choice', source: 'catedra-aminas', concept: 'am.pka', gen: { id: 'pka', level: 2 } };
  await bridge.record(api, cls, gen, rec());
  await bridge.record(api, cls, { ...gen, id: 'gen:pka:2:zzz' }, rec());
  const variants = model.exercises.filter(e => ['org-01:gen:pka:2:abc', 'org-01:gen:pka:2:zzz'].includes(e.id));
  assert.equal(variants.length, 2);
  assert.equal(variants[0].familyId, variants[1].familyId);
  await bridge.record(api, cls, item('m4-p1'), rec({ transfer: true }));
  assert.ok(model.byId(model.exercises, 'org-01:m4-p1#t').transfer);
  // 6b) Familias por habilidad (docs/motor-rangos/SPEC.md): elegir y calcular son familias distintas del mismo concepto;
  //     una escrita correcta marca "justificó" sin ser verificada.
  await bridge.record(api, cls, item('m4-n1', 'number'), rec());
  const fams = new Set(state.academicIntelligence.evidence.filter(e => e.conceptId === 'org.pka' && e.source === 'class_item').map(e => e.familyId));
  assert.ok(fams.has('class.org-01.org.pka.identify') && fams.has('class.org-01.org.pka.calculate'), [...fams].join(','));
  await bridge.record(api, cls, item('m4-w2', 'write'), rec());
  assert.equal(state.academicIntelligence.evidence[0].reasoningSupported, true);
  assert.equal(state.academicIntelligence.evidence[0].source, 'self_rubric');
  // 6c) Al recargar, ensureFromEvidence vuelve a armar el catálogo de las clases con evidencia.
  bridge.ensureFromEvidence({ academicIntelligence: { evidence: [{ exerciseId: 'fq-01:x' }] } });
  assert.ok(model.byId(model.concepts, bridge.conceptOf(window.NexoClasses['fq-01'], window.NexoClasses['fq-01'].concepts[0].id)));
  // 7) Todas las clases: catálogo válido, sin ciclos, sin choques entre ramos y cada ejercicio con su diapositiva.
  const all = Object.values(window.NexoClasses).filter(c => c.concepts);
  assert.ok(all.length >= 10, 'se cargaron las clases');
  for (const c of all) {
    bridge.ensureClass(model, c);
    const first = c.missions[0], concept = c.concepts.find(k => k.mission === first.id).id;
    await bridge.record(api, c, { id: 'x1', type: 'choice', source: Object.keys(c.sources)[0], slide: 3, concept }, rec({ conceptId: concept }));
    assert.ok(model.byId(model.exercises, `${c.id}:x1`), c.id);
    for (const k of c.concepts) {
      const id = bridge.conceptOf(c, k.id);
      assert.ok(model.byId(model.concepts, id), `${c.id} ${k.id}`);
    }
  }
  assert.equal(model.validate(), true);
  assert.notEqual(bridge.conceptOf(window.NexoClasses['fis-06'], 'base.gases'), bridge.conceptOf(window.NexoClasses['fq-01'], 'base.gases'));
  assert.equal(bridge.conceptOf(window.NexoClasses['org-04'], 'ar.heterociclos'), 'org.aromatic-pair');
  engine.graph.ancestors('fq-01:eq.actividad');
  console.log('OK: las clases escriben en el motor académico con su catálogo, fuentes y prerrequisitos.');
})().catch(error => { console.error(error); process.exit(1); });
