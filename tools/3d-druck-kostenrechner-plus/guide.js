(() => {
  const sections = [
    { title: 'Anleitung', items: [
      { label: 'Kostenrechner öffnen', href: '/tools/ws_3d_print_kostenrechner.html' },
      { label: 'Schnellstart', href: '#schnellstart' },
      { label: 'Kalkulation verstehen', href: '#kostenbestandteile' },
      { label: 'Dokumente erstellen', href: '#angebot' },
      { label: 'Speichern & Wiederherstellen', href: '#speichern' },
      { label: 'Dokument prüfen', href: '#pruefung' },
      { label: 'FAQ', href: '#faq' }
    ]},
    { title: 'Passende Werkzeuge', items: [
      { toolId: 'qr' },
      { label: 'Quittungs-Werkstatt', href: '/tools/ReceiptWriterPro.html' }
    ]},
    { title: '3D-Druck & Wissen', items: [
      { label: '3D-Druck Wissen', href: '/3d_druck/3ddruck-faq.html' },
      { label: 'Materialwissen', href: '/3d_druck/material.html' },
      { label: 'Wartung & Reinigung', href: '/3d_druck/wartung-reinigung.html' },
      { label: 'Fehler & Troubleshooting', href: '/3d_druck/fehlerdatenbank.html' }
    ]},
    { title: 'Warenschmiede', items: [
      { label: 'Zur Tool-Übersicht', href: '/tools/' },
      { label: 'Zur Homepage', href: '/' },
      { label: 'Kontakt', href: '/kontakt/kontakt.html' },
      { label: 'Impressum', href: '/kontakt/impressum.html' },
      { label: 'Datenschutz', href: '/datenschutz.html' }
    ]}
  ];

  const closeMenuAfterAnchor = () => {
    document.querySelector('.ws-tool-panel')?.addEventListener('click', event => {
      if (event.target.closest('a[href^="#"]')) window.WSToolMenu?.close();
    });
  };

  const configureToolMenu = () => {
    window.WSToolMenu?.configure({ toolId: '3d-cost', side: 'left', toolName: 'Anleitung Kostenrechner', sections });
    document.querySelector('[data-tool-menu-open]')?.addEventListener('click', () => window.WSToolMenu?.open());
    closeMenuAfterAnchor();
  };

  const setupMobileToc = () => {
    const button = document.querySelector('.mobile-toc-button');
    const toc = document.querySelector('.toc-shell');
    if (!button || !toc) return;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      toc.classList.toggle('open', !expanded);
    });
    toc.addEventListener('click', event => {
      if (event.target.closest('a') && window.matchMedia('(max-width: 800px)').matches) {
        toc.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
      }
    });
  };

  const setupScrollMarker = () => {
    if (!('IntersectionObserver' in window)) return;
    const links = new Map([...document.querySelectorAll('.toc a[href^="#"]')].map(link => [link.hash.slice(1), link]));
    const targets = [...links.keys()].map(id => document.getElementById(id)).filter(Boolean);
    const activate = id => links.forEach((link, key) => {
      if (key === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) activate(visible[0].target.id);
    }, { rootMargin: '-12% 0px -68% 0px', threshold: [0, .15] });
    targets.forEach(target => observer.observe(target));
  };

  const setupBackToTop = () => {
    const button = document.querySelector('.back-to-top');
    if (!button) return;
    const update = () => button.classList.toggle('visible', window.scrollY > 700);
    window.addEventListener('scroll', update, { passive: true });
    update();
    button.addEventListener('click', () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    configureToolMenu();
    setupMobileToc();
    setupScrollMarker();
    setupBackToTop();
  });
})();
