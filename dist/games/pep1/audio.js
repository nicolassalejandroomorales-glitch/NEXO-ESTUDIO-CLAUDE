/* =====================================================================
   AUDIO v3: música estilo "chiptune" (inspirada en el GÉNERO de las bandas sonoras de juegos indie como Undertale:
   ondas cuadradas, bajo saltarín, arpegios, batería con golpe, melodías pegajosas). Todas las melodías son ORIGINALES
   para Nexo: no se copia ni se imita ninguna canción existente.
   Cómo se arma una melodía: cada sección tiene acordes y "motivos". Un motivo dice qué nota del ACORDE tocar
   (0 = raíz, 1 = tercera, 2 = quinta, 3 = raíz arriba…), así la melodía siempre calza con la armonía y se repite como un gancho.
   ===================================================================== */
(function(){
const P1 = window.P1 = window.P1 || {};
const rand=(a,b)=>a+Math.random()*(b-a);
const mtof=m=>440*Math.pow(2,(m-69)/12);
const SND={ctx:null,on:true,layers:{},mode:'calm',phase:1,song:'mapa',step:0,next:0,beat:0,waves:{}};

/* Acordes (semitonos sobre la tónica). Menor: i iv v V VI III VII bII · Mayor: I ii iii IV V vi */
const CH={i:[0,3,7],iv:[5,8,12],V:[7,11,14],VI:[8,12,15],III:[3,7,10],VII:[10,14,17],bII:[1,5,8],
          I:[0,4,7],ii:[2,5,9],iii:[4,7,11],IV:[5,9,12],Vm:[7,11,14],vi:[9,12,16]};
/* Motivos: [paso dentro de 2 compases (0-31), nota del acorde, duración, ajuste en semitonos] */
const M={
  // Trimetilamina: saltarín, burlón, con silencios
  aminaA:[[0,3,2],[3,2,1],[4,3,2],[8,1,2],[10,2,2],[12,0,4],[18,3,2],[20,4,2,-1],[22,4,2],[24,3,4],[28,2,4]],
  aminaB:[[0,0,1],[2,1,1],[4,2,1],[6,3,2],[8,2,2],[10,3,2],[12,4,4],[16,5,2],[18,4,2],[20,3,2],[22,2,2],[24,3,8]],
  aminaC:[[0,4,2],[2,3,2],[4,2,2],[6,1,2],[8,0,6],[16,2,4],[20,1,4],[24,0,8]],
  // Ciclobutadieno: frenético, con cromatismos que "no saben dónde estar"
  cicloA:[[0,3,1],[1,3,1],[2,2,1],[4,3,2],[6,4,2],[8,3,1],[9,2,1],[10,1,2],[12,0,4],[16,3,1],[17,3,1],[18,4,1],[20,4,2,1],[22,5,2],[24,4,4],[28,3,4]],
  cicloB:[[0,5,4],[4,4,2],[6,3,2],[8,4,4],[12,2,4],[16,3,2],[18,4,2],[20,5,2],[22,6,2],[24,5,8]],
  cicloC:[[0,3,2],[2,2,2],[4,1,2],[6,0,2],[8,1,2],[10,2,2],[12,3,4],[16,0,16]],
  // Benceno: notas largas y solemnes (catedral)
  bencA:[[0,3,6],[6,4,2],[8,5,8],[16,4,4],[20,3,4],[24,2,8]],
  bencB:[[0,5,4],[4,4,4],[8,3,4],[12,4,4],[16,5,6],[22,6,2],[24,5,8]],
  bencC:[[0,3,4],[4,2,4],[8,1,4],[12,2,4],[16,0,16]],
  // Rey Amonio: gancho heroico-amenazante
  reyA:[[0,0,2],[2,0,1],[3,0,1],[4,3,4],[8,2,2],[10,3,2],[12,4,4],[16,3,2],[18,2,2],[20,1,2],[22,2,2],[24,0,8]],
  reyB:[[0,3,3],[3,4,1],[4,5,4],[8,4,2],[10,3,2],[12,2,4],[16,3,3],[19,4,1],[20,5,2],[22,6,2],[24,5,4],[28,4,4]],
  reyC:[[0,5,4],[4,4,4],[8,3,4],[12,2,2],[14,1,2],[16,0,12],[28,1,2,-1],[30,1,2]]
};
/* Canciones. key = tónica de la melodía (MIDI) · bpm por fase · secs: A y B (8 compases) · orden: cómo se encadenan
   bajo: 16 pasos (semitonos sobre la raíz, null = silencio) · bat: batería por fase (k bombo, s caja, h platillo)
   arpFase / armFase: desde qué fase entra el arpegio / la segunda voz */
const SONGS={
  // LOBBY: tranquilo y acogedor (Fa mayor), nada que ver con el combate
  mapa:{key:65,bpm:[96],orden:['A','B'],lead:.5,eco:true,mayor:true,
    secs:{A:{prog:['I','vi','IV','Vm','I','vi','ii','Vm'],mel:[[0,7,4],[4,9,2],[6,7,2],[8,4,4],[12,2,2],[14,4,2],[16,5,6],[22,4,2],[24,2,4],[28,0,4],
            [32,5,4],[36,9,2],[38,12,2],[40,11,4],[44,9,4],[48,7,8],[56,11,4],[60,14,4],[64,12,4],[68,11,2],[70,9,2],[72,7,4],[76,4,4],
            [80,9,6],[86,7,2],[88,5,4],[92,4,4],[96,2,4],[100,5,4],[104,9,4],[108,7,4],[112,7,8],[120,4,4],[124,2,4]]},
          B:{prog:['IV','Vm','iii','vi','IV','Vm','I','I'],mel:[[0,12,6],[6,11,2],[8,9,4],[12,5,4],[16,11,6],[22,9,2],[24,7,8],[32,9,4],[36,11,4],[40,12,4],[44,16,4],
            [48,14,8],[56,12,4],[60,9,4],[64,12,4],[68,14,4],[72,16,4],[76,17,4],[80,19,8],[88,17,4],[92,14,4],[96,16,8],[104,14,4],[108,12,4],[112,12,16]]}},
    bajo:[0,null,null,null,7,null,null,null,12,null,null,null,7,null,null,null],
    bat:[{k:'x.......x.......',s:'',h:'....x.......x...'}],arpFase:9},
  amina:{key:64,bpm:[150,164],orden:['A','A','B','A'],lead:.25,eco:true,
    secs:{A:{prog:['i','i','VI','VII','i','i','iv','V'],motivos:['aminaA','aminaA','aminaA','aminaC']},
          B:{prog:['iv','iv','i','i','VI','VII','V','V'],motivos:['aminaB','aminaB','aminaB','aminaC']}},
    bajo:[0,null,12,null,0,null,12,0,null,0,12,null,0,null,12,null],staccato:.5,
    bat:[{k:'x.....x...x.....',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},{k:'x.....x.x.x...x.',s:'....x.......x.xx',h:'xxx.xxx.xxx.xxx.'}],arpFase:2,armFase:2},
  ciclo:{key:60,bpm:[172,186],orden:['A','A','B','A'],lead:.125,eco:false,
    secs:{A:{prog:['i','bII','i','bII','iv','V','i','V'],motivos:['cicloA','cicloA','cicloA','cicloC']},
          B:{prog:['VI','VII','i','i','bII','bII','V','V'],motivos:['cicloB','cicloB','cicloB','cicloC']}},
    bajo:[0,0,12,0,0,12,0,12,0,0,12,0,1,13,1,12],staccato:.6,
    bat:[{k:'x...x...x...x...',s:'....x.......x...',h:'xxxxxxxxxxxxxxxx'},{k:'x.x.x...x.x.x.x.',s:'....x..x....x.xx',h:'xxxxxxxxxxxxxxxx'}],arpFase:1,armFase:2},
  benceno:{key:62,bpm:[152,166],orden:['A','B','A','B'],lead:.5,eco:true,
    secs:{A:{prog:['i','VI','III','VII','iv','i','V','V'],motivos:['bencA','bencA','bencA','bencC']},
          B:{prog:['VI','VI','VII','VII','i','i','V','V'],motivos:['bencB','bencB','bencB','bencC']}},
    bajo:[0,null,0,null,0,null,0,12,0,null,0,null,0,null,7,12],staccato:.8,
    bat:[{k:'x...x...x...x...',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},{k:'x.x.x.x.x.x.x.x.',s:'....x.......x...',h:'x.xxx.xxx.xxx.xx'}],arpFase:2,armFase:1},
  rey:{key:62,bpm:[142,158,174],orden:['A','A','B','A'],lead:.25,eco:true,
    secs:{A:{prog:['i','i','VI','VI','iv','iv','V','V'],motivos:['reyA','reyA','reyA','reyC']},
          B:{prog:['VI','VII','i','i','bII','bII','V','V'],motivos:['reyB','reyB','reyB','reyC']}},
    bajo:[0,null,0,0,12,null,0,0,0,null,0,0,12,null,7,null],staccato:.55,
    bat:[{k:'x..x..x.x..x..x.',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},
         {k:'x..x..x.x..x..x.',s:'....x.......x.x.',h:'xxxxxxxxxxxxxxxx'},
         {k:'x.xx.xx.x.xx.xx.',s:'....x..x....x.xx',h:'xxxxxxxxxxxxxxxx'}],arpFase:2,armFase:3}
};

/* ---------- Motor ---------- */
function onda(d){ // onda de pulso con "ciclo de trabajo" d (12,5 %, 25 % o 50 %): el sonido de consola
  const c=SND.ctx,n=64,re=new Float32Array(n),im=new Float32Array(n);
  for(let i=1;i<n;i++){re[i]=2/(i*Math.PI)*Math.sin(Math.PI*i*d);}
  return c.createPeriodicWave(re,im);
}
function init(){
  if(SND.ctx){ if(SND.ctx.state==='suspended') SND.ctx.resume(); return; }
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  const c=SND.ctx=new AC();
  for(const d of [.125,.25,.5]) SND.waves[d]=onda(d);
  const comp=c.createDynamicsCompressor(); comp.threshold.value=-12; comp.ratio.value=3.5; comp.connect(c.destination);
  SND.master=c.createGain(); SND.master.gain.value=SND.on?.55:0; SND.master.connect(comp);
  const len=c.sampleRate*1.4, ir=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);}
  SND.verb=c.createConvolver(); SND.verb.buffer=ir; const vg=c.createGain(); vg.gain.value=.16; SND.verb.connect(vg).connect(SND.master);
  // eco para la melodía (le da espacio, típico de estas bandas sonoras)
  SND.delay=c.createDelay(1); const fb=c.createGain(); fb.gain.value=.28; const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2600;
  SND.delay.connect(lp).connect(fb).connect(SND.delay); const dg=c.createGain(); dg.gain.value=.35; lp.connect(dg).connect(SND.master);
  SND.music=c.createGain(); SND.music.gain.value=.7; SND.music.connect(SND.master);
  SND.sfx=c.createGain(); SND.sfx.gain.value=.75; SND.sfx.connect(SND.master); SND.sfx.connect(SND.verb);
  for(const k of ['lead','harm','arp','bass','drums','pad']){
    const g=c.createGain(); g.gain.value=0; g.connect(SND.music); if(k==='lead'||k==='harm'||k==='pad') g.connect(SND.verb); if(k==='lead') g.connect(SND.delay); SND.layers[k]=g; }
  const nb=c.createBuffer(1,c.sampleRate,c.sampleRate),nd=nb.getChannelData(0); for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1; SND.noise=nb;
  SND.next=c.currentTime+.1; SND.step=0;
  setInterval(schedule,25);
  setMode(SND.mode);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) c.suspend(); else c.resume(); });
}
/* pulso: la voz principal. o = {duty, g, bus, vib (cents), slide (semitonos de entrada), sus (0-1)} */
function pulse(t,m,dur,o){
  const c=SND.ctx,osc=c.createOscillator(),v=c.createGain();
  osc.setPeriodicWave(SND.waves[o.duty||.5]); osc.frequency.value=mtof(m);
  if(o.slide){osc.frequency.setValueAtTime(mtof(m+o.slide),t);osc.frequency.exponentialRampToValueAtTime(mtof(m),t+.05);}
  if(o.vib&&dur>.2){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.6;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(o.vib,t+Math.min(.35,dur*.6));l.connect(lg).connect(osc.detune);l.start(t);l.stop(t+dur+.05);}
  const g=o.g||.08, sus=o.sus??.7, end=t+dur;
  v.gain.setValueAtTime(0,t); v.gain.linearRampToValueAtTime(g,t+.004); v.gain.linearRampToValueAtTime(g*sus,t+.07);
  v.gain.setValueAtTime(g*sus,Math.max(t+.07,end-.03)); v.gain.linearRampToValueAtTime(0,end);
  osc.connect(v).connect(o.bus); osc.start(t); osc.stop(end+.02);
}
function tri(t,m,dur,g,bus){const c=SND.ctx,o=c.createOscillator(),v=c.createGain();o.type='triangle';o.frequency.value=mtof(m);
  v.gain.setValueAtTime(g,t);v.gain.setValueAtTime(g,t+Math.max(.01,dur-.02));v.gain.linearRampToValueAtTime(0,t+dur);o.connect(v).connect(bus);o.start(t);o.stop(t+dur+.02);}
function noise(t,dur,o){
  const c=SND.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  s.buffer=SND.noise; f.type=o.ft||'highpass'; f.frequency.value=o.freq||6000; if(o.q) f.Q.value=o.q;
  g.gain.setValueAtTime(o.gain||.2,t); g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  s.connect(f).connect(g).connect(o.bus); s.start(t,Math.random()*.5); s.stop(t+dur+.02);
}
function tone(t,m,dur,o){ // efectos simples
  const c=SND.ctx,osc=c.createOscillator(),g=c.createGain();
  if(o.duty) osc.setPeriodicWave(SND.waves[o.duty]); else osc.type=o.type||'sine'; osc.frequency.value=mtof(m);
  const pk=o.gain||.2; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(pk,t+.004); g.gain.setValueAtTime(pk,t+Math.max(.005,dur-.04)); g.gain.linearRampToValueAtTime(0,t+dur);
  if(o.slide){osc.frequency.setValueAtTime(mtof(m),t);osc.frequency.exponentialRampToValueAtTime(mtof(m+o.slide),t+dur);}
  osc.connect(g).connect(o.bus); osc.start(t); osc.stop(t+dur+.03);
}
function kick(t,g,bus){const c=SND.ctx,o=c.createOscillator(),v=c.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.09);
  v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(v).connect(bus);o.start(t);o.stop(t+.24);}
function snare(t,g,bus){noise(t,.13,{ft:'highpass',freq:1400,gain:g*.6,bus});tone(t,55,.06,{duty:.5,gain:g*.25,slide:-7,bus});}
function hat(t,g,bus){noise(t,.03,{freq:9000,gain:g*.28,bus});}
function crash(t,g,bus){noise(t,1.1,{freq:5000,gain:g*.3,bus});}

const ext=ch=>[ch[0],ch[1],ch[2],ch[0]+12,ch[1]+12,ch[2]+12,ch[0]+24];
function schedule(){
  const c=SND.ctx; if(!c||c.state!=='running') return;
  const L=SND.layers;
  while(SND.next<c.currentTime+.12){
    const song=SONGS[SND.song]||SONGS.mapa, ph=Math.min(SND.phase,song.bpm.length), sd=60/song.bpm[ph-1]/4;
    const total=song.orden.length*128, gs=SND.step%total, secName=song.orden[Math.floor(gs/128)], sec=song.secs[secName];
    const t=SND.next, s=gs%128, bar=s>>4, b=s&15, ch=CH[sec.prog[bar]], E=ext(ch), K=song.key;
    const r0=ch[0]>6?ch[0]-12:ch[0];
    if(b===0) SND.beat=t;
    if(b===0&&s===0&&secName==='A'&&song.bat[0].s) crash(t,.45,L.drums);
    // acorde de fondo (suave, sostenido) — se oye sobre todo mientras respondes
    if(b===0) for(const n of ch) pulse(t,K-12+n,sd*15.5,{duty:.5,g:.018,sus:.8,bus:L.pad});
    // batería
    const P=song.bat[Math.min(SND.phase,song.bat.length)-1];
    if(P.k&&P.k[b]==='x') kick(t,.55,L.drums); if(P.s&&P.s[b]==='x') snare(t,.5,L.drums); if(P.h&&P.h[b]==='x') hat(t,b%4===0?.8:.5,L.drums);
    // bajo saltarín (onda triangular)
    const bo=song.bajo[b]; if(bo!==null&&bo!==undefined) tri(t,K-24+r0+bo,sd*(song.staccato||.85),.24,L.bass);
    // arpegio de consola
    if(SND.phase>=song.arpFase){ const n=E[[0,1,2,3,2,1][b%6]]; pulse(t,K+n,sd*.9,{duty:.125,g:.05,sus:.5,bus:L.arp}); }
    // melodía (y segunda voz una tercera abajo)
    const notas=[];
    if(sec.mel){ for(const [st,n,len] of sec.mel) if(st===s) notas.push([n,len,null]); }
    else { const pair=Math.floor(bar/2), mot=M[sec.motivos[pair]], loc=s-pair*32;
      for(const [st,idx,len,adj] of mot) if(st===loc){ const chb=CH[sec.prog[pair*2+(st>=16?1:0)]], e=ext(chb); notas.push([e[Math.min(idx,6)]+(adj||0),len,e[Math.max(0,idx-1)]]); } }
    for(let [n,len,h] of notas){
      while(K+n>86) n-=12; if(h!==null) while(K+h>84) h-=12;
      pulse(t,K+n,sd*len*.95,{duty:song.lead,g:.2,vib:len>=4?14:0,slide:len>=4&&!song.mayor?-1:0,bus:L.lead});
      if(h!==null&&SND.phase>=(song.armFase||9)) pulse(t,K+h,sd*len*.9,{duty:.5,g:.07,bus:L.harm});
      if(song.mayor) pulse(t,K+n-12,sd*len*.9,{duty:.25,g:.02,bus:L.harm});
    }
    SND.next+=sd; SND.step++;
  }
}
function setMode(mode){
  SND.mode=mode; if(!SND.ctx) return;
  const song=SONGS[SND.song]||SONGS.mapa, z={lead:0,harm:0,arp:0,bass:0,drums:0,pad:0};
  const mix={
    // respondiendo: sigue el ritmo, la melodía baja para no distraer
    calm:{lead:song.mayor?.9:.45,harm:song.mayor?.7:.2,arp:.55,bass:.75,drums:song.mayor?.6:.45,pad:1},
    battle:{lead:1,harm:.9,arp:.8,bass:1,drums:1,pad:.5},
    end:{...z,pad:.9,lead:.25}, silent:z}[mode]||z;
  const now=SND.ctx.currentTime;
  for(const k in mix) SND.layers[k].gain.setTargetAtTime(mix[k],now,mode==='battle'?.1:.35);
}
function setSong(id){
  if(SND.song===id) return;
  SND.song=id; SND.step=0; SND.phase=1;
  if(SND.ctx){ for(const k in SND.layers) SND.layers[k].gain.setTargetAtTime(0,SND.ctx.currentTime,.05); SND.next=SND.ctx.currentTime+.3; setTimeout(()=>setMode(SND.mode),250); }
}
function setPhase(n){ SND.phase=n; if(SND.ctx) crash(SND.ctx.currentTime+.02,.7,SND.layers.drums); setMode(SND.mode); }
function toggle(){ SND.on=!SND.on; if(SND.master) SND.master.gain.setTargetAtTime(SND.on?.55:0,SND.ctx.currentTime,.05); return SND.on; }
function pulso(){ const c=SND.ctx; if(!c||!SND.on) return 0; const song=SONGS[SND.song]||SONGS.mapa, ph=Math.min(SND.phase,song.bpm.length), beat=60/song.bpm[ph-1];
  const d=((c.currentTime-SND.beat)%beat+beat)%beat; return Math.max(0,1-d/(beat*.5)); }

/* ---------- Voces del texto (cada personaje "habla" con su propio sonido) ---------- */
const VOCES={
  NEXO:{duty:.5,m:79,var:2,g:.035},
  TRIMETILAMINA:{duty:.25,m:55,var:3,g:.045},
  CICLOBUTADIENO:{duty:.125,m:82,var:6,g:.035},
  'BENCENO MALVADO':{duty:.125,m:50,var:1,g:.05},
  'REY AMONIO':{duty:.25,m:46,var:2,g:.055,slide:3}
};
function voz(quien){ if(!SND.ctx||!SND.on) return; const v=VOCES[quien]||VOCES.NEXO, t=SND.ctx.currentTime;
  tone(t,v.m+Math.round(rand(-v.var,v.var)),.045,{duty:v.duty,gain:v.g,slide:v.slide||0,bus:SND.sfx}); }

/* ---------- Efectos ---------- */
const now=()=>SND.ctx.currentTime, ok=()=>!!SND.ctx;
const sfx={
  blip(p=72){ if(!ok())return; tone(now(),p,.04,{duty:.5,gain:.03,bus:SND.sfx}); },
  select(){ if(!ok())return; tone(now(),79,.06,{duty:.25,gain:.08,bus:SND.sfx}); },
  pick(){ if(!ok())return; tone(now(),84,.04,{duty:.5,gain:.06,bus:SND.sfx}); },
  link(){ if(!ok())return; const t=now(); tone(t,76,.06,{duty:.25,gain:.07,bus:SND.sfx}); tone(t+.05,83,.08,{duty:.25,gain:.07,bus:SND.sfx}); },
  good(){ if(!ok())return; const t=now(); [72,76,79,84].forEach((n,i)=>tone(t+i*.06,n,.12,{duty:.25,gain:.08,bus:SND.sfx})); },
  bad(){ if(!ok())return; tone(now(),55,.3,{duty:.5,gain:.08,slide:-6,bus:SND.sfx}); },
  charge(){ if(!ok())return; tone(now(),60,.45,{duty:.125,gain:.07,slide:24,bus:SND.sfx}); },
  hit(){ if(!ok())return; const t=now(); kick(t,1,SND.sfx); noise(t,.25,{ft:'lowpass',freq:2600,gain:.45,bus:SND.sfx}); tone(t,84,.2,{duty:.25,gain:.08,slide:-14,bus:SND.sfx}); },
  crit(){ if(!ok())return; const t=now(); [84,88,91,96].forEach((n,i)=>tone(t+i*.04,n,.15,{duty:.125,gain:.08,bus:SND.sfx})); },
  hurt(){ if(!ok())return; const t=now(); tone(t,62,.18,{duty:.5,gain:.1,slide:-12,bus:SND.sfx}); noise(t,.1,{ft:'bandpass',freq:900,gain:.25,bus:SND.sfx}); },
  graze(){ if(!ok())return; tone(now(),96,.03,{duty:.125,gain:.025,bus:SND.sfx}); },
  focus(){ if(!ok())return; const t=now(); [79,86,91,98].forEach((n,i)=>tone(t+i*.05,n,.12,{duty:.125,gain:.06,bus:SND.sfx})); },
  heal(){ if(!ok())return; const t=now(); [72,76,79,84,88].forEach((n,i)=>tone(t+i*.07,n,.2,{duty:.5,gain:.06,bus:SND.sfx})); },
  warn(){ if(!ok())return; tone(now(),88,.05,{duty:.5,gain:.04,bus:SND.sfx}); },
  laser(){ if(!ok())return; tone(now(),40,.25,{duty:.125,gain:.06,slide:-5,bus:SND.sfx}); },
  cast(){ if(!ok())return; const t=now(); tone(t,48,.5,{duty:.125,gain:.06,slide:19,bus:SND.sfx}); noise(t,.5,{freq:3000,gain:.08,bus:SND.sfx}); },
  turno(){ if(!ok())return; const t=now(); tone(t,79,.08,{duty:.25,gain:.07,bus:SND.sfx}); tone(t+.08,86,.14,{duty:.25,gain:.07,bus:SND.sfx}); },
  win(){ if(!ok())return; const t=now(); [[72,0],[76,.12],[79,.24],[84,.36],[83,.6],[84,.72],[88,.84]].forEach(([n,d])=>tone(t+d,n,d>.8?.8:.14,{duty:.25,gain:.09,bus:SND.sfx})); },
  lose(){ if(!ok())return; const t=now(); [67,64,60,55].forEach((n,i)=>tone(t+i*.3,n,.4,{duty:.5,gain:.08,bus:SND.sfx})); },
  unlock(){ if(!ok())return; const t=now(); [79,83,86,91].forEach((n,i)=>tone(t+i*.09,n,.2,{duty:.125,gain:.07,bus:SND.sfx})); },
  phase(){ if(!ok())return; const t=now(); for(let i=0;i<12;i++) tone(t+i*.06,48+i*3,.08,{duty:.125,gain:.05,bus:SND.sfx}); kick(t+.75,1,SND.sfx); crash(t+.75,.8,SND.sfx); }
};

P1.audio={init,setSong,setMode,setPhase,toggle,pulso,voz,sfx,get on(){return SND.on;},get iniciado(){return !!SND.ctx;},_SND:SND};
})();
