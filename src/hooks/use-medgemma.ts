/**
 * @file use-medgemma.ts
 * @description React hooks for MedGemma AI integration with caching and error handling
 * @module hooks
 * 
 * Key responsibilities:
 * - Medical text analysis with MedGemma
 * - Semantic search enhancement for medical terms
 * - Clinical question answering
 * - Image analysis integration
 * - Request caching and debouncing
 * 
 * @reftools Verified against: React 18+ hooks patterns, Supabase Edge Functions
 * @author Claude Code
 * @created 2025-08-13
 */

import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

// Types for MedGemma API
interface MedGemmaRequest {
  type: 'text_analysis' | 'image_analysis' | 'search_enhancement' | 'clinical_qa';
  input: string;
  imageData?: string;
  context?: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: 'medgemma-4b-it' | 'medgemma-27b-text-it';
  };
}

interface MedGemmaResponse {
  success: boolean;
  result?: string;
  error?: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
}

// Enhanced search results
interface SearchEnhancement {
  originalQuery: string;
  medicalTerms: string[];
  relatedTerms: string[];
  icdCodes: string[];
  radiologyTerms: string[];
  enhancedQuery: string;
}

// Cache for API responses (5 minute TTL)
const responseCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Base hook for MedGemma API calls with caching
 */
function useMedGemmaBase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const callMedGemma = useCallback(async (request: MedGemmaRequest): Promise<MedGemmaResponse> => {
    // Create cache key
    const cacheKey = JSON.stringify(request);
    
    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('medgemma-analysis', {
        body: request,
      });

      if (functionError) {
        // Check if this is a "function not found" error (Edge Function not deployed)
        if (functionError.message?.includes('not found') || functionError.message?.includes('404')) {
          throw new Error('AI features temporarily unavailable - using basic search');
        }
        throw new Error(functionError.message);
      }

      if (!data || !data.success) {
        // Check for specific API key error
        if (data?.error?.includes('HUGGING_FACE_API_KEY')) {
          throw new Error('AI features require configuration - using basic search');
        }
        throw new Error(data?.error || 'MedGemma analysis failed');
      }

      // Cache successful response
      responseCache.set(cacheKey, {
        data,
        expiry: Date.now() + CACHE_TTL,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  return { callMedGemma, isLoading, error };
}

/**
 * Hook for medical text analysis
 */
export function useMedicalTextAnalysis() {
  const { callMedGemma, isLoading, error } = useMedGemmaBase();
  const [data, setData] = useState<string | null>(null);

  const analyze = useCallback(async (
    text: string, 
    context?: string,
    options?: MedGemmaRequest['options']
  ) => {
    // Check if AI features are enabled
    if (process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES !== 'true') {
      throw new Error('AI features are disabled');
    }

    try {
      const response = await callMedGemma({
        type: 'text_analysis',
        input: text,
        context,
        options,
      });

      setData(response.result || null);
      return response.result;
    } catch (err) {
      setData(null);
      throw err;
    }
  }, [callMedGemma]);

  return { analyze, data, isLoading, error };
}

/**
 * Hook for semantic search enhancement
 */
export function useSearchEnhancement() {
  const { callMedGemma, isLoading, error } = useMedGemmaBase();
  const [data, setData] = useState<SearchEnhancement | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const enhance = useCallback(async (
    query: string,
    options?: MedGemmaRequest['options']
  ) => {
    // Check if AI features are enabled
    if (process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES !== 'true') {
      throw new Error('AI features are disabled');
    }

    try {
      const response = await callMedGemma({
        type: 'search_enhancement',
        input: query,
        options: {
          maxTokens: 256,
          temperature: 0.3,
          ...options,
        },
      });

      // Parse the enhanced search response
      const result = response.result || '';
      const enhancement = parseSearchEnhancement(query, result);
      setData(enhancement);
      return enhancement;
    } catch (err) {
      setData(null);
      throw err;
    }
  }, [callMedGemma]);

  const enhanceDebounced = useCallback((
    query: string,
    delay: number = 1000,
    options?: MedGemmaRequest['options']
  ) => {
    return new Promise<SearchEnhancement>((resolve, reject) => {
      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new timeout
      debounceRef.current = setTimeout(async () => {
        try {
          const result = await enhance(query, options);
          resolve(result!);
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  }, [enhance]);

  return { enhance, enhanceDebounced, data, isLoading, error };
}

/**
 * Hook for clinical question answering
 */
export function useClinicalQA() {
  const { callMedGemma, isLoading, error } = useMedGemmaBase();
  const [data, setData] = useState<string | null>(null);

  const ask = useCallback(async (
    question: string,
    context?: string,
    options?: MedGemmaRequest['options']
  ) => {
    // Check if AI features are enabled
    if (process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES !== 'true') {
      throw new Error('AI features are disabled');
    }

    try {
      const response = await callMedGemma({
        type: 'clinical_qa',
        input: question,
        context,
        options,
      });

      setData(response.result || null);
      return response.result;
    } catch (err) {
      setData(null);
      throw err;
    }
  }, [callMedGemma]);

  return { ask, data, isLoading, error };
}

/**
 * Hook for radiology image analysis
 */
export function useRadiologyImageAnalysis() {
  const { callMedGemma, isLoading, error } = useMedGemmaBase();
  const [data, setData] = useState<string | null>(null);

  const analyze = useCallback(async (
    findings: string,
    imageBase64?: string,
    context?: string,
    options?: MedGemmaRequest['options']
  ) => {
    // Check if AI features are enabled
    if (process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES !== 'true') {
      throw new Error('AI features are disabled');
    }

    try {
      const response = await callMedGemma({
        type: 'image_analysis',
        input: findings,
        imageData: imageBase64,
        context,
        options,
      });

      setData(response.result || null);
      return response.result;
    } catch (err) {
      setData(null);
      throw err;
    }
  }, [callMedGemma]);

  return { analyze, data, isLoading, error };
}

/**
 * Parse search enhancement response into structured data
 */
function parseSearchEnhancement(originalQuery: string, result: string): SearchEnhancement {
  const lines = result.split('\n').filter(line => line.trim());
  
  const enhancement: SearchEnhancement = {
    originalQuery,
    medicalTerms: [],
    relatedTerms: [],
    icdCodes: [],
    radiologyTerms: [],
    enhancedQuery: originalQuery,
  };

  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.toLowerCase().includes('medical terminology')) {
      currentSection = 'medical';
    } else if (trimmed.toLowerCase().includes('related terms')) {
      currentSection = 'related';
    } else if (trimmed.toLowerCase().includes('icd')) {
      currentSection = 'icd';
    } else if (trimmed.toLowerCase().includes('radiology')) {
      currentSection = 'radiology';
    } else if (trimmed.toLowerCase().includes('enhanced query')) {
      currentSection = 'enhanced';
    } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed)) {
      // Extract term from bullet point or numbered list
      const term = trimmed.replace(/^[-•\d.\s]+/, '').trim();
      
      switch (currentSection) {
        case 'medical':
          enhancement.medicalTerms.push(term);
          break;
        case 'related':
          enhancement.relatedTerms.push(term);
          break;
        case 'icd':
          enhancement.icdCodes.push(term);
          break;
        case 'radiology':
          enhancement.radiologyTerms.push(term);
          break;
      }
    } else if (currentSection === 'enhanced' && trimmed.length > 3) {
      enhancement.enhancedQuery = trimmed;
    }
  }

  return enhancement;
}

/**
 * Combined hook for comprehensive medical search
 */
export function useMedicalSearch() {
  const { enhance: enhanceSearch, isLoading: isEnhancing, error: enhanceError } = useSearchEnhancement();
  const { ask: askClinical, isLoading: isAnswering, error: qaError } = useClinicalQA();

  const performMedicalSearch = useCallback(async (query: string) => {
    try {
      // Enhance the search query with medical terms
      const enhancement = await enhanceSearch(query);
      
      // Generate clinical insights about the query
      const insights = await askClinical(
        `What clinical insights can you provide about: ${query}?`,
        'Provide a brief overview of key clinical considerations, differential diagnoses, and imaging modalities typically used.'
      );

      return {
        enhancement,
        insights,
        searchTerms: [
          query,
          ...(enhancement?.medicalTerms || []),
          ...(enhancement?.relatedTerms || []),
          ...(enhancement?.radiologyTerms || []),
        ].filter((term, index, arr) => arr.indexOf(term) === index), // Remove duplicates
      };
    } catch (err) {
      throw err;
    }
  }, [enhanceSearch, askClinical]);

  return {
    performMedicalSearch,
    isLoading: isEnhancing || isAnswering,
    error: enhanceError || qaError,
  };
}