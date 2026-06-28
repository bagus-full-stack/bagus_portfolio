import React from 'react';
import { Github, ExternalLink, Download, Type, ImageIcon, Scan, Paintbrush, Zap, Layers, Brain, Cpu, Monitor, Package, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export function SimpsonsAIPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-ocre/30">
      <SEOHead meta={{
        title: "Simpsons AI Generator — Assami Baga",
        description: "Application Full Stack de génération d'images Simpsons par IA. FastAPI, PyTorch, Stable Diffusion, LoRA, ControlNet, Next.js 14.",
        url: "https://assami.dev/projects/simpsons-ai",
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Simpsons AI Generator",
          "description": "Génération d'images dans le style des Simpsons par intelligence artificielle générative.",
          "url": "https://assami.dev/projects/simpsons-ai",
          "author": {
            "@type": "Person",
            "name": "Assami Baga"
          },
          "applicationCategory": "MultimediaApplication",
          "programmingLanguage": [
            "Python", "TypeScript"
          ],
          "runtimePlatform": "CUDA, PyTorch"
        }
      }} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-border-color">
        {/* SVG Concentric Circles Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {[200, 350, 500, 650].map((r, i) => (
            <circle
              key={i}
              cx="50%" cy="50%"
              r={r}
              fill="none"
              stroke="#FED549"
              strokeWidth="1"
              opacity={0.04 - i * 0.008}
            />
          ))}
        </svg>

        <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col items-center text-center">
          <span className="inline-flex items-center px-3 py-1 mb-8 rounded-full text-sm font-[JetBrains_Mono] bg-accent-cyan/20 border border-accent-cyan text-accent-cyan">
            COMPLÉTÉ
          </span>
          <h1 className="font-space text-4xl md:text-5xl lg:text-[56px] font-bold text-text-primary mb-6 leading-tight">
            Simpsons AI Generator
          </h1>
          <p className="font-inter text-xl text-text-muted max-w-2xl mb-10">
            Génération d'images dans le style des Simpsons par intelligence artificielle générative.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://github.com/bagus-full-stack" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-lg border border-text-muted text-text-muted hover:text-text-primary hover:border-text-primary transition-colors font-medium">
              <Github className="w-5 h-5" />
              Voir sur GitHub
            </a>
            <a href="#" className="flex items-center gap-2 px-6 py-3 rounded-lg border border-text-muted text-text-muted hover:text-text-primary hover:border-text-primary transition-colors font-medium">
              <ExternalLink className="w-5 h-5" />
              Lire la doc
            </a>
            <a href="#" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-ocre text-bg-primary font-bold hover:bg-accent-ocre/90 transition-colors">
              Voir la démo
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 py-24 space-y-32">

        {/* 4 Modes de génération */}
        <section>
          <div className="mb-12">
            <h2 className="font-space text-3xl font-bold text-text-primary mb-4">4 modes de génération</h2>
            <p className="font-inter text-text-muted text-lg">Du texte à l'image, de la photo au personnage jaune.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-bg-card border border-border-color rounded-xl p-6 hover:border-accent-ocre/30 transition-colors duration-200">
              <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-6">
                <Type className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <h3 className="font-space text-xl font-semibold mb-3">Texte → Image</h3>
              <p className="text-text-muted mb-6 line-clamp-3">
                Générez un personnage Simpsons depuis une simple description textuelle. Suggestions intégrées pour démarrer vite.
              </p>
              <span className="font-[JetBrains_Mono] text-xs text-text-muted">Stable Diffusion + LoRA</span>
            </div>

            {/* Card 2 */}
            <div className="bg-bg-card border border-border-color rounded-xl p-6 hover:border-accent-ocre/30 transition-colors duration-200">
              <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mb-6">
                <ImageIcon className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <h3 className="font-space text-xl font-semibold mb-3">Image → Image</h3>
              <p className="text-text-muted mb-6 line-clamp-3">
                Transformez vos photos ou selfies webcam en personnages jaunes tout en conservant les traits du visage.
              </p>
              <span className="font-[JetBrains_Mono] text-xs text-text-muted">Img2Img + LoRA</span>
            </div>

            {/* Card 3 */}
            <div className="bg-bg-card border border-border-color rounded-xl p-6 hover:border-accent-ocre/30 transition-colors duration-200">
              <div className="w-12 h-12 rounded-full bg-[#EC4899]/10 flex items-center justify-center mb-6">
                <Scan className="w-6 h-6 text-[#EC4899]" />
              </div>
              <h3 className="font-space text-xl font-semibold mb-3">Structure (ControlNet Canny)</h3>
              <p className="text-text-muted mb-6 line-clamp-3">
                Capturez les contours d'une pose ou d'un objet pour forcer l'IA à respecter la composition exacte.
              </p>
              <span className="font-[JetBrains_Mono] text-xs text-text-muted">ControlNet Canny + OpenCV</span>
            </div>

            {/* Card 4 */}
            <div className="bg-bg-card border border-border-color rounded-xl p-6 hover:border-accent-ocre/30 transition-colors duration-200">
              <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-6">
                <Paintbrush className="w-6 h-6 text-[#10B981]" />
              </div>
              <h3 className="font-space text-xl font-semibold mb-3">Édition (Inpainting)</h3>
              <p className="text-text-muted mb-6 line-clamp-3">
                Gomme Magique : redessinez une zone spécifique sans toucher au reste. Pinceau ajustable avec éditeur Canvas.
              </p>
              <span className="font-[JetBrains_Mono] text-xs text-text-muted">Inpainting + Canvas API</span>
            </div>
          </div>
        </section>

        {/* Architecture système */}
        <section>
          <div className="mb-12">
            <h2 className="font-space text-3xl font-bold text-text-primary mb-4">Architecture système</h2>
          </div>
          <div className="bg-bg-card border border-border-color rounded-xl p-8 overflow-x-auto">
            <div className="min-w-[800px]">
              <svg viewBox="0 0 800 320" width="100%" className="font-[JetBrains_Mono]">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2DD4BF" />
                  </marker>
                </defs>

                {/* Nodes */}
                <rect x="50" y="130" width="180" height="60" rx="8" fill="#141B22" stroke="#2DD4BF" strokeWidth="2" />
                <text x="140" y="155" textAnchor="middle" fill="#EDEFF2" className="font-space font-semibold text-sm">Next.js 14 Frontend</text>
                <text x="140" y="175" textAnchor="middle" fill="#8B94A3" className="text-[10px]">React, Tailwind</text>

                <rect x="310" y="130" width="180" height="60" rx="8" fill="#141B22" stroke="#2DD4BF" strokeWidth="2" />
                <text x="400" y="155" textAnchor="middle" fill="#EDEFF2" className="font-space font-semibold text-sm">FastAPI Backend</text>
                <text x="400" y="175" textAnchor="middle" fill="#8B94A3" className="text-[10px]">Python 3.10</text>

                <rect x="570" y="130" width="180" height="60" rx="8" fill="#141B22" stroke="#2DD4BF" strokeWidth="2" />
                <text x="660" y="155" textAnchor="middle" fill="#EDEFF2" className="font-space font-semibold text-sm">Stable Diffusion v1.5</text>
                <text x="660" y="175" textAnchor="middle" fill="#8B94A3" className="text-[10px]">PyTorch/CUDA</text>

                {/* Plugins to SD */}
                <rect x="570" y="20" width="180" height="30" rx="4" fill="#141B22" stroke="#8B94A3" strokeWidth="1" strokeDasharray="4 4" />
                <text x="660" y="40" textAnchor="middle" fill="#8B94A3" className="text-[10px]">LoRA Simpsons</text>

                <rect x="570" y="60" width="180" height="30" rx="4" fill="#141B22" stroke="#8B94A3" strokeWidth="1" strokeDasharray="4 4" />
                <text x="660" y="80" textAnchor="middle" fill="#8B94A3" className="text-[10px]">LCM-LoRA (Turbo)</text>

                <rect x="570" y="220" width="180" height="30" rx="4" fill="#141B22" stroke="#8B94A3" strokeWidth="1" strokeDasharray="4 4" />
                <text x="660" y="240" textAnchor="middle" fill="#8B94A3" className="text-[10px]">ControlNet Canny</text>

                <rect x="570" y="260" width="180" height="30" rx="4" fill="#141B22" stroke="#8B94A3" strokeWidth="1" strokeDasharray="4 4" />
                <text x="660" y="280" textAnchor="middle" fill="#8B94A3" className="text-[10px]">Inpainting Pipeline</text>

                {/* Edges */}
                <line x1="230" y1="160" x2="300" y2="160" stroke="#2DD4BF" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="265" y="150" textAnchor="middle" fill="#8B94A3" className="text-[10px]">HTTP/REST</text>

                <line x1="490" y1="160" x2="560" y2="160" stroke="#2DD4BF" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="525" y="150" textAnchor="middle" fill="#8B94A3" className="text-[10px]">Pipeline Call</text>

                <line x1="660" y1="130" x2="660" y2="55" stroke="#8B94A3" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="660" y1="130" x2="660" y2="95" stroke="#8B94A3" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="660" y1="190" x2="660" y2="215" stroke="#8B94A3" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="660" y1="190" x2="660" y2="255" stroke="#8B94A3" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
            </div>
          </div>
        </section>

        {/* Métriques */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-bg-card border border-border-color rounded-xl p-6 text-center">
            <Zap className="w-8 h-8 text-accent-ocre mx-auto mb-4" />
            <div className="font-space text-4xl md:text-5xl font-bold text-text-primary mb-2">~1s</div>
            <div className="font-[JetBrains_Mono] text-xs text-text-muted">Mode Turbo (LCM-LoRA)</div>
          </div>
          <div className="bg-bg-card border border-border-color rounded-xl p-6 text-center">
            <Layers className="w-8 h-8 text-accent-cyan mx-auto mb-4" />
            <div className="font-space text-4xl md:text-5xl font-bold text-text-primary mb-2">4</div>
            <div className="font-[JetBrains_Mono] text-xs text-text-muted">Modes de génération</div>
          </div>
          <div className="bg-bg-card border border-border-color rounded-xl p-6 text-center">
            <Brain className="w-8 h-8 text-accent-cyan mx-auto mb-4" />
            <div className="font-space text-4xl md:text-5xl font-bold text-text-primary mb-2">v1.5</div>
            <div className="font-[JetBrains_Mono] text-xs text-text-muted">Stable Diffusion base</div>
          </div>
          <div className="bg-bg-card border border-border-color rounded-xl p-6 text-center">
            <Cpu className="w-8 h-8 text-accent-ocre mx-auto mb-4" />
            <div className="font-space text-4xl md:text-5xl font-bold text-text-primary mb-2">CUDA</div>
            <div className="font-[JetBrains_Mono] text-xs text-text-muted">Accélération GPU</div>
          </div>
        </section>

        {/* Stack Technique */}
        <section>
          <div className="mb-12">
            <h2 className="font-space text-3xl font-bold text-text-primary mb-4">Stack technique par couche</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-space font-semibold text-lg border-b border-border-color pb-2">Frontend</h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js 14', 'TypeScript', 'TailwindCSS', 'Canvas API', 'MediaDevices API'].map(tag => (
                  <span key={tag} className="bg-bg-card border border-border-color text-text-muted font-[JetBrains_Mono] text-xs rounded-full px-3 py-1">{tag}</span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-space font-semibold text-lg border-b border-border-color pb-2">Backend</h3>
              <div className="flex flex-wrap gap-2">
                {['FastAPI', 'Python 3.10', 'Uvicorn'].map(tag => (
                  <span key={tag} className="bg-bg-card border border-border-color text-text-muted font-[JetBrains_Mono] text-xs rounded-full px-3 py-1">{tag}</span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-space font-semibold text-lg border-b border-border-color pb-2">IA & Modèles</h3>
              <div className="flex flex-wrap gap-2">
                {['PyTorch', 'CUDA', 'Diffusers (HuggingFace)', 'Stable Diffusion v1.5', 'LoRA', 'LCM-LoRA', 'ControlNet Canny'].map(tag => (
                  <span key={tag} className="bg-bg-card border border-border-color text-text-muted font-[JetBrains_Mono] text-xs rounded-full px-3 py-1">{tag}</span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-space font-semibold text-lg border-b border-border-color pb-2">Traitement image</h3>
              <div className="flex flex-wrap gap-2">
                {['OpenCV', 'PIL', 'NumPy'].map(tag => (
                  <span key={tag} className="bg-bg-card border border-border-color text-text-muted font-[JetBrains_Mono] text-xs rounded-full px-3 py-1">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dépannage */}
        <section>
          <div className="mb-12">
            <h2 className="font-space text-3xl font-bold text-text-primary mb-4">Problèmes connus & solutions</h2>
            <p className="font-inter text-text-muted text-lg">Documentation des erreurs rencontrées en développement.</p>
          </div>
          
          <div className="bg-bg-card border border-border-color rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-bg-card border-b border-border-color text-text-muted font-[JetBrains_Mono] text-sm">
                  <th className="p-4 font-normal">Erreur</th>
                  <th className="p-4 font-normal">Cause</th>
                  <th className="p-4 font-normal">Solution</th>
                  <th className="p-4 font-normal">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-border-color hover:bg-bg-primary/30 transition-colors">
                  <td className="p-4 font-medium">CUDA not available</td>
                  <td className="p-4 text-text-muted">PyTorch sans support GPU</td>
                  <td className="p-4 text-text-muted font-[JetBrains_Mono] text-xs">Réinstaller avec --index-url cu121</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs">
                      <CheckCircle2 className="w-3 h-3" /> Résolu
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-border-color hover:bg-bg-primary/30 transition-colors bg-bg-primary/20">
                  <td className="p-4 font-medium">AttributeError mediapipe</td>
                  <td className="p-4 text-text-muted">Conflit de version</td>
                  <td className="p-4 text-text-muted font-[JetBrains_Mono] text-xs">pip uninstall mediapipe controlnet_aux</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs">
                      <CheckCircle2 className="w-3 h-3" /> Résolu
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-border-color hover:bg-bg-primary/30 transition-colors">
                  <td className="p-4 font-medium">Image noire (Mode Turbo)</td>
                  <td className="p-4 text-text-muted">Guidance Scale trop élevé</td>
                  <td className="p-4 text-text-muted">Passage automatique à 1.5 en LCM</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs">
                      <CheckCircle2 className="w-3 h-3" /> Résolu
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-bg-primary/30 transition-colors bg-bg-primary/20">
                  <td className="p-4 font-medium">Out of Memory (OOM)</td>
                  <td className="p-4 text-text-muted">GPU insuffisant (&lt;4Go VRAM)</td>
                  <td className="p-4 text-text-muted">Fermer les apps gourmandes, restart</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full text-xs">
                      <AlertTriangle className="w-3 h-3" /> Connu
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Prérequis */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-bg-card border border-border-color rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="w-6 h-6 text-text-primary" />
                <h3 className="font-space font-semibold text-lg">Système</h3>
              </div>
              <ul className="space-y-2 text-text-muted text-sm">
                <li>Windows (recommandé) ou Linux</li>
                <li>Python 3.10 impératif</li>
              </ul>
            </div>
            <div className="bg-bg-card border border-border-color rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-6 h-6 text-accent-ocre" />
                <h3 className="font-space font-semibold text-lg">GPU</h3>
              </div>
              <ul className="space-y-2 text-text-muted text-sm">
                <li>NVIDIA recommandé</li>
                <li>Minimum 4Go VRAM</li>
                <li>Pilotes CUDA à jour</li>
              </ul>
            </div>
            <div className="bg-bg-card border border-border-color rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-text-primary" />
                <h3 className="font-space font-semibold text-lg">Logiciels</h3>
              </div>
              <ul className="space-y-2 text-text-muted text-sm">
                <li>Node.js v18+</li>
                <li>Python 3.10</li>
                <li>pip + venv</li>
              </ul>
            </div>
          </div>
        </section>

      </div>

      {/* CTA Final */}
      <section className="bg-bg-card border-t border-border-color">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 py-16 text-center">
          <h2 className="font-space text-3xl font-bold text-text-primary mb-4">Voir le code source</h2>
          <p className="font-inter text-text-muted text-lg max-w-2xl mx-auto mb-8">
            Stack complète documentée, prêt à être cloné et lancé localement.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://github.com/bagus-full-stack" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-ocre text-bg-primary font-bold hover:bg-accent-ocre/90 transition-colors">
              <Github className="w-5 h-5" />
              Voir sur GitHub
            </a>
            <a href="#" className="flex items-center gap-2 px-6 py-3 rounded-lg border border-text-muted text-text-primary hover:border-text-primary hover:bg-bg-primary transition-colors font-medium">
              <Download className="w-5 h-5" />
              Télécharger le README
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
