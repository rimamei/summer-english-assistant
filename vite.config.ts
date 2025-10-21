import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/pages/popup/index.html'),
        background: resolve(__dirname, 'src/pages/background/index.ts'),
        content: resolve(__dirname, 'src/pages/content/index.ts'),
      },
      output: {
        entryFileNames: '[name]/index.js',
        chunkFileNames: 'chunks/[name].js',
         assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true
  },
})
