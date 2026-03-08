'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, createUserProfile } from '@/lib/firestore';
import { getRandomColor } from '@/lib/utils';
import type { UserProfile, AuthState } from '@/lib/types';

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: (displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signInAnonymously: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

async function ensureProfile(fbUser: User): Promise<UserProfile> {
  let profile = await getUserProfile(fbUser.uid);
  if (!profile) {
    profile = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || 'Anonymous',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL,
      color: getRandomColor(),
      createdAt: Date.now(),
    };
    await createUserProfile(profile);
  }
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!auth) {
      setState({ user: null, loading: false, error: null });
      return;
    }
    const unsubscribe = onAuthStateChanged(auth!, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await ensureProfile(fbUser);
          setState({ user: profile, loading: false, error: null });
        } catch (err) {
          setState({ user: null, loading: false, error: 'Failed to load profile' });
        }
      } else {
        setState({ user: null, loading: false, error: null });
      }
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth!, provider);
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: 'Sign-in failed' }));
    }
  }, []);

  const signInAnonymously = useCallback(async (displayName: string) => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const { signInAnonymously: fbSignInAnon } = await import('firebase/auth');
      const result = await fbSignInAnon(auth!);
      const profile: UserProfile = {
        uid: result.user.uid,
        displayName,
        email: '',
        photoURL: null,
        color: getRandomColor(),
        createdAt: Date.now(),
      };
      await createUserProfile(profile);
      setState({ user: profile, loading: false, error: null });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: 'Sign-in failed' }));
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(auth!);
    setState({ user: null, loading: false, error: null });
  }, []);

  return (
    <AuthContext value={{ ...state, signInWithGoogle, signInAnonymously, signOut }}>
      {children}
    </AuthContext>
  );
}
