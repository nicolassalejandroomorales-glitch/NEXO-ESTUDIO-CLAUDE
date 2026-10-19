# Clases PEP 1 con el motor (19 oct 2026)

## Qué
Que cada ramo tenga todas sus clases de la PEP 1 hechas **con el motor de estudio** y no genéricas. Hoy hay 13 clases en `borrador`
(org-01/04/05, fq-01/02/03, ana-01/02/03, fis-01/02/06/09). Org-04/05 y las 4 de Fisiopatología no tienen diapositivas reales.

## Decisiones (Niquito, 19 oct)
- "No genérica" = sigue las diapositivas 2026, imita las pruebas pasadas (formato y dificultad), se adapta a sus errores (motor) y sin relleno de plantilla.
- Sin PPT: temario 2026 + libros de la bibliografía. Libros: buscar en el Drive (Material Nexo 2026) y fuentes confiables (OpenStax, GOLD, etc.). El repo `claude` no tiene libros.
- Exámenes pasados: **las dos cosas**: un mapa de qué cae (tabla de temas y puntos por año, en el SPEC del ramo) y ejercicios con ese formato y datos nuevos.
- Revisión: Claude cota cada dato con su diapositiva/página; Niquito aprueba por clase. Una clase sale de `borrador` solo si está **cotejada, probada (`npm test`) y aprobada por Niquito**.
- Tiempo disponible: 4 h o más al día. Prioridad: FQ II (21 oct) > Orgánica (27 oct) > Fisiopatología (12 nov) > Analítica (13 nov; control 1 hoy).
- FQ II incluye un simulacro completo tipo PEP 1 con tiempo y pauta.

## Cómo (una sesión por ramo, sin tocar archivos de otro ramo)
Cada sesión: (1) mapa de qué cae en `docs/<ramo>-pep1-motor/MAPA.md` desde exámenes pasados (`dist/assets/exams/`, Drive, pautas), (2) auditar sus clases contra temario y PPT,
(3) rehacer lo genérico con ejercicios en formato de prueba y conceptos del motor (`dist/academic/`), (4) cotejar con fuente, (5) pruebas.

## Criterios de aceptación
- Cada tema del temario PEP 1 oficial tiene clase con fuente por actividad.
- `node tools/run-tests.cjs` pasa; 1440 y 390 revisados.
- Errores del material de cátedra avisados, no copiados.

## Pendiente
- Bibliografía exacta de Orgánica y Fisiopatología en el Drive.
- Fechas: confirmar Fisiopatología (el programa dice 2024-II).
