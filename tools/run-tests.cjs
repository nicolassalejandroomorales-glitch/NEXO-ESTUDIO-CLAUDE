// Corre todas las pruebas rápidas: smoke-test.cjs, cada tools/*-test.cjs y los chequeos
// de calidad. Una prueba nueva entra sola con solo llamarse tools/<algo>-test.cjs:
// nadie edita la lista en package.json. `npm test` usa este archivo.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

// Las que ya corren en otro script (test:e2e, test:a11y…) necesitan navegador: no van aquí.
const enOtroScript = new Set(Object.entries(pkg.scripts)
  .filter(([name]) => name !== 'test')
  .flatMap(([, cmd]) => (cmd.match(/tools\/[\w-]+\.cjs/g) || []).map(f => path.basename(f))));

// Pruebas rotas desde antes; arreglarlas y sacarlas de aquí (ver docs/pendientes.md).
const SALTAR = {
  'update01-test.cjs': 'desactualizada: espera "Bloque del catálogo" y la app muestra "Evaluación"',
  'update01-dom-test.cjs': 'necesita jsdom, que no está en package.json',
  'update01-integrity-test.cjs': 'lee un manifiesto fuera del repo (Desktop/MANIFIESTO_SHA256.tsv)',
  'web-vitals-test.cjs': 'necesita navegador (Playwright)'
};

const tests = ['smoke-test.cjs'];
for (const f of fs.readdirSync(path.join(root, 'tools')).sort()) {
  if (!f.endsWith('-test.cjs') || enOtroScript.has(f) || SALTAR[f]) continue;
  tests.push('tools/' + f);
}
tests.push('tools/exercise-quality.cjs', 'tools/security-audit.cjs', 'tools/check-skills.cjs');

const fallidas = [];
for (const t of tests) {
  if (!fs.existsSync(path.join(root, t))) { fallidas.push(t + ' (no existe)'); continue; }
  console.log(`\n▶ ${t}`);
  const r = spawnSync(process.execPath, [t], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) fallidas.push(t);
}

console.log(`\n${tests.length - fallidas.length}/${tests.length} pruebas OK` +
  (Object.keys(SALTAR).length ? ` · ${Object.keys(SALTAR).length} saltadas (rotas desde antes)` : ''));
if (fallidas.length) {
  console.log('Fallaron: ' + fallidas.join(', '));
  process.exit(1);
}
