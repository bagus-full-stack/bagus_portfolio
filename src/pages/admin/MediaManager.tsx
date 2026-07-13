import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, AlertTriangle, Image as ImageIcon, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { SupabaseService, supabase } from '../../services/supabase.service';
import { Profile } from '../../types';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { CV_CONFIG, CV_TYPES, CVType } from '../../config/cv.config';

interface CVUploadCardProps {
  config: typeof CV_CONFIG[CVType];
  currentFile?: string;
  updatedAt?: string;
  onUpload: (file: File) => void;
  onPreview: () => void;
  onDelete: () => void;
  isUploading: boolean;
  progress: number;
}

const CVUploadCard: React.FC<CVUploadCardProps> = ({
  config,
  currentFile,
  updatedAt,
  onUpload,
  onPreview,
  onDelete,
  isUploading,
  progress
}: CVUploadCardProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] } ,
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isUploading,
    onDrop: (files) => {
      if (files[0]) onUpload(files[0])
    },
    onDropRejected: () => {
      toast.error('PDF uniquement · Max 10MB')
    }
  } as any)

  return (
    <div className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-subtle)] flex flex-col h-full">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{config.langFlag}</span>
        <div>
          <h4 className="text-[var(--text-primary)] font-[Inter] text-sm font-semibold">
            {config.label}{' '}
            <span style={{ color: config.accentColor }}>
              {config.lang === 'fr' ? '(Français)' : '(English)'}
            </span>
          </h4>
          <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-xs">
            {config.filename}
          </p>
        </div>
      </div>

      {/* Fichier actuel */}
      {currentFile && (
        <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-lg mb-3 border border-[var(--border-subtle)]">
          <FileText size={14} style={{ color: config.accentColor }} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[var(--text-primary)] font-[JetBrains_Mono] text-xs truncate">
              {currentFile}
            </p>
            {updatedAt && (
              <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-[10px]">
                {updatedAt}
              </p>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={onPreview}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Prévisualiser"
            >
              <Eye size={12} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Zone upload */}
      <div className="mt-auto">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? `border-[${config.accentColor}]` : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'}
            ${isUploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="space-y-2">
              <Loader2 size={20} className="animate-spin mx-auto" style={{ color: config.accentColor }} />
              <div className="w-full h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: config.accentColor }}
                />
              </div>
              <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-xs">{progress}%</p>
            </div>
          ) : (
            <div className="space-y-1">
              <Upload size={20} className="mx-auto text-[var(--text-muted)]" />
              <p className="text-[var(--text-primary)] font-[Inter] text-xs">
                {currentFile ? 'Glisser pour remplacer' : 'Glisser le PDF ici'}
              </p>
              <p className="text-[var(--text-muted)] font-[JetBrains_Mono] text-[10px]">
                PDF · Max 10MB
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MediaManager() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // states pour l'upload d'image
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  // États pour les 4 CV
  const [uploadingCV, setUploadingCV] = useState<CVType | null>(null);
  const [cvProgress, setCvProgress] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<CVType | null>(null);
  const [cvFiles, setCvFiles] = useState<Record<CVType, { name?: string; date?: string }>>({
    fullstack_fr: {}, fullstack_en: {}, ai_fr: {}, ai_en: {}
  });

  useEffect(() => {
    let mounted = true;
    const fetchProfileData = async () => {
      const data = await SupabaseService.getProfile();
      if (mounted) {
        setProfile(data);
        if (data) {
          const filesData: any = {};
          for (const type of CV_TYPES) {
            const dbVal = data[type.dbField as keyof Profile];
            const dbDate = data[type.dbDateField as keyof Profile];
            if (dbVal && typeof dbVal === 'string') {
              filesData[type.type] = {
                name: dbVal.split('/').pop() || type.filename,
                date: dbDate ? new Date(dbDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : ''
              };
            } else {
              filesData[type.type] = {};
            }
          }
          setCvFiles(filesData);
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

  // Fonction upload générique pour les 4 CV
  const uploadCV = async (file: File, type: CVType) => {
    if (file.type !== 'application/pdf') {
      toast.error('Format PDF uniquement');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop lourd (max 10MB)');
      return;
    }

    setUploadingCV(type);
    setCvProgress(0);

    const progressInterval = setInterval(() => {
      setCvProgress(p => Math.min(p + 15, 85));
    }, 200);

    try {
      const config = CV_CONFIG[type];
      const filename = config.filename;

      const { error: uploadError } = await supabase.storage
        .from('cv')
        .upload(filename, file, {
          upsert: true,
          contentType: 'application/pdf'
        });

      if (uploadError) throw uploadError;

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .single();

      if (!existingProfile) throw new Error('Profile not found');

      const updateDate = new Date().toISOString();
      const updateField = {
        [config.dbField]: filename,
        [config.dbDateField]: updateDate
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateField)
        .eq('id', existingProfile.id);

      if (updateError) throw updateError;

      setCvProgress(100);

      const dateStr = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      setCvFiles(prev => ({
        ...prev,
        [type]: { name: filename, date: dateStr }
      }));
      toast.success(`${config.label} (${config.langFlag}) mis à jour ✅`);
    } catch (err) {
      console.error('CV upload error:', err);
      toast.error('Échec de l\'upload');
      setCvProgress(0);
    } finally {
      clearInterval(progressInterval);
      setUploadingCV(null);
    }
  };

  const previewCV = async (type: CVType) => {
    const config = CV_CONFIG[type];
    const { data, error } = await supabase
      .storage
      .from('cv')
      .createSignedUrl(config.filename, 3600);

    if (error || !data) {
      toast.error('Prévisualisation impossible');
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const deleteCV = async (type: CVType) => {
    const config = CV_CONFIG[type];
    await supabase.storage.from('cv').remove([config.filename]);

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .single();

    if (existingProfile) {
      const updateField = {
        [config.dbField]: '',
        [config.dbDateField]: null
      };
      await supabase
        .from('profiles')
        .update(updateField)
        .eq('id', existingProfile.id);
    }

    setCvFiles(prev => ({ ...prev, [type]: {} }));
    toast.success('CV supprimé');
    setConfirmDelete(null);
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

      <div className="space-y-4">
        <h3 className="text-[var(--text-primary)] font-[Space_Grotesk] font-semibold text-lg">
          CV & Documents
        </h3>

        {/* Grille 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CV_TYPES.map(config => (
            <CVUploadCard
              key={config.type}
              config={config}
              currentFile={cvFiles[config.type]?.name}
              updatedAt={cvFiles[config.type]?.date}
              onUpload={(file) => uploadCV(file, config.type)}
              onPreview={() => previewCV(config.type)}
              onDelete={() => setConfirmDelete(config.type)}
              isUploading={uploadingCV === config.type}
              progress={cvProgress}
            />
          ))}
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
          message={`Voulez-vous vraiment supprimer ce CV (${CV_CONFIG[confirmDelete].langFlag}) ? Cette action est irréversible.`}
          onConfirm={() => deleteCV(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
