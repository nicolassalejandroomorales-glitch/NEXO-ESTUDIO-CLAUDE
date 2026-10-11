/* Editor de moléculas y flechas del aula (docs/clase-viva/DISENO.md §9). Propio y sin plugins.
   - "build": dibujas una molécula tocando. Tocar vacío pone un átomo (unido al que tienes seleccionado),
     tocar un átomo lo selecciona, tocar otro átomo los une, tocar un enlace cambia simple → doble → triple.
   - "arrows": trazas flechas de mecanismo: tocas de dónde salen los electrones (par libre o enlace) y adónde llegan.
   La química (valencia, comparar, explicar el error) vive en molecule.js. */
(() => {
  'use strict';
  const M = () => window.NexoMolecule;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const VB = { w: 420, h: 260 };
  window.__nexoMolDraw = 2; // versión del dibujo
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  const ELEMENTS = ['C', 'N', 'O', 'Cl', 'Br', 'H'];
  const clone = g => ({ atoms: g.atoms.map(a => ({ ...a })), bonds: g.bonds.map(b => ({ ...b })) });

  /* ── Dibujo común (estilo de libro: el átomo pesado queda en su punto, los H hacia afuera,
     los enlaces se cortan justo en el borde del rótulo y los dobles de los anillos van hacia adentro) ── */
  const CW = ch => /[₀-₉⁺⁻]/.test(ch) ? 6.5 : /[a-z]/.test(ch) ? 8.6 : /[()]/.test(ch) ? 5.8 : 11;
  const textW = t => [...t].reduce((s, ch) => s + CW(ch), 0);
  function atomLabel(g, a) {
    if (a.hide) return { text: '', charge: '', anchor: 'middle', x: 0, left: 0, right: 0 };   // vértice de esqueleto
    if (a.label) { const w = textW(a.label); return { text: a.label, charge: '', anchor: 'middle', x: 0, left: -w / 2, right: w / 2 }; }
    const h = M().implicitH(g, a), q = a.q || 0;
    const hs = h ? `H${h > 1 ? SUB[h] : ''}` : '';
    const charge = q ? (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '⁺' : '⁻') : '';
    const ew = textW(a.el);
    if (!hs) return { text: a.el, charge, anchor: 'middle', x: 0, left: -ew / 2, right: ew / 2 };
    // Los H van hacia el lado donde no hay enlaces (NH₂ o H₂N), como en los libros.
    const nb = M().bondsOf(g, a.id).map(b => M().atomById(g, b.a === a.id ? b.b : b.a)).filter(Boolean);
    const allRight = nb.length && nb.every(o => o.x - a.x > 4); // todos los enlaces hacia la derecha → H₂N–, H₃C–
    const w = ew + textW(hs);
    if (allRight) return { text: hs + a.el, charge, anchor: 'end', x: ew / 2, left: ew / 2 - w, right: ew / 2 };
    return { text: a.el + hs, charge, anchor: 'start', x: -ew / 2, left: -ew / 2, right: -ew / 2 + w };
  }
  // Distancia desde el centro del átomo hasta el borde de su rótulo en la dirección (ux, uy), más un margen.
  function edge(g, a, ux, uy, margin = 3) {
    if (a.hide) return 0;
    const L = atomLabel(g, a), top = 10 + margin, right = L.right + margin, left = L.left - margin;
    const ts = [];
    if (ux > 1e-6) ts.push(right / ux); if (ux < -1e-6) ts.push(left / ux);
    if (uy > 1e-6) ts.push(top / uy); if (uy < -1e-6) ts.push(-top / uy);
    return Math.max(0, Math.min(...ts.filter(t => t >= 0), 60));
  }
  // ¿El enlace está en un anillo? Devuelve el centro del anillo (para dibujar el doble hacia adentro).
  function ringCenter(g, b) {
    const nbrs = id => g.bonds.filter(x => x !== b && (x.a === id || x.b === id)).map(x => (x.a === id ? x.b : x.a));
    const prev = { [b.a]: null }, queue = [[b.a, 0]];
    while (queue.length) {
      const [id, d] = queue.shift();
      if (id === b.b) { const path = []; for (let x = id; x !== null; x = prev[x]) path.push(M().atomById(g, x)); return { x: path.reduce((s, o) => s + o.x, 0) / path.length, y: path.reduce((s, o) => s + o.y, 0) / path.length }; }
      if (d >= 6) continue;
      for (const n of nbrs(id)) if (!(n in prev)) { prev[n] = id; queue.push([n, d + 1]); }
    }
    return null;
  }
  function bondLines(g, b, cls = '') {
    const a1 = M().atomById(g, b.a), a2 = M().atomById(g, b.b);
    if (!a1 || !a2) return '';
    const dx = a2.x - a1.x, dy = a2.y - a1.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    const t1 = edge(g, a1, ux, uy), t2 = edge(g, a2, -ux, -uy);
    const x1 = a1.x + ux * t1, y1 = a1.y + uy * t1, x2 = a2.x - ux * t2, y2 = a2.y - uy * t2;
    const line = (ox, oy, s1 = 0, s2 = 0) => `<line x1="${(x1 + ox + ux * s1).toFixed(1)}" y1="${(y1 + oy + uy * s1).toFixed(1)}" x2="${(x2 + ox - ux * s2).toFixed(1)}" y2="${(y2 + oy - uy * s2).toFixed(1)}"/>`;
    let nx = -uy, ny = ux, lines = line(0, 0);
    if (b.o === 2) {
      const c = ringCenter(g, b);
      if (c) { // anillo: línea en el anillo y otra más corta hacia el centro
        if ((c.x - (a1.x + a2.x) / 2) * nx + (c.y - (a1.y + a2.y) / 2) * ny < 0) { nx = -nx; ny = -ny; }
        const cut = len * 0.16;
        lines = line(0, 0) + line(nx * 6.5, ny * 6.5, a1.hide ? cut : 0, a2.hide ? cut : 0);
      } else lines = line(nx * 3.4, ny * 3.4) + line(-nx * 3.4, -ny * 3.4);
    }
    if (b.o === 3) lines = line(0, 0) + line(nx * 5, ny * 5) + line(-nx * 5, -ny * 5);
    return `<g class="mol-bond ${cls}">${lines}</g>`;
  }
  function atomMarkup(g, a, { cls = '', attrs = '' } = {}) {
    const L = atomLabel(g, a);
    return `<g class="mol-atom el-${esc(a.el)} ${cls}" transform="translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})" ${attrs}>
      <circle class="mol-hit" r="${a.hide ? 9 : 17}"/>${L.text ? `<text class="mol-label" text-anchor="${L.anchor}" x="${L.x.toFixed(1)}" dy="6">${esc(L.text)}</text>` : ''}${L.charge ? `<text class="mol-charge" x="${(L.right + 1).toFixed(1)}" y="-7">${L.charge}</text>` : ''}</g>`;
  }
  // Dónde dibujar el par libre: del lado opuesto a los vecinos, justo afuera del rótulo (sin tapar los H).
  function lonePairSpot(g, a, k = 0, n = 1, fixed = null) {
    const nb = M().bondsOf(g, a.id).map(b => M().atomById(g, b.a === a.id ? b.b : b.a)).filter(Boolean);
    let ang = -Math.PI / 2;
    if (fixed !== null && fixed !== undefined) ang = fixed * Math.PI / 180;
    else if (nb.length) { const vx = nb.reduce((s, o) => s + (o.x - a.x), 0), vy = nb.reduce((s, o) => s + (o.y - a.y), 0); if (Math.hypot(vx, vy) > 1) ang = Math.atan2(-vy, -vx); }
    if (n > 1) ang += (k - (n - 1) / 2) * 1.1;
    const r = Math.max(14, edge(g, a, Math.cos(ang), Math.sin(ang), 5) + 4);
    return { x: a.x + Math.cos(ang) * r, y: a.y + Math.sin(ang) * r, ang };
  }

  // Encuadre ajustado a la molécula (para escenas que no se editan), con aire para pares libres y flechas
  function fitBox(g, pad = 58) {
    const xs = g.atoms.map(a => a.x), ys = g.atoms.map(a => a.y);
    let x = Math.min(...xs) - pad, y = Math.min(...ys) - pad - 20, w = Math.max(...xs) - Math.min(...xs) + pad * 2, h = Math.max(...ys) - Math.min(...ys) + pad * 2 + 20;
    const ratio = VB.w / VB.h; if (w / h < ratio) { const nw = h * ratio; x -= (nw - w) / 2; w = nw; } else { const nh = w / ratio; y -= (nh - h) / 2; h = nh; }
    return `${x.toFixed(0)} ${y.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}`;
  }

  /* ── Construir (build) ── */
  function startGraph(item) { return clone(item.start || { atoms: [], bonds: [] }); }
  function buildMarkup(item, w, { rec, retry, done, actBtn }) {
    const g = done ? rec.value.graph : (w.graph ||= startGraph(item));
    const tool = w.tool || 'C', probs = M().problems(g), bad = new Set(probs.map(p => p.atom));
    const diff = done && !rec.correct ? M().diff(g, item.target) : null;
    const nearNote = done && !rec.correct ? (item.near || []).find(n => M().same(g, n.graph))?.note : null;
    const suspects = new Set(diff?.suspects || []);
    const svg = `<svg class="mol-canvas ${done ? 'is-done' : ''}" viewBox="0 0 ${VB.w} ${VB.h}" data-mol-build="${esc(item.id)}" data-retry="${retry ? 1 : 0}" role="application" aria-label="Lienzo para dibujar la molécula">
      <rect class="mol-bg" width="${VB.w}" height="${VB.h}"/>
      ${g.bonds.map((b, i) => `<g data-mol-bond="${i}">${bondLines(g, b)}<line class="mol-bond-hit" x1="${M().atomById(g, b.a)?.x}" y1="${M().atomById(g, b.a)?.y}" x2="${M().atomById(g, b.b)?.x}" y2="${M().atomById(g, b.b)?.y}"/></g>`).join('')}
      ${g.atoms.map(a => atomMarkup(g, a, { cls: `${w.sel === a.id && !done ? 'is-sel' : ''} ${bad.has(a.id) ? 'is-bad' : ''} ${suspects.has(a.id) ? 'is-suspect' : ''}`, attrs: `data-mol-atom="${esc(a.id)}"` })).join('')}
    </svg>`;
    if (done) return `<div class="mol-editor is-done">${svg}
      ${!rec.correct && (nearNote || diff?.message) ? `<p class="mol-status is-bad">${esc(nearNote || diff.message)}</p>` : ''}
      ${rec.correct ? `<p class="mol-status is-ok">Es la molécula correcta: ${esc(M().formulaText(M().formula(g)))}.</p>` : ''}</div>`;
    const tools = [...ELEMENTS.map(el => [el, el, `Átomo de ${M().NAME[el]}`]), ['charge', '±', 'Cambiar la carga'], ['erase', 'Borrar', 'Borrar átomo o enlace']];
    const help = w.sel ? 'Toca un espacio vacío para agregar un átomo unido al seleccionado, u otro átomo para unirlos. Toca el seleccionado otra vez para soltarlo.'
      : tool === 'erase' ? 'Toca un átomo o un enlace para borrarlo.' : tool === 'charge' ? 'Toca un átomo para cambiar su carga: + , − o neutra.'
      : 'Toca un espacio vacío para poner un átomo, o toca un átomo para seleccionarlo. Toca un enlace para hacerlo doble o triple.';
    return `<div class="mol-editor">
      <div class="mol-tools" role="toolbar" aria-label="Herramientas">${tools.map(([id, label, title]) => `<button type="button" class="mol-tool ${tool === id ? 'is-on' : ''}" data-mol-tool="${id}" data-item="${esc(item.id)}" data-retry="${retry ? 1 : 0}" aria-pressed="${tool === id}" title="${esc(title)}">${esc(label)}</button>`).join('')}
        <span class="mol-sep"></span><button type="button" class="mol-tool" data-mol-do="undo" data-item="${esc(item.id)}" data-retry="${retry ? 1 : 0}" ${w.history?.length ? '' : 'disabled'}>Deshacer</button><button type="button" class="mol-tool" data-mol-do="reset" data-item="${esc(item.id)}" data-retry="${retry ? 1 : 0}">Empezar de nuevo</button></div>
      ${svg}
      <p class="mol-status ${probs.length ? 'is-bad' : ''}" aria-live="polite">${esc(probs.length ? probs[0].message : help)}</p>
      <p class="mol-formula">Tu dibujo: <b>${esc(g.atoms.length ? M().formulaText(M().formula(g)) : '—')}</b></p>
      <div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Comprobar ▸', 'cr-btn cr-primary', !g.atoms.length)}</div></div>`;
  }

  /* ── Flechas (arrows) ── */
  function spot(item, id) {
    const g = item.scene, [kind, ref] = id.split(':');
    if (kind === 'lp') { const a = M().atomById(g, ref); return lonePairSpot(g, a, 0, item.lonePairs[ref], item.lpAngle?.[ref]); }
    if (kind === 'a') { const a = M().atomById(g, ref); return { x: a.x, y: a.y }; }
    const b = g.bonds[Number(ref)], a1 = M().atomById(g, b.a), a2 = M().atomById(g, b.b);
    return { x: (a1.x + a2.x) / 2, y: (a1.y + a2.y) / 2 };
  }
  function arrowPath(item, from, to) {
    const g = item.scene, p = spot(item, from), q0 = spot(item, to);
    const cxm = g.atoms.reduce((s, a) => s + a.x, 0) / g.atoms.length, cym = g.atoms.reduce((s, a) => s + a.y, 0) / g.atoms.length;
    let dx = q0.x - p.x, dy = q0.y - p.y, len = Math.hypot(dx, dy) || 1;
    // Lado de la curva: hacia afuera de la molécula, para no cruzar enlaces ni rótulos.
    let nx = -dy / len, ny = dx / len;
    const mx = (p.x + q0.x) / 2, my = (p.y + q0.y) / 2;
    if ((mx - cxm) * nx + (my - cym) * ny < 0) { nx = -nx; ny = -ny; }
    const bend = Math.max(len < 45 ? 26 : 20, Math.min(52, len * .42));
    const cx = mx + nx * bend, cy = my + ny * bend;
    // Llega al borde del rótulo (no al centro del átomo), en la dirección en que viene la curva.
    let q = q0;
    if (to.startsWith('a:')) { const a = M().atomById(g, to.slice(2)); const vx = cx - q0.x, vy = cy - q0.y, vl = Math.hypot(vx, vy) || 1; const t = edge(g, a, vx / vl, vy / vl, 6) || 9; q = { x: q0.x + vx / vl * t, y: q0.y + vy / vl * t }; }
    else { const vx = cx - q0.x, vy = cy - q0.y, vl = Math.hypot(vx, vy) || 1; q = { x: q0.x + vx / vl * 5, y: q0.y + vy / vl * 5 }; }
    let p2 = p;
    if (from.startsWith('b:')) { const vx = cx - p.x, vy = cy - p.y, vl = Math.hypot(vx, vy) || 1; p2 = { x: p.x + vx / vl * 4, y: p.y + vy / vl * 4 }; }
    return `M${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }
  const key = ([a, b]) => `${a}>${b}`;
  function arrowsMarkup(item, w, { rec, retry, done, actBtn }) {
    const g = item.scene, arrows = done ? rec.value : (w.arrows ||= []);
    const answer = new Set(item.answer.map(key));
    const showAnswer = done && (rec.correct || retry);
    const lps = Object.entries(item.lonePairs || {});
    const box = fitBox(g), [bx, by, bw, bh] = box.split(' ');
    const svg = `<svg class="mol-canvas arrows" viewBox="${box}" data-mol-arrows="${esc(item.id)}" data-retry="${retry ? 1 : 0}" role="application" aria-label="Escena para trazar flechas">
      <defs>${[['', '#b3261e'], ['-ok', '#2f6b4a'], ['-given', '#5c4a37']].map(([suf, col]) => `<marker id="ah-${esc(item.id)}${suf}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0 0.5 L10 5 L0 9.5 L2.6 5 z" fill="${col}"/></marker>`).join('')}</defs>
      <rect class="mol-bg" x="${bx}" y="${by}" width="${bw}" height="${bh}"/>
      ${g.bonds.map((b, i) => `<g class="mol-pick ${w.from === `b:${i}` ? 'is-sel' : ''}" data-mol-pick="b:${i}">${bondLines(g, b)}<line class="mol-bond-hit" x1="${M().atomById(g, b.a).x}" y1="${M().atomById(g, b.a).y}" x2="${M().atomById(g, b.b).x}" y2="${M().atomById(g, b.b).y}"/></g>`).join('')}
      ${g.atoms.map(a => atomMarkup(g, a, { cls: 'mol-pick', attrs: `data-mol-pick="a:${esc(a.id)}"` })).join('')}
      ${lps.map(([id, n]) => { const a = M().atomById(g, id);
        return [...Array(n)].map((_, k) => { const s = lonePairSpot(g, a, k, n, item.lpAngle?.[id]), px = -Math.sin(s.ang) * 4, py = Math.cos(s.ang) * 4;
          const main = k === 0; return `<g class="mol-lp ${main ? 'mol-pick' : ''} ${main && w.from === `lp:${id}` ? 'is-sel' : ''}" ${main ? `data-mol-pick="lp:${esc(id)}"` : ''}><circle class="mol-lp-hit" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="11"/>
          <circle class="mol-lp-dot" cx="${(s.x + px).toFixed(1)}" cy="${(s.y + py).toFixed(1)}" r="2.6"/><circle class="mol-lp-dot" cx="${(s.x - px).toFixed(1)}" cy="${(s.y - py).toFixed(1)}" r="2.6"/></g>`; }).join(''); }).join('')}
      ${(item.given || []).map(([a, b]) => `<path class="mol-arrow is-given" d="${arrowPath(item, a, b)}" marker-end="url(#ah-${esc(item.id)}-given)"/>`).join('')}
      ${arrows.map(([a, b], i) => { const ok = answer.has(key([a, b]));
        return `<path class="mol-arrow ${done ? (ok ? 'is-right' : 'is-wrong') : ''}" d="${arrowPath(item, a, b)}" marker-end="url(#ah-${esc(item.id)}${done && ok ? '-ok' : ''})" ${done ? '' : `data-mol-arrow="${i}"`}/>`; }).join('')}
      ${showAnswer ? item.answer.map(([a, b]) => { const d = arrowPath(item, a, b);
        return `${rec.correct ? '' : `<path class="mol-arrow is-answer" d="${d}" marker-end="url(#ah-${esc(item.id)}-ok)"/>`}<circle class="mol-electron" r="3.5"><animateMotion dur="1.8s" repeatCount="indefinite" path="${d}"/></circle><circle class="mol-electron" r="3.5"><animateMotion dur="1.8s" begin=".25s" repeatCount="indefinite" path="${d}"/></circle>`; }).join('') : ''}
    </svg>`;
    if (done) {
      const notes = arrows.filter(x => !answer.has(key(x))).map(x => item.notes?.[key(x)] || 'Esa flecha no corresponde. Pregúntate: ¿quién tiene electrones para dar y quién los necesita?');
      const missing = item.answer.filter(x => !arrows.some(y => key(y) === key(x))).length;
      return `<div class="mol-editor is-done">${svg}
        ${rec.correct ? '<p class="mol-status is-ok">¡Así se mueven los electrones! Mira cómo viajan por tus flechas.</p>'
          : `${notes.map(n => `<p class="mol-status is-bad">${esc(n)}</p>`).join('')}${missing ? `<p class="mol-status is-bad">Te ${missing === 1 ? 'falta una flecha' : `faltan ${missing} flechas`}.</p>` : ''}`}</div>`;
    }
    const help = w.from ? 'Ahora toca adónde llegan esos electrones: un átomo o un enlace.'
      : `${item.given?.length ? 'La flecha café ya está puesta. ' : ''}Toca de dónde salen los electrones: un par libre (los dos puntitos) o un enlace. Toca una flecha para borrarla.`;
    return `<div class="mol-editor">${svg}<p class="mol-status" aria-live="polite">${esc(help)}</p>
      <div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Comprobar ▸', 'cr-btn cr-primary', !arrows.length)}</div></div>`;
  }

  /* ── Escena fija: dibujo sin edición, con flechas y electrones opcionales (caso, gemelos, mecanismo) ── */
  let sceneSeq = 0;
  function sceneMarkup(def, { arrows = [], animate = true, label = 'Molécula' } = {}) {
    const g = def.scene, uid = `sc${++sceneSeq}`, box = fitBox(g, 46), [bx, by, bw, bh] = box.split(' ');
    const lps = Object.entries(def.lonePairs || {});
    return `<svg class="mol-canvas is-done mol-scene" viewBox="${box}" role="img" aria-label="${esc(label)}">
      <defs><marker id="${uid}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0 0.5 L10 5 L0 9.5 L2.6 5 z" fill="#b3261e"/></marker></defs>
      <rect class="mol-bg" x="${bx}" y="${by}" width="${bw}" height="${bh}"/>
      ${g.bonds.map(b => bondLines(g, b)).join('')}${g.atoms.map(a => atomMarkup(g, a)).join('')}
      ${lps.map(([id, n]) => { const a = M().atomById(g, id); return [...Array(n)].map((_, k) => { const s = lonePairSpot(g, a, k, n, def.lpAngle?.[id]), px = -Math.sin(s.ang) * 4, py = Math.cos(s.ang) * 4;
        return `<circle class="mol-lp-dot" cx="${(s.x + px).toFixed(1)}" cy="${(s.y + py).toFixed(1)}" r="2.6"/><circle class="mol-lp-dot" cx="${(s.x - px).toFixed(1)}" cy="${(s.y - py).toFixed(1)}" r="2.6"/>`; }).join(''); }).join('')}
      ${arrows.map(([a, b]) => { const d = arrowPath(def, a, b); return `<path class="mol-arrow" d="${d}" marker-end="url(#${uid})"/>${animate ? `<circle class="mol-electron" r="3.5"><animateMotion dur="1.8s" repeatCount="indefinite" path="${d}"/></circle><circle class="mol-electron" r="3.5"><animateMotion dur="1.8s" begin=".25s" repeatCount="indefinite" path="${d}"/></circle>` : ''}`; }).join('')}
    </svg>`;
  }

  /* ── Interacción ── */
  function mount(root, ctx) {
    const pt = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const r = p.matrixTransform(svg.getScreenCTM().inverse());
      return { x: Math.max(18, Math.min(VB.w - 18, r.x)), y: Math.max(18, Math.min(VB.h - 18, r.y)) }; };
    const gated = el => Boolean(el.closest('fieldset:disabled'));
    const commit = (w, g) => { (w.history ||= []).push(clone(w.graph)); if (w.history.length > 30) w.history.shift(); w.graph = g; };
    let drag = null;

    root.addEventListener('click', e => {
      const btn = e.target.closest('[data-mol-tool], [data-mol-do]');
      if (!btn || gated(btn)) return;
      const w = ctx.work(btn.dataset.item, btn.dataset.retry === '1'), item = ctx.item(btn.dataset.item);
      if (btn.dataset.molTool) { w.tool = btn.dataset.molTool; if (!ELEMENTS.includes(w.tool)) w.sel = null; }
      if (btn.dataset.molDo === 'undo' && w.history?.length) { w.graph = w.history.pop(); w.sel = null; }
      if (btn.dataset.molDo === 'reset') { commit(w, startGraph(item)); w.sel = null; }
      ctx.commit();
    });

    root.addEventListener('pointerdown', e => {
      const svg = e.target.closest('[data-mol-build]');
      if (!svg || gated(svg)) return;
      const atomEl = e.target.closest('[data-mol-atom]');
      if (atomEl) { const p = pt(svg, e); drag = { svg, id: atomEl.dataset.molAtom, sx: p.x, sy: p.y, moved: false, el: atomEl }; svg.setPointerCapture?.(e.pointerId); }
    });
    root.addEventListener('pointermove', e => {
      if (!drag) return;
      const p = pt(drag.svg, e);
      if (!drag.moved && Math.hypot(p.x - drag.sx, p.y - drag.sy) < 5) return;
      drag.moved = true; drag.x = p.x; drag.y = p.y;
      drag.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
    });
    root.addEventListener('pointerup', e => {
      const svg = e.target.closest('[data-mol-build]') || drag?.svg;
      if (svg && !gated(svg)) {
        const itemId = svg.dataset.molBuild, retry = svg.dataset.retry === '1', w = ctx.work(itemId, retry), item = ctx.item(itemId);
        w.graph ||= startGraph(item);
        const tool = w.tool || 'C', g = clone(w.graph);
        if (drag?.moved) { const a = g.atoms.find(x => x.id === drag.id); a.x = drag.x; a.y = drag.y; commit(w, g); drag = null; return ctx.commit(); }
        const atomId = drag?.id || e.target.closest('[data-mol-atom]')?.dataset.molAtom;
        const bondEl = e.target.closest('[data-mol-bond]');
        drag = null;
        const newId = () => `u${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
        if (atomId) {
          const a = g.atoms.find(x => x.id === atomId);
          if (tool === 'erase') { g.atoms = g.atoms.filter(x => x.id !== atomId); g.bonds = g.bonds.filter(b => b.a !== atomId && b.b !== atomId); if (w.sel === atomId) w.sel = null; commit(w, g); }
          else if (tool === 'charge') { a.q = a.q === 1 ? -1 : a.q === -1 ? 0 : 1; commit(w, g); }
          else if (w.sel && w.sel !== atomId) {
            const b = g.bonds.find(x => (x.a === w.sel && x.b === atomId) || (x.b === w.sel && x.a === atomId));
            if (b) b.o = b.o >= 3 ? 1 : b.o + 1; else g.bonds.push({ a: w.sel, b: atomId, o: 1 });
            w.sel = atomId; commit(w, g);
          } else if (w.sel === atomId) { if (a.el !== tool) { a.el = tool; commit(w, g); } else w.sel = null; }
          else w.sel = atomId;
        } else if (bondEl) {
          const i = Number(bondEl.dataset.molBond);
          if (tool === 'erase') g.bonds.splice(i, 1); else g.bonds[i].o = g.bonds[i].o >= 3 ? 1 : g.bonds[i].o + 1;
          commit(w, g);
        } else if (tool !== 'erase' && tool !== 'charge') {
          const p = pt(svg, e), id = newId();
          g.atoms.push({ id, el: tool, x: p.x, y: p.y, q: 0 });
          if (w.sel && g.atoms.some(x => x.id === w.sel)) g.bonds.push({ a: w.sel, b: id, o: 1 });
          w.sel = id; commit(w, g);
        } else w.sel = null;
        return ctx.commit();
      }
      drag = null;
      const arrowsSvg = e.target.closest('[data-mol-arrows]');
      if (!arrowsSvg || gated(arrowsSvg)) return;
      const itemId = arrowsSvg.dataset.molArrows, w = ctx.work(itemId, arrowsSvg.dataset.retry === '1'), item = ctx.item(itemId);
      w.arrows ||= [];
      const arrowEl = e.target.closest('[data-mol-arrow]');
      if (arrowEl) { w.arrows.splice(Number(arrowEl.dataset.molArrow), 1); return ctx.commit(); }
      const pick = e.target.closest('[data-mol-pick]')?.dataset.molPick;
      if (!pick) { w.from = null; return ctx.commit(); }
      if (!w.from) { if (pick.startsWith('a:')) return; w.from = pick; return ctx.commit(); }
      if (pick === w.from) { w.from = null; return ctx.commit(); }
      if (!w.arrows.some(x => x[0] === w.from && x[1] === pick) && w.arrows.length < item.answer.length + 2) w.arrows.push([w.from, pick]);
      w.from = null; ctx.commit();
    });
  }

  /* Corrección y textos para el reproductor */
  function isCorrect(item, value) {
    if (item.type === 'build') return Boolean(value?.graph) && M().problems(value.graph).length === 0 && M().same(value.graph, item.target);
    const want = new Set(item.answer.map(key)), got = new Set((value || []).map(key));
    return want.size === got.size && [...want].every(k => got.has(k));
  }
  function feedback(item, rec) {
    if (!rec || rec.correct || !['build', 'arrows'].includes(item.type)) return ''; // solo para dibujos y flechas
    if (item.type === 'build') return (item.near || []).find(n => M().same(rec.value.graph, n.graph))?.note || M().diff(rec.value.graph, item.target).message;
    const wrong = (rec.value || []).find(x => !item.answer.some(y => key(y) === key(x)));
    return wrong ? (item.notes?.[key(wrong)] || 'Revisa de dónde salen los electrones y quién los necesita.') : 'Te faltan flechas.';
  }
  function solution(item) {
    if (item.type === 'build') return `<div class="mol-editor is-done"><p class="cr-eyebrow">La respuesta</p><svg class="mol-canvas is-done" viewBox="0 0 ${VB.w} ${VB.h}" aria-label="Molécula correcta">
      <rect class="mol-bg" width="${VB.w}" height="${VB.h}"/>${item.target.bonds.map(b => bondLines(item.target, b)).join('')}${item.target.atoms.map(a => atomMarkup(item.target, a)).join('')}</svg></div>`;
    return '';
  }

  window.NexoMolEditor = { buildMarkup, arrowsMarkup, sceneMarkup, mount, isCorrect, feedback, solution };
})();
