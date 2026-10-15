# Chats de Nexo: guía rápida

Un chat = un tema = un modelo. Cada tema tiene su archivo en esta carpeta con: **Hecho · Falta · Ideas · Prompt de inicio · Prompt de continuación**.
La vista visual se genera con `node tools/build-hoja.cjs` y queda en `docs/hoja-de-ruta.html` (ábrela con doble clic).

## Cómo se usa
1. Abre la hoja de ruta, elige el tema y el modelo que indica la tarjeta.
2. Chat nuevo → pega el **Prompt de inicio** (o el de **continuación** si ya trabajaste ese tema).
3. Trabaja. Cuando toque cerrar, Claude hace el cierre y te deja el prompt para el siguiente chat.

## Cuándo abrir un chat nuevo
| Señal | Qué hacer |
|---|---|
| Aprobaste el cambio / el tema quedó terminado | Cerrar y abrir chat del siguiente tema |
| Vas a hablar de otro tema distinto | Chat nuevo con el prompt de ese tema (no mezclar) |
| La conversación ya es larga (muchas capturas o archivos leídos) | Cerrar y seguir con el prompt de continuación |
| Un bug falló 2 veces con Sonnet | Chat corto en Opus con el bug y el prompt de continuación |
| Toca diseñar (motor, economía, estructura de clase) | Chat Opus solo conversando; la implementación va a un chat Sonnet |
| Compactaste 2 veces | Cerrar y abrir uno nuevo, compactar de nuevo ya pierde detalle |

## Antes de cerrar cualquier chat (obligatorio, lo hace Claude)
1. Skill `nexo-cierre` (SPEC, ESTADO, commit y push).
2. Actualizar `docs/chats/<tema>.md`: pasar lo terminado a **Hecho**, ajustar **Falta**, y reescribir **Prompt de continuación** con el punto exacto donde quedó (archivos tocados, decisión pendiente, siguiente paso).
3. Correr `node tools/build-hoja.cjs`.
4. Mostrarle a Niquito el prompt de continuación en un bloque listo para copiar.

## Plantilla del prompt de continuación
```
Chat: <tema>. Lee CLAUDE.md, la skill <skill> y docs/chats/<tema>.md.
Dónde quedamos: <1-2 líneas con lo hecho>.
Siguiente paso: <una acción concreta>.
Decisión pendiente (si hay): <pregunta>.
No te salgas del tema. Al terminar, usa nexo-cierre y actualiza docs/chats/<tema>.md.
```

## Modelos por chat
- **Sonnet 5.5 · medio**: casi todo (Inicio, mascota, tutorial, juegos, clases, organización).
- **Sonnet 5.5 · bajo**: mantenimiento y tareas mecánicas.
- **Opus**: solo chats de diseño del motor o bugs que fallaron 2 veces.
- Si necesitas más calidad, primero sube el esfuerzo y después el modelo.
