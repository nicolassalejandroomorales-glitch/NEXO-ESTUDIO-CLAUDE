# Salas nuevas del Sótano (Aula, Taller, Arena) y pasillo en HD

Chat de diseño (24-25 oct 2026, Opus). Estado: **diseño cerrado salvo el rediseño de puertas**; bocetos del Aula y del Taller aprobados ("me encantan todos", 25 oct). Aún no hay código en la app.

## Qué
Aprender (`#/learn`) sigue siendo el Sótano de los Cristales: pasillo de piedra en primera persona con una puerta por ramo.
Detrás de cada puerta ya no está la Cámara circular: hay un **Vestíbulo del ramo** que lleva a **tres salas grandes**:

| Sala | Para qué | Estilo (aprobado) |
|---|---|---|
| **Aula** | Clases guiadas | Atril de piedra en primera persona + muro de cristal donde el Grimorio proyecta la idea animada |
| **Taller** | Materiales con ejercicios (guías, pruebas antiguas, prelab) | Mesa del alquimista: el ejercicio se resuelve manipulando (pinza, átomos, pozos, frascos) |
| **Arena** | Juegos | Por definir (chat de juegos) |

Reemplazan del todo a la **Cámara del ramo**, la **Sala de entrenamiento** y la **Sala de Laboratorio** (decisión de Niquito, 24 oct).

## Decisiones de Niquito
- 25 oct: **se elimina el sauce** del Vestíbulo. El Vestíbulo sirve de base para **más salas** (ejercitación y otras): sus arcos libres quedan para salas nuevas.
- 24 oct: las 3 salas reemplazan Cámara, Entrenamiento y Laboratorio; grandes y entretenidas.
- 24 oct: **Atril de Codex rechazado** (`atril-propuesta.html`, rama `codex/experiencia-academica-atril`): "muy plano", no inmersivo. La lectura pasa **dentro del mundo**, sobre un objeto de la escena, nunca en un panel encima.
- 24 oct: estilos elegidos: 1 Atril en primera persona, 3 Proyección del Grimorio, 4 Mesa del alquimista.
- 25 oct: bocetos aprobados; quiere **"una combinación de todo"** para el mapa (por ramo + comunes + en fila: ver Mapa).
- 25 oct: **las puertas se quedan**, pero se rediseñan. El **pasillo debe verse en HD**.

## Mapa de salas
```
                      PASILLO (HD, primera persona, por casillas)
  entrada ── [Orgánica II] ── [Analítica] ── [Fisicoquímica II] ─┬─ [Fisiopatología] ── TANDA DE HOY (común)
                  │                                              └─ pasillo lateral: semestres futuros (candado)
                  ▼ puerta rediseñada + portal
          VESTÍBULO DEL RAMO  (sin sauce: pedestal con "PEP 1 · N días", cristales de repaso; 6 arcos)
             ├── arco 1 → AULA     (atril + muro de cristal)      ← brilla primero si hay clase nueva
             ├── arco 2 → TALLER   (mesa del alquimista)          ← brilla después del Aula
             └── arco 3 → ARENA    (juegos del ramo)              ← brilla al final
```
- **Por ramo**: cada puerta lleva a su Vestíbulo y sus 3 salas, con el color y el contenido de ese ramo (lo que destrabó el diseño del 17 oct).
- **En fila**: dentro del ramo hay un orden sugerido (Aula → Taller → Arena). Nada se bloquea; el arco que toca brilla más, como la alcoba "de hoy" de antes.
- **Común**: al fondo del pasillo, la **Tanda de hoy** mezcla ejercicios de todos los ramos según errores y cercanía de cada PEP (intercalar rinde más que hacer bloques: Rohrer y Taylor, 2007). Es un Taller compartido; no es una sala nueva con otro estilo.
- Lo que tenían las salas viejas se reparte así: errores → grietas en el Vestíbulo; formulario → grimorio sobre el pedestal del sauce; guías, pruebas antiguas (simulacro y práctica) y prelab → Taller; montaje de laboratorio → Taller (estación de montaje sobre la mesa).

## Cómo se pasa de una sala a otra
- **Pasillo → ramo**: desde cualquier parada vecina a una puerta, **Entrar a <ramo>** gira y entra en un solo movimiento. Ya no hace falta girar al frente primero.
- **Vestíbulo → sala**: tres arcos grandes; tocar uno = caminar y cruzar (sin pantalla de carga si la sala ya está precargada).
- **Sala → Vestíbulo**: botón **Salir** (te das vuelta y vuelves al Vestíbulo, nunca retrocedes de espaldas: regla del 18 oct).
- **Dentro del Aula**: mirar arriba = muro (proyección); mirar abajo = tomo (leer y responder). Un gesto o botón **Leer / Ver** cambia entre las dos vistas con la inclinación de cámara del boceto (`aula.gif`).
- **Dentro del Taller**: la mesa se ve en ángulo; tocar un objeto lo toma con la pinza; soltarlo en un pozo responde. Cada acierto sin ayuda llena un frasco de misión del estante.

## Qué ve y hace el usuario en cada lugar
- **Pasillo**: las 4 puertas rediseñadas con letrero, murales del ramo y portal; música del Sótano. Hace: caminar, girar, entrar.
- **Vestíbulo**: pedestal central con la cuenta regresiva de la PEP grabada, grietas de error que puede tocar para reintentar y los 3 arcos. Hace: elegir sala, reintentar un error y abrir el formulario.
- **Aula**: el Grimorio proyecta en el muro la idea animada (p. ej. el H⁺ vuela al par libre). En el tomo lee el capítulo y responde preguntas intercaladas; el feedback aparece en la misma página. La mascota acompaña en lectura y se oculta en pruebas. El Grimorio explica; la mascota no enseña ni evalúa.
- **Taller**: lee el enunciado en una ficha sobre la mesa y lo resuelve con objetos. Si falla, la escena muestra el porqué (la anilina rechaza el H⁺) y el Grimorio lo dice en una frase. Hay estaciones para guía, simulacro con reloj de arena y prelab.
- **Arena**: juegos del ramo; se diseña en el chat de juegos.

## Formato técnico (medido, no a ojo)
Medido el 25 oct en este equipo con el motor actual (`build_sotano.py`) y la carpeta `dist/aprender/`:

| | 320×200 (hoy) | 960×600 (HD ×3) |
|---|---:|---:|
| Peso de un cuadro del pasillo (WebP q80) | 12,9 KB | 41,2 KB |
| Tiempo de render por cuadro | 2,1 s | 22,6 s |
| Cuadros del pasillo | 2 634 | 2 634 |
| Peso del pasillo | 33,7 MB | **≈ 108 MB** |
| Render de todo el pasillo | ≈ 1,5 h | **≈ 16,5 h** |

- Hoy `dist/aprender/img` pesa 69 MB (el límite del SPEC anterior era 20 MB). En 1440 cada píxel del dibujo se estira a 4,5×4,5 y por eso se ve en baja resolución.
- Subir la resolución pre-renderizada no sirve: triplica el peso y, además, los murales y letreros siguen siendo texturas chicas (64×124 texeles), así que la geometría se ve nítida pero el arte no.
- Las vistas de puerta solo se conectan desde las paradas mirando al frente (`h1`–`h4` → `d-*` en `manifest.json`). Con cuadros pre-renderizados, cada camino nuevo es otra tira de cuadros.
- **Decisión: pasillo y salas en vivo** (WebGL liviano: geometría simple con texturas pixel art dibujadas por nuestros scripts, render a la resolución real de la pantalla y `nearest` en las texturas). Así el arte queda nítido en cualquier pantalla, cualquier puerta se alcanza desde cualquier parada, el peso baja (texturas en vez de miles de cuadros) y el estado real se dibuja en la escena, no encima.
- **Condición para confirmarlo** (paso 2): un prototipo del pasillo en vivo debe cumplir en el celular de Niquito y en el PC: p95 por cuadro ≤ 20 ms (≈ 50 fps), primera carga del pasillo ≤ 5 MB y de cada sala ≤ 3 MB, y texto legible en 390 y 1440. Si el celular no cumple, plan B: híbrido con render a 640×400 solo en las paradas y movimiento en vivo a menor resolución.
- El texto que se estudia (tomo, ficha del Taller) es **texto nítido** en perspectiva sobre el objeto (como en los bocetos), no texto en pixel art: tiene que leerse en 390.

## Qué se hace con el Atril de Codex
- **Lo visual se descarta**: el Aula (atril de piedra + muro) lo reemplaza.
- **Lo que no es visual se rescata** de la rama `codex/experiencia-academica-atril`, sin su pantalla: cronómetro global único (marcas de tiempo, pausa sin remontar la ruta), separación Grimorio (explica, da pistas) / mascota (acompaña, oculta en pruebas) y los arreglos de rendimiento del Sótano actual. Se trae en un cambio aparte, con sus pruebas (`experience-e2e.cjs`, `sotano-navigation-e2e.cjs`).

## Criterios de aceptación
1. Desde cualquier parada vecina a una puerta se entra con un solo toque, sin girar a mano.
2. Pasillo y salas se ven nítidos en 1440 y en 390 (ningún píxel de arte más grande que su escala entera elegida, sin borde suavizado).
3. Medición en el celular de Niquito y en PC: p95 ≤ 20 ms por cuadro; pasillo ≤ 5 MB al entrar; cada sala ≤ 3 MB; sin errores JS.
4. Cada ramo tiene Vestíbulo + Aula + Taller + Arena con su color; el arco sugerido brilla y ninguno está bloqueado.
5. Aula: proyección y tomo en la misma sala; pasar de una vista a otra dura ≤ 1 s; las respuestas usan el motor y la evidencia actuales (sin cambiar correctores, IDs ni historial).
6. Taller: al menos un ejercicio de Aminas resuelto manipulando objetos, con corrección real y explicación del error en la escena.
7. La Tanda de hoy mezcla ramos según errores y fechas reales del calendario.
8. Nada de paneles flotantes sobre un fondo oscuro: toda lectura y práctica ocurre sobre un objeto del mundo.
9. Se borran la Cámara, la Sala de entrenamiento, la Sala de Laboratorio y los cuadros viejos que queden sin uso (`dist/aprender/img`, partes de `export_app.py`) en el mismo cambio que los reemplaza.

## Orden de implementación (pasos chicos; cada uno se aprueba antes del siguiente)
0. **Rescatar lo no visual del Atril de Codex** (cronómetro global, Grimorio/mascota, rendimiento). Sonnet · medio.
1. **Rediseño de puertas**: bocetos de 3 direcciones lado a lado → Niquito elige. Opus · alto solo para elegir; dibujo en Sonnet.
2. **Prototipo del pasillo en vivo** (un tramo con una puerta, sin estado): medir con los criterios 2 y 3 en el celular y en PC. Decide en vivo o plan B. Opus · alto.
3. **Pasillo completo en vivo** con las 4 puertas nuevas, entrada directa desde cualquier parada y música; reemplaza los cuadros del pasillo. Sonnet · alto.
4. **Vestíbulo de Orgánica II** sin sauce, con el estado real (repasos, cuenta regresiva, grietas) y los arcos. Sonnet · alto.
5. **Aula de Orgánica II** (Aminas · basicidad): atril, muro con una proyección animada y tomo con el contenido real de `org-01`. Sonnet · alto; la estructura de la clase, con Opus.
6. **Taller de Orgánica II**: ficha y mesa con un tipo de ejercicio manipulable (llevar el H⁺) conectado al motor. Sonnet · alto.
7. **Borrar** la Cámara y las salas viejas de Orgánica II y medir el peso.
8. Repetir 4-7 para Analítica, Fisicoquímica II y Fisiopatología.
9. **Tanda de hoy** al fondo del pasillo.
10. **Arena**: la diseña y la hace el chat de juegos.

## Bocetos y medición
- `python tools/salas-sotano/vestibulo.py cuadros` → `vestibulo-cuadros.png` (Vestíbulo sin sauce con los arcos Aula / Taller / Arena).
- `python tools/salas-sotano/aula.py [cuadros]` → `aula-muro.png`, `aula-tomo.png`, `aula.gif` (~40 s; el GIF no se sube).
- `python tools/salas-sotano/mesa.py [cuadros]` → `mesa.png`, `mesa-rebote.png`, `mesa.gif` (~30 s).
- Ajuste 25 oct: el tomo se ve de pie y en ángulo (se ven la sala y el muro detrás), atril de piedra con canto y pie, sin filetes verdes; molécula del muro corregida.

## Pendiente
- **Rediseño de puertas**: dirección por elegir (paso 1).
- Confirmar con Niquito la lectura de "combinación de todo" (Mapa).
- Los sprites del Grimorio y la mascota de los bocetos se leen de una carpeta temporal (`NEXO_SPRITES`): pasarlos a un script del repo antes de implementar.
- Arena: estilo y juegos (chat de juegos).
- `docs/aprender-pasillo/SPEC.md` queda como historia del pasillo; al implementar el paso 3 se actualiza su sección de formato.
