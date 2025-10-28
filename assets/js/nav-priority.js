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
  const COLLAPSE_SPACING = 8;

  const isStaticMenuItem = (item) => item.hasAttribute('data-nav-static');
  const isDynamicMenuItem = (item) => item.dataset.navDynamic === 'true';

  const collapsibleItems = () =>
    Array.from(navList.children).filter((item) => !item.classList.contains('nav-fixed') && item !== navMore);

  const dynamicMenuItems = () => Array.from(navMoreMenu.children).filter(isDynamicMenuItem);

  const syncOrders = () => {
    Array.from(navList.children).forEach((item, index) => {
      if (item === navMore) {
        return;
      }
      if (!item.dataset.navOrder) {
        item.dataset.navOrder = String(index);
      }
    });

    Array.from(navMoreMenu.children)
      .filter((item) => !isStaticMenuItem(item))
      .forEach((item, index) => {
        if (!item.dataset.navOrder) {
          item.dataset.navOrder = String(navList.children.length + index);
        }
      });
  };

  const closeDropdown = () => {
    navMoreBtn.setAttribute('aria-expanded', 'false');
    navMoreMenu.hidden = true;
  };

  const openDropdown = () => {
    navMoreBtn.setAttribute('aria-expanded', 'true');
    navMoreMenu.hidden = false;
  };

  const updateMoreActiveState = () => {
    const hasActiveLink = !!navMoreMenu.querySelector(
      '.nav-link.active, .nav-link.is-active, .nav-link[aria-current="page"]'
    );
    navMoreBtn.classList.toggle('active', hasActiveLink);
  };

  const updateMoreVisibility = () => {
    navMore.style.display = navMoreMenu.children.length > 0 ? 'block' : 'none';
  };

  const restoreDynamicItems = () => {
    const items = dynamicMenuItems();
    if (!items.length) {
      return;
    }

    items
      .sort((a, b) => {
        const orderA = Number(a.dataset.navOrder ?? Number.MAX_SAFE_INTEGER);
        const orderB = Number(b.dataset.navOrder ?? Number.MAX_SAFE_INTEGER);
        return orderA - orderB;
      })
      .forEach((item) => {
        item.removeAttribute('data-nav-dynamic');
        navList.insertBefore(item, navMore);
      });
  };

  const collapse = () => {
    closeDropdown();
    syncOrders();
    restoreDynamicItems();
    updateMoreVisibility();

    if (!mqDesktop.matches) {
      updateMoreActiveState();
      return;
    }

    let candidates = collapsibleItems();
    if (!candidates.length) {
      updateMoreActiveState();
      return;
    }

    const computeAvailable = () => navList.clientWidth - navMore.offsetWidth - COLLAPSE_SPACING;

    while (navList.scrollWidth > computeAvailable() && candidates.length) {
      const last = candidates[candidates.length - 1];
      if (!last || last === navMore) {
        break;
      }

      last.dataset.navDynamic = 'true';

      const firstStatic = Array.from(navMoreMenu.children).find(isStaticMenuItem);
      navMoreMenu.insertBefore(last, firstStatic ?? null);

      candidates = collapsibleItems();
    }

    updateMoreVisibility();
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

  const observerConfig = { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-current'] };

  observer.observe(navList, observerConfig);
  observer.observe(navMoreMenu, observerConfig);

  scheduleCollapse();
})();
