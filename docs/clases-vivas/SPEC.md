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
- La estación especial de Basicidad conserva su funcionamiento anterior: persiste resultados/evidencia, pero su fase interna y una prueba aún sin enviar no se restauran. La restauración exacta comprobada corresponde al reproductor amplio; ampliar el contrato interno de la estación queda pendiente.
- Se conserva el contenido existente y sus etiquetas de borrador. Estas pruebas verifican software, no la química ni la cobertura de todas las asignaturas.
- Sin cambios ni comprobación de nube, sincronización remota o migraciones. Sin publicación del Artifact de Claude.

## Futuro
Presentación Inmersiva dentro de la cámara del ramo: mural de constelaciones, atril, mesa de prácticas y materiales. Consumirá los mismos IDs y controlador; el escenario no será dueño de la evidencia. No se implementan aún 3D, nuevos contenidos ni validación académica de los borradores existentes.
