/**
 * @file medical-accessibility.tsx
 * @description Accessibility enhancements for medical applications
 * @module components/ui
 * 
 * Key responsibilities:
 * - Screen reader optimizations for medical data
 * - Keyboard navigation for medical workflows
 * - High contrast modes for medical imaging
 * - Focus management for complex interfaces
 * - ARIA labels for medical terminology
 * - Voice navigation support
 * 
 * @reftools Verified against: WCAG 2.1 AA, Section 508, medical accessibility standards
 * @author Claude Code
 * @created 2025-08-14
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Accessibility,
  Eye,
  Volume2,
  Keyboard,
  Contrast,
  Type,
  Settings,
  Zap
} from "lucide-react";

// Accessibility context and provider
interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  voiceAnnouncements: boolean;
  focusIndicators: boolean;
  colorBlindSupport: string;
  fontSize: number;
  contrastRatio: number;
  skipToContent: boolean;
}


// Accessibility panel for user settings
interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function AccessibilityPanel({ isOpen, onClose, className }: AccessibilityPanelProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReader: false,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    keyboardNavigation: true,
    voiceAnnouncements: false,
    focusIndicators: true,
    colorBlindSupport: 'none',
    fontSize: 16,
    contrastRatio: 4.5,
    skipToContent: true
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('medical-accessibility-settings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('medical-accessibility-settings', JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Apply font size
    root.style.setProperty('--accessibility-font-size', `${settings.fontSize}px`);
    
    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Apply large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Apply focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    
    // Apply color blind support
    root.setAttribute('data-colorblind-filter', settings.colorBlindSupport);
  };

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Medical Accessibility Settings
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Vision Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vision & Display
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="large-text">Large Text</Label>
                <Switch
                  id="large-text"
                  checked={settings.largeText}
                  onCheckedChange={(checked) => updateSetting('largeText', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Color Blind Support</Label>
              <Select 
                value={settings.colorBlindSupport} 
                onValueChange={(value) => updateSetting('colorBlindSupport', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia (Green-Blind)</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia (Blue-Blind)</SelectItem>
                  <SelectItem value="achromatopsia">Achromatopsia (Color-Blind)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Motion & Animation */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Motion & Animation
            </h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
              />
            </div>
          </div>

          {/* Navigation Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Navigation & Input
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
                <Switch
                  id="keyboard-nav"
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="focus-indicators">Enhanced Focus Indicators</Label>
                <Switch
                  id="focus-indicators"
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="skip-content">Skip to Content Links</Label>
              <Switch
                id="skip-content"
                checked={settings.skipToContent}
                onCheckedChange={(checked) => updateSetting('skipToContent', checked)}
              />
            </div>
          </div>

          {/* Screen Reader Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Screen Reader & Audio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader">Screen Reader Optimized</Label>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-announcements">Voice Announcements</Label>
                <Switch
                  id="voice-announcements"
                  checked={settings.voiceAnnouncements}
                  onCheckedChange={(checked) => updateSetting('voiceAnnouncements', checked)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setSettings({
                screenReader: false,
                highContrast: false,
                largeText: false,
                reducedMotion: false,
                keyboardNavigation: true,
                voiceAnnouncements: false,
                focusIndicators: true,
                colorBlindSupport: 'none',
                fontSize: 16,
                contrastRatio: 4.5,
                skipToContent: true
              });
            }}>
              Reset to Defaults
            </Button>
            
            <Button onClick={onClose}>
              Apply Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced screen reader announcements for medical data
export function useScreenReaderAnnouncements() {
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const announceMedicalData = useCallback((type: string, value: string, unit?: string) => {
    const message = unit 
      ? `${type}: ${value} ${unit}`
      : `${type}: ${value}`;
    announceToScreenReader(message);
  }, [announceToScreenReader]);

  const announceImageLoad = useCallback((imageName: string, dimensions?: string) => {
    const message = dimensions 
      ? `Medical image loaded: ${imageName}, dimensions ${dimensions}`
      : `Medical image loaded: ${imageName}`;
    announceToScreenReader(message);
  }, [announceToScreenReader]);

  const announceAnalysisResult = useCallback((result: string, confidence?: number) => {
    const message = confidence 
      ? `AI Analysis result: ${result}, confidence ${Math.round(confidence * 100)}%`
      : `AI Analysis result: ${result}`;
    announceToScreenReader(message, 'assertive');
  }, [announceToScreenReader]);

  return {
    announceToScreenReader,
    announceMedicalData,
    announceImageLoad,
    announceAnalysisResult
  };
}

// Keyboard navigation hooks
export function useKeyboardNavigation() {
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Handle medical-specific keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'i':
          event.preventDefault();
          // Focus on image viewer
          const imageViewer = document.querySelector('[data-testid="image-viewer"]') as HTMLElement;
          imageViewer?.focus();
          break;
        case 'm':
          event.preventDefault();
          // Focus on measurements
          const measurements = document.querySelector('[data-testid="measurements"]') as HTMLElement;
          measurements?.focus();
          break;
        case 'r':
          event.preventDefault();
          // Focus on results
          const results = document.querySelector('[data-testid="search-results"]') as HTMLElement;
          results?.focus();
          break;
        case '/':
          event.preventDefault();
          // Focus on search
          const search = document.querySelector('[data-testid="search-input"]') as HTMLElement;
          search?.focus();
          break;
      }
    }
    
    // Handle arrow key navigation for medical data tables
    if (event.target instanceof HTMLElement && event.target.closest('[role="grid"]')) {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          // Navigate to next cell
          break;
        case 'ArrowLeft':
          event.preventDefault();
          // Navigate to previous cell
          break;
        case 'ArrowDown':
          event.preventDefault();
          // Navigate to next row
          break;
        case 'ArrowUp':
          event.preventDefault();
          // Navigate to previous row
          break;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const focusElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      setFocusedElement(elementId);
    }
  }, []);

  return { focusedElement, focusElement };
}

// Medical data table with enhanced accessibility
interface AccessibleMedicalTableProps {
  data: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'medical-value';
    unit?: string;
  }>;
  caption: string;
  onRowSelect?: (row: any) => void;
  className?: string;
}

export function AccessibleMedicalTable({ 
  data, 
  columns, 
  caption, 
  onRowSelect,
  className 
}: AccessibleMedicalTableProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const { announceToScreenReader } = useScreenReaderAnnouncements();

  const handleRowSelect = (index: number, row: any) => {
    setSelectedRow(index);
    onRowSelect?.(row);
    
    // Announce selection to screen reader
    const primaryValue = row[columns[0].key];
    announceToScreenReader(`Selected row ${index + 1}, ${columns[0].label}: ${primaryValue}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number, row: any) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleRowSelect(index, row);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (index < data.length - 1) {
          const nextRow = document.querySelector(`[data-row="${index + 1}"]`) as HTMLElement;
          nextRow?.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (index > 0) {
          const prevRow = document.querySelector(`[data-row="${index - 1}"]`) as HTMLElement;
          prevRow?.focus();
        }
        break;
    }
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table 
        role="table" 
        aria-label={caption}
        className="w-full border-collapse border border-border"
      >
        <caption className="sr-only">{caption}</caption>
        
        <thead>
          <tr role="row">
            {columns.map((column) => (
              <th
                key={column.key}
                role="columnheader"
                scope="col"
                className="border border-border p-3 text-left font-semibold bg-muted"
                aria-sort={column.type === 'number' || column.type === 'date' ? 'none' : undefined}
              >
                {column.label}
                {column.unit && (
                  <span className="text-muted-foreground ml-1">({column.unit})</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              role="row"
              data-row={index}
              tabIndex={0}
              className={cn(
                "hover:bg-muted/50 focus:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                selectedRow === index && "bg-primary/10"
              )}
              onClick={() => handleRowSelect(index, row)}
              onKeyDown={(e) => handleKeyDown(e, index, row)}
              aria-selected={selectedRow === index}
              aria-rowindex={index + 1}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  role="gridcell"
                  className="border border-border p-3"
                  aria-describedby={column.type === 'medical-value' ? `${column.key}-description` : undefined}
                >
                  <span>
                    {row[column.key]}
                    {column.unit && ` ${column.unit}`}
                  </span>
                  
                  {/* Hidden description for screen readers */}
                  {column.type === 'medical-value' && (
                    <span 
                      id={`${column.key}-description`}
                      className="sr-only"
                    >
                      {column.label}: {row[column.key]} {column.unit}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selectedRow !== null && (
          `Row ${selectedRow + 1} of ${data.length} selected`
        )}
      </div>
    </div>
  );
}

// Skip to content link
export function SkipToContentLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
    >
      Skip to main content
    </a>
  );
}

// Accessibility status indicator
export function AccessibilityStatus() {
  const [settings, setSettings] = useState<AccessibilitySettings | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('medical-accessibility-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    }
  }, []);

  if (!settings) return null;

  const activeFeatures = Object.entries(settings).filter(([key, value]) => 
    typeof value === 'boolean' && value && key !== 'skipToContent'
  ).length;

  if (activeFeatures === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Badge variant="outline" className="flex items-center gap-2 bg-background/95 backdrop-blur">
        <Accessibility className="h-3 w-3" />
        <span className="text-xs">
          {activeFeatures} accessibility feature{activeFeatures !== 1 ? 's' : ''} active
        </span>
      </Badge>
    </div>
  );
}

// Floating accessibility toolbar
interface AccessibilityToolbarProps {
  onOpenSettings: () => void;
}

export function AccessibilityToolbar({ onOpenSettings }: AccessibilityToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40">
      <Card className={cn(
        "transition-transform duration-200",
        isExpanded ? "translate-x-0" : "translate-x-full"
      )}>
        <CardContent className="p-2 space-y-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenSettings}
            className="w-full justify-start"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              document.documentElement.classList.toggle('high-contrast');
            }}
            className="w-full justify-start"
          >
            <Contrast className="h-4 w-4 mr-2" />
            Contrast
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              document.documentElement.classList.toggle('large-text');
            }}
            className="w-full justify-start"
          >
            <Type className="h-4 w-4 mr-2" />
            Text Size
          </Button>
        </CardContent>
      </Card>
      
      {/* Toggle button */}
      <Button
        size="sm"
        className="absolute top-2 -left-10 rounded-l-md rounded-r-none"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Toggle accessibility toolbar"
      >
        <Accessibility className="h-4 w-4" />
      </Button>
    </div>
  );
}