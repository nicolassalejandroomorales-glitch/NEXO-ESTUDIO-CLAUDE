---
name: nexo-perfil
description: Perfil de Nexo (#/profile: Mascota, Notas, Inasistencias, Estadísticas, Ajustes, desafíos y rangos arcanos). Úsala antes de tocar renderProfile, renderStats, renderSettings, renderMascot o dist/academic/ranks.js.
---

# Perfil de Nexo

## Archivos
- `dist/app.js` (leer por partes; para ubicar algo usa el agente `nexo-explorador`):
  - `renderProfile(tab)` (~línea 1053): pestañas `mascot`, `grades`, `absences`, `stats`, `settings`. Alias de ruta: `avatar`/`collection` → mascota, `progress` → stats.
  - `renderProfileGrades`, `renderProfileAbsences` (`state.absences`), `renderStats`, `renderSettings`, `renderMascot`, `challengeDefinitions` / `renderChallenges`.
  - Se llega desde el sillón del refugio y con `data-profile-tab`.
- Hoy el Perfil es una **carta de jugador** (`dist/perfil/carta.js` + `carta.css`, arte `tools/perfil-carta/build_carta.py` → `assets/perfil/`): `#/profile` muestra la carta y 3 botones (Vestuario, Estadísticas, Ajustes); cada sección es madera + pergamino con "← Mi carta". `profileCardData()` en `app.js` arma los datos. Reacciones de la mascota: `mascot/reacciones.js`. Mascotas que tienes: `state.mascot.owned`. Detalle: `docs/perfil-alcoba/SPEC.md`.
- Rangos: `dist/academic/ranks.js` (0–5, de Sin rango a Rey Mago), detalle en `docs/ARCANE_RANKS_1_0.md`. Tiempo activo: `dist/academic/active-time.js`.
- Mascota: `docs/mascota/SPEC.md` (dirección actual: **pixel art**, `dist/mascot/pixelmascotas.js`). Hoy Mascota y Tienda muestran "Disponible próximamente".
- Pruebas: `node tools/profile-test.cjs`, `tools/rank-test.cjs`, `tools/active-time-test.cjs`.

## Reglas
- Estadísticas honestas: el tiempo **no** es dominio. Mostrar minutos como esfuerzo y el aprendizaje solo con evidencia (aciertos sin ayuda, transferencia, repaso).
- El tiempo solo abre la puerta de un rango; **nunca concede un rango sin respuestas verificadas**. La autoevaluación no reemplaza casos validados.
- Cambiar umbrales de rango exige también la función SQL `server_concept_rank` → eso es cloud: **pedir permiso a Niquito** antes.
- Notas: misma lógica que `NexoGrades` (teoría y laboratorio por separado); no duplicar cálculos.
- Analytics (PostHog) solo con consentimiento en Ajustes.
- Lo nuevo en archivos propios; cambios mínimos en `app.js`.
