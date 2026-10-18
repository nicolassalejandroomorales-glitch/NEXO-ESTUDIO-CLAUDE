/* Estado real del Sótano (docs/aprender-pasillo/SPEC.md, "Implementación v1").
   De las clases y la evidencia que ya existen salen los frascos y cristales que se dibujan sobre la Cámara.
   Funciones puras: reciben las clases, el aula (NexoClassroom), la evidencia (NexoClassEvidence) y el estado guardado. */
(() => {
  'use strict';
  // Alcobas de las Cámaras, por parada del anillo (las de Orgánica II sin prefijo, las demás 'ana.', 'fq.', 'fis.').
  // jars/crystals = cuántos sprites trae el arte (tools/aprender-pasillo/export_app.py, CAMARAS); si una clase gana misiones,
  // hay que volver a exportar (lo vigila tools/aprender-test.cjs). Una alcoba sin clases queda con sus cristales apagados.
  const ALCOVES = {
    c0: { ramo: 'organica', id: 'aminas', name: 'Aminas', classes: ['org-01'], jars: 8, crystals: 6 },
    c60: { ramo: 'organica', id: 'aromaticos', name: 'Aromáticos', classes: ['org-04', 'org-05'], jars: 6, crystals: 5 },
    'c-60': { ramo: 'organica', id: 'heterociclos', name: 'Heterociclos', classes: [], jars: 0, crystals: 4 },
    'ana.c0': { ramo: 'analitica', id: 'ana_errores', name: 'Errores', classes: ['ana-01'], jars: 2, crystals: 4 },
    'ana.c60': { ramo: 'analitica', id: 'ana_acidobase', name: 'Ácido-base', classes: ['ana-02', 'ana-03'], jars: 4, crystals: 5 },
    'ana.c-60': { ramo: 'analitica', id: 'ana_polipro', name: 'Polipróticos', classes: [], jars: 0, crystals: 4 },
    'fq.c0': { ramo: 'fisico', id: 'fq_equilibrio', name: 'Equilibrio', classes: ['fq-01'], jars: 4, crystals: 5 },
    'fq.c60': { ramo: 'fisico', id: 'fq_ionico', name: 'Electrolitos', classes: [], jars: 0, crystals: 4 },
    'fq.c-60': { ramo: 'fisico', id: 'fq_pila', name: 'Electroquímica', classes: [], jars: 0, crystals: 4 },
    'fis.c0': { ramo: 'fisio', id: 'fisio_potencial', name: 'Nervioso', classes: ['fis-01', 'fis-02'], jars: 4, crystals: 5 },
    'fis.c60': { ramo: 'fisio', id: 'fisio_resp', name: 'Respiratorio', classes: ['fis-06'], jars: 2, crystals: 4 },
    'fis.c-60': { ramo: 'fisio', id: 'fisio_digest', name: 'Digestivo', classes: ['fis-09'], jars: 2, crystals: 4 }
  };
  // Las vistas de mesa (cz0, ana.cz60…) muestran la misma alcoba que su parada del anillo.
  const alcoveOf = node => ALCOVES[node] || ALCOVES[String(node).replace('cz', 'c')] || null;

  // 0 = vacío … 4 = lleno. Cualquier avance se nota (mínimo 1) y solo está lleno cuando se respondió todo.
  const level = (done, total) => !done ? 0 : done >= total ? 4 : Math.min(3, Math.max(1, Math.round(done / total * 4)));

  // Reparte n conceptos en k cristales seguidos (los primeros reciben el resto).
  const chunks = (list, k) => {
    const base = Math.floor(list.length / k), extra = list.length % k, out = [];
    let at = 0;
    for (let i = 0; i < k; i++) { const size = base + (i < extra ? 1 : 0); out.push(list.slice(at, at + size)); at += size; }
    return out;
  };

  // Estado de un concepto según su hoja: 'review' (toca repasar), null (sin empezar) o 'ok'.
  const conceptState = leaf => !leaf || leaf.shown === 'semilla' ? null : leaf.shown === 'seca' ? 'review' : 'ok';

  /* Frascos (una por misión) y cristales (uno por grupo de conceptos) de una alcoba.
     env: { classes: window.NexoClasses, NX: NexoClassroom, E: NexoClassEvidence, state } */
  function alcove(alcoveDef, env) {
    const { classes, NX, E, state } = env;
    const jars = [], concepts = [];
    for (const id of alcoveDef.classes) {
      const cls = classes?.[id];
      if (!cls || !NX) continue;
      const answers = state.classSessions?.[id]?.answers || {};
      const leaves = E ? E.leaves(cls, E.storeFor(state, id)) : {};
      for (const m of cls.missions) {
        const items = NX.itemsOf(m), done = items.filter(({ item }) => answers[item.id]).length;
        jars.push({ classId: id, missionId: m.id, title: m.title, done, total: items.length, level: level(done, items.length) });
      }
      for (const c of cls.concepts || []) if (!c.root) concepts.push({ classId: id, id: c.id, title: c.title, state: conceptState(leaves[c.id]) });
    }
    const crystals = chunks(concepts, alcoveDef.crystals).map(group => ({
      concepts: group,
      state: group.some(c => c.state === 'review') ? 0 : group.some(c => c.state === 'ok') ? 1 : null
    }));
    return {
      ...alcoveDef, jars, crystals, ready: jars.length > 0 || alcoveDef.classes.length === 0,
      inProgress: jars.filter(j => j.done > 0).length, reviews: concepts.filter(c => c.state === 'review').length
    };
  }

  // Frase corta con el estado de una alcoba (para la ficha y para lectores de pantalla).
  function summary(a) {
    if (!a.classes.length) return 'Todavía no tiene clase propia.';
    if (!a.jars.length) return 'Cargando tu progreso…';
    const parts = [`${a.inProgress} de ${a.jars.length} misiones en marcha`];
    parts.push(a.reviews ? `${a.reviews} ${a.reviews === 1 ? 'concepto' : 'conceptos'} por repasar` : 'nada por repasar');
    return parts.join(' · ');
  }

  window.NexoAprenderEstado = { ALCOVES, alcoveOf, level, chunks, conceptState, alcove, summary };
})();
