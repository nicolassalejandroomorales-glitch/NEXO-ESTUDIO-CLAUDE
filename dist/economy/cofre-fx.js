/* Apertura del cofre (docs/economia/SPEC.md): el cofre del alquimista tiembla, las raíces lo sueltan, la tapa salta con luz del color
   de la rareza y el objeto sube flotando. Solo pinta y anima; la lógica está en tienda.js.
   NexoCofre.play({ winner, ids, tile, reduced, title, note, again }) -> Promise<'again' | 'close'> */
(() => {
  'use strict';
  const ART = './assets/tienda/';
  const COLORS = {
    comun: ['#e6d6b2', '#b9a98a', '#fff4d8'], poco: ['#b2cf5c', '#6cc08b', '#e2ee8a'],
    raro: ['#9ce8f0', '#6aa7ff', '#e0fcff'], legendario: ['#ffd860', '#f2b84b', '#fffce8']
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function burst(canvas, rarity, count, until) {
    const ctx = canvas.getContext('2d'), cols = COLORS[rarity], w = canvas.width, h = canvas.height;
    const parts = Array.from({ length: count }, () => {
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = 2 + Math.random() * 6;
      return { x: w / 2, y: h * .52, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 40 + Math.random() * 40, s: 3 + Math.floor(Math.random() * 3) * 2, c: cols[Math.floor(Math.random() * cols.length)] };
    });
    (function frame() {
      if (!canvas.isConnected) return;
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      parts.forEach(p => {
        if (p.life-- <= 0) return;
        alive = true; p.x += p.vx; p.y += p.vy; p.vy += .22; p.vx *= .985;
        ctx.globalAlpha = Math.min(1, p.life / 20); ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x / 3) * 3, Math.round(p.y / 3) * 3, p.s, p.s);
      });
      if (alive || performance.now() < until) requestAnimationFrame(frame);
    })();
  }

  const TILES = 62, WIN_AT = 52;
  const ease = x => 1 - Math.pow(1 - x, 4.2);

  /* winner: {id, rarity}; ids: [{id, rarity}] para rellenar la ruleta; tile(id) -> <canvas> del accesorio. */
  async function play({ winner, ids, tile, reduced = false, title = '', note = '', again = false }) {
    const rarity = winner.rarity, big = rarity === 'raro' || rarity === 'legendario';
    const el = document.createElement('div');
    el.className = 'cofre-fx'; el.dataset.rarity = rarity;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Abriendo cofre');
    el.innerHTML = `<div class="cofre-fx-flash"></div><div class="cofre-fx-rays"></div><canvas class="cofre-fx-parts" width="480" height="360"></canvas>
      <div class="cofre-fx-stage"><div class="cofre-fx-chest"><div class="cfx-glow"></div><i class="cfx-body"></i><i class="cfx-lid"></i></div></div>
      <div class="cofre-fx-roulette pu-panel" hidden><div class="cfx-window"><div class="cfx-strip"></div><i class="cfx-marker"></i></div></div>
      <div class="cofre-fx-card pu-paper" hidden><p class="cfx-title"></p><p class="cfx-note"></p><div class="cfx-actions"></div></div>`;
    document.body.append(el);
    const $ = s => el.querySelector(s), chest = $('.cofre-fx-chest'), roulette = $('.cofre-fx-roulette'), strip = $('.cfx-strip'), card = $('.cofre-fx-card'), parts = $('.cofre-fx-parts');
    const mk = (item, win) => { const d = document.createElement('div'); d.className = 'cfx-tile'; d.dataset.r = item.rarity; if (win) d.dataset.win = '1'; d.append(tile(item.id)); return d; };
    let done; const result = new Promise(r => { done = r; });
    const close = v => { el.classList.add('cfx-out'); setTimeout(() => { el.remove(); done(v); }, reduced ? 0 : 260); };
    const showCard = () => {
      card.hidden = false; $('.cfx-title').textContent = title; $('.cfx-note').textContent = note;
      $('.cfx-actions').innerHTML = `${again ? '<button type="button" class="pu-btn" data-r="again">Abrir otro</button>' : ''}<button type="button" class="pu-btn" data-r="close">Listo</button>`;
      $('.cfx-actions button:last-child').focus({ preventScroll: true });
    };
    el.addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (b) close(b.dataset.r); });
    el.addEventListener('keydown', e => { if (e.key === 'Escape' && !card.hidden) close('close'); });

    if (reduced) {
      window.NexoCofreSonidos?.play('reveal', rarity);
      $('.cofre-fx-stage').hidden = true; roulette.hidden = false; strip.append(mk(winner, true)); strip.style.margin = '0 auto';
      el.classList.add('cfx-won'); if (big) el.classList.add('cfx-bang'); showCard(); return result;
    }
    strip.append(...Array.from({ length: TILES }, (_, i) => i === WIN_AT ? mk(winner, true) : mk(ids[Math.floor(Math.random() * ids.length)], false)));
    // 1. el cofre tiembla y salta la tapa
    await wait(80); chest.classList.add('cfx-shake'); window.NexoCofreSonidos?.play('rumble');
    await wait(1100);
    chest.classList.remove('cfx-shake'); chest.classList.add('cfx-opening'); el.classList.add('cfx-lit', 'cfx-flash');
    window.NexoCofreSonidos?.play('pop'); burst(parts, 'legendario', 40, performance.now() + 500);
    await wait(800);
    // 2. el cofre sube y aparece la ruleta
    $('.cofre-fx-stage').classList.add('cfx-away'); roulette.hidden = false; roulette.classList.add('cfx-drop'); window.NexoCofreSonidos?.play('whoosh');
    await wait(450);
    // 3. la ruleta gira y frena en el premio
    const tw = strip.children[1].getBoundingClientRect().left - strip.children[0].getBoundingClientRect().left, view = strip.parentElement.clientWidth;
    const end = WIN_AT * tw + tw / 2 - view / 2 + (Math.random() - .5) * tw * .6, dur = big ? 7200 : 6000, t0 = performance.now();
    let last = -1;
    const tiles = [...strip.children], marker = $('.cfx-marker'), overshoot = tw * .22;
    await new Promise(res => (function frame(now) {
      const k = Math.min(1, (now - t0) / dur);
      // frena suave y se pasa un poco del premio antes de asentarse (como una ruleta real)
      const x = end * ease(Math.min(1, k / .86)) + (k > .86 ? overshoot * Math.sin(Math.PI * (1 - (k - .86) / .14)) * (1 - (k - .86) / .14) : 0);
      strip.style.transform = `translate3d(${-x}px,0,0)`;
      const centre = x + view / 2;
      const speed = Math.min(1, (1 - k) * 1.4);
      const lo = Math.max(0, Math.floor(centre / tw) - 4), hi = Math.min(tiles.length - 1, lo + 8);
      for (let i = lo; i <= hi; i++) {
        const d = Math.min(1.5, Math.abs((i + .5) * tw - centre) / tw);
        tiles[i].style.transform = `scale(${1 + .22 * Math.max(0, 1 - d)}) translateY(${-6 * Math.max(0, 1 - d)}px)`;
        tiles[i].style.filter = `blur(${(speed * 1.2 * Math.min(1, d)).toFixed(2)}px)`;
      }
      const idx = Math.floor(centre / tw);
      if (idx !== last) { last = idx; if (k < .98) window.NexoCofreSonidos?.play('tick'); marker.classList.remove('cfx-tick'); void marker.offsetWidth; marker.classList.add('cfx-tick'); }
      k < 1 && el.isConnected ? requestAnimationFrame(frame) : res();
    })(t0));
    tiles.forEach(tl => { if (!tl.dataset.win) { tl.style.transform = ''; } tl.style.filter = ''; });
    // 4. el premio brilla y sale el cartel
    el.classList.add('cfx-won'); if (big) el.classList.add('cfx-bang'); window.NexoCofreSonidos?.play('land'); setTimeout(() => window.NexoCofreSonidos?.play('reveal', rarity), 180);
    burst(parts, rarity, big ? 100 : 40, performance.now() + 900);
    await wait(big ? 900 : 600); showCard();
    return result;
  }

  window.NexoCofre = Object.freeze({ play });
})();
