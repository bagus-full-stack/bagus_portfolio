import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { LoginForm } from '../../types';

export function AdminLogin() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({ email: '', password: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    AuthService.getCurrentSession().then(session => {
      if (session) {
        navigate('/admin');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await AuthService.signIn(formData);
      navigate('/admin');
    } catch (err) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === 'error') setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 selection:bg-accent-cyan/30">
      <div className="w-full max-w-md bg-bg-card border border-white/5 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-accent-ocre"></div>

        <div className="text-center mb-8">
          <div className="inline-block font-space font-bold text-3xl text-text-primary mb-2">
            <span className="text-accent-cyan">&lt;</span>AB<span className="text-accent-cyan">/&gt;</span>
          </div>
          <h1 className="font-space text-2xl font-semibold text-text-primary mt-4">Accès administration</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-muted font-inter mb-1.5">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-bg-primary border border-white/10 rounded text-text-primary font-inter focus:outline-none focus:border-accent-ocre transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-muted font-inter mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-primary border border-white/10 rounded text-text-primary font-inter focus:outline-none focus:border-accent-ocre transition-colors"
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
            
            <div className="mt-2 text-right">
              <Link to="/admin/forgot-password" className="text-sm text-accent-cyan hover:text-accent-cyan/80 font-inter transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          {status === 'error' && (
            <div className="text-red-400 text-sm font-inter bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">
              Email ou mot de passe incorrect
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-3 bg-accent-ocre text-bg-primary font-inter font-medium rounded hover:bg-accent-ocre/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {status === 'submitting' ? <Loader2 size={20} className="animate-spin" /> : 'Se connecter'}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center text-text-muted font-mono text-xs">
          <Lock size={12} className="mr-1.5" />
          Connexion sécurisée via Supabase Auth
        </div>
      </div>
    </div>
  );
}
