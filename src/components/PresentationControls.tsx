import { usePresentationMode } from '../hooks/usePresentationMode';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

export function PresentationControls() {
  const { isActive, currentIndex, total, deactivate } = usePresentationMode();

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* Badge haut gauche */}
      <div className="absolute top-6 left-6 pointer-events-auto">
        <div className="px-3 py-1.5 bg-[#141B22] border border-[#E08A3E] rounded text-accent-ocre font-mono text-xs font-bold tracking-wider shadow-lg">
          MODE PRÉSENTATION
        </div>
      </div>

      {/* Navigation bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-6 bg-[#141B22] px-6 py-3 rounded-[24px] border border-white/10 shadow-2xl">
        <button 
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(event);
          }}
          disabled={currentIndex === 0}
          className="text-text-primary disabled:text-text-muted/30 hover:text-accent-ocre transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-mono text-sm text-[#EDEFF2] min-w-[3ch] text-center">
          {currentIndex + 1} / {total}
        </span>
        <button 
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(event);
          }}
          disabled={currentIndex === total - 1}
          className="text-text-primary disabled:text-text-muted/30 hover:text-accent-cyan transition-colors"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Bouton quitter */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <button 
          onClick={deactivate}
          className="flex items-center gap-2 px-4 py-2 bg-[#141B22] border border-[#9BA4B5] hover:border-[#E08A3E] text-text-primary rounded transition-colors text-sm font-medium shadow-lg"
        >
          <X size={16} /> Quitter
        </button>
      </div>
    </div>
  );
}
