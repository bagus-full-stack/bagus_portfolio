import { serve } from "https://deno.land/std/http/server.ts"
import { OpenAI } from "https://deno.land/x/openai/mod.ts"

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!
})

serve(async (req) => {
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
    { headers: { "Content-Type": "application/json" } }
  )
})
