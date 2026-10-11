/* Torre del Sauce (etapa 10, docs/etapa-10-arte/SPEC.md): el sauce que crece dentro de la torre del ramo, en pixel art dibujado por código.
   Viene del boceto aprobado (docs/etapa-10-arte/boceto-torre-del-sauce.html). Uso:
     const t = NexoWillowTower.mount(canvas, { color, stone, others: [{ color, stone }], stage, states, roots });
     t.update({ stage, states })   ·   se detiene sola cuando el lienzo sale de la página.
     t.pick(x, y) → qué hay en ese punto del lienzo (256 × 192): { kind: 'strand', idx } · 'floor' (k) · 'roots' · 'pot' · 'crystal' · 'tower' (id).
     t.select(sel) / t.hover(sel) → lo ilumina con la magia del ramo (sel = lo que devolvió pick, o null).
   stage: 0 dormida · 1 semilla y raíces · 2–5 pisos · 6 techo roto (puede tener decimales: crece de a poco).
   states: un estado por concepto ('none', 'bud', 'green', 'yellow', 'dry', 'flower'); cada hilo del sauce toma uno. */
(() => {
'use strict';
function mount(cv, opts = {}) {
/* Versión 2: fondo con magia (aurora, islas flotantes, círculo rúnico), sauce grueso y con contorno,
   luz real: haces de sol que el sauce bloquea (sombras), caras iluminadas según de dónde viene la luz y resplandor (bloom). */
// El dibujo se diseña en 256 × 192; si la pantalla es más ancha, el cielo y el paisaje siguen hacia los lados (OX = margen a cada lado; negativo = se recorta).
const W = Math.max(140, Math.round((opts.width || 256) / 4) * 4), H = 192, OX = (W - 256) / 2; // en celular vertical, más angosto: solo la torre
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const img = ctx.createImageData(W, H), px = img.data, N = W * H;
const AR = new Float32Array(N), AG = new Float32Array(N), AB = new Float32Array(N); // color base
const LR = new Float32Array(N), LG = new Float32Array(N), LB = new Float32Array(N); // luz de faroles y farolitos
const OR = new Float32Array(N), OG = new Float32Array(N), OB = new Float32Array(N); // imagen final (antes del tramado)
const KIND = new Uint8Array(N);  // 0 cielo, 1 interior, 2 exterior, 3 emisivo
const NX = new Float32Array(N);  // hacia dónde mira la superficie (−1 izquierda, +1 derecha): sirve para iluminar un solo lado
const OCC = new Uint8Array(N);   // 1 hoja (deja pasar algo de luz), 2 tronco (bloquea)
const SH = new Float32Array(N);  // sombra en el suelo exterior
const BW = W / 2, BH = 96, BLA = new Float32Array(BW * BH * 3), BLB = new Float32Array(BW * BH * 3); // resplandor
const reducedNow = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('reduce-motion') || document.body.dataset.nexoAmbientMotion === 'reduced';
let reduced = reducedNow();

let subject = { color: opts.color || '#ffbd59', stone: opts.stone || [0.6, 0.53, 0.48] }, others = opts.others || [];
let target = opts.stage ?? 0, g = target, states = opts.states || [], roots = opts.roots ?? 1;
const t0 = performance.now();
let hour = hourNow();
// La hora es la del reloj de luz del Inicio (ambient/time.js), así la vista previa y el timelapse también mueven la torre.
function hourNow() { const v = Number(document.body.dataset.nexoHour); if (Number.isFinite(v) && document.body.dataset.nexoHour) return v; const d = new Date(); return d.getHours() + d.getMinutes() / 60; }

/* ── utilidades ── */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const hash = (a, b = 0) => { let h = Math.imul((a | 0) * 374761393 + (b | 0) * 668265263, 1274126177); h ^= h >>> 13; h = Math.imul(h, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - 0.5);
const shade = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
function put(x, y, c, kind, nx = 0) { x = Math.round(x) + OX; y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= H) return; const i = y * W + x; AR[i] = c[0]; AG[i] = c[1]; AB[i] = c[2]; KIND[i] = kind; NX[i] = nx; }
function blend(x, y, c, a) { x = Math.round(x) + OX; y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= H) return; const i = y * W + x; AR[i] = lerp(AR[i], c[0], a); AG[i] = lerp(AG[i], c[1], a); AB[i] = lerp(AB[i], c[2], a); }
function rect(x0, y0, x1, y1, c, kind, nx = 0) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(x, y, c, kind, nx); }
function disc(cx, cy, r, c, kind) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) put(cx + x, cy + y, c, kind); }
function addLight(cx, cy, r, col, I) {
  cx += OX;
  const x0 = Math.max(0, cx - r | 0), x1 = Math.min(W - 1, cx + r | 0), y0 = Math.max(0, cy - r | 0), y1 = Math.min(H - 1, cy + r | 0), r2 = r * r;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const d2 = (x - cx) ** 2 + (y - cy) ** 2; if (d2 > r2) continue; const i = y * W + x;
    const face = 1 + 0.75 * NX[i] * Math.sign(cx - x);     // la cara que mira al farol se ilumina más
    const f = I * (1 - d2 / r2) ** 2 * Math.max(0.15, face);
    LR[i] += col[0] * f; LG[i] += col[1] * f; LB[i] += col[2] * f;
  }
}

/* ── geometría ── */
const TL = 76, TR = 180, WALL = 7, IL = TL + WALL, IR = TR - WALL, GROUND = 177;
const FLOORS = [176, 146, 116, 86], ATTIC = 56, APEX = 12;
const floorTop = k => (k < 3 ? FLOORS[k + 1] : ATTIC);
const winY = k => [FLOORS[k] - 22, FLOORS[k] - 9];

/* ── cielo por hora ── */
const SKY = [
  [0, '#060818', '#141a42', [0.24, 0.27, 0.52]], [4.8, '#0a0d26', '#1f2356', [0.26, 0.28, 0.54]],
  [6.2, '#2b2c64', '#ee8d78', [0.78, 0.62, 0.64]], [7.6, '#4776c2', '#f8c898', [1.0, 0.88, 0.78]],
  [12, '#3c84d6', '#bfe4f6', [1.08, 1.05, 1.0]], [16.6, '#4878c4', '#f4d6a2', [1.02, 0.94, 0.82]],
  [18.4, '#3a2a66', '#f27c52', [0.9, 0.6, 0.56]], [19.8, '#121436', '#45346f', [0.38, 0.34, 0.6]],
  [24, '#060818', '#141a42', [0.24, 0.27, 0.52]]
];
function skyAt(h) {
  for (let i = 0; i < SKY.length - 1; i++) if (h >= SKY[i][0] && h <= SKY[i + 1][0]) {
    const t = (h - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0]), s = t * t * (3 - 2 * t);
    return { top: mix(hex(SKY[i][1]), hex(SKY[i + 1][1]), s), bot: mix(hex(SKY[i][2]), hex(SKY[i + 1][2]), s), amb: mix(SKY[i][3], SKY[i + 1][3], s) };
  }
  return { top: hex(SKY[0][1]), bot: hex(SKY[0][2]), amb: SKY[0][3] };
}
function sunInfo(h) {
  const sp = (h - 6) / 12, alt = Math.sin(clamp(sp, 0, 1) * Math.PI);
  const day = clamp(alt * 2.2), warm = clamp(Math.exp(-((h - 7) ** 2) / 1.4) + Math.exp(-((h - 18) ** 2) / 1.4));
  return { sp, alt, day, warm, night: clamp(1 - day * 1.6), fromLeft: sp < 0.5,
    sx: lerp(-10 - OX, W - OX + 10, sp), sy: 118 - alt * 100, col: mix([1, 0.97, 0.88], [1, 0.6, 0.34], warm) };
}

/* ── fondo con magia ── */
function drawSky(sky, sun, time) {
  const acc = hex(subject.color), night = sun.night;
  for (let y = 0; y < H; y++) { const c = mix(sky.top, sky.bot, clamp(y / 150)); for (let x = -OX; x < W - OX; x++) put(x, y, c, 0); }
  // Nebulosa y aurora (de noche, con el color del ramo)
  if (night > 0.02) for (let x = -OX; x < W - OX; x++) {
    const cy = 36 + Math.sin(x * 0.028 + time * 0.15) * 10 + Math.sin(x * 0.07 - time * 0.1) * 4;
    const wave = 0.55 + 0.45 * Math.sin(x * 0.09 + time * 0.6);
    for (let y = 4; y < 80; y++) {
      const d = (y - cy) / (y < cy ? 18 : 7), a = Math.exp(-d * d) * wave * night * 0.45;
      if (a > 0.01) blend(x, y, mix(acc, [0.35, 1, 0.8], clamp(0.5 + d * 0.3)), a);
      const n = hash(x >> 3, y >> 3) * 0.5 + hash(x >> 4, y >> 4) * 0.5;
      if (n > 0.72) blend(x, y, [0.45, 0.25, 0.6], (n - 0.72) * night * 0.6);
    }
  }
  // Estrellas: las grandes con cruz que titila
  for (let k = 0; k < 110; k++) {
    const x = hash(k, 1) * W - OX, y = hash(k, 2) * 120, big = hash(k, 3) > 0.9, tw = 0.55 + 0.45 * Math.sin(time * (1.5 + hash(k, 4) * 2) + k);
    if (night < 0.25) continue; const c = mix(sky.top, [1, 0.97, 0.9], (night - 0.25) / 0.75 * tw);
    put(x, y, c, 0); if (big && tw > 0.7) { put(x + 1, y, shade(c, 0.6), 0); put(x - 1, y, shade(c, 0.6), 0); put(x, y + 1, shade(c, 0.6), 0); put(x, y - 1, shade(c, 0.6), 0); }
  }
  // Rayos del sol en el cielo
  if (sun.day > 0.05 && sun.sp > -0.05 && sun.sp < 1.05) {
    for (let y = 0; y < 150; y++) for (let x = -OX; x < W - OX; x++) {
      const dx = x - sun.sx, dy = y - sun.sy, d = Math.hypot(dx, dy), an = Math.atan2(dy, dx);
      const ray = Math.max(0, Math.sin(an * 9 + time * 0.1)) ** 6, a = (Math.exp(-d / 40) * 0.5 + ray * Math.exp(-d / 90) * 0.18) * sun.day;
      if (a > 0.01) blend(x, y, sun.col, a);
    }
    disc(sun.sx, sun.sy, 7, mix(sun.col, [1, 1, 0.95], 0.5), 3); disc(sun.sx, sun.sy, 5, [1, 1, 0.94], 3);
  }
  const mp = ((hour + 12) % 24 - 6) / 12, mx = lerp(-10 - OX, W - OX + 10, mp), my = 118 - Math.sin(clamp(mp, 0, 1) * Math.PI) * 95;
  if (mp > -0.05 && mp < 1.05) { for (let y = -14; y <= 14; y++) for (let x = -14; x <= 14; x++) { const d = Math.hypot(x, y); if (d < 14) blend(mx + x, my + y, [0.75, 0.8, 1], (1 - d / 14) ** 2 * 0.35 * night); }
    disc(mx, my, 5, [0.93, 0.94, 1], 3); disc(mx + 2, my - 1, 4, mix(sky.top, sky.bot, clamp(my / 150)), 0); }
  // Nubes con borde iluminado
  for (let k = 0; k < 4; k++) { const cx = ((hash(k, 7) * W + time * (1.5 + k)) % (W + 60)) - 30 - OX, cy = 20 + k * 14;
    for (let j = 0; j < 26; j++) { const dx = j - 13, hgt = 4 - Math.abs(dx) / 4.5; for (let yy = 0; yy < hgt; yy++)
      put(cx + dx, cy - yy, mix(sky.bot, yy > hgt - 2 ? [1, 0.95, 0.9] : [0.85, 0.85, 0.95], yy > hgt - 2 ? 0.55 : 0.3), 2, dx > 0 ? 0.5 : -0.5); } }
}

function island(cx, cy, w, time, seed) {
  const bob = reduced ? 0 : Math.round(Math.sin(time * 0.6 + seed) * 1.5), acc = hex(subject.color);
  for (let x = -w; x <= w; x++) { const depth = Math.round((1 - (x / w) ** 2) * w * 0.9 + hash(x, seed) * 2);
    for (let y = 0; y < depth; y++) put(cx + x, cy + bob + y, shade([0.36, 0.3, 0.32], 0.85 + hash(x >> 1, y + seed) * 0.2 - y / depth * 0.3), 2, x / w);
    put(cx + x, cy + bob - 1, [0.3, 0.55, 0.3], 2, x / w); }
  // cristal flotante y su luz
  for (let y = 0; y < 5; y++) for (let x = -1; x <= 1; x++) if (Math.abs(x) <= (y < 2 ? y : 4 - y + 0)) put(cx + 2 + x, cy + bob - 6 + y, mix(acc, [1, 1, 1], y === 1 ? 0.5 : 0), 3);
  for (let y = 0; y < 6; y++) put(cx - 3, cy + bob - 2 - y, [0.3, 0.22, 0.16], 2); disc(cx - 3, cy + bob - 9, 3, [0.25, 0.5, 0.3], 2);
  // gotas de agua mágica cayendo
  for (let j = 0; j < 8; j++) { const yy = (time * 10 + j * 5) % 26; blend(cx - w + 2, cy + bob + w * 0.4 + yy, mix([0.6, 0.85, 1], acc, 0.3), 0.6 * (1 - yy / 26)); }
  return [cx + 2, cy + bob - 4];
}

function drawLandscape(sun, time) {
  const acc = hex(subject.color), side = sun.fromLeft ? -1 : 1;
  // montañas lejanas con nieve, iluminadas del lado del sol
  for (let x = -OX; x < W - OX; x++) {
    const m = 122 + Math.sin(x * 0.035) * 12 + Math.sin(x * 0.11 + 1) * 5, slope = Math.cos(x * 0.035) * 0.42 + Math.cos(x * 0.11 + 1) * 0.55;
    for (let y = m | 0; y < GROUND; y++) { const snow = y < m + 4 && m < 120; put(x, y, snow ? [0.82, 0.86, 0.95] : [0.27, 0.3, 0.46], 2, -slope * 0.8); }
    const m2 = 140 + Math.sin(x * 0.05 + 3) * 8 + Math.sin(x * 0.17) * 3, s2 = Math.cos(x * 0.05 + 3) * 0.4;
    for (let y = m2 | 0; y < GROUND; y++) put(x, y, [0.22, 0.3, 0.36], 2, -s2);
    const hill = 160 + Math.sin(x * 0.05 + 2) * 6;
    for (let y = hill | 0; y < GROUND; y++) put(x, y, shade([0.22, 0.38, 0.27], 0.9 + hash(x >> 2, y >> 2) * 0.15), 2, -Math.cos(x * 0.05 + 2) * 0.3);
  }
  // pinos en la loma
  for (let k = 0; k < 18; k++) { const x = (hash(k, 60) * W | 0) - OX; if (x > TL - 10 && x < TR + 10) continue; const base = 160 + Math.sin(x * 0.05 + 2) * 6 + 2, hgt = 8 + hash(k, 61) * 7;
    for (let y = 0; y < hgt; y++) { const half = Math.floor((y / hgt) * 3.5); for (let dx = -half; dx <= half; dx++) put(x + dx, base - hgt + y, shade([0.12, 0.26, 0.2], 1 - y / hgt * 0.2), 2, dx / 3); } }
  // niebla baja
  for (let y = 150; y < GROUND; y++) for (let x = -OX; x < W - OX; x++) { const a = Math.exp(-(((y - 163) / 7) ** 2)) * (0.18 + 0.1 * Math.sin(x * 0.04 + time * 0.3)); blend(x, y, mix([0.8, 0.85, 1], acc, 0.15), a); }
  // islas flotantes con cristales
  islandsLights.length = 0;
  islandsLights.push(island(36, 74, 12, time, 1), island(222, 62, 9, time, 2));
  // las otras tres torres, más detalladas
  const pos = [[22, 156], [208, 152], [240, 160]];
  otherBeacons.length = 0;
  others.slice(0, 3).forEach((s, i) => { const [x, y] = pos[i], st = shade(s.stone, 0.75), c = hex(s.color);
    for (let yy = y - 30; yy < y; yy++) for (let dx = -4; dx <= 4; dx++) put(x + dx, yy, shade(st, (dx * side > 0 ? 1.1 : 0.75) * (yy % 4 ? 1 : 0.85)), 2, dx / 4);
    for (let k = 0; k < 9; k++) for (let dx = -6 + k * 0.7; dx <= 6 - k * 0.7; dx++) put(x + dx, y - 31 - k, shade([0.35, 0.24, 0.32], dx * side > 0 ? 1.1 : 0.7), 2);
    put(x, y - 21, c, 3); put(x, y - 20, c, 3); put(x - 2, y - 12, mix(c, [1, 0.8, 0.5], 0.5), 3); put(x, y - 41, c, 3);
    otherBeacons.push([x, y - 41, c]); });
  // suelo, pasto y flores
  for (let x = -OX; x < W - OX; x++) for (let y = GROUND; y < H; y++) { const top = y < GROUND + 2; put(x, y, top ? [0.3, 0.52, 0.29] : [0.28, 0.2, 0.16].map(v => v * (0.85 + hash(x, y) * 0.25)), 2); }
  for (let x = -OX; x < W - OX; x++) { const r = hash(x, 99); if (r > 0.55) put(x, GROUND - 1, [0.34, 0.6, 0.3], 2); if (r > 0.85) put(x, GROUND - 2, [0.38, 0.66, 0.32], 2);
    if (r > 0.97 && (x < TL - 4 || x > TR + 4)) put(x, GROUND - 2, hash(x, 7) > 0.5 ? [0.95, 0.8, 0.9] : [0.9, 0.9, 0.5], 2); }
  // hongos que brillan de noche
  mushrooms.length = 0;
  for (const x of [58, 66, 196, 205, 230]) { put(x, GROUND - 1, [0.85, 0.8, 0.7], 2); put(x - 1, GROUND - 2, acc, sun.night > 0.3 ? 3 : 2); put(x, GROUND - 2, acc, sun.night > 0.3 ? 3 : 2); put(x + 1, GROUND - 2, acc, sun.night > 0.3 ? 3 : 2); mushrooms.push(x); }
}
const islandsLights = [], otherBeacons = [], mushrooms = [];

/* ── la torre ── */
function drawTower(stage, crack, sun, time) {
  const stone = subject.stone, acc = hex(subject.color), side = sun.fromLeft ? -1 : 1;
  // muro interior: ladrillos con variación, borde iluminado y musgo
  for (let y = ATTIC; y < GROUND; y++) for (let x = IL; x < IR; x++) {
    const row = Math.floor((y - ATTIC) / 5), off = row % 2 ? 4 : 0, bx = Math.floor((x - IL + off) / 9), ly = (y - ATTIC) % 5, lx = (x - IL + off) % 9;
    const mortar = ly === 0 || lx === 0, tone = 0.86 + hash(bx, row) * 0.2;
    let c = shade(stone, mortar ? 0.4 : (ly === 1 ? 0.72 : 0.62) * tone);
    if (!mortar && hash(bx * 7, row * 3) > 0.92 && ly > 2) c = mix(c, [0.3, 0.45, 0.28], 0.5);
    put(x, y, c, 1);
  }
  // muros laterales (corte) con ventanas en arco
  for (const [x0, x1, nx] of [[TL, IL, -1], [IR, TR, 1]]) for (let y = ATTIC - 2; y < GROUND; y++) for (let x = x0; x < x1; x++) {
    const n = 0.9 + hash(x, y >> 2) * 0.15, edge = x === x0 || x === x1 - 1;
    put(x, y, shade(stone, ((y >> 2) % 2 ? 0.95 : 0.85) * n * (edge ? 0.8 : 1)), 2, nx);
  }
  for (let k = 0; k < 4; k++) { const [a, b] = winY(k); for (const x0 of [TL, IR]) for (let y = a; y < b; y++) for (let x = x0 + 1; x < x0 + WALL - 1; x++) {
    if (y - a < 2 && (x === x0 + 1 || x === x0 + WALL - 2)) continue; const i = y * W + x + OX, sky = skyAt(hour), c = mix(sky.top, sky.bot, clamp(y / 150));
    AR[i] = c[0]; AG[i] = c[1]; AB[i] = c[2]; KIND[i] = 0; } }
  // runas talladas en los muros: brillan con la magia del ramo
  for (let k = 0; k < 4; k++) for (const x of [TL + 3, TR - 4]) { const y = FLOORS[k] - 5, glow = 0.5 + 0.5 * Math.sin(time * 1.5 + k + x);
    for (let j = 0; j < 3; j++) put(x, y - j, mix(shade(stone, 0.5), acc, 0.4 + 0.6 * glow * sun.night), sun.night > 0.3 ? 3 : 2); put(x - 1, y - 1, mix(shade(stone, 0.5), acc, 0.5 * glow), 2); }
  // ventanas redondas al fondo
  for (const k of [1, 3]) { const cy = FLOORS[k] - 17, cx = 128 + (k === 1 ? -30 : 30);
    for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) { const d = x * x + y * y; if (d <= 16) { const sky = skyAt(hour); put(cx + x, cy + y, mix(sky.top, sky.bot, clamp((cy + y) / 150)), 0); } else if (d <= 30) put(cx + x, cy + y, shade(stone, 0.35), 1); }
    for (let y = -4; y <= 4; y++) put(cx, cy + y, shade(stone, 0.3), 1); for (let x = -4; x <= 4; x++) put(cx + x, cy, shade(stone, 0.3), 1); }
  // pisos de madera
  const wood = [0.5, 0.33, 0.2];
  for (const fy of [...FLOORS.slice(1), ATTIC]) for (let y = fy - 3; y < fy; y++) for (let x = IL; x < IR; x++) {
    if (x > 119 && x < 137 && stage >= 1 && fy !== ATTIC) continue; if (x > 119 && x < 137 && fy === ATTIC && crack > 0) continue;
    put(x, y, shade(wood, (y === fy - 3 ? 1.15 : 0.75) * (x % 11 === 0 ? 0.7 : 1) * (0.9 + hash(x >> 3, y) * 0.15)), 1); }
  for (let y = GROUND; y < H; y++) for (let x = IL; x < IR; x++) put(x, y, [0.22, 0.16, 0.13].map(v => v * (0.85 + hash(x, y) * 0.25)), 1);
  for (let x = IL; x < IR; x++) { put(x, GROUND - 1, shade(wood, 1), 1); put(x, GROUND, shade(wood, 0.55), 1); }
  // techo de tejas, con aguja y cristal del ramo
  const roof = [0.38, 0.25, 0.34];
  for (let y = APEX; y < ATTIC; y++) { const half = (y - APEX) / (ATTIC - APEX) * 58; for (let x = Math.ceil(128 - half); x < 128 + half; x++) {
    const broken = crack > 0 && y < ATTIC - 6 && Math.abs(x - 128) < crack * (18 + (hash(x, y >> 2) - 0.5) * 8) * (1 - (y - APEX) / 60 * 0.4);
    if (broken) continue; const tile = ((y - APEX) % 4 === 0) || ((x + ((y >> 2) % 2) * 3) % 6 === 0), lit = (x - 128) * side > 0 ? 1.08 : 0.85;
    put(x, y, shade(roof, (tile ? 0.6 : 0.92 + hash(x >> 1, y >> 2) * 0.1) * lit), 2, (x - 128) / 58); } }
  for (let x = TL - 6; x < TR + 6; x++) { put(x, ATTIC, shade(roof, 0.55), 2); put(x, ATTIC + 1, shade(roof, 0.38), 2); }
  if (crack > 0) for (let k = 0; k < 12; k++) put(128 + (hash(k, 5) - 0.5) * 64 * crack, ATTIC - 2 - hash(k, 6) * 6, shade(roof, 0.7), 2);
  // aguja y cristal (cuando el sauce sale, el cristal flota sobre la copa)
  const cy = crack > 0 ? lerp(APEX - 4, 4, crack) : APEX - 4, bob = reduced ? 0 : Math.sin(time * 1.2) * 1.2;
  if (crack < 0.5) for (let y = APEX - 4; y < APEX + 2; y++) put(128, y, [0.5, 0.42, 0.3], 2);
  for (let y = 0; y < 7; y++) for (let x = -2; x <= 2; x++) if (Math.abs(x) <= (y < 3 ? y : 6 - y) * 0.7) put(128 + x, cy - 6 + y + bob, mix(acc, [1, 1, 1], y === 2 && x <= 0 ? 0.6 : 0.05), 3);
  beacon[0] = 128; beacon[1] = cy - 3 + bob;
}
const beacon = [128, 8];

/* ── muebles de cada piso ── */
function drawProps(k, lit, time) {
  const fy = FLOORS[k] - 3, col = c => hex(c), acc = hex(subject.color);
  if (k === 0) {
    for (let y = 0; y < 8; y++) for (let x = -7 + (y > 5 ? 1 : 0); x <= 7 - (y > 5 ? 1 : 0); x++) put(157 + x, fy - 8 + y, shade(col('#2e2a38'), x < 0 ? 1.1 : 0.75), 1, x / 7);
    rect(149, fy - 9, 166, fy - 7, col('#454052'), 1); rect(151, fy - 9, 164, fy - 8, mix(acc, [1, 1, 1], 0.2), 3);
    if (lit) for (let j = 0; j < 8; j++) { const yy = fy - 11 - ((time * 7 + j * 3) % 18), xx = 157 + Math.sin(time * 2 + j) * 2.5; blend(xx, yy, mix([0.85, 0.85, 0.9], acc, 0.4), 0.7 * (1 - ((time * 7 + j * 3) % 18) / 18)); }
    [['#7a3b3b', 6], ['#3b5a7a', 7], ['#6b6a3b', 5], ['#4b3b6a', 7]].forEach(([c, hgt], i) => { rect(89 + i * 3, fy - hgt, 91 + i * 3, fy, col(c), 1, -0.3); put(89 + i * 3, fy - hgt, shade(col(c), 1.4), 1); });
  }
  if (k === 1) {
    rect(88, fy - 22, 105, fy, col('#4a3020'), 1, -0.5);
    for (let s = 0; s < 3; s++) for (let b = 0; b < 6; b++) rect(89 + b * 2.6, fy - 21 + s * 7, 91 + b * 2.6, fy - 16 + s * 7 - (b % 3 === 2 ? 1 : 0), col(['#8a3b3b', '#3b6a8a', '#7a7a3b', '#5b3b7a'][(b + s) % 4]), 1, -0.4);
    for (let a = 0; a < 32; a++) { const an = a / 32 * Math.PI * 2; put(160 + Math.cos(an) * 6, fy - 12 + Math.sin(an) * 6, col('#d4a656'), 1, Math.cos(an)); }
    for (let a = 0; a < 24; a++) { const an = a / 24 * Math.PI * 2 + time * 0.4; put(160 + Math.cos(an) * 4 * Math.cos(time * 0.4), fy - 12 + Math.sin(an) * 6, col('#a07a3a'), 1, Math.cos(an)); }
    put(160, fy - 12, acc, 3); rect(159, fy - 6, 161, fy, col('#6a5030'), 1);
  }
  if (k === 2) {
    rect(87, fy - 8, 109, fy - 6, col('#5a3a24'), 1); rect(88, fy - 6, 90, fy, col('#4a3020'), 1); rect(106, fy - 6, 108, fy, col('#4a3020'), 1);
    rect(96, fy - 12, 98, fy - 8, col('#e8e0c8'), 1, -0.5); put(97, fy - 13, [1, 0.85, 0.45], 3); put(97, fy - 14, [1, 0.6, 0.25], 3);
    rect(100, fy - 10, 106, fy - 8, col('#d8cfb4'), 1); put(103, fy - 10, col('#6a4a8a'), 1);
    for (let b = 0; b < 3; b++) { const yy = fy - 18 - b * 5 + (reduced ? 0 : Math.sin(time * 1.5 + b * 2) * 1.5); rect(150 + b * 6, yy, 156 + b * 6, yy + 3, col(['#6a3b5a', '#3b6a5a', '#7a5a3b'][b]), 1, 0.3); rect(150 + b * 6, yy, 156 + b * 6, yy + 1, col('#e8e0c8'), 1); }
  }
  if (k === 3) {
    rect(88, fy - 21, 105, fy - 8, col('#1e1c46'), 1);
    for (let s = 0; s < 9; s++) put(90 + hash(s, 1) * 13, fy - 19 + hash(s, 2) * 9, [1, 0.95, 0.7], lit ? 3 : 1);
    for (let c = 0; c < 5; c++) { const x = 152 + c * 4, hgt = 4 + (c % 2) * 4; for (let y = 0; y < hgt; y++) for (let dx = 0; dx <= (y < hgt - 2 ? 1 : 0); dx++) put(x + dx, fy - y, mix(acc, [1, 1, 1], dx ? 0.35 : 0).map(v => v * (0.55 + y / hgt * 0.45)), lit ? 3 : 1); }
  }
}

/* ── el sauce (versión 4) ──
   Como un sauce de verdad: tronco nudoso, ramas que se arquean, una copa de follaje con volumen (luz arriba, sombra abajo)
   y desde ella caen hilos finos de hojitas que se mecen. Atrás los hilos son más oscuros; adelante, más claros: da profundidad. */
const LEAF = { dark: [0.09, 0.24, 0.19], mid: [0.19, 0.43, 0.29], light: [0.4, 0.67, 0.35], hi: [0.72, 0.9, 0.5] };
const TINT = { none: [0.78, 0.93, 0.55], bud: [0.78, 0.93, 0.55], yellow: [0.96, 0.8, 0.32], dry: [0.62, 0.44, 0.26] };
// Cada hilo toma el estado de un concepto (siempre el mismo para el mismo hilo). Sin datos, todo es brote.
function strandState(seed) {
  if (!states.length) return 'bud';
  return states[Math.floor(hash(seed, 11) * states.length)] || 'bud';
}
const lanterns = [], leafSpots = [], hitStrands = [], extraLights = [];
let selected = null, hovered = null;
function leafTone(tone, state, depth) {
  let c = LEAF[tone];
  if (TINT[state]) c = mix(c, shade(TINT[state], tone === 'dark' ? 0.55 : tone === 'mid' ? 0.75 : 1), 0.65);
  return shade(c, depth);
}
// Un mechón de follaje: círculo irregular, con 4 tonos según de dónde le llega la luz (arriba claro, abajo oscuro).
function clump(cx, cy, r, seed, kind, depth, state = 'green') {
  for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) {
    const d = Math.hypot(dx, dy * 1.25) + (hash(seed * 31 + dx, dy + 40) - 0.5) * 1.8;
    if (d > r) continue;
    const x = Math.round(cx + dx), y = Math.round(cy + dy); if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const v = 0.55 - dy / r * 0.45 - dx / r * 0.08 + (hash(x, y * 3 + seed) - 0.5) * 0.35 + BAYER[(y & 3) * 4 + (x & 3)] * 0.18;
    const tone = d > r - 1.1 && dy > 0 ? 'dark' : v > 0.82 ? 'hi' : v > 0.55 ? 'light' : v > 0.3 ? 'mid' : 'dark';
    put(x, y, leafTone(tone, state, depth), kind, clamp(dx / r * 1.2, -1, 1)); OCC[y * W + x + OX] = 1;
    if (tone === 'hi' && hash(x * 7, y + seed) > 0.8) leafSpots.push([x, y, seed + x]);
  }
}
// Un hilo de sauce: 1 pixel de ancho, con hojitas alternadas a cada lado y la punta más clara.
function strand(x0, y0, len, seed, state, kind, depth, time, maxY) {
  let last = null;
  const idx = states.length ? Math.floor(hash(seed, 11) * states.length) : -1, pts = [];
  if (state === 'none') { len *= 0.35; state = 'bud'; depth *= 0.8; }
  for (let j = 0; j < len; j++) {
    const y = y0 + j; if (y >= maxY) break;
    const sway = reduced ? 0 : Math.sin(time * 1.1 + seed * 0.9 + j * 0.07) * (j / 14) * 1.5 + Math.sin(time * 2.3 + seed) * (j / 30) * 0.5;
    const x = x0 + sway, tipT = j / len;
    if (hash(seed, j) > 0.94) continue; // pequeños huecos: se ve liviano
    const tone = tipT > 0.78 ? 'hi' : tipT > 0.45 ? 'light' : 'mid';
    put(x, y, leafTone(tone, state, depth), kind, 0.3); OCC[Math.round(y) * W + Math.round(x) + OX] = 1;
    if (j % 4 === 1) put(x - 1, y, leafTone(tipT > 0.6 ? 'hi' : 'light', state, depth), kind, -0.8);
    if (j % 4 === 3) put(x + 1, y, leafTone(tipT > 0.6 ? 'light' : 'mid', state, depth * 0.9), kind, 0.8);
    last = [x, y]; pts.push(last);
  }
  if (idx >= 0 && pts.length) hitStrands.push({ idx, pts });
  return last;
}
// Una rama de madera que sale del tronco, sube un poco y se arquea hacia afuera. Devuelve puntos a lo largo de ella.
function bough(x0, y0, x1, y1, lift, thick, kind) {
  const pts = [];
  for (let j = 0; j <= 24; j++) { const t = j / 24, x = lerp(x0, x1, t), y = lerp(y0, y1, t) - Math.sin(t * Math.PI) * lift;
    const w = thick * (1 - t * 0.7);
    for (let k = 0; k < w; k++) { put(x, y + k, shade([0.4, 0.27, 0.17], k === 0 ? 1.1 : 0.72), kind, (x1 - x0) > 0 ? 0.6 : -0.6); OCC[Math.round(y + k) * W + Math.round(x) + OX] = 2; }
    put(x, y + Math.ceil(w), [0.14, 0.09, 0.06], kind); pts.push([x, y]); }
  return pts;
}
// La copa de un piso: dos ramas, mechones sobre ellas y una cortina de hilos.
function crown(cx, cy, growth, maxY, seedBase, time, stage, kind, spread) {
  const reach = (12 + spread) * growth, n = Math.round(10 + 8 * growth);
  // hilos de atrás (más oscuros)
  for (let s = 0; s < n; s++) { const u = s / (n - 1) * 2 - 1, seed = seedBase * 100 + s, x = cx + u * reach * 1.05, y = cy - (1 - u * u) * 4 * growth + 3;
    strand(x, y, (3 + hash(seed, 5) ** 1.5 * 24) * growth * (1 - Math.abs(u) * 0.35), seed, strandState(seed, stage), kind, 0.68, time, maxY); }
  const L = bough(cx, cy + 4, cx - reach, cy + 1, 5 * growth, 2.4, kind), R = bough(cx, cy + 4, cx + reach, cy + 1, 5 * growth, 2.4, kind);
  // mechones a lo largo de las ramas y sobre el tronco
  const clumps = [];
  for (const pts of [L, R]) for (const t of [0.35, 0.62, 0.88]) { const [x, y] = pts[Math.round(t * 24)]; clumps.push([x, y - 2, (2.5 + 2.8 * growth) * (1.1 - t * 0.3)]); }
  clumps.push([cx, cy - 1 - 2 * growth, 3 + 3 * growth]);
  clumps.forEach(([x, y, r], i) => clump(x, y, r, seedBase * 10 + i, kind, 0.92));
  // hilos de adelante (más claros), que nacen bajo los mechones
  clumps.forEach(([x, y, r], i) => { for (let s = 0; s < 3; s++) { const seed = seedBase * 1000 + i * 10 + s, state = strandState(seed, stage);
    const tip = strand(x + (s - 1) * r * 0.6, y + r * 0.6, (6 + hash(seed, 4) * 20) * growth, seed, state, kind, 1.05, time, maxY);
    if (tip && state === 'flower' && growth > 0.6) lanterns.push([tip[0], tip[1] + 1, seed]); } });
}
// Rama lateral de un piso que el sauce ya pasó: alterna de lado, con 2 mechones y una cortina corta y despareja.
function twig(k, time, stage) {
  const side = k % 2 ? 1 : -1, y0 = floorTop(k) + 13, off = Math.sin(y0 * 0.045) * 2 + Math.sin(y0 * 0.13) * 0.7, x0 = 128 + off;
  const pts = bough(x0, y0 + 2, x0 + side * 22, y0 - 1, 5, 2.2, 1);
  const sm = bough(x0, y0 + 9, x0 - side * 11, y0 + 6, 3, 1.4, 1);
  const cl = [[...pts[14], 3.6], [...pts[24], 4.4], [...sm[24], 2.8]];
  cl.forEach(([x, y, r], i) => { for (let s = 0; s < 4; s++) { const seed = 5000 + k * 50 + i * 10 + s, st = strandState(seed, stage);
    const tip = strand(x + (s - 1.5) * r * 0.5, y + r * 0.4, 5 + hash(seed, 4) ** 1.3 * 17, seed, st, 1, s % 2 ? 1.05 : 0.75, time, FLOORS[k] - 4);
    if (tip && st === 'flower') lanterns.push([tip[0], tip[1] + 1, seed]); } });
  cl.forEach(([x, y, r], i) => clump(x, y - 1, r, 300 + k * 10 + i, 1, 0.95));
}
// Copa joven en la punta del tronco: la misma forma que la copa final, más chica; crece con cada etapa.
function youngCrown(top, k, gv, time, stage) {
  const s = clamp(0.35 + (gv - 1.5) * 0.16, 0.35, 0.95), ceil = floorTop(k) + 2, maxY = FLOORS[k] - 4, cx = 128 + Math.sin(top * 0.045) * 2;
  const cy = Math.max(top + 4, ceil + 9 * s);
  const ring = [[-26, 5, 6], [26, 5, 6], [-17, 1, 7.5], [17, 1, 7.5], [-8, -3, 8], [8, -3, 8], [0, -5, 8], [0, 2, 7]];
  const n = Math.round(14 + 18 * s);
  for (let i = 0; i < n; i++) { const u = i / (n - 1) * 2 - 1, seed = 7000 + i, st = strandState(seed, stage), front = i % 2 === 0;
    const tip = strand(cx + u * 30 * s, cy + 3 + Math.abs(u) * 3 * s, (12 + hash(seed, 2) ** 1.2 * 24) * (0.55 + s * 0.55) * (1 - Math.abs(u) * 0.25), seed, st, 1, front ? 1.05 : 0.72, time, maxY);
    if (tip && st === 'flower') lanterns.push([tip[0], tip[1] + 1, seed]); }
  bough(cx, cy + 4, cx - 24 * s, cy + 3, 4 * s, 2.2, 1); bough(cx, cy + 4, cx + 24 * s, cy + 3, 4 * s, 2.2, 1);
  ring.forEach(([dx, dy, r], i) => { const rr = r * s, yy = Math.max(cy + dy * s, ceil + rr); clump(cx + dx * s, yy, rr, 600 + i, 1, 1); });
}
function treeTop(gv) { return gv <= 5 ? 166 - clamp(gv - 1.5, 0, 3.5) * 29.5 : lerp(62.75, 20, clamp(gv - 5)); }
function drawTree(gv, time, stage, sun) {
  lanterns.length = 0; leafSpots.length = 0; hitStrands.length = 0;
  const acc = hex(subject.color);
  for (let y = 168; y < 176; y++) for (let x = 121 + (y - 168) * 0.25; x < 135 - (y - 168) * 0.25; x++) put(x, y, shade([0.62, 0.36, 0.24], x < 126 ? 0.8 : 1.05), 1, (x - 128) / 7);
  rect(119, 166, 137, 168, [0.7, 0.42, 0.28], 1); rect(121, 166, 135, 167, [0.22, 0.15, 0.1], 1);
  for (let x = 121; x < 135; x += 3) put(x + 1, 170, mix([0.62, 0.36, 0.24], acc, 0.5), gv >= 0.6 ? 3 : 1); // runas de la maceta
  if (gv < 0.6) return;
  const rootG = clamp(gv - 0.6);
  for (let r = 0; r < Math.round(4 + 7 * clamp(roots)); r++) { const dir = (hash(r, 21) - 0.5) * 2.6, len = (14 + hash(r, 22) * 32) * rootG;
    for (let j = 0; j < len; j++) { const x = 128 + Math.sin(dir) * j * 1.25 + Math.sin(j * 0.4 + r) * 1.5, y = GROUND + 2 + Math.cos(dir) * j * 0.3 + j * 0.12, glow = 0.5 + 0.5 * Math.sin(time * 2 - j * 0.3 + r);
      put(x, y, mix([0.5, 0.37, 0.26], acc, 0.25 + 0.5 * glow * (j / len)), j / len > 0.5 ? 3 : 1); if (j < len * 0.4) put(x + 1, y, [0.42, 0.3, 0.2], 1); } }
  if (gv < 1.5) { // brote: dos hojitas
    put(128, 165, [0.4, 0.7, 0.35], 3); put(127, 164, LEAF.hi, 3); put(129, 163, LEAF.light, 3); put(130, 163, LEAF.hi, 3); return; }
  // tronco nudoso: se ensancha abajo, se tuerce suave, 3 tonos de corteza y savia que late
  const top = treeTop(gv), base = 2.2 + Math.min(gv, 6) * 0.75;
  for (let y = 168; y >= top; y--) {
    const t = (y - top) / (168 - top + 1), off = Math.sin(y * 0.045) * 2 + Math.sin(y * 0.13) * 0.7;
    const flare = y > 160 ? (y - 160) * 0.55 : 0, ww = Math.max(1, base * (0.4 + 0.6 * t) + flare), kind = y < ATTIC ? 2 : 1;
    for (let x = -ww - 1; x <= ww + 1; x++) {
      const ix = Math.round(128 + off + x), iy = Math.round(y), nx = clamp(x / (ww || 1), -1, 1);
      if (Math.abs(x) > ww) { put(ix, iy, [0.12, 0.08, 0.06], kind); continue; }
      const ridge = Math.sin(x * 1.7 + y * 0.18 + Math.sin(y * 0.07) * 2) > 0.55;
      const tone = nx < -0.45 ? 0.62 : nx > 0.5 ? 1.12 : 0.88;
      let c = shade([0.43, 0.3, 0.2], tone * (ridge ? 0.72 : 1) * (0.92 + hash(ix, iy >> 1) * 0.14));
      if (hash(ix >> 1, iy >> 3) > 0.9 && nx < -0.2) c = mix(c, [0.3, 0.48, 0.28], 0.55);
      put(ix, iy, c, kind, nx); OCC[iy * W + ix + OX] = 2;
    }
    for (const vx of [-0.3, 0.35]) { const pulse = Math.max(0, Math.sin((y + time * 16) * 0.16 + vx * 9)) ** 3;
      if (pulse > 0.2 && ww > 2.2) put(128 + off + vx * ww, y, mix([0.43, 0.3, 0.2], mix(acc, [1, 1, 1], 0.35), pulse), 3); }
  }
  // Un solo sauce que crece: la copa va en la punta del tronco; en los pisos que ya dejó atrás quedan ramas laterales con pocos hilos.
  const topFloor = gv >= 5.1 ? 4 : [0, 1, 2, 3].find(k => top >= floorTop(k) && top < FLOORS[k]) ?? 0;
  for (let k = 0; k < topFloor; k++) twig(k, time, stage);
  if (gv < 5.1) youngCrown(top, topFloor, gv, time, stage);
  // la copa grande sobre la torre (Camino al 7)
  const ct = clamp((gv - 5.1) / 0.9);
  if (ct > 0) {
    const cy = 26, ring = [[-38, 7, 8], [38, 7, 8], [-26, 1, 10], [26, 1, 10], [-12, -4, 11], [12, -4, 11], [0, -8, 11], [-8, 4, 10], [8, 4, 10], [0, 1, 9]];
    // hilos largos que caen por fuera de la torre
    for (let s = 0; s < 26; s++) { const u = s / 25 * 2 - 1, seed = 9000 + s, x = 128 + u * 50 * ct, y = cy + 8 - Math.abs(u) * -6;
      const tip = strand(x, y, (26 + hash(seed, 2) * 70) * ct, seed, strandState(seed, 6), 2, Math.abs(u) > 0.45 ? 1.05 : 0.75, time, GROUND - 1);
      if (tip && strandState(seed, 6) === 'flower') lanterns.push([tip[0], tip[1] + 1, seed]); }
    bough(128, cy + 6, 128 - 40 * ct, cy + 6, 6, 3, 2); bough(128, cy + 6, 128 + 40 * ct, cy + 6, 6, 3, 2);
    ring.forEach(([dx, dy, r], i) => clump(128 + dx * ct, cy + dy, r * ct, 700 + i, 2, 1));
  }
  // magia: destellos que titilan sobre las hojas más iluminadas
  for (const [x, y, seed] of leafSpots) { const tw = Math.sin(time * 3 + seed * 1.7); if (tw > 0.93) put(x, y, mix(acc, [1, 1, 1], 0.6), 3); }
}

/* ── pisos sin abrir: niebla ── */
function fogLocked(gv, time) {
  for (let k = 0; k < 4; k++) { const open = clamp(gv - (1.6 + k) + 0.6); if (open >= 1) continue;
    for (let y = floorTop(k); y < FLOORS[k] - 3; y++) for (let x = IL; x < IR; x++) { const i = y * W + x + OX; if (KIND[i] !== 1) continue;
      const f = (1 - open) * (0.6 + 0.2 * Math.sin(x * 0.08 + y * 0.05 + time * 0.4)); AR[i] = lerp(AR[i], 0.2, f); AG[i] = lerp(AG[i], 0.2, f); AB[i] = lerp(AB[i], 0.32, f); } }
}

/* ── luz ── */
let shaftCache = null, shaftKey = '';
function computeShafts(sun, gv) {
  const shaft = new Float32Array(N);
  if (sun.day <= 0.02 || sun.sp <= 0 || sun.sp >= 1) return shaft;
  const angle = clamp(sun.alt, 0.12, 0.95) * 1.1, dx = sun.fromLeft ? Math.cos(angle) : -Math.cos(angle), dy = Math.sin(angle), wallX = sun.fromLeft ? IL : IR;
  for (let k = 0; k < 4; k++) { if (gv < 1.6 + k - 0.3 && gv < 6) continue; const [a, b] = winY(k);
    for (let y = floorTop(k); y < FLOORS[k]; y++) for (let x = IL; x < IR; x++) {
      const tt = (x - wallX) / dx; if (tt <= 0) continue; const wy = y - dy * tt; if (wy < a + 1 || wy > b) continue;
      // el rayo viaja desde la ventana: si cruza el tronco o las hojas, deja sombra
      let trans = 1;
      for (let s = 1.5; s < tt; s += 1.5) { const o = OCC[Math.round(y - dy * s) * W + Math.round(x - dx * s) + OX]; if (o === 2) { trans = 0; break; } if (o === 1) trans *= 0.72; if (trans < 0.08) break; }
      shaft[y * W + x + OX] = clamp(Math.min(wy - a, b - wy) / 3) * (1 - tt / 240) * trans;
    } }
  return shaft;
}
function computeLight(sun, time, gv) {
  LR.fill(0); LG.fill(0); LB.fill(0);
  const key = `${hour.toFixed(2)}|${gv.toFixed(3)}|${Math.floor(time * 8)}`;
  if (key !== shaftKey) { shaftCache = computeShafts(sun, gv); shaftKey = key; }
  const shaft = shaftCache, acc = hex(subject.color), lights = [];
  const lampOn = clamp(sun.night * 1.3 + 0.1), flick = n => 0.86 + 0.14 * Math.sin(time * 9 + n * 3) * Math.sin(time * 5.3 + n);
  for (let k = 0; k < 4; k++) if (gv >= 1.6 + k - 0.3) for (const [x, n] of [[IL + 3, k * 2], [IR - 4, k * 2 + 1]]) {
    const y = FLOORS[k] - 19; put(x, y - 2, [0.2, 0.16, 0.12], 1); put(x - 1, y - 1, [0.3, 0.24, 0.18], 1); put(x + 1, y - 1, [0.3, 0.24, 0.18], 1);
    put(x, y, mix([0.3, 0.25, 0.2], [1, 0.82, 0.48], lampOn), lampOn > 0.2 ? 3 : 1); put(x, y + 1, mix([0.3, 0.25, 0.2], [1, 0.7, 0.35], lampOn), lampOn > 0.2 ? 3 : 1); put(x, y + 2, [0.2, 0.16, 0.12], 1);
    if (lampOn > 0) lights.push([x, y, 30, [1, 0.7, 0.38], 1.05 * lampOn * flick(n)]); }
  if (gv >= 3.3) lights.push([97, FLOORS[2] - 17, 16, [1, 0.72, 0.38], 0.7 * flick(9)]);
  if (gv >= 1.6) lights.push([157, FLOORS[0] - 13, 22, acc, 0.55 + 0.12 * Math.sin(time * 2)]);
  if (gv >= 4.9) lights.push([162, FLOORS[3] - 6, 16, acc, 0.45 + 0.2 * sun.night]);
  if (gv >= 2.6) lights.push([160, FLOORS[1] - 15, 8, acc, 0.4]);
  if (gv >= 0.6) lights.push([128, GROUND + 6, 34, acc, 0.3 + 0.25 * sun.night]);
  if (gv >= 0.6 && gv < 1.6) lights.push([128, 165, 12, [0.7, 1, 0.5], 0.8]);
  if (gv >= 2) lights.push([128, Math.max(treeTop(gv) + 6, 30), 44, acc, 0.12 + 0.28 * sun.night]); // aura mágica del sauce
  lights.push([beacon[0], beacon[1], 26, acc, 0.35 + 0.5 * sun.night]);
  for (const [x, y] of islandsLights) lights.push([x, y, 14, acc, 0.3 + 0.5 * sun.night]);
  for (const [x, y, c] of otherBeacons) lights.push([x, y, 8, c, 0.6 * sun.night]);
  for (const x of mushrooms) lights.push([x, GROUND - 2, 7, acc, 0.6 * sun.night]);
  // farolitos del sauce
  const lc = mix(acc, [1, 0.95, 0.8], 0.35);
  for (const [x, y, seed] of lanterns) { const pulse = 0.75 + 0.25 * Math.sin(time * 2 + seed);
    put(x, y - 1, [0.25, 0.18, 0.12], KIND[Math.round(y) * W + Math.round(x) + OX] === 2 ? 2 : 1);
    put(x, y, mix(lc, [1, 1, 0.92], 0.5), 3); put(x, y + 1, lc, 3); put(x - 1, y + 1, shade(lc, 0.75), 3); put(x + 1, y + 1, shade(lc, 0.75), 3); put(x, y + 2, shade(lc, 0.7), 3);
    lights.push([x, y + 1, 14, lc, (0.3 + 0.65 * sun.night) * pulse]); }
  for (const l of extraLights) lights.push(l);
  return { shaft, lights };
}

/* ── partículas ── */
function particles(sun, light, time, stage) {
  const acc = hex(subject.color);
  for (let k = 0; k < 60; k++) { const x = IL + hash(k, 30) * (IR - IL) + (reduced ? 0 : Math.sin(time * 0.7 + k) * 2), y = ATTIC + ((hash(k, 31) * 120 + time * (1.5 + hash(k, 32) * 2)) % 120);
    const i = Math.round(y) * W + Math.round(x) + OX; if (light.shaft[i] > 0.2) put(x, y, mix(sun.col, [1, 1, 1], 0.5), 3); }
  if (stage >= 2) for (let k = 0; k < 14; k++) { const life = (time * 0.25 + hash(k, 70)) % 1, x = 128 + (hash(k, 71) - 0.5) * 70 + Math.sin(time + k) * 3, y = GROUND - 8 - life * (40 + stage * 20);
    if (y > ATTIC || stage >= 6) { put(x, y, mix(acc, [1, 1, 1], 0.4), 3); light.lights.push([x, y, 5, acc, 0.2 * (1 - life)]); } }
  if (stage >= 3) for (let k = 0; k < 5; k++) { const fall = (time * 8 + hash(k, 40) * 100) % 100, x = 108 + hash(k, 41) * 40 + Math.sin(time * 2 + k) * 4, y = 60 + fall;
    if (y < GROUND - 2) put(x, y, k % 2 ? [0.95, 0.75, 0.3] : [0.6, 0.42, 0.25], 1, 0.5); }
  if (sun.night > 0.25) for (let k = 0; k < 16; k++) { const x = hash(k, 50) * W - OX + Math.sin(time * 0.7 + k) * 8, y = 145 + hash(k, 51) * 30 + Math.cos(time * 0.9 + k) * 4;
    if ((x < TL - 2 || x > TR + 2) && Math.sin(time * 3 + k * 2) > 0) { put(x, y, [0.85, 1, 0.5], 3); light.lights.push([x, y, 6, [0.8, 1, 0.4], 0.3 * sun.night]); } }
  // runas que orbitan la torre de noche
  if (sun.night > 0.1) for (let k = 0; k < 6; k++) { const an = time * 0.35 + k / 6 * Math.PI * 2, x = 128 + Math.cos(an) * 68, y = 112 + Math.sin(an) * 10 - k * 3;
    const front = Math.sin(an) > 0; if (!front && x > TL && x < TR) continue;
    for (const [dx, dy] of [[0, 0], [0, -1], [1, -1], [0, 1], [-1, 1]]) put(x + dx, y + dy, mix(acc, [1, 1, 1], 0.3), 3); light.lights.push([x, y, 10, acc, 0.35 * sun.night]); }
  // círculo mágico al pie de la torre
  const ring = 0.4 + 0.6 * sun.night;
  for (let a = 0; a < 96; a++) { const an = a / 96 * Math.PI * 2, rx = Math.cos(an) * 66, ry = Math.sin(an) * 7;
    const x = 128 + rx, y = 186 + ry, on = (a + Math.floor(time * 6)) % 8 < 5; if (Math.sin(an) < 0 && x > TL && x < TR) continue;
    if (on) put(x, y, mix([0.35, 0.28, 0.24], acc, ring), ring > 0.5 ? 3 : 2); }
}

/* ── composición: luz + resplandor + tramado ── */
function compose(sun, light, low) {
  for (const [x, y, r, c, I] of light.lights) addLight(x, y, r, c, I);
  const sky = skyAt(hour), amb = sky.amb, ambIn = [amb[0] * 0.45 + 0.13, amb[1] * 0.45 + 0.11, amb[2] * 0.45 + 0.17];
  const side = sun.fromLeft ? -1 : 1;
  // sombra de la torre sobre el pasto (larga al amanecer y al atardecer)
  SH.fill(0);
  if (sun.day > 0.05) { const len = 10 + (1 - sun.alt) * 70; for (let y = GROUND - 2; y < H; y++) for (let x = 0; x < W; x++) {
    const d = side < 0 ? x - OX - TR : TL - (x - OX); if (d > 0 && d < len && y < GROUND + 10) SH[y * W + x] = 0.45 * sun.day * (1 - d / len); } }
  for (let i = 0; i < N; i++) {
    const k = KIND[i]; let r = AR[i], g2 = AG[i], b = AB[i];
    if (k === 1) {
      const s = light.shaft[i] * sun.day, face = 1 + 0.7 * NX[i] * -side; // la cara que mira hacia la ventana con sol brilla más
      const sl = s * 1.25 * Math.max(0.3, face);
      r *= ambIn[0] + LR[i] + sun.col[0] * sl; g2 *= ambIn[1] + LG[i] + sun.col[1] * sl; b *= ambIn[2] + LB[i] + sun.col[2] * sl;
      r += sun.col[0] * s * 0.12; g2 += sun.col[1] * s * 0.12; b += sun.col[2] * s * 0.1; // el aire del haz se ve
    } else if (k === 2) {
      const facing = 1 + 0.35 * NX[i] * side * sun.day, shadow = 1 - SH[i];
      r *= (amb[0] * facing) * shadow + LR[i] * 0.8; g2 *= (amb[1] * facing) * shadow + LG[i] * 0.8; b *= (amb[2] * facing) * shadow + LB[i] * 0.8;
      r += 0.05 * sun.warm * sun.day;
    } else if (k === 0) { r += LR[i] * 0.2; g2 += LG[i] * 0.2; b += LB[i] * 0.2; }
    else { r *= 1.1; g2 *= 1.1; b *= 1.1; }
    OR[i] = r; OG[i] = g2; OB[i] = b;
  }
  if (!low) bloom(sun);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, d = BAYER[(y & 3) * 4 + (x & 3)], step = 1 / 15;
    const q = v => Math.round(clamp(Math.floor((v + d * step) / step) * step) * 255);
    px[i * 4] = q(OR[i]); px[i * 4 + 1] = q(OG[i]); px[i * 4 + 2] = q(OB[i]); px[i * 4 + 3] = 255;
  }
}
function bloom(sun) {
  // 1) lo más brillante, a media resolución  2) desenfoque  3) se suma de vuelta: así los faroles "irradian"
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) { let r = 0, g2 = 0, b = 0;
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) { const i = (y * 2 + dy) * W + x * 2 + dx, lum = OR[i] * 0.3 + OG[i] * 0.55 + OB[i] * 0.15, emit = KIND[i] === 3 ? 1 : 0;
      const w = Math.max(0, lum - 0.9) * 1.5 + emit * 0.6; r += OR[i] * w; g2 += OG[i] * w; b += OB[i] * w; }
    const j = (y * BW + x) * 3; BLA[j] = r / 4; BLA[j + 1] = g2 / 4; BLA[j + 2] = b / 4; }
  for (let pass = 0; pass < 2; pass++) { blur(BLA, BLB, 1, 0); blur(BLB, BLA, 0, 1); }
  const k = 0.55 + 0.35 * sun.night;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const j = ((y >> 1) * BW + (x >> 1)) * 3, i = y * W + x; OR[i] += BLA[j] * k; OG[i] += BLA[j + 1] * k; OB[i] += BLA[j + 2] * k; }
}
function blur(src, dst, ax, ay) {
  const R = 4;
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) { let r = 0, g2 = 0, b = 0, n = 0;
    for (let s = -R; s <= R; s++) { const xx = x + s * ax, yy = y + s * ay; if (xx < 0 || yy < 0 || xx >= BW || yy >= BH) continue; const j = (yy * BW + xx) * 3; r += src[j]; g2 += src[j + 1]; b += src[j + 2]; n++; }
    const j = (y * BW + x) * 3; dst[j] = r / n; dst[j + 1] = g2 / n; dst[j + 2] = b / n; }
}

let raf = 0, last = 0, alive = true;
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); }) : null;
let visible = true; io?.observe(cv);
function frame(nowMs) {
  raf = 0;
  if (!alive) return;
  if (!cv.isConnected) { destroy(); return; }
  const low = document.body.dataset.nexoQuality === 'low';
  reduced = reducedNow();
  const fps = reduced ? 2 : low ? 10 : 20;
  const paused = document.hidden || document.body.classList.contains('ambient-paused') || !visible;
  if (!paused && nowMs - last >= 1000 / fps) {
    last = nowMs;
    const time = reduced ? 0 : (nowMs - t0) / 1000;
    hour = hourNow();
    g += (target - g) * (reduced ? 1 : 0.08); if (Math.abs(target - g) < 0.002) g = target;
    const stage = Math.round(g), sun = sunInfo(hour), crack = clamp((g - 5.1) / 0.9);
    OCC.fill(0); NX.fill(0);
    drawSky(skyAt(hour), sun, time); drawLandscape(sun, time);
    drawTower(stage, crack, sun, time);
    for (let k = 0; k < 4; k++) drawProps(k, g >= 1.6 + k - 0.3, time);
    drawTree(g, time, stage, sun);
    fogLocked(g, time);
    extraLights.length = 0;
    if (hovered && !same(hovered, selected)) highlight(hovered, 0.45, time);
    if (selected) highlight(selected, 1, time);
    const light = computeLight(sun, time, g);
    particles(sun, light, time, stage);
    compose(sun, light, low);
    ctx.putImageData(img, 0, 0);
  }
  raf = requestAnimationFrame(frame);
}
/* ── tocar cosas: qué hay en un punto y cómo se ilumina lo elegido ── */
const same = (a, b) => Boolean(a && b) && a.kind === b.kind && a.idx === b.idx && a.k === b.k && a.id === b.id;
function pick(x, y) {
  x -= OX;
  if (Math.hypot(x - beacon[0], y - beacon[1]) < 9) return { kind: 'crystal' };
  for (let i = 0; i < otherBeacons.length; i++) { const [bx, by] = otherBeacons[i]; if (Math.abs(x - bx) < 8 && y > by - 4 && y < by + 46) return { kind: 'tower', id: others[i]?.id }; }
  let best = null, bd = 2.6;
  for (const h of hitStrands) for (const [px, py] of h.pts) { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = h.idx; } }
  if (best != null) return { kind: 'strand', idx: best };
  if (x >= 117 && x <= 139 && y >= 160 && y <= 177) return { kind: 'pot' };
  if (x >= IL && x <= IR && y >= GROUND && y < H) return { kind: 'roots' };
  for (let k = 0; k < 4; k++) if (x >= IL && x <= IR && y >= floorTop(k) && y < FLOORS[k]) return { kind: 'floor', k };
  return null;
}
function highlight(sel, a, time) {
  const acc = hex(subject.color), glow = mix(acc, [1, 1, 0.92], 0.45), pulse = 0.75 + 0.25 * Math.sin(time * 4);
  if (sel.kind === 'strand') {
    let n = 0;
    for (const h of hitStrands) if (h.idx === sel.idx) { for (const [x, y] of h.pts) { if (a >= 1) put(x, y, glow, 3); else blend(x, y, glow, a); }
      if (n++ % 2 === 0) { const [x, y] = h.pts[h.pts.length >> 1]; extraLights.push([x, y, 14, acc, 0.5 * a * pulse]); } }
  } else if (sel.kind === 'floor') {
    const y0 = floorTop(sel.k), y1 = FLOORS[sel.k] - 3;
    for (let x = IL; x < IR; x++) { if ((x + Math.floor(time * 8)) % 4 < 2) { put(x, y0, glow, a >= 1 ? 3 : 1); put(x, y1, glow, a >= 1 ? 3 : 1); } }
    for (let y = y0; y < y1; y++) if ((y + Math.floor(time * 8)) % 4 < 2) { put(IL, y, glow, a >= 1 ? 3 : 1); put(IR - 1, y, glow, a >= 1 ? 3 : 1); }
    extraLights.push([128, (y0 + y1) / 2, 46, acc, 0.45 * a * pulse]);
  } else if (sel.kind === 'roots') {
    for (let x = IL; x < IR; x++) if ((x + Math.floor(time * 8)) % 4 < 2) put(x, GROUND + 1, glow, 3);
    extraLights.push([128, GROUND + 8, 50, acc, 0.8 * a * pulse]);
  } else if (sel.kind === 'pot') extraLights.push([128, 168, 22, acc, 0.9 * a * pulse]);
  else if (sel.kind === 'crystal') extraLights.push([beacon[0], beacon[1], 40, acc, 1 * a * pulse]);
  else if (sel.kind === 'tower') { const i = others.findIndex(o => o.id === sel.id), b = otherBeacons[i]; if (b) extraLights.push([b[0], b[1] + 18, 26, b[2], 0.9 * a * pulse]); }
}
function destroy() { alive = false; if (raf) cancelAnimationFrame(raf); raf = 0; io?.disconnect(); }
function update(o = {}) {
  if (o.stage != null) target = o.stage;
  if (o.states) states = o.states;
  if (o.roots != null) roots = o.roots;
  if (o.color) subject.color = o.color;
  if (o.stone) subject.stone = o.stone;
  if (o.others) others = o.others;
}
raf = requestAnimationFrame(frame);
return { update, destroy, pick, select(sel) { selected = sel || null; }, hover(sel) { hovered = sel || null; }, get stage() { return g; } };
}
// Piedra y color de magia de cada ramo (color de dist/data.js).
const SUBJECTS = {
  organica: { color: '#ffbd59', stone: [0.6, 0.53, 0.48] }, analitica: { color: '#36e3d2', stone: [0.47, 0.55, 0.58] },
  fisico: { color: '#8c7cff', stone: [0.52, 0.5, 0.62] }, fisio: { color: '#ff6d8d', stone: [0.62, 0.5, 0.51] }
};
// Atajo: la torre de un ramo, con las otras tres a lo lejos.
function forSubject(id) { const me = SUBJECTS[id] || SUBJECTS.organica; return { ...me, others: Object.entries(SUBJECTS).filter(([k]) => k !== id).map(([k, v]) => ({ id: k, ...v })) }; }
window.NexoWillowTower = Object.freeze({ mount, forSubject, SUBJECTS });
})();
