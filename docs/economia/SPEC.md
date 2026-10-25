# Economía y Tienda (SPEC de diseño)

Estado: **diseño v3 del 24 oct 2026, propuesto en el chat de economía, pendiente de aprobación de Niquito.** Reemplaza los números de la beta del 17 oct. Sin código nuevo todavía.
Decisiones de Niquito (24 oct): un cofre comprado cada 2-3 días · rango de jugador da los cofres por hitos · pago decreciente por concepto · cofre diario con condición · rangos 5 y 10 con raro y legendario seguro · rango 10 en ~12 semanas.

## Qué
Los átomos (⚛) se ganan demostrando que aprendes y se gastan en una Tienda cuyo protagonista es el cofre. Debe sentirse justo y adictivo sin dar falsa sensación de dominio.

## Principios (reglas absolutas de este tema)
1. Solo paga **evidencia verificada** (acierto sin ayuda, transferir a un problema nuevo, recordar días después). Tiempo, abrir la app, leer o pulsar "completar" = 0 ⚛.
2. Lo difícil de verdad paga más (transferir y recordar rinden más que repetir). Así lo adictivo coincide con lo que enseña (práctica espaciada y de recuperación: Cepeda 2006; Roediger y Karpicke 2006).
3. Todo es **cosmético**: nada comprable da pistas, saltos ni ventaja de aprendizaje. ⚛, cofres y rango nunca se muestran como "dominio" ni "progreso de aprendizaje".
4. Perder o fallar no quita ⚛, objetos ni progreso.
5. Todo se explica: cada pago dice por qué, y cuando el pago baja dice cómo recuperarlo.
6. Todo local (invitado, sin cuenta ni nube). Solo ⚛ del juego, nunca dinero real. No se toca Supabase.

## Se gana ⚛
| Fuente | Cuánto | Tope / regla |
|---|---|---|
| Acierto sin ayuda | 3 ⚛ | Por concepto y día: 1.º 3, 2.º 2, 3.º 1, 4.º en adelante 0 (multiplicadores 1 / 0,5 / 0,25 / 0, redondeo normal) |
| Acierto con ayuda (pista o reintento) | 1 ⚛ | Solo el 1.º de ese concepto en el día |
| Transferencia a problema nuevo | 6 ⚛ | Mismo decrecimiento por concepto: 6, 3, 2, 0 |
| Recuerdo (repaso vencido) | 8 ⚛ si pasaron ≥2 días; 12 ⚛ si ≥7 días | Solo si el repaso estaba vencido (adelantarlo no paga); un pago por repaso |
| Bonus diario | +5 ⚛ | Con el primer pago >0 del día; va aparte del tope |
| Tiempo, abrir la app, leer, completar una guía con un clic | 0 ⚛ | Cambia: antes pagaba hasta 10 ⚛ por sesión ≥30 min |
| Duelos del juego | Pagan por el mismo registro de evidencia (un duelo limpio = acierto sin ayuda) | Nunca hay doble pago; además dan XP de rango |
| Premio del tutorial | 1 cofre sorpresa, una sola vez | Reemplaza la propuesta de 150 ⚛ |

**Tope diario de evidencia: 60 ⚛** (+5 de bonus). Con el decrecimiento, repetir un solo concepto fácil todo el día rinde como máximo 6 ⚛ + 5 de bonus.

## Se gasta
| Qué | Precio |
|---|---|
| Cofre sorpresa | 70 ⚛ |
| Cofre de categoría (cabeza, cara, cuello, mano) | 90 ⚛ (no se vende si ya tienes toda la categoría) |
| Accesorio directo | Común 90 ⚛ · Poco común 150 ⚛ · Raro 300 ⚛ · Legendario 600 ⚛ |
| Accesorio con polvo (repetidos) | 30 / 60 / 120 / 240 polvo |
| Objetos del refugio, skins, mascotas extra | Fuera de esta fase (precios cuando existan) |

El saldo nunca queda negativo y cada botón muestra su precio **en su moneda** (⚛ o polvo) y, si está bloqueado, por qué.

## Cofres
| Tipo | Cómo se consigue | Contenido y probabilidades |
|---|---|---|
| Sorpresa | Compra 70 ⚛ · cofre del día · rangos 1-4 y 6-9 · hitos de racha | Común 60 % · Poco común 28 % · Raro 10 % · Legendario 2 % |
| Categoría | Compra 90 ⚛ | Mismas probabilidades, calculadas solo con las rarezas que existen en esa categoría (cuello no tiene raro+, cabeza no tiene poco común). **Nunca da repetido** mientras te falte algo de la categoría: los 20 ⚛ extra pagan apuntar y no repetir |
| Rango 5 | Subir al rango 5 | Raro (83 %) o legendario (17 %) seguro |
| Rango 10 | Subir al rango 10 | Legendario seguro; si ya tienes los dos, 240 polvo |
| Temático por ramo | Fase 2 | Hoy no hay contenido temático que poner dentro: se diseña cuando existan |

**Cofre del día**: 1 cofre sorpresa gratis por día, **solo si hubo al menos un pago >0 ese día**. La fecha es la local.
**Garantía**: tras 9 cofres sin raro+, el 10.º lo es. Cuentan solo los cofres que pueden dar raro+ (la categoría cuello no corre la garantía).
**Repetido → polvo**: 10 / 20 / 40 / 80 según rareza; sirve para comprar directo lo que falta.

## Rangos de jugador (XP del juego de Aprender)
La XP viene del duelo: 20 × peso (1-3), mitad con pista o errores, combo hasta +30 %, perder no da XP. **Tope de 300 XP por día.** El rango no prueba dominio ni nota.

| Rango | XP acumulada | Cofre |
|---|---|---|
| 1 | 150 | sorpresa |
| 2 | 400 | sorpresa |
| 3 | 750 | sorpresa |
| 4 | 1.200 | sorpresa |
| 5 | 1.800 | **raro+ seguro** |
| 6 | 2.600 | sorpresa |
| 7 | 3.700 | sorpresa |
| 8 | 5.200 | sorpresa |
| 9 | 7.000 | sorpresa |
| 10 | 9.000 | **legendario seguro** |

Con ~150 XP por día de estudio (5 días a la semana) el rango 5 llega a las ~2-3 semanas y el 10 a las ~12. El tope hace que nadie lo logre en menos de 6. Subir de varios rangos de golpe da todos sus cofres, una sola vez cada uno.

## Rachas con perdón
- Un día cuenta si hubo al menos un pago >0 ese día (abrir la app no cuenta).
- **Perdón**: 1 día de gracia gratis cada 7 días (no se acumula). Si faltas más, la racha baja a la mitad (redondeo abajo), no a cero de golpe.
- Hitos de 7, 14 y 30 días: 1 cofre sorpresa cada uno, una sola vez.

## Ritmo esperado (estimación gruesa, verificar con simulación)
- Día normal (12 aciertos en 4 conceptos, 1 transferencia, 1 repaso vencido): ~43 ⚛. Día liviano (6 aciertos, 2 conceptos): ~17 ⚛.
- Semana de 5 días: ~150 ⚛ = 2 cofres comprados (uno cada 2-3 días) + 5 cofres del día.
- Accesorio común directo en ~3 días; legendario directo en ~3 semanas. Los cofres siguen siendo el camino barato por intento; el precio directo es la válvula contra la mala suerte.
- Colección completa de los 14: ~8-11 semanas, parecido al rango 10.
- **Riesgo conocido**: el cofre del día condicional da ~5 cofres por semana. Si la colección se completa mucho antes, palanca: bajar el cofre del día a "chico" (solo común o polvo) o sumar contenido (temáticos, refugio, skins).

## Justicia y anti-farmeo
- Pago decreciente por concepto y día; recuerdo solo si estaba vencido; tope de 60 ⚛ y de 300 XP por día.
- Garantía, polvo y categoría sin repetidos contra la mala suerte.
- Si el reloj retrocede no se paga ni se da cofre del día. Es todo local: no se detecta nada más, y es aceptable.
- **Registro del día** en la Tienda: ⚛ ganados hoy, tope, y el motivo de cada pago ("acierto sin ayuda en Aminas: +3"). Cuando el pago baja: "este concepto ya rindió hoy; prueba otro o espera al repaso".

## Cómo (pasos para implementar)
1. Inventariar todo lo que escribe `state.coins` (tutorial, desafíos verificados, tienda vieja de `rewards`, `streakShields`) y dejar un solo saldo; lo que paga por evidencia pasa por `earn`.
2. Arreglar Comprar: el estante hoy cobra polvo, no ⚛; agregar compra directa con ⚛ y mostrar precio y motivo en cada botón.
3. `earn`: decrecimiento por concepto y día, recuerdo solo vencido (8 o 12 ⚛), registro del día con motivos, tope y bonus aparte.
4. Conectar `earn` al puente del motor académico (`NexoAcademicBridge.record`): sin ayuda, con ayuda, transferencia y recuerdo. Antes leer la skill `nexo-motor`.
5. Hitos: cofre del día con condición; cofres por rango de jugador (ids `rango:N`, idempotentes) en vez de `jefe:`; quitar el cofre por guía completada; premio del tutorial = 1 cofre.
6. Cofres: categoría sin repetidos y con probabilidades renormalizadas; garantía solo en cofres que pueden dar raro+; cofres de rango 5 y 10.
7. Rachas con perdón (revisar que no dupliquen a los `streakShields`).
8. Tienda: Registro del día, precios por moneda, estantes con compra directa. Correr `node tools/build-startup.cjs`.
9. Pruebas y cierre.

## Criterios de aceptación
- Comprar (cofre con ⚛, accesorio con ⚛, accesorio con polvo) descuenta lo exacto; sin fondos rechaza con motivo claro y el saldo nunca es negativo.
- Tiempo, abrir la app y pulsar "completar" pagan 0 (prueba).
- Un mismo concepto repetido 100 veces en un día rinde como máximo 6 ⚛ + 5 de bonus; sin ayuda paga 3, 2, 1, 0.
- Recuerdo solo paga si estaba vencido (8 ⚛ a ≥2 días, 12 ⚛ a ≥7); el tope diario de 60 ⚛ se respeta.
- Cofre del día: solo con un pago >0, una vez por fecha local; si la fecha retrocede no se da.
- Rangos: la tabla de 10 rangos; subir varios de golpe da todos sus cofres una vez; recargar no duplica; el 5 da raro+ y el 10 legendario.
- Garantía: con rng sembrado, nunca más de 9 cofres seguidos sin raro+ en sorpresa (10.000 aperturas); el raro+ real queda entre 12 % y 15 %.
- Probabilidades: en 100.000 aperturas sorpresa, cada rareza queda a ±1 punto de su valor base (tolerancia mayor en raro+ por la garantía).
- Categoría sin repetidos mientras falte algo; no se vende si está completa; la garantía no corre en categorías sin raro+.
- Racha: 1 perdón cada 7 días; con más faltas baja a la mitad; hitos de 7/14/30 pagan una sola vez.
- Simulación de 12 semanas (`tools/economia-sim.cjs`) con tres perfiles (constante, irregular, farmeador): el farmeador no gana más de un cuarto que el constante, y el constante llega al rango 5 entre las semanas 2 y 3 y al 10 entre las 10 y 14.
- Ninguna pantalla presenta ⚛, cofres o rango como dominio o progreso de aprendizaje.
- Sin red ni cuenta: todo vive en el estado local y no se toca Supabase.
- Se ve bien en 1440 y 390; respeta `prefers-reduced-motion`; `node tools/run-tests.cjs` en verde.

## Hecho (beta del 17 oct 2026, base que ya existe)
- `dist/economy/tienda.js` (lógica pura), Tienda "puesto del alquimista" en `home-pet.js` (`wireShop`), apertura animada en `dist/economy/cofre-fx.js`, arte en `tools/tienda-pixel/`, prueba `tools/economia-test.cjs`.
- 14 accesorios: 5 comunes, 4 poco comunes, 3 raros, 2 legendarios; cofre sorpresa y de categoría; garantía cada 10; polvo por repetidos; `earn` con tope diario.
- Se reutiliza todo lo anterior: se edita, no se rehace.

## Avance de implementación (24 oct 2026, pasos 1-2)
- Inventario de `state.coins`: solo `tienda.js` (`buyChest`, `buyAccessory`, `earn`) debe tocarlo. Falta moverlos: el pago por tiempo (`app.js` cronómetro, ~L1713), el premio del tutorial de 150 ⚛ (~L697) y los desafíos (`claimChallenge`).
- Hecho: compra directa con ⚛ (`buyAccessory`, precios 90/150/300/600), motivos con la cantidad que falta y botones con su moneda. Borrada la tienda vieja (`buyUtility`, `reward()`): `rewards` estaba vacío, así que era código muerto. Los escudos de racha comprables quedan sin forma de comprarse (el perdón de racha los reemplaza en el paso 7).

## Rediseño de la Tienda: "Probador" (24 oct 2026, en prueba, rama `tienda-probador`)
- Tu compañero grande al centro con 4 ranuras (cabeza, rostro, cuello, mano): son justo las 4 categorías de cofre. Tocar una ranura abre su panel con sus accesorios, su cofre y "n de m".
- Cofre sorpresa abajo (diario, abrir, comprar). Probabilidades y garantía plegadas. Lo que compras o ganas se le pone solo a la mascota.
- Reemplaza la grilla de 14 accesorios y las 5 tarjetas de cofres. Falta que Niquito lo apruebe; si no gusta, se descarta la rama.

## Pendiente
- **Decidir (desafíos de estudio):** pagan 15 / 20 / 25 / 30 ⚛ sueltos, fuera del tope diario, y dos de los cuatro pagan por tiempo (enfoque de 25 min y semana equilibrada). Propuesta: que los desafíos de tiempo no paguen ⚛ y los de ejercicios pasen por `earn`.
- Cofres temáticos por ramo, objetos del refugio y skins (necesitan contenido); el polvo sobrante no tiene destino cuando ya lo tienes todo.
- Con cuenta en la nube la Tienda sigue bloqueada (no se toca Supabase en este tema).
- Afinar los números tras probar cuánto ⚛ se gana de verdad.
- El tope de 300 XP por día y la tabla de rangos los implementa el chat de juegos con esta tabla.
