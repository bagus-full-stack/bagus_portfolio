import React, { useState, useEffect } from 'react';
import { Plus, X, Tag, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Skill } from '../../types';
import { SupabaseService, supabase } from '../../services/supabase.service';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useAutoSave } from '../../hooks/useAutoSave';

export function EditSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSkill, setDeletingSkill] = useState<{ id: string, category: string } | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    SupabaseService.getSkills().then(data => {
      if (mounted) {
        setSkills(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const categories = Array.from(new Set<string>(skills.map(s => s.category)));

  const { triggerSave, saveState } = useAutoSave(async () => {
    const { error } = await supabase.from('skills').upsert(skills);
    if (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  });

  const updateSkill = (id: string, newName: string) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleAddSkill = async (category: string) => {
    const val = inputs[category]?.trim();
    if (!val) return;
    
    try {
      const newSkill: Skill = { id: crypto.randomUUID(), name: val, category };
      const updatedSkills = [...skills, newSkill];
      setSkills(updatedSkills);
      setInputs(prev => ({ ...prev, [category]: '' }));
      
      await supabase.from('skills').insert([{ name: val, category }]);
    } catch (e) {
      toast.error('Erreur ajout compétence');
    }
  };

  const confirmDeleteSkill = (id: string, category: string) => {
    setDeletingSkill({ id, category });
  };

  const handleDeleteSkill = async () => {
    if (!deletingSkill) return;
    const { id } = deletingSkill;
    try {
      await supabase.from('skills').delete().eq('id', id);
      setSkills(skills.filter(s => s.id !== id));
      toast.success('Compétence supprimée');
    } catch (e) {
      toast.error('Erreur suppression compétence');
    } finally {
      setDeletingSkill(null);
    }
  };

  const handleNewCategory = () => {
    const name = window.prompt("Nom de la nouvelle catégorie :");
    if (name && name.trim()) {
      setSkills([...skills, { id: crypto.randomUUID(), name: "", category: name.trim() }]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-bg-card rounded mb-8"></div>
        {[1, 2].map(i => <div key={i} className="h-40 bg-bg-card border border-white/5 rounded-xl"></div>)}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-space text-2xl font-bold text-text-primary">Compétences</h2>
        <button 
          onClick={handleNewCategory}
          className="flex items-center px-4 py-2 bg-white/5 text-text-primary font-medium rounded hover:bg-white/10 transition-colors border border-white/10"
        >
          <Plus size={18} className="mr-2" />
          Nouvelle catégorie
        </button>
      </div>

      <p className="text-text-muted text-sm mb-8 flex items-center">
        <Tag size={16} className="mr-2" />
        L'enregistrement est automatique à chaque modification.
      </p>

      <div className="space-y-8">
        {categories.map(category => {
          const catSkills = skills.filter(s => s.category === category);

          return (
            <div key={category} className="bg-bg-card border border-white/5 rounded-xl p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-space text-lg font-semibold text-accent-ocre">{category}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                {catSkills.length === 0 ? (
                  <p className="text-text-muted text-sm italic py-1">Aucune compétence — tapez pour ajouter</p>
                ) : (
                  catSkills.map(skill => (
                    <div key={skill.id} className="flex items-center bg-bg-primary border border-white/10 rounded group transition-colors focus-within:border-accent-cyan hover:border-white/20">
                      <input 
                        type="text"
                        value={skill.name}
                        onChange={(e) => {
                          updateSkill(skill.id, e.target.value);
                          triggerSave();
                        }}
                        onBlur={triggerSave}
                        className="px-3 py-1.5 bg-transparent font-mono text-sm text-text-primary outline-none w-32"
                      />
                      <button 
                        onClick={() => confirmDeleteSkill(skill.id, category)}
                        className="px-2 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        aria-label="Supprimer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex">
                <input 
                  type="text"
                  placeholder="Nouvelle compétence..."
                  value={inputs[category] || ''}
                  onChange={e => setInputs(prev => ({ ...prev, [category]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddSkill(category)}
                  className="w-full sm:max-w-xs px-4 py-2 bg-bg-primary border border-white/10 rounded-l text-text-primary focus:border-accent-cyan outline-none transition-colors font-mono text-sm"
                />
                <button 
                  onClick={() => handleAddSkill(category)}
                  disabled={!inputs[category]?.trim()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-text-primary font-medium rounded-r transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-y border-r border-white/10"
                >
                  Ajouter
                </button>
              </div>
              
              <div className="absolute bottom-4 right-4">
                {saveState === 'saving' && (
                  <span className="text-[#8B94A3] font-mono text-xs flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" />
                    Enregistrement...
                  </span>
                )}
                {saveState === 'saved' && (
                  <span className="text-[#2DD4BF] font-mono text-xs flex items-center gap-1">
                    <Check size={10} />
                    Enregistré
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (
          <div className="bg-bg-card border border-white/5 rounded-xl p-12 text-center text-text-muted">
            <p className="font-inter mb-4">Aucune catégorie existante</p>
            <button onClick={handleNewCategory} className="text-accent-cyan hover:underline">Créer la première catégorie</button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deletingSkill}
        title="Confirmer la suppression"
        message="Cette action est irréversible."
        onConfirm={handleDeleteSkill}
        onCancel={() => setDeletingSkill(null)}
      />
    </div>
  );
}
