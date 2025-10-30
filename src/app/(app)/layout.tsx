'use client';

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Calendar,
  FolderKanban,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  User,
  Shield,
  Bot,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { UserNav } from "@/components/user-nav";
import Chatbot from "@/components/chatbot";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

// This array defines all possible navigation items in the sidebar.
const allNavItems = [
  { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard", role: ['student', 'faculty'] },
  { href: "/profile", icon: <User />, label: "Profile", role: ['student', 'faculty'] },
  { href: "/placements", icon: <Briefcase />, label: "Placement Corner", role: ['student', 'faculty'] },
  { href: "/announcements", icon: <Megaphone />, label: "Announcements", role: ['student', 'faculty'] },
  { href: "/events", icon: <Calendar />, label: "Events", role: ['student', 'faculty'] },
  { href: "/forum", icon: <MessageSquare />, label: "Forum", role: ['student', 'faculty'] },
  { href: "/resources", icon: <FolderKanban />, label: "Resource Hub", role: ['student', 'faculty'] },
  { href: "/admin", icon: <Shield />, label: "Admin Panel", role: ['faculty'] },
];

// This is the main layout component for the authenticated part of the app.
function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const role = searchParams.get('role') || 'student';
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // We filter the navigation items based on the user's role, which we get from the URL.
  const navItems = allNavItems.filter(item => item.role.includes(role));

  // This function shows a loading screen to make page transitions feel smoother.
  const handleLinkClick = (href: string) => {
    // Only show loader if navigating to a different page.
    if (pathname !== href) {
      setIsLoading(true);
    }
  };

  // When a new page finishes loading, we hide the loading screen.
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  return (
    <SidebarProvider>
      {/* This is the full-screen loading overlay. It appears during page navigation. */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-150">
          <div className="flex flex-col items-center gap-4">
            <Logo className="h-16 w-16 text-primary animate-pulse-grow" />
            <p className="text-muted-foreground">Connecting you...</p>
          </div>
        </div>
      )}
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-6 text-primary" />
            <span className="text-lg font-semibold font-headline">CampusConnect</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href} onClick={() => handleLinkClick(item.href)}>
                <Link href={`${item.href}?role=${role}`} passHref prefetch>
                  <SidebarMenuButton tooltip={item.label} isActive={pathname === item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1">
              {/* This space can be used for breadcrumbs or other header content. */}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsChatOpen(true)} className="font-bold rainbow-button text-white">
                <Bot className="mr-2 h-4 w-4" />
                <span>Ask me anything?</span>
              </Button>
              <ThemeToggle />
              <div className="hidden md:block">
                <UserNav />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
        <Chatbot isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}

// We use React Suspense here to handle the initial loading of URL parameters gracefully.
// This prevents the page from rendering with incorrect roles or data.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={<div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"><Logo className="h-16 w-16 text-primary animate-pulse-grow" /></div>}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </React.Suspense>
  )
}
