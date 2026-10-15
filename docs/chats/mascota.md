# Mascota
- modelo: Sonnet 5.5 · medio
- estado: implementada, falta aprobación
- prioridad: 3
- spec: docs/mascota/SPEC.md

## Hecho
- 3 mascotas en pixel art (átomo, matraz, slime) con 14 expresiones, emotes y 14 accesorios.
- Viven en Inicio, barra lateral, Perfil › Mascota y Tienda (solo "Probar"). Celebran, duermen de noche y se asustan con tormenta.

## Falta
- Aprobación de Niquito de la Fase 6.
- Precios y compra (depende del chat economia).
- Oclusión detrás de muebles.
- Guardado en la nube (necesita permiso explícito, hoy no se toca Supabase).

## Ideas
- La mascota evoluciona o cambia con la racha de estudio.
- Reacciones a tus notas y a la cercanía de una prueba.
- Más mascotas desbloqueables como premio.

## Prompt de inicio
```
Chat: Mascota. Lee CLAUDE.md, la skill nexo-mascota y docs/mascota/SPEC.md (Fase 6).
Tarea: revisa cómo se ve la mascota en Inicio, barra lateral, Perfil y Tienda en 1440 y 390 y dime en una línea qué falta pulir. Propón con selección múltiple qué hacer primero: oclusión, precios o reacciones nuevas.
No toques Supabase. Al terminar, usa nexo-cierre y actualiza docs/chats/mascota.md.
```

## Prompt de continuación
```
Chat: Mascota. Lee CLAUDE.md, la skill nexo-mascota y docs/chats/mascota.md.
Parte desde "Falta" y pregúntame qué sigue.
```
