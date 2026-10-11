// Revisa que las skills y agentes de .claude/ no apunten a archivos que ya no existen.
// Uso: node tools/check-skills.cjs  (0 tokens: lo corre Node, no Claude)
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const dirs = [path.join(root, '.claude', 'skills'), path.join(root, '.claude', 'agents')];
const files = [];
for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && fs.existsSync(path.join(full, 'SKILL.md'))) files.push(path.join(full, 'SKILL.md'));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
  }
}
files.push(path.join(root, 'CLAUDE.md'));

// Solo rutas de archivo entre comillas invertidas, con extensión conocida.
const pattern = /`([A-Za-z0-9_./-]+\.(?:js|cjs|css|html|md|py|png|webp|json))`/g;
const bases = ['', 'dist', 'tools', 'docs'];
let missing = 0;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const [, ref] of text.matchAll(pattern)) {
    if (ref === 'SPEC.md') continue;
    if (!ref.includes('/') && !/^[A-Z_]+\.md$|^[a-z0-9-]+\.(cjs|js|png)$/.test(ref)) continue;
    const found = bases.some(base => fs.existsSync(path.join(root, base, ref))) ||
      (!ref.includes('/') && findByName(ref));
    if (!found) { missing++; console.log(`✗ ${path.relative(root, file)} → ${ref}`); }
  }
}
function findByName(name) {
  const stack = [path.join(root, 'dist'), path.join(root, 'tools')];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'vendor' || entry.name === 'node_modules') continue;
      if (entry.isDirectory()) stack.push(path.join(dir, entry.name));
      else if (entry.name === name) return true;
    }
  }
  return false;
}
if (missing) { console.log(`\n${missing} ruta(s) vieja(s): actualiza esas skills.`); process.exit(1); }
console.log(`Skills al día (${files.length} archivos revisados).`);
