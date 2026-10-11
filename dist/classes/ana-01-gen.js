/* Ejercicios infinitos de "El análisis químico y sus errores" (Química Analítica, PEP 1). Cada generador arma una pregunta nueva desde una semilla y un nivel:
   1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP. Los resultados se CALCULAN (nunca se escriben a mano).
   Datos: ejemplos de la clase de Etapas (Pizarro) y errores de Skoog (cap. 5–6). */
(() => {
  'use strict';
  const SRC = 'catedra-ana';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 2) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−');
  const fix = (x, d) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−'); // cifras fijas: 0,752 ppm
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  function number(prompt, answer, unit, extra) {
    const tol = extra.tol ?? 0.02, traps = (extra.traps || []).filter(t => Number.isFinite(t.value) && Math.abs(t.value - answer) > Math.abs(answer) * tol * 1.5);
    return { type: 'number', prompt, answer, unit, tol, ...extra, traps };
  }
  const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
  const sdev = (xs, n1 = true) => { const m = mean(xs); return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - (n1 ? 1 : 0))); };
  const replicas = (rng, center, spread, n, d) => Array.from({ length: n }, () => Number((center + (rng() - 0.5) * 2 * spread).toFixed(d)));

  /* ════════ Conceptos y tipos de análisis ════════
     Análisis reales armados como analito × muestra × método: hay que reconocer el rol de cada cosa y el tipo de método. */
  const take = (rng, list, n) => shuffle(rng, list).slice(0, n);
  const PAIRS = [
    ['plomo', 'sangre', 'proteínas, células y sales de la sangre', [2, 3, 4]], ['paracetamol', 'un comprimido', 'almidón, lactosa y demás excipientes', [0, 2, 4]],
    ['nitrato', 'agua de pozo', 'cloruros, sulfatos y materia orgánica del agua', [2, 3, 4]], ['cobre', 'un mineral', 'silicatos y óxidos de hierro', [0, 1, 2, 4]],
    ['ácido acético', 'vinagre', 'agua, colorantes y aromas', [0, 3, 4]], ['cafeína', 'una bebida energética', 'azúcares, colorantes y otros aditivos', [2, 4]],
    ['calcio', 'leche', 'proteínas, grasa y lactosa', [0, 1, 2]], ['hierro', 'un suplemento vitamínico', 'excipientes y otras vitaminas', [0, 2, 4]],
    ['fluoruro', 'agua potable', 'otros iones disueltos', [3, 4]], ['sulfato', 'agua de mar', 'cloruro de sodio y otras sales', [1, 2]], ['cloruro', 'suero fisiológico', 'agua y trazas de otros iones', [0, 1, 3]]
  ];
  const METHODS = [
    ['titulándolo con una solución patrón y midiendo el volumen gastado', 'Cuantitativo, volumétrico (clásico)'], ['precipitándolo, filtrando, secando y pesando el sólido', 'Cuantitativo, gravimétrico (clásico)'],
    ['midiendo la absorbancia frente a una curva de calibración', 'Cuantitativo, óptico (instrumental)'], ['midiendo el potencial con un electrodo selectivo', 'Cuantitativo, electroanalítico (instrumental)'],
    ['solo para saber si está presente, con una reacción de color o un espectro', 'Cualitativo']
  ];
  const KINDS = METHODS.map(m => m[1]);
  const conceptos = {
    id: 'conceptos', title: 'Tipos de análisis', mission: 'm1', concepts: ['ana.conceptos'],
    make(rng, level) {
      const [an, sa, mx, ok] = pick(rng, PAIRS), [mt, kind] = METHODS[pick(rng, ok)];
      if (level <= 2) return choice(rng, `Se estudia ${an} en ${sa} ${mt}. ¿Qué tipo de análisis es?`, kind, take(rng, KINDS.filter(k => k !== kind), 3).map(text => ({ text, note: '¿Qué es o cuánto hay? Y si es cuánto: ¿volumen, masa, luz o electricidad?', misconception: text === 'Cualitativo' || kind === 'Cualitativo' ? 'quali-quanti' : undefined })),
        { concept: 'ana.conceptos', slide: 3, hint: 'Mira qué magnitud se mide.', explain: `${kind}.` });
      if (level === 3) { const ask = pick(rng, ['matriz', 'analito', 'muestra']);
        const right = ask === 'matriz' ? mx : ask === 'analito' ? `El ${an}` : `La porción de ${sa} que se analiza`;
        return choice(rng, `Se determina ${an} en ${sa}. ¿Cuál es ${ask === 'matriz' ? 'la matriz' : ask === 'analito' ? 'el analito' : 'la muestra'}?`, right,
          [mx, `El ${an}`, `La porción de ${sa} que se analiza`, `El reactivo con que se ${kind.includes('volum') ? 'titula' : 'trata'} la muestra`].filter(t => t !== right).map(text => ({ text, note: 'Analito = lo buscado; muestra = lo que analizas; matriz = lo que acompaña al analito; el reactivo no es parte de la muestra.', misconception: 'analyte-matrix' })),
          { concept: 'ana.conceptos', slide: 2, hint: 'La matriz es "todo lo demás" que viene con el analito.', explain: `${right}.` }); }
      // Afirmaciones compuestas: rol + tipo de método. Las falsas cambian un solo detalle.
      const truth = `El analito es el ${an} y el análisis es ${kind.toLowerCase()}.`;
      const otherKind = pick(rng, KINDS.filter(k => k !== kind));
      const falses = [[`El analito es ${sa} y el análisis es ${kind.toLowerCase()}.`, 'el analito es lo que se busca, no la muestra.', 'analyte-matrix'],
        [`La matriz es el ${an} y el análisis es ${kind.toLowerCase()}.`, `la matriz es lo que acompaña al analito (${mx}).`, 'analyte-matrix'],
        [`El analito es el ${an} y el análisis es ${otherKind.toLowerCase()}.`, `es ${kind.toLowerCase()}.`, otherKind === 'Cualitativo' || kind === 'Cualitativo' ? 'quali-quanti' : undefined]];
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Se estudia ${an} en ${sa} ${mt}. ¿Cuál afirmación es correcta?`, truth, falses.map(([text, why, mis]) => ({ text, note: `Falsa: ${why}`, misconception: mis })),
        { concept: 'ana.conceptos', slide: 3, hint: 'Revisa cada parte: quién es el analito, quién la matriz y qué magnitud se mide.', explain: truth });
    }
  };

  /* ════════ Etapas ════════ */
  const STAGES = ['Selección del método', 'Obtención de la muestra', 'Preparación y eliminación de interferentes', 'Medición del analito', 'Cálculo de resultados', 'Análisis de la confiabilidad', 'Interpretación y entrega del informe'];
  const ACTIONS = [
    ['Decidir entre volumetría y espectroscopía según costo, tiempo y exactitud', 0], ['Tomar sangre con el protocolo para gases', 1], ['Secar la muestra a 105 °C y disolverla en HNO₃', 2],
    ['Agregar un agente enmascarante', 2], ['Leer la absorbancia de la muestra', 3], ['Despejar la concentración desde la recta', 4], ['Calcular la desviación estándar de las réplicas', 5], ['Redactar la discusión y las conclusiones', 6]
  ];
  const etapas = {
    id: 'etapas', title: 'Etapas del análisis', mission: 'm1', concepts: ['ana.etapas'],
    make(rng, level) {
      const [text, k] = pick(rng, ACTIONS);
      if (level >= 3) { const after = k < 6;
        if (level >= 4 && after) return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}"${text}" corresponde a la etapa ${k + 1}. ¿Qué etapa viene justo después?`, STAGES[k + 1], shuffle(rng, STAGES.filter((s, i) => i !== k + 1)).map(t => ({ text: t, note: 'Repasa el orden de las 7 etapas.' })),
          { concept: 'ana.etapas', slide: 7, hint: 'Método → muestra → preparación → medición → cálculo → confiabilidad → informe.', explain: `${STAGES[k + 1]}.` }); }
      return choice(rng, `¿En qué etapa del análisis se hace esto? "${text}"`, STAGES[k], shuffle(rng, STAGES.filter((s, i) => i !== k)).map(t => ({ text: t, note: 'Piensa en qué momento del análisis se hace.' })),
        { concept: 'ana.etapas', slide: 7, hint: 'Son 7 etapas, del método al informe.', explain: `${STAGES[k]} (etapa ${k + 1}).` });
    }
  };

  /* ════════ Humedad ════════ */
  const humedad = {
    id: 'humedad', title: 'Factor de humedad', mission: 'm1', concepts: ['ana.humedad'],
    make(rng, level) {
      if (level <= 2) { const fh = between(rng, 1.03, 1.25, 0.01), ms = between(rng, 0.5, 10, 0.25), m = ms * fh;
        return number(`Fh = ${fix(fh, 2)}. ¿Cuántos gramos de muestra húmeda pesas para tener ${dec(ms)} g de masa seca?`, m, 'g', { concept: 'ana.humedad', slide: 9, label: 'masa', tol: 0.01, hint: 'masa a pesar = masa seca × Fh.',
          traps: [{ value: ms / fh, note: 'Dividiste: la muestra húmeda pesa más.', misconception: 'humidity-direction' }], solution: [`m = ${dec(ms)} × ${fix(fh, 2)} = ${dec(m, 3)} g`], explain: `${dec(m, 3)} g.` }); }
      const mh = between(rng, 1.5, 5, 0.001), ms = Number((mh * between(rng, 0.8, 0.97, 0.001)).toFixed(3)), h = (mh - ms) / ms * 100, fh = (100 + h) / 100;
      if (level === 3) return number(`Una muestra de ${fix(mh, 3)} g pesa ${fix(ms, 3)} g después de secarla a 105 °C. Calcula el porcentaje de humedad (base seca).`, h, '%', { concept: 'ana.humedad', slide: 9, label: '%h', tol: 0.01, hint: '%h = (m_M − m_seca)/m_seca × 100.',
        traps: [{ value: (mh - ms) / mh * 100, note: 'La fórmula de la clase divide por la masa seca.' }], solution: [`%h = (${fix(mh, 3)} − ${fix(ms, 3)})/${fix(ms, 3)} × 100 = ${dec(h, 2)} %`], explain: `%h = ${dec(h, 2)} %.` });
      if (level === 4) return number(`Una muestra de ${fix(mh, 3)} g pesa ${fix(ms, 3)} g seca. Calcula el factor de humedad Fh.`, fh, '', { concept: 'ana.humedad', slide: 9, label: 'Fh', tol: 0.003, hint: 'Primero %h; luego Fh = (100 + %h)/100.',
        traps: [{ value: h, note: 'Ese es el %h.' }, { value: (100 + (mh - ms) / mh * 100) / 100, note: 'Dividiste por la masa húmeda.' }], solution: [`%h = ${dec(h, 2)} %`, `Fh = (100 + ${dec(h, 2)})/100 = ${fix(fh, 4)}`], explain: `Fh = ${fix(fh, 4)}.` });
      const want = between(rng, 1, 5, 0.25), m = want * fh;
      return number(`Estilo PEP: una muestra de ${fix(mh, 3)} g pesa ${fix(ms, 3)} g seca a 105 °C. ¿Cuánta muestra húmeda pesas para tener ${dec(want)} g de masa seca?`, m, 'g', { concept: 'ana.humedad', slide: 9, label: 'masa', tol: 0.01, hint: '%h → Fh → masa seca × Fh.',
        traps: [{ value: want / fh, note: 'Dividiste por Fh.', misconception: 'humidity-direction' }, { value: want * (1 + (mh - ms) / mh), note: 'El %h va sobre la masa seca.' }],
        solution: [`%h = (${fix(mh, 3)} − ${fix(ms, 3)})/${fix(ms, 3)} × 100 = ${dec(h, 2)} %`, `Fh = ${fix(fh, 4)}`, `m = ${dec(want)} × ${fix(fh, 4)} = ${dec(m, 3)} g`], explain: `${dec(m, 3)} g.` });
    }
  };

  /* ════════ Disolución, disgregación e interferentes ════════ */
  const TREAT = [
    ['NaCl en agua a temperatura ambiente', 'Disolución'], ['Un óxido de zinc con HCl diluido a 80 °C', 'Disolución'], ['Carbonato de calcio con HCl diluido', 'Disolución'], ['Un comprimido de aspirina en etanol', 'Disolución'],
    ['Una aleación de acero con agua regia caliente', 'Disgregación'], ['Un silicato fundido con carbonato de sodio a 900 °C', 'Disgregación'], ['Un mineral con H₂SO₄ concentrado a 200 °C', 'Disgregación'], ['Una muestra orgánica digerida con HNO₃ y H₂O₂ en microondas', 'Disgregación'],
    ['Agregar F⁻ para que el Fe³⁺ no reaccione', 'Enmascaramiento'], ['Agregar CN⁻ para que el Cu²⁺ no interfiera', 'Enmascaramiento'], ['Agregar trietanolamina para que el Al³⁺ no consuma EDTA', 'Enmascaramiento'],
    ['Pasar la solución por una resina de intercambio iónico', 'Separación'], ['Extraer el analito con éter', 'Separación'], ['Destilar el amoníaco y recogerlo en ácido', 'Separación'], ['Precipitar el interferente y filtrarlo', 'Separación']
  ];
  const OPS = ['Disolución', 'Disgregación', 'Enmascaramiento', 'Separación'];
  const OP_WHY = { 'Disolución': 'solvente suave (agua o ácido diluido, bajo 100 °C)', 'Disgregación': 'tratamiento enérgico (ácidos concentrados sobre 120 °C o fundentes)', 'Enmascaramiento': 'el interferente queda en la solución pero ya no reacciona', 'Separación': 'el interferente (o el analito) se saca físicamente' };
  const INTERF = [
    ['determinar Ca²⁺ con EDTA en un agua que trae Fe³⁺', 'Agregar un enmascarante (como trietanolamina o cianuro) para que el Fe³⁺ no consuma EDTA', 'Enmascaramiento'],
    ['determinar nitrógeno en un alimento', 'Digerir, liberar NH₃ y destilarlo para separarlo de la matriz', 'Separación'],
    ['determinar plomo en una aleación de bronce', 'Disgregar con ácido nítrico concentrado caliente', 'Disgregación'],
    ['determinar cafeína en una bebida con colorantes que absorben luz', 'Extraer la cafeína con un solvente orgánico', 'Separación'],
    ['determinar sodio en suero fisiológico', 'Basta diluir con agua: no hay interferentes ni sólidos', 'Disolución']
  ];
  const interferentes = {
    id: 'interferentes', title: 'Preparar la muestra', mission: 'm1', concepts: ['ana.interferentes'],
    make(rng, level) {
      if (level === 2 || level === 3) { const [text, kind] = pick(rng, TREAT);
        return choice(rng, `¿Cuál de estos procedimientos es ${kind === 'Separación' ? 'una separación' : kind === 'Enmascaramiento' ? 'un enmascaramiento' : `una ${kind.toLowerCase()}`}?`, text, take(rng, TREAT.filter(t => t[1] !== kind), 3).map(([t, k]) => ({ text: t, note: `Eso es ${k.toLowerCase()}: ${OP_WHY[k]}.` })),
          { concept: 'ana.interferentes', slide: kind === 'Enmascaramiento' || kind === 'Separación' ? 11 : 10, hint: `${kind} = ${OP_WHY[kind]}.`, explain: `${text}: ${kind.toLowerCase()}.` }); }
      if (level === 1) { const [text, kind] = pick(rng, TREAT);
        return choice(rng, `"${text}". ¿Qué operación es?`, kind, OPS.filter(o => o !== kind).map(t => ({ text: t, note: `${t} = ${OP_WHY[t]}.` })),
          { concept: 'ana.interferentes', slide: kind === 'Enmascaramiento' || kind === 'Separación' ? 11 : 10, hint: '¿Suave, enérgico, se esconde o se saca?', explain: `${kind}: ${OP_WHY[kind]}.` }); }
      const [goal, right, kind] = pick(rng, INTERF);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Quieres ${goal}. ¿Qué paso de preparación corresponde?`, right, take(rng, INTERF.filter(x => x[1] !== right), 3).map(x => ({ text: x[1], note: `Eso sirve para ${x[0]}.` })),
        { concept: 'ana.interferentes', slide: 11, hint: '¿La muestra se disuelve fácil? ¿Hay algo que interfiera con la medición?', explain: `${kind}: ${right.toLowerCase()}.` });
    }
  };

  /* ════════ Calibración ════════ */
  const calibracion = {
    id: 'calibracion', title: 'Recta de calibración', mission: 'm2', concepts: ['ana.calibracion'],
    make(rng, level) {
      const m = between(rng, 0.004, 0.03, 0.0001), b = level >= 3 ? between(rng, 0.002, 0.03, 0.001) : 0, xmax = 70, x = between(rng, 5, 65, 0.1), y = m * x + b;
      const eq = b ? `A = ${fix(m, 4)}·C + ${fix(b, 3)}` : `A = ${fix(m, 4)}·C`;
      if (level <= 3) return number(`Con la recta ${eq} (C en mg/L), una muestra da A = ${fix(y, 3)}. Calcula C.`, (Number(y.toFixed(3)) - b) / m, 'mg/L', { concept: 'ana.calibracion', slide: 12, label: 'C', tol: 0.01, hint: 'C = (A − b)/m.',
        traps: [{ value: Number(y.toFixed(3)) * m, note: 'Divide por la pendiente.', misconception: 'calib-invert' }, { value: Number(y.toFixed(3)) / m, note: 'Falta restar el intercepto.' }],
        solution: [`C = (${fix(y, 3)}${b ? ` − ${fix(b, 3)}` : ''}) / ${fix(m, 4)}`, `C = ${dec((Number(y.toFixed(3)) - b) / m, 1)} mg/L`], explain: `C = ${dec((Number(y.toFixed(3)) - b) / m, 1)} mg/L.` });
      const f = pick(rng, [5, 10, 20, 25]), yr = Number(y.toFixed(3)), c = (yr - b) / m, orig = c * f, vol = pick(rng, [50, 100, 250]), ali = vol / f;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Se tomaron ${dec(ali)} mL de una muestra y se aforaron a ${vol} mL. La solución diluida da A = ${fix(yr, 3)} con la recta ${eq} (mg/L, rango 0–${xmax}). ¿Concentración de la muestra original?`, orig, 'mg/L',
        { concept: 'ana.calibracion', slide: 12, label: 'C', tol: 0.01, hint: 'Primero C de la diluida; luego × factor de dilución.',
          traps: [{ value: c, note: 'Esa es la diluida: falta multiplicar por el factor de dilución.' }, { value: c / f, note: 'Al deshacer la dilución, la concentración sube.' }, { value: yr * m * f, note: 'Divide por la pendiente.', misconception: 'calib-invert' }],
          solution: [`C(diluida) = (${fix(yr, 3)}${b ? ` − ${fix(b, 3)}` : ''}) / ${fix(m, 4)} = ${dec(c, 2)} mg/L`, `Factor = ${vol}/${dec(ali)} = ${f}`, `C(original) = ${dec(c, 2)} × ${f} = ${dec(orig, 1)} mg/L`], explain: `${dec(orig, 1)} mg/L.` });
    }
  };

  /* ════════ Exactitud ════════ */
  const exactitud = {
    id: 'exactitud', title: 'Error absoluto y relativo', mission: 'm2', concepts: ['ana.exactitud'],
    make(rng, level) {
      const xv = pick(rng, [10, 20, 25, 50, 100]), n = level <= 2 ? 1 : level <= 3 ? 3 : 5;
      const xs = replicas(rng, xv * (1 + pick(rng, [-1, 1]) * between(rng, 0.005, 0.04, 0.001)), xv * 0.006, n, 2), xm = mean(xs), E = xm - xv, Er = E / xv * 100;
      if (level === 1) return number(`Un estándar de ${dec(xv)} ppm se midió como ${fix(xs[0], 2)} ppm. Calcula el error absoluto.`, xs[0] - xv, 'ppm', { concept: 'ana.exactitud', slide: 13, label: 'E', tol: 0.001, hint: 'E = medido − verdadero (con signo).',
        traps: [{ value: xv - xs[0], note: 'Es medido menos verdadero.' }, { value: (xs[0] - xv) / xv * 100, note: 'Ese es el error relativo.' }], solution: [`E = ${fix(xs[0], 2)} − ${dec(xv)} = ${dec(xs[0] - xv, 2)} ppm`], explain: `E = ${dec(xs[0] - xv, 2)} ppm.` });
      const list = xs.map(x => fix(x, 2)).join('; ');
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Un material de referencia de ${dec(xv)} ppm se analizó ${n === 1 ? 'una vez' : `${n} veces`}: ${list} ppm. Calcula el error relativo${n > 1 ? ' del promedio' : ''} (%).`, Er, '%',
        { concept: 'ana.exactitud', slide: 13, label: 'Er', tol: 0.03, hint: 'Er = (x̄ − x_v)/x_v × 100.', traps: [{ value: E, note: 'Ese es el error absoluto.' }, { value: -Er, note: 'Medido menos verdadero: cuida el signo.' }],
          solution: [...(n > 1 ? [`x̄ = ${dec(xm, 3)} ppm`] : []), `Er = (${dec(xm, 3)} − ${dec(xv)})/${dec(xv)} × 100 = ${dec(Er, 2)} %`], explain: `Er = ${dec(Er, 2)} %.` });
    }
  };

  /* ════════ Precisión ════════ */
  const precision = {
    id: 'precision', title: 'Desviación estándar y CV', mission: 'm2', concepts: ['ana.precision'],
    make(rng, level) {
      const center = pick(rng, [0.75, 10.1, 25.3, 4.52]), d = center < 1 ? 3 : 2, n = level <= 2 ? 3 : level <= 4 ? 4 : 5;
      let xs = replicas(rng, center, center * 0.01, n, d); if (new Set(xs).size === 1) xs[0] = Number((xs[0] + 10 ** -d).toFixed(d));
      const s = sdev(xs), cv = s / mean(xs) * 100, list = xs.map(x => fix(x, d)).join('; ');
      if (level <= 3) return number(`Réplicas: ${list}. Calcula la desviación estándar (muestral).`, s, '', { concept: 'ana.precision', slide: 13, label: 's', tol: 0.03, hint: 's = √[Σ(xᵢ − x̄)²/(n − 1)].',
        traps: [{ value: sdev(xs, false), note: 'Dividiste por n: con réplicas se usa n − 1.', misconception: 'n-vs-n1' }, { value: s * s, note: 'Esa es la varianza: falta la raíz.' }],
        solution: [`x̄ = ${dec(mean(xs), d + 2)}`, `s = ${dec(s, d + 2)}`], explain: `s = ${dec(s, d + 2)}.` });
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Réplicas: ${list}. Calcula el coeficiente de variación (%).`, cv, '%', { concept: 'ana.precision', slide: 13, label: 'CV', tol: 0.03, hint: 'CV = s/x̄ × 100, con s usando n − 1.',
        traps: [{ value: sdev(xs, false) / mean(xs) * 100, note: 'Usaste n en vez de n − 1.', misconception: 'n-vs-n1' }, { value: s, note: 'Esa es s: falta dividir por el promedio y × 100.' }],
        solution: [`x̄ = ${dec(mean(xs), d + 2)}`, `s = ${dec(s, d + 2)}`, `CV = ${dec(s, d + 2)}/${dec(mean(xs), d + 2)} × 100 = ${dec(cv, 2)} %`], explain: `CV = ${dec(cv, 2)} %.` });
    }
  };

  /* ════════ Tipos de error: por la causa y por los datos ════════ */
  const ERR = [
    ['Una pipeta mal calibrada entrega siempre 0,05 mL de menos', 'Sistemático (instrumental)'], ['Una balanza descalibrada marca siempre 0,8 mg de más', 'Sistemático (instrumental)'],
    ['Un reactivo contaminado con el analito aumenta siempre el resultado', 'Sistemático (de método o reactivo)'], ['El indicador vira antes del punto de equivalencia', 'Sistemático (de método)'],
    ['El precipitado es algo soluble y se pierde un poco en cada lavado', 'Sistemático (de método)'], ['El analista siempre lee el menisco por arriba', 'Sistemático (personal)'],
    ['El analista, que es daltónico, siempre ve tarde el viraje', 'Sistemático (personal)'], ['Pequeñas fluctuaciones en la última cifra de la balanza', 'Aleatorio'],
    ['Variaciones de temperatura del laboratorio de un día a otro', 'Aleatorio'], ['Diferencias mínimas al estimar la lectura entre dos marcas de la bureta', 'Aleatorio'],
    ['Ruido eléctrico en la señal del espectrofotómetro', 'Aleatorio'], ['Se derramó parte de la muestra antes de aforar', 'Grueso'], ['Se anotó 25,3 en vez de 52,3', 'Grueso'], ['Se usó la solución de NaOH equivocada', 'Grueso']
  ];
  const AFFECT = { 'Sistemático': 'La exactitud (corre todos los resultados hacia un lado)', 'Aleatorio': 'La precisión (dispersa las réplicas hacia ambos lados)', 'Grueso': 'Produce un dato anómalo: se descarta y se repite' };
  const errores = {
    id: 'errores', title: 'Tipos de error', mission: 'm2', concepts: ['ana.errores'],
    make(rng, level) {
      if (level >= 4) { // a partir de datos: réplicas frente a un estándar de valor conocido
        const xv = pick(rng, [10, 20, 25, 50]), kind = pick(rng, ['Sistemático', 'Aleatorio', 'Grueso']);
        let xs = kind === 'Sistemático' ? replicas(rng, xv * (1 + pick(rng, [-1, 1]) * between(rng, 0.04, 0.08, 0.005)), xv * 0.003, 5, 2)
          : kind === 'Aleatorio' ? replicas(rng, xv, xv * 0.05, 5, 2) : replicas(rng, xv, xv * 0.003, 5, 2);
        if (kind === 'Grueso') xs[Math.floor(rng() * 5)] = Number((xv * pick(rng, [1.4, 0.6, 1.5])).toFixed(2));
        if (kind === 'Aleatorio') { xs = xs.sort((a, b) => a - b); xs[0] = Number((xv * 0.94).toFixed(2)); xs[4] = Number((xv * 1.06).toFixed(2)); xs = shuffle(rng, xs); }
        const right = `${kind}: ${kind === 'Sistemático' ? 'todas corridas hacia el mismo lado y muy juntas' : kind === 'Aleatorio' ? 'dispersas a ambos lados del valor verdadero' : 'un dato muy alejado del resto'}`;
        return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Un estándar de ${xv} ppm se mide 5 veces: ${xs.map(x => fix(x, 2)).join('; ')} ppm. ¿Qué tipo de error domina?`, right,
          ['Sistemático: todas corridas hacia el mismo lado y muy juntas', 'Aleatorio: dispersas a ambos lados del valor verdadero', 'Grueso: un dato muy alejado del resto', 'Ninguno: los datos son exactos y precisos'].filter(t => t !== right).map(text => ({ text, note: 'Compara cada réplica con el valor verdadero y entre sí.', misconception: 'acc-prec' })),
          { concept: 'ana.errores', slide: 13, source: 'skoog', hint: '¿Están todas del mismo lado? ¿Muy dispersas? ¿Hay una muy lejos?', explain: right + '.' }); }
      const [text, kind] = pick(rng, ERR), simple = kind.split(' (')[0];
      if (level <= 2) return choice(rng, `"${text}". ¿Qué tipo de error es?`, kind, take(rng, [...new Set(ERR.map(e => e[1]))].filter(k => k !== kind), 3).map(t => ({ text: t, note: 'Sistemático: con causa, un solo lado. Aleatorio: al azar. Grueso: equivocación grande.', misconception: 'error-type' })),
        { concept: 'ana.errores', slide: 20, source: 'skoog', hint: '¿Siempre hacia el mismo lado? ¿Instrumento, método o persona?', explain: `${kind}.` });
      return choice(rng, `"${text}". ¿Qué afecta principalmente?`, AFFECT[simple], [...Object.values(AFFECT).filter(t => t !== AFFECT[simple]), 'Ambas por igual: exactitud y precisión'].map(t => ({ text: t, note: `Es un error ${simple.toLowerCase()}.`, misconception: 'acc-prec' })),
        { concept: 'ana.errores', slide: 20, source: 'skoog', hint: 'Primero clasifica el error.', explain: `${kind}: ${AFFECT[simple].toLowerCase()}.` });
    }
  };

  /* ════════ Bases ════════ */
  const unidades = {
    id: 'unidades', title: '%, ppm y mg/L', mission: null, concepts: ['base.unidades'],
    make(rng, level) {
      if (level === 1) { const p = between(rng, 0.01, 2, 0.01);
        return number(`¿A cuántos ppm equivale ${dec(p)} %?`, p * 1e4, 'ppm', { concept: 'base.unidades', slide: 9, label: 'ppm', tol: 0.001, hint: '1 % = 10 000 ppm.', traps: [{ value: p * 100, note: 'Multiplica por 10 000.' }, { value: p / 1e4, note: 'Al revés.' }], solution: [`${dec(p)} × 10 000 = ${dec(p * 1e4, 0)} ppm`], explain: `${dec(p * 1e4, 0)} ppm.` }); }
      if (level === 2) { const ppb = between(rng, 2, 900, 1);
        return number(`Un agua tiene ${ppb} ppb (µg/L) de arsénico. ¿Cuántos ppm (mg/L) son?`, ppb / 1000, 'ppm', { concept: 'base.unidades', slide: 9, label: 'ppm', tol: 0.001, hint: '1 ppm = 1000 ppb.', traps: [{ value: ppb * 1000, note: 'Al revés: ppm es más grande que ppb.' }, { value: ppb / 1e4, note: 'Es ÷ 1000.' }], solution: [`${ppb} / 1000 = ${dec(ppb / 1000, 3)} ppm`], explain: `${dec(ppb / 1000, 3)} ppm.` }); }
      if (level === 3) { const mg = between(rng, 0.5, 50, 0.1), mL = pick(rng, [50, 100, 250, 500]), ppm = mg / (mL / 1000);
        return number(`Se disuelven ${dec(mg, 1)} mg de analito en agua hasta ${mL} mL. ¿Concentración en ppm (mg/L)?`, ppm, 'ppm', { concept: 'base.unidades', slide: 9, label: 'C', tol: 0.01, hint: 'ppm ≈ mg/L: pasa los mL a L.',
          traps: [{ value: mg / mL, note: 'Pasa los mL a L.' }, { value: mg * mL / 1000, note: 'Divide por el volumen.' }], solution: [`C = ${dec(mg, 1)} mg / ${dec(mL / 1000, 3)} L = ${dec(ppm, 1)} mg/L`], explain: `${dec(ppm, 1)} ppm.` }); }
      const ms = between(rng, 0.2, 2.5, 0.0001), mg = between(rng, 2, 120, 0.1), pct = mg / (ms * 1000) * 100;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}En ${fix(ms, 4)} g de muestra se encontraron ${dec(mg, 1)} mg de analito. ¿Porcentaje (m/m)?`, pct, '%', { concept: 'base.unidades', slide: 9, label: '%', tol: 0.01, hint: 'Pasa la masa de muestra a mg; % = analito/muestra × 100.',
        traps: [{ value: mg / ms * 100, note: 'Mezclaste mg con g: pasa la muestra a mg.' }, { value: mg / (ms * 1000) * 1e6, note: 'Eso serían ppm, no %.' }], solution: [`${fix(ms, 4)} g = ${dec(ms * 1000, 1)} mg`, `% = ${dec(mg, 1)}/${dec(ms * 1000, 1)} × 100 = ${dec(pct, 2)} %`], explain: `${dec(pct, 2)} %.` });
    }
  };
  const media = {
    id: 'media', title: 'Promedio', mission: null, concepts: ['base.media'],
    make(rng, level) {
      const n = level <= 2 ? 3 : 5, xs = replicas(rng, between(rng, 2, 50, 0.1), 0.3, n, 2), m = mean(xs);
      if (level >= 4) { // con un dato anómalo que hay que descartar antes de promediar
        const bad = Number((m * pick(rng, [1.3, 0.7])).toFixed(2)), all = shuffle(rng, [...xs, bad]), mAll = mean(all);
        return number(`${level === 5 ? 'Estilo PEP: ' : ''}Réplicas: ${all.map(x => fix(x, 2)).join('; ')}. Uno de los datos es un error grueso evidente (se derramó la muestra). Descártalo y calcula el promedio.`, m, '', { concept: 'base.media', slide: 13, label: 'x̄', tol: 0.002, hint: 'Busca el dato que se aleja mucho del resto; promedia los demás.',
          traps: [{ value: mAll, note: 'Incluiste el dato anómalo.' }, { value: m * n / (n - 1), note: `Divide por los ${n} datos que quedan.` }], solution: [`Se descarta ${fix(bad, 2)}`, `x̄ = ${dec(m * n, 2)} / ${n} = ${dec(m, 3)}`], explain: `x̄ = ${dec(m, 3)}.` }); }
      if (level === 3) { const sorted = [...xs].sort((a, b) => a - b), med = sorted[2];
        return number(`Réplicas: ${xs.map(x => fix(x, 2)).join('; ')}. ¿Cuál es la mediana?`, med, '', { concept: 'base.media', slide: 13, label: 'mediana', tol: 0.0005, hint: 'Ordena de menor a mayor y toma el del medio.',
          traps: [{ value: m, note: 'Ese es el promedio; la mediana es el valor central ordenado.' }], solution: [`Ordenadas: ${sorted.map(x => fix(x, 2)).join('; ')}`, `Mediana = ${fix(med, 2)}`], explain: `${fix(med, 2)}.` }); }
      return number(`Calcula el promedio de: ${xs.map(x => fix(x, 2)).join('; ')}.`, m, '', { concept: 'base.media', slide: 13, label: 'x̄', tol: 0.001, hint: `Suma y divide por ${n}.`,
        traps: [{ value: m * n, note: `Falta dividir por ${n}.` }, { value: m * n / (n - 1), note: `El promedio se divide por n (${n}), no por n − 1.` }], solution: [`x̄ = ${dec(m * n, 2)} / ${n} = ${dec(m, 3)}`], explain: `x̄ = ${dec(m, 3)}.` });
    }
  };

  const generators = [conceptos, etapas, humedad, interferentes, calibracion, exactitud, precision, errores, unidades, media];

  /* Laboratorio "¿qué hago con esta muestra?": una muestra cruda y operaciones de preparación (etapa 3). */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('humeda', 'Polvo de suelo húmedo', 'masa con agua'), S('seca', 'Polvo seco a 105 °C', 'masa seca constante'),
    S('mineral', 'Mineral de cobre (con silicatos)', 'insoluble en agua'), S('solucion-fe', 'Solución de Cu²⁺ con Fe³⁺ que interfiere', 'lista para tratar'),
    S('lista', 'Solución de Cu²⁺ sin interferencia', 'lista para medir'), S('sal', 'Sal de mesa', 'NaCl soluble'), S('salmuera', 'Solución de NaCl', 'lista para medir')
  ];
  const reagents = [['secar', 'Secar a 105 °C'], ['agua', 'Disolver en agua'], ['regia', 'Disgregar con agua regia caliente'], ['enmascarar', 'Agregar F⁻ (enmascarante del Fe³⁺)'], ['extraer', 'Extraer el Fe³⁺ con solvente'], ['medir', 'Medir de inmediato']].map(([id, label]) => ({ id, label }));
  const RX = {
    'humeda>secar': ['seca', 'Ahora la masa es seca: con %h y Fh puedes informar en base seca.'],
    'mineral>regia': ['solucion-fe', 'Disgregación: ácidos concentrados y calientes atacan lo que el agua no disuelve. Pero el Fe³⁺ del mineral también pasó a la solución.'],
    'solucion-fe>enmascarar': ['lista', 'El F⁻ forma un complejo con el Fe³⁺: sigue ahí, pero ya no reacciona (enmascaramiento).'],
    'solucion-fe>extraer': ['lista', 'El Fe³⁺ se fue al solvente: separación por extracción.'],
    'sal>agua': ['salmuera', 'Disolución simple: agua a temperatura ambiente basta.']
  };
  const WHY_NOT = { agua: 'El agua no disuelve esto: necesitas un tratamiento más enérgico (disgregación).', medir: 'Todavía no: falta preparar la muestra (etapa 3) antes de medir (etapa 4).', regia: 'No hace falta algo tan enérgico (y es peligroso): usa el tratamiento más suave que funcione.',
    secar: 'Secar no cambia nada aquí.', enmascarar: 'No hay Fe³⁺ que enmascarar.', extraer: 'No hay interferente que extraer.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (['lista', 'salmuera', 'seca'].includes(fromId)) return { to: null, ok: false, why: rid === 'medir' && fromId !== 'seca' ? '¡Lista! Esta muestra ya se puede medir.' : 'Esta muestra ya está preparada: vuelve a "Otra sustancia" para probar otra.' };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'Esta operación no sirve aquí.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['humeda', 'mineral', 'sal'] };

  const creatures = {
    'base.unidades': ['Escriba', '#a07a4a'], 'base.media': ['Búho', '#5d6f9e'],
    'ana.conceptos': ['Trasgo', '#7f9a3c'], 'ana.etapas': ['Duende', '#6d8bd6'], 'ana.humedad': ['Niebla', '#7fa3a0'], 'ana.interferentes': ['Serpiente', '#5f9e5a'],
    'ana.calibracion': ['Espectro', '#7aa4b5'], 'ana.exactitud': ['Grifo', '#c98a1b'], 'ana.precision': ['Gólem', '#8a6fd1'], 'ana.errores': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['ana-01'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
