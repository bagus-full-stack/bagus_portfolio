import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Code2 } from 'lucide-react';
import { Project } from '../types';
import { SupabaseService } from '../services/supabase.service';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

export function ProjectsSection() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    
    async function loadProjects() {
      try {
        const data = await SupabaseService.getProjects();
        if (mounted) {
          setProjects(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          setLoading(false);
          toast.error(t('projects.error'));
        }
      }
    }
    
    loadProjects();
    return () => { mounted = false; };
  }, [t]);

  const allStacks = useMemo(() => Array.from(new Set(projects.flatMap(p => p.stack))), [projects]);
  const filters = [{ id: 'all', label: t('projects.filter.all') }, ...allStacks.map(s => ({ id: s, label: s }))];

  const filteredProjects = projects.filter(
    p => filter === 'all' || p.stack.includes(filter)
  );

  if (error) {
    return (
      <section id="projects" className="py-24 bg-bg-card/20 border-t border-white/5">
         <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-sm text-sm font-inter">
            {t('projects.error')}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-24 bg-bg-card/20 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">{t('projects.title')}</h2>
          
          {!loading && (
            <div className="flex flex-wrap gap-2">
              {filters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-inter transition-colors duration-200 ${
                    filter === f.id
                      ? 'bg-accent-ocre text-bg-primary font-medium'
                      : 'border border-text-muted/30 text-text-muted hover:border-text-muted hover:text-text-primary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col rounded-xl border border-white/5 bg-bg-card overflow-hidden">
                <div className="aspect-video bg-bg-primary animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-bg-primary rounded w-3/4 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-bg-primary rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-bg-primary rounded w-5/6 animate-pulse"></div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <div className="h-6 bg-bg-primary rounded w-16 animate-pulse"></div>
                    <div className="h-6 bg-bg-primary rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center text-text-muted font-inter italic">
            {t('projects.empty.filter')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="group flex flex-col rounded-xl border border-white/5 bg-bg-card overflow-hidden hover:border-accent-ocre transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <div className="aspect-video bg-bg-primary relative flex items-center justify-center overflow-hidden">
                  {project.cover_image ? (
                    <img src={project.cover_image} alt={`${project.title} — projet de Assami Baga`} className="w-full h-full object-cover" loading="lazy" width={400} height={225} />
                  ) : (
                    <Code2 className="w-12 h-12 text-text-muted/30" />
                  )}
                </div>
                
                <div className="flex flex-col flex-grow p-6">
                  <h3 className="font-space text-xl font-semibold text-text-primary mb-3 group-hover:text-accent-cyan transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="font-inter text-text-muted text-sm line-clamp-2 mb-6 flex-grow">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.stack.slice(0, 3).map(tech => (
                      <span key={tech} className="font-mono text-[11px] text-text-muted bg-bg-primary px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                    {project.stack.length > 3 && (
                      <span className="font-mono text-[11px] text-text-muted bg-bg-primary px-2 py-1 rounded">
                        +{project.stack.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="text-sm font-inter font-medium text-text-primary hover:text-accent-ocre transition-colors"
                    >
                      {t('projects.card.case')} →
                    </Link>
                    
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-text-muted hover:text-text-primary transition-colors"
                        title={t('projects.card.github')}
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
