import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { signInWithOAuth, OAuthProvider, OAuthResult } from '@/lib/oauth';
import { User, WorkerProfile, CompanyProfile, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: WorkerProfile | CompanyProfile | null;
  loading: boolean;
  role: UserRole | null;
  isWorker: boolean;
  isCompany: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<OAuthResult>;
  signInWithLinkedIn: () => Promise<OAuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<WorkerProfile> | Partial<CompanyProfile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<WorkerProfile | CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const role = user?.role || null;
  const isWorker = role === 'trabajador';
  const isCompany = role === 'empresa';

  useEffect(() => {
    // Verificar sesión actual
    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await handleSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await handleSession(session);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSession = async (session: any) => {
    if (!session?.user) return;

    const userId = session.user.id;
    const email = session.user.email || '';
    const userRole = session.user.user_metadata?.role as UserRole;

    // Crear objeto de usuario base
    const userData: User = {
      id: userId,
      email,
      role: userRole,
      created_at: session.user.created_at,
      updated_at: session.user.updated_at || session.user.created_at,
      status: 'active',
      last_login: new Date().toISOString(),
    };

    setUser(userData);

    // Cargar perfil según el rol
    if (userRole) {
      await loadProfile(userId, userRole);
    }
  };

  const loadProfile = async (userId: string, userRole: UserRole) => {
    try {
      const table = userRole === 'trabajador' ? 'worker_profiles' : 'company_profiles';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user && role) {
      await loadProfile(user.id, role);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userRole: UserRole) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userRole,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al registrar' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'ciudadactiva://reset-password',
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al enviar enlace' };
    }
  };

  const updateProfile = async (data: Partial<WorkerProfile> | Partial<CompanyProfile>) => {
    if (!user || !role) {
      return { error: 'Usuario no autenticado' };
    }

    try {
      const table = role === 'trabajador' ? 'worker_profiles' : 'company_profiles';
      const { error } = await supabase
        .from(table)
        .update(data)
        .eq('user_id', user.id);

      if (error) {
        return { error: error.message };
      }

      // Recargar perfil
      await refreshProfile();

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al actualizar perfil' };
    }
  };

  const handleOAuthSignIn = async (provider: OAuthProvider): Promise<OAuthResult> => {
    try {
      setLoading(true);
      const result = await signInWithOAuth({ provider });

      if (result.success) {
        // Wait briefly for session to propagate
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await handleSession(session);
        }
      }

      return result;
    } catch (error: any) {
      return { success: false, error: error.message || `Error en autenticacion con ${provider}` };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => handleOAuthSignIn('google');
  const signInWithLinkedIn = () => handleOAuthSignIn('linkedin');

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role,
        isWorker,
        isCompany,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithLinkedIn,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
