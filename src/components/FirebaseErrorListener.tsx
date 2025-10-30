
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for 'permission-error' events.
 * It throws the received error to be caught by Next.js's error boundary.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // This function will be called when a 'permission-error' is emitted.
    const handleError = (error: FirestorePermissionError) => {
      setError(error);
    };

    // Subscribe to the event.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe when the component unmounts.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // If an error is in our state, throw it.
  if (error) {
    throw error;
  }

  // This component does not render anything.
  return null;
}
