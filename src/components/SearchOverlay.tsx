import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Folder, Award, Briefcase, Zap, ArrowRight } from 'lucide-react';
import { SearchService } from '../services/search.service';
import { SearchResults, SearchResult } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = ['AgroSahel AI', 'PyTorch', 'FastAPI', 'Angular'];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchCache = useRef<Map<string, SearchResults>>(new Map());
  const navigate = useNavigate();

  // Debounce logic
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    if (searchCache.current.has(query)) {
      setResults(searchCache.current.get(query)!);
      setActiveIndex(0);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await SearchService.search(query);
        searchCache.current.set(query, res);
        setResults(res);
        setActiveIndex(0);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setResults(null);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const defaultSuggestions: SearchResult[] = [
    { id: '1', title: 'AgroSahel AI', url: '/projects/agrosahel-ai', type: 'project', excerpt: '' },
    { id: '2', title: 'PyTorch', url: '/#skills', type: 'skill', excerpt: '' },
    { id: '3', title: 'FastAPI', url: '/#skills', type: 'skill', excerpt: '' },
    { id: '4', title: 'Me contacter', url: '/#contact', type: 'other', excerpt: '' }
  ];

  const flatResults: SearchResult[] = [];
  if (!query.trim()) {
    flatResults.push(...defaultSuggestions);
  } else if (results) {
    flatResults.push(...results.projects);
    flatResults.push(...results.skills);
    flatResults.push(...results.experiences);
    flatResults.push(...results.certifications);
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (!flatResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatResults.length) {
        const selected = flatResults[activeIndex];
        if (selected) {
          onClose();
          navigate(selected.url);
        }
      }
    }
  }, [flatResults, activeIndex, onClose, navigate]);

  if (!isOpen) return null;

  const renderGroup = (title: string, items: SearchResult[], icon: React.ReactNode) => {
    if (!items.length) return null;
    return (
      <div className="mb-6 last:mb-0">
        <div className="flex items-center gap-2 mb-3 px-4">
          <span className="text-text-muted">{icon}</span>
          <h3 className="font-mono text-xs font-bold text-text-muted uppercase tracking-wider">{title}</h3>
        </div>
        <div className="flex flex-col">
          {items.map(item => {
            const index = flatResults.findIndex(r => r.id === item.id && r.type === item.type);
            const isActive = index === activeIndex;
            return (
              <button
                key={`${item.type}-${item.id}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  onClose();
                  navigate(item.url);
                }}
                className={`flex items-center text-left p-3 mx-2 rounded-lg transition-colors border-l-2 ${
                  isActive 
                    ? 'bg-[#E08A3E]/15 border-[#E08A3E] text-white' 
                    : 'border-transparent text-text-primary hover:bg-white/5'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium truncate ${isActive ? 'font-bold' : ''}`}>
                      {item.title}
                    </span>
                    {item.tags && item.tags.length > 0 && (
                      <span className="flex gap-1 overflow-hidden flex-nowrap">
                        {item.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10 whitespace-nowrap">
                            {tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                  {item.excerpt && <p className="text-xs text-text-muted truncate mt-1">{item.excerpt}</p>}
                </div>
                {isActive && <ArrowRight size={16} className="text-accent-ocre flex-shrink-0 ml-3" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-[#0B0F14]/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[640px] bg-[#141B22] border border-[#9BA4B5]/30 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="relative flex items-center p-4 border-b border-white/5">
          <Search size={20} className="text-accent-cyan absolute left-4" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un projet, une compétence..."
            className="w-full bg-transparent border-none outline-none text-text-primary pl-10 pr-12 py-2 placeholder:text-text-muted/50"
          />
          <div className="absolute right-4 font-mono text-[10px] bg-[#0B0F14] text-text-muted px-1.5 py-1 rounded border border-white/10 hidden sm:block">
            ESC
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 max-h-[400px] p-2 hide-scrollbar">
          {!query.trim() ? (
            <div className="py-2">
              {renderGroup('Suggestions', defaultSuggestions, <Search size={14} />)}
            </div>
          ) : isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : flatResults.length > 0 ? (
            <div className="py-2">
              {renderGroup('Projets', results!.projects, <Folder size={14} />)}
              {renderGroup('Compétences', results!.skills, <Zap size={14} />)}
              {renderGroup('Expériences', results!.experiences, <Briefcase size={14} />)}
              {renderGroup('Certifications', results!.certifications, <Award size={14} />)}
            </div>
          ) : (
            <div className="py-12 px-4 text-center">
              <p className="text-text-primary mb-2">Aucun résultat pour « {query} »</p>
              <p className="text-sm text-text-muted">Essayez une compétence ou un projet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
