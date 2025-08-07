import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { UserProfile } from '../types';

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials extends LoginCredentials {
  fullName?: string;
}

// Utility to fetch user profile
type FetchProfileResult = UserProfile | null;
const fetchUserProfile = async (userId: string): Promise<FetchProfileResult> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as UserProfile;
};

// Utility to update user profile
const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { data, error };
};

export function useAuth() {
  // Add isEmailVerified to authState
  const [authState, setAuthState] = useState<AuthState & { isEmailVerified?: boolean }>({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isEmailVerified: false
  });

  // Add rate limit tracking
  const [lastAuthAttempt, setLastAuthAttempt] = useState<number>(0);
  const RATE_LIMIT_SECONDS = 33;

  // Helper to check rate limit
  const checkRateLimit = (): { canProceed: boolean; waitTime: number } => {
    const now = Date.now();
    const timeSinceLastAttempt = (now - lastAuthAttempt) / 1000;
    if (timeSinceLastAttempt < RATE_LIMIT_SECONDS) {
      return { 
        canProceed: false, 
        waitTime: Math.ceil(RATE_LIMIT_SECONDS - timeSinceLastAttempt) 
      };
    }
    return { canProceed: true, waitTime: 0 };
  };

  // Check for existing session on mount and listen for changes
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && data.session.user) {
        // Fetch profile
        const profile = await fetchUserProfile(data.session.user.id);
        setAuthState({
          user: {
            id: data.session.user.id,
            email: data.session.user.email || '',
            fullName: data.session.user.user_metadata?.full_name,
            avatar: data.session.user.user_metadata?.avatar_url,
            profile // attach profile
          },
          isLoading: false,
          isAuthenticated: true,
          isEmailVerified: true // Consider all logged in users as verified
        });
      }
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        // Fetch profile
        const profile = await fetchUserProfile(session.user.id);
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name,
            avatar: session.user.user_metadata?.avatar_url,
            profile // attach profile
          },
          isLoading: false,
          isAuthenticated: true,
          isEmailVerified: true // Consider all logged in users as verified
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isEmailVerified: false
        });
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Login with Supabase
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        if (error.message.includes('Invalid login credentials') || 
            error.message.toLowerCase().includes('user not found')) {
          return { success: false, error: 'No account found with this email. Please sign up first.' };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setAuthState({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            fullName: data.user.user_metadata?.full_name,
            avatar: data.user.user_metadata?.avatar_url,
            profile
          },
          isLoading: false,
          isAuthenticated: true,
          isEmailVerified: true
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return { success: false, error: 'Unknown error' };
  };

  // Sign up with Supabase
  const signUp = async (credentials: SignUpCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Sign up with no delays or rate limiting
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName || '',
          },
          emailRedirectTo: window.location.origin,
          // Disable email verification
          emailConfirmation: false
        }
      });

      if (signUpError || !authData.user) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: signUpError?.message || 'Sign up failed' };
      }

      // Create profile immediately
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          email: credentials.email,
          full_name: credentials.fullName || '',
          avatar_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Set auth state and proceed immediately
      setAuthState({
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          fullName: credentials.fullName,
          avatar: '',
          profile: {
            id: authData.user.id,
            email: credentials.email,
            full_name: credentials.fullName || '',
            avatar_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        },
        isLoading: false,
        isAuthenticated: true,
        isEmailVerified: true
      });

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Sign up failed. Please try again.' };
    }
  };

  // Logout with Supabase
  const logout = async () => {
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
  };

  // Reset password (send email)
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  // Social login with Supabase
  const loginWithProvider = async (provider: 'google' | 'github' | 'facebook' | 'twitter' | 'azure' | 'bitbucket' | 'discord' | 'gitlab' | 'slack' | 'spotify' | 'twitch' | 'workos') => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
    // The user will be redirected to the provider and back
    return { success: true };
  };

  return {
    ...authState,
    login,
    signUp,
    logout,
    resetPassword,
    loginWithProvider,
    fetchUserProfile,
    updateUserProfile
  };
}