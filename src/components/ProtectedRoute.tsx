import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../services/supabase.service';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  // null = vérification en cours ; la RLS ne laisse lire admin_users qu'aux utilisateurs connectés
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(null); return; }
    let mounted = true;
    supabase.from('admin_users').select('id').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (mounted) setIsAdmin(!!data); });
    return () => { mounted = false; };
  }, [user]);

  if (loading || (user && isAdmin === null)) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user && isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
