/* Exporta las mascotas pixel (dist/mascot/pixelmascotas.js) a cuadros RGBA para el tráiler.
   Uso: node tools/trailer/mascotas.cjs <salida.json>   (lo llama trailer.py solo) */
const fs = require('fs');
const path = require('path');

global.window = {};
global.document = { createElement: () => ({ getContext: () => null }) };
eval(fs.readFileSync(path.join(__dirname, '../../dist/mascot/pixelmascotas.js'), 'utf8'));
const P = window.PixelMascotas;

const FPS = 30;
const POSES = { wave: 'feliz', dance: 'deslumbrada', up: 'amor' };
const out = { W: P.W, H: P.H, fps: FPS, frames: {} };

for (const kind of ['atomo', 'matraz', 'slime']) {
  for (const [arm, expr] of Object.entries(POSES)) {
    const frames = [];
    for (let i = 0; i < FPS * 2; i++) {
      const t = i / FPS;
      const st = { t, sx: 1, sy: 1 + .02 * Math.sin(t * 2), bodyTilt: 0, rootTilt: 0, hop: Math.abs(Math.sin(t * Math.PI * 2)) * 3,
        lift: kind === 'atomo' ? 2 + Math.sin(t * 2) * 1.5 : 0, slosh: 4 * Math.sin(t * 2), cork: 0, tag: 8 * Math.sin(t * 2), footL: 0, footR: 0,
        spin: 0, excite: 1, drip: 0, hat: 3 * Math.sin(t * 3), look: [0, 0], blink: false, expr, outfit: {}, arms: P.armPose(arm, t) };
      let img = null;
      const ctx = { createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }), putImageData: d => { img = d; } };
      P.render(ctx, kind, st);
      frames.push(Buffer.from(img.data).toString('base64'));
    }
    out.frames[`${kind}-${arm}`] = frames;
  }
}
fs.writeFileSync(process.argv[2], JSON.stringify(out));
