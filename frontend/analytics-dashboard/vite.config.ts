import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4120,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:7305',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})