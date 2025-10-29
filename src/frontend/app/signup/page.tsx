'use client';

import { Button } from "@/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { GithubIcon, LinkedinIcon, Logo } from "@/frontend/components/icons";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Progress } from "@/frontend/components/ui/progress";
import { useToast } from "@/frontend/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createUser } from "@/backend/lib/mock-db";

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [usn, setUsn] = useState('');

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) {
        setStrength({ score: 0, label: '', color: '' });
        return;
    }
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    let label = '';
    let color = '';
    switch (score) {
      case 0:
      case 1:
      case 2:
        label = 'Weak';
        color = 'text-red-500';
        break;
      case 3:
        label = 'Medium';
        color = 'text-yellow-500';
        break;
      case 4:
      case 5:
        label = 'Strong';
        color = 'text-green-500';
        break;
      default:
        label = '';
        color = '';
    }
    
    setStrength({ score, label, color });
  };
  
  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  const handleSignup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (strength.score < 3) {
      toast({
        title: "Weak Password",
        description: "Please choose a stronger password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
        createUser({
            fullName: data.fullName as string,
            email: data.email as string,
            password: data.password as string,
            usn: data.usn as string,
            year: Number(data.year),
            semester: Number(data.semester),
            linkedin: data.linkedin as string,
            leetcode: data.leetcode as string,
        });
        toast({
            title: "Account Created!",
            description: "You can now log in with your new account.",
        });
        router.push('/login');
    } catch (error: any) {
        toast({
            title: "Signup Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 animate-in">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="space-y-1 text-center">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
                <Logo className="h-8 w-8 text-primary" />
                <span className="font-bold text-2xl font-headline">CampusConnect</span>
            </Link>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>
            Enter your details below to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
            <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" type="button" className="transition-transform hover:scale-105">
                    <GithubIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" type="button" className="transition-transform hover:scale-105">
                    <LinkedinIcon className="h-4 w-4" />
                </Button>
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                </span>
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input name="fullName" id="fullName" placeholder="Max Robinson" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input name="email" id="email" type="email" placeholder="m@example.com" required/>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="usn">USN</Label>
                <Input name="usn" id="usn" type="text" placeholder="1CR21CS001" required value={usn} onChange={(e) => setUsn(e.target.value.toUpperCase())}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Input name="year" id="year" type="number" placeholder="3" required />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="semester">Semester</Label>
                <Input name="semester" id="semester" type="number" placeholder="6" required />
                </div>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="linkedin">LinkedIn Profile (Optional)</Label>
                <Input name="linkedin" id="linkedin" type="url" placeholder="https://linkedin.com/in/yourprofile" />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="leetcode">LeetCode Profile (Optional)</Label>
                <Input name="leetcode" id="leetcode" type="url" placeholder="https://leetcode.com/yourusername" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                name="password"
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {password && (
                <div className="space-y-2">
                <Progress value={strength.score * 20} className="h-2 [&>div]:transition-all [&>div]:duration-300" />
                <p className="text-xs text-muted-foreground">
                    Password strength: <span className={`font-bold ${strength.color}`}>{strength.label}</span>
                </p>
                </div>
            )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full shine-button" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                Login
                </Link>
            </div>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
