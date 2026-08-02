const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('tools/Zeiterfassung_Plus.html');
const css = read('tools/zeiterfassung-plus/app.css');
const js = read('tools/zeiterfassung-plus/app.js');
const guide = read('tools/Zeiterfassung_Plus_Anleitung.html');
const guideJs = read('tools/zeiterfassung-plus/guide.js');

test('Druck-Metadaten behalten vier Felder und Arbeitstage einzeilig', () => {
  const meta = html.match(/<div class="print-meta">([\s\S]*?)<\/div>\s*<table class="print-table">/)[1];
  assert.equal((meta.match(/<div>/g) || []).length, 4);
  assert.match(meta, /<strong>Arbeitstage<\/strong>/);
  assert.match(css, /\.print-meta div:nth-child\(4\) strong \{ white-space:nowrap; \}/);
  assert.match(js, /function preparePrint\(\)/);
});

test('Anleitung ist vollständig und von Anwendungsdaten getrennt', () => {
  for (const file of ['tools/Zeiterfassung_Plus_Anleitung.html', 'tools/zeiterfassung-plus/guide.css', 'tools/zeiterfassung-plus/guide.js']) assert.ok(fs.existsSync(path.join(root, file)));
  assert.doesNotMatch(guide, /zeiterfassung-plus\/app\.js/i);
  assert.doesNotMatch(guide + guideJs, /localStorage/);
  for (const heading of ['Schnellstart', 'Arbeitstag eintragen', 'Monate wechseln', 'Wochenübersicht', 'Detail und Kompakt', 'Lokale Speicherung', 'Datensicherung', 'Backup laden', 'JSON, CSV und PDF', 'Web und Android', 'Häufige Fragen']) assert.ok(guide.includes(heading), heading);
  for (const statement of ['JSON ist die Wiederherstellungssicherung', 'PDF und CSV ersetzen kein vollständiges Backup', 'Backup laden ersetzt aktuelle Einträge', 'Web und Android synchronisieren nicht automatisch']) assert.ok(guide.includes(statement), statement);
});

test('Inhaltsverzeichnis markiert genau den sichtbaren Abschnitt mit ARIA-Semantik', () => {
  assert.match(guideJs, /setAttribute\('aria-current', 'location'\)/);
  assert.match(guideJs, /removeAttribute\('aria-current'\)/);
  assert.doesNotMatch(guideJs, /toggleAttribute\('aria-current'/);
});

test('Anleitungslinks und unveränderliche Kompatibilitätswerte bleiben vorhanden', () => {
  assert.match(js, /title: 'Hilfe'[\s\S]*label: 'Anleitung öffnen'[\s\S]*Zeiterfassung_Plus_Anleitung\.html/);
  assert.match(html, /data-settings-panel="info"[\s\S]*Zeiterfassung_Plus_Anleitung\.html/);
  assert.match(html, /Zeiterfassung Plus Web-Version 1\.4/);
  for (const value of ["const ENTRY_KEY = 'ws_time_entries_plus_v1';", "const SETTINGS_KEY = 'ws_time_settings_plus_v1';", "const OLD_KEY = 'workTimeEntries_v2';", "const UI_SETTINGS_KEY = 'ws_time_ui_plus_v1';", "version: 1,"]) assert.ok(js.includes(value), value);
  assert.match(guide, /href="\/tools\/Zeiterfassung_Plus\.html"/);
});
