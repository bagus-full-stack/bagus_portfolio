import { Github, Linkedin, Mail } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="no-print bg-bg-primary border-t border-white/5 py-10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="font-inter text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Assami Baga. {t('footer.rights')}.
        </div>
        
        <button 
          onClick={() => {
            const ev = new KeyboardEvent('keydown', { altKey: true, key: 'p' });
            window.dispatchEvent(ev);
          }}
          className="font-mono text-[10px] text-text-muted opacity-40 hover:opacity-100 transition-opacity"
        >
          Alt+P — Mode présentation
        </button>

        <div className="flex items-center space-x-6">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer" 
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="sr-only">GitHub</span>
            <Github size={20} />
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noreferrer" 
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="sr-only">LinkedIn</span>
            <Linkedin size={20} />
          </a>
          <a 
            href="mailto:bagaassami009@gmail.com" 
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="sr-only">Email</span>
            <Mail size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
