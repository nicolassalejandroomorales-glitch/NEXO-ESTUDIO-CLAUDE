/* Ejercicios infinitos de Aromaticidad (Orgánica II, PEP 1). 5 niveles: 1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP.
   Las clasificaciones salen de una tabla de especies (electrones π, si es plana y continua); la respuesta se deduce, no se escribe. */
(() => {
  'use strict';
  const SRC = 'catedra-aromaticos';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (rng, list, n) => shuffle(rng, list).slice(0, n);
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  const number = (prompt, answer, unit, extra) => ({ type: 'number', prompt, answer, unit, tol: 0, ...extra, traps: (extra.traps || []).filter(t => t.value !== answer && Number.isFinite(t.value)) });

  /* ════════ Tabla de especies: π, si cumple criterios, y por qué ════════ */
  // ok = cíclico, plano y con un p en cada átomo; lvl = dificultad mínima. Fuente: cátedra (diap. 19–24, 49) y McMurry cap. 15.
  const SP = [
    { n: 'benceno', pi: 6, ok: true, lvl: 1, why: '6 C sp² y 3 dobles enlaces' },
    { n: 'ciclobutadieno (plano)', pi: 4, ok: true, lvl: 1, why: '2 dobles enlaces en un anillo plano' },
    { n: 'ciclooctatetraeno', pi: 8, ok: false, lvl: 2, why: 'se dobla en forma de tina: los p no forman un anillo continuo' },
    { n: 'ciclohexa-1,3-dieno', pi: 4, ok: false, lvl: 1, why: 'tiene dos CH₂ sp³ que cortan el anillo' },
    { n: 'ciclohexeno', pi: 2, ok: false, lvl: 1, why: 'cuatro CH₂ sp³ cortan el anillo' },
    { n: 'ciclopentadieno (C₅H₆)', pi: 4, ok: false, lvl: 2, why: 'el CH₂ sp³ corta el anillo' },
    { n: 'cicloheptatrieno (C₇H₈)', pi: 6, ok: false, lvl: 2, why: 'el CH₂ sp³ corta el anillo' },
    { n: 'anión ciclopentadienilo', pi: 6, ok: true, lvl: 2, ion: true, why: '2 dobles enlaces (4 e⁻) + el par del carbanión (2 e⁻)' },
    { n: 'catión ciclopentadienilo', pi: 4, ok: true, lvl: 3, ion: true, why: '2 dobles enlaces (4 e⁻) + un p vacío' },
    { n: 'catión tropilio (C₇H₇⁺)', pi: 6, ok: true, lvl: 3, ion: true, why: '3 dobles enlaces (6 e⁻) + un p vacío' },
    { n: 'catión ciclopropenilo', pi: 2, ok: true, lvl: 3, ion: true, why: '1 doble enlace (2 e⁻) + un p vacío' },
    { n: 'anión ciclopropenilo', pi: 4, ok: true, lvl: 3, ion: true, why: '1 doble enlace (2 e⁻) + el par del carbanión (2 e⁻)' },
    { n: 'anión cicloheptatrienilo', pi: 8, ok: true, lvl: 4, ion: true, why: '3 dobles enlaces (6 e⁻) + el par del carbanión (2 e⁻)' },
    { n: 'dicatión del ciclobutadieno', pi: 2, ok: true, lvl: 4, ion: true, why: '2 dobles enlaces (4 e⁻) menos 2 electrones por las dos cargas positivas' },
    { n: 'anión ciclononatetraenilo (C₉H₉⁻)', pi: 10, ok: true, lvl: 5, ion: true, why: '4 dobles enlaces (8 e⁻) + el par del carbanión (2 e⁻)' },
    { n: 'naftaleno', pi: 10, ok: true, lvl: 2, why: '5 dobles enlaces en dos anillos fusionados planos' },
    { n: 'antraceno', pi: 14, ok: true, lvl: 3, why: '7 dobles enlaces en tres anillos fusionados planos' },
    { n: 'azuleno', pi: 10, ok: true, lvl: 4, why: '5 dobles enlaces en un anillo de 5 fusionado con uno de 7, plano' },
    { n: '[18]anuleno', pi: 18, ok: true, lvl: 4, why: '9 dobles enlaces en un anillo grande que sí puede ser plano' },
    { n: '[10]anuleno (todo-cis)', pi: 10, ok: false, lvl: 4, why: 'no puede ser plano: demasiada tensión de ángulo' },
    { n: 'dianión del ciclooctatetraeno', pi: 10, ok: true, lvl: 5, ion: true, why: '4 dobles enlaces (8 e⁻) + 2 cargas negativas (2 e⁻): se aplana' },
    { n: 'piridina', pi: 6, ok: true, lvl: 2, het: true, why: '3 dobles enlaces; el par del N está en el plano y no cuenta' },
    { n: 'pirrol', pi: 6, ok: true, lvl: 2, het: true, why: '2 dobles enlaces + el par del N–H en el orbital p' },
    { n: 'furano', pi: 6, ok: true, lvl: 3, het: true, why: '2 dobles enlaces + uno de los pares del O' },
    { n: 'tiofeno', pi: 6, ok: true, lvl: 3, het: true, why: '2 dobles enlaces + uno de los pares del S' },
    { n: 'imidazol', pi: 6, ok: true, lvl: 4, het: true, why: '2 dobles enlaces + el par del N–H; el N tipo piridina no aporta su par' },
    { n: 'pirimidina', pi: 6, ok: true, lvl: 4, het: true, why: '3 dobles enlaces; los pares de los dos N quedan en el plano' },
    { n: 'oxazol', pi: 6, ok: true, lvl: 4, het: true, why: '2 dobles enlaces + un par del O; el par del N queda en el plano' },
    { n: 'indol', pi: 10, ok: true, lvl: 4, het: true, why: '4 dobles enlaces + el par del N–H (benceno fusionado con pirrol)' },
    { n: 'quinolina', pi: 10, ok: true, lvl: 4, het: true, why: '5 dobles enlaces; el par del N está en el plano (benceno fusionado con piridina)' },
    { n: 'piperidina', pi: 0, ok: false, lvl: 3, het: true, why: 'todos sus átomos son sp³: no hay sistema π' }
  ];
  const kind = s => (!s.ok ? 'No aromático' : s.pi % 4 === 2 ? 'Aromático' : 'Antiaromático');
  const KINDS = ['Aromático', 'Antiaromático', 'No aromático'];
  const NOTE = { 'Aromático': 'Aromático necesita anillo plano y continuo con 4n + 2 electrones π.', 'Antiaromático': 'Antiaromático necesita anillo plano y continuo con 4n electrones π.', 'No aromático': 'No aromático es cuando falla un criterio (sp³ o no plano).' };
  const art = n => /^(piridina|pirimidina|quinolina|piperidina)/.test(n) ? 'la' : 'el';
  const mcOf = s => !s.ok ? 'skip-planarity' : s.ion ? 'ion-count' : s.het ? 'count-all-pairs' : 'huckel-4n';
  const slideOf = s => s.ion ? 23 : s.het ? 24 : s.ok ? 20 : 19;
  const REASONS = { 'Aromático': n => `es plano, continuo y tiene ${n} e⁻ π (4n + 2)`, 'Antiaromático': n => `es plano, continuo y tiene ${n} e⁻ π (4n)`, 'No aromático': () => 'falla un criterio: hay un átomo sp³ o no es plano' };

  const huckel = {
    id: 'huckel', title: 'Aromático, antiaromático o no', mission: 'm2', concepts: ['ar.huckel', 'ar.criterios', 'ar.iones'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      const f = c === 'ar.iones' ? s => s.ion : c === 'ar.criterios' ? s => !s.ion && !s.het : s => !s.ion;
      const avail = SP.filter(s => s.lvl <= Math.max(level, c === 'ar.iones' ? 3 : 2) && f(s));
      const s = pick(rng, avail), k = kind(s), slide = slideOf(s);
      const mode = level <= 1 ? 'one' : level === 2 ? pick(rng, ['one', 'which']) : level === 3 ? pick(rng, ['count', 'which']) : pick(rng, ['why', 'which', 'count']);
      if (mode === 'count' && s.pi > 0) return number(`¿Cuántos electrones π hay en el anillo ${s.ok ? 'conjugado ' : ''}de${art(s.n) === 'el' ? 'l' : ' la'} ${s.n}?`, s.pi, 'e⁻', { concept: c, slide, label: 'electrones π', hint: 'Doble enlace: 2 e⁻. Carbanión: 2 e⁻. Carbocatión: p vacío (0 e⁻).',
        traps: [{ value: s.pi + 2, note: s.ion ? 'Un catión aporta un p vacío, no electrones.' : 'Contaste un par que no está en el sistema π.', misconception: s.ion ? 'ion-count' : 'count-all-pairs' }, { value: s.pi - 2, note: 'Falta un par o un doble enlace.', misconception: 'ion-count' }],
        solution: [s.why, `Total: ${s.pi} electrones π → ${k.toLowerCase()}`], explain: `${s.pi} π: ${s.why}.` });
      if (mode === 'which') { // ¿cuál de estas es…? una correcta y tres de otras clases
        const want2 = pick(rng, KINDS.filter(K => avail.some(x => kind(x) === K))), right = pick(rng, avail.filter(x => kind(x) === want2));
        const others = sample(rng, SP.filter(x => kind(x) !== want2 && x.lvl <= Math.max(level, 2) + 1), 3);
        return choice(rng, `${level === 5 ? 'Estilo PEP (P1): ' : ''}¿Cuál de estas especies es ${want2.toLowerCase().replace(/o$/, 'a')}?`, right.n, others.map(o => ({ text: o.n, note: `${kind(o)}: ${o.why}.`, misconception: mcOf(o) })),
          { concept: c, slide: slideOf(right), hint: 'Revisa cada una: ¿plana y continua? ¿cuántos π?', explain: `${right.n}: ${right.why}.` }); }
      if (mode === 'why') { const right = `${k}, porque ${REASONS[k](s.pi)}`;
        const wrong = KINDS.filter(K => K !== k).map(K => ({ text: `${K}, porque ${REASONS[K](K === 'No aromático' ? 0 : s.pi)}`, note: s.ok ? `Tiene ${s.pi} π: ${s.why}.` : `Falla un criterio: ${s.why}.`, misconception: mcOf(s) }));
        if (s.ok) wrong.push({ text: `${k}, porque ${REASONS[k === 'Aromático' ? 'Antiaromático' : 'Aromático'](s.pi)}`, note: `${s.pi} es ${s.pi % 4 === 2 ? '4n + 2' : '4n'}.`, misconception: 'huckel-4n' });
        else wrong.push({ text: `No aromático, porque tiene ${s.pi} e⁻ π`, note: 'El número de π no es el problema: el problema es que falla un criterio.', misconception: 'skip-planarity' });
        return choice(rng, `${level === 5 ? 'Estilo PEP (P1): ' : ''}Clasifica ${art(s.n)} ${s.n} y justifica.`, right, wrong.filter(w => w.text !== right),
          { concept: c, slide, hint: 'Primero los criterios (cíclico, plano, continuo); después cuenta π.', explain: `${right}: ${s.why}.` }); }
      return choice(rng, `${art(s.n) === 'la' ? 'La' : 'El'} ${s.n} es…`, k, KINDS.filter(x => x !== k).map(text => ({ text, note: NOTE[text], misconception: mcOf(s) })),
        { concept: c, slide, hint: 'Primero: ¿cíclico, plano y con un p en cada átomo? Después cuenta π.', explain: `${k}: ${s.why}${s.ok ? ` (${s.pi} electrones π)` : ''}.` });
    }
  };

  /* ════════ Heterociclos: π, pares y basicidad ════════ */
  const PAIRS = [['N de la piridina', false], ['N del pirrol', true], ['O del furano (un par)', true], ['S del tiofeno (un par)', true], ['N–H del imidazol', true], ['N tipo piridina del imidazol', false], ['N de la pirimidina', false], ['N del indol', true], ['N de la quinolina', false], ['N del oxazol', false], ['O del oxazol (un par)', true]];
  const BASIC = [['piperidina (amina no aromática)', 11.1], ['amoníaco', 9.25], ['imidazol', 7.0], ['piridina', 5.2], ['anilina', 4.6], ['pirimidina', 1.3], ['pirrol', -3.8]];
  const hetero = {
    id: 'hetero', title: 'Heterociclos', mission: 'm3', concepts: ['ar.heterociclos'],
    make(rng, level) {
      if (level <= 2) { const s = pick(rng, SP.filter(x => x.het && x.pi > 0 && x.lvl <= level + 2));
        return number(`¿Cuántos electrones π tiene ${art(s.n)} ${s.n}?`, s.pi, 'e⁻', { concept: 'ar.heterociclos', slide: 24, label: 'electrones π', hint: '¿El par del heteroátomo está en p o en el plano?',
          traps: [{ value: s.pi + 2, note: 'Contaste un par que está en el plano.', misconception: 'count-all-pairs' }, { value: s.pi - 2, note: 'Falta el par que sí entra al orbital p.' }], solution: [s.why, `Total: ${s.pi} → aromático`], explain: `${s.pi} π.` }); }
      if (level === 3) { const [n, inside] = pick(rng, PAIRS), right = inside ? 'Sí: está en el orbital p y forma parte de los electrones π' : 'No: está en un sp², en el plano del anillo';
        return choice(rng, `¿El par libre del ${n} forma parte del sistema π aromático?`, right, [{ text: inside ? 'No: está en un sp², en el plano del anillo' : 'Sí: está en el orbital p y forma parte de los electrones π', note: 'Si el átomo ya tiene un doble enlace en el anillo, su par queda en el plano.', misconception: 'count-all-pairs' }, { text: 'Sí, todos los pares de un heteroátomo cuentan siempre', note: 'Solo cuenta el par que ocupa el orbital p.', misconception: 'count-all-pairs' }, { text: 'Depende del solvente', note: 'Depende de la estructura, no del solvente.' }],
          { concept: 'ar.heterociclos', slide: 49, hint: '¿Ese átomo tiene un doble enlace en el anillo?', explain: right + '.' }); }
      // basicidad: elegir la más (o menos) básica entre 3 o 4, con diferencias claras
      let set; do { set = sample(rng, BASIC, level === 5 ? 4 : 3); } while (set.some((x, i) => set.some((y, j) => i !== j && Math.abs(x[1] - y[1]) < 0.5)));
      const most = rng() < 0.6, pickB = set.reduce((x, y) => (most ? x[1] > y[1] : x[1] < y[1]) ? x : y);
      const why = b => b[0].startsWith('pirrol') ? 'su par es parte de los 6 π: protonarlo destruye la aromaticidad' : b[0].startsWith('piperidina') || b[0] === 'amoníaco' ? 'su par está en un sp³ y libre' : b[0] === 'anilina' ? 'su par se deslocaliza hacia el anillo' : b[0] === 'pirimidina' ? 'el segundo N atrae electrones y baja la basicidad' : b[0] === 'imidazol' ? 'el catión que se forma está estabilizado por resonancia' : 'su par está en un sp² en el plano, libre pero con más carácter s';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Cuál es la base ${most ? 'más fuerte' : 'más débil'}: ${set.map(x => x[0]).join(', ')}?`, `${pickB[0]}: ${why(pickB)}`,
        set.filter(x => x !== pickB).map(x => ({ text: `${x[0]}: ${why(x)}`, note: `pKaH ≈ ${String(x[1]).replace('.', ',').replace('-', '−')}; ${pickB[0]} ≈ ${String(pickB[1]).replace('.', ',').replace('-', '−')}.`, misconception: 'count-all-pairs' })),
        { concept: 'ar.heterociclos', slide: 49, hint: '¿El par que capta el H⁺ está libre, en sp² o comprometido en el anillo aromático?', explain: `${pickB[0]} (pKaH ≈ ${String(pickB[1]).replace('.', ',').replace('-', '−')}): ${why(pickB)}.` });
    }
  };

  /* ════════ Benceno y estabilidad ════════ */
  const BENZ = { topic: 'Estructura del benceno', T: ['Los seis enlaces C–C del benceno miden lo mismo (≈ 1,39 Å).', 'Los C del benceno son sp² y el ángulo C–C–C es 120°.', 'Las estructuras de Kekulé son formas de resonancia, no moléculas distintas.', 'El círculo representa 6 electrones π deslocalizados.', 'La fórmula del benceno es C₆H₆.', 'El benceno es plano: los 6 orbitales p quedan paralelos.', 'Solo existe un 1,2-dibromobenceno, como predice el híbrido de resonancia.'],
    F: [['El benceno alterna enlaces simples y dobles de distinto largo.', 'todos miden lo mismo: es un híbrido.', 'kekule-alternating'], ['Las dos estructuras de Kekulé están en equilibrio rápido.', 'no hay equilibrio: la molécula real es el híbrido.', 'kekule-alternating'], ['Los C del benceno son sp³.', 'son sp²: cada uno tiene un p libre.', 'kekule-alternating'], ['Existen dos 1,2-dibromobencenos distintos.', 'solo hay uno, porque los enlaces son equivalentes.', 'kekule-alternating'], ['El benceno tiene ángulos de 109,5°.', 'es plano con ángulos de 120°.', 'kekule-alternating']] };
  const STAB = { topic: 'Reactividad y estabilidad del benceno', T: ['El benceno no decolora el Br₂ en CCl₄ sin catalizador.', 'El benceno no reacciona con KMnO₄ en frío.', 'Con Br₂ y FeBr₃ el benceno da sustitución, no adición.', 'El benceno libera menos calor al hidrogenarse que tres C=C aislados.', 'La sustitución conserva el anillo aromático; la adición lo rompería.', 'La energía de resonancia del benceno es cercana a 150 kJ/mol.'],
    F: [['El benceno decolora el Br₂ como un alqueno.', 'no adiciona: perdería la aromaticidad.', 'benzene-adds'], ['Con Br₂ y FeBr₃ el benceno da un producto de adición.', 'da sustitución (bromobenceno + HBr).', 'benzene-adds'], ['El benceno libera más calor que tres C=C aislados al hidrogenarse.', 'libera menos: ya es más estable.', 'benzene-adds'], ['El KMnO₄ oxida fácilmente el anillo del benceno.', 'el anillo resiste; solo se oxidan cadenas laterales con H bencílico.', 'benzene-adds'], ['La energía de resonancia hace al benceno más reactivo.', 'lo hace más estable y menos reactivo.', 'benzene-adds']] };
  function statements(rng, level, bank, extra) {
    if (level >= 4 && rng() < 0.4) { // verdadero o falso: ¿cuántas son correctas? (como en la PEP)
      const nT = 1 + Math.floor(rng() * 3), list = shuffle(rng, [...sample(rng, bank.T, nT).map(t => [t, true]), ...sample(rng, bank.F, 4 - nT).map(f => [f[0], false, f[1]])]);
      return { type: 'number', prompt: `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}. ¿Cuántas de estas afirmaciones son verdaderas? ${list.map((x, i) => `(${i + 1}) ${x[0]}`).join(' ')}`, answer: nT, unit: '', tol: 0, label: 'verdaderas',
        traps: [{ value: 4, note: 'No todas son verdaderas: revisa cada una.' }].filter(t => t.value !== nT), solution: list.map((x, i) => `(${i + 1}) ${x[1] ? 'V' : `F: ${x[2]}`}`), ...extra, explain: `${nT} verdadera(s).` }; }
    const askFalse = level >= 3 ? rng() < 0.5 : false;
    if (askFalse) { const [f, why, mis] = pick(rng, bank.F);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}: ¿cuál afirmación es INCORRECTA?`, f, sample(rng, bank.T, 3).map(t => ({ text: t, note: 'Esta es verdadera.' })), { ...extra, misconception: mis, explain: `Es falsa: ${why}` }); }
    const t = pick(rng, bank.T);
    return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}: ¿cuál afirmación es correcta?`, t, sample(rng, bank.F, 3).map(([text, why, mis]) => ({ text, note: why, misconception: mis })), { ...extra, explain: t });
  }
  const benceno = {
    id: 'benceno', title: 'El benceno', mission: 'm1', concepts: ['ar.benceno', 'ar.estabilidad'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      if (c === 'ar.estabilidad' && level >= 3 && rng() < 0.6) {
        const cases = [{ n: 'benceno', k: 3, real: 208 }, { n: 'ciclohexa-1,3-dieno', k: 2, real: 232 }, { n: 'naftaleno (hasta decalina, 5 C=C)', k: 5, real: 333 }, { n: 'estireno (anillo + vinilo, 4 C=C)', k: 4, real: 326 }];
        const x = pick(rng, cases), base = pick(rng, [118, 119, 120, 121, 122]), e = x.k * base - x.real;
        return number(`${level === 5 ? 'Estilo PEP: ' : ''}Si un C=C aislado libera ${base} kJ/mol al hidrogenarse y el ${x.n} libera ${x.real} kJ/mol, ¿cuál es su energía de resonancia (estabilización)?`, e, 'kJ/mol',
          { concept: 'ar.estabilidad', slide: 8, label: 'E. resonancia', tol: 0.02, hint: `Esperado: ${x.k} × ${base}.`, traps: [{ value: x.k * base + x.real, note: 'Se resta, no se suma.' }, { value: (x.k - 1) * base - x.real, note: `Cuenta bien los dobles enlaces: son ${x.k}.` }],
            solution: [`Esperado: ${x.k} × ${base} = ${x.k * base} kJ/mol`, `Estabilización = ${x.k * base} − ${x.real} = ${e} kJ/mol`], explain: `${e} kJ/mol.` }); }
      return statements(rng, level, c === 'ar.benceno' ? BENZ : STAB, { concept: c, slide: c === 'ar.benceno' ? 4 : 7, hint: 'Piensa en el híbrido de resonancia y en que la aromaticidad se conserva.' });
    }
  };

  /* ════════ Nombres ════════ */
  const SUBS = [['–CH₃', 'tolueno', 'metil'], ['–OH', 'fenol', 'hidroxi'], ['–NH₂', 'anilina', 'amino'], ['–OCH₃', 'anisol', 'metoxi'], ['–COOH', 'ácido benzoico', 'carboxi'], ['–CHO', 'benzaldehído', 'formil'], ['–COCH₃', 'acetofenona', 'acetil'], ['–CH=CH₂', 'estireno', 'vinil'], ['–CN', 'benzonitrilo', 'ciano']];
  const HAL = [['Br', 'bromo'], ['Cl', 'cloro'], ['NO₂', 'nitro'], ['F', 'fluoro']];
  const nombres = {
    id: 'nombres', title: 'Nombrar derivados', mission: 'm3', concepts: ['ar.nombres'],
    make(rng, level) {
      if (level <= 2) { const [g, n] = pick(rng, SUBS), others = sample(rng, SUBS.filter(x => x[1] !== n), 3);
        return choice(rng, `¿Cómo se llama C₆H₅${g}?`, n.charAt(0).toUpperCase() + n.slice(1), others.map(([og, on]) => ({ text: on.charAt(0).toUpperCase() + on.slice(1), note: `${on} es C₆H₅${og}.` })),
          { concept: 'ar.nombres', slide: 33, hint: 'Nombres comunes aceptados por IUPAC.', explain: `C₆H₅${g} = ${n}.` }); }
      if (level === 3) { const pos = pick(rng, [[2, 'orto', 'o'], [3, 'meta', 'm'], [4, 'para', 'p']]), [, base] = pick(rng, SUBS.slice(0, 3)), [, hal] = pick(rng, HAL);
        return choice(rng, `El ${pos[2]}-${hal}${base} (${pos[1]}) tiene los grupos en…`, `1,${pos[0]}`, [2, 3, 4].filter(x => x !== pos[0]).map(x => ({ text: `1,${x}`, note: 'orto 1,2; meta 1,3; para 1,4.', misconception: 'omp-numbers' })),
          { concept: 'ar.nombres', slide: 35, hint: 'o = 1,2; m = 1,3; p = 1,4.', explain: `${pos[1]} = 1,${pos[0]}.` }); }
      const [, base, ] = pick(rng, [SUBS[1], SUBS[2], SUBS[0]]), [, h] = pick(rng, HAL), locs = pick(rng, [[2, 4], [2, 6], [3, 5], [2, 4, 6]]);
      const pre = { 2: 'di', 3: 'tri' }[locs.length], right = `${locs.join(',')}-${pre}${h}${base}`;
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Un ${base} lleva ${locs.length} ${h === 'nitro' ? 'grupos nitro' : 'átomos de ' + h} en las posiciones ${locs.join(', ')} (el grupo del nombre base es el C1). ¿Nombre correcto?`, right,
        [{ text: `${pre}${h}${base}`, note: 'Faltan los localizadores: con varios sustituyentes hay que numerar.' }, { text: `${locs.length === 2 ? 'o,p' : 'o,o,p'}-${pre}${h}${base}`, note: 'Con 3 o más sustituyentes (contando el del nombre base) se usan números.', misconception: 'omp-numbers' }, { text: `1-${base === 'fenol' ? 'hidroxi' : base === 'anilina' ? 'amino' : 'metil'}-${locs.map(l => l).join(',')}-${pre}${h}benceno`, note: `El nombre base común es ${base}: no hace falta decir benceno.` }],
        { concept: 'ar.nombres', slide: 36, hint: 'Nombre base común (C1), números bajos, orden alfabético.', explain: `${right}.` });
    }
  };

  /* ════════ Espectroscopía: identificar el compuesto por sus señales ════════ */
  // aH = señales de H aromáticos en RMN ¹H (por simetría); extra = señales que lo distinguen.
  const CMP = [
    { n: 'tolueno', aH: '5 H aromáticos (7,1–7,3 ppm)', ex: ['singlete de 3 H a 2,3 ppm', 'sin C=O ni O–H en el IR'] },
    { n: 'anisol', aH: '5 H aromáticos (6,9–7,3 ppm)', ex: ['singlete de 3 H a 3,8 ppm', 'C–O fuerte a ≈ 1250 cm⁻¹'] },
    { n: 'acetofenona', aH: '5 H aromáticos (7,4–8,0 ppm)', ex: ['singlete de 3 H a 2,6 ppm', 'C=O a ≈ 1685 cm⁻¹'] },
    { n: 'benzaldehído', aH: '5 H aromáticos (7,5–7,9 ppm)', ex: ['singlete de 1 H a ≈ 10 ppm', 'C=O a ≈ 1700 cm⁻¹ y C–H de aldehído a 2720 cm⁻¹'] },
    { n: 'fenol', aH: '5 H aromáticos (6,8–7,3 ppm)', ex: ['banda ancha a ≈ 3300 cm⁻¹', 'singlete ancho de 1 H que desaparece con D₂O'] },
    { n: 'ácido benzoico', aH: '5 H aromáticos (7,4–8,1 ppm)', ex: ['banda muy ancha de 2500 a 3300 cm⁻¹', 'singlete ancho de 1 H a ≈ 12 ppm'] },
    { n: 'p-xileno', aH: 'un singlete de 4 H a 7,0 ppm', ex: ['singlete de 6 H a 2,3 ppm', 'solo 2 señales en RMN ¹H'] },
    { n: 'etilbenceno', aH: '5 H aromáticos (7,1–7,3 ppm)', ex: ['cuartete de 2 H a 2,6 ppm y triplete de 3 H a 1,2 ppm', 'pico a m/z 91 en masas'] },
    { n: 'nitrobenceno', aH: '5 H aromáticos corridos a 7,5–8,2 ppm', ex: ['dos bandas fuertes a ≈ 1520 y 1350 cm⁻¹', 'sin señales bajo 7 ppm'] }
  ];
  const SIGNALS = [['benceno', 1], ['tolueno (mono-sustituido)', 3], ['p-diclorobenceno', 1], ['o-diclorobenceno', 2], ['m-diclorobenceno', 3], ['p-cloronitrobenceno', 2], ['1,3,5-trimetilbenceno (H del anillo)', 1], ['1,2,4-triclorobenceno', 3]];
  const espectro = {
    id: 'espectro', title: 'Huellas espectroscópicas', mission: 'm3', concepts: ['ar.espectro'],
    make(rng, level) {
      if (level <= 2) { const bank = [
        ['¿Dónde aparece el estiramiento C=C aromático en IR?', '≈ 1600 y 1500 cm⁻¹', [['1640–1680 cm⁻¹', 'Ese es un alqueno aislado.', 'ir-alkene'], ['≈ 1715 cm⁻¹', 'Ese es un C=O.'], ['≈ 2250 cm⁻¹', 'Ese es un C≡N.']], 43],
        ['¿Dónde salen los H aromáticos en RMN ¹H?', '7–8 ppm', [['5–6 ppm', 'Esos son H vinílicos.', 'ir-alkene'], ['1–2 ppm', 'Esos son H alquílicos.'], ['9–10 ppm', 'Ese es un H de aldehído.']], 44],
        ['¿Dónde salen los C aromáticos en RMN ¹³C?', '120–150 ppm', [['10–40 ppm', 'C alquílicos.'], ['190–210 ppm', 'C=O de cetonas y aldehídos.'], ['60–80 ppm', 'C unidos a O.']], 45],
        ['El estiramiento =C–H aromático aparece…', 'Justo sobre 3000 cm⁻¹ (≈ 3030)', [['Bajo 3000 cm⁻¹', 'Bajo 3000 son C–H sp³.'], ['≈ 3300 cm⁻¹ ancho', 'Eso es O–H o N–H.'], ['≈ 2720 cm⁻¹', 'Ese es el C–H de aldehído.']], 43],
        ['¿A qué m/z aparece el ion tropilio, típico de los alquilbencenos?', '91', [['77', '77 es el fenilo C₆H₅⁺.'], ['105', '105 es el benzoílo C₆H₅CO⁺.'], ['78', '78 es el benceno.']], 48]];
        const [p, a, ds, sl] = pick(rng, bank);
        return choice(rng, p, a, ds.map(([text, note, mc]) => ({ text, note, misconception: mc })), { concept: 'ar.espectro', slide: sl, hint: 'IR en cm⁻¹, RMN en ppm.', explain: a + '.' }); }
      if (level === 3) { const [n, k] = pick(rng, SIGNALS);
        return number(`¿Cuántas señales de H aromáticos (por simetría) espera en la RMN ¹H del ${n}?`, k, 'señales', { concept: 'ar.espectro', slide: 44, label: 'señales', tol: 0, hint: 'Agrupa los H que son equivalentes por simetría.',
          traps: [{ value: k + 1, note: 'Revisa la simetría: hay H equivalentes.' }, { value: 4, note: 'Cuenta grupos de H equivalentes, no H sueltos.' }].filter(t => t.value !== k), solution: [`Por simetría: ${k} tipo(s) de H aromático`], explain: `${k}.` }); }
      const c = pick(rng, CMP), extra = level === 5 ? c.ex : [pick(rng, c.ex)];
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Un compuesto C₆H₅–X muestra en sus espectros: ${c.aH}; ${extra.join('; ')}. ¿Cuál es?`, c.n, sample(rng, CMP.filter(x => x !== c), 3).map(x => ({ text: x.n, note: `Daría ${pick(rng, x.ex)}.`, misconception: 'ir-alkene' })),
        { concept: 'ar.espectro', slide: 44, hint: 'Busca la señal que distingue: C=O, O–H, OCH₃, CH₃ o CHO.', explain: `${c.n}: ${c.ex.join('; ')}.` });
    }
  };

  /* ════════ Bases ════════ */
  const ATOMS = [['C de un CH₃', 'sp³'], ['C de un C=C', 'sp²'], ['C de un carbocatión plano', 'sp²'], ['C de un C≡C', 'sp'], ['N de la piridina', 'sp²'], ['N del pirrol', 'sp²'], ['C del CH₂ del ciclopentadieno', 'sp³'], ['N del amoníaco', 'sp³'], ['O del furano', 'sp²'], ['C del C≡N de un nitrilo', 'sp'], ['C del C=O de una cetona', 'sp²'], ['N de la piperidina', 'sp³'], ['C del anión ciclopentadienilo que tenía el H', 'sp²'], ['C de un CO₂', 'sp']];
  const RES = { topic: 'Resonancia', T: ['En las formas de resonancia solo se mueven electrones (π y pares libres).', 'La molécula real es el híbrido de todas las formas.', 'Más formas equivalentes significa más estabilidad.', 'Las formas que reparten una carga sobre más átomos estabilizan.', 'Todas las formas de resonancia tienen los átomos en el mismo lugar.', 'Una carga negativa es más estable sobre el átomo más electronegativo.'],
    F: [['En resonancia se pueden mover átomos de H.', 'mover átomos da isómeros (tautómeros), no formas de resonancia.', 'kekule-alternating'], ['Las formas de resonancia están en equilibrio entre sí.', 'no hay equilibrio: es una sola molécula, el híbrido.', 'kekule-alternating'], ['La forma de resonancia más dibujada es la molécula real.', 'ninguna forma sola es la real.', 'kekule-alternating'], ['Repartir una carga en varias formas desestabiliza.', 'estabiliza.', 'kekule-alternating'], ['Una forma con 5 enlaces en un C es aceptable si ayuda.', 'nunca se viola el octeto del C.', 'kekule-alternating']] };
  const bases = {
    id: 'bases', title: 'Hibridación y resonancia', mission: null, concepts: ['base.hibridacion', 'base.resonancia'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      if (c === 'base.hibridacion') {
        if (level >= 4) { const three = sample(rng, ATOMS, 4), target = pick(rng, ['sp³', 'sp²', 'sp'].filter(h => three.some(a => a[1] === h) && three.filter(a => a[1] === h).length === 1));
          if (target) { const right = three.find(a => a[1] === target);
            return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Cuál de estos átomos es ${target}?`, right[0], three.filter(a => a !== right).map(a => ({ text: a[0], note: `Es ${a[1]}.` })), { concept: c, slide: 18, hint: 'Cuenta grupos: 4 → sp³; 3 → sp²; 2 → sp. Un par que entra al anillo π deja al átomo sp².', explain: `${right[0]}: ${target}.` }); } }
        const at = pick(rng, ATOMS);
        return choice(rng, `¿Qué hibridación tiene el ${at[0]}?`, at[1], ['sp³', 'sp²', 'sp', 'sp³d'].filter(x => x !== at[1]).map(text => ({ text, note: 'Cuenta grupos: 4 → sp³; 3 → sp²; 2 → sp (los pares que entran al anillo π no cuentan como grupo).' })),
          { concept: c, slide: 18, hint: 'Cuenta grupos alrededor del átomo.', explain: `${at[1]}.` });
      }
      return statements(rng, Math.max(level, 2), RES, { concept: c, slide: 4, hint: 'Resonancia ≠ equilibrio: solo se mueven electrones.' });
    }
  };

  const generators = [huckel, hetero, benceno, nombres, espectro, bases];

  /* Laboratorio: tomar un anillo y "quitarle" o "darle" algo; el sabio dice si queda aromático. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [S('cpd', 'Ciclopentadieno', 'C₅H₆ · no aromático (CH₂ sp³)'), S('cpa', 'Anión ciclopentadienilo', 'C₅H₅⁻ · 6 π · aromático'), S('cpc', 'Catión ciclopentadienilo', 'C₅H₅⁺ · 4 π · antiaromático'),
    S('cht', 'Cicloheptatrieno', 'C₇H₈ · no aromático (CH₂ sp³)'), S('trop', 'Catión tropilio', 'C₇H₇⁺ · 6 π · aromático'), S('cot', 'Ciclooctatetraeno', 'C₈H₈ · tina · no aromático'), S('cot2', 'Dianión del ciclooctatetraeno', 'C₈H₈²⁻ · 10 π · aromático'),
    S('pyr', 'Pirrol', '6 π · aromático'), S('pyrH', 'Pirrol protonado en el N', 'pierde la aromaticidad'), S('py', 'Piridina', '6 π · aromático'), S('pyH', 'Ion piridinio', '6 π · sigue aromático')];
  const reagents = [['base', 'Base fuerte (quita H⁺)'], ['hidruro', 'Quitar un hidruro (H⁻)'], ['k2', '2 K (agrega 2 electrones)'], ['acido', 'Ácido (agrega H⁺)']].map(([id, label]) => ({ id, label }));
  const RX = {
    'cpd>base': ['cpa', 'Se quita el H⁺ del CH₂: el C queda sp² con un par → 6 π aromático. Por eso el ciclopentadieno es tan ácido (pKa ≈ 16).'],
    'cpd>hidruro': ['cpc', 'Se quita H⁻: queda un p vacío → 4 π. Antiaromático: muy difícil de formar.'],
    'cht>hidruro': ['trop', 'Se quita H⁻ del CH₂: catión tropilio, 6 π aromático (aparece a m/z 91 en masas).'],
    'cot>k2': ['cot2', 'Con 2 electrones más tiene 10 π y se aplana: aromático.'],
    'pyr>acido': ['pyrH', 'Para captar el H⁺ el N usa su par, que era parte de los 6 π: se pierde la aromaticidad. Por eso el pirrol casi no es básico.'],
    'py>acido': ['pyH', 'El par del N estaba en el plano: captar el H⁺ no toca los 6 π. La piridina es una base normal (pKaH ≈ 5,2).']
  };
  const WHY = { base: 'No hay un H ácido que al salir deje un anillo aromático.', hidruro: 'Quitar un H⁻ aquí no deja un sistema aromático útil.', k2: 'Agregar electrones solo sirve en anillos planos que quedan con 4n + 2.', acido: 'No hay un par libre disponible para el H⁺ en este anillo.' };
  function react(fromId, rid) { const r = RX[`${fromId}>${rid}`]; return r ? { to: r[0], ok: true, why: r[1] } : { to: null, ok: false, why: WHY[rid] }; }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['cpd', 'cht', 'cot', 'pyr', 'py'] };

  const creatures = {
    'base.hibridacion': ['Duende', '#6d8bd6'], 'base.resonancia': ['Serpiente', '#5f9e5a'], 'ar.benceno': ['Espectro', '#7aa4b5'], 'ar.estabilidad': ['Gólem', '#8a6fd1'],
    'ar.criterios': ['Niebla', '#7fa3a0'], 'ar.huckel': ['Hidra', '#c0574a'], 'ar.iones': ['Chispa', '#d6a23f'], 'ar.heterociclos': ['Grifo', '#c98a1b'], 'ar.nombres': ['Escriba', '#a07a4a'], 'ar.espectro': ['Búho', '#5d6f9e']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['org-04'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
