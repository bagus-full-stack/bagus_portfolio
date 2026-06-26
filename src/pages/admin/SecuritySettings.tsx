import React, { useState, useEffect } from 'react';
import { Shield, Key, Monitor, Smartphone, Eye, EyeOff, AlertTriangle, CheckCircle2, X, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { SupabaseService } from '../../services/supabase.service';
import { Session } from '../../types';
import { PasswordStrength } from '../../components/PasswordStrength';

export function SecuritySettings() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [sessionInfo, setSessionInfo] = useState({ os: 'Inconnu', browser: 'Inconnu', ip: 'N/A', city: 'Inconnue', country: 'Inconnue' });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Modals state
  const [revokeModalId, setRevokeModalId] = useState<string | null>(null);
  const [revokeAllModal, setRevokeAllModal] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const parseUserAgent = () => {
    const ua = navigator.userAgent;
    let os = 'Inconnu';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    let browser = 'Inconnu';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';

    return { os, browser };
  };

  const fetchIPInfo = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      return {
        ip: data.ip,
        city: data.city,
        country: data.country_name
      };
    } catch {
      return { ip: 'N/A', city: 'Inconnue', country: 'Inconnue' };
    }
  };

  useEffect(() => {
    loadSessions();
    const initSessionInfo = async () => {
      const { os, browser } = parseUserAgent();
      const { ip, city, country } = await fetchIPInfo();
      setSessionInfo({ os, browser, ip, city, country });
    };
    initSessionInfo();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await SupabaseService.getSessions();
      setSessions(data);
    } catch (e) {
      toast.error('Erreur lors du chargement des sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(newPassword);

  const isPasswordValid = newPassword && confirmPassword && newPassword === confirmPassword && strength >= 2;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    
    setSavingPassword(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Mot de passe mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevokeSession = async () => {
    if (!revokeModalId) return;
    setRevoking(true);
    try {
      await SupabaseService.revokeSession(revokeModalId);
      setSessions(sessions.filter(s => s.id !== revokeModalId));
      toast.success('Session révoquée');
    } catch (e) {
      toast.error('Erreur lors de la révocation');
    } finally {
      setRevoking(false);
      setRevokeModalId(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevoking(true);
    try {
      await SupabaseService.revokeAllOtherSessions();
      setSessions(sessions.filter(s => s.isCurrent));
      toast.success('Toutes les autres sessions ont été déconnectées');
    } catch (e) {
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setRevoking(false);
      setRevokeAllModal(false);
    }
  };

  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div>
        <h2 className="font-space text-2xl font-bold text-text-primary mb-2">Sécurité</h2>
        <p className="text-text-muted">Gérez votre mot de passe et vos sessions actives.</p>
      </div>

      {currentSession && (
        <div className="flex items-center gap-3 p-4 bg-[var(--bg-primary)] rounded-xl border border-[#2DD4BF]/20">
          <Shield size={16} className="text-[#2DD4BF] shrink-0" />
          <div className="font-[JetBrains_Mono] text-xs text-[var(--text-muted)] flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-[#2DD4BF]">Session active</span>
            <span>{sessionInfo.os} — {sessionInfo.browser}</span>
            <span>{sessionInfo.city}, {sessionInfo.country}</span>
            <span>IP : {sessionInfo.ip}</span>
            <span>
              Connecté le {new Date(currentSession.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      )}

      {/* Section 1: Changer le mot de passe */}
      <div className="bg-bg-card border border-white/5 rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Key className="text-accent-ocre" />
          <h3 className="font-space text-lg font-bold text-text-primary">Changer le mot de passe</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-muted">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-white/10 rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-muted">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-white/10 rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Strength indicator */}
              <PasswordStrength password={newPassword} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-muted">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-white/10 rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-400 mt-1">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isPasswordValid || savingPassword}
            className="w-full sm:w-auto px-6 py-2.5 bg-accent-ocre text-bg-primary font-bold rounded-lg hover:bg-accent-ocre/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {savingPassword ? (
              <span className="inline-block w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Mettre à jour
          </button>
        </form>
      </div>

      {/* Section 2: Sessions actives */}
      <div className="bg-bg-card border border-white/5 rounded-xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Monitor className="text-text-primary" />
            <h3 className="font-space text-lg font-bold text-text-primary">Sessions actives</h3>
          </div>
          
          {otherSessions.length > 0 && (
            <button
              onClick={() => setRevokeAllModal(true)}
              className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm font-medium rounded-lg transition-colors flex items-center whitespace-nowrap"
            >
              <LogOut size={16} className="mr-2" />
              Déconnecter les autres sessions
            </button>
          )}
        </div>

        {loadingSessions ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted">Aucune session trouvée.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <div 
                key={session.id} 
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border ${session.isCurrent ? 'bg-accent-ocre/5 border-accent-ocre/20' : 'bg-[var(--bg-card)] border-white/5'}`}
              >
                <div className="flex items-start gap-4 mb-4 sm:mb-0">
                  <div className={`p-2 rounded-full mt-1 ${session.isCurrent ? 'bg-accent-ocre/20 text-accent-ocre' : 'bg-white/5 text-text-muted'}`}>
                    {session.device === 'desktop' ? <Monitor size={20} /> : <Smartphone size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-text-primary">{session.location}</span>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 bg-accent-ocre text-bg-primary text-xs font-bold rounded uppercase tracking-wider">
                          Session actuelle
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-muted font-mono space-y-0.5">
                      <div>Connecté le : {new Date(session.createdAt).toLocaleString('fr-FR')}</div>
                      <div>Dernière activité : {new Date(session.lastActive).toLocaleString('fr-FR')}</div>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => setRevokeModalId(session.id)}
                    aria-label="Révoquer cette session"
                    className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-text-primary text-sm font-medium rounded transition-colors"
                  >
                    Révoquer
                  </button>
                )}
              </div>
            ))}
            
            {otherSessions.length === 0 && (
              <div className="flex items-center justify-center p-6 bg-[var(--bg-card)] border border-white/5 rounded-lg text-text-muted">
                <CheckCircle2 size={20} className="text-accent-cyan mr-3" />
                <span>Aucune autre session active.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Revoke Single Session Modal */}
      {revokeModalId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-bg-card border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center text-red-400">
                <AlertTriangle size={24} className="mr-3" />
                <h3 className="font-space font-semibold text-lg">Révoquer la session</h3>
              </div>
              <button onClick={() => setRevokeModalId(null)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
            <p className="text-text-muted mb-6">Cette session sera immédiatement déconnectée. Voulez-vous continuer ?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRevokeModalId(null)} className="px-4 py-2 text-text-primary hover:bg-white/5 rounded transition-colors">Annuler</button>
              <button 
                onClick={handleRevokeSession} 
                disabled={revoking}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded font-medium transition-colors disabled:opacity-50"
              >
                {revoking ? 'Révocation...' : 'Révoquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke All Sessions Modal */}
      {revokeAllModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-bg-card border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center text-red-400">
                <AlertTriangle size={24} className="mr-3" />
                <h3 className="font-space font-semibold text-lg">Déconnecter tous les appareils</h3>
              </div>
              <button onClick={() => setRevokeAllModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
            <p className="text-text-muted mb-6">Toutes vos autres sessions actives seront déconnectées immédiatement. Vous seul resterez connecté sur cet appareil.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRevokeAllModal(false)} className="px-4 py-2 text-text-primary hover:bg-white/5 rounded transition-colors">Annuler</button>
              <button 
                onClick={handleRevokeAll} 
                disabled={revoking}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded font-medium transition-colors disabled:opacity-50"
              >
                {revoking ? 'Déconnexion...' : 'Tout déconnecter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
