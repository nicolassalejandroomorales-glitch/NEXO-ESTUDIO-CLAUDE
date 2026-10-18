/* Música y sonidos del duelo, sintetizados en vivo (WebAudio): ondas de pulso, bajo, batería y arpegio, como una consola chica.
   Cuatro temas ORIGINALES, uno por ramo; ninguna melodía copia una canción existente. Suena solo si la música (o el sonido, para los
   efectos) está activa en Ajustes; respeta pestaña oculta y movimiento reducido no aplica (es audio). Ver docs/juegos/SPEC.md. */
(() => {
  'use strict';
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  /* Acordes en semitonos sobre la raíz. Una línea = 4 acordes, 2 compases (32 pasos de semicorchea) cada uno. */
  const MIN = [0, 3, 7], MAJ = [0, 4, 7];
  const SONGS = {
    // Orgánica: saltarina y un poco burlona (La menor), el bicho "se cree muy listo"
    organica: { bpm: 132, root: 57, duty: 0.25, prog: [[0, MIN], [8, MAJ], [5, MIN], [7, MAJ]],
      bass: [0, null, 0, null, 7, null, 0, null, 0, null, 0, 12, 7, null, 5, null],
      lead: [2, null, 1, 2, null, null, 0, null, 1, null, 2, null, 3, null, null, null, 3, 2, null, 1, 0, null, 1, null, 2, null, null, null, 1, null, 0, null] },
    // Fisicoquímica: firme y rápida, como un contador (Re menor)
    fisico: { bpm: 150, root: 62, duty: 0.5, prog: [[0, MIN], [3, MAJ], [8, MAJ], [7, MAJ]],
      bass: [0, 0, null, 0, 0, null, 0, 0, 12, null, 0, 0, null, 7, null, 5],
      lead: [0, null, 2, null, 3, null, 2, null, 0, null, 2, 3, 4, null, null, null, 3, null, 2, null, 1, null, 2, null, 0, null, null, null, 2, 1, 0, null] },
    // Fisiopatología: lenta y inquietante, como una alarma lejana (Mi menor)
    fisio: { bpm: 96, root: 64, duty: 0.125, prog: [[0, MIN], [1, MAJ], [5, MIN], [7, MAJ]],
      bass: [0, null, null, null, 0, null, null, 12, 0, null, null, null, 7, null, null, null],
      lead: [3, null, null, null, 2, null, null, null, 3, null, 4, null, 3, null, null, null, 2, null, null, 1, 2, null, null, null, 1, null, null, null, 0, null, null, null] },
    // Analítica: precisa y repetitiva, como un metrónomo con humor (Sol mayor)
    analitica: { bpm: 118, root: 67, duty: 0.25, prog: [[0, MAJ], [5, MAJ], [7, MAJ], [5, MAJ]],
      bass: [0, null, 7, null, 0, null, 7, null, 5, null, 12, null, 5, null, 7, null],
      lead: [0, 1, 2, null, 2, 1, 0, null, 1, 2, 3, null, 3, 2, 1, null, 2, 3, 4, null, 3, 2, 1, null, 0, null, 2, null, 0, null, null, null] }
  };
  let ctx = null, master = null, sfxBus = null, timer = null, song = null, step = 0, nextTime = 0, intensity = 0, current = null;
  const waves = {};

  const settings = () => window.NexoAudio?.settings || { sound: false, music: false, musicVolume: 0.15, sfxVolume: 0.4, gesture: true, hidden: false };
  const canMusic = () => { const s = settings(); return s.music && s.gesture !== false && !s.hidden; };
  const canSfx = () => { const s = settings(); return s.sound && s.gesture !== false; };

  function context() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.connect(ctx.destination); // los efectos no dependen del volumen de la música
      for (const d of [0.125, 0.25, 0.5]) { // onda de pulso con ciclo de trabajo d, hecha con series de Fourier
        const re = new Float32Array(32), im = new Float32Array(32);
        for (let n = 1; n < 32; n++) im[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * d);
        waves[d] = ctx.createPeriodicWave(re, im);
      }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  const volume = () => Math.min(0.6, settings().musicVolume * 2.2);

  function pulse(t, midi, dur, gain, duty, bus = master) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.setPeriodicWave(waves[duty] || waves[0.5]); o.frequency.value = mtof(midi);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.02);
  }
  function tri(t, midi, dur, gain) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = mtof(midi);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(t, dur, gain, freq, bus = master) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur)), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; f.type = 'highpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(bus); s.start(t);
  }
  function kick(t, gain) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.18);
  }

  /* Un paso de semicorchea. Capas: 0 = bajo y batería suave · 1 = + arpegio · 2 = + melodía. */
  function playStep(s, t, i) {
    const chord = s.prog[Math.floor(i / 32) % s.prog.length], [off, tones] = chord, bar = i % 32, base = s.root;
    const b = s.bass[bar % 16];
    if (b !== null && b !== undefined) tri(t, base - 12 + off + b, 0.2, 0.34);
    if (bar % 8 === 0) kick(t, 0.5);
    if (bar % 8 === 4) noise(t, 0.1, 0.22, 1500);
    if (bar % 2 === 0 && intensity >= 1) noise(t, 0.025, 0.07, 8000);
    if (intensity >= 1 && bar % 2 === 1) pulse(t, base + off + tones[(bar >> 1) % 3] + 12, 0.1, 0.07, 0.125);
    const l = s.lead[bar];
    if (intensity >= 2 && l !== null && l !== undefined) pulse(t, base + off + tones[l % 3] + 12 * Math.floor(l / 3) + 12, 0.28, 0.13, s.duty);
  }
  function tick() {
    if (!ctx || !song) return;
    const s = song, dt = 60 / s.bpm / 4;
    while (nextTime < ctx.currentTime + 0.25) { playStep(s, nextTime, step); step += 1; nextTime += dt; }
  }

  function start(subject) {
    if (!canMusic()) return false;
    const c = context(); if (!c) return false;
    stop(true);
    current = SONGS[subject] ? subject : 'organica'; song = SONGS[current]; step = 0; intensity = 0; nextTime = c.currentTime + 0.06;
    master.gain.cancelScheduledValues(c.currentTime); master.gain.setValueAtTime(0.0001, c.currentTime); master.gain.linearRampToValueAtTime(volume(), c.currentTime + 0.4);
    timer = setInterval(tick, 60); tick();
    return true;
  }
  function stop(now = false) {
    if (timer) { clearInterval(timer); timer = null; }
    song = null; current = null;
    if (ctx && master) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0.0001, ctx.currentTime, now ? 0.02 : 0.25); }
  }
  const setIntensity = level => { intensity = Math.max(0, Math.min(2, level | 0)); };

  /* Efectos del duelo. "right": sube de tono con el combo; "win" y "lose": cierres cortos. */
  function sfx(name, n = 1) {
    if (!canSfx()) return;
    const c = context(); if (!c) return;
    const t = c.currentTime + 0.01, v = Math.min(0.6, settings().sfxVolume * 1.4);
    const B = sfxBus;
    if (name === 'right') { const m = 72 + Math.min(n, 8) * 2; pulse(t, m, 0.09, v * 0.5, 0.25, B); pulse(t + 0.07, m + 7, 0.14, v * 0.5, 0.25, B); }
    else if (name === 'wrong') { pulse(t, 45, 0.18, v * 0.6, 0.5, B); noise(t, 0.12, v * 0.3, 600, B); }
    else if (name === 'win') [0, 4, 7, 12].forEach((o, k) => pulse(t + k * 0.1, 72 + o, 0.22, v * 0.5, 0.25, B));
    else if (name === 'lose') [0, -3, -7, -12].forEach((o, k) => pulse(t + k * 0.14, 64 + o, 0.26, v * 0.5, 0.5, B));
    else if (name === 'appear') { noise(t, 0.25, v * 0.35, 400, B); [0, 3, 7].forEach((o, k) => pulse(t + k * 0.08, 55 + o, 0.2, v * 0.5, 0.125, B)); }
  }

  document.addEventListener?.('visibilitychange', () => { if (document.hidden && timer) stop(true); });
  window.NexoDuelMusic = { start, stop, sfx, setIntensity, songs: Object.keys(SONGS), SONGS, get playing() { return Boolean(timer); } };
})();
