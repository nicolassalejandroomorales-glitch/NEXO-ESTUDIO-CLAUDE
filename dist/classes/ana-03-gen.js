/* Ejercicios infinitos de "Curvas de titulación ácido-base" (Química Analítica, PEP 1). Niveles 1 Fácil … 5 Nivel PEP.
   Los resultados se CALCULAN (nunca se escriben a mano). Datos: Skoog cap. 14–15 (Ka de tablas). */
(() => {
  'use strict';
  const SRC = 'pizarro';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 2) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−');
  const fix = (x, d) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
  const sci = x => { const e = Math.floor(Math.log10(x)); return `${fix(x / 10 ** e, 2)} × 10^${e}`.replace('^-', '^−'); };
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  function number(prompt, answer, unit, extra) {
    const tol = extra.tol ?? 0.02, traps = (extra.traps || []).filter(t => Number.isFinite(t.value) && Math.abs(t.value - answer) > Math.max(Math.abs(answer) * tol * 1.5, 0.03));
    return { type: 'number', prompt, answer, unit, tol, ...extra, traps };
  }
  const WEAK = [{ name: 'ácido acético', f: 'CH₃COOH', Ka: 1.75e-5 }, { name: 'ácido fórmico', f: 'HCOOH', Ka: 1.8e-4 }, { name: 'ácido benzoico', f: 'C₆H₅COOH', Ka: 6.3e-5 }, { name: 'ácido láctico', f: 'CH₃CH(OH)COOH', Ka: 1.4e-4 }];
  const MORE = [...WEAK, { name: 'ácido fluorhídrico', Ka: 6.8e-4 }, { name: 'ácido nitroso', Ka: 4.5e-4 }, { name: 'ácido propanoico', Ka: 1.34e-5 }, { name: 'ácido hipocloroso', Ka: 3.0e-8 }, { name: 'ácido cianhídrico', Ka: 6.2e-10 }, { name: 'ion amonio', Ka: 5.6e-10 }];
  const take = (rng, list, n) => shuffle(rng, list).slice(0, n);
  const pH = h => -Math.log10(h);

  /* ════════ Fuerte-fuerte ════════ */
  const fuerte = {
    id: 'fuerte', title: 'pH en la curva fuerte-fuerte', mission: 'm1', concepts: ['ana.fuerte'],
    make(rng, level) {
      const Va = pick(rng, [20, 25, 40, 50]), Ca = pick(rng, [0.1, 0.08, 0.05, 0.12]), Cb = pick(rng, [0.1, 0.2, 0.15]), Veq = Va * Ca / Cb;
      if (level === 1) return number(`¿Cuál es el pH de HCl ${dec(Ca, 2)} M (antes de titular)?`, pH(Ca), '', { concept: 'ana.fuerte', slide: 24, label: 'pH', tol: 0.005, hint: 'Ácido fuerte: [H⁺] = C.',
        traps: [{ value: 14 - pH(Ca), note: 'Ese sería el de una base.' }], solution: [`pH = −log ${dec(Ca, 2)} = ${dec(pH(Ca), 2)}`], explain: `pH = ${dec(pH(Ca), 2)}.` });
      if (level === 4 && rng() < 0.5) { // al revés: ¿cuánta base para llegar a cierto pH (antes de la equivalencia)?
        const target = between(rng, 1.6, 2.6, 0.1), h = 10 ** -target, Vb = (Va * Ca - h * Va) / (Cb + h);
        return number(`${Va},00 mL de HCl ${dec(Ca, 2)} M se titulan con NaOH ${dec(Cb, 2)} M. ¿Cuántos mL de NaOH hay que agregar para que el pH llegue a ${fix(target, 1)}?`, Vb, 'mL', { concept: 'ana.fuerte', slide: 24, label: 'V', tol: 0.02, hint: '[H⁺] = (n ácido − n base)/(Va + Vb); despeja Vb.',
          traps: [{ value: (Va * Ca - h * Va) / Cb, note: 'Olvidaste que el volumen total también crece con Vb.', misconception: 'dilution-ignored' }, { value: Veq, note: 'Ese es el volumen de equivalencia (pH 7).' }],
          solution: [`[H⁺] = 10^−${fix(target, 1)} = ${sci(h)} M`, `${sci(h)} = (${dec(Va * Ca, 3)} − ${dec(Cb, 2)}·Vb)/(${Va} + Vb)`, `Vb = (${dec(Va * Ca, 3)} − ${sci(h)}·${Va})/(${dec(Cb, 2)} + ${sci(h)}) = ${dec(Vb, 2)} mL`], explain: `${dec(Vb, 2)} mL.` }); }
      const baseFirst = level === 5 && rng() < 0.5; // también base titulada con ácido
      const frac = level === 2 ? between(rng, 0.1, 0.6, 0.05) : level === 3 ? between(rng, 0.5, 0.98, 0.02) : pick(rng, [between(rng, 0.9, 0.99, 0.01), between(rng, 1.01, 1.3, 0.01), 1]);
      const Vb = Number((Veq * frac).toFixed(2)), na = Va * Ca, nb = Vb * Cb, V = Va + Vb, d = na - nb;
      const sgn = baseFirst ? -1 : 1, conc = Math.abs(d) / V, concNo = Math.abs(d) / Va;
      const ans = Math.abs(d) < 1e-9 ? 7 : (d > 0) === !baseFirst ? pH(conc) : 14 + Math.log10(conc);
      const noDil = Math.abs(d) < 1e-9 ? 7 : (d > 0) === !baseFirst ? pH(concNo) : 14 + Math.log10(concNo);
      const [A, B] = baseFirst ? ['NaOH', 'HCl'] : ['HCl', 'NaOH'];
      const sol = [`n inicial (${A}) = ${Va},00 × ${dec(Ca, 2)} = ${dec(na, 3)} mmol`, `n agregado (${B}) = ${fix(Vb, 2)} × ${dec(Cb, 2)} = ${dec(nb, 3)} mmol`,
        Math.abs(d) < 1e-9 ? 'No sobra nada: equivalencia → pH = 7' : `Sobra ${dec(Math.abs(d), 3)} mmol de ${d > 0 ? A : B} en ${dec(V, 2)} mL → pH = ${dec(ans, 2)}`];
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}${Va},00 mL de ${A} ${dec(Ca, 2)} M se titulan con ${B} ${dec(Cb, 2)} M. Calcula el pH después de agregar ${fix(Vb, 2)} mL.`, ans, '',
        { concept: 'ana.fuerte', slide: 24, label: 'pH', tol: 0.01, hint: '¿Qué sobra? Divide por el volumen total.', traps: [{ value: noDil, note: 'Divide por el volumen total.', misconception: 'dilution-ignored' }, { value: 14 - ans, note: 'Confundiste pH con pOH.' }], solution: sol, explain: `pH = ${dec(ans, 2)}.` });
    }
  };

  /* ════════ Volumen de equivalencia y zonas ════════ */
  const zonas = {
    id: 'zonas', title: 'Zonas de la curva', mission: 'm1', concepts: ['ana.fuerte'],
    make(rng, level) {
      const Va = pick(rng, [10, 20, 25]), Ca = between(rng, 0.05, 0.15, 0.01), Cb = pick(rng, [0.1, 0.2]), Veq = Va * Ca / Cb;
      if (level <= 2) return number(`${Va},00 mL de HCl ${fix(Ca, 2)} M se titulan con NaOH ${dec(Cb, 2)} M. ¿Volumen de equivalencia?`, Veq, 'mL', { concept: 'ana.fuerte', slide: 24, label: 'V', tol: 0.005, hint: 'mmol ácido = mmol base.',
        traps: [{ value: Va * Cb / Ca, note: 'Invertiste las concentraciones.' }], solution: [`V = ${Va},00 × ${fix(Ca, 2)} / ${dec(Cb, 2)} = ${dec(Veq, 2)} mL`], explain: `${dec(Veq, 2)} mL.` });
      if (level === 3) { const V = Number((Veq * between(rng, 0.2, 1.6, 0.05)).toFixed(2)), right = Math.abs(V - Veq) < 1e-6 ? 'Nada sobra: pH = 7' : V < Veq ? 'H⁺ sobrante: pH < 7' : 'OH⁻ sobrante: pH > 7';
        return choice(rng, `${Va},00 mL de HCl ${fix(Ca, 2)} M con NaOH ${dec(Cb, 2)} M: después de ${fix(V, 2)} mL, ¿qué manda el pH?`, right,
          ['H⁺ sobrante: pH < 7', 'OH⁻ sobrante: pH > 7', 'Nada sobra: pH = 7', 'El Na⁺ sobrante: pH > 7'].filter(t => t !== right).map(text => ({ text, note: `La equivalencia está en ${dec(Veq, 2)} mL. El Na⁺ y el Cl⁻ no cambian el pH.` })),
          { concept: 'ana.fuerte', slide: 24, hint: 'Calcula primero el volumen de equivalencia.', explain: `Equivalencia en ${dec(Veq, 2)} mL → ${right}.` }); }
      const Q = pick(rng, [
        ['Si el HCl y el NaOH fueran 10 veces más diluidos, ¿qué le pasaría al salto de pH?', 'Sería más corto, pero la equivalencia seguiría en pH 7', ['Sería más largo y la equivalencia bajaría de 7', 'No cambiaría nada: el salto de pH sería idéntico', 'Desaparecería la equivalencia y quedaría solo una curva suave']],
        ['Si en vez de HCl titularas la misma cantidad de ácido acético, ¿qué cambia en la curva?', 'Empieza en pH más alto, tiene zona tampón y la equivalencia queda sobre 7', ['Nada: el volumen de equivalencia y la curva son iguales', 'La equivalencia queda bajo 7', 'Se necesita el doble de NaOH']],
        ['Si duplicas el volumen de HCl que titulas (misma concentración), ¿qué pasa?', 'Se duplica el volumen de equivalencia; el pH sigue en 7', ['El pH inicial baja a la mitad del valor anterior', 'El volumen de equivalencia no cambia, porque la concentración es la misma', 'La equivalencia sube a pH 8, porque hay más ácido']],
        ['Si usas NaOH el doble de concentrado, ¿qué pasa con el volumen de equivalencia?', 'Se reduce a la mitad', ['Se duplica', 'No cambia', 'Depende del indicador']]
      ]);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${Va},00 mL de HCl ${fix(Ca, 2)} M se titulan con NaOH ${dec(Cb, 2)} M (equivalencia en ${dec(Veq, 2)} mL). ${Q[0]}`, Q[1], Q[2].map(text => ({ text, note: 'Piensa en los mmol y en qué especie queda en la equivalencia.', misconception: 'eq-ph7' })),
        { concept: 'ana.fuerte', slide: 24, hint: 'Los mmol fijan el volumen; la especie que queda fija el pH de equivalencia.', explain: Q[1] + '.' });
    }
  };

  /* ════════ Indicador: se calcula el pH de equivalencia y se elige ════════ */
  const IND = [['Naranja de metilo (3,1–4,4)', 3.1, 4.4], ['Rojo de metilo (4,4–6,2)', 4.4, 6.2], ['Azul de bromotimol (6,0–7,6)', 6.0, 7.6], ['Fenolftaleína (8,2–10,0)', 8.2, 10.0], ['Timolftaleína (9,3–10,5)', 9.3, 10.5]];
  const BASES = [{ name: 'amoníaco', Kb: 1.8e-5 }, { name: 'metilamina', Kb: 4.4e-4 }, { name: 'piridina', Kb: 1.7e-9 }, { name: 'anilina', Kb: 4.0e-10 }];
  const bestInd = peq => { const inside = IND.filter(i => peq >= i[1] && peq <= i[2]); return (inside.length ? inside : IND).reduce((a, b) => Math.abs((a[1] + a[2]) / 2 - peq) <= Math.abs((b[1] + b[2]) / 2 - peq) ? a : b); };
  const indicador = {
    id: 'indicador', title: 'Elegir el indicador', mission: 'm1', concepts: ['ana.indicador'],
    make(rng, level) {
      // Solo casos sin ambigüedad: el pH de equivalencia cae dentro del intervalo de un indicador (con 0,1 de margen).
      const eqPH = (wa, x, C) => wa ? 14 + Math.log10(Math.sqrt(1e-14 / x.Ka * C / 2)) : -Math.log10(Math.sqrt(1e-14 / x.Kb * C / 2));
      const clear = v => IND.some(i => v >= i[1] + 0.1 && v <= i[2] - 0.1);
      let C, weakAcid, x, peq, tries = 0;
      do { C = pick(rng, [0.2, 0.1, 0.05, 0.02]); weakAcid = rng() < 0.55; x = weakAcid ? pick(rng, WEAK) : pick(rng, BASES); peq = eqPH(weakAcid, x, C); } while (!clear(peq) && ++tries < 30);
      const best = bestInd(peq), name = weakAcid ? `${x.name} ${dec(C, 2)} M con NaOH ${dec(C, 2)} M` : `${x.name} ${dec(C, 2)} M con HCl ${dec(C, 2)} M`;
      if (level <= 2) return choice(rng, `El pH en el punto de equivalencia de una titulación es ${dec(peq, 1)}. ¿Qué indicador eliges?`, best[0], take(rng, IND.filter(i => i !== best), 3).map(i => ({ text: i[0], note: `Vira entre ${dec(i[1], 1)} y ${dec(i[2], 1)}: no contiene ${dec(peq, 1)}.`, misconception: 'indicator-range' })),
        { concept: 'ana.indicador', slide: 17, hint: 'Busca el intervalo que contiene el pH de equivalencia.', explain: `${best[0]}.` });
      if (level >= 4) { const right = `${best[0]}, porque la equivalencia queda en pH ≈ ${dec(peq, 1)}`;
        const wrongInd = pick(rng, IND.filter(i => i !== best));
        return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Titulación de ${name} (${weakAcid ? 'Ka' : 'Kb'} = ${sci(weakAcid ? x.Ka : x.Kb)}). ¿Qué indicador usarías y por qué?`, right,
          [{ text: `${wrongInd[0]}, porque la equivalencia queda en pH ≈ ${dec(peq, 1)}`, note: `Ese indicador vira entre ${dec(wrongInd[1], 1)} y ${dec(wrongInd[2], 1)}.`, misconception: 'indicator-range' },
            { text: `Azul de bromotimol (6,0–7,6), porque en toda equivalencia el pH es 7`, note: 'Solo fuerte-fuerte da pH 7.', misconception: 'eq-ph7' },
            { text: `${best[0]}, porque ${weakAcid ? 'queda ácido sin neutralizar' : 'queda base sin neutralizar'} en la equivalencia`, note: `El indicador está bien, pero en la equivalencia queda la especie conjugada (${weakAcid ? 'una base' : 'un ácido'}).`, misconception: 'eq-ph7' }],
          { concept: 'ana.indicador', slide: 17, hint: 'Calcula el pH de equivalencia: C de la especie conjugada = C/2 (el volumen se duplica).', explain: `pH de equivalencia ≈ ${dec(peq, 2)} → ${best[0]}.` }); }
      return choice(rng, `Titulación de ${name}. ¿Qué indicador corresponde?`, best[0], take(rng, IND.filter(i => i !== best), 3).map(i => ({ text: i[0], note: `pH de equivalencia ≈ ${dec(peq, 1)}; este vira entre ${dec(i[1], 1)} y ${dec(i[2], 1)}.`, misconception: 'indicator-range' })),
        { concept: 'ana.indicador', slide: 17, hint: weakAcid ? 'Ácido débil: la equivalencia es básica.' : 'Base débil: la equivalencia es ácida.', explain: `pH ≈ ${dec(peq, 1)} → ${best[0]}.` });
    }
  };

  /* ════════ Ácido débil ════════ */
  const debil = {
    id: 'debil', title: 'pH en la curva de ácido débil', mission: 'm2', concepts: ['ana.debil'],
    make(rng, level) {
      const a = pick(rng, level <= 2 ? WEAK.slice(0, 1) : WEAK), pKa = -Math.log10(a.Ka), Va = pick(rng, [25, 50]), C = pick(rng, [0.1, 0.05]), Cb = C, Veq = Va;
      const zone = level === 1 ? 'half' : level === 2 ? 'buffer' : level === 3 ? pick(rng, ['start', 'buffer']) : pick(rng, ['eq', 'buffer', 'eq']);
      const head = `${level === 5 ? 'Estilo PEP: ' : ''}${Va},00 mL de ${a.name} ${dec(C, 2)} M (Ka = ${sci(a.Ka)}) se titulan con NaOH ${dec(Cb, 2)} M.`;
      if (zone === 'half') return number(`${head} ¿Cuál es el pH después de agregar ${dec(Veq / 2, 2)} mL?`, pKa, '', { concept: 'ana.debil', slide: 42, label: 'pH', tol: 0.005, hint: 'Es la mitad del volumen de equivalencia.',
        traps: [{ value: pKa / 2, note: 'A media titulación pH = pKa, no pKa/2.', misconception: 'half-eq' }, { value: 7, note: 'No es la equivalencia.' }], solution: [`V_eq = ${Va},00 mL; ${dec(Veq / 2, 2)} mL es la mitad`, `pH = pKa = ${dec(pKa, 2)}`], explain: `pH = ${dec(pKa, 2)}.` });
      if (zone === 'start') { const h = Math.sqrt(a.Ka * C);
        return number(`${head} ¿Cuál es el pH inicial (antes de agregar NaOH)?`, pH(h), '', { concept: 'ana.debil', slide: 47, label: 'pH', tol: 0.01, hint: '[H⁺] ≈ √(Ka·C).',
          traps: [{ value: pH(C), note: 'Lo trataste como ácido fuerte.' }, { value: pH(a.Ka * C), note: 'Falta la raíz.' }], solution: [`[H⁺] = √(${sci(a.Ka)} × ${dec(C, 2)}) = ${sci(h)}`, `pH = ${dec(pH(h), 2)}`], explain: `pH = ${dec(pH(h), 2)}.` }); }
      if (zone === 'buffer') { const Vb = Number((Veq * between(rng, 0.1, 0.9, 0.05)).toFixed(2)), nA = Vb * Cb, nHA = Va * C - nA, ans = pKa + Math.log10(nA / nHA);
        return number(`${head} ¿Cuál es el pH después de agregar ${fix(Vb, 2)} mL?`, ans, '', { concept: 'ana.debil', slide: 42, label: 'pH', tol: 0.01, hint: 'Zona tampón: pH = pKa + log(A⁻/HA).',
          traps: [{ value: pKa - Math.log10(nA / nHA), note: 'Invertiste la razón.', misconception: 'hh-ratio' }, { value: pKa, note: 'Solo a la mitad exacta.', misconception: 'half-eq' }],
          solution: [`A⁻ = ${fix(Vb, 2)} × ${dec(Cb, 2)} = ${dec(nA, 3)} mmol; HA = ${dec(Va * C, 3)} − ${dec(nA, 3)} = ${dec(nHA, 3)} mmol`, `pH = ${dec(pKa, 3)} + log(${dec(nA, 3)}/${dec(nHA, 3)}) = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` }); }
      const cA = Va * C / (Va + Veq), Kb = 1e-14 / a.Ka, oh = Math.sqrt(Kb * cA), ans = 14 + Math.log10(oh), noDil = 14 + Math.log10(Math.sqrt(Kb * C));
      return number(`${head} ¿Cuál es el pH en el punto de equivalencia?`, ans, '', { concept: 'ana.debil', slide: 47, label: 'pH', tol: 0.005, hint: 'Queda solo A⁻: Kb = Kw/Ka y C = mmol/V total.',
        traps: [{ value: 7, note: 'Con ácido débil la equivalencia es básica.', misconception: 'eq-ph7' }, { value: 14 - ans, note: 'Ese es el pOH.' }, { value: noDil, note: 'El volumen se duplicó: C(A⁻) es la mitad.', misconception: 'dilution-ignored' }],
        solution: [`C(A⁻) = ${dec(Va * C, 3)} mmol / ${Va + Veq} mL = ${dec(cA, 4)} M`, `Kb = 10⁻¹⁴ / ${sci(a.Ka)} = ${sci(Kb)}`, `[OH⁻] = √(Kb·C) = ${sci(oh)} → pH = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` });
    }
  };

  /* ════════ pKa desde la curva ════════ */
  const pkaCurva = {
    id: 'pka-curva', title: 'Leer el pKa en la curva', mission: 'm2', concepts: ['ana.debil'],
    make(rng, level) {
      const Veq = between(rng, 12, 40, 0.1), pKa = between(rng, 3, 6, 0.01);
      if (level <= 2) return number(`En la curva de un ácido débil, la equivalencia está en ${dec(Veq, 1)} mL y a ${dec(Veq / 2, 2)} mL el pH es ${fix(pKa, 2)}. ¿Cuál es su Ka?`, 10 ** -pKa, '', { concept: 'ana.debil', slide: 42, label: 'Ka', tol: 0.02, hint: 'A media titulación pH = pKa; Ka = 10^(−pKa).',
        traps: [{ value: 10 ** (-pKa * 2), note: 'pH = pKa, no pKa/2.', misconception: 'half-eq' }, { value: pKa, note: 'Ese es el pKa: falta Ka = 10^(−pKa).' }], solution: [`pKa = ${fix(pKa, 2)} (media titulación)`, `Ka = 10^(−${fix(pKa, 2)}) = ${sci(10 ** -pKa)}`], explain: `Ka = ${sci(10 ** -pKa)}.` });
      if (level === 3) { // identificar el ácido por su pKa medido
        const opts = take(rng, MORE.filter(a => a.Ka > 1e-7), 4), a = opts[0], pk = -Math.log10(a.Ka), V = Veq / 2;
        return choice(rng, `Un ácido desconocido se titula con NaOH: la equivalencia está en ${dec(Veq, 1)} mL y a ${dec(V, 2)} mL el pH es ${fix(pk, 2)}. ¿Cuál es el ácido?`, `${a.name} (Ka = ${sci(a.Ka)})`, opts.slice(1).map(o => ({ text: `${o.name} (Ka = ${sci(o.Ka)})`, note: `Su pKa es ${dec(-Math.log10(o.Ka), 2)}.`, misconception: 'half-eq' })),
          { concept: 'ana.debil', slide: 42, hint: 'A la mitad del volumen de equivalencia, pH = pKa; compara con −log Ka.', explain: `pKa = ${fix(pk, 2)} → ${a.name}.` }); }
      const V = Number((Veq * between(rng, 0.2, 0.8, 0.05)).toFixed(2)), p = Number((pKa + Math.log10(V / (Veq - V))).toFixed(2)), ans = p - Math.log10(V / (Veq - V));
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Un ácido débil se titula; la equivalencia está en ${dec(Veq, 1)} mL. Tras ${fix(V, 2)} mL de base el pH es ${fix(p, 2)}. Calcula el pKa.`, ans, '', { concept: 'ana.debil', slide: 42, label: 'pKa', tol: 0.005, hint: 'A⁻/HA = V/(V_eq − V).',
        traps: [{ value: p + Math.log10(V / (Veq - V)), note: 'Signo: pKa = pH − log(A⁻/HA).', misconception: 'hh-ratio' }, { value: p, note: 'pH = pKa solo a la mitad.', misconception: 'half-eq' }],
        solution: [`A⁻/HA = ${fix(V, 2)} / ${dec(Veq - V, 2)}`, `pKa = ${fix(p, 2)} − log(${dec(V / (Veq - V), 3)}) = ${dec(ans, 2)}`], explain: `pKa = ${dec(ans, 2)}.` });
    }
  };

  /* ════════ Polipróticos ════════ */
  const POLY = [{ name: 'H₃PO₄', pk: [2.15, 7.2, 12.35] }, { name: 'H₂CO₃', pk: [6.35, 10.33] }, { name: 'ácido oxálico (H₂C₂O₄)', pk: [1.25, 4.27] }, { name: 'ácido maleico', pk: [1.92, 6.27] }];
  const poli = {
    id: 'poli', title: 'Ácidos polipróticos', mission: 'm2', concepts: ['ana.poli'],
    make(rng, level) {
      const a = pick(rng, level <= 2 ? POLY.slice(0, 1) : POLY);
      if (level <= 2 || level === 4) { const V1 = between(rng, 8, 25, 0.1), k = level === 4 ? Math.min(a.pk.length, 2) : 2;
        return number(`${a.name} se titula con NaOH; la primera equivalencia está en ${dec(V1, 1)} mL. ¿En qué volumen está la equivalencia número ${k}?`, V1 * k, 'mL', { concept: 'ana.poli', slide: 59, label: 'V', tol: 0.005, hint: 'Cada protón gasta el mismo volumen.',
          traps: [{ value: V1 * 1.5, note: 'Cada tramo gasta lo mismo: el doble.' }], solution: [`V = ${k} × ${dec(V1, 1)} = ${dec(V1 * k, 1)} mL`], explain: `${dec(V1 * k, 1)} mL.` }); }
      const n = a.pk.length === 3 && rng() < 0.5 ? 2 : 1, ans = (a.pk[n - 1] + a.pk[n]) / 2;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}${a.name} (pKa: ${a.pk.map(p => fix(p, 2)).join('; ')}) se titula con NaOH. ¿pH aproximado en la ${n === 1 ? 'primera' : 'segunda'} equivalencia?`, ans, '', { concept: 'ana.poli', slide: 59, label: 'pH', tol: 0.005, hint: 'Anfolito: promedio de los pKa vecinos.',
        traps: [{ value: a.pk[n - 1], note: 'Ese pKa es a la mitad del tramo.', misconception: 'half-eq' }, { value: a.pk[n], note: 'Promedia los dos pKa vecinos.' }], solution: [`pH ≈ (${fix(a.pk[n - 1], 2)} + ${fix(a.pk[n], 2)})/2 = ${dec(ans, 2)}`], explain: `pH ≈ ${dec(ans, 2)}.` });
    }
  };

  /* ════════ Bases ════════ */
  const phBase = {
    id: 'ph', title: 'pH y pOH', mission: null, concepts: ['base.ph'],
    make(rng, level) {
      const m = between(rng, 1, 9.9, 0.1), e = -Math.round(between(rng, 2, 6, 1)), c = m * 10 ** e;
      if (level === 1) return number(`[H⁺] = ${sci(c)} M. pH =`, pH(c), '', { concept: 'base.ph', slide: 24, label: 'pH', tol: 0.005, hint: 'pH = −log[H⁺].', traps: [{ value: 14 - pH(c), note: 'Ese sería el pOH.' }], solution: [`pH = −log(${sci(c)}) = ${dec(pH(c), 2)}`], explain: `${dec(pH(c), 2)}.` });
      if (level === 2) { const p = between(rng, 1.5, 12.5, 0.05), h = 10 ** -p;
        return number(`Una solución tiene pH ${fix(p, 2)}. ¿Cuál es su [H⁺] (M)?`, h, 'M', { concept: 'base.ph', slide: 24, label: '[H⁺]', tol: 0.02, hint: '[H⁺] = 10^(−pH).', traps: [{ value: 10 ** -(14 - p), note: 'Esa es la [OH⁻].' }, { value: -p, note: 'Es 10 elevado a −pH.' }], solution: [`[H⁺] = 10^−${fix(p, 2)} = ${sci(h)} M`], explain: `${sci(h)} M.` }); }
      if (level === 3) return number(`[OH⁻] = ${sci(c)} M. pH =`, 14 - pH(c), '', { concept: 'base.ph', slide: 24, label: 'pH', tol: 0.005, hint: 'pOH = −log[OH⁻]; pH = 14 − pOH.', traps: [{ value: pH(c), note: 'Ese es el pOH.' }], solution: [`pOH = ${dec(pH(c), 2)}`, `pH = 14 − ${dec(pH(c), 2)} = ${dec(14 - pH(c), 2)}`], explain: `${dec(14 - pH(c), 2)}.` });
      const C0 = pick(rng, [0.1, 0.05, 0.2, 0.02]), Vi = pick(rng, [5, 10, 25]), Vf = pick(rng, [100, 250, 500]), Cf = C0 * Vi / Vf, isBase = rng() < 0.5;
      const ans = isBase ? 14 + Math.log10(Cf) : pH(Cf);
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Se toman ${Vi},00 mL de ${isBase ? 'NaOH' : 'HCl'} ${dec(C0, 2)} M y se diluyen a ${Vf},0 mL. ¿pH de la solución diluida?`, ans, '', { concept: 'base.ph', slide: 24, label: 'pH', tol: 0.005, hint: 'Primero C₂ = C₁V₁/V₂; luego el pH.',
        traps: [{ value: isBase ? 14 + Math.log10(C0) : pH(C0), note: 'Ese es el pH antes de diluir.' }, { value: isBase ? -Math.log10(Cf) : 14 + Math.log10(Cf), note: isBase ? 'Ese es el pOH.' : 'Lo trataste como base.' }],
        solution: [`C₂ = ${dec(C0, 2)} × ${Vi}/${Vf} = ${sci(Cf)} M`, isBase ? `pOH = ${dec(-Math.log10(Cf), 2)} → pH = ${dec(ans, 2)}` : `pH = −log(${sci(Cf)}) = ${dec(ans, 2)}`], explain: `${dec(ans, 2)}.` });
    }
  };
  const kaBase = {
    id: 'ka', title: 'Ka y pKa', mission: null, concepts: ['base.ka'],
    make(rng, level) {
      const a = pick(rng, MORE);
      if (level === 1) return number(`Ka del ${a.name} = ${sci(a.Ka)}. pKa =`, -Math.log10(a.Ka), '', { concept: 'base.ka', slide: 47, label: 'pKa', tol: 0.003, hint: 'pKa = −log Ka.', traps: [{ value: Math.log10(a.Ka), note: 'Es menos el log.' }], solution: [`pKa = ${dec(-Math.log10(a.Ka), 3)}`], explain: `${dec(-Math.log10(a.Ka), 3)}.` });
      if (level === 2 || level === 4) { const four = take(rng, MORE, 4), strongest = level === 2, pickA = four.reduce((x, y) => (strongest ? x.Ka > y.Ka : x.Ka < y.Ka) ? x : y);
        const show = o => level === 4 ? `${o.name} (pKa ${dec(-Math.log10(o.Ka), 2)})` : `${o.name} (Ka ${sci(o.Ka)})`;
        return choice(rng, `¿Cuál es el ácido ${strongest ? 'más fuerte' : 'más débil'}?`, show(pickA), four.filter(o => o !== pickA).map(o => ({ text: show(o), note: level === 4 ? 'Menor pKa = más fuerte.' : 'Mayor Ka = más fuerte.' })),
          { concept: 'base.ka', slide: 47, hint: 'Ka grande (pKa chico) = ácido más fuerte.', explain: `${pickA.name}.` }); }
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Ka del ${a.name} = ${sci(a.Ka)}. ¿Kb de su base conjugada?`, 1e-14 / a.Ka, '', { concept: 'base.ka', slide: 47, label: 'Kb', tol: 0.02, hint: 'Kb = Kw/Ka.', traps: [{ value: a.Ka / 1e-14, note: 'Al revés.' }], solution: [`Kb = 10⁻¹⁴ / ${sci(a.Ka)} = ${sci(1e-14 / a.Ka)}`], explain: `${sci(1e-14 / a.Ka)}.` });
    }
  };


  /* ════════ Comparar curvas de ácidos débiles según su Ka (PEP histórica, pregunta 2) ════════ */
  const pw = k => String(k).replace('-', '−');
  const kaCurvas = {
    id: 'ka-curvas', title: 'Curvas de ácidos débiles según su Ka', mission: 'm2', concepts: ['ana.debil'],
    make(rng, level) {
      const ks = take(rng, [-4, -5, -6, -7, -8, -9], 4).sort((x, y) => y - x), C = pick(rng, [0.1, 0.05]), names = ks.map(k => `10^${pw(k)}`).join(', ');
      const head = `${level === 5 ? 'Estilo PEP: ' : ''}25,00 mL de cuatro ácidos débiles ${dec(C, 2)} M (Ka = ${names}) se titulan con NaOH ${dec(C, 2)} M y se grafican en el mismo diagrama.`;
      const ph0 = k => pH(Math.sqrt(10 ** k * C)), pheq = k => 14 + Math.log10(Math.sqrt(1e-14 / 10 ** k * C / 2));
      const kmin = ks[ks.length - 1], kmax = ks[0];
      if (level === 1) return choice(rng, `${head} ¿Cuál parte de un pH inicial más alto?`, `Ka = 10^${pw(kmin)}`, ks.slice(0, 3).map(k => ({ text: `Ka = 10^${pw(k)}`, note: 'Mayor Ka = ácido más fuerte = pH inicial más bajo.' })),
        { concept: 'ana.debil', slide: 48, hint: 'El ácido más débil se disocia menos y deja menos H⁺.', explain: `Ka = 10^${kmin}: pH inicial ≈ ${dec(ph0(kmin), 1)}.` });
      if (level === 2) return choice(rng, `${head} A la mitad del volumen de equivalencia, ¿cuál es el pH de la curva de Ka = 10^${pw(kmax)}?`, `${dec(-kmax, 0)}`, [{ text: `${dec(-kmax / 2, 1)}`, note: 'A media titulación pH = pKa, no pKa/2.', misconception: 'half-eq' }, { text: '7', note: 'No es la equivalencia.' }, { text: `${dec(14 + kmax, 0)}`, note: 'Ese sería el pKb de la base conjugada.' }],
        { concept: 'ana.debil', slide: 42, hint: 'A media titulación [HA] = [A⁻].', explain: `pH = pKa = ${-kmax}.` });
      if (level === 3) return choice(rng, `${head} A medida que Ka disminuye, el pH de equivalencia…`, 'Sube (la base conjugada es más fuerte)', [{ text: 'Baja (el ácido es más débil)', note: 'Ácido más débil = base conjugada más fuerte = equivalencia más básica.', misconception: 'eq-ph7' }, { text: 'Queda en 7 en todas', note: 'Solo fuerte-fuerte da 7.', misconception: 'eq-ph7' }, { text: 'No cambia: depende solo de la concentración', note: 'Depende de Kb = Kw/Ka y de la concentración.' }],
        { concept: 'ana.debil', slide: 48, hint: 'En la equivalencia manda la base conjugada.', explain: `Del Ka = 10^${kmax} (pH ≈ ${dec(pheq(kmax), 1)}) al Ka = 10^${kmin} (pH ≈ ${dec(pheq(kmin), 1)}).` });
      if (level === 4) { const k = pick(rng, ks);
        return number(`${head} ¿Cuál es el pH inicial de la curva con Ka = 10^${pw(k)}?`, ph0(k), '', { concept: 'ana.debil', slide: 47, label: 'pH', tol: 0.01, hint: '[H⁺] ≈ √(Ka·C).',
          traps: [{ value: pH(C), note: 'Lo tratas como ácido fuerte.' }, { value: -k, note: 'Ese es el pKa (el pH a media titulación).', misconception: 'half-eq' }], solution: [`[H⁺] = √(10^${k} × ${dec(C, 2)}) = ${sci(Math.sqrt(10 ** k * C))}`, `pH = ${dec(ph0(k), 2)}`], explain: `pH inicial = ${dec(ph0(k), 2)}.` }); }
      const weak = ks.filter(k => k <= -8);
      if (weak.length && rng() < 0.5) return choice(rng, `${head} ¿Para cuál curva NO se ve un salto claro en la equivalencia (Ka·C < 10⁻⁸)?`, `Ka = 10^${pw(weak[0])}`, ks.filter(k => k > -8).slice(0, 3).map(k => ({ text: `Ka = 10^${pw(k)}`, note: `Ka·C = ${sci(10 ** k * C)} ≥ 10⁻⁸: el salto sí se ve.` })),
        { concept: 'ana.debil', slide: 48, hint: 'Con Ka·C < 10⁻⁸ el salto es demasiado corto.', explain: `Ka·C = ${sci(10 ** weak[0] * C)} < 10⁻⁸.` });
      const k = pick(rng, ks);
      return number(`${head} ¿Cuál es el pH en el punto de equivalencia de la curva con Ka = 10^${pw(k)}?`, pheq(k), '', { concept: 'ana.debil', slide: 47, label: 'pH', tol: 0.005, hint: 'Queda A⁻ con C/2 (el volumen se duplica): Kb = Kw/Ka.',
        traps: [{ value: 7, note: 'Con ácido débil la equivalencia es básica.', misconception: 'eq-ph7' }, { value: 14 + Math.log10(Math.sqrt(1e-14 / 10 ** k * C)), note: 'Olvidaste que el volumen se duplicó.', misconception: 'dilution-ignored' }],
        solution: [`C(A⁻) = ${dec(C / 2, 3)} M; Kb = 10⁻¹⁴/10^${k} = ${sci(1e-14 / 10 ** k)}`, `[OH⁻] = √(Kb·C) → pH = ${dec(pheq(k), 2)}`], explain: `pH = ${dec(pheq(k), 2)}.` });
    }
  };

  /* ════════ Tampón: elegir, calcular y preparar (diap. 43–47) ════════ */
  const TAMP = [{ name: 'ácido acético / acetato', pk: 4.76 }, { name: 'ácido fórmico / formiato', pk: 3.75 }, { name: 'MES', pk: 6.15 }, { name: 'H₂PO₄⁻ / HPO₄²⁻', pk: 7.20 }, { name: 'tris·H⁺ / tris', pk: 8.075 }, { name: 'NH₄⁺ / NH₃', pk: 9.24 }];
  const tampon = {
    id: 'tampon', title: 'Tampón: preparación y capacidad', mission: 'm2', concepts: ['ana.tampon'],
    make(rng, level) {
      const t = pick(rng, TAMP);
      if (level === 1) { const target = Number((t.pk + between(rng, -0.4, 0.4, 0.1)).toFixed(1)), others = take(rng, TAMP.filter(x => Math.abs(x.pk - target) > 1.2), 3);
        return choice(rng, `Quieres un tampón de pH ${fix(target, 1)}. ¿Qué par eliges?`, `${t.name} (pKa ${dec(t.pk, 2)})`, others.map(o => ({ text: `${o.name} (pKa ${dec(o.pk, 2)})`, note: `Un tampón sirve a pKa ± 1: este queda lejos de ${fix(target, 1)}.` })),
          { concept: 'ana.tampon', slide: 44, hint: 'Elige el pKa más cercano al pH que quieres (zona útil: pKa ± 1).', explain: `pKa ${t.pk} ≈ ${fix(target, 1)}.` }); }
      const nA = between(rng, 5, 40, 1), nHA = between(rng, 5, 40, 1);
      if (level === 2) return number(`Un tampón de ${t.name} (pKa ${dec(t.pk, 2)}) tiene ${dec(nA, 0)} mmol de la forma básica y ${dec(nHA, 0)} mmol de la forma ácida. ¿Cuál es su pH?`, t.pk + Math.log10(nA / nHA), '', { concept: 'ana.tampon', slide: 42, label: 'pH', tol: 0.005, hint: 'pH = pKa + log(base/ácido).',
        traps: [{ value: t.pk - Math.log10(nA / nHA), note: 'Invertiste la razón.', misconception: 'hh-ratio' }, { value: t.pk, note: 'Solo si son iguales.' }], solution: [`pH = ${dec(t.pk, 3)} + log(${dec(nA, 0)}/${dec(nHA, 0)})`, `= ${dec(t.pk + Math.log10(nA / nHA), 2)}`], explain: `pH = ${dec(t.pk + Math.log10(nA / nHA), 2)}.` });
      if (level === 3) { const x = Number((Math.min(nA, nHA) * between(rng, 0.1, 0.5, 0.05)).toFixed(2)), up = rng() < 0.5, after = up ? t.pk + Math.log10((nA + x) / (nHA - x)) : t.pk + Math.log10((nA - x) / (nHA + x));
        return number(`Al tampón de ${t.name} (pKa ${dec(t.pk, 2)}; ${dec(nA, 0)} mmol de base y ${dec(nHA, 0)} mmol de ácido) le agregas ${dec(x, 2)} mmol de ${up ? 'NaOH' : 'HCl'}. ¿Cuál es el pH ahora?`, after, '', { concept: 'ana.tampon', slide: 43, label: 'pH', tol: 0.005, hint: up ? 'El OH⁻ convierte ácido en base: la base sube y el ácido baja.' : 'El H⁺ convierte base en ácido: la base baja y el ácido sube.',
          traps: [{ value: t.pk + Math.log10(nA / nHA), note: 'Ese es el pH antes de agregar.' }, { value: up ? t.pk + Math.log10((nA - x) / (nHA + x)) : t.pk + Math.log10((nA + x) / (nHA - x)), note: 'Cambiaste el sentido: la base fuerte aumenta la forma básica; el ácido fuerte, la ácida.' }],
          solution: [up ? `Base: ${dec(nA, 0)} + ${dec(x, 2)}; ácido: ${dec(nHA, 0)} − ${dec(x, 2)}` : `Base: ${dec(nA, 0)} − ${dec(x, 2)}; ácido: ${dec(nHA, 0)} + ${dec(x, 2)}`, `pH = ${dec(after, 2)}`], explain: `pH = ${dec(after, 2)}.` }); }
      // preparación (diap. 45): mL de NaOH para llevar tris·HCl hasta un pH dado
      const pk = 8.075, tgt = pick(rng, [7.4, 7.6, 7.8, 8.0, 8.2]), r = 10 ** (tgt - pk), tot = pick(rng, [50, 100]), nB = tot * r / (1 + r), CNaOH = pick(rng, [0.1, 0.2, 0.5]), V = nB / CNaOH;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Para preparar un tampón tris a pH ${fix(tgt, 1)} (pKa del tris·H⁺ = 8,075) disuelves ${dec(tot, 0)} mmol de hidrocloruro de tris y agregas NaOH ${dec(CNaOH, 1)} M. ¿Cuántos mL de NaOH necesitas?`, V, 'mL', { concept: 'ana.tampon', slide: 45, label: 'V', tol: 0.02, hint: 'Cada mmol de NaOH convierte 1 mmol de tris·H⁺ en tris: nB/nBH = 10^(pH − pKa).',
        traps: [{ value: tot * (1 - r / (1 + r)) / CNaOH, note: 'Esos mL dejarían la razón al revés (más ácido que base).', misconception: 'hh-ratio' }, { value: tot / CNaOH, note: 'Eso neutraliza todo el tris·H⁺: ya no hay tampón.' }],
        solution: [`nB/nBH = 10^(${fix(tgt, 1)} − 8,075) = ${dec(r, 3)}`, `nB = ${dec(tot, 0)}·${dec(r, 3)}/(1 + ${dec(r, 3)}) = ${dec(nB, 2)} mmol`, `V = ${dec(nB, 2)} / ${dec(CNaOH, 1)} = ${dec(V, 1)} mL`], explain: `${dec(V, 1)} mL.` });
    }
  };

  /* ════════ Base débil con ácido fuerte (diap. 50–51) ════════ */
  const BASEW = [{ name: 'amoníaco', Kb: 1.8e-5 }, { name: 'etilamina', Kb: 4.3e-4 }, { name: 'dietilamina', Kb: 6.9e-4 }, { name: 'hidroxilamina', Kb: 9.1e-9 }, { name: 'piridina', Kb: 1.5e-9 }, { name: 'anilina', Kb: 7.4e-10 }];
  const baseDebil = {
    id: 'base-debil', title: 'pH en la curva de base débil', mission: 'm3', concepts: ['ana.basedebil'],
    make(rng, level) {
      const b = pick(rng, level <= 2 ? BASEW.slice(0, 3) : BASEW), pKa = 14 + Math.log10(b.Kb), Va = pick(rng, [25, 50]), C = pick(rng, [0.1, 0.05]), Veq = Va;
      const zone = level === 1 ? 'half' : level === 2 ? 'buffer' : level === 3 ? pick(rng, ['start', 'buffer']) : pick(rng, ['eq', 'excess', 'buffer', 'eq']);
      const head = `${level === 5 ? 'Estilo PEP: ' : ''}${Va},00 mL de ${b.name} ${dec(C, 2)} M (Kb = ${sci(b.Kb)}) se titulan con HCl ${dec(C, 2)} M.`;
      if (zone === 'half') return number(`${head} ¿Cuál es el pH después de agregar ${dec(Veq / 2, 2)} mL de HCl?`, pKa, '', { concept: 'ana.basedebil', slide: 51, label: 'pH', tol: 0.005, hint: 'Es la mitad de la equivalencia: pH = pKa del ácido conjugado BH⁺ (14 − pKb).',
        traps: [{ value: -Math.log10(b.Kb), note: 'Ese es el pKb: el pH de media titulación es el pKa del BH⁺ = 14 − pKb.', misconception: 'pkb-pka' }, { value: 7, note: 'No es la equivalencia.' }], solution: [`pKb = ${dec(-Math.log10(b.Kb), 2)}`, `pKa(BH⁺) = 14 − pKb = ${dec(pKa, 2)}`, `pH = pKa = ${dec(pKa, 2)}`], explain: `pH = ${dec(pKa, 2)}.` });
      if (zone === 'start') { const oh = Math.sqrt(b.Kb * C), ans = 14 + Math.log10(oh);
        return number(`${head} ¿Cuál es el pH inicial (antes de agregar HCl)?`, ans, '', { concept: 'ana.basedebil', slide: 51, label: 'pH', tol: 0.005, hint: '[OH⁻] ≈ √(Kb·C); luego pH = 14 − pOH.',
          traps: [{ value: -Math.log10(oh), note: 'Ese es el pOH.' }, { value: 14 + Math.log10(C), note: 'La trataste como base fuerte.' }], solution: [`[OH⁻] = √(${sci(b.Kb)} × ${dec(C, 2)}) = ${sci(oh)}`, `pOH = ${dec(-Math.log10(oh), 2)}; pH = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` }); }
      if (zone === 'buffer') { const Vb = Number((Veq * between(rng, 0.1, 0.9, 0.05)).toFixed(2)), nBH = Vb * C, nB = Va * C - nBH, ans = pKa + Math.log10(nB / nBH);
        return number(`${head} ¿Cuál es el pH después de agregar ${fix(Vb, 2)} mL de HCl?`, ans, '', { concept: 'ana.basedebil', slide: 51, label: 'pH', tol: 0.005, hint: 'Zona tampón: pH = pKa(BH⁺) + log(B/BH⁺).',
          traps: [{ value: pKa - Math.log10(nB / nBH), note: 'Invertiste la razón: la base B va arriba.', misconception: 'hh-ratio' }, { value: -Math.log10(b.Kb) + Math.log10(nB / nBH), note: 'Usaste el pKb sin pasarlo a pKa del BH⁺.', misconception: 'pkb-pka' }],
          solution: [`BH⁺ = ${fix(Vb, 2)} × ${dec(C, 2)} = ${dec(nBH, 3)} mmol; B = ${dec(Va * C, 3)} − ${dec(nBH, 3)} = ${dec(nB, 3)} mmol`, `pH = ${dec(pKa, 2)} + log(${dec(nB, 3)}/${dec(nBH, 3)}) = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` }); }
      if (zone === 'excess') { const Vx = pick(rng, [2, 5, 10]), h = Vx * C / (Va + Veq + Vx), ans = pH(h);
        return number(`${head} ¿Cuál es el pH después de agregar ${dec(Veq + Vx, 2)} mL de HCl?`, ans, '', { concept: 'ana.basedebil', slide: 51, label: 'pH', tol: 0.01, hint: 'Pasada la equivalencia manda el H⁺ sobrante, con el volumen total.',
          traps: [{ value: pH(Vx * C / (Va + Veq)), note: 'Olvidaste los mL de exceso en el volumen total.', misconception: 'dilution-ignored' }, { value: 14 - ans, note: 'Ese pH sería de una base: sobra ácido.' }], solution: [`H⁺ sobrante = ${dec(Vx, 0)} mL × ${dec(C, 2)} = ${dec(Vx * C, 2)} mmol`, `[H⁺] = ${dec(Vx * C, 2)}/${dec(Va + Veq + Vx, 0)} = ${sci(h)}`, `pH = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` }); }
      const cBH = Va * C / (Va + Veq), Ka = 1e-14 / b.Kb, h = Math.sqrt(Ka * cBH), ans = pH(h);
      return number(`${head} ¿Cuál es el pH en el punto de equivalencia?`, ans, '', { concept: 'ana.basedebil', slide: 51, label: 'pH', tol: 0.01, hint: 'Queda solo BH⁺ (ácido débil): Ka = Kw/Kb y C = mmol/V total.',
        traps: [{ value: 7, note: 'Con base débil la equivalencia es ácida (pH < 7).', misconception: 'eq-ph7' }, { value: pH(Math.sqrt(Ka * C)), note: 'Olvidaste que el volumen se duplicó.', misconception: 'dilution-ignored' }, { value: 14 - ans, note: 'Ese pH sería de una base.' }],
        solution: [`C(BH⁺) = ${dec(Va * C, 2)} mmol / ${Va + Veq} mL = ${dec(cBH, 4)} M`, `Ka = 10⁻¹⁴ / ${sci(b.Kb)} = ${sci(Ka)}`, `[H⁺] = √(Ka·C) = ${sci(h)} → pH = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` });
    }
  };

  /* ════════ Ácido diprótico paso a paso (diap. 55–58) ════════ */
  const diprotico = {
    id: 'diprotico', title: 'Curva de un ácido diprótico', mission: 'm3', concepts: ['ana.diprotico'],
    make(rng, level) {
      const carbonic = rng() < 0.3, p1 = carbonic ? 6.35 : pick(rng, [3.8, 4.2, 4.6, 5.0]), p2 = carbonic ? 10.33 : Number((p1 + pick(rng, [4.5, 5.0, 5.5])).toFixed(1)), K1 = 10 ** -p1, K2 = 10 ** -p2;
      const Va = pick(rng, [20, 25, 50]), C = pick(rng, [0.1, 0.05]), Veq1 = Va, Veq2 = 2 * Va, nm = carbonic ? 'H₂CO₃' : `un ácido diprótico H₂A (pKa₁ = ${fix(p1, 1)}; pKa₂ = ${fix(p2, 1)})`;
      const head = `${level === 5 ? 'Estilo PEP: ' : ''}${Va},00 mL de ${nm} ${dec(C, 2)} M se titulan con NaOH ${dec(C, 2)} M.`;
      const zone = level === 1 ? pick(rng, ['eq1', 'half1', 'volumen']) : level === 2 ? pick(rng, ['half1', 'half2', 'eq1']) : level === 3 ? pick(rng, ['buf1', 'buf2', 'start']) : level === 4 ? pick(rng, ['eq2', 'buf2', 'buf1']) : pick(rng, ['eq2', 'exceso', 'buf2', 'eq2']);
      if (zone === 'volumen') { const k = pick(rng, [2, 2, 1]);
        return number(`${head} ¿En qué volumen de NaOH está la ${k === 1 ? 'primera' : 'segunda'} equivalencia?`, Va * k, 'mL', { concept: 'ana.diprotico', slide: 56, label: 'V', tol: 0.005, hint: 'Cada protón gasta los mismos mmol de NaOH.',
          traps: [{ value: Va * 1.5, note: 'Cada protón consume lo mismo: el segundo punto está al doble.' }], solution: [`mmol de H₂A = ${dec(Va * C, 2)}; cada protón necesita ${dec(Va * C, 2)} mmol de NaOH`, `V = ${k} × ${Va} = ${Va * k} mL`], explain: `${Va * k} mL.` }); }
      if (zone === 'half1' || zone === 'half2') { const first = zone === 'half1', ans = first ? p1 : p2;
        return number(`${head} ¿Cuál es el pH después de agregar ${dec(first ? Veq1 / 2 : Veq1 * 1.5, 2)} mL de NaOH?`, ans, '', { concept: 'ana.diprotico', slide: 58, label: 'pH', tol: 0.005, hint: first ? 'Mitad del primer tramo: pH = pKa₁.' : 'Mitad del segundo tramo (entre Veq₁ y Veq₂): pH = pKa₂.',
          traps: [{ value: first ? p2 : p1, note: 'Ese es el otro pKa: ubica en cuál tramo estás.', misconception: 'half-eq' }, { value: (p1 + p2) / 2, note: 'Ese pH es el de la primera equivalencia (anfolito).' }], solution: [first ? `${dec(Veq1 / 2, 2)} mL es la mitad del primer tramo (0 → ${Veq1} mL)` : `${dec(Veq1 * 1.5, 2)} mL es la mitad del segundo tramo (${Veq1} → ${Veq2} mL)`, `pH = ${first ? 'pKa₁' : 'pKa₂'} = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` }); }
      if (zone === 'eq1') { const ans = (p1 + p2) / 2;
        return number(`${head} ¿Cuál es el pH en la primera equivalencia (${Veq1} mL de NaOH)?`, ans, '', { concept: 'ana.diprotico', slide: 57, label: 'pH', tol: 0.005, hint: 'Queda el anfolito HA⁻: pH ≈ (pKa₁ + pKa₂)/2.',
          traps: [{ value: p1, note: 'pKa₁ es el pH a media titulación del primer tramo, no en la equivalencia.', misconception: 'half-eq' }, { value: p2, note: 'Promedia los dos pKa vecinos.' }, { value: 7, note: 'No es fuerte-fuerte.', misconception: 'eq-ph7' }], solution: [`En ${Veq1} mL todo H₂A pasó a HA⁻ (anfolito)`, `pH ≈ (${fix(p1, 2)} + ${fix(p2, 2)})/2 = ${dec(ans, 2)}`], explain: `pH ≈ ${dec(ans, 2)}.` }); }
      if (zone === 'start') { const h = Math.sqrt(K1 * C), ans = pH(h);
        return number(`${head} ¿Cuál es el pH inicial? (Considera solo la primera disociación.)`, ans, '', { concept: 'ana.diprotico', slide: 52, label: 'pH', tol: 0.01, hint: 'H₂A se trata como monoprótico de Ka₁: [H⁺] ≈ √(Ka₁·C).',
          traps: [{ value: pH(C), note: 'Lo tratas como ácido fuerte.' }, { value: p1, note: 'Ese es el pKa₁, no el pH inicial.', misconception: 'half-eq' }], solution: [`[H⁺] = √(${sci(K1)} × ${dec(C, 2)}) = ${sci(h)}`, `pH = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` }); }
      if (zone === 'buf1') { const V = Number((Veq1 * between(rng, 0.1, 0.9, 0.05)).toFixed(2)), nA = V * C, nHA = Va * C - nA, ans = p1 + Math.log10(nA / nHA);
        return number(`${head} ¿Cuál es el pH después de agregar ${fix(V, 2)} mL de NaOH?`, ans, '', { concept: 'ana.diprotico', slide: 58, label: 'pH', tol: 0.005, hint: 'Primer tampón H₂A/HA⁻: pH = pKa₁ + log(HA⁻/H₂A).',
          traps: [{ value: p1 - Math.log10(nA / nHA), note: 'Invertiste la razón.', misconception: 'hh-ratio' }, { value: p2 + Math.log10(nA / nHA), note: 'Usaste pKa₂: en este tramo el tampón es H₂A/HA⁻ (pKa₁).' }], solution: [`HA⁻ = ${dec(nA, 3)} mmol; H₂A = ${dec(Va * C, 3)} − ${dec(nA, 3)} = ${dec(nHA, 3)} mmol`, `pH = ${fix(p1, 2)} + log(${dec(nA, 3)}/${dec(nHA, 3)}) = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` }); }
      if (zone === 'buf2') { const f = between(rng, 0.1, 0.9, 0.05), V = Number((Veq1 + Veq1 * f).toFixed(2)), nA2 = (V - Veq1) * C, nHA = Va * C - nA2, ans = p2 + Math.log10(nA2 / nHA);
        return number(`${head} ¿Cuál es el pH después de agregar ${fix(V, 2)} mL de NaOH?`, ans, '', { concept: 'ana.diprotico', slide: 58, label: 'pH', tol: 0.005, hint: 'Segundo tampón HA⁻/A²⁻: pH = pKa₂ + log(A²⁻/HA⁻). Ojo: ya gastaste Veq₁ en el primer protón.',
          traps: [{ value: p2 - Math.log10(nA2 / nHA), note: 'Invertiste la razón.', misconception: 'hh-ratio' }, { value: p2 + Math.log10((V * C) / (2 * Va * C - V * C)), note: 'Contaste todo el NaOH: en este tramo solo cuenta lo que pasó de Veq₁.' }], solution: [`NaOH del segundo tramo = ${fix(V, 2)} − ${Veq1} = ${dec(V - Veq1, 2)} mL → A²⁻ = ${dec(nA2, 3)} mmol`, `HA⁻ = ${dec(Va * C, 3)} − ${dec(nA2, 3)} = ${dec(nHA, 3)} mmol`, `pH = ${fix(p2, 2)} + log(${dec(nA2, 3)}/${dec(nHA, 3)}) = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` }); }
      if (zone === 'eq2') { const cA = Va * C / (Va + Veq2), oh = Math.sqrt(1e-14 / K2 * cA), ans = 14 + Math.log10(oh);
        return number(`${head} ¿Cuál es el pH en la segunda equivalencia (${Veq2} mL de NaOH)?`, ans, '', { concept: 'ana.diprotico', slide: 58, label: 'pH', tol: 0.005, hint: 'Queda solo A²⁻ (base débil): Kb₁ = Kw/Ka₂ y C = mmol/V total.',
          traps: [{ value: 14 + Math.log10(Math.sqrt(1e-14 / K2 * C)), note: 'El volumen se triplicó: C(A²⁻) = mmol / (Va + Veq₂).', misconception: 'dilution-ignored' }, { value: (p1 + p2) / 2, note: 'Ese es el pH de la primera equivalencia.' }, { value: 7, note: 'Queda una base: pH > 7.', misconception: 'eq-ph7' }], solution: [`C(A²⁻) = ${dec(Va * C, 2)} mmol / ${Va + Veq2} mL = ${dec(cA, 4)} M`, `Kb₁ = 10⁻¹⁴ / ${sci(K2)} = ${sci(1e-14 / K2)}`, `[OH⁻] = √(Kb·C) = ${sci(oh)} → pH = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` }); }
      const Vx = pick(rng, [2, 5, 10]), oh = Vx * C / (Va + Veq2 + Vx), ans = 14 + Math.log10(oh);
      return number(`${head} ¿Cuál es el pH después de agregar ${dec(Veq2 + Vx, 2)} mL de NaOH?`, ans, '', { concept: 'ana.diprotico', slide: 58, label: 'pH', tol: 0.005, hint: 'Pasada la segunda equivalencia manda el OH⁻ sobrante, con el volumen total.',
        traps: [{ value: 14 + Math.log10(Vx * C / (Va + Veq2)), note: 'Olvidaste los mL de exceso en el volumen total.', misconception: 'dilution-ignored' }, { value: -Math.log10(oh), note: 'Ese es el pOH.' }], solution: [`OH⁻ sobrante = ${dec(Vx, 0)} mL × ${dec(C, 2)} = ${dec(Vx * C, 2)} mmol`, `[OH⁻] = ${dec(Vx * C, 2)}/${dec(Va + Veq2 + Vx, 0)} = ${sci(oh)}`, `pOH = ${dec(-Math.log10(oh), 2)} → pH = ${dec(ans, 2)}`], explain: `pH = ${dec(ans, 2)}.` });
    }
  };

  /* ════════ Anfolitos (diap. 53–54) ════════ */
  const AMPH = [{ name: 'NaHCO₃', ion: 'HCO₃⁻', pk: [6.35, 10.33] }, { name: 'NaH₂PO₄', ion: 'H₂PO₄⁻', pk: [2.15, 7.20] }, { name: 'Na₂HPO₄', ion: 'HPO₄²⁻', pk: [7.20, 12.35] }, { name: 'ftalato ácido de potasio (KHP)', ion: 'HP⁻', pk: [2.95, 5.41] }, { name: 'oxalato ácido de sodio (NaHC₂O₄)', ion: 'HC₂O₄⁻', pk: [1.25, 4.27] }, { name: 'glicina (zwitterión)', ion: '⁺H₃N–CH₂–COO⁻', pk: [2.35, 9.78] }];
  const anfolito = {
    id: 'anfolito', title: 'pH de un anfolito', mission: 'm3', concepts: ['ana.anfolito'],
    make(rng, level) {
      const a = pick(rng, AMPH), pk1 = a.pk[0], pk2 = a.pk[1], ans = (pk1 + pk2) / 2, C = pick(rng, [0.1, 0.05, 0.02, 0.01]);
      if (level === 1 || level === 5) return number(`${level === 5 ? 'Estilo PEP: ' : ''}Se disuelve ${a.name} ${dec(C, 2)} M (anfolito ${a.ion}; pKa = ${fix(pk1, 2)} y ${fix(pk2, 2)}). ¿Cuál es el pH aproximado?`, ans, '', { concept: 'ana.anfolito', slide: 54, label: 'pH', tol: 0.005, hint: 'pH ≈ ½(pKa₁ + pKa₂): los dos pKa que rodean al anfolito.',
        traps: [{ value: pk1, note: 'No es un pKa solo: se promedian los dos vecinos.', misconception: 'half-eq' }, { value: pk2, note: 'Promedia con el otro pKa.' }, { value: 7, note: 'No tiene por qué ser neutro.', misconception: 'eq-ph7' }], solution: [`pH ≈ (${fix(pk1, 2)} + ${fix(pk2, 2)})/2 = ${dec(ans, 2)}`, 'No depende de la concentración'], explain: `pH ≈ ${dec(ans, 2)}.` });
      if (level === 2) return choice(rng, `Diluyes 10 veces una solución de ${a.name}. ¿Qué pasa con su pH (anfolito)?`, 'Casi no cambia', [{ text: 'Sube 1 unidad', note: 'Eso pasaría con un ácido o una base fuerte, no con un anfolito.', misconception: 'dilution-ignored' }, { text: 'Baja 1 unidad', note: 'El pH del anfolito no depende de la concentración.' }, { text: 'Se hace 7', note: 'Se queda cerca de (pKa₁ + pKa₂)/2.', misconception: 'eq-ph7' }],
        { concept: 'ana.anfolito', slide: 54, hint: 'pH ≈ ½(pKa₁ + pKa₂): ¿aparece la concentración?', explain: `pH ≈ ${dec(ans, 2)} sin importar la concentración (si es razonablemente alta).` });
      if (level === 3) return choice(rng, `¿Qué pH tiene una solución de ${a.name} (pKa ${fix(pk1, 2)} y ${fix(pk2, 2)})?`, `${dec(ans, 2)}`, [{ text: `${dec(pk1, 2)}`, note: 'Ese es el pKa₁, no el promedio.', misconception: 'half-eq' }, { text: `${dec(pk2, 2)}`, note: 'Ese es el pKa₂, no el promedio.', misconception: 'half-eq' }, { text: '7,00', note: 'No tiene por qué ser neutro.', misconception: 'eq-ph7' }],
        { concept: 'ana.anfolito', slide: 54, hint: `${a.ion} puede ceder y recibir un H⁺: promedia los pKa a cada lado.`, explain: `(${fix(pk1, 2)} + ${fix(pk2, 2)})/2 = ${dec(ans, 2)}.` });
      const x = Number((ans + between(rng, -0.4, 0.4, 0.1)).toFixed(1)), pk2c = 2 * x - pk1;
      return number(`Una solución de un anfolito HA⁻ tiene pH ${fix(x, 1)} y su pKa₁ es ${fix(pk1, 2)}. ¿Cuál es su pKa₂?`, pk2c, '', { concept: 'ana.anfolito', slide: 54, label: 'pKa₂', tol: 0.01, hint: 'pH = ½(pKa₁ + pKa₂) → pKa₂ = 2·pH − pKa₁.',
        traps: [{ value: x, note: 'Ese es el pH, no el pKa₂.' }, { value: x - pk1, note: 'No es una resta simple: pKa₂ = 2·pH − pKa₁.' }], solution: [`pKa₂ = 2 × ${fix(x, 1)} − ${fix(pk1, 2)} = ${dec(pk2c, 2)}`], explain: `pKa₂ = ${dec(pk2c, 2)}.` });
    }
  };

  /* ════════ Diagramas de distribución de especies (libros: Skoog y Harris) ════════ */
  const SPEC = [{ name: 'H₃PO₄', sp: ['H₃PO₄', 'H₂PO₄⁻', 'HPO₄²⁻', 'PO₄³⁻'], pk: [2.15, 7.20, 12.35] }, { name: 'H₂CO₃', sp: ['H₂CO₃', 'HCO₃⁻', 'CO₃²⁻'], pk: [6.35, 10.33] }, { name: 'ácido oxálico', sp: ['H₂C₂O₄', 'HC₂O₄⁻', 'C₂O₄²⁻'], pk: [1.25, 4.27] }, { name: 'ácido ftálico', sp: ['H₂Ft', 'HFt⁻', 'Ft²⁻'], pk: [2.95, 5.41] }];
  const alphaOf = (pk, ph) => { const h = 10 ** -ph, K = pk.map(p => 10 ** -p), t = [h ** pk.length]; for (let i = 0; i < pk.length; i++) t.push(t[i] / h * K[i]); const D = t.reduce((s, v) => s + v, 0); return t.map(v => v / D); };
  const alfa = {
    id: 'alfa', title: 'Diagrama de distribución de especies', mission: 'm3', concepts: ['ana.alfa'],
    make(rng, level) {
      const s = pick(rng, level <= 2 ? SPEC.slice(0, 2) : SPEC), n = s.pk.length, pks = s.pk.map(p => fix(p, 2)).join('; ');
      if (level <= 2) { const region = Math.floor(rng() * (n + 1)), lo = region === 0 ? s.pk[0] - 2 : s.pk[region - 1] + 0.8, hi = region === n ? s.pk[n - 1] + 2 : s.pk[region] - 0.8, ph = Number((lo + rng() * Math.max(hi - lo, 0)).toFixed(1)), ok = s.sp[region];
        return choice(rng, `${s.name} (pKa: ${pks}). A pH ${fix(ph, 1)}, ¿qué especie predomina?`, ok, s.sp.filter((x, i) => i !== region).map(x => ({ text: x, note: 'Compara el pH con cada pKa: bajo pKa₁ predomina la más protonada; entre pKa₁ y pKa₂, la siguiente; y así.', misconception: 'half-eq' })),
          { concept: 'ana.alfa', slide: 59, hint: 'Cada pKa marca el pH donde se cruzan dos especies vecinas.', explain: `${ok} (región ${region + 1} del diagrama).` }); }
      if (level === 3) { const k = rng() < 0.5 ? 1 : 0, ph = Number((s.pk[k] + between(rng, -1.5, 1.5, 0.1)).toFixed(1)), ratio = 10 ** (ph - s.pk[k]);
        return number(`${s.name} (pKa: ${pks}). A pH ${fix(ph, 1)}, ¿cuál es la razón [${s.sp[k + 1]}]/[${s.sp[k]}]?`, ratio, '', { concept: 'ana.alfa', slide: 42, label: 'razón', tol: 0.02, hint: 'Henderson-Hasselbalch entre las dos especies vecinas: razón = 10^(pH − pKa).',
          traps: [{ value: 1 / ratio, note: 'Invertiste la razón.', misconception: 'hh-ratio' }, { value: ph - s.pk[k], note: 'Ese es el log de la razón: falta 10^( ).' }], solution: [`razón = 10^(${fix(ph, 1)} − ${fix(s.pk[k], 2)}) = ${dec(ratio, 3)}`], explain: `Razón = ${dec(ratio, 2)}.` }); }
      if (level === 4) { const k = Math.floor(rng() * (n + 1)), ph = Number((k === 0 ? s.pk[0] - 1 : k === n ? s.pk[n - 1] + 1 : (s.pk[k - 1] + s.pk[k]) / 2).toFixed(1)), al = alphaOf(s.pk, ph);
        return number(`${s.name} (pKa: ${pks}). Calcula la fracción α de ${s.sp[k]} a pH ${fix(ph, 1)} (usa las constantes completas).`, al[k], '', { concept: 'ana.alfa', slide: 59, label: 'α', tol: 0.03, hint: 'α = (término de la especie)/(suma de todos los términos): [H⁺]ⁿ, Ka₁[H⁺]ⁿ⁻¹, Ka₁Ka₂[H⁺]ⁿ⁻²…',
          traps: [{ value: 1 - al[k], note: 'Esa es la fracción de todas las demás especies juntas.' }], solution: [`α en el orden ${s.sp.join(', ')}: ${al.map(v => dec(v, 4)).join(' · ')}`, `α(${s.sp[k]}) = ${dec(al[k], 4)}`], explain: `α(${s.sp[k]}) = ${dec(al[k], 3)}.` }); }
      const tot = pick(rng, [0.05, 0.1, 0.02]), ph = pick(rng, [6.8, 7.0, 7.4, 7.8]), al = alphaOf(SPEC[0].pk, ph), c2 = tot * al[2];
      return number(`Estilo PEP: un tampón de fosfato tiene una concentración total ${dec(tot, 2)} M (H₃PO₄: pKa 2,15; 7,20; 12,35) y pH ${fix(ph, 1)}. ¿Cuál es la concentración de HPO₄²⁻ (M)?`, c2, 'M', { concept: 'ana.alfa', slide: 59, label: '[HPO₄²⁻]', tol: 0.03, hint: '[HPO₄²⁻] = C_total × α₂, con α₂ = Ka₁Ka₂[H⁺]/D.',
        traps: [{ value: tot * al[1], note: 'Esa es [H₂PO₄⁻].' }, { value: tot, note: 'Esa es la concentración total, no la de una sola especie.' }], solution: [`α(H₂PO₄⁻) = ${dec(al[1], 3)}; α(HPO₄²⁻) = ${dec(al[2], 3)}`, `[HPO₄²⁻] = ${dec(tot, 2)} × ${dec(al[2], 3)} = ${sci(c2)} M`], explain: `[HPO₄²⁻] = ${sci(c2)} M.` });
    }
  };

  /* ════════ Mezclas (libros: Skoog y Harris) ════════ */
  const MM = { NaOH: 40.00, 'Na₂CO₃': 105.99, 'NaHCO₃': 84.01 };
  const mezcla = {
    id: 'mezcla', title: 'Mezclas: carbonatos y ácido fuerte + débil', mission: 'm3', concepts: ['ana.mezcla'],
    make(rng, level) {
      const type = rng() < 0.65 ? 'warder' : 'fuerte-debil', Va = pick(rng, [20, 25, 50]), r05 = x => Math.round(x / 0.05) * 0.05;
      if (type === 'warder') { const Ct = pick(rng, [0.1, 0.1, 0.2]), case1 = rng() < 0.5, nA = between(rng, 1, 4, 0.1), nB = between(rng, 0.5, 2.5, 0.1);
        // caso 1: NaOH (nA) + Na₂CO₃ (nB) · caso 2: Na₂CO₃ (nA) + NaHCO₃ (nB); fenolftaleína (V1) y naranja de metilo (V2, acumulado)
        const V1 = r05(case1 ? (nA + nB) / Ct : nA / Ct), V2 = r05(case1 ? V1 + nB / Ct : V1 + (nA + nB) / Ct);
        const n1 = case1 ? (2 * V1 - V2) * Ct : V1 * Ct, n2 = case1 ? (V2 - V1) * Ct : (V2 - 2 * V1) * Ct, c1 = case1 ? 'NaOH' : 'Na₂CO₃', c2 = case1 ? 'Na₂CO₃' : 'NaHCO₃';
        const head = `${level === 5 ? 'Estilo PEP: ' : ''}Una alícuota de ${Va},00 mL de una muestra básica se titula con HCl ${dec(Ct, 2)} M: con fenolftaleína el viraje ocurre a ${dec(V1, 2)} mL y con naranja de metilo (volumen total acumulado) a ${dec(V2, 2)} mL.`;
        if (level <= 2) return choice(rng, `${head} ¿Qué contiene la muestra?`, `${c1} y ${c2}`, [case1 ? { text: 'Na₂CO₃ y NaHCO₃', note: 'Con V₁ > V₂ − V₁ hay hidróxido, no bicarbonato.' } : { text: 'NaOH y Na₂CO₃', note: 'Aquí V₁ < V₂ − V₁: el segundo tramo es mayor, hay bicarbonato.' }, { text: 'NaOH y NaHCO₃', note: 'Esos dos reaccionan entre sí: no pueden coexistir.' }, { text: 'Solo Na₂CO₃', note: 'Entonces V₂ sería exactamente 2·V₁.', misconception: 'half-eq' }],
          { concept: 'ana.mezcla', slide: 59, hint: `Compara V₁ con V₂ − V₁ (${dec(V1, 2)} frente a ${dec(V2 - V1, 2)}).`, explain: `V₁ ${case1 ? '>' : '<'} V₂ − V₁ → ${c1} y ${c2}.` });
        const ask = level >= 4 && rng() < 0.5 ? 1 : 0, nm = ask ? c2 : c1, nn = ask ? n2 : n1, mg = nn * MM[nm];
        return number(`${head} ¿Cuántos mg de ${nm} hay en la alícuota? (M: NaOH 40,00; Na₂CO₃ 105,99; NaHCO₃ 84,01 g/mol)`, mg, 'mg', { concept: 'ana.mezcla', slide: 59, label: nm, tol: 0.02, hint: case1 ? 'V₁ gasta OH⁻ + CO₃²⁻; el tramo V₂ − V₁ gasta solo el CO₃²⁻ (pasando por HCO₃⁻).' : 'V₁ gasta solo el CO₃²⁻ (→ HCO₃⁻); el tramo V₂ − V₁ gasta el HCO₃⁻ original más el formado.',
          traps: [{ value: V1 * Ct * MM[nm], note: 'Usaste V₁ completo para esa especie: separa qué consume cada tramo.' }, { value: V2 * Ct * MM[nm], note: 'V₂ es el total de todo lo básico.' }], solution: case1 ? [`n(Na₂CO₃) = (V₂ − V₁)·C = ${dec(V2 - V1, 2)} × ${dec(Ct, 2)} = ${dec(n2, 3)} mmol`, `n(NaOH) = (2V₁ − V₂)·C = ${dec(n1, 3)} mmol`, `${nm}: ${dec(nn, 3)} mmol × ${MM[nm]} = ${dec(mg, 1)} mg`] : [`n(Na₂CO₃) = V₁·C = ${dec(n1, 3)} mmol`, `n(NaHCO₃) = (V₂ − 2V₁)·C = ${dec(n2, 3)} mmol`, `${nm}: ${dec(nn, 3)} mmol × ${MM[nm]} = ${dec(mg, 1)} mg`], explain: `${dec(mg, 1)} mg de ${nm}.` }); }
      const Ca = pick(rng, [0.1, 0.2]), nS = between(rng, 1, 4, 0.1), nW = between(rng, 1, 4, 0.1), V1 = r05(nS / Ca), V2 = r05(V1 + nW / Ca), mS = V1 * Ca, mW = (V2 - V1) * Ca;
      const head = `${level === 5 ? 'Estilo PEP: ' : ''}Una alícuota de ${Va},00 mL de una mezcla de HCl y ácido acético se titula con NaOH ${dec(Ca, 2)} M. Se observan dos puntos de equivalencia: ${dec(V1, 2)} mL y ${dec(V2, 2)} mL (acumulado).`;
      if (level <= 2) return choice(rng, `${head} ¿Qué representa el primer punto de equivalencia?`, 'La neutralización del HCl (ácido fuerte)', [{ text: 'La neutralización del ácido acético', note: 'El ácido fuerte se neutraliza primero.' }, { text: 'La neutralización de ambos ácidos a la vez', note: 'Ese es el segundo punto (volumen total).' }, { text: 'El tampón acético/acetato en su máximo', note: 'Eso ocurre a media titulación del ácido débil, ya en el segundo tramo.', misconception: 'half-eq' }],
        { concept: 'ana.mezcla', slide: 59, hint: '¿Cuál ácido reacciona primero con la base?', explain: 'Primero se titula el ácido fuerte; luego el débil.' });
      const ask = level >= 4 && rng() < 0.5, nn = ask ? mW : mS;
      return number(`${head} ¿Cuál es la concentración (M) de ${ask ? 'ácido acético' : 'HCl'} en la mezcla original?`, nn / Va, 'M', { concept: 'ana.mezcla', slide: 59, label: ask ? '[CH₃COOH]' : '[HCl]', tol: 0.02, hint: 'Primer punto: solo el ácido fuerte. Segundo − primero: el ácido débil.',
        traps: [{ value: V2 * Ca / Va, note: 'Con el volumen total contaste ambos ácidos juntos.' }, { value: (ask ? mS : mW) / Va, note: 'Mezclaste los tramos: el primero es del ácido fuerte, el segundo del débil.' }], solution: [`HCl: V₁·C = ${dec(V1, 2)} × ${dec(Ca, 2)} = ${dec(mS, 3)} mmol`, `Ácido acético: (V₂ − V₁)·C = ${dec(V2 - V1, 2)} × ${dec(Ca, 2)} = ${dec(mW, 3)} mmol`, `${ask ? '[CH₃COOH]' : '[HCl]'} = ${dec(nn, 3)} mmol / ${Va} mL = ${dec(nn / Va, 4)} M`], explain: `${dec(nn / Va, 4)} M.` });
    }
  };

  for (const g of [alfa, mezcla]) { const make = g.make; g.make = (rng, level, want) => ({ ...make(rng, level, want), source: 'skoog' }); } // no están en las PPT: vienen del libro

  const generators = [fuerte, zonas, indicador, debil, kaCurvas, pkaCurva, tampon, poli, baseDebil, diprotico, anfolito, alfa, mezcla, phBase, kaBase];

  /* Laboratorio "¿qué pasa con el pH?": un matraz y lo que le agregas. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('acido', '50 mL CH₃COOH 0,1 M', 'pH 2,88'), S('tampon', 'Tampón acético/acetato (1:4)', 'pH 4,15'), S('mitad', 'Media titulación', 'pH = pKa = 4,76'), S('eq', 'Equivalencia: solo acetato', 'pH 8,73'), S('exceso', 'Exceso de NaOH', 'pH > 11'),
    S('hcl', '50 mL HCl 0,1 M', 'pH 1,00'), S('neutro', 'Equivalencia HCl/NaOH', 'pH 7,00')
  ];
  const reagents = [['b10', 'Agregar 10 mL NaOH 0,1 M'], ['b15', 'Agregar 15 mL NaOH 0,1 M'], ['b25', 'Agregar 25 mL NaOH 0,1 M'], ['b50', 'Agregar 50 mL NaOH 0,1 M'], ['fenol', 'Agregar fenolftaleína']].map(([id, label]) => ({ id, label }));
  const RX = {
    'acido>b10': ['tampon', 'Se formó acetato: pH = 4,757 + log(1/4) = 4,15. Ya es un tampón.'],
    'acido>b25': ['mitad', 'Mitad exacta: [HA] = [A⁻] y pH = pKa = 4,76.'],
    'acido>b50': ['eq', 'Todo es acetato: hidroliza y el pH queda en 8,73, no en 7.'],
    'tampon>b15': ['mitad', '10 + 15 = 25 mL: la mitad. pH = pKa.'],
    'mitad>b25': ['eq', '50 mL en total: equivalencia, pH 8,73.'],
    'eq>b10': ['exceso', 'Ahora manda el OH⁻ sobrante: 1 mmol en 110 mL → pH 11,96.'],
    'hcl>b50': ['neutro', 'Fuerte con fuerte: queda NaCl y agua, pH 7.'],
    'eq>fenol': ['eq', 'Rosado pálido: la fenolftaleína vira en 8,2–10, justo en la equivalencia.'],
    'exceso>fenol': ['exceso', 'Rosado intenso: hay exceso de base.']
  };
  const WHY_NOT = { fenol: 'Incolora: la fenolftaleína no vira bajo pH 8,2.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (WHY_NOT[rid]) return { to: null, ok: false, why: WHY_NOT[rid] };
    return { to: null, ok: false, why: 'Prueba otro volumen: piensa cuántos mL faltan para la mitad (25 mL) o la equivalencia (50 mL).' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['acido', 'hcl'] };

  const creatures = {
    'base.ph': ['Escriba', '#a07a4a'], 'base.ka': ['Búho', '#5d6f9e'],
    'ana.fuerte': ['Trasgo', '#7f9a3c'], 'ana.indicador': ['Grifo', '#c98a1b'], 'ana.debil': ['Serpiente', '#5f9e5a'], 'ana.tampon': ['Escarabajo', '#4f8f9e'], 'ana.poli': ['Hidra', '#c0574a'],
    'ana.basedebil': ['Salamandra', '#b5683a'], 'ana.diprotico': ['Dragón bicéfalo', '#8a5cb0'], 'ana.anfolito': ['Quimera', '#9e8a3c'], 'ana.alfa': ['Fénix', '#d0883a'], 'ana.mezcla': ['Cangrejo ermitaño', '#5a7aa8']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['ana-03'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
