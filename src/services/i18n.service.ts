import frTranslations from '../i18n/fr.json';
import enTranslations from '../i18n/en.json';

type Lang = 'fr' | 'en';

const translations = {
  fr: frTranslations,
  en: enTranslations
};

class I18nServiceClass {
  private currentLang: Lang = 'fr';
  private listeners: Set<(lang: Lang) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('portfolio-lang') as Lang;
      if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
        this.currentLang = savedLang;
      }
    }
  }

  setLanguage(lang: Lang): void {
    this.currentLang = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio-lang', lang);
    }
    this.listeners.forEach(l => l(lang));
  }

  getCurrentLang(): Lang {
    return this.currentLang;
  }

  subscribe(callback: (lang: Lang) => void) {
    this.listeners.add(callback);
    callback(this.currentLang);
    return () => this.listeners.delete(callback);
  }

  translate(key: string): string {
    const dict = translations[this.currentLang] as Record<string, string>;
    return dict[key] || key;
  }
}

export const I18nService = new I18nServiceClass();
