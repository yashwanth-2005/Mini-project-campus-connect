
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

// A utility type to add an 'id' field to a given type.
export type WithId<T> = T & { id: string };

// The return value of the useCollection hook.
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; 
  isLoading: boolean;       
  error: FirestoreError | Error | null; 
}

// An internal type for Firestore queries to access the path.
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * A React hook to subscribe to a Firestore collection or query in real-time.
 * 
 * IMPORTANT: The query or reference passed to this hook MUST be memoized
 * with useMemo or useMemoFirebase to prevent infinite re-renders.
 *  
 * @param {CollectionReference | Query | null | undefined} memoizedTargetRefOrQuery The Firestore query or reference.
 * @returns {UseCollectionResult<T>} An object with the data, loading state, and error.
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
    // If the query isn't ready, reset the state.
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Sets up the real-time listener.
    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        // On success, map the documents to include their IDs.
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // On error, create a more detailed error for better debugging.
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

        // Sends the error to a global listener.
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleans up the listener when the component unmounts.
    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]); 

  // Enforces memoization of the query.
  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error('The query passed to useCollection was not memoized. Use useMemoFirebase.');
  }
  return { data, isLoading, error };
}
