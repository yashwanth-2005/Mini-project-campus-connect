
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// This function initializes all our Firebase services (like Auth, Firestore, etc.).
// It's designed to make sure that Firebase is only initialized once, even if the
// function is called multiple times.
export function initializeFirebase() {
  if (!getApps().length) {
    // When the app is deployed on Firebase's own hosting service, it can sometimes
    // configure itself automatically from the environment. We try that first.
    let firebaseApp;
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      // If automatic setup fails (which is normal in local development),
      // we fall back to using our local configuration file.
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic Firebase initialization failed. Falling back to local config.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }

  // If Firebase is already initialized, we just get the existing instance.
  return getSdks(getApp());
}

// This is a helper function to get all the service SDKs from a Firebase App instance.
function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

// This file acts as a central "barrel," re-exporting modules from other files.
// This allows us to have cleaner import statements in our components. For example:
// import { useUser, useDoc } from '@/firebase';
// instead of two separate lines.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
