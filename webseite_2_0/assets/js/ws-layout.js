(function () {
  document.body.classList.add('ws-fixed-topbar');
  const script = document.currentScript;
  const src = script ? (script.getAttribute('src') || '') : '';
  const base = src.replace(/assets\/js\/ws-layout\.js(?:\?.*)?$/, '');
  const link = (path) => {
    if (!path || /^(https?:|mailto:|tel:|#|\/\/)/.test(path)) return path;
    return base + path;
  };

  const currentPath = (window.location.pathname || '').toLowerCase();
  const activeKey = (() => {
    if (currentPath.includes('/leistungen/')) return 'leistungen';
    if (currentPath.includes('/3d_druck/')) return '3d';
    if (currentPath.includes('/kontakt/') || currentPath.endsWith('/datenschutz.html')) return 'kontakt';
    if (currentPath.endsWith('/downloads.html')) return 'downloads';
    return 'start';
  })();
  const activeClass = (key) => key === activeKey ? ' is-active' : '';
  const ariaCurrent = (key) => key === activeKey ? ' aria-current="page"' : '';

  const header = `
<header class="topbar" id="top">
  <a aria-label="Warenschmiede Start" class="brand brand-wide-transparent" href="${link('index.html#start')}">
    <img alt="Warenschmiede Logo" class="brand-wide-transparent-logo" src="${link('assets/img/warenschmiede-logo-wide-clean-900.png')}">
  </a>
  <nav aria-label="Hauptnavigation" class="desktop-nav">
    <a class="nav-link nav-start${activeClass('start')}"${ariaCurrent('start')} href="${link('index.html#top')}">Start</a>
    <a class="nav-link${activeClass('downloads')}"${ariaCurrent('downloads')} href="${link('downloads.html')}">Downloads</a>

    <div class="nav-group mega" data-menu>
      <button class="nav-link" type="button">Online Tools<span>▾</span></button>
      <div class="mega-panel"><div class="mega-inner">
        <div class="mega-head"><h2>Online Tools</h2><p>Werkstatt, Rechner und Generatoren — schnell erfassbar und praxisnah.</p></div>
        <div class="mega-grid">
          <section data-accent="amber"><h3>Werkstatt &amp; Rechner</h3>
            <a class="mega-link" href="${link('tools/')}"><strong>Tool-Übersicht</strong><span>Zentrale Übersicht aller Browser-Tools.</span></a>
            <a class="mega-link" href="${link('tools/werkstatt-rechner.html')}"><strong>Werkstatt-Rechner Metall Plus</strong><span>Metall, Maße und praktische Helfer.</span></a>
            <a class="mega-link" href="${link('tools/winkel-rechner.html')}"><strong>Winkel-Rechner</strong><span>Schnelle Winkel- und Geometriehilfe.</span></a>
            <a class="mega-link" href="${link('tools/bild-konverter.html')}"><strong>Bilder Konverter / Editor</strong><span>Bilder lokal umwandeln und vorbereiten.</span></a>
          </section>
          <section data-accent="steel"><h3>3D-Druck &amp; Büro</h3>
            <a class="mega-link" href="${link('tools/ws_3d_print_kostenrechner.html')}"><strong>3D-Druck Kostenrechner Plus</strong><span>Angebot, Rechnung, Lieferschein und lokale Daten.</span></a>
            <a class="mega-link" href="${link('tools/cnc-fraesen-einrichtsblatt-plus/index.html')}"><strong>CNC Fräsen-Einrichtsblatt Plus</strong><span>Einrichtblätter und Maschineninfos.</span></a>
            <a class="mega-link" href="${link('tools/QRCodeMasterPro.html')}"><strong>QR-Werkstatt Plus</strong><span>QR-Codes, Links, WLAN und mehr.</span></a>
          </section>
          <section data-accent="blue"><h3>Arbeitszeit &amp; Alltag</h3>
            <a class="mega-link" href="${link('tools/Zeiterfassung_Plus.html')}"><strong>Zeiterfassung Plus</strong><span>Arbeitszeiten übersichtlich erfassen.</span></a>
            <a class="mega-link" href="${link('tools/ReceiptWriterPro.html')}"><strong>Quittungs-Werkstatt</strong><span>Quittungen direkt im Browser erstellen.</span></a>
          </section>
        </div>
      </div></div>
    </div>

    <div class="nav-group" data-menu>
      <button class="nav-link${activeClass('leistungen')}"${ariaCurrent('leistungen')} type="button">Leistungen<span>▾</span></button>
      <div class="drop-panel">
        <a href="${link('leistungen/3d-druck.html')}">3D-Druckauftrag</a>
        <a href="${link('leistungen/cad-prototyping.html')}">CAD &amp; Prototyping</a>
        <a href="${link('leistungen/pc-hilfe.html')}">PC-Hilfe</a>
      </div>
    </div>

    <div class="nav-group mega" data-menu>
      <button class="nav-link" type="button">Über KI<span>▾</span></button>
      <div class="mega-panel"><div class="mega-inner">
        <div class="mega-head"><h2>Über KI</h2><p>Praxisnah erklären, ohne Hype — kurze Einstiege, klare Wege.</p></div>
        <div class="mega-grid">
          <section data-accent="violet"><h3>Einsteigen</h3>
            <a class="mega-link" href="${link('ki/chat.html')}"><strong>Interaktiver KI-Versteher</strong><span>Fragen stellen und KI-Grundlagen verstehen.</span></a>
            <a class="mega-link" href="${link('ki/lexikon.html')}"><strong>KI-Lexikon</strong><span>Begriffe einfach erklärt.</span></a>
          </section>
          <section data-accent="blue"><h3>Arbeiten mit KI</h3>
            <a class="mega-link" href="${link('ki/prompts.html')}"><strong>Prompts für den Alltag</strong><span>Bessere Eingaben für bessere Ergebnisse.</span></a>
            <a class="mega-link" href="${link('ki/tools.html')}"><strong>KI-Werkzeuge</strong><span>Chat, Bild, Video, Audio und Büro-Tools.</span></a>
          </section>
          <section data-accent="green"><h3>Sicherheit &amp; Einordnung</h3>
            <a class="mega-link" href="${link('ki/chancen-und-risiken.html')}"><strong>KI: Chancen &amp; Risiken</strong><span>Nutzen, Grenzen und Stolperfallen.</span></a>
            <a class="mega-link" href="${link('ki/faq.html')}"><strong>KI-FAQ &amp; Sicherheit</strong><span>Häufige Fragen und Datenschutz-Gedanken.</span></a>
          </section>
        </div>
      </div></div>
    </div>

    <div class="nav-group" data-menu>
      <button class="nav-link${activeClass('kontakt')}"${ariaCurrent('kontakt')} type="button">Kontakt<span>▾</span></button>
      <div class="drop-panel">
        <a href="${link('kontakt/kontakt.html')}">Kontakt aufnehmen</a>
        <a href="${link('kontakt/ablauf-anfrage.html')}">Ablauf &amp; Anfrage</a>
        <a href="${link('kontakt/impressum.html')}">Impressum</a>
        <a href="${link('kontakt/ueber-mich.html')}">Über mich</a>
      </div>
    </div>

    <div class="nav-group mega" data-menu>
      <button class="nav-link${activeClass('3d')}"${ariaCurrent('3d')} type="button">3D-Druck<span>▾</span></button>
      <div class="mega-panel"><div class="mega-inner">
        <div class="mega-head"><h2>3D-Druck</h2><p>Wissen, Praxis, Materialien und Fehlerhilfe als klare Arbeitsbereiche.</p></div>
        <div class="mega-grid">
          <section data-accent="green"><h3>Grundlagen</h3>
            <a class="mega-link" href="${link('3d_druck/3ddruck-faq.html')}"><strong>Neu beim 3D-Druck?</strong><span>Startpunkt für Einsteiger.</span></a>
            <a class="mega-link" href="${link('3d_druck/technologien.html')}"><strong>FDM / SLA / SLS – Technologien</strong><span>Verfahren einfach vergleichen.</span></a>
            <a class="mega-link" href="${link('3d_druck/material.html')}"><strong>Materialwissen</strong><span>PLA, PETG, TPU und Einsatzfälle.</span></a>
          </section>
          <section data-accent="amber"><h3>Praxis</h3>
            <a class="mega-link" href="${link('3d_druck/slicer-einstellungen.html')}"><strong>Slicer &amp; Einstellungen</strong><span>Parameter, Profile und Stellschrauben.</span></a>
            <a class="mega-link" href="${link('3d_druck/druck-tipps.html')}"><strong>Tipps &amp; Abläufe / Kosten</strong><span>Von Idee bis fertigem Teil.</span></a>
          </section>
          <section data-accent="red"><h3>Hilfe &amp; Spezial</h3>
            <a class="mega-link" href="${link('3d_druck/fehlerdatenbank.html')}"><strong>Fehler &amp; Troubleshooting</strong><span>Probleme erkennen und lösen.</span></a>
            <a class="mega-link" href="${link('3d_druck/tpu-wissen.html')}"><strong>TPU Spezial-Wissen</strong><span>Flexibles Material verstehen.</span></a>
            <a class="mega-link" href="${link('3d_druck/wartung-reinigung.html')}"><strong>Wartung &amp; Reinigung</strong><span>Drucker pflegen und Probleme vermeiden.</span></a>
            <a class="mega-link" href="${link('3d_druck/ideenquellen.html')}"><strong>Ideenquellen &amp; Portale</strong><span>Vorlagen und Inspiration finden.</span></a>
          </section>
        </div>
      </div></div>
    </div>
  </nav>
  <button aria-label="Menü öffnen" class="burger" id="burger" type="button">☰</button>
</header>
<aside aria-label="Mobile Navigation" class="mobile" id="mobile">
  <div class="mobile-head"><b>Warenschmiede</b><button aria-label="Menü schließen" id="close" type="button">×</button></div>
  <a href="${link('index.html#top')}">Start</a>
  <a href="${link('downloads.html')}">Downloads</a>
  <button class="mobile-section" type="button">Online Tools<span>▾</span></button>
  <div class="mobile-sub"><a href="${link('tools/')}">Tool-Übersicht</a><a href="${link('tools/ws_3d_print_kostenrechner.html')}">3D-Druck Kostenrechner Plus</a><a href="${link('tools/QRCodeMasterPro.html')}">QR-Werkstatt Plus</a></div>
  <button class="mobile-section" type="button">Leistungen<span>▾</span></button>
  <div class="mobile-sub"><a href="${link('leistungen/3d-druck.html')}">3D-Druckauftrag</a><a href="${link('leistungen/cad-prototyping.html')}">CAD &amp; Prototyping</a><a href="${link('leistungen/pc-hilfe.html')}">PC-Hilfe</a></div>
  <button class="mobile-section" type="button">Über KI<span>▾</span></button>
  <div class="mobile-sub"><a href="${link('ki/chat.html')}">Interaktiver KI-Versteher</a><a href="${link('ki/lexikon.html')}">KI-Lexikon</a></div>
  <button class="mobile-section" type="button">Kontakt<span>▾</span></button>
  <div class="mobile-sub"><a href="${link('kontakt/kontakt.html')}">Kontakt aufnehmen</a><a href="${link('kontakt/ablauf-anfrage.html')}">Ablauf &amp; Anfrage</a><a href="${link('kontakt/impressum.html')}">Impressum</a><a href="${link('kontakt/ueber-mich.html')}">Über mich</a></div>
  <button class="mobile-section" type="button">3D-Druck<span>▾</span></button>
  <div class="mobile-sub"><a href="${link('3d_druck/3ddruck-faq.html')}">Neu beim 3D-Druck?</a><a href="${link('3d_druck/technologien.html')}">FDM / SLA / SLS – Technologien</a><a href="${link('3d_druck/material.html')}">Materialwissen</a><a href="${link('3d_druck/fehlerdatenbank.html')}">Fehler &amp; Troubleshooting</a><a href="${link('3d_druck/tpu-wissen.html')}">TPU Spezial-Wissen</a><a href="${link('3d_druck/wartung-reinigung.html')}">Wartung &amp; Reinigung</a></div>
</aside>
<div id="scrim"></div>`;

  const footer = `
<footer class="ws-footer">
  <div class="ws-footer-inner">
    <div class="ws-footer-brand"><strong>Warenschmiede</strong><span>© <span id="copyright-year"></span> · Marco Hoffmann</span></div>
    <nav aria-label="Fußnavigation" class="ws-footer-links">
      <a href="${link('kontakt/impressum.html')}">Impressum</a>
      <a href="${link('datenschutz.html')}">Datenschutz</a>
      <a href="${link('kontakt/kontakt.html')}">Kontakt</a>
    </nav>
    <p class="ws-footer-note">Alle Angaben ohne Gewähr. Keine Cookies, kein Tracking in der 2.0-Testbasis.</p>
  </div>
</footer>`;

  const headerTarget = document.getElementById('ws-header');
  const footerTarget = document.getElementById('ws-footer');
  if (headerTarget) headerTarget.innerHTML = header;
  if (footerTarget) footerTarget.innerHTML = footer;

  const year = document.getElementById('copyright-year');
  if (year) year.textContent = new Date().getFullYear();

  const groups = document.querySelectorAll('[data-menu]');
  const closeGroups = () => groups.forEach(g => g.classList.remove('open'));
  groups.forEach(group => {
    const button = group.querySelector('button.nav-link');
    button?.addEventListener('click', e => {
      e.stopPropagation();
      const wasOpen = group.classList.contains('open');
      closeGroups();
      if (!wasOpen) group.classList.add('open');
    });
  });

  const burger = document.getElementById('burger');
  const mobile = document.getElementById('mobile');
  const closeBtn = document.getElementById('close');
  const scrim = document.getElementById('scrim');
  function openMobile(){ mobile?.classList.add('open'); scrim?.classList.add('open'); }
  function closeMobile(){ mobile?.classList.remove('open'); scrim?.classList.remove('open'); }
  burger?.addEventListener('click', openMobile);
  closeBtn?.addEventListener('click', closeMobile);
  scrim?.addEventListener('click', closeMobile);
  document.querySelectorAll('.mobile-section').forEach(btn => {
    btn.addEventListener('click', () => btn.nextElementSibling?.classList.toggle('open'));
  });

  document.addEventListener('click', closeGroups);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeGroups(); closeMobile(); } });
})();