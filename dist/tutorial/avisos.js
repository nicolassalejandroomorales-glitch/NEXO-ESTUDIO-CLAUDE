/* Avisos del Grimorio (docs/tutorial/SPEC.md): globo chico en la esquina, sin oscurecer la app.
   1) «Primera vez en cada sección»: solo si el tutorial se saltó (si lo hiciste completo no se repite).
   2) Novedades: lista con versión. Para avisar algo nuevo, agrega un objeto a NEWS (el id sube de 1 en 1).
   Se carga perezosamente desde app.js (checkAvisos). Estado en state.tutorial: sections {clases:true…} y news (último id visto). */
(() => {
  'use strict';
  const HERE = document.currentScript?.src || new URL('tutorial/avisos.js', document.baseURI).href;

  const SECTION_OF = { learn: 'clases', subjects: 'clases', subject: 'clases', library: 'clases', knowledge: 'clases',
    games: 'juegos', hub: 'organizacion', planner: 'organizacion', profile: 'perfil', stats: 'perfil', mascot: 'perfil', settings: 'perfil' };
  const SECTIONS = {
    clases: { pose: 'dedo', title: 'Clases y ruta al 7', text: 'Aquí está tu ruta al 7. Responde antes de mirar: acertar sin ayuda da dominio de verdad, releer solo da sensación de dominio. Y si fallas, la ruta se ajusta.' },
    juegos: { pose: 'abrir', title: 'Juegos', text: 'Esta es la campaña Camino a la PEP 1, con jefes y desafíos. Aquí ganas monedas para la tienda del refugio. Jugar te obliga a recordar sin mirar, y eso funciona.' },
    organizacion: { pose: 'senalar', title: 'Organización', text: 'Calendario, prioridades, notas y labs. Con tus fechas de pruebas te digo qué estudiar primero.' },
    perfil: { pose: 'importante', title: 'Perfil', text: 'Tu mascota, estadísticas y rangos arcanos: subes por evidencia, no por tiempo sentado. En Ajustes puedes volver a verme.' }
  };
  // Novedades futuras: { id: 1, pose: 'sorprendido', title: '…', text: '…' }. El id siempre sube.
  const NEWS = [];
  const VERSION = NEWS.reduce((m, n) => Math.max(m, n.id), 0);

  let cssLoaded = false, current = null;
  function ensureCss() {
    if (cssLoaded) return; cssLoaded = true;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('./avisos.css?v=2', HERE).href; document.head.append(l);
  }
  function close() { current?.remove(); current = null; }

  function show({ pose, title, text }, done) {
    ensureCss(); close();
    const box = document.createElement('aside');
    box.className = 'nx-aviso'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<div class="nx-aviso-grim"></div><div class="nx-aviso-body"><b></b><p></p><button class="secondary-btn" type="button">Entendido</button></div>';
    const g = box.querySelector('.nx-aviso-grim');
    Promise.resolve().then(() => window.NexoLoader.script(new URL('./grimorio-vivo.js?v=3', HERE).href)).then(() => { if (box.isConnected) window.NexoGrimorioVivo.mount(g).set(pose); }).catch(() => {});
    box.querySelector('b').textContent = title;
    box.querySelector('p').textContent = text;
    box.querySelector('button').addEventListener('click', () => { close(); done(); });
    document.body.append(box); current = box;
  }

  // route = ['games'] etc.; tu = state.tutorial; save() guarda el estado.
  function check(route, tu, save) {
    close();
    if (!tu || tu.status === 'pending' || route[0] === 'tutorial') return;
    const sec = SECTION_OF[route[0]];
    if (sec && tu.status === 'skipped' && !(tu.sections && tu.sections[sec])) {
      show(SECTIONS[sec], () => { tu.sections = { ...(tu.sections || {}), [sec]: true }; save(); });
      return;
    }
    if (route[0] === 'home') {
      const n = NEWS.filter(x => x.id > (tu.news || 0)).sort((a, b) => a.id - b.id)[0];
      if (n) show(n, () => { tu.news = n.id; save(); });
    }
  }

  window.NexoAvisos = { check, VERSION, SECTIONS, NEWS };
})();
