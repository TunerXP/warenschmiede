const PORTAL_ID = 'ws-tooltips-portal';
const TRIGGER_SELECTOR = '.ws-tip-trigger';
const GAP = 12;
const PADDING = 8;
const ARROW_SIZE = 10;
const REPOSITION_DELAY = 50;
const state = { portal: null, trigger: null, tooltip: null, arrow: null, timer: 0 };
const COARSE_TAP_COOLDOWN = 150;
let lastCoarseActivation = 0;

const ensurePortal = () => {
  let portal = document.getElementById(PORTAL_ID);
  if (!portal) { portal = document.createElement('div'); portal.id = PORTAL_ID; portal.className = 'ws-tooltips-portal'; portal.setAttribute('aria-hidden', 'true'); document.body.prepend(portal); }
  else { portal.classList.add('ws-tooltips-portal'); if (!portal.hasAttribute('aria-hidden')) portal.setAttribute('aria-hidden', 'true'); }
  return portal;
};

const textFromTrigger = (trigger) => {
  if (!trigger) return '';
  const text = (trigger.dataset.help || trigger.getAttribute('title') || '').trim();
  if (text) {
    trigger.dataset.help = text;
    if (!trigger.getAttribute('title')) trigger.setAttribute('title', text);
    const existingLabel = trigger.getAttribute('aria-label');
    if (!existingLabel || !existingLabel.trim()) {
      const fallback = trigger.dataset.label ? trigger.dataset.label.trim() : '';
      trigger.setAttribute('aria-label', fallback || `Hilfe öffnen: ${text}`);
    }
  }
  return text;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const placeTooltip = () => {
  const { trigger, tooltip, arrow } = state; if (!trigger || !tooltip) return;
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const centerX = triggerRect.left + triggerRect.width / 2;
  let left = clamp(centerX - tooltipRect.width / 2, PADDING, Math.max(viewportWidth - tooltipRect.width - PADDING, PADDING));
  let top = triggerRect.top - tooltipRect.height - GAP;
  let placement = 'top';
  if (top < PADDING) { placement = 'bottom'; top = triggerRect.bottom + GAP; if (top + tooltipRect.height > viewportHeight - PADDING) top = Math.max(PADDING, viewportHeight - tooltipRect.height - PADDING); }
  else if (top + tooltipRect.height > viewportHeight - PADDING) { top = Math.max(PADDING, viewportHeight - tooltipRect.height - PADDING); }
  tooltip.style.left = `${Math.round(left)}px`; tooltip.style.top = `${Math.round(top)}px`; tooltip.dataset.placement = placement;
  if (arrow) {
    const arrowLeft = clamp(centerX - left - ARROW_SIZE / 2, 4, Math.max(tooltipRect.width - ARROW_SIZE - 4, 4));
    arrow.style.left = `${Math.round(arrowLeft)}px`;
    if (placement === 'top') { arrow.style.top = ''; arrow.style.bottom = '-5px'; }
    else { arrow.style.bottom = ''; arrow.style.top = '-5px'; }
  }
};

const closeTooltip = () => {
  if (state.tooltip) state.tooltip.setAttribute('aria-hidden', 'true');
  if (state.tooltip?.parentNode) state.tooltip.parentNode.removeChild(state.tooltip);
  if (state.trigger) state.trigger.setAttribute('aria-expanded', 'false');
  if (state.portal) state.portal.setAttribute('aria-hidden', 'true');
  if (state.timer) window.clearTimeout(state.timer);
  state.trigger = null; state.tooltip = null; state.arrow = null; state.timer = 0;
};

const openTooltip = (trigger) => {
  if (!trigger) return;
  if (!state.portal) state.portal = ensurePortal();
  closeTooltip();
  const text = textFromTrigger(trigger); if (!text) return;
  const tooltip = document.createElement('div'); tooltip.className = 'ws-tooltip'; tooltip.setAttribute('role', 'tooltip');
  const arrow = document.createElement('div'); arrow.className = 'ws-tooltip__arrow';
  const content = document.createElement('div'); content.className = 'ws-tooltip__content'; content.textContent = text;
  tooltip.append(arrow, content);
  tooltip.setAttribute('aria-hidden', 'false');
  state.portal.appendChild(tooltip); state.portal.setAttribute('aria-hidden', 'false'); trigger.setAttribute('aria-expanded', 'true');
  state.trigger = trigger; state.tooltip = tooltip; state.arrow = arrow;
  placeTooltip();
};

const toggleTooltip = (trigger) => {
  if (!trigger) return;
  if (state.trigger === trigger && state.tooltip) {
    closeTooltip();
    return;
  }
  openTooltip(trigger);
};

const schedulePlacement = () => {
  if (!state.trigger || !state.tooltip || state.timer) return;
  state.timer = window.setTimeout(() => {
    state.timer = 0;
    if (state.trigger && state.trigger.isConnected) placeTooltip();
    else closeTooltip();
  }, REPOSITION_DELAY);
};

const handlePointerDown = (event) => {
  if (!state.trigger || !state.tooltip) return;
  const target = event.target;
  if (target instanceof Node && (state.tooltip.contains(target) || state.trigger.contains(target))) return;
  closeTooltip();
};

const initTooltips = () => {
  state.portal = ensurePortal();
  const triggers = Array.from(document.querySelectorAll(TRIGGER_SELECTOR)); if (triggers.length === 0) console.warn('WS tooltips: no triggers');
  const coarse = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
  const useCoarse = coarse;
  triggers.forEach((trigger) => {
    textFromTrigger(trigger);
    trigger.setAttribute('aria-expanded', trigger.getAttribute('aria-expanded') || 'false');
    if (useCoarse) {
      const pointerEvent = window.PointerEvent ? 'pointerup' : 'click';
      const handleCoarseActivate = (event) => {
        if (event.pointerType && !['touch', 'pen', 'mouse'].includes(event.pointerType)) return;
        if (typeof event.button === 'number' && event.button !== 0) return;
        const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        if (now - lastCoarseActivation < COARSE_TAP_COOLDOWN) { event.preventDefault(); return; }
        lastCoarseActivation = now;
        event.preventDefault();
        trigger.focus({ preventScroll: true });
        toggleTooltip(trigger);
      };
      trigger.addEventListener(pointerEvent, handleCoarseActivate);
      if (pointerEvent === 'pointerup') trigger.addEventListener('click', (event) => event.preventDefault());
    } else {
      trigger.addEventListener('mouseenter', () => openTooltip(trigger));
      trigger.addEventListener('mouseleave', () => state.trigger === trigger && closeTooltip());
      trigger.addEventListener('focus', () => openTooltip(trigger));
      trigger.addEventListener('blur', () => state.trigger === trigger && closeTooltip());
      trigger.addEventListener('click', (event) => event.preventDefault());
    }
    trigger.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space') { event.preventDefault(); toggleTooltip(trigger); }
      else if (event.key === 'Enter') { event.preventDefault(); toggleTooltip(trigger); }
    });
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' || event.key === 'Esc') closeTooltip(); });
  document.addEventListener('pointerdown', handlePointerDown);
  if (!window.PointerEvent) {
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('mousedown', handlePointerDown);
  }
  window.addEventListener('scroll', schedulePlacement, { passive: true });
  window.addEventListener('resize', schedulePlacement);
  document.documentElement.setAttribute('data-tooltips', 'ok');
  console.info('WS tooltips: ok');
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTooltips);
else initTooltips();
