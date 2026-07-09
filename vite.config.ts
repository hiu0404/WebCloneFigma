import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Browser → public IP:5173 only; proxy avoids Private Network Access blocking :5173 → localhost:5175
    proxy: {
      '/api': { target: 'http://127.0.0.1:5175', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:5175', changeOrigin: true },
    },
  },
})