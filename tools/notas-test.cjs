// Organización · Notas (Fase 2): reglas de examen/reprobar, "necesitas X", simulador, promedio general e inasistencias.
// Sin navegador: módulo puro con las ponderaciones reales de dist/semester-2026.js.
const assert = require('assert'); const fs = require('fs'); const path = require('path');
global.window = globalThis;
require(path.join(__dirname, '../dist/planner/grades.js'));
const R = require(path.join(__dirname, '../dist/planner/grade-rules.js'));
const S = eval(fs.readFileSync(path.join(__dirname, '../dist/semester-2026.js'), 'utf8') + ';NEXO_SEMESTER');
const cfg = id => JSON.parse(JSON.stringify(S.grades[id]));
const set = (c, id, g) => { c.components.find(x => x.id === id).grade = g; return c; };

// Formato y nivel de color.
assert.strictEqual(R.fmt(4.6), '4,6'); assert.strictEqual(R.fmt(4.567, 2), '4,57');
assert.deepStrictEqual([null, 3.9, 3.95, 4.9, 5, 7].map(R.level), ['vacio', 'rojo', 'ambar', 'ambar', 'verde', 'verde']);
assert.strictEqual(R.ceil1(4.51), 4.6); assert.strictEqual(R.ceil1(4.5), 4.5);

// Sin notas: ningún ramo "en riesgo" ni con número inventado de "llevas".
for (const id of Object.keys(S.grades)) { const e = R.evaluate(id, cfg(id)); assert.strictEqual(e.llevas, null, id); assert.strictEqual(e.final, null, id); assert.strictEqual(e.worst, 'none', id); }

// Analítica: PEP 1 = 5,0 (30 %) → necesita el resto; "necesitas" alcanza justo.
let ana = set(cfg('analitica'), 'official-ana-pep1', '5.0');
let e = R.evaluate('analitica', ana), th = e.groups.theory;
assert.ok(Math.abs(th.pendingWeight - 70) < 1e-9);
assert.ok(Math.abs(th.required - (395 - 150) / 70) < 1e-9, 'umbral 3,95');
const need = th.need; assert.ok(need >= th.required && need - th.required < .1, 'redondeo hacia arriba: con ese número alcanza');
assert.ok(e.chips.some(c => /eximirte necesitas 4,0/i.test(c.text)));
// Una PEP roja quita la eximición (regla de Analítica) y avisa derecho a examen.
ana = set(ana, 'official-ana-pep2', '3.5');
assert.ok(R.evaluate('analitica', ana).chips.some(c => c.tone === 'warn' && /sin eximición/i.test(c.text)));

// Orgánica: PEP roja → prueba final (PF); cátedra completa bajo 3,4 → reprueba sin PF.
let org = set(cfg('organica'), 'official-org-pep1', '3.2');
assert.ok(R.evaluate('organica', org).chips.some(c => /prueba final/i.test(c.text) && c.tone === 'warn'));
org.components.filter(c => c.group === 'theory').forEach(c => { c.grade = '3.0'; });
assert.ok(R.evaluate('organica', org).chips.some(c => c.tone === 'risk' && /3,4/.test(c.text)));
org.components.filter(c => c.group === 'lab').forEach(c => { c.grade = '3.0'; });
e = R.evaluate('organica', org);
assert.ok(e.chips.some(c => /nota final del ramo sería la del laboratorio/.test(c.text)));
assert.ok(e.final !== null && e.worst === 'risk');

// FQ: prueba de ciclo roja → examen de lab; cátedra < 3,95 → examen.
let fq = set(cfg('fisico'), 'grade-fq-lab-ciclo', '3.4');
assert.ok(R.evaluate('fisico', fq).chips.some(c => /examen de laboratorio/i.test(c.text)));
fq.components.filter(c => c.group === 'theory').forEach(c => { c.grade = '3.9'; });
assert.ok(R.evaluate('fisico', fq).chips.some(c => /examen \(vale 40/.test(c.text)));

// Fisiopatología: eximición con 4,5; muestra cuánto necesitas para eximirte.
let fis = set(cfg('fisio'), 'official-fisio-pep1', '5.0');
assert.ok(R.evaluate('fisio', fis).chips.some(c => /eximirte del examen necesitas 4,0/i.test(c.text)));
fis = set(fis, 'official-fisio-pep2', '4.0');
assert.ok(R.evaluate('fisio', fis).chips.some(c => /Eximido/.test(c.text)));

// Simulador: no toca los datos, y es coherente con el cálculo real.
const before = JSON.stringify(ana);
const sim = R.simulate('analitica', ana, 'theory', 6);
assert.strictEqual(JSON.stringify(ana), before, 'no modifica tus notas');
assert.strictEqual(sim.group.status, 'aprobada'); assert.ok(sim.group.grade > R.evaluate('analitica', ana).groups.theory.current - 5);
const exact = R.simulate('analitica', cfg('analitica'), 'theory', 4);
assert.ok(Math.abs(exact.group.grade - 4) < 1e-9, 'sacarse 4 en todo da 4');

// Promedio general: simple, solo con ramos que tienen datos; final solo si TODOS están completos.
const evs = ['organica', 'analitica', 'fisico', 'fisio'].map(id => R.evaluate(id, id === 'analitica' ? set(cfg(id), 'official-ana-pep1', '6.0') : cfg(id)));
const ov = R.overall(evs); assert.strictEqual(ov.ramos, 1); assert.strictEqual(ov.final, null); assert.ok(Math.abs(ov.llevas - 6) < 1e-9);

// Inasistencias: queda-1, límite, pasado; los labs "100 % asistencia" son estrictos sin máximo.
const abs = n => Array.from({ length: n }, (_, i) => ({ subject: 'analitica', group: 'theory', date: '2026-10-1' + i }));
assert.strictEqual(R.attendance(abs(0), 'analitica', {}).theory.state, 'sin-maximo');
assert.strictEqual(R.attendance(abs(2), 'analitica', { analitica: { theory: 3 } }).theory.state, 'queda-1');
assert.strictEqual(R.attendance(abs(3), 'analitica', { analitica: { theory: 3 } }).theory.state, 'limite');
assert.strictEqual(R.attendance(abs(4), 'analitica', { analitica: { theory: 3 } }).theory.state, 'pasado');
assert.strictEqual(R.attendance([{ subject: 'organica', group: 'lab', date: '2026-10-15' }], 'organica', {}).lab.state, 'estricto-falta');
assert.strictEqual(R.attendance([], 'fisico', {}).lab.state, 'estricto');

// Calibración: estimada vs real.
const cal = R.calibration([{ components: [{ name: 'PEP 1', grade: '4.0', estimate: '5.0' }, { name: 'PEP 2', grade: '5.0', estimate: '' }] }]);
assert.strictEqual(cal.pairs.length, 1); assert.ok(Math.abs(cal.mean - 1) < 1e-9);
console.log('notas-test: ok');
