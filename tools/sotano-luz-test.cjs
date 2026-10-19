// La luz del Sótano (dist/aprender/sotano-luz.js): grietas de errores y premio al volver de una misión, desde la evidencia real.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert');
const context = { window: { matchMedia: () => ({ matches: false }) }, sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} } }; vm.createContext(context);
for (const f of [['classes', 'evidence.js'], ['aprender', 'sotano-luz.js']]) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'dist', f[0], f[1]), 'utf8'), context);
const { NexoClassEvidence: E, NexoSotanoLuz: L } = context.window;

const cls = { id: 'c', missions: [{ id: 'm1' }, { id: 'm2' }], concepts: [{ id: 'base.x', root: true }, { id: 'a', mission: 'm1', title: 'A' }, { id: 'b', mission: 'm2', title: 'B' }] };
const day = n => new Date(Date.UTC(2026, 9, n, 10)).toISOString();
const state = {}, rec = (concept, correct, at, extra = {}) => E.record(state, 'c', { itemId: 'i' + at + concept, conceptId: concept, step: 5, correct, at, ...extra });
const def = { classes: ['c'] }, env = () => ({ classes: { c: cls }, NX: null, E, state });

assert.equal(L.cracks(def, env()).length, 0, 'sin errores no hay grietas');
rec('a', false, day(1));
let c = L.cracks(def, env());
assert.equal(c.length, 1); assert.equal(c[0].state, 'open'); assert.equal(c[0].missionId, 'm1', 'la grieta lleva a la misión del concepto');
rec('a', true, day(2), { hint: true });
assert.equal(L.cracks(def, env())[0].state, 'open', 'acertar con pista no empieza a sellar');
rec('a', true, day(2));
assert.equal(L.cracks(def, env())[0].state, 'sealing', 'un acierto sin ayuda: sellándose');
rec('a', true, day(4));
assert.equal(L.cracks(def, env()).length, 0, 'otro acierto un día después: sellada');
rec('a', false, day(6));
assert.equal(L.cracks(def, env())[0].state, 'open', 'un error nuevo reabre la grieta');

// El premio solo llega si acertaste sin ayuda (algún concepto pasa a hoja clara o más).
const before = { node: 'c0', jars: [0, 0], crys: [null, null], ranks: { 'c:a': 0, 'c:b': 0 } };
assert.equal(L.reward(before, { node: 'c0', jars: [1, 0], crys: [1, null], ranks: { 'c:a': 1, 'c:b': 0 } }), null, 'solo intentar (brote) no premia');
const rw = L.reward(before, { node: 'c0', jars: [2, 0], crys: [1, null], ranks: { 'c:a': 3, 'c:b': 0 } });
assert.ok(rw && rw.gained === 1 && rw.jars.join() === '0' && rw.crys.join() === '0', 'acertar sin ayuda sí premia y dice qué frasco y cristal se encienden');
assert.equal(L.reward(before, { node: 'c60', jars: [4, 4], crys: [1, 1], ranks: { 'c:a': 5 } }), null, 'otra alcoba no se compara');
assert.equal(L.slotsFor('cz0').length, 0, 'en la vista de la mesa no hay grietas'); assert.ok(L.slotsFor('ana.c60').length > 0);
console.log('La luz del Sótano OK');
