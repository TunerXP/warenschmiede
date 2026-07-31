const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const qrWorkshop = fs.readFileSync('tools/QRCodeMasterPro.html', 'utf8');

test('QR workshop uses the shared action controls for all preview actions', () => {
  assert.match(qrWorkshop, /href="\.\.\/assets\/css\/ws-tool-controls\.css"/);

  const previewActions = qrWorkshop.match(/<div class="preview-buttons">([\s\S]*?)<\/div>/)?.[1] || '';
  assert.equal((previewActions.match(/ws-tool-action/g) || []).length, 5);
  assert.equal((previewActions.match(/ws-accent-steel/g) || []).length, 3);
  assert.match(previewActions, /id="btnGenerate"[^>]*ws-accent-blue|ws-accent-blue" id="btnGenerate"/);
  assert.match(previewActions, /ws-accent-green/);
});

test('QR header and preview grid follow the Barcode workshop layout', () => {
  assert.match(qrWorkshop, /\.topbar-inner\{\s*width:100%; max-width:1320px; margin:0 auto; padding:12px 20px 6px;/);
  assert.match(qrWorkshop, /\.preview-buttons\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(qrWorkshop, /@media\(max-width:760px\)[^{]*\{[\s\S]*?\.preview-buttons\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
