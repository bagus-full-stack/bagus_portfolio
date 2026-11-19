import { useLocation, useNavigate } from 'react-router-dom';
import { I18nService } from '../services/i18n.service';
import { useTranslation } from '../hooks/useTranslation';

export function LanguageSelector() {
  const { lang } = useTranslation();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  // Language and URL stay in sync: /en/... is the English version of /...
  const switchTo = (l: 'fr' | 'en') => {
    I18nService.setLanguage(l);
    const base = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
    const target = l === 'en' ? '/en' + (base === '/' ? '' : base) : base;
    if (!pathname.startsWith('/admin') && target !== pathname) navigate(target + search + hash);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => switchTo('fr')}
        className={`font-mono text-[12px] px-2 py-1 rounded transition-colors ${
          lang === 'fr' 
            ? 'bg-accent-ocre text-white' 
            : 'bg-transparent text-text-muted hover:text-[var(--text-primary)]'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => switchTo('en')}
        className={`font-mono text-[12px] px-2 py-1 rounded transition-colors ${
          lang === 'en' 
            ? 'bg-accent-ocre text-white' 
            : 'bg-transparent text-text-muted hover:text-[var(--text-primary)]'
        }`}
      >
        EN
      </button>
    </div>
  );
}
