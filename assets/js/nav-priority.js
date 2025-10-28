(() => {
  const navList = document.getElementById('navList');
  const navMore = document.getElementById('navMore');
  const navMoreMenu = document.getElementById('navMoreMenu');
  const navMoreBtn = navMore ? navMore.querySelector('.nav-more-btn') : null;

  if (!navList || !navMore || !navMoreMenu || !navMoreBtn) {
    return;
  }

  const navToggle = document.querySelector('[data-nav-toggle]');
  const mqDesktop = window.matchMedia('(min-width: 1024px)');

  const closeDropdown = () => {
    navMoreBtn.setAttribute('aria-expanded', 'false');
    navMoreMenu.hidden = true;
  };

  const openDropdown = () => {
    navMoreBtn.setAttribute('aria-expanded', 'true');
    navMoreMenu.hidden = false;
  };

  const updateMoreActiveState = () => {
    const hasActiveLink = !!navMoreMenu.querySelector('.nav-link.active, .nav-link.is-active');
    navMoreBtn.classList.toggle('active', hasActiveLink);
  };

  const restoreItems = () => {
    while (navMoreMenu.firstChild) {
      navList.insertBefore(navMoreMenu.firstChild, navMore);
    }
  };

  const collapse = () => {
    restoreItems();
    closeDropdown();

    navMore.style.display = 'none';
    navMore.style.visibility = '';

    if (!mqDesktop.matches) {
      updateMoreActiveState();
      return;
    }

    navMore.style.display = 'block';
    navMore.style.visibility = 'hidden';

    const computeAvailable = () => navList.clientWidth - navMore.offsetWidth - 8;

    const getLastVisible = () => {
      const items = Array.from(navList.children);
      const moreIndex = items.indexOf(navMore);
      if (moreIndex <= 0) {
        return null;
      }
      return items[moreIndex - 1];
    };

    let available = computeAvailable();

    while (navList.scrollWidth > available && navList.children.length > 1) {
      const lastVisible = getLastVisible();
      if (!lastVisible || lastVisible === navMore) {
        break;
      }

      navMoreMenu.insertBefore(lastVisible, navMoreMenu.firstChild);
      available = computeAvailable();
    }

    const hasOverflow = navMoreMenu.children.length > 0;
    navMore.style.visibility = '';
    navMore.style.display = hasOverflow ? 'block' : 'none';

    if (!hasOverflow) {
      closeDropdown();
    }

    updateMoreActiveState();
  };

  const scheduleCollapse = () => {
    window.requestAnimationFrame(collapse);
  };

  window.addEventListener('load', scheduleCollapse);
  window.addEventListener('resize', scheduleCollapse);

  if (typeof mqDesktop.addEventListener === 'function') {
    mqDesktop.addEventListener('change', scheduleCollapse);
  } else if (typeof mqDesktop.addListener === 'function') {
    mqDesktop.addListener(scheduleCollapse);
  }

  navToggle?.addEventListener('click', () => {
    closeDropdown();
  });

  navMoreBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const isOpen = navMoreBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (!navMore.contains(event.target)) {
      closeDropdown();
    }
  });

  navMoreMenu.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest('a');
    if (link) {
      closeDropdown();
    }
  });

  const handleEscape = (event) => {
    if (event.key === 'Escape') {
      closeDropdown();
      navMoreBtn.focus();
    }
  };

  navMoreBtn.addEventListener('keydown', handleEscape);
  navMoreMenu.addEventListener('keydown', handleEscape);

  const observer = new MutationObserver(() => {
    updateMoreActiveState();
  });

  observer.observe(navList, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  observer.observe(navMoreMenu, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  scheduleCollapse();
})();
