import { serve } from
  "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2"

// Headers CORS — accepter assami.dev
// ET localhost pour le développement
const getAllowedOrigin = (origin: string | null) => {
  const allowed = [
    'https://assami.dev',
    'https://www.assami.dev',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000'
  ]
  if (origin && allowed.includes(origin)) {
    return origin
  }
  return 'https://assami.dev'
}

const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin':
    getAllowedOrigin(origin),
  'Access-Control-Allow-Methods':
    'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'content-type, authorization, x-client-info',
  'Access-Control-Max-Age': '86400'
})

serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // CRITIQUE : répondre immédiatement au preflight
  // avec status 200 (pas 204)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,  // ← 200 obligatoire, pas 204
      headers: corsHeaders
    })
  }

  // Vérifier la méthode
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer l'IP
    const ip =
      req.headers.get('x-forwarded-for')
        ?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const userAgent =
      req.headers.get('user-agent') || ''

    // Localisation via headers Cloudflare
    let country =
      req.headers.get('cf-ipcountry') || ''
    let city =
      req.headers.get('cf-ipcity') || ''

    // Fallback API géolocalisation si vide
    if (!country && ip !== 'unknown') {
      try {
        const geoRes = await fetch(
          `https://ipapi.co/${ip}/json/`,
          { signal: AbortSignal.timeout(2000) }
        )
        if (geoRes.ok) {
          const geo = await geoRes.json()
          country = geo.country_name || ''
          city = geo.city || ''
        }
      } catch {
        // Non critique — continuer sans localisation
      }
    }

    // Body de la requête
    let page = '/'
    try {
      const body = await req.json()
      page = body.page || '/'
    } catch {
      // Body vide ou invalide — utiliser défaut
    }

    // Générer le fingerprint anonyme
    const today = new Date()
      .toISOString().split('T')[0]
    const raw = `${ip}-${userAgent}-${today}`
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(raw)
    )
    const fingerprint = Array.from(
      new Uint8Array(hashBuffer)
    )
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32)

    // Appel RPC Supabase
    const { data, error } =
      await supabase.rpc('increment_visitors', {
        p_fingerprint: fingerprint,
        p_page: page,
        p_country: country,
        p_city: city
      })

    if (error) throw error

    return new Response(
      JSON.stringify({
        total: data?.total ?? 0,
        is_new: data?.is_new ?? false
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('track-visitor error:', error)

    return new Response(
      JSON.stringify({
        total: 0,
        is_new: false,
        error: 'Internal error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
