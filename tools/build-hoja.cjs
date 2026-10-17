#!/usr/bin/env node
// Genera docs/hoja-de-ruta.html (el tablero de Nexo) a partir de docs/chats/*.md:
// 3 columnas (terminado, en desarrollo, por hacer), % de avance por tema y prompts para copiar.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'docs', 'chats');
const out = path.join(__dirname, '..', 'docs', 'hoja-de-ruta.html');

function parse(file) {
  const text = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r/g, '');
  const lines = text.split('\n');
  const chat = { slug: file.replace(/\.md$/, ''), title: lines[0].replace(/^#\s*/, '') };
  let section = null;
  const sections = {};
  let inFence = false;
  for (const line of lines.slice(1)) {
    const meta = line.match(/^- (modelo|estado|fase|prioridad|spec):\s*(.*)$/);
    if (meta && !section) { chat[meta[1]] = meta[2]; continue; }
    if (!inFence && line.startsWith('## ')) { section = line.slice(3).trim(); sections[section] = []; continue; }
    if (line.startsWith('```')) { inFence = !inFence; continue; }
    if (section) sections[section].push(line);
  }
  const bullets = name => (sections[name] || []).filter(l => l.startsWith('- ')).map(l => l.slice(2));
  const block = name => (sections[name] || []).join('\n').trim();
  chat.hecho = bullets('Hecho');
  chat.falta = bullets('Falta');
  chat.ideas = bullets('Ideas');
  chat.inicio = block('Prompt de inicio');
  chat.continuacion = block('Prompt de continuación');
  chat.prioridad = Number(chat.prioridad) || 9;
  return chat;
}

const chats = fs.readdirSync(dir)
  .filter(f => f.endsWith('.md') && f !== 'README.md')
  .map(parse)
  .sort((a, b) => a.prioridad - b.prioridad || a.title.localeCompare(b.title));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const list = items => items.length ? `<ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : '<p class="vacio">Nada por ahora.</p>';
const PRIO = { 1: 'Urgente', 2: 'Pronto', 3: 'Después', 4: 'Idea' };
const FASES = [
  { id: 'terminado', titulo: 'Terminado' },
  { id: 'desarrollo', titulo: 'En desarrollo' },
  { id: 'por-hacer', titulo: 'Por hacer' },
];

// La línea "- fase:" del chat manda; si no está, se calcula (nada hecho = por hacer, nada que falte = terminado).
function fase(c) {
  if (FASES.some(f => f.id === c.fase)) return c.fase;
  if (!c.hecho.length) return 'por-hacer';
  return c.falta.length ? 'desarrollo' : 'terminado';
}
const pct = (h, f) => (h + f ? Math.round(100 * h / (h + f)) : 0);

chats.forEach(c => {
  c.fase = fase(c);
  c.pct = c.fase === 'terminado' ? 100 : pct(c.hecho.length, c.falta.length);
});

const card = c => `
<details class="card p${c.prioridad}">
  <summary>
    <span class="tag prio">${PRIO[c.prioridad] || 'Otro'}</span>
    <h3>${esc(c.title)}</h3>
    <div class="barra" role="img" aria-label="${c.pct}% avanzado"><i style="width:${c.pct}%"></i></div>
    <p class="meta"><b>${c.pct}%</b> · ${c.hecho.length} hechas, ${c.falta.length} faltan<br>${esc(c.estado || '')}</p>
  </summary>
  <div class="cols">
    <section><h4>Hecho (${c.hecho.length})</h4>${list(c.hecho)}</section>
    <section><h4>Falta (${c.falta.length})</h4>${list(c.falta)}</section>
    <section><h4>Ideas (${c.ideas.length})</h4>${list(c.ideas)}</section>
  </div>
  <div class="prompts">
    <span class="tag">${esc(c.modelo || '')}</span>
    <button data-copy="${esc(c.inicio)}">Copiar prompt de inicio</button>
    <button data-copy="${esc(c.continuacion)}">Copiar prompt de continuación</button>
    <span class="spec">${esc(c.spec || '')}</span>
  </div>
</details>`;

const columnas = FASES.map(f => {
  const items = chats.filter(c => c.fase === f.id);
  return `<section class="col ${f.id}"><h2>${f.titulo} <span>${items.length}</span></h2>${items.map(card).join('') || '<p class="vacio">Ningún tema todavía.</p>'}</section>`;
}).join('\n');

const totals = chats.reduce((t, c) => ({ h: t.h + c.hecho.length, f: t.f + c.falta.length, i: t.i + c.ideas.length }), { h: 0, f: 0, i: 0 });
const general = pct(totals.h, totals.f);
const ahora = chats.filter(c => c.fase === 'desarrollo' && c.prioridad === 1);

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tablero de Nexo</title>
<style>
:root{--bg:#f6f1e7;--card:#fffdf8;--ink:#2b2118;--mute:#7a6a58;--line:#e2d6c0;--accent:#8a5a2b;--u:#b3402a;--p:#c7881f;--d:#4a7c59;--i:#5b6fa6;--track:#e9dfcc}
@media (prefers-color-scheme:dark){:root{--bg:#1c1712;--card:#262019;--ink:#f1e8d8;--mute:#a8987f;--line:#3a3025;--accent:#e0a868;--u:#e0735c;--p:#e2ad4a;--d:#7fb58f;--i:#8fa2d8;--track:#3a3025}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif;padding:24px 16px 64px}
main{max-width:1200px;margin:0 auto}h1{margin:0 0 4px;font-size:28px}.sub{color:var(--mute);margin:0 0 20px}
.resumen{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:20px}
.resumen .grande{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}.resumen .grande b{font-size:40px;line-height:1}
.resumen .barra{height:12px;margin:10px 0}.resumen p{margin:4px 0;font-size:14px;color:var(--mute)}
.barra{height:8px;background:var(--track);border-radius:99px;overflow:hidden}.barra i{display:block;height:100%;background:var(--d);border-radius:99px}
.tablero{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:start}
@media(max-width:900px){.tablero{grid-template-columns:1fr}}
.col h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 10px;color:var(--mute)}
.col h2 span{background:var(--card);border:1px solid var(--line);border-radius:99px;padding:0 8px;margin-left:4px}
.col.desarrollo .barra i{background:var(--p)}.col.por-hacer .barra i{background:var(--i)}
.card{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--i);border-radius:12px;padding:12px 14px;margin-bottom:12px}
.card.p1{border-left-color:var(--u)}.card.p2{border-left-color:var(--p)}.card.p3{border-left-color:var(--d)}
summary{cursor:pointer;list-style:none}summary::-webkit-details-marker{display:none}
.card h3{margin:6px 0 8px;font-size:17px}.meta{margin:6px 0 0;font-size:13px;color:var(--mute)}.meta b{color:var(--ink);font-size:15px}
.tag{display:inline-block;font-size:12px;border:1px solid var(--line);border-radius:99px;padding:1px 10px;color:var(--mute);margin-right:4px}
.tag.prio{color:var(--accent);border-color:var(--accent)}
.cols{display:grid;grid-template-columns:1fr;gap:12px;margin-top:12px}
.cols h4{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--mute);margin:0 0 4px}
ul{margin:0;padding-left:18px;font-size:14px}li{margin-bottom:4px}.vacio{color:var(--mute);font-size:14px;margin:0}
.prompts{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}.spec{color:var(--mute);font-size:12px;width:100%}
.prompts button{font:inherit;font-size:13px;cursor:pointer;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:8px;padding:5px 10px}
.prompts button:hover{border-color:var(--accent);color:var(--accent)}
.guia{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-top:28px}
.guia h2{margin-top:0}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border-top:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
</style></head><body><main>
<h1>Tablero de Nexo</h1>
<p class="sub">Actualizado el ${new Date().toISOString().slice(0, 10)} desde docs/chats/. Un chat = un tema = un modelo. Toca una tarjeta para ver el detalle.</p>
<div class="resumen">
  <div class="grande"><b>${general}%</b><span>de la app avanzada · ${totals.h} cosas hechas, ${totals.f} por hacer, ${totals.i} ideas guardadas</span></div>
  <div class="barra" role="img" aria-label="${general}% avanzado"><i style="width:${general}%"></i></div>
  <p>Lo urgente en marcha: ${ahora.map(c => `<b>${esc(c.title)}</b> (${c.pct}%)`).join(' · ') || 'nada urgente en desarrollo'}.</p>
</div>
<div class="tablero">
${columnas}
</div>
<section class="guia"><h2>Cuándo abrir un chat nuevo</h2>
<table>
<tr><td>Aprobaste el cambio o el tema terminó</td><td>Cerrar y abrir el siguiente tema</td></tr>
<tr><td>Vas a hablar de otro tema</td><td>Chat nuevo con el prompt de ese tema</td></tr>
<tr><td>Conversación larga (muchas capturas o archivos)</td><td>Cerrar y usar el prompt de continuación</td></tr>
<tr><td>Un bug falló 2 veces con Sonnet</td><td>Chat corto en Opus con el prompt de continuación</td></tr>
<tr><td>Toca diseñar (motor, economía, estructura de clase)</td><td>Chat Opus solo conversando; la implementación va a un chat Sonnet</td></tr>
<tr><td>Compactaste 2 veces</td><td>Cerrar y abrir uno nuevo</td></tr>
</table>
<p>Antes de cerrar, Claude siempre: hace <code>nexo-cierre</code>, actualiza <code>docs/chats/&lt;tema&gt;.md</code>, regenera este tablero y lo publica en el Artifact.</p></section>
</main>
<script>
document.addEventListener('click',function(e){
  var b=e.target.closest('button[data-copy]');if(!b)return;
  var t=b.dataset.copy,o=b.textContent;
  var ok=function(){b.textContent='¡Copiado!';setTimeout(function(){b.textContent=o},1400)};
  function fb(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(x){}a.remove()}
  try{navigator.clipboard.writeText(t).then(ok,fb)}catch(x){fb()}
});
</script></body></html>
`;

fs.writeFileSync(out, html);
console.log(`Tablero listo: ${path.relative(process.cwd(), out)} (${chats.length} chats, ${general}% avanzado)`);
