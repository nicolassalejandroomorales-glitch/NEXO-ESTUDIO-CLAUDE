# Clases v2 · piloto Basicidad (Aminas → misión 4)

Estado: **paso 1 del plan de pilotaje** (18 oct 2026). Boceto en `docs/clases-v2/estacion-basicidad.html` (3 versiones lado a lado). Aún no está en la app.
Nota: `docs/clases-estructura/DISENO-V2.md` no existe; el diseño parte de la skill `nexo-clase`, `docs/aprender-pasillo/SPEC.md` y `dist/classes/org-01.js`.

## Qué
Una **estación** = 4 pasos jugados en la mesa de la alcoba del Sótano: Adivina → Clase → Mini juego → Demuestra.

## Decisiones (Niquito, 18 oct)
- Mini juego: **Atrapa el H⁺** (caen protones; solo se "atrapan" con la amina más básica, pKaH mayor).
- Voz: **la mascota** habla en toda la estación (el sabio queda de fondo).
- **Versión elegida: C, cristal-pantalla** (un cristal gigante del ramo hace de pantalla; mascota grande a la izquierda con globo).

## Química (verificada en org-01, m4 y m5)
- Lidocaína: amina terciaria + amida; solo la terciaria se protona (m4 intro).
- Ácido acético 4,76 vs ion trietilamonio 10,76 → K = 10⁶ (m4-t1).
- Frascos del juego: trietilamina 10,76 · anilina 4,6 · piridina 5,2.
- Demuestra: HA pKa 5 + amina con ion pKa 9 → equilibrio hacia la sal (m4-t2).

## Las 3 versiones
- **A Mesa del alquimista**: objetos sobre la mesa (pergamino, grimorio, frascos, sello). Más tangible, fiel al refugio.
- **B Losa de piedra grabada**: losa con borde verde de Orgánica II; sobria y legible, afín a los letreros del pasillo.
- **C Cristal-pantalla**: cristal gigante como pantalla; la más mágica y cinematográfica.

## Pendiente
- Paso 2: llevar la versión C a un prototipo jugable (estación Basicidad con los bloques de m4) y probarlo en 1440 y 390.
- Probar si "atrapa el H⁺" sirve en móvil (390): control por arrastre.
- Regla de evidencia: Adivina y Demuestra cuentan; el mini juego es práctica, no demuestra.
- Definir cómo la estación usa los bloques/preguntas existentes de m4 sin duplicar contenido.
