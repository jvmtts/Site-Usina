import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { localCatalog } from './server/catalog/vite-preview.ts'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localCatalog(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
