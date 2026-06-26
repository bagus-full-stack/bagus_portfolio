import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Eye, AlertTriangle, CheckCircle, Check } from 'lucide-react';
import { subscribeToNotifications } from '../../services/notifications.service';
import { AppNotification } from '../../types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

export function NotificationsPanel({ isOpen, onClose, setUnreadCount }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    return unsubscribe;
  }, [setUnreadCount]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notif.sourceUrl) {
      onClose();
      navigate(notif.sourceUrl);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <Mail size={16} className="text-accent-ocre" />;
      case 'visitor':
        return <Eye size={16} className="text-accent-cyan" />;
      case 'error':
        return <AlertTriangle size={16} className="text-[#EF4444]" />;
      case 'save':
        return <CheckCircle size={16} className="text-text-muted" />;
      default:
        return <Mail size={16} className="text-text-muted" />;
    }
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-[360px] bg-[var(--bg-card)] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-white/5">
        
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <h2 className="font-space text-xl font-bold text-text-primary">Notifications</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors"
            >
              Tout marquer comme lu
            </button>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center mb-4 text-accent-cyan">
                <Check size={24} />
              </div>
              <p className="text-text-muted">Tout est à jour</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                    notif.read 
                      ? 'bg-transparent border-transparent hover:bg-white/5' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-text-primary leading-snug ${notif.read ? 'font-normal' : 'font-medium'}`}>
                      {notif.message}
                    </p>
                    <p className="font-mono text-[11px] text-text-muted mt-2">
                      {formatDate(notif.timestamp)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-accent-ocre shadow-[0_0_8px_rgba(224,138,62,0.6)]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
