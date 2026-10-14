/* Sonido del estudio de planos (UPDATE 02, SPEC "Sonido"): ambiente suave (fuego, lluvia real, tic-tac bajito) y sonidos al actuar
   (pluma, sello, campana). Todo se sintetiza aquí con Web Audio: sin archivos ni red.
   Respeta Ajustes: `sound` + `sfxVolume` para los efectos y `ambient` + `ambientVolume` para el ambiente. Nada suena sin un gesto de la persona. */
(() => {
  'use strict';
  let ctx = null, master = null, amb = null, noiseBuf = null;
  const Ctor = () => window.AudioContext || window.webkitAudioContext;

  function ensure() {
    const C = Ctor(); if (!C) return null;
    if (!ctx) { ctx = new C(); master = ctx.createGain(); master.connect(ctx.destination); }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  function noise() {                       // 2 s de ruido blanco, repetible
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  const vol = (s, key, fallback) => { const v = Number(s?.[key]); return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback; };

  function burst(t0, { freq = 3000, q = 1, type = 'bandpass', dur = .08, gain = .2, sweep = 0 }) {
    const src = ctx.createBufferSource(); src.buffer = noise(); src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t0); f.Q.value = q;
    if (sweep) f.frequency.linearRampToValueAtTime(freq + sweep, t0 + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + .008); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    src.connect(f).connect(g).connect(master); src.start(t0, Math.random()); src.stop(t0 + dur + .02);
  }
  function tone(t0, freq, dur, gain, type = 'sine', decay = true) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + .006);
    if (decay) g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); else g.gain.setValueAtTime(gain, t0 + dur);
    o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + .03);
  }

  const SFX = {
    pluma(t) { for (let i = 0; i < 5; i++) burst(t + i * .07, { freq: 3800 + i * 260, q: 2.5, dur: .09, gain: .09, sweep: 700 }); },   // rasguño de pluma sobre papel
    sello(t) { tone(t, 120, .16, .5); tone(t, 62, .22, .45); burst(t, { freq: 700, type: 'lowpass', dur: .1, gain: .35 }); },      // golpe sordo de lacre
    campana(t) { [[880, .5], [1320, .28], [1760, .16], [2640, .08]].forEach(([f, g], i) => tone(t, f * (i ? 1.002 : 1), 1.6, g * .35)); },
    tinta(t) { for (let i = 0; i < 3; i++) burst(t + i * .06, { freq: 3200, q: 2, dur: .07, gain: .07, sweep: 500 }); },
    pagina(t) { burst(t, { freq: 1800, q: .6, dur: .22, gain: .12, sweep: -900 }); }
  };

  /* Un efecto suelto. settings = state.settings. Devuelve true si sonó. */
  function play(name, settings) {
    if (!settings?.sound || !SFX[name] || document.hidden) return false;
    if (!ensure()) return false;
    master.gain.value = vol(settings, 'sfxVolume', .4);
    SFX[name](ctx.currentTime + .01);
    return true;
  }

  /* Ambiente de la sala: fuego siempre, tic-tac bajito, y lluvia si el clima real es de lluvia. */
  function start(settings, weather) {
    stop();
    if (!settings?.ambient || document.hidden || !ensure()) return false;
    const level = vol(settings, 'ambientVolume', .12);
    const bus = ctx.createGain(); bus.gain.value = level * 2.2; bus.connect(ctx.destination);
    const nodes = [], timers = [];
    const loop = (freq, type, gain, q = .7) => {
      const src = ctx.createBufferSource(); src.buffer = noise(); src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.value = gain;
      src.connect(f).connect(g).connect(bus); src.start(); nodes.push(src);
    };
    loop(420, 'lowpass', .5);                                          // rumor grave de las brasas
    if (weather === 'lluvia' || weather === 'tormenta') { loop(5200, 'bandpass', .3, .5); loop(1800, 'highpass', .08); }
    if (weather === 'nieve' || weather === 'niebla') loop(300, 'lowpass', .12);
    const crackle = () => {                                            // chasquidos del fuego, a intervalos al azar
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime, n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const o = ctx.createBufferSource(); o.buffer = noise();
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500 + Math.random() * 3500; f.Q.value = 3;
        const g = ctx.createGain(); const at = t + i * .03; g.gain.setValueAtTime(.35 * Math.random() + .1, at); g.gain.exponentialRampToValueAtTime(.0001, at + .04);
        o.connect(f).connect(g).connect(bus); o.start(at, Math.random()); o.stop(at + .06);
      }
      timers.push(setTimeout(crackle, 250 + Math.random() * 1400));
    };
    let beat = 0;
    const tick = () => {                                               // tic-tac del reloj (dos tonos suaves)
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime, g = ctx.createGain(), o = ctx.createOscillator();
      o.type = 'square'; o.frequency.value = beat++ % 2 ? 1250 : 1580;
      g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + .03);
      o.connect(g).connect(bus); o.start(t); o.stop(t + .04);
    };
    crackle(); timers.push(setInterval(tick, 1000));
    amb = { bus, nodes, timers };
    return true;
  }
  function stop() {
    if (!amb) return;
    amb.timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    amb.nodes.forEach(n => { try { n.stop(); } catch (_) { /* ya parado */ } });
    try { amb.bus.disconnect(); } catch (_) { /* ya desconectado */ }
    amb = null;
  }
  const playing = () => !!amb;
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });

  window.NexoEstudioAudio = Object.freeze({ play, start, stop, playing, names: Object.keys(SFX) });
})();
