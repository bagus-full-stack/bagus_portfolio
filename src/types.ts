export interface Profile {
  id: string;
  name: string;
  title: string;
  title_fr?: string;
  title_en?: string;
  bio: string;
  bio_short?: string;
  bio_short_fr?: string;
  bio_short_en?: string;
  bio_full?: string;
  bio_full_fr?: string;
  bio_full_en?: string;
  location: string;
  photo_url?: string;
  cv_url?: string;
  cv_updated_at?: string;
  cv_fullstack_url?: string;
  cv_fullstack_updated_at?: string;
  cv_ai_url?: string;
  cv_ai_updated_at?: string;
  email?: string;
  linkedin_url?: string;
  github_url?: string;
  calendly_url?: string;
  [key: string]: any;
}

export interface Experience {
  id: string;
  type: 'pro' | 'education';
  title: string;
  title_fr?: string;
  title_en?: string;
  organization: string;
  organization_fr?: string;
  organization_en?: string;
  start_date: string;
  end_date: string | null;
  description: string;
  description_fr?: string;
  description_en?: string;
  stack?: string[];
  location?: string;
  [key: string]: any;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  title_fr?: string;
  title_en?: string;
  description: string;
  description_fr?: string;
  description_en?: string;
  cover_image?: string;
  stack: string[];
  context: string;
  context_fr?: string;
  context_en?: string;
  technical_choices: { choice: string; reason: string }[];
  challenges: string[];
  challenges_fr?: string[];
  challenges_en?: string[];
  results: { metric: string; value: string }[];
  github_url?: string;
  live_url?: string;
  status: 'production' | 'beta' | 'archived' | 'conception';
  architecture?: string;
  architecture_nodes?: any[];
  architecture_edges?: any[];
  [key: string]: any;
}

export interface Skill {
  id: string;
  name: string;
  name_fr?: string;
  name_en?: string;
  category: string;
  [key: string]: any;
}

export interface Certification {
  id: string;
  name: string;
  name_fr?: string;
  name_en?: string;
  issuer: string;
  issuer_fr?: string;
  issuer_en?: string;
  date: string;
  verify_url?: string;
  [key: string]: any;
}

export interface ContactForm {
  name: string;
  email: string;
  subject?: string;
  message: string;
  website?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface ForgotForm {
  email: string;
}

export interface ResetForm {
  password: string;
  confirm: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface AdminMessage {
  id: string;
  name: string;
  excerpt: string;
  date: string;
  read: boolean;
}

export interface DashboardStats {
  totalViews: number;
  todayViews: number;
  unreadMessages: number;
  publishedProjects: number;
  viewsChange: number;
  recentMessages: AdminMessage[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface Session {
  id: string;
  device: 'desktop' | 'mobile' | 'unknown';
  location: string;
  createdAt: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface VisitorLog {
  id: string;
  date: string;
  country: string;
  countryCode: string;
  city: string;
  page: string;
  duration: number;
}

export interface ChartDataPoint {
  date: string;
  views: number;
}

export interface AnalyticsMetrics {
  topPage: string;
  topCountry: string;
  avgDuration: number;
  bounceRate: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

export interface SearchResult {
  id: string;
  type: 'project' | 'skill' | 'experience' | 'certification' | 'other';
  title: string;
  excerpt: string;
  url: string;
  tags?: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  quote_fr?: string;
  quote_en?: string;
  authorName: string;
  authorRole: string;
  author_role_fr?: string;
  author_role_en?: string;
  authorCompany: string;
  linkedinUrl: string;
  order: number;
  [key: string]: any;
}

export interface AppNotification {
  id: string;
  type: 'message' | 'visitor' | 'error' | 'save';
  message: string;
  timestamp: string;
  read: boolean;
  sourceUrl?: string;
}

export interface ActivityLog {
  id: string;
  type: 'content' | 'message' | 'auth' | 'error';
  description: string;
  timestamp: string;
}

export interface SearchResults {
  projects: SearchResult[];
  skills: SearchResult[];
  experiences: SearchResult[];
  certifications: SearchResult[];
}
