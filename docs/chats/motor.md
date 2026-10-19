# Motor académico (diseño)
- modelo: Opus · esfuerzo medio (diseño); Sonnet para implementar
- estado: piloto en Aminas; clases y juegos ya alimentan evidencia y rangos
- fase: desarrollo
- prioridad: 2
- spec: docs/motor-rangos/SPEC.md

## Hecho
- Conceptos, evidencia, estados de conocimiento y FSRS en `dist/academic/*`. Piloto org-01 / Aminas.
- Etapas 4 a 10 (diagnóstico, intuitivo, grimorio, prueba, entrenar, replicar, arte) con su SPEC.
- Ejercicios con regla de calidad (`docs/calidad-ejercicios/SPEC.md`).
- 18 oct: puente clase → motor (`class-bridge.js`). Las 11 clases y los juegos escriben evidencia.
- 19 oct: las clases ya pueden dar rangos (`docs/motor-rangos/SPEC.md`):
  - minutos por concepto en el aula y la estación
  - `class_item` cuenta como verificada
  - familias por habilidad
  - la escrita correcta cuenta como justificada
  - la carta del perfil usa todos los conceptos

## Falta
- Corrección real de respuestas abiertas: la escrita sigue siendo autorúbrica. Auditoría 19 oct: mostrar la respuesta modelo antes de marcar y exigir palabras clave.
- Regla de la "hoja verde" (`classes/evidence.js`): solo escribir y calcular cuentan como producir, así que hay conceptos que nunca llegan a verde (8/22 en org-01, 6/11 en org-05). Dibujar sin ayuda debería contar.
- Decidir si `study_bank` (motor de estudio piloto) también cuenta como verificado.

## Ideas
- Repaso espaciado diario de 10 min que mezcle ramos según cercanía de evaluaciones.
- Panel de "qué tan listo estoy" por evaluación, con evidencia y no con porcentaje inventado.
- Auditoría 19 oct, para el tema clases: ejemplos resueltos y casos de corrección en FQ y Analítica, y actividades interactivas (predice y observa, recetas) fuera de Orgánica.

## Prompt de inicio
```
Chat: Motor académico (Opus). Lee CLAUDE.md, la skill nexo-motor y docs/chats/motor.md.
Parte desde "Falta" y pregúntame qué decisión de diseño toca primero.
```

## Prompt de continuación
```
Chat: Motor académico (Opus para diseñar, Sonnet para implementar). Lee CLAUDE.md, la skill nexo-motor, docs/chats/motor.md y docs/motor-rangos/SPEC.md.
Ya está hecho: las clases y los juegos dan rangos (minutos, verificadas, familias por habilidad, carta del perfil).
Sigue con el punto 2 de la auditoría del 19 oct: la regla de la "hoja verde" en dist/classes/evidence.js
(hoy solo escribir y calcular cuentan como "producir solo", y hay conceptos que nunca llegan a verde).
Hazme máximo 3 preguntas de selección múltiple y escribe docs/motor-verde/SPEC.md antes de programar.
```
