# Clases Vivas en el Sótano de Cristales

## Qué
Las clases pertenecen a la cámara de su asignatura. No se crea un Aula independiente ni un escenario 3D. Se entrega primero Modo Estudio, amplio y legible, reutilizando los contenidos, actividades y corrección actuales.

## Decisiones
- Base descargada de NEXO-ESTUDIO-CLAUDE/master: 5503511. Se recuperan como prerrequisito los commits locales 88937b5 y ea7b30d del motor (guardado recuperable y evidencia verificada), todavía ausentes en GitHub al comenzar.
- Un solo contenido y un solo historial por ID de clase. `player.js`, `evidence.js` y Motor Académico siguen siendo la autoridad; la presentación no calcula dominio.
- `classes/vivas.js` ofrece controlador sin DOM y presentación Estudio montable en un contenedor. No consulta rutas ni imágenes de cámaras. El router solo adapta navegación y ciclo de vida.
- Accesos compatibles: `#/lesson/<clase>` y `#/learn/course/<asignatura>/lesson/<clase>`; misión opcional al final. La cámara existente usa la misma apertura.
- Modo Inmersivo: contrato previsto, sin implementación ni selector que prometa funcionalidad inexistente. No se descarta el Sótano actual.
- Costo: sin dependencias nuevas, IA, claves ni servicios obligatorios. Persistencia local con los contratos existentes; sin cambios cloud.

## Cómo
Extraer de `playLesson` la selección de misión, envío de resultados, conciliación y tiempos activos. Reutilizar `aula.js` y `estacion.js` como vistas de contenido dentro de Modo Estudio. Destruir sus recursos al navegar. Mantener borradores y punto de lectura al salir/recargar.

## Criterios de aceptación
1. Acceso directo y desde cámara comparten sesión, respuestas, ayudas y evidencia; no duplican intentos al recargar.
2. Dos asignaturas usan el mismo controlador sin depender de imágenes o del Sótano.
3. Contenido legible y controles accesibles en 1440 y 390 px, sin desborde horizontal.
4. Respuesta → corrección → guardado → cierre → recarga → Motor Académico, incluyendo recuperación si el motor no carga.
5. No acreditar dominio por leer, tiempo o autoevaluación. Sin borrar módulos funcionales.

## Hecho / verificación
Implementado: controlador reutilizable `NexoLivingClasses.create({cls, api, mission})`, presentación `mount(host, {..., mode: 'study', onExit})` y estados explícitos de presentación (`study: implemented`, `immersive: planned`). El controlador no consulta DOM; la vista Estudio reutiliza los componentes académicos existentes.

- Enlaces directos antiguos y jerárquicos preservados, con misión opcional. La cámara existente abre los mismos enlaces; conserva su historial.
- Se desmontan vistas, animaciones y escuchadores al navegar. Los borradores de texto/números y el punto de lectura del reproductor amplio se guardan; cerrar o recargar vacía el guardado pendiente.
- Se recuperaron los dos commits locales previos del motor sobre la base de GitHub, sin editar su copia de origen.
- Pruebas rápidas: 46/46 OK; cinco exclusiones preexistentes del ejecutor. Controlador nuevo: cuatro pruebas; sin DOM y con motor real en Orgánica y Analítica.
- Navegador aislado, sin servicios HTTPS: ciclo académico completo OK en 1440 y 390 px (corrección, motor no disponible/recuperación, Demuestra, autorúbrica sin dominio, fuentes, variantes e idempotencia).
- Prueba nueva de navegador: acceso jerárquico con misión, recarga del punto de lectura, borrador escrito, ida/vuelta desde cámara con el mismo historial, ruta inválida y navegación durante carga: OK en ambos tamaños. Sin errores JavaScript; sin desborde horizontal en el contenedor de estudio.

## Límites comprobados
- Se verificaron tamaños de pantalla mediante navegador automatizado, no un teléfono físico ni una auditoría integral de accesibilidad.
- El Sótano existente exige horizontal en celular. Estudio funciona en vertical; la prueba rota solo al usar la cámara previa. No se rediseñó esa escena.
- La primera entrega no restauraba la fase interna ni la respuesta pendiente de la estación Basicidad. Ese límite queda resuelto por la segunda entrega documentada abajo; la revisión de aprendizaje y química por el usuario sigue pendiente.
- Se conserva el contenido existente y sus etiquetas de borrador. Estas pruebas verifican software, no la química ni la cobertura de todas las asignaturas.
- Sin cambios ni comprobación de nube, sincronización remota o migraciones. Sin publicación del Artifact de Claude.

## Futuro
Presentación Inmersiva dentro de la cámara del ramo: mural de constelaciones, atril, mesa de prácticas y materiales. Consumirá los mismos IDs y controlador; el escenario no será dueño de la evidencia. No se implementan aún 3D, nuevos contenidos ni validación académica de los borradores existentes.

## Segunda entrega: continuidad de Basicidad
Autorizada el 20 oct 2026. Completar el piloto antes de ampliar el escenario.

### Decisiones e implementación prevista
- Guardar en `classSessions[clase].stationProgress[misión:full|final]`: fase, pretest, pregunta actual de Clase, respuestas y orden de alternativas, variante de Práctica y prueba final, borradores y corrección mostrada. Sin nuevo almacén, nube o dependencias.
- Mantener la variante generada completa con su ID, fuente y diapositiva. Reabrir no sortea otro ejercicio ni permite modificar una respuesta ya corregida.
- Reloj con vencimiento absoluto persistido: sigue corriendo al salir. Una prueba sin reloj conserva su borrador sin límite. Comprobar el vencimiento también al enviar, no solo en un intervalo de pantalla.
- Guardar el resultado antes de enviarlo al contrato de evidencia. Al reabrir, reenviar el mismo resultado con el mismo ID/fecha; la conciliación existente evita duplicados. Una nueva variante exige una acción explícita.
- Reutilizar el mismo contrato en estaciones finales de otras misiones. No alterar química, diseño, reglas del Motor Académico ni el contenido existente.

### Aceptación
1. Cerrar, recargar y volver conserva cada fase y la pregunta de Clase, con feedback ya mostrado.
2. Práctica conserva variante y selección parcial; Demuestra conserva variante, borrador y reloj. Sin repetir intentos por restaurar la corrección.
3. Cerrar con reloj y volver antes/después del vencimiento conserva el plazo o registra un único fallo por tiempo. Sin reloj no caduca.
4. Resultados y pendientes sobreviven a indisponibilidad temporal del motor. Conservar otros ramos, notas, eventos y registros previos.
5. Pruebas de contrato y recorrido de navegador en 1440/390 px, incluidos selección parcial, corrección, recarga y nueva variante explícita. Sin red externa obligatoria.

### Estado
Implementado. La misma sesión conserva las cuatro fases, la pregunta de Clase, respuestas y correcciones vistas, orden de alternativas, variantes con fuente/diapositiva, selección parcial y borradores numéricos. Reloj absoluto, nueva variante explícita y resultado durable antes de entregar al Motor Académico. Pruebas finales iniciadas de otras misiones se reabren directamente cuando están pendientes.

Verificación ejecutada:
- `station-progress-test.cjs`: 4/4 contratos de persistencia, plazo, resultado estable, nueva variante y separación por misión/modo.
- `station-progress-e2e.cjs`: Basicidad completa en 1440/390 px: pretest, pregunta actual y corrección, práctica parcial/completa, salida/reentrada, reloj vigente/vencido, resultado sin duplicados, prueba sin reloj, nueva variante y motor no disponible/recuperado. Compatibilidad de borrador numérico y alternativas con datos de prueba separados. Prueba final pendiente de otra misión reabierta desde su enlace.
- Regresión `academic-loop-e2e.cjs`: OK en 1440/390 px, incluyendo evidencia, fuentes, autorúbricas e historial.
- 47/47 pruebas rápidas OK; las mismas cinco exclusiones preexistentes. Capturas revisadas en ambos tamaños.

Límites: no es una prueba en teléfono físico, auditoría de toda la química ni una prueba de sincronización cloud. Se conserva el diseño y contenido. Faltan la sesión de estudio real del usuario y el Modo Inmersivo. El usuario autorizó incorporar la entrega a master de NEXO-ESTUDIO-CLAUDE el 20 oct 2026. La publicación del Artifact sigue pendiente.

## Ajuste al espacio real de pantalla
Feedback del usuario: la clase se siente demasiado grande. El navegador lateral real mide 250 × 268 px; el encabezado ocupaba 159 px y la burbuja otros 100 px. Las pruebas anteriores comprobaban anchos 390/1440 y continuidad, pero no este espacio reducido.

Decisiones: reducir encabezado, márgenes y escala tipográfica; mantener lectura y controles utilizables. Encabezado fijo y una sola región de desplazamiento para el contenido. Compañero desplegable en ventanas muy pequeñas/bajas, sin eliminar sus mensajes. Tarjetas de moléculas ajustadas al ancho, sin escalar toda la página ni tocar contenido, respuestas, reloj o evidencia.

Criterios: probar 250×268, 390×720, 1024×600 y 1440×900; sin desborde horizontal; salida accesible al desplazar; encabezado compacto ≤70 px en el panel pequeño; desplegar compañero conserva el mensaje. Mantener el recorrido de Basicidad y su persistencia.

Implementado y verificado: encabezado de 58 px frente a los 159 px observados inicialmente, dejando 210 de los 268 px para el contenido. Salida fija, compañero desplegable en ventanas pequeñas/bajas, tipografía y tarjetas adaptadas, una región de scroll. El mensaje sigue accesible al desplegar al compañero.

`study-layout-e2e.cjs` pasó en 250×268, 390×720, 1024×600 y 1440×900; incluye título largo de Analítica y salida accesible al desplazar. `station-progress-e2e.cjs` pasó de nuevo en 1440/390 px con continuidad, reloj y entrega idempotente. Los ocho contratos de Clases Vivas/estaciones también pasan. Verificado visualmente en el navegador real de 250×268 sin responder ni cambiar la pregunta actual del usuario.

Límite físico: en 250×268 sigue siendo necesario desplazar contenido largo; el ajuste prioriza lectura y controles utilizables sobre encoger toda la página. No se modificaron contenido académico, respuestas, progreso, reloj ni evidencia.

## Integración en GitHub Claude
El usuario solicitó integrar la entrega en Git el 20 oct 2026. Destino: `master` de NEXO-ESTUDIO-CLAUDE. Incluye el módulo de Clases Vivas, continuidad de Basicidad, ajuste responsive del commit `6e50b5b` y los dos prerrequisitos del motor. La rama principal remota estaba en `5503511`, era antecesora directa de la entrega y no tenía cambios divergentes. Integración prevista por avance directo, sin reescribir historial. Se conservan las validaciones ya ejecutadas; este cierre solo actualiza documentación. La revisión académica del contenido y la publicación del Artifact siguen pendientes.
