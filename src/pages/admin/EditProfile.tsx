import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Profile } from '../../types';
import { SupabaseService, supabase } from '../../services/supabase.service';
import { useDropzone } from 'react-dropzone';
import BilingualField from '../../components/admin/BilingualField';
import useProfileId from '../../hooks/useProfileId';

export function EditProfile() {
  const profileId = useProfileId();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    let mounted = true;
    SupabaseService.getProfile().then(data => {
      if (mounted) {
        setProfile(data);
        setFormData(data || {
          name: '', title: '', bio: '', location: '', email: '', linkedin_url: '', github_url: '', calendly_url: ''
        });
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const dropzoneConfig: any = {
    accept: { 'image/*': ['.jpg', '.png', '.webp'] },
    maxSize: 2 * 1024 * 1024, // 2MB
    onDrop: async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      try {
        const ext = file.name.split('.').pop();
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(`profile.${ext}`, file, { upsert: true });
          
        if (error) throw error;
        
        // Obtenir l'URL public
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`profile.${ext}`);
        setFormData(prev => ({ ...prev, photo_url: publicUrl }));
        toast.success('Image téléchargée avec succès');
      } catch (err) {
        toast.error('Erreur lors du téléchargement de l\'image');
      }
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.title) {
      toast.error('Veuillez remplir les champs obligatoires.');
      return;
    }
    if (!profileId) {
      toast.error('ID de profil non trouvé. Veuillez réessayer.');
      return;
    }
    setSavingState('saving');
    try {
      const { id, created_at, updated_at, ...updateData } = formData as any;
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId);
      if (error) throw error;
      setSavingState('success');
      toast.success('Modifications enregistrées');
      setTimeout(() => setSavingState('idle'), 2000);
    } catch (error) {
      console.error(error);
      setSavingState('error');
      toast.error('Échec — Réessayer', {
        action: { label: 'Réessayer', onClick: () => handleSubmit(e as any) }
      });
      setTimeout(() => setSavingState('idle'), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-32 bg-bg-card border border-white/5 rounded-xl"></div>
        <div className="h-64 bg-bg-card border border-white/5 rounded-xl"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex-1 space-y-8 pb-8">
        
        <div className="bg-bg-card border border-white/5 rounded-xl p-6">
          <h2 className="font-space text-lg font-semibold mb-6 text-accent-ocre">Photo de profil</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-bg-primary border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-text-muted font-space text-2xl font-bold">{formData.name?.charAt(0) || 'A'}</span>
              )}
            </div>
            <div 
              {...getRootProps()} 
              className={`flex-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-[#E08A3E] bg-[#E08A3E]/10' 
                  : 'border-[var(--border-subtle)]/30 hover:border-[var(--border-subtle)]'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={24} className={`mx-auto mb-2 ${isDragActive ? 'text-[#E08A3E]' : 'text-accent-cyan'}`} />
              {isDragActive ? (
                <p className="text-sm font-medium text-text-primary">Déposez l'image ici...</p>
              ) : (
                <p className="text-sm font-medium text-text-primary">Glissez une photo ou cliquez pour parcourir</p>
              )}
              <p className="text-xs text-text-muted mt-1">PNG, JPG, WEBP jusqu'à 2MB</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-white/5 rounded-xl p-6 space-y-6">
          <h2 className="font-space text-lg font-semibold text-accent-ocre">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Nom complet *</label>
              <input 
                type="text" name="name" required value={formData.name || ''} onChange={handleChange}
                className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" 
              />
            </div>
            <div>
              <BilingualField
                label="Titre professionnel *"
                fieldFr={formData.title_fr || formData.title || ''}
                fieldEn={formData.title_en || ''}
                onChangeFr={v => setFormData({ ...formData, title_fr: v, title: v })}
                onChangeEn={v => setFormData({ ...formData, title_en: v })}
              />
            </div>
          </div>

          <div>
            <BilingualField
              label="Bio *"
              fieldFr={formData.bio_full_fr || formData.bio || ''}
              fieldEn={formData.bio_full_en || ''}
              onChangeFr={v => setFormData({ ...formData, bio_full_fr: v, bio: v })}
              onChangeEn={v => setFormData({ ...formData, bio_full_en: v })}
              multiline={true}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Localisation</label>
              <input 
                type="text" name="location" value={formData.location || ''} onChange={handleChange}
                className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Email professionnel</label>
              <input 
                type="email" name="email" value={formData.email || ''} onChange={handleChange}
                className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" 
              />
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-white/5 rounded-xl p-6 space-y-6">
          <h2 className="font-space text-lg font-semibold text-accent-ocre">Liens et CV</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">LinkedIn</label>
              <input 
                type="url" name="linkedin_url" value={formData.linkedin_url || ''} onChange={handleChange}
                className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">GitHub</label>
              <input 
                type="url" name="github_url" value={formData.github_url || ''} onChange={handleChange}
                className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Calendly</label>
              <input 
                type="url" name="calendly_url" value={formData.calendly_url || ''} onChange={handleChange}
                className="w-full px-4 py-2 bg-bg-primary border border-white/10 rounded text-text-primary focus:border-accent-cyan outline-none transition-colors" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">CV PDF</label>
            <div className="flex items-center gap-4 p-4 border border-white/10 rounded bg-bg-primary">
              <FileText className="text-text-muted" size={24} />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{formData.cv_url ? 'cv_actuel.pdf' : 'Aucun CV téléchargé'}</p>
              </div>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                id="cv-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    toast.loading('Téléchargement du CV...', { id: 'cv-upload' });
                    const { error } = await supabase.storage
                      .from('cv')
                      .upload(`cv.pdf`, file, { upsert: true });
                      
                    if (error) throw error;
                    
                    const { data: { publicUrl } } = supabase.storage.from('cv').getPublicUrl(`cv.pdf`);
                    setFormData(prev => ({ ...prev, cv_url: publicUrl }));
                    toast.success('CV téléchargé avec succès', { id: 'cv-upload' });
                  } catch (err) {
                    toast.error('Erreur lors du téléchargement du CV', { id: 'cv-upload' });
                  }
                }}
              />
              <label 
                htmlFor="cv-upload"
                className="cursor-pointer px-4 py-2 bg-white/5 hover:bg-white/10 text-sm font-medium rounded transition-colors"
              >
                Remplacer
              </label>
            </div>
          </div>
        </div>

      </div>

      <div className="sticky bottom-4 z-50 bg-[var(--bg-primary)] pt-4 border-t border-[var(--border-subtle)]/20 flex justify-end gap-3">
        <button 
          type="submit" 
          disabled={savingState === 'saving'}
          className="px-6 py-2.5 bg-[#E08A3E] text-[#0B0F14] font-medium rounded hover:bg-[#E08A3E]/90 transition-colors disabled:opacity-70 flex items-center"
        >
          {savingState === 'saving' && <Loader2 size={18} className="animate-spin mr-2" />}
          {savingState === 'saving' ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}
