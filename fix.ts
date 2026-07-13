import fs from 'fs'

const shortUrlFile = 'src/pages/ShortUrlRedirect.tsx'
let shortUrlData = fs.readFileSync(shortUrlFile, 'utf8')
shortUrlData = shortUrlData.replace(
  /supabase\.rpc\('increment_short_url_clicks', \{ p_slug: slug \}\)\.catch\(\(\) => \{\}\);/g,
  'supabase.rpc(\'increment_short_url_clicks\', { p_slug: slug }).then(() => {});'
)
fs.writeFileSync(shortUrlFile, shortUrlData)

const mediaManagerFile = 'src/pages/admin/MediaManager.tsx'
let mediaManagerData = fs.readFileSync(mediaManagerFile, 'utf8')
mediaManagerData = mediaManagerData.replace(
  /as any/g,
  ''
)
mediaManagerData = mediaManagerData.replace(
  /const CVUploadCard = \(\{/g,
  'const CVUploadCard: React.FC<CVUploadCardProps> = ({'
)
fs.writeFileSync(mediaManagerFile, mediaManagerData)
