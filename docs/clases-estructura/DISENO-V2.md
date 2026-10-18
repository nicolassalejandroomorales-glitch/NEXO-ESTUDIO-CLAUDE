# Clases v2: estaciones mixtas (diseño)

Estado: **diseño aprobado por Niquito (18 oct 2026)**. Aún no hay código. Reemplaza el formato de misiones de `SPEC.md` para las clases nuevas.

## Qué

Niquito vio el Sótano funcionando (18 oct) y dijo que las 11 clases de `dist/classes/` están "muy desordenadas, muy feas".
Marcó **todo** como problema: orden, diseño visual, contenido y ritmo. Ninguna clase se salva.
Pidió una mezcla: **"algunos de juegos, algunos de clases, y que vayan haciendo preguntas"**.

Diagnóstico: hoy una misión apila ~10 capas (diagnóstico, fundamentos, gancho, explicación, partes con pretest y receta, ejemplo,
práctica, desafío, transferencia, rescate) + barra de confianza + 3 caminos + "más simple" en cada bloque, todo en el mismo pergamino.
El motor obedece la guía; la guía pide demasiado. Por eso las clases salen feas aunque se pida "bonito".

## Decisiones (Niquito, 18 oct 2026)

1. **Formato nuevo, reusando piezas**: se cambia la estructura y el look; se reusan los tipos de actividad, el motor de evidencia
   (FSRS, escalones) y la química ya verificada de las clases actuales.
2. **Estaciones mixtas**: una clase = **3 a 5 estaciones**, cada una **una sola idea** y ~10 min. Las estaciones **alternan formato**:
   | Formato | Qué pasa | Preguntas |
   |---|---|---|
   | **Clase** | Animación en pixel art en la mesa de la alcoba + máx. 2 frases por pantalla; ejemplo resuelto que se va desarmando | 2–4 cortas, intercaladas |
   | **Juego** | Mini juego con la idea de la estación (ej. "atrapa el H⁺": tocar la amina más básica antes de que caiga el protón) | El juego *es* la pregunta: cada jugada deja evidencia |
   | **Reto PEP** | 1–2 preguntas copiadas del formato de la pauta, sin ayuda | Las únicas que cuentan para el Camino al 7 |
   Toda estación abre con **Adivina** (1 mini problema antes de explicar; no cuenta nota: efecto pretest) y cierra con **Demuestra** (1 pregunta sin ayuda).
3. **Preguntas todo el rato**: nunca más de ~1 minuto sin que el estudiante responda algo (recuperar > releer).
4. **Plantilla "pedido de clase"** aprobada (abajo). Las reglas de forma viven en este archivo, no se repiten en cada pedido.
5. **Piloto: Aminas → Basicidad**, una estación primero, con **3 versiones visuales lado a lado** para que Niquito elija (lo que destrabó el Sótano).

## Lo que se saca del flujo (y a dónde va)

| Hoy | En v2 |
|---|---|
| Diagnóstico en cada misión | **Uno por clase**, al entrar; decide en qué estación partes |
| Fundamentos "desde cero" siempre | Solo si fallas el Adivina o el diagnóstico (desvío corto) |
| Glosario, diapositiva, recetario, datos curiosos en el flujo | **Objetos de la mesa**: se tocan si quieres, no interrumpen |
| 3 caminos (Misiones / Expedición / Prueba encima) | **Una ruta** + botón "voy apurado" (salta a los Retos PEP) |
| Barra de confianza en cada pregunta | Solo en **Demuestra** y Reto PEP |
| Rescate como etapa aparte | Ahí mismo, al fallar: por qué, y un caso corto |
| "Explícame más simple" en cada bloque | Uno por estación, en el sabio/mascota |

## Reglas de forma (fijas, el motor las cumple siempre)

- **Una pantalla = una cosa.** Máx. 2 frases (~30 palabras) por pantalla de texto.
- Toda pantalla en **pixel art y con la ambientación del Sótano** (la clase se juega en la mesa de la alcoba, cripta de fondo, hora y clima reales).
  Nada de pergaminos tipo formulario.
- **Variedad**: en una estación no van 2 preguntas seguidas del mismo tipo. Nada de 5 alternativas seguidas.
- Cada distractor apunta a un error típico con su porqué (se mantiene de v1).
- **Fuente** a un toque (diapositiva de cátedra), nunca en medio.
- **Honestidad**: terminar no es dominar. Solo Demuestra y Reto PEP sin ayuda suben la evidencia a `independent`/`transferable`.

## Plantilla "pedido de clase" (lo que Niquito llena)

```
CLASE: Aminas · Orgánica II · PEP 1 (27 oct)
FUENTE: PPT Aminas (Echeverría) + pauta PEP 2025
EN LA PRUEBA TENGO QUE PODER: (copiado de la pauta)
  - P3: ordenar aminas por basicidad (1 pt)
IDEAS CLAVE (máx. 4, una frase c/u):
  - el par libre más disponible = más básica
ERRORES QUE COMETO: creo que la anilina es más básica por tener anillo
ESCENA EN LA MESA: el H⁺ se pega al par libre; en la anilina rebota
JUEGO: qué se juega (o "propónmelo")
NO QUIERO: textos largos, 5 alternativas seguidas
```
Con esto Claude arma: estaciones (una por idea clave), qué formato le toca a cada una, Adivina/Demuestra y el reto copiando la pauta.

## Por qué (evidencia)

- Carga cognitiva y segmentar: bloques cortos de una idea enseñan más que mucha información junta (Sweller, 1988; Mayer, *Multimedia Learning*, principio de segmentación).
- Pretest: intentar responder antes de la explicación mejora lo que se recuerda después, aunque se falle (Richland, Kornell y Kao, 2009).
- Recuperar > releer (Roediger y Karpicke, 2006); ejemplos que se desvanecen (Renkl y Atkinson, 2003); intercalar tipos (Rohrer y Taylor, 2007).
- Juegos: sirven cuando la mecánica *es* la idea a aprender, no un premio aparte (integración intrínseca: Habgood y Ainsworth, 2011).

## Plan de pilotaje

1. **Maqueta** de una estación de Basicidad (Adivina → Clase → Juego → Demuestra) en **3 versiones visuales** lado a lado. Niquito elige. (Opus diseña, Sonnet dibuja.)
2. **Estación piloto en la app**: un formato nuevo dentro del reproductor, abierta desde el frasco de Basicidad del Sótano. Se reusan tipos de actividad y `evidence.js`.
   Coordinar el mini juego con el chat de juegos (`nexo-juegos`: el juego nuevo vive dentro de Aprender).
3. Niquito la prueba (1440 y 390). Si "se siente increíble", se completa **Aminas** entera (≈4–5 estaciones, reusando la química verificada de `org-01.js`).
4. Recién ahí: guía nueva (`COMO_CREAR_UNA_CLASE.md` v2, plantilla `new-class.cjs`) y rehacer las otras 10 clases, una por chat.
5. Al final, borrar lo que v1 deje sin uso (regla de limpieza), con OK de Niquito.

## Criterios de aceptación del piloto

- Niquito la elige entre 3 versiones y dice que se ve bien.
- Ninguna pantalla con más de 2 frases; nunca más de ~1 min sin responder algo.
- Hay al menos un tramo de clase, uno de juego y uno de reto, y no se siente "desordenado".
- La evidencia llega al motor (Demuestra/Reto sin ayuda = `independent`/`transferable`); terminar no da dominio.

## Pendiente / preguntas abiertas

- Qué mini juegos (catálogo de 3–4 mecánicas reutilizables entre ramos) y si usan Phaser (`dist/game/`) o canvas simple.
- ¿El sabio sigue en el Sótano o habla la mascota?
- Qué pasa con el progreso guardado de las clases v1 al reemplazarlas.
