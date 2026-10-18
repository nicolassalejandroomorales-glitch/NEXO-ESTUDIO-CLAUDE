#!/usr/bin/env node
// Arma la carpeta beta/ para compartir con compañeros: copia dist/ SIN el material de profesores
// (diapositivas del PPT, pautas y PDFs de pruebas) y sin lo que no hace falta. No publica nada.
// Uso: node tools/build-beta.cjs           (sin nube: cada persona guarda su progreso en su navegador)
//      node tools/build-beta.cjs --nube    (con cuentas Google: copia la URL y la clave PÚBLICA de dist/config.js)
// (antes corre `node tools/build-startup.cjs` si tocaste módulos del bundle)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = path.join(root, 'dist');
const out = path.join(root, 'beta');
const conNube = process.argv.includes('--nube');

// Rutas (relativas a dist/, con "/") que NO viajan en la beta.
const EXCLUDE = [
  'assets/exams',                 // pautas e imágenes de pruebas, PDFs históricos
  'assets/classes/org-01/slides', // diapositivas reales del PPT de Aminas
  'classes/slides',               // mapa de esas diapositivas (la clase ya lo ignora si falta)
  'dev',                          // demos y hojas de revisión internas
  'games/prototipos',             // prototipos sueltos, no hacen falta en la beta
  'vendor/pdfjs', 'vendor/posthog', 'vendor/rive',
  ...(conNube ? [] : ['vendor/supabase'])
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

// Se vacía el contenido (no la carpeta misma): así no falla si el Explorador o el terminal la tienen abierta.
fs.mkdirSync(out, { recursive: true });
for (const name of fs.readdirSync(out)) fs.rmSync(path.join(out, name), { recursive: true, force: true });
copy(src);

// GitHub Pages pasa todo por Jekyll y se salta carpetas que empiezan con "_"; este archivo vacío lo apaga (no estorba en otros hosting).
fs.writeFileSync(path.join(out, '.nojekyll'), '');

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

// Sin nube por defecto; con --nube se copia SOLO la URL y la clave pública (publishable) de dist/config.js.
let publica = { supabaseUrl: '', supabaseAnonKey: '' };
if (conNube) {
  const ctxCfg = {}; ctxCfg.window = ctxCfg; vm.createContext(ctxCfg);
  const cfgSrc = fs.readFileSync(path.join(src, 'config.js'), 'utf8').split('\n').filter(l => !l.includes('document.')).join('\n');
  vm.runInContext(cfgSrc + '\n;this.__c = NEXO_PUBLIC_CONFIG;', ctxCfg);
  publica = ctxCfg.__c;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(publica.supabaseUrl) || !/^sb_publishable_/.test(publica.supabaseAnonKey))
    throw new Error('dist/config.js no tiene la URL y la clave pública (sb_publishable_) de Supabase');
}
const cfg = { supabaseUrl: publica.supabaseUrl, supabaseAnonKey: publica.supabaseAnonKey, googleOAuthEnabled: conNube, beta: true };
fs.writeFileSync(path.join(out, 'config.js'),
  `/* Beta: ${conNube ? 'con cuentas Google' : 'sin nube ni cuentas'}, sin diapositivas ni pruebas de profes (el código lee "beta" y la clase nexo-beta). */\n` +
  `window.NEXO_PUBLIC_CONFIG = Object.freeze(${JSON.stringify(cfg)});\n` +
  'document.documentElement.classList.add("nexo-beta");\n');

// Revisión final: nada de material de profesores en la carpeta.
const bad = [];
(function walk(d, rel = '') {
  for (const e of fs.readdirSync(path.join(d, rel), { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(d, r);
    else if (/\.pdf$/i.test(r) || r.startsWith('assets/exams/') || r.includes('/slides/')) bad.push(r);
    else if (!conNube && /\.(js|html|css|json)$/.test(r) && /https:\/\/[a-z0-9]{12,}\.supabase\.co|sb_publishable_[A-Za-z0-9_-]{10,}/.test(fs.readFileSync(path.join(d, r), 'utf8'))) bad.push(r + ' (apunta a Supabase)');
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
