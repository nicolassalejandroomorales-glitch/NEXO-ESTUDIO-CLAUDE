/* Estación de clase (piloto Basicidad, org-01): Adivina → Clase → Práctica → Demuestra.
   Versión C "cristal-pantalla" de docs/clases-v2/SPEC.md: flota sobre la alcoba de la Cámara (dist/classes/camara.js), sin fondo propio. Habla la mascota REAL del usuario (PixelMascotas).
   Práctica y Demuestra usan el generador `basicidad` de org-01-gen.js: es la pregunta 3 de la PEP 1 (ordenar por basicidad, 1,0 punto).
   NexoStation.mount(host, { cls, gen, mission: 'm4', pet: { kind, name, outfit }, onResult(r), only: 'demuestra', demuestra: cls.demuestra[mission] }) -> { destroy, go }.
   Con `only: 'demuestra'` se monta solo la prueba final de una misión (formato PEP: un intento, reloj opcional, punto asegurado) con el generador que diga `cls.demuestra`.
   Evidencia: solo "Demuestra" (un intento, sin ayuda, con reloj opcional) cuenta como punto; el resto es práctica. */
(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const md = v => esc(v).replace(/(?<![\d.,])(-?\d+)\.(\d{1,2})(?![\d.,])/g, '$1,$2').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const title = text => `<h2 class="st-h">${esc(text)}</h2>`;
  const pickOne = list => list[Math.random() * list.length | 0];
  const fmt = n => String(n).replace('.', ',');
  const STEPS = ['Adivina', 'Clase', 'Práctica', 'Demuestra'];
  const EXAM_SECONDS = 90;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Estructuras dibujadas (como en la PEP) con RDKit, que se descarga solo la primera vez que hace falta (~7 MB, queda en caché). */
  const VENDOR = new URL('../vendor/rdkit/', document.currentScript?.src || document.baseURI + 'classes/').href;
  let rdkit = null;
  const loadRDKit = () => rdkit ||= new Promise((ok, fail) => {
    const tag = document.createElement('script'); tag.src = VENDOR + 'RDKit_minimal.js';
    tag.onload = () => window.initRDKitModule({ locateFile: file => VENDOR + file }).then(ok, fail); tag.onerror = fail; document.head.append(tag);
  });
  const structure = (R, smiles) => { const mol = R.get_mol(smiles); try { return mol.get_svg(190, 120); } finally { mol.delete(); } };

    const CHEER = ['¡Eso!', '¡Bien visto!', '¡Ahí está ese cerebro!', '¡Magia pura!'];

  const ADIVINA = {
    id: 'm4-adivina',
    prompt: 'La **lidocaína** del dentista tiene dos N, pero solo uno atrapa el H⁺. ¿Cuál?',
    options: [
      { text: 'El de la amina terciaria', correct: true },
      { text: 'El de la amida', misconception: 'amide-basic' },
      { text: 'Los dos por igual', note: 'El par del N de la amida está deslocalizado hacia el C=O: no actúa como base.' }
    ],
    explain: 'Se protona el N de la amina terciaria. El de la amida casi no es básico (misión 5).'
  };

  // El recorrido vive junto al resto de la clase; ningún dato depende de la cámara.
  function progressFor({ cls, mission, api, only, now = Date.now }) {
    const lesson = api ? window.NexoClassroom.sessionFor(api, cls.id) : {};
    const key = `${mission}:${only === 'demuestra' ? 'final' : 'full'}`;
    const store = lesson.stationProgress ||= {};
    const state = store[key] ||= { version: 1, step: only === 'demuestra' ? 3 : 0, classIndex: 0, adivinaOk: false, tasks: {} };
    if (state.version !== 1) throw new Error('Versión de estación no compatible.');
    const save = () => { api?.saveState(); api?.flushState?.(); };
    const task = (id, make) => {
      if (!state.tasks[id]) { state.tasks[id] = { ...(make ? { item: JSON.parse(JSON.stringify(make())) } : {}) }; save(); }
      return state.tasks[id];
    };
    const expired = () => Boolean(state.exam?.timed && now() >= state.exam.deadlineAt);
    function start(make, timed, seconds) {
      if (!state.exam) {
        const startedAt = now();
        state.exam = { item: JSON.parse(JSON.stringify(make())), timed, startedAt,
          deadlineAt: timed ? startedAt + seconds * 1000 : null, task: {}, status: 'running' };
        save();
      }
      return state.exam;
    }
    function finish(correct, why, question) {
      const exam = state.exam;
      if (!exam) throw new Error('La prueba no está iniciada.');
      if (!exam.result) {
        const timeout = why === 'timeout' || expired(), at = now(), item = exam.item;
        exam.status = 'completed';
        exam.result = { station: `${cls.id}:${mission}`, itemId: item.id, conceptId: item.concept || null,
          type: item.type || 'choice', question: question || null, correct: Boolean(correct) && !timeout,
          assisted: false, timed: exam.timed, timeout, adivinaOk: state.adivinaOk,
          source: item.source || null, slide: item.slide ?? null, gen: item.gen || null,
          reviewAt: at + (correct && !timeout ? 3 : 1) * 86400000, at };
        Object.assign(exam.task, { done: true, correct: exam.result.correct, why: timeout ? 'timeout' : why || null });
        save();
      }
      return exam.result;
    }
    return { state, save, task, start, finish, expired,
      remaining: () => state.exam?.timed ? Math.max(0, (state.exam.deadlineAt - now()) / 1000) : null,
      nextExam() { delete state.exam; save(); } };
  }

  /* Chispas: partículas que salen de un punto y se apagan (animación del navegador, sin cuadros que saltan). */
  function burst(layer, root, target, { color = '#ffd860', n = 12, spread = 46 } = {}) {
    if (reduced() || !layer.isConnected) return;
    const a = root.getBoundingClientRect(), b = target.getBoundingClientRect();
    const x = b.left - a.left + b.width / 2, y = b.top - a.top + b.height / 2;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i'), ang = Math.random() * 6.283, d = spread * (.4 + Math.random() * .8), s = 3 + Math.random() * 4;
      p.className = 'st-spark'; p.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${color};box-shadow:0 0 8px ${color}`;
      layer.append(p);
      p.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(ang) * d}px),calc(-50% + ${Math.sin(ang) * d - 14}px)) scale(.2)`, opacity: 0 }],
        { duration: 520 + Math.random() * 380, easing: 'cubic-bezier(.15,.7,.3,1)' }).onfinish = () => p.remove();
    }
  }

  /* La mascota real: re-rasterizada cada cuadro con sus ojos, brazos y accesorios del perfil. */
  function startPet(canvas, pet, mood) {
    const P = window.PixelMascotas;
    if (!P) return () => {};
    const kind = P.list.some(([k]) => k === pet.kind) ? pet.kind : 'matraz', outfit = pet.outfit || {};
    let raf = 0;
    const tick = now => {
      if (!canvas.isConnected) return;
      const t = reduced() ? 0 : now / 1000, hopping = now < mood.hopUntil, blink = (t % 3.4) < .13;
      const sad = mood.expr === 'triste';
      const st = { t, sx: 1, sy: 1 + .02 * Math.sin(t * 2), bodyTilt: sad ? -.04 : 0, rootTilt: 0, hop: hopping ? Math.abs(Math.sin((now - mood.hopFrom) / 110)) * 5 : 0,
        lift: kind === 'atomo' ? 2 + Math.sin(t * 2) * 1.5 : 0, slosh: 4 * Math.sin(t * 2), cork: 0, tag: 8 * Math.sin(t * 2), footL: 0, footR: 0, spin: 0, excite: hopping ? 1 : 0, drip: 0,
        hat: 3 * Math.sin(t * 3), look: [mood.look || 0, 0], blink, expr: mood.expr, outfit, arms: P.armPose(hopping ? 'wave' : mood.arm, t) };
      const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); P.render(ctx, kind, st);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }

  function mount(host, opts) {
    const cls = opts.cls, mission = cls.missions.find(m => m.id === opts.mission);
    const misc = cls.misconceptions || {}, diag = mission.study?.checks || mission.stages.diagnostic;
    const demo = { gen: 'basicidad', pep: 'P3', ends: ['menos básica', 'más básica'], prompt: 'Ordene de menor a mayor la basicidad de los siguientes compuestos orgánicos.', seconds: EXAM_SECONDS, ...(opts.demuestra || {}) };
    const only = opts.only === 'demuestra';
    const progress = progressFor(opts), saved = progress.state;
    const pool = [].concat(demo.gen).map(id => (opts.gen || window.NexoClassGen[cls.id]).generators.find(g => g.id === id)).filter(Boolean);
    const gen = { make: (rng, level) => {
      const g = pickOne(pool), profile = !only && mission.study?.generatorProfile;
      const id = `gen:${g.id}:${level}:${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${profile ? ':' + profile : ''}`;
      return window.NexoClassroom?.genItem(cls, id) || { source: opts.gen?.source || window.NexoClassGen[cls.id]?.source,
        ...g.make(rng, level, profile || undefined), id, gen: { id: g.id, level } };
    } };   // variante reproducible, con su generador y fuente, igual que el aula
    const P = window.PixelMascotas, petInfo = opts.pet || {};
    const pet = petInfo.name && petInfo.name !== 'Nexo' ? petInfo.name : (P?.list.find(([k]) => k === petInfo.kind)?.[1] || 'Matraz');
    let step = 0, raf = 0, destroyed = false, resetMood = 0;
    const stageTimers = new Set();
    const later = (fn, delay) => { const id = setTimeout(() => { stageTimers.delete(id); if (!destroyed && root.isConnected) fn(); }, delay); stageTimers.add(id); };
    const clearStageTimers = () => { stageTimers.forEach(clearTimeout); stageTimers.clear(); };
    const mood = { expr: 'neutral', arm: 'rest', hopUntil: 0, hopFrom: 0, look: 0 };

    host.innerHTML = `<section class="st">      <canvas class="st-pet" width="40" height="44" aria-hidden="true"></canvas><div class="st-bubble" role="status"></div>
      <div class="st-panel"><ol class="st-steps"></ol><div class="st-body"></div></div><div class="st-fx"></div>${opts.onExit ? '<button class="st-exit" aria-label="Salir de la estación">← Salir</button>' : ''}</section>`;
    const root = host.firstElementChild, bubble = root.querySelector('.st-bubble');
    const onEsc = e => { if (e.key === 'Escape') opts.onExit?.(); };
    if (opts.onExit) {
      root.querySelector('.st-exit').addEventListener('click', opts.onExit);
      document.addEventListener('keydown', onEsc);
    }
    const stepsEl = root.querySelector('.st-steps'), body = root.querySelector('.st-body'), fx = root.querySelector('.st-fx');
    const stopPet = startPet(root.querySelector('.st-pet'), petInfo, mood);

    /* La mascota habla y reacciona: expresión, brazos y un saltito si está feliz; vuelve a neutral sola. */
    function react(text, kind = 'n') {
      bubble.innerHTML = `<b>${esc(pet)}</b>${md(text)}`;
      if (!reduced()) bubble.animate([{ transform: 'scale(.92)', opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: .6 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, easing: 'ease-out' });
      const now = performance.now();
      Object.assign(mood, kind === 'h' ? { expr: 'feliz', arm: 'wave', hopUntil: now + 700, hopFrom: now }
        : kind === 'w' ? { expr: 'triste', arm: 'rest' } : kind === 's' ? { expr: 'deslumbrada', arm: 'up', hopUntil: now + 600, hopFrom: now }
        : kind === 't' ? { expr: 'concentrada', arm: 'rest' } : { expr: 'neutral', arm: 'rest' });
      clearTimeout(resetMood);
      if (kind !== 'n') resetMood = setTimeout(() => Object.assign(mood, { expr: kind === 't' ? 'concentrada' : 'neutral', arm: 'rest' }), 2200);
    }
    const setSteps = () => { stepsEl.innerHTML = STEPS.map((s, i) => `<li class="${i === step ? 'on' : i < step ? 'done' : ''}">${i + 1} · ${s}</li>`).join(''); };

    /* Pregunta de opciones: un intento. `locked` = Demuestra (sin pista ni reintento). */
    function choice(item, { onDone, locked = false, work = {}, expired = () => false, allowUnknown = false }) {
      const box = document.createElement('div');
      const order = work.order ||= item.options.map((_, i) => i).sort(() => Math.random() - .5);
      progress.save();
      box.innerHTML = `<p class="st-q">${md(item.prompt)}</p><div class="st-opts">${order.map(i => `<button class="st-opt" data-i="${i}">${md(item.options[i].text)}</button>`).join('')}</div><p class="st-fb" hidden></p>`;
      const feedback = restoring => {
        box.querySelector('.st-unknown')?.remove();
        box.querySelectorAll('.st-opt').forEach(b => { b.disabled = true; if (item.options[+b.dataset.i].correct) b.classList.add('ok');
          if (+b.dataset.i === work.choice && !work.correct) b.classList.add('bad'); });
        const option = item.options[work.choice];
        const why = work.correct ? item.explain : (misc[option?.misconception]?.why || option?.note || item.explain);
        const fb = box.querySelector('.st-fb'); fb.hidden = false; fb.innerHTML = md(why);
        if (!restoring && work.correct) burst(fx, root, box.querySelector('.st-opt.ok'), { n: 14 });
        if (!restoring) react(work.correct ? (locked ? '¡Demostrado! Sin pistas y bien.' : pickOne(CHEER)) : (locked ? 'Esta no pasó. Vuelve con otra variante.' : why), work.correct ? 'h' : 'w');
        onDone(work.correct, work.why);
      };
      box._finish = (ok, why) => {
        if (work.done) return;
        Object.assign(work, { done: true, correct: Boolean(ok), why: why || null }); progress.save(); feedback(false);
      };
      box.querySelectorAll('.st-opt').forEach((btn, k) => {
        btn.style.setProperty('--d', k * 70 + 'ms');
        btn.addEventListener('click', () => {
          if (work.done) return;
          if (expired()) return box._finish(false, 'timeout');
          work.choice = +btn.dataset.i;
          box._finish(Boolean(item.options[work.choice].correct));
        });
      });
      if (allowUnknown && !work.done) {
        const unknown = document.createElement('button'); unknown.className = 'st-next st-unknown'; unknown.textContent = 'No lo sé todavía';
        unknown.addEventListener('click', () => {
          work.assisted = true; unknown.remove(); box._finish(false, 'unknown');
        });
        box.append(unknown);
      }
      if (work.done) feedback(true);
      return box;
    }

    /* Respuesta numérica (un intento): acepta coma o punto; la corrección es la del aula. */
    function numberTask(item, { onDone, work = {}, expired = () => false }) {
      const box = document.createElement('div'), CR = window.NexoClassroom;
      box.innerHTML = `<p class="st-q">${md(item.prompt)}</p><div class="st-ctl"><input class="st-num" inputmode="decimal" autocomplete="off" aria-label="Tu respuesta"> <span class="st-unit">${esc(item.unit || '')}</span>
        <button class="st-next" data-check disabled>Comprobar</button></div><p class="st-fb" hidden></p>`;
      const input = box.querySelector('.st-num'), check = box.querySelector('[data-check]'), fb = box.querySelector('.st-fb');
      const parse = raw => (CR?.parseNum ? CR.parseNum(raw) : Number(String(raw).replace(',', '.')));
      input.value = work.raw || '';
      check.disabled = Boolean(work.done) || !input.value.trim() || !Number.isFinite(parse(input.value));
      input.addEventListener('input', () => { work.raw = input.value; progress.save(); check.disabled = Boolean(work.done) || !input.value.trim() || !Number.isFinite(parse(input.value)); });
      input.addEventListener('keydown', e => { if (e.key === 'Enter' && !check.disabled) check.click(); });
      const feedback = restoring => {
        input.disabled = true; check.disabled = true; fb.hidden = false;
        fb.innerHTML = `${md(item.explain || '')}${(item.solution || []).length ? `<ol>${item.solution.map(t => `<li>${md(t)}</li>`).join('')}</ol>` : ''}`;
        if (!restoring && work.correct) burst(fx, root, input, { n: 16 });
        onDone(work.correct, work.why);
      };
      const finish = (ok, why) => {
        if (work.done) return;
        Object.assign(work, { done: true, correct: Boolean(ok), why: why || null }); progress.save(); feedback(false);
      };
      check.addEventListener('click', () => {
        if (expired()) return finish(false, 'timeout');
        const num = parse(input.value);
        finish(CR?.isCorrect ? CR.isCorrect(item, { raw: input.value, num, unit: item.unit || '' }) : Math.abs(num - item.answer) <= Math.abs(item.answer) * (item.tol ?? .02));
      });
      box._finish = finish;
      if (work.done) feedback(true);
      return box;
    }
    const nextBtn = (label, go) => { const b = document.createElement('button'); b.className = 'st-next'; b.textContent = label; b.hidden = true; b.addEventListener('click', go); return b; };
    const reveal = el => { el.hidden = false; if (!reduced()) el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' }); };

    function stepAdivina() {
      react('Esto es opcional y no da dominio. Si falta una base, empieza por la explicación.');
      body.innerHTML = `${title('ANTES DE EMPEZAR')}<p class="st-fb">Primero puedes aprender desde cero. El reto inicial es opcional y no cuenta como dominio.</p>`;
      const next = nextBtn('A la clase →', () => go(1));
      body.append(choice(ADIVINA, { work: progress.task('adivina'), onDone: ok => { saved.adivinaOk = ok; progress.save(); reveal(next); } }), next);
      const learn = document.createElement('button'); learn.className = 'st-next'; learn.textContent = 'No lo sé todavía: aprender desde cero';
      learn.addEventListener('click', () => { saved.adivinaSkipped = true; saved.studyIndex = 0; progress.save(); go(1); });
      body.prepend(learn);
    }

    function stepClase() {
      const pages = mission.study?.pages || [];
      const index = Math.max(0, Math.min(Number(saved.studyIndex) || 0, pages.length));
      if (index < pages.length) { studyPage(pages, index); return; }
      react('Ahora comprueba lo explicado. Esto sigue siendo práctica, sin acreditar dominio.', 't');
      body.innerHTML = title('COMPRUEBA LA IDEA');
      const reread = document.createElement('button'); reread.className = 'st-next'; reread.textContent = 'Volver a la explicación';
      reread.addEventListener('click', () => { saved.studyIndex = 0; progress.save(); go(1); }); body.append(reread);
      const next = nextBtn('Al juego →', () => go(2));
      const indexKey = mission.study ? 'studyChecksIndex' : 'classIndex';
      let i = Math.max(0, Math.min(Number(saved[indexKey]) || 0, diag.length));
      const ask = () => {
        if (i >= diag.length) { reveal(next); return; }
        const item = diag[i++], holder = document.createElement('div');
        holder.append(choice(item, { work: progress.task('class:' + item.id), allowUnknown: Boolean(mission.study), onDone: () => { const b = document.createElement('button'); b.className = 'st-next'; b.textContent = 'Siguiente'; b.addEventListener('click', () => { saved[indexKey] = i; progress.save(); holder.remove(); ask(); }); holder.append(b); reveal(b); } }));
        body.insertBefore(holder, next); reveal(holder);
      };
      body.append(next); later(() => { if (step === 1) ask(); }, reduced() ? 0 : 1100);
    }

    function studyPage(pages, index) {
      const page = pages[index], source = mission.study.sources[page.source];
      react('Una idea a la vez. Puedes volver, pedir la explicación y continuar sin adivinar.', 't');
      body.innerHTML = `<p class="st-fb">Explicación ${index + 1} de ${pages.length} · apoyo formativo</p>${title(page.title)}
        <p class="st-q">${md(page.body)}</p>
        ${page.equation ? `<div class="st-equation" aria-label="Reacción">${page.equation.map(part => `<span>${esc(part)}</span>`).join('')}</div>` : ''}
        ${page.example ? `<p class="st-fb">${md(page.example)}</p>` : ''}`;
      if (page.structures) {
        const figures = document.createElement('div'); figures.className = 'st-study-structures';
        figures.innerHTML = page.structures.map(f => `<figure><figcaption>${esc(f.label)}</figcaption><div></div></figure>`).join(''); body.append(figures);
        loadRDKit().then(R => {
          if (destroyed || !figures.isConnected) return;
          page.structures.forEach((f, i) => { figures.children[i].lastElementChild.innerHTML = structure(R, f.smiles); });
        }).catch(() => {}); // Los nombres y la explicación siguen disponibles sin el dibujo.
      }
      const controls = document.createElement('div'); controls.className = 'st-ctl';
      const back = document.createElement('button'); back.className = 'st-next'; back.textContent = '← Paso anterior'; back.disabled = index === 0;
      back.addEventListener('click', () => { saved.studyIndex = index - 1; progress.save(); go(1); });
      const next = document.createElement('button'); next.className = 'st-next'; next.textContent = index === pages.length - 1 ? 'Comprobar lo aprendido →' : 'Continuar →';
      next.addEventListener('click', () => { saved.studyIndex = index + 1; progress.save(); go(1); });
      if (page.check) {
        next.hidden = true;
        const work = progress.task('study:' + page.check.id), review = document.createElement('p'); review.className = 'st-fb'; review.hidden = true;
        const guess = document.createElement('button'); guess.className = 'st-next'; guess.textContent = 'Acerté adivinando: repasar por qué'; guess.hidden = true;
        guess.addEventListener('click', () => {
          work.guessed = true; work.assisted = true; progress.save(); review.hidden = false;
          review.textContent = 'Queda registrado como respuesta con ayuda; no demuestra dominio. Relee el ejemplo y el porqué antes de continuar.';
          guess.hidden = true;
        });
        body.append(choice(page.check, { work, allowUnknown: true, onDone: ok => {
          next.hidden = false; guess.hidden = !ok || Boolean(work.guessed);
          if (!ok || work.guessed) { review.hidden = false; review.textContent = 'Vuelve al ejemplo de arriba: el porqué está explicado en la corrección. Puedes usar Paso anterior para reconstruir la base.'; }
        } }), review, guess);
      }
      controls.append(back, next); body.append(controls);
      if (source) {
        const p = document.createElement('p'), link = document.createElement('a'); p.className = 'st-fb'; link.href = source.url;
        link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = source.label; p.append(link); body.append(p);
      }
      const scroller = host.closest('.cv-content') || body.closest('.st-panel'); if (scroller) scroller.scrollTop = 0;
    }

    function reviewButton() {
      const button = document.createElement('button'); button.className = 'st-next'; button.textContent = 'Volver a la explicación';
      button.addEventListener('click', () => { saved.studyIndex = 0; progress.save(); go(1); }); return button;
    }

    /* Ordenar por basicidad (formato de la pregunta 3 de la PEP): se toca de menos a más básica. `retry` = práctica: se puede reintentar. */
    function orderTask(item, { retry = false, onDone, work = {}, expired = () => false }) {
      const box = document.createElement('div'), n = item.cards.length, L = 'abcdef';
      // los extremos salen de la dirección del ítem («De más lento a más rápido»); en Basicidad se dicen «menos/más básica»
      const dir = /^(?:de|del)\s+(.+?)\s+(?:a|al)\s+(.+?)\.?$/i.exec(item.direction || ''), ends = [].concat(demo.gen)[0] === 'basicidad' ? demo.ends : dir ? [dir[1], dir[2]] : ['primero', 'último'];
      box.innerHTML = `<p class="st-q">${md(item.prompt)}</p>
        <div class="st-slots">${item.cards.map((_, i) => `<button class="st-slot" data-s="${i}" aria-label="Lugar ${i + 1}"><em>${i + 1}${i === 0 ? ` · ${ends[0]}` : i === n - 1 ? ` · ${ends[1]}` : ''}</em><span></span></button>`).join('')}</div>
        <div class="st-cards">${item.cards.map((c, i) => `<button class="st-card" data-id="${esc(c.id)}"><b>${L[i]})</b> <span class="st-name">${md(c.text)}</span></button>`).join('')}</div>
        <div class="st-ctl"><button class="st-next" data-check disabled>Comprobar</button></div><p class="st-fb" hidden></p>`;
      const slots = [...box.querySelectorAll('.st-slot')], cards = [...box.querySelectorAll('.st-card')], check = box.querySelector('[data-check]'), fb = box.querySelector('.st-fb');
      /* Con estructuras (como la PEP) el examen muestra solo el dibujo y la letra; la práctica agrega el nombre. Sin RDKit, queda el nombre. */
      const drawn = {};
      const label = id => { const i = item.cards.findIndex(c => c.id === id); return `<b>${L[i]})</b> ${drawn[id] ? `<span class="st-thumb">${drawn[id]}</span>` : ''}${drawn[id] && !retry ? '' : md(item.cards[i].text)}`; };
      let picked = (work.picked || []).filter((id, i, all) => item.cards.some(c => c.id === id) && all.indexOf(id) === i), over = false;
      const refresh = () => {
        slots.forEach((s, i) => { s.querySelector('span').innerHTML = picked[i] ? label(picked[i]) : ''; s.classList.toggle('full', !!picked[i]); });
        cards.forEach(c => { c.disabled = over || picked.includes(c.dataset.id); });
        check.disabled = over || picked.length !== n;
      };
      cards.forEach(c => c.addEventListener('click', () => { if (!over && picked.length < n) { if (expired()) return finish(false, 'timeout'); picked.push(c.dataset.id); work.picked = picked.slice(); progress.save(); refresh(); } }));
      slots.forEach((s, i) => s.addEventListener('click', () => { if (!over && picked[i]) { if (expired()) return finish(false, 'timeout'); picked = picked.slice(0, i); work.picked = picked.slice(); progress.save(); refresh(); } }));
      const showAnswer = () => {
        picked = item.answer.slice(); refresh();
        slots.forEach((s, i) => { if (!reduced()) s.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 140, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }); s.classList.add('ok'); });
      };
      const feedback = restoring => {
        over = true; refresh(); fb.hidden = false; fb.innerHTML = md(item.explain);
        if (work.correct) { slots.forEach(s => s.classList.add('ok')); if (!restoring) burst(fx, root, slots[n - 1], { n: 18 }); } else showAnswer();
        onDone(work.correct, work.why);
      };
      const finish = (ok, why) => {
        if (work.done) return;
        Object.assign(work, { done: true, correct: Boolean(ok), why: why || null }); progress.save(); feedback(false);
      };
      check.addEventListener('click', () => {
        if (expired()) return finish(false, 'timeout');
        const ok = JSON.stringify(picked) === JSON.stringify(item.answer);
        if (ok || !retry) { finish(ok); return; }
        slots.forEach(s => s.classList.add('bad')); fb.hidden = false; fb.innerHTML = md(item.hint || demo.hint || 'Mayor pKa del ion amonio = más básica.');
        react(mission.study ? 'Revisa dónde está el par libre y qué cambia al protonar cada N.' : 'Casi. Mira los pKa: el más alto agarra el H⁺ más fuerte.', 'w');
        later(() => { slots.forEach(s => s.classList.remove('bad')); picked = []; work.picked = []; progress.save(); refresh(); }, 900);
      });
      box._finish = finish; refresh();
      if (work.done) feedback(true);
      if (item.cards.every(c => c.smiles)) {
        const wait = document.createElement('p'); wait.className = 'st-tip'; wait.textContent = 'Dibujando las estructuras…'; box.querySelector('.st-cards').before(wait);
        loadRDKit().then(R => {
          if (destroyed || !box.isConnected) return;
          item.cards.forEach((c, i) => { drawn[c.id] = structure(R, c.smiles); cards[i].insertAdjacentHTML('afterbegin', `<span class="st-struct">${drawn[c.id]}</span>`); });
          box.classList.add('has-struct', retry ? 'is-practice' : 'is-exam'); refresh();
        }).catch(() => {}).finally(() => wait.remove());
      }
      return box;
    }

    function stepPractica() {
      react('Ahora sin tabla: justifica con el par libre, la conjugación y los grupos unidos al anillo.', 't');
      body.innerHTML = title('PRÁCTICA');
      const next = nextBtn('Ir a la prueba →', () => go(3)), work = progress.task('practice', () => gen.make(Math.random, mission.study ? 3 : 2)), item = work.item;
      body.append(orderTask(item, { retry: true, work, onDone: ok => { if (ok) { react(pickOne(CHEER), 'h'); reveal(next); } } }), next);
      if (mission.study) {
        const another = document.createElement('button'); another.className = 'st-next'; another.textContent = 'Probar otro caso sin tabla';
        another.addEventListener('click', () => {
          (saved.practiceHistory ||= []).push(JSON.parse(JSON.stringify(work)));
          delete saved.tasks.practice; progress.save(); go(2);
        });
        body.append(another, reviewButton());
      }
    }

    function stepDemuestra() {
      const q = (cls.goal?.questions || []).find(x => x.id === demo.pep), seconds = demo.seconds || EXAM_SECONDS;
      react(only ? 'Última prueba de la misión: un solo intento y sin pistas. Tú puedes.' : 'Como en la PEP: sin tabla y un solo intento. Respira… tú puedes.', 't');
      const head = q ? `<b>Pregunta ${esc(q.id.slice(1))}</b> · <b>${fmt(q.points)} ${q.points === 1 ? 'punto' : 'puntos'}</b><br>${esc(q.label)}` : '<b>Prueba final de la misión</b> · un intento';
      body.innerHTML = `${title('DEMUESTRA')}<div class="st-exam"><p class="st-q">${head}</p>
        <label class="st-clockopt"><input type="checkbox" ${saved.timed === false ? '' : 'checked'}> Con reloj (${seconds} s, como en la prueba)</label>
        <p class="st-fb">Si usas reloj, sigue corriendo aunque cierres la clase.</p><button class="st-next st-start">Empezar</button></div>`;
      const timedOption = body.querySelector('.st-clockopt input');
      const reread = !only && mission.study && !saved.exam ? reviewButton() : null;
      if (reread) body.append(reread);
      timedOption.addEventListener('change', () => { saved.timed = timedOption.checked; progress.save(); });
      function openExam() {
        reread?.remove();
        const exam = progress.start(() => {
          const made = gen.make(Math.random, 5);
          const prompt = [].concat(demo.gen)[0] === 'basicidad' && made.type === 'order' ? demo.prompt : String(made.prompt).replace(/^Estilo PEP( \(pregunta \d\))?: ?/i, '').replace(/^./, c => c.toUpperCase());
          return { ...made, prompt };
        }, timedOption.checked, seconds);
        const item = exam.item;
        body.querySelector('.st-exam').remove();
        const clock = document.createElement('div'); clock.className = 'st-clock'; clock.innerHTML = '<i></i><span></span>'; clock.hidden = !exam.timed;
        const out = document.createElement('div'); let timer = 0, closed = false;
        const onDone = (ok, why) => {
          if (closed || destroyed) return;
          closed = true; clearInterval(timer);
          const result = progress.finish(ok, why, demo.pep);
          opts.onResult?.(result);
          const passed = result.correct;
          const rows = (cls.goal?.questions || []).map(x => x.id === demo.pep
            ? `<li class="${passed ? 'ok' : 'no'}">${passed ? '✦' : '✘'} <b>${x.id}</b> · ${esc(x.label)} (${x.points} pt) — ${passed ? 'asegurado' : result.timeout ? 'se acabó el tiempo' : 'aún no'}</li>`
            : `<li>○ <b>${x.id}</b> · ${esc(x.label)} (${x.points} pt) — en otra misión</li>`).join('');
          out.innerHTML = `<div class="st-pep"><h3>${q ? `Tu PEP 1 · ${esc(cls.title)}` : 'Prueba final'}</h3>${q ? `<ul>${rows}</ul>` : `<p>${passed ? '✦ Demostrado sin pistas.' : '✘ Aún no.'}</p>`}
            <p>Resultado guardado. El repaso se programa con tu evidencia.</p>
            <button class="st-next st-done">Guardar y salir</button><button class="st-next st-again">Probar otra variante</button></div>`;
          out.querySelector('.st-done').addEventListener('click', () => opts.onExit?.());
          out.querySelector('.st-again').addEventListener('click', () => { progress.nextExam(); go(3); });
          if (!only && mission.study) out.append(reviewButton());
          reveal(out.firstElementChild);
          react(passed ? '¡Resuelto sin pistas!' : (result.timeout ? 'Se acabó el tiempo. Puedes practicar otra variante.' : 'Esta no pasó. Revisa la explicación y prueba otra variante.'), passed ? 's' : 'w');
        };
        const args = { onDone, work: exam.task, expired: progress.expired };
        const task = item.type === 'order' ? orderTask(item, args) : item.type === 'number' ? numberTask(item, args) : choice(item, { ...args, locked: true });
        body.append(clock, task, out);
        const tick = () => {
          if (closed || destroyed || step !== 3 || !root.isConnected) { clearInterval(timer); return; }
          const left = progress.remaining();
          clock.firstChild.style.transform = `scaleX(${left / seconds})`; clock.lastChild.textContent = Math.ceil(left) + ' s'; clock.classList.toggle('low', left < 15);
          if (left <= 0) task._finish(false, 'timeout');
        };
        if (exam.timed && !closed) { tick(); if (!closed) timer = setInterval(tick, 200); }
        body._cleanup = () => clearInterval(timer);
      }
      body.querySelector('.st-start').addEventListener('click', openExam);
      if (saved.exam) openExam();
    }

    function go(n) {
      clearStageTimers(); cancelAnimationFrame(raf); body._cleanup?.(); body._cleanup = null;
      step = n; saved.step = n; progress.save(); setSteps(); [stepAdivina, stepClase, stepPractica, stepDemuestra][n]();
      if (!reduced()) body.animate([{ opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    function destroy() { clearStageTimers(); progress.save(); document.removeEventListener('keydown', onEsc); destroyed = true; cancelAnimationFrame(raf); clearTimeout(resetMood); stopPet(); body._cleanup?.(); host.innerHTML = ''; }
    if (only) root.classList.add('is-only');
    go(only ? 3 : Math.max(0, Math.min(3, Number(saved.step) || 0)));
    return { destroy, go };
  }
  window.NexoStation = Object.freeze({ mount, startPet, progressFor });
})();
