/* Reacciones de la mascota en la habitación del Perfil (docs/perfil-alcoba/SPEC.md).
   Módulo puro: pick(ctx) elige UNA frase y un gesto que ya existe en pixel-vida.js, según lo que pasa en tu semestre.
   ctx = { days: días a la próxima prueba | null, away: días sin estudiar | null, streak: racha, grade: nota reciente (1-7) | null }.
   Prioridad: prueba muy cerca > nota > vuelves tras días > racha > prueba lejana. app.js entrega el ctx con bind(). */
(() => {
  'use strict';
  const MILESTONES = [3, 7, 14, 30, 60, 100];
  let provider = null;

  function pick(ctx = {}) {
    const { days = null, away = null, streak = 0, grade = null } = ctx;
    if (days === 0) return { say: '¡Hoy es la prueba! Respira, ya hiciste lo que podías.', act: 'nerviosa' };
    if (days !== null && days <= 3) return { say: `La prueba es en ${days === 1 ? '1 día' : days + ' días'}… ¿repasamos un poquito?`, act: 'nerviosa' };
    if (grade !== null && grade >= 5.5) return { say: `¡Un ${grade.toFixed(1)}! Eso se celebra.`, act: 'baile' };
    if (grade !== null && grade < 4) return { say: `Un ${grade.toFixed(1)} duele, pero ya sabemos qué repasar. Vamos de a poco.`, act: 'confundida' };
    if (away !== null && away >= 3) return { say: `¡Volviste! Te extrañé estos ${away} días.`, act: 'saludo' };
    if (MILESTONES.includes(streak)) return { say: `¡${streak} días seguidos estudiando! Estoy orgullosa.`, act: 'deslumbrada' };
    if (days !== null && days <= 7) return { say: 'Esta semana hay prueba: un bloque corto hoy ayuda harto.', act: 'idea' };
    return null;
  }

  window.NexoReacciones = Object.freeze({
    pick, bind(fn) { provider = fn; },
    now() { try { return provider ? pick(provider()) : null; } catch (_) { return null; } }
  });
})();
