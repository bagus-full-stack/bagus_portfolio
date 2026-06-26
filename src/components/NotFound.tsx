import { Link } from 'react-router-dom';
import { Network, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Simple Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center max-w-[1440px] mx-auto">
        <Link to="/" className="font-space font-bold text-xl text-text-primary">
          <span className="text-accent-cyan">&lt;</span>AB<span className="text-accent-cyan">/&gt;</span>
        </Link>
        <Link to="/" className="flex items-center text-sm font-inter text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Retour
        </Link>
      </div>

      {/* SVG Background Motif */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <Network size={600} className="text-accent-cyan" strokeWidth={0.5} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="font-space text-8xl font-bold text-bg-card border-text-muted/20 mb-6 drop-shadow-lg relative">
          404
          <span className="absolute inset-0 text-accent-cyan/20 blur-md">404</span>
        </h1>
        <p className="font-inter text-text-muted text-xl mb-10 max-w-md mx-auto">
          Cette page n'existe pas encore.
        </p>
        <Link 
          to="/" 
          className="px-8 py-3 bg-accent-ocre text-bg-primary font-inter font-medium rounded hover:bg-accent-ocre/90 transition-all duration-200 shadow-[0_0_15px_rgba(224,138,62,0.3)] hover:shadow-[0_0_25px_rgba(224,138,62,0.5)]"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
