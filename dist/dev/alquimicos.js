/* Mascotas alquímicas (prototipo de diseño, docs/mascota/SPEC.md · Fase 4): matraz, átomo y slime.
   Cada SVG trae sus partes con clase (m-root, m-body, m-face, m-eye, m-liquid, m-bubbles, m-foot-l/r…) para animarlas con CSS.
   Detalle: volumen con luz (luz/medio/sombra + reflejo cálido de la ventana), materiales, detalles con historia y sombra de contacto. */
(() => {
  'use strict';
  const INK = '#3b2418';
  let n = 0;
  const S = (w, c = INK) => `stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const defsCommon = id => `
    <filter id="${id}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
    <filter id="${id}b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="${id}b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="${id}grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="7" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 .3  0 0 0 0 .2  0 0 0 0 .12  0 0 0 .2 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <filter id="${id}ink" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="d"/>
      <feFlood flood-color="${INK}"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <radialGradient id="${id}iris" cx=".45" cy=".3" r=".75"><stop offset="0" stop-color="#6b4a32"/><stop offset=".55" stop-color="#24150c"/><stop offset="1" stop-color="#0c0704"/></radialGradient>
    <radialGradient id="${id}bub" cx=".33" cy=".28" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".3" stop-color="#fff" stop-opacity=".22"/><stop offset=".85" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></radialGradient>`;
  const sparkle = (x, y, s, col = '#fff3c8', op = 1, cls = '') => `<path class="${cls}" d="M${x} ${y - s} Q${x + s * .15} ${y - s * .15} ${x + s} ${y} Q${x + s * .15} ${y + s * .15} ${x} ${y + s} Q${x - s * .15} ${y + s * .15} ${x - s} ${y} Q${x - s * .15} ${y - s * .15} ${x} ${y - s} Z" fill="${col}" opacity="${op}"/>`;
  const bubble = (id, x, y, r, blur) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}bub)" stroke="#fff" stroke-opacity=".6" stroke-width="1.1"${blur ? ` filter="url(#${id}b1)"` : ''}/>`;

  // Cara: ojos de varias capas (iris con degradado, reflejo de la ventana, dos brillos, párpado) + mejillas difuminadas + boca.
  function face(id, x, y, gap, r, { mouth = 'smile', blush = '#f48f86', tongue = '#e0675c' } = {}) {
    const eye = ex => `<g class="m-eye" style="transform-origin:${ex}px ${y}px"><g class="m-gaze">` +
      `<ellipse cx="${ex}" cy="${y}" rx="${r * .82}" ry="${r}" fill="url(#${id}iris)" ${S(1.6, '#1a0f08')}/>` +
      `<path d="M${ex - r * .55} ${y + r * .35} C${ex - r * .3} ${y + r * .85} ${ex + r * .35} ${y + r * .85} ${ex + r * .6} ${y + r * .3}" fill="none" stroke="#a07850" stroke-width="${r * .22}" stroke-linecap="round" opacity=".5"/>` +
      `<rect x="${ex + r * .05}" y="${y - r * .72}" width="${r * .5}" height="${r * .55}" rx="${r * .12}" fill="#fff" opacity=".95" transform="rotate(12 ${ex + r * .3} ${y - r * .45})"/>` +
      `<circle cx="${ex - r * .3}" cy="${y + r * .38}" r="${r * .13}" fill="#fff" opacity=".9"/>` +
      `<path d="M${ex - r * .9} ${y - r * .55} C${ex - r * .45} ${y - r * 1.18} ${ex + r * .45} ${y - r * 1.18} ${ex + r * .9} ${y - r * .55}" fill="none" ${S(2.1)}/></g></g>`;
    // ——— Variantes de ojos y bocas: todas se dibujan y setExpression() muestra solo las de la expresión activa. ———
    const both = f => f(x - gap) + f(x + gap);
    const EYES = {
      normal: both(eye),
      feliz: both(ex => `<path d="M${ex - r * .8} ${y + r * .25} Q${ex} ${y - r * 1.05} ${ex + r * .8} ${y + r * .25}" fill="none" ${S(3.2)}/>`),
      dormido: both(ex => `<path d="M${ex - r * .8} ${y - r * .05} Q${ex} ${y + r * .75} ${ex + r * .8} ${y - r * .05}" fill="none" ${S(3)}/>` +
        `<path d="M${ex + r * .55} ${y + r * .25} l${r * .25} ${r * .15} M${ex - r * .55} ${y + r * .25} l${-r * .25} ${r * .15}" ${S(1.6)}/>`),
      sorpresa: both(ex => `<g class="m-gaze"><ellipse cx="${ex}" cy="${y}" rx="${r * .95}" ry="${r * 1.12}" fill="#fffdf6" ${S(2.2)}/>` +
        `<circle cx="${ex}" cy="${y + r * .1}" r="${r * .42}" fill="url(#${id}iris)"/><circle cx="${ex + r * .14}" cy="${y - r * .08}" r="${r * .14}" fill="#fff"/></g>`),
      concentrado: both(ex => `<g transform="translate(0 ${y * .28}) scale(1 .72)">${eye(ex)}</g>` +
        `<path d="M${ex - r * .95} ${y - r * .45} L${ex + r * .95} ${y - r * .6}" ${S(2.4)}/>`),
      // Cejas sobre los ojos normales: tristes (suben hacia el centro) o enojadas (bajan hacia el centro).
      triste: both(ex => eye(ex) + `<path d="M${ex - r * .95} ${y - r * 1.35} L${ex + r * .7} ${y - r * 1.75}" ${S(2.6)} transform="${ex < x ? '' : `scale(-1 1) translate(${-2 * ex} 0)`}"/>`),
      enojado: both(ex => eye(ex) + `<path d="M${ex - r * .9} ${y - r * 1.75} L${ex + r * .75} ${y - r * 1.3}" ${S(2.8)} transform="${ex < x ? '' : `scale(-1 1) translate(${-2 * ex} 0)`}"/>`),
      estrellas: both(ex => `<g transform="translate(${ex} ${y})"><path d="M0 ${-r * 1.1} L${r * .3} ${-r * .35} L${r * 1.05} ${-r * .3} L${r * .45} ${r * .15} L${r * .65} ${r * .95} L0 ${r * .5} L${-r * .65} ${r * .95} L${-r * .45} ${r * .15} L${-r * 1.05} ${-r * .3} L${-r * .3} ${-r * .35} Z" fill="#ffd34d" ${S(1.8)}/>` +
        `<circle cx="${-r * .2}" cy="${-r * .35}" r="${r * .18}" fill="#fff"/></g>`),
      amor: both(ex => `<g transform="translate(${ex} ${y})"><path d="M0 ${r * .9} C${-r * 1.2} 0 ${-r * 1.1} ${-r * 1.05} ${-r * .45} ${-r * .95} C${-r * .15} ${-r * .9} 0 ${-r * .7} 0 ${-r * .5} C0 ${-r * .7} ${r * .15} ${-r * .9} ${r * .45} ${-r * .95} C${r * 1.1} ${-r * 1.05} ${r * 1.2} 0 0 ${r * .9} Z" fill="#ff5d7a" ${S(2)}/>` +
        `<ellipse cx="${-r * .42}" cy="${-r * .5}" rx="${r * .22}" ry="${r * .14}" fill="#fff" opacity=".85"/></g>`)
    };
    const open = (k = 1) => `<path d="M${x - r * .62 * k} ${y + r * .95} C${x - r * .48 * k} ${y + r * (.95 + .95 * k)} ${x + r * .48 * k} ${y + r * (.95 + .95 * k)} ${x + r * .62 * k} ${y + r * .95} C${x + r * .2} ${y + r * 1.1} ${x - r * .2} ${y + r * 1.1} ${x - r * .62 * k} ${y + r * .95} Z" fill="#6e211c" ${S(2.2)}/>` +
      `<ellipse cx="${x}" cy="${y + r * (.95 + .6 * k)}" rx="${r * .34 * k}" ry="${r * .17 * k}" fill="${tongue}"/>`;
    const MOUTHS = {
      sonrisa: `<path d="M${x - r * .55} ${y + r * 1.0} C${x - r * .25} ${y + r * 1.5} ${x + r * .25} ${y + r * 1.5} ${x + r * .55} ${y + r * 1.0}" fill="none" ${S(2.6)}/>`,
      abierta: open(1),
      grande: open(1.35),
      o: `<ellipse cx="${x}" cy="${y + r * 1.35}" rx="${r * .3}" ry="${r * .38}" fill="#6e211c" ${S(2.2)}/>`,
      bostezo: `<ellipse cx="${x}" cy="${y + r * 1.5}" rx="${r * .5}" ry="${r * .62}" fill="#6e211c" ${S(2.2)}/><ellipse cx="${x}" cy="${y + r * 1.85}" rx="${r * .3}" ry="${r * .16}" fill="${tongue}"/>`,
      plana: `<path d="M${x - r * .35} ${y + r * 1.2} C${x - r * .1} ${y + r * 1.32} ${x + r * .15} ${y + r * 1.32} ${x + r * .38} ${y + r * 1.18}" fill="none" ${S(2.4)}/>`,
      dormida: `<ellipse cx="${x + r * .1}" cy="${y + r * 1.25}" rx="${r * .18}" ry="${r * .22}" fill="#6e211c" ${S(1.8)}/>`,
      triste: `<path d="M${x - r * .5} ${y + r * 1.45} C${x - r * .25} ${y + r * 1.05} ${x + r * .25} ${y + r * 1.05} ${x + r * .5} ${y + r * 1.45}" fill="none" ${S(2.6)}/>`,
      ondulada: `<path d="M${x - r * .6} ${y + r * 1.3} q${r * .2} ${-r * .3} ${r * .4} 0 q${r * .2} ${r * .3} ${r * .4} 0 q${r * .2} ${-r * .3} ${r * .4} 0" fill="none" ${S(2.4)}/>`
    };
    const base = mouth === 'open' ? 'abierta' : 'sonrisa';
    const variants = (set, kind, on) => Object.entries(set).map(([k, v]) =>
      `<g class="m-x" data-${kind}="${k}"${k === on ? '' : ' style="display:none"'}>${v}</g>`).join('');
    return `<g class="m-face" data-base-mouth="${base}"><g class="m-blush" filter="url(#${id}b1)"><ellipse cx="${x - gap - r}" cy="${y + r * 1.3}" rx="${r * .78}" ry="${r * .44}" fill="${blush}" opacity=".72"/>` +
      `<ellipse cx="${x + gap + r}" cy="${y + r * 1.3}" rx="${r * .78}" ry="${r * .44}" fill="${blush}" opacity=".72"/></g>` +
      `<path d="M${x - gap - r * 1.3} ${y + r * 1.2} l2 -3 M${x - gap - r * .9} ${y + r * 1.25} l2 -3 M${x + gap + r * .7} ${y + r * 1.25} l2 -3 M${x + gap + r * 1.1} ${y + r * 1.2} l2 -3" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>` +
      variants(EYES, 'eyes', 'normal') + variants(MOUTHS, 'mouth', base) + '</g>';
  }
  // Expresiones = ojos + boca. "base" usa la boca propia de cada mascota (el slime sonríe con la boca abierta).
  const EXPRESSIONS = {
    neutral: ['normal', 'base'], feliz: ['feliz', 'grande'], sorpresa: ['sorpresa', 'o'], dormida: ['dormido', 'dormida'],
    concentrada: ['concentrado', 'plana'], amor: ['amor', 'abierta'], bostezo: ['dormido', 'bostezo'], idea: ['sorpresa', 'grande'],
    triste: ['triste', 'triste'], enojada: ['enojado', 'triste'], deslumbrada: ['estrellas', 'grande'], nerviosa: ['sorpresa', 'ondulada'],
    confundida: ['normal', 'ondulada'], picara: ['feliz', 'sonrisa']
  };
  function setExpression(svgRoot, name) {
    const face = svgRoot.querySelector('.m-face'), [e, m0] = EXPRESSIONS[name] || EXPRESSIONS.neutral;
    if (!face) return;
    const m = m0 === 'base' ? face.dataset.baseMouth : m0;
    face.querySelectorAll('[data-eyes]').forEach(g => { g.style.display = g.dataset.eyes === e ? '' : 'none'; });
    face.querySelectorAll('[data-mouth]').forEach(g => { g.style.display = g.dataset.mouth === m ? '' : 'none'; });
  }

  // ——— MATRAZ ———
  function matraz() {
    const id = 'mz' + (++n) + '_';
    const G = 'M128 76 L172 76 L172 114 C200 152 232 210 236 238 C240 262 226 274 204 274 L96 274 C74 274 60 262 64 238 C68 210 100 152 128 114 Z';
    const marks = [150, 172, 194, 216, 238].map((y, k) => `<path d="M${196 + (y - 150) * .32} ${y} l-10 0" stroke="#fff" stroke-width="1.6" opacity=".7"/>` +
      (k % 2 ? '' : `<text x="${174 + (y - 150) * .32}" y="${y + 3}" font-size="7" font-family="Georgia" fill="#fff" opacity=".7">${250 - k * 50}</text>`)).join('');
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" class="m-svg m-matraz"><defs>${defsCommon(id)}
      <clipPath id="${id}c"><path d="${G}"/></clipPath>
      <linearGradient id="${id}glass" x1="0" x2="1"><stop offset="0" stop-color="#7fa9a7" stop-opacity=".95"/><stop offset=".16" stop-color="#e9f6f4" stop-opacity=".8"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset=".84" stop-color="#b9d6d4" stop-opacity=".8"/><stop offset="1" stop-color="#6f9897" stop-opacity=".95"/></linearGradient>
      <linearGradient id="${id}liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86e6bd"/><stop offset=".3" stop-color="#45b688"/><stop offset=".75" stop-color="#25805f"/><stop offset="1" stop-color="#174f3c"/></linearGradient>
      <radialGradient id="${id}glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e2fff1" stop-opacity=".9"/><stop offset="1" stop-color="#e2fff1" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}cork" x1="0" x2="1"><stop offset="0" stop-color="#7d4f2e"/><stop offset=".35" stop-color="#cf9b6a"/><stop offset=".7" stop-color="#b07b4e"/><stop offset="1" stop-color="#5f3a22"/></linearGradient>
      <linearGradient id="${id}wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07e52"/><stop offset="1" stop-color="#6a4229"/></linearGradient></defs>
      <g class="m-shadow"><ellipse cx="150" cy="287" rx="92" ry="11" fill="#5fe0a8" opacity=".32" filter="url(#${id}b3)"/><ellipse cx="132" cy="288" rx="20" ry="3" fill="#d9ffe9" opacity=".5" filter="url(#${id}b1)"/>
        <ellipse cx="150" cy="284" rx="66" ry="6" fill="#140a05" opacity=".5" filter="url(#${id}b1)"/></g>
      <g class="m-root" style="transform-origin:150px 284px">
        <g class="m-foot-l" style="transform-origin:116px 276px"><ellipse cx="116" cy="277" rx="16" ry="8.5" fill="url(#${id}wood)" ${S(3)}/><ellipse cx="111" cy="273.5" rx="7" ry="2.6" fill="#d7a878" opacity=".8"/></g>
        <g class="m-foot-r" style="transform-origin:184px 276px"><ellipse cx="184" cy="277" rx="16" ry="8.5" fill="url(#${id}wood)" ${S(3)}/><ellipse cx="179" cy="273.5" rx="7" ry="2.6" fill="#d7a878" opacity=".8"/></g>
        <g class="m-body" style="transform-origin:150px 274px">
          <path d="${G}" fill="#eef7f5" opacity=".75"/><path d="${G}" fill="url(#${id}glass)"/>
          <g clip-path="url(#${id}c)">
            <g class="m-liquid" style="transform-origin:150px 200px">
              <path d="M30 196 C70 188 110 204 150 196 C190 188 230 204 270 196 L270 310 L30 310 Z" fill="url(#${id}liq)"/>
              <ellipse cx="150" cy="246" rx="74" ry="36" fill="url(#${id}glow)"/>
              <path d="M110 250 C130 226 168 238 160 256 C154 268 128 266 132 250" fill="none" stroke="#c9ffe6" stroke-width="3" opacity=".35"/>
              <path d="M30 196 C70 188 110 204 150 196 C190 188 230 204 270 196 L270 205 C230 213 190 197 150 205 C110 213 70 197 30 205 Z" fill="#b5f3d7"/>
              <path d="M84 199 C104 196 118 200 132 199" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>
            </g>
            <g class="m-bubbles">${bubble(id, 116, 240, 7)}${bubble(id, 178, 254, 5)}${bubble(id, 150, 224, 3.5)}${bubble(id, 198, 232, 3)}${bubble(id, 100, 258, 2.6, 1)}${bubble(id, 164, 214, 2.2)}${bubble(id, 136, 262, 4, 1)}
              ${sparkle(130, 256, 3.2, '#efffF6', .9)}${sparkle(188, 216, 2.4, '#efffF6', .8)}<circle cx="170" cy="236" r="1.4" fill="#fff" opacity=".9"/><circle cx="122" cy="226" r="1.1" fill="#fff" opacity=".8"/></g>
            <path d="${G}" fill="none" stroke="#0f3a2c" stroke-width="10" opacity=".25"/>
            <path d="${G}" fill="none" stroke="#fff" stroke-width="7" opacity=".2" transform="translate(2 1)"/>
            <ellipse cx="150" cy="271" rx="80" ry="9" fill="#fff" opacity=".24"/>
            <path d="M204 194 C218 214 226 234 228 252" stroke="#ffd28a" stroke-width="7" stroke-linecap="round" opacity=".55" filter="url(#${id}b1)"/>
            <rect width="300" height="300" filter="url(#${id}grain)" opacity=".55"/>
          </g>
          ${marks}
          <g opacity=".85">${[[112, 150, 2.4], [106, 166, 1.6], [186, 142, 2], [192, 160, 1.4], [120, 134, 1.3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".35" ${S(.8, '#cfe6e4')}/><circle cx="${x - r * .3}" cy="${y - r * .35}" r="${r * .35}" fill="#fff"/>`).join('')}</g>
          <path d="M98 160 C86 182 80 206 82 228" fill="none" stroke="#fff" stroke-width="8.5" stroke-linecap="round" opacity=".88"/>
          <path d="M104 184 C101 192 99 200 99 208" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
          <path d="M136 84 L136 110" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>
          <path d="${G}" fill="none" ${S(3.8)}/>
          <rect x="122" y="70" width="56" height="10" rx="5" fill="#e3f1f0" fill-opacity=".85" ${S(3)}/><path d="M128 73 L150 73" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          <g class="m-cork" style="transform-origin:150px 76px">
            <path d="M121 50 L124 78 C124 83 176 83 176 78 L179 50 Z" fill="url(#${id}cork)" ${S(3)}/>
            <ellipse cx="150" cy="50" rx="29" ry="6.5" fill="#ddb07f" ${S(3)}/><ellipse cx="146" cy="49" rx="20" ry="2.8" fill="none" stroke="#b98a5c" stroke-width="1.4"/>
            <path d="M130 58 L131 76 M158 57 L159 78 M168 59 L168 72" stroke="#6e4428" stroke-width="1.3" opacity=".7"/>
            <circle cx="140" cy="64" r="1.6" fill="#6e4428" opacity=".6"/><circle cx="164" cy="66" r="1.3" fill="#6e4428" opacity=".6"/>
            <g class="m-slot" data-slot="cabeza" data-scale="1" transform="translate(150 46) scale(1)"></g>
          </g>
          <path d="M126 101 C140 108 160 108 174 101" fill="none" stroke="#dcc28c" stroke-width="4.5"/><path d="M126 101 C140 108 160 108 174 101" fill="none" stroke="#9a7a46" stroke-width="4.5" stroke-dasharray="2 4"/>
          <g class="m-tag" style="transform-origin:172px 103px">
            <path d="M172 103 C180 110 184 118 186 126" fill="none" stroke="#c9ad74" stroke-width="2"/>
            <g transform="rotate(14 178 124)"><path d="M178 124 L208 124 L214 134 L208 144 L178 144 Z" fill="#f2e2bd" ${S(2)}/><path d="M178 140 L208 140" stroke="#dcc79c" stroke-width="2"/>
              <circle cx="208" cy="134" r="2.2" fill="#8a6a3a"/><g transform="translate(191 133)" fill="none" stroke="#7a3b22" stroke-width="1.6" stroke-linecap="round"><circle r="4"/><path d="M0 4 L0 9 M-3 7 L3 7 M-4 -7 C-3 -4 3 -4 4 -7"/></g></g>
          </g>
          ${face(id, 150, 152, 20, 11.5)}
          <g class="m-slot" data-slot="cara" data-scale="1" transform="translate(150 150) scale(1)"></g><g class="m-slot" data-slot="cuello" data-scale="0.9" transform="translate(150 104) scale(0.9)"></g><g class="m-slot" data-slot="mano" data-scale="1" transform="translate(236 236) scale(1)"></g>
        </g>
        ${sparkle(228, 76, 9, '#fff2c4', 1, 'm-twinkle')}${sparkle(74, 104, 5, '#fff2c4', .85, 'm-twinkle')}
      </g></svg>`;
  }

  // ——— ÁTOMO ———
  function atomo() {
    const id = 'at' + (++n) + '_';
    // Núcleo: racimo de protones (cálidos) y neutrones (fríos); la carita va en el más grande, al frente.
    const balls = [[118, 128, 24, 'p'], [180, 126, 24, 'n'], [112, 172, 23, 'n'], [186, 170, 23, 'p'], [150, 104, 24, 'p'], [150, 192, 23, 'n'], [150, 148, 44, 'p']];
    const ball = ([x, y, r, t]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}${t})"/>`;
    const orbit = (rot, k) => {
      const path = `M32 150 A118 40 0 1 0 268 150 A118 40 0 1 0 32 150`;
      return `<g transform="rotate(${rot} 150 150)">
        <ellipse cx="150" cy="150" rx="118" ry="40" fill="none" stroke="#7fd2ff" stroke-width="7" opacity=".28" filter="url(#${id}b3)"/>
        <ellipse cx="150" cy="150" rx="118" ry="40" fill="none" ${S(3.2)}/>
        <ellipse cx="150" cy="150" rx="118" ry="40" fill="none" stroke="#d6f2ff" stroke-width="2"/>
        <g class="m-electron"><circle r="14" fill="#7fd2ff" opacity=".45" filter="url(#${id}b3)"/><circle r="8.5" fill="url(#${id}e)" ${S(2.6)}/><circle cx="-2.6" cy="-2.8" r="2.6" fill="#fff"/>
          <animateMotion dur="${3.2 + k * .7}s" repeatCount="indefinite" begin="${-k * 1.1}s" path="${path}"/></g></g>`;
    };
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" class="m-svg m-atomo"><defs>${defsCommon(id)}
      <radialGradient id="${id}p" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffd2a8"/><stop offset=".55" stop-color="#f28a52"/><stop offset="1" stop-color="#b94f2c"/></radialGradient>
      <radialGradient id="${id}n" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#e2ecff"/><stop offset=".55" stop-color="#8fa9d8"/><stop offset="1" stop-color="#4f6699"/></radialGradient>
      <radialGradient id="${id}e" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#8ee0ff"/><stop offset="1" stop-color="#2f8fd1"/></radialGradient>
      <radialGradient id="${id}aura" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd8a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffd8a0" stop-opacity="0"/></radialGradient></defs>
      <g class="m-shadow"><ellipse cx="150" cy="286" rx="52" ry="7" fill="#140a05" opacity=".35" filter="url(#${id}b3)"/></g>
      <g class="m-root" style="transform-origin:150px 150px">
        <circle cx="150" cy="150" r="96" fill="url(#${id}aura)"/>
        <g class="m-orbits">${orbit(30, 0)}${orbit(-30, 1)}</g>
        <g class="m-body" style="transform-origin:150px 150px">
          <g filter="url(#${id}ink)">${balls.map(ball).join('')}</g>
          ${balls.slice(0, 6).map(([x, y, r]) => `<ellipse cx="${x - r * .32}" cy="${y - r * .38}" rx="${r * .32}" ry="${r * .2}" fill="#fff" opacity=".55"/>`).join('')}
          <path d="M120 120 C126 110 138 104 150 104" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>
          <circle cx="150" cy="148" r="44" fill="none" stroke="#8a3b20" stroke-width="2" opacity=".35"/>
          <text x="186" y="112" font-family="Georgia" font-size="13" font-weight="bold" fill="#fff" opacity=".9">+</text><text x="106" y="182" font-family="Georgia" font-size="13" fill="#fff" opacity=".7">·</text>
          ${face(id, 150, 146, 17, 10.5, { blush: '#ff8f7a' })}
          <g class="m-slot" data-slot="cabeza" data-scale="1.05" transform="translate(150 92) scale(1.05)"></g><g class="m-slot" data-slot="cara" data-scale="0.9" transform="translate(150 144) scale(0.9)"></g><g class="m-slot" data-slot="cuello" data-scale="0.9" transform="translate(150 196) scale(0.9)"></g><g class="m-slot" data-slot="mano" data-scale="1" transform="translate(212 196) scale(1)"></g>
        </g>
        <g class="m-orbits">${orbit(90, 2)}</g>
        ${sparkle(250, 70, 8, '#fff2c4', 1, 'm-twinkle')}${sparkle(52, 230, 5, '#cfefff', .9, 'm-twinkle')}${sparkle(246, 232, 4, '#fff2c4', .8, 'm-twinkle')}
      </g></svg>`;
  }

  // ——— SLIME ———
  function slime() {
    const id = 'sl' + (++n) + '_';
    const B = 'M150 96 C196 96 226 134 234 180 C240 214 250 238 262 254 C266 264 256 272 244 268 C234 264 228 270 222 276 L78 276 C64 276 50 268 52 254 C56 236 64 214 68 180 C76 134 104 96 150 96 Z';
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" class="m-svg m-slime"><defs>${defsCommon(id)}
      <clipPath id="${id}c"><path d="${B}"/></clipPath>
      <radialGradient id="${id}g" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#d4ffb0"/><stop offset=".35" stop-color="#97e06a"/><stop offset=".8" stop-color="#4ea53e"/><stop offset="1" stop-color="#2f7a2c"/></radialGradient>
      <radialGradient id="${id}core" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f2ffd9" stop-opacity=".8"/><stop offset="1" stop-color="#f2ffd9" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}glass" x1="0" x2="1"><stop offset="0" stop-color="#9fbfbd" stop-opacity=".95"/><stop offset=".3" stop-color="#f1faf9" stop-opacity=".9"/><stop offset="1" stop-color="#8fb2b0" stop-opacity=".95"/></linearGradient>
      <linearGradient id="${id}pot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3d1"/><stop offset="1" stop-color="#d9478a"/></linearGradient>
      <linearGradient id="${id}cork" x1="0" x2="1"><stop offset="0" stop-color="#7d4f2e"/><stop offset=".4" stop-color="#cf9b6a"/><stop offset="1" stop-color="#5f3a22"/></linearGradient></defs>
      <g class="m-shadow"><ellipse cx="150" cy="284" rx="104" ry="11" fill="#7ee05a" opacity=".3" filter="url(#${id}b3)"/><ellipse cx="150" cy="281" rx="92" ry="7" fill="#140a05" opacity=".4" filter="url(#${id}b1)"/></g>
      <g class="m-root" style="transform-origin:150px 280px">
        <path d="M60 274 C40 274 30 282 44 286 C80 292 220 292 256 286 C270 282 262 274 240 274 Z" fill="#6cc64e" ${S(3)}/>
        <ellipse cx="96" cy="282" rx="18" ry="2" fill="#e8ffd6" opacity=".7"/>
        <g class="m-body" style="transform-origin:150px 276px">
          <path d="${B}" fill="url(#${id}g)" ${S(4)}/>
          <g clip-path="url(#${id}c)">
            <ellipse cx="146" cy="196" rx="58" ry="52" fill="url(#${id}core)"/>
            <path d="${B}" fill="none" stroke="#e8ffcf" stroke-width="10" opacity=".35" transform="translate(-3 -4)"/>
            <path d="${B}" fill="none" stroke="#1f5a1f" stroke-width="12" opacity=".2" transform="translate(4 5)"/>
            <g class="m-bubbles">${bubble(id, 196, 236, 6.5)}${bubble(id, 176, 256, 4)}${bubble(id, 108, 244, 5, 1)}${bubble(id, 210, 206, 3)}${bubble(id, 92, 214, 2.4, 1)}
              <circle cx="128" cy="232" r="2.2" fill="#2f7a2c" opacity=".45"/><circle cx="168" cy="222" r="1.6" fill="#2f7a2c" opacity=".45"/><circle cx="190" cy="264" r="2" fill="#2f7a2c" opacity=".4"/>
              ${sparkle(118, 262, 3, '#fbfff0', .85)}${sparkle(214, 248, 2.4, '#fbfff0', .8)}</g>
            <rect width="300" height="300" filter="url(#${id}grain)" opacity=".45"/>
          </g>
          <ellipse cx="112" cy="136" rx="22" ry="14" fill="#fff" opacity=".6" transform="rotate(-28 112 136)"/><ellipse cx="96" cy="162" rx="5" ry="6.5" fill="#fff" opacity=".55"/>
          <path d="M214 150 C222 166 228 184 230 200" stroke="#fff8d0" stroke-width="5" stroke-linecap="round" opacity=".55" filter="url(#${id}b1)"/>
          <g class="m-drip" style="transform-origin:236px 196px"><path d="M234 196 C240 206 244 214 242 224 C240 232 232 232 232 224 C232 216 236 208 234 196 Z" fill="#7fd257" ${S(2.4)}/><ellipse cx="236" cy="216" rx="1.6" ry="3" fill="#fff" opacity=".7"/></g>
          <g class="m-hat" style="transform-origin:150px 100px">
            <path d="M136 64 L164 64 L164 78 C176 82 180 92 178 100 L122 100 C120 92 124 82 136 78 Z" fill="url(#${id}glass)" ${S(3.2)}/>
            <path d="M125 98 C128 90 134 86 140 86 L160 86 C166 86 172 90 175 98 Z" fill="url(#${id}pot)"/><path d="M128 91 L172 91" stroke="#ffd6e8" stroke-width="1.6"/>
            <circle cx="146" cy="94" r="1.8" fill="#fff" opacity=".8"/><path d="M130 82 L132 96" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
            <path d="M133 50 L135 66 C135 69 165 69 165 66 L167 50 Z" fill="url(#${id}cork)" ${S(2.8)}/><ellipse cx="150" cy="50" rx="17" ry="4.2" fill="#ddb07f" ${S(2.6)}/>
            <g class="m-slot" data-slot="cabeza" data-scale="0.9" transform="translate(150 48) scale(0.9)"></g>
          </g>
          ${face(id, 150, 182, 25, 13.5, { mouth: 'open' })}
          <g class="m-slot" data-slot="cara" data-scale="1.15" transform="translate(150 180) scale(1.15)"></g><g class="m-slot" data-slot="cuello" data-scale="1.1" transform="translate(150 222) scale(1.1)"></g><g class="m-slot" data-slot="mano" data-scale="1" transform="translate(240 236) scale(1)"></g>
        </g>
        ${sparkle(236, 104, 8, '#fff2c4', 1, 'm-twinkle')}${sparkle(62, 132, 5, '#f2ffd9', .9, 'm-twinkle')}
      </g></svg>`;
  }

  // Accesorios de prueba (diseños propios). Cada pieza se dibuja centrada en (0,0) de su ranura;
  // la ranura ya trae la posición y la escala de cada mascota, y se mueve con la parte del cuerpo donde vive.
  const ACCESORIOS = {
    sombrero: { slot: 'cabeza', svg: `<path d="M-26 0 C-14 -6 14 -6 26 0 C22 6 -22 6 -26 0 Z" fill="#3c2f6e" ${S(3)}/>` +
      `<path d="M-16 -2 C-12 -22 -2 -44 8 -54 C10 -40 14 -18 16 -2 Z" fill="#4b3a8a" ${S(3)}/>` +
      '<path d="M-15 -6 C-5 -9 6 -9 15 -6" stroke="#e8b65a" stroke-width="4" fill="none"/><path d="M-2 -28 l2 -5 l2 5 l5 1 l-5 2 l-2 5 l-2 -5 l-5 -2 Z" fill="#ffe08a"/>' },
    lentes: { slot: 'cara', svg: '<circle cx="-20" cy="0" r="12" fill="#cfe9ff" fill-opacity=".25" stroke="#8a5a22" stroke-width="3.2"/><circle cx="20" cy="0" r="12" fill="#cfe9ff" fill-opacity=".25" stroke="#8a5a22" stroke-width="3.2"/>' +
      '<path d="M-8 -1 C-4 -5 4 -5 8 -1" stroke="#8a5a22" stroke-width="3" fill="none"/><path d="M-25 -6 L-21 -9" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' },
    corbatin: { slot: 'cuello', svg: `<path d="M0 0 L-16 -9 L-16 9 Z M0 0 L16 -9 L16 9 Z" fill="#c2453a" ${S(2.6)}/><circle r="4.5" fill="#e0574a" ${S(2.4)}/>` },
    // ——— Cabeza ———
    birrete: { slot: 'cabeza', svg: `<path d="M-15 -10 L-15 0 C-8 5 8 5 15 0 L15 -10 Z" fill="#2a2a38" ${S(2.6)}/>` +
      `<path d="M-32 -15 L0 -27 L32 -15 L0 -3 Z" fill="#3a3a4d" ${S(2.8)}/><path d="M-22 -16 L0 -24 L12 -19.5" stroke="#5c5c78" stroke-width="2" fill="none"/>` +
      `<path d="M0 -15 L24 -12 L25 2" stroke="#e8b65a" stroke-width="2.2" fill="none"/><path d="M22 2 L28 2 L27 10 L23 10 Z" fill="#e8b65a" ${S(1.6)}/><circle cx="0" cy="-15" r="2.6" fill="#e8b65a"/>` },
    corona: { slot: 'cabeza', svg: `<path d="M-22 0 L-25 -24 L-12 -11 L0 -30 L12 -11 L25 -24 L22 0 Z" fill="#f2c14e" ${S(2.8)}/>` +
      `<path d="M-22 0 L22 0 L21 -6 L-21 -6 Z" fill="#d99a2b" ${S(2.2)}/><path d="M-17 -12 L-12 -9 M8 -14 L4 -20" stroke="#fff3c4" stroke-width="2.2" stroke-linecap="round"/>` +
      `<circle cx="0" cy="-3" r="3.4" fill="#e0574a" ${S(1.4)}/><circle cx="-13" cy="-3" r="2.6" fill="#5fb3e6" ${S(1.2)}/><circle cx="13" cy="-3" r="2.6" fill="#5fb3e6" ${S(1.2)}/>` +
      `<circle cx="0" cy="-30" r="3" fill="#fff6c9" ${S(1.4)}/><circle cx="-25" cy="-24" r="2.6" fill="#fff6c9" ${S(1.2)}/><circle cx="25" cy="-24" r="2.6" fill="#fff6c9" ${S(1.2)}/>` },
    gorro: { slot: 'cabeza', svg: `<path d="M-23 -2 C-24 -30 24 -30 23 -2 Z" fill="#c2453a" ${S(2.8)}/><path d="M-12 -22 C-10 -12 -9 -6 -9 -3 M0 -26 L0 -3 M12 -22 C10 -12 9 -6 9 -3" stroke="#9a3229" stroke-width="2" fill="none"/>` +
      `<rect x="-26" y="-7" width="52" height="10" rx="4" fill="#efe1c2" ${S(2.6)}/><path d="M-18 -6 L-18 2 M-10 -6 L-10 2 M-2 -6 L-2 2 M6 -6 L6 2 M14 -6 L14 2" stroke="#cdb88f" stroke-width="1.6"/>` +
      `<circle cx="0" cy="-30" r="8" fill="#fbf2df" ${S(2.4)}/><circle cx="-2.5" cy="-32.5" r="2.4" fill="#fff"/>` },
    flor: { slot: 'cabeza', svg: `<g transform="translate(16 -4) rotate(-15)">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-8" rx="5.5" ry="8" fill="#f7a6c4" ${S(1.8)} transform="rotate(${a})"/>`).join('')}` +
      `<circle r="5" fill="#ffd34d" ${S(1.8)}/><circle cx="-1.5" cy="-1.5" r="1.6" fill="#fff6c9"/></g><path d="M8 0 C2 -2 -4 -2 -8 2" stroke="#5f9f4a" stroke-width="2.6" fill="none" stroke-linecap="round"/>` },
    // ——— Cara ———
    lentesSol: { slot: 'cara', svg: `<path d="M-33 -8 L-8 -8 L-9 6 C-10 10 -14 12 -20 12 C-28 12 -32 8 -33 2 Z M33 -8 L8 -8 L9 6 C10 10 14 12 20 12 C28 12 32 8 33 2 Z" fill="#1f1c2b" ${S(2.4)}/>` +
      `<path d="M-8 -6 C-3 -9 3 -9 8 -6" stroke="${INK}" stroke-width="2.6" fill="none"/><path d="M-29 -5 L-22 -5 M14 -5 L19 -5" stroke="#9fd3f0" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>` +
      `<path d="M-27 4 L-15 4" stroke="#6a5f9a" stroke-width="2" stroke-linecap="round" opacity=".7"/>` },
    monoculo: { slot: 'cara', svg: `<circle cx="20" cy="0" r="13" fill="#e6f4ff" fill-opacity=".22" stroke="#d6a44c" stroke-width="3.4"/><circle cx="20" cy="0" r="13" fill="none" stroke="${INK}" stroke-width="1.2"/>` +
      `<path d="M13 -6 C15 -9 18 -10 21 -10" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M31 6 C36 18 34 30 26 40" stroke="#d6a44c" stroke-width="1.6" stroke-dasharray="2 2" fill="none"/>` },
    // ——— Cuello ———
    bufanda: { slot: 'cuello', svg: `<path d="M-30 -6 C-12 2 12 2 30 -6 L30 6 C12 14 -12 14 -30 6 Z" fill="#3f7fbf" ${S(2.6)}/>` +
      `<path d="M14 6 L24 34 L12 36 L6 9 Z" fill="#3f7fbf" ${S(2.4)}/><path d="M-22 -2 L-22 9 M-8 1 L-8 12 M8 1 L8 12 M22 -2 L22 9 M16 15 L22 13 M18 23 L23 21" stroke="#f2e2bd" stroke-width="2.6"/>` +
      `<path d="M12 36 L13 41 M16 35.5 L17 40.5 M20 35 L21 40" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>` },
    collar: { slot: 'cuello', svg: `<path d="M-24 -6 C-12 6 12 6 24 -6" stroke="#d6a44c" stroke-width="2.6" stroke-dasharray="3 2" fill="none"/>` +
      `<path d="M0 2 C6 8 6 16 0 22 C-6 16 -6 8 0 2 Z" fill="#7a5bd6" ${S(2.2)}/><path d="M-1.5 8 L-3 13" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="0" cy="2" r="2.6" fill="#d6a44c" ${S(1.2)}/>` },
    // ——— Mano / costado ———
    lupa: { slot: 'mano', svg: `<path d="M-2 4 L-14 22" stroke="#6b4426" stroke-width="7" stroke-linecap="round"/><path d="M-2 4 L-14 22" stroke="#9a6a3e" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="6" cy="-8" r="13" fill="#dff1ff" fill-opacity=".45" stroke="#d6a44c" stroke-width="4"/><circle cx="6" cy="-8" r="13" fill="none" stroke="${INK}" stroke-width="1.4"/>` +
      `<path d="M-1 -14 C1 -18 5 -19 8 -19" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/>` },
    varita: { slot: 'mano', svg: `<path d="M-14 22 L8 -10" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"/><path d="M-14 22 L8 -10" stroke="#5b3a26" stroke-width="3.2" stroke-linecap="round"/>` +
      `<path d="M-12 16 L-8 10" stroke="#e8b65a" stroke-width="3.2" stroke-linecap="round"/>` +
      `<path d="M10 -26 L13 -16 L23 -15 L15 -9 L18 1 L10 -5 L2 1 L5 -9 L-3 -15 L7 -16 Z" fill="#ffe08a" ${S(2)}/><circle cx="8" cy="-14" r="2" fill="#fff"/>` },
    taza: { slot: 'mano', svg: `<path d="M-12 -8 L12 -8 L10 14 C10 18 -10 18 -10 14 Z" fill="#f2e7d2" ${S(2.6)}/><path d="M12 -3 C22 -3 22 10 11 9" stroke="${INK}" stroke-width="2.6" fill="none"/>` +
      `<ellipse cx="0" cy="-8" rx="12" ry="3.5" fill="#8a5a36" ${S(2)}/><path d="M-6 2 L6 2" stroke="#c2453a" stroke-width="3"/>` +
      `<path d="M-4 -14 C-8 -19 0 -22 -4 -28 M4 -14 C0 -19 8 -22 4 -28" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".75"/>` }
  };
  // Para la tienda/vestuario: nombres legibles y ranura de cada accesorio.
  const NOMBRES = { sombrero: 'Sombrero de mago', birrete: 'Birrete', corona: 'Corona', gorro: 'Gorro de lana', flor: 'Flor',
    lentes: 'Lentes redondos', lentesSol: 'Lentes de sol', monoculo: 'Monóculo', corbatin: 'Corbatín', bufanda: 'Bufanda', collar: 'Collar de gema',
    lupa: 'Lupa', varita: 'Varita', taza: 'Taza de té' };
  function equip(svgRoot, id) {
    const a = ACCESORIOS[id], slot = a && svgRoot.querySelector(`.m-slot[data-slot="${a.slot}"]`);
    if (!slot) return false;
    slot.innerHTML = a.svg;
    return true;
  }
  function unequip(svgRoot, slotName) {
    svgRoot.querySelectorAll(slotName ? `.m-slot[data-slot="${slotName}"]` : '.m-slot').forEach(s => { s.innerHTML = ''; });
  }
  window.Alquimicos = Object.freeze({ matraz, atomo, slime, equip, unequip, ACCESORIOS, NOMBRES, setExpression, EXPRESSIONS, SLOTS: ['cabeza', 'cara', 'cuello', 'mano'],
    list: [['matraz', 'Matraz'], ['atomo', 'Átomo'], ['slime', 'Slime']] });
})();
