
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";
import { findUserByEmail } from "@/lib/mock-db";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // This function simulates sending a password reset link.
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        // Simulate network delay for a more realistic feel.
        setTimeout(() => {
            const userExists = findUserByEmail(email);

            if (userExists) {
                 // In a real app, this is where you would call an email service.
                 // For this demo, we'll just show a success message.
                setEmailSent(true);
            } else {
                 toast({
                    title: "Email not found",
                    description: "No account is associated with this email.",
                    variant: "destructive",
                });
            }
            setIsLoading(false);
        }, 500);

       
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
             {isLoading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-150">
                    <div className="flex flex-col items-center gap-4">
                        <Logo className="h-16 w-16 text-primary animate-pulse-grow" />
                        <p className="text-muted-foreground">Connecting you...</p>
                    </div>
                </div>
            )}
             <Card className="w-full max-w-md mx-auto shadow-xl animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
                <CardHeader className="space-y-1 text-center">
                    <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
                        <Logo className="h-8 w-8 text-primary" />
                        <span className="font-bold text-2xl font-headline">CampusConnect</span>
                    </Link>
                    <CardTitle className="text-2xl font-headline">Forgot Password</CardTitle>
                    <CardDescription>
                        {emailSent 
                            ? "A password reset link has been sent to your email."
                            : "Enter your registered email to reset your password."}
                    </CardDescription>
                </CardHeader>
                {emailSent ? (
                    <CardContent>
                        <Alert variant="default" className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-700 dark:[&>svg]:text-green-400">
                            <MailCheck className="h-4 w-4" />
                            <AlertTitle>Password Reset Link Sent!</AlertTitle>
                            <AlertDescription>
                                For demonstration purposes, you can now go back and log in with your old password. In a real app, a reset link would be sent to <strong>{email}</strong>.
                            </AlertDescription>
                        </Alert>
                         <Button asChild className="w-full mt-6">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </CardContent>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="name@example.com" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </CardContent>
                    </form>
                )}
                {!emailSent && (
                    <CardFooter className="flex justify-center">
                         <Button variant="link" asChild>
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
