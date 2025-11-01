
'use client';

import { useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'student' | 'faculty';
    // Student specific
    usn?: string;
    year?: number;
    semester?: number;
    course?: string;
    branch?: string;
    // Faculty specific
    department?: string;
    facultyId?: string;
    uniqueCode?: string;
    // Optional social links
    linkedinUrl?: string;
    leetcodeUrl?: string;
    githubUrl?: string;
    profilePictureUrl?: string;
};

// This custom hook centralizes the logic for fetching and updating user profiles from Firestore.
export function useProfile() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // Memoize the document reference. It depends on the user's UID.
    const userDocRef = useMemoFirebase(() => 
        (user && firestore) ? doc(firestore, "users", user.uid) : null, 
    [firestore, user]);

    // useDoc provides a real-time stream of the user's profile data.
    const { data: userProfile, isLoading: isProfileLoading, error: firestoreError } = useDoc<UserProfile>(userDocRef);

    // This function updates the user profile in Firestore.
    const updateUserProfile = useCallback(async (data: Partial<Omit<UserProfile, 'id' | 'email' | 'role'>>) => {
        if (!userDocRef) throw new Error("User reference not available. Cannot update profile.");
        
        // `updateDoc` modifies the existing document without overwriting it.
        await updateDoc(userDocRef, data);
    }, [userDocRef]);

    return {
        // The user's profile data from Firestore.
        userProfile,
        // The profile is loading if auth is loading or Firestore is loading.
        isLoading: isUserLoading || isProfileLoading,
        error: firestoreError,
        updateUserProfile,
    };
}
