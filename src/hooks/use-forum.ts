
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

const USE_MOCK_DB = process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true';

// Defines the structure of a single forum post.
export type ForumPost = {
    id: string;
    authorId: string;
    authorName: string;
    title: string;
    content: string;
    createdAt: any; // Can be a server timestamp or a string
    upvoteUserIds?: string[];
    downvoteUserIds?: string[];
};

// This custom hook centralizes the logic for forum interactions.
// It intelligently switches between Firebase and a local mock DB.
export function useForum() {
    const { user } = useUser();
    const firestore = useFirestore();

    // --- Firestore Logic ---
    const postsCollectionRef = (firestore && !USE_MOCK_DB) 
        ? query(collection(firestore, 'forum_posts'), orderBy('createdAt', 'desc')) 
        : null;
    const { data: firestorePosts, isLoading: isLoadingFirestore, error } = useCollection<ForumPost>(postsCollectionRef);

    // --- Mock DB Logic ---
    const [mockPosts, setMockPosts] = useState<ForumPost[]>([]);
    const [isLoadingMock, setIsLoadingMock] = useState(USE_MOCK_DB);

    // Function to load mock posts from localStorage.
    const loadMockPosts = useCallback(() => {
        if (USE_MOCK_DB) {
            setIsLoadingMock(true);
            const stored = localStorage.getItem('forum_posts');
            const posts = stored ? JSON.parse(stored) : [];
            // Sort by createdAt descending
            posts.sort((a: ForumPost, b: ForumPost) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setMockPosts(posts);
            setIsLoadingMock(false);
        }
    }, []);

    // Load mock posts on initial render if using mock DB.
    useEffect(() => {
        loadMockPosts();
    }, [loadMockPosts]);

    // --- Abstracted Functions ---

    const addPost = useCallback(async (title: string, content: string) => {
        if (!user) throw new Error("You must be logged in to post.");

        const postData = {
            title,
            content,
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
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

    return {
        posts: USE_MOCK_DB ? mockPosts : firestorePosts,
        isLoading: USE_MOCK_DB ? isLoadingMock : isLoadingFirestore,
        error,
        addPost,
    };
}

    