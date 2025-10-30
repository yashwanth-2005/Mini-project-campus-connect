
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { findUserById, User } from "@/lib/mock-db"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Skeleton } from "./ui/skeleton"

export function UserNav() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In our mock setup, the logged-in user's ID is stored in localStorage.
    // We retrieve it here to fetch the full user profile.
    const loggedInUserId = localStorage.getItem('loggedInUser');
    if (loggedInUserId) {
        const profile = findUserById(loggedInUserId);
        setUserProfile(profile);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    // Clear the logged-in user state and redirect to the landing page.
    localStorage.removeItem('loggedInUser');
    setUserProfile(null);
    router.push('/');
  }

  // Show a skeleton loader while we check for a logged-in user.
  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />
  }
  
  // If no user is found, show a login button.
  if (!userProfile) {
     return (
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={userProfile.profilePicture || `https://api.dicebear.com/8.x/bottts/svg?seed=${userProfile.usn}`} alt={userProfile.fullName} />
            <AvatarFallback>{userProfile.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userProfile.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile" passHref>
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
