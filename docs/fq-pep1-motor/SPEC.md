# FQ II · PEP 1 con el motor (19 oct 2026)

Sesión hija de `docs/clases-pep1-motor/SPEC.md`. Mapa de qué cae: `MAPA.md`. Simulacro completo con pauta: `SIMULACRO.md`.

## Qué
Que las 3 clases de FQ II (fq-01 equilibrio, fq-02 electrolitos, fq-03 electroquímica) preparen la PEP 1 con el formato de las pruebas pasadas, datos nuevos, conceptos del motor y fuente por dato.

## Decisiones
- **La PEP 1 es el miércoles 28 de octubre** (correo del Dr. Pino, 19 oct). Control 1: lunes 26. Las clases dicen 28; `dist/semester-2026.js` sigue en 21 (ver Pendiente).
- Exámenes pasados reales hallados: Control 1 2S2023 (enunciado), PEP 1 2S2023 (resolución de alumno), Guías 1 y 2. Las imágenes de `dist/assets/exams/` de FQ II (01–04) son de cinética, no de la PEP 1.
- Se agregaron generadores con el formato de las pruebas, **no** clases nuevas: `eqmoles` y `gibbsvh` (fq-01), `mezcla` (fq-02) y la actividad escrita `m2-w2` (postulados de Debye–Hückel, fq-02). Quedan en las pruebas finales (`demuestra`) de m3, m4 y m2.
- Simulacro completo como documento (100 min, 5 problemas, pauta con puntaje, tabla «si fallaste X vuelve a Y»). El aula ya trae un «Simulacro PEP» por clase; uno que mezcle las 3 clases dentro de la app queda pendiente.
- Las 3 clases siguen en `borrador`.

## Hecho (19 oct)
- MAPA.md con tabla tema × prueba, prioridad, brechas, errores del material y bibliografía.
- Generadores nuevos con regla de calidad cumplida (`node tools/exercise-quality.cjs fq-01 fq-02 fq-03`), pruebas 43/43.
- Error del enunciado del Control 1 2023 avisado (ΔfG°(NO) con signo cambiado).

## Criterios de aceptación (para sacar de borrador)
1. Niquito aprueba el contenido de cada clase.
2. Revisar la Guía 2 y la Guía 3 de 2026 (adjuntos de M. Zapata) y ajustar generadores.
3. `node tools/run-tests.cjs` pasa; 1440 y 390 revisados.

## Pendiente
- ~~Mover la PEP 1 al 28 de oct en `semester-2026.js`~~ hecho (con `calendario-test` y `organizacion-test`).
- Guías 2 y 3 de 2026: el conector de Gmail no baja adjuntos; Niquito las pasa (foto/PDF).
- Confirmar con Pino/Zúñiga: duración de la PEP, qué p° usan (1 bar o 1 atm), si entra la Debye–Hückel ampliada y si Faraday/conductividad caen en la PEP 1.
- Preguntar por el dato de la Guía 2 #11 (Kps BaCl₂ = 176,94) y el signo en el Control 1 2023 P2.
- Simulacro mezclado de las 3 clases dentro de la app (hoy es un documento).
- Diapositivas de fq-02/fq-03 siguen siendo las de Clase 5 y 6; revisar si hubo clases nuevas del 19 y 20 de oct.
