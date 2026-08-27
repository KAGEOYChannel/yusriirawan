import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// Plugin to rewrite root '/' or index requests to /pembelajaranMTK.html
// (only affects local dev server, not the production build/deploy)
function customHtmlEntryPlugin(): Plugin {
  return {
    name: 'custom-html-entry',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/' || req.url === '/index.html' || !req.url) {
          req.url = '/pembelajaranMTK.html';
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [customHtmlEntryPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          // Halaman utama
          main: path.resolve(__dirname, 'index.html'),
          pembelajaranMTK: path.resolve(__dirname, 'pembelajaranMTK.html'),

          // Halaman statis lain di root repo -- ditambahkan supaya
          // ikut ter-build & tersalin ke dist/, sehingga bisa diakses
          // di GitHub Pages (sebelumnya hanya 2 entry di atas yang
          // ikut ke dist/, jadi file lain 404 saat deploy).
          home: path.resolve(__dirname, 'Home.html'),
          sindex: path.resolve(__dirname, 'Sindex.html'),
          n101010031: path.resolve(__dirname, '101010031.html'),
          canva: path.resolve(__dirname, 'canva.html'),
          comingsoon: path.resolve(__dirname, 'comingsoon.html'),
          dice: path.resolve(__dirname, 'dice.html'),
          excel: path.resolve(__dirname, 'excel.html'),
          experi: path.resolve(__dirname, 'experi.html'),
          guru: path.resolve(__dirname, 'guru.html'),
          htmlProfile: path.resolve(__dirname, 'html_profile.html'),
          latihan: path.resolve(__dirname, 'latihan.html'),
          mail: path.resolve(__dirname, 'mail.html'),
          tes: path.resolve(__dirname, 'tes.html'),
          tik: path.resolve(__dirname, 'tik.html'),
          tombol: path.resolve(__dirname, 'tombol.html'),
          wavyText: path.resolve(__dirname, 'wavy_text.html'),
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
