
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, PenSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Defines the data structure for a single discussion post.
type Discussion = {
    id: number;
    title: string;
    content?: string;
    author: string;
    avatar: string;
    time: string;
    replies: number;
    upvotes: number;
    tags: string[];
};

// Initial mock data for the forum.
const initialDiscussions: Discussion[] = [
    {
        id: 1,
        title: "How to prepare for FAANG interviews in 6 months?",
        author: "Alex Johnson",
        avatar: "https://picsum.photos/seed/user1/40/40",
        time: "3 hours ago",
        replies: 12,
        upvotes: 45,
        tags: ["placements", "interviews", "career"]
    },
    {
        id: 2,
        title: "Best resources for learning System Design?",
        author: "Samantha Lee",
        avatar: "https://picsum.photos/seed/user2/40/40",
        time: "1 day ago",
        replies: 8,
        upvotes: 62,
        tags: ["sde", "system-design", "resources"]
    },
    {
        id: 3,
        title: "Review of the new Web Development elective",
        author: "Michael Chen",
        avatar: "https://picsum.photos/seed/user3/40/40",
        time: "2 days ago",
        replies: 5,
        upvotes: 21,
        tags: ["academics", "courses", "review"]
    }
];

// This is the main page for the discussion forum.
export default function ForumPage() {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
    const [newDiscussionContent, setNewDiscussionContent] = useState('');
    const { toast } = useToast();

    // Loads discussions from localStorage on the first render (client-side only).
    // If none exist, it uses the initial mock data.
    useEffect(() => {
        try {
            const storedDiscussions = localStorage.getItem('discussions');
            if (storedDiscussions) {
                setDiscussions(JSON.parse(storedDiscussions));
            } else {
                setDiscussions(initialDiscussions);
            }
        } catch (error) {
            console.error("Failed to load discussions from localStorage", error);
            setDiscussions(initialDiscussions);
        }
    }, []);

    // Saves discussions to localStorage whenever the `discussions` state changes.
    // This makes new posts persist across page reloads.
    useEffect(() => {
        try {
            // We only save to localStorage if the discussions have been initialized and changed from the initial state
            if (discussions.length > 0 && discussions !== initialDiscussions) {
                 localStorage.setItem('discussions', JSON.stringify(discussions));
            }
        } catch (error) {
            console.error("Failed to save discussions to localStorage", error);
        }
    }, [discussions]);


    // Handles the creation of a new discussion post.
    const handleStartDiscussion = () => {
        if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) {
            toast({
                title: "Incomplete Discussion",
                description: "Please provide both a title and content for your post.",
                variant: "destructive",
            });
            return;
        }

        const newDiscussion: Discussion = {
            id: Date.now(),
            title: newDiscussionTitle,
            content: newDiscussionContent,
            author: "Demo User", // In a real app, this would come from the logged-in user.
            avatar: "https://picsum.photos/seed/user-avatar/40/40",
            time: "Just now",
            replies: 0,
            upvotes: 0,
            tags: ["new"],
        };

        // Adds the new discussion to the top of the list for immediate visibility.
        setDiscussions(prevDiscussions => [newDiscussion, ...prevDiscussions]);
        
        // Resets the form fields and closes the dialog.
        setNewDiscussionTitle('');
        setNewDiscussionContent('');
        setIsDialogOpen(false);

        toast({
            title: "Discussion Started!",
            description: "Your post has been added to the forum.",
        });
    };

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
                            <Button onClick={handleStartDiscussion}>Post Discussion</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            {/* A quick-post input field for convenience. */}
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <Input placeholder="What's on your mind?" className="h-12" />
            </div>

            {/* Renders the list of discussion cards. */}
            <div className="space-y-4">
                {discussions.map(d => (
                    <Card key={d.id} className="hover:border-primary cursor-pointer transition-colors">
                        <CardContent className="p-6 flex items-start gap-6">
                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                <Button variant="ghost" size="sm" className="flex flex-col h-auto p-1">
                                    <ThumbsUp className="h-5 w-5"/>
                                    <span className="text-xs font-bold">{d.upvotes}</span>
                                </Button>
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-lg mb-2">{d.title}</CardTitle>
                                <div className="text-sm text-muted-foreground flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={d.avatar} />
                                            <AvatarFallback>{d.author.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{d.author}</span>
                                    </div>
                                    <span>&bull;</span>
                                    <span>{d.time}</span>
                                    <span>&bull;</span>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{d.replies} replies</span>
                                    </div>
                                </div>
                                {d.content && <p className="text-sm text-foreground mt-3">{d.content}</p>}
                                <div className="mt-4 flex gap-2">
                                    {d.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
