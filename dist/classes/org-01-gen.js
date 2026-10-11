/* Generadores de ejercicios de Aminas (etapa 8, docs/etapa-8-entrenar/SPEC.md).
   Cada generador arma una pregunta nueva a partir de una semilla y un nivel:
   1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP.
   Las respuestas se calculan desde tablas (pKa, ebullición, masas, reactivos): siempre coinciden con los datos.
   Fuentes de las tablas: diapositivas de cátedra (diap. 12, 17–28, 29–40, 44–47) y McMurry (LibreTexts) cap. 24. */
(() => {
  'use strict';
  const SRC = 'catedra-aminas';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];

  /* ── Utilidades con azar reproducible (la misma semilla da la misma pregunta) ── */
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (rng, list, n) => shuffle(rng, list).slice(0, n);
  const num = (x, d = 1) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
  const par = (x, d = 1) => (x < 0 ? `(${num(x, d)})` : num(x, d)); // un negativo dentro de una resta va entre paréntesis
  // Artículo y concordancia: casi todas son "la …amina"; estas tres son masculinas.
  const MASC = ['Pirrol', 'Imidazol', 'Amoníaco'];
  const la = x => `${MASC.includes(x.n) ? 'el' : 'la'} ${x.n.toLowerCase()}`;
  const oa = x => (MASC.includes(x.n) ? 'o' : 'a');
  const sup = n => String(n).replace(',', '.').split('').map(c => ('0123456789'.includes(c) ? '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] : c === '-' ? '⁻' : c === '.' ? '˙' : c)).join('');
  const pow10 = x => (Number.isInteger(x) ? `10${sup(x)}` : `10^${num(x)}`);
  // Pregunta de alternativas: la correcta y distractores (cada uno con su porqué). Se barajan y se quitan repetidas.
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const options = shuffle(rng, [{ text: correct, correct: true }, ...ds]);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options, ...rest };
  }
  const order = (prompt, cards, answer, extra) => ({ type: 'order', prompt, cards, answer, ...extra });
  // Afirmaciones (formato PEP): "¿cuál es correcta?", "¿cuál es INCORRECTA?" o "¿cuántas son verdaderas?". T = hechos; F = [texto, por qué es falso, error típico].
  function statements(rng, level, bank, extra) {
    if (level >= 4 && rng() < 0.4) {
      const nT = 1 + Math.floor(rng() * 3), list = shuffle(rng, [...sample(rng, bank.T, nT).map(t => [t, true]), ...sample(rng, bank.F, 4 - nT).map(f => [f[0], false, f[1]])]);
      return { type: 'number', prompt: `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}. ¿Cuántas de estas afirmaciones son verdaderas? ${list.map((x, i) => `(${i + 1}) ${x[0]}`).join(' ')}`, answer: nT, unit: '', tol: 0, label: 'verdaderas',
        traps: [{ value: 4, note: 'No todas son verdaderas: revisa cada una.' }].filter(t => t.value !== nT), solution: list.map((x, i) => `(${i + 1}) ${x[1] ? 'V' : `F: ${x[2]}`}`), ...extra, explain: `${nT} verdadera(s).` }; }
    if (level >= 3 && rng() < 0.5) { const [f, why, mis] = pick(rng, bank.F);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}: ¿cuál afirmación es INCORRECTA?`, f, sample(rng, bank.T, 3).map(t => ({ text: t, note: 'Esta es verdadera.' })), { ...extra, misconception: mis, explain: `Es falsa: ${why}` }); }
    const t = pick(rng, bank.T);
    return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}: ¿cuál afirmación es correcta?`, t, sample(rng, bank.F, 3).map(([text, why, mis]) => ({ text, note: why, misconception: mis })), { ...extra, explain: t });
  }
  const BANKS = {
    lewis: { topic: 'Estructuras de Lewis y cargas', T: ['Un N neutro con 3 enlaces tiene un par libre.', 'Un N con 4 enlaces y sin pares tiene carga +1.', 'Un O con 1 enlace y 3 pares tiene carga −1.', 'Un C con 3 enlaces y sin pares (carbocatión) tiene carga +1.', 'La carga formal es valencia − (electrones en pares + enlaces).', 'En el ion amonio el N no tiene pares libres.'],
      F: [['Un N con 4 enlaces tiene un par libre.', 'ya usó sus 5 electrones: no le queda par y lleva carga +.'], ['El O del agua no tiene pares libres.', 'tiene dos pares libres.'], ['Un C con 3 enlaces y un par libre es un carbocatión.', 'eso es un carbanión (carga −).'], ['La carga formal siempre es la del ion completo en cada átomo.', 'la carga del ion se concentra en el átomo con CF distinta de 0.']] },
    parlibre: { topic: 'El par libre del nitrógeno', T: ['El par libre del N hace que las aminas sean bases.', 'El par libre del N le permite atacar carbonos con δ+ (nucleófilo).', 'Una sal de amonio cuaternario no es básica: su N no tiene par libre.', 'El N es menos electronegativo que el O: ofrece su par con más facilidad.', 'En la anilina el par del N se deslocaliza parcialmente hacia el anillo.', 'Al protonarse, la amina queda como ion amonio R–NH₃⁺.'],
      F: [['Las aminas son ácidas porque ceden el H del N.', 'en agua actúan como bases: aceptan H⁺.', 'nh-acid'], ['Un R₄N⁺ es una base fuerte.', 'no tiene par libre: no acepta H⁺.', 'lone-pair-not-group'], ['El par libre de la anilina está totalmente localizado en el N.', 'se deslocaliza en parte hacia el anillo.', 'aromatic-more'], ['Al reaccionar con HCl, el Cl se une al N.', 'el par del N toma el H⁺; el Cl⁻ queda como contraión.', 'n-binds-cl']] },
    geometria: { topic: 'Geometría de las aminas', T: ['El N de una alquilamina es sp³.', 'Una amina tiene forma de pirámide trigonal.', 'El ángulo C–N–C en la trimetilamina es ≈ 108°.', 'Las aminas con tres grupos distintos se invierten rápido: no se separan sus enantiómeros.', 'Una sal cuaternaria con 4 grupos distintos sí puede separarse en enantiómeros.', 'El N de una amida es casi plano por resonancia con el C=O.'],
      F: [['La trimetilamina es plana con ángulos de 120°.', 'el par libre la deja piramidal (≈ 108°).', 'flat-n'], ['El N de una alquilamina es sp².', 'con 3 enlaces y un par libre es sp³.', 'lone-pair-not-group'], ['Una amina con tres grupos distintos se separa fácil en enantiómeros.', 'se invierte miles de millones de veces por segundo.', 'flat-n'], ['La forma de la molécula de NH₃ es tetraédrica.', 'los electrones están en tetraedro, pero la molécula es una pirámide.', 'tetra-shape']] },
    fisicas: { topic: 'Propiedades físicas de las aminas', T: ['Las aminas 1° y 2° forman puentes de H entre sí; las 3° no.', 'Una amina hierve más alto que un alcano de masa parecida.', 'Un alcohol hierve más alto que una amina de masa parecida.', 'Las aminas pequeñas son solubles en agua.', 'Las aminas 3° aceptan puentes de H del agua con su par libre.', 'Con más de ≈ 5 C, la solubilidad en agua baja mucho.'],
      F: [['Las aminas 3° hierven más alto que las 1° de igual masa.', 'sin N–H no hay puentes de H entre sus moléculas.', 'tertiary-donor'], ['Una amina hierve más alto que un alcohol de masa parecida.', 'el O–H forma puentes más fuertes.', 'tertiary-donor'], ['La dodecilamina es muy soluble en agua.', 'su cadena de 12 C es demasiado apolar.', 'size-solubility'], ['Las aminas 3° no pueden formar puentes de H con el agua.', 'su par libre acepta el H del agua.', 'tertiary-donor']] },
    sne: { topic: 'SN2 y E2', T: ['La SN2 ocurre en un solo paso, con ataque por detrás.', 'En la SN2 la configuración del carbono se invierte.', 'Los haluros metílicos y primarios son los mejores para la SN2.', 'Un haluro terciario con base fuerte da sobre todo E2.', 'Una base voluminosa como el tBuOK favorece la E2.', 'Los solventes polares apróticos (DMSO, DMF) aceleran la SN2 con aniones.', 'La E2 necesita el H y el grupo saliente antiperiplanares.'],
      F: [['La SN2 es más rápida con haluros terciarios.', 'el carbono terciario está demasiado impedido para el ataque por detrás.', 'overalkylation'], ['En la SN2 la configuración se conserva.', 'se invierte: el nucleófilo entra por el lado opuesto.', 'e1-not-e2'], ['El agua es el mejor solvente para una SN2 con N₃⁻.', 'los próticos solvatan al anión y lo frenan.', 'e1-not-e2'], ['La E2 ocurre en dos pasos con un carbocatión.', 'la E2 es concertada; la de dos pasos es la E1.', 'e1-not-e2'], ['El tBuOK favorece la SN2 por ser una base fuerte.', 'por ser voluminoso favorece la E2.', 'e1-not-e2']] },
    alquilacion: { topic: 'Síntesis de aminas por alquilación', T: ['El NH₃ con un haluro de alquilo da una mezcla de aminas (sobrealquilación).', 'La síntesis de Gabriel da aminas primarias limpias.', 'La vía azida (NaN₃ y luego LiAlH₄) da aminas primarias sin sobrealquilar.', 'La ftalimida se desprotona con KOH para formar el nucleófilo N⁻.', 'Gabriel necesita un haluro que haga SN2 (metílico o primario).', 'La hidrazina libera la amina al final de la síntesis de Gabriel.'],
      F: [['El NH₃ con un haluro da solo la amina primaria.', 'la amina formada también ataca: mezcla de aminas.', 'overalkylation'], ['La síntesis de Gabriel sirve con haluros terciarios.', 'necesita SN2: con terciarios hay eliminación.', 'gabriel-poly'], ['En Gabriel la amina sale sola después del SN2.', 'hay que liberarla con hidrazina.', 'gabriel-stop'], ['La azida R–N₃ vuelve a atacar al haluro y sobrealquila.', 'R–N₃ no es nucleófila: no sobrealquila.', 'overalkylation'], ['Gabriel sirve para hacer aminas secundarias.', 'da aminas primarias.', 'gabriel-poly']] },
    acilacion: { topic: 'Acilación de aminas', T: ['Las aminas 1° y 2° forman amidas con cloruros de ácido.', 'Una amina 3° no forma amida neutra: no tiene H en el N.', 'La acilación libera HCl, que hay que atrapar con más amina o piridina.', 'La amida formada ya no se acila otra vez: su par está deslocalizado.', 'La acilación de la anilina baja su reactividad frente a la SEA.'],
      F: [['Una amina 3° forma amidas igual que una 1°.', 'no tiene H en el N para quedar neutra.', 'tertiary-acylation'], ['La amida se sigue acilando hasta formar una imida.', 'su par está deslocalizado hacia el C=O.', 'tertiary-acyl'], ['La acilación de una amina da un éster.', 'da una amida; el éster sale con alcoholes.', 'tertiary-acyl'], ['La acilación no libera ningún subproducto.', 'libera HCl.', 'tertiary-acyl']] },
    hofmann: { topic: 'Eliminación de Hofmann', T: ['La eliminación de Hofmann da el alqueno menos sustituido.', 'Primero se metila el N con CH₃I en exceso.', 'El Ag₂O con agua cambia el I⁻ por OH⁻.', 'El grupo saliente es la trimetilamina.', 'La eliminación de Hofmann es una E2.', 'El grupo –N(CH₃)₃⁺ es muy voluminoso: la base toma el H más accesible.'],
      F: [['La eliminación de Hofmann da el alqueno más sustituido (Zaitsev).', 'da el menos sustituido por el grupo saliente voluminoso.', 'zaitsev-hofmann'], ['La eliminación de Hofmann es una E1.', 'es una E2.', 'e1-not-e2'], ['El grupo saliente es el NH₂⁻.', 'sale la trimetilamina después de metilar.', 'zaitsev-hofmann'], ['El Ag₂O oxida la amina.', 'solo cambia el contraión (precipita AgI).', 'zaitsev-hofmann']] }
  };

  /* ════════ 1. Clasificar aminas (Misión 1) ════════ */
  const R = [
    { f: 'CH₃–', simple: true }, { f: 'CH₃CH₂–', simple: true }, { f: 'CH₃CH₂CH₂–' }, { f: '(CH₃)₂CH–', trap: true },
    { f: '(CH₃)₃C–', trap: true }, { f: 'C₆H₅–' }, { f: 'C₆H₁₁–' }, { f: 'C₆H₅CH₂–' }
  ];
  // Cómo se escribe un grupo cuando va a la derecha del N (CH₃CH₂– → –CH₂CH₃).
  const RIGHT = { 'CH₃CH₂': 'CH₂CH₃', 'CH₃CH₂CH₂': 'CH₂CH₂CH₃', '(CH₃)₂CH': 'CH(CH₃)₂', '(CH₃)₃C': 'C(CH₃)₃', 'C₆H₅CH₂': 'CH₂C₆H₅', 'CH₃CH₂CH₂CH₂': 'CH₂CH₂CH₂CH₃' };
  const rt = f => RIGHT[f] || f;
  const TYPE = ['', 'Primaria (1°)', 'Secundaria (2°)', 'Terciaria (3°)', 'Sal de amonio cuaternario'];
  const amineText = gs => {
    const t = gs.map(g => g.f.replace(/–$/, ''));
    if (gs.length === 1) return `${t[0]}–NH₂`;
    if (gs.length === 2) return `${t[0]}–NH–${rt(t[1])}`;
    if (gs.length === 3) return `${t[0]}–N(${rt(t[1])})–${rt(t[2])}`;
    return `${t[0]}–N⁺(${rt(t[1])})(${rt(t[2])})–${rt(t[3])} Cl⁻`;
  };
  const DRUGS = [
    { n: 'anfetamina', f: 'C₆H₅–CH₂–CH(CH₃)–NH₂', k: 1 }, { n: 'metanfetamina', f: 'C₆H₅–CH₂–CH(CH₃)–NH–CH₃', k: 2 },
    { n: 'dopamina', f: '(HO)₂C₆H₃–CH₂CH₂–NH₂', k: 1 }, { n: 'efedrina', f: 'C₆H₅–CH(OH)–CH(CH₃)–NH–CH₃', k: 2 },
    { n: 'difenhidramina (un antialérgico)', f: '(C₆H₅)₂CH–O–CH₂CH₂–N(CH₃)₂', k: 3 }, { n: 'mescalina', f: '(CH₃O)₃C₆H₂–CH₂CH₂–NH₂', k: 1 },
    { n: 'colina (un nutriente)', f: 'HO–CH₂CH₂–N⁺(CH₃)₃', k: 4 }, { n: 'tramadol', f: '…–CH₂–N(CH₃)₂ (el N lleva dos metilos y la cadena)', k: 3 }
  ];
  const clasificar = {
    id: 'clasificar', title: 'Clasificar aminas', mission: 'm1', concepts: ['am.clasificacion'],
    make(rng, level) {
      const base = { concept: 'am.clasificacion', slide: 2, hint: 'Mira el N y cuenta solo los carbonos unidos directamente a él.' };
      const opts = (k, trap) => [1, 2, 3, 4].filter(x => x !== k).map(x => ({ text: TYPE[x], note: `Cuenta otra vez: el N está unido a ${k} grupo${k > 1 ? 's' : ''} de carbono.`, misconception: trap && x === 3 ? 'carbon-rule' : 'count-groups' }));
      if (level <= 3) {
        const pool = level === 1 ? R.filter(g => g.simple) : level === 2 ? R : R.filter(g => g.trap);
        const k = level === 1 ? 1 + Math.floor(rng() * 3) : level === 2 ? 1 + Math.floor(rng() * 4) : 1 + Math.floor(rng() * 3);
        const gs = Array.from({ length: k }, (_, i) => pick(rng, level === 3 && i ? R : pool));
        const prompt = level === 3 ? `¿Qué tipo de amina es ${amineText(gs)}? (Ojo: hay un carbono muy sustituido unido al N.)` : `¿Qué tipo de amina es ${amineText(gs)}?`;
        return choice(rng, prompt, TYPE[k], opts(k, level === 3), { ...base, max: level === 1 ? 2 : 3,
          explain: `El N está unido a ${k} grupo${k > 1 ? 's' : ''} de carbono${k === 4 ? ' y lleva carga +' : ''}: ${TYPE[k].toLowerCase()}.${level === 3 ? ' No importa que ese carbono sea secundario o terciario: se mira el N.' : ''}` });
      }
      if (level === 4) {
        const d = pick(rng, DRUGS);
        return choice(rng, `La ${d.n} es ${d.f}. ¿Qué tipo de amina es?`, TYPE[d.k], opts(d.k, true), { ...base, slide: 14, explain: `En la ${d.n} el N está unido a ${d.k} grupo${d.k > 1 ? 's' : ''} de carbono: ${TYPE[d.k].toLowerCase()}.` });
      }
      const set = Array.from({ length: 4 }, () => { const k = 1 + Math.floor(rng() * 3); return { k, t: amineText(Array.from({ length: k }, () => pick(rng, R))) }; });
      const want = 1 + Math.floor(rng() * 3), n = set.filter(x => x.k === want).length;
      const word = ['', 'primarias', 'secundarias', 'terciarias'][want];
      return choice(rng, `Estilo PEP: ¿cuántas de estas son aminas ${word}? ${set.map((x, i) => `(${i + 1}) ${x.t}`).join(' · ')}`, String(n),
        [0, 1, 2, 3, 4].filter(x => x !== n).map(x => ({ text: String(x), note: 'Revisa una por una cuántos carbonos tocan al N.' })), { ...base,
          explain: set.map((x, i) => `(${i + 1}) ${TYPE[x.k].toLowerCase()}`).join(' · ') + `. Son ${n} ${word}.` });
    }
  };

  /* ════════ 2. Cargas formales (bases, Misión 1) ════════ */
  const SPECIES = [
    { sp: 'NH₄⁺', at: 'N', V: 5, b: 4, lp: 0, q: 1 }, { sp: 'NH₃', at: 'N', V: 5, b: 3, lp: 1, q: 0 }, { sp: 'NH₂⁻', at: 'N', V: 5, b: 2, lp: 2, q: -1 },
    { sp: 'H₃O⁺', at: 'O', V: 6, b: 3, lp: 1, q: 1 }, { sp: 'H₂O', at: 'O', V: 6, b: 2, lp: 2, q: 0 }, { sp: 'OH⁻', at: 'O', V: 6, b: 1, lp: 3, q: -1 },
    { sp: 'CH₃⁺ (carbocatión)', at: 'C', V: 4, b: 3, lp: 0, q: 1 }, { sp: 'CH₃⁻ (carbanión)', at: 'C', V: 4, b: 3, lp: 1, q: -1 },
    { sp: 'CH₃–NH₃⁺ (metilamonio)', at: 'N', V: 5, b: 4, lp: 0, q: 1 }, { sp: 'CH₃COO⁻ (acetato), el O con un solo enlace', at: 'O', V: 6, b: 1, lp: 3, q: -1 },
    { sp: '(CH₃)₂C=NH₂⁺ (ion iminio)', at: 'N', V: 5, b: 4, lp: 0, q: 1 }, { sp: 'C₆H₅–N⁺≡N (diazonio), el N unido al anillo', at: 'N', V: 5, b: 4, lp: 0, q: 1, hard: true },
    { sp: 'C₆H₅–N⁺≡N (diazonio), el N de la punta', at: 'N', V: 5, b: 3, lp: 1, q: 0, hard: true }, { sp: 'R–NO₂ (nitro), el N', at: 'N', V: 5, b: 4, lp: 0, q: 1, hard: true },
    { sp: 'R–NO₂ (nitro), el O con enlace simple', at: 'O', V: 6, b: 1, lp: 3, q: -1, hard: true }, { sp: 'CH₃–C(=O)–NH₂ (amida), el N', at: 'N', V: 5, b: 3, lp: 1, q: 0, hard: true }
  ];
  const qText = q => (q > 0 ? `+${q}` : q < 0 ? `−${-q}` : '0');
  const carga = {
    id: 'carga', title: 'Cargas formales', mission: 'm1', concepts: ['base.carga'],
    make(rng, level) {
      const s = pick(rng, SPECIES.filter(x => (level >= 4 ? x.hard : !x.hard)));
      const base = { concept: 'base.carga', slide: 5, hint: 'Carga formal = electrones de valencia − (electrones de pares libres + enlaces).' };
      const ds = [-1, 0, 1, 2].filter(x => x !== s.q).map(x => ({ text: qText(x), note: `Cuenta: ${s.V} − (${s.lp * 2} + ${s.b}) = ${qText(s.q)}.` }));
      const how = `${s.V} − (${s.lp * 2} + ${s.b}) = ${qText(s.q)}`;
      if (level === 1) { const CFG = [['N', 5, [[4, 0], [3, 1], [2, 2]]], ['O', 6, [[3, 1], [2, 2], [1, 3]]], ['C', 4, [[4, 0], [3, 0], [3, 1]]], ['S', 6, [[2, 2], [3, 1], [1, 3]]], ['B', 3, [[3, 0], [4, 0]]], ['Cl', 7, [[1, 3], [0, 4]]]];
        const [at, V, opts] = pick(rng, CFG), [b, lp] = pick(rng, opts), q = V - (2 * lp + b);
        return choice(rng, `Un átomo de ${at} (trae ${V} electrones de valencia) tiene ${b} enlace${b === 1 ? '' : 's'} y ${lp} par${lp === 1 ? '' : 'es'} libre${lp === 1 ? '' : 's'}. ¿Su carga formal?`, qText(q), [-1, 0, 1, 2].filter(x => x !== q).map(x => ({ text: qText(x), note: `Cuenta: ${V} − (${lp * 2} + ${b}) = ${qText(q)}.` })), { ...base, explain: `CF = ${V} − (${lp * 2} + ${b}) = ${qText(q)}.` }); }
      if (level === 4 && rng() < 0.4) return statements(rng, 4, BANKS.lewis, base);
      if ((level === 3 || level === 2) && rng() < 0.5) { const four = sample(rng, SPECIES.filter(x => !x.hard), 4), tq = pick(rng, [1, 0, -1].filter(q => four.filter(x => x.q === q).length === 1));
        if (tq !== undefined) { const right = four.find(x => x.q === tq);
          return choice(rng, `¿En cuál de estas especies el átomo indicado tiene carga formal ${qText(tq)}?`, `${right.sp} (el ${right.at})`, four.filter(x => x !== right).map(x => ({ text: `${x.sp} (el ${x.at})`, note: `CF = ${x.V} − (${x.lp * 2} + ${x.b}) = ${qText(x.q)}.` })), { ...base, explain: `${right.sp}: CF del ${right.at} = ${qText(tq)}.` }); } }
      if (level === 2) return choice(rng, `En ${s.sp}, el ${s.at} tiene ${s.b} enlaces y ${s.lp} par${s.lp === 1 ? '' : 'es'} libre${s.lp === 1 ? '' : 's'}. ¿Qué carga formal tiene?`, qText(s.q), ds, { ...base, explain: `CF = ${how}.` });
      if (level <= 4) return choice(rng, `¿Qué carga formal tiene el ${s.at} en ${s.sp}?`, qText(s.q), ds, { ...base, explain: `El ${s.at} tiene ${s.b} enlaces y ${s.lp} par${s.lp === 1 ? '' : 'es'} libre${s.lp === 1 ? '' : 's'}: CF = ${how}.` });
      const ion = pick(rng, [{ t: 'CH₃–NH₃⁺', a: 'el N', why: 'El N tiene 4 enlaces y ningún par libre: 5 − 4 = +1.', d: ['un H', 'el C'] },
        { t: '(CH₃)₂C=NH₂⁺ (ion iminio)', a: 'el N', why: 'El N tiene 4 enlaces (doble con el C y dos H) y ningún par: +1. El C tiene sus 4 enlaces: 0.', d: ['el C del doble enlace', 'un CH₃'] },
        { t: 'C₆H₅–N⁺≡N', a: 'el N unido al anillo', why: 'Ese N tiene 4 enlaces (uno al anillo y tres al otro N) y ningún par: +1. El N de la punta tiene 3 enlaces y un par: 0.', d: ['el N de la punta', 'el C del anillo'] },
        { t: 'CH₃COO⁻', a: 'el O con enlace simple', why: 'Ese O tiene 1 enlace y 3 pares: 6 − 7 = −1. El O del C=O tiene 2 enlaces y 2 pares: 0.', d: ['el O del C=O', 'el C del carbonilo'] }]);
      return choice(rng, `Estilo PEP: en ${ion.t}, ¿qué átomo lleva la carga?`, ion.a, ion.d.map(t => ({ text: t, note: ion.why })), { ...base, explain: ion.why });
    }
  };

  /* ════════ 3. Nombrar aminas (Misión 2) ════════ */
  const ALK = [{ n: 'metil', f: 'CH₃' }, { n: 'etil', f: 'CH₃CH₂' }, { n: 'propil', f: 'CH₃CH₂CH₂' }];
  const MULT = ['', '', 'di', 'tri'];
  const commonName = gs => { // alquilaminas: orden alfabético, con di/tri (se ordena sin el prefijo)
    const counts = {}; gs.forEach(g => { counts[g.n] = (counts[g.n] || 0) + 1; });
    return Object.keys(counts).sort().map(n => MULT[counts[n]] + n).join('') + 'amina';
  };
  const condensed = gs => (gs.length === 1 ? `${gs[0].f}–NH₂` : gs.length === 2 ? `${gs[0].f}–NH–${rt(gs[1].f)}` : `${gs[0].f}–N(${rt(gs[1].f)})–${rt(gs[2].f)}`);
  const ANIL = [{ s: 'Cl', n: 'cloro' }, { s: 'NO₂', n: 'nitro' }, { s: 'CH₃', n: 'metil' }, { s: 'Br', n: 'bromo' }, { s: 'OCH₃', n: 'metoxi' }];
  const POS = [{ p: 'orto', n: 2 }, { p: 'meta', n: 3 }, { p: 'para', n: 4 }];
  const AMINOALC = [{ f: 'H₂N–CH₂CH₂–OH', n: '2-aminoetanol', bad: '2-hidroxietanamina' }, { f: 'H₂N–CH₂CH₂CH₂–OH', n: '3-aminopropan-1-ol', bad: '3-hidroxipropan-1-amina' },
    { f: 'CH₃–CH(NH₂)–CH₂–OH', n: '2-aminopropan-1-ol', bad: '1-hidroxipropan-2-amina' }, { f: 'H₂N–CH₂CH₂CH₂CH₂–OH', n: '4-aminobutan-1-ol', bad: '4-hidroxibutan-1-amina' }];
  const nombrar = {
    id: 'nombrar', title: 'Nombrar alquilaminas', mission: 'm2', concepts: ['am.nombres'],
    make(rng, level) {
      const base = { concept: 'am.nombres', slide: 8, hint: 'Grupos en orden alfabético (sin contar di- ni tri-), y di/tri si se repiten. En IUPAC, los grupos sobre el N llevan "N-".' };
      if (level === 1) {
        const g = pick(rng, [...ALK, { n: 'butil', f: 'CH₃CH₂CH₂CH₂' }, { n: 'isopropil', f: '(CH₃)₂CH' }, { n: 'ciclohexil', f: 'C₆H₁₁' }, { n: 'bencil', f: 'C₆H₅CH₂' }]);
        return choice(rng, `¿Cómo se llama ${g.f}–NH₂?`, `${g.n}amina`, [{ text: `${g.n}amida`, note: 'Amida es otro grupo funcional (lleva C=O).' }, { text: `amino${g.n}`, note: 'El nombre común es: grupo + "amina".' }, { text: `di${g.n}amina`, note: 'Hay un solo grupo en el N.', misconception: 'forgot-di' }], { ...base, slide: 6, explain: `Un grupo ${g.n} en el N: ${g.n}amina.` });
      }
      if (level <= 3) {
        const k = level;
        let gs = Array.from({ length: k }, () => pick(rng, ALK));
        if (level === 2 && rng() < 0.5) gs = [gs[0], gs[0]];
        const right = commonName(gs), names = [...new Set(gs.map(g => g.n))];
        const ds = [];
        if (names.length === 1 && k > 1) ds.push({ text: names[0].repeat(k) + 'amina', note: 'Si un grupo se repite se usa di- o tri-.', misconception: 'forgot-di' });
        if (names.length > 1) ds.push({ text: [...names].sort().reverse().map(n => (gs.filter(g => g.n === n).length > 1 ? MULT[gs.filter(g => g.n === n).length] : '') + n).join('') + 'amina', note: 'Los grupos van en orden alfabético: etil antes que metil, metil antes que propil.', misconception: 'alpha-order' });
        ds.push({ text: commonName(gs.map(g => (g.n === 'metil' ? ALK[1] : ALK[0]))), note: 'Revisa cuántos carbonos tiene cada grupo.' });
        ds.push({ text: k === 1 ? `${gs[0].n}amida` : `${MULT[k] || ''}${names[0]}amina`, note: k === 1 ? 'Amida es otro grupo funcional (lleva C=O).' : 'Cuenta todos los grupos distintos.' });
        return choice(rng, `¿Cómo se llama ${condensed(gs)}?`, right, ds, { ...base, explain: `Grupos: ${gs.map(g => g.n).join(', ')}. En orden alfabético y con di/tri: ${right}.` });
      }
      const chain = pick(rng, [{ f: 'CH₃CH₂CH₂', n: 'propan-1-amina', alk: 'propil' }, { f: 'CH₃CH₂CH₂CH₂', n: 'butan-1-amina', alk: 'butil' }, { f: 'CH₃CH₂CH₂CH₂CH₂', n: 'pentan-1-amina', alk: 'pentil' },
        { f: 'CH₃CH₂CH(CH₃)', n: 'butan-2-amina', alk: 'sec-butil' }, { f: 'CH₃CH₂CH₂CH(CH₃)', n: 'pentan-2-amina', alk: 'pentan-2-il' }]);
      const subs = level === 4 ? [{ n: 'N-metil', f: '–NH–CH₃', bad: '1-metil', alt: 'N,N-metil', parent: 'metanamina' }, { n: 'N,N-dimetil', f: '–N(CH₃)₂', bad: '1,1-dimetil', alt: 'N-dimetil', parent: 'metanamina' },
        { n: 'N-etil', f: '–NH–CH₂CH₃', bad: '1-etil', alt: 'N,N-etil', parent: 'etanamina' }]
        : [{ n: 'N-etil-N-metil', f: '–N(CH₃)–CH₂CH₃', bad: '1-etil-1-metil', alt: 'N-metil-N-etil', parent: 'etanamina' }, { n: 'N,N-dietil', f: '–N(CH₂CH₃)₂', bad: '1,1-dietil', alt: 'N-dietil', parent: 'etanamina' },
          { n: 'N-etil-N-metil', f: '–N(CH₂CH₃)–CH₃', bad: '1-etil-1-metil', alt: 'N-metil-N-etil', parent: 'etanamina' }];
      const sub = pick(rng, subs), right = `${sub.n}${chain.n}`;
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Nombre IUPAC (alcanamina) de ${chain.f}${sub.f}:`, right, [
        { text: `${sub.bad}${chain.n}`, note: 'Los grupos sobre el N llevan el localizador N, no un número.', misconception: 'n-locant' },
        { text: `N-${chain.alk}${sub.parent}`, note: 'La cadena principal es la más larga: los grupos más chicos van como N-sustituyentes.', misconception: 'parent-complex' },
        { text: `${sub.alt}${chain.n}`, note: sub.n.includes('-N-') ? 'Los sustituyentes van en orden alfabético: etil antes que metil.' : sub.n.startsWith('N,N') ? 'Con dos grupos iguales en el N se escribe N,N-di…' : 'Un solo grupo en el N: un solo N.', misconception: sub.n.includes('-N-') ? 'alpha-order' : sub.n.startsWith('N,N') ? 'forgot-di' : undefined }],
        { ...base, explain: `Cadena principal (la más larga): ${chain.n}. Grupos en el N: ${sub.n}. Nombre: ${right}.` });
    }
  };
  const PRIOR = [{ f: 'H₂N–CH₂CH₂–OH', n: '2-aminoetan-1-ol', bad: '2-hidroxietan-1-amina' }, { f: 'H₂N–CH₂CH₂CH₂–OH', n: '3-aminopropan-1-ol', bad: '3-hidroxipropan-1-amina' },
    { f: 'CH₃–CH(NH₂)–CH₂–OH', n: '2-aminopropan-1-ol', bad: '1-hidroxipropan-2-amina' }, { f: 'H₂N–CH₂CH₂CH₂CH₂–OH', n: '4-aminobutan-1-ol', bad: '4-hidroxibutan-1-amina' },
    { f: 'CH₃–CO–CH₂–NH₂', n: '1-aminopropan-2-ona', bad: '2-oxopropan-1-amina' }, { f: 'H₂N–CH₂CH₂–CO–CH₃', n: '4-aminobutan-2-ona', bad: '3-oxobutan-1-amina' }];
  const nombrarAril = {
    id: 'nombrarAril', title: 'Anilinas y prioridad', mission: 'm2', concepts: ['am.nombres-aril'],
    make(rng, level) {
      const base = { concept: 'am.nombres-aril', slide: 7, hint: 'El C del NH₂ es el 1. Orto = 2, meta = 3, para = 4. Un grupo sobre el N lleva "N-".' };
      if (level === 1) {
        const ps = pick(rng, POS), txt = { 2: '2 (o 6)', 3: '3 (o 5)', 4: '4' };
        if (rng() < 0.5) { const nn = pick(rng, [[2, 'orto'], [6, 'orto'], [3, 'meta'], [5, 'meta'], [4, 'para']]);
          return choice(rng, `En la anilina (NH₂ en el C1), un grupo en el C${nn[0]} está en posición…`, nn[1], ['orto', 'meta', 'para'].filter(x => x !== nn[1]).map(x => ({ text: x, note: 'Orto = 2 o 6, meta = 3 o 5, para = 4.' })), { ...base, explain: `C${nn[0]} = ${nn[1]}.` }); }
        return choice(rng, `En la anilina, el carbono unido al NH₂ es el 1. ¿Qué número tiene la posición ${ps.p}?`, txt[ps.n], POS.filter(x => x !== ps).map(x => ({ text: txt[x.n], note: `Esa es ${x.p}. Orto = 2, meta = 3, para = 4.` })).concat([{ text: '1', note: 'El 1 es el carbono del NH₂.' }]), { ...base, explain: `${ps.p} = posición ${txt[ps.n]}.` });
      }
      if (level === 2) {
        const sb = pick(rng, ANIL), ps = pick(rng, POS), right = `${ps.n}-${sb.n}anilina`;
        return choice(rng, `Anilina con un grupo ${sb.s} en posición ${ps.p}. ¿Su nombre?`, right,
          POS.filter(x => x.n !== ps.n).map(x => ({ text: `${x.n}-${sb.n}anilina`, note: `${ps.p} es la posición ${ps.n}: orto 2, meta 3, para 4.` }))
            .concat([{ text: `N-${sb.n}anilina`, note: '"N-" es para un grupo unido al nitrógeno; este está en el anillo.', misconception: 'n-locant' }]), { ...base, explain: `${ps.p} = posición ${ps.n}: ${right}.` });
      }
      if (level === 3) {
        const g = pick(rng, [{ n: 'metil', f: 'CH₃' }, { n: 'etil', f: 'CH₂CH₃' }]);
        if (rng() < 0.5) return choice(rng, `¿Cómo se llama C₆H₅–NH–${g.f}?`, `N-${g.n}anilina`, [{ text: `4-${g.n}anilina`, note: '4- sería un grupo en el anillo; aquí está en el N.', misconception: 'n-locant' }, { text: `1-${g.n}anilina`, note: 'El grupo está en el N: se indica con "N-".', misconception: 'n-locant' }, { text: `bencil${g.n}amina`, note: 'Bencilo es C₆H₅CH₂–; aquí el anillo está unido directo al N.' }], { ...base, explain: `El ${g.n} está sobre el N: N-${g.n}anilina.` });
        const ps = pick(rng, POS);
        return choice(rng, `¿Cómo se llama ${g.f}–C₆H₄–NH₂ (el ${g.n} en ${ps.p})?`, `${ps.n}-${g.n}anilina`, [{ text: `N-${g.n}anilina`, note: 'N- sería sobre el nitrógeno; este grupo está en el anillo.', misconception: 'n-locant' }, ...POS.filter(x => x !== ps).map(x => ({ text: `${x.n}-${g.n}anilina`, note: `${ps.p} es ${ps.n}.` }))], { ...base, explain: `Grupo en el anillo, en ${ps.p} (${ps.n}): ${ps.n}-${g.n}anilina.` });
      }
      if (level === 4) {
        const a = pick(rng, PRIOR), ol = a.n.endsWith('ol');
        return choice(rng, `Nombra ${a.f}.`, a.n, [{ text: a.bad, note: `${ol ? 'El –OH' : 'La cetona'} tiene más prioridad que la amina: da el sufijo y el NH₂ va como "amino".`, misconception: 'amine-priority' },
          { text: a.n.replace('amino', 'amina'), note: 'El NH₂ como prefijo se llama "amino".' }, { text: a.n.replace(/^\d-/, m => (m === '1-' ? '2-' : '1-')), note: 'Revisa el localizador del NH₂.' }],
          { ...base, slide: 6, hint: '¿Quién tiene más prioridad: el alcohol, la cetona o la amina?', explain: `${ol ? 'El –OH' : 'La cetona'} manda (sufijo); la amina va como prefijo: ${a.n}.` });
      }
      // Nivel PEP: anilina con dos sustituyentes (orden alfabético y localizadores más bajos).
      const [x, y] = sample(rng, ANIL, 2).sort((p, q) => p.n.localeCompare(q.n));
      const combo = pick(rng, [{ t: 'orto y para', a: 2, b: 4, sym: false }, { t: 'meta y para', a: 3, b: 4, sym: false }, { t: 'las dos posiciones meta', a: 3, b: 5, sym: true }, { t: 'las dos posiciones orto', a: 2, b: 6, sym: true }]);
      const swap = !combo.sym && rng() < 0.5; // cuál va en cada posición
      const [px, py] = combo.sym ? [combo.a, combo.b] : swap ? [combo.b, combo.a] : [combo.a, combo.b];
      const where = combo.sym ? `${x.s} y ${y.s} en ${combo.t}` : `${x.s} en ${['', '', 'orto', 'meta', 'para'][px]} y ${y.s} en ${['', '', 'orto', 'meta', 'para'][py]}`;
      const right = `${px}-${x.n}-${py}-${y.n}anilina`;
      return choice(rng, `Estilo PEP: anilina con ${where}. ¿Su nombre?`, right, [
        { text: `${py}-${y.n}-${px}-${x.n}anilina`, note: 'Los sustituyentes se citan en orden alfabético.', misconception: 'alpha-order' },
        { text: combo.sym ? `${py}-${x.n}-${px}-${y.n}anilina` : `${py}-${x.n}-${px}-${y.n}anilina`, note: combo.sym ? 'Si hay empate, el número más bajo va para el primero en orden alfabético.' : 'Revisa qué grupo está en cada posición.' },
        { text: `N-${x.n}-${py}-${y.n}anilina`, note: '"N-" es solo para grupos sobre el nitrógeno.', misconception: 'n-locant' }],
        { ...base, hint: 'NH₂ en el 1. Orden alfabético; con empate de números, el más bajo al primero del alfabeto.', explain: `NH₂ = 1; ${x.n} en ${px} y ${y.n} en ${py}, en orden alfabético: ${right}.` });
    }
  };

  /* ════════ 4–5. Basicidad: tabla de pKa del ion amonio (pKaH, en agua a 25 °C) ════════ */
  const PKA = [
    { n: 'Acetamida (amida)', k: -0.5, why: 'par del N deslocalizado hacia el C=O' }, { n: 'Pirrol', k: -3.8, why: 'su par es parte del sexteto aromático' },
    { n: 'p-Nitroanilina', k: 1.0, why: 'el –NO₂ atrae el par por resonancia' }, { n: 'p-Cloroanilina', k: 4.0, why: 'el Cl atrae un poco' },
    { n: 'Anilina', k: 4.6, why: 'par deslocalizado en el anillo' }, { n: 'p-Toluidina (p-metilanilina)', k: 5.1, why: 'el CH₃ dona un poco' },
    { n: 'Piridina', k: 5.2, why: 'N sp², par fuera del anillo' }, { n: 'Imidazol', k: 7.0, why: 'N sp² estabilizado por resonancia' },
    { n: 'Morfolina', k: 8.4, why: 'amina 2° con un O que atrae' }, { n: 'Amoníaco', k: 9.25, why: 'sin grupos donadores' },
    { n: 'Bencilamina', k: 9.3, why: 'N sp³; el anillo no está unido al N' }, { n: 'Trimetilamina', k: 9.8, why: 'su ion se solvata peor en agua' },
    { n: 'Ciclohexilamina', k: 10.6, why: 'alquilamina, par localizado' }, { n: 'Metilamina', k: 10.66, why: 'alquilamina 1°' },
    { n: 'Dimetilamina', k: 10.73, why: 'alquilamina 2°: el mejor balance en agua' }, { n: 'Trietilamina', k: 10.75, why: 'alquilamina 3°' },
    { n: 'Etilamina', k: 10.8, why: 'alquilamina 1°' }, { n: 'Dietilamina', k: 11.0, why: 'alquilamina 2°' },
    { n: 'Piperidina', k: 11.1, why: 'amina 2° cíclica, N sp³' }, { n: 'Pirrolidina', k: 11.3, why: 'amina 2° cíclica, N sp³' }
  ];
  const ALKYL = new Set(['Trimetilamina', 'Ciclohexilamina', 'Metilamina', 'Dimetilamina', 'Trietilamina', 'Etilamina', 'Dietilamina', 'Piperidina', 'Pirrolidina']);
  // n compuestos con al menos "gap" unidades de pKa entre sí. "reason": sin tabla, solo contrastes que se pueden razonar
  // (sin morfolina ni imidazol, y a lo más una alquilamina: entre ellas las diferencias son muy chicas para deducirlas).
  const spaced = (rng, n, gap, reason = false, from = PKA) => {
    const pool = reason ? from.filter(x => !['Morfolina', 'Imidazol'].includes(x.n)) : from;
    for (let t = 0; t < 400; t++) {
      const s = sample(rng, pool, n).sort((a, b) => a.k - b.k);
      if (s.every((x, i) => !i || x.k - s[i - 1].k >= gap) && (!reason || s.filter(x => ALKYL.has(x.n)).length <= 1)) return s;
    }
    const safe = ['Pirrol', 'p-Nitroanilina', 'Anilina', 'Piridina', 'Amoníaco', 'Piperidina', 'Etilamina'].map(n => pool.find(x => x.n === n)).filter(Boolean);
    const spread = safe.filter((x, i) => !i || x.k - safe[i - 1].k >= Math.min(gap, 1)); // respaldo: los más separados del grupo
    return spread.length >= n ? spread.filter((_, i) => i % Math.max(1, Math.floor(spread.length / n)) === 0).slice(0, n) : spread.slice(0, n);
  };
  const pkTxt = x => num(x.k, x.k % 1 ? (String(x.k).split('.')[1].length > 1 ? 2 : 1) : 0);
  const basicidad = {
    id: 'basicidad', title: 'Ordenar por basicidad', mission: 'm5', concepts: ['am.orden', 'am.resonancia', 'am.heterociclos'],
    make(rng, level, want = 'am.orden') {
      // Resonancia: anilinas, amida y pirrol frente a una referencia. Heterociclos: N sp³, sp² y del pirrol.
      const POOL = { 'am.resonancia': ['Acetamida (amida)', 'Pirrol', 'p-Nitroanilina', 'p-Cloroanilina', 'Anilina', 'p-Toluidina (p-metilanilina)', 'Amoníaco', 'Ciclohexilamina', 'Bencilamina'],
        'am.heterociclos': ['Pirrol', 'Piridina', 'Imidazol', 'Piperidina', 'Pirrolidina', 'Anilina', 'Amoníaco', 'Morfolina'] }[want];
      const pool = POOL ? PKA.filter(x => POOL.includes(x.n)) : PKA;
      const slide = { 'am.resonancia': 23, 'am.heterociclos': 26 }[want] || 28;
      const base = { concept: want, slide, hint: 'Mayor pKa del ion amonio = más básica. Sin números: resonancia, hibridación y grupos que donan o atraen.' };
      const list = s => s.map(x => `${x.n} (${pkTxt(x)})`).join(' < ');
      if (level === 1) {
        const three = spaced(rng, 3, 1.0, false, pool), most = rng() < 0.6, tgt = most ? three[2] : three[0];
        return choice(rng, `¿Cuál es la ${most ? 'MÁS' : 'MENOS'} básica? ${shuffle(rng, three).map(x => `${x.n} (pKaH ${pkTxt(x)})`).join(', ')}`, tgt.n, three.filter(x => x !== tgt).map(x => ({ text: x.n, note: `pKaH ${pkTxt(x)}: mayor pKa del ion amonio = base más fuerte.`, misconception: 'pka-inverted' })),
          { ...base, explain: `${tgt.n} tiene el pKaH ${most ? 'mayor' : 'menor'} (${pkTxt(tgt)}): es la ${most ? 'más' : 'menos'} básica.` });
      }
      const n = level <= 3 ? 3 : 4, gap = [0, 0, 0.3, 2.0, 1.0, 0.6][level], show = level === 2, s = spaced(rng, n, POOL && level >= 4 ? 0.6 : gap, !show, pool);
      const cards = shuffle(rng, s).map((x, i) => [`c${i}`, show ? `${x.n} (pKaH ${pkTxt(x)})` : x.n, x]);
      const answer = s.map(x => cards.find(c => c[2] === x)[0]);
      return order(`${level === 5 ? 'Estilo PEP (pregunta 3): ' : ''}Ordena de menor a mayor basicidad${show ? '' : ' (sin tabla: razónalo)'}.`, cards.map(([id, text]) => ({ id, text })), answer,
        { ...base, direction: 'De menor a mayor basicidad.', explain: `${list(s)}. ${s.map(x => `${x.n}: ${x.why}`).join('; ')}.` });
    }
  };

  /* ════════ 6. Basicidad con números: pKa, pKb y Ka (Misión 4) ════════ */
  const pkaGen = {
    id: 'pka', title: 'pKa, pKb y Ka', mission: 'm4', concepts: ['am.pka'],
    make(rng, level) {
      const base = { concept: 'am.pka', slide: 20, hint: 'pKa + pKb = 14. Mayor pKaH (o menor pKb) = base más fuerte.' };
      const [a, b] = spaced(rng, 2, 1.0);
      if (level === 1) return choice(rng, `La amina A tiene pKaH ${pkTxt(a)} y la B ${pkTxt(b)}. ¿Cuál es más básica?`, 'B', [{ text: 'A', note: 'Al revés: mayor pKaH = base más fuerte.', misconception: 'pka-inverted' }, { text: 'Iguales', note: `Difieren en ${num(b.k - a.k)} unidades de pKa.` }], { ...base, explain: `B (${pkTxt(b)}) > A (${pkTxt(a)}).` });
      if (level === 2) {
        const pkb = Math.round((14 - b.k) * 10) / 10;
        return choice(rng, `Una amina tiene pKb ${num(pkb)}. ¿Cuál es el pKa de su ion amonio?`, num(14 - pkb), [{ text: num(pkb), note: 'Ese es el pKb; el pKa del ion es 14 − pKb.' }, { text: num(14 + pkb), note: 'Se resta: pKa = 14 − pKb.', misconception: 'sum14' }, { text: num(pkb - 14 < 0 ? 14 - pkb + 1 : pkb + 1), note: 'Revisa la resta.' }], { ...base, explain: `pKa = 14 − ${num(pkb)} = ${num(14 - pkb)}.` });
      }
      if (level === 3) {
        const e = Math.round(b.k), m = (10 ** (e - b.k)).toFixed(1);
        return choice(rng, `El ion amonio de una amina tiene Ka = ${num(m)} × 10${sup(-e)}. ¿Su pKa es aproximadamente…?`, num(b.k, 1), [{ text: num(-b.k, 1), note: 'pKa = −log Ka: sale positivo.' }, { text: num(e + 1, 1), note: 'Revisa la mantisa: log(' + num(m) + ') ≠ 0.' }, { text: num(14 - b.k, 1), note: 'Ese sería el pKb.' }], { ...base, slide: 20, explain: `pKa = −log(${num(m)} × 10${sup(-e)}) ≈ ${num(b.k, 1)}.` });
      }
      if (level === 4) {
        const pkbA = Math.round((14 - a.k) * 10) / 10;
        return choice(rng, `La amina A tiene pKb ${num(pkbA)}; la B tiene pKaH ${pkTxt(b)}. ¿Cuál es más básica?`, 'B', [{ text: 'A', note: `Pasa A a pKaH: 14 − ${num(pkbA)} = ${num(14 - pkbA)}, menor que ${pkTxt(b)}.`, misconception: 'sum14' }, { text: 'No se puede comparar', note: 'Sí se puede: convierte con pKa + pKb = 14.' }], { ...base, explain: `A: pKaH = 14 − ${num(pkbA)} = ${num(14 - pkbA)}. B: ${pkTxt(b)}. B es más básica.` });
      }
      const s = spaced(rng, 4, 0.8), mixed = shuffle(rng, s).map((x, i) => { const asPkb = i % 2 === 1; return { x, txt: asPkb ? `${x.n} (pKb ${num(Math.round((14 - x.k) * 10) / 10)})` : `${x.n} (pKaH ${pkTxt(x)})` }; });
      const cards = mixed.map((m, i) => ({ id: `c${i}`, text: m.txt }));
      return order('Estilo PEP: ordena de menor a mayor basicidad (ojo: unos datos son pKaH y otros pKb).', cards, s.map(x => `c${mixed.findIndex(m => m.x === x)}`),
        { ...base, direction: 'De menor a mayor basicidad.', explain: `Pasando todo a pKaH: ${s.map(x => `${x.n} ${pkTxt(x)}`).join(' < ')}.` });
    }
  };

  /* ════════ 7. Equilibrio ácido–base y extracción (Misiones 3 y 4) ════════ */
  const ACIDS = [{ n: 'HCl', k: -7 }, { n: 'ácido fórmico', k: 3.75 }, { n: 'ácido benzoico', k: 4.2 }, { n: 'ácido acético', k: 4.76 }, { n: 'ácido carbónico', k: 6.35 }, { n: 'fenol', k: 10.0 }, { n: 'agua', k: 15.7 }];
  const PCT = [{ d: -2, t: 'Más del 99 % protonada' }, { d: -1, t: 'Cerca del 91 % protonada' }, { d: 0, t: 'La mitad (50 %) protonada' }, { d: 1, t: 'Cerca del 9 % protonada' }, { d: 2, t: 'Menos del 1 % protonada' }];
  const DRUGS_PK = [{ n: 'lidocaína', k: 7.9 }, { n: 'codeína', k: 8.2 }, { n: 'anfetamina', k: 9.9 }, { n: 'procaína', k: 9.0 }, { n: 'efedrina', k: 9.6 }];
  const equilibrio = {
    id: 'equilibrio', title: 'Equilibrio ácido–base', mission: 'm4', concepts: ['am.equilibrio'],
    make(rng, level) {
      const base = { concept: 'am.equilibrio', slide: 17, hint: 'Gana el lado del ácido más débil (pKa mayor). Keq = 10^(pKa del ácido producto − pKa del reactivo).' };
      const am = pick(rng, PKA.filter(x => x.k > 3)), ac = pick(rng, ACIDS.filter(x => Math.abs(am.k - x.k) >= (level === 1 ? 3 : 1)));
      const d = Math.round((am.k - ac.k) * 10) / 10;
      if (level === 1) { const right = d > 0;
        return choice(rng, `${ac.n} (pKa ${num(ac.k)}) + ${am.n.toLowerCase()} (pKaH ${pkTxt(am)}). ¿Hacia dónde va el equilibrio?`, right ? 'Hacia la derecha: la amina se protona' : 'Hacia la izquierda: casi no reacciona',
          [{ text: right ? 'Hacia la izquierda: casi no reacciona' : 'Hacia la derecha: la amina se protona', note: 'Compara los dos ácidos: gana el lado del más débil (pKa mayor).', misconception: 'strong-side' }, { text: 'Queda mitad y mitad', note: `Los pKa difieren en ${num(Math.abs(d))} unidades.` }], { ...base, explain: `El ácido más débil es ${right ? `el ion amonio (${pkTxt(am)})` : `${ac.n} (${num(ac.k)})`}: gana ese lado.` }); }
      if (level === 2) return choice(rng, `${ac.n} (pKa ${num(ac.k)}) + ${am.n.toLowerCase()} (pKaH ${pkTxt(am)}). ¿Cuánto vale Keq?`, pow10(d), [{ text: pow10(-d), note: 'Va al revés: pKa del ácido producto (el ion amonio) menos el del reactivo.' }, { text: num(d), note: 'La diferencia es el exponente: Keq = 10 elevado a esa diferencia.' }, { text: pow10(Math.round((am.k + ac.k) * 10) / 10), note: 'Se restan los pKa, no se suman.' }], { ...base, explain: `Keq = 10^(${pkTxt(am)} − ${par(ac.k)}) = ${pow10(d)}.` });
      if (level === 3) {
        const p = pick(rng, PCT), ph = Math.round((am.k + p.d) * 10) / 10;
        return choice(rng, `${am.n} (pKaH ${pkTxt(am)}) en una solución a pH ${num(ph)}. ¿Qué fracción está protonada?`, p.t, PCT.filter(x => x !== p).map(x => ({ text: x.t, note: `pH − pKa = ${num(p.d, 0)}: cada unidad es un factor 10 (Henderson-Hasselbalch).` })),
          { ...base, hint: 'Si pH = pKa, mitad y mitad. Cada unidad de pH bajo el pKa multiplica por 10 la forma protonada.', explain: `pH − pKa = ${num(p.d, 0)} → ${p.t.toLowerCase()}.` });
      }
      if (level === 4) { // qué ácido la protona casi por completo (Keq ≥ 100: pKa del ácido al menos 2 unidades bajo el pKaH)
        let a2, good, bad;
        for (let t = 0; t < 50; t++) { a2 = pick(rng, PKA.filter(x => x.k > 3)); good = ACIDS.filter(x => x.k <= a2.k - 2); bad = ACIDS.filter(x => x.k > a2.k - 2); if (good.length && bad.length >= 2) break; }
        const g = pick(rng, good);
        return choice(rng, `¿Cuál de estos ácidos protona casi por completo (más del 99 %) a ${la(a2)} (pKaH ${pkTxt(a2)})?`, `${g.n} (pKa ${num(g.k)})`,
          sample(rng, bad, 3).map(x => ({ text: `${x.n} (pKa ${num(x.k)})`, note: `Su pKa no está 2 unidades bajo ${pkTxt(a2)}: Keq = 10^(${pkTxt(a2)} − ${num(x.k)}) es menor que 100.`, misconception: 'strong-side' })),
          { ...base, hint: 'Más del 99 % = Keq de 100 o más = el ácido tiene un pKa al menos 2 unidades menor que el pKaH.', explain: `Keq = 10^(${pkTxt(a2)} − ${num(g.k)}) ≥ 100: casi todo protonado.` });
      }
      if (rng() < 0.5) {
        const dg = pick(rng, DRUGS_PK);
        return choice(rng, `Estilo PEP: la ${dg.n} es una amina (pKaH ${num(dg.k)}). Solo la forma neutra cruza las membranas. ¿Dónde hay más forma neutra: en el estómago (pH 2) o en el intestino (pH 8)?`, 'En el intestino (pH 8)',
          [{ text: 'En el estómago (pH 2)', note: 'A pH 2 la amina está casi toda protonada (es una base).', misconception: 'neutral-in-acid' }, { text: 'Igual en los dos', note: `La fracción neutra cambia un factor 10 por unidad de pH: ${pow10(6)} veces más a pH 8.` }],
          { ...base, slide: 16, hint: 'Una amina se protona más mientras más ácido el medio.', explain: `Neutra/protonada = 10^(pH − pKa): a pH 8 es 10^(${num(8 - dg.k)}) y a pH 2 es 10^(${num(2 - dg.k)}). En el intestino hay ${pow10(6)} veces más forma neutra.` });
      }
      const p = pick(rng, [{ t: 'está 99 % protonada', d: -2 }, { t: 'está 50 % protonada', d: 0 }, { t: 'está solo 1 % protonada', d: 2 }]);
      return choice(rng, `Estilo PEP: ¿a qué pH ${la(am)} (pKaH ${pkTxt(am)}) ${p.t.replace('protonada', `protonad${oa(am)}`)}?`, num(am.k + p.d), [-2, 0, 2].filter(x => x !== p.d).map(x => ({ text: num(am.k + x), note: 'pH = pKa + log(neutra/protonada).' })).concat([{ text: num(am.k - p.d), note: 'Revisa el signo: bajo el pKa predomina la forma protonada.' }]),
        { ...base, hint: 'pH = pKa + log([neutra]/[protonada]). 99 % protonada: neutra/protonada = 1/99 ≈ 10⁻².', explain: `pH = ${pkTxt(am)} ${p.d >= 0 ? '+' : '−'} ${Math.abs(p.d)} = ${num(am.k + p.d)}.` });
    }
  };

  const SALT_AM = [{ n: 'metilamina', f: 'CH₃NH₂', salt: 'CH₃NH₃⁺ Cl⁻', sn: 'cloruro de metilamonio' }, { n: 'dimetilamina', f: '(CH₃)₂NH', salt: '(CH₃)₂NH₂⁺ Cl⁻', sn: 'cloruro de dimetilamonio' },
    { n: 'trietilamina', f: '(CH₃CH₂)₃N', salt: '(CH₃CH₂)₃NH⁺ Cl⁻', sn: 'cloruro de trietilamonio' }, { n: 'anilina', f: 'C₆H₅NH₂', salt: 'C₆H₅NH₃⁺ Cl⁻', sn: 'cloruro de anilinio' },
    { n: 'propilamina', f: 'CH₃CH₂CH₂NH₂', salt: 'CH₃CH₂CH₂NH₃⁺ Cl⁻', sn: 'cloruro de propilamonio' }, { n: 'piridina', f: 'C₅H₅N', salt: 'C₅H₅NH⁺ Cl⁻', sn: 'cloruro de piridinio' }];
  const sales = {
    id: 'sales', title: 'Sales y extracción', mission: 'm3', concepts: ['am.sales'],
    make(rng, level) {
      const base = { concept: 'am.sales', slide: 16, hint: 'Amina + ácido → sal de amonio (iónica: va al agua). Con base (NaOH) vuelve a ser amina neutra (va al éter).' };
      const a = pick(rng, SALT_AM);
      if (level === 1) return choice(rng, `¿Qué se forma al mezclar ${a.n} (${a.f}) con HCl?`, `${a.salt} (${a.sn})`, [
        { text: `Una amida y H₂O`, note: 'Para una amida hace falta un acilo; el HCl solo protona.' }, { text: 'No reaccionan: la amina es neutra', note: 'El par libre del N atrapa el H⁺: es una base.', misconception: 'nh-acid' },
        { text: `${a.f.replace(/NH₂$|NH$|N$/, '')}–Cl + NH₃`, note: 'El enlace C–N no se rompe; el N solo gana un H⁺.' }], { ...base, explain: `El par libre del N toma el H⁺: ${a.salt}.` });
      if (level === 2) {
        const salt = rng() < 0.5;
        return choice(rng, salt ? `¿Dónde se disuelve mejor el ${a.sn}: en agua o en éter?` : `Tienes octilamina (8 C, neutra). ¿Dónde se disuelve mejor: en agua o en éter?`, salt ? 'En agua: es iónico' : 'En éter: la cadena larga manda',
          [{ text: salt ? 'En éter: es orgánico' : 'En agua: tiene un NH₂', note: salt ? 'Tiene carga: las sales van al agua.' : 'Con 8 carbonos, la cadena apolar gana.', misconception: salt ? 'salt-organic' : 'size-solubility' }, { text: 'En ninguno', note: 'Siempre hay un solvente que le acomoda.' }],
          { ...base, explain: salt ? 'Una sal de amonio es iónica: se disuelve en agua y no en éter.' : 'La octilamina neutra es casi toda cadena apolar: prefiere el éter. Con HCl pasaría al agua.' });
      }
      if (level === 3) {
        const am = pick(rng, PKA.filter(x => x.k > 3)), ph = pick(rng, [1, 2, 13, 14]), acidic = ph < am.k - 2;
        return choice(rng, `${am.n} disuelt${oa(am)} en éter se agita con una solución acuosa de pH ${ph}. ¿Dónde queda la amina?`, acidic ? 'En el agua, como sal (protonada)' : 'En el éter, neutra',
          [{ text: acidic ? 'En el éter, neutra' : 'En el agua, como sal (protonada)', note: `Compara el pH (${ph}) con el pKaH (${pkTxt(am)}).`, misconception: 'salt-organic' }, { text: 'Mitad en cada capa', note: 'Con 2 o más unidades de diferencia, casi toda queda en una sola forma.' }],
          { ...base, hint: 'pH muy bajo → protonada (ion, va al agua). pH alto → neutra (va al éter).', explain: `pH ${ph} ${acidic ? 'está muy por debajo' : 'está por encima'} del pKaH ${pkTxt(am)}: queda ${acidic ? 'protonada, en el agua' : 'neutra, en el éter'}.` });
      }
      if (level === 4) {
        const q = pick(rng, PHYS_PEP.filter(x => x.c === 'am.sales').concat([{ p: `Tienes ${a.sn} disuelto en agua. ¿Cómo recuperas la ${a.n} libre?`, a: 'Agregar NaOH y extraer con éter', c: 'am.sales',
          d: [['Agregar más HCl', 'Eso la mantiene protonada.'], ['Evaporar el agua', 'Quedaría la sal, no la amina libre.'], ['Agregar éter solamente', 'La sal no pasa al éter.', 'salt-organic']], e: 'El NaOH le quita el H⁺ a la sal: la amina neutra pasa al éter.' }]));
        return choice(rng, q.p, q.a, q.d.map(([text, note, misconception]) => ({ text, note, misconception })), { ...base, explain: q.e });
      }
      const [art, neutro] = pick(rng, [['el', 'naftaleno'], ['el', 'tolueno'], ['la', 'benzofenona']]), am2 = pick(rng, PKA.filter(x => x.k > 9 && !MASC.includes(x.n)));
      return order(`Estilo PEP: separa ${la(am2)} ${art === 'el' ? 'del' : 'de la'} ${neutro} (ambos en éter). Ordena los pasos.`, shuffle(rng, [
        { id: 'hcl', text: 'Agregar HCl acuoso y agitar' }, { id: 'sep', text: 'Separar la capa acuosa' }, { id: 'naoh', text: 'Agregar NaOH a la capa acuosa' }, { id: 'eter', text: 'Extraer con éter y evaporar' }]),
      ['hcl', 'sep', 'naoh', 'eter'], { ...base, direction: 'Del primero al último.', hint: 'Primero vuelve iónica a la amina, después devuélvela a neutra.', explain: `HCl: ${la(am2)} pasa al agua como sal (${art} ${neutro} se queda en el éter); separas; NaOH: vuelve a ser neutra; éter: la recuperas sola.` });
    }
  };

  /* ════════ 8. Propiedades físicas (Misión 3). Ebulliciones aproximadas en °C (tablas estándar). ════════ */
  const ISO = [
    [{ n: 'Propilamina (1°)', t: 48 }, { n: 'Etilmetilamina (2°)', t: 36 }, { n: 'Trimetilamina (3°)', t: 3 }],
    [{ n: 'Butilamina (1°)', t: 78 }, { n: 'Dietilamina (2°)', t: 55 }, { n: 'N,N-Dimetiletilamina (3°)', t: 37 }],
    [{ n: 'Etilamina (1°)', t: 17 }, { n: 'Dimetilamina (2°)', t: 7 }],
    [{ n: 'Pentilamina (1°)', t: 104 }, { n: 'N-Metilbutilamina (2°)', t: 91 }, { n: 'N,N-Dimetilpropilamina (3°)', t: 65 }],
    [{ n: 'Hexilamina (1°)', t: 131 }, { n: 'Dipropilamina (2°)', t: 110 }, { n: 'Trietilamina (3°)', t: 89 }]
  ];
  const SAME_MASS = [ // masas parecidas: alcano o éter < amina < alcohol (ebulliciones aproximadas, °C)
    { m: '58–60 u', set: [{ n: 'Butano', t: -0.5 }, { n: 'Propilamina', t: 48 }, { n: 'Propan-1-ol', t: 97 }] },
    { m: '72–74 u', set: [{ n: 'Pentano', t: 36 }, { n: 'Butilamina', t: 78 }, { n: 'Butan-1-ol', t: 117 }] },
    { m: '44–46 u', set: [{ n: 'Propano', t: -42 }, { n: 'Etilamina', t: 17 }, { n: 'Etanol', t: 78 }] },
    { m: '59–60 u', set: [{ n: 'Trimetilamina', t: 3 }, { n: 'Propilamina', t: 48 }, { n: 'Propan-1-ol', t: 97 }] },
    { m: '73–74 u', set: [{ n: 'Dietil éter', t: 35 }, { n: 'Dietilamina', t: 55 }, { n: 'Butan-1-ol', t: 117 }] }
  ];
  const PHYS_PEP = [
    { p: '¿Por qué los fármacos con aminas se venden como clorhidratos?', a: 'Porque la sal es iónica: más soluble en agua, más estable y sin olor', c: 'am.sales', s: 16,
      d: [['Porque el HCl aumenta la basicidad del fármaco', 'Al protonarla, la amina deja de ser básica: es una sal.'], ['Porque así el fármaco se disuelve mejor en grasas', 'Al revés: la sal es iónica y se disuelve en agua.', 'salt-organic'], ['Porque la amina neutra no existe', 'Existe; la sal es más práctica de guardar y administrar.']],
      e: 'La sal de amonio es iónica: soluble en agua, menos oxidable y sin el olor de la amina libre (diap. 16).' },
    { p: 'El pescado huele por aminas volátiles (como la trimetilamina). ¿Por qué el limón le quita el olor?', a: 'El ácido protona las aminas: quedan como sales, que no se evaporan', c: 'am.sales', s: 16,
      d: [['El limón tapa el olor con su aroma', 'Hay algo químico: el ácido cítrico reacciona con la amina.'], ['El ácido oxida las aminas a nitro', 'Un ácido diluido protona; no oxida.'], ['Las aminas se vuelven más volátiles y se van', 'Al revés: la sal iónica no es volátil.', 'salt-organic']],
      e: 'Amina + ácido → sal de amonio: iónica, no volátil y sin olor.' },
    { p: 'La dodecilamina (12 C) no se disuelve en agua. ¿Qué pasa si la agitas con HCl acuoso?', a: 'Se disuelve: forma la sal de dodecilamonio, que es iónica', c: 'am.sales', s: 16,
      d: [['Sigue sin disolverse: la cadena es muy larga', 'La carga de la sal arrastra a la molécula al agua.', 'size-solubility'], ['Se descompone y libera NH₃', 'Solo se protona el N.'], ['Forma una amida', 'Para una amida hace falta un acilo, no HCl.']],
      e: 'El HCl protona el N: la sal iónica es soluble en agua aunque la cadena sea larga. Así se separan aminas.' },
    { p: 'La trimetilamina (3°, 59 u) hierve a 3 °C y la propilamina (1°, 59 u) a 48 °C. ¿Por qué?', a: 'La 3° no tiene H en el N: no forma puentes de H entre sus moléculas', c: 'am.fisicas', s: 12,
      d: [['La 3° es más liviana', 'Tienen la misma masa (59 u).'], ['La 3° es menos básica', 'La ebullición depende de las fuerzas entre moléculas, no de la basicidad.'], ['La 1° es más ramificada', 'Al revés: la 3° es la ramificada.']],
      e: 'Sin N–H no hay puente de hidrógeno entre moléculas de la amina 3°: solo fuerzas de dispersión y dipolo.', mc: 'tertiary-donor' },
    { p: 'Una amina 3° no forma puentes de H entre sí. ¿Puede formarlos con el agua?', a: 'Sí: su par libre acepta el H del agua', c: 'am.fisicas', s: 12,
      d: [['No: no tiene H en el N', 'Para aceptar un puente basta el par libre; el H lo pone el agua.', 'tertiary-donor'], ['Solo si está protonada', 'Neutra también: el par libre del N acepta.'], ['Solo en solventes orgánicos', 'El puente de H es con el agua.']],
      e: 'Por eso las aminas 3° pequeñas son solubles en agua aunque hiervan bajo.' }
  ];
  const SOL = [{ n: 'Metilamina', c: 1 }, { n: 'Etilamina', c: 2 }, { n: 'Butilamina', c: 4 }, { n: 'Hexilamina', c: 6 }, { n: 'Octilamina', c: 8 }, { n: 'Dodecilamina', c: 12 }];
  const BP4 = [ // masas parecidas, cuatro compuestos (°C aprox.)
    [{ n: 'Propano', t: -42 }, { n: 'Dimetilamina', t: 7 }, { n: 'Etilamina', t: 17 }, { n: 'Etanol', t: 78 }],
    [{ n: 'Butano', t: -0.5 }, { n: 'Trimetilamina', t: 3 }, { n: 'Propilamina', t: 48 }, { n: 'Propan-1-ol', t: 97 }],
    [{ n: 'Dietil éter', t: 35 }, { n: 'Dietilamina', t: 55 }, { n: 'Butilamina', t: 78 }, { n: 'Butan-1-ol', t: 117 }]];
  const propiedades = {
    id: 'propiedades', title: 'Ebullición y solubilidad', mission: 'm3', concepts: ['am.fisicas'],
    make(rng, level) {
      const base = { concept: 'am.fisicas', slide: 12, hint: 'Más enlaces N–H → más puentes de hidrógeno → mayor punto de ebullición.' };
      const ord = (set, prompt, extra = {}) => { const s = [...set].sort((x, y) => x.t - y.t), cards = shuffle(rng, s).map((x, i) => ({ id: `c${i}`, text: x.n, x }));
        return order(prompt, cards.map(({ id, text }) => ({ id, text })), s.map(x => cards.find(c => c.x === x).id), { ...base, direction: 'De menor a mayor.', explain: `${s.map(x => `${x.n} ≈ ${x.t} °C`).join(' < ')}. Más puentes de H (y más fuertes), más alto hierve.`, ...extra }); };
      if (level === 1) {
        const set = pick(rng, ISO.filter(x => x.length === 3)), hi = rng() < 0.6, tgt = [...set].sort((x, y) => (hi ? y.t - x.t : x.t - y.t))[0];
        return choice(rng, `Mismo número de carbonos: ¿cuál hierve ${hi ? 'MÁS ALTO' : 'MÁS BAJO'}?`, tgt.n, set.filter(x => x !== tgt).map(x => ({ text: x.n, note: `≈ ${x.t} °C: ${hi ? 'tiene menos N–H, forma menos puentes de H' : 'tiene más N–H, forma más puentes de H'}.`, misconception: 'tertiary-donor' })), { ...base, explain: set.map(x => `${x.n} ≈ ${x.t} °C`).join('; ') + '.' });
      }
      if (level === 2) {
        const three = sample(rng, SOL, 3), most = rng() < 0.5, tgt = [...three].sort((a, b) => (most ? a.c - b.c : b.c - a.c))[0];
        return choice(rng, `¿Cuál es la ${most ? 'MÁS' : 'MENOS'} soluble en agua?`, `${tgt.n} (${tgt.c} C)`, three.filter(x => x !== tgt).map(x => ({ text: `${x.n} (${x.c} C)`, note: 'Más carbonos = la cadena apolar gana y baja la solubilidad (hasta ≈ 5 C son solubles).', misconception: 'size-solubility' })), { ...base, explain: `${tgt.n}: ${most ? 'la cadena más corta' : 'la cadena más larga'}.` });
      }
      if (level === 3 && rng() < 0.5) return statements(rng, 3, BANKS.fisicas, base);
      if (level === 3) return ord(pick(rng, ISO.filter(s => s.length === 3)), 'Ordena de menor a mayor punto de ebullición.');
      if (level === 4 && rng() < 0.4) return statements(rng, 4, BANKS.fisicas, base);
      if (level === 4) { const g = pick(rng, SAME_MASS); return ord(g.set, `Masas parecidas (${g.m}): ordena de menor a mayor punto de ebullición.`, { hint: 'El O–H forma puentes de H más fuertes que el N–H; sin H en el N (o sin N ni O) no hay puentes entre moléculas.' }); }
      if (rng() < 0.5) return ord(pick(rng, BP4), 'Estilo PEP: masas parecidas. Ordena de menor a mayor punto de ebullición.', { hint: 'Alcano o éter < amina 3° < 2° < 1° < alcohol.' });
      const q = pick(rng, PHYS_PEP.filter(x => x.c === 'am.fisicas'));
      return choice(rng, `Estilo PEP: ${q.p}`, q.a, q.d.map(([text, note, misconception]) => ({ text, note, misconception: misconception || q.mc })), { ...base, slide: q.s, explain: q.e });
    }
  };

  /* ════════ 9. Síntesis de aminas (Misión 6) ════════ */
  const CARB = [{ n: 'acetona', c: '(CH₃)₂CH', co: '(CH₃)₂C=' }, { n: 'benzaldehído', c: 'C₆H₅CH₂', co: 'C₆H₅CH=' }, { n: 'ciclohexanona', c: 'C₆H₁₁', co: 'C₆H₁₀=' }, { n: 'acetaldehído', c: 'CH₃CH₂', co: 'CH₃CH=' }, { n: 'butanona', c: 'CH₃CH₂CH(CH₃)', co: 'CH₃CH₂C(CH₃)=' }];
  const NSRC = [{ n: 'NH₃', p: '–NH₂', imine: 'NH', type: 1 }, { n: 'metilamina (CH₃NH₂)', p: '–NH–CH₃', imine: 'N–CH₃', type: 2 }, { n: 'etilamina (CH₃CH₂NH₂)', p: '–NH–CH₂CH₃', imine: 'N–CH₂CH₃', type: 2 }, { n: 'dimetilamina ((CH₃)₂NH)', p: '–N(CH₃)₂', imine: null, type: 3 }];
  const HAL = [{ n: '1-bromopropano', r: 'CH₃CH₂CH₂', ok: true }, { n: 'bromoetano', r: 'CH₃CH₂', ok: true }, { n: 'bromuro de bencilo', r: 'C₆H₅CH₂', ok: true }, { n: '1-bromobutano', r: 'CH₃CH₂CH₂CH₂', ok: true },
    { n: '2-bromo-2-metilpropano (terciario)', r: '(CH₃)₃C', ok: false, why: 'un carbono terciario no hace SN2: daría eliminación' }, { n: 'bromobenceno', r: 'C₆H₅', ok: false, why: 'un haluro de arilo no hace SN2' }];
  const ROUTES = h => [ // rutas de varios pasos (nivel PEP); h = un haluro que sí hace SN2
    { want: 'am.reduccion', start: 'benceno', target: 'anilina', steps: [['nit', 'HNO₃ / H₂SO₄ (nitración)'], ['fe', 'Fe / HCl (reducción)'], ['naoh', 'NaOH (libera la amina)']] },
    { want: 'am.reduccion', start: 'ácido propanoico', target: 'propilamina', steps: [['socl', 'SOCl₂ (cloruro de ácido)'], ['nh3', 'NH₃ (forma la amida)'], ['lah', 'LiAlH₄ (reduce la amida)']] },
    { want: 'am.reduccion', start: h.n, target: `${h.r}–CH₂–NH₂ (un carbono más)`, steps: [['cn', `NaCN (SN2: nitrilo ${h.r}–C≡N)`], ['lah', 'LiAlH₄ (reduce el nitrilo)'], ['h2o', 'Agua (fin de la reducción)']] },
    { want: 'am.alquilacion', start: h.n, target: `${h.r}–NH₂ pura`, steps: [['ft', 'Ftalimida + KOH (N⁻)'], ['sn2', `Agregar el ${h.n} (SN2)`], ['hyd', 'Hidrazina (libera la amina)']] },
    { want: 'am.alquilacion', start: h.n, target: `${h.r}–NH₂ pura`, steps: [['az', 'NaN₃ (SN2: azida)'], ['lah', 'LiAlH₄ (reduce la azida, sale N₂)'], ['h2o', 'Agua (fin de la reducción)']] }
  ];
  const TO_AMINE = [{ s: 'nitrobenceno', p: 'anilina', a: 'Fe / HCl' }, { s: 'p-nitrotolueno', p: 'p-toluidina', a: 'Fe / HCl' }, { s: 'propanamida (CH₃CH₂CO–NH₂)', p: 'propilamina', a: 'LiAlH₄' },
    { s: 'benzamida (C₆H₅CO–NH₂)', p: 'bencilamina', a: 'LiAlH₄' }, { s: 'propanonitrilo (CH₃CH₂C≡N)', p: 'propilamina', a: 'LiAlH₄' }, { s: 'propilazida (CH₃CH₂CH₂–N₃)', p: 'propilamina', a: 'LiAlH₄' },
    { s: 'ciclohexanona + NH₃', p: 'ciclohexilamina', a: 'NaBH₃CN' }, { s: 'acetona + metilamina', p: 'N-metilpropan-2-amina', a: 'NaBH₃CN' }];
  const REAGENT_NOTE = { 'Fe / HCl': 'Reduce grupos nitro; no toca amidas, nitrilos ni iminas.', 'LiAlH₄': 'Reduce amidas, nitrilos y azidas. Con una cetona daría el alcohol; con un nitroareno no da anilina limpia.',
    'NaBH₃CN': 'Reduce iminas (aminación reductiva); no reduce amidas ni grupos nitro.', 'NaN₃': 'Pone una azida en un haluro; no reduce.', 'CH₃I': 'Metila aminas; no reduce.' };
  const sintesis = {
    id: 'sintesis', title: 'Síntesis de aminas', mission: 'm6', concepts: ['am.alquilacion', 'am.reduccion'],
    make(rng, level, want) {
      want = want || pick(rng, ['am.alquilacion', 'am.reduccion']);
      const alq = want === 'am.alquilacion';
      const base = { concept: want, slide: alq ? 31 : 32, hint: 'Haluro → Gabriel o azida. Carbonilo → aminación reductiva. Amida, nitrilo o azida → LiAlH₄. Nitro → Fe/HCl.' };
      if (level === 1) {
        const q = pick(rng, [
          { p: '¿Qué reactivo convierte el nitrobenceno en anilina?', a: 'Fe / HCl (o H₂/Pt)', d: [['NaBH₃CN', 'Reduce iminas, no grupos nitro.'], ['NaN₃', 'Pone una azida en un haluro.'], ['CH₃I', 'Metila aminas.']], c: 'am.reduccion', s: 33 },
          { p: '¿Qué hace el LiAlH₄ con una amida R–CO–NH₂?', a: 'La reduce a R–CH₂–NH₂', d: [['La hidroliza a ácido', 'Eso lo hace agua con ácido o base.'], ['La convierte en nitrilo', 'Eso es una deshidratación.'], ['No le hace nada', 'El LiAlH₄ es un reductor fuerte.']], c: 'am.reduccion', s: 33 },
          { p: '¿Qué libera la amina primaria al final de la síntesis de Gabriel?', a: 'La hidrazina (H₂N–NH₂)', d: [['El KOH', 'El KOH forma el N⁻ al principio.'], ['El LiAlH₄', 'Ese es de la vía azida.'], ['El HCl', 'Protonaría la amina.']], c: 'am.alquilacion', s: 31 },
          { p: '¿Qué reductor se usa en la aminación reductiva?', a: 'NaBH₃CN', d: [['Fe / HCl', 'Ese reduce nitroarenos.'], ['HNO₃', 'Es un oxidante y nitra.'], ['KOH', 'Es una base, no reduce.']], c: 'am.reduccion', s: 32 },
          { p: '¿Qué da el LiAlH₄ con un nitrilo R–C≡N?', a: 'R–CH₂–NH₂ (amina primaria)', d: [['R–NH₂ (pierde un carbono)', 'El C del nitrilo se queda: queda como CH₂.'], ['R–CO–NH₂', 'Eso sería hidratarlo, no reducirlo.'], ['R–CH₃', 'El N se conserva.']], c: 'am.reduccion', s: 33 },
          { p: '¿Por qué NH₃ + un haluro de alquilo da una mezcla de aminas?', a: 'La amina formada también ataca al haluro (sobrealquilación)', d: [['Porque el NH₃ no es nucleófilo', 'Sí lo es: por eso reacciona.'], ['Porque el haluro se elimina', 'Con un haluro primario predomina la SN2.'], ['Porque el NH₃ se oxida', 'No hay oxidante.']], c: 'am.alquilacion', s: 30 },
          { p: 'La NaN₃ con un haluro primario hace una SN2. ¿Por qué no se sobrealquila?', a: 'La azida formada (R–N₃) no es nucleófila: no vuelve a atacar', d: [['Porque la azida es una base fuerte', 'Lo que importa es que R–N₃ ya no ataca.'], ['Porque se usa en exceso de haluro', 'Aun así no reacciona dos veces.'], ['Sí se sobrealquila', 'No: por eso la vía azida da amina primaria limpia.', 'overalkylation']], c: 'am.alquilacion', s: 31 },
          { p: 'En la síntesis de Gabriel, ¿qué tipo de reacción hace el N⁻ de la ftalimida con el haluro?', a: 'SN2', d: [['E2', 'Con un haluro primario, el N⁻ ataca al carbono: SN2.'], ['Adición al carbonilo', 'El N⁻ ataca al haluro, no a un C=O.'], ['Sustitución aromática', 'El haluro es de alquilo.']], c: 'am.alquilacion', s: 31 }].filter(x => x.c === want));
        return choice(rng, q.p, q.a, q.d.map(([text, note, misconception]) => ({ text, note, misconception })), { ...base, slide: q.s, explain: `${q.a}.` });
      }
      if (alq && level === 2) {
        const h = pick(rng, HAL.filter(x => x.ok)), viaG = rng() < 0.5;
        return choice(rng, viaG ? `${h.n[0].toUpperCase()}${h.n.slice(1)} + ftalimida/KOH; después hidrazina. ¿Producto?` : `${h.n[0].toUpperCase()}${h.n.slice(1)} + NaN₃; después LiAlH₄. ¿Producto?`, `${h.r}–NH₂`, [
          { text: `${h.r}–NH–${rt(h.r)}`, note: 'Esa vía pone el N una sola vez: no hay sobrealquilación.', misconception: 'gabriel-poly' },
          { text: viaG ? `N-${h.r}ftalimida` : `${h.r}–N₃`, note: viaG ? 'Falta liberar la amina: eso hace la hidrazina.' : 'Falta reducir la azida: eso hace el LiAlH₄.', misconception: viaG ? 'gabriel-stop' : undefined },
          { text: `${h.r}–OH`, note: 'El nucleófilo es nitrogenado: queda un N, no un OH.' }], { ...base, explain: `${viaG ? 'Gabriel' : 'Vía azida'}: amina primaria limpia, ${h.r}–NH₂.` });
      }
      if (!alq && level === 2) {
        const co = pick(rng, CARB), ns = pick(rng, NSRC), prod = `${co.c}${ns.p}`;
        const ds = [{ text: `${co.c}–OH`, note: 'Eso sería reducir solo la cetona; el NaBH₃CN reduce la imina que se forma con la amina.' },
          ns.imine ? { text: `${co.co}${ns.imine}`, note: 'Esa es la imina, el intermediario: falta reducirla.' } : { text: `${co.c}–NH₂`, note: 'La amina que pones aporta sus grupos al N.' },
          { text: `${co.c}${NSRC[(NSRC.indexOf(ns) + 1) % NSRC.length].p}`, note: 'El N gana un grupo más del que tenía: mira qué amina usaste.' }];
        return choice(rng, `${co.n[0].toUpperCase()}${co.n.slice(1)} + ${ns.n} + NaBH₃CN. ¿Producto?`, prod, ds, { ...base, explain: `El C del carbonilo queda unido al N: ${prod} (amina ${['', '1°', '2°', '3°'][ns.type]}).` });
      }
      if (alq && level === 3) {
        const h = pick(rng, HAL.filter(x => x.ok)), viaG = rng() < 0.5;
        const right = viaG ? 'Ftalimida + KOH, luego hidrazina (Gabriel)' : 'NaN₃, luego LiAlH₄ (vía azida)';
        return choice(rng, `¿Qué ruta da ${h.r}–NH₂ pura desde ${h.n}?`, right, [{ text: 'NH₃ en cantidad equivalente', note: 'La amina formada también ataca: mezcla de aminas.', misconception: 'overalkylation' }, { text: 'CH₃I en exceso', note: 'Eso metila aminas; no pone un N.' }, { text: 'NaBH₃CN', note: 'Necesita un carbonilo, no un haluro.' }], { ...base, explain: `Gabriel y la azida ponen el N una sola vez: ${h.r}–NH₂ sin sobrealquilación.` });
      }
      if (!alq && level === 3) {
        const t = pick(rng, TO_AMINE);
        return choice(rng, `¿Qué reactivo convierte ${t.s} en ${t.p}?`, t.a, sample(rng, Object.keys(REAGENT_NOTE).filter(r => r !== t.a), 3).map(r => ({ text: r, note: REAGENT_NOTE[r] })), { ...base, slide: 33, explain: `${t.a}: ${REAGENT_NOTE[t.a]}` });
      }
      if (alq && level >= 4 && rng() < 0.5) return statements(rng, level, BANKS.alquilacion, base);
      if (alq && level === 4) {
        const h = pick(rng, HAL);
        return choice(rng, `¿Sirve la síntesis de Gabriel con ${h.n} para obtener ${h.r}–NH₂?`, h.ok ? 'Sí: es un haluro que hace SN2' : `No: ${h.why}`, [{ text: h.ok ? `No: ${pick(rng, HAL.filter(x => !x.ok)).why}` : 'Sí: Gabriel sirve con cualquier haluro', note: 'Gabriel necesita SN2: haluros metílicos y primarios (secundarios con dificultad).' }, { text: 'Solo si se agrega LiAlH₄ al final', note: 'Gabriel termina con hidrazina; el problema (si lo hay) es la SN2.' }],
          { ...base, explain: h.ok ? `${h.n}: carbono accesible, SN2 posible.` : `${h.n}: ${h.why}.` });
      }
      if (!alq && level === 4) { // al revés: ¿de qué carbonilo y qué amina sale?
        const co = pick(rng, CARB), ns = pick(rng, NSRC), other = pick(rng, CARB.filter(x => x !== co)), ons = NSRC[(NSRC.indexOf(ns) + 1) % NSRC.length];
        return choice(rng, `Para obtener ${co.c}${ns.p} por aminación reductiva (NaBH₃CN), ¿qué juntas?`, `${co.n} + ${ns.n}`, [
          { text: `${co.n} + ${ons.n}`, note: 'Mira los grupos que tiene el N en el producto: vienen de la amina.' }, { text: `${other.n} + ${ns.n}`, note: 'El esqueleto unido al N viene del carbonilo: revisa cuál es.' },
          { text: `${co.c}–Br + ${ns.n}`, note: 'Eso sería una alquilación (SN2), no aminación reductiva, y tiende a sobrealquilar.', misconception: 'overalkylation' }], { ...base, explain: `El C unido al N era el C=O de la ${co.n}; los grupos del N vienen de la ${ns.n}.` });
      }
      const r = pick(rng, ROUTES(pick(rng, HAL.filter(x => x.ok))).filter(x => x.want === want));
      const cards = shuffle(rng, r.steps).map(([id, text]) => ({ id, text }));
      return order(`Estilo PEP (pregunta 4): propón la ruta de ${r.start} a ${r.target}. Ordena los pasos.`, cards, r.steps.map(x => x[0]), { ...base, slide: 33, direction: 'Del primero al último.', explain: r.steps.map(x => x[1]).join(' → ') + '.' });
    }
  };

  /* ════════ 10. Reacciones de aminas (Misión 7) ════════ */
  const SAND = [{ r: 'CuCl', x: 'Cl', p: 'clorobenceno' }, { r: 'CuBr', x: 'Br', p: 'bromobenceno' }, { r: 'CuCN', x: 'CN', p: 'benzonitrilo' }, { r: 'KI', x: 'I', p: 'yodobenceno' }, { r: 'HBF₄ y calor', x: 'F', p: 'fluorobenceno' }, { r: 'H₂O y calor', x: 'OH', p: 'fenol' }];
  const AMINES = [{ n: 'metilamina', f: 'CH₃NH₂', N: 'CH₃–NH', t: 1 }, { n: 'etilamina', f: 'CH₃CH₂NH₂', N: 'CH₃CH₂–NH', t: 1 }, { n: 'dimetilamina', f: '(CH₃)₂NH', N: '(CH₃)₂N', t: 2 }, { n: 'dietilamina', f: '(CH₃CH₂)₂NH', N: '(CH₃CH₂)₂N', t: 2 }, { n: 'anilina', f: 'C₆H₅NH₂', N: 'C₆H₅–NH', t: 1 }, { n: 'trietilamina', f: '(CH₃CH₂)₃N', N: null, t: 3, lose: '(CH₃CH₂)₂N' }, { n: 'trimetilamina', f: '(CH₃)₃N', N: null, t: 3, lose: '(CH₃)₂N' }];
  const ACYL = [{ n: 'cloruro de acetilo', g: 'CO–CH₃' }, { n: 'cloruro de benzoílo', g: 'CO–C₆H₅' }];
  const HOF = [{ a: '2-heptanamina', h: '1-hepteno', z: '2-hepteno' }, { a: '2-metilpentan-2-amina', h: '2-metil-1-penteno', z: '2-metil-2-penteno' }, { a: '1-ciclohexiletanamina', h: 'vinilciclohexano', z: 'etilidenciclohexano' }, { a: '2-metilbutan-2-amina, (CH₃)₂C(NH₂)CH₂CH₃', h: '2-metil-1-buteno', z: '2-metil-2-buteno' }, { a: '1-fenilpropan-2-amina (anfetamina)', h: '3-fenil-1-propeno', z: '1-fenil-1-propeno' }, { a: '2-butanamina, CH₃CH₂CH(NH₂)CH₃', h: '1-buteno', z: '2-buteno' }, { a: '2-pentanamina', h: '1-penteno', z: '2-penteno' }, { a: '2-hexanamina', h: '1-hexeno', z: '2-hexeno' },
    { a: '3-metil-2-butanamina, (CH₃)₂CH–CH(NH₂)–CH₃', h: '3-metil-1-buteno', z: '2-metil-2-buteno' }, { a: '4-metil-2-pentanamina', h: '4-metil-1-penteno', z: '4-metil-2-penteno' }];
  const reacciones = {
    id: 'reacciones', title: 'Reacciones de aminas', mission: 'm7', concepts: ['am.acilacion', 'am.diazonio', 'am.hofmann'],
    make(rng, level, want) {
      const kind = want === 'am.acilacion' ? 'acil' : want === 'am.diazonio' ? 'diaz' : want === 'am.hofmann' ? 'hof' : pick(rng, ['acil', 'diaz', 'hof']);
      const base = { slide: 34, hint: 'Acilación: 1° y 2° sí, 3° no. Diazonio: NaNO₂/HCl en frío y después la sal de cobre. Hofmann: el alqueno menos sustituido.' };
      if (kind === 'diaz') {
        const s = pick(rng, SAND), b = { ...base, concept: 'am.diazonio', slide: 40 };
        if (level <= 2) return choice(rng, level === 1 ? `¿Qué reactivo pone ${s.x} en C₆H₅–N₂⁺?` : `C₆H₅–N₂⁺ + ${s.r}. ¿Producto?`, level === 1 ? s.r : s.p,
          sample(rng, SAND.filter(x => x !== s), 3).map(x => ({ text: level === 1 ? x.r : x.p, note: `${x.r} da ${x.p}.` })), { ...b, explain: `${s.r} reemplaza el N₂ por ${s.x}: ${s.p}.` });
        if (level === 4) {
          const TOL = { Cl: '4-clorotolueno', Br: '4-bromotolueno', CN: '4-metilbenzonitrilo', I: '4-yodotolueno', F: '4-fluorotolueno', OH: '4-metilfenol (p-cresol)' };
          return choice(rng, `Desde p-toluidina (4-metilanilina), ¿cómo obtienes ${TOL[s.x]}?`, `NaNO₂ / HCl a 0–5 °C, luego ${s.r}`, [
            { text: `${s.r} directamente`, note: 'Primero hay que convertir el NH₂ en –N₂⁺, el buen grupo saliente.' }, { text: 'HNO₃ / H₂SO₄, luego ' + s.r, note: 'Eso nitra el anillo; la diazotación es con NaNO₂/HCl.', misconception: 'nitration-confusion' },
            { text: `NaNO₂ / HCl a 0–5 °C, luego ${pick(rng, SAND.filter(x => x !== s)).r}`, note: 'Ese reactivo pone otro grupo.' }], { ...b, explain: `El CH₃ no cambia; el NH₂ pasa a –N₂⁺ en frío y ${s.r} pone ${s.x}: ${TOL[s.x]}.` });
        }
        if (level <= 4) return choice(rng, `Desde anilina, ¿cómo obtienes ${s.p}?`, `NaNO₂ / HCl a 0–5 °C, luego ${s.r}`, [
          { text: `${s.r} directamente`, note: 'Primero hay que convertir el NH₂ en un buen grupo saliente: la sal de diazonio.' },
          { text: `NaNO₂ / HCl a 60 °C, luego ${s.r}`, note: 'En caliente la sal de diazonio se descompone (sale N₂ y se forma fenol).' },
          { text: `NaNO₂ / HCl a 0–5 °C, luego ${pick(rng, SAND.filter(x => x !== s)).r}`, note: 'Ese reactivo pone otro grupo.' }], { ...b, explain: `Diazotación en frío y después ${s.r}: ${s.p}.` });
        const cards = shuffle(rng, [['nit', 'HNO₃ / H₂SO₄'], ['red', 'Fe / HCl, luego NaOH'], ['diaz', 'NaNO₂ / HCl, 0–5 °C'], ['x', s.r]]).map(([id, text]) => ({ id, text }));
        return order(`Estilo PEP: desde benceno hasta ${s.p}. Ordena los pasos.`, cards, ['nit', 'red', 'diaz', 'x'], { ...b, direction: 'Del primero al último.', explain: `Nitrar → reducir a anilina → diazotar en frío → ${s.r}.` });
      }
      if (kind === 'acil') {
        const am = pick(rng, AMINES.filter(x => (level === 1 ? x.t === 1 : level === 2 ? x.t < 3 : true))), ac = pick(rng, ACYL), b = { ...base, concept: 'am.acilacion' };
        if (level === 3 && rng() < 0.4) return statements(rng, 3, BANKS.acilacion, b);
        if (level === 1) return choice(rng, `${am.n[0].toUpperCase()}${am.n.slice(1)} + ${ac.n}. ¿Qué grupo funcional se forma?`, 'Una amida', [{ text: 'Un éster', note: 'Un éster se forma con un alcohol, no con una amina.' }, { text: 'Una imina', note: 'Una imina se forma con un aldehído o una cetona.' }, { text: 'Una amina más sustituida', note: 'El C=O se conserva: es una amida.' }], { ...b, explain: `El N de la ${am.n} reemplaza al Cl del cloruro de ácido: se forma una amida (R–CO–NH–).` });
        if (level === 5 && rng() < 0.6) {
          const q = pick(rng, [{ p: `¿Por qué la acilación de la ${am.n} se hace con 2 equivalentes de amina (o con piridina)?`, a: 'Para atrapar el HCl que se libera', d: [['Para que se forme una amida doble', 'La amida ya no se acila otra vez.'], ['Porque la mitad de la amina se oxida', 'No hay oxidante.'], ['Para acelerar la eliminación', 'No hay eliminación aquí.']], e: 'Cada acilación libera HCl; si nada lo atrapa, protona a la amina y la "apaga".' },
            { p: 'Una vez formada la amida, ¿por qué no se sigue acilando el N?', a: 'Su par libre está deslocalizado hacia el C=O: ya no es buen nucleófilo', d: [['Porque ya no tiene H', 'Una amida de amina 1° todavía tiene un H en el N.'], ['Porque precipita', 'El motivo es electrónico: resonancia.'], ['Sí se sigue acilando', 'No: por eso la acilación se detiene en una sola amida.']], e: 'Resonancia N–C=O: el par del N se reparte con el carbonilo y el N pierde nucleofilia (diap. 34).' }]);
          return choice(rng, `Estilo PEP: ${q.p}`, q.a, q.d.map(([text, note]) => ({ text, note })), { ...b, explain: q.e });
        }
        const right = am.N ? `${am.N}–${ac.g}` : 'No forma amida neutra: no tiene H en el N';
        const ds = am.N ? [{ text: 'No forma amida neutra: no tiene H en el N', note: `La ${am.n} es ${am.t}°: tiene H en el N y se acila.` }, { text: `${am.f.replace(/NH₂$|NH$/, '')}–NH₃⁺ Cl⁻ solamente`.replace('–NH₃', am.t === 2 ? 'NH₂⁺' : '–NH₃'), note: 'Eso le pasa a la segunda amina que atrapa el HCl; la primera forma la amida.' }, { text: `${am.N}–${ac.g.replace('CO–', 'CH₂–')}`, note: 'El C=O se conserva: se forma una amida, no una amina.' }]
          : [{ text: `${am.lose}–${ac.g}`, note: 'Una amina 3° tendría que perder un grupo alquilo: no pasa.', misconception: 'tertiary-acylation' }, { text: `${am.f}⁺–${ac.g}, una amida estable`, note: 'Se forma un ion acilamonio inestable, no una amida neutra.' }];
        if (level >= 4) return choice(rng, `Estilo PEP: ¿cuál de estas aminas NO forma amida con ${ac.n}?`, pick(rng, AMINES.filter(x => x.t === 3)).n, sample(rng, AMINES.filter(x => x.t < 3), 3).map(x => ({ text: x.n, note: `Es ${x.t}°: tiene H en el N y se acila.`, misconception: 'tertiary-acylation' })), { ...b, explain: 'La acilación cambia un H del N por el acilo: una amina 3° no tiene H en el N.' });
        return choice(rng, `${am.n[0].toUpperCase()}${am.n.slice(1)} + ${ac.n}. ¿Producto?`, right, ds, { ...b, explain: am.N ? `El N cambia un H por el acilo: ${right}.` : `La ${am.n} es 3°: no tiene H en el N, no forma amida.` });
      }
      const h = pick(rng, HOF), b = { ...base, concept: 'am.hofmann', slide: 36 };
      if ((level === 2 && rng() < 0.4) || (level >= 4 && rng() < 0.35)) return statements(rng, level, BANKS.hofmann, b);
      if (level === 1) {
        const q = pick(rng, [
          { p: 'En la eliminación de Hofmann, ¿qué alqueno predomina?', a: 'El menos sustituido', d: [['El más sustituido', 'Eso es Zaitsev; el grupo saliente –N(CH₃)₃⁺ es muy voluminoso.', 'zaitsev-hofmann'], ['No se forma alqueno', 'Sí: es una E2.']], e: 'Hofmann: el alqueno menos sustituido.' },
          { p: 'En la eliminación de Hofmann, ¿para qué sirve el Ag₂O con agua?', a: 'Cambia el I⁻ por OH⁻, la base que hará la E2', d: [['Oxida la amina', 'No oxida: solo cambia el contraión (precipita AgI).'], ['Metila el nitrógeno', 'Eso lo hace el CH₃I.'], ['Protona la amina', 'El Ag₂O no es un ácido.']], e: 'Ag₂O + H₂O: sale AgI y queda el hidróxido de amonio cuaternario.' },
          { p: 'En la eliminación de Hofmann, ¿qué grupo sale?', a: 'Trimetilamina, N(CH₃)₃', d: [['NH₂⁻', 'Es muy mal grupo saliente; por eso primero se metila.'], ['CH₃I', 'El CH₃I es un reactivo del primer paso.'], ['N₂', 'El N₂ sale de las sales de diazonio.']], e: 'El –N(CH₃)₃⁺ sale como trimetilamina neutra.' },
          { p: '¿Por qué en Hofmann gana el alqueno menos sustituido?', a: 'El grupo saliente es muy voluminoso: la base saca el H más accesible', d: [['Porque es el alqueno más estable', 'El más estable es el más sustituido (Zaitsev).', 'zaitsev-hofmann'], ['Porque es una E1', 'Es una E2.', 'e1-not-e2'], ['Porque no hay H en el carbono más sustituido', 'Sí los hay, pero cuesta más alcanzarlos.']], e: 'Grupo saliente grande → la base ataca el H del carbono menos impedido: producto de Hofmann.' }]);
        return choice(rng, q.p, q.a, q.d.map(([text, note, misconception]) => ({ text, note, misconception })), { ...b, explain: q.e });
      }
      if (level >= 4) {
        const cards = shuffle(rng, [['mei', 'CH₃I en exceso (sal cuaternaria)'], ['ag', 'Ag₂O, H₂O (contraión OH⁻)'], ['cal', 'Calor (E2)']]).map(([id, text]) => ({ id, text }));
        if (level === 5) return order(`Estilo PEP (pregunta 6): ordena los pasos para obtener ${h.h} desde ${h.a.split(',')[0]}.`, cards, ['mei', 'ag', 'cal'], { ...b, direction: 'Del primero al último.', explain: `Metilar → cambiar el contraión → calentar: ${h.h} (el menos sustituido).` });
      }
      if (level === 4 && rng() < 0.4) return choice(rng, `${h.a.split(',')[0]} + 1) CH₃I en exceso 2) Ag₂O, H₂O 3) calor. Además del alqueno, ¿qué sale?`, 'Trimetilamina, N(CH₃)₃, y agua', [{ text: 'NH₃', note: 'El N salió metilado tres veces: sale N(CH₃)₃.' }, { text: 'CH₃OH', note: 'Los metilos se quedan en el N.' }, { text: 'N₂', note: 'El N₂ sale de las sales de diazonio.' }], { ...b, explain: 'El OH⁻ saca un H, se forma el alqueno y el –N(CH₃)₃⁺ sale como trimetilamina (más agua).' });
      return choice(rng, `${h.a} + 1) CH₃I en exceso 2) Ag₂O, H₂O 3) calor. ¿Producto principal?`, h.h, [{ text: h.z, note: 'Ese es el de Zaitsev (más sustituido). Con –N(CH₃)₃⁺ gana el menos sustituido.', misconception: 'zaitsev-hofmann' }, { text: h.a.split(',')[0].replace('amina', 'ol'), note: 'Es una eliminación: se forma un alqueno.' }, { text: 'Una amida', note: 'No hay acilo: es una eliminación.' }], { ...b, explain: `Hofmann da el alqueno menos sustituido: ${h.h}.` });
    }
  };

  /* ════════ 11. Espectroscopía (Misión 8). Masas nominales. ════════ */
  const SPEC = [
    { n: 'Etilamina', f: 'C₂H₇N', m: 45, t: 1 }, { n: 'Dimetilamina', f: 'C₂H₇N', m: 45, t: 2 },
    { n: 'Propilamina', f: 'C₃H₉N', m: 59, t: 1 }, { n: 'Etilmetilamina', f: 'C₃H₉N', m: 59, t: 2 }, { n: 'Trimetilamina', f: 'C₃H₉N', m: 59, t: 3 },
    { n: 'Butilamina', f: 'C₄H₁₁N', m: 73, t: 1 }, { n: 'Dietilamina', f: 'C₄H₁₁N', m: 73, t: 2 }, { n: 'N,N-Dimetiletilamina', f: 'C₄H₁₁N', m: 73, t: 3 },
    { n: 'Anilina', f: 'C₆H₇N', m: 93, t: 1 }, { n: 'N-Metilanilina', f: 'C₇H₉N', m: 107, t: 2 }, { n: 'N,N-Dimetilanilina', f: 'C₈H₁₁N', m: 121, t: 3 }
  ];
  const OTHERS = [{ n: 'Butano', m: 58, N: 0 }, { n: 'Etanol', m: 46, N: 0 }, { n: 'Acetona', m: 58, N: 0 }, { n: 'Etilendiamina', m: 60, N: 2 }, { n: 'Propilamina', m: 59, N: 1 }, { n: 'Piridina', m: 79, N: 1 }];
  const PEAKS = ['dos picos', 'un pico', 'ningún pico'];
  const espectro = {
    id: 'espectro', title: 'IR, masas y RMN', mission: 'm8', concepts: ['am.espectro'],
    make(rng, level) {
      const base = { concept: 'am.espectro', slide: 44, hint: 'IR: 2 picos N–H → 1°, 1 → 2°, 0 → 3°. Masas: M impar → número impar de N.' };
      if (level === 1) { const t = 1 + Math.floor(rng() * 3);
        if (rng() < 0.5) return choice(rng, `Una amina ${TYPE[t].toLowerCase().replace(/ \(.*\)/, '')}, ¿cuántos picos N–H muestra entre 3350 y 3500 cm⁻¹?`, PEAKS[t - 1], PEAKS.filter((_, i) => i !== t - 1).map(x => ({ text: x, note: '1° → dos (estiramiento simétrico y asimétrico), 2° → uno, 3° → ninguno.', misconception: 'ir-peaks' })), { ...base, explain: `${TYPE[t]}: ${PEAKS[t - 1]}.` });
        return choice(rng, `Una amina muestra ${PEAKS[t - 1]} entre 3350 y 3500 cm⁻¹. ¿Qué tipo es?`, TYPE[t], [1, 2, 3].filter(x => x !== t).map(x => ({ text: TYPE[x], note: '2 picos → 1°, 1 pico → 2°, ninguno → 3°.', misconception: 'ir-peaks' })), { ...base, explain: `${PEAKS[t - 1][0].toUpperCase()}${PEAKS[t - 1].slice(1)} → ${TYPE[t].toLowerCase()}.` }); }
      if (level === 2) { const MS = [...OTHERS, ...SPEC.map(x => ({ n: x.n, m: x.m, N: 1 }))], one = pick(rng, MS.filter(x => x.N === 1)), rest = sample(rng, MS.filter(x => x.m % 2 === 0), 3);
        if (rest.length === 3 && rng() < 0.6) return choice(rng, 'Por la regla del nitrógeno, ¿cuál de estas masas (M⁺) puede ser de un compuesto con UN nitrógeno?', `M⁺ = ${one.m}`, rest.map(x => ({ text: `M⁺ = ${x.m}`, note: `Masa par: 0 o un número par de N (como ${x.n.toLowerCase()}).`, misconception: 'n-rule' })), { ...base, slide: 47, explain: `${one.m} es impar: número impar de N (como ${one.n.toLowerCase()}).` });
        const o = pick(rng, OTHERS), odd = o.m % 2 === 1;
        return choice(rng, `Un compuesto tiene ion molecular M⁺ = ${o.m}. ¿Qué dice la regla del nitrógeno?`, odd ? 'Tiene un número impar de N' : 'Tiene 0 o un número par de N', [{ text: odd ? 'Tiene 0 o un número par de N' : 'Tiene un número impar de N', note: 'Masa impar ⇔ número impar de N.', misconception: 'n-rule' }, { text: 'Tiene exactamente un O', note: 'La regla del nitrógeno solo habla de N.', misconception: 'n-rule' }, { text: odd ? 'Tiene exactamente 2 N' : 'Tiene exactamente 1 N', note: 'Masa impar ⇔ número impar de N.', misconception: 'n-rule' }], { ...base, slide: 47, explain: `${o.m} es ${odd ? 'impar' : 'par'}: ${odd ? 'número impar de N' : '0 o un número par de N'} (por ejemplo, ${o.n.toLowerCase()}).` }); }
      if (level === 3) { const fm = pick(rng, ['C₃H₉N', 'C₄H₁₁N']), grp = SPEC.filter(x => x.f === fm), x = pick(rng, grp);
        return choice(rng, `Un compuesto ${x.f} muestra ${PEAKS[x.t - 1]} N–H en el IR. ¿Cuál es?`, x.n, grp.filter(y => y !== x).map(y => ({ text: y.n, note: `Es ${TYPE[y.t].toLowerCase()}: mostraría ${PEAKS[y.t - 1]}.`, misconception: 'ir-peaks' })), { ...base, explain: `${PEAKS[x.t - 1]} → ${TYPE[x.t].toLowerCase()}: ${x.n}.` }); }
      const x = pick(rng, SPEC.filter(y => level === 5 ? y.t === 3 : true));
      const ds = sample(rng, SPEC.filter(y => y !== x && (y.m !== x.m || y.t !== x.t)), 3).map(y => ({ text: y.n, note: `${y.n}: M = ${y.m}, ${PEAKS[y.t - 1]} N–H.` }));
      if (level === 4) return choice(rng, `M⁺ = ${x.m} y ${PEAKS[x.t - 1]} N–H en el IR. ¿Qué compuesto es?`, x.n, ds, { ...base, explain: `M = ${x.m} (${x.f}) y ${PEAKS[x.t - 1]}: ${x.n}.` });
      return choice(rng, `Estilo PEP: M⁺ = ${x.m}, sin picos entre 3350 y 3500 cm⁻¹; con HCl aparece una banda ancha entre 2200 y 3000 cm⁻¹. ¿Qué es?`, x.n, ds, { ...base, explain: `Masa impar: un N. Sin N–H pero con N–H⁺ al protonarla: amina 3°, ${x.n}.` });
    }
  };


  /* ════════ 12. Estructura: Lewis, par libre y geometría (bases y Misión 1) ════════ */
  const VAL = [{ a: 'H', v: 1 }, { a: 'C', v: 4 }, { a: 'N', v: 5 }, { a: 'O', v: 6 }, { a: 'Cl', v: 7 }, { a: 'Br', v: 7 }, { a: 'S', v: 6 }];
  const HYB = [{ sp: 'el N de la anilina (aprox., par algo deslocalizado)', h: 'sp³', note: 'Se suele tratar como sp³ algo aplanado; su par se deslocaliza parcialmente al anillo.' }, { sp: 'el N de la piperidina', h: 'sp³' }, { sp: 'el N del ion anilinio (C₆H₅NH₃⁺)', h: 'sp³' }, { sp: 'el N de un ion iminio (R₂C=NH₂⁺)', h: 'sp²' }, { sp: 'el N de la acetonitrilo (CH₃–C≡N)', h: 'sp' }, { sp: 'el N de la metilamina (CH₃–NH₂)', h: 'sp³' }, { sp: 'el N del ion amonio (NH₄⁺)', h: 'sp³' }, { sp: 'el N de la trimetilamina', h: 'sp³' }, { sp: 'el N de la piridina', h: 'sp²' },
    { sp: 'el N del pirrol', h: 'sp²' }, { sp: 'el N de una amida (R–CO–NH₂)', h: 'sp²', note: 'Por resonancia con el C=O, el N queda plano.' }, { sp: 'el N de una imina (R₂C=NH)', h: 'sp²' }, { sp: 'el N de un nitrilo (R–C≡N)', h: 'sp' }];
  const N3 = [['etil', 'metil', 'propil'], ['bencil', 'etil', 'metil'], ['etil', 'isopropil', 'metil'], ['butil', 'etil', 'metil']];
  const estructura = {
    id: 'estructura', title: 'Lewis, par libre y geometría', mission: 'm1', concepts: ['base.lewis', 'am.par-libre', 'am.geometria'],
    make(rng, level, want) {
      want = want || pick(rng, this.concepts);
      if (want === 'base.lewis') {
        const base = { concept: 'base.lewis', slide: 5, hint: 'Cada átomo trae sus electrones de valencia. Los que no están en enlaces van como pares libres.' };
        if ((level === 3 || level === 5) && rng() < 0.5) return statements(rng, level, BANKS.lewis, base);
        if (level === 1) { const x = pick(rng, VAL);
          return choice(rng, `¿Cuántos electrones de valencia trae el ${x.a}?`, String(x.v), [1, 4, 5, 6, 7].filter(n => n !== x.v).map(n => ({ text: String(n), note: `Mira el grupo de la tabla: el ${x.a} trae ${x.v}.` })), { ...base, explain: `El ${x.a} trae ${x.v} electrones de valencia.` }); }
        if (level <= 4) { const sp = pick(rng, SPECIES.filter(x => (level === 4 ? x.hard : !x.hard)));
          return choice(rng, level === 2 ? `En ${sp.sp}, el ${sp.at} tiene ${sp.b} enlaces y carga ${qText(sp.q)}. ¿Cuántos pares libres tiene?` : `¿Cuántos pares libres tiene el ${sp.at} en ${sp.sp}?`, String(sp.lp),
            [0, 1, 2, 3].filter(n => n !== sp.lp).map(n => ({ text: String(n), note: `${sp.V} electrones − ${sp.b} en enlaces ${sp.q > 0 ? `− 1 por la carga +` : sp.q < 0 ? '+ 1 por la carga −' : ''} = ${sp.lp * 2}: ${sp.lp} par${sp.lp === 1 ? '' : 'es'}.` })),
            { ...base, explain: `El ${sp.at} tiene ${sp.b} enlaces y ${sp.lp} par${sp.lp === 1 ? '' : 'es'} libre${sp.lp === 1 ? '' : 's'} (carga ${qText(sp.q)}).` }); }
        const opts = shuffle(rng, [{ t: 'Trietilamina, (CH₃CH₂)₃N', lp: true }, { t: 'Ion tetrametilamonio, (CH₃)₄N⁺', lp: false }, { t: 'Ion anilinio, C₆H₅NH₃⁺', lp: false }, { t: 'Ion iminio, (CH₃)₂C=NH₂⁺', lp: false }]);
        const yes = pick(rng, [{ t: 'Trietilamina, (CH₃CH₂)₃N' }, { t: 'Piridina, C₅H₅N' }, { t: 'Metilamina, CH₃NH₂' }, { t: 'Anilina, C₆H₅NH₂' }]);
        return choice(rng, 'Estilo PEP: ¿cuál de estas especies tiene un N con par libre (puede ser base)?', yes.t, opts.filter(o => !o.lp).map(o => ({ text: o.t, note: 'Ese N tiene 4 enlaces y carga +: no le queda par libre.', misconception: 'lone-pair-not-group' })), { ...base, explain: `${yes.t}: N neutro con 3 enlaces y un par libre. Los N con 4 enlaces (y carga +) no tienen par.` });
      }
      if (want === 'am.par-libre') {
        const base = { concept: 'am.par-libre', slide: 5, hint: 'El par libre del N ataca: a un H⁺ (base) o a un carbono con carga parcial + (nucleófilo).' };
        if (level >= 2 && rng() < 0.45) return statements(rng, level, BANKS.parlibre, base);
        const RX5 = [{ r: 'CH₃NH₂ + HCl', a: 'Base: toma el H⁺' }, { r: '(CH₃CH₂)₃N + HBr', a: 'Base: toma el H⁺' }, { r: 'CH₃NH₂ + CH₃I', a: 'Nucleófilo: ataca al carbono' },
          { r: 'CH₃CH₂NH₂ + CH₃COCl', a: 'Nucleófilo: ataca al carbono' }, { r: 'C₆H₅NH₂ + H₂SO₄', a: 'Base: toma el H⁺' }, { r: '(CH₃)₂NH + bromoetano', a: 'Nucleófilo: ataca al carbono' }];
        if (level === 1 && rng() < 0.5) { const am = pick(rng, ['la metilamina', 'la trietilamina', 'la anilina', 'el amoníaco', 'la piridina']);
          return choice(rng, `¿Dónde está el par libre de ${am}?`, 'En el átomo de N', [{ text: 'En un H del N', note: 'Los H solo tienen su enlace; el par libre es del N.' }, { text: 'Repartido en los C', note: 'Está en el N (en la anilina, además, se deslocaliza un poco al anillo).' }, { text: 'No tiene par libre', note: 'Un N neutro con 3 enlaces tiene un par libre.', misconception: 'lone-pair-not-group' }], { ...base, explain: 'El N neutro con 3 enlaces conserva un par libre: con él es base y nucleófilo.' }); }
        if (level === 1) return choice(rng, 'Cuando una amina actúa como base, ¿qué hace su par libre?', 'Toma un H⁺', [{ text: 'Cede un H⁺', note: 'Eso haría un ácido. La amina acepta el protón.', misconception: 'nh-acid' }, { text: 'Ataca a un carbono', note: 'Eso es actuar como nucleófilo.', misconception: 'n-binds-cl' }, { text: 'Se va como grupo saliente', note: 'El par libre ataca; no se va.' }], { ...base, explain: 'Base de Brønsted: el par libre del N toma un H⁺ y queda R–NH₃⁺.' });
        if (level <= 3) { const x = pick(rng, RX5);
          return choice(rng, `En ${x.r}, ¿qué papel cumple la amina?`, x.a, [{ text: x.a.startsWith('Base') ? 'Nucleófilo: ataca al carbono' : 'Base: toma el H⁺', note: 'Mira qué recibe el par libre: un H⁺ (base) o un carbono (nucleófilo).', misconception: 'n-binds-cl' }, { text: 'Ácido: cede un H⁺', note: 'La amina usa su par libre para recibir, no cede H⁺.', misconception: 'nh-acid' }].concat(level === 3 ? [{ text: 'Grupo saliente', note: 'La amina entra a la reacción con su par libre.' }] : []), { ...base, explain: `${x.r}: ${x.a.toLowerCase()}.` }); }
        const q = pick(rng, [
          { p: '¿Por qué una sal de amonio cuaternario, R₄N⁺, no es básica?', a: 'Su N no tiene par libre: usó los 4 enlaces', d: [['Porque es muy voluminosa', 'El problema no es el tamaño: no le queda par.'], ['Porque ya está protonada', 'No tiene H en el N: tiene 4 grupos C.'], ['Sí es básica', 'Sin par libre no puede aceptar un H⁺.', 'lone-pair-not-group']] },
          { p: '¿Por qué una amina es más básica que un alcohol parecido?', a: 'El N es menos electronegativo que el O: suelta su par con más facilidad', d: [['Porque el N tiene más pares libres', 'El O tiene 2 pares y el N uno: no es por la cantidad.'], ['Porque las aminas son más pesadas', 'La masa no decide la basicidad.'], ['Porque el alcohol tiene H ácido', 'Lo que importa es cuánto se ofrece el par libre.']] },
          { p: 'La trimetilamina es buena base pero no forma amida con un cloruro de ácido. ¿Por qué?', a: 'Puede atacar con su par, pero no tiene H en el N para quedar neutra', d: [['No tiene par libre', 'Sí lo tiene: por eso es base.', 'lone-pair-not-group'], ['Es demasiado ácida', 'Es una base.', 'nh-acid'], ['El cloruro de ácido no es electrófilo', 'Sí lo es: las aminas 1° y 2° lo atacan.']], mc: 'tertiary-acyl' }]);
        return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${q.p}`, q.a, q.d.map(([text, note, misconception]) => ({ text, note, misconception })), { ...base, explain: q.a + '.' });
      }
      if (level >= 3 && rng() < 0.4) return statements(rng, level, BANKS.geometria, { concept: 'am.geometria', slide: 11, hint: '4 grupos (con el par libre) → sp³ y pirámide; el N se invierte rápido.' });
      const base = { concept: 'am.geometria', slide: 11, hint: 'Cuenta los "grupos" alrededor del N, incluido el par libre: 4 → sp³ (tetraédrico); 3 → sp²; 2 → sp.' };
      if (level === 1) { const x = pick(rng, HYB);
        return choice(rng, `¿Cuántos "grupos" (enlaces σ + pares libres) rodean a ${x.sp}?`, { 'sp³': '4 (sp³)', 'sp²': '3 (sp²)', 'sp': '2 (sp)' }[x.h], ['4 (sp³)', '3 (sp²)', '2 (sp)'].filter(t => t !== { 'sp³': '4 (sp³)', 'sp²': '3 (sp²)', 'sp': '2 (sp)' }[x.h]).map(text => ({ text, note: x.note || 'Cuenta enlaces σ y pares libres que no están en un sistema π.', misconception: 'lone-pair-not-group' })), { ...base, explain: `${x.sp}: ${x.h}.${x.note ? ` ${x.note}` : ''}` }); }
      if (level === 4 && rng() < 0.5) { const four = sample(rng, HYB, 4), tgtH = pick(rng, ['sp³', 'sp²', 'sp'].filter(h => four.filter(a => a.h === h).length === 1));
        if (tgtH) { const right = four.find(a => a.h === tgtH);
          return choice(rng, `¿En cuál de estas especies el N es ${tgtH}?`, right.sp, four.filter(a => a !== right).map(a => ({ text: a.sp, note: `Es ${a.h}.${a.note ? ` ${a.note}` : ''}`, misconception: 'lone-pair-not-group' })), { ...base, explain: `${right.sp}: ${tgtH}.` }); } }
      if (level === 2) { const sp = pick(rng, ['trimetilamina', 'metilamina', 'dimetilamina', 'amoníaco']);
        return choice(rng, `¿Qué forma tiene la molécula de ${sp} alrededor del N?`, 'Pirámide trigonal (≈ 107–108°)', [{ text: 'Plana trigonal (120°)', note: 'El par libre empuja los enlaces hacia abajo: no es plana.', misconception: 'flat-n' }, { text: 'Tetraédrica (109,5°)', note: 'Los electrones están en tetraedro, pero la molécula (solo átomos) es una pirámide.', misconception: 'tetra-shape' }, { text: 'Lineal (180°)', note: 'Eso sería con 2 grupos.' }], { ...base, explain: '4 grupos (3 enlaces + par libre) en tetraedro; contando solo átomos, pirámide trigonal.' }); }
      if (level === 3) { const x = pick(rng, HYB);
        return choice(rng, `¿Qué hibridación tiene ${x.sp}?`, x.h, ['sp³', 'sp²', 'sp'].filter(h => h !== x.h).map(h => ({ text: h, note: x.note || 'Cuenta enlaces σ y pares libres (en el pirrol el par está en un orbital p del anillo).', misconception: h === 'sp³' && x.h === 'sp²' ? 'lone-pair-not-group' : undefined })), { ...base, explain: `${x.sp}: ${x.h}.${x.note ? ` ${x.note}` : ''}` }); }
      const g = pick(rng, N3);
      if (level === 4) return choice(rng, `La ${g.join('')}amina tiene tres grupos distintos en el N. ¿Se pueden separar sus dos enantiómeros?`, 'No: el N se invierte muy rápido (como un paraguas)', [
        { text: 'Sí, como cualquier centro quiral', note: 'El par libre deja que el N se dé vuelta miles de millones de veces por segundo.' }, { text: 'No: no tiene centro quiral', note: 'Tiene 4 grupos distintos (contando el par libre); el problema es la inversión.' },
        { text: 'Solo si se calienta', note: 'Calentar acelera la inversión.' }], { ...base, explain: 'Inversión del nitrógeno: los dos enantiómeros se interconvierten muy rápido, así que no se pueden separar.' });
      const quat = `ion ${[...g, 'fenil'].sort().join('')}amonio`;
      return choice(rng, '¿Cuál de estas especies puede tener un N quiral que se pueda separar en enantiómeros?', `El ${quat} (4 grupos distintos, sin par libre)`, [
        { text: `La ${g.join('')}amina`, note: 'Tiene par libre: se invierte rápido.' }, { text: 'La trimetilamina', note: 'Tres grupos iguales: no es quiral.' }, { text: 'El ion tetrametilamonio', note: 'Cuatro grupos iguales: no es quiral.' }],
        { ...base, explain: 'Una sal cuaternaria con 4 grupos distintos no tiene par libre que permita la inversión: sus enantiómeros sí se pueden separar.' });
    }
  };

  /* ════════ 13. Ácido–base de Orgánica I (base) ════════ */
  const CONJ = { HCl: 'Cl⁻', 'ácido fórmico': 'formiato (HCOO⁻)', 'ácido benzoico': 'benzoato (C₆H₅COO⁻)', 'ácido acético': 'acetato (CH₃COO⁻)', 'ácido carbónico': 'bicarbonato (HCO₃⁻)', fenol: 'fenóxido (C₆H₅O⁻)', agua: 'hidróxido (OH⁻)' };
  const acidobase = {
    id: 'acidobase', title: 'Ácido–base y pKa', mission: null, concepts: ['base.acido-base'],
    make(rng, level) {
      const base = { concept: 'base.acido-base', slide: 17, hint: 'Menor pKa = ácido más fuerte = base conjugada más débil.' };
      const [a, b] = sample(rng, ACIDS, 2).sort((x, y) => x.k - y.k);
      if (level === 1) { const three = sample(rng, ACIDS, 3).sort((x, y) => x.k - y.k), strong = rng() < 0.6, tgt = strong ? three[0] : three[2];
        return choice(rng, `¿Cuál es el ácido ${strong ? 'MÁS' : 'MENOS'} fuerte: ${shuffle(rng, three).map(x => `${x.n} (pKa ${num(x.k)})`).join(', ')}?`, tgt.n, three.filter(x => x !== tgt).map(x => ({ text: x.n, note: `pKa ${num(x.k)}: menor pKa = ácido más fuerte.`, misconception: 'pka-inverted' })), { ...base, explain: `${tgt.n} tiene el pKa ${strong ? 'menor' : 'mayor'} (${num(tgt.k)}).` }); }
      if (level === 2) { const x = pick(rng, ACIDS);
        return choice(rng, `¿Cuál es la base conjugada de ${x.n}?`, CONJ[x.n], sample(rng, ACIDS.filter(y => y !== x), 3).map(y => ({ text: CONJ[y.n], note: `Esa es la base conjugada de ${y.n}.` })), { ...base, explain: `${x.n} pierde un H⁺: queda ${CONJ[x.n]}.` }); }
      if (level === 3) { const set = sample(rng, ACIDS, 3).sort((x, y) => y.k - x.k);
        return choice(rng, `¿Cuál es la base más fuerte: ${shuffle(rng, set).map(x => CONJ[x.n]).join(', ')}?`, CONJ[set[0].n], set.slice(1).map(x => ({ text: CONJ[x.n], note: `Su ácido (${x.n}, pKa ${num(x.k)}) es más fuerte: su base es más débil.`, misconception: 'pka-inverted' })), { ...base, explain: `La base más fuerte es la del ácido más débil: ${set[0].n} (pKa ${num(set[0].k)}).` }); }
      const d = Math.round((b.k - a.k) * 10) / 10;
      if (level === 4) return choice(rng, `${a.n} (pKa ${num(a.k)}) + ${CONJ[b.n]}. ¿Hacia dónde va el equilibrio?`, 'Hacia la derecha: se forma el ácido más débil', [{ text: 'Hacia la izquierda', note: `Gana el lado del ácido más débil: ${b.n} (pKa ${num(b.k)}).`, misconception: 'strong-side' }, { text: 'Mitad y mitad', note: `Los pKa difieren en ${num(d)} unidades.` }, { text: 'Hacia la derecha: se forma el ácido más fuerte', note: 'La dirección es correcta, pero la razón no: se forma el ácido MÁS DÉBIL.', misconception: 'strong-side' }], { ...base, explain: `Productos: ${CONJ[a.n]} + ${b.n} (pKa ${num(b.k)}, más débil): gana la derecha.` });
      return choice(rng, `Estilo PEP: ${a.n} (pKa ${num(a.k)}) + ${CONJ[b.n]} ⇌ ${CONJ[a.n]} + ${b.n} (pKa ${num(b.k)}). ¿Keq?`, pow10(d), [{ text: pow10(-d), note: 'Keq = 10^(pKa del ácido producto − pKa del ácido reactivo).', misconception: 'strong-side' }, { text: num(d), note: 'Ese es el exponente: Keq = 10 elevado a esa diferencia.' }, { text: pow10(Math.round((a.k + b.k) * 10) / 10), note: 'Se restan los pKa.' }], { ...base, explain: `Keq = 10^(${num(b.k)} − ${par(a.k)}) = ${pow10(d)}.` });
    }
  };

  /* ════════ 14. SN2 y E2 (base) ════════ */
  const SUBS = [{ n: 'CH₃Br (metílico)', c: 0 }, { n: '1-bromobutano (primario)', c: 1 }, { n: 'bromoetano (primario)', c: 1 }, { n: '2-bromopropano (secundario)', c: 2 }, { n: '2-bromobutano (secundario)', c: 2 }, { n: '2-bromo-2-metilpropano (terciario)', c: 3 }];
  const NUCS = [{ n: 'NaN₃', k: 'nuc' }, { n: 'NaCN', k: 'nuc' }, { n: 'NH₃', k: 'nuc' }, { n: 'ftalimida potásica', k: 'nuc' }, { n: 'NaOH concentrado y calor', k: 'base' }, { n: 'tBuOK (base voluminosa)', k: 'bulky' }, { n: 'NaOCH₂CH₃ y calor', k: 'base' }];
  const sneOut = (c, k) => (c === 3 ? (k === 'nuc' ? 'Casi no hay SN2 (carbono muy impedido)' : 'E2') : c === 2 ? (k === 'nuc' ? 'SN2' : 'E2') : k === 'bulky' && c === 1 ? 'E2' : 'SN2');
  const sne = {
    id: 'sne', title: 'SN2 y E2', mission: null, concepts: ['base.sn-e'],
    make(rng, level) {
      const base = { concept: 'base.sn-e', slide: 30, hint: 'SN2: carbono accesible (metílico, 1°) y buen nucleófilo. E2: base fuerte, sobre todo con carbonos 2° y 3° o bases voluminosas.' };
      const OUTS = ['SN2', 'E2', 'Casi no hay SN2 (carbono muy impedido)'];
      if (level <= 3) {
        const pool = level === 1 ? SUBS.filter(x => x.c <= 1 || x.c === 3) : SUBS, sb = pick(rng, pool);
        const nu = pick(rng, level === 1 ? NUCS.filter(x => (sb.c === 3 ? x.k !== 'nuc' : x.k === 'nuc')) : level === 2 ? NUCS.filter(x => x.k !== 'bulky') : NUCS), out = sneOut(sb.c, nu.k);
        return choice(rng, `${sb.n[0].toUpperCase()}${sb.n.slice(1)} + ${nu.n}. ¿Qué reacción predomina?`, out, OUTS.filter(o => o !== out).map(o => ({ text: o, note: `Carbono ${['metílico', 'primario', 'secundario', 'terciario'][sb.c]} con ${nu.k === 'nuc' ? 'un nucleófilo poco básico' : 'una base fuerte'}${nu.k === 'bulky' ? ' y voluminosa' : ''}.` })), { ...base, explain: `${['Metílico', 'Primario', 'Secundario', 'Terciario'][sb.c]} + ${nu.k === 'nuc' ? 'nucleófilo' : 'base fuerte'}: ${out}.` });
      }
      if (level >= 4 && rng() < 0.6) return statements(rng, level, BANKS.sne, base);
      if (level === 4) return choice(rng, '¿Qué solvente favorece una SN2 con un nucleófilo aniónico (como N₃⁻)?', pick(rng, ['DMSO (polar aprótico)', 'DMF (polar aprótico)', 'Acetona (polar aprótica)']), [{ text: 'Agua (polar prótico)', note: 'Los solventes próticos rodean al anión con puentes de H y lo frenan.' }, { text: 'Metanol (polar prótico)', note: 'Prótico: solvata y frena al nucleófilo.' }, { text: 'Hexano (apolar)', note: 'No disuelve la sal del nucleófilo.' }], { ...base, explain: 'Polar aprótico: disuelve la sal pero deja al anión "desnudo" y reactivo.' });
      const q = pick(rng, [
        { p: '¿Por qué la síntesis de Gabriel no sirve con un haluro terciario?', a: 'El carbono está muy impedido para la SN2 y el N⁻ actúa como base (E2)', d: [['Porque la ftalimida no es nucleófila', 'Sí lo es con haluros primarios.'], ['Porque los terciarios no tienen H', 'Sí tienen H en los carbonos vecinos: por eso eliminan.'], ['Sí sirve, solo es más lenta', 'Con terciarios predomina la eliminación.']] },
        { p: 'En una SN2, ¿qué le pasa a la configuración del carbono atacado?', a: 'Se invierte (ataque por detrás)', d: [['Se conserva', 'El nucleófilo entra por el lado opuesto al grupo saliente.'], ['Se racemiza', 'Eso pasa en la SN1 (carbocatión plano).'], ['Depende del solvente', 'En la SN2 siempre hay inversión.']] },
        { p: 'Una E2 necesita que el H y el grupo saliente estén…', a: 'Antiperiplanares (en lados opuestos, en el mismo plano)', d: [['Sinperiplanares', 'La E2 prefiere la disposición anti.'], ['En el mismo carbono', 'Están en carbonos vecinos.'], ['En cualquier posición', 'La geometría importa en la E2.']] }]);
      return choice(rng, `Estilo PEP: ${q.p}`, q.a, q.d.map(([text, note]) => ({ text, note })), { ...base, explain: q.a + '.' });
    }
  };

  const generators = [estructura, clasificar, carga, acidobase, sne, nombrar, nombrarAril, propiedades, sales, pkaGen, equilibrio, basicidad, sintesis, reacciones, espectro];

  /* ════════ Laboratorio libre: sustancias, reactivos y lo que pasa ════════ */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('benceno', 'Benceno', 'C₆H₆'), S('nitrobenceno', 'Nitrobenceno', 'C₆H₅–NO₂'), S('anilinio', 'Cloruro de anilinio', 'C₆H₅–NH₃⁺ Cl⁻'), S('anilina', 'Anilina', 'C₆H₅–NH₂'),
    S('diazonio', 'Cloruro de bencenodiazonio', 'C₆H₅–N₂⁺ Cl⁻'), S('clorobenceno', 'Clorobenceno', 'C₆H₅–Cl'), S('bromobenceno', 'Bromobenceno', 'C₆H₅–Br'), S('benzonitrilo', 'Benzonitrilo', 'C₆H₅–CN'),
    S('yodobenceno', 'Yodobenceno', 'C₆H₅–I'), S('fluorobenceno', 'Fluorobenceno', 'C₆H₅–F'), S('fenol', 'Fenol', 'C₆H₅–OH'), S('acetanilida', 'Acetanilida (una amida)', 'C₆H₅–NH–CO–CH₃'),
    S('bromopropano', '1-Bromopropano', 'CH₃CH₂CH₂–Br'), S('azida', 'Propilazida', 'CH₃CH₂CH₂–N₃'), S('propilamina', 'Propilamina', 'CH₃CH₂CH₂–NH₂'), S('ftalimidaK', 'Ftalimida potásica (N⁻)', 'C₆H₄(CO)₂N⁻ K⁺'),
    S('npropilftalimida', 'N-Propilftalimida', 'C₆H₄(CO)₂N–CH₂CH₂CH₃'), S('mezcla', 'Mezcla de aminas', 'propilamina + dipropilamina + tripropilamina + sal cuaternaria'), S('propilacetamida', 'N-Propilacetamida', 'CH₃CH₂CH₂–NH–CO–CH₃'),
    S('acetona', 'Acetona', '(CH₃)₂C=O'), S('isopropilamina', 'Isopropilamina', '(CH₃)₂CH–NH₂'), S('benzamida', 'Benzamida', 'C₆H₅–CO–NH₂'), S('bencilamina', 'Bencilamina', 'C₆H₅–CH₂–NH₂'),
    S('butanamina', '2-Butanamina', 'CH₃CH₂CH(NH₂)CH₃'), S('cuat', 'Yoduro de sec-butiltrimetilamonio', 'CH₃CH₂CH(N⁺(CH₃)₃)CH₃ I⁻'), S('cuatOH', 'Hidróxido de sec-butiltrimetilamonio', 'CH₃CH₂CH(N⁺(CH₃)₃)CH₃ OH⁻'),
    S('buteno', '1-Buteno (+ N(CH₃)₃)', 'CH₂=CH–CH₂–CH₃'), S('trietilamina', 'Trietilamina', '(CH₃CH₂)₃N'), S('trietilamonio', 'Cloruro de trietilamonio', '(CH₃CH₂)₃NH⁺ Cl⁻')
  ];
  const reagents = [['hno3', 'HNO₃ / H₂SO₄'], ['fehcl', 'Fe / HCl'], ['naoh', 'NaOH'], ['diazF', 'NaNO₂ / HCl, 0–5 °C'], ['diazC', 'NaNO₂ / HCl, en caliente'], ['cucl', 'CuCl'], ['cubr', 'CuBr'], ['cucn', 'CuCN'], ['ki', 'KI'],
    ['hbf4', 'HBF₄ y calor'], ['agua', 'H₂O y calor'], ['acCl', 'CH₃COCl (cloruro de acetilo)'], ['hcl', 'HCl'], ['nh3', 'NH₃'], ['nan3', 'NaN₃'], ['lah', 'LiAlH₄'], ['ftK', 'Ftalimida + KOH'], ['hid', 'Hidrazina (H₂N–NH₂)'],
    ['mei', 'CH₃I en exceso'], ['ag2o', 'Ag₂O, H₂O'], ['calor', 'Calor'], ['redam', 'NH₃ + NaBH₃CN']].map(([id, label]) => ({ id, label }));
  const RX = { // [sustancia, reactivo] → [nueva sustancia, por qué]
    'benceno>hno3': ['nitrobenceno', 'Nitración: el NO₂⁺ ataca el anillo y entra un grupo nitro.'],
    'nitrobenceno>fehcl': ['anilinio', 'El nitro se reduce (pierde los O, gana H). En medio ácido queda como sal de anilinio.'],
    'anilinio>naoh': ['anilina', 'El NaOH le quita el H⁺: queda la anilina neutra.'], 'anilina>hcl': ['anilinio', 'El par libre atrapa el H⁺: sal de anilinio.'],
    'anilina>diazF': ['diazonio', 'Diazotación: el NH₂ se convierte en –N₂⁺, el mejor grupo saliente. En frío la sal aguanta.'],
    'diazonio>cucl': ['clorobenceno', 'Sandmeyer: sale N₂ (gas) y entra Cl.'], 'diazonio>cubr': ['bromobenceno', 'Sandmeyer: sale N₂ y entra Br.'], 'diazonio>cucn': ['benzonitrilo', 'Sandmeyer: sale N₂ y entra CN.'],
    'diazonio>ki': ['yodobenceno', 'El yoduro reemplaza al N₂ sin necesidad de cobre.'], 'diazonio>hbf4': ['fluorobenceno', 'Schiemann: con HBF₄ y calor sale N₂ y entra F.'], 'diazonio>agua': ['fenol', 'En agua caliente sale N₂ y entra OH: fenol.'],
    'diazonio>calor': ['fenol', 'Al calentarla en agua la sal se descompone: sale N₂ y el agua la convierte en fenol. Por eso se trabaja en hielo.'],
    'anilina>acCl': ['acetanilida', 'Acilación: el N cambia un H por el acetilo. Se forma una amida.'],
    'bromopropano>nan3': ['azida', 'SN2: la azida reemplaza al Br. Entra una sola vez.'], 'azida>lah': ['propilamina', 'El LiAlH₄ reduce la azida: sale N₂ y queda la amina primaria, limpia.'],
    'bromopropano>nh3': ['mezcla', 'SN2, pero la propilamina formada también ataca al bromuro: sobrealquilación.'],
    'bromopropano>ftK': ['npropilftalimida', 'Gabriel: el N⁻ de la ftalimida hace la SN2. No vuelve a reaccionar.'], 'npropilftalimida>hid': ['propilamina', 'La hidrazina libera la amina primaria pura.'],
    'propilamina>acCl': ['propilacetamida', 'Acilación: la amina primaria forma la amida.'], 'propilamina>mei': ['mezcla', 'El CH₃I metila el N una y otra vez: termina en sal cuaternaria (y en el camino, mezcla).'],
    'acetona>redam': ['isopropilamina', 'Aminación reductiva: se forma la imina y el NaBH₃CN la reduce. El C=O queda como C–NH₂.'],
    'benzamida>lah': ['bencilamina', 'El LiAlH₄ reduce la amida: el C=O pasa a CH₂.'],
    'butanamina>mei': ['cuat', 'Tres metilaciones: sal de amonio cuaternario con I⁻.'], 'cuat>ag2o': ['cuatOH', 'El Ag₂O con agua cambia el I⁻ por OH⁻ (precipita AgI).'],
    'cuatOH>calor': ['buteno', 'E2 de Hofmann: el OH⁻ saca el H del CH₃ (el más accesible) y sale N(CH₃)₃. Producto principal: el alqueno menos sustituido.'],
    'trietilamina>hcl': ['trietilamonio', 'El par libre atrapa el H⁺: sal de trietilamonio.'], 'trietilamonio>naoh': ['trietilamina', 'El NaOH libera la amina.']
  };
  const WHY_NOT = { // por qué no pasa nada útil, según el reactivo y la sustancia
    cucl: 'El CuCl solo reemplaza un grupo –N₂⁺. Primero necesitas la sal de diazonio.', cubr: 'El CuBr solo reemplaza un grupo –N₂⁺. Primero necesitas la sal de diazonio.', cucn: 'El CuCN solo reemplaza un grupo –N₂⁺. Primero necesitas la sal de diazonio.',
    ki: 'El KI reemplaza un –N₂⁺; aquí no hay.', hbf4: 'HBF₄ y calor sirven sobre una sal de diazonio.', hid: 'La hidrazina libera la amina de una N-alquilftalimida; aquí no hay ninguna.',
    ag2o: 'El Ag₂O cambia el contraión de una sal cuaternaria; aquí no hay.', ftK: 'La ftalimida potásica necesita un haluro de alquilo para hacer la SN2.',
    nan3: 'La azida necesita un haluro de alquilo (SN2).', redam: 'La aminación reductiva necesita un aldehído o una cetona.', hno3: 'La nitración la vas a usar con el benceno.',
    fehcl: 'El Fe/HCl reduce grupos nitro; aquí no hay.', lah: 'El LiAlH₄ reduce azidas, amidas y nitrilos; esta sustancia no tiene nada que reducir a amina.'
  };
  function labReact(fromId, reagentId) {
    const r = RX[`${fromId}>${reagentId}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    const from = substances.find(x => x.id === fromId);
    if (reagentId === 'diazC' && ['anilina', 'anilinio'].includes(fromId)) return { to: 'fenol', ok: true, why: 'En caliente la sal de diazonio se forma pero se descompone al tiro: sale N₂ y el agua da fenol. Si querías otra cosa, hazlo en hielo.' };
    if (['diazF', 'diazC'].includes(reagentId) && ['propilamina', 'butanamina'].includes(fromId)) return { to: 'mezcla', ok: true, why: 'Con una amina alquílica el diazonio pierde N₂ al instante y forma un carbocatión: mezcla de alcoholes y alquenos. La diazotación útil es con anilinas.' };
    if (reagentId === 'acCl' && fromId === 'trietilamina') return { to: null, ok: false, why: 'La trietilamina es 3°: no tiene H en el N, así que no forma amida. Solo atrapa el HCl que se libere.' };
    if (reagentId === 'acCl' && ['acetanilida', 'propilacetamida', 'benzamida'].includes(fromId)) return { to: null, ok: false, why: 'Una amida no se vuelve a acilar: su N casi no tiene par disponible.' };
    if (reagentId === 'hcl' && ['acetanilida', 'propilacetamida', 'benzamida'].includes(fromId)) return { to: null, ok: false, why: 'El N de una amida casi no es básico: no se protona como una amina.' };
    if (reagentId === 'hcl' && ['propilamina', 'isopropilamina', 'bencilamina', 'butanamina'].includes(fromId)) return { to: null, ok: true, why: `Se forma la sal de amonio (${from.name.toLowerCase()} protonada). Con NaOH vuelve a ser la amina.` };
    if (reagentId === 'naoh') return { to: null, ok: false, why: 'El NaOH libera aminas de sus sales; aquí no hay una sal que liberar.' };
    if (reagentId === 'calor' && fromId === 'cuat') return { to: null, ok: false, why: 'Falta cambiar el I⁻ por OH⁻ (Ag₂O, H₂O): el I⁻ no es base suficiente para la E2.' };
    return { to: null, ok: false, why: WHY_NOT[reagentId] || `Con ${from?.name.toLowerCase()} este reactivo no hace nada útil en Aminas.` };
  }
  const lab = { substances, reagents, react: labReact, total: Object.keys(RX).length, starts: ['benceno', 'anilina', 'bromopropano', 'acetona', 'benzamida', 'butanamina', 'trietilamina'] };

  /* Criaturas del bestiario: una especie por familia de errores (diseño propio). */
  const creatures = {
    'base.lewis': ['Duende', '#6d8bd6'], 'base.carga': ['Chispa', '#d6a23f'], 'base.acido-base': ['Gólem', '#8a6fd1'], 'base.sn-e': ['Sombra', '#4c8c7a'],
    'am.par-libre': ['Duende', '#6d8bd6'], 'am.clasificacion': ['Trasgo', '#7f9a3c'], 'am.geometria': ['Espectro', '#7aa4b5'], 'am.nombres': ['Escriba', '#a07a4a'], 'am.nombres-aril': ['Escriba', '#a07a4a'],
    'am.fisicas': ['Niebla', '#7fa3a0'], 'am.sales': ['Niebla', '#7fa3a0'], 'am.pka': ['Gólem', '#8a6fd1'], 'am.equilibrio': ['Gólem', '#8a6fd1'], 'am.resonancia': ['Serpiente', '#5f9e5a'],
    'am.heterociclos': ['Serpiente', '#5f9e5a'], 'am.orden': ['Serpiente', '#5f9e5a'], 'am.alquilacion': ['Hidra', '#c0574a'], 'am.reduccion': ['Hidra', '#c0574a'],
    'am.acilacion': ['Grifo', '#c98a1b'], 'am.hofmann': ['Grifo', '#c98a1b'], 'am.diazonio': ['Grifo', '#c98a1b'], 'am.espectro': ['Búho', '#5d6f9e']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['org-01'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
