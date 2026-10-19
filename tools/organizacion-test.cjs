// Organización · Fase 1 (docs/update-02-organizacion/SPEC.md): plan de hoy, relojes de arena, semana crítica y avisos.
// Sin navegador: módulos puros con los datos reales de dist/semester-2026.js.
const assert = require('assert'); const fs = require('fs'); const path = require('path');
global.window = globalThis;
const dist = p => path.join(__dirname, '../dist', p);
require(dist('planner/priority.js'));
const T = require(dist('planner/today-plan.js'));
const S = eval(fs.readFileSync(dist('semester-2026.js'), 'utf8') + ';NEXO_SEMESTER');
const events = S.events.map(e => ({ ...e, status: 'planned', priority: 3 }));
const today = '2026-10-14';
const ranked = NexoPriority.rank(events, { today });

// Semana crítica: 19–27 oct = 3 evaluaciones (eran 4: la PEP 1 de FQ II se movió del 21 al 28).
const crit = T.critical(events, today);
assert.strictEqual(crit.label, '19–27 oct: 3 evaluaciones');
assert.ok(crit.active, 'empieza en 5 días: se muestra');
assert.strictEqual(T.critical(events, '2026-12-30'), null, 'sin semana crítica al final');

// Urgencia del tablón.
assert.deepStrictEqual([20, 10, 5, 2, 0, -1].map(T.urgency), ['calma', 'ambar', 'brillo', 'sello', 'hoy', 'despues']);

// Relojes de arena: solo evaluaciones en 21 días, ordenadas, arena 0..5.
const hg = T.hourglasses(events, today);
assert.ok(hg.every(h => h.days >= 0 && h.days <= 21 && h.level >= 0 && h.level <= 5));
assert.strictEqual(hg[0].event.id, 'official-org-c1'); assert.strictEqual(hg[0].level, 5);
assert.ok(hg.every((h, i) => !i || hg[i - 1].days <= h.days));

// Plan de hoy: día de prueba → repaso flash de 10 min primero; máx. 3 bloques; no pasa el tiempo del día.
const plan = T.plan({ ranked, today, minutes: 120, critical: crit });
assert.ok(plan.length >= 1 && plan.length <= 3);
assert.ok(plan[0].flash && plan[0].minutes === 10 && plan[0].event.id === 'official-org-c1');
assert.ok(plan.reduce((s, b) => s + b.minutes, 0) <= 120);
assert.ok(plan.every(b => b.text && b.why && b.reason && b.minutes >= 10), 'cada bloque: qué, cuánto y por qué');
assert.ok(!plan.some(b => b.event.id === 'official-fq-pep1'), 'la PEP 1 FQ (14 días, movida al 28) no desplaza lo de esta semana');
// Tiempo chico → menos bloques; 0 minutos no rompe.
assert.ok(T.plan({ ranked, today, minutes: 30, critical: crit }).length <= 2);
// "Hoy no" (saltar) saca la evaluación del plan, sin culpa.
const skipped = T.plan({ ranked, today, minutes: 120, marks: { skip: ['official-fq-pep1'] } });
assert.ok(!skipped.some(b => b.event.id === 'official-fq-pep1'));
// Listo a mano y tachado automático con el cronómetro (minutos del ramo hoy).
const id = plan[1].id;
assert.ok(T.plan({ ranked, today, minutes: 120, marks: { done: [id] } })[1].done);
const auto = T.plan({ ranked, today, minutes: 120, sessions: [{ date: today, subject: 'organica', seconds: 10 * 60 }] });
assert.ok(auto[0].done && auto[0].auto, '10 min de Orgánica tachan el repaso flash');
// Nunca declara dominio: el texto habla de tiempo y acciones, no de "dominas".
assert.ok(plan.every(b => !/domin/i.test(b.text + b.why)));

// Calendario → plan: bloque movido a otro día (pin), receso (plan liviano) y dificultad.
const r20 = NexoPriority.rank(events, { today: '2026-10-20' });
const pin = T.plan({ ranked: r20, today: '2026-10-20', minutes: 120, pins: ['official-ana-c2'] });
assert.ok(pin[0].event.id === 'official-ana-c2' && /lo moviste a hoy/.test(pin[0].reason), 'el bloque anclado va primero con su razón');
const rec = T.plan({ ranked: r20, today: '2026-10-20', minutes: 120, recess: true });
assert.strictEqual(rec.length, 1); assert.strictEqual(rec[0].minutes, 20); assert.ok(/receso/.test(rec[0].reason) && /liviano/i.test(rec[0].text));
const hard = events.map(e => e.id === 'official-org-pep1' ? { ...e, difficulty: 5 } : e);
const dh = T.plan({ ranked: NexoPriority.rank(hard, { today: '2026-10-20' }), today: '2026-10-20', minutes: 120, weak: { organica: 4 } });
assert.ok(dh.some(b => /dificultad 5\/5/.test(b.reason)), 'la dificultad entra al plan con su razón');
// Escena: objetos dentro del arte y con su vista.
const meta = JSON.parse(fs.readFileSync(dist('assets/torre/estudio/estudio.json'), 'utf8'));
const views = ['hoy', 'calendario', 'pruebas', 'notas', 'lab', 'avisos'];
assert.deepStrictEqual(views.filter(v => !meta.objects.some(o => o.view === v)), [], 'cada parte tiene su objeto');
meta.objects.forEach(o => {
  assert.ok(o.rect[0] >= 0 && o.rect[2] <= meta.w && o.rect[1] >= 0 && o.rect[3] <= meta.h, o.id + ' dentro del arte');
  assert.ok(o.stand[1] >= meta.walk[0] && o.stand[1] <= meta.walk[1], o.id + ' se para en el piso');
});
for (const tod of ['dia', 'tarde', 'noche']) for (const n of ['vista', 'fondo', 'frente', 'campana'])
  assert.ok(fs.existsSync(dist(`assets/torre/estudio/${tod}-${n}.png`)), `${tod}-${n}.png`);

// Avisos: la primera vez solo toma la foto; un cambio de fecha después sí avisa.
require(dist('planner/grades.js')); require(dist('planner/grade-rules.js'));
require(dist('planner/avisos.js'));
const state = { events: events.map(e => ({ ...e })), settings: { dailyGoalMinutes: 120 }, sessions: [], absences: [], organization: {} };
const bridge = { state, today: () => today, save() {}, subjects: [{ id: 'analitica', short: 'ANA', color: '#fff' }], subjectFor: id => ({ id, short: id.slice(0, 3).toUpperCase(), color: '#fff' }), ranked: () => ranked };
window.NexoOrgAvisos.snapshot(bridge);
assert.strictEqual(window.NexoOrgAvisos.list(bridge).filter(a => a.nuevo).length, 0, 'primera vez: la campana no suena por todo');
state.events.find(e => e.id === 'official-fq-c1').date = '2026-10-28';
const nuevos = window.NexoOrgAvisos.list(bridge).filter(a => a.nuevo);
assert.ok(nuevos.some(a => a.nivel === 'cambio' && /26 oct → 28 oct/.test(a.texto)), 'cambio de fecha avisa');
window.NexoOrgAvisos.markSeen(bridge);
assert.strictEqual(window.NexoOrgAvisos.list(bridge).filter(a => a.nuevo).length, 0);
// Inasistencias: con máximo 2 y 1 falta, la campana avisa "te queda 1 falta".
state.organization.absenceMax = { analitica: { theory: 2 } };
state.absences.push({ id: 'a1', subject: 'analitica', group: 'theory', date: '2026-10-13' });
assert.ok(window.NexoOrgAvisos.list(bridge).some(a => /Te queda 1 falta/.test(a.texto)));
console.log('organizacion-test: ok');
