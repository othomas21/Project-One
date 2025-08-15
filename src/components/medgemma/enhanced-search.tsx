/**
 * @file enhanced-search.tsx
 * @description AI-enhanced search component with MedGemma semantic search
 * @module components/medgemma
 * 
 * Key responsibilities:
 * - Primary text search input with AI enhancement
 * - Real-time semantic search using MedGemma
 * - Medical terminology expansion and suggestions
 * - Clinical context and insights display
 * - Integration with existing search functionality
 * 
 * @reftools Verified against: React 18+ patterns, Lucide icons
 * @supabase Enhanced with MedGemma Edge Function integration
 * @author Claude Code
 * @created 2025-08-13
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Brain, Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSearchEnhancement, useClinicalQA } from "@/hooks/use-medgemma";

interface EnhancedSearchProps {
  onSearch: (query: string, enhancedTerms?: string[], insights?: string) => void;
  placeholder?: string;
  autoEnhance?: boolean;
  showEnhancementPanel?: boolean;
  className?: string;
}

export function EnhancedSearch({
  onSearch,
  placeholder = "Search radiology cases with AI assistance...",
  autoEnhance = true,
  showEnhancementPanel = true,
  className = "",
}: EnhancedSearchProps) {
  // Check if AI features are enabled
  const aiEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true';
  
  // Disable auto-enhance if AI is disabled
  const effectiveAutoEnhance = aiEnabled && autoEnhance;
  const [query, setQuery] = useState("");
  const [isEnhancementExpanded, setIsEnhancementExpanded] = useState(false);
  const [clinicalInsights, setClinicalInsights] = useState<string | null>(null);

  const { 
    enhance, 
    enhanceDebounced, 
    data: enhancement, 
    isLoading: isEnhancing, 
    error: enhanceError 
  } = useSearchEnhancement();

  const {
    ask,
    isLoading: isGettingInsights,
    error: insightsError
  } = useClinicalQA();

  // Auto-enhance search when typing stops
  useEffect(() => {
    if (effectiveAutoEnhance && query.trim().length > 2) {
      enhanceDebounced(query, 1000).catch((error) => {
        console.error("Enhancement failed, will use basic search:", error);
        // Don't block the user - they can still search with basic functionality
      });
    }
  }, [query, effectiveAutoEnhance, enhanceDebounced]);

  // Get clinical insights when enhancement is available
  useEffect(() => {
    if (aiEnabled && enhancement && enhancement.medicalTerms.length > 0) {
      const getInsights = async () => {
        try {
          const insight = await ask(
            `What are the key clinical considerations for: ${query}?`,
            "Provide brief imaging considerations, differential diagnoses, and typical findings."
          );
          setClinicalInsights(insight || null);
        } catch (error) {
          console.error("Failed to get clinical insights:", error);
        }
      };

      getInsights();
    }
  }, [aiEnabled, enhancement, query, ask]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;

    const searchTerms = enhancement 
      ? [
          query,
          ...enhancement.medicalTerms,
          ...enhancement.relatedTerms,
          ...enhancement.radiologyTerms,
        ].filter((term, index, arr) => arr.indexOf(term) === index)
      : [query];

    onSearch(query, searchTerms, clinicalInsights || undefined);
  }, [query, enhancement, clinicalInsights, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleEnhanceNow = async () => {
    if (!query.trim() || !aiEnabled) return;
    
    try {
      await enhance(query);
      if (showEnhancementPanel) {
        setIsEnhancementExpanded(true);
      }
    } catch (error) {
      console.error("Enhancement failed:", error);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-20 h-12 text-lg"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          {autoEnhance && isEnhancing && (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
          {!effectiveAutoEnhance && aiEnabled && query.trim().length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEnhanceNow}
              disabled={isEnhancing}
              className="h-8 px-2"
            >
              <Brain className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="h-8 px-3"
          >
            Search
          </Button>
        </div>
      </div>

      {/* AI Status Display */}
      {!aiEnabled && (
        <Alert variant="default" className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            AI enhancement features are currently disabled. Using basic search functionality.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {(enhanceError || insightsError) && (
        <Alert variant="default" className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {enhanceError?.includes('require configuration') || insightsError?.includes('require configuration')
              ? "AI features need setup in Supabase Dashboard. Using basic search for now."
              : enhanceError?.includes('temporarily unavailable') || insightsError?.includes('temporarily unavailable') 
              ? "AI enhancement is temporarily unavailable. You can still search using basic functionality."
              : (enhanceError || insightsError)
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Enhancement Panel */}
      {showEnhancementPanel && (enhancement || isEnhancing) && (
        <Card>
          <Collapsible 
            open={isEnhancementExpanded} 
            onOpenChange={setIsEnhancementExpanded}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Enhancement
                    {isEnhancing && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                  {isEnhancementExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {enhancement && (
                  <>
                    {/* Medical Terms */}
                    {enhancement.medicalTerms.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Medical Terminology</h4>
                        <div className="flex flex-wrap gap-1">
                          {enhancement.medicalTerms.map((term, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {term}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Terms */}
                    {enhancement.relatedTerms.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Related Terms</h4>
                        <div className="flex flex-wrap gap-1">
                          {enhancement.relatedTerms.map((term, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {term}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Radiology Terms */}
                    {enhancement.radiologyTerms.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Radiology Terms</h4>
                        <div className="flex flex-wrap gap-1">
                          {enhancement.radiologyTerms.map((term, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {term}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ICD Codes */}
                    {enhancement.icdCodes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">ICD-10 Codes</h4>
                        <div className="flex flex-wrap gap-1">
                          {enhancement.icdCodes.map((code, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Query */}
                    {enhancement.enhancedQuery && enhancement.enhancedQuery !== enhancement.originalQuery && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Enhanced Search Query</h4>
                        <div className="p-2 bg-muted rounded text-sm">
                          {enhancement.enhancedQuery}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Clinical Insights */}
                {(clinicalInsights || isGettingInsights) && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      Clinical Insights
                      {isGettingInsights && <Loader2 className="h-3 w-3 animate-spin" />}
                    </h4>
                    {clinicalInsights ? (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          {clinicalInsights}
                        </p>
                      </div>
                    ) : (
                      <div className="h-16 bg-muted animate-pulse rounded" />
                    )}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Quick Actions */}
      {enhancement && enhancement.medicalTerms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Quick search:</span>
          {enhancement.medicalTerms.slice(0, 3).map((term, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery(term);
                onSearch(term);
              }}
              className="h-6 px-2 text-xs"
            >
              {term}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}