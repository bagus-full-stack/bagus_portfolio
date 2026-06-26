import { useState, useEffect } from 'react';

const sections = ['hero', 'about', 'skills', 'experiences', 'testimonials', 'certifications', 'projects', 'contact'];

let globalIsActive = false;
let globalCurrentIndex = 0;
const listeners = new Set<() => void>();

const updateState = (active: boolean, index: number) => {
  globalIsActive = active;
  globalCurrentIndex = index;
  listeners.forEach(l => l());
};

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.altKey && (e.key === 'p' || e.key === 'P')) {
      updateState(!globalIsActive, globalIsActive ? globalCurrentIndex : 0);
      return;
    }
    if (!globalIsActive) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      updateState(globalIsActive, Math.min(globalCurrentIndex + 1, sections.length - 1));
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      updateState(globalIsActive, Math.max(globalCurrentIndex - 1, 0));
    }
    if (e.key === 'Escape') updateState(false, globalCurrentIndex);
  });
}

export const usePresentationMode = () => {
  const [isActive, setIsActive] = useState(globalIsActive);
  const [currentIndex, setCurrentIndex] = useState(globalCurrentIndex);

  useEffect(() => {
    const handleUpdate = () => {
      setIsActive(globalIsActive);
      setCurrentIndex(globalCurrentIndex);
    };
    listeners.add(handleUpdate);
    return () => { listeners.delete(handleUpdate); };
  }, []);

  useEffect(() => {
    if (!isActive) return;
    document.getElementById(sections[currentIndex])?.scrollIntoView({ behavior: 'smooth' });
  }, [currentIndex, isActive]);

  useEffect(() => {
    document.body.style.overflow = isActive ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isActive]);

  return {
    isActive,
    currentIndex,
    total: sections.length,
    deactivate: () => updateState(false, globalCurrentIndex)
  };
};
