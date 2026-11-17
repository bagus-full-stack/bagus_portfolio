import { SearchResults } from '../types';
import { supabase } from './supabase.service';

interface SearchData {
  projects: { id: string; slug: string; title: string; description: string; stack: string[] | null }[];
  skills: { id: string; name: string; category: string }[];
  experiences: { id: string; title: string; organization: string }[];
  certifications: { id: string; name: string; issuer: string }[];
}

const EMPTY: SearchResults = { projects: [], skills: [], experiences: [], certifications: [] };

class SearchServiceClass {
  private data: Promise<SearchData> | null = null;

  // Les 4 tables sont lues une seule fois ; une erreur n'est pas mise en cache
  private load(): Promise<SearchData> {
    if (!supabase) return Promise.resolve({ projects: [], skills: [], experiences: [], certifications: [] });
    const db = supabase;
    this.data = Promise.all([
      db.from('projects').select('id, slug, title, description, stack'),
      db.from('skills').select('id, name, category'),
      db.from('experiences').select('id, title, organization'),
      db.from('certifications').select('id, name, issuer')
    ]).then(([p, s, e, c]) => {
      const failed = p.error || s.error || e.error || c.error;
      if (failed) throw failed;
      return {
        projects: p.data || [],
        skills: s.data || [],
        experiences: e.data || [],
        certifications: c.data || []
      } as SearchData;
    }).catch(err => {
      this.data = null;
      throw err;
    });
    return this.data;
  }

  async search(query: string): Promise<SearchResults> {
    const q = query.trim().toLowerCase();
    if (!q) return EMPTY;

    const { projects, skills, experiences, certifications } = await (this.data ?? this.load());
    const has = (v?: string | null) => (v || '').toLowerCase().includes(q);

    return {
      projects: projects
        .filter(p => has(p.title) || has(p.description) || (p.stack || []).some(has))
        .map(p => ({ id: p.id, type: 'project' as const, title: p.title, excerpt: p.description, url: `/projects/${p.slug}`, tags: p.stack || [] })),
      skills: skills
        .filter(s => has(s.name) || has(s.category))
        .map(s => ({ id: s.id, type: 'skill' as const, title: s.name, excerpt: s.category, url: '/#skills' })),
      experiences: experiences
        .filter(e => has(e.title) || has(e.organization))
        .map(e => ({ id: e.id, type: 'experience' as const, title: e.title, excerpt: e.organization, url: '/#experience' })),
      certifications: certifications
        .filter(c => has(c.name) || has(c.issuer))
        .map(c => ({ id: c.id, type: 'certification' as const, title: c.name, excerpt: c.issuer, url: '/#certifications' }))
    };
  }
}

export const SearchService = new SearchServiceClass();
