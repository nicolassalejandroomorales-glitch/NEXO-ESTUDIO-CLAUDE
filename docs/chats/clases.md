# Clases (contenido y aula)
- modelo: Sonnet 5.5 · medio
- estado: en curso
- prioridad: 1
- spec: docs/clases-estructura/SPEC.md

## Hecho
- Aula inmersiva "torre del alquimista" (`dist/classes/`).
- Aminas completo para la PEP 1 (misiones 2 a 8, 63 actividades verificadas), diapositivas y glosario.
- Clases de Analítica, Fisiopatología, Orgánica II y FQ II; ejercicios infinitos con regla de calidad.
- Guía para crear una clase: `docs/clases-estructura/COMO_CREAR_UNA_CLASE.md` y `node tools/new-class.cjs`.

## Clases v2 (18 oct 2026)
- Paso 1 hecho: 3 versiones visuales de la estación Basicidad (`docs/clases-v2/estacion-basicidad.html`, SPEC en `docs/clases-v2/SPEC.md`). Decidido: mini juego "Atrapa el H⁺", habla la mascota.
- Elegida la versión C (cristal-pantalla). Paso 2 hecho: prototipo en `dist/classes/estacion-prueba.html` (mascota real, textos cortos, animaciones fluidas). Niquito descartó "Atrapa el H⁺" (no prepara para la PEP): ahora Práctica + Demuestra con la pregunta 3 de la PEP (reloj, un intento, puntos asegurados, repaso). Aprobado. Paso 3 hecho: estructuras dibujadas (RDKit) y conectado a la app (`#/station/org-01/m4`, tarjeta en las misiones, evidencia + repaso). Falta: otras misiones, celular real.

## Clases funcionales hasta la PEP 1 (18 oct 2026)
- Prioridad de Niquito: que cada ramo tenga clases de verdad (PPT real, explicación a fondo, ejemplos, versión simple, práctica y prueba) al menos hasta su PEP 1. Orden pedido: Analítica (control 19 oct) → Orgánica → FQ → Fisiopatología.
- Analítica: PPT de cátedra 2026 bajados de Classroom (Conceptos, Etapas, Errores, Análisis volumétrico, Volumetría ácido-base). ana-01 (89 diapositivas), ana-02 (35), ana-03 (61) ya muestran las diapositivas reales y cada actividad apunta a su página real. Pruebas OK.
- Analítica control 1 (19 oct): bajados de Gmail el PPT «Clase 2 Ejercicios» y la «Guía 1 2026» (Vidal). Guía = errores y análisis de datos. ana-01 ahora enseña test Q de Dixon (diapositivas 83 y 86) y «elegir al mejor laboratorio/método» (misión m2, parte 3) y tiene 2 generadores nuevos (`dixon`, `comparar`). Pendiente: probar en celular (390) y que Niquito revise la química; la diapositiva 87 de Pizarro tiene un error (B: Er = 0,64 %, no 0,006 %).
- Orgánica (hecho 18 oct): org-02 (pKa) y org-03 (par libre) ya vivían en org-01 (misiones 4 y 5), así que se quitaron del mapa; la PEP 1 queda con Aminas, Aromaticidad y SEA (3 clases con contenido). PPT y 3 guías 2021 bajados de su Classroom (ids en el correo usach); las guías aún no se usan como ejercicios: pendiente decidir si se suman a org-01/04/05.
- FQ II (hecho 18 oct): fq-02 «Actividad y fuerza iónica» (3 misiones: electrolitos y actividad, Debye–Hückel con solubilidad y Ka, conductividad; 104 diapositivas) y fq-03 «Celdas galvánicas y Nernst» (3 misiones: potenciales y celdas, ΔG/K/Nernst, pH por fem y Faraday; 101 diapositivas), ambas con generadores propios. PPT: Classroom «FQII - Farmacia» (Clases 5 I, 5 II y 6). Pendiente: fq-01 aún sin diapositivas reales (Clases 1–4) y revisión química de Niquito.
- Errores en el material de FQ (avisados dentro de la clase o evitados): la diapositiva 22 de fq-02 da I = 0,01 y la suma correcta es 0,10; los ejercicios «Aplicaciones de FEM» de la Clase 6 (diap. 83–93 de fq-03) tienen datos incoherentes (γ± ≈ 27, pH negativo) y no se usaron.
- Límite del reproductor (chat de diseño): las respuestas numéricas tienen una tolerancia mínima absoluta de 1e-12, así que en respuestas < 1e-10 (p. ej. K°ps del AgBr) cualquier valor se acepta; en fq-02 se evitó. Si algún día se cambia, quitar el filtro de `solub` nivel 4.
- Prompt de continuación: «Chat Clases. Lee CLAUDE.md, la skill nexo-clase y docs/chats/clases.md. Sigue por Fisiopatología: sus 4 clases PEP 1 ya tienen contenido, pero sin diapositivas reales; busca las de cátedra (correos de Hugo Cárdenas y Drive), conviértelas con slides.py y reasigna cada slide: como se hizo en ana-01. Luego fq-01 (Clases 1–4 de Pino).»

## Falta
- Que la clase de Aminas → Basicidad se sienta increíble (corrección real, actividades variadas). Es lo más importante del producto.
- Revisar las clases hechas en móvil (390 px).
- Decidir si el aula pasa a pixel art (ver chat pixel-ui).

## Ideas
- Modo "simulacro" de PEP 1 con tiempo y pauta.
- Retrosíntesis guiada paso a paso con flechas dibujadas por el usuario.
- Clases de otros ramos del semestre con la misma estructura.

## Prompt de inicio
```
Chat: Clases (contenido y aula). Lee CLAUDE.md, la skill nexo-clase y docs/clases-estructura/SPEC.md.
Contexto: Aminas está completo para la PEP 1 (27 oct). Quiero que la parte de Basicidad se sienta increíble, con corrección real y actividades variadas.
Tarea: dime en una línea qué entendiste, revisa la clase en desktop (1440) y móvil (390), y propónme con selección múltiple las 3 mejoras de mayor impacto antes de programar.
Si aparece un problema de diseño del motor, no lo resuelvas aquí: anótalo en docs/chats/motor.md. Al terminar, usa nexo-cierre y actualiza docs/chats/clases.md.
```

## Prompt de continuación
```
Chat: Clases (contenido y aula). Lee CLAUDE.md, la skill nexo-clase y docs/chats/clases.md.
Parte desde "Falta" del archivo de chat y pregúntame qué sigue.
```

## Prompt de continuación (Clases v2)
```
Chat: Clases v2 (piloto Basicidad). Lee CLAUDE.md, la skill nexo-clase, docs/clases-v2/SPEC.md y docs/aprender-pasillo/SPEC.md.
Versión visual elegida: C (cristal-pantalla), habla la mascota real. Paso 3 = ordenar por basicidad estilo PEP (no hay mini juego). Boceto: docs/clases-v2/estacion-basicidad.html.
Tarea (paso 4): generalizar la estación a otras misiones de Aminas (m5…) y probar en celular real. Probar en 1440 y 390. Opus para diseñar la estructura, Sonnet para implementar.
```
