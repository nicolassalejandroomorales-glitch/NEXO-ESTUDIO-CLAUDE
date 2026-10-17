/* Global graphics profile. Ambient decoration never owns a permanent frame loop. */
(() => {
  'use strict';
  const qualityValues=['auto','low','balanced','high'];
  const particleValues=['none','low','high'];
  const motionValues=['reduced','normal','rich'];
  const mascotValues=['reduced','full'];
  const points=[[13,18],[78,24],[42,12],[88,71],[9,67],[55,78],[28,44],[68,54],[33,88],[93,38]];
  const roomCaps={home:10,learn:2,games:7,profile:8,shop:5,planner:2};
  let currentSettings={};
  let active=null;
  let started=false;
  const pick=(value,values,fallback)=>values.includes(value)?value:fallback;
  function resolve(settings={},environment={}) {
    const reduced=Boolean(environment.reducedMotion);
    const cores=Number(environment.cores)||4;
    const memory=Number(environment.memory)||4;
    const width=Number(environment.width)||1024;
    const requested=pick(settings.graphicsQuality,qualityValues,'auto');
    const quality=requested==='auto'?(cores<=2||memory<=2||width<380?'low':cores>=8&&memory>=8&&width>=1000?'high':'balanced'):requested;
    const particles=pick(settings.particles,particleValues,'low');
    const ambientMotion=reduced||settings.motion===false?'reduced':pick(settings.ambientMotion,motionValues,'normal');
    const mascotMotion=reduced||settings.motion===false?'reduced':pick(settings.mascotMotion,mascotValues,'full');
    return {requested,quality,particles,ambientMotion,mascotMotion,reduced};
  }
  function environment() {
    return {cores:navigator.hardwareConcurrency,memory:navigator.deviceMemory,width:innerWidth,
      reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
  }
  function drawParticles() {
    const root=document.querySelector('.ambient-particles');
    if(!root||!active)return;
    const room=document.body.dataset.nexoRoom||'home';
    const wanted=active.particles==='none'?0:active.particles==='low'?4:10;
    const cap=active.quality==='low'?2:active.quality==='balanced'?6:10;
    const count=document.hidden?0:Math.min(wanted,cap,roomCaps[room]??4);
    if(root.children.length===count)return;
    root.replaceChildren();
    for(let i=0;i<count;i+=1) {
      const particle=document.createElement('i');
      particle.className='ambient-particle';
      particle.style.left=`${points[i][0]}%`;
      particle.style.top=`${points[i][1]}%`;
      particle.style.animationDelay=`-${i*0.7}s`;
      root.append(particle);
    }
  }
  function apply(settings={}) {
    currentSettings=settings;
    active=resolve(settings,environment());
    document.body.dataset.nexoQuality=active.quality;
    document.body.dataset.nexoAmbientMotion=active.ambientMotion;
    document.body.dataset.nexoMascotMotion=active.mascotMotion;
    drawParticles();
    return active;
  }
  function start() {
    if(started)return;
    started=true;
    document.addEventListener('visibilitychange',drawParticles);
    window.addEventListener('resize',()=>apply(currentSettings),{passive:true});
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',()=>apply(currentSettings));
  }
  function snapshot() {
    return {...active,particlesOnScreen:document.querySelectorAll('.ambient-particle').length,
      riveInstances:document.querySelectorAll('canvas[data-engine="rive"],canvas[data-engine="rive+layers"]').length,
      activeAnimations:document.getAnimations().filter(animation=>animation.playState==='running').length};
  }
  window.NexoPerformance=Object.freeze({resolve,apply,start,snapshot,drawParticles});
})();
