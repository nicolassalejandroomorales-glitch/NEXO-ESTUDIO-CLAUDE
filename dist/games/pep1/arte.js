/* =====================================================================
   ARTE: jefes en 3D simple (esferas + enlaces que giran) y arenas pintadas por código.
   Cada jefe: P1.arte.jefes[id](g, x, y, k, st)   (k = escala; st = estado de animación)
   Cada arena: P1.arte.arenas[id] = {fijo(g,W,H,G), vivo(g,W,H,G,t,fase,dt)}
   Lo "fijo" se pinta una vez en un lienzo aparte; lo "vivo" se anima cada cuadro.
   ===================================================================== */
(function(){
const P1 = window.P1 = window.P1 || {};
const A = P1.arte = {jefes:{}, arenas:{}};
const TAU = Math.PI*2, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
A.RM = RM;
const rand=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function seeded(seed){return ()=>(seed=(seed*16807)%2147483647)/2147483647;}

/* ---------- utilidades 3D y de dibujo ---------- */
const rotY=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return {x:p.x*c+p.z*s,y:p.y,z:-p.x*s+p.z*c};};
const rotX=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return {x:p.x,y:p.y*c-p.z*s,z:p.y*s+p.z*c};};
const rotZ=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return {x:p.x*c-p.y*s,y:p.x*s+p.y*c,z:p.z};};
const proj=(p,x,y)=>{const f=420/(420+p.z);return {x:x+p.x*f,y:y+p.y*f,s:f,z:p.z};};
function sphere(g,x,y,r,c1,c2,glow){
  if(r<=0)return;
  if(glow){const gg=g.createRadialGradient(x,y,r*.6,x,y,r*1.9);gg.addColorStop(0,glow);gg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gg;g.beginPath();g.arc(x,y,r*1.9,0,TAU);g.fill();}
  const gr=g.createRadialGradient(x-r*.35,y-r*.4,r*.08,x,y,r);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
  g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(x-r*.36,y-r*.42,r*.22,r*.13,-.6,0,TAU);g.fill();
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=Math.max(1,r*.06);g.beginPath();g.arc(x,y,r-.5,.2,Math.PI-.2);g.stroke();
}
function stick(g,a,b,w,col,hi){
  g.lineCap='round';g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
  g.strokeStyle=hi||'rgba(255,255,255,.35)';g.lineWidth=w*.35;g.beginPath();g.moveTo(a.x,a.y-w*.15);g.lineTo(b.x,b.y-w*.15);g.stroke();
}
function glow(g,x,y,r,rgb,a){const gg=g.createRadialGradient(x,y,0,x,y,r);gg.addColorStop(0,`rgba(${rgb},${a})`);gg.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=gg;g.fillRect(x-r,y-r,r*2,r*2);}
function flame(g,x,y,s,t,seed,hot){
  const fk=RM?1:.85+.15*Math.sin(t*11+seed)+.07*Math.sin(t*23+seed*2), c=hot||'255,180,90';
  g.save();g.globalCompositeOperation='lighter';glow(g,x,y-4*s,26*s*fk,c,.28);
  for(let k=0;k<3;k++){const h=(16-k*4)*s*fk*(1+(RM?0:.12*Math.sin(t*9+k*1.7+seed))),w=(6-k*1.6)*s,sx=RM?0:Math.sin(t*7+k+seed)*1.4*s;
    g.fillStyle=k<2?`rgba(${c},${.55-k*.15})`:'rgba(255,245,215,.8)';g.beginPath();g.moveTo(x-w,y);
    g.quadraticCurveTo(x-w*.8+sx,y-h*.6,x+sx*1.5,y-h);g.quadraticCurveTo(x+w*.8+sx,y-h*.6,x+w,y);g.fill();}
  g.restore();
}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function hexPath(g,x,y,r,rot){g.beginPath();for(let i=0;i<6;i++){const a=rot+i*Math.PI/3;g[i?'lineTo':'moveTo'](x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();}
A.util={rotY,rotX,proj,sphere,glow,flame,rr,hexPath,seeded};

/* Ojos y boca compartidos. o = {ojo:'presumido'|'nervioso'|'malvado'|'real', enojo, brillo:'r,g,b'} */
function face(g,x,y,k,st,o){
  const look=st.look||0, lx=Math.cos(look)*2.6*k, ly=Math.sin(look)*2.2*k, bl=st.blink?.12:1, hit=st.flash>.3;
  const sep=(o.sep||12)*k, ew=(o.ew||7)*k, eh=(o.eh||8)*k;
  for(const sx of [-1,1]){
    const ex=x+sx*sep, ey=y;
    if(hit){g.strokeStyle='#10171a';g.lineWidth=2.4*k;g.beginPath();g.moveTo(ex-ew*.8,ey-eh*.5);g.lineTo(ex+ew*.8,ey+eh*.5);g.moveTo(ex+ew*.8,ey-eh*.5);g.lineTo(ex-ew*.8,ey+eh*.5);g.stroke();continue;}
    if(o.brillo){glow(g,ex,ey,ew*2.4,o.brillo,.5);}
    g.fillStyle=o.blanco||'#f5f0e4';g.beginPath();g.ellipse(ex,ey,ew,eh*bl,0,0,TAU);g.fill();
    g.fillStyle=o.pupila||'#10171a';const pr=(o.ojo==='nervioso'?2.2:3.4)*k, jit=o.ojo==='nervioso'&&!RM?Math.sin(st.t*40+sx)*.8*k:0;
    g.beginPath();g.ellipse(ex+lx+jit,ey+ly*bl,pr,pr*1.15*bl,0,0,TAU);g.fill();
    if(o.ojo==='presumido'&&bl>.5){g.fillStyle=o.piel||'#3a3f9e';g.beginPath();g.ellipse(ex,ey-eh*.55,ew*1.15,eh*.62,0,Math.PI,TAU);g.fill();}
    if(o.enojo||o.ojo==='malvado'){g.strokeStyle='#10171a';g.lineWidth=2.8*k;g.beginPath();g.moveTo(ex-sx*ew*1.3,ey-eh*1.6);g.lineTo(ex+sx*ew*.6,ey-eh*.85);g.stroke();}
    if(o.ojo==='nervioso'){g.strokeStyle='#10171a';g.lineWidth=2*k;g.beginPath();g.moveTo(ex-ew,ey-eh*1.5+sx*1.5*k);g.lineTo(ex+ew,ey-eh*1.5-sx*1.5*k);g.stroke();}
  }
  const my=y+(o.my||15)*k; g.strokeStyle='#10171a'; g.lineWidth=2.2*k; g.beginPath();
  if(o.boca==='sonrisa') g.arc(x,my-6*k,8*k,.25,Math.PI-.25);
  else if(o.boca==='mueca'){g.moveTo(x-9*k,my);g.quadraticCurveTo(x+2*k,my+5*k,x+11*k,my-4*k);}
  else if(o.boca==='ondas'){for(let i=0;i<=8;i++){const px=x-12*k+i*3*k,py=my+Math.sin(i*1.7+st.t*(RM?0:12))*2*k;g[i?'lineTo':'moveTo'](px,py);}}
  else if(o.boca==='dientes'){g.fillStyle='#10171a';g.beginPath();g.moveTo(x-14*k,my-3*k);g.quadraticCurveTo(x,my+10*k,x+14*k,my-3*k);g.closePath();g.fill();
    g.fillStyle='#f5f0e4';for(let i=0;i<5;i++){const px=x-10*k+i*5*k;g.beginPath();g.moveTo(px-2*k,my-1.5*k);g.lineTo(px+2*k,my-1.5*k);g.lineTo(px,my+2.5*k);g.fill();}return;}
  else g.arc(x,my+4*k,8*k,Math.PI+.5,-.5);
  g.stroke();
}

/* ======================= JEFES ======================= */
/* st: {t, fase, flash, sq (aplastamiento), look, blink, enter(0-1), dissolve(0-1), atacando, especial} */
function base(st,k){
  const e=1-Math.pow(1-clamp(st.enter??1,0,1),3), bob=RM?0:Math.sin(st.t*1.6)*6*k, br=1+(RM?0:Math.sin(st.t*1.6+1)*.025);
  return {dy:bob-(1-e)*140*k, sy:br*(1-(st.sq||0)), sx:(1+(st.sq||0)*.6)/br*br, alpha:e*(1-(st.dissolve||0)), spread:1+(st.dissolve||0)*.9};
}

/* --- 1. TRIMETILAMINA --- */
A.jefes.amina=function(g,x,y,k,st){
  const B=base(st,k); if(B.alpha<=.01)return; y+=B.dy;
  const f2=st.fase>=2, t=st.t, inv=st.especial??(f2?-1:1); // inv: 1 = par libre arriba, −1 = invertida
  g.save(); g.globalAlpha=B.alpha; g.translate(x,y); g.scale(B.sx,B.sy); g.translate(-x,-y);
  glow(g,x,y,120*k,f2?'190,220,90':'150,200,120',.22);
  // vapores de olor
  g.lineCap='round';
  for(let i=0;i<5;i++){const tt=((t*(f2?.9:.55)+i*.37)%1.6)/1.6, ox=x+(i-2)*30*k+Math.sin(t+i)*6*k, oy=y+30*k-tt*170*k;
    g.strokeStyle=`rgba(184,216,107,${(1-tt)*.5})`;g.lineWidth=(5-tt*3)*k;g.beginPath();
    for(let j=0;j<=10;j++){const yy=oy-j*4*k,xx=ox+Math.sin(j*.7+t*3+i)*6*k;g[j?'lineTo':'moveTo'](xx,yy);}g.stroke();}
  const L=78*k*B.spread, spin=t*(f2?1.1:.55);
  const dirs=[0,1,2].map(i=>{const a=spin+i*TAU/3;return {x:Math.cos(a)*.88,y:.46*inv,z:Math.sin(a)*.88};}).map(p=>rotX(p,.18));
  const items=[];
  dirs.forEach((d,i)=>{
    const c=proj({x:d.x*L,y:d.y*L,z:d.z*L},x,y);
    const Hs=[0,1,2].map(j=>{const a=-spin*1.7+j*TAU/3+i;return proj({x:d.x*L+Math.cos(a)*20*k,y:d.y*L+(d.y>0?14:-14)*k+Math.sin(a*2)*3*k,z:d.z*L+Math.sin(a)*20*k},x,y);});
    items.push({z:d.z*L,draw(){
      stick(g,{x,y},c,7*k*c.s,'#5d6a77');
      Hs.sort((a,b)=>a.z-b.z).forEach(h=>{stick(g,c,h,3.5*k,'#8e9aa6');sphere(g,h.x,h.y,7*k*h.s,'#ffffff','#a9b4bd');});
      sphere(g,c.x,c.y,17*k*c.s,'#b9c3cc','#3a444e');
      g.fillStyle='rgba(16,23,26,.75)';g.font=`700 ${10*k*c.s}px "Segoe UI",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('CH₃',c.x,c.y+.5);
    }});
  });
  // par libre (lóbulo con dos electrones)
  const lob=()=>{const ly=y-inv*62*k*B.spread, pul=1+(RM?0:Math.sin(t*3)*.06);
    g.save();g.translate(x,ly);g.scale(1,inv);
    const lg=g.createRadialGradient(0,-6*k,2*k,0,0,30*k);lg.addColorStop(0,f2?'rgba(230,255,160,.75)':'rgba(200,220,255,.65)');lg.addColorStop(1,'rgba(160,190,255,0)');
    g.fillStyle=lg;g.beginPath();g.moveTo(0,26*k);g.bezierCurveTo(-30*k*pul,0,-18*k*pul,-34*k*pul,0,-32*k*pul);g.bezierCurveTo(18*k*pul,-34*k*pul,30*k*pul,0,0,26*k);g.fill();
    for(const s of [0,Math.PI]){const a=t*4+s;sphere(g,Math.cos(a)*8*k,-10*k+Math.sin(a)*4*k,4*k,'#fffbe6','#d9ac68','rgba(255,220,150,.5)');}
    g.restore();};
  items.filter(i=>i.z<0).sort((a,b)=>a.z-b.z).forEach(i=>i.draw());
  if(inv>0) lob();
  sphere(g,x,y,36*k,f2?'#c8d47a':'#b7c4ff',f2?'#3f4f1a':'#2c3290',f2?'rgba(190,230,90,.35)':'rgba(140,160,255,.35)');
  if(st.flash>0){g.fillStyle=`rgba(255,250,235,${st.flash*.75})`;g.beginPath();g.arc(x,y,36*k,0,TAU);g.fill();}
  face(g,x,y-2*k,k,st,{ojo:'presumido',piel:f2?'#6d7a2c':'#4b52b8',enojo:f2,boca:'mueca',brillo:f2?'210,255,120':null});
  g.fillStyle='rgba(16,23,26,.55)';g.font=`700 ${12*k}px "Segoe UI",sans-serif`;g.textAlign='center';g.fillText('N',x+22*k,y+22*k);
  if(inv<=0) lob();
  items.filter(i=>i.z>=0).sort((a,b)=>a.z-b.z).forEach(i=>i.draw());
  g.restore();
};

/* --- 2. CICLOBUTADIENO --- */
A.jefes.ciclo=function(g,x,y,k,st){
  const B=base(st,k); if(B.alpha<=.01)return; y+=B.dy;
  const f2=st.fase>=2, t=st.t, nerv=(RM?0:1)*(1.4+(f2?2.6:0)+(st.atacando?1.5:0));
  x+=Math.sin(t*53)*nerv*k*.6; y+=Math.cos(t*47)*nerv*k*.6;
  g.save(); g.globalAlpha=B.alpha; g.translate(x,y); g.scale(B.sx,B.sy); g.translate(-x,-y);
  glow(g,x,y,130*k,f2?'255,90,70':'255,160,77',.24);
  const sw=RM?0:Math.sin(t*(f2?6:2.2)), a=44*k*(1+.13*sw)*B.spread, b=44*k*(1-.13*sw)*B.spread;
  const tilt=.32+(RM?0:Math.sin(t*.8)*.12), wob=RM?0:Math.sin(t*.6)*.45;
  const P=(px,py,pz=0)=>proj(rotY(rotX({x:px,y:py,z:pz},tilt),wob),x,y);
  const C=[P(-a,-b),P(a,-b),P(a,b),P(-a,b)], Hh=[P(-a*1.62,-b*1.62),P(a*1.62,-b*1.62),P(a*1.62,b*1.62),P(-a*1.62,b*1.62)];
  // núcleo con cara (detrás de los enlaces del frente)
  const core=P(0,0,0);
  const cg=g.createRadialGradient(core.x,core.y,4*k,core.x,core.y,40*k);cg.addColorStop(0,f2?'rgba(255,120,90,.95)':'rgba(255,190,120,.95)');cg.addColorStop(1,f2?'rgba(140,30,30,.85)':'rgba(170,80,20,.85)');
  g.fillStyle=cg;g.beginPath();g.moveTo(C[0].x,C[0].y);for(let i=1;i<4;i++)g.lineTo(C[i].x,C[i].y);g.closePath();g.fill();
  if(f2){g.strokeStyle='rgba(255,230,180,.7)';g.lineWidth=1.4*k;g.beginPath();g.moveTo(core.x-20*k,core.y-26*k);g.lineTo(core.x-8*k,core.y-10*k);g.lineTo(core.x-16*k,core.y+4*k);g.moveTo(core.x+24*k,core.y+18*k);g.lineTo(core.x+10*k,core.y+8*k);g.stroke();}
  if(st.flash>0){g.fillStyle=`rgba(255,250,235,${st.flash*.7})`;g.fill();}
  // enlaces: los dobles están en los lados cortos (y cambian de lugar: desplazamiento de enlaces)
  for(let i=0;i<4;i++){const p=C[i],q=C[(i+1)%4];stick(g,p,q,6*k,'#f5f0e4');
    const corto=(i%2===1)===(sw>0);
    if(corto){const mx=(p.x+q.x)/2,my=(p.y+q.y)/2,dx=core.x-mx,dy=core.y-my,d=Math.hypot(dx,dy)||1,ox=dx/d*9*k,oy=dy/d*9*k;
      stick(g,{x:p.x+(q.x-p.x)*.2+ox,y:p.y+(q.y-p.y)*.2+oy},{x:p.x+(q.x-p.x)*.8+ox,y:p.y+(q.y-p.y)*.8+oy},4.5*k,'#ffa04d','rgba(255,240,200,.6)');}}
  for(let i=0;i<4;i++){stick(g,C[i],Hh[i],3.5*k,'#c8ced4');sphere(g,Hh[i].x,Hh[i].y,9*k*Hh[i].s,'#ffffff','#b6bfc7');}
  for(let i=0;i<4;i++)sphere(g,C[i].x,C[i].y,14*k*C[i].s,'#ffd0a0','#8a3d12','rgba(255,160,77,.35)');
  face(g,core.x,core.y-4*k,k*.95,st,{ojo:'nervioso',boca:'ondas',sep:11,ew:7.5,eh:8.5,my:14,enojo:f2});
  // gotas de sudor
  g.fillStyle='#6fd6ff';
  for(let i=0;i<2;i++){const tt=((t*.7+i*.5)%1), sx=x+(i?1:-1)*(a+26*k), sy=y-b+tt*60*k;g.globalAlpha=B.alpha*(1-tt);
    g.beginPath();g.arc(sx,sy,3.4*k,0,TAU);g.moveTo(sx-3.4*k,sy);g.lineTo(sx,sy-8*k);g.lineTo(sx+3.4*k,sy);g.fill();}
  g.globalAlpha=B.alpha;
  // chispas de inestabilidad (se desvanecen; nunca parpadean rápido)
  if(!RM){g.strokeStyle=f2?'rgba(255,120,90,.8)':'rgba(255,220,150,.75)';g.lineWidth=1.6*k;
    for(let i=0;i<4;i++){const ph=(t*1.3+i*.25)%1;if(ph>.35)continue;const p=C[i],q=C[(i+1)%4];g.globalAlpha=B.alpha*(1-ph/.35);g.beginPath();g.moveTo(p.x,p.y);
      for(let j=1;j<6;j++){const u=j/6;g.lineTo(p.x+(q.x-p.x)*u+Math.sin(i*7+j*3+Math.floor(t*6))*7*k,p.y+(q.y-p.y)*u+Math.cos(i*5+j*2+Math.floor(t*6))*7*k);}g.lineTo(q.x,q.y);g.stroke();}
    g.globalAlpha=B.alpha;}
  g.restore();
};

/* --- 3. BENCENO MALVADO --- */
A.jefes.benceno=function(g,x,y,k,st){
  const B=base(st,k); if(B.alpha<=.01)return; y+=B.dy;
  const f2=st.fase>=2, t=st.t, spin=t*(f2?.9:.35)*(st.atacando?1.8:1), tilt=1.0+(RM?0:Math.sin(t*.7)*.08), wob=RM?0:Math.sin(t*.5)*.25;
  g.save(); g.globalAlpha=B.alpha; g.translate(x,y); g.scale(B.sx,B.sy); g.translate(-x,-y);
  const auraC=f2?'255,70,130':'169,139,255';
  glow(g,x,y,150*k,auraC,.28);
  if(f2){g.strokeStyle=`rgba(255,90,140,${.35+.15*Math.sin(t*4)})`;g.lineWidth=4*k;hexPath(g,x,y,(96+Math.sin(t*4)*4)*k,-spin*.7);g.stroke();}
  const R=52*k*B.spread, P=(px,py,pz)=>proj(rotY(rotX(rotZ({x:px,y:py,z:pz},spin),tilt),wob),x,y);
  const C=[...Array(6)].map((_,i)=>P(Math.cos(i*TAU/6)*R,Math.sin(i*TAU/6)*R,0));
  const Hh=[...Array(6)].map((_,i)=>P(Math.cos(i*TAU/6)*R*1.55,Math.sin(i*TAU/6)*R*1.55,0));
  const cloud=(dz,front)=>{const pts=[...Array(24)].map((_,i)=>P(Math.cos(i*TAU/24)*R*.92,Math.sin(i*TAU/24)*R*.92,dz));
    g.fillStyle=f2?`rgba(255,80,150,${front?.2:.28})`:`rgba(169,139,255,${front?.18:.28})`;g.strokeStyle=f2?'rgba(255,150,190,.55)':'rgba(210,190,255,.5)';g.lineWidth=2*k;
    g.beginPath();pts.forEach((p,i)=>g[i?'lineTo':'moveTo'](p.x,p.y));g.closePath();g.fill();g.stroke();};
  // la nube π de arriba/abajo: la que queda atrás se dibuja primero
  const nUp=P(0,0,-20*k), backDz=nUp.z>0?-20*k:20*k;
  cloud(-backDz,false);
  const atoms=C.map((c,i)=>({c,h:Hh[i],z:c.z})).sort((a,b)=>a.z-b.z);
  for(let i=0;i<6;i++){const p=C[i],q=C[(i+1)%6];stick(g,p,q,6*k,'#e9e3ff');}
  // dobles enlaces que resuenan (alternan de posición)
  const res=Math.floor(t*(f2?1.4:.55))%2;
  for(let i=res;i<6;i+=2){const p=C[i],q=C[(i+1)%6],c0=P(0,0,0),mx=(p.x+q.x)/2,my=(p.y+q.y)/2,dx=c0.x-mx,dy=c0.y-my,d=Math.hypot(dx,dy)||1,ox=dx/d*8*k,oy=dy/d*8*k;
    stick(g,{x:p.x+(q.x-p.x)*.22+ox,y:p.y+(q.y-p.y)*.22+oy},{x:p.x+(q.x-p.x)*.78+ox,y:p.y+(q.y-p.y)*.78+oy},4*k,f2?'#ff6fa8':'#a98bff','rgba(255,255,255,.5)');}
  atoms.forEach(a=>{stick(g,a.c,a.h,3.2*k,'#c9c2e6');sphere(g,a.h.x,a.h.y,8*k*a.h.s,'#ffffff','#b8b0d6');sphere(g,a.c.x,a.c.y,13*k*a.c.s,'#c9b8ff','#3b2a7a','rgba(169,139,255,.3)');});
  cloud(backDz,true);
  // cara malvada flotando al centro
  const c0=P(0,0,0);
  g.fillStyle=f2?'rgba(60,10,35,.85)':'rgba(30,16,60,.85)';g.beginPath();g.ellipse(c0.x,c0.y,30*k,24*k,0,0,TAU);g.fill();
  if(st.flash>0){g.fillStyle=`rgba(255,250,235,${st.flash*.7})`;g.fill();}
  face(g,c0.x,c0.y-4*k,k*.95,st,{ojo:'malvado',boca:'dientes',blanco:f2?'#ffd0e0':'#e6dcff',pupila:f2?'#b0003a':'#3b1a8a',brillo:f2?'255,60,120':'190,160,255',sep:11,ew:6.5,eh:6,my:11});
  // corona de hexágonos
  for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.32,r=78*k,hx=x+Math.cos(a)*r,hy=y-40*k+Math.sin(a)*r*.5+(RM?0:Math.sin(t*2+i)*3*k);
    g.strokeStyle=f2?'rgba(255,140,180,.85)':'rgba(217,172,104,.9)';g.lineWidth=2*k;hexPath(g,hx,hy,7*k,t*(i%2?1:-1));g.stroke();}
  g.restore();
};

/* --- 4. REY AMONIO (v2): cuerpo de cristal con núcleo de N, corona con halo, manto de armiño, cetro con H⁺ --- */
A.jefes.rey=function(g,x,y,k,st){
  const B=base(st,k); if(B.alpha<=.01)return; y+=B.dy;
  const ph=st.fase||1, t=st.t, f2=ph>=2, f3=ph>=3;
  const C=f3?{aura:'255,70,70',core:'255,120,110',coreD:'120,10,30',capa:['#6a0f24','#1c0308'],gema:'#ff3355'}
    :f2?{aura:'230,110,140',core:'255,170,190',coreD:'110,30,70',capa:['#5e1530','#22060f'],gema:'#ff5577'}
    :{aura:'217,172,104',core:'150,240,230',coreD:'20,90,100',capa:['#20356a','#0b1430'],gema:'#c0304a'};
  g.save(); g.globalAlpha=B.alpha;
  // sombra en el suelo (lo "asienta")
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x,y+118*k-B.dy*.5,70*k,12*k,0,0,TAU);g.fill();
  g.translate(x,y); g.scale(B.sx,B.sy); g.translate(-x,-y);
  g.save();g.globalCompositeOperation='lighter';glow(g,x,y,170*k,C.aura,.32);g.restore();
  // MANTO: capa larga que ondea con borde dorado y hexágonos bordados
  const wav=i=>RM?0:Math.sin(t*2.2+i)*7*k;
  const cg=g.createLinearGradient(x,y-10*k,x,y+120*k);cg.addColorStop(0,C.capa[0]);cg.addColorStop(1,C.capa[1]);
  g.fillStyle=cg;g.beginPath();g.moveTo(x-34*k,y+4*k);
  g.bezierCurveTo(x-70*k,y+30*k,x-92*k+wav(1),y+80*k,x-100*k+wav(2),y+118*k);
  for(let i=0;i<=10;i++){const u=i/10;g.lineTo(x-100*k+u*200*k+wav(i*.8)*.4,y+118*k+Math.sin(u*10+t*(RM?0:2.6))*7*k);}
  g.bezierCurveTo(x+92*k+wav(3),y+80*k,x+70*k,y+30*k,x+34*k,y+4*k);g.closePath();g.fill();
  g.strokeStyle='#e3b45c';g.lineWidth=3*k;g.stroke();
  g.save();g.clip();g.strokeStyle='rgba(227,180,92,.18)';g.lineWidth=1.2*k;
  for(let r=0;r<4;r++)for(let c=-4;c<=4;c++){hexPath(g,x+c*22*k+(r%2)*11*k,y+40*k+r*19*k,7*k,0);g.stroke();}g.restore();
  // CETRO flotante con un H⁺ en la punta (gira a un lado)
  const sa=RM?0:Math.sin(t*1.3)*.15, sx0=x+78*k, sy0=y+10*k+(RM?0:Math.sin(t*1.7)*5*k);
  g.save();g.translate(sx0,sy0);g.rotate(.25+sa);
  const rod=g.createLinearGradient(-3*k,0,3*k,0);rod.addColorStop(0,'#8a5a1c');rod.addColorStop(.5,'#fff0b8');rod.addColorStop(1,'#8a5a1c');
  g.fillStyle=rod;g.fillRect(-2.5*k,-46*k,5*k,92*k);
  for(const yy of [-30,0,30]){g.fillStyle='#e3b45c';g.fillRect(-4.5*k,yy*k,9*k,4*k);}
  g.save();g.globalCompositeOperation='lighter';glow(g,0,-56*k,26*k,'255,110,120',.6);g.restore();
  sphere(g,0,-56*k,10*k,'#ffd6da','#c0304a');g.fillStyle='#2a1015';g.font=`800 ${9*k}px "Segoe UI",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('H⁺',0,-55.5*k);
  g.strokeStyle='#e3b45c';g.lineWidth=2*k;g.beginPath();g.arc(0,-56*k,13*k,Math.PI*.15,Math.PI*.85,true);g.stroke();
  g.restore();
  // TETRAEDRO de H: los 4 giran en 3D sobre un eje inclinado (ninguno queda tapando la corona)
  const spin=t*(f3?1.9:f2?1.4:.8)*(RM?.3:1), L=74*k*B.spread;
  const V=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(([a,b,c])=>{let p={x:a/1.732,y:b/1.732,z:c/1.732};p=rotY(p,spin);p=rotX(p,.55);return p;});
  const Hs=V.map(d=>proj({x:d.x*L,y:d.y*L*.85+6*k,z:d.z*L},x,y));
  const beam=h=>{const gr=g.createLinearGradient(x,y,h.x,h.y);gr.addColorStop(0,`rgba(${C.core},.9)`);gr.addColorStop(1,'rgba(255,240,200,.9)');
    g.strokeStyle=gr;g.lineCap='round';g.lineWidth=7*k*h.s;g.globalAlpha=B.alpha*.35;g.beginPath();g.moveTo(x,y);g.lineTo(h.x,h.y);g.stroke();
    g.globalAlpha=B.alpha;g.lineWidth=2.6*k*h.s;g.beginPath();g.moveTo(x,y);g.lineTo(h.x,h.y);g.stroke();};
  const orb=h=>{g.save();g.globalCompositeOperation='lighter';glow(g,h.x,h.y,26*k*h.s,f2?'255,180,190':'255,245,215',.45);g.restore();
    sphere(g,h.x,h.y,13*k*h.s,'#ffffff',f2?'#d8a0aa':'#cfd8d4');
    g.fillStyle='#172126';g.font=`800 ${11*k*h.s}px "Segoe UI",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('H',h.x,h.y+.5);};
  Hs.filter(h=>h.z<0).forEach(h=>{beam(h);orb(h);});
  // CUERPO de cristal con núcleo brillante de nitrógeno
  const R=40*k;
  g.save();g.globalCompositeOperation='lighter';glow(g,x,y,R*1.6,C.core,.35);g.restore();
  const body=g.createRadialGradient(x-R*.3,y-R*.35,R*.1,x,y,R);body.addColorStop(0,'rgba(255,255,255,.55)');body.addColorStop(.35,`rgba(${C.core},.55)`);body.addColorStop(1,`rgba(${C.coreD},.92)`);
  g.fillStyle=body;g.beginPath();g.arc(x,y,R,0,TAU);g.fill();
  // remolino de electrones dentro del cristal
  g.save();g.beginPath();g.arc(x,y,R-2*k,0,TAU);g.clip();g.globalCompositeOperation='lighter';
  for(let i=0;i<3;i++){g.strokeStyle=`rgba(${C.core},${.35-i*.08})`;g.lineWidth=(3-i*.6)*k;g.beginPath();
    for(let j=0;j<=40;j++){const a=j/40*TAU*1.4+t*(1.5+i*.4)+i*2,r=R*(.25+.55*j/40);g[j?'lineTo':'moveTo'](x+Math.cos(a)*r,y+Math.sin(a)*r*.75);}g.stroke();}
  glow(g,x,y+4*k,R*.55,'255,255,255',.35+(RM?0:.1*Math.sin(t*3)));
  g.restore();
  if(f3&&!RM){g.strokeStyle='rgba(255,230,180,.9)';g.lineWidth=1.6*k;g.beginPath();g.moveTo(x-30*k,y-10*k);g.lineTo(x-14*k,y+2*k);g.lineTo(x-22*k,y+20*k);g.moveTo(x+30*k,y+16*k);g.lineTo(x+14*k,y+6*k);g.lineTo(x+20*k,y-8*k);g.stroke();}
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2*k;g.beginPath();g.arc(x,y,R-1,Math.PI*1.1,Math.PI*1.55);g.stroke();
  g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(x-R*.38,y-R*.45,R*.2,R*.1,-.6,0,TAU);g.fill();
  if(st.flash>0){g.fillStyle=`rgba(255,250,235,${st.flash*.75})`;g.beginPath();g.arc(x,y,R,0,TAU);g.fill();}
  // CUELLO de armiño (piel blanca con motas) y broche "+"
  g.fillStyle='#f4efe6';g.beginPath();g.ellipse(x,y+R*.92,R*1.05,R*.32,0,0,TAU);g.fill();
  g.fillStyle='#1a1a1a';for(let i=-4;i<=4;i++){g.beginPath();g.ellipse(x+i*R*.22,y+R*.92+((i%2)?3:-2)*k,1.6*k,3*k,0,0,TAU);g.fill();}
  sphere(g,x,y+R*1.02,8*k,'#fff0c0','#b07a20','rgba(255,210,120,.4)');g.fillStyle='#3a2410';g.font=`800 ${12*k}px "Segoe UI",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('+',x,y+R*1.02+1);
  // CARA: ojos dorados que brillan, cejas gruesas, sonrisa de colmillos en la fase 2+
  const look=st.look||0, lx=Math.cos(look)*2.4*k, ly=Math.sin(look)*2*k, bl=st.blink?.12:1, hit=st.flash>.3;
  for(const s of [-1,1]){const ex=x+s*14*k, ey=y-4*k;
    if(hit){g.strokeStyle='#10171a';g.lineWidth=2.6*k;g.beginPath();g.moveTo(ex-6*k,ey-5*k);g.lineTo(ex+6*k,ey+5*k);g.moveTo(ex+6*k,ey-5*k);g.lineTo(ex-6*k,ey+5*k);g.stroke();continue;}
    g.fillStyle='#10171a';g.beginPath();g.ellipse(ex,ey,9*k,7.5*k*bl,s*.12,0,TAU);g.fill();
    g.save();g.globalCompositeOperation='lighter';glow(g,ex+lx,ey+ly,12*k,f2?'255,90,90':'255,210,120',.6);g.restore();
    g.fillStyle=f2?'#ff6b6b':'#ffd27a';g.beginPath();g.ellipse(ex+lx,ey+ly*bl,4.2*k,4.6*k*bl,0,0,TAU);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(ex+lx-1.4*k,ey+ly-1.6*k,1.2*k,0,TAU);g.fill();
    g.strokeStyle='#10171a';g.lineWidth=4*k;g.lineCap='round';g.beginPath();
    if(f2){g.moveTo(ex-s*10*k,ey-14*k);g.lineTo(ex+s*6*k,ey-8*k);}else{g.moveTo(ex-s*9*k,ey-12*k);g.quadraticCurveTo(ex,ey-15*k,ex+s*8*k,ey-11*k);}g.stroke();}
  const my=y+15*k; g.strokeStyle='#10171a';g.lineWidth=2.6*k;g.beginPath();
  if(st.feliz){g.arc(x,my-5*k,8*k,.25,Math.PI-.25);g.stroke();}
  else if(f2){g.moveTo(x-11*k,my);g.quadraticCurveTo(x,my-5*k,x+11*k,my);g.stroke();g.fillStyle='#fff';for(const s of [-1,1]){g.beginPath();g.moveTo(x+s*6*k,my-2.5*k);g.lineTo(x+s*3.5*k,my-2.5*k);g.lineTo(x+s*4.8*k,my+3*k);g.fill();}}
  else {g.moveTo(x-9*k,my);g.quadraticCurveTo(x+1*k,my+4*k,x+10*k,my-3*k);g.stroke();}
  // CORONA grande con halo (con inercia)
  const cy=y-R-6*k+(RM?0:Math.sin(t*1.6-.7)*3*k), tiltc=f3&&!RM?Math.sin(t*3)*.08:0;
  g.save();g.translate(x,cy);g.rotate(tiltc);
  g.save();g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(${f2?'255,150,150':'255,225,150'},${.55+(RM?0:.2*Math.sin(t*2))})`;g.lineWidth=2.5*k;g.beginPath();g.ellipse(0,-34*k,30*k,7*k,0,0,TAU);g.stroke();glow(g,0,-34*k,34*k,f2?'255,120,120':'255,220,140',.18);g.restore();
  const gold=g.createLinearGradient(0,-30*k,0,6*k);gold.addColorStop(0,'#fff6cc');gold.addColorStop(.45,'#e9b955');gold.addColorStop(1,'#7a4c14');
  g.fillStyle=gold;g.beginPath();g.moveTo(-32*k,4*k);
  [[-35,-18],[-24,-8],[-17,-28],[-7,-12],[0,-32],[7,-12],[17,-28],[24,-8],[35,-18],[32,4]].forEach(([px,py])=>g.lineTo(px*k,py*k));g.closePath();g.fill();
  g.strokeStyle='rgba(60,35,10,.7)';g.lineWidth=1.3*k;g.stroke();
  g.fillStyle='#7a4c14';g.fillRect(-32*k,-2*k,64*k,6*k);g.fillStyle='rgba(255,255,255,.45)';g.fillRect(-30*k,-1.5*k,60*k,1.6*k);
  sphere(g,0,-7*k,5.5*k,'#ffd0d6',C.gema,'rgba(255,80,110,.5)');
  for(const s of [-1,1]){sphere(g,s*16*k,-6*k,3.6*k,'#d0fff8','#2f8f8a');sphere(g,s*28*k,-4*k,2.8*k,'#e6dcff','#5a3aa0');}
  for(const [px,py] of [[-35,-18],[-17,-28],[0,-32],[17,-28],[35,-18]])sphere(g,px*k,py*k,3*k,'#fffbe6','#d9ac68','rgba(255,230,160,.4)');
  g.restore();
  Hs.filter(h=>h.z>=0).forEach(h=>{beam(h);orb(h);});
  g.restore();
};

/* ======================= KIT MÁGICO (lo que hace que una arena se sienta "de jefe") ======================= */
A.cam={x:0,y:0};
A.baja=/[?&]calidad=baja/.test(location.search); // calidad baja: sin rayos ni remolinos (se activa sola si el juego va lento)           // paralaje: lo actualiza el motor según dónde está la estrella (-1 a 1)
A.pulso=()=>0;             // pulso de la música (lo conecta el motor)
const GLIFOS={
  amina:'N · R₃N · :N · pKaH · NH₂ · 1° 2° 3° · δ− · ',
  ciclo:'4n · π · ⚠ · C₄H₄ · 4n · ↯ · σ · ',
  benceno:'π · 4n+2 · C₆H₆ · E⁺ · σ · ⬡ · ',
  trono:'NH₄⁺ · pKa · H⁺ · ⁺ · N · Kb · '
};
/* Sello mágico giratorio. o={col:'r,g,b', glif, lados (polígono), sy (aplastado para el piso), a (alfa), vel} */
function sello(g,x,y,R,t,o){
  const col=o.col, a=(o.a??1)*(1+(o.pulso||0)*.6), sp=RM?0:(o.vel??1), sy=o.sy??1, lados=o.lados||6;
  g.save(); g.translate(x,y); g.scale(1,sy); g.globalCompositeOperation='lighter';
  const halo=g.createRadialGradient(0,0,R*.2,0,0,R*1.25);halo.addColorStop(0,`rgba(${col},${.08*a})`);halo.addColorStop(.75,`rgba(${col},${.05*a})`);halo.addColorStop(1,`rgba(${col},0)`);
  g.fillStyle=halo;g.beginPath();g.arc(0,0,R*1.25,0,TAU);g.fill();
  const ring=(r,w,al)=>{g.strokeStyle=`rgba(${col},${al*a*.35})`;g.lineWidth=w*3;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();g.strokeStyle=`rgba(${col},${al*a})`;g.lineWidth=w;g.stroke();};
  ring(R,2.2,.9); ring(R*.93,1,.6); ring(R*.62,1.6,.7); ring(R*.2,1.2,.6);
  // marcas que giran en sentido contrario
  g.save();g.rotate(-t*.25*sp);g.strokeStyle=`rgba(${col},${.7*a})`;g.lineWidth=1.4;
  for(let i=0;i<48;i++){const an=i/48*TAU,r1=R*.93,r2=i%4?R*.97:R*1.04;g.beginPath();g.moveTo(Math.cos(an)*r1,Math.sin(an)*r1);g.lineTo(Math.cos(an)*r2,Math.sin(an)*r2);g.stroke();}
  g.restore();
  // anillo de glifos (runas químicas): se pinta una vez en un lienzo aparte y después solo se gira
  if(o.glif){const img=anilloGlifos(R,col,o.glif);g.save();g.rotate(t*.12*sp);g.globalAlpha=Math.min(1,.85*a);g.drawImage(img,-img._r,-img._r,img._r*2,img._r*2);g.restore();}
  // polígono doble (estrella)
  g.save();g.rotate(t*.2*sp);g.strokeStyle=`rgba(${col},${.8*a})`;g.lineWidth=1.8;
  for(const off of [0,Math.PI/lados]){g.beginPath();for(let i=0;i<=lados;i++){const an=off+i/lados*TAU;g[i?'lineTo':'moveTo'](Math.cos(an)*R*.62,Math.sin(an)*R*.62);}g.stroke();}
  for(let i=0;i<lados;i++){const an=i/lados*TAU;g.beginPath();g.arc(Math.cos(an)*R*.62,Math.sin(an)*R*.62,R*.05,0,TAU);g.stroke();}
  g.restore();
  g.restore();
}
const glifCache={};
function anilloGlifos(R,col,glif){
  const key=Math.round(R)+'|'+col+'|'+glif; if(glifCache[key]) return glifCache[key];
  const k=2, r=Math.ceil(R*.9), c=document.createElement('canvas'); c.width=c.height=r*2*k; c._r=r;
  const g=c.getContext('2d'); g.setTransform(k,0,0,k,r*k,r*k); g.fillStyle=`rgb(${col})`;
  g.font=`600 ${Math.max(9,R*.085)}px "Iowan Old Style",Georgia,serif`; g.textAlign='center'; g.textBaseline='middle';
  const txt=(glif+glif).split(''), n=txt.length; for(let i=0;i<n;i++){g.save();g.rotate(i/n*TAU);g.translate(0,-R*.78);g.fillText(txt[i],0,0);g.restore();}
  return glifCache[key]=c;
}
function rayos(g,x,y,n,len,t,col,a,ancho=.07){
  if(A.baja) return;
  g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.rotate(RM?0:t*.04);
  for(let i=0;i<n;i++){const an=i/n*TAU+Math.sin(i*3.7)*.2, w=ancho*(.6+.4*Math.sin(i*1.9)), al=a*(.6+.4*Math.sin(t*.9+i*2.1));
    const gr=g.createLinearGradient(0,0,Math.cos(an)*len,Math.sin(an)*len);gr.addColorStop(0,`rgba(${col},${al})`);gr.addColorStop(1,`rgba(${col},0)`);
    g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(an-w)*len,Math.sin(an-w)*len);g.lineTo(Math.cos(an+w)*len,Math.sin(an+w)*len);g.closePath();g.fill();}
  g.restore();
}
function vineta(g,W,H,a,col='0,0,0'){const gr=g.createRadialGradient(W/2,H*.45,Math.min(W,H)*.35,W/2,H*.5,Math.max(W,H)*.78);gr.addColorStop(0,`rgba(${col},0)`);gr.addColorStop(1,`rgba(${col},${a})`);g.fillStyle=gr;g.fillRect(0,0,W,H);}
/* partículas que giran en espiral hacia el jefe (energía que se junta) */
function vortice(S,g,G,t,dt,col,n,fuerza){
  if(A.baja) return;
  S.vx=S.vx||Array.from({length:RM?Math.ceil(n/3):n},()=>({a:rand(0,TAU),r:rand(60,260),v:rand(.4,1),s:rand(.8,2.2)}));
  g.save();g.globalCompositeOperation='lighter';
  for(const p of S.vx){if(!RM){p.a+=dt*p.v*(.6+fuerza);p.r-=dt*(14+fuerza*40)*p.v;if(p.r<30){p.r=rand(200,280);p.a=rand(0,TAU);}}
    const x=G.ex+Math.cos(p.a)*p.r, y=G.ey+Math.sin(p.a)*p.r*.55, al=clamp((p.r-30)/60,0,1)*.8;
    g.fillStyle=`rgba(${col},${al})`;g.beginPath();g.arc(x,y,p.s,0,TAU);g.fill();}
  g.restore();
}
/* Árbol muerto retorcido (silueta), ramas recursivas con semilla para que siempre salga igual */
function arbol(g,x,y,len,ang,grosor,r,depth){
  if(depth<=0||len<4)return;
  const x2=x+Math.cos(ang)*len, y2=y+Math.sin(ang)*len, cx=x+Math.cos(ang+(r()-.5)*.8)*len*.5, cy=y+Math.sin(ang+(r()-.5)*.8)*len*.5;
  g.lineWidth=grosor;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(cx,cy,x2,y2);g.stroke();
  const n=depth>3?2:1+Math.round(r());
  for(let i=0;i<n+ (r()<.4?1:0);i++) arbol(g,x2,y2,len*(.6+r()*.25),ang+(r()-.5)*1.3,grosor*.62,r,depth-1);
}

/* ======================= ARENAS v3: "dimensiones mágicas" ======================= */
/* Nada de dibujos de objetos "de relleno": cada jefe vive en una dimensión del grimorio.
   Capas: nebulosa pintada con ruido (textura, no degradé plano) · estrellas y una constelación con la forma de la molécula ·
   páginas del grimorio flotando (con dibujos de la molécula) · el sello con runas · piso de luz con su sello · runas que suben · viñeta. */
const sky=(g,W,H,stops)=>{const gr=g.createLinearGradient(0,0,0,H);stops.forEach(([p,c])=>gr.addColorStop(p,c));g.fillStyle=gr;g.fillRect(-40,-40,W+80,H+80);};

/* Nebulosa: ruido fractal con "deformación" (domain warping) → nubes con hebras, como pintadas. Se calcula una vez. */
function nebulosa(w,h,seed,cols,escala,dens){
  const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'), img=g.createImageData(w,h), d=img.data;
  const r=seeded(seed), perm=[...Array(256).keys()]; for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]];}
  const val=perm.map(()=>r()), hash=(x,y)=>val[(perm[x&255]+(y&255))&255];
  const sm=t=>t*t*(3-2*t);
  const vn=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),u=sm(x-xi),v=sm(y-yi),a=hash(xi,yi),b=hash(xi+1,yi),c2=hash(xi,yi+1),e=hash(xi+1,yi+1);return a+(b-a)*u+(c2-a)*v+(a-b-c2+e)*u*v;};
  const fbm=(x,y)=>{let s=0,a=.5,f=1;for(let o=0;o<5;o++){s+=a*vn(x*f,y*f);f*=2.03;a*=.5;}return s;};
  const lerp=(a,b,t)=>a+(b-a)*t;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const nx=x/escala, ny=y/escala, wx=fbm(nx+3.1,ny+7.7)*2.2, wy=fbm(nx+9.2,ny+1.3)*2.2;
    const n=fbm(nx+wx,ny+wy), m=fbm(nx*1.7+20,ny*1.7);
    const v=clamp((n-.38)*dens,0,1), t=clamp(m*1.6-.3,0,1);
    const c0=t<.5?cols[0]:cols[1], c1=t<.5?cols[1]:cols[2], tt=t<.5?t*2:(t-.5)*2;
    const i=(y*w+x)*4; d[i]=lerp(c0[0],c1[0],tt); d[i+1]=lerp(c0[1],c1[1],tt); d[i+2]=lerp(c0[2],c1[2],tt); d[i+3]=Math.pow(v,1.25)*235;
  }
  g.putImageData(img,0,0); return c;
}
/* Página del grimorio con un dibujo de la molécula del jefe */
function pagina(dibujo,tinta,seed){
  const k=2,w=56,h=72,c=document.createElement('canvas'); c.width=w*k; c.height=h*k; const g=c.getContext('2d'); g.scale(k,k);
  const r=seeded(seed);
  const pg=g.createLinearGradient(0,0,w,h); pg.addColorStop(0,'#f2e6c4'); pg.addColorStop(1,'#cdb27a'); g.fillStyle=pg;
  g.beginPath(); g.moveTo(2,3); g.quadraticCurveTo(w/2,0,w-2,3); g.lineTo(w-1,h-3); g.quadraticCurveTo(w/2,h,1,h-2); g.closePath(); g.fill();
  g.strokeStyle='rgba(90,60,20,.45)'; g.lineWidth=.8; g.stroke();
  g.strokeStyle='rgba(60,35,10,.55)'; g.lineWidth=.7;
  for(let i=0;i<6;i++){const y=8+i*5.5;g.beginPath();g.moveTo(6,y);for(let x=6;x<w-6;x+=3)g.lineTo(x,y+Math.sin(x*.9+i+r()*2)*.8);g.stroke();}
  g.save(); g.translate(w/2,h*.68); g.strokeStyle=tinta; g.fillStyle=tinta; g.lineWidth=1.3; dibujo(g); g.restore();
  g.fillStyle='rgba(120,70,20,.5)'; g.font='7px Georgia,serif'; g.fillText('✦',w-9,h-5);
  return c;
}
const DIBUJOS={
  amina:g=>{g.font='bold 9px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText('N',0,-2);for(const a of [-2.6,-.55,1.57]){g.beginPath();g.moveTo(Math.cos(a)*5,Math.sin(a)*5);g.lineTo(Math.cos(a)*12,Math.sin(a)*12);g.stroke();}g.beginPath();g.arc(0,-10,1.2,0,TAU);g.arc(3,-10,1.2,0,TAU);g.fill();},
  ciclo:g=>{g.strokeRect(-8,-8,16,16);g.beginPath();g.moveTo(-5,-5);g.lineTo(5,-5);g.moveTo(-5,5);g.lineTo(5,5);g.stroke();},
  benceno:g=>{hexPath(g,0,0,11,Math.PI/6);g.stroke();g.beginPath();g.arc(0,0,6,0,TAU);g.stroke();},
  rey:g=>{g.font='bold 8px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText('N⁺',0,0);for(const a of [-1.57,.52,2.62,3.9]){g.beginPath();g.moveTo(Math.cos(a)*5,Math.sin(a)*5);g.lineTo(Math.cos(a)*12,Math.sin(a)*12);g.stroke();g.fillText('H',Math.cos(a)*15,Math.sin(a)*15);}}
};
/* Constelación con la forma de la molécula (puntos de estrella unidos por líneas) */
const CONST={
  amina:[[0,0],[-1,.7],[1,.7],[0,1.15],[0,-.9]], aminaL:[[0,1],[0,2],[0,3],[0,4]],
  ciclo:[[-1,-1],[1,-1],[1,1],[-1,1]], cicloL:[[0,1],[1,2],[2,3],[3,0]],
  benceno:[...Array(6)].map((_,i)=>[Math.cos(i*Math.PI/3),Math.sin(i*Math.PI/3)]), bencenoL:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]],
  rey:[[0,0],[0,-1.1],[1,.45],[-1,.45],[.15,.85]], reyL:[[0,1],[0,2],[0,3],[0,4]]
};
function constelacion(g,id,x,y,R,t,col){
  const P=CONST[id], L=CONST[id+'L']; if(!P) return;
  g.save(); g.globalCompositeOperation='lighter';
  g.strokeStyle=`rgba(${col},.28)`; g.lineWidth=1; g.setLineDash([3,4]);
  for(const [a,b] of L){g.beginPath();g.moveTo(x+P[a][0]*R,y+P[a][1]*R);g.lineTo(x+P[b][0]*R,y+P[b][1]*R);g.stroke();}
  g.setLineDash([]);
  P.forEach(([px,py],i)=>{const a=.6+.4*Math.sin(t*1.5+i*1.7);glow(g,x+px*R,y+py*R,9,col,.5*a);g.fillStyle=`rgba(255,255,255,${.85*a})`;g.beginPath();g.arc(x+px*R,y+py*R,1.6,0,TAU);g.fill();});
  g.restore();
}
/* Piso de luz: rejilla en perspectiva que se pierde en el vacío + pozo de luz bajo la caja */
function pisoLuz(g,W,H,G,col,t,pul){
  const hz=G.hz;
  g.save(); g.globalCompositeOperation='lighter';
  for(let i=1;i<=10;i++){const u=Math.pow(i/10,1.7),y=hz+(H-hz)*u;g.strokeStyle=`rgba(${col},${.03+u*.12})`;g.lineWidth=1;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  for(let i=-12;i<=12;i++){const bx=W/2+i*(W/9);const gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,`rgba(${col},0)`);gr.addColorStop(1,`rgba(${col},.14)`);g.strokeStyle=gr;g.beginPath();g.moveTo(W/2+(bx-W/2)*.12,hz);g.lineTo(bx,H);g.stroke();}
  const py=G.by+(G.narrow?14:18), pw=G.narrow?W*.5:W*.36;
  const lg=g.createRadialGradient(W/2,py,0,W/2,py,pw);lg.addColorStop(0,`rgba(${col},${.22+pul*.08})`);lg.addColorStop(1,`rgba(${col},0)`);
  g.save();g.translate(W/2,py);g.scale(1,.3);g.translate(-W/2,-py);g.fillStyle=lg;g.beginPath();g.arc(W/2,py,pw,0,TAU);g.fill();g.restore();
  g.restore();
}
/* Mundo base de cada dimensión: colores y qué molécula "flota" */
const MUNDOS={
  pantano:{id:'amina',fondo:[[0,'#020a07'],[.55,'#06231a'],[1,'#020806']],neb:[[20,90,60],[70,220,140],[190,255,150]],neb2:[[40,90,20],[150,230,60],[230,255,140]],
    col:'120,255,170',col2:'190,255,90',tinta:'#1f5a3a',glif:GLIFOS.amina,lados:3},
  laboratorio:{id:'ciclo',fondo:[[0,'#0c0410'],[.55,'#2a0a1c'],[1,'#080208']],neb:[[120,30,80],[255,120,50],[255,210,120]],neb2:[[140,20,20],[255,70,40],[255,180,90]],
    col:'255,160,80',col2:'255,90,60',tinta:'#7a2c10',glif:GLIFOS.ciclo,lados:4},
  catedral:{id:'benceno',fondo:[[0,'#06021a'],[.55,'#1d0b3e'],[1,'#05020e']],neb:[[70,40,170],[170,90,255],[255,120,220]],neb2:[[120,20,90],[255,70,160],[255,170,220]],
    col:'190,150,255',col2:'255,90,160',tinta:'#3d1f7a',glif:GLIFOS.benceno,lados:6},
  trono:{id:'rey',fondo:[[0,'#06070f'],[.55,'#1a1530'],[1,'#04040a']],neb:[[40,60,160],[220,170,80],[255,230,160]],neb2:[[110,10,30],[240,60,70],[255,180,120]],
    col:'255,210,120',col2:'255,80,80',tinta:'#6a4a10',glif:GLIFOS.trono,lados:4}
};
function crearMundo(nombre){
  const M=MUNDOS[nombre];
  return {
    lejos(g,W,H,G){
      sky(g,W,H,M.fondo);
      const r=seeded(nombre.length*97+13);
      for(let i=0;i<140;i++){const x=r()*W,y=r()*H*.62,s=r()<.08?1.8:1;g.fillStyle=`rgba(255,255,255,${.25+r()*.55})`;g.fillRect(x,y,s,s);}
      const nw=G.narrow?150:250, nh=G.narrow?190:145;
      this.n1=nebulosa(nw,nh,nombre.length*31+1,M.neb,G.narrow?38:52,2.6);
      this.n2=nebulosa(nw,nh,nombre.length*31+2,M.neb2,G.narrow?34:46,2.4);
      this.n3=nebulosa(Math.round(nw*.7),Math.round(nh*.7),nombre.length*31+3,M.neb,G.narrow?20:28,2.2);
      this.pag=[0,1,2].map(i=>pagina(DIBUJOS[M.id],M.tinta,i*17+nombre.length));
      this.s=null;this.f=null;
    },
    atras(g,W,H,G,t,ph,dt,pul){
      const S=this.s||(this.s={p2:0,pages:Array.from({length:G.narrow?5:7},(_,i)=>({x:rand(.04,.96),y:rand(.08,.62),z:rand(.45,1),rot:rand(-.5,.5),vr:rand(-.15,.15),f:rand(0,TAU),vf:rand(.3,.8),b:rand(0,TAU),img:i%3})),
        runas:[],estr:Array.from({length:6},()=>({x:Math.random(),y:Math.random()*.5,p:rand(0,TAU)}))});
      S.p2+=((ph>=2?1:0)-S.p2)*Math.min(1,dt*1.2);
      const col=ph>=2?M.col2:M.col;
      // nebulosas (dos capas que derivan a distinta velocidad = profundidad)
      const drift=RM?0:t, cx=-A.cam.x;
      const nb=(img,a,dx,dy,sc)=>{g.globalAlpha=a;g.drawImage(img,-W*.1+dx,-H*.08+dy,W*1.2*sc,H*1.16*sc);};
      g.save();g.globalCompositeOperation='lighter';
      nb(this.n1,.85*(1-S.p2)+.2,Math.sin(drift*.05)*14+cx*10,Math.cos(drift*.04)*8,1);
      if(S.p2>.02) nb(this.n2,.9*S.p2,Math.sin(drift*.05+1)*14+cx*10,Math.cos(drift*.04)*8,1);
      nb(this.n3,.35+pul*.15,Math.cos(drift*.07)*22+cx*18,Math.sin(drift*.06)*12,1.02);
      g.globalAlpha=1;g.restore();
      // estrellas brillantes con destello en cruz
      g.save();g.globalCompositeOperation='lighter';
      for(const e of S.estr){const a=.5+.5*Math.sin(t*1.3+e.p),x=e.x*W,y=e.y*H;g.strokeStyle=`rgba(255,255,255,${.45*a})`;g.lineWidth=1;g.beginPath();g.moveTo(x-7*a,y);g.lineTo(x+7*a,y);g.moveTo(x,y-7*a);g.lineTo(x,y+7*a);g.stroke();glow(g,x,y,6,'255,255,255',.5*a);}
      g.restore();
      constelacion(g,M.id,W*(G.narrow?.82:.86),H*(G.narrow?.1:.17),G.narrow?22:30,t,col);
      constelacion(g,M.id,W*(G.narrow?.16:.13),H*(G.narrow?.12:.2),G.narrow?16:22,t+2,col);
      // páginas del grimorio flotando (giran en 3D)
      for(const p of S.pages){ if(!RM){p.f+=dt*p.vf;p.rot+=dt*p.vr*.3;p.b+=dt*.6;p.y-=dt*.004*p.z;if(p.y<-.1){p.y=.7;p.x=rand(.04,.96);}}
        const img=this.pag[p.img], s=(G.narrow?.55:.7)*p.z, x=p.x*W-A.cam.x*12*p.z, y=p.y*H+Math.sin(p.b)*6, fx=Math.cos(p.f);
        if(Math.abs(x-G.ex)<W*.16&&y<G.ey+80) continue; // no tapar al jefe
        g.save();g.translate(x,y);g.rotate(p.rot);g.scale(fx*s,s);g.globalAlpha=.35+.5*p.z;
        g.save();g.globalCompositeOperation='lighter';glow(g,0,0,52,col,.18);g.restore();
        if(fx<0){g.fillStyle='#b89a60';g.fillRect(-28,-36,56,72);} else g.drawImage(img,-28,-36,56,72);
        g.restore();}
      // sello gigante (lo que más le gustó a Niquito) + rayos
      rayos(g,G.ex,G.ey,10,H*1.1,t,col,.05+pul*.03,.06);
      sello(g,G.ex,G.ey-4,Math.min(W*.42,H*.46)*(G.narrow?1.05:1),t,{col,glif:M.glif,lados:M.lados,a:.85,pulso:pul,vel:ph>=3?2.6:ph>=2?1.7:1});
      sello(g,G.ex,G.ey-4,Math.min(W*.42,H*.46)*.55,t*-1.3,{col,glif:'',lados:M.lados===4?8:M.lados*2,a:.45,pulso:pul,vel:1});
      // piso de luz con su propio sello
      pisoLuz(g,W,H,G,col,t,pul);
      sello(g,W/2,G.by+(G.narrow?14:18),(G.narrow?W*.5:W*.36)*.8,t,{col,glif:M.glif,lados:M.lados,sy:.26,a:.7,pulso:pul,vel:-1});
      // runas que suben desde el piso
      if(!RM&&Math.random()<dt*3) S.runas.push({x:rand(.15,.85)*W,y:H*.95,c:M.glif.replace(/[ ·]/g,'').charAt(Math.floor(Math.random()*8))||'·',a:0,v:rand(18,34)});
      g.save();g.globalCompositeOperation='lighter';g.font='600 13px "Iowan Old Style",Georgia,serif';g.textAlign='center';
      for(let i=S.runas.length-1;i>=0;i--){const u=S.runas[i];u.y-=u.v*dt;u.a=Math.min(1,u.a+dt*2);const al=u.a*clamp((u.y-G.hz*.7)/80,0,1);if(al<=0&&u.y<G.hz){S.runas.splice(i,1);continue;}
        g.fillStyle=`rgba(${col},${al*.8})`;g.fillText(u.c,u.x+Math.sin(u.y*.05)*6,u.y);}
      g.restore();
      vortice(S,g,G,t,dt,col,40,ph>=2?1.2:.4);
      if(this.extra) this.extra(g,W,H,G,t,ph,dt,pul,S,col);
    },
    frente(g,W,H,G,t,ph,dt,pul){
      const S=this.f||(this.f={bok:Array.from({length:RM?6:16},()=>({x:Math.random(),y:Math.random(),r:rand(6,18),v:rand(.005,.02),p:rand(0,TAU)}))});
      const col=ph>=2?M.col2:M.col;
      g.save();g.globalCompositeOperation='lighter';
      for(const b of S.bok){if(!RM){b.y-=b.v*dt;if(b.y<-.05){b.y=1.05;b.x=Math.random();}}const a=.05+.05*Math.sin(t+b.p);
        const gr=g.createRadialGradient(b.x*W,b.y*H,0,b.x*W,b.y*H,b.r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(b.x*W-b.r,b.y*H-b.r,b.r*2,b.r*2);}
      g.restore();
      vineta(g,W,H,.78,'0,0,0');
    }
  };
}
A.arenas.pantano=crearMundo('pantano');
A.arenas.laboratorio=crearMundo('laboratorio');
A.arenas.catedral=crearMundo('catedral');
A.arenas.trono=crearMundo('trono');
/* Toques propios de cada dimensión */
A.arenas.pantano.extra=function(g,W,H,G,t,ph,dt,pul,S,col){ // burbujas tóxicas que suben brillando
  S.bub=S.bub||[]; if(!RM&&Math.random()<dt*5) S.bub.push({x:rand(.1,.9)*W,y:H,r:rand(2,5),v:rand(20,45)});
  g.save();g.globalCompositeOperation='lighter';
  for(let i=S.bub.length-1;i>=0;i--){const b=S.bub[i];b.y-=b.v*dt;if(b.y<G.hz*.4){S.bub.splice(i,1);continue;}const x=b.x+Math.sin(b.y*.04)*8;
    g.strokeStyle=`rgba(${col},.55)`;g.lineWidth=1;g.beginPath();g.arc(x,b.y,b.r,0,TAU);g.stroke();g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x-b.r*.4,b.y-b.r*.5,1.2,1.2);}
  g.restore();
};
A.arenas.laboratorio.extra=function(g,W,H,G,t,ph,dt,pul,S,col){ // anillos de energía 3D y relámpagos suaves dentro de la nebulosa
  const R=Math.min(W*.2,H*.3);
  g.save();g.globalCompositeOperation='lighter';
  for(let k=0;k<3;k++){const ay=t*(.6+k*.35)*(RM?0:1)*(ph>=2?1.8:1)+k, ax=.5+k*.3;
    const pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>proj(rotX(rotY({x:a*R*(.9-k*.15),y:b*R*(.9-k*.15),z:0},ay),ax),G.ex,G.ey));
    g.strokeStyle=`rgba(${col},${.55-k*.12})`;g.lineWidth=2.4-k*.5;g.beginPath();pts.forEach((p,i)=>g[i?'lineTo':'moveTo'](p.x,p.y));g.closePath();g.stroke();}
  S.rel=S.rel??2; if(!RM){S.rel-=dt; if(S.rel<0){S.rel=rand(2,4.5);S.relA=1;S.relX=rand(.1,.9);}}
  if(S.relA>0){glow(g,S.relX*W,H*.2,W*.25,'255,220,200',S.relA*.25);S.relA-=dt*1.5;}
  g.restore();
};
A.arenas.catedral.extra=function(g,W,H,G,t,ph,dt,pul,S,col){ // trozos de vitral hexagonales flotando
  S.vit=S.vit||Array.from({length:9},()=>({x:Math.random(),y:rand(.1,.7),r:rand(6,14),rot:rand(0,TAU),vr:rand(-.6,.6),c:['124,77,255','255,79,163','255,210,63','63,208,255'][Math.floor(Math.random()*4)],b:rand(0,TAU)}));
  g.save();
  for(const v of S.vit){if(!RM){v.rot+=dt*v.vr;v.b+=dt;}const x=v.x*W,y=v.y*H+Math.sin(v.b)*5;if(Math.abs(x-G.ex)<W*.14&&y<G.ey+70)continue;
    g.fillStyle=`rgba(${v.c},.45)`;hexPath(g,x,y,v.r,v.rot);g.fill();g.strokeStyle='rgba(20,10,30,.8)';g.lineWidth=1.5;g.stroke();
    g.save();g.globalCompositeOperation='lighter';glow(g,x,y,v.r*2.2,v.c,.2);g.restore();}
  g.restore();
};
A.arenas.trono.extra=function(g,W,H,G,t,ph,dt,pul,S,col){ // tetraedros dorados de alambre que giran (y rocas que levitan desde la fase 2)
  S.tet=S.tet||Array.from({length:5},(_,i)=>({x:[.12,.88,.22,.78,.5][i],y:[.42,.42,.18,.18,.08][i],s:rand(10,16),a:rand(0,TAU),b:rand(0,TAU)}));
  g.save();g.globalCompositeOperation='lighter';
  for(const q of S.tet){if(!RM){q.a+=dt*.7;q.b+=dt;}const x=q.x*W,y=q.y*H+Math.sin(q.b)*6;
    const V=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(([a,b,c])=>proj(rotX(rotY({x:a*q.s,y:b*q.s,z:c*q.s},q.a),.5),x,y));
    g.strokeStyle=`rgba(${col},.7)`;g.lineWidth=1.3;g.beginPath();for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){g.moveTo(V[i].x,V[i].y);g.lineTo(V[j].x,V[j].y);}g.stroke();
    V.forEach(v=>{g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(v.x,v.y,1.5,0,TAU);g.fill();});}
  g.restore();
  if(ph>=2){S.roca=S.roca||Array.from({length:8},()=>({x:Math.random(),y:rand(.5,1),v:rand(.02,.05),s:rand(4,10),r:rand(0,TAU)}));
    for(const rk of S.roca){if(!RM){rk.y-=rk.v*dt;rk.r+=dt*.6;if(rk.y<.1){rk.y=1;rk.x=Math.random();}}
      g.save();g.translate(rk.x*W,rk.y*H);g.rotate(rk.r);g.fillStyle='#1a1424';g.beginPath();g.moveTo(-rk.s,0);g.lineTo(-rk.s*.3,-rk.s*.8);g.lineTo(rk.s,-rk.s*.2);g.lineTo(rk.s*.4,rk.s*.7);g.closePath();g.fill();
      g.strokeStyle=`rgba(${col},.7)`;g.lineWidth=1;g.stroke();g.restore();}}
};

/* ---------- Pintar: capa fija (con paralaje) + capas vivas ---------- */
const cache={}, PAD=30;
function capa(id,W,H,G,k){
  const ar=A.arenas[id], key=W+'|'+H+'|'+k;
  if(!cache[id]||cache[id].key!==key){
    const c=document.createElement('canvas');c.width=Math.round((W+PAD*2)*k);c.height=Math.round((H+PAD*2)*k);
    const cg=c.getContext('2d');cg.setTransform(k,0,0,k,PAD*k,PAD*k); ar.lejos(cg,W,H,G); cache[id]={key,c};
  }
  return cache[id].c;
}
A.pintarArena=function(id,g,W,H,G,k,t,ph,dt){
  const ar=A.arenas[id]; if(!ar) return;
  const c=capa(id,W,H,G,k); g.drawImage(c,-PAD-A.cam.x*5,-PAD-A.cam.y*2,W+PAD*2,H+PAD*2);
  ar.atras(g,W,H,G,t,ph,dt,A.pulso());
};
A.pintarFrente=function(id,g,W,H,G,k,t,ph,dt){ const ar=A.arenas[id]; if(ar&&ar.frente) ar.frente(g,W,H,G,t,ph,dt,A.pulso()); };
})();
