import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('public/favicon.svg')

await sharp(svg)
  .resize(96, 96)
  .png()
  .toFile('public/icons/shortcut-projects.png')

await sharp(svg)
  .resize(96, 96)
  .png()
  .toFile('public/icons/shortcut-contact.png')
