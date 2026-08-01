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

  const catalogTool = (toolId) => window.WSToolCatalog?.[toolId] || null;
  const applyToolIcon = (image, toolId, source) => {
    const tool = window.WSToolIdentity?.applyIcon(image, toolId);
    if (!tool) {
      image.src = link(source || defaultIcon);
      image.style.setProperty('--ws-tool-icon-scale', '1');
    }
    return image;
  };
  const withImageFallback = (image) => {
    image.addEventListener('error', () => {
      image.src = defaultIcon;
      image.style.setProperty('--ws-tool-icon-scale', '1');
    }, { once: true });
    return image;
  };

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
    const tool = catalogTool(item.toolId);
    const resolved = tool ? {
      label: tool.name,
      description: tool.description,
      href: tool.href,
      icon: tool.icon,
      ...item
    } : item;
    const element = resolved.href ? document.createElement('a') : document.createElement('button');
    const toneClass = resolved.tone === 'danger' ? ' ws-tool-link--danger' : '';
    const iconClass = resolved.icon ? ' ws-tool-link--with-icon' : '';
    element.className = `ws-tool-link${resolved.href ? '' : ' ws-tool-menu-action'}${toneClass}${iconClass}`;
    if (resolved.href) element.href = link(resolved.href);
    else {
      element.type = 'button';
      element.addEventListener('click', () => {
        closeMenu();
        if (typeof resolved.action === 'function') resolved.action();
        else if (resolved.event) document.dispatchEvent(new CustomEvent(resolved.event, { detail: resolved.detail }));
      });
    }
    const copy = document.createElement('span');
    copy.className = 'ws-tool-link-copy';
    const label = document.createElement('strong');
    label.textContent = resolved.label || '';
    copy.append(label);
    if (resolved.description) {
      const description = document.createElement('span');
      description.textContent = resolved.description;
      copy.append(description);
    }
    if (resolved.icon) {
      const iconFrame = document.createElement('span');
      iconFrame.className = 'ws-tool-identity-icon ws-tool-identity-icon--medium';
      const icon = withImageFallback(document.createElement('img'));
      applyToolIcon(icon, resolved.toolId, resolved.icon);
      icon.alt = '';
      icon.setAttribute('aria-hidden', 'true');
      iconFrame.append(icon);
      element.append(iconFrame);
    }
    element.append(copy);
    return element;
  }

  function render() {
    const panel = document.querySelector('.ws-tool-panel');
    if (!panel) return;
    const title = panel.querySelector('.ws-tool-title');
    title.replaceChildren();
    const iconFrame = document.createElement('span');
    iconFrame.className = 'ws-tool-identity-icon ws-tool-identity-icon--menu-head';
    const icon = withImageFallback(document.createElement('img'));
    applyToolIcon(icon, config.toolId, config.toolIcon);
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = config.toolName;
    const description = document.createElement('span');
    description.textContent = config.toolDescription;
    copy.append(name, description);
    iconFrame.append(icon);
    title.append(iconFrame, copy);

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
    const tool = catalogTool(options.toolId);
    const value = (key, catalogKey) => Object.hasOwn(options, key)
      ? options[key]
      : (tool?.[catalogKey] || defaults[key]);
    config = {
      toolId: options.toolId,
      toolName: value('toolName', 'name'),
      toolDescription: value('toolDescription', 'description'),
      toolIcon: value('toolIcon', 'icon'),
      sections: Array.isArray(options.sections) ? options.sections : defaults.sections
    };
    build();
    render();
  }

  window.WSToolMenu = { build, configure, open: openMenu, close: closeMenu };
  document.addEventListener('DOMContentLoaded', build);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
})();
