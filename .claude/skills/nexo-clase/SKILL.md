---
name: nexo-clase
description: Crear o editar una clase de Nexo (aula "torre del alquimista", misiones, actividades, camino al 7). Úsala cuando la tarea toque dist/classes/, contenido de un tema o la estructura de una clase.
---

# Clases de Nexo

1. Lee `docs/clases-estructura/COMO_CREAR_UNA_CLASE.md` (la guía completa). Ejemplo de referencia: `dist/classes/org-01.js` (Aminas, PEP 1).
2. Una clase es **un archivo de datos**; el aula (`player.js`, `classroom.css`, `tower-art.js`) no se toca para agregar contenido.
3. Crear la base: `node tools/new-class.cjs`. Probar: `node tools/classroom-test.cjs`.
4. Cada misión: diagnostic → fundamentals → explain → worked → practice → (challenge) → transfer. Rescate y cierre los arma el aula.
5. Objetivo de Nexo: **aprender de verdad**. Un punto de la prueba solo cuenta como demostrado al acertar sin ayuda la transferencia. Nada de falsa sensación de dominio.
6. Contenido académico: verificar contra la fuente (PPT, pauta). Si algo no está en la fuente, decirlo; no inventar.
7. Diseñar la estructura de una clase nueva o el motor (`dist/academic/*`, FSRS): recomendar **Opus**. Llenar contenido siguiendo la guía: **Sonnet**.
