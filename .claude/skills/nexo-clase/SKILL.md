---
name: nexo-clase
description: Crear o editar una clase de Nexo (aula "torre del alquimista", misiones, actividades, camino al 7). Úsala cuando la tarea toque dist/classes/, contenido de un tema o la estructura de una clase.
---

# Clases de Nexo

0. **Clases nuevas = v2** (18 oct 2026): estaciones mixtas (clase, mini juego, reto PEP). Lee primero `docs/clases-estructura/DISENO-V2.md`; lo de abajo describe la v1 que se reemplaza.
1. Lee `docs/clases-estructura/COMO_CREAR_UNA_CLASE.md` (la guía completa). Ejemplo de referencia: `dist/classes/org-01.js` (Aminas, PEP 1).
2. Una clase es **un archivo de datos**; el aula (`player.js`, `classroom.css`, `tower-art.js`) no se toca para agregar contenido.
3. Crear la base: `node tools/new-class.cjs`. Probar: `node tools/classroom-test.cjs`.
4. Cada misión: diagnostic → fundamentals → explain → worked → practice → (challenge) → transfer. Rescate y cierre los arma el aula.
5. Objetivo de Nexo: **aprender de verdad**. Un punto de la prueba solo cuenta como demostrado al acertar sin ayuda la transferencia. Nada de falsa sensación de dominio.
6. Contenido académico: verificar contra la fuente (PPT, pauta). Si algo no está en la fuente, decirlo; no inventar.
7. Diseñar la estructura de una clase nueva o el motor (`dist/academic/*`, FSRS): recomendar **Opus**. Llenar contenido siguiendo la guía: **Sonnet**.
8. Ejercicios infinitos: cada clase tiene un `dist/classes/<id>-gen.js` con generadores `{ id, title, mission, concepts, make(rng, level, want) }`
   (`want` es opcional: pide una variante concreta). La clase se registra con una línea en `dist/classes/catalog.js`.
9. **Regla de calidad** (`node tools/exercise-quality.cjs`, corre en `npm test`): por generador ≥ 60 ejercicios distintos y ≥ 3 moldes
   (enunciados distintos al borrar los números), ≥ 3 alternativas por pregunta y nada de "ninguna/todas las anteriores".
