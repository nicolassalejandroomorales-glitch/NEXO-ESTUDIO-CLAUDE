# Inicio (refugio)
- modelo: Sonnet 5.5 · medio
- estado: clima y escenas por luz subidos (14 oct), falta animación
- prioridad: 2
- spec: docs/inicio-reloj/SPEC.md (y docs/inicio-pixelart/SPEC.md)

## Hecho
- Distribución nueva del Inicio, paso 1 de `docs/inicio-reloj/SPEC.md` (24 oct): riel de 104 px, refugio 924×520, reloj + calendario + Próximas pruebas a la derecha, Calificaciones/Apuntes debajo, avatar de la mascota abajo a la izquierda; carteles y pie quitados. Falta aprobación visual.
- Texto del Inicio rehecho (17 oct): letras pixel propias, carteles colgados de la viga en vez de tarjetas, reloj con hora y datos en pixel, título viejo quitado. Falta aprobación visual.
- Animaciones nuevas (17 oct): nubes grandes y rápidas con sombra en el piso, brillo que recorre la hiedra, hojas y páginas que caen, poción que burbujea, polvo de luz y luciérnagas de noche; reloj con engranaje, orbe, péndulo, matraz y chispas al terminar. Ventana ya no es tocable. Falta aprobación visual.
- Reloj de la torre en el Inicio (17 oct): hora y momento del día, cronómetro con Estudiar/Pausar/Terminar, minutos de hoy y próxima evaluación; falta aprobación visual de Niquito.
- Refugio en pixel art de verdad, ya es el Inicio por defecto.
- Ventana según la hora, noche cálida, luz continua, objetos tocables.
- Clima real (Open-Meteo) y escenas pintadas por luz (sol, nublado, tarde, noche) con `refugio-vida.js`, ya en master (14 oct).
- Arreglos de piso, sombrero y botas.

## Falta
- Pasos 2–6 de `docs/inicio-reloj/SPEC.md`: reloj nuevo + selector de ramo, calendario/calificaciones afinados, ping de estudio, fondo y animación unidos, móvil.
- Decidir si el "plan de hoy" vuelve al Inicio (hoy solo en Organización).
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
Chat: Inicio (refugio). Lee CLAUDE.md, la skill nexo-inicio y docs/inicio-reloj/SPEC.md.
Paso 1 hecho (24 oct, falta mi aprobación visual). Implementa el paso 2 (reloj nuevo + selector de ramo + tamaño en Ajustes) y avísame antes de seguir.
```
