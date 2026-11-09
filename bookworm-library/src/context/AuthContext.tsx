import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { StudentPortalProfile, studentPortalService } from '@/services/student-portal-service';

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

export type StudentProfile = StudentPortalProfile;

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  studentProfile: StudentProfile | null;
  userRole: 'admin' | 'student' | null;
  isLoading: boolean;
  signInAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInStudent: (
    identifier: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; errorType?: string; student?: StudentProfile }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  refreshAdminProfile: () => Promise<AdminProfile | null>;
  refreshStudentProfile: () => Promise<StudentProfile | null>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Server-side admin profile validation helper.
 * Strictly verifies that the authenticated user:
 * 1. Has an active record in public.users matching their auth.uid().
 * 2. Holds the 'admin' role.
 * 3. Belongs to the 'bookworm' library and that the library is active.
 */
async function validateAdminProfile(userId: string): Promise<{ success: boolean; profile?: AdminProfile; error?: string }> {
  try {
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('id, full_name, role, is_active, phone, library_id')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching admin user profile:', userError.message);
      return { success: false, error: 'Database error while retrieving user profile.' };
    }

    if (!userRow) {
      return { success: false, error: 'User profile not found in public.users.' };
    }

    if (userRow.id !== userId) {
      return { success: false, error: 'User identity mismatch.' };
    }

    if (!userRow.is_active) {
      return { success: false, error: 'Your admin account has been deactivated. Please contact support.' };
    }

    if (userRow.role !== 'admin') {
      return { success: false, error: `Access denied: Account role "${userRow.role}" is not authorized for the admin portal.` };
    }

    if (!userRow.library_id) {
      return { success: false, error: 'Your account is not linked to any library.' };
    }

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

    if (!libRow.is_active) {
      return { success: false, error: `Library "${libRow.name}" is currently marked inactive.` };
    }

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
    console.error('Admin profile validation unexpected error:', err);
    return { success: false, error: err?.message || 'An unexpected error occurred during profile validation.' };
  }
}

/**
 * Server-side student profile validation helper.
 * Derived strictly from the Supabase session:
 * 1. Checks public.users for role = 'student' and is_active = true.
 * 2. Checks public.students where auth_user_id = userId for active enrollment & approval.
 * 3. Checks associated public.libraries for active branch status.
 */
async function validateStudentProfile(
  userId: string
): Promise<{ success: boolean; profile?: StudentProfile; error?: string; errorType?: string }> {
  try {
    // 1. Fetch user role and status from public.users
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('id, full_name, role, is_active, phone, library_id')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching student user record:', userError.message);
      return { success: false, error: 'Database error while retrieving student user profile.', errorType: 'db_error' };
    }

    if (!userRow) {
      // Missing profile in public.users
      return {
        success: false,
        error: 'No student account profile was found for this user in public.users. Please contact the library administration to activate your student portal access.',
        errorType: 'missing_user_profile',
      };
    }

    if (userRow.id !== userId) {
      return { success: false, error: 'User identity mismatch.', errorType: 'identity_mismatch' };
    }

    if (!userRow.is_active) {
      return {
        success: false,
        error: 'Your student portal account has been deactivated. Please contact the library administrator.',
        errorType: 'inactive_account',
      };
    }

    if (userRow.role !== 'student') {
      return {
        success: false,
        error: `Access denied: Account role is "${userRow.role}". If you are an administrator, please use the Admin Portal.`,
        errorType: 'role_mismatch',
      };
    }

    if (!userRow.library_id) {
      return {
        success: false,
        error: 'Your student account is not linked to any registered library branch.',
        errorType: 'missing_library_link',
      };
    }

    // 2. Fetch student enrollment record from public.students using auth_user_id
    const studentProfile = await studentPortalService.getStudentProfile(userId);

    if (!studentProfile) {
      return {
        success: false,
        error: 'Student enrollment record not found in the library database. Please contact library staff to link your student admission.',
        errorType: 'missing_student_record',
      };
    }

    // 3. Validate student account status (active, inactive, suspended)
    if (studentProfile.status === 'inactive') {
      return {
        success: false,
        error: 'Your library membership is currently marked inactive. Please visit the library desk to renew your membership.',
        errorType: 'membership_inactive',
      };
    }

    if (studentProfile.status === 'suspended') {
      return {
        success: false,
        error: 'Your student library membership has been suspended. Please contact the reception desk.',
        errorType: 'membership_suspended',
      };
    }

    // 4. Validate student application status (approved, pending_review, rejected)
    if (studentProfile.application_status === 'pending_review') {
      return {
        success: false,
        error: 'Your admission application is currently pending review by library administration. Please check back after approval.',
        errorType: 'pending_review',
      };
    }

    if (studentProfile.application_status === 'rejected') {
      return {
        success: false,
        error: `Your student application was not approved. ${studentProfile.rejection_reason || 'Please contact library staff for more information.'}`,
        errorType: 'application_rejected',
      };
    }

    // 5. Validate associated library is active
    if (!studentProfile.library.is_active) {
      return {
        success: false,
        error: `Library branch "${studentProfile.library.name}" is currently marked inactive.`,
        errorType: 'library_inactive',
      };
    }

    return { success: true, profile: studentProfile };
  } catch (err: any) {
    console.error('Student profile validation unexpected error:', err);
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred during student profile validation.',
      errorType: 'unexpected_error',
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);
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
          const userId = existingSession.user.id;

          // Determine role from public.users to decide which profile to validate
          const { data: userRow } = await supabase
            .from('users')
            .select('role, is_active')
            .eq('id', userId)
            .maybeSingle();

          if (userRow?.role === 'admin') {
            const adminVal = await validateAdminProfile(userId);
            if (adminVal.success && adminVal.profile && isMounted) {
              setUser(existingSession.user);
              setSession(existingSession);
              setAdminProfile(adminVal.profile);
              setStudentProfile(null);
              setUserRole('admin');
            } else {
              await supabase.auth.signOut().catch(() => {});
              if (isMounted) {
                setUser(null);
                setSession(null);
                setAdminProfile(null);
                setStudentProfile(null);
                setUserRole(null);
              }
            }
          } else if (userRow?.role === 'student') {
            const studentVal = await validateStudentProfile(userId);
            if (studentVal.success && studentVal.profile && isMounted) {
              setUser(existingSession.user);
              setSession(existingSession);
              setStudentProfile(studentVal.profile);
              setAdminProfile(null);
              setUserRole('student');
            } else {
              await supabase.auth.signOut().catch(() => {});
              if (isMounted) {
                setUser(null);
                setSession(null);
                setAdminProfile(null);
                setStudentProfile(null);
                setUserRole(null);
              }
            }
          } else {
            // Unknown or unlinked user, purge session safely
            await supabase.auth.signOut().catch(() => {});
            if (isMounted) {
              setUser(null);
              setSession(null);
              setAdminProfile(null);
              setStudentProfile(null);
              setUserRole(null);
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
        if (event === 'INITIAL_SESSION') return;

        if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setSession(null);
            setAdminProfile(null);
            setStudentProfile(null);
            setUserRole(null);
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

      const validation = await validateAdminProfile(authData.user.id);

      if (!validation.success || !validation.profile) {
        await supabase.auth.signOut().catch(() => {});
        setUser(null);
        setSession(null);
        setAdminProfile(null);
        setStudentProfile(null);
        setUserRole(null);
        return {
          success: false,
          error: validation.error || 'Access denied. Administrator privileges required.',
        };
      }

      setUser(authData.user);
      setSession(authData.session);
      setAdminProfile(validation.profile);
      setStudentProfile(null);
      setUserRole('admin');

      return { success: true };
    } catch (err: any) {
      await supabase.auth.signOut().catch(() => {});
      setUser(null);
      setSession(null);
      setAdminProfile(null);
      setStudentProfile(null);
      setUserRole(null);
      return {
        success: false,
        error: err?.message || 'An unexpected authentication error occurred.',
      };
    }
  }, []);

  // Sign in as student with Email or Student ID + password + strict profile validation
  const signInStudent = useCallback(async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string; errorType?: string; student?: StudentProfile }> => {
    try {
      const cleanId = identifier.trim();
      const cleanPassword = password.trim();

      if (!cleanId) {
        return { success: false, error: 'Please enter your registered email or Student ID.' };
      }
      if (!cleanPassword) {
        return { success: false, error: 'Please enter your password.' };
      }

      // 1. Determine login email:
      // If contains '@', use directly.
      // Otherwise, attempt deterministic internal aliases (e.g., student ID based)
      let loginEmail = cleanId;
      if (!cleanId.includes('@')) {
        loginEmail = `${cleanId.toLowerCase()}@student.bookworm.internal`;
      }

      let authResult = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: cleanPassword,
      });

      // If initial attempt failed and identifier did not have '@', try alternative formats
      if (authResult.error && !cleanId.includes('@')) {
        const sanitized = cleanId.toLowerCase().replace(/[^a-z0-9]/g, '');
        const altEmail = `${sanitized}@student.libx.io`;
        const altResult = await supabase.auth.signInWithPassword({
          email: altEmail,
          password: cleanPassword,
        });
        if (!altResult.error && altResult.data.user) {
          authResult = altResult;
        }
      }

      if (authResult.error || !authResult.data.user) {
        let msg = authResult.error?.message || 'Invalid login credentials.';
        if (msg.toLowerCase().includes('email not confirmed')) {
          msg = 'Your email address has not been confirmed yet. Please verify your email inbox or contact library desk.';
        } else if (msg.toLowerCase().includes('invalid login credentials')) {
          msg = 'Invalid email/Student ID or password. Please verify your credentials.';
        }
        return {
          success: false,
          error: msg,
          errorType: 'auth_failed',
        };
      }

      // 2. Validate student profile derived from authenticated session UUID
      const validation = await validateStudentProfile(authResult.data.user.id);

      if (!validation.success || !validation.profile) {
        // Enforce immediate sign-out to prevent unauthorized session
        await supabase.auth.signOut().catch(() => {});
        setUser(null);
        setSession(null);
        setAdminProfile(null);
        setStudentProfile(null);
        setUserRole(null);

        return {
          success: false,
          error: validation.error || 'Access denied: Valid student membership required.',
          errorType: validation.errorType || 'profile_invalid',
        };
      }

      // 3. Set validated authenticated student state
      setUser(authResult.data.user);
      setSession(authResult.data.session);
      setStudentProfile(validation.profile);
      setAdminProfile(null);
      setUserRole('student');

      return {
        success: true,
        student: validation.profile,
      };
    } catch (err: any) {
      await supabase.auth.signOut().catch(() => {});
      setUser(null);
      setSession(null);
      setAdminProfile(null);
      setStudentProfile(null);
      setUserRole(null);
      return {
        success: false,
        error: err?.message || 'An unexpected error occurred during student sign in.',
        errorType: 'unexpected',
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
      setStudentProfile(null);
      setUserRole(null);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      setAdminProfile(null);
      setStudentProfile(null);
      setUserRole(null);
      return { success: false, error: err?.message || 'Error signing out.' };
    }
  }, []);

  // Re-fetch admin profile on demand
  const refreshAdminProfile = useCallback(async (): Promise<AdminProfile | null> => {
    if (!user) return null;
    const validation = await validateAdminProfile(user.id);
    if (validation.success && validation.profile) {
      setAdminProfile(validation.profile);
      return validation.profile;
    }
    return null;
  }, [user]);

  // Re-fetch student profile on demand
  const refreshStudentProfile = useCallback(async (): Promise<StudentProfile | null> => {
    if (!user) return null;
    const validation = await validateStudentProfile(user.id);
    if (validation.success && validation.profile) {
      setStudentProfile(validation.profile);
      return validation.profile;
    }
    return null;
  }, [user]);

  // Real Supabase password reset request
  const resetPasswordForEmail = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please enter a valid registered email address for password reset.' };
      }

      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to dispatch password reset email.' };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        adminProfile,
        studentProfile,
        userRole,
        isLoading,
        signInAdmin,
        signInStudent,
        signOut,
        refreshAdminProfile,
        refreshStudentProfile,
        resetPasswordForEmail,
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
