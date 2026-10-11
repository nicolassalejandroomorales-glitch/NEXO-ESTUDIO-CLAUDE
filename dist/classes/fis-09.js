/* Fisiopatología · PEP 1 · Digestivo: barrera, secreción, motilidad e hígado (jueves 12 de noviembre).
   Las clases de digestivo (Dr. Cárdenas, 22 y 23 de octubre y 5 de noviembre) aún no están en el Drive: el contenido sale de la bibliografía básica del programa
   (Silbernagl y Lang, Fisiopatología, 2011, cap. "Estómago, intestino e hígado"). Las "láminas" son secciones propias. Números recalculados en Python. */
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
  window.NexoClasses['fis-09'] = {
    id: 'fis-09',
    subject: 'fisio',
    title: 'Digestivo: barrera, secreción, motilidad e hígado',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Fisiopatología (cap. esófago, estómago, intestino, páncreas e hígado)', author: 'Silbernagl y Lang', detail: 'Bibliografía básica del programa 2026-2 (clases del Dr. Cárdenas aún no están en el Drive)', authority: 'Libro de texto' }
    },
    misconceptions: {
      'ulcer-acid': { label: 'Creíste que la úlcera es solo "exceso de ácido"', why: 'La úlcera péptica es un **desequilibrio**: **agresión** (ácido, pepsina, *H. pylori*, AINE) frente a **defensa** (moco, HCO₃⁻, prostaglandinas, flujo sanguíneo). La mayoría de las úlceras tiene ácido **normal** pero defensa disminuida (AINE) o infección por *H. pylori*.',
        prereq: { title: 'Agresión frente a defensa', mission: 'm1', block: 'm1b2' }, base: 'base.secrecion' },
      'nsaid-mech': { label: 'Equivocaste cómo dañan los AINE', why: 'Los AINE inhiben la **COX** → bajan las **prostaglandinas** → menos **moco**, menos **HCO₃⁻** y menos flujo a la mucosa. No dañan principalmente por "subir el ácido".',
        prereq: { title: 'Agresión frente a defensa', mission: 'm1', block: 'm1b2' }, base: 'base.secrecion',
        check: q('fix-aine', 'Caso corto: ¿por qué el misoprostol protege a quien toma AINE?', [{ text: 'Es un análogo de prostaglandina: repone la defensa', correct: true }, { text: 'Neutraliza el ácido directamente', note: 'No es un antiácido.' }, { text: 'Mata al H. pylori', note: 'No es antibiótico.' }], { concept: 'fis.ulcera', explain: 'Repone lo que el AINE quitó.', slide: 3 }) },
      'achalasia-erge': { label: 'Confundiste acalasia con reflujo', why: '**ERGE**: el esfínter esofágico inferior se **abre de más** (tono bajo, hernia hiatal) → el ácido sube (pirosis). **Acalasia**: el esfínter **no se relaja** (se pierden las neuronas inhibitorias del plexo mientérico) → la comida **no baja** (disfagia a sólidos y líquidos, regurgitación).',
        prereq: { title: 'Esófago: abrir y cerrar', mission: 'm1', block: 'm1b1' }, base: 'base.secrecion' },
      'diarrhea-type': { label: 'Te equivocaste de tipo de diarrea', why: '**Osmótica**: un soluto no absorbido arrastra agua (lactosa, laxantes de magnesio); **cesa con el ayuno**; brecha osmolar fecal **alta (> 100)**. **Secretora**: el epitelio secreta Cl⁻ y agua (cólera: toxina → ↑ AMPc → CFTR abierto); **persiste en ayuno**; brecha **baja (< 50)**.',
        prereq: { title: 'Diarrea y malabsorción', mission: 'm2', block: 'm2b1' }, base: 'base.agua' },
      'jaundice-type': { label: 'Clasificaste mal la ictericia', why: '**Prehepática** (hemólisis): sube la bilirrubina **no conjugada**; orina sin bilirrubina. **Hepática** (hepatitis, cirrosis): mixta. **Posthepática/colestásica** (cálculo, tumor de páncreas): sube la **conjugada** → **coluria** (orina oscura) y **acolia** (deposiciones pálidas), prurito.',
        prereq: { title: 'Hígado y páncreas', mission: 'm2', block: 'm2b2' }, base: 'base.agua' }
    },
    goal: {
      total: 100, text: 'Asegurar los 30 puntos de digestivo de la PEP 1 (reparto estimado: todavía no hay pauta)',
      questions: [
        { id: 'P7', label: 'Esófago y estómago: ERGE, acalasia y úlcera', points: 15, missions: ['m1'] },
        { id: 'P8', label: 'Diarrea, malabsorción, ictericia, cirrosis y pancreatitis', points: 15, missions: ['m2'] }
      ],
      rest: [{ label: 'Nervioso', points: 40, note: 'clases fis-01 y fis-02' }, { label: 'Respiratorio', points: 30, note: 'clase fis-06' }]
    },
    glossary: [
      { term: 'ERGE', mission: 'm1', def: 'Enfermedad por reflujo gastroesofágico: el contenido gástrico sube al esófago y daña su mucosa.', simple: 'El ácido del estómago sube al esófago.', simpler: 'Una puerta que no cierra bien.' },
      { term: 'Acalasia', mission: 'm1', def: 'Falta de relajación del esfínter esofágico inferior y de peristalsis por pérdida de neuronas inhibitorias del plexo mientérico.', simple: 'La puerta del estómago no se abre.', simpler: 'Una puerta trabada.' },
      { term: 'Úlcera péptica', mission: 'm1', def: 'Pérdida de mucosa que atraviesa la muscular de la mucosa en estómago o duodeno.', simple: 'Un hoyo en la pared del estómago o duodeno.', simpler: 'Un bache en el camino.' },
      { term: 'Brecha osmolar fecal', mission: 'm2', def: '290 − 2([Na⁺] + [K⁺]) en las heces; alta en la diarrea osmótica y baja en la secretora.', simple: 'Cuánto de la osmolaridad de las heces NO es sal.', simpler: 'Lo que falta para completar la cuenta.' },
      { term: 'Coluria', mission: 'm2', def: 'Orina oscura por bilirrubina conjugada (hidrosoluble).', simple: 'Orina color té.', simpler: 'Orina como Coca-Cola.' },
      { term: 'Hipertensión portal', mission: 'm2', def: 'Aumento de presión en la vena porta, típicamente por cirrosis.', simple: 'La sangre del intestino no puede pasar bien por el hígado.', simpler: 'Un taco en la autopista hacia el hígado.' }
    ],
    concepts: [
      { id: 'base.secrecion', title: 'Secreción gástrica y protección', root: true },
      { id: 'base.agua', title: 'Absorción de agua y bilirrubina', root: true },
      { id: 'fis.esofago', mission: 'm1', title: 'ERGE y acalasia', needs: ['base.secrecion'] },
      { id: 'fis.ulcera', mission: 'm1', title: 'Úlcera péptica: agresión y defensa', needs: ['base.secrecion'] },
      { id: 'fis.diarrea', mission: 'm2', title: 'Diarrea y malabsorción', needs: ['base.agua'] },
      { id: 'fis.higado', mission: 'm2', title: 'Ictericia, cirrosis y pancreatitis', needs: ['base.agua'] }
    ],
    curiosities: [
      { text: 'Barry Marshall se tomó un cultivo de Helicobacter pylori en 1984 para probar que causaba gastritis. Con Robin Warren ganó el Nobel de Medicina 2005.', slide: 3 },
      { text: 'El cólera puede hacer perder hasta 1 litro de diarrea por hora; la solución de rehidratación oral (glucosa + sodio) aprovecha el cotransportador SGLT1, que la toxina no bloquea.', slide: 5 },
      { text: 'El hígado puede regenerarse incluso tras perder dos tercios de su masa; por eso funciona el trasplante de donante vivo.', slide: 7 }
    ],
    slideImages: {},
    slides: {
      1: { title: 'Secreción gástrica', bullets: ['Células parietales: HCl (H⁺/K⁺-ATPasa) y factor intrínseco', 'Estímulos: gastrina, histamina (H₂), acetilcolina', 'Defensa: moco, HCO₃⁻, prostaglandinas, flujo sanguíneo'] },
      2: { title: 'Esófago', bullets: ['ERGE: ↓ tono del EEI, hernia hiatal → pirosis; Barrett (metaplasia)', 'Acalasia: el EEI no se relaja (pérdida de neuronas inhibitorias NO/VIP) → disfagia'] },
      3: { title: 'Úlcera péptica', bullets: ['Agresión: ácido, pepsina, H. pylori, AINE', 'Defensa: moco, HCO₃⁻, prostaglandinas', 'Tratamiento: IBP, erradicar H. pylori, suspender AINE'] },
      4: { title: 'H. pylori y Zollinger-Ellison', bullets: ['H. pylori: ureasa → NH₃; inflamación; ↑ gastrina', 'Gastrinoma: úlceras múltiples y refractarias'] },
      5: { title: 'Diarrea', bullets: ['Osmótica: cesa en ayuno, brecha > 100', 'Secretora: persiste en ayuno, brecha < 50 (cólera: ↑ AMPc → CFTR)', 'Inflamatoria: sangre, fiebre, leucocitos', 'Brecha = 290 − 2([Na⁺] + [K⁺])'] },
      6: { title: 'Malabsorción', bullets: ['Insuficiencia pancreática: esteatorrea (↓ lipasa)', 'Celíaca: gluten → atrofia de vellosidades', 'Déficit de lactasa: diarrea osmótica'] },
      7: { title: 'Hígado: ictericia y cirrosis', bullets: ['Pre: no conjugada · post: conjugada con coluria y acolia', 'Cirrosis: hipertensión portal (ascitis, várices, esplenomegalia)', 'Insuficiencia: ↓ albúmina, ↓ factores de coagulación, encefalopatía (NH₃)'] },
      8: { title: 'Pancreatitis aguda', bullets: ['Activación de tripsina dentro del páncreas → autodigestión', 'Causas: cálculos biliares y alcohol', '↑ lipasa y amilasa; dolor en cinturón'] }
    },
    missions: [
      {
        id: 'm1', title: 'Esófago y estómago', subtitle: 'ERGE, acalasia y úlcera péptica', minutes: 25, slides: '1–4', pep: 'P7: esófago y estómago',
        stages: {
          hook: { title: 'El científico que se tomó una bacteria', sage: 'Durante décadas se creyó que la úlcera era "de estrés y de ácido". En 1984 un médico se tomó un cultivo de Helicobacter pylori, se enfermó de gastritis y cambió la medicina. La úlcera tenía otra explicación.',
            text: 'En la PEP: explicar los mecanismos (qué agrede, qué defiende) y relacionarlos con el tratamiento. Como futuro químico farmacéutico, el **porqué del fármaco** es la parte importante.' },
          diagnostic: [
            q('m1-d1', '¿Cómo dañan el estómago los AINE?', [{ text: 'Inhiben la COX y bajan las prostaglandinas protectoras', correct: true }, { text: 'Aumentan mucho la secreción de ácido', misconception: 'nsaid-mech' }, { text: 'Infectan la mucosa', note: 'Eso es H. pylori.' }], { concept: 'fis.ulcera', explain: 'Bajan la defensa.', slide: 3 }),
            q('m1-d2', 'Disfagia a sólidos y líquidos desde el inicio, con regurgitación de comida sin digerir. Sugiere…', [{ text: 'Acalasia', correct: true }, { text: 'ERGE', misconception: 'achalasia-erge' }, { text: 'Úlcera duodenal', note: 'No da disfagia.' }], { concept: 'fis.esofago', explain: 'El esfínter no se abre.', slide: 2 })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.secrecion', title: 'Desde cero: ácido y protección', slide: 1, body: 'La **célula parietal** secreta HCl con la **bomba H⁺/K⁺-ATPasa**; la estimulan la **gastrina**, la **histamina** (receptor H₂) y la **acetilcolina**. La mucosa se protege con **moco**, **bicarbonato**, buen **flujo sanguíneo** y **prostaglandinas** (que estimulan moco y HCO₃⁻).',
              deeper: 'Por eso hay dos formas de bajar el ácido: bloquear la bomba (omeprazol, IBP) o bloquear el receptor H₂ (famotidina). Los IBP son más potentes porque actúan en el paso final.' }
          ],
          explain: [],
          transfer: [
            q('m1-t1', 'Estilo PEP: mujer de 68 años con artrosis que toma ibuprofeno diario; consulta por dolor epigástrico y melena. ¿Mecanismo de la lesión y medida farmacológica más lógica?', [{ text: 'AINE inhibe COX → ↓ prostaglandinas → ↓ defensa; suspender el AINE e iniciar un IBP', correct: true }, { text: 'Exceso de gastrina por un tumor; cirugía inmediata', note: 'Nada sugiere un gastrinoma.' }, { text: 'Exceso de ácido por estrés; antiácidos', misconception: 'ulcer-acid' }],
              { concept: 'fis.ulcera', explain: 'Úlcera por AINE: falla la defensa.', slide: 3 }),
            write('m1-w1', 'Enséñale a tu compañero: ¿por qué la úlcera péptica se explica como una "balanza"?', 'Porque la mucosa está siempre expuesta a agresores (ácido, pepsina, Helicobacter pylori, AINE) y se protege con moco, bicarbonato, prostaglandinas y flujo sanguíneo. La úlcera aparece cuando la balanza se inclina hacia la agresión: por ejemplo, los AINE bajan las prostaglandinas y la defensa, aunque el ácido sea normal. El tratamiento busca reequilibrarla: bajar el ácido con IBP, erradicar H. pylori o suspender el AINE.',
              ['Agresores: ácido, pepsina, H. pylori, AINE', 'Defensas: moco, HCO₃⁻, prostaglandinas, flujo', 'Úlcera = la balanza se inclina a la agresión; el tratamiento la reequilibra'],
              { concept: 'fis.ulcera', explain: 'Agresión frente a defensa.', slide: 3, teach: true, keywords: [{ label: 'agresión', any: ['ácido', 'acido', 'pylori', 'aine'] }, { label: 'defensa', any: ['moco', 'bicarb', 'prostag'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **esófago: abrir y cerrar**.',
            pretest: q('m1-pre1', 'Adivina antes: la pirosis (ardor que sube) aparece cuando el esfínter esofágico inferior…', [{ text: 'Se abre cuando no debe', correct: true }, { text: 'No se abre nunca', misconception: 'achalasia-erge' }, { text: 'Funciona normal', note: 'Algo falla.' }], { concept: 'fis.esofago', explain: 'Reflujo.', slide: 2 }),
            explain: [
              { id: 'm1b1', concept: 'fis.esofago', title: 'Esófago: abrir y cerrar', slide: 2, body: '**ERGE**: el **esfínter esofágico inferior** (EEI) pierde tono o se relaja de más (hernia hiatal, obesidad, embarazo, comidas grasas, tabaco) → el ácido sube → **pirosis** y regurgitación ácida. Si persiste: esofagitis y **esófago de Barrett** (metaplasia intestinal, riesgo de adenocarcinoma). **Acalasia**: se pierden las neuronas **inhibitorias** (NO, VIP) del plexo mientérico → el EEI **no se relaja** y no hay peristalsis → **disfagia** a sólidos **y** líquidos, regurgitación, esófago dilatado ("pico de pájaro").',
                deeper: 'Una obstrucción mecánica (tumor) da disfagia **primero a sólidos** y luego a líquidos; un trastorno motor como la acalasia da disfagia a ambos desde el inicio.' }
            ],
            practice: [
              classify('m1-p1', '¿ERGE o acalasia?', [['e', 'ERGE'], ['a', 'Acalasia']],
                [['a', 'Pirosis después de comer', 'e'], ['b', 'EEI que no se relaja', 'a'], ['c', 'Hernia hiatal', 'e'], ['d', 'Pérdida de neuronas inhibitorias', 'a'], ['e', 'Esófago de Barrett', 'e'], ['f', 'Disfagia a sólidos y líquidos', 'a']],
                { concept: 'fis.esofago', explain: 'Se abre de más frente a no se abre.', slide: 2, hint: '¿El problema es que sube el ácido o que no baja la comida?', misconception: 'achalasia-erge' }),
              q('m1-p2', 'Disfagia que empezó con la carne y ahora también con líquidos, con baja de peso en un fumador de 65 años. Sospechas…', [{ text: 'Obstrucción mecánica (cáncer de esófago)', correct: true }, { text: 'Acalasia', note: 'La acalasia da disfagia a ambos desde el inicio.', misconception: 'achalasia-erge' }, { text: 'ERGE no complicada', note: 'No explica la disfagia progresiva.' }],
                { concept: 'fis.esofago', explain: 'Primero sólidos, luego líquidos = obstrucción que crece.', slide: 2, hint: '¿Cómo progresó la disfagia?' }),
              order('m1-p3', 'Ordena la progresión de un reflujo no tratado:', [['a', 'EEI con tono bajo'], ['b', 'Reflujo ácido repetido'], ['c', 'Esofagitis'], ['d', 'Esófago de Barrett (metaplasia)'], ['e', 'Adenocarcinoma']], ['a', 'b', 'c', 'd', 'e'],
                { concept: 'fis.esofago', direction: 'En el tiempo.', explain: 'Daño crónico → metaplasia → neoplasia.', slide: 2, hint: 'La metaplasia viene antes del cáncer.' })
            ],
            rule: { title: 'Regla del sabio: el esófago', concept: 'fis.esofago', steps: ['Se abre de más → ERGE (pirosis); crónico → Barrett', 'No se abre → acalasia (disfagia a todo desde el inicio)', 'Sólidos primero, luego líquidos → obstrucción'] } },
          { id: 'r2', intro: 'Parte 2: **úlcera: agresión frente a defensa**.',
            pretest: q('m1-pre2', 'Adivina antes: la mayoría de las úlceras duodenales se asocia a…', [{ text: 'Helicobacter pylori', correct: true }, { text: 'Estrés emocional', misconception: 'ulcer-acid' }, { text: 'Comidas picantes', note: 'No causan úlcera.' }], { concept: 'fis.ulcera', explain: 'H. pylori y AINE son las grandes causas.', slide: 3 }),
            explain: [
              { id: 'm1b2', concept: 'fis.ulcera', title: 'Agresión frente a defensa', slide: 3, body: '**Agresión**: ácido, pepsina, ***H. pylori*** (su **ureasa** produce NH₃ que neutraliza el ácido a su alrededor; inflama la mucosa y altera la gastrina) y **AINE** (inhiben la **COX** → ↓ **prostaglandinas** → ↓ moco, ↓ HCO₃⁻, ↓ flujo). **Defensa**: moco, HCO₃⁻, prostaglandinas, flujo, renovación epitelial. Tratamiento según el mecanismo: **IBP** (bloquean la H⁺/K⁺-ATPasa), **erradicar *H. pylori*** (IBP + 2 antibióticos), suspender el AINE o proteger con misoprostol. Úlceras múltiples y refractarias → pensar en **gastrinoma** (Zollinger-Ellison).',
                deeper: 'La ureasa es también la base del test del aire espirado: se da urea marcada con ¹³C y, si hay H. pylori, aparece ¹³CO₂ en el aliento.' }
            ],
            practice: [
              classify('m1-p4', '¿Agresión o defensa de la mucosa?', [['ag', 'Agresión'], ['de', 'Defensa']],
                [['a', 'Prostaglandina E₂', 'de'], ['b', 'Pepsina', 'ag'], ['c', 'Bicarbonato', 'de'], ['d', 'Ibuprofeno', 'ag'], ['e', 'Moco', 'de'], ['f', 'Helicobacter pylori', 'ag']],
                { concept: 'fis.ulcera', explain: 'La balanza.', slide: 3, hint: '¿Daña o protege?', misconception: 'ulcer-acid' }),
              match('m1-p5', 'Une cada fármaco con su mecanismo:', [['Omeprazol', 'Inhibe la H⁺/K⁺-ATPasa'], ['Famotidina', 'Bloquea el receptor H₂'], ['Misoprostol', 'Análogo de prostaglandina'], ['Claritromicina + amoxicilina', 'Erradican H. pylori']],
                { concept: 'fis.ulcera', explain: 'Cada fármaco corrige un eslabón.', slide: 3, hint: 'IBP = bomba de protones.', misconception: 'nsaid-mech' }),
              spot('m1-fx1', 'Un aprendiz explicó la úlcera por AINE. ¿Dónde se equivocó?', ['El AINE inhibe la ciclooxigenasa', 'Por eso aumenta mucho la producción de ácido', 'Se debilita la barrera y aparece la úlcera'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'Bajan las prostaglandinas: menos moco, HCO₃⁻ y flujo', correct: true }, { text: 'Aumenta la gastrina', note: 'Ese no es el mecanismo de los AINE.' }] },
                { concept: 'fis.ulcera', slide: 3, stepNotes: { 0: 'Correcto.', 2: 'Correcto.' }, explain: 'Cae la defensa, no sube el ácido.', hint: '¿Qué fabrica la COX?', misconception: 'nsaid-mech' })
            ],
            rule: { title: 'Regla del sabio: la úlcera', concept: 'fis.ulcera', steps: ['Úlcera = agresión > defensa', 'AINE: ↓ prostaglandinas; H. pylori: inflamación (ureasa)', 'IBP + erradicar + suspender AINE; refractaria → gastrinoma'] } }
        ]
      },
      {
        id: 'm2', title: 'Intestino, hígado y páncreas', subtitle: 'Diarrea, malabsorción, ictericia, cirrosis y pancreatitis', minutes: 30, slides: '5–8', pep: 'P8: intestino e hígado',
        stages: {
          hook: { title: 'Dos diarreas en ayuno', sage: 'Dos pacientes con diarrea quedan en ayuno en el hospital. A uno se le corta en un día. El otro sigue perdiendo litros. Sin cultivos, ya sabes mucho del mecanismo.',
            text: 'En la PEP: clasificar diarreas (con la brecha osmolar), reconocer malabsorción, tipos de ictericia y las consecuencias de la cirrosis.' },
          diagnostic: [
            q('m2-d1', 'Diarrea que persiste en ayuno, con brecha osmolar fecal de 20. Es…', [{ text: 'Secretora', correct: true }, { text: 'Osmótica', misconception: 'diarrhea-type' }, { text: 'No se puede saber', note: 'Ayuno + brecha baja lo dicen.' }], { concept: 'fis.diarrea', explain: 'El epitelio secreta sal.', slide: 5 }),
            q('m2-d2', 'Ictericia con orina oscura y deposiciones blancas sugiere…', [{ text: 'Obstrucción biliar (posthepática)', correct: true }, { text: 'Hemólisis', misconception: 'jaundice-type' }, { text: 'Normalidad', note: 'No es normal.' }], { concept: 'fis.higado', explain: 'Coluria y acolia: bilirrubina conjugada que no llega al intestino.', slide: 7 })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.agua', title: 'Desde cero: agua y bilirrubina', slide: 5, body: 'El intestino absorbe agua **siguiendo a los solutos** (sobre todo Na⁺): si un soluto no se absorbe, retiene agua en la luz; si el epitelio secreta Cl⁻, el agua sale con él. La **bilirrubina** viene de la hemoglobina: es **no conjugada** (liposoluble, va unida a albúmina), el hígado la **conjuga** (hidrosoluble) y la excreta por la bilis; en el intestino da color café a las heces.',
              deeper: 'Por eso la bilirrubina no conjugada no aparece en la orina (va unida a albúmina) y la conjugada sí (es hidrosoluble): la coluria indica bilirrubina conjugada alta.' }
          ],
          explain: [],
          transfer: [
            num('m2-t1', 'Estilo PEP: en la diarrea de un paciente, Na⁺ fecal = 30 mmol/L y K⁺ fecal = 20 mmol/L. Calcula la brecha osmolar fecal (290 − 2([Na⁺] + [K⁺])).', 190, 'mOsm/kg',
              { concept: 'fis.diarrea', label: 'brecha', slide: 5, tol: 0.01, traps: [{ value: 240, note: 'Falta multiplicar por 2 (cada catión va con su anión).' }, { value: 100, note: 'Ese es 2([Na⁺] + [K⁺]): falta restarlo a 290.' }],
                solution: ['2 × (30 + 20) = 100', 'Brecha = 290 − 100 = 190', '> 100 → diarrea osmótica (un soluto no absorbido: lactosa, Mg²⁺, sorbitol)'], explain: '190: osmótica.' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿por qué la cirrosis produce ascitis?', 'En la cirrosis la fibrosis del hígado dificulta el paso de la sangre portal y sube la presión en la vena porta (hipertensión portal). Además el hígado fabrica menos albúmina, así que baja la presión oncótica del plasma. La combinación de más presión hidrostática y menos presión oncótica hace que el líquido salga a la cavidad peritoneal; la activación del sistema renina-angiotensina-aldosterona retiene sodio y agua y lo empeora.',
              ['Hipertensión portal (↑ presión hidrostática)', '↓ albúmina (↓ presión oncótica)', 'Retención renal de Na⁺ y agua (aldosterona)'],
              { concept: 'fis.higado', explain: 'Starling en el peritoneo.', slide: 7, teach: true, keywords: [{ label: 'hipertensión portal', any: ['portal'] }, { label: 'albúmina', any: ['albúm', 'album', 'oncót', 'oncot'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **diarrea y malabsorción**.',
            pretest: q('m2-pre1', 'Adivina antes: una persona con déficit de lactasa toma leche y tiene diarrea porque la lactosa…', [{ text: 'Se queda en el intestino y arrastra agua', correct: true }, { text: 'Hace secretar cloruro al epitelio', misconception: 'diarrhea-type' }, { text: 'Infecta el intestino', note: 'No es infecciosa.' }], { concept: 'fis.diarrea', explain: 'Diarrea osmótica.', slide: 5 }),
            explain: [
              { id: 'm2b1', concept: 'fis.diarrea', title: 'Diarrea y malabsorción', slide: 5, body: '**Osmótica**: un soluto no absorbido retiene agua (déficit de lactasa, laxantes de Mg²⁺, sorbitol); **cesa con el ayuno**; brecha **> 100**. **Secretora**: el epitelio secreta Cl⁻ (toxina del **cólera** → ↑ **AMPc** → canal **CFTR** abierto; tumores secretores de VIP); **persiste en ayuno**; brecha **< 50**. **Inflamatoria**: sangre, fiebre, leucocitos (Shigella, colitis ulcerosa). **Malabsorción**: **insuficiencia pancreática** (↓ lipasa → **esteatorrea**, déficit de vitaminas liposolubles A, D, E, K), **enfermedad celíaca** (gluten → atrofia de vellosidades). Brecha = **290 − 2([Na⁺] + [K⁺])**.',
                deeper: 'La rehidratación oral funciona incluso en el cólera porque el cotransportador Na⁺-glucosa (SGLT1) sigue funcionando: la glucosa arrastra Na⁺ y el agua lo sigue.' }
            ],
            practice: [
              classify('m2-p1', '¿Osmótica o secretora?', [['o', 'Osmótica'], ['s', 'Secretora']],
                [['a', 'Cesa con el ayuno', 'o'], ['b', 'Cólera', 's'], ['c', 'Déficit de lactasa', 'o'], ['d', 'Brecha osmolar 25', 's'], ['e', 'Laxante de magnesio', 'o'], ['f', '↑ AMPc en el enterocito', 's']],
                { concept: 'fis.diarrea', explain: 'Soluto que retiene agua frente a epitelio que secreta.', slide: 5, hint: '¿Qué pasa con el ayuno?', misconception: 'diarrhea-type' }),
              num('m2-p2', 'Na⁺ fecal 95 y K⁺ fecal 45 mmol/L. Calcula la brecha osmolar fecal.', 10, 'mOsm/kg',
                { concept: 'fis.diarrea', label: 'brecha', slide: 5, tol: 0.05, hint: '290 − 2(95 + 45).', traps: [{ value: 150, note: 'Falta multiplicar por 2.' }], solution: ['2 × 140 = 280', '290 − 280 = 10 → secretora'], explain: '10: secretora.' }),
              q('m2-p3', 'Deposiciones grasosas, flotantes y malolientes, con baja de peso, en un alcohólico crónico. ¿Mecanismo más probable?', [{ text: 'Insuficiencia pancreática exocrina: falta lipasa', correct: true }, { text: 'Diarrea secretora por toxina', misconception: 'diarrhea-type' }, { text: 'Déficit de lactasa', note: 'No da esteatorrea.' }],
                { concept: 'fis.diarrea', explain: 'Esteatorrea por pancreatitis crónica.', slide: 6, hint: 'Grasa en las heces → ¿quién digiere grasa?' })
            ],
            rule: { title: 'Regla del sabio: la diarrea', concept: 'fis.diarrea', steps: ['Cesa en ayuno y brecha > 100 → osmótica', 'Persiste en ayuno y brecha < 50 → secretora', 'Grasa en heces → malabsorción (páncreas, celíaca)'] } },
          { id: 'r2', intro: 'Parte 2: **hígado y páncreas**.',
            pretest: q('m2-pre2', 'Adivina antes: en la cirrosis, ¿por qué sangran más fácil?', [{ text: 'El hígado fabrica menos factores de coagulación', correct: true }, { text: 'Tienen más plaquetas', note: 'Suelen tener menos (bazo grande).' }, { text: 'Por la bilirrubina', note: 'No es la causa.' }], { concept: 'fis.higado', explain: 'Falla de síntesis.', slide: 7 }),
            explain: [
              { id: 'm2b2', concept: 'fis.higado', title: 'Hígado y páncreas', slide: 7, body: '**Ictericia**: **prehepática** (hemólisis) → bilirrubina **no conjugada**, sin coluria; **hepática** (hepatitis, cirrosis) → mixta; **posthepática** (cálculo en el colédoco, cáncer de cabeza de páncreas) → **conjugada**, **coluria**, **acolia**, prurito. **Cirrosis** (alcohol, hepatitis B/C, hígado graso): fibrosis → **hipertensión portal** (**ascitis**, **várices esofágicas**, esplenomegalia) e **insuficiencia hepática** (↓ **albúmina**, ↓ **factores de coagulación** → INR alto, **encefalopatía** por NH₃). **Pancreatitis aguda** (cálculos biliares, alcohol): la **tripsina** se activa **dentro** del páncreas → autodigestión → dolor en cinturón, **↑ lipasa** y amilasa.',
                deeper: 'Fármacos: la lactulosa trata la encefalopatía (acidifica el colon: NH₃ → NH₄⁺, que no se absorbe); los betabloqueadores no selectivos bajan la presión portal y previenen el sangrado de várices; la espironolactona (antialdosterónico) trata la ascitis.' }
            ],
            practice: [
              classify('m2-p4', '¿Prehepática o posthepática?', [['pre', 'Prehepática'], ['post', 'Posthepática']],
                [['a', 'Anemia hemolítica', 'pre'], ['b', 'Coluria y acolia', 'post'], ['c', 'Bilirrubina no conjugada alta', 'pre'], ['d', 'Cálculo en el colédoco', 'post'], ['e', 'Prurito intenso', 'post']],
                { concept: 'fis.higado', explain: '¿Se produce de más o no puede salir?', slide: 7, hint: 'La coluria es de la conjugada.', misconception: 'jaundice-type' }),
              match('m2-p5', 'Une cada consecuencia de la cirrosis con su causa:', [['Ascitis', 'Hipertensión portal + ↓ albúmina'], ['INR prolongado', '↓ síntesis de factores de coagulación'], ['Encefalopatía', 'NH₃ que el hígado no elimina'], ['Várices esofágicas', 'Circulación colateral por hipertensión portal']],
                { concept: 'fis.higado', explain: 'Dos problemas: presión portal y falla de síntesis.', slide: 7, hint: '¿Es por la presión o por lo que el hígado deja de hacer?' }),
              order('m2-p6', 'Ordena la pancreatitis aguda por cálculo:', [['a', 'Un cálculo obstruye la ampolla de Vater'], ['b', 'Sube la presión en el conducto pancreático'], ['c', 'La tripsina se activa dentro del páncreas'], ['d', 'Autodigestión e inflamación'], ['e', 'Dolor en cinturón y ↑ lipasa']], ['a', 'b', 'c', 'd', 'e'],
                { concept: 'fis.higado', direction: 'De la causa al signo.', explain: 'Autodigestión.', slide: 8, hint: 'La tripsina activa a las demás enzimas.' })
            ],
            rule: { title: 'Regla del sabio: hígado y páncreas', concept: 'fis.higado', steps: ['No conjugada sin coluria → pre; conjugada con coluria y acolia → post', 'Cirrosis = hipertensión portal + falla de síntesis', 'Pancreatitis: tripsina activada adentro → ↑ lipasa'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.secrecion', title: 'Secreción gástrica', subtitle: 'Ácido y protección', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.secrecion', title: 'Ácido y protección', slide: 1, body: 'Célula parietal: **H⁺/K⁺-ATPasa**. Estímulos: **gastrina**, **histamina (H₂)**, **ACh**. Defensa: **moco**, **HCO₃⁻**, **prostaglandinas**, flujo.',
            deeper: 'Las prostaglandinas también bajan la secreción ácida y aumentan el flujo mucoso.' }],
          practice: [
            match('z1-p1', 'Une cada estímulo con su receptor o vía:', [['Histamina', 'Receptor H₂'], ['Acetilcolina', 'Receptor muscarínico'], ['Gastrina', 'Receptor CCK2']], { concept: 'base.secrecion', explain: 'Tres estímulos.', slide: 1, hint: 'La histamina gástrica es H₂.' }),
            q('z1-p2', 'La bomba que secreta el ácido es…', [{ text: 'H⁺/K⁺-ATPasa', correct: true }, { text: 'Na⁺/K⁺-ATPasa', note: 'Esa es de todas las células.' }, { text: 'CFTR', note: 'Es un canal de Cl⁻ intestinal.' }], { concept: 'base.secrecion', explain: 'Blanco de los IBP.', slide: 1, hint: 'Intercambia protones.' })
          ],
          transfer: [write('z1-w1', 'Explica por qué el omeprazol baja más el ácido que un antihistamínico H₂.', 'Porque el omeprazol bloquea la bomba H⁺/K⁺-ATPasa, que es el paso final común de la secreción ácida; el antihistamínico H₂ solo bloquea uno de los tres estímulos (la histamina), y la gastrina y la acetilcolina siguen actuando.',
            ['IBP bloquea el paso final (bomba)', 'Anti-H₂ bloquea solo un estímulo', 'Gastrina y ACh siguen actuando'],
            { concept: 'base.secrecion', explain: 'Paso final común.', slide: 1, keywords: [{ label: 'bomba / paso final', any: ['bomba', 'final', 'atpasa'] }, { label: 'un estímulo', any: ['estímul', 'estimul', 'histamina'] }] })]
        } },
      { id: 'z2', concept: 'base.agua', title: 'Agua y bilirrubina', subtitle: 'El agua sigue al soluto', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.agua', title: 'El agua sigue al soluto', slide: 5, body: 'El agua se mueve por **osmosis** siguiendo al Na⁺ y a otros solutos. La bilirrubina **no conjugada** es liposoluble; el hígado la **conjuga** (hidrosoluble) y la excreta en la bilis.',
            deeper: 'En el colon las bacterias la convierten en urobilinógeno y estercobilina (color café).' }],
          practice: [
            q('z2-p1', 'La bilirrubina que aparece en la orina es…', [{ text: 'La conjugada', correct: true }, { text: 'La no conjugada', note: 'Va unida a albúmina.' }, { text: 'Ninguna', note: 'La conjugada sí.' }], { concept: 'base.agua', explain: 'Hidrosoluble.', slide: 7, hint: '¿Cuál es hidrosoluble?' }),
            order('z2-p2', 'Ordena el camino de la bilirrubina:', [['a', 'Hemoglobina de glóbulos rojos viejos'], ['b', 'Bilirrubina no conjugada (con albúmina)'], ['c', 'Conjugación en el hígado'], ['d', 'Bilis al intestino'], ['e', 'Estercobilina (color de las heces)']], ['a', 'b', 'c', 'd', 'e'], { concept: 'base.agua', direction: 'En el tiempo.', explain: 'Ciclo de la bilirrubina.', slide: 7, hint: 'Empieza en el glóbulo rojo.' })
          ],
          transfer: [write('z2-w1', 'Explica por qué las heces se ponen blancas en una obstrucción biliar.', 'Porque la bilirrubina conjugada no puede llegar al intestino; sin ella no se forma la estercobilina que da el color café a las heces, así que quedan pálidas (acolia), mientras la bilirrubina conjugada se acumula en la sangre y sale por la orina (coluria).',
            ['La bilis no llega al intestino', 'Sin estercobilina no hay color café', 'La conjugada sale por la orina'],
            { concept: 'base.agua', explain: 'Acolia.', slide: 7, keywords: [{ label: 'no llega al intestino', any: ['intestin', 'no llega', 'no pasa'] }, { label: 'estercobilina', any: ['estercob', 'color'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-brecha', title: 'Brecha osmolar fecal', formula: 'Brecha = 290 − 2([Na⁺] + [K⁺])', concepts: ['fis.diarrea'], vars: [['[Na⁺]', 'sodio fecal', 'mmol/L'], ['[K⁺]', 'potasio fecal', 'mmol/L']],
        what: 'Separar diarrea osmótica de secretora.', when: 'Diarrea crónica o que no se explica.', example: 'Na 30, K 20 → 190: osmótica.', deeper: '> 100 osmótica; < 50 secretora.',
        sources: [{ label: 'Silbernagl y Lang, diarrea', slide: 5 }],
        calc: { inputs: [{ id: 'na', label: 'Na⁺ fecal', value: 30, step: 1 }, { id: 'k', label: 'K⁺ fecal', value: 20, step: 1 }], run: v => { const b = 290 - 2 * (v.na + v.k); return 'Brecha = **' + b + '** → ' + (b > 100 ? '**osmótica**' : b < 50 ? '**secretora**' : 'indeterminada'); } } }
    ],
    recipes: [],
    mini: {
      'base.secrecion': { idea: 'Ácido por la bomba; defensa por prostaglandinas.', steps: ['H⁺/K⁺-ATPasa', 'Gastrina, histamina, ACh', 'Moco, HCO₃⁻, PG'], check: { prompt: 'Blanco del omeprazol:', options: [{ text: 'H⁺/K⁺-ATPasa', correct: true }, { text: 'Receptor H₂', note: 'Ese es la famotidina.' }], explain: 'Bomba.' } },
      'base.agua': { idea: 'El agua sigue al soluto; la conjugada es hidrosoluble.', steps: ['Osmosis', 'No conjugada: liposoluble', 'Conjugada: orina'], check: { prompt: 'Coluria indica bilirrubina…', options: [{ text: 'Conjugada', correct: true }, { text: 'No conjugada', note: 'Va con albúmina.' }], explain: 'Conjugada.' } },
      'fis.esofago': { idea: 'Se abre de más (ERGE) o no se abre (acalasia).', steps: ['ERGE: pirosis', 'Barrett: metaplasia', 'Acalasia: disfagia a todo'], check: { prompt: 'Pérdida de neuronas inhibitorias:', options: [{ text: 'Acalasia', correct: true }, { text: 'ERGE', note: 'Ahí el EEI está flojo.' }], explain: 'Acalasia.' } },
      'fis.ulcera': { idea: 'Balanza: agresión > defensa.', steps: ['H. pylori y AINE', 'AINE: ↓ PG', 'IBP y erradicar'], check: { prompt: 'AINE dañan por…', options: [{ text: '↓ prostaglandinas', correct: true }, { text: '↑ ácido', note: 'Es la defensa.' }], explain: '↓ PG.' } },
      'fis.diarrea': { idea: 'Ayuno y brecha.', steps: ['Osmótica: cesa, > 100', 'Secretora: persiste, < 50', 'Esteatorrea: páncreas'], check: { prompt: 'Cólera:', options: [{ text: 'Secretora', correct: true }, { text: 'Osmótica', note: 'Persiste en ayuno.' }], explain: 'Secretora.' } },
      'fis.higado': { idea: 'Presión portal + falla de síntesis.', steps: ['Ictericia pre/post', 'Cirrosis: ascitis, várices, INR', 'Pancreatitis: tripsina'], check: { prompt: 'Acolia →', options: [{ text: 'Posthepática', correct: true }, { text: 'Prehepática', note: 'Ahí las heces son normales u oscuras.' }], explain: 'Obstrucción.' } }
    },
    deep: {},
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', 'El omeprazol inhibe…', [{ text: 'La H⁺/K⁺-ATPasa', correct: true }, { text: 'El receptor H₂', note: 'Ese es famotidina.' }, { text: 'La COX', note: 'Esos son los AINE.' }], { concept: 'base.secrecion', explain: 'Bomba.', slide: 1 }) },
      { level: 1, item: q('dx-2', 'Bilirrubina en la orina:', [{ text: 'Conjugada', correct: true }, { text: 'No conjugada', misconception: 'jaundice-type' }, { text: 'Ninguna', note: 'La conjugada sí.' }], { concept: 'base.agua', explain: 'Hidrosoluble.', slide: 7 }) },
      { level: 2, item: q('dx-3', 'Disfagia a todo desde el inicio:', [{ text: 'Acalasia', correct: true }, { text: 'ERGE', misconception: 'achalasia-erge' }, { text: 'Úlcera', note: 'No.' }], { concept: 'fis.esofago', explain: 'Trastorno motor.', slide: 2 }) },
      { level: 2, item: q('dx-4', 'Úlcera por AINE:', [{ text: '↓ prostaglandinas', correct: true }, { text: '↑ ácido', misconception: 'nsaid-mech' }, { text: 'Infección', note: 'Eso es H. pylori.' }], { concept: 'fis.ulcera', explain: 'Defensa.', slide: 3 }) },
      { level: 2, item: q('dx-5', 'Diarrea que cesa con ayuno:', [{ text: 'Osmótica', correct: true }, { text: 'Secretora', misconception: 'diarrhea-type' }, { text: 'Inflamatoria', note: 'No necesariamente cesa.' }], { concept: 'fis.diarrea', explain: 'Sin soluto, sin diarrea.', slide: 5 }) },
      { level: 3, item: q('dx-6', 'Na⁺ 40, K⁺ 30 fecales → brecha', [{ text: '150: osmótica', correct: true }, { text: '220: osmótica', note: 'Falta multiplicar por 2.' }, { text: '150: secretora', misconception: 'diarrhea-type' }], { concept: 'fis.diarrea', explain: '290 − 140.', slide: 5 }) },
      { level: 3, item: q('dx-7', 'Hemólisis →', [{ text: 'No conjugada alta sin coluria', correct: true }, { text: 'Conjugada alta con coluria', misconception: 'jaundice-type' }, { text: 'Acolia', note: 'Es de la obstrucción.' }], { concept: 'fis.higado', explain: 'Prehepática.', slide: 7 }) }
    ] }
  };
})();
