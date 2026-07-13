export type CVType =
  | 'fullstack_fr'
  | 'fullstack_en'
  | 'ai_fr'
  | 'ai_en'

export interface CVConfig {
  type: CVType
  filename: string
  downloadName: string
  label: string
  sublabel: string
  lang: 'fr' | 'en'
  profile: 'fullstack' | 'ai'
  langFlag: string
  accentColor: string
  dbField: string
  dbDateField: string
}

export const CV_CONFIG: Record<CVType, CVConfig> = {
  fullstack_fr: {
    type: 'fullstack_fr',
    filename: 'cv-fullstack-fr.pdf',
    downloadName: 'CV-Assami-Baga-FullStack-FR.pdf',
    label: 'CV Full Stack',
    sublabel: 'Angular · React · NestJS',
    lang: 'fr',
    profile: 'fullstack',
    langFlag: '🇫🇷',
    accentColor: '#E08A3E',
    dbField: 'cv_fullstack_fr',
    dbDateField: 'cv_fullstack_fr_updated_at'
  },
  fullstack_en: {
    type: 'fullstack_en',
    filename: 'cv-fullstack-en.pdf',
    downloadName: 'CV-Assami-Baga-FullStack-EN.pdf',
    label: 'CV Full Stack',
    sublabel: 'Angular · React · NestJS',
    lang: 'en',
    profile: 'fullstack',
    langFlag: '🇬🇧',
    accentColor: '#E08A3E',
    dbField: 'cv_fullstack_en',
    dbDateField: 'cv_fullstack_en_updated_at'
  },
  ai_fr: {
    type: 'ai_fr',
    filename: 'cv-ai-fr.pdf',
    downloadName: 'CV-Assami-Baga-AI-Engineer-FR.pdf',
    label: 'CV AI Engineer',
    sublabel: 'PyTorch · YOLO · HuggingFace',
    lang: 'fr',
    profile: 'ai',
    langFlag: '🇫🇷',
    accentColor: '#2DD4BF',
    dbField: 'cv_ai_fr',
    dbDateField: 'cv_ai_fr_updated_at'
  },
  ai_en: {
    type: 'ai_en',
    filename: 'cv-ai-en.pdf',
    downloadName: 'CV-Assami-Baga-AI-Engineer-EN.pdf',
    label: 'CV AI Engineer',
    sublabel: 'PyTorch · YOLO · HuggingFace',
    lang: 'en',
    profile: 'ai',
    langFlag: '🇬🇧',
    accentColor: '#2DD4BF',
    dbField: 'cv_ai_en',
    dbDateField: 'cv_ai_en_updated_at'
  }
}

export const CV_TYPES = Object.values(CV_CONFIG)
