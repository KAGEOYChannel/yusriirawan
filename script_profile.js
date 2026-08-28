(() => {
  function initProfileCard() {
    const buttons = document.querySelectorAll('.card-buttons button');
    const sections = document.querySelectorAll('.card-section');
    const card = document.querySelector('.card');

    // This script is also used by other pages. Do nothing if the profile card
    // is not present instead of throwing an error that can stop other scripts.
    if (!card || !buttons.length) return;

    const handleButtonClick = (e) => {
      const button = e.currentTarget;
      const targetSection = button.getAttribute('data-section');
      if (!targetSection) return;

      const section = document.querySelector(targetSection);
      if (!section) return;

      if (targetSection !== '#about') {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }

      card.setAttribute('data-state', targetSection);
      sections.forEach((s) => s.classList.remove('is-active'));
      buttons.forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');
      section.classList.add('is-active');
    };

    buttons.forEach((btn) => btn.addEventListener('click', handleButtonClick));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileCard, { once: true });
  } else {
    initProfileCard();
  }
})();
