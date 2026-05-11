import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Utsav - Nepal Ceremony Marketplace',
        short_name: 'Utsav',
        description: 'Nepal\'s First Ceremony Service Marketplace',
        theme_color: '#DC143C',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary'
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@utsav/shared': '../../packages/shared/src/index.ts'
    }
  },
  server: {
    port: 5173
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api')
  }
});