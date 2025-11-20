import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    crx({ manifest }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild',
    reportCompressedSize: false, // Skip gzip size calculation (faster)
    target: 'esnext', // Modern target = less transpilation
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split large vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
          }
        },
      },
    },
  },
  esbuild: {
    drop: command === 'build' ? ['console', 'debugger'] : [], // Remove console in builds, keep in dev
  },
  server: {
    strictPort: true,
    port: 5173,
    hmr: {
      port: 5173,
    },
  },
}));
