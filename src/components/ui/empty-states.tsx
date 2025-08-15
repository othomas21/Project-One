/**
 * @file empty-states.tsx
 * @description Enhanced empty state components for medical applications
 * @module components/ui
 * 
 * Key responsibilities:
 * - Medical-specific empty states
 * - Actionable guidance for users
 * - Professional medical context
 * - Helpful suggestions and next steps
 * 
 * @reftools Verified against: UX best practices, medical workflow patterns
 * @author Claude Code
 * @created 2025-08-14
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Upload, 
  FileImage, 
  Brain, 
  Stethoscope,
  Database,
  Filter,
  RefreshCw,
  AlertCircle,
  Info,
  BookOpen,
  Users,
  Calendar,
  Settings,
  HelpCircle,
  Zap,
  Heart,
  ScanLine
} from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: "default" | "medical" | "search" | "upload" | "ai";
}

function EmptyState({ 
  icon, 
  title, 
  description, 
  actions, 
  className,
  variant = "default"
}: EmptyStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "medical":
        return "bg-blue-50/50 border-blue-100";
      case "search":
        return "bg-slate-50/50 border-slate-100";
      case "upload":
        return "bg-green-50/50 border-green-100";
      case "ai":
        return "bg-purple-50/50 border-purple-100";
      default:
        return "bg-muted/30 border-muted";
    }
  };

  return (
    <Card className={cn("border-dashed", getVariantStyles(), className)}>
      <CardContent className="flex flex-col items-center justify-center text-center p-8 space-y-4">
        {icon && (
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
            {icon}
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground max-w-md">{description}</p>
        </div>
        
        {actions && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// No search results for medical database
export function NoSearchResults({ 
  searchQuery, 
  onClearSearch, 
  onRefineSearch,
  className 
}: { 
  searchQuery?: string;
  onClearSearch?: () => void;
  onRefineSearch?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      variant="search"
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title={searchQuery ? `No results for "${searchQuery}"` : "No search results"}
      description={searchQuery 
        ? "We couldn't find any medical studies matching your search criteria. Try adjusting your search terms or filters."
        : "Enter a search term to find medical studies and imaging data."
      }
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          {searchQuery && onClearSearch && (
            <Button variant="outline" onClick={onClearSearch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Search
            </Button>
          )}
          {onRefineSearch && (
            <Button onClick={onRefineSearch}>
              <Filter className="h-4 w-4 mr-2" />
              Refine Search
            </Button>
          )}
          <Button variant="outline">
            <HelpCircle className="h-4 w-4 mr-2" />
            Search Tips
          </Button>
        </div>
      }
      className={className}
    />
  );
}

// No uploads state
export function NoUploads({ 
  onUpload,
  canUpload = true,
  className 
}: { 
  onUpload?: () => void;
  canUpload?: boolean;
  className?: string;
}) {
  return (
    <EmptyState
      variant="upload"
      icon={<Upload className="h-8 w-8 text-muted-foreground" />}
      title="No medical images uploaded"
      description={canUpload 
        ? "Upload DICOM files and medical images to begin analysis and add them to the searchable database."
        : "You don't have permission to upload medical images. Contact your administrator for access."
      }
      actions={canUpload ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Upload Guide
          </Button>
        </div>
      ) : (
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Contact Administrator
        </Button>
      )}
      className={className}
    />
  );
}

// No AI analysis results
export function NoAIAnalysis({ 
  onRunAnalysis,
  isProcessing = false,
  className 
}: { 
  onRunAnalysis?: () => void;
  isProcessing?: boolean;
  className?: string;
}) {
  return (
    <EmptyState
      variant="ai"
      icon={<Brain className="h-8 w-8 text-muted-foreground" />}
      title="No AI analysis available"
      description="Run MedGemma AI analysis to get clinical insights, differential diagnoses, and medical recommendations for this case."
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={onRunAnalysis} 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <ScanLine className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
          <Button variant="outline">
            <Info className="h-4 w-4 mr-2" />
            About AI Features
          </Button>
        </div>
      }
      className={className}
    />
  );
}

// Empty medical database
export function EmptyDatabase({ 
  onUpload,
  onImport,
  className 
}: { 
  onUpload?: () => void;
  onImport?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      variant="medical"
      icon={<Database className="h-8 w-8 text-muted-foreground" />}
      title="Medical database is empty"
      description="Your medical imaging database doesn't contain any studies yet. Upload DICOM files or import existing data to get started."
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Studies
          </Button>
          <Button variant="outline" onClick={onImport}>
            <Database className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Setup Guide
          </Button>
        </div>
      }
      className={className}
    />
  );
}

// No patient data
export function NoPatientData({ 
  onAddPatient,
  patientId,
  className 
}: { 
  onAddPatient?: () => void;
  patientId?: string;
  className?: string;
}) {
  return (
    <EmptyState
      variant="medical"
      icon={<Stethoscope className="h-8 w-8 text-muted-foreground" />}
      title={patientId ? `No data for patient ${patientId}` : "No patient data"}
      description="This patient doesn't have any medical studies or imaging data in the system yet."
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onAddPatient}>
            <FileImage className="h-4 w-4 mr-2" />
            Add Study
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Imaging
          </Button>
        </div>
      }
      className={className}
    />
  );
}

// No recent activity
export function NoRecentActivity({ 
  onViewAll,
  className 
}: { 
  onViewAll?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
      title="No recent activity"
      description="There hasn't been any recent activity in your medical imaging platform. New uploads and analyses will appear here."
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onViewAll}>
            <Search className="h-4 w-4 mr-2" />
            Browse All Studies
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload New Study
          </Button>
        </div>
      }
      className={className}
    />
  );
}

// Connection error state
export function ConnectionError({ 
  onRetry,
  className 
}: { 
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-8 w-8 text-red-500" />}
      title="Connection error"
      description="Unable to connect to the medical imaging database. Please check your internet connection and try again."
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline">
            <HelpCircle className="h-4 w-4 mr-2" />
            Get Help
          </Button>
        </div>
      }
      className={className}
    />
  );
}

// Permission denied state
export function PermissionDenied({ 
  requiredRole,
  onContactAdmin,
  className 
}: { 
  requiredRole?: string;
  onContactAdmin?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-8 w-8 text-orange-500" />}
      title="Access restricted"
      description={`You need ${requiredRole || 'appropriate'} permissions to access this medical data. Contact your system administrator for access.`}
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onContactAdmin}>
            <Users className="h-4 w-4 mr-2" />
            Contact Administrator
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Button>
        </div>
      }
      className={className}
    />
  );
}

// System maintenance state
export function SystemMaintenance({ 
  estimatedTime,
  className 
}: { 
  estimatedTime?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<Settings className="h-8 w-8 text-blue-500" />}
      title="System maintenance"
      description={`The medical imaging system is currently undergoing maintenance. ${estimatedTime ? `Expected completion: ${estimatedTime}` : 'Please check back later.'}`}
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Status
          </Button>
          <Button variant="outline">
            <Info className="h-4 w-4 mr-2" />
            Maintenance Info
          </Button>
        </div>
      }
      className={className}
    />
  );
}

// First time setup
export function FirstTimeSetup({ 
  onSetup,
  className 
}: { 
  onSetup?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      variant="medical"
      icon={<Heart className="h-8 w-8 text-primary" />}
      title="Welcome to Curie Medical Imaging"
      description="Get started by setting up your medical imaging workspace. We'll guide you through uploading your first studies and configuring AI analysis."
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onSetup}>
            <Zap className="h-4 w-4 mr-2" />
            Get Started
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            User Guide
          </Button>
        </div>
      }
      className={className}
    />
  );
}

export { EmptyState };