import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy AI recipe generation to AI service
      '/api/v1/generate-recipe': {
        target: 'https://chefoodai-ai-service-1074761757006.us-central1.run.app',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🚀 Proxying request to AI service:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ AI service response:', proxyRes.statusCode);
          });
        }
      },
      // Proxy all other API calls to main backend
      '/api': {
        target: 'https://chefoodai-backend-1074761757006.us-central1.run.app',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🚀 Proxying request to backend:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ Backend response:', proxyRes.statusCode);
          });
        }
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'react-hook-form',
      'zod',
      'framer-motion',
    ],
  },
})
