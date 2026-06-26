import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Priorité 1 : préférence sauvegardée
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'dark' || saved === 'light') return saved;

    // Priorité 2 : préférence système
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';

    // Défaut : sombre
    return 'dark';
  });

  useEffect(() => {
    // Appliquer l'attribut sur <html>
    document.documentElement.setAttribute('data-theme', theme);
    
    // Mettre à jour la meta theme-color (PWA)
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        'content',
        theme === 'dark' ? '#0B0F14' : '#F4F6F9'
      );
    }
    
    // Persister
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Respecter uniquement si pas de préférence explicite sauvegardée
      if (!localStorage.getItem('portfolio-theme')) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return { theme, isDark, toggleTheme };
};

export default useTheme;
