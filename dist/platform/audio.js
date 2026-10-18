/* Locally generated, optional audio. No sound starts without a user gesture. */
(() => {
  'use strict';
  const sprite={click:[0,80],confirm:[100,150],purchase:[280,200],equip:[510,120],error:[650,180]};
  const tones={click:[540,690],confirm:[570,810],purchase:[390,570,790],equip:[640,880],error:[260,180]};
  const rooms={home:'home',learn:'learn',lesson:'learn',subject:'learn',subjects:'learn',library:'learn',
    knowledge:'learn',reviews:'learn',rescue:'learn',practice:'learn',
    games:'games',profile:'profile',mascot:'profile',stats:'profile',settings:'profile',
    hub:'planner',planner:'planner',timer:'planner',shop:'profile'};
  let settings={sound:false,sfxVolume:.4,music:false,musicVolume:.15,ambient:false,ambientVolume:.12};
  let room='home',gesture=false,hidden=typeof document!=='undefined'&&document.hidden;
  let sfx=null,ambient=null,music=null,loading=null,generation=0;
  /* Efectos largos en archivo (más ricos que el sprite): apertura del grimorio y cambio de página. */
  const files={grimoire:['assets/audio/grimoire-open.webm','assets/audio/grimoire-open.mp3'],page:['assets/audio/page-turn.webm','assets/audio/page-turn.mp3']};
  const fileVolume={grimoire:1,page:.55};
  const fileHowls={};
  function fileHowl(name) {
    if(!fileHowls[name]&&window.Howl)fileHowls[name]=new window.Howl({src:files[name],volume:settings.sfxVolume*fileVolume[name],preload:true});
    return fileHowls[name];
  }
  function wav(pcm,rate) {
    const bytes=new Uint8Array(44+pcm.length*2),view=new DataView(bytes.buffer);
    const label=(at,value)=>[...value].forEach((char,i)=>bytes[at+i]=char.charCodeAt(0));
    label(0,'RIFF');view.setUint32(4,bytes.length-8,true);label(8,'WAVEfmt ');
    view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
    view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);
    pcm.forEach((sample,i)=>view.setInt16(44+i*2,sample,true));
    let raw='';for(let i=0;i<bytes.length;i++)raw+=String.fromCharCode(bytes[i]);
    return 'data:audio/wav;base64,'+btoa(raw);
  }
  function wavSprite() {
    const rate=12000,pcm=new Int16Array(10800);
    for(const [name,[start,duration]] of Object.entries(sprite)) {
      const freqs=tones[name],samples=Math.floor(duration*rate/1000);
      for(let i=0;i<samples;i++) {
        const t=i/rate,fade=Math.sin(Math.PI*i/samples);
        const freq=freqs[Math.min(freqs.length-1,Math.floor(i/samples*freqs.length))];
        pcm[Math.floor(start*rate/1000)+i]=Math.round(Math.sin(2*Math.PI*freq*t)*fade*5600);
      }
    }
    return wav(pcm,rate);
  }
  /* Periodic waves end at zero crossings, avoiding a click at loop boundaries. */
  function wavLoop(kind,scene) {
    const rate=8000,seconds=4,samples=rate*seconds,pcm=new Int16Array(samples);
    const base={home:110,profile:98,planner:123,games:146}[scene]||110;
    for(let i=0;i<samples;i++) {
      const t=i/rate,edge=Math.sin(Math.PI*i/samples)**2;
      let sample;
      if(kind==='ambient') {
        const breath=Math.sin(2*Math.PI*.25*t);
        sample=(Math.sin(2*Math.PI*base*t)*.4+Math.sin(2*Math.PI*(base*1.5)*t)*.18)*(.55+.3*breath);
      } else {
        const chord=[1,1.25,1.5],pulse=.55+.2*Math.sin(2*Math.PI*.5*t);
        sample=chord.reduce((sum,mult,index)=>sum+Math.sin(2*Math.PI*base*mult*t)/(index+2),0)*pulse;
      }
      pcm[i]=Math.round(sample*edge*(kind==='ambient'?1700:2250));
    }
    return wav(pcm,rate);
  }
  async function init() {
    if(sfx)return sfx;
    if(!loading)loading=(async()=>{
      await window.NexoLoader.script('./vendor/howler/howler.min.js');
      if(!window.Howl)return null;
      sfx=new window.Howl({src:[wavSprite()],format:['wav'],sprite,volume:settings.sfxVolume,preload:true});
      if(settings.sound)Object.keys(files).forEach(fileHowl);   // precarga para que la apertura suene a tiempo
      return sfx;
    })().catch(()=>{loading=null;return null;});
    return loading;
  }
  function unloadLoop(loop) {if(loop){loop.stop();loop.unload();}}
  function stopLoops() {generation++;unloadLoop(ambient);unloadLoop(music);ambient=null;music=null;}
  function reconcile() {
    if(!gesture||hidden||(!settings.ambient&&!settings.music)) {stopLoops();return;}
    const wanted=++generation;
    init().then(()=>{
      if(wanted!==generation||hidden||!gesture||!window.Howl)return;
      if(room==='learn'||room==='games') {stopLoops();return;}
      if(settings.ambient) {
        if(!ambient||ambient._nexoRoom!==room) {
          unloadLoop(ambient);
          ambient=new window.Howl({src:[wavLoop('ambient',room)],format:['wav'],loop:true,
            volume:settings.ambientVolume,preload:true});ambient._nexoRoom=room;ambient.play();
        } else ambient.volume(settings.ambientVolume);
      } else {unloadLoop(ambient);ambient=null;}
      if(settings.music) {
        if(!music||music._nexoRoom!==room) {
          unloadLoop(music);
          music=new window.Howl({src:[wavLoop('music',room)],format:['wav'],loop:true,
            volume:settings.musicVolume,preload:true});music._nexoRoom=room;music.play();
        } else music.volume(settings.musicVolume);
      } else {unloadLoop(music);music=null;}
    }).catch(()=>{});
  }
  function configure(next={}) {
    const bounded=(value,fallback)=>Math.max(0,Math.min(1,Number.isFinite(Number(value))?Number(value):fallback));
    settings={sound:Boolean(next.sound),sfxVolume:bounded(next.sfxVolume??next.volume,.4),
      ambient:Boolean(next.ambient),ambientVolume:bounded(next.ambientVolume,.12),
      music:Boolean(next.music),musicVolume:bounded(next.musicVolume,.15)};
    if(sfx)sfx.volume(settings.sound?settings.sfxVolume:0);
    Object.entries(fileHowls).forEach(([name,howl])=>howl.volume(settings.sound?settings.sfxVolume*fileVolume[name]:0));
    reconcile();
  }
  function activate() {gesture=true;if(settings.sound)init();reconcile();}
  function setRoom(route) {
    const next=rooms[Array.isArray(route)?route[0]:route]||'home';
    if(next===room)return;
    room=next;stopLoops();reconcile();
  }
  function play(name='click',next) {
    if(next)configure(next);
    activate();
    if(!settings.sound||hidden||(!sprite[name]&&!files[name]))return;
    init().then(sound=>{
      if(!settings.sound||hidden)return;
      if(files[name]) {const howl=fileHowl(name);howl?.volume(settings.sfxVolume*fileVolume[name]);howl?.play();return;}
      if(sound)sound.play(name);
    }).catch(()=>{});
  }
  function playFeedback(next) {play('confirm',next);}
  function onVisibility() {hidden=document.hidden;reconcile();}
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',onVisibility);
  function dispose() {stopLoops();sfx?.unload();sfx=null;Object.keys(fileHowls).forEach(name=>{fileHowls[name].unload();delete fileHowls[name];});loading=null;gesture=false;}
  window.NexoAudio={init,configure,activate,setRoom,play,playFeedback,dispose,
    get settings(){return {...settings,room,gesture,hidden,ambientPlaying:Boolean(ambient),musicPlaying:Boolean(music)};}};
})();
