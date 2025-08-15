/**
 * @file perplexity-layout.tsx
 * @description Curie Radiology AI Clinical Co-Pilot Layout
 * @module components/layout
 * 
 * Key responsibilities:
 * - Clinical workflow navigation sidebar
 * - Professional radiology interface design
 * - Evidence-based content presentation
 * - HIPAA-compliant layout structure
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PerplexitySidebar } from './perplexity-sidebar';
import { cn } from '@/lib/utils';

interface PerplexityLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function PerplexityLayout({ 
  children, 
  showSidebar = true, 
  className 
}: PerplexityLayoutProps) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string>('search');

  // Determine active navigation item based on current path
  useEffect(() => {
    if (pathname.includes('/search')) {
      setActiveItem('search');
    } else if (pathname.includes('/dashboard')) {
      setActiveItem('discover');
    } else if (pathname.includes('/upload')) {
      setActiveItem('spaces');
    } else if (pathname.includes('/analysis')) {
      setActiveItem('analysis');
    } else if (pathname.includes('/vitals')) {
      setActiveItem('vitals');
    } else {
      setActiveItem('search'); // Default
    }
  }, [pathname]);

  // Check if current route should hide sidebar (auth pages, etc.)
  const shouldHideSidebar = pathname.includes('/auth') || !showSidebar;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      {!shouldHideSidebar && (
        <PerplexitySidebar 
          activeItem={activeItem}
          onItemClick={setActiveItem}
        />
      )}
      
      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 min-h-screen",
          !shouldHideSidebar && "ml-20",
          className
        )}
        role="main"
      >
        <div className="perplexity-scrollbar h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}