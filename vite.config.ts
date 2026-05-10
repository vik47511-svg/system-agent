import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'frontend'),
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/frontend'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:    path.resolve(__dirname, 'frontend/index.html'),
        overlay: path.resolve(__dirname, 'frontend/overlay/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  // Ensure paths are relative so file:// protocol works in production
  base: './',
});
