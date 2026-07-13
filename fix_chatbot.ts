import fs from 'fs'

const file = 'src/components/ChatbotWidget.tsx'
let data = fs.readFileSync(file, 'utf8')

if (!data.includes("useProfile")) {
  data = data.replace(
    "import { useTranslation } from '../hooks/useTranslation';",
    "import { useTranslation } from '../hooks/useTranslation';\nimport { useProfile } from '../hooks/useProfile';"
  )

  data = data.replace(
    "const { t } = useTranslation();",
    "const { t } = useTranslation();\n  const { profile } = useProfile();"
  )
}

data = data.replace(
  /<div className="w-8 h-8 rounded-full bg-\[#E08A3E\]\/20 border border-\[#E08A3E\]\/30 flex items-center justify-center">\n                <span className="text-\[#E08A3E\] text-xs font-\[JetBrains_Mono\] font-bold">\n                  AB\n                <\/span>\n              <\/div>/,
  `<div className="w-8 h-8 rounded-full bg-[#E08A3E]/20 border border-[#E08A3E]/30 flex items-center justify-center overflow-hidden">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="Bot" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#E08A3E] text-xs font-[JetBrains_Mono] font-bold">AB</span>
                )}
              </div>`
)

fs.writeFileSync(file, data)
