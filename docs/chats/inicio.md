# Inicio (refugio)
- modelo: Sonnet 5.5 · medio
- estado: clima y escenas por luz subidos (14 oct), falta animación
- prioridad: 2
- spec: docs/inicio-pixelart/SPEC.md

## Hecho
- Refugio en pixel art de verdad, ya es el Inicio por defecto.
- Ventana según la hora, noche cálida, luz continua, 7+ objetos tocables.
- Clima real (Open-Meteo) y escenas pintadas por luz (sol, nublado, tarde, noche) con `refugio-vida.js`, ya en master (14 oct).
- Arreglos de piso, sombrero y botas.

## Falta
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
Contexto: el clima real y las escenas por luz ya están en master. Falta la animación dentro de la app y revisar la mascota en el escritorio.
Tarea: dime en una línea qué entendiste y propón con selección múltiple por cuál sigo del Pendiente.
No te salgas del tema. Al terminar, usa nexo-cierre y actualiza docs/chats/inicio.md.
```

## Prompt de continuación
```
Chat: Inicio (refugio). Lee CLAUDE.md, la skill nexo-inicio y docs/chats/inicio.md.
Parte desde "Falta" y pregúntame qué sigue.
```
