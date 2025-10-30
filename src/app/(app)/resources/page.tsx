
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
import React from "react";

const resources: { name: string; type: string; uploader: string; date: string; url: string; }[] = [];

export default function ResourcesPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'student';
    
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

    const UploadResourceDialog = () => {
        const dialogContentRef = React.useRef<HTMLDivElement>(null);

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resource
                    </Button>
                </DialogTrigger>
                <DialogContent ref={dialogContentRef} className="p-0">
                     <motion.div
                        drag
                        dragConstraints={{ current: document.body }}
                        dragElastic={0.1}
                        dragListener={false} // We will control drag initiation manually
                        onPointerDown={(e) => {
                            // Allows dragging only from the header
                            const target = e.target as HTMLElement;
                            if (target.closest('[data-drag-handle]')) {
                                // Let the drag event pass through to the motion.div
                            } else {
                                e.stopPropagation();
                            }
                        }}
                        className="w-full"
                    >
                        <div
                            onPointerDown={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.closest('[data-drag-handle]')) {
                                    // This custom event handling is a workaround to make dragging work
                                    // with Radix UI's dialog and its focus trapping.
                                    const startEvent = new PointerEvent('pointerdown', e.nativeEvent);
                                    dialogContentRef.current?.dispatchEvent(startEvent);
                                }
                            }}
                        >
                            <DialogHeader className="p-6 pb-4 cursor-grab" data-drag-handle>
                                <DialogTitle>Upload Resource</DialogTitle>
                                <DialogDescription>
                                    Contribute to the hub by uploading a new resource.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 px-6">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">
                                        Title
                                    </Label>
                                    <Input id="title" placeholder="E.g., DSA Notes" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Description
                                    </Label>
                                    <Input id="description" placeholder="Briefly describe the resource" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="file" className="text-right">
                                        File
                                    </Label>
                                    <Input id="file" type="file" className="col-span-3"/>
                                </div>
                            </div>
                            <DialogFooter className="p-6 pt-4">
                                <Button type="submit">Upload</Button>
                            </DialogFooter>
                        </div>
                    </motion.div>
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
