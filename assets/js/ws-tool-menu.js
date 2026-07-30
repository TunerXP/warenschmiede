(() => {
  const link = (path) => /^(https?:|mailto:|tel:|#|\/)/.test(path) ? path : '/' + path.replace(/^\.\//, '');
  const defaultIcon = link('assets/img/w-tools-menu.png');
  const defaults = {
    toolName: 'Warenschmiede Tools',
    toolDescription: 'Kleine Navigation für Rechner und Generatoren.',
    toolIcon: defaultIcon,
    sections: [
      {
        title: 'Navigation',
        items: [
          { label: 'Tool-Übersicht', description: 'Alle Browser-Tools und Helfer.', href: link('tools/') },
          { label: 'Downloads', description: 'Portable Programme und Anleitungen.', href: link('downloads.html') },
          { label: 'Warenschmiede Startseite', description: 'Zurück zur Warenschmiede Startseite.', href: '/' }
        ]
      },
      {
        title: 'Haupttools',
        items: [
          { label: '3D-Druck Kostenrechner Plus', description: 'Angebot, Rechnung und Lieferschein.', href: link('tools/ws_3d_print_kostenrechner.html') },
          { label: 'QR-Werkstatt Plus', description: 'QR-Codes, WLAN, Links und mehr.', href: link('tools/QRCodeMasterPro.html') },
          { label: 'Barcode-Werkstatt Plus', description: 'EAN, Code128, Code39 und ITF-14.', href: link('tools/BarcodeWerkstattPlus.html') },
          { label: 'Zeiterfassung Plus', description: 'Aktuelle Online-Version.', href: link('tools/Zeiterfassung_Plus.html') },
          { label: 'Quittungs-Werkstatt', description: 'Quittungen im Browser erstellen.', href: link('tools/ReceiptWriterPro.html') }
        ]
      },
      {
        title: 'Kontakt & Wissen',
        items: [
          { label: 'Kontakt aufnehmen', description: 'Frage, Auftrag oder Rückmeldung senden.', href: link('kontakt/kontakt.html') },
          { label: '3D-Druck Wissen', description: 'FAQ, Material, Fehlerhilfe und Tipps.', href: link('3d_druck/3ddruck-faq.html') }
        ]
      }
    ]
  };
  let config = defaults;
  let returnFocus = null;

  function closeMenu() {
    const panel = document.querySelector('.ws-tool-panel');
    panel?.classList.remove('open');
    panel?.setAttribute('aria-hidden', 'true');
    if (panel) panel.inert = true;
    document.querySelector('.ws-tool-scrim')?.classList.remove('open');
    returnFocus?.focus?.();
    returnFocus = null;
  }

  function openMenu() {
    build();
    returnFocus = document.activeElement;
    const panel = document.querySelector('.ws-tool-panel');
    panel?.classList.add('open');
    panel?.setAttribute('aria-hidden', 'false');
    if (panel) panel.inert = false;
    document.querySelector('.ws-tool-scrim')?.classList.add('open');
    panel?.querySelector('.ws-tool-close')?.focus();
  }

  function createItem(item) {
    const element = item.href ? document.createElement('a') : document.createElement('button');
    element.className = `ws-tool-link${item.href ? '' : ' ws-tool-action'}`;
    if (item.href) element.href = link(item.href);
    else {
      element.type = 'button';
      element.addEventListener('click', () => {
        closeMenu();
        if (typeof item.action === 'function') item.action();
        else if (item.event) document.dispatchEvent(new CustomEvent(item.event, { detail: item.detail }));
      });
    }
    const label = document.createElement('strong');
    label.textContent = item.label || '';
    element.append(label);
    if (item.description) {
      const description = document.createElement('span');
      description.textContent = item.description;
      element.append(description);
    }
    return element;
  }

  function render() {
    const panel = document.querySelector('.ws-tool-panel');
    if (!panel) return;
    const title = panel.querySelector('.ws-tool-title');
    title.replaceChildren();
    const icon = document.createElement('img');
    icon.src = link(config.toolIcon || defaultIcon);
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = config.toolName;
    const description = document.createElement('span');
    description.textContent = config.toolDescription;
    copy.append(name, description);
    title.append(icon, copy);

    const list = panel.querySelector('.ws-tool-list');
    list.replaceChildren();
    config.sections.forEach(section => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ws-tool-section';
      const heading = document.createElement('h3');
      heading.textContent = section.title || '';
      wrapper.append(heading, ...(section.items || []).map(createItem));
      list.append(wrapper);
    });
  }

  function build() {
    if (document.querySelector('.ws-tool-panel')) return;
    const scrim = document.createElement('div');
    scrim.className = 'ws-tool-scrim';
    scrim.addEventListener('click', closeMenu);

    const panel = document.createElement('aside');
    panel.className = 'ws-tool-panel';
    panel.setAttribute('aria-label', 'Warenschmiede Tool-Menü');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    panel.innerHTML = `
      <div class="ws-tool-head">
        <div class="ws-tool-title"></div>
        <button class="ws-tool-close" type="button" aria-label="Menü schließen">×</button>
      </div>
      <div class="ws-tool-list"></div>
      <div class="ws-tool-foot"><a href="${link('kontakt/impressum.html')}">Impressum</a> · <a href="${link('datenschutz.html')}">Datenschutz</a></div>
    `;
    panel.querySelector('.ws-tool-close').addEventListener('click', closeMenu);
    document.body.append(scrim, panel);
    render();
  }

  function configure(options = {}) {
    config = {
      toolName: options.toolName || defaults.toolName,
      toolDescription: options.toolDescription || defaults.toolDescription,
      toolIcon: options.toolIcon || defaults.toolIcon,
      sections: Array.isArray(options.sections) ? options.sections : defaults.sections
    };
    build();
    render();
  }

  window.WSToolMenu = { build, configure, open: openMenu, close: closeMenu };
  document.addEventListener('DOMContentLoaded', build);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
})();
