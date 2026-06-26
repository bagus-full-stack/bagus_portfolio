import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import {
  Profile,
  Experience,
  Project,
  Skill,
  Certification,
  ContactForm,
  Message,
  Session,
  VisitorLog,
  ChartDataPoint,
  AnalyticsMetrics
} from '../types';
import {
  mockProfile,
  mockExperiences,
  mockProjects,
  mockSkills,
  mockCertifications,
  mockMessages,
  mockSessions,
  mockVisitorLogs,
  mockChartData7Days,
  mockChartData30Days,
  mockChartData90Days,
  mockAnalyticsMetrics
} from '../data';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Global HTTP Interceptor for Supabase
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  try {
    const response = await fetch(input, init);
    
    // Intercepter les erreurs 401 Unauthorized
    if (response.status === 401) {
      const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
      if (!url.includes('/auth/v1/logout')) {
        console.warn('401 Unauthorized intercepté, déconnexion forcée...');
        // Let the application handle it (e.g., event listener or direct logout)
        // Note: we can't easily call supabase.auth.signOut() here because supabase isn't initialized yet
        // However, this fetcher is used *by* the supabase client. 
        // Best is to trigger a custom event that the AuthContext can listen to.
        window.dispatchEvent(new CustomEvent('supabase:401'));
      }
    }

    if (!response.ok) {
      if (response.status !== 404 && response.status !== 401) {
        console.error(`[Supabase HTTP Error] ${response.status} ${response.statusText}`, response.url);
      }
      if (response.status >= 500) {
        toast.error('Erreur serveur réseau. Veuillez réessayer plus tard.');
      }
    }
    return response;
  } catch (error) {
    console.error('[Supabase Network Error]', error);
    toast.error('Erreur réseau de connexion à Supabase.');
    throw error;
  }
};

// Only create a real client if keys are present
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      global: {
        fetch: customFetch
      }
    }) 
  : null;

// Helper to simulate network delay for mock data
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const SupabaseService = {
  async getProfile(): Promise<Profile> {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*').single();
      if (error) {
        return mockProfile;
      }
      return data as Profile;
    }
    await delay(500);
    return mockProfile;
  },

  async getExperiences(): Promise<Experience[]> {
    if (supabase) {
      const { data, error } = await supabase.from('experiences').select('*').order('start_date', { ascending: false });
      if (error) {
        return mockExperiences;
      }
      return data as Experience[];
    }
    await delay(500);
    return mockExperiences;
  },

  async getProjects(): Promise<Project[]> {
    if (supabase) {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        return mockProjects;
      }
      return data as Project[];
    }
    await delay(500);
    return mockProjects;
  },

  async getProjectBySlug(slug: string): Promise<Project | null> {
    if (supabase) {
      const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).single();
      if (error) {
        return mockProjects.find(p => p.slug === slug) || null;
      }
      return data as Project;
    }
    await delay(500);
    return mockProjects.find(p => p.slug === slug) || null;
  },

  async getSkills(): Promise<Skill[]> {
    if (supabase) {
      const { data, error } = await supabase.from('skills').select('*');
      if (error) {
        return mockSkills;
      }
      return data as Skill[];
    }
    await delay(500);
    return mockSkills;
  },

  async getCertifications(): Promise<Certification[]> {
    if (supabase) {
      const { data, error } = await supabase.from('certifications').select('*').order('date', { ascending: false });
      if (error) {
        return mockCertifications;
      }
      return data as Certification[];
    }
    await delay(500);
    return mockCertifications;
  },

  async getMessages(): Promise<Message[]> {
    if (supabase) {
      const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (error) {
        return mockMessages;
      }
      return data as Message[];
    }
    await delay(500);
    return mockMessages;
  },

  async getMessageById(id: string): Promise<Message | null> {
    if (supabase) {
      const { data, error } = await supabase.from('messages').select('*').eq('id', id).single();
      if (error) {
        return mockMessages.find(m => m.id === id) || null;
      }
      return data as Message;
    }
    await delay(500);
    return mockMessages.find(m => m.id === id) || null;
  },

  async updateMessageReadStatus(id: string, read: boolean): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('messages').update({ read }).eq('id', id);
      if (error) throw error;
      return;
    }
    await delay(500);
    const msg = mockMessages.find(m => m.id === id);
    if (msg) msg.read = read;
  },

  async deleteMessage(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    await delay(500);
    const idx = mockMessages.findIndex(m => m.id === id);
    if (idx !== -1) mockMessages.splice(idx, 1);
  },

  async submitContactForm(form: ContactForm): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('messages').insert([
        { 
          name: form.name, 
          email: form.email, 
          subject: form.subject, 
          message: form.message 
          // read defaults to false, created_at is handled by DB
        }
      ]);
      if (error) {
        console.error('Supabase submitContactForm error:', error);
        throw error;
      }
      return;
    }
    await delay(1000);
    if (Math.random() < 0.1) throw new Error('Mock network error');
  },

  // Mock view count since it's not in the requested table schema,
  // but requested in the SupabaseService methods list
  async incrementViewCount(): Promise<number> {
    await delay(100);
    return 1337;
  },

  async getViewCount(): Promise<number> {
    await delay(100);
    return 1337;
  },

  async getSessions(): Promise<Session[]> {
    await delay(500);
    return mockSessions;
  },

  async revokeSession(id: string): Promise<void> {
    await delay(500);
    const index = mockSessions.findIndex(s => s.id === id);
    if (index !== -1) mockSessions.splice(index, 1);
  },

  async revokeAllOtherSessions(): Promise<void> {
    await delay(800);
    const current = mockSessions.find(s => s.isCurrent);
    mockSessions.length = 0;
    if (current) mockSessions.push(current);
  },

  async getVisitorLogs(): Promise<VisitorLog[]> {
    await delay(600);
    return mockVisitorLogs;
  },

  async getAnalyticsChart(period: '7' | '30' | '90'): Promise<ChartDataPoint[]> {
    await delay(600);
    if (period === '7') return mockChartData7Days;
    if (period === '30') return mockChartData30Days;
    return mockChartData90Days;
  },

  async getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
    await delay(500);
    return mockAnalyticsMetrics;
  },

  async sendChatMessage(message: string, history: any[]): Promise<string> {
    const res = await fetch('/api/chat-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) {
      throw new Error('Failed to fetch chat response');
    }
    const data = await res.json();
    return data.response;
  }
};
