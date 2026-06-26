import React, { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Edit2, Trash2, ArrowLeft, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Certification } from '../../types';
import { SupabaseService, supabase } from '../../services/supabase.service';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export function EditCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCertifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('date', { ascending: false });
    if (!error) setCertifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', deletingId);
      if (error) throw error;
      toast.success('Certification supprimée');
      await fetchCertifications();
    } catch (e) {
      toast.error('Échec de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (cert: Certification) => {
    try {
      const payload = {
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date,
        verify_url: cert.verify_url
      };
      if (cert.id) {
        const { error } = await supabase
          .from('certifications')
          .update(payload)
          .eq('id', cert.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('certifications')
          .insert(payload);
        if (error) throw error;
      }
      toast.success('Certification enregistrée');
      await fetchCertifications();
      setIsAdding(false);
      setEditingId(null);
    } catch {
      toast.error('Échec de la sauvegarde');
      throw new Error('Save failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-bg-card rounded mb-8"></div>
        {[1, 2].map(i => <div key={i} className="h-24 bg-bg-card border border-white/5 rounded-xl"></div>)}
      </div>
    );
  }

  if (isAdding || editingId) {
    const certToEdit = editingId ? certifications.find(c => c.id === editingId) : null;
    return (
      <CertificationForm 
        initialData={certToEdit} 
        onCancel={() => { setIsAdding(false); setEditingId(null); }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-space text-2xl font-bold text-text-primary">Certifications</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-accent-ocre text-bg-primary font-medium rounded hover:bg-accent-ocre/90 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Ajouter
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="bg-bg-card border border-white/5 rounded-xl p-12 text-center text-text-muted">
          <Award size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-inter mb-2">Aucune certification — Ajoutez uniquement des certifications vérifiables</p>
          <button onClick={() => setIsAdding(true)} className="text-accent-cyan hover:underline">Ajouter maintenant</button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map(cert => (
            <div key={cert.id} className="bg-bg-card border border-white/5 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-white/10 transition-colors">
              <div className="w-full sm:w-auto">
                <h3 className="font-space font-semibold text-lg text-text-primary mb-1">{cert.name}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                  <span className="font-medium">{cert.issuer}</span>
                  <span className="text-white/20 hidden sm:inline">•</span>
                  <span className="font-mono">{cert.date}</span>
                  {cert.verify_url && (
                    <>
                      <span className="text-white/20 hidden sm:inline">•</span>
                      <a href={cert.verify_url} target="_blank" rel="noreferrer" className="text-accent-cyan hover:underline font-mono">Lien vérification</a>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                <button onClick={() => setEditingId(cert.id)} className="p-2 text-text-muted hover:text-accent-cyan hover:bg-white/5 rounded transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => setDeletingId(cert.id)} className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
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

function CertificationForm({ initialData, onCancel, onSave }: { initialData: Certification | null, onCancel: () => void, onSave: (c: Certification) => void }) {
  const [formData, setFormData] = useState<Partial<Certification>>(initialData || {});
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingState('saving');
    try {
      await onSave({ ...formData } as Certification);
    } catch (err) {
      setSavingState('error');
      setTimeout(() => setSavingState('idle'), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="mb-6">
        <button type="button" onClick={onCancel} className="flex items-center text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Retour aux certifications
        </button>
      </div>

      <div className="flex-1 space-y-6 pb-8">
        <div className="bg-bg-card border border-white/5 rounded-xl p-6 space-y-6">
          <h2 className="font-space text-xl font-bold">{initialData ? 'Modifier la certification' : 'Ajouter une certification'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Nom de la certification *</label>
              <input type="text" name="name" required value={formData.name || ''} onChange={handleChange} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Organisme émetteur *</label>
              <input type="text" name="issuer" required value={formData.issuer || ''} onChange={handleChange} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Date d'obtention *</label>
              <input type="text" name="date" required placeholder="ex: Juin 2024" value={formData.date || ''} onChange={handleChange} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">URL de vérification *</label>
              <input type="url" name="verify_url" required placeholder="https://" value={formData.verify_url || ''} onChange={handleChange} className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" />
            </div>
          </div>
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
