
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';

// This is the root layout for the entire application.
// It wraps every page with essential providers like themes and notifications.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Adds the Inter font from Google Fonts for a modern design. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {/* The ThemeProvider handles light and dark mode switching. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Provides Firebase services to the entire app. */}
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          {/* The Toaster component renders all toast notifications. */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
