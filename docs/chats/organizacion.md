# Organización (Bitácora viva)
- modelo: Sonnet 5.5 · medio
- estado: diseño listo, sin programar
- prioridad: 1
- spec: docs/update-02-organizacion/SPEC.md

## Hecho
- Diseño v2 completo (Hoy · Calendario · Pruebas · Notas · Avisos) y maqueta en `docs/update-02-organizacion/maqueta/`.
- Diagnóstico con capturas reales (antes/).

## Falta
- Que Niquito apruebe diseño y maqueta (nada programado).
- Fase 0: kit pixel + fuente (`tools/pixel-ui/`).
- Fase 1: avisos en el Inicio + pestaña Hoy (urgente: semana 19–27 oct tiene 4 evaluaciones).
- Fase 2: Notas (frascos, simulador, unificar con Perfil › Notas, ponderaciones de Orgánica y Fisiopatología).
- Fase 3: Calendario nuevo + horario fijo.
- Fase 4: Pruebas (fichas, plan hacia atrás, autopsia).
- Fase 5: mascota viva en todas las pestañas.
- Fase 6: Avisos (decidir Classroom vs pegar texto, ver AVISOS.md).

## Ideas
- Plan semanal automático según evaluaciones cercanas, errores y tiempo (ya decidido en el v1, ver SPEC).
- Aviso del celular fuera de la app (queda fuera de este cambio).

## Prompt de inicio
```
Chat: Organización (Bitácora viva). Lee CLAUDE.md y docs/update-02-organizacion/SPEC.md.
Contexto: el diseño v2 y la maqueta están hechos, nada programado. Tengo 4 evaluaciones entre el 19 y el 27 oct, así que lo urgente es la Fase 1 (avisos en el Inicio + pestaña Hoy).
Tarea: dime en una línea qué entendiste, hazme máximo 3 preguntas de selección múltiple para cerrar lo que falta aprobar del diseño, y luego implementa solo la Fase 0 y la Fase 1 en pasos chicos.
No te salgas del tema. Al terminar, usa nexo-cierre y actualiza docs/chats/organizacion.md.
```

## Prompt de continuación
```
Chat: Organización (Bitácora viva). Lee CLAUDE.md, docs/update-02-organizacion/SPEC.md y docs/chats/organizacion.md.
Aún no se ha trabajado en este chat nuevo: parte desde "Falta" del archivo de chat y pregúntame cuál fase sigue.
```
