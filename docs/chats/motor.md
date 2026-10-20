# Motor académico (diseño)
- modelo: Opus · esfuerzo medio (diseño); Sonnet para implementar
- estado: piloto en Aminas; clases y juegos ya alimentan evidencia y rangos
- fase: desarrollo
- prioridad: 2
- spec: docs/confiabilidad-motor/SPEC.md

## Hecho
- 20 oct, segunda entrega local: cuatro regresiones de `88937b5` reproducidas antes de corregir. Variantes con identidad propia; autoevaluación conservada sin acreditar dominio/rango; FSRS serializado con reenvíos idempotentes; catálogo restaurado con IDs históricos. Evidencia contradictoria no se usa para acreditar progreso; no se reescribe historial. Regresiones 4/4, batería 45/45 con cinco exclusiones previas y navegador 1440/390. Ver `docs/confiabilidad-motor/SPEC.md`.
- 20 oct, Fase I: registro local recuperable del aula y Demuestra; respuesta guardada antes de cargar motor/FSRS, reenvío idempotente, fuente y variante conservadas. Reconciliación al reabrir y protección al importar otro estado. Pruebas rápidas 44/44; navegador 1440/390 en Orgánica y Analítica. Ver `docs/fase-i-motor/SPEC.md`.
- Conceptos, evidencia, estados de conocimiento y FSRS en `dist/academic/*`. Piloto org-01 / Aminas.
- Etapas 4 a 10 (diagnóstico, intuitivo, grimorio, prueba, entrenar, replicar, arte) con su SPEC.
- Ejercicios con regla de calidad (`docs/calidad-ejercicios/SPEC.md`).
- 18 oct: puente clase → motor (`class-bridge.js`). Las 11 clases y los juegos escriben evidencia.
- 19 oct: las clases ya pueden dar rangos (`docs/motor-rangos/SPEC.md`): minutos por concepto en el aula y la estación, `class_item` verificada, familias por habilidad, la escrita correcta cuenta como justificada y la carta del perfil usa todos los conceptos.
- 19 oct: hoja verde rehecha (`docs/motor-verde/SPEC.md`): 2 ejercicios distintos de escalón 4 o más sin ayuda; `auditGreen` y prueba con tope por clase.

## Falta
- Auditoría independiente de la segunda entrega y decisión de integración/publicación.
- Corrección real de respuestas abiertas: la escrita sigue siendo autorúbrica; palabras clave por sí solas no son verificación semántica.
- Clases: el auditor ahora cuenta 88 conceptos sin dos actividades objetivas de producción (antes 86, incluyendo autorúbricas). Incorporar comprobaciones objetivas suficientes y bajar el inventario en `tools/class-evidence-test.cjs`.
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
Revisa independientemente la segunda entrega local de confiabilidad, basada en 88937b5 y contrastada
con 5503511. Lee CLAUDE.md, la skill nexo-motor y docs/confiabilidad-motor/SPEC.md. Ejecuta primero
tools/academic-reliability-test.cjs, la batería rápida y tools/academic-loop-e2e.cjs. Contrasta los logs
antes/después con el código. Verifica atribución, autorúbrica, FSRS concurrente y restauración del catálogo,
sin borrar ni reescribir intentos históricos. Distingue código local de lo integrado/publicado.
Esta implementación no se ha autorizado para publicación. El diseño sigue en otro chat.
No cambies arte ni Grimorio ni mascota, no agregues avatar jugable ni servicios obligatorios de pago.
Mantén entregas pequeñas; no generes Biblia definitiva ni skill NEXO Arquitecto.
```
