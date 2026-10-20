# Motor académico (diseño)
- modelo: Opus · esfuerzo medio (diseño); Sonnet para implementar
- estado: piloto en Aminas; clases y juegos ya alimentan evidencia y rangos
- fase: desarrollo
- prioridad: 2
- spec: docs/fase-i-motor/SPEC.md

## Hecho
- 20 oct, Fase I: registro local recuperable del aula y Demuestra; respuesta guardada antes de cargar motor/FSRS, reenvío idempotente, fuente y variante conservadas. Reconciliación al reabrir y protección al importar otro estado. Pruebas rápidas 44/44; navegador 1440/390 en Orgánica y Analítica. Ver `docs/fase-i-motor/SPEC.md`.
- Conceptos, evidencia, estados de conocimiento y FSRS en `dist/academic/*`. Piloto org-01 / Aminas.
- Etapas 4 a 10 (diagnóstico, intuitivo, grimorio, prueba, entrenar, replicar, arte) con su SPEC.
- Ejercicios con regla de calidad (`docs/calidad-ejercicios/SPEC.md`).
- 18 oct: puente clase → motor (`class-bridge.js`). Las 11 clases y los juegos escriben evidencia.
- 19 oct: las clases ya pueden dar rangos (`docs/motor-rangos/SPEC.md`): minutos por concepto en el aula y la estación, `class_item` verificada, familias por habilidad, la escrita correcta cuenta como justificada y la carta del perfil usa todos los conceptos.
- 19 oct: hoja verde rehecha (`docs/motor-verde/SPEC.md`): 2 ejercicios distintos de escalón 4 o más sin ayuda; `auditGreen` y prueba con tope por clase.

## Falta
- Corrección real de respuestas abiertas: la escrita sigue siendo autorúbrica. Auditoría 19 oct: mostrar la respuesta modelo antes de marcar y exigir palabras clave.
- Clases: 86 conceptos aún no pueden llegar a hoja verde (30 son `base.*` sin ejercicios). Hay que agregarles ejercicios de calcular o dibujar y bajar el tope en `tools/class-evidence-test.cjs`.
- Decidir si `study_bank` (motor de estudio piloto) también cuenta como verificado.

## Ideas
- Repaso espaciado diario de 10 min que mezcle ramos según cercanía de evaluaciones.
- Panel de "qué tan listo estoy" por evaluación, con evidencia y no con porcentaje inventado.
- Auditoría 19 oct, para el tema clases: ejemplos resueltos y casos de corrección en FQ y Analítica, y actividades interactivas (predice y observa, recetas) fuera de Orgánica.

## Prompt de inicio
```
Chat: Motor académico (Opus). Lee CLAUDE.md, la skill nexo-motor y docs/chats/motor.md.
Parte desde "Falta". Siguiente decisión de diseño: la corrección de escritas (autorúbrica vs corrección real). Pregúntame con selección múltiple.
```

## Prompt de continuación
```
Continúa NEXO desde la rama/PR de Fase I del motor académico. Lee CLAUDE.md, la skill nexo-motor,
docs/chats/motor.md y docs/fase-i-motor/SPEC.md. El aula y Demuestra ya guardan una evidencia local
única y recuperable antes de entregar al motor/FSRS. Respeta estos registros y sus datos previos.
Comprueba primero qué se integró en master: el diseño sigue en otro chat. Siguiente entrega a definir:
corrección objetiva y semántica honesta de autorúbrica/progreso, o retomar una prueba sin terminar.
No cambies arte ni Grimorio ni mascota, no agregues avatar jugable ni servicios obligatorios de pago.
Mantén entregas pequeñas; no generes Biblia definitiva ni skill NEXO Arquitecto.
```
