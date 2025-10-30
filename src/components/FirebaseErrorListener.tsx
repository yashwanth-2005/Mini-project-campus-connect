
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * When an error is caught, it throws the error so that it can be caught by a
 * Next.js error boundary (like a global-error.tsx file), which then displays a
 * helpful overlay in development mode.
 */
export function FirebaseErrorListener() {
  // This state holds the error that will be thrown to trigger the error boundary.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // This function will be called when a 'permission-error' is emitted.
    const handleError = (error: FirestorePermissionError) => {
      setError(error);
    };

    // Subscribes to the 'permission-error' event.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribes when the component unmounts to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // If an error has been caught and set in our state, throw it.
  if (error) {
    throw error;
  }

  // This component does not render anything to the DOM itself.
  return null;
}
