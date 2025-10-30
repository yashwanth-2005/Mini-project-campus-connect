
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Initializes Firebase and returns the SDKs.
// This function ensures that Firebase is only initialized once.
export function initializeFirebase() {
  if (!getApps().length) {
    // When deployed on Firebase App Hosting, environment variables are automatically
    // available. We try to initialize with those first.
    let firebaseApp;
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      // If auto-initialization fails (e.g., in local development),
      // we fall back to using our local firebaseConfig object.
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic Firebase initialization failed. Falling back to local config.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }

  // If Firebase is already initialized, we get the existing app instance.
  return getSdks(getApp());
}

// A helper function to get all the necessary service SDKs from a Firebase App instance.
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

// Export hooks and providers for easy access throughout the application.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

    