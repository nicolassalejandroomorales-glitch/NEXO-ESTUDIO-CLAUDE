#!/usr/bin/env node
// LIMPIEZA: revisa la regla de orden de CLAUDE.md (Forma de trabajo, punto 4) sin gastar tokens.
// Solo LEE: no borra ni cambia nada. Uso: node tools/limpieza.cjs   (o: npm run limpieza)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const git = args => execSync(`git ${args}`, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 });
const tracked = git('ls-files').split('\n').filter(Boolean);
const own = f => !/^dist\/vendor\//.test(f) && f !== 'dist/startup-bundle.js'; // código nuestro, no generado ni de terceros
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const size = f => fs.statSync(path.join(root, f)).size;
const mb = bytes => (bytes / 1048576).toFixed(1) + ' MB';

const code = tracked.filter(f => /^(dist|tools)\/.*\.(js|cjs)$/.test(f) && own(f));
const web = tracked.filter(f => /^dist\/.*\.(js|css|html|json)$/.test(f) && own(f));
const assets = tracked.filter(f => /^dist\/assets\//.test(f));
const mentions = web.concat(tracked.filter(f => /^tools\/.*\.(cjs|js)$/.test(f))).map(read).join('\n');

const lines = (files, re) => files.flatMap(f => read(f).split('\n').map((t, i) => re.test(t) ? `${f}:${i + 1}` : null).filter(Boolean));
const report = [];
const section = (titulo, items, ayuda) => report.push({ titulo, items, ayuda });

section('Código comentado', lines(code, /^\s*\/\/\s*(const|let|var|function|if|for|while|return|await|window\.|[\w.]+\(.*\);)\s*/),
  'Se borra: Git guarda el historial.');
section('console.log / debugger olvidados', lines(code.filter(f => /^dist\//.test(f)), /\bconsole\.log\(|^\s*debugger\b/),
  'Depuración que no debe quedar.');
section('TODO / FIXME / HACK sin resolver', lines(code, /(\/\/|\/\*|^\s*\*)\s*(TODO|FIXME|HACK)\b/),
  'Resolverlos o pasarlos a un Pendiente con explicación.');
const base = f => f.replace(/[-_]v\d+(\.[^.]+)$/, '$1');
const conHermana = f => tracked.some(g => g !== f && base(g) === base(f)); // -v1 suelto es solo un nombre; -v2 junto a -v3 es una versión paralela
section('Nombres de parche o copia', tracked.filter(f => own(f) && (/(-old|-nuevo|-copia|-copy|-backup|-bak|\.bak|\.orig|~)(\.|$)/i.test(f) || (/[-_]v\d+\.[^.]+$/.test(f) && conHermana(f)))),
  'Una cosa, una versión: se reemplaza el original.');

const hashes = new Map();
for (const f of assets) {
  const h = crypto.createHash('md5').update(fs.readFileSync(path.join(root, f))).digest('hex');
  hashes.set(h, [...(hashes.get(h) || []), f]);
}
section('Assets idénticos (copias)', [...hashes.values()].filter(g => g.length > 1).map(g => g.join('  =  ')),
  'Dejar uno y apuntar los demás a ese.');

const prefixes = name => { const out = [name]; let p = name; while (/-[^-]+$/.test(p) && p.length > 5) { p = p.replace(/-[^-]+$/, ''); out.push(p); } return out; };
const sinUso = assets.filter(f => !/\.(md|txt)$/i.test(f) && !prefixes(path.basename(f, path.extname(f))).concat(path.basename(f)).some(n => mentions.includes(n)));
section(`Assets que ningún archivo menciona (${mb(sinUso.reduce((a, f) => a + size(f), 0))})`, sinUso,
  'Comprobar que no se carguen con un nombre armado a mano antes de borrar.');

const cargado = f => { // por nombre completo, o por su nombre suelto entre comillas (listas como ['engine', 'graph'])
  const otros = mentions.replace(read(f), ''), nombre = path.basename(f);
  return otros.includes(nombre) || new RegExp(`['"\`]${path.basename(f, path.extname(f))}['"\`]`).test(otros);
};
const sinMencion = web.filter(f => /\.(js|css)$/.test(f) && !/-gen\.js$/.test(f) && !cargado(f));
section('JS / CSS que nadie carga', sinMencion, 'Módulo huérfano o demo olvidada.');

const sueltos = git('status --porcelain').split('\n').filter(l => l.startsWith('??') && !l.includes('.claude/worktrees')).map(l => l.slice(3));
section('Archivos sin seguir en Git', sueltos, 'Subirlos o borrarlos: no dejarlos flotando.');

let total = 0;
for (const { titulo, items, ayuda } of report) {
  total += items.length;
  console.log(`\n${items.length ? '✗' : '✓'} ${titulo}: ${items.length}`);
  if (!items.length) continue;
  items.slice(0, 8).forEach(i => console.log('    ' + i));
  if (items.length > 8) console.log(`    … y ${items.length - 8} más`);
  console.log('    → ' + ayuda);
}
console.log(`\n${total ? `LIMPIEZA: ${total} cosas por revisar.` : 'LIMPIEZA: todo en orden.'}`);
