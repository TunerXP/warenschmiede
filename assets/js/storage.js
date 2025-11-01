(function (global) {
  'use strict';

  function hasLocalStorage() {
    try {
      return typeof global.localStorage !== 'undefined';
    } catch (error) {
      return false;
    }
  }

  function safeGet(key) {
    if (!hasLocalStorage()) {
      return null;
    }
    try {
      return global.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeSet(key, value) {
    if (!hasLocalStorage()) {
      return;
    }
    try {
      global.localStorage.setItem(key, value);
    } catch (error) {
      // ignore write errors
    }
  }

  function safeRemove(key) {
    if (!hasLocalStorage()) {
      return;
    }
    try {
      global.localStorage.removeItem(key);
    } catch (error) {
      // ignore removal errors
    }
  }

  global.wsStorage = {
    get: safeGet,
    set: safeSet,
    remove: safeRemove
  };
})(typeof window !== 'undefined' ? window : this);
