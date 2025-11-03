
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Calendar, MessageSquare, Shield } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/firebase";
import React from "react";

// This array defines the quick-access links shown on the dashboard.
const allQuickLinks = [
    {
        title: "Placement Corner",
        description: "Explore roadmaps and interview experiences.",
        href: "/placements",
        icon: <Briefcase className="h-6 w-6 text-primary" />,
        role: ['student', 'faculty']
    },
    {
        title: "Upcoming Events",
        description: "Check out workshops and tech talks.",
        href: "/events",
        icon: <Calendar className="h-6 w-6 text-primary" />,
        role: ['student', 'faculty']
    },
    {
        title: "Discussion Forum",
        description: "Join conversations and ask questions.",
        href: "/forum",
        icon: <MessageSquare className="h-6 w-6 text-primary" />,
        role: ['student', 'faculty']
    },
    {
        title: "Admin Panel",
        description: "Manage campus content and approvals.",
        href: "/admin",
        icon: <Shield className="h-6 w-6 text-primary" />,
        role: ['faculty']
    }
];

// This is the main dashboard, the first page a user sees after logging in.
export default function DashboardPage() {
    const searchParams = useSearchParams();
    const { user } = useUser();
    // We read the user's role from the URL to customize the dashboard.
    const role = searchParams.get('role') || 'student';
    
    // Filter the quick links to show only relevant ones for the current user.
    const quickLinks = allQuickLinks.filter(link => link.role.includes(role));
    
    // Create a personalized welcome message for the logged-in user.
    const welcomeMessage = () => {
        if (role === 'faculty') return "Welcome back, Faculty!";
        if (user) return `Welcome back, ${user.displayName?.split(' ')[0] || 'Student'}!`;
        return "Welcome back!";
    }

    return (
        <div className="space-y-8">
            <div>
                 <h1 className="text-3xl font-bold font-headline">{welcomeMessage()}</h1>
                <p className="text-muted-foreground">Here&apos;s a quick overview of what&apos;s happening on campus.</p>
            </div>

            {/* This grid displays quick-access navigation cards. */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quickLinks.map(link => (
                    <Card key={link.title} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-4">
                                {link.icon}
                                <CardTitle className="text-lg font-semibold">{link.title}</CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`${link.href}?role=${role}`}><ArrowRight className="h-4 w-4" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{link.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* A summary of the most recent campus announcements. */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        <li className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Mid-term Exam Schedule Released</p>
                                <p className="text-sm text-muted-foreground">Posted by Faculty Admin - 2 hours ago</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/announcements?role=${role}`}>View</Link>
                            </Button>
                        </li>
                         <li className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Hackathon 'CodeFest 2024' Registration Open</p>
                                <p className="text-sm text-muted-foreground">Posted by HOD - 1 day ago</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/announcements?role=${role}`}>View</Link>
                            </Button>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
