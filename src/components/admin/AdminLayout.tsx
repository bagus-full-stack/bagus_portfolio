import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, User, Clock, Folder, Tag, Award, 
  Image as ImageIcon, Mail, BarChart2, Shield, 
  Menu, Bell, X, LogOut, Activity, MessageSquareQuote, Download, Upload
} from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { NotificationsPanel } from './NotificationsPanel';

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState('00:00:00');
  const [adminEmail, setAdminEmail] = useState('admin@example.com');
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(0);
  const [notificationsUnreadCount, setNotificationsUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_LINKS = [
    { path: '/admin', label: 'Dashboard', icon: LayoutGrid, exact: true },
    { path: '/admin/profile', label: 'Profil', icon: User },
    { path: '/admin/experiences', label: 'Expériences', icon: Clock },
    { path: '/admin/projects', label: 'Projets', icon: Folder },
    { path: '/admin/skills', label: 'Compétences', icon: Tag },
    { path: '/admin/certifications', label: 'Certifications', icon: Award },
    { path: '/admin/testimonials', label: 'Témoignages', icon: MessageSquareQuote },
    { path: '/admin/media', label: 'Médias', icon: ImageIcon },
    { path: '/admin/messages', label: 'Messages', icon: Mail, badge: messagesUnreadCount > 0 ? messagesUnreadCount : undefined },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/admin/activity', label: 'Activité', icon: Activity },
    { path: '/admin/security', label: 'Sécurité', icon: Shield },
    { path: '/admin/export', label: 'Export', icon: Download },
    { path: '/admin/import', label: 'Importer', icon: Upload },
  ];

  useEffect(() => {
    // Forcer le thème sombre en admin
    document.documentElement.setAttribute('data-theme', 'dark');
    return () => {
      // Restaurer le thème utilisateur au départ
      const saved = localStorage.getItem('portfolio-theme');
      document.documentElement.setAttribute('data-theme', saved || 'dark');
    };
  }, []);

  useEffect(() => {
    let startTime = Date.now();
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setSessionDuration(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    AuthService.getCurrentSession().then(session => {
      if (session?.user?.email) {
        setAdminEmail(session.user.email);
      }
    });

    const fetchMessages = async () => {
      try {
        const messages = await SupabaseService.getMessages();
        const unread = messages.filter(m => !m.read).length;
        setMessagesUnreadCount(unread);
      } catch (e) {
        // console.error('Failed to load messages count', e);
      }
    };
    fetchMessages();
  }, [location.pathname]);

  const handleLogout = async () => {
    await AuthService.signOut();
    navigate('/admin/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const getCurrentPageTitle = () => {
    const currentLink = NAV_LINKS.find(link => 
      link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path)
    );
    return currentLink ? currentLink.label : 'Administration';
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex font-inter selection:bg-accent-cyan/30" data-theme="dark">
      
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full z-50 w-64 bg-bg-card border-r border-white/5 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/admin" className="font-space font-bold text-2xl text-text-primary flex items-center" onClick={closeMobileMenu}>
            <span className="text-accent-cyan">&lt;</span>AB<span className="text-accent-cyan">/&gt;</span>
            <span className="ml-3 text-sm font-medium text-text-muted">Admin</span>
          </Link>
          <button className="lg:hidden text-text-muted hover:text-text-primary" onClick={closeMobileMenu}>
            <X size={20} />
          </button>
        </div>

        {/* Session Indicator */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-text-primary">Session active</span>
          </div>
          <div className="font-mono text-xs text-text-muted ml-4.5">
            Durée: {sessionDuration}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.exact}
              onClick={closeMobileMenu}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative
                ${isActive
                  ? 'bg-[#E08A3E]/20 text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }
              `}
              style={({ isActive }) => (isActive ? {
                borderLeft: '3px solid #E08A3E',
                paddingLeft: 'calc(1rem - 3px)'
              } : {
                borderLeft: '3px solid transparent'
              })}
            >
              <div className="flex items-center">
                <link.icon size={18} className="mr-3" />
                {link.label}
              </div>
              {link.badge && (
                <span className="bg-accent-ocre text-bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded bg-accent-cyan/20 text-accent-cyan flex items-center justify-center font-space font-bold mr-3">
              A
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-text-primary truncate">{adminEmail}</div>
              <div className="text-xs text-text-muted font-mono">Admin</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Mobile/Tablet Header */}
        <header className="lg:hidden h-16 border-b border-white/5 bg-bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-space font-semibold text-lg">{getCurrentPageTitle()}</h1>
          </div>
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            aria-expanded={isNotificationsOpen}
            className="relative text-text-muted hover:text-text-primary transition-colors"
          >
            <Bell size={20} />
            {notificationsUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-ocre rounded-full border-2 border-bg-card text-[9px] font-bold text-white flex items-center justify-center">
                {notificationsUnreadCount}
              </span>
            )}
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 border-b border-white/5 bg-bg-primary items-center justify-between px-8">
          <h1 className="font-space font-semibold text-xl">{getCurrentPageTitle()}</h1>
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            aria-expanded={isNotificationsOpen}
            className="relative text-text-muted hover:text-text-primary transition-colors"
          >
            <Bell size={20} />
            {notificationsUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-ocre rounded-full border-2 border-bg-card text-[9px] font-bold text-white flex items-center justify-center">
                {notificationsUnreadCount}
              </span>
            )}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <NotificationsPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        setUnreadCount={setNotificationsUnreadCount}
      />
    </div>
  );
}
