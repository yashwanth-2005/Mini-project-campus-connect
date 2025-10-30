
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
import { GithubIcon, LinkedinIcon, Logo } from "@/components/icons";
import Link from "next/link";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Base schema with common fields for both roles.
const baseSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  linkedin: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  leetcode: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
});

// Schema for student-specific fields.
const studentSchema = baseSchema.extend({
  role: z.literal('student'),
  usn: z.string().min(1, "USN is required"),
  year: z.coerce.number()
    .min(1, "Year is required")
    .max(4, "Year cannot be more than 4")
    .refine(val => val <= 4, { message: "Year cannot be more than 4" }),
  semester: z.coerce.number().min(1, "Semester is required").max(8, "Semester cannot be more than 8"),
  course: z.string().min(1, "Please select your course"),
});

// Schema for faculty-specific fields.
const facultySchema = baseSchema.extend({
    role: z.literal('faculty'),
    department: z.string().min(1, "Department is required"),
    facultyId: z.string().min(1, "Faculty ID is required"),
    uniqueCode: z.string().min(1, "Unique code is required"),
});

// The final discriminated union schema.
const signupSchema = z.discriminatedUnion("role", [studentSchema, facultySchema])
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty'>('student');
  
  // Initialize the form with default values and the validation schema.
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
        role: 'student',
        fullName: "",
        email: searchParams.get('email') || "",
        password: "",
        confirmPassword: "",
        // Student fields
        usn: "",
        year: '' as any, // Use empty string to avoid uncontrolled to controlled error
        semester: '' as any, // Use empty string to avoid uncontrolled to controlled error
        course: "",
        // Faculty fields
        department: "",
        facultyId: "",
        uniqueCode: "",
        // Common optional fields
        linkedin: "",
        leetcode: "",
    }
  });
  
  const password = form.watch("password");

  // Calculates the strength of the entered password.
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: '' };
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
        color = 'bg-red-500';
        break;
      case 3:
        label = 'Medium';
        color = 'bg-yellow-500';
        break;
      case 4:
      case 5:
        label = 'Strong';
        color = 'bg-green-500';
        break;
    }
    return { score, label, color };
  };

  const strength = getPasswordStrength(password);

  // Handles the form submission logic.
  async function onSubmit(data: z.infer<typeof signupSchema>) {
    setIsLoading(true);

    // Check for password strength before submitting.
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
        if (!firestore) throw new Error("Firestore not initialized");

        // Create the user in Firebase Authentication.
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        // Update the user's display name.
        await updateProfile(user, {
            displayName: data.fullName
        });

        const [firstName, ...lastName] = data.fullName.split(' ');

        // Prepare the user profile data for Firestore.
        let userProfileData: any = {
            id: user.uid,
            email: data.email,
            firstName: firstName,
            lastName: lastName.join(' '),
            linkedinUrl: data.linkedin,
            leetcodeUrl: data.leetcode,
            githubUrl: "",
            profilePictureUrl: "",
            role: data.role,
        };

        // Add role-specific data.
        if (data.role === 'student') {
            userProfileData = {
                ...userProfileData,
                usn: data.usn.toUpperCase(),
                year: data.year,
                semester: data.semester,
                course: data.course,
                branch: data.course,
            }
        } else {
             userProfileData = {
                ...userProfileData,
                department: data.department,
                facultyId: data.facultyId,
                branch: data.department
             }
        }

        // Save the user profile to Firestore.
        await setDoc(doc(firestore, "users", user.uid), userProfileData);

        toast({
            title: "Account Created!",
            description: "You can now log in with your new account.",
        });
        router.push('/login');
    } catch (error: any) {
        let errorMessage = "An unexpected error occurred.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "This email is already registered. Please try logging in."
        } else {
            errorMessage = error.message;
        }
        toast({
            title: "Signup Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }

  // Handles switching between student and faculty roles.
  const handleRoleChange = (role: 'student' | 'faculty') => {
    setSelectedRole(role);
    form.setValue('role', role);
    form.reset({
        ...form.getValues(),
        role: role,
        // Reset fields to avoid validation errors on role switch
        usn: role === 'student' ? form.getValues('usn') : '',
        year: role === 'student' ? form.getValues('year') : '' as any,
        semester: role === 'student' ? form.getValues('semester') : '' as any,
        course: role === 'student' ? form.getValues('course') : '',
        department: role === 'faculty' ? form.getValues('department') : '',
        facultyId: role === 'faculty' ? form.getValues('facultyId') : '',
        uniqueCode: role === 'faculty' ? form.getValues('uniqueCode') : '',
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 animate-in">
       {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-150">
          <div className="flex flex-col items-center gap-4">
            <Logo className="h-16 w-16 text-primary animate-pulse-grow" />
            <p className="text-muted-foreground">Creating your account...</p>
          </div>
        </div>
      )}
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="grid gap-4">
                    <Tabs defaultValue="student" className="w-full" onValueChange={(value) => handleRoleChange(value as 'student' | 'faculty')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="student">Student</TabsTrigger>
                            <TabsTrigger value="faculty">Faculty</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    
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
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                                <Input placeholder="Max Robinson" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="m@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {selectedRole === 'student' && (
                        <>
                            <FormField control={form.control} name="usn" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>USN</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1CR21CS001" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField
                                control={form.control}
                                name="course"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Course</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your course" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="be-cse">B.E. - Computer Science & Engineering</SelectItem>
                                        <SelectItem value="be-ise">B.E. - Information Science & Engineering</SelectItem>
                                        <SelectItem value="be-ece">B.E. - Electronics & Communication</SelectItem>
                                        <SelectItem value="be-eee">B.E. - Electrical & Electronics</SelectItem>
                                        <SelectItem value="be-mech">B.E. - Mechanical Engineering</SelectItem>
                                        <SelectItem value="be-civil">B.E. - Civil Engineering</SelectItem>
                                        <SelectItem value="mca">MCA - Master of Computer Applications</SelectItem>
                                        <SelectItem value="mtech-cse">M.Tech - Computer Science & Engineering</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="year" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="3" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="semester" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Semester</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="6" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </>
                    )}

                    {selectedRole === 'faculty' && (
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
                             <FormField control={form.control} name="facultyId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Faculty ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Faculty ID" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="uniqueCode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unique Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Provided by administration" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </>
                    )}


                    <FormField control={form.control} name="linkedin" render={({ field }) => (
                        <FormItem>
                            <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                            <FormControl>
                                <Input type="url" placeholder="https://linkedin.com/in/yourprofile" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="leetcode" render={({ field }) => (
                        <FormItem>
                            <FormLabel>LeetCode Profile (Optional)</FormLabel>
                            <FormControl>
                                <Input type="url" placeholder="https://leetcode.com/yourusername" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input type={showPassword ? "text" : "password"} {...field} />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                
                    {password && (
                        <div className="space-y-2">
                        <Progress value={strength.score * 20} className="h-2 [&>div]:transition-all [&>div]:duration-300" />
                        <p className="text-xs text-muted-foreground">
                            Password strength: <span className={`font-bold`}>{strength.label}</span>
                        </p>
                        </div>
                    )}
                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full shine-button" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
        </Form>
      </Card>
    </div>
  );
}

    