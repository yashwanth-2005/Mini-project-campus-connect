
'use client';

import { useCallback } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, serverTimestamp, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

// Defines the structure of a single forum post.
export type ForumPost = {
    id: string;
    authorId: string;
    authorName: string;
    authorImage: string;
    title: string;
    content: string;
    createdAt: any; // Can be a server timestamp or a Date object
    upvoteUserIds?: string[];
};

// This custom hook centralizes all logic for forum interactions with Firestore.
export function useForum() {
    const { user } = useUser();
    const firestore = useFirestore();

    // Memoize the query to prevent unnecessary re-renders.
    const postsCollectionRef = useMemoFirebase(() => 
        firestore 
        ? query(collection(firestore, 'forum_posts'), orderBy('createdAt', 'desc')) 
        : null,
    [firestore]);
    
    // The useCollection hook provides a real-time stream of data from Firestore.
    const { data: posts, isLoading, error } = useCollection<ForumPost>(postsCollectionRef);

    // Adds a new post to the 'forum_posts' collection in Firestore.
    const addPost = useCallback(async (title: string, content: string) => {
        if (!user) throw new Error("You must be logged in to post.");
        if (!firestore) throw new Error("Firestore is not initialized.");

        const postData = {
            title,
            content,
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorImage: user.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.uid}`,
            createdAt: serverTimestamp(),
            upvoteUserIds: [],
        };
        
        await addDoc(collection(firestore, 'forum_posts'), postData);
    }, [user, firestore]);
    
    // Toggles an upvote on a post in Firestore.
    const toggleUpvote = useCallback(async (postId: string) => {
        if (!user) throw new Error("You must be logged in to upvote.");
        if (!firestore) throw new Error("Firestore is not initialized.");

        const postRef = doc(firestore, 'forum_posts', postId);
        
        // Find the current post from the live data to check its state.
        const post = posts?.find(p => p.id === postId);

        if (post?.upvoteUserIds?.includes(user.uid)) {
            // Atomically remove the user's UID from the 'upvoteUserIds' array.
            await updateDoc(postRef, { upvoteUserIds: arrayRemove(user.uid) });
        } else {
            // Atomically add the user's UID to the 'upvoteUserIds' array.
            await updateDoc(postRef, { upvoteUserIds: arrayUnion(user.uid) });
        }
    }, [user, firestore, posts]);

    return {
        posts,
        isLoading,
        error,
        addPost,
        toggleUpvote,
    };
}
