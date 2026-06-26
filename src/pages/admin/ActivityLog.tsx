import React, { useState, useEffect } from 'react';
import { Edit, Mail, Shield, Tag, AlertTriangle } from 'lucide-react';
import { ActivityLog as ActivityLogType } from '../../types';
import { supabase } from '../../services/supabase.service';

export function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'content' | 'message' | 'auth'>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      if (!supabase) return setLoading(false);
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (data) {
        setLogs(data as ActivityLogType[]);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <Edit size={16} className="text-accent-cyan" />;
      case 'message':
        return <Mail size={16} className="text-accent-ocre" />;
      case 'auth':
        return <Shield size={16} className="text-[#9BA4B5]" />;
      case 'error':
        return <AlertTriangle size={16} className="text-[#EF4444]" />;
      default:
        return <Tag size={16} className="text-text-muted" />;
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case 'content': return 'Contenu';
      case 'message': return 'Message';
      case 'auth': return 'Système';
      case 'error': return 'Erreur';
      default: return 'Autre';
    }
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-space text-3xl font-bold text-text-primary">Journal d'activité</h1>
        
        <div className="relative">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="appearance-none bg-bg-card border border-white/10 text-text-primary py-2 pl-4 pr-10 rounded-lg outline-none focus:border-accent-cyan/50 font-inter text-sm"
          >
            <option value="all">Tous les événements</option>
            <option value="content">Contenu modifié</option>
            <option value="message">Messages reçus</option>
            <option value="auth">Connexions</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-bg-card border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 flex gap-4 items-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            Aucune activité récente
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-4 sm:p-5 flex gap-4 items-start hover:bg-white/5 transition-colors">
                <div className="mt-1 w-8 h-8 rounded-full bg-[#0B0F14] border border-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {getIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium mb-1">
                    {log.description}
                  </p>
                  <p className="font-mono text-xs text-text-muted">
                    {formatDate(log.timestamp)}
                  </p>
                </div>
                <div className="hidden sm:block flex-shrink-0">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-[#0B0F14] border border-white/5 text-text-muted">
                    {getBadgeText(log.type)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center pt-4">
        <p className="font-mono text-xs text-text-muted">
          Rétention : 30 derniers jours
        </p>
      </div>
    </div>
  );
}
