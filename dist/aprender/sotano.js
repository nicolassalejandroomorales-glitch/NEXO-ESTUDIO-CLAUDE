/* Aprender = el Sótano de los Cristales (docs/aprender-pasillo/SPEC.md, "Implementación v1").
   Pasillo y Cámara de piedra en primera persona hechos con cuadros pre-renderizados (tools/aprender-pasillo/export_app.py):
   cada parada es un cuadro, cada tramo una tira de cuadros que se reproduce hacia adelante o al revés. Encima del cuadro
   se dibuja el estado real (frascos, cristales) con sprites. Datos: aprender/manifest.json + aprender/img/*.webp.
   Cada ramo tiene su Cámara (paradas con prefijo, p. ej. 'ana.c0'). Uso: NexoAprender.render(app, ctx).
   ctx: { getState, subjects, lessonTitle, loadClass, openLesson }. */
(() => {
  'use strict';
  const BASE = './aprender/';
  const S = window.NexoAprenderEstado;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const pt = text => (window.NexoPixelText ? window.NexoPixelText.render(text, { shadow: false }) : esc(text));
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(done => setTimeout(done, ms));
  const MEMORY = 'nexo-sotano-parada';
  const ICON = { fwd: '▲', back: '▼', turn: '↻', left: '◀', right: '▶', enter: '✦' };
  const KEYS = { ArrowUp: 'fwd', w: 'fwd', ArrowDown: 'turn', s: 'turn', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', Enter: 'enter', ' ': 'enter' };
  let manifestPromise = null;
  let live = null;

  const remember = node => { try { sessionStorage.setItem(MEMORY, node); } catch { /* sin memoria: arranca en la puerta de entrada */ } };
  const recall = () => { try { return sessionStorage.getItem(MEMORY); } catch { return null; } };

  function destroy() {
    if (!live) return;
    live.alive = false;
    cancelAnimationFrame(live.raf);
    document.removeEventListener('keydown', live.onKey);
    window.removeEventListener('resize', live.onResize);
    window.removeEventListener('hashchange', live.onHash);
    live = null;
  }

  function loadManifest() {
    manifestPromise ||= fetch(`${BASE}manifest.json`, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('manifest'); return r.json(); });
    manifestPromise.catch(() => { manifestPromise = null; });
    return manifestPromise;
  }

  function render(app, ctx) {
    destroy();
    app.innerHTML = `<section class="page sotano" aria-label="Sótano de los Cristales">
      <header class="sotano-top"><h1 class="sotano-title" data-s="title">Sótano de los Cristales</h1><span class="sotano-chip" data-s="chip" hidden></span></header>
      <div class="sotano-stage" data-s="stage" role="group" aria-label="Vista del Sótano">
        <canvas class="sotano-view" data-s="view" width="320" height="200" aria-hidden="true"></canvas>
        <canvas class="sotano-over" data-s="over" width="320" height="200" aria-hidden="true"></canvas>
        <div class="sotano-flash" data-s="flash" aria-hidden="true"></div>
        <div class="sotano-load" data-s="load" role="status"><span></span><p>Bajando al sótano…</p></div>
      </div>
      <p class="sotano-live" data-s="live" role="status" aria-live="polite"></p>
      <nav class="sotano-pad" data-s="pad" aria-label="Moverse por el sótano"></nav>
      <aside class="sotano-card" data-s="card" hidden></aside>
      <p class="sotano-hint">Toca los botones o el cuadro, o usa las flechas del teclado.</p>
    </section>`;
    const root = app.querySelector('.sotano');
    const el = Object.fromEntries([...root.querySelectorAll('[data-s]')].map(n => [n.dataset.s, n]));
    const G = { app, ctx, root, el, M: null, node: null, busy: false, alive: true, sheets: new Map(), idleToken: 0, raf: 0,
      vctx: el.view.getContext('2d'), octx: el.over.getContext('2d'), alcove: null, pick: null, ready: {}, loading: {} };
    G.vctx.imageSmoothingEnabled = false;
    G.octx.imageSmoothingEnabled = false;
    G.onKey = ev => {
      const dir = KEYS[ev.key];
      if (!dir || ev.ctrlKey || ev.metaKey || ev.altKey || /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
      if (dir === 'enter' && document.activeElement?.matches('button, a, input, select, textarea')) return; // con un botón enfocado, Enter ya lo activa
      ev.preventDefault();
      act(G, dir);
    };
    G.onResize = () => fit(G);
    G.onHash = () => { if (!/^#\/learn(\/|$)/.test(location.hash)) destroy(); };
    document.addEventListener('keydown', G.onKey);
    window.addEventListener('resize', G.onResize);
    window.addEventListener('hashchange', G.onHash);
    live = G;
    el.stage.addEventListener('pointerup', ev => onStage(G, ev));
    el.pad.addEventListener('click', ev => { const b = ev.target.closest('[data-move]'); if (b) act(G, b.dataset.move); });
    el.card.addEventListener('click', ev => onCard(G, ev));
    fit(G);
    loadManifest().then(M => {
      if (!G.alive) return;
      G.M = M;
      const saved = recall();
      return arrive(G, M.nodes[saved] ? saved : 'h0', true);
    }).then(() => { if (G.alive) el.load.hidden = true; })
      .catch(() => { if (G.alive) el.load.innerHTML = '<p>No se pudo bajar al sótano. Revisa tu conexión.</p><button class="pu-btn" data-retry>Reintentar</button>'; el.load.querySelector('[data-retry]')?.addEventListener('click', () => render(app, ctx)); });
    loadRamo(G, 'organica'); // trae el aula (calendario y cuenta regresiva de todas las puertas) y las clases de la primera Cámara
  }

  // El estado real necesita las clases de cada Cámara: se piden al llegar a su puerta o a ella.
  function loadRamo(G, ramo) {
    const ids = [...new Set(Object.values(S.ALCOVES).filter(a => a.ramo === ramo).flatMap(a => a.classes))];
    G.loading[ramo] ||= Promise.all(ids.map(id => Promise.resolve(G.ctx.loadClass(id)).catch(() => false))).then(() => {
      if (!G.alive) return;
      G.ready[ramo] = true;
      if (G.M && G.node) refresh(G);
    });
    return G.loading[ramo];
  }

  // El cuadro mantiene 16:10 y ocupa casi todo el alto libre (deja a la vista la fila de botones).
  // Los lienzos se agrandan a un múltiplo entero de 320×200 (píxeles parejos) y el navegador los ajusta al tamaño exacto.
  function fit(G) {
    const availW = Math.min(G.root.clientWidth || innerWidth, 1280), top = G.el.stage.getBoundingClientRect().top;
    const availH = Math.max(200, innerHeight - Math.max(top, 70) - 80);
    let w = Math.floor(Math.min(availW, availH * 1.6));
    const up = Math.ceil(w / 320) * 320;
    if (w >= 640 && up <= availW && w >= up * 0.88) w = up;   // casi un múltiplo entero: se usa justo ese (píxeles perfectos)
    G.el.stage.style.width = `${w}px`;
    G.el.stage.style.height = `${Math.floor(w / 1.6)}px`;
    const k = Math.max(1, Math.ceil(w / 320));
    if (k === G.k) return;
    G.k = k;
    for (const [canvas, ctx] of [[G.el.view, G.vctx], [G.el.over, G.octx]]) {
      const keep = document.createElement('canvas');
      keep.width = canvas.width; keep.height = canvas.height;
      keep.getContext('2d').drawImage(canvas, 0, 0);
      canvas.width = 320 * k; canvas.height = 200 * k;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(keep, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(k, 0, 0, k, 0, 0);
    }
  }

  // ---------- cuadros ----------
  function sheet(G, name) {
    let s = G.sheets.get(name);
    if (s) { G.sheets.delete(name); G.sheets.set(name, s); return s.promise; }
    const img = new Image();
    const promise = new Promise((ok, bad) => { img.onload = () => ok(img); img.onerror = () => { G.sheets.delete(name); bad(new Error(name)); }; });
    img.src = `${BASE}img/${name}.webp?v=${G.M.v}`;
    G.sheets.set(name, { img, promise });
    while (G.sheets.size > 14) G.sheets.delete(G.sheets.keys().next().value); // las hojas descomprimidas pesan: solo se guardan las recientes
    return promise;
  }

  function draw(G, img, i) {
    const { w, h, cellH, cols } = G.M;
    G.vctx.drawImage(img, (i % cols) * w, Math.floor(i / cols) * cellH, w, h, 0, 0, w, h);
  }
  // Posición fraccionaria: el cuadro de abajo más el de arriba mezclado por la parte decimal. Así un tramo puede ir lento y verse continuo (no "a GIF").
  function drawAt(G, img, pos, n, reverse) {
    // La mezcla solo ocurre en la mitad del paso entre dos cuadros: así el giro no deja doble imagen y el movimiento sigue siendo continuo.
    const k = Math.min(n - 1, Math.floor(pos)), f = Math.min(1, Math.max(0, ((pos - k) - 0.25) / 0.5)), at = j => (reverse ? n - 1 - j : j);
    draw(G, img, at(k));
    if (f > 0.02 && k < n - 1) {
      G.vctx.globalAlpha = f;
      draw(G, img, at(k + 1));
      G.vctx.globalAlpha = 1;
    }
  }
  const smooth = p => 0.5 - 0.5 * Math.cos(Math.PI * p); // arranque y frenada suaves

  async function playClip(G, name, reverse) {
    const info = G.M.clips[name], n = info.n, img = await sheet(G, name), ms = info.ms || n * 130; // sin tiempos en el manifiesto: ritmo por defecto
    if (reduced()) { draw(G, img, reverse ? 0 : n - 1); return; }
    await new Promise(done => {
      const t0 = performance.now();
      const tick = now => {
        if (!G.alive) return done();
        const p = Math.min(1, (now - t0) / ms);
        drawAt(G, img, (info.ease ? smooth(p) : p) * (n - 1), n, reverse);
        if (p >= 1) done(); else G.raf = requestAnimationFrame(tick);
      };
      G.raf = requestAnimationFrame(tick);
    });
  }

  // Reposo: la parada respira (murales, antorchas, partículas) yendo y viniendo despacio entre unos cuadros, con mezcla.
  function idle(G) {
    const token = ++G.idleToken;
    if (reduced()) return;
    const info = G.M.clips[G.M.nodes[G.node].idle], off = info.off || 0;
    sheet(G, info.file || G.M.nodes[G.node].idle).then(img => {
      const n = G.M.idleN || 6, t0 = performance.now();
      const tick = now => {
        if (!G.alive || G.idleToken !== token) return;
        if (!document.hidden) {
          const cycle = (now - t0) / (G.M.idleMs || 280) % (2 * (n - 1)), pos = cycle <= n - 1 ? cycle : 2 * (n - 1) - cycle;
          drawAt(G, img, off + pos, off + n, false);
        }
        G.raf = requestAnimationFrame(tick);
      };
      G.raf = requestAnimationFrame(tick);
    }).catch(() => {});
  }

  async function flash(G, change) {
    G.el.flash.classList.add('on');
    await sleep(170);
    await change();
    G.el.flash.classList.remove('on');
  }

  // ---------- paradas ----------
  async function arrive(G, node, first) {
    G.idleToken++;
    G.pick = null;
    G.node = node;
    const info = G.M.clips[G.M.nodes[node].idle];
    const img = await sheet(G, info.file || G.M.nodes[node].idle);   // los reposos comparten hoja: 'off' = primer cuadro de esta parada
    if (!G.alive || G.node !== node) return;
    draw(G, img, info.off || 0);
    remember(node);
    refresh(G);
    idle(G);
    if (G.M.nodes[node].ramo) loadRamo(G, G.M.nodes[node].ramo);
    for (const m of G.M.nodes[node].moves) { // precarga: el siguiente tramo ya está listo cuando lo pidas
      const edge = m.to && G.M.edges.find(e => (e.a === node && e.b === m.to) || (e.b === node && e.a === m.to));
      const name = edge?.clip || m.clip;
      if (name) sheet(G, name).catch(() => {});
    }
    if (first) G.el.load.hidden = true;
  }

  function find(G, dir) { return G.M.nodes[G.node].moves.find(m => m.dir === dir); }

  async function act(G, dir) {
    if (!G.alive || !G.M || G.busy) return;
    const move = find(G, dir) || (dir === 'back' ? find(G, 'turn') : dir === 'turn' ? find(G, 'back') : null);
    if (!move) return;
    G.busy = true;
    G.idleToken++;
    clearOverlay(G);
    G.el.card.hidden = true;
    try {
      if (move.exit) {
        await flash(G, () => arrive(G, move.exit));
      } else if (move.clip) {
        await playClip(G, move.clip, false);              // se abre el portal y se entra
        await playClip(G, move.cam.clip, false);          // sale del remolino dentro de la Cámara
        await arrive(G, move.cam.node);
      } else {
        const edge = G.M.edges.find(e => (e.a === G.node && e.b === move.to) || (e.b === G.node && e.a === move.to));
        await playClip(G, edge.clip, edge.b === G.node);
        await arrive(G, move.to);
      }
    } catch {
      G.el.live.textContent = 'No se pudo cargar ese tramo. Revisa tu conexión.';
      await arrive(G, G.node);
    } finally { G.busy = false; }
  }

  // ---------- texto y botones de cada parada ----------
  function envOf(G) { return { classes: window.NexoClasses, NX: window.NexoClassroom, E: window.NexoClassEvidence, state: G.ctx.getState() }; }

  function refresh(G) {
    const node = G.M.nodes[G.node];
    const alcoveDef = S.alcoveOf(G.node);
    G.alcove = alcoveDef && G.ready[alcoveDef.ramo] ? S.alcove(alcoveDef, envOf(G)) : null;
    const inCamera = G.node.split('.').pop().startsWith('c');
    const subjectName = G.ctx.subjects.find(x => x.id === node.ramo)?.name;
    const title = inCamera ? `${subjectName}${node.name ? ' · ' + node.name : ''}` : node.name || (G.node.startsWith('b') || G.node.startsWith('q') ? 'Pasillo lateral · Próximo semestre' : 'Sótano de los Cristales');
    G.el.title.textContent = title;
    const exam = node.ramo ? window.NexoClassroom?.nextExam({ subject: node.ramo }, { getState: G.ctx.getState }) : null;
    G.el.chip.hidden = !exam;
    if (exam) G.el.chip.textContent = `${exam.title || 'Prueba'} ${exam.label}`;
    const order = ['fwd', 'left', 'right', 'enter', 'turn', 'back'];
    G.el.pad.innerHTML = [...node.moves].sort((x, y) => order.indexOf(x.dir) - order.indexOf(y.dir)).map(m => `<button class="pu-btn sotano-move" data-move="${m.dir}" data-dir="${m.dir}" aria-label="${esc(m.label)}"><i aria-hidden="true">${ICON[m.dir]}</i>${pt(m.label)}</button>`).join('');
    G.el.live.textContent = `${title}. ${node.moves.map(m => m.label).join(', ')}.`;
    renderCard(G);
    paintOverlay(G);
  }

  // ---------- estado real sobre el cuadro ----------
  function clearOverlay(G) {
    G.octx.clearRect(0, 0, 320, 200);
    G.el.over.classList.remove('on');
  }

  async function paintOverlay(G) {
    clearOverlay(G);
    const ov = G.M.overlay[G.node], a = G.alcove;
    if (!ov || !a || !a.jars.length) return;
    const node = G.node, atlas = await sheet(G, ov.atlas.replace(/\.webp$/, ''));
    if (!G.alive || G.node !== node) return;
    a.jars.forEach((jar, i) => {
      const e = ov.jars[i];
      if (e) G.octx.drawImage(atlas, e.s[jar.level][0], e.s[jar.level][1], e.w, e.h, e.x, e.y, e.w, e.h);
    });
    a.crystals.forEach((c, i) => {
      const e = ov.crys[i], at = e && c.state !== null ? e.s[String(c.state)] : null;
      if (at) G.octx.drawImage(atlas, at[0], at[1], e.w, e.h, e.x, e.y, e.w, e.h);
    });
    G.el.over.classList.add('on');
  }

  function onStage(G, ev) {
    if (!G.alive || !G.M || G.busy) return;
    const r = G.el.stage.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 320, y = (ev.clientY - r.top) / r.height * 200;
    const ov = G.M.overlay[G.node];
    if (ov && G.alcove?.jars.length) {
      const hit = (list, pad) => list.findIndex(e => e && x >= e.x - pad && x <= e.x + e.w + pad && y >= e.y - pad && y <= e.y + e.h + pad);
      const j = hit(ov.jars, 4), c = j < 0 ? hit(ov.crys, 3) : -1;
      if (j >= 0 || c >= 0) { G.pick = j >= 0 ? { kind: 'jar', i: j } : { kind: 'crystal', i: c }; renderCard(G); return; }
    }
    const want = y > 164 ? 'back' : x < 107 ? 'left' : x > 213 ? 'right' : 'fwd';
    const dir = find(G, want) ? want : want === 'back' && find(G, 'turn') ? 'turn' : want === 'fwd' && find(G, 'enter') ? 'enter' : null;
    if (dir) act(G, dir);
  }

  // ---------- ficha de la alcoba (también sirve en celular y con lector de pantalla) ----------
  function renderCard(G) {
    const a = G.alcove, card = G.el.card;
    if (!a) { card.hidden = true; return; }
    card.hidden = false;
    if (!a.classes.length) { card.innerHTML = `<h2>${esc(a.name)}</h2><p>${esc(S.summary(a))} Sus cristales se encienden cuando exista su clase.</p>`; return; }
    const pick = G.pick;
    let detail = '';
    if (pick?.kind === 'jar' && a.jars[pick.i]) {
      const j = a.jars[pick.i];
      detail = `<p class="sotano-detail"><b>Misión ${pick.i + 1} · ${esc(j.title)}</b><br>${j.done} de ${j.total} actividades respondidas.</p>
        <button class="pu-btn" data-open="${esc(j.classId)}" data-mission="${esc(j.missionId)}">${pt('Abrir esta misión')}</button>`;
    } else if (pick?.kind === 'crystal' && a.crystals[pick.i]) {
      const c = a.crystals[pick.i], label = { review: 'toca repasar', ok: 'al día' };
      detail = `<p class="sotano-detail"><b>Cristal ${pick.i + 1} · ${c.state === 0 ? 'apagado: toca repasar' : c.state === 1 ? 'encendido' : 'sin empezar'}</b></p>
        <ul class="sotano-concepts">${c.concepts.map(k => `<li data-state="${k.state || 'none'}">${esc(k.title)}<small>${label[k.state] || 'sin empezar'}</small></li>`).join('')}</ul>`;
    }
    card.innerHTML = `<h2>${esc(a.name)}</h2><p>${esc(S.summary(a))}</p>
      <ol class="sotano-jars" aria-label="Misiones">${a.jars.map((j, i) => `<li><button class="sotano-jar${pick?.kind === 'jar' && pick.i === i ? ' is-pick' : ''}" data-jar="${i}" aria-label="Misión ${i + 1}: ${esc(j.title)}, ${j.done} de ${j.total}"><span class="sotano-fill" style="--p:${j.level * 25}%"></span><b>${i + 1}</b></button></li>`).join('')}</ol>
      ${detail}
      <div class="sotano-actions">${a.classes.map(id => `<button class="pu-btn" data-open="${esc(id)}">${pt(('Clase: ' + G.ctx.lessonTitle(id)).slice(0, 36))}</button>`).join('')}</div>`;
  }

  function onCard(G, ev) {
    const open = ev.target.closest('[data-open]'), jar = ev.target.closest('[data-jar]');
    if (open) return G.ctx.openLesson(open.dataset.open, open.dataset.mission);
    if (jar) { G.pick = { kind: 'jar', i: Number(jar.dataset.jar) }; renderCard(G); }
  }

  window.NexoAprender = { render, destroy };
})();
