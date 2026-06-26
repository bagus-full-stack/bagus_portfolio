import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallBanner = () => {
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
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40 bg-[#141B22] border border-[#8B94A3]/20 rounded-xl p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <img src="/icons/pwa-192x192.png" alt="Logo" className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[#EDEFF2] font-[Inter] text-sm font-medium">Installer le portfolio</p>
          <p className="text-[#8B94A3] font-[Inter] text-xs mt-0.5">Accès rapide depuis votre écran d'accueil, fonctionne hors connexion.</p>
        </div>
        <button onClick={handleDismiss} className="text-[#8B94A3] hover:text-[#EDEFF2] transition-colors shrink-0" aria-label="Fermer">
          <X size={14} />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={handleDismiss} className="flex-1 px-3 py-2 border border-[#8B94A3]/30 rounded-lg text-[#8B94A3] font-[Inter] text-sm hover:text-[#EDEFF2] hover:border-[#8B94A3] transition-colors">Plus tard</button>
        <button onClick={handleInstall} className="flex-1 px-3 py-2 bg-[#E08A3E] rounded-lg text-white font-[Inter] text-sm hover:bg-[#C97A35] transition-colors flex items-center justify-center gap-2">
          <Download size={14} />
          Installer
        </button>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
