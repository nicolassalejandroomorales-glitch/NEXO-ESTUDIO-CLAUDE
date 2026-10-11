/* Mascotas alquímicas en PIXEL ART de verdad (docs/mascota/SPEC.md · Fase 5).
   Cada cuadro se dibuja píxel por píxel en una grilla chica (40×44 px de arte) con las MISMAS rampas de color del refugio pixel
   (tools/home-pixel/pixel.py): la luz sube/baja escalones dentro de la rampa, contorno de 1 px con el tono más oscuro del material.
   Las poses (aplastar, inclinar, flotar) se RE-RASTERIZAN: nunca se estira la imagen, así no aparecen píxeles deformes.
   Ojos, bocas, accesorios y efectos son mini dibujos hechos a mano (mapas de caracteres). */
(() => {
  'use strict';
  const W = 40, H = 44;
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const ramp = (...cs) => cs.map(hex);
  // Rampas de oscuro a claro (las del refugio + dos propias: poción y slime).
  const RAMPS = {
    glass: ramp('#1c2c2c', '#2c4440', '#40605a', '#5c8478', '#86aa98', '#bcd6c0', '#eef8e8', '#ffffff'),
    potion: ramp('#0e2420', '#163c33', '#1f5a48', '#2b7c5f', '#3fa077', '#62c391', '#9ae2b4', '#d6fbe2'),
    slime: ramp('#0c1716', '#1c3a23', '#2a5228', '#3f6e2d', '#5d8c36', '#83ad42', '#b2cf5c', '#e2ee8a', '#fffbc0'),
    wood: ramp('#1a0f13', '#2c1916', '#47281b', '#673c23', '#8a552e', '#b0743d', '#d29a55', '#f0c378', '#ffe2a0'),
    brass: ramp('#2e1a0e', '#5a3616', '#8a5c20', '#ba8a30', '#e2b850', '#fbe08a', '#fff6c8'),
    paper: ramp('#4e4034', '#7a6650', '#a69070', '#cab692', '#e6d6b2', '#fff4d8'),
    proton: ramp('#2e1614', '#552820', '#80402a', '#a85a36', '#cc7a48', '#eaa066', '#ffd2a0'),
    neutron: ramp('#10162c', '#1a2644', '#263a62', '#385480', '#5072a0', '#7494bc', '#b4c8e4'),
    orbit: ramp('#2a4870', '#4f86b8', '#86c2e8', '#c8ecff', '#ffffff'),
    pink: ramp('#3e141e', '#64202a', '#a8406a', '#d8669a', '#f49ac0', '#ffd0e4'),
    shadow: ramp('#140c10')
  };
  const NAMES = Object.keys(RAMPS);
  // Colores fijos para los mini dibujos.
  const INK = {
    k: '#24130f', w: '#ffffff', r: '#c4544a', R: '#ff5d7a', q: '#ffc2cf', b: '#f2998a', y: '#ffd34d', Y: '#fff3b0', o: '#e39a2a',
    P: '#2e2552', p: '#4b3a8a', l: '#7f6cc8', G: '#b8741a', g: '#e8b65a', h: '#fff1b0', n: '#2a2a38', N: '#4a4a62',
    c: '#c2453a', C: '#ef6a5a', e: '#efe1c2', E: '#cdb88f', s: '#1f1c2b', S: '#5c6aa0', u: '#3f7fbf', U: '#7fb4e6', v: '#7a5bd6', V: '#c2b0ff',
    t: '#6b4426', T: '#a8784a', m: '#f2e7d2', M: '#8a5a36', x: '#5f9f4a', f: '#f7a6c4', F: '#ffd34d', z: '#9fd3f0', Z: '#e9f7ff', a: '#6a2a20', A: '#8e3b2e',
    d: '#d9c79f', D: '#fbf3dc', i: '#9d8762', j: '#2f5d7a', J: '#1f4157', '1': '#e0473a', '2': '#ffffff'
  };
  const INKRGB = Object.fromEntries(Object.entries(INK).map(([k, v]) => [k, hex(v)]));

  // ——— Cuadro de dibujo: material + nivel + parte por píxel ———
  class Frame {
    constructor() { this.mat = new Int16Array(W * H).fill(-1); this.lvl = new Float32Array(W * H); this.part = new Int16Array(W * H).fill(-1); this.rgb = new Array(W * H); this.nosel = new Uint8Array(W * H); this.m = [1, 0, 0, 1, 0, 0]; this.stack = []; this.nextPart = 0; }
    save() { this.stack.push(this.m.slice()); } restore() { this.m = this.stack.pop(); }
    // Transformaciones (se aplican a las coordenadas de dibujo).
    mul([a, b, c, d, e, f]) { const [A, B, C, D, E, F] = this.m; this.m = [A * a + C * b, B * a + D * b, A * c + C * d, B * c + D * d, A * e + C * f + E, B * e + D * f + F]; }
    translate(x, y) { this.mul([1, 0, 0, 1, x, y]); }
    rotate(deg, px, py) { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); this.translate(px, py); this.mul([c, s, -s, c, 0, 0]); this.translate(-px, -py); }
    scale(sx, sy, px, py) { this.translate(px, py); this.mul([sx, 0, 0, sy, 0, 0]); this.translate(-px, -py); }
    apply(x, y) { const [a, b, c, d, e, f] = this.m; return [a * x + c * y + e, b * x + d * y + f]; }
    inv() { const [a, b, c, d, e, f] = this.m, det = a * d - b * c; return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det]; }
    // Rellena donde inside(x,y) (coordenadas de la forma). level(x,y) da el escalón. outline: contorno propio de la parte.
    fill(bbox, mat, inside, level, { outline = true, selout = true } = {}) {
      const id = this.nextPart++, mi = NAMES.indexOf(mat), iv = this.inv();
      const pts = [[bbox[0], bbox[1]], [bbox[2], bbox[1]], [bbox[0], bbox[3]], [bbox[2], bbox[3]]].map(([x, y]) => this.apply(x, y));
      const x0 = Math.max(0, Math.floor(Math.min(...pts.map(p => p[0])))), x1 = Math.min(W - 1, Math.ceil(Math.max(...pts.map(p => p[0]))));
      const y0 = Math.max(0, Math.floor(Math.min(...pts.map(p => p[1])))), y1 = Math.min(H - 1, Math.ceil(Math.max(...pts.map(p => p[1]))));
      const mine = [];
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const sx = iv[0] * (x + .5) + iv[2] * (y + .5) + iv[4], sy = iv[1] * (x + .5) + iv[3] * (y + .5) + iv[5];
        if (!inside(sx, sy)) continue;
        const i = y * W + x; this.mat[i] = mi; this.lvl[i] = level(sx, sy, x, y); this.part[i] = id; this.rgb[i] = null; this.nosel[i] = selout ? 0 : 1; mine.push(i);
      }
      if (outline) mine.forEach(i => { const x = i % W, y = (i / W) | 0;
        const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X >= 0 && Y >= 0 && X < W && Y < H && this.part[Y * W + X] !== id && this.mat[Y * W + X] >= 0; });
        if (edge) this.lvl[i] = Math.min(this.lvl[i], 1); });
      return id;
    }
    // Mini dibujo (mapa de caracteres) anclado en (ax, ay) de la forma; no rota (los píxeles quedan nítidos).
    stamp(rows, ax, ay, { anchor = 'center', flip = false } = {}) {
      const h = rows.length, w = Math.max(...rows.map(r => r.length));
      const [px, py] = this.apply(ax, ay);
      const ox = Math.round(px - (anchor === 'bottom' ? w / 2 : w / 2)), oy = Math.round(py - (anchor === 'bottom' ? h : h / 2));
      rows.forEach((row, ry) => [...row].forEach((ch, rx) => {
        if (ch === '.' || ch === ' ') return;
        const x = ox + (flip ? w - 1 - rx : rx), y = oy + ry; if (x < 0 || y < 0 || x >= W || y >= H) return;
        const i = y * W + x; this.rgb[i] = INKRGB[ch]; this.mat[i] = -2; this.part[i] = 9999;
      }));
    }
    toImageData(ctx) {
      const img = ctx.createImageData(W, H), d = img.data;
      for (let i = 0; i < W * H; i++) {
        let c = null;
        if (this.mat[i] === -2) c = this.rgb[i];
        else if (this.mat[i] >= 0) { const r = RAMPS[NAMES[this.mat[i]]]; c = r[Math.max(0, Math.min(r.length - 1, Math.round(this.lvl[i])))]; }
        else continue;
        // Contorno exterior ("selout"): píxel opaco junto a uno vacío → el tono más oscuro de su rampa.
        const x = i % W, y = (i / W) | 0;
        if (this.mat[i] >= 0 && !this.nosel[i] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X < 0 || Y < 0 || X >= W || Y >= H || this.mat[Y * W + X] === -1; }))
          c = RAMPS[NAMES[this.mat[i]]][0];
        d.set([c[0], c[1], c[2], 255], i * 4);
      }
      return img;
    }
  }
  // Sombreado de volumen (esfera/elipse): la luz viene de arriba a la izquierda; devuelve escalones.
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function sphere(cx, cy, rx, ry, base, k = 2.4, dither = false) {
    return (sx, sy, x, y) => {
      const u = (sx - cx) / rx, v = (sy - cy) / ry, nz = Math.sqrt(Math.max(0, 1 - u * u - v * v));
      const d = (-u * .55 - v * .62 + nz * .56) - .35;
      let l = base + d * k;
      if (dither) l += (BAYER[y & 3][x & 3] / 16 - .47) * .9;
      return Math.round(l);
    };
  }
  const inEllipse = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  function inPoly(pts) {
    return (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  }

  // ——— Caras (ojos 3×4 y bocas) ———
  const EYES = {
    normal: ['kw', 'kk', 'kk'], feliz: ['.k.', 'k.k'], dormido: ['k.k', '.k.'], sorpresa: ['kkk', 'kwk', 'kkk'],
    concentrado: ['kkk', '.kw'], amor: ['R.R', 'RRq', '.R.'], estrellas: ['.y.', 'yYy', '.y.'], triste: ['kw', 'kk', 'kk'], enojado: ['kw', 'kk', 'kk']
  };
  const MOUTHS = {
    sonrisa: ['k.k', '.k.'], abierta: ['kkk', 'krk', '.k.'], grande: ['kkkkk', 'krrrk', '.kkk.'], o: ['.k.', 'k.k', '.k.'],
    bostezo: ['.k.', 'kkk', 'krk', '.k.'], plana: ['kkk'], dormida: ['k'], triste: ['.k.', 'k.k'], ondulada: ['k.k.k', '.k.k.']
  };
  const EXPRESSIONS = {
    neutral: ['normal', 'base'], feliz: ['feliz', 'grande'], sorpresa: ['sorpresa', 'o'], dormida: ['dormido', 'dormida'],
    concentrada: ['concentrado', 'plana'], amor: ['amor', 'abierta'], bostezo: ['dormido', 'bostezo'], idea: ['sorpresa', 'grande'],
    triste: ['triste', 'triste'], enojada: ['enojado', 'triste'], deslumbrada: ['estrellas', 'grande'], nerviosa: ['sorpresa', 'ondulada'],
    confundida: ['normal', 'ondulada'], picara: ['feliz', 'sonrisa']
  };
  function drawFace(f, spec, st) {
    const [eyeName, mouth0] = EXPRESSIONS[st.expr] || EXPRESSIONS.neutral;
    const blink = st.blink && ['normal', 'triste', 'enojado', 'concentrado'].includes(eyeName);
    const eye = blink ? ['kk'] : EYES[eyeName], mouth = MOUTHS[mouth0 === 'base' ? spec.mouth : mouth0];
    const [lx, ly] = st.look.map(v => Math.round(v));
    spec.eyes.forEach(([ex, ey], k) => {
      f.stamp(eye, ex + lx, ey + ly, { flip: k === 1 && eyeName === 'normal' ? false : false });
      if (eyeName === 'triste') f.stamp(k ? ['k.', '.k'] : ['.k', 'k.'], ex + (k ? 1 : -1), ey - 3);
      if (eyeName === 'enojado') f.stamp(k ? ['.k', 'k.'] : ['k.', '.k'], ex + (k ? 1 : -1), ey - 3);
    });
    spec.blush.forEach(([bx, by]) => f.stamp(['bb'], bx, by));
    f.stamp(mouth, spec.mouthAt[0], spec.mouthAt[1] + (mouth.length > 2 ? 1 : 0));
  }

  // ——— Mini brazos con manitos (se redibujan en cada pose: siempre píxeles nítidos) ———
  const REST_ARMS = [{ h: [-3, 5] }, { h: [3, 5] }];
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }
  function drawArms(f, kind, st) {
    const sp = SPECS[kind], arms = st.arms || REST_ARMS;
    sp.shoulders.forEach(([sx0, sy0], k) => {
      const a = arms[k] || REST_ARMS[k], H = [sx0 + a.h[0], sy0 + a.h[1]], E = a.e ? [sx0 + a.e[0], sy0 + a.e[1]] : null;
      const pts = E ? [[sx0, sy0], E, H] : [[sx0, sy0], H];
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const bbox = [Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3];
      f.fill(bbox, sp.arm, (x, y) => pts.slice(1).some((p, i) => segDist(x, y, pts[i][0], pts[i][1], p[0], p[1]) <= 1.9), (x, y) => sp.armLvl + .4 - (y > (E ? E[1] : H[1]) ? .6 : 0));
      f.fill([H[0] - 4, H[1] - 4, H[0] + 4, H[1] + 4], sp.hand, inEllipse(H[0], H[1], 2.45, 2.3), (x, y) => sp.handLvl + (x < H[0] && y < H[1] ? 1.2 : .3));
    });
  }

  // ——— Las tres mascotas (coordenadas en píxeles de arte; centro x=20, suelo y=43) ———
  const SPECS = {
    matraz: { eyes: [[16.5, 27], [23.5, 27]], mouthAt: [20, 30.5], mouth: 'sonrisa', blush: [[12.5, 29.5], [27.5, 29.5]],
      slots: { cabeza: [20, 6.5], cara: [20, 27], cuello: [20, 15], mano: [32, 34] }, shoulders: [[11.6, 29.5], [28.4, 29.5]], arm: 'glass', armLvl: 5, hand: 'paper', handLvl: 4 },
    atomo: { eyes: [[17.5, 21], [22.5, 21]], mouthAt: [20, 24], mouth: 'sonrisa', blush: [[14.5, 23], [25.5, 23]],
      slots: { cabeza: [20, 14.5], cara: [20, 21], cuello: [20, 31], mano: [32, 27] }, shoulders: [[12.4, 25], [27.6, 25]], arm: 'orbit', armLvl: 2.6, hand: 'paper', handLvl: 4 },
    slime: { eyes: [[15.5, 30], [24.5, 30]], mouthAt: [20, 33.5], mouth: 'abierta', blush: [[11.5, 32.5], [28.5, 32.5]],
      slots: { cabeza: [20, 10], cara: [20, 30], cuello: [20, 38], mano: [35, 36] }, shoulders: [[7.5, 34], [32.5, 34]], arm: 'slime', armLvl: 5, hand: 'slime', handLvl: 6 }
  };
  const FLASK = [[16.6, 12], [23.4, 12], [23.4, 19], [32, 35.5], [32.6, 38.6], [30.6, 41.6], [9.4, 41.6], [7.4, 38.6], [8, 35.5], [16.6, 19]];

  function drawMatraz(f, st) {
    const t = st.t;
    // Patitas de madera (con paso alternado).
    [[14.5, st.footL], [25.5, st.footR]].forEach(([x, up]) => f.fill([x - 3, 40, x + 3, 44], 'wood', inEllipse(x, 42.4 - up, 2.7, 1.4), sphere(x, 42 - up, 2.7, 1.4, 4.5)));
    f.save(); f.rotate(st.bodyTilt, 20, 41); f.scale(st.sx, st.sy, 20, 41.5);
    const insideGlass = inPoly(FLASK);
    // Vidrio: más oscuro en los bordes (grosor), claro al centro, brillo a la izquierda.
    f.fill([7, 11, 33, 42], 'glass', insideGlass, (sx, sy) => {
      const hw = sy < 19 ? 3.4 : 3.4 + (Math.min(sy, 35.5) - 19) / 16.5 * 8.6, u = (sx - 20) / hw;
      return 5 - Math.abs(u) * 2.2 + (u < -.45 && u > -.75 && sy > 21 && sy < 36 ? 2 : 0) + (sy > 39 ? -1 : 0);
    });
    // Poción: superficie inclinada (se balancea al revés), más oscura al fondo, línea clara arriba.
    const surf = sx => 32.5 + Math.tan(st.slosh * Math.PI / 180) * (sx - 20);
    f.fill([8, 25, 32, 42], 'potion', (sx, sy) => insideGlass(sx, sy) && insideGlass(sx - 1, sy) && insideGlass(sx + 1, sy) && insideGlass(sx, sy + 1) && sy > surf(sx),
      (sx, sy) => sy - surf(sx) < 1 ? 7 : 6 - (sy - surf(sx)) * .45 - Math.abs(sx - 20) * .08 + (Math.abs(sx - 17) < 1.2 && sy < 38 ? 1 : 0), { outline: false });
    // Burbujas que suben dentro de la poción.
    [[15, 0], [22, 1.7], [26, 3.1], [18.5, 4.4]].forEach(([bx, off]) => {
      const by = 41 - ((t * 2.2 + off * 2) % 7.5);
      if (by > surf(bx) + .8) f.fill([bx - 1, by - 1, bx + 1, by + 1], 'potion', (sx, sy) => Math.abs(sx - bx) < .6 && Math.abs(sy - by) < .6, () => 7, { outline: false });
    });
    // Marcas de medida (lado derecho del vidrio).
    [31, 34, 37].forEach(y => f.fill([24, y - 1, 30, y + 1], 'glass', (sx, sy) => sy >= y && sy < y + 1 && sx > 26 + (y - 31) * .5 && sx < 28.5 + (y - 31) * .5, () => 7, { outline: false }));
    // Borde del cuello y corcho (puede saltar en el gesto).
    f.fill([15, 11, 25, 13], 'glass', (sx, sy) => sy >= 11.5 && sy < 13 && Math.abs(sx - 20) < 4.6, () => 6);
    f.save(); f.translate(0, -Math.round(st.cork)); f.rotate(-st.cork * 2.5, 20, 9);
    f.fill([15, 5, 25, 12.5], 'wood', (sx, sy) => sy >= 6 && sy < 12 && Math.abs(sx - 20) < 4.3 - (sy > 10 ? .4 : 0), (sx, sy) => (sy < 7.2 ? 7 : 5) - (sx - 20) * .28 + ((sx | 0) % 3 === 0 && sy > 8 ? -1 : 0));
    f.restore();
    // Cordel y etiqueta con símbolo de mercurio (se mece).
    f.fill([16, 14, 24, 16], 'brass', (sx, sy) => sy >= 14.5 && sy < 15.5 && Math.abs(sx - 20) < 3.7, sx => ((sx | 0) % 2 ? 4 : 2), { outline: false });
    f.save(); f.rotate(st.tag, 24, 15);
    f.fill([23, 14, 30, 21], 'paper', (sx, sy) => sx >= 24.5 && sx < 29.5 && sy >= 16 && sy < 20, (sx, sy) => 4 + (sy < 17 ? 1 : 0));
    f.stamp(['G'], 27, 18); f.restore();
    drawFace(f, SPECS.matraz, st);
    drawArms(f, 'matraz', st);
    f.restore();
  }

  function drawAtomo(f, st) {
    const t = st.t;
    // Sombra en el suelo (flota).
    f.fill([10, 41, 30, 44], 'shadow', (sx, sy) => inEllipse(20, 42.5, 8 - st.lift * .2, 1.3)(sx, sy) && ((Math.floor(sx) + Math.floor(sy)) % 2 === 0), () => 0, { outline: false, selout: false });
    f.save(); f.translate(0, -Math.round(st.lift)); f.rotate(st.bodyTilt, 20, 22);
    const orbits = [[-30, 0], [30, 2.1], [90, 4.2]];
    const ring = (rot, front) => {
      const r = rot * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
      f.fill([1, 3, 39, 41], 'orbit', (sx, sy) => {
        const dx = sx - 20, dy = sy - 22, u = (dx * c + dy * s) / 17, v = (-dx * s + dy * c) / 5.6, e = Math.sqrt(u * u + v * v);
        return Math.abs(e - 1) < .075 && (v > 0) === front;
      }, () => front ? 3 : 2, { outline: false, selout: false });
    };
    orbits.forEach(([rot]) => ring(rot, false));
    // Núcleo: protones (cálidos) y neutrones (fríos) alrededor; el del centro lleva la cara.
    f.save(); f.rotate(st.spin, 20, 22); f.scale(st.sx, st.sy, 20, 22);
    [[-90, 'proton'], [-30, 'neutron'], [30, 'proton'], [90, 'neutron'], [150, 'proton'], [210, 'neutron']].forEach(([a, m]) => {
      const r = a * Math.PI / 180, x = 20 + Math.cos(r) * 6.4, y = 22 + Math.sin(r) * 6.4;
      f.fill([x - 5, y - 5, x + 5, y + 5], m, inEllipse(x, y, 4.1, 4.1), sphere(x, y, 4.1, 4.1, 4));
    });
    f.restore();
    f.save(); f.scale(st.sx, st.sy, 20, 22);
    f.fill([12, 14, 28, 30], 'proton', inEllipse(20, 22, 6.6, 6.6), sphere(20, 22, 6.6, 6.6, 4.3, 2.6));
    drawFace(f, SPECS.atomo, st); drawArms(f, 'atomo', st); f.restore();
    orbits.forEach(([rot]) => ring(rot, true));
    // Electrones que giran (adelante brillan más).
    orbits.forEach(([rot, off]) => {
      const a = t * (1.9 + off * .15) * (1 + st.excite) + off, r = rot * Math.PI / 180;
      const ex = Math.cos(a) * 17, ey = Math.sin(a) * 5.6, x = 20 + ex * Math.cos(r) - ey * Math.sin(r), y = 22 + ex * Math.sin(r) + ey * Math.cos(r);
      f.fill([x - 2, y - 2, x + 2, y + 2], 'orbit', inEllipse(x, y, 1.5, 1.5), (sx, sy) => (sx < x && sy < y ? 4 : 2), { outline: false, selout: false });
    });
    f.restore();
  }

  function drawSlime(f, st) {
    const t = st.t;
    f.save(); f.translate(0, -Math.round(st.lift));
    // Charquito brillante en la base.
    f.fill([0, 40, 40, 44], 'slime', inEllipse(20, 41.8, 17.5 * st.sx, 1.9), (sx) => (sx < 14 ? 5 : 4));
    f.save(); f.rotate(st.bodyTilt, 20, 42); f.scale(st.sx, st.sy, 20, 42);
    const body = (sx, sy) => sy <= 41.6 && inEllipse(20, 31, 14, 11.5)(sx, Math.min(sy, 31)) || (sy > 31 && sy <= 41.6 && Math.abs(sx - 20) < 14 - (sy > 39 ? (sy - 39) * .4 : 0));
    f.fill([5, 18, 35, 42], 'slime', body, sphere(19, 30, 15, 13, 5, 2.8, true));
    // Núcleo más claro (luz que atraviesa la gelatina) y partículas suspendidas.
    f.fill([12, 26, 28, 40], 'slime', (sx, sy) => body(sx, sy) && inEllipse(19, 33, 6, 5)(sx, sy), () => 6, { outline: false });
    [[13, 0], [26, 2.4], [21, 4.6]].forEach(([bx, off]) => {
      const by = 40 - ((t * 1.4 + off) % 8);
      f.fill([bx - 1, by - 1, bx + 2, by + 2], 'slime', (sx, sy) => Math.abs(sx - bx) < .7 && Math.abs(sy - by) < .7, () => 7, { outline: false });
    });
    f.stamp(['YY.', 'Y..'], 11.5, 23); f.stamp(['Y'], 10, 26.5);
    // Gota del costado (cae en el gesto).
    const dy = st.drip * 7;
    if (st.drip < .95) f.fill([31, 32, 37, 42], 'slime', inEllipse(33.6, 35.5 + dy, 1.6, 2.2), (sx, sy) => (sx < 33.6 ? 6 : 4));
    // Frasquito-sombrero con poción rosada.
    f.save(); f.rotate(st.hat, 20, 20);
    f.fill([14, 13, 26, 22], 'glass', inEllipse(20, 18, 4.6, 3.6), (sx, sy) => 5 - Math.abs(sx - 20) * .35);
    f.fill([15, 17, 25, 22], 'pink', (sx, sy) => inEllipse(20, 18, 3.6, 2.6)(sx, sy) && sy > 18, (sx, sy) => (sy < 19 ? 5 : 3), { outline: false });
    f.fill([17, 11, 23, 15], 'glass', (sx, sy) => sy >= 12.5 && sy < 15 && Math.abs(sx - 20) < 1.9, () => 5);
    f.fill([16, 9, 24, 13], 'wood', (sx, sy) => sy >= 10 && sy < 12.6 && Math.abs(sx - 20) < 2.6, (sx, sy) => (sy < 11 ? 7 : 5) - (sx - 20) * .3);
    f.stamp(['w'], 18, 17); f.restore();
    drawFace(f, SPECS.slime, st);
    drawArms(f, 'slime', st);
    f.restore(); f.restore();
  }

  // ——— Accesorios en pixel (mismas ranuras: cabeza, cara, cuello, mano) ———
  const ACCESORIOS = {
    sombrero: { slot: 'cabeza', rows: ['.....P...', '....Plp..', '....Pph..', '...Pplpp.', '...PpppP.', '..PggggPP', 'PPPPPPPPP'] },
    birrete: { slot: 'cabeza', rows: ['...nnnnn....', 'nnnNNNNNnnn.', '..nnnnnnn.g.', '...nnnnn..g.', '..........G.'] },
    corona: { slot: 'cabeza', rows: ['.h...h...h.', '.g..ggg..g.', '.gg.ggg.gg.', '.ggggggggg.', '.GgcgggUgG.', '.GGGGGGGGG.'] },
    gorro: { slot: 'cabeza', rows: ['...ee...', '..eeee..', '..cccc..', '.cCcccc.', '.cccccc.', 'eEeEeEee'] },
    flor: { slot: 'cabeza', rows: ['...f.', '..fFf', '...fx', '...x.'] },
    lentes: { slot: 'cara', rows: ['.ttt...ttt.', 't.Z.tttZ..t', 't...t.t...t', '.ttt...ttt.'] },
    lentesSol: { slot: 'cara', rows: ['sssssssssss', 'sSssssSsss.', '.sss...sss.'] },
    monoculo: { slot: 'cara', rows: ['.......ggg.', '......gZ..g', '......g...g', '.......ggg.', '..........g', '.........g.'] },
    corbatin: { slot: 'cuello', rows: ['cc.cc', 'cCcCc', 'cc.cc'] },
    bufanda: { slot: 'cuello', rows: ['uuUuuUuuUuu', '.uuuuuuuuu.', '......uU...', '......uu...', '......e.e..'] },
    collar: { slot: 'cuello', rows: ['g.......g', '.g.....g.', '..ggvgg..', '....V....', '....v....'] },
    lupa: { slot: 'mano', rows: ['.ggg.', 'gZ..g', 'g...g', '.ggg.', '..t..', '.t...', 't....'] },
    varita: { slot: 'mano', rows: ['...y.', '..yYy', '...y.', '..t..', '.t...', 't....'] },
    taza: { slot: 'mano', rows: ['.Z.Z.', '..Z..', 'mmmmm.', 'mMMMmm', 'mcccm.m', 'mmmmmm.', '.mmmm..'] }
  };
  const NOMBRES = { sombrero: 'Sombrero de mago', birrete: 'Birrete', corona: 'Corona', gorro: 'Gorro de lana', flor: 'Flor',
    lentes: 'Lentes redondos', lentesSol: 'Lentes de sol', monoculo: 'Monóculo', corbatin: 'Corbatín', bufanda: 'Bufanda', collar: 'Collar de gema',
    lupa: 'Lupa', varita: 'Varita', taza: 'Taza de té' };

  // ——— Dibujo completo de un cuadro ———
  const DRAW = { matraz: drawMatraz, atomo: drawAtomo, slime: drawSlime };
  function render(ctx, kind, st) {
    const f = new Frame();
    f.save(); f.translate(0, -Math.round(st.hop || 0)); f.rotate(st.rootTilt || 0, 20, 43);
    DRAW[kind](f, st);
    // Accesorios: siguen la pose del cuerpo (el ancla se transforma; el dibujo queda nítido).
    const sp = SPECS[kind];
    Object.values(st.outfit || {}).forEach(id => {
      const a = ACCESORIOS[id]; if (!a) return;
      const [x, y] = sp.slots[a.slot];
      const lift = kind === 'atomo' ? -Math.round(st.lift) : kind === 'slime' ? -Math.round(st.lift) : 0;
      f.save(); f.translate(0, lift);
      if (kind === 'matraz' && a.slot === 'cabeza') f.translate(0, -Math.round(st.cork));
      f.rotate(st.bodyTilt, 20, 42); f.scale(st.sx, st.sy, 20, 42);
      f.stamp(a.rows, x, y, { anchor: a.slot === 'cabeza' ? 'bottom' : 'center' });
      f.restore();
    });
    f.restore();
    ctx.putImageData(f.toImageData(ctx), 0, 0);
  }

  // ——— Efectos y objetos en pixel (corazón, notas, !, ?, 6, 7, lágrima, z, estrella, libros, bombilla) ———
  const FX = {
    heart: ['.RR.RR.', 'RqRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'],
    note: ['..kkk', '..k.k', '..k.k', 'kkk.k', 'kkkkk', 'kk..'],
    bang: ['kk', 'yk', 'yk', 'yk', '..', 'yk'],
    quest: ['.kkk.', 'k..yk', '...yk', '..yk.', '..k..', '.....', '..y..'],
    six: ['.kkkk.', 'kyyyyk', 'kyk...', 'kyyyyk', 'kykkyk', 'kyyyyk', '.kkkk.'],
    seven: ['kkkkkk', 'kyyyyk', 'kkkyk.', '..kyk.', '.kyk..', '.kyk..', '.kkk..'],
    tear: ['.z.', 'zZz', 'zzz', '.z.'],
    zz: ['zzzz', '..z.', '.z..', 'zzzz'],
    star: ['..y..', '.yYy.', 'yYYYy', '.yYy.', '..y..'],
    steam: ['.e.', 'eEe', '.e.'],
    anger: ['1.1', '.1.', '1.1'],
    bookA: ['..aaaaaaa.', '.aAAAAAAdD', '.aAgAAAAdD', '.aAAgAAAdD', '.aAgggAAdD', '.aAAAAAAdD', '.aAAAAAAdD', '.aaaaaaaa.', '..c.......', '..c.......'],
    bookB: ['..JJJJJJJ.', '.JjjjjjjdD', '.JjgjjjjdD', '.JjjgjjjdD', '.Jjgggjjd D', '.JjjjjjjdD', '.JjjjjjjdD', '.JJJJJJJJ.', '..c.......'],
    open: ['aaaaaaa.aaaaaaa', 'aDDDDDDkDDDDDDa', 'aDciiiDkDD.k.Da', 'aDiiiiDkD.k.kDa', 'aDiiiiDkDk.k.Da', 'aDiiiDDkD.k.kDa', 'aDDDDDDkDDDDDDa', '.aaaaaaaaaaaaa.', '.......c.......'],
    bulb: ['..YYY..', '.YhhhY.', 'YhyoyhY', 'Yhy.yhY', '.YhyhY.', '..EEE..', '..eEe..', '...E...']
  };
  function sprite(rows, scale = 1) {
    const h = rows.length, w = Math.max(...rows.map(r => r.length)), c = document.createElement('canvas');
    c.width = w * scale; c.height = h * scale; const x = c.getContext('2d');
    rows.forEach((row, ry) => [...row].forEach((ch, rx) => { if (!INK[ch]) return; x.fillStyle = INK[ch]; x.fillRect(rx * scale, ry * scale, scale, scale); }));
    return c;
  }

  // Poses: t = tiempo (s), ph = fase de caminata. Coordenadas relativas a cada hombro (izquierdo, derecho) mirando a la derecha.
  function armPose(name, t = 0, ph = 0) {
    const w = Math.sin(t * Math.PI * 2 * 2.3);                    // six seven: 2,3 vaivenes por segundo
    switch (name) {
      case 'walk': return [{ h: [-3, 5 - 1.6 * Math.sin(ph)] }, { h: [3, 5 + 1.6 * Math.sin(ph)] }];
      case 'sixseven': return [{ e: [-2.5, 1], h: [-5, -1 + 3.2 * w] }, { e: [2.5, 1], h: [5, -1 - 3.2 * w] }];
      case 'dab': return [{ e: [6.5, -2.5], h: [10.5, -6] }, { e: [4, -4], h: [8, -8] }];
      case 'wave': return [{ h: [-3, 5] }, { e: [3, -1], h: [4 + 1.6 * Math.sin(t * 16), -7] }];
      case 'dance': return [{ h: [-4, -5 + 3 * Math.sin(t * 13.8)] }, { h: [4, -5 - 3 * Math.sin(t * 13.8)] }];
      case 'up': return [{ h: [-4, -8] }, { h: [4, -8] }];
      case 'carry': return [{ e: [-1.5, -5], h: [4, -11] }, { e: [1.5, -5], h: [-4, -11] }];
      case 'read': return [{ h: [9, 2] }, { h: [6, 3] }];
      case 'cry': return [{ e: [1, -1], h: [5, -3 + .5 * Math.sin(t * 20)] }, { e: [-1, -1], h: [-5, -3 + .5 * Math.sin(t * 20 + 1)] }];
      case 'fists': return [{ h: [-3 + .8 * Math.sin(t * 40), -3] }, { h: [3 + .8 * Math.sin(t * 40 + 1), -3] }];
      case 'fiddle': return [{ h: [6 + .7 * Math.sin(t * 12), 3] }, { h: [-6 - .7 * Math.sin(t * 12), 3] }];
      case 'scratch': return [{ h: [-3, 5] }, { e: [3, -5], h: [-1 + .8 * Math.sin(t * 18), -11] }];
      case 'cheeks': return [{ h: [5, 0] }, { h: [-5, 0] }];
      case 'sleep': return [{ h: [6, 4] }, { h: [-6, 4] }];
      default: return [{ h: [-3, 5 + .4 * Math.sin(t * 2)] }, { h: [3, 5 + .4 * Math.sin(t * 2 + 1)] }];
    }
  }
  window.PixelMascotas = Object.freeze({ W, H, render, armPose, SPECS, EXPRESSIONS: Object.keys(EXPRESSIONS), ACCESORIOS, NOMBRES, FX, sprite, RAMPS,
    SLOTS: ['cabeza', 'cara', 'cuello', 'mano'], list: [['matraz', 'Matraz'], ['atomo', 'Átomo'], ['slime', 'Slime']] });
})();
