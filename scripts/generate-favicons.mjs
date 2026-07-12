import sharp from 'sharp'
import { readFileSync, mkdirSync, copyFileSync } from 'fs'

try {
  mkdirSync('public/icons', { recursive: true })
} catch (e) {}

const svg = readFileSync('public/favicon.svg')

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 96, name: 'favicon-96x96.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icons/pwa-192x192.png' },
  { size: 512, name: 'icons/pwa-512x512.png' },
]

for (const { size, name } of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`public/${name}`)
  console.log(`✅ Généré : ${name}`)
}

// Version maskable PWA (avec padding 20%)
await sharp(svg)
  .resize(410, 410)          // image dans 80%
  .extend({                   // padding 10% chaque côté
    top: 51, bottom: 51,
    left: 51, right: 51,
    background: { r: 11, g: 15, b: 20 }
  })
  .resize(512, 512)
  .png()
  .toFile('public/icons/pwa-512x512-maskable.png')

// Copy favicon-32x32.png to favicon.ico as a fallback
copyFileSync('public/favicon-32x32.png', 'public/favicon.ico')

console.log('✅ Généré : pwa-512x512-maskable.png')
console.log('✅ Copié : favicon.ico')
