/* Casos infinitos de "Motricidad y sistema nervioso vegetativo" (Fisiopatología, PEP 1). Niveles 1 Fácil … 5 Nivel PEP.
   Cada caso se arma combinando signos de un banco (Silbernagl y Lang) y SIEMPRE incluye al menos un signo que lo distingue de los cuadros
   con que se confunde (si no, la pregunta tendría dos respuestas). Calidad medida con tools/exercise-quality.cjs. */
(() => {
  'use strict';
  const SRC = 'silbernagl';
  const LEVELS = ['Fácil', 'Media', 'Intermedia', 'Avanzada', 'Nivel PEP'];
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  const shuffle = (rng, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const take = (rng, list, n) => shuffle(rng, list).slice(0, n);
  function choice(rng, prompt, correct, distractors, extra) {
    const seen = new Set([correct]);
    const ds = distractors.filter(d => d && d.text && !seen.has(d.text) && seen.add(d.text)).slice(0, extra.max || 3);
    const { max, ...rest } = extra;
    return { type: 'choice', prompt, options: shuffle(rng, [{ text: correct, correct: true }, ...ds]), ...rest };
  }
  const AGE = rng => pick(rng, ['Mujer de 34 años', 'Hombre de 61 años', 'Mujer de 72 años', 'Hombre de 45 años', 'Mujer de 55 años']);

  // Signos de un caso: uno distintivo (key) y el resto de cualquiera; así nunca queda ambiguo.
  function caseSigns(rng, d, n) {
    const k = pick(rng, d.key), rest = take(rng, [...d.key, ...d.other].filter(x => x !== k), Math.max(0, n - 1));
    return shuffle(rng, [k, ...rest]);
  }
  const list3 = xs => xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}` : xs[0];

  /* ════════ Localizar la lesión motora ════════ */
  const SITES = {
    mns: { label: 'Motoneurona superior', key: ['espasticidad', 'Babinski positivo', 'clonus'], other: ['hiperreflexia', 'debilidad sin atrofia importante'], mis: 'umn-lmn', slide: 2 },
    mni: { label: 'Motoneurona inferior', key: ['fasciculaciones', 'atrofia marcada', 'flacidez con arreflexia'], other: ['debilidad en el territorio de un nervio', 'calambres'], mis: 'umn-lmn', slide: 2 },
    placa: { label: 'Placa motora (miastenia gravis)', key: ['ptosis que empeora en la tarde', 'debilidad que empeora con el uso y mejora con el reposo', 'visión doble al leer mucho rato'], other: ['reflejos normales', 'sensibilidad normal'], mis: 'mg-mechanism', slide: 5 },
    ganglios: { label: 'Ganglios basales (Parkinson)', key: ['temblor de reposo que cede al moverse', 'rigidez en rueda dentada', 'bradicinesia'], other: ['marcha a pasos cortos', 'cara inexpresiva', 'letra cada vez más pequeña'], mis: 'parkinson-dopa', slide: 3 },
    cerebelo: { label: 'Cerebelo', key: ['temblor al acercar el dedo a la nariz', 'dismetría', 'no logra alternar movimientos rápidos'], other: ['marcha con base amplia', 'fuerza conservada', 'habla entrecortada'], mis: 'cerebellum-paralysis', slide: 4 }
  };
  const localizar = {
    id: 'localizar', title: 'Localizar la lesión', mission: 'm1', concepts: ['fis.motoneurona', 'fis.ganglios', 'fis.placa'],
    make(rng, level, want) {
      const BY = { 'fis.motoneurona': ['mns', 'mni'], 'fis.ganglios': ['ganglios', 'cerebelo'], 'fis.placa': ['placa'] };
      const keys = want ? BY[want] : Object.keys(SITES), k = pick(rng, keys), s = SITES[k];
      const concept = ['ganglios', 'cerebelo'].includes(k) ? 'fis.ganglios' : k === 'placa' ? 'fis.placa' : 'fis.motoneurona';
      const signs = caseSigns(rng, s, level <= 1 ? 1 : level <= 3 ? 2 : 3);
      const p = level === 1 ? `¿Qué lesión sugiere este signo: ${signs[0]}?` : `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} consulta por ${list3(signs)}. ¿Dónde está la lesión?`;
      return choice(rng, p, s.label, take(rng, Object.entries(SITES).filter(([kk]) => kk !== k), 3).map(([, o]) => ({ text: o.label, note: `Esa daría ${list3(take(rng, o.key, 2))}.`, misconception: s.mis })),
        { concept, slide: s.slide, hint: '¿Hay debilidad? ¿Tono y reflejos? ¿Temblor en reposo o al moverse?', explain: `${list3(signs)} → ${s.label}.` });
    }
  };

  /* ════════ Afirmaciones: "señale la correcta / la incorrecta" ════════
     Bancos de hechos verdaderos (T) y errores típicos (F: [texto, por qué es falso, error típico]). Al combinarlos salen cientos de preguntas
     distintas, y cada distractor falso trae su explicación. */
  function statements(rng, level, bank, extra) {
    const askFalse = level >= 3 ? rng() < 0.5 : false, T = bank.T, F = bank.F;
    if (askFalse) {
      const [f, why, mis] = pick(rng, F);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}: ¿cuál afirmación es INCORRECTA?`, f, take(rng, T, 3).map(t => ({ text: t, note: 'Esta es verdadera.' })),
        { ...extra, misconception: mis, explain: `Es falsa: ${why}` });
    }
    const t = pick(rng, T);
    return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${bank.topic}: ¿cuál afirmación es correcta?`, t, take(rng, F, 3).map(([text, why, mis]) => ({ text, note: why, misconception: mis })), { ...extra, explain: t });
  }

  /* ════════ Enfermedades: caso → diagnóstico → mecanismo → fármaco con su porqué ════════
     Cada concepto tiene cuadros que se confunden entre sí; las alternativas salen de ese mismo grupo.
     key: signos que distinguen el cuadro; bad: una razón FALSA que suena bien (para el distractor "fármaco correcto, porqué equivocado"). */
  const DIS = {
    'fis.ganglios': [
      { name: 'Enfermedad de Parkinson', key: ['temblor de reposo que empezó en una sola mano', 'rigidez en rueda dentada sin tomar medicamentos'], other: ['bradicinesia', 'marcha a pasos cortos', 'cara inexpresiva', 'letra cada vez más pequeña'], mech: 'Muerte de neuronas dopaminérgicas de la sustancia negra → ↓ dopamina en el estriado', tx: 'L-DOPA con carbidopa', why: 'la L-DOPA cruza la barrera hematoencefálica y se convierte en dopamina; la carbidopa evita que se gaste fuera del cerebro', bad: 'bloquea la dopamina que sobra en el estriado', mis: 'parkinson-dopa', slide: 3 },
      { name: 'Enfermedad de Huntington', key: ['movimientos bruscos e involuntarios (corea)', 'padre con el mismo cuadro a los 45 años'], other: ['cambios de conducta', 'deterioro cognitivo progresivo', 'irritabilidad'], mech: 'Pérdida de neuronas GABAérgicas del estriado → se pierde el freno del movimiento', tx: 'Tetrabenazina', why: 'reduce la dopamina disponible y con eso los movimientos de más', bad: 'repone la dopamina que falta en el estriado', mis: 'parkinson-dopa', slide: 3 },
      { name: 'Lesión del cerebelo', key: ['temblor al acercar el dedo a la nariz', 'dismetría', 'marcha con base amplia, como borracho'], other: ['fuerza conservada', 'habla entrecortada', 'no logra alternar movimientos rápidos'], mech: 'Falla la coordinación del movimiento (sin pérdida de fuerza)', tx: 'Rehabilitación y tratar la causa', why: 'no hay un neurotransmisor que reponer: el problema es de coordinación', bad: 'hay que reponer la dopamina del cerebelo', mis: 'cerebellum-paralysis', slide: 4 },
      { name: 'Parkinsonismo por fármacos', key: ['rigidez y lentitud desde que empezó haloperidol', 'mejoró al suspender el antipsicótico'], other: ['temblor de ambos lados por igual', 'bradicinesia', 'cara inexpresiva'], mech: 'Bloqueo de receptores D2 del estriado por el fármaco', tx: 'Suspender o cambiar el antipsicótico', why: 'el problema es el bloqueo del receptor, no la muerte de neuronas', bad: 'murieron las neuronas de la sustancia negra', mis: 'parkinson-dopa', slide: 3 }
    ],
    'fis.placa': [
      { name: 'Miastenia gravis', key: ['ptosis que empeora en la tarde', 'debilidad que empeora con el uso y mejora con el reposo'], other: ['visión doble al leer mucho rato', 'reflejos normales', 'voz nasal al final de una conversación larga', 'pupilas normales'], mech: 'Autoanticuerpos contra el receptor nicotínico de la placa motora', tx: 'Piridostigmina', why: 'inhibe la acetilcolinesterasa: queda más ACh para los receptores que quedan', bad: 'bloquea los receptores muscarínicos que causan la debilidad', mis: 'mg-mechanism', slide: 5 },
      { name: 'Síndrome de Lambert-Eaton', key: ['debilidad de caderas que mejora tras unos segundos de esfuerzo', 'fumador con un tumor pulmonar de células pequeñas'], other: ['boca seca', 'reflejos disminuidos', 'dificultad para subir escaleras'], mech: 'Anticuerpos contra canales de Ca²⁺ presinápticos → se libera menos ACh', tx: 'Tratar el tumor y dar fármacos que aumentan la liberación de ACh', why: 'el defecto está antes de la sinapsis: falta liberar ACh', bad: 'los anticuerpos bloquean el receptor nicotínico postsináptico', mis: 'mg-mechanism', slide: 5 },
      { name: 'Botulismo', key: ['conservas caseras hace 2 días', 'parálisis que baja desde los ojos hacia el cuerpo'], other: ['pupilas dilatadas', 'sin fiebre y consciente', 'dificultad para tragar', 'boca seca'], mech: 'La toxina botulínica impide la liberación de ACh en la placa', tx: 'Antitoxina y soporte ventilatorio', why: 'neutraliza la toxina que aún circula; la que ya entró a la terminal tarda semanas en irse', bad: 'falta acetilcolinesterasa en la placa', mis: 'mg-mechanism', slide: 5 }
    ],
    'fis.motoneurona': [
      { name: 'Esclerosis lateral amiotrófica', key: ['atrofia de las manos con fasciculaciones y además Babinski', 'fasciculaciones en la lengua con hiperreflexia'], other: ['sensibilidad normal', 'dificultad para tragar', 'hiperreflexia en las piernas', 'progresión en meses'], mech: 'Degeneración de motoneuronas superiores e inferiores', tx: 'Riluzol y soporte', why: 'reduce la liberación de glutamato (excitotoxicidad) y prolonga algo la sobrevida', bad: 'repone la mielina de los nervios periféricos', mis: 'umn-lmn', slide: 2 },
      { name: 'ACV de la cápsula interna', key: ['debilidad de medio cuerpo de inicio súbito', 'boca desviada y brazo débil desde hace una hora'], other: ['hiperreflexia del lado débil', 'Babinski del lado débil', 'hipertensión mal controlada'], mech: 'Lesión de la motoneurona superior (vía piramidal)', tx: 'Reperfusión precoz y rehabilitación', why: 'la penumbra se salva si vuelve el flujo a tiempo; después, rehabilitar', bad: 'la lesión está en el nervio periférico', mis: 'umn-lmn', slide: 2 },
      { name: 'Síndrome de Guillain-Barré', key: ['debilidad que sube desde los pies en pocos días', 'diarrea dos semanas antes y ahora arreflexia'], other: ['arreflexia', 'hormigueo en manos y pies', 'dificultad para respirar'], mech: 'Desmielinización autoinmune de los nervios periféricos (motoneurona inferior)', tx: 'Inmunoglobulina endovenosa o plasmaféresis, vigilando la respiración', why: 'quita o neutraliza los anticuerpos que atacan la mielina', bad: 'es una lesión espástica por pérdida del freno cortical', mis: 'umn-lmn', slide: 2 },
      { name: 'Compresión de la raíz L5', key: ['dolor lumbar que baja por la pierna', 'no puede levantar la punta de un pie'], other: ['hormigueo en el dorso del pie', 'reflejos del resto normales', 'empeora al toser'], mech: 'Lesión de la motoneurona inferior en un territorio (raíz)', tx: 'Analgesia, rehabilitación y cirugía si el déficit progresa', why: 'el problema es mecánico sobre una sola raíz', bad: 'la lesión está en la corteza motora', mis: 'umn-lmn', slide: 2 }
    ],
    'fis.toxicos': [
      { name: 'Intoxicación por organofosforados', key: ['salivación, lagrimeo y broncorrea', 'fasciculaciones con miosis', 'fumigó un huerto esta mañana'], other: ['miosis puntiforme', 'diarrea', 'bradicardia', 'sudoración profusa'], mech: 'Inhibición de la acetilcolinesterasa → exceso de acetilcolina', tx: 'Atropina más una oxima', why: 'la atropina bloquea el exceso muscarínico y la oxima reactiva la enzima', bad: 'la atropina reactiva la acetilcolinesterasa', mis: 'cholinergic', slide: 7 },
      { name: 'Intoxicación anticolinérgica', key: ['piel seca, roja y caliente', 'retención urinaria', 'mucosas muy secas'], other: ['midriasis', 'taquicardia', 'confusión', 'tomó muchos antihistamínicos antiguos'], mech: 'Bloqueo de receptores muscarínicos', tx: 'Soporte (y fisostigmina en casos graves)', why: 'la fisostigmina aumenta la ACh y compite con el bloqueo', bad: 'hay que bloquear aún más los receptores muscarínicos', mis: 'cholinergic', slide: 7 },
      { name: 'Intoxicación por opioides', key: ['respira 6 veces por minuto', 'miosis sin secreciones ni sudor'], other: ['somnolencia profunda', 'piel normal', 'jeringa en el bolsillo'], mech: 'Activación de receptores μ opioides → depresión respiratoria', tx: 'Naloxona', why: 'antagoniza el receptor μ y revierte la depresión respiratoria', bad: 'bloquea los receptores muscarínicos que causan la miosis', mis: 'cholinergic', slide: 7 },
      { name: 'Intoxicación simpaticomimética (cocaína)', key: ['midriasis con sudoración profusa', 'dolor de pecho tras consumir cocaína'], other: ['taquicardia', 'hipertensión', 'agitación'], mech: 'Exceso de noradrenalina en la sinapsis (bloqueo de su recaptación)', tx: 'Benzodiacepinas y soporte', why: 'calman la agitación y bajan el tono simpático central', bad: 'bloquean los receptores muscarínicos', mis: 'symp-para', slide: 7 },
      { name: 'Síndrome de Horner', key: ['ptosis y miosis del mismo lado', 'sin sudor en media cara'], other: ['fumador con dolor en el hombro', 'el otro ojo es normal'], mech: 'Interrupción de la vía simpática hacia la cara', tx: 'Buscar y tratar la causa (por ejemplo, un tumor del vértice pulmonar)', why: 'es un signo de una lesión en la vía, no una enfermedad en sí', bad: 'hay que bloquear un exceso de actividad parasimpática', mis: 'symp-para', slide: 7 }
    ]
  };
  const caseText = (rng, d, level) => `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} con ${list3(caseSigns(rng, d, level <= 2 ? 2 : 3))}.`;
  const lower = t => t.charAt(0).toLowerCase() + t.slice(1);
  const mecanismo = {
    id: 'mecanismo', title: 'Del caso al mecanismo', mission: 'm1', concepts: ['fis.ganglios', 'fis.placa', 'fis.motoneurona', 'fis.toxicos'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts), list = DIS[c], d = pick(rng, list), others = list.filter(x => x !== d);
      if (level <= 2) return choice(rng, `${caseText(rng, d, level)} ¿Diagnóstico más probable?`, d.name, others.map(o => ({ text: o.name, note: `Daría ${list3(take(rng, o.key, 2))}.`, misconception: d.mis })),
        { concept: c, slide: d.slide, hint: 'Busca la pista que separa a cuadros parecidos.', explain: `${d.name}: ${lower(d.mech)}.` });
      return choice(rng, `${caseText(rng, d, level)} ¿Qué mecanismo explica el cuadro?`, d.mech, others.map(o => ({ text: o.mech, note: `Ese es el mecanismo de: ${lower(o.name)}.`, misconception: d.mis })),
        { concept: c, slide: d.slide, hint: 'Primero el diagnóstico; luego, qué célula o molécula falla.', explain: `${d.name}: ${lower(d.mech)}.` });
    }
  };
  const tratamiento = {
    id: 'tratamiento', title: 'Fármaco y su porqué', mission: 'm1', concepts: ['fis.ganglios', 'fis.placa', 'fis.motoneurona', 'fis.toxicos'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts), list = DIS[c], d = pick(rng, list), others = list.filter(x => x !== d);
      const right = `${d.tx}, porque ${d.why}`;
      const opts = [{ text: `${d.tx}, porque ${d.bad}`, note: `El fármaco está bien, pero la razón es falsa: ${d.why}.`, misconception: d.mis },
        ...take(rng, others, 2).map(o => ({ text: `${o.tx}, porque ${o.why}`, note: `Eso corresponde a: ${lower(o.name)}.` }))];
      const head = level <= 2 ? `Paciente con diagnóstico de ${lower(d.name)}.` : caseText(rng, d, level);
      return choice(rng, `${head} ¿Qué tratamiento corresponde y por qué?`, right, opts,
        { concept: c, slide: d.slide, hint: 'El fármaco debe corregir el eslabón que falla. Revisa también la razón.', explain: `${d.name}: ${right}.` });
    }
  };

  /* ════════ Simpático o parasimpático ════════ */
  const EFF = [['midriasis', 's'], ['miosis', 'p'], ['taquicardia', 's'], ['bradicardia', 'p'], ['broncodilatación', 's'], ['broncoconstricción', 'p'], ['más motilidad intestinal', 'p'], ['menos motilidad intestinal', 's'], ['salivación abundante', 'p'], ['glucogenólisis', 's']];
  const sna = {
    id: 'sna', title: 'Simpático o parasimpático', mission: 'm2', concepts: ['fis.sna'],
    make(rng, level) {
      const n = level <= 2 ? 1 : 3, side = pick(rng, ['s', 'p']), effs = take(rng, EFF.filter(e => e[1] === side), n).map(e => e[0]);
      const right = side === 's' ? 'Simpático (noradrenalina)' : 'Parasimpático (acetilcolina muscarínica)';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Qué rama del sistema vegetativo produce ${effs.join(', ')}?`, right, [{ text: side === 's' ? 'Parasimpático (acetilcolina muscarínica)' : 'Simpático (noradrenalina)', note: 'Lucha o huida frente a descanso y digestión.', misconception: 'symp-para' }, { text: 'Placa motora (acetilcolina nicotínica)', note: 'La placa es del músculo esquelético.' }],
        { concept: 'fis.sna', slide: 6, hint: '¿Sirve para huir o para digerir?', explain: `${right}.` });
    }
  };

  /* ════════ Toxíndromes (casos de urgencia) ════════ */
  const toxindrome = {
    id: 'toxindrome', title: 'Reconocer el síndrome', mission: 'm2', concepts: ['fis.toxicos'],
    make(rng, level) {
      const list = DIS['fis.toxicos'], d = pick(rng, list);
      const n = level <= 2 ? 2 : 3, signs = caseSigns(rng, d, n);
      const extra = level >= 4 ? ` Signos vitales: FC ${d.name.includes('organof') ? 48 : d.name.includes('opioides') ? 58 : d.name.includes('Horner') ? 76 : 128} lpm.` : '';
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${AGE(rng)} llega a urgencias con ${list3(signs)}.${extra} ¿Qué cuadro es?`, d.name, list.filter(o => o !== d).map(o => ({ text: o.name, note: `Daría ${list3(take(rng, o.key, 2))}.`, misconception: d.mis })),
        { concept: 'fis.toxicos', slide: 7, hint: '¿Moja o seca? ¿Pupila grande o chica? ¿Respira bien? ¿Un lado o todo?', explain: `${d.name}: ${lower(d.mech)}. Tratamiento: ${lower(d.tx)}.` });
    }
  };

  /* ════════ Bases ════════ */
  // Dónde está la lesión → qué lado y qué tipo de debilidad.
  const LOC = [
    { where: side => `un ACV de la corteza motora ${side === 'izquierdo' ? 'izquierda' : 'derecha'}`, out: side => `Lado ${opp(side)}: espástica con hiperreflexia y Babinski (semanas después)` },
    { where: side => `un hematoma en la cápsula interna ${side === 'izquierdo' ? 'izquierda' : 'derecha'}`, out: side => `Lado ${opp(side)}: espástica con hiperreflexia y Babinski (semanas después)` },
    { where: side => `una compresión de la raíz C7 ${side === 'izquierdo' ? 'izquierda' : 'derecha'}`, out: side => `Lado ${side}, solo en el territorio de esa raíz: fláccida con reflejo disminuido` },
    { where: side => `un corte del nervio radial ${side === 'izquierdo' ? 'izquierdo' : 'derecho'}`, out: side => `Lado ${side}, solo en el territorio del nervio: fláccida con atrofia` },
    { where: () => 'una sección completa de la médula a nivel T8 (hace dos meses)', out: () => 'Ambas piernas: espásticas con hiperreflexia y Babinski' }
  ];
  const opp = side => side === 'izquierdo' ? 'derecho' : 'izquierdo';
  const VIA_BANK = { topic: 'La vía motora', T: ['La vía piramidal cruza al otro lado en el bulbo.', 'La motoneurona inferior está en el asta anterior de la médula.', 'Una lesión de la motoneurona superior da hiperreflexia.', 'Una lesión de la motoneurona inferior da atrofia y fasciculaciones.', 'El signo de Babinski indica daño de la vía piramidal (en adultos).', 'En la placa motora la ACh actúa sobre receptores nicotínicos.', 'El cerebelo y los ganglios basales modulan el movimiento sin mandar la orden final.'],
    F: [['Un ACV del hemisferio izquierdo debilita el lado izquierdo.', 'la vía piramidal cruza: debilita el lado derecho.', 'umn-lmn'], ['La motoneurona superior inerva directamente al músculo.', 'la que llega al músculo es la inferior.', 'umn-lmn'], ['Las fasciculaciones son típicas de la lesión de motoneurona superior.', 'son de la motoneurona inferior.', 'umn-lmn'], ['En la placa motora la ACh actúa sobre receptores muscarínicos.', 'en la placa son nicotínicos.', 'mg-mechanism'], ['El cerebelo, si se daña, produce parálisis.', 'el cerebelo coordina; su daño da ataxia, no parálisis.', 'cerebellum-paralysis'], ['La espasticidad indica lesión del nervio periférico.', 'indica lesión de la motoneurona superior.', 'umn-lmn']] };
  const via = {
    id: 'via', title: 'La vía motora', mission: null, concepts: ['base.via'],
    make(rng, level) {
      if (level >= 4) return statements(rng, level, VIA_BANK, { concept: 'base.via', slide: 1, hint: 'Recorre la vía: corteza → bulbo (cruce) → médula → nervio → placa.' });
      const L = pick(rng, LOC), side = pick(rng, ['izquierdo', 'derecho']), right = L.out(side);
      const wrong = [...new Set([...LOC.map(x => x.out(side)), ...LOC.map(x => x.out(opp(side)))])].filter(t => t !== right);
      return choice(rng, `${level === 3 ? `${AGE(rng)} con ` : 'Paciente con '}${L.where(side)}. ¿Dónde y cómo será la debilidad?`, right, take(rng, wrong, 3).map(text => ({ text, note: 'Piensa si la lesión es antes o después del cruce y si es motoneurona superior o inferior.', misconception: 'umn-lmn' })),
        { concept: 'base.via', slide: 2, hint: '¿Antes o después del cruce en el bulbo? ¿Superior o inferior?', explain: right + '.' });
    }
  };
  const DRUGS = [
    ['Salbutamol', 'Agonista β2', 'abre los bronquios en una crisis de asma'], ['Propranolol', 'Antagonista β1 y β2', 'baja la frecuencia cardíaca, pero puede cerrar los bronquios'],
    ['Atenolol', 'Antagonista β1 selectivo', 'baja la frecuencia cardíaca con menos efecto en los bronquios'], ['Atropina', 'Antagonista muscarínico', 'sube la frecuencia cardíaca, dilata la pupila y seca la boca'],
    ['Ipratropio', 'Antagonista muscarínico inhalado', 'broncodilata sin pasar mucho a la sangre'], ['Fenilefrina', 'Agonista α1', 'contrae los vasos y descongestiona la nariz'],
    ['Tamsulosina', 'Antagonista α1', 'relaja el cuello de la vejiga y la próstata (puede bajar la presión al pararse)'], ['Neostigmina', 'Inhibidor de la acetilcolinesterasa', 'revierte el bloqueo neuromuscular al aumentar la ACh'],
    ['Pilocarpina', 'Agonista muscarínico', 'contrae la pupila y aumenta la saliva'], ['Rocuronio', 'Antagonista nicotínico de la placa', 'relaja el músculo esquelético durante una cirugía'],
    ['Adrenalina', 'Agonista α y β', 'sube la presión, acelera el corazón y abre los bronquios en la anafilaxia']
  ];
  const ADVERSE = [
    ['Un asmático recibe propranolol para la presión y hace una crisis de asma', 'Bloqueo β2 bronquial'], ['Tras usar atropina, un adulto mayor no puede orinar', 'Bloqueo muscarínico de la vejiga'],
    ['Al empezar tamsulosina, un hombre se marea al levantarse', 'Bloqueo α1 de los vasos (hipotensión ortostática)'], ['Tras dosis altas de salbutamol aparecen temblor y taquicardia', 'Estimulación β (β2 en músculo y algo de β1)'],
    ['Al revertir la anestesia con neostigmina, la frecuencia cardíaca cae a 45', 'Más ACh sobre receptores muscarínicos del corazón'], ['Con gotas de fenilefrina en la nariz por semanas, la congestión empeora al suspenderlas', 'Efecto rebote tras estimulación α1 prolongada']
  ];
  const receptores = {
    id: 'receptores', title: 'Fármacos del sistema vegetativo', mission: null, concepts: ['base.sna'],
    make(rng, level) {
      if (level <= 2) { const [d, act, eff] = pick(rng, DRUGS);
        return choice(rng, `${d} ${eff}. ¿Cómo actúa?`, act, take(rng, [...new Set(DRUGS.map(x => x[1]))].filter(x => x !== act), 3).map(text => ({ text, note: 'No explica ese efecto.' })),
          { concept: 'base.sna', slide: 6, hint: '¿Imita o bloquea? ¿A qué receptor?', explain: `${d}: ${act.toLowerCase()}.` }); }
      if (level === 3) { const [d, act, eff] = pick(rng, DRUGS);
        return choice(rng, `¿Qué fármaco ${eff}?`, d, take(rng, DRUGS.filter(x => x[0] !== d), 3).map(x => ({ text: x[0], note: `${x[0]}: ${x[1].toLowerCase()}.` })),
          { concept: 'base.sna', slide: 6, hint: 'Piensa qué receptor produce ese efecto y quién lo imita o bloquea.', explain: `${d} (${act.toLowerCase()}).` }); }
      const [c, why] = pick(rng, ADVERSE);
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}${c}. ¿Qué lo explica?`, why, take(rng, ADVERSE.filter(x => x[1] !== why), 3).map(x => ({ text: x[1], note: 'Ese mecanismo no produce este efecto.', misconception: 'symp-para' })),
        { concept: 'base.sna', slide: 6, hint: 'Identifica el receptor del órgano afectado.', explain: why + '.' });
    }
  };

  const generators = [localizar, mecanismo, tratamiento, sna, toxindrome, via, receptores];

  /* Laboratorio "¿qué pasa si…?": una persona sana y lo que le das. */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [
    S('sano', 'Persona sana en reposo', 'pupilas normales · FC 70'), S('colinergico', 'Síndrome colinérgico', 'miosis · secreciones · FC 50'), S('anticolinergico', 'Síndrome anticolinérgico', 'midriasis · seco · FC 120'),
    S('miastenia', 'Persona con miastenia gravis', 'ptosis que empeora en la tarde'), S('mg-mejor', 'Miastenia mejorada', 'más ACh en la placa'), S('asma', 'Crisis de asma', 'broncoconstricción'), S('asma-mejor', 'Bronquios abiertos', 'broncodilatación')
  ];
  const reagents = [['op', 'Organofosforado (inhibe la AChE)'], ['atropina', 'Atropina (bloquea muscarínico)'], ['piridostigmina', 'Piridostigmina (inhibe la AChE, uso médico)'], ['salbutamol', 'Salbutamol (agonista β2)'], ['propranolol', 'Propranolol (bloquea β1 y β2)']].map(([id, label]) => ({ id, label }));
  const RX = {
    'sano>op': ['colinergico', 'Sin acetilcolinesterasa la ACh se acumula: todo moja, miosis y bradicardia.'],
    'sano>atropina': ['anticolinergico', 'Bloqueas el parasimpático: seco, rojo, caliente, midriasis y taquicardia.'],
    'colinergico>atropina': ['sano', 'La atropina bloquea el receptor muscarínico: se secan las secreciones y sube la frecuencia.'],
    'miastenia>piridostigmina': ['mg-mejor', 'Más ACh dura más en la placa y compensa los receptores bloqueados por anticuerpos.'],
    'asma>salbutamol': ['asma-mejor', 'β2 relaja el músculo liso bronquial.'],
    'asma>atropina': ['asma-mejor', 'Bloquear el muscarínico también broncodilata (por eso existe el ipratropio inhalado).']
  };
  const WHY_NOT = { propranolol: 'Cuidado: bloquear β2 cierra los bronquios y bloquear β1 baja la frecuencia. No ayuda aquí.', op: 'Agregar un organofosforado solo empeora: más ACh.', piridostigmina: 'Más ACh aquí no corrige nada (o empeora).', salbutamol: 'β2 no corrige este cuadro.' };
  function react(fromId, rid) {
    const r = RX[`${fromId}>${rid}`];
    if (r) return { to: r[0], ok: true, why: r[1] };
    if (fromId === 'asma' && rid === 'propranolol') return { to: null, ok: false, why: '¡Peligro! Bloquear β2 en una crisis de asma la empeora.' };
    return { to: null, ok: false, why: WHY_NOT[rid] || 'Este fármaco no cambia este cuadro de forma útil.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['sano', 'miastenia', 'asma'] };

  const creatures = {
    'base.via': ['Escriba', '#a07a4a'], 'base.sna': ['Búho', '#5d6f9e'],
    'fis.motoneurona': ['Trasgo', '#7f9a3c'], 'fis.placa': ['Duende', '#6d8bd6'], 'fis.ganglios': ['Gólem', '#8a6fd1'], 'fis.sna': ['Grifo', '#c98a1b'], 'fis.toxicos': ['Hidra', '#c0574a']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['fis-01'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
