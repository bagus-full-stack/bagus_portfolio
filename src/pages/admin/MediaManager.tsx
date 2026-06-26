import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, AlertTriangle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { SupabaseService, supabase } from '../../services/supabase.service';
import { Profile } from '../../types';

export function MediaManager() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // states pour l'upload d'image
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  // states pour l'upload CV
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);
  const [deletingCv, setDeletingCv] = useState(false);

  useEffect(() => {
    let mounted = true;
    SupabaseService.getProfile().then(data => {
      if (mounted) {
        setProfile(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Simuler la progression
  useEffect(() => {
    if (!isUploadingPhoto) return;
    const interval = setInterval(() => {
      setPhotoProgress(p => Math.min(p + 10, 90));
    }, 200);
    return () => clearInterval(interval);
  }, [isUploadingPhoto]);

  useEffect(() => {
    if (!isUploadingCv) return;
    const interval = setInterval(() => {
      setCvProgress(p => Math.min(p + 10, 90));
    }, 200);
    return () => clearInterval(interval);
  }, [isUploadingCv]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image dépasse la taille maximale de 2MB");
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoProgress(0);
    try {
      const ext = file.name.split('.').pop();
      const path = `profile/avatar.${ext}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      await supabase
        .from('profiles')
        .update({ photo_url: urlData.publicUrl })
        .eq('id', profile.id);

      setPhotoProgress(100);
      setProfile(prev => prev ? { ...prev, photo_url: urlData.publicUrl } : prev);
      toast.success('Photo mise à jour');
    } catch (err) {
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setTimeout(() => {
        setIsUploadingPhoto(false);
        setPhotoProgress(0);
      }, 500);
    }
  };

  const handleDeletePhoto = async () => {
    if (!profile) return;
    try {
      await supabase
        .from('profiles')
        .update({ photo_url: null })
        .eq('id', profile.id);
        
      setProfile(prev => prev ? { ...prev, photo_url: undefined } : prev);
      toast.success('Photo supprimée');
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.type !== 'application/pdf') {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }

    setIsUploadingCv(true);
    setCvProgress(0);
    try {
      const { error } = await supabase.storage
        .from('cv')
        .upload('cv.pdf', file, {
          upsert: true,
          contentType: 'application/pdf'
        });

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ cv_url: 'cv.pdf' })
        .eq('id', profile.id);

      setCvProgress(100);
      setProfile(prev => prev ? { ...prev, cv_url: 'cv.pdf' } : prev);
      toast.success('CV mis à jour');
    } catch (err) {
      toast.error("Erreur lors de l'upload du CV");
    } finally {
      setTimeout(() => {
        setIsUploadingCv(false);
        setCvProgress(0);
      }, 500);
    }
  };

  const handleDeleteCv = async () => {
    if (!profile) return;
    try {
      await supabase
        .from('profiles')
        .update({ cv_url: null })
        .eq('id', profile.id);

      setProfile(prev => prev ? { ...prev, cv_url: undefined } : prev);
      toast.success('CV supprimé');
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingCv(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-bg-card border border-white/5 rounded-xl"></div>
        <div className="h-64 bg-bg-card border border-white/5 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="font-space text-2xl font-bold text-text-primary mb-2">Médias</h2>
        <p className="text-text-muted">Gérez vos fichiers et documents publics.</p>
      </div>

      {/* Section 1: Photo de profil */}
      <div className="bg-bg-card border border-white/5 rounded-xl p-6">
        <h3 className="font-space text-lg font-semibold text-accent-ocre mb-6">Photo de profil</h3>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            <div className="w-[120px] h-[120px] rounded-full bg-bg-primary border border-white/10 flex items-center justify-center overflow-hidden">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={40} className="text-white/20" />
              )}
            </div>
            {profile.photo_url && (
              <button onClick={() => setDeletingPhoto(true)} className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
                Supprimer la photo
              </button>
            )}
          </div>

          <div className="flex-1 w-full">
            <label className="block w-full border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden">
              <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
              <Upload size={32} className="mx-auto text-accent-cyan mb-3" />
              <p className="font-medium text-text-primary mb-1">Cliquez ou glissez une image ici</p>
              <p className="text-sm text-text-muted">JPG, PNG ou WebP — 2MB max</p>

              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-bg-card/90 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="w-full max-w-xs h-2 bg-bg-primary rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-accent-cyan transition-all duration-200" style={{ width: `${photoProgress}%` }} />
                  </div>
                  <span className="text-xs font-mono text-accent-cyan">{photoProgress}%</span>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Section 2: CV PDF */}
      <div className="bg-bg-card border border-white/5 rounded-xl p-6">
        <h3 className="font-space text-lg font-semibold text-accent-ocre mb-6">CV (Curriculum Vitae)</h3>
        
        {profile.cv_url ? (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-bg-primary border border-white/10 rounded-lg mb-6 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-text-muted" />
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-text-primary truncate">cv_assami_2026.pdf</p>
                <p className="text-xs text-text-muted font-mono">Dernière mise à jour : 12/06/2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a href={profile.cv_url} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-text-primary font-medium rounded transition-colors flex-1 sm:flex-none justify-center">
                <ExternalLink size={16} className="mr-2" /> Prévisualiser
              </a>
              <button onClick={() => setDeletingCv(true)} className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-accent-ocre/10 border border-accent-ocre/20 rounded-lg text-accent-ocre text-sm">
            Vous n'avez pas encore uploadé de CV.
          </div>
        )}

        <label className="block w-full border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden">
          <input type="file" accept="application/pdf" className="hidden" onChange={handleCvUpload} disabled={isUploadingCv} />
          <Upload size={32} className="mx-auto text-text-muted mb-3" />
          <p className="font-medium text-text-primary mb-1">{profile.cv_url ? 'Remplacer le CV actuel' : 'Uploader un nouveau CV'}</p>
          <p className="text-sm text-text-muted">Format PDF uniquement</p>

          {isUploadingCv && (
            <div className="absolute inset-0 bg-bg-card/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-full max-w-xs h-2 bg-bg-primary rounded-full overflow-hidden mb-2">
                <div className="h-full bg-accent-cyan transition-all duration-200" style={{ width: `${cvProgress}%` }} />
              </div>
              <span className="text-xs font-mono text-accent-cyan">{cvProgress}%</span>
            </div>
          )}
        </label>
      </div>

      {/* Modals Suppression */}
      {deletingPhoto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-bg-card border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center text-red-400 mb-4">
              <AlertTriangle size={24} className="mr-3" />
              <h3 className="font-space font-semibold text-lg">Confirmer la suppression</h3>
            </div>
            <p className="text-text-muted mb-6">Cette action est irréversible. Voulez-vous vraiment supprimer votre photo de profil ?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingPhoto(false)} className="px-4 py-2 text-text-primary hover:bg-white/5 rounded transition-colors">Annuler</button>
              <button onClick={handleDeletePhoto} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded font-medium transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {deletingCv && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-bg-card border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center text-red-400 mb-4">
              <AlertTriangle size={24} className="mr-3" />
              <h3 className="font-space font-semibold text-lg">Confirmer la suppression</h3>
            </div>
            <p className="text-text-muted mb-6">Cette action est irréversible. Voulez-vous vraiment supprimer ce CV ?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingCv(false)} className="px-4 py-2 text-text-primary hover:bg-white/5 rounded transition-colors">Annuler</button>
              <button onClick={handleDeleteCv} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded font-medium transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
