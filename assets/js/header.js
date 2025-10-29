(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');
  const navLinks = menu ? Array.from(menu.querySelectorAll('[data-nav-link]')) : [];
  const dropdowns = Array.from(document.querySelectorAll('[data-nav-dropdown]'))
    .map((root) => {
      const button = root.querySelector('.nav-more-btn');
      const dropdownMenu = root.querySelector('.nav-more-menu');
      if (!button || !dropdownMenu) {
        return null;
      }
      button.setAttribute('aria-expanded', button.getAttribute('aria-expanded') === 'true' ? 'true' : 'false');
      dropdownMenu.hidden = dropdownMenu.hidden ?? true;
      return { root, button, menu: dropdownMenu };
    })
    .filter(Boolean);

  const updateDropdownButtonState = (dropdown) => {
    const hasActiveLink = !!dropdown.menu.querySelector(
      '[data-nav-link].active, [data-nav-link].is-active, [data-nav-link][aria-current="page"]'
    );
    dropdown.button.classList.toggle('active', hasActiveLink);
    dropdown.button.classList.toggle('is-active', hasActiveLink);
  };

  const updateAllDropdownButtonStates = () => {
    dropdowns.forEach(updateDropdownButtonState);
  };

  const closeDropdown = (dropdown) => {
    dropdown.button.setAttribute('aria-expanded', 'false');
    dropdown.menu.hidden = true;
  };

  const openDropdown = (dropdown) => {
    dropdown.button.setAttribute('aria-expanded', 'true');
    dropdown.menu.hidden = false;
  };

  const closeAllDropdowns = () => {
    dropdowns.forEach(closeDropdown);
  };

  const toggleDropdown = (dropdown) => {
    const isExpanded = dropdown.button.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeDropdown(dropdown);
    } else {
      closeAllDropdowns();
      openDropdown(dropdown);
    }
  };

  const setLinkState = (link, isActive) => {
    link.classList.toggle('is-active', isActive);
    link.classList.toggle('active', isActive);
  };

  if (!header || !menu) {
    return;
  }

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    closeAllDropdowns();
  };

  const openMenu = () => {
    menu.classList.add('is-open');
    toggle?.setAttribute('aria-expanded', 'true');
  };

  const toggleMenu = () => {
    if (!toggle) {
      return;
    }
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  if (toggle) {
    toggle.addEventListener('click', toggleMenu);
    toggle.addEventListener('click', closeAllDropdowns);
  }

  menu.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest('a');
    if (link) {
      closeMenu();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (!toggle) {
      return;
    }
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });

  const mqDesktop = window.matchMedia('(min-width: 1024px)');
  mqDesktop.addEventListener('change', (event) => {
    if (event.matches) {
      closeMenu();
    }
  });

  const updateHeaderShadow = () => {
    const shouldStick = window.scrollY > 16;
    header.classList.toggle('is-scrolled', shouldStick);
  };

  updateHeaderShadow();
  window.addEventListener('scroll', updateHeaderShadow, { passive: true });

  const setActiveLink = (sectionId) => {
    if (!sectionId) {
      return false;
    }

    let updated = false;
    navLinks.forEach((link) => {
      if (link.dataset.section === sectionId) {
        setLinkState(link, true);
        updated = true;
      } else {
        setLinkState(link, false);
      }
    });
    updateAllDropdownButtonStates();
    return updated;
  };

  const normalizePath = (value) => {
    if (!value) {
      return '';
    }
    if (value.endsWith('/')) {
      return value;
    }
    return `${value}/`;
  };

  const matchesPathname = (candidate, pathname) => {
    if (!candidate) {
      return false;
    }

    const normalizedCandidate = normalizePath(candidate);
    const normalizedPath = normalizePath(pathname);
    if (pathname === candidate || normalizedPath === normalizedCandidate) {
      return true;
    }

    const indexCandidateA = `${candidate}index.html`;
    const indexCandidateB = `${normalizedCandidate}index.html`;
    return pathname === indexCandidateA || pathname === indexCandidateB;
  };

  const setActiveByPath = () => {
    const { pathname } = window.location;
    let matched = false;

    navLinks.forEach((link) => {
      const rawPath = link.dataset.path;
      if (!rawPath) {
        return;
      }

      const candidates = rawPath
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      if (candidates.some((candidate) => matchesPathname(candidate, pathname))) {
        navLinks.forEach((innerLink) => {
          setLinkState(innerLink, innerLink === link);
        });
        matched = true;
      }
    });

    if (matched) {
      updateAllDropdownButtonStates();
    }
    return matched;
  };

  const initializeActiveState = () => {
    if (setActiveByPath()) {
      return;
    }

    const hash = window.location.hash.replace('#', '');
    if (hash) {
      if (setActiveLink(hash)) {
        return;
      }
    }

    setActiveLink('start');
  };

  initializeActiveState();

  dropdowns.forEach((dropdown) => {
    dropdown.button.addEventListener('click', (event) => {
      event.preventDefault();
      toggleDropdown(dropdown);
    });

    dropdown.menu.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest('a')) {
        closeDropdown(dropdown);
      }
    });

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeDropdown(dropdown);
        dropdown.button.focus();
      }
    };

    dropdown.button.addEventListener('keydown', handleEscape);
    dropdown.menu.addEventListener('keydown', handleEscape);
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const insideDropdown = dropdowns.some(({ root }) => root.contains(event.target));
    if (!insideDropdown) {
      closeAllDropdowns();
    }
  });

  const sections = document.querySelectorAll('[data-section-target]');
  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
            const id = entry.target.getAttribute('data-section-target');
            setActiveLink(id);
          }
        });
      },
      { threshold: [0.35, 0.6], rootMargin: '-25% 0px -40% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }
})();
