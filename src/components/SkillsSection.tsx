import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Skill, Project } from '../types';
import { SupabaseService, supabase } from '../services/supabase.service';
import { toast } from 'sonner';
import { X, Folder } from 'lucide-react';

export function SkillsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [linkedProjects, setLinkedProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function loadData() {
      try {
        const skillsData = await SupabaseService.getSkills();
        if (mounted) {
          setSkills(skillsData);
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

  const handleSkillClick = async (skillName: string) => {
    if (selectedSkill === skillName) {
      setSelectedSkill(null);
      setLinkedProjects([]);
      return;
    }

    setSelectedSkill(skillName);
    setLoadingProjects(true);

    try {
      const { data } = await supabase
        .from('projects')
        .select('id, title, slug, cover_image, description, stack, status')
        .contains('stack', [skillName])
        .eq('status', 'production')
        .limit(4);

      setLinkedProjects(data || []);
    } catch {
      setLinkedProjects([]);
    } finally {
      setLoadingProjects(false);
    }
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
                    const isActive = selectedSkill === skillName;
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
            
            {selectedSkill && (
              <div className="mt-6 p-4 bg-[#141B22] rounded-xl border border-[#2DD4BF]/20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-[JetBrains_Mono] text-sm text-[#2DD4BF]">
                    Projets utilisant <span className="text-[#EDEFF2]">{selectedSkill}</span>
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSkill(null);
                      setLinkedProjects([]);
                    }}
                    className="text-[#8B94A3] hover:text-[#EDEFF2] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {loadingProjects ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map(i => (
                      <div key={i} className="h-20 bg-[#0B0F14] rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : linkedProjects.length === 0 ? (
                  <p className="text-[#8B94A3] font-[Inter] text-sm">
                    Aucun projet public utilisant cette compétence.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {linkedProjects.map(project => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.slug}`}
                        className="flex items-center gap-3 p-3 bg-[#0B0F14] rounded-lg hover:border-[#E08A3E]/40 border border-transparent transition-colors group"
                      >
                        {project.cover_image ? (
                          <img
                            src={project.cover_image}
                            alt={project.title}
                            className="w-12 h-12 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-[#141B22] flex items-center justify-center shrink-0">
                            <Folder size={16} className="text-[#8B94A3]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[#EDEFF2] font-[Inter] text-sm font-medium truncate group-hover:text-[#E08A3E] transition-colors">
                            {project.title}
                          </p>
                          <p className="text-[#8B94A3] font-[JetBrains_Mono] text-xs truncate">
                            {project.stack?.slice(0, 3).join(' · ')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
