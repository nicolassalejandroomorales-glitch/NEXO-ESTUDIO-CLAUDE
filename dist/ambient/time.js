/* Ambient light follows local time with a five-minute update, never a permanent RAF loop. */
(() => {
  'use strict';
  const stops=[
    [0,[24,33,49]],[5,[36,46,64]],[7,[116,108,94]],
    [10,[146,160,146]],[16,[151,155,132]],[18,[173,122,101]],
    [20,[76,67,81]],[24,[24,33,49]]
  ];
  let interval=null;
  const mix=(a,b,t)=>a.map((value,index)=>Math.round(value+(b[index]-value)*t));
  function colorAt(hour) {
    const h=((Number(hour)||0)%24+24)%24;
    for(let i=1;i<stops.length;i+=1)if(h<=stops[i][0]) {
      const [start,a]=stops[i-1], [end,b]=stops[i];
      return mix(a,b,(h-start)/(end-start));
    }
    return stops[0][1];
  }
  // Pesos de luz continuos (suman 1). La sala pasa de una luz a otra sin saltos.
  const lightKeys=[[0,'night'],[5,'night'],[6.5,'dawn'],[9,'day'],[16.5,'day'],[18.5,'dusk'],[20.5,'night'],[24,'night']];
  function weightsAt(hour) {
    const h=((Number(hour)||0)%24+24)%24, w={dawn:0,day:0,dusk:0,night:0};
    for(let i=1;i<lightKeys.length;i+=1)if(h<=lightKeys[i][0]) {
      const [start,a]=lightKeys[i-1], [end,b]=lightKeys[i], t=(h-start)/(end-start);
      w[a]+=1-t; w[b]+=t; return w;
    }
    w.night=1; return w;
  }
  function applyHour(hour) {
    const [r,g,b]=colorAt(hour), w=weightsAt(hour), style=document.body.style;
    style.setProperty('--ambient-rgb',`${r} ${g} ${b}`);
    Object.entries(w).forEach(([key,value])=>style.setProperty(`--w-${key}`,value.toFixed(3)));
    document.body.dataset.nexoTime=hour<6?'night':hour<10?'morning':hour<17?'day':hour<20?'dusk':'night';
    document.body.dataset.nexoHour=(((Number(hour)||0)%24+24)%24).toFixed(2); // la Torre del Sauce lee la hora de aquí
  }
  function update(at=new Date()) {
    if(previewing)return;
    applyHour(at.getHours()+at.getMinutes()/60);
    document.body.classList.toggle('ambient-paused',document.hidden);
  }
  // Vista previa para probar la luz sin esperar: preview(22) salta con fundido corto;
  // timelapse() recorre 24 h en ~40 s. stopPreview() vuelve a la hora real.
  let previewing=false, previewTimer=null;
  function preview(hour) {
    stopPreview(); previewing=true; document.body.classList.add('ambient-preview'); applyHour(hour);
  }
  function timelapse(seconds=40,from=new Date().getHours()) {
    stopPreview(); previewing=true; document.body.classList.add('ambient-preview','ambient-timelapse');
    const started=performance.now(), tick=()=>{
      const p=(performance.now()-started)/(seconds*1000);
      if(p>=1){stopPreview();return;}
      applyHour((from+p*24)%24); previewTimer=setTimeout(tick,250);
    };
    tick();
  }
  function stopPreview() {
    if(previewTimer)clearTimeout(previewTimer); previewTimer=null; previewing=false;
    document.body.classList.remove('ambient-preview','ambient-timelapse'); update();
  }
  function start() {
    if(interval)return;
    update();
    // Primera pintura sin fundido; desde ahí, cada cambio de luz se funde durante 5 min.
    requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.add('ambient-live')));
    interval=setInterval(()=>{if(!document.hidden)update();},300000);
    document.addEventListener('visibilitychange',()=>update());
  }
  window.NexoAmbientTime=Object.freeze({colorAt,weightsAt,update,start,preview,timelapse,stopPreview});
})();
