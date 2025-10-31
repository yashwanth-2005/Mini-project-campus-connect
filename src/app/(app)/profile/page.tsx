
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useEffect, useState, useRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useUser } from "@/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile } from "@/hooks/use-profile";
import { createUsnChangeRequest } from "@/lib/mock-db";

// Defines the validation schema for the profile form.
// This ensures data consistency before submission.
const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal('')),
    githubUrl: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal('')),
    leetcodeUrl: z.string().url("Please enter a valid LeetCode URL").optional().or(z.literal('')),
    profilePictureUrl: z.string().optional(),
    // Faculty specific fields
    department: z.string().optional(),
    facultyId: z.string().optional(),
});

// Defines validation for the USN change request form.
const usnChangeSchema = z.object({
    newUsn: z.string().min(1, "New USN is required."),
    reason: z.string().min(10, "Please provide a brief reason (min. 10 characters)."),
});

// This is the main component for the user profile page.
export default function ProfilePage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user, isUserLoading } = useUser();

    // The useProfile hook abstracts away the data source logic (local vs. cloud).
    const { userProfile, isLoading: isProfileLoading, updateUserProfile } = useProfile();

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUsnDialogOpen, setIsUsnDialogOpen] = useState(false);
    const [pendingUsnRequest, setPendingUsnRequest] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRequestingUsn, setIsRequestingUsn] = useState(false);

    // Initializes the main profile form with validation and default values.
    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            linkedinUrl: '',
            githubUrl: '',
            leetcodeUrl: '',
            profilePictureUrl: '',
            department: '',
            facultyId: '',
        },
    });

     const usnForm = useForm<z.infer<typeof usnChangeSchema>>({
        resolver: zodResolver(usnChangeSchema),
        defaultValues: {
            newUsn: "",
            reason: ""
        }
    });
    
    // Redirects to the login page if the user is not authenticated.
    useEffect(() => {
      if (!isUserLoading && !user) {
        router.push('/login');
      }
    }, [isUserLoading, user, router]);

    // When the user's profile data loads, this effect fills the form.
    useEffect(() => {
        if (userProfile) {
            form.reset({
                firstName: userProfile.firstName || "",
                lastName: userProfile.lastName || "",
                linkedinUrl: userProfile.linkedinUrl || "",
                githubUrl: userProfile.githubUrl || "",
                leetcodeUrl: userProfile.leetcodeUrl || "",
                profilePictureUrl: userProfile.profilePictureUrl || "",
                department: userProfile.department || "",
                facultyId: userProfile.facultyId || "",
            });
            setPreviewImage(userProfile.profilePictureUrl || null);
        }
    }, [userProfile, form]);

    // Creates a local preview URL for a newly selected profile picture.
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewImage(result);
                form.setValue("profilePictureUrl", result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Saves the updated profile data.
    async function onSubmit(data: z.infer<typeof profileSchema>) {
        if (!user) return;
        setIsSaving(true);
        
        try {
            await updateUserProfile(data);
            toast({
                title: "Profile Updated!",
                description: "Your profile has been successfully updated.",
            });
            router.refresh(); 
        } catch(e: any) {
            toast({
                title: "Update Failed",
                description: e.message || "Could not update your profile. Please try again.",
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    }

    // Handles the submission of the USN change request (uses mock-db for simplicity).
    function onUsnChangeSubmit(data: z.infer<typeof usnChangeSchema>) {
        if (!user || !userProfile) return;
        setIsRequestingUsn(true);
        try {
            createUsnChangeRequest({
                userId: user.uid,
                studentName: user.displayName || 'N/A',
                currentUsn: userProfile.usn || '',
                newUsn: data.newUsn.toUpperCase(),
                reason: data.reason
            });
            toast({
                title: "Request Submitted",
                description: "Your USN change request has been submitted for faculty approval."
            });
            setPendingUsnRequest(true);
            setIsUsnDialogOpen(false);
            usnForm.reset();
        } catch (error: any) {
             toast({
                title: "Submission Failed",
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsRequestingUsn(false);
        }
    }

    // Shows a loading skeleton while data is being fetched.
    if (isUserLoading || isProfileLoading || !userProfile) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Your Profile</h1>
                    <p className="text-muted-foreground">Update your personal and professional information.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>This information will be visible on your public profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24 border">
                                <AvatarImage src={previewImage || `https://api.dicebear.com/8.x/bottts/svg?seed=${user?.uid}`} />
                                <AvatarFallback>{userProfile.firstName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="picture">Profile Picture</Label>
                                <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                                <p className="text-xs text-muted-foreground">JPG, PNG, or GIF, no larger than 5MB.</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your First Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Last Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                         <div className="grid md:grid-cols-2 gap-4">
                           {userProfile.role === 'student' ? (
                                <div className="space-y-2">
                                    <Label>USN (University Seat Number)</Label>
                                     <div className="flex items-center gap-2">
                                        <Input value={userProfile.usn || ''} readOnly className="bg-muted/50" />
                                        <Dialog open={isUsnDialogOpen} onOpenChange={setIsUsnDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button type="button" variant="outline" disabled={pendingUsnRequest}>
                                                    {pendingUsnRequest ? "Pending" : "Request Change"}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Request USN Change</DialogTitle>
                                                    <DialogDescription>
                                                        Submit a request to a faculty member to change your USN. This is for correcting errors only.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <Form {...usnForm}>
                                                    <form onSubmit={usnForm.handleSubmit(onUsnChangeSubmit)} className="space-y-4">
                                                        <FormField
                                                            control={usnForm.control}
                                                            name="newUsn"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>New USN</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="1CR21CSXXX" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={usnForm.control}
                                                            name="reason"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Reason for Change</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea placeholder="e.g., Typo during registration" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <DialogFooter>
                                                            <Button type="submit" disabled={isRequestingUsn}>
                                                                {isRequestingUsn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                Submit Request
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <FormDescription>USN cannot be changed directly. Please request approval.</FormDescription>
                               </div>
                           ) : (
                                <FormField
                                    control={form.control}
                                    name="facultyId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Faculty ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your Faculty ID" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                           )}
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={userProfile.email} disabled />
                                <FormDescription>You cannot change your registration email.</FormDescription>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {userProfile.role === 'student' ? (
                                <div className="space-y-2">
                                    <Label>Course</Label>
                                    <Input value={userProfile.course} readOnly className="bg-muted/50" />
                                </div>
                            ) : (
                                <>
                                 <FormField
                                        control={form.control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your department" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                <SelectItem value="cse">Computer Science & Engineering</SelectItem>
                                                <SelectItem value="ise">Information Science & Engineering</SelectItem>
                                                <SelectItem value="ece">Electronics & Communication</SelectItem>
                                                <SelectItem value="eee">Electrical & Electronics</SelectItem>
                                                <SelectItem value="mech">Mechanical Engineering</SelectItem>
                                                <SelectItem value="civil">Civil Engineering</SelectItem>
                                                <SelectItem value="humanities">Basic Sciences & Humanities</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="space-y-2">
                                        <Label>Unique Code</Label>
                                        <Input value={userProfile.uniqueCode || 'Not Set'} readOnly className="bg-muted/50" />
                                        <FormDescription>This is your faculty verification code.</FormDescription>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Social & Professional Links</CardTitle>
                        <CardDescription>Help others connect with you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="linkedinUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LinkedIn Profile URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="githubUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GitHub Profile URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://github.com/yourusername" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="leetcodeUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LeetCode Profile URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://leetcode.com/yourusername" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}
