import fs from 'fs'

let file = 'src/components/PWAInstallBanner.tsx'
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
}

data = data.replace(
  /<img src="\/icons\/pwa-192x192\.png" alt="Logo" className="w-12 h-12 rounded-xl shrink-0" \/>/,
  `{profile?.photo_url ? (
          <img src={profile.photo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[var(--border-subtle)]" />
        ) : (
          <div className="w-12 h-12 rounded-xl shrink-0 bg-[#E08A3E]/20 flex items-center justify-center border border-[#E08A3E]/30">
            <span className="text-[#E08A3E] font-[JetBrains_Mono] font-bold text-sm">AB</span>
          </div>
        )}`
)

data = data.replace(/t\('pwa\.title'\)/g, "t('pwa.install_title')")
data = data.replace(/t\('pwa\.desc'\)/g, "t('pwa.install_desc')")
data = data.replace(/t\('pwa\.later'\)/g, "t('pwa.install_later')")
data = data.replace(/t\('pwa\.install'\)/g, "t('pwa.install_btn')")

fs.writeFileSync(file, data)


file = 'src/components/PWAUpdateBanner.tsx'
data = fs.readFileSync(file, 'utf8')

if (!data.includes('useTranslation')) {
  data = data.replace(
    "import { RefreshCw, X } from 'lucide-react';",
    "import { RefreshCw, X } from 'lucide-react';\nimport { useTranslation } from '../hooks/useTranslation';"
  )

  data = data.replace(
    "const PWAUpdateBanner = () => {",
    "const PWAUpdateBanner = () => {\n  const { t } = useTranslation();"
  )
}

data = data.replace(
  />Nouvelle version disponible<\/p>/,
  ">{t('pwa.update_available')}</p>"
)

data = data.replace(
  />Mettre à jour<\/button>/,
  ">{t('pwa.update_btn')}</button>"
)

fs.writeFileSync(file, data)
