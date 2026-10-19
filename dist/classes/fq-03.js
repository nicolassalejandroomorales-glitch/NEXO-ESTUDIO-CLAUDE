/* Fisicoquímica II · PEP 1 · Celdas galvánicas y ecuación de Nernst (miércoles 21 de octubre).
   Fuente: clase 5 parte II (equilibrio electroquímico) y clase 6 «Equilibrio químico y electrolitos», Dr. Eduardo Pino, USACH 2S 2026.
   Las 101 diapositivas reales están en slides/fq-03.js (Clase 5 II desde la diap. 48 y Clase 6 completa).
   Los ejercicios de «Aplicaciones de FEM» (diap. 83–93: γ± de HCl y pH con electrodo de H₂) traen datos incoherentes (salen γ± ≈ 27 y pH negativo): no se usan. Se usa el de electrodo de vidrio (diap. 91). */
(() => {
  'use strict';
  const SRC = 'catedra-fq-electroquimica';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  const num = (id, prompt, answer, unit, extra = {}) => ({ id, type: 'number', prompt, answer, unit, tol: 0.02, source: SRC, ...extra });
  const spot = (id, prompt, steps, wrong, fix, extra = {}) => ({ id, type: 'spot', prompt, steps, wrong, fix, source: SRC, ...extra });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['fq-03'] = {
    id: 'fq-03',
    subject: 'fisico',
    title: 'Celdas galvánicas y Nernst',
    evaluation: 'PEP 1',
    /* Prueba final de cada misión (estación en modo «solo Demuestra»): formato PEP, un intento, reloj opcional.
       `gen` = generador(es) de fq-03-gen.js (nivel 5); `pep` = pregunta de `goal.questions` que asegura. */
    demuestra: {
      m1: { gen: ['potenciales', 'celdas'], pep: 'P1', seconds: 180 },
      m2: { gen: ['dg', 'nernst'], pep: 'P2', seconds: 180 },
      m3: { gen: ['phfem', 'faraday'], pep: 'P3', seconds: 180 }
    },
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Equilibrio electroquímico · Clase 5 (parte II) y Clase 6', author: 'Dr. Eduardo Pino',
        detail: 'Fisicoquímica II, Química y Farmacia, USACH, 2S 2026', authority: 'Material oficial del curso' }
    },
    misconceptions: {
      'ele-signo': { label: 'Restaste los potenciales al revés', why: '**E°cel = E°cátodo − E°ánodo**, con los **potenciales de reducción** de ambos. El cátodo es el de **mayor** E°red. Si te sale negativo en una celda que debería funcionar, probablemente los invertiste.',
        prereq: { title: 'Potenciales estándar y espontaneidad', mission: 'm1', block: 'm1b1' }, base: 'base.redox',
        check: q('fix-ele-signo', 'Caso corto: Zn²⁺/Zn (−0,76 V) y Cu²⁺/Cu (+0,34 V). ¿Cuánto vale E°cel de la pila Zn–Cu?', [{ text: '+1,10 V', correct: true }, { text: '−1,10 V', note: 'Restaste al revés: el cátodo es el Cu (mayor E°red): 0,34 − (−0,76).' }, { text: '−0,42 V', note: 'Sumaste los potenciales.' }], { concept: 'ele.potenciales', explain: 'E°cel = E°cátodo − E°ánodo = 0,34 − (−0,76) = +1,10 V.', slide: 24 }) },
      'ele-coef': { label: 'Multiplicaste el potencial por los coeficientes', why: 'El **potencial es una propiedad intensiva**: no se multiplica por los coeficientes de la reacción balanceada. En 3 Cd²⁺ + 2 Cr → 3 Cd + 2 Cr³⁺ sigue siendo E°cel = −0,40 − (−0,74) = +0,34 V. Los electrones (n) solo entran en ΔG = −nFE y en Nernst.',
        prereq: { title: 'Potenciales estándar y espontaneidad', mission: 'm1', block: 'm1b1' }, base: 'base.redox' },
      'ele-anodo': { label: 'Confundiste ánodo con cátodo', why: '**Ánodo = oxidación** y **cátodo = reducción**, siempre. En una celda galvánica el ánodo es el polo **negativo** y el cátodo el **positivo**; los electrones van del ánodo al cátodo por el cable.',
        prereq: { title: 'Celdas galvánicas y diagrama de celda', mission: 'm1', block: 'm1b2' }, base: 'base.redox' },
      'ele-ln': { label: 'Mezclaste ln con log en Nernst', why: 'A 25 °C: **E = E° − (0,0257/n)·ln Q** o **E = E° − (0,0592/n)·log Q**. 0,0592 = 0,0257 × 2,303. Si usas 0,0592 con ln el término queda 2,3 veces demasiado grande.',
        prereq: { title: 'Ecuación de Nernst y celdas de concentración', mission: 'm2', block: 'm2b2' }, base: 'base.logn' },
      'ele-q': { label: 'Invertiste el cociente Q', why: '**Q = productos/reactivos** de la reacción **tal como la escribiste**. Los sólidos y líquidos puros no entran. Si das vuelta la reacción, Q se invierte y E° cambia de signo.',
        prereq: { title: 'Ecuación de Nernst y celdas de concentración', mission: 'm2', block: 'm2b2' }, base: 'base.logn',
        check: q('fix-ele-q', 'Caso corto: Zn(s) + Cu²⁺ → Zn²⁺ + Cu(s). ¿Cuánto vale Q?', [{ text: '[Zn²⁺]/[Cu²⁺]', correct: true }, { text: '[Cu²⁺]/[Zn²⁺]', note: 'Está al revés: los productos van arriba.' }, { text: '[Zn²⁺][Cu]', note: 'El Cu(s) es sólido puro: no entra en Q.' }], { concept: 'ele.nernst', explain: 'Productos (Zn²⁺) sobre reactivos (Cu²⁺); los sólidos no entran.', slide: 30 }) },
      'ele-n': { label: 'Usaste mal el número de electrones n', why: '**n** es el número de electrones que se transfieren en la **reacción balanceada** (Cd/Cr: n = 6). En ΔG° = −nFE° y en ln K = nFE°/RT, un n equivocado cambia el resultado por ese factor.',
        prereq: { title: 'ΔG, E° y la constante de equilibrio', mission: 'm2', block: 'm2b1' }, base: 'base.redox' }
    },
    goal: {
      total: 100, text: 'Asegurar los 25 puntos de Celdas galvánicas y Nernst de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P1', label: 'Potenciales estándar y celdas galvánicas', points: 8, missions: ['m1'] },
        { id: 'P2', label: 'ΔG, K y ecuación de Nernst', points: 10, missions: ['m2'] },
        { id: 'P3', label: 'pH por fem y electrólisis', points: 7, missions: ['m3'] }
      ],
      rest: [{ label: 'Equilibrio químico', points: 50, note: 'clase fq-01' }, { label: 'Electrolitos y actividad', points: 25, note: 'clase fq-02' }]
    },
    glossary: [
      { term: 'Potencial estándar de reducción (E°red)', mission: 'm1', def: 'Medida de la tendencia de una especie a reducirse (ganar electrones), con el electrodo normal de hidrógeno como referencia (0,00 V). Mayor E°red = mejor agente oxidante.', simple: 'Qué tantas ganas tiene algo de quedarse con electrones.', simpler: 'Como quién gana más fácil un tira y afloja de electrones.' },
      { term: 'Celda galvánica', mission: 'm1', def: 'Dispositivo que genera electricidad con una reacción redox espontánea (E > 0, ΔG < 0). Ánodo: oxidación (polo negativo); cátodo: reducción (polo positivo).', simple: 'Una pila: una reacción espontánea que hace correr electrones por un cable.', simpler: 'Una cascada de electrones: caen por el cable y mueven algo.' },
      { term: 'Ánodo y cátodo', mission: 'm1', def: 'Ánodo: electrodo donde ocurre la oxidación. Cátodo: electrodo donde ocurre la reducción. Los electrones van del ánodo al cátodo por el circuito externo.', simple: 'El ánodo pierde electrones; el cátodo los recibe.', simpler: 'Ánodo = "A de Arriba": desde ahí caen los electrones.' },
      { term: 'Puente salino', mission: 'm1', def: 'Conexión iónica entre las dos semiceldas que mantiene la neutralidad eléctrica y cierra el circuito sin mezclar las soluciones.', simple: 'Un puente de iones que evita que una semicelda se cargue.', simpler: 'Una puerta para que los iones compensen lo que los electrones se llevan.' },
      { term: 'Fuerza electromotriz (FEM)', mission: 'm1', def: 'E = E_cátodo − E_ánodo: diferencia de potencial entre los electrodos de una celda; E = 0 en equilibrio.', simple: 'El voltaje de la pila.', simpler: 'Qué tan empinada es la cascada de electrones.' },
      { term: 'Diagrama de celda', mission: 'm1', def: 'Notación del ánodo a la izquierda y el cátodo a la derecha: M(s) | Mⁿ⁺(c) ‖ Mᵐ⁺(c) | M(s); ‖ es el puente salino.', simple: 'Una forma corta de escribir la pila, con el ánodo a la izquierda.', simpler: 'Una receta de la pila: de izquierda (ánodo) a derecha (cátodo).' },
      { term: 'Ecuación de Nernst', mission: 'm2', def: 'E = E° − (RT/nF) ln Q = E° − (0,0592/n) log Q a 25 °C: relaciona el potencial con las concentraciones.', simple: 'Corrige el voltaje cuando las concentraciones no son 1 M.', simpler: 'El voltaje baja a medida que la pila se gasta.' },
      { term: 'ΔG = −nFE y K', mission: 'm2', def: 'ΔrG = −nFE; ΔrG° = −nFE° = −RT ln K. E > 0 ⇒ espontánea; E = 0 ⇒ equilibrio; E° > 0 ⇒ K > 1.', simple: 'El voltaje es la energía libre expresada en voltios.', simpler: 'Más voltaje, más "empuje" de la reacción.' },
      { term: 'Celda de concentración', mission: 'm2', def: 'Celda con el mismo electrodo en las dos semiceldas pero distinta concentración (E° = 0): E = (0,0592/n) log(c_conc/c_dil). Se agota cuando las concentraciones se igualan.', simple: 'Una pila hecha solo con dos concentraciones distintas.', simpler: 'Dos vasos de agua a distinto nivel conectados: fluye hasta igualarse.' },
      { term: 'Celda electrolítica y leyes de Faraday', mission: 'm3', def: 'Celda donde una fuente externa fuerza una reacción no espontánea. Faraday: m = M·I·t/(z·F), con F = 96 485 C/mol de e⁻.', simple: 'Con corriente externa se depositan masas proporcionales a la carga.', simpler: 'Más carga, más metal depositado.' }
    ],
    concepts: [
      { id: 'base.redox', title: 'Oxidación, reducción y agentes', root: true },
      { id: 'base.logn', title: 'ln, log y las constantes 0,0257 / 0,0592', root: true },
      { id: 'base.carga', title: 'Carga eléctrica y moles de electrones', root: true },
      { id: 'ele.potenciales', mission: 'm1', title: 'Potenciales estándar y espontaneidad', needs: ['base.redox'] },
      { id: 'ele.celdas', mission: 'm1', title: 'Celdas galvánicas: ánodo, cátodo y diagrama', needs: ['ele.potenciales'] },
      { id: 'ele.dg', mission: 'm2', title: 'ΔG = −nFE y la constante K', needs: ['ele.potenciales', 'base.logn'] },
      { id: 'ele.nernst', mission: 'm2', title: 'Ecuación de Nernst y celdas de concentración', needs: ['ele.dg', 'base.logn'] },
      { id: 'ele.ph', mission: 'm3', title: 'El pH desde un voltaje', needs: ['ele.nernst'] },
      { id: 'ele.faraday', mission: 'm3', title: 'Electrólisis y leyes de Faraday', needs: ['base.carga'] }
    ],
    curiosities: [
      { text: 'La pila de Daniell (Zn | Zn²⁺ ‖ Cu²⁺ | Cu) da 1,10 V y fue la fuente de energía de los primeros telégrafos.', slide: 22 },
      { text: 'Un electrodo de vidrio convierte el pH en voltaje: cada unidad de pH cambia el potencial en unos 59 mV a 25 °C.', slide: 91 },
      { text: 'Una celda de concentración solo necesita el mismo metal en dos concentraciones: con Cu 0,025 M y 1,50 M entrega 0,052 V.', slide: 62 }
    ],
    slideImages: {},
    slides: {
      2: { title: 'Reacciones de óxido-reducción', bullets: ['4 NH₃ + 5 O₂ → 4 NO + 6 H₂O', 'Oxidación: NH₃ (agente reductor); reducción: O₂ (agente oxidante)'] },
      3: { title: 'Balance de ecuaciones redox', bullets: ['Aumenta el estado de oxidación = pérdida de electrones', 'Disminuye el estado de oxidación = ganancia de electrones'] },
      7: { title: 'Potenciales estándar de reducción', bullets: ['E°red: tendencia de una especie a reducirse', 'Medida de su capacidad como agente oxidante'] },
      8: { title: 'Electrodo normal de hidrógeno (ENH)', bullets: ['2 H⁺ + 2 e⁻ ⇌ H₂; E° = 0,00 V', 'Referencia para todos los potenciales'] },
      15: { title: 'Cu(s) en una solución de AgNO₃', bullets: ['E°red(Ag⁺/Ag) = +0,80 V > E°red(Cu²⁺/Cu) = +0,34 V', 'La plata se reduce y el cobre se oxida: espontánea'] },
      21: { title: 'Cu(s) en una solución de Zn(NO₃)₂', bullets: ['Cu + Zn²⁺ → Cu²⁺ + Zn: no espontánea, ΔE = −1,10 V', 'Zn + Cu²⁺ → Zn²⁺ + Cu: espontánea, ΔE = +1,10 V'] },
      22: { title: 'Celdas galvánicas o voltaicas', bullets: ['Generan electricidad con una reacción redox espontánea', 'Pila o celda de Daniell'] },
      23: { title: 'Ánodo y cátodo', bullets: ['Ánodo: oxidación, polo negativo', 'Cátodo: reducción, polo positivo'] },
      24: { title: 'Voltaje, potencial de celda o FEM', bullets: ['E_celda = E_cátodo − E_ánodo (con potenciales de reducción)'] },
      25: { title: 'Diagrama de celda', bullets: ['Ánodo (oxidación) | solución ‖ solución | cátodo (reducción)', '‖ = puente salino: Zn(s) | Zn²⁺(1 M) ‖ Cu²⁺(1 M) | Cu(s)'] },
      27: { title: 'ΔG = −nFE', bullets: ['El trabajo eléctrico máximo es la disminución de G', 'ΔrG = −nFE; F = N_A·e = 96 484 C/mol ≈ 96 500'] },
      28: { title: 'Espontaneidad y signo de E', bullets: ['ΔrG < 0 ⇒ E > 0: espontánea', 'ΔrG > 0 ⇒ E < 0: no espontánea', 'ΔrG = 0 ⇒ E = 0: equilibrio'] },
      29: { title: 'Efecto de la concentración en E', bullets: ['ΔrG = ΔrG° + RT ln Q → E = E° − (RT/nF) ln Q', 'ΔrG° = −nFE°'] },
      30: { title: 'Ecuación de Nernst', bullets: ['E = E° − (0,0592/n) log Q a 25 °C', 'E = E° − (0,0257/n) ln Q a 25 °C'] },
      31: { title: 'Constante de equilibrio', bullets: ['En equilibrio E = 0: ln K = nFE°/RT', 'K = e^(nFE°/RT)'] },
      33: { title: 'Ejercicio Co/Fe', bullets: ['E°(Co²⁺/Co) = −0,28 V; E°(Fe²⁺/Fe) = −0,44 V'] },
      34: { title: 'Co/Fe: ánodo, cátodo y E°', bullets: ['Ánodo: Co → Co²⁺ + 2 e⁻; cátodo: Fe²⁺ + 2 e⁻ → Fe', 'E°cel = −0,44 − (−0,28) = −0,16 V'] },
      35: { title: 'Co/Fe: Nernst', bullets: ['Q = [Co²⁺]/[Fe²⁺] = 0,15/0,68', 'E = −0,16 − (0,0257/2) ln(0,15/0,68) = −0,14 V'] },
      36: { title: 'Ejercicio Cd/Cr', bullets: ['E°(Cd²⁺/Cd) = −0,40 V; E°(Cr³⁺/Cr) = −0,74 V', 'Cd: cátodo (reducción); Cr: ánodo (oxidación)'] },
      38: { title: 'Cd/Cr: E° y ΔG°', bullets: ['E°cel = −0,40 − (−0,74) = +0,34 V', 'ΔG° = −nFE° = −6 · 96 500 · 0,34 = −196,9 kJ/mol'] },
      50: { title: 'Termodinámica de celdas', bullets: ['ΔrG = −nFE a P y T constantes', 'E > 0: celda galvánica y reacción espontánea'] },
      52: { title: 'Nernst y equilibrio', bullets: ['E = E° − (0,0592/n) log Q; en el equilibrio E = 0', 'K = e^(nFE°/RT)'] },
      53: { title: 'Ejercicio: E° del Fe³⁺/Fe', bullets: ['Fe²⁺ + 2 e⁻ → Fe, E° = −0,447 V; Fe³⁺ + e⁻ → Fe²⁺, E° = 0,771 V', 'Se suman los ΔG°, no los potenciales'] },
      60: { title: 'Celdas de concentración', bullets: ['El mismo electrodo en las dos semiceldas, distinta concentración', 'Se reduce en la semicelda más concentrada'] },
      62: { title: 'Celda de concentración de Cu', bullets: ['Cu²⁺ 0,025 M | 1,50 M: E = 0 − (0,059/2) log(0,025/1,50) = 0,052 V', 'E° = 0: es el mismo electrodo'] },
      64: { title: 'Celdas electrolíticas: leyes de Faraday', bullets: ['La masa depositada es proporcional a la carga', 'Con la misma carga, proporcional a los equivalentes químicos'] },
      65: { title: 'Determinación del pH por fem', bullets: ['El pH se obtiene de la fem de una celda: técnica analítica estándar'] },
      66: { title: 'Efecto del pH en el potencial de reducción', bullets: ['MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O', 'E = E° − (0,0591/n) log([Mn²⁺]/[MnO₄⁻]) − (8·0,0591/n)·pH', 'Al bajar el pH sube E: mayor poder oxidante'] },
      67: { title: 'Ejercicio: celda Ce⁴⁺/Mn²⁺', bullets: ['Pt | Mn²⁺, MnO₂ ‖ Ce⁴⁺, Ce³⁺ | Pt a 25 °C', 'Semirreacciones, espontaneidad y pH'] },
      68: { title: 'Ce/Mn: semirreacciones y E°', bullets: ['Mn²⁺ + 2 H₂O → MnO₂ + 4 H⁺ + 2 e⁻; 2 Ce⁴⁺ + 2 e⁻ → 2 Ce³⁺', 'E°cel = 1,61 − 1,23 = +0,38 V: galvánica'] },
      72: { title: 'Ce/Mn: el pH', bullets: ['pH = −¼ [log([Ce⁴⁺]²[Mn²⁺]/[Ce³⁺]²) − n(E − E°)/0,0591]', 'Con [Ce⁴⁺] = 0,1; [Mn²⁺] = 0,1; [Ce³⁺] = 0,01 y E = 0,65 V: pH = 2,03'] },
      75: { title: 'Ejercicio: Fe/Ag y constante de equilibrio', bullets: ['Pt | Fe²⁺(1 M), Fe³⁺(1 M) ‖ Ag⁺(1 M) | Ag', 'E° = 0,028 V → K = e^(nFE°/RT)'] },
      76: { title: 'Ejercicio: celda Zn/H₂', bullets: ['E = 0,54 V, [Zn²⁺] = 1,0 M, P(H₂) = 1,0 atm', 'Calcular [H⁺]'] },
      77: { title: 'Electrólisis de CuBr₂', bullets: ['Se depositan 0,500 g de Cu', 'Cu²⁺ + 2 e⁻ → Cu; 2 Br⁻ → Br₂ + 2 e⁻', 'Q = i·t = m·z·F/M'] },
      78: { title: 'CuBr₂: masa de bromo', bullets: ['m(Br₂) = (M/z)·(i·t/F) con M = 160 g/mol', 'Resultado de la clase: 1,270 g'] },
      91: { title: 'Electrodo de vidrio', bullets: ['E = 0,400 − 0,0591·pH a 298 K', 'E = 0,180 V → pH = 3,72'] }
    },
    missions: [
      {
        id: 'm1', title: 'Potenciales y celdas galvánicas', subtitle: 'E°red, E°cel, ánodo, cátodo y diagrama de celda', minutes: 35, slides: '2–25', pep: 'P1: potenciales estándar y celdas',
        stages: {
          hook: { title: 'Un alambre de cobre y dos soluciones', sage: 'Metes un alambre de cobre en nitrato de plata: se cubre de plata brillante. Lo metes en nitrato de zinc: no pasa nada. Los potenciales de reducción lo decidieron antes de que mojaras el alambre.',
            text: 'En la PEP te darán dos E° de reducción y te pedirán quién se oxida, el E°cel y si la reacción es espontánea. Con eso armas toda la electroquímica.' },
          diagnostic: [
            q('m1-d1', 'En una celda galvánica, el ánodo es el electrodo donde ocurre…', [{ text: 'la oxidación', correct: true }, { text: 'la reducción', note: 'Eso ocurre en el cátodo.', misconception: 'ele-anodo' }, { text: 'la llegada del puente salino', note: 'El puente salino conecta las dos semiceldas.' }],
              { concept: 'ele.celdas', explain: 'Ánodo = oxidación; cátodo = reducción.', slide: 23 }),
            q('m1-d2', 'Para calcular E°cel con potenciales de reducción se usa…', [{ text: 'E°cátodo − E°ánodo', correct: true }, { text: 'E°ánodo − E°cátodo', note: 'Está al revés.', misconception: 'ele-signo' }, { text: 'E°cátodo + E°ánodo', note: 'Los potenciales de reducción se restan.' }],
              { concept: 'ele.potenciales', explain: 'E°cel = E°cátodo − E°ánodo.', slide: 24 })
          ],
          fundamentals: [
            { id: 'f1', concept: 'base.redox', title: 'Desde cero: quién gana y quién pierde electrones', slide: 2, body: '**Oxidación** = pérdida de electrones (sube el estado de oxidación). **Reducción** = ganancia de electrones (baja). El **agente reductor** es el que se oxida; el **agente oxidante**, el que se reduce.',
              deeper: '4 NH₃ + 5 O₂ → 4 NO + 6 H₂O: el N pasa de −3 a +2 (se oxida; NH₃ es el reductor) y el O de 0 a −2 (se reduce; O₂ es el oxidante). Truco: en inglés OIL RIG (Oxidation Is Loss, Reduction Is Gain).' }
          ],
          explain: [],
          transfer: [
            num('m1-t1', 'Estilo PEP: celda con un electrodo de Cd en Cd²⁺ 1,0 M (E° = −0,40 V) y otro de Cr en Cr³⁺ 1,0 M (E° = −0,74 V). Calcula E°cel.', 0.34, 'V',
              { concept: 'ele.potenciales', label: 'E°cel', slide: 38, tol: 0.02, traps: [{ value: -0.34, note: 'Invertiste: el cátodo es el de mayor E°red (Cd).', misconception: 'ele-signo' }, { value: -1.14, note: 'Sumaste los potenciales en vez de restarlos.' }, { value: 0.28, note: 'Multiplicaste cada E° por los coeficientes (3 y 2): el potencial no se multiplica.', misconception: 'ele-coef' }],
                solution: ['Cátodo (mayor E°red): Cd²⁺ + 2 e⁻ → Cd (−0,40 V)', 'Ánodo: Cr → Cr³⁺ + 3 e⁻ (−0,74 V)', 'E°cel = −0,40 − (−0,74) = +0,34 V (el potencial no se multiplica por 3 ni por 2)'], explain: 'E°cel = +0,34 V: espontánea.' }),
            write('m1-w1', 'Enséñale a tu compañero: con dos E° de reducción, ¿cómo decides quién es el cátodo y quién el ánodo, y si la celda es espontánea?', 'El electrodo con mayor E° de reducción es el cátodo (se reduce) y el de menor E° es el ánodo (se oxida). E°cel = E°cátodo − E°ánodo; si es positivo, la reacción es espontánea y la celda es galvánica.',
              ['El de mayor E°red es el cátodo; el de menor, el ánodo', 'E°cel = E°cátodo − E°ánodo', 'E°cel > 0: espontánea (celda galvánica)'],
              { concept: 'ele.potenciales', explain: 'Siempre con potenciales de reducción.', slide: 24, teach: true, keywords: [{ label: 'mayor E° → cátodo', any: ['mayor', 'cátodo', 'catodo'] }, { label: 'E°cel = E°cát − E°án', any: ['resta', '−', 'menos'] }, { label: 'positivo → espontánea', any: ['positiv', 'espont', 'galvánica', 'galvanica'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **potenciales estándar y espontaneidad**.',
            pretest: q('m1-pre1', 'Adivina antes: Cu(s) en AgNO₃ (E°(Ag⁺/Ag) = +0,80 V; E°(Cu²⁺/Cu) = +0,34 V). ¿Ocurre reacción?', [{ text: 'Sí: el Cu se oxida y el Ag⁺ se reduce', correct: true }, { text: 'No: el cobre es más noble que la plata', note: 'La plata es la más "noble" (mayor E°red).' }, { text: 'Sí, pero hay que calentar antes de mezclar', note: 'Es espontánea a temperatura ambiente.' }],
              { concept: 'ele.potenciales', explain: 'El de mayor E°red (Ag⁺) se reduce.', slide: 15 }),
            explain: [
              { id: 'm1b1', concept: 'ele.potenciales', title: 'Potenciales estándar y espontaneidad', slide: 7, body: '**E°red** mide la tendencia de una especie a **reducirse** (ser oxidante). La referencia es el **electrodo normal de hidrógeno (ENH)**: 2 H⁺ + 2 e⁻ ⇌ H₂, E° = 0,00 V. En una celda el de **mayor E°red es el cátodo** y el de menor, el **ánodo**: **E°cel = E°cátodo − E°ánodo**. Si E°cel > 0 la reacción es espontánea. **El potencial no se multiplica por los coeficientes.**',
                deeper: 'Cu en AgNO₃: E°(Ag⁺/Ag) = +0,80 > E°(Cu²⁺/Cu) = +0,34 → Cu + 2 Ag⁺ → Cu²⁺ + 2 Ag, E°cel = 0,80 − 0,34 = +0,46 V (espontánea). Cu en Zn(NO₃)₂: E°(Zn²⁺/Zn) = −0,76; Cu + Zn²⁺ → Cu²⁺ + Zn da −0,76 − 0,34 = −1,10 V (no espontánea); la espontánea es la inversa (Zn + Cu²⁺, +1,10 V).' }
            ],
            practice: [
              num('m1-p1', 'Ag⁺/Ag (+0,80 V) y Cu²⁺/Cu (+0,34 V). Calcula E°cel de la celda galvánica Cu–Ag.', 0.46, 'V',
                { concept: 'ele.potenciales', label: 'E°cel', slide: 15, tol: 0.02, hint: 'El de mayor E°red es el cátodo.', traps: [{ value: -0.46, note: 'Al revés: cátodo − ánodo.', misconception: 'ele-signo' }, { value: 1.14, note: 'Sumaste los potenciales.' }],
                  solution: ['Cátodo: Ag⁺ (+0,80 V); ánodo: Cu (+0,34 V)', 'E°cel = 0,80 − 0,34 = +0,46 V'], explain: 'E°cel = +0,46 V.' }),
              q('m1-p2', 'En Cu(s) + Zn²⁺ → Cu²⁺ + Zn(s), ¿cuánto vale E°cel y qué significa?', [{ text: '−1,10 V: no espontánea', correct: true }, { text: '+1,10 V: espontánea', note: 'Eso es la reacción inversa (Zn + Cu²⁺).', misconception: 'ele-signo' }, { text: '+0,42 V: espontánea', note: 'Sumaste: −0,76 + 0,34. Los potenciales se restan.' }],
                { concept: 'ele.potenciales', explain: 'Cátodo Zn²⁺ (−0,76); ánodo Cu (+0,34): −0,76 − 0,34 = −1,10 V.', slide: 21, hint: 'Identifica quién se reduce en la reacción escrita.' }),
              order('m1-p3', 'Ordena de menor a mayor poder oxidante (E°red):', [['a', 'Zn²⁺ (−0,76 V)'], ['b', 'Fe²⁺ (−0,44 V)'], ['c', 'Cu²⁺ (+0,34 V)'], ['d', 'Ag⁺ (+0,80 V)']], ['a', 'b', 'c', 'd'],
                { concept: 'ele.potenciales', direction: 'De menor a mayor E°red.', explain: 'Mayor E°red = mejor oxidante: Zn²⁺ < Fe²⁺ < Cu²⁺ < Ag⁺.', slide: 7, hint: 'Ordena los números, de más negativo a más positivo.' }),
              classify('m1-p4', 'Clasifica cada reacción:', [['e', 'Espontánea'], ['n', 'No espontánea']], [['a', 'Zn(s) + Cu²⁺ → Zn²⁺ + Cu(s)', 'e'], ['b', 'Cu(s) + 2 Ag⁺ → Cu²⁺ + 2 Ag(s)', 'e'], ['c', 'Cu(s) + Zn²⁺ → Cu²⁺ + Zn(s)', 'n'], ['d', 'Ag(s) + Fe²⁺ → Ag⁺ + Fe(s)', 'n']],
                { concept: 'ele.potenciales', explain: 'Es espontánea si el que se reduce tiene mayor E°red que el que se oxida.', slide: 21, hint: 'Compara E°red del que se reduce con el del que se oxida.' })
            ],
            rule: { title: 'Regla del sabio: potenciales y espontaneidad', concept: 'ele.potenciales', steps: ['Escribe los E°red de las dos semiceldas', 'Mayor E°red → cátodo; menor → ánodo', 'E°cel = E°cátodo − E°ánodo (sin multiplicar por coeficientes)', 'E°cel > 0 → espontánea'] } },
          { id: 'r2', intro: 'Parte 2: **celdas galvánicas y diagrama de celda**.',
            pretest: q('m1-pre2', 'Adivina antes: en una pila de Daniell (Zn/Cu), ¿hacia dónde van los electrones por el cable?', [{ text: 'Del Zn (ánodo) al Cu (cátodo)', correct: true }, { text: 'Del Cu (cátodo) al Zn (ánodo)', note: 'Los electrones salen del que se oxida (Zn).', misconception: 'ele-anodo' }, { text: 'Por el puente salino, de una semicelda a otra', note: 'Por el puente salino viajan iones, no electrones.' }],
              { concept: 'ele.celdas', explain: 'Ánodo → cátodo por el circuito externo.', slide: 23 }),
            explain: [
              { id: 'm1b2', concept: 'ele.celdas', title: 'Celdas galvánicas y diagrama de celda', slide: 22, body: 'Una **celda galvánica** genera electricidad con una reacción redox espontánea. **Ánodo**: oxidación, polo **negativo**. **Cátodo**: reducción, polo **positivo**. Los **electrones** van del ánodo al cátodo por el cable; el **puente salino** cierra el circuito y mantiene la neutralidad. **FEM**: E = E_cátodo − E_ánodo. **Diagrama**: ánodo | solución ‖ solución | cátodo (‖ = puente salino).',
                deeper: 'Pila de Daniell: Zn(s) | Zn²⁺(1 M) ‖ Cu²⁺(1 M) | Cu(s). Ánodo: Zn → Zn²⁺ + 2 e⁻ (−0,76 V). Cátodo: Cu²⁺ + 2 e⁻ → Cu (+0,34 V). E°cel = 0,34 − (−0,76) = 1,10 V.' }
            ],
            practice: [
              q('m1-p5', 'En la celda Zn(s) | Zn²⁺(1 M) ‖ Cu²⁺(1 M) | Cu(s), el cátodo es…', [{ text: 'el electrodo de Cu, donde se reduce el Cu²⁺', correct: true }, { text: 'el electrodo de Zn, donde se reduce el Zn²⁺', note: 'El Zn se oxida: es el ánodo.', misconception: 'ele-anodo' }, { text: 'el puente salino, que cierra el circuito', note: 'El puente no es un electrodo.' }],
                { concept: 'ele.celdas', explain: 'El diagrama pone el ánodo a la izquierda y el cátodo a la derecha.', slide: 25, hint: 'Mira qué lado del ‖ está el cátodo.' }),
              order('m1-p6', 'Ordena el recorrido en una pila de Daniell:', [['a', 'El Zn se oxida y libera electrones'], ['b', 'Los electrones viajan por el cable hacia el Cu'], ['c', 'En el Cu, el Cu²⁺ se reduce con esos electrones'], ['d', 'Los iones del puente salino compensan las cargas']], ['a', 'b', 'c', 'd'],
                { concept: 'ele.celdas', direction: 'Primero lo primero.', explain: 'Oxidación → cable → reducción → neutralidad con el puente.', slide: 22, hint: 'Los electrones salen del ánodo.' }),
              match('m1-p7', 'Une cada término con su descripción:', [['Ánodo', 'Oxidación, polo negativo'], ['Cátodo', 'Reducción, polo positivo'], ['Puente salino', 'Mantiene la neutralidad eléctrica'], ['FEM', 'E_cátodo − E_ánodo']],
                { concept: 'ele.celdas', explain: 'Cada pieza cumple un papel en la pila.', slide: 23, hint: 'Piensa en dónde ocurre cada proceso.' }),
              spot('m1-p8', 'Un aprendiz describe la pila Zn | Zn²⁺ ‖ Cu²⁺ | Cu. ¿En qué paso se equivocó?',
                ['El Zn está en el ánodo', 'Su semirreacción es Zn²⁺ + 2 e⁻ → Zn', 'Los electrones van del Zn al Cu'], 1,
                { question: '¿Cómo se corrige el paso 2?', options: [{ text: 'Zn → Zn²⁺ + 2 e⁻ (oxidación)', correct: true }, { text: 'Cu²⁺ + 2 e⁻ → Cu en el ánodo', note: 'Esa es la semirreacción del cátodo.' }, { text: 'Zn²⁺ → Zn + 2 e⁻', note: 'Eso pondría electrones al lado equivocado.' }] },
                { concept: 'ele.celdas', stepNotes: { 0: 'Bien: el Zn se oxida, es el ánodo.', 2: 'Bien: los electrones salen del ánodo.' }, explain: 'En el ánodo ocurre la oxidación: el Zn pierde electrones.', slide: 25, hint: 'Ánodo = oxidación.' })
            ],
            rule: { title: 'Regla del sabio: celdas galvánicas', concept: 'ele.celdas', steps: ['Ánodo = oxidación (polo −); cátodo = reducción (polo +)', 'Los electrones van del ánodo al cátodo', 'Diagrama: ánodo | sol. ‖ sol. | cátodo', 'E°cel = E°cátodo − E°ánodo'] } }
        ]
      },
      {
        id: 'm2', title: 'ΔG, K y ecuación de Nernst', subtitle: 'Del voltaje a la energía libre, a la constante y a las concentraciones', minutes: 40, slides: '26–62', pep: 'P2: ΔG, K y Nernst',
        stages: {
          hook: { title: 'La pila que se gasta', sage: 'Una pila nueva da 1,10 V; gastada, menos; agotada, 0 V. El potencial cambia porque cambian las concentraciones, y eso lo calcula Nernst.',
            text: 'Tres ideas conectan todo: ΔG = −nFE (energía), K = e^(nFE°/RT) (equilibrio) y Nernst (concentraciones). En la PEP las usarás con números.' },
          diagnostic: [
            q('m2-d1', 'Si E > 0 en una celda, ΔrG de la reacción es…', [{ text: 'negativo: la reacción es espontánea', correct: true }, { text: 'positivo: la reacción no es espontánea', note: 'ΔG = −nFE: el signo se invierte.' }, { text: 'cero: el sistema está en equilibrio', note: 'ΔG = 0 solo en el equilibrio (E = 0).' }],
              { concept: 'ele.dg', explain: 'ΔG = −nFE < 0.', slide: 28 }),
            q('m2-d2', 'Cuando una celda llega al equilibrio, su E vale…', [{ text: 'cero', correct: true }, { text: 'E°', note: 'E = E° solo si Q = 1.' }, { text: 'el máximo', note: 'En el equilibrio la pila está agotada.' }],
              { concept: 'ele.nernst', explain: 'En el equilibrio Q = K y E = 0.', slide: 31 })
          ],
          fundamentals: [
            { id: 'f2', concept: 'base.logn', title: 'Desde cero: ln, log y las constantes de Nernst', slide: 30, body: '**ln x = 2,303·log x**. A 25 °C, RT/F = 0,0257 V, por eso **E = E° − (0,0257/n)·ln Q = E° − (0,0592/n)·log Q** (0,0257 × 2,303 = 0,0592). Usa 0,0257 con **ln** y 0,0592 con **log**.',
              deeper: 'Si usas 0,0592 con ln, el término de corrección queda 2,3 veces demasiado grande. Q = productos/reactivos de la reacción escrita; los sólidos y líquidos puros no entran.' }
          ],
          explain: [],
          transfer: [
            num('m2-t1', 'Estilo PEP: celda Co(s) | Co²⁺ (0,15 M) ‖ Fe²⁺ (0,68 M) | Fe(s). E°(Co²⁺/Co) = −0,28 V y E°(Fe²⁺/Fe) = −0,44 V. Calcula E a 25 °C.', -0.14, 'V',
              { concept: 'ele.nernst', label: 'E', slide: 35, tol: 0.03, traps: [{ value: -0.16, note: 'Ese es E°: falta corregir por las concentraciones.' }, { value: -0.18, note: 'Invertiste Q: es [Co²⁺]/[Fe²⁺] (productos/reactivos).', misconception: 'ele-q' }, { value: -0.115, note: 'Usaste 0,0592 con ln: ese factor va con log.', misconception: 'ele-ln' }],
                solution: ['E° = −0,44 − (−0,28) = −0,16 V; n = 2', 'Reacción: Co + Fe²⁺ → Co²⁺ + Fe → Q = 0,15/0,68 = 0,22', 'E = −0,16 − (0,0257/2)·ln 0,22 = −0,16 + 0,019 = −0,14 V'], explain: 'E ≈ −0,14 V (sigue siendo no espontánea).' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿por qué una celda de concentración (mismo metal, distinta concentración) da voltaje aunque E° = 0?', 'Los dos electrodos son del mismo metal, así que E°cel = 0. Pero Q ≠ 1: la semicelda concentrada tiene más tendencia a reducirse y la diluida a oxidarse. Nernst da E = (0,0592/n)·log(c_conc/c_dil) > 0, hasta que las concentraciones se igualan (E = 0, equilibrio).',
              ['E° = 0 porque es el mismo electrodo', 'Q ≠ 1 por la diferencia de concentración (Nernst)', 'Se agota cuando las concentraciones se igualan'],
              { concept: 'ele.nernst', explain: 'El voltaje viene solo del término de concentración.', slide: 62, teach: true, keywords: [{ label: 'mismo electrodo / E° = 0', any: ['mismo', 'e° = 0', 'e0', 'igual'] }, { label: 'concentración / Q', any: ['concentr', 'q ', 'nernst'] }, { label: 'se igualan', any: ['igual', 'equilibrio', 'agota'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **ΔG, E° y la constante de equilibrio**.',
            pretest: q('m2-pre1', 'Adivina antes: si E°cel = +0,34 V, la constante de equilibrio K es…', [{ text: 'mayor que 1', correct: true }, { text: 'menor que 1', note: 'E° > 0 significa ΔG° < 0: K > 1.' }, { text: 'igual a 1', note: 'K = 1 solo si E° = 0.' }],
              { concept: 'ele.dg', explain: 'ln K = nFE°/RT > 0.', slide: 31 }),
            explain: [
              { id: 'm2b1', concept: 'ele.dg', title: 'ΔG, E° y la constante de equilibrio', slide: 27, body: '**ΔrG = −nFE** (F = 96 485 ≈ 96 500 C/mol; n = electrones de la reacción balanceada). E > 0 ⇒ ΔG < 0 (espontánea); E < 0 ⇒ ΔG > 0; E = 0 ⇒ equilibrio. En estándar, **ΔrG° = −nFE°**. Como ΔG° = −RT ln K, **ln K = nFE°/RT** (a 25 °C: log K = nE°/0,0592).',
                deeper: 'Cd/Cr (E° = 0,34 V; 3 Cd²⁺ + 2 Cr → 3 Cd + 2 Cr³⁺, n = 6): ΔG° = −6 · 96 500 · 0,34 = −196,9 kJ/mol (diap. 38). Fe/Ag (E° = 0,028 V, n = 1): ln K = 96 500 · 0,028/(8,314 · 298) = 1,09 → K = 2,98 (diap. 75).' }
            ],
            practice: [
              num('m2-p1', 'Cd/Cr con E° = 0,34 V y n = 6. Calcula ΔG° en kJ/mol (F = 96 500 C/mol).', -196.9, 'kJ/mol',
                { concept: 'ele.dg', label: 'ΔG°', slide: 38, tol: 0.01, hint: 'ΔG° = −nFE°.', traps: [{ value: 196.9, note: 'Falta el signo: ΔG° = −nFE°.' }, { value: -32.8, note: 'Usaste n = 1: aquí se transfieren 6 electrones.', misconception: 'ele-n' }],
                  solution: ['ΔG° = −nFE° = −6 · 96 500 · 0,34', '= −196 860 J/mol = −196,9 kJ/mol'], explain: 'ΔG° = −196,9 kJ/mol.' }),
              num('m2-p2', 'Fe/Ag con E° = 0,028 V y n = 1 a 298 K (R = 8,314 J/(mol·K); F = 96 500 C/mol). Calcula K.', 2.97, '',
                { concept: 'ele.dg', label: 'K', slide: 75, tol: 0.03, hint: 'ln K = nFE°/RT.', traps: [{ value: 1.09, note: 'Ese es ln K: falta e^x.' }, { value: 0.028, note: 'Ese es E°, no K.' }],
                  solution: ['ln K = (1 · 96 500 · 0,028)/(8,314 · 298) = 1,09', 'K = e^1,09 = 2,97'], explain: 'K ≈ 3,0.' }),
              q('m2-p3', 'Si E°cel < 0, la constante de equilibrio K es…', [{ text: 'menor que 1', correct: true }, { text: 'mayor que 1', note: 'E° < 0 → ΔG° > 0 → K < 1.' }, { text: 'exactamente 1', note: 'K = 1 solo con E° = 0.' }],
                { concept: 'ele.dg', explain: 'ln K = nFE°/RT < 0.', slide: 31, hint: 'Piensa en el signo de ln K.' }),
              match('m2-p4', 'Une cada condición con lo que implica:', [['E > 0', 'ΔG < 0: espontánea'], ['E < 0', 'ΔG > 0: no espontánea'], ['E = 0', 'Equilibrio (Q = K)'], ['E° > 0', 'K > 1']],
                { concept: 'ele.dg', explain: 'ΔG = −nFE enlaza todo.', slide: 28, hint: 'ΔG y E tienen signos contrarios.' })
            ],
            rule: { title: 'Regla del sabio: de E° a ΔG° y K', concept: 'ele.dg', steps: ['Balancea y cuenta n (electrones transferidos)', 'ΔG° = −nFE° (F = 96 500 C/mol)', 'ln K = nFE°/RT; a 25 °C log K = nE°/0,0592', 'E° > 0 → K > 1; E° < 0 → K < 1'] } },
          { id: 'r2', intro: 'Parte 2: **ecuación de Nernst y celdas de concentración**.',
            pretest: q('m2-pre2', 'Adivina antes: una pila se va gastando. Su E…', [{ text: 'baja hasta llegar a cero', correct: true }, { text: 'se mantiene igual mientras haya reactivos', note: 'Cambian las concentraciones: Q se acerca a K.' }, { text: 'sube con el tiempo a medida que reacciona', note: 'Al acercarse al equilibrio el voltaje cae.' }],
              { concept: 'ele.nernst', explain: 'Q → K y E → 0.', slide: 52 }),
            explain: [
              { id: 'm2b2', concept: 'ele.nernst', title: 'Ecuación de Nernst y celdas de concentración', slide: 30, body: '**E = E° − (RT/nF)·ln Q**; a 25 °C: **E = E° − (0,0257/n)·ln Q = E° − (0,0592/n)·log Q**. **Q = productos/reactivos** de la reacción escrita (sólidos puros no entran). En una **celda de concentración** los electrodos son iguales (E° = 0): **E = (0,0592/n)·log(c_concentrada/c_diluida)**.',
                deeper: 'Co/Fe: E° = −0,16 V; Q = [Co²⁺]/[Fe²⁺] = 0,15/0,68 = 0,22 → E = −0,16 − (0,0257/2)·ln 0,22 = −0,14 V (diap. 35). Cu 0,025 M ‖ 1,50 M: E = (0,0592/2)·log(1,50/0,025) = 0,0526 V ≈ 0,052 V (diap. 62).' }
            ],
            practice: [
              num('m2-p5', 'Celda de concentración Cu | Cu²⁺ (0,025 M) ‖ Cu²⁺ (1,50 M) | Cu. Calcula E a 25 °C (n = 2).', 0.0526, 'V',
                { concept: 'ele.nernst', label: 'E', slide: 62, tol: 0.02, hint: 'E = (0,0592/2)·log(1,50/0,025).', traps: [{ value: -0.0526, note: 'Invertiste las concentraciones: la celda funciona hacia la menor.', misconception: 'ele-q' }, { value: 0.1212, note: 'Usaste 0,0592 con ln: ese factor va con log.', misconception: 'ele-ln' }],
                  solution: ['E° = 0 (mismo electrodo); n = 2', 'E = (0,0592/2)·log(1,50/0,025) = 0,0296 · 1,778', 'E = 0,0526 V'], explain: 'E ≈ 0,052 V (la clase da 0,052).' }),
              q('m2-p6', 'En Zn | Zn²⁺ (0,010 M) ‖ Cu²⁺ (1,0 M) | Cu, comparada con la celda estándar (1,10 V), E es…', [{ text: 'mayor que 1,10 V', correct: true }, { text: 'menor que 1,10 V', note: 'Q = [Zn²⁺]/[Cu²⁺] = 0,010 < 1: el log es negativo y E sube.', misconception: 'ele-q' }, { text: 'igual a 1,10 V', note: 'Solo si Q = 1.' }],
                { concept: 'ele.nernst', explain: 'Q = 0,010 → −(0,0592/2) log 0,010 = +0,059 V: E = 1,16 V.', slide: 30, hint: 'Calcula Q = productos/reactivos.' }),
              order('m2-p7', 'Ordena los pasos para aplicar Nernst:', [['a', 'Escribir la reacción balanceada y contar n'], ['b', 'Calcular E° = E°cátodo − E°ánodo'], ['c', 'Escribir Q = productos/reactivos'], ['d', 'Calcular E = E° − (0,0592/n)·log Q']], ['a', 'b', 'c', 'd'],
                { concept: 'ele.nernst', direction: 'Primero lo primero.', explain: 'Reacción y n → E° → Q → E.', slide: 30, hint: 'E° antes que Q.' }),
              spot('m2-p8', 'Un aprendiz calcula E de la celda Co | Co²⁺ (0,15 M) ‖ Fe²⁺ (0,68 M) | Fe. ¿En qué paso se equivocó?',
                ['E° = −0,44 − (−0,28) = −0,16 V', 'Q = [Fe²⁺]/[Co²⁺] = 0,68/0,15 = 4,5', 'E = −0,16 − (0,0257/2)·ln 4,5 = −0,18 V'], 1,
                { question: '¿Cómo se corrige el paso 2?', options: [{ text: 'Q = [Co²⁺]/[Fe²⁺] = 0,15/0,68 = 0,22', correct: true }, { text: 'Q = [Co²⁺][Fe²⁺]', note: 'Q es un cociente: productos sobre reactivos.' }, { text: 'Q = 1 porque son metales', note: 'Los sólidos no entran, pero los iones sí.' }] },
                { concept: 'ele.nernst', stepNotes: { 0: 'Bien: E°cel = cátodo − ánodo.', 2: 'La fórmula está bien, pero parte de un Q invertido.' }, explain: 'La reacción es Co + Fe²⁺ → Co²⁺ + Fe: Q = [Co²⁺]/[Fe²⁺].', slide: 35, hint: 'Productos arriba.' })
            ],
            rule: { title: 'Regla del sabio: Nernst', concept: 'ele.nernst', steps: ['Reacción balanceada, n y E°cel', 'Q = productos/reactivos (sin sólidos puros)', 'E = E° − (0,0592/n)·log Q (o 0,0257 con ln)', 'Celda de concentración: E° = 0 y E = (0,0592/n)·log(c_conc/c_dil)'] } }
        ]
      },
      {
        id: 'm3', title: 'El pH, la electrólisis y los casos de la PEP', subtitle: 'pH desde un voltaje, efecto del pH en E y leyes de Faraday', minutes: 35, slides: '63–78, 91', pep: 'P3: pH por fem y electrólisis',
        stages: {
          hook: { title: 'El pH sin papel: un voltaje', sage: 'Un electrodo de vidrio convierte el pH de una gota en un voltaje: cada unidad de pH cambia E en unos 59 mV. Mides E y obtienes el pH.',
            text: 'En la PEP aparecen celdas cuyo potencial depende del pH (MnO₄⁻, H₂/H⁺) y electrólisis con las leyes de Faraday. Son aplicaciones directas de Nernst y de Q = I·t.' },
          diagnostic: [
            q('m3-d1', 'En MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O, al bajar el pH el poder oxidante del MnO₄⁻…', [{ text: 'aumenta', correct: true }, { text: 'disminuye', note: 'El H⁺ es reactivo: más H⁺ sube E de reducción.' }, { text: 'no cambia', note: 'E depende de [H⁺]⁸.' }],
              { concept: 'ele.ph', explain: 'Más H⁺ → Q baja → E sube.', slide: 66 }),
            q('m3-d2', 'En una celda electrolítica, la reacción…', [{ text: 'la fuerza una fuente externa (no es espontánea)', correct: true }, { text: 'es espontánea y genera corriente por sí sola', note: 'Eso es una celda galvánica.' }, { text: 'ocurre sin necesidad de electrodos', note: 'Siempre hay ánodo y cátodo.' }],
              { concept: 'ele.faraday', explain: 'Electrólisis = reacción forzada.', slide: 64 })
          ],
          fundamentals: [
            { id: 'f3', concept: 'base.carga', title: 'Desde cero: carga y moles de electrones', slide: 64, body: 'Corriente I (A) × tiempo t (s) = carga **Q (C)**. Cada mol de electrones lleva **F = 96 485 C**. Entonces **n(e⁻) = Q/F = I·t/F**.',
              deeper: '2,00 A durante 30,0 min: Q = 2,00 × 1800 = 3600 C → n(e⁻) = 3600/96 485 = 0,0373 mol. Siempre pasa los minutos a segundos.' }
          ],
          explain: [],
          transfer: [
            num('m3-t1', 'Estilo PEP: celda Zn(s) | Zn²⁺ (1,0 M) ‖ H⁺ (x M) | H₂ (1,0 atm) | Pt. E = 0,54 V a 25 °C y E°(Zn²⁺/Zn) = −0,76 V. Calcula el pH.', 3.72, '',
              { concept: 'ele.ph', label: 'pH', slide: 76, tol: 0.01, traps: [{ value: 7.43, note: 'Dividiste 0,0592 entre n = 2, pero el exponente 2 del [H⁺]² cancela el 2: queda 0,0592·pH.' }, { value: -3.72, note: 'Ojo con el signo: pH = −log[H⁺] es positivo.' }],
                solution: ['Zn + 2 H⁺ → Zn²⁺ + H₂; E° = 0 − (−0,76) = 0,76 V; n = 2', 'Q = [Zn²⁺]·P(H₂)/[H⁺]² = 1/[H⁺]²', 'E = 0,76 − (0,0592/2)·log(1/[H⁺]²) = 0,76 − 0,0592·pH', 'pH = (0,76 − 0,54)/0,0592 = 3,72 ([H⁺] = 1,9 × 10⁻⁴ M)'], explain: 'pH = 3,72.' }),
            write('m3-w1', 'Enséñale a tu compañero: ¿por qué el MnO₄⁻ es un oxidante más fuerte a pH bajo?', 'En MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O el H⁺ es reactivo. Al bajar el pH aumenta [H⁺], Q disminuye y por Nernst el potencial de reducción sube (en 8·0,0591/5 = 0,095 V por unidad de pH). Mayor E de reducción significa mayor poder oxidante.',
              ['El H⁺ es reactivo en la semirreacción', 'Más [H⁺] → Q menor → E mayor (Nernst)', 'Mayor E de reducción = mayor poder oxidante'],
              { concept: 'ele.ph', explain: 'Cada unidad de pH baja E en 8·0,0591/5 V.', slide: 66, teach: true, keywords: [{ label: 'H⁺ es reactivo', any: ['h⁺', 'h+', 'protón', 'proton', 'ácido', 'acido'] }, { label: 'sube E / Nernst', any: ['sube', 'aument', 'nernst', 'mayor e'] }, { label: 'poder oxidante', any: ['oxidante', 'oxida'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **el pH desde la fem**.',
            pretest: q('m3-pre1', 'Adivina antes: si el H⁺ es reactivo en la semirreacción de reducción, al bajar el pH el E de reducción…', [{ text: 'sube', correct: true }, { text: 'baja', note: 'Más reactivo → Q menor → E mayor.' }, { text: 'no cambia', note: 'Aparece [H⁺] en Q.' }],
              { concept: 'ele.ph', explain: 'Nernst: E = E° − (0,0592/n) log Q con [H⁺] en el denominador.', slide: 66 }),
            explain: [
              { id: 'm3b1', concept: 'ele.ph', title: 'Efecto del pH y electrodo de vidrio', slide: 66, body: 'Si el H⁺ aparece en la semirreacción, E depende del pH. MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O: **E = E° − (0,0591/5)·log([Mn²⁺]/[MnO₄⁻]) − (8·0,0591/5)·pH**: E sube **0,0946 V** por cada unidad que baja el pH. **Electrodo de vidrio**: E = E₀ − 0,0591·pH → **pH = (E₀ − E)/0,0591**.',
                deeper: 'Electrodo con E = 0,400 − 0,0591·pH que marca 0,180 V: pH = 0,220/0,0591 = 3,72 (diap. 91). Celda Ce⁴⁺/Mn²⁺ (diap. 67–72): E° = 1,61 − 1,23 = 0,38 V; con [Ce⁴⁺] = 0,1, [Ce³⁺] = 0,01, [Mn²⁺] = 0,1 y E = 0,65 V el pH es 2,03.' }
            ],
            practice: [
              num('m3-p1', 'Un electrodo de vidrio cumple E = 0,400 − 0,0591·pH. Se mide E = 0,180 V. Calcula el pH.', 3.72, '',
                { concept: 'ele.ph', label: 'pH', slide: 91, tol: 0.01, hint: 'pH = (E₀ − E)/0,0591.', traps: [{ value: 3.05, note: 'Dividiste E entre 0,0591 sin restarlo de E₀.' }, { value: 6.77, note: 'Dividiste E₀ entre 0,0591: falta restar el E medido.' }],
                  solution: ['0,180 = 0,400 − 0,0591·pH', 'pH = (0,400 − 0,180)/0,0591 = 3,72'], explain: 'pH = 3,72.' }),
              num('m3-p2', 'MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O. ¿Cuánto cambia E (V) por cada unidad que baja el pH? (0,0591 V)', 0.0946, 'V',
                { concept: 'ele.ph', label: 'ΔE/pH', slide: 66, tol: 0.01, hint: 'Pendiente = 8·0,0591/n.', traps: [{ value: 0.0591, note: 'Falta el 8 de [H⁺]⁸ y dividir por n = 5.' }, { value: 0.0591 * 8, note: 'Falta dividir por n = 5.', misconception: 'ele-n' }],
                  solution: ['Pendiente = (8 · 0,0591)/5', '= 0,0946 V por unidad de pH'], explain: 'E sube 0,0946 V por cada unidad de pH que baja.' }),
              num('m3-p3', 'Celda Pt | Mn²⁺, MnO₂ ‖ Ce⁴⁺, Ce³⁺ | Pt a 25 °C (n = 2, E° = 0,38 V). Con [Ce⁴⁺] = 0,1; [Ce³⁺] = 0,01; [Mn²⁺] = 0,1 M y E = 0,65 V, calcula el pH.', 2.03, '',
                { concept: 'ele.ph', label: 'pH', slide: 72, tol: 0.01, hint: 'Q = [Ce³⁺]²[H⁺]⁴/([Ce⁴⁺]²[Mn²⁺]); log Q = −n(E − E°)/0,0591.', traps: [{ value: 2.28, note: 'Olvidaste el aporte de las concentraciones: log([Ce³⁺]²/([Ce⁴⁺]²[Mn²⁺])) = −1.' }, { value: 4.07, note: 'Dividiste por 2 en vez de por 4: [H⁺] está elevado a 4.' }],
                  solution: ['log Q = −2(0,65 − 0,38)/0,0591 = −9,14', 'log Q = 2 log 0,01 + 4 log[H⁺] − 2 log 0,1 − log 0,1 = −1 + 4 log[H⁺]', '4 log[H⁺] = −8,14 → pH = 2,03'], explain: 'pH = 2,03.' }),
              order('m3-p4b', 'Ordena los pasos para sacar el pH de una celda con H⁺:', [['a', 'Escribir la semirreacción y contar n'], ['b', 'Escribir Q con [H⁺] en el exponente'], ['c', 'Despejar log[H⁺] desde E = E° − (0,0592/n) log Q'], ['d', 'Calcular pH = −log[H⁺]']], ['a', 'b', 'c', 'd'],
                { concept: 'ele.ph', direction: 'Primero lo primero.', explain: 'Reacción y n → Q → despeje → pH.', slide: 72, hint: 'El pH es lo último.' }),
              q('m3-p4', 'En la celda Ce⁴⁺/MnO₂ en condiciones estándar (E°cel = +0,38 V), ¿cómo funciona?', [{ text: 'Como celda galvánica: la reacción es espontánea', correct: true }, { text: 'Como celda electrolítica: hay que forzarla', note: 'E° > 0 significa que la reacción ocurre sola.' }, { text: 'No funciona en esas condiciones', note: 'E° > 0: espontánea.' }],
                { concept: 'ele.ph', explain: 'E° = 1,61 − 1,23 = +0,38 V > 0.', slide: 68, hint: 'Mira el signo de E°cel.' })
            ],
            rule: { title: 'Regla del sabio: pH y voltaje', concept: 'ele.ph', steps: ['Escribe la semirreacción con H⁺ y su n', 'Pendiente del pH = (coef. H⁺ · 0,0591)/n', 'Electrodo de vidrio: pH = (E₀ − E)/0,0591', 'Si Q tiene [H⁺], despéjalo con log Q = −n(E − E°)/0,0591'] } },
          { id: 'r2', intro: 'Parte 2: **electrólisis y leyes de Faraday**.',
            pretest: q('m3-pre2', 'Adivina antes: en una celda electrolítica, la reacción global…', [{ text: 'no es espontánea: la fuerza una fuente externa', correct: true }, { text: 'es espontánea y ocurre sola', note: 'Eso es una galvánica.' }, { text: 'no tiene oxidación, apenas reducción', note: 'Siempre hay oxidación en el ánodo y reducción en el cátodo.' }],
              { concept: 'ele.faraday', explain: 'Electrólisis = reacción forzada.', slide: 64 }),
            explain: [
              { id: 'm3b2', concept: 'ele.faraday', title: 'Celdas electrolíticas y leyes de Faraday', slide: 64, body: 'En una **celda electrolítica** una fuente externa fuerza una reacción no espontánea (E < 0). **Faraday**: la masa depositada es proporcional a la carga: **m = M·I·t/(z·F)** con **Q = I·t**, **F = 96 485 C/mol de e⁻** y z = electrones por ion (Cu²⁺: 2). Con la misma carga, las masas son proporcionales a los equivalentes (M/z).',
                deeper: '2,00 A durante 30,0 min en CuSO₄: Q = 3600 C; n(Cu) = 3600/(2 · 96 485) = 0,0187 mol; m = 0,0187 × 63,55 = 1,19 g. CuBr₂ con 0,500 g de Cu: n(Cu) = 7,87 mmol = n(Br₂) → m(Br₂) = 1,26 g (la diap. 78 da 1,270 g por redondear la masa molar del Cu a 63).' }
            ],
            practice: [
              num('m3-p5', 'Se electroliza CuSO₄ con 2,00 A durante 30,0 min. ¿Cuántos gramos de Cu se depositan? (M = 63,55 g/mol; F = 96 485 C/mol).', 1.19, 'g',
                { concept: 'ele.faraday', label: 'm', slide: 64, tol: 0.015, hint: 'Q = I·t en segundos; z = 2.', traps: [{ value: 0.0187, note: 'Esos son los moles de Cu: falta multiplicar por la masa molar.' }, { value: 0.0198, note: 'Usaste t = 30 (minutos) sin pasarlo a segundos.' }, { value: 2.37, note: 'Olvidaste que z = 2 (dos electrones por ion de Cu).', misconception: 'ele-n' }],
                  solution: ['Q = 2,00 A × 1800 s = 3600 C', 'n(Cu) = Q/(zF) = 3600/(2 · 96 485) = 0,0187 mol', 'm = 0,0187 × 63,55 = 1,19 g'], explain: 'm = 1,19 g.' }),
              num('m3-p6', 'Electrólisis de CuBr₂(ac): en el cátodo se depositan 0,500 g de Cu. ¿Cuántos gramos de Br₂ se forman en el ánodo? (M(Cu) = 63,55; M(Br₂) = 159,8 g/mol).', 1.26, 'g',
                { concept: 'ele.faraday', label: 'm(Br₂)', slide: 78, tol: 0.02, hint: 'Los dos electrodos reciben la misma carga: 2 e⁻ por Cu y por Br₂.', traps: [{ value: 0.629, note: 'Usaste la masa de Br (79,9) en vez de Br₂.' }, { value: 0.5, note: 'Esa es la masa de Cu: falta pasar por los moles.' }],
                  solution: ['n(Cu) = 0,500/63,55 = 7,87 × 10⁻³ mol', 'Cada Cu²⁺ toma 2 e⁻ y cada Br₂ libera 2 e⁻: n(Br₂) = n(Cu)', 'm(Br₂) = 7,87 × 10⁻³ × 159,8 = 1,26 g'], explain: 'm(Br₂) ≈ 1,26 g (la clase da 1,27 g por redondeo).' }),
              q('m3-p7', 'En el cátodo de la electrólisis de CuBr₂(ac) ocurre…', [{ text: 'Cu²⁺ + 2 e⁻ → Cu(s)', correct: true }, { text: '2 Br⁻ → Br₂ + 2 e⁻', note: 'Eso es la oxidación: ocurre en el ánodo.', misconception: 'ele-anodo' }, { text: 'Cu(s) → Cu²⁺ + 2 e⁻', note: 'Eso sería disolver el cobre, no depositarlo.' }],
                { concept: 'ele.faraday', explain: 'En el cátodo siempre hay reducción.', slide: 77, hint: 'Cátodo = reducción.' }),
              match('m3-p8', 'Une cada símbolo con su significado:', [['Q = I·t', 'Carga eléctrica en coulomb'], ['F', '96 485 C por mol de electrones'], ['z', 'Electrones por ion depositado'], ['M/z', 'Equivalente químico']],
                { concept: 'ele.faraday', explain: 'm = M·I·t/(z·F) las junta a todas.', slide: 64, hint: 'Piensa en las unidades.' })
            ],
            rule: { title: 'Regla del sabio: Faraday', concept: 'ele.faraday', steps: ['Q = I·t (t en segundos)', 'n(e⁻) = Q/F con F = 96 485 C/mol', 'n(sustancia) = n(e⁻)/z', 'm = n · M'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.redox', title: 'Oxidación y reducción', subtitle: 'Quién pierde y quién gana electrones', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.redox', title: 'Oxidación y reducción', slide: 2, body: '**Oxidación**: pérdida de electrones (sube el estado de oxidación). **Reducción**: ganancia (baja). El **reductor** es el que se oxida; el **oxidante**, el que se reduce.',
            deeper: 'Zn + Cu²⁺ → Zn²⁺ + Cu: el Zn pasa de 0 a +2 (se oxida, es el reductor) y el Cu²⁺ de +2 a 0 (se reduce, es el oxidante).' }],
          practice: [q('z1-p1', 'En Zn + Cu²⁺ → Zn²⁺ + Cu, el agente reductor es…', [{ text: 'Zn', correct: true }, { text: 'Cu²⁺', note: 'Cu²⁺ se reduce: es el oxidante.' }, { text: 'Zn²⁺', note: 'Es un producto.' }], { concept: 'base.redox', explain: 'El que se oxida es el reductor.', slide: 2, hint: '¿Quién pierde electrones?' })],
          transfer: [write('z1-w1', 'Explica con tus palabras la diferencia entre agente oxidante y agente reductor.', 'El agente oxidante es la especie que se reduce: gana electrones y oxida a otra. El agente reductor es la especie que se oxida: pierde electrones y reduce a otra.',
            ['Oxidante: se reduce (gana e⁻)', 'Reductor: se oxida (pierde e⁻)'],
            { concept: 'base.redox', explain: 'Se nombran por lo que hacen a la otra especie.', slide: 2, keywords: [{ label: 'oxidante se reduce', any: ['oxidante', 'se reduce', 'gana'] }, { label: 'reductor se oxida', any: ['reductor', 'se oxida', 'pierde'] }] })]
        } },
      { id: 'z2', concept: 'base.logn', title: 'ln, log y las constantes', subtitle: 'Cuándo usar 0,0257 y cuándo 0,0592', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.logn', title: 'ln, log y las constantes', slide: 30, body: '**ln x = 2,303·log x**. En Nernst, **0,0257 va con ln** y **0,0592 va con log** (0,0257 × 2,303). Un log de base 10 se invierte con 10^x; un ln, con e^x.',
            deeper: 'log 100 = 2; ln 100 = 4,605. Si Q = 0,22, log Q = −0,66 y ln Q = −1,51.' }],
          practice: [q('z2-p1', 'A 25 °C, E = E° − (0,0592/n)·___ Q. ¿Qué va en el espacio?', [{ text: 'log', correct: true }, { text: 'ln', note: 'Con ln la constante es 0,0257.', misconception: 'ele-ln' }, { text: 'exp', note: 'No hay exponencial en Nernst.' }], { concept: 'base.logn', explain: '0,0592 va con log.', slide: 30, hint: '0,0592 = 0,0257 × 2,303.' })],
          transfer: [write('z2-w1', 'Explica con tus palabras cuándo usas 0,0257 y cuándo 0,0592 en la ecuación de Nernst.', 'Uso 0,0257 V cuando la ecuación lleva ln Q y 0,0592 V cuando lleva log Q, porque 0,0592 = 0,0257 × 2,303 (el factor de convertir ln en log). Los dos valen a 25 °C.',
            ['0,0257 con ln Q', '0,0592 con log Q', 'Relación: 2,303 y 25 °C'],
            { concept: 'base.logn', explain: 'Es la misma ecuación en dos formatos.', slide: 30, keywords: [{ label: '0,0257 con ln', any: ['0,0257', 'ln'] }, { label: '0,0592 con log', any: ['0,0592', 'log'] }] })]
        } },
      { id: 'z3', concept: 'base.carga', title: 'Carga y moles de electrones', subtitle: 'De amperes y segundos a moles de e⁻', minutes: 6,
        stages: {
          explain: [{ id: 'z3b1', concept: 'base.carga', title: 'Carga y moles de electrones', slide: 64, body: '**Q = I·t** (A × s = C). Un mol de electrones lleva **F = 96 485 C**: **n(e⁻) = Q/F**.',
            deeper: '1,00 A durante 965 s: Q = 965 C → n(e⁻) = 965/96 485 = 0,0100 mol.' }],
          practice: [q('z3-p1', '1,00 A durante 10,0 minutos transportan una carga de…', [{ text: '600 C', correct: true }, { text: '10,0 C', note: 'Pasa los minutos a segundos.' }, { text: '0,10 C', note: 'Falta multiplicar por 60 s/min.' }], { concept: 'base.carga', explain: 'Q = 1,00 × 600 = 600 C.', slide: 64, hint: 't en segundos.' })],
          transfer: [write('z3-w1', 'Explica con tus palabras cómo pasas de la corriente y el tiempo a los moles de electrones.', 'Multiplico la corriente (A) por el tiempo en segundos para obtener la carga Q en coulomb, y la divido por la constante de Faraday (96 485 C/mol) para obtener los moles de electrones.',
            ['Q = I·t con t en segundos', 'n(e⁻) = Q/F con F = 96 485 C/mol'],
            { concept: 'base.carga', explain: 'Siempre en segundos.', slide: 64, keywords: [{ label: 'Q = I·t', any: ['i·t', 'i x t', 'multipl', 'amper'] }, { label: 'dividir por F', any: ['faraday', '96', 'divid'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-E0', title: 'Potencial estándar de celda', formula: 'E°cel = E°cátodo − E°ánodo', concepts: ['ele.potenciales'], vars: [['E°cátodo', 'E°red de la semicelda donde se reduce (la mayor)', 'V'], ['E°ánodo', 'E°red de la semicelda donde se oxida (la menor)', 'V']],
        what: 'Decir si una reacción redox es espontánea.', when: 'Siempre con potenciales de reducción.', example: 'Ag/Cu: 0,80 − 0,34 = +0,46 V.', deeper: 'No se multiplica por los coeficientes.',
        sources: [{ label: 'Clase 6 · FEM', slide: 24 }, { label: 'Cd/Cr', slide: 38 }],
        calc: { inputs: [{ id: 'c', label: 'E° cátodo (V)', value: 0.8, step: 0.01 }, { id: 'a', label: 'E° ánodo (V)', value: 0.34, step: 0.01 }], run: v => 'E°cel = **' + (v.c - v.a).toFixed(2).replace('.', ',') + ' V**' } },
      { id: 'f-dg', title: 'ΔG° y constante de equilibrio', formula: 'ΔG° = −nFE° · ln K = nFE°/RT', concepts: ['ele.dg'], vars: [['n', 'electrones transferidos', '—'], ['F', 'constante de Faraday', '96 500 C/mol']],
        what: 'Pasar de voltaje a energía libre y a K.', when: 'Con E° y n de la reacción balanceada.', example: 'Cd/Cr: ΔG° = −196,9 kJ/mol.', deeper: 'A 25 °C: log K = nE°/0,0592.',
        sources: [{ label: 'Clase 6 · ΔG = −nFE', slide: 27 }, { label: 'K = e^(nFE°/RT)', slide: 31 }],
        calc: { inputs: [{ id: 'n', label: 'n', value: 6, step: 1 }, { id: 'E', label: 'E° (V)', value: 0.34, step: 0.001 }], run: v => 'ΔG° = **' + (-v.n * 96500 * v.E / 1000).toFixed(1).replace('.', ',') + ' kJ/mol** · K = **' + Math.exp(v.n * 96500 * v.E / (8.314 * 298)).toExponential(2).replace('.', ',') + '**' } },
      { id: 'f-nernst', title: 'Ecuación de Nernst', formula: 'E = E° − (0,0592/n)·log Q   (25 °C)', concepts: ['ele.nernst'], vars: [['Q', 'productos/reactivos de la reacción escrita', '—'], ['n', 'electrones transferidos', '—']],
        what: 'Corregir E cuando las concentraciones no son 1 M.', when: 'Celdas fuera del estado estándar, celdas de concentración, pH.', example: 'Co/Fe: E = −0,14 V.', deeper: 'Con ln usa 0,0257.',
        sources: [{ label: 'Clase 6 · Nernst', slide: 30 }, { label: 'Co/Fe', slide: 35 }],
        calc: { inputs: [{ id: 'E0', label: 'E° (V)', value: -0.16, step: 0.01 }, { id: 'n', label: 'n', value: 2, step: 1 }, { id: 'Q', label: 'Q', value: 0.22, step: 0.01 }], run: v => 'E = **' + (v.E0 - 0.0592 / v.n * Math.log10(v.Q)).toFixed(3).replace('.', ',') + ' V**' } },
      { id: 'f-far', title: 'Leyes de Faraday', formula: 'm = M·I·t/(z·F)', concepts: ['ele.faraday'], vars: [['I', 'corriente', 'A'], ['t', 'tiempo', 's'], ['z', 'electrones por ion', '—']],
        what: 'Cuánta masa se deposita en una electrólisis.', when: 'Celdas electrolíticas.', example: '2,00 A por 30 min en CuSO₄: 1,19 g de Cu.', deeper: 'F = 96 485 C/mol de electrones.',
        sources: [{ label: 'Clase 6 · Faraday', slide: 64 }, { label: 'CuBr₂', slide: 77 }],
        calc: { inputs: [{ id: 'M', label: 'M (g/mol)', value: 63.55, step: 0.01 }, { id: 'I', label: 'I (A)', value: 2, step: 0.1 }, { id: 't', label: 't (s)', value: 1800, step: 10 }, { id: 'z', label: 'z', value: 2, step: 1 }], run: v => 'm = **' + (v.M * v.I * v.t / (v.z * 96485)).toFixed(3).replace('.', ',') + ' g**' } }
    ],
    recipes: [],
    mini: {
      'base.redox': { idea: 'Oxidación = pierde electrones; reducción = gana.', steps: ['Mira el estado de oxidación', 'Sube: se oxida (reductor)', 'Baja: se reduce (oxidante)'], check: { prompt: 'El agente oxidante es el que…', options: [{ text: 'se reduce', correct: true }, { text: 'se oxida', note: 'Ese es el reductor.' }], explain: 'Oxida al otro y se reduce.' } },
      'base.logn': { idea: '0,0257 va con ln y 0,0592 va con log.', steps: ['ln x = 2,303·log x', 'Elige una forma y no las mezcles', 'Siempre a 25 °C'], check: { prompt: 'La constante que va con log es…', options: [{ text: '0,0592', correct: true }, { text: '0,0257', note: 'Esa va con ln.' }], explain: '0,0257 × 2,303.' } },
      'base.carga': { idea: 'La carga es corriente por tiempo, y un mol de e⁻ lleva 96 485 C.', steps: ['Q = I·t (t en s)', 'n(e⁻) = Q/F', 'n(sustancia) = n(e⁻)/z'], check: { prompt: '2 A durante 100 s son…', options: [{ text: '200 C', correct: true }, { text: '50 C', note: 'Se multiplica, no se divide.' }], explain: 'Q = 2 × 100.' } },
      'ele.potenciales': { idea: 'El de mayor E°red se reduce; la diferencia es el voltaje.', steps: ['Compara los E°red', 'Mayor → cátodo; menor → ánodo', 'E°cel = cátodo − ánodo'], check: { prompt: 'Si E°cel > 0, la reacción es…', options: [{ text: 'espontánea', correct: true }, { text: 'no espontánea', note: 'E° > 0 → ΔG° < 0.' }], explain: 'Positiva = espontánea.' } },
      'ele.celdas': { idea: 'Los electrones caen del ánodo al cátodo por el cable.', steps: ['Ánodo = oxidación (−)', 'Cátodo = reducción (+)', 'El puente salino cierra el circuito'], check: { prompt: 'En una pila galvánica, el ánodo es el polo…', options: [{ text: 'negativo', correct: true }, { text: 'positivo', note: 'Eso es el cátodo.' }], explain: 'El ánodo envía electrones.' } },
      'ele.dg': { idea: 'Voltaje positivo = energía libre negativa = K grande.', steps: ['ΔG = −nFE', 'ln K = nFE°/RT', 'E = 0 → equilibrio'], check: { prompt: 'Si E° = 0, K =', options: [{ text: '1', correct: true }, { text: '0', note: 'ln K = 0 → K = 1.' }], explain: 'e⁰ = 1.' } },
      'ele.nernst': { idea: 'El voltaje cambia con las concentraciones: más productos, menos E.', steps: ['Q = productos/reactivos', 'E = E° − (0,0592/n) log Q', 'Q = K → E = 0'], check: { prompt: 'Si Q = 1, E =', options: [{ text: 'E°', correct: true }, { text: '0', note: 'E = 0 solo si Q = K.' }], explain: 'log 1 = 0.' } },
      'ele.ph': { idea: 'Si el H⁺ está en la reacción, el voltaje cambia con el pH.', steps: ['Pendiente = (coef. H⁺ · 0,0591)/n', 'Electrodo de vidrio: E = E₀ − 0,0591·pH', 'Despeja el pH desde E'], check: { prompt: 'Al subir el pH en un electrodo de vidrio, E…', options: [{ text: 'baja', correct: true }, { text: 'sube', note: 'E = E₀ − 0,0591·pH.' }], explain: 'La pendiente es negativa.' } },
      'ele.faraday': { idea: 'Más carga, más sustancia depositada.', steps: ['Q = I·t', 'n(e⁻) = Q/F', 'm = n(e⁻)/z · M'], check: { prompt: 'Duplicar la corriente y el tiempo deposita…', options: [{ text: '4 veces más masa', correct: true }, { text: '2 veces más masa', note: 'Q = I·t se cuadruplica.' }], explain: 'Q es el producto.' } }
    },
    deep: {
      'ele.nernst': { title: 'De la energía libre a Nernst', sections: [['El punto de partida', 'ΔrG = ΔrG° + RT ln Q; como ΔrG = −nFE, queda E = E° − (RT/nF) ln Q.'], ['Qué significa Q', 'Q es la foto de las concentraciones ahora; K es la meta. Cuando Q = K, ΔrG = 0 y E = 0.'], ['La pila que se agota', 'A medida que la pila entrega corriente, Q crece hacia K y E cae a cero.']],
        challenge: { prompt: 'Si Q > 1 en una celda con E° > 0, E es…', options: [{ text: 'menor que E°', correct: true }, { text: 'mayor que E°', note: 'log Q > 0 resta.' }], explain: 'E = E° − (0,0592/n) log Q con log Q > 0.' },
        sources: [{ label: 'Clase 6 · deducción de Nernst', slide: 29 }, { label: 'Clase 6 · equilibrio', slide: 31 }] },
      'ele.dg': { title: 'Por qué un voltaje es una energía', sections: [['El trabajo eléctrico', 'Mover una carga a través de una diferencia de potencial E hace un trabajo nFE por mol de reacción.'], ['La relación', 'El trabajo máximo es la disminución de G: ΔrG = −nFE.'], ['Del estándar al equilibrio', 'ΔG° = −nFE° = −RT ln K: un E° de 0,1 V ya da K ≈ 50 para n = 1.']],
        challenge: { prompt: 'Con n = 2 y E° = 0,0592 V a 25 °C, log K =', options: [{ text: '2', correct: true }, { text: '1', note: 'log K = nE°/0,0592 = 2·0,0592/0,0592.' }], explain: 'log K = nE°/0,0592.' },
        sources: [{ label: 'Clase 6 · ΔG = −nFE', slide: 27 }, { label: 'Clase 6 · K desde E°', slide: 31 }] }
    },
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', 'El agente reductor es la especie que…', [{ text: 'se oxida', correct: true }, { text: 'se reduce', note: 'Ese es el oxidante.' }, { text: 'no cambia', note: 'Participa cediendo electrones.' }], { concept: 'base.redox', explain: 'Reduce al otro perdiendo electrones.', slide: 2 }) },
      { level: 1, item: q('dx-2', '1,00 A durante 100 s es una carga de…', [{ text: '100 C', correct: true }, { text: '1 C', note: 'Se multiplica por el tiempo.' }, { text: '0,01 C', note: 'No se divide.' }], { concept: 'base.carga', explain: 'Q = I·t.', slide: 64 }) },
      { level: 2, item: q('dx-3', 'E°cel = ', [{ text: 'E°cátodo − E°ánodo', correct: true }, { text: 'E°ánodo − E°cátodo', note: 'Al revés.', misconception: 'ele-signo' }, { text: 'E°cátodo + E°ánodo', note: 'Se restan.' }], { concept: 'ele.potenciales', explain: 'Con potenciales de reducción.', slide: 24 }) },
      { level: 2, item: q('dx-4', 'En el ánodo de una celda galvánica ocurre…', [{ text: 'oxidación', correct: true }, { text: 'reducción', note: 'Eso es el cátodo.', misconception: 'ele-anodo' }, { text: 'ninguna reacción', note: 'Es un electrodo activo.' }], { concept: 'ele.celdas', explain: 'Ánodo = oxidación.', slide: 23 }) },
      { level: 2, item: q('dx-5', 'Si E > 0, ΔG es…', [{ text: 'negativa', correct: true }, { text: 'positiva', note: 'ΔG = −nFE.' }, { text: 'cero', note: 'ΔG = 0 solo en el equilibrio.' }], { concept: 'ele.dg', explain: 'Signo opuesto.', slide: 28 }) },
      { level: 3, item: q('dx-6', 'Q para Zn(s) + Cu²⁺ → Zn²⁺ + Cu(s) es', [{ text: '[Zn²⁺]/[Cu²⁺]', correct: true }, { text: '[Cu²⁺]/[Zn²⁺]', note: 'Productos arriba.', misconception: 'ele-q' }, { text: '[Zn²⁺][Cu]/[Cu²⁺][Zn]', note: 'Los sólidos puros no entran.' }], { concept: 'ele.nernst', explain: 'Productos/reactivos sin sólidos.', slide: 30 }) },
      { level: 3, item: q('dx-7', 'Una celda de concentración con Cu²⁺ 0,01 M y Cu²⁺ 1 M tiene E°cel =', [{ text: '0 V', correct: true }, { text: '0,34 V', note: 'Ese es E°(Cu²⁺/Cu); E°cel = cátodo − ánodo = 0.' }, { text: '1,10 V', note: 'Eso es la pila Zn–Cu.' }], { concept: 'ele.nernst', explain: 'Mismo electrodo: E° = 0; el voltaje sale de Nernst.', slide: 62 }) }
    ] }
  };
})();
