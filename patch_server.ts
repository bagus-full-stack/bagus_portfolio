import fs from 'fs'

const file = 'server.ts'
let data = fs.readFileSync(file, 'utf8')

const newRoute = `  app.get("/api/news", async (req, res) => {
    try {
      const response = await fetch('https://dev.to/api/articles?tag=tech&top=7');
      if (!response.ok) {
        throw new Error('Failed to fetch from dev.to');
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

`

data = data.replace('  app.post("/api/chat-resume",', newRoute + '  app.post("/api/chat-resume",')

fs.writeFileSync(file, data)
