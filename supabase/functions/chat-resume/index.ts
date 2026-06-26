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

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error(data)
      throw new Error(data.error?.message || 'Error from OpenAI API')
    }

    const assistantMessage = data.choices[0].message.content

    return new Response(JSON.stringify({ response: assistantMessage }), {
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
