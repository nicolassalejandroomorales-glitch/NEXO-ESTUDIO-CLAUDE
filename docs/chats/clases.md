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
