(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./content.js'), root.FSRS);
  else root.NexoStudyEngine = factory(root.NexoStudyContent, root.FSRS);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (bank, FSRS) {
  'use strict';
  const DAY = 86400000;
  const byId = Object.fromEntries(bank.activities.map(item => [item.id, item]));
  const skillById = Object.fromEntries(bank.skills.map(item => [item.id, item]));
  const scheduler = FSRS.fsrs({ enable_fuzz: false, request_retention: 0.9, maximum_interval: 365 });
  const copy = value => JSON.parse(JSON.stringify(value));
  const iso = value => new Date(value).toISOString();
  const uid = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  function createState(now = new Date()) {
    return { schema: 1, bankVersion: bank.version, createdAt: iso(now), updatedAt: iso(now), attempts: [], cards: {}, session: null, sessions: [] };
  }
  function independent(attempt) { return attempt.correct === true && attempt.assistance.length === 0; }
  function skillEvidence(state, skill, now = new Date()) {
    const attempts = state.attempts.filter(a => a.skill === skill);
    const successes = attempts.filter(independent);
    const families = new Set(successes.map(a => a.family));
    const retained = successes.some(later => successes.some(earlier =>
      later.itemId !== earlier.itemId && later.family !== earlier.family &&
      new Date(later.at) <= new Date(now) && new Date(later.at) - new Date(earlier.at) >= DAY));
    const last = attempts.at(-1);
    let status = 'Sin explorar', tone = 'empty';
    if (attempts.length) { status = 'En práctica'; tone = 'practice'; }
    if (last?.correct && !independent(last)) { status = 'Resuelto con ayuda'; tone = 'assisted'; }
    if (last && independent(last)) { status = families.size >= 2 ? 'Autónomo en variantes' : 'Un acierto sin ayuda'; tone = 'independent'; }
    if (retained && last && independent(last)) { status = 'Retención observada'; tone = 'retained'; }
    const recent = attempts.slice(-2);
    const level = recent.length === 2 && recent.every(independent) ? Math.min(3, Math.max(...recent.map(a => a.level)) + 1)
      : last && !last.correct ? Math.max(1, last.level - 1) : last?.level || 1;
    return { skill, attempts: attempts.length, independent: successes.length, families: families.size, retained, status, tone, level, last };
  }
  function dueItems(state, now = new Date()) {
    return Object.entries(state.cards).filter(([id, card]) => byId[id] && new Date(card.due) <= new Date(now))
      .map(([id, card]) => ({ item: byId[id], due: card.due })).sort((a, b) => new Date(a.due) - new Date(b.due));
  }
  function reviewInfo(state, now = new Date()) {
    const dates = Object.values(state.cards).map(c => c.due).sort((a, b) => new Date(a) - new Date(b));
    return { due: dueItems(state, now).length, next: dates.find(d => new Date(d) > new Date(now)) || null };
  }
  function choose(state, now = new Date()) {
    const session = state.session;
    if (!session || session.status !== 'active') return null;
    const sessionAttempts = state.attempts.filter(a => a.sessionId === session.id);
    const seen = new Set(sessionAttempts.map(a => a.itemId));
    const candidates = bank.activities.filter(item => !seen.has(item.id) && (!session.pool || session.pool.includes(item.id)));
    if (!candidates.length) return null;
    if (session.mode === 'control') return { item: candidates.sort((a,b)=>session.pool.indexOf(a.id)-session.pool.indexOf(b.id))[0], why: 'Caso de integración. Las respuestas y explicaciones se revisarán al terminar el recorrido de evaluación.' };
    if (session.mode === 'reviews') {
      const next = dueItems(state, now).find(row => !seen.has(row.item.id));
      return next ? { item: next.item, why: 'Este ejercicio tiene un repaso pendiente según tu historial. Intenta recuperarlo antes de mirar la ayuda.' } : null;
    }
    if (session.mode === 'diagnostic') {
      const explored = new Set(sessionAttempts.map(a => a.skill));
      const skill = bank.skills.find(s => !explored.has(s.id));
      if (!skill) return null;
      const target = candidates.filter(i => i.skill === skill.id).sort((a, b) =>
        Number(state.attempts.some(r => r.itemId === a.id)) - Number(state.attempts.some(r => r.itemId === b.id)) || a.level - b.level)[0];
      return { item: target, why: `Vamos a comprobar ${skill.title.toLowerCase()}. Este diagnóstico revisa una habilidad distinta en cada paso.` };
    }
    const last = sessionAttempts.at(-1);
    let focus = session.focus || null;
    let why = '';
    if (last && (!last.correct || last.assistance.length > 0)) {
      focus = last.skill;
      const failures = state.attempts.filter(a => a.skill === focus).slice(-2);
      if (failures.length === 2 && failures.every(a => !a.correct)) {
        const prerequisite = skillById[focus].prerequisites.find(id =>
          !state.attempts.filter(a => a.skill === id).slice(-1).some(independent) && candidates.some(i => i.skill === id));
        if (prerequisite) {
          why = `Aparecieron dos dificultades en ${skillById[focus].title.toLowerCase()}. Comprobaremos primero una base: ${skillById[prerequisite].title.toLowerCase()}.`;
          focus = prerequisite;
        }
      }
      if (!why) why = last.correct ? 'Lo resolviste con ayuda. Ahora probaremos otra variante para comprobar qué puedes hacer por tu cuenta.'
        : 'La respuesta anterior señala un punto por revisar. Practicaremos esa habilidad con otro caso y apoyo disponible.';
    }
    const dueIds = new Set(dueItems(state, now).map(row => row.item.id));
    const delayedVariant = item => !skillEvidence(state, item.skill, now).retained && state.attempts.some(a =>
      a.skill === item.skill && independent(a) && a.itemId !== item.id && a.family !== item.family && new Date(now) - new Date(a.at) >= DAY)
      && !state.attempts.some(a => a.skill === item.skill && a.family === item.family && independent(a));
    let pool = focus ? candidates.filter(i => i.skill === focus) : candidates;
    if (!pool.length) { pool = candidates; focus = null; why = ''; }
    const ranked = pool.map(item => {
      const evidence = skillEvidence(state, item.skill, now);
      const previous = state.attempts.filter(a => a.itemId === item.id);
      const seenFamily = state.attempts.some(a => a.skill === item.skill && a.family === item.family && independent(a));
      const prerequisiteGap = skillById[item.skill].prerequisites.filter(id => !state.attempts.some(a => a.skill === id && independent(a))).length;
      const score = (focus ? 0 : evidence.attempts === 0 ? 45 : evidence.last && !evidence.last.correct ? 38 : 0)
        + (delayedVariant(item) ? 100 : 0) + (dueIds.has(item.id) ? 75 : 0) + (previous.length === 0 ? 24 : -previous.length * 4)
        + (!seenFamily ? 8 : 0) - Math.abs(item.level - evidence.level) * 15 - (focus ? 0 : prerequisiteGap * 22);
      return { item, score };
    }).sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
    const next = ranked[0].item;
    return { item: next, why: why || (delayedVariant(next) ? 'Ya pasó al menos un día desde un acierto sin pistas. Esta variante diferente permite comprobar qué recuerdas; todavía puedes pedir ayuda si la necesitas.'
      : dueIds.has(next.id) ? 'Tienes un repaso pendiente. Lo recuperaremos ahora antes de seguir con contenido nuevo.'
      : `Elegido para trabajar ${skillById[next.skill].title.toLowerCase()} con una exigencia acorde a la evidencia disponible. El nivel inicial es provisional.`) };
  }
  function activate(state, now) {
    const next = choose(state, now);
    state.session.current = next ? { itemId: next.item.id, token: uid(), why: next.why, assistance: [], draft: { answers: {}, note: '', confidence: '' }, submitted: false, attemptId: null } : null;
    if (!next) complete(state, now);
    return state;
  }
  function start(original, mode = 'practice', target = 8, now = new Date(), focus = null, pool = null) {
    if (!['practice', 'diagnostic', 'reviews', 'control'].includes(mode)) throw new Error('Modo no válido.');
    if (pool !== null && (!Array.isArray(pool) || !pool.length || pool.length > bank.activities.length || new Set(pool).size !== pool.length || pool.some(id => !Object.hasOwn(byId,id)))) throw new Error('Banco de sesión no válido.');
    if (mode === 'control' && !pool) throw new Error('La evaluación necesita una selección de actividades.');
    if (focus !== null && !skillById[focus]) throw new Error('Habilidad no válida.');
    if (original.session?.status === 'active') throw new Error('Ya hay una sesión activa. Continúa o ciérrala antes de comenzar otra.');
    const state = copy(original);
    state.session = { id: uid(), mode, focus, target: mode === 'diagnostic' ? bank.skills.length : Math.max(1, Math.min(24, Math.floor(Number(target) || 8))), startedAt: iso(now), status: 'active', current: null, completedAt: null };
    if (focus && mode === 'practice') state.session.target = Math.min(state.session.target, bank.activities.filter(item => item.skill === focus).length);
    if (pool) { state.session.pool = [...pool]; state.session.target = Math.min(state.session.target,pool.length); }
    state.updatedAt = iso(now);
    return activate(state, now);
  }
  function setDraft(original, draft, now = new Date()) {
    const state = copy(original), current = state.session?.current;
    if (!current || current.submitted) return state;
    const item = byId[current.itemId], answers = {};
    for (const field of item.fields) if (field.options.some(o => o.id === draft.answers?.[field.key])) answers[field.key] = draft.answers[field.key];
    current.draft = { answers, note: String(draft.note || '').slice(0, 5000), confidence: ['low', 'medium', 'high'].includes(draft.confidence) ? draft.confidence : '' };
    state.updatedAt = iso(now);
    return state;
  }
  function help(original, type = 'hint', now = new Date()) {
    if (original.session?.mode === 'control' && original.session.status === 'active') throw new Error('Las explicaciones se abrirán al cerrar la evaluación. Puedes finalizarla cuando quieras.');
    if (!['hint', 'lesson'].includes(type)) throw new Error('Ayuda no válida.');
    const state = copy(original), current = state.session?.current;
    if (current && !current.submitted && !current.assistance.includes(type)) current.assistance.push(type);
    state.updatedAt = iso(now);
    return state;
  }
  function grade(item, answers) {
    const criteria = item.fields.map(field => ({ key: field.key, label: field.label, correct: answers[field.key] === field.correct,
      chosen: field.options.find(o => o.id === answers[field.key])?.label || '', expected: field.options.find(o => o.id === field.correct).label, feedback: field.feedback }));
    return { correct: criteria.every(c => c.correct), partial: criteria.some(c => c.correct), criteria, firstError: criteria.find(c => !c.correct)?.key || null };
  }
  function submit(original, now = new Date()) {
    const state = copy(original), session = state.session, current = session?.current;
    if (!current || session.status !== 'active') throw new Error('No hay una actividad activa.');
    if (current.submitted) return state;
    const item = byId[current.itemId], draft = current.draft;
    if (!item.fields.every(field => field.options.some(o => o.id === draft.answers[field.key]))) throw new Error('Responde la decisión y el fundamento antes de comprobar.');
    const result = grade(item, draft.answers);
    const attempt = { id: current.token, sessionId: session.id, itemId: item.id, itemVersion: item.version, family: item.family, skill: item.skill, level: item.level,
      at: iso(now), answers: draft.answers, note: draft.note, confidence: draft.confidence, assistance: current.assistance,
      correct: result.correct, partial: result.partial, firstError: result.firstError,
      diagnosis: result.firstError ? { kind: 'structured-criterion', certainty: 'limited', skill: item.skill, criterion: result.firstError, text: result.firstError === 'answer' ? 'La decisión química no coincide con el criterio de este ejercicio.' : 'El fundamento seleccionado no sostiene la decisión correcta.' } : null };
    if (state.attempts.some(a => a.id === attempt.id)) return state;
    state.attempts.push(attempt);
    const previous = state.cards[item.id];
    const card = previous ? { ...previous, due: new Date(previous.due), ...(previous.last_review ? { last_review: new Date(previous.last_review) } : {}) } : FSRS.createEmptyCard(new Date(now));
    // El éxito asistido conserva una carga de repaso mayor y no aporta autonomía.
    const rating = !result.correct ? FSRS.Rating.Again : current.assistance.length ? FSRS.Rating.Hard : FSRS.Rating.Good;
    const scheduled = scheduler.next(card, new Date(now), rating);
    state.cards[item.id] = copy(scheduled.card);
    current.submitted = true;
    current.attemptId = attempt.id;
    state.updatedAt = iso(now);
    return state;
  }
  function complete(state, now) {
    const s = state.session;
    if (!s || s.status !== 'active') return state;
    s.status = 'complete'; s.completedAt = iso(now);
    const attempts = state.attempts.filter(a => a.sessionId === s.id);
    if (!state.sessions.some(row => row.id === s.id)) state.sessions.push({ id: s.id, startedAt: s.startedAt, completedAt: s.completedAt, mode: s.mode, attempted: attempts.length, independent: attempts.filter(independent).length });
    state.updatedAt = iso(now);
    return state;
  }
  function next(original, now = new Date()) {
    const state = copy(original), s = state.session;
    if (!s || s.status !== 'active') return state;
    if (!s.current?.submitted) throw new Error('Comprueba la respuesta antes de avanzar.');
    if (state.attempts.filter(a => a.sessionId === s.id).length >= s.target) return complete(state, now);
    state.updatedAt = iso(now);
    return activate(state, now);
  }
  function stop(original, now = new Date()) { return complete(copy(original), now); }
  return { bank, byId, skillById, createState, start, next, stop, submit, setDraft, help, grade, choose, skillEvidence, reviewInfo, dueItems, independent, DAY };
});
