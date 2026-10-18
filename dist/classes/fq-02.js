/* Fisicoquímica II · PEP 1 · Electrolitos, actividad y fuerza iónica (miércoles 21 de octubre).
   Fuente: clase 5 «Equilibrio químico y electrolitos» (partes I y II), Dr. Eduardo Pino, USACH 2S 2026.
   Las 104 diapositivas reales están en slides/fq-02.js (de la Clase 5 I completa y la Clase 5 II hasta la constante de acidez).
   Números recalculados en Python (docs/chats/clases.md). El ejemplo de la diapositiva 22 trae un error de cálculo del propio ppt: ver el bloque m1b4. */
(() => {
  'use strict';
  const SRC = 'catedra-fq-electrolitos';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  const num = (id, prompt, answer, unit, extra = {}) => ({ id, type: 'number', prompt, answer, unit, tol: 0.02, source: SRC, ...extra });
  const spot = (id, prompt, steps, wrong, fix, extra = {}) => ({ id, type: 'spot', prompt, steps, wrong, fix, source: SRC, ...extra });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['fq-02'] = {
    id: 'fq-02',
    subject: 'fisico',
    title: 'Actividad y fuerza iónica',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Equilibrio químico y electrolitos · Clase 5 (partes I y II)', author: 'Dr. Eduardo Pino',
        detail: 'Fisicoquímica II, Química y Farmacia, USACH, 2S 2026', authority: 'Material oficial del curso' }
    },
    misconceptions: {
      'act-conc': { label: 'Usaste la concentración como si fuera la actividad', why: 'La **actividad** es la concentración "efectiva": **a = γ·m/m°**. Solo cuando la solución es muy diluida γ ≈ 1 y se parecen. Para iones se usa la actividad iónica media a± = γ±·m±.',
        prereq: { title: 'Actividad y coeficiente de actividad medio', mission: 'm1', block: 'm1b2' }, base: 'base.molal' },
      'ion-nu': { label: 'Contaste la sal y no los iones', why: 'Una sal se separa en **ν₊ cationes y ν₋ aniones por fórmula**: Na₂SO₄ 0,10 m tiene **0,20 m** de Na⁺ y 0,10 m de SO₄²⁻. En I y en m± hay que usar la molalidad de cada ion, no la de la sal.',
        prereq: { title: 'Electrolitos fuertes, débiles y electroneutralidad', mission: 'm1', block: 'm1b1' }, base: 'base.molal',
        check: q('fix-ion-nu', 'Caso corto: CaCl₂ 0,010 m. ¿Cuánto vale m(Cl⁻)?', [{ text: '0,020 m', correct: true }, { text: '0,010 m', note: 'Esa es la molalidad de la sal: cada CaCl₂ da 2 Cl⁻.' }, { text: '0,030 m', note: 'Eso sumaría los iones; m(Cl⁻) es solo el de los cloruros.' }], { concept: 'ion.electrolitos', explain: 'ν₋ = 2, así que m(Cl⁻) = 2 × 0,010 = 0,020 m.', slide: 13 }) },
      'ion-z2': { label: 'Olvidaste elevar la carga al cuadrado', why: 'En **I = ½ Σ mᵢzᵢ²** la carga va **al cuadrado**: un ion 2+ pesa 4 veces más que uno 1+ (y un 3+, 9 veces). Por eso MgSO₄ y Al₂(SO₄)₃ tienen I tan grande.',
        prereq: { title: 'Fuerza iónica', mission: 'm1', block: 'm1b3' }, base: 'base.molal',
        check: q('fix-ion-z2', 'Caso corto: MgCl₂ 0,010 m. ¿Cuánto vale I?', [{ text: '0,030 m', correct: true }, { text: '0,020 m', note: 'Sin elevar al cuadrado: ½(0,010·2 + 0,020·1) = 0,020. Falta el 2² del Mg²⁺.' }, { text: '0,010 m', note: 'Esa es la molalidad de la sal.' }], { concept: 'ion.fuerza', explain: 'I = ½(0,010·2² + 0,020·1²) = ½(0,040 + 0,020) = 0,030 m.', slide: 21 }) },
      'gam-gt1': { label: 'Obtuviste un γ± mayor que 1 con la ley límite', why: 'La ley límite siempre da **γ± < 1**: la atmósfera iónica estabiliza a los iones. log γ± es **negativo** y γ± = 10^(log γ±). Solo vale 1 a dilución infinita.',
        prereq: { title: 'La ley límite de Debye–Hückel', mission: 'm2', block: 'm2b1' }, base: 'base.log10' },
      'log-dir': { label: 'Te perdiste con el signo o con el 10^x', why: 'Pasos: (1) I = ½ Σ mᵢzᵢ²; (2) **log γ± = −0,509·|z₊z₋|·√I** (negativo); (3) **γ± = 10^(log γ±)**. No es ln, no se divide y no se deja en log.',
        prereq: { title: 'La ley límite de Debye–Hückel', mission: 'm2', block: 'm2b1' }, base: 'base.log10' },
      'ps-gamma': { label: 'Ignoraste la fuerza iónica al comparar solubilidades', why: 'Las actividades mandan: **K°ps = γ±²·Kps**. Al subir I, γ± baja, y para que K°ps no cambie el Kps aparente sube: **la sal se disuelve más** (efecto salino primario).',
        prereq: { title: 'Solubilidad: Kps con actividades', mission: 'm2', block: 'm2b3' }, base: 'base.log10' }
    },
    goal: {
      total: 100, text: 'Asegurar los 25 puntos de Electrolitos y actividad de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P1', label: 'Electrolitos, m±, a± y fuerza iónica', points: 8, missions: ['m1'] },
        { id: 'P2', label: 'Debye–Hückel, solubilidad y acidez con actividades', points: 10, missions: ['m2'] },
        { id: 'P3', label: 'Conductividad, Kohlrausch y Ostwald', points: 7, missions: ['m3'] }
      ],
      rest: [{ label: 'Equilibrio químico', points: 50, note: 'clase fq-01' }, { label: 'Celdas galvánicas y Nernst', points: 25, note: 'clase fq-03' }]
    },
    glossary: [
      { term: 'Electrolito', mission: 'm1', def: 'Sustancia que al disolverse produce iones y hace que la solución conduzca la electricidad. Fuerte: se disocia casi por completo; débil: se disocia poco.', simple: 'Algo que en agua se parte en cargas que llevan corriente.', simpler: 'Como una pandilla que al entrar al agua se separa y cada uno lleva una carga.' },
      { term: 'Electroneutralidad', mission: 'm1', def: 'La solución es eléctricamente neutra: ν₊z₊ + ν₋z₋ = 0 por cada fórmula de sal.', simple: 'Las cargas positivas y negativas siempre se compensan.', simpler: 'En una fiesta con parejas, nadie queda solo: por cada carga hay otra que la equilibra.' },
      { term: 'Actividad (a)', mission: 'm1', def: 'Concentración efectiva de una especie: a = γ·m/m°. Reemplaza a la concentración en μ = μ° + RT ln a.', simple: 'Cuánto "actúa" de verdad una especie, que puede ser menos de lo que hay.', simpler: 'Como un jugador que está en la cancha pero lo marcan entre tres: rinde menos de lo que debería.' },
      { term: 'Coeficiente de actividad iónico medio (γ±)', mission: 'm1', def: 'γ± = (γ₊^ν₊ · γ₋^ν₋)^(1/ν). Vale 1 a dilución infinita y en electrolitos suele ser menor que 1.', simple: 'El "factor de rendimiento" de los iones de una sal.', simpler: 'Un número entre 0 y 1 que dice qué tan bien se portan los iones: 1 = como si estuvieran solos.' },
      { term: 'Molalidad iónica media (m±)', mission: 'm1', def: 'm± = (m₊^ν₊ · m₋^ν₋)^(1/ν): media geométrica de las molalidades de los iones.', simple: 'Un promedio especial de las concentraciones de catión y anión.', simpler: 'Un promedio "multiplicando", no sumando.' },
      { term: 'Fuerza iónica (I)', mission: 'm1', def: 'I = ½ Σ mᵢzᵢ² (mol/kg). Mide la cantidad de cargas en la solución; los iones de mayor carga pesan más (z²).', simple: 'Qué tan "cargada" está la solución.', simpler: 'Como contar cuánta gente hay en una pista de baile, pero los que llevan más carga cuentan más.' },
      { term: 'Atmósfera iónica', mission: 'm2', def: 'Nube de iones de carga opuesta que rodea a cada ion y lo estabiliza (μ_real < μ_ideal, γ± < 1).', simple: 'Los iones contrarios se juntan alrededor de cada ion.', simpler: 'Como un famoso rodeado de fans: ya no se comporta como si estuviera solo.' },
      { term: 'Ley límite de Debye–Hückel', mission: 'm2', def: 'log γ± = −A·|z₊z₋|·√I, con A = 0,509 (mol/kg)^(−1/2) en agua a 25 °C. Válida para I < 0,01 m.', simple: 'Una fórmula para estimar γ± en soluciones muy diluidas.', simpler: 'Una receta que dice cuánto se estorban los iones según su carga y cuántos hay.' },
      { term: 'Efecto salino (salting-in / salting-out)', mission: 'm2', def: 'Primario (salting-in): al subir I baja γ± y sube la solubilidad. Secundario (salting-out): con I muy alta hay menos agua libre y la solubilidad cae.', simple: 'Agregar sal cambia cuánto se disuelve algo, primero más y después menos.', simpler: 'Una sala llena de gente: al principio hacen espacio; cuando ya no cabe nadie, no entra nada más.' },
      { term: 'Producto de solubilidad aparente y termodinámico', mission: 'm2', def: 'Kps = [Mᵛ⁺][Xᵛ⁻] (con concentraciones); K°ps = γ±²·Kps = producto de actividades (constante verdadera).', simple: 'Uno usa concentraciones y cambia con I; el otro usa actividades y es fijo.', simpler: 'Una cuenta contada "a ojo" frente a la misma cuenta contada con balanza.' },
      { term: 'Conductividad (κ) y conductividad molar (Λm)', mission: 'm3', def: 'κ = G·l/A = Kcel/R (S/m o S/cm). Λm = κ/c (S m² mol⁻¹ o S cm² mol⁻¹): conductividad por mol de electrolito.', simple: 'κ dice cuánto conduce la solución; Λm, cuánto conduce cada mol.', simpler: 'κ es el ruido de toda la sala; Λm, el ruido que hace cada persona.' },
      { term: 'Ley de Kohlrausch y de Ostwald', mission: 'm3', def: 'Kohlrausch: Λ°m = ν₊λ°₊ + ν₋λ°₋ (cada ion aporta por separado). Ostwald: α = Λm/Λ°m y Ka = cα²/(1 − α).', simple: 'Con los iones por separado se arma la conductividad; con ella se saca Ka.', simpler: 'Sumas lo que aporta cada jugador para tener el puntaje del equipo.' }
    ],
    concepts: [
      { id: 'base.log10', title: 'Potencias de 10, logaritmos y raíces', root: true },
      { id: 'base.molal', title: 'Molalidad y iones por fórmula', root: true },
      { id: 'base.ohm', title: 'Resistencia, conductancia y unidades', root: true },
      { id: 'ion.electrolitos', mission: 'm1', title: 'Electrolitos y electroneutralidad', needs: ['base.molal'] },
      { id: 'ion.actividad', mission: 'm1', title: 'Actividad, γ±, m± y a±', needs: ['ion.electrolitos'] },
      { id: 'ion.fuerza', mission: 'm1', title: 'Fuerza iónica', needs: ['base.molal'] },
      { id: 'ion.debye', mission: 'm2', title: 'Ley límite de Debye–Hückel', needs: ['ion.actividad', 'ion.fuerza', 'base.log10'] },
      { id: 'ion.kps', mission: 'm2', title: 'Solubilidad y efecto salino', needs: ['ion.debye'] },
      { id: 'ion.ka', mission: 'm2', title: 'Constante de acidez con actividades', needs: ['ion.debye'] },
      { id: 'ion.conductividad', mission: 'm3', title: 'Conductividad, Kohlrausch y Ostwald', needs: ['ion.electrolitos', 'base.ohm'] }
    ],
    curiosities: [
      { text: 'El agua purificada de uso farmacéutico se controla con un conductímetro: la USP pide ≤ 1,3 µS/cm a 25 °C. Un solo ion de más y el aparato lo nota.', slide: 62 },
      { text: 'El H⁺ conduce 7 veces más que el Na⁺ (λ° = 349,8 frente a 50,1 S cm²/mol): no viaja, la carga "salta" entre moléculas de agua (mecanismo de Grotthuss).', slide: 41 },
      { text: 'El suero fisiológico (NaCl 0,9 %, unos 154 mM) es isotónico con el plasma: su fuerza iónica ronda los 0,15 mol/kg.', slide: 62 }
    ],
    slideImages: {},
    slides: {
      7: { title: 'Soluciones de electrolitos', bullets: ['Los iones no existen aislados fuera de la solución', 'Las soluciones se desvían del comportamiento diluido incluso a bajas concentraciones', 'Electroneutralidad y teoría de Debye–Hückel'] },
      8: { title: 'Electrolito fuerte y débil', bullets: ['Fuerte: sales, ácidos y bases fuertes; conduce bien', 'Débil: sales poco solubles, ácidos y bases débiles; conduce poco'] },
      12: { title: 'Potencial químico de una solución de electrolito', bullets: ['μ(NaCl) = ∂G/∂n(NaCl); el de un ion solo se define en teoría, no en el experimento', 'G = n_sal·μ_sal + n_solvente·μ_solvente'] },
      13: { title: 'Electroneutralidad', bullets: ['Electrolito AᵥB: n₊ = ν₊·n_sal y n₋ = ν₋·n_sal', 'ν₊z₊ + ν₋z₋ = 0 (NaCl, Na₂SO₄, BaSO₄)'] },
      16: { title: 'Actividad iónica media', bullets: ['a± = γ±·m±', 'γ± = (γ₊^ν₊ · γ₋^ν₋)^(1/ν)', 'm± = (m₊^ν₊ · m₋^ν₋)^(1/ν)'] },
      18: { title: 'Potencial químico de una sal', bullets: ['μ_sal = μ°_sal + RT ln a_sal', 'μ± = μ°± + RT ln a±', 'a → m cuando m → 0'] },
      19: { title: 'γ± y la dilución', bullets: ['A concentraciones muy bajas γ± → 1 en todos los electrolitos', 'Al aumentar la concentración aparecen desviaciones de la idealidad'] },
      20: { title: 'Ejemplo: BaCl₂', bullets: ['BaCl₂ → Ba²⁺ + 2 Cl⁻: ν₊ = 1, ν₋ = 2, ν = 3', 'γ± = (γ₊ · γ₋²)^(1/3)'] },
      21: { title: 'Fuerza iónica', bullets: ['I = ½ Σ mᵢzᵢ²', 'Medida cuantitativa de la cantidad de cargas en la solución'] },
      22: { title: 'Ejemplo: KCl 0,09 + HCl 0,01 por kg de agua', bullets: ['K⁺ 0,09; H⁺ 0,01; Cl⁻ 0,10 mol/kg', 'I = ½(0,09 + 0,01 + 0,10) = 0,10 mol/kg (el ppt escribe 0,01: error de cálculo)'] },
      27: { title: 'Fuertes, débiles y no electrolitos', bullets: ['La conductividad depende de cuántos iones libres hay y de su movilidad'] },
      29: { title: 'Disolución: los iones se hidratan', bullets: ['El agua es un dipolo; capas de hidratación', 'Constante dieléctrica alta (εr ≈ 78) debilita la atracción entre iones'] },
      30: { title: 'Conducción electrolítica', bullets: ['Metales: electrones; soluciones: iones', 'Cationes al cátodo (−), aniones al ánodo (+)'] },
      31: { title: 'Leyes de Faraday', bullets: ['m = M·I·t/(z·F); F = 96 485 C/mol', '2,00 A por 30 min en CuSO₄ → 1,19 g de Cu'] },
      32: { title: 'Resistencia, conductancia y conductividad', bullets: ['R = ρ·l/A; G = 1/R (S)', 'κ = G·l/A = Kcel/R; Kcel = l/A'] },
      34: { title: 'Medición: puente de Wheatstone', bullets: ['Corriente alterna (≈ 1 kHz) para evitar electrólisis', 'Calibración con KCl 0,01 M: κ = 1413 µS/cm a 25 °C'] },
      35: { title: 'Conductividad molar', bullets: ['Λm = κ/c', 'KCl 0,100 M: κ = 1,289 S/m → Λm = 128,9 S cm²/mol'] },
      37: { title: 'Λm frente a √c', bullets: ['Fuertes: Λm = Λ°m − K√c (recta)', 'Débiles: caída brusca al concentrar'] },
      38: { title: 'Migración independiente de los iones', bullets: ['Λ°m = ν₊λ°₊ + ν₋λ°₋', 'Λ°m(HAc) = 426,2 + 91,0 − 126,5 = 390,7 S cm²/mol'] },
      39: { title: 'Electrolitos débiles: ley de Ostwald', bullets: ['α = Λm/Λ°m; Ka = cα²/(1 − α)', 'CH₃COOH 0,100 M, Λm = 5,20 → α = 0,0133, Ka = 1,8 × 10⁻⁵'] },
      40: { title: 'Movilidad iónica', bullets: ['v = u·E; λ = z·F·u', 'λ° (S cm²/mol): H⁺ 349,8 · OH⁻ 198,6 · Cl⁻ 76,3 · K⁺ 73,5 · Na⁺ 50,1 · Li⁺ 38,7'] },
      41: { title: 'Anomalía del H⁺: Grotthuss', bullets: ['El protón "salta" entre moléculas de agua', 'Se transporta la carga, no el ion'] },
      42: { title: 'Números de transporte', bullets: ['t₊ = I₊/I = λ₊/(λ₊ + λ₋); t₊ + t₋ = 1', 'HCl: H⁺ lleva ≈ 82 % de la corriente; KCl: t₊ ≈ t₋'] },
      43: { title: 'Método de Hittorf', bullets: ['El ánodo pierde 3 pares y el cátodo 1 par → t₊/t₋ = 3 → t₊ = 0,75'] },
      45: { title: 'Actividad iónica media: ejemplo', bullets: ['γ± = (γ₊^ν₊ · γ₋^ν₋)^(1/ν); m± = (m₊^ν₊ · m₋^ν₋)^(1/ν)', 'CaCl₂ 0,010 m: m± = 4^(1/3) · 0,010 = 0,0159 m'] },
      46: { title: 'Fuerza iónica de sales (0,10 m)', bullets: ['NaCl 0,10 · CaCl₂ 0,30 · Na₂SO₄ 0,30 · MgSO₄ 0,40 · Al₂(SO₄)₃ 1,50'] },
      52: { title: 'Ley límite de Debye–Hückel', bullets: ['log γ± = −A|z₊z₋|√I; A = 0,509 (kg/mol)^(1/2)', 'Válida para I < 0,01 m; γ± < 1', 'Mayor carga y mayor I → menor γ±'] },
      53: { title: 'La atmósfera iónica', bullets: ['Cada ion está rodeado por contraiones', 'S_real < S_ideal; H_real < H_ideal; μ_real < μ_ideal'] },
      61: { title: 'Ejercicio: γ± del CaCl₂ 0,005 m', bullets: ['I = ½(0,005·2² + 0,010·1²) = 0,015 m', 'log γ± = −0,509·2·√0,015 = −0,125 → γ± = 0,75', 'a± = 0,75 × 0,00794 ≈ 5,96 × 10⁻³'] },
      62: { title: 'Aplicaciones farmacéuticas', bullets: ['Suero fisiológico NaCl 0,9 %: isotónico con el plasma', 'Agua purificada: ≤ 1,3 µS/cm (USP)', 'Conductimetría: el punto de equivalencia es un quiebre de κ frente a V'] },
      63: { title: 'Ecuaciones clave', bullets: ['κ = G·l/A · Λm = κ/c · Λ°m = ν₊λ°₊ + ν₋λ°₋', 'Ka = cα²/(1 − α) · t₊ = λ₊/(λ₊ + λ₋) · log γ± = −A|z₊z₋|√I'] },
      64: { title: 'Preguntas de comprobación', bullets: ['Kcel = 0,85 cm⁻¹ y R = 603 Ω (KCl 0,010 M): κ y Λm', 'Λ°(NH₄OH) con NH₄Cl 149,7; NaOH 247,8; NaCl 126,5', 'Na₂SO₄ 0,002 m: I y γ± con la ley límite'] },
      74: { title: 'Formación de pares iónicos', bullets: ['En solventes de constante dieléctrica baja se forman más pares iónicos', 'En agua es poco importante para 1:1 pero sustancial con z₊z₋ altos'] },
      82: { title: 'Efecto salino primario y secundario', bullets: ['La ley límite sirve para estudiar la solubilidad (AgCl, proteínas)'] },
      83: { title: 'Producto de solubilidad', bullets: ['K°ps = a(Ag⁺)·a(Cl⁻) = γ±²·Kps', 'Kps = [Ag⁺][Cl⁻] es el producto aparente'] },
      84: { title: 'log (s/s₀) con la ley límite', bullets: ['log(K°ps/Kps)^(1/2) = −log γ± = 0,509|z₊z₋|√I', 'Para 1:1: log(s/s₀) = 0,509·|z₊z₋|·√I'] },
      85: { title: 'AgCl en KNO₃: salting-in', bullets: ['Kps = 1,6 × 10⁻¹⁰ → s₀ = 1,3 × 10⁻⁵ M', 'Más I → más solubilidad'] },
      86: { title: 'Salting-out', bullets: ['A cierta I la solubilidad vuelve a bajar: menos agua disponible'] },
      88: { title: 'Ejercicio: MgCl₂ 0,002 m', bullets: ['I y coeficientes de actividad de Mg²⁺ y Cl⁻ con Debye–Hückel', 'γ± media de la sal'] },
      95: { title: 'Ejercicio: oxalato de calcio', bullets: ['Kps = 3,0 × 10⁻⁹ a 25 °C', 'Solubilidad ideal y con la corrección de Debye–Hückel'] },
      98: { title: 'Constante de acidez con actividades', bullets: ['K°a = a(H⁺)·a(A⁻)/a(HA); a(HA) ≈ [HA] si es diluido'] },
      99: { title: 'K°a y K′a', bullets: ['K°a = γ±²·[H⁺][A⁻]/[HA]', 'log K′a = 2 log γ± + log K°a (en la convención de la clase)'] },
      100: { title: 'Grado de disociación y fuerza iónica', bullets: ['CH₃COOH ⇌ CH₃COO⁻ + H⁺: [H⁺] = αC₀', 'I = αC₀'] },
      102: { title: 'Ejercicio: ácido acético 0,10 M', bullets: ['Ka = 1,8 × 10⁻⁵: calcular α, concentraciones, pH y fuerza iónica'] }
    },
    missions: [
      {
        id: 'm1', title: 'Electrolitos y actividad', subtitle: 'Fuertes, débiles, neutralidad, γ±, m±, a± y fuerza iónica', minutes: 35, slides: '7–23, 44–50', pep: 'P1: electrolitos, actividad y fuerza iónica',
        stages: {
          hook: { title: 'La sal que no se porta como en el papel', sage: 'Una solución de NaCl 0,10 m "debería" actuar como 0,10 m de partículas. Pero conduce, congela y reacciona como si tuviera un poco menos. ¿Por qué? Porque los iones se estorban entre sí.',
            text: 'Para corregir esa diferencia se usa la **actividad** en lugar de la concentración. En la PEP te pedirán calcular I, γ± y a± de una sal (por ejemplo CaCl₂ 0,005 m), y todo parte de contar bien los iones.' },
          diagnostic: [
            q('m1-d1', 'Na₂SO₄ 0,10 m. ¿Cuánto vale la molalidad del Na⁺?', [{ text: '0,20 m', correct: true }, { text: '0,10 m', note: 'Esa es la molalidad de la sal: cada Na₂SO₄ da 2 Na⁺.', misconception: 'ion-nu' }, { text: '0,30 m', note: 'Eso mezcla los dos iones.' }],
              { concept: 'ion.electrolitos', explain: 'ν₊ = 2: m(Na⁺) = 2 × 0,10 = 0,20 m.', slide: 13 }),
            q('m1-d2', '¿Qué significa γ± < 1 en una solución de electrolito?', [{ text: 'Los iones se estabilizan entre sí: su concentración efectiva es menor que la real', correct: true }, { text: 'La sal no se disolvió por completo', note: 'γ± no habla de disolución, sino de interacciones.' }, { text: 'Hay más iones de los que dice la fórmula', note: 'La estequiometría no cambia; cambia cómo "actúan".' }],
              { concept: 'ion.actividad', explain: 'a = γ·m: si γ < 1, el ion "actúa" menos de lo que hay.', slide: 19 })
          ],
          fundamentals: [
            { id: 'f1', concept: 'base.molal', title: 'Desde cero: molalidad e iones por fórmula', slide: 13, body: 'La **molalidad** (m) son los moles de soluto por kg de solvente. Una sal MᵥXᵥ se separa en **ν₊ cationes y ν₋ aniones por fórmula**: m₊ = ν₊·m y m₋ = ν₋·m.',
              deeper: 'CaCl₂ 0,010 m: m(Ca²⁺) = 0,010 m y m(Cl⁻) = 0,020 m. Na₂SO₄ 0,10 m: m(Na⁺) = 0,20 m y m(SO₄²⁻) = 0,10 m. Comprueba que las cargas se compensan: 0,20·(+1) + 0,10·(−2) = 0.' }
          ],
          explain: [],
          transfer: [
            num('m1-t1', 'Estilo PEP: CaCl₂ 0,010 m. Calcula la molalidad iónica media m± (ν₊ = 1, ν₋ = 2).', 0.0159, 'mol/kg',
              { concept: 'ion.actividad', label: 'm±', slide: 45, tol: 0.01, traps: [{ value: 0.010, note: 'Esa es m(Ca²⁺) o la de la sal; m± combina ambos iones.', misconception: 'ion-nu' }, { value: 0.0133, note: 'Hiciste una media aritmética (0,010 + 0,020 + 0,020)/3; m± es una media geométrica con exponentes ν.' }],
                solution: ['m₊ = 0,010 m y m₋ = 0,020 m', 'm± = (0,010¹ · 0,020²)^(1/3) = (4,0 × 10⁻⁶)^(1/3) = 4^(1/3) · 0,010', 'm± = 0,0159 m'], explain: 'm± = 0,0159 m.' }),
            write('m1-w1', 'Enséñale a tu compañero: ¿por qué no se puede medir la actividad de un ion solo y se usa la actividad iónica media?', 'Porque en una solución siempre hay cationes y aniones juntos (electroneutralidad): no se puede agregar un solo tipo de ion. Por eso solo se pueden medir combinaciones; la actividad iónica media a± = γ±·m± es la media geométrica de la de ambos iones.',
              ['No existe una solución con un solo tipo de ion: electroneutralidad', 'Solo se miden combinaciones de catión y anión', 'Se usa la media geométrica: γ±, m± y a±'],
              { concept: 'ion.electrolitos', explain: 'Los iones siempre vienen en pareja.', slide: 12, teach: true, keywords: [{ label: 'electroneutralidad / cargas juntas', any: ['neutral', 'carga', 'juntos', 'pareja'] }, { label: 'media / combinación', any: ['media', 'geométr', 'combinaci', 'ambos'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **electrolitos y actividad**.',
            pretest: q('m1-pre1', 'Adivina antes: ¿en cuál solución de NaCl está γ± más cerca de 1?', [{ text: 'En la de 0,001 m (más diluida)', correct: true }, { text: 'En la de 1 m (más concentrada)', note: 'Más iones, más interacción: γ± se aleja de 1.' }, { text: 'En las dos igual', note: 'γ± depende de la concentración.' }],
              { concept: 'ion.actividad', explain: 'A dilución infinita γ± → 1.', slide: 19 }),
            explain: [
              { id: 'm1b1', concept: 'ion.electrolitos', title: 'Electrolitos fuertes, débiles y electroneutralidad', slide: 8, body: '**Electrolito fuerte**: se disocia casi por completo (sales, ácidos y bases fuertes) y la solución conduce bien. **Electrolito débil**: se disocia poco (ácidos y bases débiles, sales poco solubles) y conduce poco. En ambos, la solución es **neutra**: **ν₊z₊ + ν₋z₋ = 0** (NaCl: 1·(+1) + 1·(−1); Na₂SO₄: 2·(+1) + 1·(−2); BaSO₄: 1·(+2) + 1·(−2)).',
                deeper: 'Por eso un ion nunca existe solo: el Na⁺ siempre está con algún anión. Y por eso el potencial químico de un ion aislado "se puede definir en teoría, pero no medir" (diap. 12): solo se miden combinaciones de catión y anión.' },
              { id: 'm1b2', concept: 'ion.actividad', title: 'Actividad y coeficiente de actividad medio', slide: 16, body: 'Para una sal MᵥXᵥ con ν = ν₊ + ν₋: **m± = (m₊^ν₊ · m₋^ν₋)^(1/ν)**, **γ± = (γ₊^ν₊ · γ₋^ν₋)^(1/ν)** y **a± = γ±·m±** (con m° = 1 mol/kg). Se usa en μ = μ° + RT ln a. Si γ± < 1 el ion está más estable que en la solución ideal; a dilución infinita γ± → 1.',
                deeper: 'CaCl₂ 0,010 m (ν₊ = 1, ν₋ = 2, ν = 3): m± = (0,010 · 0,020²)^(1/3) = 4^(1/3) · 0,010 = 0,0159 m (diap. 45). BaCl₂: γ± = (γ₊ · γ₋²)^(1/3) (diap. 20). La actividad es adimensional.' }
            ],
            practice: [
              q('m1-p1', 'Una sal con ν₊ = 2 y ν₋ = 1 (como Na₂SO₄) tiene ν =', [{ text: '3', correct: true }, { text: '2', note: 'Ese es solo ν₊.' }, { text: '1', note: 'Ese es solo ν₋.' }],
                { concept: 'ion.actividad', explain: 'ν = ν₊ + ν₋ = 2 + 1 = 3.', slide: 16, hint: 'ν suma los iones por fórmula.' }),
              num('m1-p2', 'Na₂SO₄ 0,10 m: calcula m± (m₊ = 0,20 m; m₋ = 0,10 m; ν = 3).', 0.1587, 'mol/kg',
                { concept: 'ion.actividad', label: 'm±', slide: 45, tol: 0.01, hint: 'm± = (m₊² · m₋)^(1/3).', traps: [{ value: 0.10, note: 'Esa es la molalidad de la sal.', misconception: 'ion-nu' }, { value: 0.15, note: 'Media aritmética de 0,20 y 0,10; m± es media geométrica.' }],
                  solution: ['m± = (0,20² · 0,10)^(1/3) = (4,0 × 10⁻³)^(1/3)', 'm± = 0,159 m'], explain: 'm± = 0,159 m.' }),
              match('m1-p3', 'Une cada expresión con su significado:', [['γ±', 'Coeficiente de actividad iónico medio'], ['m±', 'Molalidad iónica media'], ['a± = γ±·m±', 'Actividad iónica media'], ['ν₊z₊ + ν₋z₋ = 0', 'Electroneutralidad']],
                { concept: 'ion.actividad', explain: 'Cada símbolo tiene su papel en μ = μ° + RT ln a.', slide: 16, hint: 'a± mezcla γ± y m±.' }),
              spot('m1-p4', 'Un aprendiz calcula m± de CaCl₂ 0,010 m. ¿En qué paso se equivocó?',
                ['Ca²⁺ = 0,010 m y Cl⁻ = 0,020 m', 'm± = (0,010 + 0,020)/2 = 0,015 m', 'Entonces a± = γ± · 0,015'], 1,
                { question: '¿Cómo se corrige el paso 2?', options: [{ text: 'm± = (0,010¹ · 0,020²)^(1/3) = 0,0159 m', correct: true }, { text: 'm± = 0,010 · 0,020 = 2 × 10⁻⁴ m', note: 'Falta la raíz ν-ésima: m± es una media geométrica.' }, { text: 'm± = 0,010 m, la de la sal', note: 'm± combina las molalidades de los dos iones.' }] },
                { concept: 'ion.actividad', stepNotes: { 0: 'Bien: ν₊ = 1 y ν₋ = 2.', 2: 'La fórmula de a± está bien, pero usa el m± equivocado.' }, explain: 'm± es media geométrica con exponentes ν, no aritmética.', slide: 16, hint: 'No es un promedio simple.' })
            ],
            rule: { title: 'Regla del sabio: de la sal a los iones', concept: 'ion.actividad', steps: ['Escribe la disociación y anota ν₊, ν₋ y ν', 'Revisa la electroneutralidad: ν₊z₊ + ν₋z₋ = 0', 'm₊ = ν₊·m y m₋ = ν₋·m', 'm± = (m₊^ν₊ · m₋^ν₋)^(1/ν) y a± = γ±·m±'] } },
          { id: 'r2', intro: 'Parte 2: **fuerza iónica**.',
            pretest: q('m1-pre2', 'Adivina antes: ¿qué sal de 0,10 m tiene mayor fuerza iónica?', [{ text: 'Al₂(SO₄)₃', correct: true }, { text: 'NaCl', note: 'Es la menor: iones 1+ y 1−.' }, { text: 'CaCl₂', note: 'I = 0,30; hay sales con más carga.' }],
              { concept: 'ion.fuerza', explain: 'Mientras más carga, más pesa (z²).', slide: 46 }),
            explain: [
              { id: 'm1b3', concept: 'ion.fuerza', title: 'Fuerza iónica', slide: 21, body: '**I = ½ Σ mᵢzᵢ²** (mol/kg). Cuenta **cada ion** y eleva su **carga al cuadrado**: los iones más cargados pesan mucho más. Con 0,10 m: NaCl → 0,10; CaCl₂ → 0,30; Na₂SO₄ → 0,30; MgSO₄ → 0,40; Al₂(SO₄)₃ → 1,50 (diap. 46).',
                deeper: 'Na₂SO₄ 0,10 m: I = ½(0,20·1² + 0,10·2²) = ½(0,20 + 0,40) = 0,30 m. Atajo: para una sal 1:1, I = m. Para MgSO₄ 0,10 m: I = ½(0,10·4 + 0,10·4) = 0,40 m.' },
              { id: 'm1b4', concept: 'ion.fuerza', title: 'Ejemplo de la clase: una mezcla (con una trampa)', slide: 22, body: 'KCl 0,09 m + HCl 0,01 m: K⁺ = 0,09; H⁺ = 0,01; Cl⁻ = 0,09 + 0,01 = 0,10. **I = ½(0,09·1² + 0,01·1² + 0,10·1²) = ½(0,20) = 0,10 mol/kg.**',
                deeper: 'En la diapositiva 22 el resultado final dice 0,01 mol/kg: es un error de cálculo del propio ppt (la suma da 0,20 antes del ½, o sea 0,10). Si te sale 0,10 vas bien; si en la PEP aparece este ejercicio, confirma con el profe.' }
            ],
            practice: [
              num('m1-p5', 'Na₂SO₄ 0,10 m: calcula la fuerza iónica I.', 0.30, 'mol/kg',
                { concept: 'ion.fuerza', label: 'I', slide: 21, tol: 0.01, hint: 'm(Na⁺) = 0,20 m y m(SO₄²⁻) = 0,10 m; eleva las cargas al cuadrado.', traps: [{ value: 0.10, note: 'Esa es la molalidad de la sal.', misconception: 'ion-nu' }, { value: 0.15, note: 'No elevaste la carga al cuadrado: ½(0,20 + 0,10).', misconception: 'ion-z2' }, { value: 0.60, note: 'Olvidaste el ½.' }],
                  solution: ['I = ½ (0,20·1² + 0,10·2²)', 'I = ½ (0,20 + 0,40) = 0,30 mol/kg'], explain: 'I = 0,30 mol/kg.' }),
              q('m1-p6', 'MgSO₄ 0,010 m y NaCl 0,010 m. ¿Cuántas veces mayor es I del MgSO₄?', [{ text: '4 veces', correct: true }, { text: '2 veces', note: 'Sumaste cargas (2 frente a 1), pero van al cuadrado.', misconception: 'ion-z2' }, { text: 'Son iguales', note: 'Tienen la misma molalidad, pero no la misma carga.' }],
                { concept: 'ion.fuerza', explain: 'I(MgSO₄) = ½(0,010·4 + 0,010·4) = 0,040; I(NaCl) = 0,010.', slide: 46, hint: 'Calcula las dos I.' }),
              order('m1-p7', 'Ordena de menor a mayor fuerza iónica (todas 0,10 m):', [['a', 'NaCl'], ['b', 'CaCl₂'], ['c', 'MgSO₄'], ['d', 'Al₂(SO₄)₃']], ['a', 'b', 'c', 'd'],
                { concept: 'ion.fuerza', direction: 'De menor a mayor I.', explain: 'NaCl 0,10 < CaCl₂ 0,30 < MgSO₄ 0,40 < Al₂(SO₄)₃ 1,50.', slide: 46, hint: 'Calcula I de cada una.' }),
              num('m1-p8', 'Mezcla de la clase: 0,09 m de KCl y 0,01 m de HCl (en 1,0 kg de agua). Calcula I.', 0.10, 'mol/kg',
                { concept: 'ion.fuerza', label: 'I', slide: 22, tol: 0.01, hint: 'Cl⁻ total = 0,09 + 0,01.', traps: [{ value: 0.01, note: 'Ese es el valor que escribe el ppt, pero la suma da 0,10.' }, { value: 0.20, note: 'Olvidaste el ½.' }],
                  solution: ['K⁺ 0,09; H⁺ 0,01; Cl⁻ 0,10', 'I = ½(0,09 + 0,01 + 0,10) = 0,10 mol/kg'], explain: 'I = 0,10 mol/kg.' })
            ],
            rule: { title: 'Regla del sabio: fuerza iónica', concept: 'ion.fuerza', steps: ['Anota la molalidad de cada ion (m = ν·m_sal)', 'Eleva cada carga al cuadrado', 'Suma mᵢzᵢ² y multiplica por ½'] } }
        ]
      },
      {
        id: 'm2', title: 'Debye–Hückel, solubilidad y acidez', subtitle: 'Cómo corregir γ±, la solubilidad y Ka con la fuerza iónica', minutes: 40, slides: '51–55, 59–61, 82–102', pep: 'P2: ley límite, solubilidad y constante de acidez',
        stages: {
          hook: { title: 'El oxalato de calcio y los cálculos renales', sage: 'El oxalato de calcio es muy poco soluble (Kps = 3,0 × 10⁻⁹) y puede formar cálculos renales. Pero la sangre está llena de iones: ¿se disuelve más o menos que en agua pura?',
            text: 'La respuesta sale de la actividad: más iones → γ± baja → se disuelve **más**. En la PEP se pide γ± por Debye–Hückel y corregir una solubilidad o una constante con ella.' },
          diagnostic: [
            q('m2-d1', 'Con la ley límite, si aumenta la fuerza iónica, γ±…', [{ text: 'Disminuye', correct: true }, { text: 'Aumenta', note: 'log γ± = −A|z₊z₋|√I: más I, más negativo.', misconception: 'gam-gt1' }, { text: 'No cambia', note: 'Depende de √I.' }],
              { concept: 'ion.debye', explain: 'γ± = 10^(−A|z₊z₋|√I) baja cuando I sube.', slide: 52 }),
            q('m2-d2', 'Para CaCl₂ (Ca²⁺ y Cl⁻), |z₊z₋| vale', [{ text: '2', correct: true }, { text: '1', note: 'Multiplicas |+2| por |−1|.' }, { text: '3', note: 'No se suman: se multiplican.' }],
              { concept: 'ion.debye', explain: '|2 × (−1)| = 2.', slide: 52 })
          ],
          fundamentals: [
            { id: 'f2', concept: 'base.log10', title: 'Desde cero: potencias de 10 y logaritmos', slide: 52, body: '**log x** es el exponente al que hay que elevar 10 para obtener x: log 100 = 2, log 0,01 = −2. Al revés, si log γ = −0,125 entonces **γ = 10^(−0,125) ≈ 0,75**. Una raíz es una potencia: √I = I^(1/2).',
              deeper: 'En la calculadora, 10^x suele estar como "10ˣ" o SHIFT + log. √0,015 = 0,1225. Un log negativo da un número entre 0 y 1: por eso γ± < 1. Si te sale γ± > 1, revisa el signo.' }
          ],
          explain: [],
          transfer: [
            num('m2-t1', 'Estilo PEP: calcula γ± de Na₂SO₄ 0,002 m con la ley límite (A = 0,509).', 0.834, '',
              { concept: 'ion.debye', label: 'γ±', slide: 61, tol: 0.01, traps: [{ value: 0.913, note: 'Usaste |z₊z₋| = 1: las cargas son +1 y −2, el producto es 2.', misconception: 'log-dir' }, { value: 0.9005, note: 'Usaste I = 0,002 (la molalidad de la sal): falta contar los iones.', misconception: 'ion-nu' }, { value: -0.0789, note: 'Ese es log γ±: falta el 10^x.', misconception: 'log-dir' }],
                solution: ['I = ½(0,004·1² + 0,002·2²) = 0,006 m', 'log γ± = −0,509 · 2 · √0,006 = −0,0789', 'γ± = 10^(−0,0789) = 0,834'], explain: 'γ± = 0,834.' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿por qué sube la solubilidad del AgCl al agregar KNO₃, si no tienen ningún ion en común?', 'KNO₃ no comparte iones con el AgCl, pero sube la fuerza iónica. Con más I, γ± baja; como K°ps = γ±²·Kps es constante, el Kps aparente (producto de concentraciones) debe subir y se disuelve más AgCl. Es el efecto salino primario o salting-in.',
              ['No hay ion común: el efecto viene de la fuerza iónica', 'Mayor I → menor γ±', 'K°ps = γ±²·Kps es constante → Kps aparente sube → mayor solubilidad'],
              { concept: 'ion.kps', explain: 'Más iones alrededor estabilizan a Ag⁺ y Cl⁻ disueltos.', slide: 85, teach: true, keywords: [{ label: 'fuerza iónica', any: ['fuerza i', 'iónica', ' I '] }, { label: 'γ± baja', any: ['γ', 'actividad', 'coeficiente'] }, { label: 'sube la solubilidad', any: ['aument', 'sube', 'más solub', 'mayor solub'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **la ley límite de Debye–Hückel**.',
            pretest: q('m2-pre1', 'Adivina antes: ¿por qué γ± < 1 en una solución de electrolito?', [{ text: 'Cada ion está rodeado por una nube de iones de carga contraria que lo estabiliza', correct: true }, { text: 'Los iones se repelen y se van a las paredes', note: 'No es repulsión: la nube de contraiones los estabiliza.' }, { text: 'El agua se evapora más rápido', note: 'No tiene relación.' }],
              { concept: 'ion.debye', explain: 'μ_real < μ_ideal por la atmósfera iónica.', slide: 53 }),
            explain: [
              { id: 'm2b1', concept: 'ion.debye', title: 'La ley límite de Debye–Hückel', slide: 52, body: '**Atmósfera iónica**: cada ion atrae iones de carga contraria y esa nube lo estabiliza (μ_real < μ_ideal, γ± < 1). **Ley límite: log γ± = −A·|z₊z₋|·√I**, con A = 0,509 (mol/kg)^(−1/2) en agua a 25 °C y válida para **I < 0,01 m**. Más carga o más I → menor γ±.',
                deeper: 'Pasos: **(1)** I = ½ Σ mᵢzᵢ²; **(2)** log γ± = −0,509·|z₊z₋|·√I (siempre negativo); **(3)** γ± = 10^(log γ±). Para un ion solo: log γᵢ = −0,509·zᵢ²·√I.' },
              { id: 'm2b2', concept: 'ion.debye', title: 'Ejemplo de la clase: CaCl₂ 0,005 m', slide: 61, body: 'I = ½(0,005·2² + 0,010·1²) = **0,015 m** → log γ± = −0,509·2·√0,015 = **−0,125** → **γ± = 0,75**. m± = 4^(1/3)·0,005 = 0,00794 m → **a± = 0,75 × 0,00794 ≈ 5,96 × 10⁻³**.',
                deeper: 'a± es adimensional (se divide por m° = 1 mol/kg). Estos tres pasos (I → log γ± → γ±) los repetirás en cada ejercicio de la PEP.' }
            ],
            practice: [
              num('m2-p1', 'MgCl₂ 0,002 m (A = 0,509): calcula la fuerza iónica I.', 0.006, 'mol/kg',
                { concept: 'ion.fuerza', label: 'I', slide: 88, tol: 0.01, hint: 'm(Mg²⁺) = 0,002; m(Cl⁻) = 0,004.', traps: [{ value: 0.002, note: 'Esa es la molalidad de la sal.', misconception: 'ion-nu' }, { value: 0.004, note: 'No elevaste la carga al cuadrado: ½(0,002·2 + 0,004).', misconception: 'ion-z2' }],
                  solution: ['I = ½(0,002·2² + 0,004·1²) = ½(0,008 + 0,004)', 'I = 0,006 mol/kg'], explain: 'I = 0,006 mol/kg.' }),
              num('m2-p2', 'Con I = 0,006 m, calcula γ± de MgCl₂ (|z₊z₋| = 2).', 0.834, '',
                { concept: 'ion.debye', label: 'γ±', slide: 61, tol: 0.01, hint: 'log γ± = −0,509·2·√0,006.', traps: [{ value: 0.913, note: 'Usaste |z₊z₋| = 1.', misconception: 'log-dir' }, { value: -0.0789, note: 'Ese es log γ±: falta el 10^x.', misconception: 'log-dir' }],
                  solution: ['log γ± = −0,509 · 2 · √0,006 = −0,0789', 'γ± = 10^(−0,0789) = 0,834'], explain: 'γ± = 0,834.' }),
              q('m2-p3', 'Con I = 0,006 m, ¿cuál tiene menor coeficiente de actividad individual?', [{ text: 'Mg²⁺ (γ ≈ 0,70)', correct: true }, { text: 'Cl⁻ (γ ≈ 0,91)', note: 'Con carga 1, z² = 1: se aleja menos de 1.' }, { text: 'Los dos iguales', note: 'log γᵢ = −0,509·zᵢ²·√I depende de la carga.' }],
                { concept: 'ion.debye', explain: 'log γ(Mg²⁺) = −0,509·4·√0,006 = −0,158 → 0,70; log γ(Cl⁻) = −0,509·√0,006 = −0,039 → 0,91.', slide: 52, hint: 'La carga va al cuadrado.' }),
              order('m2-p4', 'Ordena los pasos para obtener γ± con la ley límite:', [['a', 'Escribir la disociación y las molalidades de cada ion'], ['b', 'Calcular I = ½ Σ mᵢzᵢ²'], ['c', 'Calcular log γ± = −0,509·|z₊z₋|·√I'], ['d', 'Elevar 10 al resultado: γ± = 10^(log γ±)']], ['a', 'b', 'c', 'd'],
                { concept: 'ion.debye', direction: 'Primero lo primero.', explain: 'Iones → I → log γ± → γ±.', slide: 61, hint: 'El 10^x va al final.' })
            ],
            rule: { title: 'Regla del sabio: γ± por Debye–Hückel', concept: 'ion.debye', steps: ['Disociación y molalidad de cada ion', 'I = ½ Σ mᵢzᵢ²', 'log γ± = −0,509·|z₊z₋|·√I (negativo)', 'γ± = 10^(log γ±), siempre menor que 1'] } },
          { id: 'r2', intro: 'Parte 2: **solubilidad y acidez con actividades**.',
            pretest: q('m2-pre2', 'Adivina antes: el AgCl se disuelve en KNO₃ 0,1 M (sin iones comunes). ¿Se disuelve…?', [{ text: 'Más que en agua pura', correct: true }, { text: 'Menos que en agua pura', note: 'Sin ion común no hay efecto de ion común; la fuerza iónica sube y γ± baja.' }, { text: 'Igual que en agua pura', note: 'La fuerza iónica sí cambia la solubilidad.' }],
              { concept: 'ion.kps', explain: 'Efecto salino primario (salting-in).', slide: 85 }),
            explain: [
              { id: 'm2b3', concept: 'ion.kps', title: 'Solubilidad: Kps con actividades', slide: 83, body: '**K°ps = a(Ag⁺)·a(Cl⁻) = γ±²·Kps**, donde Kps = [Ag⁺][Cl⁻] es el producto aparente. Para una sal 1:1, s = √Kps. Con la ley límite: **log(s/s₀) = 0,509·|z₊z₋|·√I**. Al subir I, γ± baja y **s sube**: **efecto salino primario (salting-in)**. Con I muy alta hay menos agua libre y la solubilidad vuelve a bajar: **salting-out**.',
                deeper: 'AgCl: Kps = 1,6 × 10⁻¹⁰ → s₀ = 1,3 × 10⁻⁵ M. En KNO₃ con I = 0,10: log(s/s₀) = 0,509·1·√0,10 = 0,161 → s/s₀ = 1,45: se disuelve 45 % más. Para sales z₊z₋ altos (como CaC₂O₄, 2:2) el efecto es mayor: hay que iterar porque I depende de s.' },
              { id: 'm2b4', concept: 'ion.ka', title: 'Constante de acidez con actividades', slide: 99, body: '**K°a = a(H⁺)a(A⁻)/a(HA) = γ±²·[H⁺][A⁻]/[HA]** (con a(HA) ≈ [HA]). La constante en concentraciones es **K′a = [H⁺][A⁻]/[HA] = K°a/γ±²**, y para un ácido débil monoprótico I = αC₀ (diap. 100).',
                deeper: 'Ácido acético 0,10 M (K°a = 1,8 × 10⁻⁵): α = 0,0133, I = αC₀ = 1,33 × 10⁻³ m, γ± = 10^(−0,509·√0,001333) = 0,958 → K′a = 1,8 × 10⁻⁵/0,958² = 1,96 × 10⁻⁵ (≈ 9 % mayor). Con I tan baja, la corrección es pequeña.' }
            ],
            practice: [
              num('m2-p5', 'Oxalato de calcio, Kps = 3,0 × 10⁻⁹. Calcula la solubilidad ideal s₀ = √Kps.', 5.48e-5, 'M',
                { concept: 'ion.kps', label: 's₀', slide: 95, tol: 0.02, hint: 'Ca²⁺ y C₂O₄²⁻ salen 1:1.', traps: [{ value: 3.0e-9, note: 'Ese es el Kps: falta sacar la raíz.' }, { value: 1.5e-9, note: 'Dividiste por 2: s = √Kps.' }],
                  solution: ['CaC₂O₄ ⇌ Ca²⁺ + C₂O₄²⁻: Kps = s²', 's₀ = √(3,0 × 10⁻⁹) = 5,48 × 10⁻⁵ M'], explain: 's₀ = 5,48 × 10⁻⁵ M.' }),
              num('m2-p6', 'Con la corrección de Debye–Hückel (1ª iteración: I = 4s₀ y s = s₀/γ±), ¿cuál es la solubilidad del CaC₂O₄?', 5.87e-5, 'M',
                { concept: 'ion.kps', label: 's', slide: 95, tol: 0.02, hint: 'I = ½(s·4 + s·4) = 4s; |z₊z₋| = 4.', traps: [{ value: 5.48e-5, note: 'Esa es la solubilidad ideal: falta corregir con γ±.', misconception: 'ps-gamma' }, { value: 5.11e-5, note: 'Multiplicaste por γ± en vez de dividir: la solubilidad sube.', misconception: 'ps-gamma' }],
                  solution: ['I = 4 · 5,48 × 10⁻⁵ = 2,19 × 10⁻⁴ m', 'log γ± = −0,509 · 4 · √(2,19 × 10⁻⁴) = −0,0301 → γ± = 0,933', 's = s₀/γ± = 5,48 × 10⁻⁵/0,933 = 5,87 × 10⁻⁵ M (≈ 7 % más)'], explain: 's ≈ 5,9 × 10⁻⁵ M, algo mayor que la ideal.' }),
              q('m2-p7', 'A una solución saturada de AgCl se le agrega KNO₃ (sin ion común). La solubilidad del AgCl…', [{ text: 'Aumenta (salting-in)', correct: true }, { text: 'Disminuye por efecto de ion común', note: 'El KNO₃ no aporta Ag⁺ ni Cl⁻: no hay ion común.', misconception: 'ps-gamma' }, { text: 'No cambia', note: 'La fuerza iónica baja γ± y sube s.' }],
                { concept: 'ion.kps', explain: 'Sube I → baja γ± → sube la solubilidad.', slide: 85, hint: '¿Qué cambia: Kps termodinámico o aparente?' }),
              num('m2-p8', 'Ácido acético 0,10 M, Ka = 1,8 × 10⁻⁵: calcula el grado de disociación α.', 0.0133, '',
                { concept: 'ion.ka', label: 'α', slide: 102, tol: 0.02, hint: 'Ka = C₀α²/(1 − α).', traps: [{ value: 1.33e-3, note: 'Esa es [H⁺] en mol/L, no α (que es [H⁺]/C₀).' }],
                  solution: ['Ka = x²/(0,10 − x) = 1,8 × 10⁻⁵ → x = 1,33 × 10⁻³ M', 'α = x/C₀ = 0,0133 (1,3 %)'], explain: 'α = 0,0133.' }),
              match('m2-p9', 'Une cada fenómeno con su explicación:', [['Salting-in (efecto salino primario)', 'Sube I → baja γ± → sube la solubilidad'], ['Salting-out (efecto salino secundario)', 'I muy alta: menos agua libre → baja la solubilidad'], ['K°ps', 'γ±²·Kps: constante termodinámica'], ['Pares iónicos', 'Más frecuentes con constante dieléctrica baja o z altos']],
                { concept: 'ion.kps', explain: 'Cada efecto viene de la fuerza iónica o del solvente.', slide: 86, hint: 'Piensa en cuánta agua queda libre.' })
            ],
            rule: { title: 'Regla del sabio: solubilidad y Ka con actividades', concept: 'ion.kps', steps: ['K°ps = γ±²·Kps; s₀ = √Kps (sal 1:1)', 'Calcula I (depende de s) y γ± con la ley límite', 's = s₀/γ±: la solubilidad sube con I', 'K′a = K°a/γ±² con I = αC₀'] } }
        ]
      },
      {
        id: 'm3', title: 'Conductividad de electrolitos', subtitle: 'κ, Λm, Kohlrausch, Ostwald y números de transporte', minutes: 35, slides: '27–43, 62–64', pep: 'P3: conductividad y equilibrio iónico',
        stages: {
          hook: { title: 'El agua de la farmacia se controla con un conductímetro', sage: 'La USP pide que el agua purificada conduzca como máximo 1,3 µS/cm. Un conductímetro mide cuántos iones hay y qué tan rápido se mueven: por eso detecta cualquier contaminación al tiro.',
            text: 'La conductividad también permite sacar constantes de equilibrio: con Λm y Λ° se calcula α y de ahí Ka (ley de Ostwald). En el laboratorio de FQ II lo harás con un ácido débil.' },
          diagnostic: [
            q('m3-d1', 'Los metales conducen la electricidad con…, las soluciones de electrolitos con…', [{ text: 'electrones; iones', correct: true }, { text: 'iones; electrones', note: 'Al revés.' }, { text: 'electrones; moléculas neutras', note: 'Las moléculas neutras no transportan carga.' }],
              { concept: 'ion.conductividad', explain: 'En las soluciones, los iones transportan masa y carga.', slide: 30 }),
            q('m3-d2', 'Al diluir un electrolito débil, su conductividad molar Λm…', [{ text: 'Aumenta (α sube)', correct: true }, { text: 'Disminuye', note: 'Más agua, más disociación: α y Λm suben.' }, { text: 'No cambia', note: 'Λm depende de α en los débiles.' }],
              { concept: 'ion.conductividad', explain: 'Al diluir, α ↑ y Λm ↑ (diap. 39).', slide: 39 })
          ],
          fundamentals: [
            { id: 'f3', concept: 'base.ohm', title: 'Desde cero: resistencia, conductancia y unidades', slide: 32, body: 'La **resistencia** R se mide en ohm (Ω). La **conductancia** G = 1/R se mide en siemens (S). Si se mide en una celda de largo l y área A: **R = ρ·l/A** y la **constante de celda** es **Kcel = l/A** (cm⁻¹ o m⁻¹).',
              deeper: 'Mayor resistencia → menor conductancia. Una celda con Kcel = 0,85 cm⁻¹ y R = 603 Ω tiene G = 1/603 = 1,66 × 10⁻³ S. Unidades: 1 S/m = 0,01 S/cm; 1 mol/L = 1000 mol/m³.' }
          ],
          explain: [],
          transfer: [
            num('m3-t1', 'Estilo PEP: celda con Kcel = 0,85 cm⁻¹ y R = 603 Ω para KCl 0,010 M. Calcula Λm.', 141, 'S cm²/mol',
              { concept: 'ion.conductividad', label: 'Λm', slide: 64, tol: 0.02, traps: [{ value: 1.41e-3, note: 'Esa es κ en S/cm; falta dividir por la concentración (en mol/cm³).' }, { value: 1.41, note: 'Pasaste mal las unidades de la concentración (1 L = 1000 cm³).' }],
                solution: ['κ = Kcel/R = 0,85/603 = 1,41 × 10⁻³ S/cm', 'c = 0,010 mol/L = 1,0 × 10⁻⁵ mol/cm³', 'Λm = κ/c = 1,41 × 10⁻³/1,0 × 10⁻⁵ = 141 S cm²/mol'], explain: 'Λm ≈ 141 S cm²/mol.' }),
            write('m3-w1', 'Enséñale a tu compañero: ¿por qué el H⁺ tiene una conductividad iónica tan alta (λ° = 349,8) frente al Na⁺ (50,1)?', 'El H⁺ no viaja como un ion pesado hidratado: la carga "salta" entre moléculas de agua vecinas por los enlaces de hidrógeno (mecanismo de Grotthuss). Se transporta la carga, no el ion, y eso lo hace unas 7 veces más conductor.',
              ['Mecanismo de Grotthuss: el protón salta entre moléculas de agua', 'Se transporta la carga, no el ion', 'Por eso λ° del H⁺ es mucho mayor que la del Na⁺'],
              { concept: 'ion.conductividad', explain: 'El OH⁻ conduce por un mecanismo análogo.', slide: 41, teach: true, keywords: [{ label: 'Grotthuss / salto', any: ['grotthuss', 'salt', 'enlaces de hidr'] }, { label: 'carga, no el ion', any: ['carga', 'no el ion', 'no viaja'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **de la resistencia a la conductividad molar**.',
            pretest: q('m3-pre1', 'Adivina antes: ¿qué mide la constante de celda Kcel?', [{ text: 'La geometría de la celda: Kcel = l/A', correct: true }, { text: 'La concentración de la solución', note: 'Eso lo da c.' }, { text: 'La temperatura del baño', note: 'No tiene relación.' }],
              { concept: 'ion.conductividad', explain: 'Kcel = l/A; se calibra con KCl 0,01 M.', slide: 32 }),
            explain: [
              { id: 'm3b1', concept: 'ion.conductividad', title: 'Conductividad κ y conductividad molar Λm', slide: 32, body: '**G = 1/R** (S). **κ = G·l/A = Kcel/R** (S/m o S/cm). **Λm = κ/c** (S m² mol⁻¹ o S cm² mol⁻¹): la conductividad por mol de electrolito. Cuidado con las unidades: 0,100 M = 100 mol/m³.',
                deeper: 'KCl 0,100 M: κ = 1,289 S/m, c = 100 mol/m³ → Λm = 0,01289 S m²/mol = 128,9 S cm²/mol (diap. 35). Se mide con corriente alterna (≈ 1 kHz) y se calibra con KCl 0,01 M: κ = 1413 µS/cm a 25 °C.' }
            ],
            practice: [
              num('m3-p1', 'Kcel = 0,85 cm⁻¹ y R = 603 Ω: calcula κ.', 1.41e-3, 'S/cm',
                { concept: 'ion.conductividad', label: 'κ', slide: 64, tol: 0.01, hint: 'κ = Kcel/R.', traps: [{ value: 512.6, note: 'Multiplicaste Kcel por R; κ = Kcel/R.' }],
                  solution: ['κ = 0,85 cm⁻¹ / 603 Ω = 1,41 × 10⁻³ S/cm'], explain: 'κ = 1,41 × 10⁻³ S/cm.' }),
              num('m3-p2', 'KCl 0,100 M con κ = 1,289 S/m. Calcula Λm en S m²/mol.', 0.01289, 'S m²/mol',
                { concept: 'ion.conductividad', label: 'Λm', slide: 35, tol: 0.01, hint: 'c = 0,100 M = 100 mol/m³.', traps: [{ value: 12.89, note: 'Usaste c = 0,100 en vez de 100 mol/m³.' }],
                  solution: ['c = 100 mol/m³', 'Λm = 1,289/100 = 0,01289 S m²/mol'], explain: 'Λm = 0,01289 S m²/mol = 128,9 S cm²/mol.' }),
              order('m3-p3', 'Ordena los pasos para obtener Λm desde el laboratorio:', [['a', 'Medir la resistencia R de la solución'], ['b', 'Calcular κ = Kcel/R'], ['c', 'Pasar c a las unidades de κ (mol/m³ o mol/cm³)'], ['d', 'Calcular Λm = κ/c']], ['a', 'b', 'c', 'd'],
                { concept: 'ion.conductividad', direction: 'Primero lo primero.', explain: 'R → κ → unidades → Λm.', slide: 35, hint: 'Λm necesita la concentración.' }),
              classify('m3-p4', 'Clasifica cada sustancia en agua:', [['f', 'Electrolito fuerte'], ['d', 'Electrolito débil'], ['n', 'No electrolito']], [['a', 'NaCl', 'f'], ['b', 'HCl', 'f'], ['c', 'CH₃COOH', 'd'], ['e', 'NH₃', 'd'], ['g', 'Glucosa', 'n']],
                { concept: 'ion.electrolitos', explain: 'Fuertes: sales y ácidos/bases fuertes; débiles: ácidos y bases débiles; glucosa no libera iones.', slide: 27, hint: '¿Se separa en iones por completo?' })
            ],
            rule: { title: 'Regla del sabio: de R a Λm', concept: 'ion.conductividad', steps: ['κ = Kcel/R', 'Convierte c a mol/m³ (×1000 desde M) o mol/cm³ (÷1000)', 'Λm = κ/c con unidades coherentes'] } },
          { id: 'r2', intro: 'Parte 2: **Kohlrausch, Ostwald y transporte**.',
            pretest: q('m3-pre2', 'Adivina antes: ¿se puede medir Λ° del ácido acético extrapolando a c → 0?', [{ text: 'No: en un débil la caída es brusca; se calcula con la ley de migración independiente', correct: true }, { text: 'Sí, igual que en el KCl', note: 'En los débiles la curva sube casi vertical al diluir.' }, { text: 'No existe el Λ° del ácido acético', note: 'Sí existe: 390,7 S cm²/mol.' }],
              { concept: 'ion.conductividad', explain: 'Λ°(HAc) = Λ°(HCl) + Λ°(NaAc) − Λ°(NaCl).', slide: 38 }),
            explain: [
              { id: 'm3b2', concept: 'ion.conductividad', title: 'Kohlrausch y Ostwald', slide: 38, body: '**Fuertes**: Λm = Λ°m − K√c (recta); extrapolar a c → 0 da Λ°m. **Migración independiente**: **Λ°m = ν₊λ°₊ + ν₋λ°₋**. Así, Λ°(HAc) = Λ°(HCl) + Λ°(NaAc) − Λ°(NaCl) = 426,2 + 91,0 − 126,5 = 390,7 S cm²/mol. **Ostwald** (débiles): **α = Λm/Λ°m** y **Ka = cα²/(1 − α)**.',
                deeper: 'CH₃COOH 0,100 M con Λm = 5,20 S cm²/mol: α = 5,20/390,7 = 0,0133 → Ka = 0,100·0,0133²/(1 − 0,0133) = 1,8 × 10⁻⁵ (diap. 39). Al diluir: α ↑ y Λm ↑.' },
              { id: 'm3b3', concept: 'ion.conductividad', title: 'Movilidad y números de transporte', slide: 42, body: '**t₊ = I₊/I = λ₊/(λ₊ + λ₋)** y **t₊ + t₋ = 1**. Con λ° (S cm²/mol): H⁺ 349,8; OH⁻ 198,6; Cl⁻ 76,3; K⁺ 73,5; Na⁺ 50,1; Li⁺ 38,7. HCl: el H⁺ lleva ≈ 82 % de la corriente; KCl: t₊ ≈ t₋ (por eso se usa en puentes salinos).',
                deeper: 't₊(HCl) = 349,8/(349,8 + 76,3) = 0,82. Método de Hittorf: si el ánodo pierde 3 pares y el cátodo 1, t₊/t₋ = 3 y t₊ = 0,75 (diap. 43).' }
            ],
            practice: [
              num('m3-p5', 'Con Λ°(NH₄Cl) = 149,7; Λ°(NaOH) = 247,8 y Λ°(NaCl) = 126,5 S cm²/mol, calcula Λ°(NH₄OH).', 271.0, 'S cm²/mol',
                { concept: 'ion.conductividad', label: 'Λ°', slide: 64, tol: 0.01, hint: 'NH₄OH = NH₄Cl + NaOH − NaCl.', traps: [{ value: 524.0, note: 'Sumaste las tres: hay que restar Λ°(NaCl) porque Na⁺ y Cl⁻ sobran.' }],
                  solution: ['Λ°(NH₄OH) = Λ°(NH₄Cl) + Λ°(NaOH) − Λ°(NaCl)', '= 149,7 + 247,8 − 126,5 = 271,0 S cm²/mol'], explain: 'Λ° = 271,0 S cm²/mol.' }),
              num('m3-p6', 'CH₃COOH 0,100 M con Λm = 5,20 y Λ° = 390,7 S cm²/mol. Calcula Ka (ley de Ostwald).', 1.8e-5, '',
                { concept: 'ion.conductividad', label: 'Ka', slide: 39, tol: 0.03, hint: 'α = Λm/Λ°; Ka = cα²/(1 − α).', traps: [{ value: 0.0133, note: 'Ese es α: falta Ka = cα²/(1 − α).' }, { value: 1.33e-3, note: 'Ese es αc = [H⁺]; falta Ka = cα²/(1 − α).' }],
                  solution: ['α = 5,20/390,7 = 0,0133', 'Ka = 0,100 · 0,0133²/(1 − 0,0133) = 1,8 × 10⁻⁵'], explain: 'Ka = 1,8 × 10⁻⁵.' }),
              num('m3-p7', 'En HCl, ¿cuánto vale t₊ con λ°(H⁺) = 349,8 y λ°(Cl⁻) = 76,3?', 0.82, '',
                { concept: 'ion.conductividad', label: 't₊', slide: 42, tol: 0.01, hint: 't₊ = λ₊/(λ₊ + λ₋).', traps: [{ value: 0.18, note: 'Ese es t₋ del Cl⁻.' }, { value: 4.58, note: 'Dividiste λ₊/λ₋: t₊ usa la suma en el denominador.' }],
                  solution: ['t₊ = 349,8/(349,8 + 76,3) = 0,82'], explain: 't₊ = 0,82: el H⁺ lleva 82 % de la corriente.' }),
              q('m3-p8', 'Un electrolito débil se diluye. ¿Qué pasa con α y Λm?', [{ text: 'Ambos aumentan', correct: true }, { text: 'α disminuye y Λm aumenta', note: 'Al diluir, el equilibrio se desplaza hacia más iones: α sube.' }, { text: 'Ambos disminuyen', note: 'Con más agua se disocia más.' }],
                { concept: 'ion.conductividad', explain: 'Ostwald: α = Λm/Λ°m; más dilución, más disociación.', slide: 39, hint: 'Piensa en Le Châtelier.' }),
              match('m3-p9', 'Une cada idea con su ejemplo:', [['Mecanismo de Grotthuss', 'El H⁺ conduce 7 veces más que el Na⁺'], ['Puente salino ideal', 'KCl: t₊ ≈ t₋'], ['Electrolito débil', 'Λm sube mucho al diluir (α sube)'], ['Migración independiente', 'Λ°m = ν₊λ°₊ + ν₋λ°₋']],
                { concept: 'ion.conductividad', explain: 'Cada ion aporta por separado; el H⁺ es una excepción por su mecanismo.', slide: 42, hint: 'Piensa en quién lleva la corriente.' })
            ],
            rule: { title: 'Regla del sabio: conductividad y equilibrio', concept: 'ion.conductividad', steps: ['Λ°m = ν₊λ°₊ + ν₋λ°₋ (suma o resta de sales)', 'α = Λm/Λ°m', 'Ka = cα²/(1 − α)', 't₊ = λ₊/(λ₊ + λ₋)'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.molal', title: 'Molalidad e iones por fórmula', subtitle: 'Cuántos iones salen de cada sal', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.molal', title: 'Molalidad e iones por fórmula', slide: 13, body: 'La **molalidad** m = mol de soluto / kg de solvente. Una sal MᵥXᵥ da **ν₊** cationes y **ν₋** aniones por fórmula: m₊ = ν₊·m y m₋ = ν₋·m.',
            deeper: 'Ejemplo: Al₂(SO₄)₃ 0,10 m → Al³⁺ 0,20 m y SO₄²⁻ 0,30 m. Revisa que las cargas sumen cero: 0,20·3 − 0,30·2 = 0.' }],
          practice: [q('z1-p1', 'MgCl₂ 0,10 m. ¿Cuánto vale m(Cl⁻)?', [{ text: '0,20 m', correct: true }, { text: '0,10 m', note: 'Esa es la molalidad de la sal.' }, { text: '0,30 m', note: 'Esa suma los dos iones.' }], { concept: 'base.molal', explain: 'Cada MgCl₂ da 2 Cl⁻.', slide: 13, hint: '¿Cuántos Cl⁻ por fórmula?' })],
          transfer: [write('z1-w1', 'Explica con tus palabras cómo pasas de la molalidad de una sal a la de cada ion.', 'Escribo la disociación para ver cuántos cationes y aniones salen por fórmula (ν₊ y ν₋); la molalidad de cada ion es ν₊ o ν₋ veces la de la sal. Compruebo que las cargas se compensen.',
            ['Escribir la disociación y los coeficientes ν₊, ν₋', 'm₊ = ν₊·m y m₋ = ν₋·m', 'Revisar que las cargas se compensen'],
            { concept: 'base.molal', explain: 'Siempre cuenta iones, no sales.', slide: 13, keywords: [{ label: 'disociación / ν', any: ['disocia', 'ν', 'coeficiente', 'estequiom'] }, { label: 'multiplicar por la molalidad', any: ['multipl', 'veces', 'm₊', 'cada ion'] }] })]
        } },
      { id: 'z2', concept: 'base.log10', title: 'Potencias de 10 y logaritmos', subtitle: 'Cómo pasar de log γ a γ', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.log10', title: 'Potencias de 10 y logaritmos', slide: 52, body: '**log x** es el exponente de 10 que da x. Si log γ = −0,125, **γ = 10^(−0,125) = 0,75**. Un log negativo da un número entre 0 y 1.',
            deeper: 'log 1 = 0; log 10 = 1; log 0,1 = −1. √I = I^(1/2): √0,015 = 0,1225. Para 10^x usa la tecla "10ˣ" de la calculadora.' }],
          practice: [q('z2-p1', 'Si log γ± = −0,30, entonces γ± vale aproximadamente', [{ text: '0,50', correct: true }, { text: '−0,50', note: 'Una potencia de 10 nunca es negativa.' }, { text: '2,0', note: 'Con exponente negativo el resultado es menor que 1.' }], { concept: 'base.log10', explain: '10^(−0,30) = 0,50.', slide: 52, hint: '10 elevado a un exponente negativo.' })],
          transfer: [write('z2-w1', 'Explica con tus palabras cómo se pasa de log γ± a γ± y por qué γ± < 1.', 'Elevo 10 al valor de log γ±: γ± = 10^(log γ±). Como log γ± = −A|z₊z₋|√I es negativo, el resultado es un número entre 0 y 1.',
            ['γ± = 10^(log γ±)', 'log γ± es negativo', 'Por eso γ± queda entre 0 y 1'],
            { concept: 'base.log10', explain: 'Exponente negativo → menor que 1.', slide: 52, keywords: [{ label: '10 elevado', any: ['10^', 'elev', 'potencia'] }, { label: 'negativo → menor que 1', any: ['negativ', 'menor que 1', 'entre 0'] }] })]
        } },
      { id: 'z3', concept: 'base.ohm', title: 'Resistencia, conductancia y unidades', subtitle: 'De ohm a siemens y de M a mol/m³', minutes: 6,
        stages: {
          explain: [{ id: 'z3b1', concept: 'base.ohm', title: 'Resistencia, conductancia y unidades', slide: 32, body: '**G = 1/R**: la conductancia (S) es la inversa de la resistencia (Ω). **κ = Kcel/R** (S/cm si Kcel está en cm⁻¹). 1 mol/L = 1000 mol/m³ = 10⁻³ mol/cm³.',
            deeper: 'Ejemplo: R = 500 Ω → G = 0,0020 S. Con Kcel = 1,0 cm⁻¹: κ = 2,0 × 10⁻³ S/cm = 2000 µS/cm.' }],
          practice: [q('z3-p1', 'Si R = 200 Ω, la conductancia G vale', [{ text: '0,005 S', correct: true }, { text: '200 S', note: 'G es la inversa de R, no es igual.' }, { text: '0,5 S', note: '1/200 = 0,005.' }], { concept: 'base.ohm', explain: 'G = 1/200 = 0,005 S.', slide: 32, hint: 'G = 1/R.' })],
          transfer: [write('z3-w1', 'Explica con tus palabras qué es la constante de celda y para qué sirve.', 'La constante de celda es Kcel = l/A, la geometría de la celda (largo sobre área). Sirve para pasar de la resistencia medida a la conductividad: κ = Kcel/R; se calibra con una solución patrón de KCl.',
            ['Kcel = l/A: geometría de la celda', 'κ = Kcel/R', 'Se calibra con KCl 0,01 M'],
            { concept: 'base.ohm', explain: 'Sin Kcel no hay κ.', slide: 34, keywords: [{ label: 'geometría / l/A', any: ['l/a', 'geometr', 'largo', 'área', 'area'] }, { label: 'calibra / KCl', any: ['calibr', 'kcl', 'patrón', 'patron'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-I', title: 'Fuerza iónica', formula: 'I = ½ Σ mᵢ zᵢ²', concepts: ['ion.fuerza'], vars: [['mᵢ', 'molalidad de cada ion', 'mol/kg'], ['zᵢ', 'carga del ion', '—']],
        what: 'Medir cuántas cargas hay en la solución.', when: 'Antes de Debye–Hückel, solubilidad o Ka.', example: 'Na₂SO₄ 0,10 m → I = 0,30 mol/kg.', deeper: 'La carga va al cuadrado: Al³⁺ pesa 9 veces más que Na⁺.',
        sources: [{ label: 'Clase 5 · fuerza iónica', slide: 21 }, { label: 'Tabla de sales 0,10 m', slide: 46 }],
        calc: { inputs: [{ id: 'm1', label: 'm del catión (mol/kg)', value: 0.2, step: 0.001 }, { id: 'z1', label: 'z del catión', value: 1, step: 1 }, { id: 'm2', label: 'm del anión (mol/kg)', value: 0.1, step: 0.001 }, { id: 'z2', label: 'z del anión', value: 2, step: 1 }], run: v => 'I = **' + (0.5 * (v.m1 * v.z1 * v.z1 + v.m2 * v.z2 * v.z2)).toFixed(4).replace('.', ',') + ' mol/kg**' } },
      { id: 'f-act', title: 'Actividad iónica media', formula: 'm± = (m₊^ν₊ · m₋^ν₋)^(1/ν) · a± = γ±·m±', concepts: ['ion.actividad'], vars: [['ν', 'ν₊ + ν₋ (iones por fórmula)', '—'], ['γ±', 'coeficiente de actividad iónico medio', '—']],
        what: 'La concentración "efectiva" de una sal.', when: 'Cuando la solución no es ideal.', example: 'CaCl₂ 0,010 m → m± = 0,0159 m.', deeper: 'Es una media geométrica, no aritmética.',
        sources: [{ label: 'Clase 5 · actividad iónica media', slide: 16 }, { label: 'Ejemplo CaCl₂', slide: 45 }],
        calc: { inputs: [{ id: 'mp', label: 'm del catión', value: 0.01, step: 0.001 }, { id: 'vp', label: 'ν₊', value: 1, step: 1 }, { id: 'mm', label: 'm del anión', value: 0.02, step: 0.001 }, { id: 'vm', label: 'ν₋', value: 2, step: 1 }], run: v => 'm± = **' + Math.pow(Math.pow(v.mp, v.vp) * Math.pow(v.mm, v.vm), 1 / (v.vp + v.vm)).toFixed(5).replace('.', ',') + ' mol/kg**' } },
      { id: 'f-dh', title: 'Ley límite de Debye–Hückel', formula: 'log γ± = −0,509 · |z₊z₋| · √I   (25 °C, agua, I < 0,01 m)', concepts: ['ion.debye'], vars: [['|z₊z₋|', 'producto de cargas en valor absoluto', '—'], ['I', 'fuerza iónica', 'mol/kg']],
        what: 'Estimar γ± de una sal en solución diluida.', when: 'Siempre que te pidan corregir una constante o una actividad.', example: 'CaCl₂ 0,005 m: I = 0,015 → γ± = 0,75.', deeper: 'γ± < 1 siempre: la atmósfera iónica estabiliza.',
        sources: [{ label: 'Clase 5 · ley límite', slide: 52 }, { label: 'Ejercicio CaCl₂ 0,005 m', slide: 61 }],
        calc: { inputs: [{ id: 'zz', label: '|z₊z₋|', value: 2, step: 1 }, { id: 'I', label: 'I (mol/kg)', value: 0.015, step: 0.001 }], run: v => 'γ± = **' + Math.pow(10, -0.509 * v.zz * Math.sqrt(v.I)).toFixed(4).replace('.', ',') + '**' } },
      { id: 'f-kps', title: 'Solubilidad con la fuerza iónica', formula: 'K°ps = γ±²·Kps · log(s/s₀) = 0,509·|z₊z₋|·√I', concepts: ['ion.kps'], vars: [['s₀', 'solubilidad en agua pura (√Kps)', 'M'], ['s', 'solubilidad con I', 'M']],
        what: 'Cuánto cambia la solubilidad al agregar iones.', when: 'Sales poco solubles en medios con electrolitos.', example: 'AgCl en I = 0,10: s/s₀ = 1,45.', deeper: 'Con I muy alta aparece salting-out y la solubilidad baja.',
        sources: [{ label: 'Clase 5 · Kps y efecto salino', slide: 84 }, { label: 'AgCl en KNO₃', slide: 85 }],
        calc: { inputs: [{ id: 'zz', label: '|z₊z₋|', value: 1, step: 1 }, { id: 'I', label: 'I (mol/kg)', value: 0.1, step: 0.01 }], run: v => 's/s₀ = **' + Math.pow(10, 0.509 * v.zz * Math.sqrt(v.I)).toFixed(3).replace('.', ',') + '**' } },
      { id: 'f-ost', title: 'Conductividad y ley de Ostwald', formula: 'κ = Kcel/R · Λm = κ/c · α = Λm/Λ°m · Ka = cα²/(1 − α)', concepts: ['ion.conductividad'], vars: [['Kcel', 'constante de celda l/A', 'cm⁻¹'], ['Λ°m', 'conductividad molar límite', 'S cm²/mol']],
        what: 'Pasar de R a Λm y de Λm a Ka.', when: 'Conductimetría de un electrolito débil.', example: 'CH₃COOH 0,100 M: α = 0,0133 → Ka = 1,8 × 10⁻⁵.', deeper: 'Λ° del débil sale de Kohlrausch: Λ°(HAc) = 390,7.',
        sources: [{ label: 'Clase 5 · Λm y Ostwald', slide: 39 }, { label: 'Ecuaciones clave', slide: 63 }],
        calc: { inputs: [{ id: 'c', label: 'c (mol/L)', value: 0.1, step: 0.001 }, { id: 'L', label: 'Λm (S cm²/mol)', value: 5.2, step: 0.01 }, { id: 'L0', label: 'Λ°m (S cm²/mol)', value: 390.7, step: 0.1 }], run: v => { const a = v.L / v.L0; return 'α = **' + a.toFixed(4).replace('.', ',') + '** · Ka = **' + (v.c * a * a / (1 - a)).toExponential(2).replace('.', ',') + '**'; } } }
    ],
    recipes: [],
    mini: {
      'base.log10': { idea: 'log x es el exponente de 10 que da x.', steps: ['log 100 = 2; log 0,01 = −2', 'γ = 10^(log γ)', 'Log negativo → número entre 0 y 1'], check: { prompt: '10^(−1) vale…', options: [{ text: '0,1', correct: true }, { text: '−10', note: 'Un exponente negativo invierte, no cambia el signo.' }], explain: '10⁻¹ = 0,1.' } },
      'base.molal': { idea: 'De una sal salen varios iones por fórmula.', steps: ['Escribe la disociación', 'm₊ = ν₊·m y m₋ = ν₋·m', 'Revisa que las cargas se compensen'], check: { prompt: 'Na₃PO₄ 0,10 m: m(Na⁺) =', options: [{ text: '0,30 m', correct: true }, { text: '0,10 m', note: 'Esa es la de la sal.' }], explain: 'ν₊ = 3.' } },
      'base.ohm': { idea: 'Conductancia es lo contrario de resistencia.', steps: ['G = 1/R', 'κ = Kcel/R', 'Revisa unidades: cm o m'], check: { prompt: 'R = 100 Ω → G =', options: [{ text: '0,01 S', correct: true }, { text: '100 S', note: 'G = 1/R.' }], explain: '1/100.' } },
      'ion.electrolitos': { idea: 'Los iones siempre vienen en pareja y la solución es neutra.', steps: ['Fuerte: se disocia casi todo', 'Débil: se disocia poco', 'ν₊z₊ + ν₋z₋ = 0'], check: { prompt: 'En Na₂SO₄, ν₊z₊ + ν₋z₋ =', options: [{ text: '2(+1) + 1(−2) = 0', correct: true }, { text: '1(+1) + 1(−2) = −1', note: 'Hay 2 Na⁺ por fórmula.' }], explain: 'Neutro.' } },
      'ion.actividad': { idea: 'La actividad es la concentración que "actúa" de verdad.', steps: ['a = γ·m/m°', 'm± y γ± son medias geométricas', 'γ± → 1 al diluir'], check: { prompt: 'Si γ± = 0,80 y m± = 0,10 m, a± =', options: [{ text: '0,080', correct: true }, { text: '0,125', note: 'Dividiste: a± = γ±·m±.' }], explain: '0,80 × 0,10.' } },
      'ion.fuerza': { idea: 'I cuenta las cargas, y las cargas altas pesan al cuadrado.', steps: ['Molalidad de cada ion', 'Eleva z al cuadrado', 'I = ½ Σ mᵢzᵢ²'], check: { prompt: 'NaCl 0,20 m: I =', options: [{ text: '0,20 mol/kg', correct: true }, { text: '0,40 mol/kg', note: 'Falta el ½: ½(0,20 + 0,20).' }], explain: '½(0,20 + 0,20).' } },
      'ion.debye': { idea: 'Más cargas alrededor, más se estabiliza cada ion: γ± baja.', steps: ['I = ½ Σ mᵢzᵢ²', 'log γ± = −0,509|z₊z₋|√I', 'γ± = 10^(log γ±)'], check: { prompt: 'Con la ley límite, γ± siempre es…', options: [{ text: 'menor que 1', correct: true }, { text: 'mayor que 1', note: 'log γ± es negativo.' }], explain: '10^(negativo) < 1.' } },
      'ion.kps': { idea: 'Más iones alrededor → el sólido se disuelve más (hasta cierto punto).', steps: ['K°ps = γ±²·Kps', 's = s₀/γ±', 'I muy alta → salting-out'], check: { prompt: 'Sube I (sin ion común): la solubilidad…', options: [{ text: 'sube', correct: true }, { text: 'baja', note: 'Baja γ±, sube s.' }], explain: 'Salting-in.' } },
      'ion.ka': { idea: 'La constante verdadera usa actividades; la de concentraciones se corrige con γ±.', steps: ['K°a = γ±²·[H⁺][A⁻]/[HA]', 'K′a = K°a/γ±²', 'I = αC₀'], check: { prompt: 'Si γ± < 1, K′a (de concentraciones) es…', options: [{ text: 'mayor que K°a', correct: true }, { text: 'menor que K°a', note: 'K′a = K°a/γ±².' }], explain: '1/γ±² > 1.' } },
      'ion.conductividad': { idea: 'Más iones y más rápidos → más conducción; en un débil, α manda.', steps: ['κ = Kcel/R; Λm = κ/c', 'Λ°m = ν₊λ°₊ + ν₋λ°₋', 'α = Λm/Λ°m; Ka = cα²/(1 − α)'], check: { prompt: 'Si Λm = Λ°m, α =', options: [{ text: '1', correct: true }, { text: '0', note: 'α = Λm/Λ°m = 1 (disociación completa).' }], explain: 'Todo disociado.' } }
    },
    deep: {
      'ion.debye': { title: 'Por qué γ± < 1: la atmósfera iónica', sections: [['La imagen', 'Cada ion atrae una nube de iones de carga contraria; esa nube lo estabiliza y baja su potencial químico (μ_real < μ_ideal).'], ['Entalpía y entropía', 'La interacción coulómbica baja la entalpía (H_real < H_ideal), pero el orden de la nube también baja la entropía: gana la entalpía, por eso γ± < 1.'], ['Dilución infinita', 'Con m → 0 los iones están muy lejos: no hay nube ni apantallamiento y γ± → 1.']],
        challenge: { prompt: 'Si sube la carga de los iones (de 1:1 a 2:2) a igual I, γ±…', options: [{ text: 'Baja más', correct: true }, { text: 'Sube', note: '|z₊z₋| mayor → log γ± más negativo.' }], explain: 'log γ± = −0,509·|z₊z₋|·√I.' },
        sources: [{ label: 'Clase 5 · atmósfera iónica', slide: 53 }, { label: 'Clase 5 · ley límite', slide: 52 }] },
      'ion.conductividad': { title: 'Ostwald: de la conductividad al equilibrio', sections: [['La idea', 'En un electrolito débil solo la fracción α está disociada; Λm mide cuántos iones hay, así que α = Λm/Λ°m.'], ['El camino', 'Con Λ° (de Kohlrausch) y Λm (medido) sacas α, y con α la constante: Ka = cα²/(1 − α).'], ['Lo que se usa en el laboratorio', 'En el laboratorio de FQ II se mide la conductividad de ácido acético a varias diluciones para calcular Ka.']],
        challenge: { prompt: 'Si Λm = 3,90 y Λ° = 390,7 S cm²/mol, α =', options: [{ text: '0,010', correct: true }, { text: '0,10', note: '3,90/390,7 = 0,00998.' }], explain: 'α ≈ 0,010.' },
        sources: [{ label: 'Clase 5 · Ostwald', slide: 39 }, { label: 'Clase 5 · migración independiente', slide: 38 }] }
    },
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', 'log 0,01 =', [{ text: '−2', correct: true }, { text: '2', note: 'Con 0,01 el exponente es negativo.' }, { text: '−0,01', note: 'log da el exponente.' }], { concept: 'base.log10', explain: '10⁻² = 0,01.', slide: 52 }) },
      { level: 1, item: q('dx-2', 'CaCl₂ 0,010 m: m(Cl⁻) =', [{ text: '0,020 m', correct: true }, { text: '0,010 m', note: 'Cada CaCl₂ da 2 Cl⁻.', misconception: 'ion-nu' }, { text: '0,030 m', note: 'Esa suma los dos iones.' }], { concept: 'base.molal', explain: 'ν₋ = 2.', slide: 13 }) },
      { level: 2, item: q('dx-3', 'La fuerza iónica de NaCl 0,10 m es', [{ text: '0,10 mol/kg', correct: true }, { text: '0,20 mol/kg', note: 'Falta el ½.' }, { text: '0,050 mol/kg', note: 'Usaste solo un ion.' }], { concept: 'ion.fuerza', explain: '½(0,10 + 0,10).', slide: 21 }) },
      { level: 2, item: q('dx-4', 'Un electrolito fuerte en agua…', [{ text: 'Se disocia casi por completo y conduce bien', correct: true }, { text: 'Se disocia poco', note: 'Eso es un débil.' }, { text: 'No libera iones', note: 'Eso es un no electrolito.' }], { concept: 'ion.electrolitos', explain: 'Sales y ácidos/bases fuertes.', slide: 8 }) },
      { level: 2, item: q('dx-5', 'Con la ley límite, γ± de una sal diluida es', [{ text: 'Menor que 1', correct: true }, { text: 'Mayor que 1', note: 'log γ± es negativo.', misconception: 'gam-gt1' }, { text: 'Igual a 1 siempre', note: 'Solo a dilución infinita.' }], { concept: 'ion.debye', explain: 'γ± = 10^(−A|z₊z₋|√I) < 1.', slide: 52 }) },
      { level: 3, item: q('dx-6', 'MgSO₄ 0,010 m. ¿Cuánto vale I?', [{ text: '0,040 mol/kg', correct: true }, { text: '0,010 mol/kg', note: 'Esa es la molalidad de la sal.' }, { text: '0,020 mol/kg', note: 'No elevaste las cargas al cuadrado.', misconception: 'ion-z2' }], { concept: 'ion.fuerza', explain: '½(0,010·4 + 0,010·4).', slide: 46 }) },
      { level: 3, item: q('dx-7', 'Agregas KNO₃ a una solución saturada de AgCl. La solubilidad del AgCl…', [{ text: 'Aumenta', correct: true }, { text: 'Disminuye', note: 'No hay ion común.', misconception: 'ps-gamma' }, { text: 'No cambia', note: 'Cambia I y por tanto γ±.' }], { concept: 'ion.kps', explain: 'Salting-in.', slide: 85 }) }
    ] }
  };
})();
