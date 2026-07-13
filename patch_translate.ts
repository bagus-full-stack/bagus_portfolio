import fs from 'fs'

const file = 'server.ts'
let data = fs.readFileSync(file, 'utf8')

const newRoute = `  app.post("/api/translate", async (req, res) => {
    try {
      const { text, from, to } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
      }
      
      const prompt = \`You are a professional translator specializing in technical and professional content.
Translate the following text from \${from} to \${to}.
STRICT RULES :
- Return ONLY the translated text
- No explanations, no quotes, no preamble
- Preserve ALL technical terms exactly as-is (React, TypeScript, FastAPI, Docker, etc.)
- Preserve proper nouns and brand names
- Preserve the exact same formatting (line breaks, punctuation, capitalization)
- Preserve the same professional tone
- If a term has no good translation, keep the original term

TEXT TO TRANSLATE :
\${text}\`;

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
            \`https://generativelanguage.googleapis.com/v1beta/models/\${modelName}:generateContent?key=\${apiKey}\`,
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
            lastError = aiData.error?.message || \`HTTP \${response.status}\`;
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
        throw new Error(\`All models failed. Last error: \${lastError}\`);
      }
      
      res.json({ translated });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

`

data = data.replace('  app.post("/api/chat-resume",', newRoute + '  app.post("/api/chat-resume",')

fs.writeFileSync(file, data)
