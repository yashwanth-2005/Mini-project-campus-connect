
'use client';
    
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, Download, Upload, MoreHorizontal, Eye, Edit, Trash, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useResources, type Resource } from "@/hooks/use-resources";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generatePlacementQuiz, type PlacementQuiz } from "@/ai/flows/generate-placement-quiz";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";


// This is the page for all placement-related activities.
export default function PlacementsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'student';
    
    // We can reuse the resource management logic, but point it to a new collection
    const {
        resources: documents,
        isLoading: isLoadingDocs,
        uploadResource: uploadDocument,
        updateResource: updateDocument,
        deleteResource: deleteDocument
    } = useResources('placement_documents'); // Specify collection here

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Placement Corner</h1>
                <p className="text-muted-foreground">All-in-one hub for your placement preparation, powered by AI and live data.</p>
            </div>

            {/* We use tabs to organize different sections. */}
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
                            <CardDescription>Step-by-step guides from industry experts to crack your dream company.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <Card className="hover:border-primary">
                                <CardHeader>
                                    <CardTitle>Software Developer Roadmap</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">A 3-month plan covering DSA, System Design, and core subjects for software development roles.</p>
                                    <Button variant="link" className="p-0 h-auto mt-4" asChild>
                                        <a href="https://roadmap.sh/backend" target="_blank" rel="noopener noreferrer">View Roadmap <LinkIcon className="ml-2 h-4 w-4"/></a>
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="hover:border-primary">
                                <CardHeader>
                                    <CardTitle>Data Science Roadmap</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">From Python basics to advanced machine learning models, get ready for data roles.</p>
                                     <Button variant="link" className="p-0 h-auto mt-4" asChild>
                                        <a href="https://roadmap.sh/data-scientist" target="_blank" rel="noopener noreferrer">View Roadmap <LinkIcon className="ml-2 h-4 w-4"/></a>
                                    </Button>
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
                                    <h3 className="font-semibold">AI Aptitude Quiz</h3>
                                    <p className="text-sm text-muted-foreground">Test your knowledge with an AI-generated quiz on the latest tech trends.</p>
                                </div>
                                <AIQuizDialog />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="experiences" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Coming Soon: Interview Experiences</CardTitle>
                            <CardDescription>A space to share and learn from the interview experiences of your seniors and peers.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center py-12 text-muted-foreground">
                            <p>This feature is under construction.</p>
                            <p className="text-sm">Check back soon to read and share real interview stories!</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="repository" className="mt-6">
                    <DocumentRepository
                        role={role}
                        documents={documents}
                        isLoading={isLoadingDocs}
                        uploadDocument={uploadDocument}
                        updateDocument={updateDocument}
                        deleteDocument={deleteDocument}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

// AI Quiz Dialog Component
const AIQuizDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [quiz, setQuiz] = useState<PlacementQuiz | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [answers, setAnswers] = useState<{[key: number]: string}>({});
    const [score, setScore] = useState<number | null>(null);
    const { toast } = useToast();

    const handleGenerateQuiz = async () => {
        setIsLoading(true);
        setQuiz(null);
        setScore(null);
        setAnswers({});
        try {
            const result = await generatePlacementQuiz();
            setQuiz(result);
        } catch (error) {
            console.error("Failed to generate quiz", error);
            toast({ title: "Quiz Generation Failed", description: "Couldn't generate a quiz. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmitQuiz = () => {
        if (!quiz) return;
        let correctAnswers = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        toast({
            title: "Quiz Submitted!",
            description: `You scored ${correctAnswers} out of ${quiz.questions.length}.`
        });
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Take an AI Quiz</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>AI-Powered Placement Quiz</DialogTitle>
                    <DialogDescription>
                        Test your aptitude with a quiz generated on the latest placement trends.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-6 -mr-6">
                    {isLoading && (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="ml-4">Generating your quiz...</p>
                        </div>
                    )}
                    {quiz && !isLoading && (
                        <div className="space-y-6 my-4">
                            {quiz.questions.map((q, qIndex) => (
                                <Card key={qIndex}>
                                    <CardHeader>
                                        <CardTitle className="text-base">{qIndex + 1}. {q.question}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <RadioGroup
                                            onValueChange={(value) => setAnswers(prev => ({...prev, [qIndex]: value}))}
                                            disabled={score !== null}
                                        >
                                            {q.options.map((option, oIndex) => (
                                                 <div key={oIndex} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={option} id={`q${qIndex}o${oIndex}`} />
                                                    <Label
                                                        htmlFor={`q${qIndex}o${oIndex}`}
                                                        className={`flex-1 ${score !== null && option === q.correctAnswer ? 'text-green-500' : ''} ${score !== null && answers[qIndex] === option && option !== q.correctAnswer ? 'text-red-500' : ''}`}
                                                    >
                                                        {option}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                    {score !== null && quiz && (
                         <div className="mt-6 text-center">
                            <h3 className="text-xl font-bold">Your Score: {score} / {quiz.questions.length}</h3>
                        </div>
                    )}
                </ScrollArea>
                 <DialogFooter>
                    {quiz && !isLoading ? (
                        score === null ? (
                            <Button onClick={handleSubmitQuiz}>Submit Quiz</Button>
                        ) : (
                            <Button onClick={handleGenerateQuiz}>Try a New Quiz</Button>
                        )
                    ) : (
                        <Button onClick={handleGenerateQuiz} disabled={isLoading}>
                            {isLoading ? "Generating..." : "Generate New Quiz"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Document Repository Component
const DocumentRepository = ({ role, documents, isLoading, uploadDocument, updateDocument, deleteDocument }: any) => {
    const { user } = useUser();
    const { toast } = useToast();
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (title: string, description: string, file: File) => {
        if (!user) return;
        setIsUploading(true);
        try {
            await uploadDocument(title, description, file);
            toast({
                title: "Document Uploaded",
                description: `'${title}' has been added to the repository.`,
            });
            setIsUploadDialogOpen(false);
        } catch (error: any) {
            toast({
                title: "Upload Failed",
                description: error.message || "Could not upload the file.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleDownload = (url: string, fileName: string) => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            })
            .catch(() => toast({ title: "Download Failed", variant: "destructive" }));
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Document Repository</CardTitle>
                    <CardDescription>Find resume templates, referral links, and more.</CardDescription>
                </div>
                {role === 'faculty' && (
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
                        </DialogTrigger>
                         <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Upload Document</DialogTitle>
                                <DialogDescription>
                                    Contribute to the placement repository by uploading a new document.
                                </DialogDescription>
                            </DialogHeader>
                             <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">Title</Label>
                                    <Input id="title" placeholder="E.g., Resume Template" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">Description</Label>
                                    <Textarea id="description" placeholder="Briefly describe the document" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="file" className="text-right">File</Label>
                                    <Input id="file" type="file" className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    onClick={() => {
                                        const title = (document.getElementById('title') as HTMLInputElement).value;
                                        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
                                        const file = (document.getElementById('file') as HTMLInputElement).files?.[0];
                                        if (file) handleUpload(title, description, file);
                                    }}
                                    disabled={isUploading}
                                >
                                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isUploading ? "Uploading..." : "Upload"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                 )}
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
                                <TableHead className="hidden sm:table-cell">Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                 <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : !documents || documents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No documents available yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documents.map((doc: Resource) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-muted-foreground"/> {doc.name}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{doc.uploaderName}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{doc.uploadDate?.toDate().toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.fileUrl, doc.name)}>
                                                <Download className="h-5 w-5"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
