import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase.service';

const ShortUrlRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const redirect = async () => {
      if (!slug) {
        navigate('/');
        return;
      }

      try {
        // Récupérer l'URL cible
        const { data, error } = await supabase
          .from('short_urls')
          .select('target_url, slug')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (error || !data) {
          setError(true);
          return;
        }

        // Incrémenter le compteur de clics
        // (sans attendre — fire and forget)
        supabase.rpc('increment_short_url_clicks', {
          p_slug: slug
        });

        // Redirection
        const target = data.target_url;

        if (target.startsWith('http')) {
          // URL externe → redirection navigateur
          window.location.href = target;
        } else {
          // URL interne → navigation React Router
          navigate(target);
        }

      } catch {
        setError(true);
      }
    };

    redirect();
  }, [slug, navigate]);

  // Écran de chargement pendant la redirection
  if (!error) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-accent-ocre border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted font-space text-sm">
          Redirection en cours...
        </p>
      </div>
    );
  }

  // Lien introuvable ou inactif
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-6 px-4">
      <p className="text-text-primary font-space text-2xl font-bold">
        Lien introuvable
      </p>
      <p className="text-text-muted font-inter text-sm text-center">
        Ce lien court n'existe pas ou a été désactivé.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-accent-ocre text-white rounded-lg font-inter text-sm hover:opacity-90 transition-opacity"
      >
        Retour à l'accueil
      </a>
    </div>
  );
};

export default ShortUrlRedirect;
