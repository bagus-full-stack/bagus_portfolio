import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { ResetForm } from '../../types';
import { PasswordStrength } from '../../components/PasswordStrength';

export function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ResetForm>({ password: '', confirm: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check auth state? Supabase automatically handles the access token in the URL fragment
  // and persists the session.
  
  const isValid = formData.password.length >= 8 && 
                  /[A-Z]/.test(formData.password) && 
                  /[0-9]/.test(formData.password) && 
                  formData.password === formData.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    setStatus('submitting');
    try {
      await AuthService.updatePassword(formData.password);
      setStatus('success');
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (status !== 'idle') setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 selection:bg-accent-cyan/30">
      <div className="w-full max-w-md bg-bg-card border border-white/5 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-accent-cyan"></div>

        <div className="mb-8">
          <h1 className="font-space text-2xl font-semibold text-text-primary">Nouveau mot de passe</h1>
          <p className="text-text-muted font-inter text-sm mt-2">
            Veuillez entrer votre nouveau mot de passe.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan font-inter px-4 py-6 rounded text-center">
            <p>Mot de passe mis à jour avec succès. Redirection...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-muted font-inter mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-primary border border-white/10 rounded text-text-primary font-inter focus:outline-none focus:border-accent-cyan transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength Indicator */}
              <PasswordStrength password={formData.password} />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-text-muted font-inter mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm"
                  name="confirm"
                  required
                  value={formData.confirm}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-primary border border-white/10 rounded text-text-primary font-inter focus:outline-none focus:border-accent-cyan transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.confirm && formData.password !== formData.confirm && (
                <p className="text-red-400 text-xs font-inter mt-1.5">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            {status === 'error' && (
              <div className="text-red-400 text-sm font-inter bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">
                Une erreur est survenue lors de la mise à jour.
              </div>
            )}

            <button
              type="submit"
              disabled={!isValid || status === 'submitting'}
              className="w-full py-3 bg-accent-ocre text-bg-primary font-inter font-medium rounded hover:bg-accent-ocre/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {status === 'submitting' ? <Loader2 size={20} className="animate-spin" /> : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}

        <div className="mt-8 flex items-center justify-center text-text-muted font-mono text-xs">
          <Lock size={12} className="mr-1.5" />
          Connexion sécurisée via Supabase Auth
        </div>
      </div>
    </div>
  );
}
