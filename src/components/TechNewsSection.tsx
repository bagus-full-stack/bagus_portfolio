import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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

const PAGE_SIZE = 6; // 3 columns x 2 rows on desktop
const PER_SOURCE = 12; // pool per source: 24 articles = 4 pages

// The HN front page is generic: keep only AI and software-development stories
const HN_TOPICS = /\b(ai|llms?|gpt|openai|anthropic|claude|gemini|agents?|machine learning|neural|inference|rust|python|golang|java|javascript|typescript|react|node|ruby|rails|wasm|webassembly|api|sdk|compiler|code|coding|programming|developers?|software|open[- ]source|github|git|database|sql|postgres|sqlite|linux|kernel|docker|kubernetes|devops|servers?|rce|css|html|framework)\b/i;

export function TechNewsSection() {
  const { t, lang } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    
    // Public APIs with open CORS (no key, static site): dev.to (AI + web) and Hacker News.
    // allSettled: one source being down must not hide the others.
    const devto = async (tag: string): Promise<Article[]> => {
      const r = await fetch(`https://dev.to/api/articles?tag=${tag}&top=7&per_page=30`);
      if (!r.ok) throw new Error(`dev.to ${tag}`);
      return (await r.json()).filter((a: any) => a.language === 'en' || a.language === 'fr');
    };
    const hackerNews = async (): Promise<Article[]> => {
      const r = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30');
      if (!r.ok) throw new Error('hn');
      return (await r.json()).hits.filter((h: any) => h.title && HN_TOPICS.test(h.title)).map((h: any) => ({
        id: Number(h.objectID) + 1e9, // keeps React keys distinct from dev.to ids
        title: h.title,
        description: `${h.points} points · ${h.num_comments ?? 0} comments`,
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        cover_image: '',
        readable_publish_date: new Date(h.created_at).toLocaleDateString(lang, { day: 'numeric', month: 'short' }),
        reading_time_minutes: 0,
        tag_list: ['hackernews'],
      }));
    };

    async function fetchNews() {
      const [ai, web, hn] = await Promise.allSettled([devto('ai'), devto('webdev'), hackerNews()]);
      if (!mounted) return;
      const ok = (r: PromiseSettledResult<Article[]>) => (r.status === 'fulfilled' ? r.value : []);
      const seen = new Set<number>();
      let dev = [...ok(ai), ...ok(web)].filter(a => !seen.has(a.id) && seen.add(a.id));
      const sameLang = dev.filter((a: any) => a.language === lang);
      if (sameLang.length >= 3) dev = sameLang;
      // Prefer articles with a cover image, then interleave the two sources so every page is mixed
      dev = [...dev.filter(a => a.cover_image), ...dev.filter(a => !a.cover_image)].slice(0, PER_SOURCE);
      const hnList = ok(hn).slice(0, PER_SOURCE);
      const all = Array.from({ length: Math.max(dev.length, hnList.length) }).flatMap((_, i) => [dev[i], hnList[i]]).filter(Boolean);
      setPage(1);
      setArticles(all);
      setError(all.length === 0);
      setLoading(false);
    }

    fetchNews();
    return () => { mounted = false; };
  }, [lang]);

  const pageCount = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedArticles = articles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (n: number) => {
    setPage(n);
    document.getElementById('news')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
            {pagedArticles.map(article => (
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
                      {article.reading_time_minutes > 0 && (
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {article.reading_time_minutes} {t('tech_news.minutes_read')}</span>
                      )}
                    </div>
                    <ExternalLink size={16} className="text-text-primary group-hover:text-accent-ocre transition-colors opacity-50 group-hover:opacity-100" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
        {pageCount > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-12" aria-label={t('tech_news.pagination')}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label={t('tech_news.prev_page')}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-primary hover:text-accent-ocre hover:border-accent-ocre transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-text-primary"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                aria-label={`${t('tech_news.page')} ${i + 1}`}
                aria-current={currentPage === i + 1 ? 'page' : undefined}
                className={`w-10 h-10 rounded-full text-sm font-mono transition-colors ${
                  currentPage === i + 1
                    ? 'bg-accent-ocre text-bg-primary font-medium'
                    : 'border border-white/10 text-text-muted hover:text-text-primary hover:border-text-muted'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              aria-label={t('tech_news.next_page')}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-primary hover:text-accent-ocre hover:border-accent-ocre transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-text-primary"
            >
              <ChevronRight size={20} />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
