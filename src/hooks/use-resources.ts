
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useStorage, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, updateDoc, deleteDoc, serverTimestamp, doc, orderBy, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// This file will now *always* use the live Firebase backend for resources.
const USE_MOCK_DB = false; // Hardcoded to false for this hook.

// Defines the structure of a resource object.
export type Resource = {
    id: string;
    name: string;
    description: string;
    fileType: string;
    uploaderId: string;
    uploaderName: string;
    uploadDate: any; // Can be a server timestamp, a Date, or an ISO string.
    fileUrl: string;
    storagePath: string;
};

// This custom hook abstracts the logic for managing resources.
// It is now hardcoded to use the live Firebase backend.
export function useResources() {
    const { user } = useUser();
    const firestore = useFirestore();
    const storage = useStorage();

    // --- Firestore Logic ---
    // The query is memoized to prevent re-renders. It fetches all documents from the 'resources' collection.
    const resourcesQuery = useMemoFirebase(() => 
        (firestore) ? query(collection(firestore, 'resources'), orderBy('uploadDate', 'desc')) : null,
        [firestore]
    );
    // useCollection provides a real-time stream of the resources data.
    const { data: firestoreResources, isLoading: isLoadingFirestore, error } = useCollection<Resource>(resourcesQuery);


    // --- Abstracted Functions for Firebase ---

    // Handles the entire file upload process to Firebase Storage and Firestore.
    const uploadResource = useCallback(async (title: string, description: string, file: File) => {
        if (!user) throw new Error("You must be logged in to upload a resource.");
        if (!firestore || !storage) throw new Error("Firebase is not initialized.");
        
        // Create a unique path in Firebase Storage for the file.
        const storagePath = `resources/${user.uid}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        // Upload the file bytes.
        const snapshot = await uploadBytes(storageRef, file);
        // Get the public download URL for the uploaded file.
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Create a new document in the 'resources' collection in Firestore with the file's metadata.
        await addDoc(collection(firestore, 'resources'), {
            name: title,
            description,
            fileType: file.type || "File",
            uploaderId: user.uid,
            uploaderName: user.displayName || 'Anonymous',
            uploadDate: serverTimestamp(), // Use the server's timestamp for consistency.
            fileUrl: downloadURL,
            storagePath: storagePath,
        });
    }, [user, firestore, storage]);

    // Updates the metadata (name and description) of an existing resource document in Firestore.
    const updateResource = useCallback(async (resourceId: string, title: string, description: string) => {
        if (!user) throw new Error("User not authenticated.");
        if (!firestore) throw new Error("Firestore is not initialized.");
        
        const resourceDocRef = doc(firestore, 'resources', resourceId);
        await updateDoc(resourceDocRef, { name: title, description: description });
    }, [firestore, user]);

    // Deletes a resource from both Firestore and Firebase Storage.
    const deleteResource = useCallback(async (resourceId: string, storagePath: string) => {
        if (!user) throw new Error("User not authenticated.");
        if (!firestore || !storage) throw new Error("Firebase is not initialized.");

        // Create references to the Firestore document and the Storage file.
        const resourceDocRef = doc(firestore, 'resources', resourceId);
        const fileRef = ref(storage, storagePath);

        // Delete the file from Storage first.
        await deleteObject(fileRef);
        // Then, delete the metadata document from Firestore.
        await deleteDoc(resourceDocRef);
    }, [firestore, storage, user]);

    return {
        // Always return the data, loading state, and error from the live Firestore backend.
        resources: firestoreResources,
        isLoading: isLoadingFirestore,
        error,
        uploadResource,
        updateResource,
        deleteResource,
    };
}
