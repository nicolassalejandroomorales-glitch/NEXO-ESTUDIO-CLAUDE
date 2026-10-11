/* =====================================================================
   MOTOR DEL JUEGO: mapa → pelea (turno de desafío ↔ turno de esquiva) → final.
   Reglas que no se rompen:
   · El juego elige el desafío (director). Nunca el mismo tipo dos veces seguidas; si fallas un tema, vuelve.
   · Solo el conocimiento hace daño fuerte. Esquivar, racha y foco son juego: nunca cuentan como dominio.
   ===================================================================== */
(function(){
'use strict';
const P1=window.P1, A=P1.arte, AU=P1.audio, D=P1.desafios, RM=A.RM;
A.pulso=()=>RM?0:AU.pulso();
const $=id=>document.getElementById(id);
const cv=$('arena'), ctx=cv.getContext('2d');
const rand=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), ease=k=>1-Math.pow(1-k,3);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const FF='"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif', FT='"Iowan Old Style","Palatino Linotype",Georgia,serif';
const TEMAS=P1.TEMAS, JEFES=P1.JEFES;
const DMG={elegir:9,conectar:15,ordenar:13,clasificar:15,ruta:16,flecha:16};
const NOMBRE_TIPO={elegir:'Elegir',conectar:'Conectar',ordenar:'Ordenar',clasificar:'Clasificar',ruta:'Ruta de síntesis',flecha:'Mecanismo'};

/* ---------- progreso guardado (solo en este navegador) ---------- */
const KEY='nexo-pep1-campana';
let prog={abiertos:1,record:{}};
try{const s=localStorage.getItem(KEY);if(s)prog=Object.assign(prog,JSON.parse(s));}catch(e){}
if(/[?&]todo=1/.test(location.search)) prog.abiertos=JEFES.length;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(prog));}catch(e){}};
function logIntento(r){try{const k='nexo-pep1-intentos',a=JSON.parse(localStorage.getItem(k)||'[]');a.push(r);localStorage.setItem(k,JSON.stringify(a.slice(-400)));}catch(e){}}

/* ---------- geometría ---------- */
let W=800,H=460,NARROW=false; const G={};
function layout(){
  const w=cv.parentElement.clientWidth; NARROW=w<640;
  W=NARROW?480:800; H=NARROW?600:460;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(w*dpr); cv.height=Math.round(w*H/W*dpr); cv.style.height=(w*H/W)+'px';
  Object.assign(G,{k:cv.width/W,narrow:NARROW,ex:W/2,ey:H*(NARROW?.26:.3),bx:W/2,by:H*(NARROW?.73:.745),hz:H*(NARROW?.4:.5)});
}

/* ---------- estado ---------- */
let S=null, pantalla='mapa', tMapa=0;
function nuevaPelea(i){
  const J=JEFES[i];
  return {idx:i,J,mode:'intro',t:0,php:J.pv,pmax:J.pv,ehp:J.vida,ehpGhost:J.vida,phase:1,tes:J.tes,noDamage:S?S.noDamage:false,
    stats:{ok:0,okHelp:0,bad:0,parcial:0,temas:{},fallos:[]},last:null,debts:[],recent:[],racha:0,foco:0,focoLleno:false,
    enemy:{flash:0,sq:0,sqv:0,hx:0,hv:0,enter:0,dissolve:0,blink:false,blinkT:3,inv:1,feliz:false},
    soul:{x:0,y:0,inv:0,trail:[],alpha:1},box:{w:160,h:64},boxT:{w:160,h:64},
    bullets:[],lasers:[],parts:[],floats:[],warns:[],labels:[],pattern:null,timers:[],shake:0,channel:null,strike:null,banner:null,keys:{},pending:null,prevAttack:null,ondas:[],flashW:0,slow:0,hitstop:0,dolor:0,pattern2:null,castT:0};
}
function after(sec,fn){S.timers.push({t:sec,fn});}
function boxRect(){const b=S.box;return {l:G.bx-b.w/2,r:G.bx+b.w/2,t:G.by-b.h/2,b:G.by+b.h/2,w:b.w,h:b.h,cx:G.bx,cy:G.by};}
function setBox(w,h){S.boxT.w=NARROW?Math.min(w+40,430):w;S.boxT.h=NARROW?h+30:h;}
function burst(x,y,n,col,spd=160,size=3){const m=RM?Math.ceil(n/3):n;for(let i=0;i<m;i++){const a=rand(0,6.283),v=rand(.3,1)*spd;S.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.4,.9),max:.9,col,size:rand(size*.5,size)});}}
function floatTxt(x,y,txt,col,size=26){S.floats.push({x,y,txt,col,life:1.2,size});}
function shake(m){if(!RM)S.shake=Math.max(S.shake,m);}
function onda(x,y,max,col,w=3){if(S)S.ondas.push({x,y,r:6,max,col,a:1,w});}

/* ---------- diálogo ---------- */
let typing=null;
/* Texto letra a letra, con la "voz" de quien habla (cada personaje suena distinto) y pausas en los signos. Clic = terminar. */
function say(who,text,done){
  const el=$('dialog'); if(typing) clearTimeout(typing.id);
  el.innerHTML=`<b>${who}</b><span class="txt"></span>`; const sp=el.lastChild;
  if(RM){sp.innerHTML='* '+text;typing=null;done&&done();return;}
  const plain='* '+text.replace(/<[^>]+>/g,''); let i=2;
  const step=()=>{ i++; sp.textContent=plain.slice(0,i); const ch=plain[i-1];
    if(ch&&/[\wáéíóúñÁÉÍÓÚÑ⁺]/.test(ch)&&i%2===0) AU.voz(who);
    if(i>=plain.length){ typing=null; sp.innerHTML='* '+text; done&&done(); return; }
    typing.id=setTimeout(step,'.!?…'.includes(ch)?300:(ch===','||ch===':')?150:42); };
  typing={id:setTimeout(step,60),finish(){clearTimeout(this.id);sp.innerHTML='* '+text;typing=null;done&&done();}};
}
$('dialog').addEventListener('click',()=>typing&&typing.finish());

/* =====================================================================
   MAPA (selección de jefes)
   ===================================================================== */
const minis=[];
function mostrarMapa(){
  pantalla='mapa'; S=null; $('panel').hidden=true; $('mapa').hidden=false; $('btnMapa').hidden=true;
  AU.setSong('mapa'); AU.setMode('calm');
  const cards=JEFES.map((J,i)=>{
    const abierto=i<prog.abiertos, rec=prog.record[J.id];
    const estado=rec!==undefined?`<span class="ok">Vencido · mejor ${rec} %</span>`:abierto?'<span class="open">Abierto</span>':`<span class="lock">🔒 Vence a ${JEFES[i-1].nombre.toLowerCase()}</span>`;
    return `<button class="card${abierto?'':' locked'}${J.final?' final':''}" type="button" data-j="${i}" ${abierto?'':'disabled'}>
      <canvas class="mini" width="200" height="150" data-m="${i}"></canvas>
      <span class="num">${J.final?'Jefe final':'Guardián '+(i+1)}</span>
      <b>${J.nombre}</b><em>${J.titulo}</em><small>${J.tema}</small>${estado}</button>`;}).join('');
  $('mapa').innerHTML=`<p class="eyebrow">Orgánica II · aminas y aromáticos</p><h2>Camino a la PEP 1</h2>
    <p class="lead">Vence a los tres guardianes para abrir la puerta del Rey Amonio. El juego elige cada desafío: conectar, ordenar, clasificar, rutas de síntesis y más.</p>
    <div class="cards">${cards}</div>`;
  if(!AU.iniciado) $('mapa').insertAdjacentHTML('afterbegin',`<div class="inicio"><p class="eyebrow">Juegos de Nexo</p><h2>Camino a la PEP 1</h2>
    <p>Tres guardianes y un rey. Tu conocimiento es tu arma.</p><button class="big" type="button" data-start>▶ Comenzar</button><small>con sonido · M para silenciar</small></div>`);
  const st=$('mapa').querySelector('[data-start]'); if(st) st.onclick=()=>{AU.init();AU.setSong('mapa');AU.setMode('calm');AU.sfx.unlock();st.parentElement.classList.add('fuera');setTimeout(()=>st.parentElement.remove(),500);};
  minis.length=0; $('mapa').querySelectorAll('canvas.mini').forEach(c=>minis.push(c));
  $('mapa').querySelectorAll('.card').forEach(b=>b.onclick=()=>{AU.init();empezar(+b.dataset.j);});
}
function pintarMinis(dt){
  tMapa+=dt;
  for(const c of minis){
    const i=+c.dataset.m, J=JEFES[i], g=c.getContext('2d'), abierto=i<prog.abiertos;
    g.clearRect(0,0,200,150);
    const bg={pantano:['#123a44','#0a1c1f'],laboratorio:['#1d2b35','#0b1116'],catedral:['#2a1a4a','#0c0716'],trono:['#173040','#081016']}[J.arena];
    const gr=g.createLinearGradient(0,0,0,150);gr.addColorStop(0,bg[0]);gr.addColorStop(1,bg[1]);g.fillStyle=gr;g.fillRect(0,0,200,150);
    g.save(); if(!abierto) g.filter='grayscale(1) brightness(.45)';
    A.jefes[J.id](g,100,78,.62,{t:tMapa+i*1.3,fase:1,flash:0,sq:0,look:Math.sin(tMapa+i)*1.2,blink:false,enter:1,dissolve:0});
    g.restore();
  }
}

/* =====================================================================
   PELEA
   ===================================================================== */
function empezar(i){
  S=nuevaPelea(i); pantalla='pelea';
  $('mapa').hidden=true; $('panel').hidden=false; $('btnMapa').hidden=false; $('accion').hidden=true; $('accion').innerHTML='';
  $('titulo').innerHTML=`${S.J.nombre.charAt(0)+S.J.nombre.slice(1).toLowerCase()} <small>${S.J.subtitulo}</small>`;
  layout(); S.soul.x=G.bx; S.soul.y=G.by;
  AU.setSong(S.J.musica); AU.setPhase(1); AU.setMode('calm'); AU.sfx.charge();
  S.banner={txt:S.J.subtitulo,t:2};
  say(S.J.nombre,S.J.lineas.entrada,()=>after(.5,()=>{showMenu();}));
}

/* --- Director: el juego elige el siguiente desafío --- */
function showMenu(){
  if(!S||S.mode==='end') return;
  S.mode='menu'; setBox(160,64); AU.setMode('calm');
  $('accion').hidden=true;
  if(S.php<=8&&S.tes>0){ S.tes--; S.php=Math.min(S.pmax,S.php+10); AU.sfx.heal(); burst(S.soul.x,S.soul.y,24,'#8fc49a',120); floatTxt(G.bx,G.by-50,'+10 PV','#8fc49a');
    say('NEXO',`Te queda poca luz: tu mascota te pasa té del refugio (+10 PV, quedan ${S.tes}).`,()=>after(.5,pickChallenge)); return; }
  after(.4,pickChallenge);
}
function poolDe(J){
  if(!J.repaso||Math.random()>J.repaso) return P1.BANCO[J.id];
  return JEFES.filter(x=>x.id!==J.id).flatMap(x=>P1.BANCO[x.id]);
}
function pickChallenge(){
  if(!S||S.mode!=='menu') return;
  const own=P1.BANCO[S.J.id];
  let cand=null,why='',it=null;
  // 1) si hay un tema fallado, vuelve con otro formato
  for(const d of S.debts){
    const c=own.filter(x=>x.tema===d&&x.tipo!==S.last&&!S.recent.includes(x));
    if(c.length){it=pick(c);why=`Volvemos a <b>${TEMAS[d]}</b>: lo fallaste recién.`;S.debts.splice(S.debts.indexOf(d),1);break;}
  }
  // 2) si no, elige primero el TIPO (intercalado) y luego un caso de ese tipo
  if(!it){
    let pool=poolDe(S.J);
    cand=pool.filter(x=>x.tipo!==S.last&&!S.recent.includes(x));
    if(!cand.length){S.recent.length=0;cand=pool.filter(x=>x.tipo!==S.last);}
    const tipos=[...new Set(cand.map(x=>x.tipo))], w=tipos.map(t=>t==='elegir'?1:1.6), tot=w.reduce((a,b)=>a+b,0);
    let r=Math.random()*tot, tipo=tipos[0]; for(let i=0;i<tipos.length;i++){r-=w[i];if(r<=0){tipo=tipos[i];break;}}
    it=pick(cand.filter(x=>x.tipo===tipo));
    if(pool!==own) why='Repaso de un guardián anterior.';
  }
  S.recent.push(it); if(S.recent.length>8) S.recent.shift();
  S.current=it; S.mode='action'; AU.sfx.select();
  S.banner={txt:'¡Tu turno! · '+NOMBRE_TIPO[it.tipo],t:1.8,pop:1}; AU.sfx.turno();
  say('NEXO',(why?why+' ':'')+({elegir:'Elige la correcta.',conectar:'Une cada par.',ordenar:'Ordena las tarjetas.',clasificar:'Lleva cada tarjeta a su caja.',ruta:'Arma la ruta paso a paso.',flecha:'Dibuja el mecanismo.'}[it.tipo]));
  const a=$('accion'); a.hidden=false; a._cleanup&&a._cleanup(); a._cleanup=null; a.className='accion in';
  const root=document.createElement('div'); a.innerHTML=''; a.appendChild(root);
  D[it.tipo](it,root,res=>resolve(it,res));
  a._cleanup=()=>root._cleanup&&root._cleanup();
  requestAnimationFrame(()=>{const f=a.querySelector('button:not(:disabled)');f&&f.focus({preventScroll:true});});
}

/* --- Resultado del desafío --- */
function resolve(it,res){
  const st=S.stats, tema=it.tema, parcial=!res.ok&&res.frac>=.5;
  logIntento({jefe:S.J.id,tipo:it.tipo,tema,ok:res.ok,frac:+res.frac.toFixed(2),pista:res.help,t:Date.now()});
  if(res.ok){ if(res.help) st.okHelp++; else st.ok++; S.racha=res.help?0:S.racha+1; AU.sfx.good(); }
  else { st.bad++; if(parcial) st.parcial++; st.temas[tema]=(st.temas[tema]||0)+1; if(!S.debts.includes(tema)) S.debts.push(tema);
    st.fallos.push({q:it.q||'Mecanismo de protonación',por:res.por}); S.racha=0; AU.sfx.bad(); }
  S.last=it.tipo;
  const base=DMG[it.tipo]||10, combo=1+.1*Math.min(Math.max(S.racha-1,0),4);
  const titulo=res.ok?(res.help?'Correcto, con pista.':S.racha>1?`¡Correcto sin ayuda! Racha ×${S.racha}`:'¡Correcto sin ayuda!'):parcial?`Casi: ${Math.round(res.frac*100)} % bien.`:'No todavía.';
  const boton=res.ok?(S.focoLleno?'¡Golpe de foco! →':'Canalizar hechizo →'):parcial?'Lanzar hechizo débil →':'Prepararse para esquivar →';
  const fb=document.createElement('div'); fb.className='fbwrap';
  fb.innerHTML=`<p class="fb ${res.ok?'good':parcial?'mid':'bad'}"><b>${titulo}</b> ${res.por}</p><div class="row"><button class="go" type="button" data-go data-keep>${boton}</button></div>`;
  $('accion').appendChild(fb); const go=fb.querySelector('[data-go]'); go.focus({preventScroll:true});
  fb.scrollIntoView({block:'nearest',behavior:RM?'auto':'smooth'});
  go.onclick=()=>{
    go.disabled=true; $('accion').hidden=true; S.mode='resolviendo';
    if(res.ok){ S.pending={dmg:base*(res.help?.5:1)*combo,tema:null}; startChannel(); }
    else if(parcial){ S.pending={dmg:base*.35,tema,weak:true}; S.channelM=1; launchStrike(); }
    else { if(S.J.curaError){S.ehp=Math.min(S.J.vida,S.ehp+S.J.curaError);floatTxt(G.ex+40,G.ey-60,'+'+S.J.curaError,'#8fc49a',22);}
      say(S.J.nombre,pick(S.J.lineas.burlas),()=>after(.35,()=>enemyTurn(tema,true,false))); }
  };
}

/* --- Canalizar: barra de precisión (multiplica un acierto, nunca lo reemplaza) --- */
const idaVuelta=u=>{u=clamp(u,0,1);return u<.5?u*2:2-u*2;};
function startChannel(){
  S.mode='channel'; AU.sfx.charge();
  if(S.focoLleno){ S.focoLleno=false; S.foco=0; S.channelM=1.5; floatTxt(G.bx,G.by-40,'¡FOCO: CRÍTICO!','#f3d9a6',20); AU.sfx.crit(); after(.3,launchStrike); return; }
  setBox(420,58); S.channel={t:0,dur:3.6,stopped:false,m:1};
  say('NEXO','¡Toca la arena o presiona Espacio cuando la estrella pase por el centro! Va y vuelve: tienes dos oportunidades.');
}
function stopChannel(){
  const c=S.channel; if(!c||c.stopped) return; c.stopped=true;
  const p=idaVuelta(c.t/c.dur), d=Math.abs(p-.5); c.m=d<.06?1.5:d<.16?1.25:1; S.channelM=c.m;
  const b=boxRect(), x=b.l+16+(b.w-32)*clamp(p,0,1);
  burst(x,b.cy,c.m>1.4?30:14,c.m>1.4?'#f3d9a6':'#79adae',140);
  if(c.m>1.4){floatTxt(x,b.t-16,'¡CRÍTICO!','#f3d9a6',20);AU.sfx.crit();} else if(c.m>1.2) floatTxt(x,b.t-16,'¡Bien!','#9fd0cf',18);
  after(.35,launchStrike);
}
function launchStrike(){ S.mode='strike'; S.channel=null; setBox(160,64); S.strike={t:0,dur:.5,x0:G.bx,y0:G.by}; }
function landStrike(){
  const p=S.pending; S.pending=null;
  const dmg=Math.max(1,Math.round(p.dmg*(S.channelM||1))); S.channelM=1;
  const before=S.ehp; S.ehp=Math.max(0,S.ehp-dmg);
  const E=S.enemy; E.flash=1; E.hv=(Math.random()<.5?-1:1)*(p.weak?140:260); E.sqv=p.weak?1:2; shake(p.weak?4:9); AU.sfx.hit();
  S.hitstop=RM?0:(p.weak?.04:.09); onda(G.ex,G.ey,p.weak?90:160,'243,217,166',p.weak?2:4); if(!p.weak&&dmg>=20) onda(G.ex,G.ey,230,'255,255,255',2);
  burst(G.ex,G.ey,p.weak?16:40,'#f3d9a6',260,4); floatTxt(G.ex+rand(-30,30),G.ey-80,'−'+dmg,p.weak?'#c9cfc6':'#f3d9a6',p.weak?24:34);
  if(S.ehp<=0){ S.mode='victory'; AU.setMode('end'); E.feliz=S.J.id==='rey'; say(S.J.nombre,S.J.lineas.derrota); E.dissolve=.001; after(3.4,()=>endGame('victoria')); return; }
  // ¿cambio de fase?
  const frac=S.ehp/S.J.vida, nueva=1+S.J.fases.filter(f=>frac<=f.umbral).length;
  if(nueva>S.phase){
    S.phase=nueva; AU.setPhase(nueva); AU.sfx.phase(); shake(10); E.sqv=-3;
    // escena de cambio de fase: un solo destello que se desvanece (sin parpadeos), cámara lenta y onda gigante
    S.flashW=RM?0:.85; S.slow=RM?0:1.1; onda(G.ex,G.ey,Math.max(W,H),'255,255,255',6); onda(G.ex,G.ey,Math.max(W,H)*.7,'255,120,120',3);
    burst(G.ex,G.ey,60,'#ffffff',320,4);
    S.banner={txt:'FASE '+nueva,t:2};
    say(S.J.nombre,S.J.fases[nueva-2].linea,()=>after(.6,()=>enemyTurn(p.tema,!!p.weak,!p.weak))); return;
  }
  say(S.J.nombre,pick(S.J.lineas.golpe),()=>after(.35,()=>enemyTurn(p.tema,!!p.weak,!p.weak)));
}

/* =====================================================================
   TURNO DEL JEFE: ataques que representan conceptos
   ===================================================================== */
const B=(o)=>Object.assign({vx:0,vy:0,r:6,age:0,col:'#f5f0e4'},o);
const every=(p,dt,s)=>{p.acc=(p.acc||0)+dt;let n=0;while(p.acc>s){p.acc-=s;n++;}return n;};
const PATRONES={
  /* Trimetilamina */
  burbujas:{nombre:'Nube de olor',nota:'El olor sube ondulando: busca los huecos.',dur:6,step(p,dt,b,h){for(let i=every(p,dt,.3/h);i--;)S.bullets.push(B({k:'onda',x:rand(b.l+8,b.r-8),y:b.b+10,vy:-rand(70,120)*h,r:6,sway:rand(0,6),col:'#b8d86b'}));}},
  lluvia:{nombre:'Lluvia de gotas',nota:'Muévete entre las gotas.',dur:6,step(p,dt,b,h){for(let i=every(p,dt,.17/h);i--;)S.bullets.push(B({k:'bola',x:rand(b.l+8,b.r-8),y:b.t-10,vy:rand(120,190)*h,sway:rand(0,6),r:5,col:'#9fd0cf'}));}},
  barrido:{nombre:'Barrido de metilos',nota:'Una pared con un hueco: ¡pasa por él!',dur:6.4,step(p,dt,b,h){for(let i=every(p,dt,1.15/h);i--;){const gap=rand(b.t+12,b.b-62),izq=Math.random()<.5;
    for(let y=b.t+8;y<b.b;y+=15){if(y>gap&&y<gap+56)continue;S.bullets.push(B({k:'bola',x:izq?b.l-10:b.r+10,y,vx:(izq?1:-1)*130*h,r:5,col:'#c9cfc6'}));}}}},
  nube:{nombre:'Gas de amina',nota:'Las nubes avisan antes de crecer. Sal de su círculo.',dur:6.5,step(p,dt,b,h){for(let i=every(p,dt,1.05/h);i--;)S.bullets.push(B({k:'nube',x:rand(b.l+30,b.r-30),y:rand(b.t+25,b.b-25),r:0,rmax:rand(26,38),col:'#b8d86b',life:2.4}));}},
  metilos:{nombre:'Metilos en picada',nota:'Tres CH₃ apuntan a donde estás: muévete cuando se encienden.',dur:6.5,step(p,dt,b,h){for(let i=every(p,dt,1.5/h);i--;)[[b.l+14,b.t+14],[b.r-14,b.t+14],[b.cx,b.b-12]].forEach(([x,y])=>S.bullets.push(B({k:'apunta',x,y,r:8,wait:.75,spd:270*h,col:'#9aa5b1',lab:'CH₃'})));}},
  /* Ciclobutadieno */
  rebote:{nombre:'Cuadrados inestables',nota:'Rebotan en las paredes. Mira su trayectoria.',dur:6.5,step(p,dt,b,h){if(every(p,dt,.85/h)&&S.bullets.filter(x=>x.k==='rebote').length<3+S.phase){const a=rand(.5,2.6);
    S.bullets.push(B({k:'rebote',x:rand(b.l+20,b.r-20),y:b.t+12,vx:Math.cos(a)*130*h,vy:Math.abs(Math.sin(a))*130*h,r:8,rot:0,life:5.5,col:'#ffa04d'}));}}},
  alternancia:{nombre:'Enlaces que alternan',nota:'Los dobles enlaces saltan de horizontal a vertical. Lee el aviso.',dur:6.6,step(p,dt,b,h){for(let i=every(p,dt,1.25/h);i--;){p.v=!p.v;
    const n=2,ofs=rand(.2,.35);for(let j=0;j<n;j++){const u=j?1-ofs:ofs;S.lasers.push({vertical:p.v,pos:p.v?b.l+b.w*u:b.t+b.h*u,charge:.8,active:.35,w:16,col:'255,160,77'});}AU.sfx.warn();}}},
  dimero:{nombre:'Dimerización',nota:'Dos cuadrados chocan a tu altura y estallan.',dur:6.5,step(p,dt,b,h){for(let i=every(p,dt,1.7/h);i--;){const y=clamp(S.soul.y,b.t+14,b.b-14);
    for(const s of [-1,1])S.bullets.push(B({k:'dimero',x:s<0?b.l-12:b.r+12,y,vx:-s*170*h,r:12,rot:0,col:'#ff7a4d'}));}}},
  /* Benceno */
  espiral:{nombre:'Espiral π',nota:'Dos brazos que giran: sigue el hueco.',dur:6.5,step(p,dt,b,h){p.tt=(p.tt||0)+dt;for(let i=every(p,dt,.11/h);i--;){const ab=Math.sin(p.tt*2)*1.15;
    for(const a of [Math.PI/2+ab,Math.PI/2-ab])S.bullets.push(B({k:'bola',x:b.cx,y:b.t-4,vx:Math.cos(a)*140*h,vy:Math.sin(a)*140*h,r:5,col:'#a98bff'}));}}},
  laser:{nombre:'Láser aromático',nota:'La línea punteada avisa. Sal de ahí.',dur:6.5,step(p,dt,b,h){for(let i=every(p,dt,1.25/h);i--;){const n=h>1.2||S.phase>1?2:1;
    for(let j=0;j<n;j++){const v=Math.random()<.5;S.lasers.push({vertical:v,pos:v?rand(b.l+22,b.r-22):rand(b.t+22,b.b-22),charge:.9,active:.4,w:20,col:'169,139,255'});}AU.sfx.warn();}}},
  hexagonos:{nombre:'Lluvia de anillos',nota:'Hexágonos que caen girando.',dur:6,step(p,dt,b,h){for(let i=every(p,dt,.36/h);i--;)S.bullets.push(B({k:'hex',x:rand(b.l+10,b.r-10),y:b.t-12,vx:rand(-20,20),vy:rand(85,140)*h,r:9,rot:0,spin:rand(-3,3),col:'#e9e3ff'}));}},
  electrofilos:{nombre:'Electrófilos',nota:'Los E⁺ te persiguen: hazlos girar y esquiva.',dur:6.5,step(p,dt,b,h){if(every(p,dt,.85/h)&&S.bullets.filter(x=>x.k==='homing').length<5){const side=Math.floor(rand(0,4));
    const x=side===0?b.l:side===1?b.r:rand(b.l,b.r),y=side===2?b.t:side===3?b.b:rand(b.t,b.b),a=Math.atan2(S.soul.y-y,S.soul.x-x);
    S.bullets.push(B({k:'homing',x,y,vx:Math.cos(a)*100*h,vy:Math.sin(a)*100*h,spd:100*h,r:7,life:4.5,col:'#ff6b5e',lab:'E⁺'}));}}},
  /* Rey Amonio */
  protones:{nombre:'Lluvia de protones',nota:'Los H⁺ buscan un par libre. Muévete entre las gotas.',dur:6,step(p,dt,b,h){for(let i=every(p,dt,.16/h);i--;)S.bullets.push(B({k:'bola',x:rand(b.l+8,b.r-8),y:b.t-10,vy:rand(130,200)*h,sway:rand(0,6),r:7,col:'#d98a8f',lab:'H⁺'}));}},
  anillo:{nombre:'Anillo de resonancia',nota:'El sexteto gira. Busca el hueco del anillo.',dur:6.4,step(p,dt,b,h){p.acc2=(p.acc2===undefined?1.2:p.acc2)+dt;
    if(p.acc2>1.75/h){p.acc2=0;p.dir=-(p.dir||1);const n=20,gap=h>1.15?3:4,g0=Math.floor(rand(0,n)),ring={R:Math.hypot(b.w,b.h)/2+16,rot:rand(0,6.28),dir:p.dir,dead:false};
      for(let i=0;i<n;i++){if(((i-g0+n)%n)<gap)continue;S.bullets.push(B({k:'ring',ring,i,n,r:6,col:'#9fd0cf'}));}(p.rings=p.rings||[]).push(ring);}
    for(const r of p.rings||[]){r.R-=(80*h)*dt;r.rot+=r.dir*.95*h*dt;if(r.R<5)r.dead=true;}}},
  cadena:{nombre:'Cadena inductiva',nota:'El efecto inductivo se atenúa con la distancia: las balas frenan.',dur:6,step(p,dt,b,h){for(let i=every(p,dt,.48/h);i--;){
    const ln=Math.floor(rand(0,5)),y=b.t+(ln+.5)*b.h/5,dir=Math.random()<.5?1:-1;S.warns.push({y,t:.38});AU.sfx.warn();
    after(.38,()=>{if(!S||S.mode!=='dodge')return;const bb=boxRect();S.bullets.push(B({k:'sigma',x:dir>0?bb.l-8:bb.r+8,y,dir,v0:350*h,dist:0,r:6,fade:1,col:'#b8a6e6',lab:'δ+'}));S.labels.push({x:dir>0?bb.l-26:bb.r+26,y,t:.8});});}}},
  tetra:{nombre:'Tetraedro cazador',nota:'Dos H⁺ te persiguen y estallan. Aléjate al final.',dur:6.4,step(p,dt,b,h){p.tt=(p.tt||0)+dt;
    if(!p.a&&p.tt>.6){p.a=1;spawnTetra(b);} if(!p.b&&p.tt>3.2){p.b=1;spawnTetra(b);}
    for(let i=every(p,dt,.4/h);i--;)S.bullets.push(B({k:'bola',x:rand(b.l+8,b.r-8),y:b.t-10,vy:rand(100,150)*h,r:6,col:'#d98a8f',lab:'H⁺'}));}},
  corona:{nombre:'Corona de carga',nota:'Ráfagas en círculo: busca el hueco que gira.',dur:6.6,step(p,dt,b,h){p.rot=(p.rot||0)+dt*.9;for(let i=every(p,dt,.95/h);i--;){const n=16,gap=Math.floor(rand(0,n));
    for(let j=0;j<n;j++){if(j===gap||j===(gap+1)%n)continue;const a=p.rot+j/n*6.283;S.bullets.push(B({k:'bola',x:b.cx,y:b.t+8,vx:Math.cos(a)*115*h,vy:Math.sin(a)*115*h,r:6,col:'#f3d9a6'}));}}}}
};
function spawnTetra(b){for(const x of [b.l+12,b.r-12])S.bullets.push(B({k:'tetra',x,y:b.t+12,r:8,col:'#ffffff'}));burst(G.ex,G.ey,18,'#d98a8f',160);}
function enemyTurn(tema,wrong,correct){
  if(!S||S.mode==='end'||S.mode==='lose') return;
  const J=S.J, opts=J.patrones[S.phase]||J.patrones[1];
  let key=tema&&J.ataquePorTema[tema];
  if(!key){const o=opts.filter(k=>k!==S.prevAttack);key=pick(o.length?o:opts);}
  S.prevAttack=key; const P=PATRONES[key];
  // dificultad: cada jefe es más duro que el anterior; el error y la fase la suben aún más
  const h=(J.dificultad||1)*(wrong?1.18:1)*(1+.12*(S.phase-1));
  S.pattern={key,P,t:0,h,dur:P.dur*(S.phase>=2?1.12:1)*(J.final?1.1:1)};
  S.pattern2=null;
  if(J.combo&&S.phase>=3){const o2=opts.filter(k=>k!==key);const k2=pick(o2);S.pattern2={key:k2,P:PATRONES[k2],t:0,h:h*.7,dur:S.pattern.dur};}
  const bw=correct?290:wrong?205:245, bh=correct?175:wrong?130:150; setBox(bw,bh);
  S.banner={txt:P.nombre+(S.pattern2?' + '+S.pattern2.P.nombre:''),t:2,pop:1}; AU.setMode('battle'); $('accion').hidden=true;
  // conjuro: el jefe junta energía y la lanza a la caja antes de atacar
  S.mode='cast'; S.castT=RM?.2:.75; AU.sfx.cast(); onda(G.ex,G.ey,140,'255,255,255');
  S.enemy.sqv=-1.6; S.enemy.atk=1;
  say('NEXO',wrong&&tema?`Fallaste en <b>${TEMAS[tema]}</b>: ${J.nombre.toLowerCase()} responde con ${P.nombre.toLowerCase()} (más rápido y con caja más chica).`:correct?`Tu acierto agranda la caja. ${P.nota}`:P.nota);
  const b=boxRect(); S.soul.x=b.cx; S.soul.y=b.cy+b.h*.15; S.soul.inv=.6;
}
function endDodge(){
  S.pattern=null; S.pattern2=null; for(const bl of S.bullets) burst(bl.x,bl.y,2,'#79adae',40,2); S.bullets.length=0; S.lasers.length=0; S.warns.length=0; S.enemy.atk=0;
  showMenu(); say('NEXO','Tu turno. El jefe prepara el siguiente desafío…');
}
function hurt(){
  if(S.soul.inv>0||S.noDamage||S.mode!=='dodge') return;
  const d=(S.pattern&&S.pattern.h>1.15?3:2)+(S.phase>=3?1:0); S.php=Math.max(0,S.php-d); S.soul.inv=1;
  AU.sfx.hurt(); shake(7); S.dolor=1; burst(S.soul.x,S.soul.y,16,'#d98a8f',150); floatTxt(S.soul.x,S.soul.y-24,'−'+d,'#d98a8f',20);
  if(S.php<=0){ S.mode='lose'; S.pattern=null; S.bullets.length=0; S.lasers.length=0; AU.setMode('silent'); AU.sfx.lose();
    burst(S.soul.x,S.soul.y,60,'#d9ac68',220,4); S.soul.alpha=0;
    say('NEXO','La estrella se apaga… pero los errores ya son mapa.'); after(2.4,()=>endGame('derrota')); }
}
function graze(x,y){
  if(S.focoLleno) return; S.foco=Math.min(100,S.foco+7); AU.sfx.graze(); burst(x,y,3,'#f3d9a6',60,2);
  if(S.foco>=100){S.focoLleno=true;AU.sfx.focus();S.banner={txt:'¡Foco lleno! Tu próximo acierto será crítico',t:2};}
}

/* =====================================================================
   FINAL
   ===================================================================== */
function endGame(kind){
  S.mode='end'; AU.setMode('end');
  const st=S.stats, tot=st.ok+st.okHelp+st.bad, prec=tot?Math.round(100*(st.ok+st.okHelp*.5)/tot):0, J=S.J, gano=kind==='victoria';
  if(gano){ AU.sfx.win(); prog.abiertos=Math.min(JEFES.length,Math.max(prog.abiertos,S.idx+2)); prog.record[J.id]=Math.max(prog.record[J.id]||0,prec); save();
    if(S.idx+1<JEFES.length&&S.idx+2>JEFES.length-1) setTimeout(()=>AU.sfx.unlock(),1200); }
  const errs=Object.entries(st.temas).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${TEMAS[k]} (${v})`).join(', ');
  const sig=S.idx+1<JEFES.length?JEFES[S.idx+1]:null;
  const msg=gano?(J.final?'¡Venciste al Rey Amonio! Recorriste toda la PEP 1 de aminas y aromáticos.':`Venciste a ${J.nombre.toLowerCase()}.${sig?` Se abrió: <b>${sig.nombre.toLowerCase()}</b>${sig.final?' (jefe final)':''}.`:''}`)
    :'Tu estrella se apagó. Repasa lo que falló y vuelve: el jefe te espera.';
  const repaso=st.fallos.slice(-6).map(f=>`<li><b>${f.q.replace(/<[^>]+>/g,'')}</b><br><span>${f.por}</span></li>`).join('');
  const a=$('accion'); a.hidden=false; a.className='accion in';
  a.innerHTML=`<p class="q">${gano?'Victoria':'Derrota'}. ${msg}</p>
    <div class="stats"><div class="stat"><b>${prec} %</b><span>precisión</span></div><div class="stat"><b>${st.ok}</b><span>correctas sin ayuda</span></div>
    <div class="stat"><b>${st.okHelp}</b><span>con pista</span></div><div class="stat"><b>${st.bad}</b><span>errores${errs?': '+errs:''}</span></div></div>
    ${repaso?`<details class="repaso" ${gano?'':'open'}><summary>Para repasar (${st.fallos.length})</summary><ul>${repaso}</ul></details>`:'<p class="small">Sin errores. Impecable.</p>'}
    <p class="small">Solo las respuestas verificadas cuentan como evidencia. Esquivar, la racha y el foco son parte del juego, no del dominio.</p>
    <div class="row">${gano&&sig?`<button class="go" type="button" data-next>Siguiente: ${sig.nombre.toLowerCase()} →</button>`:''}
      <button class="${gano&&sig?'ghost':'go'}" type="button" data-again>${gano?'Jugar de nuevo':'Reintentar'}</button>
      <button class="ghost" type="button" data-map>Volver al mapa</button></div>`;
  const nd=S.noDamage;
  a.querySelector('[data-again]').onclick=()=>{empezar(S.idx);S.noDamage=nd;};
  a.querySelector('[data-map]').onclick=mostrarMapa;
  const nx=a.querySelector('[data-next]'); if(nx) nx.onclick=()=>{empezar(S.idx+1);S.noDamage=nd;};
  if(gano&&J.final) for(let i=0;i<8;i++) setTimeout(()=>S&&burst(rand(W*.2,W*.8),rand(H*.15,H*.5),30,pick(['#f3d9a6','#9fd0cf','#d98a8f','#b8a6e6']),200,3),i*250);
}

/* =====================================================================
   DIBUJO
   ===================================================================== */
function rrect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function star(x,y,r,rot,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rot);
  const g=ctx.createRadialGradient(0,0,0,0,0,r*2.6);g.addColorStop(0,'rgba(243,217,166,.55)');g.addColorStop(1,'rgba(243,217,166,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*2.6,0,6.283);ctx.fill();
  ctx.fillStyle='#f3d9a6';ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;ctx[i?'lineTo':'moveTo'](Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.restore();}
function drawBox(){
  const b=boxRect();
  ctx.fillStyle='rgba(12,17,20,.86)'; rrect(b.l,b.t,b.w,b.h,8); ctx.fill();
  ctx.strokeStyle=S.mode==='dodge'?'#f5f0e4':'rgba(245,240,228,.55)'; ctx.lineWidth=3; ctx.stroke();
  if(S.channel){const c=S.channel,iw=b.w-32,zone=(w,col)=>{ctx.fillStyle=col;ctx.fillRect(b.cx-iw*w/2,b.t+10,iw*w,b.h-20);};
    zone(.32,'rgba(121,173,174,.22)'); zone(.12,'rgba(243,217,166,.5)');
    const p=idaVuelta(c.t/c.dur), x=b.l+16+iw*p; ctx.fillStyle='#f3d9a6'; ctx.fillRect(x-2,b.t+6,4,b.h-12); star(x,b.cy,9,S.t*4,1);}
  if(S.pattern){const k=clamp(1-S.pattern.t/S.pattern.dur,0,1); ctx.fillStyle='rgba(121,173,174,.6)'; ctx.fillRect(b.l,b.b+8,b.w*k,3);}
}
function lab(x,y,t,col,size=8){ctx.fillStyle=col;ctx.font=`700 ${size}px ${FF}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y+.5);}
function ball(x,y,r,c){const g=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.35,c);g.addColorStop(1,c);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();}
function drawBullets(){
  const b=boxRect(); ctx.save(); rrect(b.l+1.5,b.t+1.5,b.w-3,b.h-3,7); ctx.clip();
  for(const w of S.warns){ctx.strokeStyle=`rgba(217,138,143,${.5*(1-w.t/.38)+.15})`;ctx.setLineDash([6,6]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(b.l,w.y);ctx.lineTo(b.r,w.y);ctx.stroke();ctx.setLineDash([]);}
  for(const l of S.lasers){
    if(l.charge>0){ctx.globalAlpha=.35+.35*Math.sin(l.charge*12);ctx.strokeStyle=`rgba(${l.col},1)`;ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();
      if(l.vertical){ctx.moveTo(l.pos,b.t);ctx.lineTo(l.pos,b.b);}else{ctx.moveTo(b.l,l.pos);ctx.lineTo(b.r,l.pos);}ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;}
    else{ctx.fillStyle=`rgba(${l.col},.85)`;if(l.vertical)ctx.fillRect(l.pos-l.w/2,b.t,l.w,b.h);else ctx.fillRect(b.l,l.pos-l.w/2,b.w,l.w);
      ctx.fillStyle='#ffffff';if(l.vertical)ctx.fillRect(l.pos-3,b.t,6,b.h);else ctx.fillRect(b.l,l.pos-3,b.w,6);}
  }
  for(const bl of S.bullets){
    const fade=bl.life!==undefined?clamp(bl.life/.4,0,1):1; ctx.globalAlpha=fade*(bl.fade??1);
    if(bl.k==='ring'){ctx.fillStyle=bl.col;ctx.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI/3+bl.ring.rot;ctx.lineTo(bl.x+Math.cos(a)*bl.r,bl.y+Math.sin(a)*bl.r);}ctx.fill();}
    else if(bl.k==='hex'){ctx.strokeStyle=bl.col;ctx.lineWidth=2.2;A.util.hexPath(ctx,bl.x,bl.y,bl.r,bl.rot);ctx.stroke();ctx.beginPath();ctx.arc(bl.x,bl.y,bl.r*.5,0,6.283);ctx.stroke();}
    else if(bl.k==='rebote'||bl.k==='dimero'){ctx.save();ctx.translate(bl.x,bl.y);ctx.rotate(bl.rot);ctx.strokeStyle=bl.col;ctx.lineWidth=2.4;ctx.strokeRect(-bl.r,-bl.r,bl.r*2,bl.r*2);ctx.fillStyle=bl.col+'44';ctx.fillRect(-bl.r,-bl.r,bl.r*2,bl.r*2);ctx.restore();}
    else if(bl.k==='nube'){const warn=bl.age<.7, R=warn?bl.rmax:bl.r;
      if(warn){ctx.strokeStyle='rgba(184,216,107,.7)';ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(bl.x,bl.y,R,0,6.283);ctx.stroke();ctx.setLineDash([]);}
      else{const g=ctx.createRadialGradient(bl.x,bl.y,0,bl.x,bl.y,R);g.addColorStop(0,'rgba(200,235,120,.75)');g.addColorStop(1,'rgba(150,200,80,.15)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(bl.x,bl.y,R,0,6.283);ctx.fill();}}
    else if(bl.k==='apunta'){if(bl.wait>0){ctx.strokeStyle='rgba(217,138,143,.5)';ctx.setLineDash([4,6]);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(bl.x,bl.y);ctx.lineTo(bl.tx??S.soul.x,bl.ty??S.soul.y);ctx.stroke();ctx.setLineDash([]);}
      ball(bl.x,bl.y,bl.r,bl.wait>0?'#7a8794':'#c9cfc6');lab(bl.x,bl.y,'CH₃','#10171a',7);}
    else if(bl.k==='tetra'){ball(bl.x,bl.y,bl.r,'#c9a1a8');lab(bl.x,bl.y,'H⁺','#2a1015',8);}
    else if(bl.k==='sigma'){ctx.fillStyle=bl.col;ctx.beginPath();ctx.moveTo(bl.x,bl.y-bl.r-2);ctx.lineTo(bl.x+bl.r+2,bl.y);ctx.lineTo(bl.x,bl.y+bl.r+2);ctx.lineTo(bl.x-bl.r-2,bl.y);ctx.fill();lab(bl.x,bl.y,'δ+','#1d1530');}
    else {ball(bl.x,bl.y,bl.r,bl.col);if(bl.lab)lab(bl.x,bl.y,bl.lab,'#1a1014',bl.r>6?8:7);}
    ctx.globalAlpha=1;
  }
  for(const r of (S.pattern&&S.pattern.rings)||[]){if(r.dead)continue;ctx.strokeStyle='rgba(159,208,207,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(b.cx,b.cy,r.R,0,6.283);ctx.stroke();}
  ctx.restore();
  for(const l of S.labels){ctx.globalAlpha=clamp(l.t/.8,0,1);lab(l.x,l.y,'CF₃','#b8a6e6',12);ctx.globalAlpha=1;}
}
function drawSoul(){
  const s=S.soul; if(s.alpha<=0||S.mode==='channel'||S.mode==='strike'||S.mode==='intro') return;
  if(!RM) s.trail.forEach((p,i)=>{ctx.globalAlpha=(i/s.trail.length)*.25;ctx.fillStyle='#f3d9a6';ctx.beginPath();ctx.arc(p.x,p.y,3+i*.3,0,6.283);ctx.fill();});
  ctx.globalAlpha=1;
  if(S.focoLleno){ctx.strokeStyle=`rgba(243,217,166,${.5+.3*Math.sin(S.t*5)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,14,0,6.283);ctx.stroke();}
  star(s.x,s.y,8,RM?0:Math.sin(S.t*2)*.25,s.inv>0?.45+.45*Math.cos(s.inv*18):1);
}
function drawFx(){
  ctx.save(); ctx.globalCompositeOperation='lighter';
  for(const o of S.ondas){ctx.strokeStyle=`rgba(${o.col},${o.a*.8})`;ctx.lineWidth=o.w*o.a+.5;ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,6.283);ctx.stroke();}
  if(S.mode==='cast'){const k=1-S.castT/.75;const gg=ctx.createRadialGradient(G.ex,G.ey,0,G.ex,G.ey,90+k*40);gg.addColorStop(0,`rgba(255,240,200,${.35*k})`);gg.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=gg;ctx.fillRect(G.ex-140,G.ey-140,280,280);}
  for(const p of S.parts){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.283);ctx.fill();}
  ctx.restore();
  if(S.strike){const k=ease(clamp(S.strike.t/S.strike.dur,0,1)),x=S.strike.x0+(G.ex-S.strike.x0)*k,y=S.strike.y0+(G.ey-S.strike.y0)*k-Math.sin(k*Math.PI)*60;star(x,y,12,S.t*10,1);if(Math.random()<.9)burst(x,y,2,'#f3d9a6',40,2.5);}
  for(const f of S.floats){const k=1-f.life/1.2;ctx.globalAlpha=clamp(f.life*1.5,0,1);ctx.fillStyle=f.col;ctx.font=`700 ${f.size}px ${FF}`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.strokeStyle='rgba(10,14,16,.7)';ctx.lineWidth=3;ctx.strokeText(f.txt,f.x,f.y-k*40);ctx.fillText(f.txt,f.x,f.y-k*40);}
  ctx.globalAlpha=1;
  if(S.dolor>0){const gr=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);gr.addColorStop(0,'rgba(200,0,30,0)');gr.addColorStop(1,`rgba(200,0,30,${.35*S.dolor})`);ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);}
  if(S.flashW>0){ctx.fillStyle=`rgba(255,250,240,${S.flashW*.7})`;ctx.fillRect(0,0,W,H);}
  if(S.banner){const k=S.banner.t,a=clamp(Math.min(k,2-k)*4,0,1),b=boxRect(),pop=S.banner.pop?1+.25*Math.max(0,1-(2-k)*5):1;ctx.globalAlpha=a;ctx.font=`600 ${Math.round((NARROW?20:19)*pop)}px ${FT}`;ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.strokeStyle='rgba(10,14,16,.8)';ctx.lineWidth=4;ctx.strokeText(S.banner.txt,b.cx,b.t-12-(1-a)*8);ctx.fillStyle='#f5f0e4';ctx.fillText(S.banner.txt,b.cx,b.t-12-(1-a)*8);ctx.globalAlpha=1;}
}
function drawHud(){
  const J=S.J, bw=NARROW?300:340, x=W/2-bw/2, y=16;
  ctx.fillStyle='rgba(10,14,16,.75)'; rrect(x-6,y-4,bw+12,34,8); ctx.fill();
  ctx.fillStyle='rgba(30,40,45,.9)'; rrect(x,y,bw,10,5); ctx.fill();
  ctx.fillStyle='rgba(243,217,166,.45)'; rrect(x,y,Math.max(0,bw*S.ehpGhost/J.vida),10,5); ctx.fill();
  const col=S.phase>=3?'#ff6b6b':S.phase===2?'#d98a8f':'#79adae'; ctx.fillStyle=col; if(S.ehp>0){rrect(x,y,Math.max(10,bw*S.ehp/J.vida),10,5);ctx.fill();}
  ctx.fillStyle='rgba(245,240,228,.8)'; for(const f of J.fases){ctx.fillRect(x+bw*f.umbral-1,y-2,2,14);}
  ctx.fillStyle='#f5f0e4'; ctx.font=`600 12px ${FF}`; ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.fillText(J.nombre+(S.phase>1?' · FASE '+S.phase:''),x,y+14); ctx.textAlign='right'; ctx.fillText(`${Math.round(S.ehp)}/${J.vida}`,x+bw,y+14);
  // jugador: vida, racha y foco
  const b=boxRect(), py=Math.min(H-14,b.b+22), pw=NARROW?120:130, px=b.cx-pw/2+10;
  ctx.textAlign='right'; ctx.textBaseline='middle'; ctx.fillStyle='#c9cfc6'; ctx.font=`600 12px ${FF}`; ctx.fillText('ESTRELLA',px-10,py);
  ctx.fillStyle='rgba(10,14,16,.85)'; rrect(px,py-6,pw,12,6); ctx.fill();
  ctx.fillStyle=S.php/S.pmax<.3?'#d98a8f':'#d9ac68'; if(S.php>0){rrect(px,py-6,Math.max(12,pw*S.php/S.pmax),12,6);ctx.fill();}
  ctx.textAlign='left'; ctx.fillStyle='#f5f0e4'; ctx.fillText(`${S.php}/${S.pmax}${S.noDamage?' · sin daño':''}`,px+pw+8,py);
  const fy=py+16; ctx.fillStyle='rgba(10,14,16,.85)'; rrect(px,fy-3,pw,6,3); ctx.fill();
  ctx.fillStyle=S.focoLleno?'#f3d9a6':'#9fd0cf'; if(S.foco>0){rrect(px,fy-3,Math.max(6,pw*S.foco/100),6,3);ctx.fill();}
  ctx.textAlign='right'; ctx.fillStyle='#9fd0cf'; ctx.font=`600 10px ${FF}`; ctx.fillText('FOCO',px-10,fy);
  if(S.racha>1){ctx.textAlign='left';ctx.fillStyle='#f3d9a6';ctx.font=`700 12px ${FF}`;ctx.fillText(`Racha ×${S.racha}`,px+pw+8,fy+1);}
  if(S.tes>0){ctx.textAlign='right';ctx.fillStyle='#8fc49a';ctx.font=`600 11px ${FF}`;ctx.fillText('té ×'+S.tes,x+bw,y+40);}
}

/* =====================================================================
   BUCLE
   ===================================================================== */
function update(dt){
  if(S.hitstop>0){S.hitstop-=dt;return;}            // pausa de impacto: el golpe "pesa"
  if(S.slow>0){S.slow-=dt;dt*=.35;}                  // cámara lenta al cambiar de fase
  S.t+=dt;
  S.flashW=Math.max(0,S.flashW-dt*1.4); S.dolor=Math.max(0,S.dolor-dt*2.5);
  for(let i=S.ondas.length-1;i>=0;i--){const o=S.ondas[i];o.r+=(o.max-o.r)*Math.min(1,dt*5)+dt*40;o.a-=dt*1.6;if(o.a<=0)S.ondas.splice(i,1);}
  if(S.mode==='cast'){S.castT-=dt; if(Math.random()<.9){const b0=boxRect();S.parts.push({x:G.ex+rand(-20,20),y:G.ey+rand(-20,20),vx:(b0.cx-G.ex)*rand(1.2,2),vy:(b0.cy-G.ey)*rand(1.2,2),life:.5,max:.5,col:'#f3d9a6',size:rand(1.5,3)});}
    if(S.castT<=0){S.mode='dodge';const b0=boxRect();onda(b0.cx,b0.cy,Math.max(b0.w,b0.h)*.7,'243,217,166');shake(3);}}
  for(let i=S.timers.length-1;i>=0;i--){const tm=S.timers[i];tm.t-=dt;if(tm.t<=0){S.timers.splice(i,1);tm.fn();}}
  const bx=S.box,f=1-Math.exp(-dt*(RM?30:9)); bx.w+=(S.boxT.w-bx.w)*f; bx.h+=(S.boxT.h-bx.h)*f;
  S.ehpGhost+=(S.ehp-S.ehpGhost)*Math.min(1,dt*2.2); S.shake=Math.max(0,S.shake-dt*30);
  // jefe: resortes (golpe y aplastamiento), parpadeo, entrada, disolución
  const E=S.enemy;
  E.hv+=(-170*E.hx-13*E.hv)*dt; E.hx+=E.hv*dt; E.sqv+=(-240*E.sq-15*E.sqv)*dt; E.sq+=E.sqv*dt;
  E.flash=Math.max(0,E.flash-dt*4); E.enter=Math.min(1,E.enter+dt/1.2);
  E.blinkT-=dt; E.blink=E.blinkT<0; if(E.blinkT<-.12) E.blinkT=rand(2.5,4.5);
  const invT=S.J.id==='amina'&&S.phase>=2?-1:1; E.inv+=(invT-E.inv)*Math.min(1,dt*(RM?20:3));
  if(E.dissolve>0){E.dissolve=Math.min(1,E.dissolve+dt*.42);if(Math.random()<.7)burst(G.ex+rand(-60,60),G.ey+rand(-50,50),2,'#f3d9a6',90,3);}
  // alma
  const b=boxRect(), s=S.soul;
  if(S.mode==='dodge'){const k=S.keys,sp=175;let mx=(k.ArrowRight||k.d?1:0)-(k.ArrowLeft||k.a?1:0),my=(k.ArrowDown||k.s?1:0)-(k.ArrowUp||k.w?1:0);
    if(mx&&my){mx*=.7071;my*=.7071;} s.x+=mx*sp*dt; s.y+=my*sp*dt;}
  else {s.x+=(b.cx-s.x)*f; s.y+=(b.cy+(RM?0:Math.sin(S.t*2)*4)-s.y)*f;}
  s.x=clamp(s.x,b.l+9,b.r-9); s.y=clamp(s.y,b.t+9,b.b-9); s.inv=Math.max(0,s.inv-dt);
  s.trail.push({x:s.x,y:s.y}); if(s.trail.length>9) s.trail.shift();
  if(S.channel&&!S.channel.stopped){S.channel.t+=dt;if(S.channel.t>=S.channel.dur){S.channel.t=S.channel.dur;stopChannel();}}
  if(S.strike){S.strike.t+=dt;if(S.strike.t>=S.strike.dur){S.strike=null;landStrike();}}
  if(S.banner){S.banner.t-=dt;if(S.banner.t<=0)S.banner=null;}
  for(let i=S.warns.length-1;i>=0;i--){S.warns[i].t-=dt;if(S.warns[i].t<=0)S.warns.splice(i,1);}
  for(let i=S.labels.length-1;i>=0;i--){S.labels[i].t-=dt;if(S.labels[i].t<=0)S.labels.splice(i,1);}
  if(S.pattern2&&S.mode==='dodge'){const q=S.pattern2;q.t+=dt;if(q.t<q.dur-.7)q.P.step(q,dt,b,q.h);}
  if(S.pattern&&S.mode==='dodge'){const p=S.pattern;p.t+=dt;if(p.t<p.dur-.7)p.P.step(p,dt,b,p.h);if(p.t>=p.dur)endDodge();}
  // láseres
  for(let i=S.lasers.length-1;i>=0;i--){const l=S.lasers[i];
    if(l.charge>0){l.charge-=dt;if(l.charge<=0)AU.sfx.laser();continue;}
    l.active-=dt; if(l.active<=0){S.lasers.splice(i,1);continue;}
    const d=l.vertical?Math.abs(s.x-l.pos):Math.abs(s.y-l.pos);
    if(S.mode==='dodge'){ if(d<l.w/2+3.5) hurt(); else if(d<l.w/2+16&&!l.grazed){l.grazed=true;graze(s.x,s.y);} }}
  // balas
  for(let i=S.bullets.length-1;i>=0;i--){const bl=S.bullets[i];bl.age+=dt;let dead=false,danger=true;
    if(bl.life!==undefined){bl.life-=dt;if(bl.life<=0)dead=true;}
    switch(bl.k){
      case 'onda': bl.y+=bl.vy*dt; bl.x+=Math.sin(bl.age*3+bl.sway)*30*dt; dead=dead||bl.y<b.t-16; break;
      case 'nube': if(bl.age<.7){danger=false;}else{bl.r=Math.min(bl.rmax,bl.r+dt*60);} if(bl.life<.4)danger=false; break;
      case 'apunta': if(bl.wait>0){bl.wait-=dt;danger=false;if(bl.wait<=0){const a=Math.atan2(s.y-bl.y,s.x-bl.x);bl.vx=Math.cos(a)*bl.spd;bl.vy=Math.sin(a)*bl.spd;}}
        else{bl.x+=bl.vx*dt;bl.y+=bl.vy*dt;dead=bl.x<b.l-30||bl.x>b.r+30||bl.y<b.t-30||bl.y>b.b+30;} break;
      case 'rebote': bl.rot+=dt*3; bl.x+=bl.vx*dt; bl.y+=bl.vy*dt;
        if(bl.x<b.l+bl.r){bl.x=b.l+bl.r;bl.vx=Math.abs(bl.vx);} if(bl.x>b.r-bl.r){bl.x=b.r-bl.r;bl.vx=-Math.abs(bl.vx);}
        if(bl.y<b.t+bl.r){bl.y=b.t+bl.r;bl.vy=Math.abs(bl.vy);} if(bl.y>b.b-bl.r){bl.y=b.b-bl.r;bl.vy=-Math.abs(bl.vy);} break;
      case 'dimero': bl.rot+=dt*4; bl.x+=bl.vx*dt;
        if(Math.abs(bl.x-b.cx)<12&&!bl.boom){dead=true;if(bl.vx<0){for(let j=0;j<8;j++){const a=j/8*6.283+.2;S.bullets.push(B({k:'bola',x:b.cx,y:bl.y,vx:Math.cos(a)*120,vy:Math.sin(a)*120,r:5,col:'#ffa04d',life:2}));}burst(b.cx,bl.y,14,'#ffa04d',120);}} break;
      case 'hex': bl.rot+=bl.spin*dt; bl.x+=bl.vx*dt; bl.y+=bl.vy*dt; dead=bl.y>b.b+16; break;
      case 'homing': {const want=Math.atan2(s.y-bl.y,s.x-bl.x),cur=Math.atan2(bl.vy,bl.vx),d=Math.atan2(Math.sin(want-cur),Math.cos(want-cur)),nw=cur+clamp(d,-2*dt,2*dt);
        bl.vx=Math.cos(nw)*bl.spd;bl.vy=Math.sin(nw)*bl.spd;bl.x+=bl.vx*dt;bl.y+=bl.vy*dt;break;}
      case 'ring': {const r=bl.ring,a=r.rot+bl.i/bl.n*6.283;bl.x=b.cx+Math.cos(a)*r.R;bl.y=b.cy+Math.sin(a)*r.R;dead=r.dead;break;}
      case 'sigma': {const v=bl.v0*Math.exp(-.011*bl.dist);bl.dist+=v*dt;bl.x+=bl.dir*v*dt;if(v<26)bl.fade-=dt*2.2;dead=bl.fade<=0;break;}
      case 'tetra': {const a=Math.atan2(s.y-bl.y,s.x-bl.x),acc=260;bl.vx+=Math.cos(a)*acc*dt;bl.vy+=Math.sin(a)*acc*dt;const v=Math.hypot(bl.vx,bl.vy),mx=120;if(v>mx){bl.vx*=mx/v;bl.vy*=mx/v;}
        bl.x+=bl.vx*dt;bl.y+=bl.vy*dt;if(bl.age>3){dead=true;for(let j=0;j<8;j++){const aa=j/8*6.283;S.bullets.push(B({k:'bola',x:bl.x,y:bl.y,vx:Math.cos(aa)*120,vy:Math.sin(aa)*120,r:4,life:2.2}));}burst(bl.x,bl.y,10,'#ffffff',100);}break;}
      default: bl.x+=bl.vx*dt; bl.y+=bl.vy*dt; if(bl.sway!==undefined)bl.x+=Math.sin(bl.age*3+bl.sway)*22*dt;
        dead=dead||bl.y>b.b+20||bl.y<b.t-40||bl.x<b.l-40||bl.x>b.r+40;
    }
    if(dead){S.bullets.splice(i,1);continue;}
    if(S.mode==='dodge'&&danger){const d=Math.hypot(bl.x-s.x,bl.y-s.y);if(d<bl.r+4)hurt();else if(d<bl.r+16&&!bl.grazed&&bl.age>.1){bl.grazed=true;graze(bl.x,bl.y);}}
  }
  for(let i=S.parts.length-1;i>=0;i--){const p=S.parts[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.95;p.vy*=.95;if(p.life<=0)S.parts.splice(i,1);}
  for(let i=S.floats.length-1;i>=0;i--){S.floats[i].life-=dt;if(S.floats[i].life<=0)S.floats.splice(i,1);}
}
function render(dt){
  ctx.setTransform(G.k,0,0,G.k,0,0);
  if(pantalla==='mapa'||!S){ A.cam.x=A.cam.y=0; A.pintarArena('trono',ctx,W,H,G,G.k,tMapa,1,dt); A.pintarFrente('trono',ctx,W,H,G,G.k,tMapa,1,dt); ctx.fillStyle='rgba(8,12,14,.5)'; ctx.fillRect(0,0,W,H); return; }
  const sx=S.shake?rand(-S.shake,S.shake)*.6:0, sy=S.shake?rand(-S.shake,S.shake)*.6:0; ctx.translate(sx,sy);
  // paralaje suave: el escenario se desplaza un poco según dónde está la estrella
  A.cam.x+=((S.soul.x-W/2)/(W/2)-A.cam.x)*Math.min(1,dt*3); A.cam.y+=((S.soul.y-G.by)/(H/2)-A.cam.y)*Math.min(1,dt*3);
  A.pintarArena(S.J.arena,ctx,W,H,G,G.k,S.t,S.phase,dt);
  const E=S.enemy;
  A.jefes[S.J.id](ctx,G.ex+E.hx,G.ey,NARROW?.95:1,{t:S.t,fase:S.phase,flash:E.flash,sq:clamp(E.sq,-.25,.25),look:Math.atan2(S.soul.y-G.ey,S.soul.x-G.ex),blink:E.blink,
    enter:E.enter,dissolve:E.dissolve,atacando:!!E.atk,especial:E.inv,feliz:E.feliz});
  A.pintarFrente(S.J.arena,ctx,W,H,G,G.k,S.t,S.phase,dt);
  drawBox(); drawBullets(); drawSoul(); drawFx(); drawHud();
}
let last=performance.now();
let lento=0;
function frame(now){
  const dtReal=(now-last)/1000, dt=Math.min(.05,dtReal); last=now;
  // si va lento por varios segundos (computador o celular modesto), se apagan efectos decorativos
  if(pantalla==='pelea'&&!A.baja&&!document.hidden){ lento=dtReal>.034&&dtReal<.5?lento+1:Math.max(0,lento-2); if(lento>150){A.baja=true;console.info('Nexo: calidad baja activada para mantener la fluidez');} }
  if(pantalla==='mapa'){tMapa+=0;pintarMinis(dt);}
  else if(S) update(dt);
  try{ render(dt); }catch(e){ console.error(e); }
  requestAnimationFrame(frame);
}

/* =====================================================================
   CONTROLES
   ===================================================================== */
const KEYS=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'];
addEventListener('keydown',e=>{
  if(e.target.closest&&e.target.closest('input,textarea'))return;
  const k=e.key.length===1?e.key.toLowerCase():e.key;
  if(!S){ if(k==='m')toggleMute(); return; }
  if(KEYS.includes(k)){S.keys[k]=true;if(S.mode==='dodge')e.preventDefault();}
  if((k===' '||k==='Enter')&&S.mode==='channel'){e.preventDefault();stopChannel();}
  if(k==='m')toggleMute();
  if(S.mode==='action'&&/^[1-6]$/.test(k)){const o=$('accion').querySelectorAll('.opt:not(:disabled)'),all=$('accion').querySelectorAll('.opt');const btn=all[+k-1];if(btn&&!btn.disabled&&o.length)btn.click();}
});
addEventListener('keyup',e=>{if(!S)return;const k=e.key.length===1?e.key.toLowerCase():e.key;S.keys[k]=false;});
addEventListener('blur',()=>{if(S)S.keys={};});
let drag=null;
cv.addEventListener('pointerdown',e=>{if(!S)return;if(S.mode==='channel'){stopChannel();return;}if(S.mode!=='dodge')return;cv.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY};});
cv.addEventListener('pointermove',e=>{if(!drag||!S||S.mode!=='dodge')return;const k=W/cv.clientWidth*1.25;S.soul.x+=(e.clientX-drag.x)*k;S.soul.y+=(e.clientY-drag.y)*k;drag={x:e.clientX,y:e.clientY};});
const endDrag=()=>{drag=null;}; cv.addEventListener('pointerup',endDrag); cv.addEventListener('pointercancel',endDrag);
function toggleMute(){AU.init();const on=AU.toggle();$('mute').textContent='Sonido: '+(on?'sí':'no');$('mute').setAttribute('aria-pressed',String(!on));}
$('mute').onclick=toggleMute;
$('nodmg').onclick=()=>{if(!S)return;S.noDamage=!S.noDamage;$('nodmg').textContent='Sin daño: '+(S.noDamage?'sí':'no');$('nodmg').setAttribute('aria-pressed',String(S.noDamage));};
$('btnMapa').onclick=()=>{if(S&&S.mode!=='end'&&!confirm('¿Salir de la pelea y volver al mapa?'))return;mostrarMapa();};
addEventListener('resize',()=>{layout();});

layout(); mostrarMapa(); requestAnimationFrame(frame);
// Ganchos para pruebas automáticas (no afectan el juego).
window.__pep1={tick(dt=.05,dibujar=true){if(S)update(dt);else pintarMinis(dt);if(dibujar)render(dt);},get S(){return S;},get prog(){return prog;},empezar,mostrarMapa,pickChallenge,enemyTurn,endGame,stopChannel,PATRONES,AU};
})();
