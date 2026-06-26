import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../services/supabase.service';
import { useTranslation } from '../hooks/useTranslation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function HeroSection() {
  const [views, setViews] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    const fetchAndIncrement = async () => {
      if (!supabase) {
        if (mounted) setViews(1348);
        return;
      }
      try {
        await supabase.rpc('increment_visitors');
        const { data } = await supabase.rpc('get_visitor_count');
        if (mounted) {
          setViews(data);
        }
      } catch (err) {
        console.error('Failed to increment view count', err);
        if (mounted) setViews(1348);
      }
    };
    fetchAndIncrement();
    return () => { mounted = false; };
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
      console.error(err);
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
    <section className="relative min-h-screen flex items-center justify-center bg-bg-primary overflow-hidden pt-20">
      
      {/* Background SVG Node Graph */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
        <svg width="100%" height="100%" className="absolute inset-0">
          {graph.edges.map((e, i) => (
            <line 
              key={`e-${i}`} 
              x1={`${e.x1}%`} 
              y1={`${e.y1}%`} 
              x2={`${e.x2}%`} 
              y2={`${e.y2}%`} 
              stroke="#9BA4B5" 
              strokeWidth="1" 
              strokeOpacity="0.10" 
            />
          ))}
          {graph.nodes.map((n, i) => (
            <circle 
              key={`n-${i}`} 
              cx={`${n.x}%`} 
              cy={`${n.y}%`} 
              r="2.5" 
              fill="#2DD4BF" 
              fillOpacity="0.15" 
            />
          ))}
        </svg>
      </div>

      {/* Center Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 flex flex-col items-center text-center">
        
        {/* Availability Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-accent-ocre mb-8">
          <span className="font-mono text-xs font-semibold text-accent-ocre tracking-widest uppercase">
            {t('hero.badge')}
          </span>
        </div>

        {/* Name */}
        <h1 className="font-space text-5xl md:text-[64px] leading-tight font-bold text-text-primary mb-4 tracking-tight">
          Assami Baga
        </h1>

        {/* Title */}
        <h2 className="font-inter text-xl md:text-[24px] text-text-muted mb-6 font-medium">
          Full Stack & AI Engineer
        </h2>

        {/* Bio (Max 2 lines) */}
        <p className="font-inter text-base text-text-muted max-w-2xl mb-12 leading-relaxed line-clamp-2">
          Je conçois des architectures résilientes et des systèmes intelligents, fusionnant la précision algorithmique avec une UX irréprochable. Expert en écosystèmes Cloud et déploiements LLM.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <button 
            onClick={() => {
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-sm bg-accent-ocre text-bg-primary font-space font-semibold transition-opacity hover:opacity-90"
          >
            {t('hero.cta.projects')}
          </button>
          <button 
            onClick={getCvUrl}
            disabled={isDownloading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-sm border border-text-primary text-text-primary font-space font-medium transition-colors hover:bg-white/5 flex items-center justify-center [.presentation-mode_&]:hidden"
          >
            {isDownloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            {t('hero.cta.download')}
          </button>
        </div>

        {/* Visitor Counter */}
        <div className="flex items-center gap-3 text-text-muted">
          <div className="font-mono text-lg font-medium text-accent-cyan text-right min-h-[28px] flex items-center justify-end">
            {views === null ? (
              <span className="inline-block w-[48px] h-[28px] bg-[#141B22] animate-pulse rounded-sm"></span>
            ) : (
              views.toLocaleString('fr-FR')
            )}
          </div>
          <span className="font-inter text-xs tracking-wide lowercase">
            visiteurs uniques
          </span>
        </div>

      </div>
    </section>
  );
}
