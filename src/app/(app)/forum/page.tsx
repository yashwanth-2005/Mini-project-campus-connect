
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

// This is the main page for the discussion forum.
export default function ForumPage() {
    const { user } = useUser();
    const { posts, isLoading, addPost, toggleUpvote } = useForum();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
    const [newDiscussionContent, setNewDiscussionContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Handles the creation of a new discussion post.
    const handleStartDiscussion = async () => {
        if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) {
            toast({
                title: "Incomplete Discussion",
                description: "Please provide both a title and content for your post.",
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
            await addPost(newDiscussionTitle, newDiscussionContent);
            
            // Resets the form fields and closes the dialog.
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
    
    const handleUpvote = (postId: string) => {
        if (!user) {
            toast({ title: "Please log in to upvote", variant: "destructive" });
            return;
        }
        toggleUpvote(postId);
    }
    
    // Formats a Firestore timestamp or date string into a readable date.
    const formatDate = (timestamp: any) => {
        if (!timestamp) return "Just now";
        // Firestore timestamps have a toDate() method.
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleDateString();
        }
        // Handle ISO string dates from mock DB.
        return new Date(timestamp).toLocaleDateString();
    }


    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Discussion Forum</h1>
                    <p className="text-muted-foreground">Connect with peers, seniors, and faculty.</p>
                </div>
                {/* This dialog allows users to create a new discussion post. */}
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
                                Share your thoughts and engage with the community.
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
            
            {/* A quick-post input field for convenience. */}
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={user?.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${user?.uid}`} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Input placeholder="What's on your mind?" className="h-12" onClick={() => setIsDialogOpen(true)} readOnly/>
            </div>

            {/* Renders the list of discussion cards. */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {posts?.map(d => {
                        const isUpvoted = user && d.upvoteUserIds?.includes(user.uid);
                        return (
                            <Card key={d.id} className="hover:border-primary transition-colors">
                                <CardContent className="p-6 flex items-start gap-6">
                                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className={cn("flex flex-col h-auto p-1", isUpvoted && "text-primary")}
                                            onClick={() => handleUpvote(d.id)}
                                        >
                                            <ThumbsUp className={cn("h-5 w-5", isUpvoted && "fill-current")}/>
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
                                                {/* Reply count can be added later as a feature */}
                                                <span>0 replies</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground mt-3 line-clamp-2">{d.content}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
