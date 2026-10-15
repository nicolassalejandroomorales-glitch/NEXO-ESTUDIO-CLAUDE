/* Clima real de Santiago para el refugio (Open-Meteo, autorizado 3 oct 2026).
   - Ubicación fija (no se pide la del dispositivo), máx. una consulta cada 30 min y solo con la pestaña visible.
   - Sin internet o si algo falla: despejado (Nexo no inventa lluvia).
   - Escribe pesos 0..1 (--w-cloud, --w-rain, --w-storm) para fundidos graduales, igual que --w-* de la luz,
     y body[data-nexo-weather] para quien necesite el nombre (la mascota). Avisa con el evento 'nexo:weather'.
   Consola: NexoWeather.preview('rain') · preview('storm') · preview('cloudy') · stopPreview(). */
(() => {
  'use strict';
  if (typeof document === 'undefined') return;
  const KEY = 'nexo.weather.v2', MAX_AGE = 30 * 60 * 1000;
  const URL = 'https://api.open-meteo.com/v1/forecast?latitude=-33.45&longitude=-70.66&current=weather_code,cloud_cover';
  const KINDS = ['clear', 'cloudy', 'fog', 'drizzle', 'rain', 'storm'];
  let state = { kind: 'clear', cover: 0, code: 0, at: 0 }, previewing = null, timer = null, inflight = false;

  // Código WMO -> tipo de clima de Nexo.
  function kindOf(code) {
    if (code >= 95) return 'storm';
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if (code >= 51 && code <= 57) return 'drizzle';
    if (code === 45 || code === 48) return 'fog';
    if (code === 3 || (code >= 71 && code <= 77) || code === 85 || code === 86) return 'cloudy';
    return 'clear';                                   // 0, 1, 2: despejado o con algunas nubes
  }
  function weights(s) {
    const cover = Math.max(0, Math.min(100, Number(s.cover) || 0)) / 100;
    const cloud = s.kind === 'clear' ? Math.min(0.45, cover * 0.5) : s.kind === 'cloudy' ? Math.max(0.75, cover) : 1;
    const rain = s.kind === 'storm' || s.kind === 'rain' ? 1 : s.kind === 'drizzle' ? 0.5 : 0;
    return { cloud, rain, storm: s.kind === 'storm' ? 1 : 0, fog: s.kind === 'fog' ? 1 : 0 };
  }
  function current() { return previewing || state; }
  function apply() {
    const s = current(), w = weights(s), style = document.body?.style;
    if (!style) return;
    style.setProperty('--w-cloud', w.cloud.toFixed(3));
    style.setProperty('--w-rain', w.rain.toFixed(3));
    style.setProperty('--w-storm', w.storm.toFixed(3));
    document.body.dataset.nexoWeather = s.kind;
    document.dispatchEvent(new CustomEvent('nexo:weather', { detail: { ...s, ...w } }));
  }
  function readCache() {
    try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && KINDS.includes(c.kind)) return c; } catch (_) {}
    return null;
  }
  function writeCache(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) {} }
  async function refresh(force = false) {
    if (inflight || document.hidden || typeof fetch !== 'function') return;
    const cached = readCache();
    if (cached) state = cached;
    if (!force && cached && Date.now() - cached.at < MAX_AGE) { apply(); return; }
    inflight = true;
    try {
      const r = await fetch(URL, { cache: 'no-store' });
      const cur = (await r.json()).current || {};
      const code = Number(cur.weather_code) || 0;
      state = { kind: kindOf(code), cover: Number(cur.cloud_cover) || 0, code, at: Date.now() };
      writeCache(state);
    } catch (_) {
      if (!cached) state = { kind: 'clear', cover: 0, code: 0, at: Date.now() };
    } finally { inflight = false; apply(); }
  }
  function preview(kind = 'rain', cover) {
    if (!KINDS.includes(kind)) throw new Error('Clima desconocido: ' + kind + ' (usa ' + KINDS.join(', ') + ')');
    previewing = { kind, cover: cover ?? (kind === 'clear' ? 10 : 90), code: -1, at: Date.now() };
    apply();
  }
  function stopPreview() { previewing = null; apply(); }
  function start() {
    if (timer) return;
    const cached = readCache(); if (cached) state = cached;
    apply(); refresh();
    timer = setInterval(() => refresh(), 10 * 60 * 1000);   // solo consulta de verdad si el dato tiene más de 30 min
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  }
  window.NexoWeather = Object.freeze({ start, refresh, preview, stopPreview, current, weights, kindOf, kinds: KINDS });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
