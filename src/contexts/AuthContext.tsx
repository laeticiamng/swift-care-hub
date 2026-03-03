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
const MEDICAL_ROLES: AppRole[] = ['medecin', 'ioa', 'ide'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  mfaRequired: boolean;
  mfaEnrollRequired: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  selectRole: (role: AppRole) => Promise<void>;
  completeMFA: () => void;
  completeMFAEnroll: () => void;
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
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaEnrollRequired, setMfaEnrollRequired] = useState(false);

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
      const roles = Array.from(new Set(data
        .map(r => normalizeRole(r.role))
        .filter((r): r is AppRole => r !== null)));
      setAvailableRoles(roles);

      // Check MFA status for medical roles
      const hasMedicalRole = roles.some(r => MEDICAL_ROLES.includes(r));
      let needsMfa = false;
      if (hasMedicalRole) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const hasVerifiedTOTP = factors?.totp?.some(f => f.status === 'verified') ?? false;
        if (!hasVerifiedTOTP) {
          setMfaEnrollRequired(true);
          needsMfa = true;
        } else {
          const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aal?.currentLevel === 'aal1') {
            setMfaRequired(true);
            needsMfa = true;
          }
        }
      }

      // Don't auto-select role if MFA is pending
      if (!needsMfa) {
        const savedRole = normalizeRole(sessionStorage.getItem('urgenceos_role') || '');
        if (savedRole && roles.includes(savedRole)) {
          setRole(savedRole);
        } else if (roles.length === 1) {
          setRole(roles[0]);
          sessionStorage.setItem('urgenceos_role', roles[0]);
        }
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
    setMfaRequired(false);
    setMfaEnrollRequired(false);
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

  const completeMFA = useCallback(() => {
    setMfaRequired(false);
  }, []);

  const completeMFAEnroll = useCallback(() => {
    setMfaEnrollRequired(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, role, loading, mfaRequired, mfaEnrollRequired, signIn, signUp, signOut, selectRole, completeMFA, completeMFAEnroll, availableRoles }}>
      {children}
    </AuthContext.Provider>
  );
};
