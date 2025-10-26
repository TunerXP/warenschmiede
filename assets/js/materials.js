(() => {
  const cards = document.querySelectorAll('[data-accordion]');
  if (!cards.length) {
    return;
  }

  cards.forEach((card, index) => {
    const toggle = card.querySelector('[data-accordion-toggle]');
    const panel = card.querySelector('[data-accordion-panel]');

    if (!toggle || !panel) {
      return;
    }

    const panelId = panel.id || `material-panel-${index + 1}`;
    panel.id = panelId;
    toggle.setAttribute('aria-controls', panelId);

    const setExpanded = (expanded) => {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      panel.setAttribute('aria-hidden', expanded ? 'false' : 'true');
      card.classList.toggle('is-open', expanded);
    };

    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!isExpanded);
    });

    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle.click();
      }
    });
  });
})();
