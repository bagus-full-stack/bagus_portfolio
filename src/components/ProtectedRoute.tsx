import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthService } from '../services/auth.service';

export function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    AuthService.getCurrentSession().then(session => {
      if (mounted) {
        setAuthenticated(!!session);
        setLoading(false);
      }
    });

    const unsubscribe = AuthService.onAuthStateChange(session => {
      if (mounted) {
        setAuthenticated(!!session);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return authenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
