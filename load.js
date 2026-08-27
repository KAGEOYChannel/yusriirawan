(function () {
    "use strict";

    function hideLoader() {
        // Tambahkan class loaded ke body
        document.documentElement.classList.add("loaded");

        if (document.body) {
            document.body.classList.add("loaded");
        }

        // Cari elemen loader dan sembunyikan langsung
        const loaders = document.querySelectorAll(
            "#loader, .loader, .loading, .preloader, #preloader"
        );

        loaders.forEach(function (loader) {
            loader.classList.add("loaded");

            // Pastikan loader tidak lagi menghalangi halaman
            loader.style.pointerEvents = "none";
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
        });
    }

    // Jalankan secepat mungkin
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", hideLoader, {
            once: true
        });
    } else {
        hideLoader();
    }

    // Fallback: pastikan loader tidak bisa berputar selamanya
    window.addEventListener("load", hideLoader, {
        once: true
    });

    // Fallback tambahan jika ada script lain yang terlambat
    setTimeout(hideLoader, 1000);
})();
