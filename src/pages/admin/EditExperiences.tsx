import React, { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Edit2, Trash2, ArrowLeft, Briefcase, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Experience } from '../../types';
import { SupabaseService } from '../../services/supabase.service';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export function EditExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    SupabaseService.getExperiences().then(data => {
      if (mounted) {
        setExperiences(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      // Simulate delete
      setExperiences(prev => prev.filter(e => e.id !== deletingId));
      toast.success('Expérience supprimée');
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-bg-card rounded mb-8"></div>
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-bg-card border border-white/5 rounded-xl"></div>)}
      </div>
    );
  }

  if (isAdding || editingId) {
    const expToEdit = editingId ? experiences.find(e => e.id === editingId) : null;
    return (
      <ExperienceForm 
        initialData={expToEdit} 
        onCancel={() => { setIsAdding(false); setEditingId(null); }}
        onSave={(saved) => {
          if (isAdding) setExperiences([saved, ...experiences]);
          else setExperiences(experiences.map(e => e.id === saved.id ? saved : e));
          setIsAdding(false);
          setEditingId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-space text-2xl font-bold text-text-primary">Expériences</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-accent-ocre text-bg-primary font-medium rounded hover:bg-accent-ocre/90 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Ajouter une expérience
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="bg-bg-card border border-white/5 rounded-xl p-12 text-center text-text-muted">
          <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-inter mb-4">Aucune expérience — Ajoutez votre première expérience</p>
          <button onClick={() => setIsAdding(true)} className="text-accent-cyan hover:underline">Ajouter maintenant</button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map(exp => (
            <div key={exp.id} className="bg-bg-card border border-white/5 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-space font-semibold text-lg text-text-primary">{exp.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                    exp.type === 'pro' 
                      ? 'bg-accent-ocre/10 border-accent-ocre/20 text-accent-ocre'
                      : 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan'
                  }`}>
                    {exp.type === 'pro' ? 'PRO' : 'FORMATION'}
                  </span>
                </div>
                <p className="text-text-muted font-medium mb-2">{exp.organization}</p>
                <p className="text-xs text-text-muted font-mono">{exp.start_date} — {exp.end_date || 'Présent'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingId(exp.id)} className="p-2 text-text-muted hover:text-accent-cyan hover:bg-white/5 rounded transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => setDeletingId(exp.id)} className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                  <Trash2 size={18} />
                </button>
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

function ExperienceForm({ initialData, onCancel, onSave }: { initialData: Experience | null, onCancel: () => void, onSave: (e: Experience) => void }) {
  const [formData, setFormData] = useState<Partial<Experience>>(initialData || { type: 'pro', stack: [] });
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [stackInput, setStackInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStackAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && stackInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, stack: [...(prev.stack || []), stackInput.trim()] }));
      setStackInput('');
    }
  };

  const removeStack = (idx: number) => {
    setFormData(prev => ({ ...prev, stack: (prev.stack || []).filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingState('saving');
    try {
      await new Promise(r => setTimeout(r, 800));
      onSave({ ...formData, id: formData.id || Date.now().toString() } as Experience);
      setSavingState('success');
      toast.success('Modifications enregistrées');
      setTimeout(() => setSavingState('idle'), 2000);
    } catch (err) {
      setSavingState('error');
      toast.error('Échec — Réessayer');
      setTimeout(() => setSavingState('idle'), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="mb-6">
        <button type="button" onClick={onCancel} className="flex items-center text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Retour aux expériences
        </button>
      </div>

      <div className="flex-1 space-y-6 pb-8">
        <div className="bg-bg-card border border-white/5 rounded-xl p-6 space-y-6">
          <h2 className="font-space text-xl font-bold">{initialData ? 'Modifier l\'expérience' : 'Ajouter une expérience'}</h2>
          
          <div>
            <label className="block text-sm font-medium text-text-muted mb-3">Type *</label>
            <div className="flex items-center gap-4 bg-bg-primary p-1 rounded border border-white/5 inline-flex">
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, type: 'pro' }))}
                className={`flex items-center px-4 py-2 rounded text-sm font-medium transition-colors ${formData.type === 'pro' ? 'bg-accent-ocre/20 text-accent-ocre' : 'text-text-muted hover:text-text-primary'}`}
              >
                <Briefcase size={16} className="mr-2" /> PRO
              </button>
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, type: 'education' }))}
                className={`flex items-center px-4 py-2 rounded text-sm font-medium transition-colors ${formData.type === 'education' ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-text-muted hover:text-text-primary'}`}
              >
                <GraduationCap size={16} className="mr-2" /> FORMATION
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Titre *</label>
              <input type="text" name="title" required value={formData.title || ''} onChange={handleChange} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Organisation *</label>
              <input type="text" name="organization" required value={formData.organization || ''} onChange={handleChange} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Localisation</label>
              <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Date début *</label>
              <input type="text" name="start_date" required placeholder="ex: Sept 2021" value={formData.start_date || ''} onChange={handleChange} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Date fin</label>
              <input type="text" name="end_date" placeholder="ex: Présent" value={formData.end_date || ''} onChange={handleChange} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Description *</label>
            <textarea name="description" required rows={5} value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors resize-y" />
          </div>

          {formData.type === 'pro' && (
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Stack technique</label>
              <div className="w-full p-2 bg-bg-primary border border-white/10 rounded flex flex-wrap gap-2 focus-within:border-accent-cyan transition-colors">
                {(formData.stack || []).map((tech, i) => (
                  <span key={i} className="flex items-center px-2 py-1 bg-white/5 rounded text-sm text-text-primary font-mono">
                    {tech} <button type="button" onClick={() => removeStack(i)} className="ml-2 text-text-muted hover:text-red-400">&times;</button>
                  </span>
                ))}
                <input 
                  type="text" value={stackInput} onChange={e => setStackInput(e.target.value)} onKeyDown={handleStackAdd}
                  placeholder="Appuyez sur Entrée pour ajouter"
                  className="flex-1 min-w-[150px] bg-transparent outline-none text-sm text-text-primary font-mono py-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-4 z-50 bg-[#0B0F14] pt-4 border-t border-[#9BA4B5]/20 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 text-text-primary hover:bg-white/5 font-medium rounded transition-colors">Annuler</button>
        <button type="submit" disabled={savingState === 'saving'} className="px-6 py-2.5 bg-[#E08A3E] text-[#0B0F14] font-medium rounded hover:bg-[#E08A3E]/90 transition-colors disabled:opacity-70 flex items-center">
          {savingState === 'saving' && <Loader2 size={18} className="animate-spin mr-2" />}
          {savingState === 'saving' ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}
