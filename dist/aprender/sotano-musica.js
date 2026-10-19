/* Música del Sótano de los Cristales, sintetizada en vivo (WebAudio, sin archivos): una cripta que respira.
   Capas: zumbido grave que se mueve despacio, viento muy suave, goteo lejano y campanitas de cristal al azar sobre una escala del lugar.
   Todo pasa por una reverberación larga. El pasillo y cada Cámara tienen su raíz y su escala (el cambio es un deslizamiento, sin corte).
   Original: ninguna melodía copia una canción. Suena solo con un gesto del usuario y se apaga en pestaña oculta.
   Uso: NexoSotanoMusica.start(zona) · setZone(zona) · stop() · toggle(). Zonas: pasillo, organica, analitica, fisico, fisio. */
(() => {
  'use strict';
  const KEY = 'nexo-sotano-musica';
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const rand = (a, b) => a + Math.random() * (b - a);
  // Raíz grave (MIDI) y escala pentatónica de cada lugar.
  const ZONES = {
    pasillo: { root: 38, scale: [0, 3, 5, 7, 10] },     // Re: piedra y eco
    organica: { root: 33, scale: [0, 2, 4, 7, 9] },     // La: verde y esperanzada
    analitica: { root: 43, scale: [0, 2, 4, 7, 11] },   // Sol: clara y ordenada
    fisico: { root: 38, scale: [0, 2, 3, 7, 8] },       // Re: amplia, como el cosmos
    fisio: { root: 40, scale: [0, 1, 5, 7, 8] }         // Mi: inquietante
  };
  let ctx = null, master = null, verb = null, drone = null, zone = ZONES.pasillo, running = false, timers = new Set(), gestureHooked = false;

  const settings = () => window.NexoAudio?.settings || { musicVolume: 0.15 };
  const level = () => 0.5 * Math.max(0.3, Math.min(2, (settings().musicVolume ?? 0.15) / 0.15));
  const readOn = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } };
  let enabled = readOn();

  function impulse(c) { // reverberación: ruido que decae durante 3,5 s
    const len = Math.floor(c.sampleRate * 3.5), buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    return buf;
  }

  function context() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);
      verb = ctx.createConvolver(); verb.buffer = impulse(ctx);
      const wet = ctx.createGain(); wet.gain.value = 0.9; verb.connect(wet).connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function buildDrone() {
    const c = ctx, t = c.currentTime, out = c.createGain(), lp = c.createBiquadFilter(), lfo = c.createOscillator(), lfoGain = c.createGain();
    out.gain.value = 0.55; lp.type = 'lowpass'; lp.frequency.value = 380; lp.Q.value = 0.7;
    lfo.frequency.value = 0.06; lfoGain.gain.value = 130; lfo.connect(lfoGain).connect(lp.frequency); lfo.start(t);
    // [onda, ganancia, semitonos sobre la raíz, desafinado en cents]: la raíz, su doble apenas desafinado, la quinta y la octava
    const oscs = [['sine', 0.5, 0, 0], ['triangle', 0.3, 0, 7], ['sine', 0.22, 7, 0], ['sine', 0.12, 12, -5]].map(([type, gain, up, detune]) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = type; g.gain.value = gain;
      o.frequency.value = mtof(zone.root + up); o.detune.value = detune;
      o.connect(g).connect(lp); o.start(t); return { o, up };
    });
    lp.connect(out); out.connect(master); out.connect(verb);
    const len = c.sampleRate * 4, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); // viento: ruido grave y lento
    for (let i = 0, last = 0; i < len; i++) { last = last * 0.97 + (Math.random() * 2 - 1) * 0.03; d[i] = last * 6; }
    const src = c.createBufferSource(), bp = c.createBiquadFilter(), wind = c.createGain(), wl = c.createOscillator(), wg = c.createGain();
    src.buffer = buf; src.loop = true; bp.type = 'bandpass'; bp.frequency.value = 260; bp.Q.value = 0.8; wind.gain.value = 0.05;
    wl.frequency.value = 0.09; wg.gain.value = 0.035; wl.connect(wg).connect(wind.gain); wl.start(t);
    src.connect(bp).connect(wind).connect(master); wind.connect(verb); src.start(t);
    return { oscs, out, stopAll: () => { [...oscs.map(x => x.o), lfo, wl, src].forEach(n => { try { n.stop(); } catch { /* ya detenido */ } }); } };
  }

  function drip(t) { // gota lejana: un golpecito agudo que cae de tono
    const c = ctx, o = c.createOscillator(), g = c.createGain(), f = rand(1300, 2600);
    o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.1);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(g); g.connect(verb); g.connect(master); o.start(t); o.stop(t + 0.18);
  }
  function chime(t, midi, vol) { // campanita de cristal: seno + parcial inarmónico, cola larga
    const c = ctx, f = mtof(midi);
    [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(([k, a]) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f * k;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * a, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6 / k ** 0.5);
      o.connect(g); g.connect(verb); g.connect(master); o.start(t); o.stop(t + 4);
    });
  }

  function later(fn, ms) { const id = setTimeout(() => { timers.delete(id); if (running) fn(); }, ms); timers.add(id); }
  function loopDrip() { if (!ctx) return; drip(ctx.currentTime + 0.02); later(loopDrip, rand(1800, 5200)); }
  function loopChime() {
    if (!ctx) return;
    const t = ctx.currentTime + 0.02, deg = () => zone.scale[Math.floor(Math.random() * zone.scale.length)], oct = 12 * (Math.random() < 0.55 ? 3 : 4);
    const a = deg();
    chime(t, zone.root + oct + a, 0.1);
    if (Math.random() < 0.35) chime(t + rand(0.5, 1.1), zone.root + oct + deg(), 0.07);
    later(loopChime, rand(3800, 9500));
  }

  function setZone(name) {
    zone = ZONES[name] || ZONES.pasillo;
    if (!drone || !ctx) return;
    drone.oscs.forEach(({ o, up }) => o.frequency.setTargetAtTime(mtof(zone.root + up), ctx.currentTime, 1.6)); // desliza a la nueva raíz
  }

  function hookGesture() {
    if (gestureHooked) return;
    gestureHooked = true;
    const go = () => { removeEventListener('pointerdown', go, true); removeEventListener('keydown', go, true); gestureHooked = false; if (ctx) ctx.resume().catch(() => {}); if (enabled && !running && pending) start(pending); };
    addEventListener('pointerdown', go, true); addEventListener('keydown', go, true);
  }

  let pending = null;
  function start(name = 'pasillo') {
    pending = name;
    if (!enabled || document.hidden) return false;
    const c = context(); if (!c) return false;
    if (c.state !== 'running') { hookGesture(); c.resume().catch(() => {}); }
    setZone(name);
    if (running) return true;
    running = true;
    drone = buildDrone();
    master.gain.cancelScheduledValues(c.currentTime); master.gain.setValueAtTime(master.gain.value, c.currentTime); master.gain.linearRampToValueAtTime(level(), c.currentTime + 2.5);
    later(loopDrip, rand(900, 2400)); later(loopChime, rand(1500, 3500));
    return true;
  }
  function stop(now = false) {
    pending = null;
    if (!running) return;
    running = false;
    timers.forEach(clearTimeout); timers.clear();
    const old = drone; drone = null;
    if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0.0001, ctx.currentTime, now ? 0.03 : 0.35); }
    setTimeout(() => old?.stopAll(), now ? 150 : 2200);
  }
  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch { /* sin memoria: vale para esta visita */ }
    if (enabled) start(pending || 'pasillo'); else { const keep = pending; stop(); pending = keep; }
    return enabled;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { const keep = pending; stop(true); pending = keep; } else if (pending && enabled) start(pending);
  });
  window.NexoSotanoMusica = { start, setZone, stop, toggle, ZONES, get enabled() { return enabled; }, get playing() { return running; } };
})();
