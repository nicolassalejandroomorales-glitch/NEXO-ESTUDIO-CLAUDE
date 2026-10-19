/* La luz del Sótano (docs/clases-v2/SPEC.md): lo que pasa en la Cámara cuando estudias.
   - Escena final: al volver de una misión, si tu evidencia subió de verdad (acertaste sin ayuda), el frasco se llena, los cristales ganados
     se encienden con un anillo y suena una campanilla (solo si «Efectos de sonido» está encendido).
   - Grietas de errores: cada error abre una fisura brillante en el muro de la alcoba; acertar sin ayuda la deja «sellándose» y otro acierto,
     un día después, la sella. Tocar una grieta lleva a la misión de ese concepto.
   Se engancha a sotano.js con pocos puntos (beforeOpen, afterPaint, stop, hit, detail, list, note). Las funciones puras (cracks, ranks, reward)
   se prueban en tools/sotano-luz-test.cjs. */
(() => {
  'use strict';
  const SNAP = 'nexo-sotano-snap', DAY = 24 * 3600 * 1000, DURATION = 3600;
  // Dónde caen las grietas en el cuadro (320×200): los muros a los lados del arco, entre el pilar y la boca de la alcoba.
  const SLOTS = [[46, 100], [60, 118], [72, 102], [256, 102], [268, 120], [279, 100]];
  const slotsFor = node => (/(^|\.)c-?\d+$/.test(node) ? SLOTS : []);   // en las vistas de la mesa (cz) no hay grietas
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const envOf = G => ({ classes: window.NexoClasses, NX: window.NexoClassroom, E: window.NexoClassEvidence, state: G.ctx.getState() });
  const rankOf = (E, store, id) => E.LEAVES[E.leaf(store, id).key]?.rank ?? 0;

  // Conceptos de una misión: los que la declaran o, si no, los de sus ejercicios.
  function conceptsOf(cls, m, NX) {
    const own = (cls.concepts || []).filter(c => !c.root && c.mission === m.id).map(c => c.id);
    if (own.length) return own;
    return [...new Set((NX?.itemsOf?.(m) || []).map(x => x.item?.concept).filter(c => c && !String(c).startsWith('base.')))];
  }

  /* Grietas abiertas o sellándose de una alcoba (función pura). */
  function cracks(def, env) {
    const { classes, NX, E, state } = env, out = [];
    if (!E) return out;
    for (const classId of def.classes) {
      const cls = classes?.[classId]; if (!cls) continue;
      const store = E.storeFor(state, classId), titles = Object.fromEntries((cls.concepts || []).map(c => [c.id, c.title]));
      for (const m of cls.missions) for (const id of conceptsOf(cls, m, NX)) {
        const recs = store.records.filter(r => r.conceptId === id && !r.retry).sort((a, b) => String(a.at).localeCompare(String(b.at)));
        let lastWrong = -1; recs.forEach((r, i) => { if (!r.correct) lastWrong = i; });
        if (lastWrong < 0) continue;
        const after = recs.slice(lastWrong + 1).filter(r => r.correct && !r.hint);
        const state_ = !after.length ? 'open' : new Date(after[after.length - 1].at) - new Date(after[0].at) >= DAY ? 'sealed' : 'sealing';
        if (state_ !== 'sealed' && !out.some(c => c.conceptId === id && c.classId === classId)) out.push({ classId, conceptId: id, missionId: m.id, title: titles[id] || id, state: state_, at: recs[lastWrong].at });
      }
    }
    return out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  }

  /* Hoja (0 a 5) de cada concepto de la alcoba. */
  function ranks(def, env) {
    const { classes, E, state } = env, out = {};
    if (!E) return out;
    for (const classId of def.classes) {
      const cls = classes?.[classId]; if (!cls) continue;
      const store = E.storeFor(state, classId);
      for (const c of cls.concepts || []) if (!c.root) out[`${classId}:${c.id}`] = rankOf(E, store, c.id);
    }
    return out;
  }

  /* Qué subió entre dos fotos de la alcoba. Solo cuenta como premio acertar sin ayuda: algún concepto pasa a «hoja clara» o más. */
  function reward(before, after) {
    if (!before || !after || before.node !== after.node) return null;
    const jars = after.jars.map((lv, i) => (lv > (before.jars[i] ?? 0) ? i : -1)).filter(i => i >= 0);
    const crys = after.crys.map((st, i) => ((st ?? -1) > (before.crys[i] ?? -1) ? i : -1)).filter(i => i >= 0);
    const gained = Object.keys(after.ranks).filter(k => (before.ranks[k] ?? 0) < 2 && after.ranks[k] >= 2);
    return gained.length ? { jars, crys, gained: gained.length, from: before } : null;
  }

  const current = G => (G.alcove ? cracks({ classes: G.alcove.classes }, envOf(G)) : []);

  function snapshot(G) {
    const a = G.alcove, def = a && { classes: a.classes };
    return a ? { node: G.node, jars: a.jars.map(j => j.level), crys: a.crystals.map(c => c.state), ranks: ranks(def, envOf(G)) } : null;
  }

  /* ---- campanilla: una escala corta ascendente (Web Audio, sin archivos) ---- */
  function chime(G) {
    if (!G.ctx.getState().settings?.sound) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try {
      const ctx = new AC();
      [440, 523.25, 659.25, 783.99].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.17;
        o.type = 'sine'; o.frequency.value = f * 2; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.08, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0008, t + 1.1);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 1.2);
      });
      setTimeout(() => ctx.close?.(), 2200);
    } catch { /* sin audio: la escena igual se ve */ }
  }

  /* ---- dibujo (coordenadas del cuadro, 320×200) ---- */
  const px = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), w, h); };
  function drawCrack(c, x, y, state, seed, t) {
    const len = 26, sealing = state === 'sealing', hot = sealing ? ['#e0fcff', '#5cc4dc'] : ['#fff0a8', '#ff9a52'];
    const pulse = sealing ? 1 : 0.75 + 0.25 * Math.sin(t * 2.4 + seed);
    [[9, 0.05], [7, 0.08], [5, 0.12]].forEach(([w, a]) => { c.globalAlpha = a * pulse; px(c, x - Math.floor(w / 2), y, w, len, hot[1]); });
    c.globalAlpha = 1;
    let cx = Math.round(x);
    for (let i = 0; i < len; i++) {
      const r = (seed * 31 + i * 17) % 7; cx += r === 0 ? -1 : r === 1 ? 1 : 0;
      px(c, cx - 1, y + i, 4, 1, '#12080a'); px(c, cx, y + i, 2, 1, hot[i % 5 === 0 ? 0 : 1]);
    }
    if (sealing) for (let i = 2; i < len - 2; i += 5) px(c, cx + 1, y + i, 1, 2, hot[0]);
  }
  function ring(c, cx, cy, r, color, alpha) {
    c.globalAlpha = alpha; c.fillStyle = color;
    for (let a = 0; a < 28; a++) c.fillRect(Math.round(cx + Math.cos(a / 28 * 6.283) * r), Math.round(cy + Math.sin(a / 28 * 6.283) * r * 0.8), 1, 1);
    c.globalAlpha = 1;
  }

  /* Frascos y cristales con los niveles que se pidan (mismo recorte del atlas que sotano.js). */
  function drawBase(G, ov, atlas, a, levels, crys) {
    a.jars.forEach((jar, i) => { const e = ov.jars[i]; if (e) G.octx.drawImage(atlas, e.s[levels[i]][0], e.s[levels[i]][1], e.w, e.h, e.x, e.y, e.w, e.h); });
    a.crystals.forEach((c, i) => { const e = ov.crys[i], st = crys[i], at = e && st !== null && st !== undefined ? e.s[String(st)] : null; if (at) G.octx.drawImage(atlas, at[0], at[1], e.w, e.h, e.x, e.y, e.w, e.h); });
  }

  function drawCracks(G) {
    const list = current(G), slots = slotsFor(G.node), t = performance.now() / 1000;
    list.slice(0, slots.length).forEach((c, i) => drawCrack(G.octx, slots[i][0], slots[i][1], c.state, i + 3, t));
  }

  function animate(G, ov, atlas, rw) {
    const a = G.alcove, node = G.node, token = G.luz.token = (G.luz.token || 0) + 1, t0 = performance.now();
    const final = a.jars.map(j => j.level), finalCrys = a.crystals.map(c => c.state);
    G.el.over.classList.add('on');
    const tick = now => {
      if (!G.alive || G.node !== node || G.luz.token !== token) return;
      const p = Math.min(1, (now - t0) / DURATION);
      G.octx.clearRect(0, 0, 320, 200);
      const levels = final.map((lv, i) => (rw.jars.includes(i) ? Math.min(lv, (rw.from.jars[i] ?? 0) + Math.floor((lv - (rw.from.jars[i] ?? 0) + 1) * Math.min(1, p / 0.6))) : lv));
      const crys = finalCrys.map((st, i) => (rw.crys.includes(i) && p < 0.45 ? (rw.from.crys[i] ?? null) : st));
      drawBase(G, ov, atlas, a, levels, crys);
      rw.jars.forEach(i => { const e = ov.jars[i]; if (!e) return; for (let k = 0; k < 9; k++) { const u = (p * 1.6 + k / 9) % 1; G.octx.globalAlpha = (1 - u) * (1 - p * 0.6); px(G.octx, e.x + 4 + ((k * 7) % 14), e.y - u * 28, 2, 2, k % 2 ? '#ffd860' : '#9ce8f0'); } G.octx.globalAlpha = 1; });
      rw.crys.forEach(i => { const e = ov.crys[i]; if (e && p >= 0.45) { const q = (p - 0.45) / 0.55; ring(G.octx, e.x + e.w / 2, e.y + e.h / 2, 8 + q * 34, '#fff0a8', (1 - q) * 0.8); } });
      drawCracks(G);
      if (p < 1) G.raf = requestAnimationFrame(tick);
      else { G.luz.playing = false; G.octx.clearRect(0, 0, 320, 200); drawBase(G, ov, atlas, a, final, finalCrys); drawCracks(G); }
    };
    G.luz.playing = true; G.raf = requestAnimationFrame(tick);
  }

  /* ---- engancha con sotano.js ---- */
  const api = {
    cracks, ranks, reward, snapshot, slotsFor, SLOTS,
    // Al abrir una misión: foto de cómo está la alcoba, para comparar al volver.
    beforeOpen(G) { const s = snapshot(G); if (s) { try { sessionStorage.setItem(SNAP, JSON.stringify(s)); } catch { /* sin memoria: no hay escena */ } } },
    stop(G) { if (G.luz) { G.luz.token = (G.luz.token || 0) + 1; G.luz.playing = false; } },
    // Después de pintar frascos y cristales: grietas y, la primera vez al volver, la escena final.
    afterPaint(G, ov, atlas) {
      const luz = G.luz ||= { token: 0 };
      if (luz.playing) return;
      if (!luz.checked) {
        luz.checked = true;
        let before = null; try { before = JSON.parse(sessionStorage.getItem(SNAP) || 'null'); sessionStorage.removeItem(SNAP); } catch { /* ignorado */ }
        const after = snapshot(G), rw = before && after ? reward(before, after) : null;
        if (before && after && before.node === after.node) {
          luz.note = rw ? `¡Se encendió algo! ${rw.gained === 1 ? 'Un concepto pasó' : `${rw.gained} conceptos pasaron`} a hoja clara o más.` : 'Sin luz nueva: acertar sin ayuda es lo que enciende el frasco y los cristales.';
          G.el.live.textContent = luz.note;
          if (rw && !reduced()) { chime(G); animate(G, ov, atlas, rw); return; }
          if (rw) chime(G);
        }
      }
      drawCracks(G);
      const list = current(G);
      if (list.some(c => c.state === 'open') && !reduced()) {   // las grietas abiertas laten despacio
        const token = luz.token = (luz.token || 0) + 1, node = G.node;
        const tick = () => { if (!G.alive || G.node !== node || luz.token !== token || luz.playing) return; G.octx.clearRect(0, 0, 320, 200); drawBase(G, ov, atlas, G.alcove, G.alcove.jars.map(j => j.level), G.alcove.crystals.map(c => c.state)); drawCracks(G); setTimeout(() => { G.raf = requestAnimationFrame(tick); }, 90); };
        tick();
      }
      if (list.length) G.el.over.classList.add('on');
    },
    // Toque en el cuadro: ¿una grieta?
    hit(G, x, y) {
      const slots = slotsFor(G.node), n = current(G).length;
      for (let i = 0; i < Math.min(n, slots.length); i++) if (x >= slots[i][0] - 8 && x <= slots[i][0] + 8 && y >= slots[i][1] - 2 && y <= slots[i][1] + 30) return { kind: 'crack', i };
      return null;
    },
    detail(G, pick, esc) {
      const c = current(G)[pick.i]; if (!c) return '';
      return `<p class="sotano-detail"><b>Grieta · ${esc(c.title)}</b><br>${c.state === 'open' ? 'Fallaste este concepto: acíertalo sin ayuda para empezar a sellarla.' : 'Se está sellando: vuelve a acertarlo en unos días para cerrarla del todo.'}</p>
        <button class="pu-btn" data-open="${esc(c.classId)}" data-mission="${esc(c.missionId)}">Ir a su misión</button>`;
    },
    // En la ficha: lo que acaba de pasar y la lista de grietas (también para el teclado y el celular).
    list(G, esc) {
      const luz = G.luz || {}, all = current(G), items = all.slice(0, slotsFor(G.node).length || all.length);
      return `${luz.note ? `<p class="sotano-reward" role="status">${esc(luz.note)}</p>` : ''}${items.length ? `<ul class="sotano-cracks" aria-label="Errores por sellar">${items.map((c, i) => `<li><button class="sotano-crack" data-crack="${i}">${c.state === 'open' ? '⚡' : '✦'} ${esc(c.title)}<small>${c.state === 'open' ? 'abierta' : 'sellándose'}</small></button></li>`).join('')}</ul>` : ''}`;
    }
  };
  window.NexoSotanoLuz = api;
})();
