/* Química Analítica · PEP 1 · Curvas de titulación ácido-base (viernes 13 de noviembre).
   La cátedra de ácido-base aún no está en el Drive: el contenido sale de la bibliografía oficial (Skoog, West, Holler y Crouch, cap. 14–15; Harris, cap. 10–11).
   Las "láminas" son secciones propias numeradas como referencia. Números recalculados en Python (docs/replica-pep1/SPEC.md). */
(() => {
  'use strict';
  const SRC = 'skoog';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  const num = (id, prompt, answer, unit, extra = {}) => ({ id, type: 'number', prompt, answer, unit, tol: 0.01, source: SRC, ...extra });
  const spot = (id, prompt, steps, wrong, fix, extra = {}) => ({ id, type: 'spot', prompt, steps, wrong, fix, source: SRC, ...extra });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['ana-03'] = {
    id: 'ana-03',
    subject: 'analitica',
    title: 'Curvas de titulación ácido-base',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Fundamentos de Química Analítica, cap. 14–15 (titulaciones ácido-base)', author: 'Skoog, West, Holler y Crouch', detail: 'Bibliografía oficial del curso (sin diapositivas de cátedra todavía)', authority: 'Libro de texto' },
      harris: { title: 'Análisis Químico Cuantitativo, cap. 10–11', author: 'Daniel C. Harris', detail: 'Bibliografía complementaria', authority: 'Libro de texto' }
    },
    misconceptions: {
      'eq-ph7': { label: 'Creíste que en la equivalencia el pH siempre es 7', why: 'Solo con **ácido fuerte + base fuerte** el pH de equivalencia es 7. Con un **ácido débil** + base fuerte, en la equivalencia queda la **base conjugada** (acetato): el pH es **mayor que 7** (8,73 con ácido acético 0,1 M).',
        prereq: { title: 'Ácido débil con base fuerte', mission: 'm2', block: 'm2b1' }, base: 'base.ph' },
      'half-eq': { label: 'No usaste que pH = pKa a media titulación', why: 'A la **mitad** del volumen de equivalencia, [HA] = [A⁻] y Henderson-Hasselbalch da **pH = pKa**. Es la forma más rápida de leer el pKa en una curva.',
        prereq: { title: 'Ácido débil con base fuerte', mission: 'm2', block: 'm2b1' }, base: 'base.ph' },
      'hh-ratio': { label: 'Invertiste la razón en Henderson-Hasselbalch', why: '**pH = pKa + log([A⁻]/[HA])**: la base conjugada va **arriba**. Mientras más base agregas, más A⁻ y más sube el pH.',
        prereq: { title: 'Ácido débil con base fuerte', mission: 'm2', block: 'm2b1' }, base: 'base.ph',
        check: q('fix-hh', 'Caso corto: pKa = 4,76, [A⁻] = 0,2 M y [HA] = 0,1 M. pH =', [{ text: '5,06', correct: true }, { text: '4,46', note: 'Invertiste la razón.' }, { text: '4,76', note: 'Solo si son iguales.' }], { concept: 'ana.debil', explain: '4,76 + log 2 = 5,06.', slide: 5 }) },
      'indicator-range': { label: 'Elegiste mal el indicador', why: 'El indicador debe **virar dentro del salto** de pH de la curva, idealmente cerca del pH de equivalencia. Ácido débil + base fuerte (equivalencia ≈ 8,7) → **fenolftaleína** (8,2–10). Base débil + ácido fuerte (equivalencia ácida) → **rojo de metilo** (4,4–6,2).',
        prereq: { title: 'Indicadores', mission: 'm1', block: 'm1b2' }, base: 'base.ph' },
      'dilution-ignored': { label: 'Olvidaste que el volumen total cambia', why: 'Al agregar titulante el volumen total **crece**: la concentración de lo que sobra = mmol sobrantes / (**V_inicial + V_agregado**).',
        prereq: { title: 'Ácido fuerte con base fuerte', mission: 'm1', block: 'm1b1' }, base: 'base.ph' }
    },
    goal: {
      total: 100, text: 'Asegurar los 40 puntos de ácido-base de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P5', label: 'Curva fuerte-fuerte e indicadores', points: 15, missions: ['m1'] },
        { id: 'P6', label: 'Ácido débil, tampón y polipróticos', points: 25, missions: ['m2'] }
      ],
      rest: [{ label: 'Conceptos, etapas y errores', points: 35, note: 'clase ana-01' }, { label: 'Volumetría: cálculos y alícuotas', points: 25, note: 'clase ana-02' }]
    },
    glossary: [
      { term: 'Curva de titulación', mission: 'm1', def: 'Gráfico del pH frente al volumen de titulante agregado.', simple: 'Cómo cambia el pH mientras titulas.', simpler: 'La historia del pH, gota a gota.' },
      { term: 'Salto de pH', mission: 'm1', def: 'Cambio brusco de pH alrededor del punto de equivalencia.', simple: 'Donde el pH se dispara.', simpler: 'El acantilado de la curva.' },
      { term: 'Indicador ácido-base', mission: 'm1', def: 'Ácido o base débil cuyo color cambia en un intervalo de pH (≈ pKa del indicador ± 1).', simple: 'Un colorante que cambia con el pH.', simpler: 'Un semáforo de pH.' },
      { term: 'Tampón (buffer)', mission: 'm2', def: 'Mezcla de un ácido débil y su base conjugada que resiste cambios de pH.', simple: 'Una mezcla que no deja que el pH cambie mucho.', simpler: 'Un amortiguador, como el de un auto.' },
      { term: 'Ácido poliprótico', mission: 'm2', def: 'Ácido que puede ceder más de un protón (H₂SO₄, H₃PO₄, H₂CO₃), con varios Ka.', simple: 'Un ácido con varios H⁺ para entregar.', simpler: 'Una caja con varios regalos que se abren de a uno.' }
    ],
    concepts: [
      { id: 'base.ph', title: 'pH, pOH y logaritmos', root: true },
      { id: 'base.ka', title: 'Ka, pKa y fuerza ácida', root: true },
      { id: 'ana.fuerte', mission: 'm1', title: 'Curva ácido fuerte – base fuerte', needs: ['base.ph'] },
      { id: 'ana.indicador', mission: 'm1', title: 'Elegir el indicador', needs: ['ana.fuerte'] },
      { id: 'ana.debil', mission: 'm2', title: 'Curva ácido débil – base fuerte', needs: ['base.ka', 'ana.fuerte'] },
      { id: 'ana.poli', mission: 'm2', title: 'Ácidos polipróticos', needs: ['ana.debil'] }
    ],
    curiosities: [
      { text: 'La fenolftaleína se usó durante décadas como laxante; se retiró en EE. UU. en 1999 por dudas sobre su seguridad.', slide: 3 },
      { text: 'La sangre es un tampón: el par H₂CO₃/HCO₃⁻ la mantiene en pH 7,35–7,45. Salirse de ese rango es una urgencia médica (acidosis o alcalosis).', slide: 5 },
      { text: 'Muchos indicadores son naturales: el repollo morado cambia de rojo a verde según el pH por sus antocianinas.', slide: 3 }
    ],
    slideImages: {},
    slides: {
      1: { title: 'Curva de titulación', bullets: ['pH frente a volumen de titulante', 'Zonas: inicio, antes de la equivalencia, equivalencia, exceso'] },
      2: { title: 'Ácido fuerte con base fuerte', bullets: ['50,00 mL HCl 0,1000 M con NaOH 0,1000 M', 'pH: 1,00 (0) · 1,48 (25) · 3,00 (49) · 7,00 (50) · 11,00 (51) · 11,96 (60 mL)', 'Equivalencia: pH = 7'] },
      3: { title: 'Indicadores', bullets: ['Naranja de metilo 3,1–4,4 · rojo de metilo 4,4–6,2', 'Azul de bromotimol 6,0–7,6 · fenolftaleína 8,2–10,0', 'Debe virar dentro del salto'] },
      4: { title: 'Ácido débil con base fuerte', bullets: ['50,00 mL CH₃COOH 0,1000 M (Ka = 1,75 × 10⁻⁵) con NaOH 0,1000 M', 'pH: 2,88 (0) · 4,15 (10) · 4,76 (25) · 5,36 (40) · 8,73 (50 mL)'] },
      5: { title: 'Henderson-Hasselbalch', bullets: ['pH = pKa + log([A⁻]/[HA])', 'Media titulación: pH = pKa', 'Zona tampón: pKa ± 1'] },
      6: { title: 'Ácidos polipróticos', bullets: ['H₃PO₄: pKa 2,15 · 7,20 · 12,35', 'Equivalencias: pH ≈ (pKa₁ + pKa₂)/2 = 4,68 y (pKa₂ + pKa₃)/2 = 9,78', 'Saltos visibles si los pKa difieren en más de ~4'] }
    },
    missions: [
      {
        id: 'm1', title: 'La curva fuerte-fuerte', subtitle: 'Zonas de la curva e indicadores', minutes: 25, slides: '1–3', pep: 'P5: curva fuerte-fuerte',
        stages: {
          hook: { title: 'El acantilado del pH', sage: 'Durante 49 mL el pH sube apenas de 1 a 3. Con UNA gota más se dispara a 7… y con otra a 11. Ese acantilado es lo que el indicador tiene que atrapar.',
            text: 'En la PEP te pedirán calcular el pH en distintos puntos de una curva y elegir el indicador. La clave: preguntarse **qué sobra** en cada zona.' },
          diagnostic: [
            q('m1-d1', 'En la equivalencia de HCl con NaOH, el pH es…', [{ text: '7', correct: true }, { text: 'Menor que 7', note: 'NaCl no es ácido ni básico.' }, { text: 'Mayor que 7', misconception: 'eq-ph7' }], { concept: 'ana.fuerte', explain: 'Solo queda NaCl y agua.', slide: 2 }),
            q('m1-d2', '[H⁺] = 0,001 M. pH =', [{ text: '3', correct: true }, { text: '−3', note: 'pH = −log[H⁺].' }, { text: '0,001', note: 'Falta el logaritmo.' }], { concept: 'base.ph', explain: '−log 10⁻³ = 3.', slide: 2 })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.ph', title: 'Desde cero: pH', slide: 2, body: '**pH = −log[H⁺]** y **pOH = −log[OH⁻]**; a 25 °C, **pH + pOH = 14**. Cada unidad de pH es un factor 10 en [H⁺].',
              deeper: '[H⁺] = 0,1 M → pH 1. [OH⁻] = 0,001 M → pOH 3 → pH 11. Con la calculadora: log(0,0333) = −1,48 → pH 1,48.' }
          ],
          explain: [],
          transfer: [
            num('m1-t1', 'Estilo PEP: 50,00 mL de HCl 0,1000 M se titulan con NaOH 0,1000 M. Calcula el pH después de agregar 25,00 mL.', 1.48, '',
              { concept: 'ana.fuerte', label: 'pH', slide: 2, tol: 0.01, traps: [{ value: 1.3, note: 'Olvidaste que el volumen total ahora es 75,00 mL.', misconception: 'dilution-ignored' }, { value: 7, note: 'Aún no llegas a la equivalencia (50 mL).' }],
                solution: ['Inicial: 50,00 × 0,1000 = 5,000 mmol H⁺', 'Agregado: 25,00 × 0,1000 = 2,500 mmol OH⁻', 'Sobra 2,500 mmol H⁺ en 75,00 mL → 0,0333 M', 'pH = −log 0,0333 = 1,48'], explain: 'pH = 1,48.' }),
            num('m1-t2', 'Estilo PEP: en la misma titulación, calcula el pH después de agregar 60,00 mL de NaOH.', 11.96, '',
              { concept: 'ana.fuerte', label: 'pH', slide: 2, tol: 0.005, traps: [{ value: 2.04, note: 'Ese es el pOH: pH = 14 − pOH.' }, { value: 12.3, note: 'Dividiste por 50 mL: el volumen total es 110 mL.', misconception: 'dilution-ignored' }],
                solution: ['Exceso: 6,000 − 5,000 = 1,000 mmol OH⁻', '[OH⁻] = 1,000 / 110,0 = 0,00909 M → pOH 2,04', 'pH = 14 − 2,04 = 11,96'], explain: 'pH = 11,96.' }),
            write('m1-w1', 'Enséñale a tu compañero: ¿cómo decides qué fórmula usar en cada punto de una curva fuerte-fuerte?', 'Me pregunto qué sobra. Antes de la equivalencia sobra ácido fuerte: [H⁺] = mmol sobrantes divididos por el volumen total. En la equivalencia no sobra nada y el pH es 7. Después sobra base fuerte: calculo [OH⁻] con el exceso y el volumen total, saco pOH y hago pH = 14 − pOH.',
              ['Preguntarse qué sobra (mmol)', 'Dividir por el volumen total', 'Equivalencia fuerte-fuerte: pH 7; exceso de base: pH = 14 − pOH'],
              { concept: 'ana.fuerte', explain: '¿Qué sobra?', slide: 2, teach: true, keywords: [{ label: 'sobra / exceso', any: ['sobra', 'exceso'] }, { label: 'volumen total', any: ['volumen total', 'total'] }, { label: 'pOH', any: ['poh', '14'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **calcular el pH en cada zona**.',
            pretest: q('m1-pre1', 'Adivina antes: a mitad de una titulación fuerte-fuerte, el pH…', [{ text: 'Ha subido muy poco', correct: true }, { text: 'Ya está cerca de 7', note: 'El salto se concentra cerca de la equivalencia.' }, { text: 'Bajó', note: 'Agregas base: sube.' }], { concept: 'ana.fuerte', explain: 'De 1,00 a 1,48.', slide: 2 }),
            explain: [
              { id: 'm1b1', concept: 'ana.fuerte', title: 'Ácido fuerte con base fuerte', slide: 2, body: 'Pregúntate **qué sobra**. **Inicio**: pH = −log C(ácido). **Antes de la equivalencia**: [H⁺] = (mmol ácido − mmol base) / **V total**. **Equivalencia**: solo sal neutra → **pH = 7**. **Después**: [OH⁻] = (mmol base − mmol ácido) / V total → pH = 14 − pOH.',
                deeper: '50,00 mL HCl 0,1000 M con NaOH 0,1000 M: 0 mL → 1,00; 25 → 1,48; 49 → 3,00; 50 → 7,00; 51 → 11,00; 60 → 11,96. Fíjate: entre 49 y 51 mL (dos gotas grandes) el pH salta 8 unidades.' }
            ],
            practice: [
              num('m1-p1', '50,00 mL de HCl 0,1000 M con 49,00 mL de NaOH 0,1000 M. pH =', 3.0, '',
                { concept: 'ana.fuerte', label: 'pH', slide: 2, tol: 0.01, hint: 'Sobra 0,100 mmol de H⁺ en 99,00 mL.', traps: [{ value: 2.0, note: 'Divide por el volumen total (99 mL).', misconception: 'dilution-ignored' }], solution: ['Sobra 5,000 − 4,900 = 0,100 mmol H⁺', '[H⁺] = 0,100/99,00 = 1,01 × 10⁻³ M', 'pH = 3,00'], explain: 'pH = 3,00.' }),
              order('m1-p2', 'Ordena los pH de menor a mayor (HCl 50,00 mL 0,1 M con NaOH 0,1 M):', [['a', '0 mL'], ['b', '25 mL'], ['c', '49 mL'], ['d', '50 mL'], ['e', '51 mL']], ['a', 'b', 'c', 'd', 'e'],
                { concept: 'ana.fuerte', direction: 'De menor a mayor pH.', explain: '1,00 · 1,48 · 3,00 · 7,00 · 11,00.', slide: 2, hint: 'Más base = más pH.' }),
              classify('m1-p3', '¿Qué especie manda el pH en cada zona?', [['h', 'H⁺ sobrante'], ['n', 'Nada sobra (pH 7)'], ['oh', 'OH⁻ sobrante']],
                [['a', 'Antes de agregar base', 'h'], ['b', 'A 25 mL (mitad)', 'h'], ['c', 'Justo en 50 mL', 'n'], ['d', 'A 60 mL', 'oh']],
                { concept: 'ana.fuerte', explain: '¿Qué sobra?', slide: 2, hint: 'La equivalencia es 50 mL.' })
            ],
            rule: { title: 'Regla del sabio: curva fuerte-fuerte', concept: 'ana.fuerte', steps: ['Calcula mmol de ácido y de base', '¿Qué sobra? Divide por el volumen TOTAL', 'H⁺ → pH; nada → 7; OH⁻ → pOH → 14 − pOH'] } },
          { id: 'r2', intro: 'Parte 2: **elegir el indicador**.',
            pretest: q('m1-pre2', 'Adivina antes: ¿cuándo cambia de color un indicador?', [{ text: 'En un intervalo de pH cercano a su pKa', correct: true }, { text: 'Siempre en pH 7', note: 'Cada indicador tiene su intervalo.' }, { text: 'Cuando se acaba el ácido, sin importar el pH', note: 'Responde al pH.' }], { concept: 'ana.indicador', explain: 'pKa(ind) ± 1.', slide: 3 }),
            explain: [
              { id: 'm1b2', concept: 'ana.indicador', title: 'Indicadores', slide: 3, body: 'Un indicador es un ácido débil (HIn) cuyo color ácido y básico son distintos: vira en **pH ≈ pKa(HIn) ± 1**. Debe virar **dentro del salto** de la curva. Intervalos: **naranja de metilo 3,1–4,4**, **rojo de metilo 4,4–6,2**, **azul de bromotimol 6,0–7,6**, **fenolftaleína 8,2–10,0**.',
                deeper: 'En fuerte-fuerte (0,1 M) el salto va de ~3 a ~11: casi todos sirven. Con ácido débil el salto empieza más arriba (~7) y termina ~11: fenolftaleína. Con base débil + ácido fuerte el salto es ácido (~3 a ~7): rojo de metilo.' }
            ],
            practice: [
              match('m1-p4', 'Une cada titulación con su mejor indicador:', [['Ácido acético + NaOH (equivalencia ≈ 8,7)', 'Fenolftaleína (8,2–10,0)'], ['NH₃ + HCl (equivalencia ≈ 5,3)', 'Rojo de metilo (4,4–6,2)'], ['HCl + NaOH (equivalencia 7)', 'Azul de bromotimol (6,0–7,6)']],
                { concept: 'ana.indicador', explain: 'Que vire cerca de la equivalencia.', slide: 3, hint: 'Busca el intervalo que contiene el pH de equivalencia.', misconception: 'indicator-range' }),
              q('m1-p5', 'Para titular ácido acético con NaOH, ¿por qué NO sirve el naranja de metilo (3,1–4,4)?', [{ text: 'Viraría mucho antes de la equivalencia (pH ≈ 8,7)', correct: true }, { text: 'Porque es muy caro', note: 'No es el punto.' }, { text: 'Porque reacciona con el acetato', note: 'El problema es su intervalo.' }],
                { concept: 'ana.indicador', explain: 'Ese pH se alcanza en la zona tampón.', slide: 3, hint: 'Compara su intervalo con el pH de equivalencia.', misconception: 'indicator-range' }),
              spot('m1-fx1', 'Un aprendiz eligió indicador para NH₃ con HCl. ¿Dónde se equivocó?', ['En la equivalencia queda NH₄⁺ (ácido débil)', 'Entonces el pH de equivalencia es mayor que 7', 'Elijo fenolftaleína'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'El pH de equivalencia es menor que 7: rojo de metilo', correct: true }, { text: 'Es exactamente 7: cualquiera', note: 'NH₄⁺ es ácido.', misconception: 'eq-ph7' }] },
                { concept: 'ana.indicador', slide: 3, stepNotes: { 0: 'Correcto.', 2: 'Viene del error anterior.' }, explain: 'NH₄⁺ acidifica: equivalencia ≈ 5,3.', hint: '¿NH₄⁺ es ácido o básico?' })
            ],
            rule: { title: 'Regla del sabio: el indicador', concept: 'ana.indicador', steps: ['Calcula (o estima) el pH de equivalencia', 'Elige un indicador cuyo intervalo lo contenga', 'Ácido débil → fenolftaleína; base débil → rojo de metilo'] } }
        ]
      },
      {
        id: 'm2', title: 'Ácidos débiles y polipróticos', subtitle: 'Tampón, media titulación y varios saltos', minutes: 30, slides: '4–6', pep: 'P6: ácido débil',
        stages: {
          hook: { title: 'El vinagre que resiste', sage: 'Agregas 10 mL de NaOH al vinagre y el pH sube a 4,15. Agregas 30 mL más… y llega apenas a 5,36. El ácido acético y el acetato forman un tampón que pelea cada gota.',
            text: 'La curva de un ácido débil tiene una meseta (tampón), un punto mágico (a media titulación pH = pKa) y una equivalencia **básica**. En la PEP salen los cuatro cálculos.' },
          diagnostic: [
            q('m2-d1', 'En la equivalencia de ácido acético con NaOH, el pH es…', [{ text: 'Mayor que 7', correct: true }, { text: '7', misconception: 'eq-ph7' }, { text: 'Menor que 7', note: 'Queda acetato, una base.' }], { concept: 'ana.debil', explain: 'El acetato hidroliza: pH 8,73.', slide: 4 }),
            q('m2-d2', 'A la mitad del volumen de equivalencia de un ácido débil…', [{ text: 'pH = pKa', correct: true }, { text: 'pH = 7', note: 'Eso es fuerte-fuerte en la equivalencia.' }, { text: 'pH = pKa/2', misconception: 'half-eq' }], { concept: 'ana.debil', explain: '[HA] = [A⁻].', slide: 5 })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.ka', title: 'Desde cero: Ka y pKa', slide: 4, body: 'Un ácido débil se disocia poco: **HA ⇌ H⁺ + A⁻**, **Ka = [H⁺][A⁻]/[HA]**. **pKa = −log Ka**: mientras **menor** el pKa, **más fuerte** el ácido. Para su base conjugada: **Kb = Kw/Ka**.',
              deeper: 'Ácido acético: Ka = 1,75 × 10⁻⁵ → pKa = 4,76. Acetato: Kb = 10⁻¹⁴/1,75 × 10⁻⁵ = 5,7 × 10⁻¹⁰. pH de un ácido débil solo: [H⁺] ≈ √(Ka·C).' }
          ],
          explain: [],
          transfer: [
            num('m2-t1', 'Estilo PEP: 50,00 mL de CH₃COOH 0,1000 M (Ka = 1,75 × 10⁻⁵) se titulan con NaOH 0,1000 M. Calcula el pH después de agregar 10,00 mL.', 4.15, '',
              { concept: 'ana.debil', label: 'pH', slide: 5, tol: 0.01, traps: [{ value: 5.36, note: 'Invertiste la razón: A⁻ arriba.', misconception: 'hh-ratio' }, { value: 4.76, note: 'Eso es a media titulación (25 mL).', misconception: 'half-eq' }],
                solution: ['Agregado: 1,000 mmol OH⁻ → 1,000 mmol A⁻; queda 4,000 mmol HA', 'pH = 4,757 + log(1,000/4,000)', 'pH = 4,757 − 0,602 = 4,15'], explain: 'pH = 4,15.' }),
            num('m2-t2', 'Estilo PEP: en la misma titulación, calcula el pH en el punto de equivalencia (50,00 mL de NaOH).', 8.73, '',
              { concept: 'ana.debil', label: 'pH', slide: 4, tol: 0.005, traps: [{ value: 7, note: 'Con ácido débil la equivalencia es básica.', misconception: 'eq-ph7' }, { value: 5.27, note: 'Ese es el pOH.' }, { value: 8.88, note: 'Olvidaste que el volumen se duplicó (C = 0,0500 M).', misconception: 'dilution-ignored' }],
                solution: ['5,000 mmol A⁻ en 100,0 mL → 0,0500 M', 'Kb = 10⁻¹⁴/1,75 × 10⁻⁵ = 5,71 × 10⁻¹⁰', '[OH⁻] = √(Kb·C) = 5,35 × 10⁻⁶ → pOH 5,27', 'pH = 8,73'], explain: 'pH = 8,73.' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿por qué en la equivalencia de ácido acético con NaOH el pH no es 7?', 'Porque en la equivalencia todo el ácido acético se transformó en acetato, que es la base conjugada de un ácido débil. El acetato reacciona con el agua y produce OH⁻, así que el pH queda sobre 7 (8,73 con 0,1 M). Solo con ácido fuerte y base fuerte queda una sal neutra y pH 7.',
              ['En la equivalencia queda la base conjugada (acetato)', 'El acetato hidroliza y genera OH⁻', 'pH > 7; solo fuerte-fuerte da 7'],
              { concept: 'ana.debil', explain: 'Base conjugada.', slide: 4, teach: true, keywords: [{ label: 'acetato / base conjugada', any: ['acetato', 'conjugad'] }, { label: 'OH⁻ / hidrólisis', any: ['oh', 'hidról', 'hidrol', 'básic', 'basic'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **ácido débil con base fuerte**.',
            pretest: q('m2-pre1', 'Adivina antes: el pH inicial de ácido acético 0,1 M es…', [{ text: 'Cerca de 2,9', correct: true }, { text: '1,0', note: 'Eso sería si se disociara entero (ácido fuerte).' }, { text: '7', note: 'Es un ácido.' }], { concept: 'ana.debil', explain: '√(Ka·C) = 1,32 × 10⁻³ → 2,88.', slide: 4 }),
            explain: [
              { id: 'm2b1', concept: 'ana.debil', title: 'Ácido débil con base fuerte', slide: 5, body: 'Cuatro zonas: **Inicio**: [H⁺] ≈ √(Ka·C). **Tampón** (antes de la equivalencia): **pH = pKa + log(mmol A⁻/mmol HA)** (Henderson-Hasselbalch; los volúmenes se cancelan). **Media titulación**: **pH = pKa**. **Equivalencia**: solo A⁻ → [OH⁻] ≈ √(Kb·C), con **C = mmol/V total** y Kb = Kw/Ka → **pH > 7**. **Exceso**: manda el OH⁻ sobrante, como en fuerte-fuerte.',
                deeper: 'CH₃COOH 50,00 mL 0,1000 M (pKa 4,757): 0 mL → 2,88; 10 → 4,15; 25 → 4,76; 40 → 5,36; 50 → 8,73. Fíjate que el salto es más corto que en fuerte-fuerte: por eso el indicador importa más.' }
            ],
            practice: [
              num('m2-p1', 'Misma titulación (pKa 4,757): pH después de 40,00 mL de NaOH.', 5.36, '',
                { concept: 'ana.debil', label: 'pH', slide: 5, tol: 0.01, hint: 'A⁻ = 4,000 mmol; HA = 1,000 mmol.', traps: [{ value: 4.15, note: 'Invertiste la razón.', misconception: 'hh-ratio' }], solution: ['pH = 4,757 + log(4,000/1,000)', '= 4,757 + 0,602 = 5,36'], explain: 'pH = 5,36.' }),
              q('m2-p2', 'En la curva de un ácido débil desconocido, la equivalencia está en 30,0 mL y a 15,0 mL el pH es 4,20. ¿Cuál es su pKa?', [{ text: '4,20', correct: true }, { text: '8,40', note: 'A media titulación pH = pKa directamente.' }, { text: '2,10', misconception: 'half-eq' }],
                { concept: 'ana.debil', explain: '15,0 es la mitad de 30,0: pH = pKa.', slide: 5, hint: '¿Qué tiene de especial 15,0 mL?' }),
              classify('m2-p3', '¿Qué fórmula usas en cada punto (ácido débil + NaOH)?', [['ini', '√(Ka·C)'], ['hh', 'Henderson-Hasselbalch'], ['kb', '√(Kb·C) de la base conjugada'], ['exc', 'OH⁻ sobrante']],
                [['a', 'Antes de agregar NaOH', 'ini'], ['b', 'A 10 mL (antes de la equivalencia)', 'hh'], ['c', 'En la equivalencia', 'kb'], ['d', 'Pasada la equivalencia', 'exc']],
                { concept: 'ana.debil', explain: 'Cuatro zonas, cuatro fórmulas.', slide: 5, hint: '¿Qué hay en el matraz en cada punto?' })
            ],
            rule: { title: 'Regla del sabio: ácido débil', concept: 'ana.debil', steps: ['Inicio: [H⁺] = √(Ka·C)', 'Tampón: pH = pKa + log(A⁻/HA); a la mitad pH = pKa', 'Equivalencia: A⁻ con Kb = Kw/Ka y V total → pH > 7'] } },
          { id: 'r2', intro: 'Parte 2: **ácidos polipróticos**.',
            pretest: q('m2-pre2', 'Adivina antes: ¿cuántos saltos puede mostrar la curva del H₃PO₄ con NaOH?', [{ text: 'Dos bien visibles (el tercero no se ve en agua)', correct: true }, { text: 'Uno', note: 'Los pKa están bien separados.' }, { text: 'Tres iguales', note: 'El tercer H⁺ es demasiado débil (pKa 12,35).' }], { concept: 'ana.poli', explain: 'pKa₃ muy alto.', slide: 6 }),
            explain: [
              { id: 'm2b2', concept: 'ana.poli', title: 'Ácidos polipróticos', slide: 6, body: 'Un ácido **poliprótico** cede sus H⁺ **de a uno**, cada uno con su Ka. Si los pKa están separados (más de ~4 unidades), cada protón da un **salto** propio. En cada equivalencia queda un **anfolito** (H₂PO₄⁻, HPO₄²⁻) y **pH ≈ (pKaₙ + pKaₙ₊₁)/2**. Entre equivalencias hay zonas tampón con pH = pKa a la mitad de cada tramo.',
                deeper: 'H₃PO₄ (pKa 2,15; 7,20; 12,35): primera equivalencia pH ≈ (2,15 + 7,20)/2 = 4,68 (rojo de metilo); segunda ≈ (7,20 + 12,35)/2 = 9,78 (fenolftaleína/timolftaleína). El segundo volumen de equivalencia es el **doble** del primero.' }
            ],
            practice: [
              num('m2-p4', 'H₃PO₄ (pKa₁ 2,15; pKa₂ 7,20; pKa₃ 12,35). ¿pH en la segunda equivalencia?', 9.775, '',
                { concept: 'ana.poli', label: 'pH', slide: 6, tol: 0.005, hint: 'Promedio de pKa₂ y pKa₃.', traps: [{ value: 4.675, note: 'Esa es la primera equivalencia.' }, { value: 7.2, note: 'pKa₂ es a la mitad del segundo tramo, no en la equivalencia.', misconception: 'half-eq' }], solution: ['pH ≈ (7,20 + 12,35)/2 = 9,78'], explain: '9,78.' }),
              order('m2-p5', 'Ordena las especies que predominan al agregar NaOH a H₃PO₄:', [['a', 'H₃PO₄'], ['b', 'H₂PO₄⁻'], ['c', 'HPO₄²⁻'], ['d', 'PO₄³⁻']], ['a', 'b', 'c', 'd'],
                { concept: 'ana.poli', direction: 'Del inicio al final.', explain: 'Se va un H⁺ cada vez.', slide: 6, hint: 'Cada OH⁻ saca un H⁺.' }),
              q('m2-p6', 'La primera equivalencia del H₃PO₄ está en 12,0 mL. ¿Dónde está la segunda?', [{ text: '24,0 mL', correct: true }, { text: '18,0 mL', note: 'Cada protón gasta el mismo volumen.' }, { text: '36,0 mL', note: 'Esa sería la tercera.' }],
                { concept: 'ana.poli', explain: 'Mismo volumen por protón.', slide: 6, hint: 'Un protón por tramo.', misconception: 'dilution-ignored' })
            ],
            rule: { title: 'Regla del sabio: polipróticos', concept: 'ana.poli', steps: ['Un salto por protón (si los pKa están separados)', 'Equivalencia n: pH ≈ (pKaₙ + pKaₙ₊₁)/2', 'Cada tramo gasta el mismo volumen'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.ph', title: 'pH y logaritmos', subtitle: 'pH, pOH y 14', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.ph', title: 'pH y pOH', slide: 2, body: '**pH = −log[H⁺]**, **pOH = −log[OH⁻]**, **pH + pOH = 14** (25 °C). [H⁺] = 10^(−pH).',
            deeper: '[H⁺] = 2,5 × 10⁻⁴ → pH = 3,60. pH 9 → pOH 5 → [OH⁻] = 10⁻⁵ M.' }],
          practice: [
            num('z1-p1', '[OH⁻] = 0,0100 M. pH =', 12, '', { concept: 'base.ph', label: 'pH', slide: 2, tol: 0.005, hint: 'pOH = 2; pH = 14 − pOH.', traps: [{ value: 2, note: 'Ese es el pOH.' }], solution: ['pOH = −log 0,0100 = 2', 'pH = 14 − 2 = 12'], explain: '12.' }),
            q('z1-p2', 'Si el pH baja de 4 a 3, [H⁺]…', [{ text: 'Se multiplica por 10', correct: true }, { text: 'Sube 1 M', note: 'Es logarítmico.' }, { text: 'Se divide por 10', note: 'Menor pH = más ácido.' }], { concept: 'base.ph', explain: 'Factor 10.', slide: 2, hint: 'pH = −log.' })
          ],
          transfer: [write('z1-w1', 'Explica por qué un cambio de 1 unidad de pH es tan grande.', 'Porque la escala es logarítmica: bajar una unidad de pH significa que la concentración de H⁺ se multiplica por diez. Por eso de pH 3 a pH 1 hay cien veces más H⁺.',
            ['Escala logarítmica', '1 unidad = factor 10 en [H⁺]', 'Menor pH = más H⁺'],
            { concept: 'base.ph', explain: 'Logaritmo.', slide: 2, keywords: [{ label: 'logarítmica', any: ['logar', 'log'] }, { label: 'factor 10', any: ['diez', '10'] }] })]
        } },
      { id: 'z2', concept: 'base.ka', title: 'Ka y pKa', subtitle: 'Fuerza de un ácido débil', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.ka', title: 'Ka, pKa y Kb', slide: 4, body: '**Ka** grande = ácido más fuerte. **pKa = −log Ka**: menor pKa = más fuerte. **Ka·Kb = Kw = 10⁻¹⁴**. Ácido débil solo: **[H⁺] ≈ √(Ka·C)**.',
            deeper: 'Fórmico (pKa 3,75) es más fuerte que acético (4,76). Para 0,1 M de acético: √(1,75 × 10⁻⁶) = 1,32 × 10⁻³ → pH 2,88.' }],
          practice: [
            num('z2-p1', 'Ka = 1,75 × 10⁻⁵. pKa =', 4.757, '', { concept: 'base.ka', label: 'pKa', slide: 4, tol: 0.002, hint: 'pKa = −log Ka.', traps: [{ value: -4.757, note: 'Es menos el logaritmo.' }], solution: ['pKa = −log(1,75 × 10⁻⁵) = 4,757'], explain: '4,757.' }),
            q('z2-p2', '¿Cuál es el ácido más fuerte?', [{ text: 'pKa = 3,2', correct: true }, { text: 'pKa = 4,8', note: 'Mayor pKa = más débil.' }, { text: 'pKa = 9,2', note: 'Muy débil.' }], { concept: 'base.ka', explain: 'Menor pKa.', slide: 4, hint: 'pKa chico = Ka grande.' })
          ],
          transfer: [write('z2-w1', 'Explica qué significa que un ácido tenga pKa = 4,76.', 'Significa que es un ácido débil con Ka = 10⁻⁴·⁷⁶ ≈ 1,75 × 10⁻⁵, que se disocia poco, y que a pH 4,76 hay la misma cantidad de ácido sin disociar que de su base conjugada.',
            ['Ka = 10^(−pKa): ácido débil', 'Se disocia poco', 'A pH = pKa, [HA] = [A⁻]'],
            { concept: 'base.ka', explain: 'pKa.', slide: 4, keywords: [{ label: 'débil', any: ['débil', 'debil', 'poco'] }, { label: 'mitad / igual', any: ['igual', 'misma', 'mitad'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-fuerte', title: 'Curva fuerte-fuerte', formula: '[H⁺] o [OH⁻] = |mmol ácido − mmol base| / (V₀ + V) · pH = 14 − pOH', concepts: ['ana.fuerte'], vars: [['V₀', 'volumen inicial', 'mL'], ['V', 'volumen agregado', 'mL']],
        what: 'pH en cualquier punto de fuerte-fuerte.', when: 'HCl con NaOH y similares.', example: '25 mL de 50: pH 1,48; 60 mL: pH 11,96.', deeper: 'En la equivalencia, pH 7.',
        sources: [{ label: 'Skoog, cap. 14', slide: 2 }],
        calc: { inputs: [{ id: 'va', label: 'V ácido (mL)', value: 50, step: 0.01 }, { id: 'ca', label: 'C ácido (M)', value: 0.1, step: 0.0001 }, { id: 'vb', label: 'V base (mL)', value: 25, step: 0.01 }, { id: 'cb', label: 'C base (M)', value: 0.1, step: 0.0001 }],
          run: v => { const d = v.va * v.ca - v.vb * v.cb, V = v.va + v.vb; const pH = Math.abs(d) < 1e-9 ? 7 : d > 0 ? -Math.log10(d / V) : 14 + Math.log10(-d / V); return 'pH = **' + pH.toFixed(2).replace('.', ',') + '**'; } } },
      { id: 'f-hh', title: 'Henderson-Hasselbalch', formula: 'pH = pKa + log(n_A⁻ / n_HA)', concepts: ['ana.debil'], vars: [['pKa', '−log Ka', '—'], ['n_A⁻', 'mmol de base conjugada', 'mmol'], ['n_HA', 'mmol de ácido', 'mmol']],
        what: 'pH en la zona tampón.', when: 'Antes de la equivalencia de un ácido débil.', example: 'Acético 10 mL de 50: 4,757 + log(1/4) = 4,15.', deeper: 'A media titulación, pH = pKa.',
        sources: [{ label: 'Skoog, cap. 14', slide: 5 }],
        calc: { inputs: [{ id: 'pka', label: 'pKa', value: 4.757, step: 0.001 }, { id: 'a', label: 'mmol A⁻', value: 1, step: 0.001 }, { id: 'ha', label: 'mmol HA', value: 4, step: 0.001 }], run: v => 'pH = **' + (v.pka + Math.log10(v.a / v.ha)).toFixed(2).replace('.', ',') + '**' } },
      { id: 'f-eq', title: 'pH en la equivalencia (ácido débil)', formula: 'C = mmol / V_total · Kb = Kw/Ka · [OH⁻] = √(Kb·C)', concepts: ['ana.debil'], vars: [['Kw', '10⁻¹⁴', '—'], ['C', 'concentración de A⁻', 'M']],
        what: 'pH básico de la equivalencia.', when: 'Ácido débil con base fuerte.', example: 'Acético 0,1 M: C = 0,05 M → pH 8,73.', deeper: 'No olvides el volumen total.',
        sources: [{ label: 'Skoog, cap. 14', slide: 4 }],
        calc: { inputs: [{ id: 'ka', label: 'Ka', value: 1.75e-5, step: 1e-6 }, { id: 'c', label: 'C de A⁻ (M)', value: 0.05, step: 0.001 }], run: v => 'pH = **' + (14 + Math.log10(Math.sqrt(1e-14 / v.ka * v.c))).toFixed(2).replace('.', ',') + '**' } }
    ],
    recipes: [],
    mini: {
      'base.ph': { idea: 'pH = −log[H⁺]; cada unidad es ×10.', steps: ['pH = −log[H⁺]', 'pOH = −log[OH⁻]', 'pH + pOH = 14'], check: { prompt: '[H⁺] = 10⁻⁵ → pH =', options: [{ text: '5', correct: true }, { text: '−5', note: 'Menos log.' }], explain: '5.' } },
      'base.ka': { idea: 'pKa chico = ácido fuerte.', steps: ['pKa = −log Ka', 'Kb = Kw/Ka', '[H⁺] ≈ √(Ka·C)'], check: { prompt: 'Más fuerte: pKa 3 o pKa 5', options: [{ text: 'pKa 3', correct: true }, { text: 'pKa 5', note: 'Mayor pKa, más débil.' }], explain: 'pKa 3.' } },
      'ana.fuerte': { idea: '¿Qué sobra? Divide por el volumen total.', steps: ['mmol de cada uno', 'Resta y divide por V total', 'pH o 14 − pOH'], check: { prompt: 'Equivalencia HCl/NaOH: pH =', options: [{ text: '7', correct: true }, { text: '8,7', note: 'Eso es con ácido débil.' }], explain: '7.' } },
      'ana.indicador': { idea: 'Que vire dentro del salto.', steps: ['Estima el pH de equivalencia', 'Busca el intervalo que lo contiene', 'Débil ácido → fenolftaleína'], check: { prompt: 'Acético + NaOH:', options: [{ text: 'Fenolftaleína', correct: true }, { text: 'Naranja de metilo', note: 'Vira muy temprano.' }], explain: 'Equivalencia básica.' } },
      'ana.debil': { idea: 'Inicio, tampón, mitad = pKa, equivalencia básica.', steps: ['√(Ka·C) al inicio', 'HH en la zona tampón', '√(Kb·C) en la equivalencia'], check: { prompt: 'A media titulación pH =', options: [{ text: 'pKa', correct: true }, { text: '7', note: 'No.' }], explain: '[HA] = [A⁻].' } },
      'ana.poli': { idea: 'Un H⁺ a la vez, un salto por H⁺.', steps: ['pKa separados → saltos separados', 'Equivalencia: promedio de pKa vecinos', 'Mismo volumen por tramo'], check: { prompt: '1ª equivalencia de H₃PO₄: pH ≈', options: [{ text: '4,7', correct: true }, { text: '7,2', note: 'Ese es pKa₂.' }], explain: '(2,15 + 7,20)/2.' } }
    },
    deep: {},
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', '[H⁺] = 0,01 M → pH =', [{ text: '2', correct: true }, { text: '0,01', note: 'Falta el log.' }, { text: '12', note: 'Ese sería con OH⁻.' }], { concept: 'base.ph', explain: '−log 10⁻².', slide: 2 }) },
      { level: 1, item: q('dx-2', 'Ácido más débil:', [{ text: 'pKa 9', correct: true }, { text: 'pKa 2', note: 'Ese es más fuerte.' }, { text: 'pKa 4', note: 'Intermedio.' }], { concept: 'base.ka', explain: 'Mayor pKa.', slide: 4 }) },
      { level: 2, item: q('dx-3', 'Equivalencia HCl + NaOH: pH', [{ text: '7', correct: true }, { text: '8,7', misconception: 'eq-ph7' }, { text: '1', note: 'Ya no hay ácido.' }], { concept: 'ana.fuerte', explain: 'Sal neutra.', slide: 2 }) },
      { level: 2, item: q('dx-4', 'Indicador para acético + NaOH', [{ text: 'Fenolftaleína', correct: true }, { text: 'Naranja de metilo', misconception: 'indicator-range' }, { text: 'Ninguno sirve', note: 'Sí hay.' }], { concept: 'ana.indicador', explain: 'Equivalencia ≈ 8,7.', slide: 3 }) },
      { level: 2, item: q('dx-5', 'A media titulación de un ácido con pKa 5,0, pH =', [{ text: '5,0', correct: true }, { text: '2,5', misconception: 'half-eq' }, { text: '7,0', note: 'No.' }], { concept: 'ana.debil', explain: 'pH = pKa.', slide: 5 }) },
      { level: 3, item: q('dx-6', 'pKa 4,76; mmol A⁻ = 3; mmol HA = 1. pH ≈', [{ text: '5,24', correct: true }, { text: '4,28', misconception: 'hh-ratio' }, { text: '4,76', note: 'Solo si son iguales.' }], { concept: 'ana.debil', explain: '4,76 + log 3.', slide: 5 }) },
      { level: 3, item: q('dx-7', 'Ácido con pKa₁ 2 y pKa₂ 7: pH en la primera equivalencia ≈', [{ text: '4,5', correct: true }, { text: '7', note: 'Ese es pKa₂.' }, { text: '2', note: 'Ese es pKa₁.' }], { concept: 'ana.poli', explain: 'Promedio.', slide: 6 }) }
    ] }
  };
})();
