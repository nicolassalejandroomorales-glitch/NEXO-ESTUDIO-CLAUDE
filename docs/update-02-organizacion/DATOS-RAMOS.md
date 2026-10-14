# Datos reales de los ramos 2S-2026 (leídos del Drive el 14 oct 2026)

Fuente: Drive de Niquito → `Material Nexo (2026) / 2S QYF 2026` y `HORARIOS`. Cargado en `dist/semester-2026.js` (versión `2026-10-14`).
Prueba: `node tools/semester-test.cjs`. Capturas ANTES/AHORA: `datos-reales/`.

## Cómo llega a la app
- Cuenta nueva: recibe todo.
- Cuenta existente: `NEXO_SEMESTER.upgrade()` corre **una sola vez** por versión. Agrega solo los eventos nuevos (no duplica,
  y si después borras uno no vuelve) y reemplaza la ponderación de un ramo **solo si ese ramo no tiene ninguna nota escrita**.

## Ponderaciones

| Ramo | Teoría / Lab | Teoría | Laboratorio | Reglas |
|---|---|---|---|---|
| **Orgánica II** | 50 / 50, cada parte se aprueba por separado (4,0) | PEP 1, 2, 3: 30 % c/u · controles del taller 10 % | Control de entrada P-1..P-4: 3,75 % c/u (15 %) · Reporte P-1..P-4: 3,75 % c/u (15 %) · Prueba de ciclo 1: 35 % · Prueba de ciclo 2: 35 % | Promedio < 3,4 reprueba sin PF; 3,5–3,9 o una PEP < 4,0 → PF reemplaza la PEP más baja. Si repruebas una parte, la final es la reprobada. Lab al 60 % de exigencia; guardas la nota de lab un semestre si repruebas teoría. Lab 100 % asistencia. |
| **Química Analítica** | 60 / 40, lab se aprueba aparte (4,0) | PEP 1: 30 % · PEP 2: 30 % · PEP 3: 25 % · controles 15 % | Una fila "nota final de lab" (100 %) | Eximición: ≥ 4,0 en cada PEP. Examen (40 %) con promedio entre 3,5 y 4,0. |
| **Fisicoquímica II** | 50 / 50 | PEP 1, 2, 3: 80/3 % c/u · controles de ejercicios 20 % | Libreta en lab 5 % · revisión de libreta 2 × 12,5 % · fichas de seguridad 5 % · test de entrada 5 × 3 % · prueba de ciclo 25 % · tabla de datos y gráficos 5 × 5 % | Cátedra < 4,0 (3,95) → examen 40 % de la final. Lab: una prueba de ciclo roja → examen de lab (40 %, 13-01-2027). Lab 100 % asistencia; la tabla se entrega al terminar la sesión. |
| **Fisiopatología** | PEP 70 / seminarios 30 | PEP 1: 50 % · PEP 2: 50 % (de la parte PEP) | Seminarios (casos clínicos): 100 % de esa parte | Examen = 30 % de la nota de cátedra; eximición con 4,5. Obligatorio tener la cátedra aprobada. |

## Fechas nuevas
- **Orgánica II lab (jueves 09:50, CDA101)**: P-2 15 y 22 oct · P-3 12 y 19 nov · P-4 26 nov y 3 dic · prueba de ciclo 1: **mié 4 nov 08:15** · prueba de ciclo 2: **mié 16 dic 08:15**. Sin lab el 29 oct (Feria Científica); recuperativos el 10 dic.
- **FQ II lab (miércoles 16:55, CDA102, sección L-7)**: Lab 2 21 oct · Lab 3 4 nov · Lab 4 2 dic · Lab 5 16 dic · prueba de ciclo: **25 nov**. Recuperativos: 18 nov y 30 dic. Examen de lab: 13 ene.
- **Fisiopatología**: PEP 2 **8 ene 2027** · examen 15 ene.
- FQ ejercicios: recuperativos 4 ene, examen 11 ene (no cargados como evento: solo si corresponde).

## Horario (HORARIO NICO.pdf)
Lun: FQ ejercicios 11:25 · ANA teoría 13:45 — Mar: Inglés IV 08:15 · ORG teoría 09:50 · FQ teoría 11:25 —
Mié: ORG ejercicios 08:15 · FQ teoría 09:50 · **FQ lab 16:55–20:05** — Jue: FISIO 08:15 · **ORG lab 09:50–12:45** · ORG teoría 13:45 · ANA ejercicios 15:20 · FISIO seminario 16:55 —
Vie: **ANA lab 08:15–11:10** · ANA teoría 11:25 · FISIO 13:45. Guardado en `NEXO_SEMESTER.schedule` (lo usará la vista Semana).

## Choques y semanas pesadas que salen de estos datos
- **21 oct**: PEP 1 FQ + Lab 2 FQ en la tarde.
- **19–27 oct**: Control 1 ANA (19) · PEP 1 FQ + lab (21) · lab ORG (22) · Control 1 FQ (26) · PEP 1 ORG (27).
- **4 nov**: prueba de ciclo 1 ORG (08:15) + Lab 3 FQ (tarde); 5 nov Control 2 ANA.
- **12–13 nov**: PEP 1 FISIO + lab ORG (12) · PEP 1 ANA (13).
- **25 nov**: PEP 2 FQ + prueba de ciclo de lab FQ el mismo día.
- **16 dic**: prueba de ciclo 2 ORG + Lab 5 FQ.

## Dudas (confirmar con Niquito o cátedra)
1. **Orgánica**: el programa de teoría en Drive es de **2S-2025** (actualizado 2023). Puede haber cambiado. Faltan fechas de PEP 2 y PEP 3.
2. **FQ teoría**: no hay programa 2S-2026 de teoría en Drive; los % (PEP 80 % + ejercicios 20 %) vienen de la programación 1S-2026 (mismos profes).
3. **FQ lab**: la tabla dice "libreta en lab 5 % / revisión libreta (2 veces) 25 %"; se interpretó así para que sume 100 %.
4. **Analítica lab**: la carpeta LAB está vacía; falta el desglose (pre-lab, informes, etc.). Faltan fecha de la PEP 3 y el Control 3.
5. **Fisiopatología**: no queda claro si "cátedra aprobada" incluye los seminarios; por eso no se puso mínimo. El calendario del programa dice 2024-II en el título.
6. **Inglés IV** está en el horario pero no es un ramo en Nexo. ¿Se agrega?
