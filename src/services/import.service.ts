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

export const importJSON = async (
  data: ImportData,
  sections: string[],
  strategy: 'merge' | 'replace'
): Promise<ImportResult[]> => {
  const results: ImportResult[] = [];

  // PROFIL
  if (sections.includes('profile') && data.profile) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');
      
      const profileData = { ...data.profile, id: user.id };
      
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
          stack: exp.stack || []
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
          architecture_edges: project.architecture_edges || []
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

    const { error } = await supabase
      .from('skills')
      .insert(data.skills);

    if (error) {
      result.errors.push(error.message);
    } else {
      result.success = data.skills.length;
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
        .insert(cert);
        
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
        .insert({ ...testimonial, order: index });
        
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
