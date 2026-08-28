import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

/**
 * Build only the React page with Vite. The rest of this repository is a
 * traditional static website and must be copied byte-for-byte to dist.
 */
function copyStaticSite(): Plugin {
  const root = process.cwd();
  const skip = new Set([
    'node_modules', 'dist', 'src', '.git', '.github',
    'pembelajaranMTK.html',
    'vite.config.ts', 'package.json', 'bun.lock', 'tsconfig.json',
    'README.md', 'PERBAIKAN.md', 'metadata.json'
  ]);

  function copyDirectory(from: string, to: string) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const source = path.join(from, entry.name);
      const target = path.join(to, entry.name);
      if (entry.isDirectory()) {
        copyDirectory(source, target);
      } else if (entry.isFile()) {
        fs.copyFileSync(source, target);
      }
    }
  }

  return {
    name: 'copy-static-site',
    apply: 'build',
    closeBundle() {
      copyDirectory(root, path.join(root, 'dist'));
    }
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
});
