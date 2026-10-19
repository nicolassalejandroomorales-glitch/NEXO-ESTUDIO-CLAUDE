/* Ejercicios infinitos de Celdas galvánicas y Nernst · PEP 1 (Fisicoquímica II).
   Cada generador arma una pregunta nueva desde una semilla y un nivel: 1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP.
   Todas las respuestas se CALCULAN (F = 96 500 C/mol; R = 8,314 J/(mol·K); 0,0592 V con log y 0,0257 V con ln a 25 °C).
   Fuente: clases 5 (parte II) y 6 «Equilibrio químico y electrolitos» (Dr. Eduardo Pino, 2S 2026). */
(() => {
  'use strict';
  const SRC = 'catedra-fq-electroquimica';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const F = 96500, R = 8.314, K0592 = 0.0592;
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (rng, list, n) => shuffle(rng, list).slice(0, n);
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 2) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−');
  const fx = (x, d) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
  const sg = x => (x >= 0 ? '+' : '') + fx(x, 2);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a), lcm = (a, b) => a * b / gcd(a, b);
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  function number(prompt, answer, unit, extra) {
    const tol = extra.tol ?? 0.02, traps = (extra.traps || []).filter(t => Number.isFinite(t.value) && Math.abs(t.value - answer) > Math.max(Math.abs(answer) * tol * 3, 1e-9));
    return { type: 'number', prompt, answer, unit, tol, ...extra, traps };
  }
  const order = (prompt, cards, answer, extra) => ({ type: 'order', prompt, cards, answer, ...extra });

  /* Pares metal/ion: n = electrones, E = potencial estándar de reducción (V). */
  const C = [
    { ion: 'Mg²⁺', met: 'Mg', n: 2, E: -2.37 }, { ion: 'Al³⁺', met: 'Al', n: 3, E: -1.66 }, { ion: 'Zn²⁺', met: 'Zn', n: 2, E: -0.76 }, { ion: 'Cr³⁺', met: 'Cr', n: 3, E: -0.74 },
    { ion: 'Fe²⁺', met: 'Fe', n: 2, E: -0.44 }, { ion: 'Cd²⁺', met: 'Cd', n: 2, E: -0.40 }, { ion: 'Co²⁺', met: 'Co', n: 2, E: -0.28 }, { ion: 'Ni²⁺', met: 'Ni', n: 2, E: -0.26 },
    { ion: 'Sn²⁺', met: 'Sn', n: 2, E: -0.14 }, { ion: 'Cu²⁺', met: 'Cu', n: 2, E: 0.34 }, { ion: 'Ag⁺', met: 'Ag', n: 1, E: 0.80 }
  ];
  const DIV = C.filter(c => c.n === 2);
  const pair = (rng, list = C) => { const [a, b] = sample(rng, list, 2); return a.E > b.E ? { cat: a, an: b } : { cat: b, an: a }; };
  const mixed = rng => { for (let i = 0; i < 40; i++) { const p = pair(rng); if (p.cat.n !== p.an.n) return p; } return { cat: C[9], an: C[1] }; };
  const coef = x => (x === 1 ? '' : String(x) + ' ');
  const eqn = ({ cat, an }) => { const n = lcm(cat.n, an.n), a = n / an.n, c = n / cat.n; return { n, a, c, text: `${coef(a)}${an.met}(s) + ${coef(c)}${cat.ion} → ${coef(a)}${an.ion} + ${coef(c)}${cat.met}(s)` }; };
  const diag = ({ cat, an }) => `${an.met}(s) | ${an.ion}(1 M) ‖ ${cat.ion}(1 M) | ${cat.met}(s)`;
  const E0 = p => p.cat.E - p.an.E;

  /* ════════ 1. Potenciales y espontaneidad (ele.potenciales) ════════ */
  const potenciales = {
    id: 'potenciales', title: 'E°cel y espontaneidad', mission: 'm1', concepts: ['ele.potenciales'],
    make(rng, level) {
      const base = { concept: 'ele.potenciales', slide: 24, hint: 'El de mayor E°red se reduce: E°cel = E°cátodo − E°ánodo.' };
      if (level === 1) { const p = pair(rng);
        return choice(rng, `Se combinan ${p.cat.ion}/${p.cat.met} (E° = ${sg(p.cat.E)} V) y ${p.an.ion}/${p.an.met} (E° = ${sg(p.an.E)} V). ¿Qué especie se reduce?`, p.cat.ion, [{ text: p.an.ion, note: 'Se reduce la de mayor E°red, no la de menor.', misconception: 'ele-signo' }, { text: `${p.cat.met}(s)`, note: 'El metal sólido es la forma reducida: se oxidaría, no se reduce.' }, { text: `${p.an.met}(s)`, note: 'El metal del ánodo es el que se oxida, no el que se reduce.' }], { ...base, explain: `${dec(p.cat.E, 2)} > ${dec(p.an.E, 2)}: ${p.cat.ion} se reduce.` }); }
      if (level === 2) { const p = pair(rng);
        return number(`E°(${p.cat.ion}/${p.cat.met}) = ${sg(p.cat.E)} V y E°(${p.an.ion}/${p.an.met}) = ${sg(p.an.E)} V. Calcula E°cel de la celda galvánica.`, E0(p), 'V', { ...base, label: 'E°cel', tol: 0.02, traps: [{ value: -E0(p), note: 'Al revés: cátodo − ánodo.', misconception: 'ele-signo' }, { value: p.cat.E + p.an.E, note: 'Sumaste: los potenciales se restan.' }], solution: [`Cátodo: ${p.cat.ion} (${sg(p.cat.E)} V); ánodo: ${p.an.met} (${sg(p.an.E)} V)`, `E°cel = ${sg(p.cat.E)} − (${sg(p.an.E)}) = ${sg(E0(p))} V`], explain: `E°cel = ${sg(E0(p))} V.` }); }
      if (level === 3) { const p = pair(rng), dirOk = rng() < 0.5, e = eqn(dirOk ? p : { cat: p.an, an: p.cat }), val = dirOk ? E0(p) : -E0(p);
        return choice(rng, `¿Es espontánea la reacción ${e.text} en condiciones estándar? (E°(${p.cat.ion}/${p.cat.met}) = ${sg(p.cat.E)} V; E°(${p.an.ion}/${p.an.met}) = ${sg(p.an.E)} V)`, dirOk ? `Sí: E°cel = ${sg(val)} V` : `No: E°cel = ${sg(val)} V`, [{ text: dirOk ? `No: E°cel = ${sg(-val)} V` : `Sí: E°cel = ${sg(-val)} V`, note: 'Restaste al revés: el que se reduce en la reacción escrita es el cátodo.', misconception: 'ele-signo' }, { text: `${dirOk ? 'No' : 'Sí'}: E°cel = ${sg(val)} V`, note: 'El signo de E°cel decide: positivo es espontánea, negativo no.' }, { text: `${p.cat.E + p.an.E > 0 ? 'Sí' : 'No'}: E°cel = ${sg(p.cat.E + p.an.E)} V`, note: 'Los potenciales se restan (cátodo − ánodo); no se suman.' }], { ...base, slide: 21, explain: `En la reacción escrita se reduce ${dirOk ? p.cat.ion : p.an.ion}: E°cel = ${sg(val)} V.` }); }
      if (level === 4) { const set = sample(rng, C, 4), sorted = [...set].sort((a, b) => a.E - b.E);
        return order('Ordena de menor a mayor poder oxidante (E°red):', set.map((x, i) => ({ id: 'x' + i, text: `${x.ion} (${sg(x.E)} V)` })), sorted.map(x => 'x' + set.indexOf(x)), { ...base, slide: 7, direction: 'De menor a mayor E°red.', explain: sorted.map(x => `${x.ion} (${sg(x.E)})`).join(' < ') + '. Mayor E°red = mejor oxidante.' }); }
      const p = mixed(rng), e = eqn(p), naive = p.cat.E * e.c - p.an.E * e.a;
      return number(`Estilo PEP: ${e.text}. Con E°(${p.cat.ion}/${p.cat.met}) = ${sg(p.cat.E)} V y E°(${p.an.ion}/${p.an.met}) = ${sg(p.an.E)} V, calcula E°cel.`, E0(p), 'V', { ...base, slide: 38, label: 'E°cel', tol: 0.02, traps: [{ value: naive, note: 'Multiplicaste cada E° por su coeficiente: el potencial no se multiplica.', misconception: 'ele-coef' }, { value: -E0(p), note: 'Al revés: cátodo − ánodo.', misconception: 'ele-signo' }],
        solution: [`Cátodo (se reduce): ${p.cat.ion}; ánodo (se oxida): ${p.an.met}`, `E°cel = ${sg(p.cat.E)} − (${sg(p.an.E)}) = ${sg(E0(p))} V (sin multiplicar por ${e.c} ni ${e.a})`], explain: `E°cel = ${sg(E0(p))} V.` });
    }
  };

  /* ════════ 2. Celdas galvánicas y diagrama (ele.celdas) ════════ */
  const celdas = {
    id: 'celdas', title: 'Ánodo, cátodo y diagrama', mission: 'm1', concepts: ['ele.celdas'],
    make(rng, level) {
      const p = pair(rng), base = { concept: 'ele.celdas', slide: 25, hint: 'Ánodo = oxidación (menor E°red); cátodo = reducción (mayor E°red).' }, d = diag(p);
      if (level === 1) return choice(rng, `En la celda galvánica ${d}, ¿qué electrodo es el ánodo?`, `${p.an.met} (se oxida)`, [{ text: `${p.cat.met} (se oxida)`, note: 'El cátodo es el que se reduce.', misconception: 'ele-anodo' }, { text: 'El puente salino', note: 'El puente no es un electrodo.' }, { text: `${p.an.met} (se reduce)`, note: 'En el ánodo ocurre la oxidación; la reducción es en el cátodo.' }], { ...base, explain: `${p.an.met} tiene menor E°red (${sg(p.an.E)} V): se oxida.` });
      if (level === 2) return choice(rng, `En la celda ${d}, los electrones viajan por el cable…`, `del ${p.an.met} al ${p.cat.met}`, [{ text: `del ${p.cat.met} al ${p.an.met}`, note: 'Salen del ánodo (el que se oxida).', misconception: 'ele-anodo' }, { text: 'por el puente salino', note: 'Por el puente viajan iones, no electrones.' }, { text: 'por la solución, de un vaso al otro', note: 'Por la solución y el puente viajan iones, no electrones.' }], { ...base, slide: 23, explain: 'Ánodo → cátodo por el circuito externo.' });
      if (level === 3) { const wrong = [`${p.cat.met}(s) | ${p.cat.ion}(1 M) ‖ ${p.an.ion}(1 M) | ${p.an.met}(s)`, `${p.an.met}(s) | ${p.an.ion}(1 M) | ${p.cat.ion}(1 M) | ${p.cat.met}(s)`, `${p.an.met}(s) ‖ ${p.an.ion}(1 M) | ${p.cat.ion}(1 M) ‖ ${p.cat.met}(s)`];
        return choice(rng, `¿Cuál es el diagrama correcto de la pila ${p.an.met}–${p.cat.met} (E°(${p.cat.ion}/${p.cat.met}) = ${sg(p.cat.E)} V; E°(${p.an.ion}/${p.an.met}) = ${sg(p.an.E)} V)?`, d, wrong.map(t => ({ text: t, note: 'El ánodo va a la izquierda, el cátodo a la derecha y ‖ marca el puente salino.' })), { ...base, explain: 'Ánodo | solución ‖ solución | cátodo.' }); }
      if (level === 4) return choice(rng, `En la pila ${d}, ¿cuál es el polo positivo?`, `${p.cat.met} (cátodo)`, [{ text: `${p.an.met} (ánodo)`, note: 'En una celda galvánica el ánodo es el polo negativo.', misconception: 'ele-anodo' }, { text: 'El puente salino', note: 'No es un polo.' }, { text: 'La solución del ánodo', note: 'Los polos son los electrodos, no las soluciones.' }], { ...base, slide: 23, explain: 'En una galvánica: ánodo (−), cátodo (+).' });
      return number(`Estilo PEP: la pila ${d} funciona en condiciones estándar. Calcula su E°cel (E°(${p.cat.ion}/${p.cat.met}) = ${sg(p.cat.E)} V; E°(${p.an.ion}/${p.an.met}) = ${sg(p.an.E)} V).`, E0(p), 'V', { ...base, slide: 24, label: 'E°cel', tol: 0.02, traps: [{ value: -E0(p), note: 'Al revés: cátodo (derecha) − ánodo (izquierda).', misconception: 'ele-signo' }], solution: [`Ánodo (izquierda): ${p.an.met}; cátodo (derecha): ${p.cat.met}`, `E°cel = ${sg(p.cat.E)} − (${sg(p.an.E)}) = ${sg(E0(p))} V`], explain: `E°cel = ${sg(E0(p))} V.` });
    }
  };

  /* ════════ 3. ΔG, E° y K (ele.dg) ════════ */
  const dg = {
    id: 'dg', title: 'ΔG° y K desde E°', mission: 'm2', concepts: ['ele.dg'],
    make(rng, level) {
      const base = { concept: 'ele.dg', slide: 27, hint: 'ΔG° = −nFE° y ln K = nFE°/RT (log K = nE°/0,0592).' };
      if (level === 1) { const e = between(rng, 0.05, 1.5, 0.01) * (rng() < 0.5 ? 1 : -1);
        return choice(rng, `Una reacción redox tiene E°cel = ${sg(e)} V. ¿Qué se cumple?`, e > 0 ? 'ΔG° < 0 y K > 1' : 'ΔG° > 0 y K < 1', [{ text: e > 0 ? 'ΔG° > 0 y K < 1' : 'ΔG° < 0 y K > 1', note: 'ΔG° = −nFE°: tienen signos opuestos.', misconception: 'ele-signo' }, { text: 'ΔG° = 0 y K = 1', note: 'Eso ocurre solo con E° = 0.' }, { text: e > 0 ? 'ΔG° < 0 y K < 1' : 'ΔG° > 0 y K > 1', note: 'ΔG° y K van de la mano: ΔG° < 0 implica K > 1, y al revés.' }], { ...base, slide: 28, explain: 'ΔG° = −nFE°.' }); }
      if (level === 2) { const p = pair(rng), n = lcm(p.cat.n, p.an.n), g = -n * F * E0(p) / 1000;
        return number(`${diag(p)} (n = ${n} electrones, E°cel = ${sg(E0(p))} V). Calcula ΔG° en kJ/mol.`, g, 'kJ/mol', { ...base, label: 'ΔG°', tol: 0.01, traps: [{ value: -g, note: 'Falta el signo: ΔG° = −nFE°.', misconception: 'ele-signo' }, { value: -F * E0(p) / 1000, note: `Usaste n = 1: aquí se transfieren ${n} electrones.`, misconception: 'ele-n' }], solution: [`ΔG° = −nFE° = −${n} · 96 500 · ${dec(E0(p), 2)}`, `= ${dec(g, 1)} kJ/mol`], explain: `ΔG° = ${dec(g, 1)} kJ/mol.` }); }
      if (level === 3) { const e = between(rng, 0.05, 0.6, 0.01), n = pick(rng, [1, 2, 3, 6]), lk = n * e / K0592;
        return number(`E°cel = ${dec(e, 2)} V con n = ${n}. Calcula log K a 25 °C.`, lk, '', { ...base, slide: 31, label: 'log K', tol: 0.01, traps: [{ value: e / K0592, note: `Olvidaste multiplicar por n = ${n}.`, misconception: 'ele-n' }, { value: n * e, note: 'Falta dividir por 0,0592.' }], solution: [`log K = nE°/0,0592 = ${n} · ${dec(e, 2)}/0,0592 = ${dec(lk, 2)}`], explain: `log K = ${dec(lk, 2)}.` }); }
      if (level === 4) { const e = between(rng, 0.01, 0.05, 0.001), n = pick(rng, [1, 2]), K = Math.exp(n * F * e / (R * 298));
        return number(`E°cel = ${dec(e, 3)} V con n = ${n} a 298 K (R = 8,314 J/(mol·K); F = 96 500 C/mol). Calcula K.`, K, '', { ...base, slide: 31, label: 'K', tol: 0.02, traps: [{ value: Math.log(K), note: 'Ese es ln K: falta e^x.' }, { value: Math.exp(F * e / (R * 298)), note: `Olvidaste n = ${n}.`, misconception: 'ele-n' }], solution: [`ln K = nFE°/RT = ${n} · 96 500 · ${dec(e, 3)}/(8,314 · 298) = ${dec(Math.log(K), 3)}`, `K = e^${dec(Math.log(K), 3)} = ${dec(K, 3)}`], explain: `K = ${dec(K, 3)}.` }); }
      const p = mixed(rng), n = lcm(p.cat.n, p.an.n), g = -n * F * E0(p) / 1000;
      return number(`Estilo PEP: la reacción ${eqn(p).text} tiene E°cel = ${sg(E0(p))} V. Calcula ΔG° en kJ/mol (F = 96 500 C/mol).`, g, 'kJ/mol', { ...base, slide: 38, label: 'ΔG°', tol: 0.01, hint: 'n es el total de electrones de la reacción balanceada.', traps: [{ value: -p.cat.n * F * E0(p) / 1000, note: `Usaste los electrones de una sola semirreacción (${p.cat.n}); la reacción balanceada transfiere ${n}.`, misconception: 'ele-n' }, { value: -g, note: 'Falta el signo.' }],
        solution: [`n = mcm(${p.cat.n}, ${p.an.n}) = ${n}`, `ΔG° = −${n} · 96 500 · ${dec(E0(p), 2)} = ${dec(g, 1)} kJ/mol`], explain: `ΔG° = ${dec(g, 1)} kJ/mol.` });
    }
  };

  /* ════════ 4. Ecuación de Nernst (ele.nernst) ════════ */
  const nernst = {
    id: 'nernst', title: 'Nernst y concentraciones', mission: 'm2', concepts: ['ele.nernst'],
    make(rng, level) {
      const base = { concept: 'ele.nernst', slide: 30, hint: 'E = E° − (0,0592/n)·log Q, con Q = productos/reactivos.' };
      const p = pair(rng, DIV), e0 = E0(p), n = 2;
      if (level === 1) return choice(rng, `Para ${p.an.met}(s) + ${p.cat.ion} → ${p.an.ion} + ${p.cat.met}(s), ¿cuánto vale Q?`, `[${p.an.ion}]/[${p.cat.ion}]`, [{ text: `[${p.cat.ion}]/[${p.an.ion}]`, note: 'Está al revés: los productos van arriba.', misconception: 'ele-q' }, { text: `[${p.an.ion}][${p.cat.met}]/([${p.cat.ion}][${p.an.met}])`, note: 'Los sólidos puros no entran en Q.' }, { text: '1, porque son metales', note: 'Los iones en solución sí cuentan.' }], { ...base, explain: 'Q = productos/reactivos sin sólidos puros.' });
      if (level === 2) { const q = between(rng, 0.01, 50, 0.01), E = e0 - K0592 / n * Math.log10(q);
        return number(`E°cel = ${sg(e0)} V, n = 2 y Q = ${dec(q, 2)}. Calcula E a 25 °C.`, E, 'V', { ...base, label: 'E', tol: 0.02, traps: [{ value: e0, note: 'Ese es E°: falta corregir por Q.' }, { value: e0 + K0592 / n * Math.log10(q), note: 'Sumaste el término: es E° − (0,0592/n) log Q.' }, { value: e0 - K0592 / n * Math.log(q), note: 'Usaste 0,0592 con ln: ese factor va con log.', misconception: 'ele-ln' }], solution: [`E = ${sg(e0)} − (0,0592/2)·log ${dec(q, 2)}`, `E = ${sg(E)} V`], explain: `E = ${sg(E)} V.` }); }
      if (level === 3) { const c2 = pick(rng, [0.5, 1.0, 1.5, 2.0]), c1 = pick(rng, [0.001, 0.005, 0.01, 0.025, 0.05]), m = pick(rng, DIV), E = K0592 / 2 * Math.log10(c2 / c1);
        return number(`Celda de concentración ${m.met} | ${m.ion} (${dec(c1, 3)} M) ‖ ${m.ion} (${dec(c2, 2)} M) | ${m.met} a 25 °C (n = 2). Calcula E.`, E, 'V', { ...base, slide: 62, label: 'E', tol: 0.02, traps: [{ value: -E, note: 'Invertiste las concentraciones: la celda funciona de la concentrada a la diluida.', misconception: 'ele-q' }, { value: Math.log(c2 / c1) * K0592 / 2, note: 'Usaste 0,0592 con ln: ese factor va con log.', misconception: 'ele-ln' }], solution: ['E° = 0 (mismo electrodo)', `E = (0,0592/2)·log(${dec(c2, 2)}/${dec(c1, 3)}) = ${dec(E, 4)} V`], explain: `E = ${dec(E, 4)} V.` }); }
      const a = pick(rng, [0.01, 0.05, 0.1, 0.5]), c = pick(rng, [0.1, 0.5, 1.0, 1.5]), q = a / c, E = e0 - K0592 / n * Math.log10(q);
      if (level === 4) return number(`Pila ${diag(p).replace(/\(1 M\)/g, m => m)}, pero con [${p.an.ion}] = ${dec(a, 2)} M y [${p.cat.ion}] = ${dec(c, 2)} M (E° = ${sg(e0)} V; n = 2). Calcula E a 25 °C.`, E, 'V', { ...base, label: 'E', tol: 0.02, traps: [{ value: e0 - K0592 / n * Math.log10(c / a), note: 'Invertiste Q: es [productos]/[reactivos] = [ánodo]/[cátodo].', misconception: 'ele-q' }, { value: e0, note: 'Ese es E° (Q = 1).' }], solution: [`Q = [${p.an.ion}]/[${p.cat.ion}] = ${dec(a, 2)}/${dec(c, 2)} = ${dec(q, 3)}`, `E = ${sg(e0)} − (0,0592/2)·log ${dec(q, 3)} = ${sg(E)} V`], explain: `E = ${sg(E)} V.` });
      const m = mixed(rng), nn = lcm(m.cat.n, m.an.n), ee = eqn(m), x = pick(rng, [0.01, 0.05, 0.1]), y = pick(rng, [0.1, 0.5, 1.0]), Q = (x ** ee.a) / (y ** ee.c), EE = E0(m) - K0592 / nn * Math.log10(Q);
      return number(`Estilo PEP: ${ee.text} con [${m.an.ion}] = ${dec(x, 2)} M y [${m.cat.ion}] = ${dec(y, 2)} M (E° = ${sg(E0(m))} V; n = ${nn}). Calcula E a 25 °C.`, EE, 'V', { ...base, label: 'E', tol: 0.02, hint: 'Q = [producto]^coef/[reactivo]^coef; n es el total de la reacción balanceada.', traps: [{ value: E0(m) - K0592 / nn * Math.log10((x) / (y)), note: 'Olvidaste los exponentes de los coeficientes en Q.' }, { value: E0(m) - K0592 / Math.max(m.cat.n, m.an.n) * Math.log10(Q), note: `Usaste n = ${Math.max(m.cat.n, m.an.n)}: es el total de la reacción balanceada (${nn}).`, misconception: 'ele-n' }], solution: [`Q = [${m.an.ion}]^${ee.a}/[${m.cat.ion}]^${ee.c} = ${dec(Q, 4)}`, `E = ${sg(E0(m))} − (0,0592/${nn})·log ${dec(Q, 4)} = ${sg(EE)} V`], explain: `E = ${sg(EE)} V.` });
    }
  };

  /* ════════ 5. pH desde un voltaje (ele.nernst) ════════ */
  const SEMI = [['MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O', 8, 5], ['Cr₂O₇²⁻ + 14 H⁺ + 6 e⁻ → 2 Cr³⁺ + 7 H₂O', 14, 6], ['NO₃⁻ + 4 H⁺ + 3 e⁻ → NO + 2 H₂O', 4, 3], ['O₂ + 4 H⁺ + 4 e⁻ → 2 H₂O', 4, 4], ['H₂O₂ + 2 H⁺ + 2 e⁻ → 2 H₂O', 2, 2]];
  const phfem = {
    id: 'phfem', title: 'El pH desde la fem', mission: 'm3', concepts: ['ele.ph'],
    make(rng, level) {
      const base = { concept: 'ele.ph', slide: 91, hint: 'pH = (E₀ − E)/0,0591 para el electrodo de vidrio; si H⁺ está en la reacción, la pendiente es (coef. H⁺ · 0,0591)/n.' };
      if (level === 1) { const e0 = pick(rng, [0.400, 0.250, 0.210]), ph = between(rng, 1, 12, 0.1), E = Number((e0 - 0.0591 * ph).toFixed(3)), phc = (e0 - E) / 0.0591;
        return number(`Un electrodo de vidrio cumple E = ${dec(e0, 3)} − 0,0591·pH y marca E = ${dec(E, 3)} V. Calcula el pH.`, phc, '', { ...base, label: 'pH', tol: 0.01, traps: [{ value: E / 0.0591, note: 'No restaste E de E₀.' }, { value: (E - e0) / 0.0591, note: 'Signo al revés: pH = (E₀ − E)/0,0591.' }], solution: [`${dec(E, 3)} = ${dec(e0, 3)} − 0,0591·pH`, `pH = (${dec(e0, 3)} − ${dec(E, 3)})/0,0591 = ${dec(phc, 2)}`], explain: `pH = ${dec(phc, 2)}.` }); }
      if (level === 2) { const e0 = pick(rng, [0.400, 0.250, 0.210]), ph = between(rng, 1, 12, 0.1), E = e0 - 0.0591 * ph;
        return number(`El electrodo de vidrio cumple E = ${dec(e0, 3)} − 0,0591·pH. ¿Cuánto marca (en V) en una solución de pH ${dec(ph, 1)}?`, E, 'V', { ...base, label: 'E', tol: 0.01, traps: [{ value: e0 + 0.0591 * ph, note: 'Es E₀ menos 0,0591·pH.' }, { value: 0.0591 * ph, note: 'Falta restar de E₀.' }], solution: [`E = ${dec(e0, 3)} − 0,0591 · ${dec(ph, 1)} = ${dec(E, 3)} V`], explain: `E = ${dec(E, 3)} V.` }); }
      if (level === 3) { const [r, h, n] = pick(rng, SEMI), s = h * 0.0591 / n;
        return number(`${r}. ¿Cuánto cambia E (V) por cada unidad que baja el pH? (0,0591 V)`, s, 'V', { ...base, slide: 66, label: 'ΔE/pH', tol: 0.01, traps: [{ value: 0.0591, note: 'Falta multiplicar por los H⁺ y dividir por n.' }, { value: h * 0.0591, note: 'Falta dividir por n.', misconception: 'ele-n' }], solution: [`Pendiente = (${h} · 0,0591)/${n} = ${dec(s, 4)} V por unidad de pH`], explain: `${dec(s, 4)} V por unidad de pH.` }); }
      const m = pick(rng, DIV), eHc = -m.E, ph = between(rng, 1, 6, 0.1);
      if (level === 4) { const E = Number((eHc - 0.0592 * ph).toFixed(3)), phc = (eHc - E) / 0.0592;
        return number(`Celda ${m.met}(s) | ${m.ion} (1,0 M) ‖ H⁺ (x M) | H₂ (1 atm) | Pt: E = ${dec(E, 3)} V a 25 °C y E°(${m.ion}/${m.met}) = ${sg(m.E)} V. Calcula el pH.`, phc, '', { ...base, slide: 76, label: 'pH', tol: 0.01, traps: [{ value: (eHc - E) / (K0592 / 2), note: 'Dividiste 0,0592 entre n = 2, pero el [H⁺]² cancela el 2: queda 0,0592·pH.' }], solution: [`E°cel = 0 − (${dec(m.E, 2)}) = ${sg(eHc)} V; Q = 1/[H⁺]²`, `E = ${dec(eHc, 2)} − 0,0592·pH → pH = (${dec(eHc, 2)} − ${dec(E, 3)})/0,0592 = ${dec(phc, 2)}`], explain: `pH = ${dec(phc, 2)}.` }); }
      const c = pick(rng, [0.01, 0.1, 0.5, 2.0]), E = Number((eHc - K0592 / 2 * Math.log10(c / (10 ** (-2 * ph)))).toFixed(3)), phc = ((eHc - E) - K0592 / 2 * Math.log10(c)) / K0592;
      return number(`Estilo PEP: celda ${m.met}(s) | ${m.ion} (${dec(c, 2)} M) ‖ H⁺ (x M) | H₂ (1 atm) | Pt con E = ${dec(E, 3)} V a 25 °C y E°(${m.ion}/${m.met}) = ${sg(m.E)} V. Calcula el pH.`, phc, '', { ...base, slide: 72, label: 'pH', tol: 0.015, hint: 'Q = [M²⁺]/[H⁺]²: log Q = log[M²⁺] + 2·pH.', traps: [{ value: (eHc - E) / K0592, note: 'Olvidaste el aporte de [M²⁺] ≠ 1 M.' }], solution: [`E°cel = ${sg(eHc)} V; Q = ${dec(c, 2)}/[H⁺]²`, `log Q = (E° − E)·2/0,0592 → pH = [(E° − E) − (0,0592/2)·log ${dec(c, 2)}]/0,0592 = ${dec(phc, 2)}`], explain: `pH = ${dec(phc, 2)}.` });
    }
  };

  /* ════════ 6. Faraday y electrólisis (ele.faraday) ════════ */
  const METALES = [['Cu', 63.55, 2], ['Ag', 107.87, 1], ['Zn', 65.38, 2], ['Ni', 58.69, 2], ['Al', 26.98, 3], ['Cr', 52.00, 3]];
  const HALOG = [['Cl₂', 70.90], ['Br₂', 159.8], ['I₂', 253.8]];
  const faraday = {
    id: 'faraday', title: 'Faraday y electrólisis', mission: 'm3', concepts: ['ele.faraday'],
    make(rng, level) {
      const [met, M, z] = pick(rng, METALES), I = between(rng, 0.5, 5, 0.5), t = between(rng, 5, 90, 5), Q = I * t * 60, ne = Q / 96485, m = ne / z * M, base = { concept: 'ele.faraday', slide: 64, hint: 'Q = I·t (en segundos); n(e⁻) = Q/F; m = (n(e⁻)/z)·M.' };
      if (level === 1) return number(`Pasan ${dec(I, 1)} A durante ${t} minutos. ¿Cuántos coulomb son?`, Q, 'C', { ...base, label: 'Q', tol: 0.005, traps: [{ value: I * t, note: 'Pasa los minutos a segundos.' }, { value: I / (t * 60), note: 'Q = I·t: se multiplica.' }], solution: [`t = ${t} · 60 = ${t * 60} s`, `Q = ${dec(I, 1)} · ${t * 60} = ${dec(Q, 0)} C`], explain: `Q = ${dec(Q, 0)} C.` });
      if (level === 2) return number(`Una carga de ${dec(Q, 0)} C atraviesa una celda. ¿Cuántos moles de electrones son? (F = 96 485 C/mol)`, ne, 'mol', { ...base, label: 'n(e⁻)', tol: 0.01, traps: [{ value: Q * 96485, note: 'Dividiste mal: n(e⁻) = Q/F.' }], solution: [`n(e⁻) = ${dec(Q, 0)}/96 485 = ${dec(ne, 5)} mol`], explain: `n(e⁻) = ${dec(ne, 5)} mol.` });
      if (level === 3) return number(`Se electroliza una sal de ${met} (z = ${z}) con ${dec(I, 1)} A durante ${t} min. ¿Cuántos gramos se depositan? (M = ${dec(M, 2)} g/mol)`, m, 'g', { ...base, label: 'm', tol: 0.015, traps: [{ value: ne * M, note: `Olvidaste dividir por z = ${z}.`, misconception: 'ele-n' }, { value: I * t * M / (z * 96485), note: 'No pasaste los minutos a segundos.' }], solution: [`Q = ${dec(I, 1)} · ${t * 60} = ${dec(Q, 0)} C`, `n(${met}) = Q/(zF) = ${dec(ne / z, 5)} mol`, `m = ${dec(ne / z, 5)} · ${dec(M, 2)} = ${dec(m, 3)} g`], explain: `m = ${dec(m, 3)} g.` });
      if (level === 4) { const mass = between(rng, 0.2, 3, 0.1), I2 = between(rng, 0.5, 4, 0.5), tt = mass / M * z * 96485 / I2 / 60;
        return number(`¿Cuántos minutos hacen falta con ${dec(I2, 1)} A para depositar ${dec(mass, 1)} g de ${met} (z = ${z}; M = ${dec(M, 2)} g/mol)?`, tt, 'min', { ...base, label: 't', tol: 0.015, traps: [{ value: tt * 60, note: 'Ese tiempo está en segundos: pásalo a minutos.' }, { value: tt / z, note: `Olvidaste que z = ${z}.`, misconception: 'ele-n' }], solution: [`n(${met}) = ${dec(mass / M, 5)} mol → n(e⁻) = ${dec(mass / M * z, 5)} mol`, `Q = n(e⁻)·F = ${dec(mass / M * z * 96485, 1)} C`, `t = Q/I = ${dec(mass / M * z * 96485 / I2, 0)} s = ${dec(tt, 1)} min`], explain: `t ≈ ${dec(tt, 1)} min.` }); }
      const [hal, Mh] = pick(rng, HALOG), mm = between(rng, 0.2, 2, 0.1), nCu = mm / M, mh = nCu * z / 2 * Mh;
      return number(`Estilo PEP: en la electrólisis de la sal ${met}${hal.slice(0, -1)}${z === 1 ? '' : z} se depositan ${dec(mm, 1)} g de ${met} (z = ${z}; M = ${dec(M, 2)}) en el cátodo. ¿Cuántos gramos de ${hal} (M = ${dec(Mh, 1)}; 2 e⁻ por mol) se forman en el ánodo?`, mh, 'g', { ...base, slide: 78, label: `m(${hal})`, tol: 0.02, traps: [{ value: nCu * Mh, note: `Olvidaste que cada mol de ${hal} libera 2 e⁻ y el ${met} toma ${z}.` }, { value: nCu * z * Mh, note: `Cada mol de ${hal} libera 2 e⁻, no 1.` }], solution: [`n(e⁻) = z · n(${met}) = ${z} · ${dec(nCu, 5)} = ${dec(nCu * z, 5)} mol`, `n(${hal}) = n(e⁻)/2 = ${dec(nCu * z / 2, 5)} mol`, `m = ${dec(nCu * z / 2, 5)} · ${dec(Mh, 1)} = ${dec(mh, 3)} g`], explain: `m(${hal}) = ${dec(mh, 3)} g.` });
    }
  };

  /* ════════ Bases: redox, ln/log y carga ════════ */
  const redoxg = {
    id: 'redoxg', title: 'Oxidante y reductor', mission: null, concepts: ['base.redox'],
    make(rng, level) {
      const p = pair(rng), e = eqn(p), base = { concept: 'base.redox', slide: 2, hint: 'El que pierde electrones (se oxida) es el reductor; el que los gana (se reduce), el oxidante.' };
      const kind = pick(rng, ['reductor', 'oxidante', 'oxida', 'reduce']), pre = level >= 4 ? 'Estilo PEP: ' : '';
      const ask = { reductor: ['agente reductor', p.an.met, p.cat.ion, 'Ese se reduce: es el oxidante.'], oxidante: ['agente oxidante', p.cat.ion, p.an.met, 'Ese se oxida: es el reductor.'], oxida: ['especie que se oxida', p.an.met, p.cat.ion, 'Ese gana electrones: se reduce.'], reduce: ['especie que se reduce', p.cat.ion, p.an.met, 'Ese pierde electrones: se oxida.'] }[kind];
      return choice(rng, `${pre}En ${e.text}, ¿cuál es la ${ask[0]}?`, ask[1], [{ text: ask[2], note: ask[3] }, { text: `${p.cat.met}(s)`, note: 'Es un producto, no un reactivo.' }, { text: `${p.an.ion}`, note: 'Es un producto, no un reactivo.' }], { ...base, explain: `${p.an.met} se oxida (reductor) y ${p.cat.ion} se reduce (oxidante).` });
    }
  };
  const lognn = {
    id: 'lognn', title: 'ln, log y 0,0592', mission: null, concepts: ['base.logn'],
    make(rng, level) {
      const base = { concept: 'base.logn', slide: 30, hint: 'ln x = 2,303·log x.' };
      if (level <= 2) return choice(rng, 'A 25 °C, ¿qué constante acompaña a ln Q en Nernst?', '0,0257/n', [{ text: '0,0592/n', note: 'Esa acompaña a log Q.', misconception: 'ele-ln' }, { text: '0,0592·n', note: 'Se divide entre n.' }, { text: '2,303/n', note: 'Es el factor de conversión ln↔log, no la constante.' }], { ...base, explain: 'RT/F = 0,0257 V; ×2,303 = 0,0592.' });
      const lnq = between(rng, 0.2, 4, 0.1) * (rng() < 0.5 ? 1 : -1);
      if (level === 3) return number(`Si ln Q = ${dec(lnq, 1)}, ¿cuánto vale log Q?`, lnq / 2.303, '', { ...base, label: 'log Q', tol: 0.01, traps: [{ value: lnq * 2.303, note: 'Al revés: log Q = ln Q/2,303.' }], solution: [`log Q = ${dec(lnq, 1)}/2,303 = ${dec(lnq / 2.303, 3)}`], explain: `log Q = ${dec(lnq / 2.303, 3)}.` });
      const q = pick(rng, [0.01, 0.05, 0.1, 0.5, 2, 5, 20, 100]), n = pick(rng, [1, 2, 3]), t = K0592 / n * Math.log10(q);
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Calcula (0,0592/${n})·log ${dec(q, 2)} en voltios.`, t, 'V', { ...base, label: 'término', tol: 0.02, traps: [{ value: K0592 / n * Math.log(q), note: 'Usaste ln en vez de log.', misconception: 'ele-ln' }, { value: K0592 * Math.log10(q), note: `Olvidaste dividir por n = ${n}.`, misconception: 'ele-n' }], solution: [`(0,0592/${n}) · log ${dec(q, 2)} = ${dec(K0592 / n, 4)} · ${dec(Math.log10(q), 3)} = ${dec(t, 4)} V`], explain: `${dec(t, 4)} V.` });
    }
  };
  const cargag = {
    id: 'cargag', title: 'Carga y moles de e⁻', mission: null, concepts: ['base.carga'],
    make(rng, level) {
      const I = between(rng, 0.5, 10, 0.5), t = between(rng, 10, 3600, 10), Q = I * t, base = { concept: 'base.carga', slide: 64, hint: 'Q = I·t con t en segundos; n(e⁻) = Q/F.' };
      if (level <= 2) return number(`${dec(I, 1)} A durante ${t} s. ¿Qué carga pasa?`, Q, 'C', { ...base, label: 'Q', tol: 0.005, traps: [{ value: I / t, note: 'Q = I·t: se multiplica.' }], solution: [`Q = ${dec(I, 1)} · ${t} = ${dec(Q, 0)} C`], explain: `Q = ${dec(Q, 0)} C.` });
      if (level === 4) return number(`Para que circule una carga de ${dec(Q, 0)} C con una corriente de ${dec(I, 1)} A, ¿cuántos segundos hacen falta?`, t, 's', { ...base, label: 't', tol: 0.005, traps: [{ value: Q * I, note: 'Q = I·t: el tiempo es Q/I.' }, { value: t / 60, note: 'Eso son minutos; piden segundos.' }], solution: [`t = Q/I = ${dec(Q, 0)}/${dec(I, 1)} = ${t} s`], explain: `t = ${t} s.` });
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}${dec(I, 1)} A durante ${t} s. ¿Cuántos moles de electrones circulan? (F = 96 485 C/mol)`, Q / 96485, 'mol', { ...base, label: 'n(e⁻)', tol: 0.01, traps: [{ value: Q, note: 'Esa es la carga: falta dividir por F.' }, { value: Q * 96485, note: 'Dividiste al revés.' }], solution: [`Q = ${dec(Q, 0)} C`, `n(e⁻) = ${dec(Q, 0)}/96 485 = ${dec(Q / 96485, 5)} mol`], explain: `n(e⁻) = ${dec(Q / 96485, 5)} mol.` });
    }
  };

  const generators = [potenciales, celdas, dg, nernst, phfem, faraday, redoxg, lognn, cargag];

  /* Laboratorio libre: metales y soluciones: ¿qué reacciona de forma espontánea? */
  const substances = [
    { id: 'cu', name: 'Alambre de Cu', formula: 'E°(Cu²⁺/Cu) = +0,34 V' }, { id: 'cu-ag', name: 'Cu recubierto de plata', formula: 'depósito de Ag(s)' },
    { id: 'zn', name: 'Lámina de Zn', formula: 'E°(Zn²⁺/Zn) = −0,76 V' }, { id: 'zn-cu', name: 'Zn recubierto de cobre', formula: 'depósito de Cu(s)' }
  ];
  const reagents = [{ id: 'agno3', label: 'Sumergir en AgNO₃ (Ag⁺: +0,80 V)' }, { id: 'cuso4', label: 'Sumergir en CuSO₄ (Cu²⁺: +0,34 V)' }, { id: 'znno3', label: 'Sumergir en Zn(NO₃)₂ (Zn²⁺: −0,76 V)' }];
  const RX = {
    'cu>agno3': ['cu-ag', 'Ag⁺ (+0,80 V) se reduce y el Cu (+0,34 V) se oxida: E°cel = +0,46 V, espontánea.'],
    'zn>cuso4': ['zn-cu', 'Cu²⁺ (+0,34 V) se reduce y el Zn (−0,76 V) se oxida: E°cel = +1,10 V, espontánea (la pila de Daniell sin separar).']
  };
  const WHY_NOT = { 'cu>znno3': 'El Zn²⁺ (−0,76 V) no se reduce con Cu: E°cel = −1,10 V, no espontánea.', 'cu>cuso4': 'El Cu en Cu²⁺ está en equilibrio consigo mismo: no pasa nada.', 'zn>agno3': 'Sí reaccionaría (E° = +1,56 V), pero esta prueba ya la hicimos con el Cu; prueba otra.', 'zn>znno3': 'Es el mismo par: E°cel = 0.' };
  function react(fromId, reagentId) {
    const r = RX[fromId + '>' + reagentId];
    if (r) return { to: r[0], ok: true, why: r[1] };
    return { to: null, ok: false, why: WHY_NOT[fromId + '>' + reagentId] || 'Ese metal ya está recubierto: no hay nada nuevo que probar aquí.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['cu', 'zn'] };

  const creatures = {
    'base.redox': ['Escriba', '#a07a4a'], 'base.logn': ['Búho', '#5d6f9e'], 'base.carga': ['Relámpago', '#c9a227'],
    'ele.potenciales': ['Trasgo', '#7f9a3c'], 'ele.celdas': ['Duende', '#6d8bd6'], 'ele.dg': ['Gólem', '#8a6fd1'], 'ele.nernst': ['Hidra', '#c0574a'], 'ele.ph': ['Niebla', '#7fa3a0'], 'ele.faraday': ['Grifo', '#c98a1b']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['fq-03'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
