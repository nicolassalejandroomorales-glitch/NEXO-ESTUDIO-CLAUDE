/* Lógica pura del duelo con un bicho (docs/juegos/SPEC.md). Sin pantalla ni estado global: recibe un ejercicio de una clase
   y devuelve estados nuevos. La mano sale de ejercicios que ya existen: ordenar (order), receta (recipe) y elegir (choice).
   Vida, combo y velocidad solo mueven la XP y lo cosmético; el conocimiento lo decide la evidencia (summary.attempt). */
(() => {
  'use strict';
  const LIFE = 3;
  const copy = value => JSON.parse(JSON.stringify(value));
  const rng = seed => { let a = Number(seed) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  /* Cartas y orden correcto de un ejercicio. Null si no sirve para un duelo. */
  function cardsOf(item) {
    const type = item?.type || 'choice';
    if (type === 'order' && Array.isArray(item.cards) && Array.isArray(item.answer) && item.answer.length >= 2)
      return { cards: item.cards.map(c => ({ id: c.id, text: c.text, note: null })), answer: [...item.answer] };
    if (type === 'recipe' && Array.isArray(item.ingredients) && Array.isArray(item.answer) && item.answer.length >= 2)
      return { cards: item.ingredients.map(c => ({ id: c.id, text: c.label, note: item.notes?.[c.id] || null })), answer: [...item.answer] };
    if (type === 'choice' && Array.isArray(item.options) && item.options.filter(o => o.correct).length === 1 && item.options.length >= 3) {
      const cards = item.options.map((o, i) => ({ id: `o${i}`, text: o.text, note: o.note || null, misconception: o.misconception || null }));
      return { cards, answer: [cards[item.options.findIndex(o => o.correct)].id] };
    }
    return null;
  }
  const eligible = item => Boolean(cardsOf(item));

  /* Empieza un duelo. La mano sale mezclada y nunca ya resuelta. */
  function start(item, { seed = Date.now(), life = LIFE } = {}) {
    const base = cardsOf(item);
    if (!base) throw new Error('Este ejercicio no sirve para un duelo.');
    const rand = rng(seed);
    const shuffle = list => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    let hand = shuffle(base.cards);
    for (let tries = 0; tries < 8 && base.cards.length > 1 && hand.map(c => c.id).join() === base.answer.join(); tries++) hand = shuffle(base.cards);
    return {
      itemId: item.id, type: item.type || 'choice', hand: hand.map(c => ({ ...c, played: false })), answer: base.answer,
      next: 0, life, maxLife: life, combo: 0, maxCombo: 0, mistakes: 0, hintUsed: false, status: 'active',
      hint: item.hint || null, explain: item.explain || '', direction: item.direction || item.orderNote || '', misconception: item.misconception || null,
      log: []
    };
  }

  /* Juegas una carta. Devuelve { state, result }. Equivocarse te cuesta un corazón y rompe el combo, nada más. */
  function play(original, cardId) {
    if (original.status !== 'active') return { state: original, result: { ignored: true } };
    const state = copy(original);
    const card = state.hand.find(c => c.id === cardId && !c.played);
    if (!card) return { state, result: { ignored: true } };
    const right = cardId === state.answer[state.next];
    if (right) {
      card.played = true; card.step = state.next + 1; state.next += 1;
      state.combo += 1; state.maxCombo = Math.max(state.maxCombo, state.combo);
      if (state.next >= state.answer.length) state.status = 'won';
    } else {
      state.life -= 1; state.mistakes += 1; state.combo = 0;
      if (card.misconception) state.lastMisconception = card.misconception;
      if (state.life <= 0) state.status = 'lost';
    }
    const note = right ? null : card.note || (state.type === 'order' || state.type === 'recipe' ? (state.direction ? `Todavía no: ${state.direction}` : 'Todavía no es el turno de esa carta.') : 'Esa no es.');
    state.log.push({ card: cardId, right, step: right ? state.next : null });
    return { state, result: { right, note, step: right ? state.next : null, combo: state.combo, life: state.life, status: state.status } };
  }

  /* Pedir pista: se anota y el acierto vale menos. */
  function hint(original) {
    if (original.status !== 'active') return { state: original, text: null };
    const state = copy(original);
    state.hintUsed = true;
    return { state, text: state.hint || 'Piensa qué tiene que pasar primero.' };
  }

  /* Un duelo = UN intento de evidencia, como en la clase: solo cuenta si saliste limpio.
     Ganar tras equivocarte enseña, pero no cuenta como acierto por tu cuenta. */
  function summary(state) {
    const won = state.status === 'won';
    return {
      won, lost: state.status === 'lost', mistakes: state.mistakes, hintUsed: state.hintUsed, maxCombo: state.maxCombo,
      attempt: { correct: won && state.mistakes === 0, hint: state.hintUsed, misconception: won && state.mistakes === 0 ? null : state.lastMisconception || state.misconception }
    };
  }

  /* XP: más por bichos difíciles para ti (peso 1–3 de NexoAcademicPending). Perder no da; con pista o errores, la mitad.
     El combo suma hasta +30 %. Nada de esto sube el estado de conocimiento. */
  function xp(sum, weight = 1) {
    if (!sum.won) return 0;
    const base = 20 * Math.max(1, Math.min(3, Number(weight) || 1));
    const quality = sum.hintUsed || sum.mistakes ? 0.5 : 1;
    const bonus = 1 + Math.min(0.3, Math.max(0, sum.maxCombo - 1) * 0.1);
    return Math.round(base * quality * bonus);
  }

  window.NexoDuel = { start, play, hint, summary, xp, eligible, cardsOf, LIFE };
})();
