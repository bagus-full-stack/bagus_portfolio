import fs from 'fs'

const file = 'src/pages/News.tsx'
let data = fs.readFileSync(file, 'utf8')

data = data.replace("title: \\`\\${t('tech_news.title')} | Assami Baga\\`,", "title: `${t('tech_news.title')} | Assami Baga`,")

fs.writeFileSync(file, data)
