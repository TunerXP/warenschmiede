(() => {
  const viewport = document.querySelector('[data-home-highlights]');
  const track = viewport?.querySelector('[data-home-highlights-track]');
  const group = viewport?.querySelector('[data-home-highlights-group]');
  if (!viewport || !track || !group) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const touchInput = window.matchMedia('(hover: none), (pointer: coarse)');
  const pausedBy = new Set();
  let clone;
  let frame;
  let previousTime;

  const autoplayEnabled = () => !reducedMotion.matches && !touchInput.matches;
  const syncClone = () => {
    if (autoplayEnabled() && !clone) {
      clone = group.cloneNode(true);
      clone.removeAttribute('data-home-highlights-group');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a').forEach((link) => link.setAttribute('tabindex', '-1'));
      track.append(clone);
    } else if (!autoplayEnabled() && clone) {
      const loopWidth = group.getBoundingClientRect().width;
      if (viewport.scrollLeft >= loopWidth) viewport.scrollLeft %= loopWidth;
      clone.remove();
      clone = undefined;
    }
  };
  const canRun = () => !document.hidden && autoplayEnabled() && pausedBy.size === 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = undefined;
    previousTime = undefined;
  };
  const step = (time) => {
    if (!canRun()) return stop();
    if (previousTime) {
      const loopWidth = group.getBoundingClientRect().width;
      viewport.scrollLeft += (loopWidth / 45000) * (time - previousTime);
      if (viewport.scrollLeft >= loopWidth) viewport.scrollLeft -= loopWidth;
    }
    previousTime = time;
    frame = requestAnimationFrame(step);
  };
  const start = () => {
    syncClone();
    if (canRun() && frame === undefined) frame = requestAnimationFrame(step);
  };
  const pause = (reason) => {
    pausedBy.add(reason);
    stop();
  };
  const resume = (reason) => {
    pausedBy.delete(reason);
    start();
  };

  viewport.addEventListener('pointerenter', () => pause('pointer'));
  viewport.addEventListener('pointerleave', () => resume('pointer'));
  viewport.addEventListener('focusin', () => pause('focus'));
  viewport.addEventListener('focusout', (event) => {
    if (!viewport.contains(event.relatedTarget)) resume('focus');
  });
  viewport.addEventListener('pointerdown', () => pause('interaction'));
  window.addEventListener('pointerup', () => resume('interaction'));
  window.addEventListener('pointercancel', () => resume('interaction'));
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  const updateMode = () => {
    stop();
    syncClone();
    start();
  };
  reducedMotion.addEventListener('change', updateMode);
  touchInput.addEventListener('change', updateMode);
  start();
})();
