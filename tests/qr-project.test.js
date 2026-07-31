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

global.QRCodeStyling = class {
  append() {}
  download() {}
};

function loadQrApp() {
  const html = fs.readFileSync('tools/QRCodeMasterPro.html', 'utf8');
  const source = html.match(/<script>\n([\s\S]*?)<\/script>/)[1];
  const controls = [
    new MockControl('urlValue', 'https://www.warenschmiede.com/'),
    new MockControl('wifiSsid', ''),
    new MockControl('wifiPass', ''),
    new MockControl('wifiType', 'WPA', [['WPA'], ['WEP'], ['nopass']]),
    new MockControl('wifiHidden', 'false', [['false'], ['true']]),
    new MockControl('cryptoType', 'bitcoin', [['bitcoin'], ['ethereum'], ['litecoin']]),
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
    byId[id] = { id, textContent: '', innerHTML: '', classList: { add() {}, remove() {} } };
  }
  const modes = ['url', 'wifi', 'crypto'].map(mode => ({
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

  const api = new Function(`${source}\nreturn { captureState, applyState, selectMode, resetToDefaults, clearLocalDraft, saveLocalDraft, restoreLocalDraft, projectDocument, loadProjectFile, getMode: () => currentMode };`)();
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
  byId.cryptoType.value = 'ethereum';
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
  assert.equal(byId.cryptoType.value, 'bitcoin');
  assert.ok([byId.qrSize, byId.dotType, byId.wifiType, byId.wifiHidden, byId.cryptoType].every(select => select.selectedIndex >= 0));
});
