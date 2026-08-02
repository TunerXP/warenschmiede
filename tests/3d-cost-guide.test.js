const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('tools/ws_3d_print_kostenrechner_anleitung.html');
const css = read('tools/3d-druck-kostenrechner-plus/guide.css');
const js = read('tools/3d-druck-kostenrechner-plus/guide.js');
const app = read('tools/3d-druck-kostenrechner-plus/app.js');

test('guide uses separated local assets without framework or font CDNs', () => {
  assert.match(html, /3d-druck-kostenrechner-plus\/guide\.css/);
  assert.match(html, /3d-druck-kostenrechner-plus\/guide\.js/);
  assert.match(html, /\/assets\/css\/ws-tool-menu\.css/);
  assert.ok(html.indexOf('ws-tool-catalog.js') < html.indexOf('ws-tool-menu.js'));
  assert.ok(html.indexOf('ws-tool-menu.js') < html.indexOf('guide.js'));
  for (const external of ['cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com']) assert.doesNotMatch(html, new RegExp(external.replaceAll('.', '\\.')));
  assert.doesNotMatch(html, /<style\b|<script(?![^>]*\bsrc=)/);
});

test('guide is light, wide, readable, responsive and printable', () => {
  assert.match(css, /--page:#eef6fc/);
  assert.match(css, /--card:#fff/);
  assert.doesNotMatch(css, /background:#0f172a/);
  assert.match(css, /width:min\(1600px,calc\(100% - 32px\)\)/);
  assert.match(css, /grid-template-columns:minmax\(290px,330px\) minmax\(0,1fr\)/);
  assert.match(css, /font:17px\/1\.7/);
  assert.match(css, /@media\(max-width:800px\)/);
  assert.match(css, /@media print/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});

test('guide states current version and current workflows', () => {
  assert.match(html, /Tool-Version 1\.9\.4/);
  assert.doesNotMatch(html, /Tool-Version 1\.9\.2|Anleitung 1\.0\.0/);
  for (const term of ['Tool-Menü', 'Merken', 'History', 'Projekt speichern', 'Projekt laden', 'Dokument prüfen', 'Einstellungen', 'PDF/Druck', 'Kompakt', 'Nur Artikel', 'Trenngriff']) assert.match(html, new RegExp(term));
  for (const tab of ['Firma', 'Logo &amp; Design', 'Zahlung', 'Steuer', 'Presets', 'QR-Code', 'Ausgabe', 'Daten']) assert.match(html, new RegExp(tab));
});

test('guide distinguishes storage and structured e-invoices', () => {
  assert.match(html, /History[^<]*(?:<[^>]+>)*[^<]*kein dauerhaftes/);
  assert.match(html, /Bearbeitbare Projektdatei/);
  assert.match(html, /Fertiges sichtbares Kundendokument/);
  assert.match(html, /JSON und fertiges PDF gemeinsam sichern/);
  assert.match(html, /keine strukturierte XRechnung/);
  assert.match(html, /keine ZUGFeRD-Datei/);
  assert.match(html, /PDF ist hier keine strukturierte E-Rechnung/);
});

test('tool menu and accessible navigation are configured', () => {
  assert.match(js, /toolId: '3d-cost', side: 'left'/);
  for (const term of ['Kostenrechner öffnen', 'Passende Werkzeuge', 'Materialwissen', 'Wartung & Reinigung', 'Fehler & Troubleshooting', 'Warenschmiede']) assert.match(js, new RegExp(term.replace('&', '&')));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /nav class="toc" aria-label="Inhaltsverzeichnis"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-label="Nach oben scrollen"/);
  assert.match(js, /IntersectionObserver/);
});

test('help popup is larger, bounded and centered without changing calculator logic', () => {
  assert.match(app, /Math\.min\(1380/);
  assert.match(app, /Math\.min\(900/);
  assert.match(app, /availableWidth - 80/);
  assert.match(app, /availableHeight - 80/);
  assert.match(app, /\(availableWidth - width\) \/ 2/);
  assert.match(app, /\(availableHeight - height\) \/ 2/);
  assert.match(app, /resizable=yes,scrollbars=yes/);
  assert.match(app, /Bitte erlauben Sie Pop-ups/);
});
