/* Fisiopatología · PEP 1 · Lesión cerebral aguda: isquemia, edema y presión intracraneal (jueves 12 de noviembre).
   Las clases de nervioso (Dr. Cárdenas) aún no están en el Drive: el contenido sale de la bibliografía básica del programa
   (Silbernagl y Lang, Fisiopatología, 2011, cap. "Sistema nervioso": isquemia cerebral, edema cerebral, LCR y presión intracraneal).
   Las "láminas" son secciones propias. Números recalculados en Python. */
(() => {
  'use strict';
  const SRC = 'silbernagl';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  const num = (id, prompt, answer, unit, extra = {}) => ({ id, type: 'number', prompt, answer, unit, tol: 0.02, source: SRC, ...extra });
  const spot = (id, prompt, steps, wrong, fix, extra = {}) => ({ id, type: 'spot', prompt, steps, wrong, fix, source: SRC, ...extra });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['fis-02'] = {
    id: 'fis-02',
    subject: 'fisio',
    title: 'Lesión cerebral aguda: isquemia, edema y PIC',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Fisiopatología (cap. sistema nervioso: isquemia, edema cerebral y presión intracraneal)', author: 'Silbernagl y Lang', detail: 'Bibliografía básica del programa 2026-2 (clases del Dr. Cárdenas aún no están en el Drive)', authority: 'Libro de texto' }
    },
    misconceptions: {
      'excito-gaba': { label: 'Culpaste al GABA de la excitotoxicidad', why: 'La **excitotoxicidad** la causa el exceso de **glutamato** (excitador): activa receptores **NMDA**, entra **Ca²⁺** y se activan enzimas que destruyen la neurona. El GABA es **inhibidor**.',
        prereq: { title: 'Sin flujo no hay ATP', mission: 'm1', block: 'm1b1' }, base: 'base.energia' },
      'core-penumbra': { label: 'Confundiste núcleo isquémico con penumbra', why: 'El **núcleo** ya está muerto (flujo muy bajo). La **penumbra** está "aturdida" pero viva: **se puede salvar** si se restablece el flujo a tiempo (por eso la trombolisis es urgente: "tiempo es cerebro").',
        prereq: { title: 'Sin flujo no hay ATP', mission: 'm1', block: 'm1b1' }, base: 'base.energia' },
      'edema-type': { label: 'Confundiste edema citotóxico con vasogénico', why: '**Citotóxico**: la célula se hincha porque fallan sus bombas (Na⁺/K⁺-ATPasa); la barrera hematoencefálica está **intacta**; aparece **temprano** en la isquemia. **Vasogénico**: se rompe la **barrera hematoencefálica** y sale líquido rico en proteínas al espacio **extracelular** (tumores, abscesos, trauma); en tumores responde a **corticoides**.',
        prereq: { title: 'Edema y Monro-Kellie', mission: 'm2', block: 'm2b1' }, base: 'base.presion' },
      'ppc-sign': { label: 'Calculaste mal la presión de perfusión cerebral', why: '**PPC = PAM − PIC.** Si la PIC sube, la perfusión **baja**. Y la PAM no es la sistólica: **PAM ≈ PAD + (PAS − PAD)/3**.',
        prereq: { title: 'Presión intracraneal y perfusión', mission: 'm2', block: 'm2b2' }, base: 'base.presion',
        check: q('fix-ppc', 'Caso corto: PAM 90 mmHg y PIC 30 mmHg. PPC =', [{ text: '60 mmHg', correct: true }, { text: '120 mmHg', note: 'Se resta la PIC.' }, { text: '3 mmHg', note: 'Es una resta, no una división.' }], { concept: 'fis.pic', explain: '90 − 30.', slide: 6 }) },
      'cushing': { label: 'No reconociste la tríada de Cushing', why: 'Con PIC muy alta el cerebro sube la presión arterial para mantener la perfusión: **hipertensión**, **bradicardia** (reflejo barorreceptor) y **respiración irregular**. Es un signo **tardío** de herniación inminente.',
        prereq: { title: 'Presión intracraneal y perfusión', mission: 'm2', block: 'm2b2' }, base: 'base.presion' }
    },
    goal: {
      total: 100, text: 'Asegurar los 15 puntos de lesión cerebral aguda de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P3', label: 'Cascada isquémica y excitotoxicidad', points: 7, missions: ['m1'] },
        { id: 'P4', label: 'Edema cerebral, PIC y perfusión', points: 8, missions: ['m2'] }
      ],
      rest: [{ label: 'Motricidad y vegetativo', points: 25, note: 'clase fis-01' }, { label: 'Respiratorio', points: 30, note: 'clase fis-06' }, { label: 'Digestivo', points: 30, note: 'clase fis-09' }]
    },
    glossary: [
      { term: 'Excitotoxicidad', mission: 'm1', def: 'Muerte neuronal causada por estimulación excesiva de receptores de glutamato (NMDA) con entrada masiva de Ca²⁺.', simple: 'Morir de tanto excitarse.', simpler: 'Un timbre que suena hasta quemarse.' },
      { term: 'Penumbra isquémica', mission: 'm1', def: 'Tejido alrededor del núcleo de un infarto que no funciona pero sigue vivo y puede recuperarse si vuelve el flujo.', simple: 'La zona aturdida que todavía se puede salvar.', simpler: 'Las brasas que aún no se apagan.' },
      { term: 'Edema citotóxico', mission: 'm2', def: 'Hinchazón de las células por falla de sus bombas iónicas, con barrera hematoencefálica intacta.', simple: 'Las células se llenan de agua.', simpler: 'Globos que se inflan por dentro.' },
      { term: 'Edema vasogénico', mission: 'm2', def: 'Salida de líquido rico en proteínas al espacio extracelular por ruptura de la barrera hematoencefálica.', simple: 'Los vasos "gotean" hacia afuera.', simpler: 'Una cañería rota que moja el piso.' },
      { term: 'Presión de perfusión cerebral', mission: 'm2', def: 'Diferencia entre la presión arterial media y la presión intracraneal: PPC = PAM − PIC.', simple: 'Con cuánta fuerza llega la sangre al cerebro.', simpler: 'La presión del agua que llega a la manguera.' }
    ],
    concepts: [
      { id: 'base.energia', title: 'ATP y gradientes iónicos', root: true },
      { id: 'base.presion', title: 'Presión arterial media', root: true },
      { id: 'fis.isquemia', mission: 'm1', title: 'Cascada isquémica', needs: ['base.energia'] },
      { id: 'fis.penumbra', mission: 'm1', title: 'Núcleo, penumbra y ventana terapéutica', needs: ['fis.isquemia'] },
      { id: 'fis.edema', mission: 'm2', title: 'Edema citotóxico y vasogénico', needs: ['fis.isquemia'] },
      { id: 'fis.pic', mission: 'm2', title: 'Monro-Kellie, PIC y perfusión', needs: ['base.presion', 'fis.edema'] }
    ],
    curiosities: [
      { text: 'El cerebro es el 2 % del peso corporal pero usa cerca del 20 % del oxígeno en reposo, y casi no guarda glucógeno: por eso unos pocos minutos sin flujo bastan para dañarlo.', slide: 1 },
      { text: 'En un ACV grande sin tratar se pierden del orden de 1,9 millones de neuronas por minuto (Saver, Stroke 2006): de ahí la frase "tiempo es cerebro".', slide: 3 },
      { text: 'La tríada de Cushing la describió Harvey Cushing en 1901 comprimiendo el cerebro de perros: la presión arterial subía para "empujar" la sangre contra la presión intracraneal.', slide: 7 }
    ],
    slideImages: {},
    slides: {
      1: { title: 'El cerebro sin reservas', bullets: ['2 % del peso, ~20 % del O₂', 'Depende de glucosa y O₂ continuos', 'Sin flujo: falla en segundos, daño en minutos'] },
      2: { title: 'Cascada isquémica', bullets: ['↓ flujo → ↓ ATP → falla Na⁺/K⁺-ATPasa', 'Despolarización → liberación de glutamato, ↓ recaptación', 'NMDA → ↑ Ca²⁺ → proteasas, lipasas, radicales libres → muerte'] },
      3: { title: 'Núcleo y penumbra', bullets: ['Núcleo: necrosis irreversible', 'Penumbra: viva y salvable', 'Trombolisis (rtPA) dentro de 4,5 h en el ACV isquémico'] },
      4: { title: 'Edema cerebral', bullets: ['Citotóxico: célula hinchada, BHE intacta, temprano en isquemia', 'Vasogénico: BHE rota, líquido extracelular, tumores y trauma', 'Intersticial: LCR a presión (hidrocefalia)'] },
      5: { title: 'Doctrina de Monro-Kellie', bullets: ['Cráneo rígido: cerebro + sangre + LCR = constante', 'Al crecer uno, deben bajar los otros', 'Agotada la compensación, la PIC sube rápido'] },
      6: { title: 'PIC y perfusión', bullets: ['PIC normal 5–15 mmHg; > 20 = hipertensión intracraneal', 'PPC = PAM − PIC (meta ≥ 60 mmHg)', 'PAM ≈ PAD + (PAS − PAD)/3'] },
      7: { title: 'Signos de hipertensión intracraneal', bullets: ['Cefalea, vómitos, papiledema, compromiso de conciencia', 'Tríada de Cushing: HTA, bradicardia, respiración irregular', 'Herniación'] }
    },
    missions: [
      {
        id: 'm1', title: 'Tiempo es cerebro', subtitle: 'Cascada isquémica, excitotoxicidad y penumbra', minutes: 20, slides: '1–3', pep: 'P3: cascada isquémica',
        stages: {
          hook: { title: 'El reloj del ACV', sage: 'Un coágulo tapa una arteria cerebral. En el centro, las neuronas mueren en minutos. Alrededor, otras quedan aturdidas, esperando. Lo que pase con ellas depende de cuánto tarda el paciente en llegar.',
            text: 'La PEP pregunta la **cadena**: por qué la falta de flujo termina matando neuronas y qué parte del daño se puede evitar.' },
          diagnostic: [
            q('m1-d1', 'En la isquemia, la sustancia que mata neuronas por sobreestimulación es…', [{ text: 'El glutamato', correct: true }, { text: 'El GABA', misconception: 'excito-gaba' }, { text: 'La dopamina', note: 'No es el actor central.' }], { concept: 'fis.isquemia', explain: 'Excitotoxicidad por glutamato.', slide: 2 }),
            q('m1-d2', 'La zona alrededor de un infarto cerebral que aún se puede salvar se llama…', [{ text: 'Penumbra', correct: true }, { text: 'Núcleo', misconception: 'core-penumbra' }, { text: 'Edema', note: 'El edema es otra cosa.' }], { concept: 'fis.penumbra', explain: 'La penumbra está viva.', slide: 3 })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.energia', title: 'Desde cero: ATP y bombas', slide: 1, body: 'La neurona mantiene **mucho K⁺ adentro y mucho Na⁺ afuera** gracias a la **Na⁺/K⁺-ATPasa**, que gasta ATP. Sin O₂ ni glucosa no hay ATP: la bomba se detiene, entra Na⁺ (y agua) y la membrana se **despolariza**.',
              deeper: 'El cerebro no tiene reservas útiles de glucógeno ni de O₂: depende del flujo minuto a minuto. Sin flujo, el EEG se apaga en ~10–20 segundos y el daño irreversible empieza en minutos.' }
          ],
          explain: [],
          transfer: [
            order('m1-t1', 'Estilo PEP: ordena la cascada isquémica.', [['a', 'Oclusión arterial: ↓ flujo'], ['b', '↓ ATP'], ['c', 'Falla de la Na⁺/K⁺-ATPasa y despolarización'], ['d', 'Liberación de glutamato y menor recaptación'], ['e', 'Activación de NMDA y entrada de Ca²⁺'], ['f', 'Proteasas, lipasas y radicales libres: muerte neuronal']], ['a', 'b', 'c', 'd', 'e', 'f'],
              { concept: 'fis.isquemia', direction: 'Del coágulo a la muerte neuronal.', explain: 'Sin energía → sin bombas → glutamato → Ca²⁺ → enzimas.', slide: 2 }),
            write('m1-w1', 'Enséñale a tu compañero: ¿por qué un ACV isquémico es una urgencia "minuto a minuto"?', 'Porque el tejido del centro muere en minutos, pero alrededor queda una penumbra que sigue viva aunque no funcione. Si se restablece el flujo a tiempo, por ejemplo con trombolisis dentro de 4,5 horas, la penumbra se salva; si no, la cascada isquémica la convierte en núcleo de infarto.',
              ['Núcleo: muerto; penumbra: viva y salvable', 'Restablecer el flujo a tiempo (trombolisis, ventana)', 'Si no, la penumbra pasa a infarto'],
              { concept: 'fis.penumbra', explain: 'Tiempo es cerebro.', slide: 3, teach: true, keywords: [{ label: 'penumbra', any: ['penumbra', 'salvable', 'aturdid'] }, { label: 'flujo / trombolisis', any: ['flujo', 'trombol', 'reperfu'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **sin flujo no hay ATP**.',
            pretest: q('m1-pre1', 'Adivina antes: si se acaba el ATP de una neurona, su bomba Na⁺/K⁺…', [{ text: 'Se detiene y entra Na⁺', correct: true }, { text: 'Trabaja más rápido', note: 'Necesita ATP para funcionar.' }, { text: 'No cambia', note: 'Depende del ATP.' }], { concept: 'base.energia', explain: 'Sin ATP, sin bomba.', slide: 2 }),
            explain: [
              { id: 'm1b1', concept: 'fis.isquemia', title: 'Sin flujo no hay ATP', slide: 2, body: '**↓ flujo → ↓ ATP → falla de la Na⁺/K⁺-ATPasa** → entra Na⁺ y agua, la neurona se **despolariza** → se libera **glutamato** y falla su **recaptación** → el glutamato activa receptores **NMDA** → entra **Ca²⁺** → se activan **proteasas, lipasas, NO sintasa** y se forman **radicales libres** → muerte neuronal. Además hay acidosis (glucólisis anaeróbica → lactato).',
                deeper: 'Por eso se dice que el daño "se amplifica": la primera neurona que se despolariza libera glutamato que excita a sus vecinas, que a su vez se despolarizan. El Ca²⁺ es el ejecutor final.' }
            ],
            practice: [
              spot('m1-fx1', 'Un aprendiz explicó la excitotoxicidad. ¿Dónde se equivocó?', ['Sin ATP se despolariza la neurona', 'Se libera GABA en exceso', 'Entra Ca²⁺ y se activan enzimas dañinas'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'Se libera glutamato en exceso (y no se recapta)', correct: true }, { text: 'Se libera dopamina en exceso', note: 'El actor es el glutamato.' }] },
                { concept: 'fis.isquemia', slide: 2, stepNotes: { 0: 'Correcto.', 2: 'Correcto.' }, explain: 'Glutamato → NMDA → Ca²⁺.', hint: '¿Qué neurotransmisor excita?', misconception: 'excito-gaba' }),
              match('m1-p1', 'Une cada eslabón con su consecuencia:', [['Falta de ATP', 'Se detiene la Na⁺/K⁺-ATPasa'], ['Despolarización', 'Liberación de glutamato'], ['Activación de NMDA', 'Entrada de Ca²⁺'], ['Glucólisis anaeróbica', 'Acidosis láctica']],
                { concept: 'fis.isquemia', explain: 'La cadena.', slide: 2, hint: 'Cada eslabón causa el siguiente.' }),
              q('m1-p2', '¿Qué ion es el "ejecutor final" de la muerte neuronal en la excitotoxicidad?', [{ text: 'Ca²⁺', correct: true }, { text: 'K⁺', note: 'El K⁺ sale, pero no ejecuta.' }, { text: 'Cl⁻', note: 'No es el central.' }],
                { concept: 'fis.isquemia', explain: 'El Ca²⁺ activa proteasas y lipasas.', slide: 2, hint: 'Entra por el receptor NMDA.' })
            ],
            rule: { title: 'Regla del sabio: la cascada', concept: 'fis.isquemia', steps: ['Sin flujo → sin ATP → sin bombas', 'Despolarización → glutamato → NMDA → Ca²⁺', 'Ca²⁺ → enzimas y radicales → muerte'] } },
          { id: 'r2', intro: 'Parte 2: **núcleo, penumbra y tiempo**.',
            pretest: q('m1-pre2', 'Adivina antes: ¿qué zona de un infarto cerebral se beneficia de la trombolisis?', [{ text: 'La penumbra', correct: true }, { text: 'El núcleo', misconception: 'core-penumbra' }, { text: 'Ninguna', note: 'La penumbra sí.' }], { concept: 'fis.penumbra', explain: 'Solo lo vivo se puede salvar.', slide: 3 }),
            explain: [
              { id: 'm1b2', concept: 'fis.penumbra', title: 'Núcleo y penumbra', slide: 3, body: 'El **núcleo** (flujo muy bajo) muere por necrosis en minutos. La **penumbra** (flujo reducido) deja de funcionar pero **sigue viva** por horas: es el blanco del tratamiento. En el ACV **isquémico** se puede disolver el coágulo con **trombolisis (rtPA) dentro de 4,5 horas** o sacarlo con trombectomía. En el **hemorrágico** la trombolisis está **contraindicada**.',
                deeper: 'Si la penumbra no se reperfunde, la cascada isquémica la convierte en núcleo. La reperfusión tardía también tiene riesgo: radicales libres y sangrado.' }
            ],
            practice: [
              classify('m1-p3', '¿Núcleo o penumbra?', [['n', 'Núcleo'], ['p', 'Penumbra']],
                [['a', 'Necrosis irreversible', 'n'], ['b', 'No funciona pero sigue viva', 'p'], ['c', 'Blanco de la trombolisis', 'p'], ['d', 'Flujo casi nulo', 'n']],
                { concept: 'fis.penumbra', explain: 'Muerto frente a aturdido.', slide: 3, hint: '¿Se puede salvar?', misconception: 'core-penumbra' }),
              q('m1-p4', 'Un paciente llega con un ACV a las 2 horas de iniciado. Antes de trombolizar, ¿qué es imprescindible descartar?', [{ text: 'Una hemorragia (con un TAC)', correct: true }, { text: 'Una hipertensión leve', note: 'No es lo crítico.' }, { text: 'Que tenga penumbra en el EEG', note: 'Lo crítico es descartar sangrado.' }],
                { concept: 'fis.penumbra', explain: 'Trombolizar una hemorragia la agrava.', slide: 3, hint: 'La trombolisis disuelve coágulos.' }),
              order('m1-p5', 'Ordena lo que pasa con la penumbra si NO se trata:', [['a', 'Flujo reducido, neuronas aturdidas'], ['b', 'Sigue faltando ATP'], ['c', 'Avanza la cascada isquémica'], ['d', 'La penumbra pasa a ser núcleo']], ['a', 'b', 'c', 'd'],
                { concept: 'fis.penumbra', direction: 'En el tiempo.', explain: 'Tiempo es cerebro.', slide: 3, hint: 'Sin flujo, la cascada sigue.' })
            ],
            rule: { title: 'Regla del sabio: tiempo es cerebro', concept: 'fis.penumbra', steps: ['Núcleo: perdido; penumbra: salvable', 'ACV isquémico: reperfundir pronto (rtPA < 4,5 h)', 'Antes, descartar hemorragia'] } }
        ]
      },
      {
        id: 'm2', title: 'Una caja que no se estira', subtitle: 'Edema, Monro-Kellie, PIC y perfusión', minutes: 25, slides: '4–7', pep: 'P4: edema y PIC',
        stages: {
          hook: { title: 'El cráneo es una caja', sage: 'Imagina inflar un globo dentro de una caja de madera. Al principio hay espacio; después, cada poquito de aire aplasta todo lo demás. Eso le pasa al cerebro cuando se hincha.',
            text: 'En la PEP te pueden pedir distinguir los tipos de edema, explicar Monro-Kellie y **calcular la presión de perfusión cerebral**.' },
          diagnostic: [
            q('m2-d1', 'En un tumor cerebral con edema alrededor, el edema es principalmente…', [{ text: 'Vasogénico', correct: true }, { text: 'Citotóxico', misconception: 'edema-type' }, { text: 'No hay edema en tumores', note: 'Sí hay, y mucho.' }], { concept: 'fis.edema', explain: 'El tumor rompe la barrera hematoencefálica.', slide: 4 }),
            q('m2-d2', 'PAM 80 mmHg, PIC 25 mmHg. ¿PPC?', [{ text: '55 mmHg', correct: true }, { text: '105 mmHg', misconception: 'ppc-sign' }, { text: '3,2 mmHg', note: 'Es una resta.' }], { concept: 'fis.pic', explain: '80 − 25.', slide: 6 })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.presion', title: 'Desde cero: presión arterial media', slide: 6, body: 'La **presión arterial media** (PAM) es el promedio de presión durante un latido. Como el corazón pasa más tiempo en diástole, no es el promedio simple: **PAM ≈ PAD + (PAS − PAD)/3**.',
              deeper: 'Con 120/80: PAM = 80 + 40/3 = 93,3 mmHg. Con 150/90: 90 + 60/3 = 110 mmHg.' }
          ],
          explain: [],
          transfer: [
            num('m2-t1', 'Estilo PEP: un paciente con TEC tiene presión arterial 120/75 mmHg y PIC de 28 mmHg. Calcula su presión de perfusión cerebral.', 62, 'mmHg',
              { concept: 'fis.pic', label: 'PPC', slide: 6, tol: 0.02, traps: [{ value: 92, note: 'Usaste la sistólica: la PPC usa la PAM.', misconception: 'ppc-sign' }, { value: 118, note: 'Sumaste la PIC: se resta.', misconception: 'ppc-sign' }, { value: 69.5, note: 'Usaste el promedio simple para la PAM: PAM = PAD + (PAS − PAD)/3.' }],
                solution: ['PAM = 75 + (120 − 75)/3 = 90 mmHg', 'PPC = PAM − PIC = 90 − 28 = 62 mmHg'], explain: 'PPC = 62 mmHg (al límite de la meta ≥ 60).' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿por qué un edema cerebral puede producir isquemia aunque las arterias estén sanas?', 'Porque el cráneo es rígido: al aumentar el volumen del cerebro, una vez agotada la compensación (salida de LCR y sangre venosa), la presión intracraneal sube. Como la presión de perfusión cerebral es PAM menos PIC, si la PIC sube la sangre llega con menos fuerza y el cerebro queda isquémico, lo que produce más edema: un círculo vicioso.',
              ['Cráneo rígido (Monro-Kellie): sube la PIC', 'PPC = PAM − PIC: baja la perfusión', 'La isquemia produce más edema (círculo vicioso)'],
              { concept: 'fis.pic', explain: 'Edema → PIC → isquemia → edema.', slide: 5, teach: true, keywords: [{ label: 'rígido / Monro-Kellie', any: ['rígid', 'rigid', 'monro', 'caja'] }, { label: 'PPC = PAM − PIC', any: ['ppc', 'perfusi'] }, { label: 'círculo vicioso', any: ['vicioso', 'más edema', 'mas edema'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **edema y Monro-Kellie**.',
            pretest: q('m2-pre1', 'Adivina antes: en las primeras horas de un infarto cerebral, el edema es…', [{ text: 'Citotóxico (las células se hinchan)', correct: true }, { text: 'Vasogénico', misconception: 'edema-type' }, { text: 'No hay edema', note: 'Aparece temprano.' }], { concept: 'fis.edema', explain: 'Fallan las bombas.', slide: 4 }),
            explain: [
              { id: 'm2b1', concept: 'fis.edema', title: 'Edema y Monro-Kellie', slide: 4, body: '**Edema citotóxico**: fallan las bombas (falta de ATP) → la **célula** se hincha; la barrera hematoencefálica está **intacta**; típico de la isquemia temprana y la hiponatremia. **Edema vasogénico**: se rompe la **BHE** → sale plasma rico en proteínas al espacio **extracelular**, sobre todo en sustancia blanca; típico de **tumores**, abscesos y trauma; en tumores responde a **corticoides** (dexametasona). **Monro-Kellie**: cerebro + sangre + LCR = volumen **constante**; si uno crece, los otros deben salir. Cuando ya no pueden, la PIC sube **bruscamente**.',
                deeper: 'La curva presión-volumen intracraneal es plana al principio (compensación) y luego se dispara: un poco más de volumen produce un gran aumento de PIC. Por eso un paciente puede verse estable y empeorar de golpe. Con el tiempo, un infarto también desarrolla edema vasogénico (la BHE se daña).' }
            ],
            practice: [
              classify('m2-p1', '¿Citotóxico o vasogénico?', [['c', 'Citotóxico'], ['v', 'Vasogénico']],
                [['a', 'Barrera hematoencefálica rota', 'v'], ['b', 'Falla de la Na⁺/K⁺-ATPasa', 'c'], ['c', 'Alrededor de un tumor', 'v'], ['d', 'Primeras horas de una isquemia', 'c'], ['e', 'Responde a dexametasona', 'v']],
                { concept: 'fis.edema', explain: '¿Dentro de la célula o fuera?', slide: 4, hint: '¿Se rompió la barrera?', misconception: 'edema-type' }),
              order('m2-p2', 'Ordena lo que pasa al crecer un tumor dentro del cráneo:', [['a', 'Sale LCR hacia el canal raquídeo'], ['b', 'Sale sangre venosa'], ['c', 'Se agota la compensación'], ['d', 'La PIC sube bruscamente']], ['a', 'b', 'c', 'd'],
                { concept: 'fis.pic', direction: 'En el tiempo.', explain: 'Monro-Kellie.', slide: 5, hint: 'Primero se compensa.' }),
              q('m2-p3', '¿Por qué un paciente con un tumor cerebral puede estar estable semanas y empeorar en horas?', [{ text: 'Se agota la compensación y la PIC sube de golpe', correct: true }, { text: 'El tumor crece de golpe', note: 'El tumor crece lento; lo que cambia es la compensación.' }, { text: 'Se le acaba el LCR', note: 'El LCR se desplaza, no "se acaba".' }],
                { concept: 'fis.pic', explain: 'Curva presión-volumen.', slide: 5, hint: 'Piensa en la curva presión-volumen.' })
            ],
            rule: { title: 'Regla del sabio: edema', concept: 'fis.edema', steps: ['Citotóxico: célula hinchada, BHE intacta (isquemia temprana)', 'Vasogénico: BHE rota (tumor, trauma), responde a corticoides en tumores', 'Monro-Kellie: compensación limitada'] } },
          { id: 'r2', intro: 'Parte 2: **presión intracraneal y perfusión**.',
            pretest: q('m2-pre2', 'Adivina antes: si la PIC sube y la presión arterial no cambia, el flujo al cerebro…', [{ text: 'Baja', correct: true }, { text: 'Sube', misconception: 'ppc-sign' }, { text: 'No cambia', note: 'La PIC se opone a la entrada de sangre.' }], { concept: 'fis.pic', explain: 'PPC = PAM − PIC.', slide: 6 }),
            explain: [
              { id: 'm2b2', concept: 'fis.pic', title: 'Presión intracraneal y perfusión', slide: 6, body: '**PIC** normal: 5–15 mmHg; **> 20 mmHg** = hipertensión intracraneal. **PPC = PAM − PIC** (meta ≥ 60 mmHg). Signos: **cefalea** (peor en la mañana), **vómitos**, **papiledema**, compromiso de conciencia. Signo tardío: **tríada de Cushing** — **hipertensión**, **bradicardia** y **respiración irregular** — que anuncia **herniación**.',
                deeper: '¿Por qué la hipertensión de Cushing? El cerebro isquémico activa el simpático para subir la PAM y mantener la PPC. La bradicardia es el reflejo de los barorreceptores ante esa hipertensión. Bajar bruscamente la presión arterial a ese paciente puede empeorar la isquemia.' }
            ],
            practice: [
              num('m2-p4', 'PA 140/80 mmHg y PIC 35 mmHg. Calcula la PPC.', 65, 'mmHg',
                { concept: 'fis.pic', label: 'PPC', slide: 6, hint: 'PAM = 80 + (140 − 80)/3; luego resta la PIC.', traps: [{ value: 105, note: 'Usaste la sistólica.', misconception: 'ppc-sign' }, { value: 135, note: 'Se resta la PIC.', misconception: 'ppc-sign' }], solution: ['PAM = 80 + 60/3 = 100 mmHg', 'PPC = 100 − 35 = 65 mmHg'], explain: '65 mmHg.' }),
              q('m2-p5', 'Paciente con TEC: PA 190/100, FC 48 y respiración irregular. ¿Qué indica?', [{ text: 'Tríada de Cushing: hipertensión intracraneal grave con riesgo de herniación', correct: true }, { text: 'Crisis hipertensiva aislada: hay que bajar la presión rápido', note: 'Bajarla puede empeorar la perfusión cerebral.', misconception: 'cushing' }, { text: 'Shock', note: 'En el shock la presión cae.' }],
                { concept: 'fis.pic', explain: 'HTA + bradicardia + respiración irregular.', slide: 7, hint: 'Tres signos juntos con un TEC.', misconception: 'cushing' }),
              match('m2-p6', 'Une cada valor con su significado:', [['PIC 10 mmHg', 'Normal'], ['PIC 25 mmHg', 'Hipertensión intracraneal'], ['PPC 45 mmHg', 'Perfusión insuficiente (riesgo de isquemia)'], ['PPC 70 mmHg', 'Perfusión adecuada']],
                { concept: 'fis.pic', explain: 'PIC normal 5–15; PPC meta ≥ 60.', slide: 6, hint: 'Recuerda los umbrales 20 y 60.' })
            ],
            rule: { title: 'Regla del sabio: PIC y perfusión', concept: 'fis.pic', steps: ['PAM = PAD + (PAS − PAD)/3', 'PPC = PAM − PIC (meta ≥ 60)', 'HTA + bradicardia + respiración irregular → Cushing (tardío)'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.energia', title: 'ATP y gradientes', subtitle: 'La bomba Na⁺/K⁺', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.energia', title: 'La bomba Na⁺/K⁺-ATPasa', slide: 1, body: 'Saca **3 Na⁺** y mete **2 K⁺** por cada **ATP**. Mantiene el potencial de reposo y el volumen celular. Sin ATP, entra Na⁺, lo sigue el agua y la célula se hincha y despolariza.',
            deeper: 'Esa misma falla explica el edema citotóxico: el agua sigue al Na⁺ hacia adentro.' }],
          practice: [
            q('z1-p1', 'La Na⁺/K⁺-ATPasa saca…', [{ text: '3 Na⁺ y mete 2 K⁺', correct: true }, { text: '2 Na⁺ y mete 3 K⁺', note: 'Al revés.' }, { text: 'Ca²⁺', note: 'Esa es otra bomba.' }], { concept: 'base.energia', explain: '3 por 2.', slide: 1, hint: 'Más Na⁺ que K⁺.' }),
            order('z1-p2', 'Ordena qué pasa cuando falta ATP:', [['a', 'Se detiene la bomba'], ['b', 'Entra Na⁺'], ['c', 'Lo sigue el agua'], ['d', 'La célula se hincha']], ['a', 'b', 'c', 'd'], { concept: 'base.energia', direction: 'En el tiempo.', explain: 'Edema citotóxico.', slide: 1, hint: 'El agua sigue al Na⁺.' })
          ],
          transfer: [write('z1-w1', 'Explica por qué una célula sin ATP se hincha.', 'Sin ATP la bomba Na⁺/K⁺ se detiene, el Na⁺ entra a la célula siguiendo su gradiente y el agua lo sigue por osmosis, así que la célula aumenta de volumen.',
            ['La bomba Na⁺/K⁺ necesita ATP', 'Entra Na⁺', 'El agua lo sigue por osmosis'],
            { concept: 'base.energia', explain: 'Edema celular.', slide: 1, keywords: [{ label: 'bomba', any: ['bomba', 'atpasa'] }, { label: 'agua / osmosis', any: ['agua', 'osmo'] }] })]
        } },
      { id: 'z2', concept: 'base.presion', title: 'Presión arterial media', subtitle: 'PAM = PAD + (PAS − PAD)/3', minutes: 5,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.presion', title: 'PAM', slide: 6, body: '**PAM ≈ PAD + (PAS − PAD)/3.** No es el promedio simple porque la diástole dura más que la sístole.',
            deeper: '120/80 → 93,3 mmHg. 90/60 → 70 mmHg.' }],
          practice: [
            num('z2-p1', 'PA 120/80 mmHg. Calcula la PAM.', 93.3, 'mmHg', { concept: 'base.presion', label: 'PAM', slide: 6, tol: 0.01, hint: 'PAD + (PAS − PAD)/3.', traps: [{ value: 100, note: 'Ese es el promedio simple.' }], solution: ['PAM = 80 + 40/3 = 93,3 mmHg'], explain: '93,3 mmHg.' }),
            q('z2-p2', '¿Por qué la PAM está más cerca de la diastólica?', [{ text: 'El corazón pasa más tiempo en diástole', correct: true }, { text: 'La diastólica es más importante', note: 'Es por el tiempo.' }, { text: 'Por error de medición', note: 'No.' }], { concept: 'base.presion', explain: 'Diástole ≈ 2/3 del ciclo.', slide: 6, hint: 'Piensa en el tiempo de cada fase.' })
          ],
          transfer: [write('z2-w1', 'Explica qué es la presión arterial media.', 'Es la presión promedio en las arterias durante todo el ciclo cardíaco; se estima como la diastólica más un tercio de la diferencia entre sistólica y diastólica, porque la diástole dura más.',
            ['Promedio de presión en el ciclo', 'PAD + (PAS − PAD)/3', 'La diástole dura más'],
            { concept: 'base.presion', explain: 'PAM.', slide: 6, keywords: [{ label: 'promedio', any: ['promedio', 'media'] }, { label: 'diástole', any: ['diást', 'diast'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-ppc', title: 'Presión de perfusión cerebral', formula: 'PAM = PAD + (PAS − PAD)/3 · PPC = PAM − PIC', concepts: ['fis.pic'], vars: [['PAS', 'presión sistólica', 'mmHg'], ['PAD', 'presión diastólica', 'mmHg'], ['PIC', 'presión intracraneal', 'mmHg']],
        what: 'Con cuánta presión llega la sangre al cerebro.', when: 'TEC, ACV, tumores, cualquier ↑ PIC.', example: '120/75 y PIC 28 → PAM 90 → PPC 62 mmHg.', deeper: 'Meta ≥ 60 mmHg; PIC normal 5–15.',
        sources: [{ label: 'Silbernagl y Lang, presión intracraneal', slide: 6 }],
        calc: { inputs: [{ id: 'pas', label: 'PAS (mmHg)', value: 120, step: 1 }, { id: 'pad', label: 'PAD (mmHg)', value: 75, step: 1 }, { id: 'pic', label: 'PIC (mmHg)', value: 28, step: 1 }], run: v => { const pam = v.pad + (v.pas - v.pad) / 3, ppc = pam - v.pic; return 'PAM = **' + pam.toFixed(1).replace('.', ',') + '** · PPC = **' + ppc.toFixed(1).replace('.', ',') + ' mmHg**' + (ppc < 60 ? ' (bajo la meta)' : ''); } } }
    ],
    recipes: [],
    mini: {
      'base.energia': { idea: 'Sin ATP, sin bomba: entra Na⁺ y agua.', steps: ['3 Na⁺ afuera, 2 K⁺ adentro', 'Gasta ATP', 'Sin ATP: célula hinchada'], check: { prompt: 'Sin ATP la célula…', options: [{ text: 'Se hincha', correct: true }, { text: 'Se encoge', note: 'Entra agua.' }], explain: 'Se hincha.' } },
      'base.presion': { idea: 'PAM = PAD + un tercio del pulso.', steps: ['Pulso = PAS − PAD', 'PAM = PAD + pulso/3', 'Más cerca de la diastólica'], check: { prompt: '90/60 → PAM =', options: [{ text: '70', correct: true }, { text: '75', note: 'Ese es el promedio simple.' }], explain: '60 + 10.' } },
      'fis.isquemia': { idea: 'Sin energía, el glutamato mata.', steps: ['↓ ATP → despolarización', 'Glutamato → NMDA', 'Ca²⁺ → enzimas → muerte'], check: { prompt: 'Ejecutor final:', options: [{ text: 'Ca²⁺', correct: true }, { text: 'GABA', note: 'Es inhibidor.' }], explain: 'Ca²⁺.' } },
      'fis.penumbra': { idea: 'Lo aturdido aún se salva.', steps: ['Núcleo: muerto', 'Penumbra: viva', 'Reperfundir a tiempo'], check: { prompt: 'Blanco de la trombolisis:', options: [{ text: 'Penumbra', correct: true }, { text: 'Núcleo', note: 'Ya está muerto.' }], explain: 'Penumbra.' } },
      'fis.edema': { idea: 'Adentro (citotóxico) o afuera (vasogénico).', steps: ['Citotóxico: bombas', 'Vasogénico: BHE rota', 'Tumor → vasogénico'], check: { prompt: 'Isquemia temprana:', options: [{ text: 'Citotóxico', correct: true }, { text: 'Vasogénico', note: 'Eso viene después.' }], explain: 'Citotóxico.' } },
      'fis.pic': { idea: 'Caja rígida: más volumen = más presión = menos flujo.', steps: ['Monro-Kellie', 'PPC = PAM − PIC', 'Cushing: tardío'], check: { prompt: 'PAM 100, PIC 30 → PPC', options: [{ text: '70', correct: true }, { text: '130', note: 'Se resta.' }], explain: '70.' } }
    },
    deep: {},
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', 'Sin ATP, la bomba Na⁺/K⁺…', [{ text: 'Se detiene', correct: true }, { text: 'Acelera', note: 'Necesita ATP.' }, { text: 'Saca más Na⁺', note: 'No puede.' }], { concept: 'base.energia', explain: 'Se detiene.', slide: 1 }) },
      { level: 1, item: q('dx-2', 'PA 120/60 → PAM =', [{ text: '80', correct: true }, { text: '90', note: 'Promedio simple.' }, { text: '60', note: 'Esa es la diastólica.' }], { concept: 'base.presion', explain: '60 + 20.', slide: 6 }) },
      { level: 2, item: q('dx-3', 'Excitotoxicidad: exceso de…', [{ text: 'Glutamato', correct: true }, { text: 'GABA', misconception: 'excito-gaba' }, { text: 'Glicina sola', note: 'No.' }], { concept: 'fis.isquemia', explain: 'Glutamato.', slide: 2 }) },
      { level: 2, item: q('dx-4', 'Zona salvable de un infarto:', [{ text: 'Penumbra', correct: true }, { text: 'Núcleo', misconception: 'core-penumbra' }, { text: 'Ventrículo', note: 'No.' }], { concept: 'fis.penumbra', explain: 'Penumbra.', slide: 3 }) },
      { level: 2, item: q('dx-5', 'Edema alrededor de un absceso:', [{ text: 'Vasogénico', correct: true }, { text: 'Citotóxico', misconception: 'edema-type' }, { text: 'Ninguno', note: 'Sí hay.' }], { concept: 'fis.edema', explain: 'BHE rota.', slide: 4 }) },
      { level: 3, item: q('dx-6', 'PAM 85, PIC 30 → PPC', [{ text: '55 (insuficiente)', correct: true }, { text: '115', misconception: 'ppc-sign' }, { text: '85', note: 'Falta restar la PIC.' }], { concept: 'fis.pic', explain: '85 − 30.', slide: 6 }) },
      { level: 3, item: q('dx-7', 'HTA + bradicardia + respiración irregular en un TEC →', [{ text: 'Tríada de Cushing', correct: true }, { text: 'Síndrome de Horner', note: 'Eso es ptosis y miosis.' }, { text: 'Shock', misconception: 'cushing' }], { concept: 'fis.pic', explain: 'Herniación inminente.', slide: 7 }) }
    ] }
  };
})();
