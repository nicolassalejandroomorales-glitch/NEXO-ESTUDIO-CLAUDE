---
name: nexo-clase
description: Crear o editar una clase de Nexo (contenido y lógica; la pantalla nueva es la Cámara, misiones, actividades, camino al 7). Úsala cuando la tarea toque dist/classes/, contenido de un tema o la estructura de una clase.
---

# Clases de Nexo

Roles (21 oct): aula/estación presentan explicaciones y pistas como Grimorio; la mascota solo reacciona y se oculta en pruebas. `dist/core/study-timer.js` presenta el reloj global de `state.timer`, sin depender de la clase. Ver `docs/experiencia-academica/SPEC.md`.

0. **Clases nuevas = v2** (18 oct 2026): estaciones mixtas (clase, mini juego, reto PEP). Lee primero `docs/clases-estructura/DISENO-V2.md`; lo de abajo describe la v1 que se reemplaza.
1. Lee `docs/clases-estructura/COMO_CREAR_UNA_CLASE.md` (la guía completa). Ejemplo de referencia: `dist/classes/org-01.js` (Aminas, PEP 1).
2. Una clase es **un archivo de datos**; `player.js` es solo la lógica (caminos, pasos, puntos al 7, corrección, evidencia) y no se toca para agregar contenido. La pantalla vieja (torre del alquimista) se borró (18 oct 2026): el aula nueva vive en la Cámara del ramo (`docs/aprender-pasillo/SPEC.md`, `docs/clases-v2/SPEC.md`).
3. Crear la base: `node tools/new-class.cjs`. Probar: `node tools/classroom-test.cjs`.
4. Cada misión: diagnostic → fundamentals → explain → worked → practice → (challenge) → transfer. Rescate y cierre los arma el aula.
5. Objetivo de Nexo: **aprender de verdad**. Un punto de la prueba solo cuenta como demostrado al acertar sin ayuda la transferencia. Nada de falsa sensación de dominio.
6. Contenido académico: verificar contra la fuente (PPT, pauta). Si algo no está en la fuente, decirlo; no inventar.
7. Diseñar la estructura de una clase nueva o el motor (`dist/academic/*`, FSRS): recomendar **Opus**. Llenar contenido siguiendo la guía: **Sonnet**.
8. Ejercicios infinitos: cada clase tiene un `dist/classes/<id>-gen.js` con generadores `{ id, title, mission, concepts, make(rng, level, want) }`
   (`want` es opcional: pide una variante concreta). La clase se registra con una línea en `dist/classes/catalog.js`.
9. **Regla de calidad** (`node tools/exercise-quality.cjs`, corre en `npm test`): por generador ≥ 60 ejercicios distintos y ≥ 3 moldes
   (enunciados distintos al borrar los números), ≥ 3 alternativas por pregunta y nada de "ninguna/todas las anteriores".

## La pantalla de la clase (19 oct 2026)
`dist/classes/aula.js` (+ `aula.css`) dibuja cada misión en el estilo de la estación y usa la lógica de `player.js`; la prueba final por misión sale de `cls.demuestra` (estación en modo `only: 'demuestra'`, `estacion.js`). Se prueba con `node tools/demuestra-test.cjs`. Detalle: `docs/clases-v2/SPEC.md`.

## Clases Vivas (20 oct 2026)
Las clases pertenecen al Sótano; `dist/classes/vivas.js` desacopla controlador y presentación Estudio. `aula.js` y `estacion.js` siguen como componentes de contenido, sin una sala independiente. Contrato, pruebas y límites: `docs/clases-vivas/SPEC.md`, `tools/clases-vivas-test.cjs`, `tools/clases-vivas-e2e.cjs`. Inmersivo pendiente.

Continuidad de estaciones: `NexoStation.progressFor` usa `classSessions[].stationProgress`; las variantes/resultados y el vencimiento del reloj se conservan al reabrir. Pruebas: `tools/station-progress-test.cjs` y `tools/station-progress-e2e.cjs`. Ver segunda entrega en el SPEC de Clases Vivas.

Basicidad guiada: `mission.study.pages/checks` contiene apoyo y comprobaciones formativas; `studyChecksIndex` conserva posición sin reescribir el diagnóstico anterior. Perfil `piloto-basicidad`: práctica/reto sin tabla, familias enseñadas y variantes reproducibles; ayuda/«adiviné» no acredita dominio. Ver `docs/basicidad-guiada/SPEC.md` y `tools/basicidad-guided-e2e.cjs`.
