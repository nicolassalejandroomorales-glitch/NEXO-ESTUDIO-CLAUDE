# Aprender (Sótano de los Cristales)
- modelo: Opus 5.5 para dirección de arte y motor; Sonnet 5.5 · alto para portar a la app
- estado: pasillo y boceto de la Cámara de Orgánica II aprobados (17 oct); falta diseñar la sala de entrenamiento y el laboratorio, y llevar todo a la app
- fase: desarrollo
- prioridad: 1
- spec: docs/aprender-pasillo/SPEC.md

## Hecho
- Diseño cerrado: pasillo de piedra en primera persona (tipo Vampire Crawlers), una puerta por ramo, futuras en un pasillo lateral con candado.
- Motor de perspectiva real (`tools/aprender-pasillo/build_sotano.py`): avanzar, girar en un cruce, mirar arriba y entrar por una puerta.
- Puertas con identidad por ramo: letrero de piedra grabada, murales animados (resonancia/aminas, SN2, titulación, bureta, energía, equilibrio, neurona, ECG), portal en remolino.
- Estilo B "piedra mágica" elegido entre 3 versiones; sin runas genéricas ni guías de piso.
- Diseño de la Cámara del ramo (17 oct): cripta circular, una alcoba por tema (mural + estante de frascos = misiones), sauce de cristal al centro = dominio, cristales que se apagan = repasos, todo abierto con cuenta regresiva de la PEP, alcobas veladas para la PEP 2, clase con zoom a la mesa.
- Formato decidido: híbrido (pasillo pre-renderizado en WebP; Cámara en canvas en vivo).
- Boceto animado de la Cámara de Orgánica II aprobado (17 oct, `tools/aprender-pasillo/build_camara.py`): llegada desde el remolino, sauce de cristal con una rama por alcoba, alcobas Aminas / Aromáticos / Heterociclos con murales (basicidad, Hückel→SEA, piridina vs pirrol), frascos por misión, cristales de repaso, alcobas veladas de la PEP 2 y "PEP 1 · 10 DÍAS" en el pedestal.
- Dónde va el resto de Aprender (17 oct): formulario = grimorio en el pedestal del sauce; ejercicios, guías y pruebas antiguas = sala de entrenamiento al fondo del pasillo; errores = grietas brillantes en su alcoba; laboratorio = sala propia del pasillo.

## Falta
- Diseñar (conversando) la Sala de entrenamiento del fondo del pasillo y la sala de Laboratorio; después, bocetos.
- Sumar a la Cámara el grimorio-formulario del pedestal y las grietas de errores.
- Llevar el pasillo a la app con cuadros pre-renderizados y probar en 1440 y 390 (chat aparte, Sonnet · alto).
- Pulir: tronco del sauce en bloques, cristales que aún parecen pegados, legibilidad de murales vistos de lado.

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
Dónde quedamos: pasillo y boceto de la Cámara de Orgánica II aprobados (tools/aprender-pasillo/build_camara.py). Decidido: formulario = grimorio en el pedestal del sauce; ejercicios, guías y pruebas antiguas = Sala de entrenamiento al fondo del pasillo; errores = grietas en su alcoba; laboratorio = sala propia (ojo: la Torre tiene un laboratorio caminable sin página, ver docs/mundo-torre/SPEC.md).
Siguiente paso: diseñemos (solo conversar, sin dibujar) la Sala de entrenamiento: cómo se ve, qué estaciones tiene y cómo se usa. Máximo 3 preguntas de selección múltiple. Cuando diga "hazlo", boceto animado con el mismo motor.
Usa Opus para el boceto; el port del pasillo a la app va en otro chat con Sonnet · alto. Al terminar, usa nexo-cierre.
```
