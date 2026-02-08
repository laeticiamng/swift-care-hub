import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'medecin' | 'ioa' | 'ide' | 'as' | 'secretaire';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  selectRole: (role: AppRole) => Promise<void>;
  availableRoles: AppRole[];
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchUserRoles(session.user.id);
        }, 0);
      } else {
        setRole(null);
        setAvailableRoles([]);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (!error && data) {
      const roles = data.map(r => r.role as AppRole);
      setAvailableRoles(roles);
      // Auto-select if only one role
      if (roles.length === 1) {
        setRole(roles[0]);
      }
      // Restore from sessionStorage
      const savedRole = sessionStorage.getItem('urgenceos_role') as AppRole | null;
      if (savedRole && roles.includes(savedRole)) {
        setRole(savedRole);
      }
    }
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    sessionStorage.removeItem('urgenceos_role');
    setRole(null);
    await supabase.auth.signOut();
  };

  const selectRole = async (selectedRole: AppRole) => {
    setRole(selectedRole);
    sessionStorage.setItem('urgenceos_role', selectedRole);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut, selectRole, availableRoles }}>
      {children}
    </AuthContext.Provider>
  );
};
