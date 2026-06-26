import { supabase } from './supabase.service';
import { LoginForm } from '../types';

export const AuthService = {
  async signIn(form: LoginForm) {
    if (!supabase) throw new Error("Supabase non initialisé");
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    });
    if (error) throw error;
  },

  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async sendPasswordReset(email: string) {
    if (!supabase) throw new Error("Supabase non initialisé");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    if (!supabase) throw new Error("Supabase non initialisé");
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    if (error) throw error;
  },

  async getCurrentSession() {
    if (!supabase) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
  
  onAuthStateChange(callback: (session: any) => void) {
    if (!supabase) return () => {};
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return () => subscription.unsubscribe();
  }
};
