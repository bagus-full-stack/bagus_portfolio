import React, { useState, useEffect } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Testimonial } from '../types';
import DOMPurify from 'dompurify';
import { useLocalizedField } from '../hooks/useLocalizedField';
import { supabase } from '../services/supabase.service';

// Quotes longer than this are cut to 6 lines with a "read more" (about 6 lines in a 3-column card)
const LONG_QUOTE = 280;

export function TestimonialsSection() {
  const { t } = useLocalizedField();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [openQuote, setOpenQuote] = useState<Testimonial | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchTestimonials = async () => {
      const { data, error } = supabase
        ? await supabase.from('testimonials').select('*').order('order', { ascending: true })
        : { data: null, error: true };
      if (!mounted) return;
      // Table columns are snake_case; the component reads camelCase. On error the section stays hidden.
      setTestimonials(error || !data ? [] : data.map((r: any) => ({
        ...r,
        authorName: r.author_name,
        authorRole: r.author_role,
        authorCompany: r.author_company,
        linkedinUrl: r.linkedin_url
      })));
      setLoading(false);
    };
    fetchTestimonials();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!openQuote) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenQuote(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openQuote]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isHovered || testimonials.length <= visibleCount) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (testimonials.length - visibleCount + 1));
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isHovered, testimonials.length, visibleCount]);

  if (!loading && testimonials.length === 0) {
    return null; // hide if empty
  }

  const nextSlide = () => {
    if (currentIndex < testimonials.length - visibleCount) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <section 
      id="testimonials" 
      className="py-24 bg-bg-primary relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="font-space font-bold text-3xl md:text-4xl text-text-primary mb-16 relative inline-block">
          Ce qu'ils disent
          <div className="absolute -bottom-4 left-0 w-1/2 h-1 bg-accent-ocre"></div>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--bg-card)] border border-white/5 p-8 rounded-xl h-[300px] animate-pulse">
                <div className="w-10 h-10 bg-white/5 rounded-full mb-6" />
                <div className="space-y-3 mb-8">
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-5/6" />
                  <div className="h-4 bg-white/5 rounded w-4/6" />
                </div>
                <div className="mt-auto flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full" />
                  <div>
                    <div className="h-4 bg-white/5 rounded w-24 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out gap-6"
                style={{ 
                  transform: `translateX(calc(-${currentIndex * (100 / visibleCount)}% - ${currentIndex * (24 / visibleCount)}px))` 
                }}
              >
                {testimonials.map(testimonial => {
                  const safeUrl = testimonial.linkedinUrl && (testimonial.linkedinUrl.startsWith('http://') || testimonial.linkedinUrl.startsWith('https://'))
                    ? DOMPurify.sanitize(testimonial.linkedinUrl, { ALLOWED_TAGS: [] })
                    : '#';
                  
                  return (
                    <div 
                      key={testimonial.id}
                      className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] bg-[var(--bg-card)] border border-white/5 p-8 rounded-xl relative hover:border-[#E08A3E] transition-colors duration-200 flex flex-col group snap-center"
                    >
                      <span className="font-space text-6xl text-[#E08A3E] opacity-40 absolute top-4 left-6 leading-none">"</span>
                      
                      <div className="relative z-10 mb-8 pt-4 flex-grow">
                        <p className="font-inter text-[16px] text-[var(--text-primary)] leading-[1.7] line-clamp-6">
                          {DOMPurify.sanitize(t(testimonial, 'quote') || '', { ALLOWED_TAGS: [] })}
                        </p>
                        {(t(testimonial, 'quote') || '').length > LONG_QUOTE && (
                          <button
                            onClick={() => setOpenQuote(testimonial)}
                            className="mt-3 text-sm font-inter font-medium text-accent-ocre hover:underline"
                          >
                            Lire la suite
                          </button>
                        )}
                      </div>
                      
                      <div className="h-[1px] w-full bg-[var(--border-subtle)] opacity-30 mb-6"></div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <h4 className="font-space font-bold text-[var(--text-primary)]">{DOMPurify.sanitize(testimonial.authorName || '', { ALLOWED_TAGS: [] })}</h4>
                          <p className="font-inter text-sm text-[var(--text-muted)]">
                            {DOMPurify.sanitize(t(testimonial, 'author_role') || '', { ALLOWED_TAGS: [] })}, {DOMPurify.sanitize(testimonial.authorCompany || '', { ALLOWED_TAGS: [] })}
                          </p>
                        </div>
                        {safeUrl !== '#' && (
                          <a 
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-cyan hover:opacity-80 transition-opacity font-mono p-2 bg-accent-cyan/10 rounded-full"
                            title="Profil LinkedIn"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {testimonials.length > visibleCount && (
              <div className="flex items-center justify-between mt-12">
                <div className="flex gap-2">
                  {Array.from({ length: testimonials.length - visibleCount + 1 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        currentIndex === i ? 'bg-[#E08A3E]' : 'bg-[var(--border-subtle)] hover:bg-[#E08A3E]/50'
                      }`}
                      aria-label={`Aller au groupe de témoignages ${i + 1}`}
                    />
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                    aria-label="Témoignage précédent"
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-primary hover:text-[#E08A3E] hover:border-[#E08A3E] transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-text-primary"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={nextSlide}
                    disabled={currentIndex >= testimonials.length - visibleCount}
                    aria-label="Témoignage suivant"
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-primary hover:text-[#E08A3E] hover:border-[#E08A3E] transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-text-primary"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {openQuote && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setOpenQuote(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Témoignage complet"
        >
          <div
            className="bg-bg-card border border-white/10 rounded-xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button onClick={() => setOpenQuote(null)} aria-label="Fermer" className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
            <p className="font-inter text-[16px] text-[var(--text-primary)] leading-[1.7] whitespace-pre-line">
              {DOMPurify.sanitize(t(openQuote, 'quote') || '', { ALLOWED_TAGS: [] })}
            </p>
            <div className="mt-6 pt-4 border-t border-white/10">
              <h4 className="font-space font-bold text-[var(--text-primary)]">{DOMPurify.sanitize(openQuote.authorName || '', { ALLOWED_TAGS: [] })}</h4>
              <p className="font-inter text-sm text-[var(--text-muted)]">
                {DOMPurify.sanitize(t(openQuote, 'author_role') || '', { ALLOWED_TAGS: [] })}, {DOMPurify.sanitize(openQuote.authorCompany || '', { ALLOWED_TAGS: [] })}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
