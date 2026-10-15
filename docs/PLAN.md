# Plan de Nexo: de la app privada a la beta compartida

Creado el 15 oct 2026, conversando con Niquito. Lo marcado como **Decidido** lo dijo él; lo marcado como **Propuesta** es sugerencia y puede cambiar.

## Meta

Una **versión de prueba (beta)** para que **10 a 30 compañeros del curso** la usen y den feedback, para después publicarla en la carrera.
La PEP 1 ya no es el eje: Niquito estudia con su propio chat personalizado; Nexo no tiene que servirle a él para esa fecha.

## Decidido

- La beta debe permitir: hacer el tutorial y elegir mascota, estudiar una clase de su ramo y organizar pruebas y notas. (Los juegos quedan fuera del mínimo.)
- **Sin cuentas ni nube**: cada persona guarda su progreso en su navegador. Se les avisa que si cambian de celular o borran datos, lo pierden. No se toca Supabase.
- **Material de profesores fuera de la beta**: diapositivas de `dist/assets/classes/org-01/slides/`, imágenes y PDFs de `dist/assets/exams/`. Niquito los mantiene en su versión privada.
- Tiempo disponible: 1 a 3 horas al día.
- Le interesa el código abierto y las "joyitas ocultas": tener presente GitHub como opción durante la sesión.

## Propuesta (por confirmar)

- **Hosting: POR DECIDIR por Niquito** entre GitHub Pages y Cloudflare Pages (ambas gratis y suficientes; comparación en el chat del 15 oct). Niquito pidió tener GitHub presente toda la sesión por su interés en el código abierto; Claude no debe dar una por elegida.
  - **GitHub Pages** (doc oficial): el plan gratis solo da Pages en repos **públicos**; publica desde una rama en la raíz o `/docs`, o con un workflow de GitHub Actions; el sitio es público en internet aunque el repo sea privado (si el plan lo permite). Iría en un **repo público aparte con solo la beta ya construida**; el principal sigue privado.
  - **Cloudflare Pages** (doc oficial): acepta repos privados, 20.000 archivos y 25 MB por archivo, y se puede subir una carpeta a mano (*Direct Upload*). Sin confirmar: tope de tráfico y si pide tarjeta.
  - La app tiene 296 archivos en la beta y el mayor pesa 14 MB: cabe en ambas.
- **Ensayo de publicación** antes de tener la beta lista, con una dirección que no se comparte con nadie, para descubrir problemas con tiempo.
- **Feedback**: botón dentro de la app que lleve a un formulario simple.

## Pasos

1. Preparar la carpeta `beta/` con un script (`tools/build-beta.cjs`) que excluya el material de profesores, `dev/` y lo que no corresponda. Probarla en 1440 y 390.
2. Ensayo de publicación en el hosting que elija Niquito (él crea la cuenta o el repo y sube; Claude prepara la carpeta y las instrucciones; nada se publica sin su permiso).
3. Dejar lista para extraños: tutorial, una clase por ramo, Organización (revisar Calendario y Notas), todo bien en celular.
4. Botón de feedback y aviso de "esto es una prueba y tu progreso queda solo en este navegador".
5. Compartir con un grupo chico primero y después con el curso.

## Avance (15 oct 2026)

- **Paso 1 hecho**: `node tools/build-beta.cjs` genera `beta/` (296 archivos, 51,6 MB, el mayor 14 MB; carpeta ignorada por git). Excluye diapositivas, pautas, PDFs de pruebas, `dev/` y librerías de nube; deja la lista "Pruebas antiguas" vacía; **apaga la nube** (`config.js` sin Supabase) y el script revisa que no quede material de profes ni la dirección/clave del proyecto.
- Probada en 1440 y 390: tutorial de cuenta nueva, Inicio, clase de Aminas y "Pruebas antiguas" cargan sin romperse y sin desbordar el ancho. No se publicó nada.

## Hallazgos de la prueba (15 oct 2026)

- **Arreglado**: error `hydrateAvatars is not defined` (era un resto de las mascotas viejas; afectaba también a la app normal).
- **Arreglado en la beta**: sin pestaña ni botón de "Pruebas antiguas", sin botón "Diapositivas", sin el objeto "Pizarra" y sin los recuadros de diapositivas. Lo activa `config.js` de la beta (`beta: true` y clase `nexo-beta`); la app normal sigue igual.
- **Hecho**: la beta ya no lleva el texto de las diapositivas. `build-beta.cjs` vacía `slides: {...}` en las 11 clases (12 bloques). Quedan solo las citas de fuente (por ejemplo "Dr. Javier Echeverría, USACH 2025-2S") y los números de diapositiva que cita cada ejercicio. Probado: las 11 clases cargan sin errores y la misión de Aminas corre en 1440 y 390.
- El Inicio muestra **tus fechas reales** (PEP 1 21 oct, semana crítica 19–27 oct): revisar si valen para compañeros de otra sección.
- El recorrido guiado de la clase ("Bienvenido a la torre") quizá nombre la pizarra: revisar sus pasos en la beta.

## RESUELTO (15 oct 2026): el repositorio principal ya es PRIVADO

Niquito lo puso en privado ese mismo día. Verificado sin sesión: la página, el contenido crudo y la API de GitHub responden 404; con su sesión de Git el `fetch` sigue funcionando. Lo que sigue es el historial de lo que estuvo público (abajo).

### Lo que estuvo público antes (hasta ese momento)

- Se verificó en `github.com/nicolassalejandroomorales-glitch/NEXO-ESTUDIO`: muestra la etiqueta **Public** (128 commits, 0 estrellas, 0 forks). Se había dado por privado sin comprobarlo.
- Contiene hoy: 17 archivos de pruebas, pautas y PDFs (`dist/assets/exams`), 50 diapositivas del PPT (`dist/assets/classes/org-01/slides`), el correo de Niquito en 54 commits, `dist/config.js` con la dirección y la clave pública de Supabase, y las transcripciones de chats de `docs/contexto/`.
- Hecho por Niquito: pasarlo a **privado**. La beta se publica desde un repo aparte.
- Quitar el material del **historial** (reescribirlo) es otra cosa, más delicada; solo si Niquito lo pide y entiende el riesgo.

## Flujo de Git deseado por Niquito (por diseñar)

- Todo avance sube al repo **privado**; nada se publica solo.
- Ahí se **audita** (pruebas, revisión de código, que no viaje material de profesores) y se ordena la estructura.
- Publicar la beta es un paso aparte y manual, a un repo/hosting público distinto.

## Después de la beta (crítica del 15 oct)

- Aspecto y navegación de la app: `docs/ux-app/FEEDBACK-15OCT.md`. Tutorial (animación, personalidad, modular): `docs/tutorial/FEEDBACK-15OCT.md`.
- Tensión por resolver con Niquito: quiere compartir la beta lo antes posible, pero también criticó mucho el aspecto actual. Decidir si la primera beta sale como está o tras pulir lo más visible.

## Falta decidir

- Si los profesores permiten usar su material (solo lo sabe Niquito); define si algún día vuelve.
- Qué ramos incluir en la primera tanda (hay clases de Orgánica II, Analítica, Fisiopatología y FQ II).
- Cuál hosting usar (GitHub Pages o Cloudflare Pages); si Cloudflare pide tarjeta al crear la cuenta.
- Qué pasa con los 2 tests que fallan en un worktree limpio (`academic-test`, `database-test`) y las 4 que se saltan: revisarlas antes de la beta.
