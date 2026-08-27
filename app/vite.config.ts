import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// Plugin to rewrite root '/' or index requests to /pembelajaranMTK.html
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
      // Folder ini ("app/") adalah root project Vite yang terpisah dari
      // situs statis di root repo. Hanya pembelajaranMTK.html yang perlu
      // dibundle di sini; index.html portfolio adalah HTML statis biasa
      // dan tidak melalui proses build ini.
      rollupOptions: {
        input: {
          pembelajaranMTK: path.resolve(__dirname, 'pembelajaranMTK.html'),
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
