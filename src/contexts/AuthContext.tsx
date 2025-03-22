
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Define user type
type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  academicLevel?: string;
  subjectInterests?: string[];
  bio?: string;
  studyPreferences?: {
    timeOfDay: string;
    groupSize: number;
  };
};

// Define auth context type
type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  updateProfile: async () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();
  
  // Improved fetchUserProfile function with better error handling
  const fetchUserProfile = useCallback(async (authUser: User) => {
    if (!authUser?.id) {
      console.error("No user ID provided to fetchUserProfile");
      return;
    }
    
    try {
      console.log("Fetching profile for user:", authUser.id);
      
      // Get profile data
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      // Initialize a variable to hold our profile data
      let userProfile = profileData;
      
      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist yet, try to create a default one
        if (error.code === 'PGRST116') {
          console.log("Profile not found, creating default profile");
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: authUser.id,
              name: authUser.user_metadata?.name || 'New User',
              email: authUser.email || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }]);
            
          if (insertError) {
            console.error('Error creating default profile:', insertError);
            toast.error('Unable to create user profile. Please try logging in again.');
            return;
          }
          
          // Try to fetch the profile again after creating it
          const { data: newProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
            
          if (fetchError || !newProfile) {
            console.error('Error fetching new profile:', fetchError);
            return;
          }
          
          userProfile = newProfile;
        } else {
          toast.error('Unable to fetch user profile. Please try logging in again.');
          return;
        }
      }
      
      if (!userProfile) {
        console.log("No profile found for user:", authUser.id);
        // Set minimal user data from auth
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || 'New User',
        });
        return;
      }
      
      console.log("Profile fetched:", userProfile);
      
      // Parse study preferences from JSON
      let studyPrefs: { timeOfDay: string; groupSize: number } = { 
        timeOfDay: 'any', 
        groupSize: 5 
      };
      
      if (userProfile.study_preferences) {
        try {
          // Handle the Json type safely
          const prefs = userProfile.study_preferences as any;
          studyPrefs = {
            timeOfDay: prefs.timeOfDay || 'any',
            groupSize: typeof prefs.groupSize === 'number' ? prefs.groupSize : 5
          };
        } catch (err) {
          console.error('Error parsing study preferences:', err);
        }
      }
      
      // Combine auth data with profile data
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: userProfile.name || 'Anonymous User',
        avatar: userProfile.avatar,
        academicLevel: userProfile.academic_level,
        subjectInterests: userProfile.subject_interests,
        bio: userProfile.bio,
        studyPreferences: studyPrefs,
      });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser(null);
      toast.error('Error loading user profile. Please try logging in again.');
    }
  }, []);

  // Initialize auth state from Supabase session
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      if (!mounted) return;
      setIsLoading(true);
      
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session && mounted) {
          console.log("Initial session found:", session.user.id);
          setSession(session);
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setAuthInitialized(true);
        }
      }
    };
    
    initAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (!mounted) return;
      
      setSession(session);
      
      if (session) {
        // Set loading true while we fetch profile
        setIsLoading(true);
        try {
          await fetchUserProfile(session.user);
        } catch (error) {
          console.error("Error in auth state change handling:", error);
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      } else {
        setUser(null);
        if (mounted) {
          setIsLoading(false);
        }
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Optimized login function that returns Promise<void> to match the type
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // We don't need to manually set the user here
      // The onAuthStateChange handler will update the user state
      toast.success('Login successful');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      setIsLoading(false); // Reset loading state on error
      throw error;
    }
  };

  // Optimized register function with immediate profile creation, returns Promise<void>
  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Registering with data:", { name, email });
      
      // Step 1: Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });
      
      if (error) throw error;
      
      // Step 2: Create a profile for the user if sign-up was successful
      if (data?.user) {
        console.log("User created, creating profile for:", data.user.id);
        
        // Create profile immediately after user creation
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: data.user.id,
              name: name,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ], { onConflict: 'id' });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('Profile creation failed. Please try again.');
        } else {
          console.log("Profile created successfully");
        }
      }
      
      toast.success('Registration successful. Please check your email to verify your account.');
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      setIsLoading(false); // Reset loading state on error
      throw error;
    }
  };

  // Optimized logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      toast.success('You have been logged out');
      navigate('/');
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast.error(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Optimized updateProfile function
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !user.id) return;
    
    setIsLoading(true);
    try {
      // Map the frontend user profile structure to the database structure
      const updates: any = {
        name: data.name,
        avatar: data.avatar,
        academic_level: data.academicLevel,
        subject_interests: data.subjectInterests,
        bio: data.bio,
        updated_at: new Date().toISOString()
      };
      
      // Handle study_preferences as JSON
      if (data.studyPreferences) {
        updates.study_preferences = data.studyPreferences;
      }
      
      // Only include defined values
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof typeof updates] === undefined) {
          delete updates[key as keyof typeof updates];
        }
      });
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local user state with new data
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update failed:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize context value to prevent unnecessary rerenders
  const contextValue: AuthContextType = React.useMemo(() => ({
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    updateProfile,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
