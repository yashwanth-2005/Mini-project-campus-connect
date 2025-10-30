
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

type Resource = {
    name: string;
    type: string;
    uploader: string;
    date: string;
    url: string;
};

export default function ResourcesPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const role = searchParams.get('role') || 'student';
    const [resources, setResources] = useState<Resource[]>([]);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadDescription, setUploadDescription] = useState("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    
    // This function simulates downloading a file.
    const handleDownload = (url: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = url;
        // In a real app, the backend would provide a proper download name.
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = () => {
        if (!uploadTitle || !uploadFile) {
            toast({
                title: "Upload Failed",
                description: "Please provide a title and select a file.",
                variant: "destructive",
            });
            return;
        }

        const newResource: Resource = {
            name: uploadTitle,
            type: uploadFile.type || "File",
            uploader: "Current User", // In a real app, this would be the logged-in user's name
            date: new Date().toLocaleDateString('en-CA'),
            url: URL.createObjectURL(uploadFile), // Create a temporary local URL for the file
        };

        setResources(prevResources => [...prevResources, newResource]);

        toast({
            title: "Resource Uploaded",
            description: `"${newResource.name}" has been added to the hub.`,
        });

        // Reset form and close dialog
        setIsUploadDialogOpen(false);
        setUploadTitle("");
        setUploadDescription("");
        setUploadFile(null);
    }


    const UploadResourceDialog = () => {
        return (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
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
                            <Input id="description" placeholder="Briefly describe the resource" className="col-span-3" value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file" className="text-right">
                                File
                            </Label>
                            <Input id="file" type="file" className="col-span-3" onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleUpload}>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Resource Hub</h1>
                    <p className="text-muted-foreground">Central repository for notes, papers, and other materials.</p>
                </div>
                <UploadResourceDialog />
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
                                <TableRow key={resource.name}>
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
                                                        <DropdownMenuItem>
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
        </div>
    )
}
