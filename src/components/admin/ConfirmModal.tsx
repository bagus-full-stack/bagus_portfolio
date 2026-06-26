import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm" 
        onClick={onCancel}
      />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)]/30 rounded-xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="font-space font-bold text-xl text-[var(--text-primary)] mb-3">
          {title}
        </h3>
        <p className="font-inter text-[var(--text-muted)] mb-8">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-muted)] font-inter font-medium hover:text-[var(--text-primary)] hover:border-[#EDEFF2] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-md bg-[#EF4444] text-white font-inter font-medium hover:bg-[#DC2626] transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
