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
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { findUserById, updateUser, User, getUsnRequestForUser, createUsnChangeRequest } from "@/lib/mock-db";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase";

// Defines the shape and validation rules for the profile form.
const profileSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    usn: z.string().min(1, "USN is required"),
    year: z.coerce.number().min(1, "Year is required").max(4, "Please enter a valid year"),
    bio: z.string().optional(),
    linkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal('')),
    github: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal('')),
    leetcode: z.string().url("Please enter a valid LeetCode URL").optional().or(z.literal('')),
    profilePicture: z.string().optional(),
});

// Defines the validation for the USN change request dialog.
const usnChangeSchema = z.object({
    newUsn: z.string().min(1, "New USN is required."),
    reason: z.string().min(10, "Please provide a brief reason (min. 10 characters)."),
});

export default function ProfilePage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user: firebaseUser, isUserLoading } = useUser();
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUsnDialogOpen, setIsUsnDialogOpen] = useState(false);
    const [pendingUsnRequest, setPendingUsnRequest] = useState(false);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: { /* Populated by the useEffect hook below */ },
    });

    const usnForm = useForm<z.infer<typeof usnChangeSchema>>({
        resolver: zodResolver(usnChangeSchema),
        defaultValues: { newUsn: "", reason: "" }
    });

    // When the Firebase user is loaded, fetch their profile from our mock database.
    useEffect(() => {
        if (firebaseUser) {
            const profile = findUserById(firebaseUser.uid);
            setUserProfile(profile);
            
            if (profile) {
                setPreviewImage(profile.profilePicture || null);
                // Pre-fill the form with the fetched profile data.
                form.reset({
                    fullName: profile.fullName,
                    usn: profile.usn,
                    year: profile.year,
                    bio: profile.bio || "",
                    linkedin: profile.linkedin || "",
                    github: profile.github || "",
                    leetcode: profile.leetcode || "",
                    profilePicture: profile.profilePicture || "",
                });

                // Check if this user has a pending USN change request.
                const pendingRequest = getUsnRequestForUser(profile.id);
                setPendingUsnRequest(!!pendingRequest);
            }
        } else if (!isUserLoading) {
            // If Firebase is done loading and there's no user, redirect to login.
            router.push('/login');
        }
    }, [firebaseUser, isUserLoading, form, router]);

    // Create a local preview when a new profile picture is selected.
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewImage(result);
                form.setValue("profilePicture", result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handles saving the main profile form.
    function onSubmit(data: z.infer<typeof profileSchema>) {
        if (!userProfile) return;

        try {
            updateUser(userProfile.id, data);
            toast({
                title: "Profile Updated!",
                description: "Your profile has been successfully updated.",
            });
            // Force a reload to update the user avatar in the main navigation.
            window.location.reload();
        } catch(e) {
            toast({
                title: "Update Failed",
                description: "Could not update your profile. Please try again.",
                variant: 'destructive'
            });
        }
    }

    // Handles the submission of the USN change request.
    function onUsnChangeSubmit(data: z.infer<typeof usnChangeSchema>) {
        if (!userProfile) return;
        try {
            createUsnChangeRequest({
                userId: userProfile.id,
                studentName: userProfile.fullName,
                currentUsn: userProfile.usn,
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
        }
    }

    // Displays a loading skeleton while fetching user data.
    if (isUserLoading || !userProfile) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>This information will be visible on your profile after approval.</CardDescription>
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
                                <AvatarImage src={previewImage || `https://api.dicebear.com/8.x/bottts/svg?seed=${userProfile.usn}`} />
                                <AvatarFallback>{userProfile.fullName.charAt(0)}</AvatarFallback>
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
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <Label htmlFor="usn">USN (University Seat Number)</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="usn" type="text" value={userProfile.usn} readOnly className="bg-muted/50" />
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
                                                        <Button type="submit">Submit Request</Button>
                                                    </DialogFooter>
                                                </form>
                                            </Form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <FormDescription>
                                    {pendingUsnRequest 
                                        ? <>Your change request is pending approval. <Badge variant="secondary">Pending</Badge></>
                                        : "USN cannot be changed directly. Please submit a request for faculty approval."
                                    }
                                </FormDescription>
                            </div>
                        </div>
                         <div className="grid md:grid-cols-2 gap-4">
                           
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year of Study</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 3" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue={userProfile.email} disabled />
                                <FormDescription>You cannot change your registration email.</FormDescription>
                            </div>
                        </div>
                       
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tell us a little bit about yourself" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                            name="linkedin"
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
                            name="github"
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
                            name="leetcode"
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
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Form>
    );
}
