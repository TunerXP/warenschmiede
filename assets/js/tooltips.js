(() => {
  const ACTIVE_CLASS = 'is-active';
  const PORTAL_ID = 'ws-tooltips-portal';
  const DEFAULT_GAP = 12;
  const MAX_WIDTH_RATIO = 0.9;
  const MOBILE_BREAKPOINT = 768;
  const MOBILE_MAX_WIDTH = 320;
  const DESKTOP_MAX_WIDTH = 320;
  const HORIZONTAL_MARGIN = 16;
  const BOUNDARY_PADDING = 4;
  const UPDATE_THROTTLE = 50;
  const SCROLL_CLOSE_THRESHOLD = 50;
  const SUPPORTS_POINTER = typeof window !== 'undefined' && 'PointerEvent' in window;

  let tooltipUid = 0;

  class TooltipPositioner {
    constructor(trigger, tooltip, options = {}) {
      this.trigger = trigger;
      this.tooltip = tooltip;
      this.options = {
        gap: options.gap ?? DEFAULT_GAP,
      };
    }

    measure(maxWidth) {
      if (!this.tooltip) {
        return { width: 0, height: 0 };
      }

      const previousTransition = this.tooltip.style.transition;
      const previousVisibility = this.tooltip.style.visibility;
      const previousLeft = this.tooltip.style.left;
      const previousTop = this.tooltip.style.top;
      const previousTransform = this.tooltip.style.transform;
      const previousMaxWidth = this.tooltip.style.maxWidth;

      this.tooltip.style.transition = 'none';
      this.tooltip.style.visibility = 'hidden';
      this.tooltip.style.left = '0px';
      this.tooltip.style.top = '0px';
      this.tooltip.style.transform = 'none';

      if (maxWidth) {
        this.tooltip.style.maxWidth = `${maxWidth}px`;
      } else {
        this.tooltip.style.maxWidth = '';
      }

      const rect = this.tooltip.getBoundingClientRect();

      this.tooltip.style.visibility = previousVisibility;
      this.tooltip.style.transition = previousTransition;
      this.tooltip.style.left = previousLeft;
      this.tooltip.style.top = previousTop;
      this.tooltip.style.transform = previousTransform;
      this.tooltip.style.maxWidth = previousMaxWidth;

      return {
        width: rect.width,
        height: rect.height,
      };
    }

    compute(preferredPlacement = 'top') {
      if (!this.trigger || !this.tooltip) {
        return null;
      }

      const triggerRect = this.trigger.getBoundingClientRect();
      const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const rootStyles = getComputedStyle(document.documentElement);

      const safeArea = {
        top: parseFloat(rootStyles.getPropertyValue('--safe-area-top')) || 0,
        right: parseFloat(rootStyles.getPropertyValue('--safe-area-right')) || 0,
        bottom: parseFloat(rootStyles.getPropertyValue('--safe-area-bottom')) || 0,
        left: parseFloat(rootStyles.getPropertyValue('--safe-area-left')) || 0,
      };

      const gap = this.options.gap;
      const safeMinX = safeArea.left + HORIZONTAL_MARGIN;
      const safeMaxX = viewportWidth - safeArea.right - HORIZONTAL_MARGIN;
      const availableWidth = Math.max(safeMaxX - safeMinX, 0);

      let widthLimit = viewportWidth * MAX_WIDTH_RATIO;
      if (viewportWidth <= MOBILE_BREAKPOINT) {
        widthLimit = Math.min(widthLimit, MOBILE_MAX_WIDTH);
      } else {
        widthLimit = Math.min(widthLimit, DESKTOP_MAX_WIDTH);
      }

      if (availableWidth > 0) {
        widthLimit = Math.min(widthLimit, availableWidth);
      }

      const measurement = this.measure(widthLimit);
      const tooltipWidth = Math.min(measurement.width, widthLimit);
      const halfWidth = tooltipWidth / 2;
      const triggerCenterX = triggerRect.left + triggerRect.width / 2;

      let adjustedCenterX = triggerCenterX;

      if (availableWidth > 0) {
        const minCenter = safeMinX + halfWidth;
        const maxCenter = safeMaxX - halfWidth;

        if (minCenter > maxCenter) {
          adjustedCenterX = (safeMinX + safeMaxX) / 2;
        } else {
          adjustedCenterX = Math.min(Math.max(adjustedCenterX, minCenter), maxCenter);
        }
      } else {
        adjustedCenterX = viewportWidth / 2;
      }

      const tooltipHeight = measurement.height;
      const minTop = safeArea.top + BOUNDARY_PADDING;
      const maxBottom = viewportHeight - safeArea.bottom - BOUNDARY_PADDING;
      const availableTop = triggerRect.top - safeArea.top;
      const availableBottom = viewportHeight - triggerRect.bottom - safeArea.bottom;
      const requiredHeight = tooltipHeight + gap;

      let placement = preferredPlacement;

      if (placement === 'top' && availableTop < requiredHeight && availableBottom > availableTop) {
        placement = 'bottom';
      } else if (placement === 'bottom' && availableBottom < requiredHeight && availableTop > availableBottom) {
        placement = 'top';
      }

      let top;

      if (placement === 'top') {
        top = triggerRect.top - gap - tooltipHeight;
        if (top < minTop) {
          top = minTop;
        }
      } else {
        top = triggerRect.bottom + gap;
        if (top + tooltipHeight > maxBottom) {
          top = Math.max(minTop, maxBottom - tooltipHeight);
        }
      }

      const centerX = adjustedCenterX;
      const left = centerX - halfWidth;
      const arrowOffset = triggerCenterX - centerX;

      return {
        placement,
        top,
        left,
        width: tooltipWidth,
        maxWidth: widthLimit,
        arrowOffset,
      };
    }

    apply(position) {
      if (!position || !this.tooltip) {
        return;
      }

      this.tooltip.style.left = `${position.left}px`;
      this.tooltip.style.top = `${position.top}px`;

      if (position.maxWidth) {
        this.tooltip.style.maxWidth = `${position.maxWidth}px`;
      } else {
        this.tooltip.style.removeProperty('max-width');
      }

      this.tooltip.style.setProperty('--tooltip-arrow-offset', `${position.arrowOffset || 0}px`);
      this.tooltip.dataset.placement = position.placement;
    }

    reset() {
      if (!this.tooltip) {
        return;
      }

      this.tooltip.style.removeProperty('left');
      this.tooltip.style.removeProperty('top');
      this.tooltip.style.removeProperty('max-width');
      this.tooltip.style.removeProperty('--tooltip-arrow-offset');
      delete this.tooltip.dataset.placement;
    }
  }

  class TooltipController {
    constructor() {
      this.portal = null;
      this.tooltips = [];
      this.activeTooltip = null;
      this.updateTimer = null;

      this.handleDocumentPointerDown = this.handleDocumentPointerDown.bind(this);
      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleScroll = this.handleScroll.bind(this);
      this.handleResize = this.handleResize.bind(this);
      this.handleViewportChange = this.handleViewportChange.bind(this);
    }

    init() {
      this.portal = this.ensurePortal();
      this.tooltips = this.collectTooltips();
      this.tooltips.forEach((entry) => this.bindTooltip(entry));
      this.bindGlobalListeners();
    }

    ensurePortal() {
      let portal = document.getElementById(PORTAL_ID);

      if (!portal) {
        portal = document.createElement('div');
        portal.id = PORTAL_ID;
        portal.setAttribute('aria-hidden', 'true');
        document.body.appendChild(portal);
      }

      return portal;
    }

    collectTooltips() {
      return Array.from(document.querySelectorAll('.info-tooltip'))
        .map((root) => {
          const trigger = root.querySelector('.info-tooltip__trigger');
          const content = root.querySelector('.info-tooltip__content');

          if (!trigger || !content) {
            return null;
          }

          const tooltipId = content.id || `tooltip-generated-${tooltipUid += 1}`;
          if (!content.id) {
            content.id = tooltipId;
          }

          trigger.setAttribute('aria-expanded', trigger.getAttribute('aria-expanded') === 'true' ? 'true' : 'false');
          trigger.setAttribute('aria-haspopup', 'true');
          trigger.setAttribute('aria-controls', tooltipId);

          if (!trigger.hasAttribute('aria-describedby')) {
            trigger.setAttribute('aria-describedby', tooltipId);
          }

          content.setAttribute('role', 'tooltip');
          content.setAttribute('aria-hidden', 'true');
          content.setAttribute('aria-live', 'polite');
          content.dataset.state = 'closed';
          content.style.pointerEvents = 'none';

          this.portal.appendChild(content);

          return {
            id: tooltipId,
            root,
            trigger,
            content,
            positioner: new TooltipPositioner(trigger, content),
            manual: false,
            hovered: false,
            focused: false,
            skipNextClick: false,
            lastTriggerRect: null,
          };
        })
        .filter(Boolean);
    }

    bindTooltip(entry) {
      const { trigger, content, root } = entry;

      entry.handlePointerUp = (event) => {
        if (!SUPPORTS_POINTER) {
          return;
        }

        if (event.pointerType === 'mouse' || event.isPrimary === false) {
          return;
        }

        entry.skipNextClick = true;
        this.toggleTooltip(entry, { reason: 'pointer' });
      };

      entry.handlePointerCancel = () => {
        entry.skipNextClick = false;
      };

      entry.handleClick = (event) => {
        if (entry.skipNextClick) {
          entry.skipNextClick = false;
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        const isKeyboard = event.detail === 0;
        this.toggleTooltip(entry, { reason: isKeyboard ? 'keyboard' : 'click', isKeyboard });
      };

      entry.handlePointerEnter = (event) => {
        if (!SUPPORTS_POINTER || event.pointerType !== 'mouse') {
          return;
        }

        entry.hovered = true;
        this.open(entry, { reason: 'hover' });
      };

      entry.handlePointerLeave = (event) => {
        if (!SUPPORTS_POINTER || event.pointerType !== 'mouse') {
          return;
        }

        entry.hovered = false;
        this.maybeClose(entry);
      };

      entry.handleContentPointerEnter = (event) => {
        if (!SUPPORTS_POINTER || (event.pointerType && event.pointerType !== 'mouse')) {
          return;
        }

        entry.hovered = true;
      };

      entry.handleContentPointerLeave = (event) => {
        if (!SUPPORTS_POINTER || (event.pointerType && event.pointerType !== 'mouse')) {
          return;
        }

        entry.hovered = false;
        this.maybeClose(entry);
      };

      entry.handleFocusIn = () => {
        entry.focused = true;
        this.open(entry, { reason: 'focus' });
      };

      entry.handleFocusOut = (event) => {
        const nextTarget = event.relatedTarget;

        if (nextTarget && (root.contains(nextTarget) || content.contains(nextTarget))) {
          return;
        }

        entry.focused = false;
        this.maybeClose(entry);
      };

      if (SUPPORTS_POINTER) {
        trigger.addEventListener('pointerup', entry.handlePointerUp);
        trigger.addEventListener('pointercancel', entry.handlePointerCancel);
        trigger.addEventListener('pointerenter', entry.handlePointerEnter);
        trigger.addEventListener('pointerleave', entry.handlePointerLeave);
        content.addEventListener('pointerenter', entry.handleContentPointerEnter);
        content.addEventListener('pointerleave', entry.handleContentPointerLeave);
      } else {
        trigger.addEventListener('mouseenter', () => {
          entry.hovered = true;
          this.open(entry, { reason: 'hover' });
        });

        trigger.addEventListener('mouseleave', () => {
          entry.hovered = false;
          this.maybeClose(entry);
        });
      }

      trigger.addEventListener('click', entry.handleClick);
      root.addEventListener('focusin', entry.handleFocusIn);
      root.addEventListener('focusout', entry.handleFocusOut);
    }

    bindGlobalListeners() {
      document.addEventListener('pointerdown', this.handleDocumentPointerDown);
      document.addEventListener('click', this.handleDocumentPointerDown);
      document.addEventListener('keydown', this.handleKeydown);
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      window.addEventListener('resize', this.handleResize);

      if (window.visualViewport) {
        window.visualViewport.addEventListener('scroll', this.handleViewportChange);
        window.visualViewport.addEventListener('resize', this.handleViewportChange);
      }
    }

    handleDocumentPointerDown(event) {
      if (!this.activeTooltip) {
        return;
      }

      const { root, content } = this.activeTooltip;

      if (root.contains(event.target) || content.contains(event.target)) {
        return;
      }

      this.close(this.activeTooltip);
    }

    handleKeydown(event) {
      if (event.key === 'Escape' && this.activeTooltip) {
        this.close(this.activeTooltip);
      }
    }

    handleScroll() {
      this.scheduleUpdate();
    }

    handleResize() {
      this.scheduleUpdate();
    }

    handleViewportChange() {
      this.scheduleUpdate();
    }

    toggleTooltip(entry, { reason, isKeyboard = false }) {
      const manual = reason === 'pointer' || reason === 'click';

      if (this.activeTooltip === entry) {
        if (manual || isKeyboard) {
          this.close(entry);
        }
        return;
      }

      this.open(entry, { reason, manual });
    }

    open(entry, { manual = false } = {}) {
      this.tooltips.forEach((item) => {
        if (item !== entry && item.content.dataset.state === 'open') {
          this.close(item);
        }
      });

      const preferred = entry.content.dataset.placement || 'top';
      const position = entry.positioner.compute(preferred);
      entry.positioner.apply(position);

      entry.content.dataset.state = 'open';
      entry.content.setAttribute('aria-hidden', 'false');
      entry.trigger.setAttribute('aria-expanded', 'true');
      entry.root.classList.add(ACTIVE_CLASS);
      entry.manual = manual;
      entry.lastTriggerRect = entry.trigger.getBoundingClientRect();
      entry.content.style.pointerEvents = 'auto';
      this.activeTooltip = entry;
      this.updatePortalAria();
    }

    close(entry) {
      entry.content.dataset.state = 'closed';
      entry.content.setAttribute('aria-hidden', 'true');
      entry.trigger.setAttribute('aria-expanded', 'false');
      entry.root.classList.remove(ACTIVE_CLASS);
      entry.positioner.reset();
      entry.manual = false;
      entry.hovered = false;
      entry.focused = document.activeElement === entry.trigger;
      entry.content.style.pointerEvents = 'none';
      entry.lastTriggerRect = null;
      entry.skipNextClick = false;

      if (this.activeTooltip === entry) {
        this.activeTooltip = null;
      }

      this.updatePortalAria();
    }

    maybeClose(entry) {
      if (entry.manual) {
        return;
      }

      if (entry.focused || entry.hovered) {
        return;
      }

      if (this.activeTooltip === entry) {
        this.close(entry);
      }
    }

    scheduleUpdate() {
      if (!this.activeTooltip) {
        return;
      }

      if (this.updateTimer) {
        return;
      }

      this.updateTimer = window.setTimeout(() => {
        this.updateTimer = null;

        if (!this.activeTooltip) {
          return;
        }

        const entry = this.activeTooltip;
        const newRect = entry.trigger.getBoundingClientRect();

        if (entry.lastTriggerRect) {
          const dx = newRect.left - entry.lastTriggerRect.left;
          const dy = newRect.top - entry.lastTriggerRect.top;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > SCROLL_CLOSE_THRESHOLD) {
            this.close(entry);
            return;
          }
        }

        const position = entry.positioner.compute(entry.content.dataset.placement || 'top');
        entry.positioner.apply(position);
        entry.lastTriggerRect = newRect;
      }, UPDATE_THROTTLE);
    }

    updatePortalAria() {
      if (!this.portal) {
        return;
      }

      const hasOpenTooltip = this.tooltips.some((entry) => entry.content.dataset.state === 'open');
      this.portal.setAttribute('aria-hidden', hasOpenTooltip ? 'false' : 'true');
    }
  }

  const controller = new TooltipController();

  const run = () => {
    controller.init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }

  window.TooltipController = controller;
  window.TooltipPositioner = TooltipPositioner;
})();
