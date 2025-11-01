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
  const ARROW_EDGE_PADDING = 14;
  const UPDATE_THROTTLE = 50;
  const SCROLL_CLOSE_THRESHOLD = 50;
  const SUPPORTS_POINTER = typeof window !== 'undefined' && 'PointerEvent' in window;

  let tooltipUid = 0;

  class TooltipPositioner {
    constructor(trigger, tooltip = null, options = {}) {
      this.trigger = trigger;
      this.tooltip = tooltip;
      this.options = {
        gap: options.gap ?? DEFAULT_GAP,
      };
    }

    setTooltipElement(element) {
      this.tooltip = element;
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
      const rawArrowOffset = triggerCenterX - centerX;
      const arrowLimit = Math.max(halfWidth - ARROW_EDGE_PADDING, 0);
      const arrowOffset = Math.min(Math.max(rawArrowOffset, -arrowLimit), arrowLimit);

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
      this.cleanupLegacyArtifacts();
      this.portal = this.ensurePortal();
      this.tooltips = this.collectTooltips();
      this.tooltips.forEach((entry) => this.bindTooltip(entry));
      this.bindGlobalListeners();
    }

    cleanupLegacyArtifacts() {
      const tooltipTexts = new Set(
        Array.from(document.querySelectorAll('.info-tooltip__content'))
          .map((el) => el.textContent.trim())
          .filter((text) => text.length > 0),
      );

      const textNodeType = typeof Node !== 'undefined' ? Node.TEXT_NODE : 3;

      const portal = document.getElementById(PORTAL_ID);
      if (portal) {
        while (portal.firstChild) {
          portal.removeChild(portal.firstChild);
        }
      }

      const legacyNodes = document.querySelectorAll('.ws-tooltip, .ws-tip-text');
      legacyNodes.forEach((node) => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      });

      Array.from(document.body.childNodes).forEach((node) => {
        if (node.nodeType === textNodeType) {
          const value = (node.textContent || '').trim();

          if (value.length > 0 && tooltipTexts.has(value) && node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
      });
    }

    ensurePortal() {
      let portal = document.getElementById(PORTAL_ID);

      if (!portal) {
        portal = document.createElement('div');
        portal.id = PORTAL_ID;
        portal.setAttribute('aria-hidden', 'true');
        portal.classList.add('ws-tooltips-portal');
        if (document.body.firstElementChild) {
          document.body.insertBefore(portal, document.body.firstElementChild);
        } else {
          document.body.appendChild(portal);
        }
      } else {
        portal.classList.add('ws-tooltips-portal');
        if (!portal.hasAttribute('aria-hidden')) {
          portal.setAttribute('aria-hidden', 'true');
        }
        if (portal.parentElement !== document.body || portal !== document.body.firstElementChild) {
          document.body.insertBefore(portal, document.body.firstElementChild);
        }
      }

      return portal;
    }

    collectTooltips() {
      return Array.from(document.querySelectorAll('.info-tooltip'))
        .map((root) => {
          const trigger = root.querySelector('.info-tooltip__trigger, .ws-tip-trigger');
          let content = root.querySelector('.info-tooltip__content');

          if (!trigger) {
            return null;
          }

          const ensureContent = () => {
            if (!content) {
              content = document.createElement('span');
              content.className = 'info-tooltip__content';
              root.appendChild(content);
            }

            return content;
          };

          const getHelpTextAttr = () => (trigger.getAttribute('data-help') || root.getAttribute('data-help') || '').trim();

          const source = ensureContent();
          let tooltipId = source.id;

          if (!tooltipId) {
            tooltipUid += 1;
            tooltipId = `tooltip-generated-${tooltipUid}`;
            source.id = tooltipId;
          }

          trigger.classList.add('ws-tip-trigger');
          trigger.setAttribute('aria-expanded', trigger.getAttribute('aria-expanded') === 'true' ? 'true' : 'false');
          trigger.setAttribute('aria-haspopup', 'true');
          trigger.setAttribute('aria-controls', tooltipId);

          if (!trigger.hasAttribute('aria-describedby')) {
            trigger.setAttribute('aria-describedby', tooltipId);
          }

          if (trigger.tagName === 'BUTTON' && !trigger.hasAttribute('type')) {
            trigger.setAttribute('type', 'button');
          }

          const tipName = (root.dataset.tip || trigger.dataset.tip || '').trim();
          if (tipName.length > 0) {
            root.dataset.tip = tipName;
            trigger.dataset.tip = tipName;
          }

          source.setAttribute('aria-hidden', 'true');
          source.setAttribute('hidden', '');
          source.hidden = true;
          source.classList.add('info-tooltip__content');
          if (source.hasAttribute('role')) {
            source.removeAttribute('role');
          }

          if (!source.dataset.placement && root.dataset.placement) {
            source.dataset.placement = root.dataset.placement;
          }

          if (source.textContent.trim().length === 0) {
            const attrHelp = getHelpTextAttr();
            if (attrHelp.length > 0) {
              source.textContent = attrHelp;
            }
          }

          const getContent = () => {
            const attrHelp = getHelpTextAttr();

            if (source) {
              if (source.childElementCount > 0) {
                const html = source.innerHTML.trim();
                if (html.length > 0) {
                  return { value: html, mode: 'html' };
                }
              }

              const text = source.textContent.trim();
              if (text.length > 0) {
                return { value: text, mode: 'text' };
              }
            }

            if (attrHelp.length > 0) {
              return { value: attrHelp, mode: 'text' };
            }

            return { value: '', mode: 'text' };
          };

          return {
            id: tooltipId,
            root,
            trigger,
            content: source,
            getContent,
            positioner: new TooltipPositioner(trigger),
            bubble: null,
            arrow: null,
            manual: false,
            hovered: false,
            focused: false,
            skipNextClick: false,
            lastTriggerRect: null,
            preferredPlacement: source.dataset.placement || root.dataset.placement || 'top',
            currentPlacement: null,
            isOpen: false,
          };
        })
        .filter(Boolean);
    }

    renderBubbleContent(entry, target) {
      if (!target || !entry || typeof entry.getContent !== 'function') {
        return;
      }

      const { value, mode } = entry.getContent();

      if (mode === 'html') {
        target.innerHTML = value;
      } else {
        target.textContent = value;
      }
    }

    isFinePointer(event) {
      if (!event || typeof event.pointerType !== 'string') {
        return false;
      }

      return event.pointerType === 'mouse' || event.pointerType === 'pen';
    }

    createBubble(entry) {
      if (!this.portal) {
        return null;
      }

      const bubble = document.createElement('div');
      bubble.className = 'ws-tooltip';
      bubble.id = entry.id;
      bubble.setAttribute('role', 'tooltip');
      bubble.setAttribute('aria-hidden', 'true');
      bubble.dataset.placement = entry.preferredPlacement;

      const arrow = document.createElement('div');
      arrow.className = 'ws-tooltip__arrow';
      arrow.setAttribute('aria-hidden', 'true');

      const inner = document.createElement('div');
      inner.className = 'ws-tooltip__inner';
      this.renderBubbleContent(entry, inner);

      bubble.appendChild(inner);
      bubble.appendChild(arrow);
      this.portal.appendChild(bubble);

      entry.positioner.setTooltipElement(bubble);
      entry.bubble = bubble;
      entry.arrow = arrow;

      if (SUPPORTS_POINTER) {
        bubble.addEventListener('pointerenter', entry.handleBubblePointerEnter);
        bubble.addEventListener('pointerleave', entry.handleBubblePointerLeave);
      }

      return bubble;
    }

    destroyBubble(entry) {
      if (entry.bubble) {
        if (SUPPORTS_POINTER) {
          entry.bubble.removeEventListener('pointerenter', entry.handleBubblePointerEnter);
          entry.bubble.removeEventListener('pointerleave', entry.handleBubblePointerLeave);
        }

        if (entry.bubble.parentNode) {
          entry.bubble.parentNode.removeChild(entry.bubble);
        }
      }

      entry.positioner.setTooltipElement(null);
      entry.bubble = null;
      entry.arrow = null;
      entry.currentPlacement = null;
    }

    updateBubblePlacement(entry, placement) {
      if (!entry.bubble) {
        return;
      }

      entry.bubble.classList.remove('ws-tooltip--top', 'ws-tooltip--bottom');
      if (placement) {
        entry.bubble.classList.add(`ws-tooltip--${placement}`);
        entry.bubble.dataset.placement = placement;
      }
    }

    bindTooltip(entry) {
      const { trigger, root } = entry;

      entry.handlePointerUp = (event) => {
        if (!SUPPORTS_POINTER) {
          return;
        }

        if (event.pointerType === 'mouse' || event.pointerType === 'pen' || event.isPrimary === false) {
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
        if (!SUPPORTS_POINTER || !this.isFinePointer(event)) {
          return;
        }

        entry.hovered = true;
        this.open(entry, { reason: 'hover' });
      };

      entry.handlePointerLeave = (event) => {
        if (!SUPPORTS_POINTER || !this.isFinePointer(event)) {
          return;
        }

        entry.hovered = false;
        this.maybeClose(entry);
      };

      entry.handleBubblePointerEnter = (event) => {
        if (!SUPPORTS_POINTER || (event.pointerType && !this.isFinePointer(event))) {
          return;
        }

        entry.hovered = true;
      };

      entry.handleBubblePointerLeave = (event) => {
        if (!SUPPORTS_POINTER || (event.pointerType && !this.isFinePointer(event))) {
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

        if (nextTarget && (root.contains(nextTarget) || (entry.bubble && entry.bubble.contains(nextTarget)))) {
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

      const { root, bubble } = this.activeTooltip;

      if (root.contains(event.target) || (bubble && bubble.contains(event.target))) {
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
        if (item !== entry && item.isOpen) {
          this.close(item);
        }
      });

      const bubble = entry.bubble || this.createBubble(entry);

      if (!bubble) {
        return;
      }

      const inner = bubble.querySelector('.ws-tooltip__inner');
      if (inner) {
        this.renderBubbleContent(entry, inner);
      }

      const preferred = entry.currentPlacement || entry.preferredPlacement || 'top';
      const position = entry.positioner.compute(preferred);
      entry.positioner.apply(position);
      this.updateBubblePlacement(entry, position.placement);
      bubble.setAttribute('aria-hidden', 'false');
      bubble.classList.add('ws-tooltip--visible');

      entry.trigger.setAttribute('aria-expanded', 'true');
      entry.root.classList.add(ACTIVE_CLASS);
      entry.manual = manual;
      entry.lastTriggerRect = entry.trigger.getBoundingClientRect();
      entry.currentPlacement = position.placement;
      entry.isOpen = true;
      this.activeTooltip = entry;
      this.updatePortalAria();
    }

    close(entry) {
      if (entry.bubble) {
        entry.bubble.classList.remove('ws-tooltip--visible');
        entry.bubble.setAttribute('aria-hidden', 'true');
      }

      this.destroyBubble(entry);

      entry.trigger.setAttribute('aria-expanded', 'false');
      entry.root.classList.remove(ACTIVE_CLASS);
      entry.positioner.reset();
      entry.manual = false;
      entry.hovered = false;
      entry.focused = document.activeElement === entry.trigger;
      entry.lastTriggerRect = null;
      entry.skipNextClick = false;
      entry.isOpen = false;

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
      if (!this.activeTooltip || !this.activeTooltip.bubble) {
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
        if (!entry.trigger || !entry.trigger.isConnected) {
          this.close(entry);
          return;
        }

        const newRect = entry.trigger.getBoundingClientRect();

        if (!this.isTriggerVisible(entry.trigger, newRect)) {
          this.close(entry);
          return;
        }

        if (entry.lastTriggerRect) {
          const dx = newRect.left - entry.lastTriggerRect.left;
          const dy = newRect.top - entry.lastTriggerRect.top;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > SCROLL_CLOSE_THRESHOLD) {
            this.close(entry);
            return;
          }
        }

        const position = entry.positioner.compute(entry.currentPlacement || entry.preferredPlacement || 'top');
        entry.positioner.apply(position);
        this.updateBubblePlacement(entry, position.placement);
        entry.currentPlacement = position.placement;
        entry.lastTriggerRect = newRect;
      }, UPDATE_THROTTLE);
    }

    updatePortalAria() {
      if (!this.portal) {
        return;
      }

      const hasOpenTooltip = this.tooltips.some((entry) => entry.isOpen);
      this.portal.setAttribute('aria-hidden', hasOpenTooltip ? 'false' : 'true');
    }

    isTriggerVisible(trigger, rect) {
      if (!trigger || !rect) {
        return false;
      }

      if (rect.width === 0 && rect.height === 0) {
        return false;
      }

      const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

      if (rect.bottom < 0 || rect.top > viewportHeight) {
        return false;
      }

      if (rect.right < 0 || rect.left > viewportWidth) {
        return false;
      }

      return true;
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
