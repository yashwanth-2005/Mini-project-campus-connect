
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';

// This function from Next.js downloads the 'Inter' font at build time and hosts it locally.
// This is faster than fetching it from Google Fonts every time the page loads.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // We create a CSS variable to easily use this font.
});

// This is the root layout for the entire application.
// It wraps every single page with essential components like the theme switcher
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
          {children}
          {/* The Toaster component is where all popup notifications will be rendered. */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
