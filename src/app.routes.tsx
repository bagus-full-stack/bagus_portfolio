import React, { lazy } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ProjectDetail } from './components/ProjectDetail';
import { NotFoundPage } from './pages/NotFound';
import { SupabaseService } from './services/supabase.service';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { ChatbotWidget } from './components/ChatbotWidget';
import { AgroSahelPage } from './pages/AgroSahelPage';

// Lazy loaded admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(module => ({ default: module.AdminLogin })));
const ForgotPassword = lazy(() => import('./pages/admin/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/admin/ResetPassword').then(module => ({ default: module.ResetPassword })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const EditProfile = lazy(() => import('./pages/admin/EditProfile').then(module => ({ default: module.EditProfile })));
const EditExperiences = lazy(() => import('./pages/admin/EditExperiences').then(module => ({ default: module.EditExperiences })));
const EditProjects = lazy(() => import('./pages/admin/EditProjects').then(module => ({ default: module.EditProjects })));
const EditSkills = lazy(() => import('./pages/admin/EditSkills').then(module => ({ default: module.EditSkills })));
const EditCertifications = lazy(() => import('./pages/admin/EditCertifications').then(module => ({ default: module.EditCertifications })));
const EditTestimonials = lazy(() => import('./pages/admin/EditTestimonials').then(module => ({ default: module.EditTestimonials })));
const MediaManager = lazy(() => import('./pages/admin/MediaManager').then(module => ({ default: module.MediaManager })));
const MessagesInbox = lazy(() => import('./pages/admin/MessagesInbox').then(module => ({ default: module.MessagesInbox })));
const MessageDetail = lazy(() => import('./pages/admin/MessageDetail').then(module => ({ default: module.MessageDetail })));
const Analytics = lazy(() => import('./pages/admin/Analytics').then(module => ({ default: module.Analytics })));
const ActivityLog = lazy(() => import('./pages/admin/ActivityLog').then(module => ({ default: module.ActivityLog })));
const SecuritySettings = lazy(() => import('./pages/admin/SecuritySettings').then(module => ({ default: module.SecuritySettings })));
const ExportData = lazy(() => import('./pages/admin/ExportData').then(module => ({ default: module.ExportData })));

const Layout = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-inter selection:bg-accent-cyan/30">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

const NotFoundLayout = ({ children }: { children?: React.ReactNode }) => (
  <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-inter selection:bg-accent-cyan/30">
    {/* Pas de navbar complète — logo seul + bouton retour dans NotFound */}
    <main className="flex-grow flex flex-col">
      {children || <Outlet />}
    </main>
  </div>
);

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: (
      <NotFoundLayout>
        <NotFoundPage />
      </NotFoundLayout>
    ),
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/projects/agrosahel-ai',
        element: <AgroSahelPage />
      },
      {
        path: '/projects/:slug',
        element: <ProjectDetail />,
        loader: async ({ params }) => {
          if (!params.slug) throw new Response('Not Found', { status: 404 });
          const project = await SupabaseService.getProjectBySlug(params.slug);
          if (!project) {
            throw new Response('Not Found', { status: 404 });
          }
          return { project };
        }
      }
    ]
  },
  {
    element: <NotFoundLayout />,
    children: [
      {
        path: '/admin/login',
        element: <AdminLogin />
      },
      {
        path: '/admin/forgot-password',
        element: <ForgotPassword />
      },
      {
        path: '/admin/reset-password',
        element: <ResetPassword />
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: '/admin',
                element: <AdminDashboard />
              },
              {
                path: '/admin/profile',
                element: <EditProfile />
              },
              {
                path: '/admin/experiences',
                element: <EditExperiences />
              },
              {
                path: '/admin/testimonials',
                element: <EditTestimonials />
              },
              {
                path: '/admin/projects',
                element: <EditProjects />
              },
              {
                path: '/admin/skills',
                element: <EditSkills />
              },
              {
                path: '/admin/certifications',
                element: <EditCertifications />
              },
              {
                path: '/admin/media',
                element: <MediaManager />
              },
              {
                path: '/admin/messages',
                element: <MessagesInbox />
              },
              {
                path: '/admin/messages/:id',
                element: <MessageDetail />
              },
              {
                path: '/admin/analytics',
                element: <Analytics />
              },
              {
                path: '/admin/activity',
                element: <ActivityLog />
              },
              {
                path: '/admin/security',
                element: <SecuritySettings />
              },
              {
                path: '/admin/export',
                element: <ExportData />
              }
            ]
          }
        ]
      },
      {
        path: '/404',
        element: <NotFoundPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
