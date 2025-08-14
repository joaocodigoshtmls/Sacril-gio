import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/Components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/stores': path.resolve(__dirname, './stores'),
      '@/types': path.resolve(__dirname, './types'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/layouts': path.resolve(__dirname, './src/Layout')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_CAM_BASE || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/proxy': {
        target: process.env.VITE_CAM_BASE || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})