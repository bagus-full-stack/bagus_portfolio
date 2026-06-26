import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { SearchOverlay } from './SearchOverlay';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { key: 'nav.projects', id: 'projects' }, 
    { key: 'nav.experiences', id: 'experiences' }, 
    { key: 'nav.skills', id: 'skills' }, 
    { key: 'nav.contact', id: 'contact' }
  ];

  return (
    <>
      <nav 
        className={`no-print fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-bg-primary/90 backdrop-blur-md border-b border-white/5 py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between">
          <a href="#" className="font-space font-bold text-3xl text-text-primary tracking-tighter">
            AB
          </a>

          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((item) => (
              <a 
                key={item.id} 
                href={`#${item.id}`} 
                className="font-inter text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                {t(item.key)}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center text-text-muted hover:text-text-primary transition-colors"
              title="Rechercher (Cmd+K)"
            >
              <Search size={20} />
            </button>
            <LanguageSelector />
            <a 
              href="#contact" 
              className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-sm bg-accent-ocre text-bg-primary font-space font-semibold transition-opacity hover:opacity-90"
            >
              Hire me
            </a>
          </div>
        </div>
      </nav>
      
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
