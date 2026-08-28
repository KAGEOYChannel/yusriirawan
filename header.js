/* ---------- Header scroll ---------- */
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---------- Hamburger ---------- */
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

function toggleMenu(){
  hamburger.classList.toggle('open');
  menu.classList.toggle('show');
}
hamburger.addEventListener('click', toggleMenu);
hamburger.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleMenu(); }});

document.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.menu-link').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    hamburger.classList.remove('open');
    menu.classList.remove('show');
  });
});

/* ---------- Theme toggle ---------- */
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('awan-theme');
if(savedTheme){
  root.setAttribute('data-theme', savedTheme);
  themeToggle.innerHTML = savedTheme === 'light' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  localStorage.setItem('awan-theme', next);
  themeToggle.innerHTML = next === 'light' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});
