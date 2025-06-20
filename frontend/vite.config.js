import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-Real-Origin', req.headers.origin || 'unknown');
          });
        }
      }
    },
  },
})
