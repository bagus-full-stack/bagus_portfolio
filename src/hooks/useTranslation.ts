import React, { useState, useEffect } from 'react';
import { I18nService } from '../services/i18n.service';

export function useTranslation() {
  const [lang, setLang] = useState(I18nService.getCurrentLang());

  useEffect(() => {
    return I18nService.subscribe(setLang);
  }, []);

  const t = (key: string, options?: { returnObjects?: boolean; [key: string]: any }) => I18nService.translate(key, options);

  return { t, lang };
}
