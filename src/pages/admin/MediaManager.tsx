import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, AlertTriangle, ExternalLink, Image as ImageIcon, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
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
  const [cvFileName, setCvFileName] = useState('cv.pdf');
  const [cvUpdatedAt, setCvUpdatedAt] = useState('Date inconnue');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchCVInfo = async () => {
      const data = await SupabaseService.getProfile();
      if (mounted) {
        setProfile(data);
        if (data?.cv_url) {
          setCvFileName(data.cv_url.split('/').pop() || 'cv.pdf');
          setCvUpdatedAt(data.cv_updated_at
            ? new Date(data.cv_updated_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            : 'Date inconnue');
        }
        setLoading(false);
      }
    };
    fetchCVInfo();
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

  const uploadAvatar = async (file: File) => {
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

  const dropzoneConfig: any = {
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 2 * 1024 * 1024,
    multiple: false,
    onDrop: (files: File[]) => uploadAvatar(files[0]),
    onDropRejected: (fileRejections: any[]) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast.error('Fichier trop lourd (max 2MB)');
      } else {
        toast.error('Format non accepté (jpg, png, webp)');
      }
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig);

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

  const handlePreviewCV = async () => {
    setPreviewLoading(true);
    try {
      const { data, error } = await supabase
        .storage
        .from('cv') // bucket PRIVÉ
        .createSignedUrl('cv.pdf', 3600); // valide 1h

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch {
      toast.error('Impossible de prévisualiser le CV');
    } finally {
      setPreviewLoading(false);
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

          <div className="flex-1 w-full relative overflow-hidden">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-8
                text-center cursor-pointer transition-all duration-200
                ${isDragActive
                  ? 'border-[#E08A3E] bg-[#E08A3E]/10 scale-[1.02]'
                  : 'border-[#8B94A3]/30 hover:border-[#8B94A3]/60'
                }
              `}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-[#E08A3E] font-[Inter]">
                  Déposez l'image ici...
                </p>
              ) : (
                <>
                  <Upload className="mx-auto mb-3 text-[#8B94A3]" size={32} />
                  <p className="text-[#EDEFF2] font-[Inter]">
                    Glissez une photo ou{' '}
                    <span className="text-[#E08A3E] underline">
                      cliquez pour parcourir
                    </span>
                  </p>
                  <p className="text-[#8B94A3] text-sm mt-1 font-[JetBrains_Mono]">
                    JPG, PNG, WebP — 2MB max
                  </p>
                </>
              )}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-bg-card/90 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="w-full max-w-xs h-2 bg-bg-primary rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-accent-cyan transition-all duration-200" style={{ width: `${photoProgress}%` }} />
                  </div>
                  <span className="text-xs font-mono text-accent-cyan">{photoProgress}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: CV PDF */}
      <div className="bg-bg-card border border-white/5 rounded-xl p-6">
        <h3 className="font-space text-lg font-semibold text-accent-ocre mb-6">CV (Curriculum Vitae)</h3>
        
        {profile.cv_url ? (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-bg-primary border border-white/10 rounded-lg mb-6 gap-4">
            <div className="flex items-center gap-3 p-3 bg-[#0B0F14] rounded-lg w-full sm:w-auto">
              <FileText size={16} className="text-[#2DD4BF]" />
              <div>
                <p className="text-[#EDEFF2] font-[JetBrains_Mono] text-sm">
                  {cvFileName}
                </p>
                <p className="text-[#8B94A3] font-[JetBrains_Mono] text-xs">
                  Mis à jour le {cvUpdatedAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handlePreviewCV}
                disabled={previewLoading}
                className="flex items-center gap-2 px-4 py-2 border border-[#8B94A3]/30 rounded-lg text-[#8B94A3] hover:text-[#EDEFF2] hover:border-[#8B94A3] transition-colors disabled:opacity-50 font-[Inter] text-sm"
              >
                {previewLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                Prévisualiser
              </button>
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
