
'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This is a helper type that adds a mandatory 'id' field to any data object.
export type WithId<T> = T & { id: string };

// This defines the shape of the object returned by our `useCollection` hook.
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; 
  isLoading: boolean;       
  error: FirestoreError | Error | null; 
}

// This is an internal type that helps us reliably get the path of a Firestore query.
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * A custom React hook to listen for real-time updates from a Firestore collection or query.
 * 
 * IMPORTANT: The query you pass to this hook MUST be "memoized" with `useMemoFirebase`.
 * This prevents the app from getting stuck in an infinite loop of re-fetching data.
 *  
 * @param memoizedTargetRefOrQuery The Firestore query or reference to listen to.
 * @returns An object containing the data, loading state, and any potential error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If the query isn't ready yet (e.g., we're still waiting for a user ID), we just wait.
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // This function sets up the real-time listener on our database query.
    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        // When we get new data, we transform it into an array, making sure to include each document's ID.
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // If the listener fails (usually due to a security rule), we create a detailed, helpful error.
        const path: string =
          memoizedTargetRefOrQuery.type === 'collection'
            ? (memoizedTargetRefOrQuery as CollectionReference).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
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
  }, [memoizedTargetRefOrQuery]); 

  // This is a safety check for development to ensure we're using the hook correctly.
  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error('The query passed to useCollection was not memoized. Use useMemoFirebase to prevent re-renders.');
  }
  return { data, isLoading, error };
}
