
'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This is a helper type that adds a mandatory 'id' field to any data object.
type WithId<T> = T & { id: string };

// This defines the shape of the object returned by our `useDoc` hook.
export interface UseDocResult<T> {
  data: WithId<T> | null; 
  isLoading: boolean;       
  error: FirestoreError | Error | null; 
}

/**
 * A custom React hook to listen for real-time updates from a single Firestore document.
 * 
 * IMPORTANT: The document reference you pass to this hook MUST be "memoized" with `useMemoFirebase`.
 * This prevents the app from getting stuck in an infinite loop of re-fetching data.
 *
 * @param memoizedDocRef The Firestore document reference to listen to.
 * @returns An object containing the document's data, loading state, and any potential error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If the document reference isn't ready yet, we just wait.
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // This function sets up the real-time listener on our database document.
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          // If the document exists, we set its data in our state, making sure to include the ID.
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // If the document doesn't exist, we set the data to null.
          setData(null);
        }
        setError(null); 
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // If the listener fails (usually due to a security rule), we create a detailed, helpful error.
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // We then send this detailed error to a global listener, which will display it on the screen.
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // This function cleans up the listener when the component is removed, preventing memory leaks.
    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
