// Organización · Calendario (Fase 3): cuadrícula, semana, mover fecha con historial y deshacer, borrar, semestre, receso y horario.
// Sin navegador: módulo puro con los datos reales de dist/semester-2026.js.
const assert = require('assert'); const fs = require('fs'); const path = require('path');
global.window = globalThis;
const M = require(path.join(__dirname, '../dist/planner/calendar-model.js'));
const S = eval(fs.readFileSync(path.join(__dirname, '../dist/semester-2026.js'), 'utf8') + ';NEXO_SEMESTER');
const mk = () => ({ events: S.events.map(e => ({ ...e, status: 'planned' })), grades: JSON.parse(JSON.stringify(S.grades)) });

// Mes: octubre de 2026 empieza en jueves → 3 casillas vacías antes del día 1, semanas de 7, lunes primero.
const oct = M.monthGrid('2026-10');
assert.strictEqual(oct.label, 'octubre de 2026'); assert.strictEqual(oct.cells.length % 7, 0);
assert.deepStrictEqual(oct.cells.slice(0, 4), [null, null, null, '2026-10-01']); assert.strictEqual(oct.cells.filter(Boolean).length, 31);
assert.strictEqual(M.monthGrid('2026-02').cells.filter(Boolean).length, 28);
assert.strictEqual(M.shiftMonth('2026-12', 1), '2027-01'); assert.strictEqual(M.shiftMonth('2026-01', -1), '2025-12');

// Semana: de lunes a domingo, también cruzando de mes.
assert.deepStrictEqual(M.weekOf('2026-10-14'), ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']);
assert.strictEqual(M.weekOf('2026-11-01')[0], '2026-10-26'); assert.strictEqual(M.weekdayIndex('2026-10-18'), 7); assert.strictEqual(M.weekdayName('2026-10-14'), 'miércoles');

// Íconos: sello (pruebas), matraz (lab), pluma (entregas), receso.
const st = mk();
assert.strictEqual(M.kind(st.events.find(e => e.id === 'official-fq-pep1')), 'sello'); assert.strictEqual(M.kind(st.events.find(e => e.id === 'official-org-lab-1')), 'matraz');
assert.strictEqual(M.kind({ type: 'deadline' }), 'pluma'); assert.strictEqual(M.kind({ type: 'recess' }), 'receso');
assert.strictEqual(M.eventsOn(st.events, '2026-10-21').length, 1, 'solo el Lab 2 FQ el 21 oct (la PEP 1 se movió al 28)');
assert.ok(M.eventsOn(st.events, '2026-10-28').some(e => e.id === 'official-fq-pep1'), 'PEP 1 FQ el 28 oct');

// Mover una fecha: historial, sincroniza la nota, deshace, y no acepta fechas inválidas.
const r = M.moveEvent(st, 'official-fq-c1', '2026-10-28', { today: '2026-10-14' });
assert.ok(r.ok); const c1 = st.events.find(e => e.id === 'official-fq-c1');
assert.strictEqual(c1.date, '2026-10-28'); assert.deepStrictEqual(c1.dateHistory, [{ from: '2026-10-26', to: '2026-10-28', on: '2026-10-14', by: 'tú' }]);
assert.strictEqual(c1.dateNote, undefined, 'la nota "fecha por confirmar" se va al moverla tú');
assert.strictEqual(st.grades.fisico.components.find(c => c.id === 'official-fq-controls').date, '', 'solo se mueve la nota enlazada');
assert.strictEqual(M.moveEvent(st, 'official-fq-c1', '2026-13-45').ok, false); assert.strictEqual(M.moveEvent(st, 'official-fq-c1', '2026-10-28').ok, false);
const u = M.undoLastMove(st, 'official-fq-c1', { today: '2026-10-15' });
assert.ok(u.ok); assert.strictEqual(c1.date, '2026-10-26'); assert.strictEqual(c1.dateHistory.length, 2); assert.ok(c1.dateHistory[1].undo);
assert.strictEqual(M.undoLastMove(st, 'official-fq-c1').ok, false, 'ya no queda nada por deshacer');
// revert() deja todo como estaba (para el "Deshacer" del aviso).
const st2 = mk(), snap = JSON.stringify(st2); const m2 = M.moveEvent(st2, 'official-fq-pep1', '2026-10-23'); m2.revert();
assert.strictEqual(JSON.stringify(st2), snap, 'revert devuelve exactamente lo anterior');
// Pruebas de ciclo: la nota del lab sigue a su evento aunque tengan ids distintos.
const m3 = M.moveEvent(st2, 'official-fq-ciclo', '2026-11-26'); assert.strictEqual(st2.grades.fisico.components.find(c => c.id === 'grade-fq-lab-ciclo').date, '2026-11-26');
// Borrar con deshacer, en el mismo lugar.
const n = st2.events.length, idx = st2.events.findIndex(e => e.id === 'official-ana-c1'), d = M.removeEvent(st2, 'official-ana-c1');
assert.strictEqual(st2.events.length, n - 1); d.revert(); assert.strictEqual(st2.events.findIndex(e => e.id === 'official-ana-c1'), idx);

// Tareas: pendiente → en progreso → hecha (y "hecha" cierra el evento).
const t = { type: 'task', status: 'planned' };
assert.strictEqual(M.taskState(t), 'pendiente'); M.setTaskState(t, M.nextState('pendiente')); assert.strictEqual(t.taskState, 'progreso'); assert.strictEqual(t.status, 'planned');
M.setTaskState(t, M.nextState('progreso')); assert.strictEqual(t.status, 'done'); assert.strictEqual(M.taskState(t), 'hecha');

// Receso: cubre de la fecha de inicio a "hasta".
const rec = [{ id: 'r', type: 'recess', date: '2026-12-21', until: '2027-01-03', status: 'planned' }];
assert.ok(M.recessOn(rec, '2026-12-25')); assert.strictEqual(M.recessOn(rec, '2027-01-04'), null); assert.strictEqual(M.recessOn(rec, '2026-12-20'), null);

// Semestre: una fila por ramo, marca de hoy, y la semana crítica del 19 al 27 de octubre (4 evaluaciones).
const subjects = [{ id: 'organica' }, { id: 'analitica' }, { id: 'fisico' }, { id: 'fisio' }];
const sem = M.semester(mk().events, subjects, '2026-10-14');
assert.strictEqual(sem.rows.length, 4); assert.ok(sem.today > 0 && sem.today < 100);
assert.ok(sem.rows.every(r => r.items.every(i => i.left >= 0 && i.left <= 100)));
assert.ok(sem.bands.some(b => b.from === '2026-10-19' && b.to === '2026-10-27' && b.count === 3), 'semana crítica 19–27 oct');
assert.ok(sem.rows[0].items.some(i => i.kind === 'matraz') && sem.rows[0].items.some(i => i.kind === 'sello'));
assert.strictEqual(M.semester([], subjects, '2026-10-14'), null);

// Horario fijo: jueves tiene lab de Orgánica 09:50; ordenado por hora; domingo vacío.
const thu = M.scheduleFor(S.schedule, '2026-10-15');
assert.ok(thu.some(b => b.subject === 'organica' && b.kind === 'lab' && b.start === '09:50')); assert.deepStrictEqual(thu.map(b => b.start), thu.map(b => b.start).slice().sort());
assert.strictEqual(M.scheduleFor(S.schedule, '2026-10-18').length, 0);
assert.ok(M.validTime('09:50') && !M.validTime('9:50') && !M.validTime('25:00'));
console.log('calendario-test: ok');
