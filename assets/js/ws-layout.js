(function () {
  document.body.classList.add('ws-fixed-topbar');

  const link = (path) => {
    if (!path || /^(https?:|mailto:|tel:|#|\/\/)/.test(path)) return path;
    if (path.startsWith('/')) return path;
    return '/' + path.replace(/^\.\//, '');
  };

  function ensureToolCatalog(onReady) {
    if (window.WSToolCatalog) {
      onReady?.(true);
      return;
    }
    if (!document.createElement || !document.head) {
      onReady?.(false);
      return;
    }
    const existing = document.querySelector?.('script[data-ws-tool-catalog]');
    if (existing) {
      existing.addEventListener('load', () => onReady?.(true), { once: true });
      existing.addEventListener('error', () => onReady?.(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = '/assets/js/ws-tool-catalog.js';
    script.dataset.wsToolCatalog = 'loading';
    script.addEventListener('load', () => onReady?.(true), { once: true });
    script.addEventListener('error', () => onReady?.(false), { once: true });
    document.head.append(script);
  }

  function ensureGlobalMusicPlayerAssets() {
    if (!document.createElement || !document.head) return;

    if (!document.querySelector('link[data-ws-global-music-player]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/assets/css/ws-global-music-player.css';
      stylesheet.dataset.wsGlobalMusicPlayer = 'style';
      document.head.append(stylesheet);
    }

    if (window.WSGlobalMusicPlayer || document.querySelector('script[data-ws-global-music-player]')) return;
    const script = document.createElement('script');
    script.src = '/assets/js/ws-global-music-player.js';
    script.dataset.wsGlobalMusicPlayer = 'script';
    document.head.append(script);
  }

  const NAVIGATION = [
    { key: 'start', label: 'Start', href: '/', start: true },
    { key: 'downloads', label: 'Downloads', href: 'downloads.html' },
    {
      key: 'tools', label: 'Online Tools', type: 'mega',
      description: 'Werkstatt, Rechner und Generatoren — schnell erfassbar und praxisnah.',
      sections: [
        { label: 'Werkstatt & Rechner', accent: 'amber', links: [
          { label: 'Tool-Übersicht', href: 'tools/', description: 'Zentrale Übersicht aller Browser-Tools.' },
          { label: 'Werkstatt-Rechner Metall Plus', href: 'tools/werkstatt-rechner.html', description: 'Metall, Maße und praktische Helfer.' },
          { label: 'Winkel-Rechner', href: 'tools/winkel-rechner.html', description: 'Schnelle Winkel- und Geometriehilfe.' },
          { label: 'Bilder Konverter / Editor', href: 'tools/bild-konverter.html', description: 'Bilder lokal umwandeln und vorbereiten.' }
        ] },
        { label: '3D-Druck & Büro', accent: 'steel', links: [
          { toolId: '3d-cost', fallback: { label: '3D-Druck Kostenrechner Plus', href: 'tools/ws_3d_print_kostenrechner.html', description: 'Kalkulation, Angebot, Rechnung und Lieferschein.' } },
          { label: 'CNC Fräsen-Einrichtsblatt Plus', href: 'tools/cnc-fraesen-einrichtsblatt-plus/index.html', description: 'Einrichtblätter und Maschineninfos.' },
          { toolId: 'qr', fallback: { label: 'QR-Werkstatt Plus', href: 'tools/QRCodeMasterPro.html', description: 'QR-Codes, Links, WLAN und mehr.' } },
          { toolId: 'barcode', fallback: { label: 'Barcode-Werkstatt Plus', href: 'tools/BarcodeWerkstattPlus.html', description: 'EAN, Code128, Code39 und ITF-14.' } },
          { toolId: 'datamatrix', fallback: { label: 'DataMatrix-Werkstatt Plus', href: 'tools/DataMatrixWerkstattPlus.html', description: 'Kompakte 2D-Codes für Inventar, Bauteile und Werkstatt.' } }
        ] },
        { label: 'Arbeitszeit & Alltag', accent: 'blue', links: [
          { label: 'Zeiterfassung', href: 'tools/Zeiterfassung.html', description: 'Legacy-Version für bestehende Nutzer.', note: 'Legacy-Version' },
          { toolId: 'time', fallback: { label: 'Zeiterfassung Plus', href: 'tools/Zeiterfassung_Plus.html', description: 'Arbeitszeiten lokal erfassen, sichern und ausgeben.' } },
          { label: 'Quittungs-Werkstatt', href: 'tools/ReceiptWriterPro.html', description: 'Quittungen direkt im Browser erstellen.' }
        ] }
      ]
    },
    { key: 'leistungen', label: 'Leistungen', type: 'dropdown', sections: [{ links: [
      { label: '3D-Druckauftrag', href: 'leistungen/3d-druck.html' },
      { label: 'CAD & Prototyping', href: 'leistungen/cad-prototyping.html' },
      { label: 'PC-Hilfe', href: 'leistungen/pc-hilfe.html' }
    ] }] },
    {
      key: 'ki', label: 'Über KI', type: 'mega',
      description: 'Praxisnah erklären, ohne Hype — kurze Einstiege, klare Wege.',
      sections: [
        { label: 'Einsteigen', accent: 'violet', links: [
          { label: 'KI-Übersicht', href: 'ki/', description: 'Der klare Einstieg: verstehen, sicher nutzen und den passenden Bereich finden.' },
          { label: 'KI kennenlernen', href: 'ki/chat.html', description: 'Ein interaktiver Lern-Chat zeigt dir KI in der Praxis.' },
          { label: 'Erste Schritte & Tutorials', href: 'ki/tutorials/', description: 'Screenshots, Dateien und praktische Grundlagen Schritt für Schritt.' }
        ] },
        { label: 'Arbeiten mit KI', accent: 'blue', links: [
          { label: 'KI im Betrieb', href: 'ki/im-betrieb.html', description: 'Orientierung für einen sicheren und verantwortungsvollen KI-Einsatz im Arbeitsalltag.' },
          { label: 'KI im Alltag', href: 'ki/prompts.html', description: 'Natürlich fragen, Bilder nutzen und gemeinsam zum Ergebnis kommen.' },
          { label: 'Aktuelle KI-Chats', href: 'ki/tools.html', description: 'ChatGPT, Gemini, Claude & Co. – Unterschiede und besondere Funktionen.' }
        ] },
        { label: 'Sicherheit & Einordnung', accent: 'green', links: [
          { label: 'KI: Chancen & Risiken', href: 'ki/chancen-und-risiken.html', description: 'Nutzen, Grenzen und Stolperfallen.' },
          { label: 'KI sicher nutzen', href: 'ki/faq.html', description: 'Datenschutz, Ergebnisse und Arbeit ehrlich einordnen.' }
        ] }
      ]
    },
    {
      key: 'ki-musik', label: 'KI-Musik', type: 'mega',
      description: 'KI-Musik verstehen, Suno kennenlernen und ein echtes Warenschmiede-Hörbeispiel ansehen.',
      sections: [
        { label: 'Entdecken', accent: 'violet', links: [
          { label: 'KI-Musik im Überblick', href: 'ki-musik/', description: 'Vom Gedanken zum fertigen Song – Workflow, Beispiel und Einordnung.' },
          { label: 'Hörbeispiel: Running Back To You', href: 'ki/musik/suno.html#hoerbeispiel', description: 'Song anhören und den dokumentierten Aufbau nachvollziehen.' }
        ] },
        { label: 'Mit Suno arbeiten', accent: 'blue', links: [
          { label: 'KI-Musik mit Suno', href: 'ki/musik/suno.html', description: 'Suno, Studio 2.0 und die wichtigsten Funktionen praxisnah erklärt.' },
          { label: 'Mein Suno-Profil', href: 'https://suno.com/@tunerxp', newTab: true, description: 'Öffentliches TunerXP-Profil bei Suno.' }
        ] },
        { label: 'Einordnung', accent: 'green', links: [
          { label: 'Nutzung & Transparenz', href: 'ki-musik/#rechte', description: 'Paid-Plan-Rechte, Urheberrecht und offizielle Quellen.' },
          { label: 'Meine Musik', href: 'ki-musik/#meine-musik', description: 'The Things That Stay als Vorgeschmack auf den späteren TunerXP-Musikbereich.' }
        ] }
      ]
    },
    { key: 'kontakt', label: 'Kontakt', type: 'dropdown', sections: [{ links: [
      { label: 'Kontakt aufnehmen', href: 'kontakt/kontakt.html' },
      { label: 'Ablauf & Anfrage', href: 'kontakt/ablauf-anfrage.html' },
      { label: 'Impressum', href: 'kontakt/impressum.html' },
      { label: 'Über mich', href: 'kontakt/ueber-mich.html' }
    ] }] },
    {
      key: '3d', label: '3D-Druck', type: 'mega',
      description: 'Wissen, Praxis, Materialien und Fehlerhilfe als klare Arbeitsbereiche.',
      sections: [
        { label: 'Grundlagen', accent: 'green', links: [
          { label: 'Neu beim 3D-Druck?', href: '3d_druck/3ddruck-faq.html', description: 'Startpunkt für Einsteiger.' },
          { label: 'FDM / SLA / SLS – Technologien', href: '3d_druck/technologien.html', description: 'Verfahren einfach vergleichen.' },
          { label: 'Materialwissen', href: '3d_druck/material.html', description: 'PLA, PETG, TPU und Einsatzfälle.' }
        ] },
        { label: 'Praxis', accent: 'amber', links: [
          { label: 'Slicer & Einstellungen', href: '3d_druck/slicer-einstellungen.html', description: 'Parameter, Profile und Stellschrauben.' },
          { label: 'Tipps & Abläufe / Kosten', href: '3d_druck/druck-tipps.html', description: 'Von Idee bis fertigem Teil.' }
        ] },
        { label: 'Hilfe & Spezial', accent: 'red', links: [
          { label: 'Fehler & Troubleshooting', href: '3d_druck/fehlerdatenbank.html', description: 'Probleme erkennen und lösen.' },
          { label: 'TPU Spezial-Wissen', href: '3d_druck/tpu-wissen.html', description: 'Flexibles Material verstehen.' },
          { label: 'Wartung & Reinigung', href: '3d_druck/wartung-reinigung.html', description: 'Drucker pflegen und Probleme vermeiden.' },
          { label: 'Ideenquellen & Portale', href: '3d_druck/ideenquellen.html', description: 'Vorlagen und Inspiration finden.' }
        ] }
      ]
    }
  ];

  const currentPath = (window.location.pathname || '/').toLowerCase();
  const activeKey = (() => {
    if (currentPath.includes('/leistungen/')) return 'leistungen';
    if (currentPath.includes('/3d_druck/')) return '3d';
    if (currentPath.includes('/ki-musik/') || currentPath.includes('/ki/musik/')) return 'ki-musik';
    if (currentPath.includes('/ki/')) return 'ki';
    if (currentPath.includes('/kontakt/') || currentPath.endsWith('/datenschutz.html')) return 'kontakt';
    if (currentPath.endsWith('/downloads.html')) return 'downloads';
    if (currentPath.includes('/tools/')) return 'tools';
    return 'start';
  })();

  const catalogItem = (item) => {
    const tool = item.toolId && window.WSToolCatalog?.[item.toolId];
    return tool
      ? { ...tool, label: tool.name, ...item, fallback: undefined }
      : { ...item.fallback, ...item, fallback: undefined };
  };
  const iconMarkup = item => item.icon
    ? `<span class="ws-nav-tool-icon ws-tool-identity-icon ws-tool-identity-icon--medium"><img data-ws-tool-icon="${item.toolId}" src="${link(item.icon)}" alt="" aria-hidden="true" style="--ws-tool-icon-scale:${item.iconScale || 1}"></span>`
    : '';
  const isCurrentPage = (href) => new URL(link(href), window.location.origin).pathname.toLowerCase() === currentPath;
  const currentAttribute = (href) => isCurrentPage(href) ? ' aria-current="page"' : '';
  const newTabAttribute = item => item.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
  const renderDesktopLink = (item) => `<a class="nav-link${item.start ? ' nav-start' : ''}${item.key === activeKey ? ' is-active' : ''}"${currentAttribute(item.href)} href="${link(item.href)}">${item.label}</a>`;
  const renderMegaLink = source => {
    const item = catalogItem(source);
    return `<a data-tool-id="${item.toolId || ''}" class="mega-link${item.icon ? ' mega-link--with-icon' : ''}" href="${link(item.href)}"${currentAttribute(item.href)}${newTabAttribute(item)}>${iconMarkup(item)}<span class="ws-nav-tool-copy"><strong>${item.label}</strong><span>${item.description}</span></span></a>`;
  };
  const renderMobileLink = source => {
    const item = catalogItem(source);
    return `<a data-tool-id="${item.toolId || ''}"${item.icon ? ' class="mobile-tool-link"' : ''} href="${link(item.href)}"${currentAttribute(item.href)}${newTabAttribute(item)}>${iconMarkup(item)}<span>${item.label}${item.note ? ` <span class="ws-deprecation-note">${item.note}</span>` : ''}</span></a>`;
  };

  const renderDesktopItem = (item) => {
    if (!item.type) return renderDesktopLink(item);
    const panelId = `desktop-menu-${item.key}`;
    const sections = item.sections.map(section => item.type === 'mega'
      ? `<section data-accent="${section.accent}"><h3>${section.label}</h3>${section.links.map(renderMegaLink).join('')}</section>`
      : section.links.map(child => `<a href="${link(child.href)}"${currentAttribute(child.href)}>${child.label}</a>`).join('')).join('');
    const panel = item.type === 'mega'
      ? `<div class="mega-panel" id="${panelId}"><div class="mega-inner"><div class="mega-head"><h2>${item.label}</h2><p>${item.description}</p></div><div class="mega-grid">${sections}</div></div></div>`
      : `<div class="drop-panel" id="${panelId}">${sections}</div>`;
    return `<div class="nav-group${item.type === 'mega' ? ' mega' : ''}" data-menu><button aria-controls="${panelId}" aria-expanded="false" class="nav-link${item.key === activeKey ? ' is-active' : ''}" type="button">${item.label}<span aria-hidden="true">▾</span></button>${panel}</div>`;
  };

  const renderMobileItem = (item) => {
    if (!item.type) return `<a class="mobile-main${item.key === activeKey ? ' is-active' : ''}" href="${link(item.href)}"${currentAttribute(item.href)}>${item.label}</a>`;
    const panelId = `mobile-menu-${item.key}`;
    const sections = item.sections.map(section => `${section.label ? `<h3>${section.label}</h3>` : ''}${section.links.map(renderMobileLink).join('')}`).join('');
    return `<button aria-controls="${panelId}" aria-expanded="false" class="mobile-section${item.key === activeKey ? ' is-active' : ''}" type="button">${item.label}<span aria-hidden="true">▾</span></button><div class="mobile-sub" id="${panelId}">${sections}</div>`;
  };

  const header = `<header class="topbar" id="top">
    <a aria-label="Warenschmiede Start" class="brand brand-wide-transparent" href="/"><img alt="Warenschmiede Logo" class="brand-wide-transparent-logo" src="${link('assets/img/warenschmiede-logo-wide-clean-900.png')}"></a>
    <nav aria-label="Hauptnavigation" class="desktop-nav">${NAVIGATION.map(renderDesktopItem).join('')}</nav>
    <div class="ws-global-player" data-ws-global-player hidden role="group" aria-label="Musikwiedergabe">
      <div class="ws-global-player__copy"><span class="ws-global-player__title" data-ws-global-title>Musik</span><span class="ws-global-player__status" data-ws-global-status aria-live="polite"></span></div>
      <div class="ws-global-player__controls">
        <button class="ws-global-player__control" data-ws-global-play type="button" aria-label="Musik abspielen">▶</button>
        <button class="ws-global-player__control ws-global-player__control--stop" data-ws-global-stop type="button" aria-label="Musik stoppen">■</button>
      </div>
    </div>
    <button aria-controls="mobile" aria-expanded="false" aria-label="Menü öffnen" class="burger" id="burger" type="button">☰</button>
  </header>
  <aside aria-label="Mobile Navigation" aria-hidden="true" class="mobile" id="mobile"><div class="mobile-head"><b>Warenschmiede</b><button aria-label="Menü schließen" id="close" type="button">×</button></div>${NAVIGATION.map(renderMobileItem).join('')}</aside>
  <div id="scrim"></div>`;

  const footer = `<footer class="ws-footer"><div class="ws-footer-inner"><div class="ws-footer-brand"><strong>Warenschmiede</strong><span>© <span id="copyright-year"></span> · Marco Hoffmann</span></div><nav aria-label="Fußnavigation" class="ws-footer-links"><a href="${link('kontakt/impressum.html')}">Impressum</a><a href="${link('datenschutz.html')}">Datenschutz</a><a href="${link('kontakt/kontakt.html')}">Kontakt</a></nav><p class="ws-footer-note">Alle Angaben ohne Gewähr. Keine Cookies, kein Tracking.</p></div></footer>`;

  const headerTarget = document.getElementById('ws-header');
  const footerTarget = document.getElementById('ws-footer');
  if (headerTarget) {
    headerTarget.innerHTML = header;
    ensureGlobalMusicPlayerAssets();
  }
  if (footerTarget) footerTarget.innerHTML = footer;
  ensureToolCatalog(loaded => {
    if (!loaded) return;
    document.querySelectorAll?.('[data-tool-id]').forEach(anchor => {
      const item = catalogItem({ toolId: anchor.dataset.toolId });
      if (!item.icon) return;
      anchor.classList.add(anchor.closest?.('.mobile-sub') ? 'mobile-tool-link' : 'mega-link--with-icon');
      anchor.href = link(item.href);
      anchor.innerHTML = anchor.closest?.('.mobile-sub')
        ? `${iconMarkup(item)}<span>${item.label}</span>`
        : `${iconMarkup(item)}<span class="ws-nav-tool-copy"><strong>${item.label}</strong><span>${item.description}</span></span>`;
      window.WSToolIdentity?.applyIcon(anchor.querySelector('img'), item.toolId);
    });
  });
  const year = document.getElementById('copyright-year');
  if (year) year.textContent = new Date().getFullYear();

  const groups = document.querySelectorAll('[data-menu]');
  const closeGroups = () => groups.forEach(group => {
    group.classList.remove('open');
    group.querySelector('button.nav-link')?.setAttribute('aria-expanded', 'false');
  });
  groups.forEach(group => {
    const button = group.querySelector('button.nav-link');
    button.addEventListener('click', event => {
      event.stopPropagation();
      const wasOpen = group.classList.contains('open');
      closeGroups();
      if (!wasOpen) {
        group.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
    group.addEventListener('click', event => event.stopPropagation());
  });

  const burger = document.getElementById('burger');
  const mobile = document.getElementById('mobile');
  const closeBtn = document.getElementById('close');
  const scrim = document.getElementById('scrim');
  function openMobile() {
    mobile?.classList.add('open');
    scrim?.classList.add('open');
    mobile?.setAttribute('aria-hidden', 'false');
    burger?.setAttribute('aria-expanded', 'true');
  }
  function closeMobile() {
    mobile?.classList.remove('open');
    scrim?.classList.remove('open');
    mobile?.setAttribute('aria-hidden', 'true');
    burger?.setAttribute('aria-expanded', 'false');
  }
  burger?.addEventListener('click', openMobile);
  closeBtn?.addEventListener('click', closeMobile);
  scrim?.addEventListener('click', closeMobile);

  const mobileSections = document.querySelectorAll('.mobile-section');
  mobileSections.forEach(button => button.addEventListener('click', () => {
    const sub = document.getElementById(button.getAttribute('aria-controls'));
    const wasOpen = sub?.classList.contains('open');
    mobileSections.forEach(other => {
      document.getElementById(other.getAttribute('aria-controls'))?.classList.remove('open');
      other.setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      sub?.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
  }));

  document.addEventListener('click', closeGroups);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeGroups();
      closeMobile();
    }
  });
})();
