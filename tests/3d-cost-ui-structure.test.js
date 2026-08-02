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
});

test('fixed output area keeps print and accessible compact controls', () => {
  const footer = html.match(/<footer class="sidebar-foot[\s\S]*?<\/footer>/)?.[0] || '';
  assert.match(footer, /PDF\/Druck/);
  for (const removed of ['>Merken<', '>History<', '>Prüfen<', '>Speichern<', '>Laden<']) assert.doesNotMatch(footer, new RegExp(removed));
  assert.match(footer, /x-model="output\.compactPdf"/);
  assert.match(footer, /x-model="output\.compactForceArticle"/);
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
