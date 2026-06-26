import { useState } from 'react';

export function CookieBanner() {
  const [accepted, setAccepted] = useState(
    () => localStorage.getItem('analytics-consent') === 'true'
  );

  if (accepted) return null;

  return (
    <div className="no-print cookie-banner fixed bottom-0 left-0 right-0 z-50 bg-[#141B22] border-t border-[#9BA4B5]/20 px-6 py-4 flex items-center justify-between gap-4">
      <p className="text-[#9BA4B5] text-sm font-[Inter]">
        Ce site compte les visites pour mesurer son audience.
        Aucun cookie tiers, aucun tracking publicitaire.
      </p>
      <button
        onClick={() => {
          localStorage.setItem('analytics-consent', 'true');
          setAccepted(true);
        }}
        className="shrink-0 px-4 py-2 bg-[#E08A3E] text-white text-sm rounded-lg hover:bg-[#C97A35] transition-colors"
      >
        Compris
      </button>
    </div>
  );
}
