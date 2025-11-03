
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, PenSquare, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useForum, type ForumPost } from '@/hooks/use-forum';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// This is the main page for the discussion forum.
export default function ForumPage() {
    const { user } = useUser();
    // Our custom `useForum` hook handles all logic for posts.
    // It's built with onSnapshot, so it's already real-time.
    const { posts, isLoading, addPost, toggleUpvote } = useForum();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
    const [newDiscussionContent, setNewDiscussionContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Handles creating a new discussion post.
    const handleStartDiscussion = async () => {
        if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) {
            toast({
                title: "Incomplete Discussion",
                description: "Please provide both a title and content.",
                variant: "destructive",
            });
            return;
        }

        if (!user) {
             toast({
                title: "Not Logged In",
                description: "You must be logged in to start a discussion.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Call the `addPost` function from our custom hook.
            await addPost(newDiscussionTitle, newDiscussionContent);
            
            // Clear the form and close the dialog on success.
            setNewDiscussionTitle('');
            setNewDiscussionContent('');
            setIsDialogOpen(false);

            toast({
                title: "Discussion Started!",
                description: "Your post has been added to the forum.",
            });
        } catch (error: any) {
            toast({
                title: "Submission Failed",
                description: error.message || "Could not add your post. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handles the upvoting logic for a post.
    const handleUpvote = (postId: string) => {
        if (!user) {
            toast({ title: "Please log in to upvote", variant: "destructive" });
            return;
        }
        // Call the `toggleUpvote` function from our custom hook.
        toggleUpvote(postId);
    }
    
    // Formats a database timestamp into a readable date string.
    const formatDate = (timestamp: any) => {
        if (!timestamp) return "Just now";
        // Firestore timestamps have a `toDate()` method.
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
                    <h1 className="text-3xl font-bold font-headline">Discussion Forum</h1>
                    <p className="text-muted-foreground">Connect with peers, seniors, and faculty in real-time.</p>
                </div>
                {/* This dialog box lets users create a new post. */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PenSquare className="mr-2 h-4 w-4" />
                            Start a Discussion
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Start a New Discussion</DialogTitle>
                            <DialogDescription>
                                Share your thoughts and engage with the community. Your post will appear instantly for all users.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="discussion-title">Title</Label>
                                <Input 
                                    id="discussion-title" 
                                    placeholder="What's the main topic?" 
                                    value={newDiscussionTitle}
                                    onChange={(e) => setNewDiscussionTitle(e.target.value)} 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="discussion-content">Content</Label>
                                <Textarea 
                                    id="discussion-content" 
                                    placeholder="Elaborate on your topic..."
                                    value={newDiscussionContent}
                                    onChange={(e) => setNewDiscussionContent(e.target.value)}
                                    rows={5}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleStartDiscussion} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Posting..." : "Post Discussion"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            {/* A convenience input field that opens the dialog when clicked. */}
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={user?.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${user?.uid}`} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Input placeholder="What's on your mind? Start a new discussion..." className="h-12 cursor-pointer" onClick={() => setIsDialogOpen(true)} readOnly/>
            </div>

            {/* This section renders the list of discussion posts. */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {posts?.map((d, index) => {
                        // Check if the current user has already upvoted this post.
                        const isUpvoted = user && d.upvoteUserIds?.includes(user.uid);
                        return (
                            <motion.div
                                key={d.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                layout
                            >
                                <Card className="hover:border-primary/80 transition-colors duration-300">
                                    <CardContent className="p-6 flex items-start gap-6">
                                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className={cn("flex flex-col h-auto p-1 transition-colors", isUpvoted && "text-primary")}
                                                onClick={() => handleUpvote(d.id)}
                                            >
                                                <ThumbsUp className={cn("h-5 w-5 transition-transform", isUpvoted && "fill-current scale-110")}/>
                                                <span className="text-xs font-bold">{d.upvoteUserIds?.length || 0}</span>
                                            </Button>
                                        </div>
                                        <div className="flex-1 cursor-pointer">
                                            <CardTitle className="text-lg mb-2">{d.title}</CardTitle>
                                            <div className="text-sm text-muted-foreground flex items-center gap-4 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={d.authorImage} />
                                                        <AvatarFallback>{d.authorName?.charAt(0) || 'A'}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{d.authorName}</span>
                                                </div>
                                                <span>&bull;</span>
                                                <span>{formatDate(d.createdAt)}</span>
                                                <span>&bull;</span>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="h-4 w-4" />
                                                    {/* Reply count can be a future feature. */}
                                                    <span>0 replies</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground mt-3 line-clamp-2">{d.content}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
