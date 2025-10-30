
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

// A utility type that adds a mandatory 'id' field to another type.
type WithId<T> = T & { id: string };

// The shape of the object returned by the useDoc hook.
export interface UseDocResult<T> {
  data: WithId<T> | null; 
  isLoading: boolean;       
  error: FirestoreError | Error | null; 
}

/**
 * A React hook to subscribe to a single Firestore document in real-time.
 * 
 * IMPORTANT: The document reference passed to this hook MUST be memoized
 * with `useMemo` or `useMemoFirebase` to prevent infinite re-renders.
 *
 * @param memoizedDocRef The Firestore document reference to listen to.
 * @returns An object with the data, loading state, and any error that occurred.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If the reference isn't ready yet, do nothing.
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Sets up the real-time listener on the provided document reference.
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          // If the document exists, set its data in state, including the ID.
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // If the document does not exist, set the data to null.
          setData(null);
        }
        setError(null); 
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // If an error occurs (like a permissions issue), create a more detailed error.
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // Sends the detailed error to a global listener to be displayed.
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleans up the listener when the component unmounts or the reference changes.
    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
