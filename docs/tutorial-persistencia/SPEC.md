# Tutorial: persistencia P0 y cinemáticas independientes

## Qué y decisiones (20 octubre 2026)
- Solo la primera entrada con identidad y datos resueltos puede iniciar automáticamente el tutorial. Registrar `shown` sincrónicamente antes de montar la vista; no reanudar automáticamente tras cerrar.
- `done` y `skipped` conservan el resultado de la primera reproducción. Solo Ajustes → Repetir tutorial concede una nueva reproducción; sin mascota, recompensa ni cambios históricos.
- Conservar `state.tutorial` y cursor antiguo. Guardar el historial en `meta.experiences`, documento `meta` ya sincronizado, y en un registro durable por identidad mediante NexoStorage. Sin SQL, OAuth, dependencias ni servicios nuevos ($0).
- Migrar datos antiguos con actividad, mascota o cursor previo como ya mostrados; no inventar que se completó. Un `pending` antiguo con progreso tampoco cuenta como nuevo.
- Las cargas de caché, refrescos de cuenta y renders repetidos no conceden nuevas reproducciones. La ruta sola no constituye autorización.
- Preparar un registro de cinemáticas por ID, condición y reproductor, historial independiente, marcado antes de reproducir, salto definitivo y archivo/repetición voluntaria sin mutaciones académicas.

## Causa observada antes de editar
`tutorialDue()` consultaba `pending` en cada Inicio. Ese estado solo cambiaba en skip/finish; cerrar antes lo dejaba pendiente. El cursor real no bloqueaba la activación. La sincronización reconstruía datos desde cero sin transportar `tutorial`; aceptaba `pending` incluso con progreso. El callback finish de replay cambiaba el historial y su API permitía premio pendiente. El callback de caché podía abrir la puerta antes de la carga definitiva.

## Aceptación y comprobación
Probar usuario nuevo, complete/salte/interrumpa, recargas, reapertura del navegador, navegación, rutas directas, reproducción desde Ajustes, conservación de datos e historial, carga lenta/caché/remoto y separación de cuentas; condición y consumo único por ID para cinemáticas.

## Pendiente
Verificar OAuth y sincronización con una cuenta real entre PC/teléfono, y publicar el Artifact en una tarea autorizada. No modificar otros repositorios. Las cinemáticas narrativas quedan preparadas con contrato y pruebas; su contenido/archivo visual se añadirá cuando exista guion.

## Resultado de verificación (20 octubre 2026)
- `node tools/run-tests.cjs`: **44/44 OK**, con cinco exclusiones preexistentes del ejecutor (no se modificaron).
- `node tools/tutorial-persistence-test.cjs`: OK. Registro previo, cierre/recarga, estados terminales, progreso antiguo, objetos de fábrica, datos parciales, aislamiento de identidades, fallo de almacenamiento, roundtrip por el documento meta y cinemáticas independientes.
- `node tools/tutorial-e2e.cjs`: **14 escenarios OK**, Edge real en 1440 y 390. Nuevo, interrupción, tres recargas, pestaña, navegación Refugio/Sótano/clase/organización/perfil, repetición y salida, URL sin permiso, salto móvil antes de mascota y repetición inmediata, finalización completa, repetición completa sin cambios, migración con sesión conservada, caché/timeout, remoto tardío, callbacks duplicados/cerrar-iniciar sesión y reapertura de navegador con almacenamiento conservado. La finalización/repetición también se verificó con los avisos habilitados como en un navegador normal.
- Sin errores JavaScript en la batería final de navegador. `git diff --check` y comprobación de skills OK. Bundle regenerado desde fuentes.
- Cuenta y red: adaptador simulado usando los callbacks reales de app.js; **no** se probó OAuth real ni Supabase de producción. La prueba de cinemática usa una condición ficticia, sin añadir misiones o recompensas reales. Servicios y dependencias nuevos: $0.
- Limpieza revisada: observaciones preexistentes de arte/código fuera del P0 conservadas; no se borraron archivos del usuario. Los archivos nuevos de este cambio se incluyen en Git.

## Implementación
- `dist/core/experiences.js`: normalización y unión monótona del historial, registro durable por `guest` o `user:<id>`, espejo `meta.experiences`. No cambia la versión académica ni requiere tipos nuevos en SQL.
- `app.js`: decisión única cuando hay identidad/datos resueltos, sin adelantarla por la caché o el timeout. Guardado de la migración aunque no cambie el esquema. Permiso de ejecución en memoria para distinguir retorno del recorrido frente a URL/recarga. Las repeticiones no guardan ni entregan una API con efectos académicos.
- Se oculta la navegación fija solo durante el tutorial para que no tape Salir; Saltar está disponible desde el principio. El Sótano conserva su fullscreen habitual fuera del recorrido; durante el recorrido se evita que la capa fullscreen tape el globo y sus controles.

## Contrato para cinemáticas futuras
La API ya se instancia como `window.NexoCinematics`. Las escenas deben registrarse una vez con ID estable, una condición pura y un reproductor de presentación:

```js
NexoCinematics.register({
  id: 'historia.primer-cristal', title: 'El primer cristal',
  when: state => state.story?.firstCrystalUnlocked === true,
  render: ({ manual, finish, skip }) => abrirEscena({ manual, finish, skip })
});
// Después del acontecimiento, nunca para entregar recompensas:
NexoCinematics.trigger('historia.primer-cristal');
// El archivo visual solo muestra escenas vistas:
NexoCinematics.archive();
NexoCinematics.replay('historia.primer-cristal');
```

`trigger` verifica condición y registro, escribe `shown` antes de renderizar y bloquea duplicados; `skip` escribe `skipped`. El reproductor no recibe mutadores de misiones ni recompensas. `replay` solo permite IDs vistos y no cambia su historial. Son contratos preparados: no se inventaron acontecimientos, misiones ni vídeos de la historia actual.
