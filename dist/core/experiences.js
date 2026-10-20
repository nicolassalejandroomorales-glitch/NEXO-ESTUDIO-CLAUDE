/* Historial durable de experiencias. meta ya viaja en el almacenamiento existente. */
(() => {
  'use strict';
  const fresh = () => ({ version: 2, status: 'pending', rewarded: false, sections: {}, news: 0 });
  const clone = value => JSON.parse(JSON.stringify(value));
  const validStatus = value => ['pending', 'shown', 'skipped', 'done'].includes(value);
  const firstDate = (...dates) => dates.filter(x => typeof x === 'string' && !Number.isNaN(Date.parse(x))).sort()[0] || null;
  const newsVersion = value => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
  function mergeTutorial(a = {}, b = {}) {
    const terminal = [a, b].filter(x => ['done', 'skipped'].includes(x.status));
    const chosen = terminal.sort((x, y) => (firstDate(x.finishedAt) || '').localeCompare(firstDate(y.finishedAt) || ''))[0];
    const status = chosen?.status || ([a, b].some(x => x.status === 'shown') ? 'shown' : 'pending');
    const sections = {};
    for (const id of ['clases', 'juegos', 'organizacion', 'perfil']) if (a.sections?.[id] || b.sections?.[id]) sections[id] = true;
    return { ...fresh(), status, rewarded: !!(a.rewarded || b.rewarded),
      sections, news: Math.max(newsVersion(a.news), newsVersion(b.news)),
      shownAt: firstDate(a.shownAt, b.shownAt), finishedAt: firstDate(chosen?.finishedAt),
      migrated: !!(a.migrated || b.migrated) };
  }
  function hasProgress(raw) {
    const lists = ['sessions', 'completedLessons', 'errors', 'absences', 'claimedChallenges'];
    const maps = ['practice', 'mastery', 'organicProgress', 'classSessions', 'classEvidence', 'guides', 'exams', 'labs'];
    return lists.some(k => Array.isArray(raw[k]) && raw[k].length) || maps.some(k => Object.keys(raw[k] || {}).length)
      || Object.values(raw.academicIntelligence || {}).some(x => Array.isArray(x) && x.length)
      || Object.values(raw.grades || {}).some(x => Array.isArray(x?.components) && x.components.some(c => c?.grade !== '' && c?.grade != null))
      || (Array.isArray(raw.inventory) && raw.inventory.some(item => !['species-pig', 'scene-ruins'].includes(item)))
      || Number(raw.xp) > 0 || Number(raw.coins) > 0 || (Array.isArray(raw.shop?.owned) && raw.shop.owned.length > 0)
      || (!raw.meta?.experiences && !!raw.mascot?.kind);
  }
  function normalize(raw) {
    const local = raw.tutorial || {}, saved = raw.meta?.experiences?.tutorial || {};
    let tutorial = mergeTutorial(validStatus(local.status) ? local : {}, validStatus(saved.status) ? saved : {});
    if (tutorial.status === 'pending' && hasProgress(raw)) tutorial = { ...tutorial, status: 'shown', migrated: true };
    const cinematics = {};
    for (const [id, record] of Object.entries(raw.meta?.experiences?.cinematics || {})) {
      if (/^[a-z0-9][a-z0-9._-]{0,95}$/i.test(id) && ['shown', 'done', 'skipped'].includes(record?.status)) cinematics[id] = clone(record);
    }
    return { version: 1, tutorial, cinematics };
  }
  function mirror(state) {
    state.meta ||= {};
    state.meta.experiences = { version: 1, tutorial: clone(state.tutorial), cinematics: state.meta.experiences?.cinematics || {} };
  }
  const key = owner => `nexo-experiences-v1:${owner}`;
  function hydrate(state, owner, { legacyCursor = false } = {}) {
    const result = normalize(state);
    let journal = {};
    try { journal = JSON.parse(window.NexoStorage.getItem(key(owner)) || '{}'); } catch (_) { /* conservar estado principal */ }
    result.tutorial = mergeTutorial(result.tutorial, journal?.tutorial || {});
    if (legacyCursor && result.tutorial.status === 'pending') result.tutorial = { ...result.tutorial, status: 'shown', migrated: true };
    for (const [id, record] of Object.entries(journal?.cinematics || {})) {
      if (!/^[a-z0-9][a-z0-9._-]{0,95}$/i.test(id) || !['shown', 'done', 'skipped'].includes(record?.status)) continue;
      const current = result.cinematics[id];
      if (!current || current.status === 'shown') result.cinematics[id] = record;
    }
    state.tutorial = result.tutorial;
    state.meta ||= {}; state.meta.experiences = result;
    return state;
  }
  function persist(state, owner) {
    mirror(state);
    // El registro se escribe antes de mostrar nada; si falla se cancela el inicio.
    window.NexoStorage.setItem(key(owner), JSON.stringify(state.meta.experiences));
  }
  function startTutorial(state, owner) {
    hydrate(state, owner);
    if (state.tutorial.status !== 'pending') return false;
    const before = clone(state.tutorial);
    state.tutorial = { ...before, status: 'shown', shownAt: new Date().toISOString() };
    try { persist(state, owner); return true; }
    catch (_) { state.tutorial = before; mirror(state); return false; }
  }
  function finishTutorial(state, owner, status) {
    if (!['done', 'skipped'].includes(status) || state.tutorial.status !== 'shown') return;
    state.tutorial = { ...state.tutorial, status, finishedAt: new Date().toISOString() };
    persist(state, owner);
  }
  // Preparado para acontecimientos narrativos. El reproductor solo recibe controles,
  // nunca una API de misiones/recompensas. archive() alimenta el futuro archivo visual.
  function createCinematics({ getState, owner, save }) {
    const catalog = new Map(); let active = null;
    const records = () => { const state = getState(); hydrate(state, owner()); return state.meta.experiences.cinematics; };
    function play(id, manual) {
      const entry = catalog.get(id); if (!entry || active) return false;
      const state = getState(), identity = owner(), seen = records()[id];
      if (manual ? !seen : (seen || !entry.when(state))) return false;
      if (!manual) { state.meta.experiences.cinematics[id] = { status: 'shown', shownAt: new Date().toISOString() }; persist(state, identity); save(); }
      const token = {}; active = token;
      const end = status => {
        if (active !== token) return;
        active = null;
        if (manual || owner() !== identity) return;
        const current = getState(); hydrate(current, identity);
        current.meta.experiences.cinematics[id] = { ...current.meta.experiences.cinematics[id], status, finishedAt: new Date().toISOString() };
        persist(current, identity); save();
      };
      try { entry.render({ manual, finish: () => end('done'), skip: () => end('skipped') }); }
      catch (error) { active = null; throw error; }
      return true;
    }
    return { register({ id, title, when, render }) {
      if (!/^[a-z0-9][a-z0-9._-]{0,95}$/i.test(id) || catalog.has(id) || typeof when !== 'function' || typeof render !== 'function') throw new Error('Cinemática inválida o duplicada');
      catalog.set(id, { title, when, render });
    }, trigger: id => play(id, false), replay: id => play(id, true),
    archive: () => Object.entries(records()).filter(([id]) => catalog.has(id)).map(([id, history]) => ({ id, title: catalog.get(id).title, ...clone(history) })) };
  }
  window.NexoExperiences = { fresh, normalize, mergeTutorial, hydrate, mirror, persist, startTutorial, finishTutorial, createCinematics };
})();
