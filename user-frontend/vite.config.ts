import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },  
  server: {
    port: 8080,
    https: {
      maxVersion: 'TLSv1.3',
      minVersion: 'TLSv1.2'
    },
    proxy: {
      '/api': {
        target: 'https://localhost:7181',
        changeOrigin: true,
        secure: false
      },
      '/chatHub': {
        target: 'https://localhost:7181',
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    mkcert()
  ]
})
