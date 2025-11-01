(() => {
  const DEFAULT_GAP = 12;
  const MAX_WIDTH_RATIO = 0.9;
  const HORIZONTAL_MARGIN = 16;
  const BOUNDARY_PADDING = 4;

  class TooltipPositioner {
    constructor(trigger, tooltip, options = {}) {
      this.trigger = trigger;
      this.tooltip = tooltip;
      this.options = {
        gap: options.gap ?? DEFAULT_GAP,
      };
    }

    measure() {
      if (!this.tooltip) {
        return { width: 0, height: 0 };
      }

      const previousTransition = this.tooltip.style.transition;
      const previousVisibility = this.tooltip.style.visibility;

      this.tooltip.style.transition = 'none';
      this.tooltip.style.visibility = 'hidden';

      const rect = this.tooltip.getBoundingClientRect();

      this.tooltip.style.visibility = previousVisibility;
      this.tooltip.style.transition = previousTransition;

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
      const tooltipRect = this.measure();

      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const rootStyles = getComputedStyle(document.documentElement);

      const safeArea = {
        top: parseFloat(rootStyles.getPropertyValue('--safe-area-top')) || 0,
        right: parseFloat(rootStyles.getPropertyValue('--safe-area-right')) || 0,
        bottom: parseFloat(rootStyles.getPropertyValue('--safe-area-bottom')) || 0,
        left: parseFloat(rootStyles.getPropertyValue('--safe-area-left')) || 0,
      };

      const centerX = triggerRect.left + triggerRect.width / 2;
      const gap = this.options.gap;

      const safeMinX = safeArea.left + HORIZONTAL_MARGIN;
      const safeMaxX = viewportWidth - safeArea.right - HORIZONTAL_MARGIN;
      const availableWidth = Math.max(safeMaxX - safeMinX, 0);
      const ratioWidth = viewportWidth * MAX_WIDTH_RATIO;
      const widthConstraint = availableWidth > 0 ? Math.min(availableWidth, ratioWidth) : ratioWidth;
      const tooltipWidth = Math.min(tooltipRect.width, widthConstraint || tooltipRect.width);
      const halfWidth = tooltipWidth / 2;

      let adjustedCenterX = centerX;

      if (availableWidth > 0) {
        const minCenter = safeMinX + halfWidth;
        const maxCenter = safeMaxX - halfWidth;

        if (minCenter > maxCenter) {
          adjustedCenterX = safeMinX + availableWidth / 2;
        } else {
          adjustedCenterX = Math.min(Math.max(adjustedCenterX, minCenter), maxCenter);
        }
      }

      const tooltipLeftEdge = adjustedCenterX - halfWidth;
      const tooltipRightEdge = adjustedCenterX + halfWidth;

      const leftInset = Math.max(safeMinX - tooltipLeftEdge, 0);
      const rightInset = Math.max(tooltipRightEdge - safeMaxX, 0);
      const inlineSafePadding = Math.max(leftInset, rightInset);

      let placement = preferredPlacement;
      const availableTop = triggerRect.top - safeArea.top;
      const availableBottom = viewportHeight - triggerRect.bottom - safeArea.bottom;
      const tooltipHeight = tooltipRect.height;
      const requiredHeight = tooltipHeight + gap;

      if (placement === 'top' && availableTop < requiredHeight && availableBottom > availableTop) {
        placement = 'bottom';
      } else if (placement === 'bottom' && availableBottom < requiredHeight && availableTop > availableBottom) {
        placement = 'top';
      }

      let anchorY = placement === 'bottom' ? triggerRect.bottom : triggerRect.top;

      if (placement === 'top') {
        let tooltipTop = anchorY - tooltipHeight - gap;
        const minTop = safeArea.top + BOUNDARY_PADDING;

        if (tooltipTop < minTop) {
          const delta = minTop - tooltipTop;
          anchorY += delta;
        }
      } else {
        let tooltipTop = anchorY + gap;
        const maxBottom = viewportHeight - safeArea.bottom - BOUNDARY_PADDING;

        if (tooltipTop + tooltipHeight > maxBottom) {
          const delta = tooltipTop + tooltipHeight - maxBottom;
          anchorY -= delta;
          tooltipTop -= delta;
        }

        if (tooltipTop < safeArea.top + BOUNDARY_PADDING) {
          const delta = safeArea.top + BOUNDARY_PADDING - tooltipTop;
          anchorY += delta;
        }
      }

      const arrowOffset = centerX - adjustedCenterX;

      return {
        placement,
        anchorY,
        centerX: adjustedCenterX,
        gap,
        arrowOffset,
        inlineSafePadding,
      };
    }

    apply(position) {
      if (!position) {
        return;
      }

      this.tooltip.style.setProperty('--tooltip-left', `${position.centerX}px`);
      this.tooltip.style.setProperty('--tooltip-anchor', `${position.anchorY}px`);
      this.tooltip.style.setProperty('--tooltip-gap', `${position.gap}px`);
      this.tooltip.style.setProperty('--tooltip-arrow-offset', `${position.arrowOffset}px`);
      this.tooltip.style.setProperty('--tooltip-inline-safe', `${Math.max(position.inlineSafePadding, 0)}px`);
      this.tooltip.dataset.placement = position.placement;
    }

    reset() {
      this.tooltip.style.removeProperty('--tooltip-left');
      this.tooltip.style.removeProperty('--tooltip-anchor');
      this.tooltip.style.removeProperty('--tooltip-gap');
      this.tooltip.style.removeProperty('--tooltip-arrow-offset');
      this.tooltip.style.removeProperty('--tooltip-inline-safe');
      delete this.tooltip.dataset.placement;
    }
  }

  const MOBILE_BREAKPOINT = 768;
  const ACTIVE_CLASS = 'is-active';
  const SUPPORTS_POINTER = typeof window !== 'undefined' && 'PointerEvent' in window;

  class MobileTooltipController {
    constructor() {
      this.tooltips = [];
      this.activeTooltip = null;
      this.initialized = false;
      this.rafId = null;
      this.lastInteractionWasKeyboard = false;
      this.supportsPointer = SUPPORTS_POINTER;

      this.handleDocumentPointerDown = this.handleDocumentPointerDown.bind(this);
      this.handleDocumentClick = this.handleDocumentClick.bind(this);
      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleScroll = () => this.scheduleUpdate();
      this.handleResize = () => this.scheduleUpdate();
      this.handleViewportChange = () => this.scheduleUpdate();
    }

    init() {
      if (this.initialized) {
        this.refresh();
        return;
      }

      this.tooltips = this.collectTooltips();
      this.tooltips.forEach((entry) => {
        entry.triggerHandler = (event) => this.handleTriggerClick(event, entry);
        entry.skipNextClick = false;

        entry.trigger.addEventListener('click', entry.triggerHandler);

        if (this.supportsPointer) {
          entry.pointerHandler = (event) => this.handleTriggerPointer(event, entry);
          entry.pointerResetHandler = () => {
            entry.skipNextClick = false;
          };

          entry.trigger.addEventListener('pointerup', entry.pointerHandler);
          entry.trigger.addEventListener('pointercancel', entry.pointerResetHandler);
        }
      });

      if (this.supportsPointer) {
        document.addEventListener('pointerdown', this.handleDocumentPointerDown);
      }
      document.addEventListener('click', this.handleDocumentClick);
      document.addEventListener('keydown', this.handleKeydown);
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      window.addEventListener('resize', this.handleResize);

      if (window.visualViewport) {
        window.visualViewport.addEventListener('scroll', this.handleViewportChange);
        window.visualViewport.addEventListener('resize', this.handleViewportChange);
      }

      this.initialized = true;
    }

    destroy() {
      if (!this.initialized) {
        return;
      }

      this.tooltips.forEach((entry) => {
        entry.trigger.removeEventListener('click', entry.triggerHandler);

        if (this.supportsPointer) {
          entry.trigger.removeEventListener('pointerup', entry.pointerHandler);
          entry.trigger.removeEventListener('pointercancel', entry.pointerResetHandler);
        }
        entry.positioner.reset();
        entry.root.classList.remove(ACTIVE_CLASS);
        entry.trigger.setAttribute('aria-expanded', 'false');
        entry.content.tabIndex = -1;
      });

      if (this.supportsPointer) {
        document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
      }
      document.removeEventListener('click', this.handleDocumentClick);
      document.removeEventListener('keydown', this.handleKeydown);
      window.removeEventListener('scroll', this.handleScroll);
      window.removeEventListener('resize', this.handleResize);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener('scroll', this.handleViewportChange);
        window.visualViewport.removeEventListener('resize', this.handleViewportChange);
      }

      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }

      this.tooltips = [];
      this.activeTooltip = null;
      this.initialized = false;
    }

    collectTooltips() {
      return Array.from(document.querySelectorAll('.info-tooltip'))
        .map((root) => {
          const trigger = root.querySelector('.info-tooltip__trigger');
          const content = root.querySelector('.info-tooltip__content');

          if (!trigger || !content) {
            return null;
          }

          if (!trigger.hasAttribute('aria-expanded') || trigger.getAttribute('aria-expanded') === '') {
            trigger.setAttribute('aria-expanded', 'false');
          }

          content.tabIndex = -1;

          return {
            root,
            trigger,
            content,
            positioner: new TooltipPositioner(trigger, content),
            id: root.dataset.tip || null,
          };
        })
        .filter(Boolean);
    }

    refresh() {
      if (this.activeTooltip) {
        this.open(this.activeTooltip, { focus: false });
      }
    }

    handleTriggerPointer(event, entry) {
      if (event.pointerType === 'mouse' || event.isPrimary === false) {
        return;
      }

      entry.skipNextClick = true;
      this.toggleTooltip(event, entry, { isKeyboard: false });
    }

    handleTriggerClick(event, entry) {
      if (entry.skipNextClick) {
        entry.skipNextClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const isKeyboard = event.detail === 0;
      this.toggleTooltip(event, entry, { isKeyboard });
    }

    toggleTooltip(event, entry, { isKeyboard }) {
      event.preventDefault();
      event.stopPropagation();

      this.lastInteractionWasKeyboard = isKeyboard;

      if (this.activeTooltip === entry) {
        this.close(entry);
      } else {
        this.open(entry, { focus: isKeyboard });
      }
    }

    handleDocumentPointerDown(event) {
      if (!this.activeTooltip) {
        return;
      }

      if (this.activeTooltip.root.contains(event.target)) {
        return;
      }

      this.close(this.activeTooltip);
    }

    handleDocumentClick(event) {
      if (!this.activeTooltip) {
        return;
      }

      if (this.activeTooltip.root.contains(event.target)) {
        return;
      }

      this.close(this.activeTooltip);
    }

    handleKeydown(event) {
      if (event.key === 'Escape' && this.activeTooltip) {
        this.close(this.activeTooltip);
      }
    }

    scheduleUpdate() {
      if (!this.activeTooltip) {
        return;
      }

      if (this.rafId !== null) {
        return;
      }

      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;

        if (this.activeTooltip) {
          this.open(this.activeTooltip, { focus: false });
        }
      });
    }

    open(entry, { focus = false } = {}) {
      this.tooltips.forEach((item) => {
        if (item !== entry && item.root.classList.contains(ACTIVE_CLASS)) {
          this.close(item);
        }
      });

      const position = entry.positioner.compute('top');
      entry.positioner.apply(position);

      entry.root.classList.add(ACTIVE_CLASS);
      entry.trigger.setAttribute('aria-expanded', 'true');
      entry.content.tabIndex = 0;

      if (focus) {
        entry.content.focus({ preventScroll: true });
      }

      this.activeTooltip = entry;
    }

    close(entry) {
      entry.root.classList.remove(ACTIVE_CLASS);
      entry.positioner.reset();
      entry.trigger.setAttribute('aria-expanded', 'false');
      entry.content.tabIndex = -1;
      entry.skipNextClick = false;

      if (document.activeElement === entry.content) {
        entry.trigger.focus({ preventScroll: true });
      }

      if (this.activeTooltip === entry) {
        this.activeTooltip = null;
      }
    }
  }

  const setupFocusAccessibility = () => {
    document.querySelectorAll('.info-tooltip').forEach((root) => {
      if (root.dataset.tooltipFocusBound === 'true') {
        return;
      }

      const content = root.querySelector('.info-tooltip__content');

      if (!content) {
        return;
      }

      const handleFocusIn = () => {
        content.tabIndex = 0;
      };

      const handleFocusOut = (event) => {
        const nextTarget = event.relatedTarget;

        if (!nextTarget || !root.contains(nextTarget)) {
          content.tabIndex = -1;
        }
      };

      content.tabIndex = -1;
      root.addEventListener('focusin', handleFocusIn);
      root.addEventListener('focusout', handleFocusOut);
      root.dataset.tooltipFocusBound = 'true';
    });
  };

  const mobileController = new MobileTooltipController();
  const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

  const setupController = (matches) => {
    if (matches) {
      mobileController.init();
    } else {
      mobileController.destroy();
    }
  };

  const handleMediaChange = (event) => {
    setupController(event.matches);
  };

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', handleMediaChange);
  } else {
    mobileQuery.addListener(handleMediaChange);
  }

  const runInitializers = () => {
    setupFocusAccessibility();
    setupController(mobileQuery.matches);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInitializers, { once: true });
  } else {
    runInitializers();
  }

  window.TooltipPositioner = TooltipPositioner;
})();
