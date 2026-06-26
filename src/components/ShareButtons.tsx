import React, { useState } from 'react';
import { Copy, Linkedin, Download, Check, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase.service';
import { toast } from 'sonner';

export function ShareButtons() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkedIn = () => {
    const encodedUrl = encodeURIComponent(window.location.href);
    window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadCV = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('cv_url')
        .single();

      if (!profile?.cv_url) {
        toast.error('CV non disponible pour le moment');
        return;
      }

      const filePath = profile.cv_url.split('/').pop() || 'cv.pdf';

      const { data: signed } = await supabase
        .storage
        .from('cv')
        .createSignedUrl(filePath, 3600);

      if (signed?.signedUrl) {
        const a = document.createElement('a');
        a.href = signed.signedUrl;
        a.download = 'CV-Assami-Baga.pdf';
        a.click();
      } else {
        toast.error('Erreur lors de la génération du lien');
      }
    } catch (err) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setLoading(false);
    }
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
