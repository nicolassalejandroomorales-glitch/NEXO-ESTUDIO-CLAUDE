/* Reproductor de clases: la torre del alquimista. El sabio guía la clase con diálogos y se muestra
   una sola cosa a la vez (sin barra de pasos). La clase se arma como una secuencia de "momentos"
   a partir de los datos de window.NexoClasses. Ver docs/clases-estructura/SPEC.md. */
(() => {
  'use strict';
  const PATHS = {
    diagnostico: { name: '¿Por dónde empiezo?', tag: 'Diagnóstico · 5 min', text: 'Unas 7 preguntas que se adaptan a ti y te dicen dónde partir.' },
    tiempo: { name: 'Tengo X minutos', tag: 'Plan del día', text: 'Dime cuánto tiempo tienes y te armo la sesión por bloques.' },
    alba: { name: 'Ronda del alba', tag: 'Repaso · 5 min', text: 'Preguntas mezcladas de lo que ya viste, sin mirar apuntes. Lo que no se repasa, se olvida.' },
    simulacro: { name: 'Simulacro PEP', tag: 'Con tiempo', text: 'Como la prueba: con cronómetro, sin pistas ni formulario. Al final, cómo te corrige el profe.' },
    misiones: { name: 'Misiones', tag: '10–15 min', text: 'Una idea por visita. Se retoma donde la dejaste.' },
    entrenar: { name: 'Entrenar', tag: 'Infinito · se adapta', text: 'Ejercicios nuevos sin fin, de fácil a nivel PEP. Subo la dificultad cuando aciertas.' },
    expedicion: { name: 'Expedición', tag: 'Clase larga', text: 'Todas las misiones seguidas, con desafíos extra si vas bien.' },
    prueba: { name: 'Prueba encima', tag: 'Evaluación pronto', text: 'Directo a lo que se pregunta. El rescate te lleva a lo que falta.', hidden: true },
    base: { name: 'Repaso desde cero', tag: 'Opcional', text: 'Las bases de Orgánica I que usan las aminas.', hidden: true }
  };
  const PATH_ORDER = ['diagnostico', 'tiempo', 'misiones', 'entrenar', 'alba', 'simulacro', 'expedicion'];
  let TIMER = null; // cronómetro del simulacro
  const SCENES = ['dawn', 'day', 'dusk', 'night'];
  /* Torre del alquimista por momento del día (assets/classroom/README.md). Pinturas HD de Canva entregadas por Niquito. */
  const TOWER = { dawn: 'assets/classroom/torre-amanecer.webp', day: 'assets/classroom/torre-atardecer.webp',
    dusk: 'assets/classroom/torre-atardecer.webp', night: 'assets/classroom/torre-noche.webp' }; // mediodía: pendiente la versión HD
  /* Objetos tocables de cada pintura, en % del arte 16:9: [x, y, ancho, alto]. Igual que en el refugio:
     invisibles, solo brillan al pasar el mouse. Se usan los de la pintura que domina a esa hora. */
  const HOTSPOTS = {
    dawn: { sage: [10, 24, 15, 70], book: [20, 49, 12, 15], board: [36, 20, 28, 35], window: [22.5, 12, 9.5, 43], flasks: [73, 50, 26, 30] },
    dusk: { sage: [12, 20, 12, 68], book: [19, 40, 13, 14], board: [45.5, 17, 31.5, 33], window: [5, 7, 15.5, 58], flasks: [80, 56, 16, 24] },
    night: { sage: [9.5, 24, 22, 71], book: [24.5, 46, 15, 14], board: [36, 9, 30, 57], window: [8, 4, 16, 31], flasks: [77, 54, 21, 20] }
  };
  // El arte generado (tools/classroom-art/build_tower.py) es la fuente de verdad cuando está cargado.
  const ART = window.NexoTowerArt;
  if (ART) { Object.assign(TOWER, ART.scenes); Object.assign(HOTSPOTS, ART.hotspots); } else HOTSPOTS.day = HOTSPOTS.dusk;
  const SPOT_LABEL = { sage: 'Pedirle al sabio que explique desde cero', book: 'Abrir tu grimorio: glosario, formulario y recetario', board: 'Ver las diapositivas de la clase',
    window: 'Cambiar la hora de la torre', flasks: 'Mezclar los frascos: dato curioso' };
  const HOURS = [7, 12.5, 18.6, 22];
  const SPOT_NAME = { sage: 'Sabio · desde cero', book: 'Libro · grimorio', board: 'Pizarra · diapositivas', window: 'Ventana · hora', flasks: 'Frascos · datos curiosos' };
  /* Recorrido de la primera vez (docs/etapa-4b-intuitivo/SPEC.md): una línea por parte, iluminando cada una. */
  const TOUR = [
    { target: null, title: 'Bienvenido a la torre', text: 'Te muestro en 30 segundos dónde está cada cosa. Puedes saltarlo cuando quieras.' },
    { target: '.cr-dialog', title: 'El sabio te habla aquí', text: 'Lee lo que dice abajo. El botón verde siempre te lleva al paso siguiente.' },
    { target: '.cr-mascot', title: 'Tu compañero', text: 'En la práctica, tócalo y te da una pista. Esa respuesta cuenta como "con pista".' },
    { target: '.cr-objects, .cr-spot', title: 'Los objetos de la torre', text: 'Sabio: te explica desde cero. Libro: tu grimorio (glosario, formulario y recetas). Pizarra: diapositivas de la clase. Ventana: la hora. Frascos: datos curiosos.', place: 'top' },
    { target: '.cr-goal-chip', title: 'Tu camino al 7', text: 'Los puntos de la PEP que ya demostraste. Se ganan acertando sin ayuda los casos estilo prueba.' },
    { target: '.cr-help-btn', title: '¿Te perdiste?', text: 'Este botón explica cada parte cuando quieras y repite este recorrido.' },
    { target: '.cr-path[data-path="diagnostico"]', title: 'Empieza por aquí', text: 'Si es tu primera vez, el diagnóstico te dice en 5 minutos por qué misión partir.' }
  ];
  const HELP = [
    ['El sabio (abajo)', 'Te explica y te guía. El botón verde avanza; "Explícame más simple" lo dice con otras palabras.'],
    ['Tu compañero', 'En la práctica te da una pista si lo tocas. Lo que respondes con pista cuenta como "con pista", no "sin ayuda".'],
    ['La barra de confianza', 'Antes de responder marcas qué tan seguro estás. No baja tu nota: sirve para saber si de verdad lo sabes o adivinaste.'],
    ['Los objetos de la torre', 'Sabio: desde cero · Libro: grimorio (glosario, formulario y recetario) · Pizarra: diapositivas · Ventana: hora del día · Frascos: datos curiosos.'],
    ['Camino al 7', 'Los puntos de la PEP que ya demostraste acertando sin ayuda los casos estilo prueba.'],
    ['Las hojas', 'Cada concepto es una hoja: brote (guiado) → verde (lo hiciste solo) → flor (lo recordaste días después).'],
    ['Los caminos', '¿Por dónde empiezo?: diagnóstico. Tengo X minutos: tu plan del día. Misiones: una idea por visita. Entrenar: ejercicios infinitos que suben de nivel contigo. Ronda del alba: repaso diario. Simulacro PEP: como la prueba, con reloj. Expedición: todo seguido.'],
    ['Los niveles', 'Fácil → Media → Intermedia → Avanzada → Nivel PEP. Subes al acertar 2 seguidas sin pista; bajas uno si fallas. Así trabajas cerca del 70 % de aciertos, donde más se aprende.']
  ];
  function dominantScene() {
    const style = getComputedStyle(document.body);
    return SCENES.reduce((best, key) => (parseFloat(style.getPropertyValue(`--w-${key}`)) || (key === 'day' ? 0.01 : 0)) >
      (parseFloat(style.getPropertyValue(`--w-${best}`)) || (best === 'day' ? 0.01 : 0)) ? key : best, 'day');
  }
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const md = value => esc(value).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  function sessionFor(api, id) {
    const state = api.getState();
    if (!state.classSessions || typeof state.classSessions !== 'object') state.classSessions = {};
    const s = state.classSessions[id] ||= {};
    for (const key of ['answers', 'hints', 'revealed', 'skipExplain', 'retries', 'work', 'conf', 'confWhy', 'detour', 'tips', 'rounds', 'far']) if (!s[key] || typeof s[key] !== 'object') s[key] = {};
    if (!Number.isInteger(s.beat)) s.beat = 0;
    return s;
  }

  const baseById = (cls, id) => (cls.base || []).find(m => m.id === id);
  const missionById = (cls, id) => cls.missions.find(m => m.id === id) || baseById(cls, id);
  const pts = n => (Math.round(n * 10) / 10).toLocaleString('es-CL');

  /* Meta de la clase (cls.goal): cuántos puntos de la prueba ya demostraste. Un punto cuenta cuando aciertas
     sin ayuda el caso estilo prueba (transferencia) de las misiones que preparan esa pregunta. */
  // Un caso estilo prueba está demostrado si lo acertaste sin ayuda en la misión o en algún simulacro (copias "id@sN").
  const solvedGoal = (s, id) => Object.entries(s.answers).some(([k, r]) => (k === id || k.startsWith(`${id}@s`) || s.genFrom?.[k] === id) && r?.correct && !r.hint);
  function goalOf(cls, s) {
    const g = cls.goal;
    if (!g) return null;
    const qs = g.questions.map(q => {
      const items = cls.missions.filter(m => q.missions.includes(m.id)).flatMap(m => m.stages.transfer || []);
      const ok = items.filter(item => solvedGoal(s, item.id)).length;
      return { ...q, items, ok, earned: items.length ? q.points * ok / items.length : 0 };
    });
    const earned = qs.reduce((sum, q) => sum + q.earned, 0), max = qs.reduce((sum, q) => sum + q.points, 0);
    const worth = mId => qs.reduce((sum, q) => {
      const mine = (missionById(cls, mId)?.stages.transfer || []).filter(item => q.items.includes(item)).length;
      return sum + (q.items.length ? q.points * mine / q.items.length : 0);
    }, 0);
    const won = mId => (missionById(cls, mId)?.stages.transfer || []).length
      ? worth(mId) * (missionById(cls, mId).stages.transfer.filter(item => solvedGoal(s, item.id)).length / missionById(cls, mId).stages.transfer.length) : 0;
    return { ...g, qs, earned, max, worth, won };
  }

  function goalMeter(goal) {
    const seg = (n, cls, label) => `<span class="cr-goal-seg ${cls}" style="flex:${n}" title="${esc(label)}"></span>`;
    return `<div class="cr-goal-meter" role="img" aria-label="Llevas ${pts(goal.earned)} de ${goal.total} puntos demostrados">
      ${goal.earned ? seg(goal.earned, 'is-won', 'Demostrado') : ''}${goal.max - goal.earned > 0 ? seg(goal.max - goal.earned, 'is-open', 'Por demostrar en esta clase') : ''}
      ${(goal.rest || []).map(r => seg(r.points, 'is-later', r.label)).join('')}</div>`;
  }
  /* Una misión puede dividirse en partes (recetas): cada una con su "adivina antes", su lección y su práctica. */
  const partsOf = m => m.parts || [];
  const blocksOf = m => [...(m.stages.fundamentals || []), ...(m.stages.explain || []), ...partsOf(m).flatMap(p => p.explain || [])];
  const itemsOf = m => [
    ...(m.stages.diagnostic || []).map(item => ({ item, stage: 'diagnostic' })),
    ...partsOf(m).flatMap(p => [...(p.pretest ? [{ item: p.pretest, stage: 'pretest' }] : []), ...(p.practice || []).map(item => ({ item, stage: 'practice' }))]),
    ...['practice', 'challenge', 'transfer'].flatMap(stage => (m.stages[stage] || []).map(item => ({ item, stage })))];
  const allItems = (cls, mId) => (mId ? [...cls.missions, ...(cls.base || [])] : cls.missions).filter(m => !mId || m.id === mId).flatMap(m => itemsOf(m).map(x => ({ ...x, mission: m })));
  // Actividades fuera de las misiones: clase base, diagnóstico y casos cortos de los errores típicos.
  const extraItems = cls => [...(cls.base || []).flatMap(m => itemsOf(m).map(x => x.item)), ...(cls.diagnosis?.items || []).map(x => x.item),
    ...Object.values(cls.misconceptions || {}).map(mc => mc.check).filter(Boolean)];
  const findBase = (cls, itemId) => (String(itemId).startsWith('gen:') ? genItem(cls, itemId)
    : allItems(cls).find(x => x.item.id === itemId)?.item || extraItems(cls).find(item => item.id === itemId));
  // "id@algo" es una copia de una actividad (ronda del alba o simulacro): misma pregunta, respuesta aparte.
  const findItem = (cls, itemId) => { const base = findBase(cls, String(itemId).split('@')[0]); return base && String(itemId).includes('@') ? { ...base, id: itemId } : base; };
  const missionOfItem = (cls, itemId) => { const base = String(itemId).split('@')[0];
    if (base.startsWith('gen:')) { const c = (cls.concepts || []).find(k => k.id === genItem(cls, base)?.concept); return cls.missions.find(m => m.id === c?.mission); }
    return cls.missions.find(m => itemsOf(m).some(x => x.item.id === base)); };
  const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // La próxima evaluación del ramo según el calendario de la app (Bitácora): para la cuenta regresiva y la hoja de la noche anterior.
  function nextExam(cls, api, now = new Date()) {
    const t = today(now), list = (api?.getState?.().events || []).filter(e => e && e.subject === cls.subject && e.type === 'exam' && /^\d{4}-\d{2}-\d{2}$/.test(e.date || '') && e.date >= t)
      .sort((a, b) => a.date.localeCompare(b.date));
    const e = list[0]; if (!e) return null;
    const [y, m, d] = e.date.split('-').map(Number), days = Math.round((new Date(y, m - 1, d) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    const when = new Date(y, m - 1, d).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    return { ...e, days, when, label: days === 0 ? 'es hoy' : days === 1 ? 'es mañana' : `en ${days} días` };
  }

  /* ───────── Etapa 8: ejercicios infinitos (docs/etapa-8-entrenar/SPEC.md) ─────────
     Un generado se guarda solo como texto: "gen:<generador>:<nivel>:<semilla>[:<concepto>]". La misma semilla
     siempre arma la misma pregunta, así que no hay que guardar la pregunta para corregirla o revisarla después. */
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const GEN = cls => window.NexoClassGen?.[cls.id] || null;
  const hashStr = t => [...String(t)].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const GEN_CACHE = new Map();
  function genItem(cls, id) {
    const key = `${cls.id}|${id}`;
    if (GEN_CACHE.has(key)) return GEN_CACHE.get(key);
    const [, gId, lv, seed, want] = String(id).split(':'), G = GEN(cls), g = G?.generators.find(x => x.id === gId);
    let item = null;
    if (g) { const level = Math.max(1, Math.min(5, Number(lv) || 1));
      try { item = { source: G.source, ...g.make(mulberry(hashStr(seed)), level, want || undefined), id, gen: { id: gId, level } }; } catch { item = null; } }
    if (GEN_CACHE.size > 2000) GEN_CACHE.clear();
    GEN_CACHE.set(key, item);
    return item;
  }
  // Huella del contenido de un ejercicio generado: dos semillas que arman la misma pregunta tienen la misma huella.
  const genSignature = it => it ? `${String(it.prompt).replace(/(Mujer|Hombre|Paciente|Niña|Niño) de \d+ años/g, 'P')}|${it.options ? it.options.map(o => o.text).sort().join('/') : it.cards ? it.cards.map(c => c.text).sort().join('/') : it.answer}` : '';
  const gensFor = (cls, concept) => (GEN(cls)?.generators || []).filter(g => g.concepts.includes(concept));
  const genConcepts = cls => (cls.concepts || []).filter(c => gensFor(cls, c.id).length).map(c => c.id);
  // Nivel de partida de un concepto: según lo que ya demostraste sin ayuda en las misiones (o en un caso estilo prueba).
  function startLevel(cls, s, concept) {
    let solo = 0, transfer = false;
    for (const [k, r] of Object.entries(s.answers)) {
      if (k.startsWith('gen:') || !r?.correct || r.hint || r.stage === 'pretest') continue;
      if (findBase(cls, k.split('@')[0])?.concept !== concept) continue;
      solo += 1; if (r.stage === 'transfer' || r.stage === 'simulacro') transfer = true;
    }
    return transfer ? (solo >= 4 ? 4 : 3) : solo >= 3 ? 3 : solo >= 1 ? 2 : 1;
  }
  /* Escalera "2 arriba, 1 abajo" (Levitt, 1971): 2 aciertos seguidos sin pista suben un nivel; un error baja uno.
     Converge cerca del 70 % de aciertos: difícil, pero alcanzable. Todo se deduce de tus respuestas a generados. */
  function trainLevels(cls, s) {
    const lv = {}, streak = {};
    const recs = Object.entries(s.answers).filter(([k]) => k.startsWith('gen:')).map(([k, r]) => ({ r, it: findItem(cls, k) })).filter(x => x.it)
      .sort((a, b) => String(a.r.at).localeCompare(String(b.r.at)));
    for (const { r, it } of recs) {
      const c = it.concept, at = it.gen.level;
      if (r.correct && !r.hint) { streak[c] = (streak[c] || 0) + 1; lv[c] = streak[c] >= 2 ? Math.min(5, at + 1) : at; if (streak[c] >= 2) streak[c] = 0; }
      else { streak[c] = 0; lv[c] = r.correct ? at : Math.max(1, at - 1); }
    }
    return { lv, streak };
  }
  const levelOf = (cls, s, concept, T = trainLevels(cls, s)) => T.lv[concept] ?? startLevel(cls, s, concept);
  function genFor(cls, s, concept, seedKey, level) {
    const gs = gensFor(cls, concept);
    if (!gs.length) return null;
    const lv = level ?? levelOf(cls, s, concept);
    // Nunca repetir un ejercicio ya respondido: ni el mismo id ni el mismo contenido con otra semilla
    // (si no, una pregunta memorizada contaría como evidencia nueva). Se prueba con todos los generadores del concepto.
    const seen = new Set(Object.keys(s.answers).filter(k => k.startsWith('gen:')).map(k => genSignature(genItem(cls, k.split('@')[0]))).filter(Boolean));
    const start = hashStr(seedKey) % gs.length;
    for (let salt = 0; salt < 40; salt++) {
      const g = gs[(start + salt) % gs.length];
      const id = `gen:${g.id}:${lv}:${hashStr(`${seedKey}~${salt}`).toString(36)}${g.concepts.length > 1 ? `:${concept}` : ''}`;
      if (Object.keys(s.answers).some(k => k.split('@')[0] === id)) continue;
      const it = genItem(cls, id);
      if (it && !seen.has(genSignature(it))) return id;
    }
    return null;
  }
  // Qué concepto entrenar ahora: el foco elegido, o "lo que más necesito" (el nivel más bajo de lo que ya empezaste), sin repetir el anterior.
  function trainConcept(cls, s, run, T) {
    const all = genConcepts(cls), prev = findItem(cls, run.ids[run.ids.length - 1] || '')?.concept;
    let list = run.focus.startsWith('c:') ? [run.focus.slice(2)] : run.focus.startsWith('m:') ? all.filter(c => (cls.concepts || []).find(k => k.id === c)?.mission === run.focus.slice(2)) : null;
    if (list?.length) { const opts = list.length > 1 ? list.filter(c => c !== prev) : list; return opts[run.ids.length % opts.length]; }
    const seen = new Set(Object.keys(s.answers).map(k => findBase(cls, k.split('@')[0])?.concept).filter(Boolean));
    list = all.filter(c => seen.has(c));
    for (const m of cls.missions) { if (list.length >= 3) break; all.filter(c => (cls.concepts || []).find(k => k.id === c)?.mission === m.id && !list.includes(c)).forEach(c => list.push(c)); }
    const inRun = c => run.ids.filter(id => findItem(cls, id)?.concept === c).length;
    return list.filter(c => c !== prev || list.length === 1).sort((a, b) => levelOf(cls, s, a, T) - levelOf(cls, s, b, T) || inRun(a) - inRun(b) || all.indexOf(a) - all.indexOf(b))[0];
  }
  function newRun(cls, s, focus = 'mix') {
    const T = trainLevels(cls, s);
    return { key: `${today()}-${Date.now().toString(36)}`, focus, size: 8, ids: [], start: Object.fromEntries(genConcepts(cls).map(c => [c, levelOf(cls, s, c, T)])) };
  }
  // Agrega la siguiente pregunta cuando respondiste la anterior (se calcula con tu nivel de ese momento y queda fija).
  function trainAdvance(cls, s) {
    const run = s.trainRun;
    if (!run || run.ids.length >= run.size || (run.ids.length && !s.answers[run.ids[run.ids.length - 1]])) return;
    const T = trainLevels(cls, s), c = trainConcept(cls, s, run, T);
    const id = c && genFor(cls, s, c, `${run.key}:${run.ids.length}`, levelOf(cls, s, c, T));
    if (id) run.ids.push(id); else run.size = run.ids.length;
  }

  /* Ronda del alba (docs/etapa-7-prueba/SPEC.md): preguntas mezcladas de conceptos ya vistos; primero los vencidos (FSRS),
     después los que viste hace más tiempo. Una pregunta por concepto, alternando misiones (práctica intercalada). */
  function roundPick(cls, s, store, size = 4, now = new Date()) {
    const recs = store?.records || [];
    const last = new Map(); for (const r of recs) last.set(r.conceptId, r.at);
    const seen = [...last.entries()].sort((a, b) => new Date(a[1]) - new Date(b[1])).map(([c]) => c);
    const dueSet = new Set(Object.values(store?.reviews || {}).filter(r => r?.dueAt && new Date(r.dueAt) <= now).map(r => r.targetId));
    const fromAnswers = Object.keys(s.answers).map(k => findBase(cls, k.split('@')[0])?.concept).filter(Boolean);
    const order = [...new Set([...seen.filter(c => dueSet.has(c)), ...seen.filter(c => !dueSet.has(c)), ...fromAnswers])]
      .filter(c => (cls.concepts || []).some(k => k.id === c));
    const pool = c => cls.missions.flatMap(m => itemsOf(m).filter(x => ['practice', 'transfer', 'challenge'].includes(x.stage) && x.item.concept === c).map(x => ({ ...x, m })));
    const hash = t => [...t].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const picks = [];
    for (const c of order) {
      if (picks.length >= size) break;
      const all = pool(c);
      const fresh = all.filter(x => !s.answers[x.item.id]), wrong = all.filter(x => s.answers[x.item.id] && !s.answers[x.item.id].correct);
      // Si ya acertaste todas las fijas de este concepto, una nueva generada a tu nivel (así la ronda nunca se repite).
      const gen = !fresh.length && !wrong.length && genFor(cls, s, c, `alba:${today(now)}:${c}`);
      if (gen) { picks.push({ item: { id: gen }, m: missionOfItem(cls, gen) || {} }); continue; }
      if (!all.length) continue;
      const list = fresh.length ? fresh : wrong.length ? wrong : all;
      picks.push(list[hash(today(now) + c) % list.length]);
    }
    const out = [], rest = [...picks]; // intercalar: que no queden dos seguidas de la misma misión
    while (rest.length) { const i = rest.findIndex(x => x.m?.id !== out[out.length - 1]?.m?.id); out.push(rest.splice(i < 0 ? 0 : i, 1)[0]); }
    return out.map(x => x.item.id);
  }

  /* Simulacro PEP: los casos estilo prueba de las misiones que dan puntos. Mini: uno por misión. Completo: todos. */
  function simBuild(cls, s, size = 'full') {
    const missions = [...new Set((cls.goal?.questions || []).flatMap(q => q.missions))].map(id => missionById(cls, id)).filter(Boolean);
    const n = (s.simN || 0) + 1;
    const items = size === 'mini' ? missions.map(m => (m.stages.transfer || [])[(n - 1) % Math.max(1, (m.stages.transfer || []).length)]).filter(Boolean)
      : missions.flatMap(m => m.stages.transfer || []);
    /* Desde el 2° simulacro, las alternativas, los ordenar y los cálculos se cambian por casos nuevos nivel PEP del mismo concepto
       (las ya vistas se recuerdan de memoria; un cálculo nuevo trae otros números). Las escritas, flechas y dibujos se quedan. */
    const from = {};
    const ids = items.map((item, i) => {
      const gen = n >= 2 && ['choice', 'order', 'number', undefined].includes(item.type) && genFor(cls, s, item.concept, `sim:${n}:${i}:${item.id}`, 5);
      const id = `${gen || item.id}@s${n}`;
      if (gen) from[id] = item.id;
      return id;
    });
    return { n, size, ids, from, minutes: size === 'mini' ? 12 : 40, start: Date.now(), ended: false };
  }
  // Puntaje como en la pauta: cada pregunta de la prueba reparte sus puntos entre sus casos; las escritas dan puntaje parcial por idea.
  function itemScore(item, rec) {
    if (!rec || !item) return 0;
    if (item.type === 'write') return (rec.value?.checks || []).filter(Boolean).length / Math.max(1, item.rubric.length);
    return rec.correct ? 1 : 0;
  }
  function simScore(cls, s, sim = s.sim) {
    if (!sim) return null;
    const rows = (cls.goal?.questions || []).map(q => {
      const mine = sim.ids.filter(id => q.missions.includes(missionOfItem(cls, sim.from?.[id] || id)?.id));
      const scores = mine.map(id => itemScore(findItem(cls, id), s.answers[id]));
      return { ...q, ids: mine, got: mine.length ? q.points * scores.reduce((a, b) => a + b, 0) / mine.length : 0, max: mine.length ? q.points : 0 };
    });
    const got = rows.reduce((a, r) => a + r.got, 0), max = rows.reduce((a, r) => a + r.max, 0);
    const pct = max ? got / max : 0;
    const nota = pct < 0.6 ? 1 + 3 * pct / 0.6 : 4 + 3 * (pct - 0.6) / 0.4; // escala chilena con 60 % de exigencia
    return { rows, got, max, pct, nota: Math.round(nota * 10) / 10 };
  }


  /* Diagnóstico "¿Por dónde empiezo?" (docs/etapa-4-diagnostico/SPEC.md): escalera de 3 niveles.
     Si aciertas sube un nivel, si fallas baja; prefiere un concepto relacionado con el anterior. Todo se deduce de las respuestas. */
  function diagnosisPlan(cls, s) {
    const dx = cls.diagnosis;
    if (!dx) return { asked: [], next: null, done: true };
    const conceptOf = id => (cls.concepts || []).find(c => c.id === id);
    const related = (a, b) => (conceptOf(a)?.needs || []).includes(b) || (conceptOf(b)?.needs || []).includes(a);
    const used = new Set(), asked = [];
    let level = dx.start || 2;
    while (asked.length < (dx.max || 7)) {
      const free = l => dx.items.filter(x => x.level === l && !used.has(x.item.id));
      let pool = [];
      for (const l of [level, level - 1, level + 1, level - 2, level + 2]) if (l >= 1 && l <= 3 && (pool = free(l)).length) break;
      if (!pool.length) break;
      const last = asked[asked.length - 1];
      const pick = (last && pool.find(x => related(x.item.concept, last.item.concept))) || pool[0];
      used.add(pick.item.id);
      const rec = s.answers[pick.item.id];
      asked.push({ ...pick, rec });
      if (!rec) return { asked, next: pick, done: false };
      level = rec.correct ? Math.min(3, pick.level + 1) : Math.max(1, pick.level - 1);
    }
    // Resultado (hipótesis): lo acertado, y sus prerrequisitos como "probables" si no se fallaron.
    const right = new Set(asked.filter(x => x.rec?.correct).map(x => x.item.concept));
    const wrong = new Set(asked.filter(x => x.rec && !x.rec.correct).map(x => x.item.concept));
    const likely = new Set();
    const walk = id => (conceptOf(id)?.needs || []).forEach(n => { if (!likely.has(n) && !wrong.has(n) && !right.has(n)) { likely.add(n); walk(n); } });
    right.forEach(walk);
    const known = id => right.has(id) || likely.has(id);
    const measured = new Set(dx.items.map(x => x.item.concept));
    const start = cls.missions.find(m => (cls.concepts || []).some(c => c.mission === m.id && measured.has(c.id) && !known(c.id))) || null;
    const unmeasured = cls.missions.filter(m => !(cls.concepts || []).some(c => c.mission === m.id && measured.has(c.id)));
    const bases = [...wrong].map(id => (cls.base || []).find(b => b.concept === id)).filter(Boolean);
    return { asked, next: null, done: true, right, wrong, likely, start, unmeasured, bases };
  }

  /* La clase como secuencia de momentos. Se recalcula en cada vista: lo ya respondido no cambia,
     y lo que viene se adapta (saltar la lección, desafíos extra, rescate solo si hubo errores). */
  function beats(cls, s) {
    const out = [{ kind: 'path' }];
    if (!s.path) return out;
    const say = (text, m, extra = {}) => out.push({ kind: 'say', text, m, ...extra });
    /* Errores que guían: un error típico con caso corto lo muestra al tiro; 2 errores de la misma base ofrecen un desvío
       (base + 2 ejercicios fáciles + vuelta al problema), una vez por misión. */
    const conceptRoots = id => { const c = (cls.concepts || []).find(k => k.id === id); return !c ? [] : c.root ? [c.id] : (c.needs || []).filter(n => n.startsWith('base.')); };
    const rescued = new Set(), fixShown = new Set();
    let wrongs = {}, detoured = false;
    const ask = (item, m, stage, n, of) => {
      out.push({ kind: 'question', item, m, stage, n, of });
      const rec = s.answers[item.id];
      if (!rec || rec.correct || !['practice', 'challenge', 'transfer'].includes(stage) || s.path === 'base') return;
      const mc = mcOf(cls, item, rec);
      if (mc?.check && !fixShown.has(mc.check.id)) {
        fixShown.add(mc.check.id);
        say('Probemos un caso corto para corregir esa idea ahora mismo.', m, { mood: 'calm' });
        out.push({ kind: 'question', item: mc.check, m, stage: 'fix', n: 1, of: 1 });
      }
      if (detoured || !m) return;
      for (const root of mc?.base ? [mc.base] : conceptRoots(item.concept)) {
        const list = (wrongs[root] ||= []); list.push(item);
        const bm = (cls.base || []).find(x => x.concept === root);
        if (list.length < 2 || !bm) continue;
        detoured = true;
        out.push({ kind: 'detour', root, bm, items: [...list], item, m });
        if (s.detour[`${m.id}:${root}`]) {
          out.push({ kind: 'lesson', block: bm.stages.explain[0], m: bm });
          bm.stages.practice.filter(x => (x.type || 'choice') === 'choice').slice(0, 2)
            .forEach((x, i, l) => out.push({ kind: 'question', item: x, m: bm, stage: 'detour', n: i + 1, of: l.length }));
          say('Con esa base fresca, volvamos al problema que te costó.', m, { mood: 'proud' });
          out.push({ kind: 'rescue', item, m }); rescued.add(item.id);
        }
        break;
      }
    };
    const questions = (m, stage) => (m.stages[stage] || []).forEach((item, i, list) => ask(item, m, stage, i + 1, list.length));
    // El rescate solo revisa lo que ya pasó: si incluyera errores de más adelante, se metería antes de tu posición y te movería de lugar.
    const rescue = (mId, only = null) => {
      const wrong = allItems(cls, mId).filter(({ item, stage }) => stage !== 'pretest' && (!only || only.includes(stage)) && (only || stage !== 'transfer' || !mId)
        && !rescued.has(item.id) && s.answers[item.id] && !s.answers[item.id].correct);
      if (!wrong.length) return;
      say(only ? 'El encargo final tuvo un tropiezo. Revisémoslo antes de cerrar.' : 'Revisemos tus errores. Equivocarse también es parte del oficio del alquimista.', null, { mood: 'calm' });
      wrong.forEach(({ item, mission }) => out.push({ kind: 'rescue', item, m: mission }));
    };
    if (s.path === 'prueba') {
      say('Así que la evaluación está cerca. Iremos directo a lo que se pregunta. Sin pistas.', null);
      cls.missions.forEach(m => questions(m, 'diagnostic'));
      cls.missions.forEach(m => questions(m, 'transfer'));
      rescue(null);
      out.push({ kind: 'close' });
      return out;
    }
    if (s.path === 'tiempo') { out.push({ kind: 'plan' }); return out; }
    if (s.path === 'entrenar') {
      out.push({ kind: 'trainpick' });
      const run = s.trainRun;
      if (!run) return out;
      trainAdvance(cls, s);
      run.ids.forEach((id, i) => out.push({ kind: 'question', item: findItem(cls, id), m: missionOfItem(cls, id), stage: 'train', n: i + 1, of: run.size }));
      if (run.ids.length >= run.size && run.ids.every(id => s.answers[id])) out.push({ kind: 'trainsum' });
      return out;
    }
    if (s.path === 'alba') {
      const ids = s.rounds[s.albaKey] || [];
      if (!ids.length) { out.push({ kind: 'albaclose', empty: true }); return out; }
      say('Ronda del alba: unas preguntas mezcladas de lo que ya viste. Sin apuntes y sin pistas: recordar es lo que fija la memoria.', null);
      ids.forEach((id, i, list) => { const copy = `${id}@a${s.albaKey}`; out.push({ kind: 'question', item: findItem(cls, copy), m: missionOfItem(cls, id), stage: 'review', n: i + 1, of: list.length }); });
      out.push({ kind: 'albaclose' });
      return out;
    }
    if (s.path === 'simulacro') {
      out.push({ kind: 'simstart' });
      const sim = s.sim;
      if (!sim) return out;
      sim.ids.filter(id => !sim.ended || s.answers[id]).forEach((id, i) => out.push({ kind: 'question', item: findItem(cls, id), m: missionOfItem(cls, id), stage: 'simulacro', n: i + 1, of: sim.ids.length }));
      out.push({ kind: 'simresult' });
      return out;
    }
    if (s.path === 'diagnostico') {
      say('Te haré unas 7 preguntas para saber por dónde empezar. Si aciertas, subo el nivel; si fallas, bajo a las bases. No cuenta para tu nota y no hay pistas: responde con lo que sabes.', null);
      const plan = diagnosisPlan(cls, s), max = cls.diagnosis?.max || 7;
      plan.asked.forEach((x, i) => out.push({ kind: 'question', item: x.item, m: null, stage: 'placement', n: i + 1, of: max }));
      if (plan.done) out.push({ kind: 'diagresult', plan });
      return out;
    }
    if (s.path === 'base' && !baseById(cls, s.mission)) { out.push({ kind: 'basepick' }); return out; }
    if (s.path === 'misiones' && !cls.missions.some(m => m.id === s.mission)) { out.push({ kind: 'pick' }); return out; }
    const missions = s.path === 'misiones' || s.path === 'base' ? [missionById(cls, s.mission)] : cls.missions;
    missions.forEach(m => {
      wrongs = {}; detoured = false;
      say(`Hoy estudiaremos **${m.title}**: ${m.subtitle.charAt(0).toLowerCase()}${m.subtitle.slice(1)}.`, m, { intro: true });
      if (m.stages.hook) out.push({ kind: 'hook', m });
      say('Antes de enseñarte, muéstrame qué sabes. En este reto no hay pistas.', m);
      questions(m, 'diagnostic');
      const diag = m.stages.diagnostic || [];
      if (diag.length && diag.every(item => s.answers[item.id]?.correct)) out.push({ kind: 'offer', m });
      if (!s.skipExplain[m.id]) {
        if ((m.stages.fundamentals || []).length) {
          say('Empecemos desde cero, para que nada quede en el aire. Si algo ya lo sabes, pasa rápido.', m);
          m.stages.fundamentals.forEach(block => out.push({ kind: 'lesson', block, m, zero: true }));
          say('Con esas bases, ahora sí: la materia de la clase.', m);
        }
        (m.stages.explain || []).forEach(block => out.push({ kind: 'lesson', block, m }));
        if (m.stages.worked) {
          say(`Veamos un ejemplo resuelto. ${m.stages.worked.prompt}`, m);
          m.stages.worked.steps.forEach((step, i) => out.push({ kind: 'step', step, i, m }));
        }
      }
      partsOf(m).forEach(p => {
        say(p.intro, m, { mood: 'proud' });
        if (!s.skipExplain[m.id]) {
          if (p.pretest) { say('Antes de explicarte, adivina. Aquí equivocarse no cuenta: solo prepara tu cabeza.', m); out.push({ kind: 'question', item: p.pretest, m, stage: 'pretest', n: 1, of: 1 }); }
          (p.explain || []).forEach(block => out.push({ kind: 'lesson', block, m }));
          if (p.worked) { say(`Veamos un ejemplo resuelto. ${p.worked.prompt}`, m); p.worked.steps.forEach((step, i) => out.push({ kind: 'step', step, i, m, worked: p.worked })); }
          say('Ahora tú. Si te trabas, toca a tu compañero en la mesa: te dará una pista.', m);
        }
        (p.practice || []).forEach((item, i, list) => ask(item, m, 'practice', i + 1, list.length));
        if (p.recipe) out.push({ kind: 'lesson', block: { ...p.recipe, kind: 'recipe', id: `${p.id}-recipe` }, m });
        else if (p.rule) out.push({ kind: 'lesson', block: { ...p.rule, kind: 'rule', id: `${p.id}-rule` }, m }); // misiones sin reacciones: una regla
      });
      if ((m.stages.practice || []).length) { say('Ahora tú. Si te trabas, toca a tu compañero en la mesa: te dará una pista.', m); questions(m, 'practice'); }
      const practice = itemsOf(m).filter(x => x.stage === 'practice').map(x => x.item);
      if (s.path === 'expedicion' && practice.length && practice.every(item => s.answers[item.id]?.correct && !s.hints[item.id])) {
        say('Vas tan bien que te traje un desafío.', m, { mood: 'proud' });
        questions(m, 'challenge');
      }
      rescue(m.id);
      say('Último encargo: un caso nuevo, como en la prueba. Esta vez, sin ayuda.', m);
      questions(m, 'transfer');
      rescue(m.id, ['transfer']);
    });
    out.push({ kind: 'close' });
    return out;
  }

  function beatDone(s, b) {
    if (b.kind === 'path') return Boolean(s.path);
    if (b.kind === 'pick') return Boolean(s.mission);
    if (b.kind === 'question') return Boolean(s.answers[b.item.id]);
    if (b.kind === 'rescue') return Boolean(s.retries[b.item.id]);
    if (b.kind === 'step') return !b.step.ask || Boolean(s.revealed[`${b.m.id}-w${b.i}`]);
    if (b.kind === 'offer') return s.skipExplain[b.m.id] !== undefined;
    if (b.kind === 'detour') return s.detour[`${b.m.id}:${b.root}`] !== undefined;
    if (b.kind === 'basepick') return Boolean(s.mission);
    if (b.kind === 'simstart') return Boolean(s.sim);
    if (b.kind === 'trainpick') return Boolean(s.trainRun);
    return true;
  }

  /* ───────── Piezas de la escena ───────── */

  function scene(cls, s, b) {
    const art = cls.scene || TOWER;
    const sceneKey = dominantScene(), spots = HOTSPOTS[sceneKey], glows = ART?.glows?.[sceneKey] || {};
    const [fx, fy, fw, fh] = spots.flasks, [bx, by, bw, bh] = spots.board;
    const mode = b?.kind === 'lesson' || b?.kind === 'rescue' ? 'teaching' : b?.kind === 'question' ? 'testing' : '';
    return `<div class="cr-scene ${art.mini ? 'is-mini' : ''} ${mode ? `is-${mode}` : ''} ${s.burst ? `burst-${s.burst}` : ''}"><div class="cr-art">
      ${SCENES.map(key => `<div class="cr-scene-layer is-${key}" aria-hidden="true" ${art[key] ? `style="background-image:url('${esc(art[key])}')"` : ''}></div>`).join('')}
      <div class="cr-scene-shade" aria-hidden="true"></div>
      <div class="cr-life cr-board-glow" aria-hidden="true" style="left:${bx}%;top:${by}%;width:${bw}%;height:${bh}%"></div>
      <div class="cr-life cr-bubbles" aria-hidden="true" style="left:${fx}%;top:${fy}%;width:${fw}%;height:${fh}%">${'<i></i>'.repeat(7)}</div>
      ${s.burst ? `<div class="cr-life cr-burst" aria-hidden="true" style="left:${fx}%;top:${fy - 8}%;width:${fw}%;height:${fh + 8}%">${'<i></i>'.repeat(12)}</div>` : ''}
      ${Object.entries(spots).map(([id, [x, y, w, h]], i) => `<button class="cr-spot is-${id}" data-cr="spot" data-spot="${id}" data-name="${esc(SPOT_NAME[id] || '')}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;--i:${i}" aria-label="${esc(SPOT_LABEL[id])}" title="${esc(SPOT_LABEL[id])}">${glows[id] ? `<img class="cr-spot-glow" src="${esc(glows[id])}" alt="">` : ''}</button>`).join('')}
      </div><div class="cr-motes" aria-hidden="true"></div></div>`;
  }

  function slideMarkup(cls, n, { large = false } = {}) {
    const img = cls.slideImages?.[n];
    const slide = cls.slides?.[n];
    if (img) return `<img class="cr-slide-img" src="${esc(img)}" alt="Diapositiva ${esc(n)}${slide ? `: ${esc(slide.title)}` : ''}" loading="lazy">${large && slide ? `<details class="cr-slide-notes"><summary>Lo que dice, en texto</summary><ul>${slide.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></details>` : ''}`;
    if (!slide) return `<div class="cr-slide-text"><p>Diapositiva ${esc(n)}</p></div>`;
    return `<div class="cr-slide-text ${large ? 'is-large' : ''}"><h3>${esc(slide.title)}</h3><ul>${slide.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`;
  }

  function projection(cls, n) {
    return `<button class="cr-projection" data-cr="slides" data-slide="${esc(n)}" aria-label="Ver la diapositiva ${esc(n)} en grande">
      <span class="cr-projection-label">Diapositiva ${esc(n)} · toca para ampliar</span>${slideMarkup(cls, n)}</button>`;
  }

  function optionsMarkup(cls, s, item, { retry = false } = {}) {
    const record = retry ? s.retries[item.id] : s.answers[item.id];
    return `<ol class="cr-options">${item.options.map((opt, i) => {
      const picked = record?.choice === i;
      const tone = !record ? '' : picked ? (opt.correct ? 'is-right' : 'is-wrong') : (opt.correct && retry ? 'is-right' : 'is-muted');
      return `<li><button class="cr-option ${tone}" data-cr="answer" data-item="${esc(item.id)}" data-choice="${i}" data-retry="${retry ? 1 : 0}" ${record ? 'disabled' : ''}>
        <span class="cr-letter">${String.fromCharCode(65 + i)}</span><span>${esc(opt.text)}</span></button></li>`;
    }).join('')}</ol>`;
  }

  /* ───────── Actividades ─────────
     choice (alternativas) · order (ordenar tarjetas) · classify (clasificar en calderos)
     match (unir pares) · pick (tocar la parte correcta de una molécula). */
  const MIN_WRITE = 25;
  /* Respuesta numérica (Fisicoquímica, Analítica): acepta coma o punto, "1,2e-3", "1,2x10^-3" y "1,2·10⁻³".
     Se corrige con tolerancia relativa (item.tol, por defecto 2 %) y, si hay varias unidades para elegir, la unidad debe ser la pedida. */
  function parseNum(raw) {
    let t = String(raw ?? '').trim().replace(/\s+/g, '').replace(/−/g, '-').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, ch => '0123456789-'['⁰¹²³⁴⁵⁶⁷⁸⁹⁻'.indexOf(ch)]);
    t = t.replace(/(?:x|×|\*|·)10\^?(-?\d+)$/i, 'e$1');
    if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(t)) t = t.replace(/\./g, ''); // 1.234,5
    t = t.replace(',', '.');
    return /^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(t) ? Number(t) : NaN;
  }
  const numOk = (item, num) => Number.isFinite(num) && Math.abs(num - item.answer) <= Math.max(Math.abs(item.answer) * (item.tol ?? 0.02), 1e-12);
  const fmtNum = x => (Math.abs(x) >= 1e5 || (Math.abs(x) < 1e-3 && x !== 0) ? x.toExponential(2).replace('e', ' × 10^').replace('.', ',') : Number(x.toPrecision(4)).toLocaleString('es-CL'));
  const trapOf = (item, num) => (item.traps || []).find(t => Number.isFinite(num) && Math.abs(num - t.value) <= Math.abs(t.value) * (item.tol ?? 0.02) + 1e-12) || null;
  const PHOTOS = new Map(); // fotos de la hoja en papel: solo en memoria, nunca se guardan
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Ideas clave de una respuesta escrita (solo busca palabras: orienta, no reemplaza la autocorrección).
  const keyIdeas = (item, text) => (item.keywords || []).map(k => ({ label: k.label, hit: k.any.some(word => norm(text).includes(norm(word))) }));
  function recipeWhy(item, seq) {
    const bad = seq.find((id, i) => !item.answer.includes(id)) ;
    if (bad) return item.notes?.[bad] || 'Ese ingrediente no va en esta receta.';
    return item.orderNote || 'Los ingredientes son correctos, pero el orden no.';
  }
  const seeded = (list, seed) => list.map((x, i) => [x, [...`${seed}${i}`].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7)]).sort((a, b) => a[1] - b[1]).map(([x]) => x);
  const recordOf = (s, item, retry) => retry ? s.retries[item.id] : s.answers[item.id];
  const workOf = (s, item, retry) => (s.work[retry ? `${item.id}::r` : item.id] ||= {});
  const actBtn = (item, retry, action, attrs, inner, cls = '', disabled = false) =>
    `<button class="${cls}" data-cr="${action}" data-item="${esc(item.id)}" data-retry="${retry ? 1 : 0}" ${attrs} ${disabled ? 'disabled' : ''}>${inner}</button>`;

  function isCorrect(item, value) {
    if (item.type === 'order') return JSON.stringify(value) === JSON.stringify(item.answer);
    if (item.type === 'classify') return item.cards.every(c => value?.[c.id] === c.bucket);
    if (item.type === 'match') return item.pairs.every((_, i) => Number(value?.[i]) === i);
    if (item.type === 'pick') return value === item.answer;
    // Escrita: autocorrección honesta; cuenta solo si escribiste algo y marcaste todas las ideas de la pauta.
    if (item.type === 'build' || item.type === 'arrows') return Boolean(window.NexoMolEditor?.isCorrect(item, value));
    if (item.type === 'poe') return Boolean(item.options[value?.pred]?.correct);
    if (item.type === 'recipe') return JSON.stringify(value) === JSON.stringify(item.answer);
    if (item.type === 'spot') return value?.step === item.wrong && Boolean(item.fix.options[value?.fix]?.correct);
    if (item.type === 'write') return (value?.paper || String(value?.text || '').trim().length >= MIN_WRITE) && item.rubric.every((_, i) => value?.checks?.[i] === true);
    if (item.type === 'number') return numOk(item, Number(value?.num)) && (!item.units || value?.unit === item.unit);
    return Boolean(item.options[value]?.correct);
  }
  function mcKeyOf(item, rec) {
    if (!rec || rec.correct) return null;
    if (!item.type || item.type === 'choice') return item.options[rec.choice]?.misconception || null;
    if (item.type === 'pick') return item.targets[rec.value]?.misconception || item.misconception || null;
    if (item.type === 'number') return trapOf(item, Number(rec.value?.num))?.misconception || item.misconception || null;
    return item.misconception || null;
  }
  function mcOf(cls, item, rec) { const key = mcKeyOf(item, rec); return key ? cls.misconceptions[key] || null : null; }
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

  function activityMarkup(cls, s, item, { retry = false } = {}) {
    const rec = recordOf(s, item, retry), w = workOf(s, item, retry);
    const figures = item.figures ? `<div class="cr-figures">${item.figures.map(f => `<figure class="cr-fig"><div>${window.NexoMolEditor?.sceneMarkup(f, { label: f.caption }) || ''}</div><figcaption>${md(f.caption)}</figcaption></figure>`).join('')}</div>` : '';
    if (!item.type || item.type === 'choice') return figures + optionsMarkup(cls, s, item, { retry });
    const done = Boolean(rec);
    const check = ready => done ? '' : `<div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Comprobar ▸', 'cr-btn cr-primary', !ready)}</div>`;

    if (item.type === 'order') {
      const seq = done ? rec.value : (w.seq ||= []);
      const pool = seeded(item.cards, item.id).filter(c => !seq.includes(c.id));
      return `<div class="cr-order"><p class="cr-act-help">${esc(item.direction || 'Toca las tarjetas en orden.')}</p>
        <ol class="cr-slots">${item.cards.map((_, i) => {
          const id = seq[i], card = item.cards.find(c => c.id === id);
          const tone = done ? (item.answer[i] === id ? 'is-right' : 'is-wrong') : '';
          return `<li class="cr-slot ${card ? 'is-filled' : ''} ${tone}"><span class="cr-slot-n">${i + 1}</span>${card ? actBtn(item, retry, 'act-unpick', `data-i="${i}"`, md(card.text), 'cr-chip', done) : '<span class="cr-slot-empty">…</span>'}</li>`;
        }).join('<li class="cr-slot-sep" aria-hidden="true">‹</li>')}</ol>
        ${pool.length ? `<div class="cr-pool">${pool.map(c => actBtn(item, retry, 'act-pick', `data-card="${esc(c.id)}"`, md(c.text), 'cr-chip is-loose')).join('')}</div>` : ''}
        ${done && !rec.correct && retry ? `<p class="cr-solution">Orden correcto: ${item.answer.map(id => md(item.cards.find(c => c.id === id).text)).join(' &lt; ')}</p>` : ''}
        ${check(seq.length === item.cards.length)}</div>`;
    }
    if (item.type === 'classify') {
      const assign = done ? rec.value : (w.assign ||= {});
      const loose = seeded(item.cards, item.id).filter(c => !assign[c.id]);
      return `<div class="cr-classify"><p class="cr-act-help">${done ? 'Así quedó tu clasificación.' : 'Toca una tarjeta y luego el caldero donde va.'}</p>
        ${loose.length ? `<div class="cr-pool">${loose.map(c => actBtn(item, retry, 'act-sel', `data-card="${esc(c.id)}"`, md(c.text), `cr-chip is-loose ${w.sel === c.id ? 'is-selected' : ''}`, done)).join('')}</div>` : ''}
        <div class="cr-buckets">${item.buckets.map(bk => `<div class="cr-bucket">
          ${actBtn(item, retry, 'act-drop', `data-bucket="${esc(bk.id)}"`, `<b>${esc(bk.label)}</b>`, `cr-bucket-head ${w.sel && !done ? 'is-armed' : ''}`, done || !w.sel)}
          <div class="cr-bucket-body">${item.cards.filter(c => assign[c.id] === bk.id).map(c => actBtn(item, retry, 'act-unassign', `data-card="${esc(c.id)}"`, md(c.text), `cr-chip ${done ? (c.bucket === bk.id ? 'is-right' : 'is-wrong') : ''}`, done)).join('')}</div></div>`).join('')}</div>
        ${done && !rec.correct && retry ? `<p class="cr-solution">${item.buckets.map(bk => `<b>${esc(bk.label)}:</b> ${item.cards.filter(c => c.bucket === bk.id).map(c => md(c.text)).join(', ')}`).join(' · ')}</p>` : ''}
        ${check(loose.length === 0)}</div>`;
    }
    if (item.type === 'match') {
      const pairs = done ? rec.value : (w.pairs ||= {});
      const rights = seeded(item.pairs.map((p, i) => ({ ...p, i })), item.id);
      const usedRight = new Set(Object.values(pairs).map(Number));
      return `<div class="cr-match"><p class="cr-act-help">${done ? 'Así uniste los pares.' : 'Toca uno de la izquierda y luego su pareja de la derecha.'}</p>
        <div class="cr-match-cols"><div class="cr-match-col">${item.pairs.map((p, i) => {
          const r = pairs[i];
          const tone = done ? (Number(r) === i ? 'is-right' : 'is-wrong') : '';
          return actBtn(item, retry, 'act-left', `data-i="${i}"`, `${r !== undefined ? `<span class="cr-pair-n">${rights.findIndex(x => x.i === Number(r)) + 1}</span>` : ''}${md(p.left)}`, `cr-chip ${w.left === i && !done ? 'is-selected' : ''} ${tone}`, done);
        }).join('')}</div>
        <div class="cr-match-col">${rights.map((p, k) => actBtn(item, retry, 'act-right', `data-i="${p.i}"`, `<span class="cr-pair-n">${k + 1}</span>${md(p.right)}`, `cr-chip ${usedRight.has(p.i) ? 'is-used' : ''}`, done || w.left === undefined)).join('')}</div></div>
        ${done && !rec.correct && retry ? `<p class="cr-solution">${item.pairs.map(p => `${md(p.left)} → ${md(p.right)}`).join(' · ')}</p>` : ''}
        ${check(Object.keys(pairs).length === item.pairs.length)}</div>`;
    }
    if (item.type === 'poe') {
      // Predice, observa, explica: primero predices; después mueves la simulación y ves qué pasa.
      const sim = item.sim, val = done ? sim.max : (w.sim ?? sim.start), above = val > sim.threshold;
      const pred = done ? rec.value.pred : w.pred;
      const predict = `<p class="cr-act-help"><b>1. Predice.</b> ${md(item.predict)}</p><ol class="cr-options">${item.options.map((o, i) => `<li>${actBtn(item, retry, 'act-poe-pred', `data-choice="${i}" aria-pressed="${pred === i}"`,
        `<span class="cr-letter">${String.fromCharCode(65 + i)}</span><span>${esc(o.text)}</span>`, `cr-option ${pred === i ? (done ? (o.correct ? 'is-right' : 'is-wrong') : 'is-picked') : done && o.correct ? 'is-right' : ''}`, done || pred !== undefined)}</li>`).join('')}</ol>`;
      if (pred === undefined && !done) return `<div class="cr-poe">${predict}</div>`;
      const flask = `<svg class="cr-flask" viewBox="0 0 120 150" aria-hidden="true"><path d="M45 10 h30 v40 l30 70 a10 10 0 0 1 -9 14 h-72 a10 10 0 0 1 -9 -14 l30 -70 z" class="cr-flask-glass"/>
        <path d="M27 90 h66 l12 28 a10 10 0 0 1 -9 14 h-72 a10 10 0 0 1 -9 -14 z" class="cr-flask-liquid"/>
        ${[...Array(9)].map((_, i) => `<circle class="cr-flask-bubble" cx="${30 + (i * 37) % 60}" cy="125" r="${2 + (i % 3)}" style="animation-delay:${(i * .27).toFixed(2)}s"/>`).join('')}</svg>`;
      return `<div class="cr-poe">${predict}
        <div class="cr-sim ${above ? 'is-above' : ''} ${sim.look ? `is-${esc(sim.look)}` : ''}" data-sim="${esc(item.id)}" data-threshold="${sim.threshold}">
          <p class="cr-act-help"><b>2. Observa.</b> ${md(sim.label)}</p>
          <div class="cr-sim-body">${flask}<div class="cr-sim-ctrl">
            <label for="sim-${esc(item.id)}">${esc(sim.name)}: <b data-sim-val>${val} ${esc(sim.unit)}</b></label>
            <input id="sim-${esc(item.id)}" type="range" min="${sim.min}" max="${sim.max}" step="${sim.step || 1}" value="${val}" data-cr-sim="${esc(item.id)}" data-retry="${retry ? 1 : 0}" ${done ? 'disabled' : ''}>
            <p class="cr-sim-text" data-sim-text aria-live="polite">${md(above ? sim.above : sim.below)}</p></div></div></div>
        ${done ? '' : `<div class="cr-check">${actBtn(item, retry, 'act-poe-done', '', '3. Ya observé: ¿acerté? ▸', 'cr-btn cr-primary', !w.moved)}</div>`}</div>`;
    }
    if (item.type === 'recipe') {
      // El caldero: eliges los ingredientes en orden; una poción mal hecha explica su error.
      const seq = done ? rec.value : (w.seq ||= []);
      const failed = done && !rec.correct;
      return `<div class="cr-recipe-act ${done ? (rec.correct ? 'is-right' : 'is-wrong') : ''}">
        <p class="cr-act-help">Partes de: <b>${md(item.base)}</b>. Toca los ingredientes en el orden en que se agregan (${item.answer.length} pasos).</p>
        <div class="cr-cauldron"><svg viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="42" rx="62" ry="12" class="cr-caul-rim"/><path d="M20 42 C 16 96 48 112 80 112 C 112 112 144 96 140 42 Z" class="cr-caul-body"/>
          <ellipse cx="80" cy="44" rx="54" ry="8" class="cr-caul-brew"/>${[...Array(5)].map((_, i) => `<circle class="cr-caul-bub" cx="${44 + i * 18}" cy="44" r="${3 + (i % 2) * 2}" style="animation-delay:${(i * .35).toFixed(2)}s"/>`).join('')}
          ${failed ? '<g class="cr-smoke"><circle cx="64" cy="22" r="14"/><circle cx="88" cy="14" r="18"/><circle cx="104" cy="26" r="12"/></g>' : ''}</svg>
          <ol class="cr-slots cr-caul-seq">${item.answer.map((_, i) => { const id = seq[i], ing = item.ingredients.find(x => x.id === id);
            return `<li class="cr-slot ${ing ? 'is-filled' : ''} ${done ? (item.answer[i] === id ? 'is-right' : 'is-wrong') : ''}"><span class="cr-slot-n">${i + 1}</span>${ing ? actBtn(item, retry, 'act-rc-del', `data-i="${i}"`, md(ing.label), 'cr-chip', done) : '<span class="cr-slot-empty">…</span>'}</li>`; }).join('')}</ol></div>
        ${done ? '' : `<div class="cr-pool cr-shelf">${item.ingredients.filter(x => !seq.includes(x.id)).map(x => actBtn(item, retry, 'act-rc-add', `data-card="${esc(x.id)}"`, md(x.label), 'cr-chip is-loose', seq.length >= item.answer.length)).join('')}</div>
          <div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Preparar la poción ▸', 'cr-btn cr-primary', seq.length !== item.answer.length)}</div>`}
        ${done ? `<p class="mol-status ${rec.correct ? 'is-ok' : 'is-bad'}">${rec.correct ? `¡La poción brilla! Obtuviste ${md(item.target)}.` : `La poción salió mal. ${md(recipeWhy(item, seq))}`}</p>` : ''}</div>`;
    }
    if (item.type === 'number') {
      // Calcula y escribe el valor (con su unidad si hay que elegirla).
      const raw = done ? rec.value.raw : (w.text || ''), unit = done ? rec.value.unit : (w.unit || ''), num = done ? Number(rec.value.num) : parseNum(raw), trap = done && !rec.correct ? trapOf(item, num) : null;
      const unitSel = item.units ? `<select class="cr-num-unit" data-cr-unit="${esc(item.id)}" data-retry="${retry ? 1 : 0}" aria-label="Unidad" ${done ? 'disabled' : ''}><option value="">unidad…</option>${item.units.map(u => `<option ${u === unit ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select>`
        : item.unit ? `<span class="cr-num-fixed">${esc(item.unit)}</span>` : '';
      return `<div class="cr-num"><p class="cr-act-help">${done ? '' : 'Resuélvelo (en papel si quieres) y escribe el resultado. Puedes usar coma decimal o notación 1,2e-3.'}</p>
        <div class="cr-num-row"><span class="cr-num-label">${md(item.label || 'Resultado')} =</span><input class="cr-num-input ${done ? (rec.correct ? 'is-right' : 'is-wrong') : ''}" inputmode="decimal" autocomplete="off" data-cr-text="${esc(item.id)}" data-retry="${retry ? 1 : 0}" value="${esc(raw)}" aria-label="Tu resultado" ${done ? 'disabled' : ''}>${unitSel}</div>
        ${!done && w.warn ? '<p class="cr-warn">Escribe un número (por ejemplo 0,0123 o 1,23e-2)' + (item.units ? ' y elige la unidad' : '') + '.</p>' : ''}
        ${done ? `<p class="mol-status ${rec.correct ? 'is-good' : 'is-bad'}">${rec.correct ? '¡Correcto!' : `Era <b>${esc(fmtNum(item.answer))} ${esc(item.unit || '')}</b>.`} ${trap ? md(trap.note) : !rec.correct && item.units && rec.value.unit !== item.unit && numOk(item, num) ? 'El número estaba bien, pero la unidad no.' : ''}</p>
          ${item.solution ? `<ol class="cr-num-steps">${item.solution.map(t => `<li>${md(t)}</li>`).join('')}</ol>` : ''}`
        : `<div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Comprobar ▸', 'cr-btn cr-primary')}</div>`}</div>`;
    }
    if (item.type === 'spot') {
      // El aprendiz se equivocó: encuentra el paso malo y corrígelo.
      const step = done ? rec.value.step : w.step, fixing = step === item.wrong;
      return `<div class="cr-spot-act"><p class="cr-act-help">${fixing && !done ? '<b>¡Ahí está!</b> Ahora elige cómo se corrige ese paso.' : 'Toca el paso donde se equivocó el aprendiz.'}</p>
        <ol class="cr-apprentice">${item.steps.map((t, i) => `<li>${actBtn(item, retry, 'act-spot', `data-i="${i}"`, `<span class="cr-slot-n">${i + 1}</span><span>${md(t)}</span>`,
          `cr-step ${step === i ? (i === item.wrong ? 'is-right' : 'is-wrong') : done && i === item.wrong ? 'is-right' : ''}`, done || fixing)}</li>`).join('')}</ol>
        ${done && step !== item.wrong ? `<p class="mol-status is-bad">${md(item.stepNotes?.[step] || 'Ese paso está bien. Busca otro.')}</p>` : ''}
        ${fixing ? `<p class="cr-act-help"><b>Corrección:</b> ${md(item.fix.question)}</p><ol class="cr-options">${item.fix.options.map((o, i) => { const picked = done && rec.value.fix === i;
          return `<li>${actBtn(item, retry, 'act-spot-fix', `data-choice="${i}"`, `<span class="cr-letter">${String.fromCharCode(65 + i)}</span><span>${esc(o.text)}</span>`, `cr-option ${picked ? (o.correct ? 'is-right' : 'is-wrong') : done && o.correct && retry ? 'is-right' : ''}`, done)}</li>`; }).join('')}</ol>` : ''}</div>`;
    }
    if (item.type === 'build' || item.type === 'arrows') {
      const E = window.NexoMolEditor;
      return E ? E[item.type === 'build' ? 'buildMarkup' : 'arrowsMarkup'](item, w, { rec, retry, done, actBtn }) : '<p class="cr-act-help">Cargando el editor…</p>';
    }
    if (item.type === 'write') {
      const text = done ? rec.value.text : (w.text || '');
      if (!done && !w.revealed) return `<div class="cr-write"><p class="cr-act-help">Escríbelo con tus palabras. Después verás la respuesta modelo y marcarás qué ideas tenías.</p>
        <textarea class="cr-textarea" data-cr-text="${esc(item.id)}" data-retry="${retry ? 1 : 0}" rows="5" aria-label="Tu respuesta" placeholder="Explícalo como si se lo contaras a un compañero…">${esc(text)}</textarea>
        ${w.warn ? '<p class="cr-warn">Escribe un poco más antes de comparar: una o dos frases bastan.</p>' : ''}
        <div class="cr-check">${actBtn(item, retry, 'act-paper', '', '✎ Lo hice en papel', 'cr-btn')}${actBtn(item, retry, 'act-reveal', '', 'Comparar con la respuesta modelo ▸', 'cr-btn cr-primary')}</div></div>`;
      const checks = done ? rec.value.checks : (w.checks ||= item.rubric.map(() => false));
      const ideas = keyIdeas(item, text);
      const onPaper = done ? rec.value.paper : w.paper, photo = PHOTOS.get(item.id);
      const paperMarkup = onPaper ? `<div class="cr-paper-box"><p class="cr-act-help"><b>Lo resolviste en papel.</b> Pon tu hoja al lado de la respuesta modelo y marca, idea por idea, lo que sí escribiste.</p>
        ${photo ? `<img class="cr-photo" src="${photo}" alt="Foto de tu hoja">` : ''}${done ? '' : `<label class="cr-btn cr-small cr-photo-btn">📷 ${photo ? 'Cambiar la foto' : 'Foto de tu hoja (opcional)'}<input type="file" accept="image/*" capture="environment" data-cr-photo="${esc(item.id)}" hidden></label>
        <p class="cr-idea-note">La foto no se guarda ni se envía: solo se muestra aquí, mientras te corriges.</p>`}</div>` : '';
      const ideasMarkup = !onPaper && ideas.length ? `<div class="cr-ideas"><p class="cr-eyebrow">${item.teach ? 'Lo que tu compañero entendió' : 'Ideas clave que encontré'}</p>
        ${ideas.map(k => `<span class="cr-idea ${k.hit ? 'is-hit' : ''}">${k.hit ? '✓' : '○'} ${esc(k.label)}</span>`).join('')}
        <p class="cr-idea-note">${ideas.every(k => k.hit) ? '¡Mencionaste todas las ideas clave!' : 'Las ideas en gris no aparecieron con esas palabras. Revísalas en la respuesta modelo.'} (Solo busco palabras: tu autocorrección manda.)</p></div>` : '';
      return `<div class="cr-write is-compare">${paperMarkup}${ideasMarkup}<div class="cr-write-cols">
        <div class="cr-write-box"><p class="cr-eyebrow">Tu respuesta</p><p class="cr-write-mine">${esc(text)}</p></div>
        <div class="cr-write-box is-model"><p class="cr-eyebrow">Respuesta modelo</p><p>${md(item.model)}</p></div></div>
        <p class="cr-act-help">${done ? 'Así te autocorregiste.' : 'Marca cada idea que <b>sí</b> estaba en tu respuesta. Sé honesto: esto mide lo que de verdad sabes.'}</p>
        <ul class="cr-rubric">${item.rubric.map((r, i) => `<li>${actBtn(item, retry, 'act-rub', `data-i="${i}" aria-pressed="${Boolean(checks[i])}"`,
          `<span class="cr-rub-box" aria-hidden="true">${checks[i] ? '✓' : ''}</span><span>${md(r)}</span>`, `cr-rub ${checks[i] ? 'is-on' : ''}`, done)}</li>`).join('')}</ul>
        ${done ? '' : `<div class="cr-check">${actBtn(item, retry, 'act-check', '', 'Listo, así me fue ▸', 'cr-btn cr-primary')}</div>`}</div>`;
    }
    if (item.type === 'pick') {
      const val = done ? rec.value : null;
      const part = p => p.target
        ? actBtn(item, retry, 'act-target', `data-target="${esc(p.target)}" aria-label="${esc(item.targets[p.target].label)}"`, md(p.t),
          `cr-target ${done ? (p.target === item.answer && (rec.correct || retry) ? 'is-right' : p.target === val ? 'is-wrong' : 'is-muted') : ''}`, done)
        : `<span class="cr-formula-part">${md(p.t)}</span>`;
      return `<div class="cr-pick"><p class="cr-act-help">${done ? '' : 'Toca la parte de la molécula que responde la pregunta.'}</p>
        ${(item.molecules || [item.parts]).map((parts, i) => `<div class="cr-formula">${item.captions?.[i] ? `<span class="cr-formula-cap">${esc(item.captions[i])}</span>` : ''}<div class="cr-formula-line">${parts.map(part).join('')}</div></div>`).join('')}</div>`;
    }
    return '';
  }

  function whyOthers(cls, item) {
    if (item.type && item.type !== 'choice') {
      let extra = '';
      if (item.type === 'pick') extra = `<ul>${Object.entries(item.targets).map(([id, t]) => {
        const mc = cls.misconceptions[t.misconception]; const reason = id === item.answer ? item.explain : (mc ? mc.why : t.note);
        return reason ? `<li class="${id === item.answer ? 'is-ok' : ''}"><b>${esc(t.label)}</b>${id === item.answer ? ' (correcta)' : ''}: ${md(reason)}</li>` : ''; }).join('')}</ul>`;
      else if (item.type === 'write') extra = '';
      else if (item.type === 'number') extra = `<p>Resultado: <b>${esc(fmtNum(item.answer))} ${esc(item.unit || '')}</b>.</p>${(item.traps || []).length ? `<ul>${item.traps.map(t => `<li>${esc(fmtNum(t.value))}: ${md(t.note)}</li>`).join('')}</ul>` : ''}`;
      else if (item.type === 'build') extra = window.NexoMolEditor?.solution(item) || '';
      else if (item.type === 'arrows') extra = '';
      else if (item.type === 'recipe') extra = `<p>Receta correcta: ${item.answer.map(id => md(item.ingredients.find(x => x.id === id).label)).join(' → ')}.</p>`;
      else if (item.type === 'poe') extra = `<p>${md(item.sim.above)}</p>`;
      else if (item.type === 'spot') extra = `<p>El error estaba en el paso ${item.wrong + 1}. ${md(item.fix.options.find(o => o.correct).text)}.</p>`;
      else if (item.type === 'order') extra = `<p>Orden correcto: ${item.answer.map(id => md(item.cards.find(c => c.id === id).text)).join(' &lt; ')}</p>`;
      return `<details class="cr-why" open><summary>La explicación completa</summary><p>${md(item.explain)}</p>${extra}</details>`;
    }
    const rows = item.options.map((o, i) => {
      const mc = cls.misconceptions[o.misconception];
      const reason = o.correct ? item.explain : mc ? mc.why : o.note;
      return reason ? `<li class="${o.correct ? 'is-ok' : ''}"><b>${String.fromCharCode(65 + i)}. ${esc(o.text)}</b>${o.correct ? ' (correcta)' : ''}: ${md(reason)}</li>` : '';
    }).join('');
    return `<details class="cr-why" open><summary>¿Por qué cada alternativa?</summary><ul>${rows}</ul></details>`;
  }

  /* ───────── Barra de confianza (docs/clase-viva/DISENO.md §5) ─────────
     Antes de responder: qué tan seguro estás. Con 60 % o menos, por qué. Después: qué significa tu resultado. */
  const EV = () => window.NexoClassEvidence;
  const tipMarkup = (key, html) => `<p class="cr-tip" role="note"><span aria-hidden="true">💡</span><span>${html}</span><button class="cr-btn cr-small" data-cr="tip" data-tip="${key}">Entendido</button></p>`;
  function confidenceMarkup(item, s) {
    const conf = s.conf[item.id], why = s.confWhy[item.id], set = conf !== undefined;
    const words = !set ? 'Mueve la barra' : conf <= 20 ? 'Estoy adivinando' : conf <= 60 ? 'Tengo dudas' : conf < 80 ? 'Bastante seguro' : 'Muy seguro';
    const tip = s.tips?.conf ? '' : tipMarkup('conf', 'Primera vez: <b>mueve la barra</b> según qué tan seguro estás antes de responder. No baja tu nota; sirve para saber si lo sabes de verdad o adivinaste.');
    return `${tip}<div class="cr-conf ${set ? '' : 'is-unset'}">
      <label class="cr-conf-label" for="conf-${esc(item.id)}">Antes de responder: ¿qué tan seguro estás? <b>${set ? `${conf} %` : ''}</b> <span>${words}</span></label>
      <input id="conf-${esc(item.id)}" class="cr-conf-range" type="range" min="0" max="100" step="10" value="${set ? conf : 50}" data-cr-conf="${esc(item.id)}"
        style="--v:${set ? conf : 50}%" aria-valuetext="${set ? `${conf} por ciento` : 'sin marcar'}">
      <div class="cr-conf-scale" aria-hidden="true"><span>Adivino</span><span>Dudo</span><span>Seguro</span></div>
      ${set && conf <= 60 ? `<div class="cr-conf-why" role="group" aria-label="¿Por qué no estás tan seguro? (opcional)"><span>¿Por qué? <small>(opcional)</small></span>
        ${Object.entries(EV()?.WHY || {}).map(([k, label]) => `<button class="cr-chip cr-why-chip ${why === k ? 'is-selected' : ''}" data-cr="conf-why" data-why="${k}" data-item="${esc(item.id)}" aria-pressed="${why === k}">${label}</button>`).join('')}</div>` : ''}
    </div>`;
  }
  function confidenceResult(cls, item, rec, closedBook = false) {
    if (!rec || rec.confidence === null || rec.confidence === undefined) return '';
    const c = rec.confidence, kind = rec.kind;
    const text = {
      solido: `Dijiste ${c} % y acertaste: <b>sólido</b>.`,
      alerta: `Dijiste ${c} % y no era así. <b>Este es el error más valioso</b>: creías saberlo. Lee la explicación con calma.`,
      fragil: `Acertaste, pero con ${c} %: <b>acierto frágil</b>. Cuenta menos y esta idea volverá antes.`,
      consciente: `Ya dudabas (${c} %): <b>bien detectado</b>. Ahora sabes qué reforzar.`,
      medio: `Dijiste ${c} %.`
    }[kind] || '';
    let route = '';
    if (!rec.correct || kind === 'fragil') {
      const card = closedBook ? null : (cls.formulas || []).find(f => f.concepts.includes(item.concept));
      if (rec.why === 'regla') route = card ? `<button class="cr-btn cr-small" data-cr="grimoire" data-tab="formulas" data-card="${esc(card.id)}">Abrir el formulario: ${esc(card.title)}</button>`
        : `<button class="cr-btn cr-small" data-cr="spot" data-spot="sage">Repasar la regla desde cero</button>`;
      if (rec.why === 'pregunta') route = `<p class="cr-conf-route"><b>Dicho de otra forma:</b> ${md(item.plain || item.hint || item.explain)}</p>`;
      if (rec.why === 'adivino') route = `<p class="cr-conf-route">Adivinar está bien aquí: lo contamos como algo por aprender, no como sabido.</p>`;
    }
    return `<div class="cr-conf-result is-${esc(kind)}"><p>${text}</p>${route}</div>`;
  }
  /* Vista previa del árbol (etapa 1): cada concepto con su hoja. En la etapa 2 se dibuja como árbol vivo. */
  function leafChips(cls, api, id, filter = () => true) {
    const E = EV();
    if (!E || !cls.concepts) return '';
    const store = E.storeFor(api.getState(), id), all = E.leaves(cls, store);
    return `<ul class="cr-leaves">${cls.concepts.filter(filter).map(c => { const l = all[c.id];
      return `<li class="cr-leaf is-${l.shown}"><span class="cr-leaf-dot" aria-hidden="true"></span><b>${esc(c.title)}</b><small>${esc(l.label)}</small></li>`; }).join('')}</ul>`;
  }
  /* Torre del Sauce (etapa 10): la etapa sale de tu avance y cada hilo del sauce es un concepto con su hoja real. */
  const LEAF_TO_STRAND = { semilla: 'none', brote: 'bud', clara: 'bud', verde: 'green', intensa: 'green', flor: 'flower', amarilla: 'yellow', seca: 'dry' };
  function willowOf(cls, api, s) {
    const E = EV(), store = E ? E.storeFor(api.getState(), cls.id) : { records: [] }, all = E ? E.leaves(cls, store) : {};
    const concepts = (cls.concepts || []).filter(c => !c.root), roots = (cls.concepts || []).filter(c => c.root);
    const states = concepts.map(c => LEAF_TO_STRAND[all[c.id]?.shown] || 'none');
    const items = allItems(cls), done = items.filter(({ item }) => s.answers[item.id]).length, p = items.length ? done / items.length : 0;
    const started = (store.records || []).length > 0 || Object.keys(s.answers || {}).length > 0;
    const goal = goalOf(cls, s), mastered = goal && goal.max > 0 && goal.earned >= goal.max - 1e-9;
    const stage = !started ? 0 : mastered ? 6 : Math.min(5, 1 + 4 * p);
    const rootsShown = roots.length ? roots.filter(c => all[c.id] && all[c.id].shown !== 'semilla').length / roots.length : 1;
    const green = states.filter(x => x === 'green' || x === 'flower').length, lit = states.filter(x => x === 'flower').length;
    return { stage, states, roots: started ? Math.max(0.3, rootsShown) : 0, green, lit, total: states.length,
      floor: stage >= 6 ? 'el sauce rompió el techo' : stage >= 2 ? `piso ${Math.min(4, Math.floor(stage - 1))} de 4` : stage >= 1 ? 'semilla y raíces' : 'torre dormida' };
  }
  // Acceso a la torre del ramo (su propio lugar, #/torre/<ramo>): el sauce no se pega chico dentro de un panel.
  function willowMarkup(cls, api, s) {
    const w = willowOf(cls, api, s);
    return `<button class="cr-willow-link" data-cr="willow"><span aria-hidden="true">🌳</span><span><b>Ver tu torre</b><small>${esc(w.floor)} · ${w.green} de ${w.total} hilos verdes${w.lit ? ` · ${w.lit} farolitos` : ''}</small></span><span aria-hidden="true">▸</span></button>`;
  }
  // Al volver de la torre: abre lo que elegiste allá (una misión, un camino o el Camino al 7).
  function applyIntent(cls, s, api, id) {
    const it = s.intent; if (!it) return; s.intent = null; s.panel = null; s.slideOpen = null;
    if (it.panel === 'goal') { s.panel = 'goal'; return; }
    if (it.path === 'misiones' && it.mission && missionById(cls, it.mission)) {
      s.path = 'misiones'; s.mission = it.mission; const far = s.far[s.mission] || 0, n = beats(cls, s).length; s.beat = far > 1 && far < n - 1 ? far : 1; return; }
    if (it.path && PATHS[it.path]) { s.path = it.path; s.mission = null; s.beat = 1;
      if (s.path === 'alba') { const key = `${today()}:4`; s.albaKey = key; if (!s.rounds[key]) s.rounds[key] = roundPick(cls, s, EV()?.storeFor(api.getState(), id), 4); } }
  }
  function calibrationLine(cls, api, id) {
    const E = EV();
    if (!E) return '';
    const bands = E.calibration(E.storeFor(api.getState(), id).records).filter(x => x.n);
    if (!bands.length) return '';
    return `<p class="cr-calib"><b>Tu calibración:</b> ${bands.map(x => `cuando dices ${x.label} %, aciertas ${x.right} de ${x.n}`).join(' · ')}.</p>`;
  }
  const showWhy = rec => rec && (rec.correct || rec.kind === 'alerta' || rec.why === 'dos');

  // Qué le pasó a tu nivel con esta respuesta de Entrenar.
  function trainNote(cls, s, item) {
    if (!item.gen) return '';
    const T = trainLevels(cls, s), now = levelOf(cls, s, item.concept, T), was = item.gen.level, rec = s.answers[item.id];
    if (now > was) return ` **¡Subes a ${LEVELS[now - 1]}!**`;
    if (now < was) return ` Bajamos a **${LEVELS[now - 1]}** para afirmar la base; con 2 seguidas vuelves a subir.`;
    if (rec?.correct && !rec.hint && T.streak[item.concept]) return ' Una más sin pista y subes de nivel.';
    return '';
  }
  /* Qué dice el sabio y qué aparece al centro en cada momento. */
  function moment(cls, api, s, b) {
    const sage = { text: '', actions: '', mood: 'calm' };
    let center = '';
    const cont = (label = 'Continuar') => `<button class="cr-btn cr-primary cr-next" data-cr="next">${label} ▸</button>`;

    if (b.kind === 'path') {
      sage.text = `Bienvenido a la torre, aprendiz. Hoy abriremos el capítulo de **${cls.title}** (${cls.evaluation}). ¿Cómo quieres aprender?`;
      center = `<div class="cr-paths" role="group" aria-label="Camino de estudio">${PATH_ORDER.filter(id => PATHS[id] && !PATHS[id].hidden).map(id => [id, PATHS[id]]).map(([id, p]) =>
        `<button class="cr-path ${id === 'diagnostico' && !diagnosisPlan(cls, s).done ? 'is-recommended' : ''}" data-cr="path" data-path="${id}"><span class="cr-path-tag">${esc(p.tag)}</span>${id === 'diagnostico' && !diagnosisPlan(cls, s).done ? '<span class="cr-path-rec">Recomendado para empezar</span>' : ''}<b>${esc(p.name)}</b><span>${esc(p.text)}</span></button>`).join('')}</div>
        ${(ex => ex ? `<p class="cr-soon cr-exam-line">⏳ <b>${esc(ex.title)}</b> ${esc(ex.label)} (${esc(ex.when)})${ex.topic ? ` · ${esc(ex.topic)}` : ''}${cls.goal ? ' · <button class="cr-link" data-cr="goal">ver mi camino al 7</button>' : ''}</p>` : '')(nextExam(cls, api))}
        ${nextExam(cls, api) ? '' : cls.goal ? `<p class="cr-soon cr-goal-line">${cls.missions.length} misiones · Meta: ${esc(cls.goal.text)} (de ${cls.goal.total} para el 7) · <button class="cr-link" data-cr="goal">ver mi camino al 7</button></p>`
          : `<p class="cr-soon">${cls.missions.length} misiones · todo lo de ${esc(cls.title)} para la ${esc(cls.evaluation)}</p>`}`;
      return { sage, center };
    }
    if (b.kind === 'pick') {
      sage.text = 'Elige una misión. Te recomiendo ir en orden: cada una usa lo que aprendiste en la anterior.';
      const goal = goalOf(cls, s);
      center = `${goal ? `<button class="cr-goal-card" data-cr="goal"><span><b>Tu camino al 7</b><small>${esc(goal.text)}</small></span>
        <span class="cr-goal-num"><b>${pts(goal.earned)}</b>/${goal.total} pts</span>${goalMeter(goal)}</button>` : ''}
        ${(() => { if (!cls.diagnosis) return ''; const plan = diagnosisPlan(cls, s);
          if (!plan.done) return `<button class="cr-tip-card" data-cr="path" data-path="diagnostico"><b>¿No sabes por dónde partir?</b><span>Diagnóstico de 5 minutos: te digo qué misión te conviene.</span></button>`;
          return plan.start ? `<button class="cr-tip-card is-done" data-cr="mission" data-mission="${plan.start.id}"><b>Según tu diagnóstico, empieza por la Misión ${cls.missions.indexOf(plan.start) + 1}</b><span>${esc(plan.start.title)} ▸</span></button>` : ''; })()}
        <ol class="cr-mission-map">${cls.missions.map((m, i) => {
        const items = allItems(cls, m.id), done = items.filter(({ item }) => s.answers[item.id]).length;
        const worth = goal ? goal.worth(m.id) : 0;
        return `<li><button class="cr-mission-card ${done === items.length && items.length ? 'is-done' : ''}" data-cr="mission" data-mission="${m.id}">
          <span class="cr-mission-n">${i + 1}</span><span class="cr-mission-txt"><b>${esc(m.title)}</b><small>${esc(m.subtitle)}</small></span>
          <span class="cr-mission-meta"><span>≈ ${m.minutes} min${m.pep ? ` · ${esc(m.pep)}` : ''}</span><span>${done}/${items.length} respondidas${done === items.length && items.length ? ' ✓' : ''}</span>
          ${worth ? `<em class="cr-mission-pts">${pts(goal.won(m.id))}/${pts(worth)} pts PEP</em>` : '<em class="cr-mission-pts is-base">base</em>'}</span></button></li>`;
      }).join('')}</ol>
        ${cls.base?.length ? `<button class="cr-tip-card is-base" data-cr="path" data-path="base"><b>Repaso desde cero (opcional)</b><span>${cls.base.map(m => esc(m.title)).join(' · ')}</span></button>` : ''}`;
      return { sage, center };
    }
    if (b.kind === 'basepick') {
      sage.text = 'El repaso desde cero es **opcional**: úsalo si una base te está costando. Cada uno dura unos minutos y termina con una pregunta escrita.';
      sage.actions = `<button class="cr-btn" data-cr="path" data-path="misiones">◂ Volver a las misiones</button>`;
      center = `<ol class="cr-mission-map">${cls.base.map((m, i) => {
        const items = allItems(cls, m.id), done = items.filter(({ item }) => s.answers[item.id]).length;
        return `<li><button class="cr-mission-card ${done === items.length ? 'is-done' : ''}" data-cr="base" data-mission="${m.id}">
          <span class="cr-mission-n">${String.fromCharCode(65 + i)}</span><span class="cr-mission-txt"><b>${esc(m.title)}</b><small>${esc(m.subtitle)}</small></span>
          <span class="cr-mission-meta"><span>≈ ${m.minutes} min</span><span>${done}/${items.length} respondidas${done === items.length ? ' ✓' : ''}</span><em class="cr-mission-pts is-base">base</em></span></button></li>`;
      }).join('')}</ol>`;
      return { sage, center };
    }
    if (b.kind === 'diagresult') {
      const { plan } = b, title = id => (cls.concepts || []).find(c => c.id === id)?.title || id;
      const firm = [...plan.right].map(id => `<li class="is-right">✓ ${esc(title(id))}</li>`).join('') + [...plan.likely].map(id => `<li class="is-likely">· ${esc(title(id))} <small>(lo deduzco)</small></li>`).join('');
      const weak = [...plan.wrong].map(id => `<li class="is-wrong">✗ ${esc(title(id))}</li>`).join('');
      const n = m => cls.missions.indexOf(m) + 1, listY = l => l.length > 1 ? `${l.slice(0, -1).join(', ')} y ${l[l.length - 1]}` : l.join('');
      sage.text = plan.bases.length ? `Encontré una base que conviene afirmar: **${plan.bases.map(x => x.title).join('** y **')}**. Es opcional, pero con ella todo lo demás se hace más fácil.${plan.start ? ` Después, empieza por la **Misión ${n(plan.start)}**.` : ''}`
        : plan.start ? `Te recomiendo empezar por la **Misión ${n(plan.start)}: ${plan.start.title}**. Lo anterior parece firme.` : 'Todo lo que medí parece firme. Para asegurarlo, haz un **Simulacro PEP**: preguntas como las de la prueba, con reloj y sin ayuda.';
      sage.mood = 'proud';
      sage.actions = `${plan.bases.map((x, i) => `<button class="cr-btn ${i ? '' : 'cr-primary'}" data-cr="base" data-mission="${x.id}">Repasar ${esc(x.title)} ▸</button>`).join('')}
        ${plan.start ? `<button class="cr-btn ${plan.bases.length ? '' : 'cr-primary'}" data-cr="mission" data-mission="${plan.start.id}">Empezar la Misión ${n(plan.start)} ▸</button>` : `<button class="cr-btn cr-primary" data-cr="path" data-path="simulacro">Simulacro PEP ▸</button>`}
        <button class="cr-btn" data-cr="path" data-path="misiones">Ver todas las misiones</button>`;
      center = `<div class="cr-parchment cr-diag"><p class="cr-eyebrow">Tu punto de partida · hipótesis</p><h3>Lo que medí en ${plan.asked.length} preguntas</h3>
        <div class="cr-diag-cols"><div><p class="cr-diag-h">Parece firme</p><ul>${firm || '<li class="is-likely">Todavía nada seguro</li>'}</ul></div>
          <div><p class="cr-diag-h">Por reforzar</p><ul>${weak || '<li class="is-likely">Nada de lo que medí</li>'}</ul></div></div>
        <p class="cr-note">Con ${plan.asked.length} preguntas no se puede saber todo: es una <b>hipótesis</b> que las misiones van corrigiendo solas.
          ${plan.unmeasured.length ? `No medí ${listY(plan.unmeasured.map(m => `la Misión ${n(m)} (${esc(m.title)})`))}: ${plan.unmeasured.length > 1 ? 'revísalas' : 'revísala'} cuando quieras.` : ''}</p>
        <button class="cr-link" data-cr="diag-redo">Volver a hacer el diagnóstico</button></div>`;
      return { sage, center };
    }
    if (b.kind === 'detour') {
      const key = `${b.m.id}:${b.root}`, d = s.detour[key];
      if (d === undefined) {
        sage.text = `Fallaste dos veces algo que se apoya en la misma base: **${b.bm.title}**. No es falta de esfuerzo; es una base que conviene afirmar. ¿Hacemos un repaso corto y volvemos a tu problema?`;
        sage.mood = 'calm';
        sage.actions = `<button class="cr-btn cr-primary" data-cr="detour" data-key="${esc(key)}" data-go="1">Sí, repasemos ▸</button><button class="cr-btn" data-cr="detour" data-key="${esc(key)}" data-go="0">Ahora no, sigo</button>`;
      } else {
        sage.text = d ? 'Vamos al repaso: una explicación, dos ejercicios fáciles y de vuelta al problema.' : 'Seguimos. Cuando quieras, el repaso está en el mapa de misiones: "Repaso desde cero".';
        sage.actions = cont();
      }
      center = `<div class="cr-parchment cr-detour"><p class="cr-eyebrow">Errores que guían · falta una base</p><h3>${esc(b.bm.title)}</h3>
        <p>Estos errores tienen el mismo origen:</p><ul>${b.items.map(it => `<li>${md(it.prompt)}</li>`).join('')}</ul>
        <p class="cr-note"><b>El desvío:</b> ${esc(b.bm.stages.explain[0].title)} → 2 ejercicios fáciles → vuelves a intentar el problema que fallaste.</p></div>`;
      return { sage, center };
    }
    if (b.kind === 'plan') {
      const E = EV(), store = E?.storeFor(api.getState(), cls.id), seen = Boolean(store?.records.length || Object.keys(s.answers).length);
      const mins = s.planMin;
      if (!mins) {
        sage.text = '¿Cuánto tiempo tienes hoy? Te armo la sesión por bloques: primero lo que se te está olvidando, después lo nuevo y, si alcanza, un simulacro.';
        center = `<div class="cr-parchment cr-plan"><p class="cr-eyebrow">Tengo X minutos</p><h3>¿Cuánto tiempo tienes?</h3>
          <div class="cr-plan-mins">${[10, 25, 45, 120].map(n => `<button class="cr-btn ${n === 45 ? 'cr-primary' : ''}" data-cr="plan-min" data-min="${n}">${n < 60 ? `${n} min` : '2 horas'}</button>`).join('')}</div></div>`;
        return { sage, center };
      }
      const frac = m => { const it = allItems(cls, m.id); return it.length ? it.filter(({ item }) => s.answers[item.id]).length / it.length : 1; };
      const dx = cls.diagnosis ? diagnosisPlan(cls, s) : null;
      const next = (dx?.done && dx.start && frac(dx.start) < 1 ? dx.start : null) || cls.missions.find(m => frac(m) < 1) || cls.missions[cls.missions.length - 1];
      const albaDone = size => { const k = `${today()}:${size}`, ids = s.rounds[k]; return Boolean(ids?.length) && ids.every(i => s.answers[`${i}@a${k}`]); };
      const simToday = (s.simHistory || []).some(h => h.at?.startsWith(today()));
      const n = cls.missions.indexOf(next) + 1;
      const alba = (size, min, name = 'Ronda del alba', why = 'Lo que se te está olvidando, sin mirar apuntes.') => ({ name, min, why, btn: `<button class="cr-btn cr-small" data-cr="path" data-path="alba" data-size="${size}">Empezar ▸</button>`, done: albaDone(size), skip: !seen });
      const nuevo = min => ({ name: `Lo nuevo: Misión ${n}`, min, why: `${next.title}. Retomas donde quedaste.`, btn: `<button class="cr-btn cr-small" data-cr="mission" data-mission="${next.id}">Ir ▸</button>`, done: frac(next) >= 1 });
      const sim = min => ({ name: 'Mini simulacro PEP', min, why: 'Un caso estilo prueba por misión, con cronómetro.', btn: '<button class="cr-btn cr-small" data-cr="path" data-path="simulacro" data-size="mini">Empezar ▸</button>', done: simToday });
      const pause = min => ({ name: 'Pausa', min, why: 'Levántate, toma agua y mira lejos de la pantalla.', btn: '', done: false });
      const plan = { 10: [alba(3, 4), nuevo(6)], 25: [alba(3, 5), nuevo(20)], 45: [alba(4, 5), nuevo(25), sim(12)],
        120: [alba(5, 10), nuevo(40), pause(10), alba(10, 35, 'Práctica mezclada', 'Diez preguntas revueltas de todo lo que has visto.'), sim(20)] }[mins]
        .filter(x => !x.skip);
      const total = plan.reduce((a, x) => a + x.min, 0);
      const ex = nextExam(cls, api);
      sage.text = `${ex ? `El **${ex.title}** ${ex.label}. ` : ''}Tu plan de **${mins < 60 ? `${mins} minutos` : '2 horas'}**. Hazlo en orden: el repaso primero, porque recordar algo que se te está olvidando es lo que más lo fija.${seen ? '' : ' Como todavía no has visto nada, parte directo con lo nuevo.'}`;
      sage.actions = `<button class="cr-btn" data-cr="plan-min" data-min="0">Cambiar el tiempo</button>`;
      center = `<div class="cr-parchment cr-plan"><p class="cr-eyebrow">Tu plan de hoy · ≈ ${total} min</p>
        <ol class="cr-plan-list">${plan.map((x, i) => `<li class="${x.done ? 'is-done' : ''}"><span class="cr-plan-n">${x.done ? '✓' : i + 1}</span>
          <span class="cr-plan-txt"><b>${esc(x.name)}</b> <small>${x.min} min</small><span>${esc(x.why)}</span></span>${x.done ? '<em>Hecho</em>' : x.btn}</li>`).join('')}</ol>
        <p class="cr-note">Cuando termines un bloque, vuelve aquí con <b>Volver a mi plan</b>.</p></div>`;
      return { sage, center };
    }
    if (b.kind === 'albaclose') {
      const planBtn = s.planDay === today() ? '<button class="cr-btn" data-cr="path" data-path="tiempo">Volver a mi plan</button>' : '';
      if (b.empty) {
        sage.text = 'Todavía no hay nada que repasar: la ronda usa lo que ya viste. Haz una misión y vuelve mañana: ahí empieza lo bueno.';
        sage.actions = `<button class="cr-btn cr-primary" data-cr="path" data-path="misiones">Ir a las misiones</button>${planBtn}`;
        center = '<div class="cr-parchment"><p class="cr-eyebrow">Ronda del alba</p><p>Aquí aparecerán, cada día, preguntas mezcladas de lo que se te está olvidando.</p></div>';
        return { sage, center };
      }
      const ids = (s.rounds[s.albaKey] || []).map(i => `${i}@a${s.albaKey}`), ok = ids.filter(i => s.answers[i]?.correct).length;
      sage.text = ok === ids.length ? `¡${ok} de ${ids.length} sin mirar! Eso es memoria de verdad.` : `${ok} de ${ids.length} sin mirar. Lo que fallaste vuelve antes: así funciona el repaso espaciado.`;
      sage.mood = ok === ids.length ? 'proud' : 'calm';
      sage.actions = `${planBtn}<button class="cr-btn" data-cr="path" data-path="misiones">Ir a las misiones</button><button class="cr-btn" data-cr="exit">Salir de la torre</button>`;
      center = `<div class="cr-parchment cr-summary-card"><p class="cr-eyebrow">Ronda del alba · ${esc(today())}</p>
        <ul class="cr-round">${ids.map(i => { const it = findItem(cls, i), c = (cls.concepts || []).find(k => k.id === it.concept);
          return `<li class="${s.answers[i]?.correct ? 'is-right' : 'is-wrong'}">${s.answers[i]?.correct ? '✓' : '✗'} <b>${esc(c?.title || '')}</b> <small>${esc(missionOfItem(cls, i)?.title || '')}</small></li>`; }).join('')}</ul>
        <div class="cr-goal-close"><p class="cr-eyebrow">Tus hojas</p>${leafChips(cls, api, cls.id, c => ids.some(i => findItem(cls, i).concept === c.id))}</div>
        <p class="cr-note">Una hoja <b>florece</b> cuando aciertas sin ayuda, 24 horas o más después de haberla puesto verde. Por eso esta ronda es diaria.</p></div>`;
      return { sage, center };
    }
    if (b.kind === 'trainpick') {
      const G = GEN(cls);
      if (!G) {
        sage.text = 'Esta clase todavía no tiene ejercicios infinitos. Mientras, usa la Ronda del alba.';
        sage.actions = '<button class="cr-btn cr-primary" data-cr="path" data-path="alba">Ronda del alba</button>';
        return { sage, center };
      }
      const T = trainLevels(cls, s), cs = genConcepts(cls), title = c => (cls.concepts || []).find(k => k.id === c)?.title || c;
      const chip = c => { const l = levelOf(cls, s, c, T); return `<button class="cr-chip cr-train-chip is-l${l}" data-cr="train" data-focus="c:${esc(c)}"><b>${esc(title(c))}</b><span>${esc(LEVELS[l - 1])}${T.streak[c] ? ' · 1 de 2 para subir' : ''}</span></button>`; };
      sage.text = 'Entrena con ejercicios **nuevos cada vez**, de 8 en 8. Parto en tu nivel de cada tema y lo ajusto: **2 aciertos seguidos sin pista suben un nivel; un error baja uno.** Así trabajas donde más se aprende: difícil, pero alcanzable.';
      sage.actions = `<button class="cr-btn cr-primary" data-cr="train" data-focus="mix">Lo que más necesito ▸</button>`;
      center = `<div class="cr-parchment cr-train-pick"><p class="cr-eyebrow">Entrenar · ejercicios infinitos</p>
        <button class="cr-tip-card is-done" data-cr="train" data-focus="mix"><b>Lo que más necesito (recomendado)</b><span>Mezcla de los temas que ya empezaste, primero los de nivel más bajo. Mezclar temas cuesta más, pero se recuerda mejor.</span></button>
        <p class="cr-train-levels" aria-label="Niveles">${LEVELS.map((l, i) => `<span class="cr-level is-l${i + 1}">${i + 1} · ${esc(l)}</span>`).join('')}</p>
        ${cls.missions.map((m, i) => { const mine = cs.filter(c => (cls.concepts || []).find(k => k.id === c)?.mission === m.id); return mine.length ? `<div class="cr-train-row">
          <button class="cr-link" data-cr="train" data-focus="m:${m.id}">Misión ${i + 1} · ${esc(m.title)} ▸</button><div class="cr-train-chips">${mine.map(chip).join('')}</div></div>` : ''; }).join('')}
        <div class="cr-train-row"><span class="cr-train-base">Bases</span><div class="cr-train-chips">${cs.filter(c => (cls.concepts || []).find(k => k.id === c)?.root).map(chip).join('')}</div></div>
        <button class="cr-tip-card is-base" data-cr="grimoire" data-tab="lab"><b>Laboratorio libre</b><span>Mezcla reactivos y mira qué pasa, sin nota. Ideal para armar rutas de síntesis.</span></button></div>`;
      return { sage, center };
    }
    if (b.kind === 'trainsum') {
      const run = s.trainRun, T = trainLevels(cls, s), title = c => (cls.concepts || []).find(k => k.id === c)?.title || c;
      const ok = run.ids.filter(i => s.answers[i]?.correct && !s.answers[i].hint).length;
      const touched = [...new Set(run.ids.map(i => findItem(cls, i)?.concept).filter(Boolean))];
      const moves = touched.map(c => { const a = run.start[c] ?? 1, z = levelOf(cls, s, c, T); return { c, a, z }; });
      const up = moves.filter(x => x.z > x.a).length;
      sage.text = `${ok} de ${run.ids.length} sin ayuda.${up ? ` Subiste de nivel en ${up} tema${up > 1 ? 's' : ''}.` : ' Ningún nivel subió esta vez: es normal, el nivel busca justo el punto donde cuesta.'} ¿Otra ronda?`;
      sage.mood = ok >= run.ids.length * 0.7 ? 'proud' : 'calm';
      sage.actions = `<button class="cr-btn cr-primary" data-cr="train" data-focus="${esc(run.focus)}">Otra ronda ▸</button><button class="cr-btn" data-cr="train-pick">Elegir otro tema</button><button class="cr-btn" data-cr="exit">Salir de la torre</button>`;
      center = `<div class="cr-parchment cr-summary-card"><p class="cr-eyebrow">Entrenar · resultado</p>
        <ul class="cr-round">${run.ids.map(i => { const it = findItem(cls, i), r = s.answers[i];
          return `<li class="${r?.correct ? 'is-right' : 'is-wrong'}">${r?.correct ? '✓' : '✗'} <b>${esc(title(it?.concept))}</b> <span class="cr-level is-l${it?.gen?.level}">${esc(LEVELS[(it?.gen?.level || 1) - 1])}</span>${r?.hint ? ' <small>con pista</small>' : ''}</li>`; }).join('')}</ul>
        <p class="cr-eyebrow">Tu nivel</p><ul class="cr-round">${moves.map(x => `<li class="${x.z > x.a ? 'is-right' : x.z < x.a ? 'is-wrong' : ''}"><b>${esc(title(x.c))}</b> ${esc(LEVELS[x.a - 1])} → <b>${esc(LEVELS[x.z - 1])}</b> ${x.z > x.a ? '▲' : x.z < x.a ? '▼' : '='}</li>`).join('')}</ul>
        <div class="cr-goal-close"><p class="cr-eyebrow">Tus hojas</p>${leafChips(cls, api, cls.id, c => touched.includes(c.id))}</div>
        <p class="cr-note">Estos ejercicios se arman con los datos de la cátedra (tablas de pKa, reactivos y reglas). El <b>nivel PEP</b> imita las preguntas 3, 4 y 6.</p></div>`;
      return { sage, center };
    }
    if (b.kind === 'simstart') {
      const hist = (s.simHistory || []).slice(-3);
      const pool = [...new Set((cls.goal?.questions || []).flatMap(q => q.missions))].map(id => missionById(cls, id)).filter(Boolean);
      const full = pool.reduce((a, m) => a + (m.stages.transfer || []).length, 0);
      if (s.sim) {
        sage.text = s.sim.ended ? 'Este simulacro ya terminó. Mira tu corrección o empieza otro.' : `Simulacro ${s.sim.n} en curso. El reloj sigue corriendo.`;
        sage.actions = cont(s.sim.ended ? 'Ver mi corrección ▸' : 'Seguir ▸');
        center = `<div class="cr-parchment"><p class="cr-eyebrow">Simulacro PEP ${s.sim.n}</p><p>${s.sim.ids.length} preguntas · ${s.sim.minutes} minutos.</p></div>`;
        return { sage, center };
      }
      sage.text = 'Como en la PEP: con reloj, **sin pistas, sin formulario y sin saber si acertaste** hasta el final. Después te muestro cómo te corregiría el profe.';
      sage.actions = `<button class="cr-btn cr-primary" data-cr="sim-start" data-size="mini">Mini · ${pool.length} preguntas · 12 min</button><button class="cr-btn" data-cr="sim-start" data-size="full">Completo · ${full} preguntas · 40 min</button>`;
      center = `<div class="cr-parchment cr-sim-start"><p class="cr-eyebrow">Simulacro PEP · Aminas</p><h3>Las preguntas 3, 4 y 6 de la prueba</h3>
        <p>Salen de los encargos estilo prueba de las misiones que dan puntos. Las escritas puedes hacerlas <b>en papel</b> y autocorregirte con la pauta.</p>
        ${hist.length ? `<p class="cr-eyebrow">Tus últimos simulacros</p><ul class="cr-round">${hist.map(h => `<li>${esc(h.at.slice(0, 10))} · <b>${pts(h.got)} de ${pts(h.max)} pts</b> · nota estimada ${String(h.nota).replace('.', ',')}</li>`).join('')}</ul>` : ''}</div>`;
      return { sage, center };
    }
    if (b.kind === 'simresult') {
      const sc = simScore(cls, s), planBtn = s.planDay === today() ? '<button class="cr-btn" data-cr="path" data-path="tiempo">Volver a mi plan</button>' : '';
      const nota = String(sc.nota.toFixed(1)).replace('.', ',');
      sage.text = sc.pct >= 0.6 ? `**${pts(sc.got)} de ${pts(sc.max)} puntos.** Vas bien: revisa abajo qué te habría descontado el profe.` : `**${pts(sc.got)} de ${pts(sc.max)} puntos.** Abajo está cada pregunta con la pauta: así sabes exactamente qué estudiar.`;
      sage.mood = sc.pct >= 0.6 ? 'proud' : 'calm';
      sage.actions = `<button class="cr-btn cr-primary" data-cr="sim-new">Otro simulacro</button>${planBtn}<button class="cr-btn" data-cr="exit">Salir de la torre</button>`;
      const row = id => {
        const it = findItem(cls, id), rec = s.answers[id], sco = itemScore(it, rec);
        const worth = sc.rows.filter(r => r.ids.includes(id)).reduce((a, r) => a + r.points / r.ids.length, 0); // un caso puede servir a más de una pregunta
        const rub = it.type === 'write' ? `<ul class="cr-rub-list">${it.rubric.map((r, i) => `<li class="${rec?.value?.checks?.[i] ? 'is-right' : 'is-wrong'}">${rec?.value?.checks?.[i] ? '✓' : '✗'} ${md(r)}</li>`).join('')}</ul>` : '';
        return `<li class="cr-sim-row ${!rec ? 'is-empty' : sco >= 1 ? 'is-right' : sco > 0 ? 'is-part' : 'is-wrong'}"><p class="cr-q">${md(it.prompt)}</p>
          <p><b>Tu respuesta:</b> ${rec ? md(answerText(it, rec)) : '<i>sin responder (se acabó el tiempo)</i>'} · <b>${pts(worth * sco)} de ${pts(worth)} pts</b></p>
          <p class="cr-note"><b>Pauta:</b> ${md(it.explain || '')}</p>${rub}</li>`;
      };
      center = `<div class="cr-parchment cr-sim-result"><p class="cr-eyebrow">Simulacro PEP ${s.sim.n} · resultado</p>
        <div class="cr-sim-score"><b>${pts(sc.got)}</b><span>de ${pts(sc.max)} pts de Aminas</span><em>Nota estimada ${nota}</em></div>
        <p class="cr-idea-note">Nota estimada con 60 % de exigencia, solo para la parte de Aminas: es una referencia, no tu nota real.</p>
        <table class="cr-vars"><thead><tr><th>Pregunta de la PEP</th><th>Puntaje</th></tr></thead><tbody>${sc.rows.filter(r => r.max).map(r => `<tr><td>${esc(r.id)} · ${esc(r.label)}</td><td><b>${pts(r.got)}</b> de ${pts(r.max)}</td></tr>`).join('')}</tbody></table>
        <p class="cr-eyebrow">Cómo te corrige el profe</p><ol class="cr-sim-rows">${s.sim.ids.map(row).join('')}</ol>
        <p class="cr-note">Los aciertos de este simulacro también cuentan en tu <b>Camino al 7</b> y en tus hojas.</p></div>`;
      return { sage, center };
    }
    if (b.kind === 'say') {
      sage.text = b.text; sage.mood = b.mood || 'calm'; sage.actions = cont();
      // El sabio recuerda: un error típico de esta misión de otro día.
      const memo = b.intro && b.m && (() => { const E = EV(); if (!E) return null;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const recs = E.storeFor(api.getState(), cls.id).records.filter(r => r.misconception && r.missionId === b.m.id && new Date(r.at) < today);
        return cls.misconceptions[recs[recs.length - 1]?.misconception] || null; })();
      if (memo) sage.text += ` La última vez caíste en esto: **${memo.label}**. Hoy fíjate bien en eso.`;
      return { sage, center };
    }
    if (b.kind === 'offer') {
      sage.text = '¡Acertaste todo el reto! Puedes saltarte la lección e ir directo a practicar, o escucharla igual.';
      sage.mood = 'proud';
      sage.actions = `<button class="cr-btn cr-primary" data-cr="offer" data-skip="1">Saltar a la práctica ▸</button><button class="cr-btn" data-cr="offer" data-skip="0">Quiero la lección</button>`;
      return { sage, center };
    }
    if (b.kind === 'hook') {
      const h = b.m.stages.hook;
      sage.text = h.sage || 'Antes de empezar, un caso real de tu carrera.'; sage.mood = 'proud'; sage.actions = cont('¡Vamos!');
      center = `<div class="cr-parchment cr-hook"><p class="cr-eyebrow">Caso de farmacia</p><h3>${esc(h.title)}</h3>
        ${h.scene ? `<div class="cr-figure">${window.NexoMolEditor?.sceneMarkup(h, { label: h.title }) || ''}</div>` : ''}<p>${md(h.text)}</p></div>`;
      return { sage, center };
    }
    if (b.kind === 'lesson' && b.block.kind === 'rule') {
      const r = b.block;
      sage.text = `**${r.title}** quedó guardada en tu grimorio, en el recetario. Úsala como lista de chequeo en la prueba.`; sage.mood = 'proud'; sage.actions = cont();
      center = `<div class="cr-parchment cr-recipe-card cr-rule-card"><p class="cr-eyebrow">Regla guardada en tu grimorio</p><h3>${esc(r.title)}</h3>
        <ol class="cr-rule">${r.steps.map(t => `<li>${md(t)}</li>`).join('')}</ol>${r.note ? `<p class="cr-note">${md(r.note)}</p>` : ''}</div>`;
      return { sage, center };
    }
    if (b.kind === 'lesson' && b.block.kind === 'recipe') {
      const r = b.block;
      sage.text = `**${r.title}** quedó guardada en tu grimorio. Volverá a probarte mañana: si la recuerdas, será tuya.`; sage.mood = 'proud'; sage.actions = cont();
      center = `<div class="cr-parchment cr-recipe-card"><p class="cr-eyebrow">Receta guardada en tu grimorio</p><h3>${esc(r.title)}</h3>
        <dl class="cr-recipe">${[['Ingrediente base', r.base], ['Ingredientes mágicos', r.reagents], ['Condición', r.condition], ['Resultado', r.result]].filter(([, v]) => v)
          .map(([k, v]) => `<div><dt>${k}</dt><dd>${md(v)}</dd></div>`).join('')}</dl>${r.note ? `<p class="cr-note">${md(r.note)}</p>` : ''}</div>`;
      return { sage, center };
    }
    if (b.kind === 'lesson' && b.block.frames) {
      const blk = b.block, mw = (s.work[`mech:${blk.id}`] ||= { i: 0 }), f = blk.frames[Math.min(mw.i, blk.frames.length - 1)];
      const deepKey = `deep-${blk.id}`, deep = s.revealed[deepKey];
      sage.text = `**${blk.title}.** ${blk.body}`;
      sage.actions = `${blk.deeper ? `<button class="cr-btn" data-cr="deeper" data-key="${deepKey}" aria-expanded="${Boolean(deep)}">${deep ? 'Ocultar la explicación simple' : 'Explícame más simple'}</button>` : ''}${cont('Entendido')}`;
      center = `<div class="cr-parchment cr-mech"><p class="cr-eyebrow">Mecanismo · paso ${mw.i + 1} de ${blk.frames.length}</p>
        <div class="cr-mech-stage">${window.NexoMolEditor?.sceneMarkup(f, { arrows: f.arrows || [], label: f.caption }) || ''}</div>
        <p class="cr-mech-caption" aria-live="polite">${md(f.caption)}</p>
        <div class="cr-mech-controls" role="group" aria-label="Controles del mecanismo">
          <button class="cr-btn cr-small" data-cr="mech" data-dir="-1" ${mw.i > 0 ? '' : 'disabled'}>◂ Atrás</button>
          <button class="cr-btn cr-small" data-cr="mech" data-dir="play" aria-pressed="${Boolean(mw.playing)}">${mw.playing ? '❚❚ Pausa' : '▶ Reproducir'}</button>
          <button class="cr-btn cr-small cr-primary" data-cr="mech" data-dir="1" ${mw.i < blk.frames.length - 1 ? '' : 'disabled'}>Siguiente paso ▸</button></div>
        <div class="cr-mech-dots" aria-hidden="true">${blk.frames.map((_, i) => `<i class="${i === mw.i ? 'is-on' : ''}"></i>`).join('')}</div>
        ${deep ? `<div class="cr-deeper"><p class="cr-eyebrow">Más simple, paso a paso</p><p>${md(blk.deeper)}</p></div>` : ''}${moreHelp(cls, s, blk, deep)}</div>`;
      if (blk.slide) center = `<div class="cr-lesson cr-lesson-mech">${center}${projection(cls, blk.slide)}</div>`;
      return { sage, center };
    }
    if (b.kind === 'lesson') {
      const blk = b.block, deepKey = `deep-${blk.id}`, deep = s.revealed[deepKey];
      sage.text = `**${blk.title}.** ${blk.body}`;
      sage.actions = `${blk.deeper ? `<button class="cr-btn" data-cr="deeper" data-key="${deepKey}" aria-expanded="${Boolean(deep)}">${deep ? 'Ocultar la explicación simple' : 'Explícame más simple'}</button>` : ''}${cont('Entendido')}`;
      const parchment = blk.svg || blk.rows || blk.note || deep ? `<div class="cr-parchment">
        <p class="cr-eyebrow">${b.zero ? 'Desde cero' : 'Lección'} · ${esc(blk.title.replace(/^Desde cero: /, ''))}</p>
        ${blk.svg ? `<div class="cr-figure">${blk.svg}</div>` : ''}
        ${blk.rows ? `<dl class="cr-rows">${blk.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        ${blk.note ? `<p class="cr-note">${md(blk.note)}</p>` : ''}
        ${deep ? `<div class="cr-deeper"><p class="cr-eyebrow">Más simple, paso a paso</p><p>${md(blk.deeper)}</p></div>` : ''}${moreHelp(cls, s, blk, deep)}</div>` : '';
      center = `<div class="cr-lesson">${blk.slide ? projection(cls, blk.slide) : ''}${parchment || moreHelp(cls, s, blk, deep)}</div>`;
      // Sin diapositiva (clase base): la explicación va escrita en el pergamino del centro y el sabio solo la presenta.
      if (!blk.slide && !blk.svg && !blk.rows) {
        sage.text = `**${blk.title}.** Léelo con calma en el pergamino. Si algo no queda claro, pídeme la explicación simple.`;
        center = `<div class="cr-parchment cr-base-card"><p class="cr-eyebrow">${b.m?.concept ? 'Repaso desde cero' : b.zero ? 'Desde cero' : 'Lección'}</p><h3>${esc(blk.title.replace(/^Desde cero: /, ''))}</h3><p>${md(blk.body)}</p>
          ${blk.note ? `<p class="cr-note">${md(blk.note)}</p>` : ''}${deep ? `<div class="cr-deeper"><p class="cr-eyebrow">Más simple, paso a paso</p><p>${md(blk.deeper)}</p></div>` : ''}${moreHelp(cls, s, blk, deep)}</div>`;
      }
      return { sage, center };
    }
    if (b.kind === 'step') {
      const w = b.worked || b.m.stages.worked, key = `${b.m.id}-w${b.i}`, hidden = b.step.ask && !s.revealed[key];
      sage.text = hidden ? `Antes de mirar, piensa: ${b.step.ask}` : `Paso ${b.i + 1}. ${b.step.text}`;
      sage.actions = hidden ? `<button class="cr-btn cr-primary" data-cr="reveal" data-key="${key}">Ya lo pensé, muéstrame ▸</button>` : cont();
      center = `<div class="cr-parchment cr-experiment"><p class="cr-eyebrow">Ejemplo resuelto</p><p class="cr-exp-prompt">${md(w.prompt)}</p>
        <ol class="cr-worked">${w.steps.map((st, i) => {
          if (i > b.i) return '';
          if (i === b.i && hidden) return `<li class="is-ask"><span>${i + 1}</span><p>¿…?</p></li>`;
          return `<li class="${i === b.i ? 'is-now' : ''}"><span>${i + 1}</span><p>${md(st.text)}</p></li>`;
        }).join('')}</ol></div>`;
      return { sage, center };
    }
    if (b.kind === 'question') {
      const item = b.item, record = s.answers[item.id], hint = s.hints[item.id];
      const pre = b.stage === 'pretest', blind = b.stage === 'simulacro', noConf = pre || blind;
      const label = item.teach ? 'Enséñale a tu compañero' : { diagnostic: 'Reto del sabio', pretest: 'Antes de enseñarte · adivina', practice: 'Prueba del aprendiz', challenge: 'Desafío', transfer: 'Encargo final', review: 'Ronda del alba', simulacro: 'Simulacro PEP', placement: 'Diagnóstico', fix: 'Caso corto para corregir', detour: 'Repaso de la base', train: 'Entrenar' }[b.stage];
      const lvTag = item.gen ? ` · <span class="cr-level is-l${item.gen.level}">${esc(LEVELS[item.gen.level - 1])}</span>` : '';
      if (!record) {
        sage.text = item.teach ? 'Tu compañero se enredó con algo. ¿Se lo explicas tú? Explicar es la mejor forma de aprender.'
          : { diagnostic: 'Responde con lo que sabes.', pretest: 'Adivina sin miedo: esto no cuenta. Solo despierta la curiosidad.', practice: 'Tu turno.', challenge: 'Este es más difícil. Confío en ti.', transfer: 'Un caso nuevo. Piensa como en la prueba.',
            review: 'Sin mirar apuntes: ¿lo recuerdas?', simulacro: 'Como en la PEP: sin pistas ni formulario.',
            placement: 'Responde con lo que sabes. Si no sabes, marca poca confianza y elige la que te parezca.', fix: 'Un caso corto para corregir esa idea ahora mismo.', detour: 'Un ejercicio fácil de la base. Sin apuro.',
            train: `Nivel **${LEVELS[(item.gen?.level || 1) - 1]}**. Si te trabas, tu compañero tiene una pista (pero no cuenta para subir de nivel).` }[b.stage];
      } else if (blind) {
        sage.text = 'Respuesta guardada. Las correcciones las verás al final, como en una prueba.'; sage.mood = 'calm'; sage.actions = cont('Siguiente ▸');
      } else if (pre) {
        sage.text = record.correct ? `¡Buena intuición! ${item.explain} Ahora verás por qué.` : 'No era esa, y está perfecto: ahora lo vas a descubrir. Fíjate bien en la explicación.';
        sage.mood = record.correct ? 'proud' : 'calm'; sage.actions = cont('A la lección ▸');
      } else if (record.correct) {
        sage.text = `${hint ? 'Bien, con una pista.' : record.kind === 'fragil' ? 'Bien, aunque dudabas.' : '¡Exacto, sin ayuda!'} ${item.explain}${b.stage === 'train' ? trainNote(cls, s, item) : ''}`; sage.mood = 'proud'; sage.actions = cont();
      } else {
        const mc = mcOf(cls, item, record);
        sage.text = mc ? `**${mc.label}.** ${mc.why}` : `No del todo. ${window.NexoMolEditor?.feedback(item, record) || item.wrong || (b.stage === 'train' ? '' : 'Lo revisaremos juntos en el rescate.')}`;
        if (b.stage === 'train') sage.text += ` ${item.explain}${trainNote(cls, s, item)}`;
        sage.mood = 'concerned'; sage.actions = cont();
      }
      center = `<article class="cr-card ${blind ? 'is-blind' : record ? (record.correct ? 'is-right' : 'is-wrong') : ''}">
        <p class="cr-eyebrow">${esc(label)}${lvTag} · ${b.n} de ${b.of}</p><p class="cr-q">${md(item.prompt)}</p>
        ${hint && !record ? `<p class="cr-hinttext"><b>Pista de tu compañero:</b> ${md(item.hint)}</p>` : ''}
        ${b.stage === 'practice' && !record && !hint && s.tips.conf && !s.tips.hint ? tipMarkup('hint', '¿Te trabaste? <b>Toca a tu compañero</b> (abajo, a la derecha) y te dará una pista.') : ''}
        ${item.paper && !record ? '<p class="cr-paper">✎ Si prefieres, resuélvelo en papel como en la prueba y después escribe aquí lo esencial para autocorregirte con la pauta.</p>' : ''}
        ${record || noConf ? '' : confidenceMarkup(item, s)}
        <fieldset class="cr-gate" ${!noConf && !record && s.conf[item.id] === undefined ? 'disabled aria-describedby="gate-note"' : ''}>
          ${!noConf && !record && s.conf[item.id] === undefined ? '<p class="cr-gate-note" id="gate-note">Primero marca tu confianza en la barra.</p>' : ''}
          ${activityMarkup(cls, s, item)}</fieldset>
        ${noConf ? '' : confidenceResult(cls, item, record, s.path === 'prueba' || s.path === 'simulacro')}
        ${!noConf && showWhy(record) ? whyOthers(cls, item) : ''}
        ${item.slide && !blind ? `<button class="cr-cite" data-cr="slides" data-slide="${esc(item.slide)}">Ver diapositiva ${esc(item.slide)}</button>` : ''}</article>`;
      return { sage, center };
    }
    if (b.kind === 'rescue') {
      const item = b.item, record = s.answers[item.id], retry = s.retries[item.id];
      const mc = mcOf(cls, item, record);
      const prereqMission = mc?.prereq && missionById(cls, mc.prereq.mission);
      const block = prereqMission && blocksOf(prereqMission).find(x => x.id === mc.prereq.block);
      const slideN = block?.slide || item.slide;
      if (!retry) {
        sage.text = `Respondiste «${answerText(item, record)}». ${mc ? mc.why : (item.wrong || 'Miremos de nuevo, con calma.')} Mira la diapositiva y vuelve a intentarlo.`;
        sage.mood = 'calm';
      } else {
        sage.text = retry.correct ? '¡Corregido! Así se aprende de un error.' : 'Todavía no. Vuelve a esta idea otro día: la repasaremos.';
        sage.mood = retry.correct ? 'proud' : 'concerned'; sage.actions = cont();
      }
      center = `<div class="cr-lesson">${slideN ? projection(cls, slideN) : ''}
        <article class="cr-card"><p class="cr-eyebrow">Rescate${mc?.prereq ? ` · repasa: ${esc(mc.prereq.title)}` : ''}</p><p class="cr-q">${md(item.prompt)}</p>${activityMarkup(cls, s, item, { retry: true })}${retry ? whyOthers(cls, item) : ''}</article></div>`;
      return { sage, center };
    }
    // Cierre
    const scope = allItems(cls, s.path === 'misiones' ? s.mission : null).filter(({ item }) => s.answers[item.id]);
    const solo = scope.filter(({ item }) => s.answers[item.id].correct && !s.hints[item.id]).length;
    const withHint = scope.filter(({ item }) => s.answers[item.id].correct && s.hints[item.id]).length;
    const wrong = scope.filter(({ item }) => !s.answers[item.id].correct);
    const fixed = wrong.filter(({ item }) => s.retries[item.id]?.correct).length;
    const next = s.path === 'misiones' ? cls.missions[cls.missions.findIndex(m => m.id === s.mission) + 1] : null;
    const nextBase = s.path === 'base' ? cls.base[cls.base.findIndex(m => m.id === s.mission) + 1] : null;
    sage.text = 'Buen trabajo, aprendiz. Lo que acertaste hoy muestra que lo entendiste. Para que sea tuyo de verdad, vuelve en uno o dos días y demuéstralo de nuevo sin ayuda.';
    sage.mood = 'proud';
    const more = s.path === 'misiones' && GEN(cls) && genConcepts(cls).some(c => (cls.concepts || []).find(k => k.id === c)?.mission === s.mission)
      ? `<button class="cr-btn" data-cr="train" data-focus="m:${esc(s.mission)}">Practicar más (infinito) ▸</button>` : '';
    sage.actions = `${s.planDay === today() ? '<button class="cr-btn cr-primary" data-cr="path" data-path="tiempo">Volver a mi plan</button>' : ''}${more}${next ? `<button class="cr-btn ${s.planDay === today() ? '' : 'cr-primary'}" data-cr="mission" data-mission="${next.id}">Siguiente misión ▸</button>` : ''}${s.path === 'base' ? `${nextBase ? `<button class="cr-btn cr-primary" data-cr="base" data-mission="${nextBase.id}">Siguiente repaso ▸</button>` : ''}<button class="cr-btn" data-cr="path" data-path="misiones">Ir a las misiones</button>` : ''}<button class="cr-btn" data-cr="restart">Volver a empezar</button><button class="cr-btn" data-cr="exit">Salir de la torre</button>`;
    center = `<div class="cr-parchment cr-summary-card"><p class="cr-eyebrow">Lo que demostraste</p>
      <dl class="cr-summary"><div><dt>Sin ayuda</dt><dd>${solo}</dd></div><div><dt>Con pista</dt><dd>${withHint}</dd></div><div><dt>Errores corregidos</dt><dd>${fixed}/${wrong.length}</dd></div></dl>
      ${(() => { const goal = goalOf(cls, s); if (!goal) return '';
        const here = s.path === 'misiones' ? goal.worth(s.mission) : goal.max, got = s.path === 'misiones' ? goal.won(s.mission) : goal.earned;
        return `<div class="cr-goal-close"><p class="cr-eyebrow">Camino al 7</p>${goalMeter(goal)}
          <p>${here ? `${s.path === 'misiones' ? 'Esta misión' : 'Esta clase'} vale <b>${pts(here)} pts</b> de la PEP y demostraste <b>${pts(got)}</b>.` : 'Esta misión es <b>base</b>: no da puntos directos, pero sin ella no se puede responder lo que sí los da.'}
          En total llevas <b>${pts(goal.earned)} de ${goal.total}</b>.</p><button class="cr-link" data-cr="goal">Ver qué me falta para el 7</button></div>`; })()}
      ${willowMarkup(cls, api, s)}
      <div class="cr-goal-close"><p class="cr-eyebrow">Tus hojas${s.path === 'misiones' || s.path === 'base' ? ' en esta misión' : ''}</p>
        ${leafChips(cls, api, cls.id, c => s.path === 'base' ? c.id === missionById(cls, s.mission)?.concept : s.path !== 'misiones' ? !c.root : c.mission === s.mission)}${calibrationLine(cls, api, cls.id)}
        <p class="cr-note">Las hojas se ponen <b>verdes</b> solo cuando produces la respuesta tú solo (escalón 5), por ejemplo al escribirla. Elegir entre alternativas deja un <b>brote</b>.</p></div>
      <p class="cr-note">Todavía no es dominio: cuenta como <b>retenido</b> cuando lo recuerdas sin ayuda 24 horas o más después.</p></div>`;
    return { sage, center };
  }

  /* Más ayuda: si la explicación simple no alcanzó → mini clase; si quieres más → a profundidad. */
  function moreHelp(cls, s, blk, simpleShown) {
    const c = blk?.concept, mini = c && cls.mini?.[c], deepC = c && cls.deep?.[c];
    if (!mini && !deepC) return '';
    return `<div class="cr-more">${mini && simpleShown ? `<button class="cr-btn cr-small" data-cr="mini" data-concept="${esc(c)}">¿Todavía no? Mini clase de 2 min</button>` : ''}
      ${deepC ? `<button class="cr-btn cr-small cr-ghost-dark" data-cr="deepclass" data-concept="${esc(c)}">Ver a profundidad ▸</button>` : ''}</div>`;
  }
  function miniPanel(cls, s) {
    const c = s.miniC, m = cls.mini[c], title = (cls.concepts || []).find(k => k.id === c)?.title || c;
    const step = s.miniStep || 0, last = m.steps.length + 1; // 0 idea · 1..n pasos · n+1 pregunta
    const dots = `<div class="cr-mech-dots" aria-hidden="true">${[...Array(last + 1)].map((_, i) => `<i class="${i === step ? 'is-on' : ''}"></i>`).join('')}</div>`;
    let inner = '';
    if (step === 0) inner = `<p class="cr-eyebrow">La idea</p><p class="cr-mini-big">${md(m.idea)}</p>`;
    else if (step <= m.steps.length) inner = `<p class="cr-eyebrow">Paso ${step} de ${m.steps.length}</p><ol class="cr-mini-steps">${m.steps.slice(0, step).map((t, i) => `<li class="${i === step - 1 ? 'is-now' : ''}">${md(t)}</li>`).join('')}</ol>`;
    else {
      const ans = s.miniAns?.[c];
      inner = `<p class="cr-eyebrow">¿Lo pillaste? (no cuenta para nada)</p><p class="cr-q">${md(m.check.prompt)}</p><ol class="cr-options">${m.check.options.map((o, i) =>
        `<li><button class="cr-option ${ans === undefined ? '' : i === ans ? (o.correct ? 'is-right' : 'is-wrong') : o.correct ? 'is-right' : 'is-muted'}" data-cr="mini-ans" data-i="${i}" ${ans === undefined ? '' : 'disabled'}><span class="cr-letter">${String.fromCharCode(65 + i)}</span><span>${esc(o.text)}</span></button></li>`).join('')}</ol>
        ${ans === undefined ? '' : `<p class="cr-conf-route">${m.check.options[ans].correct ? `<b>¡Eso!</b> ${md(m.check.explain)}` : `${md(m.check.options[ans].note || '')} ${md(m.check.explain)} Si quieres, repasa los pasos o mira la versión a profundidad.`}</p>`}`;
    }
    const nav = `<div class="cr-row cr-mini-nav"><button class="cr-btn cr-small" data-cr="mini-step" data-dir="-1" ${step > 0 ? '' : 'disabled'}>◂ Atrás</button>
      ${step < last ? `<button class="cr-btn cr-small cr-primary" data-cr="mini-step" data-dir="1">Siguiente ▸</button>` : `<button class="cr-btn cr-small cr-primary" data-cr="panel-close">Volver a la clase ▸</button>`}</div>`;
    return { title: `Mini clase · ${title}`, body: `<div class="cr-mini">${inner}${dots}${nav}</div>` };
  }
  function deepPanel(cls, s) {
    const c = s.deepC, d = cls.deep[c], ans = s.deepAns?.[c];
    const src = x => x.slide ? `<button class="cr-link" data-cr="slides" data-slide="${x.slide}">${esc(x.label)}</button>` : `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`;
    return { title: `A profundidad · ${d.title}`, body: `<div class="cr-deepclass">${d.sections.map(([h, t]) => `<section><h3>${esc(h)}</h3><p>${md(t)}</p></section>`).join('')}
      <section class="cr-deep-challenge"><p class="cr-eyebrow">Desafío a fondo (no cuenta para tu nota)</p><p class="cr-q">${md(d.challenge.prompt)}</p>
        <ol class="cr-options">${d.challenge.options.map((o, i) => `<li><button class="cr-option ${ans === undefined ? '' : i === ans ? (o.correct ? 'is-right' : 'is-wrong') : o.correct ? 'is-right' : 'is-muted'}" data-cr="deep-ans" data-i="${i}" ${ans === undefined ? '' : 'disabled'}><span class="cr-letter">${String.fromCharCode(65 + i)}</span><span>${esc(o.text)}</span></button></li>`).join('')}</ol>
        ${ans === undefined ? '' : `<p class="cr-conf-route">${d.challenge.options[ans].correct ? '<b>¡Exacto!</b> ' : `${md(d.challenge.options[ans].note || '')} `}${md(d.challenge.explain)}</p>`}</section>
      <p class="cr-fsrc"><b>Fuentes:</b> ${d.sources.map(src).join(' · ')}</p></div>` };
  }

  /* ───────── El grimorio: glosario, formulario y recetario (docs/etapa-5-grimorio/SPEC.md) ───────── */
  const grimoireTabs = s => `<div class="cr-tabs" role="tablist" aria-label="Secciones del grimorio">${[['glossary', 'Glosario'], ['formulas', 'Formulario'], ['recipes', 'Recetario'], ['lab', 'Laboratorio'], ['beasts', 'Bestiario'], ['night', 'Noche antes']]
    .map(([id, name]) => `<button class="cr-tab ${(s.gtab || 'glossary') === id ? 'is-on' : ''}" role="tab" aria-selected="${(s.gtab || 'glossary') === id}" data-cr="grimoire" data-tab="${id}">${name}</button>`).join('')}</div>`;
  const sup = html => html.replace(/\^\(([^)]*)\)/g, '<sup>$1</sup>').replace(/\^([^\s,()<]+)/g, '<sup>$1</sup>');
  function formulasMarkup(cls, s) {
    if (s.path === 'prueba' || s.path === 'simulacro') return '<p class="cr-note">El formulario está <b>cerrado</b> en este camino, como en la PEP. Ábrelo cuando estudies en Misiones o Expedición.</p>';
    const cards = cls.formulas || [];
    return `<p class="cr-act-help">Toca una fórmula para abrirla. Cada una trae un ejemplo resuelto y sus fuentes${cards.some(f => f.calc) ? '; algunas, una calculadora para probar' : ''}.</p>
      <div class="cr-formulas">${cards.map(f => {
        const open = s.card === f.id, deepKey = `fdeep-${f.id}`, deep = s.revealed[deepKey];
        const vals = s.work[`calc:${f.id}`] ||= Object.fromEntries((f.calc?.inputs || []).map(i => [i.id, i.value]));
        return `<article class="cr-fcard ${open ? 'is-open' : ''}" id="card-${esc(f.id)}">
          <button class="cr-fhead" data-cr="fcard" data-card="${esc(f.id)}" aria-expanded="${open}"><b>${esc(f.title)}</b><span class="cr-formula-big">${sup(esc(f.formula))}</span></button>
          ${open ? `<div class="cr-fbody">
            <table class="cr-vars"><thead><tr><th>Símbolo</th><th>Qué es</th><th>Unidad</th></tr></thead><tbody>${f.vars.map(([k, v, u]) => `<tr><td><b>${esc(k)}</b></td><td>${md(v)}</td><td>${esc(u)}</td></tr>`).join('')}</tbody></table>
            <dl class="cr-fdl"><div><dt>Para qué sirve</dt><dd>${md(f.what)}</dd></div><div><dt>Cuándo se usa</dt><dd>${md(f.when)}</dd></div><div><dt>Ejemplo resuelto</dt><dd>${sup(md(f.example))}</dd></div></dl>
            ${f.calc ? `<div class="cr-calc" data-calc="${esc(f.id)}"><p class="cr-eyebrow">Pruébalo</p><div class="cr-calc-in">${f.calc.inputs.map(i => `<label>${esc(i.label)}<input type="number" inputmode="decimal" step="${i.step}" value="${esc(vals[i.id])}" data-cr-calc="${esc(f.id)}" data-key="${esc(i.id)}"></label>`).join('')}</div>
              <p class="cr-calc-out" aria-live="polite" data-calc-out>${md(f.calc.run(vals))}</p></div>` : ''}
            <button class="cr-btn cr-small" data-cr="deeper" data-key="${deepKey}" aria-expanded="${Boolean(deep)}">${deep ? 'Ocultar' : 'A fondo: por qué funciona'}</button>
            ${deep ? `<div class="cr-deeper"><p>${md(f.deeper)}</p></div>` : ''}${moreHelp(cls, s, { concept: f.concepts[0] }, true)}
            <p class="cr-fsrc"><b>Fuentes:</b> ${f.sources.map(x => x.slide ? `<button class="cr-link" data-cr="slides" data-slide="${x.slide}">${esc(x.label)}</button>` : `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join(' · ')}</p>
          </div>` : ''}</article>`;
      }).join('')}</div>`;
  }
  // Estado de una receta según tu evidencia: sin ver → vista → aprendida → dominada.

  /* ───────── Laboratorio libre, bestiario y hoja de la noche anterior (etapa 8) ───────── */
  function labMarkup(cls, s) {
    const L = GEN(cls)?.lab;
    if (!L) return '<p class="cr-note">Esta clase todavía no tiene laboratorio.</p>';
    if (s.path === 'prueba' || s.path === 'simulacro') return '<p class="cr-note">El laboratorio está <b>cerrado</b> durante la prueba. Ábrelo cuando estudies.</p>';
    const sub = id => L.substances.find(x => x.id === id), found = Object.keys(s.labFound || {}).length;
    const head = `<p class="cr-act-help">Mezcla sin miedo: aquí no hay nota. Elige una sustancia, agrega reactivos y el sabio te dice qué pasa y por qué.
      <b>Descubriste ${found} de ${L.total} reacciones.</b></p>`;
    if (!s.lab?.at) return `${head}<p class="cr-eyebrow">¿Con qué empiezas?</p><div class="cr-lab-starts">${L.starts.map(id => `<button class="cr-chip" data-cr="lab-start" data-sub="${esc(id)}"><b>${esc(sub(id).name)}</b><small>${esc(sub(id).formula)}</small></button>`).join('')}</div>`;
    const cur = sub(s.lab.at), last = s.lab.trail[s.lab.trail.length - 1], rg = id => L.reagents.find(x => x.id === id)?.label || id;
    return `${head}
      <div class="cr-lab">
        <div class="cr-lab-flask ${last ? (last.to ? 'is-ok' : 'is-no') : ''}"><p class="cr-eyebrow">En tu matraz</p><b>${esc(cur.name)}</b><span class="cr-lab-formula">${esc(cur.formula)}</span></div>
        ${last ? `<p class="cr-lab-msg ${last.to ? 'is-ok' : last.ok ? 'is-mid' : 'is-no'}">${last.to ? '✓' : last.ok ? '·' : '✗'} <b>${esc(rg(last.reagent))}:</b> ${md(last.why)}</p>` : '<p class="cr-lab-msg">Agrega un reactivo.</p>'}
        ${s.lab.trail.some(t => t.to) ? `<p class="cr-lab-trail">${[s.lab.trail.find(t => t.to)?.from, ...s.lab.trail.filter(t => t.to).map(t => `<i>${esc(rg(t.reagent))}</i> → ${esc(sub(t.to).name)}`)].map((x, i) => i ? x : esc(sub(x).name)).join(' → ')}</p>` : ''}
        <p class="cr-eyebrow">Reactivos</p>
        <div class="cr-lab-reagents">${L.reagents.map(r => `<button class="cr-chip" data-cr="lab-add" data-reagent="${esc(r.id)}">${esc(r.label)}</button>`).join('')}</div>
        <div class="cr-row">${s.lab.trail.length ? '<button class="cr-btn cr-small" data-cr="lab-undo">↶ Deshacer</button>' : ''}<button class="cr-btn cr-small" data-cr="lab-reset">Otra sustancia</button></div>
      </div>`;
  }
  /* Bestiario de errores: cada error típico en que caíste es una criatura. Se doma acertando su concepto sin ayuda
     en 3 días distintos después de la última vez que caíste (repaso espaciado: Cepeda y cols., 2006). */
  function bestiary(cls, records) {
    const map = {};
    for (const r of records || []) {
      if (!r.misconception || !cls.misconceptions?.[r.misconception] || r.retry) continue;
      const b = (map[r.misconception] ||= { key: r.misconception, mc: cls.misconceptions[r.misconception], concept: r.conceptId, falls: 0, last: r.at });
      b.falls += 1; if (String(r.at) > String(b.last)) b.last = r.at;
    }
    return Object.values(map).map(b => {
      const days = new Set((records || []).filter(r => r.conceptId === b.concept && r.correct && !r.hint && !r.retry && String(r.at) > String(b.last)).map(r => today(new Date(r.at)))).size;
      return { ...b, days: Math.min(3, days), state: days >= 3 ? 'captured' : days ? 'tracking' : 'wild' };
    }).sort((a, b) => ({ wild: 0, tracking: 1, captured: 2 })[a.state] - ({ wild: 0, tracking: 1, captured: 2 })[b.state] || b.falls - a.falls);
  }
  // Criatura propia (sin personajes de otros): un bicho redondo con orejas puntudas; enojado si anda suelto, en un frasco si está capturado.
  function creatureSvg(color, state) {
    const brow = state === 'wild' ? '<path d="M26 39l9 3M54 39l-9 3" stroke="#2a1b0e" stroke-width="2.6" stroke-linecap="round"/>' : '';
    const jar = state === 'captured' ? '<rect x="7" y="12" width="66" height="64" rx="16" fill="rgb(200 230 255 / .22)" stroke="#8fb3c9" stroke-width="2.5"/><rect x="22" y="5" width="36" height="9" rx="3" fill="#a87a45"/>' : '';
    const line = state === 'tracking' ? 'stroke="#2a1b0e" stroke-dasharray="4 3" stroke-width="2"' : 'stroke="rgb(0 0 0 / .25)" stroke-width="1.5"';
    return `<svg viewBox="0 0 80 80" class="cr-beast-svg is-${state}" aria-hidden="true">${jar}
      <path d="M20 34l-6-16 15 9zM60 34l6-16-15 9z" fill="${color}" ${line}/>
      <ellipse cx="40" cy="48" rx="23" ry="21" fill="${color}" ${line}/>
      <ellipse cx="40" cy="56" rx="12" ry="9" fill="rgb(255 255 255 / .28)"/>
      <ellipse cx="31" cy="46" rx="5.5" ry="6.5" fill="#fff"/><ellipse cx="49" cy="46" rx="5.5" ry="6.5" fill="#fff"/>
      <circle cx="32" cy="47" r="2.8" fill="#2a1b0e"/><circle cx="48" cy="47" r="2.8" fill="#2a1b0e"/>${brow}
      <path d="${state === 'wild' ? 'M34 60q6-4 12 0' : 'M34 58q6 5 12 0'}" stroke="#2a1b0e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      ${state === 'wild' ? '<path d="M36 60l2 3 2-3M42 60l2 3 2-3" fill="#fff"/>' : ''}</svg>`;
  }
  function beastsMarkup(cls, s, api) {
    const E = EV(), recs = E ? E.storeFor(api.getState(), cls.id).records : [];
    const list = bestiary(cls, recs), C = GEN(cls)?.creatures || {}, title = c => (cls.concepts || []).find(k => k.id === c)?.title || c;
    const caught = list.filter(b => b.state === 'captured').length;
    if (!list.length) return '<p class="cr-act-help">Aquí aparecerán como criaturas los <b>errores típicos</b> en que caigas. No es malo: cada error que conoces se puede domar.</p>';
    return `<p class="cr-act-help">Cada error típico en que caíste es una criatura. <b>Se captura</b> cuando aciertas su tema sin ayuda en <b>3 días distintos</b> después de la última vez que caíste. Capturadas: <b>${caught} de ${list.length}</b>.</p>
      <div class="cr-beasts">${list.map(b => { const [name, color] = C[b.concept] || ['Criatura', '#8a7a6a'];
        return `<article class="cr-beast is-${b.state}">${creatureSvg(color, b.state)}<div>
          <p class="cr-eyebrow">${esc(name)} · ${{ wild: 'Suelta', tracking: `Rastreando · ${b.days} de 3 días`, captured: 'Capturada ✦' }[b.state]}</p>
          <h3>${esc(b.mc.label)}</h3><p>${md(b.mc.why)}</p>
          <p class="cr-note">Caíste ${b.falls} ${b.falls === 1 ? 'vez' : 'veces'} · tema: ${esc(title(b.concept))}</p>
          ${b.state !== 'captured' && gensFor(cls, b.concept).length ? `<button class="cr-btn cr-small" data-cr="train" data-focus="c:${esc(b.concept)}">Ir a domarla ▸</button>` : ''}</div></article>`; }).join('')}</div>`;
  }
  // Hoja de la noche anterior: una página para imprimir con lo esencial y TUS puntos débiles.
  function nightMarkup(cls, s, api) {
    const E = EV(), store = E?.storeFor(api.getState(), cls.id), recs = store?.records || [];
    const beasts = bestiary(cls, recs).filter(b => b.state !== 'captured').slice(0, 3);
    const lv = E && cls.concepts ? E.leaves(cls, store) : {}, rank = c => E?.LEAVES?.[lv[c.id]?.shown]?.rank || 0;
    const weak = (cls.concepts || []).filter(c => !c.root && lv[c.id]).sort((a, b) => (lv[b.id].count ? 1 : 0) - (lv[a.id].count ? 1 : 0) || rank(a) - rank(b)).slice(0, 4); // primero lo que ya viste y está flojo
    const rules = cls.missions.flatMap(m => (m.parts || []).filter(p => p.rule).map(p => p.rule)), ex = nextExam(cls, api), evalName = ex ? `${ex.title} (${ex.when})` : cls.evaluation;
    return `<p class="cr-act-help">Una página con lo esencial para la noche antes ${ex ? `del <b>${esc(evalName)}</b>, que ${esc(ex.label.startsWith('es') ? ex.label : `es ${ex.label}`)}` : `de la ${esc(cls.evaluation)}`}. Léela, cierra los ojos y <b>recuérdala</b>: recordar fija más que releer.</p>
      <div class="cr-row"><button class="cr-btn cr-primary cr-small" data-cr="print">🖨 Imprimir o guardar en PDF</button></div>
      <article class="cr-night"><header><b>${esc(cls.title)} · noche antes ${ex ? `del ${esc(evalName)}` : `de la ${esc(cls.evaluation)}`}</b><span>${esc(today())}</span></header>
        <section><h4>Fórmulas</h4><ul>${(cls.formulas || []).map(f => `<li><b>${esc(f.title)}:</b> ${sup(esc(f.formula))}</li>`).join('')}</ul></section>
        <section><h4>Recetas</h4><ul>${(cls.recipes || []).map(r => `<li><b>${esc(r.title)}:</b> ${md(r.base)} + ${md(r.reagents)}${r.condition ? ` (${md(r.condition)})` : ''} → ${md(r.result)}</li>`).join('')}</ul></section>
        ${rules.length ? `<section><h4>Reglas</h4><ul>${rules.map(r => `<li><b>${esc(r.title)}:</b> ${r.steps.map(md).join(' · ')}</li>`).join('')}</ul></section>` : ''}
        <section><h4>Tus trampas</h4>${beasts.length ? `<ul>${beasts.map(b => `<li><b>${esc(b.mc.label)}.</b> ${md(b.mc.why)}</li>`).join('')}</ul>` : '<p>Todavía no registras errores típicos. ¡Bien!</p>'}</section>
        <section><h4>Lo que más te conviene repasar</h4>${weak.length ? `<ul>${weak.map(c => `<li>${esc(c.title)} <small>(${esc(lv[c.id].label)})</small></li>`).join('')}</ul>` : '<p>—</p>'}</section>
        <section><h4>Antes de dormir</h4><ul><li>Una Ronda del alba de 5 minutos: practicar recordando fija más que releer (Roediger y Karpicke, 2006).</li>
          <li>Nada de materia nueva a última hora: repasa lo que ya sabes.</li><li>Duerme 7 a 9 horas: el sueño consolida lo estudiado (Diekelmann y Born, 2010).</li></ul></section>
      </article>`;
  }
  function recipeState(cls, api, r) {
    const E = EV(); if (!E) return 'seen';
    const store = E.storeFor(api.getState(), cls.id), recs = store.records.filter(x => x.conceptId === r.concept);
    if (!recs.length) return 'hidden';
    if (E.leaf(store, r.concept).key && (E.LEAVES[E.leaf(store, r.concept).key]?.rank || 0) >= 3) return 'mastered';
    // Se completa al acertar dentro de su misión (el diagnóstico solo la deja "vista").
    return recs.some(x => x.correct && !x.retry && x.missionId === r.mission) ? 'learned' : 'seen';
  }
  function recipesMarkup(cls, s, api) {
    const list = (cls.recipes || []).map(r => ({ r, st: recipeState(cls, api, r) }));
    const full = list.filter(x => x.st === 'learned' || x.st === 'mastered').length;
    const n = id => cls.missions.findIndex(m => m.id === id) + 1;
    return `<p class="cr-act-help">Cada reacción que dominas se vuelve una poción. <b>${full} de ${list.length}</b> completas. Se completan solas cuando respondes bien en las misiones.</p>
      <div class="cr-recipes">${list.map(({ r, st }) => {
        if (st === 'hidden') return `<article class="cr-rcard is-hidden"><p class="cr-eyebrow">Por descubrir</p><h3>???</h3><p>Aparece en la Misión ${n(r.mission)}.</p></article>`;
        const hide = v => st === 'seen' ? '<span class="cr-unknown">???</span>' : md(v);
        return `<article class="cr-rcard is-${st}">${st === 'mastered' ? '<span class="cr-seal" title="Dominada">✦</span>' : ''}
          <p class="cr-eyebrow">${{ seen: 'Vista · acierta una vez para completarla', learned: 'Aprendida', mastered: 'Dominada' }[st]}</p><h3>${esc(r.title)}</h3>
          <dl class="cr-recipe"><div><dt>Ingrediente base</dt><dd>${md(r.base)}</dd></div><div><dt>Ingredientes mágicos</dt><dd>${hide(r.reagents)}</dd></div>
            <div><dt>Condición</dt><dd>${hide(r.condition)}</dd></div><div><dt>Resultado</dt><dd>${md(r.result)}</dd></div></dl>
          ${r.note && st !== 'seen' ? `<p class="cr-note">${md(r.note)}</p>` : ''}
          <button class="cr-link" data-cr="slides" data-slide="${r.slide}">Diapositiva ${r.slide}</button></article>`;
      }).join('')}</div>${rulesMarkup(cls, api)}`;
  }
  // Reglas del sabio (misiones sin reacciones): se ven cuando ya trabajaste su concepto en esa misión.
  function rulesMarkup(cls, api) {
    const rules = cls.missions.flatMap(m => (m.parts || []).filter(p => p.rule).map(p => ({ ...p.rule, mission: m })));
    if (!rules.length) return '';
    const E = EV(), store = E?.storeFor(api.getState(), cls.id);
    const seen = r => !E || store.records.some(x => x.missionId === r.mission.id && x.conceptId === r.concept);
    return `<h3 class="cr-rules-h">Reglas del sabio</h3><div class="cr-recipes">${rules.map(r => seen(r)
      ? `<article class="cr-rcard is-learned"><p class="cr-eyebrow">Regla</p><h3>${esc(r.title)}</h3><ol class="cr-rule">${r.steps.map(t => `<li>${md(t)}</li>`).join('')}</ol></article>`
      : `<article class="cr-rcard is-hidden"><p class="cr-eyebrow">Por descubrir</p><h3>???</h3><p>Aparece en la Misión ${cls.missions.indexOf(r.mission) + 1}.</p></article>`).join('')}</div>`;
  }

  function panel(cls, s, b, api) {
    if (s.slideOpen) {
      const numbers = Object.keys({ ...cls.slides, ...cls.slideImages }).map(Number).sort((x, y) => x - y);
      const n = Number(s.slideOpen), i = numbers.indexOf(n);
      return `<div class="cr-lightbox" role="dialog" aria-modal="true" aria-label="Diapositivas de la clase">
        <div class="cr-lightbox-inner"><header><b>Clase de cátedra · ${esc(Object.values(cls.sources)[0]?.author || '')}</b><button class="cr-btn cr-small" data-cr="panel-close">Cerrar ✕</button></header>
        <div class="cr-lightbox-slide"><p class="cr-eyebrow">Diapositiva ${esc(n)}</p>${slideMarkup(cls, n, { large: true })}</div>
        <footer><button class="cr-btn" data-cr="slides" data-slide="${numbers[i - 1] ?? ''}" ${i > 0 ? '' : 'disabled'}>◂ Anterior</button>
          <span>${i + 1} de ${numbers.length}</span>
          <button class="cr-btn" data-cr="slides" data-slide="${numbers[i + 1] ?? ''}" ${i < numbers.length - 1 ? '' : 'disabled'}>Siguiente ▸</button></footer>
        ${cls.slideImages && Object.keys(cls.slideImages).length ? '' : '<p class="cr-muted">Mostrando el texto de la diapositiva. Las imágenes originales llegan cuando se pueda descargar el PDF.</p>'}</div></div>`;
    }
    if (!s.panel) return '';
    const m = b?.m || cls.missions[0];
    let title = '', body = '';
    if (s.panel === 'mini' && cls.mini?.[s.miniC]) ({ title, body } = miniPanel(cls, s));
    else if (s.panel === 'deepclass' && cls.deep?.[s.deepC]) ({ title, body } = deepPanel(cls, s));
    else if (s.panel === 'help') {
      title = '¿Cómo funciona la torre?';
      body = `<dl class="cr-help">${HELP.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <div class="cr-row"><button class="cr-btn cr-primary" data-cr="tour" data-go="again">Ver el recorrido de nuevo</button></div>`;
    } else if (s.panel === 'zero') {
      title = 'El sabio explica desde cero';
      body = (m.stages.fundamentals || []).map(f => `<section class="cr-zero"><h3>${esc(f.title.replace(/^Desde cero: /, ''))}</h3>${f.svg ? `<div class="cr-figure">${f.svg}</div>` : ''}<p>${md(f.body)}</p>${f.deeper ? `<p>${md(f.deeper)}</p>` : ''}${f.rows ? `<dl class="cr-rows">${f.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}</section>`).join('');
    } else if (s.panel === 'glossary' && s.gtab === 'formulas') {
      title = 'Tu grimorio';
      body = grimoireTabs(s) + formulasMarkup(cls, s);
    } else if (s.panel === 'glossary' && s.gtab === 'recipes') {
      title = 'Tu grimorio';
      body = grimoireTabs(s) + recipesMarkup(cls, s, api);
    } else if (s.panel === 'glossary' && ['lab', 'beasts', 'night'].includes(s.gtab)) {
      title = 'Tu grimorio';
      body = grimoireTabs(s) + { lab: labMarkup, beasts: beastsMarkup, night: nightMarkup }[s.gtab](cls, s, api);
    } else if (s.panel === 'glossary') {
      title = 'Tu grimorio';
      const entries = (cls.glossary || []).map((g, i) => Array.isArray(g) ? { term: g[0], def: g[1], i } : { ...g, i });
      const entry = g => {
        const key = `gl-${g.i}`, open = s.revealed[key];
        return `<div class="cr-term"><dt>${esc(g.term)}</dt>
          <dd class="cr-term-simple">${md(g.simple || g.def)}</dd>
          ${g.simple ? `<dd class="cr-term-def"><span>Definición de prueba</span> ${md(g.def)}</dd>` : ''}
          ${g.simpler ? `<dd>${open ? `<p class="cr-term-simpler"><span>Más simple todavía</span> ${md(g.simpler)}</p>` : ''}
            <button class="cr-btn cr-small" data-cr="deeper" data-key="${key}" aria-expanded="${Boolean(open)}">${open ? 'Ocultar' : 'Explícamelo más simple'}</button></dd>` : ''}</div>`;
      };
      const mine = entries.filter(g => g.mission && g.mission === b?.m?.id), rest = entries.filter(g => !mine.includes(g));
      body = grimoireTabs(s) + `${mine.length ? `<p class="cr-eyebrow">De esta misión</p><dl class="cr-glossary">${mine.map(entry).join('')}</dl><p class="cr-eyebrow">Todo el glosario</p>` : ''}
        <dl class="cr-glossary">${rest.map(entry).join('')}</dl>`;
    } else if (s.panel === 'goal') {
      const goal = goalOf(cls, s);
      title = 'Tu camino al 7';
      body = goal ? `<p class="cr-goal-intro">Un <b>7</b> es tener los <b>${goal.total} puntos</b> de la ${esc(cls.evaluation)}. Esta clase te prepara para <b>${goal.max}</b>. Cada punto cuenta cuando lo <b>demuestras</b>: aciertas sin ayuda el caso estilo prueba de las misiones que lo preparan.</p>
        <div class="cr-goal-big"><b>${pts(goal.earned)}</b><span>de ${goal.total} pts demostrados</span></div>${goalMeter(goal)}
        <p class="cr-goal-legend"><i class="is-won"></i> demostrado <i class="is-open"></i> por demostrar en ${esc(cls.title)} <i class="is-later"></i> otras clases</p>
        <ul class="cr-goal-list">${goal.qs.map(q => `<li><div><b>${esc(q.id)} · ${esc(q.label)}</b><span>${pts(q.earned)} / ${pts(q.points)} pts</span></div>
          <div class="cr-goal-bar"><span style="width:${q.points ? Math.round(q.earned / q.points * 100) : 0}%"></span></div>
          <div class="cr-row">${q.missions.map(mId => { const m = missionById(cls, mId); return m ? `<button class="cr-btn cr-small" data-cr="mission" data-mission="${m.id}">${esc(m.title)} ▸</button>` : ''; }).join('')}</div></li>`).join('')}
          ${(goal.rest || []).map(r => `<li class="is-later"><div><b>${esc(r.label)}</b><span>${pts(r.points)} pts · ${esc(r.note || '')}</span></div></li>`).join('')}</ul>
        ${willowMarkup(cls, api, s)}
        <p class="cr-eyebrow">Lo que sabes, concepto por concepto</p>
        ${cls.missions.map(m => `<div class="cr-leaf-group"><b>${esc(m.title)}</b>${leafChips(cls, api, cls.id, c => c.mission === m.id)}</div>`).join('')}
        <div class="cr-leaf-group"><b>Raíces (clase base)</b>${leafChips(cls, api, cls.id, c => c.root)}</div>
        ${calibrationLine(cls, api, cls.id)}
        <p class="cr-note">Las misiones marcadas como <b>base</b> no dan puntos directos, pero sin ellas no se puede responder lo que sí los da. Y ojo: demostrarlo hoy no es dominarlo. Cuenta como <b>retenido</b> cuando lo repites sin ayuda 24 horas o más después.</p>` : '';
    } else if (s.panel === 'curio') {
      const list = cls.curiosities || [], c = list[(s.curio || 0) % Math.max(1, list.length)];
      title = 'Lo que dicen los frascos';
      body = c ? `<p class="cr-curio">${esc(c.text)}</p><div class="cr-row"><button class="cr-btn cr-primary" data-cr="curio-next">Otro dato ▸</button>${c.slide ? `<button class="cr-btn" data-cr="slides" data-slide="${c.slide}">Ver diapositiva ${c.slide}</button>` : ''}</div>` : '';
    }
    return `<div class="cr-lightbox" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="cr-lightbox-inner cr-panel">
      <header><b>${esc(title)}</b><button class="cr-btn cr-small" data-cr="panel-close">Cerrar ✕</button></header><div class="cr-panel-body">${body}</div></div></div>`;
  }

  // Ilumina lo que explica el recorrido y pone la burbuja donde no lo tape.
  function placeTour(root, step) {
    const bubble = root.querySelector('.cr-tour');
    const targets = step.target ? [...root.querySelectorAll(step.target)].filter(el => el.getClientRects().length) : [];
    targets.forEach(el => el.classList.add('is-tour-target'));
    if (!targets.length || step.place === 'top') { bubble.classList.add(targets.length ? 'is-top' : 'is-center'); return; }
    const r = targets[0].getBoundingClientRect(), h = window.innerHeight;
    if (r.top + r.height / 2 > h / 2) bubble.style.bottom = `${Math.max(8, h - r.top + 14)}px`;
    else bubble.style.top = `${Math.min(h - 180, r.bottom + 14)}px`;
  }

  function render(id, api) {
    const cls = window.NexoClasses?.[id];
    if (window.NexoClassSlides?.[id]) cls.slideImages = window.NexoClassSlides[id]; // imágenes reales del PPT (tools/classroom-art/slides.py)
    const s = sessionFor(api, id);
    applyIntent(cls, s, api, id);
    if (s.path && !PATHS[s.path]) s.path = null;
    const list = beats(cls, s);
    s.beat = Math.max(0, Math.min(s.beat, list.length - 1));
    const b = list[s.beat];
    if (b.kind === 'simresult' && s.sim && !s.sim.logged) { const sc = simScore(cls, s); s.sim.ended = true; s.sim.logged = true; (s.simHistory ||= []).push({ n: s.sim.n, at: new Date().toISOString(), got: sc.got, max: sc.max, nota: sc.nota }); }
    if (s.path === 'misiones' && s.mission) s.far[s.mission] = Math.max(s.far[s.mission] || 0, s.beat);
    const { sage, center } = moment(cls, api, s, b);
    const hintable = b.kind === 'question' && ['practice', 'challenge', 'train'].includes(b.stage) && !s.answers[b.item.id] && !s.hints[b.item.id];
    let progress = Math.round((s.beat / Math.max(1, list.length - 1)) * 100);
    const goal = goalOf(cls, s);
    if (s.path === 'diagnostico') { const plan = diagnosisPlan(cls, s); progress = plan.done ? 100 : Math.round((plan.asked.length - 1) / (cls.diagnosis?.max || 7) * 100); }
    // En el mapa y la bienvenida, el % es de toda la clase (actividades respondidas); dentro de una misión, de esa misión.
    if (b.kind === 'pick' || b.kind === 'path') { const all = allItems(cls); progress = Math.round(all.filter(({ item }) => s.answers[item.id]).length / Math.max(1, all.length) * 100); }
    if (b.kind === 'trainpick') progress = 0;
    if (s.path === 'entrenar' && s.trainRun) progress = Math.round(s.trainRun.ids.filter(i => s.answers[i]).length / s.trainRun.size * 100);
    const where = s.path === 'tiempo' ? 'Tu plan de hoy' : s.path === 'entrenar' ? 'Entrenar' : s.path === 'alba' ? 'Ronda del alba' : s.path === 'simulacro' ? 'Simulacro PEP' : !s.path || b.kind === 'pick' ? 'la clase' : s.path === 'base' ? (baseById(cls, s.mission) ? `Repaso: ${baseById(cls, s.mission).title}` : 'Repaso desde cero') : s.path === 'misiones' && missionById(cls, s.mission)
      ? `Misión ${cls.missions.findIndex(m => m.id === s.mission) + 1}` : s.path === 'misiones' ? 'la clase' : PATHS[s.path].name;
    const mascotMood = s.mascotMood || 'idle';
    const entering = !api.app.querySelector('.classroom');
    if (!s.tips.tour && s.tour == null && b.kind === 'path') s.tour = 0; // primera vez: recorrido
    const step = s.tour != null ? TOUR[s.tour] : null;
    api.app.innerHTML = `<section class="classroom ${entering ? 'is-entering' : ''} ${step ? 'is-touring' : ''} ${s.tips.spot ? '' : 'is-spots-new'}" aria-label="Torre del alquimista: ${esc(cls.title)}">
      ${scene(cls, s, b)}
      <header class="cr-top">
        <button class="cr-btn cr-small cr-ghost" data-cr="exit">← Salir</button>
        ${s.path ? '<button class="cr-btn cr-small cr-ghost cr-paths-btn" data-cr="paths" aria-label="Volver a elegir camino (no pierdes tu avance)">☰ <span>Caminos</span></button>' : ''}
        <div class="cr-progress"><div class="cr-thread" role="progressbar" aria-label="Avance de ${esc(where)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
          <span class="cr-progress-label">${esc(where)}${s.path === 'tiempo' ? '' : ` · <b>${progress} %</b>`}${s.path === 'simulacro' && s.sim && !s.sim.ended ? ` · <span class="cr-timer" role="timer" data-ends="${s.sim.start + s.sim.minutes * 60000}">⏳ <b>--:--</b></span>` : ''}</span></div>
        ${goal ? `<button class="cr-btn cr-small cr-ghost cr-goal-chip" data-cr="goal" aria-label="Tu camino al 7: ${pts(goal.earned)} de ${goal.total} puntos"><span aria-hidden="true">★</span> <span class="cr-goal-chip-txt">Camino al 7 · </span><b>${pts(goal.earned)}</b>/${goal.total}</button>` : ''}
        <button class="cr-btn cr-small cr-ghost cr-help-btn" data-cr="help" aria-label="¿Cómo funciona la torre?" title="¿Cómo funciona?">?</button>
        <button class="cr-btn cr-small cr-ghost cr-slides-btn" data-cr="slides" data-slide="${esc((b.block?.slide) || (b.item?.slide) || Object.keys(cls.slides || {})[0] || 1)}">Diapositivas</button>
      </header>
      <nav class="cr-objects" aria-label="Objetos de la torre">${[['sage', 'Sabio', 'Desde cero'], ['book', 'Libro', 'Grimorio'], ['board', 'Pizarra', 'Diapositivas'], ['window', 'Ventana', 'Hora'], ['flasks', 'Frascos', 'Dato curioso']]
        .map(([id, name, what]) => `<button class="cr-object" data-cr="spot" data-spot="${id}" aria-label="${esc(SPOT_LABEL[id])}"><b>${name}</b><span>${what}</span></button>`).join('')}</nav>
      <main class="cr-center" aria-live="polite">${center}</main>
      <section class="cr-dialog" data-mood="${esc(sage.mood)}" aria-label="El sabio">
        <button class="cr-mascot" data-cr="mascot" data-mood="${esc(mascotMood)}" aria-label="${hintable ? 'Pedir una pista a tu compañero' : 'Tu compañero'}">
          ${hintable ? '<span class="cr-mascot-tip">¿Pista?</span>' : ''}${api.avatarMarkup({ label: 'Tu compañero' })}</button>
        <p class="cr-speaker">El sabio</p>
        <p class="cr-say" ${entering ? '' : 'data-fresh="1"'}>${md(sage.text)}</p>
        ${s.mascotSay ? `<p class="cr-mascot-say"><b>Tu compañero:</b> ${md(s.mascotSay)}</p>` : ''}
        <div class="cr-actions">${sage.actions}</div>
      </section>
      ${panel(cls, s, b, api)}
      ${step ? `<div class="cr-tour" role="dialog" aria-modal="false" aria-label="Recorrido: ${esc(step.title)}"><p class="cr-eyebrow">Recorrido · ${s.tour + 1} de ${TOUR.length}</p>
        <b>${esc(step.title)}</b><p>${esc(step.text)}</p><div class="cr-row"><button class="cr-btn cr-small" data-cr="tour" data-go="skip">Saltar</button>
        <button class="cr-btn cr-small cr-primary" data-cr="tour" data-go="next">${s.tour < TOUR.length - 1 ? 'Siguiente ▸' : '¡Listo!'}</button></div></div>` : ''}
    </section>`;
    document.body.classList.add('in-classroom');
    s.burst = null; // la reacción de la escena dura una sola vista
    api.hydrate();
    const root = api.app.querySelector('.classroom');
    if (step) placeTour(root, step);
    if (s.panel === 'glossary' && s.card) root.querySelector('.cr-fcard.is-open')?.scrollIntoView({ block: 'nearest' });
    root.addEventListener('click', event => onClick(event, id, api));
    // La barra de confianza se marca al soltarla (también si la dejas en 50 %) o con las flechas del teclado.
    const commit = event => {
      const range = event.target.closest?.('[data-cr-conf]');
      if (!range) return;
      const value = Number(range.value);
      if (s.conf[range.dataset.crConf] === value) return;
      s.conf[range.dataset.crConf] = value;
      rerender(id, api);
      api.app.querySelector(`[data-cr-conf="${range.dataset.crConf}"]`)?.focus({ preventScroll: true });
    };
    root.addEventListener('change', commit);
    // Foto de la hoja en papel: solo se muestra (objeto local), nunca se guarda ni se envía.
    root.addEventListener('change', event => {
      const input = event.target.closest?.('[data-cr-photo]'); const file = input?.files?.[0];
      if (!file) return;
      if (PHOTOS.get(input.dataset.crPhoto)) URL.revokeObjectURL(PHOTOS.get(input.dataset.crPhoto));
      PHOTOS.set(input.dataset.crPhoto, URL.createObjectURL(file)); render(id, api);
    });
    // Cronómetro del simulacro: al llegar a cero, la prueba se cierra y vas a la corrección.
    clearInterval(TIMER);
    const timer = root.querySelector('.cr-timer');
    if (timer) {
      const tick = () => {
        const left = Math.max(0, Number(timer.dataset.ends) - Date.now()), m = Math.floor(left / 60000), sec = Math.floor(left / 1000) % 60;
        timer.querySelector('b').textContent = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        timer.classList.toggle('is-low', left < 120000);
        if (!left && s.sim && !s.sim.ended) { clearInterval(TIMER); s.sim.ended = true; s.beat = beats(cls, s).length - 1; s.mascotSay = '¡Se acabó el tiempo! Vamos a la corrección.'; rerender(id, api); }
      };
      tick(); TIMER = setInterval(tick, 1000);
    }
    // Mecanismo en reproducción: avanza solo cada pocos segundos (se detiene en el último paso)
    clearTimeout(mechTimer);
    const mw = b.kind === 'lesson' && b.block.frames ? s.work[`mech:${b.block.id}`] : null;
    if (mw?.playing) mechTimer = setTimeout(() => {
      if (!document.body.classList.contains('in-classroom') || !api.app.querySelector('.cr-mech')) return;
      mw.i += 1; if (mw.i >= b.block.frames.length - 1) { mw.i = b.block.frames.length - 1; mw.playing = false; }
      rerender(id, api);
    }, 3800);
    // Editor de moléculas y flechas: maneja sus propios toques y guarda en el trabajo de la actividad.
    window.NexoMolEditor?.mount(root, { work: (itemId, retry) => workOf(s, findItem(cls, itemId), retry),
      item: itemId => findItem(cls, itemId), commit: () => rerender(id, api) });
    root.addEventListener('pointerup', commit);
    root.addEventListener('input', event => {
      const calc = event.target.closest('[data-cr-calc]');
      if (calc) {
        const f = (cls.formulas || []).find(x => x.id === calc.dataset.crCalc), vals = s.work[`calc:${f.id}`];
        const v = parseFloat(String(calc.value).replace(',', '.'));
        if (Number.isFinite(v)) { vals[calc.dataset.key] = v; calc.closest('[data-calc]').querySelector('[data-calc-out]').innerHTML = md(f.calc.run(vals)); }
        return;
      }
      const range = event.target.closest('[data-cr-conf]');
      if (range) { range.style.setProperty('--v', `${range.value}%`); const b = range.previousElementSibling?.querySelector('b'); if (b) b.textContent = `${range.value} %`; return; }
      const sim = event.target.closest('[data-cr-sim]');
      if (sim) {
        const it = findItem(cls, sim.dataset.crSim); if (!it) return;
        const w = workOf(s, it, sim.dataset.retry === '1'), v = Number(sim.value), above = v > it.sim.threshold, box2 = sim.closest('[data-sim]');
        w.sim = v; w.moved = true;
        box2.classList.toggle('is-above', above);
        box2.querySelector('[data-sim-val]').textContent = `${v} ${it.sim.unit}`;
        box2.querySelector('[data-sim-text]').innerHTML = md(above ? it.sim.above : it.sim.below);
        const doneBtn = box2.parentElement.querySelector('[data-cr="act-poe-done"]'); if (doneBtn) doneBtn.disabled = false;
        return;
      }
      const box = event.target.closest('[data-cr-text]');
      if (box) { const it = findItem(cls, box.dataset.crText); if (it) workOf(s, it, box.dataset.retry === '1').text = box.value; }
      const unitBox = event.target.closest('[data-cr-unit]');
      if (unitBox) { const it = findItem(cls, unitBox.dataset.crUnit); if (it) workOf(s, it, unitBox.dataset.retry === '1').unit = unitBox.value; }
    });
    root.addEventListener('keydown', event => { if (event.key === 'Escape' && (s.slideOpen || s.panel)) { s.slideOpen = null; s.panel = null; rerender(id, api); } });
    (root.querySelector('.cr-lightbox [data-cr="panel-close"]') || root.querySelector('.cr-option:not(:disabled)') || root.querySelector('.cr-next, .cr-actions .cr-primary') || root.querySelector('.cr-path'))?.focus({ preventScroll: true });
  }

  let mechTimer = null;
  function rerender(id, api) { api.saveState(); render(id, api); }

  /* Cada respuesta deja evidencia (evidence.js) y programa cuándo vuelve el concepto (FSRS). */
  function logEvidence(cls, s, api, id, b, item, rec, retry) {
    const E = EV();
    if (!E || b.stage === 'pretest') return; // adivinar antes de la lección no es evidencia
    const missionId = b.m?.id || cls.missions.find(m => allItems(cls, m.id).some(x => x.item === item))?.id;
    const state = api.getState();
    const ev = E.record(state, id, { itemId: item.id, conceptId: E.conceptOf(item, missionId), missionId, stage: b.stage || 'rescue',
      step: E.stepOf(item), correct: rec.correct, hint: Boolean(rec.hint), retry, transfer: b.stage === 'transfer' || b.stage === 'simulacro',
      confidence: retry ? null : rec.confidence ?? null, why: retry ? null : rec.why || null, misconception: mcKeyOf(item, rec), at: rec.at });
    E.schedule(state, id, ev).then(() => api.saveState()).catch(() => { /* sin repaso programado: la evidencia queda igual */ });
  }
  const withConfidence = (s, item, rec) => {
    const confidence = s.conf[item.id] ?? null;
    return { ...rec, confidence, why: confidence !== null && confidence <= 60 ? s.confWhy[item.id] || null : null,
      kind: EV()?.confidenceKind(confidence, rec.correct) || null };
  };

  function onClick(event, id, api) {
    const button = event.target.closest('[data-cr]');
    if (!button || button.disabled) return;
    const cls = window.NexoClasses[id];
    const s = sessionFor(api, id);
    const list = beats(cls, s), b = list[s.beat];
    const action = button.dataset.cr;
    if (action !== 'mascot') { s.mascotSay = ''; }

    if (action === 'exit') { clearInterval(TIMER); }
    if (action === 'paths') { s.path = null; s.mission = null; s.beat = 0; s.panel = null; clearInterval(TIMER); return rerender(id, api); }
    if (action === 'plan-min') { s.planMin = Number(button.dataset.min) || null; s.planDay = today(); return rerender(id, api); }
    if (action === 'sim-start') { s.sim = simBuild(cls, s, button.dataset.size); s.simN = s.sim.n; Object.assign((s.genFrom ||= {}), s.sim.from); s.beat += 1; return rerender(id, api); }
    if (action === 'train') { s.panel = null; s.path = 'entrenar'; s.trainRun = newRun(cls, s, button.dataset.focus || 'mix'); s.beat = 2; s.mascotMood = 'happy'; return rerender(id, api); }
    if (action === 'train-pick') { s.trainRun = null; s.beat = 1; return rerender(id, api); }
    if (action === 'lab-start') { s.lab = { at: button.dataset.sub, trail: [] }; return rerender(id, api); }
    if (action === 'lab-add') {
      const L = GEN(cls)?.lab, from = s.lab?.at, reagent = button.dataset.reagent;
      if (!L || !from) return;
      const r = L.react(from, reagent);
      s.lab.trail.push({ from, reagent, ...r });
      if (r.to) { s.lab.at = r.to; (s.labFound ||= {})[`${from}>${reagent}`] = true; }
      s.mascotMood = r.to ? 'happy' : 'think'; return rerender(id, api);
    }
    if (action === 'lab-reset') { s.lab = null; return rerender(id, api); }
    if (action === 'lab-undo') { const last = s.lab?.trail.pop(); if (last) s.lab.at = last.from; return rerender(id, api); }
    if (action === 'print') { // se imprime una copia suelta de la hoja (así no la recorta el panel)
      const sheet = document.querySelector('.cr-night'); if (!sheet) return;
      document.getElementById('nexo-print-sheet')?.remove();
      const copy = sheet.cloneNode(true); copy.id = 'nexo-print-sheet'; document.body.append(copy); document.body.classList.add('nexo-print-night');
      window.addEventListener('afterprint', () => { document.body.classList.remove('nexo-print-night'); copy.remove(); }, { once: true });
      window.print(); return;
    }
    if (action === 'sim-new') { s.sim = null; s.beat = 1; return rerender(id, api); }
    if (action === 'exit') { document.body.classList.remove('in-classroom'); window.NexoAmbientTime?.stopPreview?.(); s.slideOpen = null; s.panel = null; return api.exit(); }
    if (action === 'panel-close') { s.slideOpen = null; s.panel = null; return rerender(id, api); }
    if (action === 'curio-next') { s.curio = (s.curio || 0) + 1; return rerender(id, api); }
    if (action === 'deeper') { s.revealed[button.dataset.key] = !s.revealed[button.dataset.key]; return rerender(id, api); }
    if (action === 'spot') {
      const spot = button.dataset.spot;
      s.tips.spot = true;
      if (spot === 'board') { s.slideOpen = String((b.block?.slide) || (b.item?.slide) || Object.keys(cls.slides || {})[0] || 1); }
      else if (spot === 'sage') { s.panel = 'zero'; }
      else if (spot === 'book') { s.panel = 'glossary'; s.gtab = s.gtab || 'glossary'; }
      else if (spot === 'flasks') { s.panel = 'curio'; s.curio = (s.curio ?? -1) + 1; s.mascotMood = 'happy'; }
      else if (spot === 'window') {
        s.hourIdx = ((s.hourIdx ?? -1) + 1) % HOURS.length;
        window.NexoAmbientTime?.preview?.(HOURS[s.hourIdx]);
        s.mascotMood = 'happy'; s.mascotSay = ['¡Amaneció en la torre!', 'Mediodía: todo se ve clarito.', 'Qué lindo el atardecer…', 'De noche la torre brilla distinto.'][s.hourIdx];
        setTimeout(() => { if (document.body.classList.contains('in-classroom')) render(id, api); }, 2300); // los objetos tocables siguen a la pintura que quedó
      }
      return rerender(id, api);
    }
    if (action === 'slides') { if (button.dataset.slide) s.slideOpen = button.dataset.slide; return rerender(id, api); }
    if (action === 'path') {
      s.path = button.dataset.path; s.mission = null; s.beat = 1; s.mascotMood = 'happy'; s.panel = null;
      if (s.path === 'tiempo') s.planDay = s.planDay === today() ? s.planDay : (s.planMin = null, today());
      if (s.path === 'alba') {
        const size = Number(button.dataset.size) || 4, key = `${today()}:${size}`;
        s.albaKey = key;
        if (!s.rounds[key]) s.rounds[key] = roundPick(cls, s, EV()?.storeFor(api.getState(), id), size);
      }
      if (s.path === 'simulacro' && button.dataset.size && !(s.sim && !s.sim.ended)) { s.sim = simBuild(cls, s, button.dataset.size); s.simN = s.sim.n; Object.assign((s.genFrom ||= {}), s.sim.from); s.beat = 2; }
      api.track?.('class_started', { class_id: id, path: s.path });
      return rerender(id, api);
    }
    if (action === 'mech') {
      const blk = b.block, mw = (s.work[`mech:${blk.id}`] ||= { i: 0 });
      if (button.dataset.dir === 'play') { mw.playing = !mw.playing; if (mw.playing && mw.i >= blk.frames.length - 1) mw.i = 0; }
      else { mw.playing = false; mw.i = Math.max(0, Math.min(blk.frames.length - 1, mw.i + Number(button.dataset.dir))); }
      return rerender(id, api);
    }
    if (action === 'conf-why') { const k = button.dataset.item; s.confWhy[k] = s.confWhy[k] === button.dataset.why ? null : button.dataset.why; return rerender(id, api); }
    if (action === 'goal') { s.slideOpen = null; s.panel = 'goal'; return rerender(id, api); }
    if (action === 'willow') { s.panel = null; api.saveState(); location.hash = `#/torre/${encodeURIComponent(cls.subject || 'organica')}`; return; }
    if (action === 'mission') {
      s.panel = null; s.path = 'misiones'; s.mission = button.dataset.mission;
      const far = s.far[s.mission] || 0, n = beats(cls, s).length; // retomar donde quedaste (si no la terminaste)
      s.beat = far > 1 && far < n - 1 ? far : 1;
      if (s.beat > 1) s.mascotSay = 'Retomamos donde quedaste la última vez.';
      return rerender(id, api);
    }
    if (action === 'grimoire') { s.slideOpen = null; s.panel = 'glossary'; s.gtab = button.dataset.tab; if (button.dataset.card) s.card = button.dataset.card; return rerender(id, api); }
    if (action === 'mini') { s.slideOpen = null; s.panel = 'mini'; s.miniC = button.dataset.concept; s.miniStep = 0; return rerender(id, api); }
    if (action === 'mini-step') { s.miniStep = Math.max(0, (s.miniStep || 0) + Number(button.dataset.dir)); return rerender(id, api); }
    if (action === 'mini-ans') { (s.miniAns ||= {})[s.miniC] = Number(button.dataset.i); return rerender(id, api); }
    if (action === 'deepclass') { s.slideOpen = null; s.panel = 'deepclass'; s.deepC = button.dataset.concept; return rerender(id, api); }
    if (action === 'deep-ans') { (s.deepAns ||= {})[s.deepC] = Number(button.dataset.i); return rerender(id, api); }
    if (action === 'fcard') { s.card = s.card === button.dataset.card ? null : button.dataset.card; return rerender(id, api); }
    if (action === 'help') { s.slideOpen = null; s.panel = 'help'; s.tour = null; return rerender(id, api); }
    if (action === 'tip') { s.tips[button.dataset.tip] = true; return rerender(id, api); }
    if (action === 'tour') {
      const go = button.dataset.go;
      if (go === 'again') { s.panel = null; s.tour = 0; if (s.path) { s.path = null; s.mission = null; s.beat = 0; } }
      else if (go === 'next' && s.tour < TOUR.length - 1) s.tour += 1;
      else { s.tour = null; s.tips.tour = true; }
      return rerender(id, api);
    }
    if (action === 'base') { s.panel = null; s.path = 'base'; s.mission = button.dataset.mission; s.beat = 1; return rerender(id, api); }
    if (action === 'detour') { s.detour[button.dataset.key] = button.dataset.go === '1'; s.beat += 1; s.mascotMood = 'happy'; return rerender(id, api); }
    if (action === 'diag-redo') {
      for (const { item } of cls.diagnosis?.items || []) for (const key of ['answers', 'conf', 'confWhy', 'work']) delete s[key][item.id];
      s.beat = 1; return rerender(id, api);
    }
    if (action === 'restart') { s.path = null; s.mission = null; s.beat = 0; s.mascotMood = 'idle'; return rerender(id, api); }
    if (action.startsWith('act-')) return onActivity(action, button, cls, s, b, id, api);
    if (action === 'next') { if (beatDone(s, b)) { s.beat += 1; s.mascotMood = 'idle'; } return rerender(id, api); }
    if (action === 'offer') { s.skipExplain[b.m.id] = button.dataset.skip === '1'; s.beat += 1; s.mascotMood = 'happy'; return rerender(id, api); }
    if (action === 'reveal') { s.revealed[button.dataset.key] = true; return rerender(id, api); }
    if (action === 'mascot') {
      const canHint = b.kind === 'question' && ['practice', 'challenge', 'train'].includes(b.stage) && !s.answers[b.item.id];
      if (canHint && b.item.hint && !s.hints[b.item.id]) {
        s.hints[b.item.id] = true; s.mascotMood = 'think';
        s.mascotSay = 'Te dejé una pista en el pergamino. Esta respuesta contará como "con pista".';
      } else if (b.kind === 'question' && ['diagnostic', 'transfer', 'placement', 'review', 'simulacro'].includes(b.stage) && !s.answers[b.item.id]) {
        s.mascotMood = 'think'; s.mascotSay = 'Aquí no puedo ayudarte, ¡pero sé que puedes!';
      } else {
        s.mascotMood = 'happy'; s.mascotSay = ['¡Vamos bien!', 'Me encanta esta torre.', '¿Viste ese frasco burbujear?'][s.beat % 3];
      }
      return rerender(id, api);
    }
    if (action === 'answer') {
      const itemId = button.dataset.item, choice = Number(button.dataset.choice), retry = button.dataset.retry === '1';
      const item = findItem(cls, itemId);
      if (!item) return;
      const correct = Boolean(item.options[choice]?.correct);
      if (retry) {
        if (s.retries[itemId]) return;
        s.retries[itemId] = { choice, correct, at: new Date().toISOString() };
      } else {
        if (s.answers[itemId]) return;
        if (b.stage === 'diagnostic' || b.stage === 'transfer') delete s.hints[itemId];
        s.answers[itemId] = withConfidence(s, item, { choice, correct, hint: Boolean(s.hints[itemId]), stage: b.stage, at: new Date().toISOString() });
      }
      logEvidence(cls, s, api, id, b, item, retry ? s.retries[itemId] : s.answers[itemId], retry);
      s.mascotMood = correct ? 'happy' : 'worry'; s.burst = correct ? 'right' : 'wrong';
      api.track?.('class_answer', { class_id: id, correct, retry });
      return rerender(id, api);
    }
  }

  function onActivity(action, button, cls, s, b, id, api) {
    const retry = button.dataset.retry === '1';
    const item = findItem(cls, button.dataset.item);
    if (!item || recordOf(s, item, retry)) return;
    const w = workOf(s, item, retry);
    if (action === 'act-paper') { w.paper = true; w.revealed = true; w.warn = false; if (!String(w.text || '').trim()) w.text = '(Resuelto en papel)'; }
    else if (action === 'act-reveal') {
      const box = button.closest('.cr-write')?.querySelector('textarea');
      if (box) w.text = box.value;
      if (String(w.text || '').trim().length < MIN_WRITE) w.warn = true; else { w.warn = false; w.revealed = true; }
    }
    else if (action === 'act-rub') { const i = Number(button.dataset.i); (w.checks ||= item.rubric.map(() => false))[i] = !w.checks[i]; }
    else if (action === 'act-poe-pred') { w.pred = Number(button.dataset.choice); }
    else if (action === 'act-rc-add') { if ((w.seq ||= []).length < item.answer.length) w.seq.push(button.dataset.card); }
    else if (action === 'act-rc-del') { w.seq.splice(Number(button.dataset.i), 1); }
    else if (action === 'act-pick') { (w.seq ||= []).push(button.dataset.card); }
    else if (action === 'act-unpick') { w.seq.splice(Number(button.dataset.i), 1); }
    else if (action === 'act-sel') { w.sel = w.sel === button.dataset.card ? null : button.dataset.card; }
    else if (action === 'act-drop' && w.sel) { (w.assign ||= {})[w.sel] = button.dataset.bucket; w.sel = null; }
    else if (action === 'act-unassign') { delete w.assign[button.dataset.card]; }
    else if (action === 'act-left') { w.left = Number(button.dataset.i); }
    else if (action === 'act-right' && w.left !== undefined) {
      const pairs = (w.pairs ||= {}); const r = Number(button.dataset.i);
      for (const k of Object.keys(pairs)) if (Number(pairs[k]) === r) delete pairs[k];
      pairs[w.left] = r; w.left = undefined;
    }
    else if (action === 'act-spot' && Number(button.dataset.i) === item.wrong) { w.step = item.wrong; }
    else if (action === 'act-check' && item.type === 'number' && (!Number.isFinite(parseNum(w.text)) || (item.units && !w.unit))) { w.warn = true; }
    else if (['act-target', 'act-check', 'act-poe-done', 'act-spot', 'act-spot-fix'].includes(action)) {
      const value = action === 'act-target' ? button.dataset.target
        : action === 'act-poe-done' ? { pred: w.pred }
        : action === 'act-spot' ? { step: Number(button.dataset.i) }
        : action === 'act-spot-fix' ? { step: item.wrong, fix: Number(button.dataset.choice) }
        : item.type === 'recipe' ? [...(w.seq || [])]
        : item.type === 'order' ? [...w.seq] : item.type === 'classify' ? { ...w.assign }
        : item.type === 'write' ? { text: String(w.text || '').slice(0, 2000), checks: [...(w.checks || [])], paper: Boolean(w.paper) }
        : item.type === 'number' ? { raw: String(w.text || '').slice(0, 40), num: parseNum(w.text), unit: w.unit || (item.units ? '' : item.unit || '') }
        : item.type === 'build' ? { graph: JSON.parse(JSON.stringify(w.graph || item.start || { atoms: [], bonds: [] })) }
        : item.type === 'arrows' ? [...(w.arrows || [])] : { ...w.pairs };
      const correct = isCorrect(item, value);
      const record = { value, correct, at: new Date().toISOString() };
      if (retry) s.retries[item.id] = record;
      else {
        if (b.stage === 'diagnostic' || b.stage === 'transfer') delete s.hints[item.id];
        s.answers[item.id] = withConfidence(s, item, { ...record, hint: Boolean(s.hints[item.id]), stage: b.stage });
      }
      logEvidence(cls, s, api, id, b, item, retry ? s.retries[item.id] : s.answers[item.id], retry);
      s.mascotMood = correct ? 'happy' : 'worry'; s.burst = correct ? 'right' : 'wrong';
      api.track?.('class_answer', { class_id: id, correct, retry });
    }
    return rerender(id, api);
  }

  window.NexoClassroom = { nextExam, willowOf, parseNum, render, beats, isCorrect, itemsOf, blocksOf, diagnosisPlan, findItem, roundPick, simBuild, simScore, goalOf, PATHS,
    genItem, genFor, trainLevels, levelOf, startLevel, newRun, bestiary, LEVELS };
})();
