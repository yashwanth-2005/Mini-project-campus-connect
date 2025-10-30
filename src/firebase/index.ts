
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// This function initializes Firebase and returns the different service SDKs.
// It's designed to ensure that Firebase is only initialized once in the app.
export function initializeFirebase() {
  if (!getApps().length) {
    // When deployed on Firebase App Hosting, environment variables are often
    // available for automatic configuration. We try this first.
    let firebaseApp;
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      // If auto-initialization fails (like in local development),
      // we fall back to using the local firebaseConfig object.
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic Firebase initialization failed. Falling back to local config.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }

  // If Firebase is already initialized, we just get the existing app instance.
  return getSdks(getApp());
}

// A helper function to get all the necessary SDKs from a Firebase App instance.
function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

// Re-exporting these modules allows for cleaner imports elsewhere in the app.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
