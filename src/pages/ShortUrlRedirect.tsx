import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase.service'
import { WifiOff, Link2Off } from 'lucide-react'

type State = 'loading' | 'offline' | 'not_found' | 'error'

const ShortUrlRedirect = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    const redirect = async () => {
      if (!slug) { navigate('/'); return }

      // Détecter si hors ligne avant la requête
      if (!navigator.onLine) {
        setState('offline')
        return
      }

      try {
        // Logique spéciale pour les CV
        if (slug === 'cv-fullstack' || slug === 'cv-ai') {
          const filename = slug === 'cv-fullstack' ? 'cv-fullstack.pdf' : 'cv-ai-engineer.pdf';
          const { data: signedData, error: signedError } = await supabase
            .storage
            .from('cv')
            .createSignedUrl(filename, 3600);

          if (!signedError && signedData) {
            // Incrémenter clics si le lien existe en base
            supabase.rpc('increment_short_url_clicks', { p_slug: slug }).catch(() => {});
            window.location.href = signedData.signedUrl;
            return;
          }
        }

        const { data, error } = await supabase
          .from('short_urls')
          .select('target_url, slug')
          .eq('slug', slug)
          .eq('active', true)
          .single()

        if (error || !data) {
          setState('not_found')
          return
        }

        // Incrémenter clics (fire and forget)
        supabase.rpc('increment_short_url_clicks',
          { p_slug: slug })

        // Redirection
        if (data.target_url.startsWith('http')) {
          window.location.href = data.target_url
        } else {
          navigate(data.target_url)
        }

      } catch {
        setState(
          navigator.onLine ? 'error' : 'offline'
        )
      }
    }

    redirect()
  }, [slug])

  // État chargement
  if (state === 'loading') {
    return (
      <div className="min-h-screen
        bg-[#0B0F14] flex flex-col
        items-center justify-center gap-4">
        <div className="w-8 h-8 border-2
          border-[#E08A3E] border-t-transparent
          rounded-full animate-spin" />
        <p className="text-[#8B94A3]
          font-[JetBrains_Mono] text-sm">
          Redirection en cours...
        </p>
      </div>
    )
  }

  // État hors ligne
  if (state === 'offline') {
    return (
      <div className="min-h-screen bg-[#0B0F14]
        flex flex-col items-center
        justify-center gap-6 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl
          bg-[#8B94A3]/20 border border-[#8B94A3]/30
          flex items-center justify-center">
          <WifiOff size={28}
            className="text-[#8B94A3]" />
        </div>
        <div className="space-y-2">
          <p className="text-[#EDEFF2]
            font-[Space_Grotesk] text-xl
            font-semibold">
            Vous êtes hors ligne
          </p>
          <p className="text-[#8B94A3]
            font-[Inter] text-sm max-w-[260px]">
            Ce lien court nécessite une connexion
            internet pour fonctionner.
          </p>
        </div>
        <div className="flex flex-col
          sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5
              bg-[#E08A3E] text-white
              rounded-lg font-[Inter] text-sm
              hover:opacity-90 transition-opacity"
          >
            Réessayer
          </button>
          <a href="/"
            className="px-5 py-2.5
              border border-[#8B94A3]/30
              text-[#8B94A3] rounded-lg
              font-[Inter] text-sm
              hover:text-[#EDEFF2]
              hover:border-[#8B94A3]
              transition-colors text-center">
            Retour à l'accueil
          </a>
        </div>
        <p className="font-[JetBrains_Mono]
          text-[#2DD4BF] text-xs opacity-70">
          assami.dev/s/{slug}
        </p>
      </div>
    )
  }

  // État lien introuvable ou erreur
  return (
    <div className="min-h-screen bg-[#0B0F14]
      flex flex-col items-center
      justify-center gap-6 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl
        bg-[#E08A3E]/20 border border-[#E08A3E]/30
        flex items-center justify-center">
        <Link2Off size={28}
          className="text-[#E08A3E]" />
      </div>
      <div className="space-y-2">
        <p className="text-[#EDEFF2]
          font-[Space_Grotesk] text-xl
          font-semibold">
          Lien introuvable
        </p>
        <p className="text-[#8B94A3]
          font-[Inter] text-sm max-w-[260px]">
          Ce lien court n'existe pas
          ou a été désactivé.
        </p>
        <p className="text-[#8B94A3]/60
          font-[JetBrains_Mono] text-xs">
          assami.dev/s/{slug}
        </p>
      </div>
      <a href="/"
        className="px-6 py-3 bg-[#E08A3E]
          text-white rounded-lg font-[Inter]
          text-sm hover:opacity-90
          transition-opacity">
        Retour à l'accueil
      </a>
    </div>
  )
}

export default ShortUrlRedirect
