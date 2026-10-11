/* Ejercicios infinitos de "Volumetría: de la bureta a la muestra" (Química Analítica, PEP 1). Niveles 1 Fácil … 5 Nivel PEP.
   Los resultados se CALCULAN (nunca se escriben a mano). Datos: Skoog cap. 13 y Harris cap. 7. */
(() => {
  'use strict';
  const SRC = 'skoog';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 2) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−');
  const fix = (x, d) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
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

  /* Reacciones de titulación: r = coef(analito)/coef(titulante). */
  const RXN = [
    { analyte: 'HCl', titrant: 'NaOH', r: 1, eq: 'HCl + NaOH → NaCl + H₂O' },
    { analyte: 'CH₃COOH', titrant: 'NaOH', r: 1, eq: 'CH₃COOH + NaOH → CH₃COONa + H₂O' },
    { analyte: 'NaOH', titrant: 'HCl', r: 1, eq: 'NaOH + HCl → NaCl + H₂O' },
    { analyte: 'H₂SO₄', titrant: 'NaOH', r: 0.5, eq: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O' },
    { analyte: 'Na₂CO₃', titrant: 'HCl', r: 0.5, eq: 'Na₂CO₃ + 2HCl → 2NaCl + CO₂ + H₂O' },
    { analyte: 'Ba(OH)₂', titrant: 'HCl', r: 0.5, eq: 'Ba(OH)₂ + 2HCl → BaCl₂ + 2H₂O' }
  ];
  const ratioText = r => r === 1 ? '1:1' : '1 de analito por 2 de titulante';

  /* ════════ Conceptos de titulación ════════ */
  const TERMS = [
    ['El momento teórico en que los moles se igualan según la estequiometría', 'Punto de equivalencia'], ['El viraje observado del indicador', 'Punto final'],
    ['La solución de concentración conocida en la bureta', 'Titulante'], ['La diferencia entre el punto final y la equivalencia', 'Error de titulación'],
    ['Agregar un exceso conocido de reactivo y titular lo que sobra', 'Titulación por retroceso'], ['Determinar la concentración exacta del titulante con un patrón', 'Estandarización']
  ];
  const take = (rng, list, n) => shuffle(rng, list).slice(0, n);
  const KINDS_T = [
    ['Se titula HCl con NaOH estandarizado usando fenolftaleína', 'Directa: el titulante reacciona con el analito'],
    ['Se titula vinagre con NaOH hasta rosado pálido', 'Directa: el titulante reacciona con el analito'],
    ['El CaCO₃ de una tableta no se disuelve en agua: se agrega HCl en exceso conocido y se titula el HCl que sobra con NaOH', 'Por retroceso: exceso conocido de reactivo y se titula lo que sobra'],
    ['La aspirina se hidroliza lento: se calienta con NaOH en exceso y se titula el NaOH que sobra con HCl', 'Por retroceso: exceso conocido de reactivo y se titula lo que sobra'],
    ['El Cu²⁺ oxida I⁻ a I₂ y luego se titula el I₂ liberado con tiosulfato', 'Indirecta (por desplazamiento): se titula un producto liberado por el analito'],
    ['El NH₃ de un fertilizante se destila sobre HCl en exceso y se titula el HCl que sobra', 'Por retroceso: exceso conocido de reactivo y se titula lo que sobra']
  ];
  const piezas = {
    id: 'piezas', title: 'Piezas y tipos de titulación', mission: 'm1', concepts: ['ana.volumetria'],
    make(rng, level) {
      if (level === 1) { const [text, term] = pick(rng, TERMS);
        return choice(rng, `¿Cómo se llama esto? "${text}"`, term, take(rng, TERMS.map(t => t[1]).filter(t => t !== term), 3).map(t => ({ text: t, note: 'Repasa las piezas de la titulación.', misconception: (term + t).includes('Punto') ? 'eq-vs-end' : undefined })),
          { concept: 'ana.volumetria', slide: 2, hint: 'Teórico frente a observado; bureta frente a matraz.', explain: `${term}.` }); }
      if (level <= 3) { const veq = between(rng, 15, 40, 0.01), d = pick(rng, [-1, 1]) * between(rng, 0.05, 0.6, 0.01), vf = Number((veq + d).toFixed(2));
        return number(`Según la estequiometría, la equivalencia está en ${fix(veq, 2)} mL, pero el indicador vira a los ${fix(vf, 2)} mL. ¿Cuál es el error de titulación (mL, con signo)?`, vf - veq, 'mL', { concept: 'ana.volumetria', slide: 2, label: 'error', tol: 0.02, hint: 'Error = V(punto final) − V(equivalencia).',
          traps: [{ value: veq - vf, note: 'Es punto final menos equivalencia.', misconception: 'eq-vs-end' }, { value: (vf - veq) / veq * 100, note: 'Eso es el error relativo en %; se pide en mL.' }],
          solution: [`Error = ${fix(vf, 2)} − ${fix(veq, 2)} = ${dec(vf - veq, 2)} mL`, vf > veq ? 'Positivo: el indicador viró tarde (se pasó de la equivalencia).' : 'Negativo: el indicador viró antes de la equivalencia.'], explain: `${dec(vf - veq, 2)} mL.` }); }
      if (level === 4) { const [text, kind] = pick(rng, KINDS_T);
        return choice(rng, `${text}. ¿Qué tipo de titulación es?`, kind, [...new Set(KINDS_T.map(k => k[1]))].filter(k => k !== kind).concat(['Gravimetría: se pesa el producto']).map(t => ({ text: t, note: '¿Se titula el analito, un exceso que sobra o un producto liberado?' })),
          { concept: 'ana.volumetria', slide: 3, hint: '¿Qué está en el matraz cuando se titula?', explain: `${kind}.` }); }
      // Retroceso con números: CaCO₃ + 2 HCl
      const mTab = between(rng, 0.3, 0.9, 0.0001), pct = between(rng, 0.7, 0.98, 0.001), nCa = mTab * 1000 * pct / 100.09, Vh = pick(rng, [50, 50, 40]), Ch = pick(rng, [0.5, 0.4]), nH = Vh * Ch;
      const nBack = nH - 2 * nCa; if (nBack <= 0.5) return this.make(() => 0.3, level);
      const Vn = between(rng, 12, 40, 0.01), Cn = Number((nBack / Vn).toFixed(4)), nCaC = (nH - Vn * Cn) / 2, mgCa = nCaC * 100.09, pctC = mgCa / (mTab * 1000) * 100;
      return number(`Estilo PEP: una tableta antiácido de ${fix(mTab, 4)} g se disuelve en ${Vh},00 mL de HCl ${fix(Ch, 3)} M (exceso). El HCl que sobra gasta ${fix(Vn, 2)} mL de NaOH ${fix(Cn, 4)} M. ¿Qué % de CaCO₃ (100,09 g/mol) tiene la tableta?`, pctC, '%',
        { concept: 'ana.volumetria', slide: 3, label: '%', tol: 0.01, hint: 'HCl total − HCl que sobra = HCl que reaccionó; CaCO₃ + 2 HCl.',
          traps: [{ value: pctC * 2, note: 'Cada CaCO₃ gasta 2 HCl: divide por 2.', misconception: 'stoich-ratio' }, { value: Vn * Cn / 2 * 100.09 / (mTab * 1000) * 100, note: 'Usaste el HCl que sobró, no el que reaccionó.' }],
          solution: [`HCl total = ${Vh},00 × ${fix(Ch, 3)} = ${dec(nH, 3)} mmol`, `HCl que sobra = ${fix(Vn, 2)} × ${fix(Cn, 4)} = ${dec(Vn * Cn, 3)} mmol`, `HCl que reaccionó = ${dec(nH - Vn * Cn, 3)} mmol → CaCO₃ = ${dec(nCaC, 3)} mmol`, `m = ${dec(nCaC, 3)} × 100,09 = ${dec(mgCa, 1)} mg → ${dec(pctC, 1)} %`], explain: `${dec(pctC, 1)} %.` });
    }
  };

  /* ════════ Patrón primario y estandarización ════════ */
  const STD = [['KHP (ftalato ácido de potasio)', true, ''], ['Na₂CO₃ anhidro', true, ''], ['Bórax (Na₂B₄O₇·10H₂O)', true, ''], ['Ácido oxálico dihidratado', true, ''],
    ['NaOH en lentejas', false, 'absorbe agua y CO₂ del aire'], ['HCl concentrado', false, 'es volátil: su concentración cambia'], ['KMnO₄ comercial', false, 'trae MnO₂ y se descompone con la luz'], ['Na₂S₂O₃ (tiosulfato)', false, 'se descompone en solución con el tiempo']];
  const patron = {
    id: 'patron', title: 'Patrones y estandarización', mission: 'm1', concepts: ['ana.patron'],
    make(rng, level) {
      if (level === 1) { const good = pick(rng, STD.filter(s => s[1]))[0];
        return choice(rng, '¿Cuál de estos sirve como patrón primario?', good, take(rng, STD.filter(s => !s[1]), 3).map(s => ({ text: s[0], note: `No: ${s[2]}.`, misconception: 'primary-std' })), { concept: 'ana.patron', slide: 4, hint: 'Puro, estable y no higroscópico.', explain: `${good}.` }); }
      if (level === 2) { const [bad, , why] = pick(rng, STD.filter(s => !s[1])), reasons = STD.filter(s => !s[1] && s[0] !== bad).map(s => s[2]);
        return choice(rng, `¿Por qué ${bad} NO sirve como patrón primario?`, `Porque ${why}`, [...take(rng, reasons, 2).map(r => ({ text: `Porque ${r}`, note: 'Esa razón es de otro reactivo.' })), { text: 'Porque su masa molar es demasiado alta', note: 'Una masa molar alta es una ventaja.', misconception: 'primary-std' }],
          { concept: 'ana.patron', slide: 4, hint: 'Piensa qué le pasa al pesarlo o guardarlo.', explain: `${bad}: ${why}.` }); }
      if (level === 4 || (level === 5 && rng() < 0.5)) { // HCl con Na₂CO₃ (1:2)
        const m = between(rng, 0.1, 0.3, 0.0001), V = between(rng, 18, 45, 0.01), n = m * 1000 / 105.99, C = 2 * n / V;
        return number(`${level === 5 ? 'Estilo PEP: ' : ''}Se pesan ${fix(m, 4)} g de Na₂CO₃ (105,99 g/mol) y se titulan con ${fix(V, 2)} mL de HCl hasta el segundo punto (Na₂CO₃ + 2 HCl). ¿Concentración del HCl?`, C, 'M',
          { concept: 'ana.patron', slide: 5, label: 'C', tol: 0.005, hint: 'mmol Na₂CO₃ × 2 = mmol HCl; C = mmol/mL.', traps: [{ value: n / V, note: 'Falta la relación 1:2.', misconception: 'stoich-ratio' }, { value: C / 1000, note: 'Mezclaste mol con mL.', misconception: 'ml-l' }],
            solution: [`n(Na₂CO₃) = ${dec(m * 1000, 1)} / 105,99 = ${dec(n, 4)} mmol`, `n(HCl) = 2 × ${dec(n, 4)} = ${dec(2 * n, 4)} mmol`, `C = ${dec(2 * n, 4)} / ${fix(V, 2)} = ${dec(C, 4)} M`], explain: `${dec(C, 4)} M.` }); }
      const m = between(rng, 0.3, 0.9, 0.0001), V = between(rng, 15, 45, 0.01), n = m * 1000 / 204.22, C = n / V;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Se pesan ${fix(m, 4)} g de KHP (204,22 g/mol, 1:1 con NaOH) y se titulan con ${fix(V, 2)} mL de NaOH. ¿Concentración del NaOH?`, C, 'M',
        { concept: 'ana.patron', slide: 5, label: 'C', tol: 0.005, hint: 'n = m/MM (en mmol); C = n/V (mL).', traps: [{ value: C / 1000, note: 'Mezclaste mol con mL.', misconception: 'ml-l' }, { value: m / V, note: 'Falta pasar la masa a moles.' }],
          solution: [`n = ${dec(m * 1000, 1)} mg / 204,22 = ${dec(n, 4)} mmol`, `C = ${dec(n, 4)} / ${fix(V, 2)} = ${dec(C, 4)} M`], explain: `${dec(C, 4)} M.` });
    }
  };

  /* ════════ Concentración del analito ════════ */
  const titular = {
    id: 'titular', title: 'Concentración del analito', mission: 'm2', concepts: ['ana.estequio'],
    make(rng, level) {
      const rx = pick(rng, level <= 2 ? RXN.slice(0, 3) : RXN), Ct = between(rng, 0.05, 0.2, 0.0001), Vt = between(rng, 10, 40, 0.01), Va = pick(rng, [10, 20, 25]);
      const nt = Ct * Vt, na = nt * rx.r, Ca = na / Va;
      if (level === 1) return number(`¿Cuántos mmol de ${rx.titrant} hay en ${fix(Vt, 2)} mL de solución ${fix(Ct, 4)} M?`, nt, 'mmol', { concept: 'ana.estequio', slide: 6, label: 'n', tol: 0.005, hint: 'mmol = mL × M.',
        traps: [{ value: nt / 1000, note: 'Eso son mol.', misconception: 'ml-l' }], solution: [`${fix(Vt, 2)} × ${fix(Ct, 4)} = ${dec(nt, 4)} mmol`], explain: `${dec(nt, 4)} mmol.` });
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}${Va},00 mL de ${rx.analyte} gastan ${fix(Vt, 2)} mL de ${rx.titrant} ${fix(Ct, 4)} M (${rx.eq}). ¿Concentración de ${rx.analyte}?`, Ca, 'M',
        { concept: 'ana.estequio', slide: 6, label: 'C', tol: 0.005, hint: `mmol titulante = V × C; relación ${ratioText(rx.r)}; divide por ${Va},00 mL.`,
          traps: [{ value: nt / Va, note: 'Olvidaste la estequiometría.', misconception: 'stoich-ratio' }, { value: nt / rx.r / Va, note: 'Aplicaste la estequiometría al revés.' }, { value: Ct * Va / Vt * rx.r, note: 'Invertiste los volúmenes.' }],
          solution: [`n(${rx.titrant}) = ${fix(Vt, 2)} × ${fix(Ct, 4)} = ${dec(nt, 4)} mmol`, `n(${rx.analyte}) = ${dec(nt, 4)} × ${rx.r === 1 ? '1' : '1/2'} = ${dec(na, 4)} mmol`, `C = ${dec(na, 4)} / ${Va},00 = ${dec(Ca, 4)} M`], explain: `${dec(Ca, 4)} M.` });
    }
  };

  /* ════════ Volumen esperado ════════ */
  const volumen = {
    id: 'volumen', title: 'Volumen de equivalencia', mission: 'm2', concepts: ['ana.estequio'],
    make(rng, level) {
      const rx = pick(rng, level <= 2 ? RXN.slice(0, 3) : RXN), Ca = between(rng, 0.05, 0.15, 0.001), Va = pick(rng, [10, 20, 25]), Ct = pick(rng, [0.05, 0.1, 0.1, 0.2]), Ve = Ca * Va / rx.r / Ct;
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}¿Qué volumen de ${rx.titrant} ${dec(Ct, 2)} M se necesita para llegar a la equivalencia con ${Va},00 mL de ${rx.analyte} ${fix(Ca, 3)} M? (${rx.eq})`, Ve, 'mL',
        { concept: 'ana.estequio', slide: 6, label: 'V', tol: 0.005, hint: 'mmol analito → estequiometría → V = mmol/C.', traps: [{ value: Ca * Va / Ct, note: 'Olvidaste la estequiometría.', misconception: 'stoich-ratio' }, { value: Ca * Va * rx.r / Ct, note: 'Estequiometría al revés.' }],
          solution: [`n(${rx.analyte}) = ${Va},00 × ${fix(Ca, 3)} = ${dec(Ca * Va, 4)} mmol`, `n(${rx.titrant}) = ${dec(Ca * Va / rx.r, 4)} mmol`, `V = ${dec(Ca * Va / rx.r, 4)} / ${dec(Ct, 2)} = ${dec(Ve, 2)} mL`], explain: `${dec(Ve, 2)} mL.` });
    }
  };

  /* ════════ Alícuotas y % en la muestra ════════ */
  const DRUGS = [{ name: 'ácido acetilsalicílico', mm: 180.16, label: 500 }, { name: 'ácido ascórbico (monoprótico en esta titulación)', mm: 176.12, label: 500 }, { name: 'ibuprofeno', mm: 206.28, label: 400 }];
  const alicuota = {
    id: 'alicuota', title: 'Alícuotas y %', mission: 'm2', concepts: ['ana.alicuotas'],
    make(rng, level) {
      const Vt = pick(rng, [100, 250, 500]), Va = pick(rng, [10, 20, 25]), f = Vt / Va;
      if (level <= 2) { const n = between(rng, 0.1, 2, 0.001);
        return number(`Una alícuota de ${Va},00 mL de un aforado de ${dec(Vt)},0 mL contiene ${fix(n, 3)} mmol de analito. ¿Cuántos mmol hay en todo el aforado?`, n * f, 'mmol', { concept: 'ana.alicuotas', slide: 7, label: 'n', tol: 0.005, hint: '× V_total/V_alícuota.',
          traps: [{ value: n, note: 'Falta el factor de alícuota.', misconception: 'aliquot-factor' }, { value: n / f, note: 'Al revés: el total es mayor.' }], solution: [`${fix(n, 3)} × ${dec(Vt)}/${Va} = ${dec(n * f, 3)} mmol`], explain: `${dec(n * f, 3)} mmol.` }); }
      if (level === 3) { const C1 = between(rng, 0.1, 1, 0.01), V1 = pick(rng, [5, 10, 25]), V2 = pick(rng, [100, 250, 500]), C2 = C1 * V1 / V2;
        return number(`Se toman ${V1},00 mL de una solución ${fix(C1, 2)} M y se aforan a ${V2},0 mL. ¿Nueva concentración?`, C2, 'M', { concept: 'ana.alicuotas', slide: 7, label: 'C₂', tol: 0.005, hint: 'C₂ = C₁V₁/V₂.',
          traps: [{ value: C1 * V2 / V1, note: 'Al revés: diluir baja la concentración.' }], solution: [`C₂ = ${fix(C1, 2)} × ${V1} / ${V2} = ${dec(C2, 4)} M`], explain: `${dec(C2, 4)} M.` }); }
      const d = pick(rng, DRUGS), mg = d.label * between(rng, 0.93, 1.05, 0.001), mtab = between(rng, mg / 1000 + 0.08, mg / 1000 + 0.3, 0.0001), Ct = pick(rng, [0.05, 0.1]);
      const nAli = mg / d.mm / f, Vb = Number((nAli / Ct).toFixed(2)), mgCalc = Vb * Ct * f * d.mm, pct = mgCalc / (mtab * 1000) * 100;
      const ask = level === 5 ? 'pct' : 'mg';
      const p = `${level === 5 ? 'Estilo PEP: ' : ''}Un comprimido de ${fix(mtab, 4)} g se disuelve y se afora a ${dec(Vt)},0 mL. Una alícuota de ${Va},00 mL gasta ${fix(Vb, 2)} mL de NaOH ${dec(Ct, 2)} M (1:1). MM del ${d.name} = ${fix(d.mm, 2)} g/mol. ${ask === 'pct' ? '¿Qué % del comprimido es principio activo?' : '¿Cuántos mg de principio activo tiene el comprimido?'}`;
      const sol = [`n en la alícuota = ${fix(Vb, 2)} × ${dec(Ct, 2)} = ${dec(Vb * Ct, 4)} mmol`, `Total = ${dec(Vb * Ct, 4)} × ${dec(Vt)}/${Va} = ${dec(Vb * Ct * f, 4)} mmol`, `m = ${dec(Vb * Ct * f, 4)} × ${fix(d.mm, 2)} = ${dec(mgCalc, 1)} mg`];
      if (ask === 'mg') return number(p, mgCalc, 'mg', { concept: 'ana.alicuotas', slide: 7, label: 'masa', tol: 0.01, hint: 'mmol → × factor de alícuota → × MM.',
        traps: [{ value: mgCalc / f, note: 'Esa es la masa en la alícuota.', misconception: 'aliquot-factor' }, { value: mgCalc / 1000, note: 'mmol × g/mol = mg.', misconception: 'ml-l' }], solution: sol, explain: `${dec(mgCalc, 1)} mg.` });
      return number(p, pct, '%', { concept: 'ana.alicuotas', slide: 7, label: '%', tol: 0.01, hint: 'Masa de activo / masa del comprimido × 100.',
        traps: [{ value: pct / f, note: 'Falta el factor de alícuota.', misconception: 'aliquot-factor' }, { value: mgCalc / d.label * 100, note: 'Divide por la masa del comprimido, no por lo rotulado.' }], solution: [...sol, `% = ${dec(mgCalc, 1)} / ${dec(mtab * 1000, 1)} × 100 = ${dec(pct, 1)} %`], explain: `${dec(pct, 1)} %.` });
    }
  };

  /* ════════ Bases ════════ */
  const moles = {
    id: 'moles', title: 'mmol y mg', mission: null, concepts: ['base.moles'],
    make(rng, level) {
      const mm = pick(rng, [[204.22, 'KHP'], [105.99, 'Na₂CO₃'], [40.0, 'NaOH'], [180.16, 'aspirina']]), m = between(rng, 50, 900, 0.1);
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}¿Cuántos mmol hay en ${dec(m, 1)} mg de ${mm[1]} (${fix(mm[0], 2)} g/mol)?`, m / mm[0], 'mmol', { concept: 'base.moles', slide: 6, label: 'n', tol: 0.005, hint: 'mmol = mg / (g/mol).',
        traps: [{ value: m / mm[0] / 1000, note: 'mg / (g/mol) da mmol directamente.', misconception: 'ml-l' }, { value: m * mm[0], note: 'Se divide por la masa molar.' }], solution: [`${dec(m, 1)} / ${fix(mm[0], 2)} = ${dec(m / mm[0], 4)} mmol`], explain: `${dec(m / mm[0], 4)} mmol.` });
    }
  };
  const estequio = {
    id: 'estequio', title: 'Relación estequiométrica', mission: null, concepts: ['base.estequio'],
    make(rng, level) {
      const rx = pick(rng, RXN.slice(3)), nt = between(rng, 0.5, 5, 0.01);
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}${rx.eq}. Si reaccionan ${fix(nt, 2)} mmol de ${rx.titrant}, ¿cuántos mmol de ${rx.analyte} había?`, nt * rx.r, 'mmol', { concept: 'base.estequio', slide: 6, label: 'n', tol: 0.005, hint: 'Mira los coeficientes.',
        traps: [{ value: nt, note: 'Falta la relación 1:2.', misconception: 'stoich-ratio' }, { value: nt * 2, note: 'Al revés.' }], solution: [`n = ${fix(nt, 2)} × 1/2 = ${dec(nt / 2, 3)} mmol`], explain: `${dec(nt / 2, 3)} mmol.` });
    }
  };

  const generators = [piezas, patron, titular, volumen, alicuota, moles, estequio];

  /* Laboratorio: de la muestra a la titulación (elige el paso correcto). */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('naoh', 'NaOH recién preparado (concentración aproximada)', '≈ 0,1 M'), S('naoh-std', 'NaOH estandarizado', '0,1006 M exacta'),
    S('tableta', 'Comprimido de aspirina', 'sólido'), S('aforado', 'Aspirina disuelta y aforada a 100,0 mL', 'solución madre'), S('alicuota', 'Alícuota de 10,00 mL en el matraz', 'lista para titular'), S('titulada', 'Alícuota titulada hasta el viraje', '5,55 mL de NaOH')
  ];
  const reagents = [['khp', 'Titular contra KHP pesado'], ['disolver', 'Disolver y aforar'], ['pipetear', 'Tomar alícuota con pipeta aforada'], ['titular', 'Agregar indicador y titular con NaOH estándar'], ['pesar', 'Pesar directamente NaOH sólido']].map(([id, label]) => ({ id, label }));
  const RX = {
    'naoh>khp': ['naoh-std', 'Estandarizado: ahora conoces su concentración exacta (patrón secundario).'],
    'tableta>disolver': ['aforado', 'Solución madre de volumen exacto.'],
    'aforado>pipetear': ['alicuota', 'Ojo: ahora tienes solo 1/10 del total. Anota el factor 100,0/10,00.'],
    'alicuota>titular': ['titulada', '5,55 × 0,0500 = 0,2775 mmol × 10 × 180,16 = 500 mg. ¡Cumple!']
  };
  const WHY_NOT = { pesar: 'NaOH absorbe agua y CO₂: su masa no es confiable. Se estandariza con KHP.', khp: 'El KHP sirve para estandarizar bases, no para esta muestra.', titular: 'Todavía no: primero prepara la muestra (y estandariza el NaOH).', disolver: 'Ya está en solución.', pipetear: 'Primero necesitas una solución aforada.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (['naoh-std', 'titulada'].includes(fromId)) return { to: null, ok: false, why: 'Listo este paso: vuelve a "Otra sustancia" para seguir con otra.' };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'Este paso no corresponde aquí.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['naoh', 'tableta'] };

  const creatures = {
    'base.moles': ['Escriba', '#a07a4a'], 'base.estequio': ['Búho', '#5d6f9e'],
    'ana.volumetria': ['Trasgo', '#7f9a3c'], 'ana.patron': ['Gólem', '#8a6fd1'], 'ana.estequio': ['Serpiente', '#5f9e5a'], 'ana.alicuotas': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['ana-02'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
