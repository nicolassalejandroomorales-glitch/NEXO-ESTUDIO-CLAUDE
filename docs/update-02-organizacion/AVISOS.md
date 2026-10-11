# Avisos: bandeja + alerta de cambio de fecha

Estado: **diseño en curso**. No hay código. Cada decisión la aprueba Niquito.

## Qué

Nexo detecta avisos académicos (fechas nuevas, cambios de fecha, tareas) y los propone como tarjetas. Niquito confirma; Nexo nunca cambia el calendario solo.

## Decisiones tomadas

1. **Lectura con reglas simples** en la app (palabras clave + fechas). Sin IA.
2. **Aviso ambiguo** (ej. "se aplaza una semana"): Nexo **pregunta con una sugerencia** ("el control era 27 oct, ¿pasa al 3 nov?").
3. **Resumen en Inicio**: bloque "Avisos" **dentro del panel existente**, junto a "Próximas evaluaciones". Sin arte nuevo ni objeto nuevo en la escena.
   - Máximo 3 filas: primero cambios de fecha, luego lo que vence pronto, luego lo informativo.
   - Sin avisos: "Sin avisos pendientes", sin ocupar espacio.
   - **"Revisar" y "Ver más" llevan directo al área de Organización, pestaña Avisos** (sin ventanita).
4. **Detección de cambio**: mismo ramo + mismo tipo + fecha distinta = CAMBIO; nada parecido = NUEVO; misma fecha = se ignora; duda = pregunta.
5. Al aplicar un cambio queda un **historial** de la fecha anterior (se puede deshacer) y un aviso corto en Inicio.

## Entrada de datos (por decidir)

- **Plan A (automático):** "Conectar con Google" una vez, Nexo lee la API de Classroom (cursos, tareas con fecha límite, anuncios, materiales), solo lectura. **Requiere OAuth + proyecto en Google Cloud: pendiente de autorización explícita de Niquito** (el CLAUDE.md lo prohíbe sin permiso). Riesgos: la USACH puede bloquear apps externas; el permiso de prueba vence cada 7 días; los adjuntos de Drive no se leen en la v1 (solo aviso + enlace).
- **Plan B (manual):** pegar el texto del aviso en Organización → Avisos.
- Primer paso propuesto si se autoriza: prueba mínima de factibilidad (conectar y ver si la USACH deja pasar), sin guardar nada.

## Pendiente de diseñar

- Reglas de reconocimiento con ejemplos reales de avisos de Niquito.
- Pantalla Organización → Avisos (tarjetas nuevo/cambio, confirmación).
- Cómo se guarda el historial de cambios.
- Criterios de aceptación y pruebas.

---

# Prueba de factibilidad: ¿deja la USACH conectar Classroom?

Estado: **diseño para aprobación**. Nada se crea en Google ni se programa hasta que Niquito diga "apruebo".

Autorización OAuth: Niquito la dio de forma explícita el 3 oct 2026 ("daleeeeeee"), solo para esta prueba de factibilidad.

## Objetivo

Responder una pregunta con sí o no: **¿puede Niquito conectar su cuenta `@usach.cl` a una app externa y leer sus cursos de Classroom?** Si no, el Plan A muere temprano y seguimos con el Plan B (pegar avisos).

## Límites de la prueba (lo que NO hace)

- No toca Nexo: ni `dist/app.js`, ni el calendario, ni el estado guardado.
- No guarda nada: el permiso (token) vive solo en la memoria de la pestaña y se pierde al cerrarla.
- No lee correo, ni Drive, ni notas. No escribe nada en Classroom.
- No usa servidor, Supabase ni pagos. Sin tarjeta, sin facturación.

## Permisos que se pedirían (todos de solo lectura, clasificados como "sensibles", sin auditoría de pago)

| Fase | Permiso | Para qué |
|---|---|---|
| 1 | `classroom.courses.readonly` | Listar los nombres de tus cursos |
| 2 | `classroom.announcements.readonly` | Contar/leer anuncios |
| 2 | `classroom.coursework.me.readonly` | Tareas y fechas límite |
| 2 | `classroom.courseworkmaterials.readonly` | Materiales publicados (solo título y enlace) |

Nunca se piden permisos de Gmail ni de Drive (son "restringidos" y exigen auditoría de pago).

## Pasos

**Fase 0 · Google Cloud (lo haces tú, yo te guío en simple, paso a paso)**
1. Crear un proyecto nuevo (sin activar facturación ni prueba gratuita).
2. Activar la API de Google Classroom.
3. Pantalla de consentimiento: tipo "Externo", modo "En pruebas", y agregarte a ti como usuario de prueba.
4. Crear un "ID de cliente de OAuth" tipo web, con origen `http://127.0.0.1:8766`. El ID de cliente es público (no es secreto); no se usa ni se guarda ninguna clave secreta.

**Fase 1 · página de prueba suelta** (`tools/classroom-test/`, fuera de `dist/`)
- Un botón "Conectar con Google" y una lista con los nombres de tus cursos. Nada más.
- Se corre con `node tools/classroom-test/server.cjs` y se abre en `http://127.0.0.1:8766` (mini servidor propio: `static-server.cjs` solo sirve `dist/`, y no queremos meter la prueba ahí).

**Fase 2 · solo si la Fase 1 funciona**
- Pedir los otros tres permisos y mostrar **solo conteos y títulos** (por ejemplo "5 anuncios, 2 tareas con fecha"), para ver que los datos llegan completos.

## Resultados posibles y qué hacemos

| Resultado | Qué significa | Qué hacemos |
|---|---|---|
| Lista tus cursos | La USACH deja pasar | Pasamos a la Fase 2 y luego a diseñar la integración real |
| "Acceso bloqueado / admin_policy_enforced" | El administrador de la USACH bloquea apps externas | Plan A descartado por ahora; seguimos con Plan B (pegar avisos) |
| Error de configuración (origen, API no activada) | Falla nuestra, no de la USACH | Corregimos y repetimos |

## Criterios de aceptación

- La página de prueba muestra tus cursos reales de Classroom, o un mensaje claro del motivo si no puede.
- Al cerrar la pestaña no queda nada guardado (se verifica en Application → Storage).
- Los archivos de la prueba no contienen claves secretas. Solo el ID de cliente público.
- `dist/` queda intacto.

## Pendiente

- Aprobación de Niquito de este diseño.
- ID de cliente: va en `tools/classroom-test/config.js` (una línea, público).
- Estado: **Fase 1 escrita** (aprobada el 3 oct 2026). Falta la Fase 0 en Google Cloud para poder probarla.
