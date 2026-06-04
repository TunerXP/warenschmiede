(() => {
  const path = location.pathname;
  const root = path.includes('/tools/') ? '../' : '';
  const link = (p) => /^(https?:|mailto:|tel:|#|\/)/.test(p) ? p : root + p;
  const img = link('assets/img/w-tools-menu.png');

  function closeMenu() {
    document.querySelector('.ws-tool-panel')?.classList.remove('open');
    document.querySelector('.ws-tool-scrim')?.classList.remove('open');
  }
  function openMenu() {
    document.querySelector('.ws-tool-panel')?.classList.add('open');
    document.querySelector('.ws-tool-scrim')?.classList.add('open');
  }
  function build() {
    if (document.querySelector('.ws-tool-panel')) return;
    const scrim = document.createElement('div');
    scrim.className = 'ws-tool-scrim';
    scrim.addEventListener('click', closeMenu);

    const panel = document.createElement('aside');
    panel.className = 'ws-tool-panel';
    panel.setAttribute('aria-label', 'Warenschmiede Tool-Menü');
    panel.innerHTML = `
      <div class="ws-tool-head">
        <div class="ws-tool-title">
          <img src="${img}" alt="" aria-hidden="true">
          <div><strong>Warenschmiede Tools</strong><span>Kleine Navigation für Rechner und Generatoren.</span></div>
        </div>
        <button class="ws-tool-close" type="button" aria-label="Menü schließen">×</button>
      </div>
      <div class="ws-tool-list">
        <div class="ws-tool-section">
          <h3>Navigation</h3>
          <a class="ws-tool-link" href="${link('tools/')}"><strong>Tool-Übersicht</strong><span>Alle Browser-Tools und Helfer.</span></a>
          <a class="ws-tool-link" href="${link('downloads.html')}"><strong>Downloads</strong><span>Portable Programme und Anleitungen.</span></a>
          <a class="ws-tool-link" href="${link('index.html')}"><strong>Warenschmiede Startseite</strong><span>Zurück zur Homepage 2.0.</span></a>
        </div>
        <div class="ws-tool-section">
          <h3>Haupttools</h3>
          <a class="ws-tool-link" href="${link('tools/ws_3d_print_kostenrechner.html')}"><strong>3D-Druck Kostenrechner Plus</strong><span>Angebot, Rechnung und Lieferschein.</span></a>
          <a class="ws-tool-link" href="${link('tools/QRCodeMasterPro.html')}"><strong>QR-Werkstatt Plus</strong><span>QR-Codes, WLAN, Links und mehr.</span></a>
          <a class="ws-tool-link" href="${link('tools/BarcodeWerkstattPlus.html')}"><strong>Barcode-Werkstatt Plus</strong><span>EAN, Code128, Code39 und ITF-14.</span></a>
          <a class="ws-tool-link" href="${link('tools/Zeiterfassung_Plus.html')}"><strong>Zeiterfassung Plus</strong><span>Aktuelle Online-Version.</span></a>
          <a class="ws-tool-link" href="${link('tools/ReceiptWriterPro.html')}"><strong>Quittungs-Werkstatt</strong><span>Quittungen im Browser erstellen.</span></a>
        </div>
        <div class="ws-tool-section">
          <h3>Kontakt & Wissen</h3>
          <a class="ws-tool-link" href="${link('kontakt/kontakt.html')}"><strong>Kontakt aufnehmen</strong><span>Frage, Auftrag oder Rückmeldung senden.</span></a>
          <a class="ws-tool-link" href="${link('3d_druck/3ddruck-faq.html')}"><strong>3D-Druck Wissen</strong><span>FAQ, Material, Fehlerhilfe und Tipps.</span></a>
        </div>
      </div>
      <div class="ws-tool-foot">Dieses Menü ist zentral: spätere Tool-Links werden nur hier gepflegt.</div>
    `;
    panel.querySelector('.ws-tool-close').addEventListener('click', closeMenu);
    document.body.append(scrim, panel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  window.WSToolMenu = { build, open: openMenu, close: closeMenu };
  document.addEventListener('DOMContentLoaded', build);
})();