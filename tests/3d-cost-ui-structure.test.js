const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('tools/ws_3d_print_kostenrechner.html', 'utf8');

test('3D cost calculator is a frozen catalog tool', () => {
  const source = fs.readFileSync('assets/js/ws-tool-catalog.js', 'utf8');
  const context = { window: {}, document: { readyState: 'loading', addEventListener() {}, querySelectorAll() { return []; } } };
  vm.runInNewContext(source, context);
  const tool = context.window.WSToolCatalog['3d-cost'];
  assert.equal(tool.name, '3D-Druck Kostenrechner Plus');
  assert.equal(tool.description, 'Kalkulation, Angebot, Rechnung und Lieferschein.');
  assert.equal(tool.href, '/tools/ws_3d_print_kostenrechner.html');
  assert.ok(tool.icon);
  assert.equal(Object.isFrozen(tool), true);
});

test('header and shared menu expose the new navigation structure', () => {
  assert.match(html, /ws-tool-menu-btn ws-tool-menu-btn--label/);
  assert.match(html, /<h1[^>]*>.*3D-Druck Kostenrechner Plus.*<\/h1>/);
  assert.match(html, /Kalkulation · Angebot · Rechnung · Lieferschein/);
  const header = html.match(/<header class=\"sidebar-head[\s\S]*?<\/header>/)?.[0] || '';
  assert.doesNotMatch(header, /☰ Warenschmiede Tools|Anleitung öffnen|Einstellungen/);
  assert.match(html, /toolId: '3d-cost'/);
  for (const section of ['Projekt & Daten', 'Prüfen & Einstellungen', 'Hilfe', 'Passende Werkzeuge', '3D-Druck & Wissen', 'Warenschmiede']) assert.match(html, new RegExp(section));
  assert.match(html, /\{ toolId: 'qr' \}/);
  for (const action of ['remember', 'history', 'check', 'save', 'load', 'settings']) assert.match(html, new RegExp(`WSCostCalculatorActions\\.${action}`));
  assert.match(html, /init\(\)\{ window\.WSCostCalculatorInstance=this;/);
  assert.match(html, /calculator = \(\) => window\.WSCostCalculatorInstance \|\| null/);
  assert.doesNotMatch(html, /_x_dataStack/);
});

test('fixed output area keeps print and accessible compact controls', () => {
  const footer = html.match(/<footer class="sidebar-foot[\s\S]*?<\/footer>/)?.[0] || '';
  assert.match(footer, /PDF\/Druck/);
  for (const removed of ['>Merken<', '>History<', '>Prüfen<', '>Speichern<', '>Laden<']) assert.doesNotMatch(footer, new RegExp(removed));
  assert.match(footer, /x-model="output\.compactPdf"/);
  assert.match(footer, /x-model="output\.compactForceArticle"/);
  assert.match(footer, /x-show="output\.compactPdf" x-transition class="cost-compact-option"/);
  assert.match(footer, />Nur Artikel<\/span>/);
  assert.match(footer, /title="Blendet Kalkulationsdetails im Kompaktmodus aus und zeigt in der Ausgabe nur die Artikelpositionen\."/);
  assert.match(footer, /aria-label="Im Kompaktmodus nur Artikel anzeigen"/);
  assert.equal((footer.match(/aria-label=/g) || []).length >= 2, true);
  assert.equal((footer.match(/title=/g) || []).length >= 2, true);
  assert.match(footer, /role="tooltip"/);
});

test('sidebar is responsive, persisted, and keyboard resizable', () => {
  assert.match(html, /--cost-sidebar-width: 580px/);
  assert.match(html, /var\(--cost-sidebar-width, 580px\)/);
  assert.match(html, /MIN_WIDTH = 460/);
  assert.match(html, /ABSOLUTE_MAX_WIDTH = 760/);
  assert.match(html, /window\.innerWidth \* \.55/);
  assert.match(html, /warenschmiede\.costcalc\.sidebarWidth\.v1/);
  assert.match(html, /role="separator"[^>]*aria-orientation="vertical"[^>]*tabindex="0"/);
  assert.match(html, /ArrowLeft.*ArrowRight/);
  assert.match(html, /addEventListener\('dblclick'/);
  assert.match(html, /@media \(max-width: 1100px\)[\s\S]*\.cost-resizer \{ display: none; \}/);
});

test('preferred sidebar width survives a narrow and wide resize cycle', () => {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).filter(source => source.includes('const STORAGE_KEY'));
  assert.equal(scripts.length, 1);

  const handleListeners = new Map();
  const windowListeners = new Map();
  const domListeners = new Map();
  const attributes = new Map();
  const styles = new Map();
  const storage = new Map([['warenschmiede.costcalc.sidebarWidth.v1', '700']]);
  const add = (map, type, listener) => map.set(type, listener);
  const handle = {
    addEventListener(type, listener) { add(handleListeners, type, listener); },
    removeEventListener(type, listener) { if (handleListeners.get(type) === listener) handleListeners.delete(type); },
    setAttribute(name, value) { attributes.set(name, value); },
    setPointerCapture() {}
  };
  const document = {
    body: { classList: { add() {}, remove() {} } },
    documentElement: { style: { setProperty(name, value) { styles.set(name, value); } } },
    getElementById(id) { return id === 'costResizer' ? handle : null; },
    addEventListener(type, listener) { add(domListeners, type, listener); }
  };
  const window = {
    innerWidth: 1400,
    WSToolMenu: { configure() {} },
    addEventListener(type, listener) { add(windowListeners, type, listener); },
    alert() {}, open() { return null; }, location: {}
  };
  const localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); }
  };

  vm.runInNewContext(scripts[0], { window, document, localStorage, Math, Number, Object });
  domListeners.get('DOMContentLoaded')();
  assert.equal(styles.get('--cost-sidebar-width'), '700px');
  assert.equal(attributes.get('aria-valuenow'), '700');

  window.innerWidth = 1000;
  windowListeners.get('resize')();
  assert.equal(styles.get('--cost-sidebar-width'), '550px');
  assert.equal(storage.get('warenschmiede.costcalc.sidebarWidth.v1'), '700');

  window.innerWidth = 1400;
  windowListeners.get('resize')();
  assert.equal(styles.get('--cost-sidebar-width'), '700px');
  assert.equal(attributes.get('aria-valuenow'), '700');
});
