/* Fisiopatología · PEP 1 · Sistema respiratorio: ventilación e intercambio gaseoso (jueves 12 de noviembre).
   Las clases de respiratorio (Dr. Cárdenas, 9, 15 y 16 de octubre) aún no están en el Drive: el contenido sale de la bibliografía básica del programa
   (Silbernagl y Lang, Fisiopatología, 2011, cap. "Respiración": trastornos obstructivos y restrictivos, distribución V/Q, difusión, hipoxemia).
   Las "láminas" son secciones propias. Números recalculados en Python (PAO₂ a nivel del mar con FiO₂ 0,21, Patm 760, PH₂O 47, R 0,8). */
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
  window.NexoClasses['fis-06'] = {
    id: 'fis-06',
    subject: 'fisio',
    title: 'Respiratorio: ventilación e intercambio gaseoso',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Fisiopatología (cap. respiración)', author: 'Silbernagl y Lang', detail: 'Bibliografía básica del programa 2026-2 (clases del Dr. Cárdenas aún no están en el Drive)', authority: 'Libro de texto' },
      gold: { title: 'Global Strategy for COPD (GOLD) 2024', author: 'Global Initiative for Chronic Obstructive Lung Disease', detail: 'Criterio espirométrico VEF₁/CVF < 0,70 posbroncodilatador', authority: 'Guía clínica', url: 'https://goldcopd.org' }
    },
    misconceptions: {
      'obs-res': { label: 'Confundiste obstructivo con restrictivo', why: '**Obstructivo** (asma, EPOC): cuesta **sacar** el aire; **VEF₁/CVF < 0,70**; volúmenes normales o **aumentados** (atrapamiento). **Restrictivo** (fibrosis, deformidad torácica, enfermedad neuromuscular): cuesta **llenar** el pulmón; **CPT y CVF bajas** con **VEF₁/CVF normal o alta**.',
        prereq: { title: 'Sacar o llenar', mission: 'm1', block: 'm1b1' }, base: 'base.volumenes',
        check: q('fix-obs', 'Caso corto: VEF₁/CVF = 0,85 y CPT al 60 % de lo esperado. Patrón…', [{ text: 'Restrictivo', correct: true }, { text: 'Obstructivo', note: 'El cociente es normal.' }, { text: 'Normal', note: 'La CPT está muy baja.' }], { concept: 'fis.patron', explain: 'Cociente normal y volúmenes bajos.', slide: 2 }) },
      'asthma-copd': { label: 'Confundiste asma con EPOC', why: '**Asma**: inflamación con **hiperreactividad** bronquial; obstrucción **reversible** (mejora con broncodilatador), episódica, a menudo desde joven y con atopia. **EPOC**: daño crónico (casi siempre **tabaco**); obstrucción **poco reversible** y progresiva (bronquitis crónica y/o enfisema).',
        prereq: { title: 'Asma y EPOC', mission: 'm1', block: 'm1b2' }, base: 'base.volumenes' },
      'shunt-o2': { label: 'Creíste que el O₂ corrige un shunt', why: 'En un **shunt** (V/Q = 0) la sangre pasa por alvéolos **sin ventilación** (atelectasia, neumonía, edema pulmonar): el O₂ extra **no llega** a esa sangre, así que la hipoxemia **casi no mejora** con oxígeno. En el desequilibrio V/Q bajo, en cambio, sí mejora.',
        prereq: { title: 'Por qué baja el O₂', mission: 'm2', block: 'm2b1' }, base: 'base.gases' },
      'aa-gradient': { label: 'Interpretaste mal el gradiente A-a', why: 'Gradiente **A-a = PAO₂ − PaO₂**. **Normal** (< ~15 mmHg en jóvenes) con hipoxemia → **hipoventilación** o ↓ O₂ inspirado (altura): el pulmón funciona bien. **Aumentado** → el problema está **en el pulmón** (V/Q, shunt o difusión).',
        prereq: { title: 'Por qué baja el O₂', mission: 'm2', block: 'm2b1' }, base: 'base.gases' },
      'resp-failure': { label: 'Confundiste los tipos de insuficiencia respiratoria', why: '**Tipo 1 (hipoxémica)**: PaO₂ < 60 mmHg con PaCO₂ normal o baja (falla del intercambio). **Tipo 2 (hipercápnica)**: PaCO₂ > 45–50 mmHg (falla de la **ventilación**: la "bomba"), casi siempre con hipoxemia.',
        prereq: { title: 'Insuficiencia respiratoria', mission: 'm2', block: 'm2b2' }, base: 'base.gases' }
    },
    goal: {
      total: 100, text: 'Asegurar los 30 puntos de respiratorio de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P5', label: 'Patrón obstructivo y restrictivo; asma y EPOC', points: 15, missions: ['m1'] },
        { id: 'P6', label: 'Hipoxemia, gradiente A-a e insuficiencia respiratoria', points: 15, missions: ['m2'] }
      ],
      rest: [{ label: 'Nervioso', points: 40, note: 'clases fis-01 y fis-02' }, { label: 'Digestivo', points: 30, note: 'clase fis-09' }]
    },
    glossary: [
      { term: 'VEF₁', mission: 'm1', def: 'Volumen espirado en el primer segundo de una espiración forzada.', simple: 'Cuánto aire sacas en el primer segundo soplando fuerte.', simpler: 'El primer soplido de las velas.' },
      { term: 'CVF', mission: 'm1', def: 'Capacidad vital forzada: todo el aire que se puede sacar después de una inspiración máxima.', simple: 'Todo el aire que puedes botar.', simpler: 'Vaciar el globo entero.' },
      { term: 'Atrapamiento aéreo', mission: 'm1', def: 'Aumento del volumen residual porque la vía aérea se cierra antes de vaciar el alvéolo.', simple: 'Aire que queda atrapado.', simpler: 'Un globo que no puedes desinflar del todo.' },
      { term: 'Relación V/Q', mission: 'm2', def: 'Relación entre ventilación alveolar y flujo sanguíneo capilar de una zona del pulmón.', simple: 'Cuánto aire llega frente a cuánta sangre pasa.', simpler: 'Que el bus (sangre) pase por paraderos donde hay gente (O₂).' },
      { term: 'Shunt', mission: 'm2', def: 'Sangre que atraviesa el pulmón sin pasar por alvéolos ventilados (V/Q = 0).', simple: 'Sangre que pasa sin oxigenarse.', simpler: 'Un bus que pasa por un paradero vacío.' },
      { term: 'Gradiente A-a', mission: 'm2', def: 'Diferencia entre la PO₂ alveolar calculada y la PaO₂ arterial medida.', simple: 'Cuánto O₂ se "pierde" entre el alvéolo y la sangre.', simpler: 'Lo que se cae del camión en el camino.' }
    ],
    concepts: [
      { id: 'base.volumenes', title: 'Volúmenes y espirometría', root: true },
      { id: 'base.gases', title: 'Presiones parciales de O₂ y CO₂', root: true },
      { id: 'fis.patron', mission: 'm1', title: 'Patrón obstructivo y restrictivo', needs: ['base.volumenes'] },
      { id: 'fis.asma', mission: 'm1', title: 'Asma y EPOC', needs: ['fis.patron'] },
      { id: 'fis.hipoxemia', mission: 'm2', title: 'Causas de hipoxemia y gradiente A-a', needs: ['base.gases'] },
      { id: 'fis.insuficiencia', mission: 'm2', title: 'Insuficiencia respiratoria tipo 1 y 2', needs: ['fis.hipoxemia'] }
    ],
    curiosities: [
      { text: 'La espirometría la inventó John Hutchinson en 1846 midiendo a más de 2000 personas; ya notó que la capacidad vital baja con la enfermedad pulmonar.', slide: 1 },
      { text: 'El déficit de α1-antitripsina causa enfisema joven: sin ese inhibidor, la elastasa de los neutrófilos destruye las paredes alveolares sin freno.', slide: 3 },
      { text: 'En la cima del Everest la PO₂ inspirada es cerca de un tercio de la del nivel del mar; los escaladores sobreviven hiperventilando y bajando muchísimo su PaCO₂.', slide: 5 }
    ],
    slideImages: {},
    slides: {
      1: { title: 'Espirometría', bullets: ['VEF₁, CVF y VEF₁/CVF', 'CPT, VR (con pletismografía)'] },
      2: { title: 'Obstructivo frente a restrictivo', bullets: ['Obstructivo: VEF₁/CVF < 0,70; ↑ VR y CPT normal o ↑', 'Restrictivo: ↓ CPT y CVF; VEF₁/CVF normal o ↑', 'Resistencia frente a distensibilidad'] },
      3: { title: 'Asma y EPOC', bullets: ['Asma: inflamación, hiperreactividad, reversible', 'EPOC: tabaco; bronquitis crónica y enfisema; poco reversible', 'Enfisema: pérdida de retracción elástica (proteasas/antiproteasas)'] },
      4: { title: 'Restrictivos', bullets: ['Parénquima: fibrosis pulmonar (↓ distensibilidad)', 'Extraparenquimatosos: cifoescoliosis, obesidad, enfermedades neuromusculares'] },
      5: { title: 'Causas de hipoxemia', bullets: ['↓ PO₂ inspirada (altura) · hipoventilación: A-a normal', 'V/Q bajo · shunt · difusión: A-a aumentado', 'Shunt: no corrige con O₂'] },
      6: { title: 'Gas alveolar y gradiente A-a', bullets: ['PAO₂ = FiO₂ (Patm − 47) − PaCO₂/0,8', 'Nivel del mar, aire: PAO₂ ≈ 150 − PaCO₂/0,8', 'A-a normal < ~15 mmHg (sube con la edad)'] },
      7: { title: 'Insuficiencia respiratoria', bullets: ['Tipo 1: PaO₂ < 60 con PaCO₂ normal o baja', 'Tipo 2: PaCO₂ > 45–50 (falla de la bomba)', 'Ej. tipo 2: EPOC grave, sobredosis de opioides, enfermedad neuromuscular'] }
    },
    missions: [
      {
        id: 'm1', title: 'Sacar o llenar', subtitle: 'Obstructivo, restrictivo, asma y EPOC', minutes: 25, slides: '1–4', pep: 'P5: patrón ventilatorio',
        stages: {
          hook: { title: 'Dos que se ahogan distinto', sage: 'Uno respira como por una bombilla: el aire entra, pero salir le cuesta. El otro tiene el pecho como un corset: no logra llenarse. Los dos dicen "me falta el aire", pero la espirometría los separa en un segundo.',
            text: 'La pregunta típica: te dan VEF₁, CVF y CPT y debes decir el patrón y una causa. La clave es el **cociente VEF₁/CVF**.' },
          diagnostic: [
            q('m1-d1', 'VEF₁/CVF = 0,55. El patrón es…', [{ text: 'Obstructivo', correct: true }, { text: 'Restrictivo', misconception: 'obs-res' }, { text: 'Normal', note: 'Bajo 0,70 es anormal.' }], { concept: 'fis.patron', explain: 'Cociente bajo: cuesta sacar el aire.', slide: 2 }),
            q('m1-d2', 'Obstrucción que mejora claramente con salbutamol, en una joven con rinitis alérgica. Sugiere…', [{ text: 'Asma', correct: true }, { text: 'EPOC', misconception: 'asthma-copd' }, { text: 'Fibrosis pulmonar', misconception: 'obs-res' }], { concept: 'fis.asma', explain: 'Reversible + atopia.', slide: 3 })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.volumenes', title: 'Desde cero: espirometría', slide: 1, body: 'Se inspira al máximo y se sopla lo más fuerte y largo posible. **CVF** = todo el aire que sale. **VEF₁** = el que sale en el **primer segundo**. Una persona sana saca más del 70–80 % en el primer segundo: **VEF₁/CVF ≥ 0,70**. La **CPT** (todo el aire del pulmón lleno) y el **VR** (lo que queda) necesitan otra técnica (pletismografía).',
              deeper: 'Ejemplo: VEF₁ 2,1 L y CVF 3,5 L → 2,1/3,5 = 0,60 → obstructivo. Sano: VEF₁ 3,6 L y CVF 4,5 L → 0,80.' }
          ],
          explain: [],
          transfer: [
            num('m1-t1', 'Estilo PEP: fumador de 62 años, VEF₁ 1,45 L y CVF 3,10 L tras broncodilatador. Calcula VEF₁/CVF.', 0.468, '',
              { concept: 'fis.patron', label: 'VEF₁/CVF', slide: 2, tol: 0.01, traps: [{ value: 2.138, note: 'Al revés: VEF₁ dividido por CVF.' }, { value: 46.8, note: 'Como fracción, no en %: 0,47.' }],
                solution: ['VEF₁/CVF = 1,45 / 3,10 = 0,47', '< 0,70 posbroncodilatador → obstrucción no reversible: compatible con EPOC'], explain: '0,47: obstructivo (EPOC).' }),
            write('m1-w1', 'Enséñale a tu compañero: ¿por qué en el enfisema el aire queda atrapado?', 'En el enfisema se destruyen las paredes alveolares y se pierde la retracción elástica del pulmón. Esa retracción es la que empuja el aire hacia afuera y mantiene abiertas las vías pequeñas; sin ella, las vías aéreas se colapsan durante la espiración antes de vaciar el alvéolo, el aire queda atrapado y aumenta el volumen residual.',
              ['Se destruyen paredes alveolares: se pierde la retracción elástica', 'Las vías pequeñas se colapsan al espirar', 'Aumenta el volumen residual (atrapamiento)'],
              { concept: 'fis.asma', explain: 'Sin elasticidad, la vía se cierra antes.', slide: 3, teach: true, keywords: [{ label: 'retracción elástica', any: ['elástic', 'elastic', 'retracc'] }, { label: 'colapso', any: ['colaps', 'cierra', 'cierran'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **obstructivo frente a restrictivo**.',
            pretest: q('m1-pre1', 'Adivina antes: en una fibrosis pulmonar el pulmón está…', [{ text: 'Más rígido: cuesta llenarlo', correct: true }, { text: 'Más blando: cuesta vaciarlo', misconception: 'obs-res' }, { text: 'Igual', note: 'La fibrosis lo endurece.' }], { concept: 'fis.patron', explain: 'Menos distensibilidad.', slide: 4 }),
            explain: [
              { id: 'm1b1', concept: 'fis.patron', title: 'Sacar o llenar', slide: 2, body: '**Obstructivo** (↑ **resistencia** de la vía aérea: asma, EPOC, bronquiectasias): el VEF₁ baja mucho más que la CVF → **VEF₁/CVF < 0,70**; el aire queda atrapado → **↑ VR** y CPT normal o aumentada (hiperinsuflación). **Restrictivo** (↓ **distensibilidad** o pared que no se expande: fibrosis, cifoescoliosis, obesidad, enfermedad neuromuscular): baja **todo** → **↓ CPT y CVF**, con **VEF₁/CVF normal o alto**.',
                deeper: '¿Por qué el cociente puede subir en la fibrosis? El pulmón rígido "salta" hacia afuera con fuerza y las vías aéreas quedan traccionadas y abiertas: sale casi todo en el primer segundo, aunque sea poco aire.' }
            ],
            practice: [
              classify('m1-p1', '¿Obstructivo o restrictivo?', [['o', 'Obstructivo'], ['r', 'Restrictivo']],
                [['a', 'VEF₁/CVF 0,52', 'o'], ['b', 'CPT 55 % de lo esperado', 'r'], ['c', 'Fibrosis pulmonar idiopática', 'r'], ['d', 'Volumen residual aumentado', 'o'], ['e', 'Miastenia gravis grave', 'r'], ['f', 'Asma en crisis', 'o']],
                { concept: 'fis.patron', explain: 'Sacar frente a llenar.', slide: 2, hint: '¿Cuesta sacar el aire o llenar el pulmón?', misconception: 'obs-res' }),
              num('m1-p2', 'VEF₁ 2,10 L y CVF 3,50 L. Calcula VEF₁/CVF.', 0.6, '',
                { concept: 'fis.patron', label: 'VEF₁/CVF', slide: 2, tol: 0.01, hint: 'Divide VEF₁ por CVF.', traps: [{ value: 1.667, note: 'Al revés.' }], solution: ['2,10 / 3,50 = 0,60 → < 0,70: obstructivo'], explain: '0,60: obstructivo.' }),
              q('m1-p3', 'Paciente obeso con disnea: VEF₁/CVF 0,82, CPT 70 % y difusión normal. ¿Qué tipo de restricción?', [{ text: 'Extraparenquimatosa (la pared torácica no se expande)', correct: true }, { text: 'Fibrosis del parénquima', note: 'La fibrosis bajaría la difusión.' }, { text: 'Obstructiva', misconception: 'obs-res' }],
                { concept: 'fis.patron', explain: 'Pulmón sano, pared que no deja expandir.', slide: 4, hint: 'La difusión normal dice que el pulmón está sano.' })
            ],
            rule: { title: 'Regla del sabio: el patrón', concept: 'fis.patron', steps: ['VEF₁/CVF < 0,70 → obstructivo', 'CPT baja con cociente normal o alto → restrictivo', 'Difusión baja → problema del parénquima'] } },
          { id: 'r2', intro: 'Parte 2: **asma y EPOC**.',
            pretest: q('m1-pre2', 'Adivina antes: ¿cuál suele mejorar casi por completo con un broncodilatador?', [{ text: 'El asma', correct: true }, { text: 'La EPOC', misconception: 'asthma-copd' }, { text: 'La fibrosis', note: 'No es obstructiva.' }], { concept: 'fis.asma', explain: 'Reversible.', slide: 3 }),
            explain: [
              { id: 'm1b2', concept: 'fis.asma', title: 'Asma y EPOC', slide: 3, body: '**Asma**: inflamación crónica (a menudo alérgica, Th2, eosinófilos, IgE) con **hiperreactividad**: ante un gatillo hay broncoconstricción, edema y moco. Obstrucción **reversible** y variable → β2 agonistas para la crisis y **corticoides inhalados** para la inflamación. **EPOC** (casi siempre **tabaco**): **bronquitis crónica** (hipersecreción de moco, tos productiva ≥ 3 meses al año por 2 años) y **enfisema** (destrucción alveolar por desequilibrio **proteasas/antiproteasas**: el humo atrae neutrófilos cuya elastasa vence a la α1-antitripsina) → pérdida de **retracción elástica** y atrapamiento. Obstrucción **poco reversible** y progresiva.',
                deeper: 'Por eso en el enfisema baja la difusión (se pierde superficie alveolar) y en el asma pura suele ser normal. El enfisema joven sin tabaco hace pensar en déficit de α1-antitripsina.' }
            ],
            practice: [
              match('m1-p4', 'Une cada hallazgo con la enfermedad:', [['Eosinófilos, IgE y crisis con gatillos', 'Asma'], ['Tos productiva crónica en fumador', 'Bronquitis crónica (EPOC)'], ['Destrucción de paredes alveolares', 'Enfisema (EPOC)'], ['Enfisema a los 35 años sin fumar', 'Déficit de α1-antitripsina']],
                { concept: 'fis.asma', explain: 'Mecanismos distintos.', slide: 3, hint: 'Inflamación alérgica frente a daño por tabaco.', misconception: 'asthma-copd' }),
              spot('m1-fx1', 'Un aprendiz explicó el enfisema. ¿Dónde se equivocó?', ['El humo atrae neutrófilos que liberan elastasa', 'La α1-antitripsina aumenta y destruye la pared alveolar', 'Se pierde la retracción elástica y se atrapa aire'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'La elastasa supera a la α1-antitripsina (que la inhibe) y destruye la pared', correct: true }, { text: 'La α1-antitripsina es la que digiere el colágeno', note: 'Es un inhibidor protector.' }] },
                { concept: 'fis.asma', slide: 3, stepNotes: { 0: 'Correcto.', 2: 'Correcto.' }, explain: 'Desequilibrio proteasas/antiproteasas.', hint: '¿La α1-antitripsina destruye o protege?' }),
              order('m1-p5', 'Ordena lo que pasa en una crisis de asma:', [['a', 'Exposición a un alérgeno'], ['b', 'Liberación de mediadores (histamina, leucotrienos)'], ['c', 'Broncoconstricción, edema y moco'], ['d', 'Cae el VEF₁ y aparece la sibilancia']], ['a', 'b', 'c', 'd'],
                { concept: 'fis.asma', direction: 'Del gatillo al síntoma.', explain: 'Hiperreactividad.', slide: 3, hint: 'Primero el gatillo.' })
            ],
            rule: { title: 'Regla del sabio: asma o EPOC', concept: 'fis.asma', steps: ['Reversible, episódica, atopia → asma', 'Tabaco, progresiva, poco reversible → EPOC', 'Enfisema: proteasas > antiproteasas → sin retracción → atrapamiento'] } }
        ]
      },
      {
        id: 'm2', title: '¿Por qué baja el oxígeno?', subtitle: 'V/Q, shunt, difusión, gradiente A-a e insuficiencia respiratoria', minutes: 30, slides: '5–7', pep: 'P6: hipoxemia',
        stages: {
          hook: { title: 'Dos pacientes con PaO₂ 55', sage: 'Uno tomó demasiados opioides y respira 6 veces por minuto. El otro tiene una neumonía extensa. Los dos tienen PaO₂ de 55, pero uno tiene los pulmones sanos. Un número te dice cuál: el gradiente A-a.',
            text: 'En la PEP: identificar el mecanismo de una hipoxemia, calcular la PAO₂ y el gradiente A-a, y clasificar la insuficiencia respiratoria.' },
          diagnostic: [
            q('m2-d1', 'Hipoxemia que casi no mejora con O₂ al 100 % sugiere…', [{ text: 'Shunt', correct: true }, { text: 'Desequilibrio V/Q leve', misconception: 'shunt-o2' }, { text: 'Hipoventilación', note: 'Esa mejora con O₂.' }], { concept: 'fis.hipoxemia', explain: 'El O₂ no llega a la sangre del shunt.', slide: 5 }),
            q('m2-d2', 'PaCO₂ 75 mmHg y PaO₂ 50 mmHg en una sobredosis de opioides. Es una insuficiencia respiratoria…', [{ text: 'Tipo 2 (hipercápnica)', correct: true }, { text: 'Tipo 1 (hipoxémica)', misconception: 'resp-failure' }, { text: 'No es insuficiencia', note: 'Ambos valores están alterados.' }], { concept: 'fis.insuficiencia', explain: 'Falla de la bomba: sube el CO₂.', slide: 7 })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.gases', title: 'Desde cero: presiones parciales', slide: 6, body: 'El aire tiene 21 % de O₂. A nivel del mar (760 mmHg), al humedecerse en la vía aérea (vapor de agua 47 mmHg) la PO₂ inspirada es 0,21 × 713 ≈ **150 mmHg**. En el alvéolo, parte del espacio lo ocupa el CO₂: **PAO₂ = 150 − PaCO₂/0,8** ≈ 100 mmHg. La **PaO₂** arterial normal es ~80–100 mmHg y la **PaCO₂** ~35–45 mmHg.',
              deeper: 'El 0,8 es el cociente respiratorio (CO₂ producido / O₂ consumido). Si la PaCO₂ sube (hipoventilación), la PAO₂ baja aunque el pulmón esté sano.' }
          ],
          explain: [],
          transfer: [
            num('m2-t1', 'Estilo PEP: respirando aire ambiental a nivel del mar, un paciente tiene PaO₂ 60 mmHg y PaCO₂ 40 mmHg. Calcula el gradiente A-a (PAO₂ = 0,21 × 713 − PaCO₂/0,8).', 39.7, 'mmHg',
              { concept: 'fis.hipoxemia', label: 'A-a', slide: 6, tol: 0.03, traps: [{ value: 89.7, note: 'Olvidaste restar la PaO₂: A-a = PAO₂ − PaO₂.' }, { value: 57.7, note: 'Multiplicaste por 0,8: es PaCO₂/0,8 = 50.' }, { value: 99.7, note: 'Esa es la PAO₂.' }],
                solution: ['PAO₂ = 0,21 × 713 − 40/0,8 = 149,7 − 50 = 99,7 mmHg', 'A-a = 99,7 − 60 = 39,7 mmHg', 'Aumentado → problema del pulmón (V/Q, shunt o difusión)'], explain: '≈ 40 mmHg: aumentado.' }),
            num('m2-t2', 'Estilo PEP: sobredosis de opioides: PaCO₂ 70 mmHg y PaO₂ 55 mmHg (aire ambiental, nivel del mar). Calcula el gradiente A-a.', 7.2, 'mmHg',
              { concept: 'fis.hipoxemia', label: 'A-a', slide: 6, tol: 0.05, traps: [{ value: 44.7, note: 'Usaste PaCO₂ 40: aquí es 70.' }, { value: 94.7, note: 'Usaste solo 150 − PaO₂: falta restar PaCO₂/0,8.' }],
                solution: ['PAO₂ = 149,7 − 70/0,8 = 149,7 − 87,5 = 62,2 mmHg', 'A-a = 62,2 − 55 = 7,2 mmHg', 'Normal → hipoventilación pura: el pulmón está sano'], explain: '≈ 7 mmHg: normal (hipoventilación).' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿cómo sabes si una hipoxemia es por hipoventilación o por un problema del pulmón?', 'Calculo la PAO₂ con la ecuación del gas alveolar y le resto la PaO₂ para obtener el gradiente A-a. Si el gradiente es normal, el pulmón transfiere bien el oxígeno y la hipoxemia se explica por hipoventilación (sube la PaCO₂ y baja la PAO₂). Si está aumentado, el problema está en el pulmón: desequilibrio V/Q, shunt o alteración de la difusión.',
              ['Calcular PAO₂ y el gradiente A-a', 'A-a normal → hipoventilación (o altura)', 'A-a aumentado → V/Q, shunt o difusión'],
              { concept: 'fis.hipoxemia', explain: 'El gradiente separa la bomba del pulmón.', slide: 5, teach: true, keywords: [{ label: 'gradiente A-a', any: ['gradiente', 'a-a'] }, { label: 'hipoventilación', any: ['hipoventil'] }, { label: 'V/Q o shunt', any: ['v/q', 'shunt', 'difusi'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **cinco causas de hipoxemia**.',
            pretest: q('m2-pre1', 'Adivina antes: en una embolia pulmonar, la zona del pulmón detrás del coágulo tiene…', [{ text: 'Ventilación pero no flujo (espacio muerto)', correct: true }, { text: 'Flujo pero no ventilación (shunt)', misconception: 'shunt-o2' }, { text: 'Todo normal', note: 'El coágulo corta el flujo.' }], { concept: 'fis.hipoxemia', explain: 'V/Q → ∞.', slide: 5 }),
            explain: [
              { id: 'm2b1', concept: 'fis.hipoxemia', title: 'Por qué baja el O₂', slide: 5, body: 'Cinco causas: **1) ↓ PO₂ inspirada** (altura) y **2) hipoventilación** (opioides, neuromuscular): gradiente A-a **normal**. **3) Desequilibrio V/Q** (la más común: EPOC, asma, embolia): A-a aumentado, **mejora con O₂**. **4) Shunt** (V/Q = 0: atelectasia, neumonía, edema pulmonar, cardiopatía con cortocircuito): A-a aumentado, **no corrige con O₂**. **5) Difusión** (fibrosis, enfisema): A-a aumentado, empeora con el **ejercicio**. **Espacio muerto** (V/Q → ∞, embolia) desperdicia ventilación.',
                deeper: 'Gradiente A-a = PAO₂ − PaO₂, con PAO₂ = FiO₂ (Patm − 47) − PaCO₂/0,8. Normal < ~15 mmHg en jóvenes (aproximación: edad/4 + 4). Ejemplos: PaO₂ 60 y PaCO₂ 40 → A-a 39,7 (pulmón). PaO₂ 55 y PaCO₂ 70 → A-a 7,2 (hipoventilación).' }
            ],
            practice: [
              classify('m2-p1', '¿Con gradiente A-a normal o aumentado?', [['n', 'A-a normal'], ['a', 'A-a aumentado']],
                [['a', 'Sobredosis de opioides', 'n'], ['b', 'Neumonía lobar', 'a'], ['c', 'Excursionista a 4000 m', 'n'], ['d', 'Fibrosis pulmonar', 'a'], ['e', 'Embolia pulmonar', 'a'], ['f', 'Síndrome de Guillain-Barré con debilidad respiratoria', 'n']],
                { concept: 'fis.hipoxemia', explain: '¿Pulmón sano o enfermo?', slide: 5, hint: 'Si el pulmón está sano, el gradiente es normal.', misconception: 'aa-gradient' }),
              num('m2-p2', 'Aire ambiental, nivel del mar: PaCO₂ 32 mmHg. Calcula la PAO₂ (PAO₂ = 0,21 × 713 − PaCO₂/0,8).', 109.7, 'mmHg',
                { concept: 'fis.hipoxemia', label: 'PAO₂', slide: 6, tol: 0.01, hint: '0,21 × 713 = 149,7; resta 32/0,8 = 40.', traps: [{ value: 124.1, note: 'Multiplicaste por 0,8: es PaCO₂/0,8.' }, { value: 117.7, note: 'Falta dividir la PaCO₂ por 0,8.' }], solution: ['PAO₂ = 149,7 − 32/0,8 = 149,7 − 40 = 109,7 mmHg'], explain: '109,7 mmHg.' }),
              q('m2-p3', 'Paciente con atelectasia de un lóbulo: PaO₂ 58 con O₂ al 100 % sube solo a 70. ¿Mecanismo?', [{ text: 'Shunt (sangre que pasa por alvéolos sin ventilar)', correct: true }, { text: 'Desequilibrio V/Q leve', misconception: 'shunt-o2' }, { text: 'Hipoventilación', misconception: 'aa-gradient' }],
                { concept: 'fis.hipoxemia', explain: 'Con O₂ al 100 % debería superar 400 si fuera V/Q.', slide: 5, hint: '¿Mejora con oxígeno?', misconception: 'shunt-o2' })
            ],
            rule: { title: 'Regla del sabio: la hipoxemia', concept: 'fis.hipoxemia', steps: ['Calcula PAO₂ = 0,21 × 713 − PaCO₂/0,8 y A-a = PAO₂ − PaO₂', 'A-a normal → hipoventilación o altura', 'A-a alto: mejora con O₂ → V/Q; no mejora → shunt; peor al ejercicio → difusión'] } },
          { id: 'r2', intro: 'Parte 2: **insuficiencia respiratoria**.',
            pretest: q('m2-pre2', 'Adivina antes: si los músculos respiratorios fallan, ¿qué gas sube primero en la sangre?', [{ text: 'CO₂', correct: true }, { text: 'O₂', note: 'El O₂ baja.' }, { text: 'Ninguno cambia', note: 'Sin ventilación se acumula CO₂.' }], { concept: 'fis.insuficiencia', explain: 'Falla de bomba → hipercapnia.', slide: 7 }),
            explain: [
              { id: 'm2b2', concept: 'fis.insuficiencia', title: 'Insuficiencia respiratoria', slide: 7, body: '**Tipo 1 (hipoxémica)**: **PaO₂ < 60 mmHg** con PaCO₂ normal o **baja** (el paciente hiperventila): falla del **intercambio** (neumonía, edema pulmonar, SDRA, embolia). **Tipo 2 (hipercápnica)**: **PaCO₂ > 45–50 mmHg**: falla de la **bomba** ventilatoria (EPOC grave agotado, sobredosis de opioides, enfermedades neuromusculares, deformidad torácica). La hipercapnia produce **acidosis respiratoria**, somnolencia y vasodilatación cerebral.',
                deeper: 'En la EPOC con retención crónica de CO₂ hay que dar O₂ con cuidado y controlado (meta de saturación 88–92 %): demasiado O₂ puede empeorar la hipercapnia (empeora la relación V/Q por pérdida de la vasoconstricción hipóxica y efecto Haldane).' }
            ],
            practice: [
              classify('m2-p4', '¿Tipo 1 o tipo 2?', [['t1', 'Tipo 1 (hipoxémica)'], ['t2', 'Tipo 2 (hipercápnica)']],
                [['a', 'PaO₂ 52, PaCO₂ 30 en una neumonía', 't1'], ['b', 'PaO₂ 55, PaCO₂ 68 por opioides', 't2'], ['c', 'Edema pulmonar agudo con PaCO₂ 33', 't1'], ['d', 'ELA avanzada con PaCO₂ 60', 't2']],
                { concept: 'fis.insuficiencia', explain: 'Mira la PaCO₂.', slide: 7, hint: '¿La PaCO₂ está alta?', misconception: 'resp-failure' }),
              match('m2-p5', 'Une cada causa con su mecanismo principal:', [['Sobredosis de opioides', 'Hipoventilación (falla de la bomba)'], ['Neumonía extensa', 'Shunt'], ['Embolia pulmonar', 'V/Q alterado (espacio muerto)'], ['Fibrosis pulmonar', 'Alteración de la difusión']],
                { concept: 'fis.hipoxemia', explain: 'Cada causa tiene su mecanismo.', slide: 5, hint: '¿Bomba, alvéolo lleno, vaso tapado o membrana gruesa?' }),
              spot('m2-fx1', 'Un aprendiz analizó: "PaO₂ 50 y PaCO₂ 72 en un paciente con miastenia en crisis". ¿Dónde se equivocó?', ['La PaCO₂ alta indica falla de la ventilación', 'Entonces es insuficiencia respiratoria tipo 1', 'El tratamiento debe asegurar la ventilación (soporte ventilatorio)'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'Es tipo 2 (hipercápnica)', correct: true }, { text: 'No es insuficiencia respiratoria', note: 'Los dos valores están alterados.' }] },
                { concept: 'fis.insuficiencia', slide: 7, stepNotes: { 0: 'Correcto.', 2: 'Correcto.' }, explain: 'PaCO₂ > 45–50 = tipo 2.', hint: '¿Cuál define el tipo 2?', misconception: 'resp-failure' })
            ],
            rule: { title: 'Regla del sabio: insuficiencia respiratoria', concept: 'fis.insuficiencia', steps: ['PaO₂ < 60 con PaCO₂ normal o baja → tipo 1 (intercambio)', 'PaCO₂ > 45–50 → tipo 2 (bomba)', 'EPOC retenedor: O₂ controlado'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.volumenes', title: 'Espirometría', subtitle: 'VEF₁, CVF y su cociente', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.volumenes', title: 'VEF₁ y CVF', slide: 1, body: '**CVF**: todo el aire que sale soplando fuerte. **VEF₁**: el del primer segundo. **VEF₁/CVF** normal ≥ 0,70. **CPT** = todo el aire con el pulmón lleno; **VR** = lo que queda tras botar todo.',
            deeper: 'CPT = CV + VR. El VR no se mide con espirometría simple.' }],
          practice: [
            num('z1-p1', 'VEF₁ 3,60 L y CVF 4,50 L. VEF₁/CVF =', 0.8, '', { concept: 'base.volumenes', label: 'VEF₁/CVF', slide: 1, tol: 0.01, hint: 'Divide.', traps: [{ value: 1.25, note: 'Al revés.' }], solution: ['3,60 / 4,50 = 0,80 (normal)'], explain: '0,80.' }),
            q('z1-p2', '¿Qué volumen NO se mide con espirometría simple?', [{ text: 'Volumen residual', correct: true }, { text: 'VEF₁', note: 'Sí se mide.' }, { text: 'CVF', note: 'Sí se mide.' }], { concept: 'base.volumenes', explain: 'El VR nunca sale.', slide: 1, hint: 'Lo que queda dentro no se puede soplar.' })
          ],
          transfer: [write('z1-w1', 'Explica qué significa un VEF₁/CVF de 0,50.', 'Que en el primer segundo la persona logra sacar solo la mitad del aire que puede botar en total; normalmente se saca al menos el 70 %. Indica que el aire sale con dificultad: obstrucción de la vía aérea.',
            ['Solo sale la mitad en el primer segundo', 'Lo normal es ≥ 70 %', 'Indica obstrucción'],
            { concept: 'base.volumenes', explain: 'Cociente bajo = obstrucción.', slide: 1, keywords: [{ label: 'primer segundo', any: ['primer segundo', '1 s'] }, { label: 'obstrucción', any: ['obstruc'] }] })]
        } },
      { id: 'z2', concept: 'base.gases', title: 'Presiones parciales', subtitle: 'PO₂ y PCO₂', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.gases', title: 'De la atmósfera al alvéolo', slide: 6, body: 'PO₂ inspirada = **FiO₂ × (Patm − 47)** ≈ 150 mmHg a nivel del mar. PAO₂ = PiO₂ − **PaCO₂/0,8** ≈ 100 mmHg. Normales arteriales: **PaO₂ 80–100**, **PaCO₂ 35–45** mmHg.',
            deeper: 'Con FiO₂ 0,40: 0,40 × 713 = 285 − 50 = 235 mmHg de PAO₂.' }],
          practice: [
            num('z2-p1', 'FiO₂ 0,40, nivel del mar, PaCO₂ 40. PAO₂ =', 235.2, 'mmHg', { concept: 'base.gases', label: 'PAO₂', slide: 6, tol: 0.01, hint: '0,40 × 713 − 40/0,8.', traps: [{ value: 285.2, note: 'Falta restar PaCO₂/0,8.' }], solution: ['0,40 × 713 = 285,2', '285,2 − 50 = 235,2 mmHg'], explain: '235,2 mmHg.' }),
            q('z2-p2', 'PaCO₂ normal:', [{ text: '35–45 mmHg', correct: true }, { text: '80–100 mmHg', note: 'Esa es la PaO₂.' }, { text: '5–10 mmHg', note: 'Muy baja.' }], { concept: 'base.gases', explain: '35–45.', slide: 6, hint: 'Cerca de 40.' })
          ],
          transfer: [write('z2-w1', 'Explica por qué al subir la PaCO₂ baja la PAO₂.', 'Porque en el alvéolo los gases comparten la presión total: si se acumula más CO₂ por hipoventilación, queda menos espacio para el O₂, y la ecuación del gas alveolar resta PaCO₂/0,8 a la PO₂ inspirada.',
            ['Los gases comparten la presión alveolar', 'Más CO₂ deja menos O₂', 'PAO₂ = PiO₂ − PaCO₂/0,8'],
            { concept: 'base.gases', explain: 'Gas alveolar.', slide: 6, keywords: [{ label: 'CO₂ ocupa espacio', any: ['espacio', 'comparten', 'desplaz'] }, { label: 'ecuación', any: ['0,8', 'ecuaci'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-espiro', title: 'Cociente VEF₁/CVF', formula: 'VEF₁/CVF < 0,70 → obstructivo', concepts: ['fis.patron'], vars: [['VEF₁', 'volumen en el primer segundo', 'L'], ['CVF', 'capacidad vital forzada', 'L']],
        what: 'Separar obstructivo de restrictivo.', when: 'Toda espirometría.', example: '1,45/3,10 = 0,47 → obstructivo.', deeper: 'Restrictivo: CPT baja con cociente normal o alto.',
        sources: [{ label: 'Silbernagl y Lang; GOLD 2024', slide: 2 }],
        calc: { inputs: [{ id: 'v', label: 'VEF₁ (L)', value: 1.45, step: 0.01 }, { id: 'c', label: 'CVF (L)', value: 3.1, step: 0.01 }], run: v => { const r = v.v / v.c; return 'VEF₁/CVF = **' + r.toFixed(2).replace('.', ',') + '** → ' + (r < 0.7 ? '**obstructivo**' : 'sin obstrucción'); } } },
      { id: 'f-aa', title: 'Gas alveolar y gradiente A-a', formula: 'PAO₂ = FiO₂ (Patm − 47) − PaCO₂/0,8 · A-a = PAO₂ − PaO₂', concepts: ['fis.hipoxemia'], vars: [['FiO₂', 'fracción inspirada de O₂', '0,21 en aire'], ['Patm', 'presión atmosférica', '760 mmHg al nivel del mar'], ['PaCO₂', 'CO₂ arterial', 'mmHg']],
        what: 'Saber si el pulmón transfiere bien el O₂.', when: 'Toda hipoxemia.', example: 'PaO₂ 60, PaCO₂ 40 → A-a 39,7 (pulmón).', deeper: 'A-a normal < ~15 mmHg (edad/4 + 4).',
        sources: [{ label: 'Silbernagl y Lang, gases sanguíneos', slide: 6 }],
        calc: { inputs: [{ id: 'fi', label: 'FiO₂', value: 0.21, step: 0.01 }, { id: 'pb', label: 'Patm (mmHg)', value: 760, step: 1 }, { id: 'co2', label: 'PaCO₂', value: 40, step: 1 }, { id: 'o2', label: 'PaO₂', value: 60, step: 1 }], run: v => { const pa = v.fi * (v.pb - 47) - v.co2 / 0.8; return 'PAO₂ = **' + pa.toFixed(1).replace('.', ',') + '** · A-a = **' + (pa - v.o2).toFixed(1).replace('.', ',') + ' mmHg**'; } } }
    ],
    recipes: [],
    mini: {
      'base.volumenes': { idea: 'Cuánto sale en el primer segundo.', steps: ['CVF: todo', 'VEF₁: primer segundo', 'Normal ≥ 0,70'], check: { prompt: '3/4 =', options: [{ text: '0,75 (normal)', correct: true }, { text: '1,33', note: 'Al revés.' }], explain: '0,75.' } },
      'base.gases': { idea: 'El CO₂ le quita espacio al O₂.', steps: ['PiO₂ ≈ 150', 'PAO₂ = 150 − PaCO₂/0,8', 'PaO₂ 80–100; PaCO₂ 35–45'], check: { prompt: 'PaCO₂ 40 → PAO₂ ≈', options: [{ text: '100', correct: true }, { text: '150', note: 'Falta restar 50.' }], explain: '150 − 50.' } },
      'fis.patron': { idea: 'Sacar (obstructivo) o llenar (restrictivo).', steps: ['Cociente < 0,70 → obstructivo', 'CPT baja → restrictivo', 'Difusión → parénquima'], check: { prompt: 'Fibrosis →', options: [{ text: 'Restrictivo', correct: true }, { text: 'Obstructivo', note: 'Cuesta llenar.' }], explain: 'Restrictivo.' } },
      'fis.asma': { idea: 'Asma reversible; EPOC por tabaco y poco reversible.', steps: ['Asma: inflamación + hiperreactividad', 'EPOC: bronquitis + enfisema', 'Enfisema: elastasa > α1-AT'], check: { prompt: 'Reversible con salbutamol:', options: [{ text: 'Asma', correct: true }, { text: 'EPOC', note: 'Poco reversible.' }], explain: 'Asma.' } },
      'fis.hipoxemia': { idea: 'El gradiente A-a separa bomba de pulmón.', steps: ['PAO₂ y A-a', 'Normal → hipoventilación', 'Alto → V/Q, shunt, difusión'], check: { prompt: 'No mejora con O₂:', options: [{ text: 'Shunt', correct: true }, { text: 'V/Q', note: 'Ese sí mejora.' }], explain: 'Shunt.' } },
      'fis.insuficiencia': { idea: 'Tipo 2 = sube el CO₂.', steps: ['Tipo 1: PaO₂ < 60', 'Tipo 2: PaCO₂ > 45–50', 'EPOC: O₂ controlado'], check: { prompt: 'Opioides →', options: [{ text: 'Tipo 2', correct: true }, { text: 'Tipo 1', note: 'Sube el CO₂.' }], explain: 'Bomba.' } }
    },
    deep: {},
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', 'VEF₁/CVF normal:', [{ text: '≥ 0,70', correct: true }, { text: '< 0,50', note: 'Muy bajo.' }, { text: '= 1 siempre', note: 'Nunca sale todo en un segundo.' }], { concept: 'base.volumenes', explain: '≥ 0,70.', slide: 1 }) },
      { level: 1, item: q('dx-2', 'PaO₂ arterial normal:', [{ text: '80–100 mmHg', correct: true }, { text: '35–45 mmHg', note: 'Esa es la PaCO₂.' }, { text: '150 mmHg', note: 'Esa es la inspirada.' }], { concept: 'base.gases', explain: '80–100.', slide: 6 }) },
      { level: 2, item: q('dx-3', 'VEF₁/CVF 0,85 con CPT baja:', [{ text: 'Restrictivo', correct: true }, { text: 'Obstructivo', misconception: 'obs-res' }, { text: 'Normal', note: 'CPT baja.' }], { concept: 'fis.patron', explain: 'Restrictivo.', slide: 2 }) },
      { level: 2, item: q('dx-4', 'Fumador, obstrucción poco reversible:', [{ text: 'EPOC', correct: true }, { text: 'Asma', misconception: 'asthma-copd' }, { text: 'Fibrosis', misconception: 'obs-res' }], { concept: 'fis.asma', explain: 'EPOC.', slide: 3 }) },
      { level: 2, item: q('dx-5', 'Hipoxemia con A-a normal:', [{ text: 'Hipoventilación', correct: true }, { text: 'Shunt', misconception: 'aa-gradient' }, { text: 'Fibrosis', note: 'Daría A-a alto.' }], { concept: 'fis.hipoxemia', explain: 'Pulmón sano.', slide: 5 }) },
      { level: 3, item: q('dx-6', 'No corrige con O₂ al 100 %:', [{ text: 'Shunt', correct: true }, { text: 'V/Q bajo', misconception: 'shunt-o2' }, { text: 'Altura', note: 'Corrige.' }], { concept: 'fis.hipoxemia', explain: 'Shunt.', slide: 5 }) },
      { level: 3, item: q('dx-7', 'PaO₂ 55, PaCO₂ 30:', [{ text: 'Tipo 1', correct: true }, { text: 'Tipo 2', misconception: 'resp-failure' }, { text: 'Normal', note: 'PaO₂ < 60.' }], { concept: 'fis.insuficiencia', explain: 'Tipo 1.', slide: 7 }) }
    ] }
  };
})();
