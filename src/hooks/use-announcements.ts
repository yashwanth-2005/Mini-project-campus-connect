
'use client';

import { useCallback } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

// This defines the data structure for a single announcement post in our database.
export type Announcement = {
    id: string;
    authorId: string;
    authorName: string;
    authorImage: string;
    title: string;
    content: string;
    createdAt: any; // Can be a server timestamp or a Date object.
    attachmentUrls?: { name: string, url: string }[];
};

// This custom hook centralizes all the logic for interacting with the announcements collection.
export function useAnnouncements() {
    const { user } = useUser();
    const firestore = useFirestore();

    // We "memoize" the database query. This performance optimization prevents
    // the app from re-fetching the data on every render.
    const announcementsCollectionRef = useMemoFirebase(() => 
        firestore 
        ? query(collection(firestore, 'announcements'), orderBy('createdAt', 'desc')) 
        : null,
    [firestore]);
    
    // The `useCollection` hook provides a real-time stream of data from our query.
    // Any changes in the database will automatically update the `announcements` variable.
    const { data: announcements, isLoading, error } = useCollection<Announcement>(announcementsCollectionRef);

    // This function adds a new announcement to the 'announcements' collection in our database.
    const addAnnouncement = useCallback(async (title: string, content: string) => {
        if (!user) throw new Error("You must be logged in to post an announcement.");
        if (user.role !== "faculty") throw new Error("Only faculty can post announcements.");
        if (!firestore) throw new Error("Firestore is not initialized.");

        const announcementData = {
            title,
            content,
            authorId: user.uid,
            authorName: user.displayName || 'Faculty',
            authorImage: user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${user.displayName || 'F'}`,
            createdAt: serverTimestamp(),
            attachmentUrls: [],
        };
        
        await addDoc(collection(firestore, 'announcements'), announcementData);
    }, [user, firestore]);

    return {
        announcements: announcements || [],
        isLoading,
        error,
        addAnnouncement,
    };
}
