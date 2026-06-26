import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, TrendingUp, Mail, Folder, Shield, 
  User, Plus, ExternalLink, Download, CheckCircle, AlertTriangle
} from 'lucide-react';
import { DashboardStats } from '../../types';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Simulate API call for dashboard stats
    setTimeout(() => {
      if (mounted) {
        setStats({
          totalViews: 12450,
          todayViews: 142,
          unreadMessages: 3,
          publishedProjects: 8,
          viewsChange: 12.5,
          recentMessages: [
            { id: '1', name: 'Jean Dupont', excerpt: 'Bonjour, je suis très intéressé par votre profil...', date: '10:30', read: false },
            { id: '2', name: 'Marie Martin', excerpt: 'Suite à notre échange, voici le brief...', date: 'Hier', read: false },
            { id: '3', name: 'Tech Recruiter', excerpt: 'Nous recherchons un dev React pour...', date: 'Hier', read: false },
          ]
        });
        setLoading(false);
      }
    }, 1000);

    return () => { mounted = false; };
  }, []);

  const todayDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const lastLogin = "24/06/2026 à 18:42 depuis Paris, FR";

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-bg-card border border-white/5 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-bg-card border border-white/5 rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-bg-card border border-white/5 rounded-xl"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-md flex items-center mb-8">
        <AlertTriangle size={20} className="mr-3" />
        Impossible de charger les données — <button className="underline ml-1" onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-space font-bold mb-2">Bonjour, Assami</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-text-muted font-mono">
          <span>{todayDate}</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="flex items-center">
            <Shield size={14} className="mr-1.5" />
            Dernière connexion : {lastLogin}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <MetricCard 
          title="Vues totales" 
          value={stats.totalViews.toLocaleString('fr-FR')} 
          icon={<Eye size={24} className="text-accent-cyan" />} 
          change={stats.viewsChange} 
        />
        <MetricCard 
          title="Vues aujourd'hui" 
          value={stats.todayViews.toLocaleString('fr-FR')} 
          icon={<TrendingUp size={24} className="text-accent-ocre" />} 
          change={4.2} 
        />
        <MetricCard 
          title="Messages non lus" 
          value={stats.unreadMessages.toString()} 
          icon={<Mail size={24} className={stats.unreadMessages > 0 ? "text-accent-ocre" : "text-text-muted"} />} 
          // No change for messages
        />
        <MetricCard 
          title="Projets publiés" 
          value={stats.publishedProjects.toString()} 
          icon={<Folder size={24} className="text-accent-cyan" />} 
          change={0} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Messages */}
        <div className="xl:col-span-2 bg-bg-card border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-space text-lg font-semibold flex items-center">
              <Mail size={18} className="mr-2 text-text-muted" /> Messages récents
            </h2>
            <Link to="/admin/messages" className="text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors">
              Voir tous
            </Link>
          </div>

          {stats.recentMessages.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-text-muted">
              <CheckCircle size={32} className="mb-3 text-white/20" />
              <p className="font-inter">Aucun nouveau message</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentMessages.map(msg => (
                <div key={msg.id} className="flex items-start justify-between p-4 rounded bg-bg-primary/50 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="pr-4">
                    <h3 className="font-medium text-sm text-text-primary mb-1">{msg.name}</h3>
                    <p className="text-sm text-text-muted line-clamp-1">{msg.excerpt}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="font-mono text-xs text-text-muted mb-2">{msg.date}</span>
                    {!msg.read && (
                      <span className="px-2 py-0.5 rounded-full bg-accent-ocre/10 border border-accent-ocre/20 text-accent-ocre text-[10px] font-bold uppercase tracking-wider">
                        Non lu
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Shortcuts */}
        <div className="bg-bg-card border border-white/5 rounded-xl p-6">
          <h2 className="font-space text-lg font-semibold mb-6">Raccourcis rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            <ShortcutButton icon={<User size={18} />} label="Modifier le profil" to="/admin/profile" />
            <ShortcutButton icon={<Plus size={18} />} label="Ajouter un projet" to="/admin/projects/new" />
            <ShortcutButton icon={<ExternalLink size={18} />} label="Voir le site" to="/" external />
            <ShortcutButton icon={<Download size={18} />} label="Exporter le CV" to="/admin/media" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, change }: { title: string, value: string, icon: React.ReactNode, change?: number }) {
  return (
    <div className="bg-bg-card border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-text-muted font-inter text-sm font-medium">{title}</h3>
        <div className="p-2 bg-bg-primary rounded-md border border-white/5">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="font-space text-3xl font-bold text-text-primary">{value}</div>
        {change !== undefined && change !== 0 && (
          <div className={`font-mono text-xs font-medium flex items-center ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change > 0 ? '+' : ''}{change}% <span className="text-text-muted ml-1 hidden sm:inline">vs J-1</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ShortcutButton({ icon, label, to, external }: { icon: React.ReactNode, label: string, to: string, external?: boolean }) {
  const content = (
    <>
      <div className="w-8 h-8 rounded bg-bg-primary border border-white/5 flex items-center justify-center text-text-muted group-hover:text-accent-cyan transition-colors mr-3">
        {icon}
      </div>
      <span className="font-inter text-sm font-medium group-hover:text-white transition-colors">{label}</span>
    </>
  );

  const className = "flex items-center p-3 rounded-lg border border-white/5 bg-bg-primary/50 hover:bg-white/5 group transition-all";

  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {content}
    </Link>
  );
}
