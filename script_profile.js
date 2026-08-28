const buttons = document.querySelectorAll(".card-buttons button");
const sections = document.querySelectorAll(".card-section");
const card = document.querySelector(".card");

const handleButtonClick = (e) => {
  // FIX: e.target bisa jadi bukan tombolnya sendiri kalau suatu saat ada
  // elemen anak di dalam tombol (mis. ikon/span). Pakai closest() supaya
  // selalu dapat elemen <button> yang benar-benar punya data-section.
  const btn = e.target.closest("[data-section]");
  if (!btn) return;

  const targetSection = btn.getAttribute("data-section");
  const section = document.querySelector(targetSection);
  if (!card || !section) return; // FIX: jangan lempar error kalau elemen tidak ketemu

  targetSection !== "#about"
    ? card.classList.add("is-active")
    : card.classList.remove("is-active");
  card.setAttribute("data-state", targetSection);
  sections.forEach((s) => s.classList.remove("is-active"));
  buttons.forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  section.classList.add("is-active");
};

buttons.forEach((btn) => {
  btn.addEventListener("click", handleButtonClick);
});
