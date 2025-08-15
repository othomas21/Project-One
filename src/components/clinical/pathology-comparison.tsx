/**
 * @file pathology-comparison.tsx
 * @description Side-by-side pathology comparison viewer with annotated differentiating features
 * @module components/clinical
 * 
 * Key responsibilities:
 * - Split-screen comparative viewing of medical pathologies
 * - Interactive annotation overlays with key differentiating features
 * - Educational teaching points embedded in images
 * - Advanced image query capabilities (atypical, subtle, mimics)
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

"use client";

import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play,
  Pause,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Eye,
  EyeOff,
  BookOpen,
  Lightbulb,
  Target,
  ArrowRight,
  Info,
  AlertCircle,
  CheckCircle,
  X,
  Maximize,
  Download,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ComparisonMode = 'side-by-side' | 'overlay' | 'slider' | 'sequence';
export type AnnotationType = 'arrow' | 'circle' | 'measurement' | 'text' | 'highlight';
export type ImageType = 'atypical' | 'classic' | 'subtle' | 'mimic' | 'evolution';

export interface PathologyImage {
  id: string;
  title: string;
  url: string;
  type: ImageType;
  modality: string;
  findings: string[];
  keyFeatures: string[];
  differentialPoints: string[];
  teachingPoints: string[];
  metadata: {
    patient?: string;
    age?: number;
    sex?: 'M' | 'F';
    clinicalHistory?: string;
    technique?: string;
  };
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  description: string;
  category: 'differential' | 'teaching' | 'technical';
  color: string;
}

interface PathologyComparisonProps {
  leftImage: PathologyImage;
  rightImage: PathologyImage;
  title: string;
  comparisonType: 'differential' | 'evolution' | 'atypical' | 'mimics';
  className?: string;
}

interface ImageViewerProps {
  image: PathologyImage;
  annotations: Annotation[];
  position: 'left' | 'right';
  onAnnotationToggle: (annotationId: string) => void;
  visibleAnnotations: Set<string>;
  className?: string;
}

interface AnnotationOverlayProps {
  annotation: Annotation;
  isVisible: boolean;
  onToggle: () => void;
}

const IMAGE_TYPE_CONFIG = {
  classic: {
    label: 'Classic Presentation',
    emoji: '📚',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Textbook appearance'
  },
  atypical: {
    label: 'Atypical Presentation',
    emoji: '🔍',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Unusual manifestation'
  },
  subtle: {
    label: 'Subtle Finding',
    emoji: '🎯',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Early or minimal changes'
  },
  mimic: {
    label: 'Mimic/Pitfall',
    emoji: '⚠️',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Commonly confused entity'
  },
  evolution: {
    label: 'Disease Evolution',
    emoji: '📈',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Temporal progression'
  }
} as const;

function AnnotationOverlay({ annotation, isVisible, onToggle }: AnnotationOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${annotation.x}%`,
        top: `${annotation.y}%`,
        width: annotation.width ? `${annotation.width}%` : 'auto',
        height: annotation.height ? `${annotation.height}%` : 'auto',
      }}
    >
      {/* Annotation Marker */}
      <div
        className={cn(
          "relative flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer pointer-events-auto",
          annotation.category === 'differential' && "bg-blue-500 border-blue-600",
          annotation.category === 'teaching' && "bg-green-500 border-green-600",
          annotation.category === 'technical' && "bg-purple-500 border-purple-600"
        )}
        onClick={onToggle}
      >
        <span className="text-white text-xs font-bold">
          {annotation.type === 'arrow' && '→'}
          {annotation.type === 'circle' && '○'}
          {annotation.type === 'highlight' && '★'}
          {annotation.type === 'text' && 'T'}
          {annotation.type === 'measurement' && '📏'}
        </span>
      </div>

      {/* Annotation Label */}
      <div className="absolute left-8 top-0 min-w-max max-w-xs z-10">
        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
          <div className="text-xs font-medium text-white mb-1">
            {annotation.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {annotation.description}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageViewer({ 
  image, 
  annotations, 
  position, 
  onAnnotationToggle, 
  visibleAnnotations, 
  className 
}: ImageViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showAllAnnotations, setShowAllAnnotations] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const typeConfig = IMAGE_TYPE_CONFIG[image.type];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleResetView = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const toggleAllAnnotations = () => {
    setShowAllAnnotations(!showAllAnnotations);
  };

  return (
    <div className={cn("flex flex-col h-full bg-card border border-border rounded-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-white">{image.title}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", typeConfig.color)}>
              {typeConfig.emoji} {typeConfig.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {image.modality}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAllAnnotations}
            className="h-8 px-2 text-xs"
          >
            {showAllAnnotations ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Maximize className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="flex-grow relative overflow-hidden bg-black rounded-b-lg"
      >
        <img
          ref={imageRef}
          src={image.url}
          alt={image.title}
          className="w-full h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom / 100}) translate(${pan.x}px, ${pan.y}px)`,
          }}
        />

        {/* Annotations */}
        {showAllAnnotations && annotations.map((annotation) => (
          <AnnotationOverlay
            key={annotation.id}
            annotation={annotation}
            isVisible={visibleAnnotations.has(annotation.id)}
            onToggle={() => onAnnotationToggle(annotation.id)}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-2 border-t border-border">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-8 px-2">
            <ZoomOut className="w-3 h-3" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
            {zoom}%
          </span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-8 px-2">
            <ZoomIn className="w-3 h-3" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={handleResetView} className="h-8 px-2 text-xs">
          Reset View
        </Button>
      </div>
    </div>
  );
}

export function PathologyComparison({ 
  leftImage, 
  rightImage, 
  title, 
  comparisonType, 
  className 
}: PathologyComparisonProps) {
  const [visibleAnnotations, setVisibleAnnotations] = useState<Set<string>>(new Set());
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('side-by-side');
  const [showTeachingMode, setShowTeachingMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'differential' | 'teaching' | 'technical'>('all');

  // Mock annotations - in real implementation, these would come from the backend
  const leftAnnotations: Annotation[] = [
    {
      id: 'left-1',
      type: 'circle',
      x: 35,
      y: 25,
      width: 8,
      height: 8,
      label: 'Thick Enhancement',
      description: 'Irregular, thick rim enhancement typical of glioblastoma',
      category: 'differential',
      color: '#3b82f6'
    },
    {
      id: 'left-2',
      type: 'arrow',
      x: 60,
      y: 40,
      label: 'Central Necrosis',
      description: 'Extensive central necrosis with heterogeneous signal',
      category: 'differential',
      color: '#3b82f6'
    },
    {
      id: 'left-3',
      type: 'highlight',
      x: 45,
      y: 60,
      label: 'Mass Effect',
      description: 'Significant mass effect with midline shift',
      category: 'teaching',
      color: '#10b981'
    }
  ];

  const rightAnnotations: Annotation[] = [
    {
      id: 'right-1',
      type: 'circle',
      x: 40,
      y: 30,
      width: 6,
      height: 6,
      label: 'Homogeneous Enhancement',
      description: 'Uniform, homogeneous enhancement pattern',
      category: 'differential',
      color: '#3b82f6'
    },
    {
      id: 'right-2',
      type: 'arrow',
      x: 50,
      y: 50,
      label: 'Minimal Necrosis',
      description: 'Little to no central necrosis',
      category: 'differential',
      color: '#3b82f6'
    },
    {
      id: 'right-3',
      type: 'highlight',
      x: 35,
      y: 70,
      label: 'Periventricular',
      description: 'Characteristic periventricular location',
      category: 'teaching',
      color: '#10b981'
    }
  ];

  const handleAnnotationToggle = (annotationId: string) => {
    const newVisible = new Set(visibleAnnotations);
    if (newVisible.has(annotationId)) {
      newVisible.delete(annotationId);
    } else {
      newVisible.add(annotationId);
    }
    setVisibleAnnotations(newVisible);
  };

  const showAllAnnotations = () => {
    const allIds = [...leftAnnotations, ...rightAnnotations].map(a => a.id);
    setVisibleAnnotations(new Set(allIds));
  };

  const hideAllAnnotations = () => {
    setVisibleAnnotations(new Set());
  };

  const getDifferentialSummary = () => {
    const leftKey = leftImage.keyFeatures;
    const rightKey = rightImage.keyFeatures;
    
    return {
      left: leftKey,
      right: rightKey,
      differences: leftImage.differentialPoints
    };
  };

  const summary = getDifferentialSummary();

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">
            Side-by-side comparison with annotated differentiating features
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showTeachingMode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowTeachingMode(!showTeachingMode)}
            className="text-xs"
          >
            <BookOpen className="w-3 h-3 mr-2" />
            Teaching Mode
          </Button>
          
          <Button variant="ghost" size="sm" className="text-xs">
            <Download className="w-3 h-3 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Annotation Controls */}
      <div className="flex items-center justify-between p-3 bg-muted/10 border border-border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={showAllAnnotations}
              className="h-8 px-3 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Show All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={hideAllAnnotations}
              className="h-8 px-3 text-xs"
            >
              <EyeOff className="w-3 h-3 mr-1" />
              Hide All
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Categories:</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs cursor-pointer text-blue-600">
                Differential
              </Badge>
              <Badge variant="outline" className="text-xs cursor-pointer text-green-600">
                Teaching
              </Badge>
              <Badge variant="outline" className="text-xs cursor-pointer text-purple-600">
                Technical
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {visibleAnnotations.size} / {leftAnnotations.length + rightAnnotations.length} annotations visible
        </div>
      </div>

      {/* Main Comparison View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[600px]">
        <ImageViewer
          image={leftImage}
          annotations={leftAnnotations}
          position="left"
          onAnnotationToggle={handleAnnotationToggle}
          visibleAnnotations={visibleAnnotations}
        />
        
        <ImageViewer
          image={rightImage}
          annotations={rightAnnotations}
          position="right"
          onAnnotationToggle={handleAnnotationToggle}
          visibleAnnotations={visibleAnnotations}
        />
      </div>

      {/* Differential Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            {leftImage.title} - Key Features
          </h4>
          <div className="space-y-2">
            {summary.left.map((feature, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            {rightImage.title} - Key Features
          </h4>
          <div className="space-y-2">
            {summary.right.map((feature, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teaching Points */}
      {showTeachingMode && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            Clinical Teaching Points
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-white">Diagnostic Approach:</h5>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {leftImage.teachingPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-white">Key Differentiators:</h5>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {summary.differences.map((diff, index) => (
                  <li key={index}>{diff}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="p-3 bg-muted/10 border border-border rounded">
            <div className="flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-white font-medium">Clinical Correlation:</span>
                <p className="text-muted-foreground text-xs">
                  Consider patient age, clinical presentation, and location when differentiating 
                  between these entities. Additional sequences like perfusion or spectroscopy 
                  may provide further diagnostic confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}