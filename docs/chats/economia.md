# Economía, tienda y perfil
- modelo: Sonnet 5.5 · alto (solo conversar y diseñar)
- estado: Tienda de la beta implementada (17 oct 2026), esperando aprobación de Niquito. SPEC: docs/economia/SPEC.md
- fase: desarrollo
- prioridad: 3
- spec: docs/mascota/SPEC.md (precios) y skill nexo-perfil

## Hecho
- Rangos arcanos (`dist/academic/ranks.js`) y Perfil con Mascota, Notas, Inasistencias, Estadísticas y Ajustes.
- Precios de ejemplo de 14 accesorios (60–260 ⚛) en `PRICES` de `home-pet.js`.

## Falta
- (17 oct) Hecho: Tienda del alquimista con kit de UI, apertura animada del cofre, cofres por categoría y ⚛ por evidencia con tope. Falta: pagar transferencia/recuerdo desde el motor académico, cofres por ramo, objetos del refugio y skins, rachas con perdón.
- Diseñar la economía: cómo se gana y se gasta (átomos, monedas), cuándo se siente justo y cuándo no.
- Que "Comprar" funcione en la Tienda.
- Decidir premio del tutorial (propuesta 150 ⚛) y unificar `state.coins` / átomos.
- Unificar Perfil › Notas con la Bitácora (lo hace el chat organizacion).

## Ideas
- Ganar por evidencia real (acertar sin ayuda, recordar después) y no por tiempo sentado.
- Objetos del refugio comprables, no solo accesorios.
- Rachas con perdón (una semana mala no borra todo).

## Prompt de inicio
```
Chat: Economía, tienda y perfil (solo diseño). Lee CLAUDE.md, la skill nexo-perfil y el apartado de precios en docs/mascota/SPEC.md.
Tarea: conversemos, sin código. Dime en una línea qué entendiste y hazme máximo 3 preguntas de selección múltiple sobre cómo se ganan y gastan los átomos/monedas, para que premie aprender de verdad y no solo abrir la app.
El resultado es un docs/economia/SPEC.md corto y un prompt listo para un chat de implementación.
Al terminar, usa nexo-cierre y actualiza docs/chats/economia.md.
```

## Prompt de continuación
```
Chat: Economía, tienda y perfil. Lee CLAUDE.md, la skill nexo-perfil y docs/chats/economia.md.
Parte desde "Falta" y pregúntame qué decisión toca primero.
```
