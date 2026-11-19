import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import {
  getCorsHeaders,
  isOriginAllowed,
  handlePreflight
} from "../_shared/cors.ts"
import { embed } from "../_shared/rag.ts"

const RAG_TOP_K = 5
const RAG_MIN_SIMILARITY = 0.35 // below this a passage is noise: answer from the rest or redirect

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatRequest {
  message: string
  history: ChatMessage[]
  lang?: string
}

// Liste de priorité des modèles Google (Fallback)
const MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash"
];

const rateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 3000; // 3 seconds
const MAX_HISTORY = 10;
const MAX_HISTORY_CHARS = 500;

serve(async (req) => {
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

  // Headers CORS à inclure dans TOUTES les réponses
  const corsHeaders = getCorsHeaders(origin)

  try {
    // Basic Rate Limiting using in-memory Map based on IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const lastRequestTime = rateLimit.get(ip) || 0;
    
    if (now - lastRequestTime < RATE_LIMIT_WINDOW) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait 3 seconds.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      })
    }
    rateLimit.set(ip, now);
    // La Map ne doit pas grossir sans fin : on purge les entrées déjà expirées
    if (rateLimit.size > 1000) {
      for (const [k, t] of rateLimit) if (now - t >= RATE_LIMIT_WINDOW) rateLimit.delete(k);
    }

    const { message, history, lang } = await req.json() as ChatRequest
    const ragLang = lang === 'en' ? 'en' : 'fr'

    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (trimmedMessage.length > 500) {
      return new Response(JSON.stringify({ error: 'Message exceeds the 500 characters limit' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 413,
      })
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    // Récupération dynamique du CV via Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'portfolio' } });

    // RAG: embed the question, keep the closest passages. Any failure (no index yet, API down) -> full CV below.
    let passages: string | null = null;
    try {
      const [queryVec] = await embed([trimmedMessage], geminiKey, 'RETRIEVAL_QUERY');
      const { data: hits, error: ragError } = await supabase.rpc('match_chunks', {
        query_embedding: queryVec, match_lang: ragLang, match_count: RAG_TOP_K,
      });
      if (ragError) throw ragError;
      const good = (hits || []).filter((h: any) => h.similarity >= RAG_MIN_SIMILARITY);
      if (good.length) passages = good.map((h: any) => h.content).join('\n---\n');
    } catch (e) {
      console.warn('RAG indisponible, repli sur le CV complet :', (e as Error).message);
    }

    let CV_JSON = '';
    if (!passages) {
    const [
      { data: profile },
      { data: experiences },
      { data: projects },
      { data: skills }
    ] = await Promise.all([
      supabase.from('profiles').select('*').maybeSingle(),
      supabase.from('experiences').select('*').order('start_date', { ascending: false }),
      supabase.from('projects').select('*'),
      supabase.from('skills').select('*')
    ]);

    CV_JSON = JSON.stringify({
      name: profile?.name || profile?.name_fr || "Assami Baga",
      role: profile?.title || "Ingénieur Full Stack & IA",
      bio: profile?.bio || "Développeur passionné avec 5 ans d'expérience.",
      contact: profile?.email ? { email: profile.email, github: profile.github_url, linkedin: profile.linkedin_url } : null,
      experiences: (experiences || []).map(exp => ({
        role: exp.title || exp.title_fr,
        company: exp.organization || exp.organization_fr,
        period: `${exp.start_date} - ${exp.end_date || 'Présent'}`,
        description: exp.description || exp.description_fr
      })),
      projects: (projects || []).map(p => ({
        title: p.title,
        description: p.description,
        technologies: p.stack
      })),
      skills: (skills || []).map(s => s.name),
      availability: "Disponible pour de nouvelles opportunités"
    });
    }

    const SYSTEM_PROMPT = `Tu es l'assistant professionnel de ce profil.
Tu réponds uniquement sur la base des informations du parcours ci-dessous.
Si une question dépasse ce cadre, redirige poliment vers le formulaire de contact ou la réservation d'un appel.
Ne jamais inventer d'informations. Réponds de manière concise, polie et engageante, toujours dans la langue de la question.
${passages ? `Extraits pertinents du parcours :\n${passages}` : `CV : ${CV_JSON}`}`;

    // Formatage de l'historique pour l'API Gemini
    // L'API Google attend "user" ou "model" (au lieu de "assistant")
    // Historique venu du client : on borne le nombre et la taille des messages (coût Gemini)
    const safeHistory = (Array.isArray(history) ? history : [])
      .slice(-MAX_HISTORY)
      .filter((msg) => typeof msg?.content === 'string' && msg.content.trim() !== '')
    const geminiContents = safeHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content.slice(0, MAX_HISTORY_CHARS) }]
    }))
    
    // Ajout du message actuel de l'utilisateur
    geminiContents.push({ role: 'user', parts: [{ text: trimmedMessage }] })

    let lastError = null;
    let assistantMessage = null;
    let usedModel = "";

    // Boucle sur les modèles (Stratégie de Fallback)
    for (const modelName of MODELS) {
      try {
        console.log(`Tentative avec le modèle : ${modelName}...`);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }]
              },
              contents: geminiContents,
              generationConfig: {
                temperature: 0.7,
                // Gemini 3.x counts its internal reasoning tokens in this limit: 500 cut answers mid-sentence
                maxOutputTokens: 2048,
              }
            }),
          }
        )

        const data = await response.json()
        
        // Gestion des erreurs d'API (quota, modèle non trouvé, etc.)
        if (!response.ok || data.error) {
          lastError = data.error?.message || `Erreur HTTP ${response.status}`;
          console.warn(`Échec ${modelName} : ${lastError}`);
          continue; // On passe au modèle suivant dans la liste
        }

        // Si succès, on extrait le message et on casse la boucle
        const cand = data.candidates?.[0];
        // Skip reasoning parts; a truncated or empty answer falls through to the next model
        const text = (cand?.content?.parts || []).filter((x: any) => !x.thought).map((x: any) => x.text || '').join('').trim();
        if (!text || cand?.finishReason === 'MAX_TOKENS') {
          lastError = `Réponse vide ou tronquée (${cand?.finishReason || 'aucun candidat'})`;
          console.warn(`Échec ${modelName} : ${lastError}`);
          continue;
        }
        assistantMessage = text;
        usedModel = modelName;
        break;

      } catch (err: any) {
        lastError = err.message;
        console.warn(`Erreur réseau avec ${modelName} : ${lastError}`);
        continue;
      }
    }

    // Si tous les modèles de la liste ont échoué
    if (!assistantMessage) {
      throw new Error(`Tous les modèles ont échoué. Dernière erreur : ${lastError}`);
    }

    return new Response(JSON.stringify({ 
      response: assistantMessage, 
      model: usedModel 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    // Erreur générique — pas de détails techniques
    return new Response(JSON.stringify({ error: 'Une erreur est survenue' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
