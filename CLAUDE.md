# Nexo — instrucciones para Claude

Este archivo es la "memoria del proyecto". Cualquier sesión de Claude (Claude Code o Cowork) debe leerlo antes de trabajar.
Lo que solo sirve para un tema vive en skills (`.claude/skills/`) y en `docs/`: se cargan solo cuando hacen falta.

## Quién y para qué

- Autor: **Niquito**, estudiante de 2º año de Química y Farmacia en la USACH (este semestre cursa, entre otros, Fisicoquímica y Orgánica II). Está **aprendiendo a programar sobre la marcha**.
  Hay que explicarle cada cambio en simple: qué es, por qué y qué comando ejecuta él.
- Idioma: **español** (chileno, cercano). Respuestas directas, no muy largas.
- Le gustan las **imágenes ANTES/AHORA**: solo en cambios visuales grandes o si las pide (11 oct 2026).
- Le gustan las afirmaciones respaldadas por estudios o evidencia concreta.

**Nexo** es una app de estudio con 3 objetivos (en este orden):
1. **Aprender de verdad**: nada de falsa sensación de dominio. Hay que pedir evidencia: acertar sin ayuda, transferir y recordar después.
2. **Prepararse de verdad para las evaluaciones**: la ruta sigue el material del semestre actual y se adapta al tiempo, al conocimiento previo y a los errores.
3. **Que sea entretenido y con poca fricción**: el "refugio" (Inicio), la mascota y el grimorio.

## Cómo correr la app

```powershell
cd $HOME\Desktop\NEXO_APP_ACTUAL
node tools/static-server.cjs        # luego abrir http://127.0.0.1:8765/#/home  (Ctrl+C para apagar)
node tools/build-startup.cjs        # OBLIGATORIO después de editar módulos de dist/ que van en el bundle
npm test                            # todas las pruebas rápidas (tools/run-tests.cjs las encuentra solas)
```

- No hay framework ni paso de compilación: **el código fuente vive directo en `dist/`**.
- `dist/startup-bundle.js` es **generado**: nunca editarlo a mano. Edita los módulos y regenera.
- Los `?v=` de `dist/index.html` y `dist/app.js` se ponen solos (hash del archivo) al correr `build-startup.cjs`: no editarlos a mano.
- Prueba nueva = archivo `tools/<algo>-test.cjs`; entra sola a `npm test`. No editar la lista en `package.json`.

## Mapa del código (lo importante)

| Archivo | Qué es |
|---|---|
| `dist/app.js` | Router (`routeTo`, `renderRoute`) y la mayoría de las pantallas. Grande (184 KB): **nunca leerlo entero**; para ubicar algo usa el agente `nexo-explorador`. |
| `dist/design-system/home-scene.js`, `update01.css`, `dist/ambient/time.js` | Inicio y luz. Antes de tocarlos: skill **`nexo-inicio`**. |
| `dist/platform/animation.js`, `dist/platform/audio.js` | Grimorio: intro, cambio de página, sonidos. Skill **`nexo-grimorio`**. |
| `dist/classes/` | Aula "torre del alquimista" y clases. Antes de tocarlas: skill **`nexo-clase`**. |
| `dist/academic/*` | Motor académico: conceptos, evidencia, estados de conocimiento y FSRS. Piloto: **org-01 / Aminas**. Skill **`nexo-motor`**. |
| `dist/mascot/pixelmascotas.js`, `dist/mascot/` | Mascotas en pixel art. Skill **`nexo-mascota`**. Cualquier arte en pixel: skill **`nexo-pixel-art`**. |
| `dist/games/` | Juegos (campaña "Camino a la PEP 1"). Antes de tocarlos: skill **`nexo-juegos`**. |
| `dist/planner/` | Organización: calendario, notas, prioridades, labs (UPDATE 02). Skill **`nexo-organizacion`**. |
| Perfil (`renderProfile` en `app.js`), `dist/academic/ranks.js` | Mascota, notas, inasistencias, estadísticas, ajustes, rangos. Skill **`nexo-perfil`**. |
| `dist/data.js`, `semester-2026.js`, `organic-*.js` | Catálogo de ramos, fechas y contenido. |
| `tools/` | Pruebas `*.cjs` y scripts de arte reproducibles (Python) por tema. |
| `docs/` | Una carpeta por cambio con su `SPEC.md`. `docs/ESTADO.md` = historial de lo hecho. `docs/contexto/` = visión original. |

## Modelo y esfuerzo (cuidar los créditos)

- Claude **no puede cambiar su propio modelo/esfuerzo**: Niquito lo cambia (`/model` o el selector de la app). Claude **recomienda**.
- Al inicio de cada tarea, una línea: **Recomendado: <modelo> · esfuerzo <nivel>. Por qué: <razón>.** Y avisa durante la tarea si conviene subir o bajar.
- Por defecto: **Sonnet 5.5 · esfuerzo medio** (~80-90 % del trabajo: refugio, grimorio, pantallas, arreglos).
- **Opus** solo para: diseñar el motor académico (FSRS, estados, corrección real), diseñar la estructura de una clase, un bug que falló 2 veces, decisiones de arquitectura.
- Regla: primero subir el esfuerzo, después el modelo. Planear con Opus (`SPEC.md`) y ejecutar con Sonnet.
- Una sesión = un cambio. Delegar a Haiku: búsquedas en el código → agente `nexo-explorador`; correr pruebas → agente `nexo-tester` (solo devuelve lo que falló).
- Medir el costo por tarea terminada, no por mensaje. Revisar el gasto real cada pocas sesiones y recalibrar.

## Forma de trabajo (SDD liviano)

00. **"Diseñar" = conversar** (11 oct 2026): cuando Niquito diga "diseñemos/sigamos diseñando", solo hablar: ideas, opciones y preguntas, **sin generar imágenes, GIF, pixel art ni código**.
    Esas cosas se hacen solo cuando él diga "hazlo / dibújalo / implementa". Cuesta tokens y suele no ser lo que quiere.
0. Si la instrucción es ambigua: máximo 3 preguntas cortas con opciones antes de programar. En cosas grandes, maqueta primero.
1. Antes de programar, una página en `docs/<cambio>/SPEC.md`: **qué**, **decisiones**, **cómo**, **criterios de aceptación** y **pendiente**.
2. Implementar en pasos chicos. Probar en desktop (1440) y en móvil (390), y correr las pruebas rápidas.
3. **Esperar la aprobación** de Niquito (con ANTES/AHORA si el cambio visual es grande).

## Varios chats, una sola memoria (reglas absolutas)

Niquito trabaja Nexo en **chats separados, uno por tema** (Inicio/escena, grimorio, motor académico y clase, juegos, etc.).
Los chats **no se acuerdan entre sí**: la única memoria compartida es este archivo, `docs/` y las skills.

1. **Al empezar un chat**: lee este `CLAUDE.md` y el `SPEC.md` del tema en `docs/<cambio>/` (y `docs/ESTADO.md` solo si necesitas contexto de otro tema). Di en una línea qué entendiste y qué falta.
2. **Un chat = un tema = un `docs/<cambio>/SPEC.md`**. Si el tema no tiene SPEC, créalo antes de programar.
3. **No salirse del tema**: si ves algo de otro tema (un bug, una idea), no lo arregles aquí. Anótalo en el **Pendiente** del SPEC de ese tema
   (o en `docs/pendientes.md` si no tiene) y avísale a Niquito en una línea.
4. **Archivos compartidos** (`dist/app.js`, `update01.css`, `dist/data.js`): toca lo mínimo. Lo nuevo va en archivos propios del tema
   y se conecta con un cambio chico. Así dos chats no se pisan.
5. **Cierre de cada chat** (obligatorio, sin que Niquito lo pida): sigue la skill **`nexo-cierre`** (SPEC, `docs/ESTADO.md`, commit y push).
6. **Este archivo se mantiene vivo**: cuando se tome una decisión que deba valer siempre (una regla, un límite, una preferencia
   de Niquito, un error que no debe repetirse), **Claude la agrega aquí por iniciativa propia** (o en la skill del tema si solo vale para ese tema), corta, y se la cuenta a Niquito en una línea.
   Una regla escrita aquí es **absoluta**. Si dos reglas chocan, se detiene y le pregunta a Niquito. No se borran reglas sin su permiso.
7. Mantenerlo corto: lo que crezca se mueve a `docs/` o a una skill y aquí queda un puntero.

## Git y sincronización (lo hace Claude, no Niquito)

- Todo chat parte desde `master` actualizado (git fetch + pull, contar en una línea qué llegó) y trae lo último de `master` antes de cerrar.
- Cuando apruebe un cambio: commit claro en español, PR a `master` y merge, y aviso en una línea (permiso fijo, 11 oct 2026). Si ya se trabaja en `master`, basta commit + push.
- Nunca uses force push, nunca subas .env ni claves.
- Si `git status` muestra cambios de otro chat en módulos del bundle, regenerar `startup-bundle.js` en un worktree limpio antes del commit (11 oct 2026: casi se subió código a medias del Inicio).
- Si hay un conflicto o algo raro, detente y explícamelo en simple antes de hacer nada.

## Límites (no hacer sin permiso explícito)

- No tocar Supabase, SQL, migraciones, OAuth ni nada de cloud. No publicar en el Site.
- Excepción autorizada (3 oct 2026): **clima real con Open-Meteo** (sin clave, ubicación fija Santiago, máx. cada 30 min, sin red = despejado). Ver `docs/mascota/SPEC.md`. Ningún otro servicio externo sin permiso.
- **No generar imágenes con Canva** (ni otra IA de imágenes) sin que Niquito lo pida en ese momento (4 oct 2026). Conceptos de mascotas en `docs/mascota/conceptos/`.
- No borrar archivos del usuario. No reescribir la app desde cero.
- No copiar arte de otros artistas ni objetos o personajes de series conocidas: solo diseños propios.
- Mascotas y arte: nada de diseños "planos"; siempre volumen, material y detalle. Estilo actual: **pixel art** con las rampas de `tools/home-pixel/pixel.py`.

## Estado

Historial completo en **`docs/ESTADO.md`**. Lo más importante pendiente: **una clase completa que se sienta increíble**
(Orgánica II → PEP 1 → Aminas → Basicidad), con corrección real y actividades variadas.
