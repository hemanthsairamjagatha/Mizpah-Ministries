import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';
import type { AdminProfile } from '../types/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AdminProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<{
    session: Session | null;
    user: User | null;
    profile: AdminProfile | null;
  }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string, currentUser?: User | null): Promise<AdminProfile | null> => {
    try {
      const p = await authService.getAdminProfile(userId);
      if (p) {
        setProfile(p);
        return p;
      }

      // If authenticated user profile is not yet in admin_profiles table, provide fallback
      const email = currentUser?.email || user?.email || '';
      const fallback: AdminProfile = {
        id: userId,
        display_name: currentUser?.user_metadata?.display_name || currentUser?.user_metadata?.full_name || email.split('@')[0] || 'Administrator',
        role: 'superadmin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(fallback);
      return fallback;
    } catch (err) {
      console.error('Failed to load admin profile:', err);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Verify session validity with server
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (!initialSession) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Verify session with Supabase Auth server
        const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (userError || !verifiedUser) {
          console.warn('Session expired or invalid on server:', userError?.message);
          await supabase.auth.signOut().catch(() => {});
          setUser(null);
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(initialSession);
        setUser(verifiedUser);
        await fetchProfile(verifiedUser.id, verifiedUser);
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !newSession) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setSession(newSession);
      const newUser = newSession.user;
      setUser(newUser);

      if (newUser) {
        await fetchProfile(newUser.id, newUser);
      } else {
        setProfile(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authService.signIn({ email, password });
      setSession(res.session);
      setUser(res.user);
      setProfile(res.profile);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  };

  const isAdmin = !!profile;
  const isSuperAdmin = profile?.role === 'superadmin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        isSuperAdmin,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
