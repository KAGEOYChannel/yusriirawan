import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GitHub Pages serves this repository as a static site.
 * Only pembelajaranMTK.html is a Vite/React application; the other HTML
 * files are already complete static pages and must be copied unchanged.
 *
 * Keeping the static pages out of Vite's HTML parser is intentional: some
 * of those legacy pages contain HTML that Vite/parse5 rejects even though
 * browsers can still render them. Vite only needs to process the React page.
 */
function copyStaticSiteFiles(): Plugin {
  const staticExtensions = new Set([
    '.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.ico', '.json', '.txt', '.webmanifest', '.xml'
  ]);

  const staticRootFiles = new Set(['CNAME', '_config.yml']);

  return {
    name: 'copy-static-site-files',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');

      for (const entry of fs.readdirSync(__dirname, { withFileTypes: true })) {
        if (!entry.isFile()) continue;

        const source = path.join(__dirname, entry.name);
        const ext = path.extname(entry.name).toLowerCase();
        const shouldCopy = staticExtensions.has(ext) || staticRootFiles.has(entry.name);

        // pembelajaranMTK.html is processed by Vite and is already in dist.
        if (!shouldCopy || entry.name === 'pembelajaranMTK.html') continue;

        fs.copyFileSync(source, path.join(outDir, entry.name));
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    copyStaticSiteFiles(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      // Only the React application is processed by Vite.
      // All other HTML pages are copied byte-for-byte by copyStaticSiteFiles.
      input: path.resolve(__dirname, 'pembelajaranMTK.html'),
    },
    emptyOutDir: true,
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
