import { supabase } from './supabase.service';

export interface ImportData {
  version: string;
  exportDate?: string;
  profile?: any;
  experiences?: any[];
  projects?: any[];
  skills?: any[];
  certifications?: any[];
  testimonials?: any[];
}

export interface ImportResult {
  section: string;
  total: number;
  success: number;
  errors: string[];
}

// Only the listed keys, and only when present, so absent translations don't overwrite existing ones with null.
const pickDefined = (obj: any, keys: string[]) =>
  Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

const PROFILE_KEYS = [
  'id', 'name', 'title', 'title_fr', 'title_en', 'bio', 'bio_short', 'bio_short_fr', 'bio_short_en',
  'bio_full', 'bio_full_fr', 'bio_full_en', 'location', 'email', 'linkedin_url', 'github_url',
  'calendly_url', 'photo_url', 'cv_url', 'cv_fullstack_url', 'cv_ai_url',
  'cv_fullstack_fr', 'cv_fullstack_en', 'cv_ai_fr', 'cv_ai_en',
  'years_experience_override', 'projects_count_override'
];

export const importJSON = async (
  data: ImportData,
  sections: string[],
  strategy: 'merge' | 'replace'
): Promise<ImportResult[]> => {
  const results: ImportResult[] = [];

  // PROFIL
  if (sections.includes('profile') && data.profile) {
    try {
      const profileData: Record<string, any> = pickDefined(data.profile, PROFILE_KEYS);
      // Single-profile site: without an id, update the existing row instead of creating a second one.
      if (!profileData.id) {
        const { data: existing } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
        if (existing) profileData.id = existing.id;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);
        
      results.push({
        section: 'Profil',
        total: 1,
        success: error ? 0 : 1,
        errors: error ? [error.message] : []
      });
    } catch (e: any) {
      results.push({
        section: 'Profil',
        total: 1,
        success: 0,
        errors: ['Erreur inattendue']
      });
    }
  }

  // EXPÉRIENCES
  if (sections.includes('experiences') && data.experiences?.length) {
    const result: ImportResult = {
      section: 'Expériences',
      total: data.experiences.length,
      success: 0,
      errors: []
    };

    if (strategy === 'replace') {
      await supabase.from('experiences').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    for (const exp of data.experiences) {
      const { error } = await supabase
        .from('experiences')
        .insert({
          type: exp.type,
          title: exp.title,
          organization: exp.organization,
          location: exp.location,
          start_date: exp.start_date,
          end_date: exp.end_date,
          description: exp.description,
          stack: exp.stack || [],
          ...pickDefined(exp, ['title_fr', 'title_en', 'organization_fr', 'organization_en', 'description_fr', 'description_en'])
        });
        
      if (error) {
        result.errors.push(`${exp.title} : ${error.message}`);
      } else {
        result.success++;
      }
    }
    results.push(result);
  }

  // PROJETS
  if (sections.includes('projects') && data.projects?.length) {
    const result: ImportResult = {
      section: 'Projets',
      total: data.projects.length,
      success: 0,
      errors: []
    };

    if (strategy === 'replace') {
      await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    for (const project of data.projects) {
      const { error } = await supabase
        .from('projects')
        .upsert({
          slug: project.slug,
          title: project.title,
          description: project.description,
          stack: project.stack || [],
          context: project.context,
          technical_choices: project.technical_choices || [],
          challenges: project.challenges || [],
          results: project.results || [],
          github_url: project.github_url,
          live_url: project.live_url,
          status: project.status || 'production',
          architecture_nodes: project.architecture_nodes || [],
          architecture_edges: project.architecture_edges || [],
          ...pickDefined(project, [
            'cover_image', 'title_fr', 'title_en', 'description_fr', 'description_en',
            'context_fr', 'context_en', 'technical_choices_fr', 'technical_choices_en',
            'results_fr', 'results_en', 'challenges_fr', 'challenges_en'
          ])
        }, { onConflict: 'slug' });
        
      if (error) {
        result.errors.push(`${project.title} : ${error.message}`);
      } else {
        result.success++;
      }
    }
    results.push(result);
  }

  // COMPÉTENCES
  if (sections.includes('skills') && data.skills?.length) {
    const result: ImportResult = {
      section: 'Compétences',
      total: data.skills.length,
      success: 0,
      errors: []
    };

    if (strategy === 'replace') {
      await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    for (const skill of data.skills) {
      const { error } = await supabase.from('skills').insert(pickDefined(skill, ['name', 'category']));
      if (error) {
        result.errors.push(`${skill.name} : ${error.message}`);
      } else {
        result.success++;
      }
    }
    results.push(result);
  }

  // CERTIFICATIONS
  if (sections.includes('certifications') && data.certifications?.length) {
    const result: ImportResult = {
      section: 'Certifications',
      total: data.certifications.length,
      success: 0,
      errors: []
    };

    if (strategy === 'replace') {
      await supabase.from('certifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    for (const cert of data.certifications) {
      const { error } = await supabase
        .from('certifications')
        .insert(pickDefined(cert, ['name', 'issuer', 'date', 'verify_url']));
        
      if (error) {
        result.errors.push(`${cert.name} : ${error.message}`);
      } else {
        result.success++;
      }
    }
    results.push(result);
  }

  // TÉMOIGNAGES
  if (sections.includes('testimonials') && data.testimonials?.length) {
    const result: ImportResult = {
      section: 'Témoignages',
      total: data.testimonials.length,
      success: 0,
      errors: []
    };

    if (strategy === 'replace') {
      await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    for (const [index, testimonial] of data.testimonials.entries()) {
      const { error } = await supabase
        .from('testimonials')
        .insert({
          ...pickDefined(testimonial, [
            'quote', 'quote_fr', 'quote_en', 'author_name', 'author_role', 'author_role_fr',
            'author_role_en', 'author_company', 'linkedin_url'
          ]),
          order: index
        });
        
      if (error) {
        result.errors.push(`${testimonial.author_name} : ${error.message}`);
      } else {
        result.success++;
      }
    }
    results.push(result);
  }

  return results;
};
