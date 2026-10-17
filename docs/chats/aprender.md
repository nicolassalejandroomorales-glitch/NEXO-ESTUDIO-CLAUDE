# Aprender (Sótano de los Cristales)
- modelo: Opus 5.5 para dirección de arte y motor; Sonnet 5.5 · alto para portar a la app
- estado: dirección de arte aprobada en animaciones de prueba; falta el aula tras el portal y llevarlo a la app
- fase: desarrollo
- prioridad: 1
- spec: docs/aprender-pasillo/SPEC.md

## Hecho
- Diseño cerrado: pasillo de piedra en primera persona (tipo Vampire Crawlers), una puerta por ramo, futuras en un pasillo lateral con candado.
- Motor de perspectiva real (`tools/aprender-pasillo/build_sotano.py`): avanzar, girar en un cruce, mirar arriba y entrar por una puerta.
- Puertas con identidad por ramo: letrero de piedra grabada, murales animados (resonancia/aminas, SN2, titulación, bureta, energía, equilibrio, neurona, ECG), portal en remolino.
- Estilo B "piedra mágica" elegido entre 3 versiones; sin runas genéricas ni guías de piso.

## Falta
- Diseñar qué hay al otro lado del portal (aula del ramo con sus temas y evidencia real).
- Decidir cómo va a la app (cuadros pre-renderizados vs canvas/WebGL en tiempo real) y probar en 1440 y 390.
- Pulir cristales (aún parecen pegados) y legibilidad de murales vistos de lado.

## Ideas
- Murales que muestran el tema que te toca repasar hoy.
- Sonido distinto al abrir cada portal según el ramo.

## Prompt de inicio
```
Chat: Aprender (Sótano de los Cristales). Lee CLAUDE.md y docs/aprender-pasillo/SPEC.md.
Dime en una línea qué entendiste y hazme máximo 3 preguntas de selección múltiple sobre qué hay al otro lado del portal (el aula del ramo). No dibujes hasta que diga "hazlo".
Al terminar, usa nexo-cierre y actualiza docs/chats/aprender.md.
```

## Prompt de continuación
```
Chat: Aprender (Sótano de los Cristales). Lee CLAUDE.md, docs/aprender-pasillo/SPEC.md y docs/chats/aprender.md.
Dónde quedamos: aprobé el pasillo en primera persona con puertas por ramo (letrero de piedra grabada, murales animados, portal en remolino). Motor en tools/aprender-pasillo/build_sotano.py y murales.py; los GIF se regeneran con `python tools/aprender-pasillo/build_sotano.py puerta|giro|pasos`.
Siguiente paso: diseñar conmigo qué hay al otro lado del portal (el aula de Orgánica II con sus temas), conversando primero con preguntas de selección múltiple.
Decisión pendiente: cómo se lleva a la app (cuadros pre-renderizados o tiempo real).
Usa Opus para el diseño; avísame cuando convenga pasar a Sonnet para implementar. Al terminar, usa nexo-cierre.
```
