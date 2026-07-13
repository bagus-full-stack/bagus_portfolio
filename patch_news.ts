import fs from 'fs'

const file = 'src/components/TechNewsSection.tsx'
let data = fs.readFileSync(file, 'utf8')

data = data.replace(/fetch\('https:\/\/dev\.to\/api\/articles\?tag=tech&top=7'\)/g, "fetch('/api/news')")
// Also remove console.error to avoid spamming UI if it really fails
data = data.replace(/console\.error\(err\);/g, "// console.error(err);")

fs.writeFileSync(file, data)
