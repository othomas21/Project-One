/**
 * @file skeleton.tsx
 * @description Enhanced skeleton loader components for medical applications
 * @module components/ui
 * 
 * Key responsibilities:
 * - Skeleton loaders for search results
 * - Medical image placeholder skeletons
 * - AI processing indicators
 * - Upload progress placeholders
 * 
 * @reftools Verified against: React 18+ patterns, Tailwind CSS v3.x
 * @author Claude Code
 * @created 2025-08-14
 */

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Medical search result skeleton
function SearchResultSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-md" /> {/* Thumbnail placeholder */}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-3 w-[180px]" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Medical image viewer skeleton
function MedicalImageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      
      <div className="relative">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading medical image...</p>
          </div>
        </div>
      </div>
      
      {/* Image controls skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

// AI Analysis skeleton
function AIAnalysisSkeleton() {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <Skeleton className="h-4 w-[120px]" />
      </div>
      
      <div className="space-y-3">
        <div>
          <Skeleton className="h-4 w-[100px] mb-2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[80%]" />
          <Skeleton className="h-3 w-[60%]" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-[140px] mb-2" />
          <div className="flex gap-1 flex-wrap">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
        
        <div>
          <Skeleton className="h-4 w-[120px] mb-2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[90%]" />
        </div>
      </div>
    </div>
  )
}

// Upload progress skeleton
function UploadProgressSkeleton() {
  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-4 w-[50px]" />
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between text-sm">
          <Skeleton className="h-3 w-[80px]" />
          <Skeleton className="h-3 w-[60px]" />
        </div>
      </div>
      
      {/* File info */}
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-3 w-[120px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </div>
    </div>
  )
}

// Dashboard cards skeleton
function DashboardCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-4 w-4" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
      
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
    </div>
  )
}

// Grid of search results skeleton
function SearchResultsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SearchResultSkeleton key={i} />
      ))}
    </div>
  )
}

export { 
  Skeleton,
  SearchResultSkeleton,
  SearchResultsGridSkeleton,
  MedicalImageSkeleton,
  AIAnalysisSkeleton,
  UploadProgressSkeleton,
  DashboardCardSkeleton
}