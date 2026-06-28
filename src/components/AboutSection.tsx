import React, { useState, useEffect } from 'react';
import { MapPin, Linkedin } from 'lucide-react';
import { Profile } from '../types';
import { SupabaseService } from '../services/supabase.service';
import { toast } from 'sonner';

export function AboutSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function loadProfile() {
      try {
        const data = await SupabaseService.getProfile();
        if (mounted) {
          setProfile(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          setLoading(false);
          toast.error("Erreur lors du chargement du profil");
        }
      }
    }
    
    loadProfile();
    return () => { mounted = false; };
  }, []);

  if (error) {
    return (
      <section id="about" className="py-24 bg-bg-primary border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <p className="text-text-muted text-sm italic">Impossible de charger les informations de profil pour le moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-24 bg-bg-card/30 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary mb-12">À Propos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Photo Column */}
          <div className="md:col-span-4 flex justify-center md:justify-start">
            {loading || !profile ? (
              <div className="w-48 h-48 rounded-full bg-bg-card animate-pulse border-2 border-transparent"></div>
            ) : (
              <div className="relative w-48 h-48 rounded-full border-2 border-accent-ocre bg-bg-card flex items-center justify-center overflow-hidden">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" loading="eager" fetchpriority="high" width={192} height={192} />
                ) : (
                  <span className="font-space text-5xl font-bold text-text-muted">AB</span>
                )}
              </div>
            )}
          </div>
          
          {/* Bio Column */}
          <div className="md:col-span-8 flex flex-col space-y-6">
            {loading || !profile ? (
              <div className="space-y-4 w-full">
                 <div className="h-4 bg-bg-card animate-pulse rounded w-full"></div>
                 <div className="h-4 bg-bg-card animate-pulse rounded w-11/12"></div>
                 <div className="h-4 bg-bg-card animate-pulse rounded w-full"></div>
                 <div className="h-4 bg-bg-card animate-pulse rounded w-4/5"></div>
              </div>
            ) : (
              <>
                <p className="font-inter text-lg text-text-muted leading-relaxed">
                  {profile.bio}
                </p>
                
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 py-2">
                  <div className="flex flex-col">
                    <span className="font-mono text-2xl font-bold text-accent-cyan">5+</span>
                    <span className="font-mono text-xs text-text-muted uppercase tracking-wider">ans d'expérience</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-2xl font-bold text-accent-cyan">15+</span>
                    <span className="font-mono text-xs text-text-muted uppercase tracking-wider">projets déployés</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-white/5">
                  <div className="flex items-center text-text-muted font-inter text-sm">
                    <MapPin size={16} className="mr-2" />
                    {profile.location}
                  </div>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center text-accent-cyan hover:text-accent-cyan/80 font-inter text-sm transition-colors">
                    <Linkedin size={16} className="mr-2" />
                    Profil LinkedIn
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
