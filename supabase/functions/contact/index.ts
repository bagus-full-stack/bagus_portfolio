import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import {
  getCorsHeaders,
  isOriginAllowed,
  handlePreflight
} from "../_shared/cors.ts"

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

// Limite par IP (mémoire de l'instance : suffit à freiner un script simple)
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 3
const byIp = new Map<string, number[]>()
const tooMany = (ip: string) => {
  const now = Date.now()
  const recent = (byIp.get(ip) || []).filter(t => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) return true
  recent.push(now)
  byIp.set(ip, recent)
  if (byIp.size > 1000) {
    for (const [k, v] of byIp) if (v.every(t => now - t >= WINDOW_MS)) byIp.delete(k)
  }
  return false
}

const json = (body: unknown, status: number, corsHeaders: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

serve(async (req) => {
  const origin = req.headers.get('origin')

  const preflightResponse = handlePreflight(req)
  if (preflightResponse) return preflightResponse

  if (!isOriginAllowed(origin)) {
    return json({ error: 'Accès non autorisé' }, 403, getCorsHeaders(origin))
  }
  const corsHeaders = getCorsHeaders(origin)

  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405, corsHeaders)

  try {
    const body = await req.json().catch(() => ({}))
    const { name, email, subject, message } = body

    // Mêmes bornes que la contrainte messages_length_check
    const valid =
      typeof name === 'string' && name.trim() !== '' && name.length <= 200 &&
      typeof email === 'string' && email.length <= 320 && EMAIL_RE.test(email) &&
      (subject == null || (typeof subject === 'string' && subject.length <= 300)) &&
      typeof message === 'string' && message.trim() !== '' && message.length <= 5000
    if (!valid) return json({ error: 'Invalid message' }, 400, corsHeaders)

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    if (tooMany(ip)) return json({ error: 'Too many messages, try again later' }, 429, corsHeaders)

    // La clé service contourne la RLS : la table n'est plus ouverte en écriture aux anonymes
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { db: { schema: 'portfolio' } }
    )
    const { error } = await admin.from('messages').insert({
      name: name.trim(), email, subject: subject ?? '', message
    })
    if (error) throw error

    return json({ ok: true }, 200, corsHeaders)
  } catch (_) {
    return json({ error: 'Une erreur est survenue' }, 500, corsHeaders)
  }
})
