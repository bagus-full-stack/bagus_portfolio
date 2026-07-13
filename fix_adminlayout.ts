import fs from 'fs'

const file = 'src/components/admin/AdminLayout.tsx'
let data = fs.readFileSync(file, 'utf8')

if (!data.includes("useProfile")) {
  data = data.replace(
    "import { Link, useLocation, useNavigate } from 'react-router-dom';",
    "import { Link, useLocation, useNavigate } from 'react-router-dom';\nimport { useProfile } from '../../hooks/useProfile';"
  )

  data = data.replace(
    "const location = useLocation();",
    "const location = useLocation();\n  const { profile } = useProfile();"
  )
}

data = data.replace(
  /<div className="w-10 h-10 rounded-xl bg-bg-primary border border-white\/5 flex items-center justify-center">\n            <span className="font-space font-bold text-lg text-white tracking-tighter">\n            <span className="text-accent-cyan">&lt;<\/span>AB<span className="text-accent-cyan">\/&gt;<\/span>\n            <\/span>\n          <\/div>/g,
  `<div className="w-10 h-10 rounded-xl bg-bg-primary border border-white/5 flex items-center justify-center overflow-hidden">
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="font-space font-bold text-lg text-white tracking-tighter">
                <span className="text-accent-cyan">&lt;</span>AB<span className="text-accent-cyan">/&gt;</span>
              </span>
            )}
          </div>`
)

fs.writeFileSync(file, data)
