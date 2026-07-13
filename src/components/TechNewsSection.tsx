import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, Calendar } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  cover_image: string;
  readable_publish_date: string;
  reading_time_minutes: number;
  tag_list: string[];
}

export function TechNewsSection() {
  const { t, lang } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function fetchNews() {
      try {
        const response = await fetch(`/api/news?lang=${lang}`);
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        if (mounted) {
          // Dev.to API can return articles without cover_image, filter to show nice ones
          const withImages = data.filter((a: Article) => a.cover_image).slice(0, 3);
          // If not enough with images, just take the first 3
          const finalArticles = withImages.length === 3 ? withImages : data.slice(0, 3);
          setArticles(finalArticles);
          setLoading(false);
        }
      } catch (err) {
        // console.error(err);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    }
    
    fetchNews();
    return () => { mounted = false; };
  }, [lang]);

  if (error || (!loading && articles.length === 0)) {
    return null; // Hide the section quietly on error or no data
  }

  return (
    <section id="news" className="py-24 bg-bg-primary">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary">{t('tech_news.title')}</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-bg-card/50 border border-white/5 h-[400px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <a 
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-bg-card border border-white/5 hover:border-accent-ocre/50 transition-colors duration-300"
              >
                {article.cover_image ? (
                  <div className="relative h-48 w-full overflow-hidden bg-bg-primary">
                    <img 
                      src={article.cover_image} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-bg-primary/50 flex items-center justify-center border-b border-white/5">
                    <span className="text-text-muted font-space text-sm">TECH NEWS</span>
                  </div>
                )}
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tag_list.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs font-mono text-accent-cyan bg-accent-cyan/10 px-2 py-1">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-space font-bold text-text-primary mb-3 line-clamp-2 group-hover:text-accent-ocre transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-text-muted font-inter line-clamp-3 mb-6 flex-1">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 text-xs text-text-muted font-mono">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {article.readable_publish_date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {article.reading_time_minutes} {t('tech_news.minutes_read')}</span>
                    </div>
                    <ExternalLink size={16} className="text-text-primary group-hover:text-accent-ocre transition-colors opacity-50 group-hover:opacity-100" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
