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
  count($('#hero-n'), 2400, 1500);

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
})();