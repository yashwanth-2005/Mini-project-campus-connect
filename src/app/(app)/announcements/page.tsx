
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip } from "lucide-react";
import { useSearchParams } from "next/navigation";

// A mock data array for announcements. In a real app, this would come from a database.
const announcements = [
    {
        author: "Faculty Admin",
        avatar: "https://picsum.photos/seed/faculty1/40/40",
        title: "Mid-term Exam Schedule Released",
        content: "The schedule for the upcoming mid-term examinations has been published. Please check the student portal for your respective timetables. All the best!",
        time: "2 hours ago",
        attachments: [{ name: "Mid-term_Schedule.pdf", type: "pdf" }]
    },
    {
        author: "HOD Computer Science",
        avatar: "https://picsum.photos/seed/hod1/40/40",
        title: "Hackathon 'CodeFest 2024' Registration Open",
        content: "We are excited to announce CodeFest 2024, the annual inter-departmental hackathon. Registrations are now open. Form your teams and get ready to innovate!",
        time: "1 day ago",
        attachments: []
    },
    {
        author: "Placement Cell",
        avatar: "https://picsum.photos/seed/placement/40/40",
        title: "Pre-placement talk by TechCorp",
        content: "TechCorp will be conducting a pre-placement talk for all final year students on Friday, 3 PM at the main auditorium. Attendance is mandatory for interested students.",
        time: "3 days ago",
        attachments: [{ name: "TechCorp_Job_Description.pdf", type: "pdf" }, { name: "Company_Brochure.pdf", type: "pdf" }]
    }
]

export default function AnnouncementsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'student';

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Announcements</h1>
                    <p className="text-muted-foreground">Latest updates from faculty and departments.</p>
                </div>
                {/* Only show the "New Announcement" button to faculty members. */}
                {role === 'faculty' && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>New Announcement</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                            <DialogTitle>Create Announcement</DialogTitle>
                            <DialogDescription>
                                Compose a new announcement. It will be notified to all students.
                            </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                Title
                                </Label>
                                <Input id="title" placeholder="E.g., Exam Schedule" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="content" className="text-right">
                                Content
                                </Label>
                                <Textarea id="content" placeholder="Type your message here." className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="attachments" className="text-right">
                                Attachments
                                </Label>
                                <Input id="attachments" type="file" multiple className="col-span-3"/>
                            </div>
                            </div>
                            <DialogFooter>
                            <Button type="submit">Post Announcement</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            
            {/* Renders a list of announcement cards. */}
            <div className="space-y-6">
                {announcements.map((ann, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={ann.avatar} />
                                    <AvatarFallback>{ann.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{ann.title}</CardTitle>
                                    <CardDescription>
                                        Posted by {ann.author} &bull; {ann.time}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground">{ann.content}</p>
                        </CardContent>
                        {/* Shows attachments if they exist. */}
                        {ann.attachments.length > 0 && (
                            <CardFooter className="flex-col items-start gap-2">
                                <h4 className="text-sm font-semibold">Attachments:</h4>
                                <div className="space-y-2">
                                    {ann.attachments.map((file, i) => (
                                        <Button key={i} variant="outline" size="sm" className="h-auto py-1">
                                            <Paperclip className="h-3 w-3 mr-2" />
                                            {file.name}
                                        </Button>
                                    ))}
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}

    