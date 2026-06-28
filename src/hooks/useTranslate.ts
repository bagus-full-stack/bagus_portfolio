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
  const translateBatch = async (
    fields: { text: string; key: string }[],
    from: 'fr' | 'en',
    to: 'fr' | 'en'
  ): Promise<Record<string, string>> => {
    setTranslating(true)
    try {
      const results = await Promise.all(
        fields
          .filter(f => f.text.trim() !== '')
          .map(async f => ({
            key: f.key,
            translated: await translate(
              f.text, from, to
            )
          }))
      )

      return results.reduce((acc, r) => {
        if (r.translated) {
          acc[r.key] = r.translated
        }
        return acc
      }, {} as Record<string, string>)

    } finally {
      setTranslating(false)
    }
  }

  return { translate, translateBatch, translating }
}

export default useTranslate;
