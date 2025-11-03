
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import React, { useState } from 'react';
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";

// Data for the feature cards displayed on the landing page.
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

// Data for testimonials from past students.
const testimonials = [
    {
        name: "Priya Sharma",
        role: "Software Engineer @ TechCorp",
        avatar: "https://picsum.photos/seed/priya/80/80",
        testimonial: "The placement roadmaps and interview experiences on CampusConnect were a game-changer for my preparation. I landed my dream job thanks to the resources here!"
    },
    {
        name: "Rahul Verma",
        role: "Product Manager @ Innovate Inc.",
        avatar: "https://picsum.photos/seed/rahul/80/80",
        testimonial: "Connecting with alumni through the forum gave me invaluable insights into the industry. The community is incredibly supportive and helpful."
    },
    {
        name: "Anjali Singh",
        role: "Data Scientist @ Future Solutions",
        avatar: "https://picsum.photos/seed/anjali/80/80",
        testimonial: "I never missed a single campus event thanks to the real-time notifications. The workshops were amazing for skill-building. Highly recommended!"
    }
]

// Animation definitions for the 'framer-motion' library.
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const MotionCard = motion(Card);

// A reusable component for displaying a feature card.
const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => {
    return (
        <MotionCard
            variants={fadeIn}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="feature-card h-full"
        >
            <CardHeader className="flex flex-row items-center gap-4 p-4 bg-primary text-primary-foreground">
              {feature.icon}
              <CardTitle className="text-lg font-headline text-primary-foreground">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-4">
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </CardContent>
        </MotionCard>
    );
};

// This is the main landing page for the application.
export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  // Navigate to a new page and show a loading screen.
  const handleLinkClick = (path: string, id: string) => {
    setLoading(id);
    // A small timeout lets the user see the loading animation.
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Loading overlay for page transitions. */}
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

      <main className="flex-1 overflow-x-hidden">
         {/* The main title and call-to-action section. */}
         <motion.section 
            className="py-20 md:py-32"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
          <div className="container text-center">
            <motion.div variants={fadeIn} className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl font-headline">
                The All-In-One Platform for Your Campus Life
              </h1>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                Connect, collaborate, and conquer your college journey. From placements to discussions, we've got you covered.
              </p>
            </motion.div>
            <motion.div variants={fadeIn} className="flex flex-wrap justify-center gap-4 mt-8">
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
            </motion.div>
          </div>
        </motion.section>
        
        {/* A special feature highlight for the placement prep tool. */}
        <motion.section 
          id="quick-prep" 
          className="bg-secondary/50 py-20 my-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
            <div className="container text-center">
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
        </motion.section>

        {/* This section displays the main features as a grid of cards. */}
        <motion.section 
          id="features" 
          className="container my-20"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="mx-auto flex flex-col items-center gap-4 text-center mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight font-headline">Everything You Need, in One Place</h2>
              <p className="text-muted-foreground max-w-2xl">
                CampusConnect integrates every aspect of your academic and social life into a single, seamless experience.
              </p>
            </div>
          </motion.div>
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
          >
            {features.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
            ))}
          </motion.div>
        </motion.section>
        
        {/* This section shows quotes from students as social proof. */}
        <motion.section 
          id="testimonials" 
          className="my-20 py-24 bg-secondary/50"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
            <div className="container">
                <motion.div variants={fadeIn} className="mx-auto flex flex-col items-center gap-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight font-headline">From Our Students</h2>
                    <p className="text-muted-foreground max-w-2xl">
                        See how CampusConnect is helping students achieve their goals.
                    </p>
                </motion.div>
                <motion.div 
                  className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                  variants={staggerContainer}
                  >
                    {testimonials.map((testimonial) => (
                         <MotionCard key={testimonial.name} variants={fadeIn} className="bg-card p-6 flex flex-col justify-center items-center text-center h-full">
                              <CardHeader className="p-0 items-center">
                                  <Avatar className="w-20 h-20 mb-4 border-2 border-primary">
                                      <AvatarImage src={testimonial.avatar} />
                                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                              </CardHeader>
                              <CardContent className="pt-4">
                                  <div className="flex justify-center mb-4 text-yellow-400">
                                      {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                  </div>
                                  <p className="text-muted-foreground text-sm italic">&quot;{testimonial.testimonial}&quot;</p>
                              </CardContent>
                          </MotionCard>
                    ))}
                </motion.div>
            </div>
        </motion.section>

      </main>

      {/* The footer contains navigation and social media links. */}
      <motion.footer 
        className="py-12 md:py-16 border-t border-border/40 bg-secondary/30"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <div className="container grid gap-8 md:grid-cols-5">
            <div className="md:col-span-2">
                <Link href="/" className="flex items-center space-x-2 mb-4">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-bold text-2xl font-headline">CampusConnect</span>
                </Link>
                <p className="text-muted-foreground max-w-sm mb-4">
                    Bringing campus communities together through innovative digital experiences.
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
      </motion.footer>
    </div>
  );
}
