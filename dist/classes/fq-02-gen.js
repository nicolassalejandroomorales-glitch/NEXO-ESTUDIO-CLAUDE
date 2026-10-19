/* Ejercicios infinitos de Actividad y fuerza iónica · PEP 1 (Fisicoquímica II).
   Cada generador arma una pregunta nueva desde una semilla y un nivel: 1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP.
   Todas las respuestas se CALCULAN (nunca se escriben a mano) con A = 0,509 (mol/kg)^(−1/2), agua a 25 °C.
   Fuente: clase 5 «Equilibrio químico y electrolitos» (Dr. Eduardo Pino, 2S 2026). */
(() => {
  'use strict';
  const SRC = 'catedra-fq-electrolitos';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const A = 0.509;
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (rng, list, n) => shuffle(rng, list).slice(0, n);
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 3) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−');
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const sci = (x, d = 2) => { let e = Math.floor(Math.log10(Math.abs(x))), m = Number((x / 10 ** e).toFixed(d)); if (m >= 10) { m /= 10; e += 1; } return `${m.toFixed(d).replace('.', ',')} × 10${String(e).split('').map(c => SUP[c]).join('')}`; };
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  function number(prompt, answer, unit, extra) {
    const tol = extra.tol ?? 0.02, traps = (extra.traps || []).filter(t => Number.isFinite(t.value) && Math.abs(t.value - answer) > Math.abs(answer) * tol * 3);
    return { type: 'number', prompt, answer, unit, tol, ...extra, traps };
  }
  const order = (prompt, cards, answer, extra) => ({ type: 'order', prompt, cards, answer, ...extra });

  /* Sales: ν₊, carga del catión, ν₋, carga del anión (en valor absoluto). */
  const SALTS = [
    { f: 'NaCl', vp: 1, zp: 1, vm: 1, zm: 1, ip: 'Na⁺', im: 'Cl⁻' }, { f: 'KCl', vp: 1, zp: 1, vm: 1, zm: 1, ip: 'K⁺', im: 'Cl⁻' }, { f: 'KNO₃', vp: 1, zp: 1, vm: 1, zm: 1, ip: 'K⁺', im: 'NO₃⁻' },
    { f: 'CaCl₂', vp: 1, zp: 2, vm: 2, zm: 1, ip: 'Ca²⁺', im: 'Cl⁻' }, { f: 'MgCl₂', vp: 1, zp: 2, vm: 2, zm: 1, ip: 'Mg²⁺', im: 'Cl⁻' }, { f: 'BaCl₂', vp: 1, zp: 2, vm: 2, zm: 1, ip: 'Ba²⁺', im: 'Cl⁻' },
    { f: 'Na₂SO₄', vp: 2, zp: 1, vm: 1, zm: 2, ip: 'Na⁺', im: 'SO₄²⁻' }, { f: 'K₂SO₄', vp: 2, zp: 1, vm: 1, zm: 2, ip: 'K⁺', im: 'SO₄²⁻' },
    { f: 'MgSO₄', vp: 1, zp: 2, vm: 1, zm: 2, ip: 'Mg²⁺', im: 'SO₄²⁻' }, { f: 'ZnSO₄', vp: 1, zp: 2, vm: 1, zm: 2, ip: 'Zn²⁺', im: 'SO₄²⁻' },
    { f: 'AlCl₃', vp: 1, zp: 3, vm: 3, zm: 1, ip: 'Al³⁺', im: 'Cl⁻' }, { f: 'Al₂(SO₄)₃', vp: 2, zp: 3, vm: 3, zm: 2, ip: 'Al³⁺', im: 'SO₄²⁻' }, { f: 'Na₃PO₄', vp: 3, zp: 1, vm: 1, zm: 3, ip: 'Na⁺', im: 'PO₄³⁻' }
  ];
  const SIMPLE = SALTS.filter(s => s.zp * s.zm <= 2);   // 1:1, 2:1 y 1:2
  const nu = s => s.vp + s.vm;
  const Iof = (s, m) => 0.5 * (s.vp * m * s.zp ** 2 + s.vm * m * s.zm ** 2);
  const gpm = (s, I) => 10 ** (-A * s.zp * s.zm * Math.sqrt(I));
  const mpm = (s, m) => ((s.vp * m) ** s.vp * (s.vm * m) ** s.vm) ** (1 / nu(s));
  const eqIon = s => `${s.vp}(+${s.zp}) + ${s.vm}(−${s.zm}) = 0`;

  /* ════════ 1. Iones por fórmula y neutralidad (ion.electrolitos) ════════ */
  const iones = {
    id: 'iones', title: 'Iones por fórmula', mission: 'm1', concepts: ['ion.electrolitos'],
    make(rng, level) {
      const s = pick(rng, level <= 2 ? SIMPLE : SALTS), m = between(rng, 0.02, 0.5, 0.01), base = { concept: 'ion.electrolitos', slide: 13, hint: 'Escribe la disociación: ν₊ cationes y ν₋ aniones por fórmula.' };
      if (level === 1) return choice(rng, `¿Cuántos iones en total (ν) da cada fórmula de ${s.f} al disolverse?`, String(nu(s)), [String(nu(s) + 1), String(nu(s) - 1 || 1), String(Math.max(s.vp, s.vm)), String(nu(s) + 2)].map(t => ({ text: t, note: `ν = ν₊ + ν₋ = ${s.vp} + ${s.vm}.` })), { ...base, explain: `${s.f} → ${s.vp} ${s.ip} + ${s.vm} ${s.im}: ν = ${nu(s)}.` });
      if (level === 2) return number(`${s.f} ${dec(m, 2)} m. ¿Cuánto vale la molalidad del ${s.ip}?`, s.vp * m, 'mol/kg', { ...base, label: 'm₊', tol: 0.005, misconception: 'ion-nu', traps: [{ value: m, note: 'Esa es la molalidad de la sal: multiplica por ν₊.', misconception: 'ion-nu' }, { value: s.vm * m, note: 'Esa es la del anión.' }],
        solution: [`${s.f} → ${s.vp} ${s.ip} + ${s.vm} ${s.im}`, `m(${s.ip}) = ${s.vp} × ${dec(m, 2)} = ${dec(s.vp * m, 3)} mol/kg`], explain: `m(${s.ip}) = ${dec(s.vp * m, 3)} mol/kg.` });
      if (level === 3) return number(`${s.f} ${dec(m, 2)} m. ¿Cuánto vale la molalidad del ${s.im}?`, s.vm * m, 'mol/kg', { ...base, label: 'm₋', tol: 0.005, traps: [{ value: m, note: 'Esa es la molalidad de la sal: multiplica por ν₋.', misconception: 'ion-nu' }, { value: s.vp * m, note: 'Esa es la del catión.' }],
        solution: [`${s.f} → ${s.vp} ${s.ip} + ${s.vm} ${s.im}`, `m(${s.im}) = ${s.vm} × ${dec(m, 2)} = ${dec(s.vm * m, 3)} mol/kg`], explain: `m(${s.im}) = ${dec(s.vm * m, 3)} mol/kg.` });
      if (level === 4) { const good = eqIon(s);
        return choice(rng, `¿Qué ecuación expresa la electroneutralidad de ${s.f}?`, good, [`${s.vp}(+${s.zp}) + ${s.vm}(−${s.zm}) = ${s.vp * s.zp - s.vm * s.zm || 1}`, `${s.zp}(+${s.vp}) + ${s.zm}(−${s.vm}) = 0`, `${s.vp + s.vm} = 0`].map(t => ({ text: t, note: 'ν₊z₊ + ν₋z₋ = 0: los coeficientes multiplican a las cargas.' })), { ...base, explain: `${s.f}: ${good}.` }); }
      return number(`Estilo PEP: se disuelve ${s.f} ${dec(m, 2)} m. ¿Cuál es la molalidad total de iones en solución?`, nu(s) * m, 'mol/kg', { ...base, label: 'm total', tol: 0.005, traps: [{ value: m, note: 'Esa es la molalidad de la sal, no de los iones.', misconception: 'ion-nu' }],
        solution: [`${s.f} → ${s.vp} ${s.ip} + ${s.vm} ${s.im}: ν = ${nu(s)}`, `m total = ${nu(s)} × ${dec(m, 2)} = ${dec(nu(s) * m, 3)} mol/kg`], explain: `${dec(nu(s) * m, 3)} mol/kg de iones.` });
    }
  };

  /* ════════ 2. Actividad iónica media (ion.actividad) ════════ */
  const actividad = {
    id: 'actividad', title: 'm± y a±', mission: 'm1', concepts: ['ion.actividad'],
    make(rng, level) {
      const s = pick(rng, level <= 2 ? SIMPLE : SALTS), m = between(rng, 0.005, 0.2, 0.005), g = between(rng, 0.6, 0.98, 0.01), mm = mpm(s, m), base = { concept: 'ion.actividad', slide: 45, hint: 'm± = (m₊^ν₊ · m₋^ν₋)^(1/ν) y a± = γ±·m±.' };
      if (level === 1) return number(`Una sal tiene γ± = ${dec(g, 2)} y m± = ${dec(m, 3)} mol/kg. Calcula a±.`, g * m, '', { ...base, label: 'a±', tol: 0.01, traps: [{ value: m / g, note: 'Dividiste: a± = γ±·m±.', misconception: 'act-conc' }, { value: m, note: 'Esa es m±: falta multiplicar por γ±.', misconception: 'act-conc' }],
        solution: [`a± = γ±·m± = ${dec(g, 2)} × ${dec(m, 3)} = ${dec(g * m, 4)}`], explain: `a± = ${dec(g * m, 4)}.` });
      if (level === 2) { const t = SALTS.filter(x => x.vp === x.vm), z = pick(rng, t);
        return number(`${z.f} ${dec(m, 3)} m (ν₊ = ν₋ = 1). ¿Cuánto vale m±?`, m, 'mol/kg', { ...base, label: 'm±', tol: 0.005, traps: [{ value: 2 * m, note: 'No sumes: m± es una media geométrica.' }, { value: m * m, note: 'Falta la raíz ν-ésima: m± = (m₊·m₋)^(1/2) = m.' }], solution: [`m₊ = m₋ = ${dec(m, 3)}`, `m± = (${dec(m, 3)} · ${dec(m, 3)})^(1/2) = ${dec(m, 3)} mol/kg`], explain: 'Con ν₊ = ν₋, m± = m.' }); }
      if (level === 3) return number(`${s.f} ${dec(m, 3)} m. Calcula m± (ν₊ = ${s.vp}, ν₋ = ${s.vm}).`, mm, 'mol/kg', { ...base, label: 'm±', tol: 0.01, traps: [{ value: m, note: 'Esa es la molalidad de la sal.', misconception: 'ion-nu' }, { value: (s.vp * m + s.vm * m) / 2, note: 'Hiciste el promedio aritmético; m± es media geométrica.' }],
        solution: [`m₊ = ${dec(s.vp * m, 4)}; m₋ = ${dec(s.vm * m, 4)}`, `m± = (m₊^${s.vp} · m₋^${s.vm})^(1/${nu(s)}) = ${dec(mm, 5)} mol/kg`], explain: `m± = ${dec(mm, 5)} mol/kg.` });
      if (level === 4) return number(`${s.f} ${dec(m, 3)} m con γ± = ${dec(g, 2)}. Calcula la actividad iónica media a±.`, g * mm, '', { ...base, label: 'a±', tol: 0.015, traps: [{ value: g * m, note: 'Usaste la molalidad de la sal en vez de m±.', misconception: 'ion-nu' }, { value: mm, note: 'Esa es m±: falta multiplicar por γ±.' }],
        solution: [`m± = ${dec(mm, 5)} mol/kg`, `a± = ${dec(g, 2)} × ${dec(mm, 5)} = ${dec(g * mm, 5)}`], explain: `a± = ${dec(g * mm, 5)}.` });
      const m5 = between(rng, 0.002, 0.01, 0.001), s5 = pick(rng, SIMPLE), I5 = Iof(s5, m5), g5 = gpm(s5, I5), a5 = g5 * mpm(s5, m5);
      return number(`Estilo PEP: ${s5.f} ${dec(m5, 3)} m. Con la ley límite (A = 0,509), calcula a±.`, a5, '', { ...base, concept: 'ion.actividad', slide: 61, label: 'a±', tol: 0.02, hint: 'Paso 1: I. Paso 2: γ± = 10^(−0,509|z₊z₋|√I). Paso 3: a± = γ±·m±.', traps: [{ value: mpm(s5, m5), note: 'Esa es m±: falta γ±.' }, { value: m5 * g5, note: 'Usaste m de la sal en vez de m±.', misconception: 'ion-nu' }],
        solution: [`I = ${dec(I5, 5)} mol/kg`, `γ± = 10^(−0,509 · ${s5.zp * s5.zm} · √${dec(I5, 5)}) = ${dec(g5, 4)}`, `m± = ${dec(mpm(s5, m5), 5)}; a± = ${dec(a5, 5)}`], explain: `a± = ${dec(a5, 5)}.` });
    }
  };

  /* ════════ 3. Fuerza iónica (ion.fuerza) ════════ */
  const fuerza = {
    id: 'fuerza', title: 'Fuerza iónica', mission: 'm1', concepts: ['ion.fuerza'],
    make(rng, level) {
      const base = { concept: 'ion.fuerza', slide: 21, hint: 'I = ½ Σ mᵢzᵢ²: cuenta cada ion y eleva su carga al cuadrado.' };
      if (level === 1) { const s = pick(rng, SALTS.filter(x => x.vp === x.vm && x.zp === 1)), m = between(rng, 0.01, 0.5, 0.01);
        return number(`${s.f} ${dec(m, 2)} m. Calcula la fuerza iónica I.`, m, 'mol/kg', { ...base, label: 'I', tol: 0.005, traps: [{ value: 2 * m, note: 'Falta el ½.' }, { value: m / 2, note: 'Contaste solo un ion: están el catión y el anión.' }], solution: [`I = ½(${dec(m, 2)}·1² + ${dec(m, 2)}·1²) = ${dec(m, 2)} mol/kg`], explain: 'En una sal 1:1, I = m.' }); }
      if (level === 2) { const m = between(rng, 0.01, 0.2, 0.01), s = pick(rng, SIMPLE.filter(x => x.zp * x.zm > 1)), r = Iof(s, m) / m;
        return choice(rng, `${s.f} y NaCl, ambos ${dec(m, 2)} m. ¿Cuántas veces mayor es I de ${s.f} que la del NaCl?`, `${dec(r, 1)} veces`, [`${dec(s.zp * s.zm, 1)} veces`, `${dec(nu(s), 1)} veces`, '1 vez', `${dec(r * 2, 1)} veces`].map(t => ({ text: t, note: 'Calcula las dos I: la carga va al cuadrado y cuenta cada ion.', misconception: 'ion-z2' })), { ...base, explain: `I(${s.f}) = ${dec(Iof(s, m), 4)} frente a I(NaCl) = ${dec(m, 2)}: ${dec(r, 1)} veces.` }); }
      if (level === 3) { const s = pick(rng, SALTS), m = between(rng, 0.005, 0.2, 0.005), I = Iof(s, m);
        return number(`${s.f} ${dec(m, 3)} m. Calcula I.`, I, 'mol/kg', { ...base, label: 'I', tol: 0.01, traps: [{ value: m, note: 'Esa es la molalidad de la sal.', misconception: 'ion-nu' }, { value: 0.5 * (s.vp * m * s.zp + s.vm * m * s.zm), note: 'No elevaste la carga al cuadrado.', misconception: 'ion-z2' }, { value: 2 * I, note: 'Falta el ½.' }],
          solution: [`m₊ = ${dec(s.vp * m, 4)}; m₋ = ${dec(s.vm * m, 4)}`, `I = ½(${dec(s.vp * m, 4)}·${s.zp}² + ${dec(s.vm * m, 4)}·${s.zm}²) = ${dec(I, 5)} mol/kg`], explain: `I = ${dec(I, 5)} mol/kg.` }); }
      if (level === 4) { const s1 = pick(rng, SIMPLE), s2 = pick(rng, SIMPLE.filter(x => x.f !== s1.f)), m1 = between(rng, 0.01, 0.1, 0.01), m2 = between(rng, 0.01, 0.1, 0.01), I = Iof(s1, m1) + Iof(s2, m2);
        return number(`Una solución tiene ${s1.f} ${dec(m1, 2)} m y ${s2.f} ${dec(m2, 2)} m. Calcula la fuerza iónica total.`, I, 'mol/kg', { ...base, label: 'I', tol: 0.01, traps: [{ value: Iof(s1, m1), note: 'Falta el aporte de la otra sal.' }, { value: 0.5 * (m1 + m2), note: 'Usaste molalidades de sal sin contar los iones y sus cargas.', misconception: 'ion-nu' }],
          solution: [`I(${s1.f}) = ${dec(Iof(s1, m1), 4)}`, `I(${s2.f}) = ${dec(Iof(s2, m2), 4)}`, `I total = ${dec(I, 4)} mol/kg`], explain: `I = ${dec(I, 4)} mol/kg.` }); }
      const kcl = between(rng, 0.02, 0.2, 0.01), hcl = between(rng, 0.01, 0.1, 0.01), I = 0.5 * (kcl + hcl + (kcl + hcl));
      return number(`Estilo PEP: se disuelven ${dec(kcl, 2)} mol de KCl y ${dec(hcl, 2)} mol de HCl en 1,0 kg de agua. Calcula I.`, I, 'mol/kg', { ...base, slide: 22, label: 'I', tol: 0.01, hint: 'Cl⁻ = KCl + HCl; los tres iones son de carga 1.', traps: [{ value: I / 10, note: 'Te equivocaste de factor 10.' }, { value: kcl + hcl, note: 'Falta el ½: hay que sumar los cuatro términos y dividir por 2.' }],
        solution: [`K⁺ = ${dec(kcl, 2)}; H⁺ = ${dec(hcl, 2)}; Cl⁻ = ${dec(kcl + hcl, 2)}`, `I = ½(${dec(kcl, 2)} + ${dec(hcl, 2)} + ${dec(kcl + hcl, 2)}) = ${dec(I, 3)} mol/kg`], explain: `I = ${dec(I, 3)} mol/kg.` });
    }
  };

  /* ════════ 4. Ley límite de Debye–Hückel (ion.debye) ════════ */
  const debye = {
    id: 'debye', title: 'γ± con Debye–Hückel', mission: 'm2', concepts: ['ion.debye'],
    make(rng, level) {
      const base = { concept: 'ion.debye', slide: 52, hint: 'log γ± = −0,509·|z₊z₋|·√I y γ± = 10^(log γ±).' };
      if (level === 1) { const zz = pick(rng, [1, 2, 3, 4, 6]), I = between(rng, 0.001, 0.01, 0.001), lg = -A * zz * Math.sqrt(I);
        return number(`Una sal con |z₊z₋| = ${zz} está a I = ${dec(I, 3)} mol/kg. Calcula log γ± (A = 0,509).`, lg, '', { ...base, label: 'log γ±', tol: 0.01, traps: [{ value: -lg, note: 'log γ± es negativo.', misconception: 'log-dir' }, { value: 10 ** lg, note: 'Ese es γ±: pedían el logaritmo.' }], solution: [`log γ± = −0,509 · ${zz} · √${dec(I, 3)} = ${dec(lg, 4)}`], explain: `log γ± = ${dec(lg, 4)}.` }); }
      if (level === 2) { const lg = -between(rng, 0.02, 0.3, 0.005);
        return number(`Si log γ± = ${dec(lg, 3)}, ¿cuánto vale γ±?`, 10 ** lg, '', { ...base, label: 'γ±', tol: 0.01, traps: [{ value: lg, note: 'Ese es el logaritmo: falta elevar 10 a ese valor.', misconception: 'log-dir' }, { value: Math.abs(lg), note: 'Ignoraste el signo: γ± = 10^(negativo) < 1.', misconception: 'gam-gt1' }], solution: [`γ± = 10^(${dec(lg, 3)}) = ${dec(10 ** lg, 4)}`], explain: `γ± = ${dec(10 ** lg, 4)}.` }); }
      if (level === 3) { const s = pick(rng, SALTS.filter(x => x.zp * x.zm <= 4)), I = between(rng, 0.001, 0.01, 0.001), g = 10 ** (-A * s.zp * s.zm * Math.sqrt(I));
        return number(`${s.f} a I = ${dec(I, 3)} mol/kg. Calcula γ± con la ley límite.`, g, '', { ...base, label: 'γ±', tol: 0.01, traps: [{ value: 10 ** (-A * Math.sqrt(I)), note: `Usaste |z₊z₋| = 1: aquí es ${s.zp * s.zm}.`, misconception: 'log-dir' }, { value: -A * s.zp * s.zm * Math.sqrt(I), note: 'Ese es log γ±: falta el 10^x.', misconception: 'log-dir' }],
          solution: [`|z₊z₋| = ${s.zp * s.zm}`, `log γ± = −0,509 · ${s.zp * s.zm} · √${dec(I, 3)} = ${dec(-A * s.zp * s.zm * Math.sqrt(I), 4)}`, `γ± = ${dec(g, 4)}`], explain: `γ± = ${dec(g, 4)}.` }); }
      if (level === 4) { const s = pick(rng, SIMPLE.filter(x => x.zp !== x.zm)), m = between(rng, 0.001, 0.005, 0.0005), I = Iof(s, m), z = Math.max(s.zp, s.zm), gi = 10 ** (-A * z * z * Math.sqrt(I));
        return number(`${s.f} ${dec(m, 4)} m. Con la ley límite, calcula el coeficiente de actividad individual del ion ${s.zp >= s.zm ? s.ip : s.im} (log γᵢ = −0,509·zᵢ²·√I).`, gi, '', { ...base, label: 'γᵢ', tol: 0.015, hint: 'Primero I; luego log γᵢ = −0,509·zᵢ²·√I.', traps: [{ value: 10 ** (-A * z * Math.sqrt(I)), note: 'Olvidaste elevar la carga al cuadrado.', misconception: 'ion-z2' }, { value: gpm(s, I), note: 'Ese es γ± de la sal, no el del ion individual.' }],
          solution: [`I = ${dec(I, 5)} mol/kg`, `log γᵢ = −0,509 · ${z}² · √${dec(I, 5)} = ${dec(-A * z * z * Math.sqrt(I), 4)}`, `γᵢ = ${dec(gi, 4)}`], explain: `γᵢ = ${dec(gi, 4)}.` }); }
      const s = pick(rng, SALTS.filter(x => x.zp * x.zm <= 4)), m = between(rng, 0.001, 0.006, 0.0005), I = Iof(s, m), g = gpm(s, I);
      return number(`Estilo PEP: ${s.f} ${dec(m, 4)} m. Calcula I y luego γ± con la ley límite (A = 0,509).`, g, '', { ...base, slide: 61, label: 'γ±', tol: 0.01, hint: 'I = ½ Σ mᵢzᵢ² → log γ± → γ±.', traps: [{ value: 10 ** (-A * s.zp * s.zm * Math.sqrt(m)), note: 'Usaste m de la sal en vez de I.', misconception: 'ion-nu' }, { value: 10 ** (-A * Math.sqrt(I)), note: `Usaste |z₊z₋| = 1: aquí vale ${s.zp * s.zm}.`, misconception: 'log-dir' }],
        solution: [`I = ½(${dec(s.vp * m, 5)}·${s.zp}² + ${dec(s.vm * m, 5)}·${s.zm}²) = ${dec(I, 5)} mol/kg`, `log γ± = −0,509 · ${s.zp * s.zm} · √${dec(I, 5)} = ${dec(-A * s.zp * s.zm * Math.sqrt(I), 4)}`, `γ± = ${dec(g, 4)}`], explain: `γ± = ${dec(g, 4)}.` });
    }
  };

  /* ════════ 5. Solubilidad y efecto salino (ion.kps) ════════ */
  const KPS = [['AgCl', 1.6e-10, 1], ['AgBr', 5.4e-13, 1], ['BaSO₄', 1.1e-10, 4], ['CaC₂O₄', 3.0e-9, 4], ['PbSO₄', 1.6e-8, 4], ['CaSO₄', 2.4e-5, 4]];
  const solub = {
    id: 'solub', title: 'Solubilidad y fuerza iónica', mission: 'm2', concepts: ['ion.kps'],
    make(rng, level) {
      const [f, ks, zz] = pick(rng, level === 4 ? KPS.filter(k => k[1] >= 1e-10) : KPS), s0 = Math.sqrt(ks), base = { concept: 'ion.kps', slide: 84, hint: 'K°ps = γ±²·Kps; la solubilidad sube con I: log(s/s₀) = 0,509·|z₊z₋|·√I.' };
      if (level === 1) return choice(rng, `A una solución saturada de ${f} se le agrega KNO₃ (sin ion común). La solubilidad del ${f}…`, 'Aumenta (efecto salino primario)', [{ text: 'Disminuye (efecto de ion común)', note: 'El KNO₃ no aporta iones comunes con la sal.', misconception: 'ps-gamma' }, { text: 'No cambia (el KNO₃ no participa)', note: 'Sube I, baja γ± y sube s.', misconception: 'ps-gamma' }, { text: 'Aumenta, pero porque el nitrato forma un complejo', note: 'No hay complejación: el aumento es por la fuerza iónica.' }], { ...base, slide: 85, explain: 'Más I → menor γ± → mayor solubilidad (salting-in).' });
      if (level === 2) return number(`${f}: Kps = ${sci(ks)} (sal 1:1 en iones de igual número). Calcula la solubilidad ideal s₀ = √Kps.`, s0, 'M', { ...base, slide: 85, label: 's₀', tol: 0.015, traps: [{ value: ks, note: 'Ese es el Kps: falta la raíz cuadrada.' }, { value: ks / 2, note: 'No se divide por 2: s = √Kps.' }], solution: [`Kps = s² → s₀ = √(${sci(ks)}) = ${sci(s0)} M`], explain: `s₀ = ${sci(s0)} M.` });
      if (level === 3) { const I = between(rng, 0.005, 0.2, 0.005), zzv = zz, r = 10 ** (A * zzv * Math.sqrt(I));
        return number(`${f} (|z₊z₋| = ${zzv}) en una solución con I = ${dec(I, 3)} mol/kg. Calcula s/s₀ con log(s/s₀) = 0,509·|z₊z₋|·√I.`, r, '', { ...base, slide: 85, label: 's/s₀', tol: 0.01, traps: [{ value: 1 / r, note: 'La solubilidad sube con I: s/s₀ > 1.', misconception: 'ps-gamma' }, { value: A * zzv * Math.sqrt(I), note: 'Ese es log(s/s₀): falta el 10^x.', misconception: 'log-dir' }],
          solution: [`log(s/s₀) = 0,509 · ${zzv} · √${dec(I, 3)} = ${dec(A * zzv * Math.sqrt(I), 4)}`, `s/s₀ = ${dec(r, 4)}`], explain: `s/s₀ = ${dec(r, 4)}.` }); }
      if (level === 4) { const g = between(rng, 0.7, 0.97, 0.01);
        return number(`${f}: Kps (aparente) = ${sci(ks)} y γ± = ${dec(g, 2)}. ¿Cuánto vale la constante termodinámica K°ps?`, g * g * ks, '', { ...base, slide: 83, label: 'K°ps', tol: 0.02, traps: [{ value: ks / (g * g), note: 'Al revés: K°ps = γ±²·Kps.', misconception: 'ps-gamma' }, { value: g * ks, note: 'Falta elevar γ± al cuadrado.' }],
          solution: [`K°ps = γ±²·Kps = ${dec(g, 2)}² × ${sci(ks)} = ${sci(g * g * ks)}`], explain: `K°ps = ${sci(g * g * ks)}.` }); }
      const I1 = zz * s0, gam = 10 ** (-A * zz * Math.sqrt(I1)), sc = s0 / gam;
      return number(`Estilo PEP: ${f}, Kps = ${sci(ks)} (|z₊z₋| = ${zz}). Estima la solubilidad con la corrección de Debye–Hückel (1ª iteración: I con s₀ y s = s₀/γ±).`, sc, 'M', { ...base, slide: 95, label: 's', tol: 0.02, hint: `I = ½(s·${zz === 4 ? '2² + s·2²' : '1² + s·1²'}) = ${zz === 4 ? '4s' : 's'} con s = s₀.`, traps: [{ value: s0, note: 'Esa es la solubilidad ideal: falta corregir con γ±.', misconception: 'ps-gamma' }, { value: s0 * gam, note: 'Multiplicaste por γ± en vez de dividir: la solubilidad sube.', misconception: 'ps-gamma' }],
        solution: [`s₀ = √Kps = ${sci(s0)} M`, `I = ${dec(I1, 7)} mol/kg → γ± = 10^(−0,509·${zz}·√I) = ${dec(gam, 4)}`, `s = s₀/γ± = ${sci(sc)} M`], explain: `s ≈ ${sci(sc)} M.` });
    }
  };

  /* ════════ 6. Ácido débil: α, pH, I y K′a (ion.ka) ════════ */
  const ACIDOS = [['CH₃COOH', 1.8e-5], ['HCOOH', 1.8e-4], ['C₆H₅COOH', 6.3e-5], ['HF', 6.6e-4], ['CH₃CH₂COOH', 1.3e-5]];
  const acidez = {
    id: 'acidez', title: 'Ácido débil y actividades', mission: 'm2', concepts: ['ion.ka'],
    make(rng, level) {
      const [f, Ka] = pick(rng, ACIDOS), C0 = pick(rng, [0.01, 0.02, 0.05, 0.10, 0.20]), x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C0)) / 2, al = x / C0, I = x, g = 10 ** (-A * Math.sqrt(I)), base = { concept: 'ion.ka', slide: 102, hint: 'Ka = C₀α²/(1 − α) (o x²/(C₀ − x)); I = αC₀.' };
      const head = `${f} ${dec(C0, 2)} M, Ka = ${sci(Ka, 1)}`;
      if (level === 1) return number(`${head}. Calcula el grado de disociación α (resuelve la ecuación cuadrática).`, al, '', { ...base, label: 'α', tol: 0.02, traps: [{ value: x, note: 'Ese es [H⁺] en mol/L; α = [H⁺]/C₀.' }, { value: Ka / C0, note: 'Faltó la raíz: α ≈ √(Ka/C₀).' }], solution: [`Ka = x²/(${dec(C0, 2)} − x) → x = ${sci(x)} M`, `α = x/C₀ = ${dec(al, 4)}`], explain: `α = ${dec(al, 4)}.` });
      if (level === 2) return number(`${head}. Calcula el pH.`, -Math.log10(x), '', { ...base, label: 'pH', tol: 0.01, traps: [{ value: -Math.log10(C0), note: 'Supusiste disociación completa: es un ácido débil.' }, { value: x, note: 'Esa es [H⁺]: pH = −log[H⁺].', misconception: 'log-dir' }], solution: [`[H⁺] = ${sci(x)} M`, `pH = −log(${sci(x)}) = ${dec(-Math.log10(x), 2)}`], explain: `pH = ${dec(-Math.log10(x), 2)}.` });
      if (level === 3) return number(`${head}. Calcula la fuerza iónica I = αC₀ (mol/kg ≈ mol/L).`, I, 'mol/kg', { ...base, slide: 100, label: 'I', tol: 0.02, traps: [{ value: C0, note: 'Esa es la concentración total: solo los iones cuentan y son una fracción α.' }, { value: C0 * al * al, note: 'I = αC₀, sin elevar α al cuadrado.' }], solution: [`I = ½([H⁺] + [A⁻]) = αC₀ = ${sci(I)} mol/kg`], explain: `I = ${sci(I)} mol/kg.` });
      if (level === 4) return number(`${head}. Con I = αC₀, calcula γ± por la ley límite (|z₊z₋| = 1).`, g, '', { ...base, slide: 99, label: 'γ±', tol: 0.005, traps: [{ value: Math.log10(g), note: 'Ese es log γ±: falta el 10^x.', misconception: 'log-dir' }], solution: [`I = ${sci(I)}`, `log γ± = −0,509·√I = ${dec(Math.log10(g), 4)}`, `γ± = ${dec(g, 4)}`], explain: `γ± = ${dec(g, 4)}.` });
      const Kp = Ka / (g * g);
      return number(`Estilo PEP: ${head} (constante termodinámica). Calcula la constante en concentraciones K′a = K°a/γ±², con γ± de la ley límite a I = αC₀.`, Kp, '', { ...base, slide: 99, label: 'K′a', tol: 0.02, traps: [{ value: Ka * g * g, note: 'Al revés: K′a = K°a/γ±².', misconception: 'ps-gamma' }, { value: Ka, note: 'Esa es K°a: falta la corrección.' }], solution: [`x = ${sci(x)} M → I = ${sci(I)}`, `γ± = ${dec(g, 4)}`, `K′a = ${sci(Ka, 1)}/${dec(g, 4)}² = ${sci(Kp)}`], explain: `K′a = ${sci(Kp)}.` });
    }
  };

  /* ════════ 7. Conductividad, Kohlrausch y Ostwald (ion.conductividad) ════════ */
  const LAM = [['HCl', 426.2], ['NaCl', 126.5], ['CH₃COONa', 91.0], ['NH₄Cl', 149.7], ['NaOH', 247.8], ['KCl', 149.9]];
  const LI = [['H⁺', 349.8], ['OH⁻', 198.6], ['Cl⁻', 76.3], ['K⁺', 73.5], ['Na⁺', 50.1], ['Li⁺', 38.7]];
  const conduc = {
    id: 'conduc', title: 'Conductividad y Ostwald', mission: 'm3', concepts: ['ion.conductividad'],
    make(rng, level) {
      const base = { concept: 'ion.conductividad', slide: 35, hint: 'κ = Kcel/R; Λm = κ/c; α = Λm/Λ°m; Ka = cα²/(1 − α).' };
      const Kcel = pick(rng, [0.5, 0.85, 1.0, 1.2, 1.5]), R = between(rng, 150, 1500, 5), kappa = Kcel / R, c = pick(rng, [0.001, 0.005, 0.01, 0.05, 0.1]), Lm = kappa * 1000 / c;
      if (level === 1) return number(`Una celda con Kcel = ${dec(Kcel, 2)} cm⁻¹ mide R = ${R} Ω. Calcula la conductividad κ.`, kappa, 'S/cm', { ...base, slide: 32, label: 'κ', tol: 0.01, traps: [{ value: Kcel * R, note: 'Multiplicaste: κ = Kcel/R.' }, { value: 1 / R, note: 'Esa es la conductancia G: falta multiplicar por Kcel.' }], solution: [`κ = Kcel/R = ${dec(Kcel, 2)}/${R} = ${sci(kappa)} S/cm`], explain: `κ = ${sci(kappa)} S/cm.` });
      if (level === 2) return number(`Una solución ${dec(c, 3)} M tiene κ = ${sci(kappa)} S/cm. Calcula Λm en S cm²/mol.`, Lm, 'S cm²/mol', { ...base, label: 'Λm', tol: 0.01, traps: [{ value: kappa / c, note: 'Pasa la concentración a mol/cm³ (÷ 1000): 1 L = 1000 cm³.' }, { value: kappa * c * 1000, note: 'Divide por c, no multipliques.' }], solution: [`c = ${dec(c, 3)} mol/L = ${sci(c / 1000)} mol/cm³`, `Λm = κ/c = ${sci(kappa)}/${sci(c / 1000)} = ${dec(Lm, 2)} S cm²/mol`], explain: `Λm = ${dec(Lm, 2)} S cm²/mol.` });
      if (level === 3) { const ions = sample(rng, LI, 2), t = ions[0][1] / (ions[0][1] + ions[1][1]);
        return number(`En una solución donde solo conducen ${ions[0][0]} y ${ions[1][0]} (λ° = ${ions[0][1]} y ${ions[1][1]} S cm²/mol), ¿qué fracción de la corriente lleva el ${ions[0][0]}? (número de transporte t)`, t, '', { ...base, slide: 42, label: 't', tol: 0.01, traps: [{ value: 1 - t, note: 'Ese es el t del otro ion.' }, { value: ions[0][1] / ions[1][1], note: 't usa λ/(λ₊ + λ₋): falta sumar en el denominador.' }], solution: [`t = ${ions[0][1]}/(${ions[0][1]} + ${ions[1][1]}) = ${dec(t, 3)}`], explain: `t = ${dec(t, 3)}.` }); }
      if (level === 4) { const combo = pick(rng, [{ t: 'CH₃COOH', a: ['HCl', 426.2], d: ['CH₃COONa', 91.0], b: ['NaCl', 126.5] }, { t: 'NH₄OH', a: ['NH₄Cl', 149.7], d: ['NaOH', 247.8], b: ['NaCl', 126.5] }, { t: 'CH₃COOK', a: ['KCl', 149.9], d: ['CH₃COONa', 91.0], b: ['NaCl', 126.5] }]), { a, b, d } = combo, L0 = a[1] + d[1] - b[1];
        return number(`Con Λ°(${a[0]}) = ${a[1]}, Λ°(${d[0]}) = ${d[1]} y Λ°(${b[0]}) = ${b[1]} S cm²/mol, calcula Λ°(${combo.t}) por migración independiente.`, L0, 'S cm²/mol', { ...base, slide: 38, label: 'Λ°', tol: 0.005, traps: [{ value: a[1] + d[1] + b[1], note: `Hay que restar Λ°(${b[0]}): los iones comunes sobran.` }, { value: a[1] + d[1], note: `Falta restar Λ°(${b[0]}).` }], solution: [`Λ°(${combo.t}) = Λ°(${a[0]}) + Λ°(${d[0]}) − Λ°(${b[0]})`, `= ${a[1]} + ${d[1]} − ${b[1]} = ${dec(L0, 1)} S cm²/mol`], explain: `Λ° = ${dec(L0, 1)} S cm²/mol.` }); }
      const L0 = 390.7, cc = pick(rng, [0.01, 0.02, 0.05, 0.1, 0.2]), Ka0 = 1.8e-5, al0 = (-Ka0 + Math.sqrt(Ka0 * Ka0 + 4 * Ka0 * cc)) / (2 * cc), Lmw = Number((al0 * L0).toFixed(2)), al = Lmw / L0, Ka = cc * al * al / (1 - al);
      return number(`Estilo PEP: ácido acético ${dec(cc, 2)} M con Λm = ${dec(Lmw, 2)} S cm²/mol y Λ° = 390,7 S cm²/mol. Calcula Ka con la ley de Ostwald.`, Ka, '', { ...base, slide: 39, label: 'Ka', tol: 0.03, hint: 'α = Λm/Λ°; Ka = cα²/(1 − α).', traps: [{ value: al, note: 'Ese es α: falta Ka = cα²/(1 − α).' }, { value: cc * al, note: 'Ese es [H⁺] = αc: falta Ka.' }], solution: [`α = ${dec(Lmw, 2)}/390,7 = ${dec(al, 4)}`, `Ka = ${dec(cc, 2)}·${dec(al, 4)}²/(1 − ${dec(al, 4)}) = ${sci(Ka)}`], explain: `Ka = ${sci(Ka)}.` });
    }
  };

  /* ════════ Bases: log, molalidad y conductancia ════════ */
  const log10 = {
    id: 'log10', title: 'Potencias de 10 y logaritmos', mission: null, concepts: ['base.log10'],
    make(rng, level) {
      const base = { concept: 'base.log10', slide: 52, hint: '10^x y log son operaciones inversas.' };
      if (level <= 2) { const e = pick(rng, [-4, -3, -2, -1, 1, 2, 3]), v = 10 ** e;
        return choice(rng, `¿Cuánto vale log ${dec(v, 6)}?`, String(e).replace('-', '−'), [e + 1, -e, e - 1].map(t => ({ text: String(t).replace('-', '−'), note: 'log da el exponente de 10.' })), { ...base, explain: `10^${e} = ${dec(v, 6)}, así que log = ${e}.` }); }
      const lg = -between(rng, 0.01, 0.4, 0.005);
      if (level === 3) return number(`Si log γ = ${dec(lg, 3)}, ¿cuánto vale γ?`, 10 ** lg, '', { ...base, label: 'γ', tol: 0.01, traps: [{ value: lg, note: 'Falta elevar 10 a ese valor.', misconception: 'log-dir' }, { value: Math.abs(lg), note: 'Un exponente negativo da un número menor que 1.', misconception: 'gam-gt1' }], solution: [`γ = 10^(${dec(lg, 3)}) = ${dec(10 ** lg, 4)}`], explain: `γ = ${dec(10 ** lg, 4)}.` });
      const x = between(rng, 0.001, 0.05, 0.001);
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Calcula √${dec(x, 3)} (la raíz de una fuerza iónica I = ${dec(x, 3)}).`, Math.sqrt(x), '', { ...base, label: '√I', tol: 0.01, traps: [{ value: x / 2, note: 'La raíz no es la mitad.' }, { value: x * x, note: 'Elevaste al cuadrado en vez de sacar la raíz.' }], solution: [`√${dec(x, 3)} = ${dec(Math.sqrt(x), 4)}`], explain: `√I = ${dec(Math.sqrt(x), 4)}.` });
    }
  };
  const molal = {
    id: 'molal', title: 'Molalidad de cada ion', mission: null, concepts: ['base.molal'],
    make(rng, level) {
      const s = pick(rng, level <= 2 ? SIMPLE : SALTS), m = between(rng, 0.02, 0.4, 0.01), ionP = rng() < 0.5, nuI = ionP ? s.vp : s.vm, ion = ionP ? s.ip : s.im;
      return number(`${s.f} ${dec(m, 2)} m. ¿Cuánto vale la molalidad del ${ion}?`, nuI * m, 'mol/kg', { concept: 'base.molal', slide: 13, hint: 'Multiplica por los iones que salen por fórmula.', label: 'm', tol: 0.005, traps: [{ value: m, note: 'Esa es la de la sal.', misconception: 'ion-nu' }, { value: nu(s) * m, note: 'Esa es la de todos los iones juntos.' }], solution: [`${s.f} → ${s.vp} ${s.ip} + ${s.vm} ${s.im}`, `m(${ion}) = ${nuI} × ${dec(m, 2)} = ${dec(nuI * m, 3)} mol/kg`], explain: `${dec(nuI * m, 3)} mol/kg.` });
    }
  };
  const ohm = {
    id: 'ohm', title: 'Conductancia y unidades', mission: null, concepts: ['base.ohm'],
    make(rng, level) {
      const base = { concept: 'base.ohm', slide: 32, hint: 'G = 1/R; κ = Kcel/R; Kcel = l/A.' };
      if (level === 1) { const R = between(rng, 20, 2000, 5);
        return number(`Una solución tiene R = ${R} Ω. Calcula la conductancia G.`, 1 / R, 'S', { ...base, label: 'G', tol: 0.005, traps: [{ value: R, note: 'G es la inversa de R.' }], solution: [`G = 1/${R} = ${sci(1 / R)} S`], explain: `G = ${sci(1 / R)} S.` }); }
      if (level === 2) { const l = between(rng, 0.5, 4, 0.1), Ar = between(rng, 0.5, 4, 0.1);
        return number(`Una celda tiene electrodos separados ${dec(l, 1)} cm, con área de ${dec(Ar, 1)} cm². Calcula la constante de celda Kcel.`, l / Ar, 'cm⁻¹', { ...base, label: 'Kcel', tol: 0.01, traps: [{ value: l * Ar, note: 'Kcel = l/A, no l·A.' }, { value: Ar / l, note: 'Al revés: Kcel = l/A.' }], solution: [`Kcel = l/A = ${dec(l, 1)}/${dec(Ar, 1)} = ${dec(l / Ar, 3)} cm⁻¹`], explain: `Kcel = ${dec(l / Ar, 3)} cm⁻¹.` }); }
      if (level === 3) { const c = pick(rng, [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2]);
        return number(`Expresa ${dec(c, 3)} mol/L en mol/m³.`, c * 1000, 'mol/m³', { ...base, slide: 35, label: 'c', tol: 0.005, hint: '1 m³ = 1000 L.', traps: [{ value: c / 1000, note: '1 mol/L = 1000 mol/m³ (1 m³ tiene 1000 L).' }], solution: [`${dec(c, 3)} mol/L × 1000 L/m³ = ${dec(c * 1000, 2)} mol/m³`], explain: `${dec(c * 1000, 2)} mol/m³.` }); }
      if (level === 4) { const k = between(rng, 5, 1500, 5);
        return number(`El conductímetro marca κ = ${k} µS/cm. Exprésalo en S/cm.`, k * 1e-6, 'S/cm', { ...base, slide: 34, label: 'κ', tol: 0.005, traps: [{ value: k * 1e-3, note: '1 µS = 10⁻⁶ S (no 10⁻³).' }, { value: k * 1e6, note: 'Al revés: µS es una unidad pequeña.' }], solution: [`${k} µS/cm × 10⁻⁶ S/µS = ${sci(k * 1e-6)} S/cm`], explain: `κ = ${sci(k * 1e-6)} S/cm.` }); }
      const Kc = pick(rng, [0.5, 0.85, 1.0, 1.2, 1.5]), R = between(rng, 150, 1500, 5);
      return number(`Estilo PEP: Kcel = ${dec(Kc, 2)} cm⁻¹ y R = ${R} Ω. Calcula κ.`, Kc / R, 'S/cm', { ...base, slide: 64, label: 'κ', tol: 0.01, traps: [{ value: Kc * R, note: 'Multiplicaste: κ = Kcel/R.' }, { value: 1 / R, note: 'Esa es G: falta multiplicar por Kcel.' }], solution: [`κ = ${dec(Kc, 2)}/${R} = ${sci(Kc / R)} S/cm`], explain: `κ = ${sci(Kc / R)} S/cm.` });
    }
  };

  const generators = [iones, actividad, fuerza, debye, solub, acidez, conduc, log10, molal, ohm];

  /* Laboratorio libre: una solución real que hay que dejar "limpia" para aplicar la ley límite (I < 0,01 m). */
  const substances = [
    { id: 'conc', name: 'CaCl₂ 0,50 m (muy concentrada)', formula: 'I = 1,50: la ley límite no sirve' },
    { id: 'dil', name: 'CaCl₂ 0,005 m (diluida)', formula: 'I = 0,015: γ± ≈ 0,75' },
    { id: 'sal', name: 'CaCl₂ 0,005 m con KNO₃ 0,50 m', formula: 'I alta por el KNO₃' },
    { id: 'agua', name: 'Agua pura', formula: 'solvente' }
  ];
  const reagents = [{ id: 'diluir', label: 'Diluir 100 veces con agua' }, { id: 'kno3', label: 'Agregar KNO₃ 0,50 m' }, { id: 'medir', label: 'Aplicar la ley límite' }];
  const RX = {
    'conc>diluir': ['dil', 'Diluir baja la molalidad y la fuerza iónica: ahora I está cerca del rango de la ley límite.'],
    'dil>kno3': ['sal', 'El KNO₃ no comparte iones, pero sube I y baja γ±: el CaCl₂ "actúa" menos.']
  };
  const WHY_NOT = { diluir: 'Esa solución ya está diluida o no tiene sal para diluir.', kno3: 'Agregar sal solo tiene sentido sobre una solución ya diluida.', medir: 'Todavía no: I debe ser baja (< 0,01 m) para que la ley límite valga.' };
  function react(fromId, reagentId) {
    const r = RX[fromId + '>' + reagentId];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (reagentId === 'medir' && fromId === 'dil') return { to: null, ok: false, why: 'Con I = 0,015 la ley límite da γ± ≈ 0,75: es una buena estimación para este ejercicio.' };
    return { to: null, ok: false, why: WHY_NOT[reagentId] || 'Este reactivo no hace nada útil aquí.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['conc', 'dil'] };

  const creatures = {
    'base.log10': ['Escriba', '#a07a4a'], 'base.molal': ['Búho', '#5d6f9e'], 'base.ohm': ['Relámpago', '#c9a227'],
    'ion.electrolitos': ['Trasgo', '#7f9a3c'], 'ion.actividad': ['Duende', '#6d8bd6'], 'ion.fuerza': ['Gólem', '#8a6fd1'],
    'ion.debye': ['Niebla', '#7fa3a0'], 'ion.kps': ['Hidra', '#c0574a'], 'ion.ka': ['Serpiente', '#5f9e5a'], 'ion.conductividad': ['Grifo', '#c98a1b']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['fq-02'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
