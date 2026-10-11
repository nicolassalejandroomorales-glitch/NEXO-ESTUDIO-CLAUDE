---
name: nexo-mascota
description: Mascotas de Nexo (átomo, matraz y slime en pixel art; poses, expresiones, emotes, accesorios, vida en el refugio). Úsala antes de tocar dist/dev/pixelmascotas.js, dist/mascot/ o la tienda/vestuario.
---

# Mascota

## Leer primero
`docs/mascota/SPEC.md`: la **Fase 5 (pixel art) es la dirección actual**. Fases anteriores = historial.

## Archivos
- `dist/dev/pixelmascotas.js`: motor de sprites (grilla 40×44 px de arte, ×4). Demo: `/dev/mascota-pixel.html`; hoja de revisión: `/dev/pixel-hoja.html`.
- `dist/dev/alquimicos.js`: versión SVG de respaldo (mismo diseño, conductas y ranuras).
- `dist/mascot/controller.js`: decide la intención por habitación (sin arte). Prueba: `node tools/mascot-controller-test.cjs`.
- Anclas de la mascota en el Inicio: `home-scene.js` (ver skill `nexo-inicio`).

## Reglas
- Pixel art con las mismas rampas y tamaño de píxel que el refugio (skill `nexo-pixel-art`). Cada pose se **re-rasteriza**; nunca estirar la imagen.
- Nada de diseños planos: volumen, material y detalle.
- **Descartado por Niquito, no volver a proponer:** Rive, animales (cerdito/gato/perro), estilo cartoon "rubber hose".
- No generar imágenes con Canva ni otra IA sin que Niquito lo pida en ese momento.
- Clima real: solo Open-Meteo como está autorizado (Santiago, máx. cada 30 min, sin red = despejado).
- Tienda y Mascota muestran "Disponible próximamente" hasta rehacerlas. No tocar el saldo de átomos en la nube (Supabase).
