---
name: nexo-motor
description: Motor académico de Nexo (conceptos, familias de problemas, intentos, evidencia, estados de conocimiento, FSRS, diagnóstico, validadores). Úsala antes de tocar dist/academic/ o agregar contenido académico estructurado.
---

# Motor académico

## Leer primero
`ACADEMIC_MODEL.md` (contratos y flujo). Rangos: `docs/ARCANE_RANKS_1_0.md`. Recomendar **Opus** para diseñar cambios aquí.

## Archivos (`dist/academic/`)
`model.js` (catálogo local) · `graph.js` (prerrequisitos, sin ciclos) · `engine.js` (`recordAttempt`) · `knowledge.js` (estados) · `reviews.js` (FSRS, `ts-fsrs` 5.4.2) · `diagnosis.js` · `classifiers.js` / `structured.js` (validadores) · `sources.js` / `library.js` · `ranks.js` · `inspector.js` (`?nexoDev=1#/inspector`).
Pruebas: `academic-test`, `structured-test`, `training-test`, `rescue-test`, `rank-test`, `class-bridge-test` (en `tools/`).
Clases y juegos → motor: `class-bridge.js`. Familia = concepto + habilidad. `class_item` cuenta como verificada; `write` = autorúbrica + `reasoningSupported`. Minutos: `onBeat` de `playLesson` en `app.js` (`docs/motor-rangos/SPEC.md`).
Registro del aula/Demuestra: `NexoClassEvidence.submit` guarda antes de entregar; `reconcile` recupera pendientes al reabrir. Pruebas `academic-loop-test.cjs` y `academic-loop-e2e.cjs`; contrato en `docs/fase-i-motor/SPEC.md`.

## Reglas (no negociables)
- Estados: `unseen → guided → independent → transferable → retained`. `independent` exige éxito **sin ayuda**; `transferable`, transferencia sin ayuda; `retained`, recuperación sin ayuda ≥ 24 h después + transferencia.
- La evidencia es inmutable e idempotente (IDs estables). Un fallo aislado no borra logros; completar una lección no es dominio.
- Tiempo, rachas o autoevaluación nunca prueban corrección objetiva. La autorúbrica se etiqueta como tal.
- Un error se confirma solo con distractor o validador etiquetado; si es ambiguo, queda como candidato.
- IDs de conceptos estables: si cambia el significado, ID nuevo. Grafo de prerrequisitos sin ciclos (revisar con el inspector).
- Fuentes reales con ubicación exacta (diapositiva, página, pregunta). No inventar contenido.
- Lo que toque SQL, RPC o Supabase (`submit_verified_case`, `server_concept_rank`) es cloud: **pedir permiso a Niquito**.
