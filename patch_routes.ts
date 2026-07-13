import fs from 'fs'

const file = 'src/app.routes.tsx'
let data = fs.readFileSync(file, 'utf8')

// Add import
data = data.replace("import { Home } from './pages/Home';", "import { Home } from './pages/Home';\nimport { NewsPage } from './pages/News';")

// Add route
const homeRoute = `      {
        path: '/',
        element: <Home />
      },`

const newRoute = `      {
        path: '/',
        element: <Home />
      },
      {
        path: '/news',
        element: <NewsPage />
      },`

data = data.replace(homeRoute, newRoute)

fs.writeFileSync(file, data)
