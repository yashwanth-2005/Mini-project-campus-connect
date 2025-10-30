
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter } from 'next/font/google';

// Configures the Inter font for optimized loading with Next.js.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// This is the root layout for the entire application.
// It wraps every page with essential providers like themes and notifications.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
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
