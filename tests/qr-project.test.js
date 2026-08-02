const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

class MockControl {
  constructor(id, value = '', options = null) {
    this.id = id;
    this.value = value;
    this.defaultValue = value;
    this.type = 'text';
    this.checked = false;
    this.defaultChecked = false;
    this.listeners = {};
    if (options) {
      Object.setPrototypeOf(this, HTMLSelectElement.prototype);
      this.options = options.map(([optionValue, defaultSelected = false]) => ({ value: optionValue, defaultSelected }));
      this._selectedIndex = Math.max(0, this.options.findIndex(option => option.value === value));
    }
  }
  addEventListener(type, callback) { this.listeners[type] = callback; }
  get selectedIndex() { return this._selectedIndex; }
  set selectedIndex(index) {
    this._selectedIndex = index;
    this.value = index >= 0 ? this.options[index].value : '';
  }
}

class HTMLSelectElement extends MockControl {}
global.HTMLSelectElement = HTMLSelectElement;
global.CSS = { escape: value => value };
global.window = { WSQRPayloads: require('../tools/qr-werkstatt/payloads.js') };
global.crypto = require('node:crypto').webcrypto;

global.QRCodeStyling = class {
  append() {}
  download() {}
};

function loadQrApp() {
  const html = fs.readFileSync('tools/QRCodeMasterPro.html', 'utf8');
  const source = html.match(/<script>\n([\s\S]*?)<\/script>/)[1];
  const controls = [
    new MockControl('urlValue', 'https://www.warenschmiede.com/'),
    new MockControl('textValue', ''),
    new MockControl('paymentUrl', ''),
    new MockControl('wifiSsid', ''),
    new MockControl('wifiPass', ''),
    new MockControl('wifiType', 'WPA', [['WPA'], ['WEP'], ['nopass']]),
    new MockControl('wifiHidden', 'false', [['false'], ['true']]),
    new MockControl('eventUid', ''),
    new MockControl('qrSize', '300', [['240'], ['300', true], ['420'], ['600']]),
    new MockControl('dotType', 'rounded', [['rounded', true], ['square'], ['dots'], ['classy']]),
    new MockControl('dotColorText', '#102033'),
    new MockControl('dotColor', '#102033'),
    new MockControl('bgColorText', '#ffffff'),
    new MockControl('bgColor', '#ffffff')
  ];
  for (const id of ['transparentBg', 'autoUpdate']) {
    const control = new MockControl(id);
    control.type = 'checkbox';
    control.checked = id === 'autoUpdate';
    control.defaultChecked = control.checked;
    controls.push(control);
  }

  const byId = Object.fromEntries(controls.map(control => [control.id, control]));
  for (const id of ['modeHint', 'inputSummary', 'payloadBox', 'modePill', 'lengthPill', 'qr-output', 'toast', 'projectFileInput']) {
    byId[id] = { id, textContent: '', innerHTML: '', dataset: {}, classList: { add() {}, remove() {} } };
  }
  const modes = ['url', 'wifi', 'text', 'paymentlink', 'event'].map(mode => ({
    dataset: { mode },
    classList: { toggle(_name, active) { this.active = active; } }
  }));
  const sections = modes.map(mode => ({ dataset: { form: mode.dataset.mode }, classList: { toggle() {} } }));
  let domReady;
  let confirmResult = true;
  const storage = new Map();

  global.localStorage = {
    setItem: (key, value) => storage.set(key, value),
    getItem: key => storage.get(key) || null,
    removeItem: key => storage.delete(key)
  };
  global.confirm = () => confirmResult;
  global.document = {
    getElementById: id => byId[id] || null,
    addEventListener: (type, callback) => { if (type === 'DOMContentLoaded') domReady = callback; },
    querySelector(selector) {
      const match = selector.match(/data-mode="([^"]+)"/);
      return match ? modes.find(mode => mode.dataset.mode === match[1]) : null;
    },
    querySelectorAll(selector) {
      if (selector.includes('#forms') || selector.includes('.settings-panel-main')) return controls;
      if (selector === '.mode-btn') return modes;
      if (selector === '.form-section') return sections;
      return [];
    }
  };

  const api = new Function(`${source}\nreturn { captureState, applyState, selectMode, resetToDefaults, clearLocalDraft, saveLocalDraft, restoreLocalDraft, projectDocument, loadProjectFile, saveVersion, migrateProject, validateProject, getMode: () => currentMode, getVersions: () => projectVersions };`)();
  return { api, byId, controls, storage, setConfirm: value => { confirmResult = value; }, domReady: () => domReady };
}

test('WLAN project load restores QR mode, summary, design and options', async () => {
  const { api, byId } = loadQrApp();
  api.selectMode('wifi');
  assert.equal(byId.inputSummary.innerHTML, '<span>WLAN</span><span>SSID, Passwort, Typ</span>');
  byId.wifiSsid.value = 'Werkstatt';
  byId.qrSize.value = '600';
  byId.dotType.value = 'square';
  byId.dotColorText.value = '#123456';
  byId.transparentBg.checked = true;
  const projectFile = JSON.stringify(api.projectDocument());

  api.selectMode('url');
  byId.wifiSsid.value = '';
  byId.qrSize.value = '240';
  byId.dotType.value = 'dots';
  byId.dotColorText.value = '#102033';
  byId.transparentBg.checked = false;
  await api.loadProjectFile({ size: projectFile.length, text: async () => projectFile });
  assert.equal(api.getMode(), 'wifi');
  assert.equal(byId.inputSummary.innerHTML, '<span>WLAN</span><span>SSID, Passwort, Typ</span>');
  assert.equal(byId.wifiSsid.value, 'Werkstatt');
  assert.equal(byId.qrSize.value, '600');
  assert.equal(byId.dotType.value, 'square');
  assert.equal(byId.dotColor.value, '#123456');
  assert.equal(byId.transparentBg.checked, true);
});

test('local restore works and clearing can be cancelled or reset every select', () => {
  const { api, byId, storage, setConfirm } = loadQrApp();
  api.selectMode('wifi');
  byId.wifiType.value = 'WEP';
  byId.wifiHidden.value = 'true';
  byId.qrSize.value = '600';
  byId.dotType.value = 'square';
  api.saveLocalDraft();

  api.selectMode('url');
  assert.equal(api.restoreLocalDraft(), true);
  assert.equal(api.getMode(), 'wifi');
  assert.equal(byId.inputSummary.innerHTML, '<span>WLAN</span><span>SSID, Passwort, Typ</span>');

  setConfirm(false);
  api.clearLocalDraft();
  assert.equal(storage.size, 1);
  assert.equal(byId.wifiType.value, 'WEP');

  setConfirm(true);
  api.clearLocalDraft();
  assert.equal(storage.size, 0);
  assert.equal(api.getMode(), 'url');
  assert.equal(byId.inputSummary.innerHTML, '<span>Link</span><span>Webadresse</span>');
  assert.equal(byId.qrSize.value, '300');
  assert.equal(byId.dotType.value, 'rounded');
  assert.equal(byId.wifiType.value, 'WPA');
  assert.equal(byId.wifiHidden.value, 'false');
  assert.ok([byId.qrSize, byId.dotType, byId.wifiType, byId.wifiHidden].every(select => select.selectedIndex >= 0));
});

function project(schemaVersion, mode, values = {}, versions = []) {
  return { schema:'warenschmiede.qrWerkstatt.project', schemaVersion, state:{mode, values}, versions };
}

test('V2-Projekte und Versionszustände akzeptieren ausschließlich zentrale Modi', () => {
  const { api } = loadQrApp();
  for (const mode of ['wero', 'crypto', 'unbekannt']) {
    const migrated = api.migrateProject(project(2, mode));
    assert.equal(migrated.data.state.mode, mode);
    assert.equal(migrated.schemaMigrated, false);
    assert.throws(() => api.validateProject(migrated.data), /unbekannte oder unvollständige QR-Art/);
  }
  assert.throws(() => api.validateProject(project(2, 'url', {}, [{state:{mode:'unbekannt',values:{}}}])), /Version 1/);
});

test('nur V1 migriert Hauptzustand und Versionen mit passender Meldungsart', () => {
  const { api } = loadQrApp();
  const legacy = project(1, 'url', {urlValue:'https://example.de'}, [
    {number:1,state:{mode:'wero',values:{weroFallbackUrl:'https://pay.example'}}},
    {number:2,state:{mode:'crypto',values:{cryptoType:'bitcoin',cryptoAddress:'abc'}}}
  ]);
  const migrated = api.migrateProject(legacy);
  assert.equal(migrated.schemaMigrated, true);
  assert.equal(migrated.removedModeMigrated, true);
  assert.equal(migrated.data.state.mode, 'url');
  assert.equal(migrated.data.state.values.urlValue, 'https://example.de');
  assert.equal(migrated.data.versions[0].state.mode, 'paymentlink');
  assert.equal(migrated.data.versions[1].state.mode, 'text');
  const normal = api.migrateProject(project(1, 'wifi', {wifiSsid:'Gast'}));
  assert.equal(normal.schemaMigrated, true);
  assert.equal(normal.removedModeMigrated, false);
  assert.deepEqual(normal.data.state, {mode:'wifi',values:{wifiSsid:'Gast'}});
});

test('ungültige V2-Datei lässt Zustand und Versionsverlauf vollständig bestehen', async () => {
  const { api, byId } = loadQrApp();
  api.selectMode('wifi');
  byId.wifiSsid.value = 'Bestehend';
  api.saveVersion();
  const beforeState = structuredClone(api.captureState());
  const beforeVersions = structuredClone(api.getVersions());
  const invalid = JSON.stringify(project(2, 'wero', {paymentUrl:'https://evil.example'}));
  await api.loadProjectFile({size:invalid.length, text:async () => invalid});
  assert.deepEqual(api.captureState(), beforeState);
  assert.deepEqual(api.getVersions(), beforeVersions);
  assert.match(byId.toast.textContent, /unbekannte oder unvollständige QR-Art/);
});
