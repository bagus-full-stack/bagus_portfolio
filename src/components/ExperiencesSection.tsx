import React, { useState, useEffect } from 'react';
import { Experience } from '../types';
import { SupabaseService } from '../services/supabase.service';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { useSectionTracker } from '../hooks/useSectionTracker';
import { useLocalizedField } from '../hooks/useLocalizedField';

const ExperienceItem: React.FC<{ exp: Experience, isEven: boolean }> = ({ exp, isEven }) => {
  const { t: translate } = useTranslation();
  const { t } = useLocalizedField();
  const [isExpanded, setIsExpanded] = useState(false);
  const isPro = exp.type === 'pro';
  const desc = t(exp, 'description');
  const showToggle = desc && desc.length > 120; // heuristic for > 3 lines

  return (
    <div className={`relative flex flex-col md:flex-row ${isEven ? '' : 'md:flex-row-reverse'} items-start`}>
      {/* Spacer for desktop layout */}
      <div className="hidden md:block w-1/2"></div>
      
      {/* Node Dot */}
      <div 
        className={`absolute left-[29px] md:left-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 mt-1.5 z-10 
        ${isPro ? 'bg-accent-ocre shadow-[0_0_10px_rgba(224,138,62,0.5)]' : 'bg-accent-cyan shadow-[0_0_10px_rgba(45,212,191,0.5)]'}`}
      ></div>
      
      {/* Content Card */}
      <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
        <div className={`font-mono text-sm text-text-muted mb-2 flex justify-start ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
           {exp.start_date} — {exp.end_date || translate('experiences.present')}
        </div>
        
        <h3 className="font-space text-xl font-semibold text-text-primary mb-1">
          {t(exp, 'title')}
        </h3>
        
        <div className="font-inter text-base text-text-muted mb-4 font-medium">
          {t(exp, 'organization')} {exp.location && `• ${exp.location}`}
        </div>
        
        <p className={`font-inter text-sm text-text-muted leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {desc}
        </p>

        {showToggle && (
          <div className={`flex justify-start ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-accent-cyan font-inter text-[14px] bg-transparent mt-2 hover:underline"
            >
              {isExpanded ? translate('experiences.see_less') : translate('experiences.see_more')}
            </button>
          </div>
        )}
        
        {isPro && exp.stack && (
          <div className={`mt-5 flex flex-wrap gap-2 justify-start ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
            {exp.stack.map(tech => (
              <span 
                key={tech} 
                className="px-2.5 py-1 text-xs font-mono text-text-muted bg-bg-card border border-accent-cyan/30 rounded-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExperiencesSection() {
  const { t } = useTranslation();
  const sectionRef = useSectionTracker('ExperiencesSection');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    let mounted = true;
    
    async function loadExperiences() {
      try {
        const data = await SupabaseService.getExperiences();
        if (mounted) {
          setExperiences(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          setLoading(false);
          toast.error(t('experiences.error'));
        }
      }
    }
    
    loadExperiences();
    return () => { mounted = false; };
  }, [t]);

  if (error) {
    return (
      <section id="experiences" ref={sectionRef as any} className="py-24 bg-bg-primary">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-sm text-sm font-inter">
            {t('experiences.error')}
          </div>
        </div>
      </section>
    );
  }

  if (!loading && experiences.length === 0) {
    return null;
  }

  return (
    <section id="experiences" className="py-24 bg-bg-primary">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary mb-16">{t('experiences.title')}</h2>
        
        {loading ? (
          <div className="relative">
            {/* Central line skeleton */}
            <div className="absolute left-[29px] md:left-1/2 top-0 bottom-0 w-[2px] bg-bg-card transform md:-translate-x-1/2"></div>
            <div className="space-y-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`relative flex items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="hidden md:block w-1/2"></div>
                  <div className="absolute left-[29px] md:left-1/2 w-3 h-3 rounded-full bg-bg-card transform -translate-x-1/2"></div>
                  <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-12">
                    <div className={`h-4 w-24 bg-bg-card rounded mb-2 animate-pulse ${i % 2 === 0 ? 'md:ml-auto' : ''}`}></div>
                    <div className={`h-6 w-3/4 bg-bg-card rounded mb-2 animate-pulse ${i % 2 === 0 ? 'md:ml-auto' : ''}`}></div>
                    <div className={`h-4 w-1/2 bg-bg-card rounded mb-4 animate-pulse ${i % 2 === 0 ? 'md:ml-auto' : ''}`}></div>
                    <div className="h-16 w-full bg-bg-card rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center text-text-muted font-inter py-12 italic">
            {t('experiences.empty')}
          </div>
        ) : (
          <div className="relative">
            {/* Central line */}
            <div className="absolute left-[29px] md:left-1/2 top-2 bottom-2 w-[2px] bg-accent-cyan/30 transform md:-translate-x-1/2"></div>
            
            <div className="space-y-16">
              {experiences.map((exp, index) => (
                <ExperienceItem key={exp.id} exp={exp} isEven={index % 2 === 0} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
