// Datos reales del semestre (dist/semester-2026.js): ponderaciones que suman 100 % y actualización segura de cuentas existentes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'dist', 'semester-2026.js'), 'utf8') + ';this.S=NEXO_SEMESTER;', context);
const S = context.S, clone = value => JSON.parse(JSON.stringify(value));
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;

for (const [id, plan] of Object.entries(S.grades)) {
  for (const group of Object.keys(plan.groups)) {
    const total = plan.components.filter(item => item.group === group).reduce((sum, item) => sum + Number(item.weight), 0);
    assert(Math.abs(total - 100) < .01, `${id}/${group} suma ${total}%, no 100%.`);
  }
  const course = Object.values(plan.groups).reduce((sum, group) => sum + Number(group.courseWeight || 0), 0);
  assert.equal(course, 100, `${id}: teoría + lab deben sumar 100% del ramo.`);
  assert(new Set(plan.components.map(item => item.id)).size === plan.components.length, `${id}: ids repetidos.`);
  // Una fila sin fecha que comparte id con un evento borraría ese evento al editarla (syncGradeEvent).
  plan.components.filter(item => !item.date).forEach(item => assert(!S.events.some(event => event.id === item.id), `${item.id} sin fecha choca con un evento.`));
}
assert.equal(new Set(S.events.map(item => item.id)).size, S.events.length, 'Eventos con id repetido.');
S.events.forEach(item => assert(validDate(item.date), `Fecha inválida: ${item.id}`));
S.schedule.forEach(item => assert(item.day >= 1 && item.day <= 6 && /^\d{2}:\d{2}$/.test(item.start) && item.start < item.end, 'Bloque de horario inválido.'));

// Cuenta existente: Orgánica sin notas (se actualiza), Analítica con una nota (se respeta), un lab nuevo borrado no reaparece después.
const state = { meta: {}, events: [{ id: 'official-org-pep1', date: '2026-10-27' }], grades: {
  organica: { components: [{ id: 'grade-organica-theory-1', name: 'PEP 1', group: 'theory', weight: '', grade: '' }] },
  analitica: { components: [{ id: 'mia', name: 'Control', group: 'theory', weight: '100', grade: '5,5' }] }
} };
S.upgrade(state, clone);
assert.equal(state.grades.organica.components.length, S.grades.organica.components.length, 'Orgánica sin notas recibe la ponderación oficial.');
assert.equal(state.grades.analitica.components[0].id, 'mia', 'Un ramo con notas escritas no se pisa.');
assert.equal(state.events.filter(item => item.id === 'official-org-lab-1').length, 1, 'Agrega los labs nuevos.');
assert.equal(state.events.filter(item => item.id === 'official-org-pep1').length, 1, 'No duplica eventos existentes.');
assert.equal(state.meta.semesterData, S.version);
state.events = state.events.filter(item => item.id !== 'official-org-lab-1');
S.upgrade(state, clone);
assert(!state.events.some(item => item.id === 'official-org-lab-1'), 'Corre una sola vez: lo que borraste no vuelve.');
console.log(`Semestre ${S.version}: ${Object.keys(S.grades).length} ramos al 100%, ${S.events.length} fechas, ${S.schedule.length} bloques de horario y actualización segura OK.`);
