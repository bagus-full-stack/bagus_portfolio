import React, { useMemo, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase.service';
import { useTranslation } from '../hooks/useTranslation';
import { toast } from 'sonner';
import { Loader2, Download, ChevronDown, Code, Brain } from 'lucide-react';
import useTheme from '../hooks/useTheme';

import CVDropdown from './CVDropdown';
import Skeleton from './ui/Skeleton';

export function HeroSection() {
  const [views, setViews] = useState<number | null>(null);
  const { t } = useTranslation();
  const { isDark } = useTheme();

  useEffect(() => {
    const trackAndCount = async () => {
      try {
        let fingerprint = localStorage.getItem('visitor_fingerprint');
        if (!fingerprint) {
          fingerprint = crypto.randomUUID().slice(0, 32);
          localStorage.setItem('visitor_fingerprint', fingerprint);
        }

        // Appel direct à increment_visitors qui gère l'unicité
        const { data, error } = await supabase.rpc('increment_visitors', {
          p_fingerprint: fingerprint,
          p_page: window.location.pathname,
          p_country: '',
          p_city: ''
        });

        if (!error && data?.total) {
          setViews(data.total);
        } else {
          setViews(0);
        }
      } catch (err) {
        setViews(0);
      }
    };
    trackAndCount();
  }, []);

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
