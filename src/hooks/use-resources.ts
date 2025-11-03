
'use client';

import { useCallback } from 'react';
import { useUser, useFirestore, useStorage, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, updateDoc, deleteDoc, serverTimestamp, doc, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// This defines the data structure for a single resource object in our Firestore database.
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

// This custom hook handles all the logic for managing resources with Firebase.
// It now accepts a collection name to be reusable for different repositories.
export function useResources(collectionName: string = 'resources') {
    const { user } = useUser();
    const firestore = useFirestore();
    const storage = useStorage();

    // We "memoize" this query to prevent re-fetching data unnecessarily.
    // It gets all documents from the specified collection, ordered by most recent.
    const resourcesQuery = useMemoFirebase(() => 
        (firestore) ? query(collection(firestore, collectionName), orderBy('uploadDate', 'desc')) : null,
        [firestore, collectionName]
    );

    // The `useCollection` hook gives us a real-time stream of the resources data.
    const { data: resources, isLoading, error } = useCollection<Resource>(resourcesQuery);

    // This function handles the entire file upload process to Firebase Storage and Firestore.
    const uploadResource = useCallback(async (title: string, description: string, file: File) => {
        if (!user) throw new Error("You must be logged in to upload a resource.");
        if (!firestore || !storage) throw new Error("Firebase is not initialized.");
        
        // We create a unique path in Firebase Storage to store the file.
        // The path includes the user's ID to help manage permissions later.
        const storagePath = `${collectionName}/${user.uid}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        // We upload the file's raw data (bytes).
        const snapshot = await uploadBytes(storageRef, file);
        // After uploading, we get the public URL to download the file.
        const downloadURL = await getDownloadURL(snapshot.ref);

        // We then create a new document in our specified Firestore collection
        // to store the file's metadata, like its name and download URL.
        await addDoc(collection(firestore, collectionName), {
            name: title,
            description,
            fileType: file.type || "File",
            uploaderId: user.uid,
            uploaderName: user.displayName || 'Anonymous',
            uploadDate: serverTimestamp(), // We use the server's timestamp for accuracy.
            fileUrl: downloadURL,
            storagePath: storagePath,
        });
    }, [user, firestore, storage, collectionName]);

    // This function updates the metadata (just the name and description) of an existing resource.
    const updateResource = useCallback(async (resourceId: string, title: string, description: string) => {
        if (!user) throw new Error("User not authenticated.");
        if (!firestore) throw new Error("Firestore is not initialized.");
        
        const resourceDocRef = doc(firestore, collectionName, resourceId);
        await updateDoc(resourceDocRef, { name: title, description: description });
    }, [firestore, user, collectionName]);

    // This function deletes a resource from both Firestore and Firebase Storage.
    const deleteResource = useCallback(async (resourceId: string, storagePath: string) => {
        if (!user) throw new Error("User not authenticated.");
        if (!firestore || !storage) throw new Error("Firebase is not initialized.");

        // We create references to both the file in Storage and its metadata document in Firestore.
        const resourceDocRef = doc(firestore, collectionName, resourceId);
        const fileRef = ref(storage, storagePath);

        // It's important to delete the file from Storage first.
        await deleteObject(fileRef);
        // Then, we delete the metadata document from Firestore.
        await deleteDoc(resourceDocRef);
    }, [firestore, storage, user, collectionName]);

    return {
        resources: resources || [],
        isLoading,
        error,
        uploadResource,
        updateResource,
        deleteResource,
    };
}
