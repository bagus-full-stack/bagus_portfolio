import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { ForgotForm } from '../../types';

export function ForgotPassword() {
  const [formData, setFormData] = useState<ForgotForm>({ email: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await AuthService.sendPasswordReset(formData.email);
      setStatus('success');
    } catch (err) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });
    if (status !== 'idle') setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 selection:bg-accent-cyan/30">
      <div className="w-full max-w-md bg-bg-card border border-white/5 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-accent-cyan"></div>

        <div className="mb-8">
          <Link to="/admin/login" className="inline-flex items-center text-sm text-accent-cyan hover:text-accent-cyan/80 font-inter transition-colors mb-6">
            <ArrowLeft size={16} className="mr-1.5" />
            Retour à la connexion
          </Link>
          <h1 className="font-space text-2xl font-semibold text-text-primary">Mot de passe oublié</h1>
          <p className="text-text-muted font-inter text-sm mt-2">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-accent-cyan/10 border border-accent-cyan/20 text-text-primary font-inter px-4 py-6 rounded text-center">
            <p>Si cet email existe, un lien a été envoyé.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-muted font-inter mb-1.5">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-primary border border-white/10 rounded text-text-primary font-inter focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>

            {status === 'error' && (
              <div className="text-red-400 text-sm font-inter bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">
                Une erreur réseau est survenue.
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3 bg-accent-ocre text-bg-primary font-inter font-medium rounded hover:bg-accent-ocre/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {status === 'submitting' ? <Loader2 size={20} className="animate-spin" /> : status === 'error' ? 'Réessayer' : 'Envoyer le lien'}
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
