/* Lógica de las clases (sin pantalla): caminos, pasos ("beats"), puntos al 7, próxima prueba, ejercicios infinitos,
   corrección, evidencia y la hoja de cada concepto. Se expone como window.NexoClassroom y la usan el Sótano
   (dist/aprender/), la Torre del Sauce y las pruebas. Se arma a partir de los datos de window.NexoClasses.
   La pantalla vieja (torre del alquimista) se borró; la nueva vive en la Cámara. Ver docs/clases-estructura/SPEC.md. */
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
  const trapOf = (item, num) => (item.traps || []).find(t => Number.isFinite(num) && Math.abs(num - t.value) <= Math.abs(t.value) * (item.tol ?? 0.02) + 1e-12) || null;
  const recordOf = (s, item, retry) => retry ? s.retries[item.id] : s.answers[item.id];
  const workOf = (s, item, retry) => (s.work[retry ? `${item.id}::r` : item.id] ||= {});

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


  /* ───────── Barra de confianza (docs/clase-viva/DISENO.md §5) ─────────
     Antes de responder: qué tan seguro estás. Con 60 % o menos, por qué. Después: qué significa tu resultado. */
  const EV = () => window.NexoClassEvidence;
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
    window.NexoAcademicBridge?.record(api, cls, item, ev).catch(() => { /* el motor académico es un espejo: la clase sigue sin él */ });
  }
  const withConfidence = (s, item, rec) => {
    const confidence = s.conf[item.id] ?? null;
    return { ...rec, confidence, why: confidence !== null && confidence <= 60 ? s.confWhy[item.id] || null : null,
      kind: EV()?.confidenceKind(confidence, rec.correct) || null };
  };

  window.NexoClassroom = { nextExam, willowOf, parseNum, sessionFor, beatDone, recordOf, workOf, logEvidence, withConfidence, beats, isCorrect, itemsOf, blocksOf, diagnosisPlan, findItem, roundPick, simBuild, simScore, goalOf, PATHS,
    genItem, genFor, trainLevels, levelOf, startLevel, newRun, bestiary, LEVELS };
})();
