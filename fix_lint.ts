import fs from 'fs'

let file = 'src/components/ChatbotWidget.tsx'
let data = fs.readFileSync(file, 'utf8')
if (!data.includes('useProfile')) {
  data = data.replace(
    "import { useTranslation } from '../hooks/useTranslation';",
    "import { useTranslation } from '../hooks/useTranslation';\nimport { useProfile } from '../hooks/useProfile';"
  )
  data = data.replace(
    "const { t } = useTranslation();",
    "const { t } = useTranslation();\n  const { profile } = useProfile();"
  )
  fs.writeFileSync(file, data)
}

file = 'src/components/admin/AdminLayout.tsx'
data = fs.readFileSync(file, 'utf8')
if (!data.includes('useProfile')) {
  data = data.replace(
    "import { Link, useLocation, useNavigate } from 'react-router-dom';",
    "import { Link, useLocation, useNavigate } from 'react-router-dom';\nimport { useProfile } from '../../hooks/useProfile';"
  )
  data = data.replace(
    "const location = useLocation();",
    "const location = useLocation();\n  const { profile } = useProfile();"
  )
  fs.writeFileSync(file, data)
}
