import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Skill, Project } from '../types';
import { SupabaseService } from '../services/supabase.service';
import { toast } from 'sonner';

export function SkillsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function loadData() {
      try {
        const [skillsData, projectsData] = await Promise.all([
          SupabaseService.getSkills(),
          SupabaseService.getProjects()
        ]);
        if (mounted) {
          setSkills(skillsData);
          setProjects(projectsData);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          setLoading(false);
          toast.error("Impossible de charger les compétences.");
        }
      }
    }
    
    loadData();
    return () => { mounted = false; };
  }, []);

  const handleSkillClick = (skillName: string) => {
    setActiveSkill(activeSkill === skillName ? null : skillName);
  };

  const getProjectsForSkill = (skillName: string) => {
    return projects.filter(p => p.stack.includes(skillName));
  };

  // Group skills by category
  const categories = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);

  if (error) {
    return (
      <section id="skills" className="py-24 bg-bg-primary">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-sm text-sm font-inter">
            Impossible de charger les compétences.
          </div>
        </div>
      </section>
    );
  }

  const activeProjects = activeSkill ? getProjectsForSkill(activeSkill) : [];

  return (
    <section id="skills" className="py-24 bg-bg-primary">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary mb-12">Compétences</h2>
        
        {loading ? (
          <div className="space-y-10">
            {[1, 2, 3, 4, 5].map(group => (
              <div key={group}>
                <div className="h-6 w-32 bg-bg-card rounded mb-4 animate-pulse"></div>
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4].map(tag => (
                    <div key={tag} className="h-10 w-24 bg-bg-card rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {(Object.entries(categories) as [string, string[]][]).map(([categoryName, skillNames]) => (
              <div key={categoryName}>
                <h3 className="font-space text-xl font-semibold text-text-primary mb-4">{categoryName}</h3>
                <div className="flex flex-wrap gap-3">
                  {skillNames.map(skillName => {
                    const isActive = activeSkill === skillName;
                    return (
                      <button
                        key={skillName}
                        onClick={() => handleSkillClick(skillName)}
                        className={`px-4 py-2 font-mono text-sm rounded transition-colors duration-200 ${
                          isActive 
                            ? 'bg-accent-cyan text-bg-primary font-medium border-transparent' 
                            : 'bg-bg-card border border-accent-cyan/30 text-text-primary hover:border-accent-cyan'
                        }`}
                      >
                        {skillName}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Inline Panel for Active Skill */}
            {activeSkill && (
              <div className="mt-8 p-6 bg-bg-card/50 border border-accent-cyan/30 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
                <h4 className="font-inter text-text-primary mb-4">
                  Projets utilisant <span className="font-mono text-accent-cyan">{activeSkill}</span> :
                </h4>
                {activeProjects.length > 0 ? (
                  <ul className="space-y-3">
                    {activeProjects.map(project => (
                      <li key={project.id} className="flex items-center">
                        <span className="text-accent-cyan mr-3">↳</span>
                        <Link 
                          to={`/projects/${project.slug}`}
                          className="font-inter text-sm text-text-muted hover:text-text-primary transition-colors underline decoration-white/20 underline-offset-4"
                        >
                          {project.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-inter text-sm text-text-muted italic">
                    Aucun projet public ne mentionne explicitement cette technologie pour le moment.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
