import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Mail, Check, AlertTriangle, Reply } from 'lucide-react';
import { toast } from 'sonner';
import { Message } from '../../types';
import { SupabaseService } from '../../services/supabase.service';

export function MessageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadMessage(id);
    }
  }, [id]);

  const loadMessage = async (msgId: string) => {
    setLoading(true);
    try {
      const data = await SupabaseService.getMessageById(msgId);
      if (data) {
        setMessage(data);
        if (!data.read) {
          // Mark as read automatically when opened
          await SupabaseService.updateMessageReadStatus(msgId, true);
          setMessage({ ...data, read: true });
        }
      }
    } catch (e) {
      toast.error('Erreur lors du chargement du message');
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async () => {
    if (!message) return;
    try {
      const newStatus = !message.read;
      await SupabaseService.updateMessageReadStatus(message.id, newStatus);
      setMessage({ ...message, read: newStatus });
      toast.success(`Message marqué comme ${newStatus ? 'lu' : 'non lu'}`);
    } catch (err) {
      toast.error('Erreur de mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!message) return;
    try {
      await SupabaseService.deleteMessage(message.id);
      toast.success('Message supprimé');
      navigate('/admin/messages');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="w-32 h-6 bg-bg-card rounded animate-pulse" />
        <div className="bg-bg-card border border-white/5 rounded-xl p-8 animate-pulse">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-white/5" />
            <div className="space-y-2 flex-1">
              <div className="w-1/4 h-5 bg-white/5 rounded" />
              <div className="w-1/3 h-4 bg-white/5 rounded" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="w-full h-4 bg-white/5 rounded" />
            <div className="w-full h-4 bg-white/5 rounded" />
            <div className="w-3/4 h-4 bg-white/5 rounded" />
            <div className="w-5/6 h-4 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="max-w-4xl mx-auto text-center py-24">
        <AlertTriangle size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
        <h2 className="font-space text-xl font-bold mb-2">Message introuvable</h2>
        <p className="text-text-muted mb-6">Ce message n'existe pas ou a été supprimé.</p>
        <Link to="/admin/messages" className="inline-flex items-center text-accent-cyan hover:underline">
          <ArrowLeft size={16} className="mr-2" /> Retour à la boîte de réception
        </Link>
      </div>
    );
  }

  const date = new Date(message.created_at);
  const fullDate = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const mailtoUrl = `mailto:${message.email}?subject=RE: ${message.subject || 'Votre message'}`;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/messages" className="flex items-center text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Boîte de réception
        </Link>
        <div className="flex items-center gap-4 text-sm font-mono text-accent-cyan">
          <button className="hover:underline opacity-50 cursor-not-allowed" disabled>&lt; Précédent</button>
          <span className="text-white/20">|</span>
          <button className="hover:underline opacity-50 cursor-not-allowed" disabled>Suivant &gt;</button>
        </div>
      </div>

      <div className="bg-bg-card border border-white/5 rounded-xl overflow-hidden">
        {/* Actions Bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-bg-primary/30">
          <div className="flex items-center gap-2">
            <a 
              href={mailtoUrl}
              className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-text-primary text-sm font-medium rounded transition-colors"
            >
              <Reply size={16} className="mr-2" /> Répondre par email
            </a>
            <button 
              onClick={toggleReadStatus}
              className="flex items-center px-4 py-2 bg-transparent hover:bg-white/5 text-text-primary text-sm font-medium border border-white/10 rounded transition-colors"
            >
              <Check size={16} className="mr-2" /> {message.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
            </button>
          </div>
          <button 
            onClick={() => setDeleting(true)}
            className="flex items-center px-4 py-2 bg-transparent hover:bg-red-500/10 text-red-400 text-sm font-medium rounded transition-colors"
          >
            <Trash2 size={16} className="mr-2" /> Supprimer
          </button>
        </div>

        {/* Message Header */}
        <div className="p-8 border-b border-white/5">
          <h1 className="font-space text-2xl font-bold mb-6">{message.subject || 'Sans objet'}</h1>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-cyan/20 text-accent-cyan flex items-center justify-center font-bold text-lg">
                {getInitials(message.name)}
              </div>
              <div>
                <div className="font-medium text-text-primary text-lg">{message.name}</div>
                <a href={`mailto:${message.email}`} className="text-accent-cyan hover:underline text-sm">{message.email}</a>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm text-text-muted mb-1">{fullDate}</div>
              {!message.read && (
                <span className="inline-block px-2 py-0.5 bg-accent-ocre/10 border border-accent-ocre/20 text-accent-ocre text-[10px] font-bold uppercase tracking-wider rounded">
                  Non lu
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Message Body */}
        <div className="p-8 min-h-[300px]">
          <div className="font-inter text-[16px] leading-relaxed text-text-primary whitespace-pre-wrap">
            {message.message}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-bg-card border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center text-red-400 mb-4">
              <AlertTriangle size={24} className="mr-3" />
              <h3 className="font-space font-semibold text-lg">Confirmer la suppression</h3>
            </div>
            <p className="text-text-muted mb-6">Cette action est irréversible. Voulez-vous vraiment supprimer ce message ?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleting(false)} className="px-4 py-2 text-text-primary hover:bg-white/5 rounded transition-colors">Annuler</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded font-medium transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
