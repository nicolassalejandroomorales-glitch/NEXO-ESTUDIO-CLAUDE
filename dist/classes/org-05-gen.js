/* Ejercicios infinitos de SEA (Orgánica II, PEP 1). 5 niveles: 1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP.
   La orientación y el orden de síntesis se DEDUCEN de una tabla de sustituyentes (clase y efecto), no se escriben a mano. */
(() => {
  'use strict';
  const SRC = 'catedra-sea';
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
  const order = (prompt, cards, answer, extra) => ({ type: 'order', prompt, cards, answer, ...extra });

  /* Sustituyentes: cls 1 = activador fuerte o/p, 2 = moderado o/p, 3 = halógeno (desactiva, o/p), 4 = desactivador meta.
     rate = reactividad relativa aproximada para ordenar (solo el orden importa). */
  const SUB = [
    { g: '–NH₂', name: 'anilina', cls: 1, rate: 6 }, { g: '–OH', name: 'fenol', cls: 1, rate: 5.5 }, { g: '–OCH₃', name: 'anisol', cls: 1, rate: 5 }, { g: '–N(CH₃)₂', name: 'N,N-dimetilanilina', cls: 1, rate: 6 },
    { g: '–NHCOCH₃', name: 'acetanilida', cls: 2, rate: 3 }, { g: '–CH₃', name: 'tolueno', cls: 2, rate: 2 }, { g: '–CH₂CH₃', name: 'etilbenceno', cls: 2, rate: 2 },
    { g: '–Cl', name: 'clorobenceno', cls: 3, rate: -1 }, { g: '–Br', name: 'bromobenceno', cls: 3, rate: -1.2 }, { g: '–F', name: 'fluorobenceno', cls: 3, rate: -0.5 },
    { g: '–NO₂', name: 'nitrobenceno', cls: 4, rate: -5 }, { g: '–CN', name: 'benzonitrilo', cls: 4, rate: -4 }, { g: '–COCH₃', name: 'acetofenona', cls: 4, rate: -3 },
    { g: '–CHO', name: 'benzaldehído', cls: 4, rate: -3 }, { g: '–COOH', name: 'ácido benzoico', cls: 4, rate: -3 }, { g: '–SO₃H', name: 'ácido bencenosulfónico', cls: 4, rate: -4 }
  ];
  const where = s => (s.cls === 4 ? 'meta' : 'orto y para');
  const speed = s => (s.cls <= 2 ? 'más rápido' : 'más lento');
  const WHY = { 1: 'dona un par por resonancia al complejo σ', 2: 'dona densidad (alquilo o amida) y estabiliza la carga en orto/para', 3: 'saca electrones por σ (más lento) pero dona un par por resonancia (orto/para)', 4: 'tiene carga + o δ+ junto al anillo: en orto/para pondría dos cargas + juntas' };
  const E = ['Br₂/FeBr₃', 'HNO₃/H₂SO₄', 'Cl₂/AlCl₃', 'SO₃/H₂SO₄'];

  /* Afirmaciones (cátedra + McMurry cap. 16): hechos verdaderos (T) y errores típicos (F: [texto, por qué, error típico]).
     Se preguntan como "¿cuál es correcta?", "¿cuál es INCORRECTA?" o "¿cuántas son verdaderas?" (formato V/F de la PEP). */
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
  const BANK = {
    halogenos: { topic: 'Halógenos como sustituyentes', T: ['Los halógenos desactivan el anillo frente a la SEA.', 'Los halógenos orientan a orto y para.', 'El clorobenceno reacciona más lento que el benceno.', 'El efecto inductivo de los halógenos saca densidad del anillo.', 'Un par libre del halógeno estabiliza el complejo σ en orto/para.', 'La nitración del clorobenceno da sobre todo p-cloronitrobenceno.'],
      F: [['Los halógenos orientan a meta porque desactivan.', 'desactivan, pero orientan a orto/para por su par libre.', 'halogen-meta'], ['Los halógenos activan el anillo como el –OH.', 'su efecto inductivo gana: desactivan.', 'halogen-meta'], ['El bromobenceno reacciona más rápido que el benceno.', 'reacciona más lento.', 'halogen-meta'], ['Todo grupo que desactiva orienta a meta.', 'los halógenos son la excepción: desactivan y orientan a orto/para.', 'halogen-meta']] },
    mecanismo: { topic: 'Mecanismo de la SEA', T: ['El paso lento de la SEA es la formación del complejo σ.', 'El complejo σ es un carbocatión no aromático.', 'En el complejo σ la carga + queda en los C orto y para al C atacado.', 'La pérdida del H⁺ es rápida porque devuelve la aromaticidad.', 'El anillo actúa como nucleófilo con sus electrones π.', 'Sin catalizador, el Br₂ no es suficientemente electrófilo para el benceno.'],
      F: [['El complejo σ sigue siendo aromático.', 'el C atacado es sp³: se corta el anillo de orbitales p.', 'sigma-aromatic'], ['El paso lento es la pérdida del H⁺.', 'el lento es formar el complejo σ.', 'sigma-aromatic'], ['El benceno da adición porque el Br⁻ ataca el complejo σ.', 'pierde H⁺ y vuelve a ser aromático: sustitución.', 'adds-not-subs'], ['En el complejo σ la carga + queda en los C meta.', 'queda en orto y para al C atacado.', 'sigma-aromatic'], ['El catalizador FeBr₃ actúa como nucleófilo.', 'es un ácido de Lewis que activa al Br₂.', 'no-lewis']] },
    friedel: { topic: 'Friedel-Crafts', T: ['La alquilación de Friedel-Crafts puede dar reordenamientos del carbocatión.', 'El ion acilio no se reordena.', 'La acilación se detiene en un solo grupo porque la cetona desactiva el anillo.', 'La alquilación puede dar polialquilación porque el alquilo activa el anillo.', 'Friedel-Crafts no funciona sobre nitrobenceno.', 'Con anilina falla: el NH₂ se une al AlCl₃ y desactiva el anillo.', 'Acilar y luego reducir con Zn(Hg)/HCl da una cadena lineal sin reordenar.'],
      F: [['El ion acilio se reordena igual que un carbocatión primario.', 'el acilio está estabilizado por resonancia y no se reordena.', 'fc-rearrange'], ['La acilación da muchos productos poliacilados.', 'la cetona desactiva el anillo: se detiene en uno.', 'fc-rearrange'], ['Friedel-Crafts funciona bien sobre nitrobenceno.', 'el anillo está demasiado desactivado.', 'fc-deactivated'], ['CH₃CH₂CH₂Cl/AlCl₃ da propilbenceno sin reordenar.', 'el primario se reordena: da isopropilbenceno.', 'fc-rearrange'], ['El AlCl₃ es la fuente del grupo alquilo.', 'el AlCl₃ es el ácido de Lewis; el alquilo viene del haluro.', 'no-lewis']] },
    sna: { topic: 'Sustitución nucleofílica aromática (SNA)', T: ['La SNA necesita grupos atractores (como NO₂) en orto o para al grupo saliente.', 'El intermedio de la SNA es un carbanión (complejo de Meisenheimer).', 'Un NO₂ en meta casi no activa la SNA.', 'Más NO₂ en orto/para, más rápida la SNA.', 'El clorobenceno solo no da SNA en condiciones suaves.', 'En la SNA el nucleófilo ataca el C que lleva el grupo saliente.'],
      F: [['La SNA funciona igual de bien sin grupos atractores.', 'sin atractores en orto/para no se estabiliza el carbanión.', 'sna-no-ewg'], ['El intermedio de la SNA es un carbocatión.', 'es un carbanión: el nucleófilo trae electrones.', 'sna-no-ewg'], ['Un NO₂ en meta activa la SNA tanto como en para.', 'en meta la carga negativa no llega al NO₂.', 'sna-no-ewg'], ['La SNA necesita grupos donadores como –OCH₃.', 'los donadores la frenan: se necesitan atractores.', 'sna-no-ewg']] },
    halogenacion: { topic: 'Halogenación del benceno', T: ['La bromación del benceno necesita FeBr₃ como ácido de Lewis.', 'La cloración usa Cl₂ con AlCl₃ o FeCl₃.', 'La yodación necesita un oxidante como HNO₃ para formar I⁺.', 'La halogenación aromática es una sustitución, no una adición.', 'El subproducto de la bromación es HBr.'],
      F: [['El Br₂ solo broma el benceno a temperatura ambiente.', 'sin ácido de Lewis no hay electrófilo suficiente.', 'no-lewis'], ['La bromación del benceno da 1,2-dibromociclohexadieno.', 'da bromobenceno (sustitución).', 'adds-not-subs'], ['El I₂ solo yoda el benceno sin ayuda.', 'necesita un oxidante para formar I⁺.', 'no-lewis'], ['El FeBr₃ se consume en la reacción.', 'es catalizador: se regenera.', 'no-lewis']] },
    nitracion: { topic: 'Nitración y sulfonación', T: ['El electrófilo de la nitración es el ion nitronio, NO₂⁺.', 'El H₂SO₄ protona al HNO₃ para formar NO₂⁺.', 'La sulfonación es reversible: se revierte con ácido diluido y calor.', 'El nitrobenceno se reduce a anilina con Fe/HCl o H₂/Pd.', 'El grupo SO₃H puede usarse como grupo bloqueador temporal.'],
      F: [['El electrófilo de la nitración es el HNO₃ sin cambios.', 'el electrófilo es el NO₂⁺.', 'nitronium'], ['El H₂SO₄ es el que aporta el grupo nitro.', 'el H₂SO₄ solo protona; el nitro viene del HNO₃.', 'nitronium'], ['La sulfonación es irreversible.', 'es reversible.', 'nitronium'], ['El nitrobenceno se reduce a anilina con NaBH₄.', 'se usa Fe/HCl, Sn/HCl o H₂/Pd.', 'nitronium']] }
  };
  const CARBO = { topic: 'Estabilidad de carbocationes', T: ['Un carbocatión terciario es más estable que uno secundario.', 'Los grupos alquilo estabilizan la carga + por hiperconjugación.', 'El carbocatión bencílico se estabiliza por resonancia con el anillo.', 'El carbocatión alílico es más estable que uno primario común.', 'Un O vecino con pares libres estabiliza mucho un carbocatión.', 'Un carbocatión primario tiende a reordenarse a uno más estable.', 'El carbocatión metilo es el menos estable de la serie.'],
    F: [['El carbocatión metilo es el más estable porque es el más pequeño.', 'es el menos estable: no tiene alquilos que lo estabilicen.', 'fc-rearrange'], ['Un carbocatión primario nunca se reordena.', 'se reordena si un desplazamiento 1,2 da uno más estable.', 'fc-rearrange'], ['Los alquilos desestabilizan la carga +.', 'la estabilizan (hiperconjugación).', 'fc-rearrange'], ['Un grupo NO₂ vecino estabiliza un carbocatión.', 'lo desestabiliza: es atractor.', 'nitro-op'], ['La resonancia no influye en la estabilidad de un carbocatión.', 'repartir la carga por resonancia estabiliza.', 'fc-rearrange']] };
  const SLIDES = { halogenos: 31, mecanismo: 4, friedel: 41, sna: 49, halogenacion: 6, nitracion: 11 };
  const stm = (rng, level, key, concept, hint) => statements(rng, level, BANK[key], { concept, slide: SLIDES[key], hint });

  const orientar = {
    id: 'orientar', title: 'Dónde entra y qué tan rápido', mission: 'm2', concepts: ['sea.activadores', 'sea.halogenos'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      const s = pick(rng, SUB.filter(x => (c === 'sea.halogenos' ? x.cls === 3 : x.cls !== 3)));
      if (level === 5) { // ordenar reactividad
        const set = c === 'sea.halogenos' ? [SUB.find(x => x.g === '–NO₂'), s, { g: '–H', name: 'benceno', rate: 0 }, SUB.find(x => x.g === '–CH₃')] : sample(rng, SUB.filter(x => x.cls !== 3 && x.rate !== 6), 3).concat({ g: '–H', name: 'benceno', rate: 0 });
        const uniq = set.filter((x, i, a) => a.findIndex(y => y.rate === x.rate) === i);
        const sorted = [...uniq].sort((a, b) => a.rate - b.rate);
        return order('Estilo PEP: ordena de MÁS LENTO a MÁS RÁPIDO frente a la SEA:', uniq.map((x, i) => ({ id: 'x' + i, text: `${x.name} (${x.g === '–H' ? 'sin sustituyente' : x.g})` })), sorted.map(x => 'x' + uniq.indexOf(x)),
          { concept: c, slide: 34, direction: 'De más lento a más rápido.', hint: 'Atractores < halógenos < benceno < alquilos < pares libres.', explain: sorted.map(x => x.name).join(' < ') + '.' });
      }
      if (level <= 2) {
        const askWhere = level === 1 || rng() < 0.5;
        if (askWhere) return choice(rng, `¿A qué posiciones orienta el grupo ${s.g} en una SEA?`, `A ${where(s)}`, [{ text: `A ${where(s) === 'meta' ? 'orto y para' : 'meta'}`, note: `${s.g} ${WHY[s.cls]}.`, misconception: s.cls === 3 ? 'halogen-meta' : 'nitro-op' }, { text: 'Solo a orto', note: 'Si orienta a orto, también a para.' }],
          { concept: c, slide: 34, hint: '¿Tiene par libre/alquilo, es halógeno, o tiene δ+?', explain: `${s.g} ${WHY[s.cls]}: ${where(s)}.` });
        return choice(rng, `Frente a la SEA, el ${s.name} reacciona…`, `${speed(s).charAt(0).toUpperCase() + speed(s).slice(1)} que el benceno`, [{ text: `${speed(s) === 'más rápido' ? 'Más lento' : 'Más rápido'} que el benceno`, note: `${s.g} ${WHY[s.cls]}.`, misconception: s.cls === 3 ? 'halogen-meta' : 'nitro-op' }, { text: 'Igual que el benceno', note: 'Todo sustituyente cambia la velocidad.' }],
          { concept: c, slide: 34, hint: '¿Dona o saca electrones?', explain: `${speed(s)}: ${WHY[s.cls]}.` });
      }
      if (c === 'sea.halogenos' && (level === 4 || (level === 3 && rng() < 0.5))) return stm(rng, level, 'halogenos', c, 'Desactivan (inductivo) pero orientan a orto/para (par libre).');
      const e = pick(rng, E), combo = `${speed(s)}, en ${where(s)}`;
      const all = ['más rápido, en orto y para', 'más lento, en orto y para', 'más rápido, en meta', 'más lento, en meta'];
      return choice(rng, `${level === 4 ? 'Con dos datos: ' : ''}El ${s.name} (${s.g}) con ${e}: ¿cómo reacciona respecto al benceno y dónde entra?`, combo.charAt(0).toUpperCase() + combo.slice(1),
        all.filter(x => x !== combo).map(text => ({ text: text.charAt(0).toUpperCase() + text.slice(1), note: `${s.g} ${WHY[s.cls]}.`, misconception: s.cls === 3 ? 'halogen-meta' : 'nitro-op' })),
        { concept: c, slide: s.cls === 3 ? 31 : 34, hint: 'Velocidad: ¿dona o saca? Posición: ¿dónde cae la carga del complejo σ?', explain: `${combo}: ${WHY[s.cls]}.` });
    }
  };

  /* Dos sustituyentes: ¿quién manda? */
  const multiples = {
    id: 'multiples', title: 'Varios sustituyentes', mission: 'm2', concepts: ['sea.multiples'],
    make(rng, level) {
      const rank = s => (s.cls === 1 ? 3 : s.cls === 2 || s.cls === 3 ? 2 : 1);
      let a, b; do { [a, b] = sample(rng, SUB, 2); } while (rank(a) === rank(b) && level <= 3);
      if (rank(a) === rank(b)) return choice(rng, `Estilo PEP: un benceno lleva ${a.g} y ${b.g} y sus orientaciones se oponen. ¿Qué esperas?`, 'Mezcla de productos (fuerzas parecidas)', [{ text: `Manda ${a.g}`, note: 'Son de la misma clase: ninguno domina claramente.' }, { text: `Manda ${b.g}`, note: 'Son de la misma clase: ninguno domina claramente.' }],
        { concept: 'sea.multiples', slide: 35, hint: 'Clase 1 > clase 2 > meta.', explain: 'Misma clase: mezclas probables.' });
      const win = rank(a) > rank(b) ? a : b, lose = win === a ? b : a;
      return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}Un benceno lleva ${a.g} y ${b.g}${level >= 3 ? ' en posiciones que no se ponen de acuerdo' : ''}. ¿Qué grupo decide dónde entra el electrófilo?`, `${win.g}`, [{ text: `${lose.g}`, note: 'Manda el activador más fuerte: –OH/–OR/–NR₂ > –R/–X > meta.', misconception: 'activator-loses' }, { text: 'Ninguno: entra al azar', note: 'Siempre domina el más fuerte cuando son de distinta clase.' }],
        { concept: 'sea.multiples', slide: 35, hint: 'Clase 1 (pares libres) > clase 2 (alquilos, halógenos) > clase 3 (meta).', explain: `${win.g} es de una clase más fuerte.` });
    }
  };

  /* Reactivos y mecanismo */
  const TARGET = [
    { t: 'bromobenceno', r: 'Br₂ / FeBr₃', c: 'sea.halogenacion', mc: 'no-lewis' }, { t: 'clorobenceno', r: 'Cl₂ / AlCl₃', c: 'sea.halogenacion', mc: 'no-lewis' }, { t: 'yodobenceno', r: 'I₂ / HNO₃', c: 'sea.halogenacion', mc: 'no-lewis' },
    { t: 'nitrobenceno', r: 'HNO₃ / H₂SO₄', c: 'sea.nitracion', mc: 'nitronium' }, { t: 'ácido bencenosulfónico', r: 'SO₃ / H₂SO₄', c: 'sea.nitracion' }, { t: 'anilina (desde nitrobenceno)', r: 'Fe / HCl (y luego NaOH)', c: 'sea.nitracion' }
  ];
  const reactivos = {
    id: 'reactivos', title: 'Reactivos y mecanismo', mission: 'm1', concepts: ['sea.mecanismo', 'sea.halogenacion', 'sea.nitracion'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      if (c === 'sea.mecanismo') return stm(rng, Math.max(level, 2), 'mecanismo', c, 'Piensa en el complejo σ: paso lento, carga en orto/para, pérdida de H⁺.');
      if (level >= 3 && rng() < 0.5) return stm(rng, level, c === 'sea.halogenacion' ? 'halogenacion' : 'nitracion', c, '¿Cuál es el electrófilo real y quién lo genera?');
      if (level === 2) { const EL = [['HNO₃ / H₂SO₄', 'NO₂⁺ (ion nitronio)'], ['Br₂ / FeBr₃', 'Br⁺ (Br₂ activado por FeBr₃)'], ['Cl₂ / AlCl₃', 'Cl⁺ (Cl₂ activado por AlCl₃)'], ['SO₃ / H₂SO₄', 'SO₃ (o HSO₃⁺)'], ['I₂ / HNO₃', 'I⁺ (I₂ oxidado)'], ['CH₃COCl / AlCl₃', 'CH₃C≡O⁺ (ion acilio)']];
        const mine = EL.filter(x => c === 'sea.halogenacion' ? /Br₂|Cl₂|I₂/.test(x[0]) : /HNO₃ \/ H₂SO₄|SO₃/.test(x[0])), [rg, el] = pick(rng, mine);
        return choice(rng, `¿Cuál es el electrófilo real cuando el benceno reacciona con ${rg}?`, el, sample(rng, EL.filter(x => x[1] !== el), 3).map(x => ({ text: x[1], note: `Ese se forma con ${x[0]}.`, misconception: c === 'sea.nitracion' ? 'nitronium' : 'no-lewis' })),
          { concept: c, slide: c === 'sea.halogenacion' ? 6 : 11, hint: 'El catalizador o el ácido fuerte genera un electrófilo más potente.', explain: `${rg} → ${el}.` }); }
      const pool = TARGET.filter(x => x.c === c), x = pick(rng, pool), others = TARGET.filter(y => y.r !== x.r);
      return choice(rng, `${level === 5 ? 'Estilo PEP (P5): ' : ''}¿Qué reactivo convierte benceno en ${x.t}?`.replace('benceno en anilina (desde nitrobenceno)', 'nitrobenceno en anilina'), x.r,
        // "X solo" es un distractor válido solo cuando de verdad falta un catalizador (Br₂, Cl₂, I₂, HNO₃); el SO₃ ya es el electrófilo y Fe solo no reduce sin ácido.
        [...sample(rng, others, x.mc ? 2 : 3).map(y => ({ text: y.r, note: `${y.r} da ${y.t}.` })), ...(x.mc ? [{ text: x.r.split(' / ')[0] + ' solo', note: 'Falta el catalizador (ácido de Lewis o H₂SO₄) o el oxidante.', misconception: x.mc }] : [])],
        { concept: c, slide: c === 'sea.halogenacion' ? 6 : 11, hint: '¿Cuál es el electrófilo que hace falta?', explain: `${x.t}: ${x.r}.` });
    }
  };

  /* Friedel-Crafts */
  const CHAINS = [
    { p: 'tolueno', rx: 'CH₃Cl', ok: true }, { p: 'etilbenceno', rx: 'CH₃CH₂Cl', ok: true }, { p: 'isopropilbenceno', rx: '(CH₃)₂CHCl', ok: true }, { p: 't-butilbenceno', rx: '(CH₃)₃CCl', ok: true },
    { p: 'propilbenceno', rx: 'CH₃CH₂CH₂Cl', ok: false, gets: 'isopropilbenceno', acyl: 'CH₃CH₂COCl' }, { p: 'butilbenceno', rx: 'CH₃CH₂CH₂CH₂Cl', ok: false, gets: 'sec-butilbenceno', acyl: 'CH₃CH₂CH₂COCl' }, { p: 'isobutilbenceno', rx: '(CH₃)₂CHCH₂Cl', ok: false, gets: 't-butilbenceno', acyl: '(CH₃)₂CHCOCl' }
  ];
  const friedel = {
    id: 'friedel', title: 'Friedel-Crafts', mission: 'm3', concepts: ['sea.friedel'],
    make(rng, level) {
      if (level === 1) { const x = pick(rng, SUB), amine = /NH₂|N\(CH₃\)₂/.test(x.g), works = x.cls !== 4 && !amine;
        const right = works ? `Sí: el anillo no está fuertemente desactivado (entra en ${where(x)})` : amine ? 'No: el N se une al AlCl₃ y el anillo queda desactivado' : 'No: el anillo está fuertemente desactivado';
        return choice(rng, `¿Funciona una acilación de Friedel-Crafts (CH₃COCl / AlCl₃) sobre ${x.name}?`, right,
          ['Sí: el anillo no está fuertemente desactivado (entra en orto y para)', 'Sí: el anillo no está fuertemente desactivado (entra en meta)', 'No: el anillo está fuertemente desactivado', 'No: el N se une al AlCl₃ y el anillo queda desactivado'].filter(t => t !== right).map(text => ({ text, note: `${x.g} ${WHY[x.cls]}.`, misconception: 'fc-deactivated' })),
          { concept: 'sea.friedel', slide: 41, hint: 'Falla con desactivadores fuertes y con aminas (se complejan con el AlCl₃).', explain: right + '.' }); }
      if (level === 4 && rng() < 0.6) return stm(rng, level, 'friedel', 'sea.friedel', 'Reordenamientos, polialquilación, anillos desactivados y el acilio que no se reordena.');
      if (level === 2 && rng() < 0.5) { const AC = [['CH₃COCl', 'acetofenona'], ['CH₃CH₂COCl', 'propiofenona'], ['C₆H₅COCl', 'benzofenona'], ['(CH₃)₂CHCOCl', 'isobutirofenona']], [ac, prod] = pick(rng, AC);
        return choice(rng, `Benceno + ${ac} / AlCl₃: ¿producto?`, prod.charAt(0).toUpperCase() + prod.slice(1), sample(rng, AC.filter(x => x[1] !== prod), 2).map(x => ({ text: x[1].charAt(0).toUpperCase() + x[1].slice(1), note: `Eso sale con ${x[0]}.` })).concat([{ text: 'Una cetona reordenada (el acilio se reordena)', note: 'El ion acilio no se reordena.', misconception: 'fc-rearrange' }]),
          { concept: 'sea.friedel', slide: 43, hint: 'Acilación: entra el grupo R–C=O completo, sin reordenar.', explain: `${prod}.` }); }
      const ch = pick(rng, level === 2 ? CHAINS.slice(0, 5) : CHAINS);
      const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
      if (level <= 3) return choice(rng, `Benceno + ${ch.rx} / AlCl₃: ¿producto principal?`, cap(ch.ok ? ch.p : ch.gets),
        [ch.ok ? { text: 'No reacciona', note: 'Sí reacciona: es una alquilación normal (este carbocatión no se reordena).' } : { text: cap(ch.p), note: 'El carbocatión primario se reordena a uno más estable.', misconception: 'fc-rearrange' }, { text: 'Un producto de adición al anillo', note: 'Es una SEA: sustitución.' }, { text: `${cap(ch.ok ? ch.p : ch.gets)} como único producto, sin polialquilación posible`, note: 'Es el principal, pero el alquilo activa el anillo y puede entrar otro (polialquilación).' }],
        { concept: 'sea.friedel', slide: 41, hint: '¿El carbocatión puede reordenarse a uno más estable?', explain: ch.ok ? 'Sin reordenamiento posible.' : `El carbocatión se reordena: ${ch.gets}.` });
      const lin = pick(rng, CHAINS.filter(x => !x.ok));
      return choice(rng, `${level === 5 ? 'Estilo PEP (P5): ' : ''}¿Cómo preparas ${lin.p} (cadena sin ramificar) desde benceno?`, `${lin.acyl} / AlCl₃ y después Zn(Hg) / HCl`, [{ text: `${lin.rx} / AlCl₃`, note: `Se reordena y da ${lin.gets}.`, misconception: 'fc-rearrange' }, { text: `${lin.acyl} / AlCl₃ solo`, note: 'Eso deja la cetona: falta reducir con Clemmensen.' }, { text: `${lin.rx} con luz`, note: 'Eso es halogenación radicalaria, no una alquilación.' }],
        { concept: 'sea.friedel', slide: 43, hint: 'El ion acilio no se reordena.', explain: 'Acilación + Clemmensen.' });
    }
  };

  /* Síntesis de disustituidos: el orden lo decide quién orienta a dónde */
  const STEP = { Br: { r: 'Br₂ / FeBr₃', s: SUB.find(x => x.g === '–Br') }, Cl: { r: 'Cl₂ / AlCl₃', s: SUB.find(x => x.g === '–Cl') }, NO2: { r: 'HNO₃ / H₂SO₄', s: SUB.find(x => x.g === '–NO₂') },
    CH3: { r: 'CH₃Cl / AlCl₃', s: SUB.find(x => x.g === '–CH₃'), fc: true }, COCH3: { r: 'CH₃COCl / AlCl₃', s: SUB.find(x => x.g === '–COCH₃'), fc: true }, SO3H: { r: 'SO₃ / H₂SO₄', s: SUB.find(x => x.g === '–SO₃H') } };
  const sintesis = {
    id: 'sintesis', title: 'Planificar la síntesis', mission: 'm3', concepts: ['sea.sintesis'],
    make(rng, level) {
      // busca un par (A, B, relación) que tenga un orden válido
      for (let tries = 0; tries < 40; tries++) {
        const [A, B] = sample(rng, Object.keys(STEP), 2), rel = pick(rng, ['meta', 'para']);
        const valid = first => { const f = STEP[first], sec = first === A ? B : A; if (STEP[sec].fc && f.s.cls === 4) return false; return rel === 'meta' ? f.s.cls === 4 : f.s.cls !== 4; };
        const okA = valid(A), okB = valid(B);
        if (okA === okB) continue; // queremos un único orden correcto
        const first = okA ? A : B, second = first === A ? B : A, target = `un benceno con ${STEP[A].s.g.slice(1)} y ${STEP[B].s.g.slice(1)} en ${rel === 'meta' ? 'meta (1,3)' : 'para (1,4)'}`;
        const why = STEP[second].fc && STEP[first === A ? B : A].s.cls === 4 ? 'Friedel-Crafts falla sobre un anillo desactivado.' : `${STEP[first].s.g} orienta a ${where(STEP[first].s)}.`;
        if (level <= 3) return choice(rng, `Para ${target} desde benceno, ¿qué haces primero?`, STEP[first].r, [{ text: STEP[second].r, note: `Si empiezas con ${STEP[second].s.g}, ${STEP[second].fc || STEP[first].fc ? 'falla o ' : ''}orienta a ${where(STEP[second].s)}.`, misconception: 'synthesis-order' }, { text: 'Da lo mismo el orden', note: 'El primer grupo decide dónde entra el segundo.' }],
          { concept: 'sea.sintesis', slide: 45, hint: '¿Quién orienta a la posición pedida?', explain: `Primero ${STEP[first].r}: ${why}` });
        return order(`${level === 5 ? 'Estilo PEP (P5): ' : ''}Ordena los pasos para obtener ${target} desde benceno:`, [{ id: 'a', text: STEP[first].r }, { id: 'b', text: STEP[second].r }, { id: 'c', text: 'Separar el isómero deseado (si sale mezcla o/p)' }], ['a', 'b', 'c'],
          { concept: 'sea.sintesis', slide: 45, direction: 'Del primer paso al último.', hint: '¿Quién orienta a la posición pedida? ¿Hay un Friedel-Crafts que deba ir antes?', explain: `${STEP[first].r} → ${STEP[second].r}. ${why}` });
      }
      return choice(rng, 'Para m-bromonitrobenceno desde benceno, ¿qué haces primero?', 'HNO₃ / H₂SO₄', [{ text: 'Br₂ / FeBr₃', note: 'El Br orienta a orto/para.', misconception: 'synthesis-order' }], { concept: 'sea.sintesis', slide: 45, hint: '¿Quién orienta a meta?', explain: 'El NO₂ orienta a meta.' });
    }
  };

  /* SNA */
  const SNA = [{ n: 'clorobenceno', r: 0 }, { n: 'm-nitroclorobenceno', r: 1 }, { n: 'p-nitroclorobenceno', r: 2 }, { n: 'o-nitroclorobenceno', r: 2.1 }, { n: '2,4-dinitroclorobenceno', r: 3 }, { n: '2,4,6-trinitroclorobenceno', r: 4 }];
  const sna = {
    id: 'sna', title: 'SNA', mission: 'm3', concepts: ['sea.sna'],
    make(rng, level) {
      if (level >= 4) { const set = sample(rng, SNA.filter(x => x.r !== 2.1), level === 5 ? 4 : 3), sorted = [...set].sort((a, b) => a.r - b.r);
        return order(`${level === 5 ? 'Estilo PEP: ' : ''}Ordena de MENOS a MÁS reactivo frente a NaOH (SNA):`, set.map((x, i) => ({ id: 'x' + i, text: x.n })), sorted.map(x => 'x' + set.indexOf(x)),
          { concept: 'sea.sna', slide: 49, direction: 'De menos a más reactivo.', hint: 'Cuenta NO₂ en orto/para.', explain: sorted.map(x => x.n).join(' < ') + '.' }); }
      if (level === 3 || (level === 2 && rng() < 0.4)) return stm(rng, level, 'sna', 'sea.sna', 'Atractores en orto/para estabilizan el carbanión.');
      let a, b; do { [a, b] = sample(rng, SNA, 2); } while (Math.abs(a.r - b.r) < 0.5);
      const hi = a.r > b.r ? a : b, lo = hi === a ? b : a;
      return choice(rng, `¿Cuál reacciona más rápido con NaOH (SNA): ${a.n} o ${b.n}?`, hi.n.charAt(0).toUpperCase() + hi.n.slice(1), [{ text: lo.n.charAt(0).toUpperCase() + lo.n.slice(1), note: 'Más NO₂ en orto/para estabiliza mejor la carga negativa.', misconception: 'sna-no-ewg' }, { text: 'Ninguno reacciona', note: hi.r > 0 ? 'Con NO₂ en orto/para sí hay SNA.' : 'Revisa los NO₂.' }],
        { concept: 'sea.sna', slide: 49, hint: '¿Cuántos NO₂ hay en orto o para al Cl?', explain: `${hi.n}: más atractores en orto/para.` });
    }
  };

  /* Bases */
  const bases = {
    id: 'bases', title: 'Electrófilos y carbocationes', mission: null, concepts: ['base.electrofilo', 'base.carbocation'],
    make(rng, level, want) {
      const c = want || pick(rng, this.concepts);
      if (c === 'base.electrofilo') {
        const X = [['NO₂⁺', 'e'], ['OH⁻', 'n'], ['NH₃', 'n'], ['SO₃', 'e'], ['(CH₃)₃C⁺', 'e'], ['CH₃O⁻', 'n'], ['CH₃C≡O⁺ (acilio)', 'e'], ['H₂O', 'n'], ['Br⁺ (del Br₂/FeBr₃)', 'e'], ['AlCl₃', 'e'], ['el anillo de benceno (sus π)', 'n'], ['BF₃', 'e'], ['CN⁻', 'n'], ['H⁺', 'e'], ['un alqueno (su π)', 'n']];
        if (level <= 2) { const x = pick(rng, X);
          return choice(rng, `${x[0]} actúa como…`, x[1] === 'e' ? 'Electrófilo (busca electrones)' : 'Nucleófilo (da electrones)', [{ text: x[1] === 'e' ? 'Nucleófilo (da electrones)' : 'Electrófilo (busca electrones)', note: 'Electrófilo: pobre en electrones (+, δ+ o con octeto incompleto). Nucleófilo: tiene pares o π para dar.' }, { text: 'Radical libre', note: 'No tiene un electrón desapareado.' }, { text: 'Ni electrófilo ni nucleófilo: es un solvente inerte', note: 'Tiene un rol claro en la reacción.' }], { concept: c, slide: 6, hint: '¿Tiene carga +, octeto incompleto o pares para dar?', explain: x[1] === 'e' ? 'Busca electrones.' : 'Da electrones.' }); }
        const want2 = pick(rng, ['e', 'n']), right = pick(rng, X.filter(x => x[1] === want2));
        return choice(rng, `${level === 5 ? 'Estilo PEP: ' : ''}¿Cuál de estas especies es ${want2 === 'e' ? 'un electrófilo' : 'un nucleófilo'}?`, right[0], sample(rng, X.filter(x => x[1] !== want2), 3).map(x => ({ text: x[0], note: `Es ${x[1] === 'e' ? 'electrófilo' : 'nucleófilo'}.` })), { concept: c, slide: 6, hint: 'Electrófilo = pobre en electrones; nucleófilo = rico.', explain: `${right[0]}.` });
      }
      const set = [['CH₃⁺', 0], ['CH₃CH₂⁺ (1°)', 1], ['(CH₃)₂CH⁺ (2°)', 2], ['(CH₃)₃C⁺ (3°)', 3], ['CH₃O–CH₂⁺ (O vecino comparte su par)', 4]];
      if (level === 3) { const RE = [['CH₃CH₂CH₂⁺ (propilo, 1°)', '(CH₃)₂CH⁺ (2°), por desplazamiento de hidruro'], ['(CH₃)₂CHCH₂⁺ (isobutilo, 1°)', '(CH₃)₃C⁺ (3°), por desplazamiento de hidruro'], ['(CH₃)₃CCH₂⁺ (neopentilo, 1°)', '(CH₃)₂C⁺CH₂CH₃ (3°), por desplazamiento de metilo'], ['CH₃CH₂CH₂CH₂⁺ (butilo, 1°)', 'CH₃CH₂CH⁺CH₃ (2°), por desplazamiento de hidruro'], ['(CH₃)₃C⁺ (t-butilo, 3°)', 'No se reordena: ya es terciario']];
        const [from, to] = pick(rng, RE);
        return choice(rng, `¿Qué le pasa al carbocatión ${from} antes de reaccionar?`, to, sample(rng, RE.filter(x => x[1] !== to).map(x => x[1]), 3).map(text => ({ text, note: 'Busca el desplazamiento 1,2 que da un carbocatión más estable.', misconception: 'fc-rearrange' })),
          { concept: c, slide: 17, hint: 'Un H o un CH₃ vecino salta si así queda un carbocatión más sustituido.', explain: `${from} → ${to}.` }); }
      if (level === 2 && rng() < 0.5) return statements(rng, 2, CARBO, { concept: c, slide: 17, hint: 'Más sustituido, resonancia o un par vecino = más estable.' });
      if (level === 5 && rng() < 0.5) return statements(rng, 4, CARBO, { concept: c, slide: 17, hint: 'Más sustituido, resonancia o un par vecino = más estable.' });
      if (level === 4) { const four = sample(rng, set, 4), best = four.reduce((a, b) => a[1] > b[1] ? a : b);
        if (four.filter(x => x[1] === best[1]).length === 1) return choice(rng, '¿Cuál de estos carbocationes es el más estable?', best[0], four.filter(x => x !== best).map(x => ({ text: x[0], note: 'Menos estabilizado: cuenta alquilos, resonancia y pares vecinos.' })), { concept: c, slide: 17, hint: 'Pares vecinos y resonancia > 3° > 2° > 1° > metilo.', explain: `${best[0]}.` }); }
      const pickS = sample(rng, level <= 2 ? set.slice(0, 4) : set, level <= 2 ? 3 : 4).filter((x, i, arr) => arr.findIndex(y => y[1] === x[1]) === i), sorted = [...pickS].sort((a, b) => a[1] - b[1]);
      return order(`${level === 5 ? 'Estilo PEP: ' : ''}Ordena de MENOS a MÁS estable:`, pickS.map(([t], i) => ({ id: 'x' + i, text: t })), sorted.map(x => 'x' + pickS.indexOf(x)), { concept: c, slide: 17, direction: 'De menos a más estable.', hint: 'Alquilos, resonancia y pares vecinos estabilizan.', explain: sorted.map(x => x[0]).join(' < ') + '.' });
    }
  };

  const generators = [orientar, multiples, reactivos, friedel, sintesis, sna, bases];

  /* Laboratorio: rutas de síntesis desde benceno */
  const S = (id, name, formula) => ({ id, name, formula });
  const substances = [S('bz', 'Benceno', 'C₆H₆'), S('brbz', 'Bromobenceno', 'C₆H₅Br'), S('nbz', 'Nitrobenceno', 'C₆H₅NO₂'), S('an', 'Anilina', 'C₆H₅NH₂'), S('tol', 'Tolueno', 'C₆H₅CH₃'), S('acf', 'Acetofenona', 'C₆H₅COCH₃'),
    S('etbz', 'Etilbenceno', 'C₆H₅CH₂CH₃'), S('mbn', 'm-Bromonitrobenceno', 'meta'), S('opbn', 'o- y p-Bromonitrobenceno', 'orto + para'), S('mna', 'm-Nitroacetofenona', 'meta'), S('opnt', 'o- y p-Nitrotolueno', 'orto + para'), S('sulf', 'Ácido bencenosulfónico', 'C₆H₅SO₃H'), S('tba', '2,4,6-Tribromoanilina', 'sin catalizador')];
  const reagents = [['br', 'Br₂ / FeBr₃'], ['br2aq', 'Br₂ en agua (sin catalizador)'], ['nit', 'HNO₃ / H₂SO₄'], ['red', 'Fe / HCl, luego NaOH'], ['sul', 'SO₃ / H₂SO₄'], ['desul', 'H₂SO₄ diluido, calor'], ['me', 'CH₃Cl / AlCl₃'], ['acil', 'CH₃COCl / AlCl₃'], ['clem', 'Zn(Hg) / HCl']].map(([id, label]) => ({ id, label }));
  const RX = {
    'bz>br': ['brbz', 'Halogenación: el FeBr₃ activa el Br₂.'], 'bz>nit': ['nbz', 'Nitración: el electrófilo es NO₂⁺.'], 'bz>sul': ['sulf', 'Sulfonación con SO₃.'], 'sulf>desul': ['bz', 'La sulfonación es reversible.'],
    'bz>me': ['tol', 'Alquilación de Friedel-Crafts (CH₃⁺ no se reordena).'], 'bz>acil': ['acf', 'Acilación de Friedel-Crafts: sale una fenona.'], 'acf>clem': ['etbz', 'Clemmensen: el C=O pasa a CH₂.'],
    'nbz>red': ['an', 'El NO₂ se reduce a NH₂.'], 'nbz>br': ['mbn', 'El NO₂ es meta-orientador: el Br entra en meta (lento, está desactivado).'], 'brbz>nit': ['opbn', 'El Br desactiva pero orienta a orto/para.'],
    'acf>nit': ['mna', 'El acetilo es meta-orientador.'], 'tol>nit': ['opnt', 'El CH₃ activa y orienta a orto/para (25 veces más rápido que el benceno).'], 'an>br2aq': ['tba', 'El NH₂ activa tanto que no hace falta catalizador: entran 3 Br.']
  };
  function react(from, rid) {
    const r = RX[`${from}>${rid}`]; if (r) return { to: r[0], ok: true, why: r[1] };
    if (['me', 'acil'].includes(rid) && ['nbz', 'acf', 'sulf', 'mbn', 'mna'].includes(from)) return { to: null, ok: false, why: 'Friedel-Crafts falla con anillos fuertemente desactivados. Hazlo antes de poner el grupo desactivador.' };
    if (rid === 'br2aq') return { to: null, ok: false, why: 'Sin catalizador solo se brominan anillos muy activados (anilina, fenol, anisol).' };
    if (rid === 'red') return { to: null, ok: false, why: 'Fe/HCl reduce grupos nitro; aquí no hay uno para reducir.' };
    if (rid === 'clem') return { to: null, ok: false, why: 'Clemmensen reduce un C=O de cetona; aquí no hay.' };
    if (rid === 'desul') return { to: null, ok: false, why: 'Solo sirve para quitar un SO₃H.' };
    return { to: null, ok: false, why: 'En este laboratorio esa combinación no lleva a un producto de la clase. Prueba otra ruta.' };
  }
  const lab = { substances, reagents, react, total: Object.keys(RX).length, starts: ['bz', 'nbz', 'brbz', 'tol', 'an', 'acf'] };

  const creatures = {
    'base.electrofilo': ['Chispa', '#d6a23f'], 'base.carbocation': ['Gólem', '#8a6fd1'], 'sea.mecanismo': ['Espectro', '#7aa4b5'], 'sea.halogenacion': ['Trasgo', '#7f9a3c'], 'sea.nitracion': ['Hidra', '#c0574a'],
    'sea.activadores': ['Serpiente', '#5f9e5a'], 'sea.halogenos': ['Niebla', '#7fa3a0'], 'sea.multiples': ['Duende', '#6d8bd6'], 'sea.friedel': ['Grifo', '#c98a1b'], 'sea.sintesis': ['Escriba', '#a07a4a'], 'sea.sna': ['Búho', '#5d6f9e']
  };

  window.NexoClassGen = window.NexoClassGen || {};
  window.NexoClassGen['org-05'] = { LEVELS, source: SRC, generators, lab, creatures };
})();
