const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('tools/ws_3d_print_kostenrechner.html', 'utf8');
const appCss = fs.readFileSync('tools/3d-druck-kostenrechner-plus/app.css', 'utf8');
const appJs = fs.readFileSync('tools/3d-druck-kostenrechner-plus/app.js', 'utf8');

test('3D cost calculator is a frozen catalog tool', () => {
  const source = fs.readFileSync('assets/js/ws-tool-catalog.js', 'utf8');
  const context = { window: {}, document: { readyState: 'loading', addEventListener() {}, querySelectorAll() { return []; } } };
  vm.runInNewContext(source, context);
  const tool = context.window.WSToolCatalog['3d-cost'];
  assert.equal(tool.name, '3D-Druck Kostenrechner Plus');
  assert.equal(tool.description, 'Kalkulation, Angebot, Rechnung und Lieferschein.');
  assert.equal(tool.href, '/tools/ws_3d_print_kostenrechner.html');
  assert.equal(tool.icon, '/assets/img/tools/3d-druck-kostenrechner-plus/3d-druck-kostenrechner-plus-logo.png');
  assert.equal(tool.iconScale, 2.55);
  assert.ok(tool.iconScale > 2 && tool.iconScale < 3);
  assert.equal(tool.cardImage, '/assets/img/tools/3d-druck-kostenrechner-plus.png');
  assert.equal(fs.existsSync('.' + tool.icon), true);
  assert.equal(Object.isFrozen(tool), true);
});

test('header and shared menu expose the new navigation structure', () => {
  assert.match(html, /ws-tool-menu-btn ws-tool-menu-btn--label/);
  assert.match(html, /<h1[^>]*>.*3D-Druck Kostenrechner Plus.*<\/h1>/);
  assert.match(html, /Kalkulation · Angebot · Rechnung · Lieferschein/);
  const header = html.match(/<header class=\"sidebar-head[\s\S]*?<\/header>/)?.[0] || '';
  assert.doesNotMatch(header, /☰ Warenschmiede Tools|Anleitung öffnen|Einstellungen/);
  assert.match(header, /ws-tool-menu-btn[\s\S]*data-ws-tool-icon="3d-cost"[\s\S]*<h1/);
  assert.match(header, /ws-tool-identity-icon--large/);
  assert.match(appJs, /toolId: '3d-cost'/);
  assert.match(appJs, /side: 'left'/);
  for (const section of ['Projekt & Daten', 'Prüfen & Einstellungen', 'Hilfe', 'Passende Werkzeuge', '3D-Druck & Wissen', 'Warenschmiede']) assert.match(appJs, new RegExp(section));
  assert.match(appJs, /\{ toolId: 'qr' \}/);
  for (const action of ['remember', 'history', 'check', 'save', 'load', 'settings']) assert.match(appJs, new RegExp(`WSCostCalculatorActions\\.${action}`));
  assert.match(appJs, /init\(\)\{ window\.WSCostCalculatorInstance=this;/);
  assert.match(appJs, /calculator = \(\) => window\.WSCostCalculatorInstance \|\| null/);
  assert.doesNotMatch(appJs, /_x_dataStack/);
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
  assert.match(appCss, /--cost-sidebar-width: 580px/);
  assert.match(appCss, /var\(--cost-sidebar-width, 580px\)/);
  assert.match(appJs, /MIN_WIDTH = 460/);
  assert.match(appJs, /ABSOLUTE_MAX_WIDTH = 760/);
  assert.match(appJs, /window\.innerWidth \* \.55/);
  assert.match(appJs, /warenschmiede\.costcalc\.sidebarWidth\.v1/);
  assert.match(html, /role="separator"[^>]*aria-orientation="vertical"[^>]*tabindex="0"/);
  assert.match(appJs, /ArrowLeft.*ArrowRight/);
  assert.match(appJs, /addEventListener\('dblclick'/);
  assert.match(appCss, /@media \(max-width: 1100px\)[\s\S]*\.cost-resizer \{ display: none; \}/);
});

test('preferred sidebar width survives a narrow and wide resize cycle', () => {
  const scripts = [appJs].filter(source => source.includes('const STORAGE_KEY'));
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

test('calculator source is split without losing critical application methods', () => {
  assert.match(html, /href="3d-druck-kostenrechner-plus\/app\.css"/);
  assert.match(html, /defer src="3d-druck-kostenrechner-plus\/app\.js"/);
  assert.doesNotMatch(html, /<style[>\s]/);
  assert.doesNotMatch(html, /function app\(/);
  for (const method of ['init', 'snapshot', 'applySnapshot', 'subtotal', 'vat', 'total', 'documentLines', 'getPages', 'exportFile', 'importFile', 'printDoc', 'renderQr', 'rememberHistory', 'openPreflight']) {
    assert.match(appJs, new RegExp(`\\b${method}\\s*\\(`));
  }
});

test('settings dialog has stable desktop and responsive inner scrolling', () => {
  for (const className of ['cost-settings-dialog', 'cost-settings-head', 'cost-settings-layout', 'cost-settings-nav', 'cost-settings-content']) {
    assert.match(html, new RegExp(className));
  }
  assert.match(appCss, /width:min\(1280px, calc\(100vw - 24px\)\)/);
  assert.match(appCss, /height:min\(900px, calc\(100dvh - 24px\)\)/);
  assert.match(appCss, /grid-template-rows:auto minmax\(0,1fr\)/);
  assert.match(appCss, /\.cost-settings-dialog[\s\S]*?overflow:hidden/);
  assert.match(appCss, /\.cost-settings-nav[\s\S]*?overflow-y:auto/);
  assert.match(appCss, /\.cost-settings-content[\s\S]*?overflow-x:hidden[\s\S]*?overflow-y:auto/);
});

test('shared menu supports left panels while retaining right as the default', () => {
  const menuJs = fs.readFileSync('assets/js/ws-tool-menu.js', 'utf8');
  const menuCss = fs.readFileSync('assets/css/ws-tool-menu.css', 'utf8');
  assert.match(menuJs, /side: 'right'/);
  assert.match(menuJs, /options\.side === 'left' \? 'left' : 'right'/);
  assert.match(menuJs, /panel\.dataset\.side = config\.side/);
  assert.match(menuJs, /setAttribute\('data-side', config\.side\)/);
  assert.match(menuCss, /\.ws-tool-panel[\s\S]*transform:translateX\(104%\)/);
  assert.match(menuCss, /\.ws-tool-panel\[data-side="left"\][\s\S]*transform:translateX\(-104%\)/);
  assert.match(menuCss, /\.ws-tool-panel\.open \{ transform:translateX\(0\); \}/);
});
