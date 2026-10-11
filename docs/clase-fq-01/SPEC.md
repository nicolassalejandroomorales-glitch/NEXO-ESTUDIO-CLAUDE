# Clase FQ II · Equilibrio químico (PEP 1, miércoles 21 de octubre)

Parte de `docs/replica-pep1/SPEC.md`. Clase `dist/classes/fq-01.js` + ejercicios infinitos `fq-01-gen.js`.

## Qué

- 4 misiones: **m1** grado de avance y ΔrG · **m2** Q contra K y ΔrG° = −RT ln K (caso: glucosa-6-fosfato en la célula) ·
  **m3** Kp, Kc, Δn y equilibrios heterogéneos (caso: la cal) · **m4** van't Hoff, Le Châtelier y actividad (caso: Haber).
- 3 raíces (Repaso desde cero): espontaneidad (ΔG = ΔH − TΔS), gases y fracciones, logaritmos y unidades.
- 12 errores típicos con su porqué (entre ellos °C en vez de K, kJ con J, sólidos en K, Δn mal contado, catalizador que "mueve" el equilibrio).
- Formulario con 6 tarjetas y 5 calculadoras; diagnóstico de 7 preguntas; mini clase por concepto; 2 clases "a profundidad".
- 12 generadores en 5 niveles (2400 ejercicios revisados en cada `npm test`), con respuesta numérica y trampas de errores típicos.
- Laboratorio "¿qué pasa si…?": perturbar el equilibrio de Haber y el de la cal.

## Decisiones

- Las diapositivas del Dr. Pino son casi todas imágenes: `slide` apunta a la **clase** o la **guía** de donde sale cada idea (10 fuentes).
- Los números de la Guía 1 se recalcularon en Python (ej.: Q = 1,32 y ΔrG = +14,1 kJ/mol para la G6P; K(CH₄ → C + 2H₂) = 1,26 × 10⁻⁹ → 1,30 × 10⁻⁸ a 50 °C;
  K = Kγ·Kp = 4,06 × 10⁻⁵ para NH₃ a 720 K).
- Reparto de puntos de la meta **estimado** (no hay pauta de PEP 1 de FQ II): 50 de Equilibrio químico y 50 de electrolitos/iónico/electroquímico.
- El simulacro desde el 2° intento cambia también los cálculos por casos nuevos nivel PEP (otros números).

## Pendiente

- Diapositivas de electrolitos y de equilibrio iónico/electroquímico (fq-02, fq-03).
- Revisión humana de la química (capa 3).
