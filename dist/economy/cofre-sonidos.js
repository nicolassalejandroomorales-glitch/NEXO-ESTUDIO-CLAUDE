/* Sonidos de la apertura de cofres, sintetizados con WebAudio (sin archivos). Respetan el silencio y el volumen de Ajustes.
   NexoCofreSonidos.play('tick' | 'rumble' | 'whoosh' | 'pop' | 'land' | 'reveal', rareza?) */
(() => {
  'use strict';
  let ctx = null, noiseBuf = null;
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  const ARPEGIOS = { comun: [72, 76], poco: [72, 76, 79], raro: [72, 76, 79, 84, 88], legendario: [67, 72, 76, 79, 84, 88, 91, 96] };

  function ready() {
    const s = window.NexoAudio?.settings;
    if (!s || !s.sound || s.hidden) return null;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (_) { return null; }
    return { ctx, vol: Math.max(0, Math.min(1, s.sfxVolume ?? .4)) };
  }
  function noise() {
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true; return src;
  }
  // Una nota con ataque rápido y caída; freqEnd permite barridos.
  function tone(c, { f, fEnd, type = 'sine', at = 0, dur = .2, gain = .3, attack = .005 }) {
    const t = c.ctx.currentTime + at, o = c.ctx.createOscillator(), g = c.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain * c.vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.ctx.destination); o.start(t); o.stop(t + dur + .05);
  }
  function hiss(c, { at = 0, dur = .3, gain = .2, from = 400, to = 4000, q = 1.2, type = 'bandpass' }) {
    const t = c.ctx.currentTime + at, n = noise(), f = c.ctx.createBiquadFilter(), g = c.ctx.createGain();
    f.type = type; f.Q.value = q; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain * c.vol, t + dur * .25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g).connect(c.ctx.destination); n.start(t); n.stop(t + dur + .05);
  }

  const SOUNDS = {
    // casilla que pasa frente al marcador: golpecito de madera
    tick: c => { tone(c, { f: 1300 + Math.random() * 120, fEnd: 700, type: 'triangle', dur: .05, gain: .22 }); hiss(c, { dur: .03, gain: .08, from: 3000, to: 2000 }); },
    // el cofre tiembla: retumbo grave que crece
    rumble: c => { tone(c, { f: 48, fEnd: 90, type: 'sawtooth', dur: 1.1, gain: .22, attack: .6 }); hiss(c, { dur: 1.1, gain: .3, from: 120, to: 700, type: 'lowpass', q: .7 }); },
    // la ruleta arranca
    whoosh: c => hiss(c, { dur: .7, gain: .35, from: 300, to: 3800, q: .8 }),
    // salta la tapa: crujido de madera, golpe y destello
    pop: c => { hiss(c, { dur: .22, gain: .5, from: 1500, to: 400, q: 2 }); tone(c, { f: 320, fEnd: 70, type: 'square', dur: .18, gain: .3 });
      tone(c, { f: NOTE(84), type: 'sine', dur: .5, gain: .18, at: .04 }); tone(c, { f: NOTE(91), type: 'sine', dur: .5, gain: .12, at: .06 }); },
    // la ruleta se asienta en el premio
    land: c => { tone(c, { f: 180, fEnd: 60, type: 'sine', dur: .25, gain: .45 }); hiss(c, { dur: .12, gain: .2, from: 2500, to: 800 }); }
  };

  // Fanfarria según rareza: cuantas más notas y más brillo, más raro el premio.
  function reveal(c, rarity) {
    const notes = ARPEGIOS[rarity] || ARPEGIOS.comun, big = rarity === 'raro' || rarity === 'legendario';
    notes.forEach((n, i) => { tone(c, { f: NOTE(n), type: 'triangle', at: i * .085, dur: .55, gain: .22 }); tone(c, { f: NOTE(n + 12), type: 'sine', at: i * .085 + .01, dur: .4, gain: .08 }); });
    if (big) { for (let i = 0; i < 7; i++) tone(c, { f: NOTE(96 + (i * 5) % 12), type: 'sine', at: .5 + i * .07, dur: .25, gain: .07 }); hiss(c, { at: .1, dur: .9, gain: .12, from: 2000, to: 9000, q: 2 }); }
    if (rarity === 'legendario') { tone(c, { f: 65, fEnd: 40, type: 'sine', dur: .9, gain: .5 }); [60, 64, 67, 72].forEach((n, i) => tone(c, { f: NOTE(n), type: 'sawtooth', at: .45, dur: 1.2, gain: .06 + i * .005 })); }
  }

  function play(name, rarity) {
    const c = ready(); if (!c) return;
    if (name === 'reveal') reveal(c, rarity); else SOUNDS[name]?.(c);
  }
  window.NexoCofreSonidos = Object.freeze({ play });
})();
