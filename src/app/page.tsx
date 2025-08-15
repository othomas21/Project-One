/**
 * @file page.tsx
 * @description Curie Radiology AI Clinical Co-Pilot Homepage
 * @module app
 * 
 * Key responsibilities:
 * - Professional clinical co-pilot landing page
 * - Evidence-based medical AI positioning
 * - Clinical workflow integration showcase
 * - Trust and verifiability emphasis
 * 
 * @author Claude Code
 * @created 2025-08-13
 * @modified 2025-08-15 - Transformed to clinical co-pilot platform
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
  Scan,
  BookOpen,
  Users,
  CheckCircle,
  Award,
  Microscope,
  Clipboard,
  TrendingUp
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
        {/* Curie Badge */}
        <div className="mb-8">
          <Badge variant="outline" className="px-4 py-2 text-sm border-primary/20 text-primary">
            <Award className="w-4 h-4 mr-2" />
            Clinical Co-Pilot for Radiology Professionals
          </Badge>
        </div>

        {/* Search Interface */}
        <PerplexitySearch
          onSearch={handleSearch}
          onModeChange={handleModeChange}
          className="mb-12"
        />

        {/* Core Clinical Co-Pilot Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Evidence-Based Trust</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every answer ranked by evidence hierarchy: ACR Guidelines, Landmark Studies, 
              Textbook References. See exactly why you can trust each recommendation.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Clipboard className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Workflow Integration</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              One-click report snippets, ACR protocol selection, and clinical decision 
              support that integrates seamlessly into your radiology workflow.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Microscope className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Visual Comparison</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Side-by-side pathology comparison with annotated differentiating features, 
              atypical presentations, and interactive teaching overlays.
            </p>
          </div>
        </div>

        {/* Clinical Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Button 
            onClick={() => router.push('/search')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3"
          >
            <Brain className="w-4 h-4 mr-2" />
            Start Clinical Query
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="border-border hover:bg-accent/20 px-6 py-3"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Clinical Dashboard
          </Button>
        </div>

        {/* Clinical Specializations */}
        <div className="mt-16 pt-8 border-t border-border">
          <h4 className="text-lg font-medium text-white mb-6">Evidence-Based Clinical Support</h4>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Neuro Radiology', 'Cardiac Imaging', 'Chest Radiology', 'Abdominal Imaging', 
              'MSK Radiology', 'Emergency Radiology', 'Pediatric Imaging', 'Interventional'
            ].map((specialty) => (
              <span 
                key={specialty}
                className="perplexity-pill cursor-pointer"
                onClick={() => handleSearch(`${specialty.toLowerCase()} differential diagnosis`)}
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
            Curie is a clinical co-pilot for radiology professionals. All clinical recommendations 
            are evidence-based but require professional judgment for patient care decisions.
          </p>
        </div>

        {/* Why Curie Beats Generic AI */}
        <div className="mt-16">
          <h4 className="text-xl font-semibold text-white mb-8">Why Curie vs Generic AI?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-6">
              <h5 className="text-lg font-medium text-white flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                What Curie Uniquely Provides
              </h5>
              <div className="space-y-3 text-muted-foreground text-sm">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Evidence hierarchy with ACR guidelines and landmark studies</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clipboard className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>One-click report snippets ready for clinical use</span>
                </div>
                <div className="flex items-start gap-3">
                  <Microscope className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Side-by-side pathology comparison with annotations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>HIPAA-compliant patient-specific clinical queries</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h5 className="text-lg font-medium text-white flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                What Generic AI Cannot Provide
              </h5>
              <div className="space-y-3 text-muted-foreground text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0">•</span>
                  <span>No evidence ranking or medical source verification</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0">•</span>
                  <span>Cannot handle PHI or patient-specific clinical data</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0">•</span>
                  <span>No workflow tools or professional report generation</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0">•</span>
                  <span>Lacks radiology-specific knowledge and accountability</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}