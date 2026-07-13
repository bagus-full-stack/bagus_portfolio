import fs from 'fs'

const mediaManagerFile = 'src/pages/admin/MediaManager.tsx'
let mediaManagerData = fs.readFileSync(mediaManagerFile, 'utf8')
mediaManagerData = mediaManagerData.replace(
  /onDropRejected: \(\) => \{\n      toast\.error\('PDF uniquement · Max 10MB'\)\n    \}\n  \}\)/g,
  "onDropRejected: () => {\n      toast.error('PDF uniquement · Max 10MB')\n    }\n  } as any)"
)
fs.writeFileSync(mediaManagerFile, mediaManagerData)
