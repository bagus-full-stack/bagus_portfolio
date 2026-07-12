import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase.service';
import { Loader2, Plus, Copy, Edit2, Trash2, Link as LinkIcon, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ShortUrl {
  id: string;
  slug: string;
  target_url: string;
  label: string;
  clicks: number;
  active: boolean;
  created_at: string;
}

export default function ShortUrlsManager() {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<ShortUrl | null>(null);

  // Form state
  const [slug, setSlug] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [label, setLabel] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('short_urls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des liens');
    } else {
      setUrls(data || []);
    }
    setLoading(false);
  };

  const validateSlug = (s: string) => {
    if (!s) return 'Le slug est requis';
    if (!/^[a-z0-9-]+$/.test(s)) {
      return 'Minuscules, chiffres et tirets uniquement';
    }
    if (s.length < 2) return 'Minimum 2 caractères';
    if (s.length > 20) return 'Maximum 20 caractères';
    return null;
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase();
    setSlug(newSlug);
    setSlugError(validateSlug(newSlug));
  };

  const openModal = (url?: ShortUrl) => {
    if (url) {
      setEditingUrl(url);
      setSlug(url.slug);
      setTargetUrl(url.target_url);
      setLabel(url.label || '');
      setActive(url.active);
      setSlugError(null);
    } else {
      setEditingUrl(null);
      setSlug('');
      setTargetUrl('');
      setLabel('');
      setActive(true);
      setSlugError(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateSlug(slug);
    if (error) {
      setSlugError(error);
      return;
    }
    if (!targetUrl) {
      toast.error('L\'URL de destination est requise');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slug,
        target_url: targetUrl,
        label,
        active
      };

      if (editingUrl) {
        const { error: updateError } = await supabase
          .from('short_urls')
          .update(payload)
          .eq('id', editingUrl.id);
        
        if (updateError) throw updateError;
        toast.success('Lien mis à jour avec succès');
      } else {
        const { error: insertError } = await supabase
          .from('short_urls')
          .insert([payload]);
        
        if (insertError) throw insertError;
        toast.success('Lien créé avec succès');
      }

      closeModal();
      fetchUrls();
    } catch (err: any) {
      if (err.code === '23505') {
        setSlugError('Ce slug est déjà utilisé');
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce lien court ?')) {
      const { error } = await supabase
        .from('short_urls')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error('Erreur lors de la suppression');
      } else {
        toast.success('Lien supprimé');
        fetchUrls();
      }
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('short_urls')
      .update({ active: !currentActive })
      .eq('id', id);
    
    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success(currentActive ? 'Lien désactivé' : 'Lien activé');
      fetchUrls();
    }
  };

  const copyToClipboard = (slug: string) => {
    navigator.clipboard.writeText(`https://assami.dev/s/${slug}`);
    toast.success('Lien copié !');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-accent-cyan" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-space text-text-primary">Liens courts</h1>
          <p className="text-text-muted mt-2 font-inter">Gérez vos URLs raccourcies</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-accent-ocre hover:bg-accent-ocre/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Créer un lien
        </button>
      </div>

      <div className="bg-bg-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="py-4 px-6 font-medium text-text-muted font-space text-sm">Lien court</th>
                <th className="py-4 px-6 font-medium text-text-muted font-space text-sm">Destination</th>
                <th className="py-4 px-6 font-medium text-text-muted font-space text-sm">Label</th>
                <th className="py-4 px-6 font-medium text-text-muted font-space text-sm">Clics</th>
                <th className="py-4 px-6 font-medium text-text-muted font-space text-sm">Statut</th>
                <th className="py-4 px-6 font-medium text-text-muted font-space text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {urls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    Aucun lien court créé
                  </td>
                </tr>
              ) : (
                urls.map((url) => (
                  <tr key={url.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-accent-cyan text-sm">
                          assami.dev/s/{url.slug}
                        </span>
                        <button
                          onClick={() => copyToClipboard(url.slug)}
                          className="text-text-muted hover:text-text-primary transition-colors"
                          title="Copier le lien"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-text-muted font-inter text-sm truncate max-w-[200px] block" title={url.target_url}>
                        {url.target_url}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {url.label || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-accent-ocre text-sm">
                        {url.clicks}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${url.active ? 'bg-[#2DD4BF]/20 text-[#2DD4BF]' : 'bg-[#8B94A3]/20 text-[#8B94A3]'}`}>
                        {url.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => toggleActive(url.id, url.active)}
                          className="text-text-muted hover:text-text-primary transition-colors"
                          title={url.active ? 'Désactiver' : 'Activer'}
                        >
                          {url.active ? <X size={16} /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => openModal(url)}
                          className="text-text-muted hover:text-accent-cyan transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(url.id)}
                          className="text-text-muted hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-card border border-white/10 rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-space text-text-primary">
                {editingUrl ? 'Modifier le lien' : 'Nouveau lien court'}
              </h3>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  Slug (nom du lien) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted text-sm pointer-events-none">
                    assami.dev/s/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    className={`w-full pl-28 bg-white/5 border ${slugError ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-cyan`}
                    placeholder="mon-lien"
                    required
                  />
                </div>
                {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  URL de destination *
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-cyan"
                  placeholder="https://..."
                  required
                />
                <p className="text-xs text-text-muted mt-1">Interne (/page) ou externe (https://...)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  Label (optionnel)
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-cyan"
                  placeholder="Ex: Mon Profil LinkedIn"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-accent-cyan focus:ring-accent-cyan"
                />
                <label htmlFor="active" className="text-sm text-text-primary">
                  Lien actif
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || !!slugError}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-medium hover:bg-accent-cyan/90 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
