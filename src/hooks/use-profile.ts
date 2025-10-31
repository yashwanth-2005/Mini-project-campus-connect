
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '@/lib/mock-db';

const USE_MOCK_DB = process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true';

// This custom hook centralizes the logic for fetching and updating user profiles.
// It intelligently switches between the live Firebase backend and a local mock database
// based on the environment variable `NEXT_PUBLIC_USE_MOCK_DB`.
export function useProfile() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // Firestore-specific logic
    const userDocRef = useMemoFirebase(() => (user && firestore && !USE_MOCK_DB) ? doc(firestore, "users", user.uid) : null, [firestore, user]);
    const { data: firestoreProfile, isLoading: isFirestoreLoading, error: firestoreError } = useDoc<UserProfile>(userDocRef);

    // Mock DB (localStorage) specific logic
    const [mockProfile, setMockProfile] = useState<UserProfile | null>(null);
    const [isMockLoading, setIsMockLoading] = useState(USE_MOCK_DB);

    // Effect for loading mock data from localStorage.
    useEffect(() => {
        if (USE_MOCK_DB && user) {
            setIsMockLoading(true);
            const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
            const profile = profiles[user.uid];
            setMockProfile(profile || null);
            setIsMockLoading(false);
        }
    }, [user]);

    // This function abstracts the update operation.
    const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
        if (!user) throw new Error("User not authenticated.");

        if (USE_MOCK_DB) {
            // Update logic for mock database
            const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
            const updatedProfile = { ...(profiles[user.uid] || {}), ...data };
            profiles[user.uid] = updatedProfile;
            localStorage.setItem('userProfiles', JSON.stringify(profiles));
            setMockProfile(updatedProfile); // Update local state immediately
        } else {
            // Update logic for Firestore
            if (!userDocRef) throw new Error("Firestore user reference not available.");
            await updateDoc(userDocRef, data);
        }
    }, [user, userDocRef]);

    return {
        userProfile: USE_MOCK_DB ? mockProfile : firestoreProfile,
        isLoading: isUserLoading || (USE_MOCK_DB ? isMockLoading : isFirestoreLoading),
        error: USE_MOCK_DB ? null : firestoreError,
        updateUserProfile,
    };
}

    