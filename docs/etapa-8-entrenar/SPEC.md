# Etapa 8 · Entrenar: ejercicios infinitos de 5 niveles, laboratorio libre, bestiario y hoja de la noche anterior

Parte del plan de `docs/clase-viva/DISENO.md` (§8 "Entrenar"). Pedido de Niquito (5 oct): "si las respuestas no son infinitas, haz más;
que sean siempre progresivas (fácil, media, intermedia, avanzada, nivel PEP), en toda la app, y que tú pongas la dificultad según en qué
etapa te encuentres". La voz del grimorio queda para después (pedido explícito).

## Qué

1. **Generadores** (`dist/classes/org-01-gen.js`): 15 generadores que arman preguntas nuevas desde tablas y reglas
   (pKa de 20 aminas, ebulliciones, masas, reactivos, nombres). **Los 22 conceptos de Aminas** tienen ejercicios infinitos, cada uno en
   **5 niveles**: 1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP (imita las preguntas 3, 4 y 6).
   Cada pregunta trae pista, explicación, diapositiva, error típico en los distractores y su porqué.
2. **Dificultad automática**: cada concepto parte en tu nivel (según lo que ya demostraste sin ayuda en las misiones o el simulacro) y
   después sigue una **escalera 2 arriba / 1 abajo**: 2 aciertos seguidos sin pista suben un nivel; un error baja uno; con pista no sube.
3. **En toda la app**:
   - Camino **Entrenar**: rondas de 8 preguntas. "Lo que más necesito" (mezcla los temas empezados, primero los de nivel más bajo),
     por misión o por tema. Al final: aciertos, niveles que subieron o bajaron y hojas.
   - **Ronda del alba**: cuando ya acertaste todas las preguntas fijas de un concepto, trae una generada a tu nivel. Nunca se agota.
   - **Simulacro PEP**: desde el 2° intento, las alternativas y los ordenar se cambian por **casos nuevos nivel PEP** del mismo concepto
     (las escritas, flechas y dibujos se quedan). Valen lo mismo y cuentan en el Camino al 7.
   - **"Practicar más (infinito)"** al terminar una misión.
4. **Laboratorio libre** (grimorio): eliges sustancia, agregas reactivos (22 en el estante) y el sabio dice qué pasa y por qué, o por qué no
   reacciona. 27 reacciones por descubrir (benceno → anilina → diazonio → Sandmeyer, Gabriel, azida, aminación reductiva, Hofmann, sales).
5. **Bestiario de errores** (grimorio): cada error típico en que caíste es una criatura propia (bicho redondo con orejas, color por familia).
   Suelta → rastreando → **capturada** cuando aciertas su tema sin ayuda en **3 días distintos** después de la última caída. Si vuelves a caer, se escapa.
6. **Hoja de la noche anterior** (grimorio): fórmulas, recetas, reglas, **tus 3 trampas** (del bestiario), lo que más te conviene repasar
   y consejos para dormir. Botón para imprimir o guardar en PDF (2 páginas).

## Decisiones (con evidencia)

- **Escalera 2 arriba / 1 abajo** (Levitt, 1971): converge cerca del 71 % de aciertos. Practicar con éxito alto pero no total es donde más se
  aprende ("dificultades deseables", Bjork, 1994; el "85 %" de Wilson y cols., 2019, es para entrenar máquinas, por eso usamos la escalera clásica).
- **Práctica intercalada** (Rohrer y Taylor, 2007) en "Lo que más necesito": temas revueltos cuestan más pero se recuerdan mejor.
- **Espaciado** (Cepeda y cols., 2006) para capturar criaturas: 3 días distintos, no 3 veces seguidas.
- **Recuperación antes de dormir y sueño** (Roediger y Karpicke, 2006; Diekelmann y Born, 2010) en la hoja de la noche anterior.
- **Sin guardar preguntas**: un generado se guarda como `gen:<generador>:<nivel>:<semilla>[:<concepto>]`; la misma semilla siempre arma
  la misma pregunta, así se puede corregir y revisar después sin servidor.
- Las respuestas salen **calculadas de las tablas** (no escritas a mano), y una prueba revisa que el orden de basicidad siga el pKa.
- Sin tabla (niveles 3–5 de basicidad) solo se piden contrastes razonables: a lo más una alquilamina y sin morfolina ni imidazol.
- Valores de tabla aproximados (pKaH en agua, 25 °C; ebulliciones en °C): diapositivas de cátedra y McMurry (LibreTexts, cap. 24).

## Cómo

- `dist/classes/org-01-gen.js` → `window.NexoClassGen['org-01'] = { LEVELS, source, generators, lab, creatures }`. Se carga opcional
  desde `loadClassroom` (`./classes/<id>-gen.js`): una clase sin generadores funciona igual.
- `dist/classes/player.js`: `genItem`, `findBase` reconoce `gen:`; `startLevel`, `trainLevels`, `levelOf`, `genFor`, `newRun`,
  `trainAdvance`; camino `entrenar` (beats `trainpick`, preguntas `train`, `trainsum`); ronda y simulacro con generados (`sim.from`,
  `s.genFrom`); pestañas `lab`, `beasts`, `night`; `bestiary(cls, records)`.
- `tools/classroom-test.cjs`: 4 400 ejercicios generados revisados (una correcta, sin repetidas, porqué en cada distractor, concepto pedido,
  diapositiva existente, misma semilla = misma pregunta), escalera, Entrenar, ronda, simulacro, bestiario y laboratorio.

## Criterios de aceptación

- Los 22 conceptos con 5 niveles; pruebas en verde.
- Entrenar sube de nivel al acertar y baja al fallar; muestra el nivel en cada pregunta.
- La ronda y el simulacro nunca se agotan; el simulacro con casos nuevos se puede sacar el 7.
- 1440 y 390 sin errores; ANTES/AHORA.

## Pendiente

- Voz del grimorio (después, a pedido).
- Generadores con dibujo (construir moléculas y flechas) y escritas generadas.
- Más variedad en algunos niveles conceptuales (Hofmann y SN2/E2 tienen 3 a 5 preguntas por nivel).
- Revisión humana (capa 3): que Niquito o un compañero marque como revisadas las preguntas generadas.
