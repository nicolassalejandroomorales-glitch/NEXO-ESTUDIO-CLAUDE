/* Fisiopatología · PEP 1 · Motricidad y sistema nervioso vegetativo (jueves 12 de noviembre).
   Las clases de nervioso (Dr. Cárdenas, 1, 2 y 8 de octubre) aún no están en el Drive: el contenido sale de la bibliografía básica del programa
   (Silbernagl y Lang, Fisiopatología, 2011, cap. "Sistema neuromuscular y sensitivo" y "Sistema nervioso vegetativo"). Las "láminas" son secciones propias. */
(() => {
  'use strict';
  const SRC = 'silbernagl';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  const spot = (id, prompt, steps, wrong, fix, extra = {}) => ({ id, type: 'spot', prompt, steps, wrong, fix, source: SRC, ...extra });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['fis-01'] = {
    id: 'fis-01',
    subject: 'fisio',
    title: 'Motricidad y sistema nervioso vegetativo',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Fisiopatología (cap. sistema neuromuscular y sistema nervioso vegetativo)', author: 'Silbernagl y Lang', detail: 'Bibliografía básica del programa 2026-2 (clases del Dr. Cárdenas aún no están en el Drive)', authority: 'Libro de texto' },
      programa: { title: 'Programa de Fisiopatología 66217', author: 'Orihuela y Cárdenas', detail: 'USACH, 2S 2026', authority: 'Material oficial del curso' }
    },
    misconceptions: {
      'umn-lmn': { label: 'Confundiste motoneurona superior con inferior', why: '**Motoneurona superior** (corteza → vía piramidal): parálisis **espástica**, **hiperreflexia**, Babinski, poca atrofia. **Motoneurona inferior** (asta anterior, nervio): parálisis **fláccida**, **hipo/arreflexia**, **atrofia** y **fasciculaciones**.',
        prereq: { title: 'Dónde está la lesión', mission: 'm1', block: 'm1b1' }, base: 'base.via',
        check: q('fix-umn', 'Caso corto: brazo débil, flácido, con atrofia y fasciculaciones. La lesión es de…', [{ text: 'Motoneurona inferior', correct: true }, { text: 'Motoneurona superior', note: 'Esa da espasticidad e hiperreflexia.' }, { text: 'Cerebelo', note: 'El cerebelo no paraliza.' }], { concept: 'fis.motoneurona', explain: 'Flacidez + atrofia + fasciculaciones = MNI.', slide: 2 }) },
      'parkinson-dopa': { label: 'Equivocaste el mecanismo del Parkinson', why: 'En el Parkinson mueren las neuronas **dopaminérgicas de la sustancia negra**: falta **dopamina** en el estriado y predomina la vía que **frena** el movimiento → **hipocinesia**, rigidez y temblor de **reposo**. No es exceso de dopamina ni lesión del cerebelo.',
        prereq: { title: 'Ganglios basales y cerebelo', mission: 'm1', block: 'm1b2' }, base: 'base.via' },
      'cerebellum-paralysis': { label: 'Creíste que el cerebelo paraliza', why: 'El cerebelo **coordina**: su daño da **ataxia**, dismetría, temblor de **intención** y adiadococinesia, pero **no** parálisis ni pérdida de fuerza.',
        prereq: { title: 'Ganglios basales y cerebelo', mission: 'm1', block: 'm1b2' }, base: 'base.via' },
      'symp-para': { label: 'Invertiste simpático y parasimpático', why: '**Simpático** (lucha o huida, noradrenalina): midriasis, taquicardia, broncodilatación, menos motilidad intestinal. **Parasimpático** (descanso, acetilcolina muscarínica): miosis, bradicardia, broncoconstricción, más secreción y motilidad.',
        prereq: { title: 'Simpático y parasimpático', mission: 'm2', block: 'm2b1' }, base: 'base.sna' },
      'cholinergic': { label: 'Confundiste síndrome colinérgico con anticolinérgico', why: '**Colinérgico** (exceso de ACh, ej. organofosforados que inhiben la acetilcolinesterasa): **todo moja** (salivación, lagrimeo, diarrea, broncorrea), miosis y bradicardia → antídoto **atropina**. **Anticolinérgico** (atropina, antihistamínicos): **seco, rojo y caliente**, midriasis, taquicardia, retención urinaria.',
        prereq: { title: 'Fármacos y tóxicos del SNA', mission: 'm2', block: 'm2b2' }, base: 'base.sna' },
      'mg-mechanism': { label: 'Equivocaste el mecanismo de la miastenia gravis', why: 'En la miastenia hay **autoanticuerpos contra el receptor nicotínico de ACh** de la placa motora: la señal llega débil y la fuerza **se agota con el uso** (fatigabilidad). Mejora con **inhibidores de la acetilcolinesterasa** (piridostigmina), que dejan más ACh en la placa.',
        prereq: { title: 'Dónde está la lesión', mission: 'm1', block: 'm1b1' }, base: 'base.via' }
    },
    goal: {
      total: 100, text: 'Asegurar los 25 puntos de motricidad y vegetativo de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P1', label: 'Localizar la lesión motora (MNS, MNI, placa, ganglios basales, cerebelo)', points: 15, missions: ['m1'] },
        { id: 'P2', label: 'Sistema nervioso vegetativo y sus síndromes', points: 10, missions: ['m2'] }
      ],
      rest: [{ label: 'Lesión cerebral aguda', points: 15, note: 'clase fis-02' }, { label: 'Respiratorio', points: 30, note: 'clase fis-06' }, { label: 'Digestivo', points: 30, note: 'clase fis-09' }]
    },
    glossary: [
      { term: 'Motoneurona superior', mission: 'm1', def: 'Neurona de la corteza motora cuyo axón baja por la vía piramidal hasta la médula o el tronco.', simple: 'El "jefe" que da la orden desde el cerebro.', simpler: 'El que manda el mensaje.' },
      { term: 'Motoneurona inferior', mission: 'm1', def: 'Neurona del asta anterior de la médula (o núcleo motor del tronco) que inerva directamente el músculo.', simple: 'El cable final que llega al músculo.', simpler: 'El cartero que entrega el mensaje.' },
      { term: 'Espasticidad', mission: 'm1', def: 'Aumento del tono muscular dependiente de la velocidad del estiramiento, típico de lesión de motoneurona superior.', simple: 'Músculo tieso que se resiste al moverlo rápido.', simpler: 'Un resorte apretado.' },
      { term: 'Ataxia', mission: 'm1', def: 'Falta de coordinación del movimiento sin pérdida de fuerza, típica de lesión cerebelosa.', simple: 'Moverse descoordinado aunque haya fuerza.', simpler: 'Caminar como en un barco.' },
      { term: 'Síndrome colinérgico', mission: 'm2', def: 'Exceso de estimulación por acetilcolina (muscarínica y nicotínica), por ejemplo por inhibidores de la acetilcolinesterasa.', simple: 'Demasiada acetilcolina: todo moja y se enlentece.', simpler: 'Una llave del agua que no se cierra.' },
      { term: 'Síndrome de Horner', mission: 'm2', def: 'Interrupción de la vía simpática a la cara: ptosis, miosis y anhidrosis del mismo lado.', simple: 'Párpado caído, pupila chica y sin sudor en un lado.', simpler: 'Media cara "apagada".' }
    ],
    concepts: [
      { id: 'base.via', title: 'La vía motora: de la corteza al músculo', root: true },
      { id: 'base.sna', title: 'Neurotransmisores del SNA', root: true },
      { id: 'fis.motoneurona', mission: 'm1', title: 'Motoneurona superior frente a inferior', needs: ['base.via'] },
      { id: 'fis.placa', mission: 'm1', title: 'Placa motora: miastenia gravis', needs: ['base.via'] },
      { id: 'fis.ganglios', mission: 'm1', title: 'Ganglios basales y cerebelo', needs: ['fis.motoneurona'] },
      { id: 'fis.sna', mission: 'm2', title: 'Simpático y parasimpático', needs: ['base.sna'] },
      { id: 'fis.toxicos', mission: 'm2', title: 'Síndromes colinérgico, anticolinérgico y Horner', needs: ['fis.sna'] }
    ],
    curiosities: [
      { text: 'El signo de Babinski (el dedo gordo sube al rascar la planta) es normal en guaguas: la vía piramidal aún no termina de mielinizarse.', slide: 2 },
      { text: 'Cuando aparecen los síntomas del Parkinson ya se ha perdido cerca del 60–80 % de las neuronas dopaminérgicas de la sustancia negra.', slide: 3 },
      { text: 'La atropina viene de la belladona: en el Renacimiento se usaba en gotas para dilatar las pupilas y verse "más bella".', slide: 6 }
    ],
    slideImages: {},
    slides: {
      1: { title: 'La vía motora', bullets: ['Corteza → vía piramidal (MNS) → asta anterior (MNI) → nervio → placa → músculo', 'Moduladores: ganglios basales y cerebelo'] },
      2: { title: 'Motoneurona superior e inferior', bullets: ['MNS: espástica, hiperreflexia, Babinski', 'MNI: fláccida, arreflexia, atrofia, fasciculaciones', 'ELA: ambas'] },
      3: { title: 'Ganglios basales', bullets: ['Parkinson: ↓ dopamina (sustancia negra) → hipocinesia, rigidez, temblor de reposo', 'Huntington: pérdida estriatal → corea (hipercinesia)'] },
      4: { title: 'Cerebelo', bullets: ['Ataxia, dismetría, temblor de intención, adiadococinesia', 'Sin parálisis'] },
      5: { title: 'Placa motora', bullets: ['Miastenia gravis: anticuerpos contra el receptor nicotínico', 'Debilidad fatigable (ptosis, diplopía)', 'Mejora con inhibidores de la acetilcolinesterasa'] },
      6: { title: 'Sistema nervioso vegetativo', bullets: ['Simpático: NA (α, β) · Parasimpático: ACh (muscarínico)', 'Ganglios: ACh nicotínica en ambos'] },
      7: { title: 'Síndromes vegetativos', bullets: ['Colinérgico (organofosforados) → atropina', 'Anticolinérgico: seco, rojo, caliente', 'Horner: ptosis, miosis, anhidrosis'] }
    },
    missions: [
      {
        id: 'm1', title: 'Dónde está la lesión', subtitle: 'Motoneuronas, placa, ganglios basales y cerebelo', minutes: 25, slides: '1–5', pep: 'P1: localizar la lesión motora',
        stages: {
          hook: { title: 'Tres pacientes que no pueden caminar bien', sage: 'Uno arrastra una pierna tiesa. Otro tiene la pierna blanda y delgada. El tercero tiene toda su fuerza… pero se tambalea como en un barco. Los tres "no caminan bien", pero cada uno tiene la lesión en un lugar distinto.',
            text: 'En Fisiopatología no basta el nombre de la enfermedad: hay que **localizar** el daño a partir de los signos. Esa es la pregunta típica de PEP con caso clínico.' },
          diagnostic: [
            q('m1-d1', 'Hiperreflexia, espasticidad y Babinski positivo sugieren lesión de…', [{ text: 'Motoneurona superior', correct: true }, { text: 'Motoneurona inferior', misconception: 'umn-lmn' }, { text: 'Músculo', note: 'El músculo no da hiperreflexia.' }], { concept: 'fis.motoneurona', explain: 'Se pierde el freno de la corteza sobre los reflejos.', slide: 2 }),
            q('m1-d2', 'En el Parkinson falta…', [{ text: 'Dopamina en el estriado', correct: true }, { text: 'Acetilcolina en la placa motora', note: 'Eso se parece más a la miastenia.' }, { text: 'GABA en el cerebelo', misconception: 'parkinson-dopa' }], { concept: 'fis.ganglios', explain: 'Mueren las neuronas de la sustancia negra.', slide: 3 })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.via', title: 'Desde cero: la vía motora', slide: 1, body: 'La orden sale de la **corteza motora** (motoneurona superior), baja por la **vía piramidal** y hace sinapsis en el **asta anterior** de la médula con la **motoneurona inferior**, que sale por el nervio hasta la **placa motora** (acetilcolina sobre receptores **nicotínicos**) y contrae el músculo. Los **ganglios basales** (cuánto moverse) y el **cerebelo** (qué tan coordinado) **modulan** sin mandar directamente.',
              deeper: 'Truco para localizar: ¿hay **debilidad**? Entonces es la vía (MNS, MNI, placa o músculo). ¿Hay fuerza pero el movimiento es pobre, involuntario o descoordinado? Entonces son los moduladores (ganglios basales o cerebelo).' }
          ],
          explain: [],
          transfer: [
            q('m1-t1', 'Estilo PEP: hombre de 58 años con debilidad progresiva de manos, atrofia y fasciculaciones, y además hiperreflexia y Babinski en las piernas. Sensibilidad normal. ¿Diagnóstico más probable?', [{ text: 'Esclerosis lateral amiotrófica (MNS + MNI)', correct: true }, { text: 'Parkinson', note: 'No da atrofia ni Babinski.', misconception: 'parkinson-dopa' }, { text: 'Lesión cerebelosa', note: 'No da debilidad.', misconception: 'cerebellum-paralysis' }, { text: 'Miastenia gravis', note: 'No da atrofia, fasciculaciones ni Babinski.' }],
              { concept: 'fis.motoneurona', explain: 'Signos de motoneurona superior e inferior a la vez, sin alteración sensitiva: ELA.', slide: 2 }),
            write('m1-w1', 'Enséñale a tu compañero: ¿cómo distingues una lesión de motoneurona superior de una de motoneurona inferior?', 'En la lesión de motoneurona superior se pierde el control de la corteza sobre los reflejos medulares: hay parálisis espástica, hiperreflexia y Babinski, con poca atrofia. En la de motoneurona inferior el músculo pierde su inervación directa: parálisis fláccida, reflejos disminuidos o ausentes, atrofia y fasciculaciones.',
              ['MNS: espasticidad, hiperreflexia, Babinski', 'MNI: flacidez, hipo/arreflexia, atrofia, fasciculaciones', 'Explica el porqué: se pierde el freno cortical o la inervación del músculo'],
              { concept: 'fis.motoneurona', explain: 'Tono, reflejos y trofismo.', slide: 2, teach: true, keywords: [{ label: 'espástica / hiperreflexia', any: ['espást', 'espast', 'hiperrefl'] }, { label: 'fláccida / atrofia', any: ['flác', 'flac', 'atrof'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **motoneuronas y placa motora**.',
            pretest: q('m1-pre1', 'Adivina antes: si se corta el nervio de un músculo, ese músculo con el tiempo…', [{ text: 'Se atrofia', correct: true }, { text: 'Se pone espástico', misconception: 'umn-lmn' }, { text: 'Queda igual', note: 'Sin inervación, el músculo pierde masa.' }], { concept: 'fis.motoneurona', explain: 'Denervación → atrofia.', slide: 2 }),
            explain: [
              { id: 'm1b1', concept: 'fis.motoneurona', title: 'Dónde está la lesión', slide: 2, body: '**Motoneurona superior** (ACV, esclerosis múltiple, trauma medular): paresia **espástica**, **hiperreflexia**, **Babinski**, clonus, poca atrofia. **Motoneurona inferior** (poliomielitis, compresión de raíz, neuropatía): parálisis **fláccida**, **hipo/arreflexia**, **atrofia** y **fasciculaciones**. **ELA**: ambas a la vez, sin alteración sensitiva. **Placa motora** — **miastenia gravis**: anticuerpos contra el **receptor nicotínico** → debilidad **fatigable** (ptosis y visión doble que empeoran en la tarde); mejora con **inhibidores de la acetilcolinesterasa**.',
                deeper: '¿Por qué hiperreflexia en la MNS? Porque la corteza normalmente **frena** los reflejos medulares; sin ese freno, el reflejo se exagera. ¿Por qué atrofia en la MNI? Porque el músculo depende de su nervio (actividad y factores tróficos).' }
            ],
            practice: [
              classify('m1-p1', '¿Motoneurona superior o inferior?', [['s', 'Motoneurona superior'], ['i', 'Motoneurona inferior']],
                [['a', 'Babinski positivo', 's'], ['b', 'Fasciculaciones', 'i'], ['c', 'Espasticidad', 's'], ['d', 'Atrofia marcada', 'i'], ['e', 'Hiperreflexia con clonus', 's'], ['f', 'Arreflexia', 'i']],
                { concept: 'fis.motoneurona', explain: 'Tono, reflejos y trofismo.', slide: 2, hint: '¿Se perdió el freno (MNS) o el cable (MNI)?', misconception: 'umn-lmn' }),
              q('m1-p2', 'Mujer de 30 años con párpados caídos y visión doble que empeoran al final del día y mejoran con reposo. ¿Mecanismo?', [{ text: 'Anticuerpos contra el receptor nicotínico de ACh', correct: true }, { text: 'Pérdida de neuronas dopaminérgicas', misconception: 'parkinson-dopa' }, { text: 'Lesión de la vía piramidal', misconception: 'umn-lmn' }],
                { concept: 'fis.placa', explain: 'Debilidad fatigable: miastenia gravis.', slide: 5, hint: '¿Qué empeora con el uso?', misconception: 'mg-mechanism' }),
              order('m1-p3', 'Ordena la vía motora:', [['a', 'Corteza motora (motoneurona superior)'], ['b', 'Vía piramidal'], ['c', 'Asta anterior (motoneurona inferior)'], ['d', 'Placa motora (ACh, nicotínico)'], ['e', 'Fibra muscular']], ['a', 'b', 'c', 'd', 'e'],
                { concept: 'base.via', direction: 'Del cerebro al músculo.', explain: 'La vía de la orden.', slide: 1, hint: 'La placa es el último relevo.' })
            ],
            rule: { title: 'Regla del sabio: localizar la debilidad', concept: 'fis.motoneurona', steps: ['Espástica + hiperreflexia + Babinski → MNS', 'Fláccida + atrofia + fasciculaciones → MNI', 'Fatigable, sin atrofia → placa (miastenia)'] } },
          { id: 'r2', intro: 'Parte 2: **ganglios basales y cerebelo**.',
            pretest: q('m1-pre2', 'Adivina antes: alguien con daño del cerebelo…', [{ text: 'Tiene fuerza pero se mueve descoordinado', correct: true }, { text: 'Queda paralizado', misconception: 'cerebellum-paralysis' }, { text: 'Pierde la sensibilidad', note: 'El cerebelo no es sensitivo.' }], { concept: 'fis.ganglios', explain: 'Ataxia sin parálisis.', slide: 4 }),
            explain: [
              { id: 'm1b2', concept: 'fis.ganglios', title: 'Ganglios basales y cerebelo', slide: 3, body: '**Ganglios basales** = "cuánto" moverse. **Parkinson**: mueren las neuronas **dopaminérgicas de la sustancia negra** → falta dopamina en el estriado → predomina el freno → **hipocinesia/bradicinesia**, **rigidez** en rueda dentada y **temblor de reposo**. Se trata con **L-DOPA** (precursor que sí cruza la barrera hematoencefálica). **Huntington**: pérdida de neuronas del estriado → **corea** (movimientos de más). **Cerebelo** = "qué tan coordinado": **ataxia**, **dismetría**, temblor de **intención** (al acercarse al objetivo), **adiadococinesia**; sin parálisis.',
                deeper: 'Diferencia de temblores: el del Parkinson aparece en **reposo** y disminuye al moverse; el cerebeloso aparece **al moverse** hacia un objetivo (prueba dedo-nariz). La dopamina no se da directo porque no cruza la barrera hematoencefálica.' }
            ],
            practice: [
              match('m1-p4', 'Une cada signo con su lugar de lesión:', [['Temblor de reposo y bradicinesia', 'Ganglios basales (Parkinson)'], ['Temblor de intención y dismetría', 'Cerebelo'], ['Corea', 'Estriado (Huntington)'], ['Debilidad fatigable', 'Placa motora']],
                { concept: 'fis.ganglios', explain: 'Cada modulador falla distinto.', slide: 3, hint: '¿En reposo o al moverse?', misconception: 'cerebellum-paralysis' }),
              spot('m1-fx1', 'Un aprendiz explicó el Parkinson. ¿Dónde se equivocó?', ['Mueren neuronas de la sustancia negra', 'Por eso sobra dopamina en el estriado', 'Aparecen rigidez, bradicinesia y temblor de reposo'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'Falta dopamina en el estriado', correct: true }, { text: 'Falta acetilcolina en el estriado', note: 'La que falta es la dopamina.' }] },
                { concept: 'fis.ganglios', slide: 3, stepNotes: { 0: 'Correcto.', 2: 'Correcto.' }, explain: 'Si mueren las neuronas que la fabrican, falta.', hint: '¿Qué pasa si mueren las neuronas que producen algo?', misconception: 'parkinson-dopa' }),
              q('m1-p5', '¿Por qué en el Parkinson se da L-DOPA y no dopamina?', [{ text: 'La dopamina no cruza la barrera hematoencefálica; la L-DOPA sí y se convierte en dopamina en el cerebro', correct: true }, { text: 'La dopamina es tóxica', note: 'El problema es que no llega al cerebro.' }, { text: 'La L-DOPA es un agonista colinérgico', note: 'Es el precursor de la dopamina.' }],
                { concept: 'fis.ganglios', explain: 'Precursor que cruza la BHE.', slide: 3, hint: 'Piensa en la barrera hematoencefálica.' })
            ],
            rule: { title: 'Regla del sabio: los moduladores', concept: 'fis.ganglios', steps: ['Con fuerza pero movimiento pobre o de más → ganglios basales', 'Temblor de reposo + rigidez + bradicinesia → Parkinson (↓ dopamina)', 'Descoordinación y temblor de intención → cerebelo (sin parálisis)'] } }
        ]
      },
      {
        id: 'm2', title: 'El piloto automático', subtitle: 'Simpático, parasimpático y sus síndromes', minutes: 20, slides: '6–7', pep: 'P2: sistema vegetativo',
        stages: {
          hook: { title: 'El agricultor que no paraba de babear', sage: 'Un agricultor llega a urgencias tras fumigar: pupilas como puntas de alfiler, babeando, con diarrea, sudor y el corazón lento. Le dan atropina… y mejora. Si entiendes el sistema vegetativo, este caso se resuelve solo.',
            text: 'El sistema nervioso vegetativo controla lo que no decides: pupilas, corazón, bronquios, intestino, glándulas. En la PEP se pregunta qué pasa cuando sobra o falta una de sus dos ramas.' },
          diagnostic: [
            q('m2-d1', 'La midriasis (pupila grande) es efecto del…', [{ text: 'Simpático', correct: true }, { text: 'Parasimpático', misconception: 'symp-para' }, { text: 'Cerebelo', note: 'No controla la pupila.' }], { concept: 'fis.sna', explain: 'Lucha o huida: ver más.', slide: 6 }),
            q('m2-d2', 'Paciente con piel seca y roja, pupilas dilatadas, taquicardia y retención urinaria tras tomar muchos antihistamínicos. Es un síndrome…', [{ text: 'Anticolinérgico', correct: true }, { text: 'Colinérgico', misconception: 'cholinergic' }, { text: 'De Horner', note: 'Horner es miosis de un lado.' }], { concept: 'fis.toxicos', explain: 'Seco, rojo y caliente.', slide: 7 })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.sna', title: 'Desde cero: los mensajeros del SNA', slide: 6, body: 'Ambas ramas usan **acetilcolina en el ganglio** (receptor **nicotínico**). En el órgano: el **simpático** usa **noradrenalina** (receptores **α y β**) y el **parasimpático** usa **acetilcolina** (receptor **muscarínico**). La acetilcolina se destruye en segundos por la **acetilcolinesterasa**.',
              deeper: 'Excepción útil: las glándulas sudoríparas son simpáticas pero usan acetilcolina muscarínica; por eso el síndrome colinérgico hace sudar y el anticolinérgico deja la piel seca.' }
          ],
          explain: [],
          transfer: [
            q('m2-t1', 'Estilo PEP: un agricultor tras fumigar con un organofosforado tiene miosis, salivación, broncorrea, diarrea y bradicardia. ¿Mecanismo y tratamiento?', [{ text: 'Inhibición de la acetilcolinesterasa → exceso de ACh; atropina (antagonista muscarínico)', correct: true }, { text: 'Bloqueo del receptor muscarínico; fisostigmina', misconception: 'cholinergic' }, { text: 'Exceso de noradrenalina; betabloqueador', misconception: 'symp-para' }],
              { concept: 'fis.toxicos', explain: 'Síndrome colinérgico: se bloquea el receptor muscarínico con atropina.', slide: 7 }),
            write('m2-w1', 'Enséñale a tu compañero: ¿por qué la atropina sirve en la intoxicación por organofosforados?', 'Los organofosforados inhiben la acetilcolinesterasa, así que la acetilcolina se acumula y estimula en exceso los receptores muscarínicos: miosis, secreciones, diarrea, broncorrea y bradicardia. La atropina bloquea los receptores muscarínicos y frena esos efectos, aunque no corrige la parte nicotínica (debilidad muscular).',
              ['Organofosforados inhiben la acetilcolinesterasa', 'Se acumula ACh y estimula receptores muscarínicos', 'La atropina bloquea el receptor muscarínico'],
              { concept: 'fis.toxicos', explain: 'Bloquear el efecto del exceso.', slide: 7, teach: true, keywords: [{ label: 'acetilcolinesterasa', any: ['colinesterasa', 'achE', 'acetilcolinesterasa'] }, { label: 'muscarínico', any: ['muscar'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **simpático y parasimpático**.',
            pretest: q('m2-pre1', 'Adivina antes: después de almorzar y descansar manda…', [{ text: 'El parasimpático', correct: true }, { text: 'El simpático', misconception: 'symp-para' }, { text: 'Ninguno', note: 'Siempre hay tono vegetativo.' }], { concept: 'fis.sna', explain: 'Descanso y digestión.', slide: 6 }),
            explain: [
              { id: 'm2b1', concept: 'fis.sna', title: 'Simpático y parasimpático', slide: 6, body: '**Simpático** ("lucha o huida", noradrenalina): **midriasis**, **taquicardia** (β1), **broncodilatación** (β2), vasoconstricción (α1), **menos** motilidad y secreción digestiva, glucogenólisis. **Parasimpático** ("descanso y digestión", ACh muscarínica): **miosis**, **bradicardia**, **broncoconstricción** y más secreción bronquial, **más** motilidad y secreción digestiva, micción.',
                deeper: 'Aplicación: los β2 agonistas (salbutamol) broncodilatan en el asma; los antimuscarínicos inhalados (ipratropio) también. Un betabloqueador no selectivo puede empeorar el asma porque bloquea β2.' }
            ],
            practice: [
              classify('m2-p1', '¿Efecto simpático o parasimpático?', [['s', 'Simpático'], ['p', 'Parasimpático']],
                [['a', 'Midriasis', 's'], ['b', 'Bradicardia', 'p'], ['c', 'Broncodilatación', 's'], ['d', 'Más motilidad intestinal', 'p'], ['e', 'Miosis', 'p'], ['f', 'Taquicardia', 's']],
                { concept: 'fis.sna', explain: 'Lucha o huida frente a descanso.', slide: 6, hint: '¿Sirve para huir o para digerir?', misconception: 'symp-para' }),
              q('m2-p2', '¿Por qué un betabloqueador no selectivo (propranolol) puede empeorar una crisis de asma?', [{ text: 'Bloquea los β2 bronquiales y quita la broncodilatación', correct: true }, { text: 'Estimula los receptores muscarínicos', note: 'No actúa sobre muscarínicos.' }, { text: 'Aumenta la noradrenalina', note: 'Bloquea su efecto.' }],
                { concept: 'fis.sna', explain: 'Sin β2, predomina la broncoconstricción.', slide: 6, hint: '¿Qué receptor dilata el bronquio?' }),
              match('m2-p3', 'Une cada receptor con su efecto:', [['β1', 'Aumenta la frecuencia cardíaca'], ['β2', 'Broncodilatación'], ['α1', 'Vasoconstricción'], ['Muscarínico (M3)', 'Broncoconstricción y secreción']],
                { concept: 'base.sna', explain: 'Receptores y efectos.', slide: 6, hint: 'β1 corazón, β2 bronquios.' })
            ],
            rule: { title: 'Regla del sabio: las dos ramas', concept: 'fis.sna', steps: ['Simpático: huir (midriasis, taquicardia, broncodilatación)', 'Parasimpático: digerir (miosis, bradicardia, secreción y motilidad)', 'Fármaco: ¿imita o bloquea a cuál?'] } },
          { id: 'r2', intro: 'Parte 2: **síndromes y tóxicos**.',
            pretest: q('m2-pre2', 'Adivina antes: un tóxico que impide destruir la acetilcolina causa…', [{ text: 'Exceso de efectos de la ACh', correct: true }, { text: 'Falta de ACh', note: 'Al revés: se acumula.' }, { text: 'Exceso de noradrenalina', misconception: 'symp-para' }], { concept: 'fis.toxicos', explain: 'Se acumula ACh.', slide: 7 }),
            explain: [
              { id: 'm2b2', concept: 'fis.toxicos', title: 'Fármacos y tóxicos del SNA', slide: 7, body: '**Síndrome colinérgico** (organofosforados, carbamatos, sobredosis de piridostigmina): miosis, salivación, lagrimeo, sudor, broncorrea, diarrea, micción, bradicardia; con efectos nicotínicos: fasciculaciones y debilidad → antídoto **atropina** (más una oxima si es organofosforado). **Síndrome anticolinérgico** (atropina, antihistamínicos antiguos, antidepresivos tricíclicos): **seco** (sin sudor ni saliva), **rojo**, **caliente**, midriasis, taquicardia, retención urinaria, confusión. **Horner** (interrupción simpática a la cara, por ejemplo un tumor del vértice pulmonar): **ptosis, miosis y anhidrosis** del mismo lado.',
                deeper: 'Truco: el colinérgico "moja" todo; el anticolinérgico "seca" todo. La miosis aparece en el colinérgico y en Horner; la midriasis en el anticolinérgico y el simpaticomimético (cocaína, anfetaminas), que además sí suda.' }
            ],
            practice: [
              classify('m2-p4', '¿Colinérgico o anticolinérgico?', [['c', 'Colinérgico'], ['a', 'Anticolinérgico']],
                [['a', 'Piel seca y caliente', 'a'], ['b', 'Broncorrea', 'c'], ['c', 'Retención urinaria', 'a'], ['d', 'Miosis puntiforme', 'c'], ['e', 'Diarrea y salivación', 'c'], ['f', 'Midriasis con taquicardia', 'a']],
                { concept: 'fis.toxicos', explain: 'Moja frente a seca.', slide: 7, hint: '¿Hay secreciones o todo está seco?', misconception: 'cholinergic' }),
              spot('m2-fx1', 'Un aprendiz razonó un caso de ptosis y miosis del lado izquierdo, sin sudor en esa mitad de la cara. ¿Dónde se equivocó?', ['Ptosis, miosis y anhidrosis = síndrome de Horner', 'Se debe a un exceso de actividad simpática', 'Hay que buscar una causa en la vía, como un tumor del vértice pulmonar'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'Se debe a una falta de actividad simpática', correct: true }, { text: 'Se debe a un exceso parasimpático generalizado', note: 'Es localizado y por falta simpática.' }] },
                { concept: 'fis.toxicos', slide: 7, stepNotes: { 0: 'Correcto.', 2: 'Correcto.' }, explain: 'Sin simpático: la pupila queda chica y el párpado cae.', hint: '¿La miosis es por más o por menos simpático?', misconception: 'symp-para' }),
              q('m2-p5', 'Un niño come bayas de belladona: está rojo, caliente, confuso, con pupilas dilatadas y sin sudor. ¿Qué receptor está bloqueado?', [{ text: 'Muscarínico', correct: true }, { text: 'β1 adrenérgico', note: 'Tendría bradicardia, no taquicardia.' }, { text: 'Nicotínico de la placa', note: 'Tendría parálisis.' }],
                { concept: 'fis.toxicos', explain: 'La atropina de la belladona bloquea el muscarínico.', slide: 7, hint: 'Seco, rojo y caliente.', misconception: 'cholinergic' })
            ],
            rule: { title: 'Regla del sabio: síndromes vegetativos', concept: 'fis.toxicos', steps: ['Todo moja + miosis + bradicardia → colinérgico → atropina', 'Seco, rojo, caliente + midriasis → anticolinérgico', 'Ptosis + miosis + anhidrosis de un lado → Horner (falta simpático)'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.via', title: 'La vía motora', subtitle: 'De la corteza al músculo', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.via', title: 'Dos neuronas y una placa', slide: 1, body: 'Una orden voluntaria usa **dos neuronas**: la **superior** (corteza → médula) y la **inferior** (médula → músculo), más la **placa motora** donde la ACh activa receptores **nicotínicos**.',
            deeper: 'La vía piramidal cruza al otro lado en el bulbo: un ACV del hemisferio izquierdo debilita el lado **derecho** del cuerpo.' }],
          practice: [
            q('z1-p1', 'Un ACV en el hemisferio izquierdo debilita…', [{ text: 'El lado derecho del cuerpo', correct: true }, { text: 'El lado izquierdo', note: 'La vía piramidal cruza.' }, { text: 'Ambos lados por igual', note: 'Es una lesión de un hemisferio.' }], { concept: 'base.via', explain: 'Decusación piramidal.', slide: 1, hint: 'La vía cruza en el bulbo.' }),
            order('z1-p2', 'Ordena el camino de una orden motora:', [['a', 'Corteza'], ['b', 'Médula (asta anterior)'], ['c', 'Nervio'], ['d', 'Músculo']], ['a', 'b', 'c', 'd'], { concept: 'base.via', direction: 'Del cerebro al músculo.', explain: 'La vía.', slide: 1, hint: 'Empieza en el cerebro.' })
          ],
          transfer: [write('z1-w1', 'Explica qué hace cada una de las dos motoneuronas.', 'La motoneurona superior lleva la orden desde la corteza motora hasta la médula o el tronco; la motoneurona inferior sale de la médula y llega directamente al músculo, donde libera acetilcolina en la placa motora.',
            ['Superior: de la corteza a la médula', 'Inferior: de la médula al músculo', 'En la placa libera acetilcolina'],
            { concept: 'base.via', explain: 'Dos relevos.', slide: 1, keywords: [{ label: 'corteza', any: ['corteza', 'cerebro'] }, { label: 'músculo', any: ['músculo', 'musculo'] }] })]
        } },
      { id: 'z2', concept: 'base.sna', title: 'Mensajeros del SNA', subtitle: 'ACh y noradrenalina', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.sna', title: 'ACh y noradrenalina', slide: 6, body: 'Ganglios: **ACh nicotínica** en ambas ramas. Órganos: **simpático → noradrenalina (α, β)**; **parasimpático → ACh (muscarínico)**. La **acetilcolinesterasa** destruye la ACh.',
            deeper: 'La médula suprarrenal es un "ganglio simpático" que libera adrenalina a la sangre.' }],
          practice: [
            q('z2-p1', 'El parasimpático actúa en el órgano con…', [{ text: 'Acetilcolina sobre receptores muscarínicos', correct: true }, { text: 'Noradrenalina sobre receptores β', note: 'Ese es el simpático.' }, { text: 'Dopamina', note: 'No.' }], { concept: 'base.sna', explain: 'ACh muscarínica.', slide: 6, hint: 'Parasimpático = colinérgico.' }),
            match('z2-p2', 'Une cada enzima o receptor con su papel:', [['Acetilcolinesterasa', 'Destruye la ACh'], ['Receptor nicotínico', 'Ganglios y placa motora'], ['Receptor muscarínico', 'Órganos del parasimpático']], { concept: 'base.sna', explain: 'Piezas del SNA.', slide: 6, hint: 'La placa usa nicotínico.' })
          ],
          transfer: [write('z2-w1', 'Explica qué pasaría si no existiera la acetilcolinesterasa.', 'La acetilcolina no se destruiría y seguiría estimulando sus receptores: habría exceso de efectos parasimpáticos (secreciones, miosis, bradicardia) y de efectos nicotínicos en la placa (fasciculaciones y luego debilidad).',
            ['La ACh se acumula', 'Exceso de efectos muscarínicos', 'Efectos nicotínicos en la placa'],
            { concept: 'base.sna', explain: 'Síndrome colinérgico.', slide: 6, keywords: [{ label: 'acumula', any: ['acumul', 'exceso', 'no se destru'] }, { label: 'efectos', any: ['secrec', 'miosis', 'bradic'] }] })]
        } }
    ],
    formulas: [],
    recipes: [],
    mini: {
      'base.via': { idea: 'Dos neuronas y una placa.', steps: ['Superior: corteza → médula', 'Inferior: médula → músculo', 'Placa: ACh nicotínica'], check: { prompt: 'La vía piramidal cruza en…', options: [{ text: 'El bulbo', correct: true }, { text: 'El músculo', note: 'Cruza en el tronco.' }], explain: 'Decusación bulbar.' } },
      'base.sna': { idea: 'Simpático NA, parasimpático ACh.', steps: ['Ganglio: ACh nicotínica', 'Simpático: NA (α, β)', 'Parasimpático: ACh muscarínica'], check: { prompt: 'Receptor de la placa motora:', options: [{ text: 'Nicotínico', correct: true }, { text: 'Muscarínico', note: 'Ese es del parasimpático.' }], explain: 'Nicotínico.' } },
      'fis.motoneurona': { idea: 'Superior = freno perdido; inferior = cable cortado.', steps: ['MNS: espástica, hiperreflexia, Babinski', 'MNI: fláccida, atrofia, fasciculaciones', 'ELA: ambas'], check: { prompt: 'Fasciculaciones →', options: [{ text: 'MNI', correct: true }, { text: 'MNS', note: 'Son de MNI.' }], explain: 'MNI.' } },
      'fis.placa': { idea: 'Miastenia: la señal se agota.', steps: ['Anticuerpos contra el receptor nicotínico', 'Debilidad fatigable', 'Mejora con inhibidores de AChE'], check: { prompt: 'Empeora al final del día:', options: [{ text: 'Miastenia', correct: true }, { text: 'ELA', note: 'La ELA no fluctúa así.' }], explain: 'Fatigable.' } },
      'fis.ganglios': { idea: 'Ganglios = cuánto; cerebelo = qué tan coordinado.', steps: ['Parkinson: ↓ dopamina', 'Temblor de reposo frente a de intención', 'Cerebelo: sin parálisis'], check: { prompt: 'Temblor de intención →', options: [{ text: 'Cerebelo', correct: true }, { text: 'Parkinson', note: 'El de Parkinson es de reposo.' }], explain: 'Cerebelo.' } },
      'fis.sna': { idea: 'Huir frente a digerir.', steps: ['Simpático: midriasis, taquicardia', 'Parasimpático: miosis, bradicardia', 'β2 dilata bronquios'], check: { prompt: 'Miosis →', options: [{ text: 'Parasimpático', correct: true }, { text: 'Simpático', note: 'El simpático dilata.' }], explain: 'Parasimpático.' } },
      'fis.toxicos': { idea: 'Moja frente a seca.', steps: ['Colinérgico → atropina', 'Anticolinérgico: seco, rojo, caliente', 'Horner: falta simpático'], check: { prompt: 'Antídoto de organofosforados:', options: [{ text: 'Atropina', correct: true }, { text: 'Fisostigmina', note: 'Empeoraría.' }], explain: 'Atropina.' } }
    },
    deep: {},
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', 'La placa motora usa…', [{ text: 'ACh nicotínica', correct: true }, { text: 'Noradrenalina', note: 'No.' }, { text: 'Dopamina', note: 'No.' }], { concept: 'base.via', explain: 'ACh.', slide: 1 }) },
      { level: 1, item: q('dx-2', 'El simpático produce…', [{ text: 'Taquicardia', correct: true }, { text: 'Miosis', misconception: 'symp-para' }, { text: 'Más motilidad intestinal', note: 'Eso es parasimpático.' }], { concept: 'base.sna', explain: 'Lucha o huida.', slide: 6 }) },
      { level: 2, item: q('dx-3', 'Atrofia y fasciculaciones →', [{ text: 'Motoneurona inferior', correct: true }, { text: 'Motoneurona superior', misconception: 'umn-lmn' }, { text: 'Cerebelo', note: 'No.' }], { concept: 'fis.motoneurona', explain: 'MNI.', slide: 2 }) },
      { level: 2, item: q('dx-4', 'Debilidad que empeora con el ejercicio y mejora con reposo →', [{ text: 'Miastenia gravis', correct: true }, { text: 'Parkinson', misconception: 'parkinson-dopa' }, { text: 'ACV', note: 'No fluctúa.' }], { concept: 'fis.placa', explain: 'Fatigable.', slide: 5 }) },
      { level: 2, item: q('dx-5', 'Temblor de reposo, rigidez y bradicinesia →', [{ text: 'Falta de dopamina', correct: true }, { text: 'Daño del cerebelo', misconception: 'cerebellum-paralysis' }, { text: 'Exceso de dopamina', misconception: 'parkinson-dopa' }], { concept: 'fis.ganglios', explain: 'Parkinson.', slide: 3 }) },
      { level: 3, item: q('dx-6', 'Miosis, broncorrea y bradicardia tras fumigar →', [{ text: 'Síndrome colinérgico', correct: true }, { text: 'Anticolinérgico', misconception: 'cholinergic' }, { text: 'Simpaticomimético', misconception: 'symp-para' }], { concept: 'fis.toxicos', explain: 'Organofosforado.', slide: 7 }) },
      { level: 3, item: q('dx-7', 'Ptosis, miosis y anhidrosis de un lado →', [{ text: 'Horner (falta simpático)', correct: true }, { text: 'Exceso parasimpático generalizado', note: 'Es de un lado.' }, { text: 'Anticolinérgico', misconception: 'cholinergic' }], { concept: 'fis.toxicos', explain: 'Horner.', slide: 7 }) }
    ] }
  };
})();
