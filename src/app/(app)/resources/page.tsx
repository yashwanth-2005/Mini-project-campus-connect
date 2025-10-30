
'use client';

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Upload, Download, Edit, Trash, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type Resource = {
    id: string;
    name: string;
    description: string;
    type: string;
    uploader: string;
    date: string;
    url: string; // This will now be a Base64 dataURL
};

const initialResources: Resource[] = [
    { id: 'res_1', name: "Data Structures & Algorithms Notes", description: "Comprehensive notes on core DSA concepts.", type: "PDF", uploader: "Jane Smith", date: "2024-05-20", url: "" },
    { id: 'res_2', name: "Operating Systems PYQs", description: "Previous year questions for OS.", type: "PDF", uploader: "Admin", date: "2024-05-18", url: "" },
    { id: 'res_3', name: "Database Management Systems Slides", description: "Lecture slides for DBMS.", type: "PPTX", uploader: "Prof. Davis", date: "2024-05-15", url: "" },
];


const UploadResourceDialog = ({
    isOpen,
    onOpenChange,
    onUpload,
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onUpload: (title: string, description: string, file: File) => void;
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
        // Reset state after upload
        setUploadTitle("");
        setUploadDescription("");
        setUploadFile(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" style={{top: '30%', left: '40%'}}>
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
                    <Button type="submit" onClick={handleUploadClick}>Upload</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const EditResourceDialog = ({
    resource,
    isOpen,
    onOpenChange,
    onUpdate,
} : {
    resource: Resource | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onUpdate: (resourceId: string, title: string, description: string) => void;
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
            <DialogContent className="sm:max-w-[425px]" style={{top: '30%', left: '40%'}}>
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
                    <Button type="submit" onClick={handleUpdateClick}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ResourcesPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const role = searchParams.get('role') || 'student';
    const [resources, setResources] = useState<Resource[]>([]);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Load resources from localStorage on initial render, or use initialResources
    useEffect(() => {
        try {
            const storedResources = localStorage.getItem('resources');
            if (storedResources) {
                setResources(JSON.parse(storedResources));
            } else {
                setResources(initialResources);
            }
        } catch (error) {
            console.error("Failed to load resources from localStorage", error);
            setResources(initialResources);
        }
    }, []);

    // Save resources to localStorage whenever they change
    useEffect(() => {
        try {
            // Do not save the initial empty state
            if (resources.length > 0) {
              localStorage.setItem('resources', JSON.stringify(resources));
            }
        } catch (error) {
            console.error("Failed to save resources to localStorage", error);
        }
    }, [resources]);


    const handleDownload = (url: string, fileName: string) => {
        if (!url) {
            toast({
                title: "Download Unavailable",
                description: "This is a default resource and does not have a file to download.",
                variant: "destructive"
            });
            return;
        }
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = (title: string, description: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const newResource: Resource = {
                id: `res_${Date.now()}`,
                name: title,
                description: description,
                type: file.type || "File",
                uploader: "Current User", // In a real app, this would be the logged-in user's name
                date: new Date().toLocaleDateString('en-CA'),
                url: reader.result as string, // This is the Base64 dataURL
            };
    
            setResources(prevResources => [...prevResources, newResource]);
    
            toast({
                title: "Resource Uploaded",
                description: `"${newResource.name}" has been added to the hub.`,
            });
    
            setIsUploadDialogOpen(false);
        };
        reader.readAsDataURL(file);
    }

    const handleEditClick = (resource: Resource) => {
        setEditingResource(resource);
        setIsEditDialogOpen(true);
    };

    const handleUpdate = (resourceId: string, title: string, description: string) => {
        setResources(prevResources => 
            prevResources.map(res => 
                res.id === resourceId ? { ...res, name: title, description: description } : res
            )
        );
        toast({
            title: "Resource Updated",
            description: "The resource details have been saved.",
        });
        setIsEditDialogOpen(false);
        setEditingResource(null);
    }

    const handleDeleteClick = (resourceId: string) => {
        setDeletingResourceId(resourceId);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!deletingResourceId) return;

        const resourceToDelete = resources.find(res => res.id === deletingResourceId);
        
        setResources(prevResources => prevResources.filter(res => res.id !== deletingResourceId));
        
        toast({
            title: "Resource Deleted",
            description: `"${resourceToDelete?.name}" has been removed.`,
            variant: "destructive"
        });

        setIsDeleteDialogOpen(false);
        setDeletingResourceId(null);
    };

    const filteredResources = resources.filter(resource => 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Resource Hub</h1>
                    <p className="text-muted-foreground">Central repository for notes, papers, and other materials.</p>
                </div>
                <UploadResourceDialog 
                    isOpen={isUploadDialogOpen}
                    onOpenChange={setIsUploadDialogOpen}
                    onUpload={handleUpload}
                />
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
                        {filteredResources.length === 0 ? (
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
                                    <TableCell>{resource.type}</TableCell>
                                    <TableCell>{resource.uploader}</TableCell>
                                    <TableCell>{resource.date}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleDownload(resource.url, resource.name)}>
                                                    <Download className="mr-2 h-4 w-4"/>
                                                    Download
                                                </DropdownMenuItem>
                                                {(role === 'faculty' || resource.uploader === 'Current User') && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleEditClick(resource)}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-destructive"
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
            />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        resource from our servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
