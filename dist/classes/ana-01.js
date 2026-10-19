/* Química Analítica · PEP 1 · El análisis químico y sus errores (viernes 13 de noviembre).
   Fuentes: "Conceptos generales del Análisis Químico" y "Etapas del Análisis Químico" (Dra. Carmen Pizarro, USACH 2S2026; numeración propia por sección).
   La clase de errores aún no está en el Drive: esa parte sale de la bibliografía oficial del curso (Skoog, West, Holler y Crouch, cap. 5–6) y se marca así.
   Números recalculados en Python (docs/replica-pep1/SPEC.md). */
(() => {
  'use strict';
  const SRC = 'catedra-ana';
  const BOOK = 'skoog';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  const num = (id, prompt, answer, unit, extra = {}) => ({ id, type: 'number', prompt, answer, unit, tol: 0.01, source: SRC, ...extra });
  const spot = (id, prompt, steps, wrong, fix, extra = {}) => ({ id, type: 'spot', prompt, steps, wrong, fix, source: SRC, ...extra });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['ana-01'] = {
    id: 'ana-01',
    subject: 'analitica',
    title: 'El análisis químico y sus errores',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Conceptos generales y Etapas del Análisis Químico', author: 'Dra. Carmen Pizarro', detail: 'Química Analítica, Química y Farmacia, USACH, 2S 2026', authority: 'Material oficial del curso' },
      [BOOK]: { title: 'Fundamentos de Química Analítica, cap. 5–6 (errores y estadística)', author: 'Skoog, West, Holler y Crouch', detail: 'Bibliografía oficial del curso (la clase de errores aún no está en el Drive)', authority: 'Libro de texto' }
    },
    misconceptions: {
      'analyte-matrix': { label: 'Confundiste analito, muestra y matriz', why: '**Analito**: lo que quieres medir. **Muestra**: la porción representativa que analizas. **Matriz**: todo lo demás que acompaña al analito en la muestra.',
        prereq: { title: '¿Qué es? ¿Cuánto hay?', mission: 'm1', block: 'm1b1' }, base: 'base.unidades' },
      'quali-quanti': { label: 'Confundiste cualitativo con cuantitativo', why: '**Cualitativo** responde "¿qué es?" (identidad). **Cuantitativo** responde "¿cuánto hay?" (cantidad).',
        prereq: { title: '¿Qué es? ¿Cuánto hay?', mission: 'm1', block: 'm1b1' }, base: 'base.unidades' },
      'humidity-direction': { label: 'Usaste el factor de humedad al revés', why: 'Fh = (100 + %h)/100 es mayor que 1: la muestra húmeda pesa **más** que la seca. Para tener X g de masa seca pesas **X · Fh** de muestra húmeda; para pasar de húmeda a seca, divides.',
        prereq: { title: 'Preparar la muestra: humedad', mission: 'm1', block: 'm1b2' }, base: 'base.unidades',
        check: q('fix-hum', 'Caso corto: Fh = 1,20. Quieres el equivalente a 10 g de masa seca. ¿Cuánto pesas de muestra?', [{ text: '12 g', correct: true }, { text: '8,33 g', note: 'Dividiste: así tendrías menos de 10 g secos.' }, { text: '10 g', note: 'La muestra trae agua: pesas más.' }],
          { concept: 'ana.humedad', explain: 'm = 10 × 1,20 = 12 g.', slide: 33 }) },
      'acc-prec': { label: 'Confundiste exactitud con precisión', why: '**Exactitud**: qué tan cerca del valor verdadero (se mide con el error). **Precisión**: qué tan cerca están las réplicas entre sí (se mide con la desviación estándar). Se puede ser preciso y no exacto.',
        prereq: { title: 'Exactitud y precisión', mission: 'm2', block: 'm2b2' }, base: 'base.media' },
      'q-test': { label: 'Decidiste sobre un dato dudoso sin aplicar el test Q', why: 'Un dato lejano **no se elimina a ojo**. Calcula **Q = hueco / rango** y compáralo con el **Q tabulado** (n datos, % de confianza): si **Q > Qtab** se elimina; si no, se conserva.',
        prereq: { title: 'Dato dudoso: el test Q', mission: 'm2', block: 'm2b3' }, base: 'base.media' },
      'error-type': { label: 'Te equivocaste de tipo de error', why: '**Sistemático** (determinado): siempre hacia el mismo lado, tiene una causa (instrumento mal calibrado, método, operador); afecta la **exactitud**. **Aleatorio** (indeterminado): al azar, hacia ambos lados; afecta la **precisión**. **Grueso**: una equivocación grande y ocasional.',
        prereq: { title: 'Exactitud y precisión', mission: 'm2', block: 'm2b2' }, base: 'base.media' },
      'n-vs-n1': { label: 'Dividiste por n en vez de n − 1', why: 'La desviación estándar de una **muestra** (pocas réplicas) se calcula con **n − 1** en el denominador.',
        prereq: { title: 'Exactitud y precisión', mission: 'm2', block: 'm2b2' }, base: 'base.media' },
      'calib-invert': { label: 'Despejaste mal la recta de calibración', why: 'Si la recta es **y = m·x + b** (señal frente a concentración), la concentración de la muestra es **x = (y − b)/m**: divides la señal por la pendiente, no multiplicas.',
        prereq: { title: 'Medir: calibración', mission: 'm2', block: 'm2b1' }, base: 'base.unidades' }
    },
    goal: {
      total: 100, text: 'Asegurar los 35 puntos de conceptos, etapas y errores de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P1', label: 'Conceptos y etapas del análisis (humedad, interferentes)', points: 15, missions: ['m1'] },
        { id: 'P2', label: 'Calibración, exactitud, precisión y errores', points: 20, missions: ['m2'] }
      ],
      rest: [{ label: 'Volumetría: cálculos y alícuotas', points: 25, note: 'clase ana-02' }, { label: 'Volumetría ácido-base', points: 40, note: 'clase ana-03' }]
    },
    glossary: [
      { term: 'Analito', mission: 'm1', def: 'Componente de interés en una muestra: lo que se quiere identificar o cuantificar.', simple: 'Lo que buscas medir.', simpler: 'La aguja en el pajar.' },
      { term: 'Matriz', mission: 'm1', def: 'Todas las especies que acompañan al analito en la muestra.', simple: 'Todo lo demás que viene con el analito.', simpler: 'El pajar donde está la aguja.' },
      { term: 'Muestreo', mission: 'm1', def: 'Proceso para obtener una pequeña porción cuya composición represente fielmente a todo el material.', simple: 'Sacar un pedacito que represente al todo.', simpler: 'Probar una cucharada de sopa revuelta para saber cómo está toda la olla.' },
      { term: 'Disolución y disgregación', mission: 'm1', def: 'Disolución: solvente acuoso o ácido diluido bajo 100 °C. Disgregación: tratamiento más enérgico, ácidos concentrados sobre 120 °C (o fundentes).', simple: 'Disolver suave o "a la fuerza".', simpler: 'Disolver azúcar en agua tibia frente a quitar óxido con ácido caliente.' },
      { term: 'Exactitud', mission: 'm2', def: 'Cercanía de un resultado (o del promedio) al valor verdadero o aceptado; se expresa con el error absoluto o relativo.', simple: 'Qué tan cerca del valor real.', simpler: 'Darle al centro del blanco.' },
      { term: 'Precisión', mission: 'm2', def: 'Cercanía de las réplicas entre sí; se expresa con la desviación estándar, la varianza o el coeficiente de variación.', simple: 'Qué tan parecidas son tus repeticiones.', simpler: 'Que todos tus dardos caigan juntos, aunque no sea en el centro.' },
      { term: 'Test Q', mission: 'm2', def: 'Prueba estadística para decidir si un dato dudoso se elimina: Q = |dudoso − vecino| / (máx − mín); se elimina si Q es mayor que el Q tabulado para n datos y el nivel de confianza.', simple: 'Una regla para decidir si una medida rara se tira o se queda.', simpler: 'Como preguntar: ¿este dato está tan lejos de los demás que seguro fue un error?' },
      { term: 'Curva de calibración', mission: 'm2', def: 'Recta que relaciona la señal del instrumento con concentraciones conocidas (estándares); sirve para calcular la concentración de la muestra.', simple: 'Una regla hecha con muestras conocidas.', simpler: 'Como marcar una jarra con tazas conocidas para después medir a ojo.' }
    ],
    concepts: [
      { id: 'base.unidades', title: 'Unidades: %, ppm, mg/L', root: true },
      { id: 'base.media', title: 'Promedio y dispersión', root: true },
      { id: 'ana.conceptos', mission: 'm1', title: 'Analito, muestra, matriz y tipos de análisis', needs: ['base.unidades'] },
      { id: 'ana.etapas', mission: 'm1', title: 'Las 7 etapas del análisis', needs: ['ana.conceptos'] },
      { id: 'ana.humedad', mission: 'm1', title: 'Humedad y masa seca', needs: ['base.unidades'] },
      { id: 'ana.interferentes', mission: 'm1', title: 'Disolver y eliminar interferentes', needs: ['ana.etapas'] },
      { id: 'ana.calibracion', mission: 'm2', title: 'Calibración: de la señal a la concentración', needs: ['base.unidades'] },
      { id: 'ana.exactitud', mission: 'm2', title: 'Exactitud y error relativo', needs: ['base.media'] },
      { id: 'ana.precision', mission: 'm2', title: 'Precisión: s y CV', needs: ['base.media'] },
      { id: 'ana.errores', mission: 'm2', title: 'Errores sistemáticos, aleatorios y gruesos', needs: ['ana.exactitud', 'ana.precision'] },
      { id: 'ana.dixon', mission: 'm2', title: 'Dato dudoso: test Q', needs: ['ana.precision'] },
      { id: 'ana.comparar', mission: 'm2', title: 'Comparar laboratorios y métodos', needs: ['ana.exactitud', 'ana.precision'] }
    ],
    curiosities: [
      { text: 'Las misiones Spirit y Opportunity llevaron a Marte un espectrómetro Mössbauer miniaturizado (MiMOS) para estudiar los minerales del suelo: química analítica a 225 millones de km.', slide: 14 },
      { text: 'En Girona descubrieron que tres tablas atribuidas a Pere Mates (1490–1558) eran falsas: tenían blanco de titanio, un pigmento que se usa desde 1921.', slide: 21 },
      { text: 'Al medir gases en sangre, un torniquete mal puesto o apretar la mano cambia el oxígeno de la muestra: por eso el muestreo clínico tiene protocolos estrictos.', slide: 31 }
    ],
    slideImages: {},
    slides: {
      5: { title: '¿Qué es el análisis químico?', bullets: ['¿Qué es? (identidad) · ¿Cuánto hay? (cantidad)', 'Analito, muestra y matriz', 'Cualitativo y cuantitativo'] },
      8: { title: 'Tipos de análisis cuantitativo', bullets: ['Volumétricos: volumen de reactivo equivalente', 'Gravimétricos: masa', 'Ópticos: interacción con la radiación', 'Electroanalíticos: magnitudes eléctricas', 'Clásico frente a instrumental'] },
      14: { title: 'Importancia de la química analítica', bullets: ['MiMOS en Marte', 'Robot de la NASA 2020'] },
      21: { title: 'Estudios de casos', bullets: ['Cuadros falsos: FTIR y Raman buscan anacronismos', 'Blanco de titanio (desde 1921) en una obra "renacentista"'] },
      26: { title: 'Etapas del análisis cuantitativo', bullets: ['1 Selección del método · 2 Obtención de la muestra · 3 Preparación y eliminación de interferentes', '4 Medición · 5 Cálculos · 6 Confiabilidad · 7 Interpretación y entrega'] },
      31: { title: 'Selección del método y muestreo', bullets: ['Exactitud, tiempo, costo, número de muestras, complejidad, normativa', 'Muestreo representativo (ej.: gases en sangre)'] },
      33: { title: 'Preparación: humedad y masa seca', bullets: ['%h = (m_M − m_Ms105°)/m_Ms105° × 100', 'Fh = (100 + %h)/100', 'Masa a pesar = masa seca × Fh (ej.: 5 g × 1,15 = 5,75 g)'] },
      38: { title: 'Disolución y disgregación', bullets: ['Agua, ácidos diluidos o concentrados, mezclas (agua regia), fundentes', 'Disolución < 100 °C; disgregación: ácidos concentrados > 120 °C'] },
      47: { title: 'Eliminación de interferentes', bullets: ['Agentes enmascarantes', 'Separaciones: precipitación y filtración, destilación, extracción con solventes, intercambio iónico'] },
      49: { title: 'Medición: calibración', bullets: ['Estándares: 0, 10, 30, 50, 70 mg/L', 'A = εbC; recta y = 0,0067x (R² = 0,998)', 'Fuera del rango lineal (100 mg/L) ya no sirve'] },
      56: { title: 'Confiabilidad: exactitud y precisión', bullets: ['Fe(III): estándar 20,00 ppm, promedio 19,78 ppm', 'Pb en sangre: 0,752; 0,756; 0,752; 0,751; 0,760 ppm', 'Error absoluto y relativo; s, varianza y CV'] },
      57: { title: 'Entrega de resultados: el informe', bullets: ['Resumen, introducción, objetivos, métodos, resultados, discusión, conclusiones, bibliografía'] },
      66: { title: 'Errores en el análisis químico (Skoog, cap. 5)', bullets: ['Sistemáticos (determinados): instrumentales, de método y personales', 'Aleatorios (indeterminados)', 'Gruesos'] },
      83: { title: 'Eliminación de datos dudosos: test Q', bullets: ['1) Ordenar los datos', '2) Q experimental = |dudoso − vecino| / (máx − mín)', '3) Comparar con Q tabulado (n, confianza)', '4) Si Q experimental > Q tabulado: se elimina'] },
      86: { title: 'Ejemplo resuelto: ¿es rechazable el 6,0?', bullets: ['Datos: 5,0; 5,2; 5,5; 5,6; 6,0 (sulfato en agua de riego)', 'Q = (6,0 − 5,6)/(6,0 − 5,0) = 0,40', 'Qtab (n = 5, 90 %) = 0,64: 0,40 < 0,64, no es rechazable'] }
    },
    missions: [
      {
        id: 'm1', title: '¿Qué es? ¿Cuánto hay?', subtitle: 'Conceptos, etapas, humedad e interferentes', minutes: 25, slides: '5–47', pep: 'P1: conceptos y etapas',
        stages: {
          hook: { title: 'El cuadro con un pigmento del futuro', sage: 'Un museo compró tres tablas "del 1500". El análisis encontró blanco de titanio, que existe desde 1921. Fin del misterio. Eso es química analítica: responder "¿qué es?" y "¿cuánto hay?" con evidencia.',
            text: 'Todo análisis sigue las mismas etapas, desde elegir el método hasta entregar el informe. En la PEP te pueden pedir ordenarlas, reconocer conceptos (analito, matriz) y calcular la masa seca con el factor de humedad.' },
          diagnostic: [
            q('m1-d1', 'En un análisis de plomo en sangre, ¿qué es la matriz?', [{ text: 'Todo lo demás que acompaña al plomo en la sangre', correct: true }, { text: 'El plomo, que es lo que se quiere medir', misconception: 'analyte-matrix' }, { text: 'El tubo donde se guarda la muestra', note: 'La matriz es parte de la muestra.' }],
              { concept: 'ana.conceptos', explain: 'El plomo es el analito; la sangre es la muestra; lo que acompaña al plomo es la matriz.', slide: 5 }),
            q('m1-d2', 'Fh = 1,15. Para tener 5 g de masa seca, ¿cuánto pesas?', [{ text: '5,75 g', correct: true }, { text: '4,35 g', misconception: 'humidity-direction' }, { text: '5,00 g', note: 'La muestra húmeda pesa más que la seca.' }],
              { concept: 'ana.humedad', explain: '5 × 1,15 = 5,75 g (ejemplo de la clase).', slide: 33 })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.unidades', title: 'Desde cero: porcentajes y ppm', slide: 33, body: '**%** = partes por cien (g por 100 g). **ppm** = partes por millón: en agua, **1 ppm ≈ 1 mg/L**. Un porcentaje de humedad de 15 % significa 15 g de agua por cada 100 g de muestra seca (según cómo se defina la base).',
              deeper: 'Pasar de % a fracción: divide por 100 (15 % → 0,15). Pasar de ppm a mg/L (soluciones acuosas diluidas): es el mismo número. 0,750 ppm de Pb ≈ 0,750 mg de Pb por litro.' }
          ],
          explain: [],
          transfer: [
            num('m1-t1', 'Estilo PEP: una muestra de 2,500 g pesa 2,180 g después de secarla a 105 °C. Calcula el factor de humedad Fh (con %h = (m_M − m_seca)/m_seca × 100).', 1.147, '',
              { concept: 'ana.humedad', label: 'Fh', slide: 33, tol: 0.005, traps: [{ value: 14.68, note: 'Ese es el %h: falta Fh = (100 + %h)/100.' }, { value: 1.128, note: 'Dividiste por la masa húmeda: la fórmula de la clase divide por la masa seca.' }],
                solution: ['%h = (2,500 − 2,180)/2,180 × 100 = 14,68 %', 'Fh = (100 + 14,68)/100 = 1,147'], explain: 'Fh ≈ 1,147.' }),
            order('m1-t2', 'Estilo PEP: ordena las etapas del análisis químico cuantitativo.', [['a', 'Selección del método'], ['b', 'Obtención de la muestra (muestreo)'], ['c', 'Preparación y eliminación de interferentes'], ['d', 'Medición del analito'], ['e', 'Cálculo de resultados'], ['f', 'Análisis de la confiabilidad'], ['g', 'Interpretación y entrega del informe']], ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
              { concept: 'ana.etapas', direction: 'De la primera a la última.', explain: 'Las 7 etapas de la clase.', slide: 26 }),
            write('m1-w1', 'Enséñale a tu compañero: ¿por qué el muestreo puede arruinar un análisis aunque el instrumento sea perfecto?', 'Porque el resultado describe solo a la muestra que se midió. Si la muestra no es representativa de todo el material (o cambia entre la toma y el análisis, como los gases en sangre), el valor medido será preciso pero no dirá la verdad sobre el material. Por eso el muestreo y la conservación siguen protocolos estrictos.',
              ['El resultado solo describe a la muestra medida', 'La muestra debe ser representativa del material completo', 'Debe conservarse sin cambios hasta el análisis (ej.: gases en sangre)'],
              { concept: 'ana.etapas', explain: 'Muestreo representativo.', slide: 31, teach: true, keywords: [{ label: 'representativa', any: ['represent'] }, { label: 'conservar / integridad', any: ['conserv', 'integr', 'cambi'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **conceptos y tipos de análisis**.',
            pretest: q('m1-pre1', 'Adivina antes: medir cuántos mg de paracetamol tiene una tableta es un análisis…', [{ text: 'Cuantitativo, porque responde «¿cuánto hay?»', correct: true }, { text: 'Cualitativo, porque identifica el compuesto', misconception: 'quali-quanti' }, { text: 'Ni cualitativo ni cuantitativo: es un control de calidad', note: 'Responde "¿cuánto hay?".' }],
              { concept: 'ana.conceptos', explain: '¿Cuánto hay? → cuantitativo.', slide: 5 }),
            explain: [
              { id: 'm1b1', concept: 'ana.conceptos', title: '¿Qué es? ¿Cuánto hay?', slide: 8, body: 'El análisis químico responde **¿qué es?** (**cualitativo**, identidad) o **¿cuánto hay?** (**cuantitativo**, cantidad) del **analito** en una **muestra**; todo lo demás es la **matriz**. Métodos cuantitativos: **volumétricos** (volumen de reactivo que reacciona equivalente a equivalente), **gravimétricos** (masa), **ópticos** (radiación) y **electroanalíticos** (magnitudes eléctricas). Volumetría y gravimetría son **clásicos**; ópticos y electroanalíticos, **instrumentales**.',
                deeper: 'Ejemplo: Pb en sangre. Analito = Pb; muestra = la sangre extraída; matriz = proteínas, glóbulos, sales. Si lo mides con un espectrómetro (luz), es óptico e instrumental. Si titulas con EDTA, es volumétrico y clásico.' }
            ],
            practice: [
              classify('m1-p1', '¿Qué tipo de método cuantitativo es?', [['vol', 'Volumétrico'], ['grav', 'Gravimétrico'], ['opt', 'Óptico'], ['elec', 'Electroanalítico']],
                [['a', 'Titular ácido acético con NaOH', 'vol'], ['b', 'Precipitar y pesar BaSO₄', 'grav'], ['c', 'Medir la absorbancia de una solución', 'opt'], ['d', 'Medir el pH con un electrodo', 'elec']],
                { concept: 'ana.conceptos', explain: 'Volumen, masa, luz o electricidad.', slide: 8, hint: '¿Qué magnitud se mide?' }),
              match('m1-p2', 'Para el análisis de plomo en sangre, une cada término:', [['Analito', 'El plomo'], ['Muestra', 'La sangre extraída'], ['Matriz', 'Proteínas, células y sales de la sangre']],
                { concept: 'ana.conceptos', explain: 'Analito, muestra, matriz.', slide: 5, hint: 'La matriz acompaña al analito.', misconception: 'analyte-matrix' }),
              q('m1-p3', 'Detectar si un cuadro tiene blanco de titanio (sin medir cuánto) es…', [{ text: 'Cualitativo e instrumental (FTIR o Raman)', correct: true }, { text: 'Cuantitativo y clásico (volumetría o gravimetría)', misconception: 'quali-quanti' }, { text: 'Gravimétrico, pesando el pigmento', note: 'No se pesa nada.' }],
                { concept: 'ana.conceptos', explain: '¿Qué es? con un instrumento.', slide: 10, hint: '¿Pregunta qué es o cuánto hay?' })
            ],
            rule: { title: 'Regla del sabio: leer un análisis', concept: 'ana.conceptos', steps: ['¿Qué es? → cualitativo; ¿cuánto hay? → cuantitativo', 'Analito = lo buscado; matriz = lo que lo acompaña', 'Volumen o masa → clásico; luz o electricidad → instrumental'] } },
          { id: 'r2', intro: 'Parte 2: **etapas, humedad e interferentes**.',
            pretest: q('m1-pre2', 'Adivina antes: si una muestra tiene humedad, para pesar "5 g secos" pesas…', [{ text: 'Más de 5 g', correct: true }, { text: 'Menos de 5 g', misconception: 'humidity-direction' }, { text: 'Exactamente 5 g', note: 'El agua también pesa.' }],
              { concept: 'ana.humedad', explain: 'Hay que compensar el agua.', slide: 33 }),
            explain: [
              { id: 'm1b2', concept: 'ana.humedad', title: 'Preparar la muestra: humedad, disolución e interferentes', slide: 33, body: '**Humedad**: %h = (m_M − m_seca)/m_seca × 100; **Fh = (100 + %h)/100**; masa de muestra a pesar = **masa seca × Fh**. **Disolución** (agua o ácidos diluidos, bajo 100 °C) frente a **disgregación** (ácidos concentrados sobre 120 °C, mezclas como agua regia, o sales fundentes). **Interferentes**: se eliminan con **agentes enmascarantes** o con **separaciones** (precipitación y filtración, destilación, extracción con solventes, intercambio iónico).',
                deeper: 'Ejemplo de la clase: Fh = 1,15 y quieres 5 g secos → pesas 5 × 1,15 = 5,75 g. Al revés: si pesaste 5,75 g húmedos, tienes 5,75/1,15 = 5 g secos. Fh siempre es mayor que 1.' }
            ],
            practice: [
              num('m1-p4', 'Fh = 1,08. ¿Cuántos gramos de muestra húmeda debes pesar para tener el equivalente a 2,500 g de masa seca?', 2.700, 'g',
                { concept: 'ana.humedad', label: 'masa', slide: 33, hint: 'masa a pesar = masa seca × Fh.', traps: [{ value: 2.315, note: 'Dividiste: usa masa seca × Fh.', misconception: 'humidity-direction' }], solution: ['m = 2,500 × 1,08 = 2,700 g'], explain: '2,700 g.' }),
              classify('m1-p5', '¿Disolución o disgregación?', [['dis', 'Disolución'], ['disg', 'Disgregación']],
                [['a', 'Sal en agua a temperatura ambiente', 'dis'], ['b', 'Aleación con agua regia caliente', 'disg'], ['c', 'Óxido con HCl diluido bajo 100 °C', 'dis'], ['d', 'Mineral fundido con una sal fundente', 'disg']],
                { concept: 'ana.interferentes', explain: 'Ácidos concentrados, altas temperaturas o fundentes = disgregación.', slide: 38, hint: '¿Suave o enérgico?' }),
              spot('m1-fx1', 'Un aprendiz quiso pesar el equivalente a 5 g secos (Fh = 1,15). ¿Dónde se equivocó?', ['Fh = (100 + %h)/100 = 1,15', 'Masa a pesar = 5 / 1,15', 'Pesa 4,35 g de muestra'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'Masa a pesar = 5 × 1,15 = 5,75 g', correct: true }, { text: 'Masa a pesar = 5 + 1,15', note: 'Fh es un factor: multiplica.' }] },
                { concept: 'ana.humedad', slide: 33, stepNotes: { 0: 'Correcto.', 2: 'Viene del error anterior.' }, explain: 'La muestra húmeda pesa más.', hint: '¿Más o menos que 5 g?', misconception: 'humidity-direction' })
            ],
            rule: { title: 'Regla del sabio: preparar la muestra', concept: 'ana.etapas', steps: ['Fh = (100 + %h)/100; masa a pesar = masa seca × Fh', 'Disolución suave (< 100 °C) o disgregación enérgica (> 120 °C)', 'Interferentes: enmascarar o separar'] } }
        ]
      },
      {
        id: 'm2', title: '¿Cuánto confiar?', subtitle: 'Calibración, exactitud, precisión y errores', minutes: 25, slides: '49–57, 66, 83–88', pep: 'P2: calibración y estadística',
        stages: {
          hook: { title: 'Seis medidas de hierro', sage: 'Un laboratorio midió seis veces un estándar de 20,00 ppm de Fe(III) y obtuvo un promedio de 19,78 ppm. ¿Está bien? Depende de cuán exacto y cuán preciso necesites ser.',
            text: '"Los datos de calidad desconocida carecen de valor": todo resultado va con su error. En la PEP te pedirán despejar una concentración de una recta de calibración y calcular error relativo, desviación estándar y coeficiente de variación.' },
          diagnostic: [
            q('m2-d1', 'Cuatro réplicas: 10,08; 10,11; 10,09; 10,10 (valor real 10,00). Los resultados son…', [{ text: 'Precisos pero poco exactos', correct: true }, { text: 'Exactos pero poco precisos', misconception: 'acc-prec' }, { text: 'Exactos y precisos', note: 'Están todos corridos del valor real.' }],
              { concept: 'ana.exactitud', explain: 'Muy juntos entre sí (precisos), pero lejos de 10,00 (poco exactos).', slide: 56 }),
            q('m2-d2', 'Una balanza mal calibrada que siempre marca 0,5 mg de más produce un error…', [{ text: 'Sistemático', correct: true }, { text: 'Aleatorio', misconception: 'error-type' }, { text: 'Grueso', note: 'Grueso es una equivocación grande y ocasional.' }],
              { concept: 'ana.errores', explain: 'Siempre hacia el mismo lado y con causa: sistemático (instrumental).', slide: 66, source: BOOK })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.media', title: 'Desde cero: promedio y dispersión', slide: 56, body: 'El **promedio** (x̄) es la suma de las réplicas dividida por cuántas son (n). La **dispersión** dice cuánto se alejan las réplicas del promedio: la **desviación estándar** s = √[Σ(xᵢ − x̄)²/(n − 1)]. El **CV** = s/x̄ × 100 la expresa en %.',
              deeper: 'Con 0,752; 0,756; 0,752; 0,751; 0,760 ppm: x̄ = 0,7542 ppm; s = 0,0038 ppm; CV = 0,50 %. Se usa n − 1 porque con pocas réplicas el promedio ya "gastó" un dato.' }
          ],
          explain: [],
          transfer: [
            num('m2-t1', 'Estilo PEP (clase): Pb en sangre: 0,752; 0,756; 0,752; 0,751 y 0,760 ppm. Calcula la desviación estándar.', 0.00377, 'ppm',
              { concept: 'ana.precision', label: 's', slide: 56, tol: 0.03, traps: [{ value: 0.00337, note: 'Dividiste por n (5); con réplicas se usa n − 1 (4).', misconception: 'n-vs-n1' }, { value: 1.42e-5, note: 'Esa es la varianza: falta la raíz.' }],
                solution: ['x̄ = 3,771/5 = 0,7542 ppm', 'Σ(xᵢ − x̄)² = 5,68 × 10⁻⁵', 's = √(5,68 × 10⁻⁵ / 4) = 0,0038 ppm (CV ≈ 0,50 %)'], explain: 's ≈ 0,0038 ppm.' }),
            num('m2-t2', 'Estilo PEP: con la recta de calibración A = 0,0067·C (C en mg/L), una muestra da A = 0,300. ¿Cuál es su concentración?', 44.8, 'mg/L',
              { concept: 'ana.calibracion', label: 'C', slide: 49, tol: 0.01, traps: [{ value: 0.00201, note: 'Multiplicaste: C = A / pendiente.', misconception: 'calib-invert' }],
                solution: ['C = A / m = 0,300 / 0,0067', 'C = 44,8 mg/L (dentro del rango lineal de 0 a 70 mg/L)'], explain: '44,8 mg/L.' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿qué diferencia hay entre exactitud y precisión, y qué tipo de error afecta a cada una?', 'La exactitud es qué tan cerca está el resultado del valor verdadero y se pierde con los errores sistemáticos, que corren todos los resultados hacia el mismo lado. La precisión es qué tan parecidas son las réplicas entre sí y se pierde con los errores aleatorios, que las dispersan hacia ambos lados. Se puede ser muy preciso y poco exacto si hay un error sistemático.',
              ['Exactitud: cercanía al valor verdadero (error absoluto o relativo)', 'Precisión: cercanía entre réplicas (s, CV)', 'Sistemático afecta la exactitud; aleatorio, la precisión'],
              { concept: 'ana.errores', explain: 'Dos ideas distintas.', slide: 56, teach: true, keywords: [{ label: 'valor verdadero', any: ['verdader', 'real', 'aceptado'] }, { label: 'réplicas', any: ['réplica', 'replica', 'repeti'] }, { label: 'sistemático / aleatorio', any: ['sistem', 'aleator'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **calibración: de la señal a la concentración**.',
            pretest: q('m2-pre1', 'Adivina antes: si la absorbancia es proporcional a la concentración, ¿qué pasa con una muestra que da el doble de absorbancia?', [{ text: 'Tiene el doble de concentración, si está en el rango lineal', correct: true }, { text: 'Tiene la mitad de concentración que el estándar', misconception: 'calib-invert' }, { text: 'No se puede saber sin medir un blanco antes', note: 'Si es lineal, sí.' }],
              { concept: 'ana.calibracion', explain: 'A = k·C.', slide: 49 }),
            explain: [
              { id: 'm2b1', concept: 'ana.calibracion', title: 'Medir: calibración', slide: 49, body: 'Se preparan **estándares** de concentración conocida, se mide su **señal** y se ajusta una recta **y = m·x + b** (A = εbC en espectroscopía). La concentración de la muestra se despeja: **x = (y − b)/m**. Solo vale dentro del **rango lineal**: en la clase, sobre 70 mg/L la curva se aplana (a 100 mg/L A = 0,500, no 0,670).',
                deeper: 'Ejemplo de la clase: y = 0,0067x (b ≈ 0, R² = 0,998). Una muestra con A = 0,300 tiene 0,300/0,0067 = 44,8 mg/L. Si la muestra se diluyó antes de medir, multiplica por el factor de dilución al final.' }
            ],
            practice: [
              num('m2-p1', 'Con A = 0,0067·C (mg/L), una muestra da A = 0,180. Calcula C.', 26.9, 'mg/L',
                { concept: 'ana.calibracion', label: 'C', slide: 49, hint: 'C = A / 0,0067.', traps: [{ value: 0.001206, note: 'Divide la señal por la pendiente.', misconception: 'calib-invert' }], solution: ['C = 0,180 / 0,0067 = 26,9 mg/L'], explain: '26,9 mg/L.' }),
              q('m2-p2', 'Una muestra da una señal mayor que la del estándar más concentrado (fuera del rango lineal). ¿Qué haces?', [{ text: 'La diluyo, la mido de nuevo y multiplico por el factor de dilución', correct: true }, { text: 'Extrapolo la recta de calibración más allá del último estándar', note: 'Fuera del rango lineal la recta ya no vale.' }, { text: 'Informo el valor máximo del rango como resultado', note: 'Eso no es la concentración real.' }],
                { concept: 'ana.calibracion', explain: 'Siempre dentro del rango calibrado.', slide: 49, hint: '¿La recta vale fuera de los estándares?' }),
              order('m2-p3', 'Ordena los pasos de una calibración:', [['a', 'Preparar estándares de concentración conocida'], ['b', 'Medir la señal de cada estándar'], ['c', 'Ajustar la recta y = m·x + b'], ['d', 'Medir la muestra y despejar x = (y − b)/m']], ['a', 'b', 'c', 'd'],
                { concept: 'ana.calibracion', direction: 'Primero lo primero.', explain: 'Estándares, señales, recta, muestra.', slide: 49, hint: 'La muestra va al final.' })
            ],
            rule: { title: 'Regla del sabio: calibración', concept: 'ana.calibracion', steps: ['Estándares conocidos → recta y = m·x + b', 'Muestra: x = (y − b)/m', 'Solo dentro del rango lineal; si diluiste, multiplica por el factor'] } },
          { id: 'r2', intro: 'Parte 2: **exactitud, precisión y errores**.',
            pretest: q('m2-pre2', 'Adivina antes: un estándar de 20,00 ppm da un promedio de 19,78 ppm. El error relativo es…', [{ text: '−1,1 %', correct: true }, { text: '+1,1 %', note: 'Medido menos verdadero: el resultado quedó bajo.' }, { text: '−0,22 %', note: '−0,22 es el error absoluto (en ppm).' }],
              { concept: 'ana.exactitud', explain: 'Er = (19,78 − 20,00)/20,00 × 100 = −1,1 %.', slide: 56 }),
            explain: [
              { id: 'm2b2', concept: 'ana.exactitud', title: 'Exactitud y precisión', slide: 56, body: '**Exactitud**: error absoluto **E = x̄ − x_verdadero**; error relativo **Er = E/x_verdadero × 100**. **Precisión**: desviación estándar **s** (con n − 1), varianza **s²** y **CV = s/x̄ × 100**. **Errores** (Skoog): **sistemáticos** (instrumentales, de método o personales; siempre hacia el mismo lado → exactitud), **aleatorios** (ambos lados → precisión) y **gruesos** (equivocaciones grandes y ocasionales).',
                deeper: 'Hierro de la clase: E = 19,78 − 20,00 = −0,22 ppm; Er = −1,1 %. Plomo: s = 0,0038 ppm y CV = 0,50 %: muy preciso. Sin un valor verdadero (estándar o material de referencia) no puedes calcular la exactitud, solo la precisión.' }
            ],
            practice: [
              num('m2-p4', 'Réplicas: 10,08; 10,11; 10,09; 10,10; 10,12. Valor verdadero: 10,00. Calcula el error relativo del promedio (%).', 1.0, '%',
                { concept: 'ana.exactitud', label: 'Er', slide: 56, tol: 0.03, hint: 'x̄ = 10,10. Er = (x̄ − 10,00)/10,00 × 100.', traps: [{ value: 0.1, note: 'Ese es el error absoluto (en las unidades del dato).' }, { value: -1.0, note: 'El promedio quedó sobre el verdadero: es positivo.' }],
                  solution: ['x̄ = 50,50/5 = 10,10', 'E = 10,10 − 10,00 = 0,10', 'Er = 0,10/10,00 × 100 = 1,0 %'], explain: 'Er = +1,0 %.' }),
              classify('m2-p5', 'Clasifica cada error:', [['sis', 'Sistemático'], ['ale', 'Aleatorio'], ['gru', 'Grueso']],
                [['a', 'Pipeta mal calibrada que siempre entrega de menos', 'sis'], ['b', 'Pequeñas fluctuaciones al leer la bureta', 'ale'], ['c', 'Anotar 25,3 en vez de 52,3', 'gru'], ['d', 'Indicador que cambia de color antes del punto de equivalencia', 'sis']],
                { concept: 'ana.errores', explain: 'Con causa y dirección fija: sistemático. Al azar: aleatorio. Equivocación grande: grueso.', slide: 66, source: BOOK, hint: '¿Siempre hacia el mismo lado?', misconception: 'error-type' }),
              match('m2-p6', 'Une cada medida con lo que evalúa:', [['Error relativo', 'Exactitud'], ['Desviación estándar', 'Precisión'], ['Coeficiente de variación', 'Precisión relativa (en %)']],
                { concept: 'ana.precision', explain: 'Error → exactitud; dispersión → precisión.', slide: 56, hint: '¿Compara con el valor verdadero o entre réplicas?', misconception: 'acc-prec' })
            ],
            rule: { title: 'Regla del sabio: confiar en un resultado', concept: 'ana.errores', steps: ['Exactitud: Er = (x̄ − verdadero)/verdadero × 100', 'Precisión: s (con n − 1) y CV = s/x̄ × 100', 'Sistemático → exactitud; aleatorio → precisión; grueso → descartar y repetir'] } },
          { id: 'r3', intro: 'Parte 3: **datos dudosos (test Q) y elegir al mejor**.',
            pretest: q('m2-pre3', 'Adivina antes: de 5 réplicas, una queda lejos de las otras. ¿La eliminas?', [{ text: 'Solo si un test estadístico (Q) lo justifica', correct: true }, { text: 'Sí, de inmediato: un dato lejano es un error', note: 'Puede ser variación normal: hay que probarlo.', misconception: 'q-test' }, { text: 'No, un dato medido jamás se puede eliminar', note: 'Si es un error grueso, se descarta y se repite.' }],
              { concept: 'ana.dixon', explain: 'Se decide con el test Q, no a ojo.', slide: 83 }),
            explain: [
              { id: 'm2b3', concept: 'ana.dixon', title: 'Dato dudoso: el test Q', slide: 83, body: 'Un **dato dudoso** es una réplica muy alejada del resto. No se elimina a ojo: se usa el **test Q**. **1)** Ordena los datos. **2)** Calcula **Q = |dudoso − vecino| / (máx − mín)**. **3)** Busca el **Q tabulado** para n datos y tu confianza. **4)** Si **Q > Qtab** el dato se **elimina**; si no, se **conserva**. Qtab al 95 %: n = 3: 0,970 · 4: 0,829 · 5: 0,710 · 6: 0,625 · 7: 0,568 · 8: 0,526 · 9: 0,493 · 10: 0,466. Al 90 %: n = 3: 0,941 · 4: 0,765 · 5: 0,642 · 6: 0,560 · 7: 0,507 · 8: 0,468 · 9: 0,437 · 10: 0,412.',
                deeper: 'Clase (sulfato, 90 %): 5,0; 5,2; 5,5; 5,6; 6,0 → Q = (6,0 − 5,6)/(6,0 − 5,0) = 0,40 < 0,642: el 6,0 se conserva (promedio 5,46). Guía (Ca en suero, 95 %): 3,15; 3,16; 3,50 meq/L → Q = 0,34/0,35 = 0,971 > 0,970: se elimina 3,50; el promedio es 3,155 meq/L = 63,2 mg/L = 6,32 mg/dL (1 meq de Ca = 20,04 mg).' },
              { id: 'm2b4', concept: 'ana.comparar', title: 'Elegir al mejor: exactitud y precisión juntas', slide: 56, body: 'Para comparar laboratorios o métodos mira **las dos cosas**: **exactitud** (error relativo Er, con signo, frente al valor verdadero) y **precisión** (s y CV). El mejor tiene **|Er| pequeño y CV pequeño**. Réplicas muy juntas pero lejos del valor verdadero = **error sistemático** (preciso, no exacto). Promedio correcto pero réplicas dispersas = **error aleatorio** (exacto, no preciso). Antes de comparar, revisa si hay datos dudosos con el test Q.',
                deeper: 'Guía (valor verdadero 42,6 pg/L de Cr): Lab 1: x̄ = 37,6 (Er = −11,7 %, CV = 2,4 %). Lab 2: x̄ = 42,35 (Er = −0,6 %, CV = 2,8 %). Lab 3: x̄ = 50,2 (Er = +17,8 %) con un dato de 40,5 que el test Q elimina (Q = 0,95 > 0,625); sin él queda muy preciso pero inexacto. El mejor es el Laboratorio 2.' }
            ],
            practice: [
              num('m2-p7', 'Clase: sulfato en agua de riego: 5,0; 5,2; 5,5; 5,6; 6,0 mg/L. Calcula Q experimental del 6,0.', 0.4, '',
                { concept: 'ana.dixon', label: 'Q', slide: 86, tol: 0.02, hint: 'Q = (6,0 − 5,6)/(6,0 − 5,0).', solution: ['Ordenados: 5,0; 5,2; 5,5; 5,6; 6,0', 'Q = |6,0 − 5,6| / (6,0 − 5,0) = 0,40'], explain: 'Q = 0,40.' }),
              q('m2-p8', 'Con Q = 0,40 y Qtab = 0,642 (n = 5, 90 %), el dato 6,0…', [{ text: 'Se conserva', correct: true }, { text: 'Se elimina', note: 'Solo se elimina si Q > Qtab.', misconception: 'q-test' }, { text: 'Se promedia con menos peso', note: 'El test Q no hace eso: elimina o conserva.' }],
                { concept: 'ana.dixon', explain: '0,40 < 0,642: se conserva.', slide: 86, hint: '¿Q es mayor que Qtab?' }),
              num('m2-p9', 'Guía: calcio en suero: 3,15; 3,16 y 3,50 meq/L. Calcula Q experimental del 3,50.', 0.971, '',
                { concept: 'ana.dixon', label: 'Q', slide: 83, tol: 0.003, hint: 'Hueco = 3,50 − 3,16; rango = 3,50 − 3,15.', solution: ['Q = |3,50 − 3,16| / (3,50 − 3,15)', 'Q = 0,34 / 0,35 = 0,971'], explain: 'Q = 0,971 > Qtab(n = 3, 95 %) = 0,970: se elimina.' }),
              num('m2-p10', 'Con el dato anómalo eliminado (3,15 y 3,16 meq/L), calcula el promedio en mg de Ca/dL (Ca²⁺: 1 meq = 20,04 mg).', 6.32, 'mg/dL',
                { concept: 'ana.dixon', label: 'C', slide: 86, tol: 0.005, hint: 'Promedio en meq/L → × 20,04 mg/meq → ÷ 10 para pasar de L a dL.', traps: [{ value: 3.155, note: 'Esos son meq/L: falta pasar a mg/dL.' }, { value: 63.2, note: 'Eso son mg/L: falta pasar a dL (÷ 10).' }], solution: ['x̄ = (3,15 + 3,16)/2 = 3,155 meq/L', '3,155 × 20,04 = 63,2 mg/L = 6,32 mg/dL'], explain: '6,32 mg Ca/dL.' }),
              order('m2-p12', 'Ordena los pasos del test Q:', [['a', 'Ordenar los datos'], ['b', 'Calcular Q experimental = hueco / rango'], ['c', 'Buscar Q tabulado (n datos y confianza)'], ['d', 'Si Q > Qtab, eliminar el dato dudoso']], ['a', 'b', 'c', 'd'],
                { concept: 'ana.dixon', direction: 'Primero lo primero.', explain: 'Ordenar, calcular Q, buscar Qtab y decidir.', slide: 83, hint: 'La decisión va al final.' }),
              q('m2-p11','Valor verdadero 42,6 pg/L. Lab 1: x̄ = 37,6 (s = 0,91). Lab 2: x̄ = 42,35 (s = 1,20). Lab 3: x̄ = 50,2 (s = 4,74). ¿Cuál eliges?', [{ text: 'Laboratorio 2: promedio casi igual al verdadero y réplicas razonablemente juntas', correct: true }, { text: 'Laboratorio 1: es el más preciso, con la menor dispersión de los tres', note: 'Es algo más preciso, pero su promedio queda 12 % bajo el verdadero: inexacto.', misconception: 'acc-prec' }, { text: 'Laboratorio 3: tiene el promedio más alto de los tres laboratorios', note: 'Más alto no es mejor: se aleja 18 % del valor verdadero y tiene la mayor dispersión.', misconception: 'acc-prec' }],
                { concept: 'ana.comparar', explain: 'Er = −0,6 % y CV = 2,8 %: exacto y preciso a la vez.', slide: 56, hint: 'Compara |Er| y CV de los tres.' })
            ],
            rule: { title: 'Regla del sabio: dato dudoso y elección', concept: 'ana.dixon', steps: ['Ordena y calcula Q = hueco / rango', 'Q > Qtab (n, confianza) → elimina; si no, conserva', 'Para elegir: |Er| pequeño y CV pequeño, las dos a la vez'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.unidades', title: 'Unidades de concentración', subtitle: '%, ppm y mg/L', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.unidades', title: '%, ppm y mg/L', slide: 33, body: '**% (m/m)** = g de analito por 100 g de muestra. **ppm** = mg por kg (o mg/L en agua diluida). **ppb** = µg/L. Para pasar entre ellas: 1 % = 10 000 ppm.',
            deeper: '0,5 % de NaCl = 5000 ppm = 5 g/L (en agua). Un análisis de trazas (Pb en sangre) se informa en ppm o ppb porque los números en % serían diminutos.' }],
          practice: [
            num('z1-p1', '¿A cuántos ppm equivale 0,25 %?', 2500, 'ppm', { concept: 'base.unidades', label: 'ppm', slide: 33, tol: 0.001, hint: '1 % = 10 000 ppm.', traps: [{ value: 25, note: 'Multiplica por 10 000, no por 100.' }], solution: ['0,25 × 10 000 = 2500 ppm'], explain: '2500 ppm.' }),
            q('z1-p2', 'En agua, 3 ppm de Fe equivalen a…', [{ text: '3 mg/L', correct: true }, { text: '3 g/L', note: 'Eso serían 3000 ppm.' }, { text: '0,3 mg/L', note: 'ppm ≈ mg/L en agua.' }], { concept: 'base.unidades', explain: '1 ppm ≈ 1 mg/L.', slide: 33, hint: 'Partes por millón.' })
          ],
          transfer: [write('z1-w1', 'Explica qué significa que el agua potable tenga 0,3 ppm de hierro.', 'Significa que hay 0,3 partes de hierro por cada millón de partes de agua; en agua, eso equivale a 0,3 mg de hierro por cada litro.',
            ['ppm = partes por millón', 'En agua, 1 ppm ≈ 1 mg/L', '0,3 ppm = 0,3 mg de Fe por litro'],
            { concept: 'base.unidades', explain: 'ppm ≈ mg/L.', slide: 33, keywords: [{ label: 'millón', any: ['millón', 'millon'] }, { label: 'mg/L', any: ['mg/l', 'mg por litro', 'miligramo'] }] })]
        } },
      { id: 'z2', concept: 'base.media', title: 'Promedio y dispersión', subtitle: 'x̄, s y CV', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.media', title: 'Promedio, s y CV', slide: 56, body: '**x̄** = Σxᵢ/n. **s** = √[Σ(xᵢ − x̄)²/(n − 1)]. **CV** = s/x̄ × 100. Mientras más chicos s y CV, más precisas las réplicas.',
            deeper: 'Ejemplo: 4, 5, 6 → x̄ = 5; desviaciones −1, 0, +1; Σ = 2; s = √(2/2) = 1; CV = 20 %.' }],
          practice: [
            num('z2-p1', 'Calcula el promedio de 4,1; 4,3 y 4,2.', 4.2, '', { concept: 'base.media', label: 'x̄', slide: 56, tol: 0.001, hint: 'Suma y divide por 3.', traps: [{ value: 12.6, note: 'Falta dividir por 3.' }], solution: ['(4,1 + 4,3 + 4,2)/3 = 4,2'], explain: '4,2.' }),
            q('z2-p2', 'Dos analistas tienen el mismo promedio; uno tiene s = 0,1 y otro s = 0,5. ¿Quién es más preciso?', [{ text: 'El de s = 0,1', correct: true }, { text: 'El de s = 0,5', note: 'Mayor s = más dispersión.' }, { text: 'Son iguales', note: 'El promedio igual no dice nada de la dispersión.' }], { concept: 'base.media', explain: 'Menor s, más precisión.', slide: 56, hint: 's mide dispersión.' })
          ],
          transfer: [write('z2-w1', 'Explica qué mide la desviación estándar.', 'Mide cuánto se alejan, en promedio, las réplicas de su media: si los valores están muy juntos, s es pequeña y las mediciones son precisas. Se calcula con la raíz de la suma de las desviaciones al cuadrado dividida por n − 1.',
            ['Mide la dispersión de las réplicas respecto del promedio', 's pequeña = mediciones precisas', 'Se calcula con n − 1'],
            { concept: 'base.media', explain: 'Dispersión.', slide: 56, keywords: [{ label: 'dispersión', any: ['dispers', 'alej', 'separ'] }, { label: 'precisión', any: ['precis'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-hum', title: 'Humedad y masa seca', formula: '%h = (m_M − m_seca)/m_seca × 100 · Fh = (100 + %h)/100 · m_a pesar = m_seca × Fh', concepts: ['ana.humedad'], vars: [['m_M', 'masa de muestra húmeda', 'g'], ['m_seca', 'masa seca a 105 °C', 'g'], ['Fh', 'factor de humedad', '—']],
        what: 'Corregir por el agua de la muestra.', when: 'Cuando el resultado debe ir en base seca o hay que pesar una masa seca dada.', example: 'Fh = 1,15 → para 5 g secos pesas 5,75 g.', deeper: 'Fh > 1 siempre: la muestra húmeda pesa más.',
        sources: [{ label: 'Etapas del análisis (Pizarro)', slide: 33 }],
        calc: { inputs: [{ id: 'mh', label: 'masa húmeda (g)', value: 2.5, step: 0.001 }, { id: 'ms', label: 'masa seca (g)', value: 2.18, step: 0.001 }], run: v => { const h = (v.mh - v.ms) / v.ms * 100; return '%h = **' + h.toFixed(2).replace('.', ',') + ' %** · Fh = **' + ((100 + h) / 100).toFixed(4).replace('.', ',') + '**'; } } },
      { id: 'f-cal', title: 'Recta de calibración', formula: 'y = m·x + b → x = (y − b)/m', concepts: ['ana.calibracion'], vars: [['y', 'señal (absorbancia, área…)', '—'], ['m', 'pendiente', 'señal por unidad de concentración'], ['x', 'concentración', 'mg/L']],
        what: 'Pasar de la señal medida a la concentración.', when: 'Métodos instrumentales calibrados con estándares.', example: 'A = 0,0067·C: A = 0,300 → C = 44,8 mg/L.', deeper: 'Solo dentro del rango lineal de los estándares.',
        sources: [{ label: 'Etapas del análisis (Pizarro), calibración', slide: 49 }],
        calc: { inputs: [{ id: 'y', label: 'señal', value: 0.3, step: 0.001 }, { id: 'm', label: 'pendiente', value: 0.0067, step: 0.0001 }, { id: 'b', label: 'intercepto', value: 0, step: 0.001 }], run: v => 'x = **' + ((v.y - v.b) / v.m).toFixed(2).replace('.', ',') + '**' } },
      { id: 'f-err', title: 'Error y precisión', formula: 'Er = (x̄ − x_v)/x_v × 100 · s = √[Σ(xᵢ − x̄)²/(n − 1)] · CV = s/x̄ × 100', concepts: ['ana.exactitud', 'ana.precision'], vars: [['x̄', 'promedio', 'unidad del dato'], ['x_v', 'valor verdadero', 'unidad del dato'], ['n', 'número de réplicas', '—']],
        what: 'Medir exactitud (Er) y precisión (s, CV).', when: 'Siempre que entregues un resultado con réplicas.', example: 'Fe: Er = −1,1 %. Pb: s = 0,0038 ppm; CV = 0,50 %.', deeper: 'Exactitud necesita un valor verdadero; precisión, solo las réplicas.',
        sources: [{ label: 'Etapas del análisis (Pizarro)', slide: 56 }, { label: 'Skoog, cap. 5–6', url: 'https://chem.libretexts.org/Bookshelves/Analytical_Chemistry' }] },
      { id: 'f-dixon', title: 'Test Q (dato dudoso)', formula: 'Q = |x_dudoso − x_vecino| / (x_máx − x_mín) · se elimina si Q > Q_tab(n, confianza)', concepts: ['ana.dixon'], vars: [['x_dudoso', 'dato sospechoso', 'unidad del dato'], ['x_vecino', 'dato más cercano al sospechoso', 'unidad del dato'], ['n', 'número de datos', '—']],
        what: 'Decidir si un dato alejado se elimina antes de promediar.', when: 'Cuando una réplica queda lejos del resto.', example: 'n = 5, 90 %: Q = 0,40 < 0,642 → se conserva.', deeper: 'Con n = 3 el Q_tab es muy alto (0,970 al 95 %): casi nada se elimina.',
        sources: [{ label: 'Errores en el análisis químico (Pizarro), test Q', slide: 83 }, { label: 'Ejemplo resuelto', slide: 86 }],
        calc: { inputs: [{ id: 'gap', label: 'hueco (dudoso − vecino)', value: 0.4, step: 0.01 }, { id: 'max', label: 'valor máximo', value: 6, step: 0.01 }, { id: 'min', label: 'valor mínimo', value: 5, step: 0.01 }], run: v => 'Q = **' + (Math.abs(v.gap) / (v.max - v.min)).toFixed(3).replace('.', ',') + '**' } }
    ],
    recipes: [],
    mini: {
      'base.unidades': { idea: 'ppm es como % pero por millón.', steps: ['1 % = 10 000 ppm', '1 ppm ≈ 1 mg/L en agua', 'Revisa las unidades antes de calcular'], check: { prompt: '1 % = … ppm', options: [{ text: '10 000', correct: true }, { text: '100', note: 'Por millón, no por cien.' }], explain: '10⁴.' } },
      'base.media': { idea: 'Promedio = centro; s = cuánto se separan del centro.', steps: ['x̄ = suma / n', 's con n − 1', 'CV = s/x̄ × 100'], check: { prompt: 'Más s significa…', options: [{ text: 'Menos precisión', correct: true }, { text: 'Más exactitud', note: 's no dice nada de la exactitud.' }], explain: 'Más dispersión.' } },
      'ana.conceptos': { idea: 'Analito = la aguja; matriz = el pajar.', steps: ['¿Qué es? → cualitativo', '¿Cuánto? → cuantitativo', 'Volumen, masa, luz o electricidad'], check: { prompt: 'Pesar un precipitado es…', options: [{ text: 'Gravimétrico', correct: true }, { text: 'Volumétrico', note: 'Se mide masa.' }], explain: 'Masa.' } },
      'ana.etapas': { idea: 'Siete pasos, del método al informe.', steps: ['Método y muestreo', 'Preparar, medir y calcular', 'Evaluar e informar'], check: { prompt: 'La primera etapa es…', options: [{ text: 'Seleccionar el método', correct: true }, { text: 'Medir', note: 'Medir es la 4.' }], explain: 'Selección del método.' } },
      'ana.humedad': { idea: 'La muestra húmeda pesa más: multiplica por Fh.', steps: ['%h con la masa seca', 'Fh = (100 + %h)/100', 'Pesar = seca × Fh'], check: { prompt: 'Fh es…', options: [{ text: 'Mayor que 1', correct: true }, { text: 'Menor que 1', note: 'Incluye el agua.' }], explain: '> 1.' } },
      'ana.interferentes': { idea: 'Si algo molesta, enmascáralo o sepáralo.', steps: ['Enmascarar: que no reaccione', 'Separar: precipitar, destilar, extraer, intercambiar iones', 'Disolver o disgregar según la muestra'], check: { prompt: 'Una extracción con solvente es…', options: [{ text: 'Una separación', correct: true }, { text: 'Un enmascaramiento', note: 'Saca físicamente la especie.' }], explain: 'Separación.' } },
      'ana.calibracion': { idea: 'Una regla hecha con estándares: se despeja la x.', steps: ['Estándares → recta', 'x = (y − b)/m', 'Solo dentro del rango'], check: { prompt: 'y = 0,01x, y = 0,25 → x =', options: [{ text: '25', correct: true }, { text: '0,0025', note: 'Divide por la pendiente.' }], explain: '0,25/0,01.' } },
      'ana.exactitud': { idea: 'Exactitud = cerca del valor verdadero.', steps: ['E = x̄ − x_v', 'Er = E/x_v × 100', 'Con signo'], check: { prompt: 'x̄ = 9,9, x_v = 10,0 → Er =', options: [{ text: '−1 %', correct: true }, { text: '+1 %', note: 'Quedó bajo.' }], explain: '−1 %.' } },
      'ana.precision': { idea: 'Precisión = réplicas juntas.', steps: ['Calcula x̄', 's con n − 1', 'CV en %'], check: { prompt: 'El CV se expresa en…', options: [{ text: '%', correct: true }, { text: 'Las unidades del dato', note: 's sí; el CV es relativo.' }], explain: 'Relativo.' } },
      'ana.dixon': { idea: 'Un dato lejano no se tira a ojo: se mide con Q.', steps: ['Ordena los datos', 'Q = hueco ÷ rango', 'Q > Qtab → se elimina'], check: { prompt: 'Q = 0,30 y Qtab = 0,64. El dato…', options: [{ text: 'Se conserva', correct: true }, { text: 'Se elimina', note: 'Solo si Q > Qtab.' }], explain: 'Q < Qtab: se conserva.' } },
      'ana.comparar': { idea: 'El mejor es exacto y preciso a la vez.', steps: ['Er con signo (exactitud)', 's y CV (precisión)', 'Elige |Er| y CV pequeños'], check: { prompt: 'Réplicas muy juntas pero lejos del valor verdadero son…', options: [{ text: 'Precisas, no exactas', correct: true }, { text: 'Exactas, no precisas', note: 'Exacto es cerca del verdadero.' }], explain: 'Precisión ≠ exactitud.' } },
      'ana.errores': { idea: 'Sistemático corre todo; aleatorio dispersa.', steps: ['Sistemático: con causa, un solo lado', 'Aleatorio: al azar, ambos lados', 'Grueso: equivocación grande'], check: { prompt: 'Un error sistemático afecta sobre todo…', options: [{ text: 'La exactitud', correct: true }, { text: 'La precisión', note: 'Corre todos los datos igual.' }], explain: 'Exactitud.' } }
    },
    deep: {},
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', '0,5 % equivale a…', [{ text: '5000 ppm', correct: true }, { text: '50 ppm', note: '× 10 000.' }, { text: '0,005 ppm', note: 'Al revés.' }], { concept: 'base.unidades', explain: '0,5 × 10⁴.', slide: 33 }) },
      { level: 1, item: q('dx-2', 'El promedio de 2, 4 y 6 es…', [{ text: '4', correct: true }, { text: '12', note: 'Falta dividir.' }, { text: '6', note: 'Ese es el máximo.' }], { concept: 'base.media', explain: '12/3.', slide: 56 }) },
      { level: 2, item: q('dx-3', 'Identificar si hay cocaína en un polvo es…', [{ text: 'Cualitativo', correct: true }, { text: 'Cuantitativo', misconception: 'quali-quanti' }, { text: 'Gravimétrico', note: 'No se pesa.' }], { concept: 'ana.conceptos', explain: '¿Qué es?', slide: 5 }) },
      { level: 2, item: q('dx-4', 'Fh = 1,10; quieres 10 g secos. Pesas…', [{ text: '11 g', correct: true }, { text: '9,09 g', misconception: 'humidity-direction' }, { text: '10 g', note: 'Falta el agua.' }], { concept: 'ana.humedad', explain: '10 × 1,10.', slide: 33 }) },
      { level: 2, item: q('dx-5', 'Réplicas muy juntas pero lejos del valor verdadero son…', [{ text: 'Precisas e inexactas', correct: true }, { text: 'Exactas e imprecisas', misconception: 'acc-prec' }, { text: 'Exactas y precisas', note: 'Están lejos del valor verdadero.' }], { concept: 'ana.exactitud', explain: 'Juntas = precisas; lejos = inexactas.', slide: 56 }) },
      { level: 3, item: q('dx-6', 'Con A = 0,02·C, una muestra da A = 0,50. C =', [{ text: '25', correct: true }, { text: '0,01', misconception: 'calib-invert' }, { text: '50', note: 'Divide por 0,02.' }], { concept: 'ana.calibracion', explain: '0,50/0,02.', slide: 49 }) },
      { level: 3, item: q('dx-7', 'Un reactivo contaminado que siempre aumenta el resultado causa un error…', [{ text: 'Sistemático', correct: true }, { text: 'Aleatorio', misconception: 'error-type' }, { text: 'Grueso', note: 'Es constante, no una equivocación puntual.' }], { concept: 'ana.errores', explain: 'Con causa y dirección fija.', slide: 66, source: BOOK }) }
    ] }
  };
})();
