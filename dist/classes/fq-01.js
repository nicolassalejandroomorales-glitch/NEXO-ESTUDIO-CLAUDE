/* Fisicoquímica II · PEP 1 · Equilibrio químico (miércoles 21 de octubre).
   Fuentes: clases 1–3 "Equilibrio Químico" (Dr. Eduardo Pino, USACH 2S2026), Guía 1 "Reacciones químicas y equilibrio químico",
   ejercicios de la clase 1 (Dr. Daniel Zúñiga-Núñez) y Atkins, "Química Física", temas 6A–6B (en el Drive del curso).
   Las diapositivas son en su mayoría imágenes: "slide" apunta a la clase o la guía de donde sale cada idea (ver slides abajo).
   Números de la guía recalculados en Python (docs/clase-fq-01/SPEC.md). */
(() => {
  'use strict';
  const SRC = 'catedra-fq';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  const num = (id, prompt, answer, unit, extra = {}) => ({ id, type: 'number', prompt, answer, unit, tol: 0.02, source: SRC, ...extra });
  const spot = (id, prompt, steps, wrong, fix, extra = {}) => ({ id, type: 'spot', prompt, steps, wrong, fix, source: SRC, ...extra });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['fq-01'] = {
    id: 'fq-01',
    subject: 'fisico',
    title: 'Equilibrio químico',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Equilibrio Químico · clases 1–3, Guía 1 y ejercicios de la clase 1', author: 'Dr. Eduardo Pino · Dr. Daniel Zúñiga-Núñez',
        detail: 'Fisicoquímica II, Química y Farmacia, USACH, 2S 2026', authority: 'Material oficial del curso' }
    },
    misconceptions: {
      'dg-vs-dg0': { label: 'Confundiste ΔrG con ΔrG°', why: '**ΔrG°** es un número fijo (todo en estado estándar) y decide K. **ΔrG** depende de la mezcla en ese momento (de Q) y decide hacia dónde va la reacción **ahora**. Un ΔrG° positivo no impide que la reacción avance si Q es muy chico.',
        prereq: { title: 'ΔrG = ΔrG° + RT ln Q', mission: 'm2', block: 'm2b1' }, base: 'base.termo',
        check: q('fix-dg', 'Caso corto: una reacción tiene ΔrG° = +10 kJ/mol. Si en la mezcla Q es muchísimo menor que K, ¿qué pasa?', [
          { text: 'Avanza hacia productos: ΔrG es negativo mientras Q < K', correct: true },
          { text: 'No ocurre: ΔrG° positivo la prohíbe', note: 'ΔrG° positivo solo dice que K < 1. Con Q < K, ΔrG = RT ln(Q/K) es negativo.' },
          { text: 'Va hacia reactivos', note: 'Hacia reactivos va cuando Q > K.' }], { concept: 'eq.q-k', explain: 'ΔrG = RT ln(Q/K): si Q < K, el logaritmo es negativo y la reacción avanza hacia productos, aunque ΔrG° sea positivo.', slide: 5 }) },
      'k-sign': { label: 'Invertiste el signo entre ΔrG° y K', why: 'Como ΔrG° = −RT ln K: si ΔrG° < 0, ln K > 0 y **K > 1** (gana productos). Si ΔrG° > 0, K < 1.',
        prereq: { title: 'ΔrG° = −RT ln K', mission: 'm2', block: 'm2b2' }, base: 'base.logs' },
      'q-k-direction': { label: 'Te equivocaste de dirección con Q y K', why: 'La reacción va hacia donde Q se acerca a K. Si **Q < K** faltan productos: avanza hacia la derecha. Si **Q > K** sobran productos: retrocede.',
        prereq: { title: 'Q contra K', mission: 'm2', block: 'm2b1' }, base: 'base.termo' },
      'celsius': { label: 'Usaste °C en vez de kelvin', why: 'En RT ln K y en van\'t Hoff la temperatura va **siempre en kelvin**: T(K) = T(°C) + 273,15. Con °C los números no tienen sentido (y a 0 °C dividirías por cero).',
        prereq: { title: 'Unidades: kelvin, J y kJ', mission: 'm2', block: 'm2b2' }, base: 'base.logs' },
      'kj-j': { label: 'Mezclaste kJ con J', why: 'R = 8,314 **J**/(mol·K). Si ΔG° está en kJ/mol, pásalo a J/mol (× 1000) antes de dividir por RT. Si no, el exponente sale 1000 veces más chico.',
        prereq: { title: 'Unidades: kelvin, J y kJ', mission: 'm2', block: 'm2b2' }, base: 'base.logs' },
      'avance-coef': { label: 'Olvidaste el coeficiente en el grado de avance', why: 'Cada especie cambia **νᵢ·ξ**, no ξ. En 2A → B, si ξ = 0,30 mol se gastan 2 × 0,30 = 0,60 mol de A y se forman 0,30 mol de B.',
        prereq: { title: 'El grado de avance ξ', mission: 'm1', block: 'm1b1' }, base: 'base.gases' },
      'solids-in-k': { label: 'Pusiste un sólido o un líquido puro en K', why: 'Los sólidos y líquidos puros tienen **actividad 1**: no aparecen en K. En CaCO₃(s) ⇌ CaO(s) + CO₂(g), K = p(CO₂)/p°.',
        prereq: { title: 'Equilibrios heterogéneos', mission: 'm3', block: 'm3b2' }, base: 'base.gases' },
      'dn-count': { label: 'Contaste mal Δn', why: 'En Kp = Kc(RT)^Δn, Δn es (moles de **gas** de productos) − (moles de **gas** de reactivos). Sólidos y líquidos no cuentan.',
        prereq: { title: 'Kp y Kc', mission: 'm3', block: 'm3b1' }, base: 'base.gases' },
      'inert-shift': { label: 'Creíste que el gas inerte mueve el equilibrio', why: 'A **volumen constante**, agregar argón no cambia las presiones parciales de los que reaccionan: Q no cambia y el equilibrio no se mueve. (A presión constante sí puede, porque el volumen crece.)',
        prereq: { title: 'Presión, inertes y catalizadores', mission: 'm4', block: 'm4b2' }, base: 'base.gases' },
      'catalyst-shift': { label: 'Creíste que el catalizador cambia K', why: 'El catalizador acelera la ida **y** la vuelta por igual: llegas antes al equilibrio, pero al **mismo** equilibrio. K solo cambia con la temperatura.',
        prereq: { title: 'Presión, inertes y catalizadores', mission: 'm4', block: 'm4b2' }, base: 'base.termo' },
      'vh-sign': { label: 'Te equivocaste con la temperatura y K', why: 'Van\'t Hoff: si la reacción es **exotérmica** (ΔH° < 0), subir T **baja** K. Si es endotérmica, subir T sube K. (Le Châtelier: el calor es como un "producto" en la exotérmica.)',
        prereq: { title: 'Van\'t Hoff', mission: 'm4', block: 'm4b1' }, base: 'base.termo' },
      'gamma-ignored': { label: 'Ignoraste los coeficientes de actividad', why: 'Con gases reales o iones, la constante verdadera usa **actividades**: K = Kγ · Kp (o Kγ · Km). Si γ ≠ 1, K y Kp no son iguales.',
        prereq: { title: 'Fugacidad y actividad', mission: 'm4', block: 'm4b3' }, base: 'base.gases' }
    },
    goal: {
      total: 100, text: 'Asegurar los 50 puntos de Equilibrio químico de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P1', label: 'Grado de avance y ΔrG', points: 10, missions: ['m1'] },
        { id: 'P2', label: 'Q, K y ΔrG° (dirección y espontaneidad)', points: 15, missions: ['m2'] },
        { id: 'P3', label: 'Kp, Kc y equilibrios heterogéneos', points: 10, missions: ['m3'] },
        { id: 'P4', label: 'Temperatura, presión y actividad', points: 15, missions: ['m4'] }
      ],
      rest: [{ label: 'Electrolitos, equilibrio iónico y electroquímico', points: 50, note: 'clase en preparación (sin diapositivas aún)' }]
    },
    glossary: [
      { term: 'Grado de avance (ξ)', mission: 'm1', def: 'Variable que mide cuánto ha avanzado una reacción: nᵢ = nᵢ,₀ + νᵢ ξ, con νᵢ negativo para reactivos y positivo para productos. Se mide en mol.',
        simple: 'Un contador de "cuántas veces" ha ocurrido la reacción tal como está escrita.', simpler: 'Como contar cuántas tortas horneaste: cada torta gasta 2 huevos y te da 1 torta, aunque no sepas cuántos huevos tenías.' },
      { term: 'Energía de Gibbs de reacción (ΔrG)', mission: 'm1', def: 'Pendiente de G frente a ξ a p y T constantes: ΔrG = (∂G/∂ξ)p,T = Σ νᵢ μᵢ. Negativa: la reacción directa es espontánea; cero: equilibrio.',
        simple: 'Hacia dónde "cae" la reacción en ese momento.', simpler: 'Como una pelota en un valle: rueda hacia abajo y se queda quieta en el fondo (el equilibrio).' },
      { term: 'Cociente de reacción (Q)', mission: 'm2', def: 'Misma expresión que K pero con las actividades (presiones relativas o concentraciones) de la mezcla en ese momento, no necesariamente en equilibrio.',
        simple: 'La "foto" de la mezcla ahora, escrita como si fuera K.', simpler: 'La nota que llevas a mitad de semestre, comparada con la nota final (K).' },
      { term: 'Constante de equilibrio (K)', mission: 'm2', def: 'Valor de Q en el equilibrio. Depende solo de la temperatura: ΔrG° = −RT ln K.',
        simple: 'Cómo queda la mezcla cuando ya no cambia.', simpler: 'El punto donde la balanza queda quieta: depende de qué tan pesados son los lados, no de cómo los pusiste.' },
      { term: 'Estado estándar', mission: 'm2', def: 'Gases a p° = 1 bar; solutos a 1 mol/kg (o 1 mol/L); sólidos y líquidos puros. ΔrG° es la diferencia de Gibbs entre productos y reactivos puros en ese estado.',
        simple: 'Las condiciones de referencia para comparar.', simpler: 'Como medir a todos los corredores en la misma pista.' },
      { term: 'Kp y Kc', mission: 'm3', def: 'K escrita con presiones parciales (Kp) o con concentraciones molares (Kc). Para gases ideales: Kp = Kc (c°RT/p°)^Δn.',
        simple: 'La misma constante, medida en presiones o en concentraciones.', simpler: 'Como medir la misma distancia en metros o en pies.' },
      { term: 'Equilibrio heterogéneo', mission: 'm3', def: 'Equilibrio con especies en distintas fases. Sólidos y líquidos puros tienen actividad 1 y no aparecen en K.',
        simple: 'Mezclas de sólido + gas (o líquido): los puros no cuentan en K.', simpler: 'En una fiesta, los que están fijos en sus sillas (los sólidos) no cambian la cuenta de quién baila.' },
      { term: 'Ecuación de van\'t Hoff', mission: 'm4', def: 'ln(K₂/K₁) = −(ΔrH°/R)(1/T₂ − 1/T₁), suponiendo ΔrH° constante en el intervalo.',
        simple: 'Cómo cambia K cuando cambias la temperatura.', simpler: 'Calentar favorece al lado que "absorbe" calor.' },
      { term: 'Fugacidad y actividad', mission: 'm4', def: 'Fugacidad f = γ p: la "presión efectiva" de un gas real. Actividad a = γ m/m° (o f/p°): la concentración efectiva. Con ellas, K es la verdadera constante termodinámica.',
        simple: 'Cuánto "actúa" de verdad una sustancia, no cuánto hay.', simpler: 'En un vagón de metro lleno, cada persona avanza menos de lo que "debería": su efecto real es menor que su número.' }
    ],
    concepts: [
      { id: 'base.termo', title: 'Espontaneidad: ΔG = ΔH − TΔS', root: true },
      { id: 'base.gases', title: 'Moles, fracción molar y presión parcial', root: true },
      { id: 'base.logs', title: 'Logaritmos, kelvin y unidades', root: true },
      { id: 'eq.avance', mission: 'm1', title: 'Grado de avance ξ', needs: ['base.gases'] },
      { id: 'eq.drg', mission: 'm1', title: 'ΔrG: la pendiente que decide', needs: ['base.termo'] },
      { id: 'eq.q-k', mission: 'm2', title: 'Q contra K: hacia dónde va', needs: ['eq.drg'] },
      { id: 'eq.k-dg', mission: 'm2', title: 'ΔrG° = −RT ln K', needs: ['base.logs', 'base.termo'] },
      { id: 'eq.kp-kc', mission: 'm3', title: 'Kp, Kc y Δn', needs: ['base.gases'] },
      { id: 'eq.hetero', mission: 'm3', title: 'Equilibrios heterogéneos', needs: ['eq.kp-kc'] },
      { id: 'eq.lechatelier', mission: 'm4', title: 'Presión, inertes y catalizadores', needs: ['eq.q-k'] },
      { id: 'eq.vanthoff', mission: 'm4', title: 'Temperatura: van\'t Hoff', needs: ['eq.k-dg'] },
      { id: 'eq.actividad', mission: 'm4', title: 'Fugacidad, actividad y Kγ', needs: ['eq.kp-kc'] }
    ],
    curiosities: [
      { text: 'Fritz Haber y Robert Le Rossignol armaron el primer equipo para producir amoníaco a partir de N₂ e H₂. Hoy ese equilibrio alimenta, vía fertilizantes, a cerca de la mitad de la humanidad.', slide: 2 },
      { text: 'Muchos fármacos salen de la petroquímica por cadenas de equilibrios: benceno → cumeno → fenol → ácido salicílico → aspirina.', slide: 2 },
      { text: 'Los diagramas que muestran qué especie predomina según pH y potencial no se dibujan a mano: se calculan con K y Nernst desde bases de datos de ΔG y E°.', slide: 3 },
      { text: 'Una reacción con ΔrG° = +10 kJ/mol a 298 K tiene K = 0,018: pequeña, pero con suficiente reactivo igual se obtiene una cantidad apreciable de producto.', slide: 5 }
    ],
    slideImages: {},
    slides: {
      1: { title: 'Clase 1 · Introducción y programación (Pino)', bullets: ['PEP 1: miércoles 21 de octubre · equilibrio químico, iónico y electroquímico', 'Reacciones: termodinámica y cinética', 'Condiciones: temperatura, presión, solvente, pH, fuerza iónica'] },
      2: { title: 'Clase 2 · Grado de avance y energía de Gibbs de reacción', bullets: ['dnA = −dξ, dnB = +dξ', 'ΔrG = (∂G/∂ξ)p,T; en el equilibrio μA = μB', 'ΔrG < 0: directa espontánea; ΔrG > 0: inversa espontánea; ΔrG = 0: equilibrio', 'Ejercicios: 2A → B (ξ = 0,30 mol; Δξ = 0,051 mol)'] },
      3: { title: 'Clase 2 · Gases ideales: Q y K', bullets: ['μᵢ = μᵢ° + RT ln(pᵢ/p°)', 'ΔrG = ΔrG° + RT ln Q', 'En el equilibrio: ΔrG° = −RT ln Kp', 'K no depende de las concentraciones iniciales (a T fija)'] },
      4: { title: 'Clase 2 · Tabla de Kp y Kc', bullets: ['N₂ + 3H₂ ⇌ 2NH₃: Kp = 6,03 × 10⁵ a 298 K y 4,47 × 10⁻⁵ a 723 K', 'CO + H₂O ⇌ CO₂ + H₂ a 1000 K: Kp = Kc = 1,40 (Δn = 0)', 'CH₄ + H₂O ⇌ CO + 3H₂ a 1000 K: Kp = 35,5; Kc = 5,25 × 10⁻³'] },
      5: { title: 'Clase 3 · Análisis de ΔrG°: ΔH y ΔS', bullets: ['ΔrG° < 0 → K > 1; ΔrG° > 0 → K < 1', 'Ejemplo: ΔrG° = 10 kJ/mol a 298 K → K = 0,018', 'En una endotérmica, subir T aumenta la población de productos (Boltzmann)'] },
      6: { title: 'Clase 3 · Gases reales: fugacidad', bullets: ['fᵢ = γᵢ pᵢ', 'K = Kγ · Kp', 'A baja presión γ ≈ 1 y K ≈ Kp'] },
      7: { title: 'Clase 3 · Equilibrio en solución', bullets: ['Soluciones ideales: Km con m° = 1 mol/kg; Kc con c° = 1 M', 'No ideales: se usa la actividad aᵢ = γᵢ mᵢ/m°'] },
      8: { title: 'Clase 3 · Equilibrio heterogéneo', bullets: ['CaCO₃(s) ⇌ CaO(s) + CO₂(g)', 'Sólidos y líquidos puros: a = 1', 'K = p(CO₂)/p°'] },
      9: { title: 'Guía 1 · Reacciones químicas y equilibrio químico', bullets: ['Grado de avance, ΔrG°, K a dos temperaturas, Kp y Kc', 'Glucosa + HPO₄²⁻ → glucosa-6-fosfato en el citoplasma (310 K)', 'NH₄Cl(s), CH₄ → C + 2H₂, coeficientes de actividad en la síntesis de NH₃'] },
      10: { title: 'Ejercicios clase 1 (Zúñiga-Núñez)', bullets: ['nᵢ = nᵢ,₀ + νᵢ ξ', 'El equilibrio no es solo "velocidades iguales": es el mínimo de G', 'Kp y K con coeficientes de actividad (720 K)'] }
    },
    missions: [
      {
        id: 'm1', title: 'La pendiente que decide', subtitle: 'Grado de avance ξ y ΔrG', minutes: 20, slides: '2, 10', pep: 'P1: grado de avance y energía de Gibbs de reacción',
        stages: {
          hook: { title: 'Una reacción que "rueda" hasta un valle', sage: 'Toda reacción a p y T constantes es como una pelota en un cerro: baja mientras puede y se detiene en el fondo. Hoy aprendemos a medir dónde está la pelota (ξ) y hacia dónde rueda (ΔrG).',
            text: 'En la síntesis industrial de amoníaco (Haber) no se convierte todo el N₂ e H₂: la mezcla se detiene en el **equilibrio**, el fondo del valle de energía de Gibbs. Para saber cuánto se forma hay que poder contar el avance y saber hacia dónde va.' },
          diagnostic: [
            q('m1-d1', 'En la reacción 2A → B, si el grado de avance es ξ = 0,5 mol, ¿cuántos moles de A se gastaron?', [
              { text: '1,0 mol', correct: true }, { text: '0,5 mol', misconception: 'avance-coef' }, { text: '0,25 mol', note: 'Dividiste por 2: es al revés, A tiene coeficiente 2 y se gasta el doble.' }],
              { concept: 'eq.avance', explain: 'nA = nA,₀ − 2ξ: se gastan 2 × 0,5 = 1,0 mol de A.', slide: 10 }),
            q('m1-d2', 'Si ΔrG < 0 en cierto punto de la reacción, entonces en ese punto…', [
              { text: 'La reacción directa es espontánea', correct: true }, { text: 'La reacción está en equilibrio', note: 'En el equilibrio ΔrG = 0.' }, { text: 'La reacción inversa es espontánea', note: 'Eso ocurre cuando ΔrG > 0.' }],
              { concept: 'eq.drg', explain: 'ΔrG es la pendiente de G frente a ξ: si es negativa, avanzar (aumentar ξ) baja G, así que la reacción directa es espontánea.', slide: 2 })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.termo', title: 'Desde cero: G baja en lo espontáneo', slide: 2, body: 'A **presión y temperatura constantes**, un proceso ocurre solo (es espontáneo) si la energía de Gibbs del sistema **baja**: dG < 0. Cuando G llega a su mínimo, ya no hay cambio neto: eso es el **equilibrio**.',
              deeper: 'Piensa en G como la "altura" del sistema. Lo espontáneo siempre va cerro abajo. Al fondo del valle, cualquier paso para un lado o para el otro sube G: por eso ahí se queda. En química, "el fondo del valle" es la mezcla de equilibrio.' }
          ],
          explain: [],
          transfer: [
            num('m1-t1', 'Estilo PEP (Guía 1, ej. 1): para 2A → B se parte con 1,75 mol de A y 0,12 mol de B. ¿Cuántos moles de A quedan cuando ξ = 0,30 mol?', 1.15, 'mol',
              { concept: 'eq.avance', label: 'n(A)', slide: 9, traps: [{ value: 1.45, note: 'Restaste ξ sin multiplicar por el coeficiente 2.', misconception: 'avance-coef' }],
                solution: ['nA = nA,₀ + νA ξ, con νA = −2', 'nA = 1,75 − 2(0,30) = 1,15 mol', '(Y nB = 0,12 + 0,30 = 0,42 mol)'], explain: 'nA = 1,75 − 2 × 0,30 = 1,15 mol.' }),
            num('m1-t2', 'Estilo PEP (Guía 1, ej. 1B): cuando 2A → B avanza Δξ = 0,051 mol, la energía de Gibbs del sistema cambia −2,41 kJ. Estima ΔrG en ese punto.', -47.3, 'kJ/mol',
              { concept: 'eq.drg', label: 'ΔrG', slide: 2, traps: [{ value: -0.123, note: 'Multiplicaste en vez de dividir: ΔrG ≈ ΔG/Δξ.' }, { value: 47.3, note: 'El signo: G bajó, así que ΔrG es negativo.' }],
                solution: ['ΔrG = (∂G/∂ξ) ≈ ΔG/Δξ', 'ΔrG ≈ −2,41 kJ / 0,051 mol = −47,3 kJ/mol', 'Negativo: la reacción directa sigue siendo espontánea'], explain: 'ΔrG ≈ ΔG/Δξ = −2,41/0,051 = −47,3 kJ/mol.' }),
            write('m1-w1', 'Enséñale a tu compañero: ¿por qué una reacción se detiene antes de convertir todo, si "le conviene" formar productos?', 'Porque a p y T constantes la reacción avanza mientras G baja, es decir, mientras ΔrG (la pendiente de G frente a ξ) es negativo. Al mezclarse reactivos y productos, ΔrG cambia con la composición y se hace cero antes de terminar: ese punto es el mínimo de G, el equilibrio.',
              ['La reacción avanza mientras G baja (ΔrG < 0)', 'ΔrG cambia con la composición (depende de la mezcla)', 'El equilibrio es el mínimo de G, donde ΔrG = 0'],
              { concept: 'eq.drg', explain: 'La clave es que ΔrG depende de la composición: se anula en el mínimo de G.', slide: 2, teach: true,
                keywords: [{ label: 'G baja / disminuye', any: ['baja', 'disminu', 'minimo', 'mínimo'] }, { label: 'composición o mezcla', any: ['composici', 'mezcla', 'concentraci'] }, { label: 'ΔrG = 0', any: ['cero', '= 0', 'equilibrio'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **contar el avance con ξ**.',
            pretest: q('m1-pre1', 'Adivina antes: en N₂ + 3H₂ → 2NH₃, si ξ = 1 mol, ¿cuánto H₂ se gastó?', [{ text: '3 mol', correct: true }, { text: '1 mol', note: 'Cada "vuelta" de la reacción gasta 3 H₂.' }, { text: '2 mol', note: '2 es el coeficiente del NH₃, que se forma.' }],
              { concept: 'eq.avance', explain: 'Cada vez que la reacción ocurre una vez (ξ = 1 mol) se gastan 3 mol de H₂.', slide: 10 }),
            explain: [
              { id: 'm1b1', concept: 'eq.avance', title: 'El grado de avance ξ', slide: 10, body: 'Para cualquier especie: **nᵢ = nᵢ,₀ + νᵢ ξ**. El coeficiente νᵢ es **negativo para reactivos** y **positivo para productos**. ξ se mide en mol y es el mismo para todas las especies: por eso sirve para "contar" la reacción entera con un solo número.',
                deeper: 'Ejemplo: 2A → B con 1,75 mol de A y 0,12 mol de B. Si ξ = 0,30 mol: A cambia −2 × 0,30 = −0,60 (queda 1,15 mol) y B cambia +1 × 0,30 = +0,30 (queda 0,42 mol). Un solo ξ, cada especie con su coeficiente.' }
            ],
            practice: [
              num('m1-p1', 'En 2A → B con nA,₀ = 2,00 mol y nB,₀ = 0, ¿cuántos moles de B hay cuando ξ = 0,40 mol?', 0.40, 'mol',
                { concept: 'eq.avance', label: 'n(B)', slide: 10, hint: 'νB = +1: nB = 0 + 1 × ξ.', traps: [{ value: 0.8, note: 'B tiene coeficiente 1: se forma ξ, no 2ξ.', misconception: 'avance-coef' }], solution: ['nB = nB,₀ + νB ξ = 0 + 0,40'], explain: 'nB = 0 + 1 × 0,40 = 0,40 mol.' }),
              classify('m1-p2', 'Para N₂ + 3H₂ → 2NH₃, ¿qué signo tiene cada coeficiente ν?', [['neg', 'ν negativo (se gasta)'], ['pos', 'ν positivo (se forma)']],
                [['n2', 'N₂ (ν = −1)', 'neg'], ['h2', 'H₂ (ν = −3)', 'neg'], ['nh3', 'NH₃ (ν = +2)', 'pos']], { concept: 'eq.avance', explain: 'Reactivos con ν negativo; productos con ν positivo.', slide: 10, hint: '¿Se gasta o se forma?' }),
              spot('m1-fx1', 'Un aprendiz resolvió: "2A → B, nA,₀ = 1,75 mol, ξ = 0,30 mol". ¿En qué paso se equivocó?', ['nA = nA,₀ + νA ξ', 'Como νA = −1: nA = 1,75 − 0,30', 'nA = 1,45 mol'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'νA = −2: nA = 1,75 − 0,60 = 1,15 mol', correct: true }, { text: 'νA = +2: nA = 1,75 + 0,60', note: 'A se gasta: ν es negativo.' }] },
                { concept: 'eq.avance', slide: 9, stepNotes: { 0: 'La fórmula está bien.', 2: 'Sale de usar mal el coeficiente en el paso anterior.' }, explain: 'El coeficiente de A es 2: νA = −2.', hint: 'Mira el coeficiente de A en la ecuación.' })
            ],
            rule: { title: 'Regla del sabio: contar con ξ', concept: 'eq.avance', steps: ['Escribe νᵢ con signo: − para reactivos, + para productos', 'nᵢ = nᵢ,₀ + νᵢ ξ para cada especie', 'Revisa que ninguna cantidad quede negativa'] } },
          { id: 'r2', intro: 'Parte 2: **ΔrG, la pendiente que decide**.',
            pretest: q('m1-pre2', 'Adivina antes: en el fondo del "valle" de G (el equilibrio), ¿cuánto vale la pendiente ΔrG?', [{ text: 'Cero', correct: true }, { text: 'Es muy negativa', note: 'Muy negativa es lejos del fondo, cuando aún falta avanzar.' }, { text: 'Es igual a ΔrG°', note: 'ΔrG° es un número fijo; ΔrG cambia con la mezcla.' }],
              { concept: 'eq.drg', explain: 'En el mínimo de una curva, la pendiente es cero: ΔrG = 0.', slide: 2 }),
            explain: [
              { id: 'm1b2', concept: 'eq.drg', title: 'ΔrG = (∂G/∂ξ)p,T', slide: 2, body: 'La energía de Gibbs de reacción es la **pendiente** de G al avanzar: **ΔrG = (∂G/∂ξ)p,T = Σ νᵢ μᵢ**. Si ΔrG < 0, avanzar baja G: la directa es **espontánea**. Si ΔrG > 0, la inversa lo es. Si ΔrG = 0, estás en el **equilibrio** (μA = μB en A ⇌ B).',
                deeper: 'Mira la curva G vs ξ: parte bajando, llega a un mínimo y vuelve a subir. La pendiente cambia porque los potenciales químicos μᵢ dependen de la composición. Para un cambio pequeño se puede estimar ΔrG ≈ ΔG/Δξ (ejercicio de la guía: −2,41 kJ / 0,051 mol ≈ −47 kJ/mol).' }
            ],
            practice: [
              q('m1-p3', 'Una reacción con ΔrG > 0 en este momento…', [{ text: 'Avanza en la dirección inversa', correct: true }, { text: 'No ocurre en ninguna dirección', note: 'Sí ocurre: la inversa es la espontánea.' }, { text: 'Está en equilibrio', note: 'Equilibrio es ΔrG = 0.' }],
                { concept: 'eq.drg', explain: 'ΔrG > 0: subir ξ aumenta G, así que lo espontáneo es bajar ξ (reacción inversa).', slide: 2, hint: 'G siempre baja en lo espontáneo.' }),
              num('m1-p4', 'Si una reacción avanza Δξ = 0,020 mol y G del sistema cambia −0,90 kJ, ¿cuánto vale ΔrG aproximadamente?', -45, 'kJ/mol',
                { concept: 'eq.drg', label: 'ΔrG', slide: 2, hint: 'ΔrG ≈ ΔG/Δξ.', traps: [{ value: 45, note: 'G bajó: el signo es negativo.' }], solution: ['ΔrG ≈ −0,90 kJ / 0,020 mol', '= −45 kJ/mol'], explain: '−0,90/0,020 = −45 kJ/mol.' }),
              order('m1-p5', 'Ordena lo que pasa al avanzar una reacción que parte solo con reactivos:', [['a', 'ΔrG muy negativo: avanza rápido hacia productos'], ['b', 'ΔrG se hace menos negativo al formarse productos'], ['c', 'ΔrG = 0: equilibrio (mínimo de G)']], ['a', 'b', 'c'],
                { concept: 'eq.drg', direction: 'Del inicio al equilibrio.', explain: 'La pendiente se va aplanando hasta anularse en el mínimo.', slide: 2, hint: 'Piensa en la pelota bajando el cerro.' })
            ],
            rule: { title: 'Regla del sabio: el signo de ΔrG', concept: 'eq.drg', steps: ['ΔrG < 0 → la directa es espontánea', 'ΔrG > 0 → la inversa es espontánea', 'ΔrG = 0 → equilibrio (mínimo de G)'] } }
        ]
      },
      {
        id: 'm2', title: 'Q contra K', subtitle: 'Hacia dónde va y cuánto se forma: ΔrG° = −RT ln K', minutes: 25, slides: '3, 5, 9', pep: 'P2: dirección, espontaneidad y K desde ΔrG°',
        stages: {
          hook: { title: '¿Ocurre en tu célula una reacción "no espontánea"?', sage: 'La guía pregunta algo genial: la glucosa + fosfato → glucosa-6-fosfato no es espontánea en condiciones estándar. ¿Y dentro de la célula? Para saberlo hay que comparar Q con K.',
            text: 'En el citoplasma a 310 K: [glucosa] = 4,5 × 10⁻² M, [HPO₄²⁻] = 2,7 × 10⁻³ M, [glucosa-6-fosfato] = 1,6 × 10⁻⁴ M y K = 5,5 × 10⁻³. Al final de esta misión vas a calcular si avanza (spoiler: la célula necesita ATP para hacerla).' },
          diagnostic: [
            q('m2-d1', 'Si en una mezcla Q < K, la reacción…', [{ text: 'Avanza hacia productos', correct: true }, { text: 'Retrocede hacia reactivos', misconception: 'q-k-direction' }, { text: 'Está en equilibrio', note: 'Equilibrio es Q = K.' }],
              { concept: 'eq.q-k', explain: 'Con Q < K faltan productos: la reacción avanza hasta que Q = K.', slide: 3 }),
            q('m2-d2', 'Si ΔrG° < 0, entonces K es…', [{ text: 'Mayor que 1', correct: true }, { text: 'Menor que 1', misconception: 'k-sign' }, { text: 'Igual a 0', note: 'K nunca es cero.' }],
              { concept: 'eq.k-dg', explain: 'ln K = −ΔrG°/RT > 0 → K > 1.', slide: 5 })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.logs', title: 'Desde cero: ln, e y unidades', slide: 5, body: '**ln** es el logaritmo natural: ln K = x significa K = eˣ. Si x > 0, K > 1; si x < 0, K < 1. En RT ln K, **R = 8,314 J/(mol·K)** y **T en kelvin** (T = °C + 273,15). Si ΔG° viene en kJ/mol, pásalo a J/mol.',
              deeper: 'Truco: ln 10 ≈ 2,303. Así, K = 10ⁿ ↔ ln K = 2,303 n. Ejemplo: ΔrG° = −10 kJ/mol a 298 K → ln K = 10 000 / (8,314 × 298) ≈ 4,04 → K ≈ e⁴·⁰⁴ ≈ 57.' }
          ],
          explain: [],
          transfer: [
            num('m2-t1', 'Estilo PEP (Guía 1, ej. 4): glucosa + HPO₄²⁻ → glucosa-6-fosfato + H₂O a 310 K, con [glucosa] = 4,5 × 10⁻² M, [HPO₄²⁻] = 2,7 × 10⁻³ M, [G6P] = 1,6 × 10⁻⁴ M y K = 5,5 × 10⁻³. Calcula ΔrG en el citoplasma (el agua tiene actividad 1).', 14.1, 'kJ/mol',
              { concept: 'eq.q-k', label: 'ΔrG', slide: 9, tol: 0.03, traps: [{ value: -14.1, note: 'El signo: Q (1,32) es mayor que K, así que ΔrG es positivo.', misconception: 'q-k-direction' }, { value: 14119, note: 'Bien el número, pero en J/mol: pásalo a kJ/mol.' }],
                solution: ['Q = [G6P] / ([glucosa][HPO₄²⁻]) = 1,6 × 10⁻⁴ / (4,5 × 10⁻² × 2,7 × 10⁻³) = 1,32', 'ΔrG = RT ln(Q/K) = 8,314 × 310 × ln(1,32 / 5,5 × 10⁻³)', 'ΔrG ≈ +14,1 kJ/mol → no ocurre espontáneamente (la célula la acopla al ATP)'], explain: 'Q = 1,32 > K: ΔrG = RT ln(Q/K) ≈ +14,1 kJ/mol.' }),
            num('m2-t2', 'Estilo PEP (Guía 1, ej. 2): para CH₄(g) + 3Cl₂(g) → CHCl₃(l) + 3HCl(g), con ΔfG°: CHCl₃(l) = −73,7; HCl(g) = −95,30; CH₄(g) = −50,72 kJ/mol. Calcula ΔrG° a 298 K.', -308.9, 'kJ/mol',
              { concept: 'eq.k-dg', label: 'ΔrG°', slide: 9, traps: [{ value: -118.28, note: 'Olvidaste multiplicar el HCl por su coeficiente 3.' }, { value: 308.9, note: 'Es productos menos reactivos, no al revés.' }],
                solution: ['ΔrG° = Σ ν ΔfG°(productos) − Σ ν ΔfG°(reactivos)', '= [−73,7 + 3(−95,30)] − [−50,72 + 3(0)]', '= −308,9 kJ/mol (el Cl₂ es elemento: ΔfG° = 0) → K ≈ 1,3 × 10⁵⁴'], explain: 'ΔrG° = −359,6 + 50,72 = −308,9 kJ/mol.' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿qué diferencia hay entre ΔrG y ΔrG°, y cuál decide si la reacción avanza ahora?', 'ΔrG° es fijo (reactivos y productos en estado estándar) y decide el valor de K mediante ΔrG° = −RT ln K. ΔrG depende de la mezcla actual a través de Q: ΔrG = ΔrG° + RT ln Q = RT ln(Q/K). El que decide si avanza ahora es ΔrG: si Q < K es negativo y avanza hacia productos.',
              ['ΔrG° es fijo y determina K (ΔrG° = −RT ln K)', 'ΔrG depende de la mezcla: ΔrG = ΔrG° + RT ln Q', 'El que decide la dirección ahora es ΔrG (comparar Q con K)'],
              { concept: 'eq.q-k', explain: 'ΔrG = RT ln(Q/K).', slide: 3, teach: true,
                keywords: [{ label: 'K y ΔrG°', any: ['ln k', 'constante'] }, { label: 'Q / la mezcla', any: ['q', 'mezcla', 'cociente'] }, { label: 'dirección', any: ['direcci', 'avanza', 'espont'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **Q contra K**.',
            pretest: q('m2-pre1', 'Adivina antes: si tienes "demasiados" productos para el equilibrio, ¿hacia dónde va la reacción?', [{ text: 'Hacia reactivos', correct: true }, { text: 'Hacia productos', note: 'Si ya sobran productos, formar más aleja del equilibrio.' }, { text: 'No se mueve', note: 'Se mueve hasta que Q = K.' }],
              { concept: 'eq.q-k', explain: 'Demasiados productos = Q > K: retrocede.', slide: 3 }),
            explain: [
              { id: 'm2b1', concept: 'eq.q-k', title: 'ΔrG = ΔrG° + RT ln Q', slide: 3, body: 'Para gases ideales μᵢ = μᵢ° + RT ln(pᵢ/p°), y sumando con los coeficientes: **ΔrG = ΔrG° + RT ln Q**. En el equilibrio ΔrG = 0 y Q = K, así que **ΔrG = RT ln(Q/K)**: si **Q < K**, ΔrG < 0 y avanza; si **Q > K**, retrocede; si **Q = K**, equilibrio.',
                deeper: 'Q se escribe igual que K (productos arriba, reactivos abajo, cada uno elevado a su coeficiente, con presiones relativas pᵢ/p° o concentraciones cᵢ/c°), pero con los valores de **ahora**. Compararlo con K te dice qué falta: Q chico = faltan productos.' }
            ],
            practice: [
              q('m2-p1', 'N₂ + 3H₂ ⇌ 2NH₃ a 723 K tiene K = 4,47 × 10⁻⁵. Si en una mezcla Q = 1,0 × 10⁻³, ¿qué pasa?', [{ text: 'Se descompone NH₃ (va hacia reactivos)', correct: true }, { text: 'Se forma más NH₃', misconception: 'q-k-direction' }, { text: 'Está en equilibrio', note: 'Q ≠ K.' }],
                { concept: 'eq.q-k', explain: 'Q = 1,0 × 10⁻³ > K = 4,47 × 10⁻⁵: hay más NH₃ del de equilibrio y retrocede.', slide: 4, hint: 'Compara: ¿Q es mayor o menor que K?' }),
              num('m2-p2', 'Para A(g) ⇌ 2B(g), p(A) = 0,50 bar y p(B) = 0,20 bar (p° = 1 bar). Calcula Q.', 0.08, '',
                { concept: 'eq.q-k', label: 'Q', slide: 3, hint: 'Q = (p_B/p°)² / (p_A/p°).', traps: [{ value: 0.4, note: 'Falta elevar p(B) a su coeficiente 2.' }, { value: 12.5, note: 'Productos van arriba, reactivos abajo.' }], solution: ['Q = (0,20)² / 0,50', '= 0,040 / 0,50 = 0,080'], explain: 'Q = 0,20²/0,50 = 0,080.' }),
              match('m2-p3', 'Une cada situación con lo que hace la reacción:', [['Q < K', 'Avanza hacia productos'], ['Q > K', 'Retrocede hacia reactivos'], ['Q = K', 'Equilibrio: no hay cambio neto']],
                { concept: 'eq.q-k', explain: 'ΔrG = RT ln(Q/K).', slide: 3, hint: 'El signo de ln(Q/K).' })
            ],
            rule: { title: 'Regla del sabio: Q contra K', concept: 'eq.q-k', steps: ['Escribe Q como K, pero con los valores de ahora', 'Q < K → avanza; Q > K → retrocede; Q = K → equilibrio', 'Si piden cuánto: ΔrG = RT ln(Q/K), T en kelvin'] } },
          { id: 'r2', intro: 'Parte 2: **ΔrG° = −RT ln K**.',
            pretest: q('m2-pre2', 'Adivina antes: una reacción con ΔrG° = +10 kJ/mol a 298 K, ¿forma algo de producto?', [{ text: 'Sí: K ≈ 0,018, poco pero algo', correct: true }, { text: 'No, nada', misconception: 'dg-vs-dg0' }, { text: 'Sí, casi todo', note: 'ΔrG° > 0 → K < 1.' }],
              { concept: 'eq.k-dg', explain: 'K = e^(−10000/(8,314 × 298)) ≈ 0,018: pequeña, no cero.', slide: 5 }),
            explain: [
              { id: 'm2b2', concept: 'eq.k-dg', title: 'De ΔrG° a K', slide: 5, body: 'En el equilibrio: **ΔrG° = −RT ln K**, o sea **K = e^(−ΔrG°/RT)**. ΔrG° < 0 → K > 1 (gana productos); ΔrG° > 0 → K < 1. ΔrG° se calcula con tablas: **ΔrG° = Σν ΔfG°(productos) − Σν ΔfG°(reactivos)** (los elementos en su forma estable tienen ΔfG° = 0).',
                deeper: 'Pasos seguros: (1) ΔrG° en J/mol; (2) T en K; (3) divide −ΔrG° por (8,314 × T); (4) e elevado a eso. Con −308,9 kJ/mol a 298 K: ln K = 308 900 / 2479 = 124,6 → K ≈ 10⁵⁴ (prácticamente completa).' }
            ],
            practice: [
              num('m2-p4', 'Calcula K a 298 K para una reacción con ΔrG° = −5,0 kJ/mol.', 7.52, '',
                { concept: 'eq.k-dg', label: 'K', slide: 5, tol: 0.03, hint: 'K = e^(−ΔrG°/RT), con ΔrG° en J/mol.', traps: [{ value: 0.133, note: 'El signo: ΔrG° negativo da K > 1.', misconception: 'k-sign' }, { value: 1.002, note: 'Usaste kJ en vez de J.', misconception: 'kj-j' }],
                  solution: ['ln K = 5000 / (8,314 × 298) = 2,018', 'K = e^2,018 ≈ 7,5'], explain: 'ln K = 2,02 → K ≈ 7,5.' }),
              num('m2-p5', 'Una reacción tiene K = 1,0 × 10⁻³ a 298 K. Calcula ΔrG°.', 17.1, 'kJ/mol',
                { concept: 'eq.k-dg', label: 'ΔrG°', slide: 5, hint: 'ΔrG° = −RT ln K. ln(10⁻³) = −6,91.', traps: [{ value: -17.1, note: 'K < 1 → ΔrG° positivo.', misconception: 'k-sign' }, { value: 17115, note: 'Bien, pero en J/mol: pásalo a kJ/mol.' }],
                  solution: ['ΔrG° = −8,314 × 298 × ln(1,0 × 10⁻³)', '= −2477,6 × (−6,908) = 17 115 J/mol ≈ 17,1 kJ/mol'], explain: '+17,1 kJ/mol.' }),
              classify('m2-p6', 'Clasifica cada reacción según su K a 298 K:', [['big', 'K > 1'], ['small', 'K < 1']],
                [['a', 'ΔrG° = −20 kJ/mol', 'big'], ['b', 'ΔrG° = +15 kJ/mol', 'small'], ['c', 'ΔrG° = −0,5 kJ/mol', 'big'], ['d', 'ΔrG° = +3 kJ/mol', 'small']],
                { concept: 'eq.k-dg', explain: 'ΔrG° negativo → K > 1; positivo → K < 1. El tamaño solo cambia cuánto.', slide: 5, hint: 'Mira solo el signo.' }),
              q('m2-p7', 'Al calcular K desde ΔrG° = −308,9 kJ/mol a 298 K, alguien obtuvo ln K = 0,1246. ¿Qué error cometió?', [{ text: 'Dejó ΔrG° en kJ/mol en vez de J/mol', correct: true, }, { text: 'Usó la temperatura en kelvin', note: 'Eso está bien.' }, { text: 'Cambió el signo', note: 'El signo salió bien (positivo).', misconception: 'k-sign' }],
                { concept: 'eq.k-dg', explain: 'Con J/mol: ln K = 308 900 / (8,314 × 298) = 124,6, mil veces más.', slide: 5, hint: 'Compara 0,1246 con 124,6.' })
            ],
            rule: { title: 'Regla del sabio: de ΔrG° a K', concept: 'eq.k-dg', steps: ['ΔrG° = Σν ΔfG°(prod) − Σν ΔfG°(react), elementos = 0', 'Pasa a J/mol y T a kelvin', 'K = e^(−ΔrG°/RT): negativo → K > 1'] } }
        ]
      },
      {
        id: 'm3', title: 'Kp, Kc y sólidos', subtitle: 'La misma K en presiones o concentraciones, y qué no entra', minutes: 20, slides: '4, 7, 8', pep: 'P3: Kp, Kc, Δn y equilibrios heterogéneos',
        stages: {
          hook: { title: 'La cal y el CO₂', sage: 'Al calentar piedra caliza (CaCO₃) se libera CO₂ y queda cal (CaO). En el equilibrio, ¿de qué depende? Solo de la presión de CO₂: los sólidos no cuentan.',
            text: 'Este equilibrio heterogéneo se usa en hornos de cal y explica por qué las tabletas efervescentes y los antiácidos de carbonato liberan CO₂. Hoy aprendemos a escribir K bien (sin sólidos) y a pasar entre Kp y Kc.' },
          diagnostic: [
            q('m3-d1', 'Para CaCO₃(s) ⇌ CaO(s) + CO₂(g), K es:', [{ text: 'p(CO₂)/p°', correct: true }, { text: '[CaO][CO₂]/[CaCO₃]', misconception: 'solids-in-k' }, { text: '1/p(CO₂)', note: 'El CO₂ es producto: va arriba.' }],
              { concept: 'eq.hetero', explain: 'Sólidos puros tienen actividad 1: K = p(CO₂)/p°.', slide: 8 }),
            q('m3-d2', 'En N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ¿cuánto vale Δn?', [{ text: '−2', correct: true }, { text: '+2', note: 'Es productos menos reactivos: 2 − 4.' }, { text: '0', misconception: 'dn-count' }],
              { concept: 'eq.kp-kc', explain: 'Δn = 2 − (1 + 3) = −2.', slide: 4 })
          ],
          fundamentals: [
            { id: 'm3f1', concept: 'base.gases', title: 'Desde cero: presión parcial', slide: 3, body: 'En una mezcla de gases ideales, cada gas aporta su **presión parcial**: **pᵢ = xᵢ · P**, donde xᵢ = nᵢ/n_total es su fracción molar. Además pᵢ = cᵢRT (con c en mol/L).',
              deeper: 'Ejemplo: 1 mol de N₂ y 3 mol de H₂ a P = 4 bar → x(N₂) = 0,25 → p(N₂) = 1 bar; p(H₂) = 3 bar. Las fracciones suman 1 y las presiones parciales suman P.' }
          ],
          explain: [],
          transfer: [
            num('m3-t1', 'Estilo PEP (clase 3): 0,20 mol de CO₂ con exceso de grafito llegan a C(s) + CO₂(g) ⇌ 2CO(g). La masa molar promedio del gas es 35 g/mol y P = 11 atm. Calcula Kp.', 7.96, 'atm',
              { concept: 'eq.hetero', label: 'Kp', slide: 8, tol: 0.03, traps: [{ value: 0.723, note: 'Elevaste mal: x(CO) va al cuadrado y multiplicado por P (Δn = +1).' }],
                solution: ['M = 28 x(CO) + 44 (1 − x(CO)) = 35 → x(CO) = 0,5625; x(CO₂) = 0,4375', 'El grafito es sólido: no entra en K', 'Kp = (x_CO P)² / (x_CO₂ P) = 0,5625² × 11 / 0,4375 ≈ 7,96 atm'], explain: 'Kp ≈ 7,96 atm.' }),
            num('m3-t2', 'Estilo PEP: CH₄(g) + H₂O(g) ⇌ CO(g) + 3H₂(g) tiene Kc = 5,25 × 10⁻³ a 1000 K (c en mol/L). Calcula Kp en bar (R = 0,08314 L·bar/(mol·K)).', 36.3, 'bar²',
              { concept: 'eq.kp-kc', label: 'Kp', slide: 4, tol: 0.03, traps: [{ value: 7.6e-7, note: 'Δn es +2, no −2: dividiste en vez de multiplicar.', misconception: 'dn-count' }, { value: 0.436, note: 'Δn = 4 − 2 = +2: falta elevar (RT) al cuadrado.', misconception: 'dn-count' }],
                solution: ['Δn = (1 + 3) − (1 + 1) = +2', 'Kp = Kc (RT)^Δn = 5,25 × 10⁻³ × (0,08314 × 1000)²', 'Kp ≈ 36,3 (la tabla de la clase da 35,5 con atm)'], explain: 'Kp = Kc(RT)² ≈ 36,3.' }),
            write('m3-w1', 'Enséñale a tu compañero: ¿por qué el CaCO₃ y el CaO no aparecen en la K de su equilibrio?', 'Porque K se escribe con actividades, y un sólido (o líquido) puro tiene actividad 1: su "concentración efectiva" no cambia aunque haya más o menos cantidad. Por eso K = p(CO₂)/p°: solo depende del gas.',
              ['K se escribe con actividades', 'Sólidos y líquidos puros tienen actividad 1', 'Solo queda el gas: K = p(CO₂)/p°'],
              { concept: 'eq.hetero', explain: 'a(sólido puro) = 1.', slide: 8, teach: true, keywords: [{ label: 'actividad', any: ['actividad'] }, { label: 'vale 1', any: ['1', 'uno'] }, { label: 'presión de CO₂', any: ['co2', 'co₂', 'presi'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **Kp y Kc**.',
            pretest: q('m3-pre1', 'Adivina antes: para CO + H₂O ⇌ CO₂ + H₂, ¿Kp y Kc son iguales?', [{ text: 'Sí, porque Δn = 0', correct: true }, { text: 'No, nunca son iguales', note: 'Cuando Δn = 0 son iguales.' }, { text: 'Depende de la presión', note: 'K no depende de la presión.' }],
              { concept: 'eq.kp-kc', explain: 'Δn = 2 − 2 = 0 → Kp = Kc (1,40 a 1000 K en la tabla).', slide: 4 }),
            explain: [
              { id: 'm3b1', concept: 'eq.kp-kc', title: 'Kp = Kc(RT)^Δn', slide: 4, body: 'Como pᵢ = cᵢRT para gases ideales: **Kp = Kc (RT)^Δn**, donde **Δn = moles de gas de productos − moles de gas de reactivos**. Si Δn = 0, Kp = Kc. Usa R = 0,08314 L·bar/(mol·K) para p en bar (o 0,08206 L·atm/(mol·K) para atm).',
                deeper: 'Ejemplo de la tabla: CH₄ + H₂O ⇌ CO + 3H₂ a 1000 K tiene Δn = +2: Kp = 5,25 × 10⁻³ × (0,0821 × 1000)² ≈ 35,4. Si Δn es negativo, RT queda dividiendo.' }
            ],
            practice: [
              q('m3-p1', '¿Cuánto vale Δn para 2SO₂(g) + O₂(g) ⇌ 2SO₃(g)?', [{ text: '−1', correct: true }, { text: '+1', note: 'Productos menos reactivos: 2 − 3.' }, { text: '0', misconception: 'dn-count' }],
                { concept: 'eq.kp-kc', explain: 'Δn = 2 − (2 + 1) = −1.', slide: 4, hint: 'Cuenta moles de gas a cada lado.' }),
              num('m3-p2', 'Para 2NO₂(g) ⇌ N₂O₄(g) a 298 K, Kc = 214 (c en mol/L). Calcula Kp en atm⁻¹ (R = 0,08206 L·atm/(mol·K)).', 8.75, 'atm⁻¹',
                { concept: 'eq.kp-kc', label: 'Kp', slide: 4, tol: 0.03, hint: 'Δn = 1 − 2 = −1.', traps: [{ value: 5233, note: 'Δn es −1: RT divide, no multiplica.', misconception: 'dn-count' }],
                  solution: ['Δn = −1', 'Kp = Kc / (RT) = 214 / (0,08206 × 298)', 'Kp ≈ 8,75 (la tabla da 8,83)'], explain: 'Kp = 214 / 24,45 ≈ 8,75.' }),
              order('m3-p3', 'Ordena los pasos para pasar de Kc a Kp:', [['a', 'Escribir la reacción solo con los gases'], ['b', 'Calcular Δn = n(gas, productos) − n(gas, reactivos)'], ['c', 'Elegir R según la unidad de presión'], ['d', 'Kp = Kc (RT)^Δn']], ['a', 'b', 'c', 'd'],
                { concept: 'eq.kp-kc', direction: 'Primero lo primero.', explain: 'Sin Δn no hay conversión.', slide: 4, hint: 'Lo último es la fórmula.' })
            ],
            rule: { title: 'Regla del sabio: Kp y Kc', concept: 'eq.kp-kc', steps: ['Δn solo con gases: productos − reactivos', 'Kp = Kc (RT)^Δn, T en kelvin', 'R = 0,08314 (bar) o 0,08206 (atm) L/(mol·K)'] } },
          { id: 'r2', intro: 'Parte 2: **equilibrios heterogéneos**.',
            pretest: q('m3-pre2', 'Adivina antes: si agregas más CaCO₃(s) a un horno en equilibrio, ¿cambia la presión de CO₂?', [{ text: 'No', correct: true }, { text: 'Sí, aumenta', misconception: 'solids-in-k' }, { text: 'Sí, disminuye', note: 'El sólido no entra en Q.' }],
              { concept: 'eq.hetero', explain: 'El sólido tiene actividad 1: agregar más no cambia Q ni el equilibrio.', slide: 8 }),
            explain: [
              { id: 'm3b2', concept: 'eq.hetero', title: 'Sólidos y líquidos puros: a = 1', slide: 8, body: 'K se escribe con **actividades**. Para sólidos y líquidos **puros**, a = 1: no aparecen en K. CaCO₃(s) ⇌ CaO(s) + CO₂(g) → **K = p(CO₂)/p°**. NH₄Cl(s) ⇌ NH₃(g) + HCl(g) → **K = p(NH₃)p(HCl)/p°²**. Ojo: el agua sí aparece si es un soluto o un gas, no cuando es el solvente puro.',
                deeper: 'Con NH₄Cl a 427 °C la presión de vapor es 608 kPa: cada gas aporta la mitad (304 kPa = 3,04 bar) → K = 3,04² ≈ 9,24. Ese es el ejercicio 5 de la guía.' }
            ],
            practice: [
              classify('m3-p4', 'Para C(s) + H₂O(g) ⇌ CO(g) + H₂(g), ¿qué aparece en K?', [['in', 'Aparece en K'], ['out', 'No aparece (actividad 1)']],
                [['c', 'C(s)', 'out'], ['h2o', 'H₂O(g)', 'in'], ['co', 'CO(g)', 'in'], ['h2', 'H₂(g)', 'in']], { concept: 'eq.hetero', explain: 'Solo el carbono sólido queda fuera.', slide: 8, hint: '¿Quién es sólido puro?' }),
              num('m3-p5', 'NH₄Cl(s) ⇌ NH₃(g) + HCl(g): a cierta T la presión total del gas es 2,00 bar. Calcula K (p° = 1 bar).', 1.0, '',
                { concept: 'eq.hetero', label: 'K', slide: 9, hint: 'Se forman NH₃ y HCl en igual cantidad: cada uno es la mitad de la presión total.', traps: [{ value: 4, note: 'Cada gas aporta la mitad: 1,00 bar, no 2,00.' }, { value: 2, note: 'K es el producto de las dos presiones parciales.' }],
                  solution: ['p(NH₃) = p(HCl) = 2,00 / 2 = 1,00 bar', 'K = 1,00 × 1,00 = 1,0'], explain: 'K = (1,00)(1,00) = 1,0.' }),
              spot('m3-fx1', 'Un aprendiz escribió K para CaCO₃(s) ⇌ CaO(s) + CO₂(g). ¿En qué paso se equivocó?', ['K = productos / reactivos con actividades', 'K = a(CaO) · a(CO₂) / a(CaCO₃)', 'Como hay más CaCO₃ que CaO, K < p(CO₂)'], 2,
                { question: '¿Cómo se corrige?', options: [{ text: 'Los sólidos tienen a = 1: K = p(CO₂)/p°', correct: true }, { text: 'Hay que usar las masas de los sólidos', note: 'Las masas no entran: a = 1.', misconception: 'solids-in-k' }] },
                { concept: 'eq.hetero', slide: 8, stepNotes: { 0: 'Correcto.', 1: 'Correcto como paso intermedio.' }, explain: 'a(CaCO₃) = a(CaO) = 1.', hint: '¿Cuánto vale la actividad de un sólido puro?' })
            ],
            rule: { title: 'Regla del sabio: qué entra en K', concept: 'eq.hetero', steps: ['Gases: pᵢ/p°; solutos: cᵢ/c°', 'Sólidos y líquidos puros (y el solvente): actividad 1, no se escriben', 'Revisa Δn contando solo gases'] } }
        ]
      },
      {
        id: 'm4', title: 'Temperatura, presión y actividad', subtitle: 'Van\'t Hoff, Le Châtelier y gases reales', minutes: 25, slides: '5, 6, 9', pep: 'P4: K a otra temperatura, perturbaciones y actividad',
        stages: {
          hook: { title: 'El dilema de Haber', sage: 'N₂ + 3H₂ ⇌ 2NH₃ es exotérmica: a 298 K, K ≈ 6 × 10⁵, pero a 723 K, K ≈ 4 × 10⁻⁵. ¿Por qué la industria trabaja caliente si K es mucho menor?',
            text: 'Porque a baja temperatura la reacción es lentísima. Se calienta para que sea rápida (con catalizador de hierro) y se compensa con **alta presión**, que favorece el lado con menos moles de gas. Aquí verás las tres palancas: temperatura, presión y actividad.' },
          diagnostic: [
            q('m4-d1', 'Para una reacción exotérmica, si subes la temperatura, K…', [{ text: 'Disminuye', correct: true }, { text: 'Aumenta', misconception: 'vh-sign' }, { text: 'No cambia', note: 'K sí depende de T.' }],
              { concept: 'eq.vanthoff', explain: 'Van\'t Hoff: con ΔH° < 0, subir T baja K.', slide: 5 }),
            q('m4-d2', 'Agregar un catalizador a una mezcla en equilibrio…', [{ text: 'No cambia la composición de equilibrio', correct: true }, { text: 'Aumenta K', misconception: 'catalyst-shift' }, { text: 'Desplaza hacia productos', misconception: 'catalyst-shift' }],
              { concept: 'eq.lechatelier', explain: 'El catalizador acelera ida y vuelta por igual.', slide: 2 })
          ],
          fundamentals: [
            { id: 'm4f1', concept: 'base.termo', title: 'Desde cero: ΔG° = ΔH° − TΔS°', slide: 5, body: '**ΔG° = ΔH° − TΔS°**. ΔH° < 0 (exotérmica) ayuda; ΔS° > 0 (más desorden) ayuda, y pesa más a alta T. Como ΔG° = −RT ln K, el efecto de T sobre K depende del signo de **ΔH°**.',
              deeper: 'Ejemplo de la guía (ej. 6): CH₄ → C(s) + 2H₂ con ΔH° = +74,85 kJ/mol y ΔS° = +80,67 J/(mol·K): ΔG° = 74 850 − 298,15 × 80,67 = +50,8 kJ/mol → K ≈ 1,3 × 10⁻⁹ a 25 °C. Al ser endotérmica, a 50 °C K sube a ≈ 1,3 × 10⁻⁸.' }
          ],
          explain: [],
          transfer: [
            num('m4-t1', 'Estilo PEP (Guía 1, ej. 6): CH₄(g) → C(s) + 2H₂(g) tiene K = 1,26 × 10⁻⁹ a 25 °C y ΔH° = +74,85 kJ/mol (constante). Calcula K a 50 °C.', 1.30e-8, '',
              { concept: 'eq.vanthoff', label: 'K₂', slide: 9, tol: 0.04, traps: [{ value: 1.22e-10, note: 'Te equivocaste de signo: es endotérmica, subir T aumenta K.', misconception: 'vh-sign' }],
                solution: ['ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁)', '= −(74 850 / 8,314)(1/323,15 − 1/298,15) = +2,34', 'K₂ = 1,26 × 10⁻⁹ × e^2,34 ≈ 1,30 × 10⁻⁸'], explain: 'K₂ ≈ 1,3 × 10⁻⁸.' }),
            num('m4-t2', 'Estilo PEP (Guía 1, ej. 7): N₂ + 3H₂ → 2NH₃ a 720 K con p(NH₃) = 321 atm, p(N₂) = 70 atm, p(H₂) = 209 atm y γ: NH₃ = 0,782, N₂ = 1,266, H₂ = 1,243. Calcula la constante termodinámica K = Kγ·Kp.', 4.06e-5, '',
              { concept: 'eq.actividad', label: 'K', slide: 9, tol: 0.03, traps: [{ value: 1.61e-4, note: 'Ese es Kp: falta multiplicar por Kγ.', misconception: 'gamma-ignored' }],
                solution: ['Kp = 321² / (70 × 209³) = 1,61 × 10⁻⁴', 'Kγ = 0,782² / (1,266 × 1,243³) = 0,252', 'K = Kγ·Kp ≈ 4,06 × 10⁻⁵'], explain: 'K ≈ 4,1 × 10⁻⁵.' }),
            write('m4-w1', 'Enséñale a tu compañero: en la síntesis de NH₃ (exotérmica), ¿por qué la industria usa alta presión y un catalizador, aunque trabaje a temperatura alta?', 'Subir T baja K porque la reacción es exotérmica, pero se necesita T alta para que sea rápida. La alta presión desplaza el equilibrio hacia el lado con menos moles de gas (2 NH₃ frente a 4 de reactivos), compensando. El catalizador no cambia K ni el equilibrio: solo hace que se llegue antes.',
              ['Exotérmica: subir T baja K (van\'t Hoff)', 'Alta presión favorece el lado con menos moles de gas', 'El catalizador acelera pero no cambia K'],
              { concept: 'eq.lechatelier', explain: 'Tres palancas: T (cambia K), P (cambia Q), catalizador (solo velocidad).', slide: 5, teach: true,
                keywords: [{ label: 'temperatura y K', any: ['temperatura', 'exot'] }, { label: 'presión y moles', any: ['presi', 'moles', 'mol'] }, { label: 'catalizador', any: ['cataliz'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **temperatura (van\'t Hoff)**.',
            pretest: q('m4-pre1', 'Adivina antes: una reacción endotérmica (ΔH° > 0), al calentarla…', [{ text: 'K aumenta', correct: true }, { text: 'K disminuye', misconception: 'vh-sign' }, { text: 'K no cambia', note: 'K solo depende de T, y aquí T cambia.' }],
              { concept: 'eq.vanthoff', explain: 'El calor actúa como "reactivo": calentar favorece productos.', slide: 5 }),
            explain: [
              { id: 'm4b1', concept: 'eq.vanthoff', title: 'Van\'t Hoff', slide: 5, body: 'Si ΔrH° es constante en el intervalo: **ln(K₂/K₁) = −(ΔrH°/R)(1/T₂ − 1/T₁)**. Endotérmica (ΔH° > 0): subir T **sube** K. Exotérmica: subir T **baja** K. Explicación de la clase: al calentar, la distribución de Boltzmann puebla más los niveles del lado de mayor energía.',
                deeper: 'Truco para no perderse: (1/T₂ − 1/T₁) es negativo si calientas. Con ΔH° > 0, −(ΔH°/R) × (negativo) = positivo → K₂ > K₁. Y siempre T en kelvin, ΔH° en J/mol.' }
            ],
            practice: [
              num('m4-p1', 'Una reacción tiene K = 10 a 300 K y ΔH° = −50 kJ/mol. Calcula K a 350 K.', 0.567, '',
                { concept: 'eq.vanthoff', label: 'K₂', slide: 5, tol: 0.03, hint: 'Exotérmica: K debe bajar.', traps: [{ value: 176.4, note: 'Signo cambiado: exotérmica + calentar = K baja.', misconception: 'vh-sign' }],
                  solution: ['ln(K₂/10) = −(−50 000 / 8,314)(1/350 − 1/300)', '= 6014 × (−4,76 × 10⁻⁴) = −2,86', 'K₂ = 10 × e^−2,86 ≈ 0,57'], explain: 'K₂ ≈ 0,57.' }),
              q('m4-p2', 'N₂ + 3H₂ ⇌ 2NH₃: K = 6,0 × 10⁵ a 298 K y 4,5 × 10⁻⁵ a 723 K. ¿Qué dice esto de ΔH°?', [{ text: 'Es negativo (exotérmica)', correct: true }, { text: 'Es positivo', misconception: 'vh-sign' }, { text: 'Es cero', note: 'Si fuera cero, K no cambiaría con T.' }],
                { concept: 'eq.vanthoff', explain: 'K baja al calentar → exotérmica.', slide: 4, hint: '¿K sube o baja al calentar?' }),
              spot('m4-fx1', 'Un aprendiz usó van\'t Hoff de 25 °C a 50 °C. ¿En qué paso se equivocó?', ['ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁)', 'Reemplazo: 1/T₂ − 1/T₁ = 1/50 − 1/25', 'Con ΔH° en J/mol calculo K₂'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'T en kelvin: 1/323,15 − 1/298,15', correct: true }, { text: 'Cambiar el signo de ΔH°', note: 'El signo estaba bien; el error son los °C.', misconception: 'vh-sign' }] },
                { concept: 'eq.vanthoff', slide: 5, stepNotes: { 0: 'La ecuación está bien.', 2: 'Bien, pero arrastra el error de las temperaturas.' }, explain: 'En termodinámica T va siempre en kelvin.', hint: '¿En qué unidad va T?', misconception: 'celsius' })
            ],
            rule: { title: 'Regla del sabio: van\'t Hoff', concept: 'eq.vanthoff', steps: ['T en kelvin; ΔH° en J/mol', 'ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁)', 'Chequeo: endotérmica + calentar → K sube'] } },
          { id: 'r2', intro: 'Parte 2: **presión, gases inertes y catalizadores**.',
            pretest: q('m4-pre2', 'Adivina antes: si comprimes N₂ + 3H₂ ⇌ 2NH₃ a T constante, ¿qué pasa con K?', [{ text: 'No cambia; cambia Q y se forma más NH₃', correct: true }, { text: 'K aumenta', note: 'K solo depende de T.' }, { text: 'Se forma menos NH₃', note: 'Comprimir favorece el lado con menos moles de gas.' }],
              { concept: 'eq.lechatelier', explain: 'Comprimir cambia Q (no K): el sistema responde formando el lado con menos moles de gas.', slide: 3 }),
            explain: [
              { id: 'm4b2', concept: 'eq.lechatelier', title: 'Qué mueve el equilibrio y qué no', slide: 3, body: '**Presión** (a T fija): K no cambia, pero Q sí. Si aumentas P, se favorece el lado con **menos moles de gas** (Kx = Kp · P^−Δn). **Gas inerte a V constante**: no cambia las presiones parciales → no se mueve. **Catalizador**: no cambia K ni la composición, solo la rapidez. **Temperatura**: es lo único que cambia K.',
                deeper: 'Kx = Kp · (P/p°)^(−Δn). En la síntesis de NH₃, Δn = −2: Kx = Kp · P², así que al subir P las fracciones molares de NH₃ crecen. Con Δn = 0, la presión no mueve nada.' }
            ],
            practice: [
              classify('m4-p3', '¿Qué hace cada cambio sobre N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (exotérmica)?', [['right', 'Más NH₃'], ['left', 'Menos NH₃'], ['none', 'No cambia el equilibrio']],
                [['p', 'Aumentar la presión total', 'right'], ['t', 'Calentar', 'left'], ['cat', 'Agregar catalizador de Fe', 'none'], ['ar', 'Agregar Ar a volumen constante', 'none']],
                { concept: 'eq.lechatelier', explain: 'Presión → lado con menos gas; calentar exotérmica → izquierda; catalizador e inerte a V constante → nada.', slide: 3, hint: 'Solo T cambia K.' }),
              q('m4-p4', 'Para H₂(g) + I₂(g) ⇌ 2HI(g), duplicar la presión total…', [{ text: 'No desplaza el equilibrio (Δn = 0)', correct: true }, { text: 'Forma más HI', note: 'Hay 2 moles de gas a cada lado.' }, { text: 'Forma más H₂', note: 'Hay 2 moles de gas a cada lado.' }],
                { concept: 'eq.lechatelier', explain: 'Con Δn = 0, Kx = Kp: la presión no cambia la composición.', slide: 3, hint: 'Cuenta moles de gas a cada lado.' }),
              order('m4-p5', 'Ordena de MENOR a MAYOR fracción de NH₃ en el equilibrio (misma mezcla inicial):', [['a', '723 K y 1 bar'], ['b', '723 K y 200 bar'], ['c', '298 K y 200 bar']], ['a', 'b', 'c'],
                { concept: 'eq.lechatelier', direction: 'De menor a mayor NH₃.', explain: 'Alta P y baja T (exotérmica) dan más NH₃.', slide: 4, hint: 'Presión alta ayuda; temperatura alta perjudica.' })
            ],
            rule: { title: 'Regla del sabio: las palancas del equilibrio', concept: 'eq.lechatelier', steps: ['Solo la temperatura cambia K', 'Presión: favorece el lado con menos moles de gas', 'Inerte a V constante y catalizador: no mueven el equilibrio'] } },
          { id: 'r3', intro: 'Parte 3: **fugacidad y actividad**.',
            pretest: q('m4-pre3', 'Adivina antes: a presiones muy altas, ¿un gas "actúa" como si tuviera exactamente su presión?', [{ text: 'No: su efecto real (fugacidad) es distinto', correct: true }, { text: 'Sí, siempre', misconception: 'gamma-ignored' }, { text: 'Solo si es noble', note: 'Cualquier gas real se desvía a presión alta.' }],
              { concept: 'eq.actividad', explain: 'Los gases reales se desvían: f = γp.', slide: 6 }),
            explain: [
              { id: 'm4b3', concept: 'eq.actividad', title: 'Fugacidad y actividad', slide: 6, body: 'Para gases reales: **fᵢ = γᵢ pᵢ** (fugacidad = presión "efectiva"). Para solutos no ideales: **aᵢ = γᵢ mᵢ/m°**. La constante verdadera usa actividades: **K = Kγ · Kp**, con Kγ escrito como K pero con los γ. A baja presión (o soluciones diluidas), γ ≈ 1 y K ≈ Kp.',
                deeper: 'En la síntesis de NH₃ a 720 K y cientos de atm (guía, ej. 7): Kp = 1,61 × 10⁻⁴ y Kγ = 0,782² / (1,266 × 1,243³) = 0,252 → K = 4,06 × 10⁻⁵. Si ignoras γ te equivocas por un factor de 4.' }
            ],
            practice: [
              num('m4-p6', 'Para A(g) ⇌ B(g) a alta presión, Kp = 2,0, γ(A) = 1,25 y γ(B) = 0,80. Calcula K.', 1.28, '',
                { concept: 'eq.actividad', label: 'K', slide: 6, hint: 'Kγ = γB / γA.', traps: [{ value: 2, note: 'Ese es Kp: falta Kγ.', misconception: 'gamma-ignored' }, { value: 3.125, note: 'Invertiste Kγ: productos arriba.' }],
                  solution: ['Kγ = 0,80 / 1,25 = 0,64', 'K = Kγ·Kp = 0,64 × 2,0 = 1,28'], explain: 'K = 1,28.' }),
              match('m4-p7', 'Une cada símbolo con lo que significa:', [['f = γp', 'Fugacidad de un gas real'], ['a = γm/m°', 'Actividad de un soluto'], ['γ ≈ 1', 'Comportamiento casi ideal (baja P o muy diluido)']],
                { concept: 'eq.actividad', explain: 'γ corrige lo ideal hacia lo real.', slide: 7, hint: 'γ es el "factor de corrección".' }),
              q('m4-p8', '¿Cuándo es razonable aproximar K ≈ Kp?', [{ text: 'A presiones bajas, donde γ ≈ 1', correct: true }, { text: 'A presiones muy altas', note: 'Ahí γ se aleja de 1.' }, { text: 'Nunca', note: 'A baja presión la aproximación es buena.' }],
                { concept: 'eq.actividad', explain: 'A baja presión el gas es casi ideal.', slide: 6, hint: '¿Cuándo un gas es casi ideal?' })
            ],
            rule: { title: 'Regla del sabio: actividad', concept: 'eq.actividad', steps: ['Gas real: f = γp; soluto: a = γm/m°', 'K = Kγ · Kp (Kγ con los γ elevados a sus coeficientes)', 'Si γ ≈ 1 (baja P, diluido), K ≈ Kp'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.termo', title: 'Espontaneidad', subtitle: 'ΔG = ΔH − TΔS y qué significa el signo', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.termo', title: 'ΔG = ΔH − TΔS', slide: 5, body: 'A p y T constantes, un proceso es espontáneo si **ΔG < 0**. **ΔG = ΔH − TΔS**: lo exotérmico (ΔH < 0) y lo que aumenta el desorden (ΔS > 0) ayudan. Si compiten, la temperatura decide: a T alta pesa más ΔS.',
            deeper: 'Cuatro casos: ΔH < 0 y ΔS > 0 → siempre espontáneo. ΔH > 0 y ΔS < 0 → nunca. ΔH < 0 y ΔS < 0 → espontáneo a T baja. ΔH > 0 y ΔS > 0 → espontáneo a T alta (como fundir hielo).' }],
          practice: [
            num('z1-p1', 'Calcula ΔG a 298 K para un proceso con ΔH = −40 kJ/mol y ΔS = −100 J/(mol·K).', -10.2, 'kJ/mol',
              { concept: 'base.termo', label: 'ΔG', slide: 5, tol: 0.02, hint: 'Pasa ΔS a kJ: −0,100 kJ/(mol·K).', traps: [{ value: 29760, note: 'Mezclaste kJ con J: ΔS va en kJ/(mol·K) si ΔH está en kJ.', misconception: 'kj-j' }],
                solution: ['ΔG = −40 − 298 × (−0,100)', '= −40 + 29,8 = −10,2 kJ/mol'], explain: '−10,2 kJ/mol: espontáneo.' }),
            q('z1-p2', 'Un proceso con ΔH > 0 y ΔS > 0 es espontáneo…', [{ text: 'A temperatura alta', correct: true }, { text: 'A temperatura baja', note: 'A T baja domina ΔH > 0.' }, { text: 'Nunca', note: 'A T alta, TΔS supera a ΔH.' }],
              { concept: 'base.termo', explain: 'Cuando TΔS > ΔH, ΔG < 0.', slide: 5, hint: 'ΔG = ΔH − TΔS.' })
          ],
          transfer: [write('z1-w1', 'Explica con tus palabras por qué el hielo se derrite a 25 °C pero no a −10 °C.', 'Fundir hielo es endotérmico (ΔH > 0) pero aumenta el desorden (ΔS > 0). Como ΔG = ΔH − TΔS, a temperatura alta el término TΔS supera a ΔH y ΔG es negativo: se funde. A −10 °C, TΔS es menor que ΔH y ΔG es positivo.',
            ['Fundir es endotérmico y aumenta la entropía', 'ΔG = ΔH − TΔS: a T alta gana el término TΔS', 'Por eso ΔG < 0 a 25 °C y > 0 a −10 °C'],
            { concept: 'base.termo', explain: 'La temperatura decide cuando ΔH y ΔS compiten.', slide: 5, keywords: [{ label: 'entropía / desorden', any: ['entrop', 'desorden'] }, { label: 'temperatura', any: ['temperatura', 'tds'] }] })]
        } },
      { id: 'z2', concept: 'base.gases', title: 'Gases y fracciones', subtitle: 'Fracción molar, presión parcial y moles', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.gases', title: 'pᵢ = xᵢP', slide: 3, body: 'La **fracción molar** es xᵢ = nᵢ/n_total (suman 1). La **presión parcial** es pᵢ = xᵢ · P (suman P). Para gases ideales también pᵢ = nᵢRT/V = cᵢRT.',
            deeper: 'Ejemplo: 2 mol de A y 3 mol de B a 10 bar → x(A) = 0,4 → p(A) = 4 bar; p(B) = 6 bar. Siempre revisa que las presiones parciales sumen la total.' }],
          practice: [
            num('z2-p1', 'Una mezcla tiene 1,0 mol de N₂ y 3,0 mol de H₂ a P = 8,0 bar. ¿Cuánto vale p(H₂)?', 6.0, 'bar',
              { concept: 'base.gases', label: 'p(H₂)', slide: 3, hint: 'x(H₂) = 3/4.', traps: [{ value: 24, note: 'Multiplicaste los moles por P: usa la fracción molar.' }, { value: 2, note: 'Esa es la de N₂.' }], solution: ['x(H₂) = 3,0 / 4,0 = 0,75', 'p(H₂) = 0,75 × 8,0 = 6,0 bar'], explain: '6,0 bar.' }),
            q('z2-p2', 'Si x(A) = 0,25 en una mezcla de A y B, x(B) es…', [{ text: '0,75', correct: true }, { text: '0,25', note: 'Las fracciones suman 1.' }, { text: '4', note: 'Una fracción molar no puede pasar de 1.' }], { concept: 'base.gases', explain: 'x(A) + x(B) = 1.', slide: 3, hint: 'Suman 1.' })
          ],
          transfer: [write('z2-w1', 'Explica qué es la presión parcial de un gas en una mezcla.', 'Es la presión que tendría ese gas si ocupara solo todo el recipiente a la misma temperatura. Se calcula como su fracción molar por la presión total, pᵢ = xᵢP, y las presiones parciales de todos los gases suman la presión total.',
            ['Es la presión que ejercería el gas solo en el recipiente', 'pᵢ = xᵢ · P', 'Las presiones parciales suman la total'],
            { concept: 'base.gases', explain: 'pᵢ = xᵢP.', slide: 3, keywords: [{ label: 'fracción molar', any: ['fracci'] }, { label: 'suman la total', any: ['suma', 'total'] }] })]
        } },
      { id: 'z3', concept: 'base.logs', title: 'Logaritmos y unidades', subtitle: 'ln, e, kelvin, J y kJ', minutes: 6,
        stages: {
          explain: [{ id: 'z3b1', concept: 'base.logs', title: 'ln y unidades sin errores', slide: 5, body: '**ln x = y ↔ x = eʸ**. ln de algo mayor que 1 es positivo; menor que 1, negativo. **T(K) = T(°C) + 273,15**. **1 kJ = 1000 J**: con R = 8,314 J/(mol·K), las energías van en J/mol.',
            deeper: 'Atajos: ln 1 = 0; ln 10 ≈ 2,303; e¹ ≈ 2,718. Si un exponente te sale de miles, probablemente olvidaste pasar kJ a J (o al revés).' }],
          practice: [
            num('z3-p1', 'Convierte 50 °C a kelvin.', 323.15, 'K', { concept: 'base.logs', label: 'T', slide: 5, tol: 0.001, hint: 'Suma 273,15.', traps: [{ value: 50, note: 'Ese es el valor en °C.', misconception: 'celsius' }], solution: ['50 + 273,15 = 323,15 K'], explain: '323,15 K.' }),
            q('z3-p2', 'Si ln K = −2, entonces K es…', [{ text: 'Entre 0 y 1 (≈ 0,135)', correct: true }, { text: 'Negativo', note: 'eˣ siempre es positivo.' }, { text: 'Mayor que 1', note: 'ln negativo → K < 1.' }], { concept: 'base.logs', explain: 'K = e⁻² ≈ 0,135.', slide: 5, hint: 'K = e^(ln K).' })
          ],
          transfer: [write('z3-w1', 'Explica por qué en RT ln K la temperatura no puede ir en °C.', 'Porque las ecuaciones termodinámicas usan la temperatura absoluta: R está en J/(mol·K) y la escala Celsius tiene un cero arbitrario. Con °C los resultados no tienen sentido físico (a 0 °C saldría RT = 0). Hay que sumar 273,15 para pasar a kelvin.',
            ['Se usa temperatura absoluta (kelvin)', 'R está en J/(mol·K)', 'Con °C el resultado no tiene sentido (0 °C daría RT = 0)'],
            { concept: 'base.logs', explain: 'T absoluta.', slide: 5, keywords: [{ label: 'kelvin / absoluta', any: ['kelvin', 'absolut'] }, { label: '273', any: ['273'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-avance', title: 'Grado de avance', formula: 'nᵢ = nᵢ,₀ + νᵢ ξ', concepts: ['eq.avance'], vars: [['nᵢ', 'moles de la especie i', 'mol'], ['νᵢ', 'coeficiente (− reactivo, + producto)', '—'], ['ξ', 'grado de avance', 'mol']],
        what: 'Contar cuánto queda o se forma de cada especie.', when: 'Siempre que te den cantidades iniciales y cuánto avanzó la reacción.', example: '2A → B, 1,75 mol A, ξ = 0,30 → nA = 1,75 − 0,60 = 1,15 mol.', deeper: 'Un solo ξ describe a todas las especies a la vez.',
        sources: [{ label: 'Ejercicios clase 1 (Zúñiga)', slide: 10 }, { label: 'Guía 1, ej. 1', slide: 9 }],
        calc: { inputs: [{ id: 'n0', label: 'nᵢ,₀ (mol)', value: 1.75, step: 0.01 }, { id: 'nu', label: 'νᵢ', value: -2, step: 1 }, { id: 'xi', label: 'ξ (mol)', value: 0.3, step: 0.01 }], run: v => 'nᵢ = **' + (v.n0 + v.nu * v.xi).toFixed(3).replace('.', ',') + ' mol**' } },
      { id: 'f-drg', title: 'ΔrG y Q', formula: 'ΔrG = ΔrG° + RT ln Q = RT ln(Q/K)', concepts: ['eq.q-k', 'eq.drg'], vars: [['ΔrG', 'energía de Gibbs de reacción ahora', 'J/mol'], ['Q', 'cociente de reacción', '—'], ['K', 'constante de equilibrio', '—'], ['T', 'temperatura', 'K']],
        what: 'Saber hacia dónde va la reacción con la mezcla de ahora.', when: 'Cuando te dan concentraciones o presiones que no son de equilibrio.', example: 'G6P en la célula: Q = 1,32, K = 5,5 × 10⁻³, T = 310 K → ΔrG = +14,1 kJ/mol.', deeper: 'Sale de μᵢ = μᵢ° + RT ln aᵢ sumado con los coeficientes.',
        sources: [{ label: 'Clase 2 (Pino)', slide: 3 }, { label: 'Guía 1, ej. 4', slide: 9 }],
        calc: { inputs: [{ id: 'q', label: 'Q', value: 1.32, step: 0.01 }, { id: 'k', label: 'K', value: 0.0055, step: 0.0001 }, { id: 't', label: 'T (K)', value: 310, step: 1 }], run: v => { const g = 8.314 * v.t * Math.log(v.q / v.k) / 1000; return 'ΔrG = **' + g.toFixed(2).replace('.', ',') + ' kJ/mol** → ' + (g < 0 ? 'avanza hacia productos' : g > 0 ? 'va hacia reactivos' : 'equilibrio'); } } },
      { id: 'f-k', title: 'ΔrG° y K', formula: 'ΔrG° = −RT ln K', concepts: ['eq.k-dg'], vars: [['ΔrG°', 'energía de Gibbs estándar de reacción', 'J/mol'], ['R', '8,314', 'J/(mol·K)'], ['T', 'temperatura', 'K']],
        what: 'Pasar de datos de tablas (ΔfG°) a la constante de equilibrio.', when: 'Cuando te piden K o ΔrG° y tienes el otro.', example: 'ΔrG° = −5,0 kJ/mol a 298 K → K ≈ 7,5.', deeper: 'Es la condición ΔrG = 0 aplicada a ΔrG = ΔrG° + RT ln Q.',
        sources: [{ label: 'Clase 3 (Pino)', slide: 5 }, { label: 'Atkins, tema 6A', url: 'https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps' }],
        calc: { inputs: [{ id: 'g', label: 'ΔrG° (kJ/mol)', value: -5, step: 0.1 }, { id: 't', label: 'T (K)', value: 298.15, step: 1 }], run: v => { const k = Math.exp(-v.g * 1000 / (8.314 * v.t)); return 'K = **' + (k >= 1e4 || k < 1e-3 ? k.toExponential(2).replace('.', ',') : k.toFixed(4).replace('.', ',')) + '**'; } } },
      { id: 'f-kpkc', title: 'Kp y Kc', formula: 'Kp = Kc (RT)^Δn', concepts: ['eq.kp-kc', 'eq.hetero'], vars: [['Δn', 'moles de gas productos − reactivos', '—'], ['R', '0,08314 L·bar/(mol·K) o 0,08206 L·atm/(mol·K)', '—'], ['T', 'temperatura', 'K']],
        what: 'Pasar de la constante en concentraciones a la de presiones.', when: 'Solo con gases (ideales).', example: 'CH₄ + H₂O ⇌ CO + 3H₂, Kc = 5,25 × 10⁻³ a 1000 K, Δn = 2 → Kp ≈ 36.', deeper: 'Sale de pᵢ = cᵢRT.',
        sources: [{ label: 'Clase 2 (Pino), tabla', slide: 4 }, { label: 'Clase 3 (Pino)', slide: 7 }],
        calc: { inputs: [{ id: 'kc', label: 'Kc', value: 0.00525, step: 0.0001 }, { id: 'dn', label: 'Δn', value: 2, step: 1 }, { id: 't', label: 'T (K)', value: 1000, step: 1 }], run: v => 'Kp = **' + (v.kc * Math.pow(0.08314 * v.t, v.dn)).toPrecision(3).replace('.', ',') + '** (bar)' } },
      { id: 'f-vh', title: 'Van\'t Hoff', formula: 'ln(K₂/K₁) = −(ΔrH°/R)(1/T₂ − 1/T₁)', concepts: ['eq.vanthoff'], vars: [['ΔrH°', 'entalpía estándar de reacción', 'J/mol'], ['T₁, T₂', 'temperaturas', 'K']],
        what: 'K a otra temperatura.', when: 'Si ΔrH° es aproximadamente constante en el intervalo.', example: 'CH₄ → C + 2H₂: K = 1,26 × 10⁻⁹ a 25 °C → 1,3 × 10⁻⁸ a 50 °C.', deeper: 'Sale de d(ln K)/dT = ΔrH°/RT².',
        sources: [{ label: 'Clase 3 (Pino)', slide: 5 }, { label: 'Guía 1, ej. 2 y 6', slide: 9 }],
        calc: { inputs: [{ id: 'k1', label: 'K₁', value: 10, step: 0.1 }, { id: 'h', label: 'ΔrH° (kJ/mol)', value: -50, step: 1 }, { id: 't1', label: 'T₁ (K)', value: 300, step: 1 }, { id: 't2', label: 'T₂ (K)', value: 350, step: 1 }],
          run: v => 'K₂ = **' + (v.k1 * Math.exp(-(v.h * 1000 / 8.314) * (1 / v.t2 - 1 / v.t1))).toPrecision(3).replace('.', ',') + '**' } },
      { id: 'f-act', title: 'Actividad y K', formula: 'K = Kγ · Kp, con fᵢ = γᵢ pᵢ', concepts: ['eq.actividad'], vars: [['γᵢ', 'coeficiente de actividad (o fugacidad)', '—'], ['Kγ', 'producto de los γ con sus coeficientes', '—']],
        what: 'La constante termodinámica verdadera con gases reales o iones.', when: 'Presiones altas o soluciones concentradas (γ ≠ 1).', example: 'NH₃ a 720 K: Kp = 1,61 × 10⁻⁴, Kγ = 0,252 → K = 4,06 × 10⁻⁵.', deeper: 'Reemplaza presiones por fugacidades en μ = μ° + RT ln(f/p°).',
        sources: [{ label: 'Clase 3 (Pino)', slide: 6 }, { label: 'Guía 1, ej. 7', slide: 9 }] }
    ],
    recipes: [],
    mini: {
      'base.termo': { idea: 'G es la "altura" del sistema: lo espontáneo siempre baja.', steps: ['ΔG = ΔH − TΔS', 'ΔG < 0 → espontáneo', 'Si ΔH y ΔS compiten, decide T'], check: { prompt: '¿ΔH = −20 kJ/mol y ΔS = +50 J/(mol·K) es espontáneo a 298 K?', options: [{ text: 'Sí, siempre', correct: true }, { text: 'No', note: 'Ambos términos ayudan.' }], explain: 'ΔH < 0 y ΔS > 0: espontáneo a toda T.' } },
      'base.gases': { idea: 'Cada gas de una mezcla "empuja" en proporción a cuántos moles tiene.', steps: ['xᵢ = nᵢ/n_total', 'pᵢ = xᵢ P', 'Las pᵢ suman P'], check: { prompt: '2 mol A + 2 mol B a 6 bar: p(A) =', options: [{ text: '3 bar', correct: true }, { text: '6 bar', note: 'Es la mitad de las moles.' }], explain: 'x(A) = 0,5 → 3 bar.' } },
      'base.logs': { idea: 'ln y e son inversos; la temperatura siempre en kelvin; la energía en J con R = 8,314.', steps: ['T(K) = °C + 273,15', 'kJ × 1000 = J', 'ln > 0 ↔ número > 1'], check: { prompt: 'Si ln K = 0, K vale…', options: [{ text: '1', correct: true }, { text: '0', note: 'e⁰ = 1.' }], explain: 'e⁰ = 1.' } },
      'eq.avance': { idea: 'ξ cuenta cuántas veces ocurrió la reacción tal como está escrita.', steps: ['Pon signo a cada coeficiente', 'nᵢ = nᵢ,₀ + νᵢ ξ', 'Revisa que nada quede negativo'], check: { prompt: 'A + 2B → C, nB,₀ = 1,0 mol, ξ = 0,2: nB =', options: [{ text: '0,6 mol', correct: true }, { text: '0,8 mol', note: 'νB = −2.' }], explain: '1,0 − 2(0,2) = 0,6.' } },
      'eq.drg': { idea: 'ΔrG es la pendiente: dice hacia dónde baja G.', steps: ['ΔrG = (∂G/∂ξ)', 'Negativa: avanza; positiva: retrocede', 'Cero: equilibrio'], check: { prompt: 'En el mínimo de G, ΔrG es…', options: [{ text: 'Cero', correct: true }, { text: 'Negativo', note: 'Negativo es antes del mínimo.' }], explain: 'Pendiente nula en el mínimo.' } },
      'eq.q-k': { idea: 'Q es la foto de ahora; K es la meta.', steps: ['Escribe Q con los valores actuales', 'Compara con K', 'Q < K avanza; Q > K retrocede'], check: { prompt: 'Q = 5, K = 2: la reacción…', options: [{ text: 'Retrocede', correct: true }, { text: 'Avanza', note: 'Q > K: sobran productos.' }], explain: 'Q > K → hacia reactivos.' } },
      'eq.k-dg': { idea: 'Un ΔrG° muy negativo da una K enorme.', steps: ['ΔrG° en J/mol', 'ln K = −ΔrG°/RT', 'K = e^(ln K)'], check: { prompt: 'ΔrG° = 0 → K =', options: [{ text: '1', correct: true }, { text: '0', note: 'e⁰ = 1.' }], explain: 'ln K = 0 → K = 1.' } },
      'eq.kp-kc': { idea: 'Kp y Kc son la misma constante en distintas unidades.', steps: ['Δn con gases', 'Kp = Kc(RT)^Δn', 'R según la unidad'], check: { prompt: 'Si Δn = 0, Kp…', options: [{ text: '= Kc', correct: true }, { text: '= Kc · RT', note: '(RT)⁰ = 1.' }], explain: 'Δn = 0 → iguales.' } },
      'eq.hetero': { idea: 'Los sólidos y líquidos puros no cambian su "concentración": actividad 1.', steps: ['Identifica fases', 'Saca sólidos y líquidos puros', 'Escribe K con lo que queda'], check: { prompt: 'Para H₂O(l) ⇌ H₂O(g), K =', options: [{ text: 'p(H₂O)/p°', correct: true }, { text: 'p(H₂O)/[H₂O(l)]', note: 'El líquido puro tiene a = 1.' }], explain: 'K es la presión de vapor relativa.' } },
      'eq.lechatelier': { idea: 'El sistema se acomoda contra lo que le cambias, pero solo T cambia K.', steps: ['¿Cambia T? → cambia K', '¿Cambia P? → lado con menos gas', '¿Inerte a V fijo o catalizador? → nada'], check: { prompt: 'Comprimir 2NO₂ ⇌ N₂O₄ favorece…', options: [{ text: 'N₂O₄', correct: true }, { text: 'NO₂', note: 'N₂O₄ tiene menos moles de gas.' }], explain: '1 mol frente a 2.' } },
      'eq.vanthoff': { idea: 'Calentar favorece el lado que absorbe calor.', steps: ['Mira el signo de ΔH°', 'Endotérmica: K sube con T', 'Calcula con ln(K₂/K₁)'], check: { prompt: 'Exotérmica, enfrías: K…', options: [{ text: 'Aumenta', correct: true }, { text: 'Disminuye', note: 'Enfriar favorece al lado que libera calor.' }], explain: 'K sube al enfriar una exotérmica.' } },
      'eq.actividad': { idea: 'γ corrige: cuánto "actúa" de verdad cada especie.', steps: ['f = γp; a = γm/m°', 'Kγ igual que K pero con γ', 'K = Kγ · Kp'], check: { prompt: 'Si todos los γ = 1, K…', options: [{ text: '= Kp', correct: true }, { text: '= 0', note: 'Kγ = 1.' }], explain: 'Kγ = 1 → K = Kp.' } }
    },
    deep: {
      'eq.drg': { title: 'Por qué G tiene un mínimo: la entropía de mezcla', sections: [['La curva no es una recta', 'Si reactivos y productos no se mezclaran, G bajaría en línea recta hasta convertir todo (lo dice el ejercicio de la clase 1). Lo que crea el mínimo es la mezcla.'], ['El término RT ln x', 'Al mezclar, cada especie aporta RT ln xᵢ (negativo): la mezcla baja G. Por eso conviene quedarse con algo de reactivo y algo de producto.'], ['Consecuencia', 'Aunque K sea enorme, nunca es "100 %" exacto; y aunque K sea pequeña, siempre se forma algo.']],
        challenge: { prompt: 'Si los componentes no se pudieran mezclar, el equilibrio estaría…', options: [{ text: 'En uno de los extremos (todo reactivo o todo producto)', correct: true }, { text: 'Exactamente a la mitad', note: 'Sin mezcla, G es lineal en ξ.' }], explain: 'Sin entropía de mezcla, G es una recta y el mínimo está en un extremo.' },
        sources: [{ label: 'Ejercicios clase 1 (Zúñiga)', slide: 10 }, { label: 'Atkins, tema 6A (LibreTexts)', url: 'https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps' }] },
      'eq.vanthoff': { title: 'Van\'t Hoff y la distribución de Boltzmann', sections: [['La idea', 'K mide cómo se reparten las moléculas entre los "niveles" de reactivos y productos.'], ['Endotérmica', 'Los productos están a mayor energía: al calentar, Boltzmann puebla más los niveles altos → K sube.'], ['Exotérmica', 'Al revés: calentar quita población a los productos (más bajos en energía) → K baja.']],
        challenge: { prompt: 'Si ΔrH° = 0, al calentar K…', options: [{ text: 'No cambia', correct: true }, { text: 'Sube', note: 'Sin diferencia de energía, la temperatura no favorece a ningún lado.' }], explain: 'ln(K₂/K₁) = 0.' },
        sources: [{ label: 'Clase 3 (Pino), Fig. 6B.3', slide: 5 }, { label: 'Atkins, tema 6B (LibreTexts)', url: 'https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps' }] }
    },
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', 'Un proceso con ΔG < 0 a p y T constantes es…', [{ text: 'Espontáneo', correct: true }, { text: 'Imposible', note: 'Negativo es espontáneo.' }, { text: 'En equilibrio', note: 'Equilibrio es ΔG = 0.' }], { concept: 'base.termo', explain: 'ΔG < 0 → espontáneo.', slide: 5 }) },
      { level: 1, item: q('dx-2', '25 °C en kelvin son…', [{ text: '298,15 K', correct: true }, { text: '25 K', note: 'Hay que sumar 273,15.' }, { text: '248,15 K', note: 'Se suma, no se resta.' }], { concept: 'base.logs', explain: '25 + 273,15.', slide: 5 }) },
      { level: 2, item: q('dx-3', 'Si Q > K, la reacción…', [{ text: 'Va hacia reactivos', correct: true }, { text: 'Va hacia productos', misconception: 'q-k-direction' }, { text: 'Está en equilibrio', note: 'Equilibrio es Q = K.' }], { concept: 'eq.q-k', explain: 'Sobran productos.', slide: 3 }) },
      { level: 2, item: q('dx-4', 'En A + 2B → C, si ξ = 0,1 mol, ¿cuánto B se gastó?', [{ text: '0,2 mol', correct: true }, { text: '0,1 mol', misconception: 'avance-coef' }, { text: '0,05 mol', note: 'Se multiplica por 2.' }], { concept: 'eq.avance', explain: '2 × 0,1.', slide: 10 }) },
      { level: 2, item: q('dx-5', 'ΔrG° = +20 kJ/mol a 298 K: K es…', [{ text: 'Menor que 1', correct: true }, { text: 'Mayor que 1', misconception: 'k-sign' }, { text: 'Exactamente 0', note: 'K nunca es 0.' }], { concept: 'eq.k-dg', explain: 'ΔrG° > 0 → K < 1.', slide: 5 }) },
      { level: 3, item: q('dx-6', 'Para 2SO₂(g) + O₂(g) ⇌ 2SO₃(g), Kp = Kc · (RT)^x con x =', [{ text: '−1', correct: true }, { text: '+1', note: '2 − 3 = −1.' }, { text: '0', misconception: 'dn-count' }], { concept: 'eq.kp-kc', explain: 'Δn = −1.', slide: 4 }) },
      { level: 3, item: q('dx-7', 'Una reacción con K que baja al calentar es…', [{ text: 'Exotérmica', correct: true }, { text: 'Endotérmica', misconception: 'vh-sign' }, { text: 'Imposible de saber', note: 'Van\'t Hoff lo dice.' }], { concept: 'eq.vanthoff', explain: 'K baja con T → ΔH° < 0.', slide: 5 }) }
    ] }
  };
})();
