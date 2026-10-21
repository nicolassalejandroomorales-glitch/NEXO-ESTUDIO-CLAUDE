/* Indicador único de state.timer. El reloj usa marcas temporales, nunca suma ticks. */
(() => {
  'use strict';
  const elapsed = (timer, now = Date.now()) => Math.max(0, Number(timer.elapsedBeforeMs) || 0) +
    (timer.status === 'running' && Number(timer.startedAt) > 0 ? Math.max(0, now - Number(timer.startedAt)) : 0);
  let instance;
  function mount(api) {
    if (instance) return instance;
    const dock = document.createElement('aside');
    dock.className = 'study-dock'; dock.hidden = true; dock.setAttribute('aria-label', 'Sesión de estudio');
    dock.innerHTML = '<button type="button" class="study-drag" aria-label="Mover cronómetro horizontalmente; usa las flechas">⠿</button><button type="button" class="study-open" aria-label="Abrir cronómetro completo"><span class="study-status"></span><time role="timer"></time></button><button type="button" class="study-toggle"></button><button type="button" class="study-fold" aria-label="Plegar cronómetro" aria-expanded="true">⌄</button>';
    const drag = dock.querySelector('.study-drag'), open = dock.querySelector('.study-open'), time = dock.querySelector('time');
    const status = dock.querySelector('.study-status'), toggle = dock.querySelector('.study-toggle'), fold = dock.querySelector('.study-fold');
    let x = null, folded = false, dragging = false;
    try { const prefs=JSON.parse(localStorage.getItem('nexo.study-dock.v1') || '{}'); x=Number.isFinite(prefs.x)?prefs.x:null; folded=!!prefs.folded; } catch { /* preferencias opcionales */ }
    const persist = () => { try { localStorage.setItem('nexo.study-dock.v1', JSON.stringify({x,folded})); } catch { /* sin almacenamiento */ } };
    function position() {
      if (x === null) x = Math.max(8, innerWidth - dock.offsetWidth - 12);
      x = Math.max(8, Math.min(x, innerWidth - dock.offsetWidth - 8));
      dock.style.left = `${x}px`;
    }
    function refresh() {
      const timer = api.getState().timer, active = timer.status === 'running' || timer.status === 'paused';
      dock.hidden = !active; document.body.classList.toggle('has-study-dock', active);
      document.documentElement.style.setProperty('--study-dock-space', active ? '64px' : '0px');
      if (!active) return;
      const running = timer.status === 'running';
      dock.dataset.status = timer.status; dock.classList.toggle('is-folded', folded);
      status.textContent = `${running ? 'Estudiando' : 'En pausa'} · ${api.subject(timer.subject)}`;
      const value=api.format(elapsed(timer)); if(time.textContent!==value) time.textContent=value;
      toggle.textContent=running?'Pausar':'Seguir'; toggle.setAttribute('aria-label',running?'Pausar sesión':'Reanudar sesión');
      fold.textContent=folded?'⌃':'⌄'; fold.setAttribute('aria-expanded',String(!folded));
      fold.setAttribute('aria-label',folded?'Desplegar cronómetro':'Plegar cronómetro');
      position();
    }
    function attach() { (document.fullscreenElement || document.body).append(dock); refresh(); }
    toggle.addEventListener('click', () => api.getState().timer.status === 'running' ? api.pause() : api.resume());
    open.addEventListener('click', api.open);
    fold.addEventListener('click', () => { folded=!folded;refresh();persist(); });
    drag.addEventListener('pointerdown', e => { dragging=true;drag.setPointerCapture(e.pointerId); });
    drag.addEventListener('pointermove', e => { if(dragging) {x=e.clientX-18;position();} });
    drag.addEventListener('pointerup', () => {dragging=false;persist();});
    drag.addEventListener('pointercancel', () => {dragging=false;});
    drag.addEventListener('keydown', e => { if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();x+=(e.key==='ArrowLeft'?-24:24);position();persist(); });
    document.addEventListener('fullscreenchange', attach);
    window.addEventListener('resize', position);
    window.addEventListener('pagehide', () => api.flush());
    document.addEventListener('visibilitychange', () => { if(document.hidden)api.flush();else refresh(); });
    // Las pestañas de invitado comparten la misma marca temporal, sin sumar sesiones.
    window.addEventListener('storage', e => {
      if(e.key!=='nexo-study-beta' || !e.newValue || !api.local())return;
      try {const incoming=JSON.parse(e.newValue).timer;if(incoming && ['idle','running','paused'].includes(incoming.status))api.adopt(incoming);} catch { /* dato externo inválido */ }
    });
    const ticker=setInterval(() => {if(!document.hidden)refresh();}, 250);
    instance={refresh,ticker};attach();return instance;
  }
  window.NexoStudyTimer=Object.freeze({elapsed,mount});
})();
