/**
 * @file medical-disclaimer.tsx
 * @description Medical disclaimer and compliance component for AI-generated content
 * @module components/medgemma
 * 
 * Key responsibilities:
 * - Display medical AI disclaimers
 * - HIPAA compliance warnings
 * - User consent management
 * - Professional use guidelines
 * - Regulatory compliance notices
 * 
 * @reftools Verified against: FDA AI/ML guidance, medical device regulations
 * @author Claude Code
 * @created 2025-08-14
 */

"use client";

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  UserCheck, 
  Info, 
  ExternalLink,
  Lock,
  Clock
} from 'lucide-react';

interface MedicalDisclaimerProps {
  onAccept?: () => void;
  showFullDisclaimer?: boolean;
  variant?: 'full' | 'banner' | 'inline';
  className?: string;
}

interface ConsentState {
  medicalDisclaimer: boolean;
  hipaaNotice: boolean;
  professionalUse: boolean;
  dataRetention: boolean;
}

export function MedicalDisclaimer({ 
  onAccept, 
  variant = 'full',
  className = '' 
}: MedicalDisclaimerProps) {
  const [consent, setConsent] = useState<ConsentState>({
    medicalDisclaimer: false,
    hipaaNotice: false,
    professionalUse: false,
    dataRetention: false
  });
  
  const [hasAccepted, setHasAccepted] = useState(false);

  // Check if user has previously accepted
  useEffect(() => {
    const accepted = localStorage.getItem('medgemma-consent-accepted');
    if (accepted === 'true') {
      setHasAccepted(true);
    }
  }, []);

  const allConsentGiven = Object.values(consent).every(Boolean);

  const handleAccept = () => {
    if (allConsentGiven) {
      localStorage.setItem('medgemma-consent-accepted', 'true');
      localStorage.setItem('medgemma-consent-timestamp', Date.now().toString());
      setHasAccepted(true);
      onAccept?.();
    }
  };

  const handleReset = () => {
    localStorage.removeItem('medgemma-consent-accepted');
    localStorage.removeItem('medgemma-consent-timestamp');
    setHasAccepted(false);
    setConsent({
      medicalDisclaimer: false,
      hipaaNotice: false,
      professionalUse: false,
      dataRetention: false
    });
  };

  if (variant === 'banner' && hasAccepted) {
    return (
      <Alert className={`border-amber-200 bg-amber-50 dark:bg-amber-950/20 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <span className="font-medium">AI-Generated Content:</span> This analysis is provided by 
          MedGemma AI and should not replace professional medical judgment. 
          <Button variant="link" className="p-0 h-auto text-amber-800 dark:text-amber-200" onClick={() => setHasAccepted(false)}>
            Review disclaimers
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'inline' && hasAccepted) {
    return (
      <div className={`text-xs text-muted-foreground border-l-2 border-amber-400 pl-2 ${className}`}>
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-amber-600" />
          <span>AI-generated content • Not for diagnostic use</span>
        </div>
      </div>
    );
  }

  if (hasAccepted && variant === 'full') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <UserCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Medical AI Consent Given</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-amber-200 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Medical AI Disclaimer & Consent
        </CardTitle>
        <CardDescription>
          Please read and acknowledge the following important information before using MedGemma AI features.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Medical Disclaimer */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="medical-disclaimer"
              checked={consent.medicalDisclaimer}
              onCheckedChange={(checked) => 
                setConsent(prev => ({ ...prev, medicalDisclaimer: checked === true }))
              }
            />
            <div className="space-y-2">
              <label htmlFor="medical-disclaimer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Medical Disclaimer
              </label>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>I understand that:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>MedGemma AI is a research tool and is <strong>NOT FDA approved</strong> for clinical use</li>
                  <li>AI analysis is <strong>NOT a substitute</strong> for professional medical judgment</li>
                  <li>All AI-generated content must be <strong>independently verified</strong> by qualified healthcare professionals</li>
                  <li>This tool should <strong>NOT be used for emergency or critical diagnoses</strong></li>
                  <li>Clinical decisions should always be based on complete patient evaluation and professional medical standards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* HIPAA Notice */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="hipaa-notice"
              checked={consent.hipaaNotice}
              onCheckedChange={(checked) => 
                setConsent(prev => ({ ...prev, hipaaNotice: checked === true }))
              }
            />
            <div className="space-y-2">
              <label htmlFor="hipaa-notice" className="text-sm font-medium leading-none flex items-center gap-2">
                <Shield className="h-4 w-4" />
                HIPAA Compliance & Data Privacy
              </label>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>I acknowledge that:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>No <strong>protected health information (PHI)</strong> should be uploaded to this system</li>
                  <li>All images must be <strong>de-identified</strong> before analysis</li>
                  <li>Patient names, dates, and identifying information must be <strong>removed or obscured</strong></li>
                  <li>This system processes data through <strong>third-party AI services</strong> (Hugging Face, Google)</li>
                  <li>I am responsible for ensuring <strong>HIPAA compliance</strong> in my use of this tool</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Use */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="professional-use"
              checked={consent.professionalUse}
              onCheckedChange={(checked) => 
                setConsent(prev => ({ ...prev, professionalUse: checked === true }))
              }
            />
            <div className="space-y-2">
              <label htmlFor="professional-use" className="text-sm font-medium leading-none flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Professional Use Agreement
              </label>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>I confirm that:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>I am a <strong>qualified healthcare professional</strong> or authorized user</li>
                  <li>I will use this tool for <strong>educational, research, or consultation purposes only</strong></li>
                  <li>I understand the <strong>limitations and risks</strong> of AI-generated medical content</li>
                  <li>I will maintain appropriate <strong>professional standards</strong> and documentation</li>
                  <li>I will <strong>not rely solely</strong> on AI analysis for patient care decisions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="data-retention"
              checked={consent.dataRetention}
              onCheckedChange={(checked) => 
                setConsent(prev => ({ ...prev, dataRetention: checked === true }))
              }
            />
            <div className="space-y-2">
              <label htmlFor="data-retention" className="text-sm font-medium leading-none flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Data Handling & Retention
              </label>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>I understand that:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Uploaded images are processed <strong>temporarily</strong> and not permanently stored</li>
                  <li>AI analysis results may be <strong>cached locally</strong> for performance</li>
                  <li>No personal or identifying information should be included in uploads</li>
                  <li>I can <strong>clear cached data</strong> at any time through browser settings</li>
                  <li>Session data is automatically cleared when the browser is closed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Important Links */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Important Resources
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a 
              href="https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-aiml-enabled-medical-devices"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3" />
              FDA AI/ML Guidance
            </a>
            <a 
              href="https://www.hhs.gov/hipaa/for-professionals/privacy/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Lock className="h-3 w-3" />
              HIPAA Privacy Rule
            </a>
            <a 
              href="https://arxiv.org/abs/2507.05201"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <FileText className="h-3 w-3" />
              MedGemma Technical Report
            </a>
            <a 
              href="https://ai.google.dev/responsible-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Shield className="h-3 w-3" />
              Responsible AI Practices
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {allConsentGiven 
              ? "✅ All acknowledgments completed" 
              : `${Object.values(consent).filter(Boolean).length}/4 acknowledgments completed`
            }
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button 
              onClick={handleAccept} 
              disabled={!allConsentGiven}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Accept & Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Component to check if user has accepted medical disclaimers
 */
export function useRequiredConsent() {
  const [hasConsent, setHasConsent] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConsent = () => {
      const accepted = localStorage.getItem('medgemma-consent-accepted');
      setHasConsent(accepted === 'true');
      setIsChecking(false);
    };

    // Check on mount
    checkConsent();

    // Listen for storage changes (consent given in another tab)
    window.addEventListener('storage', checkConsent);
    return () => window.removeEventListener('storage', checkConsent);
  }, []);

  return { hasConsent, isChecking };
}

/**
 * Higher-order component to wrap AI features with consent requirement
 */
export function withMedicalConsent<T extends object>(
  Component: React.ComponentType<T>
) {
  return function ConsentWrapper(props: T) {
    const { hasConsent, isChecking } = useRequiredConsent();

    if (isChecking) {
      return <div className="animate-pulse">Loading...</div>;
    }

    if (!hasConsent) {
      return (
        <div className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Medical AI consent is required to use this feature.
            </AlertDescription>
          </Alert>
          <MedicalDisclaimer />
        </div>
      );
    }

    return <Component {...props} />;
  };
}