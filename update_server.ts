import fs from 'fs'

const file = 'server.ts'
let data = fs.readFileSync(file, 'utf8')

const supabaseImport = "import { createClient } from '@supabase/supabase-js';\n"
if (!data.includes('@supabase/supabase-js')) {
    data = supabaseImport + data;
}

const mockReplace = `      // In a real app, you would fetch this from DB, but for local mock we'll use a mocked JSON
      const cvJson = JSON.stringify({
        name: "Assami Baga",
        role: "Ingénieur Full Stack & IA",
        bio: "Développeur passionné avec 5 ans d'expérience.",
        experiences: [
          { role: "Lead Dev", company: "AgroSahel AI", year: "2024-2026", description: "Plateforme IA pour l'agriculture en Afrique." }
        ],
        availability: "Disponible pour de nouvelles opportunités"
      });`

const newLogic = `      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
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
          period: \`\${exp.start_date} - \${exp.end_date || 'Présent'}\`,
          description: exp.description || exp.description_fr || exp.description_en
        })),
        projects: (projects || []).map(p => ({
          title: p.title || p.title_fr,
          description: p.description || p.description_fr,
          technologies: p.technologies || p.tech_stack
        })),
        skills: (skills || []).map(s => s.name),
        availability: "Disponible pour de nouvelles opportunités"
      });`

data = data.replace(mockReplace, newLogic)

fs.writeFileSync(file, data)
