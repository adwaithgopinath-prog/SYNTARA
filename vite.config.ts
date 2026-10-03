import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syntaraApi } from './backend/api.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const staticProductFiles = [
  'agency.html', 'agency.css', 'agency.js', 'intelligence.html',
  'opportunities.html', 'campaigns.html', 'studio.html',
  'performance.html', 'index.legacy.html', 'styles.css', 'product.css',
  'motion.css', 'pages.css', 'data.js', 'app.js', 'product.js', 'motion.js',
  'pages.js', 'backend-client.js',
];

function staticProductPages() {
  return {
    name: 'syntara-static-product-pages',
    apply: 'build',
    async closeBundle() {
      await Promise.all(staticProductFiles.map((file) => fs.copyFile(
        path.join(root, file),
        path.join(root, 'dist', file),
      )));
    },
  };
}

export default defineConfig({
  plugins: [react(), syntaraApi(), staticProductPages()],
  server: {
    port: 5173,
    host: '127.0.0.1'
  }
});
