# Aprender (Sótano de los Cristales)
- modelo: Opus 5.5 para dirección de arte y motor; Sonnet 5.5 · medio para portar y extender (v1 hecha así)
- estado: pasillo, las 4 puertas con sus Cámaras, Sala de entrenamiento y Sala de Laboratorio aprobados en bocetos (17 oct); falta llevar todo a la app
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
- Las 4 puertas listas (17 oct): Química Analítica, Fisicoquímica II y Fisiopatología con su animación de entrada (`build_sotano.py puerta-<ramo>`) y su Cámara (`build_camara.py gif <ramo>`), cada una con su color y 3 alcobas de la PEP 1 con murales propios (equilibrio/electrolitos/pila; errores/ácido-base/polipróticos; nervioso/respiratorio/digestivo).
- Dónde va el resto de Aprender (17 oct): formulario = grimorio en el pedestal del sauce; ejercicios, guías y pruebas antiguas = sala de entrenamiento al fondo del pasillo; errores = grietas brillantes en su alcoba; laboratorio = sala propia del pasillo.
- Sala de entrenamiento diseñada y boceto aprobado (17 oct, `tools/aprender-pasillo/build_sala.py`): arena circular con yunque de ejercicios (tanda de hoy mezclada), atril de guías, archivo de pruebas antiguas con reloj de arena (simulacro o práctica) y un cristal en bruto al centro que crece con aciertos sin ayuda (hilos de luz).
- Sala de Laboratorio diseñada y boceto aprobado (17 oct, `tools/aprender-pasillo/build_lab.py`): nave larga por fases con pizarra de cálculos, vitrina de seguridad GHS, banco de montaje con reflujo bajo campana de cobre, bitácora del informe y estante con un matraz por lab (3 fases). El lab de la Torre queda como lugar del mundo.

- Cerrado (18 oct): cristal de la Sala por ramo, premio según evidencia real, una grieta por error (se sella acertando sin ayuda y días después).

- **Sótano v1 en la app (18 oct)**: `#/learn` es el pasillo en primera persona con tiras de cuadros (`dist/aprender/`, SPEC "Implementación v1"). Paradas y tramos con reproducción hacia atrás, 4 puertas con portal, pasillo lateral, Cámara de Orgánica II con anillo de alcobas y vista de mesa.
  Estado real encima del cuadro: frascos (misiones respondidas), cristales (conceptos por repasar), cuenta regresiva (calendario). Tocar un frasco abre la clase en esa misión. Las otras 3 puertas muestran las clases reales del ramo. Exportador: `tools/aprender-pasillo/export_app.py`; pruebas: `tools/aprender-test.cjs`.

## Falta
- Cámaras de Analítica, Fisicoquímica II y Fisiopatología en la app (`RAMOS` de `build_camara.py` ya las renderiza; falta `ALC` en `export_app.py`, alcobas en `estado.js` y sus clases).
- Sauce central con el estado real (hoy sale neutro): render por capas.
- Grietas de error en la Cámara y grimorio-formulario del pedestal (por aprobar).
- Sala de entrenamiento y Sala de Laboratorio dentro del flujo (hoy solo hay bocetos).
- Mapas de evaluación (`learn/course/<ramo>/evaluation/...`) todavía en el grimorio viejo: pasarlos a la Cámara y limpiar `grimoireShell`.
- Pulir: cristales que aún parecen pegados, legibilidad de murales vistos de lado, sonido por portal.

## Ideas
- Murales que muestran el tema que te toca repasar hoy.
- Sonido distinto al abrir cada portal según el ramo.
- El cristal de la Sala de entrenamiento se opaca si pasan días sin practicar (FSRS).

## Prompt de inicio
```
Chat: Aprender (Sótano de los Cristales). Lee CLAUDE.md y docs/aprender-pasillo/SPEC.md.
Dime en una línea qué entendiste y hazme máximo 3 preguntas de selección múltiple sobre qué hay al otro lado del portal (el aula del ramo). No dibujes hasta que diga "hazlo".
Al terminar, usa nexo-cierre y actualiza docs/chats/aprender.md.
```

## Prompt de continuación
```
Chat: Aprender — Sótano v2. Lee CLAUDE.md, docs/aprender-pasillo/SPEC.md (sección "Implementación v1") y docs/chats/aprender.md.
Dónde quedamos: el Sótano v1 funciona en la app con la Cámara de Orgánica II y el estado real encima (dist/aprender/, tools/aprender-pasillo/export_app.py, tools/aprender-test.cjs). Las otras 3 puertas muestran sus clases en una tarjeta.
Siguiente paso (dime en una línea qué entendiste y haz máximo 3 preguntas de selección múltiple): llevar a la app la Cámara de otro ramo (Fisicoquímica II o Química Analítica) o la Sala de entrenamiento.
Trabaja en un worktree limpio desde origin/master. Sonnet 5.5 · medio. No toques Supabase. Al terminar, usa nexo-cierre.
```
