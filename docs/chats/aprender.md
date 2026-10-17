# Aprender (Sótano de los Cristales)
- modelo: Opus 5.5 para dirección de arte y motor; Sonnet 5.5 · alto para portar a la app
- estado: pasillo aprobado y Cámara del ramo diseñada (17 oct); falta el boceto animado de la Cámara y llevar todo a la app
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

## Falta
- Boceto animado de la Cámara de Orgánica II (llegada, giro entre 3 alcobas, sauce, cristales encendidos/apagados).
- Definir los murales de cada alcoba (Aminas, Aromáticos, Heterociclos) contra el material del ramo.
- Llevar el pasillo a la app con cuadros pre-renderizados y probar en 1440 y 390.
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
Dónde quedamos: pasillo aprobado y la Cámara del ramo ya diseñada (sección "Al otro lado del portal" del SPEC): cripta circular, alcoba por tema con mural y estante de frascos, sauce de cristal al centro (dominio), cristales que se apagan (repasos), todo abierto con cuenta regresiva de la PEP. Formato: híbrido.
Siguiente paso: hacer el boceto animado de la Cámara de Orgánica II con el motor de tools/aprender-pasillo/ (llegada desde el remolino y giro entre Aminas, Aromáticos y Heterociclos). Antes, proponme en selección múltiple qué muestra el mural de cada alcoba. Si no convence, 3 versiones lado a lado.
Usa Opus para el boceto; el port del pasillo a la app va en otro chat con Sonnet · alto. Al terminar, usa nexo-cierre.
```
