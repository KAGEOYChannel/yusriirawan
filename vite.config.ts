import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, type Plugin } from 'vite';

/**
 * The repository is a mixed static site + one Vite/React page.
 * Only pembelajaranMTK.html is a Vite entry point.
 * All legacy/static pages and their root assets are copied unchanged to dist.
 */
function copyStaticSite(): Plugin {
  return {
    name: 'copy-static-site',
    closeBundle() {
      const root = __dirname;
      const outDir = path.resolve(root, 'dist');
      const excluded = new Set([
        '.git',
        '.github',
        'node_modules',
        'dist',
        'src',
        'vite.config.ts',
        'package.json',
        'package-lock.json',
        'bun.lock',
        'tsconfig.json',
      ]);

      fs.mkdirSync(outDir, { recursive: true });

      for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (excluded.has(entry.name)) continue;

        const source = path.join(root, entry.name);
        const destination = path.join(outDir, entry.name);

        fs.cpSync(source, destination, {
          recursive: true,
          force: true,
        });
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), copyStaticSite()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'pembelajaranMTK.html'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
