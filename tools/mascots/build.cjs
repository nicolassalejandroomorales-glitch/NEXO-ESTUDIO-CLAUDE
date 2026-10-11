// Generador de mascotas Rive (docs/mascota/SPEC.md).
// Lee la definición de cada especie (partes con pivote + trazos estilo SVG en coordenadas del artboard)
// y escribe RML en rive/mascotas/. Luego compila con la Rive CLI oficial.
//   node tools/mascots/build.cjs            → genera RML, verifica y saca captura (build/*.png)
//   node tools/mascots/build.cjs --no-rive  → solo genera el RML
//   node tools/mascots/build.cjs --ver=Capibara → captura de otra especie (nombre del artboard)
//   node tools/mascots/build.cjs --estado=Alcanzar --advance=45 → captura de prueba de un cuadro (no usar para la app)
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'rive', 'mascotas');
const SPECIES = ['raptor', 'capibara', 'zorro'];
const HEADROOM = 80;

// ——— Ids: un solo espacio de nombres por documento ———
let nextId = 10;
const newId = () => `0:${nextId++}`;

// ——— Trazos estilo SVG (M L C Q Z, absolutos) → vértices Rive ———
function parsePath(d) {
  const tokens = d.match(/[MLCQZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  const subpaths = [];
  let cur = null, i = 0, cmd = null;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[MLCQZ]/i.test(tokens[i])) cmd = tokens[i++].toUpperCase();
    if (cmd === 'M') { cur = { start: [num(), num()], segs: [], closed: false }; subpaths.push(cur); cmd = 'L'; }
    else if (cmd === 'L') cur.segs.push({ to: [num(), num()] });
    else if (cmd === 'C') cur.segs.push({ c1: [num(), num()], c2: [num(), num()], to: [num(), num()] });
    else if (cmd === 'Q') {
      const q = [num(), num()], to = [num(), num()];
      const from = cur.segs.length ? cur.segs[cur.segs.length - 1].to : cur.start;
      cur.segs.push({ c1: [from[0] + 2 / 3 * (q[0] - from[0]), from[1] + 2 / 3 * (q[1] - from[1])],
        c2: [to[0] + 2 / 3 * (q[0] - to[0]), to[1] + 2 / 3 * (q[1] - to[1])], to });
    } else if (cmd === 'Z') { cur.closed = true; cmd = null; }
    else throw new Error('Trazo no soportado: ' + d);
  }
  return subpaths;
}
const near = (a, b) => Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01;
function toVertices(sub, origin) {
  // Ancla i: punto; mango de salida = c1 del tramo que sale; mango de entrada = c2 del tramo que llega.
  const anchors = [{ p: sub.start }];
  sub.segs.forEach(seg => {
    anchors[anchors.length - 1].out = seg.c1;
    anchors.push({ p: seg.to, in: seg.c2 });
  });
  if (sub.closed && anchors.length > 1 && near(anchors[0].p, anchors[anchors.length - 1].p)) {
    const last = anchors.pop();
    anchors[0].in = last.in;
  }
  const r = v => Math.round(v * 1000) / 1000;
  return anchors.map(a => {
    const x = r(a.p[0] - origin[0]), y = r(a.p[1] - origin[1]);
    if (!a.in && !a.out) return `<StraightVertex x="${x}" y="${y}"/>`;
    const polar = h => h ? [Math.atan2(h[1] - a.p[1], h[0] - a.p[0]), Math.hypot(h[0] - a.p[0], h[1] - a.p[1])] : [0, 0];
    const [ir, id] = polar(a.in), [or, od] = polar(a.out);
    return `<CubicDetachedVertex x="${x}" y="${y}" inRotation="${r(ir)}" inDistance="${r(id)}" outRotation="${r(or)}" outDistance="${r(od)}"/>`;
  });
}
// Sentido de giro (y crece hacia abajo): área con signo > 0 → horario.
function clockwise(sub) {
  const pts = [sub.start, ...sub.segs.map(s => s.to)];
  let a = 0;
  for (let k = 0; k < pts.length; k++) { const p = pts[k], q = pts[(k + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
  return a > 0;
}

// ——— Pintura ———
const argb = (hex, alpha = 1) => {
  const h = hex.replace('#', '');
  return (Math.round(alpha * 255).toString(16).padStart(2, '0') + h).toUpperCase();
};
function paint(shape, origin) {
  let out = '';
  // Dentro de un Shape, la ÚLTIMA pintura queda encima: relleno primero, contorno después.
  if (shape.fill) {
    const f = shape.fill;
    if (typeof f === 'string') out += `<Fill name="Fill"><SolidColor colorValue="${argb(f, shape.fillAlpha ?? 1)}" name="C"/></Fill>`;
    else {
      const [x1, y1, x2, y2] = f.line.map((v, k) => v - origin[k % 2]);
      out += `<Fill name="Fill"><LinearGradient startX="${x1}" startY="${y1}" endX="${x2}" endY="${y2}" name="G">` +
        f.stops.map(([pos, c]) => `<GradientStop colorValue="${argb(c)}" position="${pos}"/>`).join('') + '</LinearGradient></Fill>';
    }
  }
  if (shape.stroke) out += `<Stroke thickness="${shape.stroke.width}" cap="round" join="round" name="Line"><SolidColor colorValue="${argb(shape.stroke.color, shape.stroke.alpha ?? 1)}" name="C"/></Stroke>`;
  return out;
}
function shapeRml(shape, origin, siblings = []) {
  const geo = shape.ellipse ? (() => {
    const [cx, cy, rx, ry] = shape.ellipse;
    return { x: cx - origin[0], y: cy - origin[1], body: `<Ellipse width="${rx * 2}" height="${ry * 2}" originX="0.5" originY="0.5" name="Path"/>` };
  })() : { x: 0, y: 0, body: parsePath(shape.d).map(sub =>
    `<PointsPath isClosed="${sub.closed}" isClockwise="${clockwise(sub)}" name="Path">${toVertices(sub, origin).join('')}</PointsPath>`).join('') };
  const id = shape.rid ? ` id="${shape.rid}"` : '';
  // clip: nombre de una forma hermana que recorta a esta (rayas que no se salen del contorno).
  const source = shape.clip && siblings.find(s => s.name === shape.clip);
  if (shape.clip && !source) throw new Error(`Recorte: no existe la forma ${shape.clip}`);
  const clip = source ? `<ClippingShape sourceId="${source.rid}" name="Recorte"/>` : '';
  return `<Shape x="${geo.x}" y="${geo.y}" name="${shape.name}"${id}>${geo.body}${paint(shape, [origin[0] + geo.x, origin[1] + geo.y])}${clip}</Shape>`;
}

// ——— Partes (Node con pivote) ———
// La definición va de ATRÁS hacia ADELANTE; Rive dibuja primero lo que se declara primero, así que se invierte.
// Orden dentro de una parte: partes con behind:true → formas → partes → ranuras (las ranuras quedan encima de su parte).
// Ranura (slot): Node vacío pegado a una parte, para accesorios futuros. Si trae "prop", lleva un Solo con opciones
// (la primera es la vacía) que las animaciones pueden cambiar.
function slotRml(slot, pivot, registry) {
  slot.rid = newId();
  registry[slot.name] = slot;
  const [x, y] = [slot.at[0] - pivot[0], slot.at[1] - pivot[1]];
  let inner = '';
  if (slot.prop) {
    const p = slot.prop;
    p.rid = newId();
    p.options.forEach(o => { o.rid = newId(); (o.shapes || []).forEach(sh => { if (o.shapes.some(x => x.clip === sh.name)) sh.rid = newId(); }); });
    registry[p.name] = p;
    const opts = p.options.map(o => `<Node name="${o.name}" id="${o.rid}">${(o.shapes || []).map(sh => shapeRml(sh, slot.at, o.shapes)).reverse().join('')}</Node>`).join('');
    inner = `<Solo activeComponentId="${p.options[0].rid}" name="${p.name}" id="${p.rid}">${opts}</Solo>`;
  }
  return `<Node x="${x}" y="${y}" name="${slot.name}" id="${slot.rid}">${inner}</Node>`;
}
// ——— Extremidad de fideo (rubber hose) ———
// Una curva con dos vértices: hombro/cadera (fijo, = pivote de la parte) y mano/tobillo (se anima).
// Trazo de tinta grueso + trazo de color encima. En la punta, un Node (guante o zapato) que sigue la curva.
// Pose = { to: [x, y] (coordenadas del dibujo), bend: curvatura (fracción del largo; + dobla hacia un lado, − hacia el otro), tilt }.
function noodleGeometry(part, pose) {
  const [sx, sy] = part.pivot, ex = pose.to[0] - sx, ey = pose.to[1] - sy;
  const L = Math.hypot(ex, ey) || 1, nx = -ey / L, ny = ex / L, b = (pose.bend || 0) * L;
  const c1 = [ex / 3 + nx * b, ey / 3 + ny * b], c2 = [ex * 2 / 3 + nx * b, ey * 2 / 3 + ny * b];
  const ang = (x, y) => Math.atan2(y, x);
  return {
    ex, ey,
    outRotation: ang(c1[0], c1[1]), outDistance: Math.hypot(c1[0], c1[1]),
    inRotation: ang(c2[0] - ex, c2[1] - ey), inDistance: Math.hypot(c2[0] - ex, c2[1] - ey),
    // El guante apunta en la dirección en que llega la curva; el zapato queda plano (+ tilt).
    endRotation: part.noodle.end?.rotate === false ? (pose.tilt || 0) : ang(ex - c2[0], ey - c2[1]) + (pose.tilt || 0)
  };
}
function noodleRml(part, parentPivot, registry) {
  const n = part.noodle, g = noodleGeometry(part, n);
  part.rid = newId(); part.v1 = newId(); part.v2 = newId();
  part.rest = { x: part.pivot[0] - parentPivot[0], y: part.pivot[1] - parentPivot[1] };
  registry[part.name] = part;
  const r = v => Math.round(v * 1000) / 1000;
  let end = '';
  if (n.end) {
    const e = n.end;
    e.rid = newId();
    registry[e.name] = e;
    const shapes = (e.shapes || []).map(sh => shapeRml(sh, [0, 0], e.shapes));
    const slots = (e.slots || []).map(sl => slotRml(sl, [0, 0], registry));
    const sc = e.scale ? ` scaleX="${e.scale}" scaleY="${e.scale}"` : '';
    end = `<Node x="${r(g.ex)}" y="${r(g.ey)}" rotation="${r(g.endRotation)}"${sc} name="${e.name}" id="${e.rid}">${[...shapes, ...slots].reverse().join('')}</Node>`;
  }
  const path = `<PointsPath isClosed="false" name="Path"><CubicDetachedVertex x="0" y="0" inRotation="0" inDistance="0" outRotation="${r(g.outRotation)}" outDistance="${r(g.outDistance)}" id="${part.v1}"/>` +
    `<CubicDetachedVertex x="${r(g.ex)}" y="${r(g.ey)}" inRotation="${r(g.inRotation)}" inDistance="${r(g.inDistance)}" outRotation="0" outDistance="0" id="${part.v2}"/></PointsPath>`;
  const strokes = `<Stroke thickness="${n.width + n.inkWidth * 2}" cap="round" join="round" name="Tinta"><SolidColor colorValue="${argb(n.ink)}" name="C"/></Stroke>` +
    `<Stroke thickness="${n.width}" cap="round" join="round" name="Color"><SolidColor colorValue="${argb(n.color)}" name="C"/></Stroke>`;
  return `<Node x="${part.rest.x}" y="${part.rest.y}" name="${part.name}" id="${part.rid}">${end}<Shape name="${part.name}Trazo">${path}${strokes}</Shape></Node>`;
}

function partRml(part, parentPivot, registry) {
  if (part.noodle) return noodleRml(part, parentPivot, registry);
  part.rid = newId();
  part.rest = { x: part.pivot[0] - parentPivot[0], y: part.pivot[1] - parentPivot[1] };
  registry[part.name] = part;
  const shapes = part.shapes || [], kids = part.parts || [];
  shapes.forEach(s => { if (shapes.some(o => o.clip === s.name)) s.rid = newId(); });
  const inner = [
    ...kids.filter(k => k.behind).map(c => partRml(c, part.pivot, registry)),
    ...shapes.map(s => shapeRml(s, part.pivot, shapes)),
    ...kids.filter(k => !k.behind).map(c => partRml(c, part.pivot, registry)),
    ...(part.slots || []).map(sl => slotRml(sl, part.pivot, registry))
  ];
  const sc = part.scale ? ` scaleX="${part.scale}" scaleY="${part.scale}"` : '';
  return `<Node x="${part.rest.x}" y="${part.rest.y}"${sc} name="${part.name}" id="${part.rid}">${inner.reverse().join('')}</Node>`;
}

// ——— Animaciones ———
// tracks: { parte: { rotation|x|y|scaleX|scaleY|opacity: [[frame, valor, ease?], ...] }, prop: { active: [[frame, 'Opción']] } }
// x e y son DESPLAZAMIENTOS desde la posición de reposo (más fácil de leer y reutilizar).
const KEYS = { x: 13, y: 14, rotation: 15, scaleX: 16, scaleY: 17, opacity: 18, active: 296 };
const EASE = { inOut: [0.42, 0, 0.58, 1], out: [0, 0, 0.58, 1], in: [0.42, 0, 1, 1], soft: [0.37, 0, 0.63, 1] };
// pose (solo extremidades de fideo): [[frame, { to, bend, tilt }, ease?], ...] → anima los vértices de la curva y el guante/zapato.
const VKEYS = { x: 24, y: 25, inRotation: 84, inDistance: 85, outRotation: 86, outDistance: 87 };
function keyframe(frame, v, ease) {
  const [x1, y1, x2, y2] = EASE[ease];
  return `<KeyFrameDouble value="${Math.round(v * 10000) / 10000}" frame="${frame}" interpolationType="cubic"><CubicEaseInterpolator x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></KeyFrameDouble>`;
}
function poseRml(part, frames) {
  const geo = frames.map(([frame, pose, ease = 'soft']) => ({ frame, ease, g: noodleGeometry(part, { bend: part.noodle.bend, ...pose }) }));
  const track = (key, pick) => `<KeyedProperty propertyKey="${key}">${geo.map(({ frame, ease, g }) => keyframe(frame, pick(g), ease)).join('')}</KeyedProperty>`;
  // El ángulo del guante no debe dar la vuelta larga entre -π y π.
  let prev = null;
  geo.forEach(({ g }) => { if (prev !== null) { while (g.endRotation - prev > Math.PI) g.endRotation -= 2 * Math.PI; while (g.endRotation - prev < -Math.PI) g.endRotation += 2 * Math.PI; } prev = g.endRotation; });
  return `<KeyedObject objectId="${part.v1}">${track(VKEYS.outRotation, g => g.outRotation)}${track(VKEYS.outDistance, g => g.outDistance)}</KeyedObject>` +
    `<KeyedObject objectId="${part.v2}">${track(VKEYS.x, g => g.ex)}${track(VKEYS.y, g => g.ey)}${track(VKEYS.inRotation, g => g.inRotation)}${track(VKEYS.inDistance, g => g.inDistance)}</KeyedObject>` +
    (part.noodle.end ? `<KeyedObject objectId="${part.noodle.end.rid}">${track(13, g => g.ex)}${track(14, g => g.ey)}${track(15, g => g.endRotation)}</KeyedObject>` : '');
}
function animationRml(anim, registry) {
  anim.rid = newId();
  const objects = Object.entries(anim.tracks).map(([name, props]) => {
    const obj = registry[name];
    if (!obj) throw new Error(`Animación ${anim.name}: no existe ${name}`);
    const { pose, ...rest } = props;
    if (pose && !obj.noodle) throw new Error(`Animación ${anim.name}: ${name} no es una extremidad de fideo`);
    const poseXml = pose ? poseRml(obj, pose) : '';
    if (!Object.keys(rest).length) return poseXml;
    props = rest;
    const keyed = Object.entries(props).map(([prop, frames]) => {
      if (!(prop in KEYS)) throw new Error(`Animación ${anim.name}: propiedad desconocida ${prop}`);
      const body = frames.map(([frame, value, ease = 'soft']) => {
        if (prop === 'active') {
          const opt = obj.options.find(o => o.name === value);
          if (!opt) throw new Error(`Animación ${anim.name}: ${name} no tiene la opción ${value}`);
          return `<KeyFrameId value="${opt.rid}" frame="${frame}" interpolationType="hold"/>`;
        }
        const v = prop === 'x' || prop === 'y' ? obj.rest[prop] + value : value;
        const [x1, y1, x2, y2] = EASE[ease];
        return `<KeyFrameDouble value="${Math.round(v * 10000) / 10000}" frame="${frame}" interpolationType="cubic"><CubicEaseInterpolator x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></KeyFrameDouble>`;
      }).join('');
      return `<KeyedProperty propertyKey="${KEYS[prop]}">${body}</KeyedProperty>`;
    }).join('');
    return poseXml + `<KeyedObject objectId="${obj.rid}">${keyed}</KeyedObject>`;
  }).join('');
  return `<LinearAnimation loopValue="${anim.loop === false ? 'oneShot' : 'loop'}" duration="${anim.frames}" fps="60" name="${anim.name}" id="${anim.rid}">${objects}</LinearAnimation>`;
}

// ——— Máquina de estados "Mascota" (igual para todas las especies) ———
// Capa "Cuerpo": la app fija el número accion (ACTIONS) y la mascota pasa a esa animación con una mezcla suave.
// Capa "Ojos": parpadeo independiente, así parpadea haga lo que haga.
const ACTIONS = [['Idle', 0], ['Caminar', 1], ['Alcanzar', 2], ['Celebrar', 3]];
function stateMachineRml(spec, anims) {
  const smId = newId(), inputId = newId();
  const byName = Object.fromEntries(anims.map(a => [a.name, a]));
  const states = ACTIONS.filter(([n]) => byName[n]).map(([n, v], k) => ({ n, v, id: newId(), x: 200 * k }));
  const body = states.map(st => `<AnimationState x="${st.x}" y="100" animationId="${byName[st.n].rid}" id="${st.id}">` +
    states.filter(o => o !== st).map(o => `<StateTransition stateToId="${o.id}" duration="220"><TransitionNumberCondition inputId="${inputId}" opValue="equal" value="${o.v}"/></StateTransition>`).join('') +
    '</AnimationState>').join('');
  // --estado=Nombre: solo para capturas de prueba (la mascota parte en ese estado).
  const wanted = (process.argv.find(x => x.startsWith('--estado=')) || '').slice(9);
  const entry = states.find(st => st.n === wanted) || states[0];
  const blink = byName.Parpadeo ? (() => { const id = newId(); return `<StateMachineLayer name="Ojos" id="${newId()}"><EntryState><StateTransition stateToId="${id}"/></EntryState><AnimationState x="0" y="100" animationId="${byName.Parpadeo.rid}" id="${id}"/></StateMachineLayer>`; })() : '';
  return { id: smId, rml: `<StateMachine name="Mascota" id="${smId}"><StateMachineNumber name="accion" value="${entry.v}" id="${inputId}"/>` +
    `<StateMachineLayer name="Cuerpo" id="${newId()}"><EntryState><StateTransition stateToId="${entry.id}"/></EntryState>${body}</StateMachineLayer>${blink}</StateMachine>` };
}

function buildSpecies(id, index) {
  const spec = require(`./${id}.cjs`);
  const registry = {};
  const artId = newId(), styleId = newId();
  // HEADROOM: espacio extra arriba (estirarse, sombreros). Todo el dibujo baja esa cantidad.
  const root = partRml(spec.root, [0, -HEADROOM], registry);
  // Las acciones del cuerpo comparten capa: si una no anima algo que otra sí, lo devuelve al reposo
  // (si no, al pasar de Caminar a Alcanzar las canillas quedarían dobladas). Los objetos (Solo) no se tocan.
  const bodyAnims = spec.animations.filter(a => ACTIONS.some(([n]) => n === a.name));
  const REST = { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 };
  const used = new Set(bodyAnims.flatMap(a => Object.entries(a.tracks).flatMap(([n, p]) => Object.keys(p).filter(k => k in REST || k === 'pose').map(k => `${n}|${k}`))));
  bodyAnims.forEach(a => used.forEach(key => {
    const [n, k] = key.split('|');
    a.tracks[n] = a.tracks[n] || {};
    if (!a.tracks[n][k]) a.tracks[n][k] = k === 'pose' ? [[0, { to: registry[n].noodle.to, bend: registry[n].noodle.bend }]] : [[0, REST[k]]];
  }));
  const anims = spec.animations.map(a => animationRml(a, registry)).join('');
  const sm = stateMachineRml(spec, spec.animations);
  return `<Artboard defaultStateMachineId="${sm.id}" styleId="${styleId}" width="${spec.width}" height="${spec.height + HEADROOM}" x="${index * (spec.width + 60)}" y="0" name="${spec.name}" id="${artId}">` +
    `<LayoutComponentStyle name="Style" id="${styleId}"/>` +
    (spec.background ? `<Fill name="Fondo"><SolidColor colorValue="${argb(spec.background)}" name="C"/></Fill>` : '') +
    root + sm.rml + anims + '</Artboard>';
}

fs.mkdirSync(OUT, { recursive: true });
const rml = `<Rive version="1" kind="fragment">\n${SPECIES.map(buildSpecies).join('\n')}\n</Rive>\n`;
fs.writeFileSync(path.join(OUT, 'scene.rml'), rml);
fs.writeFileSync(path.join(OUT, 'rive.yaml'), 'name: mascotas\n');
console.log(`RML: ${path.relative(ROOT, path.join(OUT, 'scene.rml'))} (${(rml.length / 1024).toFixed(1)} KB)`);

if (!process.argv.includes('--no-rive')) {
  const rive = path.join(process.env.USERPROFILE || '', '.rive', 'bin', 'rive.exe');
  const run = args => execFileSync(rive, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  try { run(['rive/mascotas', '--verify']); console.log('Rive: verificado sin errores'); }
  catch (e) { console.error(e.stdout, e.stderr); process.exit(1); }
  const frame = process.argv.find(a => a.startsWith('--advance=')) || '--advance=1';
  const ver = process.argv.find(a => a.startsWith('--ver='));
  run(['rive/mascotas', '--screenshot', frame, ...(ver ? ['--artboard=' + ver.slice(6)] : [])]);
  console.log('Captura: rive/mascotas/build/mascotas.png');
  run(['rive/mascotas', '--once']);
  const dest = path.join(ROOT, 'dist', 'assets', 'mascotas');
  fs.mkdirSync(dest, { recursive: true });
  fs.copyFileSync(path.join(OUT, 'build', 'mascotas.riv'), path.join(dest, 'mascotas.riv'));
  console.log('Runtime: dist/assets/mascotas/mascotas.riv');
}
