/* Orgánica II · PEP 1 · Aromaticidad (martes 27 de octubre).
   Fuente: "Compuestos Aromáticos I", Dr. Javier Echeverría, USACH 2025-2S (diap. 1–50; números de diapositiva del PDF del curso).
   Apoyo: McMurry, cap. 15 y Wade, cap. 16 (LibreTexts). Cuenta de electrones π y energías revisadas a mano. */
(() => {
  'use strict';
  const SRC = 'catedra-aromaticos';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  const num = (id, prompt, answer, unit, extra = {}) => ({ id, type: 'number', prompt, answer, unit, tol: 0.02, source: SRC, ...extra });
  const spot = (id, prompt, steps, wrong, fix, extra = {}) => ({ id, type: 'spot', prompt, steps, wrong, fix, source: SRC, ...extra });
  const AROM = [['aro', 'Aromático'], ['anti', 'Antiaromático'], ['no', 'No aromático']];

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['org-04'] = {
    id: 'org-04',
    subject: 'organica',
    title: 'Aromaticidad',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Compuestos Aromáticos I', author: 'Dr. Javier Echeverría', detail: 'Química Orgánica II, Química y Farmacia, USACH, 2025-2S', authority: 'Material oficial del curso' }
    },
    misconceptions: {
      'count-all-pairs': { label: 'Contaste un par libre que no está en el anillo π', why: 'Un par libre cuenta solo si está en un orbital **p** paralelo al anillo. En la **piridina** el par del N está en un sp² en el plano (apunta hacia afuera): no cuenta. En el **pirrol** sí cuenta, porque el N usa ese par para completar el anillo de 6 π.',
        prereq: { title: '¿El par participa o no?', mission: 'm3', block: 'm3b1' }, base: 'base.hibridacion',
        check: q('fix-pairs', 'Caso corto: el furano tiene 2 pares libres en el O. ¿Cuántos cuentan como electrones π?', [{ text: 'Uno de los pares (2 e⁻): total 6 π', correct: true }, { text: 'Los dos (4 e⁻): total 8 π', note: 'El O es sp²: un par en el orbital p (cuenta) y el otro en el plano (no cuenta).' }, { text: 'Ninguno', note: 'Sin el par en p, el anillo tendría 4 π.' }],
          { concept: 'ar.heterociclos', explain: 'Como en el pirrol, un par del O ocupa el orbital p y completa 6 π; el otro queda en el plano.', slide: 49 }) },
      'skip-planarity': { label: 'Aplicaste Hückel sin revisar si el anillo es plano y continuo', why: 'Hückel solo se usa si el anillo es **cíclico, plano y con un p en cada átomo**. El ciclooctatetraeno (8 π) no es antiaromático: se dobla como "tina" y queda **no aromático**. Un CH₂ sp³ en el anillo también corta el circuito.',
        prereq: { title: 'Los cuatro criterios', mission: 'm2', block: 'm2b1' }, base: 'base.hibridacion' },
      'huckel-4n': { label: 'Confundiste 4n + 2 con 4n', why: 'Aromático: **4n + 2** electrones π (2, 6, 10, 14…). Antiaromático: **4n** (4, 8, 12…) si es plano. 6 = 4(1) + 2 → aromático; 4 = 4(1) → antiaromático.',
        prereq: { title: 'Regla de Hückel', mission: 'm2', block: 'm2b1' }, base: 'base.resonancia' },
      'ion-count': { label: 'Contaste mal los electrones de un ion', why: 'Un **carbanión** sp² aporta su par (2 e⁻) al anillo; un **carbocatión** aporta un p **vacío** (0 e⁻). Anión ciclopentadienilo: 4 + 2 = 6 π (aromático). Catión ciclopentadienilo: 4 + 0 = 4 π (antiaromático).',
        prereq: { title: 'Iones aromáticos', mission: 'm2', block: 'm2b2' }, base: 'base.hibridacion' },
      'kekule-alternating': { label: 'Creíste que el benceno alterna simples y dobles', why: 'Las dos estructuras de Kekulé son formas de resonancia, no moléculas reales. Todos los C–C del benceno miden **lo mismo** (entre simple y doble, orden 1½) y los ángulos son de 120°.',
        prereq: { title: 'El benceno: resonancia', mission: 'm1', block: 'm1b1' }, base: 'base.resonancia' },
      'benzene-adds': { label: 'Trataste al benceno como un alqueno', why: 'El benceno **no** decolora Br₂ ni KMnO₄: sumarle algo rompe la aromaticidad. Con FeBr₃ hace **sustitución** (cambia un H por Br) y conserva el anillo aromático.',
        prereq: { title: 'Reacciones inusuales del benceno', mission: 'm1', block: 'm1b2' }, base: 'base.resonancia' },
      'omp-numbers': { label: 'Te equivocaste con orto, meta y para', why: '**orto = 1,2** (vecinos), **meta = 1,3** (uno de por medio), **para = 1,4** (enfrentados). Con 3 o más sustituyentes ya no se usan: se numera.',
        prereq: { title: 'Nombres de derivados del benceno', mission: 'm3', block: 'm3b2' }, base: 'base.resonancia' },
      'ir-alkene': { label: 'Confundiste la señal aromática con la de un alqueno', why: 'El C=C aromático vibra cerca de **1600 cm⁻¹** (orden de enlace 1½), más bajo que un alqueno aislado (1640–1680). Los H aromáticos salen a **7–9 ppm** en RMN ¹H (benceno: 7,2), mucho más allá que los vinílicos (5–6).',
        prereq: { title: 'Huellas del anillo aromático', mission: 'm3', block: 'm3b3' }, base: 'base.resonancia' }
    },
    goal: {
      total: 15, text: 'Asegurar los 3 puntos de aromaticidad de la PEP 1 (reparto según la PEP anterior: P1)',
      questions: [{ id: 'P1', label: 'Aromático, antiaromático o no aromático (Hückel, iones, heterociclos)', points: 3, missions: ['m2', 'm3'] }],
      rest: [{ label: 'Aminas (P3, P4 y P6)', points: 6, note: 'clase lista' }, { label: 'SEA: orientación y síntesis (P2 y P5)', points: 6, note: 'clase org-05' }]
    },
    glossary: [
      { term: 'Aromático', mission: 'm1', def: 'Compuesto cíclico, plano, con un orbital p en cada átomo del anillo y 4n + 2 electrones π deslocalizados; es mucho más estable que su análogo de cadena abierta.',
        simple: 'Un anillo con un "circuito" completo de electrones π que lo hace extra estable.', simpler: 'Como una ronda de niños tomados de la mano: si el círculo está completo y son los justos, nadie se suelta.' },
      { term: 'Energía de resonancia', mission: 'm1', def: 'Estabilización extra por deslocalización: en el benceno, unos 151 kJ/mol, medidos comparando calores de hidrogenación.',
        simple: 'Cuánto más estable es la molécula real que la que dibujarías con dobles enlaces fijos.', simpler: 'El ahorro de energía por compartir en vez de tener cada uno lo suyo.' },
      { term: 'Regla de Hückel', mission: 'm2', def: 'Un sistema cíclico, plano y completamente conjugado es aromático con 4n + 2 electrones π y antiaromático con 4n.',
        simple: 'Cuenta los electrones π: 2, 6, 10… aromático; 4, 8… antiaromático.', simpler: 'Es como un número de la suerte: 6 sí, 4 no.' },
      { term: 'Antiaromático', mission: 'm2', def: 'Cumple los criterios de anillo plano y continuo, pero con 4n electrones π: la deslocalización lo desestabiliza (ej.: ciclobutadieno).',
        simple: 'Un anillo completo pero con el número "malo" de electrones: es inestable.', simpler: 'Una ronda con un niño que sobra: se pelean y la ronda se rompe.' },
      { term: 'No aromático', mission: 'm2', def: 'Compuesto cíclico sin anillo continuo de orbitales p (por un sp³ o por no ser plano): se comporta como su análogo abierto.',
        simple: 'Un anillo que no logra cerrar el circuito π.', simpler: 'Una ronda con un hueco: ya no es ronda, es una fila.' },
      { term: 'Heterociclo aromático', mission: 'm3', def: 'Anillo aromático que contiene átomos distintos de C (N, O, S). El par libre del heteroátomo puede formar parte del sistema π (pirrol) o quedar fuera (piridina).',
        simple: 'Un anillo aromático con un N, O o S.', simpler: 'Una ronda donde uno de los niños es de otro curso, pero igual cierra el círculo.' },
      { term: 'orto, meta, para', mission: 'm3', def: 'Posiciones relativas en un benceno disustituido: orto 1,2; meta 1,3; para 1,4.',
        simple: 'Vecinos, uno de por medio, enfrentados.', simpler: 'En una mesa redonda de 6: al lado, saltándose uno, al frente.' }
    ],
    concepts: [
      { id: 'base.hibridacion', title: 'Hibridación y orbitales p', root: true },
      { id: 'base.resonancia', title: 'Resonancia y deslocalización', root: true },
      { id: 'ar.benceno', mission: 'm1', title: 'Estructura del benceno', needs: ['base.resonancia'] },
      { id: 'ar.estabilidad', mission: 'm1', title: 'Estabilidad y energía de resonancia', needs: ['ar.benceno'] },
      { id: 'ar.criterios', mission: 'm2', title: 'Los criterios: cíclico, plano, continuo', needs: ['base.hibridacion'] },
      { id: 'ar.huckel', mission: 'm2', title: 'Hückel: 4n + 2 y 4n', needs: ['ar.criterios'] },
      { id: 'ar.iones', mission: 'm2', title: 'Iones aromáticos', needs: ['ar.huckel'] },
      { id: 'ar.heterociclos', mission: 'm3', title: 'Heterociclos: ¿el par participa?', needs: ['ar.huckel'] },
      { id: 'ar.nombres', mission: 'm3', title: 'Nombres de derivados del benceno', needs: ['ar.benceno'] },
      { id: 'ar.espectro', mission: 'm3', title: 'Espectroscopía de aromáticos', needs: ['ar.benceno'] }
    ],
    curiosities: [
      { text: 'Se llamaron "aromáticos" porque los primeros derivados del benceno salieron de árboles y plantas con olor agradable. Hoy el nombre se usa aunque no huelan a nada.', slide: 2 },
      { text: 'El ciclobutadieno nunca se ha aislado puro: se dimeriza al instante. Solo se ha visto atrapado en argón congelado.', slide: 11 },
      { text: 'Richard Willstätter sintetizó el ciclooctatetraeno en 1911: reacciona como un polieno común porque se dobla como una tina.', slide: 11 },
      { text: 'En espectrometría de masas, los alquilbencenos dan un pico a m/z 91: el catión bencilo se reorganiza al ion tropilio, que es aromático.', slide: 48 }
    ],
    slideImages: {},
    slides: {
      2: { title: 'Introducción a los compuestos aromáticos', bullets: ['El nombre viene del olor de los primeros derivados', 'Los anillos aromáticos son muy comunes en fármacos'] },
      4: { title: 'Estructura del benceno: resonancia', bullets: ['Híbrido de dos estructuras de Kekulé', 'C–C intermedios entre simple y doble', 'Se dibuja con un círculo en el hexágono'] },
      5: { title: 'Compuestos aromáticos', bullets: ['6 C con un p no hibridado cada uno', 'Ángulos de 120° y enlaces iguales', 'Energía de resonancia inusualmente alta'] },
      7: { title: 'Reacciones inusuales del benceno', bullets: ['No decolora KMnO₄ ni Br₂ en CCl₄', 'Con FeBr₃: sustitución (sale HBr), no adición'] },
      8: { title: 'Estabilidad: calores de hidrogenación', bullets: ['Ciclohexeno: −120 kJ/mol', 'Ciclohexa-1,3-dieno: −232 kJ/mol', 'Benceno: −208 kJ/mol → energía de resonancia ≈ 151 kJ/mol'] },
      11: { title: 'Anulenos: ciclobutadieno y ciclooctatetraeno', bullets: ['Para conjugar, el anuleno debe ser plano', 'Ciclobutadieno: inestable, se dimeriza', 'Ciclooctatetraeno: forma de tina, reacciona como polieno'] },
      17: { title: 'Orbitales moleculares del benceno', bullets: ['6 OM π: 3 enlazantes llenos', 'Capa cerrada → muy estable'] },
      18: { title: 'Criterios de aromaticidad', bullets: ['Cíclico y conjugado', 'Un p no hibridado en cada átomo', 'Orbitales p continuos (plano)', 'La deslocalización baja la energía'] },
      19: { title: 'Aromático, antiaromático y no aromático', bullets: ['Antiaromático: cumple 1–3, pero la deslocalización sube la energía', 'No aromático: sin anillo continuo de p'] },
      20: { title: 'Regla de Hückel', bullets: ['4n + 2 electrones π → aromático', '4n → antiaromático (si es plano)', 'Comunes: 2, 6, 10 aromáticos; 4, 8 antiaromáticos'] },
      21: { title: 'Anulenos grandes', bullets: ['[10]anuleno no es plano: no aromático', 'Naftaleno (10 π) sí es aromático', '[14] y [18]anuleno: aromáticos'] },
      23: { title: 'Iones aromáticos', bullets: ['Sistemas de 2, 6 y 10 π: aromáticos', 'De 4 y 8 π: antiaromáticos si son planos'] },
      24: { title: 'Heterociclos aromáticos', bullets: ['N, O y S sp² en el anillo', 'Piridina, pirrol, furano, tiofeno, imidazol'] },
      28: { title: 'Hidrocarburos aromáticos polinucleares', bullets: ['Naftaleno, antraceno, fenantreno', 'La energía de resonancia por anillo baja al fusionar más anillos'] },
      32: { title: 'Heterociclos fusionados', bullets: ['Purina: anillos que comparten dos átomos'] },
      33: { title: 'Nomenclatura: monosustituidos', bullets: ['Tolueno, fenol, anilina, anisol, ácido benzoico, benzaldehído, acetofenona, estireno', 'Grupo fenilo (Ph) cuando el benceno es sustituyente'] },
      35: { title: 'Nomenclatura: disustituidos', bullets: ['orto (1,2), meta (1,3), para (1,4)', 'Xilenos: dimetilbencenos'] },
      36: { title: 'Nomenclatura: polisustituidos', bullets: ['Con 3 o más: localizadores numéricos', 'Nombre base común (fenol, anilina…) recibe el 1', 'Sustituyentes en orden alfabético'] },
      43: { title: 'IR de aromáticos', bullets: ['C=C aromático ≈ 1600 cm⁻¹', '=C–H sobre 3000 cm⁻¹ (≈ 3030)'] },
      44: { title: 'RMN ¹H de aromáticos', bullets: ['H aromáticos: 7–9 ppm (benceno 7,2)', 'Corriente de anillo: fuertemente desprotegidos', 'J orto ≈ 8 Hz; J meta ≈ 2 Hz'] },
      45: { title: 'RMN ¹³C de aromáticos', bullets: ['C aromáticos: 120–150 ppm'] },
      46: { title: 'UV de aromáticos', bullets: ['Benceno: 184, 204 y 254 nm (π → π*)'] },
      48: { title: 'Espectrometría de masas', bullets: ['Escisión bencílica: m/z 91', 'Catión bencilo → ion tropilio (aromático)'] },
      49: { title: 'Resumen: ¿el par electrónico participa o no?', bullets: ['Pirrol: el par del N está en p y cuenta (6 π)', 'Piridina: el par del N está en sp², en el plano, y no cuenta'] }
    },
    missions: [
      {
        id: 'm1', title: 'El benceno, ese anillo terco', subtitle: 'Resonancia y una estabilidad que no calza', minutes: 20, slides: '4–8', pep: 'Base de P1 y de toda la SEA',
        stages: {
          hook: { title: 'El reactivo que no se decolora', sage: 'Echa agua de bromo a un alqueno: el rojo desaparece al tiro. Échala al benceno: nada. ¿Qué tiene de especial ese anillo?',
            text: 'Los anillos de benceno están en la mayoría de los fármacos (paracetamol, ibuprofeno, lidocaína). Entender por qué son tan estables explica por qué reaccionan distinto: **sustituyen** en vez de sumar.' },
          diagnostic: [
            q('m1-d1', 'En el benceno, los enlaces C–C…', [{ text: 'Miden todos lo mismo (entre simple y doble)', correct: true }, { text: 'Alternan simples y dobles', misconception: 'kekule-alternating' }, { text: 'Son todos dobles', note: 'Habría 6 dobles enlaces: imposible con 6 C y 6 H.' }],
              { concept: 'ar.benceno', explain: 'El benceno es el híbrido de resonancia: orden de enlace 1½ en todos.', slide: 4 }),
            q('m1-d2', 'Si mezclas benceno con Br₂ (sin catalizador), ¿qué pasa?', [{ text: 'Nada: el color del Br₂ se mantiene', correct: true }, { text: 'Se adiciona Br₂ como en un alqueno', misconception: 'benzene-adds' }, { text: 'Explota', note: 'No reacciona.' }],
              { concept: 'ar.estabilidad', explain: 'Sumar Br₂ rompería la aromaticidad: no ocurre.', slide: 7 })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.resonancia', title: 'Desde cero: resonancia', slide: 4, body: 'Cuando una molécula se puede dibujar con los electrones π en distintos lugares sin mover los átomos, la estructura real es un **híbrido** de todas: los electrones están **deslocalizados**. Más formas de resonancia equivalentes = más estabilidad.',
              deeper: 'Las flechas de resonancia (↔) no son un equilibrio: no hay "ida y vuelta". Es como describir un rinoceronte como una mezcla de unicornio y dragón: el animal real es uno solo.' }
          ],
          explain: [],
          transfer: [
            num('m1-t1', 'Estilo PEP: la hidrogenación del ciclohexeno libera 120 kJ/mol y la del benceno 208 kJ/mol. ¿Cuál es la energía de resonancia del benceno?', 152, 'kJ/mol',
              { concept: 'ar.estabilidad', label: 'E. resonancia', slide: 8, tol: 0.02, traps: [{ value: 88, note: 'Comparaste con 2 dobles enlaces: el benceno de Kekulé tiene 3 (3 × 120 = 360).' }, { value: 568, note: 'Se resta, no se suma.' }],
                solution: ['Benceno "de Kekulé" (3 C=C aislados): 3 × 120 = 360 kJ/mol', 'Benceno real: 208 kJ/mol', 'Energía de resonancia ≈ 360 − 208 = 152 kJ/mol (la clase redondea a 151)'], explain: '≈ 151–152 kJ/mol.' }),
            write('m1-w1', 'Enséñale a tu compañero: ¿por qué el benceno hace sustitución y no adición con Br₂/FeBr₃?', 'Porque el benceno es aromático: sus 6 electrones π deslocalizados le dan unos 151 kJ/mol de estabilidad extra. Una adición rompería ese anillo aromático y sería desfavorable; en la sustitución se cambia un H por Br y el anillo aromático se conserva.',
              ['El benceno es muy estable por la aromaticidad (energía de resonancia)', 'Una adición rompería la aromaticidad', 'La sustitución conserva el anillo aromático'],
              { concept: 'ar.estabilidad', explain: 'Conservar la aromaticidad manda.', slide: 7, teach: true, keywords: [{ label: 'aromaticidad / estabilidad', any: ['aromatic', 'estab', 'resonancia'] }, { label: 'conserva el anillo', any: ['conserva', 'mantiene', 'intact'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **un anillo, seis electrones deslocalizados**.',
            pretest: q('m1-pre1', 'Adivina antes: ¿qué hibridación tienen los C del benceno?', [{ text: 'sp²', correct: true }, { text: 'sp³', note: 'Un sp³ no tendría orbital p libre.' }, { text: 'sp', note: 'sp es lineal (180°).' }],
              { concept: 'ar.benceno', explain: 'sp², ángulos de 120° y un p perpendicular en cada C.', slide: 5 }),
            explain: [
              { id: 'm1b1', concept: 'ar.benceno', title: 'El benceno: resonancia', slide: 4, body: 'El benceno (C₆H₆) es un hexágono **plano** de C **sp²** con ángulos de **120°**. Cada C tiene un orbital **p** perpendicular; los 6 p se solapan formando un anillo continuo con **6 electrones π deslocalizados**. Por eso se dibuja con un círculo y todos los C–C miden lo mismo (orden 1½). Las estructuras de Kekulé se usan para mecanismos.',
                deeper: 'Imagina 6 "salchichas" (los orbitales p) paradas alrededor del hexágono: se tocan con sus vecinas por arriba y por abajo, formando dos "donas" de electrones. Los 6 electrones π viajan por toda la dona: nadie es dueño de un doble enlace.' }
            ],
            practice: [
              q('m1-p1', '¿Por qué los C–C del benceno son más cortos que un C–C simple pero más largos que un C=C?', [{ text: 'Porque tienen orden de enlace 1½ por la deslocalización', correct: true }, { text: 'Porque alternan y se promedian al medirlos', misconception: 'kekule-alternating' }, { text: 'Porque el anillo está tensionado', note: 'Los ángulos de 120° son los ideales para sp²: no hay tensión.' }],
                { concept: 'ar.benceno', explain: 'Cada enlace tiene "medio" enlace π.', slide: 4, hint: 'Piensa en el híbrido.' }),
              match('m1-p2', 'Une cada rasgo del benceno con su explicación:', [['Ángulos de 120°', 'C sp² en un hexágono plano'], ['Enlaces C–C iguales', 'Electrones π deslocalizados'], ['Círculo dentro del hexágono', 'Representa el híbrido de resonancia']],
                { concept: 'ar.benceno', explain: 'Todo sale de los 6 p en un anillo plano.', slide: 5, hint: 'Hibridación y resonancia.' }),
              num('m1-p3', '¿Cuántos electrones π tiene el benceno?', 6, 'e⁻', { concept: 'ar.benceno', label: 'electrones π', slide: 5, tol: 0, hint: 'Un electrón en cada p (o 2 por cada doble enlace de Kekulé).',
                traps: [{ value: 3, note: 'Contaste dobles enlaces: cada uno tiene 2 electrones.' }, { value: 12, note: 'Los σ no cuentan: solo los del sistema π.' }], solution: ['3 dobles enlaces de Kekulé × 2 e⁻ = 6 e⁻ π'], explain: '6 electrones π.' })
            ],
            rule: { title: 'Regla del sabio: leer un benceno', concept: 'ar.benceno', steps: ['6 C sp², plano, 120°', 'Un p por C → anillo continuo con 6 π', 'Kekulé para mecanismos; círculo para el híbrido'] } },
          { id: 'r2', intro: 'Parte 2: **más estable de lo esperado**.',
            pretest: q('m1-pre2', 'Adivina antes: ¿liberará la hidrogenación del benceno más o menos calor que 3 veces la del ciclohexeno?', [{ text: 'Menos: el benceno ya es más estable', correct: true }, { text: 'Más', note: 'Si fuera menos estable liberaría más.' }, { text: 'Exactamente el triple', note: 'Eso sería si no hubiera estabilización extra.' }],
              { concept: 'ar.estabilidad', explain: 'Libera 208 frente a 360 kJ/mol esperados.', slide: 8 }),
            explain: [
              { id: 'm1b2', concept: 'ar.estabilidad', title: 'Reacciones inusuales y energía de resonancia', slide: 8, body: 'El benceno **no** decolora KMnO₄ ni Br₂ (los alquenos sí). Con **FeBr₃** sí reacciona, pero por **sustitución**: sale HBr y los 3 "C=C" quedan intactos. La razón es su **energía de resonancia**: el ciclohexeno libera 120 kJ/mol al hidrogenarse; el benceno, que "tiene 3 dobles", debería liberar 360, pero libera solo **208**. La diferencia, **≈ 151 kJ/mol**, es estabilidad extra (un dieno conjugado solo gana ≈ 8 kJ/mol).',
                deeper: 'Menos calor liberado = partía más abajo en energía. El ciclohexa-1,3-dieno libera 232 kJ/mol (8 menos que 2 × 120): eso es lo típico de la conjugación. El benceno se sale de escala: no se explica solo por conjugación, sino por ser aromático.' }
            ],
            practice: [
              classify('m1-p4', '¿Qué pasa con cada mezcla?', [['react', 'Reacciona'], ['none', 'No reacciona']],
                [['a', 'Ciclohexeno + Br₂ en CCl₄', 'react'], ['b', 'Benceno + Br₂ en CCl₄', 'none'], ['c', 'Benceno + KMnO₄', 'none'], ['d', 'Benceno + Br₂ + FeBr₃', 'react']],
                { concept: 'ar.estabilidad', explain: 'El benceno solo reacciona con un electrófilo fuerte (Br₂ activado por FeBr₃), y por sustitución.', slide: 7, hint: '¿Hay catalizador?' }),
              num('m1-p5', 'El ciclohexa-1,3-dieno libera 232 kJ/mol al hidrogenarse y el ciclohexeno 120. ¿Cuánta estabilización por conjugación tiene el dieno?', 8, 'kJ/mol',
                { concept: 'ar.estabilidad', label: 'estabilización', slide: 8, tol: 0.05, hint: 'Compara con 2 × 120.', traps: [{ value: 112, note: 'Compáralo con 2 dobles enlaces aislados (240), no con uno.' }], solution: ['2 × 120 = 240 kJ/mol esperados', '240 − 232 = 8 kJ/mol'], explain: '8 kJ/mol: mucho menos que los 151 del benceno.' }),
              spot('m1-fx1', 'Un aprendiz razonó sobre el benceno. ¿En qué paso se equivocó?', ['El benceno tiene 6 electrones π', 'Por eso reacciona con Br₂ igual que un alqueno, por adición', 'El producto sería 1,2-dibromociclohexadieno'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'No hay adición: con FeBr₃ hace sustitución y conserva el anillo', correct: true }, { text: 'Reacciona por adición pero solo con calor', note: 'Tampoco: la adición rompería la aromaticidad.', misconception: 'benzene-adds' }] },
                { concept: 'ar.estabilidad', slide: 7, stepNotes: { 0: 'Correcto.', 2: 'Viene del error anterior.' }, explain: 'Sustitución, no adición.', hint: '¿Qué pasa con el color del Br₂ sin catalizador?' })
            ],
            rule: { title: 'Regla del sabio: el benceno no se deja sumar', concept: 'ar.estabilidad', steps: ['No reacciona con Br₂ ni KMnO₄ solos', 'Con un electrófilo fuerte (Br₂/FeBr₃) hace sustitución', 'Energía de resonancia ≈ 3 × 120 − 208 ≈ 151 kJ/mol'] } }
        ]
      },
      {
        id: 'm2', title: 'Hückel', subtitle: 'Aromático, antiaromático o no aromático', minutes: 25, slides: '18–23', pep: 'P1: clasificar anillos e iones',
        stages: {
          hook: { title: 'Mismo tamaño, destinos opuestos', sage: 'El ciclopentadieno es un hidrocarburo cualquiera. Quítale un H⁺ y el anión es tan estable que el ciclopentadieno es ácido como un alcohol (pKa ≈ 16). Quítale un H⁻ y el catión casi no existe. ¿Qué cambió? Solo el número de electrones π.',
            text: 'En la PEP te van a mostrar anillos e iones para clasificar. La receta: primero revisa si el anillo es **cíclico, plano y con un p en cada átomo**; recién ahí cuenta electrones π.' },
          diagnostic: [
            q('m2-d1', 'El ciclobutadieno (4 electrones π, plano) es…', [{ text: 'Antiaromático', correct: true }, { text: 'Aromático', misconception: 'huckel-4n' }, { text: 'No aromático', note: 'Es plano y continuo: Hückel aplica.' }],
              { concept: 'ar.huckel', explain: '4 = 4n (n = 1): antiaromático.', slide: 20 }),
            q('m2-d2', 'El ciclopentadieno neutro (C₅H₆) es…', [{ text: 'No aromático: tiene un CH₂ sp³', correct: true }, { text: 'Aromático', misconception: 'skip-planarity' }, { text: 'Antiaromático', note: 'Sin p en todos los átomos no puede ser antiaromático.' }],
              { concept: 'ar.criterios', explain: 'El CH₂ sp³ corta el anillo de orbitales p.', slide: 19 })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.hibridacion', title: 'Desde cero: ¿quién tiene un orbital p?', slide: 18, body: 'Un C **sp²** (doble enlace, carbocatión o carbanión conjugado) tiene un orbital **p** libre. Un C **sp³** (4 enlaces simples, como un CH₂) no tiene p: corta el circuito π. Un catión sp² tiene el p **vacío**; un anión conjugado tiene el p **con 2 electrones**.',
              deeper: 'Regla práctica: si el átomo del anillo tiene un doble enlace, una carga (+ o −) o un par libre que puede ponerse en p, aporta un p. Si es un CH₂ o CR₂ con cuatro enlaces simples, no.' }
          ],
          explain: [],
          transfer: [
            classify('m2-t1', 'Estilo PEP (P1): clasifica cada especie.', AROM,
              [['bz', 'Benceno (6 π)', 'aro'], ['cbd', 'Ciclobutadieno (4 π, plano)', 'anti'], ['cot', 'Ciclooctatetraeno (forma de tina)', 'no'], ['cpa', 'Anión ciclopentadienilo', 'aro'], ['cpc', 'Catión ciclopentadienilo', 'anti'], ['trop', 'Catión tropilio (C₇H₇⁺)', 'aro'], ['cpd', 'Ciclopentadieno (C₅H₆)', 'no']],
              { concept: 'ar.huckel', explain: 'Primero criterios (plano y continuo), después 4n + 2 o 4n.', slide: 23, misconception: 'huckel-4n' }),
            write('m2-w1', 'Enséñale a tu compañero: ¿por qué el anión ciclopentadienilo es aromático pero el catión es antiaromático?', 'Ambos tienen los 5 C sp² con un orbital p cada uno, en un anillo plano. El anión tiene un par en el C cargado: 4 + 2 = 6 electrones π (4n + 2, aromático). El catión tiene un p vacío: solo 4 electrones π (4n, antiaromático).',
              ['Los dos tienen un p en cada C (anillo plano y continuo)', 'Anión: el par cuenta, 6 π = 4n + 2 → aromático', 'Catión: p vacío, 4 π = 4n → antiaromático'],
              { concept: 'ar.iones', explain: 'La carga cambia el conteo de π.', slide: 23, teach: true, keywords: [{ label: '6 electrones', any: ['6', 'seis'] }, { label: '4 electrones', any: ['4', 'cuatro'] }, { label: 'Hückel', any: ['4n', 'huckel', 'hückel'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **los criterios y la regla**.',
            pretest: q('m2-pre1', 'Adivina antes: el ciclooctatetraeno tiene 8 electrones π. ¿Será antiaromático?', [{ text: 'No: se dobla y queda no aromático', correct: true }, { text: 'Sí, por tener 4n', misconception: 'skip-planarity' }, { text: 'Es aromático', note: '8 no es 4n + 2.' }],
              { concept: 'ar.criterios', explain: 'Para escapar de la antiaromaticidad se dobla en forma de tina.', slide: 11 }),
            explain: [
              { id: 'm2b1', concept: 'ar.huckel', title: 'Cuatro criterios + Hückel', slide: 20, body: 'Para ser aromático o antiaromático: (1) **cíclico** y conjugado; (2) un **p** en cada átomo del anillo; (3) los p forman un anillo **continuo** (casi siempre, **plano**). Si falla alguno → **no aromático**. Si cumple, cuenta los π: **4n + 2 (2, 6, 10, 14…) → aromático**; **4n (4, 8, 12…) → antiaromático**.',
                deeper: 'Orden seguro: ¿anillo? ¿algún sp³ que corte? ¿puede ser plano? Recién entonces cuenta. Por eso el ciclooctatetraeno (8 π) es no aromático: se dobla para no ser antiaromático. El [10]anuleno tampoco es plano (H que chocan); el naftaleno (10 π) sí, porque un enlace reemplaza esos H.' }
            ],
            practice: [
              order('m2-p1', 'Ordena los pasos para decidir si un anillo es aromático:', [['a', '¿Es cíclico y conjugado?'], ['b', '¿Cada átomo del anillo tiene un orbital p?'], ['c', '¿Puede ser plano (anillo continuo)?'], ['d', 'Contar electrones π: 4n + 2 o 4n']], ['a', 'b', 'c', 'd'],
                { concept: 'ar.criterios', direction: 'Primero lo primero.', explain: 'Contar va al final: si no cumple los criterios, es no aromático.', slide: 18, hint: 'Hückel es el último paso.', misconception: 'skip-planarity' }),
              classify('m2-p2', '¿4n + 2 o 4n? Clasifica cada número de electrones π (anillo plano y continuo).', [['aro', '4n + 2 → aromático'], ['anti', '4n → antiaromático']],
                [['a', '2', 'aro'], ['b', '4', 'anti'], ['c', '6', 'aro'], ['d', '8', 'anti'], ['e', '10', 'aro'], ['f', '18', 'aro']],
                { concept: 'ar.huckel', explain: '2, 6, 10, 14, 18 = 4n + 2; 4, 8, 12 = 4n.', slide: 20, hint: 'Resta 2 y mira si lo que queda es múltiplo de 4.', misconception: 'huckel-4n' }),
              q('m2-p3', 'El naftaleno (dos bencenos fusionados) tiene 10 electrones π y es plano. Es…', [{ text: 'Aromático', correct: true }, { text: 'Antiaromático', misconception: 'huckel-4n' }, { text: 'No aromático', note: 'Es plano y continuo.' }],
                { concept: 'ar.huckel', explain: '10 = 4(2) + 2.', slide: 21, hint: '¿10 es 4n + 2?' })
            ],
            rule: { title: 'Regla del sabio: Hückel con orden', concept: 'ar.huckel', steps: ['Cíclico, un p en cada átomo, plano: si no, no aromático', 'Cuenta solo electrones en orbitales p del anillo', '4n + 2 → aromático; 4n → antiaromático'] } },
          { id: 'r2', intro: 'Parte 2: **iones aromáticos**.',
            pretest: q('m2-pre2', 'Adivina antes: el catión tropilio (C₇H₇⁺, 7 C sp²) tiene…', [{ text: '6 electrones π: aromático', correct: true }, { text: '7 electrones π', note: 'Un catión tiene un p vacío: 3 dobles = 6.' }, { text: '8 electrones π', misconception: 'ion-count' }],
              { concept: 'ar.iones', explain: '3 dobles enlaces (6 π) + un p vacío.', slide: 23 }),
            explain: [
              { id: 'm2b2', concept: 'ar.iones', title: 'Contar π en iones', slide: 23, body: 'Un **carbocatión** sp² aporta un p **vacío** (0 e⁻); un **carbanión** conjugado pone su par en un p (2 e⁻). Así: **anión ciclopentadienilo** = 4 + 2 = **6 π (aromático)**; **catión ciclopentadienilo** = 4 π (antiaromático); **tropilio** C₇H₇⁺ = 6 π (aromático); **catión ciclopropenilo** = 2 π (aromático, n = 0).',
                deeper: 'Por eso el ciclopentadieno es tan ácido para ser un hidrocarburo (pKa ≈ 16): su base conjugada es aromática. Y el tropilio aparece en masas a m/z 91: el catión bencilo se reorganiza a ese ion aromático.' }
            ],
            practice: [
              num('m2-p4', '¿Cuántos electrones π tiene el anión ciclopentadienilo?', 6, 'e⁻', { concept: 'ar.iones', label: 'electrones π', slide: 23, tol: 0, hint: '2 dobles enlaces + el par del carbanión.',
                traps: [{ value: 4, note: 'Falta el par del C con carga negativa.', misconception: 'ion-count' }, { value: 5, note: 'Un C cargado − aporta 2 electrones, no 1.' }], solution: ['2 C=C → 4 e⁻', 'C⁻ con su par en p → 2 e⁻', 'Total 6 → aromático'], explain: '6 π: aromático.' }),
              classify('m2-p5', 'Clasifica cada ion (todos planos):', AROM.slice(0, 2),
                [['a', 'Catión ciclopropenilo (2 π)', 'aro'], ['b', 'Anión ciclopentadienilo (6 π)', 'aro'], ['c', 'Catión ciclopentadienilo (4 π)', 'anti'], ['d', 'Catión tropilio (6 π)', 'aro']],
                { concept: 'ar.iones', explain: '2 y 6 = 4n + 2; 4 = 4n.', slide: 23, hint: 'Cuenta: catión = p vacío; anión = p con 2 e⁻.', misconception: 'ion-count' }),
              spot('m2-fx1', 'Un aprendiz analizó el catión ciclopentadienilo. ¿Dónde se equivocó?', ['Los 5 C son sp² y el anillo es plano', 'El C⁺ aporta 2 electrones a su orbital p', 'Total 6 π → aromático'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'El C⁺ tiene el p vacío: 4 π → antiaromático', correct: true }, { text: 'El C⁺ aporta 1 electrón: 5 π', note: 'Un catión no tiene electrones en ese p.', misconception: 'ion-count' }] },
                { concept: 'ar.iones', slide: 23, stepNotes: { 0: 'Correcto.', 2: 'Arrastra el error anterior.' }, explain: 'Catión: p vacío.', hint: '¿Cuántos electrones tiene un carbocatión en su p?' })
            ],
            rule: { title: 'Regla del sabio: iones', concept: 'ar.iones', steps: ['Catión sp²: p vacío (0 e⁻)', 'Anión conjugado: p con 2 e⁻', 'Suma los dobles enlaces (2 e⁻ c/u) y aplica Hückel'] } }
        ]
      },
      {
        id: 'm3', title: 'Heterociclos, nombres y huellas', subtitle: '¿El par participa? · orto, meta, para · IR y RMN', minutes: 25, slides: '24–49', pep: 'P1: heterociclos; base para P2 y P5',
        stages: {
          hook: { title: 'La nicotina otra vez', sage: '¿Te acuerdas de la nicotina en Aminas? Tiene una piridina y una pirrolidina. Ahora vas a entender por qué el N de la piridina es básico pero el del pirrol casi nada: todo depende de si su par está o no en el anillo π.',
            text: 'Los heterociclos aromáticos (piridina, pirrol, imidazol, purina) están en la cafeína, el ADN y muchísimos fármacos. Saber si el par del heteroátomo cuenta como π es la pregunta clásica de la PEP.' },
          diagnostic: [
            q('m3-d1', 'En la piridina, el par libre del N…', [{ text: 'No forma parte del sistema π (está en un sp², en el plano)', correct: true }, { text: 'Forma parte del sistema π', misconception: 'count-all-pairs' }, { text: 'No existe', note: 'Sí existe: por eso la piridina es básica.' }],
              { concept: 'ar.heterociclos', explain: 'El N ya aporta 1 e⁻ por su doble enlace; su par queda en el plano.', slide: 49 }),
            q('m3-d2', 'p-xileno es lo mismo que…', [{ text: '1,4-dimetilbenceno', correct: true }, { text: '1,3-dimetilbenceno', misconception: 'omp-numbers' }, { text: '1,2-dimetilbenceno', misconception: 'omp-numbers' }],
              { concept: 'ar.nombres', explain: 'para = 1,4.', slide: 35 })
          ],
          fundamentals: [
            { id: 'm3f1', concept: 'base.hibridacion', title: 'Desde cero: dónde vive un par libre', slide: 49, body: 'Un N sp² tiene 3 orbitales sp² en el plano y 1 p perpendicular. Si el N tiene un **doble enlace en el anillo**, su p ya está ocupado por ese π y el par queda en un **sp²** (fuera). Si el N tiene **solo enlaces simples** en el anillo (N–H), pone su par en el **p** y lo suma al anillo.',
              deeper: 'Piridina: N con doble enlace → par en el plano (disponible para captar H⁺: base). Pirrol: N–H con enlaces simples → par en p (forma parte de los 6 π; si lo usa para captar H⁺, pierde la aromaticidad: casi no es básico).' }
          ],
          explain: [],
          transfer: [
            num('m3-t1', 'Estilo PEP: el imidazol tiene un N tipo piridina y un N–H tipo pirrol. ¿Cuántos electrones π tiene su anillo?', 6, 'e⁻',
              { concept: 'ar.heterociclos', label: 'electrones π', slide: 24, tol: 0, traps: [{ value: 8, note: 'Contaste el par del N tipo piridina: ese queda en el plano.', misconception: 'count-all-pairs' }, { value: 4, note: 'Falta el par del N–H, que sí entra al anillo.' }],
                solution: ['2 dobles enlaces (C=C y C=N) → 4 e⁻', 'N–H tipo pirrol: su par en p → 2 e⁻', 'N tipo piridina: par en sp² → 0', 'Total 6 → aromático'], explain: '6 π: aromático.' }),
            q('m3-t2', 'Estilo PEP: ¿cuál es la base más fuerte?', [{ text: 'Piridina: su par no es parte del anillo aromático', correct: true }, { text: 'Pirrol: tiene un N–H', note: 'Si el pirrol usa su par para captar H⁺, pierde la aromaticidad: casi no es básico.', misconception: 'count-all-pairs' }, { text: 'Son iguales', note: 'La diferencia es enorme (pKaH ≈ 5,2 frente a ≈ −3,8).' }],
              { concept: 'ar.heterociclos', explain: 'El par de la piridina está libre en el plano; el del pirrol está comprometido en los 6 π.', slide: 49 }),
            write('m3-w1', 'Enséñale a tu compañero: ¿por qué el par libre del N del pirrol "cuenta" para la aromaticidad y el de la piridina no?', 'En el pirrol el N tiene solo enlaces simples en el anillo, así que pone su par en el orbital p y lo suma a los 4 electrones de los dos dobles enlaces: 6 π, aromático. En la piridina el N ya tiene un doble enlace que ocupa su orbital p; su par queda en un sp² en el plano del anillo, apuntando hacia afuera, y no forma parte del sistema π.',
              ['Pirrol: el par del N está en un orbital p y completa 6 π', 'Piridina: el p del N ya está en un doble enlace', 'En la piridina el par queda en un sp² en el plano (fuera del sistema π)'],
              { concept: 'ar.heterociclos', explain: '¿En p o en sp²?', slide: 49, teach: true, keywords: [{ label: 'orbital p', any: ['orbital p', ' p '] }, { label: 'sp² / plano', any: ['sp2', 'sp²', 'plano'] }, { label: '6 electrones', any: ['6', 'seis'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **¿el par participa o no?**',
            pretest: q('m3-pre1', 'Adivina antes: el furano (anillo de 5 con un O) ¿es aromático?', [{ text: 'Sí: un par del O completa 6 π', correct: true }, { text: 'No: el O no tiene orbital p', note: 'El O es sp²: uno de sus pares está en p.' }, { text: 'Es antiaromático con 8 π', misconception: 'count-all-pairs' }],
              { concept: 'ar.heterociclos', explain: 'Como el pirrol: 4 + 2 = 6 π.', slide: 24 }),
            explain: [
              { id: 'm3b1', concept: 'ar.heterociclos', title: 'Piridina, pirrol, furano, tiofeno, imidazol', slide: 49, body: '**Tipo piridina** (N con doble enlace en el anillo): aporta 1 e⁻ por su π; su par queda en sp², **no cuenta** (y queda libre: es básico). **Tipo pirrol** (N–H, O o S con enlaces simples en el anillo): pone **un par** en p, **cuenta 2 e⁻**. Así, piridina, pirrol, furano y tiofeno tienen **6 π**. El imidazol tiene uno de cada tipo: también 6 π. La purina (fusionada) tiene 10 π.',
                deeper: 'Truco: cada átomo del anillo aporta exactamente un orbital p. Si ese p ya tiene un π (doble enlace), el par extra va al plano. Si no hay doble enlace en ese átomo, el par llena el p. El O del furano tiene dos pares: uno en p (cuenta) y otro en el plano.' }
            ],
            practice: [
              classify('m3-p1', '¿El par libre del heteroátomo cuenta como π?', [['yes', 'Sí, está en el orbital p'], ['no', 'No, está en un sp² (en el plano)']],
                [['pyrrole', 'N del pirrol', 'yes'], ['pyridine', 'N de la piridina', 'no'], ['furanO', 'Uno de los pares del O del furano', 'yes'], ['thio', 'Uno de los pares del S del tiofeno', 'yes'], ['imN3', 'N tipo piridina del imidazol', 'no']],
                { concept: 'ar.heterociclos', explain: 'Si el átomo ya tiene un doble enlace en el anillo, su par queda en el plano.', slide: 49, hint: '¿Ese átomo tiene un doble enlace en el anillo?', misconception: 'count-all-pairs' }),
              num('m3-p2', '¿Cuántos electrones π tiene la piridina?', 6, 'e⁻', { concept: 'ar.heterociclos', label: 'electrones π', slide: 24, tol: 0, hint: '3 dobles enlaces; el par del N no cuenta.',
                traps: [{ value: 8, note: 'El par del N está en el plano: no cuenta.', misconception: 'count-all-pairs' }], solution: ['3 dobles enlaces (2 C=C y 1 C=N) × 2 = 6 e⁻', 'Par del N en sp²: 0'], explain: '6 π.' }),
              q('m3-p3', '¿Por qué el pirrol es una base muchísimo más débil que la piridina?', [{ text: 'Al protonar su N perdería la aromaticidad', correct: true }, { text: 'Porque su N es más electronegativo', note: 'Es el mismo elemento; la diferencia es dónde está el par.' }, { text: 'Porque no tiene par libre', note: 'Sí lo tiene, pero está comprometido en el anillo.' }],
                { concept: 'ar.heterociclos', explain: 'El par del pirrol es parte de los 6 π.', slide: 49, hint: '¿Qué le pasa al anillo si el par se usa para el H⁺?' })
            ],
            rule: { title: 'Regla del sabio: el par del heteroátomo', concept: 'ar.heterociclos', steps: ['¿El heteroátomo tiene doble enlace en el anillo? → su par queda fuera (tipo piridina)', 'Si solo tiene enlaces simples → un par entra al p (tipo pirrol)', 'Suma y aplica Hückel'] } },
          { id: 'r2', intro: 'Parte 2: **nombres de derivados del benceno**.',
            pretest: q('m3-pre2', 'Adivina antes: C₆H₅–OH se llama…', [{ text: 'Fenol', correct: true }, { text: 'Bencenol', note: 'Es un nombre común aceptado: fenol.' }, { text: 'Anisol', note: 'Anisol es C₆H₅–OCH₃.' }],
              { concept: 'ar.nombres', explain: 'Fenol es nombre IUPAC aceptado.', slide: 33 }),
            explain: [
              { id: 'm3b2', concept: 'ar.nombres', title: 'Nombres comunes, o/m/p y numeración', slide: 36, body: 'Memoriza: **tolueno** (–CH₃), **fenol** (–OH), **anilina** (–NH₂), **anisol** (–OCH₃), **ácido benzoico** (–COOH), **benzaldehído** (–CHO), **acetofenona** (–COCH₃), **estireno** (–CH=CH₂), **benzonitrilo** (–CN). Disustituidos: **orto 1,2 · meta 1,3 · para 1,4**. Con 3 o más: números; el grupo del nombre base (OH en fenol, NH₂ en anilina) es el **1** y los sustituyentes van en **orden alfabético**.',
                deeper: 'Si el benceno es el grupo pequeño (cadena de más de 6 C), se llama **fenilo** (Ph–). Ejemplo: 2,4-dibromofenol: el OH es C1, los Br en 2 y 4 (los números más bajos posibles).' }
            ],
            practice: [
              match('m3-p4', 'Une cada nombre con su sustituyente en el benceno:', [['Tolueno', '–CH₃'], ['Anilina', '–NH₂'], ['Anisol', '–OCH₃'], ['Acetofenona', '–COCH₃'], ['Benzaldehído', '–CHO']],
                { concept: 'ar.nombres', explain: 'Nombres comunes aceptados por IUPAC.', slide: 33, hint: 'Anilina = amina; anisol = éter.' }),
              classify('m3-p5', 'Clasifica cada disustituido:', [['o', 'orto (1,2)'], ['m', 'meta (1,3)'], ['p', 'para (1,4)']],
                [['a', '1,3-dinitrobenceno', 'm'], ['b', '4-bromotolueno', 'p'], ['c', '2-cloroanilina', 'o'], ['d', '1,4-dimetilbenceno', 'p']],
                { concept: 'ar.nombres', explain: 'Mira la diferencia entre los números.', slide: 35, hint: '1,2 vecinos; 1,3 uno de por medio; 1,4 enfrentados.', misconception: 'omp-numbers' }),
              q('m3-p6', '¿Cuál es el nombre correcto de un fenol con Br en las posiciones 2 y 4?', [{ text: '2,4-dibromofenol', correct: true }, { text: 'o,p-dibromofenol', note: 'Con 3 o más sustituyentes (contando el OH) se usan números.' }, { text: '1,3-dibromo-4-hidroxibenceno', note: 'El nombre base es fenol: el OH es el C1.' }],
                { concept: 'ar.nombres', explain: 'Nombre base fenol (OH = 1), números más bajos.', slide: 36, hint: '¿Cuál es el nombre base?' })
            ],
            rule: { title: 'Regla del sabio: nombrar un benceno', concept: 'ar.nombres', steps: ['¿Hay nombre base común? (fenol, anilina, tolueno…) → ese grupo es C1', 'Dos grupos: o/m/p o números; tres o más: solo números', 'Números lo más bajos posible y sustituyentes en orden alfabético'] } },
          { id: 'r3', intro: 'Parte 3: **huellas espectroscópicas**.',
            pretest: q('m3-pre3', 'Adivina antes: ¿dónde salen los H del benceno en RMN ¹H?', [{ text: 'Cerca de 7,2 ppm', correct: true }, { text: 'Cerca de 5 ppm', misconception: 'ir-alkene' }, { text: 'Cerca de 1 ppm', note: 'Esos son H alquílicos.' }],
              { concept: 'ar.espectro', explain: 'La corriente de anillo los desprotege mucho.', slide: 44 }),
            explain: [
              { id: 'm3b3', concept: 'ar.espectro', title: 'Huellas del anillo aromático', slide: 44, body: '**IR**: C=C aromático ≈ **1600 cm⁻¹** y =C–H **sobre 3000** (≈ 3030). **RMN ¹H**: **7–9 ppm** (benceno 7,2), J orto ≈ 8 Hz, J meta ≈ 2 Hz. **RMN ¹³C**: **120–150 ppm**. **UV**: banda débil a ≈ 254 nm. **Masas**: los alquilbencenos dan **m/z 91** (bencilo → tropilio).',
                deeper: 'Los grupos que sacan electrones (C=O, NO₂, CN) corren los H aromáticos a campo bajo (más ppm); los que donan (OH, OCH₃, NH₂), a campo alto. 1600 + 3030 juntos son prueba clara de un anillo aromático.' }
            ],
            practice: [
              match('m3-p7', 'Une cada técnica con la señal típica de un anillo aromático:', [['IR', '≈ 1600 cm⁻¹ y =C–H sobre 3000'], ['RMN ¹H', '7–9 ppm'], ['RMN ¹³C', '120–150 ppm'], ['Masas (alquilbencenos)', 'm/z 91 (tropilio)']],
                { concept: 'ar.espectro', explain: 'Cuatro huellas del anillo.', slide: 43, hint: 'ppm para RMN, cm⁻¹ para IR.' }),
              q('m3-p8', 'Un compuesto muestra IR a 1600 y 3030 cm⁻¹ y RMN ¹H a 7,3 ppm (5H). ¿Qué tiene?', [{ text: 'Un anillo de benceno monosustituido', correct: true }, { text: 'Un alqueno aislado', misconception: 'ir-alkene' }, { text: 'Un alcohol', note: 'Un O–H daría una banda ancha cerca de 3300.' }],
                { concept: 'ar.espectro', explain: '1600 + 3030 + 7,3 ppm (5 H) = C₆H₅–.', slide: 44, hint: '5 H aromáticos = monosustituido.' }),
              num('m3-p9', 'El n-butilbenceno se fragmenta en masas dando el ion tropilio. ¿A qué m/z aparece?', 91, '', { concept: 'ar.espectro', label: 'm/z', slide: 48, tol: 0.001, hint: 'C₇H₇⁺: 7 × 12 + 7 × 1.',
                traps: [{ value: 77, note: '77 es el fenilo C₆H₅⁺.' }, { value: 134, note: 'Ese es el ion molecular del butilbenceno.' }], solution: ['C₇H₇⁺ = 7(12) + 7(1) = 91'], explain: 'm/z 91.' })
            ],
            rule: { title: 'Regla del sabio: ¿hay benceno?', concept: 'ar.espectro', steps: ['IR: 1600 y sobre 3000 cm⁻¹', 'RMN ¹H 7–9 ppm; ¹³C 120–150 ppm', 'Masas: m/z 91 en alquilbencenos'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.hibridacion', title: 'Hibridación y orbitales p', subtitle: 'sp³, sp² y quién tiene un p libre', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.hibridacion', title: 'sp³, sp², sp', slide: 18, body: '**sp³**: 4 grupos, tetraédrico (109,5°), sin p libre. **sp²**: 3 grupos, plano (120°), **un p libre** perpendicular. **sp**: 2 grupos, lineal (180°), dos p libres. Un átomo con doble enlace, una carga conjugada o un par que pueda entrar en p es sp².',
            deeper: 'Cuenta "grupos": átomos unidos + pares libres que no participan en π. Un CH₂ del anillo (4 enlaces simples) es sp³ y no tiene p: corta el circuito aromático.' }],
          practice: [
            q('z1-p1', 'El C de un CH₂ en un anillo (con 4 enlaces simples) es…', [{ text: 'sp³, sin orbital p libre', correct: true }, { text: 'sp², con un p libre', note: 'Necesitaría un doble enlace o una carga.' }, { text: 'sp', note: 'sp tiene dos enlaces π o es lineal.' }], { concept: 'base.hibridacion', explain: '4 grupos → sp³.', slide: 18, hint: 'Cuenta los grupos.' }),
            classify('z1-p2', '¿Qué hibridación tiene cada C?', [['sp3', 'sp³'], ['sp2', 'sp²']], [['a', 'C de un CH₃', 'sp3'], ['b', 'C de un C=C', 'sp2'], ['c', 'C de un carbocatión plano', 'sp2'], ['d', 'C de un CH₂ del ciclohexano', 'sp3']],
              { concept: 'base.hibridacion', explain: 'Doble enlace o carga plana → sp².', slide: 18, hint: '¿Tiene un p libre?' })
          ],
          transfer: [write('z1-w1', 'Explica por qué un C sp³ en un anillo impide que sea aromático.', 'Porque un C sp³ no tiene orbital p libre: usa sus cuatro orbitales en enlaces σ. Así se corta el anillo continuo de orbitales p que se necesita para deslocalizar los electrones π alrededor de todo el anillo.',
            ['El C sp³ no tiene orbital p libre', 'Se corta el anillo continuo de orbitales p', 'Sin anillo continuo no hay deslocalización completa'],
            { concept: 'base.hibridacion', explain: 'Sin p no hay circuito.', slide: 18, keywords: [{ label: 'orbital p', any: ['orbital p', ' p '] }, { label: 'continuo', any: ['continu', 'corta', 'interrump'] }] })]
        } },
      { id: 'z2', concept: 'base.resonancia', title: 'Resonancia', subtitle: 'Electrones que se reparten', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.resonancia', title: 'Formas de resonancia', slide: 4, body: 'Si puedes mover electrones π o pares (no átomos) y obtener otra estructura válida, ambas son **formas de resonancia**. La molécula real es el **híbrido**: los electrones se reparten y eso la estabiliza. Se conectan con ↔, no con flechas de equilibrio.',
            deeper: 'Reglas: no se mueven átomos; se conserva la carga total; cada átomo respeta su octeto (C, N, O). Formas equivalentes pesan igual (como las dos de Kekulé).' }],
          practice: [
            q('z2-p1', 'Las dos estructuras de Kekulé del benceno…', [{ text: 'Son formas de resonancia de una sola molécula', correct: true }, { text: 'Son dos moléculas que se convierten rápido', note: 'No hay equilibrio: es una sola molécula real.' }, { text: 'Son isómeros', note: 'Los isómeros tienen átomos distintos ubicados distinto.' }], { concept: 'base.resonancia', explain: 'Resonancia ≠ equilibrio.', slide: 4, hint: '¿Se mueven átomos?' }),
            q('z2-p2', 'En resonancia, ¿qué se puede mover?', [{ text: 'Solo electrones (π y pares)', correct: true }, { text: 'Átomos y electrones', note: 'Mover átomos da isómeros, no resonancia.' }, { text: 'Solo átomos de H', note: 'Eso sería tautomería.' }], { concept: 'base.resonancia', explain: 'Los átomos quedan fijos.', slide: 4, hint: 'Piensa en Kekulé.' })
          ],
          transfer: [write('z2-w1', 'Explica qué significa que el benceno sea un "híbrido de resonancia".', 'Significa que la molécula real no es ninguna de las estructuras de Kekulé, sino una mezcla de ambas: los electrones π están repartidos por todo el anillo, todos los enlaces C–C son iguales y la molécula es más estable que cualquiera de las formas dibujadas.',
            ['La molécula real no es ninguna de las estructuras dibujadas', 'Los electrones π están deslocalizados (enlaces iguales)', 'El híbrido es más estable que cada forma'],
            { concept: 'base.resonancia', explain: 'Híbrido = mezcla real.', slide: 4, keywords: [{ label: 'deslocalizados', any: ['desloc', 'reparti'] }, { label: 'estable', any: ['estab'] }] })]
        } }
    ],
    formulas: [
      { id: 'f-huckel', title: 'Regla de Hückel', formula: 'electrones π = 4n + 2 → aromático; = 4n → antiaromático', concepts: ['ar.huckel', 'ar.iones', 'ar.heterociclos'], vars: [['n', 'número entero (0, 1, 2, 3…)', '—']],
        what: 'Decidir si un anillo plano y continuo es aromático o antiaromático.', when: 'Solo después de revisar que el anillo es cíclico, plano y con un p en cada átomo.', example: 'Anión ciclopentadienilo: 6 π = 4(1) + 2 → aromático.', deeper: 'Sale del patrón de orbitales moleculares cíclicos: con 4n + 2 se llena una capa cerrada.',
        sources: [{ label: 'Aromáticos I, diap. 20', slide: 20 }, { label: 'Aromáticos I, diap. 23', slide: 23 }],
        calc: { inputs: [{ id: 'pi', label: 'electrones π', value: 6, step: 1 }], run: v => (v.pi % 4 === 2 ? '**' + v.pi + ' = 4n + 2** → aromático (si es plano y continuo)' : v.pi % 4 === 0 ? '**' + v.pi + ' = 4n** → antiaromático (si es plano)' : 'Revisa: con número impar de electrones es un radical') } },
      { id: 'f-res', title: 'Energía de resonancia', formula: 'E_res = n(C=C) × ΔH_hid(ciclohexeno) − ΔH_hid(real)', concepts: ['ar.estabilidad'], vars: [['ΔH_hid', 'calor de hidrogenación (en valor absoluto)', 'kJ/mol']],
        what: 'Medir cuánto más estable es una molécula que su versión con dobles enlaces fijos.', when: 'Con calores de hidrogenación.', example: 'Benceno: 3 × 120 − 208 ≈ 152 kJ/mol.', deeper: 'Menos calor liberado = partía más abajo en energía.',
        sources: [{ label: 'Aromáticos I, diap. 8', slide: 8 }, { label: 'Wade, cap. 16 (LibreTexts)', url: 'https://chem.libretexts.org/' }],
        calc: { inputs: [{ id: 'n', label: 'n.º de C=C', value: 3, step: 1 }, { id: 'real', label: 'ΔH real (kJ/mol, valor absoluto)', value: 208, step: 1 }], run: v => 'E_res ≈ **' + (v.n * 120 - v.real) + ' kJ/mol**' } }
    ],
    recipes: [],
    mini: {
      'base.hibridacion': { idea: 'sp² = plano con un p libre; sp³ = sin p libre.', steps: ['Cuenta grupos alrededor del átomo', '3 grupos → sp² (p libre)', '4 grupos → sp³ (sin p)'], check: { prompt: 'Un carbocatión plano es…', options: [{ text: 'sp² con p vacío', correct: true }, { text: 'sp³', note: 'Tiene 3 grupos.' }], explain: '3 grupos → sp², p vacío.' } },
      'base.resonancia': { idea: 'La molécula real es la mezcla de las formas dibujadas.', steps: ['Mueve solo electrones', 'Respeta octetos y carga', 'El híbrido es más estable'], check: { prompt: 'En resonancia los átomos…', options: [{ text: 'No se mueven', correct: true }, { text: 'Se mueven', note: 'Eso sería otra molécula.' }], explain: 'Solo electrones.' } },
      'ar.benceno': { idea: 'Seis p en ronda: los electrones π dan la vuelta completa.', steps: ['6 C sp², plano', '6 electrones π deslocalizados', 'Todos los C–C iguales'], check: { prompt: 'El orden de enlace C–C en el benceno es…', options: [{ text: '1½', correct: true }, { text: '2', note: 'Sería un doble enlace.' }], explain: 'Entre simple y doble.' } },
      'ar.estabilidad': { idea: 'El benceno libera menos calor del esperado: ya estaba más abajo.', steps: ['Esperado: 3 × 120 kJ/mol', 'Real: 208 kJ/mol', 'Diferencia ≈ 151 kJ/mol de estabilidad'], check: { prompt: 'El benceno con Br₂ sin catalizador…', options: [{ text: 'No reacciona', correct: true }, { text: 'Adiciona Br₂', note: 'Perdería aromaticidad.' }], explain: 'No reacciona.' } },
      'ar.criterios': { idea: 'Primero mira la ronda (cíclico, plano, p en todos); después cuenta.', steps: ['¿Cíclico y conjugado?', '¿Un p en cada átomo?', '¿Plano?'], check: { prompt: 'Un anillo con un CH₂ sp³ es…', options: [{ text: 'No aromático', correct: true }, { text: 'Antiaromático', note: 'Sin p continuo no aplica Hückel.' }], explain: 'El sp³ corta.' } },
      'ar.huckel': { idea: '2, 6, 10 sí; 4, 8 no.', steps: ['Cuenta electrones π', 'Resta 2: ¿múltiplo de 4? → 4n + 2', 'Si ya es múltiplo de 4 → 4n'], check: { prompt: '14 electrones π (plano):', options: [{ text: 'Aromático', correct: true }, { text: 'Antiaromático', note: '14 − 2 = 12 = 4 × 3.' }], explain: '14 = 4(3) + 2.' } },
      'ar.iones': { idea: 'Catión = p vacío; anión = p con 2 electrones.', steps: ['Cuenta los C=C (2 e⁻ c/u)', 'Suma 0 por cada catión, 2 por cada anión', 'Aplica Hückel'], check: { prompt: 'Catión ciclopropenilo (1 C=C + C⁺):', options: [{ text: '2 π, aromático', correct: true }, { text: '4 π', note: 'El C⁺ aporta 0.' }], explain: '2 = 4(0) + 2.' } },
      'ar.heterociclos': { idea: 'Si el heteroátomo ya tiene doble enlace en el anillo, su par queda afuera.', steps: ['Tipo piridina: par fuera', 'Tipo pirrol (N–H, O, S): un par dentro', 'Suma y aplica Hückel'], check: { prompt: 'Tiofeno: electrones π =', options: [{ text: '6', correct: true }, { text: '8', note: 'Solo un par del S entra.' }], explain: '4 + 2 = 6.' } },
      'ar.nombres': { idea: 'Nombres comunes + orto/meta/para + números si hay tres o más.', steps: ['Busca un nombre base común', 'o = 1,2; m = 1,3; p = 1,4', 'Tres o más: números y orden alfabético'], check: { prompt: 'm-diclorobenceno =', options: [{ text: '1,3-diclorobenceno', correct: true }, { text: '1,4-diclorobenceno', note: 'Ese es para.' }], explain: 'meta = 1,3.' } },
      'ar.espectro': { idea: 'El anillo deja huellas: 1600 cm⁻¹, 7 ppm, 120–150 ppm, m/z 91.', steps: ['IR 1600 y > 3000', 'RMN ¹H 7–9 ppm', 'Masas m/z 91 si hay cadena alquílica'], check: { prompt: 'Una señal a 7,2 ppm en RMN ¹H sugiere…', options: [{ text: 'H aromáticos', correct: true }, { text: 'H de un CH₃', note: 'Esos salen cerca de 1 ppm.' }], explain: 'Zona aromática.' } }
    },
    deep: {
      'ar.huckel': { title: 'De dónde sale 4n + 2: el círculo de Frost', sections: [['El truco', 'Dibuja el polígono del anillo dentro de un círculo, con un vértice abajo: cada vértice marca la energía de un orbital molecular π.'], ['Benceno', 'Hexágono: 1 orbital abajo, 2 + 2 al medio y 1 arriba. Los 6 electrones llenan justo los 3 enlazantes: capa cerrada.'], ['Ciclobutadieno', 'Cuadrado: 1 abajo, 2 en la línea del medio (no enlazantes) y 1 arriba. Con 4 electrones quedan 2 desapareados: inestable (antiaromático).']],
        challenge: { prompt: 'Con el círculo de Frost, el catión ciclopropenilo (triángulo, 2 e⁻) queda…', options: [{ text: 'Con capa cerrada: aromático', correct: true }, { text: 'Con electrones desapareados', note: 'Los 2 e⁻ caben en el orbital más bajo.' }], explain: '2 = 4(0) + 2.' },
        sources: [{ label: 'Aromáticos I, diap. 17 y 22', slide: 17 }, { label: 'Wade, cap. 16 (LibreTexts)', url: 'https://chem.libretexts.org/' }] }
    },
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', 'Un C con 4 enlaces simples es…', [{ text: 'sp³', correct: true }, { text: 'sp²', note: 'sp² tiene un doble enlace o es plano con carga.' }, { text: 'sp', note: 'sp es lineal.' }], { concept: 'base.hibridacion', explain: '4 grupos → sp³.', slide: 18 }) },
      { level: 1, item: q('dx-2', 'Las formas de resonancia se diferencian en…', [{ text: 'La posición de los electrones', correct: true }, { text: 'La posición de los átomos', note: 'Eso serían isómeros.' }, { text: 'La carga total', note: 'La carga total se conserva.' }], { concept: 'base.resonancia', explain: 'Solo se mueven electrones.', slide: 4 }) },
      { level: 2, item: q('dx-3', 'El benceno con Br₂/FeBr₃ da…', [{ text: 'Bromobenceno + HBr (sustitución)', correct: true }, { text: 'Dibromociclohexadieno (adición)', misconception: 'benzene-adds' }, { text: 'Nada', note: 'Con FeBr₃ sí reacciona.' }], { concept: 'ar.estabilidad', explain: 'Sustitución.', slide: 7 }) },
      { level: 2, item: q('dx-4', '¿Cuántos electrones π tiene el benceno?', [{ text: '6', correct: true }, { text: '3', note: '3 dobles × 2 = 6.' }, { text: '12', note: 'Solo los π.' }], { concept: 'ar.benceno', explain: '6 π.', slide: 5 }) },
      { level: 2, item: q('dx-5', 'Un anillo plano y continuo con 8 electrones π sería…', [{ text: 'Antiaromático', correct: true }, { text: 'Aromático', misconception: 'huckel-4n' }, { text: 'No aromático', note: 'Si es plano y continuo, aplica Hückel.' }], { concept: 'ar.huckel', explain: '8 = 4n.', slide: 20 }) },
      { level: 3, item: q('dx-6', 'El anión ciclopentadienilo es…', [{ text: 'Aromático (6 π)', correct: true }, { text: 'Antiaromático (4 π)', misconception: 'ion-count' }, { text: 'No aromático', note: 'Todos los C son sp².' }], { concept: 'ar.iones', explain: '4 + 2 = 6.', slide: 23 }) },
      { level: 3, item: q('dx-7', 'En el pirrol, el par libre del N…', [{ text: 'Es parte de los 6 electrones π', correct: true }, { text: 'Queda en el plano, fuera del anillo', misconception: 'count-all-pairs' }, { text: 'No existe', note: 'Sí existe, pero está comprometido.' }], { concept: 'ar.heterociclos', explain: 'Tipo pirrol: el par cuenta.', slide: 49 }) }
    ] }
  };
})();
