/**
 * @file evidence-hierarchy.tsx
 * @description Evidence hierarchy system for clinical recommendations
 * @module components/clinical
 * 
 * Key responsibilities:
 * - Display ranked evidence levels for clinical information
 * - Visual evidence badges with hierarchy indicators
 * - Source verification and citation components
 * - Trust indicators for medical recommendations
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Award, 
  BookOpen, 
  Microscope, 
  BarChart3, 
  User, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type EvidenceLevel = 
  | 'acr-guidelines'
  | 'landmark-study'
  | 'textbook-reference'
  | 'review-article'
  | 'case-series'
  | 'expert-opinion';

export type EvidenceStrength = 'strong' | 'moderate' | 'weak';

export interface EvidenceSource {
  id: string;
  level: EvidenceLevel;
  title: string;
  authors?: string;
  publication: string;
  year: number;
  url?: string;
  strength: EvidenceStrength;
  description: string;
  keyFindings?: string[];
}

interface EvidenceHierarchyProps {
  sources: EvidenceSource[];
  recommendation: string;
  confidence: number; // 0-100
  className?: string;
}

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  strength: EvidenceStrength;
  className?: string;
}

const EVIDENCE_CONFIG = {
  'acr-guidelines': {
    icon: Building,
    label: 'ACR Guidelines',
    emoji: '🏛️',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hierarchy: 1
  },
  'landmark-study': {
    icon: Award,
    label: 'Landmark Study',
    emoji: '🏆',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hierarchy: 2
  },
  'textbook-reference': {
    icon: BookOpen,
    label: 'Textbook Reference',
    emoji: '📚',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hierarchy: 3
  },
  'review-article': {
    icon: Microscope,
    label: 'Review Article',
    emoji: '🔬',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hierarchy: 4
  },
  'case-series': {
    icon: BarChart3,
    label: 'Case Series',
    emoji: '📊',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hierarchy: 5
  },
  'expert-opinion': {
    icon: User,
    label: 'Expert Opinion',
    emoji: '📝',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hierarchy: 6
  }
} as const;

export function EvidenceBadge({ level, strength, className }: EvidenceBadgeProps) {
  const config = EVIDENCE_CONFIG[level];
  const Icon = config.icon;

  const strengthIndicator = {
    strong: { color: 'text-green-600', label: 'Strong' },
    moderate: { color: 'text-yellow-600', label: 'Moderate' },
    weak: { color: 'text-red-600', label: 'Weak' }
  }[strength];

  return (
    <div className={cn("flex items-center gap-2 p-2 rounded-lg border", config.bgColor, config.borderColor, className)}>
      <div className="flex items-center gap-2">
        <span className="text-base">{config.emoji}</span>
        <Icon className={cn("w-4 h-4", config.textColor)} />
        <span className={cn("text-xs font-medium", config.textColor)}>
          {config.label}
        </span>
      </div>
      <Badge variant="outline" className={cn("text-xs", strengthIndicator.color)}>
        {strengthIndicator.label}
      </Badge>
    </div>
  );
}

export function EvidenceHierarchy({ sources, recommendation, confidence, className }: EvidenceHierarchyProps) {
  const sortedSources = [...sources].sort((a, b) => 
    EVIDENCE_CONFIG[a.level].hierarchy - EVIDENCE_CONFIG[b.level].hierarchy
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return CheckCircle;
    if (confidence >= 70) return AlertTriangle;
    return Info;
  };

  const ConfidenceIcon = getConfidenceIcon(confidence);

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 space-y-6", className)}>
      {/* Header with Confidence */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Clinical Recommendation</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{recommendation}</p>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div className="text-sm">
            <div className="text-muted-foreground">Evidence Confidence</div>
            <div className={cn("text-lg font-bold flex items-center gap-1", getConfidenceColor(confidence))}>
              <ConfidenceIcon className="w-4 h-4" />
              {confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Sources */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <Microscope className="w-4 h-4" />
          Supporting Evidence ({sortedSources.length} sources)
        </h4>
        
        <div className="space-y-3">
          {sortedSources.map((source, index) => (
            <div key={source.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/10 border border-border">
              <div className="flex-shrink-0">
                <Badge variant="outline" className="text-xs font-mono">
                  #{index + 1}
                </Badge>
              </div>
              
              <div className="flex-grow space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <EvidenceBadge level={source.level} strength={source.strength} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {source.year}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-white">{source.title}</h5>
                  {source.authors && (
                    <p className="text-xs text-muted-foreground">{source.authors}</p>
                  )}
                  <p className="text-xs text-muted-foreground font-medium">{source.publication}</p>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {source.description}
                </p>
                
                {source.keyFindings && source.keyFindings.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-white">Key Findings:</div>
                    <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                      {source.keyFindings.map((finding, idx) => (
                        <li key={idx} className="list-disc">{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {source.url && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                    onClick={() => window.open(source.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Source
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-white font-medium">Evidence Summary:</span>
          <span className="text-muted-foreground">
            Recommendation supported by {sortedSources.length} sources including{' '}
            {sortedSources.filter(s => s.level === 'acr-guidelines').length > 0 && 'ACR Guidelines, '}
            {sortedSources.filter(s => s.level === 'landmark-study').length > 0 && 'Landmark Studies, '}
            and peer-reviewed literature.
          </span>
        </div>
      </div>
    </div>
  );
}