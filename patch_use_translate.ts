import fs from 'fs'

const file = 'src/hooks/useTranslate.ts'
let data = fs.readFileSync(file, 'utf8')

const oldCode = `      const { data, error } =
        await supabase.functions.invoke(
          'translate',
          {
            body: { text, from, to }
          }
        )
      if (error) throw error
      if (!data?.translated) {
        throw new Error('Réponse vide')
      }`
      
const newCode = `      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from, to })
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (!data?.translated) {
        throw new Error('Réponse vide')
      }`

data = data.replace(oldCode, newCode)

fs.writeFileSync(file, data)
