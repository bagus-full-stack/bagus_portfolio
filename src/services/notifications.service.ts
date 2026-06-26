import { supabase } from './supabase.service';
import { AppNotification } from '../types';

export const subscribeToNotifications = (
  onNew: (notification: AppNotification) => void
) => {
  const channel = supabase
    .channel('portfolio-notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        onNew({
          id: payload.new.id,
          type: 'message',
          message: `Message de ${payload.new.name} — ${payload.new.message.slice(0, 40)}...`,
          timestamp: payload.new.created_at,
          read: false,
          sourceUrl: `/admin/messages/${payload.new.id}`
        });
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'analytics' },
      (payload) => {
        onNew({
          id: crypto.randomUUID(),
          type: 'visitor',
          message: `Nouveau visiteur depuis ${payload.new.country || 'localisation inconnue'}`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
