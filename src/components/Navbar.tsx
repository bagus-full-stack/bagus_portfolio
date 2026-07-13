import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { SearchOverlay } from './SearchOverlay';
import { LanguageSelector } from './LanguageSelector';
import ThemeToggle from './ui/ThemeToggle';
import { useTranslation } from '../hooks/useTranslation';
import { useProfile } from '../hooks/useProfile';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { t } = useTranslation();
  const { profile } = useProfile();

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
            ? 'bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)]" />
            ) : (
              <span className="font-space font-bold text-3xl text-text-primary tracking-tighter">AB</span>
            )}
          </a>

          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((item) => (
              <a 
                key={item.id} 
                href={`#${item.id}`} 
                className="font-inter text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t(item.key)}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Rechercher (Cmd+K)"
            >
              <Search size={20} />
            </button>
            <div className="w-px h-4 bg-[var(--border-subtle)]" />
            <LanguageSelector />
            <ThemeToggle />
            <a 
              href="#contact" 
              className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-sm bg-accent-ocre text-[var(--bg-primary)] font-space font-semibold transition-opacity hover:opacity-90"
            >
              {t('nav.hire')}
            </a>
          </div>
        </div>
      </nav>
      
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
