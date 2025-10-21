import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "path"
import tailwindcss from "@tailwindcss/vite"
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
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
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    strictPort: true,
    port: 5173,
    hmr: {
      port: 5173,
    },
  },
})
