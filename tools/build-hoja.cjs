#!/usr/bin/env node
// Genera docs/hoja-de-ruta.html a partir de docs/chats/*.md (una página con todo lo hecho, lo que falta, ideas y prompts para copiar).
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
    const meta = line.match(/^- (modelo|estado|prioridad|spec):\s*(.*)$/);
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

const cards = chats.map(c => `
<article class="card p${c.prioridad}" data-prio="${c.prioridad}">
  <header>
    <span class="tag prio">${PRIO[c.prioridad] || 'Otro'}</span>
    <h2>${esc(c.title)}</h2>
    <p class="meta"><span class="tag">${esc(c.modelo || '')}</span> <span class="tag">${esc(c.estado || '')}</span></p>
  </header>
  <div class="cols">
    <section><h3>Hecho (${c.hecho.length})</h3>${list(c.hecho)}</section>
    <section><h3>Falta (${c.falta.length})</h3>${list(c.falta)}</section>
    <section><h3>Ideas (${c.ideas.length})</h3>${list(c.ideas)}</section>
  </div>
  <div class="prompts">
    <button data-copy="${esc(c.inicio)}">Copiar prompt de inicio</button>
    <button data-copy="${esc(c.continuacion)}">Copiar prompt de continuación</button>
    <span class="spec">${esc(c.spec || '')}</span>
  </div>
</article>`).join('\n');

const totals = chats.reduce((t, c) => ({ h: t.h + c.hecho.length, f: t.f + c.falta.length, i: t.i + c.ideas.length }), { h: 0, f: 0, i: 0 });

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hoja de ruta de Nexo</title>
<style>
:root{--bg:#f6f1e7;--card:#fffdf8;--ink:#2b2118;--mute:#7a6a58;--line:#e2d6c0;--accent:#8a5a2b;--u:#b3402a;--p:#c7881f;--d:#4a7c59;--i:#5b6fa6}
@media (prefers-color-scheme:dark){:root{--bg:#1c1712;--card:#262019;--ink:#f1e8d8;--mute:#a8987f;--line:#3a3025;--accent:#e0a868;--u:#e0735c;--p:#e2ad4a;--d:#7fb58f;--i:#8fa2d8}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif;padding:24px 16px 64px}
main{max-width:1100px;margin:0 auto}h1{margin:0 0 4px;font-size:28px}.sub{color:var(--mute);margin:0 0 20px}
.totales{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px}.totales div{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 16px}
.totales b{font-size:22px;display:block}
.filtros{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.filtros button,.prompts button{font:inherit;cursor:pointer;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:8px;padding:6px 12px}
.filtros button.on,.prompts button:hover,.filtros button:hover{border-color:var(--accent);color:var(--accent)}
.card{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--i);border-radius:12px;padding:16px 18px;margin-bottom:16px}
.card.p1{border-left-color:var(--u)}.card.p2{border-left-color:var(--p)}.card.p3{border-left-color:var(--d)}
.card h2{margin:6px 0 4px;font-size:20px}.meta{margin:0 0 10px}
.tag{display:inline-block;font-size:12px;border:1px solid var(--line);border-radius:99px;padding:1px 10px;color:var(--mute);margin-right:4px}
.tag.prio{color:var(--accent);border-color:var(--accent)}
.cols{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media(max-width:800px){.cols{grid-template-columns:1fr}}
.cols h3{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--mute);margin:0 0 6px}
ul{margin:0;padding-left:18px;font-size:14px}li{margin-bottom:4px}.vacio{color:var(--mute);font-size:14px;margin:0}
.prompts{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}.spec{color:var(--mute);font-size:12px;margin-left:auto}
.guia{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-top:28px}
.guia h2{margin-top:0}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border-top:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
</style></head><body><main>
<h1>Hoja de ruta de Nexo</h1>
<p class="sub">Generada el ${new Date().toISOString().slice(0, 10)} desde docs/chats/. Un chat = un tema = un modelo.</p>
<div class="totales"><div><b>${totals.h}</b>hecho</div><div><b>${totals.f}</b>falta</div><div><b>${totals.i}</b>ideas</div><div><b>${chats.length}</b>chats</div></div>
<div class="filtros"><button class="on" data-f="0">Todos</button><button data-f="1">Urgente</button><button data-f="2">Pronto</button><button data-f="3">Después</button><button data-f="4">Ideas</button></div>
${cards}
<section class="guia"><h2>Cuándo abrir un chat nuevo</h2>
<table>
<tr><td>Aprobaste el cambio o el tema terminó</td><td>Cerrar y abrir el siguiente tema</td></tr>
<tr><td>Vas a hablar de otro tema</td><td>Chat nuevo con el prompt de ese tema</td></tr>
<tr><td>Conversación larga (muchas capturas o archivos)</td><td>Cerrar y usar el prompt de continuación</td></tr>
<tr><td>Un bug falló 2 veces con Sonnet</td><td>Chat corto en Opus con el prompt de continuación</td></tr>
<tr><td>Toca diseñar (motor, economía, estructura de clase)</td><td>Chat Opus solo conversando; la implementación va a un chat Sonnet</td></tr>
<tr><td>Compactaste 2 veces</td><td>Cerrar y abrir uno nuevo</td></tr>
</table>
<p>Antes de cerrar, Claude siempre: hace <code>nexo-cierre</code>, actualiza <code>docs/chats/&lt;tema&gt;.md</code>, regenera esta hoja y te deja el prompt de continuación listo.</p></section>
</main>
<script>
document.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.dataset.copy!==undefined){
    var t=b.dataset.copy,o=b.textContent;
    var ok=function(){b.textContent='¡Copiado!';setTimeout(function(){b.textContent=o},1400)};
    try{navigator.clipboard.writeText(t).then(ok,fb)}catch(x){fb()}
    function fb(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(x){}a.remove()}
  } else if(b.dataset.f!==undefined){
    document.querySelectorAll('.filtros button').forEach(function(x){x.classList.toggle('on',x===b)});
    document.querySelectorAll('.card').forEach(function(c){c.hidden=b.dataset.f!=='0'&&c.dataset.prio!==b.dataset.f});
  }
});
</script></body></html>
`;

fs.writeFileSync(out, html);
console.log(`Hoja de ruta lista: ${path.relative(process.cwd(), out)} (${chats.length} chats, ${totals.h} hecho, ${totals.f} falta, ${totals.i} ideas)`);
