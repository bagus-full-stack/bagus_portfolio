import { serve } from "https://deno.land/std/http/server.ts"
import { OpenAI } from "https://deno.land/x/openai/mod.ts"
import {
  getCorsHeaders,
  isOriginAllowed,
  handlePreflight
} from "../_shared/cors.ts"

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!
})

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
    const { message, history } = await req.json()

    // CV complet injecté côté serveur (jamais exposé au client)
    const CV_JSON = Deno.env.get("CV_JSON")!

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es l'assistant professionnel d'Assami Baga,
          ingénieur Full Stack & IA. Tu réponds UNIQUEMENT sur la
          base des informations de son parcours ci-dessous.
          Ne jamais inventer d'informations. Si une question dépasse
          ce cadre, redirige vers le formulaire de contact.
          CV : ${CV_JSON}`
        },
        ...history,
        { role: "user", content: message }
      ],
      max_tokens: 500
    })

    return new Response(
      JSON.stringify({
        response: response.choices[0].message.content
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    )
  } catch (error) {
    // Erreur générique — pas de détails techniques
    return new Response(
      JSON.stringify({
        error: 'Une erreur est survenue'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
