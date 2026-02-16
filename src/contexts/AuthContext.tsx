import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'medecin' | 'ioa' | 'ide' | 'as' | 'secretaire';

const LEGACY_ROLE_MAP: Record<string, AppRole> = {
  urgentiste: 'medecin',
};

const normalizeRole = (role: string): AppRole | null => {
  if (role in LEGACY_ROLE_MAP) return LEGACY_ROLE_MAP[role];
  if (role === 'medecin' || role === 'ioa' || role === 'ide' || role === 'as' || role === 'secretaire') return role;
  return null;
};

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

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
    // Flag to prevent double-fetching from getSession + onAuthStateChange
    let initialSessionHandled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        if (initialSessionHandled) {
          fetchUserRoles(session.user.id);
        }
      } else {
        setRole(null);
        setAvailableRoles([]);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      initialSessionHandled = true;
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
      const roles = Array.from(new Set(data
        .map(r => normalizeRole(r.role))
        .filter((r): r is AppRole => r !== null)));
      setAvailableRoles(roles);
      // Restore from sessionStorage first
      const savedRole = normalizeRole(sessionStorage.getItem('urgenceos_role') || '');
      if (savedRole && roles.includes(savedRole)) {
        setRole(savedRole);
      } else if (roles.length === 1) {
        // Auto-select if only one role
        setRole(roles[0]);
        sessionStorage.setItem('urgenceos_role', roles[0]);
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

  const signOut = useCallback(async () => {
    sessionStorage.removeItem('urgenceos_role');
    setRole(null);
    await supabase.auth.signOut();
  }, []);

  // Auto-logout after 30 min inactivity
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (!user) return;
    inactivityTimer.current = setTimeout(() => {
      signOut();
    }, INACTIVITY_TIMEOUT_MS);
  }, [user, signOut]);

  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => resetInactivityTimer();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user, resetInactivityTimer]);

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
