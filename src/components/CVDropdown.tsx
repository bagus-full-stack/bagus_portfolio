import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown, Code, Brain, Loader2 } from 'lucide-react'
import useDownloadCV from '../hooks/useDownloadCV'
import { CV_TYPES, CVType } from '../config/cv.config'

const CVDropdown = () => {
  const [open, setOpen] = useState(false)
  const { downloadCV, loading } = useDownloadCV()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDownload = async (type: CVType) => {
    await downloadCV(type)
    setOpen(false)
  }

  // Grouper les CV par profil
  const fullstackCVs = CV_TYPES.filter(cv => cv.profile === 'fullstack')
  const aiCVs = CV_TYPES.filter(cv => cv.profile === 'ai')

  return (
    <div ref={ref} className="relative">
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(!open)}
        disabled={loading !== null}
        className="flex items-center gap-2 px-5 py-2.5 border border-[var(--text-muted)]/40 rounded-lg text-[var(--text-primary)] font-[Inter] text-sm hover:border-[var(--text-muted)] disabled:opacity-50 transition-all duration-200"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {loading ? 'Téléchargement...' : 'Télécharger le CV'}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Panel dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 z-50 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-[var(--shadow-elevated)] animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* GROUPE Full Stack */}
          <div>
            {/* Header groupe */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
              <Code size={12} className="text-[#E08A3E]" />
              <span className="text-[#E08A3E] font-[JetBrains_Mono] text-xs uppercase tracking-wider font-semibold">
                Full Stack Engineer
              </span>
            </div>

            {/* Options FR + EN */}
            {fullstackCVs.map(cv => (
              <button
                key={cv.type}
                onClick={() => handleDownload(cv.type)}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors text-left disabled:opacity-50 group"
              >
                {/* Flag + lang */}
                <div className="w-9 h-9 rounded-xl bg-[#E08A3E]/15 border border-[#E08A3E]/30 flex items-center justify-center shrink-0 group-hover:bg-[#E08A3E]/25 transition-colors text-lg">
                  {loading === cv.type ? (
                    <Loader2 size={14} className="text-[#E08A3E] animate-spin" />
                  ) : (
                    cv.langFlag
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-primary)] font-[Inter] text-sm font-medium">
                    {cv.lang === 'fr' ? 'Version Française' : 'English Version'}
                  </p>
                  <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-xs">
                    {cv.downloadName.replace('.pdf', '')}
                  </p>
                </div>

                <Download size={12} className="text-[var(--text-muted)] shrink-0 group-hover:text-[#E08A3E] transition-colors" />
              </button>
            ))}
          </div>

          {/* Séparateur entre groupes */}
          <div className="h-px bg-[var(--border-subtle)]" />

          {/* GROUPE AI Engineer */}
          <div>
            {/* Header groupe */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
              <Brain size={12} className="text-[#2DD4BF]" />
              <span className="text-[#2DD4BF] font-[JetBrains_Mono] text-xs uppercase tracking-wider font-semibold">
                AI Engineer
              </span>
            </div>

            {/* Options FR + EN */}
            {aiCVs.map(cv => (
              <button
                key={cv.type}
                onClick={() => handleDownload(cv.type)}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors text-left disabled:opacity-50 group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center shrink-0 group-hover:bg-[#2DD4BF]/25 transition-colors text-lg">
                  {loading === cv.type ? (
                    <Loader2 size={14} className="text-[#2DD4BF] animate-spin" />
                  ) : (
                    cv.langFlag
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-primary)] font-[Inter] text-sm font-medium">
                    {cv.lang === 'fr' ? 'Version Française' : 'English Version'}
                  </p>
                  <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-xs">
                    {cv.downloadName.replace('.pdf', '')}
                  </p>
                </div>

                <Download size={12} className="text-[var(--text-muted)] shrink-0 group-hover:text-[#2DD4BF] transition-colors" />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-[10px] text-center">
              PDF · Lien sécurisé · Valable 1h
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CVDropdown
