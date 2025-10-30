
'use client';
import { FirestorePermissionError } from '@/firebase/errors';

// This interface defines all possible events and their corresponding data types.
// It centralizes event definitions for type safety across the application.
export interface AppEvents {
  'permission-error': FirestorePermissionError;
}

// A generic type for a callback function.
type Callback<T> = (data: T) => void;

/**
 * A strongly-typed pub/sub event emitter. It allows different parts of the
 * application to communicate without being directly coupled.
 */
function createEventEmitter<T extends Record<string, any>>() {
  // Stores arrays of callbacks, keyed by the event name.
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

  return {
    // Subscribes to an event.
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName]?.push(callback);
    },

    // Unsubscribes from an event.
    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },

    // Publishes an event to all of its subscribers.
    emit<K extends keyof T>(eventName: K, data: T[K]) {
      if (!events[eventName]) {
        return;
      }
      events[eventName]?.forEach(callback => callback(data));
    },
  };
}

// Creates and exports a single, global instance of the event emitter.
export const errorEmitter = createEventEmitter<AppEvents>();

    