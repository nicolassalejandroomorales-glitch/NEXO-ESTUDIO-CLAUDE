# Torre (mundo recorrible)
- modelo: Sonnet 5.5 · medio (el paso 4, progreso real, va en un chat Opus aparte)
- estado: laboratorio caminable hecho, falta aprobar
- prioridad: 2
- spec: docs/mundo-torre/SPEC.md

## Hecho
- Entrenar, Juegos y Perfil con escena pixel de borde a borde donde la mascota camina; cada objeto hace una acción.
- Entrenar = Laboratorio de Orgánica II con capas, parallax, luz por hora real y 3 estados de progreso (provisorio).
- Diseño de la torre completa (pisos por ramo, escalera y ascensor).

## Falta
- Entrenar se borró (17 oct): el laboratorio de la Torre (`dist/world/torre-mundo.js`, `assets/torre/lab`) quedó sin página y su prueba está saltada. Decidir a qué ruta y con qué objetos se reengancha.
- Aprobar el laboratorio caminable y el estilo de la muestra.
- Paso 3: vestíbulo (escalera, ascensor y viaje del menú) y ruta de la torre.
- Paso 4 (Opus): progreso real por objeto, que reemplace el provisorio.
- Botón "Volver a Nexo" en la campaña PEP 1.

## Ideas
- Un piso por ramo que se va llenando con tu avance real.
- Visitar la torre de un amigo (solo si algún día hay nube).

## Prompt de inicio
```
Chat: Torre (mundo recorrible). Lee CLAUDE.md y docs/mundo-torre/SPEC.md (Fase 2 y Pendiente).
Tarea: dime en una línea qué entendiste, revisa el laboratorio caminable en 1440 y 390 y pregúntame con selección múltiple si lo apruebo o qué ajustar. Luego propón cómo hacer el vestíbulo (paso 3).
El progreso real (paso 4) lo diseñamos aparte en un chat Opus; aquí deja el provisorio. Al terminar, usa nexo-cierre y actualiza docs/chats/torre.md.
```

## Prompt de continuación
```
Chat: Torre (mundo recorrible). Lee CLAUDE.md y docs/chats/torre.md.
Parte desde "Falta" y pregúntame qué sigue.
```
