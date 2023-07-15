function unlock() {
  const slider = document.querySelector('.slider');
  const lock = document.querySelector('.lock');

  const sliderValue = slider.value;
  lock.style.transform = `translateX(${sliderValue}px)`;

  if (sliderValue >= 120) {
    lock.style.animation = 'unlock 0.5s forwards';
  } else {
    lock.style.animation = 'none';
  }
}
