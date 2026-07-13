import fs from 'fs'

const file = 'src/pages/Home.tsx'
let data = fs.readFileSync(file, 'utf8')

data = data.replace("import { TechNewsSection } from '../components/TechNewsSection';\n", "")
data = data.replace('      <div id="news" className={sectionClasses}><TechNewsSection /></div>\n', '')

fs.writeFileSync(file, data)
