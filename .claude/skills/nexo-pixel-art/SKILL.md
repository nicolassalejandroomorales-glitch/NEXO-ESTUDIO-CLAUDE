---
name: nexo-pixel-art
description: Cómo se dibuja pixel art en Nexo (rampas de color, escala ×4, scripts reproducibles con Python). Úsala al crear o cambiar cualquier arte en pixel: refugio, mascotas, grimorio, íconos o juegos.
---

# Pixel art de Nexo

- Motor: `tools/home-pixel/pixel.py` (Python + Pillow + numpy). Ejemplo completo: `tools/home-pixel/build_refugio.py` → `dist/assets/home-scenes/refugio-pixel.png`.
- **Pixel art de verdad, nunca un filtro**: nada de achicar y pixelar arte existente ni pegar sprites sueltos encima.
- Cada píxel guarda **material + nivel** de su rampa (`RAMPS` en `pixel.py`). La luz sube o baja escalones dentro de la rampa; no mezcla colores. Paleta corta y limpia.
- Rampas con cambio de tono: sombras frías/moradas, luces cálidas. Reutiliza las rampas existentes para que todo parezca del mismo mundo.
- Dithering Bayer solo en superficies grandes (pared, cielo, madera). Objetos chicos (hojas, libros, latón) nítidos.
- Escala: refugio 418×235 px de arte mostrado ×4 (= coordenadas 1672×941). Mascotas 40×44 px, también ×4.
- Contornos propios por pieza + contorno exterior con el tono más oscuro.
- Todo asset sale de un **script reproducible** en `tools/`; nunca editar el PNG a mano. Sin IA de imágenes.
- Diseños propios: ambiente inspirado está bien, copiar personajes u objetos de series no.
- Gustos de Niquito: le encantan el piso, la ventana y las runas del refugio; **no agregar más runas**. Le gustó la v3: calma, verde, mágica sin recargar.
