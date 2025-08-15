import React from 'react';
import Link from 'next/link';
import { Brain } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t transition-theme">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Brain className="h-6 w-6" />
          <p className="text-center text-sm leading-loose md:text-left">
            Built for medical professionals. Powered by AI.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-6 md:px-0">
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/support"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}