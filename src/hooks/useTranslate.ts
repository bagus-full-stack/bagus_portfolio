import { useState } from 'react';
import { supabase } from '../services/supabase.service';
import { toast } from 'sonner';

const useTranslate = () => {
  const [translating, setTranslating] = useState(false)

  const translate = async (
    text: string,
    from: 'fr' | 'en',
    to: 'fr' | 'en'
  ): Promise<string | null> => {
    if (!text.trim()) return null
    if (from === to) return text

    setTranslating(true)
    try {
      const { data, error } =
        await supabase.functions.invoke(
          'translate',
          {
            body: { text, from, to }
          }
        )

      if (error) throw error

      if (!data?.translated) {
        throw new Error('Réponse vide')
      }

      return data.translated as string

    } catch (err) {
      console.error('Translation failed:', err)
      toast.error(
        'Traduction impossible — vérifiez la connexion'
      )
      return null
    } finally {
      setTranslating(false)
    }
  }

  // Traduire plusieurs champs en parallèle
  // Un seul appel pour tous les champs ; repli champ par champ si la fonction Edge ne gère pas encore le mode lot
  const translateBatch = async (
    fields: { text: string; key: string }[],
    from: 'fr' | 'en',
    to: 'fr' | 'en'
  ): Promise<Record<string, string>> => {
    const todo = fields.filter(f => f.text.trim() !== '')
    if (todo.length === 0 || from === to) return {}

    setTranslating(true)
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { texts: todo.map(f => f.text), from, to }
      })
      if (!error && Array.isArray(data?.translations) && data.translations.length === todo.length) {
        return todo.reduce((acc, f, i) => {
          if (data.translations[i]) acc[f.key] = data.translations[i]
          return acc
        }, {} as Record<string, string>)
      }

      const results = await Promise.all(
        todo.map(async f => ({ key: f.key, translated: await translate(f.text, from, to) }))
      )
      return results.reduce((acc, r) => {
        if (r.translated) acc[r.key] = r.translated
        return acc
      }, {} as Record<string, string>)
    } finally {
      setTranslating(false)
    }
  }

  return { translate, translateBatch, translating }
}

export default useTranslate;
