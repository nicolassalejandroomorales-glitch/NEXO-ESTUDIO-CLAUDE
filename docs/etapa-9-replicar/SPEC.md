# Etapa 9 · Replicar: plantilla y guía al día para la próxima clase

Parte del plan de `docs/clase-viva/DISENO.md` (§11, etapa 9). Objetivo: que la próxima clase (por ejemplo Aromáticos, org-04)
herede todo lo de las etapas 1 a 8 sin programar, solo escribiendo contenido.

## Qué

1. `tools/new-class.cjs` crea **dos archivos**: la clase (`<id>.js`) y sus ejercicios infinitos (`<id>-gen.js`).
2. La clase nueva trae lo que le faltaba a la plantilla: `subject` (ramo, sacado solo de `dist/data.js`, para la cuenta regresiva),
   una raíz `base.*` con su **misión base** (Repaso desde cero), errores típicos con `base` (desvío) y `check` (caso corto),
   y `concept` en cada bloque de lección.
3. `<id>-gen.js` trae dos generadores de ejemplo (uno **desde una tabla**, con la respuesta calculada; otro **desde un banco** por nivel),
   en 5 niveles, más un laboratorio mínimo y las criaturas del bestiario.
4. `tools/classroom-test.cjs` separa lo general de lo propio de Aminas (`aminas = id === 'org-01'`): antes, cualquier clase nueva en el
   catálogo reventaba la prueba por buscar la misión 7, el pKa o la receta de basicidad.
5. `tools/new-class-test.cjs` pone la plantilla en el catálogo junto a Aminas (carpeta temporal, `NEXO_CLASSES_DIR`) y le pasa la prueba
   completa del aula en cada `npm test`.
6. Guía `docs/clases-estructura/COMO_CREAR_UNA_CLASE.md`: opciones nuevas, cómo escribir generadores y lista antes de publicar.

## Decisiones

- Los generadores vienen **por defecto** (`--sin-generadores` para no crearlos): la escalera de 5 niveles y la ronda que no se agota son
  parte del modelo, no un extra.
- La plantilla usa **solo comillas simples** en el código generado (sin `${}`), para que se pueda leer y editar sin sorpresas.
- Las revisiones de Aminas no se borran: siguen corriendo en org-01; las generales se adaptan al tamaño de la clase
  (por ejemplo, la ronda trae tantas preguntas como conceptos vistos, hasta 4).

## Criterios de aceptación

- `node tools/new-class.cjs org-04 "Aromáticos" "PEP 1" --catalogo` deja una clase que pasa `node tools/classroom-test.cjs`. ✔
- `npm test` en verde. ✔
- Sin cambios en pantalla para Aminas (no hay ANTES/AHORA que mostrar).

## Pendiente

- Tipo de actividad "respuesta numérica con unidades" para Física y Cálculo.
- Generadores con dibujo (construir moléculas y flechas) y escritas generadas.
