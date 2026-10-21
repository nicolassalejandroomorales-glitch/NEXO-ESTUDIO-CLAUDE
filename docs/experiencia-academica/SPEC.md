# Experiencia académica y Sótano · 21 octubre 2026

## Alcance y base
NEXO-ESTUDIO-CLAUDE/master `f2712bd78dcec63ccfc251ede92f3f3c2c37691e`, copia limpia. Presupuesto $0. Conservar motor, contenidos, IDs, evidencias, guardado y arte de mascotas. Sin cambios cloud, SQL ni servicios.

## Decisiones del usuario
- Atril: pergamino amplio con marco oscuro y detalles discretos, lectura casi a pantalla completa y ambiente en bordes. Capítulos desplazables con ejercicios intercalados. Propuesta representativa antes de aplicar el rediseño.
- Grimorio visible al lado e intervenciones en lectura. Mascota animada durante lectura, oculta en pruebas; nunca enseña ni evalúa.
- Cronómetro flotante inferior movible/plegable, único y global. Sigue contando en segundo plano y tras cerrar hasta pausa explícita. Restaurar por marcas temporales, sin sumar ticks ni iniciar al entrar a una clase.
- Sótano usable en vertical y horizontal. Corregir tirones, velocidad, orientación y controles antes de añadir arte/efectos.
- Uso real indicado: GitHub Pages de este repositorio.

## Diagnóstico inicial comprobado
- Batería original: 50/50; cinco exclusiones anteriores. Tutorial: 14 escenarios Edge OK; no reproducido en esta versión, conservar corrección existente.
- app.js conserva timer global pero startHomeClock mantiene su indicador únicamente en Inicio y renderRoute elimina el ticker. Pausar/reanudar vuelve a montar la ruta, lo que interrumpe lectura/ejercicios.
- aula.js asocia m.say.text al nombre de la mascota; estacion.js react() etiqueta explicaciones y feedback con la mascota. El origen es la presentación, no generación de contenido ni un prompt externo.
- Sótano: lienzos de escena ampliados hasta 1600×1000 para fuentes de 320×200; FX hasta doble densidad. Se repintan en cada RAF incluso en pantallas de alta frecuencia. Precarga de portal incompleta (falta segundo tramo y destino). El modo vertical está bloqueado por una capa.

## Implementación y aceptación
1. Indicador global reutiliza state.timer y funciones existentes; acciones sin remontar rutas, persistencia inmediata y marcas temporales. Probar navegación, pausa, recarga, cierre/restauración, segundo plano, pulsación repetida y varias pestañas.
2. Separar presentación intelectual del Grimorio y animación de mascota en aula/estación sin tocar correctores ni evidencias. Ocultar mascota en pruebas.
3. Medir mismo recorrido antes/después. Reducir superficies de dibujo y trabajo redundante; conservar arte y grafo navegable. Comprobar controles vertical/horizontal, carga fallida y abandono durante transición.
4. Entregar propuesta visual independiente; aplicar Atril completo solo con aprobación explícita.

## Pendiente
Respuestas del segundo bloque; aprobación visual del Atril; celular físico y publicación no comprobados. Los resultados de navegador local no prueban sincronización ni el despliegue de GitHub Pages.

## Hecho y verificación local
- Reloj global con estado existente: único indicador, plegado y movimiento horizontal por arrastre o teclado. Reserva una franja inferior para no cubrir lectura/controles. Visible también en fullscreen. Pausar/reanudar no remonta clases ni tutorial. Persistencia inmediata, reapertura por timestamp, coordinación de pestañas invitadas y bloqueo de pulsaciones repetidas. La política elegida sigue contando tras cerrar; el límite previo de cuatro horas al guardar se conserva a la espera de la respuesta 15.
- Grimorio real reutilizado del tutorial. Explicaciones y pistas atribuidas a él, botón voluntario de ayuda con la misma marca académica de asistencia. Mascota sin manejador de pistas, separada y oculta durante evaluaciones. No se regeneró arte ni se cambiaron correctores, contenido o evidencia.
- Sótano: dibujo nativo 320×200; FX máximo 640 px de ancho y 30 actualizaciones/s. Movimiento hasta 60 actualizaciones/s. Decodificación previa, precarga de entrada/destino, interrupción segura y limpieza de RAF al salir incluso por rutas jerárquicas. Se ignora repetición de teclas y se evita interpretar arrastres como toques. Vertical habilitado, sin forzar orientación. Se conserva el ritmo original de tramos mientras se decide la velocidad deseada.
- Propuesta independiente: `atril-propuesta.html`, controles de índice/Grimorio/selección/temporizador solo de demostración; no aplica interfaz ni registra evidencia. Captura actual incluida para comparación. Aprobación pendiente.
- 51/51 pruebas rápidas, cinco exclusiones preexistentes. Tutorial: 14 escenarios OK antes y después. Clases Vivas: rutas, borradores y retorno de cámara en 1440/390. Continuidad de estaciones: respuestas, variantes, plazo, corrección y entrega sin duplicados en ambos tamaños. Layout: 250×268, 390×720, 1024×600 y 1440×900. Prueba nueva `experience-e2e.cjs`: navegación, recarga, pausa sin desmontar, dos pestañas, reapertura, orientación, tutorial, fullscreen y propiedad de las pistas en 1440/390. Sin errores JS en esos recorridos. Propuesta comprobada en 1440/390 sin desborde.

### Medición reproducida
Tres segundos por muestra, Edge headless local, caché caliente, PC 1440×900 y ventana móvil 844×390 a escala 2. Instrumentación en `tools/sotano-perf.cjs` (informe de entrega). No es teléfono físico ni benchmark de GPU.

| Reposo durante 3 s | Antes PC | Después PC | Antes móvil simulado | Después móvil simulado |
|---|---:|---:|---:|---:|
| drawImage de escena | 592 | 150 | 752 | 151 |
| fillRect de FX | 31 992 | 8 091 | 40 269 | 7 998 |
| Píxeles por lienzo de escena | 1 600 000 | 64 000 | 256 000 | 64 000 |
| Píxeles del lienzo FX | 1 296 000 | 256 000 | 973 440 | 243 360 |

El coste de pintura bajó; los intervalos RAF de móvil no mostraron mejora porque ya eran ~7 ms en este equipo. No afirmar mejora general de FPS ni calidad artística aprobada. Cambiar de pestaña conserva tiempo transcurrido por decisión del usuario; ese tiempo no demuestra aprendizaje.
