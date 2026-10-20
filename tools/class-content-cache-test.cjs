// Una clase editada debe cambiar la URL del catálogo y luego el hash de app.js.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const dist = path.resolve(__dirname, '../dist'), files = new Map();
files.set(path.join(dist, 'app.js'), 'load(`./classes/${file}?v=20`)');
files.set(path.join(dist, 'index.html'), '<script src="./app.js?v=old"></script>');
files.set(path.join(dist, 'classes/a.js'), 'contenido inicial');
files.set(path.join(dist, 'classes/b.js'), 'otra clase');
const mock = {
  readFileSync: name => { if (!files.has(name)) throw new Error('No se debe leer: ' + name); return files.get(name); },
  writeFileSync: (name, value) => files.set(name, value), existsSync: name => files.has(name) || name === path.join(dist, 'classes'),
  readdirSync: () => ['a.js', 'b.js', 'slides']
};
const stamp = () => vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'stamp-versions.cjs'), 'utf8'), {
  __dirname, console: { log() {} }, require: name => name === 'fs' ? mock : require(name)
});
stamp();
const first = files.get(path.join(dist, 'app.js')), firstIndex = files.get(path.join(dist, 'index.html'));
assert.match(first, /\?v=[a-f0-9]{8}/); assert.ok(!first.includes('?v=20'));
files.set(path.join(dist, 'classes/a.js'), 'explicación nueva'); stamp();
const second = files.get(path.join(dist, 'app.js')), secondIndex = files.get(path.join(dist, 'index.html'));
assert.notEqual(second, first); assert.notEqual(secondIndex, firstIndex);
stamp(); assert.equal(files.get(path.join(dist, 'app.js')), second); assert.equal(files.get(path.join(dist, 'index.html')), secondIndex);
console.log('OK: editar una clase invalida su caché y el proceso es idempotente.');
