/* Pantalla de entrada de Nexo (docs/cuentas/SPEC.md): antes del tutorial, el Grimorio ofrece guardar el progreso con Google
   o seguir como invitado. Se carga solo cuando app.js la pide (ruta #/entrada). Reutiliza el arte y el estilo del tutorial. */
(function () {
  const HERE = document.currentScript?.src || new URL('cuentas/entrada.js', document.baseURI).href;
  const TEXTO = 'Antes de abrir la torre: si entras con Google, tu mascota, tus notas y tus repasos te siguen a cualquier celular. Si prefieres no hacerlo, pasa igual; solo que todo queda guardado en este navegador.';
  let cssLoaded = false, magiaLoading = null;

  function ensureCss() {
    if (cssLoaded) return; cssLoaded = true;
    for (const f of ['../tutorial/tutorial.css?v=16', './entrada.css?v=1']) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL(f, HERE).href; document.head.append(l);
    }
  }
  // Mismo fondo mágico que el tutorial (runas, luciérnagas, hojas).
  function ensureMagia() {
    if (window.NexoMagia) return Promise.resolve(window.NexoMagia);
    magiaLoading = magiaLoading || new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = new URL('../tutorial/magia.js?v=4', HERE).href; s.onload = () => ok(window.NexoMagia); s.onerror = fail; document.head.append(s);
    });
    return magiaLoading;
  }

  // opts.google(): abre el inicio de sesión de Google (promesa); opts.guest(): sigue como invitado.
  function render(app, opts) {
    ensureCss();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    app.innerHTML = '';
    const root = document.createElement('section');
    root.className = 'tut ent';
    root.innerHTML = `
      <div class="ent-title"><h1>NEXO</h1><p>Tu torre de estudio</p></div>
      <div class="tut-talk">
        <div class="tut-grim" aria-hidden="true"></div>
        <div class="tut-box"><div class="tut-tag">Grimorio</div><p class="tut-text" aria-live="polite"></p></div>
      </div>
      <p class="tut-err" role="alert"></p>
      <div class="ent-actions">
        <button class="primary-btn ent-google" type="button">Continuar con Google</button>
        <button class="secondary-btn ent-guest" type="button">Seguir como invitado</button>
      </div>`;
    app.append(root);
    ensureMagia().then(M => { if (root.isConnected) M.mount(root); }).catch(() => {});

    const small = innerWidth < 700;
    root.style.setProperty('--s', small ? 2 : 4);
    const grim = root.querySelector('.tut-grim'), text = root.querySelector('.tut-text'), err = root.querySelector('.tut-err');
    const google = root.querySelector('.ent-google'), guest = root.querySelector('.ent-guest');

    grim.innerHTML = '<i class="tut-llama l"></i><i class="tut-llama r"></i>';
    let vivo = null, boca = 0;
    const draw = col => { boca = col; if (vivo) vivo.mouth(col); };
    Promise.resolve().then(() => window.NexoLoader.script(new URL('../tutorial/grimorio-vivo.js?v=3', HERE).href)).then(() => {
      if (!root.isConnected) return;
      vivo = window.NexoGrimorioVivo.mount(grim); vivo.set('feliz'); vivo.mouth(boca); vivo.talk(!!timer);
    }).catch(() => {});

    // Máquina de escribir: la boca del Grimorio se abre y se cierra mientras habla. Un toque en el cuadro la termina.
    let timer = 0, i = 0;
    const stop = () => { clearInterval(timer); text.textContent = TEXTO; draw(0); if (vivo) vivo.talk(false); };
    if (reduced) text.textContent = TEXTO;
    else timer = setInterval(() => {
      i += 2; text.textContent = TEXTO.slice(0, i); draw(1 + (i / 2) % 2);
      if (i >= TEXTO.length) stop();
    }, 32);
    root.querySelector('.tut-box').addEventListener('click', stop);

    google.addEventListener('click', async () => {
      stop(); err.textContent = ''; google.disabled = guest.disabled = true; google.textContent = 'Abriendo Google…';
      try { await opts.google(); }
      catch (e) { err.textContent = 'No pude abrir Google. Revisa tu conexión o sigue como invitado.'; google.disabled = guest.disabled = false; google.textContent = 'Continuar con Google'; }
    });
    guest.addEventListener('click', () => { clearInterval(timer); opts.guest(); });
    google.focus({ preventScroll: true });
  }

  window.NexoEntrada = { render };
})();
