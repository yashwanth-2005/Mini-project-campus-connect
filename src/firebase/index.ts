'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Initializes and returns all Firebase services.
// This function ensures Firebase is only initialized once, in a way that is robust for both local development and production.
export function initializeFirebase() {
  // Check if any Firebase app has already been initialized.
  if (getApps().length === 0) {
    // If not, initialize a new app with our configuration.
    // This is the standard and most reliable way to initialize for a web app.
    initializeApp(firebaseConfig);
  }
  // Get the initialized app.
  const firebaseApp = getApp();
  
  // Return all the necessary Firebase service SDKs.
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