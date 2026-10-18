# Clases v2 · piloto Basicidad (Aminas → misión 4)

Estado: **paso 1 del plan de pilotaje** (18 oct 2026). Boceto en `docs/clases-v2/estacion-basicidad.html` (3 versiones lado a lado). Aún no está en la app.
Nota: `docs/clases-estructura/DISENO-V2.md` no existe; el diseño parte de la skill `nexo-clase`, `docs/aprender-pasillo/SPEC.md` y `dist/classes/org-01.js`.

## Qué
Una **estación** = 4 pasos jugados en la mesa de la alcoba del Sótano: Adivina → Clase → Práctica → Demuestra.

## Decisiones (Niquito, 18 oct)
- ~~Mini juego Atrapa el H⁺~~ **descartado (18 oct, Niquito)**: no se entiende y no prepara para la PEP. Lo reemplaza **Práctica + Demuestra con la pregunta 3 de la PEP 1** (ordenar por basicidad, 1,0 pt; pauta real en `dist/assets/exams/13_org2_pep1_2025_aminas_aromaticos.jpg`).
- Señales de que prepara (pedidas por Niquito): mismo formato que la PEP, reloj de prueba (90 s, opcional), mostrar qué punto asegurarías, y repaso en 1-3 días con otra variante.
- Voz: **la mascota** habla en toda la estación (el sabio queda de fondo).
- **Versión elegida: C, cristal-pantalla** (un cristal gigante del ramo hace de pantalla; mascota grande a la izquierda con globo).

## Química (verificada en org-01, m4 y m5)
- Lidocaína: amina terciaria + amida; solo la terciaria se protona (m4 intro).
- Ácido acético 4,76 vs ion trietilamonio 10,76 → K = 10⁶ (m4-t1).
- Frascos del juego: trietilamina 10,76 · anilina 4,6 · piridina 5,2.
- Demuestra: HA pKa 5 + amina con ion pKa 9 → equilibrio hacia la sal (m4-t2).

## Prototipo (paso 2, 18 oct)
- Página suelta (no toca `app.js`): http://127.0.0.1:8765/classes/estacion-prueba.html. Módulos: `dist/classes/estacion.js`, `estacion-art.js`, `estacion.css`.
- Mascota real (`PixelMascotas`), textos cortos con tono de personaje, animaciones fluidas (H⁺ en arco con anillo de energía, chispas, transiciones).
- **Práctica**: ordenar de menos a más básica con los pKa a la vista, con reintento (generador `basicidad` nivel 2 de `org-01-gen.js`).
- **Demuestra**: pregunta 3 estilo PEP (nivel 5, sin tabla, un intento, reloj opcional de 90 s). Llama a `onResult` con `reviewAt` (+1 día si falla, +3 si acierta) y muestra "Tu PEP 1 · Aminas" con P3 asegurado o no (usa `cls.goal.questions`).
- Verificado por script (reintento, orden correcto, pauta, resultado guardado en `localStorage['nexo-station-proto']`) y en 1440/375 sin scroll horizontal.
- **Diferencia con la PEP real**: en la prueba las 4 opciones son estructuras dibujadas; aquí son nombres. Hay que dibujar estructuras (SMILES/RDKit) para igualarla. La pauta oficial solo pide ordenar (no justificar).

## Paso 3 (18 oct): estructuras dibujadas y conectado a la app
- **Estructuras**: `org-01-gen.js` trae un SMILES por compuesto (`SMILES`) y las tarjetas del generador `basicidad` llevan `smiles`. La estación las dibuja con RDKit (`dist/vendor/rdkit`, ~7 MB, se descarga solo al llegar a Práctica y queda en caché) sobre un "papel" blanco. En **Demuestra** se ve solo el dibujo y la letra (como la PEP); en **Práctica** también el nombre y el pKaH. Sin RDKit queda el nombre.
- **En la app**: ruta `#/station/<clase>/<misión>` (`renderStation` en `app.js`); entrada = tarjeta "Estación nueva" en la pantalla de misiones del aula, que sale de `cls.stations` (org-01: `['m4']`).
- **Evidencia**: el resultado de Demuestra se guarda con `NexoClassEvidence.record` (concepto `am.orden`, escalón 5, transferencia, sin ayuda) y se agenda el repaso con `schedule` (FSRS). Probado en el navegador: queda el registro y `dueAt`.
- Otras misiones/clases: agregar `stations: ['mX']` y un generador con `smiles`; la estación hoy está atada al generador `basicidad`.

## Pantalla completa (18 oct)
- A pedido de Niquito, la estación se ve a pantalla completa (`fullscreen: true`, cubre la barra de la app): botón **← Salir** (o Esc) dentro de la pantalla, que vuelve al aula, y botones de avanzar/comprobar fijos abajo del panel (siempre visibles). Probado en 1024 y 375.

## Las 3 versiones
- **A Mesa del alquimista**: objetos sobre la mesa (pergamino, grimorio, frascos, sello). Más tangible, fiel al refugio.
- **B Losa de piedra grabada**: losa con borde verde de Orgánica II; sobria y legible, afín a los letreros del pasillo.
- **C Cristal-pantalla**: cristal gigante como pantalla; la más mágica y cinematográfica.

## Pendiente
- Paso 3: si se aprueba, conectarlo a la app (ruta, entrada desde el aula/Sótano, `onResult` → evidencia de la clase, mascota del estado) y a las demás misiones.
- Regla de evidencia: solo Demuestra cuenta; Adivina y Práctica no.
- El enunciado del generador trae "Estilo PEP (pregunta 3): …(sin tabla: razónalo)"; limpiarlo para que se lea como prueba.
- Generalizar la estación a otras misiones (hoy usa `basicidad`, `am.orden` y la mascota del estado).
- Probar en celular real (390) con RDKit y reloj; revisar peso de la primera carga.
- Definir cómo la estación usa los bloques/preguntas existentes de m4 sin duplicar contenido.
