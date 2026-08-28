#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');
const path = require('path');

class FakeEventTarget {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }
  dispatch(type, detail) {
    for (const handler of this.listeners.get(type) || []) handler({ type, detail });
  }
}

class FakeButton extends FakeEventTarget {
  constructor() { super(); this.textContent = ''; this.title = ''; this.attrs = {}; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
}

class FakeClassList {
  toggle() {}
}

class FakeAudio extends FakeEventTarget {
  static lastInstance = null;
  constructor() {
    super();
    FakeAudio.lastInstance = this;
    this.preload = '';
    this.paused = true;
    this.ended = false;
    this.duration = 299;
    this.volume = 1;
    this._currentTime = 0;
    this._src = '';
    this.attrs = {};
  }
  get currentTime() { return this._currentTime; }
  set currentTime(value) { this._currentTime = Number(value); }
  get src() { return this._src; }
  set src(value) { this._src = value; this.attrs.src = value; }
  getAttribute(name) { return this.attrs[name] ?? null; }
  removeAttribute(name) { delete this.attrs[name]; if (name === 'src') this._src = ''; }
  load() {
    if (!this._src) return;
    this.dispatch('loadedmetadata');
    this.dispatch('canplay');
  }
  async play() {
    this.paused = false;
    this.ended = false;
    this.dispatch('play');
    return true;
  }
  pause() {
    this.paused = true;
    this.dispatch('pause');
  }
  advance(seconds) {
    this._currentTime += Number(seconds);
    this.dispatch('timeupdate');
  }
}

const playButton = new FakeButton();
const stopButton = new FakeButton();
const titleNode = { textContent: '' };
const statusNode = { textContent: '' };
const root = {
  hidden: true,
  classList: new FakeClassList(),
  querySelector(selector) {
    return {
      '[data-ws-global-play]': playButton,
      '[data-ws-global-stop]': stopButton,
      '[data-ws-global-title]': titleNode,
      '[data-ws-global-status]': statusNode,
    }[selector] || null;
  },
};

const storage = new Map();
const documentTarget = new FakeEventTarget();
const document = {
  querySelector(selector) { return selector === '[data-ws-global-player]' ? root : null; },
  dispatchEvent(event) { documentTarget.dispatch(event.type, event.detail); },
  addEventListener(type, handler) { documentTarget.addEventListener(type, handler); },
};
const windowTarget = new FakeEventTarget();
const windowObject = {
  addEventListener(type, handler) { windowTarget.addEventListener(type, handler); },
};
const sessionStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); },
};
class CustomEvent {
  constructor(type, options = {}) { this.type = type; this.detail = options.detail; }
}

const context = vm.createContext({
  window: windowObject,
  document,
  sessionStorage,
  CustomEvent,
  Audio: FakeAudio,
  console,
  Number,
  Math,
  JSON,
  Boolean,
  String,
});

const scriptPath = path.join(__dirname, '..', 'assets', 'js', 'ws-global-music-player.js');
vm.runInContext(fs.readFileSync(scriptPath, 'utf8'), context, { filename: scriptPath });

(async () => {
  const player = windowObject.WSGlobalMusicPlayer;
  if (!player) throw new Error('WSGlobalMusicPlayer wurde nicht initialisiert');

  player.loadTrack({ src: '/test.mp3', title: 'Test Song', album: 'Test' });
  const started = await player.play();
  if (!started) throw new Error('Fake-Wiedergabe konnte nicht gestartet werden');

  const audio = FakeAudio.lastInstance;
  audio.advance(1.25);
  const beforeCanPlay = audio.currentTime;
  audio.dispatch('canplay');
  const afterCanPlay = audio.currentTime;

  if (beforeCanPlay < 1) throw new Error(`Testaufbau fehlerhaft: beforeCanPlay=${beforeCanPlay}`);
  if (afterCanPlay < 1) {
    throw new Error(`Regression: canplay springt die laufende Wiedergabe von ${beforeCanPlay.toFixed(2)}s auf ${afterCanPlay.toFixed(2)}s zurück`);
  }

  console.log('Globaler Musikplayer Runtime: OK');
  console.log(`- Position vor canplay: ${beforeCanPlay.toFixed(2)}s`);
  console.log(`- Position nach canplay: ${afterCanPlay.toFixed(2)}s`);
})().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
