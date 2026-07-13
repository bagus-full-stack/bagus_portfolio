import React, { useMemo, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase.service';
import { useTranslation } from '../hooks/useTranslation';
import { toast } from 'sonner';
import { Loader2, Download, ChevronDown, Code, Brain } from 'lucide-react';
import useTheme from '../hooks/useTheme';

import Skeleton from './ui/Skeleton';

const CVDropdown = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer si clic en dehors
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const downloadCV = async (type: 'fullstack' | 'ai') => {
    setLoading(type);
    try {
      const filename = type === 'fullstack'
        ? 'cv-fullstack.pdf'
        : 'cv-ai-engineer.pdf';

      const { data, error } = await supabase
        .storage
        .from('cv')
        .createSignedUrl(filename, 3600);

      if (error) throw error;

      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = type === 'fullstack'
        ? 'CV-Assami-Baga-FullStack.pdf'
        : 'CV-Assami-Baga-AI-Engineer.pdf';
      a.click();

    } catch {
      toast.error('Téléchargement impossible');
    } finally {
      setLoading(null);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative w-full sm:w-auto [.presentation-mode_&]:hidden">
      {/* Bouton principal */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full sm:w-auto px-8 py-3.5 rounded-sm border border-[var(--border-subtle)] text-[var(--text-primary)] font-space font-medium transition-colors hover:bg-[var(--text-primary)]/5 flex items-center justify-center bg-[var(--bg-primary)] gap-2"
      >
        <Download size={16} />
        Télécharger le CV
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 sm:left-0 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-elevated)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Option Full Stack */}
          <button
            onClick={() => downloadCV('fullstack')}
            disabled={loading === 'fullstack'}
            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-left disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E08A3E]/20 flex items-center justify-center shrink-0">
              {loading === 'fullstack' ? (
                <Loader2 size={14} className="text-[#E08A3E] animate-spin" />
              ) : (
                <Code size={14} className="text-[#E08A3E]" />
              )}
            </div>
            <div>
              <p className="font-[Inter] text-sm font-medium">CV Full Stack</p>
              <p className="font-[JetBrains_Mono] text-xs text-[var(--text-muted)]">Angular · React · NestJS</p>
            </div>
          </button>

          {/* Séparateur */}
          <div className="h-px bg-[var(--border-subtle)]" />

          {/* Option AI Engineer */}
          <button
            onClick={() => downloadCV('ai')}
            disabled={loading === 'ai'}
            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-left disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/20 flex items-center justify-center shrink-0">
              {loading === 'ai' ? (
                <Loader2 size={14} className="text-[#2DD4BF] animate-spin" />
              ) : (
                <Brain size={14} className="text-[#2DD4BF]" />
              )}
            </div>
            <div>
              <p className="font-[Inter] text-sm font-medium">CV AI Engineer</p>
              <p className="font-[JetBrains_Mono] text-xs text-[var(--text-muted)]">PyTorch · YOLO · HuggingFace</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export function HeroSection() {
  const [views, setViews] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { t } = useTranslation();
  const { isDark } = useTheme();

  useEffect(() => {
    const trackAndCount = async () => {
      try {
        // Tentative 1 : Edge Function complète
        const { data, error } =
          await supabase.functions.invoke(
            'track-visitor',
            {
              body: {
                page: window.location.pathname
              }
            }
          )

        if (!error && data?.total) {
          setViews(data.total)
          return
        }

        throw new Error('Function failed')

      } catch {
        // Tentative 2 : Fallback direct Supabase
        // sans Edge Function
        try {
          const alreadyCounted =
            sessionStorage.getItem('visitor_counted')

          if (!alreadyCounted) {
            await supabase.rpc('increment_visitors', {
              p_fingerprint: crypto.randomUUID()
                .slice(0, 32),
              p_page: window.location.pathname,
              p_country: '',
              p_city: ''
            })
            sessionStorage.setItem(
              'visitor_counted', 'true'
            )
          }

          const { data: countData } =
            await supabase.rpc('get_visitor_count')
          setViews(countData || 0)

        } catch {
          // Fallback silencieux — afficher 0
          setViews(0)
        }
      }
    }

    trackAndCount()
  }, []);

  const getCvUrl = async () => {
    if (!supabase) {
      toast.error('Supabase non configuré.');
      return;
    }
    setIsDownloading(true);
    try {
      const { data, error } = await supabase
        .storage
        .from('cv') // nom du bucket
        .createSignedUrl('cv.pdf', 3600); // valide 1h
        
      if (error) throw error;
      if (data) window.open(data.signedUrl, '_blank');
    } catch (err) {
      toast.error('Erreur lors du téléchargement du CV.');
      // console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Programmatic SVG generation for the background node graph
  const graph = useMemo(() => {
    // Generate 50 random nodes
    const nodes = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));

    // Connect nodes that are close to each other
    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Threshold for connecting nodes (approx 15% of view area)
        if (distance < 15) {
          edges.push({
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
          });
        }
      }
    }
    return { nodes, edges };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[var(--bg-primary)] overflow-hidden pt-20">
      
      {/* Background SVG Node Graph */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ${isDark ? 'opacity-15' : 'opacity-[0.08]'}`}>
        <svg width="100%" height="100%" className="absolute inset-0">
          {graph.edges.map((e, i) => (
            <line 
              key={`e-${i}`} 
              x1={`${e.x1}%`} 
              y1={`${e.y1}%`} 
              x2={`${e.x2}%`} 
              y2={`${e.y2}%`} 
              stroke="var(--text-muted)" 
              strokeWidth="1" 
              strokeOpacity="0.5" 
            />
          ))}
          {graph.nodes.map((n, i) => (
            <circle 
              key={`n-${i}`} 
              cx={`${n.x}%`} 
              cy={`${n.y}%`} 
              r="2.5" 
              fill="var(--accent-cyan)" 
              fillOpacity="0.5" 
            />
          ))}
        </svg>
      </div>

      {/* Center Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 flex flex-col items-center text-center">
        
        {/* Availability Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-accent-ocre mb-8 bg-[var(--bg-primary)]">
          <span className="font-mono text-xs font-semibold text-accent-ocre tracking-widest uppercase">
            {t('hero.badge')}
          </span>
        </div>

        {/* Name */}
        <h1 className="font-space text-5xl md:text-[64px] leading-tight font-bold text-[var(--text-primary)] mb-4 tracking-tight">
          Assami Baga
        </h1>

        {/* Title */}
        <h2 className="font-inter text-xl md:text-[24px] text-[var(--text-muted)] mb-6 font-medium">
          {t('hero.subtitle')}
        </h2>

        {/* Bio (Max 2 lines) */}
        <p className="font-inter text-base text-[var(--text-muted)] max-w-2xl mb-12 leading-relaxed line-clamp-2">
          Je conçois des architectures résilientes et des systèmes intelligents, fusionnant la précision algorithmique avec une UX irréprochable. Expert en écosystèmes Cloud et déploiements LLM.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <button 
            onClick={() => {
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-sm bg-accent-ocre text-[var(--bg-primary)] font-space font-semibold transition-opacity hover:opacity-90"
          >
            {t('hero.cta.projects')}
          </button>
          <CVDropdown />
        </div>

        {/* Visitor Counter */}
        {views === null ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-[JetBrains_Mono] text-2xl text-[var(--accent-cyan)]">
              {views.toLocaleString('fr-FR')}
            </span>
            <span className="font-[Inter] text-sm text-[var(--text-muted)]">
              {t('hero.stats.visitors')}
            </span>
          </div>
        )}

      </div>
    </section>
  );
}
