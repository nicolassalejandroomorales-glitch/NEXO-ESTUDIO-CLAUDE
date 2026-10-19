# Simulacro PEP 1 · Fisicoquímica II (para el miércoles 28 de octubre)

**Estado: borrador** (cotejado con las pruebas y guías pasadas del Drive; falta tu OK y que lo pruebes).
Todos los números de la pauta están calculados con Python (19 oct 2026).

## Reglas (las mismas de la cátedra)
- **Tiempo: 100 minutos** (supuesto: la cátedra no publica la duración; si es otra, ajusta los minutos de abajo en proporción).
- **Formulario de 2 páginas, solo fórmulas** (sin diagramas ni explicaciones). Arma el tuyo antes y entrégalo al final, igual que en la PEP.
- Sin celular. Calculadora científica sí.
- Haz el simulacro de una sola vez, sin mirar la pauta ni la clase. Corrige después con la pauta, con lápiz de otro color.
- Una pregunta bien planteada pero con un error de cuentas vale **más de la mitad**; la pauta lo dice parte por parte.

## Datos para todo el simulacro
R = 8,314 J/(mol·K) = 0,08314 L·bar/(mol·K) · F = 96 485 C/mol · T = 298,15 K · 0,05916 V = RT ln 10 / F a 25 °C · A = 0,509 (mol/kg)^(−1/2) (ley límite, agua, 25 °C) · p° = 1 bar (en P2d se usa 1 atm) · m° = 1 mol/kg · en las soluciones diluidas considera molaridad ≈ molalidad.

Orden y tiempo sugerido: **P1** 18 min · **P2** 20 · **P3** 20 · **P4** 22 · **P5** 15 · **5 min** para revisar.

---

## P1 · Equilibrio desde los moles (20 puntos)
*Formato calcado de: Control 1 2S2023 P1 y Guía 1 #8. Conceptos: `eq.avance`, `eq.kp-kc`, `eq.k-dg`. Clase fq-01, diap. 51, 56, 202.*

En fase gas, **A + B ⇌ 2C + D**. Se mezclan 2,0 mol de A, 1,5 mol de B y 0,5 mol de D. Al llegar al equilibrio a 25 °C y 2,0 bar, la mezcla contiene 0,80 mol de C.

a) Calcula el grado de avance ξ y los moles de cada especie en el equilibrio. (5)
b) Calcula las fracciones molares de cada especie. (3)
c) Calcula Kp. (5)
d) Calcula Kc. (4)
e) Calcula ΔrG° a 25 °C. (3)

## P2 · De las tablas a K(T), inertes y gases reales (20 puntos)
*Formato calcado de: Control 1 2S2023 P2, PEP 1 2S2023 P1 (a, b, c), Guía 1 #2, #6 y #7. Conceptos: `eq.k-dg`, `eq.vanthoff`, `eq.lechatelier`, `eq.actividad`. Clase fq-01, diap. 80, 93, 103, 201.*

**2 SO₂(g) + O₂(g) ⇌ 2 SO₃(g).** A 298,15 K: ΔfH° (kJ/mol) SO₂ = −296,8; SO₃ = −395,7. ΔfG° (kJ/mol) SO₂ = −300,2; SO₃ = −371,1.

a) Calcula ΔrH°, ΔrG° y la constante de equilibrio K a 298,15 K. (5)
b) Suponiendo ΔrH° constante, calcula K a 600 K. (5)
c) A 600 K el sistema está en equilibrio. Se agrega argón (gas inerte). ¿Qué pasa con el equilibrio (i) si el volumen es constante y (ii) si la presión total es constante? Justifica con Q y K. (4)
d) Para **N₂ + 3 H₂ ⇌ 2 NH₃** a 700 K, en el equilibrio p(N₂) = 60 atm, p(H₂) = 180 atm y p(NH₃) = 250 atm; los coeficientes de actividad son γ(N₂) = 1,15, γ(H₂) = 1,12 y γ(NH₃) = 0,80. Calcula Kp y la constante termodinámica K (p° = 1 atm). (6)

## P3 · Electrolitos y Debye–Hückel (20 puntos)
*Formato calcado de: Control 1 2S2023 P3, PEP 1 2S2023 P2, Guía 2 #1–#8 y #9. Conceptos: `ion.fuerza`, `ion.actividad`, `ion.debye`, `ion.kps`. Clase fq-02, diap. 16, 22, 52, 61, 83–85.*

a) Para una solución de K₂SO₄ 0,0030 m a 25 °C calcula: la fuerza iónica, γ± (ley límite), la molalidad iónica media m± y la actividad iónica media a±. (8)
b) A esa solución se le agrega NaCl 0,0020 m. Calcula la fuerza iónica de la mezcla y γ± del K₂SO₄ en ella. (4)
c) El oxalato de calcio, CaC₂O₄, tiene Kps = 3,0 × 10⁻⁹ a 25 °C. Calcula su solubilidad (i) sin considerar actividades y (ii) con la ley límite de Debye–Hückel (una iteración: estima I con la solubilidad del apartado i). (5)
d) Enuncia los postulados de la teoría de Debye–Hückel. (3)

## P4 · Electroquímica (20 puntos)
*Formato calcado de: apuntes de PEP 1 2024 (Nernst, pila de concentración), temario 2026 del Control 1 y Guía 3 (que aún no he leído). Conceptos: `ele.potenciales`, `ele.celdas`, `ele.dg`, `ele.nernst`, `ele.ph`. Clase fq-03, diap. 22–29, 60–62.*

E° de reducción (V): Zn²⁺/Zn = −0,76 · Cu²⁺/Cu = +0,34 · Ag⁺/Ag = +0,80.

Celda: **Zn(s) | Zn²⁺ (0,010 M) ‖ Cu²⁺ (0,50 M) | Cu(s)**.
a) Escribe las semirreacciones, indica ánodo y cátodo y la reacción global. (4)
b) Calcula E° y E de la celda a 25 °C. (6)
c) Calcula ΔG de la celda (con E) y la constante de equilibrio K de la reacción global. (4)
d) Celda de concentración **Ag(s) | Ag⁺ (0,0100 M) ‖ Ag⁺ (0,200 M) | Ag(s)**: calcula su fem a 25 °C e indica en cuál semicelda ocurre la reducción. (3)
e) La celda **Pt | H₂ (1 atm) | H⁺ (x) ‖ Cu²⁺ (1,00 M) | Cu** marca E = 0,520 V. Calcula el pH. (3)

## P5 · Equilibrio iónico con actividades (20 puntos)
*Formato calcado de: Guía 2, clase 5 diap. 100 (grado de disociación y fuerza iónica) y laboratorio 2 (Ka por conductimetría y Debye–Hückel). Conceptos: `ion.ka`, `ion.debye`, `ion.fuerza`. Clase fq-02.*

Un ácido débil HA tiene Ka = 1,8 × 10⁻⁵ (valor termodinámico, en actividades). Se prepara una solución 0,020 m de HA.

a) Sin considerar actividades, calcula el grado de disociación α. (5)
b) A la solución se le agrega NaCl 0,0050 m. Calcula la fuerza iónica (desprecia el aporte de los iones del ácido) y γ± con la ley límite. (5)
c) Con actividades, [H⁺][A⁻]/[HA] = Ka/γ±². Calcula el nuevo α. (6)
d) Explica con tus palabras por qué α aumenta al agregar una sal «inerte». (4)

---

# PAUTA (no mirar antes de terminar)

Puntaje parcial: el valor entre paréntesis se reparte por los pasos de la derecha. Un error de arrastre (el resultado final sale mal solo porque un número anterior estaba mal) **no se descuenta dos veces**.

## P1 (20)
| Parte | Solución | Puntos |
|---|---|---|
| a | ξ = (n − n₀)/ν = (0,80 − 0)/2 = **0,40 mol**. nᵢ = n₀ + νᵢξ → n(A) = 2,0 − 0,40 = **1,60**; n(B) = 1,5 − 0,40 = **1,10**; n(C) = **0,80**; n(D) = 0,5 + 0,40 = **0,90**. Total = **4,40 mol** | 2 por ξ (1 por la fórmula, 1 por el valor) + 3 por los cuatro moles |
| b | x = n/total: A **0,364**, B **0,250**, C **0,182**, D **0,205** (suman 1) | 1 por la idea, 2 por los valores |
| c | pᵢ = xᵢP: A 0,727 · B 0,500 · C 0,364 · D 0,409 bar. Kp = p(C)²·p(D)/(p(A)·p(B)) = **0,149** | 2 expresión, 1 presiones, 2 valor |
| d | Δn = (2+1) − (1+1) = +1. Kp = Kc (c°RT/p°)^Δn con c°RT/p° = 0,08314·298,15 = 24,79 → Kc = 0,149/24,79 = **6,0 × 10⁻³** | 2 relación y Δn, 2 valor |
| e | ΔrG° = −RT ln Kp = −8,314 · 298,15 · ln 0,149 = **+4,7 kJ/mol** | 2 fórmula, 1 signo y valor |

*Trampas típicas:* usar moles en vez de presiones parciales; olvidar × P = 2 bar; dividir por los moles **iniciales** (4,0) en vez de los del equilibrio (4,40).

## P2 (20)
| Parte | Solución | Puntos |
|---|---|---|
| a | ΔrH° = 2(−395,7) − 2(−296,8) = **−197,8 kJ/mol**. ΔrG° = 2(−371,1) − 2(−300,2) = **−141,8 kJ/mol**. ln K = 141 800/(8,314 · 298,15) = 57,20 → **K = 7,0 × 10²⁴** | 1 ΔH, 2 ΔG, 2 K |
| b | ln(K₂/K₁) = −(ΔrH°/R)(1/T₂ − 1/T₁) = −(−197 800/8,314)(1/600 − 1/298,15) = −40,14 → K₂ = 7,0 × 10²⁴ · e^(−40,14) = **2,6 × 10⁷** (K baja al subir T: exotérmica) | 2 fórmula, 1 kelvin, 2 valor |
| c | (i) V constante: el argón no cambia las concentraciones ni las presiones parciales de los reactivos → **Q = K, no pasa nada**. (ii) P constante: el volumen aumenta, las presiones parciales bajan; como Δn(gas) = −1, Q ∝ P⁻¹ **sube**: Q > K y el equilibrio **se desplaza hacia los reactivos** (SO₂ + O₂), el lado con más moles de gas | 1 (i), 3 (ii) |
| d | Kp = p(NH₃)²/(p(N₂)·p(H₂)³) = 250²/(60 · 180³) = **1,79 × 10⁻⁴**. Kγ = γ(NH₃)²/(γ(N₂)·γ(H₂)³) = 0,80²/(1,15 · 1,12³) = **0,396**. K = Kγ · Kp = **7,1 × 10⁻⁵** | 2 Kp, 2 Kγ (1 si olvida elevar al coeficiente), 2 K |

*Trampas:* usar °C en van't Hoff; usar ΔrG° de 25 °C a 600 K; olvidar que K es adimensional (p°).

## P3 (20)
| Parte | Solución | Puntos |
|---|---|---|
| a | m(K⁺) = 0,0060; m(SO₄²⁻) = 0,0030. I = ½(0,0060·1² + 0,0030·2²) = **0,0090 mol/kg**. log γ± = −0,509 · \|1·(−2)\| · √0,0090 = −0,0966 → **γ± = 0,801**. m± = (ν₊^ν₊ ν₋^ν₋)^(1/ν) m = 4^(1/3) · 0,0030 = **4,76 × 10⁻³**. a± = γ± m±/m° = **3,81 × 10⁻³** | 2 I, 2 γ±, 2 m±, 2 a± |
| b | Na⁺ 0,0020 y Cl⁻ 0,0020 aportan ½(0,0020 + 0,0020) = 0,0020. I = 0,0090 + 0,0020 = **0,0110 mol/kg**. log γ± = −0,509 · 2 · √0,0110 = −0,1068 → **γ± = 0,782** (baja respecto de 0,801: más iones «frenan» a los tuyos) | 2 I, 2 γ± |
| c | (i) Kps = S² → S = √(3,0 × 10⁻⁹) = **5,5 × 10⁻⁵ M**. (ii) K°ps = γ±² S² con I ≈ 4S = 2,2 × 10⁻⁴, log γ± = −0,509 · 4 · √(2,2 × 10⁻⁴) = −0,0301 → γ± = 0,933; S = S₀/γ± = **5,9 × 10⁻⁵ M** (≈ 7 % más soluble: efecto salino) | 1 (i), 2 I y γ±, 2 S |
| d | Ion central de referencia · agua = medio dieléctrico continuo (ion–solvente independiente de la concentración) · los demás iones forman una distribución continua con la constante dieléctrica del solvente · exceso de carga de signo contrario alrededor del ion central (solo interacciones coulómbicas) | 1 por cada idea, máx. 3 |

*Trampa grande:* en b usar la I del K₂SO₄ solo (0,0090). Los iones de la otra sal también entran en la fuerza iónica.

## P4 (20)
| Parte | Solución | Puntos |
|---|---|---|
| a | Ánodo (−): Zn → Zn²⁺ + 2e⁻ (oxidación). Cátodo (+): Cu²⁺ + 2e⁻ → Cu (reducción). Global: Zn + Cu²⁺ → Zn²⁺ + Cu | 1 por cada semirreacción con su nombre, 1 global, 1 electrones balanceados |
| b | E° = E°cátodo − E°ánodo = 0,34 − (−0,76) = **1,10 V**. Q = [Zn²⁺]/[Cu²⁺] = 0,010/0,50 = 0,020. E = E° − (0,05916/2) log Q = 1,10 − 0,02958 · (−1,699) = **1,150 V** | 2 E°, 2 Nernst planteada, 2 valor |
| c | ΔG = −nFE = −2 · 96 485 · 1,150 = **−222 kJ/mol**. ln K = nFE°/RT → K = 10^(2 · 1,10/0,05916) = **1,5 × 10³⁷** (con E°, no con E) | 2 ΔG, 2 K |
| d | Cátodo (reducción) en la semicelda concentrada (0,200 M); E = 0,05916 · log(0,200/0,0100) = **0,077 V** | 1 semicelda, 2 valor |
| e | Ánodo: H₂ → 2H⁺ + 2e⁻; cátodo: Cu²⁺ + 2e⁻ → Cu. E = E° − (0,05916/2) log([H⁺]²/(p(H₂)[Cu²⁺])) = 0,34 + 0,05916 pH → pH = (0,520 − 0,34)/0,05916 = **3,04** | 1 planteo, 1 Nernst, 1 valor |

*Trampas:* sumar los potenciales en vez de restar; usar E y no E° para K; dividir en vez de multiplicar el log por n=2.

## P5 (20)
| Parte | Solución | Puntos |
|---|---|---|
| a | Ka = x²/(C − x) con C = 0,020: x = 5,91 × 10⁻⁴ → **α = 0,0296** (≈ 3,0 %) | 2 equilibrio, 3 valor |
| b | I(NaCl) = **0,0050 mol/kg** (el aporte de H⁺ y A⁻ ≈ 6 × 10⁻⁴ se desprecia). log γ± = −0,509 · 1 · √0,0050 = −0,0360 → **γ± = 0,920** | 2 I, 3 γ± |
| c | Ka/γ±² = 1,8 × 10⁻⁵/0,920² = 2,13 × 10⁻⁵ = x²/(0,020 − x) → x = 6,4 × 10⁻⁴ → **α = 0,0321** (+8 % respecto de 0,0296) | 2 corrección, 2 ecuación, 2 valor |
| d | Más iones en la solución → más fuerza iónica → γ± < 1: cada ion queda «estabilizado» por su atmósfera iónica. Como la Ka termodinámica no cambia, el cociente de concentraciones [H⁺][A⁻]/[HA] debe subir: el ácido se disocia más (efecto salino) | 2 γ± baja, 2 consecuencia |

---

## Cómo corregirte (nota)
Suma tus puntos de 100. **60 puntos = nota 4,0** (exigencia 60 %). Nota = 1 + 3·p/0,6 si p < 0,6 y 4 + 3·(p − 0,6)/0,4 si p ≥ 0,6, con p = puntos/100 (misma escala que el «Simulacro PEP» del aula).

| Si perdiste puntos en… | Vuelve a… (concepto del motor) |
|---|---|
| P1 a–b | fq-01 misión 1 · `eq.avance` |
| P1 c–d | fq-01 misión 3 · `eq.kp-kc` |
| P1 e, P2 a | fq-01 misión 2 · `eq.k-dg` |
| P2 b | fq-01 misión 4 · `eq.vanthoff` (ejercicios `gibbsvh`) |
| P2 c | fq-01 misión 4 · `eq.lechatelier` |
| P2 d | fq-01 misión 4 · `eq.actividad` |
| P3 a–b | fq-02 misión 1–2 · `ion.fuerza`, `ion.actividad`, `ion.debye` (`mezcla`) |
| P3 c | fq-02 misión 2 · `ion.kps` |
| P3 d | actividad escrita `m2-w2` de fq-02 |
| P4 a | fq-03 misión 1 · `ele.celdas` |
| P4 b–d | fq-03 misión 2 · `ele.potenciales`, `ele.dg`, `ele.nernst` |
| P4 e | fq-03 misión 3 · `ele.ph` |
| P5 | fq-02 misión 2 · `ion.ka`, `ion.debye` |

## Notas de calidad
- Los 5 problemas repiten el **formato** de las pruebas pasadas (3 problemas largos con apartados, 1 pregunta escrita corta) con datos nuevos; ningún número es de una prueba real.
- Los datos de ΔfH° y ΔfG° del SO₂ y SO₃ son valores de tablas estándar (Atkins, CRC); la cátedra entrega los suyos en la prueba, pueden diferir en la segunda cifra.
- No hay en este simulacro: Debye–Hückel ampliada con tamaño iónico, conductividad ni Faraday (no han caído en las pruebas que pude leer). Si la Guía 3 2026 los pide, hay que agregarlos.
