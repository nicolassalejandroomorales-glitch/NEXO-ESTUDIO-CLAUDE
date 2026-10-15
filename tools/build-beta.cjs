#!/usr/bin/env node
// Arma la carpeta beta/ para compartir con compañeros: copia dist/ SIN el material de profesores
// (diapositivas del PPT, pautas y PDFs de pruebas) y sin lo que no hace falta. No publica nada.
// Uso: node tools/build-beta.cjs   (antes corre `node tools/build-startup.cjs` si tocaste módulos del bundle)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = path.join(root, 'dist');
const out = path.join(root, 'beta');

// Rutas (relativas a dist/, con "/") que NO viajan en la beta.
const EXCLUDE = [
  'assets/exams',                 // pautas e imágenes de pruebas, PDFs históricos
  'assets/classes/org-01/slides', // diapositivas reales del PPT de Aminas
  'classes/slides',               // mapa de esas diapositivas (la clase ya lo ignora si falta)
  'dev',                          // demos y hojas de revisión internas
  'vendor/pdfjs', 'vendor/posthog', 'vendor/supabase', 'vendor/rive'
];
const isExcluded = rel => EXCLUDE.some(e => rel === e || rel.startsWith(e + '/')) || rel.endsWith('.riv');

function copy(dir, rel = '') {
  for (const entry of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const r = rel ? `${rel}/${entry.name}` : entry.name;
    if (isExcluded(r)) continue;
    const from = path.join(src, r), to = path.join(out, r);
    if (entry.isDirectory()) { fs.mkdirSync(to, { recursive: true }); copy(dir, r); }
    else fs.copyFileSync(from, to);
  }
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
copy(src);

// "Pruebas antiguas" apunta a las pautas y PDFs: en la beta la lista va vacía.
const dataPath = path.join(out, 'data.js');
let data = fs.readFileSync(dataPath, 'utf8');
const re = /\n  "exams": \[[\s\S]*?\n  \]/;
if (!re.test(data)) throw new Error('No encontré la lista "exams" en data.js; revisa tools/build-beta.cjs');
data = data.replace(re, '\n  "exams": []');
fs.writeFileSync(dataPath, data);
const ctx = {}; vm.createContext(ctx);
vm.runInContext(data + '\n;this.__d = NEXO_DATA;', ctx);
if (!Array.isArray(ctx.__d.exams) || ctx.__d.exams.length) throw new Error('La lista de pruebas antiguas no quedó vacía');

// Texto de las diapositivas de cátedra: la beta no las muestra, así que tampoco viaja dentro de los archivos de las clases.
// Vacía `slides: { ... }` y `Object.assign(cls.slides, { ... })` en dist/classes/*.js (respeta strings y comentarios al buscar la llave que cierra).
function matchingBrace(code, open) {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    const c = code[i], n = code[i + 1];
    if (c === '/' && n === '/') { i = code.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && n === '*') { i = code.indexOf('*/', i + 2) + 1; continue; }
    if (c === "'" || c === '"' || c === '`') {
      for (i++; i < code.length && code[i] !== c; i++) if (code[i] === '\\') i++;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  throw new Error('Llave sin cerrar al quitar las diapositivas');
}
function stripSlideText(code) {
  let count = 0, out = '', pos = 0;
  const re = /(\bslides:\s*|Object\.assign\(cls\.slides,\s*)\{/g;
  let m;
  while ((m = re.exec(code))) {
    const open = m.index + m[0].length - 1, close = matchingBrace(code, open);
    out += code.slice(pos, open) + '{}';
    pos = close + 1; re.lastIndex = pos; count++;
  }
  return { code: out + code.slice(pos), count };
}
let slideBlocks = 0;
for (const f of fs.readdirSync(path.join(out, 'classes')).filter(n => /^[a-z]+-\d+\.js$/.test(n))) {
  const file = path.join(out, 'classes', f);
  const r = stripSlideText(fs.readFileSync(file, 'utf8'));
  if (!r.count) throw new Error(`No encontré el texto de diapositivas en classes/${f}; revisa tools/build-beta.cjs`);
  fs.writeFileSync(file, r.code); slideBlocks += r.count;
}
console.log(`Texto de diapositivas quitado de ${slideBlocks} bloques en las clases.`);

// Sin nube: la beta no apunta a ningún proyecto de Supabase (cada persona guarda su progreso en su navegador).
fs.writeFileSync(path.join(out, 'config.js'),
  '/* Beta: sin nube ni cuentas, sin diapositivas ni pruebas de profes (el código lee `beta` y la clase nexo-beta). */\n' +
  'window.NEXO_PUBLIC_CONFIG = Object.freeze({"supabaseUrl":"","supabaseAnonKey":"","googleOAuthEnabled":false,"beta":true});\n' +
  'document.documentElement.classList.add("nexo-beta");\n');

// Revisión final: nada de material de profesores en la carpeta.
const bad = [];
(function walk(d, rel = '') {
  for (const e of fs.readdirSync(path.join(d, rel), { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(d, r);
    else if (/\.pdf$/i.test(r) || r.startsWith('assets/exams/') || r.includes('/slides/')) bad.push(r);
    else if (/\.(js|html|css|json)$/.test(r) && /https:\/\/[a-z0-9]{12,}\.supabase\.co|sb_publishable_[A-Za-z0-9_-]{10,}/.test(fs.readFileSync(path.join(d, r), 'utf8'))) bad.push(r + ' (apunta a Supabase)');
  }
})(out);
if (bad.length) throw new Error('Quedó algo que no debe viajar en beta/: ' + bad.slice(0, 5).join(', '));

let files = 0, bytes = 0, biggest = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else { const s = fs.statSync(p).size; files++; bytes += s; biggest = Math.max(biggest, s); }
  }
})(out);
console.log(`beta/ lista: ${files} archivos, ${(bytes / 1048576).toFixed(1)} MB (el mayor: ${(biggest / 1048576).toFixed(1)} MB). Sin material de profesores.`);
