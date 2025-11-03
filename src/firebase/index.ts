'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Initializes and returns all Firebase services.
// This function ensures Firebase is only initialized once.
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  if (!getApps().length) {
    // If deployed on Firebase Hosting, it can configure itself.
    // Otherwise, it uses the local config file.
    try {
      // This is for Firebase Hosting auto-configuration
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic Firebase initialization failed. Falling back to local config.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }
  
  return getSdks(firebaseApp);
}

// Helper to get all service SDKs from a Firebase App instance.
function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

// Re-exports modules for cleaner import statements elsewhere.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';