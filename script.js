(() => {
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ease = t => 1 - Math.pow(1 - t, 3);

  // Count a number up from 0 to its data-to value
  function count(el, dur = 2200, delay = 0) {
    const to = +el.dataset.to;
    if (rm) { el.textContent = to; return; }
    el.textContent = 0;
    setTimeout(() => {
      const start = performance.now();
      (function frame(now) {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(to * ease(t));
        if (t < 1) requestAnimationFrame(frame);
      })(start);
    }, delay);
  }

  // Run something once when an element scrolls into view
  function once(el, fn, threshold = 0.5) {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { fn(); io.disconnect(); }
    }, { threshold });
    io.observe(el);
  }

  // 1. Hero headline: the number counts up after the words appear
  const hero = $('.hero'), cam = $('.cam'), her = $('.her'), skip = $('.skip');
  let timer;
  const show = () => { hero.classList.add('shown'); skip.hidden = true; count($('#hero-n'), 2400, 1500); };
  if (rm) { if (her) her.style.opacity = 1; show(); }
  else {
    const D = 28000; // length of the camera move in ms (about 30s with the photo fade)
    const e = 'ease-in-out';
    const anims = [
      cam.animate([
        { transform: 'translate(0,-32%) scale(1.7)', easing: e },              // foot of the mountain
        { transform: 'translate(26%,14%) scale(1.7)', offset: .2, easing: e }, // peak 1
        { transform: 'translate(9%,16%) scale(1.7)', offset: .34, easing: e }, // peak 2
        { transform: 'translate(-9%,15%) scale(1.7)', offset: .48, easing: e },// peak 3
        { transform: 'translate(-27%,16%) scale(1.7)', offset: .62, easing: e },// peak 4
        { transform: 'translate(-48%,28%) scale(3)' }                          // zoom into peak 4
      ], { duration: D, fill: 'forwards' })
    ];
    if (her) anims.push(her.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 4000, delay: D - 3000, fill: 'forwards' }));
    timer = setTimeout(show, D + 1200);
    skip.onclick = () => { clearTimeout(timer); anims.forEach(a => a.finish()); show(); };
  }

  // 2. Stats strip: count up once when it scrolls into view
  const stats = $('.stats');
  if (!rm) $$('b', stats).forEach(b => (b.textContent = 0));
  once(stats, () => $$('b', stats).forEach(b => count(b, 2000)), 0.5);

  // 3. Timeline: crimson line draws itself and milestones light up
  const tl = $('.timeline'), ms = $$('.ms', tl);
  if (!rm) {
    tl.classList.add('anim');
    let ticking = false;
    const update = () => {
      const y = innerHeight * 0.6, r = tl.getBoundingClientRect();
      tl.style.setProperty('--p', Math.min(Math.max((y - r.top) / r.height, 0), 1));
      ms.forEach(m => m.classList.toggle('on', m.getBoundingClientRect().top + 16 <= y));
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  // 4. Founding spots: squares fill one by one. Set data-taken in the HTML to switch spots off.
  const sp = $('.spots'), sq = $$('i', sp);
  const left = Math.max(sq.length - (+sp.dataset.taken || 0), 0);
  sq.forEach((s, i) => { if (i >= left) s.classList.add('gone'); });
  $('#spots-left').textContent = left ? left + ' founding spots left' : 'Founding spots are full';
  if (!rm) {
    sp.classList.add('anim');
    once(sp, () => sq.forEach((s, i) => { if (i < left) setTimeout(() => s.classList.add('fill'), i * 110); }), 0.8);
  }

  // 5. Closing figure: a faceless silhouette grows from lean to strong while lifting
  const fig = $('#fig'), g = id => fig.querySelector('#' + id), lerp = (a, b, p) => a + (b - a) * p;
  const set = (el, o) => { for (const k in o) el.setAttribute(k, o[k]); };
  const NS = 'http://www.w3.org/2000/svg', plates = [];
  for (let i = 0; i < 8; i++) { const r = document.createElementNS(NS, 'rect'); r.setAttribute('class', 'pl'); r.setAttribute('width', 10); r.setAttribute('rx', 2); g('plates').appendChild(r); plates.push(r); }
  function draw(p, t) {
    const sw = lerp(30, 68, p), hw = lerp(20, 42, p), aw = lerp(8, 26, p), lw = lerp(13, 40, p), hx = lerp(88, 104, p);
    const by = 52 + 14 * Math.sin(t / 450); // bar moves up and down
    set(g('torso'), { points: `${200 - sw},140 ${200 + sw},140 ${200 + hw},262 ${200 - hw},262` });
    set(g('aL'), { x1: 200 - sw, y1: 146, x2: 200 - hx, y2: by, 'stroke-width': aw });
    set(g('aR'), { x1: 200 + sw, y1: 146, x2: 200 + hx, y2: by, 'stroke-width': aw });
    set(g('lL'), { x1: 200 - hw * .55, y1: 258, x2: 200 - lerp(34, 58, p), y2: 396, 'stroke-width': lw });
    set(g('lR'), { x1: 200 + hw * .55, y1: 258, x2: 200 + lerp(34, 58, p), y2: 396, 'stroke-width': lw });
    set(g('bar'), { x1: 20, y1: by, x2: 380, y2: by });
    plates.forEach((r, k) => { const i = k >> 1, h = lerp(34, 92, p) - i * 4;
      set(r, { x: k % 2 ? 200 + 168 - i * 13 : 200 - 178 + i * 13, y: by - h / 2, height: h, opacity: p > i * .24 + .05 ? 1 : 0 }); });
    $('#day').textContent = 'Day ' + Math.round(1 + 364 * p);
  }
  draw(rm ? 1 : 0, 0);
  if (!rm) {
    let run = false, looping = false, t0 = 0;
    const loop = () => {
      if (!run) { looping = false; return; }
      const t = performance.now() - t0, k = Math.min(t / 7000, 1);
      draw(k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, t);
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => {
      run = e.isIntersecting;
      if (run && !t0) t0 = performance.now();
      if (run && !looping) { looping = true; loop(); }
    }, { threshold: .4 }).observe(fig);
  }
})();
