# Cuentas y guardado en la nube (Supabase) — SPEC

Autorizado por Niquito el 17 oct 2026 ("supabase hagámoslo"): este tema sí puede tocar Supabase, pero **solo lo que se liste aquí** y avisando antes de cada cambio remoto.

## Qué
Que quien entre a Nexo pueda tener cuenta y conservar su progreso (mascota, notas, evidencia, repasos) al cambiar de celular o navegador, sin pagar.

## Lo que ya existe (no rehacer)
- Proyecto Supabase real `dcafrpmzpaosgmqyukjs` (sa-east-1), 13 migraciones locales en `supabase/migrations/`, RLS y RPC de sync/economía.
- Login con Google funcionando para el dueño (29 sep 2026). Código en `dist/cloud/foundation.js`, estado local en `dist/core/storage.js`.
- Modo invitado: sigue permitido, no se considera cuenta sincronizada.
- Detalle en `docs/SUPABASE_PRODUCTION_1_0.md` y `docs/ARCHITECTURE_1_0.md`.
- La versión "beta" (`tools/build-beta.cjs`) **apaga** la nube a propósito.

## Decisiones tomadas (17 oct 2026)
- Hosting: **GitHub Pages** (gratis solo con repo público → repo aparte `nexo-beta` con la carpeta `beta/`; el repo principal sigue privado).
- Login: **solo Google** por ahora.
- `node tools/build-beta.cjs --nube` arma `beta/` con cuentas (copia solo la URL y la clave publishable de `dist/config.js`; sin `--nube` sigue sin nube).
- Retorno de Google: la app usa `location.origin + location.pathname`, así que en Supabase hay que permitir `https://nicolassalejandroomorales-glitch.github.io/nexo-beta/`.

## Login funcionando (18 oct 2026)
- Probado por Niquito en GitHub Pages: Google entra y Ajustes muestra "Sincronizar ahora".
- Hubo dos tropiezos: el proyecto Supabase estaba pausado (hay que restaurarlo desde el panel) y la URL de retorno debe estar en *Redirect URLs* con las mayúsculas exactas (`/NEXO-BETA/`); si no, Supabase manda al "Site URL" viejo.
- URL pública: https://nicolassalejandroomorales-glitch.github.io/NEXO-BETA/ (repo público NEXO-BETA; se actualiza con `node tools/build-beta.cjs --nube` y push desde `beta/`, autor noreply).

## Pantalla de entrada antes del tutorial (pedido 18 oct 2026)
**Qué**: al abrir la app sin sesión, antes del tutorial, una pantalla con "Continuar con Google" y "Seguir como invitado".
**Decisiones de Niquito**: sale **solo la primera vez** (al elegir invitado no vuelve; luego se entra desde Ajustes) y **se puede seguir como invitado**.
**Cómo**:
- Hoy `home: () => tutorialDue() ? routeTo('tutorial') : renderHome()` (`app.js` ~592). Se agrega una ruta nueva `#/bienvenida` y una guarda antes de esa línea: si la nube está activa, no hay sesión y no eligió invitado → `#/bienvenida`.
- La guarda **espera a que `cloud.init` termine** (si no, parpadea la pantalla a quien ya tiene sesión).
- Volver de Google pierde el hash (`redirectTo = origin + pathname`): al volver cae en Inicio y la guarda decide. Cuenta con progreso → la nube trae `state.tutorial` y **salta el tutorial**; cuenta nueva → sigue al tutorial.
- Elegir invitado guarda una marca local (p. ej. `nexo-entrada-vista`) para no repetir la pantalla.
- Sin nube (build sin `--nube`, pruebas, `navigator.webdriver`): la pantalla no aparece.
- Visual: pixel art con la ambientación de la torre (regla de CLAUDE.md). Primera versión reutilizando arte y componentes existentes de la torre, sin dibujar nada nuevo.
**Hecho (18 oct 2026)**: `dist/cuentas/entrada.js` + `entrada.css` (reusan Grimorio, marco y fondo del tutorial), ruta `#/entrada`, guarda en `home` de `app.js` (espera `cloudListo`, máx. 4 s) y `signInWithGoogle({volver})`.
**Hallazgo**: `state.tutorial` NO viaja a la nube (la tabla solo acepta ciertos tipos de documento; agregarlo pide migración). Solución sin tocar la nube: una cuenta cuya mascota ya tiene `kind` cuenta como tutorial hecho (`normalizeState`). Limitación: si abandonó el tutorial antes de elegir mascota, lo verá de nuevo.
**Probado**: 1440 y 390 sin desbordes, invitado no repite la pantalla, sin errores de consola, 33/33 pruebas. **Falta probar con Google real** (cuenta nueva → tutorial; cuenta con mascota en otro navegador → sin tutorial).
**Criterios**: (1) sesión nueva ve la pantalla antes del tutorial; (2) "invitado" lleva al tutorial y no vuelve a salir; (3) Google con cuenta existente entra sin tutorial; (4) quien ya tiene sesión no ve parpadeo; (5) 1440 y 390 sin desbordes; (6) `node tools/run-tests.cjs` verde.

## Qué falta (decisiones)
1. **Dónde se publica** para que entre gente. El Artifact privado de Claude no sirve para el retorno de Google (OAuth necesita una URL real). Gratis: GitHub Pages o Cloudflare Pages. Elegir una.
2. **Login para el público**: solo Google (ya hecho) o también correo+contraseña (el proveedor Email sigue encendido en Supabase; ojo con "contraseñas filtradas" sin activar).
3. **Plan gratis de Supabase**: se pausa tras 7 días sin uso (límite 500 MB / 50k usuarios al mes). Aceptable para beta; si pesa, un ping semanal.
4. **Datos nuevos sin sincronizar**: lo hecho después de sep 2026 (economía, `dist/study/`, perfil-alcoba, torre) puede no estar en las tablas/RPC. Auditar qué estado vive solo en `localStorage`.

## Cómo (pasos chicos)
1. Auditar: qué claves de `localStorage` existen y cuáles sincroniza `foundation.js` (solo leer).
2. Decidir hosting y publicar versión de prueba con la nube encendida.
3. En Supabase (lo hace Niquito en el panel, o Claude con su OK explícito): agregar la URL pública a *Redirect URLs* y quitar `127.0.0.1` cuando termine la prueba.
4. Prueba real con **dos cuentas** (A y B): aislamiento, invitado→cuenta, dos dispositivos, offline y vuelta.
5. Conectar los datos nuevos que falten (migración nueva solo con OK de Niquito).
6. Aviso de privacidad corto en la app (qué se guarda: correo y progreso; ley chilena de datos personales).

## Criterios de aceptación
- Cuenta A entra desde otro navegador y ve su mismo progreso.
- Cuenta B no ve nada de A.
- Sin red la app sigue funcionando y sincroniza al volver.
- Ninguna clave secreta en el repo ni en el bundle (solo la publishable).
- `node tools/run-tests.cjs` en verde.

## Pendiente
- Decisiones 1 y 2 de arriba.
- Modelo recomendado: Opus · esfuerzo medio para auditar y migrar; Sonnet para el resto.
