import { Github, ExternalLink, Download } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export function AgroSahelPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-cyan/30 pt-24 pb-32">
      <SEOHead meta={{
        title: "AgroSahel AI — Diagnostic agricole IA pour le Sahel | Assami Baga",
        description: "AgroSahel AI (PlantDoc) : plateforme de diagnostic de maladies agricoles par IA pour les cultures du Sahel. Flutter, FastAPI, EfficientNetV2.",
        url: "https://assami.dev/projects/agrosahel-ai",
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AgroSahel AI",
          "description": "Diagnostic agricole par IA pour les cultures du Sahel",
          "url": "https://assami.dev/projects/agrosahel-ai",
          "author": {
            "@type": "Person",
            "name": "Assami Baga"
          },
          "applicationCategory": "AgricultureApplication"
        }
      }} />
      
      {/* Section Hero */}
      <section className="relative px-6 md:px-12 lg:px-24 mb-32">
        {/* Motif SVG feuilles en arrière-plan */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="leaf-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <g fill="#2DD4BF" transform="scale(0.5)">
                  <path d="M 20 60 C 20 20, 60 20, 60 20 C 60 60, 20 60, 20 60 Z" />
                </g>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#leaf-pattern)"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full border border-accent-cyan/30 bg-accent-cyan/10">
            <span className="font-mono text-xs font-bold text-accent-cyan tracking-widest">EN PRODUCTION</span>
          </div>
          
          <h1 className="font-sans text-5xl md:text-[56px] font-bold text-text-primary tracking-tight mb-6">
            AgroSahel AI
          </h1>
          
          <p className="font-sans text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10">
            Diagnostic agricole IA pour les cultures du Sahel
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-card)] border border-white/10 hover:border-accent-cyan rounded text-text-primary transition-colors font-medium">
              <Github size={18} />
              GitHub
            </a>
            <a href="#" className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-card)] border border-white/10 hover:border-accent-cyan rounded text-text-primary transition-colors font-medium">
              <ExternalLink size={18} />
              API Docs
            </a>
            <a href="#" className="flex items-center gap-2 px-6 py-3 bg-accent-cyan text-[#0B0F14] hover:bg-accent-cyan/90 rounded transition-colors font-semibold">
              <Download size={18} />
              Télécharger l'app
            </a>
          </div>
        </div>
      </section>

      {/* Section Problème -> Solution */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {/* Gauche: Le problème */}
          <div className="bg-[var(--bg-card)] p-10 md:p-16 flex flex-col justify-center">
            <h2 className="font-sans text-2xl font-bold text-[#E08A3E] mb-8">Le problème</h2>
            
            <div className="flex flex-col gap-8 mb-10">
              <div>
                <div className="font-mono text-4xl text-text-primary mb-1">14M</div>
                <div className="text-[var(--text-muted)] text-sm">agriculteurs Sahel</div>
              </div>
              <div>
                <div className="font-mono text-4xl text-text-primary mb-1">72h</div>
                <div className="text-[var(--text-muted)] text-sm">délai diagnostic</div>
              </div>
              <div>
                <div className="font-mono text-4xl text-text-primary mb-1">5</div>
                <div className="text-[var(--text-muted)] text-sm">cultures ciblées</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {['pearl millet', 'sorghum', 'maize', 'groundnut', 'cassava'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-black/30 border border-white/5 rounded text-xs text-[var(--text-muted)] font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Droite: La solution */}
          <div className="bg-[var(--bg-primary)] p-10 md:p-16 flex flex-col justify-center">
            <h2 className="font-sans text-2xl font-bold text-accent-cyan mb-10">La solution</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-accent-cyan/10 rounded-full flex items-center justify-center text-accent-cyan">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-text-primary mb-1">Photo → diagnostic instantané</h3>
                  <p className="text-sm text-[var(--text-muted)]">Analyse en temps réel de l'état de la plante via l'appareil photo du smartphone.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-accent-cyan/10 rounded-full flex items-center justify-center text-accent-cyan">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-text-primary mb-1">Fonctionne hors connexion</h3>
                  <p className="text-sm text-[var(--text-muted)]">Le modèle léger embarqué permet un diagnostic même sans couverture réseau.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-accent-cyan/10 rounded-full flex items-center justify-center text-accent-cyan">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-text-primary mb-1">Interface multilingue</h3>
                  <p className="text-sm text-[var(--text-muted)]">Traduction intégrée pour les dialectes locaux et langues régionales majeures.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Architecture */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <h2 className="font-sans text-2xl font-bold text-text-primary mb-12 text-center">Architecture</h2>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[800px] w-full">
            <svg viewBox="0 0 800 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              {/* Markers */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#2DD4BF" />
                </marker>
              </defs>

              {/* Nodes */}
              <rect x="50" y="100" width="160" height="60" rx="8" fill="#141B22" stroke="#2DD4BF" strokeWidth="2"/>
              <text x="130" y="135" fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#EDEFF2" textAnchor="middle">Flutter App</text>

              <rect x="320" y="100" width="160" height="60" rx="8" fill="#141B22" stroke="#2DD4BF" strokeWidth="2"/>
              <text x="400" y="135" fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#EDEFF2" textAnchor="middle">FastAPI Backend</text>

              <rect x="590" y="100" width="160" height="60" rx="8" fill="#141B22" stroke="#2DD4BF" strokeWidth="2"/>
              <text x="670" y="135" fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#EDEFF2" textAnchor="middle">TFLite Model</text>

              <rect x="590" y="220" width="160" height="60" rx="8" fill="#141B22" stroke="#2DD4BF" strokeWidth="2"/>
              <text x="670" y="255" fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#EDEFF2" textAnchor="middle">Supabase Storage</text>

              {/* Edges */}
              <line x1="210" y1="130" x2="310" y2="130" stroke="#2DD4BF" strokeWidth="2" markerEnd="url(#arrow)"/>
              <text x="260" y="120" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#9BA4B5" textAnchor="middle">HTTP/JSON</text>

              <line x1="480" y1="130" x2="580" y2="130" stroke="#2DD4BF" strokeWidth="2" markerEnd="url(#arrow)"/>
              <text x="530" y="120" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#9BA4B5" textAnchor="middle">inference</text>

              <line x1="670" y1="210" x2="670" y2="170" stroke="#2DD4BF" strokeWidth="2" markerEnd="url(#arrow)"/>
              <text x="680" y="195" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#9BA4B5">model weights</text>
            </svg>
          </div>
        </div>
      </section>

      {/* Section Métriques */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <div className="font-sans font-bold text-4xl text-accent-cyan mb-2">94.2%</div>
            <div className="font-mono text-sm text-[var(--text-muted)]">Précision modèle</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <div className="font-sans font-bold text-4xl text-accent-cyan mb-2">18</div>
            <div className="font-mono text-sm text-[var(--text-muted)]">Classes maladies</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <div className="font-sans font-bold text-4xl text-accent-cyan mb-2">340ms</div>
            <div className="font-mono text-sm text-[var(--text-muted)]">Temps inférence</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <div className="font-sans font-bold text-4xl text-accent-cyan mb-2">5</div>
            <div className="font-mono text-sm text-[var(--text-muted)]">Cultures</div>
          </div>
        </div>
      </section>

      {/* Section Stack */}
      <section className="max-w-4xl mx-auto px-6 mb-32">
        <h2 className="font-sans text-2xl font-bold text-text-primary mb-12 text-center">Stack Technique</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-text-primary mb-4 text-sm uppercase tracking-wider">Mobile</h3>
            <div className="flex flex-col gap-2">
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">Flutter</span>
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">Dart</span>
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">Provider</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-text-primary mb-4 text-sm uppercase tracking-wider">Backend</h3>
            <div className="flex flex-col gap-2">
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">FastAPI</span>
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">Python</span>
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">PostgreSQL</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-text-primary mb-4 text-sm uppercase tracking-wider">ML</h3>
            <div className="flex flex-col gap-2">
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">TensorFlow</span>
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">TFLite</span>
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">OpenCV</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-text-primary mb-4 text-sm uppercase tracking-wider">DevOps</h3>
            <div className="flex flex-col gap-2">
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">Docker</span>
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">Supabase</span>
              <span className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded text-sm text-[var(--text-muted)]">GitHub Actions</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <div className="bg-[var(--bg-card)] p-12 rounded-2xl border border-white/5 text-center">
          <h2 className="font-sans text-3xl font-bold text-text-primary mb-8">Intéressé par ce projet ?</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-primary)] border border-white/10 hover:border-text-primary rounded text-text-primary transition-colors font-medium">
              <Github size={18} />
              Code Source
            </a>
            <a href="/#contact" className="flex items-center gap-2 px-6 py-3 bg-accent-ocre text-[#0B0F14] hover:bg-accent-ocre/90 rounded transition-colors font-semibold">
              En discuter
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
