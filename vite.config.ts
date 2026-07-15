import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const themeColor = '#fbf4e8';
const backgroundColor = '#fbf4e8';
const cacheId = 'kotten-pastel-icon-v3';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/kotten-icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Kotten',
        short_name: 'Kotten',
        description: 'Ett enkelt dagligt träningspass för barn.',
        lang: 'sv',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: themeColor,
        background_color: backgroundColor,
        icons: [
          {
            src: '/icons/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cacheId,
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true
  }
});
