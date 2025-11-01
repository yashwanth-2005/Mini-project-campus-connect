
'use client';

import { useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

// This defines the data structure for a user's profile in our database.
export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'student' | 'faculty';
    // These fields are specific to students.
    usn?: string;
    year?: number;
    semester?: number;
    course?: string;
    branch?: string;
    // These fields are specific to faculty.
    department?: string;
    facultyId?: string;
    uniqueCode?: string;
    // These are optional social links.
    linkedinUrl?: string;
    leetcodeUrl?: string;
    githubUrl?: string;
    profilePictureUrl?: string;
};

// This custom hook centralizes all the logic for fetching and updating a user's profile.
export function useProfile() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // We "memoize" the document reference. This is a performance optimization.
    // It ensures that we only create a new reference if the user's ID or the database connection changes.
    const userDocRef = useMemoFirebase(() => 
        (user && firestore) ? doc(firestore, "users", user.uid) : null, 
    [firestore, user]);

    // The `useDoc` hook provides a real-time stream of the user's profile data from the database.
    const { data: userProfile, isLoading: isProfileLoading, error: firestoreError } = useDoc<UserProfile>(userDocRef);

    // This function updates the user's profile in the database.
    const updateUserProfile = useCallback(async (data: Partial<Omit<UserProfile, 'id' | 'email' | 'role'>>) => {
        if (!userDocRef) throw new Error("User reference not available. Cannot update profile.");
        
        // `updateDoc` modifies the existing document without overwriting it completely.
        await updateDoc(userDocRef, data);
    }, [userDocRef]);

    return {
        userProfile,
        // The profile is considered "loading" if we are still checking the user's auth state
        // or if we are actively fetching the profile from the database.
        isLoading: isUserLoading || isProfileLoading,
        error: firestoreError,
        updateUserProfile,
    };
}
