
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, serverTimestamp, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

// Environment variable to toggle between live Firebase and local mock data.
const USE_MOCK_DB = process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true';

// Defines the structure of a single forum post.
export type ForumPost = {
    id: string;
    authorId: string;
    authorName: string;
    authorImage: string;
    title: string;
    content: string;
    createdAt: any; // Can be a server timestamp, a Date object, or an ISO string
    upvoteUserIds?: string[];
};

// This custom hook centralizes all logic for forum interactions.
export function useForum() {
    const { user } = useUser();
    const firestore = useFirestore();

    // --- Firestore Logic ---
    // Memoize the query to prevent unnecessary re-renders.
    const postsCollectionRef = useMemoFirebase(() => 
        (firestore && !USE_MOCK_DB) 
        ? query(collection(firestore, 'forum_posts'), orderBy('createdAt', 'desc')) 
        : null,
    [firestore]);
    // The useCollection hook provides a real-time stream of data.
    const { data: firestorePosts, isLoading: isLoadingFirestore, error } = useCollection<ForumPost>(postsCollectionRef);

    // --- Mock DB Logic ---
    const [mockPosts, setMockPosts] = useState<ForumPost[]>([]);
    const [isLoadingMock, setIsLoadingMock] = useState(USE_MOCK_DB);

    // Load posts from localStorage. This should only run on the client.
    useEffect(() => {
        if (USE_MOCK_DB) {
            setIsLoadingMock(true);
            try {
                const stored = localStorage.getItem('forum_posts');
                const posts: ForumPost[] = stored ? JSON.parse(stored) : [];
                // Sort by creation date, descending.
                posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setMockPosts(posts);
            } catch (e) {
                console.error("Failed to parse forum posts from localStorage", e);
                setMockPosts([]);
            } finally {
                setIsLoadingMock(false);
            }
        }
    }, []);

    // --- Abstracted Functions ---

    // Adds a new post to the forum.
    const addPost = useCallback(async (title: string, content: string) => {
        if (!user) throw new Error("You must be logged in to post.");

        const postData = {
            title,
            content,
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorImage: user.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.uid}`,
        };

        if (USE_MOCK_DB) {
            const newPost: ForumPost = {
                ...postData,
                id: `post_${Date.now()}`,
                createdAt: new Date().toISOString(),
                upvoteUserIds: [],
            };
            const updatedPosts = [newPost, ...mockPosts];
            localStorage.setItem('forum_posts', JSON.stringify(updatedPosts));
            setMockPosts(updatedPosts);
        } else {
            if (!firestore) throw new Error("Firestore is not initialized.");
            await addDoc(collection(firestore, 'forum_posts'), {
                ...postData,
                createdAt: serverTimestamp(),
                upvoteUserIds: [],
            });
        }
    }, [user, firestore, mockPosts]);
    
    // Toggles an upvote on a post.
    const toggleUpvote = useCallback(async (postId: string) => {
        if (!user) throw new Error("You must be logged in to upvote.");

        if (USE_MOCK_DB) {
            const updatedPosts = mockPosts.map(p => {
                if (p.id === postId) {
                    const upvotes = p.upvoteUserIds || [];
                    if (upvotes.includes(user.uid)) {
                        // Remove upvote
                        return { ...p, upvoteUserIds: upvotes.filter(id => id !== user.uid) };
                    } else {
                        // Add upvote
                        return { ...p, upvoteUserIds: [...upvotes, user.uid] };
                    }
                }
                return p;
            });
            localStorage.setItem('forum_posts', JSON.stringify(updatedPosts));
            setMockPosts(updatedPosts);
        } else {
            if (!firestore) throw new Error("Firestore is not initialized.");
            const postRef = doc(firestore, 'forum_posts', postId);
            // This is a bit of a workaround for real-time toggling without reading first.
            // A transaction would be safer but more complex.
            const post = firestorePosts?.find(p => p.id === postId);
            if (post?.upvoteUserIds?.includes(user.uid)) {
                await updateDoc(postRef, { upvoteUserIds: arrayRemove(user.uid) });
            } else {
                await updateDoc(postRef, { upvoteUserIds: arrayUnion(user.uid) });
            }
        }
    }, [user, firestore, mockPosts, firestorePosts]);

    return {
        // Return the correct data source based on the environment.
        posts: USE_MOCK_DB ? mockPosts : firestorePosts,
        isLoading: USE_MOCK_DB ? isLoadingMock : isLoadingFirestore,
        error,
        addPost,
        toggleUpvote,
    };
}
