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
