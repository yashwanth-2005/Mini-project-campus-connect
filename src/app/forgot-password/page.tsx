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
import { findUserByEmail } from "@/lib/mock-db";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            const user = findUserByEmail(email);

            if (user) {
                // In a real app, you would trigger an email service here.
                // For this prototype, we'll just show a success state.
                setEmailSent(true);
            } else {
                toast({
                    title: "Email not registered",
                    description: "No account was found with that email address. Please try again.",
                    variant: "destructive",
                });
            }
            setIsLoading(false);
        }, 500);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
             <Card className="w-full max-w-md mx-auto shadow-xl animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
                <CardHeader className="space-y-1 text-center">
                    <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
                        <Logo className="h-8 w-8 text-primary" />
                        <span className="font-bold text-2xl font-headline">CampusConnect</span>
                    </Link>
                    <CardTitle className="text-2xl font-headline">Forgot Password</CardTitle>
                    <CardDescription>
                        {emailSent 
                            ? "A password reset link has been sent."
                            : "Enter your registered email to reset your password."}
                    </CardDescription>
                </CardHeader>
                {emailSent ? (
                    <CardContent>
                        <Alert variant="default" className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-700 dark:[&>svg]:text-green-400">
                            <MailCheck className="h-4 w-4" />
                            <AlertTitle>Simulation Successful!</AlertTitle>
                            <AlertDescription>
                                This is a prototype. In a real application, a password reset link would be sent to <strong>{email}</strong>. Since no email is actually sent, please use your existing password to log in.
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
                                {isLoading ? "Checking..." : "Send Reset Link"}
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
