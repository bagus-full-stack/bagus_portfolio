import { useEffect } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, Network } from 'lucide-react';
import { Project } from '../types';
import { SEOHead } from './SEOHead';
import { ShareButtons } from './ShareButtons';
import ArchitectureDiagram from './ArchitectureDiagram';
import { useTranslation } from '../hooks/useTranslation';
import { useLocalizedField } from '../hooks/useLocalizedField';

export function ProjectDetail() {
  const { project } = useLoaderData() as { project: Project };
  const { t: translate } = useTranslation();
  const { t, tArray } = useLocalizedField();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project]);


  const statusColors: Record<Project['status'], string> = {
    production: 'text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10',
    beta: 'text-accent-ocre border-accent-ocre/30 bg-accent-ocre/10',
    archived: 'text-text-muted border-text-muted/30 bg-text-muted/10',
    conception: 'text-text-primary border-white/20 bg-white/5'
  };

  const title = t(project, 'title');
  const description = t(project, 'description');
  const context = t(project, 'context');
  const stack = project.stack ?? [];
  const technicalChoices = project.technical_choices ?? [];

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-32 selection:bg-accent-cyan/30">
      <SEOHead meta={{
        title: `${title} — Assami Baga`,
        description: description.slice(0, 155),
        url: `https://assami.dev/projects/${project.slug}`,
        image: project.cover_image || undefined,
        type: 'article',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          "name": title,
          "description": description,
          "url": `https://assami.dev/projects/${project.slug}`,
          "author": {
            "@type": "Person",
            "name": "Assami Baga",
            "url": "https://assami.dev"
          },
          "programmingLanguage": stack,
          "codeRepository": project.github_url
        }
      }} />
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Navigation */}
        <Link 
          to="/#projects" 
          className="inline-flex items-center text-accent-cyan hover:text-accent-cyan/80 font-inter text-sm mb-16 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          {translate('project_detail.back')}
        </Link>
        
        {/* Hero */}
        <header className="mb-20">
          <h1 className="font-space text-4xl md:text-5xl font-bold text-text-primary mb-6">
            {title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6">
            <span className={`px-3 py-1 text-xs font-mono font-medium rounded-full border ${statusColors[project.status] || statusColors.production}`}>
              {translate(`projects.status.${project.status}`)}
            </span>
            
            <div className="flex items-center gap-4">
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noreferrer" className="flex items-center text-text-muted hover:text-text-primary transition-colors text-sm font-inter">
                  <Github size={18} className="mr-2" /> {translate('project_detail.links.github')}
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer" className="flex items-center text-text-muted hover:text-text-primary transition-colors text-sm font-inter">
                  <ExternalLink size={18} className="mr-2" /> {translate('project_detail.links.live')}
                </a>
              )}
            </div>
          </div>
        </header>
        
        {/* Content Sections */}
        <div className="space-y-16">
          
          {/* Contexte */}
          {context && (
            <section>
              <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">{translate('project_detail.sections.context')}</h2>
              <p className="font-inter text-text-muted text-base leading-relaxed">
                {context}
              </p>
            </section>
          )}
          
          {/* Architecture */}
          <section>
            <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">{translate('project_detail.sections.architecture')}</h2>
            <div className="bg-bg-card rounded-xl p-8 border border-white/5 flex flex-col items-center justify-center min-h-[200px]">
              {project.architecture_nodes && project.architecture_nodes.length > 0 ? (
                <ArchitectureDiagram
                  nodes={project.architecture_nodes}
                  edges={project.architecture_edges || []}
                />
              ) : project.architecture ? (
                <p className="font-mono text-sm text-accent-cyan text-center">{project.architecture}</p>
              ) : (
                <p className="text-text-muted font-inter text-sm italic">
                  {translate('project_detail.architecture.empty')}
                </p>
              )}
            </div>
          </section>
          
          {/* Choix Techniques */}
          {technicalChoices.length > 0 && (
          <section>
            <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">{translate('project_detail.sections.choices')}</h2>
            <div className="grid gap-4">
              {technicalChoices.map((tc, idx) => (
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
          )}

          {/* Difficultés */}
          {project.challenges && project.challenges.length > 0 && (
            <section>
              <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">{translate('project_detail.sections.challenges')}</h2>
              <ul className="space-y-4">
                {tArray(project, 'challenges').map((challenge, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="text-accent-cyan mt-1">•</span>
                    <span className="font-inter text-text-muted leading-relaxed">{challenge}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {/* Résultats */}
          {project.results && project.results.length > 0 && (
            <section>
              <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">{translate('project_detail.sections.results')}</h2>
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
          {stack.length > 0 && (
          <section>
            <h2 className="font-space text-2xl font-semibold text-text-primary mb-6">{translate('project_detail.sections.stack')}</h2>
            <div className="flex flex-wrap gap-3">
              {stack.map(tech => (
                <span key={tech} className="px-4 py-2 bg-bg-card border border-white/5 rounded text-sm font-mono text-text-primary">
                  {tech}
                </span>
              ))}
            </div>
          </section>
          )}

          <ShareButtons />
        </div>
      </div>
    </div>
  );
}
