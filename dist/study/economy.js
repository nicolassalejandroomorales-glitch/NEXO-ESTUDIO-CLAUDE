/* Reglas únicas de recompensas por tiempo; sin estado ni dependencia del DOM. */
(() => {
  'use strict';
  function sessionReward(seconds) {
    const minutes = Math.floor(Math.max(0, Number(seconds) || 0) / 60);
    return minutes >= 120 ? 10 : minutes >= 60 ? 8 : minutes >= 30 ? 5 : 0; // el tiempo casi no paga: lo importante es la evidencia (docs/economia/SPEC.md)
  }
  function sessionXp(seconds) { return Math.min(60, Math.floor(Math.max(0, Number(seconds) || 0) / 300) * 5); }
  window.NexoEconomy = { sessionReward, sessionXp };
})();
