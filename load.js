window.addEventListener('load', function () {
  const loadingOverlay = document.querySelector('.loading-overlay');
  const content = document.querySelector('.content');

  setTimeout(function () {
    loadingOverlay.style.display = 'none'; // Sembunyikan overlay setelah loading selesai
    content.style.display = 'block'; // Tampilkan konten halaman utama
  }, 2000); // Waktu simulasi loading (dalam milidetik)
});
