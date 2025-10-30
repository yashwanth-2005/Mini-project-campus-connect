
'use client';
    
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Mock data for interview experiences. In a real app, this would come from a database.
const interviewExperiences = [
    { company: "TechCorp", role: "Software Engineer Intern", date: "2024-05-15", author: "Alex Doe" },
    { company: "Innovate Inc.", role: "Data Analyst", date: "2024-05-10", author: "Jane Smith" },
    { company: "Future Solutions", role: "Product Manager Intern", date: "2024-04-28", author: "Sam Wilson" },
];

// Mock data for the document repository.
const docRepository = [
    { name: "SDE-Resume-Template.pdf", type: "Resume Template", uploader: "Faculty" },
    { name: "Referral-Links-2024.xlsx", type: "Referral Sheet", uploader: "Alumni" },
    { name: "Data-Structures-Notes.pdf", type: "Notes", uploader: "Senior Student" },
];

// This is the page for all placement-related activities and resources.
export default function PlacementsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'student';
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Placement Corner</h1>
                <p className="text-muted-foreground">All-in-one hub for your placement preparation.</p>
            </div>

            {/* Tabs are used to organize the different sections of the placement corner. */}
            <Tabs defaultValue="roadmaps">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
                    <TabsTrigger value="practice">Practice Portals</TabsTrigger>
                    <TabsTrigger value="experiences">Interview Experiences</TabsTrigger>
                    <TabsTrigger value="repository">Document Repository</TabsTrigger>
                </TabsList>
                <TabsContent value="roadmaps" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Curated Roadmaps</CardTitle>
                            <CardDescription>Step-by-step guides to crack your dream company.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <Card className="hover:border-primary">
                                <CardHeader>
                                    <CardTitle>SDE Placement Roadmap</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">A 3-month plan covering DSA, System Design, and core subjects for software development roles.</p>
                                    <Button variant="link" className="p-0 h-auto mt-4">View Roadmap</Button>
                                </CardContent>
                            </Card>
                            <Card className="hover:border-primary">
                                <CardHeader>
                                    <CardTitle>Data Science Roadmap</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">From Python basics to advanced machine learning models, get ready for data roles.</p>
                                    <Button variant="link" className="p-0 h-auto mt-4">View Roadmap</Button>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="practice" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Practice Portals</CardTitle>
                            <CardDescription>Sharpen your skills on these platforms.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">LeetCode</h3>
                                    <p className="text-sm text-muted-foreground">The gold standard for coding interview preparation.</p>
                                </div>
                                <Button asChild variant="outline">
                                    <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer">Visit <LinkIcon className="ml-2 h-4 w-4"/></a>
                                </Button>
                            </div>
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Internal Quizzes</h3>
                                    <p className="text-sm text-muted-foreground">Test your knowledge with quizzes prepared by faculty.</p>
                                </div>
                                <Button>Take a Quiz</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="experiences" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company-wise Interview Experiences</CardTitle>
                            <CardDescription>Learn from the experiences of your seniors and peers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {interviewExperiences.map(exp => (
                                <div key={exp.company+exp.role} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                    <div>
                                        <h3 className="font-semibold">{exp.company} - {exp.role}</h3>
                                        <p className="text-sm text-muted-foreground">Shared by {exp.author} on {exp.date}</p>
                                    </div>
                                    <Button variant="outline">Read Experience</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="repository" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Document Repository</CardTitle>
                                <CardDescription>Find resume templates, referral links, and more.</CardDescription>
                            </div>
                             {/* Only faculty members are allowed to upload new documents. */}
                             {role === 'faculty' && <Button>Upload Document</Button>}
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {docRepository.map(doc => (
                                <div key={doc.name} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <FileText className="h-6 w-6 text-muted-foreground" />
                                        <div>
                                            <h3 className="font-semibold">{doc.name}</h3>
                                            <p className="text-sm text-muted-foreground">{doc.type} by {doc.uploader}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-5 w-5"/>
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
