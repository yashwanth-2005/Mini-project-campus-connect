
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Calendar, MessageSquare, Shield } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getCurrentUser, User } from "@/lib/mock-db";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
        description: "Manage students, content, and approvals.",
        href: "/admin",
        icon: <Shield className="h-6 w-6 text-primary" />,
        role: ['faculty']
    }
];

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'student';
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
    }, [])

    const quickLinks = allQuickLinks.filter(link => link.role.includes(role));
    
    const welcomeMessage = () => {
        if (role === 'faculty') return "Welcome back, Faculty!";
        if (user) return `Welcome back, ${user.fullName.split(' ')[0]}!`;
        return "Welcome back!";
    }

    return (
        <div className="space-y-8">
            <div>
                 <h1 className="text-3xl font-bold font-headline">{welcomeMessage()}</h1>
                <p className="text-muted-foreground">Here&apos;s a quick overview of what&apos;s happening on campus.</p>
            </div>

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

    