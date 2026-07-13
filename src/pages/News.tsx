import React, { useEffect } from 'react';
import { TechNewsSection } from '../components/TechNewsSection';
import { SEOHead } from '../components/SEOHead';
import { useTranslation } from '../hooks/useTranslation';

export function NewsPage() {
  const { t } = useTranslation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 min-h-screen">
      <SEOHead meta={{
        title: `${t('tech_news.title')} | Assami Baga`,
        description: "Retrouvez les dernières actualités Tech selectionnées."
      }} />
      <TechNewsSection />
    </div>
  );
}
