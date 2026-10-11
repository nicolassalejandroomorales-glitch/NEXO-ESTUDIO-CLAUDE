/* =====================================================================
   DESAFÍOS: cada tipo pinta su interfaz en `root` y al terminar llama done(resultado).
   resultado = {ok, frac (0-1, cuánto quedó bien), help (usó pista), por (explicación)}
   ===================================================================== */
(function(){
const P1 = window.P1 = window.P1 || {};
const D = P1.desafios = {};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const sfx=n=>P1.audio&&P1.audio.sfx[n]&&P1.audio.sfx[n]();
const mol=(k,s)=>k&&P1.molSVG?P1.molSVG(k,s):'';
const hintHTML=txt=>`<button class="ghost" type="button" data-hint>Pedir pista <small>(daño ×0,5)</small></button>${txt?`<p class="hint" data-hinttxt hidden>${txt}</p>`:''}`;
function wireHint(root,st,onUse){
  const b=root.querySelector('[data-hint]'); if(!b) return;
  b.onclick=()=>{ if(st.done) return; st.help=true; b.disabled=true; const p=root.querySelector('[data-hinttxt]'); if(p) p.hidden=false; onUse&&onUse(); sfx('select'); };
}
const lock=root=>{root.querySelectorAll('button').forEach(b=>{if(!b.matches('[data-keep]'))b.disabled=true;});};

/* ---------- ELEGIR ---------- */
D.elegir=function(it,root,done){
  const st={help:false}, order=shuffle(it.ops.map((_,i)=>i));
  root.innerHTML=`<p class="q">${it.q}</p>
    <div class="opts">${order.map((i,n)=>`<button class="opt" type="button" data-i="${i}"><kbd>${n+1}</kbd><span>${it.ops[i]}</span></button>`).join('')}</div>
    <div class="row">${hintHTML(it.pista)}</div>`;
  wireHint(root,st,()=>{ // tacha alternativas incorrectas (deja 2)
    const wrong=shuffle(order.filter(i=>i!==it.ok)).slice(0,Math.max(1,it.ops.length-2));
    wrong.forEach(i=>{const b=root.querySelector(`.opt[data-i="${i}"]`);b.disabled=true;b.classList.add('tachada');});
  });
  root.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
    if(st.done) return; st.done=true;
    const i=+b.dataset.i, ok=i===it.ok;
    lock(root); root.querySelectorAll('.opt').forEach(x=>{if(+x.dataset.i===it.ok)x.classList.add('right');});
    if(!ok) b.classList.add('wrong');
    done({ok,frac:ok?1:0,help:st.help,por:(ok?'':`Correcta: <b>${it.ops[it.ok]}</b>. `)+it.por});
  });
};

/* ---------- CONECTAR ---------- */
const COLS=['#d9ac68','#79adae','#b8a6e6','#d98a8f','#8fc49a','#e6c07a'];
D.conectar=function(it,root,done){
  const n=it.pares.length, st={help:false,sel:null,pairs:new Map(),fixed:new Set()};
  const Lo=shuffle([...Array(n).keys()]); let Ro=shuffle([...Array(n).keys()]);
  if(Ro.every((r,i)=>r===Lo[i])) Ro=[...Ro.slice(1),Ro[0]];
  root.innerHTML=`<p class="q">${it.q} <span class="ext">toca uno de cada lado para unirlos</span></p>
    <div class="con"><svg class="con-lines" aria-hidden="true"></svg>
      <div class="col">${Lo.map(i=>`<button class="chip c-l" type="button" data-l="${i}">${it.pares[i][0]}</button>`).join('')}</div>
      <div class="col">${Ro.map(i=>`<button class="chip c-r" type="button" data-r="${i}">${it.pares[i][1]}</button>`).join('')}</div>
    </div>
    <div class="row"><button class="go" type="button" data-check disabled>Comprobar</button>${hintHTML(it.pista)}</div>`;
  const con=root.querySelector('.con'), svg=root.querySelector('.con-lines'), chk=root.querySelector('[data-check]');
  const L=i=>root.querySelector(`[data-l="${i}"]`), R=i=>root.querySelector(`[data-r="${i}"]`);
  function paint(final){
    const cr=con.getBoundingClientRect(); let s='';
    root.querySelectorAll('.chip').forEach(c=>{c.style.removeProperty('--pc');c.classList.remove('sel','paired');});
    let k=0;
    for(const [l,r] of st.pairs){
      const col=final?(l===r?'#8fc49a':'#d98a8f'):COLS[k++%COLS.length], a=L(l).getBoundingClientRect(), b=R(r).getBoundingClientRect();
      L(l).style.setProperty('--pc',col); R(r).style.setProperty('--pc',col); L(l).classList.add('paired'); R(r).classList.add('paired');
      const x1=a.right-cr.left, y1=a.top+a.height/2-cr.top, x2=b.left-cr.left, y2=b.top+b.height/2-cr.top, mx=(x1+x2)/2;
      s+=`<path d="M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" stroke="${col}" ${final&&l!==r?'stroke-dasharray="5 5"':''}/>`;
      s+=`<circle cx="${x1}" cy="${y1}" r="4" fill="${col}"/><circle cx="${x2}" cy="${y2}" r="4" fill="${col}"/>`;
    }
    svg.innerHTML=s;
    if(st.sel) (st.sel.side==='l'?L(st.sel.i):R(st.sel.i)).classList.add('sel');
    chk.disabled=st.pairs.size<n||st.done;
  }
  const unpairL=l=>{st.pairs.delete(l);}, unpairR=r=>{for(const [l,x] of st.pairs) if(x===r) st.pairs.delete(l);};
  function tap(side,i){
    if(st.done) return;
    if(side==='l'&&st.fixed.has(i)) return; if(side==='r'&&[...st.fixed].some(l=>st.pairs.get(l)===i)) return;
    if(st.sel&&st.sel.side!==side){
      const l=side==='l'?i:st.sel.i, r=side==='r'?i:st.sel.i; unpairL(l); unpairR(r); st.pairs.set(l,r); st.sel=null; sfx('link');
    } else if(st.sel&&st.sel.side===side&&st.sel.i===i){ st.sel=null; }
    else { if(side==='l'&&st.pairs.has(i)) unpairL(i); else if(side==='r') unpairR(i); st.sel={side,i}; sfx('pick'); }
    paint();
  }
  root.querySelectorAll('.c-l').forEach(b=>b.onclick=()=>tap('l',+b.dataset.l));
  root.querySelectorAll('.c-r').forEach(b=>b.onclick=()=>tap('r',+b.dataset.r));
  wireHint(root,st,()=>{ const l=Lo.find(i=>st.pairs.get(i)!==i); if(l===undefined) return; unpairL(l); unpairR(l); st.pairs.set(l,l); st.fixed.add(l); paint(); });
  chk.onclick=()=>{
    if(st.done) return; st.done=true; st.sel=null;
    const good=[...st.pairs].filter(([l,r])=>l===r).length, ok=good===n;
    paint(true); lock(root);
    root.querySelectorAll('.c-l').forEach(b=>{const l=+b.dataset.l;b.classList.add(st.pairs.get(l)===l?'right':'wrong');});
    const fix=[...st.pairs].filter(([l,r])=>l!==r).map(([l])=>`${it.pares[l][0]} → <b>${it.pares[l][1]}</b>`);
    done({ok,frac:good/n,help:st.help,por:(ok?'':`Bien ${good} de ${n}. Corrige: ${fix.join(' · ')}. `)+it.por});
  };
  const ro=()=>paint(st.done); addEventListener('resize',ro); requestAnimationFrame(()=>paint());
  root._cleanup=()=>removeEventListener('resize',ro);
};

/* ---------- ORDENAR ---------- */
D.ordenar=function(it,root,done){
  const n=it.items.length, st={help:false}, picked=[];
  let order=shuffle([...Array(n).keys()]); if(order.every((v,i)=>v===i)) order.reverse();
  const ext=it.extremos||['primero','último'];
  root.innerHTML=`<p class="q">${it.q} <span class="ext">de <b>${ext[0]}</b> a <b>${ext[1]}</b></span></p>
    <div class="chips">${order.map(i=>`<button class="chip mchip" type="button" data-i="${i}">${mol(it.items[i][2],66)}<span>${it.items[i][0]}</span></button>`).join('')}</div>
    <div class="slots" style="--n:${n}">${it.items.map((_,i)=>`<div class="slot" data-s="${i}"></div>`).join('')}</div>
    <div class="row"><button class="ghost" type="button" data-reset>Reiniciar orden</button>${hintHTML(it.pista)}</div>`;
  const lab=i=>i===0?ext[0]:i===n-1?ext[1]:'·';
  const paint=()=>{
    root.querySelectorAll('.slot').forEach((s,i)=>{const k=picked[i];s.classList.toggle('filled',k!==undefined);
      s.innerHTML=k===undefined?`<i>${lab(i)}</i>`:`${it.items[k][0]}`;});
    root.querySelectorAll('.chip').forEach(c=>c.disabled=st.done||picked.includes(+c.dataset.i));
  };
  paint();
  root.querySelector('[data-reset]').onclick=()=>{ if(st.done) return; picked.length=st.help&&picked[0]===0?1:0; paint(); };
  wireHint(root,st,()=>{ if(picked[0]!==0){ picked.length=0; picked.push(0); paint(); } });
  root.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{
    if(st.done) return; picked.push(+c.dataset.i); sfx('pick'); paint();
    if(picked.length===n){
      st.done=true; const good=picked.filter((k,i)=>k===i).length, ok=good===n; lock(root);
      root.querySelectorAll('.slot').forEach((s,i)=>{s.classList.add(picked[i]===i?'right':'wrong');s.innerHTML=`${it.items[i][0]}<i>${it.items[i][1]||''}</i>`;});
      done({ok,frac:good/n,help:st.help,por:(ok?'':'Arriba quedó el orden correcto. ')+it.por});
    }
  });
};

/* ---------- CLASIFICAR ---------- */
D.clasificar=function(it,root,done){
  const st={help:false,sel:null}, m=Math.min(it.mostrar||it.items.length,it.items.length);
  // al menos uno por caja, el resto al azar
  const pool=shuffle(it.items.map((_,i)=>i)), chosen=[];
  it.cajas.forEach((_,c)=>{const k=pool.find(i=>it.items[i][1]===c&&!chosen.includes(i));if(k!==undefined)chosen.push(k);});
  for(const i of pool){if(chosen.length>=m)break;if(!chosen.includes(i))chosen.push(i);}
  shuffle(chosen);
  const where=new Map(); // item -> caja
  root.innerHTML=`<p class="q">${it.q} <span class="ext">toca una tarjeta y luego su caja</span></p>
    <div class="chips pool">${chosen.map(i=>`<button class="chip mchip" type="button" data-i="${i}">${mol(it.items[i][2],60)}<span>${it.items[i][0]}</span></button>`).join('')}</div>
    <div class="cajas" style="--n:${it.cajas.length}">${it.cajas.map((c,j)=>`<div class="caja" role="button" tabindex="0" data-c="${j}"><b>${c}</b><div class="dentro"></div></div>`).join('')}</div>
    <div class="row"><button class="go" type="button" data-check disabled>Comprobar</button>${hintHTML(it.pista)}</div>`;
  const chk=root.querySelector('[data-check]'), poolEl=root.querySelector('.pool');
  const chip=i=>root.querySelector(`.chip[data-i="${i}"]`);
  function paint(){
    for(const i of chosen){const c=chip(i), w=where.get(i);
      const dest=w===undefined?poolEl:root.querySelector(`.caja[data-c="${w}"] .dentro`); if(c.parentElement!==dest) dest.appendChild(c);
      c.classList.toggle('sel',st.sel===i);}
    chk.disabled=st.done||where.size<chosen.length;
    root.querySelectorAll('.caja').forEach(b=>b.classList.toggle('target',st.sel!==null&&!st.done));
  }
  root.querySelector('.cajas').addEventListener('click',e=>{
    if(st.done) return;
    const c=e.target.closest('.chip');
    if(c){ e.stopPropagation(); const i=+c.dataset.i; if(st.fixed===i) return; where.delete(i); st.sel=i; sfx('pick'); paint(); return; }
    const b=e.target.closest('.caja'); if(b&&st.sel!==null){ where.set(st.sel,+b.dataset.c); st.sel=null; sfx('link'); paint(); }
  });
  root.querySelectorAll('.caja').forEach(c=>c.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===c){e.preventDefault();c.click();}}));
  poolEl.addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c||st.done)return;const i=+c.dataset.i;st.sel=st.sel===i?null:i;sfx('pick');paint();});
  wireHint(root,st,()=>{const i=chosen.find(k=>where.get(k)!==it.items[k][1]);if(i===undefined)return;where.set(i,it.items[i][1]);st.fixed=i;st.sel=null;paint();});
  chk.onclick=()=>{
    if(st.done) return; st.done=true; st.sel=null; paint();
    let good=0;
    for(const i of chosen){const c=chip(i), ok=where.get(i)===it.items[i][1]; if(ok) good++; c.classList.add(ok?'right':'wrong');
      if(!ok) c.insertAdjacentHTML('beforeend',`<em>→ ${it.cajas[it.items[i][1]]}</em>`);}
    lock(root);
    done({ok:good===chosen.length,frac:good/chosen.length,help:st.help,por:(good===chosen.length?'':`Bien ${good} de ${chosen.length}. `)+it.por});
  };
  paint();
};

/* ---------- RUTA DE SÍNTESIS ---------- */
D.ruta=function(it,root,done){
  const routes=Array.isArray(it.pasos[0])?it.pasos:[it.pasos], n=routes[0].length, st={help:false}, steps=[];
  const reag=shuffle([...new Set([...routes.flat(),...(it.extra||[])])]);
  const end=(t,m)=>`<div class="extremo">${mol(m,80)}<span>${t}</span></div>`;
  root.innerHTML=`<p class="q">${it.q} <span class="ext">elige los reactivos en orden</span></p>
    <div class="ruta">${end(it.inicio,it.inicioMol)}${[...Array(n)].map((_,i)=>`<span class="flecha-r">→</span><button class="paso" type="button" data-p="${i}"><i>Paso ${i+1}</i></button>`).join('')}<span class="flecha-r">→</span>${end(it.meta,it.metaMol)}</div>
    <div class="chips">${reag.map(r=>`<button class="chip" type="button" data-r="${r}">${r}</button>`).join('')}</div>
    <div class="row"><button class="go" type="button" data-check disabled>Comprobar</button>${hintHTML(it.pista)}</div>`;
  const chk=root.querySelector('[data-check]');
  const paint=()=>{
    root.querySelectorAll('.paso').forEach((p,i)=>{p.classList.toggle('filled',!!steps[i]);p.innerHTML=steps[i]?`<i>${i+1}</i>${steps[i]}`:`<i>Paso ${i+1}</i>`;});
    root.querySelectorAll('.chip').forEach(c=>c.disabled=st.done||steps.includes(c.dataset.r));
    chk.disabled=st.done||steps.filter(Boolean).length<n;
  };
  root.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{ if(st.done) return; const i=[...Array(n).keys()].find(k=>!steps[k]); if(i===undefined) return; steps[i]=c.dataset.r; sfx('pick'); paint(); });
  root.querySelectorAll('.paso').forEach(p=>p.onclick=()=>{ if(st.done) return; const i=+p.dataset.p; if(st.fixed===i) return; steps[i]=undefined; paint(); });
  wireHint(root,st,()=>{ steps[0]=routes[0][0]; for(let i=1;i<n;i++) if(steps[i]===routes[0][0]) steps[i]=undefined; st.fixed=0; paint(); });
  chk.onclick=()=>{
    if(st.done) return; st.done=true;
    const score=r=>r.filter((x,i)=>steps[i]===x).length, best=routes.reduce((a,r)=>score(r)>score(a)?r:a,routes[0]), good=score(best), ok=good===n;
    root.querySelectorAll('.paso').forEach((p,i)=>p.classList.add(steps[i]===best[i]?'right':'wrong'));
    lock(root); paint();
    done({ok,frac:good/n,help:st.help,por:(ok?'':`Ruta correcta: <b>${best.join(' → ')}</b>. `)+it.por});
  };
  paint();
};

/* ---------- FLECHA (mecanismo de protonación: metilamina + HCl) ---------- */
D.flecha=function(it,root,done){
  const st={help:false,step:1,sel:null}, RM=P1.arte&&P1.arte.RM;
  root.innerHTML=`<p class="q" data-instr>Mecanismo · Paso 1 de 2: ¿qué electrones forman el nuevo enlace N–H?</p>
  <p class="ext">Arrastra desde donde salen los electrones hasta donde llegan (o toca origen y luego destino).</p>
  <svg class="mech" viewBox="0 0 380 170" role="group" aria-label="Mecanismo de protonación de metilamina con HCl">
    <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#d9ac68"/></marker></defs>
    <line class="bondln" x1="78" y1="98" x2="114" y2="98"/><line class="bondln" x1="132" y1="110" x2="118" y2="134"/><line class="bondln" x1="140" y1="110" x2="154" y2="134"/>
    <line class="bondln" x1="262" y1="70" x2="306" y2="70"/>
    <text x="22" y="105">H₃C</text>
    <g class="tgt" data-t="N" tabindex="0" aria-label="átomo de nitrógeno"><circle class="hit" cx="136" cy="98" r="15"/><text x="128" y="105">N</text></g>
    <text x="104" y="155">H</text><text x="152" y="155">H</text>
    <g class="tgt" data-t="lp" tabindex="0" aria-label="par libre del nitrógeno"><circle class="hit" cx="136" cy="70" r="13"/><circle cx="130" cy="72" r="3" fill="#f5f0e4"/><circle cx="142" cy="72" r="3" fill="#f5f0e4"/></g>
    <g class="tgt" data-t="H" tabindex="0" aria-label="hidrógeno del HCl"><circle class="hit" cx="250" cy="70" r="15"/><text x="243" y="77">H</text></g>
    <g class="tgt" data-t="bond" tabindex="0" aria-label="enlace H–Cl"><circle class="hit" cx="284" cy="70" r="12"/></g>
    <g class="tgt" data-t="Cl" tabindex="0" aria-label="cloro"><circle class="hit" cx="328" cy="70" r="18"/><text x="315" y="77">Cl</text></g>
    <path class="arrow" data-live d="" marker-end="url(#ah)" hidden/>
    <g data-done></g>
  </svg>
  <div class="row">${hintHTML('Las flechas curvas nacen en electrones (un par libre o un enlace) y terminan en el átomo que los recibe.')}</div>`;
  wireHint(root,st);
  const svg=root.querySelector('svg'),live=root.querySelector('[data-live]'),dn=root.querySelector('[data-done]');
  const C={N:[136,98],lp:[136,64],H:[250,62],bond:[284,64],Cl:[328,58]};
  const pt=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());};
  const curve=(s,e)=>{const mx=(s[0]+e[0])/2,my=Math.min(s[1],e[1])-48;return `M${s[0]} ${s[1]}Q${mx} ${my} ${e[0]} ${e[1]}`;};
  const select=g=>{root.querySelectorAll('.tgt').forEach(x=>x.classList.remove('sel'));st.sel=g;if(g)g.classList.add('sel');};
  let dragging=false;
  function finish(ok,why){
    st.done=true; root.querySelectorAll('.tgt').forEach(g=>{g.style.pointerEvents='none';g.removeAttribute('tabindex');});
    if(ok){const tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('x','40');tx.setAttribute('y','30');tx.textContent='→ CH₃NH₃⁺ + Cl⁻';tx.style.fill='#8fc49a';dn.appendChild(tx);}
    lock(root); done({ok,frac:ok?1:st.step===2?.5:0,help:st.help,por:why});
  }
  function commit(from,to){
    if(st.done) return;
    const f=from.dataset.t,t=to.dataset.t; select(null); live.hidden=true; dragging=false;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('class','arrow');p.setAttribute('marker-end','url(#ah)');p.setAttribute('d',curve(C[f],C[t]));dn.appendChild(p); sfx('link');
    const len=p.getTotalLength(); if(!RM){p.style.strokeDasharray=len;p.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:380,easing:'ease-out',fill:'forwards'});}
    if(st.step===1){
      if(f==='lp'&&t==='H'){st.step=2;sfx('good');root.querySelector('[data-instr]').textContent='Mecanismo · Paso 2 de 2: ¿a dónde se van los electrones del enlace H–Cl?';return;}
      p.style.stroke='#d98a8f';
      finish(false,f==='N'?'La flecha nace en los electrones (el par libre), no en el átomo.':(f==='H'||t==='N'||t==='lp')?'Al revés: los electrones van del par del N hacia el H, no del H hacia el N.':'El par libre del N es el que ataca al H del HCl.');
    } else {
      if(f==='bond'&&t==='Cl') return finish(true,'El par del N forma el enlace N–H y los electrones del enlace H–Cl se van al Cl (más electronegativo). Producto: CH₃NH₃⁺ y Cl⁻.');
      p.style.stroke='#d98a8f'; finish(false,'Los electrones del enlace H–Cl se van al Cl, que queda como Cl⁻. Sin eso el H tendría dos enlaces.');
    }
  }
  svg.addEventListener('pointerdown',e=>{const g=e.target.closest('.tgt');if(!g||st.done)return;e.preventDefault();if(st.sel&&st.sel!==g){commit(st.sel,g);return;}select(g);dragging=true;});
  svg.addEventListener('pointermove',e=>{if(!dragging||!st.sel)return;const p=pt(e);live.hidden=false;live.setAttribute('d',curve(C[st.sel.dataset.t],[p.x,p.y]));});
  const up=e=>{if(!document.body.contains(svg)){removeEventListener('pointerup',up);return;}if(!dragging)return;dragging=false;live.hidden=true;
    const g=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.tgt');if(g&&st.sel&&g!==st.sel&&svg.contains(g))commit(st.sel,g);};
  addEventListener('pointerup',up);
  root.querySelectorAll('.tgt').forEach(g=>g.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;e.preventDefault();if(st.sel&&st.sel!==g)commit(st.sel,g);else select(g);}));
};
})();
