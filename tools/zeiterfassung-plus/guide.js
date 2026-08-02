(() => {
  const sections = [
    { title: 'Zeiterfassung', items: [
      { label: 'Zeiterfassung öffnen', href: '/tools/Zeiterfassung_Plus.html' },
      { label: 'Anleitung', href: '/tools/Zeiterfassung_Plus_Anleitung.html' }
    ]},
    { title: 'Daten & Hilfe', items: [
      { label: 'Datensicherung', href: '#datensicherung' },
      { label: 'Häufige Fragen', href: '#faq' }
    ]},
    { title: 'Android-App', items: [
      { label: 'Android-App & Installation', href: '/downloads.html#zeiterfassung-plus' },
      { label: 'APK direkt herunterladen', href: '/dateien/zeiterfassung-plus/Zeiterfassung_Plus.apk' }
    ]},
    { title: 'Warenschmiede', items: [
      { label: 'Tool-Übersicht', href: '/tools/' },
      { label: 'Homepage', href: '/' },
      { label: 'Kontakt', href: '/kontakt/kontakt.html' }
    ]}
  ];

  const setupMenu = () => {
    window.WSToolMenu?.configure({ toolId: 'time', side: 'right', toolName: 'Anleitung Zeiterfassung Plus', sections });
    document.querySelector('[data-tool-menu-open]')?.addEventListener('click', () => window.WSToolMenu?.open());
    document.querySelector('.ws-tool-panel')?.addEventListener('click', event => {
      if (event.target.closest('a[href^="#"]')) window.WSToolMenu?.close();
    });
  };
  const setupToc = () => {
    const button = document.querySelector('.mobile-toc-button');
    const shell = document.querySelector('.toc-shell');
    if (!button || !shell) return;
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      shell.classList.toggle('open', open);
    });
    shell.addEventListener('click', event => {
      if (event.target.closest('a') && matchMedia('(max-width: 800px)').matches) {
        shell.classList.remove('open'); button.setAttribute('aria-expanded', 'false');
      }
    });
  };
  const setupNavigation = () => {
    const links = [...document.querySelectorAll('.toc a[href^="#"]')];
    links.forEach(link => link.addEventListener('click', event => {
      const target = document.querySelector(link.hash);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', link.hash);
    }));
    if (!('IntersectionObserver' in window)) return;
    const byId = new Map(links.map(link => [link.hash.slice(1), link]));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      byId.forEach((link, id) => {
        if (id === visible.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-12% 0px -68% 0px', threshold: [0, .15] });
    byId.forEach((_, id) => { const target = document.getElementById(id); if (target) observer.observe(target); });
  };
  document.addEventListener('DOMContentLoaded', () => { setupMenu(); setupToc(); setupNavigation(); });
})();
