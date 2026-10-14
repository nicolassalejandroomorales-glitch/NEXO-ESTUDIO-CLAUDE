/* Organización · Notas (UPDATE 02, Fase 2). Módulo puro (sin pantalla): se prueba con node (tools/notas-test.cjs).
   Usa NexoGrades.calculate para las cuentas y agrega: cuánto necesitas, simulador, riesgo de examen/reprobar según las reglas
   de cada ramo (docs/update-02-organizacion/DATOS-RAMOS.md), promedio general simple e inasistencias.
   Chile: la nota 3,95 se redondea a 4,0, por eso el umbral de aprobar es 3,95. Nunca declara dominio: solo hace cuentas. */
(function (root) {
  'use strict';
  const PASS = 3.95;
  const num = v => { const n = Number(String(v ?? '').trim().replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
  const known = c => { const n = num(c.grade); return c.grade !== '' && n >= 1 && n <= 7 ? n : null; };
  const fmt = (n, d = 1) => Number.isFinite(n) ? n.toFixed(d).replace('.', ',') : '—';
  const ceil1 = n => Math.ceil(n * 10 - 1e-9) / 10;                 // con ese número alcanza
  const level = n => n === null || n === undefined ? 'vacio' : n < 3.95 ? 'rojo' : n < 5 ? 'ambar' : 'verde';
  const G = () => root.NexoGrades;

  // ——— Resultado por parte (teoría / lab) con lo que hace falta ———
  function groups(config) {
    const calc = G().calculate(config, 'theory');
    const out = {};
    for (const g of calc.groupResults) {
      const comps = (config.components || []).filter(c => c.group === g.id && num(c.weight) > 0);
      const done = comps.filter(c => known(c) !== null), pend = comps.filter(c => known(c) === null);
      const full = Math.abs(g.totalWeight - 100) < .01;
      const points = done.reduce((s, c) => s + num(c.weight) * known(c), 0);
      const goal = Number(config.target) > 4 ? Number(config.target) : PASS;
      const required = full && g.pendingWeight > .0001 ? (goal * 100 - points) / g.pendingWeight : null;
      let status = 'sin-datos';
      if (!full) status = 'falta-pesos';
      else if (g.pendingWeight <= .0001) status = g.grade >= PASS ? 'aprobada' : 'reprobada';
      else if (required > 7.0001) status = 'imposible';
      else if (required <= 1) status = 'asegurada';
      else if (required > 5.5) status = 'ajustado';
      else status = done.length ? 'en-camino' : 'sin-datos';
      out[g.id] = { id: g.id, name: g.name, courseWeight: g.courseWeight, minimum: g.minimum, total: g.totalWeight, knownWeight: g.knownWeight,
        pendingWeight: g.pendingWeight, current: g.current, grade: g.grade, required, need: required === null ? null : ceil1(Math.max(1, required)),
        goal, status, comps, done, pend };
    }
    return out;
  }

  // ——— Riesgo de examen / reprobar, según el programa de cada ramo ———
  const chip = (tone, text) => ({ tone, text });
  const names = list => list.map(c => c.name).join(', ');
  const RULES = {
    organica(g, cfg) {
      const out = [], th = g.theory, lab = g.lab;
      const red = th.comps.filter(c => /^PEP/i.test(c.name) && known(c) !== null && known(c) < PASS);
      if (th.grade !== null) {
        if (th.grade < 3.4) out.push(chip('risk', 'Cátedra bajo 3,4: se reprueba sin prueba final.'));
        else if (th.grade < PASS || red.length) out.push(chip('warn', 'Cátedra en zona de prueba final (PF): reemplaza tu PEP más baja.'));
        else out.push(chip('ok', 'Cátedra aprobada.'));
      } else if (red.length) out.push(chip('warn', `${names(red)} bajo 4,0: rendirías la prueba final (PF), que reemplaza tu PEP más baja.`));
      else if (th.status === 'imposible') out.push(chip('risk', 'Con lo que queda ya no se llega a 4,0 en cátedra: habría que ir a prueba final.'));
      if (lab.grade !== null) out.push(lab.grade < PASS ? chip('risk', 'Laboratorio reprobado: la nota final del ramo sería la del laboratorio (no se promedia).') : chip('ok', 'Laboratorio aprobado.'));
      else if (lab.status === 'imposible') out.push(chip('risk', 'Con lo que queda ya no se llega a 4,0 en laboratorio.'));
      return out;
    },
    fisico(g) {
      const out = [], th = g.theory, lab = g.lab;
      if (th.grade !== null) out.push(th.grade < PASS ? chip('warn', 'Cátedra bajo 4,0: examen (vale 40 % de la nota final y entra todo).') : chip('ok', 'Cátedra aprobada, sin examen.'));
      else if (th.status === 'imposible') out.push(chip('risk', 'Con lo que queda ya no se llega a 4,0 en cátedra: irías a examen.'));
      const ciclo = lab.comps.find(c => /prueba de ciclo/i.test(c.name));
      if (ciclo && known(ciclo) !== null && known(ciclo) < PASS) out.push(chip('warn', 'Prueba de ciclo roja: rindes examen de laboratorio (40 %, 13-01-2027).'));
      else if (lab.grade !== null) out.push(lab.grade < PASS ? chip('risk', 'Laboratorio reprobado.') : chip('ok', 'Laboratorio aprobado.'));
      return out;
    },
    analitica(g) {
      const out = [], th = g.theory, lab = g.lab;
      const peps = th.comps.filter(c => /^PEP/i.test(c.name)), kn = peps.filter(c => known(c) !== null);
      const red = kn.filter(c => known(c) < PASS);
      if (red.length) out.push(chip('warn', `${names(red)} bajo 4,0: sin eximición. Con promedio entre 3,5 y 4,0 tendrías derecho a examen (40 %).`));
      else if (kn.length === peps.length && peps.length) out.push(chip('ok', 'Eximido: todas tus PEP son 4,0 o más.'));
      else if (kn.length) out.push(chip('info', 'Para eximirte necesitas 4,0 o más en cada PEP.'));
      if (th.grade !== null) {
        if (th.grade < 3.5) out.push(chip('risk', 'Promedio bajo 3,5: sin derecho a examen.'));
        else if (th.grade < PASS) out.push(chip('warn', 'Promedio entre 3,5 y 4,0: tienes derecho a examen (40 %).'));
        else out.push(chip('ok', 'Teoría aprobada.'));
      }
      if (lab.grade !== null) out.push(lab.grade < PASS ? chip('risk', 'Laboratorio reprobado: se aprueba por separado.') : chip('ok', 'Laboratorio aprobado.'));
      return out;
    },
    fisio(g, cfg) {
      const out = [], th = g.theory;
      const pts = th.done.reduce((s, c) => s + num(c.weight) * known(c), 0);
      if (th.grade !== null) out.push(th.grade >= 4.5 ? chip('ok', 'Eximido del examen (4,5 o más).') : th.grade >= PASS ? chip('info', 'Cátedra aprobada, pero bajo 4,5: rindes el examen (15-01-2027).') : chip('risk', 'PEP bajo 4,0: la cátedra debe aprobarse para aprobar el curso.'));
      else if (th.total > 99.99 && th.pendingWeight > 0) {
        const n = (450 - pts) / th.pendingWeight;
        out.push(n > 7 ? chip('info', 'Eximirte (4,5) ya no es posible: rendirías el examen.') : chip('info', `Para eximirte del examen necesitas ${fmt(ceil1(Math.max(1, n)))} en lo que queda de PEP.`));
      }
      return out;
    }
  };

  /* Estado de un ramo: grupos, avisos de riesgo, "llevas" (con lo evaluado) y nota final si ya están todas. */
  function evaluate(subjectId, config) {
    const g = groups(config);
    const chips = (RULES[subjectId] ? RULES[subjectId](g, config) : []).slice();
    const gs = Object.values(g).filter(x => x.courseWeight !== null);
    const withCur = gs.filter(x => x.current !== null);
    const w = withCur.reduce((s, x) => s + x.courseWeight, 0);
    const llevas = w ? withCur.reduce((s, x) => s + x.current * x.courseWeight, 0) / w : null;
    const final = gs.length && gs.every(x => x.grade !== null) ? gs.reduce((s, x) => s + x.grade * x.courseWeight, 0) / gs.reduce((s, x) => s + x.courseWeight, 0) : null;
    const worst = chips.some(c => c.tone === 'risk') ? 'risk' : chips.some(c => c.tone === 'warn') ? 'warn' : chips.some(c => c.tone === 'ok') ? 'ok' : 'none';
    return { groups: g, chips, llevas, final, worst };
  }

  /* ¿Y si me saco X en todo lo que falta de esta parte? (no toca tus datos: trabaja sobre una copia) */
  function simulate(subjectId, config, groupId, x) {
    const copy = JSON.parse(JSON.stringify(config));
    const val = Math.max(1, Math.min(7, num(x)));
    copy.components.forEach(c => { if (c.group === groupId && num(c.weight) > 0 && known(c) === null) c.grade = val.toFixed(2); });
    const r = evaluate(subjectId, copy);
    return { value: val, group: r.groups[groupId], chips: r.chips, llevas: r.llevas, final: r.final };
  }

  /* Promedio general del semestre: simple (todos los ramos valen igual). `ramos` = [{id, ev}] con ev = evaluate(). */
  function overall(evals) {
    const withFinal = evals.filter(e => e.final !== null), withLlevas = evals.filter(e => e.llevas !== null);
    const avg = list => list.length ? list.reduce((s, v) => s + v, 0) / list.length : null;
    return { llevas: avg(withLlevas.map(e => e.llevas)), final: withFinal.length === evals.length && evals.length ? avg(withFinal.map(e => e.final)) : null,
      ramos: withLlevas.length };
  }

  /* Inasistencias: cuántas llevas y cuántas te quedan contra el máximo que tú pones.
     strict = "100 % de asistencia" (labs de Orgánica y FQ): cada falta se recupera con justificación. */
  const STRICT = { organica: { lab: true }, fisico: { lab: true } };
  function attendance(absences, subjectId, maxes = {}) {
    const out = {};
    for (const gid of ['theory', 'lab']) {
      const count = (absences || []).filter(a => a.subject === subjectId && (a.group === 'lab' ? 'lab' : 'theory') === gid).length;
      const raw = maxes?.[subjectId]?.[gid];
      const max = raw === undefined || raw === '' || raw === null ? null : Math.max(0, Math.floor(Number(raw)));
      const strict = !!STRICT[subjectId]?.[gid];
      let state = 'sin-maximo', left = null;
      if (strict && max === null) state = count ? 'estricto-falta' : 'estricto';
      else if (max !== null) { left = max - count; state = left < 0 ? 'pasado' : left === 0 ? 'limite' : left === 1 ? 'queda-1' : 'ok'; }
      out[gid] = { group: gid, count, max, left, strict, state };
    }
    return out;
  }

  /* Calibración: ¿qué tan cerca estimas tu nota? (promedio de |estimada − real| con las que tienen ambas) */
  function calibration(configs) {
    const pairs = [];
    for (const cfg of configs) for (const c of cfg.components || []) {
      const e = num(c.estimate), r = known(c);
      if (c.estimate !== undefined && c.estimate !== '' && Number.isFinite(e) && r !== null) pairs.push({ name: c.name, estimate: e, real: r, diff: e - r });
    }
    const mean = pairs.length ? pairs.reduce((s, p) => s + p.diff, 0) / pairs.length : null;
    return { pairs, mean };
  }

  root.NexoGradeRules = Object.freeze({ PASS, num, known, fmt, ceil1, level, groups, evaluate, simulate, overall, attendance, calibration });
  if (typeof module !== 'undefined') module.exports = root.NexoGradeRules;
})(typeof window !== 'undefined' ? window : globalThis);
