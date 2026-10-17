/* Vida del refugio pixel (11 oct 2026): un <canvas> de 418×235 px de arte sobre el fondo, escalado ×4 sin difuminar.
   Pinta lo que se mueve: el cielo de la ventana según la hora y el clima real (nubes que avanzan, pájaros, sol, luna,
   estrellas, lluvia, gotas en el vidrio, relámpagos suaves), los rayos de sol que se desplazan dentro del haz y el
   halo de cada llama, que titila. Todo sale de tools/home-pixel/build_refugio.py (refugio-pixel-mapa.json + máscaras).
   ~10 cuadros/s (5 con calidad baja); se detiene con la pestaña oculta o ambient-paused. Con movimiento reducido:
   un cuadro fijo que igual respeta la hora y el clima. */
(() => {
  'use strict';
  if (typeof document === 'undefined') return;
  const BASE = 'assets/home-scenes/', FPS = 10;
  let assets = null, loading = null, live = null;

  const loadImage = src => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src; });
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  // Una imagen en escala de grises (máscara) -> canvas cuyo canal alfa es ese gris.
  function alphaMask(img) {
    const c = canvas(img.width, img.height), x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < d.data.length; i += 4) { d.data[i + 3] = d.data[i]; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; }
    x.putImageData(d, 0, 0);
    return { canvas: c, data: d.data };
  }

  async function loadAssets() {
    if (assets) return assets;
    if (loading) return loading;
    loading = (async () => {
      const map = await (await fetch(BASE + 'refugio-pixel-mapa.json')).json();
      const [bg, glass, haz, ...lands] = await Promise.all([
        loadImage(BASE + 'refugio-pixel.png'), loadImage(BASE + 'refugio-pixel-vidrio.png'), loadImage(BASE + 'refugio-pixel-haz.png'),
        ...['sol', 'nublado', 'tarde', 'noche'].map(m => loadImage(BASE + `refugio-pixel-paisaje-${m}.png`))]);
      const [x0, y0, x1, y1] = map.window, ww = x1 - x0, wh = y1 - y0;
      const hz = alphaMask(haz), rays = [];
      for (let y = 0; y < haz.height; y += 1) for (let x = 0; x < haz.width; x += 1) {
        const v = hz.data[(y * haz.width + x) * 4 + 3] / 255;
        if (v > 0.08) rays.push(x, y, v);
      }
      const r = rng(7);
      const stars = Array.from({ length: 34 }, () => [Math.floor(r() * ww), Math.floor(r() * wh * 0.6), r()]);
      const clouds = Array.from({ length: 9 }, (_, i) => ({
        shape: Array.from({ length: 5 + Math.floor(r() * 4) }, (_, k) => [(k - 3) * (3.5 + r() * 3), (r() - 0.5) * 3.5, 3 + r() * 4.2]),
        y: 6 + r() * (wh * 0.45), x: r() * (ww + 40), speed: 4 + r() * 6, order: i,
      }));
      const drops = Array.from({ length: 70 }, () => [r(), r(), 0.8 + r() * 0.4, 3 + Math.floor(r() * 2)]);
      const glassDrops = Array.from({ length: 9 }, () => [r() * ww, r() * wh, 2 + r() * 5, r()]);
      const motes = Array.from({ length: 40 }, () => Math.floor(r() * (rays.length / 3)) * 3);
      assets = { map, ww, wh, glass: alphaMask(glass).canvas, rays, raysW: haz.width, raysH: haz.height,
        lands: { sol: lands[0], nublado: lands[1], tarde: lands[2], noche: lands[3] }, stars, clouds, drops, glassDrops, motes,
        cloudCache: new Map(), halos: { small: halo(10), big: halo(17), fly: halo(5, [190, 255, 110]), potion: halo(9, [90, 210, 230]) },
        ...leafLayers(bg), shadow: cloudShadow(), flies: Array.from({ length: 12 }, () => [24 + r() * 370, 50 + r() * 150, r() * 6.28, r() * 6.28]) };
      return assets;
    })();
    return loading;
  }

  // Halo de pixel art: anillos de borde duro con un poco de tramado entre anillos.
  function halo(radius, rgb = [255, 180, 70]) {
    const size = radius * 2 + 1, c = canvas(size, size), x = c.getContext('2d'), d = x.createImageData(size, size);
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let j = 0; j < size; j += 1) for (let i = 0; i < size; i += 1) {
      const t = Math.max(0, 1 - Math.hypot(i - radius, j - radius) / radius);
      const step = Math.floor(t * 3 + (bayer[(j % 4) * 4 + (i % 4)] / 16) * 0.7) / 3, k = (j * size + i) * 4;
      d.data[k] = rgb[0]; d.data[k + 1] = rgb[1]; d.data[k + 2] = rgb[2]; d.data[k + 3] = Math.round(step * step * 255);
    }
    x.putImageData(d, 0, 0);
    return c;
  }

  // Nube dibujada con su paleta (luz arriba, sombra abajo), guardada para no rehacerla cada cuadro.
  function cloudSprite(A, cloud, palette, shift) {
    const key = cloud.order + palette + shift;
    if (A.cloudCache.has(key)) return A.cloudCache.get(key);
    const cols = A.map.clouds[palette].map(hex), W = 52, H = 22, c = canvas(W, H), x = c.getContext('2d'), d = x.createImageData(W, H);
    for (let j = 0; j < H; j += 1) for (let i = 0; i < W; i += 1) {
      let lv = -1;
      for (const [ox, oy, r] of cloud.shape) {
        const dy = j - (H / 2 + oy), dist = Math.hypot(i - (W / 2 + ox), dy * 1.25);
        if (dist <= r) lv = Math.max(lv, dy < -r * 0.35 ? 3 : dy > r * 0.35 ? 1 : 2);
      }
      if (lv < 0) continue;
      const [r, g, b] = cols[Math.max(0, Math.min(cols.length - 1, lv + shift))], k = (j * W + i) * 4;
      d.data[k] = r; d.data[k + 1] = g; d.data[k + 2] = b; d.data[k + 3] = 255;
    }
    x.putImageData(d, 0, 0);
    A.cloudCache.set(key, c);
    return c;
  }

  // Hojas del fondo repartidas en 6 franjas diagonales: cada franja se ilumina un rato, así una ola de luz recorre la hiedra.
  const LEAF_BANDS = 6;
  function leafLayers(bg) {
    const W = 418, H = 235, tmp = canvas(W, H), tx = tmp.getContext('2d');
    tx.imageSmoothingEnabled = false; tx.drawImage(bg, 0, 0, W, H);
    const px = tx.getImageData(0, 0, W, H).data, bands = Array.from({ length: LEAF_BANDS }, () => { const c = canvas(W, H); return { c, x: c.getContext('2d'), d: null }; });
    bands.forEach(b => { b.d = b.x.createImageData(W, H); });
    const spawn = [];
    for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
      const k = (y * W + x) * 4, r = px[k], g = px[k + 1], b = px[k + 2];
      if (g > r + 8 && g > b + 8 && g > 70) {
        const band = Math.floor((x * 0.65 + y * 0.35) / 9) % LEAF_BANDS, d = bands[band].d.data;
        d[k] = 205; d[k + 1] = 235; d[k + 2] = 120; d[k + 3] = 255;
        if (y < 150 && (x + y * 3) % 17 === 0) spawn.push([x, y]);
      }
    }
    bands.forEach(b => b.x.putImageData(b.d, 0, 0));
    return { leafBands: bands.map(b => b.c), leafSpawn: spawn };
  }

  // Sombra de nube sobre el piso: óvalo tramado (dos niveles) que cruza la sala despacio.
  function cloudShadow() {
    const W = 110, H = 26, c = canvas(W, H), x = c.getContext('2d'), d = x.createImageData(W, H), bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let j = 0; j < H; j += 1) for (let i = 0; i < W; i += 1) {
      const e = Math.hypot((i - W / 2) / (W / 2), (j - H / 2) / (H / 2));
      if (e >= 1) continue;
      const v = (1 - e) * 2 + bayer[(j % 4) * 4 + (i % 4)] / 16 - 0.45, k = (j * W + i) * 4;
      if (v < 0.7) continue;
      d.data[k] = 20; d.data[k + 1] = 24; d.data[k + 2] = 44; d.data[k + 3] = v > 1.5 ? 70 : 38;
    }
    x.putImageData(d, 0, 0);
    return c;
  }

  function readWeights() {
    const s = document.body.style, n = k => Number(s.getPropertyValue(k)) || 0;
    const w = { dawn: n('--w-dawn'), day: n('--w-day'), dusk: n('--w-dusk'), night: n('--w-night') };
    if (w.dawn + w.day + w.dusk + w.night < 0.01) w.day = 1;
    const wx = window.NexoWeather ? { ...window.NexoWeather.current(), ...window.NexoWeather.weights(window.NexoWeather.current()) }
      : { kind: 'clear', cover: 0, cloud: 0, rain: 0, storm: 0, fog: 0 };
    return { w, wx, hour: Number(document.body.dataset.nexoHour) || 12 };
  }

  // Mezcla varias capas con sus pesos (promedio exacto con alfa acumulado).
  function blend(ctx, items, drawItem) {
    let acc = 0;
    for (const [key, weight] of items) {
      if (weight < 0.01) continue;
      ctx.globalAlpha = acc === 0 ? 1 : weight / (acc + weight);
      drawItem(key); acc += weight;
    }
    ctx.globalAlpha = 1;
  }

  function drawWindow(L, t) {
    const A = L.A, { ww, wh } = A, x = L.wctx, { w, wx, hour } = L.env;
    x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, ww, wh);
    const horizon = Math.round(wh * 0.66), dayish = w.day + w.dawn * 0.6 + w.dusk * 0.4;
    // 1) cielo en bandas limpias, con una fila tramada entre banda y banda
    const sky = name => {
      const cols = A.map.skies[name];
      for (let y = 0; y < wh; y += 1) {
        const f = Math.min(cols.length - 1, (y / horizon) * cols.length), b = Math.floor(f);
        const edge = f - b > 0.82 && b + 1 < cols.length;
        x.fillStyle = cols[b]; x.fillRect(0, y, ww, 1);
        if (edge) { x.fillStyle = cols[b + 1]; for (let i = y % 2; i < ww; i += 2) x.fillRect(i, y, 1, 1); }
      }
    };
    const grey = wx.cloud;
    blend(x, [['day', w.day * (1 - grey)], ['cloudy', (w.day + w.dawn * 0.5) * grey], ['dawn', w.dawn * (1 - grey * 0.5)],
      ['dusk', w.dusk * (1 - grey * 0.4)], ['night', w.night]], sky);
    // 2) estrellas y luna (de noche, si no está nublado)
    const starA = w.night * (1 - grey * 0.9);
    if (starA > 0.05) {
      for (const [sx, sy, p] of A.stars) {
        const on = Math.sin(t * (1.2 + p * 2) + p * 30) > -0.4;
        x.globalAlpha = starA * (on ? (p > 0.75 ? 1 : 0.65) : 0.25);
        x.fillStyle = p > 0.85 ? '#fff6d0' : '#cfd8ff'; x.fillRect(sx, sy, 1, 1);
      }
      const mx = Math.round(ww * 0.72), my = 9;
      x.globalAlpha = starA;
      for (let j = -4; j <= 4; j += 1) for (let i = -4; i <= 4; i += 1) {
        if (Math.hypot(i, j) > 3.6 || Math.hypot(i + 1.6, j - 0.8) < 3) continue;   // media luna
        x.fillStyle = i + j < -2 ? '#fffbe8' : '#e6e2c8'; x.fillRect(mx + i, my + j, 1, 1);
      }
      x.globalAlpha = 1;
    }
    // 3) sol: recorre la ventana según la hora (sale a la izquierda, se pone a la derecha)
    const sunA = (w.day + w.dawn + w.dusk) * (1 - grey);
    if (sunA > 0.05 && hour > 6 && hour < 20.5) {
      const p = Math.max(0, Math.min(1, (hour - 6.5) / 13)), sx = Math.round(4 + p * (ww - 8));
      const sy = Math.round(horizon - Math.sin(p * Math.PI) * (horizon - 9)), low = w.dusk + w.dawn, rad = low > 0.5 ? 4 : 3;
      x.globalAlpha = sunA;
      for (let j = -rad - 2; j <= rad + 2; j += 1) for (let i = -rad - 2; i <= rad + 2; i += 1) {
        const dd = Math.hypot(i, j);
        if (dd <= rad) { x.fillStyle = low > 0.5 ? (dd < rad - 1.5 ? '#ffe890' : '#f89a30') : (dd < rad - 1 ? '#fffce8' : '#ffe890'); x.fillRect(sx + i, sy + j, 1, 1); }
        else if (dd <= rad + 2 && (i + j) % 2 === 0) { x.fillStyle = low > 0.5 ? '#ffc850' : '#fff8d4'; x.globalAlpha = sunA * 0.5; x.fillRect(sx + i, sy + j, 1, 1); x.globalAlpha = sunA; }
      }
      x.globalAlpha = 1;
    }
    // 4) nubes que avanzan (más y más grises si está nublado o llueve)
    const nClouds = wx.kind === 'clear' ? 4 + Math.round((wx.cover / 100) * 4) : 9;
    const palette = w.night > 0.5 ? 'night' : grey > 0.5 || wx.rain > 0 ? 'cloudy' : w.dusk > 0.4 ? 'dusk' : w.dawn > 0.4 ? 'dawn' : 'day';
    const shift = wx.storm ? -1 : wx.rain > 0.6 ? -1 : 0;
    const wind = 1 + wx.rain * 0.8 + wx.storm;
    for (const cl of A.clouds.slice(0, nClouds)) {
      const span = ww + 56, cx = ((cl.x + t * cl.speed * wind) % span + span) % span - 28;
      const cy = wx.kind === 'clear' ? cl.y : cl.y * 0.7;
      x.drawImage(cloudSprite(A, cl, palette, shift), Math.round(cx - 26), Math.round(cy - 11));
    }
    if (wx.rain > 0 || wx.kind === 'cloudy') { x.globalAlpha = 0.25 * Math.max(wx.rain, grey * 0.6); x.fillStyle = '#2a3244'; x.fillRect(0, 0, ww, wh); x.globalAlpha = 1; }
    // 5) paisaje con la luz de la hora (pintado en Python con las rampas)
    blend(x, [['sol', w.day * (1 - grey)], ['nublado', (w.day) * grey], ['tarde', w.dawn + w.dusk], ['noche', w.night]],
      k => x.drawImage(A.lands[k], 0, 0));
    // 6) niebla
    if (wx.fog) {
      x.fillStyle = w.night > 0.5 ? '#3a4058' : '#c8ccd4';
      for (let k = 0; k < 3; k += 1) { x.globalAlpha = 0.35; x.fillRect(0, Math.round(horizon - 12 + k * 7 + Math.sin(t * 0.3 + k) * 2), ww, 4); }
      x.globalAlpha = 1;
    }
    // 7) pájaros: una bandada cruza cada ~22 s con buen tiempo de día
    if (dayish > 0.5 && wx.rain === 0 && !wx.storm) {
      const cyc = t % 22, bx = -6 + cyc * 5;
      if (bx < ww + 10) {
        x.fillStyle = w.dusk > 0.4 ? '#2a1a26' : '#3a2f33';
        [[0, 0], [-4, 2], [-7, -1], [-10, 3]].forEach(([ox, oy], k) => {
          const px = Math.round(bx + ox), py = Math.round(24 + oy + Math.sin(t * 2 + k) * 0.8), up = Math.floor(t * 4 + k) % 2 === 0;
          x.fillRect(px, py, 1, 1); x.fillRect(px - 1, py - (up ? 1 : 0), 1, 1); x.fillRect(px + 1, py - (up ? 1 : 0), 1, 1);
          if (!up) { x.fillRect(px - 2, py + 1, 1, 1); x.fillRect(px + 2, py + 1, 1, 1); }
        });
      }
    }
    // 8) lluvia: rayitas inclinadas que caen rápido + gotas que bajan por el vidrio
    if (wx.rain > 0) {
      const n = Math.round(A.drops.length * (wx.storm ? 1 : wx.rain >= 1 ? 0.65 : 0.3));
      x.fillStyle = w.night > 0.5 ? '#7c8ab0' : '#c4d0e6';
      for (const [rx, ry, sp, len] of A.drops.slice(0, n)) {
        const y0 = ((ry * (wh + 10) + t * 75 * sp) % (wh + 10)) - 6, x0 = rx * (ww + 20) - (y0 * 0.3);
        x.globalAlpha = 0.6;
        for (let k = 0; k < len; k += 1) x.fillRect(Math.round(x0 - k * 0.3), Math.round(y0 + k), 1, 1);
      }
      x.globalAlpha = 1;
      for (const g of A.glassDrops) {
        const gy = (g[1] + t * g[2]) % (wh + 4) - 2, gx = Math.round(g[0] + Math.sin(gy * 0.3 + g[3] * 9) * 0.6);
        x.fillStyle = '#9fb0c8'; x.globalAlpha = 0.5; x.fillRect(gx, Math.round(gy) - 3, 1, 3);
        x.globalAlpha = 0.85; x.fillStyle = '#e6eef8'; x.fillRect(gx, Math.round(gy), 1, 1); x.fillStyle = '#5c6a84'; x.fillRect(gx, Math.round(gy) + 1, 1, 1);
      }
      x.globalAlpha = 1;
    }
    // 9) relámpago: destello suave y raro (nunca con reduced-motion)
    if (wx.storm && !L.still) {
      if (t > L.nextFlash) { L.flashUntil = t + 0.22; L.nextFlash = t + 7 + Math.random() * 12; }
      if (t < L.flashUntil) { x.globalAlpha = 0.65; x.fillStyle = '#eef2ff'; x.fillRect(0, 0, ww, wh); x.globalAlpha = 1; }
    }
    // sólo queda lo que cae sobre el vidrio (el marco, los parteluces, la cortina y la hiedra quedan intactos)
    x.globalCompositeOperation = 'destination-in'; x.drawImage(A.glass, 0, 0); x.globalCompositeOperation = 'source-over';
  }

  function drawRays(L, t) {
    const A = L.A, { w, wx } = L.env, d = L.rayData.data, R = A.rays;
    const S = (w.day + w.dawn * 0.6 + w.dusk * 0.5) * Math.pow(1 - wx.cloud, 1.5) * (1 - wx.rain);
    L.raysOn = S > 0.03;
    if (!L.raysOn) return;
    const warm = w.dusk + w.dawn > 0.5 ? [255, 176, 96] : [255, 240, 186];
    for (let i = 0; i < R.length; i += 3) {
      const px = R[i], py = R[i + 1], v = R[i + 2], u = px - py * 0.62;
      const band = 0.5 + 0.5 * Math.sin(u * 0.21 - t * 0.55) + 0.28 * Math.sin(u * 0.53 + t * 0.9);
      const q = band > 1.05 ? 2 : band > 0.72 ? 1 : 0, k = (py * A.raysW + px) * 4;
      d[k] = warm[0]; d[k + 1] = warm[1]; d[k + 2] = warm[2]; d[k + 3] = Math.round(v * q * 34 * S);
    }
    L.rayCtx.putImageData(L.rayData, 0, 0);
  }

  function frame() {
    const L = live; if (!L) return;
    if (!L.canvas.isConnected) { unmount(); return; }
    const t = L.still ? 0 : performance.now() / 1000, A = L.A, ctx = L.ctx, [x0, y0] = A.map.window;
    L.env = readWeights();
    const { w, wx } = L.env;
    ctx.clearRect(0, 0, L.canvas.width, L.canvas.height);
    drawWindow(L, t);
    ctx.drawImage(L.win, x0, y0);
    drawRays(L, t);
    if (L.raysOn) {
      ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(L.rayCanvas, 0, 0);
      const S = (w.day + w.dawn * 0.6 + w.dusk * 0.5) * (1 - wx.cloud) * (1 - wx.rain);
      ctx.fillStyle = '#fff3c8';
      A.motes.forEach((m, k) => {                         // polvo que flota dentro del haz
        const mx = Math.round(A.rays[m] + Math.sin(t * 0.4 + k) * 3), my = Math.round(A.rays[m + 1] - ((t * 1.5 + k * 5) % 14));
        ctx.globalAlpha = 0.55 * S; ctx.fillRect(mx, my, 1, 1);
      });
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    // llamas: la forma cambia y el halo respira; de noche (o nublado) el halo pesa más
    const lamps = 0.3 + 0.7 * Math.min(1, w.night + w.dusk * 0.6 + wx.cloud * 0.3), cols = A.map.ramps.flame;
    const lv = { h: 2, f: 3, w: 5, r: 1 };
    A.map.flames.forEach(([fx, fy, kind], i) => {
      const frames = kind === 'big' ? A.map.bigFlames : A.map.smallFlames;
      const rows = frames[L.still ? 0 : Math.floor(t * 4 + i * 1.3) % frames.length];
      rows.forEach((row, j) => { for (let k = 0; k < row.length; k += 1) { const ch = row[k]; if (lv[ch] === undefined) continue; ctx.fillStyle = cols[lv[ch]]; ctx.fillRect(fx + k, fy + j, 1, 1); } });
      const h = kind === 'big' ? A.halos.big : A.halos.small, cx = fx + (kind === 'big' ? 2 : 1), cy = fy + (kind === 'big' ? 3 : 1);
      const flick = L.still ? 0.5 : 0.5 + 0.3 * Math.sin(t * 7.3 + i * 2.1) + 0.2 * Math.sin(t * 12.1 + i);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = lamps * (0.22 + 0.18 * flick);
      ctx.drawImage(h, cx - (h.width >> 1), cy - (h.height >> 1));
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    });
    const dt = Math.min(0.25, Math.max(0, t - (L.lastT ?? t))); L.lastT = t;
    if (!L.still) drawExtras(L, t, dt);
    // el relámpago también se nota un poquito en la sala
    if (wx.storm && t < L.flashUntil) { ctx.globalAlpha = 0.08; ctx.fillStyle = '#d8e0ff'; ctx.fillRect(0, 0, L.canvas.width, L.canvas.height); ctx.globalAlpha = 1; }
  }

  // Lo que se mueve en toda la sala (no solo en la ventana): sombra de nubes, brillo de la hiedra, hojas y páginas que caen,
  // burbujas y vapor de la poción, polvo de luz y luciérnagas de noche.
  function drawExtras(L, t, dt) {
    const A = L.A, ctx = L.ctx, { w, wx } = L.env, low = document.body.dataset.nexoQuality === 'low';
    const fair = (w.day + w.dawn * 0.6 + w.dusk * 0.4) * (1 - wx.cloud) * (1 - wx.rain);
    if (fair > 0.05) {                                                         // sombra de nube sobre el piso
      ctx.globalAlpha = Math.min(1, fair * 1.2);
      for (let k = 0; k < 2; k += 1) {
        const span = 418 + 160, sx = ((k * 230 + t * (5 + k * 2)) % span + span) % span - 120;
        ctx.drawImage(A.shadow, Math.round(sx), 150 + k * 38);
      }
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'lighter';                                   // ola de luz que recorre la hiedra
    const lit = 0.25 + 0.75 * Math.min(1, w.day + w.dawn * 0.7 + w.dusk * 0.4 + 0.3);
    A.leafBands.forEach((band, i) => {
      const a = Math.max(0, Math.sin(t * 1.4 - i * 1.05)) ** 2 * 0.2 * lit;
      if (a > 0.01) { ctx.globalAlpha = a; ctx.drawImage(band, 0, 0); }
    });
    ctx.globalAlpha = 0.14 + 0.07 * Math.sin(t * 2.2); ctx.drawImage(A.halos.potion, 126, 57);   // la poción de la estantería brilla
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 5; i += 1) {                                            // burbujas que suben por el frasco
      const p = (t * 0.55 + i * 0.37) % 1, by = Math.round(70 - p * 12), bx = Math.round(135 + Math.sin(t * 2 + i * 2) * 1.6);
      ctx.globalAlpha = 1 - p * 0.7; ctx.fillStyle = i % 2 ? '#e0fcff' : '#9ce8f0'; ctx.fillRect(bx, by, 1, 1);
    }
    for (let i = 0; i < 3; i += 1) {                                            // vapor verde que sale del cuello
      const p = (t * 0.3 + i / 3) % 1, vy = Math.round(56 - p * 14), vx = Math.round(135 + Math.sin(t * 1.3 + i * 2.4) * 3 * p);
      ctx.globalAlpha = (1 - p) * 0.55; ctx.fillStyle = '#cfeedd'; ctx.fillRect(vx - 1, vy, 2, 1); ctx.fillRect(vx, vy - 1, 1, 1);
    }
    ctx.globalAlpha = 1;
    if (!low) {                                                                  // polvo de luz por toda la sala
      ctx.fillStyle = '#fff3c8';
      for (let i = 0; i < 26; i += 1) {
        const x = (i * 97 % 400) + 9 + Math.sin(t * 0.25 + i) * 6, y = 20 + (((i * 53) % 170 - t * (0.8 + (i % 5) * 0.25)) % 170 + 170) % 170;
        ctx.globalAlpha = (0.15 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 1.7))) * Math.max(fair, 0.25); ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    const night = (w.night + w.dusk * 0.5) * (1 - wx.rain);
    if (night > 0.1) {                                                           // luciérnagas
      ctx.globalCompositeOperation = 'lighter';
      A.flies.forEach(([bx, by, p, q]) => {
        const x = Math.round(bx + Math.sin(t * 0.32 + p) * 16 + Math.sin(t * 0.9 + q) * 4), y = Math.round(by + Math.sin(t * 0.47 + q) * 9),
          on = Math.max(0, Math.sin(t * 1.5 + p * 5)) ** 2 * night;
        if (on < 0.05) return;
        ctx.globalAlpha = on * 0.5; ctx.drawImage(A.halos.fly, x - 5, y - 5);
        ctx.globalAlpha = on; ctx.fillStyle = '#eaff9a'; ctx.fillRect(x, y, 1, 1);
      });
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    // hojas que se sueltan de la hiedra y páginas que se escapan de la estantería
    L.fall = L.fall || []; L.nextFall = L.nextFall ?? t + 2;
    if (t > L.nextFall && L.fall.length < (low ? 3 : 7)) {
      const page = Math.random() < 0.18, s = A.leafSpawn[Math.floor(Math.random() * A.leafSpawn.length)] || [200, 40];
      L.fall.push(page ? { page: true, x: 104 + Math.random() * 50, y: 33, vx: 3, vy: 5.5, ph: Math.random() * 6, born: t }
        : { page: false, x: s[0], y: s[1], vx: 0, vy: 6 + Math.random() * 4, ph: Math.random() * 6, born: t, dark: Math.random() < 0.4 });
      L.nextFall = t + 2.5 + Math.random() * 3.5;
    }
    L.fall = L.fall.filter(f => f.y < 205);
    for (const f of L.fall) {
      f.y += f.vy * dt; f.x += (f.vx + Math.sin(t * 2.2 + f.ph) * 9) * dt;
      const a = Math.min(1, (t - f.born) * 2, (205 - f.y) / 20), flap = Math.floor(t * 5 + f.ph) % 2, x = Math.round(f.x), y = Math.round(f.y);
      ctx.globalAlpha = Math.max(0, a);
      if (f.page) {
        ctx.fillStyle = '#e6d6b2'; ctx.fillRect(x, y, flap ? 4 : 3, flap ? 3 : 4);
        ctx.fillStyle = '#a69070'; ctx.fillRect(x, y + (flap ? 2 : 3), flap ? 4 : 3, 1);
      } else {
        ctx.fillStyle = f.dark ? '#3f6e2d' : '#83ad42'; ctx.fillRect(x, y, flap ? 3 : 2, flap ? 1 : 2);
        ctx.fillStyle = f.dark ? '#2a5228' : '#5d8c36'; ctx.fillRect(x + 1, y + 1, 2, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  function stillMode() {
    const b = document.body;
    return matchMedia('(prefers-reduced-motion: reduce)').matches || b.classList.contains('reduce-motion')
      || b.dataset.nexoAmbientMotion === 'reduced';
  }
  function schedule() {
    const L = live; if (!L) return;
    clearTimeout(L.timer);
    const paused = document.hidden || document.body.classList.contains('ambient-paused');
    L.still = stillMode();
    if (!paused) frame();
    // animado: ~10 cuadros/s; quieto o en pausa: revisa cada 30 s por si cambió la hora o el clima
    const fps = document.body.dataset.nexoQuality === 'low' ? FPS / 2 : FPS;        // calidad baja: más lento, pero vivo
    L.timer = setTimeout(schedule, paused || L.still ? 30000 : 1000 / fps);
  }

  async function mount(plane) {
    if (!plane || live?.plane === plane) return;
    unmount();
    let A;
    try { A = await loadAssets(); } catch (_) { return; }       // si falla, queda el fondo pintado (también correcto)
    if (!plane.isConnected) return;
    const [W, H] = A.map.size, c = canvas(W, H);
    c.className = 'refugio-vida'; c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none;z-index:2';
    plane.prepend(c);
    const win = canvas(A.ww, A.wh), rayCanvas = canvas(A.raysW, A.raysH), rayCtx = rayCanvas.getContext('2d');
    live = { plane, canvas: c, ctx: c.getContext('2d'), A, win, wctx: win.getContext('2d'), rayCanvas, rayCtx,
      rayData: rayCtx.createImageData(A.raysW, A.raysH), timer: null, nextFlash: 4, flashUntil: 0, still: false };
    schedule();
  }
  function unmount() {
    if (!live) return;
    clearTimeout(live.timer); live.canvas.remove(); live = null;
  }
  function check() {
    const plane = document.querySelector('.home-art-plane[data-scene-id="refugio-pixel"]');
    if (plane) mount(plane); else unmount();
  }
  function start() {
    const app = document.getElementById('app');
    if (app) new MutationObserver(check).observe(app, { childList: true });
    document.addEventListener('nexo:weather', () => live && schedule());
    document.addEventListener('visibilitychange', () => live && schedule());
    check();
  }
  window.NexoRefugioVida = Object.freeze({ mount, unmount, check });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
