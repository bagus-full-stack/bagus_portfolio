import React, { useState } from 'react';
import { Copy, Linkedin, Check } from 'lucide-react';
import CVDropdown from './CVDropdown';

export function ShareButtons() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkedIn = () => {
    const encodedUrl = encodeURIComponent(window.location.href);
    window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mt-16 pt-10 border-t border-white/5">
      <button
        onClick={handleCopyLink}
        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 text-text-primary transition-colors"
      >
        {copied ? (
          <>
            <Check size={16} className="mr-2 text-accent-cyan" />
            Lien copié !
          </>
        ) : (
          <>
            <Copy size={16} className="mr-2 text-text-muted" />
            Copier le lien
          </>
        )}
      </button>

      <button
        onClick={handleShareLinkedIn}
        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 text-text-primary transition-colors"
      >
        <Linkedin size={16} className="mr-2 text-[#0A66C2]" />
        Partager sur LinkedIn
      </button>

      <CVDropdown dropUp />
    </div>
  );
}
