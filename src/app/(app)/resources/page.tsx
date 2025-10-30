
'use client';

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Upload, Download, Edit, Trash } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";


type Resource = {
    id: string;
    name: string;
    description: string;
    type: string;
    uploader: string;
    date: string;
    url: string;
};

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
            <DialogContent>
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
            <DialogContent>
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
    
    const handleDownload = (url: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = (title: string, description: string, file: File) => {
        const newResource: Resource = {
            id: `res_${Date.now()}`,
            name: title,
            description: description,
            type: file.type || "File",
            uploader: "Current User",
            date: new Date().toLocaleDateString('en-CA'),
            url: URL.createObjectURL(file),
        };

        setResources(prevResources => [...prevResources, newResource]);

        toast({
            title: "Resource Uploaded",
            description: `"${newResource.name}" has been added to the hub.`,
        });

        setIsUploadDialogOpen(false);
    }

    const handleEditClick = (resource: Resource) => {
        setEditingResource(resource);
        setIsEditDialogOpen(true);
    };

    const handleEdit = (resourceId: string, title: string, description: string) => {
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

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No resources available yet. Be the first to upload!
                                </TableCell>
                            </TableRow>
                        ) : (
                            resources.map((resource) => (
                                <TableRow key={resource.id}>
                                    <TableCell className="font-medium">{resource.name}</TableCell>
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
                                                        <DropdownMenuItem className="text-destructive">
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
                onUpdate={handleEdit}
            />
        </div>
    )
}
