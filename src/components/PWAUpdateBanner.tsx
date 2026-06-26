import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

const PWAUpdateBanner = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-sm bg-[var(--bg-card)] border border-[#2DD4BF]/30 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
      <RefreshCw size={14} className="text-[#2DD4BF] shrink-0" />
      <p className="text-[var(--text-primary)] font-[Inter] text-sm">Nouvelle version disponible</p>
      <button onClick={() => updateServiceWorker(true)} className="px-3 py-1.5 bg-[#2DD4BF] text-[#0B0F14] rounded-lg font-[JetBrains_Mono] text-xs font-bold hover:bg-[#25B8A6] transition-colors whitespace-nowrap">Mettre à jour</button>
      <button onClick={() => setNeedRefresh(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="Ignorer">
        <X size={12} />
      </button>
    </div>
  );
};

export default PWAUpdateBanner;
