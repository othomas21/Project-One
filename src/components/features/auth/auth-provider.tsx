/**
 * @file auth-provider.tsx
 * @description Authentication context provider for healthcare application
 * @module components/features/auth
 * 
 * Key responsibilities:
 * - Manage global authentication state
 * - Provide user profile and role information
 * - Handle authentication state changes
 * - Integrate with Supabase Auth realtime updates
 * - Role-based access control utilities
 * 
 * @reftools Verified against: React 18+ Context patterns, Supabase Auth v2.x
 * @supabase Integrated with auth state management and profiles table
 * @author Claude Code
 * @created 2025-08-13
 */

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

// Define user profile type from database
type UserProfile = Database['public']['Tables']['profiles']['Row'];

// Extended user type with profile information
interface AuthUser extends User {
  profile?: UserProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  isAdmin: boolean;
  isActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch user profile data
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      return null;
    }
  };

  // Set user with profile data
  const setUserWithProfile = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    const profile = await fetchUserProfile(authUser.id);
    setUser({
      ...authUser,
      profile: profile || undefined,
    });
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (!user) return;
    
    const profile = await fetchUserProfile(user.id);
    setUser({
      ...user,
      profile: profile || undefined,
    });
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      }
    } catch (error) {
      console.error("Unexpected sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role(s)
  const hasRole = (role: string | string[]): boolean => {
    if (!user?.profile?.role) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.profile.role);
    }
    
    return user.profile.role === role;
  };

  // Check if user is admin
  const isAdmin = hasRole("admin");

  // Check if user account is active
  const isActive = user?.profile?.status === "active";

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting initial session:", error);
        }
        
        setSession(session);
        await setUserWithProfile(session?.user ?? null);
      } catch (error) {
        console.error("Unexpected error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.id);
        
        setSession(session);
        await setUserWithProfile(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        switch (event) {
          case "SIGNED_IN":
            console.log("User signed in:", session?.user?.email);
            break;
          case "SIGNED_OUT":
            console.log("User signed out");
            setUser(null);
            setSession(null);
            break;
          case "PASSWORD_RECOVERY":
            console.log("Password recovery initiated");
            break;
          case "TOKEN_REFRESHED":
            console.log("Token refreshed for user:", session?.user?.email);
            break;
          case "USER_UPDATED":
            console.log("User updated:", session?.user?.email);
            // Refresh profile when user is updated
            if (session?.user) {
              await setUserWithProfile(session.user);
            }
            break;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Real-time profile updates
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to profile changes
    const profileSubscription = supabase
      .channel(`profile:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("Profile updated:", payload);
          await refreshProfile();
        }
      )
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
    };
  }, [user?.id]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshProfile,
    hasRole,
    isAdmin,
    isActive,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC for role-based access control
export function withRole(allowedRoles: string | string[]) {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function RoleGuardedComponent(props: P) {
      const { hasRole, loading } = useAuth();

      if (loading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        );
      }

      if (!hasRole(allowedRoles)) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </div>
          </div>
        );
      }

      return <Component {...props} />;
    };
  };
}

// Component for protecting routes
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string | string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  fallback 
}: ProtectedRouteProps) {
  const { user, hasRole, loading, isActive } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">
            Please sign in to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Account Inactive</h2>
          <p className="text-muted-foreground">
            Your account is not active. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}