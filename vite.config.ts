import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin, Connect } from 'vite';

/**
 * Plugin untuk menyalin HTML statis lainnya ke dist saat build,
 * sehingga semua file HTML lama/tambahan tetap ada di GitHub Pages
 * dan tidak menghasilkan 404.
 */
function copyStaticHtmlPages(): Plugin {
  return {
    name: 'copy-static-html-pages',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist');
      const rootDir = process.cwd();

      if (!fs.existsSync(outDir)) return;

      const files = fs.readdirSync(rootDir, { withFileTypes: true });

      for (const entry of files) {
        if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.html')) {
          continue;
        }

        // Tiga file ini diproses oleh Vite/Rollup
        if (
          entry.name === 'index.html' ||
          entry.name === 'pembelajaranMTK.html' ||
          entry.name === 'perkalian.html'
        ) {
          continue;
        }

        try {
          fs.copyFileSync(
            path.join(rootDir, entry.name),
            path.join(outDir, entry.name),
          );
        } catch (err) {
          console.warn(`Gagal menyalin ${entry.name}:`, err);
        }
      }
    },
  };
}

/**
 * Middleware untuk dev server agar navigasi ke /perkalian atau /pembelajaranMTK
 * (baik dengan atau tanpa akhiran .html) langsung terlayani tanpa 404.
 */
function devHtmlFallbackPlugin(): Plugin {
  return {
    name: 'dev-html-fallback',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req: Connect.IncomingMessage, _res, next) => {
        if (req.url) {
          const parsedUrl = req.url.split('?')[0];
          if (parsedUrl === '/perkalian') {
            req.url = '/perkalian.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
          } else if (parsedUrl === '/pembelajaranMTK') {
            req.url = '/pembelajaranMTK.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(({ command }) => ({
  // Saat build (production / GitHub Pages) gunakan './' agar path asset fleksibel.
  // Saat serve (development), gunakan '/' agar Vite dev server memuat modul secara lancar tanpa layar putih.
  base: command === 'serve' ? '/' : './',

  plugins: [
    react(),
    tailwindcss(),
    devHtmlFallbackPlugin(),
    copyStaticHtmlPages(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  build: {
    rollupOptions: {
      // Halaman yang diproses oleh Vite & Rollup
      input: {
        main: path.resolve(__dirname, 'index.html'),
        pembelajaranMTK: path.resolve(__dirname, 'pembelajaranMTK.html'),
        perkalian: path.resolve(__dirname, 'perkalian.html'),
      },
    },
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));

