# Salas nuevas del Sótano (Aula, Taller, Arena) · borrador

Chat de diseño (24 oct 2026). Estado: **bocetos para aprobar**; aún no hay SPEC final ni código en la app.

## Decisiones de Niquito
- Las salas nuevas **reemplazan** a la Cámara del ramo, la Sala de entrenamiento y la Sala de Laboratorio. Son tres: clases guiadas, materiales con ejercicios y juegos. Grandes y entretenidas.
- **Atril de Codex rechazado** (`atril-propuesta.html` de la rama `codex/experiencia-academica-atril`): "muy plano", no inmersivo. La lectura debe pasar **dentro del mundo**, sobre un objeto de la escena.
- Estilos elegidos: **1 Atril en primera persona**, **3 Proyección del Grimorio** (muro de cristal) y **4 Mesa del alquimista** (aprender manipulando).

## Propuesta en bocetos (por aprobar)
- **Aula** (clases guiadas) = atril + muro de cristal en la misma sala: al mirar el muro, el Grimorio proyecta la idea animada; al bajar la mirada, lees y respondes en el tomo. Boceto: `aula-muro.png`, `aula-tomo.png`, `aula.gif`.
- **Taller** (materiales con ejercicios) = Mesa del alquimista: el ejercicio se resuelve con objetos (pinza, átomos, pozos); el acierto llena un frasco de misión. Boceto: `mesa.png`, `mesa-rebote.png`, `mesa.gif`.
- **Arena** (juegos): estilo por definir.
- Mundo en pixel art a **480×270** (más detalle que los 320×200 del pasillo); el texto que se estudia, **nítido** y en perspectiva sobre el objeto.
- Correr: `python tools/salas-sotano/aula.py [cuadros]` y `python tools/salas-sotano/mesa.py [cuadros]` (los GIF no se suben: ~40 s y ~30 s).

## Medido en el código actual (24 oct)
- Cuadros del Sótano a 320×200: en 1440 cada píxel del dibujo ocupa 4,5×4,5 píxeles de pantalla.
- Las vistas de puerta (`d-*`) solo se conectan desde las paradas que miran al frente (`h1`–`h4`): por eso hay que girar para entrar.
- `dist/aprender/img` pesa 69 MB (el límite del SPEC era 20 MB).

## Pendiente (preguntas abiertas)
- ¿Atril y muro juntos? ¿Salas por ramo, comunes o en fila? ¿Qué reemplaza a las puertas?
- ¿Texto nítido sobre el mundo pixel o todo en pixel art?
- Formato técnico: prototipo en vivo de una sala, medido en el celular de Niquito (p95 ≤ 20 ms por cuadro, ≤ 3 MB por sala, lectura nítida en 390 y 1440) antes de decidir entre en vivo e híbrido.
- SPEC final: diagrama de salas, flujo, criterios de aceptación y orden de implementación.
