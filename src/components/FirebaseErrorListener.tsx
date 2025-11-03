'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This invisible component listens for Firestore permission errors.
// When an error is caught, it's re-thrown to be displayed by Next.js's
// development overlay, making it much easier to debug security rules.
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // This function is called whenever a 'permission-error' is emitted.
    const handleError = (error: FirestorePermissionError) => {
      setError(error);
    };

    // Subscribes to the 'permission-error' event.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribes when the component is removed to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // If an error has been set, throw it so Next.js can display it.
  if (error) {
    throw error;
  }

  return null;
}
