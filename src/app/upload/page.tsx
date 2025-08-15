/**
 * @file page.tsx
 * @description Medical image upload page for healthcare providers
 * @module app/upload
 * 
 * Key responsibilities:
 * - Protected upload interface for medical images
 * - Role-based access control for upload permissions
 * - Integration with medical image uploader component
 * - DICOM file support and validation
 * - Professional healthcare interface
 * 
 * @reftools Verified against: Next.js 14+ App Router patterns
 * @supabase Integrated with protected authentication and storage
 * @author Claude Code
 * @created 2025-08-13
 */

"use client";

import { ProtectedRoute, useAuth } from "@/components/features/auth";
import { MedicalImageUploader } from '@/components/features/medical-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  FileImage, 
  Users,
  ArrowLeft,
  InfoIcon, 
  ShieldCheckIcon, 
  DatabaseIcon,
  Upload,
  Settings,
  Search,
  Calendar,
  Monitor
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { 
  MobileNavTabs,
  MobileQuickActions
} from '@/components/ui/mobile-optimized';
import { useState, useEffect } from 'react';

function UploadContent() {
  const { user, hasRole } = useAuth();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if user has upload permissions
  const canUpload = hasRole(["admin", "radiologist", "technician"]);
  
  // Mobile layout
  if (isMobile) {
    if (!canUpload) {
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="font-semibold">Upload Access Restricted</h1>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-medium text-red-700">Upload Permissions Required</h3>
                    <p className="text-sm text-red-600">
                      Only authorized healthcare providers can upload medical images.
                    </p>
                    <div className="space-y-1 text-xs text-red-600">
                      <p><strong>Authorized roles:</strong></p>
                      <p>• Radiologists</p>
                      <p>• Radiology Technicians</p>
                      <p>• System Administrators</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <MobileNavTabs
            tabs={[
              { id: 'search', label: 'Search', icon: <Search className="h-5 w-5" /> },
              { id: 'recent', label: 'Recent', icon: <Calendar className="h-5 w-5" /> },
              { id: 'upload', label: 'Upload', icon: <Upload className="h-5 w-5" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> }
            ]}
            activeTab="upload"
            onTabChange={(tabId) => {
              if (tabId === 'search') router.push('/search');
              if (tabId === 'recent') router.push('/dashboard');
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Header */}
        <div className="p-4 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-semibold">Upload Images</h1>
                <p className="text-xs text-muted-foreground">DICOM & Medical Images</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {user?.profile?.role === "admin" ? "Admin" : 
               user?.profile?.role === "radiologist" ? "MD" : 
               user?.profile?.role === "technician" ? "Tech" : "Auth"}
            </Badge>
          </div>
        </div>
        
        {/* Mobile Content */}
        <div className="flex-1 overflow-auto">
          {/* Security Notice */}
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-700">HIPAA Compliance</p>
                <p className="text-blue-600 text-xs mt-1">
                  Ensure all images are properly de-identified before upload
                </p>
              </div>
            </div>
          </div>
          
          {/* Key Features - Mobile Optimized */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Secure</span>
                </div>
                <p className="text-xs text-muted-foreground">HIPAA compliant storage</p>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DatabaseIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">DICOM</span>
                </div>
                <p className="text-xs text-muted-foreground">Native file support</p>
              </Card>
            </div>
          </div>
          
          {/* Mobile Medical Image Uploader */}
          <div className="p-4">
            <MedicalImageUploader />
          </div>
          
          {/* Supported Formats - Collapsible */}
          <div className="p-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">File Types</h4>
                  <div className="flex flex-wrap gap-1">
                    {['DICOM', 'JPEG', 'PNG', 'TIFF', 'BMP', 'WebP'].map((format) => (
                      <Badge key={format} variant="outline" className="text-xs">{format}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Modalities</h4>
                  <div className="flex flex-wrap gap-1">
                    {['CT', 'MRI', 'CR/DX', 'US', 'MG', 'NM/PET'].map((modality) => (
                      <Badge key={modality} variant="outline" className="text-xs">{modality}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileNavTabs
          tabs={[
            { id: 'search', label: 'Search', icon: <Search className="h-5 w-5" /> },
            { id: 'recent', label: 'Recent', icon: <Calendar className="h-5 w-5" /> },
            { id: 'upload', label: 'Upload', icon: <Upload className="h-5 w-5" /> },
            { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> }
          ]}
          activeTab="upload"
          onTabChange={(tabId) => {
            if (tabId === 'search') router.push('/search');
            if (tabId === 'recent') router.push('/dashboard');
          }}
        />
        
        {/* Mobile Quick Actions */}
        <MobileQuickActions
          actions={[
            { icon: <Monitor className="h-5 w-5" />, label: 'Desktop View', onClick: () => setIsMobile(false) }
          ]}
        />
      </div>
    );
  }

  if (!canUpload) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Shield className="h-5 w-5" />
                Access Restricted
              </CardTitle>
              <CardDescription className="text-red-600">
                You don't have permission to upload medical images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">Upload Permissions Required</p>
                  <p>
                    Only authorized healthcare providers with the following roles can upload medical images:
                  </p>
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>Radiologists</li>
                    <li>Radiology Technicians</li>
                    <li>System Administrators</li>
                  </ul>
                  <p className="mt-2">
                    Contact your system administrator if you believe you should have upload access.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => router.push("/dashboard")} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Button>
                <Button onClick={() => router.push("/search")}>
                  <FileImage className="h-4 w-4 mr-2" />
                  Search Studies
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Medical Image Upload</h1>
            <p className="text-muted-foreground">
              Securely upload DICOM files and medical images to the imaging database
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {user?.profile?.role === "admin" ? "Administrator" : 
               user?.profile?.role === "radiologist" ? "Radiologist" : 
               user?.profile?.role === "technician" ? "Technician" : "Authorized"}
            </Badge>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>HIPAA Compliance Notice:</strong> Ensure all uploaded images are properly de-identified 
          and comply with your institution's privacy policies. Only authorized medical images should be uploaded.
        </AlertDescription>
      </Alert>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-green-500" />
              HIPAA Compliant
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription>
              All uploaded images are encrypted and stored with Row-Level Security policies
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DatabaseIcon className="h-4 w-4 text-blue-500" />
              DICOM Support
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription>
              Native support for DICOM files with automatic metadata extraction
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <InfoIcon className="h-4 w-4 text-orange-500" />
              Batch Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription>
              Upload multiple images simultaneously with progress tracking
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Usage Tips:</strong> Drag and drop DICOM files or medical images into the upload area. 
          Fill in the default metadata to automatically apply it to all uploaded files. 
          Each file can have its metadata customized individually before upload.
        </AlertDescription>
      </Alert>

      {/* Medical Image Uploader Component */}
      <MedicalImageUploader />

      {/* Features Information */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">File Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• DICOM (.dcm, .dicom)</li>
                <li>• JPEG (.jpg, .jpeg)</li>
                <li>• PNG (.png)</li>
                <li>• TIFF (.tiff, .tif)</li>
                <li>• BMP (.bmp)</li>
                <li>• WebP (.webp)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Medical Modalities</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CT - Computed Tomography</li>
                <li>• MRI - Magnetic Resonance Imaging</li>
                <li>• CR/DX - Digital Radiography</li>
                <li>• US - Ultrasound</li>
                <li>• MG - Mammography</li>
                <li>• NM/PET - Nuclear Medicine</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UploadPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "radiologist", "technician"]}>
      <UploadContent />
    </ProtectedRoute>
  );
}