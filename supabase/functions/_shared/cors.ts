const ALLOWED_ORIGINS = [
  'https://bagus-full-stack.me',       // production
  'https://www.bagus-full-stack.me',   // variante www
  'http://localhost:5173',             // dev Vite
  'http://localhost:4173',             // preview Vite
  'http://localhost:3000',             // dev alternatif
]

const isProd = Deno.env.get('ENVIRONMENT') === 'production'

export const getCorsHeaders = (
  requestOrigin: string | null
): Record<string, string> => {

  // En développement local : tout autoriser
  if (!isProd) {
    return {
      'Access-Control-Allow-Origin': requestOrigin || '*',
      'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods':
        'POST, GET, OPTIONS',
      'Access-Control-Max-Age': '86400'
    }
  }

  // En production : vérifier la liste blanche
  const isAllowed = requestOrigin &&
    ALLOWED_ORIGINS.includes(requestOrigin)

  return {
    'Access-Control-Allow-Origin': isAllowed
      ? requestOrigin!
      : 'https://bagus-full-stack.me', // fallback domaine prod
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods':
      'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  }
}

// Fonction utilitaire pour vérifier l'origine
export const isOriginAllowed = (
  origin: string | null
): boolean => {
  if (!isProd) return true // tout autorisé en dev
  if (!origin) return false
  return ALLOWED_ORIGINS.includes(origin)
}

// Réponse OPTIONS préflight
export const handlePreflight = (
  req: Request
): Response | null => {
  if (req.method !== 'OPTIONS') return null

  const origin = req.headers.get('origin')
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin)
  })
}

