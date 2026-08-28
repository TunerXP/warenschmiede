const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const layoutSource = fs.readFileSync('assets/js/ws-layout.js', 'utf8');
const globalStyles = fs.readFileSync('assets/css/styles.css', 'utf8');

function renderLayout(pathname = '/', catalog) {
  const elements = {
    'ws-header': { innerHTML: '' },
    'ws-footer': { innerHTML: '' },
    'copyright-year': { textContent: '' }
  };
  const document = {
    body: { classList: { add() {} } },
    getElementById(id) { return elements[id] || null; },
    querySelectorAll() { return []; },
    addEventListener() {}
  };
  const context = {
    document,
    URL,
    window: { location: { origin: 'https://www.warenschmiede.com', pathname }, WSToolCatalog: catalog }
  };
  const testableSource = layoutSource.replace('const link = (path) => {', 'const link = globalThis.__link = (path) => {');
  vm.runInNewContext(testableSource, context);
  return { header: elements['ws-header'].innerHTML, link: context.__link };
}

test('link preserves root and other absolute destinations', () => {
  const { link } = renderLayout();

  assert.equal(link('/'), '/');
  assert.doesNotThrow(() => new URL(link('/'), 'https://www.warenschmiede.com'));
  assert.equal(link('/tools/'), '/tools/');
  assert.equal(link('downloads.html'), '/downloads.html');
  for (const destination of ['https://example.com', 'mailto:test@example.com', 'tel:+49123', '#top', '//cdn.example.com/file']) {
    assert.equal(link(destination), destination);
  }
});

test('desktop and mobile navigation render with an exact root start link', () => {
  const { header } = renderLayout();

  assert.match(header, /<nav aria-label="Hauptnavigation" class="desktop-nav">[\s\S]+<\/nav>/);
  assert.match(header, /<aside aria-label="Mobile Navigation"[\s\S]+<\/aside>/);
  assert.equal((header.match(/href="\/"/g) || []).length, 3);
  assert.doesNotMatch(header, /href="\/\/"/);
  assert.match(header, /href="\/downloads\.html"/);
});

test('KI navigation offers the overview as the first entry point', () => {
  const { header } = renderLayout('/ki/chat.html');
  const kiMenu = header.match(/<div class="mega-panel" id="desktop-menu-ki">[\s\S]*?<\/section><\/div><\/div><\/div>/)?.[0] || '';

  assert.match(kiMenu, /<strong>KI-Übersicht<\/strong><span>Der klare Einstieg: verstehen, sicher nutzen und den passenden Bereich finden\.<\/span>/);
  assert.match(kiMenu, /href="\/ki\/"/);
  assert.ok(kiMenu.indexOf('KI-Übersicht') < kiMenu.indexOf('KI kennenlernen'));
  assert.match(header, /mobile-menu-ki[\s\S]*?href="\/ki\/"[\s\S]*?<span>KI-Übersicht<\/span>/);
});

test('global edge buttons use a rounded skewed surface and keep all accent variants', () => {
  const buttonRules = globalStyles.slice(
    globalStyles.indexOf(':is(.ws-edge-button,.edge-button,.mini-edge){'),
    globalStyles.indexOf('.full-section{')
  );

  assert.match(buttonRules, /background:transparent;[\s\S]*?border:0;/);
  assert.match(buttonRules, /::before\{[\s\S]*?inset:0;[\s\S]*?background:var\(--btn-surface\);[\s\S]*?border-radius:var\(--btn-radius\);[\s\S]*?transform:skewX\(-10deg\)/);
  assert.match(buttonRules, /0 0 20px var\(--btn-glow\)/);
  assert.match(buttonRules, /\.mini-edge\{--btn-radius:7px/);
  assert.doesNotMatch(buttonRules, /clip-path|mask-composite|polygon\(/);
  for (const accent of ['amber', 'orange', 'blue', 'violet', 'green', 'red', 'steel']) {
    assert.match(buttonRules, new RegExp(`accent-${accent}`));
  }
});

test('tools overview keeps its actions on the global mini-edge class', () => {
  const toolsOverview = fs.readFileSync('tools/index.html', 'utf8');

  assert.match(toolsOverview, /class="mini-edge accent-/);
  assert.doesNotMatch(toolsOverview, /class="[^"]*tool-btn/);
});

test('mobile submenu category headings use a dark Warenschmiede orange', () => {
  const mobileHeading = globalStyles.match(/\.mobile-sub h3\{([^}]*)\}/)?.[1] || '';
  assert.match(mobileHeading, /color:#b45309/);
  assert.match(mobileHeading, /font-weight:900/);
  assert.match(mobileHeading, /font-size:\.7rem/);
  assert.match(mobileHeading, /letter-spacing:\.11em/);
  assert.match(mobileHeading, /text-transform:uppercase/);
  assert.doesNotMatch(globalStyles, /\.mega-group h3\{[^}]*#b45309/);
});

test('global tool navigation is catalog-driven and uses the shared medium icon size', () => {
  for (const id of ['qr', 'barcode', 'datamatrix']) {
    assert.match(layoutSource, new RegExp(`toolId: '${id}'`));
  }
  assert.match(layoutSource, /WSToolCatalog\?\.\[item\.toolId\]/);
  assert.match(layoutSource, /ws-nav-tool-icon ws-tool-identity-icon ws-tool-identity-icon--medium/);
  assert.match(globalStyles, /\.mega-link--with-icon\{display:grid;grid-template-columns:34px minmax\(0,1fr\)/);
  assert.match(globalStyles, /\.mobile-sub \.mobile-tool-link\{display:grid;grid-template-columns:34px minmax\(0,1fr\)/);
  assert.doesNotMatch(globalStyles, /\.mobile-sub a\{[^}]*grid-template-columns:34px/);
});

test('layout loads the catalog once and retains text fallback navigation', () => {
  assert.match(layoutSource, /if \(window\.WSToolCatalog\)/);
  assert.match(layoutSource, /querySelector\?\.\('script\[data-ws-tool-catalog\]'\)/);
  assert.match(layoutSource, /script\.src = '\/assets\/js\/ws-tool-catalog\.js'/);
  assert.match(layoutSource, /addEventListener\('error', \(\) => onReady\?\.\(false\)/);
  const { header } = renderLayout();
  for (const label of ['3D-Druck Kostenrechner Plus', 'QR-Werkstatt Plus', 'Barcode-Werkstatt Plus', 'DataMatrix-Werkstatt Plus']) {
    assert.match(header, new RegExp(label));
  }
  assert.equal((header.match(/data-tool-id="3d-cost"/g) || []).length, 2);
  assert.equal((header.match(/href="\/tools\/ws_3d_print_kostenrechner\.html"/g) || []).length, 2);
  assert.match(layoutSource, /toolId: '3d-cost', fallback: \{ label: '3D-Druck Kostenrechner Plus', href: 'tools\/ws_3d_print_kostenrechner\.html', description: 'Kalkulation, Angebot, Rechnung und Lieferschein\.' \}/);
  assert.doesNotMatch(header, /undefined/);
});

test('catalog enriches the 3D cost fallback with its central logo and scale', () => {
  const tool = {
    id: '3d-cost',
    name: '3D-Druck Kostenrechner Plus',
    description: 'Kalkulation, Angebot, Rechnung und Lieferschein.',
    href: '/tools/ws_3d_print_kostenrechner.html',
    icon: '/assets/img/tools/3d-druck-kostenrechner-plus/3d-druck-kostenrechner-plus-logo.png',
    iconScale: 2.55
  };
  const { header } = renderLayout('/', { '3d-cost': tool });
  assert.equal((header.match(/data-tool-id="3d-cost"/g) || []).length, 2);
  assert.equal((header.match(/3d-druck-kostenrechner-plus-logo\.png/g) || []).length, 2);
  assert.equal((header.match(/--ws-tool-icon-scale:2\.55/g) || []).length, 2);
  assert.equal((header.match(/href="\/tools\/ws_3d_print_kostenrechner\.html"/g) || []).length, 2);
  assert.doesNotMatch(header, /undefined/);
});
