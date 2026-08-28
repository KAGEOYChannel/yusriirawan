function initProfileCard() {
  const buttons = document.querySelectorAll('.cards-buttons button');
  const sections = document.querySelectorAll('.card-section');
  const card = document.querySelector('.card');

  if (!buttons.length || !sections.length || !card) return;

  const handleButtonClick = (event) => {
    const button = event.currentTarget;
    const targetSection = button.getAttribute('data-section');
    if (!targetSection) return;

    const section = document.querySelector(targetSection);
    if (!section) return;

    card.classList.toggle('is-active', targetSection !== '#about');
    card.setAttribute('data-state', targetSection);

    sections.forEach((item) => item.classList.remove('is-active'));
    buttons.forEach((item) => item.classList.remove('is-active'));

    button.classList.add('is-active');
    section.classList.add('is-active');
  };

  buttons.forEach((button) => {
    button.addEventListener('click', handleButtonClick);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfileCard, { once: true });
} else {
  initProfileCard();
}
