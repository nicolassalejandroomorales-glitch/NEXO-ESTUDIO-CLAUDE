# Economía, tienda y perfil
- modelo: Sonnet 5.5 · alto para diseñar; para implementar, Sonnet 5.5 · medio
- estado: diseño v3 escrito el 24 oct 2026 en docs/economia/SPEC.md, pendiente de aprobación de Niquito. Tienda de la beta (17 oct) ya implementada.
- fase: desarrollo
- prioridad: 3
- spec: docs/economia/SPEC.md (y docs/mascota/SPEC.md para precios viejos), skill nexo-perfil

## Hecho
- Rangos arcanos (`dist/academic/ranks.js`) y Perfil con Mascota, Notas, Inasistencias, Estadísticas y Ajustes.
- Tienda de la beta: `dist/economy/tienda.js`, puesto del alquimista, apertura animada del cofre, cofres por categoría, ⚛ por evidencia con tope.
- Diseño v3 (24 oct): tabla se gana / se gasta con topes, cofres con probabilidades, tabla de 10 rangos de jugador, rachas con perdón y criterios de aceptación.

## Hecho en implementación (24 oct 2026)
- Pasos 1-2 del SPEC: inventario de `state.coins`, compra directa con ⚛, motivos y precio por moneda en cada botón, tienda vieja (`buyUtility`) borrada. Prueba: `tools/economia-test.cjs`. Falta aprobación de Niquito antes de seguir con los pasos 3-9.

## Falta
- Decidir qué hacer con los desafíos de estudio (ver Pendiente del SPEC) antes del paso 3.
- Seguir desde el paso 3 del SPEC (`earn` con decrecimiento por concepto, recuerdo solo vencido, tiempo = 0).
- Que Niquito apruebe el diseño v3 (decisiones que tomé yo y hay que confirmar: tiempo de sesión paga 0, se quita el cofre por guía completada, premio del tutorial = 1 cofre, precios directos 90/150/300/600 ⚛).
- Implementar los 9 pasos del SPEC (prompt abajo). Hallazgo: el estante hoy cobra polvo, no ⚛, y por eso "Comprar" parece no funcionar si no tienes polvo.
- Chat de juegos: tope de 300 XP por día y la tabla de rangos de jugador.
- Fase 2: cofres temáticos por ramo, objetos del refugio y skins.
- Unificar Perfil › Notas con la Bitácora (lo hace el chat organizacion).

## Ideas
- Objetos del refugio comprables, no solo accesorios.
- Si la colección se completa muy rápido: cofre del día "chico" (solo común o polvo).

## Prompt de implementación
```
Chat: Economía (implementar). Lee CLAUDE.md, docs/economia/SPEC.md (diseño v3; si Niquito no lo ha aprobado, pregúntale antes de programar), docs/chats/economia.md y las skills nexo-motor y nexo-mascota.
Recomienda modelo y esfuerzo en una línea. Dime en una línea qué entendiste y qué falta.
Tarea: implementa los pasos del apartado "Cómo" del SPEC en orden, en pasos chicos, editando los archivos existentes (nada de v2 ni parches encima).
Empieza por 1-2: inventario de lo que escribe `state.coins` y arreglar Comprar (el estante cobra polvo; agregar compra directa con ⚛ y mostrar precio y motivo en cada botón). Muéstrame eso antes de seguir con 3-9.
Límites: no tocar Supabase ni nube; no generar imágenes; reutilizar el arte de la Tienda; sin cuenta todo es local.
Pruebas: actualizar `tools/economia-test.cjs`, crear `tools/economia-sim.cjs` y correr `node tools/run-tests.cjs`; después `node tools/build-startup.cjs`. Verificar en 1440 y 390 con una sola captura al final.
Si el chat se alarga, avísame y corta después del paso 5 para continuar en otro chat.
Al terminar usa nexo-cierre y actualiza docs/chats/economia.md.
```

## Prompt de continuación
```
Chat: Economía. Lee CLAUDE.md, docs/economia/SPEC.md y docs/chats/economia.md.
Parte desde "Falta" y pregúntame qué decisión toca primero.
```
