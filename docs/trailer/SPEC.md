# Tráiler épico de la beta

## Qué
Un video MP4 **vertical 9:16 (1080×1920, 30 fps, ~46 s)** con **música orquestal original** para mandar a los amigos y anunciar que
**la primera beta de Nexo llega el domingo 18 de octubre a las 18:00**. Es una pieza de cine propia, no una grabación de la app.

## Decisiones (Niquito, 17 oct 2026)
- Vertical (WhatsApp/historias), estreno domingo 18:00.
- **v1 descartada** ("le falta mejor música, las letras no convencen, la animación tampoco, no me gustó el uso de las imágenes"):
  usaba los fondos de la app (refugio, salas, grimorio) y una letra pixel delgada. **El grimorio ya no se usa en Nexo**.
- **v2**: todo el arte se crea para el tráiler. Cámara en primera persona del **Sótano de los Cristales** (motor de `tools/aprender-pasillo/`,
  tipo Vampire Crawlers, una puerta por ramo) + ilustraciones pixel nuevas (rampas de `tools/home-pixel/pixel.py`).
- Gancho: "¿Cansado de no poder aspirar al 7 en las PEP?" / "¿No te organizas bien?" → **"NEXO lo hace por ti"**.
- Mostrar: funciones de la app (repaso antes de olvidar, camino al 7, rangos, organización), **combate con cartas** inventado,
  **jefe de la PEP** y **las mascotas**.
- Letras: **piedra tallada que brilla** (letrero de piedra con letras grabadas que se encienden con el color de la escena).
- Música: **orquesta de cine** sintetizada nota por nota (cuerdas, cornos, trompetas, metales graves, coro, timbales, taikos)
  con un **tema propio** en re menor. Sin audio de terceros.

## Guion v2 (segundos)
| Tiempo | Escena | Texto |
|---|---|---|
| 0–4,2 | Escritorio de noche, vela, una PEP con un **3,8** en rojo | ¿CANSADO DE NO PODER ASPIRAR AL 7 EN LAS PEP? |
| 4,2–8 | Calendario lleno de notas que se caen, reloj loco | ¿NO TE ORGANIZAS BIEN? |
| 8–10,5 | Las notas vuelan y se ordenan solas en la semana | **NEXO** LO HACE POR TI. |
| 10,5–19 | Pasillo del sótano en primera persona; puerta de Orgánica II, portal | UNA PUERTA POR CADA RAMO |
| 19–25 | Combate con cartas contra una **Amina salvaje** | LUCHA CON LO QUE SABES |
| 25–29,5 | Funciones: curva del olvido, camino al 7, rangos | REPASA JUSTO ANTES DE OLVIDAR · TU CAMINO AL 7 · SUBE DE RANGO |
| 29,5–35 | **Gólem de la PEP 1**; las mascotas lo derriban | Y CUANDO LLEGUE LA PEP… …LA VAS A APLASTAR. |
| 35–37 | Silencio y latido | EL SÓTANO TE ESPERA. |
| 37–46 | Título y fecha | **NEXO** · APRENDE DE VERDAD. · LA PRIMERA BETA LLEGA EL DOMINGO 18 · OCT **18:00** · PREPÁRATE. |

## Cómo
- `tools/trailer/trailer.py`: línea de tiempo, composición y video (ffmpeg).
- `tools/trailer/letras.py`: letreros de piedra tallada. `tools/trailer/arte.py`: ilustraciones pixel. `tools/trailer/musica.py`: orquesta.
- `tools/trailer/pasillo.py`: cuadros del sótano en vertical (180×320 de arte), en paralelo y guardados en caché.
- `tools/trailer/mascotas.cjs`: mascotas reales de la app.
```powershell
python tools/trailer/trailer.py --preview   # hoja de cuadros clave
python tools/trailer/trailer.py             # video → docs/trailer/nexo-beta-trailer.mp4 (no se sube a git)
```

## Criterios de aceptación
- MP4 H.264 + AAC, 1080×1920, se reproduce en WhatsApp; sin saturación (pico ≤ −0,5 dBFS).
- Cortes y golpes sincronizados con la música; textos legibles en el celular.

## Pendiente
- Aprobación de Niquito (imagen y sonido).
