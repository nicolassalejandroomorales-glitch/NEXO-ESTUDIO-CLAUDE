/* Tutorial de Nexo (docs/tutorial/SPEC.md y GUION.md). Tramo 1: despertar del Grimorio, elegir huevo, nacimiento, nombre y presentación.
   Se carga solo cuando se abre la ruta #/tutorial (app.js lo pide perezosamente). Ruta de PRUEBA: no toca state.mascot ni las monedas;
   su avance vive en localStorage 'nexo.tutorial.test.v1'. Más adelante se conecta a cuentas nuevas y a Ajustes → Tutoriales. */
(() => {
  'use strict';
  const HERE = document.currentScript?.src || new URL('tutorial/tutorial.js', document.baseURI).href;
  const asset = p => new URL('../assets/tutorial/' + p, HERE).href;
  const STORE = 'nexo.tutorial.test.v1';
  const ROWS = ['reposo', 'senalar', 'abrir', 'importante', 'feliz', 'sorprendido', 'pensativo', 'triste', 'enojado', 'espiral', 'sudor', 'guino', 'nocreo', 'lista', 'dedo'];
  const KINDS = ['atomo', 'matraz', 'slime'];
  const INFO = {
    atomo:  { nombre: 'Átomo',  pose: 'dedo',        ficha: 'Inteligente. Te corrige con cariño. Probablemente tiene razón.', tono: 620,
              sugeridos: ['Quark', 'Mol', 'Ión'],       hola: n => `Soy ${n}. Calculé que estudiar contigo tiene una probabilidad alta de éxito.` },
    matraz: { nombre: 'Matraz', pose: 'sorprendido', ficha: 'Valiente. Se lanza a todo. A veces sin mirar.', tono: 470,
              sugeridos: ['Chispa', 'Burbuja', 'Bruno'], hola: n => `¡Soy ${n}! ¿Qué explotamos primero? Era broma. Más o menos.` },
    slime:  { nombre: 'Slime',  pose: 'feliz',       ficha: 'Dormilón. Vive tranquilo. Duerme más que tú en época de pruebas.', tono: 260,
              sugeridos: ['Gelatina', 'Flan', 'Nube'],  hola: n => `Hola. Soy ${n}. …¿Hay almohadas por aquí?` }
  };
  const NAME_OK = /^\p{L}+(?:-?\p{N}{1,2})?$/u;
  const nameError = v => {
    const t = v.trim();
    if (t.length < 2) return 'Mínimo 2 caracteres.';
    if (t.length > 12) return 'Máximo 12 caracteres.';
    if (!NAME_OK.test(t)) return 'Solo letras (y un número o guion al final).';
    return '';
  };

  // Pasos del tramo 1 (guion 1–10). text puede ser función del estado s.
  const STEPS = [
    { id: 'g1', pose: 'dormido', text: 'Zzz… ¿eh? ¿Alguien abrió el libro?' },
    { id: 'g1b', pose: 'sorprendido', text: '¡Un estudiante! Hace siglos que nadie me abría.' },
    { id: 'g2', pose: 'feliz', text: 'Soy el Grimorio. Estudio contigo, tú haces el trabajo y yo me llevo el crédito. Es un buen trato.' },
    { id: 'g3', pose: 'pensativo', text: 'Antes de empezar necesitas un compañero. Mira lo que encontré en la repisa…' },
    { id: 'huevos', pose: 'guino', text: 'Elige uno. Es para siempre, así que nada de arrepentirse.', scene: 'huevos', needs: 'kind', next: 'Elegir este huevo' },
    { id: 'seguro', pose: 'nocreo', text: 'Última pregunta antes de confirmar: ¿seguro? No hay devolución.', scene: 'uno', next: 'Sí, es este', back: 'Mejor otro' },
    { id: 'nace', scene: 'nace', noBack: true, auto: true },
    { id: 'nombre', pose: 'feliz', text: 'Ahora el nombre. Será el que escuches cuando te alienten y cuando saques un 7. Elige bien.', scene: 'nombre', needs: 'draft', next: 'Ponerle ese nombre', noBack: true },
    { id: 'graba', pose: 'importante', text: s => `${s.draft.trim()}. Queda grabado en tinta que no sale. Última confirmación.`, scene: 'mascota', next: 'Confirmar' },
    { id: 'hola', who: 'M', text: s => INFO[s.kind].hola(s.name), scene: 'mascota', noBack: true },
    { id: 'fin', pose: 'feliz', text: s => `Hasta aquí llega el tramo de prueba. ${s.name} y yo seguimos pronto con el refugio, las clases y los juegos.`, scene: 'mascota', next: 'Reiniciar prueba', noBack: true }
  ];

  const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (_) { return {}; } };
  const save = s => { try { localStorage.setItem(STORE, JSON.stringify({ i: s.i, kind: s.kind, draft: s.draft, name: s.name })); } catch (_) { /* sin almacenamiento */ } };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let cssLoaded = false, pixelLoading = null;

  function ensureCss() {
    if (cssLoaded) return; cssLoaded = true;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('./tutorial.css?v=1', HERE).href; document.head.append(l);
  }
  function ensurePixel() {
    if (window.PixelMascotas) return Promise.resolve(window.PixelMascotas);
    pixelLoading = pixelLoading || new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = new URL('../mascot/pixelmascotas.js?v=1', HERE).href; s.onload = () => ok(window.PixelMascotas); s.onerror = fail; document.head.append(s);
    });
    return pixelLoading;
  }

  function render(app, opts = {}) {
    ensureCss();
    const sound = opts.sound || (() => false);
    const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saved = load();
    const s = { i: Math.min(saved.i || 0, STEPS.length - 1), kind: KINDS.includes(saved.kind) ? saved.kind : '', draft: saved.draft || '', name: saved.name || '' };
    if (STEPS[s.i].id === 'nace') s.i = STEPS.findIndex(x => x.id === 'nace');   // si cerró a media eclosión, la repite

    app.innerHTML = '';
    const root = el('section', 'tut');
    root.innerHTML = `
      <div class="tut-top"><div class="tut-bar" role="progressbar" aria-label="Avance del tutorial" aria-valuemin="0" aria-valuemax="100"><i></i></div>
        <button class="tut-skip secondary-btn" type="button">Salir</button></div>
      <div class="tut-scene"></div>
      <div class="tut-talk">
        <div class="tut-grim" aria-hidden="true"></div>
        <div class="tut-box"><div class="tut-tag"></div><p class="tut-text" aria-live="polite"></p><span class="tut-arrow" aria-hidden="true"></span></div>
      </div>
      <div class="tut-nav"><button class="secondary-btn tut-back" type="button">Atrás</button><button class="primary-btn tut-next" type="button">Siguiente</button></div>`;
    app.append(root);
    const $ = q => root.querySelector(q);
    const sceneEl = $('.tut-scene'), grim = $('.tut-grim'), tagEl = $('.tut-tag'), textEl = $('.tut-text'), box = $('.tut-box'),
      nextBtn = $('.tut-next'), backBtn = $('.tut-back'), barEl = $('.tut-bar'), talk = $('.tut-talk');
    root.style.setProperty('--tut-egg-url', `url(${asset('huevo-atomo.png')})`);

    const sizeVars = () => { const small = innerWidth < 700; root.style.setProperty('--s', small ? 2 : 4); root.style.setProperty('--e', small ? 2 : 3); root.style.setProperty('--m', small ? 4 : 6); };
    sizeVars(); addEventListener('resize', sizeVars);

    let timers = [], typeTimer = 0, typing = false, mouthCol = 0, pose = 'reposo', busy = false, raf = 0;
    const alive = () => root.isConnected;
    const later = (ms, fn) => { const t = setTimeout(() => { if (alive()) fn(); }, ms); timers.push(t); return t; };
    const clearAll = () => { timers.forEach(clearTimeout); timers = []; clearTimeout(typeTimer); typing = false; };

    // ——— Sonido: bips de 8 bits (respetan el ajuste de sonido de la app) ———
    let ac = null;
    const beep = hz => {
      if (!sound()) return;
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        const o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.value = hz * (0.92 + Math.random() * 0.16);
        g.gain.value = 0.025; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.04);
      } catch (_) { /* sin audio */ }
    };

    // ——— Grimorio ———
    function drawGrim(name, col = 0) {
      pose = name;
      if (name === 'dormido') {
        grim.style.backgroundImage = `url(${asset('grimorio-v1.png')})`;
        grim.style.backgroundSize = 'calc(var(--s) * 340px) calc(var(--s) * 76px)';
        grim.style.backgroundPosition = 'calc(var(--s) * -272px) 0';
        return;
      }
      const row = Math.max(0, ROWS.indexOf(name));
      grim.style.backgroundImage = `url(${asset('grimorio-hablar.png')})`;
      grim.style.backgroundSize = `calc(var(--s) * 204px) calc(var(--s) * ${76 * ROWS.length}px)`;
      grim.style.backgroundPosition = `calc(var(--s) * ${-68 * col}px) calc(var(--s) * ${-76 * row}px)`;
    }
    const speakerIsPet = () => STEPS[s.i].who === 'M';

    // ——— Texto letra por letra ———
    function say(text, who = 'G', then) {
      clearTimeout(typeTimer);
      tagEl.textContent = who === 'M' ? (s.name || INFO[s.kind]?.nombre || '') : 'Grimorio';
      box.classList.remove('done');
      let k = 0; typing = true; textEl.textContent = '';
      const hz = who === 'M' ? INFO[s.kind].tono : 380;
      const tick = () => {
        if (!alive()) return;
        k++; textEl.textContent = text.slice(0, k);
        if (who === 'G' && pose !== 'dormido') drawGrim(pose, [1, 2, 1, 0][k % 4]);
        if (k % 2 === 0 && /\S/.test(text[k - 1])) beep(hz);
        if (k >= text.length) { finishType(); if (then) then(); return; }
        typeTimer = setTimeout(tick, /[.,…?!]/.test(text[k - 1]) ? 150 : 28);
      };
      tick();
    }
    function finishType() {
      typing = false; box.classList.add('done');
      if (pose !== 'dormido' && !speakerIsPet()) drawGrim(pose, 0);
    }
    function skipType(full) {
      clearTimeout(typeTimer); textEl.textContent = full; finishType();
    }

    // ——— Mascota real (dibujo de la app) ———
    const pets = [];
    function petCanvas(kind, expr = 'feliz') {
      const c = el('canvas', 'tut-pet'); c.width = 40; c.height = 44; c.setAttribute('aria-hidden', 'true');
      const item = { c, kind, expr, hop: 0, arm: 'rest' };
      pets.push(item);
      ensurePixel().then(() => { if (alive() && !raf) raf = requestAnimationFrame(loop); }).catch(() => {});
      return item;
    }
    function loop(now) {
      raf = 0; const P = window.PixelMascotas; if (!P || !alive()) return;
      const t = reduced() ? 0 : now / 1000, blink = (t % 3.4) < .13 && !reduced();
      pets.forEach(p => {
        if (!p.c.isConnected) return;
        const k = p.kind, st = { t, sx: 1, sy: 1 + .02 * Math.sin(t * 2), bodyTilt: 0, rootTilt: 0, hop: p.hop, lift: k === 'atomo' ? 2 + Math.sin(t * 2) * 1.5 : 0,
          slosh: 4 * Math.sin(t * 2), cork: 0, tag: 8 * Math.sin(t * 2), footL: 0, footR: 0, spin: 0, excite: 0, drip: 0, hat: 3 * Math.sin(t * 3), look: [0, 0],
          blink, expr: p.expr, outfit: {}, arms: P.armPose(p.arm, t) };
        const ctx = p.c.getContext('2d'); ctx.clearRect(0, 0, 40, 44); P.render(ctx, k, st);
      });
      raf = requestAnimationFrame(loop);
    }

    // ——— Huevos ———
    function eggEl(kind, frame = 0, cls = '') {
      const e = el('div', 'tut-egg ' + cls); e.dataset.kind = kind;
      e.style.backgroundImage = `url(${asset('huevo-' + kind + '.png')})`;
      setEgg(e, frame); return e;
    }
    const setEgg = (e, f) => { e.style.backgroundPosition = `calc(var(--e) * ${-56 * f}px) 0`; };

    // ——— Escenas ———
    function scene(name) {
      clearInterval(scene.iv); sceneEl.innerHTML = ''; sceneEl.dataset.scene = name || '';
      pets.length = 0;
      if (name === 'huevos') {
        const row = el('div', 'tut-eggs', ''); sceneEl.append(row);
        KINDS.forEach(k => {
          const b = el('button', 'tut-egg-btn'); b.type = 'button'; b.setAttribute('aria-label', 'Huevo de ' + INFO[k].nombre.toLowerCase());
          b.append(eggEl(k)); b.classList.toggle('on', s.kind === k);
          b.addEventListener('click', () => {
            s.kind = k; save(s); row.querySelectorAll('.tut-egg-btn').forEach(x => x.classList.toggle('on', x === b));
            drawGrim(INFO[k].pose); say(INFO[k].ficha); refresh();
          });
          row.append(b);
        });
      } else if (name === 'uno') {
        sceneEl.append(el('div', 'tut-eggs')); sceneEl.firstChild.append(eggEl(s.kind, 0, 'big'));
      } else if (name === 'nombre') {
        const p = petCanvas(s.kind, 'feliz'); const wrap = el('div', 'tut-mascot'); wrap.append(p.c); sceneEl.append(wrap);
        const f = el('div', 'tut-name', `<label for="tut-name-in">Nombre de tu mascota</label>
          <input id="tut-name-in" maxlength="12" autocomplete="off" spellcheck="false" placeholder="2 a 12 caracteres">
          <div class="tut-sug"></div><p class="tut-err" aria-live="polite"></p>`);
        const inp = f.querySelector('input'), err = f.querySelector('.tut-err');
        inp.value = s.draft;
        INFO[s.kind].sugeridos.forEach(n => { const b = el('button', 'secondary-btn', esc(n)); b.type = 'button'; b.addEventListener('click', () => { inp.value = n; inp.dispatchEvent(new Event('input')); }); f.querySelector('.tut-sug').append(b); });
        inp.addEventListener('input', () => { s.draft = inp.value; err.textContent = inp.value && nameError(inp.value) ? nameError(inp.value) : ''; save(s); refresh(); });
        sceneEl.append(f);
      } else if (name === 'mascota') {
        const p = petCanvas(s.kind, 'feliz'); const wrap = el('div', 'tut-mascot big'); wrap.append(p.c); sceneEl.append(wrap);
      }
    }

    // ——— Nacimiento con suspenso (~11 s) ———
    function nace() {
      busy = true; refresh();
      const wrap = el('div', 'tut-eggs'); const egg = eggEl(s.kind, 0, 'big'); wrap.append(egg); sceneEl.append(wrap);
      const flash = el('div', 'tut-flash'); sceneEl.append(flash);
      const mascot = petCanvas(s.kind, 'feliz'); const m = el('div', 'tut-mascot hatch'); m.append(mascot.c); m.hidden = true; sceneEl.append(m);
      let shake = 0;
      const frame = f => setEgg(egg, f);
      drawGrim('sudor'); say('Está temblando… ¿es normal? Creo que es normal.');
      later(1500, () => { shake = 1; if (!reduced()) egg.classList.add('shake'); frame(1); });
      scene.iv = setInterval(() => { if (shake && alive()) frame(Date.now() % 240 < 120 ? 1 : 2); }, 120);
      later(3600, () => { frame(3); flash.className = 'tut-flash on'; later(450, () => { flash.className = 'tut-flash'; frame(1); }); });
      later(5200, () => { shake = 0; frame(4); egg.classList.add('hard'); });
      later(6700, () => { frame(5); drawGrim('importante'); say('¡NO SÉ SI ES NORMAL!'); });
      later(8300, () => { frame(6); drawGrim('espiral'); });
      later(9800, () => { shake = 0; egg.classList.remove('shake', 'hard'); frame(7); flash.className = 'tut-flash on big'; drawGrim('sorprendido'); beep(900); });
      later(10500, () => {
        flash.className = 'tut-flash'; frame(8); m.hidden = false; mascot.hop = 3;
        const t0 = performance.now(); const hop = () => { if (!alive()) return; const d = (performance.now() - t0) / 1000; mascot.hop = d < 1.6 ? Math.abs(Math.sin(d * 6)) * 5 : 0; if (d < 1.6) requestAnimationFrame(hop); };
        hop();
        drawGrim('feliz'); say('¡Nació!', 'G', () => { busy = false; refresh(); });
      });
    }

    // ——— Navegación ———
    function textOf(step) { return typeof step.text === 'function' ? step.text(s) : step.text; }
    function refresh() {
      const step = STEPS[s.i];
      const needOk = !step.needs || (step.needs === 'kind' ? !!s.kind : !nameError(s.draft));
      nextBtn.disabled = busy || !needOk;
      nextBtn.textContent = step.next || (s.i === STEPS.length - 1 ? 'Reiniciar prueba' : 'Siguiente');
      backBtn.disabled = busy || s.i === 0 || !!step.noBack;
      backBtn.textContent = step.back || 'Atrás';
      barEl.firstElementChild.style.width = Math.round(s.i / (STEPS.length - 1) * 100) + '%';
      barEl.setAttribute('aria-valuenow', Math.round(s.i / (STEPS.length - 1) * 100));
    }
    function show(i) {
      clearAll(); clearInterval(scene.iv); busy = false; s.i = i; save(s);
      const step = STEPS[i];
      talk.classList.toggle('pet', step.who === 'M');
      scene(step.scene);
      if (step.who === 'M') { grim.style.backgroundImage = 'none'; tagEl.textContent = s.name; say(textOf(step), 'M'); }
      else if (step.scene === 'nace') { nace(); }
      else { drawGrim(step.pose); say(textOf(step)); }
      refresh();
    }
    nextBtn.addEventListener('click', () => {
      const step = STEPS[s.i];
      if (typing && !busy) { skipType(textOf(step)); return; }
      if (step.id === 'nombre') s.draft = s.draft.trim();
      if (step.id === 'graba') s.name = s.draft.trim();
      if (s.i >= STEPS.length - 1) { try { localStorage.removeItem(STORE); } catch (_) {} Object.assign(s, { kind: '', draft: '', name: '' }); show(0); return; }
      show(s.i + 1);
    });
    backBtn.addEventListener('click', () => { if (s.i > 0) show(s.i - 1); });
    box.addEventListener('click', () => { if (typing && !busy) skipType(textOf(STEPS[s.i])); });
    $('.tut-skip').addEventListener('click', () => { clearAll(); if (opts.exit) opts.exit(); else location.hash = '#/home'; });
    show(s.i);
  }

  window.NexoTutorial = { render };
})();
