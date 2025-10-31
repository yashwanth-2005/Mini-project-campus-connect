
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { collection, query, addDoc, updateDoc, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const USE_MOCK_DB = process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true';

// Defines the structure of a resource object.
export type Resource = {
    id: string;
    name: string;
    description: string;
    fileType: string;
    uploaderId: string;
    uploaderName: string;
    uploadDate: any; 
    fileUrl: string;
    storagePath: string;
};

// This custom hook abstracts the logic for managing resources.
// It switches between Firebase and a local mock DB based on an environment variable.
export function useResources() {
    const { user } = useUser();
    const firestore = useFirestore();
    const storage = useStorage();

    // --- Firestore Logic ---
    const resourcesCollectionRef = (firestore && !USE_MOCK_DB) ? collection(firestore, 'resources') : null;
    const { data: firestoreResources, isLoading: isLoadingFirestore, error } = useCollection<Resource>(resourcesCollectionRef);

    // --- Mock DB Logic ---
    const [mockResources, setMockResources] = useState<Resource[]>([]);
    const [isLoadingMock, setIsLoadingMock] = useState(USE_MOCK_DB);

    // Function to load mock data from localStorage.
    const loadMockResources = useCallback(() => {
        if (USE_MOCK_DB) {
            setIsLoadingMock(true);
            const stored = localStorage.getItem('resources');
            setMockResources(stored ? JSON.parse(stored) : []);
            setIsLoadingMock(false);
        }
    }, []);

    // Load mock data on initial render if using mock DB.
    useEffect(() => {
        loadMockResources();
    }, [loadMockResources]);

    // --- Abstracted Functions ---

    const uploadResource = useCallback(async (title: string, description: string, file: File) => {
        if (!user) throw new Error("You must be logged in to upload a resource.");

        if (USE_MOCK_DB) {
            // Simulate upload for mock DB
            const newResource: Resource = {
                id: `res_${Date.now()}`,
                name: title,
                description,
                fileType: file.type,
                uploaderId: user.uid,
                uploaderName: user.displayName || "Anonymous",
                uploadDate: new Date().toISOString(),
                fileUrl: URL.createObjectURL(file), // Create a temporary local URL
                storagePath: `mock/resources/${file.name}`,
            };
            const updatedResources = [...mockResources, newResource];
            localStorage.setItem('resources', JSON.stringify(updatedResources));
            setMockResources(updatedResources);
        } else {
            // Real upload for Firebase
            if (!firestore || !storage) throw new Error("Firebase is not initialized.");
            const storagePath = `resources/${user.uid}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(firestore, 'resources'), {
                name: title,
                description,
                fileType: file.type || "File",
                uploaderId: user.uid,
                uploaderName: user.displayName || 'Anonymous',
                uploadDate: serverTimestamp(),
                fileUrl: downloadURL,
                storagePath: storagePath,
            });
        }
    }, [user, firestore, storage, mockResources]);

    const updateResource = useCallback(async (resourceId: string, title: string, description: string) => {
        if (USE_MOCK_DB) {
            const updatedResources = mockResources.map(r => 
                r.id === resourceId ? { ...r, name: title, description } : r
            );
            localStorage.setItem('resources', JSON.stringify(updatedResources));
            setMockResources(updatedResources);
        } else {
            if (!firestore) throw new Error("Firestore is not initialized.");
            const resourceDocRef = doc(firestore, 'resources', resourceId);
            await updateDoc(resourceDocRef, { name: title, description: description });
        }
    }, [firestore, mockResources]);

    const deleteResource = useCallback(async (resourceId: string, storagePath: string) => {
        if (USE_MOCK_DB) {
            const updatedResources = mockResources.filter(r => r.id !== resourceId);
            localStorage.setItem('resources', JSON.stringify(updatedResources));
            setMockResources(updatedResources);
        } else {
            if (!firestore || !storage) throw new Error("Firebase is not initialized.");
            const resourceDocRef = doc(firestore, 'resources', resourceId);
            const fileRef = ref(storage, storagePath);
            await deleteObject(fileRef); // Delete from Storage
            await deleteDoc(resourceDocRef); // Delete from Firestore
        }
    }, [firestore, storage, mockResources]);

    return {
        resources: USE_MOCK_DB ? mockResources : firestoreResources,
        isLoading: USE_MOCK_DB ? isLoadingMock : isLoadingFirestore,
        error,
        uploadResource,
        updateResource,
        deleteResource,
    };
}

    