import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  getCorsHeaders,
  isOriginAllowed,
  handlePreflight
} from "../_shared/cors.ts"

// Liste de priorité des modèles Google (Fallback)
const MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash"
];

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

  const corsHeaders = getCorsHeaders(origin)

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Méthode non autorisée' }),
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
    const { text, texts, from, to } = await req.json()

    // Mode lot : une seule requête Gemini pour N textes (tableau JSON en entrée et en sortie)
    if (Array.isArray(texts)) {
      const reply = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), {
          status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      const total = texts.reduce((n: number, t: unknown) => n + (typeof t === 'string' ? t.length : 1e9), 0)
      if (texts.length < 1 || texts.length > 60 || total > 12000 ||
          !['fr', 'en'].includes(from) || !['fr', 'en'].includes(to)) {
        return reply({ error: 'Paramètres invalides : texts (1-60 chaînes, 12000 caractères max), from, to' }, 400)
      }
      if (from === to) return reply({ translations: texts })

      const key = Deno.env.get('GEMINI_API_KEY')
      if (!key) throw new Error('GEMINI_API_KEY is not set')
      const names: Record<string, string> = { fr: 'French', en: 'English' }
      const batchPrompt = `You are a professional translator specializing in technical and professional content.
Translate every string of the JSON array below from ${names[from]} to ${names[to]}.
STRICT RULES :
- Return ONLY a JSON array of strings, same length and same order as the input
- Preserve ALL technical terms exactly as-is (React, TypeScript, FastAPI, Docker, etc.)
- Preserve proper nouns and brand names (Assami Baga, AgroSahel AI, Supabase, etc.)
- Preserve punctuation, capitalization and the same professional tone

${JSON.stringify(texts)}`

      for (const modelName of MODELS) {
        try {
          const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: batchPrompt }] }],
                generationConfig: {
                  temperature: 0.1,
                  maxOutputTokens: 8000,
                  responseMimeType: 'application/json'
                }
              })
            }
          )
          const d = await r.json()
          if (!r.ok || d.error) continue
          const out = JSON.parse(d.candidates[0].content.parts[0].text)
          if (Array.isArray(out) && out.length === texts.length && out.every((x: unknown) => typeof x === 'string')) {
            return reply({ translations: out.map((x: string) => x.trim()) })
          }
        } catch (_) {
          continue
        }
      }
      throw new Error('Tous les modèles ont échoué (mode lot)')
    }

    if (!text || !from || !to) {
      return new Response(
        JSON.stringify({
          error: 'Paramètres manquants : text, from, to'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (text.length > 2000) {
      return new Response(
        JSON.stringify({
          error: 'Texte trop long (max 2000 caractères)'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const supportedLangs = ['fr', 'en']
    if (!supportedLangs.includes(from) || !supportedLangs.includes(to)) {
      return new Response(
        JSON.stringify({
          error: 'Langues supportées : fr, en'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (from === to) {
      return new Response(
        JSON.stringify({ translated: text }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const langNames: Record<string, string> = {
      fr: 'French',
      en: 'English'
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    const prompt = `You are a professional translator specializing in technical and professional content.

Translate the following text from ${langNames[from]} to ${langNames[to]}.

STRICT RULES :
- Return ONLY the translated text
- No explanations, no quotes, no preamble
- Preserve ALL technical terms exactly as-is (React, TypeScript, FastAPI, Docker, etc.)
- Preserve proper nouns and brand names (Assami Baga, AgroSahel AI, Supabase, etc.)
- Preserve the exact same formatting (line breaks, punctuation, capitalization)
- Preserve the same professional tone
- If a term has no good translation, keep the original term

TEXT TO TRANSLATE :
${text}`

    let lastError = null;
    let translated = null;

    for (const modelName of MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2000,
              }
            }),
          }
        )

        const data = await response.json()
        
        if (!response.ok || data.error) {
          lastError = data.error?.message || `Erreur HTTP ${response.status}`;
          continue;
        }

        translated = data.candidates[0].content.parts[0].text.trim();
        break;

      } catch (err: any) {
        lastError = err.message;
        continue;
      }
    }

    if (!translated) {
      throw new Error(`Tous les modèles ont échoué. Dernière erreur : ${lastError}`);
    }

    return new Response(
      JSON.stringify({ translated }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({
        error: 'Erreur de traduction'
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
