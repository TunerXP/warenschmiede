const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../tools/zeiterfassung-plus/app.js'), 'utf8');
function context(storage = {}) {
  const elements = new Proxy({}, { get: (map, id) => map[id] ||= { value: '', checked: false, classList: { add(){}, remove(){}, toggle(){}, contains(){ return true; } }, addEventListener(){}, focus(){}, textContent: '', innerHTML: '', appendChild(){} } });
  const localStorage = { getItem: key => Object.hasOwn(storage, key) ? storage[key] : null, setItem: (key, value) => storage[key] = value };
  const document = { getElementById: id => elements[id], querySelectorAll: () => [], addEventListener(){}, createElement: () => ({ classList:{}, style:{}, setAttribute(){}, appendChild(){}, click(){}, remove(){} }), body: { appendChild(){} }, activeElement: null };
  const sandbox = { console, document, localStorage, window: { addEventListener(){}, WSToolMenu: null }, Date, Math, JSON, Number, String, Set, Blob, URL: { createObjectURL(){}, revokeObjectURL(){} }, setTimeout(){}, confirm:()=>true, alert(){}, FileReader:function(){} };
  vm.createContext(sandbox); vm.runInContext(source, sandbox); return { sandbox, storage, elements };
}

test('produktive Speicherschlüssel bleiben exakt erhalten', () => {
  assert.match(source, /const ENTRY_KEY = 'ws_time_entries_plus_v1';/);
  assert.match(source, /const SETTINGS_KEY = 'ws_time_settings_plus_v1';/);
  assert.match(source, /const OLD_KEY = 'workTimeEntries_v2';/);
  assert.doesNotMatch(source, /ws_time_(?:entries|settings)_plus_v(?!1)/);
});

test('Berechnung, Monatssortierung, CSV und Druck bleiben kompatibel', () => {
  const { sandbox, elements } = context();
  assert.equal(sandbox.calcDuration('23:00', '12:00', 30), 750);
  assert.equal(sandbox.calcDuration('07:00', '16:00', 30), 510);
  assert.equal(sandbox.formatMinutes(510), '08:30');
  assert.match(source, /Datum;Start;Ende;Pause \(Minuten\);Dauer;Notiz\\n/);
  assert.match(source, /function prepareAndPrint\(\) \{\s*preparePrint\(\);\s*window\.print\(\);/);
  elements.monthPicker.value = '2026-08';
  vm.runInContext("entries = [{id:1,date:'2026-09-01',start:'07:00'},{id:2,date:'2026-08-02',start:'08:00'},{id:3,date:'2026-08-02',start:'07:00'}]", sandbox);
  assert.deepEqual(Array.from(sandbox.selectedMonthEntries(), e => e.id), [3, 2]);
});

test('Altdaten werden unter ENTRY_KEY mit unverändertem Eintragsformat übernommen', () => {
  const old = [{ id: 7, date:'2026-08-01', start:'23:00', end:'12:00', pause:30, note:'Nacht', duration:750 }];
  const { sandbox, storage } = context({ workTimeEntries_v2: JSON.stringify(old) });
  sandbox.loadData();
  const saved = JSON.parse(storage.ws_time_entries_plus_v1);
  assert.deepEqual(Object.keys(saved[0]), ['id','date','start','end','pause','note','duration']);
  assert.deepEqual(saved[0], old[0]);
});

test('Settings- und Backup-Schemata bleiben unverändert', () => {
  assert.match(source, /name: '',\s*company: '',\s*useDefaults: false,\s*useNote: false,\s*start: '07:00',\s*end: '16:00',\s*pause: 30,\s*note: ''/s);
  assert.match(source, /app: 'Zeiterfassung Plus',\s*version: 1,\s*created: new Date\(\)\.toISOString\(\),\s*settings,\s*entries/s);
  assert.match(source, /const importedEntries = Array\.isArray\(data\) \? data : data\.entries/);
});
