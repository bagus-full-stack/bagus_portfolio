import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { OpenAI } from "openai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase Edge Function logic ported to Express for AI Studio
  app.post("/api/chat-resume", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set.");
      }

      const openai = new OpenAI({ apiKey });

      // In a real app, you would fetch this from DB, but for now we'll mock the JSON
      const cvJson = JSON.stringify({
        name: "Assami Baga",
        role: "Ingénieur Full Stack & IA",
        bio: "Développeur passionné avec 5 ans d'expérience.",
        experiences: [
          { role: "Lead Dev", company: "AgroSahel AI", year: "2024-2026", description: "Plateforme IA pour l'agriculture en Afrique." }
        ],
        availability: "Disponible pour de nouvelles opportunités"
      });

      const systemPrompt = `Tu es l'assistant professionnel d'Assami Baga,
ingénieur Full Stack & IA. Tu réponds uniquement
sur la base des informations de son parcours
ci-dessous. Si une question dépasse ce cadre,
redirige poliment vers le formulaire de contact.
Ne jamais inventer d'informations.
CV : ${cvJson}`;

      const openAiMessages = [
        { role: 'system', content: systemPrompt },
        ...(history || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: openAiMessages as any,
      });

      res.json({ response: completion.choices[0].message.content });
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
