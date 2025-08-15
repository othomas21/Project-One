/**
 * @file page.tsx
 * @description Perplexity-style homepage with centered search interface
 * @module app
 * 
 * Key responsibilities:
 * - Perplexity-style landing page design
 * - Centered search interface with medical branding
 * - Dark theme integration
 * - Professional medical platform introduction
 * 
 * @author Claude Code
 * @created 2025-08-13
 * @modified 2025-08-15 - Added Perplexity-style interface
 */

"use client";

import { useRouter } from 'next/navigation';
import { PerplexitySearch } from '@/components/features/search/perplexity-search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Stethoscope, 
  Shield, 
  FileImage,
  Activity,
  Scan
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    // Navigate to search page with the query
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleModeChange = (mode: 'search' | 'ai' | 'suggestions') => {
    console.log('Mode changed to:', mode);
  };

  return (
    <div className="perplexity-main">
      {/* Main Search Interface */}
      <div className="max-w-4xl mx-auto text-center">
        {/* Medical Badge */}
        <div className="mb-8">
          <Badge variant="outline" className="px-4 py-2 text-sm border-primary/20 text-primary">
            <Stethoscope className="w-4 h-4 mr-2" />
            Professional Medical AI Platform
          </Badge>
        </div>

        {/* Search Interface */}
        <PerplexitySearch
          onSearch={handleSearch}
          onModeChange={handleModeChange}
          className="mb-12"
        />

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Analysis</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Advanced MedGemma AI models provide clinical insights, differential diagnoses, 
              and intelligent medical terminology enhancement.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Scan className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Medical Imaging Search</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Comprehensive DICOM-compatible search across CT, MRI, X-Ray, and ultrasound 
              studies with real-time filtering and analysis.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">HIPAA Compliant</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enterprise-grade security with encrypted data handling, access controls, 
              and comprehensive audit trails for healthcare compliance.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Button 
            onClick={() => router.push('/upload')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3"
          >
            <FileImage className="w-4 h-4 mr-2" />
            Upload Medical Images
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="border-border hover:bg-accent/20 px-6 py-3"
          >
            <Activity className="w-4 h-4 mr-2" />
            View Dashboard
          </Button>
        </div>

        {/* Medical Specialties */}
        <div className="mt-16 pt-8 border-t border-border">
          <h4 className="text-lg font-medium text-white mb-6">Specialized for Medical Professionals</h4>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Radiology', 'Cardiology', 'Neurology', 'Orthopedics', 
              'Oncology', 'Emergency Medicine', 'Pediatrics', 'Women\'s Health'
            ].map((specialty) => (
              <span 
                key={specialty}
                className="perplexity-pill cursor-pointer"
                onClick={() => handleSearch(`${specialty.toLowerCase()} imaging studies`)}
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Professional Notice */}
        <div className="mt-12 p-4 rounded-lg bg-muted/10 border border-border">
          <p className="text-sm text-muted-foreground">
            <Shield className="w-4 h-4 inline mr-2" />
            This platform is designed for healthcare professionals and medical research purposes. 
            Always consult with qualified medical professionals for clinical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}