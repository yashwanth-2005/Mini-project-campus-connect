
'use client';
import { FirestorePermissionError } from '@/firebase/errors';

// This interface defines all the possible "events" that can happen in our app
// and the type of data that comes with them. This helps us avoid typos.
export interface AppEvents {
  'permission-error': FirestorePermissionError;
}

// This is a generic type for a function that will be called when an event happens.
type Callback<T> = (data: T) => void;

/**
 * This function creates a simple, strongly-typed event system (also known as a "pub/sub" or "publisher-subscriber" model).
 * It lets different parts of the app communicate with each other without being directly connected.
 * For example, our database code can "emit" an error, and our UI code can "listen" for it.
 */
function createEventEmitter<T extends Record<string, any>>() {
  // This object will store our listeners. The keys are event names, and the values are arrays of functions to call.
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

  return {
    // This function lets a part of our code "subscribe" to an event.
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName]?.push(callback);
    },

    // This function lets a part of our code "unsubscribe" from an event.
    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },

    // This function "emits" or "publishes" an event, which calls all the subscribed functions.
    emit<K extends keyof T>(eventName: K, data: T[K]) {
      if (!events[eventName]) {
        return;
      }
      events[eventName]?.forEach(callback => callback(data));
    },
  };
}

// We create and export a single, global instance of the event emitter for our app to use.
export const errorEmitter = createEventEmitter<AppEvents>();
