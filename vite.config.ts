import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

/**
 * Vite hanya memproses dua HTML yang memang membutuhkan build:
 * - index.html
 * - pembelajaranMTK.html (React/TSX)
 *
 * HTML statis lainnya disalin apa adanya ke dist setelah build selesai.
 * Dengan cara ini Vite tidak mencoba mem-parse HTML lama yang mungkin
 * memiliki sintaks yang tidak diterima parse5, tetapi semua halaman tetap
 * tersedia di GitHub Pages dan tidak menjadi 404.
 */
function copyStaticHtmlPages(): Plugin {
  return {
    name: 'copy-static-html-pages',
    apply: 'build',
    writeBundle(options) {
      const outDir = options.dir ?? path.resolve(process.cwd(), 'dist');
      const rootDir = process.cwd();

      const files = fs.readdirSync(rootDir, { withFileTypes: true });

      for (const entry of files) {
        if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.html')) {
          continue;
        }

        // Dua file ini diproses oleh Vite dan jangan disalin ulang.
        if (entry.name === 'index.html' || entry.name === 'pembelajaranMTK.html') {
          continue;
        }

        fs.copyFileSync(
          path.join(rootDir, entry.name),
          path.join(outDir, entry.name),
        );
      }
    },
  };
}

export default defineConfig({
  // Relative asset paths aman untuk GitHub Pages, termasuk custom domain.
  base: './',

  plugins: [
    react(),
    tailwindcss(),
    copyStaticHtmlPages(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  build: {
    rollupOptions: {
      // HANYA dua HTML ini yang diberikan ke parser Vite/Rollup.
      input: {
        main: path.resolve(__dirname, 'index.html'),
        pembelajaranMTK: path.resolve(__dirname, 'pembelajaranMTK.html'),
      },
    },
  },

  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
