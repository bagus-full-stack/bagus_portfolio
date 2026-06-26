import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-text-primary flex flex-col font-inter selection:bg-accent-cyan/30 overflow-hidden relative">
      {/* Background SVG Graph Pattern (simplified) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="nodes-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="3" fill="#2DD4BF" opacity="0.5" />
              <circle cx="150" cy="80" r="4" fill="#E08A3E" opacity="0.5" />
              <circle cx="80" cy="160" r="3" fill="#2DD4BF" opacity="0.3" />
              <line x1="20" y1="20" x2="150" y2="80" stroke="#9BA4B5" strokeWidth="0.5" opacity="0.2" />
              <line x1="150" y1="80" x2="80" y2="160" stroke="#9BA4B5" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#nodes-pattern)" />
        </svg>
      </div>

      {/* Header with just AB logo */}
      <header className="py-6 px-6 relative z-10 max-w-[1440px] mx-auto w-full">
        <Link to="/" className="font-space font-bold text-2xl text-text-primary">
          AB<span className="text-accent-cyan">.</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 relative z-10">
        <h1 className="font-space font-bold text-8xl md:text-9xl text-[#EDEFF2] mb-6">
          404
        </h1>
        <p className="font-inter text-xl text-text-muted mb-10 max-w-md font-space">
          Cette page n'existe pas encore.
        </p>
        <Link 
          to="/"
          className="px-8 py-3.5 rounded-sm bg-[#E08A3E] text-[#0B0F14] font-space font-semibold transition-opacity hover:opacity-90"
        >
          Retour à l'accueil
        </Link>
      </main>
    </div>
  );
}
