/* La torre de cada ramo como lugar propio (etapa 10, docs/etapa-10-arte/SPEC.md): pantalla completa, el sauce crece con tus datos
   y se pueden tocar las cosas: un hilo (concepto), un piso (misiones), las raíces (bases), la maceta, el cristal (Camino al 7)
   y las otras torres a lo lejos. Ruta: #/torre/<ramo>. Usa NexoWillowTower (el dibujo) y NexoClassroom (los datos). */
(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const ORDER = ['organica', 'analitica', 'fisico', 'fisio'];
  const ADVICE = {
    semilla: 'Todavía no lo ves. Parte por su misión: el hilo aparece en cuanto respondes algo.',
    brote: 'Lo reconoces con ayuda. Se pone <b>verde</b> cuando lo produces tú solo, por ejemplo al escribirlo.',
    clara: 'Casi: lo resolviste con ayuda. Se pone <b>verde</b> cuando lo produces tú solo.',
    verde: 'Lo produces por tu cuenta. Le sale <b>farolito</b> si lo recuerdas sin ayuda 24 horas o más después.',
    intensa: 'Lo usas en casos nuevos. Le sale <b>farolito</b> si lo recuerdas sin ayuda 24 horas o más después.',
    flor: '¡Retenido! Brilla como farolito. Seguirá apareciendo de vez en cuando en la ronda para no olvidarlo.',
    amarilla: 'Acertaste, pero dudando. Repásalo pronto para afirmarlo.',
    seca: 'Se está olvidando: hoy le toca repaso. Una ronda corta lo vuelve a poner verde.'
  };
  let current = null;
  function cleanup() { current?.tower?.destroy(); current?.off?.(); current = null; document.body.classList.remove('in-willow'); }

  /* Junta todas las clases de la PEP del ramo (Orgánica: Aminas + Aromaticidad + SEA) en un solo sauce. */
  function data(ctx) {
    const list = (ctx.classes || (ctx.cls ? [ctx.cls] : [])).filter(Boolean), NX = window.NexoClassroom, E = window.NexoClassEvidence;
    if (!list.length || !NX) return null;
    const state = ctx.getState(), api = { getState: () => state };
    const sess = cls => { const s = state.classSessions?.[cls.id] || { answers: {} }; s.answers ||= {}; return s; };
    const concepts = [], roots = [], leaves = {}, missions = [];
    let done = 0, total = 0, started = false, earned = 0, max = 0, mastered = true;
    for (const cls of list) {
      const s = sess(cls), w = NX.willowOf(cls, api, s), lv = E ? E.leaves(cls, E.storeFor(state, cls.id)) : {};
      for (const c of cls.concepts || []) { leaves[`${cls.id}:${c.id}`] = lv[c.id]; (c.root ? roots : concepts).push({ c, cls }); }
      for (const m of cls.missions) { const items = NX.itemsOf(m), dn = items.filter(({ item }) => s.answers[item.id]).length; done += dn; total += items.length; missions.push({ m, cls, pct: items.length ? Math.round(dn / items.length * 100) : 0 }); }
      if (w.stage >= 1) started = true;
      const g = NX.goalOf(cls, s); if (g) { earned += g.earned; max += g.max; if (g.earned < g.max - 1e-9) mastered = false; } else mastered = false;
    }
    const map = { semilla: 'none', brote: 'bud', clara: 'bud', verde: 'green', intensa: 'green', flor: 'flower', amarilla: 'yellow', seca: 'dry' };
    const states = concepts.map(({ c, cls }) => map[leaves[`${cls.id}:${c.id}`]?.shown] || 'none');
    const stage = !started ? 0 : mastered ? 6 : Math.min(5, 1 + 4 * (total ? done / total : 0));
    const rootsShown = roots.length ? roots.filter(({ c, cls }) => leaves[`${cls.id}:${c.id}`] && leaves[`${cls.id}:${c.id}`].shown !== 'semilla').length / roots.length : 1;
    const green = states.filter(x => x === 'green' || x === 'flower').length, lit = states.filter(x => x === 'flower').length;
    const w = { stage, states, roots: started ? Math.max(0.3, rootsShown) : 0, green, lit, total: states.length,
      floor: stage >= 6 ? 'el sauce rompió el techo' : stage >= 2 ? `piso ${Math.min(4, Math.floor(stage - 1))} de 4` : stage >= 1 ? 'semilla y raíces' : 'torre dormida' };
    const per = Math.max(1, Math.ceil(missions.length / 4));
    const floors = [0, 1, 2, 3].map(k => missions.slice(k * per, (k + 1) * per));
    const main = list[0], s = sess(main);
    return { list, main, s, w, concepts, roots, leaves, floors, goal: { earned, max, total: main.goal?.total || max } };
  }

  function render(app, ctx) {
    cleanup();
    const subj = ctx.subject, look = window.NexoWillowTower.forSubject(subj.id), d = data(ctx);
    document.body.classList.add('in-willow');
    const i = ORDER.indexOf(subj.id), prev = ORDER[(i + 3) % 4], next = ORDER[(i + 1) % 4], name = id => ctx.subjectName(id);
    app.innerHTML = `<section class="wv" style="--acc:${esc(look.color)}" aria-label="Torre de ${esc(subj.name)}">
      <div class="wv-stage"><canvas class="wv-canvas" width="256" height="192" role="img" aria-label="${esc(d ? `Tu sauce en la torre de ${subj.name}: ${d.w.floor}` : `Torre de ${subj.name}, dormida`)}"></canvas></div>
      <header class="wv-top">
        <button class="wv-btn" data-wv="back">← Salir</button>
        <div class="wv-title"><b>Torre de ${esc(subj.name)}</b><span>${esc(d ? `${d.w.floor} · ${d.w.green} de ${d.w.total} hilos verdes${d.w.lit ? ` · ${d.w.lit} farolitos` : ''}` : 'dormida: su clase está en preparación')}</span></div>
        <div class="wv-switch"><button class="wv-btn" data-wv="go" data-id="${prev}" aria-label="Torre de ${esc(name(prev))}">◀</button><button class="wv-btn" data-wv="go" data-id="${next}" aria-label="Torre de ${esc(name(next))}">▶</button></div>
      </header>
      <p class="wv-hint" data-wv-hint>${d ? 'Toca un hilo, un piso, las raíces o el cristal.' : 'Toca las otras torres para visitarlas.'}</p>
      <aside class="wv-card" data-wv-card hidden></aside>
    </section>`;
    const canvas = app.querySelector('.wv-canvas'), card = app.querySelector('[data-wv-card]'), hint = app.querySelector('[data-wv-hint]');
    // Ancho del dibujo según la pantalla: más ancha que 4:3 → el paisaje sigue a los lados (sin recortar la torre).
    // Celular vertical: un lienzo angosto con la torre entera arriba y la tarjeta abajo.
    const fit = () => { const vw = innerWidth, vh = innerHeight, ar = vw / vh, tall = ar < 0.8;
      const W = ar > 4 / 3 ? Math.min(440, Math.round(192 * ar)) : tall ? 148 : 256;
      app.querySelector('.wv')?.classList.toggle('is-tall', tall);
      canvas.style.width = `${ar > 4 / 3 ? Math.max(vw, vh * W / 192) : tall ? vw : Math.min(vh * 4 / 3, vw * 2.32)}px`; return W; };
    const width = fit();
    const tower = window.NexoWillowTower.mount(canvas, { ...look, width, stage: d ? (d.s.willowSeen ?? d.w.stage) : 0, states: d ? d.w.states : [], roots: d ? d.w.roots : 0 });
    if (d) { tower.update({ stage: d.w.stage }); d.s.willowSeen = d.w.stage; }
    const toCanvas = ev => { const r = canvas.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * canvas.width, (ev.clientY - r.top) / r.height * 192]; };
    canvas.addEventListener('pointermove', ev => { if (ev.pointerType !== 'mouse') return; const sel = tower.pick(...toCanvas(ev)); tower.hover(sel); canvas.style.cursor = sel ? 'pointer' : 'default'; });
    canvas.addEventListener('pointerleave', () => tower.hover(null));
    canvas.addEventListener('click', ev => {
      const sel = tower.pick(...toCanvas(ev));
      if (sel?.kind === 'tower') return ctx.go(sel.id);
      tower.select(sel); show(sel);
    });
    function show(sel) {
      if (!sel) { card.hidden = true; hint.hidden = false; return; }
      hint.hidden = true; card.hidden = false; card.innerHTML = cardFor(sel, d, subj);
      card.querySelector('[data-wv="close"]')?.focus();
    }
    app.querySelector('.wv').addEventListener('click', ev => {
      const b = ev.target.closest('[data-wv]'); if (!b) return;
      const a = b.dataset.wv;
      if (a === 'back') return ctx.back();
      if (a === 'go') return ctx.go(b.dataset.id);
      if (a === 'close') { tower.select(null); show(null); return; }
      if (a === 'open' && d) return ctx.openClass(b.dataset.cls || d.main.id, { path: b.dataset.path || null, mission: b.dataset.mission || null, panel: b.dataset.panel || null });
    });
    let resizeT = 0;
    const onResize = () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (Math.abs(fit() - width) > 8) ctx.rerender?.(); }, 200); };
    addEventListener('resize', onResize);
    const onKey = ev => { if (ev.key === 'Escape') { if (!card.hidden) { tower.select(null); show(null); } else ctx.back(); } };
    document.addEventListener('keydown', onKey);
    current = { tower, off: () => { document.removeEventListener('keydown', onKey); removeEventListener('resize', onResize); } };
    ctx.saveState?.();
  }

  function cardFor(sel, d, subj) {
    const close = '<button class="wv-btn wv-close" data-wv="close" aria-label="Cerrar">✕</button>';
    if (!d) return `${close}<h3>Torre dormida</h3><p>La clase de ${esc(subj.name)} todavía está en preparación. Cuando esté lista, aquí crecerá su sauce.</p>`;
    const btn = (label, attrs, primary) => `<button class="wv-btn ${primary ? 'is-primary' : ''}" data-wv="open" ${attrs}>${label}</button>`;
    if (sel.kind === 'strand') {
      const e = d.concepts[sel.idx]; if (!e) return close;
      const c = e.c, k = `data-cls="${esc(e.cls.id)}"`, l = d.leaves[`${e.cls.id}:${c.id}`] || { shown: 'semilla', label: 'Sin ver' }, m = e.cls.missions.find(x => x.id === c.mission);
      const review = ['amarilla', 'seca', 'verde', 'intensa'].includes(l.shown);
      return `${close}<p class="wv-eyebrow">Hilo del sauce · ${esc(e.cls.title)}</p><h3>${esc(c.title)}</h3>
        <p class="wv-leaf is-${esc(l.shown)}"><i aria-hidden="true"></i>${esc(l.label)}</p><p>${ADVICE[l.shown] || ''}</p>
        <div class="wv-row">${m ? btn(`Ir a ${esc(m.title)} ▸`, `${k} data-path="misiones" data-mission="${esc(m.id)}"`, !review) : ''}${review ? btn('Ronda del alba ▸', `${k} data-path="alba"`, true) : ''}</div>`;
    }
    if (sel.kind === 'floor') {
      const f = d.floors[sel.k] || [], open = d.w.stage >= 1.6 + sel.k - 0.3;
      return `${close}<p class="wv-eyebrow">Piso ${sel.k + 1} de 4 · ${open ? 'abierto' : 'en penumbra'}</p><h3>${f.length ? f.map(x => esc(x.m.title)).join(' y ') : 'Piso vacío'}</h3>
        <ul class="wv-list">${f.map(x => `<li><span>${esc(x.m.title)}${d.list.length > 1 ? ` <small>· ${esc(x.cls.title)}</small>` : ''}</span><span class="wv-bar"><i style="width:${x.pct}%"></i></span><b>${x.pct} %</b>${btn('Abrir ▸', `data-cls="${esc(x.cls.id)}" data-path="misiones" data-mission="${esc(x.m.id)}"`)}</li>`).join('')}</ul>
        <p class="wv-note">${open ? 'El tronco ya pasó por aquí: estas misiones sostienen sus ramas.' : 'Responde actividades de estas misiones y el sauce subirá hasta este piso.'}</p>`;
    }
    if (sel.kind === 'roots' || sel.kind === 'pot') {
      const started = d.w.stage >= 1;
      if (sel.kind === 'pot' && !started) return `${close}<p class="wv-eyebrow">La maceta</p><h3>Planta la semilla</h3><p>El diagnóstico "¿Por dónde empiezo?" planta tu sauce: lo que ya sabes aparece como raíces.</p><div class="wv-row">${btn('Hacer el diagnóstico ▸', `data-cls="${esc(d.main.id)}" data-path="diagnostico"`, true)}</div>`;
      return `${close}<p class="wv-eyebrow">Raíces · lo que necesitas de antes</p><h3>Tus bases</h3>
        <ul class="wv-list">${d.roots.map(({ c, cls }) => { const l = d.leaves[`${cls.id}:${c.id}`] || { shown: 'semilla', label: 'Sin ver' }; return `<li><span>${esc(c.title)}</span><span class="wv-leaf is-${esc(l.shown)}"><i aria-hidden="true"></i>${esc(l.label)}</span></li>`; }).join('')}</ul>
        <div class="wv-row">${d.list.map(cls => btn(`Repaso desde cero${d.list.length > 1 ? ` · ${esc(cls.title)}` : ''} ▸`, `data-cls="${esc(cls.id)}" data-path="base"`, true)).join('')}</div>`;
    }
    if (sel.kind === 'crystal') {
      const g = d.goal; if (!g) return close;
      const pts = n => (Math.round(n * 10) / 10).toLocaleString('es-CL');
      return `${close}<p class="wv-eyebrow">El cristal de la torre · Camino al 7</p><h3>${pts(g.earned)} de ${g.total} puntos demostrados</h3>
        <p>Cuando demuestres los ${pts(g.max)} puntos que preparan ${d.list.map(c => esc(c.title)).join(', ')}, el sauce <b>rompe el techo</b> y el cristal flota sobre su copa.</p>
        <div class="wv-row">${d.list.map(cls => btn(`Qué me falta${d.list.length > 1 ? ` · ${esc(cls.title)}` : ''} ▸`, `data-cls="${esc(cls.id)}" data-panel="goal"`, true)).join('')}${btn('Simulacro ▸', `data-cls="${esc(d.main.id)}" data-path="simulacro"`)}</div>`;
    }
    return close;
  }

  window.NexoWillowView = Object.freeze({ render, cleanup });
})();
