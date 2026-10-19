/* Tutorial de Nexo (docs/tutorial/SPEC.md y GUION.md). Tramo 1: despertar del Grimorio, elegir huevo, nacimiento, nombre y presentación.
   Se carga solo cuando se abre la ruta #/tutorial (app.js lo pide perezosamente). Ruta de PRUEBA: no toca state.mascot ni las monedas;
   su avance vive en localStorage 'nexo.tutorial.test.v1'. Más adelante se conecta a cuentas nuevas y a Ajustes → Tutoriales. */
(() => {
  'use strict';
  const HERE = document.currentScript?.src || new URL('tutorial/tutorial.js', document.baseURI).href;
  const asset = p => new URL('../assets/tutorial/' + p, HERE).href;
  const STORE_TEST = 'nexo.tutorial.test.v1', STORE_REAL = 'nexo.tutorial.v1';
  let STORE = STORE_TEST;
  const KINDS = ['atomo', 'matraz', 'slime'];
  const INFO = {
    atomo:  { nombre: 'Átomo',  pose: 'dedo',        ficha: 'Inteligente. Te corrige con cariño. Probablemente tiene razón.', tono: 620,
              sugeridos: ['Quark', 'Mol', 'Ión'],       grito: '¡EUREKA! …creo. Sí. Sí, fue eureka.', hola: n => `Soy ${n}. Calculé que estudiar contigo tiene una probabilidad alta de éxito.` },
    matraz: { nombre: 'Matraz', pose: 'sorprendido', ficha: 'Valiente. Se lanza a todo. A veces sin mirar.', tono: 470,
              sugeridos: ['Chispa', 'Burbuja', 'Bruno'], grito: '¡BLUP! ¡Estoy vivo! ¡Hola, mundo!', hola: n => `¡Soy ${n}! ¿Qué explotamos primero? Era broma. Más o menos.` },
    slime:  { nombre: 'Slime',  pose: 'feliz',       ficha: 'Dormilón. Vive tranquilo. Duerme más que tú en época de pruebas.', tono: 260,
              sugeridos: ['Gelatina', 'Flan', 'Nube'],  grito: '…bluuu. ¿Ya? ¿Tan pronto?', hola: n => `Hola. Soy ${n}. …¿Hay almohadas por aquí?` }
  };
  // Qué dice la mascota al tocar cada objeto del refugio (ids de NexoHomeScene.getProfile().hotspots; guion paso 12).
  const OBJETOS = {
    'window-focus': ['Ventana', 'Resalta la luz de entrada. Cambia con la hora y el clima de verdad.'],
    'staff-shop': ['Báculo estelar', 'Abre la Tienda.'],
    'armchair-profile': ['Sillón', 'Tu Perfil: mascota, estadísticas y ajustes.'],
    'map-logbook': ['Mapa enrollado', 'La Bitácora: tus notas y calificaciones.'],
    'parchment-calendar': ['Pergamino de la pared', 'El calendario con tus fechas.'],
    'bookshelf-library': ['Estantería', 'La Biblioteca.'],
    'globe-knowledge': ['Globo dorado', 'El mapa de conocimiento: qué dominas y qué no.'],
    'desk-continue': ['Escritorio', 'Continuar estudiando justo donde lo dejaste.']
  };
  const BANNED_PARTS = ['mierda', 'conchetumare', 'weon', 'hueon', 'huevon', 'culiao', 'maricon', 'chucha', 'pendejo', 'cabron', 'carajo', 'follar', 'nazi', 'hitler', 'fuck', 'shit', 'bitch', 'cunt', 'nigg', 'porn', 'sexo', 'vagina'];
  const BANNED_EXACT = ['ano', 'tonto', 'tonta', 'idiota', 'imbecil', 'estupido', 'estupida', 'gay', 'puta', 'puto', 'pico', 'pene', 'marica', 'coger', 'concha', 'culia', 'zorra', 'verga'];
  const plain = v => v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[0@]/g, m => (m === '@' ? 'a' : 'o')).replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/[^a-z]/g, '');
  const NAME_OK = /^\p{L}+(?:-?\p{N}{1,2})?$/u;
  const nameError = v => {
    const t = v.trim();
    if (t.length < 2) return 'Mínimo 2 caracteres.';
    if (t.length > 12) return 'Máximo 12 caracteres.';
    if (!NAME_OK.test(t)) return 'Solo letras (y un número o guion al final).';
    const q = plain(t);
    if (BANNED_EXACT.includes(q) || BANNED_PARTS.some(w => q.includes(w))) return 'Elige otro nombre, por favor.';
    return '';
  };

  // Pasos del tramo 1 (guion 1–10). text puede ser función del estado s.
  const STEPS = [
    { id: 'g1', pose: 'dormido', text: '~Zzz… ¿quién roza mis páginas?' },
    { id: 'g1b', pose: 'sorprendido', text: 'Una mano viva. Hacía siglos que ningún estudiante me abría.' },
    { id: 'g2', pose: 'feliz', text: 'Soy el *Grimorio*. Guardo lo que se aprende. Tú haces el trabajo… yo me llevo el crédito. Es un buen trato.' },
    { id: 'g3', pose: 'pensativo', text: 'Nadie cruza esta torre solo. Mira lo que dormía en la repisa…' },
    { id: 'huevos', pose: 'guino', text: 'Elige uno. Es para *siempre*, así que nada de arrepentirse.', scene: 'huevos', needs: 'kind', next: 'Elegir este huevo' },
    { id: 'seguro', pose: 'nocreo', text: 'Una pregunta antes de sellar el pacto: ¿*seguro*? Los huevos no aceptan devoluciones.', scene: 'uno', next: 'Sí, es este', back: 'Mejor otro' },
    { id: 'nace', scene: 'nace', noBack: true, auto: true },
    { id: 'nombre', pose: 'feliz', text: 'Ahora el *nombre*. Será la voz que te aliente… y la que celebre tu 7. Elígelo con cuidado.', scene: 'nombre', needs: 'draft', next: 'Ponerle ese nombre', noBack: true },
    { id: 'graba', pose: 'importante', text: s => `${s.draft.trim()}… Queda grabado en tinta que no se borra. Última confirmación.`, scene: 'mascota', next: 'Confirmar' },
    { id: 'hola', who: 'M', text: s => INFO[s.kind].hola(s.name), scene: 'mascota', noBack: true },
    { id: 'ref1', who: 'M', text: 'Este es el refugio: tu base. Cambia con la hora del día y el clima, y siempre vuelves aquí.', scene: 'refugio', noBack: true },
    { id: 'ref2', who: 'M', text: 'Toca los objetos. Cada uno hace algo distinto.', scene: 'refugio', objetos: true, needs: 'seen', next: 'Ya los toqué todos' },
    { id: 'vest', who: 'M', text: 'Aquí me vistes y compras cosas con monedas. Sí, tengo opiniones sobre mi sombrero.', scene: 'refugio' },
    { id: 'rec-inicio', pose: 'senalar', text: 'Basta de maquetas. Ven, te enseño tu torre *de verdad*.', scene: 'mascota', next: 'Vamos', recorrido: 'inicio' },
    { id: 'dato1', pose: 'pensativo', text: 'Dato: volver cada día, aunque sea poco, pesa más que una sola noche heroica. El *espaciado* funciona.', scene: 'mascota' },
    { id: 'rec-aprender', pose: 'senalar', text: 'Ahora *bajemos*: el sótano de los cristales, donde se estudia de verdad. Sígueme.', scene: 'mascota', next: 'Vamos', recorrido: 'aprender' },
    { id: 'evid', pose: 'dedo', text: 'Releer da *sensación* de dominio. Acertar sin ayuda da dominio *de verdad*. Por eso te pido responder antes de mostrarte nada.', scene: 'panel',
      panel: '<div class="tut-vs"><div><h4>Releer</h4><p>Se siente fácil.<br>Se olvida rápido.</p></div><div class="win"><h4>Responder sin mirar</h4><p>Cuesta un poco.<br>Se queda.</p></div></div><small class="tut-cite">Roediger y Karpicke, 2006: practicar recordando supera a releer cuando se evalúa días después.</small>' },
    { id: 'espac', pose: 'importante', text: 'Te haré volver a temas viejos justo antes de que se disuelvan en la niebla. Molesta un poco. Funciona.', scene: 'panel',
      panel: '<div class="tut-time"><span>Día 1</span><i></i><span>Día 3</span><i class="l"></i><span>Día 8</span><i class="xl"></i><span>Día 21</span></div><small class="tut-cite">Cepeda et al., 2006: repartir el repaso en el tiempo mejora el recuerdo a largo plazo frente a hacerlo todo junto.</small>' },
    { id: 'error', pose: 'pensativo', text: 'Equivocarte no es el fin. Es *información*: la ruta se ajusta a lo que fallaste.', scene: 'panel',
      panel: '<div class="tut-path"><b>Fallo</b><i></i><b>Pista</b><i></i><b>Ruta ajustada</b></div>' },
    { id: 'monedas', pose: 'feliz', text: 'Aquí ganas *monedas*… y las gastas en la tienda del refugio.', scene: 'panel',
      panel: '<div class="tut-path"><b>Juegas</b><i></i><b>Ganas monedas</b><i></i><b>Tienda</b></div>' },
    { id: 'dato2', pose: 'guino', text: 'Dato: jugar no es perder el tiempo. Te obliga a recordar sin mirar, que es justo lo que *funciona*.', scene: 'panel',
      panel: '<div class="tut-vs"><div><h4>Mirar la respuesta</h4><p>Se siente bien.<br>Enseña poco.</p></div><div class="win"><h4>Recordarla jugando</h4><p>Cuesta un poco.<br>Se queda.</p></div></div>' },
    { id: 'rec-organizacion', pose: 'senalar', text: 'Ahora tu *estudio de planos*: fechas, plan del día, notas y labs.', scene: 'mascota', next: 'Vamos', recorrido: 'organizacion' },
    { id: 'rec-perfil', pose: 'importante', text: 'Por último, tu *perfil*. Sígueme.', scene: 'mascota', next: 'Vamos', recorrido: 'perfil' },
    { id: 'premio', who: 'M', text: '¡Terminamos! Esto es para ti. Gasta con cabeza.', scene: 'premio', noBack: true },
    { id: 'fin', pose: 'feliz', text: 'Fue un honor. Si me necesitas, estoy en Ajustes… y no, no me pagan.', scene: 'mascota', noBack: true }
  ];

  const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (_) { return {}; } };
  const save = s => { try { localStorage.setItem(STORE, JSON.stringify({ i: s.i, kind: s.kind, draft: s.draft, name: s.name, seen: s.seen })); } catch (_) { /* sin almacenamiento */ } };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let cssLoaded = false, pixelLoading = null;

  function ensureCss() {
    if (cssLoaded) return; cssLoaded = true;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('./tutorial.css?v=16', HERE).href; document.head.append(l);
  }
  function ensurePixel() {
    if (window.PixelMascotas) return Promise.resolve(window.PixelMascotas);
    pixelLoading = pixelLoading || new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = new URL('../mascot/pixelmascotas.js?v=1', HERE).href; s.onload = () => ok(window.PixelMascotas); s.onerror = fail; document.head.append(s);
    });
    return pixelLoading;
  }

  let magiaLoading = null;
  function ensureMagia() {
    if (window.NexoMagia) return Promise.resolve(window.NexoMagia);
    magiaLoading = magiaLoading || new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = new URL('./magia.js?v=5', HERE).href; s.onload = () => ok(window.NexoMagia); s.onerror = fail; document.head.append(s);
    });
    return magiaLoading;
  }

  let huevosLoading = null;
  function ensureHuevos() {
    if (window.NexoHuevos) return Promise.resolve(window.NexoHuevos);
    huevosLoading = huevosLoading || new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = new URL('./huevos.js?v=1', HERE).href; s.onload = () => ok(window.NexoHuevos); s.onerror = fail; document.head.append(s);
    });
    return huevosLoading;
  }

  let vivoLoading = null;
  function ensureVivo() {
    if (window.NexoGrimorioVivo) return Promise.resolve(window.NexoGrimorioVivo);
    vivoLoading = vivoLoading || new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = new URL('./grimorio-vivo.js?v=3', HERE).href; s.onload = () => ok(window.NexoGrimorioVivo); s.onerror = fail; document.head.append(s);
    });
    return vivoLoading;
  }

  let recLoading = null;
  function ensureRecorrido() {
    if (window.NexoRecorrido) return Promise.resolve(window.NexoRecorrido);
    recLoading = recLoading || new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = new URL('./recorrido.js?v=17', HERE).href; s.onload = () => ok(window.NexoRecorrido); s.onerror = fail; document.head.append(s);
    });
    return recLoading;
  }

  function render(app, opts = {}) {
    ensureCss();
    const mode = opts.mode || 'test', api = opts.api || null;
    STORE = mode === 'test' ? STORE_TEST : STORE_REAL;
    const sound = opts.sound || (() => false);
    const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PRE = new Set(['g1', 'g1b', 'g2', 'g3', 'huevos', 'seguro', 'nace', 'nombre', 'graba', 'hola']);
    const steps = STEPS.filter(x => !(mode === 'replay' && PRE.has(x.id)) && !(x.id === 'premio' && mode !== 'test' && !(api && api.canReward())));
    const saved = load();
    const s = { i: Math.min(saved.i || 0, steps.length - 1), kind: mode === 'replay' ? api.pet().kind : KINDS.includes(saved.kind) ? saved.kind : '', draft: saved.draft || '', name: mode === 'replay' ? api.pet().name : saved.name || '', seen: Array.isArray(saved.seen) ? saved.seen : [] };
    if (steps[s.i].id === 'nace') s.i = steps.findIndex(x => x.id === 'nace');   // si cerró a media eclosión, la repite

    app.innerHTML = '';
    const root = el('section', 'tut');
    root.innerHTML = `
      <div class="tut-top"><div class="tut-bar" role="progressbar" aria-label="Avance del tutorial" aria-valuemin="0" aria-valuemax="100"><i></i></div>
        <button class="tut-mute secondary-btn" type="button" aria-label="Silenciar voces" title="Voces">♪</button><button class="tut-skip secondary-btn" type="button">Salir</button></div>
      <div class="tut-scene"></div>
      <div class="tut-talk">
        <div class="tut-grim" aria-hidden="true"></div>
        <div class="tut-box"><i class="tut-chispa a"></i><i class="tut-chispa b"></i><i class="tut-chispa c"></i><i class="tut-chispa d"></i><div class="tut-tag"></div><p class="tut-text" aria-live="polite"></p><span class="tut-arrow" aria-hidden="true"></span></div>
      </div>
      <div class="tut-nav"><button class="secondary-btn tut-back" type="button">Atrás</button><button class="primary-btn tut-next" type="button">Siguiente</button></div>`;
    app.append(root);
    let magia = null, aura = null, vivo = null;
    ensureVivo().then(V => { if (!root.isConnected) return; vivo = V.mount(grim); vivo.set(pose); vivo.talk(typing); }).catch(() => {});
    ensureMagia().then(M => { if (!root.isConnected) return; magia = M.mount(root); if (!reduced()) aura = M.aura(grim); }).catch(() => {});
    const $ = q => root.querySelector(q);
    const sceneEl = $('.tut-scene'), grim = $('.tut-grim'), tagEl = $('.tut-tag'), textEl = $('.tut-text'), box = $('.tut-box'),
      nextBtn = $('.tut-next'), backBtn = $('.tut-back'), barEl = $('.tut-bar'), talk = $('.tut-talk');
    grim.innerHTML = '<i class="tut-llama l"></i><i class="tut-llama r"></i>';
    root.style.setProperty('--tut-egg-url', `url(${asset('huevo-atomo.png')})`);

    const sizeVars = () => { const small = innerWidth < 700; root.style.setProperty('--s', small ? 2 : 4); root.style.setProperty('--e', small ? 2 : 3); root.style.setProperty('--m', small ? 4 : 6); };
    sizeVars(); addEventListener('resize', sizeVars);

    let curText = '', timers = [], typeTimer = 0, typing = false, mouthCol = 0, pose = 'reposo', busy = false, raf = 0;
    const alive = () => root.isConnected;
    const later = (ms, fn) => { const t = setTimeout(() => { if (alive()) fn(); }, ms); timers.push(t); return t; };
    const clearAll = () => { timers.forEach(clearTimeout); timers = []; clearTimeout(typeTimer); typing = false; };

    // ——— Sonido: voz de videojuego (un "blip" por letra, tono al azar en escala pentatónica) ———
    // El tutorial suena por defecto (la voz es parte de la experiencia); se apaga con el botón ♪ (se recuerda en este navegador).
    let ac = null;
    const MUTE = 'nexo.tutorial.mute';
    const muted = () => { try { return localStorage.getItem(MUTE) === '1'; } catch (_) { return false; } };
    const STEPS_UP = [-5, -3, 0, 2, 4, 7];
    // Timbre por especie: [onda, múltiplo del tono, volumen]; glide = hacia dónde se desliza el tono; dur = largo del blip.
    const TIMBRE = {
      atomo:  { osc: [['square', 1, .5], ['triangle', .5, .9]], glide: 1, dur: 1 },            // seco y nítido
      matraz: { osc: [['sawtooth', 1, .28], ['sine', 1.5, .6]], glide: 1.35, dur: 1.15 },       // burbujeante: el tono sube
      slime:  { osc: [['sine', 1, .95], ['triangle', .5, .7]], glide: .78, dur: 1.9 }           // blando: el tono cae
    };
    const audio = () => { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; };
    // Voz del Grimorio: un golpecito grave y hueco por letra (onda de pulso angosta, tono casi fijo), aprobado por Niquito el 18 oct.
    let pulso = null;
    function vozGrimorio(fx, brillo) {
      if (muted()) return;
      try {
        audio(); const t = ac.currentTime, f = 140 * (brillo ? 1.2 : 1) * (1 + (Math.random() - .5) * .05) * (fx === 'tiembla' ? 1.05 : 1), v = fx === 'susurro' ? 0.04 : 0.1;
        if (!pulso) {   // pulso de ancho 25 %: coeficientes de Fourier
          const re = new Float32Array(33), im = new Float32Array(33);
          for (let n = 1; n < 33; n++) { re[n] = Math.sin(2 * Math.PI * n * .25) / (n * Math.PI); im[n] = (1 - Math.cos(2 * Math.PI * n * .25)) / (n * Math.PI); }
          pulso = ac.createPeriodicWave(re, im);
        }
        const o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
        o.setPeriodicWave(pulso); o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 3500;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.065);
        o.connect(lp); lp.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.07);
      } catch (_) { /* sin audio */ }
    }
    const beep = (hz, big = false, kind) => {
      if (muted()) return;
      try {
        audio();
        const t = ac.currentTime, f = hz * 2 ** (STEPS_UP[Math.floor(Math.random() * STEPS_UP.length)] / 12) * (big ? 1.5 : 1);
        const out = ac.createGain(); out.connect(ac.destination);
        out.gain.setValueAtTime(0.0001, t); out.gain.linearRampToValueAtTime(big ? 0.16 : 0.1, t + 0.006); out.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 0.16 : 0.075));
        const tm = TIMBRE[kind] || TIMBRE.atomo, len = (big ? 0.18 : 0.09) * tm.dur;
        out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(0.0001, t); out.gain.linearRampToValueAtTime(big ? 0.16 : 0.1, t + 0.006); out.gain.exponentialRampToValueAtTime(0.0001, t + len - 0.01);
        tm.osc.forEach(([type, m, v]) => {
          const o = ac.createOscillator(), g = ac.createGain(); o.type = type; g.gain.value = v;
          o.frequency.setValueAtTime(f * m, t); if (tm.glide !== 1) o.frequency.exponentialRampToValueAtTime(f * m * tm.glide, t + len);
          o.connect(g); g.connect(out); o.start(t); o.stop(t + len);
        });
      } catch (_) { /* sin audio */ }
    };

    // ——— Grimorio ———
    const px = () => parseFloat(root.style.getPropertyValue('--s')) || 4;
    const hop = () => { if (vivo) vivo.kick((Math.random() < .5 ? -1 : 1) * 2.2); grim.animate([{ translate: '0 0' }, { translate: `0 ${-2 * px()}px` }, { translate: '0 0' }], { duration: 150, easing: 'ease-out' }); };
    // Gesto por emoción: se anima solo translate/rotate/scale (la flotación usa transform, así que no chocan).
    const GESTOS = {
      sorprendido: [[{ translate: '0 0', scale: '1 1' }, { translate: '0 -4u', scale: '.92 1.14', offset: .3 }, { translate: '0 0', scale: '1.08 .92', offset: .62 }, { translate: '0 0', scale: '1 1' }], 520],
      enojado: [[{ rotate: '0deg' }, { rotate: '-4deg' }, { rotate: '4deg' }, { rotate: '-3deg' }, { rotate: '3deg' }, { rotate: '0deg' }], 480],
      triste: [[{ translate: '0 0', scale: '1 1' }, { translate: '0 2u', scale: '1.03 .94' }, { translate: '0 1u', scale: '1.01 .97' }], 900],
      feliz: [[{ translate: '0 0' }, { translate: '0 -3u', offset: .22 }, { translate: '0 0', offset: .45 }, { translate: '0 -2u', offset: .7 }, { translate: '0 0' }], 560],
      guino: [[{ rotate: '0deg' }, { rotate: '8deg', offset: .35 }, { rotate: '0deg' }], 450],
      pensativo: [[{ rotate: '0deg' }, { rotate: '-5deg', offset: .4 }, { rotate: '3deg', offset: .75 }, { rotate: '0deg' }], 900],
      espiral: [[{ rotate: '0deg' }, { rotate: '14deg' }, { rotate: '-14deg' }, { rotate: '8deg' }, { rotate: '0deg' }], 760],
      sudor: [[{ translate: '0 0' }, { translate: '-1u 0' }, { translate: '1u 0' }, { translate: '-1u 0' }, { translate: '0 0' }], 420],
      nocreo: [[{ rotate: '0deg' }, { rotate: '-8deg' }, { rotate: '8deg' }, { rotate: '-8deg' }, { rotate: '8deg' }, { rotate: '0deg' }], 620],
      importante: [[{ scale: '1 1' }, { scale: '1.09 1.09', offset: .4 }, { scale: '1 1' }], 380],
      dedo: [[{ scale: '1 1', rotate: '0deg' }, { scale: '1.06 1.06', rotate: '5deg', offset: .4 }, { scale: '1 1', rotate: '0deg' }], 400],
      abrir: [[{ scale: '1 1' }, { scale: '1.07 1.07', offset: .4 }, { scale: '1 1' }], 380]
    };
    function gesto(name) {
      const g = GESTOS[name]; if (!g || reduced()) return;
      grim.animate(g[0].map(k => ({ ...k, translate: k.translate && k.translate.replace(/(-?\d+)u/g, (_, n) => n * px() + 'px') })), { duration: g[1], easing: 'ease-in-out' });
    }
    function drawGrim(name, col = 0) {
      if (name !== pose && !reduced()) { grim.classList.remove('pop'); void grim.offsetWidth; grim.classList.add('pop'); if (aura) { aura.burst(); aura.mood(name); } gesto(name); }
      pose = name;
      if (vivo) { vivo.set(name); vivo.mouth(col); }
    }
    const speakerIsPet = () => steps[s.i].who === 'M';

    // Chispita dorada que sube desde el borde de arriba de la nube al empezar cada palabra.
    function chispita() {
      const c = el('i', 'tut-chispita'); c.setAttribute('aria-hidden', 'true');
      c.style.cssText = `left:${6 + Math.random() * 88}%;top:calc(var(--s) * 1px);--dx:${Math.round((Math.random() - .5) * 8)}px`;
      box.append(c); setTimeout(() => c.remove(), 950);
    }

    // ——— Texto letra por letra ———
    // Marcas del texto: *palabra* brilla en dorado; "~" al inicio = susurro (chico y tenue); "^" al inicio = temblor.
    const PAUSA = { '…': 380, '.': 280, '?': 280, '!': 260, ':': 220, ',': 170, '—': 170 };
    function parse(raw) {
      const fx = raw[0] === '~' ? 'susurro' : raw[0] === '^' ? 'tiembla' : '';
      const plain = [], glow = []; let on = false;
      for (const ch of fx ? raw.slice(1) : raw) { if (ch === '*') { on = !on; continue; } plain.push(ch); glow.push(on); }
      return { fx, plain, glow };
    }
    function paint(p, k, nl) {
      let out = '', open = false;
      for (let j = 0; j < k; j++) {
        if (p.glow[j] !== open) { out += open ? '</b>' : '<b class="gl">'; open = p.glow[j]; }
        out += nl && j === k - 1 ? `<span class="nl">${esc(p.plain[j])}</span>` : esc(p.plain[j]);
      }
      textEl.innerHTML = out + (open ? '</b>' : '');
    }
    let cur = parse(''), altoTexto = 0;
    function say(text, who = 'G', then) {
      clearTimeout(typeTimer); curText = text; cur = parse(text);
      const { plain, glow, fx } = cur, n = plain.length;
      tagEl.textContent = who === 'M' ? (s.name || INFO[s.kind]?.nombre || '') : 'Grimorio';
      box.classList.remove('done', 'susurro', 'tiembla'); if (fx) box.classList.add(fx);
      // Reserva el alto del texto completo (y nunca lo achica entre pasos): así la nube y el botón Siguiente no se mueven mientras se escribe ni al cambiar de paso.
      paint(cur, n, false); textEl.style.minHeight = ''; altoTexto = Math.max(altoTexto, textEl.offsetHeight); textEl.style.minHeight = altoTexto + 'px';
      let k = 0; typing = true; textEl.textContent = ''; if (aura) aura.talk(who === 'G'); if (vivo) vivo.talk(who === 'G');
      if (!reduced()) { box.style.setProperty('--bh', box.offsetHeight + 'px'); box.classList.remove('entra'); void box.offsetWidth; box.classList.add('entra'); }
      const hz = who === 'M' ? INFO[s.kind].tono / 2 : 210;
      const tick = () => {
        if (!alive()) return;
        k++;
        paint(cur, k, !reduced() && k < n);
        const ch = plain[k - 1], inicio = k === 1 || plain[k - 2] === ' ';
        if (who === 'G' && pose !== 'dormido') drawGrim(pose, [1, 2, 1, 0][k % 4]);
        if (who === 'M') { if (/[\p{L}\p{N}]/u.test(ch)) beep(hz, false, s.kind); }
        else if (/\p{L}/u.test(ch)) vozGrimorio(fx, glow[k - 1]);
        if (who === 'G' && !reduced() && inicio && /\S/.test(ch)) hop();
        if (!reduced() && inicio && /\S/.test(ch)) chispita();
        if (k >= n) { finishType(); if (then) then(); return; }
        typeTimer = setTimeout(tick, (PAUSA[ch] || (glow[k - 1] ? 48 : 28)) * (fx === 'susurro' ? 1.5 : 1));
      };
      tick();
    }
    function skipType() { clearTimeout(typeTimer); paint(cur, cur.plain.length, false); finishType(); }
    function finishType() {
      typing = false; box.classList.add('done'); if (aura) aura.talk(false); if (vivo) vivo.talk(false);
      if (pose !== 'dormido' && !speakerIsPet()) drawGrim(pose, 0);
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
      setEgg(e, frame);
      if (!reduced()) ensureHuevos().then(H => { if (alive()) e.fx = H.attach(e, kind); }).catch(() => {});   // vida propia de cada huevo (huevos.js)
      return e;
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
          const vivo = v => () => { const f = b.firstChild.fx; if (f) f.excite(v); };
          ['mouseenter', 'focus'].forEach(ev => b.addEventListener(ev, vivo(true))); ['mouseleave', 'blur'].forEach(ev => b.addEventListener(ev, vivo(false)));
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
      } else if (name === 'premio') {
        const p = petCanvas(s.kind, 'feliz'); const wrap = el('div', 'tut-mascot big'); wrap.append(p.c);
        sceneEl.append(wrap, el('div', 'tut-prize', '+150 ⚛<small>' + (mode === 'test' ? 'premio de prueba: aún no se suma a tus monedas' : 'ya está en tu cuenta') + '</small>'));
      } else if (name === 'panel') {
        sceneEl.append(el('div', 'tut-panel', steps[s.i].panel));
      } else if (name === 'refugio') {
        refugio();
      } else if (name === 'mascota') {
        const p = petCanvas(s.kind, 'feliz'); const wrap = el('div', 'tut-mascot big'); wrap.append(p.c); sceneEl.append(wrap);
      }
    }

    // ——— Refugio de ejemplo: fondo y objetos salen de NexoHomeScene (no se duplican coordenadas) ———
    function refugio() {
      const H = window.NexoHomeScene, prof = H && H.getProfile && H.getProfile();
      if (!prof) { sceneEl.append(el('p', 'tut-err', 'No pude cargar el refugio.')); return; }
      const stage = el('div', 'tut-stage'); stage.style.backgroundImage = `url(${new URL(prof.backgroundAsset, document.baseURI).href})`;
      const objetos = !!steps[s.i].objetos, pc = el('div', 'tut-stage-pet'), p = petCanvas(s.kind, 'feliz');
      const anc = prof.mascotAnchors.rest.point; pc.style.left = anc[0] * 100 + '%'; pc.style.top = anc[1] * 100 + '%'; pc.append(p.c); stage.append(pc);
      const counter = el('div', 'tut-count'); const upd = () => { counter.textContent = `${s.seen.length}/${Object.keys(OBJETOS).length} objetos · toca los que brillan ✦ (puedes seguir cuando quieras)`; };
      prof.hotspots.forEach(h => {
        const info = OBJETOS[h.id]; if (!info) return;
        let [x, y, w, hh] = h.bounds || [0, 0, 1, 1];
        if (h.slot) { const sl = prof.slots.find(q => q.id === h.slot).bounds, i = h.inset; x = sl[0] + sl[2] * i[0]; y = sl[1] + sl[3] * i[1]; w = sl[2] * i[2]; hh = sl[3] * i[3]; }
        const b = el('button', 'tut-hot'); b.type = 'button'; b.disabled = !objetos; b.setAttribute('aria-label', info[0]);
        b.style.cssText = `left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${hh * 100}%`;
        b.classList.toggle('seen', s.seen.includes(h.id));
        b.addEventListener('click', () => {
          stage.querySelectorAll('.tut-hot.on').forEach(q => q.classList.remove('on')); b.classList.add('on', 'seen');
          if (!s.seen.includes(h.id)) { s.seen.push(h.id); save(s); upd(); refresh(); }
          say(`${info[0]}: ${info[1]}`, 'M');
        });
        stage.append(b);
      });
      sceneEl.append(stage);
      if (objetos) { upd(); sceneEl.append(counter); }
    }

    // ——— Nacimiento con suspenso (~11 s) ———
    function nace() {
      busy = true; refresh();
      const wrap = el('div', 'tut-eggs'); const egg = eggEl(s.kind, 0, 'big'); wrap.append(egg); sceneEl.append(wrap);
      const flash = el('div', 'tut-flash'); sceneEl.append(flash);
      const mascot = petCanvas(s.kind, 'feliz'); const m = el('div', 'tut-mascot hatch'); m.append(mascot.c); m.hidden = true; sceneEl.append(m);
      let shake = 0;
      const frame = f => setEgg(egg, f);
      drawGrim('sudor'); say('^Está temblando… ¿es normal? Creo que es normal.');
      later(1500, () => { shake = 1; if (!reduced()) egg.classList.add('shake'); frame(1); if (egg.fx) egg.fx.level(1); });
      scene.iv = setInterval(() => { if (shake && alive()) frame(Date.now() % 240 < 120 ? 1 : 2); }, 120);
      later(3600, () => { frame(3); flash.className = 'tut-flash on'; later(450, () => { flash.className = 'tut-flash'; frame(1); }); });
      later(5200, () => { shake = 0; frame(4); egg.classList.add('hard'); if (egg.fx) { egg.fx.level(2); egg.fx.excite(true); } });
      later(6700, () => { frame(5); if (egg.fx) egg.fx.level(3); drawGrim('importante'); say('^¡NO SÉ SI ES NORMAL!'); });
      later(8300, () => { frame(6); drawGrim('espiral'); });
      later(9800, () => { shake = 0; egg.classList.remove('shake', 'hard'); frame(7); flash.className = 'tut-flash on big'; drawGrim('sorprendido'); beep(500, true); if (magia) magia.pulse(); if (egg.fx) { egg.fx.level(0); egg.fx.burst(); } });
      later(10500, () => {
        flash.className = 'tut-flash'; frame(8); m.hidden = false; mascot.hop = 3;
        const t0 = performance.now(); const hop = () => { if (!alive()) return; const d = (performance.now() - t0) / 1000; mascot.hop = d < 1.6 ? Math.abs(Math.sin(d * 6)) * 5 : 0; if (d < 1.6) requestAnimationFrame(hop); };
        hop();
        drawGrim('feliz');
        say('¡Nació!', 'G', () => later(250, () => {   // grito de la especie y dab (brazos hacia un lado, como en la tienda de poses)
          mascot.arm = 'dab'; if (magia) magia.pulse(); beep(INFO[s.kind].tono, true, s.kind);
          say(INFO[s.kind].grito, 'M', () => { busy = false; refresh(); later(1400, () => { mascot.arm = 'rest'; }); });
        }));
      });
    }

    // ——— Navegación ———
    function textOf(step) { return typeof step.text === 'function' ? step.text(s) : step.text; }
    function refresh() {
      const step = steps[s.i];
      const needOk = !step.needs || (step.needs === 'kind' ? !!s.kind : step.needs === 'seen' ? true : !nameError(s.draft));
      nextBtn.disabled = busy || !needOk;
      nextBtn.textContent = step.next || (s.i === steps.length - 1 ? (mode === 'test' ? 'Reiniciar prueba' : 'Terminar') : 'Siguiente');
      if (step.needs === 'seen') { const left = Object.keys(OBJETOS).length - s.seen.length; nextBtn.textContent = left ? `Seguir (faltan ${left})` : 'Listo, seguir'; }
      backBtn.disabled = busy || s.i === 0 || !!step.noBack;
      backBtn.textContent = step.back || 'Atrás';
      barEl.firstElementChild.style.width = Math.round(s.i / (steps.length - 1) * 100) + '%';
      barEl.setAttribute('aria-valuenow', Math.round(s.i / (steps.length - 1) * 100));
    }
    function show(i) {
      clearAll(); clearInterval(scene.iv); busy = false; s.i = i; save(s);
      const step = steps[i];
      talk.classList.toggle('pet', step.who === 'M');
      scene(step.scene);
      if (step.id === 'premio' && api) api.reward();
      if (step.who === 'M') { tagEl.textContent = s.name; say(textOf(step), 'M'); }
      else if (step.scene === 'nace') { nace(); }
      else { drawGrim(step.pose); say(textOf(step)); }
      refresh();
    }
    nextBtn.addEventListener('click', () => {
      const step = steps[s.i];
      if (typing && !busy) { skipType(); return; }
      if (step.id === 'nombre') s.draft = s.draft.trim();
      if (step.id === 'graba') { s.name = s.draft.trim(); if (mode === 'first') api.setPet(s.kind, s.name); }
      if (s.i >= steps.length - 1) {
        try { localStorage.removeItem(STORE); } catch (_) {}
        if (mode !== 'test') { api.finish(); clearAll(); if (opts.exit) opts.exit(); else location.hash = '#/home'; return; }
        Object.assign(s, { kind: '', draft: '', name: '', seen: [] }); show(0); return;
      }
      if (step.recorrido) {   // recorrido por la pantalla real: guarda el avance y, al terminar, vuelve aquí
        s.i++; save(s); clearAll(); busy = true; refresh();
        const volver = () => { location.hash = mode === 'test' ? '#/tutorial/test' : '#/tutorial'; };
        ensureRecorrido().then(R => R.run(step.recorrido, { volver, voz: vozGrimorio })).catch(() => { busy = false; show(s.i); });
        return;
      }
      show(s.i + 1);
    });
    backBtn.addEventListener('click', () => { if (s.i > 0) show(s.i - 1); });
    box.addEventListener('click', () => { if (typing && !busy) skipType(); });
    const muteBtn = $('.tut-mute'), paintMute = () => { muteBtn.classList.toggle('off', muted()); muteBtn.setAttribute('aria-pressed', muted() ? 'true' : 'false'); };
    muteBtn.addEventListener('click', () => { try { localStorage.setItem(MUTE, muted() ? '0' : '1'); } catch (_) {} paintMute(); if (!muted()) beep(300, true); });
    paintMute();
    $('.tut-skip').addEventListener('click', () => { clearAll(); if (mode === 'first') api.skip(); if (opts.exit) opts.exit(); else location.hash = '#/home'; });
    show(s.i);
  }

  window.NexoTutorial = { render };
})();
