import { useEffect, useRef } from 'react';
import { SupabaseService } from '../services/supabase.service';

export function useSectionTracker(sectionName: string) {
  const ref = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    let enterTime: number | null = null;
    let accumulatedTime = 0;
    
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        enterTime = Date.now();
      } else {
        if (enterTime) {
          const timeSpent = Math.floor((Date.now() - enterTime) / 1000);
          accumulatedTime += timeSpent;
          
          if (timeSpent >= 2) {
            SupabaseService.trackEvent('section_view', sectionName, timeSpent);
          }
          enterTime = null;
        }
      }
    }, { threshold: 0.5 }); // Require 50% visibility

    observer.observe(node);

    return () => {
      if (enterTime) {
        const timeSpent = Math.floor((Date.now() - enterTime) / 1000);
        if (timeSpent >= 2) {
          SupabaseService.trackEvent('section_view', sectionName, timeSpent);
        }
      }
      observer.disconnect();
    };
  }, [sectionName]);

  return ref;
}
