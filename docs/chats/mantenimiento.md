# Mantenimiento (pruebas, bundle, Artifact)
- modelo: Sonnet 5.5 · bajo
- estado: tareas sueltas
- prioridad: 3
- spec: docs/pendientes.md

## Hecho
- `npm test` encuentra las pruebas solo; `?v=` por hash; `docs/ESTADO.md` con merge=union.

## Falta
- Arreglar 4 pruebas rotas que se saltan: `update01-test`, `update01-dom-test`, `update01-integrity-test`, `web-vitals-test`.
- Republicar el Artifact privado con lo último de master (desde un worktree limpio).
- Dejar limpio el estado de git: hay muchos archivos sin subir de varios chats.

## Ideas
- Un script que avise qué chats tienen cambios sin subir.
- Revisar el gasto real de tokens cada pocas sesiones y recalibrar modelos.

## Prompt de inicio
```
Chat: Mantenimiento. Lee CLAUDE.md y docs/pendientes.md.
Tarea: dime en una línea qué entendiste. Arregla de a una las 4 pruebas rotas de la lista (usa el agente nexo-tester para correr npm test) y explícame en simple qué estaba mal en cada una.
Si algo toca archivos de otro chat con cambios sin subir, detente y avísame. Al terminar, usa nexo-cierre y actualiza docs/chats/mantenimiento.md.
```

## Prompt de continuación
```
Chat: Mantenimiento. Lee CLAUDE.md y docs/chats/mantenimiento.md.
Parte desde "Falta" y pregúntame qué sigue.
```
