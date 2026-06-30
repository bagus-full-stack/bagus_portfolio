import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { getCorsHeaders, isOriginAllowed, handlePreflight } from "../_shared/cors.ts"

serve(async (req: Request) => {
  const origin = req.headers.get('origin')

  // Gérer le preflight OPTIONS
  const preflightResponse = handlePreflight(req)
  if (preflightResponse) return preflightResponse

  // Vérifier l'origine en production
  if (!isOriginAllowed(origin)) {
    return new Response(
      JSON.stringify({
        error: 'Accès non autorisé'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin)
        }
      }
    )
  }

  const corsHeaders = getCorsHeaders(origin)

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase credentials missing')
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // Récupérer les infos de la requête
    const ip =
      req.headers.get('x-forwarded-for')
        ?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const userAgent =
      req.headers.get('user-agent') || ''

    // Récupérer la localisation via l'IP
    // Tentative 1 : headers Cloudflare (production)
    let country =
      req.headers.get('cf-ipcountry') || ''
    let city =
      req.headers.get('cf-ipcity') || ''

    // Tentative 2 : headers Vercel/autres CDN
    if (!country) {
      country =
        req.headers.get('x-vercel-ip-country') || ''
      city =
        req.headers.get('x-vercel-ip-city') || ''
    }

    // Tentative 3 : API de géolocalisation
    // en fallback si toujours vide
    if (!country && ip !== 'unknown') {
      try {
        const geoResponse = await fetch(
          `https://ipapi.co/${ip}/json/`,
          {
            headers: {
              'User-Agent': 'portfolio-tracker/1.0'
            },
            signal: AbortSignal.timeout(2000) // 2s max
          }
        )

        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          country = geoData.country_name || ''
          city = geoData.city || ''
        }
      } catch {
        // Géolocalisation non critique
        // Continuer sans localisation
        country = ''
        city = ''
      }
    }

    // Stocker aussi le code pays (plus fiable)
    // pour afficher le drapeau emoji
    const countryCode =
      req.headers.get('cf-ipcountry') || ''

    const body = await req.json().catch(() => ({}))
    const page = body.page || '/'

    // Générer une empreinte anonyme et non
    // réversible : hash(IP + UserAgent + Date)
    // On ne stocke JAMAIS l'IP brute
    const today = new Date()
      .toISOString().split('T')[0]

    const rawFingerprint =
      `${ip}-${userAgent}-${today}`

    // Hasher avec l'API Web Crypto (Deno natif)
    const encoder = new TextEncoder()
    const data = encoder.encode(rawFingerprint)
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256', data
    )
    const hashArray = Array.from(
      new Uint8Array(hashBuffer)
    )
    const fingerprint = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32) // 32 chars suffisent

    // Passer countryCode à la RPC
    const { data: result, error } =
      await supabase.rpc('increment_visitors', {
        p_fingerprint: fingerprint,
        p_page: page,
        p_country: country,
        p_city: city,
        p_country_code: countryCode
      })

    if (error) throw error

    return new Response(
      JSON.stringify({
        total: result.total,
        is_new: result.is_new
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
    console.error('Tracking error:', error)
    return new Response(
      JSON.stringify({ total: 0, is_new: false }),
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
