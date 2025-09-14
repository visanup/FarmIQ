import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 7320,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:7300', // Auth service
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/v1': {
        target: 'http://localhost:7304', // Analytics API (FastAPI)
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v1/, '/v1'),
      },
      '/api/farms': {
        target: 'http://localhost:7303', // Data service
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/api/sensor-readings': {
        target: 'http://localhost:7302', // Sensor streamer service
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/api/customers': {
        target: 'http://localhost:7300', // Auth service proxy to master-service
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts', 'chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
  define: {
    'process.env': {},
  },
});
