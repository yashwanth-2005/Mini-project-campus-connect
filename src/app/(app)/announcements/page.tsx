
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Loader2, PenSquare } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAnnouncements } from '@/hooks/use-announcements';
import { motion } from 'framer-motion';

// A dialog component for creating new announcements.
const NewAnnouncementDialog = () => {
    const { addAnnouncement } = useAnnouncements();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePost = async () => {
        if (!title.trim() || !content.trim()) {
            toast({ title: "Incomplete Announcement", description: "Please provide a title and content.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            await addAnnouncement(title, content);
            toast({ title: "Announcement Posted!", description: "Your announcement is now live for all users." });
            setIsDialogOpen(false);
            setTitle('');
            setContent('');
        } catch (error: any) {
            toast({ title: "Post Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PenSquare className="mr-2 h-4 w-4" />
                    New Announcement
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                    <DialogDescription>
                        Compose a new announcement. It will appear in real-time for all users.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" placeholder="E.g., Exam Schedule" className="col-span-3" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="content" className="text-right">Content</Label>
                        <Textarea id="content" placeholder="Type your message here." className="col-span-3" value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
                    </div>
                    {/* Attachment functionality can be added later */}
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handlePost} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Posting...' : 'Post Announcement'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// This page shows campus announcements, now powered by a real-time hook.
export default function AnnouncementsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'student';
    const { announcements, isLoading } = useAnnouncements();

    // Formats a Firestore timestamp into a readable string (e.g., "2 hours ago").
    const formatDate = (timestamp: any) => {
        if (!timestamp) return "Just now";
        if (timestamp.toDate) {
            const date = timestamp.toDate();
            const now = new Date();
            const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
            const diffInMinutes = diffInSeconds / 60;
            const diffInHours = diffInMinutes / 60;
            const diffInDays = diffInHours / 24;

            if (diffInSeconds < 60) return "Just now";
            if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
            if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
            if (diffInDays < 7) return `${Math.floor(diffInDays)}d ago`;
            return date.toLocaleDateString();
        }
        return new Date(timestamp).toLocaleDateString();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Announcements</h1>
                    <p className="text-muted-foreground">Latest updates from faculty and departments, live.</p>
                </div>
                {/* The "New Announcement" button is only shown to faculty. */}
                {role === 'faculty' && <NewAnnouncementDialog />}
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p>No announcements yet.</p>
                    <p className="text-sm">Check back later for updates.</p>
                </div>
            ) : (
                 <div className="space-y-6">
                    {announcements.map((ann, index) => (
                        <motion.div
                            key={ann.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            layout
                        >
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={ann.authorImage} />
                                            <AvatarFallback>{ann.authorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle>{ann.title}</CardTitle>
                                            <CardDescription>
                                                Posted by {ann.authorName} &bull; {formatDate(ann.createdAt)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{ann.content}</p>
                                </CardContent>
                                {/* Only show attachments if they exist. */}
                                {ann.attachmentUrls && ann.attachmentUrls.length > 0 && (
                                    <CardFooter className="flex-col items-start gap-2">
                                        <h4 className="text-sm font-semibold">Attachments:</h4>
                                        <div className="space-y-2">
                                            {ann.attachmentUrls.map((file, i) => (
                                                <Button key={i} variant="outline" size="sm" className="h-auto py-1" asChild>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                        <Paperclip className="mr-2 h-3 w-3" />
                                                        {file.name}
                                                    </a>
                                                </Button>
                                            ))}
                                        </div>
                                    </CardFooter>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
