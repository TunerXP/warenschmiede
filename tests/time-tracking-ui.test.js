const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const html = read('tools/Zeiterfassung_Plus.html');
const js = read('tools/zeiterfassung-plus/app.js');
const catalog = read('assets/js/ws-tool-catalog.js');
const layout = read('assets/js/ws-layout.js');

test('CSS und klassisches JavaScript sind in sicherer Reihenfolge ausgelagert', () => {
  assert.ok(fs.existsSync(path.join(__dirname, '../tools/zeiterfassung-plus/app.css')));
  assert.ok(html.indexOf('ws-tool-catalog.js') < html.indexOf('ws-tool-menu.js'));
  assert.ok(html.indexOf('ws-tool-menu.js') < html.indexOf('zeiterfassung-plus/app.js'));
  assert.match(html, /href="zeiterfassung-plus\/app\.css"/);
  assert.doesNotMatch(html, /<style[\s>]/);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>[\s\S]+?<\/script>/);
  assert.doesNotMatch(html, /type="module"/);
});

test('Kopfzeile, rechter Menüaufbau und Android-Links sind vorhanden', () => {
  assert.match(html, /data-ws-tool-icon="time"/);
  assert.match(html, /Tool-Menü und Einstellungen öffnen/);
  assert.match(js, /toolId: 'time', side: 'right'/);
  assert.match(js, /\/downloads\.html#zeiterfassung-plus/);
  assert.match(js, /\/dateien\/zeiterfassung-plus\/Zeiterfassung_Plus\.apk/);
  assert.match(js, /window\.WSTimeTrackingActions = Object\.freeze/);
});

test('Einstellungen sind ein zugänglicher Dialog mit allen Bestands-IDs', () => {
  for (const id of ['setName','setCompany','setUseDefaults','setUseNote','setStart','setEnd','setPause','setNote','settingsSummary']) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /id="settingsModal"/); assert.match(html, /role="dialog"/); assert.match(html, /aria-modal="true"/);
  assert.doesNotMatch(html, /id="settingsCard"/);
  assert.match(js, /function openSettingsModal/); assert.match(js, /function closeSettingsModal/); assert.match(js, /event\.key === 'Escape'/);
});

test('Katalog und Website-Menü lösen Zeiterfassung Plus sicher auf', () => {
  for (const value of ["id: 'time'", "name: 'Zeiterfassung Plus'", "href: '/tools/Zeiterfassung_Plus.html'", "icon: '/assets/img/tools/zeiterfassung-plus.png'", "cardImage: '/assets/img/tools/zeiterfassung-plus.png'"]) assert.ok(catalog.includes(value));
  assert.match(catalog, /Object\.values\(tools\)\.forEach\(Object\.freeze\)/);
  assert.match(layout, /toolId: 'time', fallback: \{ label: 'Zeiterfassung Plus', href: 'tools\/Zeiterfassung_Plus\.html'/);
});
