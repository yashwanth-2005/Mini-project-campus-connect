
'use client';

import { useCallback } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, serverTimestamp, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

// This defines the data structure for a single forum post in our database.
export type ForumPost = {
    id: string;
    authorId: string;
    authorName: string;
    authorImage: string;
    title: string;
    content: string;
    createdAt: any; // This can be a server timestamp or a Date object.
    upvoteUserIds?: string[];
};

// This custom hook centralizes all the logic for interacting with the forum database.
export function useForum() {
    const { user } = useUser();
    const firestore = useFirestore();

    // We "memoize" the database query. This is a performance optimization that prevents
    // the app from re-fetching the data unnecessarily.
    const postsCollectionRef = useMemoFirebase(() => 
        firestore 
        ? query(collection(firestore, 'forum_posts'), orderBy('createdAt', 'desc')) 
        : null,
    [firestore]);
    
    // The `useCollection` hook provides a real-time stream of data from our query.
    // Any changes in the database will automatically update the `posts` variable.
    const { data: posts, isLoading, error } = useCollection<ForumPost>(postsCollectionRef);

    // This function adds a new post to the 'forum_posts' collection in our database.
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
    
    // This function handles toggling an upvote on a post.
    const toggleUpvote = useCallback(async (postId: string) => {
        if (!user) throw new Error("You must be logged in to upvote.");
        if (!firestore) throw new Error("Firestore is not initialized.");

        const postRef = doc(firestore, 'forum_posts', postId);
        
        // We find the current post from our live data to see if the user has already upvoted it.
        const post = posts?.find(p => p.id === postId);

        if (post?.upvoteUserIds?.includes(user.uid)) {
            // If they have, we remove their ID from the 'upvoteUserIds' array.
            await updateDoc(postRef, { upvoteUserIds: arrayRemove(user.uid) });
        } else {
            // If they haven't, we add their ID to the 'upvoteUserIds' array.
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
