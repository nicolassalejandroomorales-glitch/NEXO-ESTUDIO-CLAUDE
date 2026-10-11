/* Casos infinitos de "Digestivo: barrera, secreción, motilidad e hígado" (Fisiopatología, PEP 1). Niveles 1 Fácil … 5 Nivel PEP.
   La brecha osmolar se CALCULA; los casos salen de bancos de signos (Silbernagl y Lang). */
(() => {
  'use strict';
  const SRC = 'silbernagl';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const take = (rng, list, n) => shuffle(rng, list).slice(0, n);
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  function number(prompt, answer, unit, extra) {
    const tol = extra.tol ?? 0.02, traps = (extra.traps || []).filter(t => Number.isFinite(t.value) && Math.abs(t.value - answer) > Math.max(Math.abs(answer) * tol * 1.5, 3));
    return { type: 'number', prompt, answer, unit, tol, ...extra, traps };
  }
  const AGE = rng => pick(rng, ['Mujer de 28 años', 'Hombre de 52 años', 'Mujer de 67 años', 'Hombre de 40 años', 'Mujer de 45 años']);

  /* ════════ Esófago ════════ */
  const ESO = {
    erge: { label: 'ERGE', signs: ['pirosis después de comer', 'regurgitación ácida al acostarse', 'tos nocturna', 'hernia hiatal en la endoscopia', 'mejora con omeprazol'] },
    acal: { label: 'Acalasia', signs: ['disfagia a sólidos y líquidos desde el inicio', 'regurgitación de comida sin digerir', 'esófago dilatado con "pico de pájaro"', 'EEI que no se relaja en la manometría'] },
    cancer: { label: 'Obstrucción mecánica (cáncer de esófago)', signs: ['disfagia primero a sólidos y luego a líquidos', 'baja de peso', 'antecedente de esófago de Barrett', 'fumador y bebedor'] }
  };
  const esofago = {
    id: 'esofago', title: 'Esófago', mission: 'm1', concepts: ['fis.esofago'],
    make(rng, level) {
      const k = pick(rng, level <= 2 ? ['erge', 'acal'] : Object.keys(ESO)), e = ESO[k], s = take(rng, e.signs, level <= 2 ? 1 : level <= 4 ? 2 : 3);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con ${s.join(', ')}. ¿Diagnóstico más probable?`, e.label, Object.entries(ESO).filter(([kk]) => kk !== k).map(([, o]) => ({ text: o.label, note: `Esa daría ${take(rng, o.signs, 1)[0]}.`, misconception: 'achalasia-erge' })),
        { concept: 'fis.esofago', slide: 2, hint: '¿Sube el ácido o no baja la comida? ¿Cómo progresa la disfagia?', explain: `${e.label}.` });
    }
  };

  /* ════════ Úlcera: caso → mecanismo → tratamiento con su porqué ════════ */
  function statements(rng, level, bank, extra) {
    const askFalse = level >= 3 ? rng() < 0.5 : false;
    if (askFalse) { const [f, why, mis] = pick(rng, bank.F);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}: ¿cuál afirmación es INCORRECTA?`, f, take(rng, bank.T, 3).map(t => ({ text: t, note: 'Esta es verdadera.' })), { ...extra, misconception: mis, explain: `Es falsa: ${why}` }); }
    const t = pick(rng, bank.T);
    return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}: ¿cuál afirmación es correcta?`, t, take(rng, bank.F, 3).map(([text, why, mis]) => ({ text, note: why, misconception: mis })), { ...extra, explain: t });
  }
  const list3 = xs => xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}` : xs[0];
  const caseSigns = (rng, d, n) => { const k = pick(rng, d.key); return shuffle(rng, [k, ...take(rng, [...d.key, ...d.other].filter(x => x !== k), Math.max(0, n - 1))]); };
  const ULC = [
    { name: 'Úlcera por AINE', key: ['toma naproxeno a diario por su artrosis', 'usa ibuprofeno varias veces al día por dolor lumbar'], other: ['dolor epigástrico', 'deposiciones negras', 'test de H. pylori negativo'], mech: 'AINE: ↓ prostaglandinas → ↓ moco, ↓ HCO₃⁻ y ↓ flujo de la mucosa', tx: 'Suspender el AINE e iniciar un IBP', why: 'sin AINE vuelven las prostaglandinas y el IBP baja el ácido mientras cicatriza', bad: 'el AINE aumentó mucho la secreción de ácido' },
    { name: 'Úlcera por Helicobacter pylori', key: ['test de aire espirado con urea ¹³C positivo', 'biopsia con bacterias espirales que producen ureasa'], other: ['úlcera duodenal', 'dolor que mejora al comer', 'no toma AINE'], mech: 'H. pylori: inflamación de la mucosa y alteración de la gastrina', tx: 'IBP más dos antibióticos (erradicación)', why: 'sin la bacteria la úlcera casi no recurre', bad: 'el IBP solo basta porque la bacteria muere sin ácido' },
    { name: 'Gastrinoma (Zollinger-Ellison)', key: ['gastrina muy alta en ayunas', 'úlceras múltiples incluso en el yeyuno'], other: ['diarrea crónica', 'no responde a dosis habituales de IBP', 'pliegues gástricos engrosados'], mech: 'Un tumor secreta gastrina → exceso de ácido', tx: 'Buscar y resecar el tumor; IBP a dosis altas mientras tanto', why: 'el problema es el exceso de gastrina que produce el tumor', bad: 'se debe a falta de prostaglandinas' },
    { name: 'Úlcera de estrés', key: ['en UCI con quemaduras del 40 % del cuerpo', 'en ventilación mecánica y con shock'], other: ['sangrado gástrico', 'lesiones difusas en el fondo gástrico'], mech: '↓ flujo sanguíneo de la mucosa: falla la defensa', tx: 'Profilaxis con IBP y mejorar la perfusión', why: 'proteger la mucosa mientras se corrige la hipoperfusión', bad: 'es una infección que se trata con antibióticos' }
  ];
  const lc = t => t.charAt(0).toLowerCase() + t.slice(1);
  const ulcera = {
    id: 'ulcera', title: 'Úlcera: mecanismo y tratamiento', mission: 'm1', concepts: ['fis.ulcera'],
    make(rng, level) {
      const u = pick(rng, ULC), others = ULC.filter(x => x !== u), head = `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con úlcera péptica: ${list3(caseSigns(rng, u, level <= 2 ? 2 : 3))}.`;
      if (level <= 2) return choice(rng, `${head} ¿Mecanismo principal?`, u.mech, others.map(o => ({ text: o.mech, note: `Ese es de: ${lc(o.name)}.`, misconception: u.name.includes('AINE') ? 'nsaid-mech' : 'ulcer-acid' })),
        { concept: 'fis.ulcera', slide: 3, hint: '¿Fármaco, bacteria, tumor o mala perfusión?', explain: `${u.name}: ${lc(u.mech)}.` });
      const right = `${u.tx}, porque ${u.why}`;
      return choice(rng, `${head} ¿Qué tratamiento corresponde y por qué?`, right, [{ text: `${u.tx}, porque ${u.bad}`, note: `El tratamiento está bien, pero la razón es falsa: ${u.why}.`, misconception: 'ulcer-acid' }, ...take(rng, others, 2).map(o => ({ text: `${o.tx}, porque ${o.why}`, note: `Eso corresponde a: ${lc(o.name)}.` }))],
        { concept: 'fis.ulcera', slide: 3, hint: 'Primero el mecanismo; el tratamiento corrige ese eslabón.', explain: `${u.name}: ${right}.` });
    }
  };

  /* ════════ Fármacos ácido-péptico: mecanismo, elección y "qué pasa si" ════════ */
  const DRUGS = [['Omeprazol', 'Inhibe la H⁺/K⁺-ATPasa (bomba de protones)'], ['Famotidina', 'Bloquea el receptor H₂ de histamina'], ['Misoprostol', 'Análogo de prostaglandina E₁: repone la defensa'], ['Hidróxido de aluminio y magnesio', 'Neutraliza el ácido ya secretado'], ['Sucralfato', 'Forma una capa protectora sobre la úlcera'], ['Bismuto', 'Protege la mucosa y tiene efecto contra H. pylori']];
  const SEC_BANK = { topic: 'Secreción gástrica y su control', T: ['La célula parietal secreta HCl con la H⁺/K⁺-ATPasa.', 'La histamina estimula la secreción ácida a través del receptor H₂.', 'Las prostaglandinas aumentan el moco y el bicarbonato.', 'El omeprazol es más potente que la famotidina porque bloquea el paso final.', 'La gastrina, la histamina y la acetilcolina estimulan la célula parietal.', 'El misoprostol protege a quien debe seguir tomando AINE.', 'La célula parietal también secreta factor intrínseco.'],
    F: [['Los AINE dañan la mucosa sobre todo porque aumentan el ácido.', 'bajan las prostaglandinas y con eso la defensa.', 'nsaid-mech'], ['La famotidina bloquea la bomba de protones.', 'bloquea el receptor H₂; la bomba la bloquean los IBP.', 'nsaid-mech'], ['Las prostaglandinas aumentan la secreción de ácido.', 'la disminuyen y aumentan la defensa.', 'nsaid-mech'], ['Los antiácidos impiden que la célula parietal secrete ácido.', 'solo neutralizan el ácido ya secretado.', 'ulcer-acid'], ['La mayoría de las úlceras se debe a exceso de ácido por estrés.', 'la mayoría se debe a H. pylori o AINE.', 'ulcer-acid']] };
  const farmacos = {
    id: 'farmacos', title: 'Fármacos y su eslabón', mission: 'm1', concepts: ['base.secrecion'],
    make(rng, level) {
      if (level >= 4) return statements(rng, level, SEC_BANK, { concept: 'base.secrecion', slide: 1, hint: 'Bomba (IBP), receptor H₂, prostaglandinas (defensa), neutralizar o cubrir.' });
      const [d, m] = pick(rng, DRUGS);
      if (level === 3) return choice(rng, `¿Qué fármaco actúa así? "${m}"`, d, take(rng, DRUGS.filter(x => x[0] !== d), 3).map(x => ({ text: x[0], note: x[1] + '.' })), { concept: 'base.secrecion', slide: 1, hint: 'Bomba, receptor, prostaglandina, neutralizar o cubrir.', explain: `${d}.` });
      return choice(rng, `¿Cómo actúa: ${d}?`, m, take(rng, DRUGS.filter(x => x[0] !== d), 3).map(x => ({ text: x[1], note: `Ese es: ${x[0]}.`, misconception: d === 'Misoprostol' ? 'nsaid-mech' : undefined })), { concept: 'base.secrecion', slide: 1, hint: '¿Qué eslabón de la secreción o defensa toca?', explain: m + '.' });
    }
  };

  /* ════════ Diarrea ════════ */
  const brecha = {
    id: 'brecha', title: 'Brecha osmolar fecal', mission: 'm2', concepts: ['fis.diarrea'],
    make(rng, level) {
      const osm = rng() < 0.5, na = osm ? between(rng, 15, 45, 1) : between(rng, 90, 100, 1), k = osm ? between(rng, 10, 30, 1) : between(rng, 32, 40, 1), b = 290 - 2 * (na + k);
      if (level <= 3) return number(`${level === 3 ? 'Diarrea crónica: ' : ''}Na⁺ fecal ${na} y K⁺ fecal ${k} mmol/L. Calcula la brecha osmolar fecal.`, b, 'mOsm/kg', { concept: 'fis.diarrea', slide: 5, label: 'brecha', tol: 0.03, hint: '290 − 2([Na⁺] + [K⁺]).',
        traps: [{ value: 290 - (na + k), note: 'Falta multiplicar por 2.' }, { value: 2 * (na + k), note: 'Falta restarlo a 290.' }], solution: [`2 × (${na} + ${k}) = ${2 * (na + k)}`, `290 − ${2 * (na + k)} = ${b} → ${b > 100 ? 'osmótica' : b < 50 ? 'secretora' : 'indeterminada'}`], explain: `${b}.` });
      const right = b > 100 ? 'Osmótica' : b < 50 ? 'Secretora' : 'Indeterminada';
      const ayuno = right === 'Osmótica' ? 'cede con el ayuno' : 'persiste aunque esté en ayuno';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con diarrea acuosa que ${ayuno}. Na⁺ fecal ${na} y K⁺ ${k} mmol/L. ¿Tipo de diarrea?`, right,
        ['Osmótica', 'Secretora', 'Inflamatoria'].filter(t => t !== right).map(text => ({ text, note: `Brecha = 290 − 2(${na} + ${k}) = ${b}.`, misconception: 'diarrhea-type' })),
        { concept: 'fis.diarrea', slide: 5, hint: 'Calcula la brecha y mira el ayuno.', explain: `Brecha ${b} → ${right.toLowerCase()}.` });
    }
  };
  const DIA = [
    { t: 'Osmótica', c: ['déficit de lactasa', 'uso de laxante de sulfato de magnesio', 'consumo de muchos chicles con sorbitol'], key: ['cede con el ayuno', 'empeora tras tomar leche'], other: ['heces acuosas sin sangre', 'distensión y gases'] },
    { t: 'Secretora', c: ['cólera', 'un tumor secretor de VIP', 'E. coli enterotoxigénica'], key: ['persiste en ayuno', 'pierde litros de heces como agua de arroz'], other: ['heces acuosas sin sangre', 'deshidratación'] },
    { t: 'Inflamatoria', c: ['Shigella', 'colitis ulcerosa', 'Campylobacter'], key: ['heces con sangre y moco', 'fiebre y leucocitos en las heces'], other: ['dolor abdominal tipo cólico', 'pujo'] },
    { t: 'Malabsorción (esteatorrea)', c: ['insuficiencia pancreática por alcohol', 'enfermedad celíaca', 'fibrosis quística'], key: ['heces grasosas que flotan', 'déficit de vitaminas A, D, E y K'], other: ['baja de peso', 'heces malolientes'] }
  ];
  const diarrea = {
    id: 'diarrea', title: 'Tipo de diarrea', mission: 'm2', concepts: ['fis.diarrea'],
    make(rng, level) {
      const d = pick(rng, DIA), others = DIA.filter(x => x !== d);
      if (level <= 2) { const c = pick(rng, d.c);
        return choice(rng, `¿Qué tipo de diarrea produce: ${c}?`, d.t, others.map(o => ({ text: o.t, note: `Ejemplo de esa: ${pick(rng, o.c)}.`, misconception: 'diarrhea-type' })),
          { concept: 'fis.diarrea', slide: d.t.startsWith('Mal') ? 6 : 5, hint: '¿Soluto que retiene agua, epitelio que secreta, inflamación o grasa sin digerir?', explain: `${c}: ${lc(d.t)}.` }); }
      const signs = caseSigns(rng, d, level === 3 ? 2 : 3);
      if (level === 3) return choice(rng, `Paciente con diarrea: ${list3(signs)}. ¿Qué tipo es?`, d.t, others.map(o => ({ text: o.t, note: `Daría ${list3(take(rng, o.key, 1))}.`, misconception: 'diarrhea-type' })),
        { concept: 'fis.diarrea', slide: d.t.startsWith('Mal') ? 6 : 5, hint: 'Busca el dato que distingue: ayuno, sangre o grasa.', explain: `${d.t}.` });
      const c = pick(rng, d.c), right = `${d.t}, probablemente por ${c}`;
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con diarrea: ${list3(signs)}. ¿Tipo y causa más probable?`, right,
        [...take(rng, d.c.filter(x => x !== c), 0), ...others.map(o => ({ text: `${o.t}, probablemente por ${pick(rng, o.c)}`, note: `Esa daría ${pick(rng, o.key)}.`, misconception: 'diarrhea-type' }))],
        { concept: 'fis.diarrea', slide: d.t.startsWith('Mal') ? 6 : 5, hint: 'Primero el tipo (mecanismo); después una causa que calce.', explain: right + '.' });
    }
  };

  /* ════════ Ictericia ════════ */
  const ICT = {
    pre: { label: 'Prehepática (hemólisis)', key: ['bilirrubina no conjugada alta con orina de color normal', 'anemia con reticulocitos altos y LDH alta'], other: ['bazo grande', 'transaminasas normales', 'heces de color normal'] },
    hep: { label: 'Hepática (hepatocelular)', key: ['transaminasas sobre 1000 U/L', 'hepatitis A confirmada'], other: ['bilirrubina mixta', 'malestar y náuseas', 'INR algo prolongado'] },
    post: { label: 'Posthepática (colestásica)', key: ['coluria y acolia', 'vía biliar dilatada en la ecografía'], other: ['prurito', 'fosfatasa alcalina alta', 'bilirrubina conjugada alta'] }
  };
  const ictericia = {
    id: 'ictericia', title: 'Tipo de ictericia', mission: 'm2', concepts: ['fis.higado'],
    make(rng, level) {
      const k = pick(rng, Object.keys(ICT)), t = ICT[k], s = caseSigns(rng, t, level <= 2 ? 1 : level <= 4 ? 2 : 3);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con ictericia y ${list3(s)}. ¿Qué tipo de ictericia?`, t.label, [...Object.entries(ICT).filter(([kk]) => kk !== k).map(([, o]) => ({ text: o.label, note: `Esa daría ${pick(rng, o.key)}.`, misconception: 'jaundice-type' })), { text: 'Ictericia fisiológica (no es enfermedad)', note: 'Esa es del recién nacido; aquí hay un adulto con hallazgos anormales.' }],
        { concept: 'fis.higado', slide: 7, hint: '¿Hay coluria? ¿Bilirrubina conjugada o no conjugada? ¿Transaminasas?', explain: `${t.label}.` });
    }
  };

  /* ════════ Cirrosis y pancreatitis ════════ */
  const CIR = [['Ascitis', 'Hipertensión portal + ↓ albúmina (+ retención de Na⁺)'], ['Várices esofágicas', 'Colaterales por hipertensión portal'], ['INR prolongado', '↓ síntesis de factores de coagulación'], ['Encefalopatía hepática', 'NH₃ que el hígado no elimina'], ['Edema de piernas', '↓ albúmina (↓ presión oncótica)'], ['Esplenomegalia', 'Congestión por hipertensión portal']];
  const cirrosis = {
    id: 'cirrosis', title: 'Cirrosis y pancreatitis', mission: 'm2', concepts: ['fis.higado'],
    make(rng, level) {
      if (level >= 4 && rng() < 0.5) { const s = take(rng, ['dolor epigástrico en cinturón', 'lipasa 5 veces sobre lo normal', 'antecedente de cálculos en la vesícula', 'vómitos', 'consumo de alcohol el fin de semana'], 3);
        return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con ${s.join(', ')}. ¿Mecanismo central?`, 'Activación de tripsina dentro del páncreas → autodigestión', [{ text: 'Úlcera duodenal perforada', note: 'No explica la lipasa alta.', misconception: 'ulcer-acid' }, { text: 'Obstrucción del colédoco con ictericia hemolítica', note: 'Mezcla mecanismos.', misconception: 'jaundice-type' }, { text: 'Infarto intestinal', note: 'No explica la lipasa.' }],
          { concept: 'fis.higado', slide: 8, hint: 'Lipasa alta + dolor en cinturón.', explain: 'Pancreatitis aguda.' }); }
      const [c, m] = pick(rng, level <= 2 ? CIR.slice(0, 4) : CIR);
      const ctx = level >= 3 ? `${pick(rng, ['Hombre de 58 años con cirrosis alcohólica', 'Mujer de 61 años con cirrosis por hepatitis C'])}: ` : 'En la cirrosis, ';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${ctx}¿por qué aparece: ${c.toLowerCase()}?`, m, CIR.filter(x => x[1] !== m).map(x => ({ text: x[1], note: `Eso explica: ${x[0].toLowerCase()}.` })),
        { concept: 'fis.higado', slide: 7, hint: '¿Es por la presión portal o por lo que el hígado deja de fabricar o eliminar?', explain: m + '.' });
    }
  };

  /* ════════ Bases ════════ */
  const BILI_BANK = { topic: 'El ciclo de la bilirrubina', T: ['La bilirrubina no conjugada viaja en la sangre unida a albúmina.', 'La bilirrubina conjugada es hidrosoluble y puede salir por la orina.', 'El hígado conjuga la bilirrubina con ácido glucurónico.', 'La estercobilina da el color café a las heces.', 'En una obstrucción biliar aparece coluria y acolia.', 'En la hemólisis sube la bilirrubina no conjugada sin coluria.', 'La bilirrubina viene sobre todo de la hemoglobina de glóbulos rojos viejos.'],
    F: [['La bilirrubina no conjugada aparece en la orina.', 'va unida a albúmina y no se filtra; la de la orina es la conjugada.', 'jaundice-type'], ['La bilirrubina se conjuga en el bazo.', 'se conjuga en el hígado.', 'jaundice-type'], ['En la hemólisis aparece coluria.', 'sube la no conjugada, que no sale por la orina.', 'jaundice-type'], ['En la obstrucción biliar las heces se ponen más oscuras.', 'se ponen pálidas (acolia): la bilirrubina no llega al intestino.', 'jaundice-type'], ['La bilirrubina conjugada es liposoluble.', 'es hidrosoluble; la liposoluble es la no conjugada.', 'jaundice-type']] };
  const bili = {
    id: 'bili', title: 'Bilirrubina', mission: null, concepts: ['base.agua'],
    make(rng, level) {
      if (level >= 2) return statements(rng, level, BILI_BANK, { concept: 'base.agua', slide: 7, hint: 'No conjugada: liposoluble, con albúmina. Conjugada: hidrosoluble, sale por la orina.' });
      const Q = [['¿Cuál bilirrubina va unida a albúmina en la sangre?', 'No conjugada', ['Conjugada', 'Estercobilina', 'Urobilinógeno']], ['¿Cuál bilirrubina aparece en la orina?', 'Conjugada', ['No conjugada', 'Ambas por igual', 'Ninguna en ningún caso']], ['¿Dónde se conjuga la bilirrubina?', 'En el hígado', ['En el bazo', 'En el riñón', 'En el intestino']], ['¿Qué da el color café a las heces?', 'Estercobilina', ['Bilirrubina no conjugada', 'Biliverdina', 'Hemoglobina']]];
      const [p, r, wrongs] = pick(rng, Q);
      return choice(rng, p, r, wrongs.map(text => ({ text, note: 'Repasa el ciclo de la bilirrubina.', misconception: 'jaundice-type' })), { concept: 'base.agua', slide: 7, hint: 'La conjugada es hidrosoluble.', explain: r + '.' });
    }
  };

  const generators = [esofago, ulcera, farmacos, brecha, diarrea, ictericia, cirrosis, bili];

  /* Laboratorio "¿qué pasa si…?": casos digestivos y lo que les das. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('aine', 'Úlcera por AINE', 'PG bajas'), S('aine-ok', 'Úlcera cicatrizando', 'sin AINE + IBP'), S('hp', 'Úlcera por H. pylori', 'test de aire +'), S('hp-ok', 'H. pylori erradicado', 'baja la recurrencia'),
    S('lactosa', 'Déficit de lactasa con diarrea', 'brecha 190'), S('lactosa-ok', 'Sin lactosa', 'diarrea cesa'), S('colera', 'Cólera', 'diarrea secretora'), S('colera-ok', 'Hidratado', 'SGLT1 funcionando'),
    S('encef', 'Cirrótico con encefalopatía', 'NH₃ alto'), S('encef-ok', 'Encefalopatía mejorada', 'NH₄⁺ en el colon')
  ];
  const reagents = [['ibp', 'Suspender AINE + IBP'], ['erradicar', 'IBP + 2 antibióticos'], ['ayuno', 'Ayuno / sacar la lactosa'], ['sro', 'Sales de rehidratación oral'], ['lactulosa', 'Lactulosa'], ['aine', 'Dar más AINE']].map(([id, label]) => ({ id, label }));
  const RX = {
    'aine>ibp': ['aine-ok', 'Sin AINE vuelven las prostaglandinas; el IBP baja el ácido mientras cicatriza.'],
    'hp>erradicar': ['hp-ok', 'Al erradicar la bacteria, la úlcera casi no recurre.'],
    'lactosa>ayuno': ['lactosa-ok', 'Sin el soluto que retiene agua, la diarrea osmótica se detiene.'],
    'colera>sro': ['colera-ok', 'La glucosa arrastra Na⁺ por SGLT1 (que la toxina no bloquea) y el agua lo sigue.'],
    'encef>lactulosa': ['encef-ok', 'La lactulosa acidifica el colon: NH₃ → NH₄⁺, que no se absorbe y se elimina.']
  };
  const WHY_NOT = { aine: '¡No! Más AINE baja aún más las prostaglandinas y la defensa.', ayuno: 'El ayuno no corrige este mecanismo (en la secretora la diarrea sigue).', erradicar: 'Solo sirve si hay H. pylori.', sro: 'La rehidratación siempre ayuda, pero no corrige este mecanismo.', lactulosa: 'La lactulosa es un laxante osmótico: aquí no corresponde.', ibp: 'El IBP no corrige este mecanismo.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (fromId === 'lactosa' && rid === 'lactulosa') return { to: null, ok: false, why: '¡Empeora! La lactulosa es otro azúcar no absorbible: más diarrea osmótica.' };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'No cambia este cuadro.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['aine', 'hp', 'lactosa', 'colera', 'encef'] };

  const creatures = {
    'base.secrecion': ['Escriba', '#a07a4a'], 'base.agua': ['Niebla', '#7fa3a0'],
    'fis.esofago': ['Serpiente', '#5f9e5a'], 'fis.ulcera': ['Gólem', '#8a6fd1'], 'fis.diarrea': ['Trasgo', '#7f9a3c'], 'fis.higado': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['fis-09'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
