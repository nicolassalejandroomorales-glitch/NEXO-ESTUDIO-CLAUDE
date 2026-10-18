/* Grimorio vivo: apila las capas del arte (tools/tutorial-pixel/build_grimorio.py) en un canvas de 68x76 que el CSS agranda pixelado.
   Cuerpo (libro, atril, brazos, efectos) → cara (ojos, cejas, nariz; parpadea sola) → barba (ondea con inercia, en cortes de píxel entero) → boca.
   Uso: const v = NexoGrimorioVivo.mount(elemento); v.set('feliz'); v.mouth(0|1|2); v.talk(true); v.kick(1.5).
   El elemento anfitrión debe medir lo mismo que el arte (68x76 × escala) y ser position:relative. Sin «reducir movimiento» corre un bucle de ~24 cuadros por segundo. */
(() => {
  'use strict';
  const W = 68, H = 76;
  const ROWS = ['reposo', 'senalar', 'abrir', 'importante', 'feliz', 'sorprendido', 'pensativo', 'triste', 'enojado', 'espiral', 'sudor', 'guino', 'nocreo', 'lista', 'dedo', 'dormido'];
  const B0 = 30, B1 = 64;                        // filas de la barba que ondean (la punta se mueve más)
  const HERE = document.currentScript?.src || new URL('tutorial/grimorio-vivo.js', document.baseURI).href;
  const asset = n => new URL(`../assets/tutorial/grimorio-${n}.png`, HERE).href;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let hojas = null;
  const cargar = () => hojas ||= Promise.all(['cuerpo', 'cara', 'barba', 'boca'].map(n => new Promise((ok, mal) => {
    const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = asset(n);
  }))).then(([cuerpo, cara, barba, boca]) => ({ cuerpo, cara, barba, boca }));

  function mount(host) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none';
    host.prepend(cv);
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    let im = null, fila = 0, boca = 0, ojos = 0, talking = false, x = 0, vx = 0, t = 0, ultimo = 0, sigParpadeo = 1.5, raf = 0, viva = true, huella = '';

    const corte = r => { const k = Math.min(1, Math.max(0, (r - B0) / (B1 - B0))); return Math.round(x * k ** 1.4); };
    function pinta() {
      if (!im || !viva) return;
      const y0 = fila * H;
      const huellaNueva = [fila, boca, ojos, corte(B1)].join();
      g.clearRect(0, 0, W, H);
      g.drawImage(im.cuerpo, 0, y0, W, H, 0, 0, W, H);
      g.drawImage(im.cara, ojos * W, y0, W, H, 0, 0, W, H);
      const tira = (hoja, col, ini, fin) => { for (let r = ini; r < fin; r++) g.drawImage(hoja, col * W, y0 + r, W, 1, corte(r), r, W, 1); };
      g.drawImage(im.barba, 0, y0, W, B0, 0, 0, W, B0);
      tira(im.barba, 0, B0, B1);
      g.drawImage(im.barba, 0, y0 + B1, W, H - B1, corte(B1), B1, W, H - B1);
      tira(im.boca, boca, B0, 56);
      huella = huellaNueva;
    }

    function paso(ahora) {
      if (!cv.isConnected) { viva = false; return; }
      raf = requestAnimationFrame(paso);
      const dt = Math.min(.05, (ahora - ultimo) / 1000 || 0); if (dt < .04) return;   // ~24 cuadros/s
      ultimo = ahora;
      if (document.hidden || !cv.offsetWidth) return;
      t += dt;
      const meta = Math.sin(t * 1.1) * (.9 + (talking ? .7 : 0));
      vx += (-34 * (x - meta) - 5.5 * vx) * dt; x += vx * dt;
      x = Math.max(-3, Math.min(3, x));
      sigParpadeo -= dt;
      if (sigParpadeo < -.13) { sigParpadeo = 2.2 + Math.random() * 3.2; ojos = 0; } else if (sigParpadeo < 0) ojos = 1;
      if ([fila, boca, ojos, corte(B1)].join() !== huella) pinta();
    }

    cargar().then(h => { im = h; pinta(); if (!reduced() && viva) raf = requestAnimationFrame(paso); }).catch(() => {});
    return {
      set(pose) { fila = Math.max(0, ROWS.indexOf(pose)); pinta(); },
      mouth(fase) { boca = fase; if (reduced()) pinta(); },
      talk(on) { talking = !!on; },
      kick(v) { vx += v; },
      destroy() { viva = false; cancelAnimationFrame(raf); cv.remove(); }
    };
  }

  window.NexoGrimorioVivo = { mount, ROWS };
})();
