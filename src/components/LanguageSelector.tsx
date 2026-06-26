import { I18nService } from '../services/i18n.service';
import { useTranslation } from '../hooks/useTranslation';

export function LanguageSelector() {
  const { lang } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => I18nService.setLanguage('fr')}
        className={`font-mono text-[12px] px-2 py-1 rounded transition-colors ${
          lang === 'fr' 
            ? 'bg-accent-ocre text-white' 
            : 'bg-transparent text-text-muted hover:text-[#EDEFF2]'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => I18nService.setLanguage('en')}
        className={`font-mono text-[12px] px-2 py-1 rounded transition-colors ${
          lang === 'en' 
            ? 'bg-accent-ocre text-white' 
            : 'bg-transparent text-text-muted hover:text-[#EDEFF2]'
        }`}
      >
        EN
      </button>
    </div>
  );
}
