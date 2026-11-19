// Rebuilds the chatbot index: portfolio content -> passages -> Gemini embeddings -> portfolio.chunks.
// Admin only: the caller's JWT is forwarded, and rag_replace_chunks() checks admin_users.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { getCorsHeaders, isOriginAllowed, handlePreflight } from '../_shared/cors.ts'
import { buildChunks, embed } from '../_shared/rag.ts'

serve(async (req) => {
  const origin = req.headers.get('origin')
  const preflight = handlePreflight(req)
  if (preflight) return preflight
  const cors = { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { headers: cors, status })

  if (!isOriginAllowed(origin)) return reply({ error: 'Accès non autorisé' }, 403)

  try {
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) throw new Error('GEMINI_API_KEY is not set')

    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_ANON_KEY') || '', {
      db: { schema: 'portfolio' },
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    })

    const [profile, experiences, projects, skills, certifications] = await Promise.all([
      supabase.from('profiles').select('*').maybeSingle(),
      supabase.from('experiences').select('*').order('start_date', { ascending: false }),
      supabase.from('projects').select('*'),
      supabase.from('skills').select('*'),
      supabase.from('certifications').select('*'),
    ])
    const failed = [profile, experiences, projects, skills, certifications].find((r) => r.error)
    if (failed) throw new Error(failed.error!.message)

    const chunks = buildChunks({
      profile: profile.data, experiences: experiences.data, projects: projects.data,
      skills: skills.data, certifications: certifications.data,
    })
    // shortcut: Gemini free tier = 100 embedding requests/min and the function dies after ~30 s; above that, batch across calls
    if (chunks.length > 95) return reply({ error: `${chunks.length} passages: dépasse le quota Gemini gratuit (100/min)` }, 413)
    const vectors = await embed(chunks.map((c) => c.content), geminiKey, 'RETRIEVAL_DOCUMENT')
    const rows = chunks.map((c, i) => ({ ...c, embedding: JSON.stringify(vectors[i]) }))

    const { data, error } = await supabase.rpc('rag_replace_chunks', { rows })
    if (error) return reply({ error: error.message }, error.code === '42501' ? 403 : 500)
    return reply({ indexed: data })
  } catch (e) {
    console.error('rag-index:', (e as Error).message)
    return reply({ error: (e as Error).message }, 500)
  }
})
