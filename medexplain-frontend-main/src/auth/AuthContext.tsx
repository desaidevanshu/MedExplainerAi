import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoAuth: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'medexplain_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoAuth, setIsDemoAuth] = useState<boolean>(!isFirebaseConfigured);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Patient User'),
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Demo authentication mode for preview/local dev without Firebase config
      try {
        const stored = localStorage.getItem(DEMO_USER_STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          // Default guest user
          const defaultDemoUser: UserProfile = {
            uid: 'demo-user-123',
            email: 'patient@medexplain.ai',
            displayName: 'Patient User',
          };
          setUser(defaultDemoUser);
          localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(defaultDemoUser));
        }
      } catch {
        setUser(null);
      }
      setIsDemoAuth(true);
      setLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<void> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || email.split('@')[0],
          photoURL: cred.user.photoURL,
        });
      } else {
        // Mock login
        const demoUser: UserProfile = {
          uid: 'demo-' + Date.now(),
          email,
          displayName: email.split('@')[0],
        };
        setUser(demoUser);
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<void> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (name && cred.user) {
          await updateProfile(cred.user, { displayName: name });
        }
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name || email.split('@')[0],
          photoURL: cred.user.photoURL,
        });
      } else {
        // Mock register
        const demoUser: UserProfile = {
          uid: 'demo-' + Date.now(),
          email,
          displayName: name || email.split('@')[0],
        };
        setUser(demoUser);
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const cred = await signInWithPopup(auth, googleProvider);
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName,
          photoURL: cred.user.photoURL,
        });
      } else {
        // Mock Google sign-in
        const demoUser: UserProfile = {
          uid: 'google-demo-' + Date.now(),
          email: 'google.user@medexplain.ai',
          displayName: 'Google User',
        };
        setUser(demoUser);
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (isFirebaseConfigured && auth?.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch (err) {
        console.error('Error getting Firebase token:', err);
        return null;
      }
    }
    return user ? 'mock-demo-token-active' : null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoAuth,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
