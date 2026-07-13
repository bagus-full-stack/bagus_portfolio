import { createClient } from '@supabase/supabase-js';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase Edge Function logic ported to Express for AI Studio
  app.get("/api/news", async (req, res) => {
    try {
      const lang = req.query.lang as string;
      const response = await fetch('https://dev.to/api/articles?tag=tech&per_page=100');
      if (!response.ok) {
        throw new Error('Failed to fetch from dev.to');
      }
      const data = await response.json();
      
      let filtered = data.filter((article: any) => 
        article.language === 'en' || article.language === 'fr'
      );
      
      if (lang) {
        const matching = filtered.filter((a: any) => a.language === lang);
        if (matching.length >= 3) {
            filtered = matching;
        }
      }
      
      res.json(filtered.slice(0, 10));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/translate", async (req, res) => {
    try {
      const { text, from, to } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
      }
      
      const prompt = `You are a professional translator specializing in technical and professional content.
Translate the following text from ${from} to ${to}.
STRICT RULES :
- Return ONLY the translated text
- No explanations, no quotes, no preamble
- Preserve ALL technical terms exactly as-is (React, TypeScript, FastAPI, Docker, etc.)
- Preserve proper nouns and brand names
- Preserve the exact same formatting (line breaks, punctuation, capitalization)
- Preserve the same professional tone
- If a term has no good translation, keep the original term

TEXT TO TRANSLATE :
${text}`;

      const MODELS = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.1-pro-preview",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-1.5-flash"
      ];
      
      let translated = null;
      let lastError = null;
      
      for (const modelName of MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
              })
            }
          );
          const aiData = await response.json();
          if (!response.ok || aiData.error) {
            lastError = aiData.error?.message || `HTTP ${response.status}`;
            continue;
          }
          translated = aiData.candidates[0].content.parts[0].text.trim();
          break;
        } catch (err: any) {
          lastError = err.message;
          continue;
        }
      }
      
      if (!translated) {
        throw new Error(`All models failed. Last error: ${lastError}`);
      }
      
      res.json({ translated });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/chat-resume", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

      const cvJson = JSON.stringify({
        name: profile?.full_name || profile?.name || "Assami Baga",
        role: profile?.title || "Ingénieur Full Stack & IA",
        bio: profile?.bio || "Développeur passionné avec 5 ans d'expérience.",
        contact: profile?.email ? { email: profile.email, github: profile.github_url, linkedin: profile.linkedin_url } : null,
        experiences: (experiences || []).map(exp => ({
          role: exp.role || exp.title_fr || exp.title_en,
          company: exp.company || exp.organization_fr,
          period: `${exp.start_date} - ${exp.end_date || 'Présent'}`,
          description: exp.description || exp.description_fr || exp.description_en
        })),
        projects: (projects || []).map(p => ({
          title: p.title || p.title_fr,
          description: p.description || p.description_fr,
          technologies: p.technologies || p.tech_stack
        })),
        skills: (skills || []).map(s => s.name),
        availability: "Disponible pour de nouvelles opportunités"
      });

      const systemPrompt = `Tu es l'assistant professionnel d'Assami Baga,
ingénieur Full Stack & IA. Tu réponds uniquement
sur la base des informations de son parcours
ci-dessous. Si une question dépasse ce cadre,
redirige poliment vers le formulaire de contact.
Ne jamais inventer d'informations.
CV : ${cvJson}`;

      const geminiContents = (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      geminiContents.push({ role: 'user', parts: [{ text: message }] });

      const MODELS = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.1-pro-preview",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-1.5-flash"
      ];

      let assistantMessage = null;
      let lastError = null;

      for (const modelName of MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: geminiContents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
              })
            }
          );

          const data = await response.json();
          if (!response.ok || data.error) {
            lastError = data.error?.message || `HTTP ${response.status}`;
            continue;
          }
          
          assistantMessage = data.candidates[0].content.parts[0].text;
          break;
        } catch (err: any) {
          lastError = err.message;
          continue;
        }
      }

      if (!assistantMessage) {
        throw new Error(`All models failed. Last error: ${lastError}`);
      }

      res.json({ response: assistantMessage });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
