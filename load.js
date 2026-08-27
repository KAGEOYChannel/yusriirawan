(() => {
  const finishLoading = () => {
    document.body.classList.add("loaded");
  };

  // Jangan menunggu timer 3 detik. Loader ditutup setelah halaman benar-benar siap.
  if (document.readyState === "complete") {
    requestAnimationFrame(finishLoading);
  } else {
    window.addEventListener("load", () => {
      requestAnimationFrame(finishLoading);
    }, { once: true });
  }
})();
