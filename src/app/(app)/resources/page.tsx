
'use client';

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Upload, Download, Edit, Trash } from "lucide-react";
import { useSearchParams } from "next/navigation";

const resources = [
  { name: "Data Structures & Algorithms Notes", type: "PDF", uploader: "Jane Smith", date: "2024-05-20" },
  { name: "Operating Systems PYQs", type: "PDF", uploader: "Admin", date: "2024-05-18" },
  { name: "Database Management Systems Slides", type: "PPTX", uploader: "Prof. Davis", date: "2024-05-15" },
  { name: "SDE Internship Resume Template", type: "DOCX", uploader: "Alumni Cell", date: "2024-05-12" },
  { name: "Project-Based Learning Videos", type: "Video Link", uploader: "John Doe", date: "2024-05-10" },
];

export default function ResourcesPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'student';

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Resource Hub</h1>
                    <p className="text-muted-foreground">Central repository for notes, papers, and other materials.</p>
                </div>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resource
                </Button>
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
                        {resources.map((resource) => (
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
                                            <DropdownMenuItem>
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
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

    