const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function loadCatalog() {
  const window = {};
  vm.runInNewContext(read('assets/js/ws-tool-catalog.js'), { window });
  return window.WSToolCatalog;
}

test('central tool catalog contains complete, immutable code-tool identities', () => {
  const catalog = loadCatalog();
  assert.deepEqual(Object.keys(catalog), ['barcode', 'qr', 'datamatrix']);
  assert.equal(Object.isFrozen(catalog), true);
  assert.equal(new Set(Object.values(catalog).map(tool => tool.id)).size, 3);
  for (const [id, tool] of Object.entries(catalog)) {
    assert.equal(tool.id, id);
    assert.equal(Object.isFrozen(tool), true);
    for (const key of ['name', 'description', 'href', 'icon']) assert.ok(tool[key], `${id}.${key}`);
    for (const key of ['href', 'icon']) assert.match(tool[key], /^\//, `${id}.${key}`);
  }
  assert.equal(catalog.datamatrix.icon, '/tools/datamatrix-werkstatt/datamatrix-werkstatt-icon.png');
  assert.equal(catalog.datamatrix.cardImage, '/tools/datamatrix-werkstatt/datamatrix-werkstatt-card.png');
});

test('three code tools load the catalog before the deferred shared menu', () => {
  for (const file of ['tools/BarcodeWerkstattPlus.html', 'tools/QRCodeMasterPro.html', 'tools/DataMatrixWerkstattPlus.html']) {
    const html = read(file);
    assert.ok(html.indexOf('ws-tool-catalog.js') < html.indexOf('ws-tool-menu.js'), file);
    assert.match(html, /ws-tool-catalog\.js[^>]*defer|defer[^>]*ws-tool-catalog\.js/);
  }
});

test('menu resolves catalog identities while retaining overrides and regular actions', () => {
  const menu = read('assets/js/ws-tool-menu.js');
  assert.match(menu, /catalogTool\(options\.toolId\)/);
  assert.match(menu, /Object\.hasOwn\(options, key\)/);
  assert.match(menu, /tool\?\.\[catalogKey\] \|\| defaults\[key\]/);
  assert.match(menu, /typeof resolved\.action === 'function'/);
  assert.match(menu, /resolved\.event/);
  assert.match(menu, /resolved\.tone === 'danger'/);
  assert.match(menu, /addEventListener\('error',[\s\S]*image\.src = defaultIcon/);
  assert.match(menu, /icon\.alt = ''/);
  assert.match(menu, /aria-hidden/);
});

test('tool-family links use IDs and menu icons stay within existing entry layout', () => {
  const barcode = read('tools/barcode-werkstatt/app.js');
  const qr = read('tools/QRCodeMasterPro.html');
  const datamatrix = read('tools/datamatrix-werkstatt/app.js');
  assert.match(barcode, /toolId: 'barcode'/);
  assert.match(barcode, /\{ toolId: 'qr' \}[\s\S]*\{ toolId: 'datamatrix' \}/);
  assert.match(qr, /toolId: 'qr'/);
  assert.match(qr, /\{ toolId: 'barcode' \}[\s\S]*\{ toolId: 'datamatrix' \}/);
  assert.match(datamatrix, /toolId:'datamatrix'/);
  assert.match(datamatrix, /\{toolId:'barcode'\},\{toolId:'qr'\}/);

  const css = read('assets/css/ws-tool-menu.css');
  assert.match(css, /grid-template-columns:34px minmax\(0,1fr\)/);
  assert.match(css, /\.ws-tool-link-icon \{[^}]*width:34px; height:34px; object-fit:contain/);
  assert.doesNotMatch(css, /\.ws-tool-link--with-icon[^}]*min-height/);
  assert.match(css, /\.ws-tool-panel \{[^}]*width:min\(390px, calc\(100vw - 24px\)\)/);
});

test('DataMatrix uses its existing artwork files and removes CSS placeholders', () => {
  const overview = read('tools/index.html');
  const main = read('tools/DataMatrixWerkstattPlus.html');
  const css = read('tools/datamatrix-werkstatt/app.css');
  assert.match(overview, /src="datamatrix-werkstatt\/datamatrix-werkstatt-card\.png"/);
  assert.match(main, /src="datamatrix-werkstatt\/datamatrix-werkstatt-icon\.png"/);
  assert.doesNotMatch(overview + main + css, /datamatrix-art|dm-logo/);
  assert.equal(fs.existsSync(path.join(root, 'tools/datamatrix-werkstatt/datamatrix-werkstatt-card.png')), true);
  assert.equal(fs.existsSync(path.join(root, 'tools/datamatrix-werkstatt/datamatrix-werkstatt-icon.png')), true);
});

test('items without icons remain text links and no inline image data is introduced', () => {
  const menu = read('assets/js/ws-tool-menu.js');
  assert.match(menu, /const iconClass = resolved\.icon \? ' ws-tool-link--with-icon' : ''/);
  assert.match(menu, /if \(resolved\.icon\) \{/);
  for (const file of [
    'assets/js/ws-tool-catalog.js',
    'assets/js/ws-tool-menu.js',
    'assets/css/ws-tool-menu.css',
    'tools/BarcodeWerkstattPlus.html',
    'tools/QRCodeMasterPro.html',
    'tools/DataMatrixWerkstattPlus.html',
    'tools/index.html'
  ]) assert.doesNotMatch(read(file), /data:image\//i, file);
});
