import React, { useState } from 'react';
import { Copy, Linkedin, Download, Check, Loader2 } from 'lucide-react';
import useDownloadCV from '../hooks/useDownloadCV';
import { useTranslation } from '../hooks/useTranslation';

export function ShareButtons() {
  const [copied, setCopied] = useState(false);
  const { lang } = useTranslation();
  const { downloadCV, loading: cvLoading } = useDownloadCV();
  const loading = cvLoading !== null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkedIn = () => {
    const encodedUrl = encodeURIComponent(window.location.href);
    window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadCV = () => downloadCV(lang === 'en' ? 'fullstack_en' : 'fullstack_fr');

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

      <button
        onClick={handleDownloadCV}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 border border-[var(--border-subtle)]/30 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        <span className="font-space text-sm">
          CV PDF
        </span>
      </button>
    </div>
  );
}
