
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
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal('')),
    githubUrl: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal('')),
    leetcodeUrl: z.string().url("Please enter a valid LeetCode URL").optional().or(z.literal('')),
    profilePictureUrl: z.string().optional(),
});

const usnChangeSchema = z.object({
    newUsn: z.string().min(1, "New USN is required."),
    reason: z.string().min(10, "Please provide a brief reason (min. 10 characters)."),
});

export default function ProfilePage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => user ? doc(firestore, "users", user.uid) : null, [firestore, user]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUsnDialogOpen, setIsUsnDialogOpen] = useState(false);
    const [pendingUsnRequest, setPendingUsnRequest] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRequestingUsn, setIsRequestingUsn] = useState(false);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            linkedinUrl: '',
            githubUrl: '',
            leetcodeUrl: '',
            profilePictureUrl: ''
        },
    });
    
    useEffect(() => {
      if (!isUserLoading && !user) {
        router.push('/login');
      }
    }, [isUserLoading, user, router]);

    useEffect(() => {
        if (userProfile) {
            form.reset({
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                linkedinUrl: userProfile.linkedinUrl || "",
                githubUrl: userProfile.githubUrl || "",
                leetcodeUrl: userProfile.leetcodeUrl || "",
                profilePictureUrl: userProfile.profilePictureUrl || "",
            });
            setPreviewImage(userProfile.profilePictureUrl || null);
        }
    }, [userProfile, form]);

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

    async function onSubmit(data: z.infer<typeof profileSchema>) {
        if (!userDocRef) return;
        setIsSaving(true);
        
        try {
            await updateDoc(userDocRef, data);
            toast({
                title: "Profile Updated!",
                description: "Your profile has been successfully updated.",
            });
            window.location.reload();
        } catch(e) {
            toast({
                title: "Update Failed",
                description: "Could not update your profile. Please try again.",
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    }

    function onUsnChangeSubmit(data: z.infer<typeof usnChangeSchema>) {
        // This is a placeholder as USN change logic is complex and out of scope for now
        setIsRequestingUsn(true);
        setTimeout(() => {
             toast({
                title: "Request Submitted",
                description: "Your USN change request has been submitted for faculty approval."
            });
            setPendingUsnRequest(true);
            setIsUsnDialogOpen(false);
            setIsRequestingUsn(false);
        }, 500);
    }

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
                                <AvatarImage src={previewImage || `https://api.dicebear.com/8.x/bottts/svg?seed=${userProfile.usn}`} />
                                <AvatarFallback>{userProfile.firstName.charAt(0)}</AvatarFallback>
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
                           <div className="space-y-2">
                                <Label>USN (University Seat Number)</Label>
                                <Input value={userProfile.usn} readOnly className="bg-muted/50" />
                                <FormDescription>USN cannot be changed directly. Please contact admin.</FormDescription>
                           </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={userProfile.email} disabled />
                                <FormDescription>You cannot change your registration email.</FormDescription>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Course</Label>
                                <Input value={userProfile.course} readOnly className="bg-muted/50" />
                            </div>
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
