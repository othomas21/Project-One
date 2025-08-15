/**
 * @file page.tsx
 * @description Perplexity-style AI-Enhanced Medical Search Interface
 * @module app/search
 * 
 * Key responsibilities:
 * - Perplexity-style centered search interface
 * - AI-powered medical imaging search
 * - Real-time clinical insights and MedGemma integration
 * - Dark theme with modern medical workflow design
 * - Responsive search results and image viewing
 * 
 * @reftools Verified against: Next.js 14+ App Router patterns, React 18+ hooks
 * @supabase Enhanced with MedGemma Edge Function integration
 * @author Claude Code
 * @created 2025-08-13
 * @modified 2025-08-15 - Added Perplexity-style interface
 */

"use client";

import { useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/features/auth';
import { PerplexitySearch } from '@/components/features/search/perplexity-search';
import { SearchResultsGrid, MedicalImageViewer } from '@/components/features/search';
import { AIInsightsPanel } from '@/components/medgemma/ai-insights-panel';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Grid, 
  List,
  ScanLine
} from 'lucide-react';

type StudyRow = Database['public']['Tables']['studies']['Row'];

interface SearchResult {
  id: string;
  patientId: string;
  studyDate: string | null;
  modality: string;
  bodyPart: string | null;
  description: string | null;
  status: StudyRow['study_status'];
  imageCount: number;
  patientName: string | null;
  instances?: Array<{
    id: string;
    thumbnail_path: string | null;
    file_path: string | null;
    sop_instance_uid: string;
  }>;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'search' | 'ai' | 'suggestions'>('search');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    
    try {
      const supabase = createClient();
      
      // Enhanced search query with AI terminology
      let dbQuery = supabase
        .from('studies')
        .select(`
          id,
          study_date,
          study_description,
          study_status,
          modalities_in_study,
          number_of_study_related_instances,
          patients!inner (
            id,
            patient_id,
            patient_name
          ),
          series (
            id,
            body_part_examined,
            instances (
              id,
              thumbnail_path,
              file_path,
              sop_instance_uid
            )
          )
        `);

      // Apply search query
      dbQuery = dbQuery.ilike('study_description', `%${query.trim()}%`);

      const { data: studies, error } = await dbQuery
        .order('study_date', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Search error:', error);
        setSearchError(error.message);
        setSearchResults([]);
        return;
      }

      if (!studies) {
        setSearchResults([]);
        return;
      }

      // Transform results
      const transformedResults: SearchResult[] = studies.map(study => {
        const allInstances = study.series?.reduce((acc: any[], series: any) => {
          if (series.instances) {
            return acc.concat(series.instances);
          }
          return acc;
        }, []) || [];

        return {
          id: study.id,
          patientId: study.patients?.patient_id || 'Unknown',
          patientName: study.patients?.patient_name || null,
          studyDate: study.study_date,
          modality: study.modalities_in_study?.[0] || 'Unknown',
          bodyPart: study.series?.[0]?.body_part_examined || null,
          description: study.study_description,
          status: study.study_status,
          imageCount: study.number_of_study_related_instances,
          instances: allInstances
        };
      });

      setSearchResults(transformedResults);
    } catch (error) {
      console.error('Unexpected search error:', error);
      setSearchError('An unexpected error occurred while searching');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    performSearch(query);
  }, []);

  const handleModeChange = useCallback((mode: 'search' | 'ai' | 'suggestions') => {
    setSearchMode(mode);
  }, []);

  const handleImageView = (instanceId: string, result: SearchResult) => {
    setSelectedInstance(instanceId);
    setSelectedStudy(result);
  };

  const handleCloseViewer = () => {
    setSelectedInstance(null);
    setSelectedStudy(null);
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Result clicked:', result);
  };

  return (
    <ProtectedRoute>
      <div className="perplexity-main">
        {/* Search Interface - Always Centered */}
        {!hasSearched && (
          <PerplexitySearch
            onSearch={handleSearch}
            onModeChange={handleModeChange}
            className="w-full"
          />
        )}

        {/* Search Results Layout */}
        {hasSearched && (
          <div className="w-full max-w-7xl mx-auto">
            {/* Compact Search Bar */}
            <div className="mb-8">
              <div className="perplexity-search max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  placeholder="Ask about medical imaging, diagnostics, or clinical cases..."
                  className="perplexity-search input"
                />
                <Button
                  onClick={() => handleSearch(searchQuery)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ScanLine className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* AI Mode Indicator */}
            {searchMode === 'ai' && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">AI Analysis Mode Active</span>
                <Badge variant="outline" className="text-xs">
                  Enhanced Medical Search
                </Badge>
              </div>
            )}

            {/* Search Status and Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {isSearching ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ScanLine className="w-4 h-4 animate-pulse" />
                    <span>Searching medical database...</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Found {searchResults.length} medical studies
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>
            </div>

            {/* Results Layout with AI Panel */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* AI Insights Panel */}
              <div className="xl:col-span-1 order-last xl:order-first">
                <div className="sticky top-6">
                  <AIInsightsPanel
                    searchQuery={searchQuery}
                    searchResults={searchResults}
                    selectedCaseId={selectedStudy?.id}
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="xl:col-span-3">
                <SearchResultsGrid
                  results={searchResults}
                  loading={isSearching}
                  error={searchError}
                  onResultClick={handleResultClick}
                  onImageView={handleImageView}
                />
              </div>
            </div>
          </div>
        )}

        {/* Medical Image Viewer */}
        {selectedInstance && selectedStudy && (
          <MedicalImageViewer
            instanceId={selectedInstance}
            studyInfo={{
              id: selectedStudy.id,
              patientId: selectedStudy.patientId,
              studyDate: selectedStudy.studyDate,
              modality: selectedStudy.modality,
              bodyPart: selectedStudy.bodyPart,
              description: selectedStudy.description,
              patientName: selectedStudy.patientName
            }}
            isOpen={!!selectedInstance}
            onClose={handleCloseViewer}
            hasNext={false}
            hasPrevious={false}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}