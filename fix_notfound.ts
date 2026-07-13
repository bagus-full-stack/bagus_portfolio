import fs from 'fs'

const file = 'src/pages/NotFound.tsx'
let data = fs.readFileSync(file, 'utf8')

if (!data.includes("useProfile")) {
  data = data.replace(
    "import { Home, ArrowLeft, Search } from 'lucide-react';",
    "import { Home, ArrowLeft, Search } from 'lucide-react';\nimport { useProfile } from '../hooks/useProfile';"
  )

  data = data.replace(
    "export default function NotFound() {",
    "export default function NotFound() {\n  const { profile } = useProfile();"
  )
}

data = data.replace(
  /<a href="\/" className="font-space font-bold text-3xl text-text-primary tracking-tighter">\n          AB<span className="text-accent-cyan">\.<\/span>\n        <\/a>/g,
  `<a href="/" className="flex items-center gap-3">
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)]" />
          ) : (
            <span className="font-space font-bold text-3xl text-text-primary tracking-tighter">AB<span className="text-accent-cyan">.</span></span>
          )}
        </a>`
)

fs.writeFileSync(file, data)
