
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

// We define this type here to avoid importing from mock-db
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

// This environment variable determines whether to use the mock DB or live Firebase.
const USE_MOCK_DB = process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true';

// This custom hook centralizes the logic for fetching and updating user profiles.
export function useProfile() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // --- Firestore Logic ---
    // Memoize the document reference to prevent re-renders. It depends on the user's UID.
    const userDocRef = useMemoFirebase(() => 
        (user && firestore && !USE_MOCK_DB) ? doc(firestore, "users", user.uid) : null, 
    [firestore, user]);
    const { data: firestoreProfile, isLoading: isFirestoreLoading, error: firestoreError } = useDoc<UserProfile>(userDocRef);

    // --- Mock DB (localStorage) Logic ---
    const [mockProfile, setMockProfile] = useState<UserProfile | null>(null);
    const [isMockLoading, setIsMockLoading] = useState(USE_MOCK_DB);

    // Effect to load data from localStorage. Runs only on the client-side.
    useEffect(() => {
        if (USE_MOCK_DB && user) {
            setIsMockLoading(true);
            try {
                const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
                const profile = profiles[user.uid];
                setMockProfile(profile || null);
            } catch (e) {
                console.error("Failed to parse user profiles from localStorage", e);
                setMockProfile(null);
            } finally {
                setIsMockLoading(false);
            }
        }
    }, [user]);

    // --- Abstracted Update Function ---
    // This function updates the user profile in either Firebase or localStorage.
    const updateUserProfile = useCallback(async (data: Partial<Omit<UserProfile, 'id' | 'email' | 'role'>>) => {
        if (!user) throw new Error("User not authenticated.");

        if (USE_MOCK_DB) {
            const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
            const updatedProfile = { ...(profiles[user.uid] || {}), ...data };
            profiles[user.uid] = updatedProfile;
            localStorage.setItem('userProfiles', JSON.stringify(profiles));
            setMockProfile(updatedProfile); // Update local state immediately for instant UI feedback.
        } else {
            if (!userDocRef) throw new Error("Firestore user reference not available.");
            // For Firestore, we use `updateDoc` to modify the existing document.
            await updateDoc(userDocRef, data);
        }
    }, [user, userDocRef]);

    return {
        // Conditionally return the profile from the correct source.
        userProfile: USE_MOCK_DB ? mockProfile : firestoreProfile,
        // Combine loading states. The profile is loading if auth is loading or the specific data source is loading.
        isLoading: isUserLoading || (USE_MOCK_DB ? isMockLoading : isFirestoreLoading),
        error: USE_MOCK_DB ? null : firestoreError,
        updateUserProfile,
    };
}
