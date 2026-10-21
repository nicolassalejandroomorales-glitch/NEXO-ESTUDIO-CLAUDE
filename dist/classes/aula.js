/* El aula nueva (docs/clases-v2/SPEC.md): una misión jugada con el estilo de la estación (cristal oscuro, mascota que habla).
   La lógica (pasos, corrección, evidencia, FSRS) es la de player.js (window.NexoClassroom); aquí solo está la pantalla.
   NexoAula.mount(host, { cls, mission, api: { getState, saveState, track }, pet, onExit, onResult }) -> { destroy }.
   Camino: «Misiones» (hook → adivina → lección → práctica → encargo final → cierre). Cada acción cambia la sesión y se vuelve a dibujar el panel. */
(() => {
  'use strict';
  const NX = () => window.NexoClassroom, EV = () => window.NexoClassEvidence;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const md = v => esc(v).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const mdBubble = v => esc(v).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');   // dentro del globo, <b> es el nombre de la mascota
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const letter = i => String.fromCharCode(65 + i);
  const fmtNum = x => (Math.abs(x) >= 1e5 || (Math.abs(x) < 1e-3 && x !== 0) ? x.toExponential(2).replace('e', ' × 10^').replace('.', ',') : Number(x.toPrecision(4)).toLocaleString('es-CL'));
  const pts = n => (Math.round(n * 10) / 10).toLocaleString('es-CL');
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const keyIdeas = (item, text) => (item.keywords || []).map(k => ({ label: k.label, hit: k.any.some(word => norm(text).includes(norm(word))) }));
  const PHOTOS = new Map();   // fotos de la hoja en papel: solo en memoria, nunca se guardan
  const MOOD = { happy: ['feliz', 'wave'], worry: ['triste', 'rest'], think: ['concentrada', 'rest'], proud: ['deslumbrada', 'up'], idle: ['neutral', 'rest'] };

  // Mezcla fija por semilla (la misma pregunta se ve siempre igual, pero no en el orden de los datos).
  const hashStr = t => [...String(t)].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const shuffled = (list, seed) => { const a = [...list], rnd = mulberry(hashStr(seed)); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Los datos traen la correcta casi siempre primera: se muestran mezcladas (el índice guardado sigue siendo el del dato).
  // Si alguna alternativa depende del orden («todas las anteriores», «ambas»…), se respeta.
  const ORDER_BOUND = /\b(todas|ninguna de las|ambas|ambos|las dos|los dos|a y b|a y c|b y c)\b/i;
  const shownIdx = (options, seed) => { const idx = options.map((_, i) => i); return options.some(o => ORDER_BOUND.test(o.text)) ? idx : shuffled(idx, seed); };

  const actBtn = (item, retry, action, attrs, inner, cls = '', disabled = false) =>
    `<button class="${cls}" data-au="${action}" data-item="${esc(item.id)}" data-retry="${retry ? 1 : 0}" ${attrs} ${disabled ? 'disabled' : ''}>${inner}</button>`;
  const primary = (item, retry, action, label, disabled = false) => `<div class="au-check">${actBtn(item, retry, action, '', label, 'st-next', disabled)}</div>`;

  function recipeWhy(item, seq) {
    const bad = seq.find(id => !item.answer.includes(id));
    return bad ? (item.notes?.[bad] || 'Ese ingrediente no va en esta receta.') : (item.orderNote || 'Los ingredientes son correctos, pero el orden no.');
  }

  /* ───────── Alternativas ───────── */
  function optionsMarkup(s, item, { retry = false } = {}) {
    const record = retry ? s.retries[item.id] : s.answers[item.id];
    return `<ol class="au-options">${shownIdx(item.options, item.id).map((i, pos) => {
      const opt = item.options[i], picked = record?.choice === i;
      const tone = !record ? '' : picked ? (opt.correct ? 'ok' : 'bad') : (opt.correct && retry ? 'ok' : 'dim');
      return `<li><button class="st-opt au-opt ${tone}" data-au="answer" data-item="${esc(item.id)}" data-choice="${i}" data-retry="${retry ? 1 : 0}" ${record ? 'disabled' : ''}>
        <span class="au-letter">${letter(pos)}</span><span>${md(opt.text)}</span></button></li>`;
    }).join('')}</ol>`;
  }

  /* ───────── Actividades ───────── */
  function activityMarkup(cls, s, item, { retry = false } = {}) {
    const NXc = NX(), rec = NXc.recordOf(s, item, retry), w = NXc.workOf(s, item, retry), done = Boolean(rec);
    const figures = item.figures ? `<div class="au-figures">${item.figures.map(f => `<figure class="au-fig"><div>${window.NexoMolEditor?.sceneMarkup(f, { label: f.caption }) || ''}</div><figcaption>${md(f.caption)}</figcaption></figure>`).join('')}</div>` : '';
    if (!item.type || item.type === 'choice') return figures + optionsMarkup(s, item, { retry });
    const check = ready => (done ? '' : primary(item, retry, 'act-check', 'Comprobar ▸', !ready));
    const help = t => `<p class="au-help">${t}</p>`;

    if (item.type === 'order') {
      const seq = done ? rec.value : (w.seq ||= []);
      const pool = shuffled(item.cards, item.id).filter(c => !seq.includes(c.id));
      return `<div class="au-order">${help(esc(item.direction || 'Toca las tarjetas en orden.'))}
        <ol class="au-slots">${item.cards.map((_, i) => {
          const id = seq[i], card = item.cards.find(c => c.id === id), tone = done ? (item.answer[i] === id ? 'ok' : 'bad') : '';
          return `<li class="au-slot ${card ? 'full' : ''} ${tone}"><em>${i + 1}</em>${card ? actBtn(item, retry, 'act-unpick', `data-i="${i}"`, md(card.text), 'au-chip', done) : '<span class="au-empty">…</span>'}</li>`;
        }).join('')}</ol>
        ${pool.length ? `<div class="au-pool">${pool.map(c => actBtn(item, retry, 'act-pick', `data-card="${esc(c.id)}"`, md(c.text), 'au-chip')).join('')}</div>` : ''}
        ${done && !rec.correct && retry ? `<p class="au-solution">Orden correcto: ${item.answer.map(id => md(item.cards.find(c => c.id === id).text)).join(' &lt; ')}</p>` : ''}${check(seq.length === item.cards.length)}</div>`;
    }
    if (item.type === 'classify') {
      const assign = done ? rec.value : (w.assign ||= {});
      const loose = shuffled(item.cards, item.id).filter(c => !assign[c.id]);
      return `<div class="au-classify">${help(done ? 'Así quedó tu clasificación.' : 'Toca una tarjeta y luego el caldero donde va.')}
        ${loose.length ? `<div class="au-pool">${loose.map(c => actBtn(item, retry, 'act-sel', `data-card="${esc(c.id)}"`, md(c.text), `au-chip ${w.sel === c.id ? 'sel' : ''}`, done)).join('')}</div>` : ''}
        <div class="au-buckets">${item.buckets.map(bk => `<div class="au-bucket">
          ${actBtn(item, retry, 'act-drop', `data-bucket="${esc(bk.id)}"`, `<b>${esc(bk.label)}</b>`, `au-bucket-head ${w.sel && !done ? 'armed' : ''}`, done || !w.sel)}
          <div class="au-bucket-body">${item.cards.filter(c => assign[c.id] === bk.id).map(c => actBtn(item, retry, 'act-unassign', `data-card="${esc(c.id)}"`, md(c.text), `au-chip ${done ? (c.bucket === bk.id ? 'ok' : 'bad') : ''}`, done)).join('')}</div></div>`).join('')}</div>
        ${done && !rec.correct && retry ? `<p class="au-solution">${item.buckets.map(bk => `<b>${esc(bk.label)}:</b> ${item.cards.filter(c => c.bucket === bk.id).map(c => md(c.text)).join(', ')}`).join(' · ')}</p>` : ''}${check(loose.length === 0)}</div>`;
    }
    if (item.type === 'match') {
      const pairs = done ? rec.value : (w.pairs ||= {});
      const rights = shuffled(item.pairs.map((p, i) => ({ ...p, i })), item.id), usedRight = new Set(Object.values(pairs).map(Number));
      return `<div class="au-match">${help(done ? 'Así uniste los pares.' : 'Toca uno de la izquierda y luego su pareja de la derecha.')}
        <div class="au-match-cols"><div>${item.pairs.map((p, i) => {
          const r = pairs[i], tone = done ? (Number(r) === i ? 'ok' : 'bad') : '';
          return actBtn(item, retry, 'act-left', `data-i="${i}"`, `${r !== undefined ? `<span class="au-pair-n">${rights.findIndex(x => x.i === Number(r)) + 1}</span>` : ''}${md(p.left)}`, `au-chip ${w.left === i && !done ? 'sel' : ''} ${tone}`, done);
        }).join('')}</div>
        <div>${rights.map((p, k) => actBtn(item, retry, 'act-right', `data-i="${p.i}"`, `<span class="au-pair-n">${k + 1}</span>${md(p.right)}`, `au-chip ${usedRight.has(p.i) ? 'used' : ''}`, done || w.left === undefined)).join('')}</div></div>
        ${done && !rec.correct && retry ? `<p class="au-solution">${item.pairs.map(p => `${md(p.left)} → ${md(p.right)}`).join(' · ')}</p>` : ''}${check(Object.keys(pairs).length === item.pairs.length)}</div>`;
    }
    if (item.type === 'poe') {
      // Predice, observa, explica: primero predices; después mueves la simulación y ves qué pasa.
      const sim = item.sim, val = done ? sim.max : (w.sim ?? sim.start), above = val > sim.threshold, pred = done ? rec.value.pred : w.pred;
      const predict = `${help(`<b>1. Predice.</b> ${md(item.predict)}`)}<ol class="au-options">${shownIdx(item.options, `${item.id}:p`).map((i, pos) => { const o = item.options[i];
        return `<li>${actBtn(item, retry, 'act-poe-pred', `data-choice="${i}" aria-pressed="${pred === i}"`, `<span class="au-letter">${letter(pos)}</span><span>${md(o.text)}</span>`,
          `st-opt au-opt ${pred === i ? (done ? (o.correct ? 'ok' : 'bad') : 'sel') : done && o.correct ? 'ok' : ''}`, done || pred !== undefined)}</li>`; }).join('')}</ol>`;
      if (pred === undefined && !done) return `<div class="au-poe">${predict}</div>`;
      const flask = `<svg class="au-flask" viewBox="0 0 120 150" aria-hidden="true"><path d="M45 10 h30 v40 l30 70 a10 10 0 0 1 -9 14 h-72 a10 10 0 0 1 -9 -14 l30 -70 z" class="au-flask-glass"/>
        <path d="M27 90 h66 l12 28 a10 10 0 0 1 -9 14 h-72 a10 10 0 0 1 -9 -14 z" class="au-flask-liquid"/>
        ${[...Array(9)].map((_, i) => `<circle class="au-flask-bubble" cx="${30 + (i * 37) % 60}" cy="125" r="${2 + (i % 3)}" style="animation-delay:${(i * .27).toFixed(2)}s"/>`).join('')}</svg>`;
      return `<div class="au-poe">${predict}
        <div class="au-sim ${above ? 'above' : ''}" data-sim="${esc(item.id)}" data-threshold="${sim.threshold}">
          ${help(`<b>2. Observa.</b> ${md(sim.label)}`)}
          <div class="au-sim-body">${flask}<div class="au-sim-ctrl">
            <label for="sim-${esc(item.id)}">${esc(sim.name)}: <b data-sim-val>${val} ${esc(sim.unit)}</b></label>
            <input id="sim-${esc(item.id)}" type="range" min="${sim.min}" max="${sim.max}" step="${sim.step || 1}" value="${val}" data-au-sim="${esc(item.id)}" data-retry="${retry ? 1 : 0}" ${done ? 'disabled' : ''}>
            <p class="au-sim-text" data-sim-text aria-live="polite">${md(above ? sim.above : sim.below)}</p></div></div></div>
        ${done ? '' : primary(item, retry, 'act-poe-done', '3. Ya observé: ¿acerté? ▸', !w.moved)}</div>`;
    }
    if (item.type === 'recipe') {
      // El caldero: eliges los ingredientes en orden; una poción mal hecha explica su error.
      const seq = done ? rec.value : (w.seq ||= []);
      return `<div class="au-recipe ${done ? (rec.correct ? 'ok' : 'bad') : ''}">
        ${help(`Partes de: <b>${md(item.base)}</b>. Toca los ingredientes en el orden en que se agregan (${item.answer.length} pasos).`)}
        <div class="au-cauldron"><svg viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="42" rx="62" ry="12" class="au-caul-rim"/><path d="M20 42 C 16 96 48 112 80 112 C 112 112 144 96 140 42 Z" class="au-caul-body"/>
          <ellipse cx="80" cy="44" rx="54" ry="8" class="au-caul-brew"/>${[...Array(5)].map((_, i) => `<circle class="au-caul-bub" cx="${44 + i * 18}" cy="44" r="${3 + (i % 2) * 2}" style="animation-delay:${(i * .35).toFixed(2)}s"/>`).join('')}
          ${done && !rec.correct ? '<g class="au-smoke"><circle cx="64" cy="22" r="14"/><circle cx="88" cy="14" r="18"/><circle cx="104" cy="26" r="12"/></g>' : ''}</svg>
          <ol class="au-slots">${item.answer.map((_, i) => { const id = seq[i], ing = item.ingredients.find(x => x.id === id);
            return `<li class="au-slot ${ing ? 'full' : ''} ${done ? (item.answer[i] === id ? 'ok' : 'bad') : ''}"><em>${i + 1}</em>${ing ? actBtn(item, retry, 'act-rc-del', `data-i="${i}"`, md(ing.label), 'au-chip', done) : '<span class="au-empty">…</span>'}</li>`; }).join('')}</ol></div>
        ${done ? '' : `<div class="au-pool">${item.ingredients.filter(x => !seq.includes(x.id)).map(x => actBtn(item, retry, 'act-rc-add', `data-card="${esc(x.id)}"`, md(x.label), 'au-chip', seq.length >= item.answer.length)).join('')}</div>
          ${primary(item, retry, 'act-check', 'Preparar la poción ▸', seq.length !== item.answer.length)}`}
        ${done ? `<p class="au-status ${rec.correct ? 'good' : 'bad'}">${rec.correct ? `¡La poción brilla! Obtuviste ${md(item.target)}.` : `La poción salió mal. ${md(recipeWhy(item, seq))}`}</p>` : ''}</div>`;
    }
    if (item.type === 'number') {
      const raw = done ? rec.value.raw : (w.text || ''), unit = done ? rec.value.unit : (w.unit || ''), num = done ? Number(rec.value.num) : NX().parseNum(raw);
      const trap = done && !rec.correct ? NX().trapOf(item, num) : null;
      const unitSel = item.units ? `<select class="au-unit" data-au-unit="${esc(item.id)}" data-retry="${retry ? 1 : 0}" aria-label="Unidad" ${done ? 'disabled' : ''}><option value="">unidad…</option>${item.units.map(u => `<option ${u === unit ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select>`
        : item.unit ? `<span class="au-unit-fixed">${esc(item.unit)}</span>` : '';
      return `<div class="au-num">${done ? '' : help('Resuélvelo (en papel si quieres) y escribe el resultado. Puedes usar coma decimal o notación 1,2e-3.')}
        <div class="au-num-row"><span>${md(item.label || 'Resultado')} =</span><input class="st-num au-num-input ${done ? (rec.correct ? 'ok' : 'bad') : ''}" inputmode="decimal" autocomplete="off" data-au-text="${esc(item.id)}" data-retry="${retry ? 1 : 0}" value="${esc(raw)}" aria-label="Tu resultado" ${done ? 'disabled' : ''}>${unitSel}</div>
        ${!done && w.warn ? `<p class="au-warn">Escribe un número (por ejemplo 0,0123 o 1,23e-2)${item.units ? ' y elige la unidad' : ''}.</p>` : ''}
        ${done ? `<p class="au-status ${rec.correct ? 'good' : 'bad'}">${rec.correct ? '¡Correcto!' : `Era <b>${esc(fmtNum(item.answer))} ${esc(item.unit || '')}</b>.`} ${trap ? md(trap.note) : !rec.correct && item.units && rec.value.unit !== item.unit && NX().numOk(item, num) ? 'El número estaba bien, pero la unidad no.' : ''}</p>
          ${item.solution ? `<ol class="au-steps">${item.solution.map(t => `<li>${md(t)}</li>`).join('')}</ol>` : ''}` : primary(item, retry, 'act-check', 'Comprobar ▸')}</div>`;
    }
    if (item.type === 'spot') {
      // El aprendiz se equivocó: encuentra el paso malo y corrígelo.
      const step = done ? rec.value.step : w.step, fixing = step === item.wrong;
      return `<div class="au-spot">${help(fixing && !done ? '<b>¡Ahí está!</b> Ahora elige cómo se corrige ese paso.' : 'Toca el paso donde se equivocó el aprendiz.')}
        <ol class="au-apprentice">${item.steps.map((t, i) => `<li>${actBtn(item, retry, 'act-spot', `data-i="${i}"`, `<span class="au-letter">${i + 1}</span><span>${md(t)}</span>`,
          `st-opt au-opt ${step === i ? (i === item.wrong ? 'ok' : 'bad') : done && i === item.wrong ? 'ok' : ''}`, done || fixing)}</li>`).join('')}</ol>
        ${done && step !== item.wrong ? `<p class="au-status bad">${md(item.stepNotes?.[step] || 'Ese paso está bien. Busca otro.')}</p>` : ''}
        ${fixing ? `${help(`<b>Corrección:</b> ${md(item.fix.question)}`)}<ol class="au-options">${shownIdx(item.fix.options, `${item.id}:f`).map((i, pos) => { const o = item.fix.options[i], picked = done && rec.value.fix === i;
          return `<li>${actBtn(item, retry, 'act-spot-fix', `data-choice="${i}"`, `<span class="au-letter">${letter(pos)}</span><span>${md(o.text)}</span>`, `st-opt au-opt ${picked ? (o.correct ? 'ok' : 'bad') : done && o.correct && retry ? 'ok' : ''}`, done)}</li>`; }).join('')}</ol>` : ''}</div>`;
    }
    if (item.type === 'build' || item.type === 'arrows') {
      const E = window.NexoMolEditor;
      return E ? E[item.type === 'build' ? 'buildMarkup' : 'arrowsMarkup'](item, w, { rec, retry, done, actBtn: (it, rt, action, attrs, inner, c, d) => actBtn(it, rt, action, attrs, inner, c.replace('cr-btn cr-primary', 'st-next').replace(/cr-btn|cr-small/g, 'au-mini'), d) }) : help('Cargando el editor…');
    }
    if (item.type === 'write') {
      const text = done ? rec.value.text : (w.text || '');
      if (!done && !w.revealed) return `<div class="au-write">${help('Escríbelo con tus palabras. Después verás la respuesta modelo y marcarás qué ideas tenías.')}
        <textarea class="au-textarea" data-au-text="${esc(item.id)}" data-retry="${retry ? 1 : 0}" rows="5" aria-label="Tu respuesta" placeholder="Explícalo como si se lo contaras a un compañero…">${esc(text)}</textarea>
        ${w.warn ? '<p class="au-warn">Escribe un poco más antes de comparar: una o dos frases bastan.</p>' : ''}
        <div class="au-check">${actBtn(item, retry, 'act-paper', '', '✎ Lo hice en papel', 'au-mini')}${actBtn(item, retry, 'act-reveal', '', 'Comparar con la respuesta modelo ▸', 'st-next')}</div></div>`;
      const checks = done ? rec.value.checks : (w.checks ||= item.rubric.map(() => false)), ideas = keyIdeas(item, text);
      const onPaper = done ? rec.value.paper : w.paper, photo = PHOTOS.get(item.id);
      const paper = onPaper ? `<div class="au-paper"><p class="au-help"><b>Lo resolviste en papel.</b> Pon tu hoja al lado de la respuesta modelo y marca, idea por idea, lo que sí escribiste.</p>
        ${photo ? `<img class="au-photo" src="${photo}" alt="Foto de tu hoja">` : ''}${done ? '' : `<label class="au-mini au-photo-btn">📷 ${photo ? 'Cambiar la foto' : 'Foto de tu hoja (opcional)'}<input type="file" accept="image/*" capture="environment" data-au-photo="${esc(item.id)}" hidden></label>
        <p class="au-note">La foto no se guarda ni se envía: solo se muestra aquí, mientras te corriges.</p>`}</div>` : '';
      const ideasHtml = !onPaper && ideas.length ? `<div class="au-ideas"><p class="au-eyebrow">${item.teach ? 'Lo que tu compañero entendió' : 'Ideas clave que encontré'}</p>
        ${ideas.map(k => `<span class="au-idea ${k.hit ? 'hit' : ''}">${k.hit ? '✓' : '○'} ${esc(k.label)}</span>`).join('')}
        <p class="au-note">${ideas.every(k => k.hit) ? '¡Mencionaste todas las ideas clave!' : 'Las ideas en gris no aparecieron con esas palabras. Revísalas en la respuesta modelo.'} (Solo busco palabras: tu autocorrección manda.)</p></div>` : '';
      return `<div class="au-write">${paper}${ideasHtml}<div class="au-write-cols">
        <div class="au-box"><p class="au-eyebrow">Tu respuesta</p><p>${esc(text)}</p></div><div class="au-box model"><p class="au-eyebrow">Respuesta modelo</p><p>${md(item.model)}</p></div></div>
        ${help(done ? 'Así te autocorregiste.' : 'Marca cada idea que <b>sí</b> estaba en tu respuesta. Sé honesto: esto mide lo que de verdad sabes.')}
        <ul class="au-rubric">${item.rubric.map((r, i) => `<li>${actBtn(item, retry, 'act-rub', `data-i="${i}" aria-pressed="${Boolean(checks[i])}"`, `<span class="au-rub-box" aria-hidden="true">${checks[i] ? '✓' : ''}</span><span>${md(r)}</span>`, `au-rub ${checks[i] ? 'on' : ''}`, done)}</li>`).join('')}</ul>
        ${done ? '' : primary(item, retry, 'act-check', 'Listo, así me fue ▸')}</div>`;
    }
    if (item.type === 'pick') {
      const val = done ? rec.value : null;
      const part = p => p.target
        ? actBtn(item, retry, 'act-target', `data-target="${esc(p.target)}" aria-label="${esc(item.targets[p.target].label)}"`, md(p.t), `au-target ${done ? (p.target === item.answer && (rec.correct || retry) ? 'ok' : p.target === val ? 'bad' : 'dim') : ''}`, done)
        : `<span class="au-formula-part">${md(p.t)}</span>`;
      return `<div class="au-pick">${done ? '' : help('Toca la parte de la molécula que responde la pregunta.')}
        ${(item.molecules || [item.parts]).map((parts, i) => `<div class="au-formula">${item.captions?.[i] ? `<span class="au-cap">${esc(item.captions[i])}</span>` : ''}<div>${parts.map(part).join('')}</div></div>`).join('')}</div>`;
    }
    return '';
  }

  function answerText(item, rec) {
    if (!item.type || item.type === 'choice') return item.options[rec.choice]?.text;
    if (item.type === 'pick') return item.targets[rec.value]?.label;
    if (item.type === 'order') return rec.value.map(id => item.cards.find(c => c.id === id)?.text).join(' < ');
    if (item.type === 'write') return 'tu respuesta escrita';
    if (item.type === 'number') return `${rec.value?.raw ?? ''} ${rec.value?.unit || item.unit || ''}`.trim();
    if (item.type === 'build') return 'tu dibujo';
    if (item.type === 'arrows') return 'tus flechas';
    if (item.type === 'poe') return item.options[rec.value.pred]?.text;
    if (item.type === 'recipe') return rec.value.map(id => item.ingredients.find(x => x.id === id)?.label).join(' → ');
    if (item.type === 'spot') return rec.value.step === item.wrong ? item.fix.options[rec.value.fix]?.text : `el paso ${rec.value.step + 1}`;
    return 'tu propuesta';
  }

  /* Por qué cada alternativa es verdadera o falsa, y la solución de lo que no es de alternativas. */
  function whyOthers(cls, item) {
    if (item.type && item.type !== 'choice') {
      let extra = '';
      if (item.type === 'pick') extra = `<ul>${Object.entries(item.targets).map(([id, t]) => { const mc = cls.misconceptions[t.misconception]; const reason = id === item.answer ? item.explain : (mc ? mc.why : t.note);
        return reason ? `<li class="${id === item.answer ? 'ok' : ''}"><b>${esc(t.label)}</b>${id === item.answer ? ' (correcta)' : ''}: ${md(reason)}</li>` : ''; }).join('')}</ul>`;
      else if (item.type === 'number') extra = `<p>Resultado: <b>${esc(fmtNum(item.answer))} ${esc(item.unit || '')}</b>.</p>${(item.traps || []).length ? `<ul>${item.traps.map(t => `<li>${esc(fmtNum(t.value))}: ${md(t.note)}</li>`).join('')}</ul>` : ''}`;
      else if (item.type === 'build') extra = window.NexoMolEditor?.solution(item) || '';
      else if (item.type === 'recipe') extra = `<p>Receta correcta: ${item.answer.map(id => md(item.ingredients.find(x => x.id === id).label)).join(' → ')}.</p>`;
      else if (item.type === 'poe') extra = `<p>${md(item.sim.above)}</p>`;
      else if (item.type === 'spot') extra = `<p>El error estaba en el paso ${item.wrong + 1}. ${md(item.fix.options.find(o => o.correct).text)}.</p>`;
      else if (item.type === 'order') extra = `<p>Orden correcto: ${item.answer.map(id => md(item.cards.find(c => c.id === id).text)).join(' &lt; ')}</p>`;
      return `<details class="au-why" open><summary>La explicación completa</summary><p>${md(item.explain)}</p>${extra}</details>`;
    }
    const rows = shownIdx(item.options, item.id).map((idx, pos) => {
      const o = item.options[idx], mc = cls.misconceptions[o.misconception], reason = o.correct ? item.explain : mc ? mc.why : o.note;
      return reason ? `<li class="${o.correct ? 'ok' : ''}"><b>${letter(pos)}. ${esc(o.text)}</b>${o.correct ? ' (correcta)' : ''}: ${md(reason)}</li>` : '';
    }).join('');
    return `<details class="au-why" open><summary>¿Por qué cada alternativa?</summary><ul>${rows}</ul></details>`;
  }

  /* ───────── Barra de confianza: antes de responder, qué tan seguro estás; con 60 % o menos, por qué ───────── */
  function confidenceMarkup(item, s) {
    const conf = s.conf[item.id], why = s.confWhy[item.id], set = conf !== undefined;
    const words = !set ? 'Mueve la barra' : conf <= 20 ? 'Estoy adivinando' : conf <= 60 ? 'Tengo dudas' : conf < 80 ? 'Bastante seguro' : 'Muy seguro';
    const tip = s.tips?.conf ? '' : `<p class="au-tip" role="note"><span aria-hidden="true">💡</span><span>Primera vez: <b>mueve la barra</b> según qué tan seguro estás antes de responder. No baja tu nota; sirve para saber si lo sabes de verdad o adivinaste.</span><button class="au-mini" data-au="tip" data-tip="conf">Entendido</button></p>`;
    return `${tip}<div class="au-conf ${set ? '' : 'unset'}">
      <label class="au-conf-label" for="conf-${esc(item.id)}">Antes de responder: ¿qué tan seguro estás? <b>${set ? `${conf} %` : ''}</b> <span>${words}</span></label>
      <input id="conf-${esc(item.id)}" class="au-conf-range" type="range" min="0" max="100" step="10" value="${set ? conf : 50}" data-au-conf="${esc(item.id)}" style="--v:${set ? conf : 50}%" aria-valuetext="${set ? `${conf} por ciento` : 'sin marcar'}">
      <div class="au-conf-scale" aria-hidden="true"><span>Adivino</span><span>Dudo</span><span>Seguro</span></div>
      ${set && conf <= 60 ? `<div class="au-conf-why" role="group" aria-label="¿Por qué no estás tan seguro? (opcional)"><span>¿Por qué? <small>(opcional)</small></span>
        ${Object.entries(EV()?.WHY || {}).map(([k, label]) => `<button class="au-chip ${why === k ? 'sel' : ''}" data-au="conf-why" data-why="${k}" data-item="${esc(item.id)}" aria-pressed="${why === k}">${label}</button>`).join('')}</div>` : ''}</div>`;
  }
  function confidenceResult(cls, item, rec) {
    if (!rec || rec.confidence === null || rec.confidence === undefined) return '';
    const c = rec.confidence, kind = rec.kind;
    const text = { solido: `Dijiste ${c} % y acertaste: <b>sólido</b>.`, alerta: `Dijiste ${c} % y no era así. <b>Este es el error más valioso</b>: creías saberlo. Lee la explicación con calma.`,
      fragil: `Acertaste, pero con ${c} %: <b>acierto frágil</b>. Cuenta menos y esta idea volverá antes.`, consciente: `Ya dudabas (${c} %): <b>bien detectado</b>. Ahora sabes qué reforzar.`, medio: `Dijiste ${c} %.` }[kind] || '';
    let route = '';
    if (!rec.correct || kind === 'fragil') {
      if (rec.why === 'pregunta') route = `<p class="au-route"><b>Dicho de otra forma:</b> ${md(item.plain || item.hint || item.explain)}</p>`;
      if (rec.why === 'adivino') route = '<p class="au-route">Adivinar está bien aquí: lo contamos como algo por aprender, no como sabido.</p>';
    }
    return `<div class="au-conf-result ${esc(kind)}"><p>${text}</p>${route}</div>`;
  }

  /* ───────── Diapositivas y bloques de lección ───────── */
  function slideMarkup(cls, n, large = false) {
    const img = cls.slideImages?.[n], slide = cls.slides?.[n];
    if (img) return `<img class="au-slide-img" src="${esc(img)}" alt="Diapositiva ${esc(n)}${slide ? `: ${esc(slide.title)}` : ''}" loading="lazy">${large && slide ? `<details class="au-notes"><summary>Lo que dice, en texto</summary><ul>${slide.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></details>` : ''}`;
    if (!slide) return `<div class="au-slide-text"><p>Diapositiva ${esc(n)}</p></div>`;
    return `<div class="au-slide-text"><h3>${esc(slide.title)}</h3><ul>${slide.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`;
  }
  const projection = (cls, n) => `<button class="au-projection" data-au="slides" data-slide="${esc(n)}" aria-label="Ver la diapositiva ${esc(n)} en grande"><span class="au-projection-label">Diapositiva ${esc(n)} · toca para ampliar</span>${slideMarkup(cls, n)}</button>`;

  /* ───────── Camino al 7, mini clase y clase a profundidad (paneles sobre la misión) ───────── */
  const goalMeter = goal => {
    const seg = (n, c, label) => `<span class="au-goal-seg ${c}" style="flex:${n}" title="${esc(label)}"></span>`;
    return `<div class="au-goal-meter" role="img" aria-label="Llevas ${pts(goal.earned)} de ${goal.total} puntos demostrados">
      ${goal.earned ? seg(goal.earned, 'won', 'Demostrado') : ''}${goal.max - goal.earned > 0 ? seg(goal.max - goal.earned, 'open', 'Por demostrar en esta clase') : ''}
      ${(goal.rest || []).map(r => seg(r.points, 'later', r.label)).join('')}</div>`;
  };
  function leafList(cls, api, filter = () => true) {
    const E = EV(); if (!E || !cls.concepts) return '';
    const all = E.leaves(cls, E.storeFor(api.getState(), cls.id));
    return `<ul class="au-leaves">${cls.concepts.filter(filter).map(c => { const l = all[c.id]; return `<li class="leaf ${esc(l.shown)}"><b>${esc(c.title)}</b><small>${esc(l.label)}</small></li>`; }).join('')}</ul>`;
  }
  function calibrationLine(cls, api) {
    const E = EV(); if (!E) return '';
    const bands = E.calibration(E.storeFor(api.getState(), cls.id).records).filter(x => x.n);
    return bands.length ? `<p class="au-note"><b>Tu calibración:</b> ${bands.map(x => `cuando dices ${x.label} %, aciertas ${x.right} de ${x.n}`).join(' · ')}.</p>` : '';
  }
  /* Más ayuda: si la explicación simple no alcanzó → mini clase; si quieres más → a profundidad. */
  function moreHelp(cls, blk, simpleShown) {
    const c = blk?.concept, mini = c && cls.mini?.[c], deepC = c && cls.deep?.[c];
    if (!mini && !deepC) return '';
    return `<div class="au-more">${mini && simpleShown ? `<button class="au-mini" data-au="mini" data-concept="${esc(c)}">¿Todavía no? Mini clase de 2 min</button>` : ''}${deepC ? `<button class="au-mini" data-au="deepclass" data-concept="${esc(c)}">Ver a profundidad ▸</button>` : ''}</div>`;
  }
  const optionRow = (o, i, ans, action) => `<li><button class="st-opt au-opt ${ans === undefined ? '' : i === ans ? (o.correct ? 'ok' : 'bad') : o.correct ? 'ok' : 'dim'}" data-au="${action}" data-i="${i}" ${ans === undefined ? '' : 'disabled'}><span class="au-letter">${letter(i)}</span><span>${md(o.text)}</span></button></li>`;
  function miniPanel(cls, s) {
    const c = s.miniC, m = cls.mini[c], title = (cls.concepts || []).find(k => k.id === c)?.title || c, step = s.miniStep || 0, last = m.steps.length + 1;   // 0 idea · 1..n pasos · n+1 pregunta
    let inner = '';
    if (step === 0) inner = `<p class="au-eyebrow">La idea</p><p class="au-big">${md(m.idea)}</p>`;
    else if (step <= m.steps.length) inner = `<p class="au-eyebrow">Paso ${step} de ${m.steps.length}</p><ol class="au-worked">${m.steps.slice(0, step).map((t, i) => `<li class="${i === step - 1 ? 'now' : ''}"><span>${i + 1}</span><p>${md(t)}</p></li>`).join('')}</ol>`;
    else {
      const ans = s.miniAns?.[c];
      inner = `<p class="au-eyebrow">¿Lo pillaste? (no cuenta para nada)</p><p class="au-q">${md(m.check.prompt)}</p><ol class="au-options">${m.check.options.map((o, i) => optionRow(o, i, ans, 'mini-ans')).join('')}</ol>
        ${ans === undefined ? '' : `<p class="au-route">${m.check.options[ans].correct ? `<b>¡Eso!</b> ${md(m.check.explain)}` : `${md(m.check.options[ans].note || '')} ${md(m.check.explain)} Si quieres, repasa los pasos o mira la versión a profundidad.`}</p>`}`;
    }
    const dots = `<div class="au-dots" aria-hidden="true">${[...Array(last + 1)].map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>`;
    const nav = `<div class="au-check"><button class="au-mini" data-au="mini-step" data-dir="-1" ${step > 0 ? '' : 'disabled'}>◂ Atrás</button>${step < last ? '<button class="st-next" data-au="mini-step" data-dir="1">Siguiente ▸</button>' : '<button class="st-next" data-au="panel-close">Volver a la clase ▸</button>'}</div>`;
    return { title: `Mini clase · ${title}`, body: `<div class="au-mini-class">${inner}${dots}${nav}</div>` };
  }
  function deepPanel(cls, s) {
    const c = s.deepC, d = cls.deep[c], ans = s.deepAns?.[c];
    const src = x => (x.slide ? `<button class="au-link" data-au="slides" data-slide="${x.slide}">${esc(x.label)}</button>` : `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`);
    return { title: `A profundidad · ${d.title}`, body: `<div class="au-deepclass">${d.sections.map(([h, t]) => `<section><h3>${esc(h)}</h3><p>${md(t)}</p></section>`).join('')}
      <section class="au-box"><p class="au-eyebrow">Desafío a fondo (no cuenta para tu nota)</p><p class="au-q">${md(d.challenge.prompt)}</p><ol class="au-options">${d.challenge.options.map((o, i) => optionRow(o, i, ans, 'deep-ans')).join('')}</ol>
        ${ans === undefined ? '' : `<p class="au-route">${d.challenge.options[ans].correct ? '<b>¡Exacto!</b> ' : `${md(d.challenge.options[ans].note || '')} `}${md(d.challenge.explain)}</p>`}</section>
      <p class="au-note"><b>Fuentes:</b> ${d.sources.map(src).join(' · ')}</p></div>` };
  }
  function goalPanel(cls, api, s) {
    const goal = NX().goalOf(cls, s);
    if (!goal) return { title: 'Tu camino al 7', body: '<p class="au-help">Esta clase todavía no tiene meta de puntos.</p>' };
    const mission = id => cls.missions.find(m => m.id === id);
    return { title: 'Tu camino al 7', body: `<p>Un <b>7</b> es tener los <b>${goal.total} puntos</b> de la ${esc(cls.evaluation)}. Esta clase te prepara para <b>${goal.max}</b>. Cada punto cuenta cuando lo <b>demuestras</b>: aciertas sin ayuda el caso estilo prueba de las misiones que lo preparan.</p>
      <div class="au-goal-big"><b>${pts(goal.earned)}</b><span>de ${goal.total} pts demostrados</span></div>${goalMeter(goal)}
      <p class="au-legend"><i class="won"></i> demostrado <i class="open"></i> por demostrar en ${esc(cls.title)} <i class="later"></i> otras clases</p>
      <ul class="au-goal-list">${goal.qs.map(q => `<li><div class="au-goal-row"><b>${esc(q.id)} · ${esc(q.label)}</b><span>${pts(q.earned)} / ${pts(q.points)} pts</span></div>
        <div class="au-meter"><span style="width:${q.points ? Math.round(q.earned / q.points * 100) : 0}%"></span></div>
        <div class="au-check">${q.missions.map(id => { const m = mission(id); return m ? `<button class="au-mini" data-au="mission" data-mission="${esc(m.id)}">${esc(m.title)} ▸</button>` : ''; }).join('')}</div></li>`).join('')}
        ${(goal.rest || []).map(r => `<li class="later"><div class="au-goal-row"><b>${esc(r.label)}</b><span>${pts(r.points)} pts · ${esc(r.note || '')}</span></div></li>`).join('')}</ul>
      <p class="au-eyebrow">Lo que sabes, concepto por concepto</p>
      ${cls.missions.map(m => `<div class="au-leaf-group"><b>${esc(m.title)}</b>${leafList(cls, api, c => c.mission === m.id)}</div>`).join('')}
      <div class="au-leaf-group"><b>Raíces (clase base)</b>${leafList(cls, api, c => c.root)}</div>${calibrationLine(cls, api)}
      <p class="au-note">Las misiones marcadas como <b>base</b> no dan puntos directos, pero sin ellas no se puede responder lo que sí los da. Y ojo: demostrarlo hoy no es dominarlo. Cuenta como <b>retenido</b> cuando lo repites sin ayuda 24 horas o más después.</p>` };
  }

  /* ───────── Cada momento de la misión: qué dice la mascota, qué se ve y qué botones hay ───────── */
  function moment(cls, api, s, b) {
    const say = { text: '', mood: 'idle' }, out = { say, body: '', actions: '' };
    const cont = (label = 'Continuar') => `<button class="st-next" data-au="next">${label} ▸</button>`;
    const NXc = NX(), E = EV();

    if (b.kind === 'say') {
      say.text = b.text; say.mood = b.mood === 'proud' ? 'proud' : 'idle'; out.actions = cont();
      // La mascota recuerda: un error típico de esta misión de otro día.
      const memo = b.intro && b.m && E && (() => { const today = new Date(); today.setHours(0, 0, 0, 0);
        const recs = E.storeFor(api.getState(), cls.id).records.filter(r => r.misconception && r.missionId === b.m.id && new Date(r.at) < today);
        return cls.misconceptions[recs[recs.length - 1]?.misconception] || null; })();
      if (memo) say.text += ` La última vez caíste en esto: **${memo.label}**. Hoy fíjate bien en eso.`;
      return out;
    }
    if (b.kind === 'offer') {
      say.text = '¡Acertaste todo el reto! Puedes saltarte la lección e ir directo a practicar, o escucharla igual.'; say.mood = 'proud';
      out.actions = `<button class="st-next" data-au="offer" data-skip="1">Saltar a la práctica ▸</button><button class="au-mini" data-au="offer" data-skip="0">Quiero la lección</button>`;
      return out;
    }
    if (b.kind === 'hook') {
      const h = b.m.stages.hook;
      say.text = h.sage || 'Antes de empezar, un caso real de tu carrera.'; say.mood = 'proud'; out.actions = cont('¡Vamos!');
      out.body = `<div class="au-card"><p class="au-eyebrow">Caso de farmacia</p><h3>${esc(h.title)}</h3>${h.scene ? `<div class="au-figure">${window.NexoMolEditor?.sceneMarkup(h, { label: h.title }) || ''}</div>` : ''}<p>${md(h.text)}</p></div>`;
      return out;
    }
    if (b.kind === 'detour') {
      const key = `${b.m.id}:${b.root}`, d = s.detour[key];
      if (d === undefined) {
        say.text = `Fallaste dos veces algo que se apoya en la misma base: **${b.bm.title}**. No es falta de esfuerzo; es una base que conviene afirmar. ¿Hacemos un repaso corto y volvemos a tu problema?`;
        out.actions = `<button class="st-next" data-au="detour" data-key="${esc(key)}" data-go="1">Sí, repasemos ▸</button><button class="au-mini" data-au="detour" data-key="${esc(key)}" data-go="0">Ahora no, sigo</button>`;
      } else { say.text = d ? 'Vamos al repaso: una explicación, dos ejercicios fáciles y de vuelta al problema.' : 'Seguimos. Cuando quieras, el repaso está en la clase: «Repaso desde cero».'; out.actions = cont(); }
      out.body = `<div class="au-card"><p class="au-eyebrow">Errores que guían · falta una base</p><h3>${esc(b.bm.title)}</h3><p>Estos errores tienen el mismo origen:</p><ul>${b.items.map(it => `<li>${md(it.prompt)}</li>`).join('')}</ul>
        <p class="au-note"><b>El desvío:</b> ${esc(b.bm.stages.explain[0].title)} → 2 ejercicios fáciles → vuelves a intentar el problema que fallaste.</p></div>`;
      return out;
    }
    if (b.kind === 'lesson' && b.block.kind === 'rule') {
      const r = b.block; say.text = `**${r.title}** quedó guardada en tu grimorio, en el recetario. Úsala como lista de chequeo en la prueba.`; say.mood = 'proud'; out.actions = cont();
      out.body = `<div class="au-card"><p class="au-eyebrow">Regla guardada en tu grimorio</p><h3>${esc(r.title)}</h3><ol class="au-rule">${r.steps.map(t => `<li>${md(t)}</li>`).join('')}</ol>${r.note ? `<p class="au-note">${md(r.note)}</p>` : ''}</div>`;
      return out;
    }
    if (b.kind === 'lesson' && b.block.kind === 'recipe') {
      const r = b.block; say.text = `**${r.title}** quedó guardada en tu grimorio. Volverá a probarte mañana: si la recuerdas, será tuya.`; say.mood = 'proud'; out.actions = cont();
      out.body = `<div class="au-card"><p class="au-eyebrow">Receta guardada en tu grimorio</p><h3>${esc(r.title)}</h3><dl class="au-rows">${[['Ingrediente base', r.base], ['Ingredientes mágicos', r.reagents], ['Condición', r.condition], ['Resultado', r.result]].filter(([, v]) => v)
        .map(([k, v]) => `<div><dt>${k}</dt><dd>${md(v)}</dd></div>`).join('')}</dl>${r.note ? `<p class="au-note">${md(r.note)}</p>` : ''}</div>`;
      return out;
    }
    if (b.kind === 'lesson') {
      const blk = b.block, deepKey = `deep-${blk.id}`, deep = s.revealed[deepKey], mw = blk.frames ? (s.work[`mech:${blk.id}`] ||= { i: 0 }) : null;
      say.text = `**${blk.title}.** ${blk.body}`; say.mood = 'idle';
      out.actions = `${blk.deeper ? `<button class="au-mini" data-au="deeper" data-key="${deepKey}" aria-expanded="${Boolean(deep)}">${deep ? 'Ocultar la explicación simple' : 'Explícame más simple'}</button>` : ''}${cont('Entendido')}`;
      const deepHtml = deep ? `<div class="au-deeper"><p class="au-eyebrow">Más simple, paso a paso</p><p>${md(blk.deeper)}</p></div>` : '';
      const more = moreHelp(cls, blk, deep);
      let card = '';
      if (mw) {
        const f = blk.frames[Math.min(mw.i, blk.frames.length - 1)];
        card = `<div class="au-card"><p class="au-eyebrow">Mecanismo · paso ${mw.i + 1} de ${blk.frames.length}</p><div class="au-mech-stage">${window.NexoMolEditor?.sceneMarkup(f, { arrows: f.arrows || [], label: f.caption }) || ''}</div>
          <p class="au-mech-caption" aria-live="polite">${md(f.caption)}</p>
          <div class="au-mech-controls" role="group" aria-label="Controles del mecanismo"><button class="au-mini" data-au="mech" data-dir="-1" ${mw.i > 0 ? '' : 'disabled'}>◂ Atrás</button>
            <button class="au-mini" data-au="mech" data-dir="play" aria-pressed="${Boolean(mw.playing)}">${mw.playing ? '❚❚ Pausa' : '▶ Reproducir'}</button>
            <button class="au-mini" data-au="mech" data-dir="1" ${mw.i < blk.frames.length - 1 ? '' : 'disabled'}>Siguiente paso ▸</button></div>
          <div class="au-dots" aria-hidden="true">${blk.frames.map((_, i) => `<i class="${i === mw.i ? 'on' : ''}"></i>`).join('')}</div>${deepHtml}${more}</div>`;
      } else if (blk.svg || blk.rows || blk.note || deep) {
        card = `<div class="au-card"><p class="au-eyebrow">${b.zero ? 'Desde cero' : 'Lección'} · ${esc(blk.title.replace(/^Desde cero: /, ''))}</p>${blk.svg ? `<div class="au-figure">${blk.svg}</div>` : ''}
          ${blk.rows ? `<dl class="au-rows">${blk.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}${blk.note ? `<p class="au-note">${md(blk.note)}</p>` : ''}${deepHtml}${more}</div>`;
      }
      if (!card && more) card = `<div class="au-card">${more}</div>`;
      out.body = `<div class="au-lesson">${blk.slide ? projection(cls, blk.slide) : ''}${card}</div>`;
      // Sin diapositiva ni figura (clase base): la explicación va escrita en la tarjeta y la mascota solo la presenta.
      if (!blk.slide && !blk.svg && !blk.rows && !mw) {
        say.text = `**${blk.title}.** Léelo con calma. Si algo no queda claro, pídeme la explicación simple.`;
        out.body = `<div class="au-card"><p class="au-eyebrow">${b.m?.concept ? 'Repaso desde cero' : b.zero ? 'Desde cero' : 'Lección'}</p><h3>${esc(blk.title.replace(/^Desde cero: /, ''))}</h3><p>${md(blk.body)}</p>${blk.note ? `<p class="au-note">${md(blk.note)}</p>` : ''}${deepHtml}${more}</div>`;
      }
      return out;
    }
    if (b.kind === 'step') {
      const w = b.worked || b.m.stages.worked, key = `${b.m.id}-w${b.i}`, hidden = b.step.ask && !s.revealed[key];
      say.text = hidden ? `Antes de mirar, piensa: ${b.step.ask}` : `Paso ${b.i + 1}. ${b.step.text}`;
      out.actions = hidden ? `<button class="st-next" data-au="reveal" data-key="${key}">Ya lo pensé, muéstrame ▸</button>` : cont();
      out.body = `<div class="au-card"><p class="au-eyebrow">Ejemplo resuelto</p><p class="au-prompt">${md(w.prompt)}</p><ol class="au-worked">${w.steps.map((st, i) => {
        if (i > b.i) return '';
        if (i === b.i && hidden) return `<li class="ask"><span>${i + 1}</span><p>¿…?</p></li>`;
        return `<li class="${i === b.i ? 'now' : ''}"><span>${i + 1}</span><p>${md(st.text)}</p></li>`; }).join('')}</ol></div>`;
      return out;
    }
    if (b.kind === 'question') {
      const item = b.item, record = s.answers[item.id], hint = s.hints[item.id];
      const pre = b.stage === 'pretest', noConf = pre;
      const label = item.teach ? 'Explícalo con tus palabras' : { diagnostic: 'Reto', pretest: 'Antes de enseñarte · adivina', practice: 'Práctica', challenge: 'Desafío', transfer: 'Encargo final', fix: 'Para corregir esa idea', detour: 'Repaso de la base' }[b.stage] || 'Pregunta';
      const lvTag = item.gen ? ` · ${esc(NXc.LEVELS[item.gen.level - 1])}` : '';
      if (!record) {
        say.text = item.teach ? 'Un estudiante se enredó con algo. ¿Se lo explicas tú? Explicar es la mejor forma de aprender.'
          : { diagnostic: 'Responde con lo que sabes.', pretest: 'Adivina sin miedo: esto no cuenta. Solo despierta la curiosidad.', practice: 'Tu turno. Si te trabas, pide una pista al Grimorio.', challenge: 'Este es más difícil. Confío en ti.',
            transfer: 'Un caso nuevo. Piensa como en la prueba.', fix: 'Un caso corto para corregir esa idea ahora mismo.', detour: 'Un ejercicio fácil de la base. Sin apuro.' }[b.stage] || 'Tu turno.';
      } else if (pre) {
        say.text = record.correct ? `¡Buena intuición! ${item.explain} Ahora verás por qué.` : 'No era esa, y está perfecto: ahora lo vas a descubrir. Fíjate bien en la explicación.';
        say.mood = record.correct ? 'proud' : 'idle'; out.actions = cont('A la lección');
      } else if (record.correct) {
        say.text = `${hint ? 'Bien, con una pista.' : record.kind === 'fragil' ? 'Bien, aunque dudabas.' : '¡Exacto, sin ayuda!'} ${item.explain}`; say.mood = 'proud'; out.actions = cont();
      } else {
        const mc = NXc.mcOf(cls, item, record);
        say.text = mc ? `**${mc.label}.** ${mc.why}` : `No del todo. ${window.NexoMolEditor?.feedback(item, record) || item.wrong || 'Lo revisaremos juntos en el rescate.'}`;
        say.mood = 'worry'; out.actions = cont();
      }
      const gated = !noConf && !record && s.conf[item.id] === undefined;
      out.body = `<article class="au-card ${record ? (record.correct ? 'right' : 'wrong') : ''}">
        <p class="au-eyebrow">${esc(label)}${lvTag} · ${b.n} de ${b.of}</p><p class="au-q">${md(item.prompt)}</p>
        ${hint && !record ? `<p class="au-hint"><b>Pista del Grimorio:</b> ${md(item.hint)}</p>` : ''}
        ${item.paper && !record ? '<p class="au-help">✎ Si prefieres, resuélvelo en papel como en la prueba y después escribe aquí lo esencial para autocorregirte con la pauta.</p>' : ''}
        ${record || noConf ? '' : confidenceMarkup(item, s)}
        <fieldset class="au-gate" ${gated ? 'disabled' : ''}>${gated ? '<p class="au-gate-note">Primero marca tu confianza en la barra.</p>' : ''}${activityMarkup(cls, s, item)}</fieldset>
        ${noConf ? '' : confidenceResult(cls, item, record)}${!noConf && record ? whyOthers(cls, item) : ''}
        ${item.slide ? `<button class="au-link" data-au="slides" data-slide="${esc(item.slide)}">Ver diapositiva ${esc(item.slide)}</button>` : ''}</article>`;
      return out;
    }
    if (b.kind === 'rescue') {
      const item = b.item, record = s.answers[item.id], retry = s.retries[item.id], mc = NXc.mcOf(cls, item, record);
      const prereqMission = mc?.prereq && NXc.missionById(cls, mc.prereq.mission);
      const block = prereqMission && NXc.blocksOf(prereqMission).find(x => x.id === mc.prereq.block), slideN = block?.slide || item.slide;
      if (!retry) { say.text = `Respondiste «${answerText(item, record)}». ${mc ? mc.why : (item.wrong || 'Miremos de nuevo, con calma.')} Mira la diapositiva y vuelve a intentarlo.`; say.mood = 'idle'; }
      else { say.text = retry.correct ? '¡Corregido! Así se aprende de un error.' : 'Todavía no. Vuelve a esta idea otro día: la repasaremos.'; say.mood = retry.correct ? 'proud' : 'worry'; out.actions = cont(); }
      out.body = `<div class="au-lesson">${slideN ? projection(cls, slideN) : ''}<article class="au-card"><p class="au-eyebrow">Rescate${mc?.prereq ? ` · repasa: ${esc(mc.prereq.title)}` : ''}</p><p class="au-q">${md(item.prompt)}</p>
        <fieldset class="au-gate">${activityMarkup(cls, s, item, { retry: true })}</fieldset>${retry ? whyOthers(cls, item) : ''}</article></div>`;
      return out;
    }
    // Cierre de la misión
    const scope = NXc.allItems(cls, s.mission).filter(({ item }) => s.answers[item.id]);
    const solo = scope.filter(({ item }) => s.answers[item.id].correct && !s.hints[item.id]).length, withHint = scope.filter(({ item }) => s.answers[item.id].correct && s.hints[item.id]).length;
    const wrong = scope.filter(({ item }) => !s.answers[item.id].correct), fixed = wrong.filter(({ item }) => s.retries[item.id]?.correct).length;
    const next = cls.missions[cls.missions.findIndex(m => m.id === s.mission) + 1];
    say.text = 'Buen trabajo, aprendiz. Lo que acertaste hoy muestra que lo entendiste. Para que sea tuyo de verdad, vuelve en uno o dos días y demuéstralo de nuevo sin ayuda.'; say.mood = 'proud';
    out.actions = `${next ? `<button class="st-next" data-au="mission" data-mission="${next.id}">Siguiente misión ▸</button>` : ''}<button class="au-mini" data-au="exit">Salir</button>`;
    const goal = NXc.goalOf(cls, s);
    const goalHtml = goal ? (() => { const here = goal.worth(s.mission), got = goal.won(s.mission);
      return `<div class="au-box"><p class="au-eyebrow">Camino al 7</p><div class="au-meter"><span style="width:${Math.round(goal.earned / Math.max(1, goal.total) * 100)}%"></span></div>
        <p>${here ? `Esta misión vale <b>${pts(here)} pts</b> de la PEP y demostraste <b>${pts(got)}</b>.` : 'Esta misión es <b>base</b>: no da puntos directos, pero sin ella no se puede responder lo que sí los da.'} En total llevas <b>${pts(goal.earned)} de ${goal.total}</b>.</p></div>`; })() : '';
    const store = E ? E.storeFor(api.getState(), cls.id) : null;
    const leaves = (cls.concepts || []).filter(c => !c.root && c.mission === s.mission).map(c => { const lf = store ? E.leaf(store, c.id) : null; return `<li class="leaf ${esc(lf?.shown || 'semilla')}"><b>${esc(c.title)}</b><small>${esc(lf?.label || 'Sin ver')}</small></li>`; }).join('');
    out.body = `<div class="au-card au-summary"><p class="au-eyebrow">Lo que demostraste</p>
      <dl class="au-count"><div><dt>Sin ayuda</dt><dd>${solo}</dd></div><div><dt>Con pista</dt><dd>${withHint}</dd></div><div><dt>Errores corregidos</dt><dd>${fixed}/${wrong.length}</dd></div></dl>${goalHtml}
      ${leaves ? `<div class="au-box"><p class="au-eyebrow">Tus hojas en esta misión</p><ul class="au-leaves">${leaves}</ul><p class="au-note">Las hojas se ponen <b>verdes</b> solo cuando produces la respuesta tú solo (escalón 5), por ejemplo al escribirla. Elegir entre alternativas deja un <b>brote</b>.</p></div>` : ''}
      <p class="au-note">Todavía no es dominio: cuenta como <b>retenido</b> cuando lo recuerdas sin ayuda 24 horas o más después.</p></div>`;
    return out;
  }

  /* ───────── La pantalla ───────── */
  function mount(host, opts) {
    const cls = opts.cls, api = opts.api, id = cls.id, NXc = NX();
    if (window.NexoClassSlides?.[id]) cls.slideImages = window.NexoClassSlides[id];   // imágenes reales del PPT
    const s = NXc.sessionFor(api, id);
    let destroyed = false, stopPet = () => {}, timer = 0, lastBeat = -1, slideOpen = null, panel = null;   // panel: 'goal' | 'mini' | 'deep'
    const mood = { expr: 'neutral', arm: 'rest', hopUntil: 0, hopFrom: 0, look: 0 };
    const petInfo = opts.pet || {};

    // La misión pedida: retoma donde quedaste (si no la terminaste).
    if (opts.mission && NXc.beats) {
      const resume = s.path === 'misiones' && s.mission === opts.mission && Number.isInteger(s.beat);
      s.path = 'misiones'; s.mission = opts.mission;
      const far = s.far[s.mission] || 0, n = NXc.beats(cls, s).length;
      s.beat = resume && s.beat >= 0 && s.beat < n ? s.beat : (far > 1 && far < n - 1 ? far : 1);
    }

    host.innerHTML = `<section class="st au"><canvas class="st-pet" width="40" height="44" aria-hidden="true"></canvas><div class="st-bubble" role="status"></div>
      <div class="st-panel au-panel"><div class="au-top"><span class="au-where"></span>${cls.goal ? '<button class="au-mini au-goal-btn" data-au="panel-goal" aria-label="Ver tu camino al 7"></button>' : ''}</div><div class="st-body au-body" aria-live="polite"></div><div class="au-actions"></div></div>
      <button class="st-exit" data-au="exit" aria-label="Salir de la misión">← Salir</button><div class="au-lightbox" hidden></div></section>`;
    const root = host.firstElementChild, bubble = root.querySelector('.st-bubble'), body = root.querySelector('.au-body'), actions = root.querySelector('.au-actions'), where = root.querySelector('.au-where'), lightbox = root.querySelector('.au-lightbox');
    if (window.NexoStation?.startPet) stopPet = window.NexoStation.startPet(root.querySelector('.st-pet'), petInfo, mood);

    const setMood = name => { const [expr, arm] = MOOD[name] || MOOD.idle; const now = performance.now(); Object.assign(mood, { expr, arm, hopFrom: now, hopUntil: name === 'happy' || name === 'proud' ? now + 700 : 0 }); };
    const rerender = () => { api.saveState(); draw(); };

    function draw() {
      if (destroyed) return;
      const list = NXc.beats(cls, s);
      s.beat = Math.max(0, Math.min(s.beat, list.length - 1));
      const b = list[s.beat];
      if (!['say', 'hook', 'question', 'lesson', 'step', 'offer', 'detour', 'rescue', 'close'].includes(b.kind)) { s.beat += 1; if (s.beat < list.length) return draw(); }
      if (s.mission) s.far[s.mission] = Math.max(s.far[s.mission] || 0, s.beat);
      const m = moment(cls, api, s, b), fresh = s.beat !== lastBeat;
      lastBeat = s.beat;
      // Sin tarjeta propia (narración, oferta…): el texto va en el panel y la mascota solo reacciona.
      const lonely = !m.body;

      const canHint = b.kind === 'question' && ['practice', 'challenge'].includes(b.stage) && !s.answers[b.item.id] && b.item.hint && !s.hints[b.item.id];
      const inTest = b.kind === 'question' && ['diagnostic', 'pretest', 'transfer', 'simulacro'].includes(b.stage);
      root.classList.toggle('is-assessment', inTest);
      root.querySelector('.st-pet').hidden = inTest;
      bubble.setAttribute('aria-label', 'Grimorio');
      bubble.hidden = lonely && !s.grimorioSay;
      bubble.innerHTML = `<b>Grimorio</b>${mdBubble(s.grimorioSay || (lonely ? '' : m.say.text))}${canHint ? '<button type="button" class="au-mini" data-grimorio-hint>Pedir pista al Grimorio</button>' : ''}`;
      if (lonely) m.body = `<div class="au-card au-say"><b>Grimorio</b><p>${md(m.say.text)}</p></div>`;
      if (!reduced() && fresh) bubble.animate([{ transform: 'scale(.92)', opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: .6 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, easing: 'ease-out' });
      setMood(s.mascotMood || m.say.mood);
      const mission = cls.missions.find(x => x.id === s.mission);
      where.textContent = mission ? `${cls.title} · Misión ${cls.missions.indexOf(mission) + 1} · ${mission.title}` : cls.title;
      const goalNow = NXc.goalOf(cls, s), goalBtn = root.querySelector('.au-goal-btn');
      if (goalBtn && goalNow) goalBtn.innerHTML = `<span aria-hidden="true">★</span> Camino al 7 · <b>${pts(goalNow.earned)}</b>/${goalNow.total}`;
      const keepScroll = !fresh && body.firstElementChild ? root.querySelector('.au-panel').scrollTop : 0;
      body.classList.toggle('still', !fresh);   // sin animación de entrada si solo cambió algo dentro del mismo momento
      body.innerHTML = m.body; actions.innerHTML = m.actions;
      if (fresh && !reduced()) body.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
      const scroller = root.querySelector('.au-panel'); scroller.scrollTop = fresh ? 0 : keepScroll;
      lightbox.hidden = slideOpen === null && panel === null;
      if (slideOpen !== null) lightbox.innerHTML = `<div class="au-lightbox-in"><header><b>Diapositiva ${esc(slideOpen)}</b><button class="au-mini" data-au="slides-close">Cerrar ✕</button></header>${slideMarkup(cls, slideOpen, true)}</div>`;
      else if (panel !== null) {
        const pan = panel === 'goal' ? goalPanel(cls, api, s) : panel === 'mini' && cls.mini?.[s.miniC] ? miniPanel(cls, s) : panel === 'deep' && cls.deep?.[s.deepC] ? deepPanel(cls, s) : null;
        if (!pan) panel = null; else lightbox.innerHTML = `<div class="au-lightbox-in au-panelbox" role="dialog" aria-modal="true" aria-label="${esc(pan.title)}"><header><b>${esc(pan.title)}</b><button class="au-mini" data-au="panel-close">Cerrar ✕</button></header><div>${pan.body}</div></div>`;
        lightbox.hidden = panel === null;
      }
      s.grimorioSay = ''; s.mascotMood = null; s.burst = null;
      window.NexoMolEditor?.mount(body, { work: (itemId, retry) => NXc.workOf(s, NXc.findItem(cls, itemId), retry), item: itemId => NXc.findItem(cls, itemId), commit: () => rerender() });
      clearTimeout(timer);
      const mw = b.kind === 'lesson' && b.block.frames ? s.work[`mech:${b.block.id}`] : null;
      if (mw?.playing) timer = setTimeout(() => { mw.i += 1; if (mw.i >= b.block.frames.length - 1) { mw.i = b.block.frames.length - 1; mw.playing = false; } rerender(); }, 3800);
      opts.onBeat?.(b, s);
      api.saveState();
      (body.querySelector('.au-opt:not(:disabled)') || actions.querySelector('.st-next'))?.focus({ preventScroll: true });
    }

    function onActivity(action, button, b) {
      const retry = button.dataset.retry === '1', item = NXc.findItem(cls, button.dataset.item);
      if (!item || NXc.recordOf(s, item, retry)) return;
      const w = NXc.workOf(s, item, retry);
      if (action === 'act-paper') { w.paper = true; w.revealed = true; w.warn = false; if (!String(w.text || '').trim()) w.text = '(Resuelto en papel)'; }
      else if (action === 'act-reveal') { const box = body.querySelector('.au-textarea'); if (box) w.text = box.value; if (String(w.text || '').trim().length < 25) w.warn = true; else { w.warn = false; w.revealed = true; } }
      else if (action === 'act-rub') { const i = Number(button.dataset.i); (w.checks ||= item.rubric.map(() => false))[i] = !w.checks[i]; }
      else if (action === 'act-poe-pred') w.pred = Number(button.dataset.choice);
      else if (action === 'act-rc-add') { if ((w.seq ||= []).length < item.answer.length) w.seq.push(button.dataset.card); }
      else if (action === 'act-rc-del') w.seq.splice(Number(button.dataset.i), 1);
      else if (action === 'act-pick') (w.seq ||= []).push(button.dataset.card);
      else if (action === 'act-unpick') w.seq.splice(Number(button.dataset.i), 1);
      else if (action === 'act-sel') w.sel = w.sel === button.dataset.card ? null : button.dataset.card;
      else if (action === 'act-drop' && w.sel) { (w.assign ||= {})[w.sel] = button.dataset.bucket; w.sel = null; }
      else if (action === 'act-unassign') delete w.assign[button.dataset.card];
      else if (action === 'act-left') w.left = Number(button.dataset.i);
      else if (action === 'act-right' && w.left !== undefined) {
        const pairs = (w.pairs ||= {}), r = Number(button.dataset.i);
        for (const k of Object.keys(pairs)) if (Number(pairs[k]) === r) delete pairs[k];
        pairs[w.left] = r; w.left = undefined;
      } else if (action === 'act-spot' && Number(button.dataset.i) === item.wrong) w.step = item.wrong;
      else if (action === 'act-check' && item.type === 'number' && (!Number.isFinite(NXc.parseNum(w.text)) || (item.units && !w.unit))) w.warn = true;
      else if (['act-target', 'act-check', 'act-poe-done', 'act-spot', 'act-spot-fix'].includes(action)) {
        const value = action === 'act-target' ? button.dataset.target : action === 'act-poe-done' ? { pred: w.pred } : action === 'act-spot' ? { step: Number(button.dataset.i) }
          : action === 'act-spot-fix' ? { step: item.wrong, fix: Number(button.dataset.choice) } : item.type === 'recipe' ? [...(w.seq || [])] : item.type === 'order' ? [...w.seq]
          : item.type === 'classify' ? { ...w.assign } : item.type === 'write' ? { text: String(w.text || '').slice(0, 2000), checks: [...(w.checks || [])], paper: Boolean(w.paper) }
          : item.type === 'number' ? { raw: String(w.text || '').slice(0, 40), num: NXc.parseNum(w.text), unit: w.unit || (item.units ? '' : item.unit || '') }
          : item.type === 'build' ? { graph: JSON.parse(JSON.stringify(w.graph || item.start || { atoms: [], bonds: [] })) } : item.type === 'arrows' ? [...(w.arrows || [])] : { ...w.pairs };
        const correct = NXc.isCorrect(item, value), record = { value, correct, at: new Date().toISOString() };
        if (retry) s.retries[item.id] = record;
        else { if (b.stage === 'diagnostic' || b.stage === 'transfer') delete s.hints[item.id]; s.answers[item.id] = NXc.withConfidence(s, item, { ...record, hint: Boolean(s.hints[item.id]), stage: b.stage }); }
        NXc.logEvidence(cls, s, api, id, b, item, retry ? s.retries[item.id] : s.answers[item.id], retry);
        s.mascotMood = correct ? 'happy' : 'worry'; api.track?.('class_answer', { class_id: id, correct, retry });
      }
      rerender();
    }

    function onClick(event) {
      const button = event.target.closest('[data-au]');
      if (!button || button.disabled) return;
      const action = button.dataset.au, list = NXc.beats(cls, s), b = list[s.beat];
      if (action === 'exit') { clearTimeout(timer); api.saveState(); return opts.onExit?.(s); }
      if (action === 'slides') { if (button.dataset.slide) slideOpen = button.dataset.slide; return draw(); }
      if (action === 'slides-close') { slideOpen = null; return draw(); }
      if (action === 'panel-close') { panel = null; slideOpen = null; return draw(); }
      if (action === 'panel-goal') { panel = 'goal'; slideOpen = null; return draw(); }
      if (action === 'mini') { slideOpen = null; panel = 'mini'; s.miniC = button.dataset.concept; s.miniStep = 0; return draw(); }
      if (action === 'mini-step') { s.miniStep = Math.max(0, (s.miniStep || 0) + Number(button.dataset.dir)); return rerender(); }
      if (action === 'mini-ans') { (s.miniAns ||= {})[s.miniC] = Number(button.dataset.i); return rerender(); }
      if (action === 'deepclass') { slideOpen = null; panel = 'deep'; s.deepC = button.dataset.concept; return draw(); }
      if (action === 'deep-ans') { (s.deepAns ||= {})[s.deepC] = Number(button.dataset.i); return rerender(); }
      if (action === 'deeper') { s.revealed[button.dataset.key] = !s.revealed[button.dataset.key]; return rerender(); }
      if (action === 'tip') { s.tips[button.dataset.tip] = true; return rerender(); }
      if (action === 'conf-why') { const k = button.dataset.item; s.confWhy[k] = s.confWhy[k] === button.dataset.why ? null : button.dataset.why; return rerender(); }
      if (action === 'mech') {
        const blk = b.block, mw = (s.work[`mech:${blk.id}`] ||= { i: 0 });
        if (button.dataset.dir === 'play') { mw.playing = !mw.playing; if (mw.playing && mw.i >= blk.frames.length - 1) mw.i = 0; } else { mw.playing = false; mw.i = Math.max(0, Math.min(blk.frames.length - 1, mw.i + Number(button.dataset.dir))); }
        return rerender();
      }
      if (action === 'mission') { panel = null; slideOpen = null; s.mission = button.dataset.mission; const far = s.far[s.mission] || 0, n = NXc.beats(cls, s).length; s.beat = far > 1 && far < n - 1 ? far : 1; if (s.beat > 1) s.grimorioSay = 'Retomamos donde quedaste la última vez.'; return rerender(); }
      if (action.startsWith('act-')) return onActivity(action, button, b);
      if (action === 'next') { if (NXc.beatDone(s, b)) { s.beat += 1; } return rerender(); }
      if (action === 'offer') { s.skipExplain[b.m.id] = button.dataset.skip === '1'; s.beat += 1; s.mascotMood = 'happy'; return rerender(); }
      if (action === 'detour') { s.detour[button.dataset.key] = button.dataset.go === '1'; s.beat += 1; s.mascotMood = 'happy'; return rerender(); }
      if (action === 'reveal') { s.revealed[button.dataset.key] = true; return rerender(); }
      if (action === 'answer') {
        const itemId = button.dataset.item, choice = Number(button.dataset.choice), retry = button.dataset.retry === '1', item = NXc.findItem(cls, itemId);
        if (!item) return;
        const correct = Boolean(item.options[choice]?.correct);
        if (retry) { if (s.retries[itemId]) return; s.retries[itemId] = { choice, correct, at: new Date().toISOString() }; }
        else { if (s.answers[itemId]) return; if (b.stage === 'diagnostic' || b.stage === 'transfer') delete s.hints[itemId]; s.answers[itemId] = NXc.withConfidence(s, item, { choice, correct, hint: Boolean(s.hints[itemId]), stage: b.stage, at: new Date().toISOString() }); }
        NXc.logEvidence(cls, s, api, id, b, item, retry ? s.retries[itemId] : s.answers[itemId], retry);
        s.mascotMood = correct ? 'happy' : 'worry'; api.track?.('class_answer', { class_id: id, correct, retry });
        return rerender();
      }
    }
    // El Grimorio ofrece pistas voluntarias. La mascota no modifica ayudas ni respuestas.
    bubble.addEventListener('click', event => {
      if (!event.target.closest('[data-grimorio-hint]')) return;
      const b = NXc.beats(cls, s)[s.beat];
      if (b?.kind === 'question' && ['practice', 'challenge'].includes(b.stage) && !s.answers[b.item.id] && b.item.hint && !s.hints[b.item.id]) {
        s.hints[b.item.id] = true; s.mascotMood = 'think'; s.grimorioSay = 'Te dejé una pista en la tarjeta. Esta respuesta contará como «con pista».';
      }
      rerender();
    });
    root.addEventListener('click', onClick);
    // La barra de confianza se marca al soltarla (también si se deja en 50 %) o con las flechas del teclado.
    const commitConf = event => {
      const range = event.target.closest?.('[data-au-conf]'); if (!range) return;
      const value = Number(range.value); if (s.conf[range.dataset.auConf] === value) return;
      s.conf[range.dataset.auConf] = value; rerender();
      root.querySelector(`[data-au-conf="${range.dataset.auConf}"]`)?.focus({ preventScroll: true });
    };
    root.addEventListener('change', commitConf); root.addEventListener('pointerup', commitConf);
    root.addEventListener('change', event => {   // foto de la hoja en papel: solo se muestra, nunca se guarda ni se envía
      const input = event.target.closest?.('[data-au-photo]'), file = input?.files?.[0]; if (!file) return;
      if (PHOTOS.get(input.dataset.auPhoto)) URL.revokeObjectURL(PHOTOS.get(input.dataset.auPhoto));
      PHOTOS.set(input.dataset.auPhoto, URL.createObjectURL(file)); draw();
    });
    root.addEventListener('input', event => {
      const range = event.target.closest('[data-au-conf]');
      if (range) { range.style.setProperty('--v', `${range.value}%`); const b = range.previousElementSibling?.querySelector('b'); if (b) b.textContent = `${range.value} %`; return; }
      const simEl = event.target.closest('[data-au-sim]');
      if (simEl) {
        const it = NXc.findItem(cls, simEl.dataset.auSim); if (!it) return;
        const w = NXc.workOf(s, it, simEl.dataset.retry === '1'), v = Number(simEl.value), above = v > it.sim.threshold, box = simEl.closest('[data-sim]');
        w.sim = v; w.moved = true; box.classList.toggle('above', above);
        box.querySelector('[data-sim-val]').textContent = `${v} ${it.sim.unit}`; box.querySelector('[data-sim-text]').innerHTML = md(above ? it.sim.above : it.sim.below);
        const doneBtn = box.parentElement.querySelector('[data-au="act-poe-done"]'); if (doneBtn) doneBtn.disabled = false;
        api.saveState(); return;
      }
      const t = event.target.closest('[data-au-text]');
      if (t) { const it = NXc.findItem(cls, t.dataset.auText); if (it) NXc.workOf(s, it, t.dataset.retry === '1').text = t.value; }
      const u = event.target.closest('[data-au-unit]');
      if (u) { const it = NXc.findItem(cls, u.dataset.auUnit); if (it) NXc.workOf(s, it, u.dataset.retry === '1').unit = u.value; }
      api.saveState();
    });
    root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { if (slideOpen !== null) { slideOpen = null; draw(); } else if (panel !== null) { panel = null; draw(); } else { api.saveState(); opts.onExit?.(s); } }
      if (event.key === 'Enter' && event.target.closest?.('.au-num-input')) root.querySelector('[data-au="act-check"]:not(:disabled)')?.click();
    });

    draw();
    return { destroy() { destroyed = true; clearTimeout(timer); stopPet(); host.innerHTML = ''; }, redraw: draw };
  }

  window.NexoAula = Object.freeze({ mount, shownIdx, shuffled });
})();
