import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, AlertTriangle, ExternalLink, Image as ImageIcon, Eye, Loader2, Code, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { SupabaseService, supabase } from '../../services/supabase.service';
import { Profile } from '../../types';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export function MediaManager() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // states pour l'upload d'image
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  // États pour les 2 CV
  const [cvFullStackName, setCvFullStackName] = useState('')
  const [cvFullStackDate, setCvFullStackDate] = useState('')
  const [cvAIName, setCvAIName] = useState('')
  const [cvAIDate, setCvAIDate] = useState('')
  const [uploadingCV, setUploadingCV] = useState<'fullstack' | 'ai' | null>(null)
  const [cvProgress, setCvProgress] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState<'fullstack' | 'ai' | null>(null)

  useEffect(() => {
    let mounted = true;
    const fetchProfileData = async () => {
      const data = await SupabaseService.getProfile();
      if (mounted) {
        setProfile(data);
        if (data) {
          if (data.cv_fullstack_url) {
            setCvFullStackName(data.cv_fullstack_url.split('/').pop() || 'cv-fullstack.pdf');
            setCvFullStackDate(
              data.cv_fullstack_updated_at
                ? new Date(data.cv_fullstack_updated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : ''
            );
          }
          if (data.cv_ai_url) {
            setCvAIName(data.cv_ai_url.split('/').pop() || 'cv-ai-engineer.pdf');
            setCvAIDate(
              data.cv_ai_updated_at
                ? new Date(data.cv_ai_updated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : ''
            );
          }
        }
        setLoading(false);
      }
    };
    fetchProfileData();
    return () => { mounted = false; };
  }, []);

  // Simuler la progression (photo)
  useEffect(() => {
    if (!isUploadingPhoto) return;
    const interval = setInterval(() => {
      setPhotoProgress(p => Math.min(p + 10, 90));
    }, 200);
    return () => clearInterval(interval);
  }, [isUploadingPhoto]);

  const uploadAvatar = async (file: File) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image dépasse la taille maximale de 2MB");
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoProgress(0);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `profile/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .single();

      if (fetchError || !existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            name: 'Assami Baga',
            title: 'Full Stack & AI Engineer',
            photo_url: publicUrl
          });
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ photo_url: publicUrl })
          .eq('id', existingProfile.id);

        if (updateError) throw updateError;
      }

      setPhotoProgress(100);
      setProfile(prev => prev ? { ...prev, photo_url: publicUrl } : prev);
      toast.success('Photo mise à jour');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error("Échec de l'upload");
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
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .single();
        
      if (!existingProfile) return;

      await supabase
        .from('profiles')
        .update({ photo_url: null })
        .eq('id', existingProfile.id);
        
      setProfile(prev => prev ? { ...prev, photo_url: undefined } : prev);
      toast.success('Photo supprimée');
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingPhoto(false);
    }
  };

  // Fonction upload générique pour les 2 CV
  const uploadCV = async (
    file: File,
    type: 'fullstack' | 'ai'
  ) => {
    // Vérifier que c'est bien un PDF
    if (file.type !== 'application/pdf') {
      toast.error('Format PDF uniquement')
      return
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop lourd (max 10MB)')
      return
    }

    setUploadingCV(type)
    setCvProgress(0)

    // Simuler la progression
    const progressInterval = setInterval(() => {
      setCvProgress(p => Math.min(p + 15, 85))
    }, 200)

    try {
      const filename = type === 'fullstack'
        ? 'cv-fullstack.pdf'
        : 'cv-ai-engineer.pdf'

      // Upload dans le bucket cv privé
      const { error: uploadError } =
        await supabase.storage
          .from('cv')
          .upload(filename, file, {
            upsert: true,
            contentType: 'application/pdf'
          })

      if (uploadError) throw uploadError

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .single();

      if (!existingProfile) throw new Error('Profile not found');

      // Mettre à jour le profil
      const updateField = type === 'fullstack'
        ? {
            cv_fullstack_url: filename,
            cv_fullstack_updated_at: new Date().toISOString()
          }
        : {
            cv_ai_url: filename,
            cv_ai_updated_at: new Date().toISOString()
          }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateField)
        .eq('id', existingProfile.id)

      if (updateError) throw updateError

      setCvProgress(100)

      // Mettre à jour l'affichage
      const dateStr = new Date()
        .toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })

      if (type === 'fullstack') {
        setCvFullStackName(filename)
        setCvFullStackDate(dateStr)
        toast.success('CV Full Stack mis à jour ✅')
      } else {
        setCvAIName(filename)
        setCvAIDate(dateStr)
        toast.success('CV AI Engineer mis à jour ✅')
      }

    } catch (err) {
      console.error('CV upload error:', err)
      toast.error('Échec de l\'upload')
      setCvProgress(0)
    } finally {
      clearInterval(progressInterval)
      setUploadingCV(null)
    }
  }

  // Prévisualiser un CV via URL signée
  const previewCV = async (
    type: 'fullstack' | 'ai'
  ) => {
    const filename = type === 'fullstack'
      ? 'cv-fullstack.pdf'
      : 'cv-ai-engineer.pdf'

    const { data, error } = await supabase
      .storage
      .from('cv')
      .createSignedUrl(filename, 3600)

    if (error || !data) {
      toast.error('Prévisualisation impossible')
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  // Supprimer un CV
  const deleteCV = async (
    type: 'fullstack' | 'ai'
  ) => {
    const filename = type === 'fullstack'
      ? 'cv-fullstack.pdf'
      : 'cv-ai-engineer.pdf'

    await supabase.storage
      .from('cv')
      .remove([filename])

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .single();

    if (existingProfile) {
      const updateField = type === 'fullstack'
        ? { cv_fullstack_url: '', cv_fullstack_updated_at: null }
        : { cv_ai_url: '', cv_ai_updated_at: null }

      await supabase
        .from('profiles')
        .update(updateField)
        .eq('id', existingProfile.id)
    }

    if (type === 'fullstack') {
      setCvFullStackName('')
      setCvFullStackDate('')
    } else {
      setCvAIName('')
      setCvAIDate('')
    }

    toast.success('CV supprimé')
    setConfirmDelete(null)
  }

  // Hook dropzone réutilisable
  const useCVDropzone = (type: 'fullstack' | 'ai') =>
    useDropzone({
      accept: { 'application/pdf': ['.pdf'] } as any,
      maxSize: 10 * 1024 * 1024,
      multiple: false,
      disabled: uploadingCV !== null,
      onDrop: (files) => {
        if (files[0]) uploadCV(files[0], type)
      },
      onDropRejected: () => {
        toast.error('PDF uniquement, max 10MB')
      }
    })

  const fullStackDropzone = useCVDropzone('fullstack')
  const aiDropzone = useCVDropzone('ai')

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
                  : 'border-[var(--border-subtle)]/30 hover:border-[var(--border-subtle)]/60'
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
                  <Upload className="mx-auto mb-3 text-[var(--text-muted)]" size={32} />
                  <p className="text-[var(--text-primary)] font-[Inter]">
                    Glissez une photo ou{' '}
                    <span className="text-[#E08A3E] underline">
                      cliquez pour parcourir
                    </span>
                  </p>
                  <p className="text-[var(--text-muted)] text-sm mt-1 font-[JetBrains_Mono]">
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

      {/* Section CV Full Stack */}
      <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        {/* En-tête */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#E08A3E]/15 border border-[#E08A3E]/30 flex items-center justify-center">
            <Code size={18} className="text-[#E08A3E]" />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] font-[Space_Grotesk] font-semibold">
              CV Full Stack Engineer
            </h3>
            <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-xs">
              Angular · React · NestJS · Spring Boot
            </p>
          </div>
        </div>

        {/* Fichier actuel */}
        {cvFullStackName && (
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-lg mb-4 border border-[var(--border-subtle)]">
            <FileText size={16} className="text-[#E08A3E] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[var(--text-primary)] font-[JetBrains_Mono] text-sm truncate">
                {cvFullStackName}
              </p>
              {cvFullStackDate && (
                <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-xs">
                  Mis à jour le {cvFullStackDate}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => previewCV('fullstack')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors font-[Inter]"
              >
                <Eye size={12} />
                Voir
              </button>
              <button
                onClick={() => setConfirmDelete('fullstack')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-[Inter]"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Zone drag-and-drop */}
        <div
          {...fullStackDropzone.getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${fullStackDropzone.isDragActive ? 'border-[#E08A3E] bg-[#E08A3E]/10' : 'border-[var(--border-subtle)] hover:border-[#E08A3E]/50'}
            ${uploadingCV === 'fullstack' ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          <input {...fullStackDropzone.getInputProps()} />

          {uploadingCV === 'fullstack' ? (
            <div className="space-y-3">
              <Loader2 size={24} className="text-[#E08A3E] animate-spin mx-auto" />
              <p className="text-[var(--text-muted)] font-[Inter] text-sm">Upload en cours...</p>
              <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-[#E08A3E] rounded-full transition-all duration-300" style={{ width: `${cvProgress}%` }} />
              </div>
              <p className="text-[#E08A3E] font-[JetBrains_Mono] text-xs">{cvProgress}%</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={24} className="text-[var(--text-muted)] mx-auto" />
              <p className="text-[var(--text-primary)] font-[Inter] text-sm">
                {cvFullStackName ? 'Glissez pour remplacer' : 'Glissez le CV Full Stack ici'}
              </p>
              <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-xs">
                PDF uniquement · Max 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section CV AI Engineer */}
      <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        {/* En-tête */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center">
            <Brain size={18} className="text-[#2DD4BF]" />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] font-[Space_Grotesk] font-semibold">
              CV AI Engineer
            </h3>
            <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-xs">
              PyTorch · YOLO · HuggingFace
            </p>
          </div>
        </div>

        {/* Fichier actuel */}
        {cvAIName && (
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-lg mb-4 border border-[var(--border-subtle)]">
            <FileText size={16} className="text-[#2DD4BF] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[var(--text-primary)] font-[JetBrains_Mono] text-sm truncate">
                {cvAIName}
              </p>
              {cvAIDate && (
                <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-xs">
                  Mis à jour le {cvAIDate}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => previewCV('ai')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors font-[Inter]"
              >
                <Eye size={12} />
                Voir
              </button>
              <button
                onClick={() => setConfirmDelete('ai')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-[Inter]"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Zone drag-and-drop */}
        <div
          {...aiDropzone.getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${aiDropzone.isDragActive ? 'border-[#2DD4BF] bg-[#2DD4BF]/10' : 'border-[var(--border-subtle)] hover:border-[#2DD4BF]/50'}
            ${uploadingCV === 'ai' ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          <input {...aiDropzone.getInputProps()} />

          {uploadingCV === 'ai' ? (
            <div className="space-y-3">
              <Loader2 size={24} className="text-[#2DD4BF] animate-spin mx-auto" />
              <p className="text-[var(--text-muted)] font-[Inter] text-sm">Upload en cours...</p>
              <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-[#2DD4BF] rounded-full transition-all duration-300" style={{ width: `${cvProgress}%` }} />
              </div>
              <p className="text-[#2DD4BF] font-[JetBrains_Mono] text-xs">{cvProgress}%</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={24} className="text-[var(--text-muted)] mx-auto" />
              <p className="text-[var(--text-primary)] font-[Inter] text-sm">
                {cvAIName ? 'Glissez pour remplacer' : 'Glissez le CV AI Engineer ici'}
              </p>
              <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-xs">
                PDF uniquement · Max 10MB
              </p>
            </div>
          )}
        </div>
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

      {confirmDelete && (
        <ConfirmModal
          isOpen={true}
          title="Supprimer le CV"
          message={`Supprimer le CV ${confirmDelete === 'fullstack' ? 'Full Stack' : 'AI Engineer'} ? Cette action est irréversible.`}
          onConfirm={() => deleteCV(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
