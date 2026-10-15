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

- **Hosting**: Cloudflare Pages con *Direct Upload* de una carpeta `beta/` ya preparada. Repo principal sigue privado. GitHub Pages es el plan B (exige repo público en el plan gratis, así que iría en un repo aparte solo con la beta).
  Verificado en la documentación oficial (15 oct): acepta repos privados, 20.000 archivos y 25 MB por archivo (la app tiene 388 archivos y el mayor pesa 15 MB). Sin confirmar: tope de tráfico y si pide tarjeta.
- **Ensayo de publicación** antes de tener la beta lista, con una dirección que no se comparte con nadie, para descubrir problemas con tiempo.
- **Feedback**: botón dentro de la app que lleve a un formulario simple.

## Pasos

1. Preparar la carpeta `beta/` con un script (`tools/build-beta.cjs`) que excluya el material de profesores, `dev/` y lo que no corresponda. Probarla en 1440 y 390.
2. Ensayo de publicación en Cloudflare (Niquito crea la cuenta; Claude prepara la carpeta y las instrucciones).
3. Dejar lista para extraños: tutorial, una clase por ramo, Organización (revisar Calendario y Notas), todo bien en celular.
4. Botón de feedback y aviso de "esto es una prueba y tu progreso queda solo en este navegador".
5. Compartir con un grupo chico primero y después con el curso.

## Avance (15 oct 2026)

- **Paso 1 hecho**: `node tools/build-beta.cjs` genera `beta/` (296 archivos, 51,6 MB, el mayor 14 MB; carpeta ignorada por git). Excluye diapositivas, pautas, PDFs de pruebas, `dev/` y librerías de nube; deja la lista "Pruebas antiguas" vacía; **apaga la nube** (`config.js` sin Supabase) y el script revisa que no quede material de profes ni la dirección/clave del proyecto.
- Probada en 1440 y 390: tutorial de cuenta nueva, Inicio, clase de Aminas y "Pruebas antiguas" cargan sin romperse y sin desbordar el ancho. No se publicó nada.

## Hallazgos de la prueba (15 oct 2026)

- **Arreglado**: error `hydrateAvatars is not defined` (era un resto de las mascotas viejas; afectaba también a la app normal).
- **Arreglado en la beta**: sin pestaña ni botón de "Pruebas antiguas", sin botón "Diapositivas", sin el objeto "Pizarra" y sin los recuadros de diapositivas. Lo activa `config.js` de la beta (`beta: true` y clase `nexo-beta`); la app normal sigue igual.
- **Ojo, decisión tuya**: el **texto** de las diapositivas (títulos y viñetas de la clase de Aminas, crédito al Dr. Echeverría) sigue dentro de `dist/classes/org-01.js`. Ya no se ve en la beta, pero el archivo viaja y se podría leer. Si quieres que no viaje, hay que quitarlo o reescribirlo con palabras propias.
- El Inicio muestra **tus fechas reales** (PEP 1 21 oct, semana crítica 19–27 oct): revisar si valen para compañeros de otra sección.
- El recorrido guiado de la clase ("Bienvenido a la torre") quizá nombre la pizarra: revisar sus pasos en la beta.

## Falta decidir

- Si los profesores permiten usar su material (solo lo sabe Niquito); define si algún día vuelve.
- Qué ramos incluir en la primera tanda (hay clases de Orgánica II, Analítica, Fisiopatología y FQ II).
- Si Cloudflare pide tarjeta al crear la cuenta; si la pide, ver GitHub Pages.
- Qué pasa con los 2 tests que fallan en un worktree limpio (`academic-test`, `database-test`) y las 4 que se saltan: revisarlas antes de la beta.
