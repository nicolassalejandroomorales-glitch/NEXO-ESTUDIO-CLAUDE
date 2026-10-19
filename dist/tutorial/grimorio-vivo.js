/* Grimorio vivo: apila las capas del arte (tools/tutorial-pixel/build_grimorio.py) en un canvas de 68x76 que el CSS agranda pixelado.
   De atrás hacia adelante: fondo (atril, velas, halo) → manos (detrás del libro; cada una oscila con su resorte y se agita al hablar) → páginas
   (el canto y la oreja aletean) → tapa (se alza un píxel al abrir la boca) → cara (parpadea sola) → barba (ondea con inercia, en cortes de píxel
   entero) → boca → extras (nubes, signos y chispas flotan). Tapa, cara, barba y boca suben juntas: son «la cabeza» del libro.
   Uso: const v = NexoGrimorioVivo.mount(elemento); v.set('feliz'); v.mouth(0|1|2); v.talk(true); v.kick(1.5).
   El elemento anfitrión debe medir lo mismo que el arte (68x76 × escala) y ser position:relative. Sin «reducir movimiento» corre un bucle de ~24 cuadros por segundo. */
(() => {
  'use strict';
  const W = 68, H = 76;
  const ROWS = ['reposo', 'senalar', 'abrir', 'importante', 'feliz', 'sorprendido', 'pensativo', 'triste', 'enojado', 'espiral', 'sudor', 'guino', 'nocreo', 'lista', 'dedo', 'dormido'];
  const NOMBRES = ['fondo', 'manoI', 'manoD', 'paginas', 'tapa', 'cara', 'barba', 'boca', 'extras'];
  const B0 = 30, B1 = 64;                        // filas de la barba que ondean (la punta se mueve más)
  const PX0 = 44, PY0 = 16, PY1 = 58;            // canto de las páginas que aletea: columnas desde PX0, filas PY0..PY1
  const OREJA0 = 26, OREJA1 = 37;                // filas de la página con oreja (aletea más)
  const HERE = document.currentScript?.src || new URL('tutorial/grimorio-vivo.js', document.baseURI).href;
  const asset = n => new URL(`../assets/tutorial/grimorio-${n}.png`, HERE).href;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let hojas = null;
  const cargar = () => hojas ||= Promise.all(NOMBRES.map(n => new Promise((ok, mal) => {
    const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = asset(n);
  }))).then(l => Object.fromEntries(NOMBRES.map((n, i) => [n, l[i]])));

  function mount(host) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none';
    host.prepend(cv);
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    let im = null, fila = 0, boca = 0, ojos = 0, talking = false, x = 0, vx = 0, t = 0, ultimo = 0, sigParpadeo = 1.5, raf = 0, viva = true, huella = '';
    const brazo = [{ y: 0, v: 0, ph: 0 }, { y: 0, v: 0, ph: 2.1 }];     // [izquierdo, derecho]
    let flota = 0, cabeza = 0, hoja = [], tAbierta = -9;

    const corte = r => { const k = Math.min(1, Math.max(0, (r - B0) / (B1 - B0))); return Math.round(x * k ** 1.4); };
    const llave = () => [fila, boca, ojos, corte(B1), Math.round(brazo[0].y), Math.round(brazo[1].y), flota, cabeza, hoja.join('')].join();
    function pinta() {
      if (!im || !viva) return;
      const y0 = fila * H, pieza = (n, dx = 0, dy = 0, col = 0) => g.drawImage(im[n], col * W, y0, W, H, dx, dy, W, H);
      g.clearRect(0, 0, W, H);
      pieza('fondo');
      pieza('manoI', 0, Math.round(brazo[0].y));
      pieza('manoD', 0, Math.round(brazo[1].y));
      pieza('paginas');
      hoja.forEach((o, i) => { if (o) g.drawImage(im.paginas, PX0, y0 + PY0 + i, W - PX0, 1, PX0 + o, PY0 + i, W - PX0, 1); });
      pieza('tapa', 0, cabeza);
      pieza('cara', 0, cabeza, ojos);
      const tira = (n, col, ini, fin) => { for (let r = ini; r < fin; r++) g.drawImage(im[n], col * W, y0 + r, W, 1, corte(r), r + cabeza, W, 1); };
      g.drawImage(im.barba, 0, y0, W, B0, 0, cabeza, W, B0);
      tira('barba', 0, B0, B1);
      g.drawImage(im.barba, 0, y0 + B1, W, H - B1, corte(B1), B1 + cabeza, W, H - B1);
      tira('boca', boca, B0, 56);
      pieza('extras', 0, flota);
      huella = llave();
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
      for (const a of brazo) {                   // las manos suben y bajan despacio; al hablar gesticulan
        const m = Math.sin(t * 1.7 + a.ph) * .55 + (talking ? Math.sin(t * 6.5 + a.ph) * .7 : 0);
        a.v += (-40 * (a.y - m) - 6 * a.v) * dt; a.y += a.v * dt;
        a.y = Math.max(-2.4, Math.min(2.4, a.y));
      }
      flota = Math.round(Math.sin(t * 2.1) * .6);
      cabeza = t - tAbierta < .3 || Math.sin(t * .9) > .8 ? -1 : 0;     // la tapa se alza al abrir la boca y respira de vez en cuando
      for (let i = 0; i <= PY1 - PY0; i++) {                    // el canto de las páginas ondea hacia afuera (0 a 2 px; la oreja, más)
        const r = PY0 + i, ola = Math.sin(t * 3.2 + r * .42), oreja = r >= OREJA0 && r < OREJA1 ? Math.max(0, Math.sin(t * 2.3 + 1)) * 1.4 : 0;
        hoja[i] = Math.round(Math.max(0, ola * (.8 + (talking ? .7 : 0)) + .15) + oreja);
      }
      sigParpadeo -= dt;
      if (sigParpadeo < -.13) { sigParpadeo = 2.2 + Math.random() * 3.2; ojos = 0; } else if (sigParpadeo < 0) ojos = 1;
      if (llave() !== huella) pinta();
    }

    cargar().then(h => { im = h; pinta(); if (!reduced() && viva) raf = requestAnimationFrame(paso); }).catch(() => {});
    return {
      set(pose) { fila = Math.max(0, ROWS.indexOf(pose)); pinta(); },
      mouth(fase) { boca = fase; if (fase === 2) tAbierta = t; if (reduced()) pinta(); },
      talk(on) { talking = !!on; },
      kick(v) { vx += v; for (const a of brazo) a.v -= Math.abs(v) * 1.6; },
      destroy() { viva = false; cancelAnimationFrame(raf); cv.remove(); }
    };
  }

  window.NexoGrimorioVivo = { mount, ROWS };
})();
