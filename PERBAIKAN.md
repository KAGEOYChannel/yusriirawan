# Catatan Perbaikan Folder `pembelajaran/`

## Apa yang salah sebelumnya?
`pembelajaran/index.html` memuat file source mentah React/TypeScript
(`src/main.tsx`) langsung lewat `<script type="module" src="...">`.
Browser tidak bisa menjalankan `.tsx` tanpa dikompilasi lebih dulu
(oleh Vite), sehingga server mengirim file itu dengan MIME type
`application/octet-stream` -> browser menolak menjalankannya -> layar
putih.

## Apa yang diperbaiki?
1. Semua source code (React/TS, `package.json`, `vite.config.ts`, dll)
   dipindahkan ke **`pembelajaran/app/`** -- ini folder "dapur",
   tempat kamu edit kode.
2. Path script di `pembelajaran/app/index.html` diperbaiki jadi
   relatif (`./src/main.tsx`).
3. Ditambahkan **GitHub Actions workflow**
   (`.github/workflows/build-pembelajaran.yml`) yang otomatis:
   - Menjalankan `npm install` + `vite build` di `pembelajaran/app/`
     setiap kali kamu push perubahan ke folder itu.
   - Menyalin hasil build (HTML/CSS/JS terkompilasi) ke
     **`pembelajaran/`** (root folder itu), yang inilah yang
     benar-benar disajikan ke pengunjung situs.
   - Meng-commit hasilnya kembali secara otomatis.
4. `_config.yml` (Jekyll) diperbarui supaya folder
   `pembelajaran/app/` (source code) tidak ikut dipublikasikan --
   yang tayang ke publik hanya hasil build-nya saja.
5. Ditambahkan `.gitignore` untuk `node_modules/` dan folder `dist`
   sementara.

## PENTING -- lakukan ini SEBELUM push
GitHub Actions perlu izin menulis (commit) ke repo kamu:
1. Buka repo di GitHub -> **Settings** -> **Actions** -> **General**.
2. Scroll ke **Workflow permissions**.
3. Pilih **"Read and write permissions"**, lalu **Save**.

Tanpa ini, workflow akan gagal saat mencoba meng-commit hasil build
(error 403 "Permission denied").

## Cara pakai setelah ini
1. Extract zip ini, replace seluruh isi repo lokalmu dengan isi zip
   ini (atau copy folder `pembelajaran/` dan `.github/` yang baru,
   plus `_config.yml` dan `.gitignore` yang sudah diperbarui).
2. Commit & push ke branch `main` (sesuaikan nama branch kalau
   defaultmu `master`, edit baris `branches:` di file workflow).
3. Buka tab **Actions** di GitHub, tunggu workflow
   "Build Pembelajaran (Vite)" selesai (biasanya 1-2 menit).
4. Setelah selesai (centang hijau), kunjungi lagi
   `https://yusriirawan.my.id/pembelajaran/` -- seharusnya sudah
   tidak putih lagi.

## Ke depannya
Kalau mau edit game/kuisnya, cukup edit file di dalam
`pembelajaran/app/src/`, lalu push. Workflow akan otomatis build dan
publish ulang -- kamu tidak perlu build manual lagi.

## Catatan soal fitur AI Tutor
Tombol "Tanya AI" (penjelasan soal & generator cerita custom)
memanggil `/api/ai/explain` dan `/api/ai/generate-story`, yang
awalnya dilayani oleh backend Express (`server.ts`). GitHub Pages
adalah hosting statis dan tidak bisa menjalankan server Node, jadi
kedua endpoint itu tidak akan tersedia di GitHub Pages. Untungnya
kode frontend-nya sudah punya fallback lokal (lihat
`QuizAdventure.tsx` dan `AnimatedStoryMode.tsx`) sehingga aplikasi
tidak akan crash -- fitur inti (kuis, timbangan, papan peringkat)
tetap berjalan normal, hanya penjelasan AI-nya akan pakai teks
template statis, bukan hasil dinamis dari Gemini.

Kalau suatu saat kamu mau fitur AI-nya benar-benar aktif, kamu perlu
hosting terpisah yang mendukung Node.js (misalnya Render, Railway,
atau Vercel) khusus untuk `server.ts`, lalu ubah alamat fetch di
frontend supaya menunjuk ke situ.
