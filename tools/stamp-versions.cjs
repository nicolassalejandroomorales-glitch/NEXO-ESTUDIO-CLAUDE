// Pone los ?v= de dist/app.js y dist/index.html según el contenido de cada archivo
// (hash corto). Si el archivo cambia, cambia su ?v= y el navegador no usa la copia vieja.
// Nadie edita los ?v= a mano: lo corre tools/build-startup.cjs.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dist = path.join(__dirname, '..', 'dist');
const hash = buf => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
const fileHash = rel => hash(fs.readFileSync(path.join(dist, rel)));

// Rutas con plantilla (`./classes/${id}-gen.js?v=`): hash de todos los archivos de esa
// carpeta que terminan igual, porque no se sabe cuál se va a cargar.
function folderHash(dir, suffix) {
  const abs = path.join(dist, dir);
  const files = fs.readdirSync(abs).filter(f => f.endsWith(suffix)).sort();
  return hash(files.map(f => f + fileHash(path.join(dir, f))).join('|'));
}

function stamp(rel) {
  const file = path.join(dist, rel);
  const before = fs.readFileSync(file, 'utf8');
  let changed = 0;
  // El catálogo ya incluye la extensión en ${file}; también debe invalidarse al editar una clase.
  const withClasses = before.replace(/\.\/classes\/\$\{file\}\?v=[\w.-]+/g, match => {
    const next = './classes/${file}?v=' + folderHash('classes', '.js');
    if (next !== match) changed++;
    return next;
  });
  const after = withClasses.replace(/\.\/([\w./${}-]+?\.(?:js|css))\?v=[\w.-]+/g, (match, target) => {
    let v;
    if (target.includes('${')) {
      const dir = path.dirname(target);
      const suffix = target.slice(target.lastIndexOf('}') + 1);
      if (dir.includes('${') || !fs.existsSync(path.join(dist, dir))) return match;
      v = folderHash(dir, suffix);
    } else {
      if (!fs.existsSync(path.join(dist, target))) return match;
      v = fileHash(target);
    }
    const next = `./${target}?v=${v}`;
    if (next !== match) changed++;
    return next;
  });
  if (after !== before) fs.writeFileSync(file, after);
  return changed;
}

// app.js primero: su propio hash (usado en index.html) incluye los ?v= ya puestos.
const a = stamp('app.js');
const i = stamp('index.html');
console.log(`Versiones: ${a} cambiadas en app.js, ${i} en index.html.`);
