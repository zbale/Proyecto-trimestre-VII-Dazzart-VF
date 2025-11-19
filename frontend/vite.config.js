import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // IMPORTANTE PARA PRODUCCIÓN DETRÁS DE NGINX
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },

  server: {
    host: true,
    port: 5173
  }
})
