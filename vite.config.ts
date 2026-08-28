import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

// Build every HTML page in the repository so GitHub Pages keeps all
// standalone .html pages instead of publishing only index.html and
// pembelajaranMTK.html.
const htmlEntries = Object.fromEntries(
  fs.readdirSync(__dirname, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
    .map((entry) => [
      entry.name.replace(/\.html$/i, ''),
      path.resolve(__dirname, entry.name),
    ])
);

export default defineConfig({
  // Relative asset URLs work both at the repository root and on a
  // GitHub Pages project/custom domain.
  base: './',

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },

  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
