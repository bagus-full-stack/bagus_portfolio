import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase Edge Function logic ported to Express for AI Studio
  app.post("/api/chat-resume", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
      }

      // In a real app, you would fetch this from DB, but for local mock we'll use a mocked JSON
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
