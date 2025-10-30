
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * When an error is caught, it throws the error so that it can be caught by Next.js's
 * error boundary (e.g., a global-error.tsx file), displaying a helpful overlay in development.
 */
export function FirebaseErrorListener() {
  // The state holds the error that will be thrown.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // This function will be called when a 'permission-error' is emitted anywhere in the app.
    const handleError = (error: FirestorePermissionError) => {
      setError(error);
    };

    // Subscribe to the event.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe when the component unmounts to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // If an error has been set in our state, throw it on the next render.
  if (error) {
    throw error;
  }

  // This component does not render anything to the DOM.
  return null;
}

    