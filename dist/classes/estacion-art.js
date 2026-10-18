/* Arte de la estación de clase (versión C, "cristal-pantalla"): alcoba del Sótano en pixel art, dibujada en un canvas.
   NexoStationArt.draw(canvas, { mode: 'wide'|'tall' }) pinta pared, enredadera, antorchas, piso y el cristal gigante.
   La mascota NO va aquí: es la real del usuario (PixelMascotas) en su propio canvas. */
(() => {
  'use strict';
  const STONE = ['#231b22', '#3a2f33', '#564641', '#776152', '#9a8068', '#bea282'];
  const WOOD = ['#2c1916', '#47281b'];
  const FLAME = ['#a83818', '#dc6420', '#f89a30', '#ffc850', '#ffe890'];
  const CRYSTAL = ['#123448', '#18506a', '#1e7090', '#3098b8', '#5cc4dc', '#9ce8f0', '#e0fcff'];
  const LEAF = ['#1c3a23', '#2a5228', '#3f6e2d', '#5d8c36', '#83ad42', '#b2cf5c'];

  const rng = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const rect = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function glow(c, cx, cy, radius, color, alpha) {
    for (let r = radius; r > 0; r -= 3) { c.globalAlpha = alpha * (1 - r / radius); c.fillStyle = color; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); }
    c.globalAlpha = 1;
  }
  function wall(c, W, H, seed) {
    const r = rng(seed);
    for (let y = 0, row = 0; y < H; y += 9, row++) for (let x = row % 2 ? -9 : 0; x < W; x += 18) {
      const t = 1 + (r() * 2.4 | 0);
      rect(c, x, y, 17, 8, STONE[t]); rect(c, x, y, 17, 1, STONE[Math.min(5, t + 1)]);
      for (let k = 0; k < 6; k++) rect(c, x + r() * 16, y + r() * 8, 1, 1, STONE[Math.max(0, t - 1)]);
    }
    rect(c, 0, 0, W, H, 'rgba(10,18,24,.55)');
  }
  function vines(c, W, seed) {
    const r = rng(seed);
    for (let k = 0; k < Math.max(3, W / 36 | 0); k++) {
      const x = r() * W, len = 10 + r() * 22;
      for (let i = 0; i < len; i++) {
        const px = x + Math.sin(i / 3) * 1.5;
        rect(c, px, i, 1, 1, LEAF[1]);
        if (i % 4 === 1) rect(c, px + 1, i, 2, 2, LEAF[3 + (r() * 2 | 0)]);
      }
    }
  }
  function torch(c, x, y) {
    rect(c, x, y, 3, 10, WOOD[1]); rect(c, x - 2, y - 1, 7, 2, '#8a5c20');
    glow(c, x + 1, y - 5, 26, '#f89a30', .22);
    rect(c, x, y - 6, 3, 5, FLAME[1]); rect(c, x + 1, y - 8, 1, 4, FLAME[3]); rect(c, x + 1, y - 5, 1, 3, FLAME[4]);
  }
  function shard(c, x, y, h) {
    const w = Math.max(4, h / 3 | 0);
    for (let i = 0; i < h; i++) {
      const t = i / h, ww = w * (t < .25 ? t * 4 : 1 - (t - .25) * .4);
      rect(c, x - ww / 2, y - i, ww, 1, CRYSTAL[2 + (i % 5 < 2 ? 1 : 0)]);
    }
    rect(c, x - 1, y - h + 2, 1, h * .6, CRYSTAL[5]);
    glow(c, x, y - h / 2, h * .9, '#5cc4dc', .18);
  }
  function bigCrystal(c, cx, base, h, w) {
    for (let i = 0; i < h; i++) {
      const t = i / h, ww = Math.round(w * (t < .12 ? t / .12 * .8 + .2 : t > .85 ? (1 - t) / .15 : 1));
      rect(c, cx - ww / 2, base - i, ww, 1, CRYSTAL[1 + (i % 7 < 1 ? 1 : 0)]);
    }
    rect(c, cx - w / 2 + 1, base - h * .85, 2, h * .7, CRYSTAL[4]); rect(c, cx - w / 2 + 1, base - h * .85, 1, h * .6, CRYSTAL[6]);
    rect(c, cx + w / 2 - 3, base - h * .8, 2, h * .65, CRYSTAL[0]);
    for (let i = 0; i < 6; i++) shard(c, cx - w / 2 - 6 - i * 5, base + 2, 10 + (i * 5) % 13);
    for (let i = 0; i < 5; i++) shard(c, cx + w / 2 + 6 + i * 5, base + 2, 9 + (i * 7) % 12);
    glow(c, cx, base - h / 2, h, '#5cc4dc', .3);
  }
  function floor(c, W, H, y) {
    rect(c, 0, y, W, H - y, STONE[1]);
    for (let x = 0; x < W; x += 24) rect(c, x, y, 1, H - y, STONE[0]);
    rect(c, 0, y, W, 1, STONE[3]);
  }

  function draw(canvas, { mode = 'wide' } = {}) {
    const box = canvas.getBoundingClientRect(), W = mode === 'tall' ? 100 : 160;
    const H = Math.max(60, Math.round(W * (box.height || 1) / (box.width || 1)));
    canvas.width = W; canvas.height = H;
    const c = canvas.getContext('2d');
    c.imageSmoothingEnabled = false;
    rect(c, 0, 0, W, H, '#0c1e2c');
    wall(c, W, H, 21); vines(c, W, 8);
    const ground = Math.round(H * .84);
    floor(c, W, H, ground);
    torch(c, 6, 30); torch(c, W - 9, 30);
    bigCrystal(c, W * (mode === 'tall' ? .5 : .66), ground - 2, H * .62, W * (mode === 'tall' ? .42 : .3));
  }
  window.NexoStationArt = Object.freeze({ draw });
})();
