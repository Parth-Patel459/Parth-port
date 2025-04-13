import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'public/news-aggregator/index.html'),
      },
      output: {
        entryFileNames: 'js/[name].min.js',
        chunkFileNames: 'js/[name].min.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name].min.css';
          }
          return 'assets/[name].[ext]';
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<script type="module" src="(.*?)"><\/script>/,
          `<script type="module" src="/$1"></script>`
        );
      }
    }
  ]
}); 