/* GSAP opcional para microinteracciones; nunca se carga con movimiento reducido. */
(() => {
  'use strict';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('reduce-motion');
  const presets={
    fadeIn:[{opacity:0},{opacity:1,duration:.2}],
    slideIn:[{opacity:0,y:14},{opacity:1,y:0,duration:.26}],
    scalePop:[{opacity:0,scale:.93},{opacity:1,scale:1,duration:.26}],
    rewardPop:[{scale:.88},{scale:1,duration:.36,ease:'back.out(1.5)'}],
    equipPulse:[{filter:'brightness(1.6)'},{filter:'brightness(1)',duration:.3}],
    modalEnter:[{opacity:0,scale:.96},{opacity:1,scale:1,duration:.2}],
    modalExit:[{opacity:1,scale:1},{opacity:0,scale:.97,duration:.16}]
  };
  async function run(target,preset='fadeIn') {
    if (!target || reduced()) return;
    try {
      await window.NexoLoader.script('./vendor/gsap/gsap.min.js');
      if(!target.isConnected)return;
      const [from,to]=presets[preset]||presets.fadeIn;
      window.gsap?.fromTo(target,from,{...to,ease:to.ease||'power1.out',clearProps:'transform,opacity,filter'});
    } catch { /* La interfaz sigue funcionando sin animación. */ }
  }
  let navigationAnimation=null, openingLeaf=null, openedInMemory=false, origin=null, previousFolio=null, previousPages=null;
  const running=new Set();
  function prepare(root) {
    const source=root.querySelector('.continue-volume');
    const rect=source?.getBoundingClientRect();
    origin=rect&&rect.bottom>0&&rect.top<innerHeight?rect:null;
    previousFolio=root.querySelector('.grimoire-folio')?.innerHTML||null;
    const spread=root.querySelector('.grimoire-spread');
    if(spread) {
      const s=spread.getBoundingClientRect(),rel=el=>{const r=el.getBoundingClientRect();return {left:r.left-s.left,top:r.top-s.top,width:r.width,height:r.height};};
      const front=spread.querySelector('.grimoire-frontispiece'),folio=spread.querySelector('.grimoire-folio');
      previousPages={course:root.querySelector('.grimoire')?.dataset.bookCourse||'index',route:root.dataset.renderedRoute||'',
        front:front?{html:front.innerHTML,rect:rel(front)}:null,folio:folio?{html:folio.innerHTML,rect:rel(folio)}:null};
    } else previousPages=null;
  }
  function animate(target,frames,options) {
    const animation=target.animate(frames,options);
    running.add(animation);
    animation.finished.finally(()=>running.delete(animation)).catch(()=>{});
    return animation;
  }
  function cancel() {
    running.forEach(animation=>animation.cancel());running.clear();
    navigationAnimation=null;if(openingLeaf?._cleanup)openingLeaf._cleanup();else openingLeaf?.remove();openingLeaf=null;
  }
  function transitionFor(previous,next,opened) {
    const from=String(previous||'').split('/'), to=String(next||'').split('/');
    const learn=parts=>['learn','subjects','subject','lesson','library','knowledge','inspector'].includes(parts[0]);
    if(previous===next) return {kind:'none',duration:0};
    if(learn(to)&&!learn(from)) return {kind:opened?'book-return':'book-first',duration:opened?420:3400};
    if(learn(from)&&to[0]==='home') return {kind:'book-close',duration:380};
    if(learn(to)&&learn(from)) return {kind:'page-turn',duration:820};
    return {kind:'none',duration:0};
  }

  /* ---------------------------------------------------------------- Intro del grimorio
     Capa fija sobre la pantalla (no depende del scroll). La portada aparece UNA vez por sesión (sessionStorage);
     después, entrar o salir del grimorio es solo un fundido suave. Guion completo más abajo (UPDATE 01.7). */
  const ASSETS=['assets/grimoire/grimoire-cover.webp','assets/grimoire/grimoire-cover-glow.webp','assets/grimoire/grimoire-cover-clasp.png','assets/grimoire/grimoire-endpaper.webp'];
  let preloaded=false;const decoded=[];
  function preload() {
    // Se descargan y DECODIFICAN antes de usarlas; si no, el navegador pinta la tapa vacía un instante.
    if(preloaded||typeof Image==='undefined')return; preloaded=true;
    ASSETS.forEach(src=>{const img=new Image();img.src=src;decoded.push(img);img.decode?.().catch(()=>{});});
  }
  if(typeof window!=='undefined'&&typeof window.addEventListener==='function')window.addEventListener('load',()=>(window.requestIdleCallback||setTimeout)(preload,{timeout:4000}));
  /* UPDATE 01.7 — intro épica (una sola vez por sesión, 3,4 s):
       (UPDATE 01.8: libro, broche, tapa, hojas y cámara van con resortes; la tapa golpea la mesa ~2,28 s)
       0–700    oscuridad; aparece un círculo mágico de runas detrás y empiezan a subir motas de luz
       250–1000 el grimorio sube flotando hasta su lugar
       700–1500 las runas de la portada se encienden en círculo; las motas giran hacia el libro
       1330     la gema destella (estrella de luz)          1500–1750 se suelta el broche
       1750–2600 la tapa se abre: sale luz de las páginas, rayos dorados y un estallido de chispas
       2050–2700 páginas que se levantan
       2650–3400 la cámara "entra" al libro con un resplandor cálido y aparece el grimorio real */
  const RUNES=[[[0,-1,0,1],[0,-.2,-.6,-.8],[0,.2,.6,-.4]],[[-.8,.7,0,-.8,.8,.7,-.8,.7],[-.45,.1,.45,.1]],[[0,1,0,-1],[-.6,-.4,0,-1,.6,-.4],[-.5,.35,.5,.35]],
    [[-.9,.2,-.45,-.4,0,.2,.45,-.4,.9,.2],[-.6,.7,.6,.7]],[[-.5,-1,-.5,1],[.5,-1,.5,1],[-.5,0,0,-.5,.5,0,0,.5,-.5,0]],[[-.7,-.7,.7,.7],[.7,-.7,-.7,.7]],
    [[0,-1,.25,-.25,1,0,.25,.25,0,1,-.25,.25,-1,0,-.25,-.25,0,-1]],[[-.7,1,-.7,-.3,0,-1,.7,-.3,.7,1],[-.7,.3,.7,.3]],[[.3,-.9,-.5,-.5,-.6,.3,-.1,.85,.4,.75]]];
  function circleSVG(kind) {
    // círculo mágico dibujado con las mismas runas inventadas de la portada
    const C=500,parts=[];
    const circ=(r,w,o=1,dash='')=>parts.push(`<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke-width="${w}" opacity="${o}"${dash?` stroke-dasharray="${dash}"`:''}/>`);
    if(kind==='outer') {
      circ(478,3);circ(462,1.4);circ(392,1.4);circ(376,3);
      for(let k=0;k<72;k++){const a=k/72*Math.PI*2,r0=466,r1=k%6?472:476;parts.push(`<line x1="${C+Math.cos(a)*r0}" y1="${C+Math.sin(a)*r0}" x2="${C+Math.cos(a)*r1}" y2="${C+Math.sin(a)*r1}" stroke-width="1.4"/>`);}
      for(let k=0;k<30;k++){
        const a=-Math.PI/2+k/30*Math.PI*2,cx=C+Math.cos(a)*427,cy=C+Math.sin(a)*427,out=[Math.cos(a),Math.sin(a)],tan=[-Math.sin(a),Math.cos(a)],sc=17;
        for(const st of RUNES[(k*4)%RUNES.length]){const pts=[];for(let i=0;i<st.length;i+=2){const gx=st[i],gy=st[i+1];pts.push(`${(cx+(gx*tan[0]-gy*out[0])*sc).toFixed(1)},${(cy+(gx*tan[1]-gy*out[1])*sc).toFixed(1)}`);}parts.push(`<polyline points="${pts.join(' ')}" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);}
      }
    } else {
      circ(330,2.2);circ(318,1,.8,'4 10');circ(150,2);circ(120,1.2,.8);
      const hex=k=>[C+300*Math.cos(Math.PI/6+k*Math.PI/3),C+300*Math.sin(Math.PI/6+k*Math.PI/3)];
      const pts=[0,1,2,3,4,5,0].map(hex).map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
      parts.push(`<polyline points="${pts}" fill="none" stroke-width="2.4"/>`);
      for(let k=0;k<6;k++){const [x,y]=hex(k);parts.push(`<circle cx="${x}" cy="${y}" r="16" fill="none" stroke-width="2"/>`,`<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" stroke-width="1" opacity=".5"/>`);}
      for(let k=0;k<12;k++){const a=k/12*Math.PI*2,x=C+Math.cos(a)*226,y=C+Math.sin(a)*226,r=k%2?7:12;parts.push(`<path d="M${x} ${y-r}L${x+r*.3} ${y-r*.3}L${x+r} ${y}L${x+r*.3} ${y+r*.3}L${x} ${y+r}L${x-r*.3} ${y+r*.3}L${x-r} ${y}L${x-r*.3} ${y-r*.3}Z" fill="currentColor" stroke="none"/>`);}
    }
    return `<svg viewBox="0 0 1000 1000" aria-hidden="true" focusable="false" stroke="currentColor">${parts.join('')}</svg>`;
  }
  function introMarkup() {
    const sparks=Array.from({length:7},(_,i)=>`<i class="gi-spark" style="--i:${i}"></i>`).join('');
    return `<div class="gi-backdrop"></div><div class="gi-rays"></div>
      <div class="gi-circle gi-circle-outer">${circleSVG('outer')}</div><div class="gi-circle gi-circle-inner">${circleSVG('inner')}</div>
      <div class="gi-motes"></div>
      <div class="gi-stage"><div class="gi-book">
      <div class="gi-block"><div class="gi-pagelight"></div><div class="gi-page gi-page-1"></div><div class="gi-page gi-page-2"></div><div class="gi-page gi-page-3"></div></div>
      <div class="gi-cover"><div class="gi-front"><img class="gi-art" src="${ASSETS[0]}" alt="" decoding="sync"><div class="gi-glow"></div><div class="gi-gem"></div><div class="gi-flare"></div><div class="gi-sheen"></div><div class="gi-clasp"></div></div><div class="gi-back"><img class="gi-art" src="${ASSETS[3]}" alt="" decoding="sync"></div></div>
      <div class="gi-sparks">${sparks}</div></div>
      <div class="gi-bloom"><div class="gi-bloom-light"></div><div class="gi-sigil">${circleSVG('inner')}</div></div></div>
      <div class="gi-flash"></div><p class="gi-hint"><span class="gi-hint-mouse">Haz clic o presiona Esc para saltar</span><span class="gi-hint-touch">Toca para saltar</span></p>`;
  }
  function timeline(el,frames,start,dur,_total,easing='ease-in-out') {
    if(!el)return null;
    return animate(el,frames,{duration:dur,delay:start,easing,fill:'both'});
  }
  function grimoireIntro(book,spec) {
    preload();
    const T=spec.duration,low=document.body.dataset.nexoQuality==='low';
    const layer=document.createElement('div');
    layer.className='grimoire-intro';layer.dataset.kind=spec.kind;layer.setAttribute('aria-hidden','true');
    layer.innerHTML=introMarkup();
    document.body.append(layer);
    const q=sel=>layer.querySelector(sel),wide=innerWidth>760;
    const shiftPx=wide?Math.round(q('.gi-book').offsetWidth/2):0,shift=shiftPx+'px';   // en pantallas anchas el libro abierto queda centrado
    const hold=animate(book,[{opacity:0},{opacity:0,offset:.86},{opacity:1}],{duration:T,easing:'ease-out'});
    q('.gi-stage').style.opacity='0';q('.gi-backdrop').style.opacity='.9';
    // motas de luz: suben, giran hacia el libro y estallan al abrirse
    const motes=q('.gi-motes'),R=Math.min(innerWidth,innerHeight);
    for(let i=0;i<(low?14:38);i++) {
      const m=document.createElement('i');m.className='gi-mote';motes.append(m);
      const a0=Math.random()*Math.PI*2,r0=R*(.32+Math.random()*.28),a1=a0+(Math.random()<.5?1:-1)*(1.2+Math.random()),r1=R*(.12+Math.random()*.1),a2=a1+.6,r2=R*(.45+Math.random()*.35);
      const P=(a,r,dy=0)=>`translate(${(Math.cos(a)*r).toFixed(1)}px,${(Math.sin(a)*r*.75+dy).toFixed(1)}px)`;
      const size=.5+Math.random()*.9;
      m.style.setProperty('--s',size.toFixed(2));
      m._spec=[[{transform:P(a0,r0,R*.25)+' scale(.3)',opacity:0},{transform:P((a0+a1)/2,(r0+r1)/2)+' scale(1)',opacity:.95,offset:.35},{transform:P(a1,r1)+' scale(.8)',opacity:.85,offset:.62},{transform:P(a2,r2,-R*.1)+' scale(.2)',opacity:0}],Math.random()*500,2500+Math.random()*500];
    }
    const arts=[...layer.querySelectorAll('img.gi-art')].map(img=>img.decode?img.decode().catch(()=>{}):Promise.resolve());
    const ready=Promise.race([Promise.all(arts),new Promise(r=>setTimeout(r,260))]);
    /* Piezas con peso (skill nexo-animacion, resortes de core/movimiento.js): el libro sube y aterriza con pausa de impacto,
       el broche tira hacia atrás antes de saltar, la tapa cae sobre la mesa y rebota, las hojas llegan tarde y la cámara
       retrocede antes de entrar. Luces, círculo y motas siguen en la línea de tiempo de `start`; en cada pausa de impacto
       se congela todo junto (las animaciones se pausan, los resortes dejan de avanzar). */
    const movimiento=()=>{
      const mov=window.NexoMovimiento,esc=mov.escena(),stage=q('.gi-stage'),bookEl=q('.gi-book'),bloom=q('.gi-bloom'),cover=q('.gi-cover'),clasp=q('.gi-clasp');
      const pages=[...layer.querySelectorAll('.gi-page')],shaken=[stage,...layer.querySelectorAll('.gi-circle,.gi-rays')];
      const subida=esc.resorte({rigidez:35,amortiguacion:8,valor:90}),flota=esc.resorte('brillo'),aplasta=esc.resorte({preset:'aplastar',valor:1});
      const broche=esc.resorte('corcho'),tapa=esc.resorte({rigidez:22,amortiguacion:6.5}),corrimiento=esc.resorte('camara');
      const hojas=pages.map(()=>esc.resorte({rigidez:70,amortiguacion:11})),camara=esc.resorte({rigidez:120,amortiguacion:16,valor:1});
      const MESA=-168;   // ángulo en que la tapa abierta toca la mesa
      const impacto=(golpe,efecto)=>{esc.golpe(golpe);mov.sonido(efecto);};
      let tiempo=0,previo=performance.now(),aterrizo=false,golpeo=false,pausadas=[];
      const pendientes=[
        [250,()=>{subida.meta=0;}],
        [1000,()=>{flota.meta=-7;}],
        [1500,()=>{broche.meta=24;broche.empujar(-70);mov.sonido('preparar');}],
        [1750,()=>{flota.meta=0;tapa.meta=-200;tapa.empujar(40);corrimiento.meta=shiftPx;}],
        [2650,()=>{camara.meta=1.24;camara.empujar(-.35);}]
      ];
      const pintar=()=>{
        const sy=aplasta.valor,sacudida=esc.temblor(),angulo=Math.min(3,Math.max(MESA,tapa.valor));
        stage.style.transform=`translateY(${mov.alinear(subida.valor)}px) scale(${(1+(1-sy)*.5).toFixed(3)},${sy.toFixed(3)})`;
        stage.style.scale=camara.valor.toFixed(4);
        shaken.forEach(el=>{el.style.translate=`${sacudida.x}px ${sacudida.y}px`;});
        bookEl.style.transform=`translateY(${mov.alinear(flota.valor)}px)`;
        bookEl.style.translate=bloom.style.translate=`${Math.round(corrimiento.valor)}px 0`;
        cover.style.transform=`rotateY(${angulo.toFixed(2)}deg) translateZ(${(18*Math.sin(Math.PI*Math.max(0,Math.min(1,angulo/MESA)))).toFixed(1)}px)`;
        clasp.style.transform=`translateX(${broche.valor.toFixed(1)}%) rotate(${(broche.valor*.36).toFixed(1)}deg)`;
        pages.forEach((page,i)=>{page.style.transform=`rotateY(${Math.max(-178,hojas[i].valor).toFixed(2)}deg)`;});
      };
      const cuadro=ahora=>{
        if(!layer.isConnected)return;
        // Se avanza por tramos de 50 ms para seguir el reloj real aunque el equipo vaya lento (la línea de tiempo no espera).
        for(let resto=Math.min(Math.max((ahora-previo)/1000,0),.3);resto>1e-6;resto-=.05)tiempo+=esc.paso(Math.min(resto,.05))*1000;
        previo=ahora;
        for(const evento of pendientes.filter(([t])=>tiempo>=t)){pendientes.splice(pendientes.indexOf(evento),1);evento[1]();}
        if(!aterrizo&&tiempo>=250&&subida.valor<=0) {aterrizo=true;aplasta.empujar(-2);impacto({pausa:.07,temblor:2,duracion:.3},'golpe');}
        if(!golpeo&&tiempo>=1750&&tapa.valor<=MESA) {
          golpeo=true;tapa.valor=tapa.meta=MESA;tapa.velocidad=Math.abs(tapa.velocidad)*.28;aplasta.empujar(-1.4);
          impacto({pausa:.08,temblor:5,duracion:.5},'golpe');
          hojas.forEach((hoja,i)=>pendientes.push([tiempo+60+i*90,()=>{hoja.meta=-(150+i*8);}]));
        }
        if(esc.pausado()&&!pausadas.length){pausadas=[...running].filter(a=>a.playState==='running');pausadas.forEach(a=>a.pause());}
        else if(!esc.pausado()&&pausadas.length){pausadas.forEach(a=>{if(a.playState==='paused')a.play();});pausadas=[];}
        pintar();
        requestAnimationFrame(cuadro);
      };
      stage.style.transformOrigin='50% 88%';
      pintar();
      requestAnimationFrame(cuadro);
    };
    let started=false;
    const start=()=>{
      if(started||!layer.isConnected)return; started=true;
      q('.gi-stage').style.opacity='';q('.gi-backdrop').style.opacity='';
      try{hold.currentTime=0;}catch{}
      window.NexoAudio?.play?.('grimoire');
      movimiento();
      timeline(q('.gi-backdrop'),[{opacity:.9},{opacity:1}],0,500,T,'ease-out');
      // círculo mágico: aparece, gira (cada anillo hacia un lado), se intensifica y se apaga
      [['.gi-circle-outer',70],['.gi-circle-inner',-110]].forEach(([sel,deg])=>{
        timeline(q(sel),[{opacity:0,transform:`scale(.72) rotate(0deg)`},{opacity:.85,transform:`scale(1) rotate(${deg*.25}deg)`,offset:.22},{opacity:1,transform:`scale(1.02) rotate(${deg*.45}deg)`,offset:.44},{opacity:.55,transform:`scale(1.12) rotate(${deg*.75}deg)`,offset:.76},{opacity:0,transform:`scale(1.35) rotate(${deg}deg)`}],0,T,T,'ease-in-out');
      });
      [...motes.children].forEach(m=>timeline(m,m._spec[0],m._spec[1],m._spec[2],T,'cubic-bezier(.3,.1,.3,1)'));
      timeline(q('.gi-stage'),[{opacity:0},{opacity:1}],250,560,T,'ease-out');
      timeline(q('.gi-glow'),[{opacity:0,'--sweep':'0deg'},{opacity:.95,'--sweep':'200deg',offset:.55},{opacity:.9,'--sweep':'390deg'}],700,800,T);
      timeline(q('.gi-glow'),[{filter:'brightness(1)'},{filter:'brightness(1.45)'},{filter:'brightness(.6)'}],1500,1100,T);
      timeline(q('.gi-sheen'),[{backgroundPosition:'130% 0',opacity:0},{opacity:1,offset:.2},{backgroundPosition:'-30% 0',opacity:0}],750,800,T);
      timeline(q('.gi-gem'),[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.25)',offset:.5},{opacity:.8,transform:'scale(1)'}],1250,500,T);
      timeline(q('.gi-flare'),[{opacity:0,transform:'translate(-50%,-50%) rotate(0deg) scale(.2)'},{opacity:1,transform:'translate(-50%,-50%) rotate(25deg) scale(1.15)',offset:.4},{opacity:0,transform:'translate(-50%,-50%) rotate(55deg) scale(.5)'}],1330,480,T,'ease-out');
      timeline(q('.gi-clasp'),[{opacity:1},{opacity:1,offset:.35},{opacity:0}],1500,250,T,'cubic-bezier(.5,0,.6,1)');
      timeline(q('.gi-pagelight'),[{opacity:0},{opacity:1,offset:.45},{opacity:.35}],1850,900,T,'ease-out');
      // de la página en blanco sale luz y se "escribe" un sello mágico
      timeline(q('.gi-bloom-light'),[{opacity:0,transform:'scale(.4)'},{opacity:1,transform:'scale(1)',offset:.4},{opacity:.75,transform:'scale(1.15)'}],2150,1000,T,'ease-out');
      timeline(q('.gi-sigil'),[{opacity:0,clipPath:'circle(0% at 50% 50%)',transform:'rotate(-40deg) scale(.8)'},{opacity:1,clipPath:'circle(70% at 50% 50%)',transform:'rotate(0deg) scale(1)',offset:.6},{opacity:.9,clipPath:'circle(70% at 50% 50%)',transform:'rotate(12deg) scale(1.05)'}],2250,850,T,'cubic-bezier(.3,.1,.3,1)');
      timeline(q('.gi-rays'),[{opacity:0,transform:'translate(-50%,-50%) rotate(0deg) scale(.6)'},{opacity:.85,transform:'translate(-50%,-50%) rotate(12deg) scale(1)',offset:.35},{opacity:0,transform:'translate(-50%,-50%) rotate(30deg) scale(1.3)'}],1900,1200,T,'ease-out');
      layer.querySelectorAll('.gi-spark').forEach((spark,i)=>timeline(spark,[{opacity:0,transform:'translate(0,0) scale(.5)'},{opacity:.9,offset:.35},{opacity:0,transform:`translate(${(i%2?1:-1)*(8+i*3)}px,${-40-i*9}px) scale(1)`}],900+i*110,1100,T,'ease-out'));
      // estallido de chispas al abrirse
      const burst=q('.gi-motes');
      for(let i=0;i<(low?12:44);i++) {
        const s=document.createElement('i');s.className='gi-mote gi-burst';burst.append(s);
        const a=Math.random()*Math.PI*2,d=R*(.2+Math.random()*.45);s.style.setProperty('--s',(.8+Math.random()*1.1).toFixed(2));
        timeline(s,[{transform:`translate(${shift},0) scale(1.2)`,opacity:0},{opacity:1,offset:.12},{transform:`translate(calc(${shift} + ${(Math.cos(a)*d).toFixed(1)}px),${(Math.sin(a)*d*.8-R*.05).toFixed(1)}px) scale(.2)`,opacity:0}],2300+Math.random()*250,900+Math.random()*500,T,'cubic-bezier(.1,.7,.3,1)');
      }
      timeline(q('.gi-hint'),[{opacity:0},{opacity:.7,offset:.2},{opacity:.7,offset:.85},{opacity:0}],300,2300,T);
      timeline(q('.gi-flash'),[{opacity:0},{opacity:.55,offset:.45},{opacity:0}],2700,700,T,'ease-in-out');
      timeline(layer,[{opacity:1},{opacity:0}],2950,450,T,'ease-in');
      Promise.all([...running].filter(a=>a.effect?.target&&layer.contains(a.effect.target)||a.effect?.target===layer).map(a=>a.finished)).then(done,done);
    };
    const finish=()=>{start();running.forEach(a=>{try{a.finish();}catch{}});};
    const onKey=e=>{if(['Escape','Enter',' '].includes(e.key)){e.preventDefault();finish();}};
    layer.addEventListener('pointerdown',finish);document.addEventListener('keydown',onKey,true);
    const done=()=>{document.removeEventListener('keydown',onKey,true);layer.remove();if(openingLeaf===layer)openingLeaf=null;};
    hold.finished.catch(()=>{});
    layer._cleanup=done;
    ready.then(start);
    return layer;
  }
  /* ---------------------------------------------------------------- UPDATE 01.6 — cambio de página real
     La hoja que se da vuelta se arma con 7 tiras verticales anidadas: cada tira gira un poco respecto
     de la anterior, así la hoja se CURVA como papel. El anverso muestra la página vieja y el reverso el
     papel del ramo nuevo; al aterrizar, el reverso se funde con la página nueva.
     Adelante (ramo siguiente / más profundo): gira la página derecha hacia la izquierda.
     Atrás (ramo anterior / volver al índice): gira la izquierda hacia la derecha. */
  function routeKey(route) {
    const parts=String(route||'').split('/'),ids=Object.keys(window.NexoRooms?.courses||{});
    if(parts[0]!=='learn')return [ids.length+1,0];
    if(parts[1]==='course')return [ids.indexOf(parts[2]),parts[3]==='evaluation'?(parts[5]?3:2):parts[3]?4:1];
    if(parts[1])return [ids.length,1];
    return [-1,0];
  }
  function turnDirection(previous,next) {
    const a=routeKey(previous),b=routeKey(next);
    return (b[0]<a[0]||(b[0]===a[0]&&b[1]<a[1]))?-1:1;
  }
  function decorVars(course) {
    if(!course||course==='index')return "--decor-tile:url('assets/grimoire/decor/index-tile.svg');--decor-hero:none;--decor-foot:none;";
    const u=part=>`url('assets/grimoire/decor/${course}-${part}.svg')`;
    return `--decor-tile:${u('tile')};--decor-hero:${u('hero')};--decor-foot:${u('foot')};`;
  }
  function pageCurl(book,dir,T) {
    const spread=book.querySelector('.grimoire-spread');
    const prev=previousPages,fwd=dir>0;
    if(!spread||!prev)return null;
    const turning=fwd?prev.folio:prev.front, staying=fwd?prev.front:prev.folio;
    const target=(fwd?spread.querySelector('.grimoire-frontispiece'):spread.querySelector('.grimoire-folio'));
    const sr=spread.getBoundingClientRect(),tr=target?.getBoundingClientRect();
    const landW=tr?tr.width:staying.rect.width, W=turning.rect.width, H=Math.max(turning.rect.height,staying.rect.height);
    const N=7, sw=W/N, oldAccent=window.NexoRooms?.courses?.[prev.course]?.accent, oldVars=decorVars(prev.course)+(oldAccent?`--book-accent:${oldAccent};`:'');
    const turningClass=fwd?'grimoire-folio':'grimoire-frontispiece', stayingClass=fwd?'grimoire-frontispiece':'grimoire-folio';
    const spine=fwd?turning.rect.left:turning.rect.left+W;
    const stage=document.createElement('div');
    stage.className='curl-stage';stage.setAttribute('aria-hidden','true');stage.inert=true;
    stage.style.perspectiveOrigin=`${spine}px 40%`;
    // la página que "se queda" (vieja) tapa la nueva hasta que la hoja aterriza encima
    const under=document.createElement('div');
    under.className=`curl-under ${stayingClass}`;under.style.cssText=oldVars+`left:${staying.rect.left}px;top:${staying.rect.top}px;width:${staying.rect.width}px;height:${staying.rect.height}px;`;
    under.innerHTML=staying.html;
    const shadeNew=document.createElement('div');
    shadeNew.className='curl-shade'+(fwd?'':' curl-shade-rev');
    Object.assign(shadeNew.style,{left:turning.rect.left+'px',top:turning.rect.top+'px',width:W+'px',height:H+'px'});
    const shadeOld=document.createElement('div');
    shadeOld.className='curl-shade'+(fwd?' curl-shade-rev':'');
    Object.assign(shadeOld.style,{left:'0px',top:'0px',width:'100%',height:'100%'});
    under.append(shadeOld);
    // hoja con tiras anidadas
    const leaf=document.createElement('div');
    leaf.className='curl-leaf';
    Object.assign(leaf.style,{left:turning.rect.left+'px',top:turning.rect.top+'px',width:W+'px',height:turning.rect.height+'px',transformOrigin:fwd?'left center':'right center'});
    let parent=leaf;const strips=[],fronts=[],backs=[];
    for(let i=0;i<N;i++) {
      const strip=document.createElement('div');
      strip.className='curl-strip';
      Object.assign(strip.style,{width:sw+0.6+'px',height:'100%',transformOrigin:fwd?'left center':'right center'});
      strip.style[fwd?'left':'right']=i===0?'0px':sw+'px';
      const front=document.createElement('div');front.className='curl-face';
      const page=document.createElement('div');page.className=`curl-page ${turningClass}`;page.style.cssText=oldVars+`width:${W}px;height:${turning.rect.height}px;${fwd?'left':'right'}:${-i*sw}px;`;
      page.innerHTML=turning.html;front.append(page);
      const back=document.createElement('div');back.className='curl-face curl-back';
      back.style.setProperty('--bx',`${fwd?-(N-1-i)*sw:-i*sw}px`);
      strip.append(front,back);parent.append(strip);parent=strip;
      strips.push(strip);fronts.push(front);backs.push(back);
    }
    stage.append(under,shadeNew,leaf);spread.append(stage);
    const sgn=fwd?-1:1, sx=landW/W;
    window.NexoAudio?.play?.('page');
    const ease='cubic-bezier(.42,0,.22,1)';
    const main=animate(leaf,[
      {transform:'rotateY(0deg) scaleX(1)'},
      {transform:`rotateY(${sgn*28}deg) scaleX(1)`,offset:.22},
      {transform:`rotateY(${sgn*100}deg) scaleX(${(1+sx)/2})`,offset:.58},
      {transform:`rotateY(${sgn*180}deg) scaleX(${sx})`}],{duration:T,easing:ease,fill:'forwards'});
    // curvatura: el borde libre se queda atrás al levantar y se estira al bajar
    strips.forEach((strip,i)=>{ if(i===0)return;
      const c=-sgn*(5+i*2.2);
      animate(strip,[{transform:'rotateY(0deg)'},{transform:`rotateY(${c}deg)`,offset:.3},{transform:`rotateY(${c*.55}deg)`,offset:.6},{transform:`rotateY(${-c*.18}deg)`,offset:.86},{transform:'rotateY(0deg)'}],{duration:T,easing:'ease-in-out',fill:'forwards'});
    });
    fronts.forEach((f,i)=>animate(f,[{filter:'brightness(1)'},{filter:'brightness(.9)',offset:.3},{filter:'brightness(.62)',offset:.5},{filter:'brightness(.62)'}],{duration:T,easing:'linear',fill:'forwards'}));
    backs.forEach(b=>animate(b,[{filter:'brightness(.6)',opacity:1},{filter:'brightness(.66)',opacity:1,offset:.5},{filter:'brightness(.9)',opacity:1,offset:.68},{filter:'brightness(1)',opacity:1,offset:.8},{filter:'brightness(1)',opacity:1,offset:.88},{filter:'brightness(1)',opacity:0}],{duration:T,easing:'linear',fill:'forwards'}));
    animate(shadeNew,[{opacity:0},{opacity:.95,offset:.32},{opacity:.4,offset:.62},{opacity:0,offset:.85},{opacity:0}],{duration:T,easing:'ease-in-out',fill:'forwards'});
    animate(shadeOld,[{opacity:0},{opacity:0,offset:.45},{opacity:.85,offset:.82},{opacity:.85}],{duration:T,easing:'ease-in',fill:'forwards'});
    animate(under,[{opacity:1},{opacity:1,offset:.9},{opacity:0,offset:.901},{opacity:0}],{duration:T,fill:'forwards'});
    const done=()=>{stage.remove();if(openingLeaf===stage)openingLeaf=null;};
    main.finished.then(done,done);
    stage._main=main;stage._cleanup=done;
    return stage;
  }
  function navigate(root,previous,next) {
    cancel();
    let opened=openedInMemory;
    try { opened=opened||sessionStorage.getItem('nexo-grimoire-update01')==='1'; } catch { /* tab memory fallback */ }
    const spec=transitionFor(previous,next,opened);
    if(spec.kind==='book-first') {
      openedInMemory=true;
      try { sessionStorage.setItem('nexo-grimoire-update01','1'); } catch { /* storage disabled */ }
    }
    root.dataset.worldTransition=spec.kind;
    root.dataset.transitionDuration=String(spec.duration);
    if(spec.kind==='none') return;
    const book=root.querySelector('.grimoire'),refuge=root.querySelector('.refuge');
    const target=book||refuge;
    if(!target?.animate)return;
    // Movimiento reducido: solo un fundido corto (sin giros ni desplazamientos).
    if(reduced()||document.body.dataset.nexoAmbientMotion==='reduced') {navigationAnimation=animate(target,[{opacity:0},{opacity:1}],{duration:200,easing:'ease-out'});return;}
    if(spec.kind==='book-first'&&book) {
      openingLeaf=grimoireIntro(book,spec);
    } else if(spec.kind==='page-turn'&&book&&previousPages?.front&&previousPages?.folio&&innerWidth>760) {
      openingLeaf=pageCurl(book,turnDirection(previous,next),spec.duration);
      navigationAnimation=openingLeaf?._main||null;
    } else if(spec.kind==='page-turn'&&book&&previousFolio) {
      // Móvil: las páginas van una sobre otra; basta una hoja que se levanta con sombra.
      const leaf=document.createElement('div');
      leaf.className='grimoire-folio page-turn-leaf';leaf.setAttribute('aria-hidden','true');leaf.inert=true;
      leaf.innerHTML=previousFolio;book.append(leaf);openingLeaf=leaf;
      window.NexoAudio?.play?.('page');
      navigationAnimation=animate(leaf,[{transform:'perspective(2600px) rotateY(0deg)',filter:'brightness(1)',opacity:1},{transform:'perspective(2600px) rotateY(-60deg)',filter:'brightness(.84)',opacity:1,offset:.55},{transform:'perspective(2600px) rotateY(-120deg)',filter:'brightness(.7)',opacity:0}],{duration:560,easing:'cubic-bezier(.45,.05,.3,1)',fill:'forwards'});
      navigationAnimation.finished.then(()=>{leaf.remove();if(openingLeaf===leaf)openingLeaf=null;}).catch(()=>leaf.remove());
    } else {
      const frames=spec.kind==='page-turn'?[{transform:'perspective(1200px) rotateY(-4deg)',opacity:.72},{transform:'perspective(1200px) rotateY(0)',opacity:1}]
        :spec.kind==='book-close'?[{transform:'scale(1.025)',opacity:.7},{transform:'scale(1)',opacity:1}]
          :[{transform:'translateY(14px) scale(.985)',opacity:0},{transform:'translateY(0) scale(1)',opacity:1}];
      navigationAnimation=animate(target,frames,{duration:spec.duration,easing:'ease-out'});
    }
  }
  // Stop an in-flight opening when motion preference changes or the tab is hidden.
  if(typeof matchMedia==='function')matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',cancel);
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
  window.NexoAnimation = { reveal:target=>run(target,'slideIn'),run,reduced,presets:Object.keys(presets),transitionFor,navigate,prepare,preload };
})();
