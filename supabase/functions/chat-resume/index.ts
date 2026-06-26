// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// import { corsHeaders } from '../_shared/cors.ts'
//
// interface ChatMessage {
//   role: 'user' | 'assistant'
//   content: string
//   timestamp: string
// }
//
// interface ChatRequest {
//   message: string
//   history: ChatMessage[]
// }
//
// const CV_JSON = JSON.stringify({
//   name: "Assami Baga",
//   role: "Ingénieur Full Stack & IA",
//   bio: "Développeur passionné avec 5 ans d'expérience.",
//   experiences: [
//     { role: "Lead Dev", company: "AgroSahel AI", year: "2024-2026", description: "Plateforme IA pour l'agriculture en Afrique." }
//   ],
//   availability: "Disponible pour de nouvelles opportunités"
// });
//
// const SYSTEM_PROMPT = `Tu es l'assistant professionnel d'Assami Baga,
// ingénieur Full Stack & IA. Tu réponds uniquement
// sur la base des informations de son parcours
// ci-dessous. Si une question dépasse ce cadre,
// redirige poliment vers le formulaire de contact.
// Ne jamais inventer d'informations.
// CV : ${CV_JSON}`;
//
// serve(async (req) => {
//   // Gestion CORS (Preflight request)
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }
//
//   try {
//     const { message, history } = await req.json() as ChatRequest
//
//     if (!message) {
//       return new Response(JSON.stringify({ error: 'Message is required' }), {
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//         status: 400,
//       })
//     }
//
//     const openAiKey = Deno.env.get('OPENAI_API_KEY')
//     if (!openAiKey) {
//       throw new Error('OPENAI_API_KEY is not set')
//     }
//
//     const apiMessages = [
//       { role: 'system', content: SYSTEM_PROMPT },
//       ...(history || []).map((msg) => ({
//         role: msg.role === 'user' ? 'user' : 'assistant',
//         content: msg.content
//       })),
//       { role: 'user', content: message }
//     ]
//
//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${openAiKey}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'gpt-4o-mini',
//         messages: apiMessages,
//         temperature: 0.7,
//         max_tokens: 500,
//       }),
//     })
//
//     const data = await response.json()
//
//     if (!response.ok) {
//       console.error(data)
//       throw new Error(data.error?.message || 'Error from OpenAI API')
//     }
//
//     const assistantMessage = data.choices[0].message.content
//
//     return new Response(JSON.stringify({ response: assistantMessage }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 200,
//     })
//
//   } catch (error: any) {
//     console.error(error)
//     return new Response(JSON.stringify({ error: error.message }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 500,
//     })
//   }
// })


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatRequest {
  message: string
  history: ChatMessage[]
}

const CV_JSON = JSON.stringify({
  name: "Assami Baga",
  role: "Ingénieur Full Stack & IA",
  bio: "Développeur passionné avec 5 ans d'expérience.",
  experiences: [
    { role: "Lead Dev", company: "AgroSahel AI", year: "2024-2026", description: "Plateforme IA pour l'agriculture en Afrique." }
  ],
  availability: "Disponible pour de nouvelles opportunités"
});

const SYSTEM_PROMPT = `Tu es l'assistant professionnel d'Assami Baga,
ingénieur Full Stack & IA. Tu réponds uniquement
sur la base des informations de son parcours
ci-dessous. Si une question dépasse ce cadre,
redirige poliment vers le formulaire de contact.
Ne jamais inventer d'informations.
CV : ${CV_JSON}`;

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
  // Gestion CORS (Preflight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, history } = await req.json() as ChatRequest

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    // Formatage de l'historique pour l'API Gemini
    // L'API Google attend "user" ou "model" (au lieu de "assistant")
    const geminiContents = (history || []).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Ajout du message actuel de l'utilisateur
    geminiContents.push({ role: 'user', parts: [{ text: message }] })

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
                  maxOutputTokens: 500,
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
        assistantMessage = data.candidates[0].content.parts[0].text;
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
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})