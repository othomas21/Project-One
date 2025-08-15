/**
 * @file perplexity-sidebar.tsx
 * @description Perplexity-style left sidebar navigation
 * @module components/layout
 * 
 * Key responsibilities:
 * - Vertical navigation with icon-based menu
 * - Minimalist dark theme design
 * - Sign-in integration with authentication
 * - Medical application branding
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Globe, 
  FileStack, 
  Plus, 
  LogIn,
  Stethoscope,
  Brain,
  Settings,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: string;
}

export function PerplexitySidebar({ activeItem = 'search', onItemClick }: SidebarProps) {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      id: 'search',
      icon: <Search className="w-5 h-5" />,
      label: 'Search',
      href: '/search'
    },
    {
      id: 'discover',
      icon: <Globe className="w-5 h-5" />,
      label: 'Discover',
      href: '/dashboard'
    },
    {
      id: 'spaces',
      icon: <FileStack className="w-5 h-5" />,
      label: 'Cases',
      href: '/upload'
    },
    {
      id: 'analysis',
      icon: <Brain className="w-5 h-5" />,
      label: 'AI Analysis',
      href: '/analysis'
    },
    {
      id: 'vitals',
      icon: <Activity className="w-5 h-5" />,
      label: 'Vitals',
      href: '/vitals'
    }
  ];

  const handleNavClick = (item: NavItem) => {
    onItemClick?.(item.id);
    router.push(item.href);
  };

  const handleAddClick = () => {
    router.push('/upload');
  };

  const handleSignInClick = () => {
    router.push('/auth/login');
  };

  return (
    <aside className="perplexity-sidebar">
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <Stethoscope className="w-6 h-6 text-primary" />
        </div>
        <div className="text-xs font-semibold text-white/80 tracking-wide">
          CURIE
        </div>
      </div>

      {/* Add Button */}
      <button 
        onClick={handleAddClick}
        className="perplexity-add-button group"
        title="Upload Medical Images"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Navigation Icons */}
      <nav className="flex flex-col items-center space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            className={cn(
              "perplexity-nav-icon group relative",
              activeItem === item.id && "active"
            )}
            title={item.label}
          >
            {item.icon}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {item.label}
            </span>
            
            {/* Hover tooltip */}
            {hoveredItem === item.id && (
              <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <button 
        className="perplexity-nav-icon mb-4"
        title="Settings"
        onClick={() => router.push('/settings')}
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </button>

      {/* Sign In */}
      <button 
        onClick={handleSignInClick}
        className="perplexity-signin group"
        title="Sign In"
      >
        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <LogIn className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="font-medium">Sign In</span>
      </button>
    </aside>
  );
}