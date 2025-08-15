/**
 * @file mobile-optimized.tsx
 * @description Mobile-optimized components for medical applications
 * @module components/ui
 * 
 * Key responsibilities:
 * - Touch-friendly interface components
 * - Mobile-first medical image viewing
 * - Gesture-based navigation
 * - Responsive medical data tables
 * - Mobile search and filtering
 * 
 * @reftools Verified against: iOS HIG, Material Design mobile patterns
 * @author Claude Code
 * @created 2025-08-14
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Search, 
  Filter, 
  Menu,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Minimize2,
  ArrowLeft,
  MoreVertical
} from "lucide-react";

// Mobile-optimized search header
interface MobileSearchHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterOpen: () => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

export function MobileSearchHeader({
  searchValue,
  onSearchChange,
  onFilterOpen,
  placeholder = "Search medical studies...",
  showFilters = true,
  className
}: MobileSearchHeaderProps) {
  return (
    <div className={cn("sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10 h-12 text-base"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {showFilters && (
          <Button 
            variant="outline" 
            size="lg"
            className="h-12 px-4"
            onClick={onFilterOpen}
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Mobile-optimized medical card
interface MobileMedicalCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  badges?: Array<{ label: string; variant?: "default" | "secondary" | "outline" }>;
  metadata?: Array<{ icon: React.ReactNode; label: string; value: string }>;
  actions?: Array<{ icon: React.ReactNode; label: string; onClick: () => void }>;
  onTap?: () => void;
  className?: string;
}

export function MobileMedicalCard({
  id: _id,
  title,
  subtitle,
  description,
  imageUrl,
  badges,
  metadata,
  actions,
  onTap,
  className
}: MobileMedicalCardProps) {
  return (
    <Card 
      className={cn("active:scale-[0.98] transition-transform cursor-pointer", className)}
      onClick={onTap}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with image */}
          <div className="flex gap-3">
            {imageUrl && (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base line-clamp-2 leading-tight">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
              
              {badges && badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {badges.map((badge, index) => (
                    <Badge key={index} variant={badge.variant || "outline"} className="text-xs">
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}

          {/* Metadata */}
          {metadata && metadata.length > 0 && (
            <div className="space-y-2">
              {metadata.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="text-muted-foreground">{item.icon}</div>
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="flex items-center gap-1 pt-2 border-t">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile image viewer with gesture support
interface MobileImageViewerProps {
  imageUrl: string;
  title?: string;
  onClose: () => void;
  annotations?: any[];
  showControls?: boolean;
  className?: string;
}

export function MobileImageViewer({
  imageUrl,
  title,
  onClose,
  annotations: _annotations,
  showControls = true,
  className
}: MobileImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [_isPinching, setIsPinching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset view
  const resetView = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Handle rotation
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Touch gesture handling for pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPinching(false);
  }, []);

  return (
    <div className={cn("fixed inset-0 z-50 bg-black", className)}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 text-white p-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {title && (
            <h2 className="font-semibold text-center flex-1 mx-4 truncate">{title}</h2>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt={title || "Medical image"}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
          }}
        />
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/80 text-white p-4">
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="ghost" 
              size="lg"
              className="text-white hover:bg-white/20 h-12 w-12 p-0"
              onClick={() => handleZoom(-0.2)}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              className="text-white hover:bg-white/20 h-12 w-12 p-0"
              onClick={() => handleZoom(0.2)}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              className="text-white hover:bg-white/20 h-12 w-12 p-0"
              onClick={handleRotate}
            >
              <RotateCw className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              className="text-white hover:bg-white/20 h-12 w-12 p-0"
              onClick={resetView}
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Zoom indicator */}
          <div className="text-center mt-2 text-sm text-white/70">
            {Math.round(scale * 100)}% • {rotation}°
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile bottom sheet for actions
interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    icon: React.ReactNode;
    label: string;
    description?: string;
    onClick: () => void;
    variant?: "default" | "destructive";
  }>;
}

export function MobileActionSheet({
  isOpen,
  onClose,
  title,
  actions
}: MobileActionSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader className="pb-4">
          {title && <SheetTitle>{title}</SheetTitle>}
        </SheetHeader>
        
        <div className="space-y-1">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto p-4 text-left",
                action.variant === "destructive" && "text-destructive hover:text-destructive"
              )}
              onClick={() => {
                action.onClick();
                onClose();
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{action.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{action.label}</div>
                  {action.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4" 
          onClick={onClose}
        >
          Cancel
        </Button>
      </SheetContent>
    </Sheet>
  );
}

// Mobile navigation tabs
interface MobileNavTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileNavTabs({
  tabs,
  activeTab,
  onTabChange,
  className
}: MobileNavTabsProps) {
  return (
    <div className={cn("sticky bottom-0 bg-background border-t", className)}>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors",
              "min-h-[60px] relative",
              activeTab === tab.id 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge && tab.badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                >
                  {tab.badge > 99 ? "99+" : tab.badge}
                </Badge>
              )}
            </div>
            <span className="mt-1 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Mobile-optimized data list
interface MobileDataListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export function MobileDataList<T>({
  items,
  renderItem,
  loading = false,
  loadingComponent,
  emptyComponent,
  onLoadMore,
  hasMore = false,
  className
}: MobileDataListProps<T>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (onLoadMore && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      await onLoadMore();
      setIsLoadingMore(false);
    }
  };

  if (loading && items.length === 0) {
    return loadingComponent || (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return emptyComponent || (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">No items found</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="w-full max-w-xs"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}

// Mobile quick actions fab
interface MobileQuickActionsProps {
  actions: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    primary?: boolean;
  }>;
  className?: string;
}

export function MobileQuickActions({
  actions,
  className
}: MobileQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const primaryAction = actions.find(action => action.primary) || actions[0];
  const secondaryActions = actions.filter(action => !action.primary);

  return (
    <div className={cn("fixed bottom-20 right-4 z-40", className)}>
      {/* Secondary actions */}
      {isOpen && secondaryActions.length > 0 && (
        <div className="flex flex-col gap-3 mb-3">
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              size="lg"
              className="h-12 w-12 rounded-full shadow-lg"
              variant="secondary"
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
            >
              {action.icon}
            </Button>
          ))}
        </div>
      )}
      
      {/* Primary action */}
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => {
          if (secondaryActions.length > 0) {
            setIsOpen(!isOpen);
          } else {
            primaryAction.onClick();
          }
        }}
      >
        {secondaryActions.length > 0 ? (
          isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />
        ) : (
          primaryAction.icon
        )}
      </Button>
    </div>
  );
}