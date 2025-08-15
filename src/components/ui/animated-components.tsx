/**
 * @file animated-components.tsx
 * @description Animated components for medical application with smooth transitions
 * @module components/ui
 * 
 * Key responsibilities:
 * - Smooth hover and focus transitions
 * - Medical-appropriate animations
 * - Performance-optimized animations
 * - Accessibility-respecting animations
 * 
 * @reftools Verified against: Framer Motion best practices, CSS transforms
 * @author Claude Code
 * @created 2025-08-14
 */

"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Enhanced card with hover animations
interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  press?: boolean;
  scale?: number;
  children: React.ReactNode;
}

export function AnimatedCard({ 
  hover = true, 
  press = true, 
  scale = 1.02,
  className, 
  children, 
  ...props 
}: AnimatedCardProps) {
  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out",
        hover && "hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1",
        press && "active:scale-[0.98] active:shadow-sm",
        "focus-within:ring-2 focus-within:ring-primary/20",
        className
      )}
      style={{
        transformOrigin: "center",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Fade in animation component
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 300, className }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Slide in from direction
interface SlideInProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
}

export function SlideIn({ 
  children, 
  direction = "up", 
  delay = 0, 
  duration = 400,
  className 
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getInitialTransform = () => {
    switch (direction) {
      case "left": return "translate-x-8 opacity-0";
      case "right": return "-translate-x-8 opacity-0";
      case "up": return "translate-y-8 opacity-0";
      case "down": return "-translate-y-8 opacity-0";
      default: return "translate-y-8 opacity-0";
    }
  };

  return (
    <div
      className={cn(
        "transition-all ease-out",
        isVisible ? "translate-x-0 translate-y-0 opacity-100" : getInitialTransform(),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Staggered children animation
interface StaggeredChildrenProps {
  children: React.ReactNode[];
  delay?: number;
  stagger?: number;
  className?: string;
}

export function StaggeredChildren({ 
  children, 
  delay = 0, 
  stagger = 100,
  className 
}: StaggeredChildrenProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={delay + (index * stagger)}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

// Pulse animation for loading or attention
interface PulseProps {
  children: React.ReactNode;
  intensity?: "light" | "medium" | "strong";
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

export function Pulse({ children, intensity = "medium", speed = "normal", className }: PulseProps) {
  const getIntensityClass = () => {
    switch (intensity) {
      case "light": return "animate-pulse";
      case "medium": return "animate-pulse";
      case "strong": return "animate-ping";
      default: return "animate-pulse";
    }
  };

  const getSpeedClass = () => {
    switch (speed) {
      case "slow": return "[animation-duration:2s]";
      case "normal": return "[animation-duration:1s]";
      case "fast": return "[animation-duration:0.5s]";
      default: return "";
    }
  };

  return (
    <div className={cn(getIntensityClass(), getSpeedClass(), className)}>
      {children}
    </div>
  );
}

// Smooth expand/collapse
interface ExpandProps {
  isExpanded: boolean;
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export function Expand({ isExpanded, children, duration = 300, className }: ExpandProps) {
  return (
    <div
      className={cn(
        "overflow-hidden transition-all ease-out",
        className
      )}
      style={{
        maxHeight: isExpanded ? "1000px" : "0px",
        transitionDuration: `${duration}ms`,
      }}
    >
      <div className="py-2">
        {children}
      </div>
    </div>
  );
}

// Medical-specific loading spinner
export function MedicalSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
      </div>
    </div>
  );
}

// Progress bar with smooth animation
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: "primary" | "success" | "warning" | "danger";
}

export function AnimatedProgress({ 
  value, 
  max = 100, 
  className,
  showPercentage = false,
  color = "primary"
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClasses = () => {
    switch (color) {
      case "success": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "danger": return "bg-red-500";
      default: return "bg-primary";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            getColorClasses()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-muted-foreground text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

// Floating action button with bounce
interface FloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function FloatingButton({ children, className, ...props }: FloatingButtonProps) {
  return (
    <button
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "bg-primary text-primary-foreground",
        "rounded-full p-4 shadow-lg",
        "transition-all duration-200 ease-out",
        "hover:scale-110 hover:shadow-xl hover:-translate-y-1",
        "active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Medical badge with gentle glow
interface MedicalBadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  glow?: boolean;
  className?: string;
}

export function MedicalBadge({ 
  children, 
  variant = "primary", 
  glow = false,
  className 
}: MedicalBadgeProps) {
  const getVariantClasses = () => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full transition-all duration-200";
    
    switch (variant) {
      case "success":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200 ${glow ? 'shadow-green-200/50 shadow-md' : ''}`;
      case "warning":
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200 ${glow ? 'shadow-yellow-200/50 shadow-md' : ''}`;
      case "danger":
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200 ${glow ? 'shadow-red-200/50 shadow-md' : ''}`;
      case "info":
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200 ${glow ? 'shadow-blue-200/50 shadow-md' : ''}`;
      default:
        return `${baseClasses} bg-primary/10 text-primary border border-primary/20 ${glow ? 'shadow-primary/20 shadow-md' : ''}`;
    }
  };

  return (
    <span className={cn(getVariantClasses(), className)}>
      {children}
    </span>
  );
}

// Respect user's motion preferences
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}