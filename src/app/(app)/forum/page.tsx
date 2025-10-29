import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, PenSquare } from "lucide-react";

const discussions = [
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
]

export default function ForumPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Discussion Forum</h1>
                    <p className="text-muted-foreground">Connect with peers, seniors, and faculty.</p>
                </div>
                <Button>
                    <PenSquare className="mr-2 h-4 w-4" />
                    Start a Discussion
                </Button>
            </div>
            
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <Input placeholder="What's on your mind?" className="h-12" />
            </div>

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
                                <div className="text-sm text-muted-foreground flex items-center gap-4">
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
