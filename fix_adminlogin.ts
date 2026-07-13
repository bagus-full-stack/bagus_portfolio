import fs from 'fs'

const file = 'src/pages/admin/AdminLogin.tsx'
let data = fs.readFileSync(file, 'utf8')

if (!data.includes("useProfile")) {
  data = data.replace(
    "import { useAuth } from '../../contexts/AuthContext';",
    "import { useAuth } from '../../contexts/AuthContext';\nimport { useProfile } from '../../hooks/useProfile';"
  )

  data = data.replace(
    "const { signIn } = useAuth();",
    "const { signIn } = useAuth();\n  const { profile } = useProfile();"
  )
}

data = data.replace(
  /<div className="w-16 h-16 rounded-2xl bg-bg-card border border-white\/5 flex items-center justify-center mx-auto mb-6 shadow-xl">\n          <span className="font-space font-bold text-2xl text-white tracking-tighter">\n            <span className="text-accent-cyan">&lt;<\/span>AB<span className="text-accent-cyan">\/&gt;<\/span>\n          <\/span>\n        <\/div>/g,
  `<div className="w-16 h-16 rounded-2xl bg-bg-card border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden">
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="font-space font-bold text-2xl text-white tracking-tighter">
              <span className="text-accent-cyan">&lt;</span>AB<span className="text-accent-cyan">/&gt;</span>
            </span>
          )}
        </div>`
)

fs.writeFileSync(file, data)
