# Organización (Bitácora viva)
- modelo: Sonnet 5.5 · medio
- estado: Fases 1 a 3 hechas, siguen Lab y Avisos
- prioridad: 1
- spec: docs/update-02-organizacion/SPEC.md

## Hecho
- Diseño v2 y decisiones de 3 tandas; datos reales de los ramos cargados (ponderaciones, labs, fechas, horario).
- Fase 1 aprobada: estudio de planos de la torre, vista Hoy con plan propuesto, avisos en el Inicio, sonidos, balanza y mesa viva.
- Fase 2 aprobada: Notas e inasistencias (frascos, "Necesitas X,X", simulador); Perfil ya redirige a Organización.
- Fase 3 hecha, esperando aprobación visual: Calendario (mes, semana, semestre, lista) con historial de fechas y .ics.

## Falta
- Aprobación visual del Calendario (1440 y 390).
- Lab completo (laboratorios, pruebas de ciclo).
- Avisos: bandeja de la campana, cambios de fecha, Inicio calmado el día de prueba, ritual del domingo, resumen del semestre.
- Decidir Classroom vs pegar texto (AVISOS.md).
- Editar o borrar una fecha desde el estudio y "¿cómo te fue?" después de rendir.

## Ideas
- Plan semanal automático según evaluaciones cercanas, errores y tiempo (ya decidido en el v1, ver SPEC).
- Aviso del celular fuera de la app (queda fuera de este cambio).

## Prompt de inicio
```
Chat: Organización (Bitácora viva). Lee CLAUDE.md y docs/update-02-organizacion/SPEC.md (sección Pendiente).
Contexto: Fases 1, 2 y 3 (Hoy, Notas, Calendario) ya están programadas; el Calendario espera mi aprobación. Faltan Lab y Avisos. La PEP 1 es el 27 oct.
Tarea: dime en una línea qué entendiste, revisa el Calendario en 1440 y 390 y pregúntame con selección múltiple si lo apruebo o qué ajustar; después propón el orden de Lab y Avisos.
No te salgas del tema. Al terminar, usa nexo-cierre y actualiza docs/chats/organizacion.md.
```

## Prompt de continuación
```
Chat: Organización (Bitácora viva). Lee CLAUDE.md, docs/update-02-organizacion/SPEC.md y docs/chats/organizacion.md.
Aún no se ha trabajado en este chat nuevo: parte desde "Falta" del archivo de chat y pregúntame cuál fase sigue.
```
