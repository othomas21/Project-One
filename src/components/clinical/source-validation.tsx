/**
 * @file source-validation.tsx
 * @description Trust and verifiability layer with source validation UI
 * @module components/clinical
 * 
 * Key responsibilities:
 * - Real-time source verification and validation
 * - Trust indicators and confidence scoring
 * - Citation verification and audit trails
 * - Quality assessment of medical sources
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Clock, 
  Eye, 
  Search,
  Award,
  BookOpen,
  Building,
  FileText,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ValidationStatus = 'verified' | 'pending' | 'warning' | 'failed';
export type SourceQuality = 'high' | 'medium' | 'low';
export type PeerReviewStatus = 'peer-reviewed' | 'preprint' | 'editorial' | 'other';

export interface SourceValidation {
  sourceId: string;
  status: ValidationStatus;
  quality: SourceQuality;
  peerReviewStatus: PeerReviewStatus;
  lastValidated: string;
  validationScore: number; // 0-100
  checks: {
    citationAccuracy: boolean;
    linkIntegrity: boolean;
    journalVerification: boolean;
    authorVerification: boolean;
    dateAccuracy: boolean;
    contentRelevance: number; // 0-100
  };
  warnings?: string[];
  auditTrail: {
    timestamp: string;
    action: string;
    validator: string;
  }[];
}

interface SourceValidationProps {
  validation: SourceValidation;
  sourceName: string;
  sourceUrl?: string;
  className?: string;
  showDetailedChecks?: boolean;
}

interface TrustIndicatorProps {
  validationScore: number;
  status: ValidationStatus;
  className?: string;
}

interface ValidationSummaryProps {
  validations: SourceValidation[];
  className?: string;
}

const VALIDATION_CONFIG = {
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Source verified and validated'
  },
  pending: {
    icon: Clock,
    label: 'Validating',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Validation in progress'
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Some validation concerns'
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Validation failed'
  }
} as const;

const QUALITY_CONFIG = {
  high: { label: 'High Quality', color: 'text-green-600', emoji: '🏆' },
  medium: { label: 'Medium Quality', color: 'text-yellow-600', emoji: '⭐' },
  low: { label: 'Low Quality', color: 'text-red-600', emoji: '⚠️' }
} as const;

const PEER_REVIEW_CONFIG = {
  'peer-reviewed': { label: 'Peer Reviewed', color: 'text-blue-600', icon: Award },
  'preprint': { label: 'Preprint', color: 'text-yellow-600', icon: FileText },
  'editorial': { label: 'Editorial', color: 'text-purple-600', icon: BookOpen },
  'other': { label: 'Other', color: 'text-gray-600', icon: Building }
} as const;

export function TrustIndicator({ validationScore, status, className }: TrustIndicatorProps) {
  const config = VALIDATION_CONFIG[status];
  const Icon = config.icon;

  const getTrustLevel = (score: number) => {
    if (score >= 90) return { level: 'High Trust', color: 'text-green-600' };
    if (score >= 70) return { level: 'Medium Trust', color: 'text-yellow-600' };
    return { level: 'Low Trust', color: 'text-red-600' };
  };

  const trust = getTrustLevel(validationScore);

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg border", config.bgColor, config.borderColor, className)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", config.color)} />
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Shield className={cn("w-4 h-4", trust.color)} />
        <span className={cn("text-sm font-medium", trust.color)}>
          {trust.level}
        </span>
        <Badge variant="outline" className="text-xs">
          {validationScore}/100
        </Badge>
      </div>
    </div>
  );
}

export function SourceValidation({ 
  validation, 
  sourceName, 
  sourceUrl, 
  className,
  showDetailedChecks = false 
}: SourceValidationProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const config = VALIDATION_CONFIG[validation.status];
  const qualityConfig = QUALITY_CONFIG[validation.quality];
  const peerReviewConfig = PEER_REVIEW_CONFIG[validation.peerReviewStatus];
  const PeerReviewIcon = peerReviewConfig.icon;

  const checksCount = Object.values(validation.checks).filter((check, index) => 
    index < 5 ? check === true : check >= 80
  ).length;
  const totalChecks = 6; // 5 boolean checks + 1 content relevance

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-grow">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-white">{sourceName}</h4>
            {sourceUrl && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-primary hover:text-primary/80"
                onClick={() => window.open(sourceUrl, '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs", qualityConfig.color)}>
              {qualityConfig.emoji} {qualityConfig.label}
            </Badge>
            <Badge variant="outline" className={cn("text-xs", peerReviewConfig.color)}>
              <PeerReviewIcon className="w-3 h-3 mr-1" />
              {peerReviewConfig.label}
            </Badge>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-muted-foreground hover:text-white"
        >
          <Eye className="w-3 h-3 mr-1" />
          Details
        </Button>
      </div>

      {/* Trust Indicator */}
      <TrustIndicator 
        validationScore={validation.validationScore}
        status={validation.status}
      />

      {/* Warnings */}
      {validation.warnings && validation.warnings.length > 0 && (
        <div className="space-y-2">
          {validation.warnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-yellow-800">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Checks */}
      {showDetails && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white font-medium">Validation Checks</span>
              <span className="text-muted-foreground">
                {checksCount}/{totalChecks} passed
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                {validation.checks.citationAccuracy ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600" />
                )}
                <span>Citation Accuracy</span>
              </div>
              
              <div className="flex items-center gap-2">
                {validation.checks.linkIntegrity ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600" />
                )}
                <span>Link Integrity</span>
              </div>
              
              <div className="flex items-center gap-2">
                {validation.checks.journalVerification ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600" />
                )}
                <span>Journal Verification</span>
              </div>
              
              <div className="flex items-center gap-2">
                {validation.checks.authorVerification ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600" />
                )}
                <span>Author Verification</span>
              </div>
              
              <div className="flex items-center gap-2">
                {validation.checks.dateAccuracy ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600" />
                )}
                <span>Date Accuracy</span>
              </div>
              
              <div className="flex items-center gap-2">
                {validation.checks.contentRelevance >= 80 ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : validation.checks.contentRelevance >= 60 ? (
                  <AlertTriangle className="w-3 h-3 text-yellow-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600" />
                )}
                <span>Content Relevance ({validation.checks.contentRelevance}%)</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Last validated: {validation.lastValidated}
          </div>
        </div>
      )}
    </div>
  );
}

export function ValidationSummary({ validations, className }: ValidationSummaryProps) {
  const stats = {
    total: validations.length,
    verified: validations.filter(v => v.status === 'verified').length,
    pending: validations.filter(v => v.status === 'pending').length,
    warnings: validations.filter(v => v.status === 'warning').length,
    failed: validations.filter(v => v.status === 'failed').length,
    avgScore: Math.round(validations.reduce((sum, v) => sum + v.validationScore, 0) / validations.length)
  };

  const trustLevel = stats.avgScore >= 90 ? 'High' : stats.avgScore >= 70 ? 'Medium' : 'Low';
  const trustColor = stats.avgScore >= 90 ? 'text-green-600' : stats.avgScore >= 70 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Source Validation Summary
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Overall Trust:</span>
          <Badge variant="outline" className={cn("text-xs", trustColor)}>
            {trustLevel} ({stats.avgScore}/100)
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-lg font-bold text-white">{stats.verified}</div>
          <div className="text-xs text-green-600 flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-lg font-bold text-white">{stats.pending}</div>
          <div className="text-xs text-yellow-600 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-lg font-bold text-white">{stats.warnings}</div>
          <div className="text-xs text-orange-600 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Warnings
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-lg font-bold text-white">{stats.failed}</div>
          <div className="text-xs text-red-600 flex items-center justify-center gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-lg font-bold text-white">{stats.total}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Search className="w-3 h-3" />
            Total
          </div>
        </div>
      </div>

      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-white font-medium">Validation Status:</span>
          <span className="text-muted-foreground">
            {stats.verified} of {stats.total} sources verified. 
            {stats.warnings > 0 && ` ${stats.warnings} source(s) have validation warnings.`}
            {stats.failed > 0 && ` ${stats.failed} source(s) failed validation.`}
          </span>
        </div>
      </div>
    </div>
  );
}