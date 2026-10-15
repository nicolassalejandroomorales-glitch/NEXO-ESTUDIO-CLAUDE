# Inicio (refugio)
- modelo: Sonnet 5.5 · medio
- estado: en curso, con cambios sin subir
- prioridad: 2
- spec: docs/inicio-pixelart/SPEC.md

## Hecho
- Refugio en pixel art de verdad, ya es el Inicio por defecto.
- Ventana según la hora, noche cálida, luz continua, 7+ objetos tocables.
- Clima real (Open-Meteo) y variantes de escena (sol, tarde, noche, nublado) en trabajo local.
- Arreglos de piso, sombrero y botas.

## Falta
- Subir lo que está sin commit (escenas por clima, `refugio-vida.js`, `weather.js`) con el bundle regenerado en limpio.
- Animación dentro de la app: hiedra, llamas, runas, velas, pájaros, nubes, vapor (hoy el fondo es estático).
- Revisar el ancla `desk` de la mascota en el escritorio nuevo.
- Aprobación visual final (ANTES/AHORA) de la ventana viva.

## Ideas
- Zoom por zonas del refugio al tocar objetos.
- Objetos del refugio que cambian según tus logros o rangos.
- Sonido ambiente suave según clima y hora.

## Prompt de inicio
```
Chat: Inicio (refugio). Lee CLAUDE.md, la skill nexo-inicio y docs/inicio-pixelart/SPEC.md.
Contexto: hay cambios sin subir (escenas por clima, refugio-vida.js, weather.js). Mira git status y dime en una línea qué hay.
Tarea: primero ayúdame a dejar eso listo y subido (bundle regenerado en un worktree limpio si hay cambios de otros chats). Después dime qué sigue del Pendiente y propónmelo con selección múltiple.
No te salgas del tema. Al terminar, usa nexo-cierre y actualiza docs/chats/inicio.md.
```

## Prompt de continuación
```
Chat: Inicio (refugio). Lee CLAUDE.md, la skill nexo-inicio y docs/chats/inicio.md.
Parte desde "Falta" y pregúntame qué sigue.
```
