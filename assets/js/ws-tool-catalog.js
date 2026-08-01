(() => {
  const tools = {
    barcode: {
      id: 'barcode',
      name: 'Barcode-Werkstatt Plus',
      description: 'Strichcodes, Serien, Etiketten und Druckbögen erstellen.',
      href: '/tools/BarcodeWerkstattPlus.html',
      icon: '/assets/img/barcode_logo.svg',
      iconScale: 1
    },
    qr: {
      id: 'qr',
      name: 'QR-Werkstatt Plus',
      description: 'Links, Kontakte, WLAN, Zahlungen und mehr erstellen.',
      href: '/tools/QRCodeMasterPro.html',
      icon: '/assets/img/qrcode_logo.png',
      iconScale: 1
    },
    datamatrix: {
      id: 'datamatrix',
      name: 'DataMatrix-Werkstatt Plus',
      description: 'Kompakte Codes für Inventar, Bauteile und Werkstatt.',
      href: '/tools/DataMatrixWerkstattPlus.html',
      icon: '/tools/datamatrix-werkstatt/datamatrix-werkstatt-icon.png',
      iconScale: 3.6,
      cardImage: '/tools/datamatrix-werkstatt/datamatrix-werkstatt-card.png'
    }
  };

  Object.values(tools).forEach(Object.freeze);
  window.WSToolCatalog = Object.freeze(tools);

  const get = toolId => tools[toolId] || null;
  const applyIcon = (imgElement, toolId) => {
    if (!imgElement) return null;
    const tool = get(toolId);
    if (!tool) return null;
    imgElement.src = tool.icon;
    imgElement.style?.setProperty('--ws-tool-icon-scale', String(tool.iconScale || 1));
    return tool;
  };
  window.WSToolIdentity = Object.freeze({ get, applyIcon });

  const applyDeclaredIcons = () => document.querySelectorAll('[data-ws-tool-icon]').forEach(image => {
    applyIcon(image, image.dataset.wsToolIcon);
  });
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyDeclaredIcons);
    else applyDeclaredIcons();
  }
})();
