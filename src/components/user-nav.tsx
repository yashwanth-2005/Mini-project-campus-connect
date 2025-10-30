
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
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"
import { Skeleton } from "./ui/skeleton"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  // Handles the user logout process using Firebase's `signOut` function.
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirects the user to the homepage after a successful logout.
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }

  // Shows a loading skeleton while the user's authentication state is being checked.
  if (isUserLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />
  }
  
  // If no user is logged in, this component doesn't render anything.
  // The main login button is handled by the page layout.
  if (!user) {
     return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={user.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.uid}`} alt={user.displayName || "User"} />
            <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
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
