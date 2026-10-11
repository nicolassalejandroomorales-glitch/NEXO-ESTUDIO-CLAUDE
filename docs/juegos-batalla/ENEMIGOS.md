# Fichas de enemigos (se diseñan ANTES de programarlos)

Cada enemigo se diseña primero aquí. El código solo copia la ficha: en el prototipo es el objeto `ENEMIGO` al inicio del script
de `dist/games/prototipos/batalla-rey-amonio.html`. Si la ficha está completa, programar el enemigo es casi rellenar datos.

## Plantilla

| Campo | Qué decidir |
|---|---|
| **Nombre y concepto** | Qué idea química **es** el enemigo (no solo un disfraz). |
| **Tema académico** | Ramo → evaluación → tema (ej. Orgánica II → PEP 1 → Aminas → Basicidad). |
| **Look** | Forma, colores, animación en reposo y cómo cambia al recibir daño y en fase 2. |
| **Escenario (por capas)** | 1 cielo · 2 estrellas/partículas · 3 formas flotantes · 4 suelo/círculo · 5 enemigo · 6 caja · 7 balas · 8 alma · 9 efectos · 10 HUD. |
| **Ataques (uno por error típico)** | Cada error frecuente → un patrón de balas que **muestra** ese concepto. |
| **Fase 2** | A qué vida cambia, qué ataque nuevo agrega y qué cambia en la música. |
| **Acciones del estudiante** | Qué tipos sirven (Predecir, Flecha, Ordenar, …) y con qué contenido. |
| **Diálogo** | Entrada, burlas, golpe, fase 2, perdón, derrota. |
| **Ruta de perdón** | Condición y qué pasa químicamente (debe tener sentido). |
| **Música** | Tonalidad, tempo y qué capas suenan en cada fase. |

## 1. Rey Amonio (prototipo jugable)

- **Concepto**: ion amonio NH₄⁺, “el que ya tiene el protón”. Representa la basicidad: quién capta el H⁺ y por qué.
- **Tema**: Orgánica II → PEP 1 → Aminas → Basicidad (piloto org-01).
- **Look**: esfera de N teal con ojos que siguen a la estrella, corona dorada, carga “+” que late, 4 H en tetraedro
  (3 giran; en fase 2 giran el doble y todo se tiñe de rosa). Al recibir daño parpadea una vez y retrocede.
- **Escenario**: cielo azul tinta → vino en fase 2, estrellas que titilan, hexágonos (anillos aromáticos) que flotan, círculo rúnico bajo el jefe.
- **Ataques**:
  - *Lluvia de protones* (error de protonación): caen H⁺ en zigzag.
  - *Anillo de resonancia* (error de resonancia/aromaticidad): anillos que giran y se cierran; hay que pasar por el hueco.
  - *Cadena inductiva* (error de inducción): rombos δ+ que salen de un CF₃ y **frenan con la distancia** (el efecto inductivo se atenúa).
  - *Fase 2 · Tetraedro*: dos H persiguen a la estrella y explotan en chispas.
- **Acciones**: Predecir (6 preguntas), Flecha (mecanismo metilamina + HCl en 2 pasos), Ordenar (2 series por pKaH), Objeto (té del refugio), Analizar (gratis).
  Repetir la misma acción hace ×0,6 de daño. La pista hace ×0,5.
- **Perdón**: aparece con vida ≤ 40 y 3 aciertos sin ayuda. NH₄⁺ → NH₃ + H⁺: el H de arriba se va flotando.
- **Música**: re menor, 138 bpm, Dm–B♭–C–A. Turno del estudiante: pad + campanas + bajo suave. Esquiva: bajo, arpegio, batería y melodía. Fase 2: todo más fuerte.

## Ideas para los próximos (por diseñar con Niquito)

- *La Sombra Pirrólica*: su par libre está “atrapado” en el anillo; solo se le hace daño explicando aromaticidad.
- *Gemelos Amida*: amida vs amina; ataques de resonancia con el C=O.
- *Dama del pKa*: jefe de cálculo (log K = pKa(BH⁺) − pKa(HA)); balas numéricas.
