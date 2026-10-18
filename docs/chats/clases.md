# Clases (contenido y aula)
- modelo: Opus 5.5 · medio (diseño de la v2); llenar contenido después: Sonnet 5.5
- estado: en curso
- fase: desarrollo
- prioridad: 1
- spec: docs/clases-estructura/DISENO-V2.md

## Hecho
- (v1) Aula inmersiva "torre del alquimista" (`dist/classes/`), 11 clases (Aminas completo, Aromáticos, Analítica, Fisiopatología, FQ II), ejercicios infinitos con regla de calidad, guía `COMO_CREAR_UNA_CLASE.md` y `node tools/new-class.cjs`.
- **18 oct 2026 · Diseño v2 aprobado** (solo conversado): Niquito ve las 11 clases "muy desordenadas, muy feas" (orden, visual, contenido y ritmo; ninguna se salva). Nuevo formato: **estaciones mixtas** (una idea c/u, ~10 min; alternan **clase**, **mini juego** y **reto PEP**; abren con Adivina, cierran con Demuestra; preguntas todo el rato). Plantilla "pedido de clase" aprobada. Todo en `docs/clases-estructura/DISENO-V2.md`.

## Falta
- **Piloto paso 1**: maqueta de una estación de Aminas → Basicidad (Adivina → Clase → Juego → Demuestra) en **3 versiones visuales lado a lado** para que Niquito elija.
- Paso 2: llevar la estación al reproductor, abierta desde el frasco de Basicidad del Sótano (reusa tipos de actividad y `evidence.js`).
- Elegir 3–4 mecánicas de mini juego reutilizables (coordinar con `docs/chats/juegos.md`).
- Preguntas abiertas: ¿habla el sabio o la mascota?, ¿qué pasa con el progreso de las clases v1?
- Después del piloto: Aminas entera, guía v2 y rehacer las otras 10 clases (una por chat).

## Ideas
- Mini juego "atrapa el H⁺": tocar la amina más básica antes de que caiga el protón.
- Modo "simulacro" de PEP 1 con tiempo y pauta (botón "voy apurado").
- Retrosíntesis guiada paso a paso con flechas dibujadas por el usuario.

## Prompt de inicio
```
Chat: Clases v2. Lee CLAUDE.md, la skill nexo-clase y docs/clases-estructura/DISENO-V2.md.
Tarea: dime en una línea qué entendiste y sigue el "Plan de pilotaje".
```

## Prompt de continuación
```
Chat: Clases v2 (piloto Basicidad). Lee CLAUDE.md, la skill nexo-clase, docs/clases-estructura/DISENO-V2.md y docs/aprender-pasillo/SPEC.md (la clase se juega en la mesa de la alcoba del Sótano).
Quedamos en el paso 1 del plan de pilotaje: hazme 3 versiones visuales lado a lado (pixel art, ambientación del Sótano) de UNA estación de Aminas → Basicidad: Adivina (mini problema PEP) → Clase (animación + 2 frases + preguntas cortas) → Mini juego ("atrapa el H⁺" u otra propuesta) → Demuestra.
Antes de dibujar, pregúntame con opciones qué mini juego y si habla el sabio o la mascota. Usa la química verificada de dist/classes/org-01.js (misiones 4 y 5). Opus para diseñar, Sonnet para dibujar.
Al terminar, usa nexo-cierre y actualiza docs/chats/clases.md.
```
