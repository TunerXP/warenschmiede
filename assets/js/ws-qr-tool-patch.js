
(function () {
  function patchQrToolHeader() {
    const title = document.querySelector('.brand h1');
    if (title) title.textContent = 'QR-Werkstatt Plus';

    const subtitle = document.querySelector('.brand small');
    if (subtitle) subtitle.remove();

    const topActions = document.querySelector('.top-actions');
    if (!topActions || !window.WarenschmiedeToolMenu) return;

    const help = document.getElementById('btnHelp');
    const theme = document.getElementById('btnTheme');

    if (theme) {
      theme.innerHTML = '🌓 <span class="hide-mobile">Hell/Dunkel</span>';
      theme.classList.remove('btn-primary', 'btn-blue', 'btn-good');
      theme.classList.add('btn-ghost');
    }

    if (help) {
      help.textContent = 'Hilfe';
      help.classList.remove('btn-primary');
      help.classList.add('btn-blue');
    }

    topActions.innerHTML = '';
    topActions.appendChild(window.WarenschmiedeToolMenu.createButton());
    if (theme) topActions.appendChild(theme);
    if (help) topActions.appendChild(help);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchQrToolHeader);
  } else {
    patchQrToolHeader();
  }
})();
