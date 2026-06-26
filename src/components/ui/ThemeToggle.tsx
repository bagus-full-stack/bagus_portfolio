import React from 'react';
import useTheme from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={!isDark}
      aria-label={
        isDark
          ? t('theme.light')
          : t('theme.dark')
      }
      className="relative flex items-center w-14 h-7 rounded-full p-0.5 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
      style={{
        backgroundColor: isDark
          ? 'rgba(139, 148, 163, 0.2)'
          : 'rgba(14, 165, 160, 0.15)'
      }}
    >
      {/* Icône Sun (gauche — thème clair) */}
      <Sun
        size={12}
        className="absolute left-1.5 transition-opacity duration-200"
        style={{
          color: isDark ? '#8B94A3' : '#0EA5A0',
          opacity: isDark ? 0.4 : 1
        }}
      />

      {/* Curseur mobile */}
      <span
        className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out"
        style={{
          backgroundColor: isDark ? '#8B94A3' : '#0EA5A0',
          transform: isDark
            ? 'translateX(0px)'
            : 'translateX(28px)'
        }}
      >
        {isDark
          ? <Moon size={10} className="text-[#0B0F14]" />
          : <Sun size={10} className="text-white" />
        }
      </span>

      {/* Icône Moon (droite — thème sombre) */}
      <Moon
        size={12}
        className="absolute right-1.5 transition-opacity duration-200"
        style={{
          color: isDark ? '#8B94A3' : '#8B94A3',
          opacity: isDark ? 1 : 0.4
        }}
      />
    </button>
  );
};

export default ThemeToggle;
