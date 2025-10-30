
'use client';
import { FirestorePermissionError } from '@/firebase/errors';

// This interface defines all possible events and their corresponding data types.
// It centralizes event definitions for type safety across the application.
export interface AppEvents {
  'permission-error': FirestorePermissionError;
}

// This is a generic type for a callback function.
type Callback<T> = (data: T) => void;

/**
 * A strongly-typed event system (also known as a "pub/sub" model).
 * It allows different parts of the application to communicate without being directly linked.
 */
function createEventEmitter<T extends Record<string, any>>() {
  // Stores arrays of callbacks, organized by the event name.
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

  return {
    // Subscribes a function to an event.
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName]?.push(callback);
    },

    // Unsubscribes a function from an event.
    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },

    // Publishes an event, calling all subscribed functions.
    emit<K extends keyof T>(eventName: K, data: T[K]) {
      if (!events[eventName]) {
        return;
      }
      events[eventName]?.forEach(callback => callback(data));
    },
  };
}

// Creates and exports a single, global instance of the event emitter for the app.
export const errorEmitter = createEventEmitter<AppEvents>();
