import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin, Connect } from 'vite';

// Copies CNAME, assets/, and pages/ into dist so relative links work on GitHub Pages.
function copyStaticSiteFolders(): Plugin {
  return {
    name: 'copy-static-site-folders',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist');
      const rootDir = process.cwd();
      if (!fs.existsSync(outDir)) return;

      const cnameSrc = path.join(rootDir, 'CNAME');
      if (fs.existsSync(cnameSrc)) {
        fs.copyFileSync(cnameSrc, path.join(outDir, 'CNAME'));
      }

      for (const dirName of ['assets', 'pages']) {
        const srcDir = path.join(rootDir, dirName);
        if (fs.existsSync(srcDir)) {
          fs.cpSync(srcDir, path.join(outDir, dirName), { recursive: true });
        }
      }
    },
  };
}

function devHtmlFallbackPlugin(): Plugin {
  return {
    name: 'dev-html-fallback',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req: Connect.IncomingMessage, _res, next) => {
        if (req.url) {
          const [parsedUrl, query] = req.url.split('?');
          const suffix = query ? `?${query}` : '';
          if (parsedUrl === '/perkalian') {
            req.url = `/pages/matematika/perkalian.html${suffix}`;
          } else if (parsedUrl === '/pembelajaranMTK') {
            req.url = `/pages/matematika/pembelajaranMTK.html${suffix}`;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : './',

  plugins: [
    react(),
    tailwindcss(),
    devHtmlFallbackPlugin(),
    copyStaticSiteFolders(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
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
