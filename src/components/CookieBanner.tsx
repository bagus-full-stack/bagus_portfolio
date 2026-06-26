import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

export function CookieBanner() {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(
    () => localStorage.getItem('analytics-consent') === 'true'
  );

  if (accepted) return null;

  return (
    <div className="no-print cookie-banner fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)] border-t border-[var(--border-subtle)]/20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <p className="text-[var(--text-muted)] text-sm font-[Inter]">
        {t('cookies.desc')}
      </p>
      <button
        onClick={() => {
          localStorage.setItem('analytics-consent', 'true');
          setAccepted(true);
        }}
        className="shrink-0 px-4 py-2 bg-[#E08A3E] text-white text-sm rounded-lg hover:bg-[#C97A35] transition-colors w-full sm:w-auto"
      >
        {t('cookies.accept')}
      </button>
    </div>
  );
}
