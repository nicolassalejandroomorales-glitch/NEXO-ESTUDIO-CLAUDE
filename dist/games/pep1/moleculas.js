/* Dibuja anillos simples en SVG (estructura de línea-ángulo) a partir de las fichas de P1.MOL. Sin librerías. */
(function(){
const P1 = window.P1 = window.P1 || {};

P1.molSVG = function(key, size){
  const s = P1.MOL[key]; if(!s) return '';
  const n = s.n, R = n<=4 ? 20 : n>=7 ? 25 : 23, cx = 70, cy = 56, rot = s.rot||0;
  const V = Array.from({length:n},(_,i)=>{const a=-Math.PI/2+rot+i*2*Math.PI/n;return [cx+R*Math.cos(a),cy+R*Math.sin(a),a];});
  const het = s.het||{}, sus = s.sus||{}, carga = s.carga||{};
  let o = '';
  // enlaces (se acortan un poco donde hay heteroátomo)
  for(let i=0;i<n;i++){
    let [x1,y1]=V[i], [x2,y2]=V[(i+1)%n];
    const cut=(k,xa,ya,xb,yb)=>het[k]!==undefined?[xa+(xb-xa)*.3,ya+(yb-ya)*.3]:[xa,ya];
    [x1,y1]=cut(i,x1,y1,x2,y2); [x2,y2]=cut((i+1)%n,x2,y2,x1,y1);
    o += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    if((s.dobles||[]).includes(i)){
      // segundo trazo hacia el centro, más corto
      const mx=(x1+x2)/2,my=(y1+y2)/2,dx=cx-mx,dy=cy-my,d=Math.hypot(dx,dy)||1,ox=dx/d*4.5,oy=dy/d*4.5;
      const a1=[x1+(x2-x1)*.18+ox,y1+(y2-y1)*.18+oy],a2=[x1+(x2-x1)*.82+ox,y1+(y2-y1)*.82+oy];
      o += `<line x1="${a1[0].toFixed(1)}" y1="${a1[1].toFixed(1)}" x2="${a2[0].toFixed(1)}" y2="${a2[1].toFixed(1)}"/>`;
    }
  }
  // sustituyentes
  for(const k in sus){
    const [x,y,a]=V[k], c=Math.cos(a), sn=Math.sin(a), x2=x+c*13, y2=y+sn*13;
    o += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    const anchor = c>.35?'start':c<-.35?'end':'middle', tx=x+c*16, ty=y+sn*16+(sn>.35?9:sn<-.35?-2:4);
    o += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${anchor}">${sus[k]}</text>`;
  }
  // heteroátomos
  for(const k in het){
    const [x,y]=V[k];
    o += `<text x="${x.toFixed(1)}" y="${(y+4.5).toFixed(1)}" text-anchor="middle" class="het">${het[k]}</text>`;
  }
  // cargas y pares libres
  for(const k in carga){
    const [x,y,a]=V[k];
    o += `<text x="${(x+Math.cos(a)*11).toFixed(1)}" y="${(y+Math.sin(a)*11+4).toFixed(1)}" text-anchor="middle" class="q">${carga[k]}</text>`;
  }
  for(const k of (s.par||[])){
    const [x,y,a]=V[k], px=-Math.sin(a), py=Math.cos(a), bx=x+Math.cos(a)*6, by=y+Math.sin(a)*6;
    o += `<circle cx="${(bx+px*7).toFixed(1)}" cy="${(by+py*7).toFixed(1)}" r="1.6" class="dot"/><circle cx="${(bx+px*11).toFixed(1)}" cy="${(by+py*11).toFixed(1)}" r="1.6" class="dot"/>`;
  }
  // el marco se ajusta a la molécula: anillo solo → más grande; con sustituyentes → deja espacio para el texto
  const half = R + (Object.keys(sus).length ? 34 : (Object.keys(carga).length||s.par ? 17 : 9)), sz = size||70;
  return `<svg class="mol" viewBox="${cx-half} ${cy-half} ${half*2} ${half*2}" width="${sz}" height="${sz}" aria-hidden="true">${o}</svg>`;
};
})();
