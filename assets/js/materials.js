(() => {
  const cards = document.querySelectorAll('[data-accordion]');
  if (!cards.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  cards.forEach((card, index) => {
    const toggle = card.querySelector('[data-accordion-toggle]');
    const panel = card.querySelector('[data-accordion-panel]');

    if (!toggle || !panel) {
      return;
    }

    const panelId = panel.id || `material-panel-${index + 1}`;
    panel.id = panelId;
    toggle.setAttribute('aria-controls', panelId);

    card.classList.remove('is-open');
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    panel.style.maxHeight = '0px';

    const reducedMotion = prefersReducedMotion.matches;

    const setExpanded = (expanded) => {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      panel.setAttribute('aria-hidden', expanded ? 'false' : 'true');
      card.classList.toggle('is-open', expanded);

      if (expanded) {
        panel.classList.add('is-open');
        if (reducedMotion) {
          panel.style.maxHeight = 'none';
        } else {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        }
      } else if (reducedMotion) {
        panel.classList.remove('is-open');
        panel.style.maxHeight = '0px';
      } else {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
        requestAnimationFrame(() => {
          panel.style.maxHeight = '0px';
        });
      }
    };

    const togglePanel = () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!isExpanded);
    };

    toggle.addEventListener('click', togglePanel);

    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        togglePanel();
      } else if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        setExpanded(false);
      }
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        event.stopPropagation();
        setExpanded(false);
        toggle.focus();
      }
    });

    if (!reducedMotion) {
      panel.addEventListener('transitionend', (event) => {
        if (event.propertyName !== 'max-height') {
          return;
        }

        if (toggle.getAttribute('aria-expanded') === 'true') {
          panel.style.maxHeight = 'none';
        } else {
          panel.classList.remove('is-open');
          panel.style.maxHeight = '0px';
        }
      });
    }
  });
})();
