/* Química Analítica · PEP 1 · Curvas de titulación ácido-base (viernes 13 de noviembre).
   Fuente principal: PPT «Volumetría ácido-base» de la Dra. Carmen Pizarro (61 diapositivas, 2026). Las citas `slide` son esas diapositivas.
   Lo que la cátedra no trae (diagramas de distribución α y mezclas con carbonato o ácido fuerte + débil) sale de Skoog y Harris y está marcado como «libro».
   pKa de carbónico, oxálico, ftalato y glicina: Harvey, Analytical Chemistry 2.1, apéndice de constantes ácidas. Números recalculados en Python (docs/ana-pep1-motor/MAPA.md). */
(() => {
  'use strict';
  const SRC = 'pizarro';
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
    /* Prueba final de cada misión (estación en modo «solo Demuestra»): formato PEP, un intento, reloj opcional.
       `gen` = generador(es) de ana-03-gen.js (nivel 5); `pep` = pregunta de `goal.questions` que asegura. */
    demuestra: {
      m1: { gen: ['fuerte', 'zonas', 'indicador'], pep: 'P5', seconds: 180 },
      m2: { gen: ['debil', 'pka-curva', 'ka-curvas', 'tampon', 'poli'], pep: 'P6', seconds: 180 },
      m3: { gen: ['base-debil', 'diprotico', 'anfolito', 'alfa', 'mezcla'], pep: 'P7', seconds: 240 }
    },
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Volumetría ácido-base (PPT 2026, 61 diapositivas)', author: 'Dra. Carmen Pizarro, Química Analítica USACH', detail: 'Clase de cátedra 2026', authority: 'Material de cátedra' },
      skoog: { title: 'Fundamentos de Química Analítica (sistemas ácido-base complejos y aplicaciones de neutralización)', author: 'Skoog, West, Holler y Crouch', detail: 'Bibliografía oficial; para diagramas α y mezclas', authority: 'Libro de texto' },
      harris: { title: 'Análisis Químico Cuantitativo (ácidos polipróticos y titulaciones)', author: 'Daniel C. Harris', detail: 'Bibliografía complementaria', authority: 'Libro de texto' }
    },
    misconceptions: {
      'eq-ph7': { label: 'Creíste que en la equivalencia el pH siempre es 7', why: 'Solo con **ácido fuerte + base fuerte** el pH de equivalencia es 7. Con un **ácido débil** + base fuerte, en la equivalencia queda la **base conjugada** (acetato): el pH es **mayor que 7** (8,73 con ácido acético 0,1 M).',
        prereq: { title: 'Ácido débil con base fuerte', mission: 'm2', block: 'm2b1' }, base: 'base.ph' },
      'half-eq': { label: 'No usaste que pH = pKa a media titulación', why: 'A la **mitad** del volumen de equivalencia, [HA] = [A⁻] y Henderson-Hasselbalch da **pH = pKa**. Es la forma más rápida de leer el pKa en una curva.',
        prereq: { title: 'Ácido débil con base fuerte', mission: 'm2', block: 'm2b1' }, base: 'base.ph' },
      'hh-ratio': { label: 'Invertiste la razón en Henderson-Hasselbalch', why: '**pH = pKa + log([A⁻]/[HA])**: la base conjugada va **arriba**. Mientras más base agregas, más A⁻ y más sube el pH.',
        prereq: { title: 'Ácido débil con base fuerte', mission: 'm2', block: 'm2b1' }, base: 'base.ph',
        check: q('fix-hh', 'Caso corto: pKa = 4,76, [A⁻] = 0,2 M y [HA] = 0,1 M. pH =', [{ text: '5,06', correct: true }, { text: '4,46', note: 'Invertiste la razón.' }, { text: '4,76', note: 'Solo si son iguales.' }], { concept: 'ana.debil', explain: '4,76 + log 2 = 5,06.', slide: 42 }) },
      'indicator-range': { label: 'Elegiste mal el indicador', why: 'El indicador debe **virar dentro del salto** de pH de la curva, idealmente cerca del pH de equivalencia. Ácido débil + base fuerte (equivalencia ≈ 8,7) → **fenolftaleína** (8,2–10). Base débil + ácido fuerte (equivalencia ácida) → **rojo de metilo** (4,4–6,2).',
        prereq: { title: 'Indicadores', mission: 'm1', block: 'm1b2' }, base: 'base.ph' },
      'pkb-pka': { label: 'Usaste el pKb donde iba el pKa del ácido conjugado', why: 'En una base débil titulada con ácido, el par del tampón es **BH⁺/B**. Henderson-Hasselbalch usa el **pKa del BH⁺ = 14 − pKb**: **pH = pKa + log([B]/[BH⁺])**. A media titulación pH = 14 − pKb (9,26 para el NH₃), no pKb.',
        prereq: { title: 'Base débil con ácido fuerte', mission: 'm3', block: 'm3b1' }, base: 'base.ka' },
      'dilution-ignored': { label: 'Olvidaste que el volumen total cambia', why: 'Al agregar titulante el volumen total **crece**: la concentración de lo que sobra = mmol sobrantes / (**V_inicial + V_agregado**).',
        prereq: { title: 'Ácido fuerte con base fuerte', mission: 'm1', block: 'm1b1' }, base: 'base.ph' }
    },
    goal: {
      total: 100, text: 'Asegurar los 40 puntos de ácido-base de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P5', label: 'Curva fuerte-fuerte e indicadores', points: 12, missions: ['m1'] },
        { id: 'P6', label: 'Ácido débil y tampón', points: 14, missions: ['m2'] },
        { id: 'P7', label: 'Base débil, polipróticos, anfolitos y mezclas', points: 14, missions: ['m3'] }
      ],
      rest: [{ label: 'Conceptos, etapas y errores', points: 35, note: 'clase ana-01' }, { label: 'Volumetría: cálculos y alícuotas', points: 25, note: 'clase ana-02' }]
    },
    glossary: [
      { term: 'Curva de titulación', mission: 'm1', def: 'Gráfico del pH frente al volumen de titulante agregado.', simple: 'Cómo cambia el pH mientras titulas.', simpler: 'La historia del pH, gota a gota.' },
      { term: 'Salto de pH', mission: 'm1', def: 'Cambio brusco de pH alrededor del punto de equivalencia.', simple: 'Donde el pH se dispara.', simpler: 'El acantilado de la curva.' },
      { term: 'Indicador ácido-base', mission: 'm1', def: 'Ácido o base débil cuyo color cambia en un intervalo de pH (≈ pKa del indicador ± 1).', simple: 'Un colorante que cambia con el pH.', simpler: 'Un semáforo de pH.' },
      { term: 'Tampón (buffer)', mission: 'm2', def: 'Mezcla de un ácido débil y su base conjugada que resiste cambios de pH.', simple: 'Una mezcla que no deja que el pH cambie mucho.', simpler: 'Un amortiguador, como el de un auto.' },
      { term: 'Capacidad amortiguadora (β)', mission: 'm2', def: 'Cuánto ácido o base fuerte puede absorber un tampón por unidad de cambio de pH; es máxima cuando pH = pKa.', simple: 'Cuánto aguanta un tampón antes de ceder.', simpler: 'El tamaño del amortiguador.' },
      { term: 'Anfolito', mission: 'm3', def: 'Especie que puede ceder y recibir un H⁺ (HCO₃⁻, H₂PO₄⁻, glicina); su pH ≈ ½(pKa₁ + pKa₂).', simple: 'Una especie con doble personalidad: ácido y base a la vez.', simpler: 'El camaleón del pH.' },
      { term: 'Diagrama de distribución (α)', mission: 'm3', def: 'Gráfico de la fracción de cada especie de un ácido poliprótico en función del pH.', simple: 'Un mapa de qué forma predomina a cada pH.', simpler: 'Quién manda en cada tramo de pH.' },
      { term: 'Ácido poliprótico', mission: 'm2', def: 'Ácido que puede ceder más de un protón (H₂SO₄, H₃PO₄, H₂CO₃), con varios Ka.', simple: 'Un ácido con varios H⁺ para entregar.', simpler: 'Una caja con varios regalos que se abren de a uno.' }
    ],
    concepts: [
      { id: 'base.ph', title: 'pH, pOH y logaritmos', root: true },
      { id: 'base.ka', title: 'Ka, pKa y fuerza ácida', root: true },
      { id: 'ana.fuerte', mission: 'm1', title: 'Curva ácido fuerte – base fuerte', needs: ['base.ph'] },
      { id: 'ana.indicador', mission: 'm1', title: 'Elegir el indicador', needs: ['ana.fuerte'] },
      { id: 'ana.debil', mission: 'm2', title: 'Curva ácido débil – base fuerte', needs: ['base.ka', 'ana.fuerte'] },
      { id: 'ana.tampon', mission: 'm2', title: 'Tampones: elegir, calcular y preparar', needs: ['ana.debil'] },
      { id: 'ana.poli', mission: 'm2', title: 'Ácidos polipróticos', needs: ['ana.debil'] },
      { id: 'ana.basedebil', mission: 'm3', title: 'Curva base débil – ácido fuerte', needs: ['base.ka', 'ana.debil'] },
      { id: 'ana.diprotico', mission: 'm3', title: 'Curva de un diprótico', needs: ['ana.poli', 'ana.tampon'] },
      { id: 'ana.anfolito', mission: 'm3', title: 'pH de un anfolito', needs: ['ana.diprotico'] },
      { id: 'ana.alfa', mission: 'm3', title: 'Diagrama de distribución de especies', needs: ['ana.diprotico'] },
      { id: 'ana.mezcla', mission: 'm3', title: 'Mezclas de ácidos y de carbonatos', needs: ['ana.alfa', 'ana.anfolito'] }
    ],
    curiosities: [
      { text: 'La fenolftaleína se usó durante décadas como laxante; se retiró en EE. UU. en 1999 por dudas sobre su seguridad.', slide: 17 },
      { text: 'La sangre es un tampón: el par H₂CO₃/HCO₃⁻ la mantiene en pH 7,35–7,45. Salirse de ese rango es una urgencia médica (acidosis o alcalosis).', slide: 42 },
      { text: 'La glicina, el aminoácido más simple, es un anfolito: a pH cercano a 6 predomina su forma de «ion híbrido» (zwitterión).', slide: 54 },
      { text: 'Muchos indicadores son naturales: el repollo morado cambia de rojo a verde según el pH por sus antocianinas.', slide: 17 }
    ],
    slideImages: {},
    slides: {
      9: { title: 'Curva de titulación', bullets: ['pH frente a volumen de titulante', 'Zonas: inicio, antes de la equivalencia, equivalencia, exceso'] },
      24: { title: 'Ácido fuerte con base fuerte', bullets: ['50,00 mL HCl 0,1000 M con NaOH 0,1000 M', 'pH: 1,00 (0) · 1,48 (25) · 3,00 (49) · 7,00 (50) · 11,00 (51) · 11,96 (60 mL)', 'Equivalencia: pH = 7'] },
      17: { title: 'Indicadores', bullets: ['Naranja de metilo 3,1–4,4 · rojo de metilo 4,4–6,2', 'Azul de bromotimol 6,0–7,6 · fenolftaleína 8,2–10,0', 'Debe virar dentro del salto'] },
      47: { title: 'Ácido débil con base fuerte', bullets: ['50,00 mL CH₃COOH 0,1000 M (Ka = 1,75 × 10⁻⁵) con NaOH 0,1000 M', 'pH: 2,88 (0) · 4,15 (10) · 4,76 (25) · 5,36 (40) · 8,73 (50 mL)'] },
      42: { title: 'Henderson-Hasselbalch', bullets: ['pH = pKa + log([A⁻]/[HA])', 'Media titulación: pH = pKa', 'Zona tampón: pKa ± 1'] },
      31: { title: 'Ácidos y bases débiles: Ka y Kb', bullets: ['HA + H₂O ⇌ A⁻ + H₃O⁺ · B + H₂O ⇌ BH⁺ + OH⁻', 'Bases (pKb): dietilamina 3,16 · etilamina 3,37 · amoníaco 4,74 · hidroxilamina 8,04 · piridina 8,82 · anilina 9,13'] },
      43: { title: 'Propiedades de los amortiguadores', bullets: ['Efecto de la dilución: el pH casi no cambia', 'Efecto de agregar ácidos o bases: resiste cambios pequeños'] },
      44: { title: 'Capacidad amortiguadora β', bullets: ['β = dcb/dpH', 'Es máxima cuando pH = pKa', 'Útil en pH = pKa ± 1'] },
      45: { title: 'Preparación de un tampón', bullets: ['1,00 L de tris 0,10 M a pH 7,6', 'tris·H⁺: pKa = 8,075', 'Pesar tris·HCl, medir pH y ajustar con NaOH 0,1 M'] },
      48: { title: 'Ácido débil con base fuerte: efecto de la concentración', bullets: ['Curvas con distinta concentración', 'En el punto de equivalencia el cambio de pH es menor mientras más diluido o más débil es el ácido'] },
      51: { title: 'Base débil con ácido fuerte', bullets: ['B + H⁺ → BH⁺', 'Inicio: pH por hidrólisis de B (Kb)', 'Tampón: ecuación de Henderson-Hasselbalch', 'Equivalencia: BH⁺, pH < 7', 'Exceso: ácido fuerte'] },
      54: { title: 'Sales anfóteras o anfolitos', bullets: ['HA⁻ puede ceder o recibir un H⁺', 'pH = ½(pKa₁ + pKa₂)', 'Casi no depende de la concentración'] },
      52: { title: 'Ácidos y bases dipróticas', bullets: ['H₂A ⇌ HA⁻ + H⁺ (Ka₁) · HA⁻ ⇌ A²⁻ + H⁺ (Ka₂)', 'H₂A se trata como monoprótico de Ka₁; HA⁻ como anfolito; A²⁻ como base de Kb = Kw/Ka₂'] },
      55: { title: 'Valoración de sistemas dipróticos', bullets: ['10 mL de base B (pKb₁ = 4,0; pKb₂ = 9,0) 0,1 M con HCl 0,1 M', 'Dos saltos: uno por cada protón; dos regiones tampón y exceso de ácido'] },
      56: { title: 'Valoración de sistemas dipróticos: puntos de equivalencia', bullets: ['1.er punto: mmol de HCl = mmol de B (10 mL)', '2.º punto: el mismo volumen otra vez (20 mL)', 'Región tampón antes de cada punto'] },
      60: { title: 'Ácidos y bases polipróticos: de forma general', bullets: ['H₂A como monoprótico de Ka₁', 'HA⁻ como anfolito: [H⁺] = √(Ka₁Ka₂…)', 'A²⁻ como monoprótico de Kb = Kw/Ka₂'] },
      57: { title: 'Sistemas dipróticos: pH a lo largo de la curva (1)', bullets: ['Base B (pKb₁ = 4,0; pKb₂ = 9,0), 10 mL 0,1 M con HCl 0,1 M', 'Inicio: pOH = 2,5 → pH 11,5', '5 mL: pH = 10,00 · 1.ª equivalencia (10 mL): anfolito, pH 7,50'] },
      58: { title: 'Sistemas dipróticos: pH a lo largo de la curva (2)', bullets: ['15 mL: pH 5,00 · 2.ª equivalencia (20 mL): pH 3,24', 'Después de la 2.ª equivalencia (25 mL): pH 1,84'] },
      59: { title: 'Ácidos polipróticos', bullets: ['H₃PO₄: Ka 7,11 × 10⁻³ · 6,32 × 10⁻⁸ · 4,5 × 10⁻¹³ (pKa 2,15 · 7,20 · 12,35)', 'Equivalencias: pH ≈ (pKa₁ + pKa₂)/2 = 4,68 y (pKa₂ + pKa₃)/2 = 9,78', 'Saltos visibles si los pKa difieren en más de ~4'] }
    },
    missions: [
      {
        id: 'm1', title: 'La curva fuerte-fuerte', subtitle: 'Zonas de la curva e indicadores', minutes: 25, slides: '9–30', pep: 'P5: curva fuerte-fuerte',
        stages: {
          hook: { title: 'El acantilado del pH', sage: 'Durante 49 mL el pH sube apenas de 1 a 3. Con UNA gota más se dispara a 7… y con otra a 11. Ese acantilado es lo que el indicador tiene que atrapar.',
            text: 'En la PEP te pedirán calcular el pH en distintos puntos de una curva y elegir el indicador. La clave: preguntarse **qué sobra** en cada zona.' },
          diagnostic: [
            q('m1-d1', 'En la equivalencia de HCl con NaOH, el pH es…', [{ text: '7', correct: true }, { text: 'Menor que 7', note: 'NaCl no es ácido ni básico.' }, { text: 'Mayor que 7', misconception: 'eq-ph7' }], { concept: 'ana.fuerte', explain: 'Solo queda NaCl y agua.', slide: 24 }),
            q('m1-d2', '[H⁺] = 0,001 M. pH =', [{ text: '3', correct: true }, { text: '−3', note: 'pH = −log[H⁺].' }, { text: '0,001', note: 'Falta el logaritmo.' }], { concept: 'base.ph', explain: '−log 10⁻³ = 3.', slide: 24 })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.ph', title: 'Desde cero: pH', slide: 24, body: '**pH = −log[H⁺]** y **pOH = −log[OH⁻]**; a 25 °C, **pH + pOH = 14**. Cada unidad de pH es un factor 10 en [H⁺].',
              deeper: '[H⁺] = 0,1 M → pH 1. [OH⁻] = 0,001 M → pOH 3 → pH 11. Con la calculadora: log(0,0333) = −1,48 → pH 1,48.' }
          ],
          explain: [],
          transfer: [
            num('m1-t1', 'Estilo PEP: 50,00 mL de HCl 0,1000 M se titulan con NaOH 0,1000 M. Calcula el pH después de agregar 25,00 mL.', 1.48, '',
              { concept: 'ana.fuerte', label: 'pH', slide: 24, tol: 0.01, traps: [{ value: 1.3, note: 'Olvidaste que el volumen total ahora es 75,00 mL.', misconception: 'dilution-ignored' }, { value: 7, note: 'Aún no llegas a la equivalencia (50 mL).' }],
                solution: ['Inicial: 50,00 × 0,1000 = 5,000 mmol H⁺', 'Agregado: 25,00 × 0,1000 = 2,500 mmol OH⁻', 'Sobra 2,500 mmol H⁺ en 75,00 mL → 0,0333 M', 'pH = −log 0,0333 = 1,48'], explain: 'pH = 1,48.' }),
            num('m1-t2', 'Estilo PEP: en la misma titulación, calcula el pH después de agregar 60,00 mL de NaOH.', 11.96, '',
              { concept: 'ana.fuerte', label: 'pH', slide: 24, tol: 0.005, traps: [{ value: 2.04, note: 'Ese es el pOH: pH = 14 − pOH.' }, { value: 12.3, note: 'Dividiste por 50 mL: el volumen total es 110 mL.', misconception: 'dilution-ignored' }],
                solution: ['Exceso: 6,000 − 5,000 = 1,000 mmol OH⁻', '[OH⁻] = 1,000 / 110,0 = 0,00909 M → pOH 2,04', 'pH = 14 − 2,04 = 11,96'], explain: 'pH = 11,96.' }),
            write('m1-w1', 'Enséñale a tu compañero: ¿cómo decides qué fórmula usar en cada punto de una curva fuerte-fuerte?', 'Me pregunto qué sobra. Antes de la equivalencia sobra ácido fuerte: [H⁺] = mmol sobrantes divididos por el volumen total. En la equivalencia no sobra nada y el pH es 7. Después sobra base fuerte: calculo [OH⁻] con el exceso y el volumen total, saco pOH y hago pH = 14 − pOH.',
              ['Preguntarse qué sobra (mmol)', 'Dividir por el volumen total', 'Equivalencia fuerte-fuerte: pH 7; exceso de base: pH = 14 − pOH'],
              { concept: 'ana.fuerte', explain: '¿Qué sobra?', slide: 24, teach: true, keywords: [{ label: 'sobra / exceso', any: ['sobra', 'exceso'] }, { label: 'volumen total', any: ['volumen total', 'total'] }, { label: 'pOH', any: ['poh', '14'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **calcular el pH en cada zona**.',
            pretest: q('m1-pre1', 'Adivina antes: a mitad de una titulación fuerte-fuerte, el pH…', [{ text: 'Ha subido muy poco', correct: true }, { text: 'Ya está cerca de 7, en la zona neutra', note: 'El salto se concentra cerca de la equivalencia.' }, { text: 'Bajó, porque se agrega una base', note: 'Agregas base: sube.' }], { concept: 'ana.fuerte', explain: 'De 1,00 a 1,48.', slide: 24 }),
            explain: [
              { id: 'm1b1', concept: 'ana.fuerte', title: 'Ácido fuerte con base fuerte', slide: 24, body: 'Pregúntate **qué sobra**. **Inicio**: pH = −log C(ácido). **Antes de la equivalencia**: [H⁺] = (mmol ácido − mmol base) / **V total**. **Equivalencia**: solo sal neutra → **pH = 7**. **Después**: [OH⁻] = (mmol base − mmol ácido) / V total → pH = 14 − pOH.',
                deeper: '50,00 mL HCl 0,1000 M con NaOH 0,1000 M: 0 mL → 1,00; 25 → 1,48; 49 → 3,00; 50 → 7,00; 51 → 11,00; 60 → 11,96. Fíjate: entre 49 y 51 mL (dos gotas grandes) el pH salta 8 unidades.' }
            ],
            practice: [
              num('m1-p1', '50,00 mL de HCl 0,1000 M con 49,00 mL de NaOH 0,1000 M. pH =', 3.0, '',
                { concept: 'ana.fuerte', label: 'pH', slide: 24, tol: 0.01, hint: 'Sobra 0,100 mmol de H⁺ en 99,00 mL.', traps: [{ value: 2.0, note: 'Divide por el volumen total (99 mL).', misconception: 'dilution-ignored' }], solution: ['Sobra 5,000 − 4,900 = 0,100 mmol H⁺', '[H⁺] = 0,100/99,00 = 1,01 × 10⁻³ M', 'pH = 3,00'], explain: 'pH = 3,00.' }),
              order('m1-p2', 'Ordena los pH de menor a mayor (HCl 50,00 mL 0,1 M con NaOH 0,1 M):', [['a', '0 mL'], ['b', '25 mL'], ['c', '49 mL'], ['d', '50 mL'], ['e', '51 mL']], ['a', 'b', 'c', 'd', 'e'],
                { concept: 'ana.fuerte', direction: 'De menor a mayor pH.', explain: '1,00 · 1,48 · 3,00 · 7,00 · 11,00.', slide: 24, hint: 'Más base = más pH.' }),
              classify('m1-p3', '¿Qué especie manda el pH en cada zona?', [['h', 'H⁺ sobrante'], ['n', 'Nada sobra (pH 7)'], ['oh', 'OH⁻ sobrante']],
                [['a', 'Antes de agregar base', 'h'], ['b', 'A 25 mL (mitad)', 'h'], ['c', 'Justo en 50 mL', 'n'], ['d', 'A 60 mL', 'oh']],
                { concept: 'ana.fuerte', explain: '¿Qué sobra?', slide: 24, hint: 'La equivalencia es 50 mL.' })
            ],
            rule: { title: 'Regla del sabio: curva fuerte-fuerte', concept: 'ana.fuerte', steps: ['Calcula mmol de ácido y de base', '¿Qué sobra? Divide por el volumen TOTAL', 'H⁺ → pH; nada → 7; OH⁻ → pOH → 14 − pOH'] } },
          { id: 'r2', intro: 'Parte 2: **elegir el indicador**.',
            pretest: q('m1-pre2', 'Adivina antes: ¿cuándo cambia de color un indicador?', [{ text: 'En un intervalo de pH cercano a su pKa', correct: true }, { text: 'En pH 7, sea cual sea el indicador', note: 'Cada indicador tiene su intervalo.' }, { text: 'Cuando se acaba el ácido, sin importar el pH', note: 'Responde al pH.' }], { concept: 'ana.indicador', explain: 'pKa(ind) ± 1.', slide: 17 }),
            explain: [
              { id: 'm1b2', concept: 'ana.indicador', title: 'Indicadores', slide: 17, body: 'Un indicador es un ácido débil (HIn) cuyo color ácido y básico son distintos: vira en **pH ≈ pKa(HIn) ± 1**. Debe virar **dentro del salto** de la curva. Intervalos: **naranja de metilo 3,1–4,4**, **rojo de metilo 4,4–6,2**, **azul de bromotimol 6,0–7,6**, **fenolftaleína 8,2–10,0**.',
                deeper: 'En fuerte-fuerte (0,1 M) el salto va de ~3 a ~11: casi todos sirven. Con ácido débil el salto empieza más arriba (~7) y termina ~11: fenolftaleína. Con base débil + ácido fuerte el salto es ácido (~3 a ~7): rojo de metilo.' }
            ],
            practice: [
              match('m1-p4', 'Une cada titulación con su mejor indicador:', [['Ácido acético + NaOH (equivalencia ≈ 8,7)', 'Fenolftaleína (8,2–10,0)'], ['NH₃ + HCl (equivalencia ≈ 5,3)', 'Rojo de metilo (4,4–6,2)'], ['HCl + NaOH (equivalencia 7)', 'Azul de bromotimol (6,0–7,6)']],
                { concept: 'ana.indicador', explain: 'Que vire cerca de la equivalencia.', slide: 17, hint: 'Busca el intervalo que contiene el pH de equivalencia.', misconception: 'indicator-range' }),
              q('m1-p5', 'Para titular ácido acético con NaOH, ¿por qué NO sirve el naranja de metilo (3,1–4,4)?', [{ text: 'Viraría mucho antes de la equivalencia (pH ≈ 8,7)', correct: true }, { text: 'Porque es demasiado caro para una titulación común', note: 'No es el punto.' }, { text: 'Porque reacciona con el acetato que se forma', note: 'El problema es su intervalo.' }],
                { concept: 'ana.indicador', explain: 'Ese pH se alcanza en la zona tampón.', slide: 17, hint: 'Compara su intervalo con el pH de equivalencia.', misconception: 'indicator-range' }),
              spot('m1-fx1', 'Un aprendiz eligió indicador para NH₃ con HCl. ¿Dónde se equivocó?', ['En la equivalencia queda NH₄⁺ (ácido débil)', 'Entonces el pH de equivalencia es mayor que 7', 'Elijo fenolftaleína'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'El pH de equivalencia es menor que 7: rojo de metilo', correct: true }, { text: 'Es exactamente 7: cualquiera', note: 'NH₄⁺ es ácido.', misconception: 'eq-ph7' }] },
                { concept: 'ana.indicador', slide: 17, stepNotes: { 0: 'Correcto.', 2: 'Viene del error anterior.' }, explain: 'NH₄⁺ acidifica: equivalencia ≈ 5,3.', hint: '¿NH₄⁺ es ácido o básico?' })
            ],
            rule: { title: 'Regla del sabio: el indicador', concept: 'ana.indicador', steps: ['Calcula (o estima) el pH de equivalencia', 'Elige un indicador cuyo intervalo lo contenga', 'Ácido débil → fenolftaleína; base débil → rojo de metilo'] } }
        ]
      },
      {
        id: 'm2', title: 'Ácidos débiles, tampones y polipróticos', subtitle: 'Media titulación, tampón y varios saltos', minutes: 35, slides: '31–48', pep: 'P6: ácido débil y tampón',
        stages: {
          hook: { title: 'El vinagre que resiste', sage: 'Agregas 10 mL de NaOH al vinagre y el pH sube a 4,15. Agregas 30 mL más… y llega apenas a 5,36. El ácido acético y el acetato forman un tampón que pelea cada gota.',
            text: 'La curva de un ácido débil tiene una meseta (tampón), un punto mágico (a media titulación pH = pKa) y una equivalencia **básica**. En la PEP salen los cuatro cálculos.' },
          diagnostic: [
            q('m2-d1', 'En la equivalencia de ácido acético con NaOH, el pH es…', [{ text: 'Mayor que 7', correct: true }, { text: '7', misconception: 'eq-ph7' }, { text: 'Menor que 7', note: 'Queda acetato, una base.' }], { concept: 'ana.debil', explain: 'El acetato hidroliza: pH 8,73.', slide: 47 }),
            q('m2-d2', 'A la mitad del volumen de equivalencia de un ácido débil…', [{ text: 'pH = pKa', correct: true }, { text: 'pH = 7', note: 'Eso es fuerte-fuerte en la equivalencia.' }, { text: 'pH = pKa/2', misconception: 'half-eq' }], { concept: 'ana.debil', explain: '[HA] = [A⁻].', slide: 42 })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.ka', title: 'Desde cero: Ka y pKa', slide: 47, body: 'Un ácido débil se disocia poco: **HA ⇌ H⁺ + A⁻**, **Ka = [H⁺][A⁻]/[HA]**. **pKa = −log Ka**: mientras **menor** el pKa, **más fuerte** el ácido. Para su base conjugada: **Kb = Kw/Ka**.',
              deeper: 'Ácido acético: Ka = 1,75 × 10⁻⁵ → pKa = 4,76. Acetato: Kb = 10⁻¹⁴/1,75 × 10⁻⁵ = 5,7 × 10⁻¹⁰. pH de un ácido débil solo: [H⁺] ≈ √(Ka·C).' }
          ],
          explain: [],
          transfer: [
            num('m2-t1', 'Estilo PEP: 50,00 mL de CH₃COOH 0,1000 M (Ka = 1,75 × 10⁻⁵) se titulan con NaOH 0,1000 M. Calcula el pH después de agregar 10,00 mL.', 4.15, '',
              { concept: 'ana.debil', label: 'pH', slide: 42, tol: 0.01, traps: [{ value: 5.36, note: 'Invertiste la razón: A⁻ arriba.', misconception: 'hh-ratio' }, { value: 4.76, note: 'Eso es a media titulación (25 mL).', misconception: 'half-eq' }],
                solution: ['Agregado: 1,000 mmol OH⁻ → 1,000 mmol A⁻; queda 4,000 mmol HA', 'pH = 4,757 + log(1,000/4,000)', 'pH = 4,757 − 0,602 = 4,15'], explain: 'pH = 4,15.' }),
            num('m2-t2', 'Estilo PEP: en la misma titulación, calcula el pH en el punto de equivalencia (50,00 mL de NaOH).', 8.73, '',
              { concept: 'ana.debil', label: 'pH', slide: 47, tol: 0.005, traps: [{ value: 7, note: 'Con ácido débil la equivalencia es básica.', misconception: 'eq-ph7' }, { value: 5.27, note: 'Ese es el pOH.' }, { value: 8.88, note: 'Olvidaste que el volumen se duplicó (C = 0,0500 M).', misconception: 'dilution-ignored' }],
                solution: ['5,000 mmol A⁻ en 100,0 mL → 0,0500 M', 'Kb = 10⁻¹⁴/1,75 × 10⁻⁵ = 5,71 × 10⁻¹⁰', '[OH⁻] = √(Kb·C) = 5,35 × 10⁻⁶ → pOH 5,27', 'pH = 8,73'], explain: 'pH = 8,73.' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿por qué en la equivalencia de ácido acético con NaOH el pH no es 7?', 'Porque en la equivalencia todo el ácido acético se transformó en acetato, que es la base conjugada de un ácido débil. El acetato reacciona con el agua y produce OH⁻, así que el pH queda sobre 7 (8,73 con 0,1 M). Solo con ácido fuerte y base fuerte queda una sal neutra y pH 7.',
              ['En la equivalencia queda la base conjugada (acetato)', 'El acetato hidroliza y genera OH⁻', 'pH > 7; solo fuerte-fuerte da 7'],
              { concept: 'ana.debil', explain: 'Base conjugada.', slide: 47, teach: true, keywords: [{ label: 'acetato / base conjugada', any: ['acetato', 'conjugad'] }, { label: 'OH⁻ / hidrólisis', any: ['oh', 'hidról', 'hidrol', 'básic', 'basic'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **ácido débil con base fuerte**.',
            pretest: q('m2-pre1', 'Adivina antes: el pH inicial de ácido acético 0,1 M es…', [{ text: 'Cerca de 2,9', correct: true }, { text: 'Cerca de 1,0, como un ácido fuerte', note: 'Eso sería si se disociara entero (ácido fuerte).' }, { text: 'Exactamente 7, como el agua', note: 'Es un ácido.' }], { concept: 'ana.debil', explain: '√(Ka·C) = 1,32 × 10⁻³ → 2,88.', slide: 47 }),
            explain: [
              { id: 'm2b1', concept: 'ana.debil', title: 'Ácido débil con base fuerte', slide: 42, body: 'Cuatro zonas: **Inicio**: [H⁺] ≈ √(Ka·C). **Tampón** (antes de la equivalencia): **pH = pKa + log(mmol A⁻/mmol HA)** (Henderson-Hasselbalch; los volúmenes se cancelan). **Media titulación**: **pH = pKa**. **Equivalencia**: solo A⁻ → [OH⁻] ≈ √(Kb·C), con **C = mmol/V total** y Kb = Kw/Ka → **pH > 7**. **Exceso**: manda el OH⁻ sobrante, como en fuerte-fuerte.',
                deeper: 'CH₃COOH 50,00 mL 0,1000 M (pKa 4,757): 0 mL → 2,88; 10 → 4,15; 25 → 4,76; 40 → 5,36; 50 → 8,73. Fíjate que el salto es más corto que en fuerte-fuerte: por eso el indicador importa más.' }
            ],
            practice: [
              num('m2-p1', 'Misma titulación (pKa 4,757): pH después de 40,00 mL de NaOH.', 5.36, '',
                { concept: 'ana.debil', label: 'pH', slide: 42, tol: 0.01, hint: 'A⁻ = 4,000 mmol; HA = 1,000 mmol.', traps: [{ value: 4.15, note: 'Invertiste la razón.', misconception: 'hh-ratio' }], solution: ['pH = 4,757 + log(4,000/1,000)', '= 4,757 + 0,602 = 5,36'], explain: 'pH = 5,36.' }),
              order('m2-p7', 'Cuatro ácidos débiles 0,1 M se titulan con NaOH. Ordénalos de pH inicial MÁS BAJO a MÁS ALTO:', [['a', 'Ka = 10⁻⁷'], ['b', 'Ka = 10⁻³'], ['c', 'Ka = 10⁻⁹'], ['d', 'Ka = 10⁻⁵']], ['b', 'd', 'a', 'c'],
                { concept: 'ana.debil', direction: 'Del pH inicial más bajo (ácido más fuerte) al más alto.', explain: 'Mayor Ka, más H⁺, menor pH inicial: 10⁻³ (2,0) · 10⁻⁵ (3,0) · 10⁻⁷ (4,0) · 10⁻⁹ (5,0).', slide: 48, hint: 'Ácido más fuerte = menor pH inicial.' }),
              q('m2-p2', 'En la curva de un ácido débil desconocido, la equivalencia está en 30,0 mL y a 15,0 mL el pH es 4,20. ¿Cuál es su pKa?', [{ text: '4,20', correct: true }, { text: '8,40', note: 'A media titulación pH = pKa directamente.' }, { text: '2,10', misconception: 'half-eq' }],
                { concept: 'ana.debil', explain: '15,0 es la mitad de 30,0: pH = pKa.', slide: 42, hint: '¿Qué tiene de especial 15,0 mL?' }),
              classify('m2-p3', '¿Qué fórmula usas en cada punto (ácido débil + NaOH)?', [['ini', '√(Ka·C)'], ['hh', 'Henderson-Hasselbalch'], ['kb', '√(Kb·C) de la base conjugada'], ['exc', 'OH⁻ sobrante']],
                [['a', 'Antes de agregar NaOH', 'ini'], ['b', 'A 10 mL (antes de la equivalencia)', 'hh'], ['c', 'En la equivalencia', 'kb'], ['d', 'Pasada la equivalencia', 'exc']],
                { concept: 'ana.debil', explain: 'Cuatro zonas, cuatro fórmulas.', slide: 42, hint: '¿Qué hay en el matraz en cada punto?' })
            ],
            rule: { title: 'Regla del sabio: ácido débil', concept: 'ana.debil', steps: ['Inicio: [H⁺] = √(Ka·C)', 'Tampón: pH = pKa + log(A⁻/HA); a la mitad pH = pKa', 'Equivalencia: A⁻ con Kb = Kw/Ka y V total → pH > 7'] } },
          { id: 'r2', intro: 'Parte 2: **ácidos polipróticos**.',
            pretest: q('m2-pre2', 'Adivina antes: ¿cuántos saltos puede mostrar la curva del H₃PO₄ con NaOH?', [{ text: 'Dos bien visibles (el tercero no se ve en agua)', correct: true }, { text: 'Un salto, porque el ácido se neutraliza de una vez', note: 'Los pKa están bien separados.' }, { text: 'Tres iguales, uno por cada H⁺', note: 'El tercer H⁺ es demasiado débil (pKa 12,35).' }], { concept: 'ana.poli', explain: 'pKa₃ muy alto.', slide: 59 }),
            explain: [
              { id: 'm2b2', concept: 'ana.poli', title: 'Ácidos polipróticos', slide: 59, body: 'Un ácido **poliprótico** cede sus H⁺ **de a uno**, cada uno con su Ka. Si los pKa están separados (más de ~4 unidades), cada protón da un **salto** propio. En cada equivalencia queda un **anfolito** (H₂PO₄⁻, HPO₄²⁻) y **pH ≈ (pKaₙ + pKaₙ₊₁)/2**. Entre equivalencias hay zonas tampón con pH = pKa a la mitad de cada tramo.',
                deeper: 'H₃PO₄ (pKa 2,15; 7,20; 12,35): primera equivalencia pH ≈ (2,15 + 7,20)/2 = 4,68 (rojo de metilo); segunda ≈ (7,20 + 12,35)/2 = 9,78 (fenolftaleína/timolftaleína). El segundo volumen de equivalencia es el **doble** del primero.' }
            ],
            practice: [
              num('m2-p4', 'H₃PO₄ (pKa₁ 2,15; pKa₂ 7,20; pKa₃ 12,35). ¿pH en la segunda equivalencia?', 9.775, '',
                { concept: 'ana.poli', label: 'pH', slide: 59, tol: 0.005, hint: 'Promedio de pKa₂ y pKa₃.', traps: [{ value: 4.675, note: 'Esa es la primera equivalencia.' }, { value: 7.2, note: 'pKa₂ es a la mitad del segundo tramo, no en la equivalencia.', misconception: 'half-eq' }], solution: ['pH ≈ (7,20 + 12,35)/2 = 9,78'], explain: '9,78.' }),
              order('m2-p5', 'Ordena las especies que predominan al agregar NaOH a H₃PO₄:', [['a', 'H₃PO₄'], ['b', 'H₂PO₄⁻'], ['c', 'HPO₄²⁻'], ['d', 'PO₄³⁻']], ['a', 'b', 'c', 'd'],
                { concept: 'ana.poli', direction: 'Del inicio al final.', explain: 'Se va un H⁺ cada vez.', slide: 59, hint: 'Cada OH⁻ saca un H⁺.' }),
              q('m2-p6', 'La primera equivalencia del H₃PO₄ está en 12,0 mL. ¿Dónde está la segunda?', [{ text: '24,0 mL', correct: true }, { text: '18,0 mL', note: 'Cada protón gasta el mismo volumen.' }, { text: '36,0 mL', note: 'Esa sería la tercera.' }],
                { concept: 'ana.poli', explain: 'Mismo volumen por protón.', slide: 59, hint: 'Un protón por tramo.', misconception: 'dilution-ignored' })
            ],
            rule: { title: 'Regla del sabio: polipróticos', concept: 'ana.poli', steps: ['Un salto por protón (si los pKa están separados)', 'Equivalencia n: pH ≈ (pKaₙ + pKaₙ₊₁)/2', 'Cada tramo gasta el mismo volumen'] } },
          { id: 'r3', intro: 'Parte 3: **tampones en la práctica**: elegir el par, calcular el pH, ver cuánto aguanta y prepararlo (diap. 43–47).',
            pretest: q('m2-pre3', 'Adivina antes: diluyes un tampón acético/acetato 10 veces con agua. Su pH…', [{ text: 'Casi no cambia', correct: true }, { text: 'Sube una unidad', note: 'Eso pasaría con una base fuerte diluida; el tampón depende de la razón base/ácido, que no cambia.' }, { text: 'Baja a 7', note: 'No se neutraliza: sigue siendo un tampón.' }], { concept: 'ana.tampon', explain: 'La razón A⁻/HA no cambia al diluir.', slide: 43 }),
            explain: [
              { id: 'm2b3', concept: 'ana.tampon', title: 'Tampones: elegir, calcular y preparar', slide: 44, body: 'Un tampón es un par **ácido débil / base conjugada**. **Útil en pH = pKa ± 1**: elige el par con el pKa más cercano al pH que quieres. **pH = pKa + log(base/ácido)** con mmol. Al agregar **OH⁻** la base sube y el ácido baja (al revés con H⁺). **Diluir casi no cambia el pH** (la razón es la misma), pero baja la capacidad. La **capacidad amortiguadora β** es máxima cuando **pH = pKa** (razón 1:1) y crece con la cantidad de tampón. **Preparar**: pesa el ácido (o la sal) en agua, mide el pH y ajusta con NaOH o HCl hasta el pH pedido (diap. 45).',
                deeper: 'Diap. 45: 1,00 L de tris 0,10 M a pH 7,60 (pKa del tris·H⁺ = 8,075). nB/nBH⁺ = 10^(7,60 − 8,075) = 0,336 → de 100 mmol de tris·H⁺ hay que convertir 25,1 mmol en tris: 251 mL de NaOH 0,100 M. Diap. 47, ejercicio 2: MES 0,020 M (pKa 6,15), 50,00 mL con NaOH 0,100 M: equivalencia en 10,00 mL; C(A⁻) = 1,000 mmol/60,00 mL = 0,0167 M; Kb = 1,41 × 10⁻⁸ → pH = 9,19.' }
            ],
            practice: [
              q('m2-p9', 'Quieres un tampón de pH 7,4 (sangre). ¿Qué par eliges?', [{ text: 'H₂PO₄⁻ / HPO₄²⁻ (pKa 7,20)', correct: true }, { text: 'Ácido acético / acetato (pKa 4,76)', note: 'Un tampón sirve a pKa ± 1: 4,76 queda lejos de 7,4.' }, { text: 'NH₄⁺ / NH₃ (pKa 9,24)', note: 'Queda 1,8 unidades sobre el pH deseado.' }],
                { concept: 'ana.tampon', explain: 'pKa 7,20 ≈ 7,4.', slide: 44, hint: 'Busca el pKa más cercano al pH deseado.' }),
              num('m2-p10', 'Un tampón tiene 30 mmol de acetato y 20 mmol de ácido acético (pKa 4,76). Le agregas 5,0 mmol de NaOH. ¿Cuál es el pH ahora?', 5.13, '',
                { concept: 'ana.tampon', label: 'pH', slide: 43, tol: 0.005, hint: 'El OH⁻ convierte ácido en acetato: acetato 35, ácido 15.', traps: [{ value: 4.94, note: 'Ese es el pH antes de agregar la base.' }, { value: 4.76, note: 'Cambiaste el sentido: la base aumenta el acetato y baja el ácido.' }], solution: ['Acetato = 30 + 5 = 35 mmol; ácido = 20 − 5 = 15 mmol', 'pH = 4,76 + log(35/15) = 5,13'], explain: 'pH = 5,13.' }),
              classify('m2-p11', '¿Qué pasa con el pH de un tampón acético/acetato (20 mmol de cada forma) o del agua?', [['poco', 'Casi no cambia'], ['mucho', 'Cambia mucho']],
                [['a', 'Se diluye al doble con agua', 'poco'], ['b', 'Se agregan 2 mmol de HCl al tampón', 'poco'], ['c', 'Se agregan 2 mmol de HCl a 100 mL de agua pura', 'mucho'], ['d', 'Se agregan 18 mmol de NaOH al tampón', 'mucho']],
                { concept: 'ana.tampon', explain: 'El tampón resiste mientras quede de las dos formas.', slide: 43, hint: '¿Queda ácido y base conjugada después de agregar?' }),
              num('m2-p12', 'Preparas un tampón tris a pH 7,60 (pKa del tris·H⁺ = 8,075) con 100 mmol de hidrocloruro de tris. ¿Cuántos mL de NaOH 0,100 M debes agregar?', 250.9, 'mL',
                { concept: 'ana.tampon', label: 'V', slide: 45, tol: 0.02, hint: 'nB/nBH = 10^(pH − pKa); cada mmol de NaOH convierte 1 mmol de tris·H⁺ en tris.', traps: [{ value: 1000, note: 'Eso neutraliza todo el tris·H⁺: ya no queda tampón.' }, { value: 749.1, note: 'Esos mL dejan la razón al revés (más ácido que base).', misconception: 'hh-ratio' }], solution: ['nB/nBH = 10^(7,60 − 8,075) = 0,336', 'nB = 100 × 0,336/1,336 = 25,09 mmol', 'V = 25,09 mmol / 0,100 M = 250,9 mL'], explain: '250,9 mL.' })
            ],
            rule: { title: 'Regla del sabio: tampones', concept: 'ana.tampon', steps: ['Elige el par con pKa ≈ pH deseado (pKa ± 1)', 'pH = pKa + log(base/ácido) con mmol; OH⁻ agregado: base sube; H⁺: ácido sube', 'Diluir no cambia el pH; la capacidad máxima es con razón 1:1'] } }
        ]
      },
      {
        id: 'm3', title: 'Bases débiles, dipróticos y mezclas', subtitle: 'La curva completa, anfolitos, distribución de especies y mezclas', minutes: 40, slides: '50–60', pep: 'P7: polipróticos y mezclas',
        stages: {
          hook: { title: 'Dos protones, dos escalones', sage: 'Un ácido diprótico entrega sus H⁺ de a uno. Si los pKa están lejos, la curva tiene dos escalones y, justo entre ellos, aparece un anfolito: una especie que ni es ácido ni es base del todo.',
            text: 'En la PEP te piden la curva completa: pH inicial, dos tampones, dos equivalencias y el exceso. A veces también qué especie predomina a cierto pH o qué hay en una mezcla. Todo sale de la misma idea: **qué especies hay en el matraz**.' },
          diagnostic: [
            q('m3-d1', 'Una base débil (NH₃) se titula con HCl. En la equivalencia el pH es…', [{ text: 'Menor que 7', correct: true }, { text: '7', misconception: 'eq-ph7' }, { text: 'Mayor que 7', note: 'Queda NH₄⁺, un ácido débil.' }], { concept: 'ana.basedebil', explain: 'Queda el ácido conjugado NH₄⁺.', slide: 51 }),
            q('m3-d2', 'Un ácido diprótico H₂A tiene pKa₁ = 4 y pKa₂ = 9. A pH 6,5 predomina…', [{ text: 'HA⁻', correct: true }, { text: 'H₂A', note: 'Predomina bajo el pKa₁ = 4.' }, { text: 'A²⁻', note: 'Predomina sobre el pKa₂ = 9.' }], { concept: 'ana.alfa', explain: '6,5 está entre pKa₁ y pKa₂.', slide: 59 })
          ],
          fundamentals: [
            { id: 'm3f1', concept: 'base.ka', title: 'Desde cero: Kb y el par conjugado', slide: 31, body: 'Una base débil B recibe un H⁺: **B + H₂O ⇌ BH⁺ + OH⁻**, con **Kb = [BH⁺][OH⁻]/[B]**. Su ácido conjugado BH⁺ tiene **Ka = Kw/Kb**, es decir **pKa(BH⁺) = 14 − pKb**. Cuando haya que usar Henderson-Hasselbalch, siempre se usa el **pKa del BH⁺**.',
              deeper: 'Amoníaco: Kb = 1,8 × 10⁻⁵ → pKb = 4,74 → pKa(NH₄⁺) = 9,26. A media titulación con HCl, pH = 9,26 (no 4,74).' }
          ],
          explain: [],
          transfer: [
            num('m3-t1', 'Estilo PEP: 25,00 mL de un ácido diprótico H₂A 0,100 M (pKa₁ = 4,2; pKa₂ = 9,7) se titulan con NaOH 0,100 M. Calcula el pH después de agregar 40,00 mL.', 9.88, '',
              { concept: 'ana.diprotico', label: 'pH', slide: 58, tol: 0.005, traps: [{ value: 10.3, note: 'Contaste todo el NaOH: los primeros 25,00 mL se gastaron en el primer protón.', misconception: 'dilution-ignored' }, { value: 9.52, note: 'Invertiste la razón.', misconception: 'hh-ratio' }, { value: 9.7, note: 'Eso sería a 37,50 mL (mitad exacta del segundo tramo).', misconception: 'half-eq' }],
                solution: ['Primera equivalencia: 25,00 mL. Quedan 40,00 − 25,00 = 15,00 mL para el segundo protón', 'A²⁻ = 15,00 × 0,100 = 1,500 mmol; HA⁻ = 2,500 − 1,500 = 1,000 mmol', 'pH = 9,7 + log(1,500/1,000) = 9,88'], explain: 'pH = 9,88.' }),
            write('m3-w1', 'Enséñale a tu compañero: ¿por qué el pH de una solución de NaHCO₃ casi no cambia si la diluyes, y por qué vale (pKa₁ + pKa₂)/2?', 'El HCO₃⁻ es un anfolito: puede ceder un H⁺ (pasa a CO₃²⁻) o recibirlo (pasa a H₂CO₃). El pH queda donde ambos procesos se compensan, y eso depende de las constantes: es el promedio de los dos pKa, (6,35 + 10,33)/2 = 8,34. Como la concentración se simplifica en el cálculo, diluir casi no lo mueve.',
              ['Es un anfolito: cede y recibe H⁺', 'pH = promedio de los dos pKa vecinos', 'La concentración se cancela: no depende de ella'],
              { concept: 'ana.anfolito', explain: 'Anfolito.', slide: 54, teach: true, keywords: [{ label: 'anfolito / cede y recibe', any: ['anfolit', 'ceder', 'cede', 'recibe', 'anfótero', 'anfotero'] }, { label: 'promedio de pKa', any: ['promedio', 'pka₁', 'pka1', 'mitad', 'suma'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **base débil con ácido fuerte** (diap. 50–51). Es la curva de un ácido débil, pero al revés.',
            pretest: q('m3-pre1', 'Adivina antes: 50 mL de NH₃ 0,1 M se titulan con HCl 0,1 M. A los 25 mL el pH es…', [{ text: 'Cerca de 9,3, el pKa del NH₄⁺', correct: true }, { text: 'Cerca de 4,7, el pKb del NH₃', note: 'En el par BH⁺/B se usa el pKa, no el pKb.', misconception: 'pkb-pka' }, { text: '7, porque está en la mitad', note: 'El 7 solo aparece en fuerte-fuerte.' }], { concept: 'ana.basedebil', explain: 'A media titulación pH = pKa(BH⁺) = 14 − 4,74.', slide: 51 }),
            explain: [
              { id: 'm3b1', concept: 'ana.basedebil', title: 'Base débil con ácido fuerte', slide: 51, body: 'La reacción es **B + H⁺ → BH⁺** y el pH **baja**. Cuatro zonas: **Inicio**: [OH⁻] ≈ √(Kb·C) → pH = 14 − pOH. **Tampón** (antes de la equivalencia): **pH = pKa(BH⁺) + log(mmol B / mmol BH⁺)**; a la mitad, **pH = pKa(BH⁺)**. **Equivalencia**: solo BH⁺, un ácido débil: [H⁺] ≈ √(Ka·C) con **Ka = Kw/Kb** y C = mmol/V total → **pH < 7**. **Exceso**: manda el H⁺ sobrante. Indicador: **rojo de metilo**.',
                deeper: '50,00 mL de NH₃ 0,1000 M (Kb = 1,8 × 10⁻⁵; pKa del NH₄⁺ = 9,26) con HCl 0,1000 M: 0 mL → 11,13; 10 → 9,86; 25 → 9,26; 40 → 8,65; 50 → 5,28; 60 → 2,04. (Números recalculados; la diap. 51 da el método sin cifras.)' }
            ],
            practice: [
              num('m3-p1', '50,00 mL de etilamina 0,100 M (Kb = 4,3 × 10⁻⁴) se titulan con HCl 0,100 M. pH después de 20,00 mL.', 10.81, '',
                { concept: 'ana.basedebil', label: 'pH', slide: 51, tol: 0.005, hint: 'pKa(BH⁺) = 14 − pKb = 10,63; B = 3,000 mmol y BH⁺ = 2,000 mmol.', traps: [{ value: 3.37, note: 'Ese es el pKb: en Henderson-Hasselbalch va el pKa del BH⁺.', misconception: 'pkb-pka' }, { value: 10.45, note: 'Invertiste la razón.', misconception: 'hh-ratio' }], solution: ['BH⁺ = 20,00 × 0,100 = 2,000 mmol; B = 5,000 − 2,000 = 3,000 mmol', 'pKa = 14 − 3,37 = 10,63', 'pH = 10,63 + log(3,000/2,000) = 10,81'], explain: 'pH = 10,81.' }),
              num('m3-p12', '50,00 mL de etilamina 0,100 M (Kb = 4,3 × 10⁻⁴) se titulan con HCl. ¿Cuál es el pH inicial (antes de agregar HCl)?', 11.82, '',
                { concept: 'ana.basedebil', label: 'pH', slide: 51, tol: 0.005, hint: '[OH⁻] ≈ √(Kb·C); luego pH = 14 − pOH.', traps: [{ value: 2.18, note: 'Ese es el pOH.' }, { value: 13, note: 'La trataste como base fuerte.' }], solution: ['[OH⁻] = √(4,3 × 10⁻⁴ × 0,100) = 6,56 × 10⁻³', 'pOH = 2,18; pH = 11,82'], explain: 'pH = 11,82.' }),
              q('m3-p2', '¿Qué indicador sirve para NH₃ con HCl (equivalencia en pH ≈ 5,3)?', [{ text: 'Rojo de metilo (4,4–6,2)', correct: true }, { text: 'Fenolftaleína (8,2–10,0)', note: 'Ese es para equivalencia básica.', misconception: 'indicator-range' }, { text: 'Azul de bromotimol (6,0–7,6)', note: 'Vira sobre el pH 6: demasiado tarde.' }],
                { concept: 'ana.basedebil', explain: 'La equivalencia es ácida: rojo de metilo.', slide: 17, hint: '¿La equivalencia queda sobre o bajo 7?' }),
              spot('m3-fx1', 'Un aprendiz calculó el pH de equivalencia de NH₃ 0,1 M (50 mL) con HCl 0,1 M (50 mL). ¿Dónde se equivocó?', ['En la equivalencia queda NH₄⁺ con C = 0,0500 M (el volumen se duplicó)', 'Ka = Kw/Kb = 5,6 × 10⁻¹⁰', '[OH⁻] = √(Ka·C) = 5,3 × 10⁻⁶ → pH = 8,72'], 2,
                { question: '¿Cómo se corrige?', options: [{ text: '[H⁺] = √(Ka·C) = 5,3 × 10⁻⁶ → pH = 5,28', correct: true }, { text: 'pH = 7, porque es la equivalencia', note: 'Con base débil la equivalencia no es neutra.' }] },
                { concept: 'ana.basedebil', slide: 51, stepNotes: { 0: 'Correcto.', 1: 'Correcto.' }, explain: 'El NH₄⁺ es un ácido: produce H⁺, no OH⁻.', hint: '¿Qué libera el NH₄⁺ al agua?', misconception: 'eq-ph7' })
            ],
            rule: { title: 'Regla del sabio: base débil', concept: 'ana.basedebil', steps: ['Inicio: [OH⁻] = √(Kb·C) → pH = 14 − pOH', 'Tampón: pH = pKa(BH⁺) + log(B/BH⁺), con pKa = 14 − pKb', 'Equivalencia: BH⁺ con Ka = Kw/Kb y V total → pH < 7'] } },
          { id: 'r2', intro: 'Parte 2: **la curva completa de un diprótico** (diap. 55–58): siete puntos que se calculan con las mismas tres fórmulas.',
            pretest: q('m3-pre2', 'Adivina antes: un ácido diprótico H₂A (pKa₁ = 4; pKa₂ = 9) se titula con NaOH. Si la primera equivalencia está en 10 mL, la segunda está en…', [{ text: '20 mL', correct: true }, { text: '15 mL', note: 'Cada protón gasta el mismo volumen.' }, { text: '10 mL, es el mismo punto', note: 'Son dos protones: dos puntos.' }], { concept: 'ana.diprotico', explain: 'Mismo volumen por protón.', slide: 56 }),
            explain: [
              { id: 'm3b2', concept: 'ana.diprotico', title: 'Curva de un ácido (o base) diprótico', slide: 57, body: 'Se calcula por zonas, siempre pensando **qué hay en el matraz**. **Inicio** (solo H₂A): [H⁺] = √(Ka₁·C). **Tampón 1** (H₂A/HA⁻): pH = pKa₁ + log(HA⁻/H₂A). **1ª equivalencia** (solo HA⁻, anfolito): **pH = ½(pKa₁ + pKa₂)**. **Tampón 2** (HA⁻/A²⁻): pH = pKa₂ + log(A²⁻/HA⁻); ojo: los mmol de A²⁻ son los que pasan de Veq₁. **2ª equivalencia** (solo A²⁻): base con Kb = Kw/Ka₂ y V total. **Exceso**: manda el OH⁻ sobrante. Cada protón gasta el mismo volumen: **Veq₂ = 2·Veq₁**.',
                deeper: 'Ejemplo de la clase (diap. 56–58, base B con pKb₁ = 4,0 y pKb₂ = 9,0; 10,00 mL 0,1 M con HCl 0,1 M): 0 mL → pH 11,50 · 5 mL → 10,00 (= pKa de BH⁺) · 10 mL → 7,50 (anfolito: ½(10,0 + 5,0)) · 15 mL → 5,00 (= pKa de BH₂²⁺) · 20 mL → 3,24 · 25 mL → 1,84. La base B es un diprótico visto desde el otro lado: los tampones son BH⁺/B y BH₂²⁺/BH⁺.' }
            ],
            practice: [
              num('m3-p3', '20,00 mL de un ácido diprótico H₂A 0,100 M (pKa₁ = 4,2; pKa₂ = 9,7) se titulan con NaOH 0,100 M. pH después de 5,00 mL.', 3.72, '',
                { concept: 'ana.diprotico', label: 'pH', slide: 58, tol: 0.005, hint: 'Primer tampón: HA⁻ = 0,500 mmol; H₂A = 2,000 − 0,500.', traps: [{ value: 4.68, note: 'Invertiste la razón.', misconception: 'hh-ratio' }, { value: 9.22, note: 'Usaste pKa₂: aún estás en el primer tramo (0 → 20 mL).' }], solution: ['HA⁻ = 5,00 × 0,100 = 0,500 mmol; H₂A = 2,000 − 0,500 = 1,500 mmol', 'pH = 4,2 + log(0,500/1,500) = 3,72'], explain: 'pH = 3,72.' }),
              q('m3-p4', 'Un diprótico tiene la primera equivalencia en 17,4 mL de NaOH. ¿Dónde está la segunda?', [{ text: '34,8 mL', correct: true }, { text: '26,1 mL', note: 'Ese es el punto medio (1,5 veces): cada protón gasta lo mismo, no la mitad.' }, { text: '17,4 mL', note: 'Es el mismo volumen del primer tramo, pero acumulado se duplica.' }],
                { concept: 'ana.diprotico', explain: 'Veq₂ = 2·Veq₁.', slide: 56, hint: 'Un protón por tramo.' }),
              order('m3-p5', 'Ordena lo que hay en el matraz al titular H₂A con NaOH:', [['a', 'Solo H₂A (pH inicial)'], ['b', 'Tampón H₂A / HA⁻'], ['c', '1ª equivalencia: solo HA⁻ (anfolito)'], ['d', 'Tampón HA⁻ / A²⁻'], ['e', '2ª equivalencia: solo A²⁻']], ['a', 'b', 'c', 'd', 'e'],
                { concept: 'ana.diprotico', direction: 'Del inicio al final.', explain: 'Un protón a la vez.', slide: 57, hint: 'Cada OH⁻ quita un H⁺.' })
            ],
            rule: { title: 'Regla del sabio: diprótico', concept: 'ana.diprotico', steps: ['Veq₂ = 2·Veq₁ (mismo volumen por protón)', 'Tampón 1: pKa₁ · anfolito: ½(pKa₁ + pKa₂) · tampón 2: pKa₂ (cuenta solo lo que pasó de Veq₁)', '2ª equivalencia: A²⁻ con Kb = Kw/Ka₂ y V total; después, OH⁻ sobrante'] } },
          { id: 'r3', intro: 'Parte 3: **anfolitos y diagramas de distribución**. Lo de los anfolitos está en la diap. 54; los diagramas de distribución (α) **no están en las PPT**: vienen de Skoog y Harris.',
            pretest: q('m3-pre3', 'Adivina antes: ¿cuál es el pH de una solución de NaHCO₃ (pKa₁ = 6,35; pKa₂ = 10,33)?', [{ text: 'Cerca de 8,3', correct: true }, { text: '7,0, es una sal neutra', note: 'El HCO₃⁻ es un anfolito: no tiene por qué ser neutro.', misconception: 'eq-ph7' }, { text: '10,3', note: 'Ese es el pKa₂: se promedia con el otro.' }], { concept: 'ana.anfolito', explain: '(6,35 + 10,33)/2 = 8,34.', slide: 54 }),
            explain: [
              { id: 'm3b3', concept: 'ana.anfolito', title: 'Anfolitos', slide: 54, body: 'Un **anfolito** (HA⁻) puede ceder un H⁺ (con Ka₂) o recibirlo (con Kb = Kw/Ka₁). Su pH es el promedio de los pKa que lo rodean: **pH ≈ ½(pKa₁ + pKa₂)**, y **casi no depende de la concentración**. Es el pH de la primera equivalencia de un diprótico. Ejemplos: HCO₃⁻ (8,34), H₂PO₄⁻ (4,68), HPO₄²⁻ (9,78), ftalato ácido de potasio KHP (4,18), glicina en zwitterión (≈ 6,06).',
                deeper: 'La fórmula exacta de la diap. 54 es [H⁺] = √(Ka₁Ka₂C + KwKa₁)/(Ka₁ + C); si C es grande frente a Ka₁ y Ka₂·C ≫ Kw, se reduce a [H⁺] = √(Ka₁Ka₂). El KHP es además el patrón primario de ana-02: su solución queda en pH ≈ 4,18.' },
              { id: 'm3b4', concept: 'ana.alfa', title: 'Diagrama de distribución de especies', slide: 59, body: 'El **diagrama de distribución** grafica la fracción **α** de cada especie en función del pH. Para un diprótico: **α₀ = [H⁺]²/D, α₁ = Ka₁[H⁺]/D, α₂ = Ka₁Ka₂/D**, con **D = [H⁺]² + Ka₁[H⁺] + Ka₁Ka₂**. Lectura rápida: **a pH = pKa dos especies vecinas valen ≈ 50 %**; bajo el primer pKa predomina la más protonada, y sobre el último, la menos protonada; entre dos pKa, la del medio. **Razón entre vecinas: 10^(pH − pKa)**. La concentración de una especie es **C_total × α**. (Fuente: Skoog y Harris, no la diapositiva.)',
                deeper: 'H₃PO₄ (2,15; 7,20; 12,35): a pH 7,40 la razón [HPO₄²⁻]/[H₂PO₄⁻] = 10^(7,40 − 7,20) = 1,6. En un tampón de fosfato 0,0500 M a pH 7,40: α(H₂PO₄⁻) = 0,39 y α(HPO₄²⁻) = 0,61 → [HPO₄²⁻] = 0,0307 M. Por eso el fosfato es tampón útil en la sangre y en los medios biológicos.' }
            ],
            practice: [
              num('m3-p6', 'Se disuelve ftalato ácido de potasio (KHP) 0,0500 M (pKa₁ = 2,95; pKa₂ = 5,41). ¿Cuál es el pH aproximado?', 4.18, '',
                { concept: 'ana.anfolito', label: 'pH', slide: 54, tol: 0.005, hint: 'Promedio de los dos pKa que rodean al HP⁻.', traps: [{ value: 2.95, note: 'Ese es el pKa₁: promedia con el otro.', misconception: 'half-eq' }, { value: 7, note: 'No es neutro.', misconception: 'eq-ph7' }], solution: ['pH ≈ (2,95 + 5,41)/2 = 4,18'], explain: 'pH ≈ 4,18.' }),
              q('m3-p13', 'Diluyes 10 veces una solución de NaHCO₃. Su pH…', [{ text: 'Casi no cambia', correct: true }, { text: 'Sube una unidad', note: 'El pH de un anfolito sale de los pKa, no de la concentración.', misconception: 'dilution-ignored' }, { text: 'Baja una unidad', note: 'No depende de la concentración.' }],
                { concept: 'ana.anfolito', explain: 'pH ≈ ½(pKa₁ + pKa₂).', slide: 54, hint: '¿Aparece la concentración en el promedio de los pKa?' }),
              num('m3-p14', 'Se disuelve Na₂HPO₄ 0,100 M (anfolito HPO₄²⁻; pKa₂ = 7,20 y pKa₃ = 12,35). ¿Cuál es el pH aproximado?', 9.775, '',
                { concept: 'ana.anfolito', label: 'pH', slide: 54, tol: 0.005, hint: 'Promedia los pKa a cada lado del HPO₄²⁻: el segundo y el tercero.', traps: [{ value: 4.675, note: 'Ese es el pH del NaH₂PO₄ (pKa₁ y pKa₂).' }, { value: 7.2, note: 'Ese es solo el pKa₂.', misconception: 'half-eq' }], solution: ['pH ≈ (7,20 + 12,35)/2 = 9,78'], explain: 'pH ≈ 9,78.' }),
              num('m3-p15', 'Un tampón de fosfato 0,0200 M en total (H₃PO₄: pKa 2,15; 7,20; 12,35) está a pH 7,00. ¿Cuál es la concentración de HPO₄²⁻ (M)?', 0.00774, 'M',
                { concept: 'ana.alfa', label: '[HPO₄²⁻]', slide: 59, tol: 0.03, hint: '[HPO₄²⁻] = C_total × α₂; a pH 7,00 casi todo es H₂PO₄⁻ y HPO₄²⁻.', traps: [{ value: 0.01226, note: 'Esa es [H₂PO₄⁻].' }, { value: 0.02, note: 'Esa es la concentración total.' }], solution: ['razón HPO₄²⁻/H₂PO₄⁻ = 10^(7,00 − 7,20) = 0,631', 'α(HPO₄²⁻) = 0,631/1,631 = 0,387', '[HPO₄²⁻] = 0,0200 × 0,387 = 7,7 × 10⁻³ M'], explain: '7,7 × 10⁻³ M.' }),
              classify('m3-p7', 'H₂CO₃ (pKa₁ 6,35; pKa₂ 10,33): ¿qué especie predomina a cada pH?', [['h2', 'H₂CO₃'], ['hco3', 'HCO₃⁻'], ['co3', 'CO₃²⁻']],
                [['a', 'pH 4,0', 'h2'], ['b', 'pH 7,4 (sangre)', 'hco3'], ['c', 'pH 8,3', 'hco3'], ['d', 'pH 11,5', 'co3'], ['e', 'pH 2,0', 'h2']],
                { concept: 'ana.alfa', explain: 'Bajo 6,35: H₂CO₃; entre 6,35 y 10,33: HCO₃⁻; sobre 10,33: CO₃²⁻.', slide: 59, hint: 'Compara el pH con cada pKa.' }),
              num('m3-p8', 'En la sangre (pH 7,40) el par H₂CO₃/HCO₃⁻ tiene pKa₁ = 6,35. ¿Cuál es la razón [HCO₃⁻]/[H₂CO₃]?', 11.22, '',
                { concept: 'ana.alfa', label: 'razón', slide: 42, tol: 0.02, hint: 'razón = 10^(pH − pKa).', traps: [{ value: 0.0891, note: 'Invertiste la razón.', misconception: 'hh-ratio' }, { value: 1.05, note: 'Ese es el log de la razón: falta 10^( ).' }], solution: ['razón = 10^(7,40 − 6,35) = 10^1,05 = 11,2'], explain: 'Razón = 11,2.' })
            ],
            rule: { title: 'Regla del sabio: anfolitos y α', concept: 'ana.alfa', steps: ['Anfolito: pH ≈ ½(pKa₁ + pKa₂), sin concentración', 'Dos especies vecinas: razón = 10^(pH − pKa); en pH = pKa valen ≈ 50 %', 'Bajo el primer pKa manda la más protonada; sobre el último, la menos protonada'] } },
          { id: 'r4', intro: 'Parte 4: **mezclas** (de libro: Skoog y Harris; no están en las PPT). Dos casos clásicos que aparecen en las guías: HCl con un ácido débil, y el carbonato con fenolftaleína y naranja de metilo.',
            pretest: q('m3-pre4', 'Adivina antes: una mezcla de HCl y CH₃COOH se titula con NaOH. ¿Cuál se neutraliza primero?', [{ text: 'El HCl (ácido fuerte)', correct: true }, { text: 'El CH₃COOH', note: 'El ácido más fuerte reacciona primero.' }, { text: 'Los dos a la vez', note: 'Se ven dos puntos de equivalencia distintos.' }], { concept: 'ana.mezcla', explain: 'Primero el fuerte.', slide: 59 }),
            explain: [
              { id: 'm3b5', concept: 'ana.mezcla', title: 'Mezclas: qué consume cada tramo', slide: 59, body: '**Ácido fuerte + ácido débil con NaOH**: el primer punto (V₁) neutraliza el fuerte y el segundo (V₂, acumulado) el total, así que **mmol de fuerte = V₁·C** y **mmol de débil = (V₂ − V₁)·C**. **Carbonatos con HCl** (método de Warder): con **fenolftaleína** (V₁) el CO₃²⁻ pasa a HCO₃⁻ (y se neutraliza todo el OH⁻); con **naranja de metilo** (V₂, acumulado) el HCO₃⁻ pasa a H₂CO₃. Si **V₁ > V₂ − V₁** hay **NaOH + Na₂CO₃**: n(Na₂CO₃) = (V₂ − V₁)·C y n(NaOH) = (2V₁ − V₂)·C. Si **V₁ < V₂ − V₁** hay **Na₂CO₃ + NaHCO₃**: n(Na₂CO₃) = V₁·C y n(NaHCO₃) = (V₂ − 2V₁)·C. NaOH y NaHCO₃ no coexisten (reaccionan entre sí).',
                deeper: 'Alícuota de 25,00 mL, HCl 0,1000 M. (a) V₁ = 20,00 y V₂ = 30,00 mL: V₁ > V₂ − V₁ → NaOH 1,000 mmol (40,0 mg) y Na₂CO₃ 1,000 mmol (106,0 mg). (b) V₁ = 12,00 y V₂ = 30,00 mL: V₁ < V₂ − V₁ → Na₂CO₃ 1,200 mmol (127,2 mg) y NaHCO₃ 0,600 mmol (50,4 mg). Números recalculados; el método es el de Skoog/Harris.' }
            ],
            practice: [
              q('m3-p9', 'Una alícuota básica gasta 15,0 mL de HCl hasta fenolftaleína y 25,0 mL en total hasta naranja de metilo. ¿Qué contiene?', [{ text: 'NaOH y Na₂CO₃', correct: true }, { text: 'Na₂CO₃ y NaHCO₃', note: 'V₂ − V₁ = 10,0 es menor que V₁ = 15,0: el primer tramo gastó hidróxido, no bicarbonato.' }, { text: 'Solo Na₂CO₃', note: 'Entonces V₂ sería 2·V₁ = 30,0.', misconception: 'half-eq' }],
                { concept: 'ana.mezcla', explain: 'V₁ > V₂ − V₁.', slide: 59, hint: 'Compara V₁ con V₂ − V₁.' }),
              num('m3-p10', '20,00 mL de una mezcla de HCl y CH₃COOH se titulan con NaOH 0,1000 M: equivalencias en 8,00 y 26,00 mL (acumulado). ¿Cuál es la concentración (M) de CH₃COOH?', 0.09, 'M',
                { concept: 'ana.mezcla', label: '[CH₃COOH]', slide: 59, tol: 0.02, hint: 'El ácido débil gasta V₂ − V₁.', traps: [{ value: 0.0400, note: 'Esa es la concentración del HCl (primer tramo).' }, { value: 0.1300, note: 'Contaste ambos ácidos con el volumen total.' }], solution: ['CH₃COOH: (26,00 − 8,00) × 0,1000 = 1,800 mmol', '[CH₃COOH] = 1,800 mmol / 20,00 mL = 0,0900 M'], explain: '0,0900 M.' }),
              num('m3-p16', 'Una alícuota básica gasta 8,00 mL de HCl 0,1000 M hasta fenolftaleína y 20,00 mL en total hasta naranja de metilo. ¿Cuántos mg de NaHCO₃ había (M = 84,01 g/mol)?', 33.6, 'mg',
                { concept: 'ana.mezcla', label: 'NaHCO₃', slide: 59, tol: 0.02, hint: 'V₁ < V₂ − V₁: hay Na₂CO₃ y NaHCO₃. n(NaHCO₃) = (V₂ − 2V₁)·C.', traps: [{ value: 84.8, note: 'Esos son los mg de Na₂CO₃ (V₁·C × 105,99).' }, { value: 100.8, note: 'Contaste V₂ − V₁ como si fuera solo bicarbonato: ese tramo incluye el bicarbonato formado.' }], solution: ['n(Na₂CO₃) = V₁·C = 0,800 mmol', 'n(NaHCO₃) = (V₂ − 2V₁)·C = (20,00 − 16,00) × 0,1000 = 0,400 mmol', 'm = 0,400 × 84,01 = 33,6 mg'], explain: '33,6 mg de NaHCO₃.' }),
              order('m3-p11', 'Ordena lo que ocurre al titular NaOH + Na₂CO₃ con HCl:', [['a', 'OH⁻ + H⁺ → H₂O'], ['b', 'CO₃²⁻ + H⁺ → HCO₃⁻  (viraje de la fenolftaleína, V₁)'], ['c', 'HCO₃⁻ + H⁺ → H₂CO₃  (viraje del naranja de metilo, V₂)']], ['a', 'b', 'c'],
                { concept: 'ana.mezcla', direction: 'De la primera reacción a la última.', explain: 'Primero lo más básico.', slide: 59, hint: 'La base más fuerte reacciona primero.' })
            ],
            rule: { title: 'Regla del sabio: mezclas', concept: 'ana.mezcla', steps: ['Fuerte + débil: fuerte = V₁·C; débil = (V₂ − V₁)·C', 'Carbonatos: compara V₁ con V₂ − V₁ para saber qué hay', 'Cuenta mmol por tramo y recién ahí pasa a mg o a %'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.ph', title: 'pH y logaritmos', subtitle: 'pH, pOH y 14', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.ph', title: 'pH y pOH', slide: 24, body: '**pH = −log[H⁺]**, **pOH = −log[OH⁻]**, **pH + pOH = 14** (25 °C). [H⁺] = 10^(−pH).',
            deeper: '[H⁺] = 2,5 × 10⁻⁴ → pH = 3,60. pH 9 → pOH 5 → [OH⁻] = 10⁻⁵ M.' }],
          practice: [
            num('z1-p1', '[OH⁻] = 0,0100 M. pH =', 12, '', { concept: 'base.ph', label: 'pH', slide: 24, tol: 0.005, hint: 'pOH = 2; pH = 14 − pOH.', traps: [{ value: 2, note: 'Ese es el pOH.' }], solution: ['pOH = −log 0,0100 = 2', 'pH = 14 − 2 = 12'], explain: '12.' }),
            q('z1-p2', 'Si el pH baja de 4 a 3, [H⁺]…', [{ text: 'Se multiplica por 10', correct: true }, { text: 'Sube 1 M', note: 'Es logarítmico.' }, { text: 'Se divide por 10', note: 'Menor pH = más ácido.' }], { concept: 'base.ph', explain: 'Factor 10.', slide: 24, hint: 'pH = −log.' })
          ],
          transfer: [write('z1-w1', 'Explica por qué un cambio de 1 unidad de pH es tan grande.', 'Porque la escala es logarítmica: bajar una unidad de pH significa que la concentración de H⁺ se multiplica por diez. Por eso de pH 3 a pH 1 hay cien veces más H⁺.',
            ['Escala logarítmica', '1 unidad = factor 10 en [H⁺]', 'Menor pH = más H⁺'],
            { concept: 'base.ph', explain: 'Logaritmo.', slide: 24, keywords: [{ label: 'logarítmica', any: ['logar', 'log'] }, { label: 'factor 10', any: ['diez', '10'] }] })]
        } },
      { id: 'z2', concept: 'base.ka', title: 'Ka y pKa', subtitle: 'Fuerza de un ácido débil', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.ka', title: 'Ka, pKa y Kb', slide: 47, body: '**Ka** grande = ácido más fuerte. **pKa = −log Ka**: menor pKa = más fuerte. **Ka·Kb = Kw = 10⁻¹⁴**. Ácido débil solo: **[H⁺] ≈ √(Ka·C)**.',
            deeper: 'Fórmico (pKa 3,75) es más fuerte que acético (4,76). Para 0,1 M de acético: √(1,75 × 10⁻⁶) = 1,32 × 10⁻³ → pH 2,88.' }],
          practice: [
            num('z2-p1', 'Ka = 1,75 × 10⁻⁵. pKa =', 4.757, '', { concept: 'base.ka', label: 'pKa', slide: 47, tol: 0.002, hint: 'pKa = −log Ka.', traps: [{ value: -4.757, note: 'Es menos el logaritmo.' }], solution: ['pKa = −log(1,75 × 10⁻⁵) = 4,757'], explain: '4,757.' }),
            q('z2-p2', '¿Cuál es el ácido más fuerte?', [{ text: 'pKa = 3,2', correct: true }, { text: 'pKa = 4,8', note: 'Mayor pKa = más débil.' }, { text: 'pKa = 9,2', note: 'Muy débil.' }], { concept: 'base.ka', explain: 'Menor pKa.', slide: 47, hint: 'pKa chico = Ka grande.' })
          ],
          transfer: [write('z2-w1', 'Explica qué significa que un ácido tenga pKa = 4,76.', 'Significa que es un ácido débil con Ka = 10⁻⁴·⁷⁶ ≈ 1,75 × 10⁻⁵, que se disocia poco, y que a pH 4,76 hay la misma cantidad de ácido sin disociar que de su base conjugada.',
            ['Ka = 10^(−pKa): ácido débil', 'Se disocia poco', 'A pH = pKa, [HA] = [A⁻]'],
            { concept: 'base.ka', explain: 'pKa.', slide: 47, keywords: [{ label: 'débil', any: ['débil', 'debil', 'poco'] }, { label: 'mitad / igual', any: ['igual', 'misma', 'mitad'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-fuerte', title: 'Curva fuerte-fuerte', formula: '[H⁺] o [OH⁻] = |mmol ácido − mmol base| / (V₀ + V) · pH = 14 − pOH', concepts: ['ana.fuerte'], vars: [['V₀', 'volumen inicial', 'mL'], ['V', 'volumen agregado', 'mL']],
        what: 'pH en cualquier punto de fuerte-fuerte.', when: 'HCl con NaOH y similares.', example: '25 mL de 50: pH 1,48; 60 mL: pH 11,96.', deeper: 'En la equivalencia, pH 7.',
        sources: [{ label: 'Skoog, cap. 14', slide: 24 }],
        calc: { inputs: [{ id: 'va', label: 'V ácido (mL)', value: 50, step: 0.01 }, { id: 'ca', label: 'C ácido (M)', value: 0.1, step: 0.0001 }, { id: 'vb', label: 'V base (mL)', value: 25, step: 0.01 }, { id: 'cb', label: 'C base (M)', value: 0.1, step: 0.0001 }],
          run: v => { const d = v.va * v.ca - v.vb * v.cb, V = v.va + v.vb; const pH = Math.abs(d) < 1e-9 ? 7 : d > 0 ? -Math.log10(d / V) : 14 + Math.log10(-d / V); return 'pH = **' + pH.toFixed(2).replace('.', ',') + '**'; } } },
      { id: 'f-hh', title: 'Henderson-Hasselbalch', formula: 'pH = pKa + log(n_A⁻ / n_HA)', concepts: ['ana.debil'], vars: [['pKa', '−log Ka', '—'], ['n_A⁻', 'mmol de base conjugada', 'mmol'], ['n_HA', 'mmol de ácido', 'mmol']],
        what: 'pH en la zona tampón.', when: 'Antes de la equivalencia de un ácido débil.', example: 'Acético 10 mL de 50: 4,757 + log(1/4) = 4,15.', deeper: 'A media titulación, pH = pKa.',
        sources: [{ label: 'Skoog, cap. 14', slide: 42 }],
        calc: { inputs: [{ id: 'pka', label: 'pKa', value: 4.757, step: 0.001 }, { id: 'a', label: 'mmol A⁻', value: 1, step: 0.001 }, { id: 'ha', label: 'mmol HA', value: 4, step: 0.001 }], run: v => 'pH = **' + (v.pka + Math.log10(v.a / v.ha)).toFixed(2).replace('.', ',') + '**' } },
      { id: 'f-eq', title: 'pH en la equivalencia (ácido débil)', formula: 'C = mmol / V_total · Kb = Kw/Ka · [OH⁻] = √(Kb·C)', concepts: ['ana.debil'], vars: [['Kw', '10⁻¹⁴', '—'], ['C', 'concentración de A⁻', 'M']],
        what: 'pH básico de la equivalencia.', when: 'Ácido débil con base fuerte.', example: 'Acético 0,1 M: C = 0,05 M → pH 8,73.', deeper: 'No olvides el volumen total.',
        sources: [{ label: 'Skoog, cap. 14', slide: 47 }],
        calc: { inputs: [{ id: 'ka', label: 'Ka', value: 1.75e-5, step: 1e-6 }, { id: 'c', label: 'C de A⁻ (M)', value: 0.05, step: 0.001 }], run: v => 'pH = **' + (14 + Math.log10(Math.sqrt(1e-14 / v.ka * v.c))).toFixed(2).replace('.', ',') + '**' } },
      { id: 'f-dipro', title: 'Curva de un diprótico (puntos clave)', formula: 'Tampón 1: pH = pKa₁ + log(HA⁻/H₂A) · 1.ª eq.: pH = ½(pKa₁ + pKa₂) · Tampón 2: pH = pKa₂ + log(A²⁻/HA⁻) · 2.ª eq.: [OH⁻] = √(Kw/Ka₂ · C)', concepts: ['ana.diprotico'], vars: [['pKa₁, pKa₂', 'constantes de cada protón', '—'], ['C', 'concentración de A²⁻ con volumen total', 'M']],
        what: 'pH en cada zona de la curva de un ácido diprótico.', when: 'H₂A con pKa separados (más de ~4 unidades).', example: 'H₂A 0,1 M (4,2; 9,7), 25 mL: Veq₁ = 25 mL (pH 6,95), Veq₂ = 50 mL; a 40 mL pH = 9,88.', deeper: 'En el tampón 2 cuentan solo los mmol que pasaron de Veq₁.',
        sources: [{ label: 'Pizarro, sistemas dipróticos', slide: 57 }, { label: 'Pizarro, curva completa', slide: 58 }] },
      { id: 'f-anfolito', title: 'pH de un anfolito', formula: 'pH ≈ ½(pKa₁ + pKa₂)', concepts: ['ana.anfolito'], vars: [['pKa₁', 'del ácido más protonado', '—'], ['pKa₂', 'del siguiente protón', '—']],
        what: 'pH de una solución de HA⁻.', when: 'NaHCO₃, NaH₂PO₄, KHP, glicina…', example: 'KHP: (2,95 + 5,41)/2 = 4,18.', deeper: 'No depende de la concentración mientras sea razonablemente alta.',
        sources: [{ label: 'Pizarro, sales anfóteras', slide: 54 }],
        calc: { inputs: [{ id: 'p1', label: 'pKa₁', value: 2.95, step: 0.01 }, { id: 'p2', label: 'pKa₂', value: 5.41, step: 0.01 }], run: v => 'pH ≈ **' + ((v.p1 + v.p2) / 2).toFixed(2).replace('.', ',') + '**' } }
    ],
    recipes: [],
    mini: {
      'base.ph': { idea: 'pH = −log[H⁺]; cada unidad es ×10.', steps: ['pH = −log[H⁺]', 'pOH = −log[OH⁻]', 'pH + pOH = 14'], check: { prompt: '[H⁺] = 10⁻⁵ → pH =', options: [{ text: '5', correct: true }, { text: '−5', note: 'Menos log.' }], explain: '5.' } },
      'base.ka': { idea: 'pKa chico = ácido fuerte.', steps: ['pKa = −log Ka', 'Kb = Kw/Ka', '[H⁺] ≈ √(Ka·C)'], check: { prompt: 'Más fuerte: pKa 3 o pKa 5', options: [{ text: 'pKa 3', correct: true }, { text: 'pKa 5', note: 'Mayor pKa, más débil.' }], explain: 'pKa 3.' } },
      'ana.fuerte': { idea: '¿Qué sobra? Divide por el volumen total.', steps: ['mmol de cada uno', 'Resta y divide por V total', 'pH o 14 − pOH'], check: { prompt: 'Equivalencia HCl/NaOH: pH =', options: [{ text: '7', correct: true }, { text: '8,7', note: 'Eso es con ácido débil.' }], explain: '7.' } },
      'ana.indicador': { idea: 'Que vire dentro del salto.', steps: ['Estima el pH de equivalencia', 'Busca el intervalo que lo contiene', 'Débil ácido → fenolftaleína'], check: { prompt: 'Acético + NaOH:', options: [{ text: 'Fenolftaleína', correct: true }, { text: 'Naranja de metilo', note: 'Vira muy temprano.' }], explain: 'Equivalencia básica.' } },
      'ana.debil': { idea: 'Inicio, tampón, mitad = pKa, equivalencia básica.', steps: ['√(Ka·C) al inicio', 'HH en la zona tampón', '√(Kb·C) en la equivalencia'], check: { prompt: 'A media titulación pH =', options: [{ text: 'pKa', correct: true }, { text: '7', note: 'No.' }], explain: '[HA] = [A⁻].' } },
      'ana.tampon': { idea: 'Par ácido/base conjugada con pKa ≈ pH; diluir no cambia el pH.', steps: ['Elige pKa ≈ pH (± 1)', 'pH = pKa + log(base/ácido)', 'OH⁻ agregado: base sube'], check: { prompt: 'Diluyes un tampón 10 veces. El pH…', options: [{ text: 'Casi no cambia', correct: true }, { text: 'Sube 1', note: 'La razón base/ácido es la misma.' }], explain: 'La razón no cambia.' } },
      'ana.basedebil': { idea: 'Como el ácido débil, pero con el pKa del BH⁺ y la equivalencia ácida.', steps: ['pKa(BH⁺) = 14 − pKb', 'Tampón: pKa + log(B/BH⁺)', 'Equivalencia: BH⁺, pH < 7'], check: { prompt: 'Equivalencia de NH₃ con HCl: pH', options: [{ text: 'Menor que 7', correct: true }, { text: '7', note: 'Queda NH₄⁺.' }], explain: 'Queda un ácido débil.' } },
      'ana.diprotico': { idea: 'Dos protones, dos tampones, un anfolito en medio.', steps: ['Veq₂ = 2·Veq₁', 'Tampón 1: pKa₁ · Anfolito: promedio · Tampón 2: pKa₂', '2.ª eq.: A²⁻ con Kb = Kw/Ka₂'], check: { prompt: 'H₂A: Veq₁ = 10 mL. Veq₂ =', options: [{ text: '20 mL', correct: true }, { text: '15 mL', note: 'Mismo volumen por protón.' }], explain: 'Duplica.' } },
      'ana.anfolito': { idea: 'HA⁻ cede y recibe H⁺: su pH es el promedio de los pKa vecinos.', steps: ['Identifica pKa₁ y pKa₂', 'pH = ½(pKa₁ + pKa₂)', 'No depende de la concentración'], check: { prompt: 'NaHCO₃ (6,35; 10,33): pH ≈', options: [{ text: '8,34', correct: true }, { text: '7,00', note: 'No es neutro.' }], explain: 'Promedio.' } },
      'ana.alfa': { idea: 'A pH = pKa dos especies valen 50 %; la razón entre vecinas es 10^(pH − pKa).', steps: ['Compara pH con cada pKa', 'razón = 10^(pH − pKa)', '[especie] = C_total × α'], check: { prompt: 'A pH = pKa₁, α(H₂A) ≈', options: [{ text: '0,5', correct: true }, { text: '1', note: 'Se reparte con HA⁻.' }], explain: 'Mitad y mitad.' } },
      'ana.mezcla': { idea: 'Cuenta qué consume cada tramo: V₁ y V₂ − V₁.', steps: ['Fuerte + débil: V₁ y V₂ − V₁', 'Carbonatos: compara V₁ con V₂ − V₁', 'mmol por tramo, luego mg o %'], check: { prompt: 'Mezcla HCl + CH₃COOH con NaOH: primer punto = ', options: [{ text: 'el HCl', correct: true }, { text: 'el CH₃COOH', note: 'El fuerte primero.' }], explain: 'Primero el fuerte.' } },
      'ana.poli': { idea: 'Un H⁺ a la vez, un salto por H⁺.', steps: ['pKa separados → saltos separados', 'Equivalencia: promedio de pKa vecinos', 'Mismo volumen por tramo'], check: { prompt: '1ª equivalencia de H₃PO₄: pH ≈', options: [{ text: '4,7', correct: true }, { text: '7,2', note: 'Ese es pKa₂.' }], explain: '(2,15 + 7,20)/2.' } }
    },
    deep: {},
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', '[H⁺] = 0,01 M → pH =', [{ text: '2', correct: true }, { text: '0,01', note: 'Falta el log.' }, { text: '12', note: 'Ese sería con OH⁻.' }], { concept: 'base.ph', explain: '−log 10⁻².', slide: 24 }) },
      { level: 1, item: q('dx-2', 'Ácido más débil:', [{ text: 'pKa 9', correct: true }, { text: 'pKa 2', note: 'Ese es más fuerte.' }, { text: 'pKa 4', note: 'Intermedio.' }], { concept: 'base.ka', explain: 'Mayor pKa.', slide: 47 }) },
      { level: 2, item: q('dx-3', 'Equivalencia HCl + NaOH: pH', [{ text: '7', correct: true }, { text: '8,7', misconception: 'eq-ph7' }, { text: '1', note: 'Ya no hay ácido.' }], { concept: 'ana.fuerte', explain: 'Sal neutra.', slide: 24 }) },
      { level: 2, item: q('dx-4', 'Indicador para acético + NaOH', [{ text: 'Fenolftaleína', correct: true }, { text: 'Naranja de metilo', misconception: 'indicator-range' }, { text: 'Ninguno sirve', note: 'Sí hay.' }], { concept: 'ana.indicador', explain: 'Equivalencia ≈ 8,7.', slide: 17 }) },
      { level: 2, item: q('dx-5', 'A media titulación de un ácido con pKa 5,0, pH =', [{ text: '5,0', correct: true }, { text: '2,5', misconception: 'half-eq' }, { text: '7,0', note: 'No.' }], { concept: 'ana.debil', explain: 'pH = pKa.', slide: 42 }) },
      { level: 3, item: q('dx-6', 'pKa 4,76; mmol A⁻ = 3; mmol HA = 1. pH ≈', [{ text: '5,24', correct: true }, { text: '4,28', misconception: 'hh-ratio' }, { text: '4,76', note: 'Solo si son iguales.' }], { concept: 'ana.debil', explain: '4,76 + log 3.', slide: 42 }) },
      { level: 3, item: q('dx-8', 'NaHCO₃ (pKa₁ 6,35; pKa₂ 10,33). Su pH ≈', [{ text: '8,3', correct: true }, { text: '7,0', misconception: 'eq-ph7' }, { text: '6,35', misconception: 'half-eq' }], { concept: 'ana.anfolito', explain: 'Promedio de pKa.', slide: 54 }) },
      { level: 3, item: q('dx-7', 'Ácido con pKa₁ 2 y pKa₂ 7: pH en la primera equivalencia ≈', [{ text: '4,5', correct: true }, { text: '7', note: 'Ese es pKa₂.' }, { text: '2', note: 'Ese es pKa₁.' }], { concept: 'ana.poli', explain: 'Promedio.', slide: 59 }) }
    ] }
  };
})();
