
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * This is an invisible component that listens for Firestore permission errors.
 * When it catches an error, it throws it again. This allows Next.js's development
 * overlay to catch it and display a helpful, detailed error message on the screen,
 * which makes debugging our database security rules much easier.
 */
export function FirebaseErrorListener() {
  // This state holds the error that we're going to throw.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // This function will be called whenever a 'permission-error' is emitted from anywhere in the app.
    const handleError = (error: FirestorePermissionError) => {
      setError(error);
    };

    // We subscribe to the 'permission-error' event.
    errorEmitter.on('permission-error', handleError);

    // When the component is removed, we unsubscribe to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // If an error has been caught and set in our state, we throw it so Next.js can display it.
  if (error) {
    throw error;
  }

  // This component doesn't render any visible HTML.
  return null;
}
