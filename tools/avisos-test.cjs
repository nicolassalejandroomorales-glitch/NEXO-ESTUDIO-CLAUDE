// Avisos del Grimorio: primera vez por sección (solo si saltaste) y novedades. Sin navegador: DOM falso mínimo.
const assert = require('assert'); const fs = require('fs'); const path = require('path');
const shown = [];
const mkEl = () => { const kids = {}; const e = { children: [], style: {}, setAttribute() {}, querySelector: q => kids[q] || (kids[q] = mkEl()), addEventListener(_, f) { e.click = f; }, remove() { e.removed = true; }, append() {}, set innerHTML(v) {}, set textContent(v) { e.text = v; } }; return e; };
global.window = {}; global.document = { currentScript: { src: 'http://x/tutorial/avisos.js' }, baseURI: 'http://x/', head: { append() {} }, body: { append: e => shown.push(e) }, createElement: mkEl };
global.URL = URL;
eval(fs.readFileSync(path.join(__dirname, '../dist/tutorial/avisos.js'), 'utf8'));
const A = window.NexoAvisos; let saves = 0; const save = () => saves++;

let tu = { status: 'done', sections: {}, news: 0 };
A.check(['games'], tu, save); assert.strictEqual(shown.length, 0, 'tutorial completo: no repite');
tu = { status: 'pending', sections: {}, news: 0 };
A.check(['games'], tu, save); assert.strictEqual(shown.length, 0, 'pendiente: no avisa');
tu = { status: 'skipped', sections: {}, news: 0 };
A.check(['lesson', 'x'], tu, save); assert.strictEqual(shown.length, 0, 'ruta sin sección');
A.check(['games'], tu, save); assert.strictEqual(shown.length, 1, 'saltado: avisa en Juegos');
shown[0].querySelector('button').click(); assert.strictEqual(tu.sections.juegos, true, 'Entendido marca la sección'); assert.strictEqual(saves, 1);
A.check(['games'], tu, save); assert.strictEqual(shown.length, 1, 'ya visto: no repite');
assert.ok(['clases', 'juegos', 'organizacion', 'perfil'].every(k => A.SECTIONS[k].text && A.SECTIONS[k].title));
console.log('avisos-test: ok');
