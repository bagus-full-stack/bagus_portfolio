import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export const useAutoSave = (saveFn: () => Promise<void>, delay = 800) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const idleRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => {
    clearTimeout(timeoutRef.current);
    clearTimeout(idleRef.current);
  }, []);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const triggerSave = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setSaveState('saving');
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFn();
        setSaveState('saved');
        idleRef.current = setTimeout(() => setSaveState('idle'), 2000);
      } catch {
        setSaveState('idle');
        toast.error('Échec de la sauvegarde');
      }
    }, delay);
  }, [saveFn, delay]);

  return { triggerSave, saveState };
};
