(() => {
  function initDarkModeToggle() {
    const button = document.getElementById('darkModeToggle');
    if (!button) return;

    const toggle = () => {
      const isPressed = button.getAttribute('aria-pressed') === 'true';
      const nextState = !isPressed;

      document.body.setAttribute('data-dark-mode', String(nextState));
      button.setAttribute('aria-pressed', String(nextState));
    };

    button.addEventListener('click', toggle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkModeToggle, { once: true });
  } else {
    initDarkModeToggle();
  }
})();
