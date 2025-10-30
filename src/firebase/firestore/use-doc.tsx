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

// A utility type to add an 'id' field to a given type T.
type WithId<T> = T & { id: string };

// The return value of the useDoc hook.
export interface UseDocResult<T> {
  data: WithId<T> | null; 
  isLoading: boolean;       
  error: FirestoreError | Error | null; 
}

/**
 * A React hook to subscribe to a single Firestore document in real-time.
 * 
 * IMPORTANT: The document reference you pass to this hook MUST be memoized
 * with useMemo or useMemoFirebase to prevent infinite re-renders.
 *
 * @template T The type for your document data.
 * @param {DocumentReference | null | undefined} docRef The Firestore document reference.
 * @returns {UseDocResult<T>} An object with the data, loading state, and error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If the reference isn't ready, reset the state.
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set up the real-time listener.
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          // If the document exists, set the data.
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // If the document does not exist, set data to null.
          setData(null);
        }
        setError(null); 
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // On error, create a more detailed error for better debugging.
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // Send the error to a global listener.
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Clean up the listener when the component unmounts.
    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
