import { useState, useRef, useCallback } from 'react';

export const useAutoSave = (saveFn: () => Promise<void>, delay = 800) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const triggerSave = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setSaveState('saving');
    timeoutRef.current = setTimeout(async () => {
      await saveFn();
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, delay);
  }, [saveFn, delay]);

  return { triggerSave, saveState };
};
