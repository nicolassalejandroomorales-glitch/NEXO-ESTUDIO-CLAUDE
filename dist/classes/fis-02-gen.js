/* Casos infinitos de "Lesión cerebral aguda" (Fisiopatología, PEP 1). Niveles 1 Fácil … 5 Nivel PEP.
   Los números (PAM, PPC) se CALCULAN; los casos se arman desde bancos de signos (Silbernagl y Lang). */
(() => {
  'use strict';
  const SRC = 'silbernagl';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const between = (rng, a, b, step) => Math.round((a + rng() * (b - a)) / step) * step;
  const dec = (x, d = 1) => Number(x).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: d }).replace('-', '−');
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

  /* ════════ Cascada isquémica ════════ */
  const CHAIN = ['↓ flujo sanguíneo', '↓ ATP', 'falla de la Na⁺/K⁺-ATPasa', 'despolarización', 'liberación de glutamato', 'activación de receptores NMDA', 'entrada de Ca²⁺', 'activación de proteasas y lipasas', 'muerte neuronal'];
  const cascada = {
    id: 'cascada', title: 'Cascada isquémica', mission: 'm1', concepts: ['fis.isquemia'],
    make(rng, level) {
      const i = Math.floor(rng() * (CHAIN.length - 1)), next = CHAIN[i + 1];
      if (level <= 3) return choice(rng, `En la isquemia cerebral, ¿qué viene justo después de "${CHAIN[i]}"?`, next, shuffle(rng, CHAIN.filter((c, k) => k !== i + 1 && k !== i)).map(t => ({ text: t, note: 'Repasa el orden de la cascada.', misconception: t.includes('glutamato') ? 'excito-gaba' : undefined })).concat([{ text: 'liberación masiva de GABA', note: 'El protagonista es el glutamato.', misconception: 'excito-gaba' }]),
        { concept: 'fis.isquemia', slide: 2, hint: 'Sin energía → sin bombas → glutamato → Ca²⁺.', explain: `${CHAIN[i]} → ${next}.` });
      const block = pick(rng, [['un bloqueador de receptores NMDA', 'entrada de Ca²⁺', 'Frena la entrada de Ca²⁺ aunque haya glutamato'], ['un fármaco que impide la liberación de glutamato', 'activación de receptores NMDA', 'Sin glutamato no se activan los NMDA'], ['restablecer el flujo (trombolisis)', '↓ ATP', 'Vuelve el O₂ y la glucosa: se recupera el ATP']]);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}En un modelo de isquemia se da ${block[0]}. ¿Qué eslabón se evita primero?`, block[1], shuffle(rng, CHAIN.filter(c => c !== block[1])).slice(0, 3).map(t => ({ text: t, note: 'Mira dónde actúa la intervención.' })),
        { concept: 'fis.isquemia', slide: 2, hint: 'Ubica el punto de la cadena donde actúa.', explain: `${block[2]}.` });
    }
  };

  const take = (rng, list, n) => shuffle(rng, list).slice(0, n);
  const AGE = rng => pick(rng, ['Mujer de 58 años', 'Hombre de 66 años', 'Mujer de 74 años', 'Hombre de 49 años', 'Hombre de 81 años']);
  // "Señale la correcta / la incorrecta" desde bancos de hechos (T) y errores típicos (F: [texto, por qué, error típico]).
  function statements(rng, level, bank, extra) {
    const askFalse = level >= 3 ? rng() < 0.5 : false;
    if (askFalse) { const [f, why, mis] = pick(rng, bank.F);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}: ¿cuál afirmación es INCORRECTA?`, f, take(rng, bank.T, 3).map(t => ({ text: t, note: 'Esta es verdadera.' })), { ...extra, misconception: mis, explain: `Es falsa: ${why}` }); }
    const t = pick(rng, bank.T);
    return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}: ¿cuál afirmación es correcta?`, t, take(rng, bank.F, 3).map(([text, why, mis]) => ({ text, note: why, misconception: mis })), { ...extra, explain: t });
  }

  /* ════════ Núcleo, penumbra y la decisión de trombolizar ════════
     Variables reales de la decisión: tiempo desde la última vez visto bien, TAC y contraindicaciones (no se tromboliza con sangrado,
     fuera de 4,5 h, anticoagulación con INR > 1,7, cirugía mayor reciente ni con PA > 185/110 sin controlar). */
  const PEN_BANK = { topic: 'Núcleo y penumbra', T: ['La penumbra no funciona, pero sigue viva y se puede salvar.', 'El núcleo del infarto ya tiene muerte celular irreversible.', 'Si no se reperfunde, la penumbra pasa a formar parte del núcleo.', 'La trombolisis busca salvar la penumbra, no el núcleo.', 'Antes de trombolizar hay que descartar una hemorragia con TAC.', 'En un ACV de inicio desconocido se cuenta desde la última vez que se vio bien al paciente.'],
    F: [['La trombolisis recupera el núcleo del infarto.', 'el núcleo ya murió; se rescata la penumbra.', 'core-penumbra'], ['La penumbra tiene flujo cero.', 'tiene flujo reducido; el que tiene flujo casi nulo es el núcleo.', 'core-penumbra'], ['Si el paciente despertó con el déficit, se cuenta desde la hora en que despertó.', 'se cuenta desde la última vez que se le vio bien (la noche anterior).', 'core-penumbra'], ['Un TAC normal en la primera hora descarta el infarto.', 'el infarto isquémico suele no verse en el TAC las primeras horas; el TAC sirve para descartar sangre.', 'core-penumbra'], ['La trombolisis es útil en el ACV hemorrágico.', 'está contraindicada: aumenta el sangrado.', 'core-penumbra']] };
  const DECIDE = ['Trombolizar ahora (dentro de 4,5 h y sin contraindicaciones)', 'No trombolizar: hay hemorragia', 'No trombolizar con rtPA: fuera de la ventana de 4,5 h (evaluar trombectomía)', 'Primero bajar la presión bajo 185/110; luego trombolizar si sigue en ventana', 'No trombolizar: está anticoagulado con INR alto'];
  const penumbra = {
    id: 'penumbra', title: 'Núcleo, penumbra y tiempo', mission: 'm1', concepts: ['fis.penumbra'],
    make(rng, level) {
      if (level <= 2) return statements(rng, level, PEN_BANK, { concept: 'fis.penumbra', slide: 3, hint: 'Núcleo: muerto. Penumbra: aturdida pero viva.' });
      const kind = pick(rng, level === 3 ? [0, 1, 2] : [0, 1, 2, 3, 4]);
      const h = kind === 2 ? pick(rng, [5, 6, 7.5, 9]) : pick(rng, [1, 1.5, 2, 2.5, 3, 3.5]);
      const wake = kind === 2 && rng() < 0.5;
      const when = wake ? `despertó con el déficit; la última vez que se le vio bien fue hace ${String(h).replace('.', ',')} h` : `inició el déficit hace ${String(h).replace('.', ',')} h`;
      const pa = kind === 3 ? `${pick(rng, [195, 205, 215, 220])}/${pick(rng, [112, 118, 125])}` : `${pick(rng, [150, 160, 170, 175])}/${pick(rng, [85, 90, 95, 100])}`;
      const tac = kind === 1 ? pick(rng, ['El TAC muestra sangre en el parénquima.', 'El TAC muestra un hematoma de 3 cm.']) : 'El TAC no muestra sangre.';
      const extra = kind === 4 ? ` Toma warfarina y su INR es ${pick(rng, ['2,8', '3,1', '3,5'])}.` : '';
      const deficit = pick(rng, ['debilidad del brazo y la cara derechos', 'dificultad para hablar y debilidad izquierda', 'desviación de la boca y no mueve la mano derecha']);
      const right = DECIDE[kind];
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con ${deficit}; ${when}. PA ${pa} mmHg. ${tac}${extra} ¿Qué corresponde?`, right,
        take(rng, DECIDE.filter(x => x !== right), 3).map(text => ({ text, note: 'Revisa: ¿hay sangre? ¿cuántas horas? ¿PA sobre 185/110? ¿anticoagulado?', misconception: 'core-penumbra' })),
        { concept: 'fis.penumbra', slide: 3, hint: 'Revisa en orden: sangre en el TAC, tiempo (4,5 h), presión y anticoagulación.', explain: `${right}.` });
    }
  };

  /* ════════ Edema: tipo, mecanismo y tratamiento según la causa ════════ */
  const ED = [
    { c: 'Primeras 6 horas de un infarto cerebral', t: 'Citotóxico', tx: 'Reperfundir y medidas generales; los corticoides no sirven' },
    { c: 'Hiponatremia aguda (Na⁺ 115 mmol/L en 24 h)', t: 'Citotóxico', tx: 'Corregir el sodio con suero hipertónico, sin subirlo demasiado rápido' },
    { c: 'Paro cardíaco con 10 minutos de hipoxia', t: 'Citotóxico', tx: 'Soporte y control de temperatura; los corticoides no sirven' },
    { c: 'Insuficiencia hepática aguda con amonio muy alto', t: 'Citotóxico', tx: 'Bajar el amonio y soporte; los corticoides no sirven' },
    { c: 'Metástasis cerebral con un halo de edema', t: 'Vasogénico', tx: 'Dexametasona (estabiliza la barrera hematoencefálica)' },
    { c: 'Absceso cerebral', t: 'Vasogénico', tx: 'Antibióticos y drenaje; corticoides solo si hay mucho efecto de masa' },
    { c: 'Contusión cerebral por un accidente', t: 'Vasogénico', tx: 'Controlar la PIC (cabecera elevada, osmoterapia); los corticoides no sirven en el TEC' },
    { c: 'Encefalopatía hipertensiva (PA 240/140)', t: 'Vasogénico', tx: 'Bajar la presión de forma controlada' },
    { c: 'Hidrocefalia por un tumor que tapa el acueducto', t: 'Intersticial', tx: 'Derivar el LCR (válvula o ventriculostomía)' }
  ];
  const lc = t => t.charAt(0).toLowerCase() + t.slice(1);
  const ED_WHY = { 'Citotóxico': 'Fallan las bombas: la célula se hincha con la barrera hematoencefálica intacta', 'Vasogénico': 'Se rompe la barrera hematoencefálica: sale plasma al espacio extracelular', 'Intersticial': 'El LCR a presión pasa al tejido alrededor de los ventrículos' };
  const edema = {
    id: 'edema', title: 'Edema: tipo y tratamiento', mission: 'm2', concepts: ['fis.edema'],
    make(rng, level) {
      const e = pick(rng, level <= 2 ? ED.filter(x => x.t !== 'Intersticial') : ED);
      if (level <= 2) return choice(rng, `${e.c}: ¿qué edema predomina y por qué?`, `${e.t}: ${lc(ED_WHY[e.t])}`, Object.entries(ED_WHY).filter(([t]) => t !== e.t).map(([t, w]) => ({ text: `${t}: ${lc(w)}`, note: `No calza con: ${e.c.toLowerCase()}.`, misconception: 'edema-type' })).concat([{ text: `${e.t}: ${lc(ED_WHY[e.t === 'Citotóxico' ? 'Vasogénico' : 'Citotóxico'])}`, note: 'El tipo está bien, pero el mecanismo es el del otro.', misconception: 'edema-type' }]),
        { concept: 'fis.edema', slide: 4, hint: '¿Fallan las bombas o se rompe la barrera?', explain: `${e.t}: ${lc(ED_WHY[e.t])}.` });
      if (level === 3) { const pair = take(rng, ED.filter(x => x.t !== e.t), 3);
        return choice(rng, `¿En cuál de estas situaciones predomina un edema ${e.t.toLowerCase()}?`, e.c, pair.map(x => ({ text: x.c, note: `Ahí es ${x.t.toLowerCase()}.`, misconception: 'edema-type' })),
          { concept: 'fis.edema', slide: 4, hint: ED_WHY[e.t] + '.', explain: `${e.c}: ${e.t.toLowerCase()}.` }); }
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con ${e.c.charAt(0).toLowerCase()}${e.c.slice(1)} y signos de PIC alta. ¿Qué manejo del edema corresponde?`, e.tx,
        take(rng, [...new Set(ED.filter(x => x.tx !== e.tx).map(x => x.tx))], 3).map(text => ({ text, note: 'Ese manejo corresponde a otra causa de edema.', misconception: 'edema-type' })),
        { concept: 'fis.edema', slide: 4, hint: 'Primero el tipo de edema; los corticoides solo sirven en el vasogénico de tumores.', explain: `${e.t}: ${lc(e.tx)}.` });
    }
  };

  /* ════════ PAM y PPC ════════ */
  const ppc = {
    id: 'ppc', title: 'PAM y perfusión cerebral', mission: 'm2', concepts: ['fis.pic'],
    make(rng, level) {
      const pas = between(rng, 95, 200, 5), pad = Math.min(pas - 25, between(rng, 55, 110, 5)), pam = pad + (pas - pad) / 3, pic = between(rng, 8, 45, 1);
      if (level <= 2) { const PAM = between(rng, 60, 110, 1);
        return number(`PAM ${PAM} mmHg y PIC ${pic} mmHg. ¿Presión de perfusión cerebral?`, PAM - pic, 'mmHg', { concept: 'fis.pic', slide: 6, label: 'PPC', tol: 0.01, hint: 'PPC = PAM − PIC.',
          traps: [{ value: PAM + pic, note: 'Se resta la PIC.', misconception: 'ppc-sign' }], solution: [`PPC = ${PAM} − ${pic} = ${PAM - pic} mmHg`], explain: `${PAM - pic} mmHg${PAM - pic < 60 ? ' (bajo la meta de 60)' : ''}.` }); }
      if (level === 3) return number(`PA ${pas}/${pad} mmHg. Calcula la PAM.`, pam, 'mmHg', { concept: 'fis.pic', slide: 6, label: 'PAM', tol: 0.01, hint: 'PAM = PAD + (PAS − PAD)/3.',
        traps: [{ value: (pas + pad) / 2, note: 'Ese es el promedio simple.' }, { value: pas - pad, note: 'Esa es la presión de pulso.' }], solution: [`PAM = ${pad} + (${pas} − ${pad})/3 = ${dec(pam)} mmHg`], explain: `${dec(pam)} mmHg.` });
      return number(`${level === 5 ? 'Estilo PEP: ' : ''}Paciente con TEC: PA ${pas}/${pad} mmHg y PIC ${pic} mmHg. Calcula la presión de perfusión cerebral.`, pam - pic, 'mmHg',
        { concept: 'fis.pic', slide: 6, label: 'PPC', tol: 0.02, hint: 'Primero la PAM; luego resta la PIC.', traps: [{ value: pas - pic, note: 'Usaste la sistólica.', misconception: 'ppc-sign' }, { value: (pas + pad) / 2 - pic, note: 'La PAM no es el promedio simple.' }, { value: pam + pic, note: 'Se resta la PIC.', misconception: 'ppc-sign' }],
          solution: [`PAM = ${pad} + (${pas} − ${pad})/3 = ${dec(pam)} mmHg`, `PPC = ${dec(pam)} − ${pic} = ${dec(pam - pic)} mmHg${pam - pic < 60 ? ' → bajo la meta de 60' : ''}`], explain: `PPC = ${dec(pam - pic)} mmHg.` });
    }
  };

  /* ════════ Signos vitales e hipertensión intracraneal ════════
     Patrones con números que cambian: Cushing (HTA + bradicardia + respiración irregular), shock (hipotensión + taquicardia),
     crisis hipertensiva sin HIC (HTA + taquicardia, consciente) e HIC temprana (cefalea, vómitos, papiledema, vitales normales). */
  const PATTERNS = {
    cushing: { label: 'Hipertensión intracraneal grave (tríada de Cushing): riesgo de herniación', vit: rng => [between(rng, 185, 225, 5), between(rng, 100, 125, 5), between(rng, 38, 52, 1)], extra: ['respiración irregular con pausas', 'pupila derecha dilatada', 'Glasgow 7'], mis: 'cushing' },
    shock: { label: 'Shock (hipoperfusión sistémica), no hipertensión intracraneal', vit: rng => [between(rng, 70, 88, 2), between(rng, 40, 55, 1), between(rng, 118, 145, 1)], extra: ['piel fría y sudorosa', 'llene capilar lento', 'orina escasa'], mis: 'cushing' },
    crisis: { label: 'Crisis hipertensiva sin signos de hipertensión intracraneal', vit: rng => [between(rng, 190, 220, 5), between(rng, 105, 120, 5), between(rng, 92, 110, 1)], extra: ['consciente y orientado', 'dolor de cabeza leve', 'fondo de ojo sin papiledema'], mis: 'cushing' },
    temprana: { label: 'Hipertensión intracraneal temprana: vigilar y bajar la PIC', vit: rng => [between(rng, 125, 145, 5), between(rng, 75, 90, 5), between(rng, 68, 88, 1)], extra: ['cefalea que empeora en la mañana', 'vómitos sin náuseas previas', 'papiledema en el fondo de ojo'], mis: 'cushing' }
  };
  const signos = {
    id: 'signos', title: 'Signos vitales y PIC', mission: 'm2', concepts: ['fis.pic'],
    make(rng, level) {
      const k = pick(rng, Object.keys(PATTERNS)), P = PATTERNS[k], [pas, pad, fc] = P.vit(rng);
      const ctx = pick(rng, ['tras un TEC', 'con un tumor cerebral conocido', 'con un hematoma intracerebral', 'tras una caída en bicicleta']);
      const extra = take(rng, P.extra, level <= 2 ? 2 : 1);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Paciente ${ctx}: PA ${pas}/${pad} mmHg, FC ${fc} lpm, ${extra.join(', ')}. ¿Cómo lo interpretas?`, P.label,
        Object.entries(PATTERNS).filter(([kk]) => kk !== k).map(([, o]) => ({ text: o.label, note: 'Mira juntos la presión, la frecuencia y la conciencia.', misconception: P.mis })),
        { concept: 'fis.pic', slide: 7, hint: 'Cushing = presión alta con frecuencia BAJA. Shock = presión baja con frecuencia alta.', explain: `${P.label}.` });
    }
  };

  /* ════════ Bases ════════ */
  const EN_BANK = { topic: 'Energía y bombas iónicas', T: ['La Na⁺/K⁺-ATPasa saca 3 Na⁺ y mete 2 K⁺ por cada ATP.', 'Sin ATP, el Na⁺ entra a la célula y el agua lo sigue.', 'El cerebro casi no tiene reservas de glucógeno ni de O₂.', 'Sin O₂, la glucólisis anaeróbica acumula lactato.', 'La despolarización sostenida libera glutamato.', 'El edema citotóxico se explica por la falla de las bombas.'],
    F: [['Sin ATP la bomba Na⁺/K⁺ trabaja más rápido.', 'necesita ATP: sin él se detiene.', 'excito-gaba'], ['Sin ATP la célula se encoge porque sale agua.', 'entra Na⁺ y el agua lo sigue: se hincha.', 'edema-type'], ['El cerebro guarda glucógeno para varias horas.', 'casi no tiene reservas: depende del flujo minuto a minuto.', 'core-penumbra'], ['La bomba saca 2 Na⁺ y mete 3 K⁺.', 'es al revés: 3 Na⁺ afuera, 2 K⁺ adentro.', 'excito-gaba'], ['La falta de O₂ disminuye el lactato.', 'lo aumenta (glucólisis anaeróbica).', 'excito-gaba']] };
  const energia = {
    id: 'energia', title: 'ATP y bombas', mission: null, concepts: ['base.energia'],
    make(rng, level) {
      if (level >= 2) return statements(rng, level, EN_BANK, { concept: 'base.energia', slide: 1, hint: 'Sin ATP: sin bomba → entra Na⁺ y agua.' });
      const C = [['Se detiene la Na⁺/K⁺-ATPasa', 'Falta ATP'], ['Entra Na⁺ a la neurona', 'Se detiene la Na⁺/K⁺-ATPasa'], ['La célula se hincha', 'Entra Na⁺ y lo sigue el agua'], ['Se acumula lactato', 'Glucólisis anaeróbica sin O₂'], ['Se libera glutamato', 'La neurona se despolariza']];
      const [eff, cause] = pick(rng, C);
      return choice(rng, `¿Cuál es la causa inmediata de: "${eff}"?`, cause, take(rng, C.filter(c => c[1] !== cause), 3).map(c => ({ text: c[1], note: 'Esa es la causa de otro eslabón.' })), { concept: 'base.energia', slide: 1, hint: 'Busca el eslabón anterior.', explain: cause + '.' });
    }
  };
  const pamBase = {
    id: 'pam', title: 'Presión arterial media', mission: null, concepts: ['base.presion'],
    make(rng, level) {
      const pas = between(rng, 80, 180, 5), pad = Math.min(pas - 20, between(rng, 45, 100, 5)), pam = pad + (pas - pad) / 3;
      if (level <= 2) return number(`PA ${pas}/${pad} mmHg. ¿PAM?`, pam, 'mmHg', { concept: 'base.presion', slide: 6, label: 'PAM', tol: 0.01, hint: 'PAD + (PAS − PAD)/3.',
        traps: [{ value: (pas + pad) / 2, note: 'Ese es el promedio simple.' }, { value: pas - pad, note: 'Esa es la presión de pulso.' }], solution: [`${pad} + ${pas - pad}/3 = ${dec(pam)} mmHg`], explain: `${dec(pam)} mmHg.` });
      if (level === 3) { const target = between(rng, 70, 100, 1), d2 = between(rng, 50, 80, 2), s2 = 3 * target - 2 * d2;
        return number(`Un paciente tiene PAM ${target} mmHg y PAD ${d2} mmHg. ¿Cuál es su presión sistólica?`, s2, 'mmHg', { concept: 'base.presion', slide: 6, label: 'PAS', tol: 0.01, hint: 'Despeja de PAM = PAD + (PAS − PAD)/3.',
          traps: [{ value: 2 * target - d2, note: 'Usaste el promedio simple.' }], solution: [`PAS = 3·PAM − 2·PAD = ${3 * target} − ${2 * d2} = ${s2} mmHg`], explain: `${s2} mmHg.` }); }
      const pts = take(rng, [[between(rng, 85, 100, 5), between(rng, 40, 50, 2)], [between(rng, 110, 130, 5), between(rng, 70, 80, 2)], [between(rng, 95, 105, 5), between(rng, 55, 62, 1)], [between(rng, 140, 160, 5), between(rng, 85, 95, 5)]], 3);
      const withPam = pts.map(([a, b]) => ({ t: `${a}/${b} mmHg`, pam: b + (a - b) / 3 })), low = withPam.reduce((x, y) => x.pam < y.pam ? x : y);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Cuál de estos pacientes tiene la PAM más baja (y por eso más riesgo de mala perfusión de los órganos)?`, low.t, withPam.filter(x => x !== low).map(x => ({ text: x.t, note: `Su PAM es ${dec(x.pam)} mmHg.` })),
        { concept: 'base.presion', slide: 6, hint: 'Calcula la PAM de cada uno; la diastólica pesa el doble.', explain: `${low.t}: PAM ${dec(low.pam)} mmHg.` });
    }
  };

  const generators = [cascada, penumbra, edema, ppc, signos, energia, pamBase];

  /* Laboratorio "¿qué pasa si…?": un paciente y las intervenciones. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('acv', 'ACV isquémico de 2 h (TAC sin sangre)', 'núcleo + penumbra'), S('reperf', 'Penumbra reperfundida', 'déficit mejora'), S('infarto', 'Penumbra perdida', 'infarto completo'),
    S('pic', 'TEC con PIC 30 mmHg y PAM 85 mmHg', 'PPC 55: baja'), S('pic-ok', 'PIC 15 mmHg', 'PPC 70: adecuada'), S('pic-peor', 'PAM 65 mmHg con PIC 30', 'PPC 35: isquemia'),
    S('tumor', 'Tumor con edema vasogénico', 'BHE rota'), S('tumor-ok', 'Edema peritumoral reducido', 'menos efecto de masa')
  ];
  const reagents = [['rtpa', 'Trombolisis (rtPA)'], ['esperar', 'Esperar 12 h'], ['manitol', 'Manitol (osmótico)'], ['bajar-pa', 'Bajar bruscamente la PA'], ['dexa', 'Dexametasona']].map(([id, label]) => ({ id, label }));
  const RX = {
    'acv>rtpa': ['reperf', 'Dentro de la ventana y sin sangre: se disuelve el coágulo y se salva la penumbra.'],
    'acv>esperar': ['infarto', 'Sin flujo, la cascada sigue y la penumbra pasa a núcleo. Tiempo es cerebro.'],
    'pic>manitol': ['pic-ok', 'El manitol saca agua del cerebro por osmosis: baja la PIC y sube la PPC = 85 − 15 = 70.'],
    'pic>bajar-pa': ['pic-peor', 'Bajaste la PAM: PPC = 65 − 30 = 35 mmHg. ¡Isquemia!'],
    'tumor>dexa': ['tumor-ok', 'Los corticoides estabilizan la barrera hematoencefálica: baja el edema vasogénico.']
  };
  const WHY_NOT = { dexa: 'Los corticoides sirven en el edema vasogénico de tumores; en el ACV o el TEC no han demostrado beneficio.', rtpa: 'La trombolisis disuelve coágulos arteriales: aquí no corresponde (y aumenta el riesgo de sangrado).', manitol: 'Aquí no hay hipertensión intracraneal que bajar.', 'bajar-pa': 'Bajar la presión aquí no ayuda.', esperar: 'Esperar no cambia este cuadro para mejor.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'Esta intervención no cambia este cuadro.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['acv', 'pic', 'tumor'] };

  const creatures = {
    'base.energia': ['Escriba', '#a07a4a'], 'base.presion': ['Búho', '#5d6f9e'],
    'fis.isquemia': ['Espectro', '#7aa4b5'], 'fis.penumbra': ['Trasgo', '#7f9a3c'], 'fis.edema': ['Niebla', '#7fa3a0'], 'fis.pic': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['fis-02'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
