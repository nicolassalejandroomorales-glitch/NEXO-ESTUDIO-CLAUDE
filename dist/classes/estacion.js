/* Estación de clase (piloto Basicidad, org-01): Adivina → Clase → Práctica → Demuestra.
   Versión C "cristal-pantalla" de docs/clases-v2/SPEC.md. Habla la mascota REAL del usuario (PixelMascotas).
   Práctica y Demuestra usan el generador `basicidad` de org-01-gen.js: es la pregunta 3 de la PEP 1 (ordenar por basicidad, 1,0 punto).
   NexoStation.mount(host, { cls, gen, mission: 'm4', pet: { kind, name, outfit }, onResult(r) }) -> { destroy, go }.
   Evidencia: solo "Demuestra" (un intento, sin ayuda, con reloj opcional) cuenta como punto; el resto es práctica. */
(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const md = v => esc(v).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const title = text => window.NexoPixelText ? window.NexoPixelText.render(text, { shadow: true }) : `<h2>${esc(text)}</h2>`;
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
    const misc = cls.misconceptions || {}, diag = mission.stages.diagnostic;
    const gen = (opts.gen || window.NexoClassGen[cls.id]).generators.find(g => g.id === 'basicidad');
    const P = window.PixelMascotas, petInfo = opts.pet || {};
    const pet = petInfo.name && petInfo.name !== 'Nexo' ? petInfo.name : (P?.list.find(([k]) => k === petInfo.kind)?.[1] || 'Matraz');
    let step = 0, raf = 0, destroyed = false, passedAdivina = false, resetMood = 0;
    const mood = { expr: 'neutral', arm: 'rest', hopUntil: 0, hopFrom: 0, look: 0 };

    host.innerHTML = `<section class="st"><canvas class="st-art" aria-hidden="true"></canvas>
      <canvas class="st-pet" width="40" height="44" aria-hidden="true"></canvas><div class="st-bubble" role="status"></div>
      <div class="st-panel"><ol class="st-steps"></ol><div class="st-body"></div></div><div class="st-fx"></div>${opts.onExit ? '<button class="st-exit" aria-label="Salir de la estación">← Salir</button>' : ''}</section>`;
    const root = host.firstElementChild, art = root.querySelector('.st-art'), bubble = root.querySelector('.st-bubble');
    if (opts.fullscreen) root.classList.add('is-full');
    if (opts.onExit) {
      root.querySelector('.st-exit').addEventListener('click', opts.onExit);
      const onEsc = e => { if (!root.isConnected) document.removeEventListener('keydown', onEsc); else if (e.key === 'Escape') opts.onExit(); };
      document.addEventListener('keydown', onEsc);
    }
    const stepsEl = root.querySelector('.st-steps'), body = root.querySelector('.st-body'), fx = root.querySelector('.st-fx');
    const stopPet = startPet(root.querySelector('.st-pet'), petInfo, mood);
    const paint = () => window.NexoStationArt.draw(art, { mode: root.clientWidth < 700 ? 'tall' : 'wide' });
    const resizer = new ResizeObserver(paint); resizer.observe(root);

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
    function choice(item, { onDone, locked = false }) {
      const box = document.createElement('div');
      box.innerHTML = `<p class="st-q">${md(item.prompt)}</p><div class="st-opts">${item.options.map((o, i) => `<button class="st-opt" data-i="${i}">${md(o.text)}</button>`).join('')}</div><p class="st-fb" hidden></p>`;
      box.querySelectorAll('.st-opt').forEach((btn, k) => {
        btn.style.setProperty('--d', k * 70 + 'ms');
        btn.addEventListener('click', () => {
          const o = item.options[+btn.dataset.i];
          box.querySelectorAll('.st-opt').forEach(b => { b.disabled = true; if (item.options[+b.dataset.i].correct) b.classList.add('ok'); });
          if (!o.correct) btn.classList.add('bad');
          const why = o.correct ? item.explain : (misc[o.misconception]?.why || o.note || item.explain);
          const fb = box.querySelector('.st-fb'); fb.hidden = false; fb.innerHTML = md(why);
          if (o.correct) burst(fx, root, box.querySelector('.st-opt.ok'), { n: 14 });
          react(o.correct ? (locked ? '¡Demostrado! Sin pistas y bien.' : pickOne(CHEER)) : (locked ? 'Esta no pasó. Mañana vuelve con otra variante.' : why), o.correct ? 'h' : 'w');
          onDone(!!o.correct);
        });
      });
      return box;
    }
    const nextBtn = (label, go) => { const b = document.createElement('button'); b.className = 'st-next'; b.textContent = label; b.hidden = true; b.addEventListener('click', go); return b; };
    const reveal = el => { el.hidden = false; if (!reduced()) el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' }); };

    function stepAdivina() {
      react('Apuesta sin miedo: aquí equivocarse sale gratis.');
      body.innerHTML = title('ADIVINA');
      const next = nextBtn('A la clase →', () => go(1));
      body.append(choice(ADIVINA, { onDone: ok => { passedAdivina = ok; reveal(next); } }), next);
    }

    function stepClase() {
      react('Mira cómo la amina se queda con el H⁺… ¡qué egoísta!', 't');
      body.innerHTML = `${title('CLASE')}
        <div class="st-react" aria-label="La trietilamina captura un H⁺ con su par libre y queda como ion trietilamonio">
          <div class="st-mol"><span class="st-ring"></span><span class="st-n">Et₃N<i class="st-pair"></i></span><span class="st-prod">Et₃NH⁺</span></div>
          <span class="st-hp">H⁺</span></div>
        <p class="st-cap" style="--d:.3s">pKa alto = **agarra el H⁺ fuerte**.</p>
        <p class="st-cap" style="--d:.9s">El equilibrio gana el ácido **más débil**.</p>`;
      body.querySelectorAll('.st-cap').forEach(p => { p.innerHTML = md(p.textContent); });
      const next = nextBtn('Al juego →', () => go(2));
      let i = 0;
      const ask = () => {
        if (i >= diag.length) { reveal(next); return; }
        const item = diag[i++], holder = document.createElement('div');
        holder.append(choice(item, { onDone: () => { const b = document.createElement('button'); b.className = 'st-next'; b.textContent = 'Siguiente'; b.addEventListener('click', () => { holder.remove(); ask(); }); holder.append(b); reveal(b); } }));
        body.insertBefore(holder, next); reveal(holder);
      };
      body.append(next); setTimeout(() => { if (step === 1) ask(); }, reduced() ? 0 : 1100);
    }

    /* Ordenar por basicidad (formato de la pregunta 3 de la PEP): se toca de menos a más básica. `retry` = práctica: se puede reintentar. */
    function orderTask(item, { retry = false, onDone }) {
      const box = document.createElement('div'), n = item.cards.length, L = 'abcdef';
      box.innerHTML = `<p class="st-q">${md(item.prompt)}</p>
        <div class="st-slots">${item.cards.map((_, i) => `<button class="st-slot" data-s="${i}" aria-label="Lugar ${i + 1}"><em>${i + 1}${i === 0 ? ' · menos básica' : i === n - 1 ? ' · más básica' : ''}</em><span></span></button>`).join('')}</div>
        <div class="st-cards">${item.cards.map((c, i) => `<button class="st-card" data-id="${esc(c.id)}"><b>${L[i]})</b> <span class="st-name">${md(c.text)}</span></button>`).join('')}</div>
        <div class="st-ctl"><button class="st-next" data-check disabled>Comprobar</button></div><p class="st-fb" hidden></p>`;
      const slots = [...box.querySelectorAll('.st-slot')], cards = [...box.querySelectorAll('.st-card')], check = box.querySelector('[data-check]'), fb = box.querySelector('.st-fb');
      /* Con estructuras (como la PEP) el examen muestra solo el dibujo y la letra; la práctica agrega el nombre. Sin RDKit, queda el nombre. */
      const drawn = {};
      const label = id => { const i = item.cards.findIndex(c => c.id === id); return `<b>${L[i]})</b> ${drawn[id] ? `<span class="st-thumb">${drawn[id]}</span>` : ''}${drawn[id] && !retry ? '' : md(item.cards[i].text)}`; };
      let picked = [], over = false;
      const refresh = () => {
        slots.forEach((s, i) => { s.querySelector('span').innerHTML = picked[i] ? label(picked[i]) : ''; s.classList.toggle('full', !!picked[i]); });
        cards.forEach(c => { c.disabled = over || picked.includes(c.dataset.id); });
        check.disabled = over || picked.length !== n;
      };
      cards.forEach(c => c.addEventListener('click', () => { if (picked.length < n) { picked.push(c.dataset.id); refresh(); } }));
      slots.forEach((s, i) => s.addEventListener('click', () => { if (!over && picked[i]) { picked = picked.slice(0, i); refresh(); } }));
      const showAnswer = () => {
        picked = item.answer.slice(); refresh();
        slots.forEach((s, i) => { if (!reduced()) s.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 140, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }); s.classList.add('ok'); });
      };
      const finish = (ok, why) => {
        over = true; refresh(); fb.hidden = false; fb.innerHTML = md(item.explain);
        if (ok) { slots.forEach(s => s.classList.add('ok')); burst(fx, root, slots[n - 1], { n: 18 }); } else showAnswer();
        onDone(ok, why);
      };
      check.addEventListener('click', () => {
        const ok = JSON.stringify(picked) === JSON.stringify(item.answer);
        if (ok || !retry) { finish(ok); return; }
        slots.forEach(s => s.classList.add('bad')); fb.hidden = false; fb.innerHTML = md(item.hint || 'Mayor pKa del ion amonio = más básica.');
        react('Casi. Mira los pKa: el más alto agarra el H⁺ más fuerte.', 'w');
        setTimeout(() => { slots.forEach(s => s.classList.remove('bad')); picked = []; refresh(); }, 900);
      });
      box._finish = finish; refresh();
      if (item.cards.every(c => c.smiles)) {
        const wait = document.createElement('p'); wait.className = 'st-tip'; wait.textContent = 'Dibujando las estructuras…'; box.querySelector('.st-cards').before(wait);
        loadRDKit().then(R => {
          item.cards.forEach((c, i) => { drawn[c.id] = structure(R, c.smiles); cards[i].insertAdjacentHTML('afterbegin', `<span class="st-struct">${drawn[c.id]}</span>`); });
          box.classList.add('has-struct', retry ? 'is-practice' : 'is-exam'); refresh();
        }).catch(() => {}).finally(() => wait.remove());
      }
      return box;
    }

    function stepPractica() {
      react('Primero con los pKa a la vista. Cuando salga, lo hacemos como en la prueba.', 't');
      body.innerHTML = title('PRÁCTICA');
      const next = nextBtn('Ir a la prueba →', () => go(3)), item = gen.make(Math.random, 2);
      body.append(orderTask(item, { retry: true, onDone: ok => { if (ok) { react(pickOne(CHEER), 'h'); reveal(next); } } }), next);
    }

    function stepDemuestra() {
      react('Como en la PEP: sin tabla y un solo intento. Respira… tú puedes.', 't');
      body.innerHTML = `${title('DEMUESTRA')}<div class="st-exam"><p class="st-q"><b>Pregunta 3</b> · <b>1,0 punto</b><br>Ordene de menor a mayor la basicidad de los compuestos.</p>
        <label class="st-clockopt"><input type="checkbox" checked> Con reloj (${EXAM_SECONDS} s, como en la prueba)</label><button class="st-next st-start">Empezar</button></div>`;
      body.querySelector('.st-start').addEventListener('click', () => {
        const timed = body.querySelector('.st-clockopt input').checked, t0 = performance.now();
        const item = { ...gen.make(Math.random, 5), prompt: 'Ordene de menor a mayor la basicidad de los siguientes compuestos orgánicos.' };
        body.querySelector('.st-exam').remove();
        const clock = document.createElement('div'); clock.className = 'st-clock'; clock.innerHTML = '<i></i><span></span>'; clock.hidden = !timed;
        const out = document.createElement('div'); let timer = 0, closed = false;
        const task = orderTask(item, { onDone: (ok, why) => {
          closed = true; clearInterval(timer);
          const result = { station: `${cls.id}:${mission.id}`, itemId: 'basicidad-pep3', question: 'P3', correct: ok, assisted: false, timed, timeout: why === 'timeout', adivinaOk: passedAdivina,
            reviewAt: Date.now() + (ok ? 3 : 1) * 86400000, at: Date.now() };
          opts.onResult?.(result);
          const rows = (cls.goal?.questions || []).map(q => q.id === 'P3'
            ? `<li class="${ok ? 'ok' : 'no'}">${ok ? '✦' : '✘'} <b>${q.id}</b> · ${esc(q.label)} (${q.points} pt) — ${ok ? 'asegurado' : why === 'timeout' ? 'se acabó el tiempo' : 'aún no'}</li>`
            : `<li>○ <b>${q.id}</b> · ${esc(q.label)} (${q.points} pt) — en otra misión</li>`).join('');
          out.innerHTML = `<div class="st-pep"><h3>Tu PEP 1 · Aminas</h3><ul>${rows}</ul><p>${ok ? 'Te la vuelvo a pedir en 3 días con otros compuestos.' : 'Te la vuelvo a pedir mañana con otros compuestos.'}</p></div>`;
          reveal(out.firstElementChild);
          react(ok ? '¡Punto demostrado! Sin pistas y a tiempo.' : (why === 'timeout' ? 'Se acabó el tiempo. Mañana lo repetimos.' : 'Esta no pasó. Mañana vuelve con otra variante.'), ok ? 's' : 'w');
          if (ok) burst(fx, root, out, { n: 26, spread: 90 });
        } });
        body.append(clock, task, out);
        if (timed) {
          const bar = clock.firstChild, txt = clock.lastChild;
          timer = setInterval(() => {
            if (closed || destroyed || step !== 3 || !root.isConnected) { clearInterval(timer); return; }
            const left = Math.max(0, EXAM_SECONDS - (performance.now() - t0) / 1000);
            bar.style.transform = `scaleX(${left / EXAM_SECONDS})`; txt.textContent = Math.ceil(left) + ' s'; clock.classList.toggle('low', left < 15);
            if (left <= 0) task._finish(false, 'timeout');
          }, 200);
          body._cleanup = () => clearInterval(timer);
        }
      });
    }

    function go(n) {
      cancelAnimationFrame(raf); body._cleanup?.(); body._cleanup = null;
      step = n; setSteps(); [stepAdivina, stepClase, stepPractica, stepDemuestra][n]();
      if (!reduced()) body.animate([{ opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    function destroy() { destroyed = true; cancelAnimationFrame(raf); clearTimeout(resetMood); stopPet(); body._cleanup?.(); resizer.disconnect(); host.innerHTML = ''; }
    go(0); requestAnimationFrame(paint);
    return { destroy, go };
  }
  window.NexoStation = Object.freeze({ mount });
})();
