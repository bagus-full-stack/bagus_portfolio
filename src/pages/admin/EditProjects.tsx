import React, { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Edit2, Trash2, ArrowLeft, Folder, Image as ImageIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '../../types';
import { SupabaseService, supabase } from '../../services/supabase.service';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { useAutoSave } from '../../hooks/useAutoSave';

export function EditProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    SupabaseService.getProjects().then(data => {
      if (mounted) {
        setProjects(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setProjects(prev => prev.filter(p => p.id !== deletingId));
      toast.success('Projet supprimé');
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-bg-card rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-bg-card border border-white/5 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (isAdding || editingId) {
    const projToEdit = editingId ? projects.find(p => p.id === editingId) : null;
    return (
      <ProjectForm 
        initialData={projToEdit} 
        onCancel={() => { setIsAdding(false); setEditingId(null); }}
        onSave={(saved) => {
          if (isAdding) setProjects([saved, ...projects]);
          else setProjects(projects.map(p => p.id === saved.id ? saved : p));
          setIsAdding(false);
          setEditingId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-space text-2xl font-bold text-text-primary">Projets</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-accent-ocre text-bg-primary font-medium rounded hover:bg-accent-ocre/90 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Ajouter un projet
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-bg-card border border-white/5 rounded-xl p-12 text-center text-text-muted">
          <Folder size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-inter mb-4">Aucun projet — Créez votre premier projet</p>
          <button onClick={() => setIsAdding(true)} className="text-accent-cyan hover:underline">Créer maintenant</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-bg-card border border-white/5 rounded-xl overflow-hidden flex flex-col group">
              <div className="h-40 bg-bg-primary relative">
                {project.cover_image ? (
                  <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10"><ImageIcon size={40} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-card to-transparent" />
                <span className={`absolute top-3 right-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border bg-bg-card/80 backdrop-blur ${
                  project.status === 'production' ? 'text-green-400 border-green-400/20' : 
                  project.status === 'beta' ? 'text-yellow-400 border-yellow-400/20' : 
                  'text-text-muted border-white/10'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-space font-semibold text-lg text-text-primary mb-2 line-clamp-1">{project.title}</h3>
                <p className="text-sm text-text-muted flex-1 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                  <button onClick={() => setEditingId(project.id)} className="p-2 text-text-muted hover:text-accent-cyan hover:bg-white/5 rounded transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => setDeletingId(project.id)} className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Confirmer la suppression"
        message="Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

function ProjectForm({ initialData, onCancel, onSave }: { initialData: Project | null, onCancel: () => void, onSave: (p: Project) => void }) {
  const [formData, setFormData] = useState<Partial<Project>>(initialData || { 
    status: 'production', stack: [], technical_choices: [], challenges: [], results: [] 
  });
  const [stackInput, setStackInput] = useState('');

  const { triggerSave, saveState } = useAutoSave(async () => {
    if (!formData.title || !formData.slug) return;
    const projectToSave = { ...formData, id: formData.id || crypto.randomUUID() } as Project;
    const { error } = await supabase.from('projects').upsert(projectToSave);
    if (error) {
      toast.error('Erreur lors de la sauvegarde automatique');
    } else if (!formData.id) {
      setFormData(prev => ({ ...prev, id: projectToSave.id }));
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    triggerSave();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }));
    triggerSave();
  };

  const handleStackAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && stackInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, stack: [...(prev.stack || []), stackInput.trim()] }));
      setStackInput('');
      triggerSave();
    }
  };

  const removeStack = (idx: number) => {
    setFormData(prev => ({ ...prev, stack: (prev.stack || []).filter((_, i) => i !== idx) }));
    triggerSave();
  };

  // Dynamic lists handlers
  const handleTechChoiceChange = (idx: number, field: 'choice' | 'reason', val: string) => {
    const newChoices = [...(formData.technical_choices || [])];
    if (!newChoices[idx]) newChoices[idx] = { choice: '', reason: '' };
    newChoices[idx] = { ...newChoices[idx], [field]: val };
    setFormData(prev => ({ ...prev, technical_choices: newChoices }));
    triggerSave();
  };
  const addTechChoice = () => {
    setFormData(prev => ({ ...prev, technical_choices: [...(prev.technical_choices || []), { choice: '', reason: '' }] }));
    triggerSave();
  };
  const removeTechChoice = (idx: number) => {
    setFormData(prev => ({ ...prev, technical_choices: (prev.technical_choices || []).filter((_, i) => i !== idx) }));
    triggerSave();
  };

  const handleChallengeChange = (idx: number, val: string) => {
    const newChallenges = [...(formData.challenges || [])];
    newChallenges[idx] = val;
    setFormData(prev => ({ ...prev, challenges: newChallenges }));
    triggerSave();
  };
  const addChallenge = () => {
    setFormData(prev => ({ ...prev, challenges: [...(prev.challenges || []), ''] }));
    triggerSave();
  };
  const removeChallenge = (idx: number) => {
    setFormData(prev => ({ ...prev, challenges: (prev.challenges || []).filter((_, i) => i !== idx) }));
    triggerSave();
  };

  const handleResultChange = (idx: number, field: 'metric' | 'value', val: string) => {
    const newResults = [...(formData.results || [])];
    if (!newResults[idx]) newResults[idx] = { metric: '', value: '' };
    newResults[idx] = { ...newResults[idx], [field]: val };
    setFormData(prev => ({ ...prev, results: newResults }));
    triggerSave();
  };
  const addResult = () => {
    setFormData(prev => ({ ...prev, results: [...(prev.results || []), { metric: '', value: '' }] }));
    triggerSave();
  };
  const removeResult = (idx: number) => {
    setFormData(prev => ({ ...prev, results: (prev.results || []).filter((_, i) => i !== idx) }));
    triggerSave();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
       toast.error("Titre et slug sont requis");
       return;
    }
    const finalProj = { ...formData, id: formData.id || crypto.randomUUID() } as Project;
    await supabase.from('projects').upsert(finalProj);
    onSave(finalProj);
    toast.success('Modifications enregistrées');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-[calc(100vh-8rem)] relative">
      <div className="mb-6">
        <button type="button" onClick={onCancel} className="flex items-center text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Retour aux projets
        </button>
      </div>

      <div className="flex-1 space-y-8 pb-24">
        
        {/* Basic Info */}
        <div className="bg-bg-card border border-white/5 rounded-xl p-6 space-y-6">
          <h2 className="font-space text-xl font-bold">{initialData ? 'Modifier le projet' : 'Ajouter un projet'}</h2>
          
          <div className="w-full aspect-video md:w-1/2 lg:w-1/3 bg-bg-primary border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-center p-6 hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden">
             {formData.cover_image ? (
               <img src={formData.cover_image} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
             ) : (
               <>
                 <ImageIcon size={32} className="text-accent-cyan mb-2" />
                 <p className="text-sm font-medium">Image de couverture</p>
                 <p className="text-xs text-text-muted mt-1">Glissez ou cliquez (16:9)</p>
               </>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Titre *</label>
              <input type="text" name="title" required value={formData.title || ''} onChange={(e) => handleTitleChange(e.target.value)} onBlur={triggerSave} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Slug *</label>
              <input type="text" name="slug" required value={formData.slug || ''} onChange={handleChange} onBlur={triggerSave} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors mb-1" />
              <p className="font-mono text-text-muted text-[12px]">URL : /projects/{formData.slug || '[slug-actuel]'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Statut *</label>
              <select name="status" required value={formData.status} onChange={handleChange} onBlur={triggerSave} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors appearance-none">
                <option value="production">Production</option>
                <option value="beta">Beta</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5 flex justify-between">
              <span>Description courte *</span>
              <span className={`text-xs ${(formData.description?.length || 0) > 200 ? 'text-red-400' : ''}`}>{(formData.description?.length || 0)}/200</span>
            </label>
            <textarea name="description" required maxLength={200} rows={2} value={formData.description || ''} onChange={handleChange} onBlur={triggerSave} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Stack technique</label>
            <div className="w-full p-2 bg-bg-primary border border-white/10 rounded flex flex-wrap gap-2 focus-within:border-accent-cyan transition-colors">
              {(formData.stack || []).map((tech, i) => (
                <span key={i} className="flex items-center px-2 py-1 bg-white/5 rounded text-sm text-text-primary font-mono">
                  {tech} <button type="button" onClick={() => removeStack(i)} className="ml-2 text-text-muted hover:text-red-400">&times;</button>
                </span>
              ))}
              <input type="text" value={stackInput} onChange={e => setStackInput(e.target.value)} onKeyDown={handleStackAdd} placeholder="Entrée pour ajouter" className="flex-1 min-w-[150px] bg-transparent outline-none text-sm text-text-primary font-mono py-1" />
            </div>
          </div>
        </div>

        {/* Details Info */}
        <div className="bg-bg-card border border-white/5 rounded-xl p-6 space-y-6">
          <h2 className="font-space text-xl font-bold">Détails de l'étude de cas</h2>
          
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Contexte *</label>
            <textarea name="context" required rows={4} value={formData.context || ''} onChange={handleChange} onBlur={triggerSave} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors resize-y" />
          </div>

          {/* Technical Choices */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-muted">Choix techniques</label>
              <button type="button" onClick={addTechChoice} className="text-xs text-accent-cyan hover:underline flex items-center"><Plus size={12} className="mr-1"/> Ajouter</button>
            </div>
            <div className="space-y-3">
              {(formData.technical_choices || []).map((tc, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <input type="text" placeholder="Choix (ex: React)" value={tc.choice} onChange={e => handleTechChoiceChange(i, 'choice', e.target.value)} onBlur={triggerSave} className="w-1/3 px-3 py-2 bg-bg-primary border border-white/10 rounded text-sm text-text-primary focus:border-accent-cyan outline-none" />
                  <input type="text" placeholder="Raison" value={tc.reason} onChange={e => handleTechChoiceChange(i, 'reason', e.target.value)} onBlur={triggerSave} className="flex-1 px-3 py-2 bg-bg-primary border border-white/10 rounded text-sm text-text-primary focus:border-accent-cyan outline-none" />
                  <button type="button" onClick={() => removeTechChoice(i)} className="p-2 text-text-muted hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-muted">Difficultés rencontrées</label>
              <button type="button" onClick={addChallenge} className="text-xs text-accent-cyan hover:underline flex items-center"><Plus size={12} className="mr-1"/> Ajouter</button>
            </div>
            <div className="space-y-3">
              {(formData.challenges || []).map((c, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <textarea rows={2} value={c} onChange={e => handleChallengeChange(i, e.target.value)} onBlur={triggerSave} className="flex-1 px-3 py-2 bg-bg-primary border border-white/10 rounded text-sm text-text-primary focus:border-accent-cyan outline-none resize-none" />
                  <button type="button" onClick={() => removeChallenge(i)} className="p-2 text-text-muted hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-muted">Résultats</label>
              <button type="button" onClick={addResult} className="text-xs text-accent-cyan hover:underline flex items-center"><Plus size={12} className="mr-1"/> Ajouter</button>
            </div>
            <div className="space-y-3">
              {(formData.results || []).map((r, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <input type="text" placeholder="Métrique (ex: Performance)" value={r.metric} onChange={e => handleResultChange(i, 'metric', e.target.value)} onBlur={triggerSave} className="w-1/3 px-3 py-2 bg-bg-primary border border-white/10 rounded text-sm text-text-primary focus:border-accent-cyan outline-none" />
                  <input type="text" placeholder="Valeur (ex: +40%)" value={r.value} onChange={e => handleResultChange(i, 'value', e.target.value)} onBlur={triggerSave} className="w-1/3 px-3 py-2 bg-bg-primary border border-white/10 rounded text-sm text-text-primary focus:border-accent-cyan outline-none" />
                  <button type="button" onClick={() => removeResult(i)} className="p-2 text-text-muted hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Links Info */}
        <div className="bg-bg-card border border-white/5 rounded-xl p-6 space-y-6">
          <h2 className="font-space text-xl font-bold">Liens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">URL GitHub</label>
              <input type="url" name="github_url" value={formData.github_url || ''} onChange={handleChange} onBlur={triggerSave} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">URL Live</label>
              <input type="url" name="live_url" value={formData.live_url || ''} onChange={handleChange} onBlur={triggerSave} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-50 bg-[#0B0F14] pt-4 border-t border-[#9BA4B5]/20 flex justify-between items-center gap-3">
        <div className="flex items-center">
          {saveState === 'saving' && (
            <span className="text-[#8B94A3] font-mono text-xs flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              Enregistrement...
            </span>
          )}
          {saveState === 'saved' && (
            <span className="text-[#2DD4BF] font-mono text-xs flex items-center gap-1">
              <Check size={12} />
              Enregistré
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 text-text-primary hover:bg-white/5 font-medium rounded transition-colors">Fermer</button>
          <button type="submit" disabled={saveState === 'saving'} className="px-6 py-2.5 bg-[#E08A3E] text-[#0B0F14] font-medium rounded hover:bg-[#E08A3E]/90 transition-colors disabled:opacity-70 flex items-center">
            {saveState === 'saving' ? 'Enregistrement...' : 'Terminer'}
          </button>
        </div>
      </div>
    </form>
  );
}
