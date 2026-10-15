# Motor académico (diseño)
- modelo: Opus · esfuerzo alto
- estado: piloto hecho en Aminas
- prioridad: 2
- spec: docs/etapa-4-diagnostico/SPEC.md

## Hecho
- Conceptos, evidencia, estados de conocimiento y FSRS en `dist/academic/*`. Piloto org-01 / Aminas.
- Etapas 4 a 10 (diagnóstico, intuitivo, grimorio, prueba, entrenar, replicar, arte) con su SPEC.
- Ejercicios con regla de calidad (`docs/calidad-ejercicios/SPEC.md`).

## Falta
- Extender el motor a otros ramos (Fisiopatología, Analítica, FQ II) sin reescribir.
- Corrección real de respuestas abiertas y de flechas/mecanismos.
- Que los juegos y las clases alimenten la misma evidencia (hoy el juego PEP 1 no registra intentos).

## Ideas
- Repaso espaciado diario de 10 min que mezcle ramos según cercanía de evaluaciones.
- Detección de "falsa sensación de dominio": acertar con ayuda no cuenta igual que sin ayuda.
- Panel de "qué tan listo estoy" por evaluación, con evidencia y no con porcentaje inventado.

## Prompt de inicio
```
Chat: Motor académico (solo diseño, Opus). Lee CLAUDE.md, la skill nexo-motor y los SPEC de docs/etapa-4-diagnostico y docs/calidad-ejercicios.
Tarea: conversemos. Dime en una línea qué entendiste y hazme máximo 3 preguntas de selección múltiple sobre cómo extender el motor a otros ramos y cómo corregir respuestas abiertas de verdad.
No escribas código hasta que yo diga "implementa". El resultado es un docs/motor/SPEC.md corto y un prompt listo para un chat Sonnet que lo construya.
Al terminar, usa nexo-cierre y actualiza docs/chats/motor.md.
```

## Prompt de continuación
```
Chat: Motor académico (Opus). Lee CLAUDE.md, la skill nexo-motor y docs/chats/motor.md.
Parte desde "Falta" y pregúntame qué decisión de diseño toca primero.
```
