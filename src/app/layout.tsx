
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { Analytics } from "@vercel/analytics/react"
import { FirebaseClientProvider } from '@/firebase';

// This function downloads the 'Inter' font at build time and hosts it locally.
// This is faster than fetching it from Google Fonts on every page load.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // We create a CSS variable to easily use this font.
});

// This is the root layout for the entire application.
// It wraps every page with essential components like the theme switcher
// and notification system (Toaster).
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* The ThemeProvider handles switching between light and dark mode. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* The FirebaseClientProvider ensures Firebase is available to the entire app. */}
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          {/* The Toaster component is where all popup notifications appear. */}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
