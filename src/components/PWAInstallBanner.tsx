import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useProfile } from '../hooks/useProfile';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallBanner = () => {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      if (!sessionStorage.getItem('pwa-banner-dismissed')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40 bg-[var(--bg-card)] border border-[var(--border-subtle)]/20 rounded-xl p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        {profile?.photo_url ? (
          <img src={profile.photo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[var(--border-subtle)]" />
        ) : (
          <div className="w-12 h-12 rounded-xl shrink-0 bg-[#E08A3E]/20 flex items-center justify-center border border-[#E08A3E]/30">
            <span className="text-[#E08A3E] font-[JetBrains_Mono] font-bold text-sm">AB</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[var(--text-primary)] font-[Inter] text-sm font-medium">{t('pwa.install_title')}</p>
          <p className="text-[var(--text-muted)] font-[Inter] text-xs mt-0.5">{t('pwa.install_desc')}</p>
        </div>
        <button onClick={handleDismiss} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0" aria-label="Fermer">
          <X size={14} />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={handleDismiss} className="flex-1 px-3 py-2 border border-[var(--border-subtle)]/30 rounded-lg text-[var(--text-muted)] font-[Inter] text-sm hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors">{t('pwa.install_later')}</button>
        <button onClick={handleInstall} className="flex-1 px-3 py-2 bg-[#E08A3E] rounded-lg text-white font-[Inter] text-sm hover:bg-[#C97A35] transition-colors flex items-center justify-center gap-2">
          <Download size={14} />
          {t('pwa.install_btn')}
        </button>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
