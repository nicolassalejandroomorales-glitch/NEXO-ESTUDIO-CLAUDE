# Economía y Tienda (SPEC de diseño)

Estado: **diseño aprobado por Niquito (17 oct 2026), sin código todavía.**

## Qué
Una economía donde los átomos (⚛) se ganan aprendiendo de verdad y se gastan en una Tienda cuyo protagonista son los **cofres**.

## Decisiones
**Cómo se gana ⚛**
- Principal: **evidencia real** (acertar sin ayuda, transferir a un problema nuevo, recordar días después). Tiempo sentado o abrir la app no paga.
- Secundario: **bonus diario pequeño** (entrar y hacer una misión del día).

**Qué se vende**
- Cofres (lo principal).
- Accesorios de mascota (los 14 actuales, 60–260 ⚛ como base).
- Objetos del refugio.
- Skins / mascotas extra (átomo, matraz, slime).

**Tipos de cofre (los tres, a la vez)**
- **Sorpresa**: puede salir cualquier cosa, con rarezas (común → legendario).
- **Por categoría**: cofre de accesorios, de refugio, de skins.
- **Temático por ramo**: Orgánica II, Fisicoquímica… el contenido sigue lo que estudias.

**Cómo se consiguen los cofres**
- Comprarlos con ⚛.
- Premio por hitos (terminar una clase, ganar un jefe, una racha).
- Un cofre diario gratis.

**Justicia (anti mala suerte)**
- **Garantía**: cada N cofres sale algo raro seguro (N por definir al implementar).
- **Repetidos dan polvo**: un repetido se convierte en polvo, que sirve para comprar directo lo que falta.
- Solo ⚛ del juego: nunca dinero real.

## Cómo (propuesta de pasos para implementar)
1. Unificar `state.coins` con átomos y definir un solo saldo.
2. Ganar ⚛ desde el motor académico (evidencia) + bonus diario.
3. Catálogo con rareza y un `PRICES` central.
4. Cofres: tablas de probabilidad, garantía, polvo.
5. Tienda: comprar, abrir cofre (animación mágica, pixel art, ambientación de la torre), equipar.
6. Pruebas `tools/economia-test.cjs` (saldo, garantía, polvo).

## Criterios de aceptación
- Comprar descuenta el saldo y no deja comprar sin fondos.
- La garantía y el polvo funcionan y tienen prueba.
- La ganancia de ⚛ depende de evidencia, no de tiempo.
- Se ve bien en 1440 y 390.

## Hecho (17 oct 2026, versión mínima)
- `dist/economy/tienda.js` (lógica) + Tienda en `home-pet.js` (`wireShop`) + prueba `tools/economia-test.cjs`.
- Números: cofre 70 ⚛; rarezas 60/28/10/2 % (común/poco común/raro/legendario); garantía raro+ cada 10 cofres; repetido da 10/20/40/80 polvo; compra directa 30/60/120/240 polvo; 1 cofre diario gratis.
- El Vestuario (Perfil › Mascota) solo muestra accesorios que tienes.
- Cofres por hitos: 1 por jefe vencido (PEP 1), 1 por guía completada y 1 por racha de 7, 14 y 30 días; cada logro paga una sola vez (`claimMilestones`). Se entregan al abrir la Tienda o al completar una guía.
- Solo accesorios dentro de los cofres; solo invitados (con cuenta en la nube la Tienda queda bloqueada).

## Pendiente (por decidir)
- Cofres por categoría y temáticos por ramo, objetos del refugio y skins dentro de los cofres.
- Animación de apertura más elaborada (hoy: aparece el objeto con brillo del color de su rareza).
- Ajustar números tras probar cuánto ⚛ se gana de verdad.
- Premio del tutorial (propuesta 150 ⚛).
- Cuánto paga cada tipo de evidencia y el tope diario para que no se pueda "farmear".
- Rachas con perdón (una semana mala no borra todo).
- Animación de apertura del cofre (cuando se implemente).
