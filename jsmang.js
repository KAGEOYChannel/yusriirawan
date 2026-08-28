// FIX: sebelumnya pakai document.querySelector("button") yang asal
// mengambil <button> PERTAMA di seluruh halaman. Ini rapuh -- kalau ada
// script lain (widget, iklan, plugin) yang menyisipkan <button> sebelum
// tombol toggle ini di DOM, klik toggle jadi tidak berfungsi sama sekali
// karena event listener terpasang di tombol yang salah. Sekarang diambil
// langsung lewat ID-nya yang unik (#darkModeToggle) supaya selalu tepat.
const BUTTON = document.getElementById("darkModeToggle");

if (BUTTON) {
  const TOGGLE = () => {
    const IS_PRESSED = BUTTON.matches("[aria-pressed=true]");
    document.body.setAttribute("data-dark-mode", IS_PRESSED ? false : true);
    BUTTON.setAttribute("aria-pressed", IS_PRESSED ? false : true);
  };

  BUTTON.addEventListener("click", TOGGLE);
}
