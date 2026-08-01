(() => {
  const tools = {
    barcode: {
      id: 'barcode',
      name: 'Barcode-Werkstatt Plus',
      description: 'Strichcodes, Serien, Etiketten und Druckbögen erstellen.',
      href: '/tools/BarcodeWerkstattPlus.html',
      icon: '/assets/img/barcode_logo.svg'
    },
    qr: {
      id: 'qr',
      name: 'QR-Werkstatt Plus',
      description: 'Links, Kontakte, WLAN, Zahlungen und mehr erstellen.',
      href: '/tools/QRCodeMasterPro.html',
      icon: '/assets/img/qrcode_logo.png'
    },
    datamatrix: {
      id: 'datamatrix',
      name: 'DataMatrix-Werkstatt Plus',
      description: 'Kompakte Codes für Inventar, Bauteile und Werkstatt.',
      href: '/tools/DataMatrixWerkstattPlus.html',
      icon: '/tools/datamatrix-werkstatt/datamatrix-werkstatt-icon.png',
      cardImage: '/tools/datamatrix-werkstatt/datamatrix-werkstatt-card.png'
    }
  };

  Object.values(tools).forEach(Object.freeze);
  window.WSToolCatalog = Object.freeze(tools);
})();
