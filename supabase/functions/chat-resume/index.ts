import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
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

serve(async (req) => {
  // Gestion CORS (Preflight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

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

    const { message, history } = await req.json() as ChatRequest

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
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const [
      { data: profile },
      { data: experiences },
      { data: projects },
      { data: skills }
    ] = await Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('experiences').select('*').order('start_date', { ascending: false }),
      supabase.from('projects').select('*'),
      supabase.from('skills').select('*')
    ]);

    const CV_JSON = JSON.stringify({
      name: profile?.full_name || "Assami Baga",
      role: profile?.title || "Ingénieur Full Stack & IA",
      bio: profile?.bio || "Développeur passionné avec 5 ans d'expérience.",
      contact: profile?.email ? { email: profile.email, github: profile.github_url, linkedin: profile.linkedin_url } : null,
      experiences: (experiences || []).map(exp => ({
        role: exp.role,
        company: exp.company,
        period: `${exp.start_date} - ${exp.end_date || 'Présent'}`,
        description: exp.description
      })),
      projects: (projects || []).map(p => ({
        title: p.title,
        description: p.description,
        technologies: p.technologies
      })),
      skills: (skills || []).map(s => s.name),
      availability: "Disponible pour de nouvelles opportunités"
    });

    const SYSTEM_PROMPT = `Tu es l'assistant professionnel de ce profil.
Tu réponds uniquement sur la base des informations du parcours ci-dessous.
Si une question dépasse ce cadre, redirige poliment vers le formulaire de contact ou la réservation d'un appel.
Ne jamais inventer d'informations. Réponds de manière concise, polie et engageante.
CV : ${CV_JSON}`;

    // Formatage de l'historique pour l'API Gemini
    // L'API Google attend "user" ou "model" (au lieu de "assistant")
    const geminiContents = (history || []).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
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
