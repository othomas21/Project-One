"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Search, Bell, User, Brain, FileImage, Upload, Accessibility } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccessibilityPanel, AccessibilityToolbar } from '@/components/ui/medical-accessibility';

export function Header() {
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-theme" role="banner">
      <div className="container flex h-14 items-center">
        {/* Logo and Brand */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Curie</span>
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="mr-4 flex md:hidden">
          <Link href="/" className="flex items-center">
            <Brain className="h-6 w-6 text-primary" />
          </Link>
        </div>

        {/* Navigation Menu */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Search</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/search"
                      >
                        <FileImage className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Image Search
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Search through medical imaging database with AI-powered analysis
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/search/xray" title="X-Ray Analysis">
                    Analyze chest X-rays and detect abnormalities
                  </ListItem>
                  <ListItem href="/search/ct" title="CT Scans">
                    Search and analyze CT scan images
                  </ListItem>
                  <ListItem href="/search/mri" title="MRI Studies">
                    MRI image analysis and comparison
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger>Analytics</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/analytics/dashboard" title="Dashboard">
                    View search analytics and usage statistics
                  </ListItem>
                  <ListItem href="/analytics/reports" title="Reports">
                    Generate detailed analysis reports
                  </ListItem>
                  <ListItem href="/analytics/trends" title="Trends">
                    Discover patterns in medical imaging data
                  </ListItem>
                  <ListItem href="/analytics/export" title="Export">
                    Export data and analysis results
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Upload</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/upload"
                      >
                        <Upload className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Medical Upload
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Upload DICOM files and medical images with secure storage
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/upload/dicom" title="DICOM Upload">
                    Upload and process DICOM medical files
                  </ListItem>
                  <ListItem href="/upload/batch" title="Batch Upload">
                    Upload multiple images simultaneously
                  </ListItem>
                  <ListItem href="/upload/convert" title="Format Convert">
                    Convert between medical image formats
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Search Bar */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/search">
              <Button
                variant="outline"
                className="inline-flex items-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
              >
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline-flex">Search medical images...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </Link>
          </div>

          {/* User Actions */}
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 px-0"
              onClick={() => setShowAccessibilityPanel(true)}
              aria-label="Open accessibility settings"
            >
              <Accessibility className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </nav>
        </div>
      </div>
    </header>

    {/* Accessibility Panel */}
    <AccessibilityPanel 
      isOpen={showAccessibilityPanel} 
      onClose={() => setShowAccessibilityPanel(false)} 
    />
    
    {/* Accessibility Toolbar */}
    <AccessibilityToolbar onOpenSettings={() => setShowAccessibilityPanel(true)} />
  </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"