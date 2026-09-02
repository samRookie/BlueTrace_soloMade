import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = process.env.API_PORT || '3001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
