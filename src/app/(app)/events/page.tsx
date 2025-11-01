
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";

// In a real app, this data would come from a database. For the demo, it's a simple array.
const events = [
    {
        title: "AI & Machine Learning Workshop",
        category: "Workshop",
        date: "2024-08-15",
        time: "10:00 AM - 4:00 PM",
        location: "CS Department, Seminar Hall 1",
        description: "A hands-on workshop covering the fundamentals of AI and ML with practical projects.",
        image: "https://picsum.photos/seed/event1/600/400",
        imageHint: "AI workshop"
    },
    {
        title: "Tech Talk: The Future of Web Dev",
        category: "Tech Talk",
        date: "2024-08-22",
        time: "5:00 PM - 6:00 PM",
        location: "Online via Zoom",
        description: "Join industry expert Jane Doe as she discusses upcoming trends in web development.",
        image: "https://picsum.photos/seed/event2/600/400",
        imageHint: "tech talk"
    },
    {
        title: "Annual Hackathon: CodeWave",
        category: "Hackathon",
        date: "2024-09-01",
        time: "Starts 9:00 AM",
        location: "Main Auditorium",
        description: "The 24-hour coding marathon is back! Build, innovate, and win exciting prizes.",
        image: "https://picsum.photos/seed/event3/600/400",
        imageHint: "hackathon"
    },
]

// This page shows a list of campus events and workshops.
export default function EventsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Events & Workshops</h1>
                <p className="text-muted-foreground">Discover, learn, and participate in campus happenings.</p>
            </div>
            {/* A responsive grid that displays the event cards, adjusting to different screen sizes. */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event, index) => (
                    <Card key={index} className="overflow-hidden flex flex-col">
                        <CardHeader className="p-0 relative h-60 w-full">
                            {/* We use Next.js's optimized Image component for better performance. */}
                            <Image src={event.image} alt={event.title} fill style={{objectFit: 'cover'}} data-ai-hint={event.imageHint} />
                        </CardHeader>
                        <CardContent className="p-6 flex-1">
                            <p className="text-sm font-semibold text-primary mb-1">{event.category.toUpperCase()}</p>
                            <CardTitle className="mb-2">{event.title}</CardTitle>
                            <div className="text-sm text-muted-foreground space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{event.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{event.time}</span>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{event.location}</span>
                                </div>
                            </div>
                            <CardDescription className="mt-4">{event.description}</CardDescription>
                        </CardContent>
                        <CardFooter className="p-6 bg-muted/50">
                            <Button className="w-full">Register Now</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
