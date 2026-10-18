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
node tools/run-tests.cjs            # todas las pruebas rápidas (las encuentra solas; equivale a `npm test`)
node tools/limpieza.cjs             # LIMPIEZA: revisa restos sin usar (solo lee)
```

- En el PowerShell de Niquito `npm` está bloqueado (política de scripts de Windows): darle siempre el comando con `node tools/...` o `npm.cmd`.

- **Un clic**: doble clic en `Abrir Nexo.bat` (carpeta del proyecto) prende el servidor y abre `#/home`; se apaga cerrando la ventana "Servidor de Nexo".
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
| `dist/classes/` | Clases: datos (`org-01.js`…) y `player.js` = solo lógica (`NexoClassroom`). La pantalla vieja "torre del alquimista" se borró el 18 oct 2026; la nueva vive en la Cámara del ramo. Antes de tocarlas: skill **`nexo-clase`**. |
| `dist/academic/*` | Motor académico: conceptos, evidencia, estados de conocimiento y FSRS. Piloto: **org-01 / Aminas**. Skill **`nexo-motor`**. |
| `dist/mascot/pixelmascotas.js`, `dist/mascot/` | Mascotas en pixel art. Skill **`nexo-mascota`**. Cualquier arte en pixel: skill **`nexo-pixel-art`**. |
| `dist/aprender/`, `tools/aprender-pasillo/` | Aprender (`#/learn`) = Sótano de los Cristales: cuadros pre-renderizados + estado real encima. Se regeneran con `python tools/aprender-pasillo/export_app.py`. Ver `docs/aprender-pasillo/SPEC.md`. |
| `dist/game/` | Cargador de juegos (Phaser a demanda). El juego anterior ("Camino a la PEP 1") se borró el 18 oct 2026; el nuevo vive dentro de Aprender. Skill **`nexo-juegos`**. |
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

### Ahorro de tokens (11 oct 2026: 24 h gastaron ~80 % con contexto >150k y 89 % en Opus)

- **Avisar el tamaño de la sesión**: si la conversación ya es larga (muchas capturas, muchos archivos leídos), decirle a Niquito en una línea "conviene compactar o abrir chat nuevo" y ofrecer `nexo-cierre`. No esperar a que él lo note.
- **Capturas y verificación**: verificar con texto (`read_page`, consola, pruebas) y sacar **una sola captura al final**, no una por ajuste. Usar `scale` bajo (0.5) salvo que haga falta detalle.
- **Pixel art en lotes**: hacer varios ajustes, generar el PNG y mirarlo **una vez**; no ciclos de "dibujar → mirar → corregir un píxel".
- **Archivos grandes**: nunca leer `dist/app.js`, `startup-bundle.js` ni SPEC de más de ~10 KB enteros; buscar con `Grep` o `nexo-explorador` y leer solo el tramo con `offset`/`limit`.
- **Subagentes**: solo `nexo-explorador` y `nexo-tester` (Haiku). No lanzar agentes `general-purpose`/`Explore`/`Plan` si basta un `Grep` o una lectura corta.
- Si Niquito está en Opus y la tarea es de Sonnet (refugio, mascota, perfil, grimorio, arreglos), decírselo al inicio.

## Forma de trabajo (SDD liviano)

00. **"Diseñar" = conversar** (11 oct 2026): cuando Niquito diga "diseñemos/sigamos diseñando", solo hablar: ideas, opciones y preguntas, **sin generar imágenes, GIF, pixel art ni código**.
    Esas cosas se hacen solo cuando él diga "hazlo / dibújalo / implementa". Cuesta tokens y suele no ser lo que quiere.
0. Si la instrucción es ambigua: máximo 3 preguntas cortas con opciones antes de programar. En cosas grandes, maqueta primero.
1. Antes de programar, una página en `docs/<cambio>/SPEC.md`: **qué**, **decisiones**, **cómo**, **criterios de aceptación** y **pendiente**.
2. Implementar en pasos chicos. Probar en desktop (1440) y en móvil (390), y correr las pruebas rápidas.
3. **Esperar la aprobación** de Niquito (con ANTES/AHORA si el cambio visual es grande).
4. **Orden y limpieza** (Niquito, 15 oct 2026: "sin basura, sin parches por encima"): se edita el original (nada de `-v2`, parches encima ni código viejo "por si acaso"; Git guarda el historial),
   lo que un cambio deja sin uso se borra en ese mismo cambio (ante la duda, preguntar), sin código comentado ni `console.log` ni relleno, y se reutiliza lo que ya existe.
   **Si Niquito escribe "LIMPIEZA"**: correr `node tools/limpieza.cjs` (solo lee, no gasta tokens), resumirle en simple qué marcó y proponer qué borrar; nunca borrar sin su OK.

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
5b. **Un modelo por chat y prompt de continuación** (14 oct 2026): cada tema tiene su archivo en `docs/chats/<tema>.md` (modelo, hecho, falta, ideas y prompts). Al empezar lee el de tu tema; **nunca termines un chat sin dejar escrito el prompt de continuación** y regenerar el tablero (`node tools/build-hoja.cjs` → `docs/hoja-de-ruta.html`; un hook en `.claude/settings.json` lo regenera solo al editar `docs/chats/*.md`).
    **Al cerrar, publicar `docs/hoja-de-ruta.html` en su Artifact** (https://claude.ai/artifact/6ypbhYa3i6YAFiTgHNMWEn, mismo archivo = misma URL). Fase de un tema: línea `- fase: terminado|desarrollo|por-hacer` en su `docs/chats/<tema>.md` (si falta, se calcula). Cuándo abrir un chat nuevo: `docs/chats/README.md`; avísalo tú sin esperar a que Niquito lo note.
6. **Este archivo se mantiene vivo**: cuando se tome una decisión que deba valer siempre (una regla, un límite, una preferencia
   de Niquito, un error que no debe repetirse), **Claude la agrega aquí por iniciativa propia** (o en la skill del tema si solo vale para ese tema), corta, y se la cuenta a Niquito en una línea.
   Una regla escrita aquí es **absoluta**. Si dos reglas chocan, se detiene y le pregunta a Niquito. No se borran reglas sin su permiso.
7. Mantenerlo corto: lo que crezca se mueve a `docs/` o a una skill y aquí queda un puntero.

## Git y sincronización (lo hace Claude, no Niquito)

- Todo chat parte desde `master` actualizado (git fetch + pull, contar en una línea qué llegó) y trae lo último de `master` antes de cerrar.
- Cuando apruebe un cambio: commit claro en español, PR a `master` y merge, y aviso en una línea (permiso fijo, 11 oct 2026). Si ya se trabaja en `master`, basta commit + push.
- **Dos repos (Niquito, 18 oct 2026)**: `claude` = https://github.com/nicolassalejandroomorales-glitch/NEXO-ESTUDIO-CLAUDE (privado, todo lo que hace Claude se sube aquí, aunque no esté aprobado) y `origin` = NEXO-ESTUDIO (el normal, el que verán todos: **solo lo que Niquito apruebe**).
  Mientras trabajas: commit + `git push claude <rama>:master`. Cuando él apruebe un cambio: además `git push origin <rama>:master` (esto reemplaza al "commit + push" de arriba: sin aprobación no se toca `origin`).
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
- Toda pantalla nueva o rehecha va en **pixel art y con la ambientación de la torre** (hora y clima reales, alquimista excéntrico + naturaleza que invade, sin runas nuevas). Nada de pantallas "de formulario" sueltas (Niquito, 11 oct 2026).

## Estado

Historial completo en **`docs/ESTADO.md`**. Lo más importante pendiente: **una clase completa que se sienta increíble**
(Orgánica II → PEP 1 → Aminas → Basicidad), con corrección real y actividades variadas.

## Dónde se ve la app (14 oct 2026)

- Niquito **no usa Netlify** (se paga). La app se ve en un **Artifact privado de Claude**: https://claude.ai/artifact/KGcGV5EDNqJMgtQCmMAYbh
- Para actualizarlo: publicar **desde un worktree limpio de `origin/master`** (nunca la carpeta de trabajo: queda desactualizada), correr `node tools/build-startup.cjs`, copiar `dist/` (sin `vendor/ketcher`, `dev`, `supabase`, `posthog`, `.riv`, `pdfjs`) y publicar con la herramienta Artifact a esa misma URL, en 2 tandas (máx. 255 archivos por publicación). `index.html` se publica como fragmento `nexo.html` sin `<head>`/`<body>`.
- El Artifact admite **máx. 511 archivos** por versión (hoy ~490) y publicar con `url` es incremental: subir solo lo que cambió desde la última publicación (`git diff --name-status <commit anterior> HEAD -- dist`) y mandar `null` por lo borrado. Si otra sesión publicó antes, leer su `app.js` y `startup-bundle.js` y montar sobre master. Antes de agregar muchos archivos chicos, juntarlos (los reposos del Sótano comparten hojas por eso).
- Al cerrar un chat con cambios aprobados, republicar el Artifact para que Niquito vea todo unido.
