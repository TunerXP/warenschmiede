(function () {
  var storageKey = 'theme-preference';
  var preferenceOrder = ['light', 'dark', 'system'];
  var iconMap = {
    light: '☀️',
    dark: '🌙',
    system: '🖥️'
  };
  var labelMap = {
    light: 'helles Design',
    dark: 'dunkles Design',
    system: 'Systemeinstellung'
  };

  var root = document.documentElement;
  var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var button = document.getElementById('themeToggleBtn');
  var iconSpan = document.getElementById('themeIcon');

  var readStoredPreference = function () {
    try {
      var stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  var updateMetaColorScheme = function (theme) {
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', theme);
    }
  };

  var resolveTheme = function (preference) {
    if (preference === 'system') {
      if (mediaQuery && typeof mediaQuery.matches === 'boolean') {
        return mediaQuery.matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return preference;
  };

  var updateButtonState = function (preference) {
    if (!button || !iconSpan) {
      return;
    }
    var icon = iconMap[preference] || iconMap.system;
    var label = labelMap[preference] || labelMap.system;
    iconSpan.textContent = icon;
    var accessibleLabel = 'Theme wechseln (aktuell: ' + label + ')';
    button.setAttribute('aria-label', accessibleLabel);
    button.setAttribute('title', accessibleLabel);
    var srLabel = button.querySelector('.theme-toggle__label');
    if (srLabel) {
      srLabel.textContent = 'Aktuelles Theme: ' + label;
    }
  };

  var currentPreference = root.dataset.themePreference || 'system';

  var applyPreference = function (preference, options) {
    if (options === void 0) { options = {}; }
    var persist = options.persist !== false;
    var resolved = resolveTheme(preference);
    root.dataset.themePreference = preference;
    root.dataset.theme = resolved;
    updateMetaColorScheme(resolved);
    updateButtonState(preference);
    currentPreference = preference;
    if (persist) {
      try {
        localStorage.setItem(storageKey, preference);
      } catch (error) {
        /* ignore write errors */
      }
    }
  };

  var storedPreference = readStoredPreference();
  if (storedPreference) {
    currentPreference = storedPreference;
  }

  applyPreference(currentPreference, { persist: false });

  if (button) {
    button.addEventListener('click', function () {
      var index = preferenceOrder.indexOf(currentPreference);
      if (index === -1) {
        index = preferenceOrder.length - 1;
      }
      var nextPreference = preferenceOrder[(index + 1) % preferenceOrder.length];
      applyPreference(nextPreference);
    });
  }

  var handleSystemChange = function () {
    if (currentPreference === 'system') {
      applyPreference('system', { persist: false });
    }
  };

  if (mediaQuery) {
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleSystemChange);
    }
  }
})();
