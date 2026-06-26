export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  photo_url?: string;
  cv_url?: string;
  email?: string;
  linkedin_url?: string;
  github_url?: string;
  calendly_url?: string;
}

export interface Experience {
  id: string;
  type: 'pro' | 'education';
  title: string;
  organization: string;
  start_date: string;
  end_date: string | null;
  description: string;
  stack?: string[];
  location?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image?: string;
  stack: string[];
  context: string;
  technical_choices: { choice: string; reason: string }[];
  challenges: string[];
  results: { metric: string; value: string }[];
  github_url?: string;
  live_url?: string;
  status: 'production' | 'beta' | 'archived';
  architecture?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  verify_url?: string;
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
  type: 'project' | 'skill' | 'experience' | 'certification';
  title: string;
  excerpt: string;
  url: string;
  tags?: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  linkedinUrl: string;
  order: number;
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
