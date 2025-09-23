
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Briefcase,
  Calendar,
  FolderKanban,
  Megaphone,
  MessageSquare,
  Bot,
  Star,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GithubIcon, LinkedinIcon, Logo, TwitterIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from "@/components/theme-toggle";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const features = [
  {
    icon: <Briefcase className="h-6 w-6 text-primary-foreground" />,
    title: "Placement Corner",
    description: "Your one-stop hub for career resources, roadmaps, and interview experiences.",
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-primary-foreground" />,
    title: "Discussion Forum",
    description: "Connect with peers, seniors, and faculty. Ask questions and share knowledge.",
  },
  {
    icon: <Megaphone className="h-6 w-6 text-primary-foreground" />,
    title: "Announcements",
    description: "Stay updated with the latest news and announcements from faculty and HODs.",
  },
  {
    icon: <Calendar className="h-6 w-6 text-primary-foreground" />,
    title: "Events Hub",
    description: "Discover and register for workshops, tech talks, and hackathons.",
  },
  {
    icon: <FolderKanban className="h-6 w-6 text-primary-foreground" />,
    title: "Resource Hub",
    description: "Access and share notes, past papers, and other study materials.",
  },
  {
    icon: <Bot className="h-6 w-6 text-primary-foreground" />,
    title: "AI Chatbot",
    description: "Get instant answers to your campus-related questions with our smart assistant.",
  },
];

const testimonials = [
    {
        name: "Priya Sharma",
        role: "Software Engineer @ TechCorp",
        avatar: "https://picsum.photos/seed/priya/80/80",
        avatarHint: "woman face",
        testimonial: "The placement roadmaps and interview experiences on CampusConnect were a game-changer for my preparation. I landed my dream job thanks to the resources here!"
    },
    {
        name: "Rahul Verma",
        role: "Product Manager @ Innovate Inc.",
        avatar: "https://picsum.photos/seed/rahul/80/80",
        avatarHint: "man face",
        testimonial: "Connecting with alumni through the forum gave me invaluable insights into the industry. The community is incredibly supportive and helpful."
    },
    {
        name: "Anjali Singh",
        role: "Data Scientist @ Future Solutions",
        avatar: "https://picsum.photos/seed/anjali/80/80",
        avatarHint: "woman smiling",
        testimonial: "I never missed a single campus event thanks to the real-time notifications. The workshops were amazing for skill-building. Highly recommended!"
    }
]

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleLinkClick = (path: string, id: string) => {
    setLoading(id);
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const elements = document.querySelectorAll('.scroll-animate');

    elements.forEach(el => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      }, { threshold: 0.1 });

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      elements.forEach(el => {
        observers.forEach(observer => {
          observer.unobserve(el);
        });
      });
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0">
          <div className="flex flex-col items-center gap-4">
             <Logo className="h-16 w-16 text-primary animate-pulse-grow" />
             <p className="text-muted-foreground">Connecting you...</p>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-xl">CampusConnect</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
            <nav className="flex items-center space-x-1">
              <Button 
                className="shine-button" 
                onClick={() => handleLinkClick('/login', 'login')}
                disabled={!!loading}
              >
                Login
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
         <section className="py-20 md:py-32">
          <div className="container text-center">
            <div className="max-w-4xl mx-auto animate-in">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl font-headline">
                The All-In-One Platform for Your Campus Life
              </h1>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                Connect, collaborate, and conquer your college journey. From placements to discussions, we've got you covered.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button 
                    size="lg" 
                    className="shine-button"
                    onClick={() => handleLinkClick('/signup', 'get-started')}
                    disabled={!!loading}
                >
                    Get Started
                </Button>
                <Button asChild variant="outline" size="lg" className="shine-button">
                    <Link href="#features">Explore Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section id="quick-prep" className="bg-secondary/50 py-20 my-12">
            <div className="container text-center scroll-animate">
                <div className="mx-auto max-w-3xl">
                    <div className="inline-block bg-primary text-primary-foreground rounded-full p-3 mb-4 animate-pulse">
                        <Zap className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">Quick Placement Prep</h2>
                    <p className="text-muted-foreground mb-6">
                        Jumpstart your placement journey. Upload your resume and transcript to get a personalized study plan and resource suggestions in seconds.
                    </p>
                     <Button 
                        size="lg" 
                        className="shine-button"
                        onClick={() => handleLinkClick('/login', 'start-now')}
                        disabled={!!loading}
                      >
                         Start Now
                      </Button>
                </div>
            </div>
        </section>

        <section id="features" className="container my-20">
          <div className="mx-auto flex flex-col items-center gap-4 text-center mb-12 scroll-animate">
            <div>
              <h2 className="text-3xl font-bold tracking-tight font-headline">Everything You Need, in One Place</h2>
              <p className="text-muted-foreground max-w-2xl">
                CampusConnect integrates every aspect of your academic and social life into a single, seamless experience.
              </p>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card key={feature.title} className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 scroll-animate stagger-${(i % 3) + 1}`}>
                  <CardHeader className="flex flex-row items-center gap-4 p-4 bg-primary text-primary-foreground">
                    {feature.icon}
                    <CardTitle className="text-lg font-headline text-primary-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-4">
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <section id="testimonials" className="my-20 py-24 bg-secondary/50">
            <div className="container scroll-animate">
                <div className="mx-auto flex flex-col items-center gap-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight font-headline">From Our Students</h2>
                    <p className="text-muted-foreground max-w-2xl">
                        See how CampusConnect is helping students achieve their goals.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, i) => (
                         <Card key={testimonial.name} className={`bg-card p-6 flex flex-col justify-center items-center text-center scroll-animate stagger-${i+1}`}>
                            <CardHeader className="p-0 items-center">
                                <Avatar className="w-20 h-20 mb-4 border-2 border-primary">
                                    <AvatarImage src={testimonial.avatar} data-ai-hint={testimonial.avatarHint}/>
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                                <CardDescription>{testimonial.role}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex justify-center mb-4 text-yellow-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                </div>
                                <p className="text-muted-foreground text-sm italic">&quot;{testimonial.testimonial}&quot;</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

      </main>

      <footer className="py-12 md:py-16 border-t border-border/40 bg-secondary/30 scroll-animate">
        <div className="container grid gap-8 md:grid-cols-5">
            <div className="md:col-span-2">
                <Link href="/" className="flex items-center space-x-2 mb-4">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-bold text-2xl font-headline">CampusConnect</span>
                </Link>
                <p className="text-muted-foreground max-w-sm mb-4">
                    Bringing campus communities together through innovative digital experiences and seamless collaboration.
                </p>
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><TwitterIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" /></a>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><LinkedinIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" /></a>
                    </Button>
                     <Button variant="ghost" size="icon" asChild>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer"><GithubIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" /></a>
                    </Button>
                </div>
            </div>
            <div>
                <h4 className="font-semibold font-headline mb-4">Platform</h4>
                <ul className="space-y-3">
                    <li><Link href="/forum" className="text-muted-foreground hover:text-primary transition-colors">Discussion Forums</Link></li>
                    <li><Link href="/resources" className="text-muted-foreground hover:text-primary transition-colors">Resource Hub</Link></li>
                    <li><Link href="/placements" className="text-muted-foreground hover:text-primary transition-colors">Placement Corner</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Alumni Connect</Link></li>
                    <li><Link href="/events" className="text-muted-foreground hover:text-primary transition-colors">Events</Link></li>
                </ul>
            </div>
             <div>
                <h4 className="font-semibold font-headline mb-4">Support</h4>
                <ul className="space-y-3">
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Technical Support</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">System Status</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Feedback</Link></li>
                </ul>
            </div>
             <div>
                <h4 className="font-semibold font-headline mb-4">Resources</h4>
                <ul className="space-y-3">
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">User Guide</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">API Documentation</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Community Guidelines</Link></li>
                </ul>
            </div>
        </div>
        <div className="container mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
             &copy; {new Date().getFullYear()} CampusConnect. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
