import React from 'react';
import './globals.css';
import '../styles/accessibility.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/features/auth';
import { PerplexityLayout } from '@/components/layout/perplexity-layout';
import { SkipToContentLink, AccessibilityStatus } from '@/components/ui/medical-accessibility';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Curie - AI Medical Imaging Platform',
  description: 'Perplexity-style AI-powered medical imaging search and analysis platform for healthcare professionals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`min-h-screen bg-background font-sans antialiased perplexity-scrollbar ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="dark"
        >
          <AuthProvider>
            <SkipToContentLink />
            <PerplexityLayout>
              <div id="main-content">
                {children}
              </div>
            </PerplexityLayout>
            <AccessibilityStatus />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}