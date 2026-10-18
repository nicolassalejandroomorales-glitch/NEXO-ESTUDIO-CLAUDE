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

- Bocetos aprobados del otro lado del portal: Cámara de Orgánica II, Sala de entrenamiento y Sala de Laboratorio (ver SPEC, 18 oct). Cerrado: cristal por ramo, premio según evidencia real, una grieta por error.

## Falta
- Aprobar el grimorio-formulario del pedestal y bocetar las grietas en la Cámara.
- Verificar que `build_camara.py`, `build_sala.py` y `build_lab.py` estén en `tools/aprender-pasillo/` (no aparecían).
- Llevar el pasillo a la app con cuadros pre-renderizados (Sonnet 5.5 · alto) y probar en 1440 y 390.
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
Dónde quedamos: bocetos aprobados del pasillo, Cámara de Orgánica II, Sala de entrenamiento y Sala de Laboratorio. Cerrado: cristal por ramo, premio según evidencia real, una grieta por error (se sella acertando sin ayuda y días después).
Siguiente paso: verificar que build_camara.py, build_sala.py y build_lab.py estén en tools/aprender-pasillo/; conversar y aprobar el grimorio-formulario del pedestal y bocetar las grietas.
Después, en otro chat con Sonnet 5.5 · alto: llevar el pasillo a la app (cuadros pre-renderizados, 1440 y 390).
Usa Opus para diseño. Al terminar, usa nexo-cierre.
```
