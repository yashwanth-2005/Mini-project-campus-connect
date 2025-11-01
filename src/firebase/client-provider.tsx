
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// This component's main job is to make sure that Firebase is initialized
// only on the client-side (in the browser), not on the server.
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // `useMemo` with an empty dependency array `[]` is a React trick.
  // It ensures that the `initializeFirebase` function is called only once,
  // right when the component first mounts on the client.
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); 

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
