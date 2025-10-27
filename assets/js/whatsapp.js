(() => {
  const WA_PHONE = '4915141382732';
  const WA_MESSAGE = 'Hallo Marco, ich habe eine Anfrage zur 3D-Druck-Projektidee.';
  const WA_URL = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(WA_MESSAGE)}`;
  const WA_QR_TARGET = `https://wa.me/${WA_PHONE}`;
  const WA_QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(WA_QR_TARGET)}&format=svg&size=200x200`;

  const whatsappLinks = document.querySelectorAll('[data-wa-link]');
  whatsappLinks.forEach((link) => {
    link.setAttribute('href', WA_URL);
  });

  const downloadLink = document.querySelector('[data-wa-download]');
  if (downloadLink) {
    downloadLink.setAttribute('href', WA_QR_SRC);
  }

  const qrImage = document.querySelector('[data-wa-qr-image]');
  if (qrImage) {
    qrImage.setAttribute('src', WA_QR_SRC);
  }

  const modal = document.querySelector('[data-wa-modal]');
  const dialog = modal ? modal.querySelector('[data-wa-dialog]') : null;
  const triggers = document.querySelectorAll('[data-wa-trigger]');
  const closeElements = modal ? modal.querySelectorAll('[data-wa-close]') : [];
  const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  if (!modal || !dialog) {
    return;
  }

  let lastFocusedElement = null;

  const getFocusableElements = () => {
    return Array.from(dialog.querySelectorAll(focusableSelectors)).filter((element) => {
      const isDisabled = element.hasAttribute('disabled') || element.getAttribute('aria-hidden') === 'true';
      return !isDisabled && element.offsetParent !== null;
    });
  };

  const closeModal = () => {
    modal.setAttribute('hidden', '');
    modal.classList.remove('is-open');
    document.removeEventListener('keydown', handleKeyDown, true);
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const openModal = () => {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.removeAttribute('hidden');
    modal.classList.add('is-open');
    document.addEventListener('keydown', handleKeyDown, true);

    const focusable = getFocusableElements();
    if (focusable.length) {
      focusable[0].focus();
    } else {
      dialog.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || active === dialog) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', openModal);
  });

  closeElements.forEach((element) => {
    element.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
})();
