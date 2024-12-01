import React, {createContext, useState, useContext, useEffect} from 'react';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../lib/supabase';
import {Session, User} from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Try to get stored session first
        const storedSession = await AsyncStorage.getItem('userSession');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          // Check if the session is still valid
          const {data: {session: currentSession}, error} = await supabase.auth.getSession();
          
          if (error) {
            console.warn('Session error:', error);
            // Clear invalid session
            await AsyncStorage.multiRemove(['userSession', 'userProfile']);
            setSession(null);
            setUser(null);
          } else if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            // Update stored session with fresh data
            await AsyncStorage.setItem('userSession', JSON.stringify(currentSession));
            if (currentSession.user) {
              await AsyncStorage.setItem(
                'userProfile',
                JSON.stringify({
                  id: currentSession.user.id,
                  email: currentSession.user.email,
                  name: currentSession.user.user_metadata.name,
                }),
              );
            }
          }
        } else {
          // No stored session, try to get current session
          const {data: {session: newSession}, error} = await supabase.auth.getSession();
          if (!error && newSession) {
            setSession(newSession);
            setUser(newSession.user);
            await AsyncStorage.setItem('userSession', JSON.stringify(newSession));
            if (newSession.user) {
              await AsyncStorage.setItem(
                'userProfile',
                JSON.stringify({
                  id: newSession.user.id,
                  email: newSession.user.email,
                  name: newSession.user.user_metadata.name,
                }),
              );
            }
          }
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        // Clear potentially corrupted data
        await AsyncStorage.multiRemove(['userSession', 'userProfile']);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        try {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            await AsyncStorage.setItem('userSession', JSON.stringify(newSession));
            if (newSession.user) {
              await AsyncStorage.setItem(
                'userProfile',
                JSON.stringify({
                  id: newSession.user.id,
                  email: newSession.user.email,
                  name: newSession.user.user_metadata.name,
                }),
              );
            }
          } else {
            // Clear all auth-related data
            await AsyncStorage.multiRemove([
              'userSession',
              'userProfile',
              'userSettings',
              'authToken',
              'favoriteMovies',
            ]);
            setSession(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        } finally {
          setLoading(false);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const {error} = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        await AsyncStorage.setItem('userSession', JSON.stringify(data.session));
        if (data.session.user) {
          await AsyncStorage.setItem(
            'userProfile',
            JSON.stringify({
              id: data.session.user.id,
              email: data.session.user.email,
              name: data.session.user.user_metadata.name,
            }),
          );
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear all storage first
      await AsyncStorage.multiRemove([
        'userSession',
        'userProfile',
        'userSettings',
        'authToken',
        'favoriteMovies',
      ]);

      // Attempt to sign out from Supabase
      const {error} = await supabase.auth.signOut();
      if (error && error.message !== 'Auth session missing!') {
        throw error;
      }

      // Force update the state
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error in signOut:', error);
      // Still clear the state even if there's an error
      setUser(null);
      setSession(null);
      // Re-throw the error for the UI to handle
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const {error} = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'moviemuse://reset-password',
    });

    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 