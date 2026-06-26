import { Project, Certification, Skill, Profile, Experience, Message, Session, VisitorLog, ChartDataPoint, AnalyticsMetrics } from './types';

export const mockSessions: Session[] = [
  {
    id: 'session_1',
    device: 'desktop',
    location: 'Paris, France',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastActive: new Date().toISOString(),
    isCurrent: true
  },
  {
    id: 'session_2',
    device: 'mobile',
    location: 'Lyon, France',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    isCurrent: false
  },
  {
    id: 'session_3',
    device: 'desktop',
    location: 'London, UK',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    isCurrent: false
  }
];

export const mockVisitorLogs: VisitorLog[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `log_${i}`,
  date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString(),
  country: Math.random() > 0.3 ? 'France' : (Math.random() > 0.5 ? 'United States' : 'Canada'),
  countryCode: Math.random() > 0.3 ? 'FR' : (Math.random() > 0.5 ? 'US' : 'CA'),
  city: Math.random() > 0.3 ? 'Paris' : (Math.random() > 0.5 ? 'New York' : 'Montreal'),
  page: Math.random() > 0.4 ? '/' : (Math.random() > 0.5 ? '/projects' : '/about'),
  duration: Math.floor(Math.random() * 300) + 10
})).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const mockChartData7Days: ChartDataPoint[] = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    views: Math.floor(Math.random() * 150) + 20
  };
});

export const mockChartData30Days: ChartDataPoint[] = Array.from({ length: 30 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    views: Math.floor(Math.random() * 250) + 50
  };
});

export const mockChartData90Days: ChartDataPoint[] = Array.from({ length: 90 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (89 - i));
  return {
    date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    views: Math.floor(Math.random() * 300) + 80
  };
});

export const mockAnalyticsMetrics: AnalyticsMetrics = {
  topPage: '/projects',
  topCountry: 'France',
  avgDuration: 145, // seconds
  bounceRate: 42.5 // percentage
};

export const mockMessages: Message[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    subject: 'Opportunité de collaboration',
    message: 'Bonjour, je suis très intéressé par votre profil. Êtes-vous ouvert aux offres d\'emploi en ce moment ?',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false
  },
  {
    id: '2',
    name: 'Marie Martin',
    email: 'm.martin@entreprise.com',
    subject: 'Mission Freelance',
    message: 'Suite à notre échange, voici le brief complet pour le projet de refonte. Merci de me faire un retour d\'ici vendredi.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: false
  },
  {
    id: '3',
    name: 'Tech Recruiter',
    email: 'recrutement@startup.io',
    subject: 'Poste Frontend Senior',
    message: 'Nous recherchons un développeur React expérimenté pour rejoindre notre équipe. Votre portfolio est impressionnant.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true
  }
];

export const mockProfile: Profile = {
  id: '1',
  name: 'Ingénieur Full-Stack',
  title: 'Ingénieur Full-Stack',
  bio: 'Ingénieur logiciel full-stack expérimenté, je me spécialise dans la conception et le développement d\'architectures web robustes et scalables. Fort d\'une expertise solide en intégration de modèles d\'intelligence artificielle, j\'accompagne les entreprises dans la transformation de leurs systèmes d\'information en solutions intelligentes et performantes.',
  location: 'Île-de-France, France'
};

export const mockExperiences: Experience[] = [
  {
    id: '1',
    type: 'pro',
    title: 'Ingénieur Full Stack Senior',
    organization: 'TechInnovate Solutions',
    start_date: '2021',
    end_date: null,
    description: 'Lead technique sur la refonte de l\'architecture microservices. Implémentation de pipelines RAG pour l\'analyse de documents internes. Amélioration des performances globales de 40%.',
    stack: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
    location: 'Paris'
  },
  {
    id: '2',
    type: 'pro',
    title: 'Développeur Full Stack',
    organization: 'FinTech Dynamics',
    start_date: '2018',
    end_date: '2021',
    description: 'Développement d\'une plateforme de trading algorithmique. Conception des API REST et de l\'interface de monitoring en temps réel via WebSockets.',
    stack: ['Vue.js', 'Express', 'PostgreSQL', 'Redis'],
    location: 'La Défense'
  },
  {
    id: '3',
    type: 'education',
    title: 'Diplôme d\'Ingénieur en Informatique',
    organization: 'École Supérieure du Digital',
    start_date: '2015',
    end_date: '2018',
    description: 'Spécialisation en Ingénierie Logicielle et Data Science. Projet de fin d\'études sur la classification d\'images par apprentissage profond.',
    location: 'Lyon'
  },
  {
    id: '4',
    type: 'education',
    title: 'Classe Préparatoire aux Grandes Écoles',
    organization: 'Lycée Blaise Pascal',
    start_date: '2013',
    end_date: '2015',
    description: 'Filière Mathématiques, Physique et Sciences de l\'Ingénieur (MPSI). Préparation aux concours d\'entrée des grandes écoles d\'ingénieurs.',
    location: 'Clermont-Ferrand'
  }
];

export const mockCertifications: Certification[] = [
  {
    id: '1',
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    date: '2023-09',
    verify_url: 'https://aws.amazon.com/verification'
  },
  {
    id: '2',
    name: 'Machine Learning Engineering for Production (MLOps)',
    issuer: 'DeepLearning.AI',
    date: '2022-11',
    verify_url: 'https://coursera.org/verify'
  },
  {
    id: '3',
    name: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'Cloud Native Computing Foundation',
    date: '2021-05',
    verify_url: 'https://training.linuxfoundation.org/verify'
  }
];

export const mockSkills: Skill[] = [
  { id: '1', name: 'React', category: 'Frontend' },
  { id: '2', name: 'Vue.js', category: 'Frontend' },
  { id: '3', name: 'TypeScript', category: 'Frontend' },
  { id: '4', name: 'TailwindCSS', category: 'Frontend' },
  { id: '5', name: 'Node.js', category: 'Backend' },
  { id: '6', name: 'Express', category: 'Backend' },
  { id: '7', name: 'Python', category: 'Backend' },
  { id: '8', name: 'FastAPI', category: 'Backend' },
  { id: '9', name: 'TensorFlow', category: 'IA/ML' },
  { id: '10', name: 'PyTorch', category: 'IA/ML' },
  { id: '11', name: 'LangChain', category: 'IA/ML' },
  { id: '12', name: 'OpenAI API', category: 'IA/ML' },
  { id: '13', name: 'Docker', category: 'DevOps' },
  { id: '14', name: 'Kubernetes', category: 'DevOps' },
  { id: '15', name: 'AWS', category: 'DevOps' },
  { id: '16', name: 'CI/CD', category: 'DevOps' },
  { id: '17', name: 'PostgreSQL', category: 'Base de données' },
  { id: '18', name: 'MongoDB', category: 'Base de données' },
  { id: '19', name: 'Redis', category: 'Base de données' },
  { id: '20', name: 'Elasticsearch', category: 'Base de données' }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    slug: 'ai-doc-analyzer',
    title: 'AI Document Analyzer',
    description: 'Pipeline NLP pour extraire et analyser des entités dans des documents légaux.',
    stack: ['Python', 'FastAPI', 'React', 'PostgreSQL'],
    context: 'Les cabinets d\'avocats passent des milliers d\'heures à relire des contrats. L\'objectif était d\'automatiser la détection des clauses à risque.',
    technical_choices: [
      { choice: 'FastAPI', reason: 'Performances asynchrones et validation Pydantic native' },
      { choice: 'React', reason: 'Composants riches pour l\'interface d\'annotation' }
    ],
    challenges: [
      'Gérer de très gros documents PDF sans dépasser la mémoire',
      'Minimiser les faux positifs de l\'IA sur des textes complexes'
    ],
    results: [
      { metric: 'Précision', value: '94%' },
      { metric: 'Gain de temps', value: '15h/semaine' }
    ],
    github_url: 'https://github.com/example/ai-doc',
    live_url: 'https://demo-ai-doc.example.com',
    status: 'production'
  },
  {
    id: '2',
    slug: 'fintech-trading-dashboard',
    title: 'Trading Dashboard',
    description: 'Plateforme temps réel de visualisation de portefeuilles crypto et actions.',
    stack: ['Vue.js', 'Node.js', 'Redis', 'WebSockets'],
    context: 'Besoin d\'un outil très réactif pour un groupe de traders internes.',
    technical_choices: [
      { choice: 'WebSockets', reason: 'Mise à jour en temps réel des cours sans polling' },
      { choice: 'Redis', reason: 'Cache en mémoire ultra-rapide pour l\'order book' }
    ],
    challenges: [
      'Maintenir 60 FPS sur le client avec des milliers de mises à jour par seconde',
      'Architecture résiliente aux coupures réseau'
    ],
    results: [
      { metric: 'Latence', value: '< 50ms' },
      { metric: 'Uptime', value: '99.99%' }
    ],
    github_url: 'https://github.com/example/trading',
    status: 'beta'
  },
  {
    id: '3',
    slug: 'e-commerce-microservices',
    title: 'E-commerce API',
    description: 'Refonte de l\'architecture monolithique vers des microservices scalables.',
    stack: ['Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'],
    context: 'L\'ancien backend ne tenait plus la charge lors des pics de trafic (Black Friday).',
    technical_choices: [
      { choice: 'Docker', reason: 'Isolation et déploiement facilité de chaque service' },
      { choice: 'MongoDB', reason: 'Modèle de données flexible pour les fiches produits' }
    ],
    challenges: [
      'Migration des données sans interruption de service (Zero downtime)',
      'Traçabilité des requêtes inter-services (Distributed Tracing)'
    ],
    results: [
      { metric: 'RPS Max', value: '10k+' },
      { metric: 'Coûts AWS', value: '-30%' }
    ],
    status: 'production'
  }
];
