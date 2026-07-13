import fs from 'fs'

const file = 'src/components/Navbar.tsx'
let data = fs.readFileSync(file, 'utf8')

// Injecter l'import
data = data.replace(
  "import { useTranslation } from '../hooks/useTranslation';",
  "import { useTranslation } from '../hooks/useTranslation';\nimport { useProfile } from '../hooks/useProfile';"
)

// Injecter le hook
data = data.replace(
  "const { t } = useTranslation();",
  "const { t } = useTranslation();\n  const { profile } = useProfile();"
)

// Remplacer le logo
data = data.replace(
  /<a href="#" className="font-space font-bold text-3xl text-text-primary tracking-tighter">\n            AB\n          <\/a>/,
  `<a href="#" className="flex items-center gap-3">
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)]" />
            ) : (
              <span className="font-space font-bold text-3xl text-text-primary tracking-tighter">AB</span>
            )}
          </a>`
)

fs.writeFileSync(file, data)
