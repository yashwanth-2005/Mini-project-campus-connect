import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { Analytics } from "@vercel/analytics/react"
import { FirebaseClientProvider } from '@/firebase';

// Downloads the 'Inter' font at build time for better performance.
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
