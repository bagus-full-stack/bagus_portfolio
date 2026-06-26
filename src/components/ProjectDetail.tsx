import { useEffect } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, Network } from 'lucide-react';
import { Project } from '../types';
import { setProjectMeta } from '../services/meta.service';
import { SEOHead } from './SEOHead';
import { ShareButtons } from './ShareButtons';

export function ProjectDetail() {
  const { project } = useLoaderData() as { project: Project };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project]);


  const statusColors = {
    production: 'text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10',
    beta: 'text-accent-ocre border-accent-ocre/30 bg-accent-ocre/10',
    archived: 'text-text-muted border-text-muted/30 bg-text-muted/10'
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-32 selection:bg-accent-cyan/30">
      <SEOHead meta={setProjectMeta(project)} />
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Navigation */}
        <Link 
          to="/#projects" 
          className="inline-flex items-center text-accent-cyan hover:text-accent-cyan/80 font-inter text-sm mb-16 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Retour aux projets
        </Link>
        
        {/* Hero */}
        <header className="mb-20">
          <h1 className="font-space text-4xl md:text-5xl font-bold text-text-primary mb-6">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6">
            <span className={`px-3 py-1 text-xs font-mono font-medium rounded-full border ${statusColors[project.status]}`}>
              {project.status.toUpperCase()}
            </span>
            
            <div className="flex items-center gap-4">
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noreferrer" className="flex items-center text-text-muted hover:text-text-primary transition-colors text-sm font-inter">
                  <Github size={18} className="mr-2" /> Code source
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer" className="flex items-center text-text-muted hover:text-text-primary transition-colors text-sm font-inter">
                  <ExternalLink size={18} className="mr-2" /> Démo live
                </a>
              )}
            </div>
          </div>
        </header>
        
        {/* Content Sections */}
        <div className="space-y-16">
          
          {/* Contexte */}
          <section>
            <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">Contexte & Problème</h2>
            <p className="font-inter text-text-muted text-base leading-relaxed">
              {project.context}
            </p>
          </section>
          
          {/* Architecture (Placeholder abstrait) */}
          <section>
            <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">Architecture</h2>
            <div className="bg-bg-card rounded-xl p-8 border border-white/5 flex flex-col items-center justify-center min-h-[200px]">
              {project.architecture ? (
                <p className="font-mono text-sm text-accent-cyan text-center">{project.architecture}</p>
              ) : (
                <div className="flex flex-col items-center opacity-50">
                   <Network size={48} className="text-accent-cyan mb-4" />
                   <span className="font-mono text-xs text-text-muted">Diagramme d'architecture conceptuel</span>
                </div>
              )}
            </div>
          </section>
          
          {/* Choix Techniques */}
          <section>
            <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">Choix Techniques</h2>
            <div className="grid gap-4">
              {project.technical_choices.map((tc, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-2 md:gap-6 bg-bg-card/50 p-4 rounded-lg border border-white/5">
                  <div className="font-mono text-accent-ocre font-medium min-w-[120px]">
                    {tc.choice}
                  </div>
                  <div className="font-inter text-text-muted text-sm leading-relaxed">
                    {tc.reason}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Difficultés */}
          {project.challenges.length > 0 && (
            <section>
              <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">Difficultés Rencontrées</h2>
              <ul className="space-y-4">
                {project.challenges.map((challenge, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="text-accent-cyan mt-1">•</span>
                    <span className="font-inter text-text-muted leading-relaxed">{challenge}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {/* Résultats */}
          {project.results.length > 0 && (
            <section>
              <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">Impact & Résultats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {project.results.map((result, idx) => (
                  <div key={idx} className="bg-bg-card p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="font-space text-3xl font-bold text-text-primary mb-2">
                      {result.value}
                    </span>
                    <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                      {result.metric}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Stack */}
          <section>
            <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">Stack Complète</h2>
            <div className="flex flex-wrap gap-3">
              {project.stack.map(tech => (
                <span key={tech} className="px-4 py-2 bg-bg-card border border-white/5 rounded text-sm font-mono text-text-primary">
                  {tech}
                </span>
              ))}
            </div>
          </section>
          
          <ShareButtons />
        </div>
      </div>
    </div>
  );
}
