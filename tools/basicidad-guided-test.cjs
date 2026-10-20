// El reto del piloto debe poder reconstruirse, usar criterios enseñados y conservar el catálogo anterior.
const { test } = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const context = vm.createContext({ window: {} });
for (const file of ['org-01', 'org-01-gen', 'player']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist/classes', file + '.js'), 'utf8'), context);
const cls = context.window.NexoClasses['org-01'], study = cls.missions.find(m => m.id === 'm4').study;
test('Variantes nuevas del piloto no exigen familias no enseñadas ni comparaciones finas sin datos', () => {
  const taught = new Set(['p-Nitroanilina', 'Anilina', 'p-Toluidina (p-metilanilina)', 'Piridina', 'Amoníaco', 'Bencilamina', 'Etilamina']);
  for (let seed = 0; seed < 120; seed++) for (const level of [3, 5]) {
    const id = `gen:basicidad:${level}:guided-${seed}:${study.generatorProfile}`;
    const item = context.window.NexoClassroom.genItem(cls, id);
    assert.equal(item.type, 'order'); assert.equal(item.cards.length, level === 3 ? 3 : 4);
    assert.ok(!/pKa|\d[,.]\d/.test(item.prompt + item.cards.map(c => c.text).join(' ')), 'el enunciado no revela el orden con números');
    assert.equal(new Set(item.answer).size, item.cards.length);
    assert.ok(item.cards.every(c => taught.has(c.text.replace(/ \(pKaH [^)]+\)$/, ''))));
    assert.equal(item.concept, 'am.orden');
    assert.equal(JSON.stringify(item), JSON.stringify(context.window.NexoClassroom.genItem(cls, id)));
    if (level === 5) assert.ok(item.cards.filter(c => ['Bencilamina', 'Etilamina'].includes(c.text)).length <= 1);
  }
  assert.ok(context.window.NexoClassroom.genItem(cls, 'gen:basicidad:5:legacy:am.orden'), 'el contrato anterior sigue disponible');
});
