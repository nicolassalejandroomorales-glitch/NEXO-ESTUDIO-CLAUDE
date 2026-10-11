/* Ejercicios infinitos de Equilibrio químico (FQ II, PEP 1). Cada generador arma una pregunta nueva desde una semilla y un nivel:
   1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP. Los resultados se CALCULAN (nunca se escriben a mano).
   Datos: tabla de Kp/Kc de la clase 2 (Pino) y valores de la Guía 1. */
(() => {
  'use strict';
  const SRC = 'catedra-fq';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const R = 8.314;
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const take = (rng, list, n) => shuffle(rng, list).slice(0, n);
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 2) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−'); // sin ceros de más: 310 K, 298,15 K
  const sci = x => { if (x === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(x))); const m = x / 10 ** e; return Math.abs(e) <= 2 ? dec(x, Math.abs(x) < 1 ? 3 : 2) : `${Number(m).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × 10^${e}`.replace('^-', '^−'); };
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  // Respuesta numérica: las trampas que coinciden con la respuesta (dentro de la tolerancia) se descartan.
  function number(prompt, answer, unit, extra) {
    const tol = extra.tol ?? 0.02, traps = (extra.traps || []).filter(t => Number.isFinite(t.value) && Math.abs(t.value - answer) > Math.abs(answer) * tol * 1.5);
    return { type: 'number', prompt, answer, unit, tol, ...extra, traps };
  }

  /* ════════ Grado de avance ════════ */
  const RXN = [
    { eq: '2A → B', nu: { A: -2, B: 1 } }, { eq: 'A + 2B → C', nu: { A: -1, B: -2, C: 1 } }, { eq: 'N₂ + 3H₂ → 2NH₃', nu: { 'N₂': -1, 'H₂': -3, 'NH₃': 2 } },
    { eq: '2SO₂ + O₂ → 2SO₃', nu: { 'SO₂': -2, 'O₂': -1, 'SO₃': 2 } }, { eq: 'CH₄ + 2O₂ → CO₂ + 2H₂O', nu: { 'CH₄': -1, 'O₂': -2, 'CO₂': 1, 'H₂O': 2 } }
  ];
  const avance = {
    id: 'avance', title: 'Grado de avance', mission: 'm1', concepts: ['eq.avance'],
    make(rng, level) {
      const r = level <= 2 ? pick(rng, RXN.slice(0, 2)) : pick(rng, RXN), species = Object.keys(r.nu);
      const sp = level === 1 ? species.find(k => r.nu[k] > 0) : pick(rng, species);
      const n0 = r.nu[sp] < 0 ? between(rng, 1.5, 5, 0.05) : level >= 4 ? between(rng, 0.1, 1, 0.05) : 0;
      const xi = between(rng, 0.05, Math.min(0.6, r.nu[sp] < 0 ? n0 / Math.abs(r.nu[sp]) * 0.8 : 0.6), 0.01);
      const ans = n0 + r.nu[sp] * xi;
      if (level === 5) { // al revés: desde cuánto queda, despejar ξ
        const p = `Estilo PEP: en ${r.eq} se parte con ${dec(n0)} mol de ${sp}. Si quedan ${dec(ans, 3)} mol de ${sp}, ¿cuánto vale ξ?`;
        return number(p, xi, 'mol', { concept: 'eq.avance', slide: 10, label: 'ξ', hint: `Despeja de n = n₀ + ν ξ, con ν(${sp}) = ${r.nu[sp]}.`,
          traps: [{ value: Math.abs(n0 - ans), note: 'Falta dividir por el coeficiente.', misconception: 'avance-coef' }], solution: [`ξ = (n − n₀)/ν = (${dec(ans, 3)} − ${dec(n0)}) / (${r.nu[sp]})`, `ξ = ${dec(xi, 3)} mol`], explain: `ξ = ${dec(xi, 3)} mol.` });
      }
      const p = `En ${r.eq}, con ${dec(n0)} mol iniciales de ${sp}, ¿cuántos moles de ${sp} hay cuando ξ = ${dec(xi)} mol?`;
      return number(p, ans, 'mol', { concept: 'eq.avance', slide: 10, label: `n(${sp})`, tol: 0.01, hint: `n = n₀ + ν ξ, con ν(${sp}) = ${r.nu[sp] > 0 ? '+' : ''}${r.nu[sp]}.`,
        traps: [{ value: n0 + Math.sign(r.nu[sp]) * xi, note: 'Olvidaste multiplicar ξ por el coeficiente.', misconception: 'avance-coef' }, { value: n0 - r.nu[sp] * xi, note: 'Signo cambiado: los reactivos se gastan, los productos se forman.' }],
        solution: [`n = ${dec(n0)} + (${r.nu[sp]})(${dec(xi)})`, `n = ${dec(ans, 3)} mol`], explain: `n(${sp}) = ${dec(ans, 3)} mol.` });
    }
  };

  /* ════════ ΔrG: pendiente y dirección ════════ */
  const drg = {
    id: 'drg', title: 'ΔrG y dirección', mission: 'm1', concepts: ['eq.drg'],
    make(rng, level) {
      if (level <= 2) {
        const sign = pick(rng, [-1, 1, 0]), v = sign === 0 ? '0' : `${sign < 0 ? '−' : '+'}${dec(between(rng, 2, 60, 0.5), 1)} kJ/mol`;
        const right = sign < 0 ? 'La reacción directa es espontánea' : sign > 0 ? 'La reacción inversa es espontánea' : 'La mezcla está en equilibrio';
        return choice(rng, `En cierto punto de la reacción, ΔrG = ${v}. ¿Qué significa?`, right, ['La reacción directa es espontánea', 'La reacción inversa es espontánea', 'La mezcla está en equilibrio'].filter(x => x !== right).map(text => ({ text, note: 'Mira el signo de la pendiente: negativo avanza, positivo retrocede, cero es equilibrio.' })),
          { concept: 'eq.drg', slide: 2, hint: 'ΔrG es la pendiente de G frente a ξ.', explain: `${right}: ΔrG = (∂G/∂ξ).` });
      }
      if (level === 5) { const muB = -between(rng, 50, 300, 1), muA0 = -between(rng, 50, 300, 1), muA = muA0 === 2 * muB ? muA0 - 3 : muA0, g = 2 * muB - muA;
        return number(`Estilo PEP: en A ⇌ 2B, en cierto momento μ(A) = ${dec(muA)} kJ/mol y μ(B) = ${dec(muB)} kJ/mol. Calcula ΔrG = Σνᵢμᵢ.`, g, 'kJ/mol', { concept: 'eq.drg', slide: 2, label: 'ΔrG', hint: 'ΔrG = 2μ(B) − μ(A).',
          traps: [{ value: muB - muA, note: 'Falta el coeficiente 2 de B.' }, { value: muA - 2 * muB, note: 'Es productos menos reactivos.' }],
          solution: [`ΔrG = 2(${dec(muB)}) − (${dec(muA)})`, `= ${dec(g)} kJ/mol → ${g < 0 ? 'avanza hacia B' : g > 0 ? 'retrocede hacia A' : 'equilibrio'}`], explain: `ΔrG = ${dec(g)} kJ/mol.` }); }
      const dxi = between(rng, 0.01, 0.08, 0.001), dg = -between(rng, 0.3, 4, 0.01), ans = dg / dxi;
      const p = `${level === 5 ? 'Estilo PEP: ' : ''}Cuando una reacción avanza Δξ = ${dec(dxi, 3)} mol, la energía de Gibbs del sistema cambia ${dec(dg)} kJ. Estima ΔrG.`;
      return number(p, ans, 'kJ/mol', { concept: 'eq.drg', slide: 2, label: 'ΔrG', hint: 'ΔrG ≈ ΔG/Δξ.', traps: [{ value: dg * dxi, note: 'Multiplicaste: es ΔG dividido por Δξ.' }, { value: -ans, note: 'G bajó: ΔrG es negativo.' }],
        solution: [`ΔrG ≈ ${dec(dg)} / ${dec(dxi, 3)}`, `= ${dec(ans, 1)} kJ/mol`], explain: `ΔrG ≈ ${dec(ans, 1)} kJ/mol.` });
    }
  };

  /* ════════ Q contra K ════════ */
  const qk = {
    id: 'qk', title: 'Q contra K', mission: 'm2', concepts: ['eq.q-k'],
    make(rng, level) {
      const K = 10 ** between(rng, -4, 4, 1) * between(rng, 1, 9, 1);
      if (level <= 2) {
        const Q = K * pick(rng, [0.01, 0.1, 10, 100, 1]);
        const right = Q < K ? 'Avanza hacia productos' : Q > K ? 'Retrocede hacia reactivos' : 'Está en equilibrio';
        return choice(rng, `Una reacción tiene K = ${sci(K)}. En la mezcla actual Q = ${sci(Q)}. ¿Qué pasa?`, right, ['Avanza hacia productos', 'Retrocede hacia reactivos', 'Está en equilibrio'].filter(x => x !== right).map(text => ({ text, note: 'Compara Q con K: va hacia donde Q se acerca a K.', misconception: 'q-k-direction' })),
          { concept: 'eq.q-k', slide: 3, hint: '¿Q es mayor o menor que K?', explain: `Q ${Q < K ? '<' : Q > K ? '>' : '='} K → ${right.toLowerCase()}.` });
      }
      // A(g) ⇌ 2B(g) o A + B ⇌ C con presiones
      const T = pick(rng, [298.15, 310, 350, 400]), pA = between(rng, 0.1, 2, 0.05), pB = between(rng, 0.1, 2, 0.05);
      const Q = pB ** 2 / pA, Kv = Q * pick(rng, [0.05, 0.2, 5, 20]);
      if (level === 3) return number(`Para A(g) ⇌ 2B(g), p(A) = ${dec(pA)} bar y p(B) = ${dec(pB)} bar (p° = 1 bar). Calcula Q.`, Q, '', { concept: 'eq.q-k', slide: 3, label: 'Q', hint: 'Q = (p_B)² / p_A.',
        traps: [{ value: pB / pA, note: 'Falta elevar p(B) al cuadrado.' }, { value: pA / pB ** 2, note: 'Productos arriba, reactivos abajo.' }], solution: [`Q = ${dec(pB)}² / ${dec(pA)} = ${dec(Q, 3)}`], explain: `Q = ${dec(Q, 3)}.` });
      const g = R * T * Math.log(Q / Kv) / 1000;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}A(g) ⇌ 2B(g) tiene K = ${sci(Kv)} a ${dec(T, 2)} K. Si p(A) = ${dec(pA)} bar y p(B) = ${dec(pB)} bar, calcula ΔrG.`, g, 'kJ/mol',
        { concept: 'eq.q-k', slide: 3, label: 'ΔrG', tol: 0.03, hint: 'ΔrG = RT ln(Q/K).', traps: [{ value: -g, note: 'Signo cambiado: es ln(Q/K), no ln(K/Q).', misconception: 'q-k-direction' }, { value: g * 1000, note: 'Bien, pero en J/mol.', misconception: 'kj-j' }],
          solution: [`Q = ${dec(pB)}² / ${dec(pA)} = ${dec(Q, 3)}`, `ΔrG = 8,314 × ${dec(T, 2)} × ln(${dec(Q, 3)} / ${sci(Kv)})`, `ΔrG = ${dec(g, 2)} kJ/mol → ${g < 0 ? 'avanza hacia productos' : 'va hacia reactivos'}`], explain: `ΔrG = ${dec(g, 2)} kJ/mol.` });
    }
  };

  /* ════════ ΔrG° y K ════════ */
  const kdg = {
    id: 'kdg', title: 'ΔrG° y K', mission: 'm2', concepts: ['eq.k-dg'],
    make(rng, level) {
      const T = level <= 2 ? 298.15 : pick(rng, [298.15, 310, 350, 400, 500]);
      if (level === 1) {
        const g = pick(rng, [-1, 1]) * between(rng, 2, 40, 1), right = g < 0 ? 'Mayor que 1' : 'Menor que 1';
        return choice(rng, `Una reacción tiene ΔrG° = ${g > 0 ? '+' : '−'}${Math.abs(g)} kJ/mol a 298 K. Su K es…`, right, [{ text: g < 0 ? 'Menor que 1' : 'Mayor que 1', note: 'ΔrG° = −RT ln K: el signo se invierte.', misconception: 'k-sign' }, { text: 'Exactamente 0', note: 'K nunca es cero.' }],
          { concept: 'eq.k-dg', slide: 5, hint: 'ln K = −ΔrG°/RT.', explain: `ΔrG° ${g < 0 ? '< 0 → K > 1' : '> 0 → K < 1'}.` });
      }
      if (level === 2 || level === 4) {
        const g = pick(rng, [-1, 1]) * between(rng, 1, 15, 0.5), k = Math.exp(-g * 1000 / (R * T));
        return number(`Calcula K a ${dec(T, 2)} K para ΔrG° = ${g > 0 ? '+' : '−'}${dec(Math.abs(g), 1)} kJ/mol.`, k, '', { concept: 'eq.k-dg', slide: 5, label: 'K', tol: 0.03, hint: 'K = e^(−ΔrG°/RT), con ΔrG° en J/mol.',
          traps: [{ value: 1 / k, note: 'Signo cambiado.', misconception: 'k-sign' }, { value: Math.exp(-g / (R * T)), note: 'Usaste kJ en vez de J.', misconception: 'kj-j' }, { value: Math.exp(-g * 1000 / (R * (T - 273.15 || 25))), note: 'Usaste °C.', misconception: 'celsius' }],
          solution: [`ln K = −(${dec(g * 1000, 0)}) / (8,314 × ${dec(T, 2)}) = ${dec(-g * 1000 / (R * T), 3)}`, `K = ${sci(k)}`], explain: `K = ${sci(k)}.` });
      }
      if (level === 3) {
        const k = 10 ** between(rng, -6, 6, 1) * between(rng, 1, 9, 1), g = -R * T * Math.log(k) / 1000;
        return number(`Una reacción tiene K = ${sci(k)} a ${dec(T, 2)} K. Calcula ΔrG°.`, g, 'kJ/mol', { concept: 'eq.k-dg', slide: 5, label: 'ΔrG°', hint: 'ΔrG° = −RT ln K.',
          traps: [{ value: -g, note: 'Signo cambiado.', misconception: 'k-sign' }, { value: g * 1000, note: 'Está en J/mol.', misconception: 'kj-j' }], solution: [`ΔrG° = −8,314 × ${dec(T, 2)} × ln(${sci(k)})`, `= ${dec(g, 2)} kJ/mol`], explain: `ΔrG° = ${dec(g, 2)} kJ/mol.` });
      }
      // Nivel PEP: desde ΔfG° de tablas
      const set = pick(rng, [
        { eq: 'N₂O₄(g) ⇌ 2NO₂(g)', prod: [[2, 'NO₂(g)', 51.31]], reac: [[1, 'N₂O₄(g)', 97.89]] },
        { eq: '2SO₂(g) + O₂(g) ⇌ 2SO₃(g)', prod: [[2, 'SO₃(g)', -371.06]], reac: [[2, 'SO₂(g)', -300.19], [1, 'O₂(g)', 0]] },
        { eq: 'CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)', prod: [[1, 'CO₂(g)', -394.36], [1, 'H₂(g)', 0]], reac: [[1, 'CO(g)', -137.17], [1, 'H₂O(g)', -228.57]] },
        { eq: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)', prod: [[2, 'NH₃(g)', -16.45]], reac: [[1, 'N₂(g)', 0], [3, 'H₂(g)', 0]] }]);
      const sum = l => l.reduce((a, [n, , v]) => a + n * v, 0), g = sum(set.prod) - sum(set.reac);
      const data = [...set.prod, ...set.reac].filter(([, , v]) => v !== 0).map(([, s, v]) => `${s}: ${dec(v)}`).join(' · ');
      return number(`Estilo PEP: para ${set.eq}, con ΔfG° (kJ/mol) ${data} (elementos = 0), calcula ΔrG° a 298 K.`, g, 'kJ/mol',
        { concept: 'eq.k-dg', slide: 9, label: 'ΔrG°', hint: 'Productos menos reactivos, cada uno por su coeficiente.', traps: [{ value: -g, note: 'Es productos menos reactivos.' }, { value: set.prod.reduce((a, [, , v]) => a + v, 0) - set.reac.reduce((a, [, , v]) => a + v, 0), note: 'Olvidaste los coeficientes.' }],
          solution: [`ΔrG° = Σν ΔfG°(prod) − Σν ΔfG°(react)`, `= ${dec(sum(set.prod))} − (${dec(sum(set.reac))}) = ${dec(g)} kJ/mol`, `K = ${sci(Math.exp(-g * 1000 / (R * 298.15)))}`], explain: `ΔrG° = ${dec(g)} kJ/mol.` });
    }
  };

  /* ════════ Kp y Kc ════════ */
  const TABLE = [ // clase 2 (Pino): Kc en mol/L; Δn
    { eq: 'CO(g) + 2H₂(g) ⇌ CH₃OH(g)', T: 483, dn: -2 }, { eq: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)', T: 723, dn: -2 }, { eq: '2NO(g) + O₂(g) ⇌ 2NO₂(g)', T: 457, dn: -1 },
    { eq: '2NO₂(g) ⇌ N₂O₄(g)', T: 298, dn: -1 }, { eq: '2SO₂(g) + O₂(g) ⇌ 2SO₃(g)', T: 700, dn: -1 }, { eq: 'CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)', T: 1000, dn: 0 },
    { eq: 'CH₄(g) + H₂O(g) ⇌ CO(g) + 3H₂(g)', T: 1000, dn: 2 }, { eq: '2NOBr(g) ⇌ 2NO(g) + Br₂(g)', T: 298, dn: 1 }, { eq: 'PCl₅(g) ⇌ PCl₃(g) + Cl₂(g)', T: 500, dn: 1 }
  ];
  const kpkc = {
    id: 'kpkc', title: 'Kp y Kc', mission: 'm3', concepts: ['eq.kp-kc'],
    make(rng, level) {
      const r = pick(rng, level <= 2 ? TABLE : TABLE.filter(x => x.dn !== 0));
      if (level <= 2) return choice(rng, `¿Cuánto vale Δn para ${r.eq}?`, `${r.dn > 0 ? '+' : r.dn < 0 ? '−' : ''}${Math.abs(r.dn)}`, [-2, -1, 0, 1, 2].filter(x => x !== r.dn).map(x => ({ text: `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x)}`, note: 'Moles de gas de productos menos moles de gas de reactivos.', misconception: 'dn-count' })),
        { concept: 'eq.kp-kc', slide: 4, hint: 'Cuenta coeficientes de gases a cada lado.', explain: `Δn = ${r.dn}.` });
      const kc = 10 ** between(rng, -3, 4, 1) * between(rng, 1, 9, 1), rr = level >= 4 ? 0.08206 : 0.08314, u = level >= 4 ? 'atm' : 'bar', kp = kc * (rr * r.T) ** r.dn;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Para ${r.eq} a ${r.T} K, Kc = ${sci(kc)} (c en mol/L). Calcula Kp (p en ${u}, R = ${dec(rr, 5)} L·${u}/(mol·K)).`, kp, '',
        { concept: 'eq.kp-kc', slide: 4, label: 'Kp', tol: 0.02, hint: `Δn = ${r.dn}: Kp = Kc (RT)^Δn.`, traps: [{ value: kc * (rr * r.T) ** -r.dn, note: 'Signo de Δn cambiado.', misconception: 'dn-count' }, { value: kc, note: 'Solo es igual si Δn = 0.' }, { value: kc * (8.314 * r.T) ** r.dn, note: 'R en J/(mol·K) no sirve aquí: usa L·bar o L·atm.' }],
          solution: [`Δn = ${r.dn}`, `Kp = ${sci(kc)} × (${dec(rr, 5)} × ${r.T})^${r.dn}`, `Kp = ${sci(kp)}`], explain: `Kp = ${sci(kp)}.` });
    }
  };

  /* ════════ Heterogéneos ════════ */
  const HET = [
    { eq: 'CaCO₃(s) ⇌ CaO(s) + CO₂(g)', k: 'p(CO₂)/p°', wrong: ['[CaO]·p(CO₂)/[CaCO₃]', '1/p(CO₂)'] },
    { eq: 'NH₄Cl(s) ⇌ NH₃(g) + HCl(g)', k: 'p(NH₃)·p(HCl)/p°²', wrong: ['p(NH₃)·p(HCl)/[NH₄Cl]', 'p(NH₃) + p(HCl)'] },
    { eq: 'C(s) + CO₂(g) ⇌ 2CO(g)', k: 'p(CO)²/(p(CO₂)·p°)', wrong: ['p(CO)²/(p(CO₂)·[C])', 'p(CO)/p(CO₂)'] },
    { eq: 'H₂O(l) ⇌ H₂O(g)', k: 'p(H₂O)/p°', wrong: ['p(H₂O)/[H₂O(l)]', '1'] },
    { eq: 'C(s) + H₂O(g) ⇌ CO(g) + H₂(g)', k: 'p(CO)·p(H₂)/(p(H₂O)·p°)', wrong: ['p(CO)·p(H₂)/(p(H₂O)·[C])', 'p(CO)·p(H₂)'] },
    { eq: 'Fe₂O₃(s) + 3CO(g) ⇌ 2Fe(s) + 3CO₂(g)', k: 'p(CO₂)³/p(CO)³', wrong: ['[Fe]²p(CO₂)³/([Fe₂O₃]p(CO)³)', 'p(CO₂)/p(CO)'] }
  ];
  const hetero = {
    id: 'hetero', title: 'Equilibrios heterogéneos', mission: 'm3', concepts: ['eq.hetero'],
    make(rng, level) {
      if (level <= 3) { const r = pick(rng, level === 1 ? HET.slice(0, 2) : HET);
        return choice(rng, `¿Cuál es la expresión correcta de K para ${r.eq}?`, r.k, [{ text: r.wrong[0], note: 'Los sólidos y líquidos puros tienen actividad 1: no se escriben.', misconception: 'solids-in-k' }, { text: r.wrong[1], note: 'Revisa: productos arriba, cada uno con su exponente.' }],
          { concept: 'eq.hetero', slide: 8, hint: '¿Quién es sólido o líquido puro?', explain: `K = ${r.k}: solo gases (y solutos).` }); }
      // NH4Cl: presión total → K
      const P = between(rng, 0.5, 12, 0.01), k = (P / 2) ** 2;
      return number(`${level === 5 ? 'Estilo PEP (Guía 1, ej. 5): ' : ''}NH₄Cl(s) se disocia en NH₃(g) y HCl(g). A cierta T la presión total de gas es ${dec(P)} bar. Calcula K (p° = 1 bar).`, k, '',
        { concept: 'eq.hetero', slide: 9, label: 'K', hint: 'Se forman NH₃ y HCl en igual cantidad: cada uno es P/2.', traps: [{ value: P ** 2, note: 'Cada gas aporta la mitad de P.' }, { value: P / 2, note: 'K es el producto de las dos presiones.' }],
          solution: [`p(NH₃) = p(HCl) = ${dec(P)} / 2 = ${dec(P / 2, 3)} bar`, `K = ${dec(P / 2, 3)}² = ${dec(k, 3)}`], explain: `K = ${dec(k, 3)}.` });
    }
  };

  /* ════════ Le Châtelier ════════ */
  const LC = [
    { eq: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)', dn: -2, dh: -1, R: 'H₂', P: 'NH₃' }, { eq: '2SO₂(g) + O₂(g) ⇌ 2SO₃(g)', dn: -1, dh: -1, R: 'O₂', P: 'SO₃' }, { eq: 'N₂O₄(g) ⇌ 2NO₂(g)', dn: 1, dh: 1, R: 'N₂O₄', P: 'NO₂' },
    { eq: 'H₂(g) + I₂(g) ⇌ 2HI(g)', dn: 0, dh: -1, R: 'I₂', P: 'HI' }, { eq: 'CaCO₃(s) ⇌ CaO(s) + CO₂(g)', dn: 1, dh: 1, R: null, P: 'CO₂', solid: 'CaCO₃' }, { eq: 'PCl₅(g) ⇌ PCl₃(g) + Cl₂(g)', dn: 1, dh: 1, R: 'PCl₅', P: 'Cl₂' },
    { eq: 'CO(g) + 2H₂(g) ⇌ CH₃OH(g)', dn: -2, dh: -1, R: 'CO', P: 'CH₃OH' }, { eq: 'C(s) + H₂O(g) ⇌ CO(g) + H₂(g)', dn: 1, dh: 1, R: 'H₂O', P: 'H₂', solid: 'C' }
  ];
  const lechatelier = {
    id: 'lechatelier', title: 'Le Châtelier', mission: 'm4', concepts: ['eq.lechatelier'],
    make(rng, level) {
      const r = pick(rng, LC), H = r.dh < 0 ? 'exotérmica' : 'endotérmica', side = d => d < 0 ? 'right' : d > 0 ? 'left' : 'none';
      const actions = [
        { t: 'aumentas la presión total comprimiendo el recipiente', ans: side(r.dn), why: r.dn === 0 ? 'Δn = 0: la presión no cambia la composición.' : `Se favorece el lado con menos moles de gas (Δn = ${r.dn}).`, k: 'igual' },
        { t: 'duplicas el volumen del recipiente', ans: side(-r.dn), why: r.dn === 0 ? 'Δn = 0: el volumen no cambia la composición.' : `Al bajar la presión se favorece el lado con más moles de gas (Δn = ${r.dn}).`, k: 'igual' },
        { t: 'agregas argón a volumen constante', ans: 'none', why: 'No cambian las presiones parciales: Q no cambia.', mc: 'inert-shift', k: 'igual' },
        { t: 'agregas argón a presión constante (el volumen crece)', ans: side(-r.dn), why: r.dn === 0 ? 'Δn = 0: diluir no cambia Q.' : 'Al crecer el volumen bajan las presiones parciales: es como expandir.', mc: 'inert-shift', k: 'igual' },
        { t: 'agregas un catalizador', ans: 'none', why: 'El catalizador no cambia K ni la composición.', mc: 'catalyst-shift', k: 'igual' },
        { t: 'calientas', ans: r.dh > 0 ? 'right' : 'left', why: `Es ${H}: calentar ${r.dh > 0 ? 'sube' : 'baja'} K.`, mc: 'vh-sign', k: r.dh > 0 ? 'sube' : 'baja' },
        { t: 'enfrías', ans: r.dh > 0 ? 'left' : 'right', why: `Es ${H}: enfriar ${r.dh > 0 ? 'baja' : 'sube'} K.`, mc: 'vh-sign', k: r.dh > 0 ? 'baja' : 'sube' },
        { t: `retiras ${r.P} a medida que se forma`, ans: 'right', why: `Al sacar ${r.P}, Q < K: la reacción avanza para reponerlo.`, mc: 'q-k-direction', k: 'igual' },
        ...(r.R ? [{ t: `agregas más ${r.R} a volumen constante`, ans: 'right', why: `Más ${r.R} baja Q (Q < K): avanza hacia productos.`, mc: 'q-k-direction', k: 'igual' }] : []),
        ...(r.solid ? [{ t: `agregas más ${r.solid} sólido`, ans: 'none', why: 'Un sólido puro tiene actividad 1: no aparece en Q.', k: 'igual' }] : [])
      ];
      const a = level <= 2 ? pick(rng, actions.filter(x => !x.t.includes('presión constante'))) : pick(rng, actions);
      const lbl = { right: 'Se forma más producto', left: 'Se forma más reactivo', none: 'No se desplaza' };
      if (level >= 4) { // dos cosas a la vez: hacia dónde va y qué le pasa a K
        const kTxt = { igual: 'K no cambia', sube: 'K aumenta', baja: 'K disminuye' }, right = `${lbl[a.ans]} y ${kTxt[a.k]}`;
        const wrong = [];
        for (const d of Object.keys(lbl)) for (const k of Object.keys(kTxt)) if (`${lbl[d]} y ${kTxt[k]}` !== right) wrong.push({ text: `${lbl[d]} y ${kTxt[k]}`, note: a.why, misconception: k !== a.k ? (a.k === 'igual' ? 'catalyst-shift' : 'vh-sign') : a.mc });
        return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Para ${r.eq} (${H}), en equilibrio, ${a.t}. ¿Qué pasa con la composición y con K?`, right, take(rng, wrong, 3),
          { concept: 'eq.lechatelier', slide: 3, hint: 'Solo la temperatura cambia K; lo demás cambia Q.', explain: `${right}: ${a.why}` }); }
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Para ${r.eq} (${H}), en equilibrio, ${a.t}. ¿Qué pasa?`, lbl[a.ans], Object.entries(lbl).filter(([k]) => k !== a.ans).map(([, text]) => ({ text, note: a.why, misconception: a.mc })),
        { concept: 'eq.lechatelier', slide: 3, hint: 'Solo la temperatura cambia K; la presión mueve hacia menos moles de gas.', explain: `${lbl[a.ans]}: ${a.why}` });
    }
  };

  /* ════════ Van't Hoff ════════ */
  const vanthoff = {
    id: 'vanthoff', title: 'Van\'t Hoff', mission: 'm4', concepts: ['eq.vanthoff'],
    make(rng, level) {
      if (level === 1) { const dh = pick(rng, [-1, 1]), up = pick(rng, [true, false]), right = (dh > 0) === up ? 'K aumenta' : 'K disminuye';
        return choice(rng, `Una reacción ${dh > 0 ? 'endotérmica' : 'exotérmica'}: si ${up ? 'subes' : 'bajas'} la temperatura…`, right, [{ text: right === 'K aumenta' ? 'K disminuye' : 'K aumenta', note: 'Calentar favorece el lado que absorbe calor.', misconception: 'vh-sign' }, { text: 'K no cambia', note: 'K depende de T.' }],
          { concept: 'eq.vanthoff', slide: 5, hint: '¿El calor es "reactivo" o "producto"?', explain: `${right}.` }); }
      const dh = pick(rng, [-1, 1]) * between(rng, 20, 120, 1), T1 = pick(rng, [298.15, 300, 350, 400]), dT = between(rng, 10, 80, 5) * (level >= 3 && rng() < 0.3 ? -1 : 1), T2 = T1 + dT;
      const K1 = 10 ** between(rng, -3, 3, 1) * between(rng, 1, 9, 1), K2 = K1 * Math.exp(-(dh * 1000 / R) * (1 / T2 - 1 / T1));
      if (level === 5) { // desde dos K, obtener ΔH°
        return number(`Estilo PEP: una reacción tiene K = ${sci(K1)} a ${dec(T1, 2)} K y K = ${sci(K2)} a ${dec(T2, 2)} K. Estima ΔrH° (constante).`, dh, 'kJ/mol',
          { concept: 'eq.vanthoff', slide: 5, label: 'ΔrH°', tol: 0.03, hint: 'ΔrH° = −R ln(K₂/K₁) / (1/T₂ − 1/T₁).', traps: [{ value: -dh, note: 'Signo cambiado.', misconception: 'vh-sign' }, { value: dh * 1000, note: 'Está en J/mol.', misconception: 'kj-j' }],
            solution: [`ln(K₂/K₁) = ${dec(Math.log(K2 / K1), 3)}`, `1/T₂ − 1/T₁ = ${(1 / T2 - 1 / T1).toExponential(3).replace('.', ',')}`, `ΔrH° = −8,314 × ${dec(Math.log(K2 / K1), 3)} / (${(1 / T2 - 1 / T1).toExponential(3).replace('.', ',')}) = ${dec(dh, 1)} kJ/mol`], explain: `ΔrH° ≈ ${dec(dh, 1)} kJ/mol.` });
      }
      const useC = level === 4;
      const t1s = useC ? `${dec(T1 - 273.15, 2)} °C` : `${dec(T1, 2)} K`, t2s = useC ? `${dec(T2 - 273.15, 2)} °C` : `${dec(T2, 2)} K`;
      return number(`Una reacción tiene K = ${sci(K1)} a ${t1s} y ΔrH° = ${dh > 0 ? '+' : '−'}${Math.abs(dh)} kJ/mol (constante). Calcula K a ${t2s}.`, K2, '',
        { concept: 'eq.vanthoff', slide: 5, label: 'K₂', tol: 0.03, hint: 'ln(K₂/K₁) = −(ΔrH°/R)(1/T₂ − 1/T₁), T en kelvin.',
          traps: [{ value: K1 * Math.exp((dh * 1000 / R) * (1 / T2 - 1 / T1)), note: 'Signo cambiado.', misconception: 'vh-sign' }, ...(useC ? [{ value: K1 * Math.exp(-(dh * 1000 / R) * (1 / (T2 - 273.15) - 1 / (T1 - 273.15))), note: 'Usaste °C.', misconception: 'celsius' }] : [])],
          solution: [`T en kelvin: ${dec(T1, 2)} K y ${dec(T2, 2)} K`, `ln(K₂/K₁) = −(${dh * 1000}/8,314)(1/${dec(T2, 2)} − 1/${dec(T1, 2)}) = ${dec(Math.log(K2 / K1), 3)}`, `K₂ = ${sci(K2)}`], explain: `K₂ = ${sci(K2)}.` });
    }
  };

  /* ════════ Actividad ════════ */
  const actividad = {
    id: 'actividad', title: 'Fugacidad y actividad', mission: 'm4', concepts: ['eq.actividad'],
    make(rng, level) {
      if (level === 1) return choice(rng, pick(rng, ['¿Cuándo K ≈ Kp para una reacción entre gases?', '¿Cuándo se puede ignorar γ?']), 'A presiones bajas (γ ≈ 1)', [{ text: 'A presiones muy altas', note: 'Ahí los gases se alejan de lo ideal.', misconception: 'gamma-ignored' }, { text: 'Nunca', note: 'A baja presión es una buena aproximación.' }],
        { concept: 'eq.actividad', slide: 6, hint: 'Gas casi ideal.', explain: 'A baja presión γ ≈ 1 y K ≈ Kp.' });
      const kp = 10 ** between(rng, -3, 2, 1) * between(rng, 1, 9, 1), gA = between(rng, 0.7, 1.3, 0.01), gB = between(rng, 0.7, 1.3, 0.01);
      const twoB = level >= 3, kg = (twoB ? gB ** 2 : gB) / gA, k = kg * kp;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Para A(g) ⇌ ${twoB ? '2' : ''}B(g) a alta presión, Kp = ${sci(kp)}, γ(A) = ${dec(gA)} y γ(B) = ${dec(gB)}. Calcula la constante termodinámica K.`, k, '',
        { concept: 'eq.actividad', slide: 6, label: 'K', tol: 0.02, hint: `Kγ = γ(B)${twoB ? '²' : ''} / γ(A); K = Kγ · Kp.`, traps: [{ value: kp, note: 'Ese es Kp: falta Kγ.', misconception: 'gamma-ignored' }, { value: kp / kg, note: 'Invertiste Kγ.' }, ...(twoB ? [{ value: gB / gA * kp, note: 'γ(B) va elevado a su coeficiente 2.' }] : [])],
          solution: [`Kγ = ${dec(gB)}${twoB ? '²' : ''} / ${dec(gA)} = ${dec(kg, 4)}`, `K = ${dec(kg, 4)} × ${sci(kp)} = ${sci(k)}`], explain: `K = ${sci(k)}.` });
    }
  };

  /* ════════ Bases ════════ */
  const termo = {
    id: 'termo', title: 'ΔG = ΔH − TΔS', mission: null, concepts: ['base.termo'],
    make(rng, level) {
      const dh = pick(rng, [-1, 1]) * between(rng, 5, 80, 1), ds = pick(rng, [-1, 1]) * between(rng, 10, 200, 5), T = level <= 2 ? 298.15 : between(rng, 250, 1000, 10), g = dh - T * ds / 1000;
      if (level <= 2) { const right = g < 0 ? 'Espontáneo' : 'No espontáneo';
        return choice(rng, `A ${dec(T, 2)} K, un proceso tiene ΔH = ${dh > 0 ? '+' : '−'}${Math.abs(dh)} kJ/mol y ΔS = ${ds > 0 ? '+' : '−'}${Math.abs(ds)} J/(mol·K). Es…`, right, [{ text: right === 'Espontáneo' ? 'No espontáneo' : 'Espontáneo', note: `ΔG = ${dec(g, 1)} kJ/mol.`, misconception: 'kj-j' }, { text: 'Está en equilibrio', note: 'Solo si ΔG = 0.' }],
          { concept: 'base.termo', slide: 5, hint: 'ΔG = ΔH − TΔS, con ΔS en kJ.', explain: `ΔG = ${dec(g, 1)} kJ/mol.` }); }
      if (level === 5) { const h = between(rng, 20, 150, 1) * (rng() < 0.5 ? 1 : -1), sv = Math.sign(h) * between(rng, 40, 250, 5), Tc = h * 1000 / sv;
        return number(`Estilo PEP: un proceso tiene ΔH = ${h > 0 ? '+' : '−'}${Math.abs(h)} kJ/mol y ΔS = ${sv > 0 ? '+' : '−'}${Math.abs(sv)} J/(mol·K). ¿Sobre o bajo qué temperatura cambia de espontáneo a no espontáneo?`, Tc, 'K',
          { concept: 'base.termo', slide: 5, label: 'T', tol: 0.02, hint: 'En el cambio, ΔG = 0 → T = ΔH/ΔS (mismas unidades).', traps: [{ value: h / sv, note: 'Mezclaste kJ con J: pasa ΔH a J/mol.', misconception: 'kj-j' }],
            solution: ['ΔG = 0 → T = ΔH/ΔS', `T = ${h * 1000} / ${sv} = ${dec(Tc, 1)} K`, h > 0 ? 'Espontáneo sobre esa T (ΔH > 0, ΔS > 0)' : 'Espontáneo bajo esa T (ΔH < 0, ΔS < 0)'], explain: `T = ${dec(Tc, 1)} K.` }); }
      return number(`Calcula ΔG a ${dec(T, 0)} K para ΔH = ${dh > 0 ? '+' : '−'}${Math.abs(dh)} kJ/mol y ΔS = ${ds > 0 ? '+' : '−'}${Math.abs(ds)} J/(mol·K).`, g, 'kJ/mol',
        { concept: 'base.termo', slide: 5, label: 'ΔG', tol: 0.02, hint: 'Pasa ΔS a kJ/(mol·K).', traps: [{ value: dh - T * ds, note: 'Mezclaste kJ con J.', misconception: 'kj-j' }, { value: dh + T * ds / 1000, note: 'Es ΔH menos TΔS.' }],
          solution: [`ΔG = ${dh} − ${dec(T, 0)} × (${dec(ds / 1000, 3)})`, `= ${dec(g, 2)} kJ/mol`], explain: `ΔG = ${dec(g, 2)} kJ/mol.` });
    }
  };
  const gases = {
    id: 'gases', title: 'Presión parcial', mission: null, concepts: ['base.gases'],
    make(rng, level) {
      const nA = between(rng, 0.5, 4, 0.5), nB = between(rng, 0.5, 4, 0.5), P = between(rng, 1, 20, 0.5);
      if (level <= 2) return number(`Una mezcla tiene ${dec(nA, 1)} mol de A y ${dec(nB, 1)} mol de B. ¿Cuál es la fracción molar de A?`, nA / (nA + nB), '', { concept: 'base.gases', slide: 3, label: 'x(A)', tol: 0.01, hint: 'x = n_A / n_total.',
        traps: [{ value: nA / nB, note: 'Divide por el total, no por B.' }], solution: [`x(A) = ${dec(nA, 1)} / ${dec(nA + nB, 1)} = ${dec(nA / (nA + nB), 3)}`], explain: `x(A) = ${dec(nA / (nA + nB), 3)}.` });
      if (level === 4) { const n = between(rng, 0.2, 3, 0.05), T = between(rng, 300, 800, 5), V = between(rng, 2, 20, 0.5), pp = n * 0.08314 * T / V, g = pick(rng, ['NH₃', 'NO₂', 'SO₃', 'HI', 'Cl₂']);
        return number(`En un recipiente de ${dec(V, 1)} L a ${T} K hay ${dec(n, 2)} mol de ${g} (gas ideal). ¿Cuál es su presión parcial en bar? (R = 0,08314 L·bar/(mol·K))`, pp, 'bar', { concept: 'base.gases', slide: 3, label: `p(${g})`, tol: 0.01, hint: 'p = nRT/V.',
          traps: [{ value: n * 8.314 * T / V, note: 'Usaste R = 8,314 (unidades de J): con L y bar es 0,08314.' }, { value: n * 0.08314 * (T - 273.15) / V, note: 'La T va en kelvin.' }], solution: [`p = ${dec(n, 2)} × 0,08314 × ${T} / ${dec(V, 1)} = ${dec(pp, 3)} bar`], explain: `${dec(pp, 3)} bar.` }); }
      if (level === 3) { const pA = between(rng, 0.2, 6, 0.05), pB = between(rng, 0.2, 6, 0.05), tot = pA + pB;
        return number(`Una mezcla de N₂ y H₂ tiene p(N₂) = ${dec(pA, 2)} bar y p(H₂) = ${dec(pB, 2)} bar. ¿Fracción molar del H₂?`, pB / tot, '', { concept: 'base.gases', slide: 3, label: 'x(H₂)', tol: 0.01, hint: 'x = p/P_total (Dalton).',
          traps: [{ value: pA / tot, note: 'Esa es la del N₂.' }, { value: pB / pA, note: 'Divide por la presión total.' }], solution: [`P = ${dec(pA, 2)} + ${dec(pB, 2)} = ${dec(tot, 2)} bar`, `x(H₂) = ${dec(pB, 2)}/${dec(tot, 2)} = ${dec(pB / tot, 3)}`], explain: `${dec(pB / tot, 3)}.` }); }
      const p = nA / (nA + nB) * P;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}${dec(nA, 1)} mol de A y ${dec(nB, 1)} mol de B a P = ${dec(P, 1)} bar. Calcula p(A).`, p, 'bar', { concept: 'base.gases', slide: 3, label: 'p(A)', tol: 0.01, hint: 'p(A) = x(A) · P.',
        traps: [{ value: nA * P, note: 'Usa la fracción molar, no los moles.' }, { value: nB / (nA + nB) * P, note: 'Esa es la de B.' }], solution: [`x(A) = ${dec(nA / (nA + nB), 3)}`, `p(A) = ${dec(nA / (nA + nB), 3)} × ${dec(P, 1)} = ${dec(p, 3)} bar`], explain: `p(A) = ${dec(p, 3)} bar.` });
    }
  };
  const logs = {
    id: 'logs', title: 'Kelvin, J y ln', mission: null, concepts: ['base.logs'],
    make(rng, level) {
      if (level <= 2) { const c = between(rng, -20, 150, 1);
        return number(`Convierte ${c} °C a kelvin.`, c + 273.15, 'K', { concept: 'base.logs', slide: 5, label: 'T', tol: 0.0005, hint: 'Suma 273,15.', traps: [{ value: c - 273.15, note: 'Se suma, no se resta.' }], solution: [`${c} + 273,15 = ${dec(c + 273.15, 2)} K`], explain: `${dec(c + 273.15, 2)} K.` }); }
      const x = between(rng, -5, 5, 0.1) || 0.5;
      return number(`Si ln K = ${dec(x, 1)}, ¿cuánto vale K?`, Math.exp(x), '', { concept: 'base.logs', slide: 5, label: 'K', tol: 0.02, hint: 'K = e^(ln K).',
        traps: [{ value: 10 ** x, note: 'Es ln (base e), no log (base 10).' }], solution: [`K = e^${dec(x, 1)} = ${sci(Math.exp(x))}`], explain: `K = ${sci(Math.exp(x))}.` });
    }
  };

  const generators = [avance, drg, qk, kdg, kpkc, hetero, lechatelier, vanthoff, actividad, termo, gases, logs];

  /* Laboratorio "¿qué pasa si…?": una mezcla en equilibrio y perturbaciones (la "sustancia" es el estado del sistema). */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('haber', 'N₂ + 3H₂ ⇌ 2NH₃ en equilibrio (exotérmica)', 'Δn = −2 · ΔH° < 0'), S('haber-mas', 'Más NH₃ que antes', 'nuevo equilibrio desplazado a la derecha'), S('haber-menos', 'Menos NH₃ que antes', 'nuevo equilibrio desplazado a la izquierda'),
    S('cal', 'CaCO₃(s) ⇌ CaO(s) + CO₂(g) en equilibrio (endotérmica)', 'K = p(CO₂)/p°'), S('cal-mas', 'Más CO₂ en el horno', 'p(CO₂) mayor'), S('cal-menos', 'Menos CO₂ en el horno', 'p(CO₂) menor')
  ];
  const reagents = [['comprimir', 'Comprimir (subir P total)'], ['calentar', 'Calentar'], ['enfriar', 'Enfriar'], ['catalizador', 'Agregar catalizador'], ['argon', 'Agregar Ar a volumen constante'], ['solido', 'Agregar más sólido'], ['quitar', 'Retirar el producto gaseoso']].map(([id, label]) => ({ id, label }));
  const RX = {
    'haber>comprimir': ['haber-mas', 'Δn = −2: al comprimir, Q baja (Kx = Kp·P²) y se forma más NH₃. K no cambió.'],
    'haber>enfriar': ['haber-mas', 'Exotérmica: enfriar sube K (van\'t Hoff). Ojo: a baja T es lentísima.'],
    'haber>calentar': ['haber-menos', 'Exotérmica: calentar baja K. Por eso la industria compensa con presión alta.'],
    'haber>quitar': ['haber-mas', 'Retirar NH₃ deja Q < K: la reacción avanza para reponerlo (así se hace en la industria, condensándolo).'],
    'cal>calentar': ['cal-mas', 'Endotérmica: calentar sube K = p(CO₂)/p°.'], 'cal>enfriar': ['cal-menos', 'Endotérmica: enfriar baja K.'],
    'cal>comprimir': ['cal-menos', 'Δn = +1: al comprimir se favorece el lado con menos gas (los sólidos): p(CO₂) vuelve a su valor de equilibrio y se consume CO₂.'],
    'cal>quitar': ['cal-mas', 'Retirar CO₂ deja Q < K: se descompone más CaCO₃ (así trabajan los hornos de cal).']
  };
  const WHY_NOT = { catalizador: 'El catalizador acelera la ida y la vuelta por igual: llegas antes, pero al mismo equilibrio.', argon: 'A volumen constante, el argón no cambia las presiones parciales: Q no cambia.',
    solido: 'Un sólido puro tiene actividad 1: agregar más no cambia Q.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (['haber-mas', 'haber-menos', 'cal-mas', 'cal-menos'].includes(fromId)) return { to: null, ok: false, why: 'Vuelve al equilibrio de partida ("Otra sustancia") para probar otra perturbación.' };
    if (rid === 'solido' && fromId === 'haber') return { to: null, ok: false, why: 'En la síntesis de NH₃ no hay sólidos que agregar (el catalizador de Fe no entra en K).' };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'Esta perturbación no mueve este equilibrio.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['haber', 'cal'] };

  const creatures = {
    'base.termo': ['Gólem', '#8a6fd1'], 'base.gases': ['Niebla', '#7fa3a0'], 'base.logs': ['Escriba', '#a07a4a'],
    'eq.avance': ['Trasgo', '#7f9a3c'], 'eq.drg': ['Espectro', '#7aa4b5'], 'eq.q-k': ['Serpiente', '#5f9e5a'], 'eq.k-dg': ['Gólem', '#8a6fd1'],
    'eq.kp-kc': ['Duende', '#6d8bd6'], 'eq.hetero': ['Niebla', '#7fa3a0'], 'eq.lechatelier': ['Grifo', '#c98a1b'], 'eq.vanthoff': ['Hidra', '#c0574a'], 'eq.actividad': ['Búho', '#5d6f9e']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['fq-01'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
