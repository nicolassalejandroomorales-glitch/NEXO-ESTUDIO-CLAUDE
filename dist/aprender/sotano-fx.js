/* Capa viva del Sótano: luciérnagas, polvo en el aire y pulso de cristales, dibujados en un lienzo encima del cuadro (sin tocar los clics).
   Uso: const fx = NexoSotanoFx.mount(escenario); fx.destroy(). Si el celular va lento baja la cantidad sola; con «reducir movimiento» no se monta. */
(() => {
  'use strict';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function mount(stage) {
    if (reduced()) return { destroy() {} };
    const cv = document.createElement('canvas'); cv.className = 'sotano-fx'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen';
    stage.append(cv);
    const g = cv.getContext('2d');
    let W = 0, H = 0, raf = 0, last = 0, t = 0, viva = true, cuota = 1, lentos = 0;
    const flies = Array.from({ length: 22 }, () => ({ x: rnd(0, 1), y: rnd(.1, .9), ph: rnd(0, 6.3), v: rnd(.01, .035), hue: Math.random() < .5 ? 52 : 160 }));
    const dust = Array.from({ length: 40 }, () => ({ x: rnd(0, 1), y: rnd(0, 1), s: rnd(.4, 1.4), v: rnd(.004, .016) }));
    const glints = Array.from({ length: 9 }, () => ({ x: rnd(.08, .92), y: rnd(.15, .8), ph: rnd(0, 6.3), r: rnd(.012, .03), hue: [190, 170, 280, 50][Math.floor(rnd(0, 4))] }));

    function size() {
      const r = stage.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      W = cv.width = Math.max(1, Math.round(r.width * d)); H = cv.height = Math.max(1, Math.round(r.height * d));
    }
    function frame(now) {
      if (!viva) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden || !stage.offsetWidth) return;
      const dt = Math.min(.1, (now - last) / 1000 || 0); last = now;
      if (dt > .04) { if (++lentos > 25 && cuota > .3) { cuota -= .2; lentos = 0; } } else if (lentos > 0) lentos--;   // celular lento: menos partículas
      t += dt;
      if (W !== Math.round(stage.clientWidth * Math.min(devicePixelRatio || 1, 2))) size();
      g.clearRect(0, 0, W, H);
      const u = W / 320;
      dust.slice(0, Math.ceil(dust.length * cuota)).forEach(p => {
        p.y -= p.v * dt; p.x += Math.sin(t * .6 + p.y * 9) * .0006; if (p.y < -.02) { p.y = 1.02; p.x = rnd(0, 1); }
        g.fillStyle = 'rgba(210,235,230,.35)'; g.fillRect(Math.round(p.x * W), Math.round(p.y * H), Math.ceil(p.s * u), Math.ceil(p.s * u));
      });
      glints.forEach(c => {
        const a = .5 + .5 * Math.sin(t * 1.3 + c.ph), R = c.r * W * (.7 + .5 * a);
        const gr = g.createRadialGradient(c.x * W, c.y * H, 0, c.x * W, c.y * H, R);
        gr.addColorStop(0, `hsla(${c.hue},90%,70%,${.28 * a})`); gr.addColorStop(1, `hsla(${c.hue},90%,60%,0)`);
        g.fillStyle = gr; g.fillRect(c.x * W - R, c.y * H - R, R * 2, R * 2);
      });
      flies.slice(0, Math.ceil(flies.length * cuota)).forEach(f => {
        f.x += Math.cos(t * .7 + f.ph) * f.v * dt; f.y += Math.sin(t * .9 + f.ph * 1.7) * f.v * dt;
        f.x = (f.x + 1) % 1; f.y = Math.min(.95, Math.max(.05, f.y));
        const a = .35 + .65 * Math.max(0, Math.sin(t * 2.2 + f.ph)), px = f.x * W, py = f.y * H, R = 5 * u;
        const gr = g.createRadialGradient(px, py, 0, px, py, R);
        gr.addColorStop(0, `hsla(${f.hue},100%,75%,${a})`); gr.addColorStop(1, `hsla(${f.hue},100%,60%,0)`);
        g.fillStyle = gr; g.fillRect(px - R, py - R, R * 2, R * 2);
        g.fillStyle = `hsla(${f.hue},100%,90%,${a})`; g.fillRect(Math.round(px), Math.round(py), Math.ceil(u), Math.ceil(u));
      });
    }
    size(); raf = requestAnimationFrame(frame);
    return { destroy() { viva = false; cancelAnimationFrame(raf); cv.remove(); } };
  }
  window.NexoSotanoFx = { mount };
})();
