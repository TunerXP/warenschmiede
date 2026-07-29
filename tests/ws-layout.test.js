const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const layoutSource = fs.readFileSync('assets/js/ws-layout.js', 'utf8');

function renderLayout(pathname = '/') {
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
    window: { location: { origin: 'https://www.warenschmiede.com', pathname } }
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
