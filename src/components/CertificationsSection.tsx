import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Certification } from '../types';
import { SupabaseService } from '../services/supabase.service';
import { toast } from 'sonner';

export function CertificationsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    let mounted = true;
    
    async function loadCertifications() {
      try {
        const data = await SupabaseService.getCertifications();
        if (mounted) {
          setCertifications(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          setLoading(false);
          toast.error("Erreur lors du chargement des certifications");
        }
      }
    }
    
    loadCertifications();
    return () => { mounted = false; };
  }, []);

  if (error) {
    return (
      <section id="certifications" className="py-24 bg-bg-primary border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-sm text-sm font-inter">
            Impossible de charger les certifications.
          </div>
        </div>
      </section>
    );
  }

  if (!loading && certifications.length === 0) {
    return null;
  }

  return (
    <section id="certifications" className="py-24 bg-bg-primary border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary mb-12">Certifications</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-bg-card p-6 rounded-xl border border-white/5 space-y-4">
                <div className="h-6 bg-bg-primary animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-bg-primary animate-pulse rounded w-1/2"></div>
                <div className="h-4 bg-bg-primary animate-pulse rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map(cert => (
              <div key={cert.id} className="bg-bg-card p-6 rounded-xl border border-white/5 hover:border-accent-cyan/30 transition-colors duration-200">
                <h3 className="font-space text-xl font-semibold text-text-primary mb-2">
                  {cert.name}
                </h3>
                <p className="font-inter text-text-muted text-sm mb-4">
                  {cert.issuer}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-text-muted">
                    {cert.date}
                  </span>
                  {cert.verify_url && (
                    <a 
                      href={cert.verify_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                      title="Vérifier la certification"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
