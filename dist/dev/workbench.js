/* Developer-only review surfaces; no user data is manufactured. */
(() => {
  'use strict';
  let frame=0;
  let visibilityHandler=null;
  const buttons=[
    ['Inicio','home'],['Aprender','learn'],['Orgánica 01','lesson/org-01'],
    ['Feedback · muestras','ui-lab/feedback'],['Rescate','rescue/org.lone-pair'],
    ['Revisiones','reviews'],['Errores','practice/errors'],
    ['Mapa de conceptos','knowledge'],['Bitácora','planner/calendar'],
    ['Perfil','profile'],['Mascota · estados','ui-lab/mascot'],['Rangos arcanos','knowledge'],
    ['Tienda','shop'],['Juegos','games'],
    ['Inspector académico','inspector'],['UI Lab','ui-lab'],['Rendimiento','performance']
  ];
  const link=([title,route])=>`<button type="button" data-dev-route="${route}">${title} <span aria-hidden="true">↗</span></button>`;
  function renderReview(app) {
    app.innerHTML=`<section class="page dev-workbench"><header class="page-header"><div><p class="eyebrow">DESARROLLO</p><h1>Review Center</h1></div></header><div class="dev-link-grid">${buttons.map(link).join('')}</div></section>`;
  }
  function renderUiLab(app,api) {
    const rooms=window.NexoRooms.rooms;
    const colors=[['Tinta','--ink-950'],['Papel','--paper-100'],['Bosque','--forest-600'],['Arcano','--arcane-500'],['Ámbar','--amber-500']];
    const rankFlame=window.NexoArcaneRanks?.flame||(()=>'<span aria-hidden="true">✦</span>');
    const sampleRank=level=>`<span class="dev-rank-item">${rankFlame(level)} <b>${['Sin rango','Principiante','Intermedio','Avanzado','Experto','Rey Mago'][level]}</b></span>`;
    app.innerHTML=`<section class="page dev-workbench"><header class="page-header"><div><p class="eyebrow">DESARROLLO</p><h1>UI Lab</h1></div></header>
      <section class="panel dev-panel"><h2>Fundamentos</h2><div class="dev-swatches">${colors.map(([name,token])=>`<div><i style="background:var(${token})"></i><b>${name}</b><code>${token}</code></div>`).join('')}</div><div class="dev-type"><h3>Título de habitación</h3><p>Texto de interfaz claro, de lectura continua y sin ornamentación innecesaria.</p><small>Detalle y metadatos académicos</small></div><div class="dev-specs"><span>Espaciado · 8 / 12 / 18 / 24 / 32 px</span><span>Radio · var(--radius-ui)</span><span>Elevación · var(--shadow-ui)</span></div></section>
      <section class="panel dev-panel"><h2>Materiales y habitaciones</h2><div class="dev-swatches">${Object.entries(rooms).map(([id,room])=>`<div><i style="background:${room.accent}"></i><b>${room.name}</b><code>${id} · ${room.material}</code></div>`).join('')}</div></section>
      <section class="panel dev-panel"><h2>Componentes</h2><div class="button-row"><button class="primary-btn" type="button">Primario</button><button class="secondary-btn" type="button">Secundario</button><button class="primary-btn" disabled>Inactivo</button></div><div class="dev-component-grid"><div class="dev-component-card"><h3>Tarjeta · tinta</h3><p>Superficie de navegación.</p><span class="dev-badge">En curso</span></div><div class="dev-component-card dev-paper"><h3>Panel · papel</h3><p>Superficie de lectura.</p><span class="dev-badge">Concepto</span></div></div><label class="field"><span>Campo de texto</span><input placeholder="Escribe una respuesta"></label><label class="field"><span>Selección</span><select><option>Opción visible</option></select></label><div class="progress-wrap"><div class="progress-label"><span>Progreso</span><strong>40%</strong></div><div class="progress-track"><span style="width:40%"></span></div></div><div class="dev-component-grid"><div class="dev-component-card" role="group" aria-label="Muestra de diálogo"><h3>Diálogo</h3><p>Acción con confirmación.</p><div class="button-row"><button class="secondary-btn" type="button">Cancelar</button><button class="primary-btn" type="button">Confirmar</button></div></div><div class="dev-component-card" role="group" aria-label="Muestra de panel lateral"><h3>Panel lateral</h3><p>Detalle contextual.</p><span class="dev-badge">Vista previa</span></div></div><p class="dev-toast-sample" role="status">Aviso · progreso guardado</p><p class="dev-tooltip-sample" role="note">Ayuda contextual visible</p></section>
      <section class="panel dev-panel"><h2>Estados</h2><div class="dev-state-grid"><p role="status">Carga: abriendo contenido…</p><p class="dev-state-error" role="alert">Error: la vista no está disponible.</p><p class="dev-state-success">Guardado: cambios sincronizados.</p></div></section>
      <section class="panel dev-panel" id="dev-feedback"><h2>Académico · feedback</h2><div class="dev-rank-grid">${[0,1,2,3,4,5].map(sampleRank).join('')}</div><div class="dev-component-grid"><div class="dev-paper dev-component-card"><h3>Evidencia</h3><p>Dos casos distintos resueltos sin pista.</p><span class="dev-badge">Verificada</span></div><div class="dev-component-card"><h3>Error conceptual</h3><p>Se señaló el primer eslabón equivocado. El siguiente intento exige una variante.</p><span class="dev-badge">Revisión pendiente</span></div></div><div class="dev-component-grid"><div class="dev-feedback incorrect"><b>Decisión no coincidente</b><p>Qué falló → por qué → qué comparar ahora.</p></div><div class="dev-feedback correct"><b>Error reparado</b><p>La variante nueva aún debe resolverse sin pauta.</p></div></div><div class="dev-component-card"><h3>Revisión</h3><p>Concepto: par libre · Recuperación diferida · No mostrar solución antes del intento.</p></div></section>
      <section class="panel dev-panel"><h2>Movimiento</h2><div class="dev-state-grid"><p>Página · transición corta</p><p>Arcano · brillo contenido</p><p>Físico · leve flotación</p><p>Reducido · sin movimiento decorativo</p></div><p>Preferencia actual: ${document.body.dataset.nexoAmbientMotion||'normal'}.</p></section>
      <section class="panel dev-panel" id="dev-mascot"><h2>Mascota y equipamiento</h2>${api.avatarMarkup({large:true})}<div class="dev-state-grid"><p>Habitación · ${document.body.dataset.nexoRoom||'home'}</p><p>Actividad · Idle (rig disponible)</p><p>Ranuras · cabeza / cara / cuerpo / espalda / cola / aura / fondo / manos</p><p>Fallback · composición Canvas cuando el rig carece de anclas</p></div></section>
      <section class="panel dev-panel"><h2>Habitaciones y ajustes</h2><div class="dev-swatches">${Object.entries(rooms).filter(([id])=>['home','learn','games','profile'].includes(id)).map(([id,room])=>`<div><i style="background:${room.accent}"></i><b>${room.name}</b><code>${id}</code></div>`).join('')}</div><p>Calidad: ${window.NexoPerformance.snapshot().quality} · Partículas: ${document.body.dataset.nexoParticles||'low'}.</p></section></section>`;
    const section=location.hash.split('/')[2];
    if(['feedback','mascot'].includes(section))setTimeout(()=>document.getElementById(`dev-${section}`)?.scrollIntoView({block:'start'}),60);
  }
  function renderPerformance(app) {
    const current=window.NexoPerformance.snapshot();
    app.innerHTML=`<section class="page dev-workbench"><header class="page-header"><div><p class="eyebrow">DESARROLLO</p><h1>Rendimiento</h1></div></header><section class="panel dev-panel"><dl class="dev-metrics"><div><dt>FPS visible</dt><dd data-dev-fps>—</dd></div><div><dt>Habitación</dt><dd data-dev-room>${document.body.dataset.nexoRoom||'—'}</dd></div><div><dt>Calidad efectiva</dt><dd>${current.quality}</dd></div><div><dt>Partículas visibles</dt><dd data-dev-particles>${current.particlesOnScreen}</dd></div><div><dt>Animaciones activas</dt><dd data-dev-animations>${current.activeAnimations}</dd></div><div><dt>Instancias Rive</dt><dd data-dev-rive>${current.riveInstances}</dd></div><div><dt>Recursos cargados</dt><dd>${performance.getEntriesByType('resource').length}</dd></div><div><dt>Memoria JS</dt><dd>${performance.memory ? `${Math.round(performance.memory.usedJSHeapSize/1048576)} MiB` : 'No disponible en este navegador'}</dd></div></dl></section></section>`;
    const fpsNode=app.querySelector('[data-dev-fps]');
    let count=0,last=performance.now();
    function tick(now) {
      count+=1;
      if(now-last>=1000) {
        fpsNode.textContent=String(Math.round(count*1000/(now-last)));
        const sample=window.NexoPerformance.snapshot();
        app.querySelector('[data-dev-particles]').textContent=String(sample.particlesOnScreen);
        app.querySelector('[data-dev-animations]').textContent=String(sample.activeAnimations);
        app.querySelector('[data-dev-rive]').textContent=String(sample.riveInstances);
        count=0; last=now;
      }
      frame=requestAnimationFrame(tick);
    }
    visibilityHandler=() => {
      if(document.hidden) { if(frame)cancelAnimationFrame(frame); frame=0; fpsNode.textContent='Pausado'; }
      else if(!frame) { count=0; last=performance.now(); frame=requestAnimationFrame(tick); }
    };
    document.addEventListener('visibilitychange',visibilityHandler);
    visibilityHandler();
  }
  function cleanup() {
    if(frame)cancelAnimationFrame(frame);
    frame=0;
    if(visibilityHandler)document.removeEventListener('visibilitychange',visibilityHandler);
    visibilityHandler=null;
  }
  window.NexoWorkbench=Object.freeze({renderReview,renderUiLab,renderPerformance,cleanup});
})();
