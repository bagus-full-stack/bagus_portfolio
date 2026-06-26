import { SearchResults, SearchResult } from '../types';
import { mockProjects, mockSkills, mockExperiences, mockCertifications } from '../data';

class SearchServiceClass {
  private cache = new Map<string, SearchResults>();

  async search(query: string): Promise<SearchResults> {
    const trimmedQuery = query.trim().toLowerCase();
    
    if (!trimmedQuery) {
      return { projects: [], skills: [], experiences: [], certifications: [] };
    }

    if (this.cache.has(trimmedQuery)) {
      return this.cache.get(trimmedQuery)!;
    }

    // Simulate network delay for realistic debounce testing
    await new Promise(resolve => setTimeout(resolve, 100));

    const results: SearchResults = {
      projects: [],
      skills: [],
      experiences: [],
      certifications: []
    };

    // Search Projects (title, description, stack)
    mockProjects.forEach(p => {
      const matchTitle = p.title.toLowerCase().includes(trimmedQuery);
      const matchDesc = p.description.toLowerCase().includes(trimmedQuery);
      const matchStack = p.stack.some(s => s.toLowerCase().includes(trimmedQuery));
      
      if (matchTitle || matchDesc || matchStack) {
        results.projects.push({
          id: p.id,
          type: 'project',
          title: p.title,
          excerpt: p.description,
          url: `/projects/${p.slug}`,
          tags: p.stack
        });
      }
    });

    // Search Skills (name, category)
    mockSkills.forEach(s => {
      if (s.name.toLowerCase().includes(trimmedQuery) || s.category.toLowerCase().includes(trimmedQuery)) {
        results.skills.push({
          id: s.id,
          type: 'skill',
          title: s.name,
          excerpt: s.category,
          url: '/#skills'
        });
      }
    });

    // Search Experiences (title, organization)
    mockExperiences.forEach(e => {
      if (e.title.toLowerCase().includes(trimmedQuery) || e.organization.toLowerCase().includes(trimmedQuery)) {
        results.experiences.push({
          id: e.id,
          type: 'experience',
          title: e.title,
          excerpt: e.organization,
          url: '/#experience'
        });
      }
    });

    // Search Certifications (name, issuer)
    mockCertifications.forEach(c => {
      if (c.name.toLowerCase().includes(trimmedQuery) || c.issuer.toLowerCase().includes(trimmedQuery)) {
        results.certifications.push({
          id: c.id,
          type: 'certification',
          title: c.name,
          excerpt: c.issuer,
          url: '/#certifications'
        });
      }
    });

    this.cache.set(trimmedQuery, results);
    return results;
  }
}

export const SearchService = new SearchServiceClass();
