import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AdminLibraryInfo {
  id: string;
  name: string;
  username: string;
  code?: string;
  is_active: boolean;
}

export interface AdminProfile {
  id: string;
  full_name: string;
  role: string;
  phone?: string | null;
  is_active: boolean;
  library_id: string;
  library: AdminLibraryInfo;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  isLoading: boolean;
  signInAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  refreshAdminProfile: () => Promise<AdminProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Server-side profile validation helper.
 * Strictly verifies that the authenticated user:
 * 1. Has an active record in public.users matching their auth.uid().
 * 2. Holds the 'admin' role.
 * 3. Belongs to the 'bookworm' library and that the library is active.
 */
async function validateAdminProfile(userId: string): Promise<{ success: boolean; profile?: AdminProfile; error?: string }> {
  try {
    // 1. Fetch user profile from public.users using the authenticated user's UUID
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('id, full_name, role, is_active, phone, library_id')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user profile:', userError.message);
      return { success: false, error: 'Database error while retrieving user profile.' };
    }

    if (!userRow) {
      return { success: false, error: 'User profile not found in public.users.' };
    }

    // 2. Strict UUID matching
    if (userRow.id !== userId) {
      return { success: false, error: 'User identity mismatch.' };
    }

    // 3. User account must be active
    if (!userRow.is_active) {
      return { success: false, error: 'Your admin account has been deactivated. Please contact support.' };
    }

    // 4. Role check: Must be 'admin'
    if (userRow.role !== 'admin') {
      return { success: false, error: `Access denied: Account role "${userRow.role}" is not authorized for the admin portal.` };
    }

    // 5. Must have a valid library reference
    if (!userRow.library_id) {
      return { success: false, error: 'Your account is not linked to any library.' };
    }

    // 6. Fetch associated library directly from public.libraries
    const { data: libRow, error: libError } = await supabase
      .from('libraries')
      .select('id, name, username, code, is_active')
      .eq('id', userRow.library_id)
      .maybeSingle();

    if (libError) {
      console.error('Error fetching library details:', libError.message);
      return { success: false, error: 'Database error while retrieving library details.' };
    }

    if (!libRow) {
      return { success: false, error: 'Associated library record was not found.' };
    }

    // 7. Library must be active
    if (!libRow.is_active) {
      return { success: false, error: `Library "${libRow.name}" is currently marked inactive.` };
    }

    // 8. Associated library username must be 'bookworm'
    if (libRow.username.trim().toLowerCase() !== 'bookworm') {
      return {
        success: false,
        error: `Access denied: This portal is for Bookworm Library. Your account belongs to "${libRow.name}" (${libRow.username}).`,
      };
    }

    const adminProfile: AdminProfile = {
      id: userRow.id,
      full_name: userRow.full_name,
      role: userRow.role,
      phone: userRow.phone,
      is_active: userRow.is_active,
      library_id: userRow.library_id,
      library: {
        id: libRow.id,
        name: libRow.name,
        username: libRow.username,
        code: libRow.code,
        is_active: libRow.is_active,
      },
    };

    return { success: true, profile: adminProfile };
  } catch (err: any) {
    console.error('Profile validation unexpected error:', err);
    return { success: false, error: err?.message || 'An unexpected error occurred during profile validation.' };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore persistent session on launch or refresh
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Session retrieval error:', error.message);
        }

        if (existingSession?.user && isMounted) {
          const validation = await validateAdminProfile(existingSession.user.id);
          if (validation.success && validation.profile && isMounted) {
            setUser(existingSession.user);
            setSession(existingSession);
            setAdminProfile(validation.profile);
          } else {
            // Invalid, non-admin, or inactive session: purge it
            await supabase.auth.signOut();
            if (isMounted) {
              setUser(null);
              setSession(null);
              setAdminProfile(null);
            }
          }
        }
      } catch (err) {
        console.error('Error during session restoration:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    // Listen for external auth changes (token refresh, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'INITIAL_SESSION') return; // Handled above

        if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setSession(null);
            setAdminProfile(null);
          }
        } else if (event === 'TOKEN_REFRESHED' && currentSession) {
          if (isMounted) {
            setUser(currentSession.user);
            setSession(currentSession);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in as admin with email & password + strict profile validation
  const signInAdmin = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !authData.user) {
        return {
          success: false,
          error: authError?.message || 'Invalid email or password.',
        };
      }

      // 2. Validate user profile against public.users and public.libraries
      const validation = await validateAdminProfile(authData.user.id);

      if (!validation.success || !validation.profile) {
        // Enforce immediate sign-out if role, active status, or library check fails
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setAdminProfile(null);
        return {
          success: false,
          error: validation.error || 'Access denied. Administrator privileges required.',
        };
      }

      // 3. Set validated admin state
      setUser(authData.user);
      setSession(authData.session);
      setAdminProfile(validation.profile);

      return { success: true };
    } catch (err: any) {
      await supabase.auth.signOut().catch(() => {});
      setUser(null);
      setSession(null);
      setAdminProfile(null);
      return {
        success: false,
        error: err?.message || 'An unexpected authentication error occurred.',
      };
    }
  }, []);

  // Sign out and clear all authenticated state
  const signOut = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setAdminProfile(null);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      setAdminProfile(null);
      return { success: false, error: err?.message || 'Error signing out.' };
    }
  }, []);

  // Re-fetch profile on demand (e.g., after settings update)
  const refreshAdminProfile = useCallback(async (): Promise<AdminProfile | null> => {
    if (!user) return null;
    const validation = await validateAdminProfile(user.id);
    if (validation.success && validation.profile) {
      setAdminProfile(validation.profile);
      return validation.profile;
    }
    return null;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        adminProfile,
        isLoading,
        signInAdmin,
        signOut,
        refreshAdminProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
