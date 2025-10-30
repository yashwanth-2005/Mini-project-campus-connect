
"use client";

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
import { GithubIcon, LinkedinIcon, Logo } from "@/components/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const emailInput = document.getElementById(`${role}-email`) as HTMLInputElement;
    const passwordInput = document.getElementById(`${role}-password`) as HTMLInputElement;
    
    if (!emailInput || !passwordInput) {
        setIsLoading(false);
        return;
    };

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        toast({
            title: "Invalid Email",
            description: "Please enter a valid email address.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    if (!password) {
        toast({
            title: "Password Required",
            description: "Please enter a password.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        toast({
            title: "Login Successful",
            description: `Welcome back, ${user.displayName || user.email}!`,
        });
        router.push(`/dashboard?role=${role}`);
    } catch (error: any) {
        let errorMessage = "An unexpected error occurred.";
        switch (error.code) {
            case "auth/user-not-found":
            case "auth/wrong-password":
                errorMessage = "Invalid email or password. Please try again.";
                break;
            case "auth/invalid-credential":
                 errorMessage = "Invalid email or password. Please try again.";
                 break;
            default:
                errorMessage = error.message;
        }
        toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const renderLoginForm = (currentRole: "student" | "faculty") => (
    <>
      {currentRole === 'student' && (
        <>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="transition-transform hover:scale-105" type="button">
                    <GithubIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="transition-transform hover:scale-105" type="button">
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
        </>
      )}
      <div className="grid gap-2">
        <Label htmlFor={`${currentRole}-email`}>Email</Label>
        <Input id={`${currentRole}-email`} type="email" placeholder="example@gmail.com" required className="transition-all focus:scale-[1.02] focus:shadow-lg" />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor={`${currentRole}-password`}>Password</Label>
            <Link
              href="/forgot-password"
              className="ml-auto inline-block text-sm underline"
            >
              Forgot your password?
            </Link>
        </div>
        <div className="relative">
          <Input id={`${currentRole}-password`} type={showPassword ? "text" : "password"} required className="pr-10 transition-all focus:scale-[1.02] focus:shadow-lg" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 animate-in">
        {isLoading && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-150">
            <div className="flex flex-col items-center gap-4">
                <Logo className="h-16 w-16 text-primary animate-pulse-grow" />
                <p className="text-muted-foreground">Connecting you...</p>
            </div>
            </div>
        )}
      <Card className="w-full max-w-md mx-auto shadow-xl animate-in fade-in-0 slide-in-from-bottom-10 duration-300">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl font-headline">CampusConnect</span>
          </Link>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Select your role and enter your details to login.
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="student" className="w-full" onValueChange={(value) => setRole(value as 'student' | 'faculty')}>
          <CardContent className="grid gap-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="faculty">Faculty</TabsTrigger>
            </TabsList>
            <TabsContent value="student" className="grid gap-4 animate-in">
              {renderLoginForm("student")}
            </TabsContent>
            <TabsContent value="faculty" className="grid gap-4 animate-in">
              {renderLoginForm("faculty")}
            </TabsContent>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full shine-button" onClick={handleLogin} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Logging in..." : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </Button>
            {role === 'student' && (
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline">
                  Sign up
                </Link>
              </div>
            )}
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}
