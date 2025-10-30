'use client';

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Upload, Download, Edit, Trash, Search, Eye, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// The type definition for a resource object.
type Resource = {
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

// A dialog component for uploading a new resource.
const UploadResourceDialog = ({
    isOpen,
    onOpenChange,
    onUpload,
    isUploading
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onUpload: (title: string, description: string, file: File) => void;
    isUploading: boolean;
}) => {
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadDescription, setUploadDescription] = useState("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleUploadClick = () => {
        if (!uploadTitle || !uploadFile) {
            toast({
                title: "Upload Failed",
                description: "Please provide a title and select a file.",
                variant: "destructive",
            });
            return;
        }
        onUpload(uploadTitle, uploadDescription, uploadFile);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!isUploading) onOpenChange(open);
        }}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Resource</DialogTitle>
                    <DialogDescription>
                        Contribute to the hub by uploading a new resource.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input id="title" placeholder="E.g., DSA Notes" className="col-span-3" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Textarea id="description" placeholder="Briefly describe the resource" className="col-span-3" value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">
                            File
                        </Label>
                        <Input id="file" type="file" className="col-span-3" onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleUploadClick} disabled={isUploading}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// A dialog component for editing an existing resource's details.
const EditResourceDialog = ({
    resource,
    isOpen,
    onOpenChange,
    onUpdate,
    isUpdating,
} : {
    resource: Resource | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onUpdate: (resourceId: string, title: string, description: string) => void;
    isUpdating: boolean;
}) => {
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const { toast } = useToast();

    React.useEffect(() => {
        if(resource) {
            setEditTitle(resource.name);
            setEditDescription(resource.description);
        }
    }, [resource]);

    const handleUpdateClick = () => {
        if(!resource) return;
        if (!editTitle) {
            toast({
                title: "Update Failed",
                description: "Title cannot be empty.",
                variant: "destructive",
            });
            return;
        }
        onUpdate(resource.id, editTitle, editDescription);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Resource</DialogTitle>
                    <DialogDescription>
                        Update the details for this resource.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-title" className="text-right">
                            Title
                        </Label>
                        <Input id="edit-title" className="col-span-3" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-description" className="text-right">
                            Description
                        </Label>
                        <Textarea id="edit-description" className="col-span-3" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleUpdateClick} disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ResourcesPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user } = useUser();
    const role = searchParams.get('role') || 'student';
    
    const firestore = useFirestore();
    const storage = getStorage();

    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Get a real-time stream of resources from Firestore.
    const resourcesCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'resources') : null, [firestore]);
    const { data: resources, isLoading: isLoadingResources } = useCollection<Resource>(resourcesCollectionRef);

    // Opens a file's URL in a new browser tab.
    const handleView = (url: string) => {
        window.open(url, '_blank');
    };

    // Downloads a file from a given URL.
    const handleDownload = (url: string, fileName: string) => {
        fetch(url).then(response => response.blob()).then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    // Uploads a file to Firebase Storage and creates its metadata in Firestore.
    const handleUpload = async (title: string, description: string, file: File) => {
        if (!user || !firestore) return;
        setIsUploading(true);

        const storagePath = `resources/${user.uid}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);

        try {
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

            toast({
                title: "Resource Uploaded",
                description: `'${title}' has been added to the hub.`,
            });
            setIsUploadDialogOpen(false);
        } catch (error: any) {
            toast({
                title: "Upload Failed",
                description: error.message || "Could not upload the file. Check storage rules.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    }

    // Opens the edit dialog for a specific resource.
    const handleEditClick = (resource: Resource) => {
        setEditingResource(resource);
        setIsEditDialogOpen(true);
    };

    // Updates a resource's metadata in Firestore.
    const handleUpdate = async (resourceId: string, title: string, description: string) => {
        if (!firestore) return;
        setIsUpdating(true);
        const resourceDocRef = doc(firestore, 'resources', resourceId);
        try {
            await updateDoc(resourceDocRef, { name: title, description: description });
            toast({
                title: "Resource Updated",
                description: "The resource details have been saved.",
            });
            setIsEditDialogOpen(false);
            setEditingResource(null);
        } catch (error: any) {
             toast({
                title: "Update Failed",
                description: error.message || "Could not update the resource.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    }

    // Opens the delete confirmation dialog.
    const handleDeleteClick = (resourceId: string) => {
        setDeletingResourceId(resourceId);
        setIsDeleteDialogOpen(true);
    };

    // Permanently deletes a resource from Storage and Firestore.
    const handleConfirmDelete = async () => {
        if (!deletingResourceId || !firestore || !resources) return;

        const resourceToDelete = resources.find(res => res.id === deletingResourceId);
        if (!resourceToDelete) return;

        const resourceDocRef = doc(firestore, 'resources', deletingResourceId);
        const fileRef = ref(storage, resourceToDelete.storagePath);

        try {
            // First, delete the file from Cloud Storage.
            await deleteObject(fileRef);
            // Then, delete the metadata from Firestore.
            await deleteDoc(resourceDocRef);

            toast({
                title: "Resource Deleted",
                description: `'${resourceToDelete?.name}' has been removed.`,
                variant: "destructive"
            });
        } catch (error: any) {
            toast({
                title: "Deletion Failed",
                description: error.message || "Could not delete the resource.",
                variant: "destructive",
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setDeletingResourceId(null);
        }
    };

    // Filters the resources based on the user's search query.
    const filteredResources = resources?.filter(resource => 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // A helper function to format Firestore timestamps into a readable date.
    const formatDate = (timestamp: any) => {
        if (timestamp && timestamp.toDate) {
            return timestamp.toDate().toLocaleDateString();
        }
        return "Just now";
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Resource Hub</h1>
                    <p className="text-muted-foreground">Central repository for notes, papers, and other materials.</p>
                </div>
                {user && <UploadResourceDialog 
                    isOpen={isUploadDialogOpen}
                    onOpenChange={setIsUploadDialogOpen}
                    onUpload={handleUpload}
                    isUploading={isUploading}
                />}
            </div>
            
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search resources..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingResources ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : filteredResources.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    {searchQuery ? "No resources found matching your search." : "No resources available yet. Be the first to upload!"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredResources.map((resource) => (
                                <TableRow key={resource.id}>
                                    <TableCell className="font-medium">{resource.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{resource.description}</TableCell>
                                    <TableCell>{resource.fileType}</TableCell>
                                    <TableCell>{resource.uploaderName}</TableCell>
                                    <TableCell>{formatDate(resource.uploadDate)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleView(resource.fileUrl)}>
                                                    <Eye className="mr-2 h-4 w-4"/>
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDownload(resource.fileUrl, resource.name)}>
                                                    <Download className="mr-2 h-4 w-4"/>
                                                    Download
                                                </DropdownMenuItem>
                                                {(role === 'faculty' || resource.uploaderId === user?.uid) && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleEditClick(resource)}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDeleteClick(resource.id)}
                                                        >
                                                            <Trash className="mr-2 h-4 w-4"/>
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
             <EditResourceDialog 
                resource={editingResource}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onUpdate={handleUpdate}
                isUpdating={isUpdating}
            />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        resource from the cloud.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
