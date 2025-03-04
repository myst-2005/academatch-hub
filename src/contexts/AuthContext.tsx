import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          return;
        }
        
        if (data.session?.user) {
          setUser(data.session.user);
          
          const isAdminUser = data.session.user.email === "admin@admin.com" || 
                          data.session.user.app_metadata?.is_super_admin;
          setIsAdmin(isAdminUser);
          
          console.log("Session found for user:", data.session.user.email);
        } else {
          setUser(null);
          setIsAdmin(false);
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          
          const isAdminUser = session.user.email === "admin@admin.com" ||
                          session.user.app_metadata?.is_super_admin;
          setIsAdmin(isAdminUser);
        } else {
          setUser(null);
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
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Sign in response:", data, error);
      
      if (error) {
        console.error("Sign in error:", error);
        return { error, data: null };
      }
      
      if (data.user) {
        const isAdminUser = data.user.email === "admin@admin.com" || 
                          data.user.app_metadata?.is_super_admin;
        setIsAdmin(isAdminUser);
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        return { data: data.user, error: null };
      }
      
      return { data: null, error: new Error("No user data returned") };
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      return { error, data: null };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            is_super_admin: email === "admin@admin.com"
          }
        }
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }
      
      if (data.user) {
        toast({
          title: "Registration successful",
          description: "Account created successfully",
        });
        return { data: data.user, error: null };
      }
      
      return { data: null, error: new Error("No user data returned") };
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      return { error, data: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
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
