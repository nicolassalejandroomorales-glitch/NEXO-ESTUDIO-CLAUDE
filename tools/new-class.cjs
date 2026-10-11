// Crea una clase nueva para el aula (torre del alquimista) con la misma estructura que Aminas.
// Uso:   node tools/new-class.cjs <id-del-tema> "<Título>" "<Evaluación>" [--catalogo] [--sin-generadores] [--ramo <id-del-ramo>]
// Ej.:   node tools/new-class.cjs org-04 "Aromáticos" "PEP 1" --catalogo
// El <id-del-tema> debe existir en el catálogo de temas (dist/data.js), por ejemplo org-04. De ahí sale solo el ramo
// (organica, fisico, analitica, fisio), que la torre usa para la cuenta regresiva a la próxima evaluación.
// Crea dos archivos: dist/classes/<id>.js (la clase) y dist/classes/<id>-gen.js (ejercicios infinitos, laboratorio y bestiario).
// --catalogo la agrega a dist/classes/catalog.js, es decir, el tema deja de decir "Próximamente".
// --sin-generadores no crea el <id>-gen.js (la clase funciona igual, pero sin Entrenar ni laboratorio).
// Guía completa: docs/clases-estructura/COMO_CREAR_UNA_CLASE.md
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const argv = process.argv.slice(2);
const valueOf = flag => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
const outDir = valueOf('--salida');                    // --salida <carpeta>: escribe ahí (lo usan las pruebas) en vez de dist/classes
const valued = new Set(['--salida', '--ramo'].map(f => argv.indexOf(f) + 1).filter(i => i > 0));
const [id, title, evaluation] = argv.filter((a, i) => !a.startsWith('--') && !valued.has(i));
const addToCatalog = argv.includes('--catalogo') && !outDir;
const withGen = !argv.includes('--sin-generadores');
if (!id || !title || !evaluation) {
  console.error('Uso: node tools/new-class.cjs <id-del-tema> "<Título>" "<Evaluación>" [--catalogo] [--sin-generadores] [--ramo <id-del-ramo>]');
  process.exit(1);
}
const root = path.join(__dirname, '..', 'dist', 'classes');
const file = path.join(outDir || root, `${id}.js`);
const genFile = path.join(outDir || root, `${id}-gen.js`);
for (const f of [file, ...(withGen ? [genFile] : [])]) if (fs.existsSync(f)) { console.error(`Ya existe ${path.relative(process.cwd(), f)}: no se sobrescribe.`); process.exit(1); }

// El ramo sale del catálogo de temas: el que tenga este tema en alguna de sus PEP.
function subjectOf(topic) {
  try {
    const ctx = { window: {} }; vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'dist', 'data.js'), 'utf8') + ';this.__data = NEXO_DATA;', ctx);
    return ctx.__data.subjects.find(sj => (sj.peps || []).some(p => (p.lessons || []).includes(topic)))?.id || '';
  } catch { return ''; }
}
const subject = valueOf('--ramo') || subjectOf(id);
if (!subject && !outDir) console.warn(`Ojo: ${id} no está en dist/data.js, así que la clase queda sin ramo (sin cuenta regresiva). Usa --ramo <id> si corresponde.`);

const template = `/* ${title} · ${evaluation}. Creada con tools/new-class.cjs: reemplaza cada "REEMPLAZAR".
   Guía: docs/clases-estructura/COMO_CREAR_UNA_CLASE.md · Ejemplo completo: dist/classes/org-01.js (Aminas). */
(() => {
  'use strict';
  const SRC = 'catedra';
  // Ayudantes: cada uno arma un tipo de actividad.
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const pick = (id, prompt, molecules, targets, answer, extra = {}) => ({ id, type: 'pick', prompt, molecules, targets, answer, source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  // Química: dibujos con el editor propio (dist/classes/editor.js). A = átomo (x, y en un lienzo de 420 × 260), B = enlace (1, 2 o 3).
  // Si tu ramo no usa moléculas, borra estos ayudantes y las actividades build/arrows: todo lo demás funciona igual.
  const A = (id, el, x, y, q = 0, extra = {}) => ({ id, el, x, y, q, ...extra });
  const B = (a, b, o = 1) => ({ a, b, o });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses[${JSON.stringify(id)}] = {
    id: ${JSON.stringify(id)},
    subject: ${JSON.stringify(subject)},   // ramo del calendario: la torre cuenta los días a su próxima evaluación
    title: ${JSON.stringify(title)},
    evaluation: ${JSON.stringify(evaluation)},
    status: 'borrador',
    sources: { [SRC]: { title: 'REEMPLAZAR: Clase de cátedra · ${title}', author: 'REEMPLAZAR: profesor', detail: 'REEMPLAZAR: ramo, universidad, semestre', authority: 'Material oficial del curso' } },
    // Errores típicos: cada distractor puede apuntar a uno. "prereq" dice qué bloque repasar en el rescate,
    // "base" de qué raíz viene (2 errores con la misma base ofrecen el desvío al Repaso desde cero) y "check" es un caso corto
    // que aparece justo después de caer (opcional). Cada error es además una criatura del bestiario.
    misconceptions: {
      'error-ejemplo': { label: 'REEMPLAZAR: nombre corto del error', why: 'REEMPLAZAR: por qué está mal, en simple.', prereq: { title: 'REEMPLAZAR: qué repasar', mission: 'm1', block: 'b1' },
        base: 'base.ejemplo',
        check: q('fix-error-ejemplo', 'Caso corto: REEMPLAZAR', [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR: por qué no' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1 }) }
    },
    // Meta: los puntos de la prueba que esta clase prepara (de la pauta). Deben sumar "total" junto con "rest".
    goal: {
      total: 15, text: 'REEMPLAZAR: Asegurar los X puntos de ${title} de la ${evaluation}',
      questions: [{ id: 'P1', label: 'REEMPLAZAR: qué pide la pregunta', points: 15, missions: ['m1'] }],
      rest: []   // por ejemplo: [{ label: 'Otro tema (P2)', points: 5, note: 'clase en preparación' }]
    },
    // Glosario en tres capas: en simple, definición de prueba y "más simple todavía" (una analogía).
    glossary: [{ term: 'REEMPLAZAR: término', mission: 'm1', def: 'REEMPLAZAR: definición exacta, como en la prueba',
      simple: 'REEMPLAZAR: lo mismo en palabras simples', simpler: 'REEMPLAZAR: una analogía de la vida diaria' }],
    // Conceptos: las hojas del árbol. Cada actividad dice a cuál pertenece con "concept".
    // Las raíces ("root: true", id que parte con "base.") son las bases del Repaso desde cero; "needs" dice de cuáles depende cada idea.
    concepts: [
      { id: 'base.ejemplo', title: 'REEMPLAZAR: base que se necesita (por ejemplo, Lewis)', root: true },
      { id: 'c1', mission: 'm1', title: 'REEMPLAZAR: idea que se aprende', needs: ['base.ejemplo'] }
    ],
    curiosities: [{ text: 'REEMPLAZAR: dato curioso sacado de las diapositivas.', slide: 1 }],
    slideImages: {},   // se llena solo con tools/classroom-art/slides.py
    slides: { 1: { title: 'REEMPLAZAR: título de la diapositiva 1', bullets: ['REEMPLAZAR: texto de la diapositiva'] } },
    missions: [
      {
        id: 'm1', title: 'REEMPLAZAR: título de la misión', subtitle: 'REEMPLAZAR: de qué trata, en una línea', minutes: 25, slides: '1', pep: 'REEMPLAZAR: qué pregunta de la prueba prepara',
        stages: {
          // Caso real del inicio (farmacia, laboratorio, vida diaria). "scene" es opcional: un dibujo de molécula.
          hook: { title: 'REEMPLAZAR: el caso', sage: 'REEMPLAZAR: lo que dice el sabio al empezar.', text: 'REEMPLAZAR: por qué esta misión importa, con un ejemplo real.' },
          diagnostic: [   // 2–3 preguntas sin pistas: si aciertas todo, puedes saltar la lección
            q('m1-d1', 'REEMPLAZAR: pregunta', [{ text: 'Correcta', correct: true }, { text: 'Distractor con error típico', misconception: 'error-ejemplo' }, { text: 'Distractor', note: 'REEMPLAZAR: por qué no' }], { concept: 'c1', explain: 'REEMPLAZAR: explicación', slide: 1 })
          ],
          fundamentals: [ // bases "desde cero" (prerrequisitos)
            { id: 'f1', concept: 'base.ejemplo', title: 'Desde cero: REEMPLAZAR', body: 'REEMPLAZAR: lo mínimo, en simple.', deeper: 'REEMPLAZAR: versión paso a paso para "Explícame más simple".', slide: 1 }
          ],
          explain: [],    // con partes, la materia va dentro de cada parte
          transfer: [     // cierre: caso nuevo estilo prueba, sin ayuda. Estas dan los puntos del "Camino al 7".
            q('m1-t1', 'REEMPLAZAR: estilo prueba', [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1 }),
            // Escrita (escalón 5): la única forma de que una hoja se ponga verde. "teach: true" = "enséñale a tu compañero".
            write('m1-w1', 'REEMPLAZAR: explícalo con tus palabras…', 'REEMPLAZAR: respuesta modelo completa, de al menos dos frases.', ['REEMPLAZAR: idea 1 de la pauta', 'REEMPLAZAR: idea 2'],
              { concept: 'c1', explain: 'REEMPLAZAR', slide: 1, teach: true, keywords: [{ label: 'REEMPLAZAR: idea clave', any: ['palabra', 'sinonimo'] }] })
          ]
        },
        // Partes (recetas): cada una con "adivina antes", lección, práctica que se va soltando (3+ tipos) y receta o regla guardada.
        parts: [
          { id: 'r1', intro: 'Parte 1: **REEMPLAZAR**.',
            pretest: q('m1-pre1', 'REEMPLAZAR: adivina antes de la lección (no cuenta)', [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1 }),
            explain: [
              { id: 'b1', concept: 'c1', title: 'REEMPLAZAR', slide: 1, body: 'REEMPLAZAR: la idea, con el dato de la diapositiva.', deeper: 'REEMPLAZAR: más simple, paso a paso.' }
              // Mecanismo con controles (solo química): { id: 'b1m', concept, title, slide, body, deeper, frames: [{ scene, lonePairs, arrows: [['lp:n', 'a:c']], caption }] }
            ],
            practice: [   // todas con pista (hint). Tipos: choice, order, classify, match, pick, write, number, poe, recipe, spot, build, arrows
              q('m1-p1', 'REEMPLAZAR', [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1, hint: 'REEMPLAZAR' }),
              order('m1-p2', 'REEMPLAZAR: ordena…', [['a', 'Primero'], ['b', 'Segundo'], ['c', 'Tercero']], ['a', 'b', 'c'], { concept: 'c1', direction: 'De menor a mayor.', explain: 'REEMPLAZAR', slide: 1, hint: 'REEMPLAZAR' }),
              // Respuesta numérica (escalón 5): para ramos de cálculo. tol = tolerancia relativa; units = unidades para elegir (opcional);
              // traps = resultados de errores típicos, con su porqué; solution = pasos que se muestran al corregir.
              { id: 'm1-n1', type: 'number', source: SRC, concept: 'c1', slide: 1, prompt: 'REEMPLAZAR: calcula…', label: 'REEMPLAZAR: K', answer: 6, unit: 'REEMPLAZAR: unidad', tol: 0.02,
                traps: [{ value: 3, note: 'REEMPLAZAR: por qué sale 3 si te equivocas en…' }], solution: ['REEMPLAZAR: paso 1', 'REEMPLAZAR: paso 2'], explain: 'REEMPLAZAR', hint: 'REEMPLAZAR' },
              { id: 'm1-fx1', type: 'spot', source: SRC, concept: 'c1', slide: 1, prompt: 'Un aprendiz se equivocó. ¿En qué paso?',
                steps: ['REEMPLAZAR: paso bien', 'REEMPLAZAR: paso con el error', 'REEMPLAZAR: conclusión'], wrong: 1,
                stepNotes: { 0: 'REEMPLAZAR: por qué este paso está bien', 2: 'REEMPLAZAR: viene del error anterior' },
                fix: { question: '¿Cómo se corrige?', options: [{ text: 'REEMPLAZAR: corrección', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }] },
                explain: 'REEMPLAZAR', hint: 'REEMPLAZAR' }
            ],
            // Si la parte es una reacción: recipe: { title, base, reagents, condition, result, note }. Si no, una regla (lista de chequeo):
            rule: { title: 'REEMPLAZAR: Regla de…', concept: 'c1', steps: ['REEMPLAZAR: paso 1', 'REEMPLAZAR: paso 2'] } }
        ]
      }
    ],
    // Repaso desde cero: una misión corta por raíz, con explicación, ejercicios de fácil a difícil y una escrita.
    base: [
      { id: 'z1', concept: 'base.ejemplo', title: 'REEMPLAZAR: la base', subtitle: 'REEMPLAZAR: qué se repasa, en una línea', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.ejemplo', title: 'REEMPLAZAR', slide: 1, body: 'REEMPLAZAR: lo mínimo, en simple.', deeper: 'REEMPLAZAR: más simple, paso a paso.' }],
          practice: [q('z1-p1', 'REEMPLAZAR: fácil', [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], { concept: 'base.ejemplo', explain: 'REEMPLAZAR', slide: 1, hint: 'REEMPLAZAR' })],
          transfer: [write('z1-w1', 'REEMPLAZAR: explícalo con tus palabras…', 'REEMPLAZAR: respuesta modelo completa, de al menos dos frases.', ['REEMPLAZAR: idea 1 de la pauta', 'REEMPLAZAR: idea 2'],
            { concept: 'base.ejemplo', explain: 'REEMPLAZAR', slide: 1, keywords: [{ label: 'REEMPLAZAR: idea clave', any: ['palabra'] }] })]
        } }
    ],
    // ── El grimorio ──
    formulas: [ // tarjetas del formulario (opcional "calc": calculadora)
      { id: 'f-ej', title: 'REEMPLAZAR', formula: 'REEMPLAZAR: y = a·x', concepts: ['c1'], vars: [['a', 'REEMPLAZAR: qué es', 'REEMPLAZAR: unidad']],
        what: 'REEMPLAZAR: para qué sirve', when: 'REEMPLAZAR: cuándo se usa', example: 'REEMPLAZAR: ejemplo resuelto', deeper: 'REEMPLAZAR: por qué funciona',
        sources: [{ label: 'Cátedra · diap. 1', slide: 1 }],
        calc: { inputs: [{ id: 'x', label: 'x', value: 2, step: 1 }], run: v => 'y = **' + (2 * v.x) + '**' } }
    ],
    recipes: [],  // reacciones del recetario: { id, mission, concept, slide, title, base, reagents, condition, result, note }
    // Más ayuda: una mini clase por concepto (idea, 3 pasos, pregunta) y, si quieres, una clase "a profundidad".
    mini: {
      'base.ejemplo': { idea: 'REEMPLAZAR: la base con una imagen', steps: ['REEMPLAZAR: paso 1', 'REEMPLAZAR: paso 2', 'REEMPLAZAR: paso 3'],
        check: { prompt: 'REEMPLAZAR: pregunta de control', options: [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], explain: 'REEMPLAZAR' } },
      c1: { idea: 'REEMPLAZAR: la idea con una imagen', steps: ['REEMPLAZAR: paso 1', 'REEMPLAZAR: paso 2', 'REEMPLAZAR: paso 3'],
        check: { prompt: 'REEMPLAZAR: pregunta de control', options: [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], explain: 'REEMPLAZAR' } }
    },
    deep: {
      c1: { title: 'REEMPLAZAR: el tema a fondo', sections: [['REEMPLAZAR', 'REEMPLAZAR'], ['REEMPLAZAR', 'REEMPLAZAR'], ['REEMPLAZAR', 'REEMPLAZAR']],
        challenge: { prompt: 'REEMPLAZAR: desafío', options: [{ text: 'Correcta', correct: true }, { text: 'Otra', note: 'REEMPLAZAR' }], explain: 'REEMPLAZAR' },
        sources: [{ label: 'Cátedra · diap. 1', slide: 1 }, { label: 'REEMPLAZAR: libro o LibreTexts', url: 'https://chem.libretexts.org/' }] }
    },
    // Diagnóstico "¿Por dónde empiezo?": preguntas propias en 3 niveles (1 bases, 2 lo básico, 3 lo difícil).
    diagnosis: { start: 2, max: 3, items: [
      { level: 1, item: q('dx-1', 'REEMPLAZAR: base', [{ text: 'Correcta', correct: true }, { text: 'Otra' }], { concept: 'base.ejemplo', explain: 'REEMPLAZAR', slide: 1 }) },
      { level: 2, item: q('dx-2', 'REEMPLAZAR: básico', [{ text: 'Correcta', correct: true }, { text: 'Otra' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1 }) },
      { level: 3, item: q('dx-3', 'REEMPLAZAR: difícil', [{ text: 'Correcta', correct: true }, { text: 'Otra' }], { concept: 'c1', explain: 'REEMPLAZAR', slide: 1 }) }
    ] }
  };
})();
`;
// Ejercicios infinitos (etapa 8): generadores que arman preguntas nuevas desde una tabla, en 5 niveles, más laboratorio y bestiario.
const genTemplate = `/* Ejercicios infinitos de ${title} · ${evaluation}. Creado con tools/new-class.cjs: reemplaza cada "REEMPLAZAR".
   Cada generador arma una pregunta nueva desde una semilla y un nivel: 1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP.
   Las respuestas se CALCULAN desde tablas (nunca se escriben a mano): así siempre coinciden con los datos.
   Guía: docs/clases-estructura/COMO_CREAR_UNA_CLASE.md · Ejemplo completo: dist/classes/org-01-gen.js (Aminas, 15 generadores). */
(() => {
  'use strict';
  const SRC = 'catedra';   // la misma fuente de la clase (sources en ${id}.js)
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];

  /* ── Utilidades con azar reproducible (la misma semilla da la misma pregunta). No hay que tocarlas. ── */
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (rng, list, n) => shuffle(rng, list).slice(0, n);
  const num = (x, d = 1) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
  // Alternativas: la correcta y distractores (cada uno con su porqué). Se barajan y se quitan las repetidas.
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  const order = (prompt, cards, answer, extra) => ({ type: 'order', prompt, cards, answer, ...extra });

  /* ════════ 1. Comparar con una tabla (concepto c1) ════════
     Cambia la tabla por datos reales del ramo (pKa, puntos de ebullición, constantes…), con su fuente. Valores distintos entre sí. */
  const TABLA = [
    { n: 'REEMPLAZAR A', v: 1.0 }, { n: 'REEMPLAZAR B', v: 2.5 }, { n: 'REEMPLAZAR C', v: 4.0 },
    { n: 'REEMPLAZAR D', v: 5.5 }, { n: 'REEMPLAZAR E', v: 7.0 }, { n: 'REEMPLAZAR F', v: 9.5 }
  ];
  const VALOR = 'REEMPLAZAR: nombre de la propiedad (por ejemplo, pKaH)';
  const comparar = {
    id: 'comparar', title: 'REEMPLAZAR: Comparar con la tabla', mission: 'm1', concepts: ['c1'],
    make(rng, level) {
      const base = { concept: 'c1', slide: 1, hint: 'REEMPLAZAR: la regla que hay que usar para comparar.' };
      const ver = x => (level <= 2 ? x.n + ' (' + num(x.v) + ')' : x.n);   // en los niveles 1 y 2 se muestran los valores
      if (level === 5) { // Estilo PEP: ordenar sin valores
        const set = sample(rng, TABLA, 4), sorted = [...set].sort((a, b) => a.v - b.v);
        return order('Estilo PEP: ordena de menor a mayor ' + VALOR + '.', set.map((x, i) => ({ id: 'x' + i, text: x.n })),
          sorted.map(x => 'x' + set.indexOf(x)), { ...base, direction: 'De menor a mayor.',
            explain: sorted.map(x => x.n + ' (' + num(x.v) + ')').join(' < ') + '. REEMPLAZAR: por qué, con la regla.' });
      }
      const n = [2, 3, 4, 4][level - 1], set = sample(rng, TABLA, n), menor = level === 4;
      const best = [...set].sort((a, b) => (menor ? a.v - b.v : b.v - a.v))[0];
      return choice(rng, '¿Cuál tiene ' + (menor ? 'menor' : 'mayor') + ' ' + VALOR + '? ' + set.map(ver).join(' · '), best.n,
        set.filter(x => x !== best).map(x => ({ text: x.n, note: x.n + ' tiene ' + num(x.v) + '; ' + best.n + ' tiene ' + num(best.v) + '.', misconception: 'error-ejemplo' })),
        { ...base, explain: best.n + ' tiene el ' + (menor ? 'menor' : 'mayor') + ' valor (' + num(best.v) + '). REEMPLAZAR: por qué, con la regla.' });
    }
  };

  /* ════════ 2. Preguntas de concepto desde un banco (raíz base.ejemplo) ════════
     Cuando no hay tabla: un banco por nivel; el azar elige la pregunta y baraja las alternativas. Mientras más entradas, más variedad. */
  const BANCO = [
    { level: 1, p: 'REEMPLAZAR: pregunta fácil', a: 'REEMPLAZAR: correcta', d: [['REEMPLAZAR: distractor 1', 'REEMPLAZAR: por qué no'], ['REEMPLAZAR: distractor 2', 'REEMPLAZAR: por qué no']] },
    { level: 3, p: 'REEMPLAZAR: pregunta intermedia', a: 'REEMPLAZAR: correcta', d: [['REEMPLAZAR: distractor 1', 'REEMPLAZAR: por qué no'], ['REEMPLAZAR: distractor 2', 'REEMPLAZAR: por qué no']] },
    { level: 5, p: 'REEMPLAZAR: pregunta estilo PEP', a: 'REEMPLAZAR: correcta', d: [['REEMPLAZAR: distractor 1', 'REEMPLAZAR: por qué no'], ['REEMPLAZAR: distractor 2', 'REEMPLAZAR: por qué no']] }
  ];
  const concepto = {
    id: 'concepto', title: 'REEMPLAZAR: Preguntas de la base', mission: null, concepts: ['base.ejemplo'],
    make(rng, level) {
      const near = Math.max(...BANCO.filter(x => x.level <= level).map(x => x.level), Math.min(...BANCO.map(x => x.level)));
      const q = pick(rng, BANCO.filter(x => x.level === near));
      return choice(rng, (level === 5 ? 'Estilo PEP: ' : '') + q.p, q.a, q.d.map(([text, note]) => ({ text, note })),
        { concept: 'base.ejemplo', slide: 1, hint: 'REEMPLAZAR: pista', explain: q.a + '. REEMPLAZAR: por qué.' });
    }
  };

  // Generadores con varios conceptos: make(rng, nivel, concepto) recibe el concepto pedido y debe devolver uno de ese concepto.
  const generators = [comparar, concepto];

  /* ════════ Laboratorio libre: sustancias, reactivos y lo que pasa (opcional; bórralo si tu ramo no lo usa) ════════ */
  const substances = [
    { id: 'a', name: 'REEMPLAZAR: sustancia de partida', formula: 'REEMPLAZAR' },
    { id: 'b', name: 'REEMPLAZAR: intermediario', formula: 'REEMPLAZAR' },
    { id: 'c', name: 'REEMPLAZAR: producto', formula: 'REEMPLAZAR' }
  ];
  const reagents = [{ id: 'r1', label: 'REEMPLAZAR: reactivo 1' }, { id: 'r2', label: 'REEMPLAZAR: reactivo 2' }];
  const RX = { // 'sustancia>reactivo': [nueva sustancia, por qué]
    'a>r1': ['b', 'REEMPLAZAR: qué pasa y por qué.'],
    'b>r2': ['c', 'REEMPLAZAR: qué pasa y por qué.']
  };
  const WHY_NOT = { r1: 'REEMPLAZAR: sobre qué sirve el reactivo 1.', r2: 'REEMPLAZAR: sobre qué sirve el reactivo 2.' };
  function react(fromId, reagentId) {
    const r = RX[fromId + '>' + reagentId];
    if (r) return { to: r[0], ok: true, why: r[1] };
    return { to: null, ok: false, why: WHY_NOT[reagentId] || 'Este reactivo no hace nada útil aquí.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['a'] };

  /* Criaturas del bestiario: una por concepto, [nombre, color]. Los errores de ese concepto aparecen con esa criatura. */
  const creatures = { 'base.ejemplo': ['Duende', '#6d8bd6'], c1: ['Trasgo', '#7f9a3c'] };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen[${JSON.stringify(id)}] = { LEVELS, source: SRC, generators, lab, creatures };
})();
`;
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, template);
console.log(`Creada ${path.relative(process.cwd(), file)}${subject ? ` (ramo: ${subject})` : ''}`);
if (withGen) { fs.writeFileSync(genFile, genTemplate); console.log(`Creada ${path.relative(process.cwd(), genFile)} (ejercicios infinitos, laboratorio y bestiario)`); }

if (addToCatalog) {
  const catalogPath = path.join(root, 'catalog.js');
  const catalog = fs.readFileSync(catalogPath, 'utf8');
  if (!catalog.includes(`'${id}'`)) {
    fs.writeFileSync(catalogPath, catalog.replace(/\n\}\);\s*$/, `,\n  '${id}': '${id}.js'\n});\n`));
    console.log(`Agregada al catálogo: el tema ${id} ahora abre el aula.`);
  }
}
console.log(`Siguiente:
  1. Reemplaza cada "REEMPLAZAR" en dist/classes/${id}.js${withGen ? ` y en dist/classes/${id}-gen.js` : ''} (busca con Ctrl+F).
  2. Si tienes el PDF de cátedra: python3 tools/classroom-art/slides.py RUTA.pdf ${id}
  3. Revisa: npm test (o solo node tools/classroom-test.cjs)
  4. ${addToCatalog ? 'Regenera el arranque (node tools/build-startup.cjs) y sube la versión ?v= en dist/index.html' : 'Cuando esté lista: vuelve a correr con --catalogo, regenera el arranque (node tools/build-startup.cjs) y sube la versión ?v= en dist/index.html'}`);
