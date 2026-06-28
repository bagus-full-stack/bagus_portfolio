import { useTranslation } from './useTranslation'

type LocalizedObject = Record<string, unknown>

export const useLocalizedField = () => {
  const { lang: currentLang } = useTranslation()

  const t = (
    obj: LocalizedObject,
    field: string
  ): string => {
    // Chercher d'abord la version dans la langue active
    const localizedValue =
      obj[`${field}_${currentLang}`]

    // Fallback vers l'autre langue si vide
    if (localizedValue &&
        typeof localizedValue === 'string' &&
        localizedValue.trim() !== '') {
      return localizedValue as string
    }

    // Fallback vers FR si EN manquant
    const frValue = obj[`${field}_fr`]
    if (frValue && typeof frValue === 'string' && frValue.trim() !== '') {
      return frValue as string
    }

    // Dernier fallback : champ original sans suffixe
    const originalValue = obj[field]
    if (typeof originalValue === 'string') {
      return originalValue
    }

    return ''
  }

  // Pour les tableaux (challenges, stack)
  const tArray = (
    obj: LocalizedObject,
    field: string
  ): string[] => {
    const localizedValue =
      obj[`${field}_${currentLang}`]

    if (Array.isArray(localizedValue) &&
        localizedValue.length > 0) {
      return localizedValue as string[]
    }

    const frValue = obj[`${field}_fr`]
    if (Array.isArray(frValue) && frValue.length > 0) return frValue

    const originalValue = obj[field]
    if (Array.isArray(originalValue)) {
      return originalValue as string[]
    }

    return []
  }

  return { t, tArray, currentLang }
}

export default useLocalizedField
