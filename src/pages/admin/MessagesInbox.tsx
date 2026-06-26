import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mailbox, Trash2, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Message } from '../../types';
import { SupabaseService } from '../../services/supabase.service';

type FilterType = 'all' | 'unread' | 'read';

export function MessagesInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const PAGE_SIZE = 20;
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await SupabaseService.getMessages();
      setMessages(data);
    } catch (e) {
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    const unreadMessages = messages.filter(m => !m.read);
    if (unreadMessages.length === 0) return;

    try {
      await Promise.all(unreadMessages.map(m => SupabaseService.updateMessageReadStatus(m.id, true)));
      setMessages(messages.map(m => ({ ...m, read: true })));
      toast.success('Tous les messages ont été marqués comme lus');
    } catch (e) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await SupabaseService.deleteMessage(id);
      setMessages(messages.filter(m => m.id !== id));
      toast.success('Message supprimé');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread') return !m.read;
    if (filter === 'read') return m.read;
    return true;
  });

  const paginatedMessages = filteredMessages.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredMessages.length / PAGE_SIZE);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="font-space text-2xl font-bold text-text-primary">Boîte de réception</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <div className="flex bg-bg-card border border-white/5 rounded-lg p-1">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-text-primary'}`}
            >
              Tous
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filter === 'unread' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-text-primary'}`}
            >
              Non lus
            </button>
            <button 
              onClick={() => setFilter('read')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filter === 'read' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-text-primary'}`}
            >
              Lus
            </button>
          </div>
          
          <button 
            onClick={markAllAsRead}
            disabled={messages.filter(m => !m.read).length === 0}
            className="px-4 py-2 text-sm text-text-primary bg-bg-card hover:bg-white/5 border border-white/5 rounded-lg transition-colors flex items-center whitespace-nowrap disabled:opacity-50"
          >
            <Check size={16} className="mr-2" />
            Tout marquer lu
          </button>
        </div>
      </div>

      <div className="bg-bg-card border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-1/4" />
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                </div>
                <div className="w-16 h-3 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <Mailbox size={48} className="text-white/10 mb-4" />
            <p className="text-text-primary font-medium mb-2">
              {filter === 'all' ? "Aucun message reçu pour l'instant" : 
               filter === 'unread' ? 'Aucun message non lu' : 'Aucun message lu'}
            </p>
            {filter !== 'all' && (
              <button 
                onClick={() => setFilter('all')}
                className="text-accent-cyan hover:underline text-sm mt-2"
              >
                Réinitialiser le filtre
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {paginatedMessages.map(msg => (
              <Link 
                key={msg.id} 
                to={`/admin/messages/${msg.id}`}
                className={`flex items-center gap-4 p-4 hover:bg-[#141B22] transition-colors group relative ${!msg.read ? 'bg-white/[0.02]' : ''}`}
              >
                {!msg.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-ocre" />
                )}
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${!msg.read ? 'bg-accent-ocre/20 text-accent-ocre' : 'bg-white/5 text-text-muted'}`}>
                  {getInitials(msg.name)}
                </div>

                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <div className={`font-medium truncate sm:w-48 flex-shrink-0 ${!msg.read ? 'text-text-primary' : 'text-text-muted'}`}>
                    {msg.name}
                  </div>
                  <div className={`text-sm truncate flex-1 ${!msg.read ? 'text-text-primary' : 'text-text-muted'}`}>
                    <span className="font-medium mr-2">{msg.subject || 'Sans objet'}</span>
                    <span className="opacity-70">— {msg.message.substring(0, 50)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className={`font-mono text-xs ${!msg.read ? 'text-accent-ocre font-bold' : 'text-text-muted'}`}>
                    {formatDate(msg.created_at)}
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, msg.id)}
                    className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {!loading && filteredMessages.length > 0 && (
        <div className="flex justify-between items-center text-sm text-text-muted px-2">
          <span>{filteredMessages.length} message(s)</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="px-3 py-1 hover:text-text-primary disabled:opacity-50 transition-colors" 
              disabled={page === 0}
            >
              &lt; Précédent
            </button>
            <span className="font-mono">Page {page + 1} / {totalPages || 1}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              className="px-3 py-1 hover:text-text-primary disabled:opacity-50 transition-colors" 
              disabled={page >= totalPages - 1}
            >
              Suivant &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
