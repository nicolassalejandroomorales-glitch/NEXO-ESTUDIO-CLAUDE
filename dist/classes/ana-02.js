/* Química Analítica · PEP 1 · Volumetría: de la bureta a la muestra (viernes 13 de noviembre).
   La cátedra de volumetría aún no está en el Drive: el contenido sale de la bibliografía oficial (Skoog, West, Holler y Crouch, cap. 13; Harris, cap. 7)
   y del programa del curso. Las "láminas" de esta clase son secciones propias, numeradas como referencia. Números recalculados en Python. */
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
  window.NexoClasses['ana-02'] = {
    id: 'ana-02',
    subject: 'analitica',
    title: 'Volumetría: de la bureta a la muestra',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Fundamentos de Química Analítica, cap. 13 (titulaciones)', author: 'Skoog, West, Holler y Crouch', detail: 'Bibliografía oficial del curso (sin diapositivas de cátedra todavía)', authority: 'Libro de texto' },
      harris: { title: 'Análisis Químico Cuantitativo, cap. 7 (titulaciones)', author: 'Daniel C. Harris', detail: 'Bibliografía complementaria', authority: 'Libro de texto' }
    },
    misconceptions: {
      'eq-vs-end': { label: 'Confundiste punto de equivalencia con punto final', why: '**Punto de equivalencia**: el momento teórico en que los moles de titulante son estequiométricamente iguales a los del analito. **Punto final**: lo que tú **observas** (cambio de color del indicador). La diferencia entre ambos es el **error de titulación**.',
        prereq: { title: 'Las piezas de una titulación', mission: 'm1', block: 'm1b1' }, base: 'base.moles' },
      'primary-std': { label: 'Elegiste mal el patrón primario', why: 'Un **patrón primario** debe ser muy puro, estable al aire, no higroscópico, de masa molar alta y reaccionar rápido y completo. NaOH **no** sirve (absorbe agua y CO₂): se **estandariza** con un patrón primario como el ftalato ácido de potasio (KHP).',
        prereq: { title: 'Patrones y estandarización', mission: 'm1', block: 'm1b2' }, base: 'base.moles' },
      'stoich-ratio': { label: 'Olvidaste la estequiometría', why: 'En el punto de equivalencia los moles **no** siempre son iguales: se igualan según los coeficientes. Con H₂SO₄ + 2NaOH, n(NaOH) = **2**·n(H₂SO₄).',
        prereq: { title: 'Calcular desde la bureta', mission: 'm2', block: 'm2b1' }, base: 'base.estequio',
        check: q('fix-st', 'Caso corto: 1,0 mmol de H₂SO₄ se titula con NaOH. ¿Cuántos mmol de NaOH se gastan?', [{ text: '2,0 mmol', correct: true }, { text: '1,0 mmol', note: 'Cada H₂SO₄ libera 2 H⁺.' }, { text: '0,5 mmol', note: 'Al revés.' }], { concept: 'ana.estequio', explain: '1 : 2.', slide: 6 }) },
      'ml-l': { label: 'Mezclaste mL con L', why: '**M = mol/L = mmol/mL.** Si trabajas en mL, obtienes **mmol**. Si mezclas mL con mol, el resultado se corre por 1000.',
        prereq: { title: 'Calcular desde la bureta', mission: 'm2', block: 'm2b1' }, base: 'base.moles' },
      'aliquot-factor': { label: 'Olvidaste deshacer la alícuota o la dilución', why: 'Si tituló solo una **alícuota** (por ejemplo 10,00 mL de 100,0 mL), los moles encontrados son solo **una fracción** del total: multiplica por V_total/V_alícuota para volver a la muestra original.',
        prereq: { title: 'Alícuotas y diluciones', mission: 'm2', block: 'm2b2' }, base: 'base.moles' }
    },
    goal: {
      total: 100, text: 'Asegurar los 25 puntos de cálculos volumétricos de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P3', label: 'Conceptos de volumetría y estandarización', points: 10, missions: ['m1'] },
        { id: 'P4', label: 'Cálculos con alícuotas y diluciones', points: 15, missions: ['m2'] }
      ],
      rest: [{ label: 'Conceptos, etapas y errores', points: 35, note: 'clase ana-01' }, { label: 'Volumetría ácido-base', points: 40, note: 'clase ana-03' }]
    },
    glossary: [
      { term: 'Titulante', mission: 'm1', def: 'Solución de concentración conocida que se agrega desde la bureta.', simple: 'Lo que cae de la bureta.', simpler: 'La regla con la que mides.' },
      { term: 'Punto de equivalencia', mission: 'm1', def: 'Punto teórico en que la cantidad de titulante agregada es estequiométricamente equivalente a la de analito.', simple: 'Cuando ya agregaste justo lo necesario.', simpler: 'El vaso se llena justo hasta el borde.' },
      { term: 'Punto final', mission: 'm1', def: 'Punto en que se observa un cambio físico (color del indicador, salto de potencial) asociado a la equivalencia.', simple: 'Cuando VES que terminó.', simpler: 'Cuando ves que el vaso rebalsa.' },
      { term: 'Patrón primario', mission: 'm1', def: 'Compuesto de alta pureza y estabilidad que se pesa directamente para preparar o estandarizar soluciones.', simple: 'Un sólido tan puro que su masa es confiable.', simpler: 'La pesa oficial con la que se calibran las demás.' },
      { term: 'Estandarización', mission: 'm1', def: 'Determinar la concentración exacta de una solución titulándola contra un patrón primario.', simple: 'Averiguar la concentración real del titulante.', simpler: 'Medir tu regla con la regla oficial.' },
      { term: 'Alícuota', mission: 'm2', def: 'Porción medida con exactitud (con pipeta aforada) de una solución.', simple: 'Un pedazo exacto de la solución.', simpler: 'Una cucharada medida de la sopa.' }
    ],
    concepts: [
      { id: 'base.moles', title: 'Moles, M y mmol', root: true },
      { id: 'base.estequio', title: 'Estequiometría', root: true },
      { id: 'ana.volumetria', mission: 'm1', title: 'Titulante, equivalencia y punto final', needs: ['base.moles'] },
      { id: 'ana.patron', mission: 'm1', title: 'Patrón primario y estandarización', needs: ['ana.volumetria'] },
      { id: 'ana.estequio', mission: 'm2', title: 'Cálculo de la concentración del analito', needs: ['base.estequio', 'ana.volumetria'] },
      { id: 'ana.alicuotas', mission: 'm2', title: 'Alícuotas, diluciones y % en la muestra', needs: ['ana.estequio'] }
    ],
    curiosities: [
      { text: 'La palabra "bureta" la popularizó Gay-Lussac en 1824; antes las titulaciones se hacían contando gotas.', slide: 1 },
      { text: 'El NaOH sólido absorbe CO₂ del aire y forma carbonato: por eso nunca se pesa directamente para preparar un patrón.', slide: 4 },
      { text: 'Una bureta de 50 mL se lee con dos decimales (±0,02 mL): una gota mal leída ya es un error relativo de 0,1 % en 20 mL.', slide: 2 }
    ],
    slideImages: {},
    slides: {
      1: { title: 'Qué es una titulación', bullets: ['Titulante (bureta) + analito (matraz)', 'Reacción rápida, completa y de estequiometría conocida'] },
      2: { title: 'Equivalencia y punto final', bullets: ['Equivalencia: teórica (estequiometría)', 'Punto final: observado (indicador)', 'Error de titulación = V_final − V_equivalencia'] },
      3: { title: 'Directa, por retroceso y por desplazamiento', bullets: ['Directa: titulante reacciona con el analito', 'Retroceso: exceso conocido de reactivo y se titula lo que sobra'] },
      4: { title: 'Patrón primario', bullets: ['Alta pureza, estable, no higroscópico', 'Masa molar alta (menos error al pesar)', 'Ej.: KHP, Na₂CO₃, bórax; NaOH y HCl NO lo son'] },
      5: { title: 'Estandarización', bullets: ['Se pesa el patrón y se titula con la solución', 'C = n(patrón)·(estequiometría) / V'] },
      6: { title: 'Cálculos volumétricos', bullets: ['n = C·V (mmol = M × mL)', 'Relación estequiométrica en la equivalencia', 'C_analito = n_analito / V_analito'] },
      7: { title: 'Alícuotas y diluciones', bullets: ['C₁V₁ = C₂V₂', 'Factor = V_total / V_alícuota', 'Del matraz a la muestra original'] }
    },
    missions: [
      {
        id: 'm1', title: 'Las piezas de una titulación', subtitle: 'Titulante, equivalencia, punto final y patrones', minutes: 20, slides: '1–5', pep: 'P3: conceptos de volumetría',
        stages: {
          hook: { title: 'Medir con gotas', sage: 'Para saber cuánto ácido hay en un vinagre no necesitas un instrumento caro: una bureta, una solución conocida y un indicador. Gota a gota, cuentas moles.',
            text: 'La volumetría mide **volumen** de una solución de concentración conocida que reacciona exactamente con el analito. En la PEP te preguntarán sus piezas y por qué hay que estandarizar el titulante.' },
          diagnostic: [
            q('m1-d1', 'El indicador cambia de color. Eso es…', [{ text: 'El punto final', correct: true }, { text: 'El punto de equivalencia', misconception: 'eq-vs-end' }, { text: 'La estandarización', note: 'Estandarizar es otra cosa.' }], { concept: 'ana.volumetria', explain: 'Lo que observas es el punto final.', slide: 2 }),
            q('m1-d2', '¿Por qué no se prepara NaOH pesando el sólido y listo?', [{ text: 'Absorbe agua y CO₂: su masa no es confiable', correct: true }, { text: 'Porque es muy caro', note: 'Es barato.' }, { text: 'Porque no se disuelve', note: 'Se disuelve muy bien.' }], { concept: 'ana.patron', explain: 'No es patrón primario.', slide: 4, misconception: 'primary-std' })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.moles', title: 'Desde cero: M, mol y mmol', slide: 6, body: '**Molaridad** M = mol/L. Truco de laboratorio: **M también es mmol/mL**. Entonces 20,00 mL de NaOH 0,1000 M contienen 20,00 × 0,1000 = **2,000 mmol**.',
              deeper: 'Trabajar en mL y mmol evita convertir a litros. Solo cuida no mezclar: mL × M = mmol; L × M = mol.' }
          ],
          explain: [],
          transfer: [
            num('m1-t1', 'Estilo PEP: se pesan 0,5105 g de KHP (204,22 g/mol, reacciona 1:1 con NaOH) y se titulan con 24,85 mL de NaOH. ¿Concentración del NaOH?', 0.1006, 'M',
              { concept: 'ana.patron', label: 'C', slide: 5, tol: 0.005, traps: [{ value: 1.006e-4, note: 'Mezclaste mol con mL: usa L o mmol.', misconception: 'ml-l' }, { value: 0.5105 / 24.85, note: 'Falta pasar la masa a moles.' }],
                solution: ['n(KHP) = 0,5105 / 204,22 = 2,4998 mmol', 'n(NaOH) = n(KHP) (1:1)', 'C = 2,4998 mmol / 24,85 mL = 0,1006 M'], explain: '0,1006 M.' }),
            write('m1-w1', 'Enséñale a tu compañero: ¿qué diferencia hay entre punto de equivalencia y punto final, y por qué importa?', 'El punto de equivalencia es el momento teórico en que se agregó exactamente la cantidad estequiométrica de titulante; el punto final es lo que observamos, como el cambio de color del indicador. Si no coinciden hay un error de titulación, por eso se elige un indicador que vire lo más cerca posible de la equivalencia.',
              ['Equivalencia: teórica, por estequiometría', 'Punto final: observado (indicador)', 'La diferencia es el error de titulación'],
              { concept: 'ana.volumetria', explain: 'Teórico frente a observado.', slide: 2, teach: true, keywords: [{ label: 'teórico / estequiométrico', any: ['teóric', 'teoric', 'estequiom'] }, { label: 'indicador / observado', any: ['indicador', 'observ', 'color'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **titulante, equivalencia y punto final**.',
            pretest: q('m1-pre1', 'Adivina antes: ¿qué va en la bureta?', [{ text: 'La solución de concentración conocida (titulante)', correct: true }, { text: 'La muestra', note: 'La muestra va en el matraz.' }, { text: 'El indicador', note: 'El indicador va en el matraz, unas gotas.' }], { concept: 'ana.volumetria', explain: 'Titulante en la bureta.', slide: 1 }),
            explain: [
              { id: 'm1b1', concept: 'ana.volumetria', title: 'Las piezas de una titulación', slide: 2, body: 'El **titulante** (concentración conocida, en la bureta) se agrega al **analito** (en el matraz) hasta el **punto de equivalencia**, donde los moles se igualan según la estequiometría. Lo que se ve es el **punto final** (viraje del indicador). La diferencia es el **error de titulación**. La reacción debe ser **rápida, completa y de estequiometría conocida**. Si el analito reacciona lento, se usa **titulación por retroceso**: un exceso conocido de reactivo y se titula lo que sobra.',
                deeper: 'Ejemplo: vinagre (ácido acético) en el matraz, NaOH 0,1000 M en la bureta, fenolftaleína como indicador. El rosado pálido persistente es el punto final; la equivalencia es cuando n(NaOH) = n(ácido acético).' }
            ],
            practice: [
              match('m1-p1', 'Une cada pieza con su descripción:', [['Titulante', 'Solución conocida en la bureta'], ['Analito', 'Lo que se quiere cuantificar, en el matraz'], ['Punto final', 'Viraje observado del indicador'], ['Punto de equivalencia', 'Igualdad estequiométrica teórica']],
                { concept: 'ana.volumetria', explain: 'Las piezas.', slide: 2, hint: 'Teórico frente a observado.', misconception: 'eq-vs-end' }),
              q('m1-p2', 'Un analito reacciona muy lento con el titulante. ¿Qué haces?', [{ text: 'Titulación por retroceso: exceso conocido de reactivo y titular lo que sobra', correct: true }, { text: 'Agregar más indicador', note: 'El indicador no acelera la reacción.' }, { text: 'Titular más rápido', note: 'Pasarías la equivalencia.' }], { concept: 'ana.volumetria', explain: 'Retroceso.', slide: 3, hint: 'Hay que darle tiempo a la reacción.' }),
              order('m1-p3', 'Ordena una titulación directa:', [['a', 'Medir la muestra en el matraz'], ['b', 'Agregar unas gotas de indicador'], ['c', 'Agregar titulante desde la bureta'], ['d', 'Detenerse en el viraje y leer el volumen']], ['a', 'b', 'c', 'd'],
                { concept: 'ana.volumetria', direction: 'Primero lo primero.', explain: 'Muestra, indicador, titulante, lectura.', slide: 1, hint: 'El indicador va antes de titular.' })
            ],
            rule: { title: 'Regla del sabio: leer una titulación', concept: 'ana.volumetria', steps: ['Bureta = titulante conocido; matraz = analito', 'Equivalencia = teórica; punto final = observado', 'Reacción lenta → retroceso'] } },
          { id: 'r2', intro: 'Parte 2: **patrones y estandarización**.',
            pretest: q('m1-pre2', 'Adivina antes: ¿cuál de estos sirve como patrón primario?', [{ text: 'Ftalato ácido de potasio (KHP)', correct: true }, { text: 'NaOH sólido', misconception: 'primary-std' }, { text: 'HCl concentrado', note: 'Es volátil: su concentración cambia.' }], { concept: 'ana.patron', explain: 'KHP: puro, estable, masa molar alta.', slide: 4 }),
            explain: [
              { id: 'm1b2', concept: 'ana.patron', title: 'Patrones y estandarización', slide: 4, body: 'Un **patrón primario** es **muy puro**, **estable**, **no higroscópico**, de **masa molar alta** (menos error relativo al pesar) y reacciona **rápido y completo**. Ejemplos: **KHP** (para bases), **Na₂CO₃** y bórax (para ácidos). NaOH y HCl **no** lo son, así que se **estandarizan**: se pesa el patrón, se titula y se calcula **C = n(patrón) × (relación estequiométrica) / V**.',
                deeper: 'Con 0,5105 g de KHP (204,22 g/mol) = 2,4998 mmol, y 24,85 mL de NaOH: C = 2,4998/24,85 = 0,1006 M. Una solución estandarizada así se llama **patrón secundario**.' }
            ],
            practice: [
              classify('m1-p4', '¿Sirve como patrón primario?', [['si', 'Sí'], ['no', 'No']],
                [['a', 'KHP (ftalato ácido de potasio)', 'si'], ['b', 'Na₂CO₃ anhidro', 'si'], ['c', 'NaOH en lentejas', 'no'], ['d', 'HCl concentrado', 'no']],
                { concept: 'ana.patron', explain: 'NaOH absorbe agua y CO₂; HCl es volátil.', slide: 4, hint: '¿Es puro y estable al pesarlo?', misconception: 'primary-std' }),
              num('m1-p5', 'Se titulan 0,4084 g de KHP (204,22 g/mol, 1:1) con 20,10 mL de NaOH. Calcula la concentración del NaOH.', 0.0995, 'M',
                { concept: 'ana.patron', label: 'C', slide: 5, tol: 0.005, hint: 'n = m/MM en mmol; C = n/V(mL).', traps: [{ value: 9.95e-5, note: 'Mezclaste mol con mL.', misconception: 'ml-l' }], solution: ['n(KHP) = 408,4 mg / 204,22 = 2,000 mmol', 'C = 2,000 / 20,10 = 0,0995 M'], explain: '0,0995 M.' }),
              q('m1-p6', '¿Por qué conviene que el patrón tenga masa molar alta?', [{ text: 'Para pesar más masa por mol: el error relativo de la balanza es menor', correct: true }, { text: 'Para que reaccione más rápido', note: 'La masa molar no cambia la velocidad.' }, { text: 'Para gastar menos titulante', note: 'Los moles mandan, no la masa.' }], { concept: 'ana.patron', explain: 'Más masa pesada = menor error relativo.', slide: 4, hint: 'Piensa en la balanza (±0,1 mg).' })
            ],
            rule: { title: 'Regla del sabio: estandarizar', concept: 'ana.patron', steps: ['Patrón primario: puro, estable, no higroscópico, MM alta', 'Pesa → n = m/MM', 'C = n × estequiometría / V'] } }
        ]
      },
      {
        id: 'm2', title: 'De la bureta a la muestra', subtitle: 'Estequiometría, alícuotas y % en la muestra', minutes: 25, slides: '6–7', pep: 'P4: cálculos volumétricos',
        stages: {
          hook: { title: 'La aspirina de 500 mg', sage: 'Un comprimido dice "500 mg de ácido acetilsalicílico". Lo disuelves en 100 mL, titulas solo 10 mL… y gastas 5,55 mL de NaOH. ¿Cumple lo que promete? Hay que volver, paso a paso, de la bureta al comprimido.',
            text: 'El error más común en la PEP no es la química: es **olvidar la alícuota** o la estequiometría. Aquí armamos el "mapa de recipientes".' },
          diagnostic: [
            q('m2-d1', 'Tituló 10,00 mL de una solución de 100,0 mL y encontró 0,2775 mmol. ¿Cuánto había en total?', [{ text: '2,775 mmol', correct: true }, { text: '0,2775 mmol', misconception: 'aliquot-factor' }, { text: '0,02775 mmol', note: 'Al revés.' }], { concept: 'ana.alicuotas', explain: '× 100/10.', slide: 7 }),
            q('m2-d2', '25,00 mL de HCl gastan 22,40 mL de NaOH 0,1000 M. C(HCl) =', [{ text: '0,0896 M', correct: true }, { text: '0,1116 M', note: 'Invertiste los volúmenes.' }, { text: '2,240 M', note: 'Falta dividir por el volumen de HCl.' }], { concept: 'ana.estequio', explain: '2,240 mmol / 25,00 mL.', slide: 6 })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.estequio', title: 'Desde cero: estequiometría', slide: 6, body: 'Los coeficientes de la ecuación dicen **cuántos moles reaccionan con cuántos**. En H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O, **1 mol de ácido gasta 2 de base**. Así: n(NaOH) = 2·n(H₂SO₄).',
              deeper: 'Regla: n(analito) = n(titulante) × (coef. analito / coef. titulante). Para H₂SO₄ con NaOH: n(H₂SO₄) = n(NaOH) × 1/2.' }
          ],
          explain: [],
          transfer: [
            num('m2-t1', 'Estilo PEP: un comprimido de aspirina (0,6500 g) se disuelve y se afora a 100,0 mL. Una alícuota de 10,00 mL gasta 5,55 mL de NaOH 0,0500 M (1:1). Masa molar 180,16 g/mol. ¿Cuántos mg de ácido acetilsalicílico tiene el comprimido?', 500, 'mg',
              { concept: 'ana.alicuotas', label: 'masa', slide: 7, tol: 0.01, traps: [{ value: 50.0, note: 'Esa es la masa en la alícuota: × 100/10.', misconception: 'aliquot-factor' }, { value: 0.5, note: 'Revisa unidades: mmol × g/mol = mg.', misconception: 'ml-l' }],
                solution: ['n(NaOH) = 5,55 × 0,0500 = 0,2775 mmol = n(AAS) en la alícuota', 'En el comprimido: 0,2775 × 100,0/10,00 = 2,775 mmol', 'm = 2,775 × 180,16 = 500 mg (76,9 % del comprimido)'], explain: '500 mg.' }),
            num('m2-t2', 'Estilo PEP: 20,00 mL de H₂SO₄ gastan 18,60 mL de NaOH 0,1000 M. ¿Concentración del H₂SO₄?', 0.0465, 'M',
              { concept: 'ana.estequio', label: 'C', slide: 6, tol: 0.005, traps: [{ value: 0.093, note: 'Olvidaste que cada H₂SO₄ gasta 2 NaOH.', misconception: 'stoich-ratio' }, { value: 0.186, note: 'Multiplicaste por 2 al revés.' }],
                solution: ['n(NaOH) = 18,60 × 0,1000 = 1,860 mmol', 'n(H₂SO₄) = 1,860/2 = 0,930 mmol', 'C = 0,930/20,00 = 0,0465 M'], explain: '0,0465 M.' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿cómo se vuelve desde los mL de la bureta a los mg de analito en la muestra original?', 'Primero multiplico el volumen de titulante por su concentración para tener los mmol de titulante. Con la estequiometría paso a mmol de analito en lo que titulé. Si titulé una alícuota, multiplico por el volumen total dividido por el volumen de la alícuota. Finalmente multiplico por la masa molar para tener mg.',
              ['mmol titulante = V × C', 'Estequiometría → mmol de analito', 'Factor de alícuota V_total/V_alícuota', 'Masa = mmol × masa molar'],
              { concept: 'ana.alicuotas', explain: 'El mapa de recipientes.', slide: 7, teach: true, keywords: [{ label: 'V × C', any: ['volumen', 'concentr', 'v × c', 'vxc'] }, { label: 'estequiometría', any: ['estequi', 'coeficiente'] }, { label: 'alícuota', any: ['alícuota', 'alicuota', 'factor'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **calcular desde la bureta**.',
            pretest: q('m2-pre1', 'Adivina antes: 10,00 mL de NaOH 0,2000 M contienen…', [{ text: '2,000 mmol', correct: true }, { text: '0,002 mmol', misconception: 'ml-l' }, { text: '20,00 mmol', note: 'Revisa la multiplicación.' }], { concept: 'base.moles', explain: '10,00 × 0,2000.', slide: 6 }),
            explain: [
              { id: 'm2b1', concept: 'ana.estequio', title: 'Calcular desde la bureta', slide: 6, body: '1) **mmol de titulante = V(mL) × C(M)**. 2) **Estequiometría**: mmol de analito = mmol de titulante × (coef. analito / coef. titulante). 3) **C del analito = mmol / V(mL) del analito**, o **masa = mmol × MM** (mg).',
                deeper: 'HCl: 22,40 mL × 0,1000 M = 2,240 mmol NaOH = 2,240 mmol HCl (1:1) → C = 2,240/25,00 = 0,0896 M. Con H₂SO₄ habría que dividir por 2.' }
            ],
            practice: [
              num('m2-p1', '25,00 mL de HCl gastan 22,40 mL de NaOH 0,1000 M. Calcula C(HCl).', 0.0896, 'M',
                { concept: 'ana.estequio', label: 'C', slide: 6, hint: 'mmol NaOH = mmol HCl; divide por 25,00 mL.', traps: [{ value: 0.1116, note: 'Invertiste los volúmenes.' }, { value: 8.96e-5, note: 'Mezclaste mL con L.', misconception: 'ml-l' }], solution: ['n = 22,40 × 0,1000 = 2,240 mmol', 'C = 2,240/25,00 = 0,0896 M'], explain: '0,0896 M.' }),
              spot('m2-fx1', 'Un aprendiz calculó C(H₂SO₄) con 15,00 mL de ácido y 24,00 mL de NaOH 0,1000 M. ¿Dónde se equivocó?', ['n(NaOH) = 24,00 × 0,1000 = 2,400 mmol', 'n(H₂SO₄) = 2,400 mmol', 'C = 2,400/15,00 = 0,160 M'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'n(H₂SO₄) = 2,400/2 = 1,200 mmol → C = 0,0800 M', correct: true }, { text: 'n(H₂SO₄) = 2,400 × 2 = 4,800 mmol', note: 'Al revés: el ácido gasta el doble de base.' }] },
                { concept: 'ana.estequio', slide: 6, stepNotes: { 0: 'Correcto.', 2: 'Viene del error anterior.' }, explain: 'Relación 1:2.', hint: '¿Cuántos NaOH gasta cada H₂SO₄?', misconception: 'stoich-ratio' }),
              q('m2-p2', 'Na₂CO₃ + 2HCl → 2NaCl + CO₂ + H₂O. Si se gastan 3,00 mmol de HCl, ¿cuántos mmol de Na₂CO₃ había?', [{ text: '1,50 mmol', correct: true }, { text: '3,00 mmol', misconception: 'stoich-ratio' }, { text: '6,00 mmol', note: 'Al revés.' }], { concept: 'ana.estequio', explain: '3,00/2.', slide: 6, hint: 'Mira los coeficientes.' })
            ],
            rule: { title: 'Regla del sabio: desde la bureta', concept: 'ana.estequio', steps: ['mmol = mL × M', 'Aplica la estequiometría', 'C = mmol/mL, o masa = mmol × MM'] } },
          { id: 'r2', intro: 'Parte 2: **alícuotas, diluciones y % en la muestra**.',
            pretest: q('m2-pre2', 'Adivina antes: diluyes 10,00 mL hasta 100,0 mL. La concentración…', [{ text: 'Baja 10 veces', correct: true }, { text: 'Sube 10 veces', note: 'Agregaste solvente.' }, { text: 'No cambia', note: 'Los moles se reparten en más volumen.' }], { concept: 'ana.alicuotas', explain: 'C₁V₁ = C₂V₂.', slide: 7 }),
            explain: [
              { id: 'm2b2', concept: 'ana.alicuotas', title: 'Alícuotas y diluciones', slide: 7, body: 'Dibuja el **mapa de recipientes**: muestra → matraz aforado (V_total) → **alícuota** (pipeta) → matraz de titulación. Los mmol encontrados son de la **alícuota**: multiplica por **V_total/V_alícuota** para volver al matraz. Diluciones: **C₁V₁ = C₂V₂**. Al final: **% = masa de analito / masa de muestra × 100**.',
                deeper: 'Aspirina: 0,2775 mmol en 10,00 mL → × 100,0/10,00 = 2,775 mmol → × 180,16 = 500 mg; 500/650,0 × 100 = 76,9 %. Si hubo dos diluciones, los factores se multiplican.' }
            ],
            practice: [
              num('m2-p3', 'Una muestra de 1,250 g se disuelve y se afora a 250,0 mL. Una alícuota de 25,00 mL contiene 0,4000 mmol de analito (MM 100,0 g/mol). ¿% de analito en la muestra?', 32.0, '%',
                { concept: 'ana.alicuotas', label: '%', slide: 7, hint: '× 250,0/25,00; luego × MM; luego / masa de muestra.', traps: [{ value: 3.2, note: 'Falta el factor de alícuota (× 10).', misconception: 'aliquot-factor' }], solution: ['Total: 0,4000 × 10 = 4,000 mmol', 'Masa: 4,000 × 100,0 = 400,0 mg', '% = 400,0/1250 × 100 = 32,0 %'], explain: '32,0 %.' }),
              num('m2-p4', 'Se toman 5,00 mL de una solución 0,500 M y se aforan a 250,0 mL. ¿Nueva concentración?', 0.01, 'M',
                { concept: 'ana.alicuotas', label: 'C₂', slide: 7, hint: 'C₂ = C₁V₁/V₂.', traps: [{ value: 25, note: 'Al revés: diluir baja la concentración.' }], solution: ['C₂ = 0,500 × 5,00/250,0 = 0,0100 M'], explain: '0,0100 M.' }),
              q('m2-p6', 'Tituló una alícuota de 20,00 mL de un aforado de 500,0 mL. ¿Por cuánto multiplicas los mmol encontrados?', [{ text: '25', correct: true }, { text: '0,04', note: 'Al revés: el total es mayor que la alícuota.' }, { text: '1', misconception: 'aliquot-factor' }], { concept: 'ana.alicuotas', explain: '500,0/20,00 = 25.', slide: 7, hint: 'V_total / V_alícuota.' }),
              order('m2-p5', 'Ordena el camino de vuelta, de la bureta al %:', [['a', 'mmol de titulante = V × C'], ['b', 'mmol de analito (estequiometría)'], ['c', '× V_total/V_alícuota'], ['d', 'masa = mmol × MM'], ['e', '% = masa analito / masa muestra × 100']], ['a', 'b', 'c', 'd', 'e'],
                { concept: 'ana.alicuotas', direction: 'Desde la bureta.', explain: 'El mapa de recipientes al revés.', slide: 7, hint: 'Primero los moles de titulante.' })
            ],
            rule: { title: 'Regla del sabio: el mapa de recipientes', concept: 'ana.alicuotas', steps: ['Dibuja muestra → aforado → alícuota → matraz', 'mmol en la alícuota × V_total/V_alícuota', 'mmol × MM → mg; / masa muestra × 100 → %'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.moles', title: 'Moles y molaridad', subtitle: 'M = mmol/mL', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.moles', title: 'M, mol y mmol', slide: 6, body: '**n = m/MM**. **C = n/V**. En el laboratorio: **mmol = mL × M** y **mg = mmol × MM**.',
            deeper: '0,5105 g de KHP = 510,5 mg / 204,22 = 2,4998 mmol. 25,00 mL × 0,1000 M = 2,500 mmol.' }],
          practice: [
            num('z1-p1', '¿Cuántos mmol hay en 15,00 mL de NaOH 0,1200 M?', 1.8, 'mmol', { concept: 'base.moles', label: 'n', slide: 6, tol: 0.005, hint: 'mmol = mL × M.', traps: [{ value: 0.0018, note: 'Eso serían mol.', misconception: 'ml-l' }], solution: ['15,00 × 0,1200 = 1,800 mmol'], explain: '1,800 mmol.' }),
            q('z1-p2', '1 M es igual a…', [{ text: '1 mmol/mL', correct: true }, { text: '1 mol/mL', note: 'Eso sería 1000 M.' }, { text: '1 mmol/L', note: 'Eso es 1 mM.' }], { concept: 'base.moles', explain: 'mol/L = mmol/mL.', slide: 6, hint: 'Divide arriba y abajo por 1000.' })
          ],
          transfer: [write('z1-w1', 'Explica por qué M es lo mismo que mmol/mL.', 'Porque M es mol/L, y si divido arriba y abajo por 1000 queda mmol/mL: un mol tiene 1000 mmol y un litro tiene 1000 mL.',
            ['M = mol/L', '1 mol = 1000 mmol y 1 L = 1000 mL', 'Se dividen arriba y abajo por 1000'],
            { concept: 'base.moles', explain: 'Mismo factor arriba y abajo.', slide: 6, keywords: [{ label: '1000', any: ['1000', 'mil'] }, { label: 'mmol', any: ['mmol', 'milimol'] }] })]
        } },
      { id: 'z2', concept: 'base.estequio', title: 'Estequiometría', subtitle: 'Coeficientes y relaciones', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.estequio', title: 'Leer los coeficientes', slide: 6, body: 'n(A)/coef(A) = n(B)/coef(B) para dos especies que reaccionan. En la equivalencia, **n(analito) = n(titulante) × coef(analito)/coef(titulante)**.',
            deeper: 'H₃PO₄ + 2NaOH (hasta el segundo punto): n(ácido) = n(NaOH)/2. Ca²⁺ + EDTA: 1:1.' }],
          practice: [
            num('z2-p1', '2 HCl + Ca(OH)₂ → CaCl₂ + 2 H₂O. ¿Cuántos mmol de HCl gastan 0,750 mmol de Ca(OH)₂?', 1.5, 'mmol', { concept: 'base.estequio', label: 'n', slide: 6, tol: 0.005, hint: '2 HCl por cada Ca(OH)₂.', traps: [{ value: 0.375, note: 'Al revés.' }, { value: 0.75, note: 'Falta el coeficiente 2.', misconception: 'stoich-ratio' }], solution: ['n(HCl) = 2 × 0,750 = 1,50 mmol'], explain: '1,50 mmol.' }),
            q('z2-p2', 'En HCl + NaOH, ¿qué relación hay en la equivalencia?', [{ text: '1 : 1', correct: true }, { text: '1 : 2', note: 'El HCl tiene un solo H⁺.' }, { text: '2 : 1', note: 'El NaOH tiene un solo OH⁻.' }], { concept: 'base.estequio', explain: 'Un H⁺ por un OH⁻.', slide: 6, hint: 'Cuenta H⁺ y OH⁻.' })
          ],
          transfer: [write('z2-w1', 'Explica por qué el H₂SO₄ gasta el doble de NaOH que el HCl (a igual cantidad de moles).', 'Porque cada molécula de H₂SO₄ tiene dos protones ácidos y cada NaOH neutraliza uno; el HCl tiene solo uno. Por eso la relación es 1:2 para el sulfúrico y 1:1 para el clorhídrico.',
            ['H₂SO₄ tiene 2 H⁺; HCl tiene 1', 'Cada OH⁻ neutraliza un H⁺', 'Relación 1:2 frente a 1:1'],
            { concept: 'base.estequio', explain: 'Protones ácidos.', slide: 6, keywords: [{ label: 'dos protones', any: ['dos', '2 h', 'diprót', 'diprot'] }, { label: '1:2', any: ['1:2', 'doble', '1 : 2'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-mmol', title: 'Desde la bureta', formula: 'mmol = V(mL) × C(M) · n_analito = n_titulante × coef_analito/coef_titulante · C = mmol/V', concepts: ['ana.estequio'], vars: [['V', 'volumen', 'mL'], ['C', 'concentración', 'M = mmol/mL'], ['coef', 'coeficiente estequiométrico', '—']],
        what: 'Pasar del volumen gastado a la cantidad de analito.', when: 'Toda titulación.', example: '22,40 mL × 0,1000 M = 2,240 mmol → C(HCl) = 0,0896 M.', deeper: 'Cuida la estequiometría (H₂SO₄ es 1:2).',
        sources: [{ label: 'Skoog, cap. 13', slide: 6 }],
        calc: { inputs: [{ id: 'v', label: 'V titulante (mL)', value: 22.4, step: 0.01 }, { id: 'c', label: 'C titulante (M)', value: 0.1, step: 0.0001 }, { id: 'r', label: 'coef analito / coef titulante', value: 1, step: 0.5 }, { id: 'va', label: 'V analito (mL)', value: 25, step: 0.01 }], run: v => { const n = v.v * v.c * v.r; return 'n = **' + n.toFixed(4).replace('.', ',') + ' mmol** · C = **' + (n / v.va).toFixed(4).replace('.', ',') + ' M**'; } } },
      { id: 'f-ali', title: 'Alícuotas y diluciones', formula: 'n_total = n_alícuota × V_total/V_alícuota · C₁V₁ = C₂V₂ · % = m_analito/m_muestra × 100', concepts: ['ana.alicuotas'], vars: [['V_total', 'volumen del aforado', 'mL'], ['V_alícuota', 'volumen pipeteado', 'mL'], ['m', 'masa', 'mg']],
        what: 'Volver de lo titulado a la muestra original.', when: 'Cuando se titula solo una parte.', example: 'Aspirina: 0,2775 mmol × 10 × 180,16 = 500 mg (76,9 %).', deeper: 'Si hay varias diluciones, los factores se multiplican.',
        sources: [{ label: 'Skoog, cap. 13; Harris, cap. 7', slide: 7 }],
        calc: { inputs: [{ id: 'n', label: 'mmol en la alícuota', value: 0.2775, step: 0.0001 }, { id: 'vt', label: 'V total (mL)', value: 100, step: 0.1 }, { id: 'va', label: 'V alícuota (mL)', value: 10, step: 0.01 }, { id: 'mm', label: 'masa molar (g/mol)', value: 180.16, step: 0.01 }, { id: 'ms', label: 'masa muestra (mg)', value: 650, step: 0.1 }], run: v => { const m = v.n * v.vt / v.va * v.mm; return 'masa = **' + m.toFixed(1).replace('.', ',') + ' mg** · **' + (m / v.ms * 100).toFixed(1).replace('.', ',') + ' %**'; } } }
    ],
    recipes: [],
    mini: {
      'base.moles': { idea: 'M = mmol/mL: multiplica mL × M.', steps: ['n = m/MM', 'mmol = mL × M', 'mg = mmol × MM'], check: { prompt: '20 mL × 0,1 M =', options: [{ text: '2 mmol', correct: true }, { text: '2 mol', note: 'mL × M da mmol.' }], explain: '2 mmol.' } },
      'base.estequio': { idea: 'Los coeficientes dicen cuántos con cuántos.', steps: ['Escribe la ecuación', 'Divide cada n por su coeficiente', 'Iguala'], check: { prompt: 'H₂SO₄ : NaOH =', options: [{ text: '1 : 2', correct: true }, { text: '1 : 1', note: '2 H⁺.' }], explain: '1:2.' } },
      'ana.volumetria': { idea: 'Gota a gota hasta la equivalencia.', steps: ['Titulante en la bureta', 'Equivalencia: teórica', 'Punto final: lo que ves'], check: { prompt: 'El viraje del indicador es…', options: [{ text: 'El punto final', correct: true }, { text: 'La equivalencia', note: 'La equivalencia es teórica.' }], explain: 'Punto final.' } },
      'ana.patron': { idea: 'Una masa confiable para conocer tu titulante.', steps: ['Puro, estable, no higroscópico', 'Pesa y titula', 'C = n/V'], check: { prompt: 'NaOH sólido es patrón primario…', options: [{ text: 'No', correct: true }, { text: 'Sí', note: 'Absorbe agua y CO₂.' }], explain: 'No.' } },
      'ana.estequio': { idea: 'V × C → estequiometría → C o masa.', steps: ['mmol = V × C', '× coef. analito/coef. titulante', '/ V analito o × MM'], check: { prompt: '1,0 mmol NaOH neutraliza … mmol H₂SO₄', options: [{ text: '0,5', correct: true }, { text: '2,0', note: 'Al revés.' }], explain: '1:2.' } },
      'ana.alicuotas': { idea: 'Lo titulado es solo un pedazo: multiplica para volver.', steps: ['Dibuja los recipientes', '× V_total/V_alícuota', 'mg y %'], check: { prompt: 'Alícuota 10 de 250 mL: factor =', options: [{ text: '25', correct: true }, { text: '0,04', note: 'Al revés.' }], explain: '250/10.' } }
    },
    deep: {},
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', '10 mL × 0,5 M =', [{ text: '5 mmol', correct: true }, { text: '0,005 mmol', misconception: 'ml-l' }, { text: '50 mmol', note: 'Revisa.' }], { concept: 'base.moles', explain: '10 × 0,5.', slide: 6 }) },
      { level: 1, item: q('dx-2', 'HCl + NaOH reaccionan…', [{ text: '1 : 1', correct: true }, { text: '1 : 2', misconception: 'stoich-ratio' }, { text: '2 : 1', note: 'Un H⁺ y un OH⁻.' }], { concept: 'base.estequio', explain: 'Uno a uno.', slide: 6 }) },
      { level: 2, item: q('dx-3', 'Lo que se ve al cambiar el color del indicador es…', [{ text: 'El punto final', correct: true }, { text: 'El punto de equivalencia', misconception: 'eq-vs-end' }, { text: 'El patrón', note: 'No.' }], { concept: 'ana.volumetria', explain: 'Observado.', slide: 2 }) },
      { level: 2, item: q('dx-4', '¿Cuál es patrón primario?', [{ text: 'KHP', correct: true }, { text: 'NaOH', misconception: 'primary-std' }, { text: 'HCl concentrado', note: 'Volátil.' }], { concept: 'ana.patron', explain: 'Puro y estable.', slide: 4 }) },
      { level: 2, item: q('dx-5', '20,00 mL de HCl gastan 10,00 mL de NaOH 0,2000 M. C(HCl) =', [{ text: '0,1000 M', correct: true }, { text: '0,4000 M', note: 'Invertiste los volúmenes.' }, { text: '2,000 M', note: 'Falta dividir por 20,00.' }], { concept: 'ana.estequio', explain: '2,000/20,00.', slide: 6 }) },
      { level: 3, item: q('dx-6', 'Alícuota de 25,00 mL de un aforado de 250,0 mL contiene 1,00 mmol. Total =', [{ text: '10,0 mmol', correct: true }, { text: '1,00 mmol', misconception: 'aliquot-factor' }, { text: '0,100 mmol', note: 'Al revés.' }], { concept: 'ana.alicuotas', explain: '× 10.', slide: 7 }) },
      { level: 3, item: q('dx-7', '1,860 mmol de NaOH titulan H₂SO₄. n(H₂SO₄) =', [{ text: '0,930 mmol', correct: true }, { text: '1,860 mmol', misconception: 'stoich-ratio' }, { text: '3,720 mmol', note: 'Al revés.' }], { concept: 'ana.estequio', explain: '/2.', slide: 6 }) }
    ] }
  };
})();
