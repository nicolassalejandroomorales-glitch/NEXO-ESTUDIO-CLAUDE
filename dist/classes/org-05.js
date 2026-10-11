/* Orgánica II · PEP 1 · Sustitución electrofílica aromática (martes 27 de octubre).
   Fuente: "Compuestos Aromáticos II", Dr. Javier Echeverría, USACH 2025-2S. El PDF no trae número de página legible:
   "slide" apunta a la sección de la clase (numeración propia, en el orden de la presentación; ver slides abajo).
   Apoyo: McMurry, cap. 16 y Wade, cap. 17 (LibreTexts). Velocidades relativas citadas de la clase (tolueno ×25, anisol ×10 000, nitrobenceno ÷100 000). */
(() => {
  'use strict';
  const SRC = 'catedra-sea';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });
  const spot = (id, prompt, steps, wrong, fix, extra = {}) => ({ id, type: 'spot', prompt, steps, wrong, fix, source: SRC, ...extra });
  const cauldron = (id, prompt, base, target, ingredients, answer, notes, extra = {}) => ({ id, type: 'recipe', prompt, base, target, ingredients: ingredients.map(([iid, label]) => ({ id: iid, label })), answer, notes, source: SRC, ...extra });
  const SHELF = [['br', 'Br₂ / FeBr₃'], ['cl', 'Cl₂ / AlCl₃'], ['nit', 'HNO₃ / H₂SO₄'], ['sul', 'SO₃ / H₂SO₄ (fumante)'], ['red', 'Fe (o Sn) / HCl, luego NaOH'], ['acil', 'CH₃COCl / AlCl₃'], ['alq', 'CH₃Cl / AlCl₃'], ['clem', 'Zn(Hg) / HCl (Clemmensen)'], ['desul', 'H₂SO₄ diluido, calor']];
  const shelf = ids => SHELF.filter(([id]) => ids.includes(id));

  const recipes = [
    { id: 'rc-halog', mission: 'm1', concept: 'sea.halogenacion', slide: 6, title: 'Halogenación', base: 'Benceno (o areno)', reagents: '**Br₂ / FeBr₃** (o Cl₂ / AlCl₃; I₂ / HNO₃)', condition: 'El ácido de Lewis polariza el X₂ (Br⁺ "efectivo")', result: '**Ar–Br** + HBr', note: 'Sin el ácido de Lewis el benceno no reacciona; con yodo hace falta un oxidante (HNO₃), no un catalizador.' },
    { id: 'rc-nitr', mission: 'm1', concept: 'sea.nitracion', slide: 11, title: 'Nitración', base: 'Benceno (o areno)', reagents: '**HNO₃ / H₂SO₄**', condition: 'El H₂SO₄ forma el ion **nitronio NO₂⁺**', result: '**Ar–NO₂** (nitroareno)', note: 'Después, Fe o Sn / HCl reduce el NO₂ a NH₂: la mejor forma de poner un amino en el anillo.' },
    { id: 'rc-sulf', mission: 'm1', concept: 'sea.nitracion', slide: 14, title: 'Sulfonación', base: 'Benceno (o areno)', reagents: '**SO₃ / H₂SO₄** (ácido sulfúrico fumante)', condition: 'El SO₃ es el electrófilo', result: '**Ar–SO₃H**', note: 'Es reversible: con H₂SO₄ diluido y calor se quita (sirve para "bloquear" una posición).' },
    { id: 'rc-fcacil', mission: 'm3', concept: 'sea.friedel', slide: 43, title: 'Acilación de Friedel-Crafts', base: 'Benceno o areno activado (no desactivado)', reagents: '**R–COCl / AlCl₃**', condition: 'Ion acilio R–C≡O⁺ (no se reordena)', result: '**Ar–CO–R** (fenona)', note: 'No hay polialquilación (el C=O desactiva). Para obtener el alquilo lineal, reduce con Clemmensen (Zn(Hg)/HCl).' }
  ];
  const R = id => recipes.find(r => r.id === id);

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['org-05'] = {
    id: 'org-05',
    subject: 'organica',
    title: 'Sustitución electrofílica aromática',
    evaluation: 'PEP 1',
    status: 'borrador',
    sources: {
      [SRC]: { title: 'Compuestos Aromáticos II (SEA)', author: 'Dr. Javier Echeverría', detail: 'Química Orgánica II, Química y Farmacia, USACH, 2025-2S', authority: 'Material oficial del curso' }
    },
    misconceptions: {
      'adds-not-subs': { label: 'Creíste que el benceno adiciona', why: 'El complejo σ pierde la aromaticidad; para recuperarla pierde un **H⁺** (no se suma el Br⁻). El resultado es una **sustitución**: el anillo aromático se conserva.',
        prereq: { title: 'El complejo σ', mission: 'm1', block: 'm1b1' }, base: 'base.carbocation' },
      'no-lewis': { label: 'Olvidaste el ácido de Lewis', why: 'El Br₂ o el Cl₂ solos no son electrófilos suficientes para el benceno. El **FeBr₃** o **AlCl₃** aceptan un par del halógeno y lo polarizan: queda un "Br⁺" efectivo.',
        prereq: { title: 'Halogenación', mission: 'm1', block: 'm1b1' }, base: 'base.electrofilo',
        check: q('fix-lewis', 'Caso corto: ¿qué hace el FeBr₃ en la bromación del benceno?', [{ text: 'Acepta un par del Br₂ y lo polariza (Br⁺ efectivo)', correct: true }, { text: 'Aporta el bromo que entra', note: 'El Br que entra viene del Br₂; el FeBr₃ se regenera.' }, { text: 'Calienta la mezcla', note: 'Es un catalizador ácido de Lewis.' }],
          { concept: 'sea.halogenacion', explain: 'El ácido de Lewis activa el halógeno y se regenera al final.', slide: 6 }) },
      'nitronium': { label: 'Te equivocaste de electrófilo en la nitración', why: 'El electrófilo es el ion **nitronio NO₂⁺**, que se forma cuando el H₂SO₄ protona al HNO₃ y este pierde agua. No es el NO₃⁻ (que es un anión, no un electrófilo).',
        prereq: { title: 'Nitración y sulfonación', mission: 'm1', block: 'm1b2' }, base: 'base.electrofilo' },
      'sigma-aromatic': { label: 'Creíste que el complejo σ es aromático', why: 'En el complejo σ un C del anillo queda **sp³**: se corta el circuito de orbitales p. No es aromático; por eso formarlo cuesta (paso lento) y por eso pierde rápido el H⁺.',
        prereq: { title: 'El complejo σ', mission: 'm1', block: 'm1b1' }, base: 'base.carbocation' },
      'halogen-meta': { label: 'Te equivocaste con los halógenos', why: 'Los halógenos son la excepción: **desactivan** (sacan electrones por el enlace σ) pero orientan a **orto y para** (donan un par por resonancia al complejo σ).',
        prereq: { title: 'Halógenos y varios grupos', mission: 'm2', block: 'm2b2' }, base: 'base.carbocation' },
      'nitro-op': { label: 'Pusiste un desactivador como orto/para', why: 'Los grupos con carga + (o δ+) en el átomo unido al anillo (NO₂, C=O, CN, SO₃H) **desactivan** y orientan a **meta**: en orto/para el complejo σ pondría dos cargas + juntas.',
        prereq: { title: 'Activadores y desactivadores', mission: 'm2', block: 'm2b1' }, base: 'base.carbocation' },
      'activator-loses': { label: 'Dejaste que mande el grupo más débil', why: 'Con dos grupos que no se ponen de acuerdo, **manda el activador más fuerte**: –OH, –OR, –NR₂ > –R, –X > los meta-orientadores.',
        prereq: { title: 'Halógenos y varios grupos', mission: 'm2', block: 'm2b2' }, base: 'base.carbocation' },
      'fc-deactivated': { label: 'Usaste Friedel-Crafts en un anillo desactivado', why: 'Friedel-Crafts **falla** con anillos fuertemente desactivados (nitrobenceno, ácidos sulfónicos, fenonas). Planifica: haz Friedel-Crafts **antes** de poner el grupo desactivador.',
        prereq: { title: 'Friedel-Crafts', mission: 'm3', block: 'm3b1' }, base: 'base.electrofilo' },
      'fc-rearrange': { label: 'Olvidaste que el carbocatión se reordena', why: 'En la alquilación de Friedel-Crafts el carbocatión puede reordenarse (1-cloropropano da **isopropil**benceno). Para una cadena lineal: **acilación + Clemmensen**.',
        prereq: { title: 'Friedel-Crafts', mission: 'm3', block: 'm3b1' }, base: 'base.carbocation' },
      'synthesis-order': { label: 'El orden de los pasos no da el isómero pedido', why: 'El grupo que ya está en el anillo decide dónde entra el siguiente. Si quieres **meta**, primero pon el **meta-orientador**; si quieres **orto/para**, primero el **o/p-orientador**.',
        prereq: { title: 'Planificar una síntesis', mission: 'm3', block: 'm3b2' }, base: 'base.carbocation' },
      'sna-no-ewg': { label: 'Pediste una SNA sin grupos atractores', why: 'La SNA solo funciona si hay grupos que sacan electrones fuertes (NO₂) en **orto o para** al haluro: estabilizan el intermediario con carga **negativa**.',
        prereq: { title: 'Sustitución nucleofílica aromática', mission: 'm3', block: 'm3b3' }, base: 'base.electrofilo' }
    },
    goal: {
      total: 15, text: 'Asegurar los 6 puntos de SEA de la PEP 1 (reparto según la PEP anterior: P2 y P5)',
      questions: [
        { id: 'P2', label: 'Orientación: dónde entra el electrófilo', points: 3, missions: ['m2'] },
        { id: 'P5', label: 'Síntesis de aromáticos (reactivos y orden)', points: 3, missions: ['m1', 'm3'] }
      ],
      rest: [{ label: 'Aminas (P3, P4 y P6)', points: 6, note: 'clase lista' }, { label: 'Aromaticidad (P1)', points: 3, note: 'clase org-04' }]
    },
    glossary: [
      { term: 'Sustitución electrofílica aromática (SEA)', mission: 'm1', def: 'Reacción en que un electrófilo reemplaza a un H de un anillo aromático, pasando por un complejo σ; el anillo conserva su aromaticidad.',
        simple: 'Un electrófilo entra y sale un H⁺: el anillo queda aromático.', simpler: 'Cambiar una pieza de un collar sin romper el collar.' },
      { term: 'Complejo σ (ion arenio)', mission: 'm1', def: 'Carbocatión intermedio de la SEA: el electrófilo unido por un enlace σ a un C sp³ del anillo; la carga + se reparte por resonancia en tres C. No es aromático.',
        simple: 'El paso intermedio donde el anillo "se rompe" un rato.', simpler: 'El momento en que sacas una pieza del collar y todavía no pones la otra.' },
      { term: 'Ácido de Lewis', mission: 'm1', def: 'Especie que acepta un par de electrones (FeBr₃, AlCl₃, BF₃). En SEA activa al halógeno o al haluro de alquilo.',
        simple: 'El que "jala" electrones para crear un electrófilo fuerte.', simpler: 'Un imán que deja al otro átomo con ganas de electrones.' },
      { term: 'Activador / desactivador', mission: 'm2', def: 'Sustituyente que hace al anillo más (o menos) reactivo que el benceno frente a la SEA, según done o saque densidad electrónica.',
        simple: 'Los que donan electrones aceleran; los que sacan, frenan.', simpler: 'Un viento a favor o en contra.' },
      { term: 'Orientador orto/para y meta', mission: 'm2', def: 'Un sustituyente dirige al electrófilo a las posiciones que dan el complejo σ más estable: los donadores a orto/para, los atractores a meta.',
        simple: 'El grupo que ya está decide dónde entra el siguiente.', simpler: 'El primero que se sienta en la mesa decide dónde se sienta el siguiente invitado.' },
      { term: 'Friedel-Crafts', mission: 'm3', def: 'SEA con carbocationes (alquilación) o iones acilio (acilación) generados por un ácido de Lewis; forman enlaces C–C con el anillo.',
        simple: 'Pegar una cadena de carbonos al anillo.', simpler: 'Ponerle una rama nueva al collar.' },
      { term: 'Sustitución nucleofílica aromática (SNA)', mission: 'm3', def: 'Un nucleófilo fuerte reemplaza a un haluro de un anillo que tiene grupos atractores (NO₂) en orto o para; el intermediario tiene carga negativa.',
        simple: 'Lo contrario de la SEA: entra un nucleófilo, sale un haluro.', simpler: 'Un collar muy "pobre" en electrones acepta que le cambien una pieza por una con carga negativa.' }
    ],
    concepts: [
      { id: 'base.electrofilo', title: 'Electrófilos y ácidos de Lewis', root: true },
      { id: 'base.carbocation', title: 'Estabilidad de carbocationes', root: true },
      { id: 'sea.mecanismo', mission: 'm1', title: 'Mecanismo: el complejo σ', needs: ['base.carbocation', 'base.electrofilo'] },
      { id: 'sea.halogenacion', mission: 'm1', title: 'Halogenación', needs: ['sea.mecanismo'] },
      { id: 'sea.nitracion', mission: 'm1', title: 'Nitración, sulfonación y reducción', needs: ['sea.mecanismo'] },
      { id: 'sea.activadores', mission: 'm2', title: 'Activadores y desactivadores', needs: ['sea.mecanismo'] },
      { id: 'sea.halogenos', mission: 'm2', title: 'Halógenos: desactivan pero orto/para', needs: ['sea.activadores'] },
      { id: 'sea.multiples', mission: 'm2', title: 'Varios sustituyentes', needs: ['sea.activadores'] },
      { id: 'sea.friedel', mission: 'm3', title: 'Friedel-Crafts', needs: ['sea.mecanismo'] },
      { id: 'sea.sintesis', mission: 'm3', title: 'Planificar una síntesis', needs: ['sea.activadores', 'sea.friedel'] },
      { id: 'sea.sna', mission: 'm3', title: 'Sustitución nucleofílica aromática', needs: ['sea.activadores'] }
    ],
    curiosities: [
      { text: 'Poner un Cl en para de la feniramina da la clorfeniramina, 10 veces más potente como antihistamínico. Con Br (bromfeniramina) el efecto dura casi el doble.', slide: 9 },
      { text: 'Los antifúngicos clotrimazol y econazol necesitan un halógeno en orto o para: sin él pierden actividad.', slide: 9 },
      { text: 'Los detergentes más comunes son sulfonatos de alquilbenceno: salen de sulfonar un alquilbenceno y neutralizar.', slide: 14 },
      { text: 'El anisol se nitra unas 10 000 veces más rápido que el benceno; el nitrobenceno, unas 100 000 veces más lento.', slide: 21 }
    ],
    slideImages: {},
    slides: {
      2: { title: 'Introducción a la SEA', bullets: ['Con Fe (FeBr₃) el benceno sí reacciona con Br₂', 'Un H del anillo se reemplaza por un electrófilo'] },
      4: { title: 'El complejo σ', bullets: ['Los π atacan a un electrófilo fuerte', 'Carbocatión estabilizado por resonancia: complejo σ (ion arenio)', 'No es aromático: un C sp³; formarlo es el paso lento', 'Pierde un H⁺ y recupera la aromaticidad'] },
      6: { title: 'Halogenación', bullets: ['Br₂ / FeBr₃: el ácido de Lewis polariza el Br₂', 'Cl₂ / AlCl₃', 'I₂ / HNO₃ (oxidante, se consume)'] },
      9: { title: 'Halogenación en fármacos', bullets: ['Feniramina → clorfeniramina (Cl en para)', 'Clotrimazol y econazol: X en orto/para'] },
      11: { title: 'Nitración', bullets: ['HNO₃ / H₂SO₄', 'H₂SO₄ protona al HNO₃ → sale H₂O → NO₂⁺ (nitronio)'] },
      13: { title: 'Reducción del grupo nitro', bullets: ['Sn, Zn o Fe en ácido diluido: Ar–NO₂ → Ar–NH₂', 'Nitrar y reducir: la mejor forma de poner un NH₂'] },
      14: { title: 'Sulfonación y desulfonación', bullets: ['SO₃ en H₂SO₄ (fumante)', 'Reversible: H₂SO₄ diluido y calor la quita', 'Detergentes: sulfonatos de alquilbenceno'] },
      17: { title: 'Nitración del tolueno', bullets: ['25 veces más rápido que el benceno', 'Sobre todo orto y para', 'El complejo σ orto/para tiene una forma con carbocatión 3°'] },
      21: { title: 'Grupos alcoxi y amino', bullets: ['Anisol: ~10 000 veces más rápido que el benceno', 'El O o el N donan un par por resonancia al complejo σ', 'Anilina y anisol se brominan sin catalizador (hasta tribromuro)'] },
      26: { title: 'Desactivadores: meta-orientadores', bullets: ['Nitrobenceno: ~100 000 veces más lento', 'N con carga + junto al anillo', 'En orto/para el complejo σ pondría dos cargas + juntas'] },
      31: { title: 'Halógenos', bullets: ['Desactivan (inductivo, por σ)', 'Orientan orto/para (donan un par por resonancia)'] },
      34: { title: 'Resumen: efecto orientador', bullets: ['Fuertes o/p: –NH₂, –NR₂, –OH, –OR', 'Moderados o/p: –R, –X', 'meta: –NO₂, –CN, –SO₃H, –CHO, –COR, –COOH, –COOR, –NR₃⁺'] },
      35: { title: 'Varios sustituyentes', bullets: ['Si se refuerzan, fácil de predecir', 'Si se oponen, manda el activador más fuerte', 'La posición entre dos grupos está impedida'] },
      38: { title: 'Alquilación de Friedel-Crafts', bullets: ['R–Cl / AlCl₃ → carbocatión', 'También alquenos + HF y alcoholes + BF₃'] },
      41: { title: 'Limitaciones de la alquilación', bullets: ['Falla con anillos fuertemente desactivados', 'Reordenamiento de carbocationes', 'Polialquilación'] },
      43: { title: 'Acilación de Friedel-Crafts', bullets: ['R–COCl / AlCl₃ → ion acilio', 'Da fenonas (acilbencenos)', 'Clemmensen (Zn(Hg)/HCl) reduce C=O a CH₂'] },
      45: { title: 'Estrategias de síntesis', bullets: ['Monosustituidos: elegir la reacción', 'Disustituidos: el orden decide orto/para o meta'] },
      49: { title: 'Sustitución nucleofílica aromática', bullets: ['Nucleófilo fuerte reemplaza un haluro', 'Necesita NO₂ (u otro atractor) en orto/para', 'Intermediario con carga negativa'] }
    },
    missions: [
      {
        id: 'm1', title: 'El complejo σ', subtitle: 'Cómo el benceno cambia un H sin perder su anillo', minutes: 25, slides: '2–14', pep: 'P5: reactivos de cada reacción',
        stages: {
          hook: { title: 'Un Cl que multiplica por 10 un antialérgico', sage: 'La clorfeniramina (el antialérgico de la farmacia) es la feniramina con un Cl en para. Ese Cl se puso con una reacción que hoy aprendes: la SEA.',
            text: 'La sustitución electrofílica aromática es la forma más importante de poner grupos en un anillo de benceno: halógenos, NO₂ (y de ahí NH₂), SO₃H y cadenas de carbono. En la PEP te pedirán **qué reactivo** usar para cada grupo.' },
          diagnostic: [
            q('m1-d1', '¿Qué electrófilo ataca al benceno en la nitración con HNO₃/H₂SO₄?', [{ text: 'NO₂⁺ (nitronio)', correct: true }, { text: 'NO₃⁻', misconception: 'nitronium' }, { text: 'H₂SO₄', note: 'El H₂SO₄ es el catalizador que forma el NO₂⁺.' }],
              { concept: 'sea.nitracion', explain: 'El H₂SO₄ protona al HNO₃, sale agua y queda NO₂⁺.', slide: 11 }),
            q('m1-d2', 'El complejo σ de la SEA es…', [{ text: 'Un carbocatión no aromático', correct: true }, { text: 'Un anillo aromático con carga', misconception: 'sigma-aromatic' }, { text: 'El producto final', note: 'Todavía falta perder el H⁺.' }],
              { concept: 'sea.mecanismo', explain: 'Un C queda sp³: se corta el anillo de orbitales p.', slide: 4 })
          ],
          fundamentals: [
            { id: 'm1f1', concept: 'base.electrofilo', title: 'Desde cero: electrófilos y ácidos de Lewis', slide: 6, body: 'Un **electrófilo** busca electrones (tiene carga + o un átomo pobre en electrones). Un **ácido de Lewis** (FeBr₃, AlCl₃) **acepta un par**: al unirse a Br₂ o a R–Cl, deja al otro extremo muy pobre en electrones, o sea, un electrófilo fuerte.',
              deeper: 'El benceno es un nucleófilo débil (sus π son muy estables). Por eso necesita electrófilos fuertes: Br₂ activado por FeBr₃, NO₂⁺, SO₃, carbocationes o iones acilio.' }
          ],
          explain: [],
          transfer: [
            cauldron('m1-t1', 'Estilo PEP (P5): el caldero pide **anilina** a partir de benceno. Elige los reactivos en orden.', 'Benceno', 'anilina (C₆H₅–NH₂)', shelf(['nit', 'red', 'br', 'sul', 'acil']), ['nit', 'red'],
              { br: 'El Br no se convierte en NH₂ con estos reactivos.', sul: 'El SO₃H no lleva a la anilina.', acil: 'La acilación pone un C=O, no un N.' },
              { concept: 'sea.nitracion', slide: 13, orderNote: 'Primero se pone el NO₂ (nitración); después se reduce a NH₂.', explain: 'Nitrar (HNO₃/H₂SO₄) y reducir (Fe/HCl, luego NaOH).', hint: 'El N entra como NO₂.' }),
            write('m1-w1', 'Enséñale a tu compañero: ¿por qué la SEA termina en sustitución y no en adición?', 'Porque el primer paso forma el complejo σ, un carbocatión que ya no es aromático (un C es sp³). Para recuperar la aromaticidad, que lo estabiliza muchísimo, el complejo σ pierde un H⁺ del C sp³ en vez de sumar el nucleófilo. Así el electrófilo reemplaza a un H y el anillo aromático se conserva.',
              ['El complejo σ es un carbocatión no aromático', 'Pierde un H⁺ para recuperar la aromaticidad', 'Resultado: un H reemplazado y el anillo aromático intacto'],
              { concept: 'sea.mecanismo', explain: 'Recuperar la aromaticidad manda.', slide: 4, teach: true, keywords: [{ label: 'complejo σ', any: ['complejo', 'sigma', 'σ', 'arenio'] }, { label: 'pierde H⁺', any: ['h+', 'h⁺', 'proton', 'protón'] }, { label: 'aromaticidad', any: ['aromatic'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **el mecanismo y la halogenación**.',
            pretest: q('m1-pre1', 'Adivina antes: ¿cuál paso de la SEA es el lento?', [{ text: 'Formar el complejo σ (se pierde la aromaticidad)', correct: true }, { text: 'Perder el H⁺', note: 'Ese es rápido: devuelve la aromaticidad.' }, { text: 'Ambos igual de lentos', note: 'El primero cuesta mucho más.' }],
              { concept: 'sea.mecanismo', explain: 'Romper la aromaticidad es endotérmico: es el paso limitante.', slide: 4 }),
            explain: [
              { id: 'm1b1', concept: 'sea.mecanismo', title: 'Dos pasos: atacar y devolver el H⁺', slide: 4, body: '(1) Los π del anillo atacan al **electrófilo E⁺**: se forma el **complejo σ** (ion arenio), un carbocatión con la carga + repartida por resonancia en **tres C** (orto y para al C atacado). Ese C queda **sp³**: **no es aromático**, y este paso es el **lento**. (2) Una base saca el **H⁺** del C sp³ y el anillo **recupera la aromaticidad**: sustitución. **Halogenación**: Br₂/**FeBr₃** o Cl₂/**AlCl₃** (el ácido de Lewis polariza el halógeno y se regenera); yodo con **HNO₃** (oxidante).',
                deeper: 'En la bromación: Br₂ + FeBr₃ → Br–Br⁺–FeBr₃⁻; el anillo ataca al Br del extremo, el FeBr₄⁻ toma el H⁺ y queda HBr + FeBr₃ (regenerado). La carga del complejo σ queda en orto y para del C atacado: eso explicará la orientación en la misión 2.' }
            ],
            practice: [
              order('m1-p1', 'Ordena los pasos de la bromación del benceno:', [['a', 'El FeBr₃ acepta un par del Br₂ y lo polariza'], ['b', 'Los π atacan al Br: se forma el complejo σ'], ['c', 'El FeBr₄⁻ saca el H⁺ del C sp³'], ['d', 'Bromobenceno + HBr; el FeBr₃ se regenera']], ['a', 'b', 'c', 'd'],
                { concept: 'sea.halogenacion', direction: 'Del inicio al producto.', explain: 'Activar, atacar, devolver el H⁺.', slide: 6, hint: 'Primero hay que crear el electrófilo.' }),
              q('m1-p2', '¿Por qué el complejo σ no es aromático?', [{ text: 'Porque un C del anillo queda sp³ y corta el circuito de orbitales p', correct: true }, { text: 'Porque tiene carga positiva', note: 'El catión tropilio tiene carga + y es aromático: el problema es el sp³.', misconception: 'sigma-aromatic' }, { text: 'Porque tiene 8 electrones π', note: 'Tiene 4 electrones π repartidos en 5 C.' }],
                { concept: 'sea.mecanismo', explain: 'El C atacado tiene 4 enlaces σ.', slide: 4, hint: '¿Qué hibridación tiene el C que recibió al electrófilo?' }),
              match('m1-p3', 'Une cada halogenación con sus reactivos:', [['Bromación', 'Br₂ / FeBr₃'], ['Cloración', 'Cl₂ / AlCl₃'], ['Yodación', 'I₂ / HNO₃ (oxidante)']],
                { concept: 'sea.halogenacion', explain: 'El yodo necesita un oxidante que se consume, no un ácido de Lewis.', slide: 6, hint: 'El yodo es el raro.', misconception: 'no-lewis' })
            ],
            recipe: R('rc-halog') },
          { id: 'r2', intro: 'Parte 2: **nitración, sulfonación y el truco del NH₂**.',
            pretest: q('m1-pre2', 'Adivina antes: ¿cómo se pone un NH₂ en un benceno?', [{ text: 'Nitrando y después reduciendo el NO₂', correct: true }, { text: 'Con NH₃ directo', note: 'El NH₃ no es electrófilo: no hace SEA.' }, { text: 'Con NH₄Cl y calor', note: 'Tampoco es un electrófilo.' }],
              { concept: 'sea.nitracion', explain: 'El N entra como NO₂⁺ y luego se reduce.', slide: 13 }),
            explain: [
              { id: 'm1b2', concept: 'sea.nitracion', title: 'Nitración y sulfonación', slide: 11, body: '**Nitración**: HNO₃/**H₂SO₄**. El H₂SO₄ protona el OH del HNO₃, sale H₂O y queda el **ion nitronio NO₂⁺** (el electrófilo). **Reducción**: Ar–NO₂ + Fe (o Sn, Zn)/HCl → Ar–NH₂ (con NaOH al final para liberar la amina). **Sulfonación**: **SO₃** en H₂SO₄ (fumante) → Ar–SO₃H; es **reversible** (H₂SO₄ diluido y calor la quita).',
                deeper: 'La sulfonación reversible sirve como "grupo bloqueador": pones SO₃H en para, haces la reacción que quieres en orto y después lo quitas. La reducción del NO₂ conecta esta clase con Aminas (síntesis de anilina y de ahí diazonio).' }
            ],
            practice: [
              q('m1-p4', '¿Qué papel tiene el H₂SO₄ en la nitración?', [{ text: 'Protona al HNO₃ para formar el NO₂⁺', correct: true }, { text: 'Aporta el grupo que entra', note: 'El que entra es NO₂, del HNO₃.' }, { text: 'Ninguno, solo es solvente', note: 'Sin él la nitración es muy lenta.', misconception: 'nitronium' }],
                { concept: 'sea.nitracion', explain: 'Catalizador que genera el electrófilo.', slide: 11, hint: '¿Quién es el electrófilo?' }),
              classify('m1-p5', '¿Qué reactivo usarías para cada transformación del benceno?', [['nit', 'HNO₃ / H₂SO₄'], ['sul', 'SO₃ / H₂SO₄'], ['red', 'Fe / HCl']],
                [['a', 'Benceno → nitrobenceno', 'nit'], ['b', 'Benceno → ácido bencenosulfónico', 'sul'], ['c', 'Nitrobenceno → anilina', 'red']],
                { concept: 'sea.nitracion', explain: 'Nitrar, sulfonar y reducir.', slide: 13, hint: 'La reducción no es SEA: cambia el NO₂ que ya está.' }),
              spot('m1-fx1', 'Un aprendiz propuso cómo obtener anilina. ¿En qué paso se equivocó?', ['Benceno + HNO₃/H₂SO₄ → nitrobenceno', 'Nitrobenceno + SO₃/H₂SO₄ → anilina', 'Neutralizar con NaOH'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'Reducir con Fe (o Sn)/HCl', correct: true }, { text: 'Hacer otra nitración', note: 'Eso pondría un segundo NO₂.' }] },
                { concept: 'sea.nitracion', slide: 13, stepNotes: { 0: 'Bien: la nitración pone el N.', 2: 'Bien: el NaOH libera la amina de su sal.' }, explain: 'El NO₂ se reduce con metal y ácido.', hint: '¿Qué convierte NO₂ en NH₂?' }),
              cauldron('m1-p6', 'El caldero pide **ácido bencenosulfónico** y después **volver al benceno**. Elige en orden.', 'Benceno', 'benceno otra vez (sulfonar y desulfonar)', shelf(['sul', 'desul', 'nit', 'red']), ['sul', 'desul'],
                { nit: 'La nitración no se revierte así.', red: 'No hay NO₂ que reducir.' }, { concept: 'sea.nitracion', slide: 14, orderNote: 'Primero sulfonas; el H₂SO₄ diluido caliente lo quita.', explain: 'La sulfonación es reversible.', hint: 'La sulfonación tiene "marcha atrás".' })
            ],
            recipe: R('rc-nitr') }
        ]
      },
      {
        id: 'm2', title: '¿Dónde entra?', subtitle: 'Activadores, desactivadores y halógenos', minutes: 25, slides: '17–35', pep: 'P2: orientación',
        stages: {
          hook: { title: 'El tolueno elige', sage: 'Si cada posición del tolueno fuera igual, al nitrarlo saldría 40 % orto, 40 % meta y 20 % para. Pero sale casi nada de meta. El metilo "decide" dónde entra el NO₂.',
            text: 'En la PEP (P2) te muestran un benceno con uno o dos grupos y preguntan **dónde entra** el electrófilo y si va **más rápido o más lento** que el benceno. Todo se explica con un solo dibujo: el complejo σ.' },
          diagnostic: [
            q('m2-d1', 'El grupo –NO₂ en un benceno…', [{ text: 'Desactiva y orienta a meta', correct: true }, { text: 'Activa y orienta a orto/para', misconception: 'nitro-op' }, { text: 'Desactiva y orienta a orto/para', note: 'Eso hacen los halógenos.' }],
              { concept: 'sea.activadores', explain: 'N con carga + junto al anillo: desactivador meta.', slide: 26 }),
            q('m2-d2', 'El clorobenceno, frente a la SEA…', [{ text: 'Reacciona más lento que el benceno, en orto/para', correct: true }, { text: 'Reacciona más rápido, en orto/para', misconception: 'halogen-meta' }, { text: 'Reacciona más lento, en meta', misconception: 'halogen-meta' }],
              { concept: 'sea.halogenos', explain: 'Halógenos: desactivan pero orientan a orto/para.', slide: 31 })
          ],
          fundamentals: [
            { id: 'm2f1', concept: 'base.carbocation', title: 'Desde cero: qué estabiliza un carbocatión', slide: 17, body: 'Un carbocatión es más estable si: está en un C **más sustituido** (3° > 2° > 1°, los alquilos donan electrones), si su carga se reparte por **resonancia**, o si un átomo vecino con **par libre** (O, N) se la comparte. Lo desestabiliza tener al lado otra carga + o un grupo que saque electrones.',
              deeper: 'En la SEA, el estado de transición se parece al complejo σ: todo lo que estabilice ese carbocatión acelera la reacción y elige la posición. Por eso basta mirar dónde queda la carga + (orto y para del C atacado).' }
          ],
          explain: [],
          transfer: [
            q('m2-t1', 'Estilo PEP (P2): ¿dónde entra principalmente el Br al tratar **anisol** (C₆H₅–OCH₃) con Br₂?', [{ text: 'En orto y para, más rápido que en el benceno', correct: true }, { text: 'En meta, más lento', misconception: 'nitro-op' }, { text: 'En meta, más rápido', note: 'Los donadores por resonancia orientan a orto/para.' }],
              { concept: 'sea.activadores', explain: 'El –OCH₃ dona un par por resonancia: activador fuerte, orto/para (incluso sin catalizador).', slide: 21 }),
            q('m2-t2', 'Estilo PEP (P2): en el **p-nitrotolueno**, ¿dónde entra un segundo grupo?', [{ text: 'Orto al metilo (que es meta al nitro): los dos coinciden', correct: true }, { text: 'Orto al nitro', note: 'El nitro orienta a meta; el metilo, a orto/para.', misconception: 'nitro-op' }, { text: 'No reacciona', note: 'El metilo mantiene el anillo reactivo.' }],
              { concept: 'sea.multiples', explain: 'Las posiciones orto al CH₃ son meta al NO₂: se refuerzan.', slide: 35 }),
            write('m2-w1', 'Enséñale a tu compañero: ¿por qué el –CH₃ orienta a orto/para y el –NO₂ a meta?', 'Porque el complejo σ deja la carga + en orto y para respecto al C atacado. Si el electrófilo entra orto o para al CH₃, la carga cae sobre el C que lleva el metilo (carbocatión 3°, más estable): esas posiciones van más rápido. Con NO₂, entrar orto o para pondría la carga + junto al N cargado +, muy inestable; en meta eso se evita.',
              ['La carga + del complejo σ queda en orto y para del C atacado', 'CH₃ en orto/para: la carga cae en un C 3° (más estable)', 'NO₂ en orto/para: dos cargas + juntas; por eso va a meta'],
              { concept: 'sea.activadores', explain: 'Todo se decide en el complejo σ.', slide: 26, teach: true, keywords: [{ label: 'complejo σ', any: ['complejo', 'σ', 'sigma'] }, { label: 'carbocatión 3°', any: ['terciario', '3°'] }, { label: 'cargas juntas', any: ['carga', 'repel'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **activadores y desactivadores**.',
            pretest: q('m2-pre1', 'Adivina antes: ¿cuál reacciona más rápido en SEA?', [{ text: 'Anisol (C₆H₅–OCH₃)', correct: true }, { text: 'Benceno', note: 'El –OCH₃ dona electrones: acelera.' }, { text: 'Nitrobenceno', note: 'El –NO₂ frena muchísimo.' }],
              { concept: 'sea.activadores', explain: 'Anisol ≈ 10 000 veces más rápido que el benceno.', slide: 21 }),
            explain: [
              { id: 'm2b1', concept: 'sea.activadores', title: 'Donan → orto/para; sacan → meta', slide: 34, body: '**Activadores orto/para**: fuertes **–NH₂, –NR₂, –OH, –OR** (donan un par por resonancia); moderados **–R** (alquilos, inductivo) y –NHCOR. **Desactivadores meta**: **–NO₂, –CN, –SO₃H, –CHO, –COR, –COOH, –COOR, –NR₃⁺**: el átomo unido al anillo tiene carga + o δ+. **Halógenos**: la excepción (parte 2).',
                deeper: 'Con el tolueno, entrar en orto o para deja una forma de resonancia con la carga en el C que lleva el CH₃: carbocatión 3°. Con el anisol, el O incluso pone su par y forma un enlace π extra (todos los átomos con octeto). Con el nitrobenceno, orto/para pondría la carga junto al N⁺: por eso solo queda meta.' }
            ],
            practice: [
              classify('m2-p1', 'Clasifica cada sustituyente:', [['op', 'Activador, orto/para'], ['m', 'Desactivador, meta']],
                [['a', '–OH', 'op'], ['b', '–NO₂', 'm'], ['c', '–CH₃', 'op'], ['d', '–COOH', 'm'], ['e', '–NH₂', 'op'], ['f', '–CN', 'm'], ['g', '–OCH₃', 'op'], ['h', '–CHO', 'm']],
                { concept: 'sea.activadores', explain: 'Par libre o alquilo junto al anillo: activa; C=O, NO₂, CN: desactiva y meta.', slide: 34, hint: '¿El átomo unido al anillo tiene par libre o tiene carga δ+?', misconception: 'nitro-op' }),
              order('m2-p2', 'Ordena de MÁS LENTO a MÁS RÁPIDO en una SEA:', [['a', 'Nitrobenceno'], ['b', 'Benceno'], ['c', 'Tolueno'], ['d', 'Anisol']], ['a', 'b', 'c', 'd'],
                { concept: 'sea.activadores', direction: 'De más lento a más rápido.', explain: 'Nitro frena (÷100 000), metilo acelera (×25), metoxi acelera mucho (×10 000).', slide: 21, hint: 'Atractor < nada < alquilo < par libre.' }),
              q('m2-p3', '¿Por qué la anilina se bromina sin catalizador hasta 2,4,6-tribromoanilina?', [{ text: 'El –NH₂ activa tanto que no hace falta el FeBr₃', correct: true }, { text: 'El –NH₂ es un ácido de Lewis', note: 'El –NH₂ dona; no acepta pares.' }, { text: 'El Br₂ es muy fuerte', note: 'Con benceno el mismo Br₂ no reacciona.' }],
                { concept: 'sea.activadores', explain: 'Activador fuerte: las tres posiciones orto/para se brominan.', slide: 21, hint: 'Es un activador fuerte.' })
            ],
            rule: { title: 'Regla del sabio: leer un sustituyente', concept: 'sea.activadores', steps: ['¿Par libre (N, O) o alquilo junto al anillo? → activa, orto/para', '¿C=O, NO₂, CN, SO₃H, NR₃⁺? → desactiva, meta', '¿Halógeno? → desactiva pero orto/para'] } },
          { id: 'r2', intro: 'Parte 2: **halógenos y dos grupos a la vez**.',
            pretest: q('m2-pre2', 'Adivina antes: en el p-metilanisol, ¿quién decide dónde entra el electrófilo?', [{ text: 'El –OCH₃ (activador más fuerte)', correct: true }, { text: 'El –CH₃', misconception: 'activator-loses' }, { text: 'Ninguno: sale 50 y 50', note: 'Manda el más fuerte.' }],
              { concept: 'sea.multiples', explain: 'Fuertes (–OR) > moderados (–R).', slide: 35 }),
            explain: [
              { id: 'm2b2', concept: 'sea.halogenos', title: 'Halógenos y varios sustituyentes', slide: 31, body: '**Halógenos**: muy electronegativos → sacan densidad por el enlace σ (**desactivan**); pero tienen pares que donan al complejo σ cuando la carga cae sobre su C (**orto/para**). **Dos grupos**: si se refuerzan, fácil. Si se oponen, **manda el más fuerte**: (1) –OH, –OR, –NR₂ > (2) –R, –X > (3) todos los meta. La posición **entre** dos grupos está impedida.',
                deeper: 'Ejemplo: en el m-xileno, las posiciones orto a un CH₃ y para al otro son las que reaccionan; la del medio (orto a ambos) casi no. En un anillo con –OCH₃ y –NO₂ enfrentados, el metoxi manda: el electrófilo entra orto al OCH₃.' }
            ],
            practice: [
              q('m2-p4', '¿Por qué el Cl desactiva el anillo pero lo orienta a orto/para?', [{ text: 'Saca electrones por σ (inductivo) pero dona un par por resonancia al complejo σ', correct: true }, { text: 'Porque es grande', note: 'El tamaño no explica la orientación.' }, { text: 'Porque es un ácido de Lewis', note: 'El ácido de Lewis es el AlCl₃, no el Cl del anillo.' }],
                { concept: 'sea.halogenos', explain: 'Dos efectos opuestos: el inductivo decide la velocidad; la resonancia, la posición.', slide: 31, hint: 'Piensa en dos efectos.', misconception: 'halogen-meta' }),
              classify('m2-p5', 'Clasifica cada caso según quién decide la posición:', [['first', 'Manda el primer grupo nombrado'], ['second', 'Manda el segundo grupo nombrado']],
                [['a', '–OCH₃ frente a –NO₂', 'first'], ['b', '–CH₃ frente a –OH', 'second'], ['c', '–NH₂ frente a –COOH', 'first'], ['d', '–CN frente a –CH₃', 'second']],
                { concept: 'sea.multiples', explain: 'Manda el activador más fuerte.', slide: 35, hint: 'Clase 1 (–OH, –OR, –NR₂) > clase 2 (–R, –X) > meta.', misconception: 'activator-loses' }),
              spot('m2-fx1', 'Un aprendiz predijo la nitración del bromobenceno. ¿En qué paso se equivocó?', ['El Br saca electrones por σ: el anillo reacciona más lento', 'Como desactiva, el NO₂ entra en meta', 'Producto principal: m-bromonitrobenceno'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'Los halógenos orientan a orto/para: sale o- y p-bromonitrobenceno', correct: true }, { text: 'Entra en el mismo C del Br', note: 'Eso sería otra reacción.' }] },
                { concept: 'sea.halogenos', slide: 31, stepNotes: { 0: 'Correcto: desactiva.', 2: 'Viene del error anterior.' }, explain: 'Desactiva, pero orto/para.', hint: 'Los halógenos son la excepción.', misconception: 'halogen-meta' })
            ],
            rule: { title: 'Regla del sabio: dos grupos', concept: 'sea.multiples', steps: ['Halógenos: desactivan pero orto/para', 'Si se oponen, manda el más fuerte: –OH/–OR/–NR₂ > –R/–X > meta', 'La posición entre dos grupos está impedida'] } }
        ]
      },
      {
        id: 'm3', title: 'Friedel-Crafts y síntesis', subtitle: 'Pegar carbonos, planificar el orden y la SNA', minutes: 30, slides: '38–49', pep: 'P5: síntesis',
        stages: {
          hook: { title: 'El orden lo es todo', sage: 'Quieres m-bromonitrobenceno. Si brominas primero y nitras después, te sale orto/para. Si nitras primero, el NO₂ manda a meta y aciertas. En síntesis aromática, el orden es la respuesta.',
            text: 'La pregunta P5 de la PEP suele ser "desde benceno, propone la síntesis de…". Tienes que elegir las reacciones y el orden según quién orienta a dónde, y evitar las trampas de Friedel-Crafts.' },
          diagnostic: [
            q('m3-d1', '¿Qué sale principalmente de benceno + 1-cloropropano / AlCl₃?', [{ text: 'Isopropilbenceno (el carbocatión se reordena)', correct: true }, { text: 'Propilbenceno', misconception: 'fc-rearrange' }, { text: 'Nada', note: 'Sí reacciona.' }],
              { concept: 'sea.friedel', explain: 'El carbocatión primario se reordena al secundario.', slide: 41 }),
            q('m3-d2', 'Para obtener **m**-bromonitrobenceno desde benceno, ¿qué haces primero?', [{ text: 'Nitrar', correct: true }, { text: 'Brominar', misconception: 'synthesis-order' }, { text: 'Da lo mismo', note: 'El primer grupo decide dónde entra el segundo.' }],
              { concept: 'sea.sintesis', explain: 'El NO₂ es meta-orientador: así el Br entra en meta.', slide: 45 })
          ],
          fundamentals: [
            { id: 'm3f1', concept: 'base.carbocation', title: 'Desde cero: los carbocationes se reordenan', slide: 41, body: 'Un carbocatión 1° es tan inestable que, si puede, un H (o un CH₃) vecino salta con su par al C⁺: el C⁺ se mueve a un C más sustituido (2° o 3°). Por eso la alquilación con cadenas de 3 C o más suele dar el producto **ramificado**.',
              deeper: 'CH₃CH₂CH₂⁺ (1°) → CH₃CH⁺CH₃ (2°) con un desplazamiento de hidruro. El ion acilio (R–C≡O⁺) está estabilizado por resonancia y **no** se reordena: por eso la acilación es la vía segura.' }
          ],
          explain: [],
          transfer: [
            cauldron('m3-t1', 'Estilo PEP (P5): desde benceno, prepara **propilbenceno** (cadena lineal, sin reordenamiento). Elige en orden.', 'Benceno', 'propilbenceno (C₆H₅–CH₂CH₂CH₃)',
              [['acil', 'CH₃CH₂COCl / AlCl₃'], ['clem', 'Zn(Hg) / HCl (Clemmensen)'], ['alq', 'CH₃CH₂CH₂Cl / AlCl₃'], ['nit', 'HNO₃ / H₂SO₄'], ['red', 'Fe / HCl']], ['acil', 'clem'],
              { alq: 'La alquilación directa se reordena y da isopropilbenceno.', nit: 'No hace falta un N.', red: 'No hay NO₂ que reducir.' },
              { concept: 'sea.friedel', slide: 43, orderNote: 'Primero la acilación (no se reordena), después Clemmensen reduce el C=O a CH₂.', explain: 'Acilación + Clemmensen.', hint: 'Evita el carbocatión primario.', misconception: 'fc-rearrange' }),
            cauldron('m3-t2', 'Estilo PEP (P5): desde benceno, prepara **m-bromonitrobenceno**. Elige en orden.', 'Benceno', 'm-bromonitrobenceno', shelf(['nit', 'br', 'red', 'sul']), ['nit', 'br'],
              { red: 'Reducir convertiría el NO₂ en NH₂.', sul: 'No hace falta sulfonar.' },
              { concept: 'sea.sintesis', slide: 45, orderNote: 'Si brominas primero, el Br (orto/para) manda y sale o/p. Primero el NO₂ (meta).', explain: 'Nitrar y después brominar: el NO₂ orienta a meta.', hint: '¿Quién orienta a meta?', misconception: 'synthesis-order' }),
            write('m3-w1', 'Enséñale a tu compañero: ¿por qué no se puede hacer Friedel-Crafts sobre nitrobenceno, y cómo se planifica para evitarlo?', 'Porque el NO₂ desactiva tanto el anillo que el carbocatión o el ion acilio no logran formar el complejo σ: Friedel-Crafts falla con anillos fuertemente desactivados. Para evitarlo se hace primero la reacción de Friedel-Crafts y después se pone el grupo desactivador.',
              ['El NO₂ desactiva fuertemente el anillo', 'Friedel-Crafts falla con anillos fuertemente desactivados', 'Se planifica haciendo Friedel-Crafts antes de poner el desactivador'],
              { concept: 'sea.sintesis', explain: 'El orden evita la limitación.', slide: 41, teach: true, keywords: [{ label: 'desactiva', any: ['desactiv'] }, { label: 'antes / primero', any: ['antes', 'primero', 'orden'] }] })
          ]
        },
        parts: [
          { id: 'r1', intro: 'Parte 1: **Friedel-Crafts**.',
            pretest: q('m3-pre1', 'Adivina antes: ¿por qué la acilación de Friedel-Crafts no da poliacilación?', [{ text: 'El C=O que entra desactiva el anillo', correct: true }, { text: 'Porque se usa poco reactivo', note: 'Aunque sobre reactivo, no se poliacila.' }, { text: 'Sí da poliacilación', note: 'Eso le pasa a la alquilación.' }],
              { concept: 'sea.friedel', explain: 'La fenona formada está desactivada.', slide: 43 }),
            explain: [
              { id: 'm3b1', concept: 'sea.friedel', title: 'Alquilación y acilación', slide: 38, body: '**Alquilación**: R–Cl/AlCl₃ (o alqueno + HF, o alcohol + BF₃) → carbocatión → Ar–R. **Tres limitaciones**: (1) **falla con anillos desactivados** (nitro, SO₃H, fenonas); (2) el carbocatión **se reordena** (1-cloropropano → isopropilbenceno); (3) **polialquilación** (el alquilo activa el anillo). **Acilación**: R–COCl/AlCl₃ → **ion acilio** (no se reordena) → **fenona** Ar–CO–R; no se poliacila. **Clemmensen** (Zn(Hg)/HCl) reduce el C=O a CH₂.',
                deeper: 'Truco de PEP: si piden una cadena lineal de 3 o más C, la respuesta casi siempre es "acilación + Clemmensen". Con t-butilo, isopropilo o etilo la alquilación directa funciona (no hay reordenamiento posible).' }
            ],
            practice: [
              classify('m3-p1', '¿Se puede hacer con alquilación de Friedel-Crafts directa?', [['yes', 'Sí, directa'], ['no', 'No: acilación + Clemmensen (o no funciona)']],
                [['a', 't-butilbenceno', 'yes'], ['b', 'propilbenceno', 'no'], ['c', 'isopropilbenceno', 'yes'], ['d', 'butilbenceno', 'no'], ['e', 'etilbenceno', 'yes']],
                { concept: 'sea.friedel', explain: 'Cadenas lineales de 3+ C se reordenan.', slide: 41, hint: '¿El carbocatión puede hacerse más estable moviendo un H?', misconception: 'fc-rearrange' }),
              q('m3-p2', '¿Qué pasa al tratar nitrobenceno con CH₃COCl / AlCl₃?', [{ text: 'No reacciona: está fuertemente desactivado', correct: true }, { text: 'Da m-nitroacetofenona', misconception: 'fc-deactivated' }, { text: 'Da o- y p-nitroacetofenona', note: 'El NO₂ es meta, pero aquí ni siquiera reacciona.' }],
                { concept: 'sea.friedel', explain: 'Friedel-Crafts falla con anillos fuertemente desactivados.', slide: 41, hint: 'Limitación 1.' }),
              match('m3-p3', 'Une cada limitación de la alquilación con su solución:', [['Reordenamiento del carbocatión', 'Acilación + Clemmensen'], ['Polialquilación', 'Usar exceso de benceno (o acilar)'], ['Anillo desactivado', 'Hacer Friedel-Crafts antes de poner el desactivador']],
                { concept: 'sea.friedel', explain: 'Cada trampa tiene su salida.', slide: 41, hint: 'Piensa en el ion acilio.' })
            ],
            recipe: R('rc-fcacil') },
          { id: 'r2', intro: 'Parte 2: **planificar el orden**.',
            pretest: q('m3-pre2', 'Adivina antes: para p-bromonitrobenceno desde benceno, ¿qué haces primero?', [{ text: 'Brominar (el Br orienta a para)', correct: true }, { text: 'Nitrar', misconception: 'synthesis-order' }, { text: 'Reducir', note: 'No hay nada que reducir al inicio.' }],
              { concept: 'sea.sintesis', explain: 'El Br es o/p; el NO₂ es meta.', slide: 45 }),
            explain: [
              { id: 'm3b2', concept: 'sea.sintesis', title: 'Planificar una síntesis', slide: 45, body: 'Para un **disustituido**: (1) mira la relación pedida (orto/para o meta); (2) pon **primero** el grupo que oriente a esa posición; (3) revisa las trampas: Friedel-Crafts **antes** de cualquier desactivador; cadenas lineales por **acilación + Clemmensen**; un **NH₂** se pone como **NO₂** y se reduce al final (y recuerda: NO₂ es meta, NH₂ es o/p).',
                deeper: 'Truco: a veces conviene poner un grupo, usarlo para orientar y después transformarlo. Ejemplo: m-bromoanilina → nitrar (meta), brominar (entra meta al NO₂), reducir el NO₂ a NH₂. Si partieras con NH₂ (o/p) no podrías llegar a meta.' }
            ],
            practice: [
              cauldron('m3-p4', 'Desde benceno, prepara **p-bromonitrobenceno**. Elige en orden.', 'Benceno', 'p-bromonitrobenceno', shelf(['br', 'nit', 'red', 'sul']), ['br', 'nit'],
                { red: 'No hay que reducir el NO₂.', sul: 'No hace falta sulfonar.' },
                { concept: 'sea.sintesis', slide: 45, orderNote: 'El Br (o/p) va primero; después la nitración entra en para (y orto, que se separa).', explain: 'Brominar y después nitrar.', hint: '¿Quién orienta a para?', misconception: 'synthesis-order' }),
              cauldron('m3-p5', 'Desde benceno, prepara **m-bromoanilina**. Elige en orden.', 'Benceno', 'm-bromoanilina', shelf(['nit', 'br', 'red', 'acil', 'sul']), ['nit', 'br', 'red'],
                { acil: 'No hace falta un C=O.', sul: 'No hace falta sulfonar.' },
                { concept: 'sea.sintesis', slide: 45, orderNote: 'NO₂ primero (meta), luego Br en meta, y al final reducir a NH₂.', explain: 'Nitrar, brominar, reducir.', hint: 'Usa el NO₂ para orientar y conviértelo al final.', misconception: 'synthesis-order' }),
              spot('m3-fx1', 'Un aprendiz planificó la m-nitroacetofenona. ¿En qué paso se equivocó?', ['Benceno + HNO₃/H₂SO₄ → nitrobenceno', 'Nitrobenceno + CH₃COCl/AlCl₃ → m-nitroacetofenona', 'Producto final listo'], 1,
                { question: '¿Cómo se corrige?', options: [{ text: 'Acilar primero (acetofenona) y después nitrar: el C=O orienta a meta', correct: true }, { text: 'Usar más AlCl₃', note: 'El problema es el anillo desactivado, no el catalizador.', misconception: 'fc-deactivated' }] },
                { concept: 'sea.sintesis', slide: 41, stepNotes: { 0: 'Bien en sí, pero deja el anillo desactivado para lo que viene.', 2: 'No llega a formarse.' }, explain: 'Friedel-Crafts antes del desactivador; el acetilo también es meta.', hint: 'Limitación 1 de Friedel-Crafts.' }),
              q('m3-p9', 'Para **p-nitrotolueno** desde benceno, ¿qué orden sirve?', [{ text: 'Metilar (CH₃Cl/AlCl₃) y después nitrar', correct: true }, { text: 'Nitrar y después metilar', note: 'Friedel-Crafts falla sobre el nitrobenceno.', misconception: 'fc-deactivated' }, { text: 'Da lo mismo', note: 'El orden decide la posición y si la reacción funciona.' }],
                { concept: 'sea.sintesis', explain: 'El CH₃ es o/p y Friedel-Crafts va antes del NO₂.', slide: 45, hint: 'Dos razones apuntan al mismo orden.' })
            ],
            rule: { title: 'Regla del sabio: el orden de la síntesis', concept: 'sea.sintesis', steps: ['¿Orto/para o meta? Pon primero el grupo que oriente ahí', 'Friedel-Crafts antes de cualquier desactivador', 'NH₂ = NO₂ reducido al final; cadena lineal = acilación + Clemmensen'] } },
          { id: 'r3', intro: 'Parte 3: **sustitución nucleofílica aromática (SNA)**.',
            pretest: q('m3-pre3', 'Adivina antes: ¿el clorobenceno reacciona con NaOH a temperatura ambiente?', [{ text: 'No: sin grupos atractores no hay SNA', correct: true }, { text: 'Sí, por SN2', note: 'El anillo bloquea el ataque por detrás.' }, { text: 'Sí, por SEA', note: 'El OH⁻ es nucleófilo, no electrófilo.' }],
              { concept: 'sea.sna', explain: 'La SNA necesita NO₂ en orto o para.', slide: 49 }),
            explain: [
              { id: 'm3b3', concept: 'sea.sna', title: 'Sustitución nucleofílica aromática', slide: 49, body: 'Un **nucleófilo fuerte** (OH⁻, RO⁻, NH₃) reemplaza a un **haluro** del anillo **solo si** hay grupos atractores fuertes (**NO₂**) en **orto o para** al haluro. El intermediario tiene carga **negativa** que el NO₂ estabiliza por resonancia. No es SN2: el anillo impide el ataque por detrás.',
                deeper: 'Es el espejo de la SEA: allá el anillo rico ataca a un electrófilo y el intermediario es +; aquí un nucleófilo ataca a un anillo pobre y el intermediario es −. Por eso aquí los NO₂ ayudan (y en orto/para, que es donde cae la carga). El 2,4-dinitroclorobenceno reacciona fácil; el m-nitroclorobenceno, casi nada.' }
            ],
            practice: [
              order('m3-p6', 'Ordena de MENOS a MÁS reactivo frente a NaOH (SNA):', [['a', 'Clorobenceno'], ['b', 'm-nitroclorobenceno'], ['c', 'p-nitroclorobenceno'], ['d', '2,4-dinitroclorobenceno']], ['a', 'b', 'c', 'd'],
                { concept: 'sea.sna', direction: 'De menos a más reactivo.', explain: 'Más NO₂ en orto/para = más reactivo; en meta ayuda poco.', slide: 49, hint: 'Cuenta los NO₂ en orto/para.', misconception: 'sna-no-ewg' }),
              q('m3-p7', '¿Por qué un NO₂ en para acelera la SNA y uno en meta casi no?', [{ text: 'En para, la carga − del intermediario llega hasta el NO₂ por resonancia', correct: true }, { text: 'Porque en meta el NO₂ estorba', note: 'No es por estorbo.' }, { text: 'Porque el NO₂ en para es nucleófilo', note: 'El NO₂ atrae electrones: estabiliza la carga −.' }],
                { concept: 'sea.sna', explain: 'La carga negativa cae en orto/para del C atacado.', slide: 49, hint: '¿Dónde queda la carga negativa?' }),
              classify('m3-p8', '¿SEA o SNA?', [['sea', 'SEA (entra un electrófilo)'], ['sna', 'SNA (entra un nucleófilo)']],
                [['a', 'Benceno + Br₂/FeBr₃', 'sea'], ['b', '2,4-dinitroclorobenceno + NaOH', 'sna'], ['c', 'Tolueno + HNO₃/H₂SO₄', 'sea'], ['d', 'p-nitrofluorobenceno + CH₃O⁻', 'sna']],
                { concept: 'sea.sna', explain: 'Anillo rico + electrófilo: SEA. Anillo pobre con haluro + nucleófilo: SNA.', slide: 49, hint: '¿Quién ataca a quién?' })
            ],
            rule: { title: 'Regla del sabio: SNA', concept: 'sea.sna', steps: ['Necesita un haluro y NO₂ (atractor) en orto o para', 'Nucleófilo fuerte: OH⁻, RO⁻, NH₃', 'Intermediario con carga negativa; no es SN2'] } }
        ]
      }
    ],
    base: [
      { id: 'z1', concept: 'base.electrofilo', title: 'Electrófilos', subtitle: 'Quién busca electrones y cómo se activa', minutes: 6,
        stages: {
          explain: [{ id: 'z1b1', concept: 'base.electrofilo', title: 'Electrófilos y ácidos de Lewis', slide: 6, body: '**Electrófilo**: especie pobre en electrones (carga +, o un átomo δ+). **Nucleófilo**: rica en electrones (par libre o π). Un **ácido de Lewis** acepta un par: FeBr₃, AlCl₃ y BF₃ tienen un orbital vacío. Al unirse a Br₂ o a R–Cl, generan un electrófilo fuerte.',
            deeper: 'Ejemplos de electrófilos de la SEA: Br⁺ (Br₂/FeBr₃), Cl⁺ (Cl₂/AlCl₃), NO₂⁺, SO₃, R⁺ (carbocatión), R–C≡O⁺ (acilio).' }],
          practice: [
            classify('z1-p1', 'Clasifica:', [['e', 'Electrófilo'], ['n', 'Nucleófilo']], [['a', 'NO₂⁺', 'e'], ['b', 'OH⁻', 'n'], ['c', 'Carbocatión (CH₃)₃C⁺', 'e'], ['d', 'NH₃', 'n'], ['e', 'SO₃', 'e']],
              { concept: 'base.electrofilo', explain: 'Pobre en electrones = electrófilo; con pares = nucleófilo.', slide: 6, hint: '¿Busca o da electrones?' }),
            q('z1-p2', 'El AlCl₃ es un ácido de Lewis porque…', [{ text: 'Tiene un orbital vacío y acepta un par', correct: true }, { text: 'Libera H⁺', note: 'Eso es Brønsted.' }, { text: 'Tiene muchos Cl', note: 'Lo importante es el Al con orbital vacío.' }], { concept: 'base.electrofilo', explain: 'Aceptor de pares.', slide: 6, hint: 'Lewis = pares.' })
          ],
          transfer: [write('z1-w1', 'Explica qué hace el FeBr₃ en la bromación del benceno.', 'El FeBr₃ es un ácido de Lewis: acepta un par de electrones de un Br del Br₂. Eso polariza el enlace Br–Br y deja al otro Br muy pobre en electrones, como un Br⁺ efectivo, que sí puede ser atacado por el benceno. Al final el FeBr₃ se regenera.',
            ['El FeBr₃ es un ácido de Lewis (acepta un par)', 'Polariza el Br₂: queda un Br⁺ efectivo', 'Se regenera al final (catalizador)'],
            { concept: 'base.electrofilo', explain: 'Activa al halógeno.', slide: 6, keywords: [{ label: 'ácido de Lewis', any: ['lewis'] }, { label: 'polariza', any: ['polariz', 'br+', 'br⁺'] }] })]
        } },
      { id: 'z2', concept: 'base.carbocation', title: 'Carbocationes', subtitle: 'Qué los estabiliza', minutes: 6,
        stages: {
          explain: [{ id: 'z2b1', concept: 'base.carbocation', title: 'Estabilidad de carbocationes', slide: 17, body: 'Orden: **3° > 2° > 1° > metilo**, porque los alquilos donan electrones. La **resonancia** (repartir la carga en varios C) estabiliza mucho, y un **O o N vecino** con par libre aún más. Un grupo con carga + al lado desestabiliza.',
            deeper: 'En el complejo σ la carga + está en orto y para del C atacado. Un sustituyente en esos C la estabiliza (alquilo, OR, NH₂) o la desestabiliza (NO₂, C=O). De ahí sale toda la orientación.' }],
          practice: [
            order('z2-p1', 'Ordena de MENOS a MÁS estable:', [['a', 'CH₃⁺'], ['b', 'CH₃CH₂⁺ (1°)'], ['c', '(CH₃)₂CH⁺ (2°)'], ['d', '(CH₃)₃C⁺ (3°)']], ['a', 'b', 'c', 'd'],
              { concept: 'base.carbocation', direction: 'De menos a más estable.', explain: 'Cada alquilo dona algo de densidad.', slide: 17, hint: 'Más alquilos, más estable.' }),
            q('z2-p2', '¿Qué estabiliza más a un carbocatión?', [{ text: 'Un O vecino con par libre (resonancia)', correct: true }, { text: 'Un NO₂ vecino', note: 'El NO₂ lo desestabiliza.' }, { text: 'Estar en un C primario', note: 'Primario es de los menos estables.' }], { concept: 'base.carbocation', explain: 'El O comparte su par.', slide: 21, hint: 'Resonancia con un par libre.' })
          ],
          transfer: [write('z2-w1', 'Explica por qué un carbocatión terciario es más estable que uno primario.', 'Porque el C terciario está unido a tres grupos alquilo que donan densidad electrónica (por efecto inductivo e hiperconjugación) y reparten la carga positiva. El primario tiene solo un alquilo, así que la carga queda más concentrada y es menos estable.',
            ['Los alquilos donan densidad electrónica', 'El terciario tiene tres alquilos que reparten la carga', 'El primario concentra más la carga: menos estable'],
            { concept: 'base.carbocation', explain: 'Más alquilos, más estable.', slide: 17, keywords: [{ label: 'alquilos donan', any: ['dona', 'alquil'] }, { label: 'carga repartida', any: ['repart', 'dispers', 'concentr'] }] })]
        } }
    ],
    formulas: [],
    recipes,
    mini: {
      'base.electrofilo': { idea: 'El benceno es un nucleófilo débil: necesita un electrófilo fuerte.', steps: ['Electrófilo = pobre en electrones', 'Ácido de Lewis acepta un par', 'Así se crean Br⁺, NO₂⁺, R⁺, RCO⁺'], check: { prompt: 'El electrófilo de la nitración es…', options: [{ text: 'NO₂⁺', correct: true }, { text: 'HNO₃', note: 'El HNO₃ es la fuente; el electrófilo es NO₂⁺.' }], explain: 'Ion nitronio.' } },
      'base.carbocation': { idea: 'Más alquilos o resonancia = carga más repartida = más estable.', steps: ['3° > 2° > 1°', 'Resonancia ayuda mucho', 'O o N vecino: aún más'], check: { prompt: '¿Cuál es más estable?', options: [{ text: '(CH₃)₃C⁺', correct: true }, { text: 'CH₃CH₂⁺', note: 'Primario.' }], explain: 'Terciario.' } },
      'sea.mecanismo': { idea: 'Atacar (lento, se pierde la aromaticidad) y devolver el H⁺ (rápido, se recupera).', steps: ['Los π atacan al E⁺', 'Complejo σ: carga + en orto y para', 'Sale H⁺: sustitución'], check: { prompt: 'El paso lento es…', options: [{ text: 'Formar el complejo σ', correct: true }, { text: 'Perder el H⁺', note: 'Ese es rápido.' }], explain: 'Se rompe la aromaticidad.' } },
      'sea.halogenacion': { idea: 'El halógeno solo no alcanza: el ácido de Lewis lo activa.', steps: ['Br₂ + FeBr₃', 'Cl₂ + AlCl₃', 'I₂ + HNO₃ (oxidante)'], check: { prompt: 'Para clorar el benceno usas…', options: [{ text: 'Cl₂ / AlCl₃', correct: true }, { text: 'Cl₂ solo', note: 'Falta el ácido de Lewis.' }], explain: 'Ácido de Lewis.' } },
      'sea.nitracion': { idea: 'NO₂⁺ entra; luego Fe/HCl lo convierte en NH₂.', steps: ['HNO₃/H₂SO₄ → NO₂⁺', 'Ar–NO₂', 'Fe o Sn/HCl → Ar–NH₂'], check: { prompt: 'La sulfonación es…', options: [{ text: 'Reversible', correct: true }, { text: 'Irreversible', note: 'Con H₂SO₄ diluido y calor se revierte.' }], explain: 'Reversible.' } },
      'sea.activadores': { idea: 'Donadores aceleran y mandan a orto/para; atractores frenan y mandan a meta.', steps: ['Par libre o alquilo → o/p', 'C=O, NO₂, CN, SO₃H → meta', 'Mira dónde cae la carga del complejo σ'], check: { prompt: '–COCH₃ en el anillo…', options: [{ text: 'Desactiva, meta', correct: true }, { text: 'Activa, o/p', note: 'El C del C=O es δ+.' }], explain: 'Carbonilo: meta.' } },
      'sea.halogenos': { idea: 'Halógenos: frenan por σ, pero donan un par al complejo σ.', steps: ['Inductivo: desactivan', 'Resonancia: orto/para', 'Resultado: lentos pero o/p'], check: { prompt: 'Nitrar bromobenceno da sobre todo…', options: [{ text: 'o- y p-bromonitrobenceno', correct: true }, { text: 'm-bromonitrobenceno', note: 'El Br es o/p.' }], explain: 'o/p.' } },
      'sea.multiples': { idea: 'Si no se ponen de acuerdo, manda el más fuerte.', steps: ['Clase 1: –OH, –OR, –NR₂', 'Clase 2: –R, –X', 'Clase 3: meta'], check: { prompt: '–OH frente a –CH₃: manda…', options: [{ text: '–OH', correct: true }, { text: '–CH₃', note: 'El –OH es más fuerte.' }], explain: 'Clase 1.' } },
      'sea.friedel': { idea: 'Pegar carbonos: ojo con reordenamientos y anillos desactivados.', steps: ['R–Cl/AlCl₃: alquilación (se reordena)', 'RCOCl/AlCl₃: acilación (no se reordena)', 'Clemmensen: C=O → CH₂'], check: { prompt: 'Para propilbenceno lineal…', options: [{ text: 'Acilación + Clemmensen', correct: true }, { text: 'Alquilación con 1-cloropropano', note: 'Se reordena.' }], explain: 'Vía acilio.' } },
      'sea.sintesis': { idea: 'El primer grupo decide dónde entra el segundo.', steps: ['¿o/p o meta?', 'Primero el que oriente ahí', 'Friedel-Crafts antes de desactivar; NH₂ = NO₂ reducido'], check: { prompt: 'm-nitrobromobenceno: primero…', options: [{ text: 'Nitrar', correct: true }, { text: 'Brominar', note: 'El Br mandaría a o/p.' }], explain: 'NO₂ es meta.' } },
      'sea.sna': { idea: 'Anillo pobre + nucleófilo + haluro, con NO₂ en orto/para.', steps: ['Haluro en el anillo', 'NO₂ en orto o para', 'Nucleófilo fuerte'], check: { prompt: '¿Qué reacciona por SNA?', options: [{ text: '2,4-dinitroclorobenceno + NaOH', correct: true }, { text: 'Clorobenceno + NaOH', note: 'Sin NO₂ no hay SNA.' }], explain: 'Necesita atractores.' } }
    },
    deep: {
      'sea.activadores': { title: 'Diagramas de energía: por qué orto/para o meta', sections: [['El postulado de Hammond', 'El primer paso es endotérmico: el estado de transición se parece al complejo σ. Si el complejo σ es más estable, la barrera es más baja.'], ['Tolueno', 'Orto y para dan una forma con C⁺ terciario: barrera más baja que en meta y que en el benceno.'], ['Nitrobenceno', 'Todas las posiciones son más lentas que el benceno, pero orto y para mucho más: queda meta como "la menos mala".']],
        challenge: { prompt: 'Según esto, la sustitución meta del tolueno es…', options: [{ text: 'Parecida en velocidad a la del benceno', correct: true }, { text: 'Mucho más rápida que la orto', note: 'Es al revés.' }], explain: 'En meta el CH₃ no estabiliza la carga.' },
        sources: [{ label: 'Aromáticos II, nitración del tolueno', slide: 17 }, { label: 'McMurry, cap. 16 (LibreTexts)', url: 'https://chem.libretexts.org/' }] }
    },
    diagnosis: { start: 2, max: 7, items: [
      { level: 1, item: q('dx-1', '¿Cuál es un electrófilo?', [{ text: 'NO₂⁺', correct: true }, { text: 'OH⁻', note: 'Es nucleófilo.' }, { text: 'NH₃', note: 'Es nucleófilo.' }], { concept: 'base.electrofilo', explain: 'Carga +, busca electrones.', slide: 6 }) },
      { level: 1, item: q('dx-2', '¿Cuál carbocatión es más estable?', [{ text: '3°', correct: true }, { text: '1°', note: 'Menos alquilos.' }, { text: 'Metilo', note: 'El menos estable.' }], { concept: 'base.carbocation', explain: '3° > 2° > 1°.', slide: 17 }) },
      { level: 2, item: q('dx-3', 'Para brominar el benceno usas…', [{ text: 'Br₂ / FeBr₃', correct: true }, { text: 'Br₂ solo', misconception: 'no-lewis' }, { text: 'HBr', note: 'HBr no hace SEA.' }], { concept: 'sea.halogenacion', explain: 'Ácido de Lewis.', slide: 6 }) },
      { level: 2, item: q('dx-4', 'El –OH en un benceno…', [{ text: 'Activa, orto/para', correct: true }, { text: 'Desactiva, meta', misconception: 'nitro-op' }, { text: 'Desactiva, orto/para', note: 'Eso son los halógenos.' }], { concept: 'sea.activadores', explain: 'Dona un par por resonancia.', slide: 34 }) },
      { level: 2, item: q('dx-5', 'Anilina desde benceno: …', [{ text: 'Nitrar y reducir', correct: true }, { text: 'Benceno + NH₃', note: 'El NH₃ no es electrófilo.' }, { text: 'Sulfonar y reducir', note: 'El SO₃H no da NH₂.' }], { concept: 'sea.nitracion', explain: 'NO₂ → NH₂.', slide: 13 }) },
      { level: 3, item: q('dx-6', 'Benceno + 1-cloropropano/AlCl₃ da principalmente…', [{ text: 'Isopropilbenceno', correct: true }, { text: 'Propilbenceno', misconception: 'fc-rearrange' }, { text: 'Nada', note: 'Sí reacciona.' }], { concept: 'sea.friedel', explain: 'Reordenamiento.', slide: 41 }) },
      { level: 3, item: q('dx-7', 'Para m-bromonitrobenceno, el primer paso es…', [{ text: 'Nitrar', correct: true }, { text: 'Brominar', misconception: 'synthesis-order' }, { text: 'Da lo mismo', note: 'El orden decide.' }], { concept: 'sea.sintesis', explain: 'NO₂ es meta.', slide: 45 }) }
    ] }
  };
})();
