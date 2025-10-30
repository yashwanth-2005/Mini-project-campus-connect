'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It then throws the received error so it can be caught by Next.js's global error boundary.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // This function will be called whenever a 'permission-error' is emitted.
    const handleError = (error: FirestorePermissionError) => {
      // Set the error in our state to trigger a re-render.
      setError(error);
    };

    // Subscribe to the event.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe when the component unmounts to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // If we have an error in our state, throw it so the error boundary can catch it.
  if (error) {
    throw error;
  }

  // This component doesn't render anything to the screen.
  return null;
}
