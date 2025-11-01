
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

// This defines the "props" or properties that our main Firebase provider component accepts.
interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}

// This holds the internal state for user authentication (are they logged in? is it loading?).
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// This defines the combined state that will be available to all child components.
export interface FirebaseContextState {
  areServicesAvailable: boolean; 
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean; 
  userError: Error | null; 
}

// This defines the return type for our custom `useFirebase()` hook.
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// This defines the return type for our custom `useUser()` hook.
export interface UserHookResult { 
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// This is the React Context that will hold and provide our Firebase state to the entire app.
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// This provider component is the heart of our Firebase integration. It wraps our entire app
// and manages the Firebase services and the user's authentication state.
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, 
    userError: null,
  });

  // This effect runs once and subscribes to Firebase's authentication state changes.
  // It automatically updates the user's state whenever they log in or out.
  useEffect(() => {
    if (!auth) { 
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null }); 

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => { 
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => { 
        console.error("FirebaseProvider: Auth state error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    // This cleans up the subscription when the component is removed, preventing memory leaks.
    return () => unsubscribe(); 
  }, [auth]); 

  // We "memoize" the context value to prevent unnecessary re-renders of child components
  // if the state hasn't actually changed.
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth && storage);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      storage: servicesAvailable ? storage : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, storage, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {/* This invisible component listens for and displays helpful database errors during development. */}
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

// A custom hook to easily access core Firebase services and user auth state from any component.
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth || !context.storage) {
    throw new Error('Firebase services are not available. Check the FirebaseProvider setup.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    storage: context.storage,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

// A simple hook to access just the Firebase Auth instance.
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

// A simple hook to access just the Firestore database instance.
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

// A simple hook to access just the Firebase Storage instance.
export const useStorage = (): FirebaseStorage => {
    const { storage } = useFirebase();
    return storage;
}

// A simple hook to access just the Firebase App instance.
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

// This is a helper type for marking objects as "memoized" for our internal checks.
type MemoFirebase <T> = T & {__memo?: boolean};

// This is a custom hook that wraps React's `useMemo` and adds a special flag.
// This helps us enforce a best practice to prevent accidental infinite loops in our data-fetching hooks.
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  // We add a property to the object to mark it as memoized.
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

// A hook specifically for accessing the authenticated user's state (user object, loading status, etc.).
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
