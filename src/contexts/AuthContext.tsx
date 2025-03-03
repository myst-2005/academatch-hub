
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: User | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: any | null;
    data: User | null;
  }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        // Check if user is admin (either by email or metadata)
        const isAdminUser = data.session.user.email === "admin@admin.com" || 
                         data.session.user.app_metadata?.is_super_admin;
        setIsAdmin(isAdminUser);
      }
      
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          // Check if user is admin
          const isAdminUser = session.user.email === "admin@admin.com" ||
                          session.user.app_metadata?.is_super_admin;
          setIsAdmin(isAdminUser);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log(`Attempting to sign in with email: ${email}`);
    
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log("Sign in response:", response);
    
    if (response.data.user) {
      // Check if admin
      if (response.data.user.email === "admin@admin.com") {
        setIsAdmin(true);
      }
    }
    
    return {
      data: response.data.user,
      error: response.error,
    };
  };

  const signUp = async (email: string, password: string) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/login",
        emailConfirm: true // Auto-confirm for testing
      }
    });
    
    return {
      data: response.data.user,
      error: response.error,
    };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
