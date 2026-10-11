/* Química de las moléculas que dibuja el estudiante (docs/clase-viva/DISENO.md §9).
   Una molécula es un grafo: átomos { id, el, x, y, q } y enlaces { a, b, o } (o = 1, 2 o 3).
   Los H unidos a C, N u O van implícitos (se calculan por valencia), como se escribe en química orgánica.
   Sin pantalla: el editor (editor.js) dibuja; aquí se valida, se compara y se explica el error.
   La prueba tools/molecule-test.cjs contrasta estas reglas con RDKit. */
(() => {
  'use strict';
  const BASE = { C: 4, N: 3, O: 2, S: 2, P: 3, F: 1, Cl: 1, Br: 1, I: 1, B: 3, H: 1 };
  const NAME = { C: 'carbono', N: 'nitrógeno', O: 'oxígeno', S: 'azufre', P: 'fósforo', F: 'flúor', Cl: 'cloro', Br: 'bromo', I: 'yodo', B: 'boro', H: 'hidrógeno' };
  const MASS = { C: 12.011, H: 1.008, N: 14.007, O: 15.999, S: 32.06, P: 30.974, F: 18.998, Cl: 35.45, Br: 79.904, I: 126.9, B: 10.81 };

  /* Enlaces que puede formar un átomo según su carga: N⁺ y O⁺ forman uno más (amonio, oxonio); C⁺ y C⁻ uno menos. */
  function valence(el, q = 0) {
    const v = BASE[el] ?? 4;
    if (el === 'N' || el === 'O' || el === 'S' || el === 'P') return v + q;
    if (el === 'B') return v - q;
    return v - Math.abs(q);
  }
  const atomById = (g, id) => g.atoms.find(a => a.id === id);
  const bondsOf = (g, id) => g.bonds.filter(b => b.a === id || b.b === id);
  const bondSum = (g, id) => bondsOf(g, id).reduce((sum, b) => sum + (b.o || 1), 0);
  const implicitH = (g, atom) => atom.el === 'H' ? 0 : Math.max(0, valence(atom.el, atom.q || 0) - bondSum(g, atom.id));

  /* Átomos imposibles: más enlaces de los que su valencia permite. */
  function problems(g) {
    return g.atoms.filter(a => bondSum(g, a.id) > valence(a.el, a.q || 0)).map(a => ({
      atom: a.id, kind: 'over',
      message: `Este ${NAME[a.el] || a.el} tiene ${bondSum(g, a.id)} enlaces: ${a.q ? 'con esa carga' : 'un ' + (NAME[a.el] || a.el)} solo puede tener ${valence(a.el, a.q || 0)}.`
    }));
  }

  /* H explícitos con un solo enlace simple se pasan a implícitos: así "N–H" dibujado y "NH" escrito son lo mismo. */
  function normalize(g) {
    const atoms = g.atoms.map(a => ({ ...a, q: Number(a.q) || 0 })), bonds = g.bonds.map(b => ({ ...b, o: Number(b.o) || 1 }));
    const drop = new Set(atoms.filter(a => a.el === 'H' && !a.q).filter(a => { const bs = bonds.filter(b => b.a === a.id || b.b === a.id);
      return bs.length === 1 && bs[0].o === 1 && atoms.find(x => x.id === (bs[0].a === a.id ? bs[0].b : bs[0].a))?.el !== 'H'; }).map(a => a.id));
    return { atoms: atoms.filter(a => !drop.has(a.id)), bonds: bonds.filter(b => !drop.has(b.a) && !drop.has(b.b)) };
  }

  function formula(g) {
    const n = normalize(g), out = {};
    for (const a of n.atoms) { out[a.el] = (out[a.el] || 0) + 1; const h = implicitH(n, a); if (h) out.H = (out.H || 0) + h; }
    return out;
  }
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  function formulaText(f) {
    const keys = Object.keys(f).sort((a, b) => (a === 'C' ? -2 : a === 'H' ? -1 : 0) - (b === 'C' ? -2 : b === 'H' ? -1 : 0) || a.localeCompare(b));
    return keys.map(k => k + (f[k] > 1 ? String(f[k]).replace(/\d/g, d => SUB[d]) : '')).join('');
  }
  const charge = g => g.atoms.reduce((s, a) => s + (Number(a.q) || 0), 0);
  const mass = g => Object.entries(formula(g)).reduce((s, [el, n]) => s + (MASS[el] || 0) * n, 0);

  function fragments(g) {
    const seen = new Set(); let count = 0;
    for (const a of g.atoms) { if (seen.has(a.id)) continue; count++; const stack = [a.id];
      while (stack.length) { const id = stack.pop(); if (seen.has(id)) continue; seen.add(id);
        for (const b of bondsOf(g, id)) stack.push(b.a === id ? b.b : b.a); } }
    return count;
  }

  /* ¿Son la misma molécula? Isomorfismo de grafos (elemento, carga, enlaces y su orden), con H implícitos. */
  function same(g1, g2) {
    const A = normalize(g1), B = normalize(g2);
    if (A.atoms.length !== B.atoms.length || A.bonds.length !== B.bonds.length) return false;
    if (problems(A).length || problems(B).length) return false;
    const label = (g, a) => `${a.el}|${a.q}|${bondsOf(g, a.id).length}|${bondSum(g, a.id)}`;
    const la = new Map(A.atoms.map(a => [a.id, label(A, a)])), lb = new Map(B.atoms.map(a => [a.id, label(B, a)]));
    const count = m => [...m.values()].sort().join(',');
    if (count(la) !== count(lb)) return false;
    const order = (g, id1, id2) => g.bonds.find(b => (b.a === id1 && b.b === id2) || (b.a === id2 && b.b === id1))?.o || 0;
    // Recorrido por vecindad para que la búsqueda pode temprano
    const seq = [], seen = new Set();
    for (const start of A.atoms) { if (seen.has(start.id)) continue; const queue = [start.id];
      while (queue.length) { const id = queue.shift(); if (seen.has(id)) continue; seen.add(id); seq.push(id);
        for (const b of bondsOf(A, id)) queue.push(b.a === id ? b.b : b.a); } }
    const map = new Map(), used = new Set();
    const ok = i => {
      if (i === seq.length) return true;
      const id = seq[i];
      for (const cand of B.atoms) {
        if (used.has(cand.id) || lb.get(cand.id) !== la.get(id)) continue;
        let fits = true;
        for (const [mid, mcand] of map) if (order(A, id, mid) !== order(B, cand.id, mcand)) { fits = false; break; }
        if (!fits) continue;
        map.set(id, cand.id); used.add(cand.id);
        if (ok(i + 1)) return true;
        map.delete(id); used.delete(cand.id);
      }
      return false;
    };
    return ok(0);
  }

  /* Explica en qué se diferencia el dibujo de la respuesta, sin regalarla. */
  function diff(student, target) {
    const S = normalize(student), T = normalize(target);
    const probs = problems(S);
    if (!S.atoms.length) return { message: 'Todavía no dibujas nada.', suspects: [] };
    if (probs.length) return { message: probs[0].message, suspects: probs.map(p => p.atom), kind: 'valence' };
    if (same(S, T)) return { message: '', suspects: [], kind: 'same' };
    if (fragments(S) > fragments(T)) return { message: 'Tu dibujo tiene piezas sueltas: todo lo que forma la molécula debe estar unido.', suspects: [], kind: 'pieces' };
    const fs = formula(S), ft = formula(T), missing = [], extra = [];
    for (const el of new Set([...Object.keys(fs), ...Object.keys(ft)])) {
      const d = (ft[el] || 0) - (fs[el] || 0);
      if (d > 0) missing.push([el, d]); if (d < 0) extra.push([el, -d]);
    }
    const heavy = ([el]) => el !== 'H';
    const say = ([el, n]) => `${n === 1 ? 'un' : n} ${n === 1 ? (NAME[el] || el) : (NAME[el] || el) + (/[aeiou]$/.test(NAME[el] || '') ? 's' : 'es')}`;
    if (missing.filter(heavy).length || extra.filter(heavy).length) {
      const parts = [];
      const many = list => list.length > 1 || list[0][1] > 1;
      const mh = missing.filter(heavy), eh = extra.filter(heavy);
      if (mh.length) parts.push(`te ${many(mh) ? 'faltan' : 'falta'} ${mh.map(say).join(' y ')}`);
      if (eh.length) parts.push(`te ${many(eh) ? 'sobran' : 'sobra'} ${eh.map(say).join(' y ')}`);
      return { message: `Cuenta los átomos: ${parts.join(', y ')}. La respuesta es ${formulaText(ft)}; tu dibujo es ${formulaText(fs)}.`, suspects: [], kind: 'formula' };
    }
    if (charge(S) !== charge(T)) return { message: `Revisa las cargas: la carga total debería ser ${charge(T) > 0 ? '+' : ''}${charge(T)} y la tuya es ${charge(S) > 0 ? '+' : ''}${charge(S)}. Recuerda: carga formal = electrones de valencia − electrones sin enlazar − enlaces.`, suspects: S.atoms.filter(a => a.q).map(a => a.id), kind: 'charge' };
    // Mismos átomos, conectados distinto: se marcan los átomos cuyo entorno no existe en la respuesta.
    const env = (g, a) => `${a.el}${a.q}:` + bondsOf(g, a.id).map(b => { const o = atomById(g, b.a === a.id ? b.b : b.a); return `${o.el}${b.o}`; }).sort().join(',');
    const pool = T.atoms.map(a => env(T, a)), suspects = [];
    for (const a of S.atoms) { const e = env(S, a), i = pool.indexOf(e); if (i >= 0) pool.splice(i, 1); else suspects.push(a.id); }
    const orderDiff = S.bonds.reduce((s, b) => s + b.o, 0) !== T.bonds.reduce((s, b) => s + b.o, 0);
    return { message: orderDiff ? 'Están todos los átomos, pero revisa los enlaces dobles y simples (los marqué).'
      : 'Están todos los átomos, pero algo está unido en otro lugar. Revisa los átomos marcados: ¿a quién debería estar pegado cada uno?', suspects, kind: 'connect' };
  }

  /* Formato MOL (V2000) para que RDKit revise la molécula en las pruebas. */
  function toMolblock(g) {
    const n = normalize(g), idx = new Map(n.atoms.map((a, i) => [a.id, i + 1]));
    const pad = (v, w) => String(v).padStart(w), f = v => (v / 40).toFixed(4).padStart(10);
    const lines = ['', '  NexoMol', '', `${pad(n.atoms.length, 3)}${pad(n.bonds.length, 3)}  0  0  0  0  0  0  0  0999 V2000`];
    for (const a of n.atoms) lines.push(`${f(a.x || 0)}${f(-(a.y || 0))}    0.0000 ${a.el.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`);
    for (const b of n.bonds) lines.push(`${pad(idx.get(b.a), 3)}${pad(idx.get(b.b), 3)}${pad(b.o, 3)}  0`);
    const charged = n.atoms.filter(a => a.q);
    if (charged.length) lines.push(`M  CHG${pad(charged.length, 3)}` + charged.map(a => ` ${pad(idx.get(a.id), 3)} ${pad(a.q, 3)}`).join(''));
    lines.push('M  END');
    return lines.join('\n');
  }

  window.NexoMolecule = { BASE, NAME, valence, bondSum, implicitH, problems, normalize, formula, formulaText, charge, mass, fragments, same, diff, toMolblock, atomById, bondsOf };
})();
