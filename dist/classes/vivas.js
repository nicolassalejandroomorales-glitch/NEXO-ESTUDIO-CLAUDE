/* Clases Vivas: controlador académico reutilizable y presentación Estudio.
   Sin dependencias del Sótano, rutas, imágenes de cámara o servicios de IA. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ACTIVITY = { diagnostic: 'assessment', pretest: 'lesson', train: 'practice', practice: 'practice', placement: 'practice',
    challenge: 'practice', review: 'review', simulacro: 'assessment', transfer: 'assessment', rescue: 'rescue', detour: 'rescue', fix: 'rescue' };

  function create({ cls, api, mission }) {
    if (!cls?.missions?.length) throw new Error('La clase no tiene misiones.');
    if (mission && !cls.missions.some(m => m.id === mission)) throw new Error('Misión desconocida.');
    const session = window.NexoClassroom.sessionFor(api, cls.id);
    const pending = m => window.NexoClassroom.itemsOf(m).some(({ item }) => !session.answers[item.id]);
    const selected = mission || (cls.missions.some(m => m.id === session.mission) && session.mission) ||
      (cls.missions.find(pending) || cls.missions[0]).id;
    const checkpoint = () => { api.saveState(); api.flushState?.(); };
    const ready = Promise.resolve(window.NexoClassEvidence?.reconcile(api, cls)).catch(() => null);
    const studyTime = (concept, activity) => {
      if (concept) window.NexoActiveStudy?.begin(window.NexoAcademicBridge?.conceptOf(cls, concept), activity);
    };
    function submitResult(result) {
      const conceptId = result.conceptId || cls.missions.find(m => m.id === selected)?.concept || selected;
      return window.NexoClassEvidence.submit(api, cls,
        { id: result.itemId, type: result.type, concept: conceptId, source: result.source, slide: result.slide, gen: result.gen },
        { itemId: result.itemId, conceptId, missionId: result.station?.split(':')[1] || selected, stage: 'transfer', step: 5,
          correct: result.correct, hint: Boolean(result.assisted), retry: false, transfer: true, at: result.at });
    }
    function onBeat(beat) {
      if (beat.kind === 'question' || beat.kind === 'rescue') studyTime(beat.item?.concept || beat.m?.id, ACTIVITY[beat.stage] || 'rescue');
      else if (beat.kind === 'lesson' || beat.kind === 'step') studyTime(beat.block?.concept || beat.m?.id, 'lesson');
    }
    return { cls, api, session, mission: selected, ready, checkpoint, submitResult, onBeat, studyTime,
      destroy() { window.NexoActiveStudy?.stop(); checkpoint(); } };
  }

  // La futura presentación inmersiva consumirá create() y los mismos registros.
  // Hasta entonces solo se admite Estudio: no hay fallback que simule otro modo.
  function mount(host, opts) {
    if (opts.mode && opts.mode !== 'study') throw new Error('El Modo Inmersivo está pendiente.');
    const controller = create(opts), { cls, mission, api } = controller;
    let view = null, destroyed = false, finished = false, testing = false;
    host.classList.add('cv-study');
    host.innerHTML = `<header class="cv-header"><div><p>Sótano de Cristales · ${esc(opts.subject?.name || cls.subject)}</p>
      <h1>${esc(cls.title)}</h1><span>Modo Estudio</span></div><button type="button" class="au-mini" data-cv-exit>Guardar y salir</button></header>
      <div class="cv-content"></div>`;
    const content = host.querySelector('.cv-content');
    const leave = () => { controller.checkpoint(); opts.onExit?.(); };
    host.querySelector('[data-cv-exit]').addEventListener('click', leave);
    const station = extra => {
      view?.destroy();
      view = window.NexoStation.mount(content, { cls, mission, pet: opts.pet, onExit: leave,
        onResult: controller.submitResult, ...extra });
    };
    if (cls.stations?.includes(mission)) {
      controller.session.path = 'misiones'; controller.session.mission = mission;
      // El concepto del piloto se obtiene de sus datos, no de un escenario.
      const concept = cls.concepts?.find(c => c.mission === mission && !c.root)?.id || mission;
      controller.studyTime(concept, 'practice');
      station({});
    } else {
      view = window.NexoAula.mount(content, { cls, mission, api, pet: opts.pet,
        onBeat(beat) {
          finished = beat.kind === 'close';
          controller.onBeat(beat);
        },
        onExit(session) {
          const current = session.mission || mission, config = cls.demuestra?.[current];
          if (!finished || !config || testing) return leave();
          testing = true;
          station({ mission: current, only: 'demuestra', demuestra: config });
        } });
    }
    const onPageHide = () => controller.checkpoint();
    window.addEventListener('pagehide', onPageHide);
    controller.checkpoint();
    return { controller,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        window.removeEventListener('pagehide', onPageHide);
        view?.destroy(); controller.destroy(); host.replaceChildren(); host.classList.remove('cv-study');
      } };
  }
  window.NexoLivingClasses = Object.freeze({ create, mount, modes: Object.freeze({ study: 'implemented', immersive: 'planned' }) });
})();
