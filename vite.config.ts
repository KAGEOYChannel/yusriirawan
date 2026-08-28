import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

/**
 * This repository is a mixed static site + one React page.
 * Only pembelajaranMTK.html is a Vite entry. All legacy/static root files
 * are copied unchanged so their original relative URLs continue to work.
 */
function copyStaticRootFiles(): Plugin {
  return {
    name: 'copy-static-root-files',
    apply: 'build',
    generateBundle() {
      const root = __dirname;
      const excluded = new Set([
        'node_modules',
        '.git',
        'dist',
        'src',
        'vite.config.ts',
        'package.json',
        'package-lock.json',
        'bun.lock',
        'tsconfig.json',
      ]);

      for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (excluded.has(entry.name)) continue;
        if (entry.isDirectory()) continue;

        const filePath = path.join(root, entry.name);
        this.emitFile({
          type: 'asset',
          fileName: entry.name,
          source: fs.readFileSync(filePath),
        });
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), copyStaticRootFiles()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // IMPORTANT: index.html is intentionally NOT a Vite entry.
      input: path.resolve(__dirname, 'pembelajaranMTK.html'),
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
