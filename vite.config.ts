import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import compression from 'vite-plugin-compression';

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: '/',
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser' as const,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js'],
            router: ['react-router-dom'],
            charts: ['chart.js', 'react-chartjs-2'],
            motion: ['framer-motion']
          }
        }
      }
    },
    plugins: [
      react(), 
      tailwindcss(),
      compression({
        algorithm: 'gzip',
        ext: '.gz'
      }),
      compression({
        algorithm: 'brotliCompress',
        ext: '.br'
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'masked-icon.svg'
        ],
        manifest: {
          name: 'Assami Baga — Portfolio',
          short_name: 'Assami Baga',
          description:
            'Portfolio de Assami Baga, ingénieur ' +
            'Full Stack & IA basé en Île-de-France.',
          theme_color: '#0B0F14',
          background_color: '#0B0F14',
          display: 'standalone',
          orientation: 'portrait-primary',
          icons: [
            {
              src: '/favicon-96x96.png',
              sizes: '96x96',
              type: 'image/png'
            },
            {
              src: '/icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icons/pwa-512x512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          shortcuts: [
            {
              name: 'Voir les projets',
              short_name: 'Projets',
              description: 'Accéder directement aux projets',
              url: '/#projects',
              icons: [{
                src: '/icons/shortcut-projects.png',
                sizes: '96x96'
              }]
            },
            {
              name: 'Me contacter',
              short_name: 'Contact',
              description: 'Envoyer un message à Assami',
              url: '/#contact',
              icons: [{
                src: '/icons/shortcut-contact.png',
                sizes: '96x96'
              }]
            }
          ],
          categories: ['portfolio', 'developer', 'productivity'],
          lang: 'fr'
        },

        workbox: {
          navigateFallback: '/offline.html',
          navigateFallbackDenylist: [/^\/admin/],
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,woff2}'
          ],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/bagus-full-stack\.me\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24
                }
              }
            },
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-cache',
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            },
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/storage\//,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
