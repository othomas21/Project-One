/**
 * @file clinical-consensus.tsx
 * @description Clinical consensus and controversy highlighting system
 * @module components/clinical
 * 
 * Key responsibilities:
 * - Display areas of medical consensus vs controversy
 * - Show strength of recommendations across guidelines
 * - Highlight emerging debates and alternative approaches
 * - Provide balanced clinical perspectives
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConsensusLevel = 'strong-consensus' | 'moderate-consensus' | 'emerging-debate' | 'controversial';

export interface ConsensusPoint {
  id: string;
  type: 'consensus' | 'controversy';
  level: ConsensusLevel;
  title: string;
  description: string;
  supportingGuidelines: string[];
  evidenceLevel: '1A' | '1B' | '2A' | '2B' | '3' | '4' | '5';
  lastUpdated: string;
  alternativeApproaches?: {
    approach: string;
    rationale: string;
    supportingEvidence: string;
  }[];
}

interface ClinicalConsensusProps {
  consensusPoints: ConsensusPoint[];
  topic: string;
  className?: string;
}

interface ConsensusIndicatorProps {
  level: ConsensusLevel;
  evidenceLevel: string;
  className?: string;
}

const CONSENSUS_CONFIG = {
  'strong-consensus': {
    icon: CheckCircle,
    label: 'Strong Consensus',
    emoji: '📊',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Major guidelines align with strong recommendations'
  },
  'moderate-consensus': {
    icon: Users,
    label: 'Moderate Consensus',
    emoji: '🤝',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Most guidelines agree with some variation'
  },
  'emerging-debate': {
    icon: TrendingUp,
    label: 'Emerging Debate',
    emoji: '⚠️',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'New evidence challenging current practice'
  },
  'controversial': {
    icon: AlertTriangle,
    label: 'Controversial',
    emoji: '🔍',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Significant disagreement in literature'
  }
} as const;

export function ConsensusIndicator({ level, evidenceLevel, className }: ConsensusIndicatorProps) {
  const config = CONSENSUS_CONFIG[level];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg border", config.bgColor, config.borderColor, className)}>
      <div className="flex items-center gap-2">
        <span className="text-base">{config.emoji}</span>
        <Icon className={cn("w-4 h-4", config.color)} />
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
      </div>
      <Badge variant="outline" className="text-xs">
        Level {evidenceLevel}
      </Badge>
    </div>
  );
}

export function ClinicalConsensus({ consensusPoints, topic, className }: ClinicalConsensusProps) {
  const consensusItems = consensusPoints.filter(point => point.type === 'consensus');
  const controversyItems = consensusPoints.filter(point => point.type === 'controversy');

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Clinical Consensus: {topic}
        </h3>
        <p className="text-muted-foreground text-sm">
          Evidence-based consensus and areas of ongoing clinical debate
        </p>
      </div>

      {/* Consensus Section */}
      {consensusItems.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Areas of Consensus ({consensusItems.length})
          </h4>
          
          <div className="space-y-4">
            {consensusItems.map((point) => (
              <div key={point.id} className="space-y-3">
                <ConsensusIndicator 
                  level={point.level} 
                  evidenceLevel={point.evidenceLevel}
                />
                
                <div className="pl-4 space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-white">{point.title}</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {point.supportingGuidelines.map((guideline, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {guideline}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Last updated: {point.lastUpdated}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controversy Section */}
      {controversyItems.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Emerging Debates ({controversyItems.length})
          </h4>
          
          <div className="space-y-6">
            {controversyItems.map((point) => (
              <div key={point.id} className="space-y-4">
                <ConsensusIndicator 
                  level={point.level} 
                  evidenceLevel={point.evidenceLevel}
                />
                
                <div className="pl-4 space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-white">{point.title}</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                  
                  {point.alternativeApproaches && point.alternativeApproaches.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-white">
                        <Lightbulb className="w-3 h-3" />
                        Alternative Approaches:
                      </div>
                      
                      <div className="space-y-3">
                        {point.alternativeApproaches.map((alt, idx) => (
                          <div key={idx} className="p-3 bg-muted/10 border border-border rounded-lg">
                            <div className="space-y-2">
                              <h6 className="text-xs font-medium text-white flex items-center gap-2">
                                <ArrowRight className="w-3 h-3" />
                                {alt.approach}
                              </h6>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {alt.rationale}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                <strong>Supporting Evidence:</strong> {alt.supportingEvidence}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {point.supportingGuidelines.map((guideline, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {guideline}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Last updated: {point.lastUpdated}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Context Notice */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3 text-sm">
          <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-white font-medium">Clinical Context:</span>
            <p className="text-muted-foreground">
              Consider patient age, comorbidities, and institutional protocols when applying 
              these recommendations. Areas of controversy require careful clinical judgment 
              and may benefit from multidisciplinary consultation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}