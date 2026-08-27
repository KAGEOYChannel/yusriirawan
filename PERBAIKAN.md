# Catatan Perbaikan `pembelajaranMTK.html` (layar putih)

## Kenapa sebelumnya layar putih?
`pembelajaranMTK.html` di root memuat source code React/TypeScript mentah
langsung lewat `<script type="module" src="/src/main.tsx">`. Browser tidak
bisa menjalankan `.tsx` tanpa dikompilasi lebih dulu oleh Vite (juga ada
`import` ke paket npm seperti `react`, `motion`, `lucide-react` yang tidak
bisa di-resolve browser tanpa bundler) — hasilnya: layar putih kosong,
biasanya disertai error di console seperti
"Failed to resolve module specifier".

Situs ini di-deploy oleh GitHub Pages langsung dari branch (raw static
files), bukan lewat proses build — jadi source mentah itu memang langsung
dikirim apa adanya ke browser pengunjung.

## Apa yang diperbaiki?
1. Semua source code aplikasi (React/TS, `package.json`, `vite.config.ts`,
   `tsconfig.json`, dll) dipindahkan ke folder **`app/`** — ini folder
   "dapur", tempat kamu edit kode aplikasi pembelajaran.
2. `app/vite.config.ts` disesuaikan supaya hanya membangun
   `app/pembelajaranMTK.html` (halaman portfolio `index.html` di root
   adalah HTML statis biasa, terpisah dari proses build ini).
3. Ditambahkan GitHub Actions workflow
   (`.github/workflows/build-pembelajaran.yml`) yang otomatis:
   - Menjalankan `npm install` + `vite build` di folder `app/` setiap kali
     ada perubahan di `app/**`.
   - Menyalin hasil build (HTML + JS/CSS terkompilasi) ke root repo
     sebagai `pembelajaranMTK.html` dan folder `assets/` — inilah yang
     benar-benar disajikan ke pengunjung situs.
   - Meng-commit hasilnya kembali secara otomatis ke branch yang sama.
4. `_config.yml` (Jekyll) diperbarui supaya folder `app/` (source code)
   tidak ikut dipublish — yang tayang ke publik hanya hasil build-nya.
5. `.gitignore` menambahkan `app/node_modules` dan `app/dist` supaya tidak
   ikut ter-commit.
6. Workflow lama (`deploy.yml`) yang mencoba membangun **seluruh** situs
   lewat Vite dihapus, karena situs ini punya banyak halaman HTML statis
   lain (guru.html, comingsoon.html, dll) dan aset (gambar, css, js) yang
   bukan bagian dari project Vite — build itu akan menghapus/menghilangkan
   semuanya kalau dipakai sebagai satu-satunya sumber deploy.

## PENTING — lakukan ini SEBELUM push
GitHub Actions perlu izin menulis (commit) ke repo kamu:
1. Buka repo di GitHub → **Settings** → **Actions** → **General**.
2. Scroll ke **Workflow permissions**.
3. Pilih **"Read and write permissions"**, lalu **Save**.

Tanpa ini, workflow akan gagal saat mencoba `git push` (error 403
"Permission denied").

## Cara pakai setelah ini
1. Replace seluruh isi repo lokalmu dengan isi zip hasil perbaikan ini
   (atau copy folder `app/`, `.github/`, plus `pembelajaranMTK.html`,
   `_config.yml`, `.gitignore` yang sudah diperbarui, dan hapus
   `package.json`/`vite.config.ts`/`tsconfig.json`/`bun.lock`/`src/` yang
   lama dari root — semua itu sekarang ada di dalam `app/`).
2. Commit & push ke branch `main` (sesuaikan `branches:` di workflow kalau
   default branch-mu `master`).
3. Buka tab **Actions**, tunggu workflow "Build & Publish Pembelajaran
   MTK" selesai (biasanya 1–2 menit, tandanya centang hijau).
4. Setelah selesai, buka lagi halaman `pembelajaranMTK.html` di situsmu —
   seharusnya sudah tidak putih lagi.

## Kalau nanti mau edit lagi aplikasinya
Edit file di dalam `app/src/`, lalu `git push` — workflow akan otomatis
build ulang dan meng-update `pembelajaranMTK.html` + `assets/` di root.
Untuk coba lokal dulu sebelum push: masuk ke folder `app/`, jalankan
`npm install` lalu `npm run dev`.
