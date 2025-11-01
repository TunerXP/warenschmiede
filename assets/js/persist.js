(function (global) {
  'use strict';

  var STORAGE_NAMESPACE = 'wsCalc.';
  var storageApi = global.wsStorage || null;

  function hasStorage() {
    try {
      return typeof global.localStorage !== 'undefined';
    } catch (error) {
      return false;
    }
  }

  function resolveKey(sectionKey) {
    if (!sectionKey) {
      return null;
    }
    return STORAGE_NAMESPACE + sectionKey;
  }

  function readRaw(key) {
    if (!key) {
      return null;
    }
    if (storageApi && typeof storageApi.get === 'function') {
      return storageApi.get(key);
    }
    if (!hasStorage()) {
      return null;
    }
    try {
      return global.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeRaw(key, value) {
    if (!key) {
      return;
    }
    if (storageApi && typeof storageApi.set === 'function') {
      storageApi.set(key, value);
      return;
    }
    if (!hasStorage()) {
      return;
    }
    try {
      global.localStorage.setItem(key, value);
    } catch (error) {
      // ignore write errors
    }
  }

  function removeRaw(key) {
    if (!key) {
      return;
    }
    if (storageApi && typeof storageApi.remove === 'function') {
      storageApi.remove(key);
      return;
    }
    if (!hasStorage()) {
      return;
    }
    try {
      global.localStorage.removeItem(key);
    } catch (error) {
      // ignore removal errors
    }
  }

  function loadSection(sectionKey) {
    var key = resolveKey(sectionKey);
    if (!key) {
      return null;
    }
    var raw = readRaw(key);
    if (!raw) {
      return null;
    }
    try {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function saveSection(sectionKey, dataObject) {
    var key = resolveKey(sectionKey);
    if (!key || !dataObject || typeof dataObject !== 'object') {
      return;
    }
    try {
      var serialized = JSON.stringify(dataObject);
      writeRaw(key, serialized);
    } catch (error) {
      // ignore serialization errors
    }
  }

  function clearSection(sectionKey) {
    var key = resolveKey(sectionKey);
    if (!key) {
      return;
    }
    removeRaw(key);
  }

  global.wsPersist = {
    loadSection: loadSection,
    saveSection: saveSection,
    clearSection: clearSection
  };
})(typeof window !== 'undefined' ? window : this);
