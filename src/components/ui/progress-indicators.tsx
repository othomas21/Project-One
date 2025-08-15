/**
 * @file progress-indicators.tsx
 * @description Advanced progress indicators for medical applications
 * @module components/ui
 * 
 * Key responsibilities:
 * - Upload progress with file details
 * - AI processing progress indicators
 * - Medical analysis progress tracking
 * - Multi-stage process indicators
 * 
 * @reftools Verified against: React 18+ patterns, accessibility standards
 * @author Claude Code
 * @created 2025-08-14
 */

"use client";

import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  Clock, 
  Loader2, 
  AlertCircle, 
  Upload, 
  Brain, 
  FileImage,
  Zap,
  Database,
  Stethoscope,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedProgress, MedicalSpinner } from "./animated-components";

// Upload progress for individual files
interface FileUploadProgressProps {
  fileName: string;
  fileSize: number;
  progress: number;
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

export function FileUploadProgress({
  fileName,
  fileSize,
  progress,
  status,
  error,
  onCancel,
  onRetry
}: FileUploadProgressProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "uploading":
        return <Upload className="h-4 w-4 text-blue-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileImage className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "uploading": return "primary";
      case "processing": return "warning";
      case "completed": return "success";
      case "error": return "danger";
      default: return "primary";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending": return "Queued";
      case "uploading": return "Uploading";
      case "processing": return "Processing";
      case "completed": return "Complete";
      case "error": return "Failed";
      default: return "Unknown";
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* File info header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getStatusIcon()}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(fileSize)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getStatusText()}
              </Badge>
              
              {status === "uploading" && onCancel && (
                <Button size="sm" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              
              {status === "error" && onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  Retry
                </Button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {(status === "uploading" || status === "processing") && (
            <AnimatedProgress
              value={progress}
              color={getStatusColor()}
              showPercentage={true}
            />
          )}

          {/* Error message */}
          {status === "error" && error && (
            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success details */}
          {status === "completed" && (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Upload completed successfully</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// AI Analysis progress indicator
interface AIAnalysisProgressProps {
  stage: "initializing" | "preprocessing" | "analyzing" | "generating" | "completing" | "completed" | "error";
  model?: string;
  progress?: number;
  estimatedTime?: number;
  error?: string;
}

export function AIAnalysisProgress({
  stage,
  model = "MedGemma 4B",
  progress = 0,
  estimatedTime,
  error
}: AIAnalysisProgressProps) {
  const getStageInfo = () => {
    switch (stage) {
      case "initializing":
        return {
          icon: <Clock className="h-4 w-4" />,
          title: "Initializing AI Analysis",
          description: "Preparing medical image for analysis",
          color: "text-blue-500"
        };
      case "preprocessing":
        return {
          icon: <Database className="h-4 w-4" />,
          title: "Preprocessing",
          description: "Processing medical image data",
          color: "text-blue-500"
        };
      case "analyzing":
        return {
          icon: <Brain className="h-4 w-4 animate-pulse" />,
          title: "AI Analysis in Progress",
          description: `Running ${model} medical analysis`,
          color: "text-primary"
        };
      case "generating":
        return {
          icon: <Zap className="h-4 w-4" />,
          title: "Generating Report",
          description: "Creating clinical insights and recommendations",
          color: "text-primary"
        };
      case "completing":
        return {
          icon: <Stethoscope className="h-4 w-4" />,
          title: "Finalizing Results",
          description: "Preparing clinical summary",
          color: "text-green-500"
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          title: "Analysis Complete",
          description: "Medical analysis ready for review",
          color: "text-green-500"
        };
      case "error":
        return {
          icon: <XCircle className="h-4 w-4" />,
          title: "Analysis Failed",
          description: "Unable to complete medical analysis",
          color: "text-red-500"
        };
      default:
        return {
          icon: <Brain className="h-4 w-4" />,
          title: "AI Analysis",
          description: "Medical AI processing",
          color: "text-muted-foreground"
        };
    }
  };

  const stageInfo = getStageInfo();
  const isActive = !["completed", "error"].includes(stage);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className={cn("flex items-center justify-center w-8 h-8 rounded-full bg-muted", stageInfo.color)}>
            {stageInfo.icon}
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold">{stageInfo.title}</h3>
            <p className="text-sm text-muted-foreground font-normal">
              {stageInfo.description}
            </p>
          </div>
          
          {isActive && <MedicalSpinner />}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Progress bar for active stages */}
        {isActive && progress > 0 && (
          <AnimatedProgress
            value={progress}
            color={stage === "error" ? "danger" : "primary"}
            showPercentage={true}
          />
        )}

        {/* Estimated time */}
        {estimatedTime && isActive && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Estimated time: {estimatedTime}s</span>
          </div>
        )}

        {/* Model info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Brain className="h-4 w-4" />
          <span>Model: {model}</span>
        </div>

        {/* Error details */}
        {stage === "error" && error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Analysis Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success message */}
        {stage === "completed" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Medical analysis completed successfully</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Multi-step process indicator
interface ProcessStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "active" | "completed" | "error";
  optional?: boolean;
}

interface MultiStepProgressProps {
  steps: ProcessStep[];
  currentStep?: string;
  className?: string;
}

export function MultiStepProgress({ steps, currentStep: _currentStep, className }: MultiStepProgressProps) {
  const getStepIcon = (step: ProcessStep, index: number) => {
    switch (step.status) {
      case "completed":
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full">
            <CheckCircle className="h-4 w-4" />
          </div>
        );
      case "active":
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full">
            <XCircle className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-muted text-muted-foreground rounded-full border-2 border-muted-foreground/20">
            <span className="text-sm font-medium">{index + 1}</span>
          </div>
        );
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-4">
          {/* Step icon */}
          {getStepIcon(step, index)}
          
          {/* Step content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-medium",
                step.status === "active" ? "text-primary" : 
                step.status === "completed" ? "text-green-700" :
                step.status === "error" ? "text-red-700" : 
                "text-muted-foreground"
              )}>
                {step.title}
              </h3>
              
              {step.optional && (
                <Badge variant="outline" className="text-xs">
                  Optional
                </Badge>
              )}
            </div>
            
            {step.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {step.description}
              </p>
            )}
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="absolute left-4 mt-8 w-0.5 h-8 bg-muted-foreground/20" />
          )}
        </div>
      ))}
    </div>
  );
}

// Batch operation progress
interface BatchProgressProps {
  total: number;
  completed: number;
  failed: number;
  operation: string;
  className?: string;
}

export function BatchProgress({ total, completed, failed, operation, className }: BatchProgressProps) {
  const percentage = total > 0 ? ((completed + failed) / total) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{operation}</span>
          <Badge variant="outline">
            {completed + failed} / {total}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatedProgress
          value={percentage}
          color={failed > 0 ? "warning" : "primary"}
          showPercentage={true}
        />

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{failed}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-foreground">{total - completed - failed}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>

        {failed === 0 && completed === total && total > 0 && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
            <CheckCircle className="h-4 w-4" />
            <span>All operations completed successfully</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}